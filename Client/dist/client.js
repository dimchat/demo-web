;
//! require <sdk.js>
//! require <common.js>

(function (ns, sdk) {
    'use strict';

    // CONSTANTS
    ns.kNotificationServerStateChanged     = 'ServerStateChanged';
    ns.kNotificationStationConnecting      = 'StationConnecting';
    ns.kNotificationStationConnected       = 'StationConnected';
    ns.kNotificationStationError           = 'StationError';

    ns.kNotificationServiceProviderUpdated = 'ServiceProviderUpdated';

    ns.kNotificationMetaAccepted           = 'MetaAccepted';
    ns.kNotificationDocumentUpdated        = 'DocumentUpdated';

    ns.kNotificationContactsUpdated        = 'ContactsUpdated';
    ns.kNotificationMembersUpdated         = 'MembersUpdated';
    ns.kNotificationGroupRemoved           = 'GroupRemoved';

    ns.kNotificationMessageUpdated         = 'MessageUpdated';

    //-------- namespace --------
    if (typeof ns.model !== 'object') {
        ns.model = new sdk.Namespace();
    }

    ns.registers('model');

})(SECHAT, DIMSDK);
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

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var CommandProcessor = sdk.cpu.CommandProcessor;

    /**
     *  Handshake Command Processor
     */
    var HandshakeCommandProcessor = function () {
        CommandProcessor.call(this);
    };
    sdk.Class(HandshakeCommandProcessor, CommandProcessor, null);

    var success = function () {
        console.log('handshake success!')
        var messenger = this.getMessenger();
        var server = messenger.getCurrentServer();
        server.handshakeAccepted();
        return null;
    };

    var restart = function (session) {
        console.log('handshake again', session);
        var messenger = this.getMessenger();
        var server = messenger.getCurrentServer();
        server.handshake(session);
        return null;
    };

    // Override
    HandshakeCommandProcessor.prototype.execute = function (cmd, rMsg) {
        var message = cmd.getMessage();
        if (message === 'DIM!' || message === 'OK!') {
            // S -> C
            return success.call(this);
        } else if (message === 'DIM?') {
            // S -> C
            return restart.call(this, cmd.getSessionKey());
        } else {
            // C -> S: Hello world!
            throw new Error('handshake command error: ' + cmd);
        }
    };

    //-------- namespace --------
    ns.cpu.HandshakeCommandProcessor = HandshakeCommandProcessor;

    ns.cpu.registers('HandshakeCommandProcessor')

})(SECHAT, DIMSDK);
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

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var CommandProcessor = sdk.cpu.CommandProcessor;

    /**
     *  Login Command Processor
     */
    var LoginCommandProcessor = function () {
        CommandProcessor.call(this);
    };
    sdk.Class(LoginCommandProcessor, CommandProcessor, null);

    // Override
    LoginCommandProcessor.prototype.execute = function (cmd, rMsg) {
        // no need to response login command
        return null;
    };

    //-------- namespace --------
    ns.cpu.LoginCommandProcessor = LoginCommandProcessor;

    ns.cpu.registers('LoginCommandProcessor')

})(SECHAT, DIMSDK);
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

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;
    var Meta = sdk.protocol.Meta;

    var CommandProcessor = sdk.cpu.CommandProcessor;
    var NotificationCenter = sdk.lnc.NotificationCenter;

    var SearchCommand = ns.protocol.SearchCommand;

    /**
     *  Search Command Processor
     */
    var SearchCommandProcessor = function () {
        CommandProcessor.call(this);
    };
    sdk.Class(SearchCommandProcessor, CommandProcessor, null);

    var user_info = function (string, facebook) {
        var identifier = ID.parse(string);
        if (!identifier) {
            return string;
        }
        var nickname = facebook.getNickname(identifier);
        return identifier + ' "' + nickname + '"';
    };

    // @Override
    SearchCommandProcessor.prototype.execute = function (cmd, rMsg) {
        var facebook = this.getFacebook();
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

        var results = cmd.getResults();
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

        cmd.setValue('text', text);

        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMessageUpdated, this, {
            'envelope': rMsg.getEnvelope(),
            'content': cmd
        });
        return null;
    };

    //-------- namespace --------
    ns.cpu.SearchCommandProcessor = SearchCommandProcessor;

    ns.cpu.registers('SearchCommandProcessor')

})(SECHAT, DIMSDK);
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

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var StorageCommand = sdk.protocol.StorageCommand;
    var CommandProcessor = sdk.cpu.CommandProcessor;

    /**
     *  Storage Command Processor
     */
    var StorageCommandProcessor = function () {
        CommandProcessor.call(this);
    };
    sdk.Class(StorageCommandProcessor, CommandProcessor, null);

    // Override
    StorageCommandProcessor.prototype.execute = function (cmd, rMsg) {
        var title = cmd.getTitle();
        if (title === StorageCommand.CONTACTS) {
            // process contacts
        } else if (title === StorageCommand.PRIVATE_KEY) {
            // process private key
        }
        return null;
    };

    //-------- namespace --------
    ns.cpu.StorageCommandProcessor = StorageCommandProcessor;

    ns.cpu.registers('StorageCommandProcessor')

})(SECHAT, DIMSDK);
;
//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var ReceiptCommand = sdk.protocol.ReceiptCommand;

    /**
     *  Conversation pool to manage conversation instances
     *
     *      1st, get instance here to avoid create same instance,
     *      2nd, if their history was updated, we can notice them here immediately
     *
     * @constructor
     */
    ns.Amanuensis = {

        /**
         *  Conversation factory
         *
         * @param {ID|*} identifier
         * @returns {Conversation}
         */
        getConversation: function (identifier) {
            var facebook = ns.Facebook.getInstance();
            // create directly if we can find the entity
            var entity = null;
            if (identifier.isUser()) {
                entity = facebook.getUser(identifier);
            } else if (identifier.isGroup()) {
                entity = facebook.getGroup(identifier);
            }
            if (!entity) {
                return null;
            }
            var chatBox = new ns.Conversation(entity);
            chatBox.database = ns.ConversationDatabase.getInstance();
            return chatBox;
        },

        // allConversations: function () {
        //     var list = [];
        //     var dict = this.__conversations;
        //     var keys = Object.keys(dict);
        //     var chat;
        //     for (var i = 0; i < keys.length; ++i) {
        //         chat = dict[keys[i]];
        //         if (chat instanceof Conversation) {
        //             list.push(chat);
        //         }
        //     }
        //     return list;
        // },
        //
        // addConversation: function (conversation) {
        //     if (!conversation.delegate) {
        //         conversation.delegate = this.__delegate;
        //     }
        //     if (!conversation.dataSource) {
        //         conversation.dataSource = this.__dataSource;
        //     }
        //     var identifier = conversation.getIdentifier();
        //     this.__conversations[identifier] = conversation;
        // },
        //
        // removeConversation: function (conversation) {
        //     var identifier = conversation.getIdentifier();
        //     delete this.__conversations[identifier];
        // },

        /**
         *  Save received message
         *
         * @param {InstantMessage|*} iMsg
         * @returns {boolean}
         */
        saveMessage: function (iMsg) {
            if (iMsg.getContent() instanceof ReceiptCommand) {
                // it's a receipt
                return this.saveReceipt(iMsg);
            }
            var chatBox = get_conversation.call(this, iMsg);
            if (chatBox) {
                return chatBox.insertMessage(iMsg);
            } else {
                // throw new Error('conversation not found for message: ' + iMsg);
                return false;
            }
        },

        /**
         *  Update message state with receipt
         *
         * @param {InstantMessage|*} iMsg
         * @returns {boolean}
         */
        saveReceipt: function (iMsg) {
            var chatBox = get_conversation.call(this, iMsg);
            if (chatBox) {
                return chatBox.saveReceipt(iMsg);
            } else {
                // throw new Error('conversation not found for message: ' + iMsg);
                return false;
            }

            // var target = message_matches_receipt(receipt, chat);
            // if (target) {
            //     var text = receipt.getMessage();
            //     if (sender.equals(receiver)) {
            //         // the receiver's client feedback
            //         if (text && text.indexOf('read')) {
            //             target.getContent().setValue('state', 'read')
            //         } else {
            //             target.getContent().setValue('state', 'arrived')
            //         }
            //     } else if (NetworkType.STATION.equals(sender.getType())) {
            //         // delivering or delivered to receiver (station said)
            //         if (text && text.indexOf('delivered')) {
            //             target.getContent().setValue('state', 'delivered')
            //         } else {
            //             target.getContent().setValue('state', 'delivering')
            //         }
            //     } else {
            //         throw new Error('unexpect receipt sender: ' + sender);
            //     }
            //     return true;
            // }
            // console.log('target message not found for receipt', receipt);
        }
    };

    var get_conversation = function (iMsg) {
        // check receiver
        var receiver = iMsg.getReceiver();
        if (receiver.isGroup()) {
            // group chat, get chat box with group ID
            return this.getConversation(receiver);
        }
        // check group
        var group = iMsg.getGroup();
        if (group) {
            // group chat, get chat box with group ID
            return this.getConversation(group);
        }
        // personal chat, get chat box with contact ID
        var facebook = ns.Facebook.getInstance();
        var sender = iMsg.getSender();
        var user = facebook.getCurrentUser();
        if (sender.equals(user.identifier)) {
            return this.getConversation(receiver);
        } else {
            return this.getConversation(sender);
        }
    };

    // var message_matches_receipt = function (receipt, conversation) {
    //     var iMsg;
    //     var count = conversation.getMessageCount();
    //     for (var index = count - 1; index >= 0; --index) {
    //         iMsg = conversation.getMessage(index);
    //         if (is_receipt_match(receipt, iMsg)) {
    //             return iMsg;
    //         }
    //     }
    //     return null;
    // };
    // var is_receipt_match = function (receipt, iMsg) {
    //     // check signature
    //     var sig1 = receipt.getValue('signature');
    //     var sig2 = iMsg.getValue('signature');
    //     if (sig1 && sig2 && sig1.length >= 8 && sig2.length >= 8) {
    //         // if contains signature, check it
    //         return sig1.substring(0, 8) === sig2.substring(0, 8);
    //     }
    //
    //     // check envelope
    //     var env1 = receipt.getEnvelope();
    //     var env2 = iMsg.envelope;
    //     if (env1) {
    //         // if contains envelope, check it
    //         return env1.equals(env2);
    //     }
    //
    //     // check serial number
    //     // (only the original message's receiver can know this number)
    //     return receipt.sn === iMsg.content.sn;
    // };

})(SECHAT, DIMSDK);
;
//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;
    var ForwardContent = sdk.protocol.ForwardContent;
    var HandshakeCommand = sdk.protocol.HandshakeCommand;
    var ReceiptCommand = sdk.protocol.ReceiptCommand;
    var LoginCommand = sdk.protocol.LoginCommand;
    var MetaCommand = sdk.protocol.MetaCommand;
    var MuteCommand = sdk.protocol.MuteCommand;
    var BlockCommand = sdk.protocol.BlockCommand;
    var InviteCommand = sdk.protocol.group.InviteCommand;
    var QueryCommand = sdk.protocol.group.QueryCommand;

    var ReportCommand = ns.protocol.ReportCommand;
    var SearchCommand = ns.protocol.SearchCommand;

    var NotificationCenter = sdk.lnc.NotificationCenter;

    var get_messenger = function () {
        return ns.Messenger.getInstance();
    };
    var get_facebook = function () {
        return ns.Facebook.getInstance();
    };

    /**
     *  Message DataSource
     *  ~~~~~~~~~~~~~~~~~~
     *
     *  implements Messenger.DataSource, Observer
     */
    var MessageDataSource = {

        onReceiveNotification: function (notification) {
            var name = notification.name;
            if (name !== ns.kNotificationMetaAccepted && name !== ns.kNotificationDocumentUpdated) {
                return;
            }
            var info = notification.userInfo;
            var messenger = get_messenger();
            var facebook = get_facebook();

            var entity = ID.parse(info['ID']);
            if (entity.isUser()) {
                // check user
                if (!facebook.getPublicKeyForEncryption(entity)) {
                    console.error('user not ready yet: ' + entity);
                    return;
                }
            }
            // processing income messages
            var incoming = this.__incoming[entity];
            if (incoming) {
                delete this.__incoming[entity];
                var item, res;
                for (var i = 0; i < incoming.length; ++i) {
                    item = incoming[i];
                    res = messenger.processReliableMessage(item);
                    if (res) {
                        messenger.sendReliableMessage(res, null, 1);
                    }
                }
            }
            // processing outgoing message
            var outgoing = this.__outgoing[entity];
            if (outgoing) {
                delete this.__outgoing[entity];
                for (var j = 0; j < outgoing.length; ++j) {
                    messenger.sendInstantMessage(outgoing[j], null, 1);
                }
            }
        },

        //
        //  Messenger DataSource
        //
        saveMessage: function (iMsg) {
            var content = iMsg.getContent();
            // TODO: check message type
            //       only save normal message and group commands
            //       ignore 'Handshake', ...
            //       return true to allow responding

            if (content instanceof HandshakeCommand) {
                // handshake command will be processed by CPUs
                // no need to save handshake command here
                return true;
            }
            if (content instanceof ReportCommand) {
                // report command is sent to station,
                // no need to save report command here
                return true;
            }
            if (content instanceof LoginCommand) {
                // login command will be processed by CPUs
                // no need to save login command here
                return true;
            }
            if (content instanceof MetaCommand) {
                // meta & document command will be checked and saved by CPUs
                // no need to save meta & document command here
                return true;
            }
            if (content instanceof MuteCommand || content instanceof BlockCommand) {
                // TODO: create CPUs for mute & block command
                // no need to save mute & block command here
                return true;
            }
            if (content instanceof SearchCommand) {
                // search result will be parsed by CPUs
                // no need to save search command here
                return true;
            }
            if (content instanceof ForwardContent) {
                // forward content will be parsed, if secret message decrypted, save it
                // no need to save forward content itself
                return true;
            }

            if (content instanceof InviteCommand) {
                // send keys again
                var me = iMsg.getReceiver();
                var group = content.getGroup();
                var messenger = get_messenger();
                var key = messenger.getCipherKeyDelegate().getCipherKey(me, group, false);
                if (key != null) {
                    //key.put("reused", null);
                    key.remove("reused");
                }
            }
            if (content instanceof QueryCommand) {
                // FIXME: same query command sent to different members?
                return true;
            }

            var clerk = ns.Amanuensis.getInstance();

            if (content instanceof ReceiptCommand) {
                return clerk.saveReceipt(iMsg);
            } else {
                return clerk.saveMessage(iMsg);
            }
        },

        suspendInstantMessage: function (iMsg) {
            // save this message in a queue waiting receiver's meta response
            var waiting = ID.parse(iMsg.getValue("waiting"));
            if (waiting == null) {
                waiting = iMsg.getGroup();
                if (waiting == null) {
                    waiting = iMsg.getSender();
                }
            } else {
                iMsg.remove("waiting");
            }
            var list = this.__outgoing[waiting];
            if (!list) {
                list = [];
                this.__outgoing[waiting] = list;
            }
            list.push(iMsg);
        },

        suspendReliableMessage: function (rMsg) {
            // save this message in a queue waiting sender's meta response
            var waiting = ID.parse(rMsg.getValue("waiting"));
            if (!waiting) {
                waiting = rMsg.getGroup();
                if (waiting == null) {
                    waiting = rMsg.getSender();
                }
            } else {
                rMsg.remove("waiting");
            }
            var list = this.__incoming[waiting];
            if (!list) {
                list = [];
                this.__incoming[waiting] = list;
            }
            list.push(rMsg);
        },

        __outgoing: {},  // ID => Array<InstantMessage>
        __incoming: {}  // ID => Array<ReliableMessage>
    };

    var nc = NotificationCenter.getInstance();
    nc.addObserver(MessageDataSource, ns.kNotificationMetaAccepted);
    nc.addObserver(MessageDataSource, ns.kNotificationDocumentUpdated);

    ns.MessageDataSource = MessageDataSource;

})(SECHAT, DIMSDK);
;
//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;

    ns.Configuration = {

        getDefaultProvider: function () {
            // TODO: load config from 'gsp.js'
            return this.__sp;
        },

        getDefaultContacts: function () {
            // TODO: load config from 'gsp.js'
            var info = this.__sp;
            var array = info.get("contacts");
            if (array) {
                return ID.convert(array);
            } else {
                return null;
            }
        },

        getUploadURL: function () {
            return 'https://sechat.dim.chat/{ID}}/upload';
        },

        getDownloadURL: function () {
            return 'https://sechat.dim.chat/download/{ID}/{filename}';
        },

        getAvatarURL: function () {
            return 'https://sechat.dim.chat/avatar/{ID}/{filename}';
        },

        getTermsURL: function () {
            return 'https://wallet.dim.chat/dimchat/sechat/privacy.html';
        },

        getAboutURL: function () {
            // return 'https://sechat.dim.chat/support';
            return 'https://dim.chat/sechat';
        },

        __sp: null
    };

})(SECHAT, DIMSDK);
;
//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var NetworkType = sdk.protocol.NetworkType;
    var ContentType = sdk.protocol.ContentType;
    var Entity = sdk.Entity;

    var get_facebook = function () {
        return ns.Facebook.getInstance();
    };
    var get_database = function () {
        return ns.ConversationDatabase.getInstance();
    };

    var ConversationType = sdk.type.Enum(null, {
        Personal: (NetworkType.MAIN),
        Group: (NetworkType.GROUP)
    });

    var Conversation = function (entity) {
        if (entity instanceof Entity) {
            entity = entity.identifier;
        }
        this.identifier = entity;
        this.type = get_type(entity);
    };

    var get_type = function (identifier) {
        if (identifier.isUser()) {
            return ConversationType.Personal;
        } else if (identifier.isGroup()) {
            return ConversationType.Group;
        } else {
            throw new TypeError('conversation type error: ' + identifier);
        }
    };

    Conversation.prototype.getTitle = function () {
        var facebook = get_facebook();
        var name = facebook.getName(this.identifier);
        if (this.identifier.isGroup()) {
            var members = facebook.getMembers(this.identifier);
            if (members && members.length > 0) {
                // Group: 'name (123)'
                return name + ' (' + members.length + ')';
            } else {
                return name + ' (...)';
            }
        } else {
            // Person: 'name'
            return name;
        }
    };

    Conversation.prototype.getLastTime = function () {
        var iMsg = this.getLastMessage();
        if (iMsg) {
            return iMsg.getTime();
        } else {
            return new Date(0);
        }
    };

    Conversation.prototype.getLastMessage = function () {
        return get_database().lastMessage(this.identifier);
    };
    Conversation.prototype.getLastVisibleMessage = function () {
        var count = this.getNumberOfMessages();
        var iMsg, type;
        for (var index = count - 1; index >= 0; --index) {
            iMsg = this.getMessageAtIndex(index);
            if (!iMsg) {
                // error
                continue;
            }
            type = iMsg.getType();
            if (ContentType.TEXT.equals(type) ||
                ContentType.FILE.equals(type) ||
                ContentType.IMAGE.equals(type) ||
                ContentType.AUDIO.equals(type) ||
                ContentType.VIDEO.equals(type) ||
                ContentType.PAGE.equals(type) ||
                ContentType.MONEY.equals(type) ||
                ContentType.TRANSFER.equals(type)) {
                // got it
                return iMsg;
            }
        }
        return null;
    };

    Conversation.prototype.getNumberOfMessages = function () {
        return get_database().numberOfMessages(this.identifier);
    };
    Conversation.prototype.getNumberOfUnreadMessages = function () {
        return get_database().numberOfUnreadMessages(this.identifier);
    };

    Conversation.prototype.getMessageAtIndex = function (index) {
        return get_database().messageAtIndex(index, this.identifier);
    };

    Conversation.prototype.insertMessage = function (iMsg) {
        return get_database().insertMessage(iMsg, this.identifier);
    };

    Conversation.prototype.removeMessage = function (iMsg) {
        return get_database().removeMessage(iMsg, this.identifier);
    };

    Conversation.prototype.withdrawMessage = function (iMsg) {
        return get_database().withdrawMessage(iMsg, this.identifier);
    };

    Conversation.prototype.saveReceipt = function (iMsg) {
        return get_database().saveReceipt(iMsg, this.identifier);
    };

    //-------- namespace --------
    ns.Conversation = Conversation;

    ns.registers('Conversation');

})(SECHAT, DIMSDK);
;
//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var Entity = sdk.Entity;
    var NotificationCenter = sdk.lnc.NotificationCenter;

    var get_facebook = function () {
        return ns.Facebook.getInstance();
    };

    ns.ConversationDatabase = {

        getName: function (identifier) {
            return get_facebook().getName(identifier);
        },

        getTimeString: function (msg) {
            var time = msg.getTime();
            if (!time) {
                time = new Date(0);
            }
            var yyyy = time.getFullYear();
            var mm = time.getMonth() + 1;
            var dd = time.getDate();
            var hh = time.getHours();
            var MM = time.getMinutes();
            var ss = time.getSeconds();
            return yyyy + '/' + mm + '/' + dd + ' ' + hh + ':' + MM + ':' + ss;
        },

        //
        //  ConversationDataSource
        //
        numberOfConversations: function () {
            return this.messageTable.numberOfConversations();
        },
        conversationAtIndex: function (index) {
            return this.messageTable.conversationAtIndex(index);
        },
        removeConversationAtIndex: function (index) {
            var chat = this.messageTable.conversationAtIndex(index);
            if (!this.messageTable.removeConversationAtIndex(index)) {
                return false;
            }
            post_updated(null, chat);
            return true;
        },
        removeConversation: function (chat) {
            chat = get_id(chat);
            if (!this.messageTable.removeConversation(chat)) {
                return false;
            }
            post_updated(null, chat);
            return true;
        },
        clearConversation: function (chat) {
            chat = get_id(chat);
            if (!this.messageTable.removeConversation(chat)) {
                return false;
            }
            post_updated(null, chat);
            return true;
        },

        //
        //  Messages
        //
        numberOfMessages: function (chat) {
            chat = get_id(chat);
            return this.messageTable.numberOfMessages(chat);
        },
        numberOfUnreadMessages: function (chat) {
            chat = get_id(chat);
            return this.messageTable.numberOfUnreadMessages(chat);
        },
        clearUnreadMessages: function (chat) {
            chat = get_id(chat);
            return this.messageTable.numberOfUnreadMessages(chat);
        },
        lastMessage: function (chat) {
            chat = get_id(chat);
            return this.messageTable.lastMessage(chat);
        },
        lastReceivedMessage: function () {
            var user = get_facebook().getCurrentUser();
            if (!user) {
                return null;
            }
            return this.messageTable.lastReceivedMessage(user.identifier);
        },
        messageAtIndex: function (index, chat) {
            chat = get_id(chat);
            return this.messageTable.messageAtIndex(index, chat);
        },

        insertMessage: function (iMsg, chat) {
            chat = get_id(chat);
            var ok = this.messageTable.insertMessage(iMsg, chat);
            if (ok) {
                post_updated(iMsg, chat);
            }
            return ok;
        },
        removeMessage: function (iMsg, chat) {
            chat = get_id(chat);
            var ok = this.messageTable.removeMessage(iMsg, chat);
            if (ok) {
                post_updated(iMsg, chat);
            }
            return ok;
        },
        withdrawMessage: function (iMsg, chat) {
            chat = get_id(chat);
            var ok = this.messageTable.withdrawMessage(iMsg, chat);
            if (ok) {
                post_updated(iMsg, chat);
            }
            return ok;
        },

        saveReceipt: function (iMsg, chat) {
            chat = get_id(chat);
            var ok = this.messageTable.saveReceipt(iMsg, chat);
            if (ok) {
                // FIXME: check for origin conversation
                if (chat.isUser()) {
                    var receipt = iMsg.getContent();
                    var env = receipt.getEnvelope();
                    if (env) {
                        var sender = env.getSender();
                        if (sender && sender.equals(iMsg.getReceiver())) {
                            chat = env.getReceiver();
                        }
                    }
                }
                post_updated(iMsg, chat);
            }
            return ok;
        },

        messageTable: ns.db.MessageTable
    };

    var get_id = function (chatBox) {
        if (chatBox instanceof ns.Conversation) {
            return chatBox.identifier;
        } else if (chatBox instanceof Entity) {
            return chatBox.identifier;
        } else {
            return chatBox;
        }
    }

    var post_updated = function (iMsg, identifier) {
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMessageUpdated, this, {
            'ID': identifier,
            'msg': iMsg
        });
    };

})(SECHAT, DIMSDK);
;
//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;
    var NotificationCenter = sdk.lnc.NotificationCenter;

    ns.NetworkDatabase = {

        /**
         *  Get all service providers
         *
         * @return {[]} provider info list
         */
        allProviders: function () {
            // check providers
            var providers = this.providerTable.getProviders();
            if (providers && providers.length > 0) {
                return providers;
            } else {
                return [default_provider()];
            }
        },

        /**
         *  Save provider
         *
         * @param {ID} identifier - provider ID
         * @param {String} name - provider name
         * @param {String} url - config URL
         * @param {int} chosen - set to first provider
         * @return {boolean} true on success
         */
        addProvider: function (identifier, name, url, chosen) {
            return this.providerTable.addProvider(identifier, name, url, chosen);
        },

        //-------- Station

        /**
         *  Get all stations under the service provider
         *
         * @param {ID} sp - sp ID
         * @return {[]} station info list
         */
        allStations: function (sp) {
            return this.providerTable.getStations(sp);
        },

        /**
         *  Save station info for the service provider
         *
         * @param {ID} sp - sp ID
         * @param {ID} station - station ID
         * @param {String} host - station host
         * @param {uint} port - station port
         * @param {String} name - station name
         * @param {int} chosen - set to first provider
         * @return {boolean} true on success
         */
        addStation: function (sp, station, host, port, name, chosen) {
            if (!this.providerTable.addStation(sp, station, host, port, name, chosen)) {
                return false;
            }
            var nc = NotificationCenter.getInstance();
            nc.postNotification(ns.kNotificationServiceProviderUpdated, this, {
                'sp': sp,
                'action': 'add',
                'station': station,
                'chosen': chosen
            });
            return true;
        },

        chooseStation: function (sp, station) {
            if (!this.providerTable.chooseStation(sp, station)) {
                return false;
            }
            var nc = NotificationCenter.getInstance();
            nc.postNotification(ns.kNotificationServiceProviderUpdated, this, {
                'sp': sp,
                'action': 'switch',
                'station': station,
                'chosen': 1
            });
            return true;
        },
        removeStation: function (sp, station, host, port) {
            if (!this.providerTable.removeStation(sp, station)) {
                return false;
            }
            var nc = NotificationCenter.getInstance();
            nc.postNotification(ns.kNotificationServiceProviderUpdated, this, {
                'sp': sp,
                'action': 'remove',
                'station': station,
                'host': host,
                'port': port
            });
            return true;
        },

        providerTable: null
    };

    var default_provider = function () {
        // TODO: get default provider
        return null
    };

})(SECHAT, DIMSDK);
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

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var StationDelegate = function () {
    };
    sdk.Interface(StationDelegate, null);

    /**
     *  Received a new data package from the station
     *
     * @param {Uint8Array} data - data package received
     * @param {Station} server - current station
     */
    StationDelegate.prototype.onReceivePackage = function (data, server) {
        console.assert(false, 'implement me!');
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Send data package to station success
     *
     * @param {Uint8Array} data - data package received
     * @param {Station} server - current station
     */
    StationDelegate.prototype.didSendPackage = function (data, server) {
        console.assert(false, 'implement me!');
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Failed to send data package to station
     *
     * @param {Error} error
     * @param {Uint8Array} data - data package received
     * @param {Station} server - current station
     */
    StationDelegate.prototype.didFailToSendPackage = function (error, data, server) {
        console.assert(false, 'implement me!');
    };

    /**
     *  Callback for handshake accepted
     *
     * @param {String} session - new session key
     * @param {Station} server - current station
     */
    StationDelegate.prototype.onHandshakeAccepted = function (session, server) {
        console.assert(false, 'implement me!');
    };

    //-------- namespace --------
    ns.network.StationDelegate = StationDelegate;

    ns.network.registers('StationDelegate');

})(SECHAT, DIMSDK);
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

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var State = sdk.fsm.State;

    /**
     *  Server state
     */
    var ServerState = function(name) {
        State.call(this);
        this.name = name;
        this.time = null;  // enter time
    };
    sdk.Class(ServerState, State, null);

    //-------- state names --------
    ServerState.DEFAULT     = 'default';
    ServerState.CONNECTING  = 'connecting';
    ServerState.CONNECTED   = 'connected';
    ServerState.HANDSHAKING = 'handshaking';
    ServerState.RUNNING     = 'running';
    ServerState.ERROR       = 'error';

    ServerState.prototype.equals = function (state) {
        if (state instanceof ServerState) {
            return this.name === state.name;
        } else if (typeof state === 'string') {
            return this.name === state;
        } else {
            throw new Error('state error: ' + state);
        }
    };

    ServerState.prototype.toString = function () {
        return '<ServerState:' + this.name + '>';
    };
    ServerState.prototype.toLocaleString = function () {
        return '<ServerState:' + this.name.toLocaleString() + '>';
    };

    ServerState.prototype.onEnter = function(machine) {
        console.assert(machine !== null, "machine empty");
        console.log('onEnter: ', this);
        this.time = new Date();
    };
    ServerState.prototype.onExit = function(machine) {
        console.assert(machine !== null, "machine empty");
        this.time = null;
    };

    //-------- namespace --------
    ns.network.ServerState = ServerState;

    ns.network.registers('ServerState');

})(SECHAT, DIMSDK);

