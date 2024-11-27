;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
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

//! require 'common/*.js'

(function (ns) {
    'use strict';

    var Class        = ns.type.Class;
    var AutoMachine  = ns.fsm.AutoMachine;
    var PorterStatus = ns.startrek.port.PorterStatus;

    /*
     *  Session States
     *  ~~~~~~~~~~~~~~
     *
     *      +--------------+                +------------------+
     *      |  0.Default   | .............> |   1.Connecting   |
     *      +--------------+                +------------------+
     *          A       A       ................:       :
     *          :       :       :                       :
     *          :       :       V                       V
     *          :   +--------------+        +------------------+
     *          :   |   5.Error    | <..... |   2.Connected    |
     *          :   +--------------+        +------------------+
     *          :       A       A                   A   :
     *          :       :       :................   :   :
     *          :       :                       :   :   V
     *      +--------------+                +------------------+
     *      |  4.Running   | <............. |  3.Handshaking   |
     *      +--------------+                +------------------+
     */
    var StateMachine = function(session) {
        AutoMachine.call(this);
        this.__session = session;  // ClientSession
        // init states
        var builder = this.createStateBuilder();
        this.addState(builder.getDefaultState());
        this.addState(builder.getConnectingState());
        this.addState(builder.getConnectedState());
        this.addState(builder.getHandshakingState());
        this.addState(builder.getRunningState());
        this.addState(builder.getErrorState());
    };
    Class(StateMachine, AutoMachine, null, null);

    // protected
    StateMachine.prototype.createStateBuilder = function () {
        var stb = new ns.network.SessionStateTransitionBuilder();
        return new ns.network.SessionStateBuilder(stb);
    };

    // Override
    StateMachine.prototype.getContext = function () {
        return this;
    };

    StateMachine.prototype.getSession = function () {
        return this.__session;
    };

    StateMachine.prototype.getSessionKey = function () {
        var session = this.getSession();
        return session.getSessionKey();
    };

    StateMachine.prototype.getSessionID = function () {
        var session = this.getSession();
        return session.getIdentifier();
    };

    StateMachine.prototype.getStatus = function () {
        var session = this.getSession();
        if (!session) {
            return PorterStatus.ERROR;
        }
        var gate = session.getGate();
        var remote = session.getRemoteAddress();
        var docker = gate.getPorter(remote, null);
        if (!docker) {
            return PorterStatus.ERROR;
        }
        return docker.getStatus();
    };

    //-------- namespace --------
    ns.network.SessionStateMachine = StateMachine;

})(DIMP);
