;
// license: https://mit-license.org
//
//  Ming-Ke-Ming : Decentralized User Identity Authentication
//
//                               Written in 2024 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2024 Albert Moky
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

//! require 'compatible.js'
//! require 'btc.js'

(function (ns) {
    'use strict';

    var Class             = ns.type.Class;
    var Enum              = ns.type.Enum;
    var TransportableData = ns.format.TransportableData;

    var Meta                 = ns.protocol.Meta;
    var MetaType             = ns.protocol.MetaType;
    var BaseMeta             = ns.mkm.BaseMeta;
    var ETHMeta              = ns.mkm.ETHMeta;
    var CompatibleBTCAddress = ns.mkm.CompatibleBTCAddress;

    /**
     *  Default Meta to build ID with 'name@address'
     *
     *  version:
     *      0x01 - MKM
     *
     *  algorithm:
     *      CT      = fingerprint; // or key.data for BTC address
     *      hash    = ripemd160(sha256(CT));
     *      code    = sha256(sha256(network + hash)).prefix(4);
     *      address = base58_encode(network + hash + code);
     *      number  = uint(code);
     */
    var DefaultMeta = function () {
        if (arguments.length === 1) {
            // new DefaultMeta(map);
            BaseMeta.call(this, arguments[0]);
        } else if (arguments.length === 4) {
            // new DefaultMeta(type, key, seed, fingerprint);
            BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3]);
        } else {
            throw new SyntaxError('Default meta arguments error: ' + arguments);
        }
        // memory cache
        this.__addresses = {};  // uint -> Address
    };
    Class(DefaultMeta, BaseMeta, null, {

        // Override
        generateAddress: function (network) {
            network = Enum.getInt(network);
            // check cache
            var address = this.__addresses[network];
            if (!address) {
                // generate and cache it
                address = CompatibleBTCAddress.generate(this.getFingerprint(), network);
                this.__addresses[network] = address;
            }
            return address;
        }
    });

    /**
     *  Meta to build BTC address for ID
     *
     *  version:
     *      0x02 - BTC
     *      0x03 - ExBTC
     *
     *  algorithm:
     *      CT      = key.data;
     *      hash    = ripemd160(sha256(CT));
     *      code    = sha256(sha256(network + hash)).prefix(4);
     *      address = base58_encode(network + hash + code);
     */
    var BTCMeta = function () {
        if (arguments.length === 1) {
            // new BTCMeta(map);
            BaseMeta.call(this, arguments[0]);
        } else if (arguments.length === 2) {
            // new BTCMeta(type, key);
            BaseMeta.call(this, arguments[0], arguments[1]);
        } else if (arguments.length === 4) {
            // new BTCMeta(type, key, seed, fingerprint);
            BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3]);
        } else {
            throw new SyntaxError('BTC meta arguments error: ' + arguments);
        }
        // memory cache
        this.__address = null;  // cached address
    };
    Class(BTCMeta, BaseMeta, null, {

        // Override
        generateAddress: function (network) {
            network = Enum.getInt(network);
            // check cache
            var address = this.__address;
            if (!address || address.getType() !== network) {
                // TODO: compress public key?
                var key = this.getPublicKey();
                var fingerprint = key.getData();
                // generate and cache it
                address = CompatibleBTCAddress.generate(fingerprint, network);
                this.__address = address;
            }
            return address;
        }
    });

    /**
     *  Compatible Meta factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var CompatibleMetaFactory = function (version) {
        Object.call(this);
        this.__type = version;
    };
    Class(CompatibleMetaFactory, Object, [Meta.Factory], null);

    // Override
    CompatibleMetaFactory.prototype.createMeta = function(key, seed, fingerprint) {
        if (MetaType.MKM.equals(this.__type)) {
            // MKM
            return new DefaultMeta(this.__type, key, seed, fingerprint);
        } else if (MetaType.BTC.equals(this.__type)) {
            // BTC
            return new BTCMeta(this.__type, key);
        } else if (MetaType.ExBTC.equals(this.__type)) {
            // ExBTC
            return new BTCMeta(this.__type, key, seed, fingerprint);
        } else if (MetaType.ETH.equals(this.__type)) {
            // ETH
            return new ETHMeta(this.__type, key);
        } else if (MetaType.ExETH.equals(this.__type)) {
            // ExETH
            return new ETHMeta(this.__type, key, seed, fingerprint);
        } else {
            // unknown type
            return null;
        }
    };

    // Override
    CompatibleMetaFactory.prototype.generateMeta = function(sKey, seed) {
        var fingerprint = null;
        if (seed && seed.length > 0) {
            var sig = sKey.sign(ns.format.UTF8.encode(seed));
            fingerprint = TransportableData.create(sig);
        }
        var pKey = sKey.getPublicKey();
        return this.createMeta(pKey, seed, fingerprint);
    };

    // Override
    CompatibleMetaFactory.prototype.parseMeta = function(meta) {
        var out;
        var gf = general_factory();
        var type = gf.getMetaType(meta, 0);
        if (MetaType.MKM.equals(type)) {
            // MKM
            out = new DefaultMeta(meta);
        } else if (MetaType.BTC.equals(type)) {
            // BTC
            out = new BTCMeta(meta);
        } else if (MetaType.ExBTC.equals(type)) {
            // ExBTC
            out = new BTCMeta(meta);
        } else if (MetaType.ETH.equals(type)) {
            // ETH
            out = new ETHMeta(meta);
        } else if (MetaType.ExETH.equals(type)) {
            // ExETH
            out = new ETHMeta(meta);
        } else {
            // unknown type
            throw new TypeError('unknown meta type: ' + type);
        }
        return out.isValid() ? out : null;
    };

    var general_factory = function () {
        var man = ns.mkm.AccountFactoryManager;
        return man.generalFactory;
    };

    //-------- namespace --------
    ns.registerCompatibleMetaFactory = function () {
        /**
         *  Register Compatible Meta Factory
         *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         */
        Meta.setFactory(MetaType.MKM, new CompatibleMetaFactory(MetaType.MKM));
        Meta.setFactory(MetaType.BTC, new CompatibleMetaFactory(MetaType.BTC));
        Meta.setFactory(MetaType.ExBTC, new CompatibleMetaFactory(MetaType.ExBTC));
    };

})(DIMP);
