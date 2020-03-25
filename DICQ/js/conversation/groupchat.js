
!function (ns, tui, dimp) {
    'use strict';

    var ChatWindow = ns.ChatWindow;

    var TableViewCell = tui.TableViewCell;
    var TableView = tui.TableView;

    var Facebook = dimp.Facebook;

    var GroupChatWindow = function () {
        ChatWindow.call(this);
        this.setClassName('groupChatWindow');
        this.setTitle('Group Chat');

        //
        //  Members View
        //
        var table = new TableView();
        table.setId('membersView');
        table.setClassName('membersView');
        table.dataSource = this;
        table.delegate = this;
        this.appendChild(table);
        this.membersView = table;
    };
    dimp.Class(GroupChatWindow, ChatWindow, null);

    // group owner or admin
    GroupChatWindow.prototype.getAdministratorCount = function () {
        var facebook = Facebook.getInstance();
        var owner = facebook.getOwner(this.__identifier);
        if (owner) {
            return 1;
        } else {
            return 0;
        }
    };
    GroupChatWindow.prototype.getAdministrator = function (index) {
        var facebook = Facebook.getInstance();
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
        var cell = new TableViewCell();
        cell.setClassName('memberCell');

        var facebook = Facebook.getInstance();
        var name = facebook.getNickname(identifier);
        if (!name) {
            name = identifier.name;
        }
        var number = facebook.getNumberString(identifier);
        cell.setText(name + ' (' + number + ')');
        if (facebook.getPrivateKeyForSignature(identifier)) {
            cell.setClassName('me');
        }
        return cell;
    };

    GroupChatWindow.prototype.didSelectRowAtIndexPath = function(indexPath, tableView) {
        var identifier;
        if (indexPath.section === 0) {
            identifier = this.getAdministrator(indexPath.row);
        } else {
            identifier = this.getParticipant(indexPath.row);
        }
        ns.UserWindow.show(identifier);
    };

    ns.GroupChatWindow = GroupChatWindow;

}(dicq, tarsier.ui, DIMP);

!function (ns, tui, dimp) {
    'use strict';

    var NotificationCenter = dimp.stargate.NotificationCenter;

    var Facebook = dimp.Facebook;

    var ChatWindow = ns.ChatWindow;
    var GroupChatWindow = ns.GroupChatWindow;

    // group members
    GroupChatWindow.prototype.getParticipantCount = function () {
        var facebook = Facebook.getInstance();
        var members = facebook.getMembers(this.__identifier);
        if (members) {
            return members.length;
        } else {
            return 0;
        }
    };
    GroupChatWindow.prototype.getParticipant = function (index) {
        var facebook = Facebook.getInstance();
        var members = facebook.getMembers(this.__identifier);
        return members[index];
    };

    GroupChatWindow.prototype.onReceiveNotification = function (notification) {
        var nc = NotificationCenter.getInstance();
        var name = notification.name;
        if (name === nc.kNotificationMessageReceived) {
            var msg = notification.userInfo;
            var content = msg.content;
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

}(dicq, tarsier.ui, DIMP);
