;
// license: https://mit-license.org
//
//  DIMP : Decentralized Instant Messaging Protocol
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

//! require <dimp.js>

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Command   = ns.protocol.Command;

    /**
     *  Command message: {
     *      type : 0x88,
     *      sn   : 123,
     *
     *      command : "report",
     *      title   : "online",      // or "offline"
     *      //---- extra info
     *      time    : 1234567890,    // timestamp
     *  }
     */
    var ReportCommand = Interface(null, [Command]);

    Command.REPORT = 'report';
    Command.ONLINE = 'online';
    Command.OFFLINE = 'offline';

    //-------- setter/getter --------

    ReportCommand.prototype.setTitle = function (title) {};
    ReportCommand.prototype.getTitle = function () {};

    //
    //  Factory
    //

    ReportCommand.fromTitle = function (title) {
        return new ns.dkd.cmd.BaseReportCommand(title);
    };

    //-------- namespace --------
    ns.protocol.ReportCommand = ReportCommand;

})(DIMP);

(function (ns) {
    'use strict';

    var Class         = ns.type.Class;
    var ReportCommand = ns.protocol.ReportCommand;
    var BaseCommand   = ns.dkd.cmd.BaseCommand;

    /**
     *  Create report command
     *
     *  Usages:
     *      1. new BaseReportCommand(map);
     *      2. new BaseReportCommand(title);
     *      3. new BaseReportCommand();
     */
    var BaseReportCommand = function () {
        if (arguments.length === 0) {
            // new BaseReportCommand();
            BaseCommand.call(this, ReportCommand.REPORT);
        } else if (typeof arguments[0] === 'string') {
            // new BaseReportCommand(title);
            BaseCommand.call(this, ReportCommand.REPORT);
            this.setTitle(arguments[0]);
        } else {
            // new BaseReportCommand(map);
            BaseCommand.call(this, arguments[0]);
        }
    };
    Class(BaseReportCommand, BaseCommand, [ReportCommand], {

        // Override
        setTitle: function (title) {
            this.setValue('title', title);
        },

        // Override
        getTitle: function () {
            return this.getString('title', null);
        }
    });

    //-------- namespace --------
    ns.dkd.cmd.BaseReportCommand = BaseReportCommand;

})(DIMP);
