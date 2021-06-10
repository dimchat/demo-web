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

    var Messenger = sdk.Messenger;

    var CommonMessenger = function () {
        Messenger.call(this);
    };
    sdk.Class(CommonMessenger, Messenger, null);

    CommonMessenger.prototype.getEntityDelegate = function() {
        if (!this.__barrack) {
            this.__barrack = new ns.CommonFacebook();
        }
        return this.__barrack;
    };
    CommonMessenger.prototype.getCipherKeyDelegate = function () {
        if (!this.__keycache) {
            this.__keycache = new ns.KeyStore();
        }
        return this.__keycache;
    };
    CommonMessenger.prototype.getPacker = function () {
        if (!this.__packer) {
            this.__packer = new ns.CommonPacker();
        }
        return this.__packer;
    };
    CommonMessenger.prototype.getProcessor = function () {
        if (!this.__processor) {
            this.__processor = new ns.CommonProcessor();
        }
        return this.__processor;
    };
    CommonMessenger.prototype.getTransmitter = function () {
        if (!this.__transmitter) {
            this.__transmitter = new ns.CommonTransmitter();
        }
        return this.__transmitter;
    };

    CommonMessenger.prototype.serializeKey = function (password, iMsg) {
        var reused = password.getValue('reused');
        if (reused) {
            var receiver = iMsg.getReceiver();
            if (receiver.isGroup()) {
                // reuse key for grouped message
                return null;
            }
            // remove before serialize key
            password.setValue('reused', null);
        }
        var data = Messenger.prototype.serializeKey.call(this, password, iMsg);
        if (reused) {
            // put it back
            password.setValue('reused', reused);
        }
        return data;
    };

    CommonMessenger.prototype.deserializeContent = function (data, password, sMsg) {
        try {
            return Messenger.prototype.deserializeContent.call(this, data, password, sMsg);
        } catch (e) {
            console.error('deserialize content error', e);
            return null;
        }
    };

    //
    //  Interfaces for Sending Commands
    //
    CommonMessenger.prototype.queryMeta = function (identifier) {
        console.assert(false, 'implement me!');
        return false;
    };
    CommonMessenger.prototype.queryDocument = function (identifier, type) {
        console.assert(false, 'implement me!');
        return false;
    };
    CommonMessenger.prototype.queryGroupInfo = function (group, members) {
        console.assert(false, 'implement me!');
        return false;
    };

    //
    //  Events
    //
    CommonMessenger.prototype.onConnected = function () {
        console.log('connected');
    };

    //-------- namespace --------
    ns.CommonMessenger = CommonMessenger;

    ns.registers('CommonMessenger');

})(SECHAT, DIMSDK);

//! require 'protocol/search.js'
//! require 'protocol/report.js'
//! require 'cpu/receipt.js'
//! require 'cpu/mute.js'
//! require 'cpu/block.js'
//! require 'cpu/default.js'

(function (ns, sdk) {
    'use strict';

    var Command = sdk.protocol.Command;
    var MuteCommand = sdk.protocol.MuteCommand;
    var BlockCommand = sdk.protocol.BlockCommand;
    var CommandFactory = sdk.core.CommandFactory;
    var ContentProcessor = sdk.cpu.ContentProcessor;
    var CommandProcessor = sdk.cpu.CommandProcessor;

    var SearchCommand = ns.protocol.SearchCommand;
    var ReportCommand = ns.protocol.ReportCommand;
    var AnyContentProcessor = ns.cpu.AnyContentProcessor;
    var ReceiptCommandProcessor = ns.cpu.ReceiptCommandProcessor;
    var MuteCommandProcessor = ns.cpu.MuteCommandProcessor;
    var BlockCommandProcessor = ns.cpu.BlockCommandProcessor;

    var registerCommandFactories = function () {
        var search = new CommandFactory(SearchCommand);
        Command.register(SearchCommand.SEARCH, search);
        Command.register(SearchCommand.ONLINE_USERS, search);
        var report = new CommandFactory(ReportCommand);
        Command.register(ReportCommand.REPORT, report);
        Command.register(ReportCommand.ONLINE, report);
        Command.register(ReportCommand.OFFLINE, report);
    };

    var registerCommandProcessors = function () {
        CommandProcessor.register(Command.RECEIPT, new ReceiptCommandProcessor());
        CommandProcessor.register(MuteCommand.MUTE, new MuteCommandProcessor());
        CommandProcessor.register(BlockCommand.BLOCK, new BlockCommandProcessor());
    };

    var registerContentProcessors = function () {
        ContentProcessor.register(0, new AnyContentProcessor());
    };

    registerCommandFactories();
    registerCommandProcessors();
    registerContentProcessors();

})(SECHAT, DIMSDK);
