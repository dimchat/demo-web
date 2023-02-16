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

//!require 'protocol/*.js'

(function (ns) {
    'use strict';

    var Command = ns.protocol.Command;
    var CommandFactory = ns.CommandFactory;

    var HandshakeCommand = ns.dkd.cmd.HandshakeCommand;
    var ReceiptCommand = ns.dkd.cmd.ReceiptCommand;
    var LoginCommand = ns.dkd.cmd.LoginCommand;
    var ReportCommand = ns.dkd.cmd.ReportCommand;

    var MuteCommand = ns.dkd.cmd.MuteCommand;
    var BlockCommand = ns.dkd.cmd.BlockCommand;
    var SearchCommand = ns.dkd.cmd.SearchCommand;
    var StorageCommand = ns.dkd.cmd.StorageCommand;

    var registerAllFactories = ns.registerAllFactories;

    var registerExtraCommandFactories = function () {

        // Handshake
        Command.setFactory(Command.HANDSHAKE, new CommandFactory(HandshakeCommand));
        // Receipt
        Command.setFactory(Command.RECEIPT, new CommandFactory(ReceiptCommand));
        // Login
        Command.setFactory(Command.LOGIN, new CommandFactory(LoginCommand));
        // Report (online, offline)
        Command.setFactory(Command.REPORT, new CommandFactory(ReportCommand));
        Command.setFactory('broadcast', new CommandFactory(ReportCommand));
        Command.setFactory(Command.ONLINE, new CommandFactory(ReportCommand));
        Command.setFactory(Command.OFFLINE, new CommandFactory(ReportCommand));

        // Mute
        Command.setFactory(Command.MUTE, new CommandFactory(MuteCommand));
        // Block
        Command.setFactory(Command.BLOCK, new CommandFactory(BlockCommand));
        // Search (users)
        Command.setFactory(Command.SEARCH, new CommandFactory(SearchCommand));
        Command.setFactory(Command.ONLINE_USERS, new CommandFactory(SearchCommand));
        // Storage (contacts, private_key)
        Command.setFactory(Command.STORAGE, new CommandFactory(StorageCommand));
        Command.setFactory(Command.CONTACTS, new CommandFactory(StorageCommand));
        Command.setFactory(Command.PRIVATE_KEY, new CommandFactory(StorageCommand));
    };

    //
    //  Register core factories
    //
    registerAllFactories();
    //
    //  Register extra command factories
    //
    registerExtraCommandFactories();

})(DIMP);
