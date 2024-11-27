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

    var Interface   = sdk.type.Interface;
    var ContentType = sdk.protocol.ContentType;
    var Entity      = sdk.mkm.Entity;

    /**
     *  Chat Info
     *  ~~~~~~~~~
     */
    var Conversation = function (entity) {
        if (Interface.conforms(entity, Entity)) {
            entity = entity.getIdentifier();
        }
        this.__identifier = entity;
    };

    Conversation.prototype.getIdentifier = function () {
        return this.__identifier;
    };

    Conversation.prototype.isBlocked = function () {
        return false;
    };

    Conversation.prototype.isNotFriend = function () {
        return false;
    };
    Conversation.prototype.isFriend = function () {
        return true;
    };

    Conversation.prototype.getTitle = function () {
        var facebook = ns.GlobalVariable.getFacebook();
        var identifier = this.getIdentifier();
        var name = facebook.getName(identifier);
        if (identifier.isGroup()) {
            var members = facebook.getMembers(identifier);
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
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.lastMessage(identifier);
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
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.numberOfMessages(identifier);
    };
    Conversation.prototype.getNumberOfUnreadMessages = function () {
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.numberOfUnreadMessages(identifier);
    };

    Conversation.prototype.getMessageAtIndex = function (index) {
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.messageAtIndex(index, identifier);
    };

    Conversation.prototype.insertMessage = function (iMsg) {
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.insertMessage(iMsg, identifier);
    };

    Conversation.prototype.removeMessage = function (iMsg) {
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.removeMessage(iMsg, identifier);
    };

    Conversation.prototype.withdrawMessage = function (iMsg) {
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.withdrawMessage(iMsg, identifier);
    };

    Conversation.prototype.saveReceipt = function (iMsg) {
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.saveReceipt(iMsg, identifier);
    };

    //-------- namespace --------
    ns.Conversation = Conversation;

})(SECHAT, DIMP);
