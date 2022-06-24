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

(function (ns, sdk) {
    'use strict';

    var NetworkType = sdk.protocol.NetworkType;
    var TextContent = sdk.protocol.TextContent;
    var HandshakeCommand = sdk.protocol.HandshakeCommand;
    var ReceiptCommand = sdk.protocol.ReceiptCommand;

    var CommonProcessor = ns.CommonProcessor;

    var ClientProcessor = function (facebook, messenger) {
        CommonProcessor.call(this, facebook, messenger);
    };
    sdk.Class(ClientProcessor, CommonProcessor, null, {
        createCreator: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.cpu.ClientProcessorCreator(facebook, messenger);
        },
        // Override
        processContent: function (content, rMsg) {
            var responses = CommonProcessor.prototype.processContent.call(this, content, rMsg);
            if (!responses || responses.length === 0) {
                // respond nothing
                return null;
            } else if (sdk.Interface.conforms(responses[0], HandshakeCommand)) {
                // urgent command
                return responses;
            }
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            var sender = rMsg.getSender();
            var receiver = rMsg.getReceiver();
            var user = facebook.selectLocalUser(receiver);
            // check responses
            var res;
            for (var i = 0; i < responses.length; ++i) {
                res = responses[i];
                if (!res) {
                    // should not happen
                    continue;
                } else if (sdk.Interface.conforms(res, ReceiptCommand)) {
                    if (NetworkType.STATION.equals(sender.getType())) {
                        // no need to respond receipt to station
                        return null;
                    }
                    console.log('receipt to sender', sender);
                } else if (sdk.Interface.conforms(res, TextContent)) {
                    if (NetworkType.STATION.equals(sender.getType())) {
                        // no need to respond text message to station
                        return null;
                    }
                    console.log('text to sender', sender);
                }
                // pack & send
                messenger.sendContent(user.getIdentifier(), sender, res, 1);
            }
            // DON'T respond to station directly
            return null;
        }
    });

    //-------- namespace --------
    ns.ClientProcessor = ClientProcessor;

    ns.registers('ClientProcessor');

})(SECHAT, DIMSDK);
