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

!function (ns) {
    'use strict';

    var Meta = ns.Meta;
    var SearchCommand = ns.protocol.SearchCommand;

    var CommandProcessor = ns.cpu.CommandProcessor;

    var Facebook = ns.Facebook;
    var NotificationCenter = ns.stargate.NotificationCenter;

    /**
     *  Search Command Processor
     */
    var SearchCommandProcessor = function (messenger) {
        CommandProcessor.call(this, messenger);
    };
    ns.Class(SearchCommandProcessor, CommandProcessor, null);

    var user_info = function (string) {
        var facebook = Facebook.getInstance();
        var identifier = facebook.getIdentifier(string);
        if (!identifier) {
            return string;
        }
        var nickname = facebook.getNickname(identifier);
        var number = facebook.getNumberString(identifier);
        return identifier + ' (' + number + ') "' + nickname + '"';
    };

    //
    //  Main
    //
    SearchCommandProcessor.prototype.process = function (cmd, sender, msg) {
        var users = cmd.getUsers();

        var online = cmd.getCommand() === SearchCommand.ONLINE_USERS;

        var cnt = users ? users.length : 0;
        var text;
        if (cnt === 0) {
            if (online) {
                text = 'No user online now.';
            } else {
                text = 'User not found.';
            }
        } else if (cnt === 1) {
            if (online) {
                text = 'One user online now,\n' + user_info(users[0]);
            } else {
                text = 'Got one user,\n' + user_info(users[0]);
            }
        } else {
            if (online) {
                text = cnt + ' users online now,';
            } else {
                text = 'Got ' + cnt + ' users,';
            }
            for (var i = 0; i < cnt; ++i) {
                text += '\n' + user_info(users[i]);
            }
        }

        var results = cmd.getResults();
        if (results) {
            var facebook = Facebook.getInstance();
            var id, meta;
            var keys = Object.keys(results);
            for (var j = 0; j < keys.length; ++j) {
                id = keys[j];
                meta = results[id];
                id = facebook.getIdentifier(id);
                if (!id) {
                    continue;
                }
                meta = Meta.getInstance(meta);
                if (!meta) {
                    continue;
                }
                facebook.saveMeta(meta, id);
            }
        }

        cmd.setValue('text', text);

        var nc = NotificationCenter.getInstance();
        nc.postNotification(nc.kNotificationMessageReceived, this, msg);
        return null;
    };

    //-------- register --------
    CommandProcessor.register(SearchCommand.SEARCH, SearchCommandProcessor);
    CommandProcessor.register(SearchCommand.ONLINE_USERS, SearchCommandProcessor);

    //-------- namespace --------
    ns.cpu.SearchCommandProcessor = SearchCommandProcessor;

}(DIMP);
