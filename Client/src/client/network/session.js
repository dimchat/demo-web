;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
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

//! require 'common/network/gatekeeper.js'
//! require 'common/network/session.js'

(function (ns, sdk) {
    'use strict';

    var Thread = sdk.threading.Thread;
    var InetSocketAddress = sdk.startrek.type.InetSocketAddress;
    var WSGate = sdk.startrek.WSGate;
    var GateKeeper = ns.network.GateKeeper;
    var BaseSession = ns.network.BaseSession;

    var ClientGateKeeper = function (host, port, delegate, messenger) {
        GateKeeper.call(this, host, port, delegate, messenger);
        this.__thread = null;
    };
    sdk.Class(ClientGateKeeper, GateKeeper, null, {
        // Override
        createGate: function (host, port, delegate) {
            var remote = new InetSocketAddress(host, port);
            // FIXME: ClientGate?
            return new WSGate(delegate, remote, null);
        }
    });

    var Session = function (host, port, messenger) {
        BaseSession.call(this, host, port, messenger);
    };
    sdk.Class(Session, BaseSession, null, {
        // Override
        createGateKeeper: function (host, port, messenger) {
            return new ClientGateKeeper(host, port, this, messenger);
        },

        start: function () {
            var thread = new Thread(this);
            thread.start();
            this.__thread = thread;
        },

        // Override
        setup: function () {
            this.setActive(true);
            return BaseSession.prototype.setup.call(this);
        },

        finish: function () {
            var ok = BaseSession.prototype.finish.call(this);
            this.setActive(false);
            return ok;
        }
    });

    // // Override
    // Session.prototype.onDockerStatusChanged = function (previous, current, docker) {
    //     BaseSession.prototype.onDockerStatusChanged.call(this, previous, current, docker);
    //     if (current && current.equals(Gate.Status.ERROR)) {
    //         // connection lost, reconnecting
    //         var gate = this.getGate();
    //         var hub = gate.getHub();
    //         hub.connect(remote, local);
    //     }
    // };

    //-------- namespace --------
    ns.network.Session = Session;

    ns.network.registers('Session');

})(SECHAT, DIMSDK);
