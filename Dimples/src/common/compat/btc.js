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

//! require <mkm.js>

//! require 'network.js'

(function (ns) {
    'use strict';

    var Class          = ns.type.Class;
    var Enum           = ns.type.Enum;
    var Base58         = ns.format.Base58;
    var SHA256         = ns.digest.SHA256;
    var RIPEMD160      = ns.digest.RIPEMD160;
    var EntityType     = ns.protocol.EntityType;
    var NetworkID      = ns.protocol.NetworkID;
    var BTCAddress     = ns.mkm.BTCAddress;

    /**
     *  Address like BitCoin
     *
     *      data format: "network+digest+code"
     *          network    --  1 byte
     *          digest     -- 20 bytes
     *          code       --  4 bytes
     *
     *      algorithm:
     *          fingerprint = PK.data
     *          digest      = ripemd160(sha256(fingerprint));
     *          code        = sha256(sha256(network + digest)).prefix(4);
     *          address     = base58_encode(network + digest + code);
     */
    var CompatibleBTCAddress = function (string, network) {
        BTCAddress.call(this, string, network);
    };
    Class(CompatibleBTCAddress, BTCAddress, null, {

        // Override
        isUser: function () {
            var type = NetworkID.getEntityType(this.getType());
            return EntityType.isUser(type);
        },

        // Override
        isGroup: function () {
            var type = NetworkID.getEntityType(this.getType());
            return EntityType.isGroup(type);
        }
    });

    /**
     *  Generate address with fingerprint and network ID
     *
     * @param {Uint8Array} fingerprint
     * @param {uint|Enum} network
     * @returns {CompatibleBTCAddress}
     */
    CompatibleBTCAddress.generate = function (fingerprint, network) {
        network = Enum.getInt(network);
        // 1. digest = ripemd160(sha256(fingerprint))
        var digest = RIPEMD160.digest(SHA256.digest(fingerprint));
        // 2. head = network + digest
        var head = [];
        head.push(network);
        for (var i = 0; i < digest.length; ++i) {
            head.push(digest[i]);
        }
        // 3. cc = sha256(sha256(head)).prefix(4)
        var cc = check_code(Uint8Array.from(head));
        // 4. data = base58_encode(head + cc)
        var data = [];
        for (var j = 0; j < head.length; ++j) {
            data.push(head[j]);
        }
        for (var k = 0; k < cc.length; ++k) {
            data.push(cc[k]);
        }
        return new CompatibleBTCAddress(Base58.encode(Uint8Array.from(data)), network);
    };

    /**
     *  Parse a string for BTC address
     *
     * @param {String} string - address string
     * @return {CompatibleBTCAddress} null on error
     */
    CompatibleBTCAddress.parse = function (string) {
        var len = string.length;
        if (len < 26 || len > 35) {
            return null;
        }
        // decode
        var data = Base58.decode(string);
        if (!data || data.length !== 25) {
            // throw new RangeError('address length error: ' + string);
            return null;
        }
        // check code
        var prefix = data.subarray(0, 21);
        var suffix = data.subarray(21, 25);
        var cc = check_code(prefix);
        if (ns.type.Arrays.equals(cc, suffix)) {
            return new CompatibleBTCAddress(string, data[0]);
        } else {
            return null;
        }
    };

    /**
     *  Get BTC check code
     *
     * @param {Uint8Array} data
     * @return {Uint8Array}
     */
    var check_code = function (data) {
        var sha256d = SHA256.digest(SHA256.digest(data));
        return sha256d.subarray(0, 4);
    };

    //-------- namespace --------
    ns.mkm.CompatibleBTCAddress = CompatibleBTCAddress;

})(DIMP);
