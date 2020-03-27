
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

    //
    //  TableViewDataSource
    //
    ChatroomWindow.prototype.titleForHeaderInSection = function (section, tableView) {
        if (tableView !== this.membersView) {
            return ChatWindow.prototype.titleForHeaderInSection.call(this, section, tableView);
        }
        // if (section === 0) {
        //     return 'Administrator';
        // } else {
        //     return 'Online user(s)';
        // }
        return null;
    };

    ChatroomWindow.prototype.numberOfRowsInSection = function (section, tableView) {
        if (tableView !== this.membersView) {
            return ChatWindow.prototype.numberOfRowsInSection.call(this, section, tableView);
        }
        if (section === 0) {
            // return this.getAdministratorCount();
            return 0;
        } else {
            return this.getParticipantCount();
        }
    };

    //
    //  Send message
    //
    ChatroomWindow.prototype.sendText = function (text) {
        if (!text) {
            return ;
        }
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

    ns.ChatroomWindow = ChatroomWindow;

}(dicq, tarsier.ui, DIMP);

!function (ns, tui, dimp) {
    'use strict';

    var ID = dimp.ID;

    var TextContent = dimp.protocol.TextContent;
    var SearchCommand = dimp.protocol.SearchCommand;

    var Facebook = dimp.Facebook;
    var Messenger = dimp.Messenger;

    var NotificationCenter = dimp.stargate.NotificationCenter;

    var GroupChatWindow = ns.GroupChatWindow;
    var ChatroomWindow = ns.ChatroomWindow;

    // group members
    ChatroomWindow.prototype.getParticipantCount = function () {
        return online_users.length;
    };
    ChatroomWindow.prototype.getParticipant = function (index) {
        return online_users[index];
    };

    ChatroomWindow.prototype.onReceiveNotification = function (notification) {
        var nc = NotificationCenter.getInstance();
        var name = notification.name;
        if (name === nc.kNotificationMessageReceived) {
            var msg = notification.userInfo;
            if (ID.EVERYONE.equals(msg.content.getGroup())) {
                // reload chat history
                this.historyView.reloadData();
                this.historyView.scrollToBottom();
            } else if (msg.content instanceof SearchCommand) {
                var command = msg.content.getCommand();
                if (command === SearchCommand.ONLINE_USERS) {
                    // process chatroom users updated notification
                    update_users(msg.content);
                    // reload online users
                    this.membersView.reloadData();
                }
            }
        }
    };

    ChatroomWindow.prototype.onClose = function (ev) {
        stop_query_users();
        return GroupChatWindow.prototype.onClose.call(this, ev);
    };

    //
    //  Factory
    //
    ChatroomWindow.show = function (admin, clazz) {
        if (!clazz) {
            clazz = ChatroomWindow;
        }
        var box = GroupChatWindow.show(admin, clazz);
        query_history(admin);
        start_query_users(admin);
        return box;
    };

    //
    //  Chat history
    //

    var query_history = function (admin) {
        var messenger = Messenger.getInstance();
        var server = messenger.server;
        var user = server.currentUser;
        if (user) {
            var content = new TextContent('show history');
            messenger.sendContent(content, admin);
        }
    };


    //
    //  Online users
    //

    var online_users = [];
    var interval = null;

    var update_users = function (cmd) {
        var users = cmd.getUsers();
        if (!users) {
            return ;
        }
        var facebook = Facebook.getInstance();
        online_users = [];
        var item;
        for (var i = 0; i < users.length; ++i) {
            item = facebook.getIdentifier(users[i]);
            if (!item) {
                console.error('user ID error: ' + users[i]);
                continue;
            }
            online_users.push(item);
        }
    };

    var query_users = function (admin) {
        var messenger = Messenger.getInstance();
        var server = messenger.server;
        var user = server.currentUser;
        if (user) {
            var content = new TextContent('show users');
            messenger.sendContent(content, admin);
        }
    };

    var start_query_users = function (admin) {
        // stop thread
        stop_query_users();
        // query once
        query_users(admin);
        // query every 5 minutes
        interval = setInterval(function () {
            query_users(admin);
        }, 60*1000);
    };
    var stop_query_users = function () {
        if (interval) {
            clearInterval(interval);
        }
        interval = null;
    };

}(dicq, tarsier.ui, DIMP);
