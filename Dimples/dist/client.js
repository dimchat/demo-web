/**
 *  DIM-Client (v0.2.2)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Feb. 21, 2023
 * @copyright (c) 2023 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
(function (ns) {
    var Class = ns.type.Class;
    var BaseState = ns.fsm.BaseState;
    var SessionState = function (name) {
        BaseState.call(this);
        this.__name = name;
        this.__enterTime = 0;
    };
    Class(SessionState, BaseState, null);
    SessionState.DEFAULT = "default";
    SessionState.CONNECTING = "connecting";
    SessionState.CONNECTED = "connected";
    SessionState.HANDSHAKING = "handshaking";
    SessionState.RUNNING = "running";
    SessionState.ERROR = "error";
    SessionState.prototype.equals = function (other) {
        if (this === other) {
            return true;
        } else {
            if (!other) {
                return false;
            } else {
                if (other instanceof SessionState) {
                    return this.__name === other.toString();
                } else {
                    return this.__name === other;
                }
            }
        }
    };
    SessionState.prototype.valueOf = function () {
        return this.__name;
    };
    SessionState.prototype.toString = function () {
        return this.__name;
    };
    SessionState.prototype.getName = function () {
        return this.__name;
    };
    SessionState.prototype.getEnterTime = function () {
        return this.__enterTime;
    };
    SessionState.prototype.onEnter = function (previous, machine, now) {
        this.__enterTime = now;
    };
    SessionState.prototype.onExit = function (next, machine, now) {
        this.__enterTime = 0;
    };
    SessionState.prototype.onPause = function (machine) {};
    SessionState.prototype.onResume = function (machine) {};
    ns.network.SessionState = SessionState;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var BaseTransition = ns.fsm.BaseTransition;
    var AutoMachine = ns.fsm.AutoMachine;
    var DockerStatus = ns.startrek.port.DockerStatus;
    var SessionState = ns.network.SessionState;
    var StateMachine = function (session) {
        AutoMachine.call(this, SessionState.DEFAULT);
        this.__session = session;
        set_state(this, default_state());
        set_state(this, connecting_state());
        set_state(this, connected_state());
        set_state(this, handshaking_state());
        set_state(this, running_state());
        set_state(this, error_state());
    };
    Class(StateMachine, AutoMachine, null, {
        getContext: function () {
            return this;
        },
        getSessionKey: function () {
            return this.__session.getKey();
        },
        getSessionID: function () {
            return this.__session.getIdentifier();
        },
        getStatus: function () {
            var gate = this.__session.getGate();
            var docker = gate.getDocker(
                this.__session.getRemoteAddress(),
                null,
                null
            );
            return docker ? docker.getStatus() : DockerStatus.ERROR;
        }
    });
    var set_state = function (fsm, state) {
        fsm.setState(state.name, state);
    };
    var new_transition = function (target, evaluate) {
        var trans = new BaseTransition(target);
        trans.evaluate = evaluate;
        return trans;
    };
    var is_expired = function (state, now) {
        var enterTime = state.getEnterTime();
        return 0 < enterTime && enterTime < now - 30 * 1000;
    };
    var new_state = function (name, transitions) {
        var state = new SessionState(name);
        for (var i = 1; i < arguments.length; ++i) {
            state.addTransition(arguments[i]);
        }
        return state;
    };
    var default_state = function () {
        return new_state(
            SessionState.DEFAULT,
            new_transition(SessionState.CONNECTING, function (machine, now) {
                if (machine.getSessionID() === null) {
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
            SessionState.CONNECTING,
            new_transition(SessionState.CONNECTED, function (machine, now) {
                var status = machine.getStatus();
                return DockerStatus.READY.equals(status);
            }),
            new_transition(SessionState.ERROR, function (machine, now) {
                if (is_expired(machine.getCurrentState(), now)) {
                    return true;
                }
                var status = machine.getStatus();
                return !(
                    DockerStatus.PREPARING.equals(status) ||
                    DockerStatus.READY.equals(status)
                );
            })
        );
    };
    var connected_state = function () {
        return new_state(
            SessionState.CONNECTED,
            new_transition(SessionState.HANDSHAKING, function (machine, now) {
                if (machine.getSessionID() === null) {
                    return false;
                }
                var status = machine.getStatus();
                return DockerStatus.READY.equals(status);
            }),
            new_transition(SessionState.ERROR, function (machine, now) {
                if (machine.getSessionID() === null) {
                    return true;
                }
                var status = machine.getStatus();
                return !DockerStatus.READY.equals(status);
            })
        );
    };
    var handshaking_state = function () {
        return new_state(
            SessionState.HANDSHAKING,
            new_transition(SessionState.RUNNING, function (machine, now) {
                if (machine.getSessionID() === null) {
                    return false;
                }
                var status = machine.getStatus();
                if (!DockerStatus.READY.equals(status)) {
                    return false;
                }
                return machine.getSessionKey() !== null;
            }),
            new_transition(SessionState.CONNECTED, function (machine, now) {
                if (machine.getSessionID() === null) {
                    return false;
                }
                var status = machine.getStatus();
                if (!DockerStatus.READY.equals(status)) {
                    return false;
                }
                if (machine.getSessionKey() !== null) {
                    return false;
                }
                return is_expired(machine.getCurrentState(), now);
            }),
            new_transition(SessionState.ERROR, function (machine, now) {
                if (machine.getSessionID() === null) {
                    return true;
                }
                var status = machine.getStatus();
                return !DockerStatus.READY.equals(status);
            })
        );
    };
    var running_state = function () {
        return new_state(
            SessionState.RUNNING,
            new_transition(SessionState.DEFAULT, function (machine, now) {
                var status = machine.getStatus();
                if (!DockerStatus.READY.equals(status)) {
                    return false;
                }
                if (machine.getSessionID() === null) {
                    return true;
                }
                return machine.getSessionKey() === null;
            }),
            new_transition(SessionState.ERROR, function (machine, now) {
                var status = machine.getStatus();
                return !DockerStatus.READY.equals(status);
            })
        );
    };
    var error_state = function () {
        return new_state(
            SessionState.ERROR,
            new_transition(SessionState.DEFAULT, function (machine, now) {
                var status = machine.getStatus();
                return !DockerStatus.ERROR.equals(status);
            })
        );
    };
    ns.network.StateMachine = StateMachine;
})(DIMP);
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
})(DIMP);
(function (ns) {
    var UTF8 = ns.format.UTF8;
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
        begin = UTF8.encode(begin);
        var end = UTF8.encode(BOUNDARY_END);
        var size = begin.length + data.length + end.length;
        var body = new Uint8Array(size);
        body.set(begin, 0);
        body.set(data, begin.length);
        body.set(end, begin.length + data.length);
        return body;
    };
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Thread = ns.fsm.threading.Thread;
    var DockerStatus = ns.startrek.port.DockerStatus;
    var BaseSession = ns.network.BaseSession;
    var ClientSession = function (server, db) {
        BaseSession.call(this, server.getHost(), server.getPort(), db);
        this.__station = server;
        this.__key = null;
        this.__thread = null;
    };
    Class(ClientSession, BaseSession, null, {
        setup: function () {
            this.setActive(true, 0);
            return BaseSession.prototype.setup.call(this);
        },
        finish: function () {
            this.setActive(false, 0);
            return BaseSession.prototype.finish.call(this);
        },
        onDockerStatusChanged: function (previous, current, docker) {
            if (!current || DockerStatus.ERROR.equals(current)) {
                this.setActive(false, 0);
            } else {
                if (DockerStatus.READY.equals(current)) {
                    this.setActive(true, 0);
                }
            }
        },
        onDockerReceived: function (arrival, docker) {
            var all_responses = [];
            var messenger = this.getMessenger();
            var packages = get_data_packages(arrival);
            var pack;
            var responses;
            var res;
            for (var i = 0; i < packages.length; ++i) {
                pack = packages[i];
                try {
                    responses = messenger.processPackage(pack);
                    if (responses === null) {
                        continue;
                    }
                    for (var j = 0; j < responses.length; ++j) {
                        res = responses[j];
                        if (!res || res.length === 0) {
                            continue;
                        }
                        all_responses.push(res);
                    }
                } catch (e) {
                    console.error("ClientSession::onDockerReceived()", e, pack);
                }
            }
            var gate = this.getGate();
            var source = docker.getRemoteAddress();
            var destination = docker.getLocalUsers();
            for (var k = 0; i < all_responses.length; ++k) {
                gate.sendMessage(all_responses[k], source, destination);
            }
        }
    });
    ClientSession.prototype.getStation = function () {
        return this.__station;
    };
    ClientSession.prototype.getKey = function () {
        return this.__key;
    };
    ClientSession.prototype.setKey = function (sessionKey) {
        this.__key = sessionKey;
    };
    ClientSession.prototype.start = function () {
        force_stop.call(this);
        var thread = new Thread(this);
        thread.start();
        this.__thread = thread;
    };
    ClientSession.prototype.stop = function () {
        BaseSession.prototype.stop.call(this);
        force_stop.call(this);
    };
    var force_stop = function () {
        var thread = this.__thread;
        if (thread) {
            this.__thread = null;
            thread.stop();
        }
    };
    var get_data_packages = function (arrival) {
        var payload = arrival.getPackage();
        if (!payload || payload.length === 0) {
            return [];
        } else {
            if (payload[0] === "{".charCodeAt(0)) {
                return payload.split("\n".charCodeAt(0));
            } else {
                return [payload];
            }
        }
    };
    ns.network.ClientSession = ClientSession;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var EntityType = ns.protocol.EntityType;
    var Station = ns.mkm.Station;
    var Runner = ns.fsm.skywalker.Runner;
    var Thread = ns.fsm.threading.Thread;
    var StateDelegate = ns.fsm.Delegate;
    var StateMachine = ns.network.StateMachine;
    var ClientSession = ns.network.ClientSession;
    var SessionState = ns.network.SessionState;
    var Terminal = function (facebook, db) {
        Runner.call(this);
        this.__facebook = facebook;
        this.__db = db;
        this.__messenger = null;
        this.__fsm = null;
        this.__last_time = 0;
    };
    Class(Terminal, Runner, [StateDelegate], null);
    Terminal.prototype.getUserAgent = function () {
        return navigator.userAgent;
    };
    Terminal.prototype.getMessenger = function () {
        return this.__messenger;
    };
    Terminal.prototype.getSession = function () {
        var messenger = this.__messenger;
        if (!messenger) {
            return null;
        }
        return messenger.getSession();
    };
    Terminal.prototype.getState = function () {
        var machine = this.__fsm;
        if (!machine) {
            return null;
        }
        return machine.getCurrentState();
    };
    Terminal.prototype.connect = function (host, port) {
        var station, session;
        var messenger = this.__messenger;
        if (messenger) {
            session = messenger.getSession();
            if (session.isActive()) {
                station = session.getStation();
                if (station.getHost() === host && station.getPort() === port) {
                    return messenger;
                }
            }
        }
        var machine = this.__fsm;
        if (machine) {
            this.__fsm = null;
            machine.stop();
        }
        var facebook = this.__facebook;
        station = this.createStation(host, port);
        session = this.createSession(station);
        messenger = this.createMessenger(session, facebook);
        var packer = this.createPacker(facebook, messenger);
        var processor = this.createProcessor(facebook, messenger);
        messenger.setPacker(packer);
        messenger.setProcessor(processor);
        session.setMessenger(messenger);
        machine = new StateMachine(session);
        machine.setDelegate(this);
        this.__messenger = messenger;
        this.__fsm = machine;
        machine.start();
        return messenger;
    };
    Terminal.prototype.createStation = function (host, port) {
        var station = new Station(host, port);
        station.setDataSource(this.__facebook);
        return station;
    };
    Terminal.prototype.createSession = function (station) {
        var session = new ClientSession(station, this.__db);
        var user = this.__facebook.getCurrentUser();
        if (user) {
            session.setIdentifier(user.getIdentifier());
        }
        session.start();
        return session;
    };
    Terminal.prototype.createPacker = function (facebook, messenger) {
        return new ns.ClientMessagePacker(facebook, messenger);
    };
    Terminal.prototype.createProcessor = function (facebook, messenger) {
        return new ns.ClientMessageProcessor(facebook, messenger);
    };
    Terminal.prototype.createMessenger = function (session, facebook) {
        throw new Error("NotImplemented");
    };
    Terminal.prototype.login = function (current) {
        var session = this.getSession();
        if (session) {
            session.setIdentifier(current);
            return true;
        } else {
            return false;
        }
    };
    Terminal.prototype.start = function () {
        var thread = new Thread(this);
        thread.start();
    };
    Terminal.prototype.finish = function () {
        var machine = this.__fsm;
        if (machine) {
            this.__fsm = null;
            machine.stop();
        }
        var messenger = this.__messenger;
        if (messenger) {
            var session = this.getSession();
            session.stop();
            this.__messenger = null;
        }
        return Runner.prototype.finish.call(this);
    };
    Terminal.prototype.process = function () {
        var now = new Date().getTime();
        if (!this.isExpired(this.__last_time, now)) {
            return false;
        }
        var messenger = this.getMessenger();
        if (!messenger) {
            return false;
        }
        var session = messenger.getSession();
        var uid = session.getIdentifier();
        if (!uid || !this.getState().equals(SessionState.RUNNING)) {
            return false;
        }
        try {
            this.keepOnline(uid, messenger);
        } catch (e) {
            console.error("Terminal::process()", e);
        }
        this.__last_time = now;
        return false;
    };
    Terminal.prototype.isExpired = function (last, now) {
        return now < last + 300 * 1000;
    };
    Terminal.prototype.keepOnline = function (uid, messenger) {
        if (EntityType.STATION.equals(uid.getType())) {
            messenger.reportOnline(uid);
        } else {
            messenger.broadcastLogin(uid, this.getUserAgent());
        }
    };
    Terminal.prototype.enterState = function (next, machine) {};
    Terminal.prototype.exitState = function (previous, machine) {
        var messenger = this.getMessenger();
        var current = machine.getCurrentState();
        if (!current) {
            return;
        }
        if (current.equals(SessionState.HANDSHAKING)) {
            messenger.handshake(null);
        } else {
            if (current.equals(SessionState.RUNNING)) {
                messenger.handshakeSuccess();
                this.__last_time = new Date().getTime();
            }
        }
    };
    Terminal.prototype.pauseState = function (current, machine) {};
    Terminal.prototype.resumeState = function (current, machine) {};
    ns.network.Terminal = Terminal;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var HandshakeCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(HandshakeCommandProcessor, BaseCommandProcessor, null, {
        process: function (content, rMsg) {
            var messenger = this.getMessenger();
            var session = messenger.getSession();
            var station = session.getStation();
            var oid = station.getIdentifier();
            var sender = rMsg.getSender();
            if (!oid || oid.isBroadcast()) {
                station.setIdentifier(sender);
            }
            var title = content.getTitle();
            var newKey = content.getSessionKey();
            var oldKey = session.getKey();
            if (title === "DIM?") {
                if (!oldKey) {
                    messenger.handshake(newKey);
                } else {
                    if (oldKey === newKey) {
                        messenger.handshake(newKey);
                    } else {
                        messenger.setKey(null);
                    }
                }
            } else {
                if (title === "DIM!") {
                    if (!oldKey) {
                        session.setKey(newKey);
                    } else {
                        if (oldKey === newKey) {
                            console.warn("duplicated handshake", content, rMsg);
                        } else {
                            console.error("handshake error", oldKey, content, rMsg);
                            session.setKey(null);
                        }
                    }
                } else {
                    console.error("Hello world!", content, rMsg);
                }
            }
            return null;
        }
    });
    ns.cpu.HandshakeCommandProcessor = HandshakeCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var LoginCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(LoginCommandProcessor, BaseCommandProcessor, null, null);
    LoginCommandProcessor.prototype.process = function (cmd, rMsg) {
        return null;
    };
    ns.cpu.LoginCommandProcessor = LoginCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var ReceiptCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(ReceiptCommandProcessor, BaseCommandProcessor, null, null);
    ReceiptCommandProcessor.prototype.process = function (cmd, rMsg) {
        return null;
    };
    ns.cpu.ReceiptCommandProcessor = ReceiptCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var HistoryCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(HistoryCommandProcessor, BaseCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var text =
                "History command (name: " + cmd.getCmd() + ") not support yet!";
            return this.respondText(text, cmd.getGroup());
        }
    });
    ns.cpu.HistoryCommandProcessor = HistoryCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor;
    var GroupCommandProcessor = function (facebook, messenger) {
        HistoryCommandProcessor.call(this, facebook, messenger);
    };
    Class(GroupCommandProcessor, HistoryCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var text = "Group command (name: " + cmd.getCmd() + ") not support yet!";
            return this.respondText(text, cmd.getGroup());
        }
    });
    GroupCommandProcessor.prototype.getMembers = function (cmd) {
        var members = cmd.getMembers();
        if (members) {
            return members;
        }
        var member = cmd.getMember();
        if (member) {
            return [member];
        } else {
            return [];
        }
    };
    ns.cpu.GroupCommandProcessor = GroupCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ResetCommandProcessor = ns.cpu.ResetCommandProcessor;
    var INVITE_CMD_ERROR = "Invite command error.";
    var INVITE_NOT_ALLOWED =
        "Sorry, yo are not allowed to invite new members into this group.";
    var InviteCommandProcessor = function (facebook, messenger) {
        ResetCommandProcessor.call(this, facebook, messenger);
    };
    Class(InviteCommandProcessor, ResetCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.temporarySave(cmd, rMsg.getSender());
            }
            var sender = rMsg.getSender();
            if (members.indexOf(sender) < 0) {
                var assistants = facebook.getAssistants(group);
                if (!assistants || assistants.indexOf(sender) < 0) {
                    return this.respondText(INVITE_NOT_ALLOWED, group);
                }
            }
            var invites = this.getMembers(cmd);
            if (invites.length === 0) {
                return this.respondText(INVITE_CMD_ERROR, group);
            }
            if (sender.equals(owner) && invites.indexOf(owner) >= 0) {
                return this.temporarySave(cmd, rMsg.getSender());
            }
            var adds = [];
            var item, pos;
            for (var i = 0; i < invites.length; ++i) {
                item = invites[i];
                pos = members.indexOf(item);
                if (pos >= 0) {
                    continue;
                }
                adds.push(item.toString());
                members.push(item);
            }
            if (adds.length > 0) {
                if (facebook.saveMembers(members, group)) {
                    cmd.setValue("added", adds);
                }
            }
            return null;
        }
    });
    ns.cpu.InviteCommandProcessor = InviteCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var GROUP_EMPTY = "Group empty.";
    var EXPEL_CMD_ERROR = "Expel command error.";
    var EXPEL_NOT_ALLOWED =
        "Sorry, you are not allowed to expel member from this group.";
    var CANNOT_EXPEL_OWNER = "Group owner cannot be expelled.";
    var ExpelCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    Class(ExpelCommandProcessor, GroupCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.respondText(GROUP_EMPTY, group);
            }
            var sender = rMsg.getSender();
            if (!owner.equals(sender)) {
                var assistants = facebook.getAssistants(group);
                if (!assistants || assistants.indexOf(sender) < 0) {
                    return this.respondText(EXPEL_NOT_ALLOWED, group);
                }
            }
            var expels = this.getMembers(cmd);
            if (expels.length === 0) {
                return this.respondText(EXPEL_CMD_ERROR, group);
            }
            if (expels.indexOf(owner) >= 0) {
                return this.respondText(CANNOT_EXPEL_OWNER, group);
            }
            var removes = [];
            var item, pos;
            for (var i = 0; i < expels.length; ++i) {
                item = expels[i];
                pos = members.indexOf(item);
                if (pos < 0) {
                    continue;
                }
                removes.push(item.toString());
                members.splice(pos, 1);
            }
            if (removes.length > 0) {
                if (facebook.saveMembers(members, group)) {
                    cmd.setValue("removed", removes);
                }
            }
            return null;
        }
    });
    ns.cpu.ExpelCommandProcessor = ExpelCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var GROUP_EMPTY = "Group empty.";
    var OWNER_CANNOT_QUIT = "Sorry, owner cannot quit group.";
    var ASSISTANT_CANNOT_QUIT = "Sorry, assistant cannot quit group.";
    var QuitCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    Class(QuitCommandProcessor, GroupCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.respondText(GROUP_EMPTY, group);
            }
            var sender = rMsg.getSender();
            if (owner.equals(sender)) {
                return this.respondText(OWNER_CANNOT_QUIT, group);
            }
            var assistants = facebook.getAssistants(group);
            if (assistants && assistants.indexOf(sender) >= 0) {
                return this.removeAssistant(cmd, rMsg);
            }
            var pos = members.indexOf(sender);
            if (pos > 0) {
                members.splice(pos, 1);
                facebook.saveMembers(members, group);
            }
            return null;
        },
        removeAssistant: function (cmd, rMsg) {
            return this.respondText(ASSISTANT_CANNOT_QUIT, cmd.getGroup());
        }
    });
    ns.cpu.QuitCommandProcessor = QuitCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var GROUP_EMPTY = "Group empty.";
    var QUERY_NOT_ALLOWED = "Sorry, you are not allowed to query this group.";
    var QueryCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    Class(QueryCommandProcessor, GroupCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.respondText(GROUP_EMPTY, group);
            }
            var sender = rMsg.getSender();
            if (members.indexOf(sender) < 0) {
                var assistants = facebook.getAssistants(group);
                if (!assistants || assistants.indexOf(sender) < 0) {
                    return this.respondText(QUERY_NOT_ALLOWED, group);
                }
            }
            var res = this.respondGroupMembers(owner, group, members);
            return [res];
        },
        respondGroupMembers: function (owner, group, members) {
            var facebook = this.getFacebook();
            var user = facebook.getCurrentUser();
            if (user.getIdentifier().equals(owner)) {
                return GroupCommand.reset(group, members);
            } else {
                return GroupCommand.invite(group, members);
            }
        }
    });
    ns.cpu.QueryCommandProcessor = QueryCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var RESET_CMD_ERROR = "Reset command error.";
    var RESET_NOT_ALLOWED = "Sorry, you are not allowed to reset this group.";
    var ResetCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    Class(ResetCommandProcessor, GroupCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.temporarySave(cmd, rMsg.getSender());
            }
            var sender = rMsg.getSender();
            if (!owner.equals(sender)) {
                var assistants = facebook.getAssistants(group);
                if (!assistants || assistants.indexOf(sender) < 0) {
                    return this.respondText(RESET_NOT_ALLOWED, group);
                }
            }
            var newMembers = this.getMembers(cmd);
            if (newMembers.length === 0) {
                return this.respondText(RESET_CMD_ERROR, group);
            }
            if (newMembers.indexOf(owner) < 0) {
                return this.respondText(RESET_CMD_ERROR, group);
            }
            var removes = [];
            var item, i;
            for (i = 0; i < members.length; ++i) {
                item = members[i];
                if (newMembers.indexOf(item) < 0) {
                    removes.push(item.toString());
                }
            }
            var adds = [];
            for (i = 0; i < newMembers.length; ++i) {
                item = newMembers[i];
                if (members.indexOf(item) < 0) {
                    adds.push(item.toString());
                }
            }
            if (adds.length > 0 || removes.length > 0) {
                if (facebook.saveMembers(newMembers, group)) {
                    if (adds.length > 0) {
                        cmd.setValue("added", adds);
                    }
                    if (removes.length > 0) {
                        cmd.setValue("removed", removes);
                    }
                }
            }
            return null;
        },
        temporarySave: function (cmd, sender) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var newMembers = this.getMembers(cmd);
            if (newMembers.length === 0) {
                return this.respondText(RESET_CMD_ERROR, group);
            }
            var item;
            for (var i = 0; i < newMembers.length; ++i) {
                item = newMembers[i];
                if (!facebook.getMeta(item)) {
                    continue;
                } else {
                    if (!facebook.isOwner(item, group)) {
                        continue;
                    }
                }
                if (facebook.saveMembers(newMembers, group)) {
                    if (!item.equals(sender)) {
                        this.queryOwner(item, group);
                    }
                }
                return null;
            }
            var res = GroupCommand.query(group);
            return [res];
        },
        queryOwner: function (owner, group) {}
    });
    ns.cpu.ResetCommandProcessor = ResetCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var ContentProcessorCreator = ns.cpu.ContentProcessorCreator;
    var ReceiptCommandProcessor = ns.cpu.ReceiptCommandProcessor;
    var HandshakeCommandProcessor = ns.cpu.HandshakeCommandProcessor;
    var LoginCommandProcessor = ns.cpu.LoginCommandProcessor;
    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor;
    var ClientContentProcessorCreator = function (facebook, messenger) {
        ContentProcessorCreator.call(this, facebook, messenger);
    };
    Class(ClientContentProcessorCreator, ContentProcessorCreator, null, {
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (ContentType.HISTORY.equals(type)) {
                return new HistoryCommandProcessor(facebook, messenger);
            }
            if (type === 0) {
                return new BaseContentProcessor(facebook, messenger);
            }
            return ContentProcessorCreator.prototype.createContentProcessor.call(
                this,
                type
            );
        },
        createCommandProcessor: function (type, cmd) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            switch (cmd) {
                case Command.HANDSHAKE:
                    return new HandshakeCommandProcessor(facebook, messenger);
                case Command.LOGIN:
                    return new LoginCommandProcessor(facebook, messenger);
                case Command.RECEIPT:
                    return new ReceiptCommandProcessor(facebook, messenger);
                case "group":
                    return new ns.cpu.GroupCommandProcessor(facebook, messenger);
                case GroupCommand.INVITE:
                    return new ns.cpu.InviteCommandProcessor(facebook, messenger);
                case GroupCommand.EXPEL:
                    return new ns.cpu.ExpelCommandProcessor(facebook, messenger);
                case GroupCommand.QUIT:
                    return new ns.cpu.QuitCommandProcessor(facebook, messenger);
                case GroupCommand.QUERY:
                    return new ns.cpu.QueryCommandProcessor(facebook, messenger);
                case GroupCommand.RESET:
                    return new ns.cpu.ResetCommandProcessor(facebook, messenger);
            }
            return ContentProcessorCreator.prototype.createCommandProcessor.call(
                this,
                type,
                cmd
            );
        }
    });
    ns.cpu.ClientContentProcessorCreator = ClientContentProcessorCreator;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var MetaCommand = ns.protocol.MetaCommand;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var LoginCommand = ns.protocol.LoginCommand;
    var ReportCommand = ns.protocol.ReportCommand;
    var Station = ns.mkm.Station;
    var QueryFrequencyChecker = ns.mem.QueryFrequencyChecker;
    var CommonMessenger = ns.CommonMessenger;
    var ClientMessenger = function (session, facebook, db) {
        CommonMessenger.call(this, session, facebook, db);
    };
    Class(ClientMessenger, CommonMessenger, null, {
        handshake: function (sessionKey) {
            var session = this.getSession();
            var station = session.getStation();
            var sid = station.getIdentifier();
            var cmd;
            if (sessionKey) {
                cmd = HandshakeCommand.restart(sessionKey);
                this.sendContent(null, sid, cmd, -1);
            } else {
                var facebook = this.getFacebook();
                var user = facebook.getCurrentUser();
                var uid = user.getIdentifier();
                var meta = user.getMeta();
                var visa = user.getVisa();
                var env = Envelope.create(uid, sid, null);
                cmd = HandshakeCommand.start();
                cmd.setGroup(Station.EVERY);
                var iMsg = InstantMessage.create(env, cmd);
                iMsg.setValue("meta", meta.toMap());
                iMsg.setValue("visa", visa.toMap());
                this.sendInstantMessage(iMsg, -1);
            }
        },
        handshakeSuccess: function () {
            this.broadcastDocument();
        },
        broadcastDocument: function () {
            var facebook = this.getFacebook();
            var user = facebook.getCurrentUser();
            var uid = user.getIdentifier();
            var meta = user.getMeta();
            var visa = user.getVisa();
            var cmd = DocumentCommand.response(uid, meta, visa);
            this.sendContent(uid, ID.EVERYONE, cmd, 1);
        },
        broadcastLogin: function (sender, userAgent) {
            var session = this.getSession();
            var station = session.getStation();
            var cmd = LoginCommand.create(sender);
            cmd.setAgent(userAgent);
            cmd.setStation(station);
            this.sendContent(sender, ID.EVERYONE, cmd, 1);
        },
        reportOnline: function (sender) {
            var cmd = ReportCommand.create(ReportCommand.ONLINE);
            this.sendContent(sender, Station.ANY, cmd, 1);
        },
        reportOffline: function (sender) {
            var cmd = ReportCommand.create(ReportCommand.OFFLINE);
            this.sendContent(sender, Station.ANY, cmd, 1);
        },
        queryMeta: function (identifier) {
            if (!QueryFrequencyChecker.isMetaQueryExpired(identifier, 0)) {
                return false;
            }
            var cmd = MetaCommand.query(identifier);
            this.sendContent(null, Station.ANY, cmd, 1);
            return true;
        },
        queryDocument: function (identifier) {
            if (!QueryFrequencyChecker.isDocumentQueryExpired(identifier, 0)) {
                return false;
            }
            var cmd = DocumentCommand.query(identifier);
            this.sendContent(null, Station.ANY, cmd, 1);
            return true;
        }
    });
    ns.ClientMessenger = ClientMessenger;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Base64 = ns.format.Base64;
    var SHA256 = ns.digest.SHA256;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var MessagePacker = ns.MessagePacker;
    var ClientMessagePacker = function (facebook, messenger) {
        MessagePacker.call(this, facebook, messenger);
    };
    Class(ClientMessagePacker, MessagePacker, null, null);
    var attach = function (rMsg) {
        var messenger = this.getMessenger();
        if (!rMsg.getDelegate()) {
            rMsg.setDelegate(messenger);
        }
        if (rMsg.getValue("key")) {
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
        var digest = getKeyDigest(key);
        if (!digest) {
            return;
        }
        keys["digest"] = digest;
        rMsg.setValue("keys", keys);
    };
    var getKeyDigest = function (key) {
        var data = key.getData();
        if (!data || data.length < 6) {
            return null;
        }
        var part = data.subarray(data.length - 6);
        var digest = SHA256.digest(part);
        var base64 = Base64.encode(digest);
        base64 = base64.trim();
        return base64.substr(base64.length - 8);
    };
    ClientMessagePacker.prototype.serializeMessage = function (rMsg) {
        attach.call(this, rMsg);
        return MessagePacker.prototype.serializeMessage.call(this, rMsg);
    };
    ClientMessagePacker.prototype.deserializeMessage = function (data) {
        if (!data || data.length < 2) {
            return null;
        }
        return MessagePacker.prototype.deserializeMessage.call(this, data);
    };
    ClientMessagePacker.prototype.signMessage = function (sMsg) {
        if (Interface.conforms(sMsg, ReliableMessage)) {
            return sMsg;
        }
        return MessagePacker.prototype.signMessage.call(this, sMsg);
    };
    ClientMessagePacker.prototype.decryptMessage = function (sMsg) {
        try {
            return MessagePacker.prototype.decryptMessage.call(this, sMsg);
        } catch (e) {
            if (e.toString().indexOf("failed to decrypt key in msg: ") >= 0) {
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
    ns.ClientMessagePacker = ClientMessagePacker;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var EntityType = ns.protocol.EntityType;
    var TextContent = ns.protocol.TextContent;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var MessageProcessor = ns.MessageProcessor;
    var ClientMessageProcessor = function (facebook, messenger) {
        MessageProcessor.call(this, facebook, messenger);
    };
    Class(ClientMessageProcessor, MessageProcessor, null, {
        processSecureMessage: function (sMsg, rMsg) {
            try {
                return MessageProcessor.prototype.processSecureMessage.call(
                    this,
                    sMsg,
                    rMsg
                );
            } catch (e) {
                var errMsg = e.toString();
                if (errMsg && errMsg.indexOf("receiver error") >= 0) {
                    console.warn("ignore message", rMsg);
                    return [];
                } else {
                    throw e;
                }
            }
        },
        processContent: function (content, rMsg) {
            var responses = MessageProcessor.prototype.processContent.call(
                this,
                content,
                rMsg
            );
            if (!responses || responses.length === 0) {
                return responses;
            } else {
                if (Interface.conforms(responses[0], HandshakeCommand)) {
                    return responses;
                }
            }
            var sender = rMsg.getSender();
            var receiver = rMsg.getReceiver();
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            var user = facebook.selectLocalUser(receiver);
            receiver = user.getIdentifier();
            var network = sender.getType();
            var res;
            for (var i = 0; i < responses.length; ++i) {
                res = responses[i];
                if (!res) {
                    continue;
                } else {
                    if (Interface.conforms(res, ReceiptCommand)) {
                        if (EntityType.STATION.equals(network)) {
                            continue;
                        } else {
                            if (EntityType.BOT.equals(network)) {
                                continue;
                            }
                        }
                    } else {
                        if (Interface.conforms(res, TextContent)) {
                            if (EntityType.STATION.equals(network)) {
                                continue;
                            } else {
                                if (EntityType.BOT.equals(network)) {
                                    continue;
                                }
                            }
                        }
                    }
                }
                messenger.sendContent(receiver, sender, res, 1);
            }
            return [];
        },
        createCreator: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.cpu.ClientContentProcessorCreator(facebook, messenger);
        }
    });
    ns.ClientMessageProcessor = ClientMessageProcessor;
})(DIMP);
