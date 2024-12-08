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

//! require 'base.js'

(function (ns) {
    'use strict';

    var Class           = ns.type.Class;
    var Meta            = ns.protocol.Meta;
    var DefaultMeta     = ns.mkm.DefaultMeta;
    var BTCMeta         = ns.mkm.BTCMeta;
    var ETHMeta         = ns.mkm.ETHMeta;
    var BaseMetaFactory = ns.mkm.GeneralMetaFactory;

    /**
     *  Compatible Meta factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var CompatibleMetaFactory = function (type) {
        BaseMetaFactory.call(this, type);
    };
    Class(CompatibleMetaFactory, BaseMetaFactory, null, {

        // Override
        createMeta: function(key, seed, fingerprint) {
            var out;
            var type = this.getType();
            if (type === Meta.MKM) {
                // MKM
                out = new DefaultMeta('1', key, seed, fingerprint);
            } else if (type === Meta.BTC) {
                // BTC
                out = new BTCMeta('2', key);
            } else if (type === Meta.ETH) {
                // ETH
                out = new ETHMeta('4', key);
            } else {
                // unknown type
                throw new TypeError('unknown meta type: ' + type);
            }
            return out;
        },

        // Override
        parseMeta: function(meta) {
            var out;
            var gf = general_factory();
            var type = gf.getMetaType(meta, '');
            if (type === '1' || type === 'mkm' || type === 'MKM') {
                // MKM
                out = new DefaultMeta(meta);
            } else if (type === '2' || type === 'btc' || type === 'BTC') {
                // BTC
                out = new BTCMeta(meta);
            } else if (type === '4' || type === 'eth' || type === 'ETH') {
                // ETH
                out = new ETHMeta(meta);
            } else {
                // unknown type
                throw new TypeError('unknown meta type: ' + type);
            }
            return out.isValid() ? out : null;
        }
    });

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
        var mkm = new CompatibleMetaFactory(Meta.MKM);
        var btc = new CompatibleMetaFactory(Meta.BTC);
        var eth = new CompatibleMetaFactory(Meta.ETH);

        Meta.setFactory("1", mkm);
        Meta.setFactory("2", btc);
        Meta.setFactory("4", eth);

        Meta.setFactory("mkm", mkm);
        Meta.setFactory("btc", btc);
        Meta.setFactory("eth", eth);

        Meta.setFactory("MKM", mkm);
        Meta.setFactory("BTC", btc);
        Meta.setFactory("ETH", eth);
    };

})(DIMP);
