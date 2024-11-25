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

    var Class     = ns.type.Class;
    var Enum      = ns.type.Enum;
    var BaseState = ns.fsm.BaseState;

    var StateOrder = Enum('SessionStateOrder', {
        DEFAULT:     0,  // Init
        CONNECTING:  1,
        CONNECTED:   2,
        HANDSHAKING: 3,
        RUNNING:     4,
        ERROR:       5
    });

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
    var SessionState = function(order) {
        BaseState.call(this, Enum.getInt(order));
        this.__name = order.getName();
        this.__enterTime = null;  // Date
    };
    Class(SessionState, BaseState, null, {

        getName: function () {
            return this.__name;
        },

        getEnterTime: function () {
            return this.__enterTime;
        },

        // Override
        toString: function () {
            return this.__name;
        },

        // Override
        valueOf: function () {
            return this.__name;
        },

        // Override
        equals: function (other) {
            if (other instanceof SessionState) {
                if (other === this) {
                    // same object
                    return true;
                }
                other = other.getIndex();
            } else if (other instanceof StateOrder) {
                other = other.getValue();
            }
            return this.getIndex() === other;
        }
    });

    // Override
    SessionState.prototype.onEnter = function (previous, ctx, now) {
        this.__enterTime = now;
    };

    // Override
    SessionState.prototype.onExit = function (next, ctx, now) {
        this.__enterTime = null;
    };

    // Override
    SessionState.prototype.onPause = function (ctx, now) {
    };

    // Override
    SessionState.prototype.onResume = function (ctx, now) {
    };

    /**
     *  Session State Delegate
     *  ~~~~~~~~~~~~~~~~~~~~~~
     *
     *  callback when session state changed
     */
    SessionState.Delegate = ns.fsm.Delegate;

    /**
     *  State Builder
     *  ~~~~~~~~~~~~~
     */
    var StateBuilder = function (transitionBuilder) {
        Object.call(this);
        this.builder = transitionBuilder;
    };
    Class(StateBuilder, Object, null, {

        getDefaultState: function () {
            var state = new SessionState(StateOrder.DEFAULT);
            // Default -> Connecting
            state.addTransition(this.builder.getDefaultConnectingTransition());
            return state;
        },

        getConnectingState: function () {
            var state = new SessionState(StateOrder.CONNECTING);
            // Connecting -> Connected
            state.addTransition(this.builder.getConnectingConnectedTransition());
            // Connecting -> Error
            state.addTransition(this.builder.getConnectingErrorTransition());
            return state;
        },

        getConnectedState: function () {
            var state = new SessionState(StateOrder.CONNECTED);
            // Connected -> Handshaking
            state.addTransition(this.builder.getConnectedHandshakingTransition());
            // Connected -> Error
            state.addTransition(this.builder.getConnectedErrorTransition());
            return state;
        },

        getHandshakingState: function () {
            var state = new SessionState(StateOrder.HANDSHAKING);
            // Handshaking -> Running
            state.addTransition(this.builder.getHandshakingRunningTransition());
            // Handshaking -> Connected
            state.addTransition(this.builder.getHandshakingConnectedTransition());
            // Handshaking -> Error
            state.addTransition(this.builder.getHandshakingErrorTransition());
            return state;
        },

        getRunningState: function () {
            var state = new SessionState(StateOrder.RUNNING);
            // Running -> Default
            state.addTransition(this.builder.getRunningDefaultTransition());
            // Running -> Error
            state.addTransition(this.builder.getRunningErrorTransition());
            return state;
        },

        getErrorState: function () {
            var state = new SessionState(StateOrder.ERROR);
            // Error -> Default
            state.addTransition(this.builder.getErrorDefaultTransition());
            return state;
        }
    });

    //-------- namespace --------
    ns.network.SessionState = SessionState;
    ns.network.SessionStateBuilder = StateBuilder;
    ns.network.SessionStateOrder = StateOrder;

})(DIMP);
