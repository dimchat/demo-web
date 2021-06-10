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

    var ID = sdk.protocol.ID;
    var InstantMessage = sdk.protocol.InstantMessage;

    var Storage = sdk.dos.SessionStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;

    ns.db.MessageTable = {

        //---- conversations

        /**
         *  Get how many chat boxes
         *
         * @return {uint} conversations count
         */
        numberOfConversations: function () {
            var keys = Object.keys(this.__messages);
            return keys.length;
        },

        /**
         *  Get chat box info
         *
         * @param {uint} index - sorted index
         * @return {ID} conversation ID
         */
        conversationAtIndex: function (index) {
            var keys = Object.keys(this.__messages);
            return ID.parse(keys[index]);
        },

        /**
         *  Remove one chat box
         *
         * @param index - chat box index
         * @return {boolean} true on row(s) affected
         */
        removeConversationAtIndex: function (index) {
            var chat = this.conversationAtIndex(index);
            return this.removeConversation(chat);
        },

        /**
         *  Remove the chat box
         *
         * @param {ID} entity - conversation ID
         * @return {boolean} true on row(s) affected
         */
        removeConversation: function (entity) {
        },

        //-------- messages

        /**
         *  Get message count in this conversation for an entity
         *
         * @param {ID} entity - conversation ID
         * @return {uint} total count
         */
        numberOfMessages: function (entity) {
            var messages = this.loadMessages(entity);
            if (messages) {
                return messages.length;
            } else {
                return 0;
            }
        },

        /**
         *  Get unread message count in this conversation for an entity
         *
         * @param {ID} entity - conversation ID
         * @return {uint} unread count
         */
        numberOfUnreadMessages: function (entity) {
        },

        /**
         *  Clear unread flag in this conversation for an entity
         *
         * @param {ID} entity - conversation ID
         * @return {boolean} true on row(s) affected
         */
        clearUnreadMessages: function (entity) {
        },

        /**
         *  Get last message of this conversation
         *
         * @param {ID} entity - conversation ID
         * @return {InstantMessage} instant message
         */
        lastMessage: function (entity) {
            var messages = this.loadMessages(entity);
            if (messages && messages.length > 0) {
                return InstantMessage.parse(messages[messages.length - 1]);
            } else {
                return null;
            }
        },

        /**
         *  Get last received message from all conversations
         *
         * @param {ID} user - current user ID
         * @return {InstantMessage} instant message
         */
        lastReceivedMessage: function (user) {
        },

        /**
         *  Get message at index of this conversation
         *
         * @param {uint} index - start from 0, latest first
         * @param {ID} entity - conversation ID
         * @return {InstantMessage} instant message
         */
        messageAtIndex: function (index, entity) {
            var messages = this.loadMessages(entity);
            console.assert(messages !== null, 'failed to get messages for conversation: ' + identifier);
            return InstantMessage.parse(messages[index]);
        },

        /**
         *  Save the new message to local storage
         *
         * @param {InstantMessage} iMsg - instant message
         * @param {ID} entity - conversation ID
         * @return {boolean} true on success
         */
        insertMessage: function (iMsg, entity) {
            var messages = this.loadMessages(entity);
            if (messages) {
                if (!insert_message(iMsg, messages)) {
                    // duplicate message?
                    return false;
                }
            } else {
                messages = [iMsg];
            }
            if (this.saveMessages(messages, entity)) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification(ns.kNotificationMessageUpdated, this, iMsg);
                return true;
            } else {
                throw new Error('failed to save message: ' + iMsg);
            }
        },

        /**
         *  Delete the message
         *
         * @param {InstantMessage} iMsg - instant message
         * @param {ID} entity - conversation ID
         * @return {boolean} true on row(s) affected
         */
        removeMessage: function (iMsg, entity) {
            var messages = this.loadMessages(entity);
            console.assert(messages !== null, 'failed to get messages for conversation: ' + entity);
            if (!remove_message(iMsg, messages)) {
                return false;
            }
            return this.saveMessages(messages, entity);
        },

        /**
         *  Try to withdraw the message, maybe won't success
         *
         * @param {InstantMessage} iMsg - instant message
         * @param {ID} entity - conversation ID
         * @return {boolean} true on success
         */
        withdrawMessage: function (iMsg, entity) {
        },

        /**
         *  Update message state with receipt
         *
         * @param {InstantMessage} iMsg - message with receipt content
         * @param {ID} entity - conversation ID
         * @return {boolean} true while target message found
         */
        saveReceipt: function (iMsg, entity) {
        },

        /**
         *  Load messages in conversation
         *
         * @param {ID} conversation
         * @returns {InstantMessage[]}
         */
        loadMessages: function (conversation) {
            this.load(conversation);
            var array = this.__messages[conversation];
            var messages = [];
            if (array) {
                for (var i = 0; i < array.length; ++i) {
                    messages.push(InstantMessage.parse(array[i]));
                }
            }
            return messages;
        },

        /**
         *  Save messages in conversation
         *
         * @param {InstantMessage[]} messages
         * @param {ID} conversation
         * @returns {boolean}
         */
        saveMessages: function (messages, conversation) {
            var array = [];
            if (messages) {
                for (var i = 0; i < messages.length; ++i) {
                    array.push(messages[i].getMap());
                }
            }
            this.__messages[conversation.toString()] = array;
            return this.save(conversation);
        },

        load: function (identifier) {
            if (!this.__messages[identifier.toString()]) {
                this.__messages[identifier.toString()] = Storage.loadJSON(get_tag(identifier));
            }
        },
        save: function (identifier) {
            return Storage.saveJSON(this.__messages[identifier.toString()], get_tag(identifier));
        },

        __messages: {}  // ID => Array<InstantMessage>
    };

    var get_tag = function (identifier) {
        return 'Messages-' + identifier.getAddress().toString();
    };

    var parse = function (list) {
        var messages = [];
        if (list) {
            var msg;
            for (var i = 0; i < list.length; ++i) {
                msg = InstantMessage.getInstance(list[i]);
                if (!msg) {
                    throw new Error('Message error: ' + list[i]);
                }
                messages.push(msg);
            }
        }
        return messages;
    };

    var insert_message = function (iMsg, messages) {
        // timestamp
        var t1, t2;
        t1 = iMsg.envelope.time;
        if (!t1) {
            t1 = 0;
        }
        // serial number
        var sn1, sn2;
        sn1 = iMsg.content.sn;

        var index;
        var item;
        for (index = messages.length - 1; index >=0; --index) {
            item = messages[index];
            t2 = item.envelope.time;
            if (t2 && t2 < t1) {
                // finished
                break;
            }
            sn2 = item.content.sn;
            if (sn1 === sn2) {
                console.log('duplicate message, no need to insert');
                return false;
            }
        }
        // insert after
        ns.type.Arrays.insert(messages, index+1, iMsg);
        return true;
    };
    var remove_message = function (iMsg, messages) {
        // timestamp
        var t1, t2;
        t1 = iMsg.envelope.time;
        if (!t1) {
            t1 = 0;
        }
        // serial number
        var sn1, sn2;
        sn1 = iMsg.content.sn;

        var index;
        var item;
        for (index = messages.length - 1; index >=0; --index) {
            item = messages[index];
            t2 = item.envelope.time;
            if (t2 && t2 < t1) {
                console.log('message not found');
                return false;
            }
            sn2 = item.content.sn;
            if (sn1 === sn2) {
                // got it
                break;
            }
        }
        // insert after
        ns.type.Arrays.insert(messages, index+1, iMsg);
        return true;
    };

})(SECHAT, DIMSDK);
