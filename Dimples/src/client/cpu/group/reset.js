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

//! require 'group.js'

(function (ns) {
    'use strict';

    var GroupCommand = ns.protocol.GroupCommand;

    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;

    var RESET_CMD_ERROR = 'Reset command error.';
    var RESET_NOT_ALLOWED = 'Sorry, you are not allowed to reset this group.';

    var ResetCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(ResetCommandProcessor, GroupCommandProcessor, null, {
        // Override
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();

            // 0. check group
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                // FIXME: group info lost?
                // FIXME: how to avoid strangers impersonating group member?
                return this.temporarySave(cmd, rMsg.getSender());
            }

            // 1. check permission
            var sender = rMsg.getSender();
            if (!owner.equals(sender)) {
                // not the owner? check assistants
                var assistants = facebook.getAssistants(group);
                if (!assistants || assistants.indexOf(sender) < 0) {
                    return this.respondText(RESET_NOT_ALLOWED, group);
                }
            }

            // 2. resetting members
            var newMembers = this.getMembers(cmd);
            if (newMembers.length === 0) {
                return this.respondText(RESET_CMD_ERROR, group);
            }
            // 2.1. check owner
            if (newMembers.indexOf(owner) < 0) {
                return this.respondText(RESET_CMD_ERROR, group);
            }
            // 2.2. build expel list
            var removes = [];
            var item, i;
            for (i = 0; i < members.length; ++i) {
                item = members[i];
                if (newMembers.indexOf(item) < 0) {
                    // got removing member
                    removes.push(item.toString());
                }
            }
            // 2.3. build invite list
            var adds = [];
            for (i = 0; i < newMembers.length; ++i) {
                item = newMembers[i];
                if (members.indexOf(item) < 0) {
                    // got new member
                    adds.push(item.toString());
                }
            }
            // 2.4. do resetting
            if (adds.length > 0 || removes.length > 0) {
                if (facebook.saveMembers(newMembers, group)) {
                    if (adds.length > 0) {
                        cmd.setValue('added', adds);
                    }
                    if (removes.length > 0) {
                        cmd.setValue('removed', removes);
                    }
                }
            }

            // 3. response (no need to response this group command)
            return null;
        },

        // protected
        temporarySave: function (cmd, sender) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            // check whether the owner contained in the new members
            var newMembers = this.getMembers(cmd);
            if (newMembers.length === 0) {
                return this.respondText(RESET_CMD_ERROR, group);
            }
            var item;
            for (var i = 0; i < newMembers.length; ++i) {
                item = newMembers[i];
                if (!facebook.getMeta(item)) {
                    // TODO: waiting for member's meta?
                    continue;
                } else if (!facebook.isOwner(item, group)) {
                    // not owner, skip it
                    continue;
                }
                // it's a full list, save it now
                if (facebook.saveMembers(newMembers, group)) {
                    if (!item.equals(sender)) {
                        // NOTICE: to prevent counterfeit,
                        //         query the owner for newest member-list
                        this.queryOwner(item, group);
                    }
                }
                // response (no need to respond this group command)
                return null;
            }
            // NOTICE: this is a partial member-list
            //         query the sender for full-list
            var res = GroupCommand.query(group);
            return this.respondContent(res);
        },

        // protected
        queryOwner: function (owner, group) {
            // TODO: send QueryCommand to the group owner
        }
    });

    //-------- namespace --------
    ns.cpu.group.ResetCommandProcessor = ResetCommandProcessor;

    ns.cpu.group.registers('ResetCommandProcessor');

})(DIMSDK);
