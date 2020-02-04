;

!function () {
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

}();

!function (ns) {
    'use strict';

    app.doLogin = function (name) {
        var identifier = facebook.getIdentifier(name);
        var user = facebook.getUser(identifier);
        facebook.setCurrentUser(user);
        server.currentUser = user;
        return 'login ' + identifier;
    }

}();
