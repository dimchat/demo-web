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

    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;

    var GROUP_EMPTY = 'Group empty.';
    var EXPEL_CMD_ERROR = 'Expel command error.';
    var EXPEL_NOT_ALLOWED = 'Sorry, you are not allowed to expel member from this group.';
    var CANNOT_EXPEL_OWNER = 'Group owner cannot be expelled.';

    var ExpelCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(ExpelCommandProcessor, GroupCommandProcessor, null, {
        // Override
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();

            // 0. check group
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.respondText(GROUP_EMPTY, group);
            }

            // 1. check permission
            var sender = rMsg.getSender();
            if (!owner.equals(sender)) {
                // not the owner? check assistants
                var assistants = facebook.getAssistants(group);
                if (!assistants || assistants.indexOf(sender) < 0) {
                    return this.respondText(EXPEL_NOT_ALLOWED, group);
                }
            }

            // 2. expelling members
            var expels = this.getMembers(cmd);
            if (expels.length === 0) {
                return this.respondText(EXPEL_CMD_ERROR, group);
            }
            // 2.1. check owner
            if (expels.indexOf(owner) >= 0) {
                return this.respondText(CANNOT_EXPEL_OWNER, group);
            }
            // 2.2. build expel list
            var removes = [];
            var item, pos;
            for (var i = 0; i < expels.length; ++i) {
                item = expels[i];
                pos = members.indexOf(item);
                if (pos < 0) {
                    // member not exists
                    continue;
                }
                // got removing member
                removes.push(item.toString());
                members.splice(pos, 1);
            }
            // 2.3. do expelling
            if (removes.length > 0) {
                if (facebook.saveMembers(members, group)) {
                    cmd.setValue('removed', removes);
                }
            }

            // 3. response (no need to response this group command)
            return null;
        }
    });

    //-------- namespace --------
    ns.cpu.group.ExpelCommandProcessor = ExpelCommandProcessor;

    ns.cpu.group.registers('ExpelCommandProcessor');

})(DIMSDK);
