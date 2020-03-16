;

//!require <stargate.js>

!function (ns) {
    'use strict';

    var Storage = ns.stargate.SessionStorage;

    var Facebook = ns.Facebook;

    var load = function (name) {
        return Storage.loadJSON(name);
    };
    var save = function (name, value) {
        return Storage.saveJSON(value, name);
    };

    var GroupTable = function () {
        this.memberTable = {}; // ID => Array<ID>
    };

    GroupTable.prototype.saveMembers = function (members, group) {
        if (!members) {
            return false;
        }
        this.memberTable[group] = members;
        return save(group, members);
    };

    GroupTable.prototype.loadMembers = function (group) {
        var members = this.memberTable[group];
        if (members) {
            return members;
        }
        members = [];
        var list = load(group);
        if (list) {
            var facebook = Facebook.getInstance();
            var item;
            for (var i = 0; i < list.length; ++i) {
                item = facebook.getIdentifier(list[i]);
                if (!item) {
                    throw Error('ID error: ' + list[i]);
                }
                members.push(item);
            }
        }
        this.memberTable[group] = members;
        return members;
    };

    var s_instance = null;

    GroupTable.getInstance = function () {
        if (!s_instance) {
            s_instance = new GroupTable();
        }
        return s_instance;
    };

    //-------- namespace --------
    ns.db.GroupTable = GroupTable;

}(DIMP);
