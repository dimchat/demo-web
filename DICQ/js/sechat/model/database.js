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

        savePrivateKey: function (key, type, user) {
            return t_private_key.savePrivateKey(key, type, user);
        },
        getPrivateKeysForDecryption: function (user) {
            return t_private_key.getPrivateKeysForDecryption(user);
        },
        getPrivateKeyForSignature: function (user) {
            return t_private_key.getPrivateKeyForSignature(user);
        },
        getPrivateKeyForVisaSignature: function (user) {
            return t_private_key.getPrivateKeyForVisaSignature(user);
        },

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
        getDocument: function (entity) {
            return t_document.getDocument(entity);
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

        setCurrentUser: function (user) {
            return t_user.setCurrentUser(user);
        },
        getLocalUsers: function () {
            return t_user.getLocalUsers();
        },
        saveLocalUsers: function (users) {
            return t_user.saveLocalUsers(users);
        },
        getContacts: function (user) {
            return t_user.getContacts(user);
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

        getFounder: function (group) {
            return t_group.getFounder(group);
        },
        getOwner: function (group) {
            return t_group.getOwner(group);
        },
        getMembers: function (group) {
            return t_group.getMembers(group);
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
        getAssistants: function (group) {
            return t_group.getAssistants(group);
        },
        saveAssistants: function (members, group) {
            return t_group.saveAssistants(members, group);
        },

        getLoginCommandMessage: function (user) {
            return t_login.getLoginCommandMessage(user);
        },
        saveLoginCommandMessage: function (user, command, message) {
            return t_login.saveLoginCommandMessage(user, command, message);
        },

        getCipherKey: function (from, to, generate) {
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

        getInstance: function () {
            return this;
        }
    };

    var post_notification = function (name, sender, userInfo) {
        var nc = NotificationCenter.getInstance();
        nc.postNotification(name, sender, userInfo);
    };

    //-------- namespace --------
    ns.SharedDatabase = SharedDatabase;

})(SECHAT, DIMP);