(function (ns, sdk) {
    'use strict';

    var Transition = sdk.fsm.Transition;
    var AutoMachine = sdk.fsm.AutoMachine;
    var Gate = sdk.startrek.Gate;

    var ServerState = ns.network.ServerState;

    /**
     *  Server state machine
     */
    var StateMachine = function(server) {
        AutoMachine.call(this, ServerState.DEFAULT);

        this.setDelegate(server);
        this.__session = null;  // session key

        // add states
        set_state.call(this, default_state());
        set_state.call(this, connecting_state());
        set_state.call(this, connected_state());
        set_state.call(this, handshaking_state());
        set_state.call(this, running_state());
        set_state.call(this, error_state());
    };
    sdk.Class(StateMachine, AutoMachine, null);

    var set_state = function (state) {
        this.addState(state, state.name);
    };

    StateMachine.prototype.getSessionKey = function () {
        return this.__session;
    };
    StateMachine.prototype.setSessionKey = function (session) {
        this.__session = session;
    };

    //
    //  States
    //

    StateMachine.prototype.getCurrentState = function () {
        var state = AutoMachine.prototype.getCurrentState.call(this);
        if (!state) {
            state = this.getState(ServerState.DEFAULT);
        }
        return state;
    };

    var get_server = function (machine) {
        return machine.getDelegate();
    };

    var transition = function (target, evaluate) {
        var trans = new Transition(target);
        trans.evaluate = evaluate;
        return trans;
    };

    var server_state = function (name, transitions) {
        var state = new ServerState(name);
        for (var i = 1; i < arguments.length; ++i) {
            state.addTransition(arguments[i]);
        }
        return state;
    };

    var default_state = function () {
        return server_state(ServerState.DEFAULT,
            // target state: Connecting
            transition(ServerState.CONNECTING, function (machine) {
                var server = get_server(machine);
                if (server && server.getCurrentUser()) {
                    var status = server.getStatus();
                    return status.equals(Gate.Status.CONNECTING)
                        || status.equals(Gate.Status.CONNECTED);
                } else {
                    return false;
                }
            })
        );
    };
    var connecting_state = function () {
        return server_state(ServerState.CONNECTING,
            // target state: Connected
            transition(ServerState.CONNECTED, function (machine) {
                var server = get_server(machine);
                var status = server.getStatus();
                return status.equals(Gate.Status.CONNECTED);
            }),
            // target state: Error
            transition(ServerState.ERROR, function (machine) {
                var server = machine.server;
                var status = server.getStatus();
                return status.equals(Gate.Status.ERROR);
            })
        );
    };
    var connected_state = function () {
        return server_state(ServerState.CONNECTED,
            // target state: Handshaking
            transition(ServerState.HANDSHAKING, function (machine) {
                var server = get_server(machine);
                return server.getCurrentUser();
            })
        );
    };
    var handshaking_state = function () {
        return server_state(ServerState.HANDSHAKING,
            // target state: Running
            transition(ServerState.RUNNING, function (machine) {
                // when current user changed, the server will clear this session, so
                // if it's set again, it means handshake accepted
                return machine.getSessionKey();
            }),
            // target state: Connected
            transition(ServerState.CONNECTED, function (machine) {
                var state = machine.getCurrentState();
                var time = state.time;
                if (time) {
                    var expired = time.getTime() + 120 * 1000;
                    var now = new Date();
                    if (now.getTime() < expired) {
                        // not expired yet
                        return false;
                    }
                } else {
                    // not enter yet
                    return false;
                }
                var server = get_server(machine);
                var status = server.getStatus();
                return status.equals(Gate.Status.CONNECTED);
            }),
            // target state: Error
            transition(ServerState.ERROR, function (machine) {
                var server = get_server(machine);
                var status = server.getStatus();
                return !status.equals(Gate.Status.CONNECTED);
            })
        );
    };
    var running_state = function () {
        return server_state(ServerState.RUNNING,
            // target state: Error
            transition(ServerState.ERROR, function (machine) {
                var server = get_server(machine);
                var status = server.getStatus();
                return !status.equals(Gate.Status.CONNECTED);
            }),
            // target state: Default
            transition(ServerState.DEFAULT, function (machine) {
                var server = get_server(machine);
                // user switched?
                return !server.getSessionKey();
            })
        );
    };
    var error_state = function () {
        return server_state(ServerState.ERROR,
            // target state: Default
            transition(ServerState.DEFAULT, function (machine) {
                var server = get_server(machine);
                var status = server.getStatus();
                return !status.equals(Gate.Status.ERROR);
            })
        );
    };

    //-------- namespace --------
    ns.network.StateMachine = StateMachine;

    ns.network.registers('StateMachine');

})(SECHAT, DIMSDK);
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

