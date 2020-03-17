;

//!require <stargate.js>

!function (ns) {
    'use strict';

    var Storage = ns.stargate.SessionStorage;

    var InstantMessage = ns.InstantMessage;

    var load = function (name) {
        return Storage.loadJSON(name);
    };
    var save = function (name, value) {
        return Storage.saveJSON(value, name);
    };

    var MessageTable = function () {
        this.tables = {}; // ID => Array<InstantMessage>
    };

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
