;

//!require <stargate.js>

!function (ns) {
    'use strict';

    var Storage = ns.stargate.SessionStorage;

    var InstantMessage = ns.InstantMessage;

    var ConversationDataSource = ns.ConversationDataSource;
    var ConversationDelegate = ns.ConversationDelegate;

    var load = function (name) {
        return Storage.loadJSON(name);
    };
    var save = function (name, value) {
        return Storage.saveJSON(value, name);
    };

    var MessageTable = function () {
        this.tables = {}; // ID => Array<InstantMessage>
    };
    ns.Class(MessageTable, null, [ConversationDataSource, ConversationDelegate]);

    var table_name = function (identifier) {
        return identifier.address;
    };
    var store_name = function (identifier) {
        return 'Messages-' + identifier.address;
    };

    /**
     *  Save messages in conversation
     *
     * @param {InstantMessage[]} messages
     * @param {ID} conversation
     * @returns {boolean}
     */
    MessageTable.prototype.saveMessages = function (messages, conversation) {
        this.tables[table_name(conversation)] = messages;
        return save(store_name(conversation), messages);
    };

    /**
     *  Load messages in conversation
     *
     * @param {ID} conversation
     * @returns {*[]}
     */
    MessageTable.prototype.loadMessages = function (conversation) {
        var messages = this.tables[table_name(conversation)];
        if (messages) {
            return messages;
        }
        messages = [];
        var list = load(store_name(conversation));
        if (list) {
            var msg;
            for (var i = 0; i < list.length; ++i) {
                msg = InstantMessage.getInstance(list[i]);
                if (!msg) {
                    throw Error('Message error: ' + list[i]);
                }
                messages.push(msg);
            }
        }
        this.tables[table_name(conversation)] = messages;
        return messages;
    };

    var s_instance = null;

    MessageTable.getInstance = function () {
        if (!s_instance) {
            s_instance = new MessageTable();
        }
        return s_instance;
    };

    //-------- namespace --------
    ns.db.MessageTable = MessageTable;

}(DIMP);

!function (ns) {
    'use strict';

    var NotificationCenter = ns.stargate.NotificationCenter;

    //
    //  ConversationDataSource
    //

    var MessageTable = ns.db.MessageTable;

    MessageTable.prototype.getMessageCount = function (identifier) {
        var messages = this.loadMessages(identifier);
        if (messages) {
            return messages.length;
        } else {
            return 0;
        }
    };

    MessageTable.prototype.getMessage = function (index, identifier) {
        var messages = this.loadMessages(identifier);
        console.assert(messages !== null, 'failed to get messages for conversation: ' + identifier);
        return messages[index];
    };

    //
    //  ConversationDelegate
    //

    MessageTable.prototype.insertMessage = function (iMsg, identifier) {
        var messages = this.loadMessages(identifier);
        if (messages) {
            if (!insert_message(iMsg, messages)) {
                // duplicate message?
                return false;
            }
        } else {
            messages = [iMsg];
        }
        if (this.saveMessages(messages, identifier)) {
            var nc = NotificationCenter.getInstance();
            nc.postNotification(nc.kNotificationMessageReceived, this, iMsg);
        } else {
            throw Error('failed to save message: ' + iMsg);
        }
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

    MessageTable.prototype.removeMessage = function (iMsg, identifier) {
        var messages = this.loadMessages(identifier);
        console.assert(messages !== null, 'failed to get messages for conversation: ' + identifier);
        if (!remove_message(iMsg, messages)) {
            return false;
        }
        return this.saveMessages(messages, identifier);
    };

}(DIMP);
