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

    var MessageQueue = function () {
        this.__queue = [];  // List[MessageWrapper]
    };
    sdk.Class(MessageQueue, null, null);

    MessageQueue.prototype.append = function (rMsg) {
        var wrapper = new ns.network.MessageWrapper(rMsg);
        this.__queue.push(wrapper);
        return true;
    };

    MessageQueue.prototype.shift = function () {
        if (this.__queue.length > 0) {
            return this.__queue.shift();
        } else {
            return null;
        }
    };

    MessageQueue.prototype.next = function () {
        var item;
        for (var i = 0; i < this.__queue.length; ++i) {
            item = this.__queue[i];
            if (item.isVirgin()) {
                item.mark();  // mark sent
                return item;
            }
        }
        return null;
    };

    MessageQueue.prototype.eject = function () {
        var item;
        for (var i = 0; i < this.__queue.length; ++i) {
            item = this.__queue[i];
            if (!item.getMessage() || item.isFailed()) {
                this.__queue.splice(i, 1)
                return item;
            }
        }
        return null;
    };

    //-------- namespace --------
    ns.network.MessageQueue = MessageQueue;

    ns.network.registers('MessageQueue');

})(SECHAT, DIMSDK);
