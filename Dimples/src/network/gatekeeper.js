;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
//
//                               Written in 2021 by Moky <albert.moky@gmail.com>
//
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
//! require 'gate.js'

(function (ns) {
    'use strict';

    var Class  = ns.type.Class;
    var Log    = ns.lnc.Log;
    var Runner = ns.fsm.skywalker.Runner;

    var InetSocketAddress = ns.startrek.type.InetSocketAddress;
    var PorterDelegate    = ns.startrek.port.PorterDelegate;
    var ClientHub         = ns.ws.ClientHub;

    var AckEnableGate     = ns.network.AckEnableGate;
    var MessageQueue      = ns.network.MessageQueue;

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
        this.__reconnect_time = 0;
    };
    Class(GateKeeper, Runner, [PorterDelegate], null);

    // protected
    GateKeeper.prototype.createGate = function (remote) {
        var gate = new AckEnableGate(this);
        var hub = this.createHub(gate, remote);
        gate.setHub(hub);
        return gate;
    };

    // protected
    GateKeeper.prototype.createHub = function (delegate, remote) {
        var hub = new ClientHub(delegate);
        hub.connect(remote, null);
        // TODO: reset send buffer size
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
        if (!when || when === 0) {
            when = (new Date()).getTime();
        } else if (when instanceof Date) {
            when = when.getTime();
        }
        if (when <= this.__last_active) {
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
        var again = Runner.prototype.setup.call(this)
        this.__gate.start();
        return again;
    };

    // Override
    GateKeeper.prototype.finish = function () {
        this.__gate.stop();
        return Runner.prototype.finish.call(this)
    };

    // Override
    GateKeeper.prototype.process = function () {
        // check docker for remote address
        var gate = this.getGate();
        var remote = this.getRemoteAddress();
        var docker = gate.getPorter(remote, null);
        if (!docker) {
            var now = (new Date()).getTime();
            if (now < this.__reconnect_time) {
                return false;
            }
            docker = gate.fetchPorter(remote, null);
            if (!docker) {
                Log.error('gate error', remote);
                this.__reconnect_time = now + 8000;
                return false;
            }
        }
        // try to process income/outgo packages
        var hub = gate.getHub();
        try {
            var incoming = hub.process();
            var outgoing = gate.process();
            if (incoming || outgoing) {
                // processed income/outgo packages
                return true;
            }
        } catch (e) {
            Log.error('GateKeeper::process()', e);
            return false;
        }
        var queue = this.__queue;
        if (!this.isActive()) {
            // inactive, wait a while to check again
            queue.purge();
            return false;
        }
        // get next message
        var wrapper = queue.next();
        if (!wrapper) {
            // no more new message
            queue.purge();
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
        var ok = gate.sendShip(wrapper, remote, null);
        if (!ok) {
            Log.error('gate error, failed to send data', wrapper, remote);
        }
        return true;
    };

    // // protected
    // GateKeeper.prototype.dockerPack = function (payload, priority) {
    //     var docker = this.__gate.fetchPorter(this.__remote, null, null);
    //     console.assert(docker, 'departure packer error', this.__remote);
    //     return new PlainDeparture(payload, priority);
    // };

    // protected
    GateKeeper.prototype.queueAppend = function (rMsg, departure) {
        var queue = this.__queue;
        return queue.append(rMsg, departure);
    };

    //
    //  Docker.Delegate
    //

    // Override
    GateKeeper.prototype.onPorterStatusChanged = function (previous, current, docker) {
        Log.info('GateKeeper::onPorterStatusChanged()', previous, current, docker);
    };

    // Override
    GateKeeper.prototype.onPorterReceived = function (arrival, docker) {
        Log.info('GateKeeper::onPorterReceived()', arrival, docker);
    };

    // Override
    GateKeeper.prototype.onPorterSent = function (departure, docker) {
        // TODO: remove sent message from local cache
    };

    // Override
    GateKeeper.prototype.onPorterFailed = function (error, departure, docker) {
        Log.info('GateKeeper::onPorterFailed()', error, departure, docker);
    };

    // Override
    GateKeeper.prototype.onPorterError = function (error, departure, docker) {
        Log.info('GateKeeper::onPorterError()', error, departure, docker);
    };

    //-------- namespace --------
    ns.network.GateKeeper = GateKeeper;

})(DIMP);
