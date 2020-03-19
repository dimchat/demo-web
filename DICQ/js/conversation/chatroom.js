
!function (ns, tui, dimp) {
    'use strict';

    var ChatWindow = ns.ChatWindow;
    var GroupChatWindow = ns.GroupChatWindow;

    var ID = dimp.ID;
    var User = dimp.User;

    var InstantMessage = dimp.InstantMessage;
    var Envelope = dimp.Envelope;
    var ForwardContent = dimp.ForwardContent;
    var TextContent = dimp.TextContent;
    var Messenger = dimp.Messenger;

    var ChatroomWindow = function () {
        GroupChatWindow.call(this);
        this.setClassName('chatroomWindow');
        this.setTitle('Chat Room');
    };
    ChatroomWindow.prototype = Object.create(GroupChatWindow.prototype);
    ChatroomWindow.prototype.constructor = ChatroomWindow;

    ChatroomWindow.prototype.setIdentifier = function (identifier) {
        ChatWindow.prototype.setIdentifier.call(this, identifier);
        // TODO: update online users
    };

    ChatroomWindow.prototype.setAdmin = function (admin) {
        if (admin instanceof User) {
            admin = admin.identifier;
        }
        this.setIdentifier(admin);
    };

    ChatroomWindow.prototype.sendText = function (text) {
        var messenger = Messenger.getInstance();
        var server = messenger.server;
        var user = server.currentUser;
        if (!user) {
            alert('User not login');
            return false;
        }
        var content = new TextContent(text);
        var env = Envelope.newEnvelope(user.identifier, ID.EVERYONE, 0);
        var msg = InstantMessage.newMessage(content, env);
        msg = messenger.signMessage(messenger.encryptMessage(msg));
        return this.sendContent(new ForwardContent(msg));
    };

    ChatroomWindow.show = function (admin, clazz) {
        if (admin instanceof User) {
            admin = admin.identifier;
        }
        if (!clazz) {
            clazz = ChatroomWindow;
        }
        return GroupChatWindow.show(admin, clazz);
    };

    ns.ChatroomWindow = ChatroomWindow;

}(window, tarsier.ui, DIMP);
