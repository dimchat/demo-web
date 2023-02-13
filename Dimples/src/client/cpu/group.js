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

//! require 'history.js'

(function (ns) {
    'use strict';

    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor;

    /**
     *  Group Command Processor
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     *
     * @param {Facebook} facebook
     * @param {Messenger} messenger
     */
    var GroupCommandProcessor = function (facebook, messenger) {
        HistoryCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(GroupCommandProcessor, HistoryCommandProcessor, null, {
        // Override
        process: function (cmd, rMsg) {
            var text = 'Group command (name: ' + cmd.getCommand() + ') not support yet!';
            return this.respondText(text, cmd.getGroup());
        }
    });

    // protected
    GroupCommandProcessor.prototype.getMembers = function (cmd) {
        // get from 'members'
        var members = cmd.getMembers();
        if (members) {
            return members;
        }
        // get from 'member'
        var member = cmd.getMember();
        if (member) {
            return [member];
        } else {
            return [];
        }
    };

    //-------- namespace --------
    ns.cpu.GroupCommandProcessor = GroupCommandProcessor;

    ns.cpu.registers('GroupCommandProcessor');

})(DIMSDK);
