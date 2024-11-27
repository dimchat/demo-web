
// !function (app, sdk) {
//     'use strict';
//
//     var ID = sdk.protocol.ID;
//
//     var facebook = app.GlobalVariable.getFacebook();
//
//     // // patch for search number
//     // var getIdentifier = facebook.getIdentifier;
//     // facebook.getIdentifier = function (string) {
//     //     var identifier = getIdentifier.call(this, string);
//     //     if (identifier && this.ans && !this.ans.getIdentifier(string)) {
//     //         this.ans.cache(String(identifier.getNumber()), identifier);
//     //     }
//     //     return identifier;
//     // };
//
//     var force_ans = function (name, identifier) {
//         // identifier = ID.parse(identifier);
//         // // cheat the reserved names checking
//         // var isReserved = facebook.ans.isReserved;
//         // facebook.ans.isReserved = function () {return false;};
//         // facebook.ans.save(name, identifier);
//         // facebook.ans.isReserved = isReserved;
//     };
//
//     var test_names = [
//         'station', 'gsp-s002@wpjUWg1oYDnkHh74tHQFPxii6q9j3ymnyW',
//
//         'chatroom', 'chatroom-admin@2Pc5gJrEQYoz9D9TJrL35sA3wvprNdenPi7',
//
//         'assistant', 'assistant@2PpB6iscuBjA15oTjAsiswoX9qis5V3c1Dq',
//         'xiaoxiao', 'xiaoxiao@2PhVByg7PhEtYPNzW5ALk9ygf6wop1gTccp',
//         'lingling', 'lingling@2PemMVAvxpuVZw2SYwwo11iBBEBb7gCvDHa',
//
//         'moky', 'moky@4DnqXWdTV8wuZgfqSCX9GjE2kNq7HJrUgQ',
//         'baloo', 'baloo@4LA5FNbpxP38UresZVpfWroC2GVomDDZ7q',
//         'zero', 'zero@4Zi2iyrcaT1oq4z44sjLVQZCEWSsE8nF8k',
//         'long', 'long@4LJnk9AhRnvQF5SXDeDUzWGvi5whzToGJK',
//         null
//     ];
//     for (var i = 0; i < test_names.length; i += 2) {
//         force_ans(test_names[i], test_names[i+1]);
//     }
//
//     // assistants
//     var assistants = [
//         'assistant@2PpB6iscuBjA15oTjAsiswoX9qis5V3c1Dq',  // dev
//         'assistant@4WBSiDzg9cpZGPqFrQ4bHcq4U5z9QAQLHS',   // desktop.dim.chat
//         null
//     ];
//     facebook.assistants = [];
//     for (var k = 0; k < assistants.length; ++k) {
//         var id = assistants[k];
//         if (!id) {
//             continue;
//         }
//         facebook.assistants.push(ID.parse(id));
//     }
//
//     facebook.getAssistants = function () {
//         return this.assistants;
//     };
//
// }(SECHAT, DIMP);

!function (ns, app, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;

    var sid = $_GET['sid'];
    if (!sid) {
        // sid = 'gsp-s001@x5Zh9ixt8ECr59XLye1y5WWfaX4fcoaaSC';
        sid = 'gsp-s002@wpjUWg1oYDnkHh74tHQFPxii6q9j3ymnyW';
    }
    sid = ID.parse(sid);

    var host = $_GET['host'];
    if (!host) {
        // host = '127.0.0.1';
        // host = '192.168.31.91';
        host = '106.52.25.169';   // gz
        // host = '124.156.108.150'; // hk
    }
    var port = $_GET['port'];
    if (!port) {
        port = 9394;
    }

    var application = ns.Application.getInstance();
    application.reconnect = function () {
        console.warn('reconnect')
        var messenger = app.GlobalVariable.getMessenger();
        var server = messenger.getCurrentStation();
        if (server) {
            // FIXME: disconnect DIM station
            server.stationDelegate = null;
            server.messenger = null;
            // messenger.server = null;
        }

        var client = messenger.getTerminal()
        client.launch({
            'host': host,
            'port': port,
            'ID': sid
        })
        // server.stationDelegate = application;
    };

    ns.Main();

}(dicq, SECHAT, DIMP);
