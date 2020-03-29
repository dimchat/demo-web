
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
