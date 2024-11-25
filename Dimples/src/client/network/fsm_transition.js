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

//! require 'fsm_state.js'

(function (ns) {
    'use strict';

    var Class          = ns.type.Class;
    var Enum           = ns.type.Enum;
    var BaseTransition = ns.fsm.BaseTransition;
    var PorterStatus   = ns.startrek.port.PorterStatus;
    var StateOrder     = ns.network.SessionStateOrder;

    /**
     *  Session State Transition
     *  ~~~~~~~~~~~~~~~~~~~~~~~~
     * @param {SessionStateOrder} order
     * @param {Function} evaluate
     */
    var StateTransition = function (order, evaluate) {
        BaseTransition.call(this, Enum.getInt(order));
        this.__evaluate = evaluate;
    };
    Class(StateTransition, BaseTransition, null, null);

    // Override
    StateTransition.prototype.evaluate = function(ctx, now) {
        return this.__evaluate.call(this, ctx, now);
    };

    var is_state_expired = function (state, now) {
        var enterTime = state.getEnterTime();
        if (!enterTime) {
            return false;
        }
        var recent = now.getTime() - 30 * 1000;
        return enterTime.getTime() < recent;
    };

    /**
     *  Transition Builder
     *  ~~~~~~~~~~~~~~~~~~
     */
    var TransitionBuilder = function () {
        Object.call(this);
    };
    Class(TransitionBuilder, Object, null, {
        ///  Default -> Connecting
        ///  ~~~~~~~~~~~~~~~~~~~~~
        ///  When the session ID was set, and connection is building.
        ///
        ///  The session key must be empty now, it will be set
        ///  after handshake success.
        getDefaultConnectingTransition: function () {
            return new StateTransition(StateOrder.CONNECTING, function (ctx, now) {
                // change to 'connecting' when current user set
                if (!ctx.getSessionID()) {
                    // current user not set yet
                    return false;
                }
                var status = ctx.getStatus();
                return PorterStatus.PREPARING.equals(status)
                    || PorterStatus.READY.equals(status);
            });
        },
        ///  Connecting -> Connected
        ///  ~~~~~~~~~~~~~~~~~~~~~~~
        ///  When connection built.
        ///
        ///  The session ID must be set, and the session key must be empty now.
        getConnectingConnectedTransition: function () {
            return new StateTransition(StateOrder.CONNECTED, function (ctx, now) {
                var status = ctx.getStatus();
                return PorterStatus.READY.equals(status);
            });
        },
        ///  Connecting -> Error
        ///  ~~~~~~~~~~~~~~~~~~~
        ///  When connection lost.
        ///
        ///  The session ID must be set, and the session key must be empty now.
        getConnectingErrorTransition: function () {
            return new StateTransition(StateOrder.ERROR, function (ctx, now) {
                if (is_state_expired(ctx.getCurrentState(), now)) {
                    // connecting expired, do it again
                    return true;
                }
                var status = ctx.getStatus();
                return !(PorterStatus.PREPARING.equals(status)
                    || PorterStatus.READY.equals(status));
            });
        },
        ///  Connected -> Handshaking
        ///  ~~~~~~~~~~~~~~~~~~~~~~~~
        ///  Do handshaking immediately after connected.
        ///
        ///  The session ID must be set, and the session key must be empty now.
        getConnectedHandshakingTransition: function () {
            return new StateTransition(StateOrder.HANDSHAKING, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    // FIXME: current user lost?
                    //        state will be changed to 'error'
                    return false;
                }
                var status = ctx.getStatus();
                return PorterStatus.READY.equals(status);
            });
        },
        ///  Connected -> Error
        ///  ~~~~~~~~~~~~~~~~~~
        ///  When connection lost.
        ///
        ///  The session ID must be set, and the session key must be empty now.
        getConnectedErrorTransition: function () {
            return new StateTransition(StateOrder.ERROR, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    // FIXME: current user lost?
                    return true;
                }
                var status = ctx.getStatus();
                return !PorterStatus.READY.equals(status);
            });
        },
        ///  Handshaking -> Running
        ///  ~~~~~~~~~~~~~~~~~~~~~~
        ///  When session key was set (handshake success).
        ///
        ///  The session ID must be set.
        getHandshakingRunningTransition: function () {
            return new StateTransition(StateOrder.RUNNING, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    // FIXME: current user lost?
                    //        state will be changed to 'error'
                    return false;
                }
                var status = ctx.getStatus();
                if (!PorterStatus.READY.equals(status)) {
                    // connection lost, state will be changed to 'error'
                    return false;
                }
                // when current user changed, the session key will cleared, so
                // if it's set again, it means handshake success
                return !!ctx.getSessionKey();
            });
        },
        ///  Handshaking -> Connected
        ///  ~~~~~~~~~~~~~~~~~~~~~~~~
        ///  When handshaking expired.
        ///
        ///  The session ID must be set, and the session key must be empty now.
        getHandshakingConnectedTransition: function () {
            return new StateTransition(StateOrder.CONNECTED, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    // FIXME: current user lost?
                    //        state will be changed to 'error'
                    return false;
                }
                var status = ctx.getStatus();
                if (!PorterStatus.READY.equals(status)) {
                    // connection lost, state will be changed to 'error'
                    return false;
                }
                if (!!ctx.getSessionKey()) {
                    // session key was set, state will be changed to 'running'
                    return false;
                }
                // handshake expired, do it again
                return is_state_expired(ctx.getCurrentState(), now);
            });
        },
        ///  Handshaking -> Error
        ///  ~~~~~~~~~~~~~~~~~~~~
        ///  When connection lost.
        ///
        ///  The session ID must be set, and the session key must be empty now.
        getHandshakingErrorTransition: function () {
            return new StateTransition(StateOrder.ERROR, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    // FIXME: current user lost?
                    //        state will be changed to 'error'
                    return true;
                }
                var status = ctx.getStatus();
                return !PorterStatus.READY.equals(status);
            });
        },
        ///  Running -> Default
        ///  ~~~~~~~~~~~~~~~~~~
        ///  When session id or session key was erased.
        ///
        ///  If session id was erased, it means user logout, the session key
        ///  must be removed at the same time;
        ///  If only session key was erased, but the session id kept the same,
        ///  it means force the user login again.
        getRunningDefaultTransition: function () {
            return new StateTransition(StateOrder.DEFAULT, function (ctx, now) {
                var status = ctx.getStatus();
                if (!PorterStatus.READY.equals(status)) {
                    // connection lost, state will be changed to 'error'
                    return false;
                }
                var session = ctx.getSession();
                return !(session && session.isReady());
                // if (!ctx.getSessionID()) {
                //     // user logout / switched?
                //     return true;
                // }
                // // force user login again?
                // return !ctx.getSessionKey();
            });
        },
        ///  Running -> Error
        ///  ~~~~~~~~~~~~~~~~
        ///  When connection lost.
        getRunningErrorTransition: function () {
            return new StateTransition(StateOrder.ERROR, function (ctx, now) {
                var status = ctx.getStatus();
                return !PorterStatus.READY.equals(status);
            });
        },
        ///  Error -> Default
        ///  ~~~~~~~~~~~~~~~~
        ///  When connection reset.
        getErrorDefaultTransition: function () {
            return new StateTransition(StateOrder.DEFAULT, function (ctx, now) {
                var status = ctx.getStatus();
                return !PorterStatus.ERROR.equals(status);
            });
        }
    });

    //-------- namespace --------
    ns.network.SessionStateTransition        = StateTransition;
    ns.network.SessionStateTransitionBuilder = TransitionBuilder;

})(DIMP);
