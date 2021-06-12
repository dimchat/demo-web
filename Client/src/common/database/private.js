;
// license: https://mit-license.org
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

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var PrivateKey = sdk.crypto.PrivateKey;
    var ID = sdk.protocol.ID;

    var Storage = sdk.dos.LocalStorage;

    ns.db.PrivateKeyTable = {

        META: 'M',
        VISA: 'V',

        /**
         *  Save private key for user
         *
         * @param {ID} user - user ID
         * @param {PrivateKey} key - private key
         * @param {String} type - 'M' for matching meta.key; or 'D' for matching visa.key
         * @param {int} sign - whether use for signature
         * @param {int} decrypt - whether use for decryption
         * @return {boolean} false on error
         */
        savePrivateKey: function (user, key, type, sign, decrypt) {
            this.load();
            this.__keys[get_tag(user, type)] = key;
            if (type === this.META) {
                this.__keys[get_tag(user, null)] = key;
            }
            return this.save();
        },

        /**
         *  Get private keys for user
         *
         * @param {ID} user - user ID
         * @return {DecryptKey[]} all keys marked for decryption
         */
        getPrivateKeysForDecryption: function (user) {
            this.load();
            var keys = [];
            var key0 = this.__keys[get_tag(user, null)];
            var key1 = this.__keys[get_tag(user, this.META)];
            var key2 = this.__keys[get_tag(user, this.VISA)];
            if (key2) {
                keys.push(key2);
            }
            if (key1 && keys.indexOf(key1) < 0) {
                keys.push(key1);
            }
            if (key0 && keys.indexOf(key0) < 0) {
                keys.push(key0);
            }
            return keys;
        },

        /**
         *  Get private key for user
         *
         * @param {ID} user - user ID
         * @return {PrivateKey} first key marked for signature
         */
        getPrivateKeyForSignature: function (user) {
            return this.getPrivateKeyForVisaSignature(user);
        },

        /**
         *  Get private key for user
         *
         * @param {ID} user - user ID
         * @return {PrivateKey} the private key matched with meta.key
         */
        getPrivateKeyForVisaSignature: function (user) {
            this.load();
            var key = this.__keys[get_tag(user, this.META)];
            if (!key) {
                key = this.__keys[get_tag(user, null)];
            }
            return key;
        },

        load: function () {
            if (!this.__keys) {
                this.__keys = convert(Storage.loadJSON('PrivateTable'));
            }
        },
        save: function () {
            return Storage.saveJSON(revert(this.__keys), 'PrivateTable');
        },

        __keys: null  // String => PrivateKey
    };

    var get_tag = function (identifier, type) {
        if (!type || type.length === 0) {
            return identifier.toString();
        }
        var terminal = identifier.getTerminal();
        if (terminal && terminal.length > 0) {
            return identifier.toString() + '#' + type;
        } else {
            return identifier.toString() + '/' + type;
        }
    };

    var convert = function (map) {
        var results = {};
        if (map) {
            var tag;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                tag = list[i];
                results[tag] = PrivateKey.parse(map[tag]);
            }
        }
        return results;
    };
    var revert = function (map) {
        var results = {};
        if (map) {
            var tag;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                tag = list[i];
                results[tag] = map[tag].getMap();
            }
        }
        return results;
    };

})(SECHAT, DIMSDK);
