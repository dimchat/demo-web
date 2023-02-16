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

//! require 'protocol/*.js'
//! require 'db/*.js'
//! require 'network/*.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Facebook = ns.Facebook;

    var CommonFacebook = function (db) {
        Facebook.call(this);
        this.__db = db;         // AccountDB
        this.__current = null;  // User
    };
    Class(CommonFacebook, Facebook, null, {

        // Override
        getLocalUsers: function() {
            var localUsers = [];
            var user;
            var array = this.__db.getLocalUsers();
            if (array && array.length > 0) {
                for (var i = 0; i < array.length; ++i) {
                    user = this.getUser(array[i]);
                    localUsers.push(user);
                }
            }
            return localUsers;
        },

        // Get current user (for signing and sending message)
        getCurrentUser: function () {
            var user = this.__current;
            if (!user) {
                var localUsers = this.getLocalUsers();
                if (localUsers.length > 0) {
                    user = localUsers[0];
                    this.__current = user;
                }
            }
            return user;
        },

        // Override
        createUser: function (identifier) {
            if (!identifier.isBroadcast()) {
                if (!this.getPublicKeyForEncryption(identifier)) {
                    // visa.key not found
                    return null;
                }
            }
            return Facebook.prototype.createUser.call(this, identifier);
        },

        // Override
        createGroup: function (identifier) {
            if (!identifier.isBroadcast()) {
                if (!this.getMeta(identifier)) {
                    // group meta not found
                    return null;
                }
            }
            return Facebook.prototype.createGroup.call(this, identifier);
        }

    });

    CommonFacebook.prototype.getDatabase = function () {
        return this.__db
    };

    CommonFacebook.prototype.setCurrentUser = function(user) {
        this.__current = user;
    };

    // Override
    CommonFacebook.prototype.saveMeta = function(meta, identifier) {
        return this.__db.saveMeta(meta, identifier);
    };

    // Override
    CommonFacebook.prototype.saveDocument = function(doc) {
        return this.__db.saveDocument(doc);
    };

    // Override
    CommonFacebook.prototype.saveMembers = function (members, group) {
        return this.__db.saveMembers(members, group);
    };

    CommonFacebook.prototype.saveAssistants = function (bots, group) {
        this.__db.saveAssistants(bots, group);
    };

    //-------- Entity DataSource

    // Override
    CommonFacebook.prototype.getMeta = function (identifier) {
        /*/
        if (identifier.isBroadcast()) {
            // broadcast ID has no meta
            return null;
        }
        /*/
        return this.__db.getMeta(identifier);
    };

    // Override
    CommonFacebook.prototype.getDocument = function (identifier, type) {
        /*/
        if (entity.isBroadcast()) {
            // broadcast ID has no document
            return null;
        }
        /*/
        return this.__db.getDocument(identifier, type);
    };

    //-------- User DataSource

    // Override
    CommonFacebook.prototype.getContacts = function (user) {
        return this.__db.getContacts(user);
    };

    // Override
    CommonFacebook.prototype.getPrivateKeysForDecryption = function (user) {
        return this.__db.getPrivateKeysForDecryption(user);
    };

    // Override
    CommonFacebook.prototype.getPrivateKeyForSignature = function (user) {
        return this.__db.getPrivateKeyForSignature(user);
    };

    // Override
    CommonFacebook.prototype.getPrivateKeyForVisaSignature = function (user) {
        return this.__db.getPrivateKeyForVisaSignature(user);
    };

    //-------- Group DataSource

    // Override
    CommonFacebook.prototype.getFounder = function (group) {
        var founder = this.__db.getFounder(group);
        if (founder) {
            return founder;
        }
        return Facebook.prototype.getFounder.call(this, group);
    };

    // Override
    CommonFacebook.prototype.getOwner = function (group) {
        var owner = this.__db.getOwner(group);
        if (owner) {
            return owner;
        }
        return Facebook.prototype.getOwner.call(this, group);
    };

    // Override
    CommonFacebook.prototype.getMembers = function (group) {
        var members = this.__db.getMembers(group);
        if (members && members.length > 0) {
            return members;
        }
        return Facebook.prototype.getMembers.call(this, group);
    };

    // Override
    CommonFacebook.prototype.getAssistants = function (group) {
        var bots = this.__db.getAssistants(group);
        if (bots && bots.length > 0) {
            return bots;
        }
        return Facebook.prototype.getAssistants.call(this, group);
    };

    //-------- namespace --------
    ns.CommonFacebook = CommonFacebook;

})(SECHAT);
