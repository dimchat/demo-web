;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2020 Albert Moky
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// =============================================================================
//

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;

    var Storage = sdk.dos.LocalStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;

    ns.db.GroupTable = {

        getFounder: function (group) {
            return null;
        },

        getOwner: function (group) {
            return null;
        },

        getMembers: function (group) {
            this.load()
            var members = this.__members[group.toString()];
            if (members) {
                return ID.convert(members);
            } else {
                return null;
            }
        },

        addMember: function (member, group) {
            var members = this.getMembers(group);
            if (members) {
                if (members.indexOf(member.toString()) >= 0) {
                    return false;
                }
                members.push(member.toString());
            } else {
                members = [member.toString()];
            }
            return this.saveMembers(members, group);
        },

        removeMember: function (member, group) {
            var members = this.getMembers(group);
            if (!members) {
                return false;
            }
            var pos = members.indexOf(member.toString());
            if (pos < 0) {
                return false;
            }
            members.splice(pos, 1);
            return this.saveMembers(members, group);
        },

        saveMembers: function (members, group) {
            this.load()
            this.__members[group.toString()] = ID.revert(members);
            console.log('saving members for group', group);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification('MembersUpdated', this,
                    {'group': group, 'members': members});
                return true;
            } else {
                throw new Error('failed to save members: ' + group + ' -> ' + members);
            }
        },

        removeGroup: function (group) {
            this.load();
            if (this.__members[group.toString()]) {
                delete this.__members[group.toString()]
                return this.save();
            } else {
                console.error('group not exists: ' + group);
                return false;
            }
        },

        load: function () {
            if (!this.__members) {
                this.__members = Storage.loadJSON('GroupTable');
                if (!this.__members) {
                    this.__members = {};
                }
            }
        },
        save: function () {
            return Storage.saveJSON(this.__members, 'GroupTable');
        },

        __members: null  // ID => Array<ID>
    };

    var parse = function (map) {
        var groups = {};
        if (map) {
            var g_list = Object.keys(map);
            for (var i = 0; i < g_list.length; ++i) {
                var group = g_list[i];
                var m_list = map[group];
                // group ID
                group = ID.parse(group);
                if (!group) {
                    throw new TypeError('group ID error: ' + g_list[i]);
                }
                // group members
                var members = [];
                for (var j = 0; j < m_list.length; ++j) {
                    var item = m_list[j];
                    item = ID.parse(item);
                    if (!item) {
                        throw new TypeError('member ID error: ' + m_list[j]);
                    }
                    members.push(item);
                }
                // got members for one group
                groups[group] = members;
            }
        }
        return groups;
    };

})(SECHAT, DIMSDK);
