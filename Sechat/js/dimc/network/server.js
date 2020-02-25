;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
//
//                               Written in 2020 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2020 Albert Moky
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// =============================================================================
//

//! require <dimsdk.js>
//! require 'fsm.js'
//! require 'request.js'
//! require 'delegate.js'

!function (ns) {
    'use strict';

    var Envelope = ns.Envelope;
    var InstantMessage = ns.InstantMessage;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var HandshakeState = ns.protocol.HandshakeState;

    var Station = ns.Station;

    var MessengerDelegate = ns.MessengerDelegate;

    var StateDelegate = ns.fsm.StateDelegate;
    var StateMachine = ns.network.StateMachine;

    var NotificationCenter = ns.stargate.NotificationCenter;

    var StarStatus = ns.stargate.StarStatus;
    var StarDelegate = ns.stargate.StarDelegate;
    var SocketClient = ns.stargate.extensions.SocketClient;

    var RequestWrapper = ns.network.RequestWrapper;

    /**
     *  DIM Station
     */
    var Server = function(identifier, host, port) {
        Station.call(this, identifier, host, port);

        var fsm = new StateMachine();
        fsm.server = this;
        fsm.delegate = this;
        fsm.start();

        this.fsm = fsm;
        this.star = null; // Star
        this.stationDelegate = null; // StationDelegate
        this.messenger = null; // ConnectionDelegate

        this.session = null; // session key
        this.currentUser = null; // User

        this.waitingList = []; // RequestWrapper
        this.sendingTable = {}; // String -> RequestWrapper
    };
    ns.Class(Server, Station, MessengerDelegate, StarDelegate, StateDelegate);

    Server.prototype.getCurrentUser = function () {
        return this.currentUser;
    };
    Server.prototype.setCurrentUser = function (user) {
        if (user.equals(this.currentUser)) {
            return ;
        }
        this.currentUser = user;
        // switch state for re-login
        this.session = null;
    };

    Server.prototype.getCurrentState = function () {
        return this.fsm.currentState;
    };

    Server.prototype.getStatus = function () {
        return this.star.getStatus();
    };

    Server.prototype.send = function (data, delegate) {
        if (!delegate) {
            delegate = this;
        }
        var str = new ns.type.String(data, 'UTF-8');
        this.star.send(str.toString(), delegate);
    };

    //
    //  urgent command for connection
    //
    Server.prototype.handshake = function (session) {
        // check FSM state == 'Handshaking'
        var state = this.getCurrentState();
        if (!state.equals(StateMachine.handshakingState)) {
            // FIXME: sometimes the connection state will be reset
            console.log('server state error: ' + state);
            return;
        }
        // check connection status == 'Connected'
        if (!this.getStatus().equals(StarStatus.Connected)) {
            // FIXME: sometimes the connection will be lost while handshaking
            console.log('server state error: ' + state);
            return;
        }
        var user = this.getCurrentUser();
        // create handshake command
        var cmd = HandshakeCommand.restart(session);
        var env = Envelope.newEnvelope(user.identifier, this.identifier, 0);
        var iMsg = InstantMessage.newMessage(cmd, env);
        var sMsg = this.messenger.encryptMessage(iMsg);
        var rMsg = this.messenger.signMessage(sMsg);
        if (!rMsg) {
            throw Error('failed to encrypt and sign message: ' + iMsg);
        }
        // first handshake?
        if (cmd.getState().equals(HandshakeState.START)) {
            // [Meta protocol]
            rMsg.setMeta(user.getMeta());
        }
        // send out directly
        var data = this.messenger.serializeMessage(rMsg);
        this.send(data);
    };

    Server.prototype.handshakeAccepted = function (session, success) {
        // check FSM state == 'Handshaking'
        var state = this.getCurrentState();
        if (!state.equals(StateMachine.handshakingState)) {
            // FIXME: sometimes the connection state will be reset
            console.log('server state error: ' + state);
            // return;
        }
        if (success) {
            console.log('handshake accepted for user: ' + this.getCurrentUser());
            this.session = session;
            // TODO: broadcast profile to DIM network
            var nc = NotificationCenter.getInstance();
            nc.postNotification(nc.kNotificationHandshakeAccepted,
                this, {session: session});
        } else {
            console.log('handshake again with session: ' + session);
        }
    };

    Server.prototype.connect = function (host, port) {
        this.fsm.changeState(this.fsm.defaultStateName);
        if (this.getStatus().equals(StarStatus.Connected) &&
            host === this.host &&
            port === this.port) {
            console.log('already connected to ' + host + ':' + port);
            return;
        }

        var nc = NotificationCenter.getInstance();
        nc.postNotification(nc.kNotificationStationConnecting, this, {
            'host': host,
            'port': port
        });

        this.star.connect(host, port);

        this.host = host;
        this.port = port;
    };

    Server.prototype.start = function (options) {
        this.messenger.delegate = this;

        if (options) {
            if (options['host']) {
                this.host = options['host'];
            } else {
                options['host'] = this.host;
            }
            if (options['port']) {
                this.port = options['port'];
            } else {
                options['port'] = this.port;
            }
        } else {
            options = {
                'host': this.host,
                'port': this.port
            };
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(nc.kNotificationStationConnecting, this, options);

        if (!this.star) {
            var socket = new SocketClient(this);
            var onConnected = socket.onConnected;
            socket.onConnected = function () {
                onConnected.call(this);
                var nc = NotificationCenter.getInstance();
                nc.postNotification(nc.kNotificationStationConnected, this, options);
            };
            this.star = socket;
        }
        this.star.launch(options);

        // TODO: let the subclass to create StarGate
    };
    Server.prototype.stop = function () {
        this.star.terminate();
        this.fsm.stop();
    };

    Server.prototype.pause = function () {
        this.star.pause();
        this.fsm.pause();
    };
    Server.prototype.resume = function () {
        this.star.resume();
        this.fsm.resume();
    };

    //
    //  StarDelegate
    //

    Server.prototype.onReceived = function (data, star) {
        if (!data || data.length === 0) {
            return;
        }
        var response = this.messenger.onReceivePackage(data);
        if (response) {
            this.send(response);
        }
    };

    Server.prototype.onStatusChanged = function (status, star) {
        this.fsm.tick();
    };

    Server.prototype.onSent = function (data, error, star) {
        // TODO: remove from sending list

        if (error) {
            // failed
            this.stationDelegate.didFailToSendPackage(error, data, this);
        } else {
            // success
            this.stationDelegate.didSendPackage(data, this);
        }

        // TODO: tell the handler to do the resending if failed
    };

    //
    //  MessengerDelegate
    //

    Server.prototype.sendPackage = function (data, handler) {
        var wrapper = new RequestWrapper(data, handler);

        var state = this.getCurrentState();
        if (!state.equals(StateMachine.runningState)) {
            this.waitingList.push(wrapper);
            return true;
        }

        this.send(data);

        if (handler) {
            var key = RequestWrapper.getKey(data);
            this.sendingTable[key] = wrapper;
        }

        return true;
    };

    Server.prototype.uploadData = function (data, msg) {
        // TODO: upload onto FTP server
        return null;
    };

    Server.prototype.downloadData = function (url, msg) {
        // TODO: download from FTP server
        return null;
    };

    //
    //  StateDelegate
    //

    var carry_on = function () {
        var state;
        var wrapper;
        while (this.waitingList.length > 0) {
            wrapper = this.waitingList.shift();
            state = this.getCurrentState();
            if (state.equals(StateMachine.runningState)) {
                this.sendPackage(wrapper.data, wrapper.handler);
            } else {
                console.log('connection lost, waiting task(s) interrupted');
                this.waitingList.unshift(wrapper);
                break;
            }
        }
    };

    Server.prototype.enterState = function (state, machine) {
        if (state.equals(StateMachine.defaultState)) {
            //
        } else if (state.equals(StateMachine.connectingState)) {
            //
        } else if (state.equals(StateMachine.connectedState)) {
            //
        } else if (state.equals(StateMachine.handshakingState)) {
            // start handshake
            var session = this.session;
            this.session = null;
            this.handshake(session);
        } else if (state.equals(StateMachine.runningState)) {
            // TODO: send all packages waiting
            var srv = this;
            setTimeout(function () {
                carry_on.call(srv);
            }, 1000);
        } else if (state.equals(StateMachine.errorState)) {
            console.log('Station connection error!');
            var nc = NotificationCenter.getInstance();
            nc.postNotification(nc.kNotificationStationError, this, null);
        } else if (state.equals(StateMachine.stoppedState)) {
            console.log('Station stop.');
        }
    };
    Server.prototype.exitState = function (state, machine) {
    };
    Server.prototype.pauseState = function (state, machine) {
    };
    Server.prototype.resumeState = function (state, machine) {
    };

    //-------- namespace --------
    if (typeof ns.network !== 'object') {
        ns.network = {};
    }
    ns.network.Server = Server;

}(DIMP);
