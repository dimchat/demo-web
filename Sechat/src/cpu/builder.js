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

//! require <dimsdk.js>

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Log       = ns.lnc.Log;
    var ID        = ns.protocol.ID;

    var TextContent   = ns.protocol.TextContent;
    var PageContent   = ns.protocol.PageContent;
    var FileContent   = ns.protocol.FileContent;
    var ImageContent  = ns.protocol.ImageContent;
    var AudioContent  = ns.protocol.AudioContent;
    var VideoContent  = ns.protocol.VideoContent;

    var LoginCommand  = ns.protocol.LoginCommand;
    var GroupCommand  = ns.protocol.GroupCommand;
    var InviteCommand = ns.protocol.group.InviteCommand;
    var ExpelCommand  = ns.protocol.group.ExpelCommand;
    var QuitCommand   = ns.protocol.group.QuitCommand;
    var ResetCommand  = ns.protocol.group.ResetCommand;
    var QueryCommand  = ns.protocol.group.QueryCommand;

    //
    //  Message Text Builder
    //
    var MessageBuilder = {

        //
        //  Message Content
        //
        getContentText: function (content) {
            var text = content.getString('text');
            if (text) {
                return text;
            } else if (Interface.conforms(content, TextContent)) {
                // Text
                return content.getText();
            }
            if (Interface.conforms(content, FileContent)) {
                // File: Image, Audio, Video
                if (Interface.conforms(content, ImageContent)) {
                    text = '[Image:' + content.getFilename() + ']';
                } else if (Interface.conforms(content, AudioContent)) {
                    text = '[Voice:' + content.getFilename() + ']';
                } else if (Interface.conforms(content, VideoContent)) {
                    text = '[Movie:' + content.getFilename() + ']';
                } else {
                    text = '[File:' + content.getFilename() + ']';
                }
            } else if (Interface.conforms(content, PageContent)) {
                // Web page
                text = '[URL:' + content.getURL() + ']';
            } else {
                text = 'Current version doesn\'t support this message type: ' + content.getType();
            }
            // store message text
            content.setValue('text', text);
            return text;
        },

        //
        //  Command
        //
        getCommandText: function (content, sender) {
            var text = content.getString('text');
            if (text) {
                return text;
            }
            if (Interface.conforms(content, LoginCommand)) {
                text = getLoginCommandText(content, sender);
            } else if (Interface.conforms(content, GroupCommand)) {
                text = getGroupCommandText(content, sender);
            //} else if (Interface.conforms(content, HistoryCommand)) {
                // TODO: process history command
            } else {
                text = 'Current version doesn\'t support this command: ' + content.getCmd();
            }
            // store message text
            content.setValue('text', text);
            return text;
        },

        getInstance: function () {
            return this;
        }
    };

    var getUsername = function (string) {
        var facebook = ns.GlobalVariable.getFacebook();
        return facebook.getName(ID.parse(string));
    };

    var getLoginCommandText = function (content, sender) {
        var identifier = content.getIdentifier();
        if (!sender.equals(identifier)) {
            Log.error('login command error', content, sender);
        }
        var station = content.getStation();
        if (station) {
            var host = station['host'];
            var port = station['port'];
            station = '(' + host + ':' + port + ') ' + getUsername(station['ID']);
        }
        return getUsername(identifier) + ' login: ' + station;
    };

    //
    //  Group Commands
    //
    var getGroupCommandText = function (content, sender) {
        if (Interface.conforms(content, InviteCommand)) {
            return getInviteCommandText(content, sender);
        }
        if (Interface.conforms(content, ExpelCommand)) {
            return getExpelCommandText(content, sender);
        }
        if (Interface.conforms(content, QuitCommand)) {
            return getQuitCommandText(content, sender);
        }
        if (Interface.conforms(content, ResetCommand)) {
            return getResetCommandText(content, sender);
        }
        if (Interface.conforms(content, QueryCommand)) {
            return getQueryCommandText(content, sender);
        }
        Log.error('unsupported group command', content);
        return 'unsupported group command: ' + content.getCmd();
    };
    var getInviteCommandText = function (content, sender) {
        var addedList = content.getValue('added');
        if (!addedList) {
            addedList = [];
        }
        var names = [];
        for (var i = 0; i < addedList.length; ++i) {
            names.push(getUsername(addedList[i]));
        }
        return getUsername(sender) + ' has invited members: ' + names.join(', ');
    };
    var getExpelCommandText = function (content, sender) {
        var removedList = content.getValue('removed');
        if (!removedList) {
            removedList = [];
        }
        var names = [];
        for (var i = 0; i < removedList.length; ++i) {
            names.push(getUsername(removedList[i]));
        }
        return getUsername(sender) + ' has removed members: ' + names.join(', ');
    };
    var getQuitCommandText = function (content, sender) {
        return getUsername(sender) + ' has quit group chat.';
    };
    var getResetCommandText = function (content, sender) {
        var text = getUsername(sender) + ' has updated members';
        var i, names;
        var removedList = content.getValue('removed');
        if (removedList && removedList.length > 0) {
            names = [];
            for (i = 0; i < removedList.length; ++i) {
                names.push(getUsername(removedList[i]));
            }
            text += ', removed: ' + names.join(', ');
        }
        var addedList = content.getValue('added');
        if (addedList && addedList.length > 0) {
            names = [];
            for (i = 0; i < addedList.length; ++i) {
                names.push(getUsername(addedList[i]));
            }
            text += ', added: ' + names.join(', ');
        }
        return text;
    };
    var getQueryCommandText = function (content, sender) {
        return getUsername(sender) + ' was querying group info, responding...';
    };

    //-------- namespace --------
    ns.cpu.MessageBuilder = MessageBuilder;

})(DIMP);