//! require 'fsm.js'

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;
    var Envelope = sdk.protocol.Envelope;
    var InstantMessage = sdk.protocol.InstantMessage;
    var HandshakeCommand = sdk.protocol.HandshakeCommand;
    var HandshakeState = sdk.protocol.HandshakeState;

    var NotificationCenter = sdk.lnc.NotificationCenter;
    var StateMachineDelegate = sdk.fsm.Delegate;

    var Ship = sdk.startrek.Ship;
    var Gate = sdk.startrek.Gate;
    var StarShip = sdk.startrek.StarShip;

    var Station = sdk.Station;
    var MessengerDelegate = sdk.MessengerDelegate;
    var MessageTransmitter = sdk.MessageTransmitter;

    var ServerState = ns.network.ServerState;
    var StateMachine = ns.network.StateMachine;

    var get_facebook = function () {
        return ns.Facebook.getInstance();
    };
    var get_messenger = function () {
        return ns.Messenger.getInstance();
    };

    /**
     *  DIM Station
     */
    var Server = function(identifier, host, port) {
        Station.call(this, identifier, host, port);
        this.__delegate = null; // StationDelegate
        // connection state machine
        this.__fsm = new StateMachine(this);
        this.__fsm.start();

        this.__session = new ns.network.Session(host, port, get_messenger());
        this.__sessionKey = null; // session key

        this.__paused = false;
        this.__currentUser = null; // User
    };
    sdk.Class(Server, Station, [MessengerDelegate, StateMachineDelegate]);

    Server.prototype.getDelegate = function () {
        return this.__delegate;
    };
    Server.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate;
    };

    Server.prototype.getCurrentUser = function () {
        return this.__currentUser;
    };
    Server.prototype.setCurrentUser = function (user) {
        if (user.equals(this.__currentUser)) {
            return ;
        }
        this.__currentUser = user;
        // switch state for re-login
        this.__fsm.setSessionKey(null);
    };

    Server.prototype.getCurrentState = function () {
        return this.__fsm.getCurrentState();
    };

    Server.prototype.getStatus = function () {
        return this.__session.gate.getStatus();
    };

    var pack = function (cmd) {
        if (!this.__currentUser) {
            throw new Error('current user not set');
        }
        var sender = this.__currentUser.identifier;
        var receiver = this.identifier;
        var facebook = get_facebook();
        if (!facebook.getPublicKeyForEncryption(receiver)) {
            cmd.setGroup(ID.EVERYONE);
        }
        var messenger = get_messenger();
        var env = Envelope.create(sender, receiver, null);
        var iMsg = InstantMessage.create(env, cmd);
        var sMsg = messenger.encryptMessage(iMsg);
        if (!sMsg) {
            throw new EvalError('failed to encrypt message: ' + iMsg.getMap());
        }
        var rMsg = messenger.signMessage(sMsg);
        if (!rMsg) {
            throw new EvalError('failed to sign message: ' + sMsg.getMap());
        }
        return rMsg;
    };

    //
    //  Urgent command for connection
    //

    var set_last_time = function (cmd) {
        // TODO: set last received message time
    };

    Server.prototype.handshake = function (newSessionKey) {
        if (!this.__currentUser) {
            // current user not set yet
            return;
        }
        // check FSM state == 'Handshaking'
        var state = this.getCurrentState();
        if (!state.equals(ServerState.CONNECTED) && !state.equals(ServerState.HANDSHAKING)) {
            // FIXME: sometimes the connection state will be reset
            console.log('server state not handshaking', state);
            return;
        }
        // check connection state == 'Connected'
        var status = this.getStatus();
        if (!status.equals(Gate.Status.CONNECTED)) {
            // FIXME: sometimes the connection will be lost while handshaking
            console.log('server not connected');
            return;
        }
        if (newSessionKey) {
            this.__sessionKey = newSessionKey;
        }
        this.__fsm.setSessionKey(null);

        // create handshake command
        var cmd = new HandshakeCommand(null, this.__sessionKey);
        set_last_time.call(this, cmd);
        var rMsg = pack.call(this, cmd);
        // first handshake?
        if (cmd.getState().equals(HandshakeState.START)) {
            // [Meta/Visa protocol]
            var meta = this.__currentUser.getMeta();
            var visa = this.__currentUser.getVisa();
            rMsg.setMeta(meta);
            rMsg.setVisa(visa);
        }
        // send out directly
        var data = get_messenger().serializeMessage(rMsg);
        // Urgent command
        this.__session.sendPayload(data, StarShip.URGENT, null);
    };

    Server.prototype.handshakeAccepted = function () {
        // check FSM state == 'Handshaking'
        var state = this.getCurrentState();
        if (!state.equals(ServerState.HANDSHAKING)) {
            // FIXME: sometime the connection state will be reset
            console.log('server state not handshaking', state);
        }
        console.log('handshake accepted for user', this.__currentUser);

        this.__fsm.setSessionKey(this.__sessionKey);

        // call client
        this.getDelegate().onHandshakeAccepted(this.__sessionKey, this);
    };

    //
    //  Entrance
    //

    Server.prototype.start = function () {
        get_messenger().setDelegate(this);

        if (!this.__session.isRunning()) {
            // TODO: post notification 'StationConnecting'
            this.__session.start();
        }

        // TODO: let the subclass to create StarGate?
    };
    Server.prototype.end = function () {
        if (this.__session.isRunning()) {
            this.__session.close();
        }
        this.__fsm.stop();
    };

    Server.prototype.pause = function () {
        if (this.__paused) {
        } else {
            this.__fsm.pause();
            this.__paused = true;
        }
    };
    Server.prototype.resume = function () {
        if (this.__paused) {
            this.__fsm.resume();
            this.__paused = false;
        }
    };

    //
    //  MessengerDelegate
    //

    Server.prototype.sendPackage = function(data, handler, priority) {
        var delegate = null;
        if (handler instanceof MessageTransmitter.CompletionHandler) {
            var callback = handler.callback;
            if (sdk.Interface.conforms(callback, Ship.Delegate)) {
                delegate = callback;
            }
        }
        if (this.__session.sendPayload(data, priority, delegate)) {
            if (handler) {
                handler.onSuccess();
            }
            return true;
        } else {
            if (handler) {
                handler.onFailed(new Error('failed to send data package'));
            }
            return false;
        }
    };

    Server.prototype.uploadData = function (data, iMsg) {
        // TODO: upload onto FTP server
        return null;
    };

    Server.prototype.downloadData = function (url, iMsg) {
        // TODO: download from FTP server
        return null;
    };

    //
    //  StateMachine Delegate
    //

    Server.prototype.enterState = function (state, machine) {
        var info = {
            'state': state.name
        };
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationServerStateChanged, this, info);

        if (state.equals(ServerState.HANDSHAKING)) {
            // start handshake
            var session = this.session;
            this.session = null;
            this.handshake(session);
        } else if (state.equals(ServerState.RUNNING)) {
            // TODO: send all packages waiting
        } else if (state.equals(ServerState.ERROR)) {
            console.error('Station connection error!');
            nc.postNotification(ns.kNotificationStationError, this, null);
        }
    };
    Server.prototype.exitState = function (state, machine) {
    };
    Server.prototype.pauseState = function (state, machine) {
    };
    Server.prototype.resumeState = function (state, machine) {
    };

    //-------- namespace --------
    ns.network.Server = Server;

    ns.network.registers('Server');

})(SECHAT, DIMSDK);
;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
//
//                               Written in 2021 by Moky <albert.moky@gmail.com>
//
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
//! require 'common/network/session.js'

