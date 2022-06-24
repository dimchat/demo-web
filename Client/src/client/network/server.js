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
//! require 'session.js'

(function (ns, sdk) {
    'use strict';

    var ServerDelegate = function () {};
    sdk.Interface(ServerDelegate, null);

    /**
     *  Callback for handshake accepted
     *
     * @param {String} session - new session key
     * @param {Station} server - current station
     */
    ServerDelegate.prototype.onHandshakeAccepted = function (session, server) {
        console.assert(false, 'implement me!');
    };

    //-------- namespace --------
    ns.network.ServerDelegate = ServerDelegate;

    ns.network.registers('ServerDelegate');

})(SECHAT, DIMSDK);

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;
    var Envelope = sdk.protocol.Envelope;
    var InstantMessage = sdk.protocol.InstantMessage;
    var HandshakeCommand = sdk.protocol.HandshakeCommand;
    var HandshakeState = sdk.protocol.HandshakeState;

    var NotificationCenter = sdk.lnc.NotificationCenter;
    var StateMachineDelegate = sdk.fsm.Delegate;

    var DockerStatus = sdk.startrek.port.DockerStatus;
    var Departure = sdk.startrek.port.Departure;

    var Station = sdk.mkm.Station;

    var Transmitter = ns.network.Transmitter;
    var ServerState = ns.network.ServerState;
    var StateMachine = ns.network.StateMachine;
    var MessengerDelegate = ns.MessengerDelegate;

    var get_facebook = function () {
        return ns.ClientFacebook.getInstance();
    };
    var get_messenger = function () {
        return ns.ClientMessenger.getInstance();
    };

    /**
     *  DIM Station
     */
    var Server = function(identifier, host, port, name) {
        Station.call(this, identifier, host, port);
        this.__delegate = null; // ServerDelegate
        // connection state machine
        this.__fsm = new StateMachine(this);
        this.__fsm.start();

        this.__name = name ? name : identifier.getName();

        this.__session = new ns.network.Session(host, port, get_messenger());
        this.__sessionKey = null; // session key

        this.__paused = false;
        this.__currentUser = null; // User
    };
    sdk.Class(Server, Station, [Transmitter, MessengerDelegate, StateMachineDelegate], null);

    Server.prototype.getName = function () {
        return this.__name;
    };

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
        var state = this.__fsm.getCurrentState();
        if (!state) {
            state = this.__fsm.getDefaultState();
        }
        return state;
    };

    Server.prototype.getStatus = function () {
        return this.__session.getStatus();
    };

    var pack = function (cmd) {
        var currentUser = this.__currentUser;
        if (!currentUser) {
            throw new Error('current user not set');
        }
        var messenger = get_messenger();
        var facebook = get_facebook();
        var receiver = this.getIdentifier();
        if (!facebook.getPublicKeyForEncryption(receiver)) {
            cmd.setGroup(ID.EVERYONE);
        }
        var sender = currentUser.getIdentifier();
        var env = Envelope.create(sender, receiver, null);
        var iMsg = InstantMessage.create(env, cmd);
        var sMsg = messenger.encryptMessage(iMsg);
        if (!sMsg) {
            throw new EvalError('failed to encrypt message: ' + iMsg.toMap());
        }
        var rMsg = messenger.signMessage(sMsg);
        if (!rMsg) {
            throw new EvalError('failed to sign message: ' + sMsg.toMap());
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
        var currentUser = this.__currentUser;
        if (!currentUser) {
            // current user not set yet
            return;
        }
        // check FSM state == 'Handshaking'
        var state = this.getCurrentState();
        if (!state.equals(ServerState.HANDSHAKING) &&
            !state.equals(ServerState.CONNECTED) &&
            !state.equals(ServerState.RUNNING)) {
            // FIXME: sometimes the connection state will be reset
            console.log('server state not handshaking', state);
            return;
        }
        // check connection state == 'Connected'
        var status = this.getStatus();
        if (!DockerStatus.READY.equals(status)) {
            // FIXME: sometimes the connection will be lost while handshaking
            console.log('server not connected');
            return;
        }
        if (newSessionKey) {
            this.__sessionKey = newSessionKey;
        }
        this.__fsm.setSessionKey(null);

        // create handshake command
        var cmd = HandshakeCommand.restart(this.__sessionKey);
        set_last_time.call(this, cmd);
        var rMsg = pack.call(this, cmd);
        // first handshake?
        if (cmd.getState().equals(HandshakeState.START)) {
            // [Meta/Visa protocol]
            var meta = currentUser.getMeta();
            var visa = currentUser.getVisa();
            rMsg.setMeta(meta);
            rMsg.setVisa(visa);
        }
        // send out directly
        var data = get_messenger().serializeMessage(rMsg);
        // Urgent command
        this.__session.sendData(data, Departure.URGENT.valueOf());
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
        var client = this.getDelegate();
        client.onHandshakeAccepted(this.__sessionKey, this);
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

    // Override
    Server.prototype.sendContent = function (sender, receiver, content, priority) {
        return this.__session.sendContent(sender, receiver, content, priority);
    };

    // Override
    Server.prototype.sendInstantMessage = function (iMsg, priority) {
        return this.__session.sendInstantMessage(iMsg, priority);
    };

    // Override
    Server.prototype.sendReliableMessage = function (rMsg, priority) {
        return this.__session.sendReliableMessage(rMsg, priority);
    };

    // Override
    Server.prototype.uploadData = function (data, iMsg) {
        var sender = iMsg.getSender();
        var content = iMsg.getContent();
        var filename = content.getFilename();
        var ftp = ns.network.FtpServer;
        return ftp.uploadEncryptedData(data, filename, sender);
    };

    // Override
    Server.prototype.downloadData = function (url, iMsg) {
        var ftp = ns.network.FtpServer;
        return ftp.downloadEncryptedData(url);
    };

    //
    //  StateMachine Delegate
    //

    Server.prototype.enterState = function (next, machine) {
        // call before state changed
    };
    Server.prototype.exitState = function (previous, machine) {
        // called after state changed
        var current = machine.getCurrentState();
        console.info('server state changed:', previous, current);
        if (!current) {
            return;
        }
        var stateName = current.name;
        var info = {
            'state': stateName
        };
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationServerStateChanged, this, info);

        if (stateName === ServerState.HANDSHAKING) {
            // start handshake
            this.handshake(null);
        } else if (stateName === ServerState.RUNNING) {
            // TODO: send all packages waiting
        } else if (stateName === ServerState.ERROR) {
            console.error('Station connection error!');
            // TODO: reconnect?
        }
    };
    Server.prototype.pauseState = function (current, machine) {
        // TODO: reuse session key?
    };
    Server.prototype.resumeState = function (current, machine) {
        var stateName = current.toString();
        if (stateName === ServerState.RUNNING) {
            // switch state for re-login
            this.__fsm.setSessionKey(null);
        }
    };

    //-------- namespace --------
    ns.network.Server = Server;

    ns.network.registers('Server');

})(SECHAT, DIMSDK);
