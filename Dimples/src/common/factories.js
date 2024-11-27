;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
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
    var CommandParser = ns.CommandParser;

    var BaseHandshakeCommand = ns.dkd.cmd.BaseHandshakeCommand;
    var BaseLoginCommand     = ns.dkd.cmd.BaseLoginCommand;
    var BaseReportCommand    = ns.dkd.cmd.BaseReportCommand;

    var BaseMuteCommand      = ns.dkd.cmd.BaseMuteCommand;
    var BaseBlockCommand     = ns.dkd.cmd.BaseBlockCommand;
    var BaseSearchCommand    = ns.dkd.cmd.BaseSearchCommand;
    var BaseStorageCommand   = ns.dkd.cmd.BaseStorageCommand;

    var registerExtraCommandFactories = function () {

        // Handshake
        Command.setFactory(Command.HANDSHAKE, new CommandParser(BaseHandshakeCommand));
        // Login
        Command.setFactory(Command.LOGIN,     new CommandParser(BaseLoginCommand));
        // Report (online, offline)
        Command.setFactory(Command.REPORT,    new CommandParser(BaseReportCommand));
        Command.setFactory('broadcast',       new CommandParser(BaseReportCommand));
        Command.setFactory(Command.ONLINE,    new CommandParser(BaseReportCommand));
        Command.setFactory(Command.OFFLINE,   new CommandParser(BaseReportCommand));

        // Mute
        Command.setFactory(Command.MUTE,         new CommandParser(BaseMuteCommand));
        // Block
        Command.setFactory(Command.BLOCK,        new CommandParser(BaseBlockCommand));
        // Search (users)
        Command.setFactory(Command.SEARCH,       new CommandParser(BaseSearchCommand));
        Command.setFactory(Command.ONLINE_USERS, new CommandParser(BaseSearchCommand));
        // Storage (contacts, private_key)
        Command.setFactory(Command.STORAGE,      new CommandParser(BaseStorageCommand));
        Command.setFactory(Command.CONTACTS,     new CommandParser(BaseStorageCommand));
        Command.setFactory(Command.PRIVATE_KEY,  new CommandParser(BaseStorageCommand));
    };

    //
    //  Register core factories
    //
    ns.registerAllFactories();
    //
    //  Register extra command factories
    //
    registerExtraCommandFactories();
    //
    //  Register plugins
    //
    ns.registerPlugins();
    //
    //  Register compatibles
    //
    ns.registerEntityIDFactory();
    ns.registerCompatibleAddressFactory();
    ns.registerCompatibleMetaFactory();

})(DIMP);
