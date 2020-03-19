
!function (ns, tui, dimp) {
    'use strict';

    var ChatWindow = ns.ChatWindow;

    var View = tui.View;

    var Group = dimp.Group;

    var GroupChatWindow = function () {
        ChatWindow.call(this);
        this.setClassName('groupChatWindow');
        this.setTitle('Group Chat');
        //
        //  Members
        //
        var members = new View();
        members.setId('membersView');
        members.setClassName('membersView');
        this.appendChild(members);
        this.membersView = members;
    };
    GroupChatWindow.prototype = Object.create(ChatWindow.prototype);
    GroupChatWindow.prototype.constructor = GroupChatWindow;

    GroupChatWindow.prototype.setIdentifier = function (identifier) {
        ChatWindow.prototype.setIdentifier.call(this, identifier);
        // TODO: update group members
    };

    GroupChatWindow.prototype.setGroup = function (group) {
        if (group instanceof Group) {
            group = group.identifier;
        }
        this.setIdentifier(group);
    };

    GroupChatWindow.show = function (identifier, clazz) {
        if (!clazz) {
            clazz = GroupChatWindow;
        }
        return ChatWindow.show(identifier, clazz);
    };

    ns.GroupChatWindow = GroupChatWindow;

}(window, tarsier.ui, DIMP);
