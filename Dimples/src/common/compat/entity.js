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
//! require 'network.js'

(function (ns) {
    'use strict';

    var Class             = ns.type.Class;
    var EntityType        = ns.protocol.EntityType;
    var NetworkID         = ns.protocol.NetworkID;
    var ID                = ns.protocol.ID;
    var Identifier        = ns.mkm.Identifier;
    var IdentifierFactory = ns.mkm.GeneralIdentifierFactory;

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
            var name = this.getName();
            if (!name || name.length === 0) {
                // all ID without 'name' field must be a user
                // e.g.: BTC address
                return EntityType.USER.getValue();
            }
            var network = this.getAddress().getType();
            // compatible with MKM 0.9.*
            return NetworkID.getEntityType(network);
        }
    });

    /*/
    EntityID.create = function (name, address, terminal) {
        var string = Identifier.concat(name, address, terminal);
        return new EntityID(string, name, address, terminal)
    };
    /*/

    /**
     *  EntityID Factory
     *  ~~~~~~~~~~~~~~~~
     */
    var EntityIDFactory = function () {
        IdentifierFactory.call(this);
    };
    Class(EntityIDFactory, IdentifierFactory, null, {

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
            if (len === 15) {
                // "anyone@anywhere"
                if (identifier.toLowerCase() === 'anyone@anywhere') {
                    return ID.ANYONE;
                }
            } else if (len === 19) {
                // "everyone@everywhere"
                if (identifier.toLowerCase() === 'everyone@everywhere') {
                    return ID.EVERYONE;
                }
            } else if (len === 13) {
                // "moky@anywhere"
                if (identifier.toLowerCase() === 'moky@anywhere') {
                    return ID.FOUNDER;
                }
            }
            return IdentifierFactory.prototype.parse.call(this, identifier);
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
