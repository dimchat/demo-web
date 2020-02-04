;

//!require <stargate.js>

!function (ns) {
    'use strict';

    var LocalStorage = ns.stargate.LocalStorage;

    var Table = {

        create: function (clazz) {
            var name = clazz.name;
            var table = this.tables[name];
            if (!table) {
                table = new clazz();
                this.tables[name] = table;
            }
            return table;
        },

        load: function (clazz) {
            var name = clazz.name;
            return LocalStorage.loadJSON(name);
        },

        save: function (data, clazz) {
            var name = clazz.name;
            return LocalStorage.saveJSON(data, name);
        },

        tables: {}
    };

    //-------- namespace --------
    if (typeof ns.db !== 'object') {
        ns.db = {};
    }
    ns.db.Table = Table;

}(DIMP);
