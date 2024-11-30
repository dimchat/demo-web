
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

!function (ns, app, sdk) {
    'use strict';

    var Interface = sdk.type.Interface;
    var Class = sdk.type.Class;
    var ID = sdk.protocol.ID;
    var Document = sdk.protocol.Document;
    var Command = sdk.protocol.Command;

    var NotificationCenter   = sdk.lnc.NotificationCenter;
    var NotificationObserver = sdk.lnc.Observer;

    var MessageBuilder = app.cpu.MessageBuilder;

    var Anonymous = app.Anonymous;
    var NotificationNames = app.NotificationNames;

    var Terminal = app.network.Terminal;

    var get_database = function () {
        return app.GlobalVariable.getDatabase();
    };
    var get_facebook = function () {
        return app.GlobalVariable.getFacebook();
    };
    // var get_messenger = function () {
    //     return app.GlobalVariable.getMessenger();
    // };

    var Application = function () {
        Terminal.call(this);
        // notifications
        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, NotificationNames.StationConnecting);
        nc.addObserver(this, NotificationNames.StationConnected);
        nc.addObserver(this, NotificationNames.StationError);
        nc.addObserver(this, NotificationNames.MetaAccepted);
        nc.addObserver(this, NotificationNames.DocumentUpdated);
        nc.addObserver(this, NotificationNames.MessageUpdated);
    };
    Class(Application, Terminal, [NotificationObserver], null);

    var s_application = null;
    Application.getInstance = function () {
        if (!s_application) {
            s_application = new Application();
        }
        return s_application;
    };

    Application.prototype.onReceiveNotification = function (notification) {
        var facebook = get_facebook();
        var identifier;
        var doc;
        var name = notification.getName();
        var userInfo = notification.getUserInfo();
        var res;
        if (name === NotificationNames.StationConnecting) {
            res = 'Connecting to ' + userInfo['host'] + ':' + userInfo['port'] + ' ...';
        } else if (name === NotificationNames.StationConnected) {
            res = 'Station connected.';
        } else if (name === NotificationNames.StationError) {
            res = 'Connection error.';
        } else if (name === NotificationNames.MetaAccepted) {
            identifier = userInfo['ID'];
            res = '[Meta saved] ID: ' + identifier;
        } else if (name === NotificationNames.DocumentUpdated) {
            doc = Document.parse(userInfo);
            res = '[Document updated] ID: ' + doc.getIdentifier()
                + ' -> ' + doc.getValue('data');
        } else if (name === NotificationNames.MessageUpdated) {
            var msg = userInfo['msg'];
            var sender = msg.getSender();
            var username = facebook.getName(sender);
            var content = msg.getContent();
            var text;
            if (Interface.conforms(content, Command)) {
                text = MessageBuilder.getCommandText(content, sender);
            } else {
                text = MessageBuilder.getContentText(content, sender);
            }
            var number = Anonymous.getNumberString(sender);
            var group = content.getGroup();
            if (group && !ID.EVERYONE.equals(group)) {
                // add group ID into contacts list
                add_group(group);

                name = facebook.getName(group);
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
        if (!sender.isUser()) {
            console.log('sender is not a user: ' + sender);
            return false;
        }
        var facebook = get_facebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw Error('current user not set yet');
        }
        if (user.getIdentifier().equals(sender)) {
            console.log('it is me!');
            return false;
        }
        var contacts = facebook.getContacts(user.getIdentifier());
        if (!contacts || contacts.indexOf(sender) < 0) {
            return add_contact(sender, ID.ANYONE);
        }
    };

    var add_group = function (group) {
        var facebook = get_facebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw Error('current user not set yet');
        }

        // check members
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            return false;
        }
        var identifier = user.getIdentifier();
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

    var add_contact = function (friend, user) {
        var facebook = get_facebook();
        var contacts = facebook.getContacts(user);
        if (!contacts) {
            contacts = [friend];
        } else if (contacts.indexOf(friend) < 0) {
            contacts.push(friend);
        } else {
            return false;
        }
        var database = get_database();
        if (database.saveContacts(contacts, user)) {
            var nc = NotificationCenter.getInstance();
            nc.postNotification(NotificationNames.ContactsUpdated, this,
                {'ID': friend, 'contacts': contacts});
        }
    };

    ns.Application = Application;

}(dicq, SECHAT, DIMP);

!function (ns, app) {
    'use strict';

    var Main = function () {
        var facebook = app.GlobalVariable.getFacebook();
        var user = facebook.getCurrentUser();
        if (user) {
            // login
            // connect('127.0.0.1', 9394);
            // connect('192.168.31.91', 9394);
            connect('106.52.25.169', 9394);  // gz
            app.GlobalVariable.setCurrentUser(user.getIdentifier());
            ns.LoginWindow.show(user);
        } else {
            // register new account
            new ns.RegisterWindow.show();
        }
    };

    var connect = function (host, port) {
        var client = app.GlobalVariable.getTerminal();
        client.connect(host, port);
        return client;
    }

    // ns.logoImageURL = 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/2e/d9/b5/2ed9b53a-8cc0-d865-3756-bb51bb2e80b3/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/460x0w.webp';
    ns.logoImageURL = 'images/icon-512.png';

    ns.Main = Main;

}(dicq, SECHAT);
