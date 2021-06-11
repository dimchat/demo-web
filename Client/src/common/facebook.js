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

    var DecryptKey = sdk.crypto.DecryptKey;

    var ID = sdk.protocol.ID;
    var Entity = sdk.Entity;
    var User = sdk.User;
    var Group = sdk.Group;

    var Facebook = sdk.Facebook;

    var CommonFacebook = function () {
        Facebook.call(this);
        // local users
        this.__localUsers = null;
        // databases
        this.privateKeyTable = ns.db.PrivateKeyTable;
        this.metaTable = ns.db.MetaTable;
        this.documentTable = ns.db.DocumentTable;
        this.userTable = ns.db.UserTable;
        this.contactTable = ns.db.ContactTable;
        this.groupTable = ns.db.GroupTable;
    };
    sdk.Class(CommonFacebook, Facebook, null);

    CommonFacebook.EXPIRES = 30 * 60 * 1000;  // document expires (30 minutes)
    CommonFacebook.EXPIRES_KEY = 'expires';

    //
    //  Local Users
    //
    CommonFacebook.prototype.getLocalUsers = function() {
        if (!this.__localUsers) {
            var list = this.userTable.allUsers();
            var users = [];
            var item;
            for (var i = 0; i < list.length; ++i) {
                item = this.getUser(list[i]);
                if (item) {
                    users.push(item);
                } else {
                    throw new Error('failed to get local user:' + item);
                }
            }
            this.__localUsers = users;
        }
        return this.__localUsers;
    };
    CommonFacebook.prototype.getCurrentUser = function () {
        var uid = this.userTable.getCurrentUser();
        if (uid) {
            return this.getUser(uid);
        } else {
            return Facebook.prototype.getCurrentUser.call(this);
        }
    };
    CommonFacebook.prototype.setCurrentUser = function(user) {
        this.__localUsers = null;
        if (user instanceof User) {
            user = user.identifier;
        }
        return this.userTable.setCurrentUser(user);
    };

    CommonFacebook.prototype.addUser = function(user) {
        this.__localUsers = null;
        if (user instanceof User) {
            user = user.identifier;
        }
        return this.userTable.addUser(user);
    };
    CommonFacebook.prototype.removeUser = function(user) {
        this.__localUsers = null;
        if (user instanceof User) {
            user = user.identifier;
        }
        return this.userTable.removeUser(user);
    };

    //
    //  Contacts
    //
    CommonFacebook.prototype.addContact = function(contact, user) {
        if (contact instanceof Entity) {
            contact = contact.identifier;
        }
        if (user instanceof User) {
            user = user.identifier;
        }
        return this.contactTable.addContact(contact, user);
    };
    CommonFacebook.prototype.removeContact = function(contact, user) {
        if (contact instanceof Entity) {
            contact = contact.identifier;
        }
        if (user instanceof User) {
            user = user.identifier;
        }
        return this.contactTable.removeContact(contact, user);
    };

    //
    //  Private Key
    //
    CommonFacebook.prototype.savePrivateKey = function (key, user) {
        if (user instanceof User) {
            user = user.identifier;
        }
        return this.privateKeyTable.savePrivateKey(key, user);
    };

    //
    //  Meta
    //
    CommonFacebook.prototype.saveMeta = function(meta, identifier) {
        return this.metaTable.saveMeta(meta, identifier);
    };

    //
    //  Document
    //
    CommonFacebook.prototype.saveDocument = function(doc) {
        if (!this.checkDocument(doc)) {
            return false;
        }
        doc.setValue(CommonFacebook.EXPIRES_KEY, null);
        return this.documentTable.saveDocument(doc);
    };
    CommonFacebook.prototype.isExpiredDocument = function (doc, reset) {
        var now = (new Date()).getTime();
        var expires = doc.getValue(CommonFacebook.EXPIRES_KEY);
        if (!expires) {
            // set expired time
            doc.setValue(CommonFacebook.EXPIRES_KEY, now + CommonFacebook.EXPIRES);
            return false;
        } else if (now < expires) {
            return false;
        }
        if (reset) {
            // update expired time
            doc.setValue(CommonFacebook.EXPIRES_KEY, now + CommonFacebook.EXPIRES);
        }
        return true;
    };

    //
    //  Group
    //
    CommonFacebook.prototype.addMember = function (member, group) {
        if (member instanceof User) {
            member = member.identifier;
        }
        if (group instanceof Group) {
            group = group.identifier;
        }
        return this.groupTable.addMember(member, group);
    };
    CommonFacebook.prototype.removeMember = function (member, group) {
        if (member instanceof User) {
            member = member.identifier;
        }
        if (group instanceof Group) {
            group = group.identifier;
        }
        return this.groupTable.removeMember(member, group);
    };
    CommonFacebook.prototype.saveMembers = function (members, group) {
        if (group instanceof Group) {
            group = group.identifier;
        }
        return this.groupTable.saveMembers(members, group);
    };
    CommonFacebook.prototype.removeGroup = function (group) {
        if (group instanceof Group) {
            group = group.identifier;
        }
        return this.groupTable.removeGroup(group);
    };

    CommonFacebook.prototype.containsMember = function (member, group) {
        if (member instanceof User) {
            member = member.identifier;
        }
        if (group instanceof Group) {
            group = group.identifier;
        }
        var members = this.getMembers(group);
        if (members && members.indexOf(member) >= 0) {
            return true;
        }
        var owner = this.getOwner(group);
        return owner && owner.equals(member);
    };
    CommonFacebook.prototype.containsAssistant = function (bot, group) {
        if (bot instanceof User) {
            bot = bot.identifier;
        }
        if (group instanceof Group) {
            group = group.identifier;
        }
        var bots = this.getAssistants(group);
        return bots && bots.indexOf(bot) >= 0;
    };

    CommonFacebook.prototype.getName = function (identifier) {
        // get name from document
        var doc = this.getDocument(identifier, '*');
        if (doc) {
            var name = doc.getName();
            if (name && name.length > 0) {
                return name;
            }
        }
        // get name from ID
        return ns.Anonymous.getName(identifier);
    };

    CommonFacebook.prototype.createUser = function (identifier) {
        if (is_waiting.call(this, identifier)) {
            return null;
        } else {
            return Facebook.prototype.createUser.call(this, identifier);
        }
    };
    var is_waiting = function (id) {
        return !id.isBroadcast() && !this.getMeta(id);
    };
    CommonFacebook.prototype.createGroup = function (identifier) {
        if (is_waiting.call(this, identifier)) {
            return null;
        } else {
            return Facebook.prototype.createGroup.call(this, identifier);
        }
    };

    //
    //  Entity DataSource
    //
    CommonFacebook.prototype.getMeta = function (identifier) {
        if (identifier.isBroadcast()) {
            // broadcast ID has no meta
            return null;
        } else {
            // try from database
            return this.metaTable.getMeta(identifier);
        }
    };
    CommonFacebook.prototype.getDocument = function (identifier, type) {
        // try from database
        return this.documentTable.getDocument(identifier, type);
    };

    //
    //  User DataSource
    //
    CommonFacebook.prototype.getContacts = function (user) {
        // try from database
        return this.contactTable.getContacts(user);
    };

    CommonFacebook.prototype.getPrivateKeysForDecryption = function (user) {
        // try from database
        var keys = this.privateKeyTable.getPrivateKeysForDecryption(user);
        if (!keys || keys.length === 0) {
            // DIMP v1.0:
            //      the decrypt key and the sign key are the same key
            var key = this.getPrivateKeyForSignature(user);
            if (sdk.Interface.conforms(key, DecryptKey)) {
                keys = [key];
            }
        }
        return keys;
    };
    CommonFacebook.prototype.getPrivateKeyForSignature = function (user) {
        // try from database
        return this.privateKeyTable.getPrivateKeyForSignature(user);
    };
    CommonFacebook.prototype.getPrivateKeyForVisaSignature = function (user) {
        // try from database
        return this.privateKeyTable.getPrivateKeyForVisaSignature(user);
    };

    //
    //  Group DataSource
    //
    CommonFacebook.prototype.getFounder = function (group) {
        // get from database
        var founder = this.groupTable.getFounder(group);
        if (founder) {
            return founder;
        } else {
            return Facebook.prototype.getFounder.call(this, group);
        }
    };
    CommonFacebook.prototype.getOwner = function (group) {
        // get from database
        var owner = this.groupTable.getOwner(group);
        if (owner) {
            return owner;
        } else {
            return Facebook.prototype.getOwner.call(this, group);
        }
    };
    CommonFacebook.prototype.getMembers = function (group) {
        // get from database
        var members = this.groupTable.getMembers(group);
        if (members && members.length > 0) {
            return members;
        } else {
            return Facebook.prototype.getMembers.call(this, group);
        }
    };
    CommonFacebook.prototype.getAssistants = function (group) {
        // get from database
        var bots = this.groupTable.getAssistants(group);
        if (bots && bots.length > 0) {
            return bots;
        }
        // try ANS record
        var identifier = ID.parse('assistant');
        if (identifier) {
            return [identifier];
        } else {
            return null;
        }
    };

    //-------- namespace --------
    ns.CommonFacebook = CommonFacebook;

    ns.registers('CommonFacebook');

})(SECHAT, DIMSDK);
