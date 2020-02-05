;

!function (ns) {
    'use strict';

    var Register = ns.extension.Register;

    var login = function () {
        var user = facebook.getCurrentUser();
        if (!user) {
            var reg = new Register();
            user = reg.createUser('Anonymous');
            if (user) {
                facebook.setCurrentUser(user);
            }
        }
        if (!user) {
            return false;
        }
        console.log('current user: ' + user);
        var nickname = facebook.getNickname(user.identifier);
        var number = facebook.getNumberString(user.identifier);
        app.write('Current user: ' + nickname + ' (' + number + ') ' + user.identifier);
        app.doLogin(user.identifier);
        return true;
    };

    app.onReceiveNotification = function (notification) {
        var name = notification.name;
        if (name === kNotificationHandshakeAccepted) {
            app.write('Handshake accepted!');
        } else if (name === kNotificationStationConnected) {
            app.write('Station connected.');
            login();
        } else if (name === kNotificationMessageReceived) {
            var msg = notification.userInfo;
            var sender = msg.envelope.sender;
            var nickname = facebook.getUsername(sender);
            var text = msg.content.getValue('text');
            app.write('Message received (' + nickname + '): ' + text);
        }
    };

    notificationCenter.addObserver(app, kNotificationHandshakeAccepted);
    notificationCenter.addObserver(app, kNotificationStationConnected);
    notificationCenter.addObserver(app, kNotificationMessageReceived);

    server.start();

}(DIMP);

!function (ns) {
    'use strict';

    var text = 'Usage:\n';
    text += '        telnet <host>:<port> - connect to a DIM station\n';
    text += '        login <ID>           - switch user\n';
    text += '        logout               - clear session\n';
    text += '        call <ID>            - change receiver to another user (or "station")\n';
    text += '        send <text>          - send message\n';
    text += '        name <niciname>      - reset nickname\n';
    text += '        show users           - list online users\n';
    text += '        search <number>      - search users by number\n';
    text += '        profile <ID>         - query profile with ID\n';
    text += '        broadcast <text>     - send broadcast message\n';

    text = text.replace(/</g, '&lt;');
    text = text.replace(/>/g, '&gt;');
    text = text.replace(/\n/g, '<br/>');
    text = text.replace(/\s/g, '&nbsp;');

    app.doHelp = function () {
        return text;
    };

}(DIMP);

!function (ns) {
    'use strict';

    var Profile = ns.Profile;
    var TextContent = ns.protocol.TextContent;

    var StarStatus = ns.stargate.StarStatus;

    var check_connection = function () {
        var status = server.getStatus();
        if (status.equals(StarStatus.Connected)) {
            // connected
            return null;
        } else if (status.equals(StarStatus.Error)) {
            return 'Connecting ...';
        } else if (status.equals(StarStatus.Error)) {
            return 'Connection error!';
        }
        return 'Connect to a DIM station first.';
    };

    app.doTelnet = function (address) {
        var options = {};
        var pair = address.split(/[: ]+/);
        if (pair.length === 1) {
            options['host'] = pair[0];
        } else if (pair.length === 2) {
            options['host'] = pair[0];
            options['port'] = pair[1];
        }
        server.start(options);
    };

    app.doLogin = function (name) {
        var res = check_connection();
        if (res) {
            return res;
        }
        var identifier = facebook.getIdentifier(name);
        if (!identifier) {
            return 'user error: ' + name;
        }
        var user = facebook.getUser(identifier);
        facebook.setCurrentUser(user);
        server.currentUser = user;
        return 'trying to login: ' + identifier + ' ...';
    };

    app.doLogout = function () {
        // TODO: clear session
    };

    app.doCall = function (name) {
        var identifier = facebook.getIdentifier(name);
        if (!identifier) {
            return 'user error: ' + name;
        }
        var meta = facebook.getMeta(identifier);
        if (!meta) {
            return 'meta not found: ' + identifier;
        }
        app.receiver = identifier;
        var nickname = facebook.getUsername(identifier);
        return 'talking with ' + nickname + ' now!';
    };

    app.doSend = function (text) {
        var res = check_connection();
        if (res) {
            return res;
        }
        var user = server.currentUser;
        if (!user) {
            return 'login first';
        }
        var receiver = app.receiver;
        if (!receiver) {
            return 'please set a recipient';
        }
        var content = new TextContent(text);
        if (messenger.sendContent(content, receiver)) {
            return 'message sent!';
        } else {
            return 'failed to send message.';
        }
    };

    app.doName = function (nickname) {
        var user = facebook.getCurrentUser();
        if (!user) {
            return 'current user not found';
        }
        var privateKey = facebook.getPrivateKeyForSignature(user.identifier);
        if (!privateKey) {
            return 'failed to get private key for current user: ' + user;
        }
        var profile = user.getProfile();
        if (!profile) {
            profile = new Profile(user.identifier);
        }
        profile.setName(nickname);
        profile.sign(privateKey);
        facebook.saveProfile(profile);
        var info = ns.format.JSON.encode(profile.properties);
        messenger.postProfile(profile);
        return 'nickname updated, profile: ' + info;
    };

    app.doShow = function (what) {
        if (what === 'users') {
            messenger.queryOnlineUsers();
            return 'querying online users ...';
        }
        return 'command error: show ' + what;
    };
    app.doSearch = function (number) {
        messenger.searchUsers(number);
        return 'searching users: ' + number;
    };

    app.doProfile = function (identifier) {
        identifier = facebook.getIdentifier(identifier);
        if (!identifier) {
            return 'user error: ' + name;
        }
        messenger.queryMeta(identifier);
        // messenger.queryProfile(identifier);
        if (identifier.getType().isGroup()) {
            return 'Querying profile for group: ' + identifier;
        } else {
            return 'Querying profile for user: ' + identifier;
        }
    };

}(DIMP);
