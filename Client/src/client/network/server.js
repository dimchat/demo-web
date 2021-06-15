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

//! require 'fsm.js'

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;
    var Envelope = sdk.protocol.Envelope;
    var InstantMessage = sdk.protocol.InstantMessage;
    var HandshakeCommand = sdk.protocol.HandshakeCommand;
    var HandshakeState = sdk.protocol.HandshakeState;

    var NotificationCenter = sdk.lnc.NotificationCenter;
    var StateMachineDelegate = sdk.fsm.Delegate;

    var Ship = sdk.startrek.Ship;
    var Gate = sdk.startrek.Gate;
    var StarShip = sdk.startrek.StarShip;

    var Station = sdk.Station;
    var MessengerDelegate = sdk.MessengerDelegate;
    var MessageTransmitter = sdk.MessageTransmitter;

    var ServerState = ns.network.ServerState;
    var StateMachine = ns.network.StateMachine;

    var get_facebook = function () {
        return ns.Facebook.getInstance();
    };
    var get_messenger = function () {
        return ns.Messenger.getInstance();
    };

    /**
     *  DIM Station
     */
    var Server = function(identifier, host, port) {
        Station.call(this, identifier, host, port);
        this.__delegate = null; // StationDelegate
        // connection state machine
        this.__fsm = new StateMachine(this);
        this.__fsm.start();

        this.__session = new ns.network.Session(host, port, get_messenger());
        this.__sessionKey = null; // session key

        this.__paused = false;
        this.__currentUser = null; // User
    };
    sdk.Class(Server, Station, [MessengerDelegate, StateMachineDelegate]);

    Server.prototype.getDelegate = function () {
        return this.__delegate;
    };
    Server.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate;
    };

    Server.prototype.getCurrentUser = function () {
        return this.__currentUser;
    };
    Server.prototype.setCurrentUser = function (user) {
        if (user.equals(this.__currentUser)) {
            return ;
        }
        this.__currentUser = user;
        // switch state for re-login
        this.__fsm.setSessionKey(null);
    };

    Server.prototype.getCurrentState = function () {
        return this.__fsm.getCurrentState();
    };

    Server.prototype.getStatus = function () {
        return this.__session.gate.getStatus();
    };

    var pack = function (cmd) {
        if (!this.__currentUser) {
            throw new Error('current user not set');
        }
        var sender = this.__currentUser.identifier;
        var receiver = this.identifier;
        var facebook = get_facebook();
        if (!facebook.getPublicKeyForEncryption(receiver)) {
            cmd.setGroup(ID.EVERYONE);
        }
        var messenger = get_messenger();
        var env = Envelope.create(sender, receiver, null);
        var iMsg = InstantMessage.create(env, cmd);
        var sMsg = messenger.encryptMessage(iMsg);
        if (!sMsg) {
            throw new EvalError('failed to encrypt message: ' + iMsg.getMap());
        }
        var rMsg = messenger.signMessage(sMsg);
        if (!rMsg) {
            throw new EvalError('failed to sign message: ' + sMsg.getMap());
        }
        return rMsg;
    };

    //
    //  Urgent command for connection
    //

    var set_last_time = function (cmd) {
        // TODO: set last received message time
    };

    Server.prototype.handshake = function (newSessionKey) {
        if (!this.__currentUser) {
            // current user not set yet
            return;
        }
        // check FSM state == 'Handshaking'
        var state = this.getCurrentState();
        if (!state.equals(ServerState.CONNECTED) && !state.equals(ServerState.HANDSHAKING)) {
            // FIXME: sometimes the connection state will be reset
            console.log('server state not handshaking', state);
            return;
        }
        // check connection state == 'Connected'
        var status = this.getStatus();
        if (!status.equals(Gate.Status.CONNECTED)) {
            // FIXME: sometimes the connection will be lost while handshaking
            console.log('server not connected');
            return;
        }
        if (newSessionKey) {
            this.__sessionKey = newSessionKey;
        }
        this.__fsm.setSessionKey(null);

        // create handshake command
        var cmd = new HandshakeCommand(null, this.__sessionKey);
        set_last_time.call(this, cmd);
        var rMsg = pack.call(this, cmd);
        // first handshake?
        if (cmd.getState().equals(HandshakeState.START)) {
            // [Meta/Visa protocol]
            var meta = this.__currentUser.getMeta();
            var visa = this.__currentUser.getVisa();
            rMsg.setMeta(meta);
            rMsg.setVisa(visa);
        }
        // send out directly
        var data = get_messenger().serializeMessage(rMsg);
        // Urgent command
        this.__session.sendPayload(data, StarShip.URGENT, null);
    };

    Server.prototype.handshakeAccepted = function () {
        // check FSM state == 'Handshaking'
        var state = this.getCurrentState();
        if (!state.equals(ServerState.HANDSHAKING)) {
            // FIXME: sometime the connection state will be reset
            console.log('server state not handshaking', state);
        }
        console.log('handshake accepted for user', this.__currentUser);

        this.__fsm.setSessionKey(this.__sessionKey);

        // call client
        this.getDelegate().onHandshakeAccepted(this.__sessionKey, this);
    };

    //
    //  Entrance
    //

    Server.prototype.start = function () {
        get_messenger().setDelegate(this);

        if (!this.__session.isRunning()) {
            // TODO: post notification 'StationConnecting'
            this.__session.start();
        }

        // TODO: let the subclass to create StarGate?
    };
    Server.prototype.end = function () {
        if (this.__session.isRunning()) {
            this.__session.close();
        }
        this.__fsm.stop();
    };

    Server.prototype.pause = function () {
        if (this.__paused) {
        } else {
            this.__fsm.pause();
            this.__paused = true;
        }
    };
    Server.prototype.resume = function () {
        if (this.__paused) {
            this.__fsm.resume();
            this.__paused = false;
        }
    };

    //
    //  MessengerDelegate
    //

    Server.prototype.sendPackage = function(data, handler, priority) {
        var delegate = null;
        if (handler instanceof MessageTransmitter.CompletionHandler) {
            var callback = handler.callback;
            if (sdk.Interface.conforms(callback, Ship.Delegate)) {
                delegate = callback;
            }
        }
        if (this.__session.sendPayload(data, priority, delegate)) {
            if (handler) {
                handler.onSuccess();
            }
            return true;
        } else {
            if (handler) {
                handler.onFailed(new Error('failed to send data package'));
            }
            return false;
        }
    };

    Server.prototype.uploadData = function (data, iMsg) {
        var sender = iMsg.getSender();
        var content = iMsg.getContent();
        var filename = content.getFilename();
        var ftp = ns.network.FtpServer;
        return ftp.uploadEncryptedData(data, filename, sender);
    };

    Server.prototype.downloadData = function (url, iMsg) {
        var ftp = ns.network.FtpServer;
        return ftp.downloadEncryptedData(url);
    };

    //
    //  StateMachine Delegate
    //

    Server.prototype.enterState = function (state, machine) {
        var info = {
            'state': state.name
        };
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationServerStateChanged, this, info);

        if (state.equals(ServerState.HANDSHAKING)) {
            // start handshake
            var session = this.session;
            this.session = null;
            this.handshake(session);
        } else if (state.equals(ServerState.RUNNING)) {
            // TODO: send all packages waiting
        } else if (state.equals(ServerState.ERROR)) {
            console.error('Station connection error!');
            nc.postNotification(ns.kNotificationStationError, this, null);
        }
    };
    Server.prototype.exitState = function (state, machine) {
    };
    Server.prototype.pauseState = function (state, machine) {
    };
    Server.prototype.resumeState = function (state, machine) {
    };

    //-------- namespace --------
    ns.network.Server = Server;

    ns.network.registers('Server');

})(SECHAT, DIMSDK);
