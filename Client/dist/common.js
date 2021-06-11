;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

//! require <sdk.js>

if (typeof SECHAT !== 'object') {
    SECHAT = new DIMSDK.Namespace();
}

(function (ns, sdk) {
    'use strict';

    //-------- namespace --------
    if (typeof ns.cpu !== 'object') {
        ns.cpu = new sdk.Namespace();
    }
    if (typeof ns.db !== 'object') {
        ns.db = new sdk.Namespace();
    }
    if (typeof ns.network !== 'object') {
        ns.network = new sdk.Namespace();
    }
    if (typeof ns.protocol !== 'object') {
        ns.protocol = new sdk.Namespace();
    }

    ns.registers('cpu');
    ns.registers('db');
    ns.registers('network');
    ns.registers('protocol');

})(SECHAT, DIMSDK);
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

    var CommandProcessor = sdk.cpu.CommandProcessor;

    /**
     *  Block Command Processor
     */
    var BlockCommandProcessor = function () {
        CommandProcessor.call(this);
    };
    sdk.Class(BlockCommandProcessor, CommandProcessor, null);

    // Override
    BlockCommandProcessor.prototype.execute = function (cmd, rMsg) {
        // no need to response block command
        return null;
    };

    //-------- namespace --------
    ns.cpu.BlockCommandProcessor = BlockCommandProcessor;

    ns.cpu.registers('BlockCommandProcessor')

})(SECHAT, DIMSDK);
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
        var facebook = ns.Facebook.getInstance();
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
            var type = content.getType();
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

            if (cmd instanceof LoginCommand) {
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

    var ReceiptCommand = sdk.protocol.ReceiptCommand;
    var FileContent = sdk.protocol.FileContent;
    var ImageContent = sdk.protocol.ImageContent;
    var AudioContent = sdk.protocol.AudioContent;
    var VideoContent = sdk.protocol.VideoContent;
    var TextContent = sdk.protocol.TextContent;
    var PageContent = sdk.protocol.PageContent;

    var ContentProcessor = sdk.cpu.ContentProcessor;

    /**
     *  Default Content Processor
     */
    var AnyContentProcessor = function () {
        ContentProcessor.call(this);
    };
    sdk.Class(AnyContentProcessor, ContentProcessor, null);

    // Override
    AnyContentProcessor.prototype.process = function (content, rMsg) {
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
            return ContentProcessor.prototype.process.call(this, content, rMsg);
        }

        // check group message
        var group = content.getGroup();
        if (group) {
            // DON'T response group message for disturb reason
            return null;
        }
        // response
        var res = new ReceiptCommand(text);
        res.setSerialNumber(content.getSerialNumber());
        res.setEnvelope(rMsg.getEnvelope());
        res.setSignature(rMsg.getValue('signature'));
        return res;
    };

    //-------- namespace --------
    ns.cpu.AnyContentProcessor = AnyContentProcessor;

    ns.cpu.registers('AnyContentProcessor')

})(SECHAT, DIMSDK);
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

    var CommandProcessor = sdk.cpu.CommandProcessor;

    /**
     *  Mute Command Processor
     */
    var MuteCommandProcessor = function () {
        CommandProcessor.call(this);
    };
    sdk.Class(MuteCommandProcessor, CommandProcessor, null);

    // Override
    MuteCommandProcessor.prototype.execute = function (cmd, rMsg) {
        // no need to response mute command
        return null;
    };

    //-------- namespace --------
    ns.cpu.MuteCommandProcessor = MuteCommandProcessor;

    ns.cpu.registers('MuteCommandProcessor')

})(SECHAT, DIMSDK);
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

    var CommandProcessor = sdk.cpu.CommandProcessor;

    /**
     *  Receipt Command Processor
     */
    var ReceiptCommandProcessor = function () {
        CommandProcessor.call(this);
    };
    sdk.Class(ReceiptCommandProcessor, CommandProcessor, null);

    // Override
    ReceiptCommandProcessor.prototype.execute = function (cmd, rMsg) {
        // no need to response receipt command
        return null;
    };

    //-------- namespace --------
    ns.cpu.ReceiptCommandProcessor = ReceiptCommandProcessor;

    ns.cpu.registers('ReceiptCommandProcessor')

})(SECHAT, DIMSDK);
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

    ns.db.AddressNameTable = {

        /**
         *  Get ID by short name
         *
         * @param {String} alias - short name
         * @return {ID} user ID
         */
        getIdentifier: function (alias) {
            console.assert(false, 'implement me!');
            return null;
        },

        /**
         *  Save ANS record
         *
         * @param {ID} identifier - user ID
         * @param {String} alias  - short name
         * @return {boolean} true on success
         */
        addRecord: function (identifier, alias) {
            console.assert(false, 'implement me!');
            return false;
        },

        /**
         *  Remove ANS record
         *
         * @param {String} alias - short name
         * @return {boolean} true on success
         */
        removeRecord: function (alias) {
            console.assert(false, 'implement me!');
            return false;
        }
    };

})(SECHAT, DIMSDK);
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

    var Storage = sdk.dos.LocalStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;

    ns.db.ContactTable = {

        getContacts: function (user) {
            this.load();
            var contacts = this.__contacts[user.toString()];
            if (contacts) {
                return ID.convert(contacts);
            } else {
                return null;
            }
        },

        addContact: function (contact, user) {
            var contacts = this.getContacts(user);
            if (contacts) {
                if (contacts.indexOf(contact.toString()) >= 0) {
                    return false;
                }
                contacts.push(contact.toString());
            } else {
                contacts = [contact.toString()];
            }
            return this.saveContacts(contacts, user);
        },

        removeContact: function (contact, user) {
            var contacts = this.getContacts(user);
            if (!contacts) {
                return false;
            }
            var pos = contacts.indexOf(contact.toString());
            if (pos < 0) {
                return false;
            }
            contacts.splice(pos, 1);
            return this.saveContacts(contacts, user);
        },

        saveContacts: function (contacts, user) {
            this.load();
            this.__contacts[user.toString()] = ID.revert(contacts);
            console.log('saving contacts for user', user);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification('ContactsUpdated', this,
                    {'user': user, 'contacts': contacts});
                return true;
            } else {
                throw new Error('failed to save contacts: ' + user + ' -> ' + contacts);
            }
        },

        load: function () {
            if (!this.__contacts) {
                this.__contacts = Storage.loadJSON('ContactTable');
                if (!this.__contacts) {
                    this.__contacts = {};
                }
            }
        },
        save: function () {
            return Storage.saveJSON(this.__users, 'ContactTable');
        },

        __contacts: null  // ID => Array<ID>
    };

    var parse = function (map) {
        var users = {};
        if (map) {
            var u_list = Object.keys(map);
            for (var i = 0; i < u_list.length; ++i) {
                var user = u_list[i];
                var c_list = map[user];
                // user ID
                user = ID.parse(user);
                console.assert(user !== null, 'user ID error', u_list[i]);
                // user contacts
                var contacts = [];
                for (var j = 0; j < c_list.length; ++j) {
                    var item = c_list[j];
                    item = ID.parse(item);
                    console.assert(item !== null, 'contact ID error', c_list[j]);
                    contacts.push(item);
                }
                // got contacts for one user
                users[user] = contacts;
            }
        }
        return users;
    };

})(SECHAT, DIMSDK);
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
    var Document = sdk.protocol.Document;

    var Storage = sdk.dos.LocalStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;

    ns.db.DocumentTable = {

        getDocument: function (identifier, type) {
            this.load();
            var doc = this.__docs[identifier.toString()];
            if (doc) {
                return Document.parse(doc);
            } else {
                return null;  //Document.create(identifier);
            }
        },

        saveDocument: function (doc) {
            if (!doc.isValid()) {
                console.error('document not valid', doc);
                return false;
            }
            var identifier = doc.getIdentifier();
            if (!identifier) {
                throw new Error('entity ID error: ' + doc);
            }
            this.load();
            this.__docs[identifier.toString()] = doc.getMap();
            console.log('saving document', identifier);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification(ns.kNotificationDocumentUpdated, this, doc);
                return true;
            } else {
                throw new Error('failed to save profile: '
                    + identifier + ' -> '
                    + doc.getValue('data'));
            }
        },

        load: function () {
            if (!this.__docs) {
                this.__docs = parse(Storage.loadJSON('DocumentTable'));
                if (!this.__docs) {
                    this.__docs = {};
                }
            }
        },
        save: function () {
            return Storage.saveJSON(this.__docs, 'DocumentTable');
        },

        __docs: null  // ID => Document
    };

    var parse = function (map) {
        var documents = {};
        if (map) {
            var user, doc;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                user = list[i];
                doc = map[user];
                user = ID.parse(user);
                doc = Document.parse(doc);
                if (user && doc) {
                    documents[user] = doc;
                }
            }
        }
        return documents;
    };

})(SECHAT, DIMSDK);
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

    var Storage = sdk.dos.LocalStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;

    ns.db.GroupTable = {

        getFounder: function (group) {
            return null;
        },

        getOwner: function (group) {
            return null;
        },

        getMembers: function (group) {
            this.load()
            var members = this.__members[group.toString()];
            if (members) {
                return ID.convert(members);
            } else {
                return null;
            }
        },

        addMember: function (member, group) {
            var members = this.getMembers(group);
            if (members) {
                if (members.indexOf(member.toString()) >= 0) {
                    return false;
                }
                members.push(member.toString());
            } else {
                members = [member.toString()];
            }
            return this.saveMembers(members, group);
        },

        removeMember: function (member, group) {
            var members = this.getMembers(group);
            if (!members) {
                return false;
            }
            var pos = members.indexOf(member.toString());
            if (pos < 0) {
                return false;
            }
            members.splice(pos, 1);
            return this.saveMembers(members, group);
        },

        saveMembers: function (members, group) {
            this.load()
            this.__members[group.toString()] = ID.revert(members);
            console.log('saving members for group', group);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification('MembersUpdated', this,
                    {'group': group, 'members': members});
                return true;
            } else {
                throw new Error('failed to save members: ' + group + ' -> ' + members);
            }
        },

        removeGroup: function (group) {
            this.load();
            if (this.__members[group.toString()]) {
                delete this.__members[group.toString()]
                return this.save();
            } else {
                console.error('group not exists: ' + group);
                return false;
            }
        },

        load: function () {
            if (!this.__members) {
                this.__members = Storage.loadJSON('GroupTable');
                if (!this.__members) {
                    this.__members = {};
                }
            }
        },
        save: function () {
            return Storage.saveJSON(this.__members, 'GroupTable');
        },

        __members: null  // ID => Array<ID>
    };

    var parse = function (map) {
        var groups = {};
        if (map) {
            var g_list = Object.keys(map);
            for (var i = 0; i < g_list.length; ++i) {
                var group = g_list[i];
                var m_list = map[group];
                // group ID
                group = ID.parse(group);
                if (!group) {
                    throw new TypeError('group ID error: ' + g_list[i]);
                }
                // group members
                var members = [];
                for (var j = 0; j < m_list.length; ++j) {
                    var item = m_list[j];
                    item = ID.parse(item);
                    if (!item) {
                        throw new TypeError('member ID error: ' + m_list[j]);
                    }
                    members.push(item);
                }
                // got members for one group
                groups[group] = members;
            }
        }
        return groups;
    };

})(SECHAT, DIMSDK);
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

    var Storage = sdk.dos.LocalStorage;

    ns.db.LoginTable = {

        /**
         *  Get last login command for user
         *
         * @param {ID} user - user ID
         * @return {LoginCommand}
         */
        getLoginCommand: function (user) {
        },

        /**
         *  Save last login command for user
         *
         * @param {LoginCommand} cmd - login command with user ID
         * @return {boolean} false on failed
         */
        saveLoginCommand: function (cmd) {
        },

        __docs: null
    };

})(SECHAT, DIMSDK);
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
    var InstantMessage = sdk.protocol.InstantMessage;

    var Storage = sdk.dos.SessionStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;

    ns.db.MessageTable = {

        //---- conversations

        /**
         *  Get how many chat boxes
         *
         * @return {uint} conversations count
         */
        numberOfConversations: function () {
            var keys = Object.keys(this.__messages);
            return keys.length;
        },

        /**
         *  Get chat box info
         *
         * @param {uint} index - sorted index
         * @return {ID} conversation ID
         */
        conversationAtIndex: function (index) {
            var keys = Object.keys(this.__messages);
            return ID.parse(keys[index]);
        },

        /**
         *  Remove one chat box
         *
         * @param index - chat box index
         * @return {boolean} true on row(s) affected
         */
        removeConversationAtIndex: function (index) {
            var chat = this.conversationAtIndex(index);
            return this.removeConversation(chat);
        },

        /**
         *  Remove the chat box
         *
         * @param {ID} entity - conversation ID
         * @return {boolean} true on row(s) affected
         */
        removeConversation: function (entity) {
        },

        //-------- messages

        /**
         *  Get message count in this conversation for an entity
         *
         * @param {ID} entity - conversation ID
         * @return {uint} total count
         */
        numberOfMessages: function (entity) {
            var messages = this.loadMessages(entity);
            if (messages) {
                return messages.length;
            } else {
                return 0;
            }
        },

        /**
         *  Get unread message count in this conversation for an entity
         *
         * @param {ID} entity - conversation ID
         * @return {uint} unread count
         */
        numberOfUnreadMessages: function (entity) {
        },

        /**
         *  Clear unread flag in this conversation for an entity
         *
         * @param {ID} entity - conversation ID
         * @return {boolean} true on row(s) affected
         */
        clearUnreadMessages: function (entity) {
        },

        /**
         *  Get last message of this conversation
         *
         * @param {ID} entity - conversation ID
         * @return {InstantMessage} instant message
         */
        lastMessage: function (entity) {
            var messages = this.loadMessages(entity);
            if (messages && messages.length > 0) {
                return InstantMessage.parse(messages[messages.length - 1]);
            } else {
                return null;
            }
        },

        /**
         *  Get last received message from all conversations
         *
         * @param {ID} user - current user ID
         * @return {InstantMessage} instant message
         */
        lastReceivedMessage: function (user) {
        },

        /**
         *  Get message at index of this conversation
         *
         * @param {uint} index - start from 0, latest first
         * @param {ID} entity - conversation ID
         * @return {InstantMessage} instant message
         */
        messageAtIndex: function (index, entity) {
            var messages = this.loadMessages(entity);
            console.assert(messages !== null, 'failed to get messages for conversation: ' + identifier);
            return InstantMessage.parse(messages[index]);
        },

        /**
         *  Save the new message to local storage
         *
         * @param {InstantMessage} iMsg - instant message
         * @param {ID} entity - conversation ID
         * @return {boolean} true on success
         */
        insertMessage: function (iMsg, entity) {
            var messages = this.loadMessages(entity);
            if (messages) {
                if (!insert_message(iMsg, messages)) {
                    // duplicate message?
                    return false;
                }
            } else {
                messages = [iMsg];
            }
            if (this.saveMessages(messages, entity)) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification(ns.kNotificationMessageUpdated, this, iMsg);
                return true;
            } else {
                throw new Error('failed to save message: ' + iMsg);
            }
        },

        /**
         *  Delete the message
         *
         * @param {InstantMessage} iMsg - instant message
         * @param {ID} entity - conversation ID
         * @return {boolean} true on row(s) affected
         */
        removeMessage: function (iMsg, entity) {
            var messages = this.loadMessages(entity);
            console.assert(messages !== null, 'failed to get messages for conversation: ' + entity);
            if (!remove_message(iMsg, messages)) {
                return false;
            }
            return this.saveMessages(messages, entity);
        },

        /**
         *  Try to withdraw the message, maybe won't success
         *
         * @param {InstantMessage} iMsg - instant message
         * @param {ID} entity - conversation ID
         * @return {boolean} true on success
         */
        withdrawMessage: function (iMsg, entity) {
        },

        /**
         *  Update message state with receipt
         *
         * @param {InstantMessage} iMsg - message with receipt content
         * @param {ID} entity - conversation ID
         * @return {boolean} true while target message found
         */
        saveReceipt: function (iMsg, entity) {
        },

        /**
         *  Load messages in conversation
         *
         * @param {ID} conversation
         * @returns {InstantMessage[]}
         */
        loadMessages: function (conversation) {
            this.load(conversation);
            var array = this.__messages[conversation];
            var messages = [];
            if (array) {
                for (var i = 0; i < array.length; ++i) {
                    messages.push(InstantMessage.parse(array[i]));
                }
            }
            return messages;
        },

        /**
         *  Save messages in conversation
         *
         * @param {InstantMessage[]} messages
         * @param {ID} conversation
         * @returns {boolean}
         */
        saveMessages: function (messages, conversation) {
            var array = [];
            if (messages) {
                for (var i = 0; i < messages.length; ++i) {
                    array.push(messages[i].getMap());
                }
            }
            this.__messages[conversation.toString()] = array;
            return this.save(conversation);
        },

        load: function (identifier) {
            if (!this.__messages[identifier.toString()]) {
                this.__messages[identifier.toString()] = Storage.loadJSON(get_tag(identifier));
            }
        },
        save: function (identifier) {
            return Storage.saveJSON(this.__messages[identifier.toString()], get_tag(identifier));
        },

        __messages: {}  // ID => Array<InstantMessage>
    };

    var get_tag = function (identifier) {
        return 'Messages-' + identifier.getAddress().toString();
    };

    var parse = function (list) {
        var messages = [];
        if (list) {
            var msg;
            for (var i = 0; i < list.length; ++i) {
                msg = InstantMessage.getInstance(list[i]);
                if (!msg) {
                    throw new Error('Message error: ' + list[i]);
                }
                messages.push(msg);
            }
        }
        return messages;
    };

    var insert_message = function (iMsg, messages) {
        // timestamp
        var t1, t2;
        t1 = iMsg.envelope.time;
        if (!t1) {
            t1 = 0;
        }
        // serial number
        var sn1, sn2;
        sn1 = iMsg.content.sn;

        var index;
        var item;
        for (index = messages.length - 1; index >=0; --index) {
            item = messages[index];
            t2 = item.envelope.time;
            if (t2 && t2 < t1) {
                // finished
                break;
            }
            sn2 = item.content.sn;
            if (sn1 === sn2) {
                console.log('duplicate message, no need to insert');
                return false;
            }
        }
        // insert after
        ns.type.Arrays.insert(messages, index+1, iMsg);
        return true;
    };
    var remove_message = function (iMsg, messages) {
        // timestamp
        var t1, t2;
        t1 = iMsg.envelope.time;
        if (!t1) {
            t1 = 0;
        }
        // serial number
        var sn1, sn2;
        sn1 = iMsg.content.sn;

        var index;
        var item;
        for (index = messages.length - 1; index >=0; --index) {
            item = messages[index];
            t2 = item.envelope.time;
            if (t2 && t2 < t1) {
                console.log('message not found');
                return false;
            }
            sn2 = item.content.sn;
            if (sn1 === sn2) {
                // got it
                break;
            }
        }
        // insert after
        ns.type.Arrays.insert(messages, index+1, iMsg);
        return true;
    };

})(SECHAT, DIMSDK);
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
    var Meta = sdk.protocol.Meta;

    var Storage = sdk.dos.LocalStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;

    ns.db.MetaTable = {

        getMeta: function (identifier) {
            this.load();
            var meta = this.__metas[identifier.toString()];
            if (meta) {
                return Meta.parse(meta);
            } else {
                // TODO: place an empty meta for cache
                return null;
            }
        },

        saveMeta: function (meta, identifier) {
            if (!meta.matches(identifier)) {
                console.error('meta mot match', identifier, meta);
                return false;
            }
            this.load();
            if (this.__metas[identifier.toString()]) {
                console.log('meta already exists', identifier);
                return true;
            }
            this.__metas[identifier.toString()] = meta.getMap();
            console.log('saving meta', identifier);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification(ns.kNotificationMetaAccepted, this,
                    {'ID': identifier, 'meta': meta});
                return true;
            } else {
                var text = 'failed to save meta: ' + identifier + ' -> '
                    + sdk.format.JSON.encode(meta);
                console.log(text);
                return false;
            }
        },

        load: function () {
            if (!this.__metas) {
                this.__metas = Storage.loadJSON('MetaTable');
                if (!this.__metas) {
                    this.__metas = {};
                }
            }
        },
        save: function () {
            return Storage.saveJSON(this.__metas, 'MetaTable');
        },

        __metas: null  // ID => Meta
    };

    var parse = function (map) {
        var metas = {};
        if (map) {
            var identifier, meta;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                identifier = list[i];
                meta = map[identifier];
                identifier = ID.parse(identifier);
                meta = Meta.parse(meta);
                if (identifier && meta) {
                    metas[identifier] = meta;
                }
            }
        }
        return metas;
    };

})(SECHAT, DIMSDK);
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
    var Storage = sdk.dos.LocalStorage;

    ns.db.MsgKeyTable = {

        getKey: function (from, to) {
        },

        addKey: function (from, to, key) {
        },

        __keys: null
    };

})(SECHAT, DIMSDK);
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

    var PrivateKey = sdk.crypto.PrivateKey;
    var ID = sdk.protocol.ID;

    var Storage = sdk.dos.LocalStorage;

    ns.db.PrivateKeyTable = {

        META: 'M',
        VISA: 'V',

        /**
         *  Save private key for user
         *
         * @param {ID} user - user ID
         * @param {PrivateKey} key - private key
         * @param {String} type - 'M' for matching meta.key; or 'D' for matching visa.key
         * @param {int} sign - whether use for signature
         * @param {int} decrypt - whether use for decryption
         * @return {boolean} false on error
         */
        savePrivateKey: function (user, key, type, sign, decrypt) {
            this.load();
            this.__keys[get_tag(user, type)] = key.getMap();
            if (type === this.META) {
                this.__keys[get_tag(user, null)] = key.getMap();
            }
            return this.save();
        },

        /**
         *  Get private keys for user
         *
         * @param {ID} user - user ID
         * @return {DecryptKey[]} all keys marked for decryption
         */
        getPrivateKeysForDecryption: function (user) {
            this.load();
            var keys = [];
            var key0 = this.__keys[get_tag(user, null)];
            var key1 = this.__keys[get_tag(user, this.META)];
            var key2 = this.__keys[get_tag(user, this.VISA)];
            key0 = PrivateKey.parse(key0);
            key1 = PrivateKey.parse(key1);
            key2 = PrivateKey.parse(key2);
            if (key2) {
                keys.push(key2);
            }
            if (keys.indexOf(key1) < 0) {
                keys.push(key1);
            }
            if (keys.indexOf(key0) < 0) {
                keys.push(key0);
            }
            return keys;
        },

        /**
         *  Get private key for user
         *
         * @param {ID} user - user ID
         * @return {PrivateKey} first key marked for signature
         */
        getPrivateKeyForSignature: function (user) {
            return this.getPrivateKeyForVisaSignature(user);
        },

        /**
         *  Get private key for user
         *
         * @param {ID} user - user ID
         * @return {PrivateKey} the private key matched with meta.key
         */
        getPrivateKeyForVisaSignature: function (user) {
            this.load();
            var key = this.__keys[get_tag(user, this.META)];
            if (!key) {
                key = this.__keys[get_tag(user, null)];
            }
            return PrivateKey.parse(key);
        },

        load: function () {
            if (!this.__keys) {
                this.__keys = Storage.loadJSON('PrivateTable');
                if (!this.__keys) {
                    this.__keys = {};
                }
            }
        },
        save: function () {
            return Storage.saveJSON(this.__keys, 'PrivateTable');
        },

        __keys: null  // String => PrivateKey
    };

    var get_tag = function (identifier, type) {
        if (!type || type.length === 0) {
            return identifier.toString();
        }
        var terminal = identifier.getTerminal();
        if (terminal && terminal.length > 0) {
            return identifier.toString() + '#' + type;
        } else {
            return identifier.toString() + '/' + type;
        }
    };

    var parse = function (map) {
        var keys = {};
        if (map) {
            var identifier, key;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                identifier = list[i];
                key = map[identifier];
                // identifier = ID.parse(identifier);
                key = PrivateKey.parse(key);
                if (identifier && key) {
                    keys[identifier] = key;
                }
            }
        }
        return keys;
    };

})(SECHAT, DIMSDK);
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

    var Storage = sdk.dos.LocalStorage;

    ns.db.UserTable = {

        allUsers: function () {
            this.load();
            return this.__users;
        },

        addUser: function (user) {
            var list = this.allUsers();
            if (list.indexOf(user) < 0) {
                list.push(user);
                return this.save();
            } else {
                console.error('user already exists', user);
                return false;
            }
        },

        removeUser: function (user) {
            var list = this.allUsers();
            var index = list.indexOf(user);
            if (index < 0) {
                console.error('user not exists', user);
                return true;
            } else {
                list.splice(index, 1);
                return this.save();
            }
        },

        setCurrentUser: function (user) {
            var list = this.allUsers();
            var index = list.indexOf(user);
            if (index === 0) {
                // already the first user
                return true;
            } else if (index > 0) {
                // already exists, but not the first user
                list.splice(index, 1);
            }
            list.unshift(user);
            return this.save();
        },

        getCurrentUser: function () {
            var list = this.allUsers();
            if (list.length > 0) {
                return list[0];
            } else {
                return null;
            }
        },

        load: function () {
            if (!this.__users) {
                this.__users = convert(Storage.loadJSON('UserTable'));
            }
        },
        save: function () {
            return Storage.saveJSON(revert(this.__users), 'UserTable');
        },

        __users: null
    };

    var convert = function (list) {
        if (list) {
            return ID.convert(list);
        } else {
            return [];
        }
    };
    var revert = function (list) {
        if (list) {
            return ID.revert(list);
        } else {
            return [];
        }
    }

})(SECHAT, DIMSDK);
;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

    var MessageQueue = function () {
        this.__queue = [];  // List[MessageWrapper]
    };
    sdk.Class(MessageQueue, null, null);

    MessageQueue.prototype.append = function (rMsg) {
        var wrapper = new ns.network.MessageWrapper(rMsg);
        this.__queue.push(wrapper);
        return true;
    };

    MessageQueue.prototype.shift = function () {
        if (this.__queue.length > 0) {
            return this.__queue.shift();
        } else {
            return null;
        }
    };

    MessageQueue.prototype.next = function () {
        var item;
        for (var i = 0; i < this.__queue.length; ++i) {
            item = this.__queue[i];
            if (item.isVirgin()) {
                item.mark();  // mark sent
                return item;
            }
        }
        return null;
    };

    MessageQueue.prototype.eject = function () {
        var item;
        for (var i = 0; i < this.__queue.length; ++i) {
            item = this.__queue[i];
            if (!item.getMessage() || item.isFailed()) {
                this.__queue.splice(i, 1)
                return item;
            }
        }
        return null;
    };

    //-------- namespace --------
    ns.network.MessageQueue = MessageQueue;

    ns.network.registers('MessageQueue');

})(SECHAT, DIMSDK);
;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

    var Runner = sdk.threading.Runner;
    var Gate = sdk.startrek.Gate;

    /**
     *  Create session
     *
     *  Usages:
     *      1. new BaseSession(gate, transceiver);
     *      2. new BaseSession(host, port, transceiver);
     */
    var BaseSession = function () {
        Runner.call(this);
        if (arguments.length === 2) {
            // new BaseSession(gate, transceiver);
            this.gate = arguments[0];
            this.__messenger = arguments[1];
        } else if (arguments.length === 3) {
            // new BaseSession(host, port, transceiver);
            this.gate = ns.network.StarTrek.createGate(arguments[0], arguments[1]);
            this.__messenger = arguments[2];
        } else {
            throw new SyntaxError('session arguments error: ' + arguments);
        }
        this.gate.setDelegate(this);
        this.__queue = new ns.network.MessageQueue();
        this.__active = false;
    };
    sdk.Class(BaseSession, Runner, [Gate.Delegate]);

    BaseSession.EXPIRES = 600 * 1000;  // 10 minutes

    var flush = function () {
        var msg;
        var wrapper = this.__queue.pop();
        while (wrapper) {
            msg = wrapper.getMessage();
            if (msg) {
                this.storeMessage(msg);
            }
            wrapper = this.__queue.pop();
        }
    };
    var clean = function () {
        var msg;
        var wrapper = this.__queue.eject();
        while (wrapper) {
            msg = wrapper.getMessage();
            if (msg) {
                this.storeMessage(msg);
            }
            wrapper = this.__queue.eject();
        }
    };

    BaseSession.prototype.storeMessage = function (msg) {
        // TODO: store the stranded message?
    };

    BaseSession.prototype.getMessenger = function () {
        return this.__messenger;
    };

    BaseSession.prototype.isActive = function () {
        return this.__active && this.gate.isRunning();
    };
    BaseSession.prototype.setActive = function (active) {
        this.__active = active;
    };

    BaseSession.prototype.close = function () {
        this.__running = false;
    };

    BaseSession.prototype.setup = function () {
        this.__running = true;
        return this.gate.setup();
    };
    BaseSession.prototype.finish = function () {
        this.__running = false;
        if (this.gate.finish()) {
            // gate stuck, return true to try it again
            return true;
        } else {
            flush.call(this);
            return false;
        }
    };

    BaseSession.prototype.isRunning = function () {
        return this.__running && this.gate.isRunning();
    };

    BaseSession.prototype.process = function () {
        if (this.gate.process()) {
            // processed income/outgo packages
            return true;
        }
        // all packages processed, do the clean job
        clean.call(this);
        if (!this.isActive()) {
            return false;
        }
        // still active, get next message
        var rMsg, wrapper = this.__queue.next();
        if (wrapper) {
            // if msg in this wrapper is None (means sent successfully),
            // it must have been cleaned already, so it should not be empty here.
            rMsg = wrapper.getMessenger();
        } else {
            // no more new message
            rMsg = null;
        }
        if (!rMsg) {
            // no more new message, return false to have a rest
            return false;
        }
        // try to push
        if (!this.getMessenger().sendReliableMessage(rMsg, wrapper, 0)) {
            wrapper.fail();
        }
        return true;
    };

    BaseSession.prototype.push = function (rMsg) {
        if (this.isActive()) {
            return this.__queue.append(rMsg);
        } else {
            return false;
        }
    };

    //
    //  Gate Delegate
    //

    BaseSession.prototype.onGateStatusChanged = function (gate, oldStatus, newStatus) {
        if (newStatus.equals(Gate.Status.CONNECTED)) {
            this.getMessenger().onConnected();
        }
    };

    BaseSession.prototype.onGateReceived = function (gate, ship) {
        var payload = ship.getPayload();
        console.log('received data', payload);
        try {
            return this.getMessenger().processData(payload);
        } catch (e) {
            console.log('received data error', payload);
            return null;
        }
    };

    //-------- namespace --------
    ns.network.BaseSession = BaseSession;

    ns.network.registers('BaseSession');

})(SECHAT, DIMSDK);
;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

    var ActiveConnection = sdk.stargate.ActiveConnection;
    var WSGate = sdk.stargate.WSGate;

    var StarTrek = function (connection) {
        WSGate.call(this, connection);
    };
    sdk.Class(StarTrek, WSGate, null);

    StarTrek.createGate = function (host, port) {
        var conn = new ActiveConnection(host, port);
        var gate = new StarTrek(conn);
        conn.setDelegate(gate);
        gate.start();
        return gate;
    };

    StarTrek.prototype.start = function () {
        this.connection.start();
        WSGate.prototype.start.call(this);
    };

    StarTrek.prototype.finish = function () {
        WSGate.prototype.finish.call(this);
        this.connection.stop();
    };

    //-------- namespace --------
    ns.network.StarTrek = StarTrek;

    ns.network.registers('StarTrek');

})(SECHAT, DIMSDK);
;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

    var Ship = sdk.startrek.Ship;
    var Callback = sdk.Callback;

    var MessageWrapper = function (rMsg) {
        this.__msg = rMsg;
        this.__timestamp = 0;
    };
    sdk.Class(MessageWrapper, null, [Ship.Delegate, Callback]);

    MessageWrapper.prototype.getMessage = function () {
        return this.__msg;
    };

    MessageWrapper.prototype.mark = function () {
        this.__timestamp = 1;
    };
    MessageWrapper.prototype.fail = function () {
        this.__timestamp = -1;
    };
    MessageWrapper.prototype.isVirgin = function () {
        return this.__timestamp === 0;
    };
    MessageWrapper.prototype.isFailed = function () {
        if (this.__timestamp < 0) {
            return true;
        } else if (this.__timestamp === 0) {
            return false;
        }
        var now = new Date();
        return now.getTime() - this.__timestamp > ns.network.BaseSession.EXPIRES;
    };

    //
    //  Ship Delegate
    //
    MessageWrapper.prototype.onShipSent = function (ship, error) {
        if (error) {
            // failed
            this.__timestamp = -1;
        } else {
            // success, remove message
            this.__msg = null;
        }
    };

    //
    //  Messenger Callback
    //
    MessageWrapper.prototype.onFinished = function (result, error) {
        if (error) {
            // failed
            this.__timestamp = -1;
        } else {
            // this message was assigned to the worker of StarGate,
            // update sent time
            this.__timestamp = (new Date()).getTime();
        }
    };


    //-------- namespace --------
    ns.network.MessageWrapper = MessageWrapper;

    ns.network.registers('MessageWrapper');

})(SECHAT, DIMSDK);
;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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
 *      command  : "report",
 *      title    : "online",      // or "offline"
 *      //---- extra info
 *      time     : 1234567890,    // timestamp?
 *  }
 */

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var Command = sdk.protocol.Command;

    /**
     *  Create report command
     *
     *  Usages:
     *      1. new ReportCommand();
     *      2. new ReportCommand(title);
     *      3. new ReportCommand(map);
     */
    var ReportCommand = function () {
        if (arguments.length === 0) {
            // new ReportCommand();
            Command.call(this, ReportCommand.REPORT);
        } else if (typeof arguments[0] === 'string') {
            // new SearchCommand(keywords);
            Command.call(this, ReportCommand.REPORT);
            this.setTitle(arguments[0]);
        } else {
            // new SearchCommand(map);
            Command.call(this, arguments[0]);
        }
    };
    sdk.Class(ReportCommand, Command, null);

    ReportCommand.REPORT = 'report';
    ReportCommand.ONLINE = 'online';
    ReportCommand.OFFLINE = 'offline';

    //-------- setter/getter --------

    ReportCommand.prototype.setTitle = function (title) {
        this.setValue('title', title);
    };
    ReportCommand.prototype.getTitle = function () {
        return this.getValue('title');
    };

    //-------- namespace --------
    ns.protocol.ReportCommand = ReportCommand;

    ns.protocol.registers('ReportCommand');

})(SECHAT, DIMSDK);
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

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;
    var Command = sdk.protocol.Command;

    /**
     *  Create search command
     *
     *  Usages:
     *      1. new SearchCommand();
     *      2. new SearchCommand(keywords);
     *      3. new SearchCommand(map);
     */
    var SearchCommand = function () {
        if (arguments.length === 0) {
            // new SearchCommand();
            Command.call(this, SearchCommand.ONLINE_USERS);
        } else if (typeof arguments[0] === 'string') {
            // new SearchCommand(keywords);
            Command.call(this, SearchCommand.SEARCH);
            this.setKeywords(arguments[0]);
        } else {
            // new SearchCommand(map);
            Command.call(this, arguments[0]);
        }
    };
    sdk.Class(SearchCommand, Command, null);

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
        var users = this.getValue('users');
        if (users) {
            return ID.convert(users);
        } else {
            return null;
        }
    };

    /**
     *  Get user metas mapping to ID strings
     *
     * @returns {*} - meta dictionary
     */
    SearchCommand.prototype.getResults = function () {
        return this.getValue('results');
    };

    //-------- namespace --------
    ns.protocol.SearchCommand = SearchCommand;

    ns.protocol.registers('SearchCommand');

})(SECHAT, DIMSDK);
;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

    var NetworkType = sdk.protocol.NetworkType;
    var ID = sdk.protocol.ID;
    var BTCAddress = sdk.mkm.BTCAddress;

    var Anonymous = function () {
    };
    sdk.Class(Anonymous, null, null);

    Anonymous.getName = function (identifier) {
        var name;
        if (sdk.Interface.conforms(identifier, ID)) {
            name = identifier.getName();
            if (!name || name.length === 0) {
                name = get_name(identifier.getType());
            }
        } else {  // Address
            name = get_name(identifier.getNetwork());
        }
        var number = Anonymous.getNumberString(identifier);
        return name + ' (' + number + ')';
    };

    Anonymous.getNumberString = function (address) {
        var str = '' + Anonymous.getNumber(address);
        while (str.length < 10) {
            str = '0' + str;
        }
        return str.substr(0, 3) + '-'
            + str.substr(3, 3) + '-'
            + str.substr(6);
    };

    Anonymous.getNumber = function (address) {
        if (sdk.Interface.conforms(address, ID)) {
            address = address.getAddress();
        }
        if (address instanceof BTCAddress) {
            return btc_number(address);
        }
        throw new TypeError('address error: ' + address.toString());
    };

    var get_name = function (type) {
        if (NetworkType.ROBOT.equals(type)) {
            return 'Robot';
        }
        if (NetworkType.STATION.equals(type)) {
            return 'Station';
        }
        if (NetworkType.PROVIDER.equals(type)) {
            return 'SP';
        }
        if (NetworkType.isUser(type)) {
            return 'User';
        }
        if (NetworkType.isGroup(type)) {
            return 'Group';
        }
        return 'Unknown';
    };

    var btc_number = function (btc) {
        var data = sdk.format.Base58.decode(btc.toString());
        return user_number(data);
    };
    var eth_number = function (eth) {
        var data = sdk.format.Hex.decode(eth.toString().substr(2))
        return user_number(data);
    };
    var user_number = function (cc) {
        var len = cc.length;
        var c1 = cc[len-1] & 0xFF;
        var c2 = cc[len-2] & 0xFF;
        var c3 = cc[len-3] & 0xFF;
        var c4 = cc[len-4] & 0xFF;
        return (c1 | (c2 << 8) | (c3 << 16)) + c4 * 0x01000000;
    };

    //-------- namespace --------
    ns.Anonymous = Anonymous;

    ns.registers('Anonymous');

})(SECHAT, DIMSDK);
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

    var DecryptKey = sdk.crypto.DecryptKey;

    var ID = sdk.protocol.ID;
    var Entity = sdk.Entity;
    var User = sdk.User;
    var Group = sdk.Group;

    var Facebook = sdk.Facebook;

    var CommonFacebook = function () {
        Facebook.call(this);
        // local users
        this.__localUsers = null;
        // databases
        this.privateKeyTable = ns.db.PrivateKeyTable;
        this.metaTable = ns.db.MetaTable;
        this.documentTable = ns.db.DocumentTable;
        this.userTable = ns.db.UserTable;
        this.contactTable = ns.db.ContactTable;
        this.groupTable = ns.db.GroupTable;
    };
    sdk.Class(CommonFacebook, Facebook, null);

    CommonFacebook.EXPIRES = 30 * 60 * 1000;  // document expires (30 minutes)
    CommonFacebook.EXPIRES_KEY = 'expires';

    //
    //  Local Users
    //
    CommonFacebook.prototype.getLocalUsers = function() {
        if (!this.__localUsers) {
            var list = this.userTable.allUsers();
            var users = [];
            var item;
            for (var i = 0; i < list.length; ++i) {
                item = this.getUser(list[i]);
                if (item) {
                    users.push(item);
                } else {
                    throw new Error('failed to get local user:' + item);
                }
            }
            this.__localUsers = users;
        }
        return this.__localUsers;
    };
    CommonFacebook.prototype.getCurrentUser = function () {
        var uid = this.userTable.getCurrentUser();
        if (uid) {
            return this.getUser(uid);
        } else {
            return Facebook.prototype.getCurrentUser.call(this);
        }
    };
    CommonFacebook.prototype.setCurrentUser = function(user) {
        this.__localUsers = null;
        if (user instanceof User) {
            user = user.identifier;
        }
        return this.userTable.setCurrentUser(user);
    };

    CommonFacebook.prototype.addUser = function(user) {
        this.__localUsers = null;
        if (user instanceof User) {
            user = user.identifier;
        }
        return this.userTable.addUser(user);
    };
    CommonFacebook.prototype.removeUser = function(user) {
        this.__localUsers = null;
        if (user instanceof User) {
            user = user.identifier;
        }
        return this.userTable.removeUser(user);
    };

    //
    //  Contacts
    //
    CommonFacebook.prototype.addContact = function(contact, user) {
        if (contact instanceof Entity) {
            contact = contact.identifier;
        }
        if (user instanceof User) {
            user = user.identifier;
        }
        return this.contactTable.addContact(contact, user);
    };
    CommonFacebook.prototype.removeContact = function(contact, user) {
        if (contact instanceof Entity) {
            contact = contact.identifier;
        }
        if (user instanceof User) {
            user = user.identifier;
        }
        return this.contactTable.removeContact(contact, user);
    };

    //
    //  Private Key
    //
    CommonFacebook.prototype.savePrivateKey = function (key, user) {
        if (user instanceof User) {
            user = user.identifier;
        }
        return this.privateKeyTable.savePrivateKey(key, user);
    };

    //
    //  Meta
    //
    CommonFacebook.prototype.saveMeta = function(meta, identifier) {
        return this.metaTable.saveMeta(meta, identifier);
    };

    //
    //  Document
    //
    CommonFacebook.prototype.saveDocument = function(doc) {
        if (!this.checkDocument(doc)) {
            return false;
        }
        doc.setValue(CommonFacebook.EXPIRES_KEY, null);
        return this.documentTable.saveDocument(doc);
    };
    CommonFacebook.prototype.isExpiredDocument = function (doc, reset) {
        var now = (new Date()).getTime();
        var expires = doc.getValue(CommonFacebook.EXPIRES_KEY);
        if (!expires) {
            // set expired time
            doc.setValue(CommonFacebook.EXPIRES_KEY, now + CommonFacebook.EXPIRES);
            return false;
        } else if (now < expires) {
            return false;
        }
        if (reset) {
            // update expired time
            doc.setValue(CommonFacebook.EXPIRES_KEY, now + CommonFacebook.EXPIRES);
        }
        return true;
    };

    //
    //  Group
    //
    CommonFacebook.prototype.addMember = function (member, group) {
        if (member instanceof User) {
            member = member.identifier;
        }
        if (group instanceof Group) {
            group = group.identifier;
        }
        return this.groupTable.addMember(member, group);
    };
    CommonFacebook.prototype.removeMember = function (member, group) {
        if (member instanceof User) {
            member = member.identifier;
        }
        if (group instanceof Group) {
            group = group.identifier;
        }
        return this.groupTable.removeMember(member, group);
    };
    CommonFacebook.prototype.saveMembers = function (members, group) {
        if (group instanceof Group) {
            group = group.identifier;
        }
        return this.groupTable.saveMembers(members, group);
    };
    CommonFacebook.prototype.removeGroup = function (group) {
        if (group instanceof Group) {
            group = group.identifier;
        }
        return this.groupTable.removeGroup(group);
    };

    CommonFacebook.prototype.containsMember = function (member, group) {
        if (member instanceof User) {
            member = member.identifier;
        }
        if (group instanceof Group) {
            group = group.identifier;
        }
        var members = this.getMembers(group);
        if (members && members.indexOf(member) >= 0) {
            return true;
        }
        var owner = this.getOwner(group);
        return owner && owner.equals(member);
    };
    CommonFacebook.prototype.containsAssistant = function (bot, group) {
        if (bot instanceof User) {
            bot = bot.identifier;
        }
        if (group instanceof Group) {
            group = group.identifier;
        }
        var bots = this.getAssistants(group);
        return bots && bots.indexOf(bot) >= 0;
    };

    CommonFacebook.prototype.getName = function (identifier) {
        // get name from document
        var doc = this.getDocument(identifier, '*');
        if (doc) {
            var name = doc.getName();
            if (name && name.length > 0) {
                return name;
            }
        }
        // get name from ID
        return ns.Anonymous.getName(identifier);
    };

    CommonFacebook.prototype.createUser = function (identifier) {
        if (is_waiting.call(this, identifier)) {
            return null;
        } else {
            return Facebook.prototype.createUser.call(this, identifier);
        }
    };
    var is_waiting = function (id) {
        return !id.isBroadcast() && !this.getMeta(id);
    };
    CommonFacebook.prototype.createGroup = function (identifier) {
        if (is_waiting.call(this, identifier)) {
            return null;
        } else {
            return Facebook.prototype.createGroup.call(this, identifier);
        }
    };

    //
    //  Entity DataSource
    //
    CommonFacebook.prototype.getMeta = function (identifier) {
        if (identifier.isBroadcast()) {
            // broadcast ID has no meta
            return null;
        } else {
            // try from database
            return this.metaTable.getMeta(identifier);
        }
    };
    CommonFacebook.prototype.getDocument = function (identifier, type) {
        // try from database
        return this.documentTable.getDocument(identifier, type);
    };

    //
    //  User DataSource
    //
    CommonFacebook.prototype.getContacts = function (user) {
        // try from database
        return this.contactTable.getContacts(user);
    };

    CommonFacebook.prototype.getPrivateKeysForDecryption = function (user) {
        // try from database
        var keys = this.privateKeyTable.getPrivateKeysForDecryption(user);
        if (!keys || keys.length === 0) {
            // DIMP v1.0:
            //      the decrypt key and the sign key are the same key
            var key = this.getPrivateKeyForSignature(user);
            if (sdk.Interface.conforms(key, DecryptKey)) {
                keys = [key];
            }
        }
        return keys;
    };
    CommonFacebook.prototype.getPrivateKeyForSignature = function (user) {
        // try from database
        return this.privateKeyTable.getPrivateKeyForSignature(user);
    };
    CommonFacebook.prototype.getPrivateKeyForVisaSignature = function (user) {
        // try from database
        return this.privateKeyTable.getPrivateKeyForVisaSignature(user);
    };

    //
    //  Group DataSource
    //
    CommonFacebook.prototype.getFounder = function (group) {
        // get from database
        var founder = this.groupTable.getFounder(group);
        if (founder) {
            return founder;
        } else {
            return Facebook.prototype.getFounder.call(this, group);
        }
    };
    CommonFacebook.prototype.getOwner = function (group) {
        // get from database
        var owner = this.groupTable.getOwner(group);
        if (owner) {
            return owner;
        } else {
            return Facebook.prototype.getOwner.call(this, group);
        }
    };
    CommonFacebook.prototype.getMembers = function (group) {
        // get from database
        var members = this.groupTable.getMembers(group);
        if (members && members.length > 0) {
            return members;
        } else {
            return Facebook.prototype.getMembers.call(this, group);
        }
    };
    CommonFacebook.prototype.getAssistants = function (group) {
        // get from database
        var bots = this.groupTable.getAssistants(group);
        if (bots && bots.length > 0) {
            return bots;
        }
        // try ANS record
        var identifier = ID.parse('assistant');
        if (identifier) {
            return [identifier];
        } else {
            return null;
        }
    };

    //-------- namespace --------
    ns.CommonFacebook = CommonFacebook;

    ns.registers('CommonFacebook');

})(SECHAT, DIMSDK);
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

    var obj = sdk.type.Object;
    var SymmetricKey = sdk.crypto.SymmetricKey;
    var CipherKeyDelegate = sdk.CipherKeyDelegate;

    /**
     *  Symmetric Keys Cache
     *  ~~~~~~~~~~~~~~~~~~~~
     *  Manage keys for conversations
     */
    var KeyCache = function () {
        obj.call(this);
        // memory cache
        this.keyMap = {};  // ID => (ID => SymmetricKey)
        this.isDirty = false;
    };
    sdk.Class(KeyCache, obj, [CipherKeyDelegate]);

    /**
     *  Trigger for loading cipher key table
     *
     * @returns {boolean}
     */
    KeyCache.prototype.reload = function () {
        var map = this.loadKeys();
        if (!map) {
            return false;
        }
        return this.updateKeys(map);
    };

    /**
     *  Trigger for saving cipher key table
     */
    KeyCache.prototype.flush = function () {
        if (this.isDirty) {
            if (this.saveKeys(this.keyMap)) {
                // keys saved
                this.isDirty = false;
            }
        }
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Callback for saving cipher key table into local storage
     *  (Override it to access database)
     *
     * @param {{}} map - all cipher keys(with direction) from memory cache
     * @returns {boolean}
     */
    KeyCache.prototype.saveKeys = function (map) {
        console.assert(false, 'implement me!');
        return false;
    };

    /**
     *  Load cipher key table from local storage
     *  (Override it to access database)
     *
     * @returns {{}}
     */
    KeyCache.prototype.loadKeys = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Update cipher key table into memory cache
     *
     * @param {{}} map - cipher keys(with direction) from local storage
     * @returns {boolean}
     */
    KeyCache.prototype.updateKeys = function (map) {
        if (!map) {
            return false;
        }
        var changed = false;
        var sender, receiver;
        var oldKey, newKey;
        var table;
        for (sender in map) {
            if (!map.hasOwnProperty(sender)) continue;
            table = map[sender];
            for (receiver in table) {
                if (!table.hasOwnProperty(receiver)) continue;
                newKey = table[receiver];
                // check whether exists an old key
                oldKey = get_key.call(this, sender, receiver);
                if (oldKey !== newKey) {
                    changed = true;
                }
                // cache key with direction
                set_key.call(this, sender, receiver, newKey);
            }
        }
        return changed;
    };

    var get_key = function (sender, receiver) {
        var table = this.keyMap[sender];
        if (table) {
            return table[receiver];
        } else {
            return null;
        }
    };

    var set_key = function (sender, receiver, key) {
        var table = this.keyMap[sender];
        if (table) {
            var old = table[receiver];
            if (old && old.equals(key)) {
                // no need to update
                return;
            }
        } else {
            table = {};
            this.keyMap[sender] = table;
        }
        table[receiver] = key;
    };

    //-------- CipherKeyDelegate --------

    // @override
    KeyCache.prototype.getCipherKey = function (sender, receiver, generate) {
        if (receiver.isBroadcast()) {
            return ns.crypto.PlainKey.getInstance();
        }
        // get key from cache
        var key = get_key.call(this, sender, receiver);
        if (!key && generate) {
            // generate new key and store it
            key = SymmetricKey.generate(SymmetricKey.AES);
            this.cacheCipherKey(sender, receiver, key);
        }
        return key;

        // TODO: override to check whether key expired for sending message
    };

    // @override
    KeyCache.prototype.cacheCipherKey = function (sender, receiver, key) {
        if (receiver.isBroadcast()) {
            // broadcast message has no key
        } else {
            set_key.call(this, sender, receiver, key);
            this.isDirty = true;
        }
    };

    //-------- namespace --------
    ns.KeyCache = KeyCache;

    ns.registers('KeyCache');

})(SECHAT, DIMSDK);

