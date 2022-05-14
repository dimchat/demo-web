;
// license: https://mit-license.org
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

    var Command = sdk.protocol.Command;

    /**
     *  Command message: {
     *      type : 0x88,
     *      sn   : 123,
     *
     *      command  : "search",        // or "users"
     *
     *      keywords : "keywords",      // keyword string
     *      users    : ["ID"],          // user ID list
     *      results  : {"ID": {meta}, } // user's meta map
     *  }
     */
    var SearchCommand = function () {};
    sdk.Interface(SearchCommand, [Command]);

    SearchCommand.SEARCH = 'search';
    SearchCommand.ONLINE_USERS = 'users'; // search online users

    SearchCommand.prototype.setKeywords = function (keywords) {
        console.assert(false, 'implement me!');
    };

    SearchCommand.prototype.getUsers = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Get user metas mapping to ID strings
     *
     * @returns {*} - meta dictionary
     */
    SearchCommand.prototype.getResults = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    //-------- namespace --------
    ns.protocol.SearchCommand = SearchCommand;

    ns.protocol.registers('SearchCommand');

})(SECHAT, DIMSDK);

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;
    var SearchCommand = sdk.protocol.SearchCommand;
    var BaseCommand = ns.dkd.BaseCommand;

    /**
     *  Create search command
     *
     *  Usages:
     *      1. new BaseSearchCommand();
     *      2. new BaseSearchCommand(keywords);
     *      3. new BaseSearchCommand(map);
     */
    var BaseSearchCommand = function () {
        if (arguments.length === 0) {
            // new BaseSearchCommand();
            BaseCommand.call(this, SearchCommand.ONLINE_USERS);
        } else if (typeof arguments[0] === 'string') {
            // new BaseSearchCommand(keywords);
            BaseCommand.call(this, SearchCommand.SEARCH);
            this.setKeywords(arguments[0]);
        } else {
            // new BaseSearchCommand(map);
            BaseCommand.call(this, arguments[0]);
        }
    };
    sdk.Class(BaseSearchCommand, BaseCommand, [SearchCommand], {

        // Override
        setKeywords: function (keywords) {
            this.setValue('keywords', keywords);
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
        if (keywords) {
            // new BaseSearchCommand(keywords);
            return new BaseSearchCommand(keywords);
        } else {
            // new BaseSearchCommand();
            return new BaseSearchCommand();
        }
    };

    //-------- namespace --------
    ns.dkd.BaseSearchCommand = BaseSearchCommand;

    ns.dkd.registers('BaseSearchCommand');

})(SECHAT, DIMSDK);
