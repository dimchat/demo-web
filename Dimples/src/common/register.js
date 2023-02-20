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

//! require 'db/*.js'

(function (ns) {
    'use strict';

    var PrivateKey = ns.crypto.PrivateKey;
    var ID = ns.protocol.ID;
    var EntityType = ns.protocol.EntityType;
    var MetaType = ns.protocol.MetaType;
    var Meta = ns.protocol.Meta;
    var BaseVisa = ns.mkm.BaseVisa;
    var BaseBulletin = ns.mkm.BaseBulletin;

    /**
     *  This is for generating user account, or creating group
     */
    var Register = function (db) {
        this.__db = db;
    };

    /**
     *  Generate user account
     *
     * @param {string} nickname - user name
     * @param {string} avatar   - photo URL
     * @returns {User}
     */
    Register.prototype.createUser = function (nickname, avatar) {
        //
        //  Step 1. generate private key (with asymmetric algorithm)
        //
        var privateKey = PrivateKey.generate(PrivateKey.RSA);
        //
        //  Step 2. generate meta with private key (and meta seed)
        //
        var meta = Meta.generate(MetaType.DEFAULT, privateKey, 'web-demo');
        //
        //  Step 3. generate ID with meta (and network type)
        //
        var uid = ID.generate(meta, EntityType.USER, null);
        //
        //  Step 4. generate visa with ID and sign with private key
        //
        var pKey = privateKey.getPublicKey();
        var doc = createVisa(uid, nickname, avatar, pKey, privateKey);
        //
        //  Step 5. save private key, meta & visa in local storage
        //          don't forget to upload them onto the DIM station
        //
        this.__db.saveMeta(meta, uid);
        this.__db.savePrivateKey(privateKey, 'M', uid);
        this.__db.saveDocument(doc);
        return uid;
    };

    /**
     *  Generate group account
     *
     * @param {ID} founder   - founder ID
     * @param {String} title - group name
     * @returns {Group}
     */
    Register.prototype.createGroup = function (founder, title) {
        var r = Math.ceil(Math.random() * 999990000) + 10000; // 10,000 ~ 999,999,999
        var seed = 'Group-' + r;
        //
        //  Step 1. get private key for group founder
        //
        var privateKey = this.__db.getPrivateKeyForVisaSignature(founder);
        //
        //  Step 2. generate meta with private key (and meta seed)
        //
        var meta = Meta.generate(MetaType.DEFAULT, privateKey, seed);
        //
        //  Step 3. generate ID with meta (and network type)
        //
        var gid = ID.generate(meta, EntityType.GROUP, null);
        //
        //  Step 4. generate bulletin with ID and sign with founder's private key
        //
        var doc = createBulletin(gid, title, privateKey);
        //
        //  Step 5. save meta & document in local storage
        //          don't forget to upload them onto the DIM station
        //
        this.__db.saveMeta(meta, gid);
        this.__db.saveDocument(doc);
        //
        //  Step 6. add founder as first member
        //
        this.__db.addMember(founder, gid);
        return gid;
    };

    var createVisa = function (identifier, name, avatarUrl, pKey, sKey) {
        var doc = new BaseVisa(identifier);
        doc.setName(name);
        doc.setAvatar(avatarUrl);
        doc.setKey(pKey);
        doc.sign(sKey);
        return doc;
    };

    var createBulletin = function (identifier, name, sKey) {
        var doc = new BaseBulletin(identifier);
        doc.setName(name);
        doc.sign(sKey);
        return doc;
    };

    //-------- namespace --------
    ns.Register = Register;

})(DIMP);
