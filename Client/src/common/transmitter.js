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

    var MessageTransmitter = sdk.MessageTransmitter;

    var CommonTransmitter = function (messenger) {
        MessageTransmitter.call(this, messenger);
    };
    sdk.Class(CommonTransmitter, MessageTransmitter, null);

    CommonTransmitter.prototype.sendInstantMessage = function(iMsg, callback, priority) {
        var messenger = this.getMessenger();
        // do the encryption in background thread
        setTimeout(function () {
            // Send message (secured + certified) to target station
            var sMsg = messenger.encryptMessage(iMsg);
            if (sMsg == null) {
                // public key not found?
                return false;
                //throw new ReferenceError("failed to encrypt message: " + iMsg.getMap());
            }
            var rMsg = messenger.signMessage(sMsg);
            if (rMsg == null) {
                // TODO: set iMsg.state = error
                throw new ReferenceError("failed to sign message: " + sMsg.getMap());
            }

            var OK = messenger.sendReliableMessage(rMsg, callback, priority);
            // TODO: if OK, set iMsg.state = sending; else set iMsg.state = waiting

            return messenger.saveMessage(iMsg) && OK;
        }, 128);
    };

    //-------- namespace --------
    ns.CommonTransmitter = CommonTransmitter;

    ns.registers('CommonTransmitter');

})(SECHAT, DIMSDK);
