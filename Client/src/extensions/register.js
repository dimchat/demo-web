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

!function (ns) {
    'use strict';

    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;

    var NetworkType = ns.protocol.NetworkType;
    var MetaType = ns.protocol.MetaType;
    var Meta = ns.Meta;
    var Profile = ns.Profile;

    var MetaCommand = ns.protocol.MetaCommand;
    var ProfileCommand = ns.protocol.ProfileCommand;

    var Facebook = ns.Facebook;
    var Messenger = ns.Messenger;

    var Register = function (type) {
        if (type) {
            this.network = type;
        } else {
            this.network = NetworkType.Main;
        }
        this.privateKey = null;
    };

    /**
     *  Generate user account
     *
     * @param name - nickname
     * @param avatar - URL
     * @returns {User}
     */
    Register.prototype.createUser = function (name, avatar) {
        // 1. generate private key
        var key = this.generatePrivateKey();
        // 2. generate meta
        var meta = this.generateMeta("web-demo");
        // 3. generate ID
        var identifier = this.generateIdentifier(meta, NetworkType.Main);
        // 4. generate profile
        var profile = this.createProfile(identifier, {name: name, avatar: avatar});
        // 5. save private key, meta & profile in local storage
        //    don't forget to upload them onto the DIM station
        var facebook = Facebook.getInstance();
        facebook.saveMeta(meta, identifier);
        facebook.savePrivateKey(key, identifier);
        facebook.saveProfile(profile);
        // 6. create user
        return facebook.getUser(identifier);
    };

    /**
     *  Generate group account
     *
     * @param name - group name
     * @param founder - founder ID
     * @returns {Group}
     */
    Register.prototype.createGroup = function (name, founder) {
        var facebook = Facebook.getInstance();
        // 1. get private key
        this.privateKey = facebook.getPrivateKeyForSignature(founder);
        // 2. generate meta
        var meta = this.generateMeta("group");
        // 3. generate ID
        var identifier = this.generateIdentifier(meta, NetworkType.Polylogue);
        // 4. generate profile
        var profile = this.createProfile(identifier, {name: name});
        // 5. save meta & profile in local storage
        //    don't forget to upload them onto the DIM station
        facebook.saveMeta(meta, identifier);
        facebook.saveProfile(profile);
        // 6. create group
        return facebook.getGroup(identifier);
    };

    //
    //  Step 1. generate private key (with asymmetric algorithm)
    //
    Register.prototype.generatePrivateKey = function (algorithm) {
        if (!algorithm) {
            algorithm = AsymmetricKey.RSA;
        }
        this.privateKey = PrivateKey.generate(algorithm);
        return this.privateKey;
    };

    //
    //  Step 2. generate meta with private key (and meta seed)
    //
    Register.prototype.generateMeta = function (seed) {
        if (!seed) {
            seed = 'anonymous';
        }
        return Meta.generate(MetaType.Default, this.privateKey, seed);
    };

    //
    //  Step 3. generate ID with meta (and network type)
    //
    Register.prototype.generateIdentifier = function (meta, type) {
        if (!type) {
            type = this.network;
        }
        return meta.generateIdentifier(type);
    };

    //
    //  Step 4. create profile with ID and sign with private key
    //
    Register.prototype.createProfile = function (identifier, properties) {
        var profile = Profile.getInstance({'ID': identifier});
        if (properties) {
            var keys = Object.keys(properties);
            var name, value;
            for (var i = 0; i < keys.length; ++i) {
                name = keys[i];
                value = properties[name];
                if (name && value) {
                    profile.setProperty(name, value);
                }
            }
        }
        profile.sign(this.privateKey);
        return profile;
    };

    //
    //  Step 5. upload meta & profile for ID
    //
    Register.prototype.upload = function (identifier, meta, profile) {
        var cmd;
        if (profile) {
            cmd = ProfileCommand.response(identifier, profile, meta);
        } else if (meta) {
            cmd = MetaCommand.response(identifier, meta);
        }
        return Messenger.getInstance().sendCommand(cmd);
    };

    //-------- namespace --------
    if (typeof ns.extensions !== 'object') {
        ns.extensions = {}
    }
    ns.extensions.Register = Register;

}(DIMP);
