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

//! require <dimples.js>

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var ID    = ns.protocol.ID;

    /**
     *  Storage for Conversations
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    var MessageStorage = function () {
        Object.call(this);
        this.__instant_messages = {};   // str(receiver) => InstantMessage[]
    };
    Class(MessageStorage, Object, null, null);

    var insert_msg = function (messages, msg) {
        var pos = messages.length - 1;
        var msg_time = msg.getFloat('time', 0);
        if (msg_time === 0) {
            // new message has no time, just append to the tail
            messages.push(msg);
            return pos + 1;
        }
        // seek message with time
        var item, item_time;
        var i;
        for (i = pos; i >= 0; --i) {
            item = messages[i];
            item_time = item.getFloat('time', 0);
            if (item_time <= 0) {
                // skip message without time
                continue;
            }
            if (item_time <= msg_time) {
                // insert after here
                pos = i;
                break;
            } else {
                pos = i - 1;
            }
        }
        messages.splice(pos + 1, 0, msg);
        return pos + 1;
    };

    //---- conversations

    /**
     *  Get how many chat boxes
     *
     * @return {uint} conversations count
     */
    MessageStorage.prototype.numberOfConversations = function () {
        var keys = Object.keys(this.__instant_messages);
        return keys.length;
    };

    /**
     *  Get chat box info
     *
     * @param {uint} index - sorted index
     * @return {ID} conversation ID
     */
    MessageStorage.prototype.conversationAtIndex = function (index) {
        var keys = Object.keys(this.__instant_messages);
        return ID.parse(keys[index]);
    };

    /**
     *  Remove one chat box
     *
     * @param index - chat box index
     * @return {boolean} true on row(s) affected
     */
    MessageStorage.prototype.removeConversationAtIndex = function (index) {
        var keys = Object.keys(this.__instant_messages);
        delete this.__instant_messages[keys[index]];
    };

    /**
     *  Remove the chat box
     *
     * @param {ID} entity - conversation ID
     * @return {boolean} true on row(s) affected
     */
    MessageStorage.prototype.removeConversation = function (entity) {
        delete this.__instant_messages[entity.toString()];
    };

    //-------- messages

    /**
     *  Get message count in this conversation for an entity
     *
     * @param {ID} entity - conversation ID
     * @return {uint} total count
     */
    MessageStorage.prototype.numberOfMessages = function (entity) {
        var messages = this.__instant_messages[entity.toString()];
        if (messages) {
            return messages.length;
        } else {
            return 0;
        }
    };

    /**
     *  Get unread message count in this conversation for an entity
     *
     * @param {ID} entity - conversation ID
     * @return {uint} unread count
     */
    MessageStorage.prototype.numberOfUnreadMessages = function (entity) {
    };

    /**
     *  Clear unread flag in this conversation for an entity
     *
     * @param {ID} entity - conversation ID
     * @return {boolean} true on row(s) affected
     */
    MessageStorage.prototype.clearUnreadMessages = function (entity) {
    };

    /**
     *  Get last message of this conversation
     *
     * @param {ID} entity - conversation ID
     * @return {InstantMessage} instant message
     */
    MessageStorage.prototype.lastMessage = function (entity) {
        var messages = this.__instant_messages[entity.toString()];
        if (messages && messages.length > 0) {
            return messages[messages.length - 1];
        } else {
            return null;
        }
    };

    /**
     *  Get message at index of this conversation
     *
     * @param {uint} index - start from 0, latest first
     * @param {ID} entity - conversation ID
     * @return {InstantMessage} instant message
     */
    MessageStorage.prototype.messageAtIndex = function (index, entity) {
        var messages = this.__instant_messages[entity.toString()];
        // console.assert(messages !== null, 'failed to get messages for conversation: ' + entity);
        return messages[index];
    };

    /**
     *  Save the new message to local storage
     *
     * @param {InstantMessage} iMsg - instant message
     * @param {ID} entity - conversation ID
     * @return {boolean} true on success
     */
    MessageStorage.prototype.insertMessage = function (iMsg, entity) {
        var cid = entity.toString();
        var messages = this.__instant_messages[cid];
        if (!messages/* || messages.length === 0*/) {
            this.__instant_messages[cid] = [iMsg];
            return true;
        }
        var pos = find_instant(messages, iMsg);
        if (pos < 0) {
            // insert and sorted by time
            insert_msg(messages, iMsg);
            return true;
        }
        // duplicated
        messages[pos] = iMsg;
        return true;
    };

    /**
     *  Delete the message
     *
     * @param {InstantMessage} iMsg - instant message
     * @param {ID} entity - conversation ID
     * @return {boolean} true on row(s) affected
     */
    MessageStorage.prototype.removeMessage = function (iMsg, entity) {
        var cid = entity.toString();
        var messages = this.__instant_messages[cid];
        if (!messages/* || messages.length === 0*/) {
            // no message for this conversation
            return false;
        }
        var pos = find_instant(messages, iMsg);
        if (pos < 0) {
            // not found
            return false;
        }
        if (messages.length === 1) {
            // only one message
            delete this.__instant_messages[cid];
        } else {
            messages.splice(pos, 1);
        }
        return true;
    };

    var find_instant = function (messages, msg) {
        var sn = msg.getContent().getSerialNumber();
        for (var i = messages.length - 1; i >= 0; --i) {
            if (messages[i].getContent().getSerialNumber() === sn) {
                return i;
            }
        }
        return -1;
    };

    /**
     *  Try to withdraw the message, maybe won't success
     *
     * @param {InstantMessage} iMsg - instant message
     * @param {ID} entity - conversation ID
     * @return {boolean} true on success
     */
    MessageStorage.prototype.withdrawMessage = function (iMsg, entity) {
    };

    /**
     *  Update message state with receipt
     *
     * @param {InstantMessage} iMsg - message with receipt content
     * @param {ID} entity - conversation ID
     * @return {boolean} true while target message found
     */
    MessageStorage.prototype.saveReceipt = function (iMsg, entity) {
    };

    //-------- namespace --------
    ns.database.MessageStorage = MessageStorage;

})(DIMP);