(function (ns, sdk) {
    'use strict';

    var KeyCache = ns.KeyCache;

    var KeyStore = function() {
        KeyCache.call(this);
        // current user
        this.user = null;
    };
    sdk.Class(KeyStore, KeyCache, null);

    KeyStore.prototype.getUser = function () {
        return this.user;
    };
    KeyStore.prototype.setUser = function (user) {
        if (this.user) {
            // save key map for old user
            this.flush();
            if (this.user.equals(user)) {
                // user not changed
                return;
            }
        }
        if (!user) {
            this.user = null;
            return;
        }
        // change current user
        this.user = user;
        var keys = this.loadKeys();
        if (keys) {
            this.updateKeys(keys);
        }
    };

    // noinspection JSUnusedLocalSymbols
    KeyStore.prototype.saveKeys = function(map) {
        // do nothing
        return false
    };
    KeyStore.prototype.loadKeys = function() {
        // do nothing
        return null
    };

    //-------- namespace --------
    ns.KeyStore = KeyStore;

    ns.registers('KeyStore');

})(SECHAT, DIMSDK);
;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

    var Messenger = sdk.Messenger;

    var CommonMessenger = function () {
        Messenger.call(this);
    };
    sdk.Class(CommonMessenger, Messenger, null);

    CommonMessenger.prototype.getEntityDelegate = function() {
        if (!this.__barrack) {
            this.__barrack = new ns.CommonFacebook();
        }
        return this.__barrack;
    };
    CommonMessenger.prototype.getCipherKeyDelegate = function () {
        if (!this.__keycache) {
            this.__keycache = new ns.KeyStore();
        }
        return this.__keycache;
    };
    CommonMessenger.prototype.getPacker = function () {
        if (!this.__packer) {
            this.__packer = new ns.CommonPacker(this);
        }
        return this.__packer;
    };
    CommonMessenger.prototype.getProcessor = function () {
        if (!this.__processor) {
            this.__processor = new ns.CommonProcessor(this);
        }
        return this.__processor;
    };
    CommonMessenger.prototype.getTransmitter = function () {
        if (!this.__transmitter) {
            this.__transmitter = new ns.CommonTransmitter(this);
        }
        return this.__transmitter;
    };

    CommonMessenger.prototype.serializeKey = function (password, iMsg) {
        var reused = password.getValue('reused');
        if (reused) {
            var receiver = iMsg.getReceiver();
            if (receiver.isGroup()) {
                // reuse key for grouped message
                return null;
            }
            // remove before serialize key
            password.setValue('reused', null);
        }
        var data = Messenger.prototype.serializeKey.call(this, password, iMsg);
        if (reused) {
            // put it back
            password.setValue('reused', reused);
        }
        return data;
    };

    CommonMessenger.prototype.deserializeContent = function (data, password, sMsg) {
        try {
            return Messenger.prototype.deserializeContent.call(this, data, password, sMsg);
        } catch (e) {
            console.error('deserialize content error', e);
            return null;
        }
    };

    //
    //  Interfaces for Sending Commands
    //
    CommonMessenger.prototype.queryMeta = function (identifier) {
        console.assert(false, 'implement me!');
        return false;
    };
    CommonMessenger.prototype.queryDocument = function (identifier, type) {
        console.assert(false, 'implement me!');
        return false;
    };
    CommonMessenger.prototype.queryGroupInfo = function (group, members) {
        console.assert(false, 'implement me!');
        return false;
    };

    //
    //  Events
    //
    CommonMessenger.prototype.onConnected = function () {
        console.log('connected');
    };

    //-------- namespace --------
    ns.CommonMessenger = CommonMessenger;

    ns.registers('CommonMessenger');

})(SECHAT, DIMSDK);

