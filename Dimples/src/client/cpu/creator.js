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

//! require 'handshake.js'
//! require 'login.js'
//! require 'search.js'
//! require 'storage.js'

(function (ns, sdk) {
    'use strict';

    var Command = sdk.protocol.Command;
    var StorageCommand = sdk.protocol.StorageCommand;
    var SearchCommand = sdk.protocol.SearchCommand;
    var HandshakeCommandProcessor = ns.cpu.HandshakeCommandProcessor;
    var LoginCommandProcessor = ns.cpu.LoginCommandProcessor;
    var StorageCommandProcessor = ns.cpu.StorageCommandProcessor;
    var SearchCommandProcessor = ns.cpu.SearchCommandProcessor;
    var CommonProcessorCreator = sdk.cpu.CommonProcessorCreator;

    var ClientProcessorCreator = function (facebook, messenger) {
        CommonProcessorCreator.call(this, facebook, messenger);
    };
    sdk.Class(ClientProcessorCreator, CommonProcessorCreator, null, {
        // Override
        createCommandProcessor: function (type, command) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            // handshake
            if (Command.HANDSHAKE === command) {
                return new HandshakeCommandProcessor(facebook, messenger);
            }
            // login
            if (Command.LOGIN === command) {
                return new LoginCommandProcessor(facebook, messenger);
            }
            // storage (contacts, private_key)
            if (StorageCommand.STORAGE === command ||
                StorageCommand.CONTACTS === command ||
                StorageCommand.PRIVATE_KEY === command) {
                return new StorageCommandProcessor(facebook, messenger);
            }
            // search
            if (SearchCommand.SEARCH === command ||
                SearchCommand.ONLINE_USERS === command) {
                return new SearchCommandProcessor(facebook, messenger);
            }
            // group commands
            if (command === 'group') {
                return new ns.cpu.GroupCommandProcessor(facebook, messenger);
            } else if (command === GroupCommand.INVITE) {
                return new ns.cpu.InviteCommandProcessor(facebook, messenger);
            } else if (command === GroupCommand.EXPEL) {
                return new ns.cpu.ExpelCommandProcessor(facebook, messenger);
            } else if (command === GroupCommand.QUIT) {
                return new ns.cpu.QuitCommandProcessor(facebook, messenger);
            } else if (command === GroupCommand.QUERY) {
                return new ns.cpu.QueryCommandProcessor(facebook, messenger);
            } else if (command === GroupCommand.RESET) {
                return new ns.cpu.ResetCommandProcessor(facebook, messenger);
            }
            // others
            return CommonProcessorCreator.prototype.createCommandProcessor.call(this, type, command);
        }
    });

    //-------- namespace --------
    ns.cpu.ClientProcessorCreator = ClientProcessorCreator;

    ns.cpu.registers('ClientProcessorCreator')

})(SECHAT, DIMSDK);
