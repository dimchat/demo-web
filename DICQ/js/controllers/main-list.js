
!function (ns, tui, app, sdk) {
    'use strict';

    var MainTableViewCell = ns.MainTableViewCell;

    var View   = tui.View;
    var Button = tui.Button;

    var TableViewDataSource = tui.TableViewDataSource;
    var TableViewDelegate   = tui.TableViewDelegate;
    var FixedTableView      = tui.FixedTableView;

    var Class  = sdk.type.Class;
    var Arrays = sdk.type.Arrays;

    var EntityType = sdk.protocol.EntityType;
    var ID         = sdk.protocol.ID;

    var NotificationCenter   = sdk.lnc.NotificationCenter;
    var NotificationObserver = sdk.lnc.Observer;
    var NotificationNames    = app.NotificationNames;

    var get_facebook = function () {
        return app.GlobalVariable.getFacebook();
    };
    // var get_messenger = function () {
    //     return app.GlobalVariable.getMessenger();
    // };
    var get_database = function () {
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

    var shared_contacts = {
        persons: [],
        groups: [],
        bots: [],
        strangers : []
    };

    MainListView.prototype.reloadData = function () {
        var facebook = get_facebook();
        var persons = [];
        var groups = [];
        var robots = [];
        var id;
        // 1. fetch contacts
        var user = facebook.getCurrentUser();
        var contacts = facebook.getContacts(user.getIdentifier());
        if (!contacts || contacts.length === 0) {
            contacts = ID.convert(ns.defaultContacts);
            var db = get_database();
            db.saveContacts(contacts, user.getIdentifier());
        }
        for (var i = 0; i < contacts.length; ++i) {
            id = contacts[i];
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
        // 2. fetch strangers
        var strangers = facebook.getContacts(ID.ANYONE);
        if (!strangers) {
            strangers = [];
        }
        for (var j = strangers.length - 1; j >= 0; --j) {
            id = strangers[j];
            if (!id) {
                console.error('ID error: ' + strangers[j]);
            }
            // filter contacts
            if (persons.indexOf(id) >= 0) {
                strangers.splice(j, 1);
            } else if (robots.indexOf(id) >= 0) {
                strangers.splice(j, 1);
                // } else if (EntityType.BOT.equals(id.getType())) {
                //     robots.push(id);
                //     strangers.splice(j, 1);
            }
        }
        // 3. sort by message time
        shared_contacts.persons = persons.sort(compare_time);
        shared_contacts.groups = groups.sort(compare_time);
        shared_contacts.bots = robots.sort(compare_time);
        shared_contacts.strangers = strangers.sort(compare_time);
        // refresh table view
        FixedTableView.prototype.reloadData.call(this);
    };
    var compare_time = function (id1, id2) {
        return last_time(id2) - last_time(id1);
    };
    var last_time = function (identifier) {
        var db = get_database();
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
            return 'Service Bots';
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
            return shared_contacts.persons.length;
        } else if (section === 1) {
            return shared_contacts.groups.length;
        } else if (section === 2) {
            return shared_contacts.bots.length;
        } else {
            return shared_contacts.strangers.length;
        }
    };
    MainListView.prototype.cellForRowAtIndexPath = function (indexPath, tableView) {
        var clazz;
        var identifier;
        if (indexPath.section === 0) {
            clazz = 'contactCell';
            identifier = shared_contacts.persons[indexPath.row];
        } else if (indexPath.section === 1) {
            clazz = 'groupCell';
            identifier = shared_contacts.groups[indexPath.row];
        } else if (indexPath.section === 2) {
            clazz = 'robotCell';
            identifier = shared_contacts.bots[indexPath.row];
        } else {
            clazz = 'strangerCell';
            identifier = shared_contacts.strangers[indexPath.row];
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
        var button = new BlinkButton();
        button.setClassName('sectionHeader buttonNormal');
        button.onClick = function () {
            tableView.selectedIndex = section;
            tableView.reloadData();
        };
        button.setText(this.titleForHeaderInSection(section, tableView));
        button.setSection(section);
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

    var BlinkButton = function (btn) {
        Button.call(this, btn);
        this.__section = -1;
    };
    Class(BlinkButton, Button, [NotificationObserver], null);

    BlinkButton.prototype.setSection = function (sec) {
        this.__section = sec;
    };

    BlinkButton.prototype.onEnter = function () {
        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, NotificationNames.NewMessageDancing);
    };

    BlinkButton.prototype.onExit = function () {
        var nc = NotificationCenter.getInstance();
        nc.removeObserver(this, NotificationNames.NewMessageDancing);
    };

    BlinkButton.prototype.onReceiveNotification = function (notification) {
        var name = notification.getName();
        var userInfo = notification.getUserInfo();
        if (name === NotificationNames.NewMessageDancing) {
            var dancing = userInfo['dancing'];
            var flag = check_dancing(dancing, this.__section);
            if (flag) {
                this.dancing();
            } else {
                this.stopDancing();
            }
        }
        // FIXME:
        remove_zombie.call(this);
    };

    var check_dancing = function (dancing, section) {
        var contacts;
        if (section === 0) {
            contacts = shared_contacts.persons;
        } else if (section === 1) {
            contacts = shared_contacts.groups;
        } else if (section === 2) {
            contacts = shared_contacts.bots;
        } else {
            contacts = shared_contacts.strangers;
        }
        var keys = Object.keys(dancing);
        var id;
        for (var i = 0; i < keys.length; ++i) {
            id = keys[i];
            if (dancing[id] && Arrays.find(contacts, id) >= 0) {
                return true;
            }
        }
        return false;
    };

    // private
    BlinkButton.prototype.dancing = function () {
        // dancing animation
        var btn = this.__ie;
        if (btn.style.color === 'darkblue') {
            btn.style.color = '#D5D2CF';
        } else {
            btn.style.color = 'darkblue';
        }
    };

    // private
    BlinkButton.prototype.stopDancing = function () {
        var btn = this.__ie;
        btn.style.color = 'darkblue';
    };

    var remove_zombie = function () {
        if (is_zombie(this.__ie)) {
            console.warn('remove zombie button', this, this.__ie);
            this.onExit();
            // this.remove();
        }
    };
    var is_zombie = function (ie) {
        var parent = ie.parentNode;
        if (!parent) {
            return true;
        } else if (parent === document.body) {
            return false;
        } else if (parent === document) {
            return false;
        }
        return is_zombie(parent);
    };

    ns.MainListView = MainListView;

}(dicq, tarsier.ui, SECHAT, DIMP);
