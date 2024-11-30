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

    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;

    ///  Query Group Command Processor
    ///  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ///
    ///      1. query for group members-list
    ///      2. any existed member or assistant can query group members-list
    var QueryCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    Class(QueryCommandProcessor, GroupCommandProcessor, null, {

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

            // 1. check group
            var trip = this.checkGroupMembers(content, rMsg);
            var owner = trip[0];
            var members = trip[1];
            if (!(owner && members && members.length > 0)) {
                errors = pair[2];
                return !errors ? [] : errors;
            }
            var text;

            var sender = rMsg.getSender();
            var bots = this.getAssistants(group);
            var isMember = members.indexOf(sender) >= 0;
            var isBot = bots.indexOf(sender) >= 0;

            // 2. check permission
            var canQuery = isMember || isBot;
            if (!canQuery) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Not allowed to query members of group: ${ID}',
                    'replacements': {
                        'ID': group.toString()
                    }
                });
            }
            var facebook = this.getFacebook();
            var archivist = facebook.getArchivist();

            // check last group time
            var queryTime = content.getDateTime('last_time', null);  // content.getLastTime();
            if (queryTime) {
                // check last group history time
                var lastTime = archivist.getLastGroupHistoryTime(group);
                if (!lastTime) {
                    Log.error('group history error', group);
                } else if (lastTime.getTime() <= queryTime.getTime()) {
                    // group history not updated
                    text = 'Group history not updated.';
                    return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                        'template': 'Group history not updated: ${ID}, last time: ${time}',
                        'replacements': {
                            'ID': group.toString(),
                            'time': lastTime.getTime() / 1000.0
                        }
                    });
                }
            }

            // 3. send newest group history commands
            var ok = this.sendGroupHistories(group, sender);
            if (!ok) {
                Log.error('failed to send history for group', group, sender);
            }

            // no need to response this group command
            return [];
        }
    });

    //-------- namespace --------
    ns.cpu.QueryCommandProcessor = QueryCommandProcessor;

})(DIMP);
