
!function (ns, tui, app, sdk) {
    'use strict';

    var MainTableViewCell = ns.MainTableViewCell;

    var View = tui.View;
    var Button = tui.Button;

    var TableViewDataSource = tui.TableViewDataSource;
    var TableViewDelegate = tui.TableViewDelegate;
    var FixedTableView = tui.FixedTableView;

    var Class = sdk.type.Class;
    var EntityType = sdk.protocol.EntityType;
    var ID = sdk.protocol.ID;

    var NotificationCenter = sdk.lnc.NotificationCenter;

    var get_facebook = function () {
        return app.GlobalVariable.getInstance().facebook;
    };

    var get_message_db = function () {
        return app.db.MessageTable;
    };

    var MainListView = function () {
        FixedTableView.call(this);

        this.selectedIndex = 0;
        this.dataSource = this;
        this.delegate = this;

        // notifications
        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, app.kNotificationContactsUpdated);
        nc.addObserver(this, app.kNotificationMessageUpdated);
    };
    Class(MainListView, FixedTableView, [TableViewDataSource, TableViewDelegate], null);

    MainListView.prototype.onReceiveNotification = function (notification) {
        var name = notification.name;
        if (name === app.kNotificationContactsUpdated) {
            this.reloadData();
        } else if (name === app.kNotificationMessageUpdated) {
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
    var s_strangers = [];

    MainListView.prototype.reloadData = function () {
        var facebook = get_facebook();
        // 1. fetch contacts
        var user = facebook.getCurrentUser();
        var contacts = facebook.getContacts(user.getIdentifier());
        if (contacts && contacts.length > 0) {
            var persons = [];
            var groups = [];
            var robots = [];
            var id;
            for (var i = 0; i < contacts.length; ++i) {
                id = ID.parse(contacts[i]);
                if (!id) {
                    console.error('ID error: ' + contacts[i]);
                    continue;
                }
                if (EntityType.BOT.equals(id.getType())) {
                    robots.push(id);
                } else if (EntityType.STATION.equals(id.getType())) {
                    robots.push(id);
                } else if (id.isGroup()) {
                    groups.push(id);
                } else if (id.isUser()) {
                    persons.push(id);
                }
            }
            // sort by message time
            s_persons = persons.sort(compare_time);
            s_groups = groups.sort(compare_time);
            s_robots = robots.sort(compare_time);
        }
        // 2. fetch strangers
        var strangers = facebook.getContacts(ID.ANYONE);
        if (strangers && strangers.length > 0) {
            // filter contacts
            var pos;
            for (var j = 0; j < s_persons.length; j++) {
                pos = strangers.indexOf(s_persons[j]);
                if (pos >= 0) {
                    s_strangers.splice(pos, 1);
                }
            }
            for (var k = 0; k < s_robots.length; k++) {
                pos = strangers.indexOf(s_robots[k]);
                if (pos >= 0) {
                    s_strangers.splice(pos, 1);
                }
            }
            // sort by message time
            s_strangers = strangers.sort(compare_time);
        }
        // 3. refresh table view
        FixedTableView.prototype.reloadData.call(this);
    };
    var compare_time = function (id1, id2) {
        return last_time(id2) - last_time(id1);
    };
    var last_time = function (identifier) {
        var db = get_message_db();
        var cnt = db.numberOfMessages(identifier);
        if (cnt < 1) {
            return 0;
        }
        var msg = db.messageAtIndex(cnt-1, identifier);
        return msg.getTime();
    };

    //
    //  TableViewDataSource/TableViewDelegate
    //
    MainListView.prototype.numberOfSections = function (tableView) {
        return 4;
    };

    MainListView.prototype.titleForHeaderInSection = function (section, tableView) {
        if (section === 0) {
            return 'Contacts';
        } else if (section === 1) {
            return 'Groups';
        } else if (section === 2) {
            return 'Robots';
        } else {
            return 'Strangers';
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
        } else if (section === 2) {
            return s_robots.length;
        } else {
            return s_strangers.length;
        }
    };

    MainListView.prototype.cellForRowAtIndexPath = function (indexPath, tableView) {
        var clazz;
        var identifier;
        if (indexPath.section === 0) {
            clazz = 'contactCell';
            identifier = s_persons[indexPath.row];
        } else if (indexPath.section === 1) {
            clazz = 'groupCell';
            identifier = s_groups[indexPath.row];
        } else if (indexPath.section === 2) {
            clazz = 'robotCell';
            identifier = s_robots[indexPath.row];
        } else {
            clazz = 'strangerCell';
            identifier = s_strangers[indexPath.row];
        }

        var cell = new MainTableViewCell();
        cell.setClassName(clazz);
        cell.setIdentifier(identifier);
        return cell;
    };

    ns.MainListView = MainListView;

}(dicq, tarsier.ui, SECHAT, DIMP);
