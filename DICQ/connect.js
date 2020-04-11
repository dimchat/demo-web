
!function (dimp) {
    'use strict';

    var Meta = dimp.Meta;

    var Server = dimp.network.Server;

    var facebook = dimp.Facebook.getInstance();
    var messenger = dimp.Messenger.getInstance();

    var sid = 'gsp-s003@x2oNDzjDWbJMNDpCfKkU7dnHyJerd447Jh';
    sid = facebook.getIdentifier(sid);

    var meta = {
        "version": 1,
        "seed": "gsp-s003",
        "key": {
            "algorithm": "RSA",
            "data": "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC0nyRrAvwudsACDvufoyqQLtTV\nDaLQEzx92n1jmOswisUeNA53Fwso16zCKIADUm4Qtw2LuhYRnrKguJff2+tSG0kc\nCEwHhkDF8jY7ADgabtladbrIN9TEx3TOEvxlBU/LG5hirx8zruvNLpMqVgBP1kd6\nd5pf3uMcV9IUhIxYbwIDAQAB\n-----END PUBLIC KEY-----",
            "mode": "ECB",
            "padding": "PKCS1",
            "digest": "SHA256"
        },
        "fingerprint": "VGgVWWSzzkYEgYM14F6pCcxJj5jmZ5cepvmJC8i4gXNWWeG4V5/BQTKMhLX7hX1g3sikpWAkRgMFKttHGrIyEeDqGDtim1axVi70j9WZoPxKydbmCVtagxffJX2M9r4Et5e49I0jPHu+/2m9ep9QHTgKMyKjIfGSjLkZRGxWa0Y="
    };
    meta = Meta.getInstance(meta);
    facebook.saveMeta(meta, sid);

    // var host = '127.0.0.1';
    var host = '203.195.224.155'; // ngz
    var port = 9394;

    var server = new Server(sid, host, port);
    facebook.cacheUser(server);
    // server.stationDelegate = app;

    messenger.delegate = server;
    messenger.server = server;
    server.messenger = messenger;
    server.start();

}(DIMP);

!function (dimp) {
    'use strict';

    var Immortals = dimp.Immortals;

    var facebook = dimp.Facebook.getInstance();

    // patch for search number
    var getIdentifier = facebook.getIdentifier;
    facebook.getIdentifier = function (string) {
        var identifier = getIdentifier.call(this, string);
        if (identifier && this.ans && !this.ans.getIdentifier(string)) {
            this.ans.cache(String(identifier.getNumber()), identifier);
        }
        return identifier;
    };

    var force_ans = function (name, identifier) {
        identifier = facebook.getIdentifier(identifier);
        // cheat the reserved names checking
        var isReserved = facebook.ans.isReserved;
        facebook.ans.isReserved = function () {return false;};
        facebook.ans.save(name, identifier);
        facebook.ans.isReserved = isReserved;
    };

    var test_names = [
        'moki', Immortals.MOKI,
        'hulk', Immortals.HULK,

        'station', 'gsp-s002@wpjUWg1oYDnkHh74tHQFPxii6q9j3ymnyW',

        'chatroom', 'chatroom-admin@2PpG1A6LuConRMyZuV8TNJGbaSQ28Ke7ogH',

        'assistant', 'assistant@4WBSiDzg9cpZGPqFrQ4bHcq4U5z9QAQLHS',
        'xiaoxiao', 'xiaoxiao@2PhVByg7PhEtYPNzW5ALk9ygf6wop1gTccp',
        'lingling', 'lingling@2PemMVAvxpuVZw2SYwwo11iBBEBb7gCvDHa',

        'moky', 'moky@4DnqXWdTV8wuZgfqSCX9GjE2kNq7HJrUgQ',
        'baloo', 'baloo@4LA5FNbpxP38UresZVpfWroC2GVomDDZ7q',
        'zero', 'zero@4Zi2iyrcaT1oq4z44sjLVQZCEWSsE8nF8k',
        'long', 'long@4LJnk9AhRnvQF5SXDeDUzWGvi5whzToGJK',
        null
    ];
    for (var i = 0; i < test_names.length; i += 2) {
        force_ans(test_names[i], test_names[i+1]);
    }

}(DIMP);

!function (ns, dimp) {
    'use strict';

    var Application = ns.Application;

    var Messenger = dimp.Messenger;

    var app = new Application();

    var messenger = Messenger.getInstance();
    var server = messenger.server;
    server.stationDelegate = app;

    ns.Main();

}(dicq, DIMP);
