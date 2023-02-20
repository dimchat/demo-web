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

//! require <dimples.js>

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Storage = ns.dos.LocalStorage;
    var GroupDBI = ns.dbi.GroupDBI;

    var members_path = function (group) {
        return 'group.' + group.getAddress().toString() + '.members';
    };
    var bots_path = function (group) {
        return 'group.' + group.getAddress().toString() + '.assistants';
    };

    /**
     *  Storage for Groups
     *  ~~~~~~~~~~~~~~~~~~
     *
     *  (1) Group Members
     *      storage path: 'dim.fs.group.{ADDRESS}.members'
     *  (2) Group Assistants
     *      storage path: 'dim.fs.group.{ADDRESS}.assistants'
     */
    var GroupStorage = function () {
        Object.call(this);
    };
    Class(GroupStorage, Object, [GroupDBI], null);

    // Override
    GroupStorage.prototype.getFounder = function (group) {
        return null;
    };

    // Override
    GroupStorage.prototype.getOwner = function (group) {
        return null;
    };

    // Override
    GroupStorage.prototype.getMembers = function (group) {
        var path = members_path(group);
        var array = Storage.loadJSON(path);
        if (array) {
            return ID.convert(array);
        } else {
            return [];
        }
    };

    // Override
    GroupStorage.prototype.saveMembers = function (members, group) {
        var path = members_path(group);
        var array = ID.revert(members);
        return Storage.saveJSON(array, path);
    };

    // Override
    GroupStorage.prototype.getAssistants = function (group) {
        var path = bots_path(group);
        var array = Storage.loadJSON(path);
        if (array) {
            return ID.convert(array);
        } else {
            return [];
        }
    };

    // Override
    GroupStorage.prototype.saveAssistants = function (members, group) {
        var path = bots_path(group);
        var array = ID.revert(members);
        return Storage.saveJSON(array, path);
    };

    //-------- namespace --------
    ns.database.GroupStorage = GroupStorage;

})(DIMP);
