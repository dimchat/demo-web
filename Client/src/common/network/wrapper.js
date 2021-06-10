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

    var Ship = sdk.startrek.Ship;
    var Callback = sdk.Callback;

    var MessageWrapper = function (rMsg) {
        this.__msg = rMsg;
        this.__timestamp = 0;
    };
    sdk.Class(MessageWrapper, null, [Ship.Delegate, Callback]);

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
    MessageWrapper.prototype.isFailed = function () {
        if (this.__timestamp < 0) {
            return true;
        } else if (this.__timestamp === 0) {
            return false;
        }
        var now = new Date();
        return now.getTime() - this.__timestamp > ns.BaseSession.EXPIRES;
    };

    //
    //  Ship Delegate
    //
    MessageWrapper.prototype.onShipSent = function (ship, error) {
        if (error) {
            // failed
            this.__timestamp = -1;
        } else {
            // success, remove message
            this.__msg = null;
        }
    };

    //
    //  Messenger Callback
    //
    MessageWrapper.prototype.onFinished = function (result, error) {
        if (error) {
            // failed
            this.__timestamp = -1;
        } else {
            // this message was assigned to the worker of StarGate,
            // update sent time
            this.__timestamp = (new Date()).getTime();
        }
    };


    //-------- namespace --------
    ns.MessageWrapper = MessageWrapper;

    ns.registers('MessageWrapper');

})(SECHAT, DIMSDK);
