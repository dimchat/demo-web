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
    var Interface = ns.type.Interface;
    var Command = ns.protocol.Command;
    var MetaCommand = ns.protocol.MetaCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var fixMetaAttachment = function (rMsg) {
        var meta = rMsg.getValue('meta');
        if (meta) {
            fixMetaVersion(meta)
        }
    };
    var fixMetaVersion = function (meta) {
        var version = meta['version'];
        if (!version) {
            meta['version'] = meta['type']
        } else if (!meta['type']) {
            meta['type'] = version
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
    var Enum = ns.type.Enum;
    var Base58 = ns.format.Base58;
    var SHA256 = ns.digest.SHA256;
    var RIPEMD160 = ns.digest.RIPEMD160;
    var EntityType = ns.protocol.EntityType;
    var NetworkID = ns.protocol.NetworkID;
    var BTCAddress = ns.mkm.BTCAddress;
    var CompatibleBTCAddress = function (string, network) {
        BTCAddress.call(this, string, network)
    };
    Class(CompatibleBTCAddress, BTCAddress, null, {
        isUser: function () {
            var type = NetworkID.getEntityType(this.getType());
            return EntityType.isUser(type)
        }, isGroup: function () {
            var type = NetworkID.getEntityType(this.getType());
            return EntityType.isGroup(type)
        }
    });
    CompatibleBTCAddress.generate = function (fingerprint, network) {
        network = Enum.getInt(network);
        var digest = RIPEMD160.digest(SHA256.digest(fingerprint));
        var head = [];
        head.push(network);
        for (var i = 0; i < digest.length; ++i) {
            head.push(digest[i])
        }
        var cc = check_code(Uint8Array.from(head));
        var data = [];
        for (var j = 0; j < head.length; ++j) {
            data.push(head[j])
        }
        for (var k = 0; k < cc.length; ++k) {
            data.push(cc[k])
        }
        return new CompatibleBTCAddress(Base58.encode(Uint8Array.from(data)), network)
    };
    CompatibleBTCAddress.parse = function (string) {
        var len = string.length;
        if (len < 26 || len > 35) {
            return null
        }
        var data = Base58.decode(string);
        if (!data || data.length !== 25) {
            return null
        }
        var prefix = data.subarray(0, 21);
        var suffix = data.subarray(21, 25);
        var cc = check_code(prefix);
        if (ns.type.Arrays.equals(cc, suffix)) {
            return new CompatibleBTCAddress(string, data[0])
        } else {
            return null
        }
    };
    var check_code = function (data) {
        var sha256d = SHA256.digest(SHA256.digest(data));
        return sha256d.subarray(0, 4)
    };
    ns.mkm.CompatibleBTCAddress = CompatibleBTCAddress
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var NetworkID = ns.protocol.NetworkID;
    var ID = ns.protocol.ID;
    var Identifier = ns.mkm.Identifier;
    var IDFactory = ns.mkm.GeneralIdentifierFactory;
    var EntityID = function (identifier, name, address, terminal) {
        Identifier.call(this, identifier, name, address, terminal)
    };
    Class(EntityID, Identifier, null, {
        getType: function () {
            var network = this.getAddress().getType();
            return NetworkID.getEntityType(network)
        }
    });
    var EntityIDFactory = function () {
        IDFactory.call(this)
    };
    Class(EntityIDFactory, IDFactory, null, {
        newID: function (string, name, address, terminal) {
            return new EntityID(string, name, address, terminal)
        }, parse: function (identifier) {
            if (!identifier) {
                throw new ReferenceError('ID empty');
            }
            var len = identifier.length;
            if (len === 15 && identifier.toLowerCase() === 'anyone@anywhere') {
                return ID.ANYONE
            } else if (len === 19 && identifier.toLowerCase() === 'everyone@everywhere') {
                return ID.EVERYONE
            } else if (len === 13 && identifier.toLowerCase() === 'moky@anywhere') {
                return ID.FOUNDER
            }
            return IDFactory.prototype.parse.call(this, identifier)
        }
    });
    ns.registerEntityIDFactory = function () {
        ID.setFactory(new EntityIDFactory())
    }
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Address = ns.protocol.Address;
    var BaseAddressFactory = ns.mkm.BaseAddressFactory;
    var CompatibleBTCAddress = ns.mkm.CompatibleBTCAddress;
    var ETHAddress = ns.mkm.ETHAddress;
    var CompatibleAddressFactory = function () {
        BaseAddressFactory.call(this)
    };
    Class(CompatibleAddressFactory, BaseAddressFactory, null, {
        createAddress: function (address) {
            if (!address) {
                throw new ReferenceError('address empty');
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
            if (len === 42) {
                return ETHAddress.parse(address)
            } else if (26 <= len && len <= 35) {
                return CompatibleBTCAddress.parse(address)
            }
            throw new TypeError('invalid address: ' + address);
        }
    });
    ns.registerCompatibleAddressFactory = function () {
        Address.setFactory(new CompatibleAddressFactory())
    }
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
    var TransportableData = ns.format.TransportableData;
    var Meta = ns.protocol.Meta;
    var MetaType = ns.protocol.MetaType;
    var BaseMeta = ns.mkm.BaseMeta;
    var ETHMeta = ns.mkm.ETHMeta;
    var CompatibleBTCAddress = ns.mkm.CompatibleBTCAddress;
    var DefaultMeta = function () {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0])
        } else if (arguments.length === 4) {
            BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3])
        } else {
            throw new SyntaxError('Default meta arguments error: ' + arguments);
        }
        this.__addresses = {}
    };
    Class(DefaultMeta, BaseMeta, null, {
        generateAddress: function (network) {
            network = Enum.getInt(network);
            var address = this.__addresses[network];
            if (!address) {
                address = CompatibleBTCAddress.generate(this.getFingerprint(), network);
                this.__addresses[network] = address
            }
            return address
        }
    });
    var BTCMeta = function () {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0])
        } else if (arguments.length === 2) {
            BaseMeta.call(this, arguments[0], arguments[1])
        } else if (arguments.length === 4) {
            BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3])
        } else {
            throw new SyntaxError('BTC meta arguments error: ' + arguments);
        }
        this.__address = null
    };
    Class(BTCMeta, BaseMeta, null, {
        generateAddress: function (network) {
            network = Enum.getInt(network);
            var address = this.__address;
            if (!address || address.getType() !== network) {
                var key = this.getPublicKey();
                var fingerprint = key.getData();
                address = CompatibleBTCAddress.generate(fingerprint, network);
                this.__address = address
            }
            return address
        }
    });
    var CompatibleMetaFactory = function (version) {
        Object.call(this);
        this.__type = version
    };
    Class(CompatibleMetaFactory, Object, [Meta.Factory], null);
    CompatibleMetaFactory.prototype.createMeta = function (key, seed, fingerprint) {
        if (MetaType.MKM.equals(this.__type)) {
            return new DefaultMeta(this.__type, key, seed, fingerprint)
        } else if (MetaType.BTC.equals(this.__type)) {
            return new BTCMeta(this.__type, key)
        } else if (MetaType.ExBTC.equals(this.__type)) {
            return new BTCMeta(this.__type, key, seed, fingerprint)
        } else if (MetaType.ETH.equals(this.__type)) {
            return new ETHMeta(this.__type, key)
        } else if (MetaType.ExETH.equals(this.__type)) {
            return new ETHMeta(this.__type, key, seed, fingerprint)
        } else {
            return null
        }
    };
    CompatibleMetaFactory.prototype.generateMeta = function (sKey, seed) {
        var fingerprint = null;
        if (seed && seed.length > 0) {
            var sig = sKey.sign(ns.format.UTF8.encode(seed));
            fingerprint = TransportableData.create(sig)
        }
        var pKey = sKey.getPublicKey();
        return this.createMeta(pKey, seed, fingerprint)
    };
    CompatibleMetaFactory.prototype.parseMeta = function (meta) {
        var out;
        var gf = general_factory();
        var type = gf.getMetaType(meta, 0);
        if (MetaType.MKM.equals(type)) {
            out = new DefaultMeta(meta)
        } else if (MetaType.BTC.equals(type)) {
            out = new BTCMeta(meta)
        } else if (MetaType.ExBTC.equals(type)) {
            out = new BTCMeta(meta)
        } else if (MetaType.ETH.equals(type)) {
            out = new ETHMeta(meta)
        } else if (MetaType.ExETH.equals(type)) {
            out = new ETHMeta(meta)
        } else {
            throw new TypeError('unknown meta type: ' + type);
        }
        return out.isValid() ? out : null
    };
    var general_factory = function () {
        var man = ns.mkm.AccountFactoryManager;
        return man.generalFactory
    };
    ns.registerCompatibleMetaFactory = function () {
        Meta.setFactory(MetaType.MKM, new CompatibleMetaFactory(MetaType.MKM));
        Meta.setFactory(MetaType.BTC, new CompatibleMetaFactory(MetaType.BTC));
        Meta.setFactory(MetaType.ExBTC, new CompatibleMetaFactory(MetaType.ExBTC))
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
                this.__plaintext = password.decrypt(data)
            }
        }
        return this.__plaintext
    };
    var decrypt_symmetric_key = function (decryptKey) {
        var data = this.getKey();
        if (!data) {
            return
        }
        var key = decryptKey.decrypt(data);
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
            if (address.isBroadcast()) {
                return 0
            }
            if (address instanceof BTCAddress) {
                return btc_number(address.toString())
            }
            if (address instanceof ETHAddress) {
                return eth_number(address.toString())
            }
            throw new TypeError('address error: ' + address.toString());
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
    var MetaType = ns.protocol.MetaType;
    var Meta = ns.protocol.Meta;
    var BaseVisa = ns.mkm.BaseVisa;
    var BaseBulletin = ns.mkm.BaseBulletin;
    var Register = function (db) {
        this.__db = db
    };
    Register.prototype.createUser = function (nickname, avatar) {
        var privateKey = PrivateKey.generate(PrivateKey.RSA);
        var meta = Meta.generate(MetaType.DEFAULT, privateKey, 'web-demo');
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
        var meta = Meta.generate(MetaType.DEFAULT, privateKey, seed);
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
        return Document.create(type, identifier, data, signature)
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
    var Log = ns.lnc.Log;
    var Runner = ns.fsm.skywalker.Runner;
    var Thread = ns.fsm.threading.Thread;
    var EntityType = ns.protocol.EntityType;
    var Group = ns.mkm.Group;
    var TwinsHelper = ns.TwinsHelper;
    var GroupDelegate = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
        botsManager.setMessenger(messenger)
    };
    Class(GroupDelegate, TwinsHelper, [Group.DataSource], {
        buildGroupName: function (members) {
            var barrack = this.getFacebook();
            var text = barrack.getName(members[0]);
            var nickname;
            for (var i = 1; i < members.length; ++i) {
                nickname = barrack.getName(members[i]);
                if (!nickname || nickname.length === 0) {
                    continue
                }
                text += ', ' + nickname;
                if (text.length > 32) {
                    return text.substring(0, 28) + ' ...'
                }
            }
            return text
        }, getMeta: function (identifier) {
            var barrack = this.getFacebook();
            return !barrack ? null : barrack.getMeta(identifier)
        }, getDocuments: function (identifier) {
            var barrack = this.getFacebook();
            return !barrack ? [] : barrack.getDocuments(identifier)
        }, getBulletin: function (identifier) {
            var barrack = this.getFacebook();
            return !barrack ? null : barrack.getBulletin(identifier)
        }, saveDocument: function (doc) {
            var barrack = this.getFacebook();
            return !barrack ? false : barrack.saveDocument(doc)
        }, getFounder: function (group) {
            var barrack = this.getFacebook();
            return !barrack ? null : barrack.getFounder(group)
        }, getOwner: function (group) {
            var barrack = this.getFacebook();
            return !barrack ? null : barrack.getOwner(group)
        }, getMembers: function (group) {
            var barrack = this.getFacebook();
            return !barrack ? [] : barrack.getMembers(group)
        }, saveMembers: function (members, group) {
            var barrack = this.getFacebook();
            return !barrack ? false : barrack.saveMembers(members, group)
        }, getAssistants: function (group) {
            return botsManager.getAssistants(group)
        }, getFastestAssistant: function (group) {
            return botsManager.getFastestAssistant(group)
        }, setCommonAssistants: function (bots) {
            botsManager.setCommonAssistants(bots)
        }, updateRespondTime: function (content, envelope) {
            return botsManager.updateRespondTime(content, envelope)
        }, getAdministrators: function (group) {
            var barrack = this.getFacebook();
            return !barrack ? [] : barrack.getAdministrators(group)
        }, saveAdministrators: function (admins, group) {
            var barrack = this.getFacebook();
            return !barrack ? false : barrack.saveAdministrators(admins, group)
        }, isFounder: function (user, group) {
            var founder = this.getFounder(group);
            if (founder) {
                return founder.equals(user)
            }
            var gMeta = this.getMeta(group);
            var mMeta = this.getMeta(user);
            if (!gMeta || !mMeta) {
                Log.error('failed to get meta for group', group, user);
                return false
            }
            return gMeta.matchPublicKey(mMeta.getPublicKey())
        }, isOwner: function (user, group) {
            var owner = this.getOwner(group);
            if (owner) {
                return owner.equals(user)
            }
            if (EntityType.GROUP.equals(group.getType())) {
                return this.isFounder(user, group)
            }
            Log.error('only polylogue so far', group);
            return false
        }, isMember: function (user, group) {
            var members = this.getMembers(group);
            if (!members || members.length === 0) {
                Log.error('group members not ready', group);
                return false
            }
            for (var i = 0; i < members.length; ++i) {
                if (members[i].equals(user)) {
                    return true
                }
            }
            return false
        }, isAdministrator: function (user, group) {
            var admins = this.getAdministrators(group);
            if (!admins || admins.length === 0) {
                Log.info('group admins not found', group);
                return false
            }
            for (var i = 0; i < admins.length; ++i) {
                if (admins[i].equals(user)) {
                    return true
                }
            }
            return false
        }, isAssistant: function (user, group) {
            var bots = this.getAssistants(group);
            if (!bots || bots.length === 0) {
                Log.info('group bots not found', group);
                return false
            }
            for (var i = 0; i < bots.length; ++i) {
                if (bots[i].equals(user)) {
                    return true
                }
            }
            return false
        }
    });
    var TripletsHelper = function (delegate) {
        Object.call(this);
        this.__delegate = delegate
    };
    Class(TripletsHelper, Object, null, null);
    TripletsHelper.prototype.getDelegate = function () {
        return this.__delegate
    };
    TripletsHelper.prototype.getFacebook = function () {
        var delegate = this.getDelegate();
        return delegate.getFacebook()
    };
    TripletsHelper.prototype.getMessenger = function () {
        var delegate = this.getDelegate();
        return delegate.getMessenger()
    };
    TripletsHelper.prototype.getArchivist = function () {
        var facebook = this.getFacebook();
        return !facebook ? null : facebook.getArchivist()
    };
    TripletsHelper.prototype.getDatabase = function () {
        var archivist = this.getArchivist();
        return !archivist ? null : archivist.getDatabase()
    };
    var GroupBotsManager = function () {
        Runner.call(this);
        this.__transceiver = null;
        this.__commonAssistants = [];
        this.__candidates = [];
        this.__respondTimes = {}
    };
    Class(GroupBotsManager, Runner, null);
    GroupBotsManager.prototype.setMessenger = function (messenger) {
        this.__transceiver = messenger
    };
    GroupBotsManager.prototype.getMessenger = function () {
        return this.__transceiver
    };
    GroupBotsManager.prototype.getFacebook = function () {
        var messenger = this.getMessenger();
        return !messenger ? null : messenger.getFacebook()
    };
    GroupBotsManager.prototype.updateRespondTime = function (content, envelope) {
        var sender = envelope.getSender();
        if (!EntityType.BOT.equals(sender.getType())) {
            return false
        }
        var origin = content.getOriginalEnvelope();
        var originalReceiver = !origin ? null : origin.getReceiver();
        if (!sender.equals(originalReceiver)) {
            return false
        }
        var time = !origin ? null : origin.getTime();
        if (!time) {
            return false
        }
        var duration = (new Date()).getTime() - time.getTime();
        if (duration <= 0) {
            return false
        }
        var cached = this.__respondTimes[sender];
        if (cached && cached <= duration) {
            return false
        }
        this.__respondTimes[sender] = duration;
        return true
    };
    GroupBotsManager.prototype.setCommonAssistants = function (bots) {
        addAll(this.__candidates, bots);
        this.__commonAssistants = bots
    };
    var addAll = function (toSet, fromItems) {
        var item;
        for (var i = 0; i < fromItems.length; ++i) {
            item = fromItems[i];
            if (toSet.indexOf(item) <= 0) {
                toSet.push(item)
            }
        }
    };
    GroupBotsManager.prototype.getAssistants = function (group) {
        var facebook = this.getFacebook();
        var bots = !facebook ? null : facebook.getAssistants(group);
        if (!bots || bots.length === 0) {
            return this.__commonAssistants
        }
        addAll(this.__candidates, bots);
        return bots
    };
    GroupBotsManager.prototype.getFastestAssistant = function (group) {
        var bots = this.getAssistants(group);
        if (!bots || bots.length === 0) {
            Log.warning('group bots not found: ' + group.toString());
            return null
        }
        var prime = null;
        var primeDuration;
        var duration;
        var ass;
        for (var i = 0; i < bots.length; ++i) {
            ass = bots[i];
            duration = this.__respondTimes[ass];
            if (!duration) {
                Log.info('group bot not respond yet, ignore it', ass, group);
                continue
            } else if (!primeDuration) {
            } else if (primeDuration < duration) {
                Log.info('this bot is slower, skip it', ass, prime, group);
                continue
            }
            prime = ass;
            primeDuration = duration
        }
        if (!prime) {
            prime = bots[0];
            Log.info('no bot responded, take the first one', bots, group)
        } else {
            Log.info('got the fastest bot with respond time', primeDuration, prime, group)
        }
        return prime
    };
    GroupBotsManager.prototype.process = function () {
        var messenger = this.getMessenger();
        var facebook = this.getFacebook();
        if (!facebook || !messenger) {
            return false
        }
        var session = messenger.getSession();
        if (session && session.getSessionKey() && session.isActive()) {
        } else {
            return false
        }
        var visa;
        try {
            var me = facebook.getCurrentUser();
            visa = !me ? null : me.getVisa();
            if (!visa) {
                Log.error('failed to get visa', me);
                return false
            }
        } catch (e) {
            Log.error('failed to get current user', e);
            return false
        }
        var bots = this.__candidates;
        this.__candidates = {};
        var item;
        for (var i = 0; i < bots.length; ++i) {
            item = bots[i];
            if (this.__respondTimes[item]) {
                Log.info('group bot already responded', item);
                continue
            }
            try {
                messenger.sendVisa(visa, item, false)
            } catch (e) {
                Log.error('failed to query assistant', item, e)
            }
        }
        return false
    };
    var botsManager = new GroupBotsManager();
    var thread = new Thread(botsManager);
    thread.start();
    ns.TripletsHelper = TripletsHelper;
    ns.group.GroupDelegate = GroupDelegate
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var Station = ns.mkm.Station;
    var TripletsHelper = ns.TripletsHelper;
    var AdminManager = function (delegate) {
        TripletsHelper.call(this, delegate)
    };
    Class(AdminManager, TripletsHelper, null, null);
    AdminManager.prototype.updateAdministrators = function (newAdmins, group) {
        var delegate = this.getDelegate();
        var barrack = this.getFacebook();
        var user = !barrack ? null : barrack.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return false
        }
        var me = user.getIdentifier();
        var sKey = !barrack ? null : barrack.getPrivateKeyForVisaSignature(me);
        var isOwner = delegate.isOwner(me, group);
        if (!isOwner) {
            return false
        }
        var doc = delegate.getBulletin(group);
        if (!doc) {
            Log.error('failed to get group document', group);
            return false
        }
        doc.setProperty('administrators', ID.revert(newAdmins));
        var signature = !sKey ? null : doc.sign(sKey);
        if (!signature) {
            Log.error('failed to sign document for group', group, me);
            return false
        } else if (!delegate.saveDocument(doc)) {
            Log.error('failed to save document for group', group);
            return false
        } else {
            Log.info('group document updated', group)
        }
        return this.broadcastGroupDocument(doc)
    };
    AdminManager.prototype.broadcastGroupDocument = function (doc) {
        var delegate = this.getDelegate();
        var barrack = this.getFacebook();
        var transceiver = this.getMessenger();
        var user = !barrack ? null : barrack.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return false
        }
        var me = user.getIdentifier();
        var group = doc.getIdentifier();
        var meta = !barrack ? null : barrack.getMeta(group);
        var content = DocumentCommand.response(group, meta, doc);
        transceiver.sendContent(content, me, Station.ANY, 1);
        var item;
        var bots = delegate.getAssistants(group);
        if (bots && bots.length > 0) {
            for (var i = 0; i < bots.length; ++i) {
                item = bots[i];
                if (item.equals(me)) {
                    Log.error('should not be a bot here', me);
                    continue
                }
                transceiver.sendContent(content, me, item, 1)
            }
            return true
        }
        var members = delegate.getMembers(group);
        if (!members || members.length === 0) {
            Log.error('failed to get group members', group);
            return false
        }
        for (var j = 0; j < members.length; ++j) {
            item = members[j];
            if (item.equals(me)) {
                Log.info('skip cycled message', item, group);
                continue
            }
            transceiver.sendContent(content, me, item, 1)
        }
        return true
    };
    ns.group.AdminManager = AdminManager
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var ResetCommand = ns.protocol.group.ResetCommand;
    var ResignCommand = ns.protocol.group.ResignCommand;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var TripletsHelper = ns.TripletsHelper;
    var GroupCommandHelper = function (delegate) {
        TripletsHelper.call(this, delegate)
    };
    Class(GroupCommandHelper, TripletsHelper, null, null);
    GroupCommandHelper.prototype.saveGroupHistory = function (content, rMsg, group) {
        if (this.isCommandExpired(content)) {
            Log.warning('drop expired command', content.getCmd(), rMsg.getSender(), group);
            return false
        }
        var cmdTime = content.getTime();
        if (!cmdTime) {
            Log.error('group command error: ' + content.toString())
        } else {
            var current = (new Date()).getTime() + 65536;
            if (cmdTime.getTime() > current) {
                Log.error('group command time error', cmdTime, content);
                return false
            }
        }
        var db = this.getDatabase();
        if (Interface.conforms(content, ResetCommand)) {
            Log.warning('cleaning group history for "reset" command', rMsg.getSender(), group);
            return db.clearGroupMemberHistories(group)
        }
        return db.saveGroupHistory(content, rMsg, group)
    };
    GroupCommandHelper.prototype.getGroupHistories = function (group) {
        var db = this.getDatabase();
        return db.getGroupHistories(group)
    };
    GroupCommandHelper.prototype.getResetCommandMessage = function (group) {
        var db = this.getDatabase();
        return db.getResetCommandMessage(group)
    };
    GroupCommandHelper.prototype.clearGroupMemberHistories = function (group) {
        var db = this.getDatabase();
        return db.clearGroupMemberHistories(group)
    };
    GroupCommandHelper.prototype.clearGroupAdminHistories = function (group) {
        var db = this.getDatabase();
        return db.clearGroupAdminHistories(group)
    };
    GroupCommandHelper.prototype.isCommandExpired = function (content) {
        var group = content.getGroup();
        if (!group) {
            Log.error('group content error: ' + content.toString());
            return true
        }
        if (Interface.conforms(content, ResignCommand)) {
            var delegate = this.getDelegate();
            var doc = delegate.getBulletin(group);
            if (!doc) {
                Log.error('group document not exists: ' + group.toString());
                return true
            }
            return DocumentHelper.isBefore(doc.getTime(), content.getTime())
        }
        var pair = this.getResetCommandMessage(group);
        var cmd = pair[0];
        if (!cmd) {
            return false
        }
        return DocumentHelper.isBefore(cmd.getTime(), content.getTime())
    };
    GroupCommandHelper.prototype.getMembersFromCommand = function (content) {
        var members = content.getMembers();
        if (!members) {
            members = [];
            var single = content.getMember();
            if (single) {
                members.push(single)
            }
        }
        return members
    };
    ns.group.GroupCommandHelper = GroupCommandHelper
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var TripletsHelper = ns.TripletsHelper;
    var GroupPacker = function (delegate) {
        TripletsHelper.call(this, delegate)
    };
    Class(GroupPacker, TripletsHelper, null, null);
    GroupPacker.prototype.packMessage = function (content, sender) {
        var envelope = Envelope.create(sender, ID.ANYONE, null);
        var iMsg = InstantMessage.create(envelope, content);
        iMsg.setString('group', content.getGroup());
        return this.encryptAndSignMessage(iMsg)
    };
    GroupPacker.prototype.encryptAndSignMessage = function (iMsg) {
        var transceiver = this.getMessenger();
        var sMsg = !transceiver ? null : transceiver.encryptMessage(iMsg);
        if (!sMsg) {
            Log.error('failed to encrypt message', iMsg.getSender(), iMsg.getReceiver());
            return null
        }
        var rMsg = !transceiver ? null : transceiver.signMessage(sMsg);
        if (!rMsg) {
            Log.error('failed to sign message', iMsg.getSender(), iMsg.getReceiver());
            return null
        }
        return rMsg
    };
    GroupPacker.prototype.splitInstantMessage = function (iMsg, allMembers) {
        var messages = [];
        var sender = iMsg.getSender();
        var info;
        var item;
        var receiver;
        for (var i = 0; i < allMembers.length; ++i) {
            receiver = allMembers[i];
            if (receiver.equals(sender)) {
                continue
            }
            Log.info('split group message for member', receiver);
            info = iMsg.copyMap(false);
            info['receiver'] = receiver.toString();
            item = InstantMessage.parse(info);
            if (!item) {
                Log.error('failed to repack message', receiver);
                continue
            }
            messages.push(item)
        }
        return messages
    };
    GroupPacker.prototype.splitReliableMessage = function (rMsg, allMembers) {
        var messages = [];
        var sender = rMsg.getSender();
        var keys = rMsg.getEncryptedKeys();
        if (!keys) {
            keys = {}
        }
        var keyData;
        var info;
        var item;
        var receiver;
        for (var i = 0; i < allMembers.length; ++i) {
            receiver = allMembers[i];
            if (sender.equals(receiver)) {
                Log.info('skip cycled message', receiver);
                continue
            }
            Log.info('split group message for member', receiver);
            info = rMsg.copyMap(false);
            info['receiver'] = receiver.toString();
            delete info['keys'];
            keyData = keys[receiver.toString()];
            if (keyData) {
                info['key'] = keyData
            }
            item = ReliableMessage.parse(info);
            if (!item) {
                Log.error('failed to repack message', receiver);
                continue
            }
            messages.push(item)
        }
        return messages
    };
    ns.group.GroupPacker = GroupPacker
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var GroupCommand = ns.protocol.GroupCommand;
    var ResetCommand = ns.protocol.group.ResetCommand
    var ResignCommand = ns.protocol.group.ResignCommand
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var TripletsHelper = ns.TripletsHelper;
    var GroupHistoryBuilder = function (delegate) {
        TripletsHelper.call(this, delegate);
        this.__helper = this.createHelper()
    };
    Class(GroupHistoryBuilder, TripletsHelper, null, null);
    GroupHistoryBuilder.prototype.getHelper = function () {
        return this.__helper
    };
    GroupHistoryBuilder.prototype.createHelper = function () {
        var delegate = this.getDelegate();
        return new ns.group.GroupCommandHelper(delegate)
    };
    GroupHistoryBuilder.prototype.buildGroupHistories = function (group) {
        var messages = [];
        var doc;
        var reset;
        var rMsg;
        var docPair = this.buildDocumentCommand(group);
        doc = docPair[0];
        rMsg = docPair[1];
        if (!doc || !rMsg) {
            Log.warning('failed to build "document" command for group', group);
            return messages
        } else {
            messages.push(rMsg)
        }
        var helper = this.getHelper();
        var resPair = helper.getResetCommandMessage(group);
        reset = resPair[0];
        rMsg = resPair[1];
        if (!reset || !rMsg) {
            Log.warning('failed to get "reset" command for group', group);
            return messages
        } else {
            messages.push(rMsg)
        }
        var histories = helper.getGroupHistories(group);
        var hisPair;
        var first;
        var second;
        for (var i = 0; i < histories.length; ++i) {
            hisPair = histories[i];
            first = hisPair[0];
            second = hisPair[1];
            if (Interface.conforms(first, ResetCommand)) {
                Log.info('skip "reset" command for group', group);
                continue
            } else if (Interface.conforms(first, ResignCommand)) {
                if (DocumentHelper.isBefore(doc.getTime(), first.getTime())) {
                    Log.warning('expired command in group', group);
                    continue
                }
            } else {
                if (DocumentHelper.isBefore(reset.getTime(), first.getTime())) {
                    Log.warning('expired command in group', group);
                    continue
                }
            }
            messages.push(second)
        }
        return messages
    };
    GroupHistoryBuilder.prototype.buildDocumentCommand = function (group) {
        var delegate = this.getDelegate();
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        var doc = !delegate ? null : delegate.getBulletin(group);
        if (!user || !doc) {
            Log.error('document not found for group', group);
            return [null, null]
        }
        var me = user.getIdentifier();
        var meta = !delegate ? null : delegate.getMeta(group);
        var command = DocumentCommand.response(group, meta, doc);
        var rMsg = this.packBroadcastMessage(me, command);
        return [doc, rMsg]
    };
    GroupHistoryBuilder.prototype.buildResetCommand = function (group, members) {
        var delegate = this.getDelegate();
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        var owner = !delegate ? null : delegate.getOwner(group);
        if (!user || !owner) {
            Log.error('owner not found for group', group);
            return [null, null]
        }
        var me = user.getIdentifier();
        if (!owner.equals(me)) {
            var admins = delegate.getAdministrators(group);
            if (!admins || admins.indexOf(me) < 0) {
                Log.warning('not permit to build "reset" command for group"', group, me);
                return [null, null]
            }
        }
        if (!members) {
            members = delegate.getMembers(group)
        }
        var command = GroupCommand.reset(group, members);
        var rMsg = this.packBroadcastMessage(me, command);
        return [command, rMsg]
    };
    GroupHistoryBuilder.prototype.packBroadcastMessage = function (sender, content) {
        var messenger = this.getMessenger();
        var envelope = Envelope.create(sender, ID.ANYONE, null);
        var iMsg = InstantMessage.create(envelope, content);
        var sMsg = !messenger ? null : messenger.encryptMessage(iMsg);
        if (!sMsg) {
            Log.error('failed to encrypt message', envelope);
            return null
        }
        var rMsg = !messenger ? null : messenger.signMessage(sMsg);
        if (!rMsg) {
            Log.error('failed to sign message', envelope)
        }
        return rMsg
    };
    ns.group.GroupHistoryBuilder = GroupHistoryBuilder
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var ForwardContent = ns.protocol.ForwardContent;
    var GroupCommand = ns.protocol.GroupCommand;
    var TripletsHelper = ns.TripletsHelper;
    var GroupEmitter = function (delegate) {
        TripletsHelper.call(this, delegate);
        this.__packer = this.createPacker()
    };
    Class(GroupEmitter, TripletsHelper, null, null);
    GroupEmitter.POLYLOGUE_LIMIT = 32;
    GroupEmitter.SECRET_GROUP_LIMIT = 16;
    GroupEmitter.prototype.getPacker = function () {
        return this.__packer
    };
    GroupEmitter.prototype.createPacker = function () {
        var delegate = this.getDelegate();
        return new ns.group.GroupPacker(delegate)
    };
    var attachGroupTimes = function (group, iMsg) {
        if (Interface.conforms(iMsg.getContent(), GroupCommand)) {
            return false
        }
        var facebook = this.getFacebook();
        var doc = !facebook ? null : facebook.getBulletin(group);
        if (!doc) {
            Log.warning('failed to get bulletin document', group);
            return false
        }
        var lastDocumentTime = doc.getTime();
        if (!lastDocumentTime) {
            Log.warning('document error', doc)
        } else {
            iMsg.setDateTime('GDT', lastDocumentTime)
        }
        var archivist = this.getArchivist();
        var lastHistoryTime = archivist.getLastGroupHistoryTime(group);
        if (!lastHistoryTime) {
            Log.warning('failed to get history time', group)
        } else {
            iMsg.setDateTime('GHT', lastHistoryTime)
        }
        return true
    };
    GroupEmitter.prototype.sendInstantMessage = function (iMsg, priority) {
        if (!priority) {
            priority = 0
        }
        var content = iMsg.getContent();
        var group = content.getGroup();
        if (!group) {
            Log.warning('not a group message', iMsg);
            return null
        } else {
            attachGroupTimes.call(this, group, iMsg)
        }
        var delegate = this.getDelegate();
        var prime = delegate.getFastestAssistant(group);
        if (prime != null) {
            return forwardMessage.call(this, iMsg, prime, group, priority)
        }
        var members = delegate.getMembers(group);
        if (!members || members.length === 0) {
            Log.warning('failed to get members', group);
            return null
        }
        if (members.length < GroupEmitter.SECRET_GROUP_LIMIT) {
            var success = splitAndSendMessage.call(this, iMsg, members, group, priority);
            Log.info('split message(s) for group', success, group);
            return null
        } else {
            Log.info('splitting message for members', members.length, group);
            return disperseMessage.call(this, iMsg, members, group, priority)
        }
    };
    var forwardMessage = function (iMsg, bot, group, priority) {
        if (!priority) {
            priority = 0
        }
        var transceiver = this.getMessenger();
        var packer = this.getPacker();
        iMsg.setString('group', group);
        var rMsg = packer.encryptAndSignMessage(iMsg);
        if (rMsg == null) {
            Log.error('failed to encrypt & sign message', iMsg.getSender(), group);
            return null
        }
        var content = ForwardContent.create(rMsg);
        var pair = transceiver.sendContent(content, null, bot, priority);
        if (!pair || !pair[1]) {
            Log.warning('failed to forward message to group bot', group, bot)
        }
        return rMsg
    };
    var disperseMessage = function (iMsg, members, group, priority) {
        if (!priority) {
            priority = 0
        }
        var transceiver = this.getMessenger();
        var packer = this.getPacker();
        iMsg.setString('group', group);
        var sender = iMsg.getSender();
        var rMsg = packer.encryptAndSignMessage(iMsg);
        if (!rMsg) {
            Log.error('failed to encrypt & sign message', sender, group);
            return null
        }
        var messages = packer.splitReliableMessage(rMsg, members);
        var receiver;
        var ok;
        var r_msg;
        for (var i = 0; i < messages.length; ++i) {
            r_msg = messages[i];
            receiver = r_msg.receiver;
            if (sender.equals(receiver)) {
                Log.info('cycled message', sender, receiver, group);
                continue
            }
            ok = transceiver.sendReliableMessage(r_msg, priority);
            if (!ok) {
                Log.error('failed to send message', sender, receiver, group)
            }
        }
        return rMsg
    };
    var splitAndSendMessage = function (iMsg, members, group, priority) {
        if (!priority) {
            priority = 0
        }
        var transceiver = this.getMessenger();
        var packer = this.getPacker();
        var sender = iMsg.getSender();
        var success = 0;
        var messages = packer.splitInstantMessage(iMsg, members);
        var receiver;
        var rMsg;
        var i_msg;
        for (var i = 0; i < messages.length; ++i) {
            i_msg = messages[i];
            receiver = i_msg.receiver;
            if (sender.equals(receiver)) {
                Log.info('cycled message', sender, receiver, group);
                continue
            }
            rMsg = transceiver.sendInstantMessage(i_msg, priority);
            if (rMsg) {
                Log.error('failed to send message', sender, receiver, group);
                continue
            }
            success += 1
        }
        return success
    };
    ns.group.GroupEmitter = GroupEmitter
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Arrays = ns.type.Arrays;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var MetaCommand = ns.protocol.MetaCommand
    var DocumentCommand = ns.protocol.DocumentCommand;
    var ForwardContent = ns.protocol.ForwardContent;
    var GroupCommand = ns.protocol.GroupCommand;
    var Station = ns.mkm.Station;
    var TripletsHelper = ns.TripletsHelper;
    var GroupManager = function (delegate) {
        TripletsHelper.call(this, delegate);
        this.__packer = this.createPacker();
        this.__helper = this.createHelper();
        this.__builder = this.createBuilder()
    };
    Class(GroupManager, TripletsHelper, null, null);
    GroupManager.prototype.getPacker = function () {
        return this.__packer
    };
    GroupManager.prototype.getHelper = function () {
        return this.__helper
    };
    GroupManager.prototype.getBuilder = function () {
        return this.__builder
    };
    GroupManager.prototype.createPacker = function () {
        var delegate = this.getDelegate();
        return new ns.group.GroupPacker(delegate)
    };
    GroupManager.prototype.createHelper = function () {
        var delegate = this.getDelegate();
        return new ns.group.GroupCommandHelper(delegate)
    };
    GroupManager.prototype.createBuilder = function () {
        var delegate = this.getDelegate();
        return new ns.group.GroupHistoryBuilder(delegate)
    };
    GroupManager.prototype.createGroup = function (members) {
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return null
        }
        var founder = user.getIdentifier();
        var pos = members.indexOf(founder);
        if (pos < 0) {
            members.unshift(founder)
        } else if (pos > 0) {
            members.splice(pos, 1);
            members.unshift(founder)
        }
        var delegate = this.getDelegate();
        var database = this.getDatabase();
        var groupName = delegate.buildGroupName(members);
        var register = new ns.Register(database);
        var group = register.createGroup(founder, groupName);
        Log.info('new group with founder', group, founder);
        var meta = delegate.getMeta(group);
        var doc = delegate.getBulletin(group);
        var content;
        if (doc) {
            content = DocumentCommand.response(group, meta, doc)
        } else if (meta) {
            content = MetaCommand.response(group, meta)
        } else {
            Log.error('failed to get group info', groupName);
            return null
        }
        var ok = sendCommand.call(this, content, Station.ANY);
        if (!ok) {
            Log.error('failed to upload meta/document to neighbor station')
        }
        if (this.resetMembers(group, members)) {
            Log.info('created group with members', group, members.length)
        } else {
            Log.error('failed to create group with members', group, members.length)
        }
        return group
    };
    GroupManager.prototype.resetMembers = function (group, newMembers) {
        var delegate = this.getDelegate();
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return false
        }
        var me = user.getIdentifier();
        var first = newMembers[0];
        var ok = delegate.isOwner(first, group);
        if (!ok) {
            Log.error('group owner must be the first member', first, group);
            return false
        }
        var oldMembers = delegate.getMembers(group);
        var expelList = [];
        var item;
        for (var i = 0; i < oldMembers.length; ++i) {
            item = oldMembers[i];
            if (newMembers.indexOf(item) < 0) {
                expelList.push(item)
            }
        }
        var isOwner = me.equals(first);
        var isAdmin = delegate.isAdministrator(me, group);
        var canReset = isOwner || isAdmin;
        if (!canReset) {
            Log.error('cannot reset members', group);
            return false
        }
        var builder = this.getBuilder();
        var pair = builder.buildResetCommand(group, newMembers);
        var reset = pair[0];
        var rMsg = pair[1];
        if (!reset || !rMsg) {
            Log.error('failed to build "reset" command', group);
            return false
        }
        var helper = this.getHelper();
        if (!helper.saveGroupHistory(reset, rMsg, group)) {
            Log.error('failed to save "reset" command', group);
            return false
        } else if (!delegate.saveMembers(newMembers, group)) {
            Log.error('failed to update members', group);
            return false
        } else {
            Log.info('group members updated', group, newMembers.length)
        }
        var messages = builder.buildGroupHistories(group);
        var forward = ForwardContent.create(messages);
        var bots = delegate.getAssistants(group);
        if (bots && bots.length > 0) {
            return sendCommand.call(this, forward, bots)
        } else {
            sendCommand.call(this, forward, newMembers);
            sendCommand.call(this, forward, expelList)
        }
        return true
    };
    GroupManager.prototype.inviteMembers = function (group, newMembers) {
        var facebook = this.getFacebook();
        var delegate = this.getDelegate();
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            return false
        }
        var me = user.getIdentifier();
        var oldMembers = delegate.getMembers(group);
        var isOwner = delegate.isOwner(me, group);
        var isAdmin = delegate.isAdministrator(me, group);
        var isMember = delegate.isMember(me, group);
        var canReset = isOwner || isAdmin;
        if (canReset) {
            var members = oldMembers.slice();
            var item;
            for (var i = 0; i < newMembers.length; ++i) {
                item = newMembers[i];
                if (members.indexOf(item) < 0) {
                    members.push(item)
                }
            }
            return this.resetMembers(group, members)
        } else if (!isMember) {
            Log.error('cannot invite member', group);
            return false
        }
        var packer = this.getPacker();
        var helper = this.getHelper();
        var builder = this.getBuilder();
        var invite = GroupCommand.invite(group, newMembers);
        var rMsg = packer.packMessage(invite, me);
        if (!rMsg) {
            Log.error('failed to build "invite" command', group);
            return false
        } else if (!helper.saveGroupHistory(invite, rMsg, group)) {
            Log.error('failed to save "invite" command', group);
            return false
        }
        var forward = ForwardContent.create(rMsg);
        var bots = delegate.getAssistants(group);
        if (bots && bots.length > 0) {
            return sendCommand.call(this, forward, bots)
        }
        sendCommand.call(this, forward, oldMembers);
        var messages = builder.buildGroupHistories(group);
        forward = ForwardContent.create(messages);
        sendCommand.call(this, forward, newMembers);
        return true
    };
    GroupManager.prototype.quitGroup = function (group) {
        var delegate = this.getDelegate();
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return false
        }
        var me = user.getIdentifier();
        var members = delegate.getMembers(group);
        var isOwner = delegate.isOwner(me, group);
        var isAdmin = delegate.isAdministrator(me, group);
        var isMember = members.indexOf(me) >= 0;
        if (isOwner) {
            Log.error('owner cannot quit from group', group);
            return false
        } else if (isAdmin) {
            Log.error('administrator cannot quit from group', group);
            return false
        }
        if (isMember) {
            Log.warning('quitting group', group);
            members = members.slice();
            Arrays.remove(members, me);
            var ok = delegate.saveMembers(members, group);
            if (!ok) {
                Log.error('failed to save members', group)
            }
        } else {
            Log.warning('member not in group', group)
        }
        var packer = this.getPacker();
        var content = GroupCommand.quit(group);
        var rMsg = packer.packMessage(content, me);
        if (!rMsg) {
            Log.error('failed to pack group message', group);
            return false
        }
        var forward = ForwardContent.create(rMsg);
        var bots = delegate.getAssistants(group);
        if (bots && bots.length > 0) {
            return sendCommand.call(this, forward, bots)
        } else {
            return sendCommand.call(this, forward, members)
        }
    };
    var sendCommand = function (content, receiver) {
        var members;
        if (Interface.conforms(receiver, ID)) {
            members = [receiver]
        } else if (receiver instanceof Array && receiver.length > 0) {
            members = receiver
        } else {
            Log.error('failed to send command', receiver);
            return false
        }
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return false
        }
        var me = user.getIdentifier();
        var transceiver = this.getMessenger();
        for (var i = 0; i < members.length; ++i) {
            receiver = members[i];
            if (me.equals(receiver)) {
                Log.info('skip cycled message', receiver);
                continue
            }
            transceiver.sendContent(content, me, receiver, 1)
        }
        return true
    };
    ns.group.GroupManager = GroupManager
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Arrays = ns.type.Arrays;
    var ID = ns.protocol.ID;
    var Group = ns.mkm.Group;
    var SharedGroupManager = function () {
        Object.call(this);
        this.__barrack = null;
        this.__transceiver = null;
        this.__delegate = null;
        this.__manager = null;
        this.__admin_man = null;
        this.__emitter = null
    };
    Class(SharedGroupManager, Object, [Group.DataSource], null);
    SharedGroupManager.prototype.getFacebook = function () {
        return this.__barrack
    };
    SharedGroupManager.prototype.getMessenger = function () {
        return this.__transceiver
    };
    SharedGroupManager.prototype.setFacebook = function (facebook) {
        this.__barrack = facebook;
        clearDelegates.call(this)
    };
    SharedGroupManager.prototype.setMessenger = function (messenger) {
        this.__transceiver = messenger;
        clearDelegates.call(this)
    };
    var clearDelegates = function () {
        this.__delegate = null;
        this.__manager = null;
        this.__admin_man = null;
        this.__emitter = null
    };
    SharedGroupManager.prototype.getGroupDelegate = function () {
        var delegate = this.__delegate;
        if (!delegate) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (facebook && messenger) {
                delegate = new ns.group.GroupDelegate(facebook, messenger)
                this.__delegate = delegate
            }
        }
        return delegate
    };
    SharedGroupManager.prototype.getGroupManager = function () {
        var man = this.__manager;
        if (!man) {
            var delegate = this.getGroupDelegate();
            if (delegate) {
                man = new ns.group.GroupManager(delegate);
                this.__manager = man
            }
        }
        return man
    };
    SharedGroupManager.prototype.getAdminManager = function () {
        var man = this.__admin_man;
        if (!man) {
            var delegate = this.getGroupDelegate();
            if (delegate) {
                man = new ns.group.AdminManager(delegate);
                this.__admin_man = man
            }
        }
        return man
    };
    SharedGroupManager.prototype.getGroupEmitter = function () {
        var emitter = this.__emitter;
        if (!emitter) {
            var delegate = this.getGroupDelegate();
            if (delegate) {
                emitter = new ns.group.GroupEmitter(delegate);
                this.__emitter = emitter
            }
        }
        return emitter
    };
    SharedGroupManager.prototype.buildGroupName = function (members) {
        var delegate = this.getGroupDelegate();
        return delegate.buildGroupName(members)
    };
    SharedGroupManager.prototype.getMeta = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getMeta(group)
    };
    SharedGroupManager.prototype.getDocuments = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getDocuments(group)
    };
    SharedGroupManager.prototype.getBulletin = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getBulletin(group)
    };
    SharedGroupManager.prototype.getFounder = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getFounder(group)
    };
    SharedGroupManager.prototype.getOwner = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getOwner(group)
    };
    SharedGroupManager.prototype.getAssistants = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getAssistants(group)
    };
    SharedGroupManager.prototype.getMembers = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getMembers(group)
    };
    SharedGroupManager.prototype.getAdministrators = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getAdministrators(group)
    };
    SharedGroupManager.prototype.isOwner = function (user, group) {
        var delegate = this.getGroupDelegate();
        return delegate.isOwner(user, group)
    };
    SharedGroupManager.prototype.broadcastGroupDocument = function (doc) {
        var delegate = this.getGroupDelegate();
        return delegate.broadcastGroupDocument(doc)
    };
    SharedGroupManager.prototype.createGroup = function (members) {
        var delegate = this.getGroupManager();
        return delegate.createGroup(members)
    };
    SharedGroupManager.prototype.updateAdministrators = function (newAdmins, group) {
        var delegate = this.getAdminManager();
        return delegate.updateAdministrators(newAdmins, group)
    };
    SharedGroupManager.prototype.resetGroupMembers = function (newMembers, group) {
        var delegate = this.getGroupManager();
        return delegate.resetMembers(group, newMembers)
    };
    SharedGroupManager.prototype.expelGroupMembers = function (expelMembers, group) {
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            return false
        }
        var delegate = this.getGroupDelegate();
        var me = user.getIdentifier();
        var oldMembers = delegate.getMembers(group);
        var isOwner = delegate.isOwner(me, group);
        var isAdmin = delegate.isAdministrator(me, group);
        var canReset = isOwner || isAdmin;
        if (canReset) {
            var members = oldMembers.slice();
            var item;
            for (var i = 0; i < expelMembers.length; ++i) {
                item = expelMembers[i];
                Arrays.remove(members, item)
            }
            return this.resetGroupMembers(members, group)
        }
        throw new Error('Cannot expel members from group: ' + group.toString());
    };
    SharedGroupManager.prototype.inviteGroupMembers = function (newMembers, group) {
        var delegate = this.getGroupManager();
        return delegate.inviteMembers(group, newMembers)
    };
    SharedGroupManager.prototype.quitGroup = function (group) {
        var delegate = this.getGroupManager();
        return delegate.quitGroup(group)
    };
    SharedGroupManager.prototype.sendInstantMessage = function (iMsg, priority) {
        if (!priority) {
            priority = 0
        }
        iMsg.setValue('GF', true);
        var delegate = this.getGroupEmitter();
        return delegate.sendInstantMessage(iMsg, priority)
    };
    ns.group.SharedGroupManager = new SharedGroupManager()
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
