;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
//
//                               Written in 2023 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2023 Albert Moky
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

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Interface = ns.type.Interface;
    var Stringer = ns.type.Stringer;
    var Departure = ns.startrek.port.Departure;

    /**
     *  Frequency checker for duplicated queries
     */
    var FrequencyChecker = function (lifespan) {
        this.__records = {};        // string => timestamp
        this.__expires = lifespan;  // milliseconds
    };
    Class(FrequencyChecker, null, [Departure], null);

    FrequencyChecker.prototype.isExpired = function (key, now) {
        if (Interface.conforms(key, Stringer)) {
            key = key.toString();
        }
        if (!now || now <= 0) {
            now = (new Date()).getTime();
        }
        var value = this.__records[key];
        if (value && value > now) {
            // record exists and not expired yet
            return false;
        }
        this.__records[key] = now + this.__expires;
        return true;
    };

    var QueryFrequencyChecker = {

        isMetaQueryExpired: function (identifier, now) {
            return this.metaQueries.isExpired(identifier, now);
        },
        metaQueries: new FrequencyChecker(this.QUERY_EXPIRES),

        isDocumentQueryExpired: function (identifier, now) {
            return this.documentQueries.isExpired(identifier, now);
        },
        documentQueries: new FrequencyChecker(this.QUERY_EXPIRES),

        isMembersQueryExpired: function (identifier, now) {
            return this.membersQueries.isExpired(identifier, now);
        },
        membersQueries: new FrequencyChecker(this.QUERY_EXPIRES),

        // each query will be expired after 10 minutes
        QUERY_EXPIRES: 600 * 1000
    };

    //-------- namespace --------
    ns.mem.FrequencyChecker = FrequencyChecker;
    ns.mem.QueryFrequencyChecker = QueryFrequencyChecker;

})(SECHAT);
