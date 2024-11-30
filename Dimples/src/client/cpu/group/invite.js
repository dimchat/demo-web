;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
//
//                               Written in 2020 by Moky <albert.moky@gmail.com>
//
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

//! require '../group.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Log   = ns.lnc.Log;

    var ID    = ns.protocol.ID;

    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;

    ///  Invite Group Command Processor
    ///  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ///
    ///      1. add new member(s) to the group
    ///      2. any member can invite new member
    ///      3. invited by ordinary member should be reviewed by owner/administrator
    var InviteCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    Class(InviteCommandProcessor, GroupCommandProcessor, null, {

        // Override
        process: function (content, rMsg) {
            var errors;  // List<Content>

            // 0. check command
            var pair = this.checkCommandExpired(content, rMsg);
            var group = pair[0];
            if (!group) {
                // ignore expired command
                errors = pair[1];
                return !errors ? [] : errors;
            }
            var pair1 = this.checkCommandMembers(content, rMsg);
            var inviteList = pair1[0];
            if (!inviteList || inviteList.length === 0) {
                // command error
                errors = pair[1];
                return !errors ? [] : errors;
            }

            // 1. check group
            var trip = this.checkGroupMembers(content, rMsg);
            var owner = trip[0];
            var members = trip[1];
            if (!owner || !members || members.length === 0) {
                errors = pair[2];
                return !errors ? [] : errors;
            }
            var text;

            var sender = rMsg.getSender();
            var admins = this.getAdministrators(group);
            var isOwner = owner.equals(sender);
            var isAdmin = admins.indexOf(sender) >= 0;
            var isMember = members.indexOf(sender) >= 0;

            // 2. check permission
            if (!isMember) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Not allowed to invite member into group: ${ID}',
                    'replacements': {
                        'ID': group.toString()
                    }
                });
            }
            var canReset = isOwner || isAdmin;

            // 3. do invite
            var memPair = InviteCommandProcessor.calculateInvited(members, inviteList);
            var newMembers = memPair[0];
            var addedList = memPair[1];
            if (!addedList || addedList.length === 0) {
                // maybe those users are already become members,
                // but if it can still receive an 'invite' command here,
                // we should respond the sender with the newest membership again.
                var facebook = this.getFacebook();
                var user = facebook.getCurrentUser();
                if (!canReset && user.getIdentifier().equals(owner)) {
                    // the sender cannot reset the group, means it's an ordinary member now,
                    // and if I am the owner, then send the group history commands
                    // to update the sender's memory.
                    var ok = this.sendGroupHistories(group, sender);
                    if (!ok) {
                        Log.error('failed to send history for group', group, sender);
                    }
                }
            } else if (!this.saveGroupHistory(content, rMsg, group)) {
                // here try to append the 'invite' command to local storage as group history
                // it should not failed unless the command is expired
                Log.error('failed to save "invite" command', group);
            } else if (!canReset) {
                // the sender cannot reset the group, means it's invited by ordinary member,
                // and the 'invite' command was saved, now waiting for review.
            } else if (this.saveMembers(newMembers, group)) {
                // FIXME: this sender has permission to reset the group,
                //        means it must be the owner or an administrator,
                //        usually it should send a 'reset' command instead;
                //        if we received the 'invite' command here, maybe it was confused,
                //        anyway, we just append the new members directly.
                Log.warning('invited by administrator', sender, group);
                content.setValue('added', ID.revert(addedList));
            } else {
                // DB error?
                Log.error('failed to save members for group', group);
            }

            // no need to response this group command
            return [];
        }
    });

    // protected
    InviteCommandProcessor.calculateInvited = function (members, inviteList) {
        var newMembers = members.slice();  // copy
        var addedList = [];  // List<ID>
        var item;            // ID
        for (var i = 0; i < inviteList.length; ++i) {
            item = inviteList[i];
            if (newMembers.indexOf(item) >= 0) {
                continue;
            }
            newMembers.push(item);
            addedList.push(item);
        }
        return [newMembers, addedList];
    };

    //-------- namespace --------
    ns.cpu.InviteCommandProcessor = InviteCommandProcessor;

})(DIMP);
