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

//! require 'queue.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Runner = ns.fsm.skywalker.Runner;
    var InetSocketAddress = ns.startrek.type.InetSocketAddress;
    var DockerDelegate = ns.startrek.port.DockerDelegate;
    var PlainDeparture = ns.startrek.PlainDeparture;
    var WSClientGate = ns.startrek.WSClientGate;
    var ClientHub = ns.ws.ClientHub;

    var MessageQueue = ns.network.MessageQueue;

    /**
     *  Gate Keeper
     *
     * @param {String} host             - remote host
     * @param {uint} port               - remote port
     */
    var GateKeeper = function (host, port) {
        Runner.call(this);
        this.__remote = new InetSocketAddress(host, port);
        this.__gate = this.createGate(this.__remote);
        this.__queue = new MessageQueue();
        this.__active = false;   // session status
        this.__last_active = 0;  // last update time
    };
    Class(GateKeeper, Runner, [DockerDelegate], null);

    // protected
    GateKeeper.prototype.createGate = function (remote) {
        var gate = new WSClientGate(this);
        var hub = this.createHub(gate, remote);
        gate.setHub(hub);
        return gate;
    };

    // protected
    GateKeeper.prototype.createHub = function (delegate, remote) {
        var hub = new ClientHub(delegate);
        hub.connect(remote, null);
        return hub;
    };

    GateKeeper.prototype.getRemoteAddress = function () {
        return this.__remote;
    };

    GateKeeper.prototype.getGate = function () {
        return this.__gate;
    };

    GateKeeper.prototype.isActive = function () {
        return this.__active;
    };
    GateKeeper.prototype.setActive = function (active, when) {
        if (this.__active === active) {
            // flag not changed
            return false;
        }
        if (!when || when <= 0) {
            when = (new Date()).getTime();
        } else if (when <= this.__last_active) {
            return false;
        }
        this.__active = active;
        this.__last_active = when;
        return true;
    };

    // Override
    GateKeeper.prototype.isRunning = function () {
        if (Runner.prototype.isRunning.call(this)) {
            return this.__gate.isRunning();
        } else {
            return false;
        }
    };

    // Override
    GateKeeper.prototype.stop = function () {
        Runner.prototype.stop.call(this)
        this.__gate.stop();
    };

    // Override
    GateKeeper.prototype.setup = function () {
        Runner.prototype.setup.call(this)
        this.__gate.start();
    };

    // Override
    GateKeeper.prototype.finish = function () {
        this.__gate.stop();
        Runner.prototype.finish.call(this)
    };

    // Override
    GateKeeper.prototype.process = function () {
        var gate = this.__gate;
        var hub = gate.getHub();
        try {
            var incoming = hub.process();
            var outgoing = gate.process();
            if (incoming || outgoing) {
                // processed income/outgo packages
                return true;
            }
        } catch (e) {
            console.error('GateKeeper::process()', e);
            return false;
        }
        if (!this.isActive()) {
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
        var ok = gate.sendShip(wrapper, this.__remote, null);
        if (!ok) {
            console.error('gate error, failed to send data', this.__remote);
        }
        return true;
    };

    // protected
    GateKeeper.prototype.dockerPack = function (payload, priority) {
        return new PlainDeparture(payload, priority);
    };

    // Override
    GateKeeper.prototype.queueAppend = function (rMsg, departure) {
        return this.__queue.append(rMsg, departure);
    };

    //
    //  Docker.Delegate
    //

    // Override
    GateKeeper.prototype.onDockerStatusChanged = function (previous, current, docker) {
        console.info('GateKeeper::onDockerStatusChanged()', previous, current, docker);
    };

    // Override
    GateKeeper.prototype.onDockerReceived = function (arrival, docker) {
        console.info('GateKeeper::onDockerReceived()', arrival, docker);
    };

    // Override
    GateKeeper.prototype.onDockerSent = function (departure, docker) {
        // TODO: remove sent message from local cache
    };

    // Override
    GateKeeper.prototype.onDockerFailed = function (error, departure, docker) {
        console.info('GateKeeper::onDockerFailed()', error, departure, docker);
    };

    // Override
    GateKeeper.prototype.onDockerError = function (error, departure, docker) {
        console.info('GateKeeper::onDockerError()', error, departure, docker);
    };

    //-------- namespace --------
    ns.network.GateKeeper = GateKeeper;

})(SECHAT);
