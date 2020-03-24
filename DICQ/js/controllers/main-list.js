
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

    var MainListView = function () {
        FixedTableView.call(this);

        this.selectedIndex = 0;
        this.dataSource = this;
        this.delegate = this;

        // notifications
        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, 'ContactsUpdated');
    };
    dimp.Class(MainListView, FixedTableView, [TableViewDataSource, TableViewDelegate]);

    MainListView.prototype.onReceiveNotification = function (notification) {
        var name = notification.name;
        if (name === 'ContactsUpdated') {
            this.reloadData();
        }
    };

    MainListView.prototype.layoutSubviews = function () {
        View.prototype.layoutSubviews.call(this);
        this.reloadData();
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
            return get_persons().length;
        } else if (section === 1) {
            return get_groups().length;
        } else {
            return get_robots().length;
        }
    };

    var get_contacts = function () {
        var facebook = Facebook.getInstance();
        var user = facebook.getCurrentUser();
        var contacts = facebook.getContacts(user.identifier);
        if (contacts) {
            return contacts;
        } else {
            return [];
        }
    };
    var get_persons = function () {
        var facebook = Facebook.getInstance();
        var contacts = get_contacts();
        var list = [];
        var id;
        for (var i = 0; i < contacts.length; ++i) {
            id = facebook.getIdentifier(contacts[i]);
            if (id && NetworkType.Main.equals(id.getType())) {
                list.push(id);
            }
        }
        return list;
    };
    var get_robots = function () {
        var facebook = Facebook.getInstance();
        var contacts = get_contacts();
        var list = [];
        var id;
        for (var i = 0; i < contacts.length; ++i) {
            id = facebook.getIdentifier(contacts[i]);
            if (id && NetworkType.Robot.equals(id.getType())) {
                list.push(id);
            }
        }
        return list;
    };
    var get_groups = function () {
        var facebook = Facebook.getInstance();
        var contacts = get_contacts();
        var list = [];
        var identifier;
        for (var i = 0; i < contacts.length; ++i) {
            identifier = facebook.getIdentifier(contacts[i]);
            if (identifier && identifier.isGroup()) {
                list.push(identifier);
            }
        }
        return list;
    };

    MainListView.prototype.cellForRowAtIndexPath = function (indexPath, tableView) {
        var cell = new TableViewCell();
        var facebook = Facebook.getInstance();

        var identifier;
        var entity;
        if (indexPath.section === 0) {
            cell.setClassName('contactCell');
            identifier = get_persons()[indexPath.row];
            entity = facebook.getUser(identifier);
        } else if (indexPath.section === 1) {
            cell.setClassName('groupCell');
            identifier = get_groups()[indexPath.row];
            entity = facebook.getGroup(identifier);
        } else {
            cell.setClassName('robotCell');
            identifier = get_robots()[indexPath.row];
            entity = facebook.getUser(identifier);
        }
        var profile = entity.getProfile();

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
            image = 'https://dimchat.github.io/images/icon-512.png';
        }
        var img = new Image();
        img.setClassName('avatar');
        if (image) {
            img.setSrc(image);
        }
        cell.appendChild(img);

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

    MainListView.prototype.didSelectRowAtIndexPath = function (indexPath, tableView) {
        var clazz;
        var identifier;
        if (indexPath.section === 0) {
            clazz = ns.PersonalChatWindow;
            identifier = get_persons()[indexPath.row];
        } else if (indexPath.section === 1) {
            clazz = ns.GroupChatWindow;
            identifier = get_groups()[indexPath.row];
        } else {
            clazz = ns.PersonalChatWindow;
            identifier = get_robots()[indexPath.row];
        }
        clazz.show(identifier);
    };

    ns.MainListView = MainListView;

}(dicq, tarsier.ui, DIMP);
