;
//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var NetworkType = sdk.protocol.NetworkType;
    var ContentType = sdk.protocol.ContentType;
    var Entity = sdk.mkm.Entity;

    var get_facebook = function () {
        return ns.ClientFacebook.getInstance();
    };
    var get_conversation_db = function () {
        return ns.ConversationDatabase;
    };

    var ConversationType = sdk.type.Enum(null, {
        Personal: (NetworkType.MAIN),
        Group: (NetworkType.GROUP)
    });

    var Conversation = function (entity) {
        if (sdk.Interface.conforms(entity, Entity)) {
            entity = entity.getIdentifier();
        }
        this.identifier = entity;
        this.type = get_type(entity);
    };

    var get_type = function (identifier) {
        if (identifier.isUser()) {
            return ConversationType.Personal;
        } else if (identifier.isGroup()) {
            return ConversationType.Group;
        } else {
            throw new TypeError('conversation type error: ' + identifier);
        }
    };

    Conversation.prototype.getIdentifier = function () {
        return this.identifier;
    };

    Conversation.prototype.getTitle = function () {
        var facebook = get_facebook();
        var name = facebook.getName(this.identifier);
        if (this.identifier.isGroup()) {
            var members = facebook.getMembers(this.identifier);
            if (members && members.length > 0) {
                // Group: 'name (123)'
                return name + ' (' + members.length + ')';
            } else {
                return name + ' (...)';
            }
        } else {
            // Person: 'name'
            return name;
        }
    };

    Conversation.prototype.getLastTime = function () {
        var iMsg = this.getLastMessage();
        if (iMsg) {
            return iMsg.getTime();
        } else {
            return new Date(0);
        }
    };

    Conversation.prototype.getLastMessage = function () {
        return get_conversation_db().lastMessage(this.identifier);
    };
    Conversation.prototype.getLastVisibleMessage = function () {
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
        return get_conversation_db().numberOfMessages(this.identifier);
    };
    Conversation.prototype.getNumberOfUnreadMessages = function () {
        return get_conversation_db().numberOfUnreadMessages(this.identifier);
    };

    Conversation.prototype.getMessageAtIndex = function (index) {
        return get_conversation_db().messageAtIndex(index, this.identifier);
    };

    Conversation.prototype.insertMessage = function (iMsg) {
        return get_conversation_db().insertMessage(iMsg, this.identifier);
    };

    Conversation.prototype.removeMessage = function (iMsg) {
        return get_conversation_db().removeMessage(iMsg, this.identifier);
    };

    Conversation.prototype.withdrawMessage = function (iMsg) {
        return get_conversation_db().withdrawMessage(iMsg, this.identifier);
    };

    Conversation.prototype.saveReceipt = function (iMsg) {
        return get_conversation_db().saveReceipt(iMsg, this.identifier);
    };

    //-------- namespace --------
    ns.Conversation = Conversation;

    ns.registers('Conversation');

})(SECHAT, DIMSDK);
