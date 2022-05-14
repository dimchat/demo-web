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

//! require 'wrapper.js'

(function (ns, sdk) {
    'use strict';

    var Dictionary = sdk.type.Dictionary;
    var MessageWrapper = ns.network.MessageWrapper;

    var MessageQueue = function () {
        this.__priorities = [];  // List[Integer]
        this.__fleets = new Dictionary();  // Integer => List[MessageWrapper]
    };
    sdk.Class(MessageQueue, null, null, null);

    /**
     *  Append message with departure ship
     *
     * @param {ReliableMessage|*} rMsg
     * @param {Departure|Ship} departureShip
     * @return {boolean}
     */
    MessageQueue.prototype.append = function (rMsg, departureShip) {
        var priority = departureShip.getPriority();
        // 1. choose an array with priority
        var queue = this.__fleets.getValue(priority);
        if (queue) {
            // 1.0. check duplicated
            var signature = rMsg.getValue('signature');
            var wrapper, item;
            for (var i = queue.length - 1; i >= 0; --i) {
                wrapper = queue[i];
                item = wrapper.getMessage();
                if (item && item.getValue('signature') === signature) {
                    // duplicated message
                    return true;
                }
            }
        } else {
            // 1.1. create new array for this priority
            queue = [];
            this.__fleets.setValue(priority, queue);
            // 1.2. insert the priority in a sorted list
            insert_priority(priority, this.__priorities);
        }
        queue.push(new MessageWrapper(rMsg, departureShip));
        return true;
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
        priorities.splice(index, 0, prior);
    };

    /**
     *  Get next message wrapper waiting to be sent
     *
     * @return {MessageWrapper|null}
     */
    MessageQueue.prototype.next = function () {
        var priority;
        var queue, wrapper;
        var i, j;
        for (i = 0; i < this.__priorities.length; ++i) {
            // 1. get tasks with priority
            priority = this.__priorities[i];
            queue = this.__fleets.getValue(priority);
            if (!queue) {
                continue;
            }
            // 2. seeking new task in this priority
            for (j = 0; j < queue.length; ++j) {
                wrapper = queue[j];
                if (wrapper.isVirgin()) {
                    // got it, mark sent
                    wrapper.mark();
                    return wrapper;
                }
            }
        }
        return null;
    };

    /**
     *  Remove message wrapper which message sent or expired
     *
     * @param {number} now - timestamp
     * @return {MessageWrapper|number}
     */
    MessageQueue.prototype.eject = function (now) {
        var priority;
        var queue, wrapper;
        var i, j;
        for (i = 0; i < this.__priorities.length; ++i) {
            // 1. get tasks with priority
            priority = this.__priorities[i];
            queue = this.__fleets.getValue(priority);
            if (!queue) {
                continue;
            }
            // 2. seeking new task in this priority
            for (j = 0; j < queue.length; ++j) {
                wrapper = queue[j];
                if (!wrapper.getMessage() || wrapper.isExpired(now)) {
                    // got it, remove from the queue
                    queue.splice(i, 1)
                    return wrapper;
                }
            }
        }
        return null;
    };

    MessageQueue.prototype.purge = function () {
        var count = 0;
        var now = (new Date()).getTime();
        var wrapper = this.eject(now);
        while (wrapper) {
            count += 1;
            // TODO: callback for failed task?
            wrapper = this.eject(now);
        }
        return count;
    };

    //-------- namespace --------
    ns.network.MessageQueue = MessageQueue;

    ns.network.registers('MessageQueue');

})(SECHAT, DIMSDK);
