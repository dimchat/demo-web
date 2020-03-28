
!function (ns, tui, dimp) {
    'use strict';

    var View = tui.View;
    var Label = tui.Label;
    var Button = tui.Button;
    var Image = tui.Image;

    var TableViewCell = tui.TableViewCell;
    var TableViewDataSource = tui.TableViewDataSource;
    var TableViewDelegate = tui.TableViewDelegate;
    var FixedTableView = tui.FixedTableView;

    var NetworkType = dimp.protocol.NetworkType;
    var Facebook = dimp.Facebook;

    var NotificationCenter = dimp.stargate.NotificationCenter;

    var MessageTable = dimp.db.MessageTable;

    var MainListView = function () {
        FixedTableView.call(this);

        this.selectedIndex = 0;
        this.dataSource = this;
        this.delegate = this;

        // notifications
        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, 'ContactsUpdated');
        nc.addObserver(this, nc.kNotificationMessageReceived);
    };
    dimp.Class(MainListView, FixedTableView, [TableViewDataSource, TableViewDelegate]);

    MainListView.prototype.onReceiveNotification = function (notification) {
        var nc = NotificationCenter.getInstance();
        var name = notification.name;
        if (name === 'ContactsUpdated') {
            this.reloadData();
        } else if (name === nc.kNotificationMessageReceived) {
            this.reloadData();
        }
    };

    MainListView.prototype.layoutSubviews = function () {
        View.prototype.layoutSubviews.call(this);
        this.reloadData();
    };

    var s_persons = [];
    var s_groups = [];
    var s_robots = [];

    MainListView.prototype.reloadData = function () {
        var facebook = Facebook.getInstance();
        var user = facebook.getCurrentUser();
        var contacts = facebook.getContacts(user.identifier);
        // 1. fetch contacts
        var persons = [];
        var groups = [];
        var robots = [];
        if (contacts) {
            var id;
            for (var i = 0; i < contacts.length; ++i) {
                id = facebook.getIdentifier(contacts[i]);
                if (!id) {
                    console.error('ID error: ' + contacts[i]);
                    continue;
                }
                if (NetworkType.Robot.equals(id.getType())) {
                    robots.push(id);
                } else if (id.isUser()) {
                    persons.push(id);
                } else if (id.isGroup()) {
                    groups.push(id);
                }
            }
        }
        // 2. sort by message time
        s_persons = persons.sort(compare_time);
        s_groups = groups.sort(compare_time);
        s_robots = robots.sort(compare_time);
        // 3. refresh table view
        FixedTableView.prototype.reloadData.call(this);
    };
    var compare_time = function (id1, id2) {
        return last_time(id2) - last_time(id1);
    };
    var last_time = function (identifier) {
        var db = MessageTable.getInstance();
        var cnt = db.getMessageCount(identifier);
        if (cnt < 1) {
            return 0;
        }
        var msg = db.getMessage(cnt-1, identifier);
        return msg.envelope.time;
    };

    //
    //  TableViewDataSource/TableViewDelegate
    //
    MainListView.prototype.numberOfSections = function (tableView) {
        return 3;
    };

    MainListView.prototype.titleForHeaderInSection = function (section, tableView) {
        if (section === 0) {
            return 'Contacts';
        } else if (section === 1) {
            return 'Groups';
        } else {
            return 'Robots';
        }
    };

    MainListView.prototype.viewForHeaderInSection = function (section, tableView) {
        var button = new Button();
        button.setClassName('sectionHeader buttonNormal');
        button.onClick = function () {
            tableView.selectedIndex = section;
            tableView.reloadData();
        };
        button.setText(this.titleForHeaderInSection(section, tableView));
        return button;
    };

    MainListView.prototype.numberOfRowsInSection = function (section, tableView) {
        if (tableView.selectedIndex !== section) {
            return 0;
        }
        if (section === 0) {
            return s_persons.length;
        } else if (section === 1) {
            return s_groups.length;
        } else {
            return s_robots.length;
        }
    };

    MainListView.prototype.cellForRowAtIndexPath = function (indexPath, tableView) {
        var cell = new TableViewCell();
        var facebook = Facebook.getInstance();

        var identifier;
        var entity;
        if (indexPath.section === 0) {
            cell.setClassName('contactCell');
            identifier = s_persons[indexPath.row];
            entity = facebook.getUser(identifier);
        } else if (indexPath.section === 1) {
            cell.setClassName('groupCell');
            identifier = s_groups[indexPath.row];
            entity = facebook.getGroup(identifier);
        } else {
            cell.setClassName('robotCell');
            identifier = s_robots[indexPath.row];
            entity = facebook.getUser(identifier);
        }
        var profile = entity.getProfile();

        var button = new Button();
        button.setClassName('avatarBtn');
        button.onClick = function (ev) {
            if (indexPath.section === 0) {
                ns.PersonalChatWindow.show(identifier);
            } else if (indexPath.section === 1) {
                ns.GroupChatWindow.show(identifier);
            } else {
                ns.PersonalChatWindow.show(identifier);
            }
        };
        cell.appendChild(button);

        //
        //  Avatar
        //
        var image;
        if (identifier.isUser()) {
            image = profile.getProperty('avatar');
        } else {
            // TODO: build group logo
            image = null;
        }
        if (!image) {
            image = 'http://terminal.dim.chat/DICQ/images/icon-512.png';
        }
        var img = new Image();
        img.setClassName('avatarImg');
        if (image) {
            img.setSrc(image);
        }
        button.appendChild(img);

        //
        //  Name(Number)
        //
        var name = entity.getName();
        // var number = facebook.getNumberString(identifier);
        var label = new Label();
        label.setClassName('name');
        label.setText(name);
        cell.appendChild(label);

        return cell;
    };

    ns.MainListView = MainListView;

}(dicq, tarsier.ui, DIMP);
