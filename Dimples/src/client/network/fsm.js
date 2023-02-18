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

    var Class = ns.type.Class;
    var BaseState = ns.fsm.BaseState;

    /**
     *  Session State
     *  ~~~~~~~~~~~~~
     *  Defined for indicating session states
     *
     *      DEFAULT     - initialized
     *      CONNECTING  - connecting to station
     *      CONNECTED   - connected to station
     *      HANDSHAKING - trying to log in
     *      RUNNING     - handshake accepted
     *      ERROR       - network error
     */
    var SessionState = function(name) {
        BaseState.call(this);
        this.__name = name;
        this.__enterTime = 0;  // timestamp (milliseconds)
    };
    Class(SessionState, BaseState, null);

    //-------- state names --------
    SessionState.DEFAULT     = 'default';
    SessionState.CONNECTING  = 'connecting';
    SessionState.CONNECTED   = 'connected';
    SessionState.HANDSHAKING = 'handshaking';
    SessionState.RUNNING     = 'running';
    SessionState.ERROR       = 'error';

    // Override
    SessionState.prototype.equals = function (other) {
        if (this === other) {
            return true;
        } else if (!other) {
            return false;
        } else if (other instanceof SessionState) {
            return this.__name === other.toString();
        } else {
            return this.__name === other;
        }
    };

    // Override
    SessionState.prototype.valueOf = function () {
        return this.__name;
    };

    // Override
    SessionState.prototype.toString = function () {
        return this.__name;
    };

    SessionState.prototype.getName = function () {
        return this.__name;
    };

    SessionState.prototype.getEnterTime = function () {
        return this.__enterTime;
    };

    // Override
    SessionState.prototype.onEnter = function (previous, machine, now) {
        this.__enterTime = now;
    };

    // Override
    SessionState.prototype.onExit = function (next, machine, now) {
        this.__enterTime = 0;
    };

    // Override
    SessionState.prototype.onPause = function (machine) {
    };

    // Override
    SessionState.prototype.onResume = function (machine) {
    };

    //-------- namespace --------
    ns.network.SessionState = SessionState;

})(DIMP);

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var BaseTransition = ns.fsm.BaseTransition;
    var AutoMachine = ns.fsm.AutoMachine;
    var DockerStatus = ns.startrek.port.DockerStatus;
    var SessionState = ns.network.SessionState;

    /**
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
     *
     *  Transitions
     *  ~~~~~~~~~~~
     *
     *      0.1 - when session ID was set, change state 'default' to 'connecting';
     *
     *      1.2 - when connection built, change state 'connecting' to 'connected';
     *      1.5 - if connection failed, change state 'connecting' to 'error';
     *
     *      2.3 - if no error occurs, change state 'connected' to 'handshaking';
     *      2.5 - if connection lost, change state 'connected' to 'error';
     *
     *      3.2 - if handshaking expired, change state 'handshaking' to 'connected';
     *      3.4 - when session key was set, change state 'handshaking' to 'running';
     *      3.5 - if connection lost, change state 'handshaking' to 'error';
     *
     *      4.0 - when session ID/key erased, change state 'running' to 'default';
     *      4.5 - when connection lost, change state 'running' to 'error';
     *
     *      5.0 - when connection reset, change state 'error' to 'default'.
     */
    var StateMachine = function(session) {
        AutoMachine.call(this, SessionState.DEFAULT);
        this.__session = session;  // ClientSession
        // init states
        set_state(this, default_state());
        set_state(this, connecting_state());
        set_state(this, connected_state());
        set_state(this, handshaking_state());
        set_state(this, running_state());
        set_state(this, error_state());
    };
    Class(StateMachine, AutoMachine, null, {

        // Override
        getContext: function () {
            return this;
        },

        //getSession: function () {
        //    return this.__session;
        //},
        getSessionKey: function () {
            return this.__session.getKey();
        },
        getSessionID: function () {
            return this.__session.getIdentifier();
        },

        getStatus: function () {
            var gate = this.__session.getGate();
            var docker = gate.getDocker(this.__session.getRemoteAddress(), null, null);
            return docker ? docker.getStatus() : DockerStatus.ERROR;
        }
    });

    var set_state = function (fsm, state) {
        fsm.setState(state.name, state);
    };

    var new_transition = function (target, evaluate) {
        var trans = new BaseTransition(target);
        trans.evaluate = evaluate;
        return trans;
    };
    var is_expired = function (state, now) {
        var enterTime = state.getEnterTime();
        return 0 < enterTime && enterTime < (now - 30 * 1000);
    };

    var new_state = function (name, transitions) {
        var state = new SessionState(name);
        for (var i = 1; i < arguments.length; ++i) {
            state.addTransition(arguments[i]);
        }
        return state;
    };

    //
    //  States
    //

    var default_state = function () {
        return new_state(SessionState.DEFAULT,
            // Default -> Connecting
            new_transition(SessionState.CONNECTING, function (machine, now) {
                if (machine.getSessionID() === null) {
                    // current user not set yet
                    return false;
                }
                var status = machine.getStatus();
                return DockerStatus.PREPARING.equals(status) || DockerStatus.READY.equals(status);
            })
        );
    };
    var connecting_state = function () {
        return new_state(SessionState.CONNECTING,
            // Connecting -> Connected
            new_transition(SessionState.CONNECTED, function (machine, now) {
                var status = machine.getStatus();
                return DockerStatus.READY.equals(status);
            }),
            // Connecting -> Error
            new_transition(SessionState.ERROR, function (machine, now) {
                if (is_expired(machine.getCurrentState(), now)) {
                    // connecting expired, do it again
                    return true;
                }
                var status = machine.getStatus();
                return !(DockerStatus.PREPARING.equals(status) || DockerStatus.READY.equals(status));
            })
        );
    };
    var connected_state = function () {
        return new_state(SessionState.CONNECTED,
            // Connected -> Handshaking
            new_transition(SessionState.HANDSHAKING, function (machine, now) {
                if (machine.getSessionID() === null) {
                    // FIXME: current user lost?
                    //        state will be changed to 'error'
                    return false;
                }
                var status = machine.getStatus();
                return DockerStatus.READY.equals(status);
            }),
            // Connected -> Error
            new_transition(SessionState.ERROR, function (machine, now) {
                if (machine.getSessionID() === null) {
                    // FIXME: current user lost?
                    return true;
                }
                var status = machine.getStatus();
                return !DockerStatus.READY.equals(status);
            })
        );
    };
    var handshaking_state = function () {
        return new_state(SessionState.HANDSHAKING,
            // Handshaking -> Running
            new_transition(SessionState.RUNNING, function (machine, now) {
                if (machine.getSessionID() === null) {
                    // FIXME: current user lost?
                    //        state will be changed to 'error'
                    return false;
                }
                var status = machine.getStatus();
                if (!DockerStatus.READY.equals(status)) {
                    // connection lost, state will be changed to 'error'
                    return false;
                }
                // when current user changed, the server will clear this session, so
                // if it's set again, it means handshake accepted
                return machine.getSessionKey() !== null;
            }),
            // Handshaking -> Connected
            new_transition(SessionState.CONNECTED, function (machine, now) {
                if (machine.getSessionID() === null) {
                    // FIXME: current user lost?
                    //        state will be changed to 'error'
                    return false;
                }
                var status = machine.getStatus();
                if (!DockerStatus.READY.equals(status)) {
                    // connection lost, state will be changed to 'error'
                    return false;
                }
                if (machine.getSessionKey() !== null) {
                    // session key was set, state will be changed to 'running'
                    return false;
                }
                // handshake expired, do it again
                return is_expired(machine.getCurrentState(), now);
            }),
            // Handshaking -> Error
            new_transition(SessionState.ERROR, function (machine, now) {
                if (machine.getSessionID() === null) {
                    // FIXME: current user lost?
                    //        state will be changed to 'error'
                    return true;
                }
                var status = machine.getStatus();
                return !DockerStatus.READY.equals(status);
            })
        );
    };
    var running_state = function () {
        return new_state(SessionState.RUNNING,
            // Running -> Default
            new_transition(SessionState.DEFAULT, function (machine, now) {
                var status = machine.getStatus();
                if (!DockerStatus.READY.equals(status)) {
                    // connection lost, state will be changed to 'error'
                    return false;
                }
                if (machine.getSessionID() === null) {
                    // user logout / switched?
                    return true;
                }
                // force user login again?
                return machine.getSessionKey() === null;
            }),
            // Running -> Error
            new_transition(SessionState.ERROR, function (machine, now) {
                var status = machine.getStatus();
                return !DockerStatus.READY.equals(status);
            })
        );
    };
    var error_state = function () {
        return new_state(SessionState.ERROR,
            // Error -> Default
            new_transition(SessionState.DEFAULT, function (machine, now) {
                var status = machine.getStatus();
                return !DockerStatus.ERROR.equals(status);
            })
        );
    };

    //-------- namespace --------
    ns.network.StateMachine = StateMachine;

})(DIMP);
