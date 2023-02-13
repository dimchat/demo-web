;
// license: https://mit-license.org
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

(function (ns, sdk) {
    'use strict';

    var Departure = sdk.startrek.port.Departure;

    var MessageWrapper = function (rMsg, departureShip) {
        this.__msg = rMsg;
        this.__ship = departureShip;
        this.__timestamp = 0;
    };
    sdk.Class(MessageWrapper, null, [Departure], null);

    MessageWrapper.EXPIRES = 600 * 1000;  // 10 minutes

    MessageWrapper.prototype.getMessage = function () {
        return this.__msg;
    };

    MessageWrapper.prototype.mark = function () {
        this.__timestamp = 1;
    };
    MessageWrapper.prototype.fail = function () {
        this.__timestamp = -1;
    };
    MessageWrapper.prototype.isVirgin = function () {
        return this.__timestamp === 0;
    };
    MessageWrapper.prototype.isExpired = function (now) {
        if (this.__timestamp < 0) {
            return true;
        } else if (this.__timestamp === 0) {
            return false;
        }
        var expired = this.__timestamp + MessageWrapper.EXPIRES;
        return now > expired;
    };

    //
    //  Departure Ship
    //

    // Override
    MessageWrapper.prototype.getSN = function () {
        return this.__ship.getSN();
    };

    // Override
    MessageWrapper.prototype.getPriority = function () {
        return this.__ship.getPriority();
    };

    // Override
    MessageWrapper.prototype.getFragments = function () {
        return this.__ship.getFragments();
    };

    // Override
    MessageWrapper.prototype.checkResponse = function (arrival) {
        return this.__ship.checkResponse(arrival);
    };

    // Override
    MessageWrapper.prototype.isNew = function () {
        return this.__ship.isNew();
    };

    // Override
    MessageWrapper.prototype.isDisposable = function () {
        return this.__ship.isDisposable();
    };

    // Override
    MessageWrapper.prototype.isTimeout = function (now) {
        return this.__ship.isTimeout(now);
    };

    // Override
    MessageWrapper.prototype.isFailed = function (now) {
        return this.__ship.isFailed(now);
    };

    // Override
    MessageWrapper.prototype.touch = function (now) {
        return this.__ship.touch(now);
    };

    //
    //  Callback
    //

    /**
     *  Message appended to outgoing queue
     */
    MessageWrapper.prototype.onAppended = function () {
        // this message was assigned to the worker of StarGate
        // update sent time
        this.__timestamp = (new Date()).getTime();
    };

    /**
     *  Gate error, failed to append
     */
    MessageWrapper.prototype.onGateError = function (error) {
        // failed
        this.__timestamp = -1;
    };

    MessageWrapper.prototype.onSent = function (docker) {
        // success, remove message
        this.__msg = null;
    };

    MessageWrapper.prototype.onFailed = function (error, docker) {
        // failed
        this.__timestamp = -1;
    };

    //-------- namespace --------
    ns.network.MessageWrapper = MessageWrapper;

    ns.network.registers('MessageWrapper');

})(SECHAT, DIMSDK);
