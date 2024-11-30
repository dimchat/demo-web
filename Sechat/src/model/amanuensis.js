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
    var Arrays    = sdk.type.Arrays;
    var Log       = sdk.lnc.Log;

    var EntityType       = sdk.protocol.EntityType;
    var ReceiptCommand   = sdk.protocol.ReceiptCommand;
    var HandshakeCommand = sdk.protocol.HandshakeCommand;
    var ReportCommand    = sdk.protocol.ReportCommand;
    var LoginCommand     = sdk.protocol.LoginCommand;
    var MetaCommand      = sdk.protocol.MetaCommand;
    var SearchCommand    = sdk.protocol.SearchCommand;
    var ForwardContent   = sdk.protocol.ForwardContent;
    var InviteCommand    = sdk.protocol.group.InviteCommand;
    var QueryCommand     = sdk.protocol.group.QueryCommand;
    var Conversation     = ns.Conversation;

    var clerk = {
        conversations: null,   // List<Conversation>
        conversationMap: {}  // Map<ID, Conversation>
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

        allConversations: function () {
            var all = clerk.conversations;
            if (!array) {
                return [];
            }
            var array = [];  // List<Conversation>
            var chat;        // Conversation
            for (var i = 0; i < all.length; ++i) {
                chat = all[i];
                if (chat.getIdentifier().isGroup()) {
                    array.push(chat);
                } else if (chat.isBlocked()) {
                    // skip blocked-list
                } else if (chat.isNotFriend()) {
                    // skip stranger
                } else {
                    array.push(chat);
                }
            }
            return array;
        },

        getGroupChats: function () {
            var all = clerk.conversations;
            if (!array) {
                return [];
            }
            var array = [];  // List<Conversation>
            var chat;        // Conversation
            for (var i = 0; i < all.length; ++i) {
                chat = all[i];
                if (chat.getIdentifier().isGroup()) {
                    array.push(chat);
                }
            }
            return array;
        },

        getStrangers: function () {
            var all = clerk.conversations;
            if (!array) {
                return [];
            }
            var array = [];  // List<Conversation>
            var chat;        // Conversation
            for (var i = 0; i < all.length; ++i) {
                chat = all[i];
                if (chat.getIdentifier().isGroup()) {
                    // skip group
                } else if (EntityType.STATION.equals(chat.getIdentifier().getType())) {
                    // skip station
                } else if (chat.isBlocked()) {
                    // skip blocked-list
                } else if (chat.isFriend()) {
                    // skip friends
                } else {
                    array.push(chat);
                }
            }
            return array;
        },

        loadConversations: function () {
            var array = clerk.conversations;
            if (!array) {
                array = [];
                clerk.conversationMap = {};
                var database = ns.GlobalVariable.getDatabase();
                // get ID list from database
                var count = database.numberOfConversations();
                var entity;  // ID
                var chat;    // Conversation
                for (var index = 0; index < count; ++index) {
                    entity = database.conversationAtIndex(index);
                    // build conversations
                    chat = new Conversation(entity);
                    array.push(chat);
                    clerk.conversationMap[entity] = chat;
                }
                clerk.conversations = array;
            }
            return array;
        },

        clearConversation: function (identifier) {
            // 1. clear messages
            var database = ns.GlobalVariable.getDatabase();
            database.removeConversation(identifier);
            // 2. update cache
            return true;
        },

        removeConversation: function (identifier) {
            // 1. clear messages
            var database = ns.GlobalVariable.getDatabase();
            database.removeConversation(identifier);
            // 2. remove from cache
            var chat = clerk.conversationMap[identifier];
            if (chat) {
                Arrays.remove(clerk.conversations, chat);
                delete clerk.conversationMap[identifier];
            }
            return true;
        },

        /**
         *  Save received message
         *
         * @param {InstantMessage|*} iMsg
         * @returns {boolean}
         */
        saveInstantMessage: function (iMsg) {
            var content = iMsg.getContent();
            if (Interface.conforms(content, ReceiptCommand)) {
                // it's a receipt
                return this.saveReceipt(iMsg);
            }
            // TODO: check message type
            //       only save normal message and group commands
            //       ignore 'Handshake', ...
            //       return true to allow responding

            if (Interface.conforms(content, HandshakeCommand)) {
                // handshake command will be processed by CPUs
                // no need to save handshake command here
                return true;
            }
            if (Interface.conforms(content, ReportCommand)) {
                // report command is sent to station,
                // no need to save report command here
                return true;
            }
            if (Interface.conforms(content, LoginCommand)) {
                // login command will be processed by CPUs
                // no need to save login command here
                return true;
            }
            if (Interface.conforms(content, MetaCommand)) {
                // meta & document command will be checked and saved by CPUs
                // no need to save meta & document command here
                return true;
            }
            // if (Interface.conforms(content, MuteCommand) ||
            //     Interface.conforms(content, BlockCommand)) {
            //     // TODO: create CPUs for mute & block command
            //     // no need to save mute & block command here
            //   return true;
            // }
            if (Interface.conforms(content, SearchCommand)) {
                // search result will be parsed by CPUs
                // no need to save search command here
                return true;
            }
            if (Interface.conforms(content, ForwardContent)) {
                // forward content will be parsed, if secret message decrypted, save it
                // no need to save forward content itself
                return true;
            }

            var database = ns.GlobalVariable.getDatabase();

            if (Interface.conforms(content, InviteCommand)) {
                // send keys again
                var me = iMsg.getReceiver();
                var group = content.getGroup();
                var key = database.getCipherKey(me, group, false);
                if (key) {
                    key.removeValue('reused');
                }
            } else if (Interface.conforms(content, QueryCommand)) {
                // FIXME: same query command sent to different members?
                return true;
            }

            var cid = _cid(iMsg.getEnvelope(), content);
            var ok = database.insertMessage(iMsg, cid);
            if (ok) {
                // TODO: save traces
            }
            return ok;
        },

        /**
         *  Update message state with receipt
         *
         * @param {InstantMessage|*} iMsg
         * @returns {boolean}
         */
        saveReceipt: function (iMsg) {
            var content = iMsg.getContent();
            if (!Interface.conforms(content, ReceiptCommand)) {
                Log.error('receipt error', content, iMsg);
                return false;
            }
            Log.info('saving receipt', content, iMsg);
            // TODO:
            return true;
        },

        getInstance: function () {
            return this;
        }
    };

    /**
     *  Get conversation ID for message envelope
     *
     * @param {Envelope} envelope
     * @param {Content} content
     * @return {ID}
     */
    var _cid = function (envelope, content) {
        // check group
        var group = !content ? null : content.getGroup();
        if (!group) {
            group = envelope.getGroup();
        }
        if (group) {
            // group chat, get chat box with group ID
            return group;
        }
        // check receiver
        var receiver = envelope.getReceiver();
        if (receiver.isGroup()) {
            // group chat, get chat box with group ID
            return receiver;
        }
        var facebook = ns.GlobalVariable.getFacebook();
        var user = facebook.getCurrentUser();
        var sender = envelope.getSender();
        if (user.getIdentifier().equals(sender)) {
            return receiver;
        } else {
            return sender;
        }
    };

    //-------- namespace --------
    ns.Amanuensis = Amanuensis;

})(SECHAT, DIMP);
