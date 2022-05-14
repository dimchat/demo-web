;
// license: https://mit-license.org
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

//! require 'default.js'
//! require 'file.js'
//! require 'receipt.js'
//! require 'mute.js'
//! require 'block.js'

(function (ns, sdk) {
    'use strict';

    var ContentType = sdk.protocol.ContentType;
    var Command = sdk.protocol.Command;
    var MuteCommand = sdk.protocol.MuteCommand;
    var BlockCommand = sdk.protocol.BlockCommand;
    var ContentProcessorCreator = sdk.cpu.ContentProcessorCreator;
    var AnyContentProcessor = ns.cpu.AnyContentProcessor;
    var FileContentProcessor = ns.cpu.FileContentProcessor;
    var ReceiptCommandProcessor = ns.cpu.ReceiptCommandProcessor;
    var MuteCommandProcessor = ns.cpu.MuteCommandProcessor;
    var BlockCommandProcessor = ns.cpu.BlockCommandProcessor;

    var CommonProcessorCreator = function (facebook, messenger) {
        ContentProcessorCreator.call(this, facebook, messenger);
    };
    sdk.Class(CommonProcessorCreator, ContentProcessorCreator, null, {
        // Override
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            // file
            if (ContentType.FILE.equals(type) ||
                ContentType.IMAGE.equals(type) ||
                ContentType.AUDIO.equals(type) ||
                ContentType.VIDEO.equals(type)) {
                return new FileContentProcessor(facebook, messenger);
            }
            // others
            var cpu = ContentProcessorCreator.prototype.createContentProcessor.call(this, type);
            if (cpu) {
                return cpu;
            }
            // unknown
            return new AnyContentProcessor(facebook, messenger);
        },
        // Override
        createCommandProcessor: function (type, command) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            // receipt
            if (Command.RECEIPT === command) {
                return new ReceiptCommandProcessor(facebook, messenger);
            }
            // mute
            if (MuteCommand.MUTE === command) {
                return new MuteCommandProcessor(facebook, messenger);
            }
            // receipt
            if (BlockCommand.BLOCK === command) {
                return new BlockCommandProcessor(facebook, messenger);
            }
            // others
            return ContentProcessorCreator.prototype.createCommandProcessor.call(this, type, command);
        }
    });

    //-------- namespace --------
    ns.cpu.CommonProcessorCreator = CommonProcessorCreator;

    ns.cpu.registers('CommonProcessorCreator')

})(SECHAT, DIMSDK);
