;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2023 Albert Moky
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

//!require 'compatible.js'

(function (ns, sdk) {
    'use strict';

    var Class = sdk.type.Class;
    var ClientMessageProcessor = sdk.ClientMessageProcessor;

    var SharedProcessor = function (facebook, messenger) {
        ClientMessageProcessor.call(this, facebook, messenger);
    };
    Class(SharedProcessor, ClientMessageProcessor, null, {

        // Override
        createCreator: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.cpu.ClientProcessorCreator(facebook, messenger);
        },

        // Override
        processSecureMessage: function (sMsg, rMsg) {
            try {
                return ClientMessageProcessor.prototype.processSecureMessage.call(this, sMsg, rMsg);
            } catch (e) {
                console.error('failed to process message', rMsg, e);
                return [];
            }
        },

        // Override
        processInstantMessage: function (iMsg, rMsg) {
            var responses = ClientMessageProcessor.prototype.processInstantMessage.call(this, iMsg, rMsg);
            // save instant message
            var clerk = ns.Amanuensis;
            if (!clerk.saveInstantMessage(iMsg)) {
                console.error('failed to save instant message', iMsg);
                return [];
            }
            return responses;
        }
    });

    //-------- namespace --------
    ns.SharedProcessor = SharedProcessor;

})(SECHAT, DIMP);
