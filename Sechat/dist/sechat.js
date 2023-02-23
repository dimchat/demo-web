/**
 *  DIM-Client-Example (v0.2.2)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Feb. 23, 2023
 * @copyright (c) 2023 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof SECHAT !== "object") {
    SECHAT = DIMP;
}
(function (ns) {
    var NotificationNames = {
        StationConnecting: "StationConnecting",
        StationConnected: "StationConnected",
        StationError: "StationError",
        SessionStateChanged: "SessionStateChanged",
        ServiceProviderUpdated: "ServiceProviderUpdated",
        MetaAccepted: "MetaAccepted",
        DocumentUpdated: "DocumentUpdated",
        ContactsUpdated: "ContactsUpdated",
        MembersUpdated: "MembersUpdated",
        GroupRemoved: "GroupRemoved",
        MessageUpdated: "MessageUpdated",
        SearchUpdated: "SearchUpdated"
    };
    if (typeof ns.model !== "object") {
        ns.model = {};
    }
    ns.NotificationNames = NotificationNames;
})(SECHAT);
(function (ns, sdk) {
    var Interface = sdk.type.Interface;
    var Command = sdk.protocol.Command;
    var ReceiptCommand = sdk.protocol.ReceiptCommand;
    var MetaCommand = sdk.protocol.MetaCommand;
    ns.Compatible = {
        fixMetaAttachment: function (rMsg) {
            var meta = rMsg.getValue("meta");
            if (meta) {
                this.fixMetaVersion(meta);
            }
        },
        fixMetaVersion: function (meta) {
            var version = meta["version"];
            if (!version) {
                meta["version"] = meta["type"];
            } else {
                if (!meta["type"]) {
                    meta["type"] = version;
                }
            }
        },
        fixCommand: function (command) {
            command = this.fixCmd(command);
            if (Interface.conforms(command, ReceiptCommand)) {
                this.fixReceiptCommand(command);
            } else {
                if (Interface.conforms(command, MetaCommand)) {
                    var meta = command.getValue("meta");
                    if (meta) {
                        this.fixMetaVersion(meta);
                    }
                }
            }
            return command;
        },
        fixCmd: function (command) {
            var cmd = command.getValue("cmd");
            if (!cmd) {
                cmd = command.getValue("command");
                command.setValue("cmd", cmd);
                command = Command.parse(command.toMap());
            } else {
                if (!command.getValue("command")) {
                    command.setValue("command", cmd);
                }
            }
            return command;
        },
        fixReceiptCommand: function (command) {}
    };
})(SECHAT, DIMP);
(function (ns, sdk) {
    var MetaCommand = sdk.protocol.MetaCommand;
    var DocumentCommand = sdk.protocol.DocumentCommand;
    var GroupCommand = sdk.protocol.GroupCommand;
    var get_messenger = function () {
        return ns.GlobalVariable.getInstance().messenger;
    };
    var get_facebook = function () {
        return ns.GlobalVariable.getInstance().facebook;
    };
    var send_command = function (cmd) {
        var messenger = get_messenger();
        var session = messenger.getSession();
        if (!session.isActive()) {
            return false;
        }
        var station = session.getStation();
        var sid = station.getIdentifier();
        return messenger.sendContent(null, sid, cmd, 0);
    };
    var send_group_command = function (cmd, receiver) {
        var messenger = get_messenger();
        var session = messenger.getSession();
        if (!session.isActive()) {
            return false;
        }
        if (receiver instanceof Array) {
            var facebook = messenger.getFacebook();
            var user = facebook.getCurrentUser();
            var sender = user.getIdentifier();
            var cnt = 0;
            for (var i = 0; i < receiver.length; ++i) {
                if (messenger.sendContent(sender, receiver[i], cmd, 0)) {
                    cnt += 1;
                }
            }
            return cnt > 0;
        } else {
            return messenger.sendContent(null, receiver, cmd, 0);
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
            var cmd = GroupCommand.query(group);
            send_group_command(cmd, bots);
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
        var group = this.__group;
        var facebook = get_facebook();
        var bots = facebook.getAssistants(group);
        var cmd = GroupCommand.query(group);
        return send_group_command(cmd, bots);
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
})(SECHAT, DIMP);
(function (ns, sdk) {
    var Interface = sdk.type.Interface;
    var Class = sdk.type.Class;
    var Visa = sdk.protocol.Visa;
    var Entity = sdk.mkm.Entity;
    var CommonFacebook = sdk.CommonFacebook;
    var Anonymous = sdk.Anonymous;
    var SharedFacebook = function (db) {
        CommonFacebook.call(this, db);
    };
    Class(SharedFacebook, CommonFacebook, null, {
        getName: function (identifier) {
            var doc = this.getDocument(identifier, "*");
            if (doc) {
                var name = doc.getName();
                if (name && name.length > 0) {
                    return name;
                }
            }
            return Anonymous.getName(identifier);
        },
        getAvatar: function (user) {
            var url = null;
            var doc = this.getDocument(user, "*");
            if (doc) {
                if (Interface.conforms(doc, Visa)) {
                    url = doc.getAvatar();
                } else {
                    url = doc.getProperty("avatar");
                }
            }
            return url;
        },
        saveContacts: function (contacts, user) {
            var db = this.getDatabase();
            return db.saveContacts(contacts, user);
        },
        savePrivateKey: function (key, type, user) {
            var db = this.getDatabase();
            return db.savePrivateKey(key, type, user);
        },
        setCurrentUser: function (user) {
            var db = this.getDatabase();
            db.setCurrentUser(user.getIdentifier());
            CommonFacebook.prototype.setCurrentUser.call(this, user);
        },
        addUser: function (user) {
            if (user instanceof Entity) {
                user = user.getIdentifier();
            }
            var db = this.getDatabase();
            var allUsers = db.getLocalUsers();
            if (!allUsers) {
                allUsers = [user];
            } else {
                if (find_user(allUsers, user) >= 0) {
                    return false;
                } else {
                    allUsers.push(user);
                }
            }
            return db.saveLocalUsers(allUsers);
        },
        removeUser: function (user) {
            if (user instanceof Entity) {
                user = user.getIdentifier();
            }
            var db = this.getDatabase();
            var allUsers = db.getLocalUsers();
            var pos = !allUsers ? -1 : find_user(allUsers, user);
            if (pos < 0) {
                return false;
            }
            allUsers.splice(pos, 1);
            return db.saveLocalUsers(allUsers);
        },
        addContact: function (contact, user) {
            var allContacts = this.getContacts(user);
            if (!allContacts) {
                allContacts = [contact];
            } else {
                if (find_user(allContacts, contact) >= 0) {
                    return false;
                } else {
                    allContacts.push(contact);
                }
            }
            return this.saveContacts(allContacts, user);
        },
        removeContact: function (contact, user) {
            var allContacts = this.getContacts(user);
            var pos = !allContacts ? -1 : find_user(allContacts, contact);
            if (pos < 0) {
                return false;
            }
            allContacts.splice(pos, 1);
            return this.saveContacts(allContacts, user);
        },
        addMember: function (member, group) {
            var allMembers = this.getMembers(group);
            if (!allMembers) {
                allMembers = [member];
            } else {
                if (find_user(allMembers, member) >= 0) {
                    return false;
                } else {
                    allMembers.push(member);
                }
            }
            return this.saveMembers(allMembers, group);
        },
        removeMember: function (member, group) {
            var allMembers = this.getMembers(group);
            var pos = !allMembers ? -1 : find_user(allMembers, member);
            if (pos < 0) {
                return false;
            }
            allMembers.splice(pos, 1);
            return this.saveMembers(allMembers, group);
        },
        containsMember: function (member, group) {
            var allMembers = this.getMembers(group);
            if (allMembers && find_user(allMembers, member) >= 0) {
                return true;
            }
            var owner = this.getOwner(group);
            return owner && owner.equals(member);
        },
        removeGroup: function (group) {
            console.warn("remove group", group);
            return false;
        }
    });
    var find_user = function (array, item) {
        for (var i = 0; i < array.length; ++i) {
            if (array[i].equals(item)) {
                return i;
            }
        }
        return -1;
    };
    ns.SharedFacebook = SharedFacebook;
})(SECHAT, DIMP);
(function (ns, sdk) {
    var Interface = sdk.type.Interface;
    var Class = sdk.type.Class;
    var ID = sdk.protocol.ID;
    var Command = sdk.protocol.Command;
    var DocumentCommand = sdk.protocol.DocumentCommand;
    var SearchCommand = sdk.protocol.SearchCommand;
    var ClientMessenger = sdk.ClientMessenger;
    var Compatible = ns.Compatible;
    var SharedMessenger = function (session, facebook, db) {
        ClientMessenger.call(this, session, facebook, db);
    };
    Class(SharedMessenger, ClientMessenger, null, {
        serializeContent: function (content, password, iMsg) {
            if (Interface.conforms(content, Command)) {
                content = Compatible.fixCommand(content);
            }
            return ClientMessenger.prototype.serializeContent.call(
                this,
                content,
                password,
                iMsg
            );
        },
        deserializeContent: function (data, password, sMsg) {
            var content = ClientMessenger.prototype.deserializeContent.call(
                this,
                data,
                password,
                sMsg
            );
            if (content && Interface.conforms(content, Command)) {
                content = Compatible.fixCommand(content);
            }
            return content;
        },
        getCurrentUser: function () {
            return this.getFacebook().getCurrentUser();
        },
        getCurrentStation: function () {
            return this.getSession().getStation();
        },
        sendCommand: function (command, priority) {
            var sid = this.getCurrentStation().getIdentifier();
            return send_content.call(this, sid, command, priority);
        },
        broadcastContent: function (content) {
            var group = content.getGroup();
            if (!group || !group.isBroadcast()) {
                group = ID.EVERYONE;
                content.setGroup(group);
            }
            return send_content.call(this, group, content, 1);
        },
        broadcastVisa: function (visa) {
            var user = this.getCurrentUser();
            if (!user) {
                throw new ReferenceError("login first");
            }
            var identifier = visa.getIdentifier();
            if (!user.getIdentifier().equals(identifier)) {
                throw new ReferenceError("visa document error: " + visa);
            }
            var count = 0;
            var contacts = user.getContacts();
            if (contacts && contacts.length > 0) {
                var cmd = DocumentCommand.response(identifier, null, visa);
                for (var i = 0; i < contacts.length; ++i) {
                    if (send_content.call(this, contacts[i], cmd, 1)) {
                        count += 1;
                    }
                }
            }
            return count > 0;
        },
        postDocument: function (doc, meta) {
            var identifier = doc.getIdentifier();
            var cmd = DocumentCommand.response(identifier, meta, doc);
            return this.sendCommand(cmd, 1);
        },
        postContacts: function (contacts) {},
        queryContacts: function () {},
        queryGroupInfo: function (group, bots) {}
    });
    SharedMessenger.prototype.sendInstantMessage = function (iMsg, priority) {
        var rMsg = ClientMessenger.prototype.sendInstantMessage.call(
            this,
            iMsg,
            priority
        );
        if (rMsg) {
            console.info("message sent", iMsg, priority);
            var clerk = ns.Amanuensis.getInstance();
            clerk.saveMessage(iMsg);
        }
        return rMsg;
    };
    SharedMessenger.prototype.processInstantMessage = function (iMsg, rMsg) {
        var clerk = ns.Amanuensis.getInstance();
        clerk.saveMessage(iMsg);
        console.info("message received", iMsg, rMsg);
        return ClientMessenger.prototype.processInstantMessage.call(
            this,
            iMsg,
            rMsg
        );
    };
    var send_content = function (receiver, content, priority) {
        var session = this.getSession();
        if (!session.isActive()) {
            return false;
        }
        var result = this.sendContent(null, receiver, content, priority);
        return result[1] !== null;
    };
    SharedMessenger.prototype.search = function (keywords) {
        var cmd = SearchCommand.search(keywords);
        return send_content.call(this, SE, cmd, 0);
    };
    var SE = ID.parse("archivist@anywhere");
    ns.SharedMessenger = SharedMessenger;
})(SECHAT, DIMP);
(function (ns, sdk) {
    var Interface = sdk.type.Interface;
    var Class = sdk.type.Class;
    var FileContent = sdk.protocol.FileContent;
    var ClientMessagePacker = sdk.ClientMessagePacker;
    var Compatible = ns.Compatible;
    var SharedPacker = function (facebook, messenger) {
        ClientMessagePacker.call(this, facebook, messenger);
    };
    Class(SharedPacker, ClientMessagePacker, null, {
        serializeMessage: function (rMsg) {
            Compatible.fixMetaAttachment(rMsg);
            return ClientMessagePacker.prototype.serializeMessage.call(this, rMsg);
        },
        deserializeMessage: function (data) {
            if (!data || data.length < 2) {
                return null;
            }
            var rMsg = ClientMessagePacker.prototype.deserializeMessage.call(
                this,
                data
            );
            if (rMsg) {
                Compatible.fixMetaAttachment(rMsg);
            }
            return rMsg;
        },
        encryptMessage: function (iMsg) {
            var content = iMsg.getContent();
            if (Interface.conforms(content, FileContent)) {
            }
            return ClientMessagePacker.prototype.encryptMessage.call(this, iMsg);
        },
        decryptMessage: function (sMsg) {
            var iMsg = ClientMessagePacker.prototype.decryptMessage.call(this, sMsg);
            if (iMsg) {
                var content = iMsg.getContent();
                if (Interface.conforms(content, FileContent)) {
                }
            }
            return iMsg;
        }
    });
    ns.SharedPacker = SharedPacker;
})(SECHAT, DIMP);
(function (ns, sdk) {
    var Class = sdk.type.Class;
    var ClientMessageProcessor = sdk.ClientMessageProcessor;
    var SharedProcessor = function (facebook, messenger) {
        ClientMessageProcessor.call(this, facebook, messenger);
    };
    Class(SharedProcessor, ClientMessageProcessor, null, {
        createCreator: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.cpu.ClientProcessorCreator(facebook, messenger);
        }
    });
    ns.SharedProcessor = SharedProcessor;
})(SECHAT, DIMP);
(function (ns, sdk) {
    var Class = sdk.type.Class;
    var Terminal = sdk.network.Terminal;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    var NotificationNames = ns.NotificationNames;
    var Client = function (facebook, db) {
        Terminal.call(this, facebook, db);
    };
    Class(Client, Terminal, null, {
        createPacker: function (facebook, messenger) {
            return new ns.SharedPacker(facebook, messenger);
        },
        createProcessor: function (facebook, messenger) {
            return new ns.SharedProcessor(facebook, messenger);
        },
        createMessenger: function (session, facebook) {
            var shared = ns.GlobalVariable.getInstance();
            var messenger = shared.messenger;
            if (messenger === null) {
                messenger = new ns.SharedMessenger(session, facebook, shared.database);
                shared.messenger = messenger;
            }
            return messenger;
        },
        exitState: function (previous, machine) {
            Terminal.prototype.exitState.call(this, previous, machine);
            var current = machine.getCurrentState();
            console.info("session state changed", previous, current);
            if (!current) {
                return;
            }
            var nc = NotificationCenter.getInstance();
            nc.postNotification(NotificationNames.SessionStateChanged, this, {
                state: current
            });
        },
        launch: function (options) {
            var host = options["host"];
            var port = options["port"];
            this.connect(host, port);
        }
    });
    ns.Client = Client;
})(SECHAT, DIMP);
(function (ns, sdk) {
    var Station = sdk.mkm.Station;
    var ClientSession = sdk.network.ClientSession;
    var SharedFacebook = sdk.SharedFacebook;
    var GlobalVariable = {
        database: null,
        facebook: null,
        messenger: null,
        terminal: null,
        getInstance: function () {
            return this;
        }
    };
    GlobalVariable.createFacebook = function (database, current_user) {
        var facebook = new SharedFacebook(database);
        var sign_key = facebook.getPrivateKeyForVisaSignature(current_user);
        var msg_keys = facebook.getPrivateKeysForDecryption(current_user);
        if (!sign_key || !msg_keys || msg_keys.length === 0) {
            throw ReferenceError("failed to get private keys for: " + current_user);
        }
        var user = facebook.getUser(current_user);
        facebook.setCurrentUser(user);
        return facebook;
    };
    GlobalVariable.createSession = function (database, facebook, host, port) {
        var station = new Station(host, port);
        station.setDataSource(facebook);
        var session = new ClientSession(station, database);
        var user = facebook.getCurrentUser();
        session.setIdentifier(user.getIdentifier());
        return session;
    };
    ns.GlobalVariable = GlobalVariable;
})(SECHAT, DIMP);
(function (ns, sdk) {
    var Hex = sdk.format.Hex;
    var UTF8 = sdk.format.UTF8;
    var MD5 = sdk.digest.MD5;
    var Storage = ns.dos.SessionStorage;
    var get_configuration = function () {
        return ns.Configuration.getInstance();
    };
    var get_http_client = function () {
        return ns.network.HTTP;
    };
    var md5 = function (data) {
        var hash = MD5.digest(data);
        return Hex.encode(hash);
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
            var utf8 = UTF8.encode(url);
            if (pos > 0) {
                filename = md5(utf8) + filename.substr(pos);
            } else {
                filename = md5(utf8);
            }
        }
        return filename;
    };
    var generate_salt = function () {
        var data = new Uint8Array(16);
        for (var i = 0; i < 16; ++i) {
            data[i] = Math.floor(Math.random() * 256);
        }
        return data;
    };
    var secret_digest = function (data, secret, salt) {
        var concat = new Uint8Array(data.length + secret.length + salt.length);
        concat.set(data, 0);
        concat.set(secret, data.length);
        concat.set(salt, data.length + secret.length);
        return MD5.digest(concat);
    };
    var upload = function (type, data, filename, identifier, url, callback) {
        var config = get_configuration();
        var secret = config.getMD5Secret();
        var salt = generate_salt();
        var digest = secret_digest(data, secret, salt);
        url = url.replace("{ID}", identifier.getAddress().toString());
        url = url.replace("{MD5}", Hex.encode(digest));
        url = url.replace("{SALT}", Hex.encode(salt));
        if (!callback) {
            callback = function (xhr, url) {
                var response = new Uint8Array(xhr.response);
                upload_success(type, data, filename, identifier, url, response);
            };
        }
        var http = get_http_client();
        http.upload(url, data, filename, type, callback);
    };
    var FtpServer = {
        uploadAvatar: function (image, sender) {
            var filename = md5(image) + ".jpg";
            var config = get_configuration();
            var up = config.getUploadURL();
            upload("avatar", image, filename, sender, up, null);
            var down = config.getAvatarURL();
            down = down.replace("{ID}", sender.getAddress.toString());
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
            upload("file", data, filename, sender, up, null);
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
    var upload_success = function (
        type,
        data,
        filename,
        sender,
        url,
        response
    ) {};
    var download_success = function (url, response) {};
    ns.network.FtpServer = FtpServer;
})(SECHAT, DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var FileContent = ns.protocol.FileContent;
    var ImageContent = ns.protocol.ImageContent;
    var AudioContent = ns.protocol.AudioContent;
    var VideoContent = ns.protocol.VideoContent;
    var TextContent = ns.protocol.TextContent;
    var PageContent = ns.protocol.PageContent;
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var AnyContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    Class(AnyContentProcessor, BaseContentProcessor, null, null);
    AnyContentProcessor.prototype.process = function (content, rMsg) {
        var text;
        if (Interface.conforms(content, FileContent)) {
            if (Interface.conforms(content, ImageContent)) {
                text = "Image received";
            } else {
                if (Interface.conforms(content, AudioContent)) {
                    text = "Voice message received";
                } else {
                    if (Interface.conforms(content, VideoContent)) {
                        text = "Movie received";
                    } else {
                        text = "File received";
                    }
                }
            }
        } else {
            if (Interface.conforms(content, TextContent)) {
                text = "Text message received";
            } else {
                if (Interface.conforms(content, PageContent)) {
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
        var env = rMsg.getEnvelope();
        var sn = content.getSerialNumber();
        var signature = rMsg.getString("signature");
        var receipt = new ns.dkd.cmd.ReceiptCommand(text, env, sn, signature);
        return [receipt];
    };
    ns.cpu.AnyContentProcessor = AnyContentProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var BlockCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(BlockCommandProcessor, BaseCommandProcessor, null, null);
    BlockCommandProcessor.prototype.process = function (cmd, rMsg) {
        return null;
    };
    ns.cpu.BlockCommandProcessor = BlockCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var MuteCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(MuteCommandProcessor, BaseCommandProcessor, null, null);
    MuteCommandProcessor.prototype.process = function (cmd, rMsg) {
        return null;
    };
    ns.cpu.MuteCommandProcessor = MuteCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var SearchCommand = ns.protocol.SearchCommand;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var NotificationCenter = ns.lnc.NotificationCenter;
    var SearchCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(SearchCommandProcessor, BaseCommandProcessor, null, {});
    SearchCommandProcessor.prototype.process = function (content, rMsg) {
        parse.call(this, content);
        var nc = NotificationCenter.getInstance();
        nc.postNotification("SearchUpdated", this, {
            content: content,
            envelope: rMsg.getEnvelope()
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
        command.setValue("text", text);
    };
    var user_info = function (string, facebook) {
        var identifier = ID.parse(string);
        if (!identifier) {
            return string;
        }
        var nickname = facebook.getName(identifier);
        return identifier + ' "' + nickname + '"';
    };
    ns.cpu.SearchCommandProcessor = SearchCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var StorageCommand = ns.protocol.StorageCommand;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var StorageCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(StorageCommandProcessor, BaseCommandProcessor, null, null);
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
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var FileContent = ns.protocol.FileContent;
    var ImageContent = ns.protocol.ImageContent;
    var AudioContent = ns.protocol.AudioContent;
    var VideoContent = ns.protocol.VideoContent;
    var TextContent = ns.protocol.TextContent;
    var PageContent = ns.protocol.PageContent;
    var LoginCommand = ns.protocol.LoginCommand;
    var GroupCommand = ns.protocol.GroupCommand;
    var InviteCommand = ns.protocol.group.InviteCommand;
    var ExpelCommand = ns.protocol.group.ExpelCommand;
    var QuitCommand = ns.protocol.group.QuitCommand;
    var ResetCommand = ns.protocol.group.ResetCommand;
    var QueryCommand = ns.protocol.group.QueryCommand;
    var MessageBuilder = {
        getContentText: function (content) {
            var text = content.getString("text");
            if (text) {
                return text;
            } else {
                if (Interface.conforms(content, TextContent)) {
                    return content.getText();
                }
            }
            if (Interface.conforms(content, FileContent)) {
                if (Interface.conforms(content, ImageContent)) {
                    text = "[Image:" + content.getFilename() + "]";
                } else {
                    if (Interface.conforms(content, AudioContent)) {
                        text = "[Voice:" + content.getFilename() + "]";
                    } else {
                        if (Interface.conforms(content, VideoContent)) {
                            text = "[Movie:" + content.getFilename() + "]";
                        } else {
                            text = "[File:" + content.getFilename() + "]";
                        }
                    }
                }
            } else {
                if (Interface.conforms(content, PageContent)) {
                    text = "[URL:" + content.getURL() + "]";
                } else {
                    text =
                        "Current version doesn't support this message type: " +
                        content.getType();
                }
            }
            content.setValue("text", text);
            return text;
        },
        getCommandText: function (content, sender) {
            var text = content.getString("text");
            if (text) {
                return text;
            }
            if (Interface.conforms(content, LoginCommand)) {
                text = getLoginCommandText(content, sender);
            } else {
                if (Interface.conforms(content, GroupCommand)) {
                    text = getGroupCommandText(content, sender);
                } else {
                    text =
                        "Current version doesn't support this command: " + content.getCmd();
                }
            }
            content.setValue("text", text);
            return text;
        },
        getInstance: function () {
            return this;
        }
    };
    var getUsername = function (string) {
        var facebook = ns.GlobalVariable.facebook;
        return facebook.getName(ID.parse(string));
    };
    var getLoginCommandText = function (content, sender) {
        var identifier = content.getIdentifier();
        if (!sender.equals(identifier)) {
            console.error("login command error", content, sender);
        }
        var station = content.getStation();
        if (station) {
            var host = station["host"];
            var port = station["port"];
            station = "(" + host + ":" + port + ") " + getUsername(station["ID"]);
        }
        return getUsername(identifier) + " login: " + station;
    };
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
        console.error("unsupported group command", content);
        return "unsupported group command: " + content.getCmd();
    };
    var getInviteCommandText = function (content, sender) {
        var addedList = content.getValue("added");
        if (!addedList) {
            addedList = [];
        }
        var names = [];
        for (var i = 0; i < addedList.length; ++i) {
            names.push(getUsername(addedList[i]));
        }
        return getUsername(sender) + " has invited members: " + names.join(", ");
    };
    var getExpelCommandText = function (content, sender) {
        var removedList = content.getValue("removed");
        if (!removedList) {
            removedList = [];
        }
        var names = [];
        for (var i = 0; i < removedList.length; ++i) {
            names.push(getUsername(removedList[i]));
        }
        return getUsername(sender) + " has removed members: " + names.join(", ");
    };
    var getQuitCommandText = function (content, sender) {
        return getUsername(sender) + " has quit group chat.";
    };
    var getResetCommandText = function (content, sender) {
        var text = getUsername(sender) + " has updated members";
        var i, names;
        var removedList = content.getValue("removed");
        if (removedList && removedList.length > 0) {
            names = [];
            for (i = 0; i < removedList.length; ++i) {
                names.push(getUsername(removedList[i]));
            }
            text += ", removed: " + names.join(", ");
        }
        var addedList = content.getValue("added");
        if (addedList && addedList.length > 0) {
            names = [];
            for (i = 0; i < addedList.length; ++i) {
                names.push(getUsername(addedList[i]));
            }
            text += ", added: " + names.join(", ");
        }
        return text;
    };
    var getQueryCommandText = function (content, sender) {
        return getUsername(sender) + " was querying group info, responding...";
    };
    ns.cpu.MessageBuilder = MessageBuilder;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Command = ns.protocol.Command;
    var ClientContentProcessorCreator = ns.cpu.ClientContentProcessorCreator;
    var AnyContentProcessor = ns.cpu.AnyContentProcessor;
    var MuteCommandProcessor = ns.cpu.MuteCommandProcessor;
    var BlockCommandProcessor = ns.cpu.BlockCommandProcessor;
    var StorageCommandProcessor = ns.cpu.StorageCommandProcessor;
    var SearchCommandProcessor = ns.cpu.SearchCommandProcessor;
    var ClientProcessorCreator = function (facebook, messenger) {
        ClientContentProcessorCreator.call(this, facebook, messenger);
    };
    Class(ClientProcessorCreator, ClientContentProcessorCreator, null, {
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (type === 0) {
                return new AnyContentProcessor(facebook, messenger);
            }
            return ClientContentProcessorCreator.prototype.createContentProcessor.call(
                this,
                type
            );
        },
        createCommandProcessor: function (type, cmd) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            switch (cmd) {
                case Command.MUTE:
                    return new MuteCommandProcessor(facebook, messenger);
                case Command.BLOCK:
                    return new BlockCommandProcessor(facebook, messenger);
                case Command.SEARCH:
                case Command.ONLINE_USERS:
                    return new SearchCommandProcessor(facebook, messenger);
                case Command.STORAGE:
                case Command.CONTACTS:
                case Command.PRIVATE_KEY:
                    return new StorageCommandProcessor(facebook, messenger);
            }
            return ClientContentProcessorCreator.prototype.createCommandProcessor.call(
                this,
                type,
                cmd
            );
        }
    });
    ns.cpu.ClientProcessorCreator = ClientProcessorCreator;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Storage = ns.dos.LocalStorage;
    var UserDBI = ns.dbi.UserDBI;
    var users_path = function () {
        return "local_users";
    };
    var contacts_path = function (user) {
        return "user." + user.getAddress().toString() + ".contacts";
    };
    var UserStorage = function () {
        Object.call(this);
    };
    Class(UserStorage, Object, [UserDBI], null);
    UserStorage.prototype.setCurrentUser = function (user) {
        var localUsers = this.getLocalUsers();
        var pos;
        for (pos = localUsers.length - 1; pos >= 0; --pos) {
            if (localUsers[pos].equals(user)) {
                break;
            }
        }
        if (pos === 0) {
            return false;
        } else {
            if (pos > 0) {
                localUsers.splice(pos, 1);
            }
        }
        localUsers.unshift(user);
        return this.saveLocalUsers(localUsers);
    };
    UserStorage.prototype.getLocalUsers = function () {
        var path = users_path();
        var array = Storage.loadJSON(path);
        if (array) {
            return ID.convert(array);
        } else {
            return [];
        }
    };
    UserStorage.prototype.saveLocalUsers = function (users) {
        var path = users_path();
        var array = ID.revert(users);
        return Storage.saveJSON(array, path);
    };
    UserStorage.prototype.getContacts = function (user) {
        var path = contacts_path(user);
        var array = Storage.loadJSON(path);
        if (array) {
            return ID.convert(array);
        } else {
            return [];
        }
    };
    UserStorage.prototype.saveContacts = function (contacts, user) {
        var path = contacts_path(user);
        var array = ID.revert(contacts);
        return Storage.saveJSON(array, path);
    };
    ns.database.UserStorage = UserStorage;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Storage = ns.dos.LocalStorage;
    var GroupDBI = ns.dbi.GroupDBI;
    var members_path = function (group) {
        return "group." + group.getAddress().toString() + ".members";
    };
    var bots_path = function (group) {
        return "group." + group.getAddress().toString() + ".assistants";
    };
    var GroupStorage = function () {
        Object.call(this);
    };
    Class(GroupStorage, Object, [GroupDBI], null);
    GroupStorage.prototype.getFounder = function (group) {
        return null;
    };
    GroupStorage.prototype.getOwner = function (group) {
        return null;
    };
    GroupStorage.prototype.getMembers = function (group) {
        var path = members_path(group);
        var array = Storage.loadJSON(path);
        if (array) {
            return ID.convert(array);
        } else {
            return [];
        }
    };
    GroupStorage.prototype.saveMembers = function (members, group) {
        var path = members_path(group);
        var array = ID.revert(members);
        return Storage.saveJSON(array, path);
    };
    GroupStorage.prototype.getAssistants = function (group) {
        var path = bots_path(group);
        var array = Storage.loadJSON(path);
        if (array) {
            return ID.convert(array);
        } else {
            return [];
        }
    };
    GroupStorage.prototype.saveAssistants = function (members, group) {
        var path = bots_path(group);
        var array = ID.revert(members);
        return Storage.saveJSON(array, path);
    };
    ns.database.GroupStorage = GroupStorage;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Command = ns.protocol.Command;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var Storage = ns.dos.LocalStorage;
    var LoginDBI = ns.dbi.LoginDBI;
    var store_path = function (user) {
        return "user." + user.getAddress().toString() + ".login";
    };
    var LoginStorage = function () {
        Object.call(this);
    };
    Class(LoginStorage, Object, [LoginDBI], null);
    LoginStorage.prototype.getLoginCommandMessage = function (user) {
        var path = store_path(user);
        var info = Storage.loadJSON(path);
        if (info) {
            var cmd = Command.parse(info["cmd"]);
            var msg = ReliableMessage.parse(info["msg"]);
            return [cmd, msg];
        } else {
            return [null, null];
        }
    };
    LoginStorage.prototype.saveLoginCommandMessage = function (
        user,
        command,
        message
    ) {
        var cmd = !command ? null : command.toMap();
        var msg = !message ? null : message.toMap();
        var info = { cmd: cmd, msg: msg };
        var path = store_path(user);
        return Storage.saveJSON(info, path);
    };
    ns.database.LoginStorage = LoginStorage;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var ReliableMessageDBI = ns.dbi.ReliableMessageDBI;
    var MessageStorage = function () {
        Object.call(this);
        this.__reliable_messages = {};
        this.__instant_messages = {};
    };
    Class(MessageStorage, Object, [ReliableMessageDBI], null);
    MessageStorage.prototype.getReliableMessages = function (
        receiver,
        start,
        limit
    ) {
        if (!limit || limit <= 0) {
            limit = 20;
        }
        receiver = receiver.toString();
        var messages = this.__reliable_messages[receiver];
        if (!messages) {
            return [null, 0];
        }
        var total = messages.length;
        if (start < 0) {
            var offset = start + total;
            if (offset < 0) {
                throw RangeError("out of range");
            }
            start = offset;
        } else {
            if (start >= total) {
                return [null, 0];
            }
        }
        var end = start + limit;
        var remaining;
        if (end < total) {
            remaining = total - end;
        } else {
            end = total;
            remaining = 0;
        }
        var partial = messages.slice(start, end);
        return [partial, remaining];
    };
    MessageStorage.prototype.cacheReliableMessage = function (receiver, rMsg) {
        var msg_sig = rMsg.getString("signature");
        if (!msg_sig) {
            throw new ReferenceError("message error: " + rMsg);
        }
        receiver = receiver.toString();
        var messages = this.__reliable_messages[receiver];
        if (!messages) {
            this.__reliable_messages[receiver] = [rMsg];
            return true;
        } else {
            if (find_reliable(messages, rMsg) >= 0) {
                return false;
            }
        }
        insert_msg(messages, rMsg);
        return true;
    };
    var insert_msg = function (messages, msg) {
        var pos = messages.length - 1;
        var msg_time = msg.getNumber("time");
        if (msg_time === 0) {
            messages.push(msg);
            return pos + 1;
        }
        var item, item_time;
        var i;
        for (i = pos; i >= 0; --i) {
            item = messages[i];
            item_time = item.getNumber("time");
            if (item_time <= 0) {
                continue;
            }
            if (item_time <= msg_time) {
                pos = i;
                break;
            } else {
                pos = i - 1;
            }
        }
        messages.splice(pos + 1, 0, msg);
        return pos + 1;
    };
    MessageStorage.prototype.removeReliableMessage = function (receiver, rMsg) {
        var msg_sig = rMsg.getString("signature");
        if (!msg_sig) {
            throw new ReferenceError("message error: " + rMsg);
        }
        receiver = receiver.toString();
        var messages = this.__reliable_messages[receiver];
        if (!messages) {
            return false;
        }
        var pos = find_reliable(messages, rMsg);
        if (pos < 0) {
            return false;
        }
        if (messages.length === 1) {
            delete this.__reliable_messages[receiver];
        } else {
            messages.splice(pos, 1);
        }
        return true;
    };
    var find_reliable = function (messages, msg) {
        var sig = msg.getString("signature");
        for (var i = messages.length - 1; i >= 0; --i) {
            if (messages[i].getString("signature") === sig) {
                return i;
            }
        }
        return -1;
    };
    MessageStorage.prototype.numberOfConversations = function () {
        var keys = Object.keys(this.__instant_messages);
        return keys.length;
    };
    MessageStorage.prototype.conversationAtIndex = function (index) {
        var keys = Object.keys(this.__instant_messages);
        return ID.parse(keys[index]);
    };
    MessageStorage.prototype.removeConversationAtIndex = function (index) {
        var keys = Object.keys(this.__instant_messages);
        delete this.__instant_messages[keys[index]];
    };
    MessageStorage.prototype.removeConversation = function (entity) {
        delete this.__instant_messages[entity.toString()];
    };
    MessageStorage.prototype.numberOfMessages = function (entity) {
        var messages = this.__instant_messages[entity.toString()];
        if (messages) {
            return messages.length;
        } else {
            return 0;
        }
    };
    MessageStorage.prototype.numberOfUnreadMessages = function (entity) {};
    MessageStorage.prototype.clearUnreadMessages = function (entity) {};
    MessageStorage.prototype.lastMessage = function (entity) {
        var messages = this.__instant_messages[entity.toString()];
        if (messages && messages.length > 0) {
            return messages[messages.length - 1];
        } else {
            return null;
        }
    };
    MessageStorage.prototype.messageAtIndex = function (index, entity) {
        var messages = this.__instant_messages[entity.toString()];
        console.assert(
            messages !== null,
            "failed to get messages for conversation: " + entity
        );
        return messages[index];
    };
    MessageStorage.prototype.insertMessage = function (iMsg, entity) {
        var cid = entity.toString();
        var messages = this.__instant_messages[cid];
        if (!messages) {
            this.__instant_messages[cid] = [iMsg];
            return true;
        } else {
            if (find_instant(messages, iMsg) >= 0) {
                return false;
            }
        }
        insert_msg(messages, iMsg);
        return true;
    };
    MessageStorage.prototype.removeMessage = function (iMsg, entity) {
        var cid = entity.toString();
        var messages = this.__instant_messages[cid];
        if (!messages) {
            return false;
        }
        var pos = find_instant(messages, iMsg);
        if (pos < 0) {
            return false;
        }
        if (messages.length === 1) {
            delete this.__instant_messages[cid];
        } else {
            messages.splice(pos, 1);
        }
        return true;
    };
    var find_instant = function (messages, msg) {
        var sn = msg.getContent().getSerialNumber();
        for (var i = messages.length - 1; i >= 0; --i) {
            if (messages[i].getContent().getSerialNumber() === sn) {
                return i;
            }
        }
        return -1;
    };
    MessageStorage.prototype.withdrawMessage = function (iMsg, entity) {};
    MessageStorage.prototype.saveReceipt = function (iMsg, entity) {};
    ns.database.MessageStorage = MessageStorage;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Storage = ns.dos.SessionStorage;
    var CipherKeyDBI = ns.dbi.CipherKeyDBI;
    var msg_key_path = function (from, to) {
        from = from.getAddress().toString();
        to = to.getAddress().toString();
        return "msg_key." + from + "-" + to;
    };
    var CipherKeyStorage = function () {
        Object.call(this);
    };
    Class(CipherKeyStorage, Object, [CipherKeyDBI], null);
    CipherKeyStorage.prototype.getCipherKey = function (from, to, generate) {
        var path = msg_key_path(from, to);
        var info = Storage.loadJSON(path);
        return SymmetricKey.parse(info);
    };
    CipherKeyStorage.prototype.cacheCipherKey = function (from, to, key) {
        var path = msg_key_path(from, to);
        var info = !key ? null : key.toMap();
        return Storage.saveJSON(info, path);
    };
    ns.database.CipherKeyStorage = CipherKeyStorage;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Storage = ns.dos.LocalStorage;
    var ProviderDBI = ns.dbi.ProviderDBI;
    var stations_path = function (provider) {
        return "isp." + provider.getAddress().toString() + ".stations";
    };
    var ISP = ID.parse("gsp@everywhere");
    var load_stations = function () {
        var stations = [];
        var path = stations_path(ISP);
        var array = Storage.loadJSON(path);
        if (array) {
            var item;
            for (var i = 0; i < array.length; ++i) {
                item = array[i];
                stations.push({
                    host: item["host"],
                    port: item["port"],
                    ID: ID.parse(item["ID"])
                });
            }
        }
        return stations;
    };
    var save_stations = function (stations) {
        var array = [];
        var item;
        var host, port, sid;
        for (var i = 0; i < stations.length; ++i) {
            item = stations[i];
            host = item["host"];
            port = item["port"];
            sid = item["ID"];
            if (sid) {
                array.push({ host: host, port: port, ID: sid.toString() });
            } else {
                array.push({ host: host, port: port });
            }
        }
        var path = stations_path(ISP);
        return Storage.saveJSON(array, path);
    };
    var find_station = function (stations, host, port) {
        var item;
        for (var i = 0; i < stations.length; ++i) {
            item = stations[i];
            if (item["host"] === host && item["port"] === port) {
                return i;
            }
        }
        return -1;
    };
    var ProviderStorage = function () {
        Object.call(this);
        this.__stations = null;
    };
    Class(ProviderStorage, Object, [ProviderDBI], null);
    ProviderStorage.prototype.allNeighbors = function () {
        if (this.__stations === null) {
            this.__stations = load_stations();
        }
        return this.__stations;
    };
    ProviderStorage.prototype.getNeighbor = function (ip, port) {
        var stations = this.allNeighbors();
        var index = find_station(stations, ip, port);
        if (index < 0) {
            return null;
        }
        return stations[index]["ID"];
    };
    ProviderStorage.prototype.addNeighbor = function (ip, port, identifier) {
        var stations = this.allNeighbors();
        var index = find_station(stations, ip, port);
        if (index >= 0) {
            return false;
        }
        stations.unshift({ host: ip, port: port, ID: identifier });
        return save_stations(stations);
    };
    ProviderStorage.prototype.removeNeighbor = function (ip, port) {
        var stations = this.allNeighbors();
        var index = find_station(stations, ip, port);
        if (index < 0) {
            return false;
        }
        stations.splice(index, 1);
        return save_stations(stations);
    };
    ns.database.ProviderStorage = ProviderStorage;
})(DIMP);
(function (ns, sdk) {
    var Hex = sdk.format.Hex;
    var Configuration = {
        getInstance: function () {
            return this;
        },
        getDefaultProvider: function () {
            if (this.__sp === null) {
                this.__sp = load_config();
            }
            return this.__sp;
        },
        getMD5Secret: function () {
            var info = this.getDefaultProvider();
            return info["MD5_SECRET"];
        },
        getUploadURL: function () {
            var info = this.getDefaultProvider();
            return info["UPLOAD_URL"];
        },
        getDownloadURL: function () {
            var info = this.getDefaultProvider();
            return info["DOWNLOAD_URL"];
        },
        getAvatarURL: function () {
            var info = this.getDefaultProvider();
            return info["AVATAR_URL"];
        },
        getTermsURL: function () {
            return "https://wallet.dim.chat/dimchat/sechat/privacy.html";
        },
        getAboutURL: function () {
            return "https://dim.chat/sechat";
        },
        __sp: null
    };
    var load_config = function () {
        return {
            UPLOAD_URL: "http://106.52.25.169:8081/{ID}/upload?md5={MD5}&salt={SALT}",
            DOWNLOAD_URL: "http://106.52.25.169:8081/download/{ID}/{filename}",
            AVATAR_URL: "http://106.52.25.169:8081/avatar/{ID}/{filename}",
            MD5_SECRET: Hex.decode("12345678")
        };
    };
    ns.Configuration = Configuration;
})(SECHAT, DIMP);
(function (ns, sdk) {
    var Interface = sdk.type.Interface;
    var Enum = sdk.type.Enum;
    var EntityType = sdk.protocol.EntityType;
    var ContentType = sdk.protocol.ContentType;
    var Entity = sdk.mkm.Entity;
    var get_facebook = function () {
        return ns.GlobalVariable.getInstance().facebook;
    };
    var get_conversation_db = function () {
        return ns.GlobalVariable.getInstance().database;
    };
    var ConversationType = Enum(null, {
        Personal: EntityType.USER,
        Group: EntityType.GROUP
    });
    var Conversation = function (entity) {
        if (Interface.conforms(entity, Entity)) {
            entity = entity.getIdentifier();
        }
        this.identifier = entity;
        this.type = get_type(entity);
        this.db = get_conversation_db();
    };
    var get_type = function (identifier) {
        if (identifier.isGroup()) {
            return ConversationType.Group;
        }
        return ConversationType.Personal;
    };
    Conversation.prototype.getIdentifier = function () {
        return this.identifier;
    };
    Conversation.prototype.getTitle = function () {
        var facebook = get_facebook();
        var name = facebook.getName(this.identifier);
        if (this.identifier.isGroup()) {
            var members = facebook.getMembers(this.identifier);
            var count = !members ? 0 : members.length;
            if (count === 0) {
                return name + " (...)";
            }
            return name + " (" + count + ")";
        } else {
            return name;
        }
    };
    Conversation.prototype.getLastTime = function () {
        var iMsg = this.getLastMessage();
        var time = !iMsg ? null : iMsg.getTime();
        return time || new Date(0);
    };
    Conversation.prototype.getLastMessage = function () {
        return this.db.lastMessage(this.identifier);
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
        return this.db.numberOfMessages(this.identifier);
    };
    Conversation.prototype.getNumberOfUnreadMessages = function () {
        return this.db.numberOfUnreadMessages(this.identifier);
    };
    Conversation.prototype.getMessageAtIndex = function (index) {
        return this.db.messageAtIndex(index, this.identifier);
    };
    Conversation.prototype.insertMessage = function (iMsg) {
        return this.db.insertMessage(iMsg, this.identifier);
    };
    Conversation.prototype.removeMessage = function (iMsg) {
        return this.db.removeMessage(iMsg, this.identifier);
    };
    Conversation.prototype.withdrawMessage = function (iMsg) {
        return this.db.withdrawMessage(iMsg, this.identifier);
    };
    Conversation.prototype.saveReceipt = function (iMsg) {
        return this.db.saveReceipt(iMsg, this.identifier);
    };
    ns.Conversation = Conversation;
})(SECHAT, DIMP);
(function (ns, sdk) {
    var Interface = sdk.type.Interface;
    var ReceiptCommand = sdk.protocol.ReceiptCommand;
    var Conversation = ns.Conversation;
    var get_facebook = function () {
        return ns.GlobalVariable.getInstance().facebook;
    };
    var get_conversation_db = function () {
        return ns.GlobalVariable.getInstance().database;
    };
    var Amanuensis = {
        getConversation: function (identifier) {
            var facebook = get_facebook();
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
            var chatBox = new Conversation(entity);
            chatBox.database = get_conversation_db();
            return chatBox;
        },
        saveMessage: function (iMsg) {
            if (Interface.conforms(iMsg.getContent(), ReceiptCommand)) {
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
        },
        getInstance: function () {
            return this;
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
        var facebook = get_facebook();
        var user = facebook.getCurrentUser();
        var sender = iMsg.getSender();
        if (user.getIdentifier().equals(sender)) {
            return this.getConversation(receiver);
        } else {
            return this.getConversation(sender);
        }
    };
    ns.Amanuensis = Amanuensis;
})(SECHAT, DIMP);
(function (ns, sdk) {
    var SymmetricKey = sdk.crypto.SymmetricKey;
    var PlainKey = sdk.crypto.PlainKey;
    var PrivateKeyStorage = sdk.database.PrivateKeyStorage;
    var MetaStorage = sdk.database.MetaStorage;
    var DocumentStorage = sdk.database.DocumentStorage;
    var ProviderStorage = sdk.database.ProviderStorage;
    var UserStorage = sdk.database.UserStorage;
    var GroupStorage = sdk.database.GroupStorage;
    var LoginStorage = sdk.database.LoginStorage;
    var CipherKeyStorage = sdk.database.CipherKeyStorage;
    var MessageStorage = sdk.database.MessageStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    var NotificationNames = ns.NotificationNames;
    var t_private_key = new PrivateKeyStorage();
    var t_meta = new MetaStorage();
    var t_document = new DocumentStorage();
    var t_provider = new ProviderStorage();
    var t_user = new UserStorage();
    var t_group = new GroupStorage();
    var t_login = new LoginStorage();
    var t_cipher_key = new CipherKeyStorage();
    var t_message = new MessageStorage();
    var SharedDatabase = {
        savePrivateKey: function (key, type, user) {
            return t_private_key.savePrivateKey(key, type, user);
        },
        getPrivateKeysForDecryption: function (user) {
            return t_private_key.getPrivateKeysForDecryption(user);
        },
        getPrivateKeyForSignature: function (user) {
            return t_private_key.getPrivateKeyForSignature(user);
        },
        getPrivateKeyForVisaSignature: function (user) {
            return t_private_key.getPrivateKeyForVisaSignature(user);
        },
        saveMeta: function (meta, entity) {
            var ok = t_meta.saveMeta(meta, entity);
            if (ok) {
                post_notification(NotificationNames.MetaAccepted, this, {
                    ID: entity,
                    meta: meta
                });
            }
            return ok;
        },
        getMeta: function (entity) {
            return t_meta.getMeta(entity);
        },
        saveDocument: function (doc) {
            var ok = t_document.saveDocument(doc);
            if (ok) {
                post_notification(NotificationNames.DocumentUpdated, this, {
                    ID: doc.getIdentifier(),
                    document: doc
                });
            }
            return ok;
        },
        getDocument: function (entity) {
            return t_document.getDocument(entity);
        },
        allNeighbors: function () {
            return t_provider.allNeighbors();
        },
        getNeighbor: function (ip, port) {
            return t_provider.getNeighbor(ip, port);
        },
        addNeighbor: function (ip, port, identifier) {
            var ok = t_provider.addNeighbor(ip, port, identifier);
            if (ok) {
                post_notification(NotificationNames.ServiceProviderUpdated, this, {
                    action: "add",
                    host: ip,
                    port: port,
                    ID: identifier
                });
            }
            return ok;
        },
        removeNeighbor: function (ip, port) {
            var ok = t_provider.removeNeighbor(ip, port);
            if (ok) {
                post_notification(NotificationNames.ServiceProviderUpdated, this, {
                    action: "remove",
                    host: ip,
                    port: port
                });
            }
            return ok;
        },
        setCurrentUser: function (user) {
            return t_user.setCurrentUser(user);
        },
        getLocalUsers: function () {
            return t_user.getLocalUsers();
        },
        saveLocalUsers: function (users) {
            return t_user.saveLocalUsers(users);
        },
        getContacts: function (user) {
            return t_user.getContacts(user);
        },
        saveContacts: function (contacts, user) {
            var ok = t_user.saveContacts(contacts, user);
            if (ok) {
                post_notification(NotificationNames.ContactsUpdated, this, {
                    user: user,
                    contacts: contacts
                });
            }
            return ok;
        },
        getFounder: function (group) {
            return t_group.getFounder(group);
        },
        getOwner: function (group) {
            return t_group.getOwner(group);
        },
        getMembers: function (group) {
            return t_group.getMembers(group);
        },
        saveMembers: function (members, group) {
            var ok = t_group.saveMembers(members, group);
            if (ok) {
                post_notification(NotificationNames.MembersUpdated, this, {
                    group: group,
                    members: members
                });
            }
            return ok;
        },
        getAssistants: function (group) {
            return t_group.getAssistants(group);
        },
        saveAssistants: function (members, group) {
            return t_group.saveAssistants(members, group);
        },
        getLoginCommandMessage: function (user) {
            return t_login.getLoginCommandMessage(user);
        },
        saveLoginCommandMessage: function (user, command, message) {
            return t_login.saveLoginCommandMessage(user, command, message);
        },
        getCipherKey: function (from, to, generate) {
            if (to.isBroadcast()) {
                return PlainKey.getInstance();
            }
            var key = t_cipher_key.getCipherKey(from, to, generate);
            if (!key && generate) {
                key = SymmetricKey.generate(SymmetricKey.AES);
                t_cipher_key.cacheCipherKey(from, to, key);
            }
            return key;
        },
        cacheCipherKey: function (from, to, key) {
            return t_cipher_key.cacheCipherKey(from, to, key);
        },
        getReliableMessages: function (receiver, start, limit) {
            return t_message.getReliableMessages(receiver, start, limit);
        },
        cacheReliableMessage: function (receiver, rMsg) {
            return t_message.cacheReliableMessage(receiver, rMsg);
        },
        removeReliableMessage: function (receiver, rMsg) {
            return t_message.removeReliableMessage(receiver, rMsg);
        },
        numberOfConversations: function () {
            return t_message.numberOfConversations();
        },
        conversationAtIndex: function (index) {
            return t_message.conversationAtIndex(index);
        },
        removeConversationAtIndex: function (index) {
            return t_message.removeConversationAtIndex(index);
        },
        removeConversation: function (entity) {
            return t_message.removeConversation(entity);
        },
        numberOfMessages: function (entity) {
            return t_message.numberOfMessages(entity);
        },
        numberOfUnreadMessages: function (entity) {
            return t_message.numberOfUnreadMessages(entity);
        },
        clearUnreadMessages: function (entity) {
            return t_message.clearUnreadMessages(entity);
        },
        lastMessage: function (entity) {
            return t_message.lastMessage(entity);
        },
        messageAtIndex: function (index, entity) {
            return t_message.messageAtIndex(index, entity);
        },
        insertMessage: function (iMsg, entity) {
            var ok = t_message.insertMessage(iMsg, entity);
            if (ok) {
                post_notification(NotificationNames.MessageUpdated, this, {
                    action: "add",
                    ID: entity,
                    msg: iMsg
                });
                console.info("message saved", iMsg, entity);
            } else {
                console.error("failed to save message", iMsg, entity);
            }
            return ok;
        },
        removeMessage: function (iMsg, entity) {
            var ok = t_message.removeMessage(iMsg, entity);
            if (ok) {
                post_notification(NotificationNames.MessageUpdated, this, {
                    action: "remove",
                    ID: entity,
                    msg: iMsg
                });
            }
            return ok;
        },
        withdrawMessage: function (iMsg, entity) {
            var ok = t_message.withdrawMessage(iMsg, entity);
            if (ok) {
                post_notification(NotificationNames.MembersUpdated, this, {
                    action: "withdraw",
                    ID: entity,
                    msg: iMsg
                });
            }
            return ok;
        },
        saveReceipt: function (iMsg, entity) {
            return t_message.saveReceipt(iMsg, entity);
        },
        getInstance: function () {
            return this;
        }
    };
    var post_notification = function (name, sender, userInfo) {
        var nc = NotificationCenter.getInstance();
        nc.postNotification(name, sender, userInfo);
    };
    ns.SharedDatabase = SharedDatabase;
})(SECHAT, DIMP);
