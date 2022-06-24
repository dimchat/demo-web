/**
 *  DIM-Client (v0.2.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Jun. 20, 2022
 * @copyright (c) 2022 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
(function (ns, sdk) {
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
        ns.model = new sdk.Namespace();
    }
    ns.registers("model");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var BaseCommandProcessor = sdk.cpu.BaseCommandProcessor;
    var HandshakeCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    sdk.Class(HandshakeCommandProcessor, BaseCommandProcessor, null, null);
    var success = function () {
        console.log("handshake success!");
        var messenger = this.getMessenger();
        var server = messenger.getCurrentServer();
        server.handshakeAccepted();
        return null;
    };
    var restart = function (session) {
        console.log("handshake again", session);
        var messenger = this.getMessenger();
        var server = messenger.getCurrentServer();
        server.handshake(session);
        return null;
    };
    HandshakeCommandProcessor.prototype.process = function (cmd, rMsg) {
        var message = cmd.getMessage();
        if (message === "DIM!" || message === "OK!") {
            return success.call(this);
        } else {
            if (message === "DIM?") {
                return restart.call(this, cmd.getSessionKey());
            } else {
                throw new Error("handshake command error: " + cmd);
            }
        }
    };
    ns.cpu.HandshakeCommandProcessor = HandshakeCommandProcessor;
    ns.cpu.registers("HandshakeCommandProcessor");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var BaseCommandProcessor = sdk.cpu.BaseCommandProcessor;
    var LoginCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    sdk.Class(LoginCommandProcessor, BaseCommandProcessor, null, null);
    LoginCommandProcessor.prototype.process = function (cmd, rMsg) {
        return null;
    };
    ns.cpu.LoginCommandProcessor = LoginCommandProcessor;
    ns.cpu.registers("LoginCommandProcessor");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ID = sdk.protocol.ID;
    var Meta = sdk.protocol.Meta;
    var InstantMessage = sdk.protocol.InstantMessage;
    var BaseCommandProcessor = sdk.cpu.BaseCommandProcessor;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    var SearchCommand = ns.protocol.SearchCommand;
    var SearchCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    sdk.Class(SearchCommandProcessor, BaseCommandProcessor, null, null);
    var user_info = function (string, facebook) {
        var identifier = ID.parse(string);
        if (!identifier) {
            return string;
        }
        var nickname = facebook.getName(identifier);
        return identifier + ' "' + nickname + '"';
    };
    SearchCommandProcessor.prototype.process = function (cmd, rMsg) {
        var facebook = this.getFacebook();
        var users = cmd.getUsers();
        var online = cmd.getCommand() === SearchCommand.ONLINE_USERS;
        var cnt = users ? users.length : 0;
        var text;
        if (cnt === 0) {
            if (online) {
                text = "No user online now.";
            } else {
                text = "User not found.";
            }
        } else {
            if (cnt === 1) {
                if (online) {
                    text = "One user online now,\n" + user_info(users[0], facebook);
                } else {
                    text = "Got one user,\n" + user_info(users[0], facebook);
                }
            } else {
                if (online) {
                    text = cnt + " users online now,";
                } else {
                    text = "Got " + cnt + " users,";
                }
                for (var i = 0; i < cnt; ++i) {
                    text += "\n" + user_info(users[i], facebook);
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
        cmd.setValue("text", text);
        var iMsg = InstantMessage.create(rMsg.getEnvelope(), cmd);
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMessageUpdated, this, {
            ID: rMsg.getSender(),
            msg: iMsg
        });
        return null;
    };
    ns.cpu.SearchCommandProcessor = SearchCommandProcessor;
    ns.cpu.registers("SearchCommandProcessor");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var StorageCommand = sdk.protocol.StorageCommand;
    var BaseCommandProcessor = sdk.cpu.BaseCommandProcessor;
    var StorageCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    sdk.Class(StorageCommandProcessor, BaseCommandProcessor, null, null);
    StorageCommandProcessor.prototype.process = function (cmd, rMsg) {
        var title = cmd.getTitle();
        if (title === StorageCommand.CONTACTS) {
        } else {
            if (title === StorageCommand.PRIVATE_KEY) {
            }
        }
        return null;
    };
    ns.cpu.StorageCommandProcessor = StorageCommandProcessor;
    ns.cpu.registers("StorageCommandProcessor");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var Command = sdk.protocol.Command;
    var StorageCommand = sdk.protocol.StorageCommand;
    var SearchCommand = sdk.protocol.SearchCommand;
    var HandshakeCommandProcessor = ns.cpu.HandshakeCommandProcessor;
    var LoginCommandProcessor = ns.cpu.LoginCommandProcessor;
    var StorageCommandProcessor = ns.cpu.StorageCommandProcessor;
    var SearchCommandProcessor = ns.cpu.SearchCommandProcessor;
    var CommonProcessorCreator = sdk.cpu.CommonProcessorCreator;
    var ClientProcessorCreator = function (facebook, messenger) {
        CommonProcessorCreator.call(this, facebook, messenger);
    };
    sdk.Class(ClientProcessorCreator, CommonProcessorCreator, null, {
        createCommandProcessor: function (type, command) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (Command.HANDSHAKE === command) {
                return new HandshakeCommandProcessor(facebook, messenger);
            }
            if (Command.LOGIN === command) {
                return new LoginCommandProcessor(facebook, messenger);
            }
            if (
                StorageCommand.STORAGE === command ||
                StorageCommand.CONTACTS === command ||
                StorageCommand.PRIVATE_KEY === command
            ) {
                return new StorageCommandProcessor(facebook, messenger);
            }
            if (
                SearchCommand.SEARCH === command ||
                SearchCommand.ONLINE_USERS === command
            ) {
                return new SearchCommandProcessor(facebook, messenger);
            }
            return CommonProcessorCreator.prototype.createCommandProcessor.call(
                this,
                type,
                command
            );
        }
    });
    ns.cpu.ClientProcessorCreator = ClientProcessorCreator;
    ns.cpu.registers("ClientProcessorCreator");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ReceiptCommand = sdk.protocol.ReceiptCommand;
    var get_conversation_db = function () {
        return ns.ConversationDatabase;
    };
    ns.Amanuensis = {
        getConversation: function (identifier) {
            var facebook = ns.ClientFacebook.getInstance();
            var entity = null;
            if (identifier.isUser()) {
                entity = facebook.getUser(identifier);
            } else {
                if (identifier.isGroup()) {
                    entity = facebook.getGroup(identifier);
                }
            }
            if (!entity) {
                return null;
            }
            var chatBox = new ns.Conversation(entity);
            chatBox.database = get_conversation_db();
            return chatBox;
        },
        saveMessage: function (iMsg) {
            if (sdk.Interface.conforms(iMsg.getContent(), ReceiptCommand)) {
                return this.saveReceipt(iMsg);
            }
            var chatBox = get_conversation.call(this, iMsg);
            if (chatBox) {
                return chatBox.insertMessage(iMsg);
            } else {
                return false;
            }
        },
        saveReceipt: function (iMsg) {
            var chatBox = get_conversation.call(this, iMsg);
            if (chatBox) {
                return chatBox.saveReceipt(iMsg);
            } else {
                return false;
            }
        }
    };
    var get_conversation = function (iMsg) {
        var receiver = iMsg.getReceiver();
        if (receiver.isGroup()) {
            return this.getConversation(receiver);
        }
        var group = iMsg.getGroup();
        if (group) {
            return this.getConversation(group);
        }
        var facebook = ns.ClientFacebook.getInstance();
        var sender = iMsg.getSender();
        var user = facebook.getCurrentUser();
        if (user.getIdentifier().equals(sender)) {
            return this.getConversation(receiver);
        } else {
            return this.getConversation(sender);
        }
    };
})(SECHAT, DIMSDK);
(function (ns, sdk) {
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
        return ns.ClientMessenger.getInstance();
    };
    var get_facebook = function () {
        return ns.ClientFacebook.getInstance();
    };
    var get_clerk = function () {
        return ns.Amanuensis;
    };
    var MessageDataSource = {
        onReceiveNotification: function (notification) {
            var name = notification.name;
            if (
                name !== ns.kNotificationMetaAccepted &&
                name !== ns.kNotificationDocumentUpdated
            ) {
                return;
            }
            var userInfo = notification.userInfo;
            var messenger = get_messenger();
            var facebook = get_facebook();
            var entity;
            if (sdk.Interface.conforms(userInfo, sdk.type.Mapper)) {
                entity = ID.parse(userInfo.getValue("ID"));
            } else {
                entity = ID.parse(userInfo["ID"]);
            }
            if (entity.isUser()) {
                if (!facebook.getPublicKeyForEncryption(entity)) {
                    console.error("user not ready yet: " + entity);
                    return;
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
                        messenger.sendReliableMessage(res, null, 1);
                    }
                }
            }
            var outgoing = this.__outgoing[entity];
            if (outgoing) {
                delete this.__outgoing[entity];
                for (var j = 0; j < outgoing.length; ++j) {
                    messenger.sendInstantMessage(outgoing[j], null, 1);
                }
            }
        },
        saveMessage: function (iMsg) {
            var content = iMsg.getContent();
            if (ns.Interface.conforms(content, HandshakeCommand)) {
                return true;
            }
            if (ns.Interface.conforms(content, ReportCommand)) {
                return true;
            }
            if (ns.Interface.conforms(content, LoginCommand)) {
                return true;
            }
            if (ns.Interface.conforms(content, MetaCommand)) {
                return true;
            }
            if (
                ns.Interface.conforms(content, MuteCommand) ||
                ns.Interface.conforms(content, BlockCommand)
            ) {
                return true;
            }
            if (ns.Interface.conforms(content, SearchCommand)) {
                return true;
            }
            if (ns.Interface.conforms(content, ForwardContent)) {
                return true;
            }
            if (ns.Interface.conforms(content, InviteCommand)) {
                var me = iMsg.getReceiver();
                var group = content.getGroup();
                var messenger = get_messenger();
                var key = messenger
                    .getCipherKeyDelegate()
                    .getCipherKey(me, group, false);
                if (key != null) {
                    key.remove("reused");
                }
            }
            if (ns.Interface.conforms(content, QueryCommand)) {
                return true;
            }
            if (ns.Interface.conforms(content, ReceiptCommand)) {
                return get_clerk().saveReceipt(iMsg);
            } else {
                return get_clerk().saveMessage(iMsg);
            }
        },
        suspendInstantMessage: function (iMsg) {
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
        __outgoing: {},
        __incoming: {}
    };
    var nc = NotificationCenter.getInstance();
    nc.addObserver(MessageDataSource, ns.kNotificationMetaAccepted);
    nc.addObserver(MessageDataSource, ns.kNotificationDocumentUpdated);
    ns.MessageDataSource = MessageDataSource;
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ID = sdk.protocol.ID;
    ns.Configuration = {
        getDefaultProvider: function () {
            return this.__sp;
        },
        getDefaultContacts: function () {
            var info = this.__sp;
            var array = info.get("contacts");
            if (array) {
                return ID.convert(array);
            } else {
                return null;
            }
        },
        getUploadURL: function () {
            return "https://sechat.dim.chat/{ID}/upload";
        },
        getDownloadURL: function () {
            return "https://sechat.dim.chat/download/{ID}/{filename}";
        },
        getAvatarURL: function () {
            return "https://sechat.dim.chat/avatar/{ID}/{filename}";
        },
        getTermsURL: function () {
            return "https://wallet.dim.chat/dimchat/sechat/privacy.html";
        },
        getAboutURL: function () {
            return "https://dim.chat/sechat";
        },
        __sp: null
    };
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var NetworkType = sdk.protocol.NetworkType;
    var ContentType = sdk.protocol.ContentType;
    var Entity = sdk.mkm.Entity;
    var get_facebook = function () {
        return ns.ClientFacebook.getInstance();
    };
    var get_conversation_db = function () {
        return ns.ConversationDatabase;
    };
    var ConversationType = sdk.type.Enum(null, {
        Personal: NetworkType.MAIN,
        Group: NetworkType.GROUP
    });
    var Conversation = function (entity) {
        if (sdk.Interface.conforms(entity, Entity)) {
            entity = entity.getIdentifier();
        }
        this.identifier = entity;
        this.type = get_type(entity);
    };
    var get_type = function (identifier) {
        if (identifier.isUser()) {
            return ConversationType.Personal;
        } else {
            if (identifier.isGroup()) {
                return ConversationType.Group;
            } else {
                throw new TypeError("conversation type error: " + identifier);
            }
        }
    };
    Conversation.prototype.getIdentifier = function () {
        return this.identifier;
    };
    Conversation.prototype.getTitle = function () {
        var facebook = get_facebook();
        var name = facebook.getName(this.identifier);
        if (this.identifier.isGroup()) {
            var members = facebook.getMembers(this.identifier);
            if (members && members.length > 0) {
                return name + " (" + members.length + ")";
            } else {
                return name + " (...)";
            }
        } else {
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
        return get_conversation_db().lastMessage(this.identifier);
    };
    Conversation.prototype.getLastVisibleMessage = function () {
        var count = this.getNumberOfMessages();
        var iMsg, type;
        for (var index = count - 1; index >= 0; --index) {
            iMsg = this.getMessageAtIndex(index);
            if (!iMsg) {
                continue;
            }
            type = iMsg.getType();
            if (
                ContentType.TEXT.equals(type) ||
                ContentType.FILE.equals(type) ||
                ContentType.IMAGE.equals(type) ||
                ContentType.AUDIO.equals(type) ||
                ContentType.VIDEO.equals(type) ||
                ContentType.PAGE.equals(type) ||
                ContentType.MONEY.equals(type) ||
                ContentType.TRANSFER.equals(type)
            ) {
                return iMsg;
            }
        }
        return null;
    };
    Conversation.prototype.getNumberOfMessages = function () {
        return get_conversation_db().numberOfMessages(this.identifier);
    };
    Conversation.prototype.getNumberOfUnreadMessages = function () {
        return get_conversation_db().numberOfUnreadMessages(this.identifier);
    };
    Conversation.prototype.getMessageAtIndex = function (index) {
        return get_conversation_db().messageAtIndex(index, this.identifier);
    };
    Conversation.prototype.insertMessage = function (iMsg) {
        return get_conversation_db().insertMessage(iMsg, this.identifier);
    };
    Conversation.prototype.removeMessage = function (iMsg) {
        return get_conversation_db().removeMessage(iMsg, this.identifier);
    };
    Conversation.prototype.withdrawMessage = function (iMsg) {
        return get_conversation_db().withdrawMessage(iMsg, this.identifier);
    };
    Conversation.prototype.saveReceipt = function (iMsg) {
        return get_conversation_db().saveReceipt(iMsg, this.identifier);
    };
    ns.Conversation = Conversation;
    ns.registers("Conversation");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var Entity = sdk.mkm.Entity;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    var get_facebook = function () {
        return ns.ClientFacebook.getInstance();
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
            return yyyy + "/" + mm + "/" + dd + " " + hh + ":" + MM + ":" + ss;
        },
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
            if (user) {
                user = user.getIdentifier();
            } else {
                return null;
            }
            return this.messageTable.lastReceivedMessage(user);
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
            return chatBox.getIdentifier();
        } else {
            if (sdk.Interface.conforms(chatBox, Entity)) {
                return chatBox.getIdentifier();
            } else {
                return chatBox;
            }
        }
    };
    var post_updated = function (iMsg, identifier) {
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMessageUpdated, this, {
            ID: identifier,
            msg: iMsg
        });
    };
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ID = sdk.protocol.ID;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    ns.NetworkDatabase = {
        allProviders: function () {
            var providers = this.providerTable.getProviders();
            if (providers && providers.length > 0) {
                return providers;
            } else {
                return [default_provider()];
            }
        },
        addProvider: function (identifier, name, url, chosen) {
            return this.providerTable.addProvider(identifier, name, url, chosen);
        },
        allStations: function (sp) {
            return this.providerTable.getStations(sp);
        },
        addStation: function (sp, station, host, port, name, chosen) {
            if (
                !this.providerTable.addStation(sp, station, host, port, name, chosen)
            ) {
                return false;
            }
            var nc = NotificationCenter.getInstance();
            nc.postNotification(ns.kNotificationServiceProviderUpdated, this, {
                sp: sp,
                action: "add",
                station: station,
                chosen: chosen
            });
            return true;
        },
        chooseStation: function (sp, station) {
            if (!this.providerTable.chooseStation(sp, station)) {
                return false;
            }
            var nc = NotificationCenter.getInstance();
            nc.postNotification(ns.kNotificationServiceProviderUpdated, this, {
                sp: sp,
                action: "switch",
                station: station,
                chosen: 1
            });
            return true;
        },
        removeStation: function (sp, station, host, port) {
            if (!this.providerTable.removeStation(sp, station)) {
                return false;
            }
            var nc = NotificationCenter.getInstance();
            nc.postNotification(ns.kNotificationServiceProviderUpdated, this, {
                sp: sp,
                action: "remove",
                station: station,
                host: host,
                port: port
            });
            return true;
        },
        providerTable: null
    };
    var default_provider = function () {
        return null;
    };
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var State = sdk.fsm.State;
    var ServerState = function (name) {
        State.call(this);
        this.name = name;
        this.time = null;
    };
    sdk.Class(ServerState, State, null);
    ServerState.DEFAULT = "default";
    ServerState.CONNECTING = "connecting";
    ServerState.CONNECTED = "connected";
    ServerState.HANDSHAKING = "handshaking";
    ServerState.RUNNING = "running";
    ServerState.ERROR = "error";
    ServerState.prototype.equals = function (state) {
        if (state instanceof ServerState) {
            return this.name === state.name;
        } else {
            if (typeof state === "string") {
                return this.name === state;
            } else {
                throw new Error("state error: " + state);
            }
        }
    };
    ServerState.prototype.toString = function () {
        return "<ServerState:" + this.name + ">";
    };
    ServerState.prototype.toLocaleString = function () {
        return "<ServerState:" + this.name.toLocaleString() + ">";
    };
    ServerState.prototype.onEnter = function (machine) {
        console.assert(machine !== null, "machine empty");
        console.log("onEnter: ", this);
        this.time = new Date();
    };
    ServerState.prototype.onExit = function (machine) {
        console.assert(machine !== null, "machine empty");
        this.time = null;
    };
    ns.network.ServerState = ServerState;
    ns.network.registers("ServerState");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var Transition = sdk.fsm.Transition;
    var AutoMachine = sdk.fsm.AutoMachine;
    var DockerStatus = sdk.startrek.port.DockerStatus;
    var ServerState = ns.network.ServerState;
    var StateMachine = function (server) {
        AutoMachine.call(this, ServerState.DEFAULT);
        this.setDelegate(server);
        this.__session = null;
        set_state(this, default_state());
        set_state(this, connecting_state());
        set_state(this, connected_state());
        set_state(this, handshaking_state());
        set_state(this, running_state());
        set_state(this, error_state());
    };
    sdk.Class(StateMachine, AutoMachine, null, {
        getSessionKey: function () {
            return this.__session;
        },
        setSessionKey: function (session) {
            this.__session = session;
        },
        getServer: function () {
            return this.getDelegate();
        },
        getCurrentUser: function () {
            var server = this.getServer();
            return server ? server.getCurrentUser() : null;
        },
        getStatus: function () {
            var server = this.getServer();
            return server ? server.getStatus() : DockerStatus.ERROR;
        },
        getContext: function () {
            return this;
        },
        getCurrentState: function () {
            var state = AutoMachine.prototype.getCurrentState.call(this);
            if (!state) {
                state = this.getState(ServerState.DEFAULT);
            }
            return state;
        }
    });
    var set_state = function (fsm, state) {
        fsm.setState(state.name, state);
    };
    var new_transition = function (target, evaluate) {
        var trans = new Transition(target);
        trans.evaluate = evaluate;
        return trans;
    };
    var new_state = function (name, transitions) {
        var state = new ServerState(name);
        for (var i = 1; i < arguments.length; ++i) {
            state.addTransition(arguments[i]);
        }
        return state;
    };
    var default_state = function () {
        return new_state(
            ServerState.DEFAULT,
            new_transition(ServerState.CONNECTING, function (machine) {
                if (machine.getCurrentUser() === null) {
                    return false;
                }
                var status = machine.getStatus();
                return (
                    DockerStatus.PREPARING.equals(status) ||
                    DockerStatus.READY.equals(status)
                );
            })
        );
    };
    var connecting_state = function () {
        return new_state(
            ServerState.CONNECTING,
            new_transition(ServerState.CONNECTED, function (machine) {
                var status = machine.getStatus();
                return DockerStatus.READY.equals(status);
            }),
            new_transition(ServerState.ERROR, function (machine) {
                var status = machine.getStatus();
                return DockerStatus.ERROR.equals(status);
            })
        );
    };
    var connected_state = function () {
        return new_state(
            ServerState.CONNECTED,
            new_transition(ServerState.HANDSHAKING, function (machine) {
                return machine.getCurrentUser() !== null;
            }),
            new_transition(ServerState.ERROR, function (machine) {
                var status = machine.getStatus();
                return DockerStatus.ERROR.equals(status);
            })
        );
    };
    var handshaking_state = function () {
        return new_state(
            ServerState.HANDSHAKING,
            new_transition(ServerState.RUNNING, function (machine) {
                return machine.getSessionKey() !== null;
            }),
            new_transition(ServerState.CONNECTED, function (machine) {
                var state = machine.getCurrentState();
                var time = state.time;
                if (!time) {
                    return false;
                }
                var expired = time.getTime() + 16 * 1000;
                var now = new Date().getTime();
                if (now < expired) {
                    return false;
                }
                var status = machine.getStatus();
                return DockerStatus.READY.equals(status);
            }),
            new_transition(ServerState.ERROR, function (machine) {
                var status = machine.getStatus();
                return DockerStatus.ERROR.equals(status);
            })
        );
    };
    var running_state = function () {
        return new_state(
            ServerState.RUNNING,
            new_transition(ServerState.DEFAULT, function (machine) {
                return machine.getSessionKey() === null;
            }),
            new_transition(ServerState.ERROR, function (machine) {
                var status = machine.getStatus();
                return DockerStatus.ERROR.equals(status);
            })
        );
    };
    var error_state = function () {
        return new_state(
            ServerState.ERROR,
            new_transition(ServerState.DEFAULT, function (machine) {
                var status = machine.getStatus();
                return !DockerStatus.ERROR.equals(status);
            })
        );
    };
    ns.network.StateMachine = StateMachine;
    ns.network.registers("StateMachine");
})(SECHAT, DIMSDK);
(function (ns) {
    var HTTP = {
        get: function (url, callback) {
            var xhr = create();
            xhr.open("GET", url);
            xhr.responseType = "arraybuffer";
            xhr.onload = function (ev) {
                callback(ev.target, url);
            };
            xhr.send();
        },
        post: function (url, headers, body, callback) {
            var xhr = create();
            xhr.open("POST", url);
            xhr.responseType = "arraybuffer";
            xhr.onload = function (ev) {
                if (callback) {
                    callback(ev.target, url);
                }
            };
            if (headers) {
                set_headers(xhr, headers);
            }
            xhr.send(body);
        }
    };
    var create = function () {
        try {
            return new XMLHttpRequest();
        } catch (e) {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {
                    throw e;
                }
            }
        }
    };
    var set_headers = function (xhr, headers) {
        var keys = Object.keys(headers);
        var name;
        for (var i = 0; i < keys.length; ++i) {
            name = keys[i];
            xhr.setRequestHeader(name, headers[name]);
        }
    };
    ns.network.HTTP = HTTP;
    ns.network.registers("HTTP");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var HTTP = ns.network.HTTP;
    HTTP.upload = function (url, data, filename, name, callback) {
        var body = http_body(data, filename, name);
        this.post(
            url,
            { "Content-Type": CONTENT_TYPE, "Content-Length": "" + body.length },
            body,
            callback
        );
    };
    HTTP.download = function (url, callback) {
        if (s_downloading.indexOf(url) < 0) {
            s_downloading.push(url);
            this.get(url, callback);
        }
    };
    var s_downloading = [];
    var BOUNDARY = "BU1kUJ19yLYPqv5xoT3sbKYbHwjUu1JU7roix";
    var CONTENT_TYPE = "multipart/form-data; boundary=" + BOUNDARY;
    var BOUNDARY_BEGIN =
        "--" +
        BOUNDARY +
        "\r\n" +
        "Content-Disposition: form-data; name={name}; filename={filename}\r\n" +
        "Content-Type: application/octet-stream\r\n\r\n";
    var BOUNDARY_END = "\r\n--" + BOUNDARY + "--";
    var http_body = function (data, filename, name) {
        var begin = BOUNDARY_BEGIN;
        begin = begin.replace("{filename}", filename);
        begin = begin.replace("{name}", name);
        begin = sdk.format.UTF8.encode(begin);
        var end = sdk.format.UTF8.encode(BOUNDARY_END);
        var size = begin.length + data.length + end.length;
        var body = new Uint8Array(size);
        body.set(begin, 0);
        body.set(data, begin.length);
        body.set(end, begin.length + data.length);
        return body;
    };
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var Storage = sdk.dos.SessionStorage;
    var get_configuration = function () {
        return ns.Configuration;
    };
    var get_http_client = function () {
        return ns.network.HTTP;
    };
    var md5 = function (data) {
        var hash = sdk.digest.MD5.digest(data);
        return sdk.format.Hex.encode(hash);
    };
    var fetch_filename = function (url) {
        var pos;
        pos = url.indexOf("?");
        if (pos > 0) {
            url = url.substr(0, pos);
        }
        pos = url.indexOf("#");
        if (pos > 0) {
            url = url.substr(0, pos);
        }
        pos = url.lastIndexOf("/");
        if (pos < 0) {
            pos = url.lastIndexOf("\\");
            if (pos < 0) {
                return url;
            }
        }
        return url.substr(pos + 1);
    };
    var unique_filename = function (url) {
        var filename = fetch_filename(url);
        var pos = filename.indexOf(".");
        if (pos !== 32) {
            var utf8 = sdk.format.UTF8.encode(url);
            if (pos > 0) {
                filename = md5(utf8) + filename.substr(pos);
            } else {
                filename = md5(utf8);
            }
        }
        return filename;
    };
    var FtpServer = {
        uploadAvatar: function (image, user) {
            var filename = md5(image) + ".jpg";
            var config = get_configuration();
            var up = config.getUploadURL();
            up = up.replace("{ID}", user.getAddress().toString());
            get_http_client().upload(
                up,
                image,
                filename,
                "avatar",
                function (xhr, url) {
                    var response = new Uint8Array(xhr.response);
                    upload_success(image, filename, user, url, response);
                }
            );
            var down = config.getAvatarURL();
            down = down.replace("{ID}", user.getAddress.toString());
            down = down.replace("{filename}", filename);
            return down;
        },
        downloadAvatar: function (url, identifier) {
            return url;
        },
        uploadEncryptedData: function (data, filename, sender) {
            var pos = filename.indexOf(".");
            if (pos > 0) {
                filename = md5(data) + filename.substr(pos);
            } else {
                filename = md5(data);
            }
            var config = get_configuration();
            var up = config.getUploadURL();
            up = up.replace("{ID}", sender.getAddress().toString());
            get_http_client().upload(up, data, filename, "file", function (xhr, url) {
                var response = new Uint8Array(xhr.response);
                upload_success(data, filename, sender, url, response);
            });
            var down = config.getDownloadURL();
            down = down.replace("{ID}", sender.getAddress.toString());
            down = down.replace("{filename}", filename);
            return down;
        },
        downloadEncryptedData: function (url) {
            var filename = unique_filename(url);
            var data = this.loadFileData(filename);
            if (data) {
                return data;
            }
            var ftp = this;
            get_http_client().download(url, function (xhr, url) {
                var response = new Uint8Array(xhr.response);
                if (response.length > 0) {
                    ftp.saveFileData(response, filename);
                    download_success(response, url);
                }
            });
            return null;
        },
        saveFileData: function (data, filename) {
            return Storage.saveData(data, filename);
        },
        loadFileData: function (filename) {
            return Storage.loadData(filename);
        },
        getFileData: function (content) {
            var data = content.getData("data");
            if (data) {
                return data;
            }
            var filename = content.getFilename();
            if (filename) {
                data = this.loadFileData(filename);
                if (data) {
                    return data;
                }
            }
            var url = content.getURL();
            if (url) {
                data = this.downloadEncryptedData(url);
                if (data) {
                    return decrypt_file_data(data, content, this);
                }
            }
            return null;
        }
    };
    var decrypt_file_data = function (encrypted, content, ftp) {
        var filename = content.getFilename();
        var pwd = content.getPassword();
        if (!pwd || !filename) {
            console.error("cannot decrypt file data", content);
            return null;
        }
        var data = pwd.decrypt(encrypted);
        var pos = filename.indexOf(".");
        if (pos > 0) {
            filename = md5(data) + filename.substr(pos);
        } else {
            filename = md5(data);
        }
        if (ftp.saveFileData(data, filename)) {
            content.setFilename(filename);
        }
        return data;
    };
    var upload_success = function (data, filename, sender, url, response) {};
    var download_success = function (response, url) {};
    ns.network.FtpServer = FtpServer;
    ns.network.registers("FtpServer");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ServerDelegate = function () {};
    sdk.Interface(ServerDelegate, null);
    ServerDelegate.prototype.onHandshakeAccepted = function (session, server) {
        console.assert(false, "implement me!");
    };
    ns.network.ServerDelegate = ServerDelegate;
    ns.network.registers("ServerDelegate");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ID = sdk.protocol.ID;
    var Envelope = sdk.protocol.Envelope;
    var InstantMessage = sdk.protocol.InstantMessage;
    var HandshakeCommand = sdk.protocol.HandshakeCommand;
    var HandshakeState = sdk.protocol.HandshakeState;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    var StateMachineDelegate = sdk.fsm.Delegate;
    var DockerStatus = sdk.startrek.port.DockerStatus;
    var Departure = sdk.startrek.port.Departure;
    var Station = sdk.mkm.Station;
    var Transmitter = ns.network.Transmitter;
    var ServerState = ns.network.ServerState;
    var StateMachine = ns.network.StateMachine;
    var MessengerDelegate = ns.MessengerDelegate;
    var get_facebook = function () {
        return ns.ClientFacebook.getInstance();
    };
    var get_messenger = function () {
        return ns.ClientMessenger.getInstance();
    };
    var Server = function (identifier, host, port, name) {
        Station.call(this, identifier, host, port);
        this.__delegate = null;
        this.__fsm = new StateMachine(this);
        this.__fsm.start();
        this.__name = name ? name : identifier.getName();
        this.__session = new ns.network.Session(host, port, get_messenger());
        this.__sessionKey = null;
        this.__paused = false;
        this.__currentUser = null;
    };
    sdk.Class(
        Server,
        Station,
        [Transmitter, MessengerDelegate, StateMachineDelegate],
        null
    );
    Server.prototype.getName = function () {
        return this.__name;
    };
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
            return;
        }
        this.__currentUser = user;
        this.__fsm.setSessionKey(null);
    };
    Server.prototype.getCurrentState = function () {
        var state = this.__fsm.getCurrentState();
        if (!state) {
            state = this.__fsm.getDefaultState();
        }
        return state;
    };
    Server.prototype.getStatus = function () {
        return this.__session.getStatus();
    };
    var pack = function (cmd) {
        var currentUser = this.__currentUser;
        if (!currentUser) {
            throw new Error("current user not set");
        }
        var messenger = get_messenger();
        var facebook = get_facebook();
        var receiver = this.getIdentifier();
        if (!facebook.getPublicKeyForEncryption(receiver)) {
            cmd.setGroup(ID.EVERYONE);
        }
        var sender = currentUser.getIdentifier();
        var env = Envelope.create(sender, receiver, null);
        var iMsg = InstantMessage.create(env, cmd);
        var sMsg = messenger.encryptMessage(iMsg);
        if (!sMsg) {
            throw new EvalError("failed to encrypt message: " + iMsg.toMap());
        }
        var rMsg = messenger.signMessage(sMsg);
        if (!rMsg) {
            throw new EvalError("failed to sign message: " + sMsg.toMap());
        }
        return rMsg;
    };
    var set_last_time = function (cmd) {};
    Server.prototype.handshake = function (newSessionKey) {
        var currentUser = this.__currentUser;
        if (!currentUser) {
            return;
        }
        var state = this.getCurrentState();
        if (
            !state.equals(ServerState.HANDSHAKING) &&
            !state.equals(ServerState.CONNECTED) &&
            !state.equals(ServerState.RUNNING)
        ) {
            console.log("server state not handshaking", state);
            return;
        }
        var status = this.getStatus();
        if (!DockerStatus.READY.equals(status)) {
            console.log("server not connected");
            return;
        }
        if (newSessionKey) {
            this.__sessionKey = newSessionKey;
        }
        this.__fsm.setSessionKey(null);
        var cmd = HandshakeCommand.restart(this.__sessionKey);
        set_last_time.call(this, cmd);
        var rMsg = pack.call(this, cmd);
        if (cmd.getState().equals(HandshakeState.START)) {
            var meta = currentUser.getMeta();
            var visa = currentUser.getVisa();
            rMsg.setMeta(meta);
            rMsg.setVisa(visa);
        }
        var data = get_messenger().serializeMessage(rMsg);
        this.__session.sendData(data, Departure.URGENT.valueOf());
    };
    Server.prototype.handshakeAccepted = function () {
        var state = this.getCurrentState();
        if (!state.equals(ServerState.HANDSHAKING)) {
            console.log("server state not handshaking", state);
        }
        console.log("handshake accepted for user", this.__currentUser);
        this.__fsm.setSessionKey(this.__sessionKey);
        var client = this.getDelegate();
        client.onHandshakeAccepted(this.__sessionKey, this);
    };
    Server.prototype.start = function () {
        get_messenger().setDelegate(this);
        if (!this.__session.isRunning()) {
            this.__session.start();
        }
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
    Server.prototype.sendContent = function (
        sender,
        receiver,
        content,
        priority
    ) {
        return this.__session.sendContent(sender, receiver, content, priority);
    };
    Server.prototype.sendInstantMessage = function (iMsg, priority) {
        return this.__session.sendInstantMessage(iMsg, priority);
    };
    Server.prototype.sendReliableMessage = function (rMsg, priority) {
        return this.__session.sendReliableMessage(rMsg, priority);
    };
    Server.prototype.uploadData = function (data, iMsg) {
        var sender = iMsg.getSender();
        var content = iMsg.getContent();
        var filename = content.getFilename();
        var ftp = ns.network.FtpServer;
        return ftp.uploadEncryptedData(data, filename, sender);
    };
    Server.prototype.downloadData = function (url, iMsg) {
        var ftp = ns.network.FtpServer;
        return ftp.downloadEncryptedData(url);
    };
    Server.prototype.enterState = function (next, machine) {};
    Server.prototype.exitState = function (previous, machine) {
        var current = machine.getCurrentState();
        console.info("server state changed:", previous, current);
        if (!current) {
            return;
        }
        var stateName = current.name;
        var info = { state: stateName };
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationServerStateChanged, this, info);
        if (stateName === ServerState.HANDSHAKING) {
            this.handshake(null);
        } else {
            if (stateName === ServerState.RUNNING) {
            } else {
                if (stateName === ServerState.ERROR) {
                    console.error("Station connection error!");
                }
            }
        }
    };
    Server.prototype.pauseState = function (current, machine) {};
    Server.prototype.resumeState = function (current, machine) {
        var stateName = current.toString();
        if (stateName === ServerState.RUNNING) {
            this.__fsm.setSessionKey(null);
        }
    };
    ns.network.Server = Server;
    ns.network.registers("Server");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var Thread = sdk.threading.Thread;
    var InetSocketAddress = sdk.startrek.type.InetSocketAddress;
    var WSGate = sdk.startrek.WSGate;
    var GateKeeper = ns.network.GateKeeper;
    var BaseSession = ns.network.BaseSession;
    var ClientGateKeeper = function (host, port, delegate, messenger) {
        GateKeeper.call(this, host, port, delegate, messenger);
        this.__thread = null;
    };
    sdk.Class(ClientGateKeeper, GateKeeper, null, {
        createGate: function (host, port, delegate) {
            var remote = new InetSocketAddress(host, port);
            return new WSGate(delegate, remote, null);
        }
    });
    var Session = function (host, port, messenger) {
        BaseSession.call(this, host, port, messenger);
    };
    sdk.Class(Session, BaseSession, null, {
        createGateKeeper: function (host, port, messenger) {
            return new ClientGateKeeper(host, port, this, messenger);
        },
        start: function () {
            var thread = new Thread(this);
            thread.start();
            this.__thread = thread;
        },
        setup: function () {
            this.setActive(true);
            return BaseSession.prototype.setup.call(this);
        },
        finish: function () {
            var ok = BaseSession.prototype.finish.call(this);
            this.setActive(false);
            return ok;
        }
    });
    ns.network.Session = Session;
    ns.network.registers("Session");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var BaseLoginCommand = sdk.dkd.BaseLoginCommand;
    var ServerDelegate = ns.network.ServerDelegate;
    var get_facebook = function () {
        return ns.ClientFacebook.getInstance();
    };
    var get_messenger = function () {
        return ns.ClientMessenger.getInstance();
    };
    var Terminal = function () {
        Object.call(this);
        this.__server = null;
        var messenger = get_messenger();
        messenger.setTerminal(this);
    };
    sdk.Class(Terminal, Object, [ServerDelegate], null);
    Terminal.prototype.getUserAgent = function () {
        return navigator.userAgent;
    };
    Terminal.prototype.getCurrentServer = function () {
        return this.__server;
    };
    var set_server = function (server) {
        var current = this.__server;
        if (current) {
            if (!server || !current.equals(server)) {
                current.end();
            }
        }
        this.__server = server;
    };
    var is_new_server = function (host, port) {
        var current = this.__server;
        if (!current) {
            return true;
        }
        return current.getPort() !== port || current.getHost() !== host;
    };
    Terminal.prototype.getCurrentUser = function () {
        var current = this.__server;
        if (!current) {
            return null;
        }
        return current.getCurrentUser();
    };
    var start = function (identifier, host, port, name) {
        var facebook = get_facebook();
        var server = this.__server;
        if (is_new_server.call(this, host, port)) {
            set_server.call(this, null);
            server = new ns.network.Server(identifier, host, port, name);
            server.setDataSource(facebook);
            server.setDelegate(this);
            server.start();
            set_server.call(this, server);
        }
        var user = facebook.getCurrentUser();
        if (user && server) {
            server.setCurrentUser(user);
            server.handshake(null);
        }
    };
    Terminal.prototype.launch = function (options) {
        var identifier = options["ID"];
        var host = options["host"];
        var port = options["port"];
        var name = options["name"];
        start.call(this, identifier, host, port, name);
    };
    Terminal.prototype.terminate = function () {
        set_server.call(this, null);
    };
    Terminal.prototype.onHandshakeAccepted = function (session, server) {
        var user = this.getCurrentUser();
        var login = new BaseLoginCommand(user.getIdentifier());
        login.setAgent(this.getUserAgent());
        login.setStation(server);
        get_messenger().broadcastContent(login);
    };
    ns.network.Terminal = Terminal;
    ns.registers("Terminal");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var Observer = sdk.lnc.Observer;
    var Terminal = ns.network.Terminal;
    var Client = function () {
        Terminal.call(this);
    };
    sdk.Class(Client, Terminal, [Observer], null);
    Client.prototype.onReceiveNotification = function (notification) {
        console.log("received notification: ", notification);
    };
    var s_client = null;
    Client.getInstance = function () {
        if (!s_client) {
            s_client = new Client();
        }
        return s_client;
    };
    ns.network.Client = Client;
    ns.network.registers("Client");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ID = sdk.protocol.ID;
    var Visa = sdk.protocol.Visa;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    var CommonFacebook = ns.CommonFacebook;
    var get_messenger = function () {
        return ns.ClientMessenger.getInstance();
    };
    var ClientFacebook = function () {
        CommonFacebook.call(this);
    };
    sdk.Class(ClientFacebook, CommonFacebook, null);
    ClientFacebook.prototype.getAvatar = function (identifier) {
        var avatar = null;
        var doc = this.getDocument(identifier, "*");
        if (doc) {
            if (sdk.Interface.conforms(doc, Visa)) {
                avatar = doc.getAvatar();
            } else {
                avatar = doc.getProperty("avatar");
            }
        }
        if (avatar) {
            var ftp = ns.network.FtpServer;
            return ftp.downloadAvatar(avatar, identifier);
        } else {
            return null;
        }
    };
    ClientFacebook.prototype.saveMeta = function (meta, identifier) {
        if (!CommonFacebook.prototype.saveMeta.call(this, meta, identifier)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMetaAccepted, this, {
            ID: identifier,
            meta: meta
        });
        return true;
    };
    ClientFacebook.prototype.saveDocument = function (doc) {
        if (!CommonFacebook.prototype.saveDocument.call(this, doc)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationDocumentUpdated, this, doc.toMap());
        return true;
    };
    ClientFacebook.prototype.addContact = function (contact, user) {
        if (!CommonFacebook.prototype.addContact.call(this, contact, user)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationContactsUpdated, this, {
            user: user,
            contact: contact,
            action: "add"
        });
        return true;
    };
    ClientFacebook.prototype.removeContact = function (contact, user) {
        if (!CommonFacebook.prototype.removeContact.call(this, contact, user)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationContactsUpdated, this, {
            user: user,
            contact: contact,
            action: "remove"
        });
        return true;
    };
    ClientFacebook.prototype.addMember = function (member, group) {
        if (!CommonFacebook.prototype.addMember.call(this, member, group)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMembersUpdated, this, {
            group: group,
            member: member,
            action: "add"
        });
        return true;
    };
    ClientFacebook.prototype.removeMember = function (member, group) {
        if (!CommonFacebook.prototype.removeMember.call(this, member, group)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMembersUpdated, this, {
            group: group,
            member: member,
            action: "remove"
        });
        return true;
    };
    ClientFacebook.prototype.saveMembers = function (members, group) {
        if (!CommonFacebook.prototype.saveMembers.call(this, members, group)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMembersUpdated, this, {
            group: group,
            members: members,
            action: "update"
        });
        return true;
    };
    ClientFacebook.prototype.removeGroup = function (group) {
        if (!CommonFacebook.prototype.removeGroup.call(this, group)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationGroupRemoved, this, {
            group: group,
            action: "remove"
        });
        return true;
    };
    ClientFacebook.prototype.getMeta = function (identifier) {
        var meta = CommonFacebook.prototype.getMeta.call(this, identifier);
        if (!meta) {
            if (identifier.isBroadcast()) {
                return null;
            }
            setTimeout(function () {
                get_messenger().queryMeta(identifier);
            }, 512);
        }
        return meta;
    };
    ClientFacebook.prototype.getDocument = function (identifier, type) {
        var doc = CommonFacebook.prototype.getDocument.call(this, identifier, type);
        if (!doc || this.isExpiredDocument(doc, true)) {
            if (identifier.isBroadcast()) {
                return null;
            }
            setTimeout(function () {
                get_messenger().queryDocument(identifier, type);
            }, 512);
        }
        return doc;
    };
    ClientFacebook.prototype.getContacts = function (user) {
        var contacts = CommonFacebook.prototype.getContacts.call(this, user);
        if (!contacts || contacts.length === 0) {
        }
        return contacts;
    };
    ClientFacebook.prototype.getMembers = function (group) {
        var members = CommonFacebook.prototype.getMembers.call(this, group);
        if (!members || members.length === 0) {
            console.log("querying members", group);
            var gm = new ns.GroupManager(group);
            gm.query();
        }
        return members;
    };
    ClientFacebook.prototype.getAssistants = function (group) {
        var assistants = [
            "assistant@4WBSiDzg9cpZGPqFrQ4bHcq4U5z9QAQLHS",
            "assistant@2PpB6iscuBjA15oTjAsiswoX9qis5V3c1Dq"
        ];
        return ID.convert(assistants);
    };
    var s_facebook = null;
    ClientFacebook.getInstance = function () {
        if (!s_facebook) {
            s_facebook = new ClientFacebook();
        }
        return s_facebook;
    };
    ns.ClientFacebook = ClientFacebook;
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var MetaCommand = sdk.protocol.MetaCommand;
    var DocumentCommand = sdk.protocol.DocumentCommand;
    var GroupCommand = sdk.protocol.GroupCommand;
    var get_messenger = function () {
        return ns.ClientMessenger.getInstance();
    };
    var get_facebook = function () {
        return ns.ClientFacebook.getInstance();
    };
    var send_command = function (cmd) {
        get_messenger().sendCommand(cmd, 0);
    };
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
        var sender = user.getIdentifier();
        for (var i = 0; i < members.length; ++i) {
            messenger.sendContent(sender, members[i], cmd, 0);
        }
    };
    var GroupManager = function (group) {
        this.__group = group;
    };
    GroupManager.prototype.send = function (content) {
        var facebook = get_facebook();
        var messenger = get_messenger();
        var group = content.getGroup();
        if (!group) {
            group = this.__group;
            content.setGroup(group);
        } else {
            if (!this.__group.equals(group)) {
                throw new Error("group ID not match: " + this.__group + ", " + group);
            }
        }
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            var bots = facebook.getAssistants(group);
            if (!bots || bots.length === 0) {
                throw new Error("failed to get assistants for group: " + group);
            }
            messenger.queryGroupInfo(group, bots);
            return false;
        }
        return messenger.sendContent(null, group, content, 0);
    };
    GroupManager.prototype.invite = function (newMembers) {
        var facebook = get_facebook();
        var group = this.__group;
        var bots = facebook.getAssistants(group);
        var members = facebook.getMembers(group);
        if (!members) {
            members = [];
        }
        var count = members.length;
        var meta = facebook.getMeta(group);
        if (!meta) {
            throw new ReferenceError(
                "failed to get meta for group: " + group.toString()
            );
        }
        var cmd;
        var doc = facebook.getDocument(group, "*");
        if (doc) {
            cmd = DocumentCommand.response(group, meta, doc);
        } else {
            cmd = MetaCommand.response(group, meta);
        }
        send_command(cmd);
        send_group_command(cmd, bots);
        if (count <= 2) {
            members = addMembers(newMembers, group);
            send_group_command(cmd, members);
            cmd = GroupCommand.invite(group, members);
            send_group_command(cmd, bots);
            send_group_command(cmd, members);
        } else {
            send_group_command(cmd, newMembers);
            cmd = GroupCommand.invite(group, newMembers);
            send_group_command(cmd, bots);
            send_group_command(cmd, members);
            members = addMembers(newMembers, group);
            cmd = GroupCommand.invite(group, members);
            send_group_command(cmd, newMembers);
        }
        return true;
    };
    GroupManager.prototype.expel = function (outMembers) {
        var facebook = get_facebook();
        var group = this.__group;
        var owner = facebook.getOwner(group);
        var bots = facebook.getAssistants(group);
        var members = facebook.getMembers(group);
        if (!members) {
            members = [];
        }
        var i;
        for (i = 0; i < bots.length; ++i) {
            if (outMembers.indexOf(bots[i]) >= 0) {
                throw new Error("Cannot expel group assistant: " + bots[i]);
            }
        }
        if (outMembers.indexOf(owner) >= 0) {
            throw new Error("Cannot expel group owner: " + bots[i]);
        }
        var cmd = GroupCommand.expel(group, outMembers);
        send_group_command(cmd, bots);
        send_group_command(cmd, members);
        if (owner && members.indexOf(owner) < 0) {
            send_group_command(cmd, owner);
        }
        return removeMembers(outMembers, group);
    };
    GroupManager.prototype.quit = function () {
        var facebook = get_facebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw new ReferenceError("failed to get current user");
        }
        var group = this.__group;
        var owner = facebook.getOwner(group);
        var bots = facebook.getAssistants(group);
        var members = facebook.getMembers(group);
        if (!members) {
            members = [];
        }
        if (bots.indexOf(user.getIdentifier()) >= 0) {
            throw new Error("Group assistant cannot quit: " + user.getIdentifier());
        }
        if (user.getIdentifier().equals(owner)) {
            throw new Error("Group owner cannot quit: " + user.getIdentifier());
        }
        var cmd = GroupCommand.quit(group);
        send_group_command(cmd, bots);
        send_group_command(cmd, members);
        if (owner && members.indexOf(owner) < 0) {
            send_group_command(cmd, owner);
        }
        return facebook.removeGroup(group);
    };
    GroupManager.prototype.query = function () {
        var facebook = get_facebook();
        var messenger = get_messenger();
        var group = this.__group;
        var bots = facebook.getAssistants(group);
        return messenger.queryGroupInfo(group, bots);
    };
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
        if (count > 0) {
            facebook.saveMembers(members, group);
        }
        return members;
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
    ns.GroupManager = GroupManager;
    ns.registers("GroupManager");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
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
    var ServerDelegate = ns.network.ServerDelegate;
    var ClientMessenger = function () {
        CommonMessenger.call(this);
        this.__terminal = null;
        this.__offlineTime = null;
        this.__metaQueryExpires = {};
        this.__docQueryExpires = {};
        this.__groupQueryExpires = {};
    };
    sdk.Class(ClientMessenger, CommonMessenger, [ServerDelegate]);
    var QUERY_INTERVAL = 120 * 1000;
    ClientMessenger.prototype.getEntityDelegate = function () {
        if (!this.__barrack) {
            this.__barrack = ns.ClientFacebook.getInstance();
        }
        return this.__barrack;
    };
    ClientMessenger.prototype.getProcessor = function () {
        if (!this.__processor) {
            this.__processor = new ns.ClientProcessor(this);
        }
        return this.__processor;
    };
    ClientMessenger.prototype.getDataSource = function () {
        if (!this.__datasource) {
            this.__datasource = ns.MessageDataSource;
        }
        return this.__datasource;
    };
    ClientMessenger.prototype.getTerminal = function () {
        return this.__terminal;
    };
    ClientMessenger.prototype.setTerminal = function (client) {
        this.__terminal = client;
    };
    ClientMessenger.prototype.getCurrentServer = function () {
        return this.__terminal.getCurrentServer();
    };
    ClientMessenger.prototype.getCurrentUser = function () {
        return this.__terminal.getCurrentUser();
    };
    ClientMessenger.prototype.sendCommand = function (cmd, priority) {
        var server = this.getCurrentServer();
        if (!server) {
            console.error("current server not found");
            return false;
        }
        return this.sendContent(null, server.getIdentifier(), cmd, null, priority);
    };
    ClientMessenger.prototype.broadcastContent = function (content) {
        content.setGroup(ID.EVERYONE);
        return this.sendContent(null, ID.EVERYONE, content, null, 1);
    };
    ClientMessenger.prototype.broadcastVisa = function (doc) {
        var user = this.getCurrentUser();
        if (!user) {
            throw new ReferenceError("login first");
        }
        var identifier = doc.getIdentifier();
        if (!user.getIdentifier().equals(identifier)) {
            throw new ReferenceError("visa document error" + doc.toMap());
        }
        doc.setValue(CommonFacebook.EXPIRES_KEY, null);
        var contacts = user.getContacts();
        if (contacts && contacts.length > 0) {
            var cmd = DocumentCommand.response(identifier, null, doc);
            for (var i = 0; i < contacts.length; ++i) {
                this.sendContent(identifier, contacts[i], cmd, null, 1);
            }
        }
    };
    ClientMessenger.prototype.postDocument = function (doc, meta) {
        doc.setValue(CommonFacebook.EXPIRES_KEY, null);
        var cmd = DocumentCommand.response(doc.getIdentifier(), meta, doc);
        return this.sendCommand(cmd, 1);
    };
    ClientMessenger.prototype.postContacts = function (contacts) {
        var facebook = this.getFacebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw new Error("login first");
        }
        var pwd = SymmetricKey.generate(SymmetricKey.AES);
        var data = sdk.format.JSON.encode(contacts);
        data = pwd.encrypt(data);
        var key = sdk.format.JSON.encode(pwd);
        key = user.encrypt(key);
        var cmd = new StorageCommand(StorageCommand.CONTACTS);
        cmd.setIdentifier(user.getIdentifier());
        cmd.setData(data);
        cmd.setKey(key);
        return this.sendCommand(cmd, 1);
    };
    ClientMessenger.prototype.queryContacts = function () {
        var facebook = this.getFacebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw new Error("current user not found");
        }
        var cmd = new StorageCommand(StorageCommand.CONTACTS);
        cmd.setIdentifier(user.getIdentifier());
        return this.sendCommand(cmd, 1);
    };
    ClientMessenger.prototype.queryMeta = function (identifier) {
        if (identifier.isBroadcast()) {
            return false;
        }
        var now = new Date().getTime();
        var expires = this.__metaQueryExpires[identifier];
        if (expires && now < expires) {
            return false;
        }
        this.__metaQueryExpires[identifier] = now + QUERY_INTERVAL;
        console.log("querying meta", identifier);
        var cmd = new MetaCommand(identifier);
        return this.sendCommand(cmd, 1);
    };
    ClientMessenger.prototype.queryDocument = function (identifier, type) {
        if (identifier.isBroadcast()) {
            return false;
        }
        var now = new Date().getTime();
        var expires = this.__docQueryExpires[identifier];
        if (expires && now < expires) {
            return false;
        }
        this.__docQueryExpires[identifier] = now + QUERY_INTERVAL;
        console.log("querying document", identifier, type);
        var cmd = new DocumentCommand(identifier);
        return this.sendCommand(cmd, 1);
    };
    ClientMessenger.prototype.queryGroupInfo = function (group, member) {
        if (group.isBroadcast()) {
            return false;
        }
        if (members.length === 0) {
            return false;
        }
        var currentUser = this.getCurrentUser();
        var times = this.__groupQueryExpires[group];
        if (!times) {
            times = {};
            this.__groupQueryExpires[group] = times;
        }
        var members;
        if (member instanceof Array) {
            members = member;
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
            console.log("querying group", group, user);
            if (this.sendContent(currentUser.getIdentifier(), user, cmd, null, 1)) {
                checking = true;
            }
        }
        return checking;
    };
    ClientMessenger.prototype.search = function (keywords) {
        if (keywords === SearchCommand.ONLINE_USERS) {
            return this.sendCommand(SearchCommand.search(), 0);
        } else {
            var cmd = SearchCommand.search(keywords);
            var bot = ID.parse("archivist@anywhere");
            return this.sendContent(null, bot, cmd, null, 0);
        }
    };
    ClientMessenger.prototype.reportOnline = function () {
        var user = this.getCurrentUser();
        if (!user) {
            console.error("current user not set yet");
            return;
        }
        var cmd = ReportCommand.report(ReportCommand.ONLINE);
        if (this.__offlineTime) {
            cmd.setValue("last_time", this.__offlineTime.getTime() / 1000);
        }
        this.sendCommand(cmd, 0);
    };
    ClientMessenger.prototype.reportOffline = function () {
        var user = this.getCurrentUser();
        if (!user) {
            console.error("current user not set yet");
            return;
        }
        var cmd = ReportCommand.report(ReportCommand.OFFLINE);
        this.__offlineTime = cmd.getTime();
        this.sendCommand(cmd, 0);
    };
    ClientMessenger.prototype.onReceivePackage = function (data, server) {
        try {
            var res = this.processData(data);
            if (res && res.length > 0) {
                server.sendPackage(res, null, 1);
            }
        } catch (e) {
            console.error("failed to process data", data, e);
        }
    };
    ClientMessenger.prototype.didSendPackage = function (data, server) {};
    ClientMessenger.prototype.didFailToSendPackage = function (
        error,
        data,
        server
    ) {};
    ClientMessenger.prototype.onHandshakeAccepted = function (session, server) {
        var user = this.getCurrentUser();
        var login = new LoginCommand(user.getIdentifier());
        login.setAgent(this.getTerminal().getUserAgent());
        login.setStation(server);
        this.broadcastContent(login);
    };
    var s_messenger = null;
    ClientMessenger.getInstance = function () {
        if (!s_messenger) {
            s_messenger = new ClientMessenger();
        }
        return s_messenger;
    };
    ns.ClientMessenger = ClientMessenger;
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var NetworkType = sdk.protocol.NetworkType;
    var TextContent = sdk.protocol.TextContent;
    var HandshakeCommand = sdk.protocol.HandshakeCommand;
    var ReceiptCommand = sdk.protocol.ReceiptCommand;
    var CommonProcessor = ns.CommonProcessor;
    var ClientProcessor = function (facebook, messenger) {
        CommonProcessor.call(this, facebook, messenger);
    };
    sdk.Class(ClientProcessor, CommonProcessor, null, {
        createCreator: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.cpu.ClientProcessorCreator(facebook, messenger);
        },
        processContent: function (content, rMsg) {
            var responses = CommonProcessor.prototype.processContent.call(
                this,
                content,
                rMsg
            );
            if (!responses || responses.length === 0) {
                return null;
            } else {
                if (sdk.Interface.conforms(responses[0], HandshakeCommand)) {
                    return responses;
                }
            }
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            var sender = rMsg.getSender();
            var receiver = rMsg.getReceiver();
            var user = facebook.selectLocalUser(receiver);
            var res;
            for (var i = 0; i < responses.length; ++i) {
                res = responses[i];
                if (!res) {
                    continue;
                } else {
                    if (sdk.Interface.conforms(res, ReceiptCommand)) {
                        if (NetworkType.STATION.equals(sender.getType())) {
                            return null;
                        }
                        console.log("receipt to sender", sender);
                    } else {
                        if (sdk.Interface.conforms(res, TextContent)) {
                            if (NetworkType.STATION.equals(sender.getType())) {
                                return null;
                            }
                            console.log("text to sender", sender);
                        }
                    }
                }
                messenger.sendContent(user.getIdentifier(), sender, res, 1);
            }
            return null;
        }
    });
    ns.ClientProcessor = ClientProcessor;
    ns.registers("ClientProcessor");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var PrivateKey = sdk.crypto.PrivateKey;
    var ID = sdk.protocol.ID;
    var NetworkType = sdk.protocol.NetworkType;
    var MetaType = sdk.protocol.MetaType;
    var Meta = sdk.protocol.Meta;
    var BaseVisa = sdk.mkm.BaseVisa;
    var BaseBulletin = sdk.mkm.BaseBulletin;
    var get_facebook = function () {
        return ns.ClientFacebook.getInstance();
    };
    var get_messenger = function () {
        return ns.ClientMessenger.getInstance();
    };
    var Register = function (type) {
        if (type) {
            this.network = type;
        } else {
            this.network = NetworkType.MAIN;
        }
        this.__privateKey = null;
    };
    Register.prototype.createUser = function (name, avatar) {
        var facebook = get_facebook();
        var privateKey = PrivateKey.generate(PrivateKey.RSA);
        this.__privateKey = privateKey;
        var meta = Meta.generate(MetaType.DEFAULT, privateKey, "web-demo");
        var uid = ID.generate(meta, NetworkType.MAIN, null);
        var pKey = privateKey.getPublicKey();
        var doc = this.createUserDocument(uid, name, avatar, pKey);
        facebook.saveMeta(meta, uid);
        facebook.savePrivateKey(uid, privateKey, "M", 0, 0);
        facebook.saveDocument(doc);
        return facebook.getUser(uid);
    };
    Register.prototype.createGroup = function (founder, name) {
        var facebook = get_facebook();
        var privateKey = facebook.getPrivateKeyForVisaSignature(founder);
        this.__privateKey = privateKey;
        var r = Math.ceil(Math.random() * 999990000) + 10000;
        var meta = Meta.generate(MetaType.DEFAULT, privateKey, "Group-" + r);
        var gid = ID.generate(meta, NetworkType.POLYLOGUE, null);
        var doc = this.createGroupDocument(gid, name);
        facebook.saveMeta(meta, gid);
        facebook.saveDocument(doc);
        facebook.addMember(founder, gid);
        return facebook.getGroup(gid);
    };
    Register.prototype.createUserDocument = function (
        identifier,
        name,
        avatarUrl,
        pKey
    ) {
        var doc = new BaseVisa(identifier);
        doc.setName(name);
        doc.setAvatar(avatarUrl);
        doc.setKey(pKey);
        doc.sign(this.__privateKey);
        return doc;
    };
    Register.prototype.createGroupDocument = function (identifier, name) {
        var doc = new BaseBulletin(identifier);
        doc.setName(name);
        doc.sign(this.__privateKey);
        return doc;
    };
    Register.prototype.upload = function (identifier, meta, doc) {
        if (!doc.getIdentifier().equals(identifier)) {
            throw new Error(
                "document ID not match: " + identifier.toString() + ", " + doc.toMap()
            );
        }
        return get_messenger().postDocument(doc, meta);
    };
    ns.Register = Register;
    ns.registers("Register");
})(SECHAT, DIMSDK);