(function (ns, sdk) {
    'use strict';

    var Gate = sdk.startrek.Gate;
    var WSDocker = sdk.stargate.WSDocker;
    var BaseSession = ns.network.BaseSession;

    var Session = function (host, port, messenger) {
        BaseSession.call(this, host, port, messenger);
        this.__docker = new WSDocker(this.gate);
    };
    sdk.Class(Session, BaseSession, null);

    Session.prototype.setup = function () {
        this.gate.setDocker(this.__docker);
        this.setActive(true);
        return BaseSession.prototype.setup.call(this);
    };

    Session.prototype.finish = function () {
        var ok = BaseSession.prototype.finish.call(this);
        this.setActive(false);
        this.gate.setDocker(null);
        return ok;
    };

    Session.prototype.sendPayload = function(payload, priority, delegate) {
        if (this.isActive()) {
            return this.gate.sendPayload(payload, priority, delegate);
        } else {
            return false;
        }
    };

    //
    //  Gate Delegate
    //

    Session.prototype.onGateStatusChanged = function (gate, oldStatus, newStatus) {
        BaseSession.prototype.onGateStatusChanged.call(this, gate, oldStatus, newStatus);
        if (newStatus.equals(Gate.Status.CONNECTED)) {
            var delegate = this.getMessenger().getDelegate();
            if (delegate instanceof ns.network.Server) {
                delegate.handshake(null);
            }
        }
    };

    //-------- namespace --------
    ns.network.Session = Session;

    ns.network.registers('Session');

})(SECHAT, DIMSDK);
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

