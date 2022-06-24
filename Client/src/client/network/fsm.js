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
    var DockerStatus = sdk.startrek.port.DockerStatus;

    var ServerState = ns.network.ServerState;

    /**
     *  Server state machine
     */
    var StateMachine = function(server) {
        AutoMachine.call(this, ServerState.DEFAULT);

        this.setDelegate(server);
        this.__session = null;  // session key

        // add states
        set_state(this, default_state());
        set_state(this, connecting_state());
        set_state(this, connected_state());
        set_state(this, handshaking_state());
        set_state(this, running_state());
        set_state(this, error_state());
    };
    sdk.Class(StateMachine, AutoMachine, null, {
        getSessionKey: function () {
            return this.__session;
        },
        setSessionKey: function (session) {
            this.__session = session;
        },
        getServer: function () {
            return this.getDelegate();
        },
        getCurrentUser: function () {
            var server = this.getServer();
            return server ? server.getCurrentUser() : null;
        },
        getStatus: function () {
            var server = this.getServer();
            return server ? server.getStatus() : DockerStatus.ERROR;
        },
        // Override
        getContext: function () {
            return this;
        },
        // Override
        getCurrentState: function () {
            var state = AutoMachine.prototype.getCurrentState.call(this);
            if (!state) {
                state = this.getState(ServerState.DEFAULT);
            }
            return state;
        }
    });

    var set_state = function (fsm, state) {
        fsm.setState(state.name, state);
    };

    var new_transition = function (target, evaluate) {
        var trans = new Transition(target);
        trans.evaluate = evaluate;
        return trans;
    };

    var new_state = function (name, transitions) {
        var state = new ServerState(name);
        for (var i = 1; i < arguments.length; ++i) {
            state.addTransition(arguments[i]);
        }
        return state;
    };

    //
    //  States
    //

    var default_state = function () {
        return new_state(ServerState.DEFAULT,
            // Default -> Connecting
            new_transition(ServerState.CONNECTING, function (machine) {
                if (machine.getCurrentUser() === null) {
                    return false;
                }
                var status = machine.getStatus();
                return DockerStatus.PREPARING.equals(status) || DockerStatus.READY.equals(status);
            })
        );
    };
    var connecting_state = function () {
        return new_state(ServerState.CONNECTING,
            // Connecting -> Connected
            new_transition(ServerState.CONNECTED, function (machine) {
                var status = machine.getStatus();
                return DockerStatus.READY.equals(status);
            }),
            // Connecting -> Error
            new_transition(ServerState.ERROR, function (machine) {
                var status = machine.getStatus();
                return DockerStatus.ERROR.equals(status);
            })
        );
    };
    var connected_state = function () {
        return new_state(ServerState.CONNECTED,
            // Connected -> Handshaking
            new_transition(ServerState.HANDSHAKING, function (machine) {
                return machine.getCurrentUser() !== null;
            }),
            // Connected -> Error
            new_transition(ServerState.ERROR, function (machine) {
                var status = machine.getStatus();
                return DockerStatus.ERROR.equals(status);
            })
        );
    };
    var handshaking_state = function () {
        return new_state(ServerState.HANDSHAKING,
            // Handshaking -> Running
            new_transition(ServerState.RUNNING, function (machine) {
                // when current user changed, the server will clear this session, so
                // if it's set again, it means handshake accepted
                return machine.getSessionKey() !== null;
            }),
            // Handshaking -> Connected
            new_transition(ServerState.CONNECTED, function (machine) {
                var state = machine.getCurrentState();
                var time = state.time;
                if (!time) {
                    // not enter yet
                    return false;
                }
                var expired = time.getTime() + 16 * 1000;
                var now = (new Date()).getTime();
                if (now < expired) {
                    // not expired yet
                    return false;
                }
                // handshake expired, return to connected to do it again
                var status = machine.getStatus();
                return DockerStatus.READY.equals(status);
            }),
            // Handshaking -> Error
            new_transition(ServerState.ERROR, function (machine) {
                var status = machine.getStatus();
                return DockerStatus.ERROR.equals(status);
            })
        );
    };
    var running_state = function () {
        return new_state(ServerState.RUNNING,
            // Running -> Default
            new_transition(ServerState.DEFAULT, function (machine) {
                // user switched?
                return machine.getSessionKey() === null;
            }),
            // Running -> Error
            new_transition(ServerState.ERROR, function (machine) {
                var status = machine.getStatus();
                return DockerStatus.ERROR.equals(status);
            })
        );
    };
    var error_state = function () {
        return new_state(ServerState.ERROR,
            // Error -> Default
            new_transition(ServerState.DEFAULT, function (machine) {
                var status = machine.getStatus();
                return !DockerStatus.ERROR.equals(status);
            })
        );
    };

    //-------- namespace --------
    ns.network.StateMachine = StateMachine;

    ns.network.registers('StateMachine');

})(SECHAT, DIMSDK);
