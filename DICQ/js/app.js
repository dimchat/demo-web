
!function (ns, tui) {
    'use strict';

    var Size = tui.Size;
    var Point = tui.Point;

    var $ = tui.$;

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

    var StationDelegate = dimp.network.StationDelegate;
    var Terminal = dimp.network.Terminal;

    var NotificationCenter = dimp.stargate.NotificationCenter;

    var Application = function () {
        Terminal.call(this);
        // notifications
        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, nc.kNotificationStationConnecting);
        nc.addObserver(this, nc.kNotificationStationConnected);
        nc.addObserver(this, nc.kNotificationStationError);
        nc.addObserver(this, nc.kNotificationMetaAccepted);
        nc.addObserver(this, nc.kNotificationProfileUpdated);
        nc.addObserver(this, nc.kNotificationMessageReceived);
    };
    dimp.Class(Application, Terminal, [StationDelegate]);

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
        var contacts = facebook.getContacts(user);
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
