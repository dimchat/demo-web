/**
 *  DIM-Common (v0.1.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      June. 11, 2021
 * @copyright (c) 2021 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof SECHAT !== "object") {
    SECHAT = new DIMSDK.Namespace()
}
(function(ns, sdk) {
    if (typeof ns.cpu !== "object") {
        ns.cpu = new sdk.Namespace()
    }
    if (typeof ns.db !== "object") {
        ns.db = new sdk.Namespace()
    }
    if (typeof ns.network !== "object") {
        ns.network = new sdk.Namespace()
    }
    if (typeof ns.protocol !== "object") {
        ns.protocol = new sdk.Namespace()
    }
    ns.registers("cpu");
    ns.registers("db");
    ns.registers("network");
    ns.registers("protocol")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var CommandProcessor = sdk.cpu.CommandProcessor;
    var BlockCommandProcessor = function() {
        CommandProcessor.call(this)
    };
    sdk.Class(BlockCommandProcessor, CommandProcessor, null);
    BlockCommandProcessor.prototype.execute = function(cmd, rMsg) {
        return null
    };
    ns.cpu.BlockCommandProcessor = BlockCommandProcessor;
    ns.cpu.registers("BlockCommandProcessor")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
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
    var getUsername = function(string) {
        var facebook = ns.Facebook.getInstance();
        return facebook.getName(ID.parse(string))
    };
    var MessageBuilder = {
        getContentText: function(content) {
            if (content instanceof FileContent) {
                if (content instanceof ImageContent) {
                    return "[Image:" + content.getFilename() + "]"
                }
                if (content instanceof AudioContent) {
                    return "[Voice:" + content.getFilename() + "]"
                }
                if (content instanceof VideoContent) {
                    return "[Movie:" + content.getFilename() + "]"
                }
                return "[File:" + content.getFilename() + "]"
            }
            if (content instanceof TextContent) {
                return content.getText()
            }
            if (content instanceof PageContent) {
                return "[File:" + content.getURL() + "]"
            }
            var type = content.getType();
            return "Current version doesn't support this message type: " + type
        },
        getCommandText: function(cmd, commander) {
            if (cmd instanceof GroupCommand) {
                return this.getGroupCommandText(cmd, commander)
            }
            if (cmd instanceof LoginCommand) {
                return this.getLoginCommandText(cmd, commander)
            }
            return "Current version doesn't support this command: " + cmd.getCommand()
        },
        getGroupCommandText: function(cmd, commander) {
            var text = cmd.getValue("text");
            if (text) {
                return text
            }
            if (cmd instanceof InviteCommand) {
                return this.getInviteCommandText(cmd, commander)
            }
            if (cmd instanceof ExpelCommand) {
                return this.getExpelCommandText(cmd, commander)
            }
            if (cmd instanceof QuitCommand) {
                return this.getQuitCommandText(cmd, commander)
            }
            if (cmd instanceof ResetCommand) {
                return this.getResetCommandText(cmd, commander)
            }
            if (cmd instanceof QueryCommand) {
                return this.getQueryCommandText(cmd, commander)
            }
            throw new Error("unsupported group command: " + cmd)
        },
        getInviteCommandText: function(cmd, commander) {
            var addedList = cmd.getValue("added");
            if (!addedList) {
                addedList = []
            }
            var names = [];
            for (var i = 0; i < addedList.length; ++i) {
                names.push(getUsername(addedList[i]))
            }
            var text = getUsername(commander) + " has invited members: " + names.join(", ");
            cmd.setValue("text", text);
            return text
        },
        getExpelCommandText: function(cmd, commander) {
            var removedList = cmd.getValue("removed");
            if (!removedList) {
                removedList = []
            }
            var names = [];
            for (var i = 0; i < removedList.length; ++i) {
                names.push(getUsername(removedList[i]))
            }
            var text = getUsername(commander) + " has removed members: " + names.join(", ");
            cmd.setValue("text", text);
            return text
        },
        getQuitCommandText: function(cmd, commander) {
            var text = getUsername(commander) + " has quit group chat.";
            cmd.setValue("text", text);
            return text
        },
        getResetCommandText: function(cmd, commander) {
            var text = getUsername(commander) + " has updated members";
            var i, names;
            var removedList = cmd.getValue("removed");
            if (removedList && removedList.length > 0) {
                names = [];
                for (i = 0; i < removedList.length; ++i) {
                    names.push(getUsername(removedList[i]))
                }
                text += ", removed: " + names.join(", ")
            }
            var addedList = cmd.getValue("added");
            if (addedList && addedList.length > 0) {
                names = [];
                for (i = 0; i < addedList.length; ++i) {
                    names.push(getUsername(addedList[i]))
                }
                text += ", added: " + names.join(", ")
            }
            cmd.setValue("text", text);
            return text
        },
        getQueryCommandText: function(cmd, commander) {
            var text = getUsername(commander) + " was querying group info, responding...";
            cmd.setValue("text", text);
            return text
        }
    };
    MessageBuilder.getLoginCommandText = function(cmd, commander) {
        var identifier = cmd.getIdentifier();
        var station = cmd.getStation();
        if (station) {
            var host = station["host"];
            var port = station["port"];
            station = "(" + host + ":" + port + ") " + getUsername(station["ID"])
        }
        var text = getUsername(identifier) + " login: " + station;
        cmd.setValue("text", text);
        return text
    };
    ns.cpu.MessageBuilder = MessageBuilder;
    ns.cpu.registers("MessageBuilder")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ReceiptCommand = sdk.protocol.ReceiptCommand;
    var FileContent = sdk.protocol.FileContent;
    var ImageContent = sdk.protocol.ImageContent;
    var AudioContent = sdk.protocol.AudioContent;
    var VideoContent = sdk.protocol.VideoContent;
    var TextContent = sdk.protocol.TextContent;
    var PageContent = sdk.protocol.PageContent;
    var ContentProcessor = sdk.cpu.ContentProcessor;
    var AnyContentProcessor = function() {
        ContentProcessor.call(this)
    };
    sdk.Class(AnyContentProcessor, ContentProcessor, null);
    AnyContentProcessor.prototype.process = function(content, rMsg) {
        var text;
        if (content instanceof FileContent) {
            if (content instanceof ImageContent) {
                text = "Image received"
            } else {
                if (content instanceof AudioContent) {
                    text = "Voice message received"
                } else {
                    if (content instanceof VideoContent) {
                        text = "Movie received"
                    } else {
                        text = "File received"
                    }
                }
            }
        } else {
            if (content instanceof TextContent) {
                text = "Text message received"
            } else {
                if (content instanceof PageContent) {
                    text = "Web page received"
                } else {
                    return ContentProcessor.prototype.process.call(this, content, rMsg)
                }
            }
        }
        var group = content.getGroup();
        if (group) {
            return null
        }
        var res = new ReceiptCommand(text);
        res.setSerialNumber(content.getSerialNumber());
        res.setEnvelope(rMsg.getEnvelope());
        res.setSignature(rMsg.getValue("signature"));
        return res
    };
    ns.cpu.AnyContentProcessor = AnyContentProcessor;
    ns.cpu.registers("AnyContentProcessor")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var CommandProcessor = sdk.cpu.CommandProcessor;
    var MuteCommandProcessor = function() {
        CommandProcessor.call(this)
    };
    sdk.Class(MuteCommandProcessor, CommandProcessor, null);
    MuteCommandProcessor.prototype.execute = function(cmd, rMsg) {
        return null
    };
    ns.cpu.MuteCommandProcessor = MuteCommandProcessor;
    ns.cpu.registers("MuteCommandProcessor")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var CommandProcessor = sdk.cpu.CommandProcessor;
    var ReceiptCommandProcessor = function() {
        CommandProcessor.call(this)
    };
    sdk.Class(ReceiptCommandProcessor, CommandProcessor, null);
    ReceiptCommandProcessor.prototype.execute = function(cmd, rMsg) {
        return null
    };
    ns.cpu.ReceiptCommandProcessor = ReceiptCommandProcessor;
    ns.cpu.registers("ReceiptCommandProcessor")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    ns.db.AddressNameTable = {
        getIdentifier: function(alias) {
            console.assert(false, "implement me!");
            return null
        },
        addRecord: function(identifier, alias) {
            console.assert(false, "implement me!");
            return false
        },
        removeRecord: function(alias) {
            console.assert(false, "implement me!");
            return false
        }
    }
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ID = sdk.protocol.ID;
    var Storage = sdk.dos.LocalStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    ns.db.ContactTable = {
        getContacts: function(user) {
            this.load();
            return this.__contacts[user]
        },
        addContact: function(contact, user) {
            var contacts = this.getContacts(user);
            if (contacts) {
                if (contacts.indexOf(contact) >= 0) {
                    return false
                }
                contacts.push(contact)
            } else {
                contacts = [contact]
            }
            return this.saveContacts(contacts, user)
        },
        removeContact: function(contact, user) {
            var contacts = this.getContacts(user);
            if (!contacts) {
                return false
            }
            var pos = contacts.indexOf(contact);
            if (pos < 0) {
                return false
            }
            contacts.splice(pos, 1);
            return this.saveContacts(contacts, user)
        },
        saveContacts: function(contacts, user) {
            this.load();
            this.__contacts[user] = contacts;
            console.log("saving contacts for user", user);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification("ContactsUpdated", this, {
                    "user": user,
                    "contacts": contacts
                });
                return true
            } else {
                throw new Error("failed to save contacts: " + user + " -> " + contacts)
            }
        },
        load: function() {
            if (!this.__contacts) {
                this.__contacts = convert(Storage.loadJSON("ContactTable"))
            }
        },
        save: function() {
            return Storage.saveJSON(revert(this.__contacts), "ContactTable")
        },
        __contacts: null
    };
    var convert = function(map) {
        var results = {};
        if (map) {
            var users = Object.keys(map);
            var u;
            for (var i = 0; i < users.length; ++i) {
                u = users[i];
                results[ID.parse(u)] = ID.convert(map[u])
            }
        }
        return results
    };
    var revert = function(map) {
        var results = {};
        var users = Object.keys(map);
        var u;
        for (var i = 0; i < users.length; ++i) {
            u = users[i];
            results[u.toString()] = ID.revert(map[u])
        }
        return results
    }
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ID = sdk.protocol.ID;
    var Document = sdk.protocol.Document;
    var Storage = sdk.dos.LocalStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    ns.db.DocumentTable = {
        getDocument: function(identifier, type) {
            this.load();
            return this.__docs[identifier]
        },
        saveDocument: function(doc) {
            if (!doc.isValid()) {
                console.error("document not valid", doc);
                return false
            }
            var identifier = doc.getIdentifier();
            if (!identifier) {
                throw new Error("entity ID error: " + doc)
            }
            this.load();
            this.__docs[identifier] = doc;
            console.log("saving document", identifier);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification(ns.kNotificationDocumentUpdated, this, doc);
                return true
            } else {
                throw new Error("failed to save document: " + identifier + " -> " + doc.getValue("data"))
            }
        },
        load: function() {
            if (!this.__docs) {
                this.__docs = convert(Storage.loadJSON("DocumentTable"))
            }
        },
        save: function() {
            return Storage.saveJSON(revert(this.__docs), "DocumentTable")
        },
        __docs: null
    };
    var convert = function(map) {
        var results = {};
        if (map) {
            var list = Object.keys(map);
            var id, doc;
            for (var i = 0; i < list.length; ++i) {
                id = list[i];
                doc = Document.parse(map[id]);
                if (!doc) {
                    continue
                }
                doc.__status = 1;
                results[ID.parse(id)] = doc
            }
        }
        return results
    };
    var revert = function(map) {
        var results = {};
        if (map) {
            var list = Object.keys(map);
            var id, doc;
            for (var i = 0; i < list.length; ++i) {
                id = list[i];
                doc = map[id];
                if (!doc) {
                    continue
                }
                results[id.toString()] = doc.getMap()
            }
        }
        return results
    }
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ID = sdk.protocol.ID;
    var Storage = sdk.dos.LocalStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    ns.db.GroupTable = {
        getFounder: function(group) {
            return null
        },
        getOwner: function(group) {
            return null
        },
        getMembers: function(group) {
            this.load();
            return this.__members[group]
        },
        addMember: function(member, group) {
            var members = this.getMembers(group);
            if (members) {
                if (members.indexOf(member) >= 0) {
                    return false
                }
                members.push(member)
            } else {
                members = [member]
            }
            return this.saveMembers(members, group)
        },
        removeMember: function(member, group) {
            var members = this.getMembers(group);
            if (!members) {
                return false
            }
            var pos = members.indexOf(member);
            if (pos < 0) {
                return false
            }
            members.splice(pos, 1);
            return this.saveMembers(members, group)
        },
        saveMembers: function(members, group) {
            this.load();
            this.__members[group] = members;
            console.log("saving members for group", group);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification("MembersUpdated", this, {
                    "group": group,
                    "members": members
                });
                return true
            } else {
                throw new Error("failed to save members: " + group + " -> " + members)
            }
        },
        removeGroup: function(group) {
            this.load();
            if (this.__members[group]) {
                delete this.__members[group];
                return this.save()
            } else {
                console.error("group not exists: " + group);
                return false
            }
        },
        load: function() {
            if (!this.__members) {
                this.__members = convert(Storage.loadJSON("GroupTable"))
            }
        },
        save: function() {
            return Storage.saveJSON(revert(this.__members), "GroupTable")
        },
        __members: null
    };
    var convert = function(map) {
        var results = {};
        if (map) {
            var g;
            var groups = Object.keys(map);
            for (var i = 0; i < groups.length; ++i) {
                g = groups[i];
                results[ID.parse(g)] = ID.convert(map[g])
            }
        }
        return results
    };
    var revert = function(map) {
        var results = {};
        var g;
        var groups = Object.keys(map);
        for (var i = 0; i < groups.length; ++i) {
            g = groups[i];
            results[g.toString()] = ID.revert(map[g])
        }
        return results
    }
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ID = sdk.protocol.ID;
    var Storage = sdk.dos.LocalStorage;
    ns.db.LoginTable = {
        getLoginCommand: function(user) {},
        saveLoginCommand: function(cmd) {},
        __docs: null
    }
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ID = sdk.protocol.ID;
    var InstantMessage = sdk.protocol.InstantMessage;
    var Storage = sdk.dos.SessionStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    ns.db.MessageTable = {
        numberOfConversations: function() {
            var keys = Object.keys(this.__messages);
            return keys.length
        },
        conversationAtIndex: function(index) {
            var keys = Object.keys(this.__messages);
            return ID.parse(keys[index])
        },
        removeConversationAtIndex: function(index) {
            var chat = this.conversationAtIndex(index);
            return this.removeConversation(chat)
        },
        removeConversation: function(entity) {},
        numberOfMessages: function(entity) {
            var messages = this.loadMessages(entity);
            if (messages) {
                return messages.length
            } else {
                return 0
            }
        },
        numberOfUnreadMessages: function(entity) {},
        clearUnreadMessages: function(entity) {},
        lastMessage: function(entity) {
            var messages = this.loadMessages(entity);
            if (messages && messages.length > 0) {
                return messages[messages.length - 1]
            } else {
                return null
            }
        },
        lastReceivedMessage: function(user) {},
        messageAtIndex: function(index, entity) {
            var messages = this.loadMessages(entity);
            console.assert(messages !== null, "failed to get messages for conversation: " + entity);
            return messages[index]
        },
        insertMessage: function(iMsg, entity) {
            var messages = this.loadMessages(entity);
            if (messages) {
                if (!insert_message(iMsg, messages)) {
                    return false
                }
            } else {
                messages = [iMsg]
            }
            if (this.saveMessages(messages, entity)) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification(ns.kNotificationMessageUpdated, this, {
                    "ID": entity,
                    "msg": iMsg
                });
                return true
            } else {
                throw new Error("failed to save message: " + iMsg)
            }
        },
        removeMessage: function(iMsg, entity) {
            var messages = this.loadMessages(entity);
            console.assert(messages !== null, "failed to get messages for conversation: " + entity);
            if (!remove_message(iMsg, messages)) {
                return false
            }
            return this.saveMessages(messages, entity)
        },
        withdrawMessage: function(iMsg, entity) {},
        saveReceipt: function(iMsg, entity) {},
        loadMessages: function(conversation) {
            this.load(conversation);
            return this.__messages[conversation]
        },
        saveMessages: function(messages, conversation) {
            if (messages && messages.length > 0) {
                this.__messages[conversation] = messages
            } else {
                delete this.__messages[conversation]
            }
            return this.save(conversation)
        },
        load: function(identifier) {
            if (!this.__messages[identifier]) {
                this.__messages[identifier] = convert(Storage.loadJSON(get_tag(identifier)))
            }
        },
        save: function(identifier) {
            return Storage.saveJSON(revert(this.__messages[identifier]), get_tag(identifier))
        },
        __messages: {}
    };
    var get_tag = function(identifier) {
        return "Messages-" + identifier.getAddress().toString()
    };
    var convert = function(list) {
        var messages = [];
        if (list) {
            for (var i = 0; i < list.length; ++i) {
                messages.push(InstantMessage.parse(list[i]))
            }
        }
        return messages
    };
    var revert = function(list) {
        var messages = [];
        if (list) {
            var msg;
            for (var i = 0; i < list.length; ++i) {
                msg = list[i];
                if (!msg) {
                    continue
                }
                messages.push(msg.getMap())
            }
        }
        return messages
    };
    var insert_message = function(iMsg, messages) {
        var t1, t2;
        t1 = iMsg.getTime();
        if (!t1) {
            t1 = 0
        }
        var sn1, sn2;
        sn1 = iMsg.getContent().getSerialNumber();
        var index;
        var item;
        for (index = messages.length - 1; index >= 0; --index) {
            item = messages[index];
            t2 = item.getTime();
            if (t2 && t2 < t1) {
                break
            }
            sn2 = item.getContent().getSerialNumber();
            if (sn1 === sn2) {
                console.log("duplicate message, no need to insert");
                return false
            }
        }
        sdk.type.Arrays.insert(messages, index + 1, iMsg);
        return true
    };
    var remove_message = function(iMsg, messages) {
        var t1, t2;
        t1 = iMsg.getTime();
        if (!t1) {
            t1 = 0
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
                return false
            }
            sn2 = item.getContent().getSerialNumber();
            if (sn1 === sn2) {
                break
            }
        }
        sdk.type.Arrays.insert(messages, index + 1, iMsg);
        return true
    }
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ID = sdk.protocol.ID;
    var Meta = sdk.protocol.Meta;
    var Storage = sdk.dos.LocalStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    ns.db.MetaTable = {
        getMeta: function(identifier) {
            this.load();
            return this.__metas[identifier]
        },
        saveMeta: function(meta, identifier) {
            if (!meta.matches(identifier)) {
                console.error("meta mot match", identifier, meta);
                return false
            }
            this.load();
            if (this.__metas[identifier]) {
                console.log("meta already exists", identifier);
                return true
            }
            this.__metas[identifier] = meta;
            console.log("saving meta", identifier);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification(ns.kNotificationMetaAccepted, this, {
                    "ID": identifier,
                    "meta": meta
                });
                return true
            } else {
                console.error("failed to save meta", identifier, meta);
                return false
            }
        },
        load: function() {
            if (!this.__metas) {
                this.__metas = convert(Storage.loadJSON("MetaTable"))
            }
        },
        save: function() {
            return Storage.saveJSON(revert(this.__metas), "MetaTable")
        },
        __metas: null
    };
    var convert = function(map) {
        var results = {};
        if (map) {
            var id;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                id = list[i];
                results[ID.parse(id)] = Meta.parse(map[id])
            }
        }
        return results
    };
    var revert = function(map) {
        var results = {};
        if (map) {
            var id, m;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                id = list[i];
                m = map[id];
                if (!m) {
                    continue
                }
                results[id.toString()] = m.getMap()
            }
        }
        return results
    }
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ID = sdk.protocol.ID;
    var Storage = sdk.dos.LocalStorage;
    ns.db.MsgKeyTable = {
        getKey: function(from, to) {},
        addKey: function(from, to, key) {},
        __keys: null
    }
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var PrivateKey = sdk.crypto.PrivateKey;
    var ID = sdk.protocol.ID;
    var Storage = sdk.dos.LocalStorage;
    ns.db.PrivateKeyTable = {
        META: "M",
        VISA: "V",
        savePrivateKey: function(user, key, type, sign, decrypt) {
            this.load();
            this.__keys[get_tag(user, type)] = key;
            if (type === this.META) {
                this.__keys[get_tag(user, null)] = key
            }
            return this.save()
        },
        getPrivateKeysForDecryption: function(user) {
            this.load();
            var keys = [];
            var key0 = this.__keys[get_tag(user, null)];
            var key1 = this.__keys[get_tag(user, this.META)];
            var key2 = this.__keys[get_tag(user, this.VISA)];
            if (key2) {
                keys.push(key2)
            }
            if (key1 && keys.indexOf(key1) < 0) {
                keys.push(key1)
            }
            if (key0 && keys.indexOf(key0) < 0) {
                keys.push(key0)
            }
            return keys
        },
        getPrivateKeyForSignature: function(user) {
            return this.getPrivateKeyForVisaSignature(user)
        },
        getPrivateKeyForVisaSignature: function(user) {
            this.load();
            var key = this.__keys[get_tag(user, this.META)];
            if (!key) {
                key = this.__keys[get_tag(user, null)]
            }
            return key
        },
        load: function() {
            if (!this.__keys) {
                this.__keys = convert(Storage.loadJSON("PrivateTable"))
            }
        },
        save: function() {
            return Storage.saveJSON(revert(this.__keys), "PrivateTable")
        },
        __keys: null
    };
    var get_tag = function(identifier, type) {
        if (!type || type.length === 0) {
            return identifier.toString()
        }
        var terminal = identifier.getTerminal();
        if (terminal && terminal.length > 0) {
            return identifier.toString() + "#" + type
        } else {
            return identifier.toString() + "/" + type
        }
    };
    var convert = function(map) {
        var results = {};
        if (map) {
            var tag;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                tag = list[i];
                results[tag] = PrivateKey.parse(map[tag])
            }
        }
        return results
    };
    var revert = function(map) {
        var results = {};
        if (map) {
            var tag;
            var list = Object.keys(map);
            var key;
            for (var i = 0; i < list.length; ++i) {
                tag = list[i];
                key = map[tag];
                if (!key) {
                    continue
                }
                results[tag] = key.getMap()
            }
        }
        return results
    }
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ID = sdk.protocol.ID;
    var Storage = sdk.dos.LocalStorage;
    ns.db.UserTable = {
        allUsers: function() {
            this.load();
            return this.__users
        },
        addUser: function(user) {
            var list = this.allUsers();
            if (list.indexOf(user) < 0) {
                list.push(user);
                return this.save()
            } else {
                console.error("user already exists", user);
                return false
            }
        },
        removeUser: function(user) {
            var list = this.allUsers();
            var index = list.indexOf(user);
            if (index < 0) {
                console.error("user not exists", user);
                return true
            } else {
                list.splice(index, 1);
                return this.save()
            }
        },
        setCurrentUser: function(user) {
            var list = this.allUsers();
            var index = list.indexOf(user);
            if (index === 0) {
                return true
            } else {
                if (index > 0) {
                    list.splice(index, 1)
                }
            }
            list.unshift(user);
            return this.save()
        },
        getCurrentUser: function() {
            var list = this.allUsers();
            if (list.length > 0) {
                return list[0]
            } else {
                return null
            }
        },
        load: function() {
            if (!this.__users) {
                this.__users = convert(Storage.loadJSON("UserTable"))
            }
        },
        save: function() {
            return Storage.saveJSON(revert(this.__users), "UserTable")
        },
        __users: null
    };
    var convert = function(list) {
        if (list) {
            return ID.convert(list)
        } else {
            return []
        }
    };
    var revert = function(list) {
        if (list) {
            return ID.revert(list)
        } else {
            return []
        }
    }
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var MessageQueue = function() {
        this.__queue = []
    };
    sdk.Class(MessageQueue, null, null);
    MessageQueue.prototype.append = function(rMsg) {
        var wrapper = new ns.network.MessageWrapper(rMsg);
        this.__queue.push(wrapper);
        return true
    };
    MessageQueue.prototype.shift = function() {
        if (this.__queue.length > 0) {
            return this.__queue.shift()
        } else {
            return null
        }
    };
    MessageQueue.prototype.next = function() {
        var item;
        for (var i = 0; i < this.__queue.length; ++i) {
            item = this.__queue[i];
            if (item.isVirgin()) {
                item.mark();
                return item
            }
        }
        return null
    };
    MessageQueue.prototype.eject = function() {
        var item;
        for (var i = 0; i < this.__queue.length; ++i) {
            item = this.__queue[i];
            if (!item.getMessage() || item.isFailed()) {
                this.__queue.splice(i, 1);
                return item
            }
        }
        return null
    };
    ns.network.MessageQueue = MessageQueue;
    ns.network.registers("MessageQueue")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var Runner = sdk.threading.Runner;
    var Gate = sdk.startrek.Gate;
    var BaseSession = function() {
        Runner.call(this);
        if (arguments.length === 2) {
            this.gate = arguments[0];
            this.__messenger = arguments[1]
        } else {
            if (arguments.length === 3) {
                this.gate = ns.network.StarTrek.createGate(arguments[0], arguments[1]);
                this.__messenger = arguments[2]
            } else {
                throw new SyntaxError("session arguments error: " + arguments)
            }
        }
        this.gate.setDelegate(this);
        this.__queue = new ns.network.MessageQueue();
        this.__active = false
    };
    sdk.Class(BaseSession, Runner, [Gate.Delegate]);
    BaseSession.EXPIRES = 600 * 1000;
    var flush = function() {
        var msg;
        var wrapper = this.__queue.shift();
        while (wrapper) {
            msg = wrapper.getMessage();
            if (msg) {
                this.storeMessage(msg)
            }
            wrapper = this.__queue.shift()
        }
    };
    var clean = function() {
        var msg;
        var wrapper = this.__queue.eject();
        while (wrapper) {
            msg = wrapper.getMessage();
            if (msg) {
                this.storeMessage(msg)
            }
            wrapper = this.__queue.eject()
        }
    };
    BaseSession.prototype.storeMessage = function(msg) {};
    BaseSession.prototype.getMessenger = function() {
        return this.__messenger
    };
    BaseSession.prototype.isActive = function() {
        return this.__active && this.gate.isRunning()
    };
    BaseSession.prototype.setActive = function(active) {
        this.__active = active
    };
    BaseSession.prototype.close = function() {
        this.__running = false
    };
    BaseSession.prototype.setup = function() {
        this.__running = true;
        return this.gate.setup()
    };
    BaseSession.prototype.finish = function() {
        this.__running = false;
        if (this.gate.finish()) {
            return true
        } else {
            flush.call(this);
            return false
        }
    };
    BaseSession.prototype.isRunning = function() {
        return this.__running && this.gate.isRunning()
    };
    BaseSession.prototype.process = function() {
        if (this.gate.process()) {
            return true
        }
        clean.call(this);
        if (!this.isActive()) {
            return false
        }
        var rMsg, wrapper = this.__queue.next();
        if (wrapper) {
            rMsg = wrapper.getMessenger()
        } else {
            rMsg = null
        }
        if (!rMsg) {
            return false
        }
        if (!this.getMessenger().sendReliableMessage(rMsg, wrapper, 0)) {
            wrapper.fail()
        }
        return true
    };
    BaseSession.prototype.push = function(rMsg) {
        if (this.isActive()) {
            return this.__queue.append(rMsg)
        } else {
            return false
        }
    };
    BaseSession.prototype.onGateStatusChanged = function(gate, oldStatus, newStatus) {
        if (newStatus.equals(Gate.Status.CONNECTED)) {
            this.getMessenger().onConnected()
        }
    };
    BaseSession.prototype.onGateReceived = function(gate, ship) {
        var payload = ship.getPayload();
        try {
            return this.getMessenger().processData(payload)
        } catch (e) {
            console.log("received data error", e);
            return null
        }
    };
    ns.network.BaseSession = BaseSession;
    ns.network.registers("BaseSession")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ActiveConnection = sdk.stargate.ActiveConnection;
    var WSGate = sdk.stargate.WSGate;
    var StarTrek = function(connection) {
        WSGate.call(this, connection)
    };
    sdk.Class(StarTrek, WSGate, null);
    StarTrek.createGate = function(host, port) {
        var conn = new ActiveConnection(host, port);
        var gate = new StarTrek(conn);
        conn.setDelegate(gate);
        gate.start();
        return gate
    };
    StarTrek.prototype.start = function() {
        this.connection.start();
        WSGate.prototype.start.call(this)
    };
    StarTrek.prototype.finish = function() {
        WSGate.prototype.finish.call(this);
        this.connection.stop()
    };
    ns.network.StarTrek = StarTrek;
    ns.network.registers("StarTrek")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var Ship = sdk.startrek.Ship;
    var Callback = sdk.Callback;
    var MessageWrapper = function(rMsg) {
        this.__msg = rMsg;
        this.__timestamp = 0
    };
    sdk.Class(MessageWrapper, null, [Ship.Delegate, Callback]);
    MessageWrapper.prototype.getMessage = function() {
        return this.__msg
    };
    MessageWrapper.prototype.mark = function() {
        this.__timestamp = 1
    };
    MessageWrapper.prototype.fail = function() {
        this.__timestamp = -1
    };
    MessageWrapper.prototype.isVirgin = function() {
        return this.__timestamp === 0
    };
    MessageWrapper.prototype.isFailed = function() {
        if (this.__timestamp < 0) {
            return true
        } else {
            if (this.__timestamp === 0) {
                return false
            }
        }
        var now = new Date();
        return now.getTime() - this.__timestamp > ns.network.BaseSession.EXPIRES
    };
    MessageWrapper.prototype.onShipSent = function(ship, error) {
        if (error) {
            this.__timestamp = -1
        } else {
            this.__msg = null
        }
    };
    MessageWrapper.prototype.onFinished = function(result, error) {
        if (error) {
            this.__timestamp = -1
        } else {
            this.__timestamp = (new Date()).getTime()
        }
    };
    ns.network.MessageWrapper = MessageWrapper;
    ns.network.registers("MessageWrapper")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var Command = sdk.protocol.Command;
    var ReportCommand = function() {
        if (arguments.length === 0) {
            Command.call(this, ReportCommand.REPORT)
        } else {
            if (typeof arguments[0] === "string") {
                Command.call(this, ReportCommand.REPORT);
                this.setTitle(arguments[0])
            } else {
                Command.call(this, arguments[0])
            }
        }
    };
    sdk.Class(ReportCommand, Command, null);
    ReportCommand.REPORT = "report";
    ReportCommand.ONLINE = "online";
    ReportCommand.OFFLINE = "offline";
    ReportCommand.prototype.setTitle = function(title) {
        this.setValue("title", title)
    };
    ReportCommand.prototype.getTitle = function() {
        return this.getValue("title")
    };
    ns.protocol.ReportCommand = ReportCommand;
    ns.protocol.registers("ReportCommand")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ID = sdk.protocol.ID;
    var Command = sdk.protocol.Command;
    var SearchCommand = function() {
        if (arguments.length === 0) {
            Command.call(this, SearchCommand.ONLINE_USERS)
        } else {
            if (typeof arguments[0] === "string") {
                Command.call(this, SearchCommand.SEARCH);
                this.setKeywords(arguments[0])
            } else {
                Command.call(this, arguments[0])
            }
        }
    };
    sdk.Class(SearchCommand, Command, null);
    SearchCommand.SEARCH = "search";
    SearchCommand.ONLINE_USERS = "users";
    SearchCommand.prototype.setKeywords = function(keywords) {
        this.setValue("keywords", keywords)
    };
    SearchCommand.prototype.getUsers = function() {
        var users = this.getValue("users");
        if (users) {
            return ID.convert(users)
        } else {
            return null
        }
    };
    SearchCommand.prototype.getResults = function() {
        return this.getValue("results")
    };
    ns.protocol.SearchCommand = SearchCommand;
    ns.protocol.registers("SearchCommand")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var NetworkType = sdk.protocol.NetworkType;
    var ID = sdk.protocol.ID;
    var BTCAddress = sdk.mkm.BTCAddress;
    var ETHAddress = sdk.mkm.ETHAddress;
    var Anonymous = function() {};
    sdk.Class(Anonymous, null, null);
    Anonymous.getName = function(identifier) {
        var name;
        if (sdk.Interface.conforms(identifier, ID)) {
            name = identifier.getName();
            if (!name || name.length === 0) {
                name = get_name(identifier.getType())
            }
        } else {
            name = get_name(identifier.getNetwork())
        }
        var number = Anonymous.getNumberString(identifier);
        return name + " (" + number + ")"
    };
    Anonymous.getNumberString = function(address) {
        var str = "" + Anonymous.getNumber(address);
        while (str.length < 10) {
            str = "0" + str
        }
        return str.substr(0, 3) + "-" + str.substr(3, 3) + "-" + str.substr(6)
    };
    Anonymous.getNumber = function(address) {
        if (sdk.Interface.conforms(address, ID)) {
            address = address.getAddress()
        }
        if (address instanceof BTCAddress) {
            return btc_number(address)
        }
        if (address instanceof ETHAddress) {
            return eth_number(address)
        }
        throw new TypeError("address error: " + address.toString())
    };
    var get_name = function(type) {
        if (NetworkType.ROBOT.equals(type)) {
            return "Robot"
        }
        if (NetworkType.STATION.equals(type)) {
            return "Station"
        }
        if (NetworkType.PROVIDER.equals(type)) {
            return "SP"
        }
        if (NetworkType.isUser(type)) {
            return "User"
        }
        if (NetworkType.isGroup(type)) {
            return "Group"
        }
        return "Unknown"
    };
    var btc_number = function(btc) {
        var data = sdk.format.Base58.decode(btc.toString());
        return user_number(data)
    };
    var eth_number = function(eth) {
        var data = sdk.format.Hex.decode(eth.toString().substr(2));
        return user_number(data)
    };
    var user_number = function(cc) {
        var len = cc.length;
        var c1 = cc[len - 1] & 255;
        var c2 = cc[len - 2] & 255;
        var c3 = cc[len - 3] & 255;
        var c4 = cc[len - 4] & 255;
        return (c1 | (c2 << 8) | (c3 << 16)) + c4 * 16777216
    };
    ns.Anonymous = Anonymous;
    ns.registers("Anonymous")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var DecryptKey = sdk.crypto.DecryptKey;
    var ID = sdk.protocol.ID;
    var Entity = sdk.Entity;
    var User = sdk.User;
    var Group = sdk.Group;
    var Facebook = sdk.Facebook;
    var CommonFacebook = function() {
        Facebook.call(this);
        this.__localUsers = null;
        this.privateKeyTable = ns.db.PrivateKeyTable;
        this.metaTable = ns.db.MetaTable;
        this.documentTable = ns.db.DocumentTable;
        this.userTable = ns.db.UserTable;
        this.contactTable = ns.db.ContactTable;
        this.groupTable = ns.db.GroupTable
    };
    sdk.Class(CommonFacebook, Facebook, null);
    CommonFacebook.EXPIRES = 30 * 60 * 1000;
    CommonFacebook.EXPIRES_KEY = "expires";
    CommonFacebook.prototype.getLocalUsers = function() {
        if (!this.__localUsers) {
            var list = this.userTable.allUsers();
            var users = [];
            var item;
            for (var i = 0; i < list.length; ++i) {
                item = this.getUser(list[i]);
                if (item) {
                    users.push(item)
                } else {
                    throw new Error("failed to get local user:" + item)
                }
            }
            this.__localUsers = users
        }
        return this.__localUsers
    };
    CommonFacebook.prototype.getCurrentUser = function() {
        var uid = this.userTable.getCurrentUser();
        if (uid) {
            return this.getUser(uid)
        } else {
            return Facebook.prototype.getCurrentUser.call(this)
        }
    };
    CommonFacebook.prototype.setCurrentUser = function(user) {
        this.__localUsers = null;
        if (user instanceof User) {
            user = user.identifier
        }
        return this.userTable.setCurrentUser(user)
    };
    CommonFacebook.prototype.addUser = function(user) {
        this.__localUsers = null;
        if (user instanceof User) {
            user = user.identifier
        }
        return this.userTable.addUser(user)
    };
    CommonFacebook.prototype.removeUser = function(user) {
        this.__localUsers = null;
        if (user instanceof User) {
            user = user.identifier
        }
        return this.userTable.removeUser(user)
    };
    CommonFacebook.prototype.addContact = function(contact, user) {
        if (contact instanceof Entity) {
            contact = contact.identifier
        }
        if (user instanceof User) {
            user = user.identifier
        }
        return this.contactTable.addContact(contact, user)
    };
    CommonFacebook.prototype.removeContact = function(contact, user) {
        if (contact instanceof Entity) {
            contact = contact.identifier
        }
        if (user instanceof User) {
            user = user.identifier
        }
        return this.contactTable.removeContact(contact, user)
    };
    CommonFacebook.prototype.savePrivateKey = function(key, user) {
        if (user instanceof User) {
            user = user.identifier
        }
        return this.privateKeyTable.savePrivateKey(key, user)
    };
    CommonFacebook.prototype.saveMeta = function(meta, identifier) {
        return this.metaTable.saveMeta(meta, identifier)
    };
    CommonFacebook.prototype.saveDocument = function(doc) {
        if (!this.checkDocument(doc)) {
            return false
        }
        doc.setValue(CommonFacebook.EXPIRES_KEY, null);
        return this.documentTable.saveDocument(doc)
    };
    CommonFacebook.prototype.isExpiredDocument = function(doc, reset) {
        var now = (new Date()).getTime();
        var expires = doc.getValue(CommonFacebook.EXPIRES_KEY);
        if (!expires) {
            doc.setValue(CommonFacebook.EXPIRES_KEY, now + CommonFacebook.EXPIRES);
            return false
        } else {
            if (now < expires) {
                return false
            }
        }
        if (reset) {
            doc.setValue(CommonFacebook.EXPIRES_KEY, now + CommonFacebook.EXPIRES)
        }
        return true
    };
    CommonFacebook.prototype.addMember = function(member, group) {
        if (member instanceof User) {
            member = member.identifier
        }
        if (group instanceof Group) {
            group = group.identifier
        }
        return this.groupTable.addMember(member, group)
    };
    CommonFacebook.prototype.removeMember = function(member, group) {
        if (member instanceof User) {
            member = member.identifier
        }
        if (group instanceof Group) {
            group = group.identifier
        }
        return this.groupTable.removeMember(member, group)
    };
    CommonFacebook.prototype.saveMembers = function(members, group) {
        if (group instanceof Group) {
            group = group.identifier
        }
        return this.groupTable.saveMembers(members, group)
    };
    CommonFacebook.prototype.removeGroup = function(group) {
        if (group instanceof Group) {
            group = group.identifier
        }
        return this.groupTable.removeGroup(group)
    };
    CommonFacebook.prototype.containsMember = function(member, group) {
        if (member instanceof User) {
            member = member.identifier
        }
        if (group instanceof Group) {
            group = group.identifier
        }
        var members = this.getMembers(group);
        if (members && members.indexOf(member) >= 0) {
            return true
        }
        var owner = this.getOwner(group);
        return owner && owner.equals(member)
    };
    CommonFacebook.prototype.containsAssistant = function(bot, group) {
        if (bot instanceof User) {
            bot = bot.identifier
        }
        if (group instanceof Group) {
            group = group.identifier
        }
        var bots = this.getAssistants(group);
        return bots && bots.indexOf(bot) >= 0
    };
    CommonFacebook.prototype.getName = function(identifier) {
        var doc = this.getDocument(identifier, "*");
        if (doc) {
            var name = doc.getName();
            if (name && name.length > 0) {
                return name
            }
        }
        return ns.Anonymous.getName(identifier)
    };
    CommonFacebook.prototype.createUser = function(identifier) {
        if (is_waiting.call(this, identifier)) {
            return null
        } else {
            return Facebook.prototype.createUser.call(this, identifier)
        }
    };
    var is_waiting = function(id) {
        return !id.isBroadcast() && !this.getMeta(id)
    };
    CommonFacebook.prototype.createGroup = function(identifier) {
        if (is_waiting.call(this, identifier)) {
            return null
        } else {
            return Facebook.prototype.createGroup.call(this, identifier)
        }
    };
    CommonFacebook.prototype.getMeta = function(identifier) {
        if (identifier.isBroadcast()) {
            return null
        } else {
            return this.metaTable.getMeta(identifier)
        }
    };
    CommonFacebook.prototype.getDocument = function(identifier, type) {
        return this.documentTable.getDocument(identifier, type)
    };
    CommonFacebook.prototype.getContacts = function(user) {
        return this.contactTable.getContacts(user)
    };
    CommonFacebook.prototype.getPrivateKeysForDecryption = function(user) {
        var keys = this.privateKeyTable.getPrivateKeysForDecryption(user);
        if (!keys || keys.length === 0) {
            var key = this.getPrivateKeyForSignature(user);
            if (sdk.Interface.conforms(key, DecryptKey)) {
                keys = [key]
            }
        }
        return keys
    };
    CommonFacebook.prototype.getPrivateKeyForSignature = function(user) {
        return this.privateKeyTable.getPrivateKeyForSignature(user)
    };
    CommonFacebook.prototype.getPrivateKeyForVisaSignature = function(user) {
        return this.privateKeyTable.getPrivateKeyForVisaSignature(user)
    };
    CommonFacebook.prototype.getFounder = function(group) {
        var founder = this.groupTable.getFounder(group);
        if (founder) {
            return founder
        } else {
            return Facebook.prototype.getFounder.call(this, group)
        }
    };
    CommonFacebook.prototype.getOwner = function(group) {
        var owner = this.groupTable.getOwner(group);
        if (owner) {
            return owner
        } else {
            return Facebook.prototype.getOwner.call(this, group)
        }
    };
    CommonFacebook.prototype.getMembers = function(group) {
        var members = this.groupTable.getMembers(group);
        if (members && members.length > 0) {
            return members
        } else {
            return Facebook.prototype.getMembers.call(this, group)
        }
    };
    CommonFacebook.prototype.getAssistants = function(group) {
        var bots = this.groupTable.getAssistants(group);
        if (bots && bots.length > 0) {
            return bots
        }
        var identifier = ID.parse("assistant");
        if (identifier) {
            return [identifier]
        } else {
            return null
        }
    };
    ns.CommonFacebook = CommonFacebook;
    ns.registers("CommonFacebook")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var obj = sdk.type.Object;
    var SymmetricKey = sdk.crypto.SymmetricKey;
    var CipherKeyDelegate = sdk.CipherKeyDelegate;
    var KeyCache = function() {
        obj.call(this);
        this.keyMap = {};
        this.isDirty = false
    };
    sdk.Class(KeyCache, obj, [CipherKeyDelegate]);
    KeyCache.prototype.reload = function() {
        var map = this.loadKeys();
        if (!map) {
            return false
        }
        return this.updateKeys(map)
    };
    KeyCache.prototype.flush = function() {
        if (this.isDirty) {
            if (this.saveKeys(this.keyMap)) {
                this.isDirty = false
            }
        }
    };
    KeyCache.prototype.saveKeys = function(map) {
        console.assert(false, "implement me!");
        return false
    };
    KeyCache.prototype.loadKeys = function() {
        console.assert(false, "implement me!");
        return null
    };
    KeyCache.prototype.updateKeys = function(map) {
        if (!map) {
            return false
        }
        var changed = false;
        var sender, receiver;
        var oldKey, newKey;
        var table;
        for (sender in map) {
            if (!map.hasOwnProperty(sender)) {
                continue
            }
            table = map[sender];
            for (receiver in table) {
                if (!table.hasOwnProperty(receiver)) {
                    continue
                }
                newKey = table[receiver];
                oldKey = get_key.call(this, sender, receiver);
                if (oldKey !== newKey) {
                    changed = true
                }
                set_key.call(this, sender, receiver, newKey)
            }
        }
        return changed
    };
    var get_key = function(sender, receiver) {
        var table = this.keyMap[sender];
        if (table) {
            return table[receiver]
        } else {
            return null
        }
    };
    var set_key = function(sender, receiver, key) {
        var table = this.keyMap[sender];
        if (table) {
            var old = table[receiver];
            if (old && old.equals(key)) {
                return
            }
        } else {
            table = {};
            this.keyMap[sender] = table
        }
        table[receiver] = key
    };
    KeyCache.prototype.getCipherKey = function(sender, receiver, generate) {
        if (receiver.isBroadcast()) {
            return sdk.crypto.PlainKey.getInstance()
        }
        var key = get_key.call(this, sender, receiver);
        if (!key && generate) {
            key = SymmetricKey.generate(SymmetricKey.AES);
            this.cacheCipherKey(sender, receiver, key)
        }
        return key
    };
    KeyCache.prototype.cacheCipherKey = function(sender, receiver, key) {
        if (receiver.isBroadcast()) {} else {
            set_key.call(this, sender, receiver, key);
            this.isDirty = true
        }
    };
    ns.KeyCache = KeyCache;
    ns.registers("KeyCache")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var KeyCache = ns.KeyCache;
    var KeyStore = function() {
        KeyCache.call(this);
        this.user = null
    };
    sdk.Class(KeyStore, KeyCache, null);
    KeyStore.prototype.getUser = function() {
        return this.user
    };
    KeyStore.prototype.setUser = function(user) {
        if (this.user) {
            this.flush();
            if (this.user.equals(user)) {
                return
            }
        }
        if (!user) {
            this.user = null;
            return
        }
        this.user = user;
        var keys = this.loadKeys();
        if (keys) {
            this.updateKeys(keys)
        }
    };
    KeyStore.prototype.saveKeys = function(map) {
        return false
    };
    KeyStore.prototype.loadKeys = function() {
        return null
    };
    ns.KeyStore = KeyStore;
    ns.registers("KeyStore")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var Messenger = sdk.Messenger;
    var CommonMessenger = function() {
        Messenger.call(this)
    };
    sdk.Class(CommonMessenger, Messenger, null);
    CommonMessenger.prototype.getEntityDelegate = function() {
        if (!this.__barrack) {
            this.__barrack = new ns.CommonFacebook()
        }
        return this.__barrack
    };
    CommonMessenger.prototype.getCipherKeyDelegate = function() {
        if (!this.__keycache) {
            this.__keycache = new ns.KeyStore()
        }
        return this.__keycache
    };
    CommonMessenger.prototype.getPacker = function() {
        if (!this.__packer) {
            this.__packer = new ns.CommonPacker(this)
        }
        return this.__packer
    };
    CommonMessenger.prototype.getProcessor = function() {
        if (!this.__processor) {
            this.__processor = new ns.CommonProcessor(this)
        }
        return this.__processor
    };
    CommonMessenger.prototype.getTransmitter = function() {
        if (!this.__transmitter) {
            this.__transmitter = new ns.CommonTransmitter(this)
        }
        return this.__transmitter
    };
    CommonMessenger.prototype.serializeKey = function(password, iMsg) {
        var reused = password.getValue("reused");
        if (reused) {
            var receiver = iMsg.getReceiver();
            if (receiver.isGroup()) {
                return null
            }
            password.setValue("reused", null)
        }
        var data = Messenger.prototype.serializeKey.call(this, password, iMsg);
        if (reused) {
            password.setValue("reused", reused)
        }
        return data
    };
    CommonMessenger.prototype.deserializeContent = function(data, password, sMsg) {
        try {
            return Messenger.prototype.deserializeContent.call(this, data, password, sMsg)
        } catch (e) {
            console.error("deserialize content error", e);
            return null
        }
    };
    CommonMessenger.prototype.queryMeta = function(identifier) {
        console.assert(false, "implement me!");
        return false
    };
    CommonMessenger.prototype.queryDocument = function(identifier, type) {
        console.assert(false, "implement me!");
        return false
    };
    CommonMessenger.prototype.queryGroupInfo = function(group, members) {
        console.assert(false, "implement me!");
        return false
    };
    CommonMessenger.prototype.onConnected = function() {
        console.log("connected")
    };
    ns.CommonMessenger = CommonMessenger;
    ns.registers("CommonMessenger")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
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
    var registerCommandFactories = function() {
        var search = new CommandFactory(SearchCommand);
        Command.register(SearchCommand.SEARCH, search);
        Command.register(SearchCommand.ONLINE_USERS, search);
        var report = new CommandFactory(ReportCommand);
        Command.register(ReportCommand.REPORT, report);
        Command.register(ReportCommand.ONLINE, report);
        Command.register(ReportCommand.OFFLINE, report)
    };
    var registerCommandProcessors = function() {
        CommandProcessor.register(Command.RECEIPT, new ReceiptCommandProcessor());
        CommandProcessor.register(MuteCommand.MUTE, new MuteCommandProcessor());
        CommandProcessor.register(BlockCommand.BLOCK, new BlockCommandProcessor())
    };
    var registerContentProcessors = function() {
        ContentProcessor.register(0, new AnyContentProcessor())
    };
    registerCommandFactories();
    registerCommandProcessors();
    registerContentProcessors()
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var DocumentCommand = sdk.protocol.DocumentCommand;
    var MessagePacker = sdk.MessagePacker;
    var CommonPacker = function(messenger) {
        MessagePacker.call(this, messenger)
    };
    sdk.Class(CommonPacker, MessagePacker, null);
    var attach = function(rMsg) {
        var messenger = this.getMessenger();
        if (!rMsg.getDelegate()) {
            rMsg.setDelegate(messenger)
        }
        if (rMsg.getEncryptedKey()) {
            return
        }
        var keys = rMsg.getEncryptedKeys();
        if (!keys) {
            keys = {}
        } else {
            if (keys["digest"]) {
                return
            }
        }
        var key;
        var sender = rMsg.getSender();
        var group = rMsg.getGroup();
        if (group) {
            key = messenger.getCipherKey(sender, group, false)
        } else {
            var receiver = rMsg.getReceiver();
            key = messenger.getCipherKey(sender, receiver, false)
        }
        if (!key) {
            return
        }
        var data = key.getData();
        if (!data || data.length === 0) {
            if (key.getAlgorithm() === "PLAIN") {
                return
            }
            throw new ReferenceError("key data error: " + key.getMap())
        }
        var part = data.subarray(data.length - 6);
        var digest = sdk.digest.SHA256.digest(part);
        var base64 = sdk.format.Base64.encode(digest);
        keys["digest"] = base64.substr(base64.length - 8);
        rMsg.setValue("keys", keys)
    };
    CommonPacker.prototype.serializeMessage = function(rMsg) {
        attach.call(this, rMsg);
        return MessagePacker.prototype.serializeMessage.call(this, rMsg)
    };
    CommonPacker.prototype.deserializeMessage = function(data) {
        if (!data || data.length < 2) {
            console.error("receive data error", data);
            return null
        }
        return MessagePacker.prototype.deserializeMessage.call(this, data)
    };
    CommonPacker.prototype.encryptMessage = function(iMsg) {
        var sMsg = MessagePacker.prototype.encryptMessage.call(this, iMsg);
        var receiver = iMsg.getReceiver();
        if (receiver.isGroup()) {
            var sender = iMsg.getSender();
            var key = this.getMessenger().getCipherKey(sender, receiver, false);
            key.setValue("reused", true)
        }
        return sMsg
    };
    CommonPacker.prototype.decryptMessage = function(sMsg) {
        try {
            return MessagePacker.prototype.decryptMessage.call(this, sMsg)
        } catch (e) {
            if (e.toString().indexOf("failed to decrypt key in msg: ") === 0) {
                var user = this.getFacebook().getCurrentUser();
                var visa = user.getVisa();
                if (!visa || !visa.isValid()) {
                    throw new ReferenceError("user visa error: " + user.identifier)
                }
                var cmd = DocumentCommand.response(user.identifier, null, visa);
                this.getMessenger().sendContent(user.identifier, sMsg.getSender(), cmd, null, 0)
            } else {
                throw e
            }
            return null
        }
    };
    ns.CommonPacker = CommonPacker;
    ns.registers("CommonPacker")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var ID = sdk.protocol.ID;
    var InviteCommand = sdk.protocol.group.InviteCommand;
    var ResetCommand = sdk.protocol.group.ResetCommand;
    var MessageProcessor = sdk.MessageProcessor;
    var CommonProcessor = function(messenger) {
        MessageProcessor.call(this, messenger)
    };
    sdk.Class(CommonProcessor, MessageProcessor, null);
    CommonProcessor.prototype.getFacebook = function() {
        return this.getMessenger().getFacebook()
    };
    var is_empty = function(group) {
        var facebook = this.getFacebook();
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            return true
        } else {
            return !facebook.getOwner()
        }
    };
    var is_waiting_group = function(content, sender) {
        var group = content.getGroup();
        if (!group || group.isBroadcast()) {
            return false
        }
        var messenger = this.getMessenger();
        var facebook = this.getFacebook();
        var meta = facebook.getMeta(group);
        if (!meta) {
            return true
        }
        if (is_empty.call(this, group)) {
            if (content instanceof InviteCommand || content instanceof ResetCommand) {
                return false
            } else {
                return messenger.queryGroupInfo(group, sender)
            }
        } else {
            if (facebook.containsMember(sender, group) || facebook.containsAssistant(sender, group) || facebook.isOwner(sender, group)) {
                return false
            } else {
                var ok1 = false,
                    ok2 = false;
                var owner = facebook.getOwner(group);
                if (owner) {
                    ok1 = messenger.queryGroupInfo(group, owner)
                }
                var assistants = facebook.getAssistants(group);
                if (assistants && assistants.length > 0) {
                    ok2 = messenger.queryGroupInfo(group, assistants)
                }
                return ok1 && ok2
            }
        }
    };
    CommonProcessor.prototype.processContent = function(content, rMsg) {
        var sender = rMsg.getSender();
        if (is_waiting_group.call(this, content, sender)) {
            var group = content.getGroup();
            rMsg.setValue("waiting", group.toString());
            this.getMessenger().suspendMessage(rMsg);
            return null
        }
        try {
            return MessageProcessor.prototype.processContent.call(this, content, rMsg)
        } catch (e) {
            var text = e.toString();
            if (text.indexOf("failed to get meta for ") >= 0) {
                var pos = text.indexOf(": ");
                if (pos > 0) {
                    var waiting = ID.parse(text.substr(pos + 2));
                    if (waiting) {
                        rMsg.setValue("waiting", waiting.toString());
                        this.getMessenger().suspendReliableMessage(rMsg)
                    } else {
                        throw new SyntaxError("failed to get ID: " + text)
                    }
                }
            }
            return null
        }
    };
    ns.CommonProcessor = CommonProcessor;
    ns.registers("CommonProcessor")
})(SECHAT, DIMSDK);
(function(ns, sdk) {
    var MessageTransmitter = sdk.MessageTransmitter;
    var CommonTransmitter = function(messenger) {
        MessageTransmitter.call(this, messenger)
    };
    sdk.Class(CommonTransmitter, MessageTransmitter, null);
    CommonTransmitter.prototype.sendInstantMessage = function(iMsg, callback, priority) {
        var messenger = this.getMessenger();
        setTimeout(function() {
            var sMsg = messenger.encryptMessage(iMsg);
            if (sMsg == null) {
                return false
            }
            var rMsg = messenger.signMessage(sMsg);
            if (rMsg == null) {
                throw new ReferenceError("failed to sign message: " + sMsg.getMap())
            }
            var OK = messenger.sendReliableMessage(rMsg, callback, priority);
            return messenger.saveMessage(iMsg) && OK
        }, 128);
        return true
    };
    ns.CommonTransmitter = CommonTransmitter;
    ns.registers("CommonTransmitter")
})(SECHAT, DIMSDK);
