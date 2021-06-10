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

    var NetworkType = sdk.protocol.NetworkType;
    var MetaType = sdk.protocol.MetaType;
    var Meta = sdk.protocol.Meta;
    var Document = sdk.protocol.Document;

    var get_facebook = function () {
        return ns.Facebook.getInstance();
    };
    var get_messenger = function () {
        return ns.Messenger.getInstance();
    };

    /**
     *  This is for generating user account, or creating group
     */
    var Register = function (type) {
        if (type) {
            this.network = type;
        } else {
            this.network = NetworkType.MAIN;
        }
        this.__privateKey = null;
    };

    /**
     *  Generate user account
     *
     * @param {String} name - nickname
     * @param {String} avatar - URL
     * @returns {User}
     */
    Register.prototype.createUser = function (name, avatar) {
        //
        //  Step 1. generate private key (with asymmetric algorithm)
        //
        this.__privateKey = PrivateKey.generate(PrivateKey.RSA);
        //
        //  Step 2. generate meta with private key (and meta seed)
        //
        var meta = Meta.generate(MetaType.DEFAULT, this.__privateKey, 'web-demo');
        //
        //  Step 3. generate ID with meta (and network type)
        //
        var identifier = meta.generateID(NetworkType.MAIN, null);
        //
        //  Step 4. create document with ID and sign with private key
        //
        var doc = this.createDocument(identifier, {name: name, avatar: avatar});
        // 5. save private key, meta & visa in local storage
        //    don't forget to upload them onto the DIM station
        var facebook = get_facebook();
        facebook.saveMeta(meta, identifier);
        facebook.savePrivateKey(identifier, this.__privateKey, 'M', 0, 0);
        facebook.saveDocument(doc);
        // 6. create user
        return facebook.getUser(identifier);
    };

    /**
     *  Generate group account
     *
     * @param {ID} founder - founder ID
     * @param {String} name - group name
     * @param {String} seed - group ID.seed
     * @returns {Group}
     */
    Register.prototype.createGroup = function (founder, name, seed) {
        if (!seed) {
            var r = Math.ceil(Math.random() * 999990000) + 10000; // 10,000 ~ 999,999,999
            seed = 'Group-' + r;
        }
        var facebook = get_facebook();
        // 1. get private key
        this.__privateKey = facebook.getPrivateKeyForVisaSignature(founder);
        // 2. generate meta
        var meta = Meta.generate(MetaType.DEFAULT, this.__privateKey, seed);
        // 3. generate ID
        var identifier = meta.generateID(NetworkType.POLYLOGUE, null);
        // 4. generate document
        var doc = this.createDocument(identifier, {name: name});
        // 5. save meta & document in local storage
        //    don't forget to upload them onto the DIM station
        facebook.saveMeta(meta, identifier);
        facebook.saveDocument(doc);
        // 6. add founder as first member
        facebook.addMember(founder, identifier);
        // 7. create group
        return facebook.getGroup(identifier);
    };

    Register.prototype.createDocument = function (identifier, properties) {
        var doc = Document.parse({'ID': identifier});
        if (properties) {
            var keys = Object.keys(properties);
            var name, value;
            for (var i = 0; i < keys.length; ++i) {
                name = keys[i];
                value = properties[name];
                if (name && value) {
                    doc.setProperty(name, value);
                }
            }
        }
        doc.sign(this.__privateKey);
        return doc;
    };

    //
    //  Step 5. upload meta & document for ID
    //
    Register.prototype.upload = function (identifier, meta, doc) {
        if (!doc.getIdentifier().equals(identifier)) {
            throw new Error('document ID not match: '
                + identifier.toString() + ', ' + doc.getMap());
        }
        return get_messenger().postDocument(doc, meta);
    };

    //-------- namespace --------
    ns.Register = Register;

    ns.register('Register');

})(SECHAT, DIMSDK);
