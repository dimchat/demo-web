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

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var Interface = ns.typ0e.Interface;
    var Command = sdk.protocol.Command;

    /**
     *  Command message: {
     *      type : 0x88,
     *      sn   : 123,
     *
     *      cmd      : "search",        // or "users"
     *      keywords : "keywords",      // keyword string
     *
     *      start    : 0,
     *      limit    : 20,
     *
     *      station  : "STATION_ID",    // station ID
     *      users    : ["ID"],          // user ID list
     *      results  : {"ID": {meta}, } // user's meta map
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
    SearchCommand.prototype.setKeywords = function (keywords) {
        throw new Error('NotImplemented');
    };
    SearchCommand.prototype.getKeywords = function () {
        throw new Error('NotImplemented');
    };

    SearchCommand.prototype.setRange = function (start, limit) {
        throw new Error('NotImplemented');
    };
    SearchCommand.prototype.getRange = function () {
        throw new Error('NotImplemented');
    };

    /**
     *  Get user ID list
     *
     * @return {ID[]}
     */
    SearchCommand.prototype.getUsers = function () {
        throw new Error('NotImplemented');
    };

    /**
     *  Get user metas mapping to IDs
     *
     * @returns {{}} meta dictionary
     */
    SearchCommand.prototype.getResults = function () {
        throw new Error('NotImplemented');
    };

    //-------- namespace --------
    ns.protocol.SearchCommand = SearchCommand;

})(DIMP);

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var SearchCommand = ns.protocol.SearchCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;

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
            this.setValue('keywords', keywords);
        }
    };
    Class(BaseSearchCommand, BaseCommand, [SearchCommand], {

        // Override
        setKeywords: function (keywords) {
            this.setValue('keywords', keywords);
        },
        // Override
        getKeywords: function () {
            return this.getValue('keywords');
        },

        // Override
        setRange: function (start, limit) {
            this.setValue('start', start);
            this.setValue('limit', limit);
        },
        // Override
        getRange: function () {
            var start = this.getNumber('start');
            var limit = this.getNumber('limit');
            return [start, limit];
        },

        // Override
        getUsers: function () {
            var users = this.getValue('users');
            if (users) {
                return ID.convert(users);
            } else {
                return null;
            }
        },

        // Override
        getResults: function () {
            return this.getValue('results');
        }
    });

    //
    //  Factory
    //
    SearchCommand.search = function (keywords) {
        if (keywords instanceof Array) {
            keywords = keywords.join(' ');
        } else if (typeof keywords !== 'string') {
            throw new TypeError('keywords error: ' + keywords);
        }
        // new BaseSearchCommand(keywords);
        return new BaseSearchCommand(keywords);
    };

    //-------- namespace --------
    ns.dkd.cmd.SearchCommand = BaseSearchCommand;

})(DIMP);
