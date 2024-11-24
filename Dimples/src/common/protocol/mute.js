;
// license: https://mit-license.org
//
//  DIMP : Decentralized Instant Messaging Protocol
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

//! require <dimp.js>

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var ID        = ns.protocol.ID;
    var Command   = ns.protocol.Command;

    /**
     *  Command message: {
     *      type : 0x88,
     *      sn   : 123,
     *
     *      command : "mute",
     *      list    : []       // mute-list
     *  }
     */
    var MuteCommand = Interface(null, [Command]);

    Command.MUTE = 'mute';

    /**
     *  Set muted list
     *
     * @param {ID[]} list
     */
    MuteCommand.prototype.setMuteCList = function (list) {};
    MuteCommand.prototype.getMuteCList = function () {};

    //
    //  factory method
    //

    MuteCommand.fromList = function (contacts) {
        return new ns.dkd.cmd.BaseMuteCommand(contacts);
    };

    //-------- namespace --------
    ns.protocol.MuteCommand = MuteCommand;

})(DIMP);

(function (ns) {
    'use strict';

    var Class       = ns.type.Class;
    var ID          = ns.protocol.ID;
    var Command     = ns.protocol.Command;
    var MuteCommand = ns.protocol.MuteCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;

    /**
     *  Create mute command
     *
     *  Usages:
     *      1. new BaseMuteCommand(map);
     *      2. new BaseMuteCommand(list);
     *      3. new BaseMuteCommand();
     */
    var BaseMuteCommand = function (info) {
        var list = null;
        if (arguments.length === 0) {
            // new BaseMuteCommand();
            BaseCommand.call(this, Command.MUTE)
        } else if (arguments[0] instanceof Array) {
            // new BaseMuteCommand(list);
            BaseCommand.call(this, Command.MUTE)
            list = arguments[0]
        } else {
            // new BaseMuteCommand(map);
            BaseCommand.call(this, arguments[0]);
        }
        if (list) {
            this.setValue('list', ID.revert(list));
        }
        this.__list = list;
    };
    Class(BaseMuteCommand, BaseCommand, [MuteCommand], {

        // Override
        getMuteCList: function () {
            if (this.__list === null) {
                var list = this.getValue('list');
                if (list/* && list.length > 0*/) {
                    this.__list = ID.convert(list);
                } else {
                    this.__list = [];
                }
            }
            return this.__list;
        },

        // Override
        setMuteCList: function (list) {
            this.__list = list;
            if (list/* && list.length > 0*/) {
                list = ID.revert(list);
            }
            this.setValue('list', list);
        }
    });

    //-------- namespace --------
    ns.dkd.cmd.BaseMuteCommand = BaseMuteCommand;

})(DIMP);
