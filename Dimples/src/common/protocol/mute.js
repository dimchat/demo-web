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

//! require <dimp.js>

(function (ns) {
    'use strict';

    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;

    /**
     *  Command message: {
     *      type : 0x88,
     *      sn   : 123,
     *
     *      command : "mute",
     *      list    : []      // mute-list
     *  }
     */
    var MuteCommand = function (info) {};
    ns.Interface(MuteCommand, [Command]);

    // Command.MUTE = 'mute';
    MuteCommand.MUTE = 'mute';

    /**
     *  Set muted list
     *
     * @param {ID[]} list
     */
    MuteCommand.prototype.setMuteCList = function (list) {
        ns.assert(false, 'implement me!');
    };
    MuteCommand.prototype.getMuteCList = function () {
        ns.assert(false, 'implement me!');
        return null;
    };
    MuteCommand.setMuteList = function (list, cmd) {
        if (list/* && list.length > 0*/) {
            cmd['list'] = ID.revert(list);
        } else {
            delete cmd['list'];
        }
    };
    MuteCommand.getMuteList = function (cmd) {
        var list = cmd['list'];
        if (list/* && list.length > 0*/) {
            return ID.convert(list);
        } else {
            return list;
        }
    };

    //-------- namespace --------
    ns.protocol.MuteCommand = MuteCommand;

    ns.protocol.registers('MuteCommand');

})(DIMSDK);

(function (ns) {
    'use strict';

    var MuteCommand = ns.protocol.MuteCommand;
    var BaseCommand = ns.dkd.BaseCommand;

    /**
     *  Create mute command
     *
     *  Usages:
     *      1. new BaseMuteCommand();
     *      2. new BaseMuteCommand(list);
     *      3. new BaseMuteCommand(map);
     */
    var BaseMuteCommand = function (info) {
        if (arguments.length === 0) {
            // new BaseMuteCommand();
            BaseCommand.call(this, MuteCommand.MUTE)
            this.__list = null;
        } else if (arguments[0] instanceof Array) {
            // new BaseMuteCommand(list);
            BaseCommand.call(this, MuteCommand.MUTE)
            this.setBlockCList(arguments[0]);
        } else {
            // new BaseMuteCommand(map);
            BaseCommand.call(this, arguments[0]);
            this.__list = null;
        }
    };
    ns.Class(BaseMuteCommand, BaseCommand, [MuteCommand], {

        // Override
        getMuteCList: function () {
            if (!this.__list) {
                var dict = this.toMap();
                this.__list = MuteCommand.getMuteList(dict);
            }
            return this.__list;
        },

        // Override
        setMuteCList: function (list) {
            var dict = this.toMap();
            MuteCommand.setMuteList(list, dict);
            this.__list = list;
        }
    });

    //-------- namespace --------
    ns.dkd.BaseMuteCommand = BaseMuteCommand;

    ns.dkd.registers('BaseMuteCommand');

})(DIMSDK);
