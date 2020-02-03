
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

!function (ns) {

    var Envelope = ns.Envelope;
    var HandshakeCommand = ns.protocol.HandshakeCommand;

    var InstantMessage = ns.InstantMessage;

    var Immortals = ns.Immortals;

    var cmd = HandshakeCommand.start();
    var env = Envelope.newEnvelope(Immortals.MOKI, station.identifier);
    var msg = InstantMessage.newMessage(cmd, env);

    msg = messenger.encryptMessage(msg);
    msg = messenger.signMessage(msg);
    var json = msg.toJSON();
    webSocket.send(json);

    app.doLogin = function (name) {
        var identifier = facebook.getIdentifier(name);
        return 'login ' + identifier;
    }



}(DIMP);
