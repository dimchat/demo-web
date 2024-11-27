
!function (ns, tui, app, sdk) {
    'use strict';

    var ChatWindow = ns.ChatWindow;
    var UserTableViewCell = ns.UserTableViewCell;

    var TableView = tui.TableView;

    var Class = sdk.type.Class;

    var Observer = sdk.lnc.Observer;

    var get_facebook = function () {
        return app.GlobalVariable.getFacebook();
    };
    // var get_messenger = function () {
    //     return app.GlobalVariable.getMessenger();
    // };

    var GroupChatWindow = function () {
        ChatWindow.call(this);
        this.setClassName('groupChatWindow');
        this.setTitle('Group Chat');

        //
        //  Members View
        //
        var table = new TableView();
        table.setClassName('membersView');
        table.dataSource = this;
        table.delegate = this;
        this.appendChild(table);
        this.membersView = table;
    };
    Class(GroupChatWindow, ChatWindow, [Observer], null);

    // group owner or admin
    GroupChatWindow.prototype.getAdministratorCount = function () {
        var facebook = get_facebook();
        var owner = facebook.getOwner(this.__identifier);
        if (owner) {
            return 1;
        } else {
            return 0;
        }
    };
    GroupChatWindow.prototype.getAdministrator = function (index) {
        var facebook = get_facebook();
        return facebook.getOwner(this.__identifier);
    };

    GroupChatWindow.prototype.reloadData = function () {
        ChatWindow.prototype.reloadData.call(this);
        this.membersView.reloadData();
    };

    //
    //  TableViewDataSource
    //
    GroupChatWindow.prototype.numberOfSections = function (tableView) {
        if (tableView !== this.membersView) {
            return ChatWindow.prototype.numberOfSections.call(this, tableView);
        }
        return 2;
    };

    GroupChatWindow.prototype.titleForHeaderInSection = function (section, tableView) {
        if (tableView !== this.membersView) {
            return ChatWindow.prototype.titleForHeaderInSection.call(this, section, tableView);
        }
        if (section === 0) {
            return 'Owner (administrator)';
        } else {
            var count = this.getParticipantCount();
            if (count === 0) {
                return null;
            } else if (count === 1) {
                return 'Member';
            } else {
                return count + ' members';
            }
        }
    };

    GroupChatWindow.prototype.numberOfRowsInSection = function (section, tableView) {
        if (tableView !== this.membersView) {
            return ChatWindow.prototype.numberOfRowsInSection.call(this, section, tableView);
        }
        if (section === 0) {
            return this.getAdministratorCount();
        } else {
            return this.getParticipantCount();
        }
    };

    GroupChatWindow.prototype.cellForRowAtIndexPath = function (indexPath, tableView) {
        if (tableView !== this.membersView) {
            return ChatWindow.prototype.cellForRowAtIndexPath.call(this, indexPath, tableView);
        }
        var identifier;
        if (indexPath.section === 0) {
            identifier = this.getAdministrator(indexPath.row);
        } else {
            identifier = this.getParticipant(indexPath.row);
        }
        var cell = new UserTableViewCell();
        cell.setClassName('memberCell');
        cell.setIdentifier(identifier);
        return cell;
    };

    ns.GroupChatWindow = GroupChatWindow;

}(dicq, tarsier.ui, SECHAT, DIMP);

!function (ns, tui, app, sdk) {
    'use strict';

    var NotificationNames = app.NotificationNames;
    var ChatWindow = ns.ChatWindow;
    var GroupChatWindow = ns.GroupChatWindow;

    var get_facebook = function () {
        return app.GlobalVariable.getFacebook();
    };
    // var get_messenger = function () {
    //     return app.GlobalVariable.getMessenger();
    // };

    // group members
    GroupChatWindow.prototype.getParticipantCount = function () {
        var facebook = get_facebook();
        var members = facebook.getMembers(this.__identifier);
        if (members) {
            return members.length;
        } else {
            return 0;
        }
    };
    GroupChatWindow.prototype.getParticipant = function (index) {
        var facebook = get_facebook();
        var members = facebook.getMembers(this.__identifier);
        return members[index];
    };

    GroupChatWindow.prototype.onReceiveNotification = function (notification) {
        var name = notification.getName();
        var userInfo = notification.getUserInfo();
        if (name === NotificationNames.MessageUpdated) {
            var msg = userInfo['msg'];
            var content = msg.getContent();
            var identifier = this.__identifier;
            if (identifier.equals(content.getGroup())) {
                // reload chat history
                this.historyView.reloadData();
                this.historyView.scrollToBottom();
            }
            // TODO: process group members updated notification
        }
    };

    //
    //  Factory
    //
    GroupChatWindow.show = function (identifier, clazz) {
        if (!clazz) {
            clazz = GroupChatWindow;
        }
        return ChatWindow.show(identifier, clazz);
    };

}(dicq, tarsier.ui, SECHAT, DIMP);
