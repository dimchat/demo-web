;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
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

//! require 'dbi/*.js'

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var DecryptKey = ns.crypto.DecryptKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var Storage = ns.dos.LocalStorage;
    var PrivateKeyDBI = ns.dbi.PrivateKeyDBI;

    var id_key_path = function (user) {
        return 'pri.' + user.getAddress().toString() + '.secret';
    };
    var msg_keys_path = function (user) {
        return 'pri.' + user.getAddress().toString() + '.secret_keys';
    };

    /**
     *  Private Key Storage
     *  ~~~~~~~~~~~~~~~~~~~
     *
     *  (1) Identify Key - paired to meta.key, CONSTANT
     *      storage path: 'dim.fs.pri.{ADDRESS}.secret'
     *  (2) Message Keys - paired to visa.key, VOLATILE
     *      storage path: 'dim.fs.pri.{ADDRESS}.secret_keys'
     */
    var PrivateKeyStorage = function () {
        Object.call(this);
    };
    Class(PrivateKeyStorage, Object, [PrivateKeyDBI], {

        // Override
        savePrivateKey: function (key, type, user) {
            if (type === PrivateKeyDBI.META) {
                // save private key for meta
                return this.saveIdKey(key, user);
            } else {
                // save private key for visa
                return this.saveMsgKey(key, user);
            }
        },

        // Override
        getPrivateKeysForDecryption: function (user) {
            var privateKeys = this.loadMsgKeys(user);
            // the 'ID key' could be used for encrypting message too (RSA),
            // so we append it to the decrypt keys here
            var idKey = this.loadIdKey(user);
            if (Interface.conforms(idKey, DecryptKey)) {
                if (PrivateKeyStorage.findKey(idKey, privateKeys) < 0) {
                    privateKeys.push(idKey);
                }
            }
            return privateKeys;
        },

        // Override
        getPrivateKeyForSignature: function (user) {
            // TODO:
            return this.getPrivateKeyForVisaSignature(user);
        },

        // Override
        getPrivateKeyForVisaSignature: function (user) {
            return this.loadIdKey(user);
        }
    });

    // protected
    PrivateKeyStorage.prototype.loadIdKey = function (user) {
        var path = id_key_path(user);
        var info = Storage.loadJSON(path);
        return PrivateKey.parse(info);
    };
    // protected
    PrivateKeyStorage.prototype.saveIdKey = function (key, user) {
        var path = id_key_path(user);
        return Storage.saveJSON(key.toMap(), path);
    };

    // protected
    PrivateKeyStorage.prototype.loadMsgKeys = function (user) {
        var privateKeys = [];
        var path = msg_keys_path(user);
        var array = Storage.loadJSON(path);
        if (array) {
            var key;
            for (var i = 0; i < array.length; ++i) {
                key = PrivateKey.parse(array[i]);
                if (key) {
                    privateKeys.push(key);
                }
            }
        }
        return privateKeys;
    };
    // protected
    PrivateKeyStorage.prototype.saveMsgKey = function (key, user) {
        var privateKeys = this.loadMsgKeys(user);
        privateKeys = PrivateKeyStorage.insertKey(key, privateKeys);
        if (!privateKeys) {
            // nothing changed
            return false;
        }
        var plain = PrivateKeyStorage.revertPrivateKeys(privateKeys);
        var path = msg_keys_path(user);
        return Storage.saveJSON(plain, path);
    };

    PrivateKeyStorage.revertPrivateKeys = function (privateKeys) {
        var array = [];
        for (var i = 0; i < privateKeys.length; ++i) {
            array.push(privateKeys[i].toMap());
        }
        return array;
    };
    PrivateKeyStorage.insertKey = function (key, privateKeys) {
        var index = PrivateKeyStorage.findKey(key, privateKeys);
        if (index === 0) {
            // nothing change
            return null;
        } else if (index > 0) {
            // move to the front
            privateKeys.splice(index, 1);
        } else if (privateKeys.length > 2) {
            // keep only last three records
            privateKeys.pop();
        }
        privateKeys.unshift(key);
        return privateKeys;
    };
    PrivateKeyStorage.findKey = function (key, privateKeys) {
        var data = key.getString('data');
        for (var i = 0; i < privateKeys.length; ++i) {
            if (privateKeys[i].getString('data') === data) {
                return i;
            }
        }
        return -1;
    };

    //-------- namespace --------
    ns.database.PrivateKeyStorage = PrivateKeyStorage;

})(DIMP);
