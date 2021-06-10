;
//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var Entity = sdk.Entity;
    var NotificationCenter = sdk.lnc.NotificationCenter;

    var get_facebook = function () {
        return ns.Facebook.getInstance();
    };

    ns.ConversationDatabase = {

        getName: function (identifier) {
            return get_facebook().getName(identifier);
        },

        getTimeString: function (msg) {
            var time = msg.getTime();
            if (!time) {
                time = new Date(0);
            }
            var yyyy = time.getFullYear();
            var mm = time.getMonth() + 1;
            var dd = time.getDate();
            var hh = time.getHours();
            var MM = time.getMinutes();
            var ss = time.getSeconds();
            return yyyy + '/' + mm + '/' + dd + ' ' + hh + ':' + MM + ':' + ss;
        },

        //
        //  ConversationDataSource
        //
        numberOfConversations: function () {
            return this.messageTable.numberOfConversations();
        },
        conversationAtIndex: function (index) {
            return this.messageTable.conversationAtIndex(index);
        },
        removeConversationAtIndex: function (index) {
            var chat = this.messageTable.conversationAtIndex(index);
            if (!this.messageTable.removeConversationAtIndex(index)) {
                return false;
            }
            post_updated(null, chat);
            return true;
        },
        removeConversation: function (chat) {
            chat = get_id(chat);
            if (!this.messageTable.removeConversation(chat)) {
                return false;
            }
            post_updated(null, chat);
            return true;
        },
        clearConversation: function (chat) {
            chat = get_id(chat);
            if (!this.messageTable.removeConversation(chat)) {
                return false;
            }
            post_updated(null, chat);
            return true;
        },

        //
        //  Messages
        //
        numberOfMessages: function (chat) {
            chat = get_id(chat);
            return this.messageTable.numberOfMessages(chat);
        },
        numberOfUnreadMessages: function (chat) {
            chat = get_id(chat);
            return this.messageTable.numberOfUnreadMessages(chat);
        },
        clearUnreadMessages: function (chat) {
            chat = get_id(chat);
            return this.messageTable.numberOfUnreadMessages(chat);
        },
        lastMessage: function (chat) {
            chat = get_id(chat);
            return this.messageTable.lastMessage(chat);
        },
        lastReceivedMessage: function () {
            var user = get_facebook().getCurrentUser();
            if (!user) {
                return null;
            }
            return this.messageTable.lastReceivedMessage(user.identifier);
        },
        messageAtIndex: function (index, chat) {
            chat = get_id(chat);
            return this.messageTable.messageAtIndex(index, chat);
        },

        insertMessage: function (iMsg, chat) {
            chat = get_id(chat);
            var ok = this.messageTable.insertMessage(iMsg, chat);
            if (ok) {
                post_updated(iMsg, chat);
            }
            return ok;
        },
        removeMessage: function (iMsg, chat) {
            chat = get_id(chat);
            var ok = this.messageTable.removeMessage(iMsg, chat);
            if (ok) {
                post_updated(iMsg, chat);
            }
            return ok;
        },
        withdrawMessage: function (iMsg, chat) {
            chat = get_id(chat);
            var ok = this.messageTable.withdrawMessage(iMsg, chat);
            if (ok) {
                post_updated(iMsg, chat);
            }
            return ok;
        },

        saveReceipt: function (iMsg, chat) {
            chat = get_id(chat);
            var ok = this.messageTable.saveReceipt(iMsg, chat);
            if (ok) {
                // FIXME: check for origin conversation
                if (chat.isUser()) {
                    var receipt = iMsg.getContent();
                    var env = receipt.getEnvelope();
                    if (env) {
                        var sender = env.getSender();
                        if (sender && sender.equals(iMsg.getReceiver())) {
                            chat = env.getReceiver();
                        }
                    }
                }
                post_updated(iMsg, chat);
            }
            return ok;
        },

        messageTable: ns.db.MessageTable
    };

    var get_id = function (chatBox) {
        if (chatBox instanceof ns.Conversation) {
            return chatBox.identifier;
        } else if (chatBox instanceof Entity) {
            return chatBox.identifier;
        } else {
            return chatBox;
        }
    }

    var post_updated = function (iMsg, identifier) {
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMessageUpdated, this, {
            'ID': identifier,
            'msg': iMsg
        });
    };

})(SECHAT, DIMSDK);
