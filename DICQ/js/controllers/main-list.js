
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

    var NotificationCenter   = sdk.lnc.NotificationCenter;
    var NotificationObserver = sdk.lnc.Observer;
    var NotificationNames    = app.NotificationNames;

    var get_facebook = function () {
        return app.GlobalVariable.getFacebook();
    };
    // var get_messenger = function () {
    //     return app.GlobalVariable.getMessenger();
    // };
    var get_message_db = function () {
        return app.GlobalVariable.getDatabase();
    };

    var MainListView = function () {
        FixedTableView.call(this);

        this.selectedIndex = 0;
        this.dataSource = this;
        this.delegate = this;

        // notifications
        var nc = NotificationCenter.getInstance();
        nc.removeObserver(this, NotificationNames.MessageUpdated);
        nc.removeObserver(this, NotificationNames.ContactsUpdated);
        nc.addObserver(this, NotificationNames.ContactsUpdated);
        nc.addObserver(this, NotificationNames.MessageUpdated);
    };
    Class(MainListView, FixedTableView, [TableViewDataSource, TableViewDelegate, NotificationObserver], null);

    MainListView.prototype.onExit = function () {
        var nc = NotificationCenter.getInstance();
        nc.removeObserver(this, NotificationNames.MessageUpdated);
        nc.removeObserver(this, NotificationNames.ContactsUpdated);
    };

    MainListView.prototype.onReceiveNotification = function (notification) {
        var name = notification.getName();
        if (name === NotificationNames.ContactsUpdated) {
            this.reloadData();
        } else if (name === NotificationNames.MessageUpdated) {
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
        var persons = [];
        var groups = [];
        var robots = [];
        var id;
        // 1. fetch contacts
        var user = facebook.getCurrentUser();
        var contacts = facebook.getContacts(user.getIdentifier());
        if (contacts && contacts.length > 0) {
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
        }
        // 2. fetch strangers
        var strangers = facebook.getContacts(ID.ANYONE);
        if (strangers && strangers.length > 0) {
            for (var j = strangers.length - 1; j >= 0; --j) {
                id = ID.parse(strangers[j]);
                if (!id) {
                    console.error('ID error: ' + strangers[j]);
                }
                // filter contacts
                if (persons.indexOf(id) >= 0) {
                    strangers.splice(j, 1);
                } else if (robots.indexOf(id) >= 0) {
                    strangers.splice(j, 1);
                } else if (EntityType.BOT.equals(id.getType())) {
                    robots.push(id);
                    strangers.splice(j, 1);
                }
            }
        } else {
            strangers = [];
        }
        // 3. sort by message time
        s_persons = persons.sort(compare_time);
        s_groups = groups.sort(compare_time);
        s_robots = robots.sort(compare_time);
        s_strangers = strangers.sort(compare_time);
        // refresh table view
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

    var $ = tarsier.ui.$;

    MainListView.prototype.removeChild = function (child) {
        if (typeof child.onExit === "function") {
            child.onExit()
        }
        return FixedTableView.prototype.removeChild.call(this, child);
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
            return 'Bots';
        } else {
            return 'Strangers';
        }
    };
    MainListView.prototype.titleForFooterInSection = function(section, tableView) {
        return null
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

    MainListView.prototype.heightForHeaderInSection = function(section, tableView) {
        return 16
    };
    MainListView.prototype.heightForFooterInSection = function(section, tableView) {
        return 16
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
    MainListView.prototype.viewForFooterInSection = function(section, tableView) {
        return null
    };
    MainListView.prototype.heightForRowAtIndexPath = function(indexPath, tableView) {
        return 64
    };
    MainListView.prototype.didSelectRowAtIndexPath = function(indexPath, tableView) {

    };

    ns.MainListView = MainListView;

}(dicq, tarsier.ui, SECHAT, DIMP);
