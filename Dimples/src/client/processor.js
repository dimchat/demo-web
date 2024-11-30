;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
//
//                               Written in 2021 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

//! require 'common/*.js'

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Class     = ns.type.Class;
    var Log       = ns.lnc.Log;

    var EntityType       = ns.protocol.EntityType;
    var TextContent      = ns.protocol.TextContent;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var ReceiptCommand   = ns.protocol.ReceiptCommand;

    var MessageProcessor = ns.MessageProcessor;

    var ClientMessageProcessor = function (facebook, messenger) {
        MessageProcessor.call(this, facebook, messenger);
    };
    Class(ClientMessageProcessor, MessageProcessor, null, {

        // private
        checkGroupTimes: function (content, rMsg) {
            var group = content.getGroup();
            if (!group) {
                return false;
            }
            var facebook = this.getFacebook();
            var archivist = facebook.getArchivist();
            if (!archivist) {
                return false;
            }
            var now = new Date();
            var docUpdated = false;
            var memUpdated = false;
            // check group document time
            var lastDocumentTime = rMsg.getDateTime('GDT', null);
            if (lastDocumentTime) {
                if (lastDocumentTime.getTime() > now.getTime()) {
                    // calibrate the clock
                    lastDocumentTime = now;
                }
                docUpdated = archivist.setLastDocumentTime(group, lastDocumentTime);
                // check whether needs update
                if (docUpdated) {
                    Log.info('checking for new bulletin', group);
                    facebook.getDocuments(group);
                }
            }
            // check group history time
            var lastHistoryTime = rMsg.getDateTime('GHT', null);
            if (lastHistoryTime) {
                if (lastHistoryTime.getTime() > now.getTime()) {
                    // calibrate the clock
                    lastHistoryTime = now;
                }
                memUpdated = archivist.setLastGroupHistoryTime(group, lastHistoryTime);
                // check whether needs update
                if (memUpdated) {
                    archivist.setLastActiveMember(group, rMsg.getSender());
                    Log.info('checking for group members', group);
                    facebook.getMembers(group);
                }
            }
            return docUpdated || memUpdated;
        },

        // Override
        processContent: function (content, rMsg) {
            var responses = MessageProcessor.prototype.processContent.call(this, content, rMsg);

            // check group's document & history times from the message
            // to make sure the group info synchronized
            this.checkGroupTimes(content, rMsg);

            if (!responses || responses.length === 0) {
                // respond nothing
                return responses;
            } else if (Interface.conforms(responses[0], HandshakeCommand)) {
                // urgent command
                return responses;
            }
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();

            var sender = rMsg.getSender();
            var receiver = rMsg.getReceiver();
            var user = facebook.selectLocalUser(receiver);
            if (!user) {
                Log.error('receiver error', receiver);
                return responses;
            }
            receiver = user.getIdentifier();
            var network = sender.getType();
            // check responses
            var res;
            for (var i = 0; i < responses.length; ++i) {
                res = responses[i];
                if (!res) {
                    // should not happen
                    continue;
                } else if (Interface.conforms(res, ReceiptCommand)) {
                    if (EntityType.STATION.equals(network)) {
                        // no need to respond receipt to station
                        continue;
                    } else if (EntityType.BOT.equals(network)) {
                        // no need to respond receipt to a bot
                        continue;
                    }
                } else if (Interface.conforms(res, TextContent)) {
                    if (EntityType.STATION.equals(network)) {
                        // no need to respond text message to station
                        continue;
                    } else if (EntityType.BOT.equals(network)) {
                        // no need to respond text message to a bot
                        continue;
                    }
                }
                // normal response
                messenger.sendContent(res, receiver, sender, 1);
            }
            // DON'T respond to station directly
            return [];
        },

        createCreator: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.cpu.ClientContentProcessorCreator(facebook, messenger);
        }
    });

    //-------- namespace --------
    ns.ClientMessageProcessor = ClientMessageProcessor;

})(DIMP);
