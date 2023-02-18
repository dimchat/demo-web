;
// license: https://mit-license.org
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

//! require 'namespace.js'

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var EntityType = ns.protocol.EntityType;
    var TextContent = ns.protocol.TextContent;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var MessageProcessor = ns.MessageProcessor;

    var ClientMessageProcessor = function (facebook, messenger) {
        MessageProcessor.call(this, facebook, messenger);
    };
    Class(ClientMessageProcessor, MessageProcessor, null, {

        // Override
        processSecureMessage: function (sMsg, rMsg) {
            try {
                return MessageProcessor.prototype.processSecureMessage.call(this, sMsg, rMsg);
            } catch (e) {
                var errMsg = e.toString();
                if (errMsg && errMsg.indexOf('receiver error') >= 0) {
                    // not mine? ignore it
                    console.warn('ignore message', rMsg);
                    return [];
                } else {
                    throw e;
                }
            }
        },

        // Override
        processContent: function (content, rMsg) {
            var responses = MessageProcessor.prototype.processContent.call(this, content, rMsg);
            if (!responses || responses.length === 0) {
                // respond nothing
                return responses;
            } else if (Interface.conforms(responses[0], HandshakeCommand)) {
                // urgent command
                return responses;
            }
            var sender = rMsg.getSender();
            var receiver = rMsg.getReceiver();
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            var user = facebook.selectLocalUser(receiver);
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
                messenger.sendContent(receiver, sender, res, 1);
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

})(SECHAT);
