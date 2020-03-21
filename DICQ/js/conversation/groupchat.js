
!function (ns, tui, dimp) {
    'use strict';

    var ChatWindow = ns.ChatWindow;

    var TableViewCell = tui.TableViewCell;
    var TableView = tui.TableView;

    var NotificationCenter = dimp.stargate.NotificationCenter;

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

    GroupChatWindow.prototype.getAdministrator = function () {
        var facebook = Facebook.getInstance();
        return facebook.getOwner(this.__identifier);
    };
    GroupChatWindow.prototype.getParticipants = function () {
        var facebook = Facebook.getInstance();
        var members = facebook.getMembers(this.__identifier);
        if (members) {
            return members;
        } else {
            return [];
        }
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
            }
        }
        // TODO: process group members updated notification
    };

    GroupChatWindow.prototype.reloadData = function () {
        ChatWindow.prototype.reloadData.call(this);
        // TODO: query group owner & members
        this.membersView.reloadData();
    };

    //
    //  TableViewDataSource
    //
    GroupChatWindow.prototype.titleForHeaderInSection = function (section, tableView) {
        if (tableView !== this.membersView) {
            return ChatWindow.prototype.titleForHeaderInSection.call(this, section, tableView);
        }
        if (section === 0) {
            return 'Owner';
        } else {
            return 'Member(s)';
        }
    };

    GroupChatWindow.prototype.numberOfSections = function (tableView) {
        if (tableView !== this.membersView) {
            return ChatWindow.prototype.numberOfSections.call(this, tableView);
        }
        return 2;
    };
    GroupChatWindow.prototype.numberOfRowsInSection = function (section, tableView) {
        if (tableView !== this.membersView) {
            return ChatWindow.prototype.numberOfRowsInSection.call(this, section, tableView);
        }
        if (section === 0) {
            return 1;
        } else {
            var members = this.getParticipants();
            return members.length;
        }
    };

    GroupChatWindow.prototype.cellForRowAtIndexPath = function (indexPath, tableView) {
        if (tableView !== this.membersView) {
            return ChatWindow.prototype.cellForRowAtIndexPath.call(this, indexPath, tableView);
        }
        var identifier;
        if (indexPath.section === 0) {
            identifier = this.getAdministrator();
        } else {
            var members = this.getParticipants();
            identifier = members[indexPath.row];
        }
        // TODO: create table cell
        var cell = new TableViewCell();
        cell.setText(identifier);
        return cell;
    };

    //
    //  Factory
    //
    GroupChatWindow.show = function (identifier, clazz) {
        if (!clazz) {
            clazz = GroupChatWindow;
        }
        var box = ChatWindow.show(identifier, clazz);
        box.reloadData();
        return box;
    };

    ns.GroupChatWindow = GroupChatWindow;

}(window, tarsier.ui, DIMP);
