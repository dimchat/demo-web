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

    var Interface = sdk.type.Interface;
    var Class = sdk.type.Class;
    var FileContent = sdk.protocol.FileContent;
    var ClientMessagePacker = sdk.ClientMessagePacker;
    var Compatible = ns.Compatible;

    var SharedPacker = function (facebook, messenger) {
        ClientMessagePacker.call(this, facebook, messenger);
    };
    Class(SharedPacker, ClientMessagePacker, null, {

        // Override
        serializeMessage: function (rMsg) {
            Compatible.fixMetaAttachment(rMsg);
            return ClientMessagePacker.prototype.serializeMessage.call(this, rMsg);
        },

        // Override
        deserializeMessage: function (data) {
            if (!data || data.length < 2) {
                return null;
            }
            var rMsg = ClientMessagePacker.prototype.deserializeMessage.call(this, data);
            if (rMsg) {
                Compatible.fixMetaAttachment(rMsg);
            }
            return rMsg;
        },

        // Override
        encryptMessage: function (iMsg) {
            var content = iMsg.getContent();
            if (Interface.conforms(content, FileContent)) {
                // TODO: call emitter to encrypt & upload file data before send out
            }
            return ClientMessagePacker.prototype.encryptMessage.call(this, iMsg);
        },

        // Override
        decryptMessage: function (sMsg) {
            var iMsg = ClientMessagePacker.prototype.decryptMessage.call(this, sMsg);
            if (iMsg) {
                var content = iMsg.getContent();
                if (Interface.conforms(content, FileContent)) {
                    // TODO: keep password to decrypt data after downloaded
                }
            }
            return iMsg;
        }
    });

    //-------- namespace --------
    ns.SharedPacker = SharedPacker;

})(SECHAT, DIMP);
