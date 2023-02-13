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
    var OWNER_CANNOT_QUIT = 'Sorry, owner cannot quit group.';
    var ASSISTANT_CANNOT_QUIT = 'Sorry, assistant cannot quit group.';

    var QuitCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(QuitCommandProcessor, GroupCommandProcessor, null, {
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
            if (owner.equals(sender)) {
                return this.respondText(OWNER_CANNOT_QUIT, group);
            }
            var assistants = facebook.getAssistants(group);
            if (assistants && assistants.indexOf(sender) >= 0) {
                return this.removeAssistant(cmd, rMsg);
            }

            // 2. remove the sender from group members
            var pos = members.indexOf(sender);
            if (pos > 0) {
                // NOTICE: the first member must be the owner
                members.splice(pos, 1);
                facebook.saveMembers(members, group);
            }

            // 3. response (no need to response this group command)
            return null;
        },

        // protected
        removeAssistant: function (cmd, rMsg) {
            // NOTICE: group assistant should be retired by the owner
            return this.respondText(ASSISTANT_CANNOT_QUIT, cmd.getGroup());
        }
    });

    //-------- namespace --------
    ns.cpu.group.QuitCommandProcessor = QuitCommandProcessor;

    ns.cpu.group.registers('QuitCommandProcessor');

})(DIMSDK);
