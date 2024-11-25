;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
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

//! require <dimsdk.js>

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Departure = ns.startrek.port.Departure;

    var MessageWrapper = function (rMsg, departure) {
        this.__msg = rMsg;
        this.__ship = departure;
    };
    Class(MessageWrapper, null, [Departure], null);

    MessageWrapper.prototype.getMessage = function () {
        return this.__msg;
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
    MessageWrapper.prototype.isImportant = function () {
        return this.__ship.isImportant();
    };

    // Override
    MessageWrapper.prototype.touch = function (now) {
        return this.__ship.touch(now);
    };

    // Override
    MessageWrapper.prototype.getStatus = function (now) {
        return this.__ship.getStatus(now);
    };

    //-------- namespace --------
    ns.network.MessageWrapper = MessageWrapper;

})(DIMP);
