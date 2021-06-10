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
    var Envelope = sdk.protocol.Envelope;
    var InstantMessage = sdk.protocol.InstantMessage;
    var HandshakeCommand = sdk.protocol.HandshakeCommand;
    var ReceiptCommand = sdk.protocol.ReceiptCommand;

    var CommonProcessor = ns.CommonProcessor;

    var MessageProcessor = function (messenger) {
        CommonProcessor.call(this, messenger);
    };
    sdk.Class(MessageProcessor, CommonProcessor, null);

    MessageProcessor.prototype.processContent = function (content, rMsg) {
        var res = CommonProcessor.prototype.processContent.call(this, content, rMsg);
        if (!res) {
            // respond nothing
            return null;
        }
        if (res instanceof HandshakeCommand) {
            // urgent command
            return res;
        }
        var sender = rMsg.getSender();
        if (res instanceof ReceiptCommand) {
            if (NetworkType.STATION.equals(sender.getType())) {
                // no need to respond receipt to station
                return null;
            }
            console.log('receipt to sender', sender);
        }
        // check receiver
        var receiver = rMsg.getReceiver();
        var user = this.getFacebook().selectLocalUser(receiver);
        // pack message
        var env = Envelope.create(user.identifier, sender, null);
        var iMsg = InstantMessage.create(env, res);
        // normal response
        this.getMessenger().sendInstantMessage(iMsg, null, 1);
        // DON'T respond to station directly
        return null;
    };

    //-------- namespace --------
    ns.MessageProcessor = MessageProcessor;

    ns.registers('MessageProcessor');

})(SECHAT, DIMSDK);

//! require 'cpu/handshake.js'
//! require 'cpu/login.js'
//! require 'cpu/search.js'
//! require 'cpu/storage.js'

(function (ns, sdk) {
    'use strict';

    var Command = sdk.protocol.Command;
    var StorageCommand = sdk.protocol.StorageCommand;
    var CommandProcessor = sdk.cpu.CommandProcessor;

    var SearchCommand = ns.protocol.SearchCommand;
    var HandshakeCommandProcessor = ns.cpu.HandshakeCommandProcessor;
    var LoginCommandProcessor = ns.cpu.LoginCommandProcessor;
    var SearchCommandProcessor = ns.cpu.SearchCommandProcessor;
    var StorageCommandProcessor = ns.cpu.StorageCommandProcessor;

    var registerCommandProcessors = function () {
        CommandProcessor.register(Command.HANDSHAKE, new HandshakeCommandProcessor());
        CommandProcessor.register(Command.LOGIN, new LoginCommandProcessor());
        // search (online)
        var search = new SearchCommandProcessor();
        CommandProcessor.register(SearchCommand.SEARCH, search);
        CommandProcessor.register(SearchCommand.ONLINE_USERS, search);
        // storage (contacts, private_key)
        var storage = new StorageCommandProcessor();
        CommandProcessor.register(StorageCommand.STORAGE, storage);
        CommandProcessor.register(StorageCommand.CONTACTS, storage);
        CommandProcessor.register(StorageCommand.PRIVATE_KEY, storage);
    };

    registerCommandProcessors();

})(SECHAT, DIMSDK);
