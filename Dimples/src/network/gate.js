;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
//
//                               Written in 2024 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2024 Albert Moky
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
    var UTF8  = ns.format.UTF8;

    // var CommonGate   = ns.startrek.BaseGate;
    // var CommonGate   = ns.startrek.AutoGate;
    var CommonGate   = ns.startrek.WSClientGate;
    var PlainPorter  = ns.startrek.PlainPorter;
    var PlainArrival = ns.startrek.PlainArrival;

    var AckEnableGate = function (keeper) {
        CommonGate.call(this, keeper);
    };
    Class(AckEnableGate, CommonGate, null, {

        // Override
        createPorter: function (remote, local) {
            var docker = new AckEnablePorter(remote, local);
            docker.setDelegate(this.getDelegate());
            return docker
        }
    });

    var AckEnablePorter = function (remote, local) {
        PlainPorter.call(this, remote, local);
    };
    Class(AckEnablePorter, PlainPorter, null, {

        // Override
        checkArrival: function (income) {
            if (income instanceof PlainArrival) {
                var payload = income.getPayload();
                // check payload
                if (!payload || payload.length === 0) {
                    // return null;
                } else if (payload[0] === jsonBegin) {
                    var sig = fetchValue(payload, bytes('signature'));
                    var sec = fetchValue(payload, bytes('time'));
                    if (sig && sec) {
                        // respond
                        var signature = UTF8.decode(sig);
                        var timestamp = UTF8.decode(sec);
                        var text = 'ACK:{"time":' + timestamp + ',"signature":"' + signature + '"}';
                        // console.log('sending respond', text);
                        var priority = 1
                        this.send(bytes(text), priority);
                    }
                }
            }
            return PlainPorter.prototype.checkArrival(income);
        }
    });

    var jsonBegin = '{'.charCodeAt(0);

    var fetchValue = function (data, tag) {
        if (tag.length === 0) {
            return null;
        }
        // search tag
        var pos = find(data, tag, 0);
        if (pos < 0) {
            return null;
        } else {
            pos += tag.length;
        }
        // skip to start of value
        pos = find(data, bytes(':'), pos);
        if (pos < 0) {
            return null;
        } else {
            pos += 1;
        }
        // find end value
        var end = find(data, bytes(','), pos);
        if (end < 0) {
            end = find(data, bytes('}'), pos);
            if (end < 0) {
                return null;
            }
        }
        var value = data.subarray(pos, end);
        value = strip(value, bytes(' '));
        value = strip(value, bytes('"'));
        value = strip(value, bytes("'"));
        return value;
    };

    /**
     *  Convert text string
     *
     * @param {string} text
     * @return {Uint8Array}
     */
    var bytes = function (text) {
        return UTF8.encode(text);
    };

    /**
     *  Get first position of sub
     *
     * @param {Uint8Array} data
     * @param {Uint8Array} sub
     * @param {int} start
     * @return {int}
     */
    var find = function (data, sub, start) {
        if (!start) {
            start = 0;
        }
        var end = data.length - sub.length;
        var i, j;   // int
        var match;  // boolean
        for (i = start; i <= end; ++i) {
            match = true;
            for (j = 0; j < sub.length; ++j) {
                if (data[i + j] === sub[j]) {
                    continue;
                }
                match = false;
                break;
            }
            if (match) {
                return i;
            }
        }
        return -1;
    };

    var strip = function (data, removing) {
        data = stripRight(data, removing);
        return stripLeft(data, removing);
    };
    var stripLeft = function (data, leading) {
        var c = leading.length;
        if (c === 0) {
            return data;
        }
        var i;  // uint
        while (c <= data.length) {
            for (i = 0; i < c; ++i) {
                if (data[i] !== leading[i]) {
                    // not match
                    return data;
                }
            }
            // matched, remove the leading bytes
            data = data.subarray(c);
        }
        return data;
    };
    var stripRight = function (data, trailing) {
        var c = trailing.length;
        if (c === 0) {
            return data;
        }
        var i;  // uint
        var m = data.length - c;
        while (m >= 0) {
            for (i = 0; i < c; ++i) {
                if (data[m + i] !== trailing[i]) {
                    // not match
                    return data;
                }
            }
            // matched, remove the tailing bytes
            data = data.subarray(0, m);
            m -= c;
        }
        return data;
    };

    var DataUtils = {

        bytes: bytes,

        find: find,

        strip: strip,
        stripLeft: stripLeft,
        stripRight: stripRight
    };

    //-------- namespace --------
    ns.network.AckEnableGate   = AckEnableGate;
    ns.network.AckEnablePorter = AckEnablePorter;

    ns.utils.DataUtils = DataUtils;

})(DIMP);
