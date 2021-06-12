/**
 *  DIM-Client (v0.1.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      June. 11, 2021
 * @copyright (c) 2021 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
(function(ns, sdk) {
    ns.kNotificationServerStateChanged = "ServerStateChanged";
    ns.kNotificationStationConnecting = "StationConnecting";
    ns.kNotificationStationConnected = "StationConnected";
    ns.kNotificationStationError = "StationError";
    ns.kNotificationServiceProviderUpdated = "ServiceProviderUpdated";
    ns.kNotificationMetaAccepted = "MetaAccepted";
    ns.kNotificationDocumentUpdated = "DocumentUpdated";
    ns.kNotificationContactsUpdated = "ContactsUpdated";
    ns.kNotificationMembersUpdated = "MembersUpdated";
    ns.kNotificationGroupRemoved = "GroupRemoved";
    ns.kNotificationMessageUpdated = "MessageUpdated";
    if (typeof ns.model !== "object") {
        ns.model = new sdk.Namespace()
    }
    ns.registers("model")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var CommandProcessor = sdk.cpu.CommandProcessor;
    var HandshakeCommandProcessor = function() {
        CommandProcessor.call(this)
    };
    sdk.Class(HandshakeCommandProcessor, CommandProcessor, null);
    var success = function() {
        console.log("handshake success!");
        var messenger = this.getMessenger();
        var server = messenger.getCurrentServer();
        server.handshakeAccepted();
        return null
    };
    var restart = function(session) {
        console.log("handshake again", session);
        var messenger = this.getMessenger();
        var server = messenger.getCurrentServer();
        server.handshake(session);
        return null
    };
    HandshakeCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var message = cmd.getMessage();
        if (message === "DIM!" || message === "OK!") {
            return success.call(this)
        } else {
            if (message === "DIM?") {
                return restart.call(this, cmd.getSessionKey())
            } else {
                throw new Error("handshake command error: " + cmd)
            }
        }
    };
    ns.cpu.HandshakeCommandProcessor = HandshakeCommandProcessor;
    ns.cpu.registers("HandshakeCommandProcessor")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var CommandProcessor = sdk.cpu.CommandProcessor;
    var LoginCommandProcessor = function() {
        CommandProcessor.call(this)
    };
    sdk.Class(LoginCommandProcessor, CommandProcessor, null);
    LoginCommandProcessor.prototype.execute = function(cmd, rMsg) {
        return null
    };
    ns.cpu.LoginCommandProcessor = LoginCommandProcessor;
    ns.cpu.registers("LoginCommandProcessor")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ID = sdk.protocol.ID;
    var Meta = sdk.protocol.Meta;
    var InstantMessage = sdk.protocol.InstantMessage;
    var CommandProcessor = sdk.cpu.CommandProcessor;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    var SearchCommand = ns.protocol.SearchCommand;
    var SearchCommandProcessor = function() {
        CommandProcessor.call(this)
    };
    sdk.Class(SearchCommandProcessor, CommandProcessor, null);
    var user_info = function(string, facebook) {
        var identifier = ID.parse(string);
        if (!identifier) {
            return string
        }
        var nickname = facebook.getName(identifier);
        return identifier + ' "' + nickname + '"'
    };
    SearchCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var facebook = this.getFacebook();
        var users = cmd.getUsers();
        var online = cmd.getCommand() === SearchCommand.ONLINE_USERS;
        var cnt = users ? users.length : 0;
        var text;
        if (cnt === 0) {
            if (online) {
                text = "No user online now."
            } else {
                text = "User not found."
            }
        } else {
            if (cnt === 1) {
                if (online) {
                    text = "One user online now,\n" + user_info(users[0], facebook)
                } else {
                    text = "Got one user,\n" + user_info(users[0], facebook)
                }
            } else {
                if (online) {
                    text = cnt + " users online now,"
                } else {
                    text = "Got " + cnt + " users,"
                }
                for (var i = 0; i < cnt; ++i) {
                    text += "\n" + user_info(users[i], facebook)
                }
            }
        }
        var results = cmd.getResults();
        if (results) {
            var id, meta;
            var keys = Object.keys(results);
            for (var j = 0; j < keys.length; ++j) {
                id = ID.parse(keys[j]);
                if (!id) {
                    continue
                }
                meta = results[id];
                meta = Meta.parse(meta);
                if (!meta) {
                    continue
                }
                facebook.saveMeta(meta, id)
            }
        }
        cmd.setValue("text", text);
        var iMsg = InstantMessage.create(rMsg.getEnvelope(), cmd);
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMessageUpdated, this, {
            "ID": rMsg.getSender(),
            "msg": iMsg
        });
        return null
    };
    ns.cpu.SearchCommandProcessor = SearchCommandProcessor;
    ns.cpu.registers("SearchCommandProcessor")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var StorageCommand = sdk.protocol.StorageCommand;
    var CommandProcessor = sdk.cpu.CommandProcessor;
    var StorageCommandProcessor = function() {
        CommandProcessor.call(this)
    };
    sdk.Class(StorageCommandProcessor, CommandProcessor, null);
    StorageCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var title = cmd.getTitle();
        if (title === StorageCommand.CONTACTS) {} else {
            if (title === StorageCommand.PRIVATE_KEY) {}
        }
        return null
    };
    ns.cpu.StorageCommandProcessor = StorageCommandProcessor;
    ns.cpu.registers("StorageCommandProcessor")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ReceiptCommand = sdk.protocol.ReceiptCommand;
    var get_conversation_db = function() {
        return ns.ConversationDatabase
    };
    ns.Amanuensis = {
        getConversation: function(identifier) {
            var facebook = ns.Facebook.getInstance();
            var entity = null;
            if (identifier.isUser()) {
                entity = facebook.getUser(identifier)
            } else {
                if (identifier.isGroup()) {
                    entity = facebook.getGroup(identifier)
                }
            }
            if (!entity) {
                return null
            }
            var chatBox = new ns.Conversation(entity);
            chatBox.database = get_conversation_db();
            return chatBox
        },
        saveMessage: function(iMsg) {
            if (iMsg.getContent() instanceof ReceiptCommand) {
                return this.saveReceipt(iMsg)
            }
            var chatBox = get_conversation.call(this, iMsg);
            if (chatBox) {
                return chatBox.insertMessage(iMsg)
            } else {
                return false
            }
        },
        saveReceipt: function(iMsg) {
            var chatBox = get_conversation.call(this, iMsg);
            if (chatBox) {
                return chatBox.saveReceipt(iMsg)
            } else {
                return false
            }
        }
    };
    var get_conversation = function(iMsg) {
        var receiver = iMsg.getReceiver();
        if (receiver.isGroup()) {
            return this.getConversation(receiver)
        }
        var group = iMsg.getGroup();
        if (group) {
            return this.getConversation(group)
        }
        var facebook = ns.Facebook.getInstance();
        var sender = iMsg.getSender();
        var user = facebook.getCurrentUser();
        if (sender.equals(user.identifier)) {
            return this.getConversation(receiver)
        } else {
            return this.getConversation(sender)
        }
    }
})(SECHAT, DIMSDK);
(function(ns, sdk) {
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
    var get_messenger = function() {
        return ns.Messenger.getInstance()
    };
    var get_facebook = function() {
        return ns.Facebook.getInstance()
    };
    var get_clerk = function() {
        return ns.Amanuensis
    };
    var MessageDataSource = {
        onReceiveNotification: function(notification) {
            var name = notification.name;
            if (name !== ns.kNotificationMetaAccepted && name !== ns.kNotificationDocumentUpdated) {
                return
            }
            var info = notification.userInfo;
            var messenger = get_messenger();
            var facebook = get_facebook();
            var entity = ID.parse(info["ID"]);
            if (entity.isUser()) {
                if (!facebook.getPublicKeyForEncryption(entity)) {
                    console.error("user not ready yet: " + entity);
                    return
                }
            }
            var incoming = this.__incoming[entity];
            if (incoming) {
                delete this.__incoming[entity];
                var item, res;
                for (var i = 0; i < incoming.length; ++i) {
                    item = incoming[i];
                    res = messenger.processReliableMessage(item);
                    if (res) {
                        messenger.sendReliableMessage(res, null, 1)
                    }
                }
            }
            var outgoing = this.__outgoing[entity];
            if (outgoing) {
                delete this.__outgoing[entity];
                for (var j = 0; j < outgoing.length; ++j) {
                    messenger.sendInstantMessage(outgoing[j], null, 1)
                }
            }
        },
        saveMessage: function(iMsg) {
            var content = iMsg.getContent();
            if (content instanceof HandshakeCommand) {
                return true
            }
            if (content instanceof ReportCommand) {
                return true
            }
            if (content instanceof LoginCommand) {
                return true
            }
            if (content instanceof MetaCommand) {
                return true
            }
            if (content instanceof MuteCommand || content instanceof BlockCommand) {
                return true
            }
            if (content instanceof SearchCommand) {
                return true
            }
            if (content instanceof ForwardContent) {
                return true
            }
            if (content instanceof InviteCommand) {
                var me = iMsg.getReceiver();
                var group = content.getGroup();
                var messenger = get_messenger();
                var key = messenger.getCipherKeyDelegate().getCipherKey(me, group, false);
                if (key != null) {
                    key.remove("reused")
                }
            }
            if (content instanceof QueryCommand) {
                return true
            }
            if (content instanceof ReceiptCommand) {
                return get_clerk().saveReceipt(iMsg)
            } else {
                return get_clerk().saveMessage(iMsg)
            }
        },
        suspendInstantMessage: function(iMsg) {
            var waiting = ID.parse(iMsg.getValue("waiting"));
            if (waiting == null) {
                waiting = iMsg.getGroup();
                if (waiting == null) {
                    waiting = iMsg.getSender()
                }
            } else {
                iMsg.remove("waiting")
            }
            var list = this.__outgoing[waiting];
            if (!list) {
                list = [];
                this.__outgoing[waiting] = list
            }
            list.push(iMsg)
        },
        suspendReliableMessage: function(rMsg) {
            var waiting = ID.parse(rMsg.getValue("waiting"));
            if (!waiting) {
                waiting = rMsg.getGroup();
                if (waiting == null) {
                    waiting = rMsg.getSender()
                }
            } else {
                rMsg.remove("waiting")
            }
            var list = this.__incoming[waiting];
            if (!list) {
                list = [];
                this.__incoming[waiting] = list
            }
            list.push(rMsg)
        },
        __outgoing: {},
        __incoming: {}
    };
    var nc = NotificationCenter.getInstance();
    nc.addObserver(MessageDataSource, ns.kNotificationMetaAccepted);
    nc.addObserver(MessageDataSource, ns.kNotificationDocumentUpdated);
    ns.MessageDataSource = MessageDataSource
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ID = sdk.protocol.ID;
    ns.Configuration = {
        getDefaultProvider: function() {
            return this.__sp
        },
        getDefaultContacts: function() {
            var info = this.__sp;
            var array = info.get("contacts");
            if (array) {
                return ID.convert(array)
            } else {
                return null
            }
        },
        getUploadURL: function() {
            return "https://sechat.dim.chat/{ID}}/upload"
        },
        getDownloadURL: function() {
            return "https://sechat.dim.chat/download/{ID}/{filename}"
        },
        getAvatarURL: function() {
            return "https://sechat.dim.chat/avatar/{ID}/{filename}"
        },
        getTermsURL: function() {
            return "https://wallet.dim.chat/dimchat/sechat/privacy.html"
        },
        getAboutURL: function() {
            return "https://dim.chat/sechat"
        },
        __sp: null
    }
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var NetworkType = sdk.protocol.NetworkType;
    var ContentType = sdk.protocol.ContentType;
    var Entity = sdk.Entity;
    var get_facebook = function() {
        return ns.Facebook.getInstance()
    };
    var get_conversation_db = function() {
        return ns.ConversationDatabase
    };
    var ConversationType = sdk.type.Enum(null, {
        Personal: (NetworkType.MAIN),
        Group: (NetworkType.GROUP)
    });
    var Conversation = function(entity) {
        if (entity instanceof Entity) {
            entity = entity.identifier
        }
        this.identifier = entity;
        this.type = get_type(entity)
    };
    var get_type = function(identifier) {
        if (identifier.isUser()) {
            return ConversationType.Personal
        } else {
            if (identifier.isGroup()) {
                return ConversationType.Group
            } else {
                throw new TypeError("conversation type error: " + identifier)
            }
        }
    };
    Conversation.prototype.getTitle = function() {
        var facebook = get_facebook();
        var name = facebook.getName(this.identifier);
        if (this.identifier.isGroup()) {
            var members = facebook.getMembers(this.identifier);
            if (members && members.length > 0) {
                return name + " (" + members.length + ")"
            } else {
                return name + " (...)"
            }
        } else {
            return name
        }
    };
    Conversation.prototype.getLastTime = function() {
        var iMsg = this.getLastMessage();
        if (iMsg) {
            return iMsg.getTime()
        } else {
            return new Date(0)
        }
    };
    Conversation.prototype.getLastMessage = function() {
        return get_conversation_db().lastMessage(this.identifier)
    };
    Conversation.prototype.getLastVisibleMessage = function() {
        var count = this.getNumberOfMessages();
        var iMsg, type;
        for (var index = count - 1; index >= 0; --index) {
            iMsg = this.getMessageAtIndex(index);
            if (!iMsg) {
                continue
            }
            type = iMsg.getType();
            if (ContentType.TEXT.equals(type) || ContentType.FILE.equals(type) || ContentType.IMAGE.equals(type) || ContentType.AUDIO.equals(type) || ContentType.VIDEO.equals(type) || ContentType.PAGE.equals(type) || ContentType.MONEY.equals(type) || ContentType.TRANSFER.equals(type)) {
                return iMsg
            }
        }
        return null
    };
    Conversation.prototype.getNumberOfMessages = function() {
        return get_conversation_db().numberOfMessages(this.identifier)
    };
    Conversation.prototype.getNumberOfUnreadMessages = function() {
        return get_conversation_db().numberOfUnreadMessages(this.identifier)
    };
    Conversation.prototype.getMessageAtIndex = function(index) {
        return get_conversation_db().messageAtIndex(index, this.identifier)
    };
    Conversation.prototype.insertMessage = function(iMsg) {
        return get_conversation_db().insertMessage(iMsg, this.identifier)
    };
    Conversation.prototype.removeMessage = function(iMsg) {
        return get_conversation_db().removeMessage(iMsg, this.identifier)
    };
    Conversation.prototype.withdrawMessage = function(iMsg) {
        return get_conversation_db().withdrawMessage(iMsg, this.identifier)
    };
    Conversation.prototype.saveReceipt = function(iMsg) {
        return get_conversation_db().saveReceipt(iMsg, this.identifier)
    };
    ns.Conversation = Conversation;
    ns.registers("Conversation")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var Entity = sdk.Entity;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    var get_facebook = function() {
        return ns.Facebook.getInstance()
    };
    ns.ConversationDatabase = {
        getName: function(identifier) {
            return get_facebook().getName(identifier)
        },
        getTimeString: function(msg) {
            var time = msg.getTime();
            if (!time) {
                time = new Date(0)
            }
            var yyyy = time.getFullYear();
            var mm = time.getMonth() + 1;
            var dd = time.getDate();
            var hh = time.getHours();
            var MM = time.getMinutes();
            var ss = time.getSeconds();
            return yyyy + "/" + mm + "/" + dd + " " + hh + ":" + MM + ":" + ss
        },
        numberOfConversations: function() {
            return this.messageTable.numberOfConversations()
        },
        conversationAtIndex: function(index) {
            return this.messageTable.conversationAtIndex(index)
        },
        removeConversationAtIndex: function(index) {
            var chat = this.messageTable.conversationAtIndex(index);
            if (!this.messageTable.removeConversationAtIndex(index)) {
                return false
            }
            post_updated(null, chat);
            return true
        },
        removeConversation: function(chat) {
            chat = get_id(chat);
            if (!this.messageTable.removeConversation(chat)) {
                return false
            }
            post_updated(null, chat);
            return true
        },
        clearConversation: function(chat) {
            chat = get_id(chat);
            if (!this.messageTable.removeConversation(chat)) {
                return false
            }
            post_updated(null, chat);
            return true
        },
        numberOfMessages: function(chat) {
            chat = get_id(chat);
            return this.messageTable.numberOfMessages(chat)
        },
        numberOfUnreadMessages: function(chat) {
            chat = get_id(chat);
            return this.messageTable.numberOfUnreadMessages(chat)
        },
        clearUnreadMessages: function(chat) {
            chat = get_id(chat);
            return this.messageTable.numberOfUnreadMessages(chat)
        },
        lastMessage: function(chat) {
            chat = get_id(chat);
            return this.messageTable.lastMessage(chat)
        },
        lastReceivedMessage: function() {
            var user = get_facebook().getCurrentUser();
            if (!user) {
                return null
            }
            return this.messageTable.lastReceivedMessage(user.identifier)
        },
        messageAtIndex: function(index, chat) {
            chat = get_id(chat);
            return this.messageTable.messageAtIndex(index, chat)
        },
        insertMessage: function(iMsg, chat) {
            chat = get_id(chat);
            var ok = this.messageTable.insertMessage(iMsg, chat);
            if (ok) {
                post_updated(iMsg, chat)
            }
            return ok
        },
        removeMessage: function(iMsg, chat) {
            chat = get_id(chat);
            var ok = this.messageTable.removeMessage(iMsg, chat);
            if (ok) {
                post_updated(iMsg, chat)
            }
            return ok
        },
        withdrawMessage: function(iMsg, chat) {
            chat = get_id(chat);
            var ok = this.messageTable.withdrawMessage(iMsg, chat);
            if (ok) {
                post_updated(iMsg, chat)
            }
            return ok
        },
        saveReceipt: function(iMsg, chat) {
            chat = get_id(chat);
            var ok = this.messageTable.saveReceipt(iMsg, chat);
            if (ok) {
                if (chat.isUser()) {
                    var receipt = iMsg.getContent();
                    var env = receipt.getEnvelope();
                    if (env) {
                        var sender = env.getSender();
                        if (sender && sender.equals(iMsg.getReceiver())) {
                            chat = env.getReceiver()
                        }
                    }
                }
                post_updated(iMsg, chat)
            }
            return ok
        },
        messageTable: ns.db.MessageTable
    };
    var get_id = function(chatBox) {
        if (chatBox instanceof ns.Conversation) {
            return chatBox.identifier
        } else {
            if (chatBox instanceof Entity) {
                return chatBox.identifier
            } else {
                return chatBox
            }
        }
    };
    var post_updated = function(iMsg, identifier) {
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMessageUpdated, this, {
            "ID": identifier,
            "msg": iMsg
        })
    }
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ID = sdk.protocol.ID;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    ns.NetworkDatabase = {
        allProviders: function() {
            var providers = this.providerTable.getProviders();
            if (providers && providers.length > 0) {
                return providers
            } else {
                return [default_provider()]
            }
        },
        addProvider: function(identifier, name, url, chosen) {
            return this.providerTable.addProvider(identifier, name, url, chosen)
        },
        allStations: function(sp) {
            return this.providerTable.getStations(sp)
        },
        addStation: function(sp, station, host, port, name, chosen) {
            if (!this.providerTable.addStation(sp, station, host, port, name, chosen)) {
                return false
            }
            var nc = NotificationCenter.getInstance();
            nc.postNotification(ns.kNotificationServiceProviderUpdated, this, {
                "sp": sp,
                "action": "add",
                "station": station,
                "chosen": chosen
            });
            return true
        },
        chooseStation: function(sp, station) {
            if (!this.providerTable.chooseStation(sp, station)) {
                return false
            }
            var nc = NotificationCenter.getInstance();
            nc.postNotification(ns.kNotificationServiceProviderUpdated, this, {
                "sp": sp,
                "action": "switch",
                "station": station,
                "chosen": 1
            });
            return true
        },
        removeStation: function(sp, station, host, port) {
            if (!this.providerTable.removeStation(sp, station)) {
                return false
            }
            var nc = NotificationCenter.getInstance();
            nc.postNotification(ns.kNotificationServiceProviderUpdated, this, {
                "sp": sp,
                "action": "remove",
                "station": station,
                "host": host,
                "port": port
            });
            return true
        },
        providerTable: null
    };
    var default_provider = function() {
        return null
    }
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var StationDelegate = function() {};
    sdk.Interface(StationDelegate, null);
    StationDelegate.prototype.onReceivePackage = function(data, server) {
        console.assert(false, "implement me!")
    };
    StationDelegate.prototype.didSendPackage = function(data, server) {
        console.assert(false, "implement me!")
    };
    StationDelegate.prototype.didFailToSendPackage = function(error, data, server) {
        console.assert(false, "implement me!")
    };
    StationDelegate.prototype.onHandshakeAccepted = function(session, server) {
        console.assert(false, "implement me!")
    };
    ns.network.StationDelegate = StationDelegate;
    ns.network.registers("StationDelegate")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var State = sdk.fsm.State;
    var ServerState = function(name) {
        State.call(this);
        this.name = name;
        this.time = null
    };
    sdk.Class(ServerState, State, null);
    ServerState.DEFAULT = "default";
    ServerState.CONNECTING = "connecting";
    ServerState.CONNECTED = "connected";
    ServerState.HANDSHAKING = "handshaking";
    ServerState.RUNNING = "running";
    ServerState.ERROR = "error";
    ServerState.prototype.equals = function(state) {
        if (state instanceof ServerState) {
            return this.name === state.name
        } else {
            if (typeof state === "string") {
                return this.name === state
            } else {
                throw new Error("state error: " + state)
            }
        }
    };
    ServerState.prototype.toString = function() {
        return "<ServerState:" + this.name + ">"
    };
    ServerState.prototype.toLocaleString = function() {
        return "<ServerState:" + this.name.toLocaleString() + ">"
    };
    ServerState.prototype.onEnter = function(machine) {
        console.assert(machine !== null, "machine empty");
        console.log("onEnter: ", this);
        this.time = new Date()
    };
    ServerState.prototype.onExit = function(machine) {
        console.assert(machine !== null, "machine empty");
        this.time = null
    };
    ns.network.ServerState = ServerState;
    ns.network.registers("ServerState")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var Transition = sdk.fsm.Transition;
    var AutoMachine = sdk.fsm.AutoMachine;
    var Gate = sdk.startrek.Gate;
    var ServerState = ns.network.ServerState;
    var StateMachine = function(server) {
        AutoMachine.call(this, ServerState.DEFAULT);
        this.setDelegate(server);
        this.__session = null;
        set_state.call(this, default_state());
        set_state.call(this, connecting_state());
        set_state.call(this, connected_state());
        set_state.call(this, handshaking_state());
        set_state.call(this, running_state());
        set_state.call(this, error_state())
    };
    sdk.Class(StateMachine, AutoMachine, null);
    var set_state = function(state) {
        this.addState(state, state.name)
    };
    StateMachine.prototype.getSessionKey = function() {
        return this.__session
    };
    StateMachine.prototype.setSessionKey = function(session) {
        this.__session = session
    };
    StateMachine.prototype.getCurrentState = function() {
        var state = AutoMachine.prototype.getCurrentState.call(this);
        if (!state) {
            state = this.getState(ServerState.DEFAULT)
        }
        return state
    };
    var get_server = function(machine) {
        return machine.getDelegate()
    };
    var transition = function(target, evaluate) {
        var trans = new Transition(target);
        trans.evaluate = evaluate;
        return trans
    };
    var server_state = function(name, transitions) {
        var state = new ServerState(name);
        for (var i = 1; i < arguments.length; ++i) {
            state.addTransition(arguments[i])
        }
        return state
    };
    var default_state = function() {
        return server_state(ServerState.DEFAULT, transition(ServerState.CONNECTING, function(machine) {
            var server = get_server(machine);
            if (server && server.getCurrentUser()) {
                var status = server.getStatus();
                return Gate.Status.CONNECTING.equals(status) || Gate.Status.CONNECTED.equals(status)
            } else {
                return false
            }
        }))
    };
    var connecting_state = function() {
        return server_state(ServerState.CONNECTING, transition(ServerState.CONNECTED, function(machine) {
            var server = get_server(machine);
            var status = server.getStatus();
            return Gate.Status.CONNECTED.equals(status)
        }), transition(ServerState.ERROR, function(machine) {
            var server = get_server(machine);
            var status = server.getStatus();
            return Gate.Status.ERROR.equals(status)
        }))
    };
    var connected_state = function() {
        return server_state(ServerState.CONNECTED, transition(ServerState.HANDSHAKING, function(machine) {
            var server = get_server(machine);
            return server.getCurrentUser()
        }))
    };
    var handshaking_state = function() {
        return server_state(ServerState.HANDSHAKING, transition(ServerState.RUNNING, function(machine) {
            return machine.getSessionKey()
        }), transition(ServerState.CONNECTED, function(machine) {
            var state = machine.getCurrentState();
            var time = state.time;
            if (time) {
                var expired = time.getTime() + 120 * 1000;
                var now = (new Date()).getTime();
                if (now < expired) {
                    return false
                }
            } else {
                return false
            }
            var server = get_server(machine);
            var status = server.getStatus();
            return Gate.Status.CONNECTED.equals(status)
        }), transition(ServerState.ERROR, function(machine) {
            var server = get_server(machine);
            var status = server.getStatus();
            return Gate.Status.ERROR.equals(status)
        }))
    };
    var running_state = function() {
        return server_state(ServerState.RUNNING, transition(ServerState.DEFAULT, function(machine) {
            return !machine.getSessionKey()
        }), transition(ServerState.ERROR, function(machine) {
            var server = get_server(machine);
            var status = server.getStatus();
            return Gate.Status.ERROR.equals(status)
        }))
    };
    var error_state = function() {
        return server_state(ServerState.ERROR, transition(ServerState.DEFAULT, function(machine) {
            var server = get_server(machine);
            var status = server.getStatus();
            return !Gate.Status.ERROR.equals(status)
        }))
    };
    ns.network.StateMachine = StateMachine;
    ns.network.registers("StateMachine")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
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
    var get_facebook = function() {
        return ns.Facebook.getInstance()
    };
    var get_messenger = function() {
        return ns.Messenger.getInstance()
    };
    var Server = function(identifier, host, port) {
        Station.call(this, identifier, host, port);
        this.__delegate = null;
        this.__fsm = new StateMachine(this);
        this.__fsm.start();
        this.__session = new ns.network.Session(host, port, get_messenger());
        this.__sessionKey = null;
        this.__paused = false;
        this.__currentUser = null
    };
    sdk.Class(Server, Station, [MessengerDelegate, StateMachineDelegate]);
    Server.prototype.getDelegate = function() {
        return this.__delegate
    };
    Server.prototype.setDelegate = function(delegate) {
        this.__delegate = delegate
    };
    Server.prototype.getCurrentUser = function() {
        return this.__currentUser
    };
    Server.prototype.setCurrentUser = function(user) {
        if (user.equals(this.__currentUser)) {
            return
        }
        this.__currentUser = user;
        this.__fsm.setSessionKey(null)
    };
    Server.prototype.getCurrentState = function() {
        return this.__fsm.getCurrentState()
    };
    Server.prototype.getStatus = function() {
        return this.__session.gate.getStatus()
    };
    var pack = function(cmd) {
        if (!this.__currentUser) {
            throw new Error("current user not set")
        }
        var sender = this.__currentUser.identifier;
        var receiver = this.identifier;
        var facebook = get_facebook();
        if (!facebook.getPublicKeyForEncryption(receiver)) {
            cmd.setGroup(ID.EVERYONE)
        }
        var messenger = get_messenger();
        var env = Envelope.create(sender, receiver, null);
        var iMsg = InstantMessage.create(env, cmd);
        var sMsg = messenger.encryptMessage(iMsg);
        if (!sMsg) {
            throw new EvalError("failed to encrypt message: " + iMsg.getMap())
        }
        var rMsg = messenger.signMessage(sMsg);
        if (!rMsg) {
            throw new EvalError("failed to sign message: " + sMsg.getMap())
        }
        return rMsg
    };
    var set_last_time = function(cmd) {};
    Server.prototype.handshake = function(newSessionKey) {
        if (!this.__currentUser) {
            return
        }
        var state = this.getCurrentState();
        if (!state.equals(ServerState.CONNECTED) && !state.equals(ServerState.HANDSHAKING)) {
            console.log("server state not handshaking", state);
            return
        }
        var status = this.getStatus();
        if (!status.equals(Gate.Status.CONNECTED)) {
            console.log("server not connected");
            return
        }
        if (newSessionKey) {
            this.__sessionKey = newSessionKey
        }
        this.__fsm.setSessionKey(null);
        var cmd = new HandshakeCommand(null, this.__sessionKey);
        set_last_time.call(this, cmd);
        var rMsg = pack.call(this, cmd);
        if (cmd.getState().equals(HandshakeState.START)) {
            var meta = this.__currentUser.getMeta();
            var visa = this.__currentUser.getVisa();
            rMsg.setMeta(meta);
            rMsg.setVisa(visa)
        }
        var data = get_messenger().serializeMessage(rMsg);
        this.__session.sendPayload(data, StarShip.URGENT, null)
    };
    Server.prototype.handshakeAccepted = function() {
        var state = this.getCurrentState();
        if (!state.equals(ServerState.HANDSHAKING)) {
            console.log("server state not handshaking", state)
        }
        console.log("handshake accepted for user", this.__currentUser);
        this.__fsm.setSessionKey(this.__sessionKey);
        this.getDelegate().onHandshakeAccepted(this.__sessionKey, this)
    };
    Server.prototype.start = function() {
        get_messenger().setDelegate(this);
        if (!this.__session.isRunning()) {
            this.__session.start()
        }
    };
    Server.prototype.end = function() {
        if (this.__session.isRunning()) {
            this.__session.close()
        }
        this.__fsm.stop()
    };
    Server.prototype.pause = function() {
        if (this.__paused) {} else {
            this.__fsm.pause();
            this.__paused = true
        }
    };
    Server.prototype.resume = function() {
        if (this.__paused) {
            this.__fsm.resume();
            this.__paused = false
        }
    };
    Server.prototype.sendPackage = function(data, handler, priority) {
        var delegate = null;
        if (handler instanceof MessageTransmitter.CompletionHandler) {
            var callback = handler.callback;
            if (sdk.Interface.conforms(callback, Ship.Delegate)) {
                delegate = callback
            }
        }
        if (this.__session.sendPayload(data, priority, delegate)) {
            if (handler) {
                handler.onSuccess()
            }
            return true
        } else {
            if (handler) {
                handler.onFailed(new Error("failed to send data package"))
            }
            return false
        }
    };
    Server.prototype.uploadData = function(data, iMsg) {
        return null
    };
    Server.prototype.downloadData = function(url, iMsg) {
        return null
    };
    Server.prototype.enterState = function(state, machine) {
        var info = {
            "state": state.name
        };
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationServerStateChanged, this, info);
        if (state.equals(ServerState.HANDSHAKING)) {
            var session = this.session;
            this.session = null;
            this.handshake(session)
        } else {
            if (state.equals(ServerState.RUNNING)) {} else {
                if (state.equals(ServerState.ERROR)) {
                    console.error("Station connection error!");
                    nc.postNotification(ns.kNotificationStationError, this, null)
                }
            }
        }
    };
    Server.prototype.exitState = function(state, machine) {};
    Server.prototype.pauseState = function(state, machine) {};
    Server.prototype.resumeState = function(state, machine) {};
    ns.network.Server = Server;
    ns.network.registers("Server")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var Gate = sdk.startrek.Gate;
    var WSDocker = sdk.stargate.WSDocker;
    var BaseSession = ns.network.BaseSession;
    var Session = function(host, port, messenger) {
        BaseSession.call(this, host, port, messenger);
        this.__docker = new WSDocker(this.gate)
    };
    sdk.Class(Session, BaseSession, null);
    Session.prototype.setup = function() {
        this.gate.setDocker(this.__docker);
        this.setActive(true);
        return BaseSession.prototype.setup.call(this)
    };
    Session.prototype.finish = function() {
        var ok = BaseSession.prototype.finish.call(this);
        this.setActive(false);
        this.gate.setDocker(null);
        return ok
    };
    Session.prototype.sendPayload = function(payload, priority, delegate) {
        if (this.isActive()) {
            return this.gate.sendPayload(payload, priority, delegate)
        } else {
            return false
        }
    };
    Session.prototype.onGateStatusChanged = function(gate, oldStatus, newStatus) {
        BaseSession.prototype.onGateStatusChanged.call(this, gate, oldStatus, newStatus);
        if (newStatus.equals(Gate.Status.CONNECTED)) {
            var delegate = this.getMessenger().getDelegate();
            if (delegate instanceof ns.network.Server) {
                delegate.handshake(null)
            }
        }
    };
    ns.network.Session = Session;
    ns.network.registers("Session")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var get_facebook = function() {
        return ns.Facebook.getInstance()
    };
    var get_messenger = function() {
        return ns.Messenger.getInstance()
    };
    var Terminal = function() {
        this.__server = null;
        get_messenger().setTerminal(this)
    };
    sdk.Class(Terminal, null, null);
    Terminal.prototype.getUserAgent = function() {
        return navigator.userAgent
    };
    Terminal.prototype.getCurrentServer = function() {
        return this.__server
    };
    var set_server = function(server) {
        if (this.__server) {
            if (!server || !this.__server.equals(server)) {
                this.__server.end()
            }
        }
        this.__server = server
    };
    var is_new_server = function(host, port) {
        var current = this.__server;
        if (current) {
            return current.getPort() !== port || current.getHost() !== host
        } else {
            return true
        }
    };
    Terminal.prototype.getCurrentUser = function() {
        if (this.__server) {
            return this.__server.getCurrentUser()
        } else {
            return null
        }
    };
    var start = function(identifier, host, port) {
        var messenger = get_messenger();
        var facebook = get_facebook();
        var server = this.__server;
        if (is_new_server.call(this, host, port)) {
            set_server.call(this, null);
            server = new ns.network.Server(identifier, host, port);
            server.setDataSource(facebook);
            server.setDelegate(messenger);
            server.start();
            set_server.call(this, server)
        }
        var user = facebook.getCurrentUser();
        if (user && server) {
            server.setCurrentUser(user);
            server.handshake(null)
        }
    };
    Terminal.prototype.launch = function(options) {
        var identifier = options["ID"];
        var host = options["host"];
        var port = options["port"];
        start.call(this, identifier, host, port)
    };
    Terminal.prototype.terminate = function() {
        set_server.call(this, null)
    };
    ns.network.Terminal = Terminal;
    ns.registers("Terminal")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var Observer = sdk.lnc.Observer;
    var Terminal = ns.network.Terminal;
    var Client = function() {
        Terminal.call(this)
    };
    sdk.Class(Client, Terminal, [Observer]);
    Client.prototype.onReceiveNotification = function(notification) {
        console.log("received notification: ", notification)
    };
    var s_client = null;
    Client.getInstance = function() {
        if (!s_client) {
            s_client = new Client()
        }
        return s_client
    };
    ns.network.Client = Client;
    ns.network.registers("Client")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ID = sdk.protocol.ID;
    var Visa = sdk.protocol.Visa;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    var CommonFacebook = ns.CommonFacebook;
    var get_messenger = function() {
        return ns.Messenger.getInstance()
    };
    var Facebook = function() {
        CommonFacebook.call(this)
    };
    sdk.Class(Facebook, CommonFacebook, null);
    Facebook.prototype.getAvatar = function(identifier) {
        var doc = this.getDocument(identifier, "*");
        if (doc) {
            if (sdk.Interface.conforms(doc, Visa)) {
                return doc.getAvatar()
            } else {
                return doc.getProperty("avatar")
            }
        }
        return null
    };
    Facebook.prototype.saveMeta = function(meta, identifier) {
        if (!CommonFacebook.prototype.saveMeta.call(this, meta, identifier)) {
            return false
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMetaAccepted, this, {
            "ID": identifier,
            "meta": meta
        });
        return true
    };
    Facebook.prototype.saveDocument = function(doc) {
        if (!CommonFacebook.prototype.saveDocument.call(this, doc)) {
            return false
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationDocumentUpdated, this, doc.getMap());
        return true
    };
    Facebook.prototype.addContact = function(contact, user) {
        if (!CommonFacebook.prototype.addContact.call(this, contact, user)) {
            return false
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationContactsUpdated, this, {
            "user": user,
            "contact": contact,
            "action": "add"
        });
        return true
    };
    Facebook.prototype.removeContact = function(contact, user) {
        if (!CommonFacebook.prototype.removeContact.call(this, contact, user)) {
            return false
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationContactsUpdated, this, {
            "user": user,
            "contact": contact,
            "action": "remove"
        });
        return true
    };
    Facebook.prototype.addMember = function(member, group) {
        if (!CommonFacebook.prototype.addMember.call(this, member, group)) {
            return false
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMembersUpdated, this, {
            "group": group,
            "member": member,
            "action": "add"
        });
        return true
    };
    Facebook.prototype.removeMember = function(member, group) {
        if (!CommonFacebook.prototype.removeMember.call(this, member, group)) {
            return false
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMembersUpdated, this, {
            "group": group,
            "member": member,
            "action": "remove"
        });
        return true
    };
    Facebook.prototype.saveMembers = function(members, group) {
        if (!CommonFacebook.prototype.saveMembers.call(this, members, group)) {
            return false
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMembersUpdated, this, {
            "group": group,
            "members": members,
            "action": "update"
        });
        return true
    };
    Facebook.prototype.removeGroup = function(group) {
        if (!CommonFacebook.prototype.removeGroup.call(this, group)) {
            return false
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationGroupRemoved, this, {
            "group": group,
            "action": "remove"
        });
        return true
    };
    Facebook.prototype.getMeta = function(identifier) {
        var meta = CommonFacebook.prototype.getMeta.call(this, identifier);
        if (!meta) {
            if (identifier.isBroadcast()) {
                return null
            }
            get_messenger().queryMeta(identifier)
        }
        return meta
    };
    Facebook.prototype.getDocument = function(identifier, type) {
        var doc = CommonFacebook.prototype.getDocument.call(this, identifier, type);
        if (!doc || this.isExpiredDocument(doc, true)) {
            if (identifier.isBroadcast()) {
                return null
            }
            get_messenger().queryDocument(identifier, type)
        }
        return doc
    };
    Facebook.prototype.getContacts = function(user) {
        var contacts = CommonFacebook.prototype.getContacts.call(this, user);
        if (!contacts || contacts.length === 0) {}
        return contacts
    };
    Facebook.prototype.getMembers = function(group) {
        var members = CommonFacebook.prototype.getMembers.call(this, group);
        if (!members || members.length === 0) {
            console.log("querying members", group);
            var gm = new ns.GroupManager(group);
            gm.query()
        }
        return members
    };
    Facebook.prototype.getAssistants = function(group) {
        var assistants = ["assistant@4WBSiDzg9cpZGPqFrQ4bHcq4U5z9QAQLHS", "assistant@2PpB6iscuBjA15oTjAsiswoX9qis5V3c1Dq"];
        return ID.convert(assistants)
    };
    var s_facebook = null;
    Facebook.getInstance = function() {
        if (!s_facebook) {
            s_facebook = new Facebook()
        }
        return s_facebook
    };
    ns.Facebook = Facebook
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var MetaCommand = sdk.protocol.MetaCommand;
    var DocumentCommand = sdk.protocol.DocumentCommand;
    var GroupCommand = sdk.protocol.GroupCommand;
    var get_messenger = function() {
        return ns.Messenger.getInstance()
    };
    var get_facebook = function() {
        return ns.Facebook.getInstance()
    };
    var send_command = function(cmd) {
        get_messenger().sendCommand(cmd, 0)
    };
    var send_group_command = function(cmd, receiver) {
        var members;
        if (receiver instanceof Array) {
            members = receiver
        } else {
            members = [receiver]
        }
        var messenger = get_messenger();
        var facebook = get_messenger();
        var user = facebook.getCurrentUser();
        var sender = user.identifier;
        for (var i = 0; i < members.length; ++i) {
            messenger.sendContent(sender, members[i], cmd, null, 0)
        }
    };
    var GroupManager = function(group) {
        this.__group = group
    };
    GroupManager.prototype.send = function(content) {
        var gid = content.getGroup();
        if (gid) {
            if (!this.__group.equals(gid)) {
                throw new Error("group ID not match: " + this.__group + ", " + gid)
            }
        } else {
            content.setGroup(this.__group)
        }
        var facebook = get_facebook();
        var members = facebook.getMembers(this.__group);
        if (!members || members.length === 0) {
            var assistants = facebook.getAssistants(this.__group);
            if (!assistants || assistants.length === 0) {
                throw new Error("failed to get assistants for group: " + this.__group)
            }
            get_messenger().queryGroupInfo(this.__group, assistants);
            return false
        }
        return get_messenger().sendContent(null, this.__group, content, null, 0)
    };
    GroupManager.prototype.invite = function(newMembers) {
        var facebook = get_facebook();
        var group = this.__group;
        var bots = facebook.getAssistants(group);
        var members = facebook.getMembers(group);
        if (!members) {
            members = []
        }
        var count = members.length;
        var meta = facebook.getMeta(group);
        if (!meta) {
            throw new ReferenceError("failed to get meta for group: " + group.toString())
        }
        var cmd;
        var doc = facebook.getDocument(group, "*");
        if (doc) {
            cmd = DocumentCommand.response(group, meta, doc)
        } else {
            cmd = MetaCommand.response(group, meta)
        }
        if (count <= 2) {
            send_command(cmd);
            send_group_command(cmd, bots);
            members = addMembers(newMembers, group);
            send_group_command(cmd, members);
            cmd = GroupCommand.invite(group, members);
            send_group_command(cmd, bots);
            send_group_command(cmd, members)
        } else {
            send_command(cmd);
            send_group_command(cmd, bots);
            send_group_command(cmd, newMembers);
            cmd = GroupCommand.invite(group, newMembers);
            send_group_command(cmd, bots);
            send_group_command(cmd, members);
            members = addMembers(newMembers, group);
            cmd = GroupCommand.invite(group, members);
            send_group_command(cmd, newMembers)
        }
        return true
    };
    GroupManager.prototype.expel = function(outMembers) {
        var facebook = get_facebook();
        var group = this.__group;
        var owner = facebook.getOwner(group);
        var bots = facebook.getAssistants(group);
        var members = facebook.getMembers(group);
        if (!members) {
            members = []
        }
        var i;
        for (i = 0; i < bots.length; ++i) {
            if (outMembers.indexOf(bots[i]) >= 0) {
                throw new Error("Cannot expel group assistant: " + bots[i])
            }
        }
        if (outMembers.indexOf(owner) >= 0) {
            throw new Error("Cannot expel group owner: " + bots[i])
        }
        var cmd = GroupCommand.expel(group, outMembers);
        send_group_command(cmd, bots);
        send_group_command(cmd, members);
        if (owner && members.indexOf(owner) < 0) {
            send_group_command(cmd, owner)
        }
        return removeMembers(outMembers, group)
    };
    GroupManager.prototype.quit = function() {
        var facebook = get_facebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw new ReferenceError("failed to get current user")
        }
        var group = this.__group;
        var owner = facebook.getOwner(group);
        var bots = facebook.getAssistants(group);
        var members = facebook.getMembers(group);
        if (!members) {
            members = []
        }
        if (bots.indexOf(user.identifier) >= 0) {
            throw new Error("Group assistant cannot quit: " + user.identifier)
        }
        if (user.identifier.equals(owner)) {
            throw new Error("Group owner cannot quit: " + user.identifier)
        }
        var cmd = GroupCommand.quit(group);
        send_group_command(cmd, bots);
        send_group_command(cmd, members);
        if (owner && members.indexOf(owner) < 0) {
            send_group_command(cmd, owner)
        }
        return facebook.removeGroup(group)
    };
    var addMembers = function(newMembers, group) {
        var facebook = get_facebook();
        var members = facebook.getMembers(group);
        var count = 0;
        var member;
        for (var i = 0; i < newMembers.length; ++i) {
            member = newMembers[i];
            if (members.indexOf(member) < 0) {
                members.push(member);
                ++count
            }
        }
        return count > 0 && facebook.saveMembers(members, group)
    };
    var removeMembers = function(outMembers, group) {
        var facebook = get_facebook();
        var members = facebook.getMembers(group);
        var count = 0;
        var pos;
        for (var i = 0; i < outMembers.length; ++i) {
            pos = members.indexOf(outMembers[i]);
            if (pos >= 0) {
                members.splice(pos, 1);
                ++count
            }
        }
        return count > 0 && facebook.saveMembers(members, group)
    };
    ns.GroupManager = GroupManager;
    ns.registers("GroupManager")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var SymmetricKey = sdk.crypto.SymmetricKey;
    var ID = sdk.protocol.ID;
    var MetaCommand = sdk.protocol.MetaCommand;
    var DocumentCommand = sdk.protocol.DocumentCommand;
    var LoginCommand = sdk.protocol.LoginCommand;
    var StorageCommand = sdk.protocol.StorageCommand;
    var QueryCommand = sdk.protocol.group.QueryCommand;
    var ReportCommand = ns.protocol.ReportCommand;
    var SearchCommand = ns.protocol.SearchCommand;
    var CommonFacebook = ns.CommonFacebook;
    var CommonMessenger = ns.CommonMessenger;
    var StationDelegate = ns.network.StationDelegate;
    var Messenger = function() {
        CommonMessenger.call(this);
        this.__terminal = null;
        this.__offlineTime = null;
        this.__metaQueryExpires = {};
        this.__docQueryExpires = {};
        this.__groupQueryExpires = {}
    };
    sdk.Class(Messenger, CommonMessenger, [StationDelegate]);
    var QUERY_INTERVAL = 120 * 1000;
    Messenger.prototype.getEntityDelegate = function() {
        if (!this.__barrack) {
            this.__barrack = ns.Facebook.getInstance()
        }
        return this.__barrack
    };
    Messenger.prototype.getProcessor = function() {
        if (!this.__processor) {
            this.__processor = new ns.MessageProcessor(this)
        }
        return this.__processor
    };
    Messenger.prototype.getDataSource = function() {
        if (!this.__datasource) {
            this.__datasource = ns.MessageDataSource
        }
        return this.__datasource
    };
    Messenger.prototype.getTerminal = function() {
        return this.__terminal
    };
    Messenger.prototype.setTerminal = function(client) {
        this.__terminal = client
    };
    Messenger.prototype.getCurrentServer = function() {
        return this.__terminal.getCurrentServer()
    };
    Messenger.prototype.getCurrentUser = function() {
        return this.__terminal.getCurrentUser()
    };
    Messenger.prototype.sendCommand = function(cmd, priority) {
        var server = this.getCurrentServer();
        if (!server) {
            console.error("current server not found");
            return false
        }
        return this.sendContent(null, server.identifier, cmd, null, priority)
    };
    Messenger.prototype.broadcastContent = function(content) {
        content.setGroup(ID.EVERYONE);
        return this.sendContent(null, ID.EVERYONE, content, null, 1)
    };
    Messenger.prototype.broadcastVisa = function(doc) {
        var user = this.getCurrentUser();
        if (!user) {
            throw new ReferenceError("login first")
        }
        var identifier = doc.getIdentifier();
        if (!user.identifier.equals(identifier)) {
            throw new ReferenceError("visa document error" + doc.getMap())
        }
        doc.setValue(CommonFacebook.EXPIRES_KEY, null);
        var contacts = user.getContacts();
        if (contacts && contacts.length > 0) {
            var cmd = DocumentCommand.response(identifier, null, doc);
            for (var i = 0; i < contacts.length; ++i) {
                this.sendContent(identifier, contacts[i], cmd, null, 1)
            }
        }
    };
    Messenger.prototype.postDocument = function(doc, meta) {
        doc.setValue(CommonFacebook.EXPIRES_KEY, null);
        var cmd = DocumentCommand.response(doc.getIdentifier(), meta, doc);
        return this.sendCommand(cmd, 1)
    };
    Messenger.prototype.postContacts = function(contacts) {
        var facebook = this.getFacebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw new Error("login first")
        }
        var pwd = SymmetricKey.generate(SymmetricKey.AES);
        var data = sdk.format.JSON.encode(contacts);
        data = pwd.encrypt(data);
        var key = sdk.format.JSON.encode(pwd);
        key = user.encrypt(key);
        var cmd = new StorageCommand(StorageCommand.CONTACTS);
        cmd.setIdentifier(user.identifier);
        cmd.setData(data);
        cmd.setKey(key);
        return this.sendCommand(cmd, 1)
    };
    Messenger.prototype.queryContacts = function() {
        var facebook = this.getFacebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw new Error("current user not found")
        }
        var cmd = new StorageCommand(StorageCommand.CONTACTS);
        cmd.setIdentifier(user.identifier);
        return this.sendCommand(cmd, 1)
    };
    Messenger.prototype.queryMeta = function(identifier) {
        if (identifier.isBroadcast()) {
            return false
        }
        var now = (new Date()).getTime();
        var expires = this.__metaQueryExpires[identifier];
        if (expires && now < expires) {
            return false
        }
        this.__metaQueryExpires[identifier] = now + QUERY_INTERVAL;
        console.log("querying meta", identifier);
        var cmd = new MetaCommand(identifier);
        return this.sendCommand(cmd, 1)
    };
    Messenger.prototype.queryDocument = function(identifier, type) {
        if (identifier.isBroadcast()) {
            return false
        }
        var now = (new Date()).getTime();
        var expires = this.__docQueryExpires[identifier];
        if (expires && now < expires) {
            return false
        }
        this.__docQueryExpires[identifier] = now + QUERY_INTERVAL;
        console.log("querying document", identifier, type);
        var cmd = new DocumentCommand(identifier);
        return this.sendCommand(cmd, 1)
    };
    Messenger.prototype.queryGroupInfo = function(group, member) {
        if (group.isBroadcast()) {
            return false
        }
        if (members.length === 0) {
            return false
        }
        var currentUser = this.getCurrentUser();
        var times = this.__groupQueryExpires[group];
        if (!times) {
            times = {};
            this.__groupQueryExpires[group] = times
        }
        var members;
        if (member instanceof Array) {
            members = member
        } else {
            members = [member]
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
                continue
            }
            times[user] = now + QUERY_INTERVAL;
            console.log("querying group", group, user);
            if (this.sendContent(currentUser.identifier, user, cmd, null, 1)) {
                checking = true
            }
        }
        return checking
    };
    Messenger.prototype.search = function(keywords) {
        if (keywords === SearchCommand.ONLINE_USERS) {
            return this.sendCommand(new SearchCommand(), 0)
        } else {
            var cmd = new SearchCommand(keywords);
            var bot = ID.parse("archivist@anywhere");
            return this.sendContent(null, bot, cmd, null, 0)
        }
    };
    Messenger.prototype.reportOnline = function() {
        var user = this.getCurrentUser();
        if (!user) {
            console.error("current user not set yet");
            return
        }
        var cmd = new ReportCommand(ReportCommand.ONLINE);
        if (this.__offlineTime) {
            cmd.setValue("last_time", this.__offlineTime.getTime() / 1000)
        }
        this.sendCommand(cmd, 0)
    };
    Messenger.prototype.reportOffline = function() {
        var user = this.getCurrentUser();
        if (!user) {
            console.error("current user not set yet");
            return
        }
        var cmd = new ReportCommand(ReportCommand.OFFLINE);
        this.__offlineTime = cmd.getTime();
        this.sendCommand(cmd, 0)
    };
    Messenger.prototype.onReceivePackage = function(data, server) {
        try {
            var res = this.processData(data);
            if (res && res.length > 0) {
                server.sendPackage(res, null, 1)
            }
        } catch (e) {
            console.error("failed to process data", data, e)
        }
    };
    Messenger.prototype.didSendPackage = function(data, server) {};
    Messenger.prototype.didFailToSendPackage = function(error, data, server) {};
    Messenger.prototype.onHandshakeAccepted = function(session, server) {
        var user = this.getCurrentUser();
        var login = new LoginCommand(user.identifier);
        login.setAgent(this.getTerminal().getUserAgent());
        login.setStation(server);
        this.broadcastContent(login)
    };
    var s_messenger = null;
    Messenger.getInstance = function() {
        if (!s_messenger) {
            s_messenger = new Messenger()
        }
        return s_messenger
    };
    ns.Messenger = Messenger
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var NetworkType = sdk.protocol.NetworkType;
    var Envelope = sdk.protocol.Envelope;
    var InstantMessage = sdk.protocol.InstantMessage;
    var HandshakeCommand = sdk.protocol.HandshakeCommand;
    var ReceiptCommand = sdk.protocol.ReceiptCommand;
    var CommonProcessor = ns.CommonProcessor;
    var MessageProcessor = function(messenger) {
        CommonProcessor.call(this, messenger)
    };
    sdk.Class(MessageProcessor, CommonProcessor, null);
    MessageProcessor.prototype.processContent = function(content, rMsg) {
        console.log("process content", content, rMsg);
        var res = CommonProcessor.prototype.processContent.call(this, content, rMsg);
        if (!res) {
            return null
        }
        if (res instanceof HandshakeCommand) {
            return res
        }
        var sender = rMsg.getSender();
        if (res instanceof ReceiptCommand) {
            if (NetworkType.STATION.equals(sender.getType())) {
                return null
            }
            console.log("receipt to sender", sender)
        }
        var receiver = rMsg.getReceiver();
        var user = this.getFacebook().selectLocalUser(receiver);
        var env = Envelope.create(user.identifier, sender, null);
        var iMsg = InstantMessage.create(env, res);
        this.getMessenger().sendInstantMessage(iMsg, null, 1);
        return null
    };
    ns.MessageProcessor = MessageProcessor;
    ns.registers("MessageProcessor")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var Command = sdk.protocol.Command;
    var StorageCommand = sdk.protocol.StorageCommand;
    var CommandProcessor = sdk.cpu.CommandProcessor;
    var SearchCommand = ns.protocol.SearchCommand;
    var HandshakeCommandProcessor = ns.cpu.HandshakeCommandProcessor;
    var LoginCommandProcessor = ns.cpu.LoginCommandProcessor;
    var SearchCommandProcessor = ns.cpu.SearchCommandProcessor;
    var StorageCommandProcessor = ns.cpu.StorageCommandProcessor;
    var registerCommandProcessors = function() {
        CommandProcessor.register(Command.HANDSHAKE, new HandshakeCommandProcessor());
        CommandProcessor.register(Command.LOGIN, new LoginCommandProcessor());
        var search = new SearchCommandProcessor();
        CommandProcessor.register(SearchCommand.SEARCH, search);
        CommandProcessor.register(SearchCommand.ONLINE_USERS, search);
        var storage = new StorageCommandProcessor();
        CommandProcessor.register(StorageCommand.STORAGE, storage);
        CommandProcessor.register(StorageCommand.CONTACTS, storage);
        CommandProcessor.register(StorageCommand.PRIVATE_KEY, storage)
    };
    registerCommandProcessors()
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var PrivateKey = sdk.crypto.PrivateKey;
    var NetworkType = sdk.protocol.NetworkType;
    var MetaType = sdk.protocol.MetaType;
    var Meta = sdk.protocol.Meta;
    var Document = sdk.protocol.Document;
    var get_facebook = function() {
        return ns.Facebook.getInstance()
    };
    var get_messenger = function() {
        return ns.Messenger.getInstance()
    };
    var Register = function(type) {
        if (type) {
            this.network = type
        } else {
            this.network = NetworkType.MAIN
        }
        this.__privateKey = null
    };
    Register.prototype.createUser = function(name, avatar) {
        this.__privateKey = PrivateKey.generate(PrivateKey.RSA);
        var meta = Meta.generate(MetaType.DEFAULT, this.__privateKey, "web-demo");
        var identifier = meta.generateID(NetworkType.MAIN, null);
        var doc = this.createDocument(identifier, {
            name: name,
            avatar: avatar
        });
        var facebook = get_facebook();
        facebook.saveMeta(meta, identifier);
        facebook.savePrivateKey(identifier, this.__privateKey, "M", 0, 0);
        facebook.saveDocument(doc);
        return facebook.getUser(identifier)
    };
    Register.prototype.createGroup = function(founder, name, seed) {
        if (!seed) {
            var r = Math.ceil(Math.random() * 999990000) + 10000;
            seed = "Group-" + r
        }
        var facebook = get_facebook();
        this.__privateKey = facebook.getPrivateKeyForVisaSignature(founder);
        var meta = Meta.generate(MetaType.DEFAULT, this.__privateKey, seed);
        var identifier = meta.generateID(NetworkType.POLYLOGUE, null);
        var doc = this.createDocument(identifier, {
            name: name
        });
        facebook.saveMeta(meta, identifier);
        facebook.saveDocument(doc);
        facebook.addMember(founder, identifier);
        return facebook.getGroup(identifier)
    };
    Register.prototype.createDocument = function(identifier, properties) {
        var doc = Document.parse({
            "ID": identifier.toString()
        });
        if (properties) {
            var keys = Object.keys(properties);
            var name, value;
            for (var i = 0; i < keys.length; ++i) {
                name = keys[i];
                value = properties[name];
                if (name && value) {
                    doc.setProperty(name, value)
                }
            }
        }
        doc.sign(this.__privateKey);
        return doc
    };
    Register.prototype.upload = function(identifier, meta, doc) {
        if (!doc.getIdentifier().equals(identifier)) {
            throw new Error("document ID not match: " + identifier.toString() + ", " + doc.getMap())
        }
        return get_messenger().postDocument(doc, meta)
    };
    ns.Register = Register;
    ns.registers("Register")
})(SECHAT, DIMSDK);
