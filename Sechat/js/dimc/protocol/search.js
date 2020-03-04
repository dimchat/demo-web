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

//! require <dimp.js>

!function (ns) {
    'use strict';

    var Command = ns.protocol.Command;

    var SearchCommand = function (info) {
        var keywords = null;
        if (!info) {
            // create empty search command
            info = SearchCommand.ONLINE_USERS;
        } else if (typeof info === 'string') {
            if (info !== SearchCommand.SEARCH &&
                info !== SearchCommand.ONLINE_USERS) {
                // create new command with keywords
                keywords = info;
                info = SearchCommand.SEARCH;
            }
        }
        // create search command
        Command.call(this, info);
        if (keywords) {
            this.setKeywords(keywords);
        }
    };
    ns.Class(SearchCommand, Command, null);

    SearchCommand.SEARCH = 'search';
    SearchCommand.ONLINE_USERS = 'users'; // search online users

    //-------- setter/getter --------

    SearchCommand.prototype.setKeywords = function (keywords) {
        this.setValue('keywords', keywords);
    };

    /**
     *  Get user ID list
     *
     * @returns {String[]} - ID string list
     */
    SearchCommand.prototype.getUsers = function () {
        return this.getValue('users');
    };

    /**
     *  Get user metas mapping to ID strings
     *
     * @returns {*} - meta dictionary
     */
    SearchCommand.prototype.getResults = function () {
        return this.getValue('results');
    };

    //-------- register --------
    Command.register(SearchCommand.SEARCH, SearchCommand);
    Command.register(SearchCommand.ONLINE_USERS, SearchCommand);

    //-------- namespace --------
    ns.protocol.SearchCommand = SearchCommand;

}(DIMP);
