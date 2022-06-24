/**
 *  DIM-Common (v0.2.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Jun. 20, 2022
 * @copyright (c) 2022 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof SECHAT !== "object") {
    SECHAT = new DIMSDK.Namespace();
}
(function (ns, sdk) {
    if (typeof ns.assert !== "function") {
        ns.assert = console.assert;
    }
    if (typeof ns.cpu !== "object") {
        ns.cpu = new sdk.Namespace();
    }
    if (typeof ns.db !== "object") {
        ns.db = new sdk.Namespace();
    }
    if (typeof ns.network !== "object") {
        ns.network = new sdk.Namespace();
    }
    if (typeof ns.dkd !== "object") {
        ns.dkd = new sdk.Namespace();
    }
    if (typeof ns.protocol !== "object") {
        ns.protocol = new sdk.Namespace();
    }
    ns.registers("cpu");
    ns.registers("db");
    ns.registers("network");
    ns.registers("dkd");
    ns.registers("protocol");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var BaseCommandProcessor = sdk.cpu.BaseCommandProcessor;
    var BlockCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    sdk.Class(BlockCommandProcessor, BaseCommandProcessor, null, {
        process: function (cmd, rMsg) {
            return null;
        }
    });
    ns.cpu.BlockCommandProcessor = BlockCommandProcessor;
    ns.cpu.registers("BlockCommandProcessor");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
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
    var MessageBuilder = {
        getContentText: function (content) {
            if (sdk.Interface.conforms(content, FileContent)) {
                if (sdk.Interface.conforms(content, ImageContent)) {
                    return "[Image:" + content.getFilename() + "]";
                }
                if (sdk.Interface.conforms(content, AudioContent)) {
                    return "[Voice:" + content.getFilename() + "]";
                }
                if (sdk.Interface.conforms(content, VideoContent)) {
                    return "[Movie:" + content.getFilename() + "]";
                }
                return "[File:" + content.getFilename() + "]";
            }
            if (sdk.Interface.conforms(content, TextContent)) {
                return content.getText();
            }
            if (sdk.Interface.conforms(content, PageContent)) {
                return "[File:" + content.getURL() + "]";
            }
            var type = content.getType();
            return "Current version doesn't support this message type: " + type;
        },
        getCommandText: function (cmd, commander) {
            if (sdk.Interface.conforms(cmd, GroupCommand)) {
                return this.getGroupCommandText(cmd, commander);
            }
            if (sdk.Interface.conforms(cmd, LoginCommand)) {
                return this.getLoginCommandText(cmd, commander);
            }
            return (
                "Current version doesn't support this command: " + cmd.getCommand()
            );
        },
        getGroupCommandText: function (cmd, commander) {
            var text = cmd.getValue("text");
            if (text) {
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
            throw new Error("unsupported group command: " + cmd);
        },
        getInviteCommandText: function (cmd, commander) {
            var addedList = cmd.getValue("added");
            if (!addedList) {
                addedList = [];
            }
            var names = [];
            for (var i = 0; i < addedList.length; ++i) {
                names.push(getUsername(addedList[i]));
            }
            var text =
                getUsername(commander) + " has invited members: " + names.join(", ");
            cmd.setValue("text", text);
            return text;
        },
        getExpelCommandText: function (cmd, commander) {
            var removedList = cmd.getValue("removed");
            if (!removedList) {
                removedList = [];
            }
            var names = [];
            for (var i = 0; i < removedList.length; ++i) {
                names.push(getUsername(removedList[i]));
            }
            var text =
                getUsername(commander) + " has removed members: " + names.join(", ");
            cmd.setValue("text", text);
            return text;
        },
        getQuitCommandText: function (cmd, commander) {
            var text = getUsername(commander) + " has quit group chat.";
            cmd.setValue("text", text);
            return text;
        },
        getResetCommandText: function (cmd, commander) {
            var text = getUsername(commander) + " has updated members";
            var i, names;
            var removedList = cmd.getValue("removed");
            if (removedList && removedList.length > 0) {
                names = [];
                for (i = 0; i < removedList.length; ++i) {
                    names.push(getUsername(removedList[i]));
                }
                text += ", removed: " + names.join(", ");
            }
            var addedList = cmd.getValue("added");
            if (addedList && addedList.length > 0) {
                names = [];
                for (i = 0; i < addedList.length; ++i) {
                    names.push(getUsername(addedList[i]));
                }
                text += ", added: " + names.join(", ");
            }
            cmd.setValue("text", text);
            return text;
        },
        getQueryCommandText: function (cmd, commander) {
            var text =
                getUsername(commander) + " was querying group info, responding...";
            cmd.setValue("text", text);
            return text;
        }
    };
    MessageBuilder.getLoginCommandText = function (cmd, commander) {
        var identifier = cmd.getIdentifier();
        var station = cmd.getStation();
        if (station) {
            var host = station["host"];
            var port = station["port"];
            station = "(" + host + ":" + port + ") " + getUsername(station["ID"]);
        }
        var text = getUsername(identifier) + " login: " + station;
        cmd.setValue("text", text);
        return text;
    };
    ns.cpu.MessageBuilder = MessageBuilder;
    ns.cpu.registers("MessageBuilder");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ReceiptCommand = sdk.protocol.ReceiptCommand;
    var FileContent = sdk.protocol.FileContent;
    var ImageContent = sdk.protocol.ImageContent;
    var AudioContent = sdk.protocol.AudioContent;
    var VideoContent = sdk.protocol.VideoContent;
    var TextContent = sdk.protocol.TextContent;
    var PageContent = sdk.protocol.PageContent;
    var BaseContentProcessor = sdk.cpu.BaseContentProcessor;
    var AnyContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    sdk.Class(AnyContentProcessor, BaseContentProcessor, null, null);
    AnyContentProcessor.prototype.process = function (content, rMsg) {
        var text;
        if (sdk.Interface.conforms(content, FileContent)) {
            if (sdk.Interface.conforms(content, ImageContent)) {
                text = "Image received";
            } else {
                if (sdk.Interface.conforms(content, AudioContent)) {
                    text = "Voice message received";
                } else {
                    if (sdk.Interface.conforms(content, VideoContent)) {
                        text = "Movie received";
                    } else {
                        text = "File received";
                    }
                }
            }
        } else {
            if (sdk.Interface.conforms(content, TextContent)) {
                text = "Text message received";
            } else {
                if (sdk.Interface.conforms(content, PageContent)) {
                    text = "Web page received";
                } else {
                    return BaseContentProcessor.prototype.process.call(
                        this,
                        content,
                        rMsg
                    );
                }
            }
        }
        var group = content.getGroup();
        if (group) {
            return null;
        }
        var res = new ReceiptCommand(text);
        res.setSerialNumber(content.getSerialNumber());
        res.setEnvelope(rMsg.getEnvelope());
        res.setSignature(rMsg.getValue("signature"));
        return res;
    };
    ns.cpu.AnyContentProcessor = AnyContentProcessor;
    ns.cpu.registers("AnyContentProcessor");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var BaseCommandProcessor = sdk.cpu.BaseCommandProcessor;
    var MuteCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    sdk.Class(MuteCommandProcessor, BaseCommandProcessor, null, {
        process: function (cmd, rMsg) {
            return null;
        }
    });
    ns.cpu.MuteCommandProcessor = MuteCommandProcessor;
    ns.cpu.registers("MuteCommandProcessor");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var BaseCommandProcessor = sdk.cpu.BaseCommandProcessor;
    var ReceiptCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    sdk.Class(ReceiptCommandProcessor, BaseCommandProcessor, null, {
        process: function (cmd, rMsg) {
            return null;
        }
    });
    ns.cpu.ReceiptCommandProcessor = ReceiptCommandProcessor;
    ns.cpu.registers("ReceiptCommandProcessor");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var InstantMessage = sdk.protocol.InstantMessage;
    var BaseContentProcessor = sdk.cpu.BaseContentProcessor;
    var FileContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    sdk.Class(FileContentProcessor, BaseContentProcessor, null, {
        uploadFileContent: function (content, password, iMsg) {
            var data = content.getData();
            if (!data || data.length === 0) {
                return false;
            }
            var encrypted = password.encrypt(data);
            if (!encrypted || encrypted.length === 0) {
                throw new Error("failed to encrypt file data with key: " + password);
            }
            var messenger = this.getMessenger();
            var url = messenger.uploadData(encrypted, iMsg);
            if (url) {
                content.setURL(url);
                content.setData(null);
                return true;
            } else {
                return false;
            }
        },
        downloadFileContent: function (content, password, sMsg) {
            var url = content.getURL();
            if (!url || url.indexOf("://") < 0) {
                return false;
            }
            var messenger = this.getMessenger();
            var iMsg = InstantMessage.create(sMsg.getEnvelope(), content);
            var encrypted = messenger.downloadData(url, iMsg);
            if (!encrypted || encrypted.length === 0) {
                content.setPassword(password);
                return false;
            }
            var fileData = password.decrypt(encrypted);
            if (!fileData || fileData.length === 0) {
                throw new Error("failed to decrypt file data with key: " + password);
            }
            content.setData(fileData);
            content.setURL(null);
            return true;
        },
        process: function (cmd, rMsg) {
            return null;
        }
    });
    ns.cpu.FileContentProcessor = FileContentProcessor;
    ns.cpu.registers("FileContentProcessor");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ContentType = sdk.protocol.ContentType;
    var Command = sdk.protocol.Command;
    var MuteCommand = sdk.protocol.MuteCommand;
    var BlockCommand = sdk.protocol.BlockCommand;
    var ContentProcessorCreator = sdk.cpu.ContentProcessorCreator;
    var AnyContentProcessor = ns.cpu.AnyContentProcessor;
    var FileContentProcessor = ns.cpu.FileContentProcessor;
    var ReceiptCommandProcessor = ns.cpu.ReceiptCommandProcessor;
    var MuteCommandProcessor = ns.cpu.MuteCommandProcessor;
    var BlockCommandProcessor = ns.cpu.BlockCommandProcessor;
    var CommonProcessorCreator = function (facebook, messenger) {
        ContentProcessorCreator.call(this, facebook, messenger);
    };
    sdk.Class(CommonProcessorCreator, ContentProcessorCreator, null, {
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (
                ContentType.FILE.equals(type) ||
                ContentType.IMAGE.equals(type) ||
                ContentType.AUDIO.equals(type) ||
                ContentType.VIDEO.equals(type)
            ) {
                return new FileContentProcessor(facebook, messenger);
            }
            var cpu = ContentProcessorCreator.prototype.createContentProcessor.call(
                this,
                type
            );
            if (!cpu) {
                cpu = new AnyContentProcessor(facebook, messenger);
            }
            return cpu;
        },
        createCommandProcessor: function (type, command) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (Command.RECEIPT === command) {
                return new ReceiptCommandProcessor(facebook, messenger);
            }
            if (MuteCommand.MUTE === command) {
                return new MuteCommandProcessor(facebook, messenger);
            }
            if (BlockCommand.BLOCK === command) {
                return new BlockCommandProcessor(facebook, messenger);
            }
            return ContentProcessorCreator.prototype.createCommandProcessor.call(
                this,
                type,
                command
            );
        }
    });
    ns.cpu.CommonProcessorCreator = CommonProcessorCreator;
    ns.cpu.registers("CommonProcessorCreator");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    ns.db.AddressNameTable = {
        getIdentifier: function (alias) {
            console.assert(false, "implement me!");
            return null;
        },
        addRecord: function (identifier, alias) {
            console.assert(false, "implement me!");
            return false;
        },
        removeRecord: function (alias) {
            console.assert(false, "implement me!");
            return false;
        }
    };
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ID = sdk.protocol.ID;
    var Storage = sdk.dos.LocalStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    ns.db.ContactTable = {
        getContacts: function (user) {
            this.load();
            return this.__contacts[user];
        },
        addContact: function (contact, user) {
            var contacts = this.getContacts(user);
            if (contacts) {
                if (contacts.indexOf(contact) >= 0) {
                    return false;
                }
                contacts.push(contact);
            } else {
                contacts = [contact];
            }
            return this.saveContacts(contacts, user);
        },
        removeContact: function (contact, user) {
            var contacts = this.getContacts(user);
            if (!contacts) {
                return false;
            }
            var pos = contacts.indexOf(contact);
            if (pos < 0) {
                return false;
            }
            contacts.splice(pos, 1);
            return this.saveContacts(contacts, user);
        },
        saveContacts: function (contacts, user) {
            this.load();
            this.__contacts[user] = contacts;
            console.log("saving contacts for user", user);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification(ns.kNotificationContactsUpdated, this, {
                    user: user,
                    contacts: contacts
                });
                return true;
            } else {
                throw new Error("failed to save contacts: " + user + " -> " + contacts);
            }
        },
        load: function () {
            if (!this.__contacts) {
                this.__contacts = convert(Storage.loadJSON("ContactTable"));
            }
        },
        save: function () {
            return Storage.saveJSON(revert(this.__contacts), "ContactTable");
        },
        __contacts: null
    };
    var convert = function (map) {
        var results = {};
        if (map) {
            var users = Object.keys(map);
            var u;
            for (var i = 0; i < users.length; ++i) {
                u = users[i];
                results[ID.parse(u)] = ID.convert(map[u]);
            }
        }
        return results;
    };
    var revert = function (map) {
        var results = {};
        var users = Object.keys(map);
        var u;
        for (var i = 0; i < users.length; ++i) {
            u = users[i];
            results[u.toString()] = ID.revert(map[u]);
        }
        return results;
    };
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ID = sdk.protocol.ID;
    var Document = sdk.protocol.Document;
    var Storage = sdk.dos.LocalStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    ns.db.DocumentTable = {
        getDocument: function (identifier, type) {
            this.load();
            return this.__docs[identifier];
        },
        saveDocument: function (doc) {
            if (!doc.isValid()) {
                console.error("document not valid", doc);
                return false;
            }
            var identifier = doc.getIdentifier();
            if (!identifier) {
                throw new Error("entity ID error: " + doc);
            }
            this.load();
            this.__docs[identifier] = doc;
            console.log("saving document", identifier);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification(ns.kNotificationDocumentUpdated, this, doc);
                return true;
            } else {
                throw new Error(
                    "failed to save document: " +
                    identifier +
                    " -> " +
                    doc.getValue("data")
                );
            }
        },
        load: function () {
            if (!this.__docs) {
                this.__docs = convert(Storage.loadJSON("DocumentTable"));
            }
        },
        save: function () {
            return Storage.saveJSON(revert(this.__docs), "DocumentTable");
        },
        __docs: null
    };
    var convert = function (map) {
        var results = {};
        if (map) {
            var list = Object.keys(map);
            var id, doc;
            for (var i = 0; i < list.length; ++i) {
                id = list[i];
                doc = Document.parse(map[id]);
                if (!doc) {
                    continue;
                }
                doc.__status = 1;
                results[ID.parse(id)] = doc;
            }
        }
        return results;
    };
    var revert = function (map) {
        var results = {};
        if (map) {
            var list = Object.keys(map);
            var id, doc;
            for (var i = 0; i < list.length; ++i) {
                id = list[i];
                doc = map[id];
                if (!doc) {
                    continue;
                }
                results[id.toString()] = doc.toMap();
            }
        }
        return results;
    };
})(SECHAT, DIMSDK);
(function (ns, sdk) {
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
            this.load();
            return this.__members[group];
        },
        addMember: function (member, group) {
            var members = this.getMembers(group);
            if (members) {
                if (members.indexOf(member) >= 0) {
                    return false;
                }
                members.push(member);
            } else {
                members = [member];
            }
            return this.saveMembers(members, group);
        },
        removeMember: function (member, group) {
            var members = this.getMembers(group);
            if (!members) {
                return false;
            }
            var pos = members.indexOf(member);
            if (pos < 0) {
                return false;
            }
            members.splice(pos, 1);
            return this.saveMembers(members, group);
        },
        saveMembers: function (members, group) {
            this.load();
            this.__members[group] = members;
            console.log("saving members for group", group);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification("MembersUpdated", this, {
                    group: group,
                    members: members
                });
                return true;
            } else {
                throw new Error("failed to save members: " + group + " -> " + members);
            }
        },
        removeGroup: function (group) {
            this.load();
            if (this.__members[group]) {
                delete this.__members[group];
                return this.save();
            } else {
                console.error("group not exists: " + group);
                return false;
            }
        },
        load: function () {
            if (!this.__members) {
                this.__members = convert(Storage.loadJSON("GroupTable"));
            }
        },
        save: function () {
            return Storage.saveJSON(revert(this.__members), "GroupTable");
        },
        __members: null
    };
    var convert = function (map) {
        var results = {};
        if (map) {
            var g;
            var groups = Object.keys(map);
            for (var i = 0; i < groups.length; ++i) {
                g = groups[i];
                results[ID.parse(g)] = ID.convert(map[g]);
            }
        }
        return results;
    };
    var revert = function (map) {
        var results = {};
        var g;
        var groups = Object.keys(map);
        for (var i = 0; i < groups.length; ++i) {
            g = groups[i];
            results[g.toString()] = ID.revert(map[g]);
        }
        return results;
    };
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ID = sdk.protocol.ID;
    var Storage = sdk.dos.LocalStorage;
    ns.db.LoginTable = {
        getLoginCommand: function (user) {},
        saveLoginCommand: function (cmd) {},
        __docs: null
    };
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ID = sdk.protocol.ID;
    var InstantMessage = sdk.protocol.InstantMessage;
    var Storage = sdk.dos.SessionStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    ns.db.MessageTable = {
        numberOfConversations: function () {
            var keys = Object.keys(this.__messages);
            return keys.length;
        },
        conversationAtIndex: function (index) {
            var keys = Object.keys(this.__messages);
            return ID.parse(keys[index]);
        },
        removeConversationAtIndex: function (index) {
            var chat = this.conversationAtIndex(index);
            return this.removeConversation(chat);
        },
        removeConversation: function (entity) {},
        numberOfMessages: function (entity) {
            var messages = this.loadMessages(entity);
            if (messages) {
                return messages.length;
            } else {
                return 0;
            }
        },
        numberOfUnreadMessages: function (entity) {},
        clearUnreadMessages: function (entity) {},
        lastMessage: function (entity) {
            var messages = this.loadMessages(entity);
            if (messages && messages.length > 0) {
                return messages[messages.length - 1];
            } else {
                return null;
            }
        },
        lastReceivedMessage: function (user) {},
        messageAtIndex: function (index, entity) {
            var messages = this.loadMessages(entity);
            console.assert(
                messages !== null,
                "failed to get messages for conversation: " + entity
            );
            return messages[index];
        },
        insertMessage: function (iMsg, entity) {
            var messages = this.loadMessages(entity);
            if (messages) {
                if (!insert_message(iMsg, messages)) {
                    return false;
                }
            } else {
                messages = [iMsg];
            }
            if (this.saveMessages(messages, entity)) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification(ns.kNotificationMessageUpdated, this, {
                    ID: entity,
                    msg: iMsg
                });
                return true;
            } else {
                throw new Error("failed to save message: " + iMsg);
            }
        },
        removeMessage: function (iMsg, entity) {
            var messages = this.loadMessages(entity);
            console.assert(
                messages !== null,
                "failed to get messages for conversation: " + entity
            );
            if (!remove_message(iMsg, messages)) {
                return false;
            }
            return this.saveMessages(messages, entity);
        },
        withdrawMessage: function (iMsg, entity) {},
        saveReceipt: function (iMsg, entity) {},
        loadMessages: function (conversation) {
            this.load(conversation);
            return this.__messages[conversation];
        },
        saveMessages: function (messages, conversation) {
            if (messages && messages.length > 0) {
                this.__messages[conversation] = messages;
            } else {
                delete this.__messages[conversation];
            }
            return this.save(conversation);
        },
        load: function (identifier) {
            if (!this.__messages[identifier]) {
                this.__messages[identifier] = convert(
                    Storage.loadJSON(get_tag(identifier))
                );
            }
        },
        save: function (identifier) {
            return Storage.saveJSON(
                revert(this.__messages[identifier]),
                get_tag(identifier)
            );
        },
        __messages: {}
    };
    var get_tag = function (identifier) {
        return "Messages-" + identifier.getAddress().toString();
    };
    var convert = function (list) {
        var messages = [];
        if (list) {
            for (var i = 0; i < list.length; ++i) {
                messages.push(InstantMessage.parse(list[i]));
            }
        }
        return messages;
    };
    var revert = function (list) {
        var messages = [];
        if (list) {
            var msg;
            for (var i = 0; i < list.length; ++i) {
                msg = list[i];
                if (!msg) {
                    continue;
                }
                messages.push(msg.toMap());
            }
        }
        return messages;
    };
    var insert_message = function (iMsg, messages) {
        var t1, t2;
        t1 = iMsg.getTime();
        if (!t1) {
            t1 = 0;
        }
        var sn1, sn2;
        sn1 = iMsg.getContent().getSerialNumber();
        var index;
        var item;
        for (index = messages.length - 1; index >= 0; --index) {
            item = messages[index];
            t2 = item.getTime();
            if (t2 && t2 < t1) {
                break;
            }
            sn2 = item.getContent().getSerialNumber();
            if (sn1 === sn2) {
                console.log("duplicate message, no need to insert");
                return false;
            }
        }
        sdk.type.Arrays.insert(messages, index + 1, iMsg);
        return true;
    };
    var remove_message = function (iMsg, messages) {
        var t1, t2;
        t1 = iMsg.getTime();
        if (!t1) {
            t1 = 0;
        }
        var sn1, sn2;
        sn1 = iMsg.getContent().getSerialNumber();
        var index;
        var item;
        for (index = messages.length - 1; index >= 0; --index) {
            item = messages[index];
            t2 = item.getTime();
            if (t2 && t2 < t1) {
                console.log("message not found");
                return false;
            }
            sn2 = item.getContent().getSerialNumber();
            if (sn1 === sn2) {
                break;
            }
        }
        sdk.type.Arrays.insert(messages, index + 1, iMsg);
        return true;
    };
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ID = sdk.protocol.ID;
    var Meta = sdk.protocol.Meta;
    var Storage = sdk.dos.LocalStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    ns.db.MetaTable = {
        getMeta: function (identifier) {
            this.load();
            return this.__metas[identifier];
        },
        saveMeta: function (meta, identifier) {
            if (!meta.matches(identifier)) {
                console.error("meta mot match", identifier, meta);
                return false;
            }
            this.load();
            if (this.__metas[identifier]) {
                console.log("meta already exists", identifier);
                return true;
            }
            this.__metas[identifier] = meta;
            console.log("saving meta", identifier);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification(ns.kNotificationMetaAccepted, this, {
                    ID: identifier,
                    meta: meta
                });
                return true;
            } else {
                console.error("failed to save meta", identifier, meta);
                return false;
            }
        },
        load: function () {
            if (!this.__metas) {
                this.__metas = convert(Storage.loadJSON("MetaTable"));
            }
        },
        save: function () {
            return Storage.saveJSON(revert(this.__metas), "MetaTable");
        },
        __metas: null
    };
    var convert = function (map) {
        var results = {};
        if (map) {
            var id;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                id = list[i];
                results[ID.parse(id)] = Meta.parse(map[id]);
            }
        }
        return results;
    };
    var revert = function (map) {
        var results = {};
        if (map) {
            var id, m;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                id = list[i];
                m = map[id];
                if (!m) {
                    continue;
                }
                results[id.toString()] = m.toMap();
            }
        }
        return results;
    };
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ID = sdk.protocol.ID;
    var Storage = sdk.dos.LocalStorage;
    ns.db.MsgKeyTable = {
        getKey: function (from, to) {
            return null;
        },
        addKey: function (from, to, key) {
            return true;
        },
        __keys: null
    };
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var PrivateKey = sdk.crypto.PrivateKey;
    var ID = sdk.protocol.ID;
    var Storage = sdk.dos.LocalStorage;
    ns.db.PrivateKeyTable = {
        META: "M",
        VISA: "V",
        savePrivateKey: function (user, key, type, sign, decrypt) {
            this.load();
            this.__keys[get_tag(user, type)] = key;
            if (type === this.META) {
                this.__keys[get_tag(user, null)] = key;
            }
            return this.save();
        },
        getPrivateKeysForDecryption: function (user) {
            this.load();
            var keys = [];
            var key0 = this.__keys[get_tag(user, null)];
            var key1 = this.__keys[get_tag(user, this.META)];
            var key2 = this.__keys[get_tag(user, this.VISA)];
            if (key2) {
                keys.push(key2);
            }
            if (key1 && keys.indexOf(key1) < 0) {
                keys.push(key1);
            }
            if (key0 && keys.indexOf(key0) < 0) {
                keys.push(key0);
            }
            return keys;
        },
        getPrivateKeyForSignature: function (user) {
            return this.getPrivateKeyForVisaSignature(user);
        },
        getPrivateKeyForVisaSignature: function (user) {
            this.load();
            var key = this.__keys[get_tag(user, this.META)];
            if (!key) {
                key = this.__keys[get_tag(user, null)];
            }
            return key;
        },
        load: function () {
            if (!this.__keys) {
                this.__keys = convert(Storage.loadJSON("PrivateTable"));
            }
        },
        save: function () {
            return Storage.saveJSON(revert(this.__keys), "PrivateTable");
        },
        __keys: null
    };
    var get_tag = function (identifier, type) {
        if (!type || type.length === 0) {
            return identifier.toString();
        }
        var terminal = identifier.getTerminal();
        if (terminal && terminal.length > 0) {
            return identifier.toString() + "#" + type;
        } else {
            return identifier.toString() + "/" + type;
        }
    };
    var convert = function (map) {
        var results = {};
        if (map) {
            var tag;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                tag = list[i];
                results[tag] = PrivateKey.parse(map[tag]);
            }
        }
        return results;
    };
    var revert = function (map) {
        var results = {};
        if (map) {
            var tag;
            var list = Object.keys(map);
            var key;
            for (var i = 0; i < list.length; ++i) {
                tag = list[i];
                key = map[tag];
                if (!key) {
                    continue;
                }
                results[tag] = key.toMap();
            }
        }
        return results;
    };
})(SECHAT, DIMSDK);
(function (ns, sdk) {
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
                console.error("user already exists", user);
                return false;
            }
        },
        removeUser: function (user) {
            var list = this.allUsers();
            var index = list.indexOf(user);
            if (index < 0) {
                console.error("user not exists", user);
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
                return true;
            } else {
                if (index > 0) {
                    list.splice(index, 1);
                }
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
                this.__users = convert(Storage.loadJSON("UserTable"));
            }
        },
        save: function () {
            return Storage.saveJSON(revert(this.__users), "UserTable");
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
    };
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var Departure = sdk.startrek.port.Departure;
    var MessageWrapper = function (rMsg, departureShip) {
        this.__msg = rMsg;
        this.__ship = departureShip;
        this.__timestamp = 0;
    };
    sdk.Class(MessageWrapper, null, [Departure], null);
    MessageWrapper.EXPIRES = 600 * 1000;
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
    MessageWrapper.prototype.isExpired = function (now) {
        if (this.__timestamp < 0) {
            return true;
        } else {
            if (this.__timestamp === 0) {
                return false;
            }
        }
        var expired = this.__timestamp + MessageWrapper.EXPIRES;
        return now > expired;
    };
    MessageWrapper.prototype.getSN = function () {
        return this.__ship.getSN();
    };
    MessageWrapper.prototype.getPriority = function () {
        return this.__ship.getPriority();
    };
    MessageWrapper.prototype.getFragments = function () {
        return this.__ship.getFragments();
    };
    MessageWrapper.prototype.checkResponse = function (arrival) {
        return this.__ship.checkResponse(arrival);
    };
    MessageWrapper.prototype.isNew = function () {
        return this.__ship.isNew();
    };
    MessageWrapper.prototype.isDisposable = function () {
        return this.__ship.isDisposable();
    };
    MessageWrapper.prototype.isTimeout = function (now) {
        return this.__ship.isTimeout(now);
    };
    MessageWrapper.prototype.isFailed = function (now) {
        return this.__ship.isFailed(now);
    };
    MessageWrapper.prototype.touch = function (now) {
        return this.__ship.touch(now);
    };
    MessageWrapper.prototype.onAppended = function () {
        this.__timestamp = new Date().getTime();
    };
    MessageWrapper.prototype.onGateError = function (error) {
        this.__timestamp = -1;
    };
    MessageWrapper.prototype.onSent = function (docker) {
        this.__msg = null;
    };
    MessageWrapper.prototype.onFailed = function (error, docker) {
        this.__timestamp = -1;
    };
    ns.network.MessageWrapper = MessageWrapper;
    ns.network.registers("MessageWrapper");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var Dictionary = sdk.type.Dictionary;
    var MessageWrapper = ns.network.MessageWrapper;
    var MessageQueue = function () {
        this.__priorities = [];
        this.__fleets = new Dictionary();
    };
    sdk.Class(MessageQueue, null, null, null);
    MessageQueue.prototype.append = function (rMsg, departureShip) {
        var priority = departureShip.getPriority();
        var queue = this.__fleets.getValue(priority);
        if (queue) {
            var signature = rMsg.getValue("signature");
            var wrapper, item;
            for (var i = queue.length - 1; i >= 0; --i) {
                wrapper = queue[i];
                item = wrapper.getMessage();
                if (item && item.getValue("signature") === signature) {
                    return true;
                }
            }
        } else {
            queue = [];
            this.__fleets.setValue(priority, queue);
            insert_priority(priority, this.__priorities);
        }
        queue.push(new MessageWrapper(rMsg, departureShip));
        return true;
    };
    var insert_priority = function (prior, priorities) {
        var total = priorities.length;
        var value;
        var index = 0;
        for (; index < total; ++index) {
            value = priorities[index];
            if (value === prior) {
                return;
            } else {
                if (value > prior) {
                    break;
                }
            }
        }
        priorities.splice(index, 0, prior);
    };
    MessageQueue.prototype.next = function () {
        var priority;
        var queue, wrapper;
        var i, j;
        for (i = 0; i < this.__priorities.length; ++i) {
            priority = this.__priorities[i];
            queue = this.__fleets.getValue(priority);
            if (!queue) {
                continue;
            }
            for (j = 0; j < queue.length; ++j) {
                wrapper = queue[j];
                if (wrapper.isVirgin()) {
                    wrapper.mark();
                    return wrapper;
                }
            }
        }
        return null;
    };
    MessageQueue.prototype.eject = function (now) {
        var priority;
        var queue, wrapper;
        var i, j;
        for (i = 0; i < this.__priorities.length; ++i) {
            priority = this.__priorities[i];
            queue = this.__fleets.getValue(priority);
            if (!queue) {
                continue;
            }
            for (j = 0; j < queue.length; ++j) {
                wrapper = queue[j];
                if (!wrapper.getMessage() || wrapper.isExpired(now)) {
                    queue.splice(i, 1);
                    return wrapper;
                }
            }
        }
        return null;
    };
    MessageQueue.prototype.purge = function () {
        var count = 0;
        var now = new Date().getTime();
        var wrapper = this.eject(now);
        while (wrapper) {
            count += 1;
            wrapper = this.eject(now);
        }
        return count;
    };
    ns.network.MessageQueue = MessageQueue;
    ns.network.registers("MessageQueue");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var Transmitter = function () {};
    sdk.Interface(Transmitter, null);
    Transmitter.prototype.sendContent = function (
        sender,
        receiver,
        content,
        priority
    ) {
        ns.assert(false, "implement me!");
        return false;
    };
    Transmitter.prototype.sendInstantMessage = function (iMsg, priority) {
        ns.assert(false, "implement me!");
        return false;
    };
    Transmitter.prototype.sendReliableMessage = function (rMsg, priority) {
        ns.assert(false, "implement me!");
        return false;
    };
    ns.network.Transmitter = Transmitter;
    ns.network.registers("Transmitter");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var Runner = sdk.skywalker.Runner;
    var InetSocketAddress = sdk.startrek.type.InetSocketAddress;
    var DockerStatus = sdk.startrek.port.DockerStatus;
    var PlainDeparture = sdk.startrek.PlainDeparture;
    var Envelope = sdk.protocol.Envelope;
    var InstantMessage = sdk.protocol.InstantMessage;
    var MessageQueue = ns.network.MessageQueue;
    var Transmitter = ns.network.Transmitter;
    var GateKeeper = function (host, port, delegate, transceiver) {
        Runner.call(this);
        this.__remote = new InetSocketAddress(host, port);
        this.__gate = this.createGate(host, port, delegate);
        this.__messenger = transceiver;
        this.__queue = new MessageQueue();
        this.__active = false;
    };
    sdk.Class(GateKeeper, Runner, [Transmitter], null);
    GateKeeper.prototype.createGate = function (host, port, delegate) {
        ns.assert(false, "implement me!");
        return null;
    };
    GateKeeper.prototype.isActive = function () {
        return this.__active;
    };
    GateKeeper.prototype.setActive = function (active) {
        this.__active = active;
    };
    GateKeeper.prototype.getRemoteAddress = function () {
        return this.__remote;
    };
    GateKeeper.prototype.getStatus = function () {
        var docker = this.fetchDocker(this.__remote, null, null);
        if (docker) {
            return docker.getStatus();
        } else {
            return DockerStatus.ERROR;
        }
    };
    GateKeeper.prototype.getMessenger = function () {
        return this.__messenger;
    };
    var drive = function (gate) {
        var hub = gate.getHub();
        var incoming = hub.process();
        var outgoing = gate.process();
        return incoming || outgoing;
    };
    GateKeeper.prototype.process = function () {
        if (drive(this)) {
            return true;
        } else {
            if (!this.isActive()) {
                this.__queue.purge();
                return false;
            }
        }
        var wrapper = this.__queue.next();
        if (!wrapper) {
            this.__queue.purge();
            return false;
        }
        var msg = wrapper.getMessage();
        if (!msg) {
            return true;
        }
        if (send_ship(this, wrapper, this.__remote, null)) {
            wrapper.onAppended();
        } else {
            var error = new Error("gate error, failed to send data.");
            wrapper.onGateError(error);
        }
        return true;
    };
    var send_ship = function (gate, ship, remote, local) {
        var sent = false;
        try {
            sent = gate.sendShip(ship, remote, local);
        } catch (e) {
            console.error("GateKeeper::sendShip()", e, gate, ship, remote, local);
        }
        return sent;
    };
    GateKeeper.prototype.fetchDocker = function (remote, local, advanceParties) {
        var docker = null;
        try {
            docker = this.__gate.fetchDocker(remote, local, advanceParties);
        } catch (e) {
            console.error(
                "GateKeeper::fetchDocker()",
                e,
                remote,
                local,
                advanceParties
            );
        }
        return docker;
    };
    GateKeeper.prototype.sendData = function (payload, priority) {
        var sent = false;
        try {
            sent = this.__gate.sendMessage(payload, this.__remote, null);
        } catch (e) {
            console.error("GateKeeper::sendData()", e, payload);
        }
        return sent;
    };
    GateKeeper.prototype.sendReliableMessage = function (rMsg, priority) {
        var messenger = this.getMessenger();
        var data = messenger.serializeMessage(rMsg);
        var ship = new PlainDeparture(data, priority);
        return this.__queue.append(rMsg, ship);
    };
    GateKeeper.prototype.sendInstantMessage = function (iMsg, priority) {
        var messenger = this.getMessenger();
        var sMsg = messenger.encryptMessage(iMsg);
        if (!sMsg) {
            return;
        }
        var rMsg = messenger.signMessage(sMsg);
        if (!rMsg) {
            throw new Error("failed to sign message: " + sMsg.toMap());
        }
        this.sendReliableMessage(rMsg);
        var signature = rMsg.getValue("signature");
        iMsg.setValue("signature", signature);
        messenger.saveMessage(iMsg);
    };
    GateKeeper.prototype.sendContent = function (
        sender,
        receiver,
        content,
        priority
    ) {
        if (!sender) {
            var messenger = this.getMessenger();
            var facebook = messenger.getFacebook();
            var user = facebook.getCurrentUser();
            if (!user) {
                throw new Error("current user not set");
            }
            sender = user.getIdentifier();
        }
        var env = Envelope.create(sender, receiver, null);
        var iMsg = InstantMessage.create(env, content);
        return this.sendInstantMessage(iMsg, priority);
    };
    ns.network.GateKeeper = GateKeeper;
    ns.network.registers("GateKeeper");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var UTF8 = sdk.format.UTF8;
    var Runner = sdk.skywalker.Runner;
    var DockerDelegate = sdk.startrek.port.DockerDelegate;
    var DockerStatus = sdk.startrek.port.DockerStatus;
    var Transmitter = ns.network.Transmitter;
    var MessageWrapper = ns.network.MessageWrapper;
    var BaseSession = function (host, port, transceiver) {
        Runner.call(this);
        this.__keeper = this.createGateKeeper(host, port, transceiver);
    };
    sdk.Class(BaseSession, Runner, [DockerDelegate, Transmitter], null);
    BaseSession.prototype.createGateKeeper = function (host, port, messenger) {
        ns.assert(false, "implement me!");
        return null;
    };
    BaseSession.prototype.getMessenger = function () {
        return this.__keeper.getMessenger();
    };
    BaseSession.prototype.isActive = function () {
        return this.__keeper.isActive();
    };
    BaseSession.prototype.setActive = function (active) {
        this.__keeper.setActive(active);
    };
    BaseSession.prototype.getStatus = function () {
        return this.__keeper.getStats();
    };
    BaseSession.prototype.close = function () {
        this.setActive(false);
    };
    BaseSession.prototype.stop = function () {
        Runner.prototype.stop.call(this);
        this.__keeper.stop();
    };
    BaseSession.prototype.isRunning = function () {
        var running = Runner.prototype.isRunning.call(this);
        return running && this.__keeper.isRunning();
    };
    BaseSession.prototype.setup = function () {
        var waiting1 = Runner.prototype.setup.call(this);
        var waiting2 = this.__keeper.setup();
        return waiting1 || waiting2;
    };
    BaseSession.prototype.finish = function () {
        var waiting1 = Runner.prototype.finish.call(this);
        var waiting2 = this.__keeper.finish();
        return waiting1 || waiting2;
    };
    BaseSession.prototype.process = function () {
        return this.__keeper.process();
    };
    BaseSession.prototype.sendData = function (payload, priority) {
        if (!this.isActive()) {
            console.warn("BaseSession::sendData()", this.__keeper.getRemoteAddress());
        }
        console.log("sending " + payload.length + " byte(s)");
        return this.__keeper.sendData(payload, priority);
    };
    BaseSession.prototype.sendReliableMessage = function (rMsg, priority) {
        if (!this.isActive()) {
            console.warn(
                "BaseSession::sendReliableMessage()",
                this.__keeper.getRemoteAddress()
            );
        }
        console.log(
            "sending message to " + rMsg.getReceiver() + ", priority: " + priority
        );
        return this.__keeper.sendReliableMessage(rMsg, priority);
    };
    BaseSession.prototype.sendInstantMessage = function (iMsg, priority) {
        if (!this.isActive()) {
            console.warn(
                "BaseSession::sendInstantMessage()",
                this.__keeper.getRemoteAddress()
            );
        }
        console.log(
            "sending message to " + iMsg.getReceiver() + ", priority: " + priority
        );
        return this.__keeper.sendInstantMessage(iMsg, priority);
    };
    BaseSession.prototype.sendContent = function (
        sender,
        receiver,
        content,
        priority
    ) {
        if (!this.isActive()) {
            console.warn(
                "BaseSession::sendContent()",
                this.__keeper.getRemoteAddress()
            );
        }
        console.log("sending content to " + receiver + ", priority: " + priority);
        return this.__keeper.sendContent(sender, receiver, content, priority);
    };
    BaseSession.prototype.onDockerStatusChanged = function (
        previous,
        current,
        docker
    ) {
        if (!current || current.equals(DockerStatus.ERROR)) {
            this.setActive(false);
        } else {
            if (current.equals(DockerStatus.READY)) {
                var messenger = this.getMessenger();
                messenger.onConnected();
            }
        }
    };
    var split_lines = function (data) {
        if (data.indexOf(LINEFEED) < 0) {
            return [data];
        }
        var str = UTF8.decode(data);
        var array = str.split("\n");
        var lines = [];
        for (var i = 0; i < array.length; ++i) {
            lines.push(UTF8.encode(array[i]));
        }
        return lines;
    };
    var join_lines = function (responses) {
        if (responses.length === 1) {
            return responses[0];
        }
        var str = UTF8.decode(responses[0]);
        for (var i = 1; i < responses.length; ++i) {
            str += "\n" + UTF8.decode(responses[i]);
        }
        return UTF8.encode(str);
    };
    var LINEFEED = "\n".charCodeAt(0);
    var BRACE = "{".charCodeAt(0);
    BaseSession.prototype.onDockerReceived = function (arrival, docker) {
        var payload = arrival.getPackage();
        console.log("BaseSession::onDockerReceived()", payload);
        var packages;
        if (!payload || payload.length === 0) {
            packages = [];
        } else {
            if (payload[0] === BRACE) {
                packages = split_lines(payload);
            } else {
                packages = [payload];
            }
        }
        var pack;
        var messenger = this.getMessenger();
        var responses, buffer;
        for (var i = 0; i < packages.length; ++i) {
            pack = packages[i];
            try {
                responses = messenger.processPackage(pack);
            } catch (e) {
                console.error("BaseSession::onDockerReceived()", e);
                continue;
            }
            if (!responses || responses.length === 0) {
                continue;
            }
            buffer = join_lines(responses);
            this.__keeper.sendData(buffer, 1);
        }
    };
    BaseSession.prototype.onDockerSent = function (departure, docker) {
        if (departure instanceof MessageWrapper) {
            departure.onSent(docker);
        }
    };
    BaseSession.prototype.onDockerFailed = function (error, departure, docker) {
        if (departure instanceof MessageWrapper) {
            departure.onFailed(error, docker);
        }
    };
    BaseSession.prototype.onDockerError = function (error, departure, docker) {
        console.error("BaseSession::onDockerError()", error, departure, docker);
    };
    ns.network.BaseSession = BaseSession;
    ns.network.registers("BaseSession");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var Command = sdk.protocol.Command;
    var ReportCommand = function () {};
    sdk.Interface(ReportCommand, [Command]);
    ReportCommand.REPORT = "report";
    ReportCommand.ONLINE = "online";
    ReportCommand.OFFLINE = "offline";
    ReportCommand.prototype.setTitle = function (title) {
        console.assert(false, "implement me!");
    };
    ReportCommand.prototype.getTitle = function () {
        console.assert(false, "implement me!");
        return null;
    };
    ns.protocol.ReportCommand = ReportCommand;
    ns.protocol.registers("ReportCommand");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ReportCommand = sdk.protocol.ReportCommand;
    var BaseCommand = ns.dkd.BaseCommand;
    var BaseReportCommand = function () {
        if (arguments.length === 0) {
            BaseCommand.call(this, ReportCommand.REPORT);
        } else {
            if (typeof arguments[0] === "string") {
                BaseCommand.call(this, ReportCommand.REPORT);
                this.setTitle(arguments[0]);
            } else {
                BaseCommand.call(this, arguments[0]);
            }
        }
    };
    sdk.Class(BaseReportCommand, BaseCommand, [ReportCommand], {
        setTitle: function (title) {
            this.setValue("title", title);
        },
        getTitle: function () {
            return this.getValue("title");
        }
    });
    ReportCommand.report = function (title) {
        if (title) {
            return new BaseReportCommand();
        } else {
            return new BaseReportCommand();
        }
    };
    ns.dkd.BaseReportCommand = BaseReportCommand;
    ns.dkd.registers("BaseReportCommand");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var Command = sdk.protocol.Command;
    var SearchCommand = function () {};
    sdk.Interface(SearchCommand, [Command]);
    SearchCommand.SEARCH = "search";
    SearchCommand.ONLINE_USERS = "users";
    SearchCommand.prototype.setKeywords = function (keywords) {
        console.assert(false, "implement me!");
    };
    SearchCommand.prototype.getUsers = function () {
        console.assert(false, "implement me!");
        return null;
    };
    SearchCommand.prototype.getResults = function () {
        console.assert(false, "implement me!");
        return null;
    };
    ns.protocol.SearchCommand = SearchCommand;
    ns.protocol.registers("SearchCommand");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ID = sdk.protocol.ID;
    var SearchCommand = sdk.protocol.SearchCommand;
    var BaseCommand = ns.dkd.BaseCommand;
    var BaseSearchCommand = function () {
        if (arguments.length === 0) {
            BaseCommand.call(this, SearchCommand.ONLINE_USERS);
        } else {
            if (typeof arguments[0] === "string") {
                BaseCommand.call(this, SearchCommand.SEARCH);
                this.setKeywords(arguments[0]);
            } else {
                BaseCommand.call(this, arguments[0]);
            }
        }
    };
    sdk.Class(BaseSearchCommand, BaseCommand, [SearchCommand], {
        setKeywords: function (keywords) {
            this.setValue("keywords", keywords);
        },
        getUsers: function () {
            var users = this.getValue("users");
            if (users) {
                return ID.convert(users);
            } else {
                return null;
            }
        },
        getResults: function () {
            return this.getValue("results");
        }
    });
    SearchCommand.search = function (keywords) {
        if (keywords) {
            return new BaseSearchCommand(keywords);
        } else {
            return new BaseSearchCommand();
        }
    };
    ns.dkd.BaseSearchCommand = BaseSearchCommand;
    ns.dkd.registers("BaseSearchCommand");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var NetworkType = sdk.protocol.NetworkType;
    var ID = sdk.protocol.ID;
    var BTCAddress = sdk.mkm.BTCAddress;
    var ETHAddress = sdk.mkm.ETHAddress;
    var Anonymous = {
        getName: function (identifier) {
            var name;
            if (sdk.Interface.conforms(identifier, ID)) {
                name = identifier.getName();
                if (!name || name.length === 0) {
                    name = get_name(identifier.getType());
                }
            } else {
                name = get_name(identifier.getNetwork());
            }
            var number = this.getNumberString(identifier);
            return name + " (" + number + ")";
        },
        getNumberString: function (address) {
            var str = "" + this.getNumber(address);
            while (str.length < 10) {
                str = "0" + str;
            }
            return str.substr(0, 3) + "-" + str.substr(3, 3) + "-" + str.substr(6);
        },
        getNumber: function (address) {
            if (sdk.Interface.conforms(address, ID)) {
                address = address.getAddress();
            }
            if (address instanceof BTCAddress) {
                return btc_number(address);
            }
            if (address instanceof ETHAddress) {
                return eth_number(address);
            }
            throw new TypeError("address error: " + address.toString());
        }
    };
    var get_name = function (type) {
        if (NetworkType.ROBOT.equals(type)) {
            return "Robot";
        }
        if (NetworkType.STATION.equals(type)) {
            return "Station";
        }
        if (NetworkType.PROVIDER.equals(type)) {
            return "SP";
        }
        if (NetworkType.isUser(type)) {
            return "User";
        }
        if (NetworkType.isGroup(type)) {
            return "Group";
        }
        return "Unknown";
    };
    var btc_number = function (btc) {
        var data = sdk.format.Base58.decode(btc.toString());
        return user_number(data);
    };
    var eth_number = function (eth) {
        var data = sdk.format.Hex.decode(eth.toString().substr(2));
        return user_number(data);
    };
    var user_number = function (cc) {
        var len = cc.length;
        var c1 = cc[len - 1] & 255;
        var c2 = cc[len - 2] & 255;
        var c3 = cc[len - 3] & 255;
        var c4 = cc[len - 4] & 255;
        return (c1 | (c2 << 8) | (c3 << 16)) + c4 * 16777216;
    };
    ns.Anonymous = Anonymous;
    ns.registers("Anonymous");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var DecryptKey = sdk.crypto.DecryptKey;
    var ID = sdk.protocol.ID;
    var Entity = sdk.mkm.Entity;
    var User = sdk.mkm.User;
    var Group = sdk.mkm.Group;
    var Facebook = sdk.Facebook;
    var CommonFacebook = function () {
        Facebook.call(this);
        this.__localUsers = null;
        this.privateKeyTable = ns.db.PrivateKeyTable;
        this.metaTable = ns.db.MetaTable;
        this.documentTable = ns.db.DocumentTable;
        this.userTable = ns.db.UserTable;
        this.contactTable = ns.db.ContactTable;
        this.groupTable = ns.db.GroupTable;
    };
    sdk.Class(CommonFacebook, Facebook, null, null);
    CommonFacebook.EXPIRES = 30 * 60 * 1000;
    CommonFacebook.EXPIRES_KEY = "expires";
    CommonFacebook.prototype.getLocalUsers = function () {
        if (!this.__localUsers) {
            var list = this.userTable.allUsers();
            var users = [];
            var item;
            for (var i = 0; i < list.length; ++i) {
                item = this.getUser(list[i]);
                if (item) {
                    users.push(item);
                } else {
                    throw new Error("failed to get local user:" + item);
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
        }
        return Facebook.prototype.getCurrentUser.call(this);
    };
    CommonFacebook.prototype.setCurrentUser = function (user) {
        this.__localUsers = null;
        if (sdk.Interface.conforms(user, User)) {
            user = user.getIdentifier();
        }
        return this.userTable.setCurrentUser(user);
    };
    CommonFacebook.prototype.addUser = function (user) {
        this.__localUsers = null;
        if (sdk.Interface.conforms(user, User)) {
            user = user.getIdentifier();
        }
        return this.userTable.addUser(user);
    };
    CommonFacebook.prototype.removeUser = function (user) {
        this.__localUsers = null;
        if (sdk.Interface.conforms(user, User)) {
            user = user.getIdentifier();
        }
        return this.userTable.removeUser(user);
    };
    CommonFacebook.prototype.addContact = function (contact, user) {
        if (sdk.Interface.conforms(contact, Entity)) {
            contact = contact.getIdentifier();
        }
        if (sdk.Interface.conforms(user, User)) {
            user = user.getIdentifier();
        }
        return this.contactTable.addContact(contact, user);
    };
    CommonFacebook.prototype.removeContact = function (contact, user) {
        if (sdk.Interface.conforms(contact, Entity)) {
            contact = contact.getIdentifier();
        }
        if (sdk.Interface.conforms(user, User)) {
            user = user.getIdentifier();
        }
        return this.contactTable.removeContact(contact, user);
    };
    CommonFacebook.prototype.savePrivateKey = function (key, user) {
        if (sdk.Interface.conforms(user, User)) {
            user = user.getIdentifier();
        }
        return this.privateKeyTable.savePrivateKey(key, user);
    };
    CommonFacebook.prototype.saveMeta = function (meta, identifier) {
        return this.metaTable.saveMeta(meta, identifier);
    };
    CommonFacebook.prototype.saveDocument = function (doc) {
        if (!this.checkDocument(doc)) {
            return false;
        }
        doc.removeValue(CommonFacebook.EXPIRES_KEY);
        return this.documentTable.saveDocument(doc);
    };
    CommonFacebook.prototype.isExpiredDocument = function (doc, reset) {
        var now = new Date().getTime();
        var expires = doc.getValue(CommonFacebook.EXPIRES_KEY);
        if (!expires) {
            doc.setValue(CommonFacebook.EXPIRES_KEY, now + CommonFacebook.EXPIRES);
            return false;
        } else {
            if (now < expires) {
                return false;
            }
        }
        if (reset) {
            doc.setValue(CommonFacebook.EXPIRES_KEY, now + CommonFacebook.EXPIRES);
        }
        return true;
    };
    CommonFacebook.prototype.addMember = function (member, group) {
        if (sdk.Interface.conforms(member, User)) {
            member = member.getIdentifier();
        }
        if (sdk.Interface.conforms(group, Group)) {
            group = group.getIdentifier();
        }
        return this.groupTable.addMember(member, group);
    };
    CommonFacebook.prototype.removeMember = function (member, group) {
        if (sdk.Interface.conforms(member, User)) {
            member = member.getIdentifier();
        }
        if (sdk.Interface.conforms(group, Group)) {
            group = group.getIdentifier();
        }
        return this.groupTable.removeMember(member, group);
    };
    CommonFacebook.prototype.saveMembers = function (members, group) {
        if (sdk.Interface.conforms(group, Group)) {
            group = group.getIdentifier();
        }
        return this.groupTable.saveMembers(members, group);
    };
    CommonFacebook.prototype.removeGroup = function (group) {
        if (sdk.Interface.conforms(group, Group)) {
            group = group.getIdentifier();
        }
        return this.groupTable.removeGroup(group);
    };
    CommonFacebook.prototype.containsMember = function (member, group) {
        if (sdk.Interface.conforms(member, User)) {
            member = member.getIdentifier();
        }
        if (sdk.Interface.conforms(group, Group)) {
            group = group.getIdentifier();
        }
        var members = this.getMembers(group);
        if (members && members.indexOf(member) >= 0) {
            return true;
        }
        var owner = this.getOwner(group);
        return owner && owner.equals(member);
    };
    CommonFacebook.prototype.containsAssistant = function (bot, group) {
        if (sdk.Interface.conforms(bot, User)) {
            bot = bot.getIdentifier();
        }
        if (sdk.Interface.conforms(group, Group)) {
            group = group.getIdentifier();
        }
        var bots = this.getAssistants(group);
        return bots && bots.indexOf(bot) >= 0;
    };
    CommonFacebook.prototype.getName = function (identifier) {
        var doc = this.getDocument(identifier, "*");
        if (doc) {
            var name = doc.getName();
            if (name && name.length > 0) {
                return name;
            }
        }
        return ns.Anonymous.getName(identifier);
    };
    CommonFacebook.prototype.createUser = function (identifier) {
        if (is_waiting.call(this, identifier)) {
            return null;
        }
        return Facebook.prototype.createUser.call(this, identifier);
    };
    var is_waiting = function (id) {
        return !id.isBroadcast() && !this.getMeta(id);
    };
    CommonFacebook.prototype.createGroup = function (identifier) {
        if (is_waiting.call(this, identifier)) {
            return null;
        }
        return Facebook.prototype.createGroup.call(this, identifier);
    };
    CommonFacebook.prototype.getMeta = function (identifier) {
        if (identifier.isBroadcast()) {
            return null;
        }
        return this.metaTable.getMeta(identifier);
    };
    CommonFacebook.prototype.getDocument = function (identifier, type) {
        return this.documentTable.getDocument(identifier, type);
    };
    CommonFacebook.prototype.getContacts = function (user) {
        return this.contactTable.getContacts(user);
    };
    CommonFacebook.prototype.getPrivateKeysForDecryption = function (user) {
        var keys = this.privateKeyTable.getPrivateKeysForDecryption(user);
        if (!keys || keys.length === 0) {
            var key = this.getPrivateKeyForSignature(user);
            if (sdk.Interface.conforms(key, DecryptKey)) {
                keys = [key];
            }
        }
        return keys;
    };
    CommonFacebook.prototype.getPrivateKeyForSignature = function (user) {
        return this.privateKeyTable.getPrivateKeyForSignature(user);
    };
    CommonFacebook.prototype.getPrivateKeyForVisaSignature = function (user) {
        return this.privateKeyTable.getPrivateKeyForVisaSignature(user);
    };
    CommonFacebook.prototype.getFounder = function (group) {
        var founder = this.groupTable.getFounder(group);
        if (founder) {
            return founder;
        }
        return Facebook.prototype.getFounder.call(this, group);
    };
    CommonFacebook.prototype.getOwner = function (group) {
        var owner = this.groupTable.getOwner(group);
        if (owner) {
            return owner;
        }
        return Facebook.prototype.getOwner.call(this, group);
    };
    CommonFacebook.prototype.getMembers = function (group) {
        var members = this.groupTable.getMembers(group);
        if (members && members.length > 0) {
            return members;
        }
        return Facebook.prototype.getMembers.call(this, group);
    };
    CommonFacebook.prototype.getAssistants = function (group) {
        var bots = this.groupTable.getAssistants(group);
        if (bots && bots.length > 0) {
            return bots;
        }
        var identifier = ID.parse("assistant");
        if (identifier) {
            return [identifier];
        } else {
            return null;
        }
    };
    ns.CommonFacebook = CommonFacebook;
    ns.registers("CommonFacebook");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var SymmetricKey = sdk.crypto.SymmetricKey;
    var CipherKeyDelegate = sdk.CipherKeyDelegate;
    var KeyStore = function () {
        Object.call(this);
        this.__keyMap = {};
        this.keyTable = null;
    };
    sdk.Class(KeyStore, Object, [CipherKeyDelegate], null);
    KeyStore.prototype.getCipherKey = function (sender, receiver, generate) {
        if (receiver.isBroadcast()) {
            return sdk.crypto.PlainKey.getInstance();
        }
        var key;
        var table = this.__keyMap[sender.toString()];
        if (table) {
            key = table[receiver.toString()];
            if (key) {
                return SymmetricKey.parse(key);
            }
        } else {
            table = {};
            this.__keyMap[sender.toString()] = table;
        }
        key = this.keyTable.getKey(sender, receiver);
        if (key) {
            table[receiver.toString()] = key.toMap();
        } else {
            if (generate) {
                key = SymmetricKey.generate(SymmetricKey.AES);
                this.keyTable.addKey(sender, receiver, key);
                table[receiver.toString()] = key.toMap();
            }
        }
        return key;
    };
    KeyStore.prototype.cacheCipherKey = function (sender, receiver, key) {
        if (receiver.isBroadcast()) {
            return;
        }
        if (this.keyTable.addKey(sender, receiver, key)) {
            var table = this.__keyMap[sender.toString()];
            if (!table) {
                table = {};
                this.__keyMap[sender.toString()] = table;
            }
            table[receiver.toString()] = key.toMap();
        }
    };
    var s_cache = null;
    KeyStore.getInstance = function () {
        if (!s_cache) {
            s_cache = new KeyStore();
        }
        return s_cache;
    };
    ns.KeyStore = KeyStore;
    ns.registers("KeyStore");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var MessengerDelegate = function () {};
    sdk.Interface(MessengerDelegate, null);
    MessengerDelegate.prototype.uploadData = function (data, iMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    MessengerDelegate.prototype.downloadData = function (url, iMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.MessengerDelegate = MessengerDelegate;
    ns.registers("MessengerDelegate");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ContentType = sdk.protocol.ContentType;
    var FileContent = sdk.protocol.FileContent;
    var Messenger = sdk.Messenger;
    var KeyStore = ns.KeyStore;
    var CommonMessenger = function () {
        Messenger.call(this);
        this.__delegate = null;
        this.__packer = null;
        this.__processor = null;
    };
    sdk.Class(CommonMessenger, Messenger, null, null);
    CommonMessenger.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate;
    };
    CommonMessenger.prototype.getDelegate = function () {
        return this.__delegate;
    };
    CommonMessenger.prototype.getFacebook = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    CommonMessenger.prototype.getCipherKeyDelegate = function () {
        return this.getKeyStore();
    };
    CommonMessenger.prototype.getKeyStore = function () {
        return KeyStore.getInstance();
    };
    CommonMessenger.prototype.getPacker = function () {
        if (!this.__packer) {
            this.__packer = this.createPacker();
        }
        return this.__packer;
    };
    CommonMessenger.prototype.createPacker = function () {
        return new ns.CommonPacker(this.getFacebook(), this);
    };
    CommonMessenger.prototype.getProcessor = function () {
        if (!this.__processor) {
            this.__processor = this.createProcessor();
        }
        return this.__processor;
    };
    CommonMessenger.prototype.createProcessor = function () {
        return new ns.CommonProcessor(this.getFacebook(), this);
    };
    CommonMessenger.prototype.getFileContentProcessor = function () {
        var processor = this.getProcessor();
        var type = ContentType.FILE.valueOf();
        return processor.getContentProcessor(type);
    };
    CommonMessenger.prototype.serializeContent = function (
        content,
        password,
        iMsg
    ) {
        if (sdk.Interface.conforms(content, FileContent)) {
            var fpu = this.getFileContentProcessor();
            fpu.uploadFileContent(content, password, iMsg);
        }
        return Messenger.prototype.serializeContent.call(
            this,
            content,
            password,
            iMsg
        );
    };
    CommonMessenger.prototype.deserializeContent = function (
        data,
        password,
        sMsg
    ) {
        var content;
        try {
            content = Messenger.prototype.deserializeContent.call(
                this,
                data,
                password,
                sMsg
            );
        } catch (e) {
            console.error("deserialize content error", e);
            return null;
        }
        if (!content) {
            throw new Error("failed to deserialize message content: " + sMsg);
        }
        if (sdk.Interface.conforms(content, FileContent)) {
            var fpu = this.getFileContentProcessor();
            fpu.downloadFileContent(content, password, sMsg);
        }
        return content;
    };
    CommonMessenger.prototype.serializeKey = function (password, iMsg) {
        var reused = password.getValue("reused");
        if (reused) {
            var receiver = iMsg.getReceiver();
            if (receiver.isGroup()) {
                return null;
            }
            password.removeValue("reused");
        }
        var data = Messenger.prototype.serializeKey.call(this, password, iMsg);
        if (reused) {
            password.setValue("reused", reused);
        }
        return data;
    };
    CommonMessenger.prototype.encryptKey = function (data, receiver, iMsg) {
        var facebook = this.getFacebook();
        var key = facebook.getPublicKeyForEncryption(receiver);
        if (!key) {
            this.suspendInstantMessage(iMsg);
            return null;
        }
        return Messenger.prototype.encryptKey.call(this, data, receiver, iMsg);
    };
    CommonMessenger.prototype.suspendReliableMessage = function (rMsg) {
        ns.assert(false, "implement me!");
    };
    CommonMessenger.prototype.suspendInstantMessage = function (iMsg) {
        ns.assert(false, "implement me!");
    };
    CommonMessenger.prototype.saveMessage = function (iMsg) {
        ns.assert(false, "implement me!");
        return false;
    };
    CommonMessenger.prototype.sendContent = function (
        sender,
        receiver,
        content,
        priority
    ) {
        ns.assert(false, "implement me!");
        return false;
    };
    CommonMessenger.prototype.queryMeta = function (identifier) {
        console.assert(false, "implement me!");
        return false;
    };
    CommonMessenger.prototype.queryDocument = function (identifier, type) {
        console.assert(false, "implement me!");
        return false;
    };
    CommonMessenger.prototype.queryGroupInfo = function (group, members) {
        console.assert(false, "implement me!");
        return false;
    };
    CommonMessenger.prototype.onConnected = function () {
        console.log("connected");
    };
    CommonMessenger.prototype.uploadData = function (data, iMsg) {
        var delegate = this.getDelegate();
        return delegate.uploadData(data, iMsg);
    };
    CommonMessenger.prototype.downloadData = function (url, iMsg) {
        var delegate = this.getDelegate();
        return delegate.downloadData(url, iMsg);
    };
    ns.CommonMessenger = CommonMessenger;
    ns.registers("CommonMessenger");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var Command = sdk.protocol.Command;
    var CommandFactory = sdk.core.CommandFactory;
    var SearchCommand = ns.protocol.SearchCommand;
    var ReportCommand = ns.protocol.ReportCommand;
    sdk.registerAllFactories();
    var search = new CommandFactory(SearchCommand);
    Command.setFactory(SearchCommand.SEARCH, search);
    Command.setFactory(SearchCommand.ONLINE_USERS, search);
    var report = new CommandFactory(ReportCommand);
    Command.setFactory(ReportCommand.REPORT, report);
    Command.setFactory(ReportCommand.ONLINE, report);
    Command.setFactory(ReportCommand.OFFLINE, report);
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var Meta = sdk.protocol.Meta;
    var ReliableMessage = sdk.protocol.ReliableMessage;
    var DocumentCommand = sdk.protocol.DocumentCommand;
    var MessagePacker = sdk.MessagePacker;
    var CommonPacker = function (facebook, messenger) {
        MessagePacker.call(this, facebook, messenger);
    };
    sdk.Class(CommonPacker, MessagePacker, null, null);
    var attach = function (rMsg) {
        var messenger = this.getMessenger();
        if (!rMsg.getDelegate()) {
            rMsg.setDelegate(messenger);
        }
        if (rMsg.getEncryptedKey()) {
            return;
        }
        var keys = rMsg.getEncryptedKeys();
        if (!keys) {
            keys = {};
        } else {
            if (keys["digest"]) {
                return;
            }
        }
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
            return;
        }
        var data = key.getData();
        if (!data || data.length === 0) {
            if (key.getAlgorithm() === "PLAIN") {
                return;
            }
            throw new ReferenceError("key data error: " + key.toMap());
        }
        var part = data.subarray(data.length - 6);
        var digest = sdk.digest.SHA256.digest(part);
        var base64 = sdk.format.Base64.encode(digest);
        keys["digest"] = base64.substr(base64.length - 8);
        rMsg.setValue("keys", keys);
    };
    CommonPacker.prototype.serializeMessage = function (rMsg) {
        attach.call(this, rMsg);
        return MessagePacker.prototype.serializeMessage.call(this, rMsg);
    };
    CommonPacker.prototype.deserializeMessage = function (data) {
        if (!data || data.length < 2) {
            console.error("receive data error", data);
            return null;
        }
        var rMsg = MessagePacker.prototype.deserializeMessage.call(this, data);
        fix_visa(rMsg);
        return rMsg;
    };
    CommonPacker.prototype.signMessage = function (sMsg) {
        if (sdk.Interface.conforms(sMsg, ReliableMessage)) {
            return sMsg;
        }
        return MessagePacker.prototype.signMessage.call(this, sMsg);
    };
    CommonPacker.prototype.verifyMessage = function (rMsg) {
        var sender = rMsg.getSender();
        var meta = rMsg.getMeta();
        if (!meta) {
            var facebook = this.getFacebook();
            meta = facebook.getMeta(sender);
        } else {
            if (!Meta.matches(meta, sender)) {
                meta = null;
            }
        }
        if (!meta) {
            var messenger = this.getMessenger();
            messenger.suspendReliableMessage(rMsg);
            return null;
        }
        return MessagePacker.prototype.verifyMessage.call(this, rMsg);
    };
    var isWaiting = function (identifier, facebook) {
        if (identifier.isGroup()) {
            return !facebook.getMeta(identifier);
        } else {
            return !facebook.getPublicKeyForEncryption(identifier);
        }
    };
    CommonPacker.prototype.encryptMessage = function (iMsg) {
        var facebook = this.getFacebook();
        var messenger = this.getMessenger();
        var receiver = iMsg.getReceiver();
        var group = iMsg.getGroup();
        if (!(receiver.isBroadcast() || (group && group.isBroadcast()))) {
            if (
                isWaiting(receiver, facebook) ||
                (group && isWaiting(group, facebook))
            ) {
                messenger.suspendInstantMessage(iMsg);
                return null;
            }
        }
        var sMsg = MessagePacker.prototype.encryptMessage.call(this, iMsg);
        if (receiver.isGroup()) {
            var sender = iMsg.getSender();
            var key = messenger.getCipherKey(sender, receiver, false);
            key.setValue("reused", true);
        }
        return sMsg;
    };
    CommonPacker.prototype.decryptMessage = function (sMsg) {
        try {
            var iMsg = MessagePacker.prototype.decryptMessage.call(this, sMsg);
            fix_profile(iMsg.getContent());
            return iMsg;
        } catch (e) {
            if (e.toString().indexOf("failed to decrypt key in msg: ") === 0) {
                var facebook = this.getFacebook();
                var user = facebook.getCurrentUser();
                var visa = user.getVisa();
                if (!visa || !visa.isValid()) {
                    throw new ReferenceError("user visa error: " + user.getIdentifier());
                }
                var cmd = DocumentCommand.response(user.getIdentifier(), null, visa);
                var messenger = this.getMessenger();
                messenger.sendContent(user.getIdentifier(), sMsg.getSender(), cmd, 0);
            } else {
                throw e;
            }
            return null;
        }
    };
    var fix_profile = function (content) {
        if (sdk.Interface.conforms(content, DocumentCommand)) {
            var doc = content.getValue("document");
            if (doc) {
                return;
            }
            var profile = content.getValue("profile");
            if (profile) {
                content.removeValue("profile");
                if (typeof profile === "string") {
                    var dict = {
                        ID: content.getValue("ID"),
                        data: profile,
                        signature: content.getValue("signature")
                    };
                    content.setValue("document", dict);
                } else {
                    content.setValue("document", profile);
                }
            }
        }
    };
    var fix_visa = function (rMsg) {
        var profile = rMsg.getValue("profile");
        if (profile) {
            rMsg.removeValue("profile");
            var visa = rMsg.getValue("visa");
            if (!visa) {
                rMsg.setValue("visa", profile);
            }
        }
    };
    ns.CommonPacker = CommonPacker;
    ns.registers("CommonPacker");
})(SECHAT, DIMSDK);
(function (ns, sdk) {
    var ID = sdk.protocol.ID;
    var ForwardContent = sdk.protocol.ForwardContent;
    var InviteCommand = sdk.protocol.group.InviteCommand;
    var ResetCommand = sdk.protocol.group.ResetCommand;
    var MessageProcessor = sdk.MessageProcessor;
    var CommonProcessorCreator = ns.cpu.CommonProcessorCreator;
    var CommonProcessor = function (facebook, messenger) {
        MessageProcessor.call(this, facebook, messenger);
    };
    sdk.Class(CommonProcessor, MessageProcessor, null, {
        createCreator: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new CommonProcessorCreator(facebook, messenger);
        }
    });
    var is_empty = function (group) {
        var facebook = this.getFacebook();
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            return true;
        } else {
            return !facebook.getOwner();
        }
    };
    var is_waiting_group = function (content, sender) {
        var group = content.getGroup();
        if (!group || group.isBroadcast()) {
            return false;
        }
        var messenger = this.getMessenger();
        var facebook = this.getFacebook();
        var meta = facebook.getMeta(group);
        if (!meta) {
            return true;
        }
        if (is_empty.call(this, group)) {
            if (
                sdk.Interface.conforms(content, InviteCommand) ||
                sdk.Interface.conforms(content, ResetCommand)
            ) {
                return false;
            } else {
                return messenger.queryGroupInfo(group, sender);
            }
        } else {
            if (
                facebook.containsMember(sender, group) ||
                facebook.containsAssistant(sender, group) ||
                facebook.isOwner(sender, group)
            ) {
                return false;
            } else {
                var ok1 = false,
                    ok2 = false;
                var owner = facebook.getOwner(group);
                if (owner) {
                    ok1 = messenger.queryGroupInfo(group, owner);
                }
                var assistants = facebook.getAssistants(group);
                if (assistants && assistants.length > 0) {
                    ok2 = messenger.queryGroupInfo(group, assistants);
                }
                return ok1 && ok2;
            }
        }
    };
    CommonProcessor.prototype.processContent = function (content, rMsg) {
        var messenger = this.getMessenger();
        var sender = rMsg.getSender();
        if (is_waiting_group.call(this, content, sender)) {
            var group = content.getGroup();
            rMsg.setValue("waiting", group.toString());
            messenger.suspendReliableMessage(rMsg);
            return null;
        }
        try {
            return MessageProcessor.prototype.processContent.call(
                this,
                content,
                rMsg
            );
        } catch (e) {
            var text = e.toString();
            if (text.indexOf("failed to get meta for ") >= 0) {
                var pos = text.indexOf(": ");
                if (pos > 0) {
                    var waiting = ID.parse(text.substr(pos + 2));
                    if (waiting) {
                        rMsg.setValue("waiting", waiting.toString());
                        messenger.suspendReliableMessage(rMsg);
                    } else {
                        throw new SyntaxError("failed to get ID: " + text);
                    }
                }
            } else {
                throw e;
            }
            return null;
        }
    };
    CommonProcessor.prototype.processInstantMessage = function (iMsg, rMsg) {
        var messenger = this.getMessenger();
        var sMsg;
        var content = iMsg.getContent();
        while (sdk.Interface.conforms(content, ForwardContent)) {
            rMsg = content.getMessage();
            sMsg = messenger.verifyMessage(rMsg);
            if (!sMsg) {
                return null;
            }
            iMsg = messenger.decryptMessage(sMsg);
            if (!iMsg) {
                return null;
            }
            content = iMsg.getContent();
        }
        var responses = MessageProcessor.prototype.processInstantMessage(
            iMsg,
            rMsg
        );
        if (!messenger.saveMessage(iMsg)) {
            return null;
        }
        return responses;
    };
    ns.CommonProcessor = CommonProcessor;
    ns.registers("CommonProcessor");
})(SECHAT, DIMSDK);
