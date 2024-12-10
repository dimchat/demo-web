;
// license: https://mit-license.org
//
//  DIMP : Decentralized Instant Messaging Protocol
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

    var Interface = ns.type.Interface;
    var ID        = ns.protocol.ID;
    var Command   = ns.protocol.Command;

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
    var StorageCommand = Interface(null, [Command]);

    Command.STORAGE = 'storage';
    // storage titles (should be encrypted)
    Command.CONTACTS = 'contacts';
    Command.PRIVATE_KEY = 'private_key';

    /**
     *  Set storage title
     *
     * @param {string} title
     */
    StorageCommand.prototype.setTitle = function (title) {};
    StorageCommand.prototype.getTitle = function () {};

    /**
     *  Set user ID
     *
     * @param {ID} identifier
     */
    StorageCommand.prototype.setIdentifier = function (identifier) {};
    StorageCommand.prototype.getIdentifier = function () {};

    /**
     *  Set encrypted data
     *      (encrypted by a random password before upload)
     *
     * @param {Uint8Array} data
     */
    StorageCommand.prototype.setData = function (data) {};
    StorageCommand.prototype.getData = function () {};

    /**
     *  Decryption
     *
     * @param {SymmetricKey|PrivateKey} key
     */
    StorageCommand.prototype.decrypt = function (key) {};

    /**
     *  Set password (symmetric key) for decrypting data
     *      encrypted by user's public key before upload,
     *      this should be empty when the storage data is "private_key".
     *
     * @param {Uint8Array} data
     */
    StorageCommand.prototype.setKey = function (data) {};
    StorageCommand.prototype.getKey = function () {};

    //-------- namespace --------
    ns.protocol.StorageCommand = StorageCommand;

})(DIMP);

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Class     = ns.type.Class;

    var DecryptKey   = ns.crypto.DecryptKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PrivateKey   = ns.crypto.PrivateKey;

    var Base64 = ns.format.Base64;
    var JsON   = ns.format.JSON;
    var UTF8   = ns.format.UTF8;

    var ID             = ns.protocol.ID;
    var Command        = ns.protocol.Command;
    var StorageCommand = ns.protocol.StorageCommand;

    var BaseCommand = ns.dkd.cmd.BaseCommand;

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
            BaseCommand.call(this, Command.STORAGE);
            this.setValue('string', info);
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
    Class(BaseStorageCommand, BaseCommand, [StorageCommand], {

        // Override
        setTitle: function (title) {
            this.setValue('title', title);
        },

        // Override
        getTitle: function () {
            return this.getString('title', null);
        },

        // Override
        setIdentifier: function (identifier) {
            this.setString('ID', identifier);
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
            if (this.__data === null) {
                var base64 = this.getString('data', null);
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
            if (this.__key === null) {
                var base64 = this.getValue('key');
                if (base64) {
                    this.__key = Base64.decode(base64);
                }
            }
            return this.__key;
        },

        // Override
        decrypt: function (key) {
            // 1. decrypt password with private key
            if (Interface.conforms(key, PrivateKey)) {
                return decrypt_password_by_private_key.call(this, key);
            }
            // 2. decrypt data with password (symmetric key)
            if (Interface.conforms(key, SymmetricKey)) {
                return decrypt_data_by_symmetric_key.call(this, key);
            }
            throw new TypeError('key error: ' + key);
        }
    });

    // public byte[] decrypt(PrivateKey privateKey)
    var decrypt_password_by_private_key = function (privateKey) {
        if (this.__password === null) {
            if (Interface.conforms(privateKey, DecryptKey)) {
                this.__password = decrypt_symmetric_key.call(this, privateKey);
            } else {
                throw new TypeError('private key error: ' + privateKey);
            }
        }
        return decrypt_data_by_symmetric_key.call(this, this.__password);
    };

    // public byte[] decrypt(SymmetricKey key)
    var decrypt_data_by_symmetric_key = function (password) {
        if (this.__plaintext === null) {
            if (!password) {
                throw new Error('symmetric key empty');
            }
            var data = this.getData();
            if (data) {
                this.__plaintext = password.decrypt(data, this.toMap());
            }
        }
        return this.__plaintext;
    };

    // private SymmetricKey decryptKey(DecryptKey privateKey)
    var decrypt_symmetric_key = function (decryptKey) {
        var data = this.getKey();
        if (!data) {
            return;
        }
        var key = decryptKey.decrypt(data, this.toMap());
        if (!key) {
            throw new Error('failed to decrypt key');
        }
        var info = JsON.decode(UTF8.decode(key));
        return SymmetricKey.parse(info);
    };

    //-------- namespace --------
    ns.dkd.cmd.BaseStorageCommand = BaseStorageCommand;

})(DIMP);
