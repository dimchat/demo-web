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
//! require 'network.js'
//! require 'btc.js'

(function (ns) {
    'use strict';

    var Class      = ns.type.Class;
    var NetworkID  = ns.protocol.NetworkID;
    var ID         = ns.protocol.ID;
    var Identifier = ns.mkm.Identifier;
    var IDFactory  = ns.mkm.GeneralIdentifierFactory;

    /**
     *  ID for entity (User/Group)
     *
     *      data format: "name@address[/terminal]"
     *
     *      fields:
     *          name     - entity name, the seed of fingerprint to build address
     *          address  - a string to identify an entity
     *          terminal - entity login resource(device), OPTIONAL
     */
    var EntityID = function (identifier, name, address, terminal) {
        Identifier.call(this, identifier, name, address, terminal);
    };
    Class(EntityID, Identifier, null, {

        // Override
        getType: function () {
            var network = this.getAddress().getType();
            // compatible with MKM 0.9.*
            return NetworkID.getEntityType(network);
        }
    });

    /**
     *  EntityID Factory
     *  ~~~~~~~~~~~~~~~~
     */
    var EntityIDFactory = function () {
        IDFactory.call(this);
    };
    Class(EntityIDFactory, IDFactory, null, {

        // Override
        newID: function (string, name, address, terminal) {
            return new EntityID(string, name, address, terminal);
        },

        // Override
        parse: function (identifier) {
            if (!identifier) {
                throw new ReferenceError('ID empty');
            }
            var len = identifier.length;
            if (len === 15 && identifier.toLowerCase() === 'anyone@anywhere') {
                return ID.ANYONE;
            } else if (len === 19 && identifier.toLowerCase() === 'everyone@everywhere') {
                return ID.EVERYONE;
            } else if (len === 13 && identifier.toLowerCase() === 'moky@anywhere') {
                return ID.FOUNDER;
            }
            return IDFactory.prototype.parse.call(this, identifier);
        }
    });

    //-------- namespace --------
    ns.registerEntityIDFactory = function () {
        /**
         *  Register EntityID Factory
         *  ~~~~~~~~~~~~~~~~~~~~~~~~~
         */
        ID.setFactory(new EntityIDFactory());
    };

})(DIMP);

(function (ns) {
    'use strict';

    var Class                = ns.type.Class;
    var Address              = ns.protocol.Address;
    var BaseAddressFactory   = ns.mkm.BaseAddressFactory;
    var CompatibleBTCAddress = ns.mkm.CompatibleBTCAddress;
    var ETHAddress           = ns.mkm.ETHAddress;

    /**
     *  Compatible Address Factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    var CompatibleAddressFactory = function () {
        BaseAddressFactory.call(this);
    };
    Class(CompatibleAddressFactory, BaseAddressFactory, null, {

        // Override
        createAddress: function(address) {
            if (!address) {
                throw new ReferenceError('address empty');
            }
            var len = address.length;
            if (len === 8) {
                if (address.toLowerCase() === 'anywhere') {
                    return Address.ANYWHERE;
                }
            } else if (len === 10) {
                if (address.toLowerCase() === 'everywhere') {
                    return Address.EVERYWHERE;
                }
            }
            if (len === 42) {
                return ETHAddress.parse(address);
            } else if (26 <= len && len <= 35) {
                return CompatibleBTCAddress.parse(address);
            }
            throw new TypeError('invalid address: ' + address);
        }
    });

    //-------- namespace --------
    ns.registerCompatibleAddressFactory = function () {
        /**
         *  Register CompatibleAddress Factory
         *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         */
        Address.setFactory(new CompatibleAddressFactory());
    };

})(DIMP);
