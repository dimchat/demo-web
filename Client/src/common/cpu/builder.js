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

    var ID = sdk.protocol.ID;
    var FileContent = sdk.protocol.FileContent;
    var ImageContent = sdk.protocol.ImageContent;
    var AudioContent = sdk.protocol.AudioContent;
    var VideoContent = sdk.protocol.VideoContent;
    var TextContent = sdk.protocol.TextContent;
    var PageContent = sdk.protocol.PageContent;

    var LoginCommand = sdk.protocol.LoginCommand;

    var GroupCommand = sdk.protocol.GroupCommand;
    var InviteCommand = sdk.protocol.group.InviteCommand;
    var ExpelCommand = sdk.protocol.group.ExpelCommand;
    var QuitCommand = sdk.protocol.group.QuitCommand;
    var ResetCommand = sdk.protocol.group.ResetCommand;
    var QueryCommand = sdk.protocol.group.QueryCommand;

    var getUsername = function (string) {
        var facebook = ns.ClientFacebook.getInstance();
        return facebook.getName(ID.parse(string));
    };

    //
    //  Message Text Builder
    //
    var MessageBuilder = {

        //
        //  Message Content
        //
        getContentText: function (content) {
            // File: Image, Audio, Video
            if (sdk.Interface.conforms(content, FileContent)) {
                if (sdk.Interface.conforms(content, ImageContent)) {
                    return '[Image:' + content.getFilename() + ']';
                }
                if (sdk.Interface.conforms(content, AudioContent)) {
                    return '[Voice:' + content.getFilename() + ']';
                }
                if (sdk.Interface.conforms(content, VideoContent)) {
                    return '[Movie:' + content.getFilename() + ']';
                }
                return '[File:' + content.getFilename() + ']';
            }
            // Text
            if (sdk.Interface.conforms(content, TextContent)) {
                return content.getText();
            }
            // Web page
            if (sdk.Interface.conforms(content, PageContent)) {
                return '[File:' + content.getURL() + ']';
            }
            var type = content.getType();
            return 'Current version doesn\'t support this message type: ' + type;
        },

        //
        //  Command
        //
        getCommandText: function (cmd, commander) {
            if (sdk.Interface.conforms(cmd, GroupCommand)) {
                return this.getGroupCommandText(cmd, commander);
            }
            // if (sdk.Interface.conforms(cmd, HistoryCommand)) {
            //     // TODO: process history command
            // }

            if (sdk.Interface.conforms(cmd, LoginCommand)) {
                return this.getLoginCommandText(cmd, commander);
            }
            return 'Current version doesn\'t support this command: ' + cmd.getCommand();
        },

        //
        //  Group Commands
        //
        getGroupCommandText: function (cmd, commander) {
            var text = cmd.getValue('text');
            if (text) {
                // already processed
                return text;
            }
            if (sdk.Interface.conforms(cmd, InviteCommand)) {
                return this.getInviteCommandText(cmd, commander);
            }
            if (sdk.Interface.conforms(cmd, ExpelCommand)) {
                return this.getExpelCommandText(cmd, commander);
            }
            if (sdk.Interface.conforms(cmd, QuitCommand)) {
                return this.getQuitCommandText(cmd, commander);
            }
            if (sdk.Interface.conforms(cmd, ResetCommand)) {
                return this.getResetCommandText(cmd, commander);
            }
            if (sdk.Interface.conforms(cmd, QueryCommand)) {
                return this.getQueryCommandText(cmd, commander);
            }
            throw new Error('unsupported group command: ' + cmd);
        },
        getInviteCommandText: function (cmd, commander) {
            var addedList = cmd.getValue('added');
            if (!addedList) {
                addedList = [];
            }
            var names = [];
            for (var i = 0; i < addedList.length; ++i) {
                names.push(getUsername(addedList[i]));
            }
            var text = getUsername(commander)
                + ' has invited members: ' + names.join(', ');
            cmd.setValue('text', text);
            return text;
        },
        getExpelCommandText: function (cmd, commander) {
            var removedList = cmd.getValue('removed');
            if (!removedList) {
                removedList = [];
            }
            var names = [];
            for (var i = 0; i < removedList.length; ++i) {
                names.push(getUsername(removedList[i]));
            }
            var text = getUsername(commander)
                + ' has removed members: ' + names.join(', ');
            cmd.setValue('text', text);
            return text;
        },
        getQuitCommandText: function (cmd, commander) {
            var text = getUsername(commander)
                + ' has quit group chat.';
            cmd.setValue('text', text);
            return text;
        },
        getResetCommandText: function (cmd, commander) {
            var text = getUsername(commander)
                + ' has updated members';
            var i, names;
            var removedList = cmd.getValue('removed');
            if (removedList && removedList.length > 0) {
                names = [];
                for (i = 0; i < removedList.length; ++i) {
                    names.push(getUsername(removedList[i]));
                }
                text += ', removed: ' + names.join(', ');
            }
            var addedList = cmd.getValue('added');
            if (addedList && addedList.length > 0) {
                names = [];
                for (i = 0; i < addedList.length; ++i) {
                    names.push(getUsername(addedList[i]));
                }
                text += ', added: ' + names.join(', ');
            }
            cmd.setValue('text', text);
            return text;
        },
        getQueryCommandText: function (cmd, commander) {
            var text = getUsername(commander)
                + ' was querying group info, responding...';
            cmd.setValue('text', text);
            return text;
        }
    };

    // noinspection JSUnusedLocalSymbols
    MessageBuilder.getLoginCommandText = function (cmd, commander) {
        var identifier = cmd.getIdentifier();
        var station = cmd.getStation();
        if (station) {
            var host = station['host'];
            var port = station['port'];
            station = '(' + host + ':' + port + ') ' + getUsername(station['ID']);
        }
        var text = getUsername(identifier) + ' login: ' + station;
        cmd.setValue('text', text);
        return text;
    };

    //-------- namespace --------
    ns.cpu.MessageBuilder = MessageBuilder;

    ns.cpu.registers('MessageBuilder');

})(SECHAT, DIMSDK);
