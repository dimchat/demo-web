;

//! require <dimsdk.js>
//! require 'bubble.js'

!function (ns) {
    'use strict';

    var Facebook = ns.Facebook;

    var StationDelegate = ns.network.StationDelegate;

    var Register = ns.extensions.Register;

    var NotificationCenter = ns.stargate.NotificationCenter;

    var Application = function () {
        this.bubble = new Bubble();
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
    ns.type.Class(Application, null, StationDelegate);

    var s_application = null;
    Application.getInstance = function () {
        if (!s_application) {
            s_application = new Application();
        }
        return s_application;
    };

    Application.prototype.tips = function () {
        var str = '';
        for (var i = 0; i < arguments.length; ++i) {
            str += arguments[i] + '';
        }
        this.bubble.showText(str);
    };

    Application.prototype.write = function () {
        this.tips.apply(this, arguments);
    };

    var auto_login = function () {
        var facebook = Facebook.getInstance();
        var user = facebook.getCurrentUser();
        if (!user) {
            this.write('Creating new user ...');
            // create new user
            var reg = new Register();
            user = reg.createUser('Anonymous');
            if (user) {
                facebook.setCurrentUser(user);
            }
        }
        if (user) {
            return this.doLogin(user.identifier);
        } else {
            return 'Failed to get current user';
        }
    };

    Application.prototype.onReceiveNotification = function (notification) {
        var facebook = Facebook.getInstance();
        var name = notification.name;
        var userInfo = notification.userInfo;
        var res;
        var nc = NotificationCenter.getInstance();
        if (name === nc.kNotificationStationConnecting) {
            res = 'Connecting to ' + userInfo['host'] + ':' + userInfo['port'] + ' ...';
        } else if (name === nc.kNotificationStationConnected) {
            this.write('Station connected.');
            // auto login after connected
            res = auto_login.call(this);
        } else if (name === nc.kNotificationStationError) {
            this.write('Connection error.');
        } else if (name === nc.kNotificationHandshakeAccepted) {
            this.write('Handshake accepted!');
            res = this.doCall('station');
        } else if (name === nc.kNotificationMetaAccepted) {
            var identifier = notification.userInfo['ID'];
            this.tips('[Meta saved] ID: ' + identifier);
        } else if (name === nc.kNotificationProfileUpdated) {
            var profile = notification.userInfo;
            this.tips('[Profile updated] ID: ' + profile.getIdentifier()
                + ' -> ' + profile.getValue('data'))
        } else if (name === nc.kNotificationMessageReceived) {
            var msg = notification.userInfo;
            var sender = msg.envelope.sender;
            var nickname = facebook.getUsername(sender);
            var text = msg.content.getValue('text');
            res = '[Message received] ' + nickname + ': ' + text;
        } else {
            res = 'Unknown notification: ' + name;
        }
        if (res) {
            this.write(res);
        }
    };

    //
    //  StationDelegate
    //
    Application.prototype.didSendPackage = function (data, server) {
        console.assert(data !== null, 'data empty');
        console.assert(server !== null, 'server empty');
        this.tips('Message sent!');
    };
    Application.prototype.didFailToSendPackage = function (error, data, server) {
        console.assert(data !== null, 'data empty');
        console.assert(server !== null, 'server empty');
        this.write('Failed to send message, please check connection. error: ' + error);
    };

    ns.Application = Application;

}(DIMP);

!function (ns) {
    'use strict';

    var Facebook = ns.Facebook;
    var Application = ns.Application;

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
        var facebook = Facebook.getInstance();
        var user = facebook.getCurrentUser();
        var name = facebook.getUsername(user.identifier);
        var number = facebook.getNumberString(user.identifier);
        return name + ' ' + number + ' : ' + user.identifier;
    };

    Application.prototype.doWho = function (ami) {
        var facebook = Facebook.getInstance();
        var user = facebook.getCurrentUser();
        if (ami) {
            return user.toString()
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }
        if (this.receiver) {
            var contact = facebook.getUser(this.receiver);
            if (contact) {
                contact = contact.getName() + ' ('
                    + facebook.getNumberString(this.receiver) + ') ' + this.receiver;
            } else {
                contact = this.receiver;
            }
            return 'You (' + user.getName() + ') are talking with ' + contact;
        } else {
            return facebook.getUsername(user.identifier);
        }
    };

}(DIMP);

!function (ns) {
    'use strict';

    var Facebook = ns.Facebook;
    var Messenger = ns.Messenger;
    var Application = ns.Application;

    var Profile = ns.Profile;
    var TextContent = ns.protocol.TextContent;

    var StarStatus = ns.stargate.StarStatus;

    var check_connection = function () {
        var server = Messenger.getInstance().server;
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
        var server = Messenger.getInstance().server;
        var host = server.host;
        var port = server.port;
        if (address) {
            var pair = address.split(/[: ]+/);
            if (pair.length === 1) {
                host = pair[0];
            } else if (pair.length === 2) {
                host = pair[0];
                port = Number(pair[1]);
            }
        }
        server.connect(host, port);
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
        var server = Messenger.getInstance().server;
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
        var messenger = Messenger.getInstance();
        var server = messenger.server;
        var user = server.currentUser;
        if (!user) {
            return 'Login first';
        }
        var receiver = this.receiver;
        if (!receiver) {
            return 'Please set a recipient';
        }
        var content = new TextContent(text);
        if (messenger.sendContent(content, receiver)) {
            // return 'Sending message ...';
            return null;
        } else {
            return 'Cannot send message now.';
        }
    };

    Application.prototype.doName = function (nickname) {
        var facebook = Facebook.getInstance();
        var user = facebook.getCurrentUser();
        if (!user) {
            return 'Current user not found';
        }
        var privateKey = facebook.getPrivateKeyForSignature(user.identifier);
        if (!privateKey) {
            return 'Failed to get private key for current user: ' + user;
        }
        var profile = user.getProfile();
        if (!profile) {
            profile = new Profile(user.identifier);
        }
        profile.setName(nickname);
        profile.sign(privateKey);
        facebook.saveProfile(profile);
        Messenger.getInstance().postProfile(profile);
        return 'Nickname updated, profile: ' + profile.getValue('data');
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