//! require 'namespace.js'
//! require 'delegate.js'
//! require 'server.js'

(function (ns, sdk) {
    'use strict';

    var get_facebook = function () {
        return ns.Facebook.getInstance();
    };
    var get_messenger = function () {
        return ns.Messenger.getInstance();
    };

    /**
     *  DIM Client
     */
    var Terminal = function() {
        this.__server = null; // current server
        get_messenger().setTerminal(this);
    };
    sdk.Class(Terminal, null, null);

    // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36"
    Terminal.prototype.getUserAgent = function () {
        return navigator.userAgent;
    };

    Terminal.prototype.getCurrentServer = function () {
        return this.__server;
    };

    var set_server = function (server) {
        if (this.__server) {
            if (!server || !this.__server.equals(server)) {
                this.__server.end();
            }
        }
        if (server) {
            server.setDelegate(this);
        }
        this.__server = server;
    };
    var is_new_server = function (host, port) {
        var current = this.__server
        if (current) {
            return current.getPort() !== port || current.getHost() !== host;
        } else {
            return true;
        }
    };

    Terminal.prototype.getCurrentUser = function () {
        if (this.__server) {
            return this.__server.getCurrentUser();
        } else {
            return null;
        }
    };
    // Terminal.prototype.setCurrentUser = function (user) {
    //     if (this.__server) {
    //         this.__server.setCurrentUser(user);
    //     } else {
    //         throw new Error('cannot set current user before station connected')
    //     }
    // };

    var start = function (identifier, host, port) {
        var messenger = get_messenger();
        var facebook = get_facebook();

        // TODO: config FTP server

        // connect server
        var server = this.__server;
        if (is_new_server.call(this, host, port)) {
            // disconnect old server
            set_server.call(this, null);
            // connect new server
            server = new ns.network.Server(identifier, host, port);
            server.setDataSource(facebook);
            server.setDelegate(messenger);
            server.start();
            set_server.call(this, server);
        }

        // get user from database and login
        var user = facebook.getCurrentUser();
        if (user && server) {
            server.setCurrentUser(user);
            server.handshake(null);
        }
    };

    Terminal.prototype.launch = function (options) {
        var identifier = options['ID'];
        var host = options['host'];
        var port = options['port'];
        start.call(this, identifier, host, port);
    };
    Terminal.prototype.terminate = function () {
        set_server.call(this, null);
    };

    // //
    // //  StationDelegate
    // //
    // Terminal.prototype.onReceivePackage = function (data, server) {
    //     if (!data || data.length === 0) {
    //         return;
    //     }
    //     var response = get_messenger().processPackage(data);
    //     if (response) {
    //         server.send(response);
    //     }
    // };
    // Terminal.prototype.didSendPackage = function (data, server) {
    //     // TODO: mark it sent
    // };
    // Terminal.prototype.didFailToSendPackage = function (error, data, server) {
    //     // TODO: resend it
    // };
    // Terminal.prototype.onHandshakeAccepted = function (session, server) {
    //     var messenger = get_messenger();
    //     var facebook = get_facebook();
    //     var user = facebook.getCurrentUser();
    //     // post current profile to station
    //     var profile = user.getProfile();
    //     if (profile) {
    //         messenger.postProfile(profile);
    //     }
    //     // post contacts(encrypted) to station
    //     var contacts = user.getContacts();
    //     if (contacts != null && contacts.length > 0) {
    //         messenger.postContacts(contacts);
    //     }
    //     // broadcast login command
    //     var login = new LoginCommand(user.identifier);
    //     login.setAgent(this.getUserAgent());
    //     login.setStation(server);
    //     // TODO: set provider
    //     messenger.broadcastContent(login);
    // };

    //-------- namespace --------
    ns.network.Terminal = Terminal;

    ns.registers('Terminal');

})(SECHAT, DIMSDK);

