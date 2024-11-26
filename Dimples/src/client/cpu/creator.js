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

//! require 'commands.js'
//! require 'handshake.js'
//! require 'group.js'
//! require 'group/*.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;

    var ContentType  = ns.protocol.ContentType;
    var Command      = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;

    var BaseContentProcessor      = ns.cpu.BaseContentProcessor;
    var ContentProcessorCreator   = ns.cpu.ContentProcessorCreator;
    var ReceiptCommandProcessor   = ns.cpu.ReceiptCommandProcessor;
    var HandshakeCommandProcessor = ns.cpu.HandshakeCommandProcessor;
    var LoginCommandProcessor     = ns.cpu.LoginCommandProcessor;
    var HistoryCommandProcessor   = ns.cpu.HistoryCommandProcessor

    var ClientContentProcessorCreator = function (facebook, messenger) {
        ContentProcessorCreator.call(this, facebook, messenger);
    };
    Class(ClientContentProcessorCreator, ContentProcessorCreator, null, {

        // Override
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            // history command
            if (ContentType.HISTORY.equals(type)) {
                return new HistoryCommandProcessor(facebook, messenger);
            }
            // default
            if (type === 0) {
                // unknown type?
                return new BaseContentProcessor(facebook, messenger);
            }
            // others
            return ContentProcessorCreator.prototype.createContentProcessor.call(this, type);
        },

        // Override
        createCommandProcessor: function (type, cmd) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            switch (cmd) {
                // handshake
                case Command.HANDSHAKE:
                    return new HandshakeCommandProcessor(facebook, messenger);
                // login
                case Command.LOGIN:
                    return new LoginCommandProcessor(facebook, messenger);
                // receipt
                case Command.RECEIPT:
                    return new ReceiptCommandProcessor(facebook, messenger);

                // group commands
                case 'group':
                    return new ns.cpu.GroupCommandProcessor(facebook, messenger);
                case GroupCommand.INVITE:
                    return new ns.cpu.InviteCommandProcessor(facebook, messenger);
                case GroupCommand.EXPEL:
                    /// Deprecated (use 'reset' instead)
                    return new ns.cpu.ExpelCommandProcessor(facebook, messenger);
                case GroupCommand.QUIT:
                    return new ns.cpu.QuitCommandProcessor(facebook, messenger);
                case GroupCommand.QUERY:
                    return new ns.cpu.QueryCommandProcessor(facebook, messenger);
                case GroupCommand.RESET:
                    return new ns.cpu.ResetCommandProcessor(facebook, messenger);
            }

            // others
            return ContentProcessorCreator.prototype.createCommandProcessor.call(this, type, cmd);
        }
    });

    //-------- namespace --------
    ns.cpu.ClientContentProcessorCreator = ClientContentProcessorCreator;

})(DIMP);
