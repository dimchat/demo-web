;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
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

(function (ns) {
    'use strict';

    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;

    /**
     *  Command message: {
     *      type : 0x88,
     *      sn   : 123,
     *
     *      command : "storage",
     *      title   : "key name",  // "contacts", "private_key", ...
     *
     *      data    : "...",       // base64_encode(symmetric)
     *      key     : "...",       // base64_encode(asymmetric)
     *
     *      // -- extra info
     *      //...
     *  }
     */
    var StorageCommand = function (info) {};
    ns.Interface(StorageCommand, [Command]);

    StorageCommand.STORAGE = 'storage';
    // storage titles (should be encrypted)
    StorageCommand.CONTACTS = 'contacts';
    StorageCommand.PRIVATE_KEY = 'private_key';

    /**
     *  Set storage title
     *
     * @param {String} title
     */
    StorageCommand.prototype.setTitle = function (title) {
        ns.assert(false, 'implement me!');
    };
    StorageCommand.prototype.getTitle = function () {
        ns.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Set user ID
     *
     * @param {ID} identifier
     */
    StorageCommand.prototype.setIdentifier = function (identifier) {
        ns.assert(false, 'implement me!');
    };
    StorageCommand.prototype.getIdentifier = function () {
        ns.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Set encrypted data
     *      (encrypted by a random password before upload)
     *
     * @param {Uint8Array} data
     */
    StorageCommand.prototype.setData = function (data) {
        ns.assert(false, 'implement me!');
    };
    StorageCommand.prototype.getData = function () {
        ns.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Set password (symmetric key) for decrypting data
     *      encrypted by user's public key before upload,
     *      this should be empty when the storage data is "private_key".
     *
     * @param {Uint8Array} data
     */
    StorageCommand.prototype.setKey = function (data) {
        ns.assert(false, 'implement me!');
    };
    StorageCommand.prototype.getKey = function () {
        ns.assert(false, 'implement me!');
        return null;
    };

    //
    //  Decryption
    //
    StorageCommand.prototype.decryptData = function (key) {
        ns.assert(false, 'implement me!');
        return null;
    };
    StorageCommand.prototype.decryptKey = function (privateKey) {
        ns.assert(false, 'implement me!');
        return null;
    };

    //-------- namespace --------
    ns.protocol.StorageCommand = StorageCommand;

    ns.protocol.registers('StorageCommand');

})(DIMSDK);

(function (ns) {
    'use strict';

    var SymmetricKey = ns.crypto.SymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var Base64 = ns.format.Base64;
    var ID = ns.protocol.ID;
    var StorageCommand = ns.protocol.StorageCommand;
    var BaseCommand = ns.dkd.BaseCommand;

    /**
     *  Create storage command
     *
     *  Usages:
     *      1. new BaseStorageCommand(map);
     *      2. new BaseStorageCommand(title);
     */
    var BaseStorageCommand = function (info) {
        if (typeof info === 'string') {
            // new BaseStorageCommand(title);
            BaseCommand.call(this, StorageCommand.STORAGE);
            this.setTitle(info);
        } else {
            // new BaseStorageCommand(map);
            BaseCommand.call(this, info);
        }
        // private properties
        this.__data = null;      // encrypted data
        this.__plaintext = null; // decrypted data
        this.__key = null;       // encrypted symmetric key data
        this.__password = null;  // symmetric key for data
    };
    ns.Class(BaseStorageCommand, BaseCommand, [StorageCommand], {

        // Override
        setTitle: function (title) {
            this.setValue('title', title);
        },

        // Override
        getTitle: function () {
            var title = this.getValue('title');
            if (title && title.length > 0) {
                return title;
            } else {
                // (compatible with v1.0)
                //  contacts command: {
                //      command : 'contacts',
                //      data    : '...',
                //      key     : '...'
                //  }
                return this.getCommand();
            }
        },

        // Override
        setIdentifier: function (identifier) {
            if (identifier && ns.Interface.conforms(identifier, ID)) {
                this.setValue('ID', identifier.toString());
            } else {
                this.setValue('ID', null);
            }
        },

        // Override
        getIdentifier: function () {
            return ID.parse(this.getValue('ID'));
        },

        // Override
        setData: function (data) {
            var base64 = null;
            if (data) {
                base64 = Base64.encode(data);
            }
            this.setValue('data', base64);
            this.__data = data;
            this.__plaintext = null;
        },

        // Override
        getData: function () {
            if (!this.__data) {
                var base64 = this.getValue('data');
                if (base64) {
                    this.__data = Base64.decode(base64);
                }
            }
            return this.__data;
        },

        // Override
        setKey: function (data) {
            var base64 = null;
            if (data) {
                base64 = Base64.encode(data);
            }
            this.setValue('key', base64);
            this.__key = data;
            this.__password = null;
        },

        // Override
        getKey: function () {
            if (!this.__key) {
                var base64 = this.getValue('key');
                if (base64) {
                    this.__key = Base64.decode(base64);
                }
            }
            return this.__key;
        },

        // Override
        decryptData: function (key) {
            if (!this.__plaintext) {
                // 1. get password for decrypting data
                var pwd = null;
                if (ns.Interface.conforms(key, PrivateKey)) {
                    // decrypt password with private key
                    pwd = this.decryptKey(key);
                    if (!pwd) {
                        throw new Error('failed to decrypt key: ' + key);
                    }
                } else if (ns.Interface.conforms(key, SymmetricKey)) {
                    pwd = key;
                } else {
                    throw new TypeError('Decryption key error: ' + key);
                }
                // 2. decrypt data with symmetric key
                var data = this.getData();
                this.__plaintext = pwd.decrypt(data);
            }
            return this.__plaintext;
        },

        // Override
        decryptKey: function (privateKey) {
            if (!this.__password) {
                var key = this.getKey();
                var data = privateKey.decrypt(key);
                var json = ns.format.UTF8.decode(data);
                var dict = ns.format.JSON.decode(json);
                this.__password = SymmetricKey.parse(dict);
            }
            return this.__password;
        }
    });

    //-------- namespace --------
    ns.dkd.BaseStorageCommand = BaseStorageCommand;

    ns.dkd.registers('BaseStorageCommand');

})(DIMSDK);
