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

/**
 *  Command message: {
 *      type : 0x88,
 *      sn   : 123,
 *
 *      command  : "report",
 *      title    : "online",      // or "offline"
 *      //---- extra info
 *      time     : 1234567890,    // timestamp?
 *  }
 */

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var Command = sdk.protocol.Command;

    /**
     *  Create report command
     *
     *  Usages:
     *      1. new ReportCommand();
     *      2. new ReportCommand(title);
     *      3. new ReportCommand(map);
     */
    var ReportCommand = function () {
        if (arguments.length === 0) {
            // new ReportCommand();
            Command.call(this, ReportCommand.REPORT);
        } else if (typeof arguments[0] === 'string') {
            // new SearchCommand(keywords);
            Command.call(this, ReportCommand.REPORT);
            this.setTitle(arguments[0]);
        } else {
            // new SearchCommand(map);
            Command.call(this, arguments[0]);
        }
    };
    sdk.Class(ReportCommand, Command, null);

    ReportCommand.REPORT = 'report';
    ReportCommand.ONLINE = 'online';
    ReportCommand.OFFLINE = 'offline';

    //-------- setter/getter --------

    ReportCommand.prototype.setTitle = function (title) {
        this.setValue('title', title);
    };
    ReportCommand.prototype.getTitle = function () {
        return this.getValue('title');
    };

    //-------- namespace --------
    ns.protocol.ReportCommand = ReportCommand;

    ns.protocol.registers('ReportCommand');

})(SECHAT, DIMSDK);
