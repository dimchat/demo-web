;

!function (ns) {

    var Application = function () {
        // notifications
        notificationCenter.addObserver(this, kNotificationHandshakeAccepted);
        notificationCenter.addObserver(this, kNotificationStationConnected);
        notificationCenter.addObserver(this, kNotificationMessageReceived);
    };

    var Register = ns.extensions.Register;

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
        this.write('Current user: ' + nickname + ' (' + number + ') ' + user.identifier);
        this.doLogin(user.identifier);
        return true;
    };

    Application.prototype.onReceiveNotification = function (notification) {
        var name = notification.name;
        if (name === kNotificationHandshakeAccepted) {
            this.write('Handshake accepted!');
        } else if (name === kNotificationStationConnected) {
            this.write('Station connected.');
            login.call(this);
        } else if (name === kNotificationMessageReceived) {
            var msg = notification.userInfo;
            var sender = msg.envelope.sender;
            var nickname = facebook.getUsername(sender);
            var text = msg.content.getValue('text');
            this.write('Message received (' + nickname + '): ' + text);
        }
    };

    window.Application = Application;

}(DIMP);

!function (ns) {
    'use strict';

    var getCommand = function (cmd) {
        if (cmd) {
            var array = cmd.split(/\s/g);
            if (array.length > 0) {
                return array[0];
            }
        }
        return '';
    };

    Application.prototype.exec = function (cmd) {
        var command = getCommand(cmd);
        var fn = 'do';
        if (command.length > 0) {
            fn += command.replace(command[0], command[0].toUpperCase());
        }
        if (typeof this[fn] !== 'function') {
            return ns.format.JSON.encode(cmd) + ' command error';
        }
        try {
            var args = cmd.replace(command, '').trim();
            return this[fn](args);
        } catch (e) {
            return 'failed to execute command: '
                + ns.format.JSON.encode(cmd) + '<br/>\n' + e;
        }
    };

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

    Application.prototype.doHelp = function () {
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

    Application.prototype.doTelnet = function (address) {
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

    Application.prototype.doLogin = function (name) {
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

    Application.prototype.doLogout = function () {
        // TODO: clear session
    };

    Application.prototype.doCall = function (name) {
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

    Application.prototype.doSend = function (text) {
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

    Application.prototype.doName = function (nickname) {
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

    Application.prototype.doShow = function (what) {
        if (what === 'users') {
            messenger.queryOnlineUsers();
            return 'querying online users ...';
        }
        return 'command error: show ' + what;
    };
    Application.prototype.doSearch = function (number) {
        messenger.searchUsers(number);
        return 'searching users: ' + number;
    };

    Application.prototype.doProfile = function (identifier) {
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
