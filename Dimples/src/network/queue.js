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

//! require 'wrapper.js'

(function (ns) {
    'use strict';

    var Class  = ns.type.Class;
    var Arrays = ns.type.Arrays;
    var Log    = ns.lnc.Log;

    var MessageWrapper = ns.network.MessageWrapper;

    var MessageQueue = function () {
        this.__priorities = [];  // List[Integer]
        this.__fleets = {};      // Integer => List[MessageWrapper]
    };
    Class(MessageQueue, null, null, null);

    /**
     *  Append message with departure ship
     *
     * @param {ReliableMessage|*} rMsg   - outgoing message
     * @param {Departure|Ship} departure - departure ship
     * @return {boolean} false on duplicated
     */
    MessageQueue.prototype.append = function (rMsg, departure) {
        var ok = true;
        // 1. choose an array with priority
        var priority = departure.getPriority();
        var array = this.__fleets[priority];
        if (!array || array.length === 0) {
            // 1.1. create new array for this priority
            array = [];
            this.__fleets[priority] = array;
            // 1.2. insert the priority in a sorted list
            insert_priority(priority, this.__priorities);
        } else {
            // 1.3. check duplicated
            var signature = rMsg.getValue('signature');
            var item;
            for (var i = array.length - 1; i >= 0; --i) {
                item = array[i].getMessage();
                if (item && is_duplicated(item, rMsg)) {
                    // duplicated message
                    Log.warning('[QUEUE] duplicated message', signature);
                    ok = false;
                    break;
                }
            }
        }
        if (ok) {
            // 2. append with wrapper
            array.push(new MessageWrapper(rMsg, departure));
        }
        return ok;
    };
    var is_duplicated = function (msg1, msg2) {
        var sig1 = msg1.getValue('signature');
        var sig2 = msg2.getValue('signature');
        if (!sig1 || !sig2) {
            return false;
        } else if (sig1 !== sig2) {
            return false;
        }
        // maybe it's a group message split for every members,
        // so we still need to check receiver here.
        var to1 = msg1.getReceiver();
        var to2 = msg2.getReceiver();
        return to1.equals(to2);
    };
    var insert_priority = function (prior, priorities) {
        var total = priorities.length;
        var value;
        var index = 0;
        // seeking position for new priority
        for (; index < total; ++index) {
            value = priorities[index];
            if (value === prior) {
                // duplicated
                return;
            } else if (value > prior) {
                // got it
                break;
            }
            // current value is smaller than the new value,
            // keep going
        }
        // insert new value before the bigger one
        Arrays.insert(priorities, index, prior);
        //priorities.splice(index, 0, prior);
    };

    /**
     *  Get next message wrapper waiting to be sent
     *
     * @return {MessageWrapper|null}
     */
    MessageQueue.prototype.next = function () {
        var priority;
        var array;
        for (var i = 0; i < this.__priorities.length; ++i) {
            // get first task
            priority = this.__priorities[i];
            array = this.__fleets[priority];
            if (array && array.length > 0) {
                return array.shift();
            }
        }
        return null;
    };

    MessageQueue.prototype.purge = function () {
        var priority;
        var array;
        for (var i = this.__priorities.length - 1; i >= 0; --i) {
            priority = this.__priorities[i];
            array = this.__fleets[priority];
            if (!array) {
                // the priority is empty
                this.__priorities.splice(i, 1);
            } else if (array.length === 0) {
                // this priority is empty
                delete this.__fleets[priority];
                this.__priorities.splice(i, 1);
            }
        }
        return null;
    };

    //-------- namespace --------
    ns.network.MessageQueue = MessageQueue;

})(DIMP);
