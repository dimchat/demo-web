
!function (ns, tui, dimp) {
    'use strict';

    var ChatWindow = ns.ChatWindow;

    var TableViewCell = tui.TableViewCell;
    var TableViewDataSource = tui.TableViewDataSource;
    var TableViewDelegate = tui.TableViewDelegate;
    var TableView = tui.TableView;

    var NotificationCenter = dimp.stargate.NotificationCenter;

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

        this.owner = null;  // owner ID
        this.members = [];  // ID list
    };
    dimp.Class(GroupChatWindow, ChatWindow, [TableViewDataSource, TableViewDelegate]);

    GroupChatWindow.prototype.onReceiveNotification = function (notification) {
        var nc = NotificationCenter.getInstance();
        var name = notification.name;
        if (name === nc.kNotificationMessageReceived) {
            var msg = notification.userInfo;
            var content = msg.content;
            var identifier = this.__identifier;
            if (identifier.equals(content.getGroup())) {
                this.appendMessage(msg);
            }
        }
    };

    //
    //  TableViewDataSource
    //
    GroupChatWindow.prototype.titleForHeaderInSection = function (section, tableView) {
        if (section === 0) {
            return 'Owner';
        } else {
            return 'Member(s)';
        }
    };

    GroupChatWindow.prototype.numberOfSections = function (tableView) {
        return 2;
    };
    GroupChatWindow.prototype.numberOfRowsInSection = function (section, tableView) {
        if (section === 0) {
            return 1;
        } else {
            return this.members.length;
        }
    };

    GroupChatWindow.prototype.cellForRowAtIndexPath = function (indexPath, tableView) {
        var identifier;
        if (indexPath.section === 0) {
            identifier = this.owner;
        } else {
            identifier = this.members[indexPath.row];
        }
        var cell = new TableViewCell();
        cell.setText(identifier);
        return cell;
    };

    GroupChatWindow.prototype.reloadData = function () {
        ChatWindow.prototype.reloadData.call(this);
        // TODO: query group owner & members
        this.membersView.refresh();
    };

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
