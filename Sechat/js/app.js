;

//!require <dimsdk.js>

!function (ns) {
    'use strict';

    var Facebook = ns.Facebook;

    var StationDelegate = ns.network.StationDelegate;

    var Register = ns.extensions.Register;

    var NotificationCenter = ns.stargate.NotificationCenter;

    var Application = function () {
        // notifications
        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, kNotificationStationConnecting);
        nc.addObserver(this, kNotificationStationConnected);
        nc.addObserver(this, kNotificationHandshakeAccepted);
        nc.addObserver(this, kNotificationMetaAccepted);
        nc.addObserver(this, kNotificationProfileUpdated);
        nc.addObserver(this, kNotificationMessageReceived);
    };
    Application.inherits(StationDelegate);

    Application.prototype.write = function () {
        var str = '';
        for (var i = 0; i < arguments.length; ++i) {
            str += arguments[i] + '';
        }
        console.log(str);
    };

    Application.prototype.getCurrentUser = function () {
        var user = Facebook.getInstance().getCurrentUser();
        if (!user) {
            // create new user
            var reg = new Register();
            user = reg.createUser('Anonymous');
            if (user) {
                Facebook.getInstance().setCurrentUser(user);
            } else {
                this.write('Failed to create user');
            }
        }
        return user;
    };

    Application.prototype.onReceiveNotification = function (notification) {
        var name = notification.name;
        var userInfo = notification.userInfo;
        var user = this.getCurrentUser();
        var res;
        if (name === kNotificationStationConnecting) {
            res = 'Connecting to ' + userInfo['host'] + ':' + userInfo['port'] + ' ...';
        } else if (name === kNotificationStationConnected) {
            this.write('Station connected.');
            if (user) {
                res = this.doLogin(user.identifier);
            } else {
                res = 'Current user not found.';
            }
        } else if (name === kNotificationHandshakeAccepted) {
            this.write('Handshake accepted!');
            res = this.doCall('station');
        } else if (name === kNotificationMetaAccepted) {
            var identifier = notification.userInfo['ID'];
            res = '[Meta saved] ID: ' + identifier;
        } else if (name === kNotificationProfileUpdated) {
            var profile = notification.userInfo;
            res = '[Profile updated] ID: ' + profile.getIdentifier()
                + ' -> ' + profile.getValue('data');
        } else if (name === kNotificationMessageReceived) {
            var msg = notification.userInfo;
            var sender = msg.envelope.sender;
            var nickname = Facebook.getInstance().getUsername(sender);
            var text = msg.content.getValue('text');
            res = '[Message received] ' + nickname + ': ' + text;
        } else {
            res = 'Unknown notification: ' + name;
        }
        this.write(res);
    };

    //
    //  StationDelegate
    //
    Application.prototype.didSendPackage = function (data, server) {
        console.assert(data !== null, 'data empty');
        console.assert(server !== null, 'server empty');
        this.write('Message sent!');
    };
    Application.prototype.didFailToSendPackage = function (error, data, server) {
        console.assert(data !== null, 'data empty');
        console.assert(server !== null, 'server empty');
        this.write('Failed to send message, please check connection. error: ' + error);
    };

    window.Application = Application;

}(DIMP);

