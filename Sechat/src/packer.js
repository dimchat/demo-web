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

//!require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var Interface = sdk.type.Interface;
    var Class     = sdk.type.Class;
    var Log       = sdk.lnc.Log;

    var FileContent         = sdk.protocol.FileContent;
    var ClientMessagePacker = sdk.ClientMessagePacker;

    var SharedPacker = function (facebook, messenger) {
        ClientMessagePacker.call(this, facebook, messenger);
    };
    Class(SharedPacker, ClientMessagePacker, null, {

        // Override
        encryptMessage: function (iMsg) {
            var content = iMsg.getContent();
            if (Interface.conforms(content, FileContent)) {
                // TODO: call emitter to encrypt & upload file data before send out
            }

            // the intermediate node(s) can only get the message's signature,
            // but cannot know the 'sn' because it cannot decrypt the content,
            // this is usually not a problem;
            // but sometimes we want to respond a receipt with original sn,
            // so I suggest to expose 'sn' here.
            iMsg.setValue('sn', content.getSerialNumber());

            // check receiver & encrypt
            return ClientMessagePacker.prototype.encryptMessage.call(this, iMsg);
        },

        // Override
        suspendInstantMessage: function (iMsg, info) {
            Log.info('suspend instant message', iMsg, info);
            iMsg.setValue('error', info);
        },

        // Override
        suspendReliableMessage: function (rMsg, info) {
            Log.info('suspend reliable message', rMsg, info);
            rMsg.setValue('error', info);
        }
    });

    //-------- namespace --------
    ns.SharedPacker = SharedPacker;

})(SECHAT, DIMP);
