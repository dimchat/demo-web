;

//! require 'table.js'

!function (ns) {
    'use strict';

    var Meta = ns.Meta;

    var Facebook = ns.Facebook;
    var NotificationCenter = ns.stargate.NotificationCenter;

    var Table = ns.db.Table;

    var save_metas = function (map) {
        return Table.save(map, MetaTable);
    };
    var load_metas = function () {
        var metas = {};
        var map = Table.load(MetaTable);
        if (map) {
            var facebook = Facebook.getInstance();
            var identifier, meta;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                identifier = list[i];
                meta = map[identifier];
                identifier = facebook.getIdentifier(identifier);
                meta = Meta.getInstance(meta);
                if (identifier && meta) {
                    metas[identifier] = meta;
                }
            }
        }
        return metas;
    };

    var MetaTable = function () {
        this.metas = null; // ID => Array<Meta>
    };

    MetaTable.prototype.loadMeta = function (identifier) {
        if (!this.metas) {
            this.metas = load_metas();
        }
        return this.metas[identifier];
    };
    MetaTable.prototype.saveMeta = function (meta, identifier) {
        this.loadMeta(identifier);
        if (this.metas[identifier]) {
            console.log('meta already exists: ' + identifier);
            return true;
        }
        this.metas[identifier] = meta;
        console.log('saving meta for ' + identifier);
        var nc = NotificationCenter.getInstance();
        if (save_metas(this.metas)) {
            nc.postNotification(nc.kNotificationMetaAccepted, this,
                {'ID': identifier, 'meta': meta});
            return true;
        } else {
            var text = 'failed to save meta: '
                + identifier + ' -> '
                + ns.format.JSON.encode(meta);
            console.log(text);
            return false;
        }
    };

    MetaTable.getInstance = function () {
        return Table.create(MetaTable);
    };

    //-------- namespace --------
    ns.db.MetaTable = MetaTable;

}(DIMP);
