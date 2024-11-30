;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
//
//                               Written in 2024 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2024 Albert Moky
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

//! require 'delegate.js'

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Class     = ns.type.Class;
    var Log       = ns.lnc.Log;

    var ID              = ns.protocol.ID;
    var ResetCommand    = ns.protocol.group.ResetCommand;
    var ResignCommand   = ns.protocol.group.ResignCommand;

    var DocumentHelper  = ns.mkm.DocumentHelper;
    var TripletsHelper  = ns.TripletsHelper;

    /**
     *  Group Command Helper
     *  ~~~~~~~~~~~~~~~~~~~~
     */
    var GroupCommandHelper = function (delegate) {
        TripletsHelper.call(this, delegate);
    };
    Class(GroupCommandHelper, TripletsHelper, null, null);

    /**
     *  Save Group History Command
     *
     * @param {GroupCommand|Command|Content} content
     * @param {ReliableMessage|Message} rMsg
     * @param {ID} group
     * @return {boolean}
     */
    GroupCommandHelper.prototype.saveGroupHistory = function (content, rMsg, group) {
        if (this.isCommandExpired(content)) {
            Log.warning('drop expired command', content.getCmd(), rMsg.getSender(), group);
            return false;
        }
        // check command time
        var cmdTime = content.getTime();
        if (!cmdTime) {
            Log.error('group command error: ' + content.toString());
        } else {
            // calibrate the clock
            // make sure the command time is not in the far future
            var current = (new Date()).getTime() + 65536;
            if (cmdTime.getTime() > current) {
                Log.error('group command time error', cmdTime, content);
                return false;
            }
        }
        // update group history
        var db = this.getDatabase();
        if (Interface.conforms(content, ResetCommand)) {
            Log.warning('cleaning group history for "reset" command', rMsg.getSender(), group);
            return db.clearGroupMemberHistories(group);
        }
        return db.saveGroupHistory(content, rMsg, group);
    };
    GroupCommandHelper.prototype.getGroupHistories = function (group) {
        var db = this.getDatabase();
        return db.getGroupHistories(group);  // List<Pair<GroupCommand, ReliableMessage>>
    };
    GroupCommandHelper.prototype.getResetCommandMessage = function (group) {
        var db = this.getDatabase();
        return db.getResetCommandMessage(group);  // Pair<ResetCommand, ReliableMessage>
    };
    GroupCommandHelper.prototype.clearGroupMemberHistories = function (group) {
        var db = this.getDatabase();
        return db.clearGroupMemberHistories(group);  // boolean
    };
    GroupCommandHelper.prototype.clearGroupAdminHistories = function (group) {
        var db = this.getDatabase();
        return db.clearGroupAdminHistories(group);  // boolean
    };


    /**
     *  Check command time
     *  (all group commands received must after the cached 'reset' command)
     *
     * @param {GroupCommand|Content} content
     * @return {boolean}
     */
    GroupCommandHelper.prototype.isCommandExpired = function (content) {
        var group = content.getGroup();
        if (!group) {
            Log.error('group content error: ' + content.toString());
            return true;
        }
        if (Interface.conforms(content, ResignCommand)) {
            // administrator command, check with document time
            var delegate = this.getDelegate();
            var doc = delegate.getBulletin(group);
            if (!doc) {
                Log.error('group document not exists: ' + group.toString());
                return true;
            }
            return DocumentHelper.isBefore(doc.getTime(), content.getTime());
        }
        // membership command, check with reset command
        var pair = this.getResetCommandMessage(group);
        var cmd = pair[0];
        // var msg = pair[1];
        if (!cmd/* || !msg*/) {
            return false;
        }
        return DocumentHelper.isBefore(cmd.getTime(), content.getTime());
    };

    GroupCommandHelper.prototype.getMembersFromCommand = function (content) {
        // get from 'members'
        var members = content.getMembers();
        if (!members) {
            members = [];
            // get from 'member'
            var single = content.getMember();
            if (single) {
                members.push(single);
            }
        }
        return members;
    };

    //-------- namespace --------
    ns.group.GroupCommandHelper = GroupCommandHelper;

})(DIMP);
