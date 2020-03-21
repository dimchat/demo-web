
!function (ns, tui, dimp) {
    'use strict';

    var ChatWindow = ns.ChatWindow;
    var GroupChatWindow = ns.GroupChatWindow;

    var ID = dimp.ID;

    var ForwardContent = dimp.protocol.ForwardContent;
    var TextContent = dimp.protocol.TextContent;

    var InstantMessage = dimp.InstantMessage;
    var Envelope = dimp.Envelope;
    var Messenger = dimp.Messenger;

    var MessageTable = dimp.db.MessageTable;

    var NotificationCenter = dimp.stargate.NotificationCenter;

    var ChatroomWindow = function () {
        GroupChatWindow.call(this);
        this.setClassName('chatroomWindow');
        this.setTitle('Chat Room');
    };
    dimp.Class(ChatroomWindow, GroupChatWindow, null);

    ChatroomWindow.prototype.getMessageCount = function () {
        var db = MessageTable.getInstance();
        return db.getMessageCount(ID.EVERYONE);
    };
    ChatroomWindow.prototype.getMessage = function (index) {
        var db = MessageTable.getInstance();
        return db.getMessage(index, ID.EVERYONE);
    };

    ChatroomWindow.prototype.getAdministratorCount = function () {
        return 1;
    };
    ChatroomWindow.prototype.getAdministrator = function (index) {
        return this.__identifier;
    };

    // group members
    ChatroomWindow.prototype.getParticipantCount = function () {
        // TODO: query online users
        return 0;
    };
    ChatroomWindow.prototype.getParticipant = function (index) {
        // TODO: query online users
        console.assert(false, 'error');
        return null;
    };

    ChatroomWindow.prototype.onReceiveNotification = function (notification) {
        var nc = NotificationCenter.getInstance();
        var name = notification.name;
        if (name === nc.kNotificationMessageReceived) {
            var msg = notification.userInfo;
            var env = msg.envelope;
            var identifier = this.__identifier;
            if (ID.EVERYONE.equals(env.receiver) ||
                identifier.equals(env.receiver) ||
                identifier.equals(env.sender)) {
                // reload chat history
                this.historyView.reloadData();
            }
        }
        // TODO: process group members updated notification
    };

    ChatroomWindow.prototype.reloadData = function () {
        ChatWindow.prototype.reloadData.call(this);
        // TODO: query group owner & members
        this.membersView.reloadData();
    };

    //
    //  TableViewDataSource
    //
    ChatroomWindow.prototype.titleForHeaderInSection = function (section, tableView) {
        if (tableView !== this.membersView) {
            return ChatWindow.prototype.titleForHeaderInSection.call(this, section, tableView);
        }
        if (section === 0) {
            return 'Administrator';
        } else {
            return 'Online user(s)';
        }
    };

    //
    //  Send message
    //
    ChatroomWindow.prototype.sendText = function (text) {
        var messenger = Messenger.getInstance();
        var server = messenger.server;
        var user = server.currentUser;
        if (!user) {
            alert('User not login');
            return false;
        }
        var content = new TextContent(text);
        content.setGroup(ID.EVERYONE);
        var env = Envelope.newEnvelope(user.identifier, ID.EVERYONE, 0);
        var msg = InstantMessage.newMessage(content, env);
        messenger.saveMessage(msg);
        msg = messenger.signMessage(messenger.encryptMessage(msg));
        return this.sendContent(new ForwardContent(msg));
    };

    //
    //  Factory
    //
    ChatroomWindow.show = function (admin, clazz) {
        if (!clazz) {
            clazz = ChatroomWindow;
        }
        var box = GroupChatWindow.show(admin, clazz);
        // query history
        var messenger = Messenger.getInstance();
        var server = messenger.server;
        var user = server.currentUser;
        if (user) {
            var content = new TextContent('show history');
            messenger.sendContent(content, admin);
        }
        return box;
    };

    ns.ChatroomWindow = ChatroomWindow;

}(window, tarsier.ui, DIMP);
