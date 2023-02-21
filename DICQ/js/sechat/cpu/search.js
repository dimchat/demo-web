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

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var SearchCommand = ns.protocol.SearchCommand;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var NotificationCenter = ns.lnc.NotificationCenter;

    /**
     *  Search Command Processor
     */
    var SearchCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(SearchCommandProcessor, BaseCommandProcessor, null, {

    });

    // @Override
    SearchCommandProcessor.prototype.process = function (content, rMsg) {
        parse.call(this, content);

        var nc = NotificationCenter.getInstance();
        nc.postNotification('SearchUpdated', this, {
            'content': content,
            'envelope': rMsg.getEnvelope()
        });
        return null;
    };

    var parse = function (command) {
        var facebook = this.getFacebook();
        var users = command.getUsers();

        var online = command.getCmd() === SearchCommand.ONLINE_USERS;

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
                text = 'One user online now,\n' + user_info(users[0], facebook);
            } else {
                text = 'Got one user,\n' + user_info(users[0], facebook);
            }
        } else {
            if (online) {
                text = cnt + ' users online now,';
            } else {
                text = 'Got ' + cnt + ' users,';
            }
            for (var i = 0; i < cnt; ++i) {
                text += '\n' + user_info(users[i], facebook);
            }
        }

        var results = command.getResults();
        if (results) {
            var id, meta;
            var keys = Object.keys(results);
            for (var j = 0; j < keys.length; ++j) {
                id = ID.parse(keys[j]);
                if (!id) {
                    continue;
                }
                meta = results[id];
                meta = Meta.parse(meta);
                if (!meta) {
                    continue;
                }
                facebook.saveMeta(meta, id);
            }
        }

        command.setValue('text', text);
    };

    var user_info = function (string, facebook) {
        var identifier = ID.parse(string);
        if (!identifier) {
            return string;
        }
        var nickname = facebook.getName(identifier);
        return identifier + ' "' + nickname + '"';
    };

    //-------- namespace --------
    ns.cpu.SearchCommandProcessor = SearchCommandProcessor;

})(DIMP);
