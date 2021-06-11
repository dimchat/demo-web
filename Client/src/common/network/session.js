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

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var Runner = sdk.threading.Runner;
    var Gate = sdk.startrek.Gate;

    /**
     *  Create session
     *
     *  Usages:
     *      1. new BaseSession(gate, transceiver);
     *      2. new BaseSession(host, port, transceiver);
     */
    var BaseSession = function () {
        Runner.call(this);
        if (arguments.length === 2) {
            // new BaseSession(gate, transceiver);
            this.gate = arguments[0];
            this.__messenger = arguments[1];
        } else if (arguments.length === 3) {
            // new BaseSession(host, port, transceiver);
            this.gate = ns.network.StarTrek.createGate(arguments[0], arguments[1]);
            this.__messenger = arguments[2];
        } else {
            throw new SyntaxError('session arguments error: ' + arguments);
        }
        this.gate.setDelegate(this);
        this.__queue = new ns.network.MessageQueue();
        this.__active = false;
    };
    sdk.Class(BaseSession, Runner, [Gate.Delegate]);

    BaseSession.EXPIRES = 600 * 1000;  // 10 minutes

    var flush = function () {
        var msg;
        var wrapper = this.__queue.shift();
        while (wrapper) {
            msg = wrapper.getMessage();
            if (msg) {
                this.storeMessage(msg);
            }
            wrapper = this.__queue.shift();
        }
    };
    var clean = function () {
        var msg;
        var wrapper = this.__queue.eject();
        while (wrapper) {
            msg = wrapper.getMessage();
            if (msg) {
                this.storeMessage(msg);
            }
            wrapper = this.__queue.eject();
        }
    };

    BaseSession.prototype.storeMessage = function (msg) {
        // TODO: store the stranded message?
    };

    BaseSession.prototype.getMessenger = function () {
        return this.__messenger;
    };

    BaseSession.prototype.isActive = function () {
        return this.__active && this.gate.isRunning();
    };
    BaseSession.prototype.setActive = function (active) {
        this.__active = active;
    };

    BaseSession.prototype.close = function () {
        this.__running = false;
    };

    BaseSession.prototype.setup = function () {
        this.__running = true;
        return this.gate.setup();
    };
    BaseSession.prototype.finish = function () {
        this.__running = false;
        if (this.gate.finish()) {
            // gate stuck, return true to try it again
            return true;
        } else {
            flush.call(this);
            return false;
        }
    };

    BaseSession.prototype.isRunning = function () {
        return this.__running && this.gate.isRunning();
    };

    BaseSession.prototype.process = function () {
        if (this.gate.process()) {
            // processed income/outgo packages
            return true;
        }
        // all packages processed, do the clean job
        clean.call(this);
        if (!this.isActive()) {
            return false;
        }
        // still active, get next message
        var rMsg, wrapper = this.__queue.next();
        if (wrapper) {
            // if msg in this wrapper is None (means sent successfully),
            // it must have been cleaned already, so it should not be empty here.
            rMsg = wrapper.getMessenger();
        } else {
            // no more new message
            rMsg = null;
        }
        if (!rMsg) {
            // no more new message, return false to have a rest
            return false;
        }
        // try to push
        if (!this.getMessenger().sendReliableMessage(rMsg, wrapper, 0)) {
            wrapper.fail();
        }
        return true;
    };

    BaseSession.prototype.push = function (rMsg) {
        if (this.isActive()) {
            return this.__queue.append(rMsg);
        } else {
            return false;
        }
    };

    //
    //  Gate Delegate
    //

    BaseSession.prototype.onGateStatusChanged = function (gate, oldStatus, newStatus) {
        if (newStatus.equals(Gate.Status.CONNECTED)) {
            this.getMessenger().onConnected();
        }
    };

    BaseSession.prototype.onGateReceived = function (gate, ship) {
        var payload = ship.getPayload();
        try {
            return this.getMessenger().processData(payload);
        } catch (e) {
            console.log('received data error', e);
            return null;
        }
    };

    //-------- namespace --------
    ns.network.BaseSession = BaseSession;

    ns.network.registers('BaseSession');

})(SECHAT, DIMSDK);
