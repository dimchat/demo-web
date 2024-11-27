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

//! require 'database/*.js'

(function (ns, sdk) {
    'use strict';

    var SymmetricKey = sdk.crypto.SymmetricKey;
    var PlainKey = sdk.crypto.PlainKey;

    var PrivateKeyStorage = sdk.database.PrivateKeyStorage;
    var MetaStorage       = sdk.database.MetaStorage;
    var DocumentStorage   = sdk.database.DocumentStorage;
    var ProviderStorage   = sdk.database.ProviderStorage;
    var UserStorage       = sdk.database.UserStorage;
    var GroupStorage      = sdk.database.GroupStorage;
    var LoginStorage      = sdk.database.LoginStorage;
    var CipherKeyStorage  = sdk.database.CipherKeyStorage;
    var MessageStorage    = sdk.database.MessageStorage;

    var NotificationCenter = sdk.lnc.NotificationCenter;
    var NotificationNames  = ns.NotificationNames;

    var t_private_key = new PrivateKeyStorage();
    var t_meta        = new MetaStorage();
    var t_document    = new DocumentStorage();
    var t_provider    = new ProviderStorage();
    var t_user        = new UserStorage();
    var t_group       = new GroupStorage();
    var t_login       = new LoginStorage();
    var t_cipher_key  = new CipherKeyStorage();
    var t_message     = new MessageStorage();

    var SharedDatabase = {

        //
        //  PrivateKey Table
        //

        savePrivateKey: function (key, type, user) {
            return t_private_key.savePrivateKey(key, type, user);
        },
        getPrivateKeysForDecryption: function (user) {
            var keys = t_private_key.getPrivateKeysForDecryption(user);
            return !keys ? [] : keys;
        },
        getPrivateKeyForSignature: function (user) {
            return t_private_key.getPrivateKeyForSignature(user);
        },
        getPrivateKeyForVisaSignature: function (user) {
            return t_private_key.getPrivateKeyForVisaSignature(user);
        },

        //
        //  Meta Table
        //

        saveMeta: function (meta, entity) {
            var ok = t_meta.saveMeta(meta, entity);
            if (ok) {
                post_notification(NotificationNames.MetaAccepted, this, {
                    'ID': entity,
                    'meta': meta
                });
            }
            return ok;
        },
        getMeta: function (entity) {
            return t_meta.getMeta(entity);
        },

        //
        //  Document Table
        //

        saveDocument: function (doc) {
            var ok = t_document.saveDocument(doc);
            if (ok) {
                post_notification(NotificationNames.DocumentUpdated, this, {
                    'ID': doc.getIdentifier(),
                    'document': doc
                });
            }
            return ok;
        },
        getDocuments: function (entity) {
            var docs = t_document.getDocuments(entity);
            return !docs ? [] : docs;
        },

        //
        //  User Table
        //

        getLocalUsers: function () {
            var local_users = t_user.getLocalUsers();
            return !local_users ? [] : local_users;
        },
        saveLocalUsers: function (users) {
            return t_user.saveLocalUsers(users);
        },
        setCurrentUser: function (user) {
            return t_user.setCurrentUser(user);
        },
        getCurrentUser: function () {
            var local_users = this.getLocalUsers();
            if (local_users.length === 0) {
                return null;
            }
            return local_users[0];
        },
        addUser: function (user) {
            var local_users = this.getLocalUsers();
            if (local_users.indexOf(user) >= 0) {
                return true;
            }
            local_users.push(user);
            return this.saveLocalUsers(local_users);
        },
        removeUser: function (user) {
            var local_users = this.getLocalUsers();
            var pos = local_users.indexOf(user);
            if (pos < 0) {
                return true;
            }
            local_users.splice(pos, 1);
            return this.saveLocalUsers(local_users);
        },

        //
        //  Contact Table
        //

        getContacts: function (user) {
            var all_contacts = t_user.getContacts(user);
            return !all_contacts ? [] : all_contacts;
        },
        saveContacts: function (contacts, user) {
            var ok = t_user.saveContacts(contacts, user);
            if (ok) {
                post_notification(NotificationNames.ContactsUpdated, this, {
                    'user': user,
                    'contacts': contacts
                });
            }
            return ok;
        },
        addContact: function (contact, user) {
            var all_contacts = this.getContacts(user);
            if (all_contacts.indexOf(contact) >= 0) {
                return true;
            }
            all_contacts.push(contact);
            return this.saveContacts(all_contacts, user);
        },
        removeContact: function (contact, user) {
            var all_contacts = this.getContacts(user);
            var pos = all_contacts.indexOf(user);
            if (pos < 0) {
                return true;
            }
            all_contacts.splice(pos, 1);
            return this.saveContacts(all_contacts, user);
        },

        //
        //  Remark Table
        //

        // TODO:

        //
        //  Blocked Table
        //

        // TODO:

        //
        //  Muted Table
        //

        // TODO:

        //
        //  Group Table
        //

        getFounder: function (group) {
            return t_group.getFounder(group);
        },
        getOwner: function (group) {
            return t_group.getOwner(group);
        },
        getMembers: function (group) {
            var all_members = t_group.getMembers(group);
            return !all_members ? [] : all_members;
        },
        saveMembers: function (members, group) {
            var ok = t_group.saveMembers(members, group);
            if (ok) {
                post_notification(NotificationNames.MembersUpdated, this, {
                    'group': group,
                    'members': members
                });
            }
            return ok;
        },
        addMember: function (member, group) {
            var all_members = this.getMembers(group);
            if (all_members.indexOf(member) >= 0) {
                return true;
            }
            all_members.push(member);
            return this.saveMembers(all_members, group);
        },
        removeMember: function (member, group) {
            var all_members = this.getMembers(group);
            var pos = all_members.indexOf(member);
            if (pos < 0) {
                return true;
            }
            all_members.splice(pos, 1);
            return this.saveMembers(all_members, group);
        },
        getAssistants: function (group) {
            return t_group.getAssistants(group);
        },
        saveAssistants: function (members, group) {
            return t_group.saveAssistants(members, group);
        },
        getAdministrators: function (group) {
            return t_group.getAdministrators(group);
        },
        saveAdministrators: function (members, group) {
            return t_group.saveAdministrators(members, group);
        },
        removeGroup: function (group) {
            // TODO:
        },

        //
        //  Group History Table
        //

        saveGroupHistory: function (content, rMsg, group) {
            // TODO:
            return true;
        },
        getGroupHistories: function (group) {
            // TODO:
            return [];
        },
        getResetCommandMessage: function (group) {
            // TODO:
            return [];
        },
        clearGroupAdminHistories: function (group) {
            // TODO:
            return true;
        },
        clearGroupMemberHistories: function (group) {
            // TODO:
            return true;
        },

        //
        //  Login Table
        //

        getLoginCommandMessage: function (user) {
            return t_login.getLoginCommandMessage(user);
        },
        saveLoginCommandMessage: function (user, command, message) {
            return t_login.saveLoginCommandMessage(user, command, message);
        },

        //
        //  Provider Table
        //

        allProviders: function () {
            // TODO:
            return [];
        },

        addProvider: function (identifier, chosen) {
            // TODO:
            return true;
        },

        updateProvider: function (identifier, chosen) {
            // TODO:
            return true;
        },

        removeProvider: function (identifier) {
            // TODO:
            return true;
        },

        //
        //  Station Table
        //

        allStations: function (provider) {
            // TODO:
            return [];
        },
        addStation: function (sid, chosen, host, port, provider) {
            // TODO:
            return true;
        },
        updateStation: function (sid, chosen, host, port, provider) {
            // TODO:
            return true;
        },
        removeStation: function (host, port, provider) {
            // TODO:
            return true;
        },
        removeStations: function (provider) {
            // TODO:
            return true;
        },

        allNeighbors: function () {
            return t_provider.allNeighbors();
        },
        getNeighbor: function (ip, port) {
            return t_provider.getNeighbor(ip, port);
        },
        addNeighbor: function (ip, port, identifier) {
            var ok = t_provider.addNeighbor(ip, port, identifier);
            if (ok) {
                post_notification(NotificationNames.ServiceProviderUpdated, this, {
                    'action': 'add',
                    'host': ip,
                    'port': port,
                    'ID': identifier
                });
            }
            return ok;
        },
        removeNeighbor: function (ip, port) {
            var ok = t_provider.removeNeighbor(ip, port);
            if (ok) {
                post_notification(NotificationNames.ServiceProviderUpdated, this, {
                    'action': 'remove',
                    'host': ip,
                    'port': port
                });
            }
            return ok;
        },

        //
        //  Speed Table
        //

        // TODO:

        //
        //  MsgKey Table
        //

        getCipherKey: function (from, to, generate) {
            if (to.isBroadcast()) {
                // broadcast message has no key
                return PlainKey.getInstance();
            }
            var key = t_cipher_key.getCipherKey(from, to, generate);
            if (!key && generate) {
                // generate new key and store it
                key = SymmetricKey.generate(SymmetricKey.AES);
                t_cipher_key.cacheCipherKey(from, to, key);
            }
            return key;
        },
        cacheCipherKey: function (from, to, key) {
            return t_cipher_key.cacheCipherKey(from, to, key);
        },

        getGroupKeys: function (group, sender) {
            // TODO: implement getGroupKeys
            return {};
        },
        saveGroupKeys: function (group, sender, keys) {
            // TODO: implement saveGroupKeys
            return true;
        },

        //
        //  InstantMessage Table
        //

        getInstantMessages: function (chat, start, limit) {
            var messages = [];
            var msg;
            var count = this.numberOfMessages(chat);
            for (var index = 0; index < count; ++index) {
                msg = this.messageAtIndex(index, chat);
                if (msg) {
                    messages.push(msg);
                }
            }
            return messages;
        },
        saveInstantMessage: function (chat, iMsg) {
            return this.insertMessage(iMsg, chat);
        },
        removeInstantMessage: function (chat, envelope, content) {
            // TODO:
            return true;
        },
        removeInstantMessages: function (chat) {
            // TODO:
            return true;
        },
        burnMessages: function (expiredTime) {
            // TODO:
            return 0;
        },

        getReliableMessages: function (receiver, start, limit) {
            return t_message.getReliableMessages(receiver, start, limit);
        },
        cacheReliableMessage: function (receiver, rMsg) {
            return t_message.cacheReliableMessage(receiver, rMsg);
        },
        removeReliableMessage: function (receiver, rMsg) {
            return t_message.removeReliableMessage(receiver, rMsg);
        },
        numberOfConversations: function () {
            return t_message.numberOfConversations();
        },
        conversationAtIndex: function (index) {
            return t_message.conversationAtIndex(index);
        },
        removeConversationAtIndex: function (index) {
            return t_message.removeConversationAtIndex(index);
        },
        removeConversation: function (entity) {
            return t_message.removeConversation(entity);
        },
        numberOfMessages: function (entity) {
            return t_message.numberOfMessages(entity);
        },
        numberOfUnreadMessages: function (entity) {
            return t_message.numberOfUnreadMessages(entity);
        },
        clearUnreadMessages: function (entity) {
            return t_message.clearUnreadMessages(entity);
        },
        lastMessage: function (entity) {
            return t_message.lastMessage(entity);
        },
        messageAtIndex: function (index, entity) {
            return t_message.messageAtIndex(index, entity);
        },
        insertMessage: function (iMsg, entity) {
            var ok = t_message.insertMessage(iMsg, entity);
            if (ok) {
                post_notification(NotificationNames.MessageUpdated, this, {
                    'action': 'add',
                    'ID': entity,
                    'msg': iMsg
                });
                console.info('message saved', iMsg, entity);
            } else {
                console.error('failed to save message', iMsg, entity);
            }
            return ok;
        },
        removeMessage: function (iMsg, entity) {
            var ok = t_message.removeMessage(iMsg, entity);
            if (ok) {
                post_notification(NotificationNames.MessageUpdated, this, {
                    'action': 'remove',
                    'ID': entity,
                    'msg': iMsg
                });
            }
            return ok;
        },
        withdrawMessage: function (iMsg, entity) {
            var ok = t_message.withdrawMessage(iMsg, entity);
            if (ok) {
                post_notification(NotificationNames.MembersUpdated, this, {
                    'action': 'withdraw',
                    'ID': entity,
                    'msg': iMsg
                });
            }
            return ok;
        },
        saveReceipt: function (iMsg, entity) {
            return t_message.saveReceipt(iMsg, entity);
        },

        //
        //  Conversation Table
        //

        getConversations: function () {
            // TODO:
            return [];
        },
        addConversation: function (chat) {
            // TODO:
            return true;
        },
        updateConversation: function (chat) {
            // TODO:
            return true;
        },
        // removeConversation: function (chat) {
        //     // TODO:
        //     return true;
        // },
        burnConversations: function (expiredTime) {
            // TODO:
            return true;
        },

        //
        //  Trace Table
        //

        // TODO:

        getInstance: function () {
            return this;
        }
    };

    var post_notification = function (name, sender, userInfo) {
        var nc = NotificationCenter.getInstance();
        // nc.postNotification(name, sender, userInfo);
        nc.postNotification(new sdk.lnc.Notification(name, sender, userInfo));
    };

    //-------- namespace --------
    ns.SharedDatabase = SharedDatabase;

})(SECHAT, DIMP);
