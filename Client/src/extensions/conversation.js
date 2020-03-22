;
//! require <dimsdk.js>

!function (ns) {
    'use strict';

    var ConversationDataSource = function () {
    };
    ns.Interface(ConversationDataSource, null);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Get message count in this conversation for an entity
     *
     * @param {Conversation} conversation
     * @return {Number}
     */
    ConversationDataSource.prototype.getMessageCount = function (conversation) {
        console.assert(false, 'implement me!');
        return 0;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Get message at index of this conversation
     *
     * @param {Number} index
     * @param {Conversation} conversation
     * @returns {InstantMessage}
     */
    ConversationDataSource.prototype.getMessage = function (index, conversation) {
        console.assert(false, 'implement me!');
        return null;
    };

    //-------- namespace --------
    ns.ConversationDataSource = ConversationDataSource;

}(DIMP);

!function (ns) {
    'use strict';

    var ConversationDelegate = function () {
    };
    ns.Interface(ConversationDelegate, null);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Save the new message to local storage
     *
     * @param {InstantMessage} iMsg
     * @param {ID} conversation - contact/group ID
     * @returns boolean
     */
    ConversationDelegate.prototype.insertMessage = function (iMsg, conversation) {
        console.assert(false, 'implement me!');
        return false;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Delete the message
     *
     * @param {InstantMessage} iMsg
     * @param {ID} conversation - contact/group ID
     * @returns {boolean}
     */
    ConversationDelegate.prototype.removeMessage = function (iMsg, conversation) {
        return false;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Try to withdraw the message, maybe won't success
     *
     * @param {InstantMessage} iMsg
     * @param {ID} conversation - contact/group ID
     * @returns {boolean}
     */
    ConversationDelegate.prototype.withdrawMessage = function (iMsg, conversation) {
        console.log('withdraw message not support yet');
        return false;
    };

    //-------- namespace --------
    ns.ConversationDelegate = ConversationDelegate;

}(DIMP);

!function (ns) {
    'use strict';

    var NetworkType = ns.protocol.NetworkType;

    var ConversationType = ns.type.Enum(null, {
        Personal: (NetworkType.Main),
        Group: (NetworkType.Group),
        Unknown: (0x00)
    });

    var Conversation = function (entity) {
        this.__entity = entity;
        // delegates
        this.delegate = null;
        this.dataSource = null;
    };

    Conversation.prototype.getType = function () {
        var identifier = this.getIdentifier();
        if (identifier.isUser()) {
            return ConversationType.Personal;
        } else if (identifier.isGroup()) {
            return ConversationType.Group;
        } else {
            return ConversationType.Unknown;
        }
    };

    Conversation.prototype.getIdentifier = function () {
        return this.__entity.identifier;
    };

    Conversation.prototype.getName = function () {
        return this.__entity.getName();
    };

    Conversation.prototype.getTitle = function () {
        var name = this.__entity.getName();
        var type = this.getType();
        if (ConversationType.Group.equals(type)) {
            var group = this.__entity;
            var members = group.getMembers();
            if (members) {
                name += ' (' + members.length + ')';
            } else {
                name += ' (empty)';
            }
        }
        return name;
    };

    Conversation.prototype.getProfile = function () {
        return this.__entity.getProfile();
    };

    Conversation.prototype.getMessageCount = function () {
        return this.dataSource.getMessageCount(this);
    };

    Conversation.prototype.getMessage = function (index) {
        return this.dataSource.getMessage(index, this);
    };

    Conversation.prototype.lastMessage = function () {
        var count = this.dataSource.getMessageCount(this);
        if (count === 0) {
            return null;
        }
        return this.dataSource.getMessage(count - 1);
    };

    Conversation.prototype.insertMessage = function (iMsg) {
        return this.delegate.insertMessage(iMsg, this.getIdentifier());
    };

    Conversation.prototype.removeMessage = function (iMsg) {
        return this.delegate.removeMessage(iMsg, this.getIdentifier());
    };

    Conversation.prototype.withdrawMessage = function (iMsg) {
        return this.delegate.withdrawMessage(iMsg, this.getIdentifier());
    };

    //-------- namespace --------
    ns.Conversation = Conversation;

}(DIMP);
