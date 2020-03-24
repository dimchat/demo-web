
!function (ns, dimp) {
    'use strict';

    var NetworkType = dimp.protocol.NetworkType;
    var ID = dimp.ID;

    var Facebook = dimp.Facebook;
    var Messenger = dimp.Messenger;

    var StationDelegate = dimp.network.StationDelegate;

    var NotificationCenter = dimp.stargate.NotificationCenter;

    var Application = function () {
        // notifications
        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, nc.kNotificationStationConnecting);
        nc.addObserver(this, nc.kNotificationStationConnected);
        nc.addObserver(this, nc.kNotificationStationError);
        nc.addObserver(this, nc.kNotificationHandshakeAccepted);
        nc.addObserver(this, nc.kNotificationMetaAccepted);
        nc.addObserver(this, nc.kNotificationProfileUpdated);
        nc.addObserver(this, nc.kNotificationMessageReceived);
    };
    dimp.Class(Application, null, [StationDelegate]);

    var s_application = null;
    Application.getInstance = function () {
        if (!s_application) {
            s_application = new Application();
        }
        return s_application;
    };

    Application.prototype.onReceiveNotification = function (notification) {
        var facebook = Facebook.getInstance();
        var identifier;
        var profile;
        var name = notification.name;
        var userInfo = notification.userInfo;
        var res;
        var nc = NotificationCenter.getInstance();
        if (name === nc.kNotificationStationConnecting) {
            res = 'Connecting to ' + userInfo['host'] + ':' + userInfo['port'] + ' ...';
        } else if (name === nc.kNotificationStationConnected) {
            res = 'Station connected.';
        } else if (name === nc.kNotificationStationError) {
            res = 'Connection error.';
        } else if (name === nc.kNotificationHandshakeAccepted) {
            res = 'Handshake accepted!';
            var user = facebook.getCurrentUser();
            if (!user) {
                return 'Current user not found';
            }
            profile = user.getProfile();
            if (profile && profile.getValue('data')) {
                var messenger = Messenger.getInstance();
                messenger.postProfile(profile);
            }
        } else if (name === nc.kNotificationMetaAccepted) {
            identifier = notification.userInfo['ID'];
            res = '[Meta saved] ID: ' + identifier;
        } else if (name === nc.kNotificationProfileUpdated) {
            profile = notification.userInfo;
            res = '[Profile updated] ID: ' + profile.getIdentifier()
                + ' -> ' + profile.getValue('data');
        } else if (name === nc.kNotificationMessageReceived) {
            var msg = notification.userInfo;
            var sender = msg.envelope.sender;
            sender = facebook.getIdentifier(sender);
            var username = facebook.getNickname(sender);
            if (!username) {
                username = sender.name;
            }
            var number = facebook.getNumberString(sender);
            var text = msg.content.getValue('text');
            var group = msg.content.getGroup();
            if (group && !ID.EVERYONE.equals(group)) {
                group = facebook.getIdentifier(group);
                // add group ID into contacts list
                add_group(group);

                name = facebook.getNickname(group);
                if (name) {
                    group = name;
                } else {
                    group = group.name;
                }
                res = '[' + group + '] (' + number + ') ' + username + ': ' + text;
            } else {
                add_sender(sender);
                res = '(' + number + ') ' + username + ': ' + text;
            }
        } else {
            res = 'Unknown notification: ' + name;
        }
        console.log(res);
    };

    var add_sender = function (sender) {
        var facebook = Facebook.getInstance();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw Error('current user not set yet');
        }

        // check robot
        if (!NetworkType.Main.equals(sender.getType())) {
            console.log('ignore robot: ' + sender);
            return false;
        }

        return add_contact(sender, user.identifier);
    };

    var add_group = function (group) {
        var facebook = Facebook.getInstance();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw Error('current user not set yet');
        }

        // check members
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            return false;
        }
        var identifier = user.identifier;
        var mine = false;
        for (var i = 0; i < members.length; ++i) {
            if (identifier.equals(members[i])) {
                mine = true;
                break;
            }
        }
        if (!mine) {
            // check owner
            var owner = facebook.getOwner(group);
            if (!owner || !identifier.equals(owner)) {
                return false;
            }
        }
        return add_contact(group, identifier);
    };

    var add_contact = function (contact, user) {
        var facebook = Facebook.getInstance();
        var contacts = facebook.loadContacts(user);
        if (contacts) {
            for (var j = 0; j < contacts.length; ++j) {
                if (contact.equals(contacts[j])) {
                    return true;
                }
            }
            contacts.push(contact);
        } else {
            contacts = [contact];
        }
        if (facebook.saveContacts(contacts, user)) {
            var nc = NotificationCenter.getInstance();
            nc.postNotification('ContactsUpdated', this,
                {'ID': contact, 'contacts': contacts});
        }
    };

    //
    //  StationDelegate
    //
    Application.prototype.didSendPackage = function (data, server) {
        console.assert(data !== null, 'data empty');
        console.assert(server !== null, 'server empty');
        console.log('Message sent!');
    };
    Application.prototype.didFailToSendPackage = function (error, data, server) {
        console.assert(data !== null, 'data empty');
        console.assert(server !== null, 'server empty');
        console.log('Failed to send message, please check connection. error: ', error);
    };

    ns.Application = Application;

    var app = new Application();

    var messenger = Messenger.getInstance();
    var server = messenger.server;
    server.stationDelegate = app;

}(dicq, DIMP);

!function (ns, tui, dimp) {
    'use strict';

    var facebook = dimp.Facebook.getInstance();

    var Main = function () {
        var user = facebook.getCurrentUser();
        if (user) {
            // login
            ns.LoginWindow.show(user);
        } else {
            // register new account
            new ns.RegisterWindow.show();
        }
    };

    Main();

    ns.Main = Main;

    // var admin = 'chatroom-admin@2Pc5gJrEQYoz9D9TJrL35sA3wvprNdenPi7';
    // admin = facebook.getIdentifier(admin);
    // ns.ChatroomWindow.show(admin).setOrigin(10, 10);

}(dicq, tarsier.ui, DIMP);

!function (ns, tui) {
    'use strict';

    var $ = tui.$;
    var Image = tui.Image;

    var data = 'data:image/png;base64,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';

    var img = new Image();
    img.setClassName('qrCode');
    img.setSrc(data);
    $(document.body).appendChild(img);

}(dicq, tarsier.ui);
