;

//! require <dimsdk.js>
//! require 'bubble.js'

!function (ns) {
    'use strict';

    var Facebook = ns.Facebook;
    var Messenger = ns.Messenger;

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
        var messenger = Messenger.getInstance();
        var identifier;
        var profile;
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
            identifier = facebook.getIdentifier('chatroom');
            if (identifier) {
                profile = facebook.getProfile(identifier);
                if (profile) {
                    var user = facebook.getCurrentUser();
                    if (user && user.getProfile()) {
                        messenger.sendProfile(user.getProfile(), identifier);
                    }
                    res = this.doCall(identifier);
                    if (res.indexOf('You are talking') === 0) {
                        res = this.doShow('users')
                    }
                } else {
                    res = this.doProfile('chatroom');
                }
            } else {
                res = this.doCall('station');
            }
        } else if (name === nc.kNotificationMetaAccepted) {
            identifier = notification.userInfo['ID'];
            this.tips('[Meta saved] ID: ' + identifier);
        } else if (name === nc.kNotificationProfileUpdated) {
            profile = notification.userInfo;
            this.tips('[Profile updated] ID: ' + profile.getIdentifier()
                + ' -> ' + profile.getValue('data'));
            // chatroom
            identifier = facebook.getIdentifier('chatroom');
            if (identifier && identifier.equals(profile.getIdentifier())) {
                // send current user's profile to chatroom
                profile = facebook.getCurrentUser().getProfile();
                if (profile) {
                    messenger.sendProfile(profile, identifier);
                }
                res = this.doCall('chatroom');
                if (res.indexOf('You are talking') === 0) {
                    res = this.doShow('users')
                }
            }
        } else if (name === nc.kNotificationMessageReceived) {
            var msg = notification.userInfo;
            var sender = msg.envelope.sender;
            sender = facebook.getIdentifier(sender);
            var nickname = facebook.getNickname(sender);
            var number = facebook.getNumberString(sender);
            var text = msg.content.getValue('text');
            res = nickname + ' (' + number + '): ' + text;
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
        var args;
        var fn = 'do';
        if (command.length > 0) {
            fn += command.replace(command[0], command[0].toUpperCase());
        }
        if (typeof this[fn] === 'function') {
            args = cmd.replace(command, '').trim();
        } else {
            //return ns.format.JSON.encode(cmd) + ' command error';
            fn = 'doForward';
            args = cmd;
        }
        try {
            return this[fn](args);
        } catch (e) {
            return 'failed to execute command: '
                + ns.format.JSON.encode(cmd) + '<br/>\n' + e;
        }
    };

    var text = 'Usage:\n';
    text += '        telnet [<host>[:<port>]] - re/connect (to a DIM station)\n';
    text += '        login <ID>               - switch user\n';
    text += '        name <nickname>          - reset nickname\n';
    text += '        call <ID>                - change recipient (or "chatroom")\n';
    text += '        send <text>              - send message to the recipient\n';
    text += '        who [am I]               - show current user info\n';
    text += '        show users               - list online users\n';
    text += '        search <ID|number>       - search users by ID or number\n';
    text += '        profile <ID>             - query profile with ID\n';
    text += '        <anytext>                - send to current chatroom\n';
    text = Bubble.convertToString(text);

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
            return Bubble.convertToString(user);
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

    var ID = ns.ID;
    var Profile = ns.Profile;
    var Envelope = ns.Envelope;
    var InstantMessage = ns.InstantMessage;
    var TextContent = ns.protocol.TextContent;
    var ForwardContent = ns.protocol.ForwardContent;

    var StarStatus = ns.stargate.StarStatus;

    var Facebook = ns.Facebook;
    var Messenger = ns.Messenger;
    var Application = ns.Application;

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
        if (user) {
            facebook.setCurrentUser(user);
            Messenger.getInstance().login(user);
            return 'Trying to login: ' + identifier + ' ...';
        } else {
            return 'Failed to get user: ' + identifier + ' ...';
        }
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

    var send_content = function (content, receiver) {
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
        if (!receiver) {
            return 'Please set a recipient';
        }
        if (messenger.sendContent(content, receiver)) {
            // return 'Sending message ...';
            return null;
        } else {
            return 'Cannot send message now.';
        }
    };

    Application.prototype.doSend = function (text) {
        var content = new TextContent(text);
        return send_content.call(this, content, this.receiver);
    };

    Application.prototype.doForward = function (text) {
        var messenger = Messenger.getInstance();
        var server = messenger.server;
        var user = server.currentUser;
        var content = new TextContent(text);
        var env = Envelope.newEnvelope(user.identifier, ID.EVERYONE);
        var msg = InstantMessage.newMessage(content, env);
        msg = messenger.signMessage(messenger.encryptMessage(msg));
        var forward = new ForwardContent(msg);
        return send_content.call(this, forward, this.receiver);
    };

    Application.prototype.doName = function (nickname) {
        var messenger = Messenger.getInstance();
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
        messenger.postProfile(profile);
        var admin = facebook.getIdentifier('chatroom');
        if (admin) {
            messenger.sendProfile(profile, admin);
        }
        return 'Nickname updated, profile: ' + profile.getValue('data');
    };

    Application.prototype.doShow = function (what) {
        if (what === 'users') {
            // Messenger.getInstance().queryOnlineUsers();
            this.doSend('show users');
            return 'Querying online users ...';
        }
        if (what === 'stat') {
            this.doSend('show stat');
            return 'Querying statistics ...';
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

    Application.prototype.doDecrypt = function (json) {
        var messenger = Messenger.getInstance();
        var rMsg = messenger.deserializeMessage(json);
        var sMsg = messenger.verifyMessage(rMsg);
        if (sMsg) {
            console.log('failed to verify message: ' + json);
        }
        var iMsg = messenger.decryptMessage(rMsg);
        var text = ns.format.JSON.encode(iMsg);
        console.log('decrypted message: ' + text);
        return text;
    };

    Application.prototype.doHost58 = function (cmd) {
        var pair = cmd.split(/\s+/);
        var host = new DIMP.network.Host58(pair[1], 9394);
        if (pair[0] === 'encode') {
            return host.encode();
        } else if (pair[0] === 'decode') {
            return host.toString();
        } else {
            throw Error('unknown command "' + cmd + '"');
        }
    };

}(DIMP);
