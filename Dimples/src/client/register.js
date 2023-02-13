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
    var NetworkType = sdk.protocol.NetworkType;
    var MetaType = sdk.protocol.MetaType;
    var Meta = sdk.protocol.Meta;
    var BaseVisa = sdk.mkm.BaseVisa;
    var BaseBulletin = sdk.mkm.BaseBulletin;

    var get_facebook = function () {
        return ns.ClientFacebook.getInstance();
    };
    var get_messenger = function () {
        return ns.ClientMessenger.getInstance();
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
        var facebook = get_facebook();
        //
        //  Step 1. generate private key (with asymmetric algorithm)
        //
        var privateKey = PrivateKey.generate(PrivateKey.RSA);
        this.__privateKey = privateKey;
        //
        //  Step 2. generate meta with private key (and meta seed)
        //
        var meta = Meta.generate(MetaType.DEFAULT, privateKey, 'web-demo');
        //
        //  Step 3. generate ID with meta (and network type)
        //
        var uid = ID.generate(meta, NetworkType.MAIN, null);
        //
        //  Step 4. create document with ID and sign with private key
        //
        var pKey = privateKey.getPublicKey();
        var doc = this.createUserDocument(uid, name, avatar, pKey);
        //
        //  Step 5. save private key, meta & visa in local storage
        //          don't forget to upload them onto the DIM station
        //
        facebook.saveMeta(meta, uid);
        facebook.savePrivateKey(uid, privateKey, 'M', 0, 0);
        facebook.saveDocument(doc);
        //
        //  Step 6. create user with ID
        //
        return facebook.getUser(uid);
    };

    /**
     *  Generate group account
     *
     * @param {ID} founder - founder ID
     * @param {String} name - group name
     * @returns {Group}
     */
    Register.prototype.createGroup = function (founder, name) {
        var facebook = get_facebook();
        //
        //  Step 1. get private key for group founder
        //
        var privateKey = facebook.getPrivateKeyForVisaSignature(founder);
        this.__privateKey = privateKey;
        //
        //  Step 2. generate meta with private key (and meta seed)
        //
        var r = Math.ceil(Math.random() * 999990000) + 10000; // 10,000 ~ 999,999,999
        var meta = Meta.generate(MetaType.DEFAULT, privateKey, 'Group-' + r);
        //
        //  Step 3. generate ID with meta (and network type)
        //
        var gid = ID.generate(meta, NetworkType.POLYLOGUE, null);
        //
        //  Step 4. generate document
        //
        var doc = this.createGroupDocument(gid, name);
        //
        //  Step 5. save meta & document in local storage
        //          don't forget to upload them onto the DIM station
        //
        facebook.saveMeta(meta, gid);
        facebook.saveDocument(doc);
        //
        //  Step 6. add founder as first member
        //
        facebook.addMember(founder, gid);
        //
        //  Step 7. create group with ID
        //
        return facebook.getGroup(gid);
    };

    Register.prototype.createUserDocument = function (identifier, name, avatarUrl, pKey) {
        var doc = new BaseVisa(identifier);
        doc.setName(name);
        doc.setAvatar(avatarUrl);
        doc.setKey(pKey);
        doc.sign(this.__privateKey);
        return doc;
    };

    Register.prototype.createGroupDocument = function (identifier, name) {
        var doc = new BaseBulletin(identifier);
        doc.setName(name);
        doc.sign(this.__privateKey);
        return doc;
    };

    //
    //  Step 5. upload meta & document for ID
    //
    Register.prototype.upload = function (identifier, meta, doc) {
        if (!doc.getIdentifier().equals(identifier)) {
            throw new Error('document ID not match: '
                + identifier.toString() + ', ' + doc.toMap());
        }
        return get_messenger().postDocument(doc, meta);
    };

    //-------- namespace --------
    ns.Register = Register;

    ns.registers('Register');

})(SECHAT, DIMSDK);
