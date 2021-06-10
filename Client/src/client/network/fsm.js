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

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var State = sdk.fsm.State;

    /**
     *  Server state
     */
    var ServerState = function(name) {
        State.call(this);
        this.name = name;
        this.time = null;  // enter time
    };
    sdk.Class(ServerState, State, null);

    //-------- state names --------
    ServerState.DEFAULT     = 'default';
    ServerState.CONNECTING  = 'connecting';
    ServerState.CONNECTED   = 'connected';
    ServerState.HANDSHAKING = 'handshaking';
    ServerState.RUNNING     = 'running';
    ServerState.ERROR       = 'error';

    ServerState.prototype.equals = function (state) {
        if (state instanceof ServerState) {
            return this.name === state.name;
        } else if (typeof state === 'string') {
            return this.name === state;
        } else {
            throw new Error('state error: ' + state);
        }
    };

    ServerState.prototype.toString = function () {
        return '<ServerState:' + this.name + '>';
    };
    ServerState.prototype.toLocaleString = function () {
        return '<ServerState:' + this.name.toLocaleString() + '>';
    };

    ServerState.prototype.onEnter = function(machine) {
        console.assert(machine !== null, "machine empty");
        console.log('onEnter: ', this);
        this.time = new Date();
    };
    ServerState.prototype.onExit = function(machine) {
        console.assert(machine !== null, "machine empty");
        this.time = null;
    };

    //-------- namespace --------
    ns.network.ServerState = ServerState;

    ns.network.registers('ServerState');

})(SECHAT, DIMSDK);

(function (ns, sdk) {
    'use strict';

    var Transition = sdk.fsm.Transition;
    var AutoMachine = sdk.fsm.AutoMachine;
    var Gate = sdk.startrek.Gate;

    var ServerState = ns.network.ServerState;

    /**
     *  Server state machine
     */
    var StateMachine = function(server) {
        AutoMachine.call(this, ServerState.DEFAULT);

        this.setDelegate(server);
        this.__session = null;  // session key

        // add states
        set_state.call(this, default_state());
        set_state.call(this, connecting_state());
        set_state.call(this, connected_state());
        set_state.call(this, handshaking_state());
        set_state.call(this, running_state());
        set_state.call(this, error_state());
    };
    sdk.Class(StateMachine, AutoMachine, null);

    var set_state = function (state) {
        this.addState(state, state.name);
    };

    StateMachine.prototype.getSessionKey = function () {
        return this.__session;
    };
    StateMachine.prototype.setSessionKey = function (session) {
        this.__session = session;
    };

    //
    //  States
    //

    StateMachine.prototype.getCurrentState = function () {
        var state = AutoMachine.prototype.getCurrentState.call(this);
        if (!state) {
            state = this.getState(ServerState.DEFAULT);
        }
        return state;
    };

    var get_server = function (machine) {
        return machine.getDelegate();
    };

    var transition = function (target, evaluate) {
        var trans = new Transition(target);
        trans.evaluate = evaluate;
        return trans;
    };

    var server_state = function (name, transitions) {
        var state = new ServerState(name);
        for (var i = 1; i < arguments.length; ++i) {
            state.addTransition(arguments[i]);
        }
        return state;
    };

    var default_state = function () {
        return server_state(ServerState.DEFAULT,
            // target state: Connecting
            transition(ServerState.CONNECTING, function (machine) {
                var server = get_server(machine);
                if (server && server.getCurrentUser()) {
                    var status = server.getStatus();
                    return status.equals(Gate.Status.CONNECTING)
                        || status.equals(Gate.Status.CONNECTED);
                } else {
                    return false;
                }
            })
        );
    };
    var connecting_state = function () {
        return server_state(ServerState.CONNECTING,
            // target state: Connected
            transition(ServerState.CONNECTED, function (machine) {
                var server = get_server(machine);
                var status = server.getStatus();
                return status.equals(Gate.Status.CONNECTED);
            }),
            // target state: Error
            transition(ServerState.ERROR, function (machine) {
                var server = machine.server;
                var status = server.getStatus();
                return status.equals(Gate.Status.ERROR);
            })
        );
    };
    var connected_state = function () {
        return server_state(ServerState.CONNECTED,
            // target state: Handshaking
            transition(ServerState.HANDSHAKING, function (machine) {
                var server = get_server(machine);
                return server.getCurrentUser();
            })
        );
    };
    var handshaking_state = function () {
        return server_state(ServerState.HANDSHAKING,
            // target state: Running
            transition(ServerState.RUNNING, function (machine) {
                // when current user changed, the server will clear this session, so
                // if it's set again, it means handshake accepted
                return machine.getSessionKey();
            }),
            // target state: Connected
            transition(ServerState.CONNECTED, function (machine) {
                var state = machine.getCurrentState();
                var time = state.time;
                if (time) {
                    var expired = time.getTime() + 120 * 1000;
                    var now = new Date();
                    if (now.getTime() < expired) {
                        // not expired yet
                        return false;
                    }
                } else {
                    // not enter yet
                    return false;
                }
                var server = get_server(machine);
                var status = server.getStatus();
                return status.equals(Gate.Status.CONNECTED);
            }),
            // target state: Error
            transition(ServerState.ERROR, function (machine) {
                var server = get_server(machine);
                var status = server.getStatus();
                return !status.equals(Gate.Status.CONNECTED);
            })
        );
    };
    var running_state = function () {
        return server_state(ServerState.RUNNING,
            // target state: Error
            transition(ServerState.ERROR, function (machine) {
                var server = get_server(machine);
                var status = server.getStatus();
                return !status.equals(Gate.Status.CONNECTED);
            }),
            // target state: Default
            transition(ServerState.DEFAULT, function (machine) {
                var server = get_server(machine);
                // user switched?
                return !server.getSessionKey();
            })
        );
    };
    var error_state = function () {
        return server_state(ServerState.ERROR,
            // target state: Default
            transition(ServerState.DEFAULT, function (machine) {
                var server = get_server(machine);
                var status = server.getStatus();
                return !status.equals(Gate.Status.ERROR);
            })
        );
    };

    //-------- namespace --------
    ns.network.StateMachine = StateMachine;

    ns.network.registers('StateMachine');

})(SECHAT, DIMSDK);
