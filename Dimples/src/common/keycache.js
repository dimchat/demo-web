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

//! require <dimp.js>
//! require <sdk.js>
//! require <plugins.js>

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = ns.crypto.PlainKey;
    var CipherKeyDelegate = ns.CipherKeyDelegate;

    /**
     *  Symmetric Keys Cache
     *  ~~~~~~~~~~~~~~~~~~~~
     *  Manage keys for conversations
     */
    var KeyStore = function () {
        Object.call(this);
        // memory cache
        this.__keyMap = {};   // str(ID) => {str(ID) => map(SymmetricKey)}
        this.keyTable = null; // MsgKeyTable
    };
    Class(KeyStore, Object, [CipherKeyDelegate], null);

    // Override
    KeyStore.prototype.getCipherKey = function (sender, receiver, generate) {
        if (receiver.isBroadcast()) {
            // broadcast message has no key
            return PlainKey.getInstance();
        }
        var key;
        // try from memory cache
        var table = this.__keyMap[sender.toString()];
        if (table) {
            key = table[receiver.toString()];
            if (key) {
                return SymmetricKey.parse(key);
            }
        } else {
            table = {};
            this.__keyMap[sender.toString()] = table;
        }
        // try from database
        key = this.keyTable.getKey(sender, receiver);
        if (key) {
            // cache it
            table[receiver.toString()] = key.toMap();
        } else if (generate) {
            // generate new key and store it
            key = SymmetricKey.generate(SymmetricKey.AES);
            this.keyTable.addKey(sender, receiver, key);
            // cache it
            table[receiver.toString()] = key.toMap();
        }
        return key;
    };

    // Override
    KeyStore.prototype.cacheCipherKey = function (sender, receiver, key) {
        if (receiver.isBroadcast()) {
            // broadcast message has no key
            return;
        }
        // save into database
        if (this.keyTable.addKey(sender, receiver, key)) {
            // store into memory cache
            var table = this.__keyMap[sender.toString()];
            if (!table) {
                table = {};
                this.__keyMap[sender.toString()] = table;
            }
            table[receiver.toString()] = key.toMap();
        }
    };

    var s_cache = null;
    KeyStore.getInstance = function () {
        if (!s_cache) {
            s_cache = new KeyStore();
        }
        return s_cache;
    };

    //-------- namespace --------
    ns.KeyStore = KeyStore;

})(DIMP);
