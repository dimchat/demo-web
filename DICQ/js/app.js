
!function (ns, dimp) {
    'use strict';

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
                name = facebook.getNickname(group);
                if (name) {
                    group = name;
                } else {
                    group = group.name;
                }
                res = '[' + group + '] (' + number + ') ' + username + ': ' + text;
            } else {
                res = '(' + number + ') ' + username + ': ' + text;
            }
        } else {
            res = 'Unknown notification: ' + name;
        }
        console.log(res);
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
