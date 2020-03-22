
!function (dimp) {
    'use strict';

    var Meta = dimp.Meta;

    var Server = dimp.network.Server;

    var facebook = dimp.Facebook.getInstance();
    var messenger = dimp.Messenger.getInstance();

    var sid = 'gsp-s002@wpjUWg1oYDnkHh74tHQFPxii6q9j3ymnyW';
    sid = facebook.getIdentifier(sid);

    var meta = {
        "version": 1,
        "seed": "gsp-s002",
        "key": {
            "algorithm": "RSA",
            "data": "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDACQ1bmv8V3xSCvVDWy+6P4pOl\n46MkIdKEqZ3Z+kvIrpStO/y5DZMWzTRx1z1Ateibc+QCUREaLvKqECycyRNPO+aD\n04rT5WxZfSuHxf+PxajDQ1rcwImc0JR/PbkUIgD5kb2JrsSfTaEObsrhxKlgimey\nOG9bwcmSud6HzPkWZQIDAQAB\n-----END PUBLIC KEY-----",
            "mode": "ECB",
            "padding": "PKCS1",
            "digest": "SHA256"
        },
        "fingerprint": "Z1HI27oXMvY5oOpA1HaD+6d4t8/tlGty5XU+6+CIkeij5m8xS1C4vRJm3qaLTxSRsnwX6mMgkvxMAu6FfvDWe4/cisWAWt8E+aC7BrgESVanQyglWZLx0OSWDmV1jrE9Y0xAA3HlgxIoMdi3sQ4giV0NxeJHUymGenC+EsbtiUU="
    };
    meta = Meta.getInstance(meta);
    facebook.saveMeta(meta, sid);

    // var host = '127.0.0.1';
    var host = '134.175.87.98'; // gz
    var port = 9394;

    var server = new Server(sid, host, port);
    facebook.cacheUser(server);
    // server.stationDelegate = app;

    messenger.delegate = server;
    messenger.server = server;
    server.messenger = messenger;
    server.start();

}(DIMP);
