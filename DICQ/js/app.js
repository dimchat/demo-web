
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

    var Class = sdk.type.Class;
    var ID = sdk.protocol.ID;
    var Document = sdk.protocol.Document;
    var Command = sdk.protocol.Command;

    var NotificationCenter = sdk.lnc.NotificationCenter;

    var MessageBuilder = app.cpu.MessageBuilder;

    var Anonymous = app.Anonymous;

    var StationDelegate = app.network.StationDelegate;
    var Terminal = app.network.Terminal;

    var get_facebook = function () {
        return app.GlobalVariable.getInstance().facebook;
    };

    var Application = function () {
        Terminal.call(this);
        // notifications
        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, app.kNotificationStationConnecting);
        nc.addObserver(this, app.kNotificationStationConnected);
        nc.addObserver(this, app.kNotificationStationError);
        nc.addObserver(this, app.kNotificationMetaAccepted);
        nc.addObserver(this, app.kNotificationDocumentUpdated);
        nc.addObserver(this, app.kNotificationMessageUpdated);
    };
    Class(Application, Terminal, [StationDelegate], null);

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
        var name = notification.name;
        var userInfo = notification.userInfo;
        var res;
        if (name === app.kNotificationStationConnecting) {
            res = 'Connecting to ' + userInfo['host'] + ':' + userInfo['port'] + ' ...';
        } else if (name === app.kNotificationStationConnected) {
            res = 'Station connected.';
        } else if (name === app.kNotificationStationError) {
            res = 'Connection error.';
        } else if (name === app.kNotificationMetaAccepted) {
            identifier = userInfo['ID'];
            res = '[Meta saved] ID: ' + identifier;
        } else if (name === app.kNotificationDocumentUpdated) {
            doc = Document.parse(userInfo);
            res = '[Document updated] ID: ' + doc.getIdentifier()
                + ' -> ' + doc.getValue('data');
        } else if (name === app.kNotificationMessageUpdated) {
            var msg = userInfo['msg'];
            var sender = msg.getSender();
            var username = facebook.getName(sender);
            var content = msg.getContent();
            var text;
            if (content instanceof Command) {
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

    var add_contact = function (contact, user) {
        var facebook = get_facebook();
        if (facebook.addContact(contact, user)) {
            var contacts = facebook.getContacts(user);
            var nc = NotificationCenter.getInstance();
            nc.postNotification(app.kNotificationContactsUpdated, this,
                {'ID': contact, 'contacts': contacts});
        }
    };

    ns.Application = Application;

}(dicq, SECHAT, DIMP);

!function (ns, tui, app, sdk) {
    'use strict';

    var Station = sdk.mkm.Station;
    var ClientSession = sdk.network.ClientSession;
    var SharedDatabase  = app.SharedDatabase;
    var SharedFacebook  = app.SharedFacebook;
    var SharedMessenger = app.SharedMessenger;
    var SharedPacker    = app.SharedPacker;
    var SharedProcessor = app.SharedProcessor;
    var Client          = app.Client;
    var GlobalVariable  = app.GlobalVariable;

    var Main = function () {
        Init();
        var facebook = app.GlobalVariable.getInstance().facebook;
        var user = facebook.getCurrentUser();
        if (user) {
            // login
            ns.LoginWindow.show(user);
        } else {
            // register new account
            new ns.RegisterWindow.show();
        }
    };

    var Init = function () {
        var shared = GlobalVariable.getInstance();
        var database = SharedDatabase.getInstance();
        var facebook = new SharedFacebook(database);
        shared.database = database;
        shared.facebook = facebook;
        // connect
        // var host = '192.168.31.91';
        var host = '106.52.25.169';   // gz
        var port = 9394;
        var server = new Station(host, port);
        var session = new ClientSession(server, database);
        var messenger = new SharedMessenger(session, facebook, database);
        var packer = new SharedPacker(facebook, messenger);
        var processor = new SharedProcessor(facebook, messenger);
        messenger.setPacker(packer);
        messenger.setProcessor(processor);
        var client = new Client(facebook, database);
        shared.messenger = messenger;
        shared.terminal = client;
    };

    ns.Main = Main;

}(dicq, tarsier.ui, SECHAT, DIMP);
