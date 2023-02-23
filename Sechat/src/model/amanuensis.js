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

//! require 'conversation.js'

(function (ns, sdk) {
    'use strict';

    var Interface = sdk.type.Interface;
    var ReceiptCommand = sdk.protocol.ReceiptCommand;
    var Conversation = ns.Conversation;

    var get_facebook = function () {
        return ns.GlobalVariable.getInstance().facebook;
    };
    // var get_messenger = function () {
    //     return app.GlobalVariable.getInstance().messenger;
    // };
    var get_conversation_db = function () {
        return ns.GlobalVariable.getInstance().database;
    };

    /**
     *  Conversation pool to manage conversation instances
     *
     *      1st, get instance here to avoid create same instance,
     *      2nd, if their history was updated, we can notice them here immediately
     *
     * @constructor
     */
    var Amanuensis = {

        /**
         *  Conversation factory
         *
         * @param {ID|*} identifier
         * @returns {Conversation|*}
         */
        getConversation: function (identifier) {
            var facebook = get_facebook();
            // create directly if we can find the entity
            var entity = null;
            if (identifier.isUser()) {
                entity = facebook.getUser(identifier);
            } else if (identifier.isGroup()) {
                entity = facebook.getGroup(identifier);
            }
            if (!entity) {
                return null;
            }
            var chatBox = new Conversation(entity);
            chatBox.database = get_conversation_db();
            return chatBox;
        },

        // allConversations: function () {
        //     var list = [];
        //     var dict = this.__conversations;
        //     var keys = Object.keys(dict);
        //     var chat;
        //     for (var i = 0; i < keys.length; ++i) {
        //         chat = dict[keys[i]];
        //         if (chat instanceof Conversation) {
        //             list.push(chat);
        //         }
        //     }
        //     return list;
        // },
        //
        // addConversation: function (conversation) {
        //     if (!conversation.delegate) {
        //         conversation.delegate = this.__delegate;
        //     }
        //     if (!conversation.dataSource) {
        //         conversation.dataSource = this.__dataSource;
        //     }
        //     var identifier = conversation.getIdentifier();
        //     this.__conversations[identifier] = conversation;
        // },
        //
        // removeConversation: function (conversation) {
        //     var identifier = conversation.getIdentifier();
        //     delete this.__conversations[identifier];
        // },

        /**
         *  Save received message
         *
         * @param {InstantMessage|*} iMsg
         * @returns {boolean}
         */
        saveMessage: function (iMsg) {
            if (Interface.conforms(iMsg.getContent(), ReceiptCommand)) {
                // it's a receipt
                return this.saveReceipt(iMsg);
            }
            var chatBox = get_conversation.call(this, iMsg);
            if (chatBox) {
                return chatBox.insertMessage(iMsg);
            } else {
                // throw new Error('conversation not found for message: ' + iMsg);
                return false;
            }
        },

        /**
         *  Update message state with receipt
         *
         * @param {InstantMessage|*} iMsg
         * @returns {boolean}
         */
        saveReceipt: function (iMsg) {
            var chatBox = get_conversation.call(this, iMsg);
            if (chatBox) {
                return chatBox.saveReceipt(iMsg);
            } else {
                // throw new Error('conversation not found for message: ' + iMsg);
                return false;
            }

            // var target = message_matches_receipt(receipt, chat);
            // if (target) {
            //     var text = receipt.getMessage();
            //     if (sender.equals(receiver)) {
            //         // the receiver's client feedback
            //         if (text && text.indexOf('read')) {
            //             target.getContent().setValue('state', 'read')
            //         } else {
            //             target.getContent().setValue('state', 'arrived')
            //         }
            //     } else if (EntityType.STATION.equals(sender.getType())) {
            //         // delivering or delivered to receiver (station said)
            //         if (text && text.indexOf('delivered')) {
            //             target.getContent().setValue('state', 'delivered')
            //         } else {
            //             target.getContent().setValue('state', 'delivering')
            //         }
            //     } else {
            //         throw new Error('unexpect receipt sender: ' + sender);
            //     }
            //     return true;
            // }
            // console.log('target message not found for receipt', receipt);
        },

        getInstance: function () {
            return this;
        }
    };

    var get_conversation = function (iMsg) {
        // check receiver
        var receiver = iMsg.getReceiver();
        if (receiver.isGroup()) {
            // group chat, get chat box with group ID
            return this.getConversation(receiver);
        }
        // check group
        var group = iMsg.getGroup();
        if (group) {
            // group chat, get chat box with group ID
            return this.getConversation(group);
        }
        // personal chat, get chat box with contact ID
        var facebook = get_facebook();
        var user = facebook.getCurrentUser();
        var sender = iMsg.getSender();
        if (user.getIdentifier().equals(sender)) {
            return this.getConversation(receiver);
        } else {
            return this.getConversation(sender);
        }
    };

    // var message_matches_receipt = function (receipt, conversation) {
    //     var iMsg;
    //     var count = conversation.getMessageCount();
    //     for (var index = count - 1; index >= 0; --index) {
    //         iMsg = conversation.getMessage(index);
    //         if (is_receipt_match(receipt, iMsg)) {
    //             return iMsg;
    //         }
    //     }
    //     return null;
    // };
    // var is_receipt_match = function (receipt, iMsg) {
    //     // check signature
    //     var sig1 = receipt.getValue('signature');
    //     var sig2 = iMsg.getValue('signature');
    //     if (sig1 && sig2 && sig1.length >= 8 && sig2.length >= 8) {
    //         // if contains signature, check it
    //         return sig1.substring(0, 8) === sig2.substring(0, 8);
    //     }
    //
    //     // check envelope
    //     var env1 = receipt.getEnvelope();
    //     var env2 = iMsg.getEnvelope();
    //     if (env1) {
    //         // if contains envelope, check it
    //         return env1.equals(env2);
    //     }
    //
    //     // check serial number
    //     // (only the original message's receiver can know this number)
    //     return receipt.sn === iMsg.getContent().getSerialNumber();
    // };

    //-------- namespace --------
    ns.Amanuensis = Amanuensis;

})(SECHAT, DIMP);
