;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

//! require 'wrapper.js'
//! require 'queue.js'

(function (ns, sdk) {
    'use strict';

    var Transmitter = function () {};
    sdk.Interface(Transmitter, null);

    /**
     *  Send content from sender to receiver with priority
     *
     * @param {ID} sender
     * @param {ID} receiver
     * @param {Content} content
     * @param {int} priority
     * @return {boolean} false on error
     */
    Transmitter.prototype.sendContent = function (sender, receiver, content, priority) {
        ns.assert(false, "implement me!");
        return false;
    };

    Transmitter.prototype.sendInstantMessage = function (iMsg, priority) {
        ns.assert(false, "implement me!");
        return false;
    };

    Transmitter.prototype.sendReliableMessage = function (rMsg, priority) {
        ns.assert(false, "implement me!");
        return false;
    };

    //-------- namespace --------
    ns.network.Transmitter = Transmitter;

    ns.network.registers('Transmitter');

})(SECHAT, DIMSDK);

(function (ns, sdk) {
    'use strict';

    var Runner = sdk.skywalker.Runner;
    var InetSocketAddress = sdk.startrek.type.InetSocketAddress;
    var DockerStatus = sdk.startrek.port.DockerStatus;
    var PlainDeparture = sdk.startrek.PlainDeparture;
    var Envelope = sdk.protocol.Envelope;
    var InstantMessage = sdk.protocol.InstantMessage;
    var MessageQueue = ns.network.MessageQueue;
    var Transmitter = ns.network.Transmitter;

    /**
     *  Gate Keeper
     *
     * @param {String} host             - remote host
     * @param {uint} port               - remote port
     * @param {DockerDelegate} delegate - delegate for docker events
     * @param {Messenger} transceiver   - messenger
     */
    var GateKeeper = function (host, port, delegate, transceiver) {
        Runner.call(this);
        this.__remote = new InetSocketAddress(host, port);
        this.__gate = this.createGate(host, port, delegate);
        this.__messenger = transceiver;
        this.__queue = new MessageQueue();
        this.__active = false; // session status
    };
    sdk.Class(GateKeeper, Runner, [Transmitter], null);

    // protected
    GateKeeper.prototype.createGate = function (host, port, delegate) {
        ns.assert(false, "implement me!");
        return null;
    };

    GateKeeper.prototype.isActive = function () {
        return this.__active;
    };
    GateKeeper.prototype.setActive = function (active) {
        this.__active = active;
    };

    GateKeeper.prototype.getRemoteAddress = function () {
        return this.__remote;
    };

    GateKeeper.prototype.getStatus = function () {
        var docker = this.fetchDocker(this.__remote, null, null);
        if (docker) {
            return docker.getStatus();
        } else {
            return DockerStatus.ERROR;
        }
    };

    GateKeeper.prototype.getMessenger = function () {
        return this.__messenger;
    };

    var drive = function (gate) {
        var hub = gate.getHub();
        var incoming = hub.process();
        var outgoing = gate.process();
        return incoming || outgoing;
    };

    // Override
    GateKeeper.prototype.process = function () {
        if (drive(this)) {
            // processed income/outgo packages
            return true;
        } else if (!this.isActive()) {
            // inactive, wait a while to check again
            this.__queue.purge();
            return false;
        }
        // get next message
        var wrapper = this.__queue.next();
        if (!wrapper) {
            // no more new message
            this.__queue.purge();
            return false;
        }
        // if msg in this wrapper is null (means sent successfully),
        // it must have been cleaned already, so it should not be empty here
        var msg = wrapper.getMessage();
        if (!msg) {
            // msg sent?
            return true;
        }
        // try to push
        if (send_ship(this, wrapper, this.__remote, null)) {
            wrapper.onAppended();
        } else {
            var error = new Error('gate error, failed to send data.');
            wrapper.onGateError(error);
        }
        return true;
    };

    var send_ship = function (gate, ship, remote, local) {
        var sent = false;
        try {
            sent = gate.sendShip(ship, remote, local);
        } catch (e) {
            console.error('GateKeeper::sendShip()', e, gate, ship, remote, local);
        }
        return sent;
    };

    GateKeeper.prototype.fetchDocker = function (remote, local, advanceParties) {
        var docker = null;
        try {
            docker = this.__gate.fetchDocker(remote, local, advanceParties);
        } catch (e) {
            console.error('GateKeeper::fetchDocker()', e, remote, local, advanceParties);
        }
        return docker;
    };

    /**
     *  Send data via the gate
     *
     * @param {Uint8Array} payload - encoded message
     * @param {int} priority       - smaller is faster
     * @return {boolean} false on duplicated
     */
    GateKeeper.prototype.sendData = function (payload, priority) {
        var sent = false;
        try {
            sent = this.__gate.sendMessage(payload, this.__remote, null);
        } catch (e) {
            console.error('GateKeeper::sendData()', e, payload);
        }
        return sent;
    };

    // Override
    GateKeeper.prototype.sendReliableMessage = function (rMsg, priority) {
        var messenger = this.getMessenger();
        var data = messenger.serializeMessage(rMsg);
        var ship = new PlainDeparture(data, priority);
        return this.__queue.append(rMsg, ship);
    };

    // Override
    GateKeeper.prototype.sendInstantMessage = function (iMsg, priority) {
        var messenger = this.getMessenger();
        var sMsg = messenger.encryptMessage(iMsg);
        if (!sMsg) {
            // public key not found?
            return;
        }
        var rMsg = messenger.signMessage(sMsg);
        if (!rMsg) {
            // TODO: set iMsg.state = error
            throw new Error('failed to sign message: ' + sMsg.toMap());
        }

        this.sendReliableMessage(rMsg);
        // TODO: if OK, set iMsg, state = sending; else set iMsg.state = waiting

        // save signatures for receipt
        var signature = rMsg.getValue('signature')
        iMsg.setValue('signature', signature);

        messenger.saveMessage(iMsg);
    };

    // Override
    GateKeeper.prototype.sendContent = function (sender, receiver, content, priority) {
        // Application layer should make sure user is already login before it send message to server.
        // Application layer should put message into queue so that it will send automatically
        // after user login.
        if (!sender) {
            var messenger = this.getMessenger();
            var facebook = messenger.getFacebook();
            var user = facebook.getCurrentUser();
            if (!user) {
                throw new Error('current user not set');
            }
            sender = user.getIdentifier();
        }
        var env = Envelope.create(sender, receiver, null);
        var iMsg = InstantMessage.create(env, content);
        return this.sendInstantMessage(iMsg, priority);
    };

    //-------- namespace --------
    ns.network.GateKeeper = GateKeeper;

    ns.network.registers('GateKeeper');

})(SECHAT, DIMSDK);
