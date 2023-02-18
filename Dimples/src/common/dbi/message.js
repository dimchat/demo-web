;
// license: https://mit-license.org
//
//  DBI : Database Interface
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

//! require 'base.js'

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var CipherKeyDBI = ns.CipherKeyDelegate;

    /**
     *  Message DBI
     *  ~~~~~~~~~~~
     */
    var ReliableMessageDBI = Interface(null, null);

    /**
     *  Get network messages
     *
     * @param {ID} receiver  - actual receiver
     * @param {number} start - start position for loading message
     * @param {number} limit - max count for loading message
     * @return {[ReliableMessage[],number]} partial messages and remaining count, 0 means there are all messages cached
     */
    ReliableMessageDBI.prototype.getReliableMessages = function (receiver, start, limit) {
        throw new Error('NotImplemented');
    };

    /**
     *  Save network message
     *
     * @param {ID} receiver
     * @param {ReliableMessage} rMsg
     * @return {boolean} false on error
     */
    ReliableMessageDBI.prototype.cacheReliableMessage = function (receiver, rMsg) {
        throw new Error('NotImplemented');
    };

    /**
     *  Delete network message
     *
     * @param {ID} receiver
     * @param {ReliableMessage} rMsg
     * @return {boolean} false on error
     */
    ReliableMessageDBI.prototype.removeReliableMessage = function (receiver, rMsg) {
        throw new Error('NotImplemented');
    };

    //-------- namespace --------
    ns.dbi.ReliableMessageDBI = ReliableMessageDBI;
    ns.dbi.CipherKeyDBI = CipherKeyDBI;

})(DIMP);
