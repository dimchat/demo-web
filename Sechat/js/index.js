;

var facebook;
var messenger;

!function (ns) {

    var Immortals = ns.Immortals;

    facebook = DIMP.Facebook.getInstance();

    facebook.ans.save('moki', Immortals.MOKI);
    facebook.ans.save('hulk', Immortals.HULK);

    messenger = DIMP.Messenger.getInstance();

}(DIMP);

!function () {

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

!function () {

    app.doLogin = function (name) {
        var identifier = facebook.getIdentifier(name);
        return 'login ' + identifier;
    }

}();
