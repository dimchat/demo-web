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

    var Class  = ns.type.Class;
    var Arrays = ns.type.Arrays;
    var Log    = ns.lnc.Log;

    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;

    ///  Quit Group Command Processor
    ///  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ///
    ///      1. remove the sender from members of the group
    ///      2. owner and administrator cannot quit
    var QuitCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    Class(QuitCommandProcessor, GroupCommandProcessor, null, {

        // Override
        process: function (content, rMsg) {
            var errors;  // List<Content>

            // 0. check command
            var pair = this.checkCommandExpired(content, rMsg);
            var group = pair[0];
            if (!group) {
                // ignore expired command
                errors = pair[1];
                return errors ? errors : [];
            }

            // 1. check group
            var trip = this.checkGroupMembers(content, rMsg);
            var owner = trip[0];
            var members = trip[1];
            if (!owner || !members || members.length === 0) {
                errors = pair[2];
                return errors ? errors : [];
            }
            var text;

            var sender = rMsg.getSender();
            var admins = this.getAdministrators(group);
            var isOwner = owner.equals(sender);
            var isAdmin = admins.indexOf(sender) >= 0;
            var isMember = members.indexOf(sender) >= 0;

            // 2. check permissions
            if (isOwner) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Owner cannot quit from group: ${ID}',
                    'replacements': {
                        'ID': group.toString()
                    }
                });
            }
            if (isAdmin) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Administrator cannot quit from group: ${ID}',
                    'replacements': {
                        'ID': group.toString()
                    }
                });
            }

            // 3. do quit
            if (!isMember) {
                // the sender is not a member now,
                // shall we notify the sender that the member list was updated?
            } else if (!this.saveGroupHistory(content, rMsg, group)) {
                // here try to append the 'quit' command to local storage as group history
                // it should not failed unless the command is expired
                Log.error('failed to save "quit" command for group', group);
            } else {
                // here try to remove the sender from member list
                var newMembers = members.slice();
                Arrays.remove(newMembers, sender);
                if (this.saveMembers(newMembers, group)) {
                    content.setValue('removed', [sender.toString()])
                } else {
                    // DB error?
                    Log.error('failed to save members for group', group);
                }
            }

            // no need to response this group command
            return [];
        }
    });

    //-------- namespace --------
    ns.cpu.QuitCommandProcessor = QuitCommandProcessor;

})(DIMP);
