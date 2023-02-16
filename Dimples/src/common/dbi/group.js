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

(function (ns) {
    'use strict';

    var ID = ns.protocol.ID;

    var Storage = ns.db.LocalStorage;
    var NotificationCenter = ns.lnc.NotificationCenter;

    ns.db.GroupTable = {

        getFounder: function (group) {
            return null;
        },

        getOwner: function (group) {
            return null;
        },

        getMembers: function (group) {
            this.load()
            return this.__members[group];
        },

        addMember: function (member, group) {
            var members = this.getMembers(group);
            if (members) {
                if (members.indexOf(member) >= 0) {
                    return false;
                }
                members.push(member);
            } else {
                members = [member];
            }
            return this.saveMembers(members, group);
        },

        removeMember: function (member, group) {
            var members = this.getMembers(group);
            if (!members) {
                return false;
            }
            var pos = members.indexOf(member);
            if (pos < 0) {
                return false;
            }
            members.splice(pos, 1);
            return this.saveMembers(members, group);
        },

        saveMembers: function (members, group) {
            this.load()
            this.__members[group] = members;
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
            if (this.__members[group]) {
                delete this.__members[group]
                return this.save();
            } else {
                console.error('group not exists: ' + group);
                return false;
            }
        },

        load: function () {
            if (!this.__members) {
                this.__members = convert(Storage.loadJSON('GroupTable'));
            }
        },
        save: function () {
            return Storage.saveJSON(revert(this.__members), 'GroupTable');
        },

        __members: null  // ID => Array<ID>
    };

    var convert = function (map) {
        var results = {};
        if (map) {
            var g;
            var groups = Object.keys(map);
            for (var i = 0; i < groups.length; ++i) {
                g = groups[i];
                results[ID.parse(g)] = ID.convert(map[g]);
            }
        }
        return results;
    };
    var revert = function (map) {
        var results = {};
        var g;
        var groups = Object.keys(map);
        for (var i = 0; i < groups.length; ++i) {
            g = groups[i];
            results[g.toString()] = ID.revert(map[g]);
        }
        return results;
    };

})(SECHAT);
