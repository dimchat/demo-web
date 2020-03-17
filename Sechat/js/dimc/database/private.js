;

//! require 'table.js'

!function (ns) {
    'use strict';

    var PrivateKey = ns.crypto.PrivateKey;

    var Facebook = ns.Facebook;

    var Table = ns.db.Table;

    var save_keys = function (map) {
        return Table.save(map, PrivateTable);
    };
    var load_keys = function () {
        var keys = {};
        var map = Table.load(PrivateTable);
        if (map) {
            var facebook = Facebook.getInstance();
            var identifier, key;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                identifier = list[i];
                key = map[identifier];
                identifier = facebook.getIdentifier(identifier);
                key = PrivateKey.getInstance(key);
                if (identifier && key) {
                    keys[identifier] = key;
                }
            }
        }
        return keys;
    };

    var PrivateTable = function () {
        this.privateKeys = null;
    };

    PrivateTable.prototype.loadPrivateKey = function (identifier) {
        if (!this.privateKeys) {
            this.privateKeys = load_keys();
        }
        return this.privateKeys[identifier];
    };
    PrivateTable.prototype.savePrivateKey = function (key, identifier) {
        this.loadPrivateKey(identifier);
        this.privateKeys[identifier] = key;
        console.log('saving private key for ' + identifier);
        return save_keys(this.privateKeys);
    };

    PrivateTable.getInstance = function () {
        return Table.create(PrivateTable);
    };

    //-------- namespace --------
    ns.db.PrivateTable = PrivateTable;

}(DIMP);
