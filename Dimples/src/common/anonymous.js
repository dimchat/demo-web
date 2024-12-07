;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
//
//                               Written in 2021 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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
//! require <sdk.js>

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Hex = ns.format.Hex;
    var Base58 = ns.format.Base58;
    var EntityType = ns.protocol.EntityType;
    var ID = ns.protocol.ID;
    var BTCAddress = ns.mkm.BTCAddress;
    var ETHAddress = ns.mkm.ETHAddress;

    var Anonymous = {

        getName: function (identifier) {
            var name;
            if (Interface.conforms(identifier, ID)) {
                name = identifier.getName();
                if (!name || name.length === 0) {
                    name = get_name(identifier.getType());
                }
            } else {  // Address
                name = get_name(identifier.getType());
            }
            var number = this.getNumberString(identifier);
            return name + ' (' + number + ')';
        },

        getNumberString: function (address) {
            var str = '' + this.getNumber(address);
            while (str.length < 10) {
                str = '0' + str;
            }
            return str.substr(0, 3) + '-'
                + str.substr(3, 3) + '-'
                + str.substr(6);
        },

        getNumber: function (address) {
            if (Interface.conforms(address, ID)) {
                address = address.getAddress();
            }
            if (address instanceof BTCAddress) {
                return btc_number(address.toString());
            }
            if (address instanceof ETHAddress) {
                return eth_number(address.toString());
            }
            //throw new TypeError('address error: ' + address.toString());
            return 0;
        }
    };

    var get_name = function (type) {
        if (EntityType.BOT.equals(type)) {
            return 'Bot';
        }
        if (EntityType.STATION.equals(type)) {
            return 'Station';
        }
        if (EntityType.ISP.equals(type)) {
            return 'ISP';
        }
        if (EntityType.isUser(type)) {
            return 'User';
        }
        if (EntityType.isGroup(type)) {
            return 'Group';
        }
        return 'Unknown';
    };

    var btc_number = function (address) {
        var data = Base58.decode(address);
        return user_number(data);
    };
    var eth_number = function (address) {
        var data = Hex.decode(address.substr(2))
        return user_number(data);
    };
    var user_number = function (cc) {
        var len = cc.length;
        var c1 = cc[len-1] & 0xFF;
        var c2 = cc[len-2] & 0xFF;
        var c3 = cc[len-3] & 0xFF;
        var c4 = cc[len-4] & 0xFF;
        return (c1 | (c2 << 8) | (c3 << 16)) + c4 * 0x01000000;
    };

    //-------- namespace --------
    ns.Anonymous = Anonymous;

})(DIMP);