(function (ns, sdk) {
    'use strict';

    var Observer = sdk.lnc.Observer;
    var Terminal = ns.network.Terminal;

    var Client = function () {
        Terminal.call(this);
    };
    sdk.Class(Client, Terminal, [Observer]);

    Client.prototype.onReceiveNotification = function(notification) {
        console.log('received notification: ', notification);
    };

    var s_client = null;
    Client.getInstance = function () {
        if (!s_client) {
            s_client = new Client();
        }
        return s_client;
    };

    //-------- namespace --------
    ns.network.Client = Client;

    ns.network.registers('Client');

})(SECHAT, DIMSDK);
;
//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;
    var Visa = sdk.protocol.Visa;

    var NotificationCenter = sdk.lnc.NotificationCenter;

    var CommonFacebook = ns.CommonFacebook;

    var get_messenger = function () {
        return ns.Messenger.getInstance();
    };

    var Facebook = function () {
        CommonFacebook.call(this);
    };
    sdk.Class(Facebook, CommonFacebook, null);

    Facebook.prototype.getAvatar = function (identifier) {
        var doc = this.getDocument(identifier, '*');
        if (doc) {
            if (sdk.Interface.conforms(doc, Visa)) {
                return doc.getAvatar();
            } else {
                return doc.getProperty('avatar');
            }
        }
        return null;
    };

    Facebook.prototype.saveMeta = function(meta, identifier) {
        if (!CommonFacebook.prototype.saveMeta.call(this, meta, identifier)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMetaAccepted, this, {
            'ID': identifier,
            'meta': meta
        });
        return true;
    };

    Facebook.prototype.saveDocument = function(doc) {
        if (!CommonFacebook.prototype.saveDocument.call(this, doc)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationDocumentUpdated, this, doc.getMap());
        return true;
    };

    //
    //  Contacts
    //
    Facebook.prototype.addContact = function(contact, user) {
        if (!CommonFacebook.prototype.addContact.call(this, contact, user)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationContactsUpdated, this, {
            'user': user,
            'contact': contact,
            'action': 'add'
        });
        return true;
    };
    Facebook.prototype.removeContact = function(contact, user) {
        if (!CommonFacebook.prototype.removeContact.call(this, contact, user)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationContactsUpdated, this, {
            'user': user,
            'contact': contact,
            'action': 'remove'
        });
        return true;
    };

    //
    //  Group
    //
    Facebook.prototype.addMember = function (member, group) {
        if (!CommonFacebook.prototype.addMember.call(this, member, group)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMembersUpdated, this, {
            'group': group,
            'member': member,
            'action': 'add'
        });
        return true;
    };
    Facebook.prototype.removeMember = function (member, group) {
        if (!CommonFacebook.prototype.removeMember.call(this, member, group)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMembersUpdated, this, {
            'group': group,
            'member': member,
            'action': 'remove'
        });
        return true;
    };
    Facebook.prototype.saveMembers = function (members, group) {
        if (!CommonFacebook.prototype.saveMembers.call(this, members, group)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMembersUpdated, this, {
            'group': group,
            'members': members,
            'action': 'update'
        });
        return true;
    };
    Facebook.prototype.removeGroup = function (group) {
        if (!CommonFacebook.prototype.removeGroup.call(this, group)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationGroupRemoved, this, {
            'group': group,
            'action': 'remove'
        });
        return true;
    };

    //
    //  Entity DataSource
    //
    Facebook.prototype.getMeta = function(identifier) {
        var meta = CommonFacebook.prototype.getMeta.call(this, identifier);
        if (!meta) {
            if (identifier.isBroadcast()) {
                // broadcast ID has no meta
                return null;
            }
            // query from DIM network
            get_messenger().queryMeta(identifier);
        }
        return meta;
    };

    Facebook.prototype.getDocument = function(identifier, type) {
        var doc = CommonFacebook.prototype.getDocument.call(this, identifier, type);
        if (!doc || this.isExpiredDocument(doc, true)) {
            if (identifier.isBroadcast()) {
                // broadcast ID has no document
                return null;
            }
            // query from DIM network
            get_messenger().queryDocument(identifier, type);
        }
        return doc;
    };

    //
    //  User DataSource
    //
    Facebook.prototype.getContacts = function (user) {
        var contacts = CommonFacebook.prototype.getContacts.call(this, user);
        if (!contacts || contacts.length === 0) {
            // TODO: get default contacts
        }
        return contacts;
    };

    //
    //  Group DataSource
    //
    Facebook.prototype.getMembers = function (group) {
        var members = CommonFacebook.prototype.getMembers.call(this, group);
        if (!members || members.length === 0) {
            // TODO: query from group assistants
            console.log('querying members', group);
            var gm = new ns.GroupManager(group);
            gm.query();
        }
        return members;
    };

    Facebook.prototype.getAssistants = function (group) {
        var assistants = [
            // desktop.dim.chat
            'assistant@4WBSiDzg9cpZGPqFrQ4bHcq4U5z9QAQLHS',
            // dev
            'assistant@2PpB6iscuBjA15oTjAsiswoX9qis5V3c1Dq'
        ];
        return ID.convert(assistants);
    };

    var s_facebook = null;
    Facebook.getInstance = function () {
        if (!s_facebook) {
            s_facebook = new Facebook();
        }
        return s_facebook;
    };

    //-------- namespace --------
    ns.Facebook = Facebook;

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

    var MetaCommand = sdk.protocol.MetaCommand;
    var DocumentCommand = sdk.protocol.DocumentCommand;
    var GroupCommand = sdk.protocol.GroupCommand;

    var get_messenger = function () {
        return ns.Messenger.getInstance();
    };
    var get_facebook = function () {
        return ns.Facebook.getInstance();
    };

    // send command to current station
    var send_command = function (cmd) {
        get_messenger().sendCommand(cmd, 0);
    };
    // send command to group member(s)
    var send_group_command = function (cmd, receiver) {
        var members;
        if (receiver instanceof Array) {
            members = receiver;
        } else {
            members = [receiver];
        }
        var messenger = get_messenger();
        var facebook = get_messenger();
        var user = facebook.getCurrentUser();
        var sender = user.identifier;
        for (var i = 0; i < members.length; ++i) {
            messenger.sendContent(sender, members[i], cmd, null, 0);
        }
    };

    /**
     *  This is for sending group message, or managing group members
     */
    var GroupManager = function (group) {
        this.__group = group;
    };

    /**
     *  Send message content to this group
     *  (only existed member can do this)
     *
     * @param {Content|*} content - message content
     * @return {boolean} true on success
     */
    GroupManager.prototype.send = function (content) {
        // check group ID
        var gid = content.getGroup();
        if (gid) {
            if (!this.__group.equals(gid)) {
                throw new Error('group ID not match: ' + this.__group + ', ' + gid);
            }
        } else {
            content.setGroup(this.__group);
        }
        // check members
        var facebook = get_facebook();
        var members = facebook.getMembers(this.__group);
        if (!members || members.length === 0) {
            // get group assistant
            var assistants = facebook.getAssistants(this.__group);
            if (!assistants || assistants.length === 0) {
                throw new Error('failed to get assistants for group: ' + this.__group);
            }
            // querying assistants for group info
            get_messenger().queryGroupInfo(this.__group, assistants);
            return false;
        }
        // let group assistant to split and deliver this message to all members
        return get_messenger().sendContent(null, this.__group, content, null, 0);
    };

    /**
     *  Invite new members to this group
     *  (only existed member/assistant can do this)
     *
     * @param {ID[]} newMembers - new members ID list
     * @returns {boolean} true on success
     */
    GroupManager.prototype.invite = function (newMembers) {
        var facebook = get_facebook();
        var group = this.__group;
        var bots = facebook.getAssistants(group);
        var members = facebook.getMembers(group);
        if (!members) {
            members = [];
        }
        var count = members.length;

        // 0. build 'meta/document' command
        var meta = facebook.getMeta(group);
        if (!meta) {
            throw new ReferenceError('failed to get meta for group: ' + group.toString());
        }
        var cmd;
        var doc = facebook.getDocument(group, '*');
        if (doc) {
            cmd = DocumentCommand.response(group, meta, doc);
        } else {
            cmd = MetaCommand.response(group, meta);
        }

        if (count <= 2) {  // new group?
            // 1. send 'meta/document' to station and bots
            send_command(cmd);                    // to current station
            send_group_command(cmd, bots);        // to group assistants
            // 2. update local storage
            members = addMembers(newMembers, group);
            send_group_command(cmd, members);     // to all members
            // 3. send 'invite' command with all members to all members
            cmd = GroupCommand.invite(group, members);
            send_group_command(cmd, bots);        // to group assistants
            send_group_command(cmd, members);     // to all members
        } else {
            // 1. send 'meta/document' to station, bots and all members
            send_command(cmd);                    // to current station
            send_group_command(cmd, bots);        // to group assistants
            //send_group_command(cmd, members);     // to old members
            send_group_command(cmd, newMembers);  // to new members
            // 2. send 'invite' command with new members to old members
            cmd = GroupCommand.invite(group, newMembers);
            send_group_command(cmd, bots);        // to group assistants
            send_group_command(cmd, members);     // to old members
            // 3. update local storage
            members = addMembers(newMembers, group);
            // 4. send 'invite' command with all members to new members
            cmd = GroupCommand.invite(group, members);
            send_group_command(cmd, newMembers);  // to new members
        }
        return true;
    };

    /**
     *  Expel members from this group
     *  (only group owner/assistant can do this)
     *
     * @param {ID[]} outMembers - existed member ID list
     * @returns {boolean} true on success
     */
    GroupManager.prototype.expel = function (outMembers) {
        var facebook = get_facebook();
        var group = this.__group;
        var owner = facebook.getOwner(group);
        var bots = facebook.getAssistants(group);
        var members = facebook.getMembers(group);
        if (!members) {
            members = [];
        }

        // 0. check members list
        var i;
        for (i = 0; i < bots.length; ++i) {
            if (outMembers.indexOf(bots[i]) >= 0) {
                throw new Error('Cannot expel group assistant: ' + bots[i]);
            }
        }
        if (outMembers.indexOf(owner) >= 0) {
            throw new Error('Cannot expel group owner: ' + bots[i]);
        }

        // 1. send 'expel' command to all members
        var cmd = GroupCommand.expel(group, outMembers);
        send_group_command(cmd, bots);       // to group assistants
        send_group_command(cmd, members);    // to existed members
        if (owner && members.indexOf(owner) < 0) {
            send_group_command(cmd, owner);  // to owner
        }

        // 2. update local storage
        return removeMembers(outMembers, group);
    };

    /**
     *  Quit from this group
     *  (only group member can do this)
     *
     * @return {boolean} true on success
     */
    GroupManager.prototype.quit = function () {
        var facebook = get_facebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw new ReferenceError('failed to get current user');
        }

        var group = this.__group;
        var owner = facebook.getOwner(group);
        var bots = facebook.getAssistants(group);
        var members = facebook.getMembers(group);
        if (!members) {
            members = [];
        }

        // 0. check members
        if (bots.indexOf(user.identifier) >= 0) {
            throw new Error('Group assistant cannot quit: ' + user.identifier);
        }
        if (user.identifier.equals(owner)) {
            throw new Error('Group owner cannot quit: ' + user.identifier);
        }

        // 1. send 'quit' command to all members
        var cmd = GroupCommand.quit(group);
        send_group_command(cmd, bots);       // to group assistants
        send_group_command(cmd, members);    // to existed members
        if (owner && members.indexOf(owner) < 0) {
            send_group_command(cmd, owner);  // to owner
        }

        // 2. update local storage
        return facebook.removeGroup(group);
    };

    //
    //  Local Storage
    //
    var addMembers = function (newMembers, group) {
        var facebook = get_facebook();
        var members = facebook.getMembers(group);
        var count = 0;
        var member;
        for (var i = 0; i < newMembers.length; ++i) {
            member = newMembers[i];
            if (members.indexOf(member) < 0) {
                members.push(member);
                ++count;
            }
        }
        return count > 0 && facebook.saveMembers(members, group);
    };
    var removeMembers = function (outMembers, group) {
        var facebook = get_facebook();
        var members = facebook.getMembers(group);
        var count = 0;
        var pos;
        for (var i = 0; i < outMembers.length; ++i) {
            pos = members.indexOf(outMembers[i]);
            if (pos >= 0) {
                members.splice(pos, 1);
                ++count;
            }
        }
        return count > 0 && facebook.saveMembers(members, group);
    };

    //-------- namespace --------
    ns.GroupManager = GroupManager;

    ns.registers('GroupManager');

})(SECHAT, DIMSDK);
;
//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var SymmetricKey = sdk.crypto.SymmetricKey;
    var ID = sdk.protocol.ID;

    var MetaCommand = sdk.protocol.MetaCommand;
    var DocumentCommand = sdk.protocol.DocumentCommand;
    var LoginCommand = sdk.protocol.LoginCommand;
    var StorageCommand = sdk.protocol.StorageCommand;
    var QueryCommand = sdk.protocol.group.QueryCommand;

    var ReportCommand = ns.protocol.ReportCommand;

    var CommonFacebook = ns.CommonFacebook;
    var CommonMessenger = ns.CommonMessenger;

    var Messenger = function () {
        CommonMessenger.call(this);
        this.__terminal = null;
        this.__offlineTime = null;  // Date
        // last query time
        this.__metaQueryExpires = {};   // ID => int
        this.__docQueryExpires = {};    // ID => int
        this.__groupQueryExpires = {};  // ID => (ID => int)
    };
    sdk.Class(Messenger, CommonMessenger, null);

    var QUERY_INTERVAL = 120 * 1000;  // query interval (2 minutes)

    Messenger.prototype.getEntityDelegate = function() {
        if (!this.__barrack) {
            this.__barrack = ns.Facebook.getInstance();
        }
        return this.__barrack;
    };
    Messenger.prototype.getProcessor = function () {
        if (!this.__processor) {
            this.__processor = new ns.Processor(this);
        }
        return this.__processor;
    };
    Messenger.prototype.getDataSource = function() {
        if (!this.__datasource) {
            this.__datasource = ns.MessageDataSource;
        }
        return this.__datasource
    };

    Messenger.prototype.getTerminal = function () {
        return this.__terminal;
    };
    Messenger.prototype.setTerminal = function (client) {
        this.__terminal = client;
    };

    Messenger.prototype.getCurrentServer = function () {
        return this.__terminal.getCurrentServer();
    };
    Messenger.prototype.getCurrentUser = function () {
        return this.__terminal.getCurrentUser();
    };

    /**
     *  Pack and send command to station
     *
     * @param {Command} cmd
     * @param {int} priority
     * @returns {boolean}
     */
    Messenger.prototype.sendCommand = function (cmd, priority) {
        var server = this.getCurrentServer();
        if (!server) {
            console.error('current server not found')
            return false;
        }
        return this.sendContent(null, server.identifier, cmd, null, priority);
    };

    /**
     *  Pack and broadcast content to everyone
     *
     * @param content
     * @returns {boolean}
     */
    Messenger.prototype.broadcastContent = function (content) {
        content.setGroup(ID.EVERYONE);
        return this.sendContent(null, ID.EVERYONE, content, null, 1);
    };

    /**
     *  Broadcast visa document to every contacts
     *
     * @param {Visa} doc
     * @returns {boolean}
     */
    Messenger.prototype.broadcastVisa = function (doc) {
        var user = this.getCurrentUser();
        if (!user) {
            // TODO: save the message content in waiting queue
            throw new ReferenceError('login first');
        }
        var identifier = doc.getIdentifier();
        if (!user.identifier.equals(identifier)) {
            throw new ReferenceError('visa document error' + doc.getMap());
        }
        doc.setValue(CommonFacebook.EXPIRES_KEY, null);
        // pack and send user document to every contact
        var contacts = user.getContacts();
        if (contacts && contacts.length > 0) {
            var cmd = DocumentCommand.response(identifier, null, doc);
            for (var i = 0; i < contacts.length; ++i) {
                this.sendContent(identifier, contacts[i], cmd, null, 1);
            }
        }
    };

    /**
     *  Post profile onto current station
     *
     * @param {Document} doc
     * @param {Meta} meta
     * @returns {boolean}
     */
    Messenger.prototype.postDocument = function (doc, meta) {
        doc.setValue(CommonFacebook.EXPIRES_KEY, null);
        var cmd = DocumentCommand.response(doc.getIdentifier(), meta, doc);
        return this.sendCommand(cmd, 1);
    };

    Messenger.prototype.postContacts = function (contacts) {
        var facebook = this.getFacebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw new Error('login first');
        }
        // 1. generate password
        var pwd = SymmetricKey.generate(SymmetricKey.AES);
        // 2. encrypt contacts list as JSON data
        var data = sdk.format.JSON.encode(contacts);
        data = pwd.encrypt(data);
        // 3. encrypt password with user's private key
        var key = sdk.format.JSON.encode(pwd);
        key = user.encrypt(key);
        // 4. pack 'storage' command
        var cmd = new StorageCommand(StorageCommand.CONTACTS);
        cmd.setIdentifier(user.identifier);
        cmd.setData(data);
        cmd.setKey(key);
        return this.sendCommand(cmd, 1);
    };

    Messenger.prototype.queryContacts = function () {
        var facebook = this.getFacebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw new Error('current user not found');
        }
        var cmd = new StorageCommand(StorageCommand.CONTACTS);
        cmd.setIdentifier(user.identifier);
        return this.sendCommand(cmd, 1);
    };

    Messenger.prototype.queryMeta = function (identifier) {
        if (identifier.isBroadcast()) {
            // broadcast ID has no meta
            return false;
        }
        // check for duplicate querying
        var now = (new Date()).getTime();
        var expires = this.__metaQueryExpires[identifier];
        if (expires && now < expires) {
            return false;
        }
        this.__metaQueryExpires[identifier] = now + QUERY_INTERVAL;
        console.log('querying meta', identifier);
        // query from DIM network
        var cmd = new MetaCommand(identifier);
        return this.sendCommand(cmd, 1);
    };

    Messenger.prototype.queryDocument = function (identifier, type) {
        if (identifier.isBroadcast()) {
            // broadcast ID has no document
            return false;
        }
        // check for duplicate querying
        var now = (new Date()).getTime();
        var expires = this.__docQueryExpires[identifier];
        if (expires && now < expires) {
            return false;
        }
        this.__docQueryExpires[identifier] = now + QUERY_INTERVAL;
        console.log('querying document', identifier, type);
        // query from DIM network
        var cmd = new DocumentCommand(identifier);
        return this.sendCommand(cmd, 1);
    };

    Messenger.prototype.queryGroupInfo = function (group, member) {
        if (group.isBroadcast()) {
            // this group contains all users
            return false;
        }
        if (members.length === 0) {
            return false;
        }
        var currentUser = this.getCurrentUser();
        // check for duplicate querying
        var times = this.__groupQueryExpires[group];
        if (!times) {
            times = {};
            this.__groupQueryExpires[group] = times;
        }
        // query from members
        var members;
        if (member instanceof Array) {
            members = member
        } else {
            members = [member];
        }
        var now = new Date();
        var checking = false;
        var user;
        var expires;
        var cmd = new QueryCommand(group);
        for (var i = 0; i < members.length; ++i) {
            user = members[i];
            expires = times[user];
            if (expires && now < expires) {
                continue;
            }
            times[user] = now + QUERY_INTERVAL;
            console.log('querying group', group, user);
            if (this.sendContent(currentUser.identifier, user, cmd, null, 1)) {
                checking = true;
            }
        }
        return checking;
    };

    Messenger.prototype.reportOnline = function () {
        var user = this.getCurrentUser();
        if (!user) {
            console.error('current user not set yet')
            return;
        }
        var cmd = new ReportCommand(ReportCommand.ONLINE);
        if (this.__offlineTime) {
            cmd.setValue('last_time', this.__offlineTime.getTime() / 1000);
        }
        this.sendCommand(cmd, 0);
    };

    Messenger.prototype.reportOffline = function () {
        var user = this.getCurrentUser();
        if (!user) {
            console.error('current user not set yet')
            return;
        }
        var cmd = new ReportCommand(ReportCommand.OFFLINE);
        this.__offlineTime = cmd.getTime();
        this.sendCommand(cmd, 0);
    };

    //
    //  Station Delegate
    //
    Messenger.prototype.onReceivePackage = function (data, server) {
        try {
            var res = this.processData(data);
            if (res && res.length > 0) {
                server.sendPackage(res, null, 1);
            }
        } catch (e) {
            console.error('failed to process data', data, e);
        }
    };

    Messenger.prototype.didSendPackage = function (data, server) {
        // TODO: mark it sent
    };

    Messenger.prototype.didFailToSendPackage = function (error, data, server) {
        // TODO: resend it
    };

    Messenger.prototype.onHandshakeAccepted = function (session, server) {
        var user = this.getCurrentUser();
        // broadcast login command
        var login = new LoginCommand(user.identifier);
        login.setAgent(this.getTerminal().getUserAgent());
        login.setStation(server);
        // TODO: set provider
        this.broadcastContent(login);
    };

    var s_messenger = null;
    Messenger.getInstance = function () {
        if (!s_messenger) {
            s_messenger = new Messenger();
        }
        return s_messenger;
    };

    //-------- namespace --------
    ns.Messenger = Messenger;

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
    var Envelope = sdk.protocol.Envelope;
    var InstantMessage = sdk.protocol.InstantMessage;
    var HandshakeCommand = sdk.protocol.HandshakeCommand;
    var ReceiptCommand = sdk.protocol.ReceiptCommand;

    var CommonProcessor = ns.CommonProcessor;

    var MessageProcessor = function (messenger) {
        CommonProcessor.call(this, messenger);
    };
    sdk.Class(MessageProcessor, CommonProcessor, null);

    MessageProcessor.prototype.processContent = function (content, rMsg) {
        var res = CommonProcessor.prototype.processContent.call(this, content, rMsg);
        if (!res) {
            // respond nothing
            return null;
        }
        if (res instanceof HandshakeCommand) {
            // urgent command
            return res;
        }
        var sender = rMsg.getSender();
        if (res instanceof ReceiptCommand) {
            if (NetworkType.STATION.equals(sender.getType())) {
                // no need to respond receipt to station
                return null;
            }
            console.log('receipt to sender', sender);
        }
        // check receiver
        var receiver = rMsg.getReceiver();
        var user = this.getFacebook().selectLocalUser(receiver);
        // pack message
        var env = Envelope.create(user.identifier, sender, null);
        var iMsg = InstantMessage.create(env, res);
        // normal response
        this.getMessenger().sendInstantMessage(iMsg, null, 1);
        // DON'T respond to station directly
        return null;
    };

    //-------- namespace --------
    ns.MessageProcessor = MessageProcessor;

    ns.registers('MessageProcessor');

})(SECHAT, DIMSDK);

