/**
 *  DIM-Common (v1.0.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Nov. 27, 2024
 * @copyright (c) 2024 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
(function (ns, fsm, startrek) {
    'use strict';
    if (typeof ns.fsm !== 'object') {
        ns.fsm = fsm
    }
    if (typeof ns.startrek !== 'object') {
        ns.startrek = startrek
    }
})(DIMP, FiniteStateMachine, StarTrek);
(function (ns, sg) {
    'use strict';
    if (typeof ns.dos !== 'object') {
        ns.dos = sg.dos
    }
    if (typeof ns.lnc !== 'object') {
        ns.lnc = sg.lnc
    }
    if (typeof ns.network !== 'object') {
        ns.network = sg.network
    }
    if (typeof ns.ws !== 'object') {
        ns.ws = sg.ws
    }
    if (typeof ns.mem !== 'object') {
        ns.mem = {}
    }
    if (typeof ns.dbi !== 'object') {
        ns.dbi = {}
    }
    if (typeof ns.group !== 'object') {
        ns.group = {}
    }
    if (typeof ns.database !== 'object') {
        ns.database = {}
    }
})(DIMP, StarGate);
(function (ns) {
    'use strict';
    var IObject = ns.type.Object;
    var Enum = ns.type.Enum;
    var MetaType = Enum('MetaType', {
        DEFAULT: (0x01),
        MKM: (0x01),
        BTC: (0x02),
        ExBTC: (0x03),
        ETH: (0x04),
        ExETH: (0x05)
    });
    var toString = function (type) {
        type = Enum.getInt(type);
        return type.toString()
    };
    var hasSeed = function (type) {
        type = parseNumber(type, 0);
        var mkm = MetaType.MKM.getValue();
        return type > 0 && (type & mkm) === mkm
    };
    var parseNumber = function (type, defaultValue) {
        if (type === null) {
            return defaultValue
        } else if (IObject.isNumber(type)) {
            return type
        } else if (IObject.isString(type)) {
            if (type === 'MKM' || type === 'mkm') {
                return 1
            } else if (type === 'BTC' || type === 'btc') {
                return 2
            } else if (type === 'ETH' || type === 'eth') {
                return 4
            }
        } else if (Enum.isEnum(type)) {
            return type.getValue()
        } else {
            return -1
        }
        try {
            return parseInt(type)
        } catch (e) {
            return -1
        }
    };
    MetaType.toString = toString;
    MetaType.hasSeed = hasSeed;
    MetaType.parseInt = parseNumber;
    ns.protocol.MetaType = MetaType
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var IObject = ns.type.Object;
    var Command = ns.protocol.Command;
    var MetaCommand = ns.protocol.MetaCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var MetaType = ns.protocol.MetaType;
    var fixMetaAttachment = function (rMsg) {
        var meta = rMsg.getValue('meta');
        if (meta) {
            fixMetaVersion(meta)
        }
    };
    var fixMetaVersion = function (meta) {
        var type = meta['type'];
        if (!type) {
            type = meta['version']
        } else if (IObject.isString(type) && !meta['algorithm']) {
            if (type.length > 2) {
                meta['algorithm'] = type
            }
        }
        var version = MetaType.parseInt(type, 0);
        if (version > 0) {
            meta['type'] = version;
            meta['version'] = version
        }
    };
    var fixCommand = function (content) {
        content = fixCmd(content);
        if (Interface.conforms(content, MetaCommand)) {
            var meta = content.getValue('meta');
            if (meta) {
                fixMetaVersion(meta)
            }
        } else if (Interface.conforms(content, ReceiptCommand)) {
            fixReceiptCommand(content)
        }
        return content
    };
    var fixCmd = function (content) {
        var cmd = content.getString('cmd', null);
        if (!cmd || cmd.length === 0) {
            cmd = content.getString('command', cmd);
            content.setValue('cmd', cmd)
        } else if (!content.getValue('command')) {
            content.setValue('command', cmd);
            content = Command.parse(content.toMap())
        }
        return content
    };
    var fixReceiptCommand = function (content) {
    };
    ns.Compatible = {
        fixMetaAttachment: fixMetaAttachment,
        fixMetaVersion: fixMetaVersion,
        fixCommand: fixCommand,
        fixCmd: fixCmd,
        fixReceiptCommand: fixReceiptCommand
    }
})(DIMP);
(function (ns) {
    'use strict';
    var NetworkType = ns.type.Enum(null, {
        BTC_MAIN: (0x00),
        MAIN: (0x08),
        GROUP: (0x10),
        POLYLOGUE: (0x10),
        CHATROOM: (0x30),
        PROVIDER: (0x76),
        STATION: (0x88),
        BOT: (0xC8),
        THING: (0x80)
    });
    var EntityType = ns.protocol.EntityType;
    NetworkType.getEntityType = function (network) {
        if (NetworkType.MAIN.equals(network)) {
            return EntityType.USER.getValue()
        } else if (NetworkType.GROUP.equals(network)) {
            return EntityType.GROUP.getValue()
        } else if (NetworkType.CHATROOM.equals(network)) {
            return EntityType.GROUP.getValue() | EntityType.CHATROOM.getValue()
        } else if (NetworkType.STATION.equals(network)) {
            return EntityType.STATION.getValue()
        } else if (NetworkType.PROVIDER.equals(network)) {
            return EntityType.ISP.getValue()
        } else if (NetworkType.BOT.equals(network)) {
            return EntityType.BOT.getValue()
        }
        return network
    };
    ns.protocol.NetworkID = NetworkType
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ConstantString = ns.type.ConstantString;
    var Address = ns.protocol.Address;
    var BaseAddressFactory = ns.mkm.BaseAddressFactory;
    var BTCAddress = ns.mkm.BTCAddress;
    var ETHAddress = ns.mkm.ETHAddress;
    var UnknownAddress = function (string) {
        ConstantString.call(this, string)
    };
    Class(UnknownAddress, ConstantString, [Address], {
        getType: function () {
            return 0
        }
    });
    var CompatibleAddressFactory = function () {
        BaseAddressFactory.call(this)
    };
    Class(CompatibleAddressFactory, BaseAddressFactory, null, null);
    CompatibleAddressFactory.prototype.createAddress = function (address) {
        if (!address) {
            return null
        }
        var len = address.length;
        if (len === 8) {
            if (address.toLowerCase() === 'anywhere') {
                return Address.ANYWHERE
            }
        } else if (len === 10) {
            if (address.toLowerCase() === 'everywhere') {
                return Address.EVERYWHERE
            }
        }
        var res;
        if (26 <= len && len <= 35) {
            res = BTCAddress.parse(address)
        } else if (len === 42) {
            res = ETHAddress.parse(address)
        } else {
            res = null
        }
        if (!res && 4 <= len && len <= 64) {
            res = new UnknownAddress(address)
        }
        return res
    };
    ns.registerCompatibleAddressFactory = function () {
        Address.setFactory(new CompatibleAddressFactory())
    }
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var EntityType = ns.protocol.EntityType;
    var NetworkID = ns.protocol.NetworkID;
    var ID = ns.protocol.ID;
    var Identifier = ns.mkm.Identifier;
    var IdentifierFactory = ns.mkm.GeneralIdentifierFactory;
    var EntityID = function (identifier, name, address, terminal) {
        Identifier.call(this, identifier, name, address, terminal)
    };
    Class(EntityID, Identifier, null, {
        getType: function () {
            var name = this.getName();
            if (!name || name.length === 0) {
                return EntityType.USER.getValue()
            }
            var network = this.getAddress().getType();
            return NetworkID.getEntityType(network)
        }
    });
    var EntityIDFactory = function () {
        IdentifierFactory.call(this)
    };
    Class(EntityIDFactory, IdentifierFactory, null, {
        newID: function (string, name, address, terminal) {
            return new EntityID(string, name, address, terminal)
        }, parse: function (identifier) {
            if (!identifier) {
                throw new ReferenceError('ID empty');
            }
            var len = identifier.length;
            if (len === 15) {
                if (identifier.toLowerCase() === 'anyone@anywhere') {
                    return ID.ANYONE
                }
            } else if (len === 19) {
                if (identifier.toLowerCase() === 'everyone@everywhere') {
                    return ID.EVERYONE
                }
            } else if (len === 13) {
                if (identifier.toLowerCase() === 'moky@anywhere') {
                    return ID.FOUNDER
                }
            }
            return IdentifierFactory.prototype.parse.call(this, identifier)
        }
    });
    ns.registerEntityIDFactory = function () {
        ID.setFactory(new EntityIDFactory())
    }
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Meta = ns.protocol.Meta;
    var DefaultMeta = ns.mkm.DefaultMeta;
    var BTCMeta = ns.mkm.BTCMeta;
    var ETHMeta = ns.mkm.ETHMeta;
    var BaseMetaFactory = ns.mkm.GeneralMetaFactory;
    var CompatibleMetaFactory = function (type) {
        BaseMetaFactory.call(this, type)
    };
    Class(CompatibleMetaFactory, BaseMetaFactory, null, {
        createMeta: function (key, seed, fingerprint) {
            var out;
            var type = this.getType();
            if (type === Meta.MKM) {
                out = new DefaultMeta('1', key, seed, fingerprint)
            } else if (type === Meta.BTC) {
                out = new BTCMeta('2', key)
            } else if (type === Meta.ETH) {
                out = new ETHMeta('4', key)
            } else {
                throw new TypeError('unknown meta type: ' + type);
            }
            return out
        }, parseMeta: function (meta) {
            var out;
            var gf = general_factory();
            var type = gf.getMetaType(meta, '');
            if (type === '1' || type === 'mkm' || type === 'MKM') {
                out = new DefaultMeta(meta)
            } else if (type === '2' || type === 'btc' || type === 'BTC') {
                out = new BTCMeta(meta)
            } else if (type === '4' || type === 'eth' || type === 'ETH') {
                out = new ETHMeta(meta)
            } else {
                throw new TypeError('unknown meta type: ' + type);
            }
            return out.isValid() ? out : null
        }
    });
    var general_factory = function () {
        var man = ns.mkm.AccountFactoryManager;
        return man.generalFactory
    };
    ns.registerCompatibleMetaFactory = function () {
        var mkm = new CompatibleMetaFactory(Meta.MKM);
        var btc = new CompatibleMetaFactory(Meta.BTC);
        var eth = new CompatibleMetaFactory(Meta.ETH);
        Meta.setFactory("1", mkm);
        Meta.setFactory("2", btc);
        Meta.setFactory("4", eth);
        Meta.setFactory("mkm", mkm);
        Meta.setFactory("btc", btc);
        Meta.setFactory("eth", eth);
        Meta.setFactory("MKM", mkm);
        Meta.setFactory("BTC", btc);
        Meta.setFactory("ETH", eth)
    }
})(DIMP);
(function (ns) {
    'use strict';
    var Thread = ns.fsm.threading.Thread;
    var Log = ns.lnc.Log;
    var CacheHolder = function (value, lifeSpan, now) {
        this.__value = value;
        this.__lifeSpan = lifeSpan;
        if (!now || now <= 0) {
            now = (new Date()).getTime()
        }
        this.__expired = now + lifeSpan;
        this.__deprecated = now + lifeSpan * 2
    };
    CacheHolder.prototype.getValue = function () {
        return this.__value
    };
    CacheHolder.prototype.update = function (value, now) {
        this.__value = value;
        if (!now || now <= 0) {
            now = (new Date()).getTime()
        }
        this.__expired = now + this.__lifeSpan;
        this.__deprecated = now + this.__lifeSpan * 2
    };
    CacheHolder.prototype.isAlive = function (now) {
        if (!now || now <= 0) {
            now = (new Date()).getTime()
        }
        return now < this.__expired
    };
    CacheHolder.prototype.isDeprecated = function (now) {
        if (!now || now <= 0) {
            now = (new Date()).getTime()
        }
        return now > this.__deprecated
    };
    CacheHolder.prototype.renewal = function (duration, now) {
        if (!duration || duration <= 0) {
            duration = 128 * 1000
        }
        if (!now || now <= 0) {
            now = (new Date()).getTime()
        }
        this.__expired = now + duration;
        this.__deprecated = now + this.__lifeSpan * 2
    };
    var CachePair = function (value, holder) {
        this.value = value;
        this.holder = holder
    };
    var CachePool = function () {
        this.__holders = {}
    };
    CachePool.prototype.getKeys = function () {
        return Object.keys(this.__holders)
    };
    CachePool.prototype.update = function (key, value, lifeSpan, now) {
        if (!lifeSpan || lifeSpan <= 0) {
            lifeSpan = 3600 * 1000
        }
        var holder;
        if (value instanceof CacheHolder) {
            holder = value
        } else {
            holder = new CacheHolder(value, lifeSpan, now)
        }
        this.__holders[key] = holder;
        return holder
    };
    CachePool.prototype.erase = function (key, now) {
        var old = null;
        if (now && now > 0) {
            old = this.fetch(key, now)
        }
        delete this.__holders[key];
        return old
    };
    CachePool.prototype.fetch = function (key, now) {
        var holder = this.__holders[key];
        if (!holder) {
            return null
        } else if (holder.isAlive(now)) {
            return new CachePair(holder.getValue(), holder)
        } else {
            return new CachePair(null, holder)
        }
    };
    CachePool.prototype.purge = function (now) {
        if (!now || now <= 0) {
            now = (new Date()).getTime()
        }
        var count = 0;
        var allKeys = this.getKeys();
        var holder, key;
        for (var i = 0; i < allKeys.length; ++i) {
            key = allKeys[i];
            holder = this.__holders[key];
            if (!holder || holder.isDeprecated(now)) {
                delete this.__holders[key];
                ++count
            }
        }
        return count
    };
    var CacheManager = {
        getInstance: function () {
            if (!running) {
                this.start()
            }
            return this
        }, start: function () {
            force_stop();
            running = true;
            var thr = new Thread(this.run);
            thr.start();
            thread = thr
        }, stop: function () {
            force_stop()
        }, run: function () {
            if (!running) {
                return false
            }
            var now = (new Date()).getTime();
            if (now > nextTime) {
                nextTime = now + 300 * 1000;
                try {
                    this.purge(now)
                } catch (e) {
                    Log.error('CacheManager::run()', e)
                }
            }
            return true
        }, purge: function (now) {
            var count = 0;
            var names = Object.keys(pools);
            var p;
            for (var i = 0; i < names.length; ++i) {
                p = pools[names[i]];
                if (p) {
                    count += p.purge(now)
                }
            }
            return count
        }, getPool: function (name) {
            var p = pools[name];
            if (!p) {
                p = new CachePool();
                pools[name] = p
            }
            return p
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
            thr.stop()
        }
    }
    ns.mem.CacheHolder = CacheHolder;
    ns.mem.CachePool = CachePool;
    ns.mem.CacheManager = CacheManager
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var BlockCommand = Interface(null, [Command]);
    Command.BLOCK = 'block';
    BlockCommand.prototype.setBlockCList = function (list) {
    };
    BlockCommand.prototype.getBlockCList = function () {
    };
    BlockCommand.fromList = function (contacts) {
        return new ns.dkd.cmd.BaseBlockCommand(contacts)
    };
    ns.protocol.BlockCommand = BlockCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var BlockCommand = ns.protocol.BlockCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseBlockCommand = function () {
        var list = null;
        if (arguments.length === 0) {
            BaseCommand.call(this, Command.BLOCK)
        } else if (arguments[0] instanceof Array) {
            BaseCommand.call(this, Command.BLOCK)
            list = arguments[0]
        } else {
            BaseCommand.call(this, arguments[0])
        }
        if (list) {
            this.setValue('list', ID.revert(list))
        }
        this.__list = list
    };
    Class(BaseBlockCommand, BaseCommand, [BlockCommand], {
        getBlockCList: function () {
            if (this.__list === null) {
                var list = this.getValue('list');
                if (list) {
                    this.__list = ID.convert(list)
                } else {
                    this.__list = []
                }
            }
            return this.__list
        }, setBlockCList: function (list) {
            this.__list = list;
            if (list) {
                list = ID.revert(list)
            }
            this.setValue('list', list)
        }
    });
    ns.dkd.cmd.BaseBlockCommand = BaseBlockCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Enum = ns.type.Enum;
    var Command = ns.protocol.Command;
    var HandshakeState = Enum('HandshakeState', {START: 0, AGAIN: 1, RESTART: 2, SUCCESS: 3});
    HandshakeState.checkState = function (title, session) {
        if (title === 'DIM!') {
            return HandshakeState.SUCCESS
        } else if (title === 'DIM?') {
            return HandshakeState.AGAIN
        } else if (!session) {
            return HandshakeState.START
        } else {
            return HandshakeState.RESTART
        }
    };
    Command.HANDSHAKE = 'handshake';
    var HandshakeCommand = Interface(null, [Command]);
    HandshakeCommand.prototype.getTitle = function () {
    };
    HandshakeCommand.prototype.getSessionKey = function () {
    };
    HandshakeCommand.prototype.getState = function () {
    };
    HandshakeCommand.start = function () {
        return new ns.dkd.cmd.BaseHandshakeCommand('Hello world!', null)
    };
    HandshakeCommand.restart = function (sessionKey) {
        return new ns.dkd.cmd.BaseHandshakeCommand('Hello world!', sessionKey)
    };
    HandshakeCommand.again = function (sessionKey) {
        return new ns.dkd.cmd.BaseHandshakeCommand('DIM?', sessionKey)
    };
    HandshakeCommand.success = function (sessionKey) {
        return new ns.dkd.cmd.BaseHandshakeCommand('DIM!', sessionKey)
    };
    ns.protocol.HandshakeCommand = HandshakeCommand;
    ns.protocol.HandshakeState = HandshakeState
})(DIMP);
(function (ns) {
    'use strict';
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
            session = arguments[1]
        } else if (typeof arguments[0] === 'string') {
            BaseCommand.call(this, Command.HANDSHAKE);
            title = arguments[0]
        } else {
            BaseCommand.call(this, arguments[0])
        }
        if (title) {
            this.setValue('title', title)
        }
        if (session) {
            this.setValue('session', session)
        }
    };
    Class(BaseHandshakeCommand, BaseCommand, [HandshakeCommand], {
        getTitle: function () {
            return this.getString('title', null)
        }, getSessionKey: function () {
            return this.getString('session', null)
        }, getState: function () {
            return HandshakeState.checkState(this.getTitle(), this.getSessionKey())
        }
    });
    ns.dkd.cmd.BaseHandshakeCommand = BaseHandshakeCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Command = ns.protocol.Command;
    var LoginCommand = Interface(null, [Command]);
    Command.LOGIN = 'login';
    LoginCommand.prototype.getIdentifier = function () {
    };
    LoginCommand.prototype.getDevice = function () {
    };
    LoginCommand.prototype.setDevice = function (device) {
    };
    LoginCommand.prototype.getAgent = function () {
    };
    LoginCommand.prototype.setAgent = function (UA) {
    };
    LoginCommand.prototype.getStation = function () {
    };
    LoginCommand.prototype.setStation = function (station) {
    };
    LoginCommand.prototype.getProvider = function () {
    };
    LoginCommand.prototype.setProvider = function (provider) {
    };
    LoginCommand.create = function (identifier) {
        return new ns.dkd.cmd.BaseLoginCommand(identifier)
    };
    ns.protocol.LoginCommand = LoginCommand
})(DIMP);
(function (ns) {
    'use strict';
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
            this.setString('ID', info)
        } else {
            BaseCommand.call(this, info)
        }
    };
    Class(BaseLoginCommand, BaseCommand, [LoginCommand], {
        getIdentifier: function () {
            return ID.parse(this.getValue('ID'))
        }, getDevice: function () {
            return this.getString('device', null)
        }, setDevice: function (device) {
            this.setValue('device', device)
        }, getAgent: function () {
            return this.getString('agent', null)
        }, setAgent: function (UA) {
            this.setValue('agent', UA)
        }, getStation: function () {
            return this.getValue('station')
        }, setStation: function (station) {
            var info;
            if (!station) {
                info = null
            } else if (station instanceof Station) {
                var sid = station.getIdentifier();
                if (sid.isBroadcast()) {
                    info = {'host': station.getHost(), 'port': station.getPort()}
                } else {
                    info = {'ID': sid.toString(), 'host': station.getHost(), 'port': station.getPort()}
                }
            } else {
                info = Wrapper.fetchMap(station)
            }
            this.setValue('station', info)
        }, getProvider: function () {
            return this.getValue('provider')
        }, setProvider: function (provider) {
            var info;
            if (!provider) {
                info = null
            } else if (provider instanceof ServiceProvider) {
                info = {'ID': provider.getIdentifier().toString()}
            } else if (Interface.conforms(provider, ID)) {
                info = {'ID': provider.toString()}
            } else {
                info = Wrapper.fetchMap(provider)
            }
            this.setValue('provider', info)
        }
    });
    ns.dkd.cmd.BaseLoginCommand = BaseLoginCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var MuteCommand = Interface(null, [Command]);
    Command.MUTE = 'mute';
    MuteCommand.prototype.setMuteCList = function (list) {
    };
    MuteCommand.prototype.getMuteCList = function () {
    };
    MuteCommand.fromList = function (contacts) {
        return new ns.dkd.cmd.BaseMuteCommand(contacts)
    };
    ns.protocol.MuteCommand = MuteCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var MuteCommand = ns.protocol.MuteCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseMuteCommand = function (info) {
        var list = null;
        if (arguments.length === 0) {
            BaseCommand.call(this, Command.MUTE)
        } else if (arguments[0] instanceof Array) {
            BaseCommand.call(this, Command.MUTE)
            list = arguments[0]
        } else {
            BaseCommand.call(this, arguments[0])
        }
        if (list) {
            this.setValue('list', ID.revert(list))
        }
        this.__list = list
    };
    Class(BaseMuteCommand, BaseCommand, [MuteCommand], {
        getMuteCList: function () {
            if (this.__list === null) {
                var list = this.getValue('list');
                if (list) {
                    this.__list = ID.convert(list)
                } else {
                    this.__list = []
                }
            }
            return this.__list
        }, setMuteCList: function (list) {
            this.__list = list;
            if (list) {
                list = ID.revert(list)
            }
            this.setValue('list', list)
        }
    });
    ns.dkd.cmd.BaseMuteCommand = BaseMuteCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Command = ns.protocol.Command;
    var ReportCommand = Interface(null, [Command]);
    Command.REPORT = 'report';
    Command.ONLINE = 'online';
    Command.OFFLINE = 'offline';
    ReportCommand.prototype.setTitle = function (title) {
    };
    ReportCommand.prototype.getTitle = function () {
    };
    ReportCommand.fromTitle = function (title) {
        return new ns.dkd.cmd.BaseReportCommand(title)
    };
    ns.protocol.ReportCommand = ReportCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ReportCommand = ns.protocol.ReportCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseReportCommand = function () {
        if (arguments.length === 0) {
            BaseCommand.call(this, ReportCommand.REPORT)
        } else if (typeof arguments[0] === 'string') {
            BaseCommand.call(this, ReportCommand.REPORT);
            this.setTitle(arguments[0])
        } else {
            BaseCommand.call(this, arguments[0])
        }
    };
    Class(BaseReportCommand, BaseCommand, [ReportCommand], {
        setTitle: function (title) {
            this.setValue('title', title)
        }, getTitle: function () {
            return this.getString('title', null)
        }
    });
    ns.dkd.cmd.BaseReportCommand = BaseReportCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Command = ns.protocol.Command;
    var SearchCommand = Interface(null, [Command]);
    Command.SEARCH = 'search';
    Command.ONLINE_USERS = 'users';
    SearchCommand.prototype.setKeywords = function (keywords) {
    };
    SearchCommand.prototype.getKeywords = function () {
    };
    SearchCommand.prototype.setRange = function (start, limit) {
    };
    SearchCommand.prototype.getRange = function () {
    };
    SearchCommand.prototype.setStation = function (sid) {
    };
    SearchCommand.prototype.getStation = function () {
    };
    SearchCommand.prototype.getUsers = function () {
        throw new Error('NotImplemented');
    };
    SearchCommand.fromKeywords = function (keywords) {
        return new ns.dkd.cmd.BaseSearchCommand(keywords)
    };
    ns.protocol.SearchCommand = SearchCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var SearchCommand = ns.protocol.SearchCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseSearchCommand = function () {
        var keywords = null;
        if (arguments.length === 0) {
            BaseCommand.call(this, Command.ONLINE_USERS)
        } else if (typeof arguments[0] === 'string') {
            BaseCommand.call(this, Command.SEARCH);
            keywords = arguments[0]
        } else {
            BaseCommand.call(this, arguments[0])
        }
        if (keywords) {
            this.setKeywords(keywords)
        }
    };
    Class(BaseSearchCommand, BaseCommand, [SearchCommand], {
        setKeywords: function (keywords) {
            if (keywords instanceof Array) {
                keywords = keywords.join(' ')
            } else if (typeof keywords !== 'string') {
                throw new TypeError('keywords error: ' + keywords);
            }
            this.setValue('keywords', keywords)
        }, getKeywords: function () {
            var words = this.getValue('keywords', null);
            if (!words && this.getCmd() === Command.ONLINE_USERS) {
                words = Command.ONLINE_USERS
            }
            return words
        }, setRange: function (start, limit) {
            this.setValue('start', start);
            this.setValue('limit', limit)
        }, getRange: function () {
            var start = this.getInt('start', 0);
            var limit = this.getInt('limit', 50);
            return [start, limit]
        }, setStation: function (sid) {
            return this.setString('station', sid)
        }, getStation: function () {
            return ID.parse(this.getValue('results'))
        }, getUsers: function () {
            var users = this.getValue('users');
            if (users) {
                return ID.convert(users)
            } else {
                return null
            }
        }
    });
    ns.dkd.cmd.BaseSearchCommand = BaseSearchCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var StorageCommand = Interface(null, [Command]);
    Command.STORAGE = 'storage';
    Command.CONTACTS = 'contacts';
    Command.PRIVATE_KEY = 'private_key';
    StorageCommand.prototype.setTitle = function (title) {
    };
    StorageCommand.prototype.getTitle = function () {
    };
    StorageCommand.prototype.setIdentifier = function (identifier) {
    };
    StorageCommand.prototype.getIdentifier = function () {
    };
    StorageCommand.prototype.setData = function (data) {
    };
    StorageCommand.prototype.getData = function () {
    };
    StorageCommand.prototype.decrypt = function (key) {
    };
    StorageCommand.prototype.setKey = function (data) {
    };
    StorageCommand.prototype.getKey = function () {
    };
    ns.protocol.StorageCommand = StorageCommand
})(DIMP);
(function (ns) {
    'use strict';
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
        if (typeof info === 'string') {
            BaseCommand.call(this, Command.STORAGE);
            this.setValue('string', info)
        } else {
            BaseCommand.call(this, info)
        }
        this.__data = null;
        this.__plaintext = null;
        this.__key = null;
        this.__password = null
    };
    Class(BaseStorageCommand, BaseCommand, [StorageCommand], {
        setTitle: function (title) {
            this.setValue('title', title)
        }, getTitle: function () {
            return this.getString('title', null)
        }, setIdentifier: function (identifier) {
            this.setString('ID', identifier)
        }, getIdentifier: function () {
            return ID.parse(this.getValue('ID'))
        }, setData: function (data) {
            var base64 = null;
            if (data) {
                base64 = Base64.encode(data)
            }
            this.setValue('data', base64);
            this.__data = data;
            this.__plaintext = null
        }, getData: function () {
            if (this.__data === null) {
                var base64 = this.getString('data', null);
                if (base64) {
                    this.__data = Base64.decode(base64)
                }
            }
            return this.__data
        }, setKey: function (data) {
            var base64 = null;
            if (data) {
                base64 = Base64.encode(data)
            }
            this.setValue('key', base64);
            this.__key = data;
            this.__password = null
        }, getKey: function () {
            if (this.__key === null) {
                var base64 = this.getValue('key');
                if (base64) {
                    this.__key = Base64.decode(base64)
                }
            }
            return this.__key
        }, decrypt: function (key) {
            if (Interface.conforms(key, PrivateKey)) {
                return decrypt_password_by_private_key.call(this, key)
            }
            if (Interface.conforms(key, SymmetricKey)) {
                return decrypt_data_by_symmetric_key.call(this, key)
            }
            throw new TypeError('key error: ' + key);
        }
    });
    var decrypt_password_by_private_key = function (privateKey) {
        if (this.__password === null) {
            if (Interface.conforms(privateKey, DecryptKey)) {
                this.__password = decrypt_symmetric_key.call(this, privateKey)
            } else {
                throw new TypeError('private key error: ' + privateKey);
            }
        }
        return decrypt_data_by_symmetric_key.call(this, this.__password)
    };
    var decrypt_data_by_symmetric_key = function (password) {
        if (this.__plaintext === null) {
            if (!password) {
                throw new Error('symmetric key empty');
            }
            var data = this.getData();
            if (data) {
                this.__plaintext = password.decrypt(data, this.toMap())
            }
        }
        return this.__plaintext
    };
    var decrypt_symmetric_key = function (decryptKey) {
        var data = this.getKey();
        if (!data) {
            return
        }
        var key = decryptKey.decrypt(data, this.toMap());
        if (!key) {
            throw new Error('failed to decrypt key');
        }
        var info = JsON.decode(UTF8.decode(key));
        return SymmetricKey.parse(info)
    };
    ns.dkd.cmd.BaseStorageCommand = BaseStorageCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var DecryptKey = ns.crypto.DecryptKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PrivateKeyDBI = Interface(null, null);
    PrivateKeyDBI.META = 'M';
    PrivateKeyDBI.VISA = 'V';
    PrivateKeyDBI.prototype.savePrivateKey = function (key, type, user) {
    };
    PrivateKeyDBI.prototype.getPrivateKeysForDecryption = function (user) {
    };
    PrivateKeyDBI.prototype.getPrivateKeyForSignature = function (user) {
    };
    PrivateKeyDBI.prototype.getPrivateKeyForVisaSignature = function (user) {
    };
    var convertDecryptKeys = function (privateKeys) {
        var decryptKeys = [];
        var key;
        for (var index = 0; index < privateKeys.length; ++index) {
            key = privateKeys[index];
            if (Interface.conforms(key, DecryptKey)) {
                decryptKeys.push(key)
            }
        }
        return decryptKeys
    };
    var convertPrivateKeys = function (decryptKeys) {
        var privateKeys = [];
        var key;
        for (var index = 0; index < decryptKeys.length; ++index) {
            key = decryptKeys[index];
            if (Interface.conforms(key, PrivateKey)) {
                privateKeys.push(key)
            }
        }
        return privateKeys
    };
    var revertPrivateKeys = function (privateKeys) {
        var array = [];
        for (var index = 0; index < privateKeys.length; ++index) {
            array.push(privateKeys[index].toMap())
        }
        return array
    };
    var insertKey = function (key, privateKeys) {
        var index = findKey(key, privateKeys);
        if (index === 0) {
            return null
        } else if (index > 0) {
            privateKeys.splice(index, 1)
        } else if (privateKeys.length > 2) {
            privateKeys.pop()
        }
        privateKeys.unshift(key);
        return privateKeys
    };
    var findKey = function (key, privateKeys) {
        var data = key.getString('data', null);
        var item;
        for (var index = 0; index < privateKeys.length; ++index) {
            item = privateKeys[index];
            if (item.getString('data', null) === data) {
                return index
            }
        }
        return -1
    };
    PrivateKeyDBI.convertDecryptKeys = convertDecryptKeys;
    PrivateKeyDBI.convertPrivateKeys = convertPrivateKeys;
    PrivateKeyDBI.revertPrivateKeys = revertPrivateKeys;
    PrivateKeyDBI.insertKey = insertKey;
    PrivateKeyDBI.findKey = findKey;
    ns.dbi.PrivateKeyDBI = PrivateKeyDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var MetaDBI = Interface(null, null);
    MetaDBI.prototype.getMeta = function (entity) {
    };
    MetaDBI.prototype.saveMeta = function (meta, entity) {
    };
    ns.dbi.MetaDBI = MetaDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var DocumentDBI = Interface(null, null);
    DocumentDBI.prototype.getDocuments = function (entity) {
    };
    DocumentDBI.prototype.saveDocument = function (doc) {
    };
    ns.dbi.DocumentDBI = DocumentDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var UserDBI = Interface(null, null);
    var ContactDBI = Interface(null, null);
    UserDBI.prototype.getLocalUsers = function () {
    };
    UserDBI.prototype.saveLocalUsers = function (users) {
    };
    ContactDBI.prototype.getContacts = function (user) {
    };
    ContactDBI.prototype.saveContacts = function (contacts, user) {
    };
    ns.dbi.UserDBI = UserDBI;
    ns.dbi.ContactDBI = ContactDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var GroupDBI = Interface(null, null);
    GroupDBI.prototype.getFounder = function (group) {
    };
    GroupDBI.prototype.getOwner = function (group) {
    };
    GroupDBI.prototype.getMembers = function (group) {
    };
    GroupDBI.prototype.saveMembers = function (members, group) {
    };
    GroupDBI.prototype.getAssistants = function (group) {
    };
    GroupDBI.prototype.saveAssistants = function (bots, group) {
    };
    GroupDBI.prototype.getAdministrators = function (group) {
    };
    GroupDBI.prototype.saveAdministrators = function (members, group) {
    };
    ns.dbi.GroupDBI = GroupDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var GroupHistoryDBI = Interface(null, null);
    GroupHistoryDBI.prototype.saveGroupHistory = function (content, rMsg, group) {
    };
    GroupHistoryDBI.prototype.getGroupHistories = function (group) {
    };
    GroupHistoryDBI.prototype.getResetCommandMessage = function (group) {
    };
    GroupHistoryDBI.prototype.clearGroupMemberHistories = function (group) {
    };
    GroupHistoryDBI.prototype.clearGroupAdminHistories = function (group) {
    };
    ns.dbi.GroupHistoryDBI = GroupHistoryDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var PrivateKeyDBI = ns.dbi.PrivateKeyDBI;
    var MetaDBI = ns.dbi.MetaDBI;
    var DocumentDBI = ns.dbi.DocumentDBI;
    var UserDBI = ns.dbi.UserDBI;
    var ContactDBI = ns.dbi.ContactDBI;
    var GroupDBI = ns.dbi.GroupDBI;
    var GroupHistoryDBI = ns.dbi.GroupHistoryDBI;
    var AccountDBI = Interface(null, [PrivateKeyDBI, MetaDBI, DocumentDBI, UserDBI, ContactDBI, GroupDBI, GroupHistoryDBI]);
    ns.dbi.AccountDBI = AccountDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var CipherKeyDBI = ns.CipherKeyDelegate;
    var GroupKeysDBI = Interface(null, null);
    GroupKeysDBI.prototype.getGroupKeys = function (group, sender) {
    };
    GroupKeysDBI.prototype.saveGroupKeys = function (group, sender, keys) {
    };
    ns.dbi.CipherKeyDBI = CipherKeyDBI;
    ns.dbi.GroupKeysDBI = GroupKeysDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var CipherKeyDBI = ns.dbi.CipherKeyDBI;
    var GroupKeysDBI = ns.dbi.GroupKeysDBI;
    var MessageDBI = Interface(null, [CipherKeyDBI, GroupKeysDBI]);
    ns.dbi.MessageDBI = MessageDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Converter = ns.type.Converter;
    var Address = ns.protocol.Address;
    var ID = ns.protocol.ID;
    var Identifier = ns.mkm.Identifier;
    var ProviderInfo = function (pid, chosen) {
        this.__identifier = pid;
        this.__chosen = chosen
    };
    Class(ProviderInfo, null, null);
    ProviderInfo.prototype.getIdentifier = function () {
        return this.__identifier
    };
    ProviderInfo.prototype.getChosen = function () {
        return this.__chosen
    };
    ProviderInfo.prototype.setChosen = function (chosen) {
        this.__chosen = chosen
    };
    ProviderInfo.GSP = new Identifier('gsp@everywhere', 'gsp', Address.EVERYWHERE, null);
    ProviderInfo.convert = function (array) {
        var providers = [];
        var identifier;
        var chosen;
        var item;
        for (var i = 0; i < array.length; ++i) {
            item = array[i];
            identifier = ID.parse(item['ID']);
            chosen = Converter.getInt(item['chosen'], 0);
            if (!identifier) {
                continue
            }
            providers.push(new ProviderInfo(identifier, chosen))
        }
        return providers
    };
    ProviderInfo.revert = function (providers) {
        var array = [];
        var info;
        for (var i = 0; i < providers.length; ++i) {
            info = providers[i];
            array.push({'ID': info.getIdentifier().toString(), 'chosen': info.getChosen()})
        }
        return array
    };
    var ProviderDBI = Interface(null, null);
    ProviderDBI.prototype.allProviders = function () {
    };
    ProviderDBI.prototype.addProvider = function (identifier, chosen) {
    };
    ProviderDBI.prototype.updateProvider = function (identifier, chosen) {
    };
    ProviderDBI.prototype.removeProvider = function (identifier) {
    };
    ns.dbi.ProviderDBI = ProviderDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Converter = ns.type.Converter;
    var ID = ns.protocol.ID;
    var StationInfo = function (sid, chosen, host, port, provider) {
        this.__identifier = sid;
        this.__chosen = chosen;
        this.__host = host;
        this.__port = port;
        this.__provider = provider
    };
    Class(StationInfo, null, null);
    StationInfo.prototype.getIdentifier = function () {
        return this.__identifier
    };
    StationInfo.prototype.getChosen = function () {
        return this.__chosen
    };
    StationInfo.prototype.setChosen = function (chosen) {
        this.__chosen = chosen
    };
    StationInfo.prototype.getHost = function () {
        return this.__host
    };
    StationInfo.prototype.getPort = function () {
        return this.__port
    };
    StationInfo.prototype.getProvider = function () {
        return this.__provider
    };
    StationInfo.convert = function (array) {
        var stations = [];
        var sid;
        var chosen;
        var host;
        var port;
        var provider;
        var item;
        for (var i = 0; i < array.length; ++i) {
            item = array[i];
            sid = ID.parse(item['ID']);
            chosen = Converter.getInt(item['chosen'], 0);
            host = Converter.getString(item['host'], null);
            port = Converter.getInt(item['port'], 0);
            provider = ID.parse(item['provider']);
            if (!host || port === 0) {
                continue
            }
            stations.push(new StationInfo(sid, chosen, host, port, provider))
        }
        return stations
    };
    StationInfo.revert = function (stations) {
        var array = [];
        var info;
        for (var i = 0; i < stations.length; ++i) {
            info = stations[i];
            array.push({
                'ID': info.getIdentifier().toString(),
                'chosen': info.getChosen(),
                'host': info.getHost(),
                'port': info.getPort(),
                'provider': info.getProvider().toString()
            })
        }
        return array
    };
    var StationDBI = Interface(null, null);
    StationDBI.prototype.allStations = function (provider) {
    };
    StationDBI.prototype.addStation = function (sid, chosen, host, port, provider) {
    };
    StationDBI.prototype.updateStation = function (sid, chosen, host, port, provider) {
    };
    StationDBI.prototype.removeStation = function (host, port, provider) {
    };
    StationDBI.prototype.removeStations = function (provider) {
    };
    ns.dbi.StationDBI = StationDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var LoginDBI = Interface(null, null);
    LoginDBI.prototype.getLoginCommandMessage = function (user) {
    };
    LoginDBI.prototype.saveLoginCommandMessage = function (user, content, message) {
    };
    ns.dbi.LoginDBI = LoginDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var LoginDBI = ns.dbi.LoginDBI;
    var ProviderDBI = ns.dbi.ProviderDBI;
    var StationDBI = ns.dbi.StationDBI;
    var SessionDBI = Interface(null, [LoginDBI, ProviderDBI, StationDBI]);
    ns.dbi.SessionDBI = SessionDBI
})(DIMP);
(function (ns) {
    'use strict';
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
                    name = get_name(identifier.getType())
                }
            } else {
                name = get_name(identifier.getType())
            }
            var number = this.getNumberString(identifier);
            return name + ' (' + number + ')'
        }, getNumberString: function (address) {
            var str = '' + this.getNumber(address);
            while (str.length < 10) {
                str = '0' + str
            }
            return str.substr(0, 3) + '-' + str.substr(3, 3) + '-' + str.substr(6)
        }, getNumber: function (address) {
            if (Interface.conforms(address, ID)) {
                address = address.getAddress()
            }
            if (address instanceof BTCAddress) {
                return btc_number(address.toString())
            }
            if (address instanceof ETHAddress) {
                return eth_number(address.toString())
            }
            return 0
        }
    };
    var get_name = function (type) {
        if (EntityType.BOT.equals(type)) {
            return 'Bot'
        }
        if (EntityType.STATION.equals(type)) {
            return 'Station'
        }
        if (EntityType.ISP.equals(type)) {
            return 'ISP'
        }
        if (EntityType.isUser(type)) {
            return 'User'
        }
        if (EntityType.isGroup(type)) {
            return 'Group'
        }
        return 'Unknown'
    };
    var btc_number = function (address) {
        var data = Base58.decode(address);
        return user_number(data)
    };
    var eth_number = function (address) {
        var data = Hex.decode(address.substr(2))
        return user_number(data)
    };
    var user_number = function (cc) {
        var len = cc.length;
        var c1 = cc[len - 1] & 0xFF;
        var c2 = cc[len - 2] & 0xFF;
        var c3 = cc[len - 3] & 0xFF;
        var c4 = cc[len - 4] & 0xFF;
        return (c1 | (c2 << 8) | (c3 << 16)) + c4 * 0x01000000
    };
    ns.Anonymous = Anonymous
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var AddressNameService = ns.AddressNameService;
    var AddressNameServer = function () {
        Object.call(this);
        var caches = {
            'all': ID.EVERYONE,
            'everyone': ID.EVERYONE,
            'anyone': ID.ANYONE,
            'owner': ID.ANYONE,
            'founder': ID.FOUNDER
        };
        var reserved = {};
        var keywords = AddressNameService.KEYWORDS;
        for (var i = 0; i < keywords.length; ++i) {
            reserved[keywords[i]] = true
        }
        this.__reserved = reserved;
        this.__caches = caches;
        this.__tables = {}
    };
    Class(AddressNameServer, Object, [AddressNameService], null);
    AddressNameServer.prototype.isReserved = function (name) {
        return this.__reserved[name] === true
    };
    AddressNameServer.prototype.cache = function (name, identifier) {
        if (this.isReserved(name)) {
            return false
        }
        if (identifier) {
            this.__caches[name] = identifier;
            delete this.__tables[identifier.toString()]
        } else {
            delete this.__caches[name];
            this.__tables = {}
        }
        return true
    };
    AddressNameServer.prototype.getIdentifier = function (name) {
        return this.__caches[name]
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
                    array.push(name)
                }
            }
            this.__tables[identifier.toString()] = array
        }
        return array
    };
    AddressNameServer.prototype.save = function (name, identifier) {
        return this.cache(name, identifier)
    };
    ns.AddressNameServer = AddressNameServer
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var Archivist = ns.Archivist;
    var CommonArchivist = function (db) {
        Archivist.call(this, Archivist.kQueryExpires);
        this.__db = db
    };
    Class(CommonArchivist, Archivist, null, {
        getLastGroupHistoryTime: function (group) {
            var db = this.getDatabase();
            var array = db.getGroupHistories(group);
            if (!array || array.length === 0) {
                return null
            }
            var hisTime, lastTime = null;
            var pair;
            var cmd;
            var msg;
            for (var i = 0; i < array.length; ++i) {
                pair = array[i];
                cmd = pair[0];
                msg = pair[1];
                hisTime = cmd.getTime();
                if (!hisTime) {
                } else if (!lastTime || lastTime.getTime() < hisTime.getTime()) {
                    lastTime = hisTime
                }
            }
            return lastTime
        }, saveMeta: function (meta, identifier) {
            var db = this.getDatabase();
            return db.saveMeta(meta, identifier)
        }, saveDocument: function (doc) {
            var docTime = doc.getTime();
            if (!docTime) {
                Log.warning('document without time', doc)
            } else {
                var current = (new Date()).getTime() + 65536;
                if (docTime.getTime() > current) {
                    Log.error('document time error', docTime, doc);
                    return false
                }
            }
            var db = this.getDatabase();
            return db.saveDocument(doc)
        }, getMeta: function (identifier) {
            var db = this.getDatabase();
            return db.getMeta(identifier)
        }, getDocuments: function (identifier) {
            var db = this.getDatabase();
            return db.getDocuments(identifier)
        }, getContacts: function (user) {
            var db = this.getDatabase();
            return db.getContacts(user)
        }, getPublicKeyForEncryption: function (user) {
            throw new Error("DON't call me!");
        }, getPublicKeysForVerification: function (user) {
            throw new Error("DON't call me!");
        }, getPrivateKeysForDecryption: function (user) {
            var db = this.getDatabase();
            return db.getPrivateKeysForDecryption(user)
        }, getPrivateKeyForSignature: function (user) {
            var db = this.getDatabase();
            return db.getPrivateKeyForSignature(user)
        }, getPrivateKeyForVisaSignature: function (user) {
            var db = this.getDatabase();
            return db.getPrivateKeyForVisaSignature(user)
        }, getFounder: function (group) {
            var db = this.getDatabase();
            return db.getFounder(group)
        }, getOwner: function (group) {
            var db = this.getDatabase();
            return db.getOwner(group)
        }, getMembers: function (group) {
            var db = this.getDatabase();
            return db.getMembers(group)
        }, getAssistants: function (group) {
            var db = this.getDatabase();
            return db.getAssistants(group)
        }, getAdministrators: function (group) {
            var db = this.getDatabase();
            return db.getAdministrators(group)
        }, saveAdministrators: function (members, group) {
            var db = this.getDatabase();
            return db.saveAdministrators(members, group)
        }, saveMembers: function (members, group) {
            var db = this.getDatabase();
            return db.saveMembers(members, group)
        }
    });
    CommonArchivist.prototype.getDatabase = function () {
        return this.__db
    };
    CommonArchivist.prototype.getLocalUsers = function () {
        var db = this.getDatabase();
        return db.getLocalUsers()
    };
    ns.CommonArchivist = CommonArchivist
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Document = ns.protocol.Document;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var Facebook = ns.Facebook;
    var CommonFacebook = function () {
        Facebook.call(this);
        this.__current = null
    };
    Class(CommonFacebook, Facebook, null, {
        getLocalUsers: function () {
            var localUsers = [];
            var user;
            var db = this.getArchivist();
            var array = db.getLocalUsers();
            if (!array || array.length === 0) {
                user = this.__current;
                if (user) {
                    localUsers.push(user)
                }
            } else {
                for (var i = 0; i < array.length; ++i) {
                    user = this.getUser(array[i]);
                    if (user) {
                        localUsers.push(user)
                    }
                }
            }
            return localUsers
        }, getCurrentUser: function () {
            var user = this.__current;
            if (!user) {
                var localUsers = this.getLocalUsers();
                if (localUsers.length > 0) {
                    user = localUsers[0];
                    this.__current = user
                }
            }
            return user
        }, setCurrentUser: function (user) {
            if (!user.getDataSource()) {
                user.setDataSource(this)
            }
            this.__current = user
        }, getDocument: function (identifier, type) {
            var docs = this.getDocuments(identifier);
            var doc = DocumentHelper.lastDocument(docs, type);
            if (!doc && type === Document.VISA) {
                doc = DocumentHelper.lastDocument(docs, 'profile')
            }
            return doc
        }, getName: function (identifier) {
            var type;
            if (identifier.isUser()) {
                type = Document.VISA
            } else if (identifier.isGroup()) {
                type = Document.BULLETIN
            } else {
                type = '*'
            }
            var doc = this.getDocument(identifier, type);
            if (doc) {
                var name = doc.getName();
                if (name && name.length > 0) {
                    return name
                }
            }
            return ns.Anonymous.getName(identifier)
        }, getContacts: function (user) {
            var db = this.getArchivist();
            return db.getContacts(user)
        }, getPrivateKeysForDecryption: function (user) {
            var db = this.getArchivist();
            return db.getPrivateKeysForDecryption(user)
        }, getPrivateKeyForSignature: function (user) {
            var db = this.getArchivist();
            return db.getPrivateKeyForSignature(user)
        }, getPrivateKeyForVisaSignature: function (user) {
            var db = this.getArchivist();
            return db.getPrivateKeyForVisaSignature(user)
        }
    });
    ns.CommonFacebook = CommonFacebook
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Converter = ns.type.Converter;
    var Log = ns.lnc.Log;
    var Command = ns.protocol.Command;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var Compatible = ns.Compatible;
    var Messenger = ns.Messenger;
    var CommonMessenger = function (session, facebook, db) {
        Messenger.call(this);
        this.__session = session;
        this.__facebook = facebook;
        this.__db = db;
        this.__packer = null;
        this.__processor = null
    };
    Class(CommonMessenger, Messenger, null, {
        encryptKey: function (keyData, receiver, iMsg) {
            try {
                return Messenger.prototype.encryptKey.call(this, keyData, receiver, iMsg)
            } catch (e) {
                Log.error('failed to encrypt key for receiver', receiver, e)
            }
        }, serializeKey: function (password, iMsg) {
            var reused = password.getValue('reused');
            var digest = password.getValue('digest');
            if (reused === null && digest === null) {
                return Messenger.prototype.serializeKey.call(this, password, iMsg)
            }
            password.removeValue('reused');
            password.removeValue('digest');
            var data = Messenger.prototype.serializeKey.call(this, password, iMsg);
            if (Converter.getBoolean(reused, false)) {
                password.setValue('reused', true)
            }
            if (digest) {
                password.setValue('digest', digest)
            }
            return data
        }, serializeContent: function (content, password, iMsg) {
            if (Interface.conforms(content, Command)) {
                content = Compatible.fixCommand(content)
            }
            return Messenger.prototype.serializeContent.call(this, content, password, iMsg)
        }, deserializeContent: function (data, password, sMsg) {
            var content = Messenger.prototype.deserializeContent.call(this, data, password, sMsg);
            if (Interface.conforms(content, Command)) {
                content = Compatible.fixCommand(content)
            }
            return content
        }, sendContent: function (content, sender, receiver, priority) {
            if (!sender) {
                var facebook = this.getFacebook();
                var current = facebook.getCurrentUser();
                sender = current.getIdentifier()
            }
            var env = Envelope.create(sender, receiver, null);
            var iMsg = InstantMessage.create(env, content);
            var rMsg = this.sendInstantMessage(iMsg, priority);
            return [iMsg, rMsg]
        }, sendInstantMessage: function (iMsg, priority) {
            var sender = iMsg.getSender();
            var receiver = iMsg.getReceiver();
            if (sender.equals(receiver)) {
                Log.warning('drop cycled message', iMsg.getContent(), sender, receiver, iMsg.getGroup());
                return null
            } else {
                Log.debug('send instant message, type:' + iMsg.getContent().getType(), sender, receiver, iMsg.getGroup());
                attachVisaTime.call(this, sender, iMsg)
            }
            var sMsg = this.encryptMessage(iMsg);
            if (!sMsg) {
                return null
            }
            var rMsg = this.signMessage(sMsg);
            if (!rMsg) {
                throw new Error('failed to sign message: ' + sMsg.toString());
            }
            if (this.sendReliableMessage(rMsg, priority)) {
                return rMsg
            } else {
                return null
            }
        }, sendReliableMessage: function (rMsg, priority) {
            var sender = rMsg.getSender();
            var receiver = rMsg.getReceiver();
            if (sender.equals(receiver)) {
                Log.warning('drop cycled message', sender, receiver, rMsg.getGroup());
                return false
            }
            var data = this.serializeMessage(rMsg);
            if (!data || data.length === 0) {
                Log.error('failed to serialize message', rMsg);
                return false
            }
            var session = this.getSession();
            return session.queueMessagePackage(rMsg, data, priority)
        }
    });
    var attachVisaTime = function (sender, iMsg) {
        if (Interface.conforms(iMsg.getContent(), Command)) {
            return false
        }
        var facebook = this.getFacebook();
        var doc = facebook.getVisa(sender);
        if (!doc) {
            Log.warning('failed to get visa document for sender', sender);
            return false
        }
        var lastDocumentTime = doc.getTime();
        if (lastDocumentTime) {
            iMsg.setDateTime('SDT', lastDocumentTime)
        }
        return true
    };
    CommonMessenger.prototype.getSession = function () {
        return this.__session
    };
    CommonMessenger.prototype.getEntityDelegate = function () {
        return this.__facebook
    }
    CommonMessenger.prototype.getFacebook = function () {
        return this.__facebook
    };
    CommonMessenger.prototype.getDatabase = function () {
        return this.__db
    };
    CommonMessenger.prototype.getCipherKeyDelegate = function () {
        return this.__db
    };
    CommonMessenger.prototype.getPacker = function () {
        return this.__packer
    };
    CommonMessenger.prototype.setPacker = function (packer) {
        this.__packer = packer
    };
    CommonMessenger.prototype.getProcessor = function () {
        return this.__processor
    };
    CommonMessenger.prototype.setProcessor = function (processor) {
        this.__processor = processor
    };
    ns.CommonMessenger = CommonMessenger
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var MessageHelper = ns.msg.MessageHelper;
    var MessagePacker = ns.MessagePacker;
    var CommonPacker = function (facebook, messenger) {
        MessagePacker.call(this, facebook, messenger)
    };
    Class(CommonPacker, MessagePacker, null, {
        getVisaKey: function (user) {
            var facebook = this.getFacebook();
            return facebook.getPublicKeyForEncryption(user)
        }, getMembers: function (group) {
            var facebook = this.getFacebook();
            return facebook.getMembers(group)
        }, checkSender: function (rMsg) {
            var sender = rMsg.getSender();
            var visa = MessageHelper.getVisa(rMsg);
            if (visa) {
                return visa.getIdentifier().equals(sender)
            } else if (this.getVisaKey(sender)) {
                return true
            }
            var error = {'message': 'verify key not found', 'user': sender.toString()};
            this.suspendReliableMessage(rMsg, error);
            return false
        }, checkReceiver: function (iMsg) {
            var receiver = iMsg.getReceiver();
            if (receiver.isBroadcast()) {
                return true
            } else if (receiver.isGroup()) {
                return false
            } else if (this.getVisaKey(receiver)) {
                return true
            }
            var error = {'message': 'encrypt key not found', 'user': receiver.toString()};
            this.suspendInstantMessage(iMsg, error);
            return false
        }, encryptMessage: function (iMsg) {
            if (this.checkReceiver(iMsg)) {
            } else {
                Log.warning('receiver not ready', iMsg.getReceiver());
                return null
            }
            return MessagePacker.prototype.encryptMessage.call(this, iMsg)
        }, verifyMessage: function (rMsg) {
            if (this.checkSender(rMsg)) {
            } else {
                Log.warning('sender not ready', rMsg.getSender());
                return null
            }
            return MessagePacker.prototype.verifyMessage.call(this, rMsg)
        }, signMessage: function (sMsg) {
            if (Interface.conforms(sMsg, ReliableMessage)) {
                return sMsg
            }
            return MessagePacker.prototype.signMessage.call(this, sMsg)
        }, deserializeMessage: function (data) {
            if (!data || data.length <= 4) {
                return null
            }
            var rMsg = MessagePacker.prototype.deserializeMessage.call(this, data);
            if (rMsg) {
                ns.Compatible.fixMetaAttachment(rMsg)
            }
            return rMsg
        }, serializeMessage: function (rMsg) {
            ns.Compatible.fixMetaAttachment(rMsg);
            return MessagePacker.prototype.serializeMessage.call(this, rMsg)
        }
    });
    CommonPacker.prototype.suspendReliableMessage = function (rMsg, info) {
    };
    CommonPacker.prototype.suspendInstantMessage = function (iMsg, info) {
    };
    ns.CommonPacker = CommonPacker
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var MessageProcessor = ns.MessageProcessor;
    var CommonProcessor = function (facebook, messenger) {
        MessageProcessor.call(this, facebook, messenger)
    };
    Class(CommonProcessor, MessageProcessor, null, {
        processContent: function (content, rMsg) {
            var responses = MessageProcessor.processContent.call(this, content, rMsg);
            checkVisaTime.call(this, content, rMsg);
            return responses
        }
    });
    var checkVisaTime = function (content, rMsg) {
        var facebook = this.getFacebook();
        var archivist = facebook.getArchivist();
        if (!archivist) {
            throw new ReferenceError('archivist not found');
        }
        var docUpdated = false;
        var lastDocumentTime = rMsg.getDateTime('SDT', null);
        if (lastDocumentTime) {
            var now = new Date();
            if (lastDocumentTime.getTime() > now.getTime()) {
                lastDocumentTime = now
            }
            var sender = rMsg.getSender();
            docUpdated = archivist.setLastDocumentTime(sender, lastDocumentTime);
            if (docUpdated) {
                facebook.getDocuments(sender)
            }
        }
        return docUpdated
    };
    ns.CommonProcessor = CommonProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var PrivateKey = ns.crypto.PrivateKey;
    var ID = ns.protocol.ID;
    var EntityType = ns.protocol.EntityType;
    var Meta = ns.protocol.Meta;
    var BaseVisa = ns.mkm.BaseVisa;
    var BaseBulletin = ns.mkm.BaseBulletin;
    var Register = function (db) {
        this.__db = db
    };
    Register.prototype.createUser = function (nickname, avatar) {
        var privateKey = PrivateKey.generate(PrivateKey.RSA);
        var meta = Meta.generate(Meta.MKM, privateKey, 'web-demo');
        var uid = ID.generate(meta, EntityType.USER, null);
        var pKey = privateKey.getPublicKey();
        var doc = createVisa(uid, nickname, avatar, pKey, privateKey);
        this.__db.saveMeta(meta, uid);
        this.__db.savePrivateKey(privateKey, 'M', uid);
        this.__db.saveDocument(doc);
        return uid
    };
    Register.prototype.createGroup = function (founder, title) {
        var r = Math.ceil(Math.random() * 999990000) + 10000;
        var seed = 'Group-' + r;
        var privateKey = this.__db.getPrivateKeyForVisaSignature(founder);
        var meta = Meta.generate(Meta.MKM, privateKey, seed);
        var gid = ID.generate(meta, EntityType.GROUP, null);
        var doc = createBulletin(gid, title, founder, privateKey);
        this.__db.saveMeta(meta, gid);
        this.__db.saveDocument(doc);
        this.__db.saveMembers([founder], gid);
        return gid
    };
    var createVisa = function (identifier, name, avatarUrl, pKey, sKey) {
        var doc = new BaseVisa(identifier);
        doc.setProperty('app_id', 'chat.dim.web');
        doc.setName(name);
        doc.setAvatar(avatarUrl);
        doc.setPublicKey(pKey);
        doc.sign(sKey);
        return doc
    };
    var createBulletin = function (identifier, name, founder, sKey) {
        var doc = new BaseBulletin(identifier);
        doc.setProperty('app_id', 'chat.dim.web');
        doc.setProperty('founder', founder.toString());
        doc.setName(name);
        doc.sign(sKey);
        return doc
    };
    ns.Register = Register
})(DIMP);
(function (ns) {
    'use strict';
    var Command = ns.protocol.Command;
    var CommandParser = ns.CommandParser;
    var BaseHandshakeCommand = ns.dkd.cmd.BaseHandshakeCommand;
    var BaseLoginCommand = ns.dkd.cmd.BaseLoginCommand;
    var BaseReportCommand = ns.dkd.cmd.BaseReportCommand;
    var BaseMuteCommand = ns.dkd.cmd.BaseMuteCommand;
    var BaseBlockCommand = ns.dkd.cmd.BaseBlockCommand;
    var BaseSearchCommand = ns.dkd.cmd.BaseSearchCommand;
    var BaseStorageCommand = ns.dkd.cmd.BaseStorageCommand;
    var registerExtraCommandFactories = function () {
        Command.setFactory(Command.HANDSHAKE, new CommandParser(BaseHandshakeCommand));
        Command.setFactory(Command.LOGIN, new CommandParser(BaseLoginCommand));
        Command.setFactory(Command.REPORT, new CommandParser(BaseReportCommand));
        Command.setFactory('broadcast', new CommandParser(BaseReportCommand));
        Command.setFactory(Command.ONLINE, new CommandParser(BaseReportCommand));
        Command.setFactory(Command.OFFLINE, new CommandParser(BaseReportCommand));
        Command.setFactory(Command.MUTE, new CommandParser(BaseMuteCommand));
        Command.setFactory(Command.BLOCK, new CommandParser(BaseBlockCommand));
        Command.setFactory(Command.SEARCH, new CommandParser(BaseSearchCommand));
        Command.setFactory(Command.ONLINE_USERS, new CommandParser(BaseSearchCommand));
        Command.setFactory(Command.STORAGE, new CommandParser(BaseStorageCommand));
        Command.setFactory(Command.CONTACTS, new CommandParser(BaseStorageCommand));
        Command.setFactory(Command.PRIVATE_KEY, new CommandParser(BaseStorageCommand))
    };
    ns.registerAllFactories();
    registerExtraCommandFactories();
    ns.registerPlugins();
    ns.registerEntityIDFactory();
    ns.registerCompatibleAddressFactory();
    ns.registerCompatibleMetaFactory()
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var DecryptKey = ns.crypto.DecryptKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var Storage = ns.dos.LocalStorage;
    var PrivateKeyDBI = ns.dbi.PrivateKeyDBI;
    var id_key_path = function (user) {
        return 'pri.' + user.getAddress().toString() + '.secret'
    };
    var msg_keys_path = function (user) {
        return 'pri.' + user.getAddress().toString() + '.secret_keys'
    };
    var PrivateKeyStorage = function () {
        Object.call(this)
    };
    Class(PrivateKeyStorage, Object, [PrivateKeyDBI], {
        savePrivateKey: function (key, type, user) {
            if (type === PrivateKeyDBI.META) {
                return this.saveIdKey(key, user)
            } else {
                return this.saveMsgKey(key, user)
            }
        }, getPrivateKeysForDecryption: function (user) {
            var privateKeys = this.loadMsgKeys(user);
            var idKey = this.loadIdKey(user);
            if (Interface.conforms(idKey, DecryptKey)) {
                if (PrivateKeyDBI.findKey(idKey, privateKeys) < 0) {
                    privateKeys.push(idKey)
                }
            }
            return privateKeys
        }, getPrivateKeyForSignature: function (user) {
            return this.getPrivateKeyForVisaSignature(user)
        }, getPrivateKeyForVisaSignature: function (user) {
            return this.loadIdKey(user)
        }
    });
    PrivateKeyStorage.prototype.loadIdKey = function (user) {
        var path = id_key_path(user);
        var info = Storage.loadJSON(path);
        return PrivateKey.parse(info)
    };
    PrivateKeyStorage.prototype.saveIdKey = function (key, user) {
        var path = id_key_path(user);
        return Storage.saveJSON(key.toMap(), path)
    };
    PrivateKeyStorage.prototype.loadMsgKeys = function (user) {
        var privateKeys = [];
        var path = msg_keys_path(user);
        var array = Storage.loadJSON(path);
        if (array) {
            var key;
            for (var i = 0; i < array.length; ++i) {
                key = PrivateKey.parse(array[i]);
                if (key) {
                    privateKeys.push(key)
                }
            }
        }
        return privateKeys
    };
    PrivateKeyStorage.prototype.saveMsgKey = function (key, user) {
        var privateKeys = this.loadMsgKeys(user);
        privateKeys = PrivateKeyDBI.insertKey(key, privateKeys);
        if (!privateKeys) {
            return false
        }
        var plain = PrivateKeyDBI.revertPrivateKeys(privateKeys);
        var path = msg_keys_path(user);
        return Storage.saveJSON(plain, path)
    };
    ns.database.PrivateKeyStorage = PrivateKeyStorage
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Meta = ns.protocol.Meta;
    var Storage = ns.dos.LocalStorage;
    var MetaDBI = ns.dbi.MetaDBI;
    var meta_path = function (entity) {
        return 'pub.' + entity.getAddress().toString() + '.meta'
    };
    var MetaStorage = function () {
        Object.call(this)
    };
    Class(MetaStorage, Object, [MetaDBI], null);
    MetaStorage.prototype.saveMeta = function (meta, entity) {
        var path = meta_path(entity);
        return Storage.saveJSON(meta.toMap(), path)
    };
    MetaStorage.prototype.getMeta = function (entity) {
        var path = meta_path(entity);
        var info = Storage.loadJSON(path);
        return Meta.parse(info)
    };
    ns.database.MetaStorage = MetaStorage
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var TransportableData = ns.format.TransportableData;
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var Storage = ns.dos.LocalStorage;
    var DocumentDBI = ns.dbi.DocumentDBI;
    var doc_path = function (entity) {
        return 'pub.' + entity.getAddress().toString() + '.docs'
    };
    var DocumentStorage = function () {
        Object.call(this)
    };
    Class(DocumentStorage, Object, [DocumentDBI], null);
    DocumentStorage.prototype.saveDocument = function (doc) {
        var entity = doc.getIdentifier();
        var type = doc.getString('type', '');
        var documents = this.getDocuments(entity);
        var index = find_document(documents, entity, type);
        if (index < 0) {
            documents.unshift(doc)
        } else if (documents[index].equals(doc)) {
            return true
        } else {
            documents.splice(index, 1);
            documents.unshift(doc)
        }
        var array = revert_documents(documents);
        var path = doc_path(entity);
        return Storage.saveJSON(array, path)
    };
    DocumentStorage.prototype.getDocuments = function (entity) {
        var path = doc_path(entity);
        var array = Storage.loadJSON(path);
        return !array ? [] : convert_documents(array)
    };
    var parse_document = function (dict, identifier, type) {
        var entity = ID.parse(dict['ID']);
        if (!identifier) {
            identifier = entity
        } else if (!identifier.equals(entity)) {
            throw new TypeError('document error: ' + dict);
        }
        if (!type) {
            type = '*'
        }
        var dt = dict['type'];
        if (dt) {
            type = dt
        }
        var data = dict['data'];
        if (!data) {
            data = dict['profile']
        }
        var signature = dict['signature'];
        if (!data || !signature) {
            throw new ReferenceError('document error: ' + dict);
        }
        var ted = TransportableData.parse(signature);
        return Document.create(type, identifier, data, ted)
    };
    var convert_documents = function (array) {
        var documents = [];
        var doc;
        for (var i = 0; i < array.length; ++i) {
            doc = parse_document(array[i]);
            if (doc) {
                documents.push(doc)
            }
        }
        return documents
    };
    var revert_documents = function (documents) {
        var array = [];
        for (var i = 0; i < documents.length; ++i) {
            array.push(documents[i].toMap())
        }
        return array
    };
    var find_document = function (documents, identifier, type) {
        var item;
        for (var i = 0; i < documents.length; ++i) {
            item = documents[i];
            if (item.getIdentifier().equals(identifier) && item.getString('type', '') === type) {
                return i
            }
        }
        return -1
    };
    DocumentStorage.parse = parse_document;
    ns.database.DocumentStorage = DocumentStorage
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Departure = ns.startrek.port.Departure;
    var MessageWrapper = function (rMsg, departure) {
        this.__msg = rMsg;
        this.__ship = departure
    };
    Class(MessageWrapper, null, [Departure], null);
    MessageWrapper.prototype.getMessage = function () {
        return this.__msg
    };
    MessageWrapper.prototype.getSN = function () {
        return this.__ship.getSN()
    };
    MessageWrapper.prototype.getPriority = function () {
        return this.__ship.getPriority()
    };
    MessageWrapper.prototype.getFragments = function () {
        return this.__ship.getFragments()
    };
    MessageWrapper.prototype.checkResponse = function (arrival) {
        return this.__ship.checkResponse(arrival)
    };
    MessageWrapper.prototype.isImportant = function () {
        return this.__ship.isImportant()
    };
    MessageWrapper.prototype.touch = function (now) {
        return this.__ship.touch(now)
    };
    MessageWrapper.prototype.getStatus = function (now) {
        return this.__ship.getStatus(now)
    };
    ns.network.MessageWrapper = MessageWrapper
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Arrays = ns.type.Arrays;
    var Log = ns.lnc.Log;
    var MessageWrapper = ns.network.MessageWrapper;
    var MessageQueue = function () {
        this.__priorities = [];
        this.__fleets = {}
    };
    Class(MessageQueue, null, null, null);
    MessageQueue.prototype.append = function (rMsg, departure) {
        var ok = true;
        var priority = departure.getPriority();
        var array = this.__fleets[priority];
        if (!array || array.length === 0) {
            array = [];
            this.__fleets[priority] = array;
            insert_priority(priority, this.__priorities)
        } else {
            var signature = rMsg.getValue('signature');
            var item;
            for (var i = array.length - 1; i >= 0; --i) {
                item = array[i].getMessage();
                if (item && is_duplicated(item, rMsg)) {
                    Log.warning('[QUEUE] duplicated message', signature);
                    ok = false;
                    break
                }
            }
        }
        if (ok) {
            array.push(new MessageWrapper(rMsg, departure))
        }
        return ok
    };
    var is_duplicated = function (msg1, msg2) {
        var sig1 = msg1.getValue('signature');
        var sig2 = msg2.getValue('signature');
        if (!sig1 || !sig2) {
            return false
        } else if (sig1 !== sig2) {
            return false
        }
        var to1 = msg1.getReceiver();
        var to2 = msg2.getReceiver();
        return to1.equals(to2)
    };
    var insert_priority = function (prior, priorities) {
        var total = priorities.length;
        var value;
        var index = 0;
        for (; index < total; ++index) {
            value = priorities[index];
            if (value === prior) {
                return
            } else if (value > prior) {
                break
            }
        }
        Arrays.insert(priorities, index, prior)
    };
    MessageQueue.prototype.next = function () {
        var priority;
        var array;
        for (var i = 0; i < this.__priorities.length; ++i) {
            priority = this.__priorities[i];
            array = this.__fleets[priority];
            if (array && array.length > 0) {
                return array.shift()
            }
        }
        return null
    };
    MessageQueue.prototype.purge = function () {
        var priority;
        var array;
        for (var i = this.__priorities.length - 1; i >= 0; --i) {
            priority = this.__priorities[i];
            array = this.__fleets[priority];
            if (!array) {
                this.__priorities.splice(i, 1)
            } else if (array.length === 0) {
                delete this.__fleets[priority];
                this.__priorities.splice(i, 1)
            }
        }
        return null
    };
    ns.network.MessageQueue = MessageQueue
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var UTF8 = ns.format.UTF8;
    var CommonGate = ns.startrek.WSClientGate;
    var PlainPorter = ns.startrek.PlainPorter;
    var PlainArrival = ns.startrek.PlainArrival;
    var AckEnableGate = function (keeper) {
        CommonGate.call(this, keeper)
    };
    Class(AckEnableGate, CommonGate, null, {
        createPorter: function (remote, local) {
            var docker = new AckEnablePorter(remote, local);
            docker.setDelegate(this.getDelegate());
            return docker
        }
    });
    var AckEnablePorter = function (remote, local) {
        PlainPorter.call(this, remote, local)
    };
    Class(AckEnablePorter, PlainPorter, null, {
        checkArrival: function (income) {
            if (income instanceof PlainArrival) {
                var payload = income.getPayload();
                if (!payload || payload.length === 0) {
                } else if (payload[0] === jsonBegin) {
                    var sig = fetchValue(payload, bytes('signature'));
                    var sec = fetchValue(payload, bytes('time'));
                    if (sig && sec) {
                        var signature = UTF8.decode(sig);
                        var timestamp = UTF8.decode(sec);
                        var text = 'ACK:{"time":' + timestamp + ',"signature":"' + signature + '"}';
                        var priority = 1
                        this.send(bytes(text), priority)
                    }
                }
            }
            return PlainPorter.prototype.checkArrival(income)
        }
    });
    var jsonBegin = '{'.charCodeAt(0);
    var fetchValue = function (data, tag) {
        if (tag.length === 0) {
            return null
        }
        var pos = find(data, tag, 0);
        if (pos < 0) {
            return null
        } else {
            pos += tag.length
        }
        pos = find(data, bytes(':'), pos);
        if (pos < 0) {
            return null
        } else {
            pos += 1
        }
        var end = find(data, bytes(','), pos);
        if (end < 0) {
            end = find(data, bytes('}'), pos);
            if (end < 0) {
                return null
            }
        }
        var value = data.subarray(pos, end);
        value = strip(value, bytes(' '));
        value = strip(value, bytes('"'));
        value = strip(value, bytes("'"));
        return value
    };
    var bytes = function (text) {
        return UTF8.encode(text)
    };
    var find = function (data, sub, start) {
        if (!start) {
            start = 0
        }
        var end = data.length - sub.length;
        var i, j;
        var match;
        for (i = start; i <= end; ++i) {
            match = true;
            for (j = 0; j < sub.length; ++j) {
                if (data[i + j] === sub[j]) {
                    continue
                }
                match = false;
                break
            }
            if (match) {
                return i
            }
        }
        return -1
    };
    var strip = function (data, removing) {
        data = stripRight(data, removing);
        return stripLeft(data, removing)
    };
    var stripLeft = function (data, leading) {
        var c = leading.length;
        if (c === 0) {
            return data
        }
        var i;
        while (c <= data.length) {
            for (i = 0; i < c; ++i) {
                if (data[i] !== leading[i]) {
                    return data
                }
            }
            data = data.subarray(c)
        }
        return data
    };
    var stripRight = function (data, trailing) {
        var c = trailing.length;
        if (c === 0) {
            return data
        }
        var i;
        var m = data.length - c;
        while (m >= 0) {
            for (i = 0; i < c; ++i) {
                if (data[m + i] !== trailing[i]) {
                    return data
                }
            }
            data = data.subarray(0, m);
            m -= c
        }
        return data
    };
    var DataUtils = {bytes: bytes, find: find, strip: strip, stripLeft: stripLeft, stripRight: stripRight};
    ns.network.AckEnableGate = AckEnableGate;
    ns.network.AckEnablePorter = AckEnablePorter;
    ns.utils.DataUtils = DataUtils
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var Runner = ns.fsm.skywalker.Runner;
    var InetSocketAddress = ns.startrek.type.InetSocketAddress;
    var PorterDelegate = ns.startrek.port.PorterDelegate;
    var ClientHub = ns.ws.ClientHub;
    var AckEnableGate = ns.network.AckEnableGate;
    var MessageQueue = ns.network.MessageQueue;
    var GateKeeper = function (host, port) {
        Runner.call(this);
        this.__remote = new InetSocketAddress(host, port);
        this.__gate = this.createGate(this.__remote);
        this.__queue = new MessageQueue();
        this.__active = false;
        this.__last_active = 0;
        this.__reconnect_time = 0
    };
    Class(GateKeeper, Runner, [PorterDelegate], null);
    GateKeeper.prototype.createGate = function (remote) {
        var gate = new AckEnableGate(this);
        var hub = this.createHub(gate, remote);
        gate.setHub(hub);
        return gate
    };
    GateKeeper.prototype.createHub = function (delegate, remote) {
        var hub = new ClientHub(delegate);
        hub.connect(remote, null);
        return hub
    };
    GateKeeper.prototype.getRemoteAddress = function () {
        return this.__remote
    };
    GateKeeper.prototype.getGate = function () {
        return this.__gate
    };
    GateKeeper.prototype.isActive = function () {
        return this.__active
    };
    GateKeeper.prototype.setActive = function (active, when) {
        if (this.__active === active) {
            return false
        }
        if (!when || when === 0) {
            when = (new Date()).getTime()
        } else if (when instanceof Date) {
            when = when.getTime()
        }
        if (when <= this.__last_active) {
            return false
        }
        this.__active = active;
        this.__last_active = when;
        return true
    };
    GateKeeper.prototype.isRunning = function () {
        if (Runner.prototype.isRunning.call(this)) {
            return this.__gate.isRunning()
        } else {
            return false
        }
    };
    GateKeeper.prototype.stop = function () {
        Runner.prototype.stop.call(this)
        this.__gate.stop()
    };
    GateKeeper.prototype.setup = function () {
        var again = Runner.prototype.setup.call(this)
        this.__gate.start();
        return again
    };
    GateKeeper.prototype.finish = function () {
        this.__gate.stop();
        return Runner.prototype.finish.call(this)
    };
    GateKeeper.prototype.process = function () {
        var gate = this.getGate();
        var remote = this.getRemoteAddress();
        var docker = gate.getPorter(remote, null);
        if (!docker) {
            var now = (new Date()).getTime();
            if (now < this.__reconnect_time) {
                return false
            }
            docker = gate.fetchPorter(remote, null);
            if (!docker) {
                Log.error('gate error', remote);
                this.__reconnect_time = now + 8000;
                return false
            }
        }
        var hub = gate.getHub();
        try {
            var incoming = hub.process();
            var outgoing = gate.process();
            if (incoming || outgoing) {
                return true
            }
        } catch (e) {
            Log.error('GateKeeper::process()', e);
            return false
        }
        var queue = this.__queue;
        if (!this.isActive()) {
            queue.purge();
            return false
        }
        var wrapper = queue.next();
        if (!wrapper) {
            queue.purge();
            return false
        }
        var msg = wrapper.getMessage();
        if (!msg) {
            return true
        }
        var ok = gate.sendShip(wrapper, remote, null);
        if (!ok) {
            Log.error('gate error, failed to send data', wrapper, remote)
        }
        return true
    };
    GateKeeper.prototype.queueAppend = function (rMsg, departure) {
        var queue = this.__queue;
        return queue.append(rMsg, departure)
    };
    GateKeeper.prototype.onPorterStatusChanged = function (previous, current, docker) {
        Log.info('GateKeeper::onPorterStatusChanged()', previous, current, docker)
    };
    GateKeeper.prototype.onPorterReceived = function (arrival, docker) {
        Log.info('GateKeeper::onPorterReceived()', arrival, docker)
    };
    GateKeeper.prototype.onPorterSent = function (departure, docker) {
    };
    GateKeeper.prototype.onPorterFailed = function (error, departure, docker) {
        Log.info('GateKeeper::onPorterFailed()', error, departure, docker)
    };
    GateKeeper.prototype.onPorterError = function (error, departure, docker) {
        Log.info('GateKeeper::onPorterError()', error, departure, docker)
    };
    ns.network.GateKeeper = GateKeeper
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Transmitter = Interface(null, null);
    Transmitter.prototype.sendContent = function (content, sender, receiver, priority) {
    };
    Transmitter.prototype.sendInstantMessage = function (iMsg, priority) {
    };
    Transmitter.prototype.sendReliableMessage = function (rMsg, priority) {
    };
    var Session = Interface(null, [Transmitter]);
    Session.prototype.getDatabase = function () {
    };
    Session.prototype.getRemoteAddress = function () {
    };
    Session.prototype.getSessionKey = function () {
    };
    Session.prototype.setIdentifier = function (user) {
    };
    Session.prototype.getIdentifier = function () {
    };
    Session.prototype.setActive = function (flag, when) {
    };
    Session.prototype.isActive = function () {
    };
    Session.prototype.queueMessagePackage = function (rMsg, data, priority) {
    };
    ns.network.Transmitter = Transmitter;
    ns.network.Session = Session
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var PlainDeparture = ns.startrek.PlainDeparture;
    var Session = ns.network.Session;
    var GateKeeper = ns.network.GateKeeper;
    var BaseSession = function (db, host, port) {
        GateKeeper.call(this, host, port);
        this.__db = db;
        this.__id = null;
        this.__messenger = null
    };
    Class(BaseSession, GateKeeper, [Session], {
        queueMessagePackage: function (rMsg, data, priority) {
            var ship = new PlainDeparture(data, priority);
            return this.queueAppend(rMsg, ship)
        }
    });
    BaseSession.prototype.getDatabase = function () {
        return this.__db
    };
    BaseSession.prototype.getIdentifier = function () {
        return this.__id
    };
    BaseSession.prototype.setIdentifier = function (user) {
        var identifier = this.__id;
        if (!identifier) {
            if (!user) {
                return false
            }
        } else if (identifier.equals(user)) {
            return false
        }
        this.__id = user;
        return true
    };
    BaseSession.prototype.getMessenger = function () {
        return this.__messenger
    };
    BaseSession.prototype.setMessenger = function (messenger) {
        this.__messenger = messenger
    };
    BaseSession.prototype.sendContent = function (content, sender, receiver, priority) {
        var messenger = this.getMessenger();
        return messenger.sendContent(content, sender, receiver, priority)
    };
    BaseSession.prototype.sendInstantMessage = function (iMsg, priority) {
        var messenger = this.getMessenger();
        return messenger.sendInstantMessage(iMsg, priority)
    };
    BaseSession.prototype.sendReliableMessage = function (rMsg, priority) {
        var messenger = this.getMessenger();
        return messenger.sendReliableMessage(rMsg, priority)
    };
    ns.network.BaseSession = BaseSession
})(DIMP);
