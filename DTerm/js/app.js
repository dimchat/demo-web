;

//! require <dimsdk.js>
//! require 'bubble.js'

!function (ns, sdk) {
    'use strict';

    var Class = sdk.type.Class;

    var ID       = sdk.protocol.ID;
    var Document = sdk.protocol.Document;

    var NotificationCenter   = sdk.lnc.NotificationCenter;
    var NotificationObserver = sdk.lnc.Observer;
    var NotificationNames    = sdk.NotificationNames;

    var SessionStateOrder = sdk.network.SessionStateOrder;
    var Terminal          = sdk.network.Terminal;

    var Anonymous = sdk.Anonymous;
    var Register  = sdk.Register;

    var get_database = function () {
        return sdk.GlobalVariable.getDatabase();
    };
    var get_facebook = function () {
        return sdk.GlobalVariable.getFacebook();
    };
    var get_messenger = function () {
        return sdk.GlobalVariable.getMessenger();
    };

    var Application = function () {
        Terminal.call(this);
        this.bubble = new Bubble();
        // notifications
        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, NotificationNames.SessionStateChanged);
        // nc.addObserver(this, NotificationNames.StationConnecting);
        // nc.addObserver(this, NotificationNames.StationConnected);
        // nc.addObserver(this, NotificationNames.StationError);
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
        var facebook = get_facebook();
        var user = facebook.getCurrentUser();
        if (user) {
            user = user.getIdentifier();
            return this.doLogin(user);
        }
        var db = get_database();
        // create new user
        var reg = new Register(db);
        var uid = reg.createUser('Anonymous');
        user = !uid ? null : facebook.getUser(uid);
        if (user) {
            db.saveLocalUsers([uid]);
            facebook.setCurrentUser(user);
        } else {
            return 'Failed to create user.';
        }
        this.write('New User ID: ' + uid.toString());
        return this.doLogin(uid);
    };

    Application.prototype.onReceiveNotification = function (notification) {
        var facebook = get_facebook();
        var identifier;
        var doc;
        var name = notification.getName();
        var userInfo = notification.getUserInfo();
        var res;
        if (name === NotificationNames.SessionStateChanged) {
            var state = userInfo['current'];
            var index = !state ? -1 : state.getIndex();
            if (!state) {
                this.write('Station state unknown: ' + state);
            }
            if (SessionStateOrder.CONNECTING.equals(index)) {
                name = NotificationNames.StationConnecting;
            } else if (SessionStateOrder.CONNECTED.equals(index)) {
                name = NotificationNames.StationConnected;
            } else if (SessionStateOrder.ERROR.equals(index)) {
                name = NotificationNames.StationError;
            } else if (SessionStateOrder.DEFAULT.equals(index)) {
                // auto login after connected
                res = auto_login.call(this);
                this.write(res);
                return;
            } else {
                this.write('Station state: ' + state.toString());
                return;
            }
        }
        if (name === NotificationNames.StationConnecting) {
            this.write('Connecting ....');
        } else if (name === NotificationNames.StationConnected) {
            this.write('Station connected.');
        } else if (name === NotificationNames.StationError) {
            this.write('Connection error.');
        } else if (name === NotificationNames.MetaAccepted) {
            identifier = userInfo['ID'];
            this.tips('[Meta saved] ID: ' + identifier);
        } else if (name === NotificationNames.DocumentUpdated) {
            doc = Document.parse(userInfo);
            this.tips('[Document updated] ID: ' + doc.getIdentifier()
                + ' -> ' + doc.getValue('data'));
            // // chatroom
            // identifier = facebook.getIdentifier('chatroom');
            // if (identifier && identifier.equals(doc.getIdentifier())) {
            //     // send current user's document to chatroom
            //     doc = facebook.getCurrentUser().getVisa();
            //     if (doc) {
            //         var messenger = get_messenger();
            //         messenger.sendVisa(doc, identifier, false);
            //     }
            //     res = this.doCall('chatroom');
            //     if (res.indexOf('You are talking') === 0) {
            //         res = this.doShow('users')
            //     }
            // }
        } else if (name === NotificationNames.MessageUpdated) {
            var msg = userInfo['msg'];
            var content = msg.getContent();
            var sender = msg.getSender();
            sender = facebook.getIdentifier(sender);
            var username = facebook.getName(sender);
            if (!username) {
                username = sender.getName();
            }
            var number = Anonymous.getNumberString(sender);
            var text = content.getValue('text');
            var group = content.getGroup();
            if (group && !ID.EVERYONE.equals(group)) {
                group = facebook.getIdentifier(group);
                name = facebook.getName(group);
                if (name) {
                    group = name;
                } else {
                    group = group.getName();
                }
                res = '[' + group + '] (' + number + ') ' + username + ': ' + text;
            } else {
                res = '(' + number + ') ' + username + ': ' + text;
            }
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
    Application.prototype.onHandshakeAccepted = function (session, server) {
        Terminal.prototype.onHandshakeAccepted.call(this, session, server);
        this.write('Handshake accepted!');
        var res;
        var messenger = get_messenger();
        var facebook = get_facebook();
        var identifier = facebook.getIdentifier('chatroom');
        if (identifier) {
            var doc = facebook.getVisa(identifier);
            if (doc) {
                var user = facebook.getCurrentUser();
                if (user && user.getVisa()) {
                    messenger.sendVisa(user.getVisa(), identifier, false);
                }
                res = this.doCall(identifier);
                if (res.indexOf('You are talking') === 0) {
                    res = this.doShow('history')
                }
            } else {
                res = this.doProfile('chatroom');
            }
        } else {
            res = this.doCall('station');
        }
        if (res) {
            this.write(res);
        }
    };

    ns.Application = Application;

}(dterm, DIMP);

!function (ns, sdk) {
    'use strict';

    var Anonymous   = sdk.Anonymous;
    var Application = ns.Application;

    // var get_database = function () {
    //     return sdk.GlobalVariable.getDatabase();
    // };
    var get_facebook = function () {
        return sdk.GlobalVariable.getFacebook();
    };
    // var get_messenger = function () {
    //     return sdk.GlobalVariable.getMessenger();
    // };

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
            //return sdk.format.JSON.encode(cmd) + ' command error';
            fn = 'doForward';
            args = cmd;
        }
        try {
            return this[fn](args);
        } catch (e) {
            return 'failed to execute command: '
                + sdk.format.JSON.encode(cmd) + '<br/>\n' + e;
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
    text += '        export [private key]     - export user info\n';
    text += '\n';
    text += '        <anytext>                - forward message (to current chatroom)\n';
    text += '\n';
    text += '        open DICQ                - open DICQ 2020\n';
    text += '\n';
    text = Bubble.convertToString(text);

    Application.prototype.doHelp = function () {
        return text;
    };

    Application.prototype.doWhoami = function () {
        var facebook = get_facebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            return 'Current user not found';
        }
        var identifier = user.getIdentifier();
        var name = facebook.getName(identifier);
        var number = Anonymous.getNumberString(identifier);
        return name + ' ' + number + ' : ' + identifier;
    };

    Application.prototype.doWho = function (ami) {
        var facebook = get_facebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            return 'Current user not found';
        }
        if (ami) {
            return Bubble.convertToString(user);
        }
        var my_name = facebook.getName(user.getIdentifier());
        var receiver = this.receiver;
        if (receiver) {
            var res = 'You (' + my_name + ') are talking';
            if (receiver.isGroup()) {
                var group = facebook.getGroup(receiver);
                if (group) {
                    res += ' in group: "' + group.getName() + '" ' + receiver;
                } else {
                    res += ' in group: ' + receiver;
                }
            } else {
                var contact = facebook.getUser(receiver);
                if (contact) {
                    res += ' with user: "' + facebook.getName(receiver) + '" ('
                        + Anonymous.getNumberString(receiver) + ') ' + receiver;
                } else {
                    res += ' with user: ' + receiver;
                }
            }
            return res;
        } else {
            return my_name;
        }
    };

}(dterm, DIMP);