//! require 'cpu/handshake.js'
//! require 'cpu/login.js'
//! require 'cpu/search.js'
//! require 'cpu/storage.js'

(function (ns, sdk) {
    'use strict';

    var Command = sdk.protocol.Command;
    var StorageCommand = sdk.protocol.StorageCommand;
    var CommandProcessor = sdk.cpu.CommandProcessor;

    var SearchCommand = ns.protocol.SearchCommand;
    var HandshakeCommandProcessor = ns.cpu.HandshakeCommandProcessor;
    var LoginCommandProcessor = ns.cpu.LoginCommandProcessor;
    var SearchCommandProcessor = ns.cpu.SearchCommandProcessor;
    var StorageCommandProcessor = ns.cpu.StorageCommandProcessor;

    var registerCommandProcessors = function () {
        CommandProcessor.register(Command.HANDSHAKE, new HandshakeCommandProcessor());
        CommandProcessor.register(Command.LOGIN, new LoginCommandProcessor());
        // search (online)
        var search = new SearchCommandProcessor();
        CommandProcessor.register(SearchCommand.SEARCH, search);
        CommandProcessor.register(SearchCommand.ONLINE_USERS, search);
        // storage (contacts, private_key)
        var storage = new StorageCommandProcessor();
        CommandProcessor.register(StorageCommand.STORAGE, storage);
        CommandProcessor.register(StorageCommand.CONTACTS, storage);
        CommandProcessor.register(StorageCommand.PRIVATE_KEY, storage);
    };

    registerCommandProcessors();

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

    var NetworkType = sdk.protocol.NetworkType;
    var MetaType = sdk.protocol.MetaType;
    var Meta = sdk.protocol.Meta;
    var Document = sdk.protocol.Document;

    var get_facebook = function () {
        return ns.Facebook.getInstance();
    };
    var get_messenger = function () {
        return ns.Messenger.getInstance();
    };

    /**
     *  This is for generating user account, or creating group
     */
    var Register = function (type) {
        if (type) {
            this.network = type;
        } else {
            this.network = NetworkType.MAIN;
        }
        this.__privateKey = null;
    };

    /**
     *  Generate user account
     *
     * @param {String} name - nickname
     * @param {String} avatar - URL
     * @returns {User}
     */
    Register.prototype.createUser = function (name, avatar) {
        //
        //  Step 1. generate private key (with asymmetric algorithm)
        //
        this.__privateKey = PrivateKey.generate(PrivateKey.RSA);
        //
        //  Step 2. generate meta with private key (and meta seed)
        //
        var meta = Meta.generate(MetaType.DEFAULT, this.__privateKey, 'web-demo');
        //
        //  Step 3. generate ID with meta (and network type)
        //
        var identifier = meta.generateID(NetworkType.MAIN, null);
        //
        //  Step 4. create document with ID and sign with private key
        //
        var doc = this.createDocument(identifier, {name: name, avatar: avatar});
        // 5. save private key, meta & visa in local storage
        //    don't forget to upload them onto the DIM station
        var facebook = get_facebook();
        facebook.saveMeta(meta, identifier);
        facebook.savePrivateKey(identifier, this.__privateKey, 'M', 0, 0);
        facebook.saveDocument(doc);
        // 6. create user
        return facebook.getUser(identifier);
    };

    /**
     *  Generate group account
     *
     * @param {ID} founder - founder ID
     * @param {String} name - group name
     * @param {String} seed - group ID.seed
     * @returns {Group}
     */
    Register.prototype.createGroup = function (founder, name, seed) {
        if (!seed) {
            var r = Math.ceil(Math.random() * 999990000) + 10000; // 10,000 ~ 999,999,999
            seed = 'Group-' + r;
        }
        var facebook = get_facebook();
        // 1. get private key
        this.__privateKey = facebook.getPrivateKeyForVisaSignature(founder);
        // 2. generate meta
        var meta = Meta.generate(MetaType.DEFAULT, this.__privateKey, seed);
        // 3. generate ID
        var identifier = meta.generateID(NetworkType.POLYLOGUE, null);
        // 4. generate document
        var doc = this.createDocument(identifier, {name: name});
        // 5. save meta & document in local storage
        //    don't forget to upload them onto the DIM station
        facebook.saveMeta(meta, identifier);
        facebook.saveDocument(doc);
        // 6. add founder as first member
        facebook.addMember(founder, identifier);
        // 7. create group
        return facebook.getGroup(identifier);
    };

    Register.prototype.createDocument = function (identifier, properties) {
        var doc = Document.parse({'ID': identifier.toString()});
        if (properties) {
            var keys = Object.keys(properties);
            var name, value;
            for (var i = 0; i < keys.length; ++i) {
                name = keys[i];
                value = properties[name];
                if (name && value) {
                    doc.setProperty(name, value);
                }
            }
        }
        doc.sign(this.__privateKey);
        return doc;
    };

    //
    //  Step 5. upload meta & document for ID
    //
    Register.prototype.upload = function (identifier, meta, doc) {
        if (!doc.getIdentifier().equals(identifier)) {
            throw new Error('document ID not match: '
                + identifier.toString() + ', ' + doc.getMap());
        }
        return get_messenger().postDocument(doc, meta);
    };

    //-------- namespace --------
    ns.Register = Register;

    ns.registers('Register');

})(SECHAT, DIMSDK);
