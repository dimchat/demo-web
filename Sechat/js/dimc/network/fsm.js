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

//! require <dimsdk.js>

!function (ns) {
    'use strict';

    var State = ns.fsm.State;

    /**
     *  Server state
     */
    var ServerState = function(name) {
        State.call(this);
        this.name = name;
    };
    ns.type.Class(ServerState, State);

    ServerState.prototype.equals = function (state) {
        if (state instanceof ServerState) {
            return this.name === state.name;
        } else if (typeof state === 'string') {
            return this.name === state;
        } else {
            throw Error('state error: ' + state);
        }
    };

    ServerState.prototype.onEnter = function(machine) {
        console.assert(machine !== null, "machine empty");
        console.log('onEnter: ' + this.name + ' state');
    };
    ServerState.prototype.onExit = function(machine) {
        console.assert(machine !== null, "machine empty");
    };

    //-------- namespace --------
    if (typeof ns.network !== 'object') {
        ns.network = {};
    }
    ns.network.ServerState = ServerState;

}(DIMP);

!function (ns) {
    'use strict';

    var Transition = ns.fsm.Transition;
    var Machine = ns.fsm.Machine;

    var ServerState = ns.network.ServerState;
    var StarStatus = ns.stargate.StarStatus;

    //-------- state names --------
    var defaultState     = 'default';
    var connectingState  = 'connecting';
    var connectedState   = 'connected';
    var handshakingState = 'handshaking';
    var runningState     = 'running';
    var errorState       = 'error';
    var stoppedState     = 'stopped';

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
        return server_state(defaultState,
            // target state: Connecting
            transition(connectingState, function (machine) {
                var server = machine.server;
                if (server && server.getCurrentUser()) {
                    var status = server.getStatus();
                    return status.equals(StarStatus.Connecting)
                        || status.equals(StarStatus.Connected);
                } else {
                    return false;
                }
            })
        );
    };
    var connecting_state = function () {
        return server_state(connectingState,
            // target state: Connected
            transition(connectedState, function (machine) {
                var server = machine.server;
                var status = server.getStatus();
                return status.equals(StarStatus.Connected);
            }),
            // target state: Error
            transition(errorState, function (machine) {
                var server = machine.server;
                var status = server.getStatus();
                return status.equals(StarStatus.Error);
            })
        );
    };
    var connected_state = function () {
        return server_state(connectedState,
            // target state: Handshaking
            transition(handshakingState, function (machine) {
                var server = machine.server;
                return server.getCurrentUser();
            })
        );
    };
    var handshaking_state = function () {
        return server_state(handshakingState,
            // target state: Running
            transition(runningState, function (machine) {
                var server = machine.server;
                // when current user changed, the server will clear this session, so
                // if it's set again, it means handshake accepted
                return server.session;
            }),
            // target state: Error
            transition(errorState, function (machine) {
                var server = machine.server;
                var status = server.getStatus();
                return !status.equals(StarStatus.Connected);
            })
        );
    };
    var running_state = function () {
        return server_state(runningState,
            // target state: Error
            transition(errorState, function (machine) {
                var server = machine.server;
                var status = server.getStatus();
                return !status.equals(StarStatus.Connected);
            }),
            // target state: Default
            transition(defaultState, function (machine) {
                var server = machine.server;
                // user switched?
                return !server.session;
            })
        );
    };
    var error_state = function () {
        return server_state(errorState,
            // target state: Default
            transition(defaultState, function (machine) {
                var server = machine.server;
                var status = server.getStatus();
                return !status.equals(StarStatus.Error);
            })
        );
    };
    var stopped_state = function () {
        return server_state(stoppedState);
    };

    /**
     *  Server state machine
     */
    var StateMachine = function(defaultStateName) {
        if (!defaultStateName) {
            defaultStateName = StateMachine.defaultState;
        }
        Machine.call(this, defaultStateName);
        // add states
        this.addState(default_state());
        this.addState(connecting_state());
        this.addState(connected_state());
        this.addState(handshaking_state());
        this.addState(running_state());
        this.addState(error_state());
        this.addState(stopped_state());

        this.server = null;
    };
    ns.type.Class(StateMachine, Machine);

    StateMachine.prototype.addState = function (state) {
        Machine.prototype.addState.call(this, state, state.name);
    };

    var start_tick = function (machine) {
        if (machine.ti) {
            clearInterval(machine.ti);
        }
        machine.ti = setInterval(function () {
            machine.tick();
        }, 500);
    };
    var stop_tick = function (machine) {
        if (machine.ti) {
            clearInterval(machine.ti);
            machine.ti = null;
        }
    };
    var is_stop = function (machine) {
        if (!machine.currentState) {
            return false;
        }
        return machine.currentState.name === StateMachine.stoppedState;
    };

    StateMachine.prototype.tick = function () {
        if (is_stop(this)) {
            stop_tick(this);
            return;
        }
        Machine.prototype.tick.call(this);
    };
    StateMachine.prototype.start = function () {
        Machine.prototype.start.call(this);
        start_tick(this);
    };
    StateMachine.prototype.stop = function () {
        stop_tick(this);
        Machine.prototype.stop.call(this);
    };

    StateMachine.prototype.pause = function () {
        stop_tick(this);
        Machine.prototype.pause.call(this);
    };
    StateMachine.prototype.resume = function () {
        Machine.prototype.resume.call(this);
        start_tick(this);
    };

    //-------- state names --------
    StateMachine.defaultState     = defaultState;
    StateMachine.connectingState  = connectingState;
    StateMachine.connectedState   = connectedState;
    StateMachine.handshakingState = handshakingState;
    StateMachine.runningState     = runningState;
    StateMachine.errorState       = errorState;
    StateMachine.stoppedState     = stoppedState;

    //-------- namespace --------
    if (typeof ns.network !== 'object') {
        ns.network = {};
    }
    ns.network.StateMachine = StateMachine;

}(DIMP);
