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
//! require 'content.js'
//! require 'command.js'

!function (ns) {
    'use strict';

    var ContentType = ns.protocol.ContentType;
    var TextContent = ns.protocol.TextContent;
    var FileContent = ns.protocol.FileContent;
    var ImageContent = ns.protocol.ImageContent;
    var AudioContent = ns.protocol.AudioContent;
    var VideoContent = ns.protocol.VideoContent;
    var PageContent = ns.protocol.PageContent;

    var ReceiptCommand = ns.protocol.ReceiptCommand;

    var ContentProcessor = ns.cpu.ContentProcessor;

    var NotificationCenter = ns.stargate.NotificationCenter;

    /**
     *  Default Content Processor
     */
    var DefaultContentProcessor = ns.cpu.DefaultContentProcessor;

    // Override
    var process = DefaultContentProcessor.prototype.process;
    DefaultContentProcessor.prototype.process = function (content, sender, msg) {
        var text;

        if (content instanceof FileContent) {
            if (content instanceof ImageContent) {
                // Image
                text = 'Image received';
            } else if (content instanceof AudioContent) {
                // Audio
                text = 'Voice message received';
            } else if (content instanceof VideoContent) {
                // Video
                text = 'Movie received';
            } else {
                // other file
                text = 'File received';
            }
        } else if (content instanceof TextContent) {
            // Text
            text = 'Text message received';
        } else if (content instanceof PageContent) {
            // Web page
            text = 'Web page received';
        } else {
            // Other
            return process.call(this, content, sender, msg);
        }

        var nc = NotificationCenter.getInstance();
        nc.postNotification(kNotificationMessageReceived, this, msg);

        // check group message
        var group = content.getGroup();
        if (group) {
            // DON'T response group message for disturb reason
            return null;
        }
        // response
        var res = new ReceiptCommand(content.sn);
        res.setMessage(text);
        res.setEnvelope(msg.envelope);
        return res;
    };

    //-------- register --------
    ContentProcessor.register(ContentType.UNKNOWN, DefaultContentProcessor);

    //-------- namespace --------
    ns.cpu.DefaultContentProcessor = DefaultContentProcessor;

// }(DIMP);
//
// !function (ns) {
//     'use strict';

    var GroupCommand = ns.protocol.GroupCommand;
    var InviteCommand = ns.protocol.group.InviteCommand;
    var ExpelCommand = ns.protocol.group.ExpelCommand;
    var QuitCommand = ns.protocol.group.QuitCommand;
    var ResetCommand = ns.protocol.group.ResetCommand;
    var QueryCommand = ns.protocol.group.QueryCommand;

    var getFacebook = function () {
        return ns.Facebook.getInstance();
    };

    var getUsername = function (string) {
        return getFacebook().getUsername(string);
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
            if (content instanceof FileContent) {
                if (content instanceof ImageContent) {
                    return '[Image:' + content.getFilename() + ']';
                }
                if (content instanceof AudioContent) {
                    return '[Voice:' + content.getFilename() + ']';
                }
                if (content instanceof VideoContent) {
                    return '[Movie:' + content.getFilename() + ']';
                }
                return '[File:' + content.getFilename() + ']';
            }
            // Text
            if (content instanceof TextContent) {
                return content.getText();
            }
            // Web page
            if (content instanceof PageContent) {
                return '[File:' + content.getURL() + ']';
            }
            var type = content.type.toLocaleString();
            return 'Current version doesn\'t support this message type: ' + type;
        },

        //
        //  Command
        //
        getCommandText: function (cmd, commander) {
            if (cmd instanceof GroupCommand) {
                return this.getGroupCommandText(cmd, commander);
            }
            // if (cmd instanceof HistoryCommand) {
            //     // TODO: process history command
            // }
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
            if (cmd instanceof InviteCommand) {
                return this.getInviteCommandText(cmd, commander);
            }
            if (cmd instanceof ExpelCommand) {
                return this.getExpelCommandText(cmd, commander);
            }
            if (cmd instanceof QuitCommand) {
                return this.getQuitCommandText(cmd, commander);
            }
            if (cmd instanceof ResetCommand) {
                return this.getResetCommandText(cmd, commander);
            }
            if (cmd instanceof QueryCommand) {
                return this.getQueryCommandText(cmd, commander);
            }
            throw Error('unsupported group command: ' + cmd);
        },
        getInviteCommandText: function (cmd, commander) {
            var addedList = cmd.getValue('added');
            if (!addedList || addedList.length === 0) {
                return null;
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
            if (!removedList || removedList.length === 0) {
                return null;
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

    //-------- namespace --------
    ns.cpu.MessageBuilder = MessageBuilder;

}(DIMP);
