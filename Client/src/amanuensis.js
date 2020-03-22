;
//! require <dimsdk.js>

!function (ns) {
    'use strict';

    var NetworkType = ns.protocol.NetworkType;
    var ReceiptCommand = ns.protocol.ReceiptCommand;

    var Facebook = ns.Facebook;
    var Conversation = ns.Conversation;

    var MessageTable = ns.db.MessageTable;

    /**
     *  Conversation pool to manage conversation instances
     *
     *      1st, get instance here to avoid create same instance,
     *      2nd, if their history was updated, we can notice them here immediately
     *
     * @constructor
     */
    var Amanuensis = function () {
        this.__conversations = {};  // ID => Conversation
        // delegates
        this.__delegate = MessageTable.getInstance();
        this.__dataSource = MessageTable.getInstance();
    };

    Amanuensis.prototype.setDelegate = function (delegate) {
        if (delegate) {
            var list = this.allConversations();
            var chat;
            for (var i = 0; i < list.length; ++i) {
                chat = list[i];
                if (!chat.delegate) {
                    chat.delegate = delegate;
                }
            }
        }
        this.__delegate = delegate;
    };
    Amanuensis.prototype.setDataSource = function (dataSource) {
        if (dataSource) {
            var list = this.allConversations();
            var chat;
            for (var i = 0; i < list.length; ++i) {
                chat = list[i];
                if (!chat.dataSource) {
                    chat.dataSource = dataSource;
                }
            }
        }
        this.__dataSource = dataSource;
    };

    /**
     *  Conversation factory
     *
     * @param {ID|*} identifier
     * @returns {Conversation}
     */
    Amanuensis.prototype.getConversation = function (identifier) {
        var chat = this.__conversations[identifier];
        if (!chat) {
            var facebook = Facebook.getInstance();
            var entity;
            // get entity with ID
            if (identifier.isUser()) {
                entity = facebook.getUser(identifier);
            } else if (identifier.isGroup()) {
                entity = facebook.getGroup(identifier);
            } else {
                throw TypeError('ID error: ' + identifier);
            }
            if (entity) {
                // create conversation if we can find the entity
                chat = new Conversation(entity);
            } else {
                throw Error('failed to create conversation: ' + identifier);
            }
            this.addConversation(chat);
        }
        return chat;
    };

    Amanuensis.prototype.allConversations = function () {
        var list = [];
        var dict = this.__conversations;
        var keys = Object.keys(dict);
        var chat;
        for (var i = 0; i < keys.length; ++i) {
            chat = dict[keys[i]];
            if (chat instanceof Conversation) {
                list.push(chat);
            }
        }
        return list;
    };
    Amanuensis.prototype.addConversation = function (conversation) {
        if (!conversation.delegate) {
            conversation.delegate = this.__delegate;
        }
        if (!conversation.dataSource) {
            conversation.dataSource = this.__dataSource;
        }
        var identifier = conversation.getIdentifier();
        this.__conversations[identifier] = conversation;
    };
    Amanuensis.prototype.removeConversation = function (conversation) {
        var identifier = conversation.getIdentifier();
        delete this.__conversations[identifier];
    };

    /**
     *  Save received message
     *
     * @param {InstantMessage|*} iMsg
     * @returns {boolean}
     */
    Amanuensis.prototype.saveMessage = function (iMsg) {
        var content = iMsg.content;
        if (content instanceof ReceiptCommand) {
            // it's a receipt
            return this.saveReceipt(iMsg);
        }
        var facebook = Facebook.getInstance();
        var env = iMsg.envelope;
        var sender = facebook.getIdentifier(env.sender);
        var receiver = facebook.getIdentifier(env.receiver);
        var group = facebook.getIdentifier(content.getGroup());

        var chat;
        if (receiver.isGroup()) {
            // group chat, get chat box with group ID
            chat = this.getConversation(receiver);
        } else if (group) {
            // group chat, get chat box with group ID
            chat = this.getConversation(group);
        } else {
            // personal chat, get chat box with contact ID
            if (facebook.getPrivateKeyForSignature(sender)) {
                chat = this.getConversation(receiver);
            } else {
                chat = this.getConversation(sender);
            }
        }

        if (chat) {
            return chat.insertMessage(iMsg);
        } else {
            throw Error('conversation not found for message: ' + iMsg);
        }
    };

    /**
     *  Update message state with receipt
     *
     * @param {InstantMessage|*} iMsg
     * @returns {boolean}
     */
    Amanuensis.prototype.saveReceipt = function (iMsg) {
        var receipt = iMsg.content;
        if (!(receipt instanceof ReceiptCommand)) {
            throw Error('this is not a receipt: ' + iMsg);
        }
        var facebook = Facebook.getInstance();

        // NOTE: this is the receipt's commander,
        //       it can be a station, or the original message's receiver
        var sender = facebook.getIdentifier(iMsg.envelope.sender);

        // NOTE: this is the original message's receiver
        var env = receipt.getEnvelope();
        var receiver;
        if (env) {
            receiver = facebook.getIdentifier(env.receiver);
        } else {
            receiver = null;
        }

        // FIXME: only the real receiver will know the exact message detail, so
        //        the station may not know if this is a group message.
        //        maybe we should try another way to search the exact conversation.
        var group = facebook.getIdentifier(receipt.getGroup());

        if (!receiver) {
            console.log('receiver not found, is is not a receipt for instant message', iMsg);
            return false;
        }

        var chat;
        if (group) {
            // group chat, get chat box with group ID
            chat = this.getConversation(group);
        } else {
            // personal chat, get chat box with contact ID
            chat = this.getConversation(receiver);
        }
        console.assert(chat !== null, 'chat box not found for receipt: ' + receipt);

        var target = message_matches_receipt(receipt, chat);
        if (target) {
            var text = receipt.getMessage();
            if (sender.equals(receiver)) {
                // the receiver's client feedback
                if (text && text.indexOf('read')) {
                    target.content.setValue('state', 'read')
                } else {
                    target.content.setValue('state', 'arrived')
                }
            } else if (NetworkType.Station.equals(sender.getType())) {
                // delivering or delivered to receiver (station said)
                if (text && text.indexOf('delivered')) {
                    target.content.setValue('state', 'delivered')
                } else {
                    target.content.setValue('state', 'delivering')
                }
            } else {
                console.error('unexpect receipt sender: ' + sender);
                return false;
            }
            return true;
        }

        console.error('target message not found for receipt: ' + receipt);
        return false;
    };

    var message_matches_receipt = function (receipt, conversation) {
        var iMsg;
        var count = conversation.getMessageCount();
        for (var index = count - 1; index >= 0; --index) {
            iMsg = conversation.getMessage(index);
            if (is_receipt_match(receipt, iMsg)) {
                return iMsg;
            }
        }
        return null;
    };
    var is_receipt_match = function (receipt, iMsg) {
        // check signature
        var sig1 = receipt.getValue('signature');
        var sig2 = iMsg.getValue('signature');
        if (sig1 && sig2 && sig1.length >= 8 && sig2.length >= 8) {
            // if contains signature, check it
            return sig1.substring(0, 8) === sig2.substring(0, 8);
        }

        // check envelope
        var env1 = receipt.getEnvelope();
        var env2 = iMsg.envelope;
        if (env1) {
            // if contains envelope, check it
            return env1.equals(env2);
        }

        // check serial number
        // (only the original message's receiver can know this number)
        return receipt.sn === iMsg.content.sn;
    };

    var s_clerk = null;
    Amanuensis.getInstance = function () {
        if (!s_clerk) {
            s_clerk = new Amanuensis();
        }
        return s_clerk;
    };

    //-------- namespace --------
    ns.Amanuensis = Amanuensis;

}(DIMP);
