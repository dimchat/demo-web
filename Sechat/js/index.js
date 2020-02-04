;

!function (ns) {
    'use strict';

    var text = 'Usage:\n';
    text += '        login <ID>        - switch user (must say "hello" twice after login)\n';
    text += '        logout            - clear session\n';
    text += '        show users        - list online users\n';
    text += '        search <number>   - search users by number\n';
    text += '        profile <ID>      - query profile with ID\n';
    text += '        call <ID>         - change receiver to another user (or "station")\n';
    text += '        send <text>       - send message\n';
    text += '        broadcast <text>  - send broadcast message\n';
    text += '        exit              - terminate';

    text = text.replace(/</g, '&lt;');
    text = text.replace(/>/g, '&gt;');
    text = text.replace(/\n/g, '<br/>');
    text = text.replace(/\s/g, '&nbsp;');

    app.help = function (cmd) {
        return text;
    };

}(DIMP);

!function (ns) {
    'use strict';

    app.onReceiveNotification = function (notification) {
        var name = notification.name;
        if (name === kNotificationHandshakeAccepted) {
            app.write('Handshake accepted!');
        }
    };

    notificationCenter.addObserver(app, kNotificationHandshakeAccepted);

}(DIMP);

!function (ns) {
    'use strict';

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
        var nickname = facebook.getNickname(identifier);
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

}(DIMP);