!function (ns, sdk) {
    'use strict';

    var NetworkType = sdk.protocol.NetworkID;
    var ID          = sdk.protocol.ID;
    var Document    = sdk.protocol.Document;

    var Envelope       = sdk.protocol.Envelope;
    var InstantMessage = sdk.protocol.InstantMessage;
    var TextContent    = sdk.protocol.TextContent;
    var ForwardContent = sdk.protocol.ForwardContent;

    var SessionStateOrder = sdk.network.SessionStateOrder;
    var Host58            = sdk.network.Host58;

    var Anonymous   = sdk.Anonymous;
    var Application = ns.Application;

    // var get_database = function () {
    //     return sdk.GlobalVariable.getDatabase();
    // };
    var get_facebook = function () {
        return sdk.GlobalVariable.getFacebook();
    };
    var get_messenger = function () {
        return sdk.GlobalVariable.getMessenger();
    };
    var get_terminal = function () {
        return sdk.GlobalVariable.getTerminal();
    };

    var check_connection = function () {
        var messenger = get_messenger();
        var session = messenger.getSession();
        var status = session.getState();
        if (status) {
            status = status.getIndex();
        }
        if (SessionStateOrder.RUNNING.equals(status)) {
            // normal
            return null;
        } else if (SessionStateOrder.CONNECTING.equals(status)) {
            return 'Connecting ...';
        } else if (SessionStateOrder.HANDSHAKING.equals(status)) {
            return 'Handshaking ...';
        } else if (SessionStateOrder.ERROR.equals(status)) {
            return 'Connection error!';
        }
        return 'Connect to a DIM station first.';
    };

    Application.prototype.doTelnet = function (address) {
        var host = '106.52.25.169';
        // var host = '129.226.12.4';
        var port = 9394;
        if (address) {
            try {
                // try Host58
                var h58 = new Host58(address, port);
                host = h58.ip;
                port = h58.port;
            } catch (e) {
                // not a Host58 address
                var pair = address.split(/[: ]+/);
                if (pair.length === 1) {
                    host = pair[0];
                } else if (pair.length === 2) {
                    host = pair[0];
                    port = Number(pair[1]);
                }
            }
        }
        if (!port) {
            port = 9394;
        }
        // connect
        var client = get_terminal();
        client.connect(host, port);
        return 'Relay Station: (' + host + ':' + port + ')';
    };

    Application.prototype.doLogin = function (name) {
        var res = check_connection();
        if (res) {
            return res;
        }
        var facebook = get_facebook();
        var identifier = facebook.getIdentifier(name);
        if (!identifier) {
            return 'User error: ' + name;
        }
        var nickname = facebook.getName(identifier);
        var number = Anonymous.getNumberString(identifier);
        this.write('Current user: ' + nickname + ' (' + number + ')');

        var user = facebook.getUser(identifier);
        if (user) {
            facebook.setCurrentUser(user);
            // var messenger = get_messenger();
            // messenger.login(user);
            return 'Trying to login: ' + identifier + ' ...';
        } else {
            return 'Failed to get user: ' + identifier + ' ...';
        }
    };

    Application.prototype.doCall = function (name) {
        var facebook = get_facebook();
        var identifier = facebook.getIdentifier(name);
        if (!identifier) {
            return 'User error: ' + name;
        }
        var meta = facebook.getMeta(identifier);
        if (!meta) {
            return 'Meta not found: ' + identifier;
        }
        this.receiver = identifier;
        var nickname = facebook.getName(identifier);
        return 'You are talking with ' + nickname + ' now!';
    };

    var send_content = function (content, receiver) {
        var res = check_connection();
        if (res) {
            return res;
        }
        var facebook = get_facebook();
        var messenger = get_messenger();
        var user = facebook.getCurrentUser();
        if (!user) {
            return 'Login first';
        }
        if (!receiver) {
            return 'Please set a recipient';
        } else if (receiver.isGroup()) {
            var members = facebook.getMembers(receiver);
            if (!members || members.length === 0) {
                var ass = facebook.getAssistants(receiver);
                if (ass && ass.length > 0) {
                    messenger.queryGroupInfo(receiver, ass);
                    return 'Querying group members ...'
                }
                return 'Group members not found.';
            }
            content.setGroup(receiver);
        }
        if (messenger.sendContent(content, user.getIdentifier(), receiver, 0)) {
            // return 'Sending message ...';
            return null;
        } else {
            return 'Cannot send message now.';
        }
    };

    Application.prototype.doSend = function (text) {
        var content = TextContent.create(text);
        return send_content.call(this, content, this.receiver);
    };

    Application.prototype.doForward = function (text) {
        var facebook = get_facebook();
        var messenger = get_messenger();
        var user = facebook.getCurrentUser();
        var content = TextContent.create(text);
        // get recipient
        var receiver = this.receiver;
        if (NetworkType.BOT.equals(receiver.getType())) {
            // check admin
            var admin = facebook.getIdentifier('chatroom');
            if (receiver.equals(admin)) {
                // message sent to chatroom will be broadcast,
                // so change receiver to everyone
                receiver = ID.EVERYONE;
            }
        }
        if (receiver.isGroup()) {
            // group message
            content.setGroup(receiver);
        }
        if (user && receiver.equals(ID.EVERYONE)) {
            // forward to chatroom admin
            var env = Envelope.create(user.getIdentifier(), receiver, 0);
            var msg = InstantMessage.create(env, content);
            msg = messenger.signMessage(messenger.encryptMessage(msg));
            content = ForwardContent.create(msg);
        }
        return send_content.call(this, content, this.receiver);
    };

    Application.prototype.doName = function (nickname) {
        var messenger = get_messenger();
        var facebook = get_facebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            return 'Current user not found';
        }
        var privateKey = facebook.getPrivateKeyForSignature(user.getIdentifier());
        if (!privateKey) {
            return 'Failed to get private key for current user: ' + user;
        }
        var visa = user.getVisa();
        if (visa) {
            visa = Document.parse(visa.copyMap(false));
        } else {
            visa = Document.create(user.getIdentifier());
        }
        visa.setName(nickname);
        visa.sign(privateKey);
        facebook.saveDocument(visa);
        messenger.broadcastDocuments(true);
        var admin = facebook.getIdentifier('chatroom');
        if (admin) {
            messenger.sendVisa(visa, admin, false);
        }
        return 'Nickname updated, visa: ' + visa.getValue('data');
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
        if (what === 'history') {
            this.doSend('show history');
            return 'Querying chat history ...';
        }
        return 'Command error: show ' + what;
    };
    Application.prototype.doSearch = function (number) {
        var messenger = get_messenger();
        messenger.search(number);
        return 'Searching users: ' + number;
    };

    Application.prototype.doProfile = function (identifier) {
        var facebook = get_facebook();
        identifier = facebook.getIdentifier(identifier);
        if (!identifier) {
            return 'User error: ' + name;
        }
        var messenger = get_messenger();
        messenger.queryDocument(identifier);
        if (identifier.isGroup()) {
            return 'Querying profile for group: ' + identifier;
        } else {
            return 'Querying profile for user: ' + identifier;
        }
    };

    Application.prototype.doDecrypt = function (json) {
        var messenger = get_messenger();
        var rMsg = messenger.deserializeMessage(json);
        var sMsg = messenger.verifyMessage(rMsg);
        if (sMsg) {
            console.log('failed to verify message: ' + json);
        }
        var iMsg = messenger.decryptMessage(rMsg);
        var text = sdk.format.JSON.encode(iMsg);
        console.log('decrypted message: ' + text);
        return text;
    };

    Application.prototype.doHost58 = function (cmd) {
        var pair = cmd.split(/\s+/);
        var h58;
        if (pair[0] === 'encode') {
            h58 = new Host58(pair[1]);
            return pair[1] + ' -> ' + h58.encode() + ' -> ' + h58.encode(9394);
        } else if (pair[0] === 'decode') {
            h58 = new Host58(pair[1]);
            return pair[1] + ' -> ' + h58.toString();
        } else {
            throw Error('unknown command "' + cmd + '"');
        }
    };

    Application.prototype.doImport = function () {
        // TODO: implement me
        return 'import command not support yet';
    };

    Application.prototype.doExport = function () {
        var facebook = get_facebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            return 'Current user not found';
        }
        var me = user.getIdentifier();
        var privateKey = facebook.getPrivateKeyForSignature(me);
        if (!privateKey) {
            return 'Failed to get private key for current user: ' + me.toString();
        }
        var pem = privateKey.getValue('data');
        window.clipboardData.setData('text', pem);
        return 'Your private key has been copied to clipboard, please save it carefully.';
    };

}(dterm, DIMP);

!function (ns, sdk) {
    'use strict';

    var Application = ns.Application;

    Application.prototype.doOpen = function (target) {
        if (target === 'dicq' || target === 'DICQ') {
            if (typeof dicq === 'object') {
                // open DICQ
                dicq.Main();
            } else {
                // load DICQ
                var b = 'http://tarsier.dim.chat/web/';
                ns.loader.importJS(b + 'js/index.js', function () {
                    var l = b + 'connect.js';
                    ns.loader.importJS(l);
                });
            }
        }
    };

}(dterm, DIMP);
