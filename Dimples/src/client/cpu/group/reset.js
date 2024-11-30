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

    ///  Reset Group Command Processor
    ///  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ///
    ///      1. reset group members
    ///      2. only group owner or assistant can reset group members
    var ResetCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    Class(ResetCommandProcessor, GroupCommandProcessor, null, {

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
            var pair1 = this.checkCommandMembers(content, rMsg);
            var newMembers = pair1[0];
            if (!newMembers || newMembers.length === 0) {
                // command error
                errors = pair[1];
                return errors ? errors : [];
            }

            // 1. check group
            var trip = this.checkGroupMembers(content, rMsg);
            var owner = trip[0];
            var members = trip[1];
            if (!(owner && members && members.length > 0)) {
                errors = pair[2];
                return errors ? errors : [];
            }
            var text;

            var sender = rMsg.getSender();
            var admins = this.getAdministrators(group);
            var isOwner = owner.equals(sender);
            var isAdmin = admins.indexOf(sender) >= 0;

            // 2. check permission
            var canReset = isOwner || isAdmin;
            if (!canReset) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Not allowed to reset members of group: ${ID}',
                    'replacements': {
                        'ID': group.toString()
                    }
                });
            }
            // 2.1. check owner
            if (!newMembers[0].equals(owner)) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Owner must be the first member of group: ${ID}',
                    'replacements': {
                        'ID': group.toString()
                    }
                });
            }
            // 2.2. check admins
            var expelAdmin = false;
            for (var i = 0; i < admins.length; ++i) {
                if (newMembers.indexOf(admins[i]) < 0) {
                    expelAdmin = true;
                    break;
                }
            }
            if (expelAdmin) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Not allowed to expel administrator of group: ${ID}',
                    'replacements': {
                        'ID': group.toString()
                    }
                });
            }

            // 3. do reset
            var memPair = ResetCommandProcessor.calculateReset(members, newMembers);
            var addList = memPair[0];
            var removeList = memPair[1];
            if (!this.saveGroupHistory(content, rMsg, group)) {
                // here try to save the 'reset' command to local storage as group history
                // it should not failed unless the command is expired
                Log.error('failed to save "reset" command for group', group);
            } else if (addList.length === 0 && removeList.length === 0) {
                // nothing changed
            } else if (this.saveMembers(newMembers, group)) {
                Log.info('new members saved in group', group);
                if (addList.length > 0) {
                    content.setValue('added', ID.revert(addList));
                }
                if (removeList.length > 0) {
                    content.setValue('removed', ID.revert(removeList));
                }
            } else {
                // DB error?
                Log.error('failed to save members in group', group);
            }

            // no need to response this group command
            return [];
        }
    });

    ResetCommandProcessor.calculateReset = function (oldMembers, newMembers) {
        var addList = [];     // List<ID>
        var removeList = [];  // List<ID>
        var item;             // ID
        // build invited-list
        for (var i = 0; i < newMembers.length; ++i) {
            item = newMembers[i];
            if (oldMembers.indexOf(item) < 0) {
                addList.push(item);
            }
        }
        // build expelled-list
        for (var j = 0; j < oldMembers.length; ++j) {
            item = oldMembers[j];
            if (newMembers.indexOf(item) < 0) {
                removeList.push(item);
            }
        }
        return [addList, removeList];
    };

    //-------- namespace --------
    ns.cpu.ResetCommandProcessor = ResetCommandProcessor;

})(DIMP);