//! require 'protocol/search.js'
//! require 'protocol/report.js'
//! require 'cpu/receipt.js'
//! require 'cpu/mute.js'
//! require 'cpu/block.js'
//! require 'cpu/default.js'

(function (ns, sdk) {
    'use strict';

    var Command = sdk.protocol.Command;
    var MuteCommand = sdk.protocol.MuteCommand;
    var BlockCommand = sdk.protocol.BlockCommand;
    var CommandFactory = sdk.core.CommandFactory;
    var ContentProcessor = sdk.cpu.ContentProcessor;
    var CommandProcessor = sdk.cpu.CommandProcessor;

    var SearchCommand = ns.protocol.SearchCommand;
    var ReportCommand = ns.protocol.ReportCommand;
    var AnyContentProcessor = ns.cpu.AnyContentProcessor;
    var ReceiptCommandProcessor = ns.cpu.ReceiptCommandProcessor;
    var MuteCommandProcessor = ns.cpu.MuteCommandProcessor;
    var BlockCommandProcessor = ns.cpu.BlockCommandProcessor;

    var registerCommandFactories = function () {
        var search = new CommandFactory(SearchCommand);
        Command.register(SearchCommand.SEARCH, search);
        Command.register(SearchCommand.ONLINE_USERS, search);
        var report = new CommandFactory(ReportCommand);
        Command.register(ReportCommand.REPORT, report);
        Command.register(ReportCommand.ONLINE, report);
        Command.register(ReportCommand.OFFLINE, report);
    };

    var registerCommandProcessors = function () {
        CommandProcessor.register(Command.RECEIPT, new ReceiptCommandProcessor());
        CommandProcessor.register(MuteCommand.MUTE, new MuteCommandProcessor());
        CommandProcessor.register(BlockCommand.BLOCK, new BlockCommandProcessor());
    };

    var registerContentProcessors = function () {
        ContentProcessor.register(0, new AnyContentProcessor());
    };

    registerCommandFactories();
    registerCommandProcessors();
    registerContentProcessors();

})(SECHAT, DIMSDK);
;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

    var DocumentCommand = sdk.protocol.DocumentCommand;

    var MessagePacker = sdk.MessagePacker;

    var CommonPacker = function (messenger) {
        MessagePacker.call(this, messenger);
    };
    sdk.Class(CommonPacker, MessagePacker, null);

    // attach key digest
    var attach= function (rMsg) {
        var messenger = this.getMessenger();
        if (!rMsg.getDelegate()) {
            rMsg.setDelegate(messenger);
        }
        if (rMsg.getEncryptedKey()) {
            // 'key' exists
            return;
        }
        var keys = rMsg.getEncryptedKeys();
        if (!keys) {
            keys = {};
        } else if (keys['digest']) {
            // key digest already exists
            return;
        }
        // get key with direction
        var key;
        var sender = rMsg.getSender();
        var group = rMsg.getGroup();
        if (group) {
            key = messenger.getCipherKey(sender, group, false);
        } else {
            var receiver = rMsg.getReceiver();
            key = messenger.getCipherKey(sender, receiver, false);
        }
        if (!key) {
            // broadcast message?
            return;
        }
        // get key data
        var data = key.getData();
        if (!data || data.length === 0) {
            if (key.getAlgorithm() === 'PLAIN') {
                // broadcast message has no key
                return;
            }
            throw new ReferenceError('key data error: ' + key.getMap());
        }
        // get digest
        var part = data.subarray(data.length - 6);
        var digest = sdk.digest.SHA256.digest(part);
        var base64 = sdk.format.Base64.encode(digest);
        keys['digest'] = base64.substr(base64.length - 8);
        rMsg.setValue('keys', keys);
    };
    CommonPacker.prototype.serializeMessage = function (rMsg) {
        attach.call(this, rMsg);
        return MessagePacker.prototype.serializeMessage.call(this, rMsg);
    };
    CommonPacker.prototype.deserializeMessage = function (data) {
        if (!data || data.length < 2) {
            console.error('receive data error', data);
            return null;
        }
        return MessagePacker.prototype.deserializeMessage.call(this, data);
    };

    CommonPacker.prototype.encryptMessage = function (iMsg) {
        var sMsg = MessagePacker.prototype.encryptMessage.call(this, iMsg);
        var receiver = iMsg.getReceiver();
        if (receiver.isGroup()) {
            // reuse group message keys
            var sender = iMsg.getSender();
            var key = this.getMessenger().getCipherKey(sender, receiver, false);
            key.setValue('reused', true);
        }
        // TODO: reuse personal message key?
        return sMsg;
    };
    CommonPacker.prototype.decryptMessage = function (sMsg) {
        try {
            return MessagePacker.prototype.decryptMessage.call(this, sMsg);
        } catch (e) {
            // check exception thrown by DKD: EncryptedMessage.decrypt()
            if (e.toString().indexOf('failed to decrypt key in msg: ') === 0) {
                // visa.key not updated?
                var user = this.getFacebook().getCurrentUser();
                var visa = user.getVisa();
                if (!visa || !visa.isValid()) {
                    // FIXME: user visa not found?
                    throw new ReferenceError('user visa error: ' + user.identifier);
                }
                var cmd = DocumentCommand.response(user.identifier, null, visa);
                this.getMessenger().sendContent(user.identifier, sMsg.getSender(), cmd, null, 0);
            } else {
                // FIXME: message error? cipher text error?
                throw e;
            }
            return null;
        }
    };

    //-------- namespace --------
    ns.CommonPacker = CommonPacker;

    ns.registers('CommonPacker');

})(SECHAT, DIMSDK);
;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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
    var InviteCommand = sdk.protocol.group.InviteCommand;
    var ResetCommand = sdk.protocol.group.ResetCommand;

    var MessageProcessor = sdk.MessageProcessor;

    var CommonProcessor = function (messenger) {
        MessageProcessor.call(this, messenger);
    };
    sdk.Class(CommonProcessor, MessageProcessor, null);

    CommonProcessor.prototype.getFacebook = function () {
        return this.getMessenger().getFacebook();
    };

    // check whether group info empty
    var is_empty = function (group) {
        var facebook = this.getFacebook();
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            return true;
        } else {
            return !facebook.getOwner();
        }
    };
    // check whether need to update group
    var is_waiting_group = function (content, sender) {
        // Check if it is a group message,
        // and whether the group members info needs update
        var group = content.getGroup();
        if (!group || group.isBroadcast()) {
            // 1. personal message
            // 2. broadcast message
            return false;
        }
        // check meta for new group ID
        var messenger = this.getMessenger();
        var facebook = this.getFacebook();
        var meta = facebook.getMeta(group);
        if (!meta) {
            // NOTICE: if meta for group not found,
            //         facebook should query it from DIM network automatically
            // TODO: insert the message to a temporary queue to wait meta
            //throw new NullPointerException("group meta not found: " + group);
            return true;
        }
        // query group info
        if (is_empty.call(this, group)) {
            // NOTICE: if the group info not found, and this is not an 'invite' command
            //         query group info from the sender
            if (content instanceof InviteCommand || content instanceof ResetCommand) {
                // FIXME: can we trust this stranger?
                //        may be we should keep this members list temporary,
                //        and send 'query' to the owner immediately.
                // TODO: check whether the members list is a full list,
                //       it should contain the group owner(owner)
                return false;
            } else {
                return messenger.queryGroupInfo(group, sender);
            }
        } else if (facebook.containsMember(sender, group)
            || facebook.containsAssistant(sender, group)
            || facebook.isOwner(sender, group)) {
            // normal membership
            return false;
        } else {
            var ok1 = false, ok2 = false;
            // query from group
            var owner = facebook.getOwner(group);
            if (owner) {
                ok1 = messenger.queryGroupInfo(group, owner);
            }
            // if assistants exist, query them
            var assistants = facebook.getAssistants(group);
            if (assistants && assistants.length > 0) {
                ok2 = messenger.queryGroupInfo(group, assistants);
            }
            return ok1 && ok2;
        }
    };

    CommonProcessor.prototype.processContent = function (content, rMsg) {
        var sender = rMsg.getSender();
        if (is_waiting_group.call(this, content, sender)) {
            // save this message in a queue to wait group meta response
            var group = content.getGroup();
            rMsg.setValue("waiting", group.toString());
            this.getMessenger().suspendMessage(rMsg);
            return null;
        }
        try {
            return MessageProcessor.prototype.processContent.call(this, content, rMsg);
        } catch (e) {
            var text = e.toString();
            if (text.indexOf('failed to get meta for ') >= 0) {
                var pos = text.indexOf(': ');
                if (pos > 0) {
                    var waiting = ID.parse(text.substr(pos + 2));
                    if (waiting) {
                        rMsg.setValue('waiting', waiting.toString());
                        this.getMessenger().suspendReliableMessage(rMsg);
                    } else {
                        throw new SyntaxError('failed to get ID: ' + text);
                    }
                }
            }
            return null;
        }
    };

    //-------- namespace --------
    ns.CommonProcessor = CommonProcessor;

    ns.registers('CommonProcessor');

})(SECHAT, DIMSDK);
;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

    var MessageTransmitter = sdk.MessageTransmitter;

    var CommonTransmitter = function (messenger) {
        MessageTransmitter.call(this, messenger);
    };
    sdk.Class(CommonTransmitter, MessageTransmitter, null);

    CommonTransmitter.prototype.sendInstantMessage = function(iMsg, callback, priority) {
        var messenger = this.getMessenger();
        // do the encryption in background thread
        setTimeout(function () {
            // Send message (secured + certified) to target station
            var sMsg = messenger.encryptMessage(iMsg);
            if (sMsg == null) {
                // public key not found?
                return false;
                //throw new ReferenceError("failed to encrypt message: " + iMsg.getMap());
            }
            var rMsg = messenger.signMessage(sMsg);
            if (rMsg == null) {
                // TODO: set iMsg.state = error
                throw new ReferenceError("failed to sign message: " + sMsg.getMap());
            }

            var OK = messenger.sendReliableMessage(rMsg, callback, priority);
            // TODO: if OK, set iMsg.state = sending; else set iMsg.state = waiting

            return messenger.saveMessage(iMsg) && OK;
        }, 128);
    };

    //-------- namespace --------
    ns.CommonTransmitter = CommonTransmitter;

    ns.registers('CommonTransmitter');

})(SECHAT, DIMSDK);
