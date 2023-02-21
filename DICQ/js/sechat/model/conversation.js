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

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var Interface = sdk.type.Interface;
    var Enum = sdk.type.Enum;
    var EntityType = sdk.protocol.EntityType;
    var ContentType = sdk.protocol.ContentType;
    var Entity = sdk.mkm.Entity;

    var get_facebook = function () {
        return ns.GlobalVariable.getInstance().facebook;
    };
    // var get_messenger = function () {
    //     return app.GlobalVariable.getInstance().messenger;
    // };
    var get_conversation_db = function () {
        return ns.GlobalVariable.getInstance().database;
    };

    var ConversationType = Enum(null, {
        Personal: (EntityType.USER),
        Group: (EntityType.GROUP)
    });

    var Conversation = function (entity) {
        if (Interface.conforms(entity, Entity)) {
            entity = entity.getIdentifier();
        }
        this.identifier = entity;
        this.type = get_type(entity);
        this.db = get_conversation_db();
    };
    var get_type = function (identifier) {
        if (identifier.isGroup()) {
            return ConversationType.Group;
        }
        return ConversationType.Personal;
    };

    Conversation.prototype.getIdentifier = function () {
        return this.identifier;
    };

    Conversation.prototype.getTitle = function () {
        var facebook = get_facebook();
        var name = facebook.getName(this.identifier);
        if (this.identifier.isGroup()) {
            var members = facebook.getMembers(this.identifier);
            var count = !members ? 0 : members.length;
            if (count === 0) {
                return name + ' (...)';
            }
            // Group: 'name (123)'
            return name + ' (' + count + ')';
        } else {
            // Person: 'name'
            return name;
        }
    };

    Conversation.prototype.getLastTime = function () {
        var iMsg = this.getLastMessage();
        var time = !iMsg ? null : iMsg.getTime();
        return time || new Date(0);
    };

    Conversation.prototype.getLastMessage = function () {
        return this.db.lastMessage(this.identifier);
    };
    Conversation.prototype.getLastVisibleMessage = function () {
        // return this.db.lastMessage(this.identifier);
        var count = this.getNumberOfMessages();
        var iMsg, type;
        for (var index = count - 1; index >= 0; --index) {
            iMsg = this.getMessageAtIndex(index);
            if (!iMsg) {
                // error
                continue;
            }
            type = iMsg.getType();
            if (ContentType.TEXT.equals(type) ||
                ContentType.FILE.equals(type) ||
                ContentType.IMAGE.equals(type) ||
                ContentType.AUDIO.equals(type) ||
                ContentType.VIDEO.equals(type) ||
                ContentType.PAGE.equals(type) ||
                ContentType.MONEY.equals(type) ||
                ContentType.TRANSFER.equals(type)) {
                // got it
                return iMsg;
            }
        }
        return null;
    };

    Conversation.prototype.getNumberOfMessages = function () {
        return this.db.numberOfMessages(this.identifier);
    };
    Conversation.prototype.getNumberOfUnreadMessages = function () {
        return this.db.numberOfUnreadMessages(this.identifier);
    };

    Conversation.prototype.getMessageAtIndex = function (index) {
        return this.db.messageAtIndex(index, this.identifier);
    };

    Conversation.prototype.insertMessage = function (iMsg) {
        return this.db.insertMessage(iMsg, this.identifier);
    };

    Conversation.prototype.removeMessage = function (iMsg) {
        return this.db.removeMessage(iMsg, this.identifier);
    };

    Conversation.prototype.withdrawMessage = function (iMsg) {
        return this.db.withdrawMessage(iMsg, this.identifier);
    };

    Conversation.prototype.saveReceipt = function (iMsg) {
        return this.db.saveReceipt(iMsg, this.identifier);
    };

    //-------- namespace --------
    ns.Conversation = Conversation;

})(SECHAT, DIMP);
