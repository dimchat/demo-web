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
    var Command   = ns.protocol.Command;

    /**
     *  Command message: {
     *      type : 0x88,
     *      sn   : 123,
     *
     *      command  : "search",        // or "users"
     *      keywords : "keywords",      // keyword string
     *
     *      start    : 0,
     *      limit    : 50,
     *
     *      station  : "STATION_ID",    // station ID
     *      users    : ["{ID}"]         // user ID list
     *  }
     */
    var SearchCommand = Interface(null, [Command]);

    Command.SEARCH = 'search';
    Command.ONLINE_USERS = 'users'; // search online users

    /**
     *  Set keywords
     *
     * @param {string} keywords
     */
    SearchCommand.prototype.setKeywords = function (keywords) {};
    SearchCommand.prototype.getKeywords = function () {};

    SearchCommand.prototype.setRange = function (start, limit) {};
    SearchCommand.prototype.getRange = function () {};

    SearchCommand.prototype.setStation = function (sid) {};
    SearchCommand.prototype.getStation = function () {};

    /**
     *  Get user ID list
     *
     * @return {ID[]}
     */
    SearchCommand.prototype.getUsers = function () {
        throw new Error('NotImplemented');
    };

    //
    //  Factory
    //

    SearchCommand.fromKeywords = function (keywords) {
        return new ns.dkd.cmd.BaseSearchCommand(keywords);
    };

    //-------- namespace --------
    ns.protocol.SearchCommand = SearchCommand;

})(DIMP);

(function (ns) {
    'use strict';

    var Class         = ns.type.Class;
    var ID            = ns.protocol.ID;
    var Command       = ns.protocol.Command;
    var SearchCommand = ns.protocol.SearchCommand;
    var BaseCommand   = ns.dkd.cmd.BaseCommand;

    /**
     *  Create search command
     *
     *  Usages:
     *      1. new BaseSearchCommand(map);
     *      2. new BaseSearchCommand(keywords);
     *      3. new BaseSearchCommand();
     */
    var BaseSearchCommand = function () {
        var keywords = null;
        if (arguments.length === 0) {
            // new BaseSearchCommand();
            BaseCommand.call(this, Command.ONLINE_USERS);
        } else if (typeof arguments[0] === 'string') {
            // new BaseSearchCommand(keywords);
            BaseCommand.call(this, Command.SEARCH);
            keywords = arguments[0];
        } else {
            // new BaseSearchCommand(map);
            BaseCommand.call(this, arguments[0]);
        }
        if (keywords) {
            this.setKeywords(keywords);
        }
    };
    Class(BaseSearchCommand, BaseCommand, [SearchCommand], {

        // Override
        setKeywords: function (keywords) {
            if (keywords instanceof Array) {
                keywords = keywords.join(' ');
            } else if (typeof keywords !== 'string') {
                throw new TypeError('keywords error: ' + keywords);
            }
            this.setValue('keywords', keywords);
        },
        // Override
        getKeywords: function () {
            var words = this.getValue('keywords', null);
            if (!words && this.getCmd() === Command.ONLINE_USERS) {
                words = Command.ONLINE_USERS;
            }
            return words;
        },

        // Override
        setRange: function (start, limit) {
            this.setValue('start', start);
            this.setValue('limit', limit);
        },
        // Override
        getRange: function () {
            var start = this.getInt('start', 0);
            var limit = this.getInt('limit', 50);
            return [start, limit];
        },

        // Override
        setStation: function (sid) {
            return this.setString('station', sid);
        },

        // Override
        getStation: function () {
            return ID.parse(this.getValue('results'));
        },

        // Override
        getUsers: function () {
            var users = this.getValue('users');
            if (users) {
                return ID.convert(users);
            } else {
                return null;
            }
        }
    });

    //-------- namespace --------
    ns.dkd.cmd.BaseSearchCommand = BaseSearchCommand;

})(DIMP);
