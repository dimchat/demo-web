/**
 *  DIM-Common (v0.2.2)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Feb. 18, 2023
 * @copyright (c) 2023 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
(function (ns) {
    var Interface = ns.type.Interface;
    var Enum = ns.type.Enum;
    var Command = ns.protocol.Command;
    var HandshakeState = Enum(null, {
        START: 0,
        AGAIN: 1,
        RESTART: 2,
        SUCCESS: 3
    });
    Command.HANDSHAKE = "handshake";
    var HandshakeCommand = Interface(null, [Command]);
    HandshakeCommand.prototype.getTitle = function () {
        throw new Error("NotImplemented");
    };
    HandshakeCommand.prototype.getSessionKey = function () {
        throw new Error("NotImplemented");
    };
    HandshakeCommand.prototype.getState = function () {
        throw new Error("NotImplemented");
    };
    ns.protocol.HandshakeCommand = HandshakeCommand;
    ns.protocol.HandshakeState = HandshakeState;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Command = ns.protocol.Command;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var HandshakeState = ns.protocol.HandshakeState;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseHandshakeCommand = function () {
        var title = null;
        var session = null;
        if (arguments.length === 2) {
            BaseCommand.call(this, Command.HANDSHAKE);
            title = arguments[0];
            session = arguments[1];
        } else {
            if (typeof arguments[0] === "string") {
                BaseCommand.call(this, Command.HANDSHAKE);
                title = arguments[0];
            } else {
                BaseCommand.call(this, arguments[0]);
            }
        }
        if (title) {
            this.setValue("title", title);
        }
        if (session) {
            this.setValue("session", session);
        }
    };
    Class(BaseHandshakeCommand, BaseCommand, [HandshakeCommand], {
        getTitle: function () {
            return this.getString("title");
        },
        getSessionKey: function () {
            return this.getString("session");
        },
        getState: function () {
            return get_state(this.getTitle(), this.getSessionKey());
        }
    });
    var get_state = function (text, session) {
        if (text === SUCCESS_MESSAGE) {
            return HandshakeState.SUCCESS;
        } else {
            if (text === AGAIN_MESSAGE) {
                return HandshakeState.AGAIN;
            } else {
                if (session) {
                    return HandshakeState.RESTART;
                } else {
                    return HandshakeState.START;
                }
            }
        }
    };
    var START_MESSAGE = "Hello world!";
    var AGAIN_MESSAGE = "DIM?";
    var SUCCESS_MESSAGE = "DIM!";
    HandshakeCommand.start = function () {
        return new BaseHandshakeCommand(START_MESSAGE, null);
    };
    HandshakeCommand.restart = function (session) {
        return new BaseHandshakeCommand(START_MESSAGE, session);
    };
    HandshakeCommand.again = function (session) {
        return new BaseHandshakeCommand(AGAIN_MESSAGE, session);
    };
    HandshakeCommand.success = function () {
        return new BaseHandshakeCommand(SUCCESS_MESSAGE, null);
    };
    ns.dkd.cmd.HandshakeCommand = BaseHandshakeCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Envelope = ns.protocol.Envelope;
    var Command = ns.protocol.Command;
    Command.RECEIPT = "receipt";
    var ReceiptCommand = Interface(null, [Command]);
    ReceiptCommand.prototype.getText = function () {
        throw new Error("NotImplemented");
    };
    ReceiptCommand.prototype.getOriginalEnvelope = function () {
        throw new Error("NotImplemented");
    };
    ReceiptCommand.prototype.getOriginalSerialNumber = function () {
        throw new Error("NotImplemented");
    };
    ReceiptCommand.prototype.getOriginalSignature = function () {
        throw new Error("NotImplemented");
    };
    ns.protocol.ReceiptCommand = ReceiptCommand;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Base64 = ns.format.Base64;
    var Envelope = ns.protocol.Envelope;
    var Command = ns.protocol.Command;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseReceiptCommand = function () {
        var text, env, sn, sig;
        var origin;
        if (arguments.length === 4) {
            BaseCommand.call(this, Command.RECEIPT);
            text = arguments[0];
            env = arguments[1];
            sn = arguments[2];
            sig = arguments[3];
            if (text) {
                this.setValue("text", text);
            }
            if (env) {
                origin = env.toMap();
            } else {
                origin = {};
            }
            if (sn > 0) {
                origin["sn"] = sn;
            }
            if (sig) {
                if (sig instanceof Uint8Array) {
                    sig = Base64.encode(sig);
                } else {
                    if (typeof sig !== "string") {
                        throw new TypeError("signature error");
                    }
                }
                origin["signature"] = sig;
            }
            if (Object.keys(origin).length > 0) {
                this.setValue("origin", origin);
            }
        } else {
            if (typeof arguments[0] === "string") {
                BaseCommand.call(this, Command.RECEIPT);
                text = arguments[0];
                if (text) {
                    this.setValue("text", text);
                }
                env = null;
            } else {
                BaseCommand.call(this, arguments[0]);
                env = null;
            }
        }
        this.__envelope = env;
    };
    Class(BaseReceiptCommand, BaseCommand, [ReceiptCommand], {
        getText: function () {
            return this.getString("text");
        },
        getOriginalEnvelope: function () {
            if (this.__envelope === null) {
                var origin = this.getValue("origin");
                if (origin && origin["sender"]) {
                    this.__envelope = Envelope.parse(origin);
                }
            }
            return this.__envelope;
        },
        getOriginalSerialNumber: function () {
            var origin = this.getValue("origin");
            return origin ? origin["sn"] : null;
        },
        getOriginalSignature: function () {
            var origin = this.getValue("origin");
            return origin ? origin["signature"] : null;
        }
    });
    ReceiptCommand.create = function (text, msg) {
        var env = null;
        if (msg) {
            var info = msg.copyMap(false);
            delete info["data"];
            delete info["key"];
            delete info["keys"];
            delete info["meta"];
            delete info["visa"];
            env = Envelope.parse(info);
        }
        return new BaseReceiptCommand(text, env, 0, null);
    };
    ns.dkd.cmd.ReceiptCommand = BaseReceiptCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Command = ns.protocol.Command;
    var LoginCommand = Interface(null, [Command]);
    Command.LOGIN = "login";
    LoginCommand.prototype.getIdentifier = function () {
        throw new Error("NotImplemented");
    };
    LoginCommand.prototype.getDevice = function () {
        throw new Error("NotImplemented");
    };
    LoginCommand.prototype.setDevice = function (device) {
        throw new Error("NotImplemented");
    };
    LoginCommand.prototype.getAgent = function () {
        throw new Error("NotImplemented");
    };
    LoginCommand.prototype.setAgent = function (UA) {
        throw new Error("NotImplemented");
    };
    LoginCommand.prototype.getStation = function () {
        throw new Error("NotImplemented");
    };
    LoginCommand.prototype.setStation = function (station) {
        throw new Error("NotImplemented");
    };
    LoginCommand.prototype.getProvider = function () {
        throw new Error("NotImplemented");
    };
    LoginCommand.prototype.setProvider = function (provider) {
        throw new Error("NotImplemented");
    };
    ns.protocol.LoginCommand = LoginCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Wrapper = ns.type.Wrapper;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var LoginCommand = ns.protocol.LoginCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var Station = ns.mkm.Station;
    var ServiceProvider = ns.mkm.ServiceProvider;
    var BaseLoginCommand = function (info) {
        if (Interface.conforms(info, ID)) {
            BaseCommand.call(this, Command.LOGIN);
            this.setString("ID", info);
        } else {
            BaseCommand.call(this, info);
        }
    };
    Class(BaseLoginCommand, BaseCommand, [LoginCommand], {
        getIdentifier: function () {
            return ID.parse(this.getValue("ID"));
        },
        getDevice: function () {
            return this.getString("device");
        },
        setDevice: function (device) {
            this.setValue("device", device);
        },
        getAgent: function () {
            return this.getString("agent");
        },
        setAgent: function (UA) {
            this.setValue("agent", UA);
        },
        getStation: function () {
            return this.getValue("station");
        },
        setStation: function (station) {
            var info;
            if (!station) {
                info = null;
            } else {
                if (station instanceof Station) {
                    info = {
                        host: station.getHost(),
                        port: station.getPort(),
                        ID: station.getIdentifier().toString()
                    };
                } else {
                    info = Wrapper.fetchMap(station);
                }
            }
            this.setValue("station", info);
        },
        getProvider: function () {
            return this.getValue("provider");
        },
        setProvider: function (provider) {
            var info;
            if (!provider) {
                info = null;
            } else {
                if (provider instanceof ServiceProvider) {
                    info = { ID: provider.getIdentifier().toString() };
                } else {
                    if (Interface.conforms(provider, ID)) {
                        info = { ID: provider.toString() };
                    } else {
                        info = Wrapper.fetchMap(provider);
                    }
                }
            }
            this.setValue("provider", info);
        }
    });
    LoginCommand.create = function (identifier) {
        return new BaseLoginCommand(identifier);
    };
    ns.dkd.cmd.LoginCommand = BaseLoginCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Command = ns.protocol.Command;
    var ReportCommand = Interface(null, [Command]);
    Command.REPORT = "report";
    Command.ONLINE = "online";
    Command.OFFLINE = "offline";
    ReportCommand.prototype.setTitle = function (title) {
        throw new Error("NotImplemented");
    };
    ReportCommand.prototype.getTitle = function () {
        throw new Error("NotImplemented");
    };
    ns.protocol.ReportCommand = ReportCommand;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ReportCommand = ns.protocol.ReportCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
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
    Class(BaseReportCommand, BaseCommand, [ReportCommand], {
        setTitle: function (title) {
            this.setValue("title", title);
        },
        getTitle: function () {
            return this.getString("title");
        }
    });
    ReportCommand.create = function (title) {
        return new BaseReportCommand(title);
    };
    ns.dkd.cmd.ReportCommand = BaseReportCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var MuteCommand = Interface(null, [Command]);
    Command.MUTE = "mute";
    MuteCommand.prototype.setMuteCList = function (list) {
        throw new Error("NotImplemented");
    };
    MuteCommand.prototype.getMuteCList = function () {
        throw new Error("NotImplemented");
    };
    ns.protocol.MuteCommand = MuteCommand;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var MuteCommand = ns.protocol.MuteCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseMuteCommand = function (info) {
        var list = null;
        if (arguments.length === 0) {
            BaseCommand.call(this, Command.MUTE);
        } else {
            if (arguments[0] instanceof Array) {
                BaseCommand.call(this, Command.MUTE);
                list = arguments[0];
            } else {
                BaseCommand.call(this, arguments[0]);
            }
        }
        if (list) {
            this.setValue("list", ID.revert(list));
        }
        this.__list = list;
    };
    Class(BaseMuteCommand, BaseCommand, [MuteCommand], {
        getMuteCList: function () {
            if (this.__list === null) {
                var list = this.getValue("list");
                if (list) {
                    this.__list = ID.convert(list);
                } else {
                    this.__list = [];
                }
            }
            return this.__list;
        },
        setMuteCList: function (list) {
            this.__list = list;
            if (list) {
                list = ID.revert(list);
            }
            this.setValue("list", list);
        }
    });
    MuteCommand.create = function (list) {
        return new BaseMuteCommand(list);
    };
    ns.dkd.cmd.MuteCommand = BaseMuteCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var BlockCommand = Interface(null, [Command]);
    Command.BLOCK = "block";
    BlockCommand.prototype.setBlockCList = function (list) {
        throw new Error("NotImplemented");
    };
    BlockCommand.prototype.getBlockCList = function () {
        throw new Error("NotImplemented");
    };
    ns.protocol.BlockCommand = BlockCommand;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var BlockCommand = ns.protocol.BlockCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseBlockCommand = function () {
        var list = null;
        if (arguments.length === 0) {
            BaseCommand.call(this, Command.BLOCK);
        } else {
            if (arguments[0] instanceof Array) {
                BaseCommand.call(this, Command.BLOCK);
                list = arguments[0];
            } else {
                BaseCommand.call(this, arguments[0]);
            }
        }
        if (list) {
            this.setValue("list", ID.revert(list));
        }
        this.__list = list;
    };
    Class(BaseBlockCommand, BaseCommand, [BlockCommand], {
        getBlockCList: function () {
            if (this.__list === null) {
                var list = this.getValue("list");
                if (list) {
                    this.__list = ID.convert(list);
                } else {
                    this.__list = [];
                }
            }
            return this.__list;
        },
        setBlockCList: function (list) {
            this.__list = list;
            if (list) {
                list = ID.revert(list);
            }
            this.setValue("list", list);
        }
    });
    BlockCommand.create = function (list) {
        return new BaseBlockCommand(list);
    };
    ns.dkd.cmd.BlockCommand = BaseBlockCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Command = ns.protocol.Command;
    var SearchCommand = Interface(null, [Command]);
    Command.SEARCH = "search";
    Command.ONLINE_USERS = "users";
    SearchCommand.prototype.setKeywords = function (keywords) {
        throw new Error("NotImplemented");
    };
    SearchCommand.prototype.getKeywords = function () {
        throw new Error("NotImplemented");
    };
    SearchCommand.prototype.setRange = function (start, limit) {
        throw new Error("NotImplemented");
    };
    SearchCommand.prototype.getRange = function () {
        throw new Error("NotImplemented");
    };
    SearchCommand.prototype.getUsers = function () {
        throw new Error("NotImplemented");
    };
    SearchCommand.prototype.getResults = function () {
        throw new Error("NotImplemented");
    };
    ns.protocol.SearchCommand = SearchCommand;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var SearchCommand = ns.protocol.SearchCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseSearchCommand = function () {
        var keywords = null;
        if (arguments.length === 0) {
            BaseCommand.call(this, Command.ONLINE_USERS);
        } else {
            if (typeof arguments[0] === "string") {
                BaseCommand.call(this, Command.SEARCH);
                keywords = arguments[0];
            } else {
                BaseCommand.call(this, arguments[0]);
            }
        }
        if (keywords) {
            this.setValue("keywords", keywords);
        }
    };
    Class(BaseSearchCommand, BaseCommand, [SearchCommand], {
        setKeywords: function (keywords) {
            this.setValue("keywords", keywords);
        },
        getKeywords: function () {
            return this.getValue("keywords");
        },
        setRange: function (start, limit) {
            this.setValue("start", start);
            this.setValue("limit", limit);
        },
        getRange: function () {
            var start = this.getNumber("start");
            var limit = this.getNumber("limit");
            return [start, limit];
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
        if (keywords instanceof Array) {
            keywords = keywords.join(" ");
        } else {
            if (typeof keywords !== "string") {
                throw new TypeError("keywords error: " + keywords);
            }
        }
        return new BaseSearchCommand(keywords);
    };
    ns.dkd.cmd.SearchCommand = BaseSearchCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var StorageCommand = Interface(null, [Command]);
    Command.STORAGE = "storage";
    Command.CONTACTS = "contacts";
    Command.PRIVATE_KEY = "private_key";
    StorageCommand.prototype.setTitle = function (title) {
        throw new Error("NotImplemented");
    };
    StorageCommand.prototype.getTitle = function () {
        throw new Error("NotImplemented");
    };
    StorageCommand.prototype.setIdentifier = function (identifier) {
        throw new Error("NotImplemented");
    };
    StorageCommand.prototype.getIdentifier = function () {
        throw new Error("NotImplemented");
    };
    StorageCommand.prototype.setData = function (data) {
        throw new Error("NotImplemented");
    };
    StorageCommand.prototype.getData = function () {
        throw new Error("NotImplemented");
    };
    StorageCommand.prototype.decrypt = function (key) {
        throw new Error("NotImplemented");
    };
    StorageCommand.prototype.setKey = function (data) {
        throw new Error("NotImplemented");
    };
    StorageCommand.prototype.getKey = function () {
        throw new Error("NotImplemented");
    };
    ns.protocol.StorageCommand = StorageCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var DecryptKey = ns.crypto.DecryptKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var Base64 = ns.format.Base64;
    var JsON = ns.format.JSON;
    var UTF8 = ns.format.UTF8;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var StorageCommand = ns.protocol.StorageCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseStorageCommand = function (info) {
        if (typeof info === "string") {
            BaseCommand.call(this, Command.STORAGE);
            this.setValue("string", info);
        } else {
            BaseCommand.call(this, info);
        }
        this.__data = null;
        this.__plaintext = null;
        this.__key = null;
        this.__password = null;
    };
    Class(BaseStorageCommand, BaseCommand, [StorageCommand], {
        setTitle: function (title) {
            this.setValue("title", title);
        },
        getTitle: function () {
            return this.getString("title");
        },
        setIdentifier: function (identifier) {
            this.setString("ID", identifier);
        },
        getIdentifier: function () {
            return ID.parse(this.getValue("ID"));
        },
        setData: function (data) {
            var base64 = null;
            if (data) {
                base64 = Base64.encode(data);
            }
            this.setValue("data", base64);
            this.__data = data;
            this.__plaintext = null;
        },
        getData: function () {
            if (this.__data === null) {
                var base64 = this.getString("data");
                if (base64) {
                    this.__data = Base64.decode(base64);
                }
            }
            return this.__data;
        },
        setKey: function (data) {
            var base64 = null;
            if (data) {
                base64 = Base64.encode(data);
            }
            this.setValue("key", base64);
            this.__key = data;
            this.__password = null;
        },
        getKey: function () {
            if (this.__key === null) {
                var base64 = this.getValue("key");
                if (base64) {
                    this.__key = Base64.decode(base64);
                }
            }
            return this.__key;
        },
        decrypt: function (key) {
            if (Interface.conforms(key, PrivateKey)) {
                return decrypt_password_by_private_key.call(this, key);
            }
            if (Interface.conforms(key, SymmetricKey)) {
                return decrypt_data_by_symmetric_key.call(this, key);
            }
            throw new TypeError("key error: " + key);
        }
    });
    var decrypt_password_by_private_key = function (privateKey) {
        if (this.__password === null) {
            if (Interface.conforms(privateKey, DecryptKey)) {
                this.__password = decrypt_symmetric_key.call(this, privateKey);
            } else {
                throw new TypeError("private key error: " + privateKey);
            }
        }
        return decrypt_data_by_symmetric_key.call(this, this.__password);
    };
    var decrypt_data_by_symmetric_key = function (password) {
        if (this.__plaintext === null) {
            if (!password) {
                throw new Error("symmetric key empty");
            }
            var data = this.getData();
            if (data) {
                this.__plaintext = password.decrypt(data);
            }
        }
        return this.__plaintext;
    };
    var decrypt_symmetric_key = function (decryptKey) {
        var data = this.getKey();
        if (!data) {
            return;
        }
        var key = decryptKey.decrypt(data);
        if (!key) {
            throw new Error("failed to decrypt key");
        }
        var info = JsON.decode(UTF8.decode(key));
        return SymmetricKey.parse(info);
    };
    ns.dkd.cmd.BaseStorageCommand = BaseStorageCommand;
})(DIMP);
(function (ns, fsm, startrek) {
    if (typeof ns.fsm !== "object") {
        ns.fsm = fsm;
    }
    if (typeof ns.startrek !== "object") {
        ns.startrek = startrek;
    }
})(DIMP, FiniteStateMachine, StarTrek);
(function (ns, sg) {
    if (typeof ns.dos !== "object") {
        ns.dos = sg.dos;
    }
    if (typeof ns.lnc !== "object") {
        ns.lnc = sg.lnc;
    }
    if (typeof ns.network !== "object") {
        ns.network = sg.network;
    }
    if (typeof ns.ws !== "object") {
        ns.ws = sg.ws;
    }
    if (typeof ns.mem !== "object") {
        ns.mem = {};
    }
    if (typeof ns.dbi !== "object") {
        ns.dbi = {};
    }
    if (typeof ns.database !== "object") {
        ns.database = {};
    }
})(DIMP, StarGate);
(function (ns) {
    var Interface = ns.type.Interface;
    var PrivateKeyDBI = Interface(null, null);
    PrivateKeyDBI.META = "M";
    PrivateKeyDBI.VISA = "V";
    PrivateKeyDBI.prototype.savePrivateKey = function (key, type, user) {
        throw new Error("NotImplemented");
    };
    PrivateKeyDBI.prototype.getPrivateKeysForDecryption = function (user) {
        throw new Error("NotImplemented");
    };
    PrivateKeyDBI.prototype.getPrivateKeyForSignature = function (user) {
        throw new Error("NotImplemented");
    };
    PrivateKeyDBI.prototype.getPrivateKeyForVisaSignature = function (user) {
        throw new Error("NotImplemented");
    };
    ns.dbi.PrivateKeyDBI = PrivateKeyDBI;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var MetaDBI = Interface(null, null);
    MetaDBI.prototype.getMeta = function (entity) {
        throw new Error("NotImplemented");
    };
    MetaDBI.prototype.saveMeta = function (meta, entity) {
        throw new Error("NotImplemented");
    };
    ns.dbi.MetaDBI = MetaDBI;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var DocumentDBI = Interface(null, null);
    DocumentDBI.prototype.getDocument = function (entity, type) {
        throw new Error("NotImplemented");
    };
    DocumentDBI.prototype.saveDocument = function (doc) {
        throw new Error("NotImplemented");
    };
    ns.dbi.DocumentDBI = DocumentDBI;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var UserDBI = Interface(null, null);
    UserDBI.prototype.getLocalUsers = function () {
        throw new Error("NotImplemented");
    };
    UserDBI.prototype.saveLocalUsers = function (users) {
        throw new Error("NotImplemented");
    };
    UserDBI.prototype.getContacts = function (user) {
        throw new Error("NotImplemented");
    };
    UserDBI.prototype.saveContacts = function (contacts, user) {
        throw new Error("NotImplemented");
    };
    ns.dbi.UserDBI = UserDBI;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var GroupDBI = Interface(null, null);
    GroupDBI.prototype.getFounder = function (group) {
        throw new Error("NotImplemented");
    };
    GroupDBI.prototype.getOwner = function (group) {
        throw new Error("NotImplemented");
    };
    GroupDBI.prototype.getMembers = function (group) {
        throw new Error("NotImplemented");
    };
    GroupDBI.prototype.saveMembers = function (members, group) {
        throw new Error("NotImplemented");
    };
    GroupDBI.prototype.getAssistants = function (group) {
        throw new Error("NotImplemented");
    };
    GroupDBI.prototype.saveAssistants = function (bots, group) {
        throw new Error("NotImplemented");
    };
    ns.dbi.GroupDBI = GroupDBI;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var LoginDBI = Interface(null, null);
    LoginDBI.prototype.getLoginCommandMessage = function (user) {
        throw new Error("NotImplemented");
    };
    LoginDBI.prototype.saveLoginCommandMessage = function (
        user,
        command,
        message
    ) {
        throw new Error("NotImplemented");
    };
    ns.dbi.LoginDBI = LoginDBI;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var CipherKeyDBI = ns.CipherKeyDelegate;
    var ReliableMessageDBI = Interface(null, null);
    ReliableMessageDBI.prototype.getReliableMessages = function (
        receiver,
        start,
        limit
    ) {
        throw new Error("NotImplemented");
    };
    ReliableMessageDBI.prototype.cacheReliableMessage = function (
        receiver,
        rMsg
    ) {
        throw new Error("NotImplemented");
    };
    ReliableMessageDBI.prototype.removeReliableMessage = function (
        receiver,
        rMsg
    ) {
        throw new Error("NotImplemented");
    };
    ns.dbi.ReliableMessageDBI = ReliableMessageDBI;
    ns.dbi.CipherKeyDBI = CipherKeyDBI;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var ProviderDBI = Interface(null, null);
    ProviderDBI.prototype.allNeighbors = function () {
        throw new Error("NotImplemented");
    };
    ProviderDBI.prototype.getNeighbor = function (ip, port) {
        throw new Error("NotImplemented");
    };
    ProviderDBI.prototype.addNeighbor = function (ip, port, identifier) {
        throw new Error("NotImplemented");
    };
    ProviderDBI.prototype.removeNeighbor = function (ip, port) {
        throw new Error("NotImplemented");
    };
    ns.dbi.ProviderDBI = ProviderDBI;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var DecryptKey = ns.crypto.DecryptKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var LocalStorage = ns.dos.LocalStorage;
    var PrivateKeyDBI = ns.dbi.PrivateKeyDBI;
    var PrivateKeyStorage = function () {
        Object.call(this);
    };
    Class(PrivateKeyStorage, Object, [PrivateKeyDBI], {
        savePrivateKey: function (key, type, user) {
            if (type === PrivateKeyDBI.META) {
                return this.saveIdKey(key, user);
            } else {
                return this.saveMsgKey(key, user);
            }
        },
        getPrivateKeysForDecryption: function (user) {
            var privateKeys = this.loadMsgKeys(user);
            var idKey = this.loadIdKey(user);
            if (Interface.conforms(idKey, DecryptKey)) {
                if (PrivateKeyStorage.findKey(idKey, privateKeys) < 0) {
                    privateKeys.push(idKey);
                }
            }
            return privateKeys;
        },
        getPrivateKeyForSignature: function (user) {
            return this.getPrivateKeyForVisaSignature(user);
        },
        getPrivateKeyForVisaSignature: function (user) {
            return this.loadIdKey(user);
        }
    });
    var id_key_path = function (user) {
        return "pri." + user.getRemoteAddress().toString() + ".secret";
    };
    var msg_keys_path = function (user) {
        return "pri." + user.getRemoteAddress().toString() + ".secret_keys";
    };
    PrivateKeyStorage.prototype.loadIdKey = function (user) {
        var path = id_key_path(user);
        var info = LocalStorage.loadJSON(path);
        return PrivateKey.parse(info);
    };
    PrivateKeyStorage.prototype.saveIdKey = function (key, user) {
        var path = id_key_path(user);
        return LocalStorage.saveJSON(key.toMap(), path);
    };
    PrivateKeyStorage.prototype.loadMsgKeys = function (user) {
        var privateKeys = [];
        var path = msg_keys_path(user);
        var array = LocalStorage.loadJSON(path);
        if (array) {
            var key;
            for (var i = 0; i < array.length; ++i) {
                key = PrivateKey.parse(array[i]);
                if (key) {
                    privateKeys.push(key);
                }
            }
        }
        return privateKeys;
    };
    PrivateKeyStorage.prototype.saveMsgKey = function (key, user) {
        var privateKeys = this.loadMsgKeys(user);
        privateKeys = PrivateKeyStorage.insertKey(key, privateKeys);
        if (!privateKeys) {
            return false;
        }
        var plain = PrivateKeyStorage.revertPrivateKeys(privateKeys);
        var path = msg_keys_path(user);
        return LocalStorage.saveJSON(plain, path);
    };
    PrivateKeyStorage.revertPrivateKeys = function (privateKeys) {
        var array = [];
        for (var i = 0; i < privateKeys.length; ++i) {
            array.push(privateKeys[i].toMap());
        }
        return array;
    };
    PrivateKeyStorage.insertKey = function (key, privateKeys) {
        var index = PrivateKeyStorage.findKey(key, privateKeys);
        if (index === 0) {
            return null;
        } else {
            if (index > 0) {
                privateKeys.splice(index, 1);
            } else {
                if (privateKeys.length > 2) {
                    privateKeys.pop();
                }
            }
        }
        privateKeys.unshift(key);
        return privateKeys;
    };
    PrivateKeyStorage.findKey = function (key, privateKeys) {
        var data = key.getString("data");
        for (var i = 0; i < privateKeys.length; ++i) {
            if (privateKeys[i].getString("data") === data) {
                return i;
            }
        }
        return -1;
    };
    ns.database.PrivateKeyStorage = PrivateKeyStorage;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Meta = ns.protocol.Meta;
    var LocalStorage = ns.dos.LocalStorage;
    var MetaDBI = ns.dbi.MetaDBI;
    var MetaStorage = function () {
        Object.call(this);
    };
    Class(MetaStorage, Object, [MetaDBI], null);
    MetaStorage.prototype.saveMeta = function (meta, entity) {
        var path = meta_path(entity);
        return LocalStorage.saveJSON(meta.toMap(), path);
    };
    MetaStorage.prototype.getMeta = function (entity) {
        var path = meta_path(entity);
        var info = LocalStorage.loadJSON(path);
        return Meta.parse(info);
    };
    var meta_path = function (entity) {
        return "pub." + entity.getRemoteAddress().toString() + ".meta";
    };
    ns.database.MetaStorage = MetaStorage;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var LocalStorage = ns.dos.LocalStorage;
    var MetaDBI = ns.dbi.MetaDBI;
    var DocumentStorage = function () {
        Object.call(this);
    };
    Class(DocumentStorage, Object, [MetaDBI], null);
    DocumentStorage.prototype.saveDocument = function (doc) {
        var entity = doc.getIdentifier();
        var path = doc_path(entity);
        return LocalStorage.saveJSON(doc.toMap(), path);
    };
    DocumentStorage.prototype.getDocument = function (entity) {
        var path = doc_path(entity);
        var info = LocalStorage.loadJSON(path);
        if (info) {
            return DocumentStorage.parse(info, null, null);
        } else {
            return false;
        }
    };
    var doc_path = function (entity) {
        return "pub." + entity.getRemoteAddress().toString() + ".document";
    };
    DocumentStorage.parse = function (dict, identifier, type) {
        var entity = ID.parse(dict["ID"]);
        if (!identifier) {
            identifier = entity;
        } else {
            if (!identifier.equals(entity)) {
                throw new TypeError("document error: " + dict);
            }
        }
        if (!type) {
            type = "*";
        }
        var dt = dict["type"];
        if (dt) {
            type = dt;
        }
        var data = dict["data"];
        if (!data) {
            data = dict["profile"];
        }
        var signature = dict["signature"];
        if (!data || !signature) {
            throw new ReferenceError("document error: " + dict);
        }
        return Document.create(type, identifier, data, signature);
    };
    ns.database.DocumentStorage = DocumentStorage;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Interface = ns.type.Interface;
    var Stringer = ns.type.Stringer;
    var Departure = ns.startrek.port.Departure;
    var FrequencyChecker = function (lifespan) {
        this.__records = {};
        this.__expires = lifespan;
    };
    Class(FrequencyChecker, null, [Departure], null);
    FrequencyChecker.prototype.isExpired = function (key, now) {
        if (Interface.conforms(key, Stringer)) {
            key = key.toString();
        }
        if (!now || now <= 0) {
            now = new Date().getTime();
        }
        var value = this.__records[key];
        if (value && value > now) {
            return false;
        }
        this.__records[key] = now + this.__expires;
        return true;
    };
    var QueryFrequencyChecker = {
        isMetaQueryExpired: function (identifier, now) {
            return this.metaQueries.isExpired(identifier, now);
        },
        metaQueries: null,
        isDocumentQueryExpired: function (identifier, now) {
            return this.documentQueries.isExpired(identifier, now);
        },
        documentQueries: null,
        isMembersQueryExpired: function (identifier, now) {
            return this.membersQueries.isExpired(identifier, now);
        },
        membersQueries: null,
        QUERY_EXPIRES: 600 * 1000
    };
    QueryFrequencyChecker.metaQueries = new FrequencyChecker(
        QueryFrequencyChecker.QUERY_EXPIRES
    );
    QueryFrequencyChecker.documentQueries = new FrequencyChecker(
        QueryFrequencyChecker.QUERY_EXPIRES
    );
    QueryFrequencyChecker.membersQueries = new FrequencyChecker(
        QueryFrequencyChecker.QUERY_EXPIRES
    );
    ns.mem.FrequencyChecker = FrequencyChecker;
    ns.mem.QueryFrequencyChecker = QueryFrequencyChecker;
})(DIMP);
(function (ns) {
    var Thread = ns.fsm.threading.Thread;
    var CacheHolder = function (value, lifeSpan, now) {
        this.__value = value;
        this.__lifeSpan = lifeSpan;
        if (!now || now <= 0) {
            now = new Date().getTime();
        }
        this.__expired = now + lifeSpan;
        this.__deprecated = now + (lifeSpan << 1);
    };
    CacheHolder.prototype.getValue = function () {
        return this.__value;
    };
    CacheHolder.prototype.update = function (value, now) {
        this.__value = value;
        if (!now || now <= 0) {
            now = new Date().getTime();
        }
        this.__expired = now + this.__lifeSpan;
        this.__deprecated = now + (this.__lifeSpan << 1);
    };
    CacheHolder.prototype.isAlive = function (now) {
        if (!now || now <= 0) {
            now = new Date().getTime();
        }
        return now < this.__expired;
    };
    CacheHolder.prototype.isDeprecated = function (now) {
        if (!now || now <= 0) {
            now = new Date().getTime();
        }
        return now > this.__deprecated;
    };
    CacheHolder.prototype.renewal = function (duration, now) {
        if (!duration || duration <= 0) {
            duration = 128 * 1000;
        }
        if (!now || now <= 0) {
            now = new Date().getTime();
        }
        this.__expired = now + duration;
        this.__deprecated = now + (this.__lifeSpan << 1);
    };
    var CachePair = function (value, holder) {
        this.value = value;
        this.holder = holder;
    };
    var CachePool = function () {
        this.__holders = {};
    };
    CachePool.prototype.getKeys = function () {
        return Object.keys(this.__holders);
    };
    CachePool.prototype.update = function (key, value, lifeSpan, now) {
        var holder;
        if (value instanceof CacheHolder) {
            holder = value;
        } else {
            holder = new CacheHolder(value, lifeSpan, now);
        }
        this.__holders[key] = holder;
        return holder;
    };
    CachePool.prototype.erase = function (key, now) {
        var old = null;
        if (now && now > 0) {
            old = this.fetch(key, now);
        }
        delete this.__holders[key];
        return old;
    };
    CachePool.prototype.fetch = function (key, now) {
        var holder = this.__holders[key];
        if (!holder) {
            return null;
        } else {
            if (holder.isAlive(now)) {
                return new CachePair(holder.getValue(), holder);
            } else {
                return new CachePair(null, holder);
            }
        }
    };
    CachePool.prototype.purge = function (now) {
        if (!now || now <= 0) {
            now = new Date().getTime();
        }
        var count = 0;
        var allKeys = this.getKeys();
        var holder, key;
        for (var i = 0; i < allKeys.length; ++i) {
            key = allKeys[i];
            holder = this.__holders[key];
            if (!holder || holder.isDeprecated(now)) {
                delete this.__holders[key];
                ++count;
            }
        }
        return count;
    };
    var CacheManager = {
        getInstance: function () {
            if (!running) {
                this.start();
            }
            return this;
        },
        start: function () {
            force_stop();
            running = true;
            var thr = new Thread(this.run);
            thr.start();
            thread = thr;
        },
        stop: function () {
            force_stop();
        },
        run: function () {
            if (!running) {
                return false;
            }
            var now = new Date().getTime();
            if (now > nextTime) {
                nextTime = now + 300 * 1000;
                try {
                    this.purge(now);
                } catch (e) {
                    console.error("CacheManager::run()", e);
                }
            }
            return true;
        },
        purge: function (now) {
            var count = 0;
            var names = Object.keys(pools);
            var p;
            for (var i = 0; i < names.length; ++i) {
                p = pools[names[i]];
                if (p) {
                    count += p.purge(now);
                }
            }
            return count;
        },
        getPool: function (name) {
            var p = pools[name];
            if (!p) {
                p = new CachePool();
                pools[name] = p;
            }
            return p;
        }
    };
    var pools = {};
    var thread = null;
    var running = false;
    var nextTime = 0;
    var force_stop = function () {
        running = false;
        var thr = thread;
        if (thr) {
            thread = null;
            thr.stop();
        }
    };
    ns.mem.CacheHolder = CacheHolder;
    ns.mem.CachePool = CachePool;
    ns.mem.CacheManager = CacheManager;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Transmitter = Interface(null, null);
    Transmitter.prototype.sendContent = function (
        sender,
        receiver,
        content,
        priority
    ) {
        throw new Error("NotImplemented");
    };
    Transmitter.prototype.sendInstantMessage = function (iMsg, priority) {
        throw new Error("NotImplemented");
    };
    Transmitter.prototype.sendReliableMessage = function (rMsg, priority) {
        throw new Error("NotImplemented");
    };
    ns.network.Transmitter = Transmitter;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Transmitter = ns.network.Transmitter;
    var Session = Interface(null, [Transmitter]);
    Session.prototype.getDatabase = function () {
        throw new Error("NotImplemented");
    };
    Session.prototype.getRemoteAddress = function () {
        throw new Error("NotImplemented");
    };
    Session.prototype.getKey = function () {
        throw new Error("NotImplemented");
    };
    Session.prototype.setIdentifier = function (identifier) {
        throw new Error("NotImplemented");
    };
    Session.prototype.getIdentifier = function () {
        throw new Error("NotImplemented");
    };
    Session.prototype.setActive = function (active, when) {
        throw new Error("NotImplemented");
    };
    Session.prototype.isActive = function () {
        throw new Error("NotImplemented");
    };
    Session.prototype.queueMessagePackage = function (rMsg, data, priority) {
        throw new Error("NotImplemented");
    };
    ns.network.Session = Session;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Departure = ns.startrek.port.Departure;
    var MessageWrapper = function (rMsg, departure) {
        this.__msg = rMsg;
        this.__ship = departure;
    };
    Class(MessageWrapper, null, [Departure], null);
    MessageWrapper.prototype.getMessage = function () {
        return this.__msg;
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
    MessageWrapper.prototype.isImportant = function () {
        return this.__ship.isImportant();
    };
    MessageWrapper.prototype.touch = function (now) {
        return this.__ship.touch(now);
    };
    MessageWrapper.prototype.getStatus = function (now) {
        return this.__ship.getStatus(now);
    };
    ns.network.MessageWrapper = MessageWrapper;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Arrays = ns.type.Arrays;
    var MessageWrapper = ns.network.MessageWrapper;
    var MessageQueue = function () {
        this.__priorities = [];
        this.__fleets = {};
    };
    Class(MessageQueue, null, null, null);
    MessageQueue.prototype.append = function (rMsg, departure) {
        var priority = departure.getPriority();
        var array = this.__fleets[priority];
        if (array) {
            var signature = rMsg.getValue("signature");
            var item;
            for (var i = array.length - 1; i >= 0; --i) {
                item = array[i].getMessage();
                if (item && item.getValue("signature") === signature) {
                    return false;
                }
            }
        } else {
            array = [];
            this.__fleets[priority] = array;
            insert_priority(priority, this.__priorities);
        }
        array.push(new MessageWrapper(rMsg, departure));
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
        Arrays.insert(priorities, index, prior);
    };
    MessageQueue.prototype.next = function () {
        var priority;
        var array;
        for (var i = 0; i < this.__priorities.length; ++i) {
            priority = this.__priorities[i];
            array = this.__fleets[priority];
            if (array && array.length > 0) {
                return array.shift();
            }
        }
        return null;
    };
    MessageQueue.prototype.purge = function () {
        var priority;
        var array;
        for (var i = this.__priorities.length - 1; i >= 0; --i) {
            priority = this.__priorities[i];
            array = this.__fleets[priority];
            if (!array) {
                this.__priorities.splice(i, 1);
            } else {
                if (array.length === 0) {
                    delete this.__fleets[priority];
                    this.__priorities.splice(i, 1);
                }
            }
        }
        return null;
    };
    ns.network.MessageQueue = MessageQueue;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Runner = ns.fsm.skywalker.Runner;
    var InetSocketAddress = ns.startrek.type.InetSocketAddress;
    var DockerDelegate = ns.startrek.port.DockerDelegate;
    var PlainDeparture = ns.startrek.PlainDeparture;
    var WSClientGate = ns.startrek.WSClientGate;
    var ClientHub = ns.ws.ClientHub;
    var MessageQueue = ns.network.MessageQueue;
    var GateKeeper = function (host, port) {
        Runner.call(this);
        this.__remote = new InetSocketAddress(host, port);
        this.__gate = this.createGate(this.__remote);
        this.__queue = new MessageQueue();
        this.__active = false;
        this.__last_active = 0;
    };
    Class(GateKeeper, Runner, [DockerDelegate], null);
    GateKeeper.prototype.createGate = function (remote) {
        var gate = new WSClientGate(this);
        var hub = this.createHub(gate, remote);
        gate.setHub(hub);
        return gate;
    };
    GateKeeper.prototype.createHub = function (delegate, remote) {
        var hub = new ClientHub(delegate);
        hub.connect(remote, null);
        return hub;
    };
    GateKeeper.prototype.getRemoteAddress = function () {
        return this.__remote;
    };
    GateKeeper.prototype.getGate = function () {
        return this.__gate;
    };
    GateKeeper.prototype.isActive = function () {
        return this.__active;
    };
    GateKeeper.prototype.setActive = function (active, when) {
        if (this.__active === active) {
            return false;
        }
        if (!when || when <= 0) {
            when = new Date().getTime();
        } else {
            if (when <= this.__last_active) {
                return false;
            }
        }
        this.__active = active;
        this.__last_active = when;
        return true;
    };
    GateKeeper.prototype.isRunning = function () {
        if (Runner.prototype.isRunning.call(this)) {
            return this.__gate.isRunning();
        } else {
            return false;
        }
    };
    GateKeeper.prototype.stop = function () {
        Runner.prototype.stop.call(this);
        this.__gate.stop();
    };
    GateKeeper.prototype.setup = function () {
        Runner.prototype.setup.call(this);
        this.__gate.start();
    };
    GateKeeper.prototype.finish = function () {
        this.__gate.stop();
        Runner.prototype.finish.call(this);
    };
    GateKeeper.prototype.process = function () {
        var gate = this.__gate;
        var hub = gate.getHub();
        try {
            var incoming = hub.process();
            var outgoing = gate.process();
            if (incoming || outgoing) {
                return true;
            }
        } catch (e) {
            console.error("GateKeeper::process()", e);
            return false;
        }
        if (!this.isActive()) {
            this.__queue.purge();
            return false;
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
        var ok = gate.sendShip(wrapper, this.__remote, null);
        if (!ok) {
            console.error("gate error, failed to send data", this.__remote);
        }
        return true;
    };
    GateKeeper.prototype.dockerPack = function (payload, priority) {
        return new PlainDeparture(payload, priority);
    };
    GateKeeper.prototype.queueAppend = function (rMsg, departure) {
        return this.__queue.append(rMsg, departure);
    };
    GateKeeper.prototype.onDockerStatusChanged = function (
        previous,
        current,
        docker
    ) {
        console.info(
            "GateKeeper::onDockerStatusChanged()",
            previous,
            current,
            docker
        );
    };
    GateKeeper.prototype.onDockerReceived = function (arrival, docker) {
        console.info("GateKeeper::onDockerReceived()", arrival, docker);
    };
    GateKeeper.prototype.onDockerSent = function (departure, docker) {};
    GateKeeper.prototype.onDockerFailed = function (error, departure, docker) {
        console.info("GateKeeper::onDockerFailed()", error, departure, docker);
    };
    GateKeeper.prototype.onDockerError = function (error, departure, docker) {
        console.info("GateKeeper::onDockerError()", error, departure, docker);
    };
    ns.network.GateKeeper = GateKeeper;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var DockerDelegate = ns.startrek.port.DockerDelegate;
    var Transmitter = ns.network.Transmitter;
    var MessageWrapper = ns.network.MessageWrapper;
    var GateKeeper = ns.network.GateKeeper;
    var EntityType = ns.protocol.EntityType;
    var BaseSession = function (host, port, db) {
        GateKeeper.call(this, host, port);
        this.__db = db;
        this.__id = null;
        this.__messenger = null;
    };
    Class(BaseSession, GateKeeper, [DockerDelegate, Transmitter], {
        queueMessagePackage: function (rMsg, data, priority) {
            var ship = this.dockerPack(data, priority);
            this.queueAppend(rMsg, ship);
        }
    });
    BaseSession.prototype.getDatabase = function () {
        return this.__db;
    };
    BaseSession.prototype.getIdentifier = function () {
        return this.__id;
    };
    BaseSession.prototype.setIdentifier = function (identifier) {
        this.__id = identifier;
    };
    BaseSession.prototype.getMessenger = function () {
        return this.__messenger;
    };
    BaseSession.prototype.setMessenger = function (messenger) {
        this.__messenger = messenger;
    };
    BaseSession.prototype.sendContent = function (
        sender,
        receiver,
        content,
        priority
    ) {
        var messenger = this.getMessenger();
        return messenger.sendContent(sender, receiver, content, priority);
    };
    BaseSession.prototype.sendInstantMessage = function (iMsg, priority) {
        var messenger = this.getMessenger();
        return messenger.sendInstantMessage(iMsg, priority);
    };
    BaseSession.prototype.sendReliableMessage = function (rMsg, priority) {
        var messenger = this.getMessenger();
        return messenger.sendReliableMessage(rMsg, priority);
    };
    BaseSession.prototype.onDockerSent = function (departure, docker) {
        if (departure instanceof MessageWrapper) {
            var rMsg = departure.getMessage();
            if (rMsg) {
                var messenger = this.getMessenger();
                removeReliableMessage(
                    rMsg,
                    this.getIdentifier(),
                    messenger.getDatabase()
                );
            }
        }
    };
    var removeReliableMessage = function (rMsg, receiver, db) {
        if (!receiver || EntityType.STATION.equals(receiver.getType())) {
            receiver = rMsg.getReceiver();
        }
    };
    ns.network.BaseSession = BaseSession;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Hex = ns.format.Hex;
    var Base58 = ns.format.Base58;
    var EntityType = ns.protocol.EntityType;
    var ID = ns.protocol.ID;
    var BTCAddress = ns.mkm.BTCAddress;
    var ETHAddress = ns.mkm.ETHAddress;
    var Anonymous = {
        getName: function (identifier) {
            var name;
            if (Interface.conforms(identifier, ID)) {
                name = identifier.getName();
                if (!name || name.length === 0) {
                    name = get_name(identifier.getType());
                }
            } else {
                name = get_name(identifier.getType());
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
            if (Interface.conforms(address, ID)) {
                address = address.getAddress();
            }
            if (address instanceof BTCAddress) {
                return btc_number(address.toString());
            }
            if (address instanceof ETHAddress) {
                return eth_number(address.toString());
            }
            throw new TypeError("address error: " + address.toString());
        }
    };
    var get_name = function (type) {
        if (EntityType.BOT.equals(type)) {
            return "Bot";
        }
        if (EntityType.STATION.equals(type)) {
            return "Station";
        }
        if (EntityType.ISP.equals(type)) {
            return "ISP";
        }
        if (EntityType.isUser(type)) {
            return "User";
        }
        if (EntityType.isGroup(type)) {
            return "Group";
        }
        return "Unknown";
    };
    var btc_number = function (address) {
        var data = Base58.decode(address);
        return user_number(data);
    };
    var eth_number = function (address) {
        var data = Hex.decode(address.substr(2));
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
})(DIMP);
(function (ns) {
    var PrivateKey = ns.crypto.PrivateKey;
    var ID = ns.protocol.ID;
    var EntityType = ns.protocol.EntityType;
    var MetaType = ns.protocol.MetaType;
    var Meta = ns.protocol.Meta;
    var BaseVisa = ns.mkm.BaseVisa;
    var BaseBulletin = ns.mkm.BaseBulletin;
    var Register = function (db) {
        this.__db = db;
    };
    Register.prototype.createUser = function (nickname, avatar) {
        var privateKey = PrivateKey.generate(PrivateKey.RSA);
        var meta = Meta.generate(MetaType.DEFAULT, privateKey, "web-demo");
        var uid = ID.generate(meta, EntityType.USER, null);
        var pKey = privateKey.getPublicKey();
        var doc = createVisa(uid, nickname, avatar, pKey, privateKey);
        this.__db.saveMeta(meta, uid);
        this.__db.savePrivateKey(uid, privateKey, "M", 1, 1);
        this.__db.saveDocument(doc);
        return uid;
    };
    Register.prototype.createGroup = function (founder, title) {
        var r = Math.ceil(Math.random() * 999990000) + 10000;
        var seed = "Group-" + r;
        var privateKey = this.__db.getPrivateKeyForVisaSignature(founder);
        var meta = Meta.generate(MetaType.DEFAULT, privateKey, seed);
        var gid = ID.generate(meta, EntityType.GROUP, null);
        var doc = createBulletin(gid, title, privateKey);
        this.__db.saveMeta(meta, gid);
        this.__db.saveDocument(doc);
        this.__db.addMember(founder, gid);
        return gid;
    };
    var createVisa = function (identifier, name, avatarUrl, pKey, sKey) {
        var doc = new BaseVisa(identifier);
        doc.setName(name);
        doc.setAvatar(avatarUrl);
        doc.setKey(pKey);
        doc.sign(sKey);
        return doc;
    };
    var createBulletin = function (identifier, name, sKey) {
        var doc = new BaseBulletin(identifier);
        doc.setName(name);
        doc.sign(sKey);
        return doc;
    };
    ns.Register = Register;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var AddressNameService = ns.AddressNameService;
    var AddressNameServer = function () {
        Object.call(this);
        var caches = {
            all: ID.EVERYONE,
            everyone: ID.EVERYONE,
            anyone: ID.ANYONE,
            owner: ID.ANYONE,
            founder: ID.FOUNDER
        };
        var reserved = {};
        var keywords = AddressNameService.KEYWORDS;
        for (var i = 0; i < keywords.length; ++i) {
            reserved[keywords[i]] = true;
        }
        this.__reserved = reserved;
        this.__caches = caches;
        this.__tables = {};
    };
    Class(AddressNameServer, Object, [AddressNameService], null);
    AddressNameServer.prototype.isReserved = function (name) {
        return this.__reserved[name] === true;
    };
    AddressNameServer.prototype.cache = function (name, identifier) {
        if (this.isReserved(name)) {
            return false;
        }
        if (identifier) {
            this.__caches[name] = identifier;
            delete this.__tables[identifier.toString()];
        } else {
            delete this.__caches[name];
            this.__tables = {};
        }
        return true;
    };
    AddressNameServer.prototype.getIdentifier = function (name) {
        return this.__caches[name];
    };
    AddressNameServer.prototype.getNames = function (identifier) {
        var array = this.__tables[identifier.toString()];
        if (array === null) {
            array = [];
            var keys = Object.keys(this.__caches);
            var name;
            for (var i = 0; i < keys.length; ++i) {
                name = keys[i];
                if (this.__caches[name] === identifier) {
                    array.push(name);
                }
            }
            this.__tables[identifier.toString()] = array;
        }
        return array;
    };
    AddressNameServer.prototype.save = function (name, identifier) {
        return this.cache(name, identifier);
    };
    ns.AddressNameServer = AddressNameServer;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Facebook = ns.Facebook;
    var CommonFacebook = function (db) {
        Facebook.call(this);
        this.__db = db;
        this.__current = null;
    };
    Class(CommonFacebook, Facebook, null, {
        getLocalUsers: function () {
            var localUsers = [];
            var user;
            var array = this.__db.getLocalUsers();
            if (array && array.length > 0) {
                for (var i = 0; i < array.length; ++i) {
                    user = this.getUser(array[i]);
                    localUsers.push(user);
                }
            }
            return localUsers;
        },
        getCurrentUser: function () {
            var user = this.__current;
            if (!user) {
                var localUsers = this.getLocalUsers();
                if (localUsers.length > 0) {
                    user = localUsers[0];
                    this.__current = user;
                }
            }
            return user;
        },
        createUser: function (identifier) {
            if (!identifier.isBroadcast()) {
                if (!this.getPublicKeyForEncryption(identifier)) {
                    return null;
                }
            }
            return Facebook.prototype.createUser.call(this, identifier);
        },
        createGroup: function (identifier) {
            if (!identifier.isBroadcast()) {
                if (!this.getMeta(identifier)) {
                    return null;
                }
            }
            return Facebook.prototype.createGroup.call(this, identifier);
        }
    });
    CommonFacebook.prototype.getDatabase = function () {
        return this.__db;
    };
    CommonFacebook.prototype.setCurrentUser = function (user) {
        this.__current = user;
    };
    CommonFacebook.prototype.saveMeta = function (meta, identifier) {
        return this.__db.saveMeta(meta, identifier);
    };
    CommonFacebook.prototype.saveDocument = function (doc) {
        return this.__db.saveDocument(doc);
    };
    CommonFacebook.prototype.saveMembers = function (members, group) {
        return this.__db.saveMembers(members, group);
    };
    CommonFacebook.prototype.saveAssistants = function (bots, group) {
        this.__db.saveAssistants(bots, group);
    };
    CommonFacebook.prototype.getMeta = function (identifier) {
        return this.__db.getMeta(identifier);
    };
    CommonFacebook.prototype.getDocument = function (identifier, type) {
        return this.__db.getDocument(identifier, type);
    };
    CommonFacebook.prototype.getContacts = function (user) {
        return this.__db.getContacts(user);
    };
    CommonFacebook.prototype.getPrivateKeysForDecryption = function (user) {
        return this.__db.getPrivateKeysForDecryption(user);
    };
    CommonFacebook.prototype.getPrivateKeyForSignature = function (user) {
        return this.__db.getPrivateKeyForSignature(user);
    };
    CommonFacebook.prototype.getPrivateKeyForVisaSignature = function (user) {
        return this.__db.getPrivateKeyForVisaSignature(user);
    };
    CommonFacebook.prototype.getFounder = function (group) {
        var founder = this.__db.getFounder(group);
        if (founder) {
            return founder;
        }
        return Facebook.prototype.getFounder.call(this, group);
    };
    CommonFacebook.prototype.getOwner = function (group) {
        var owner = this.__db.getOwner(group);
        if (owner) {
            return owner;
        }
        return Facebook.prototype.getOwner.call(this, group);
    };
    CommonFacebook.prototype.getMembers = function (group) {
        var members = this.__db.getMembers(group);
        if (members && members.length > 0) {
            return members;
        }
        return Facebook.prototype.getMembers.call(this, group);
    };
    CommonFacebook.prototype.getAssistants = function (group) {
        var bots = this.__db.getAssistants(group);
        if (bots && bots.length > 0) {
            return bots;
        }
        return Facebook.prototype.getAssistants.call(this, group);
    };
    ns.CommonFacebook = CommonFacebook;
})(DIMP);
(function (ns) {
    var Command = ns.protocol.Command;
    var CommandFactory = ns.CommandFactory;
    var HandshakeCommand = ns.dkd.cmd.HandshakeCommand;
    var ReceiptCommand = ns.dkd.cmd.ReceiptCommand;
    var LoginCommand = ns.dkd.cmd.LoginCommand;
    var ReportCommand = ns.dkd.cmd.ReportCommand;
    var MuteCommand = ns.dkd.cmd.MuteCommand;
    var BlockCommand = ns.dkd.cmd.BlockCommand;
    var SearchCommand = ns.dkd.cmd.SearchCommand;
    var StorageCommand = ns.dkd.cmd.StorageCommand;
    var registerAllFactories = ns.registerAllFactories;
    var registerExtraCommandFactories = function () {
        Command.setFactory(Command.HANDSHAKE, new CommandFactory(HandshakeCommand));
        Command.setFactory(Command.RECEIPT, new CommandFactory(ReceiptCommand));
        Command.setFactory(Command.LOGIN, new CommandFactory(LoginCommand));
        Command.setFactory(Command.REPORT, new CommandFactory(ReportCommand));
        Command.setFactory("broadcast", new CommandFactory(ReportCommand));
        Command.setFactory(Command.ONLINE, new CommandFactory(ReportCommand));
        Command.setFactory(Command.OFFLINE, new CommandFactory(ReportCommand));
        Command.setFactory(Command.MUTE, new CommandFactory(MuteCommand));
        Command.setFactory(Command.BLOCK, new CommandFactory(BlockCommand));
        Command.setFactory(Command.SEARCH, new CommandFactory(SearchCommand));
        Command.setFactory(Command.ONLINE_USERS, new CommandFactory(SearchCommand));
        Command.setFactory(Command.STORAGE, new CommandFactory(StorageCommand));
        Command.setFactory(Command.CONTACTS, new CommandFactory(StorageCommand));
        Command.setFactory(Command.PRIVATE_KEY, new CommandFactory(StorageCommand));
    };
    registerAllFactories();
    registerExtraCommandFactories();
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = ns.crypto.PlainKey;
    var CipherKeyDelegate = ns.CipherKeyDelegate;
    var KeyStore = function () {
        Object.call(this);
        this.__keyMap = {};
        this.keyTable = null;
    };
    Class(KeyStore, Object, [CipherKeyDelegate], null);
    KeyStore.prototype.getCipherKey = function (sender, receiver, generate) {
        if (receiver.isBroadcast()) {
            return PlainKey.getInstance();
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
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var GroupCommand = ns.protocol.GroupCommand;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var QueryFrequencyChecker = ns.mem.QueryFrequencyChecker;
    var Messenger = ns.Messenger;
    var CommonMessenger = function (session, facebook, db) {
        Messenger.call(this);
        this.__session = session;
        this.__facebook = facebook;
        this.__db = db;
        this.__packer = null;
        this.__processor = null;
    };
    Class(CommonMessenger, Messenger, null, {
        sendContent: function (sender, receiver, content, priority) {
            if (!sender) {
                var current = this.__facebook.getCurrentUser();
                sender = current.getIdentifier();
            }
            var env = Envelope.create(sender, receiver, null);
            var iMsg = InstantMessage.create(env, content);
            var rMsg = this.sendInstantMessage(iMsg, priority);
            return [iMsg, rMsg];
        },
        sendInstantMessage: function (iMsg, priority) {
            var sMsg = this.encryptMessage(iMsg);
            if (!sMsg) {
                return null;
            }
            var rMsg = this.signMessage(sMsg);
            if (!rMsg) {
                throw new ReferenceError("failed to sign message: " + iMsg);
            }
            if (this.sendReliableMessage(rMsg, priority)) {
                return rMsg;
            }
            return null;
        },
        sendReliableMessage: function (rMsg, priority) {
            var data = this.serializeMessage(rMsg);
            return this.__session.queueMessagePackage(rMsg, data, priority);
        }
    });
    CommonMessenger.prototype.getSession = function () {
        return this.__session;
    };
    CommonMessenger.prototype.getEntityDelegate = function () {
        return this.__facebook;
    };
    CommonMessenger.prototype.getFacebook = function () {
        return this.__facebook;
    };
    CommonMessenger.prototype.getDatabase = function () {
        return this.__db;
    };
    CommonMessenger.prototype.getCipherKeyDelegate = function () {
        return this.__db;
    };
    CommonMessenger.prototype.getPacker = function () {
        return this.__packer;
    };
    CommonMessenger.prototype.setPacker = function (packer) {
        this.__packer = packer;
    };
    CommonMessenger.prototype.getProcessor = function () {
        return this.__processor;
    };
    CommonMessenger.prototype.setProcessor = function (processor) {
        this.__processor = processor;
    };
    CommonMessenger.prototype.queryMeta = function (identifier) {
        throw new Error("NotImplemented");
    };
    CommonMessenger.prototype.queryDocument = function (identifier) {
        throw new Error("NotImplemented");
    };
    CommonMessenger.prototype.queryMembers = function (identifier) {
        if (QueryFrequencyChecker.isMembersQueryExpired(identifier, 0)) {
            return false;
        }
        var bots = this.__facebook.getAssistants(identifier);
        if (!bots || bots.length === 0) {
            return false;
        }
        var cmd = GroupCommand.query(identifier);
        send_group_command.call(this, cmd, bots);
        return true;
    };
    var send_group_command = function (cmd, members) {
        for (var i = 0; i < members.length; ++i) {
            this.sendContent(null, members[i], cmd, 0);
        }
    };
    CommonMessenger.prototype.checkSender = function (rMsg) {
        var sender = rMsg.getSender();
        var visa = rMsg.getVisa();
        if (visa) {
            return true;
        }
        var visaKey = this.__facebook.getPublicKeyForEncryption(sender);
        if (visaKey) {
            return visaKey;
        }
        if (this.queryDocument(sender)) {
            console.info("CommandMessenger::checkSender(), queryDocument", sender);
        }
        rMsg.setValue("error", {
            message: "verify key not found",
            user: sender.toString()
        });
        return false;
    };
    CommonMessenger.prototype.checkReceiver = function (iMsg) {
        var receiver = iMsg.getReceiver();
        if (receiver.isBroadcast()) {
            return true;
        }
        if (receiver.isUser()) {
            if (this.queryDocument(receiver)) {
                console.info(
                    "CommandMessenger::checkReceiver(), queryDocument",
                    receiver
                );
            }
            iMsg.setValue("error", {
                message: "encrypt key not found",
                user: receiver.toString()
            });
            return false;
        } else {
            var meta = this.__facebook.getMeta(receiver);
            if (!meta) {
                if (this.queryMeta(receiver)) {
                    console.info(
                        "CommandMessenger::checkReceiver(), queryMeta",
                        receiver
                    );
                }
                iMsg.setValue("error", {
                    message: "group meta not found",
                    user: receiver.toString()
                });
                return false;
            }
            var members = this.__facebook.getMembers(receiver);
            if (!members || members.length === 0) {
                if (this.queryMembers(receiver)) {
                    console.info(
                        "CommandMessenger::checkReceiver(), queryMembers",
                        receiver
                    );
                }
                iMsg.setValue("error", {
                    message: "members not found",
                    user: receiver.toString()
                });
                return false;
            }
            var waiting = [];
            var item;
            for (var i = 0; i < members.length; ++i) {
                item = members[i];
                if (this.__facebook.getPublicKeyForEncryption(item)) {
                    continue;
                }
                if (this.queryDocument(item)) {
                    console.info(
                        "CommandMessenger::checkReceiver(), queryDocument for member",
                        item,
                        receiver
                    );
                }
                waiting.push(item);
            }
            if (waiting.length > 0) {
                iMsg.setValue("error", {
                    message: "encrypt keys not found",
                    group: receiver.toString(),
                    members: ID.revert(waiting)
                });
                return false;
            }
        }
        return true;
    };
    CommonMessenger.prototype.encryptMessage = function (iMsg) {
        if (!this.checkReceiver(iMsg)) {
            console.warn("receiver not ready", iMsg.getReceiver());
            return null;
        }
        return Messenger.prototype.encryptMessage.call(this, iMsg);
    };
    CommonMessenger.prototype.verifyMessage = function (rMsg) {
        if (!this.checkSender(rMsg)) {
            console.warn("sender not ready", rMsg.getReceiver());
            return null;
        }
        return Messenger.prototype.verifyMessage.call(this, rMsg);
    };
    ns.CommonMessenger = CommonMessenger;
})(DIMP);