!function (ns) {
    'use strict';

    var Facebook = ns.Facebook;

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
    text += '        telnet <host>[:<port>] - connect to a DIM station\n';
    text += '        login <ID>             - switch user\n';
    text += '        logout                 - clear session\n';
    text += '        call <ID>              - change receiver to another user (or "station")\n';
    text += '        send <text>            - send message\n';
    text += '        name <niciname>        - reset nickname\n';
    text += '        who [am I]             - show current user info\n';
    text += '        show users             - list online users\n';
    text += '        search <ID|number>     - search users by ID or number\n';
    text += '        profile <ID>           - query profile with ID\n';

    text = text.replace(/</g, '&lt;');
    text = text.replace(/>/g, '&gt;');
    text = text.replace(/\n/g, '<br/>');
    text = text.replace(/ {2}/g, ' &nbsp;');

    Application.prototype.doHelp = function () {
        return text;
    };

    Application.prototype.doWhoami = function () {
        var user = this.getCurrentUser();
        var name = Facebook.getInstance().getUsername(user.identifier);
        var number = Facebook.getInstance().getNumberString(user.identifier);
        return name + ' ' + number + ' : ' + user.identifier;
    };

    Application.prototype.doWho = function (ami) {
        var user = this.getCurrentUser();
        if (ami) {
            return user.toString()
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }
        if (this.receiver) {
            var contact = Facebook.getInstance().getUser(this.receiver);
            if (contact) {
                contact = contact.getName() + '(' + this.receiver + ')';
            } else {
                contact = this.receiver;
            }
            return 'You (' + user.getName() + ') are talking with ' + contact;
        } else {
            return Facebook.getInstance().getUsername(user.identifier);
        }
    };

}(DIMP);

!function (ns) {
    'use strict';

    var Facebook = ns.Facebook;
    var Messenger = ns.Messenger;

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
        var facebook = Facebook.getInstance();
        var identifier = facebook.getIdentifier(name);
        if (!identifier) {
            return 'User error: ' + name;
        }
        var nickname = facebook.getNickname(identifier);
        var number = facebook.getNumberString(identifier);
        this.write('Current user: ' + nickname + ' (' + number + ')');

        var user = facebook.getUser(identifier);
        facebook.setCurrentUser(user);
        server.currentUser = user;
        return 'Trying to login: ' + identifier + ' ...';
    };

    Application.prototype.doLogout = function () {
        // TODO: clear session
    };

    Application.prototype.doCall = function (name) {
        var facebook = Facebook.getInstance();
        var identifier = facebook.getIdentifier(name);
        if (!identifier) {
            return 'User error: ' + name;
        }
        var meta = facebook.getMeta(identifier);
        if (!meta) {
            return 'Meta not found: ' + identifier;
        }
        this.receiver = identifier;
        var nickname = facebook.getUsername(identifier);
        return 'You are talking with ' + nickname + ' now!';
    };

    Application.prototype.doSend = function (text) {
        var res = check_connection();
        if (res) {
            return res;
        }
        var user = server.currentUser;
        if (!user) {
            return 'Login first';
        }
        var receiver = this.receiver;
        if (!receiver) {
            return 'Please set a recipient';
        }
        var content = new TextContent(text);
        if (Messenger.getInstance().sendContent(content, receiver)) {
            // return 'Sending message ...';
            return null;
        } else {
            return 'Cannot send message now.';
        }
    };

    Application.prototype.doName = function (nickname) {
        var user = this.getCurrentUser();
        if (!user) {
            return 'Current user not found';
        }
        var privateKey = Facebook.getInstance().getPrivateKeyForSignature(user.identifier);
        if (!privateKey) {
            return 'Failed to get private key for current user: ' + user;
        }
        var profile = user.getProfile();
        if (!profile) {
            profile = new Profile(user.identifier);
        }
        profile.setName(nickname);
        profile.sign(privateKey);
        Facebook.getInstance().saveProfile(profile);
        var info = ns.format.JSON.encode(profile.properties);
        Messenger.getInstance().postProfile(profile);
        return 'Nickname updated, profile: ' + info;
    };

    Application.prototype.doShow = function (what) {
        if (what === 'users') {
            Messenger.getInstance().queryOnlineUsers();
            return 'Querying online users ...';
        }
        return 'Command error: show ' + what;
    };
    Application.prototype.doSearch = function (number) {
        Messenger.getInstance().searchUsers(number);
        return 'Searching users: ' + number;
    };

    Application.prototype.doProfile = function (identifier) {
        identifier = Facebook.getInstance().getIdentifier(identifier);
        if (!identifier) {
            return 'User error: ' + name;
        }
        Messenger.getInstance().queryProfile(identifier);
        if (identifier.getType().isGroup()) {
            return 'Querying profile for group: ' + identifier;
        } else {
            return 'Querying profile for user: ' + identifier;
        }
    };

}(DIMP);
