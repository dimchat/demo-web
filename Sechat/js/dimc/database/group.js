;

//! require 'table.js'

!function (ns) {
    'use strict';

    var Facebook = ns.Facebook;
    var NotificationCenter = ns.stargate.NotificationCenter;

    var Table = ns.db.Table;

    var save_groups = function (map) {
        return Table.save(map, GroupTable);
    };
    var load_groups = function () {
        var groups = {};
        var map = Table.load(GroupTable);
        if (map) {
            var facebook = Facebook.getInstance();
            var g_list = Object.keys(map);
            for (var i = 0; i < g_list.length; ++i) {
                var group = g_list[i];
                var m_list = map[group];
                // group ID
                group = facebook.getIdentifier(group);
                if (!group) {
                    throw TypeError('group ID error: ' + g_list[i]);
                }
                // group members
                var members = [];
                for (var j = 0; j < m_list.length; ++j) {
                    var item = m_list[j];
                    item = facebook.getIdentifier(item);
                    if (!item) {
                        throw TypeError('member ID error: ' + m_list[j]);
                    }
                    members.push(item);
                }
                // got members for one group
                groups[group] = members;
            }
        }
        return groups;
    };

    var GroupTable = function () {
        this.groups = null; // ID => Array<ID>
    };

    GroupTable.prototype.loadMembers = function (group) {
        if (!this.groups) {
            this.groups = load_groups();
        }
        return this.groups[group];
    };

    GroupTable.prototype.saveMembers = function (members, group) {
        this.loadMembers(group);
        this.groups[group] = members;
        console.log('saving members for group: ' + group);
        var nc = NotificationCenter.getInstance();
        if (save_groups(this.groups)) {
            nc.postNotification('MembersUpdated', this,
                {'group': group, 'members': members});
            return true;
        } else {
            var text = 'failed to save members: ' + group + ' -> ' + members;
            console.log(text);
            return false;
        }
    };

    GroupTable.getInstance = function () {
        return Table.create(GroupTable);
    };

    //-------- namespace --------
    ns.db.GroupTable = GroupTable;

}(DIMP);
