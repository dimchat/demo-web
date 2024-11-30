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

//! require <dimsdk.js>

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Log   = ns.lnc.Log;

    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;

    /**
     *  Login Command Processor
     */
    var LoginCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(LoginCommandProcessor, BaseCommandProcessor, null, {

        // private
        getDatabase: function () {
            var manager = this.getMessenger();
            var session = manager.getSession();
            return session.getDatabase();
        },

        // Override
        process: function (content, rMsg) {
            var sender = content.getIdentifier();
            // save login command to session db
            var db = this.getDatabase();
            if (db.saveLoginCommandMessage(sender, content, rMsg)) {
                Log.info('save login command for user', sender);
            } else {
                Log.error('failed to save login command', sender, content);
            }
            // no need to response login command
            return [];
        }
    });

    //-------- namespace --------
    ns.cpu.LoginCommandProcessor = LoginCommandProcessor;

})(DIMP);

(function (ns) {
    'use strict';

    var Interface            = ns.type.Interface;
    var Class                = ns.type.Class;
    var ReceiptCommand       = ns.protocol.ReceiptCommand;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;

    /**
     *  Receipt Command Processor
     */
    var ReceiptCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(ReceiptCommandProcessor, BaseCommandProcessor, null, null);

    // Override
    ReceiptCommandProcessor.prototype.process = function (content, rMsg) {
        // check & update respond time
        if (Interface.conforms(content, ReceiptCommand)) {
            var envelope = rMsg.getEnvelope();
            var groupManager = ns.group.SharedGroupManager;
            var delegate = groupManager.getGroupDelegate();
            delegate.updateRespondTime(content, envelope);
        }
        // no need to response receipt command
        return [];
    };

    //-------- namespace --------
    ns.cpu.ReceiptCommandProcessor = ReceiptCommandProcessor;

})(DIMP);
