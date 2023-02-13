;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
//
//                               Written in 2021 by Moky <albert.moky@gmail.com>
//
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

//!require 'protocol/receipt.js'
//!require 'protocol/handshake.js'
//!require 'protocol/login.js'
//!require 'protocol/block.js'
//!require 'protocol/mute.js'
//!require 'protocol/storage.js'

(function (ns) {
    'use strict';

    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var Command = ns.protocol.Command;
    var MuteCommand = ns.protocol.MuteCommand;
    var BlockCommand = ns.protocol.BlockCommand;
    var StorageCommand = ns.protocol.StorageCommand;
    var ContentFactory = ns.core.ContentFactory;
    var CommandFactory = ns.core.CommandFactory;

    /**
     *  Register all content/command factories
     */
    var registerAllFactories = function () {
        //
        //  Register core factories
        //
        ns.core.registerContentFactories();
        ns.core.registerCommandFactories();

        //
        //  Register extended content factories
        //
        Content.setFactory(ContentType.CUSTOMIZED, new ContentFactory(ns.dkd.CustomizedContent));
        Content.setFactory(ContentType.APPLICATION, new ContentFactory(ns.dkd.CustomizedContent));

        //
        //  Register extended command factories
        //
        registerCommandFactories();
    };
    var registerCommandFactories = function () {

        // Receipt Command
        Command.setFactory(Command.RECEIPT, new CommandFactory(ns.dkd.BaseReceiptCommand));
        // Handshake Command
        Command.setFactory(Command.HANDSHAKE, new CommandFactory(ns.dkd.BaseHandshakeCommand));
        // Login Command
        Command.setFactory(Command.LOGIN, new CommandFactory(ns.dkd.BaseLoginCommand));

        // Mute Command
        Command.setFactory(MuteCommand.MUTE, new CommandFactory(ns.dkd.BaseMuteCommand));
        // Block Command
        Command.setFactory(BlockCommand.BLOCK, new CommandFactory(ns.dkd.BaseBlockCommand));

        // Storage Command
        var spu = new CommandFactory(ns.dkd.BaseStorageCommand);
        Command.setFactory(StorageCommand.STORAGE, spu);
        Command.setFactory(StorageCommand.CONTACTS, spu);
        Command.setFactory(StorageCommand.PRIVATE_KEY, spu);
    };

    //-------- namespace --------
    ns.registerAllFactories = registerAllFactories;

    ns.registers('registerAllFactories');

})(DIMSDK);
