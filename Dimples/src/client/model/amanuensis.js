;
//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var ReceiptCommand = sdk.protocol.ReceiptCommand;

    var get_conversation_db = function () {
        return ns.ConversationDatabase;
    };

    /**
     *  Conversation pool to manage conversation instances
     *
     *      1st, get instance here to avoid create same instance,
     *      2nd, if their history was updated, we can notice them here immediately
     *
     * @constructor
     */
    ns.Amanuensis = {

        /**
         *  Conversation factory
         *
         * @param {ID|*} identifier
         * @returns {Conversation|*}
         */
        getConversation: function (identifier) {
            var facebook = ns.ClientFacebook.getInstance();
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
            var chatBox = new ns.Conversation(entity);
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
            if (sdk.Interface.conforms(iMsg.getContent(), ReceiptCommand)) {
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
            //     } else if (NetworkType.STATION.equals(sender.getType())) {
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
        var facebook = ns.ClientFacebook.getInstance();
        var sender = iMsg.getSender();
        var user = facebook.getCurrentUser();
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

})(SECHAT, DIMSDK);
