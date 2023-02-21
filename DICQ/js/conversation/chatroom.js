
!function (ns, tui, app, sdk) {
    'use strict';

    var ChatWindow = ns.ChatWindow;
    var GroupChatWindow = ns.GroupChatWindow;

    var Class = sdk.type.Class;
    var ID = sdk.protocol.ID;

    var ForwardContent = sdk.protocol.ForwardContent;
    var TextContent = sdk.protocol.TextContent;

    var InstantMessage = sdk.protocol.InstantMessage;
    var Envelope = sdk.protocol.Envelope;

    var get_messenger = function () {
        return app.GlobalVariable.getInstance().messenger;
    };

    var get_message_db = function () {
        return app.db.MessageTable;
    };

    var ChatroomWindow = function () {
        GroupChatWindow.call(this);
        this.setClassName('chatroomWindow');
        this.setTitle('Chat Room');
    };
    Class(ChatroomWindow, GroupChatWindow, null, null);

    ChatroomWindow.prototype.getMessageCount = function () {
        var db = get_message_db();
        return db.numberOfMessages(ID.EVERYONE);
    };
    ChatroomWindow.prototype.getMessage = function (index) {
        var db = get_message_db();
        return db.messageAtIndex(index, ID.EVERYONE);
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
        var messenger = get_messenger();
        var server = messenger.getCurrentStation();
        var user = server.getCurrentUser();
        if (!user) {
            alert('User not login');
            return false;
        }
        var content = new TextContent(text);
        content.setGroup(ID.EVERYONE);
        var env = Envelope.create(user.getIdentifier(), ID.EVERYONE, 0);
        var msg = InstantMessage.create(env, content);
        messenger.saveMessage(msg);
        msg = messenger.signMessage(messenger.encryptMessage(msg));
        return this.sendContent(new ForwardContent(msg));
    };

    ns.ChatroomWindow = ChatroomWindow;

}(dicq, tarsier.ui, SECHAT, DIMP);

!function (ns, tui, app, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;

    var TextContent = sdk.protocol.TextContent;

    var SearchCommand = app.protocol.SearchCommand;
    var NotificationNames = app.NotificationNames;
    var GroupChatWindow = ns.GroupChatWindow;
    var ChatroomWindow = ns.ChatroomWindow;

    var get_messenger = function () {
        return app.GlobalVariable.getInstance().messenger;
    };

    // group members
    ChatroomWindow.prototype.getParticipantCount = function () {
        return online_users.length;
    };
    ChatroomWindow.prototype.getParticipant = function (index) {
        return online_users[index];
    };

    ChatroomWindow.prototype.onReceiveNotification = function (notification) {
        var name = notification.name;
        var userInfo = notification.userInfo;
        if (name === NotificationNames.MessageUpdated) {
            var msg = userInfo['msg'];
            if (ID.EVERYONE.equals(msg.getGroup())) {
                // reload chat history
                this.historyView.reloadData();
                this.historyView.scrollToBottom();
            } else if (msg.getContent() instanceof SearchCommand) {
                var command = msg.getContent().getCommand();
                if (command === SearchCommand.ONLINE_USERS) {
                    // process chatroom users updated notification
                    update_users(msg.getContent());
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
        start_query_users(admin);
        query_history(admin);
        return box;
    };

    //
    //  Chat history
    //

    var query_history = function (admin) {
        var messenger = get_messenger();
        var server = messenger.getCurrentStation();
        var user = server.getCurrentUser();
        if (user) {
            var content = new TextContent('show history');
            messenger.sendContent(null, admin, content, null, 0);
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
        online_users = [];
        var item;
        for (var i = 0; i < users.length; ++i) {
            item = ID.parse(users[i]);
            if (!item) {
                console.error('user ID error: ' + users[i]);
                continue;
            }
            online_users.push(item);
        }
    };

    var query_users = function (admin) {
        var messenger = get_messenger();
        var server = messenger.getCurrentStation();
        var user = server.getCurrentUser();
        if (user) {
            var content = new TextContent('show users');
            messenger.sendContent(null, admin, content, null, 0);
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

}(dicq, tarsier.ui, SECHAT, DIMP);
