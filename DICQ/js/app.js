
!function (ns, tui) {
    'use strict';

    var Size = tui.Size;
    var Point = tui.Point;

    var $ = tui.$;
    var Image = tui.Image;

    var data = 'data:image/png;base64,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';

    var img = new Image();
    img.setClassName('qrCode');
    img.setSrc(data);
    $(document.body).appendChild(img);

    //
    //  Patch for position
    //
    var center_position = function (boxSize, winSize) {
        if (!winSize) {
            winSize = new Size(window.innerWidth, window.innerHeight);
            if (winSize.width < 1 || winSize.height < 1) {
                winSize = $(document.body).getSize();
            }
        }
        var x = (winSize.width - boxSize.width) >> 1;
        var y = (winSize.height - boxSize.height) >> 1;
        return new Point(x, y);
    };
    var random_position = function (boxSize, winSize) {
        var center = center_position(boxSize, winSize);
        var dw = boxSize.width >> 2;
        var dh = boxSize.height >> 2;
        var dx = Math.round(Math.random() * dw) - (dw >> 1);
        var dy = Math.round(Math.random() * dh) - (dh >> 1);
        var x = center.x + dx;
        var y = center.y + dy;
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        return new Point(x, y);
    };
    tui.getCenterPosition = center_position;
    tui.getRandomPosition = random_position;

}(dicq, tarsier.ui);

!function (ns, dimp) {
    'use strict';

    var ID = dimp.ID;

    var Command = dimp.protocol.Command;
    var MessageBuilder = dimp.cpu.MessageBuilder;

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
            var content = msg.content;
            var text;
            if (content instanceof Command) {
                text = MessageBuilder.getCommandText(content, sender);
            } else {
                text = MessageBuilder.getContentText(content, sender);
            }
            var number = facebook.getNumberString(sender);
            var group = content.getGroup();
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
        if (user.identifier.equals(sender)) {
            console.log('it is me!');
            return false;
        }

        if (!sender.isUser()) {
            console.log('sender is not a user: ' + sender);
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

}(dicq, DIMP);

!function (ns, tui, dimp) {
    'use strict';

    var Main = function () {
        var facebook = dimp.Facebook.getInstance();
        var user = facebook.getCurrentUser();
        if (user) {
            // login
            ns.LoginWindow.show(user);
        } else {
            // register new account
            new ns.RegisterWindow.show();
        }
    };

    ns.Main = Main;

}(dicq, tarsier.ui, DIMP);
