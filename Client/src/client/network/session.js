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

//! require 'namespace.js'
//! require 'common/network/session.js'

(function (ns, sdk) {
    'use strict';

    var Gate = sdk.startrek.Gate;
    var WSDocker = sdk.stargate.WSDocker;
    var BaseSession = ns.network.BaseSession;

    var Session = function (host, port, messenger) {
        BaseSession.call(this, host, port, messenger);
        this.__docker = new WSDocker(this.gate);
    };
    sdk.Class(Session, BaseSession, null);

    Session.prototype.setup = function () {
        this.gate.setDocker(this.__docker);
        this.setActive(true);
        return BaseSession.prototype.setup.call(this);
    };

    Session.prototype.finish = function () {
        var ok = BaseSession.prototype.finish.call(this);
        this.setActive(false);
        this.gate.setDocker(null);
        return ok;
    };

    Session.prototype.sendPayload = function(payload, priority, delegate) {
        if (this.isActive()) {
            return this.gate.sendPayload(payload, priority, delegate);
        } else {
            return false;
        }
    };

    //
    //  Gate Delegate
    //

    Session.prototype.onGateStatusChanged = function (gate, oldStatus, newStatus) {
        BaseSession.prototype.onGateStatusChanged.call(this, gate, oldStatus, newStatus);
        if (newStatus.equals(Gate.Status.CONNECTED)) {
            var delegate = this.getMessenger().getDelegate();
            if (delegate instanceof ns.network.Server) {
                delegate.handshake(null);
            }
        }
    };

    //-------- namespace --------
    ns.network.Session = Session;

    ns.network.registers('Session');

})(SECHAT, DIMSDK);
