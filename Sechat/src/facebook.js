;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2023 Albert Moky
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

//!require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var Interface = sdk.type.Interface;
    var Class = sdk.type.Class;
    var Visa = sdk.protocol.Visa;
    var Entity = sdk.mkm.Entity;
    var CommonFacebook = sdk.CommonFacebook;
    var Anonymous = sdk.Anonymous;

    var SharedFacebook = function (db) {
        CommonFacebook.call(this, db);
    };
    Class(SharedFacebook, CommonFacebook, null, {

        getName: function (identifier) {
            // get name from document
            var doc = this.getDocument(identifier, '*');
            if (doc) {
                var name = doc.getName();
                if (name && name.length > 0) {
                    return name;
                }
            }
            // get name from ID
            return Anonymous.getName(identifier);
        },

        /**
         *  Get avatar for user
         *
         * @param {ID} user - user ID
         * @return {string} remote URL
         */
        getAvatar: function (user) {
            var url = null;
            var doc = this.getDocument(user, '*');
            if (doc) {
                if (Interface.conforms(doc, Visa)) {
                    url = doc.getAvatar();
                } else {
                    url = doc.getProperty('avatar');
                }
            }
            return url;
        },

        saveContacts: function (contacts, user) {
            var db = this.getDatabase();
            return db.saveContacts(contacts, user);
        },

        savePrivateKey: function (key, type, user) {
            var db = this.getDatabase();
            return db.savePrivateKey(key, type, user);
        },

        // Override
        setCurrentUser: function (user) {
            var db = this.getDatabase();
            db.setCurrentUser(user.getIdentifier());
            CommonFacebook.prototype.setCurrentUser.call(this, user);
        },
        addUser: function (user) {
            if (user instanceof Entity) {
                user = user.getIdentifier();
            }
            var db = this.getDatabase();
            var allUsers = db.getLocalUsers();
            if (!allUsers) {
                allUsers = [user];
            } else if (find_user(allUsers, user) >= 0) {
                // already exists
                return false;
            } else {
                allUsers.push(user);
            }
            return db.saveLocalUsers(allUsers);
        },
        removeUser: function (user) {
            if (user instanceof Entity) {
                user = user.getIdentifier();
            }
            var db = this.getDatabase();
            var allUsers = db.getLocalUsers();
            var pos = !allUsers ? -1 : find_user(allUsers, user);
            if (pos < 0) {
                // not exists
                return false;
            }
            allUsers.splice(pos, 1);
            return db.saveLocalUsers(allUsers);
        },

        //-------- Contacts

        addContact: function (contact, user) {
            var allContacts = this.getContacts(user);
            if (!allContacts) {
                allContacts = [contact]
            } else if (find_user(allContacts, contact) >= 0) {
                // already exists
                return false;
            } else {
                allContacts.push(contact);
            }
            return this.saveContacts(allContacts, user);
        },
        removeContact: function (contact, user) {
            var allContacts = this.getContacts(user);
            var pos = !allContacts ? -1 : find_user(allContacts, contact);
            if (pos < 0) {
                // not exists
                return false;
            }
            allContacts.splice(pos, 1);
            return this.saveContacts(allContacts, user);
        },

        //-------- Members

        addMember: function (member, group) {
            var allMembers = this.getMembers(group);
            if (!allMembers) {
                allMembers = [member];
            } else if (find_user(allMembers, member) >= 0) {
                // already exists
                return false;
            } else {
                allMembers.push(member);
            }
            return this.saveMembers(allMembers, group);
        },
        removeMember: function (member, group) {
            var allMembers = this.getMembers(group);
            var pos = !allMembers ? -1 : find_user(allMembers, member);
            if (pos < 0) {
                // not exists
                return false;
            }
            allMembers.splice(pos, 1);
            return this.saveMembers(allMembers, group);
        },
        containsMember: function (member, group) {
            var allMembers = this.getMembers(group);
            if (allMembers && find_user(allMembers, member) >= 0) {
                return true;
            }
            var owner = this.getOwner(group);
            return owner && owner.equals(member);
        },
        removeGroup: function (group) {
            // TODO:
            console.warn('remove group', group);
            return false;
        }
    });

    var find_user = function (array, item) {
        for (var i = 0; i < array.length; ++i) {
            if (array[i].equals(item)) {
                // found
                return i;
            }
        }
        return -1;
    };

    //-------- namespace --------
    ns.SharedFacebook = SharedFacebook;

})(SECHAT, DIMP);
