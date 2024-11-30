/**
 *  DIM-Client (v1.0.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Nov. 27, 2024
 * @copyright (c) 2024 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var AutoMachine = ns.fsm.AutoMachine;
    var PorterStatus = ns.startrek.port.PorterStatus;
    var StateMachine = function (session) {
        AutoMachine.call(this);
        this.__session = session;
        var builder = this.createStateBuilder();
        this.addState(builder.getDefaultState());
        this.addState(builder.getConnectingState());
        this.addState(builder.getConnectedState());
        this.addState(builder.getHandshakingState());
        this.addState(builder.getRunningState());
        this.addState(builder.getErrorState())
    };
    Class(StateMachine, AutoMachine, null, null);
    StateMachine.prototype.createStateBuilder = function () {
        var stb = new ns.network.SessionStateTransitionBuilder();
        return new ns.network.SessionStateBuilder(stb)
    };
    StateMachine.prototype.getContext = function () {
        return this
    };
    StateMachine.prototype.getSession = function () {
        return this.__session
    };
    StateMachine.prototype.getSessionKey = function () {
        var session = this.getSession();
        return session.getSessionKey()
    };
    StateMachine.prototype.getSessionID = function () {
        var session = this.getSession();
        return session.getIdentifier()
    };
    StateMachine.prototype.getStatus = function () {
        var session = this.getSession();
        if (!session) {
            return PorterStatus.ERROR
        }
        var gate = session.getGate();
        var remote = session.getRemoteAddress();
        var docker = gate.getPorter(remote, null);
        if (!docker) {
            return PorterStatus.ERROR
        }
        return docker.getStatus()
    };
    ns.network.SessionStateMachine = StateMachine
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
    var BaseState = ns.fsm.BaseState;
    var StateOrder = Enum('SessionStateOrder', {
        DEFAULT: 0,
        CONNECTING: 1,
        CONNECTED: 2,
        HANDSHAKING: 3,
        RUNNING: 4,
        ERROR: 5
    });
    var SessionState = function (order) {
        BaseState.call(this, Enum.getInt(order));
        this.__name = order.getName();
        this.__enterTime = null
    };
    Class(SessionState, BaseState, null, {
        getName: function () {
            return this.__name
        }, getEnterTime: function () {
            return this.__enterTime
        }, toString: function () {
            return this.__name
        }, valueOf: function () {
            return this.__name
        }, equals: function (other) {
            if (other instanceof SessionState) {
                if (other === this) {
                    return true
                }
                other = other.getIndex()
            } else if (other instanceof StateOrder) {
                other = other.getValue()
            }
            return this.getIndex() === other
        }
    });
    SessionState.prototype.onEnter = function (previous, ctx, now) {
        this.__enterTime = now
    };
    SessionState.prototype.onExit = function (next, ctx, now) {
        this.__enterTime = null
    };
    SessionState.prototype.onPause = function (ctx, now) {
    };
    SessionState.prototype.onResume = function (ctx, now) {
    };
    SessionState.Delegate = ns.fsm.Delegate;
    var StateBuilder = function (transitionBuilder) {
        Object.call(this);
        this.builder = transitionBuilder
    };
    Class(StateBuilder, Object, null, {
        getDefaultState: function () {
            var state = new SessionState(StateOrder.DEFAULT);
            state.addTransition(this.builder.getDefaultConnectingTransition());
            return state
        }, getConnectingState: function () {
            var state = new SessionState(StateOrder.CONNECTING);
            state.addTransition(this.builder.getConnectingConnectedTransition());
            state.addTransition(this.builder.getConnectingErrorTransition());
            return state
        }, getConnectedState: function () {
            var state = new SessionState(StateOrder.CONNECTED);
            state.addTransition(this.builder.getConnectedHandshakingTransition());
            state.addTransition(this.builder.getConnectedErrorTransition());
            return state
        }, getHandshakingState: function () {
            var state = new SessionState(StateOrder.HANDSHAKING);
            state.addTransition(this.builder.getHandshakingRunningTransition());
            state.addTransition(this.builder.getHandshakingConnectedTransition());
            state.addTransition(this.builder.getHandshakingErrorTransition());
            return state
        }, getRunningState: function () {
            var state = new SessionState(StateOrder.RUNNING);
            state.addTransition(this.builder.getRunningDefaultTransition());
            state.addTransition(this.builder.getRunningErrorTransition());
            return state
        }, getErrorState: function () {
            var state = new SessionState(StateOrder.ERROR);
            state.addTransition(this.builder.getErrorDefaultTransition());
            return state
        }
    });
    ns.network.SessionState = SessionState;
    ns.network.SessionStateBuilder = StateBuilder;
    ns.network.SessionStateOrder = StateOrder
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
    var BaseTransition = ns.fsm.BaseTransition;
    var PorterStatus = ns.startrek.port.PorterStatus;
    var StateOrder = ns.network.SessionStateOrder;
    var StateTransition = function (order, evaluate) {
        BaseTransition.call(this, Enum.getInt(order));
        this.__evaluate = evaluate
    };
    Class(StateTransition, BaseTransition, null, null);
    StateTransition.prototype.evaluate = function (ctx, now) {
        return this.__evaluate.call(this, ctx, now)
    };
    var is_state_expired = function (state, now) {
        var enterTime = state.getEnterTime();
        if (!enterTime) {
            return false
        }
        var recent = now.getTime() - 30 * 1000;
        return enterTime.getTime() < recent
    };
    var TransitionBuilder = function () {
        Object.call(this)
    };
    Class(TransitionBuilder, Object, null, {
        getDefaultConnectingTransition: function () {
            return new StateTransition(StateOrder.CONNECTING, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    return false
                }
                var status = ctx.getStatus();
                return PorterStatus.PREPARING.equals(status) || PorterStatus.READY.equals(status)
            })
        }, getConnectingConnectedTransition: function () {
            return new StateTransition(StateOrder.CONNECTED, function (ctx, now) {
                var status = ctx.getStatus();
                return PorterStatus.READY.equals(status)
            })
        }, getConnectingErrorTransition: function () {
            return new StateTransition(StateOrder.ERROR, function (ctx, now) {
                if (is_state_expired(ctx.getCurrentState(), now)) {
                    return true
                }
                var status = ctx.getStatus();
                return !(PorterStatus.PREPARING.equals(status) || PorterStatus.READY.equals(status))
            })
        }, getConnectedHandshakingTransition: function () {
            return new StateTransition(StateOrder.HANDSHAKING, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    return false
                }
                var status = ctx.getStatus();
                return PorterStatus.READY.equals(status)
            })
        }, getConnectedErrorTransition: function () {
            return new StateTransition(StateOrder.ERROR, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    return true
                }
                var status = ctx.getStatus();
                return !PorterStatus.READY.equals(status)
            })
        }, getHandshakingRunningTransition: function () {
            return new StateTransition(StateOrder.RUNNING, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    return false
                }
                var status = ctx.getStatus();
                if (!PorterStatus.READY.equals(status)) {
                    return false
                }
                return !!ctx.getSessionKey()
            })
        }, getHandshakingConnectedTransition: function () {
            return new StateTransition(StateOrder.CONNECTED, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    return false
                }
                var status = ctx.getStatus();
                if (!PorterStatus.READY.equals(status)) {
                    return false
                }
                if (!!ctx.getSessionKey()) {
                    return false
                }
                return is_state_expired(ctx.getCurrentState(), now)
            })
        }, getHandshakingErrorTransition: function () {
            return new StateTransition(StateOrder.ERROR, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    return true
                }
                var status = ctx.getStatus();
                return !PorterStatus.READY.equals(status)
            })
        }, getRunningDefaultTransition: function () {
            return new StateTransition(StateOrder.DEFAULT, function (ctx, now) {
                var status = ctx.getStatus();
                if (!PorterStatus.READY.equals(status)) {
                    return false
                }
                var session = ctx.getSession();
                return !(session && session.isReady())
            })
        }, getRunningErrorTransition: function () {
            return new StateTransition(StateOrder.ERROR, function (ctx, now) {
                var status = ctx.getStatus();
                return !PorterStatus.READY.equals(status)
            })
        }, getErrorDefaultTransition: function () {
            return new StateTransition(StateOrder.DEFAULT, function (ctx, now) {
                var status = ctx.getStatus();
                return !PorterStatus.ERROR.equals(status)
            })
        }
    });
    ns.network.SessionStateTransition = StateTransition;
    ns.network.SessionStateTransitionBuilder = TransitionBuilder
})(DIMP);
(function (ns) {
    'use strict';
    var HTTP = {
        get: function (url, callback) {
            var xhr = create();
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function (ev) {
                callback(ev.target, url)
            };
            xhr.send()
        }, post: function (url, headers, body, callback) {
            var xhr = create();
            xhr.open('POST', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function (ev) {
                if (callback) {
                    callback(ev.target, url)
                }
            };
            if (headers) {
                set_headers(xhr, headers)
            }
            xhr.send(body)
        }
    };
    var create = function () {
        try {
            return new XMLHttpRequest()
        } catch (e) {
            try {
                return new ActiveXObject('Msxml2.XMLHTTP')
            } catch (e) {
                try {
                    return new ActiveXObject('Microsoft.XMLHTTP')
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
            name = keys[i]
            xhr.setRequestHeader(name, headers[name])
        }
    };
    ns.network.HTTP = HTTP
})(DIMP);
(function (ns) {
    'use strict';
    var UTF8 = ns.format.UTF8;
    var HTTP = ns.network.HTTP;
    HTTP.upload = function (url, data, filename, name, callback) {
        var body = http_body(data, filename, name);
        this.post(url, {'Content-Type': CONTENT_TYPE, 'Content-Length': '' + body.length}, body, callback)
    };
    HTTP.download = function (url, callback) {
        if (s_downloading.indexOf(url) < 0) {
            s_downloading.push(url);
            this.get(url, callback)
        }
    };
    var s_downloading = [];
    var BOUNDARY = 'BU1kUJ19yLYPqv5xoT3sbKYbHwjUu1JU7roix';
    var CONTENT_TYPE = 'multipart/form-data; boundary=' + BOUNDARY;
    var BOUNDARY_BEGIN = '--' + BOUNDARY + '\r\n' + 'Content-Disposition: form-data; name={name}; filename={filename}\r\n' + 'Content-Type: application/octet-stream\r\n\r\n';
    var BOUNDARY_END = '\r\n--' + BOUNDARY + '--';
    var http_body = function (data, filename, name) {
        var begin = BOUNDARY_BEGIN;
        begin = begin.replace('{filename}', filename);
        begin = begin.replace('{name}', name);
        begin = UTF8.encode(begin);
        var end = UTF8.encode(BOUNDARY_END);
        var size = begin.length + data.length + end.length;
        var body = new Uint8Array(size);
        body.set(begin, 0);
        body.set(data, begin.length);
        body.set(end, begin.length + data.length);
        return body
    }
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var Thread = ns.fsm.threading.Thread;
    var PorterStatus = ns.startrek.port.PorterStatus;
    var BaseConnection = ns.startrek.socket.BaseConnection;
    var StarPorter = ns.startrek.StarPorter;
    var BaseSession = ns.network.BaseSession;
    var SessionStateMachine = ns.network.SessionStateMachine;
    var ClientSession = function (db, server) {
        BaseSession.call(this, db, server.getHost(), server.getPort());
        this.__station = server;
        this.__fsm = new SessionStateMachine(this);
        this.__key = null;
        this.__accepted = false;
        this.__thread = null
    };
    Class(ClientSession, BaseSession, null, {
        getStation: function () {
            return this.__station
        }, getState: function () {
            var fsm = this.__fsm;
            var state = fsm.getCurrentState();
            if (state) {
                return state
            }
            return fsm.getDefaultState()
        }, setActive: function (flag, when) {
            if (!flag) {
                this.__accepted = false
            }
            return BaseSession.prototype.setActive.call(this, flag, when)
        }, isAccepted: function () {
            return this.__accepted
        }, setAccepted: function (flag) {
            this.__accepted = flag
        }, getSessionKey: function () {
            return this.__key
        }, setSessionKey: function (sessionKey) {
            this.__key = sessionKey
        }, isReady: function () {
            return this.isActive() && this.isAccepted() && this.getIdentifier() && this.getSessionKey()
        }, getConnection: function () {
            var gate = this.getGate();
            var remote = this.getRemoteAddress();
            var docker = gate.getPorter(remote, null);
            if (docker instanceof StarPorter) {
                return docker.getConnection()
            }
            return null
        }, getConnectionStateMachine: function () {
            var conn = this.getConnection();
            if (conn instanceof BaseConnection) {
                return conn.getStateMachine()
            }
            return null
        }, pause: function () {
            var sess_machine = this.__fsm;
            var conn_machine = this.getConnectionStateMachine();
            sess_machine.pause();
            conn_machine.pause()
        }, resume: function () {
            var sess_machine = this.__fsm;
            var conn_machine = this.getConnectionStateMachine();
            conn_machine.resume();
            sess_machine.resume()
        }, setup: function () {
            this.setActive(true, 0);
            return BaseSession.prototype.setup.call(this)
        }, finish: function () {
            this.setActive(false, 0);
            return BaseSession.prototype.finish.call(this)
        }, onPorterStatusChanged: function (previous, current, docker) {
            if (!current || PorterStatus.ERROR.equals(current)) {
                this.setActive(false, 0)
            } else if (PorterStatus.READY.equals(current)) {
                this.setActive(true, 0)
            }
        }, onPorterReceived: function (arrival, docker) {
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
                    if (!responses || responses.length === 0) {
                        continue
                    }
                    for (var j = 0; j < responses.length; ++j) {
                        res = responses[j];
                        if (!res || res.length === 0) {
                            continue
                        }
                        all_responses.push(res)
                    }
                } catch (e) {
                    Log.error('ClientSession::onPorterReceived()', e, pack)
                }
            }
            var gate = this.getGate();
            var source = docker.getRemoteAddress();
            var destination = docker.getLocalAddress();
            for (var k = 0; i < all_responses.length; ++k) {
                gate.sendResponse(all_responses[k], arrival, source, destination)
            }
        }
    });
    var force_stop = function () {
        var thread = this.__thread;
        if (thread) {
            this.__thread = null;
            thread.stop()
        }
    };
    ClientSession.prototype.start = function (delegate) {
        force_stop.call(this);
        var thread = new Thread(this);
        thread.start();
        this.__thread = thread;
        var fsm = this.__fsm;
        fsm.setDelegate(delegate);
        fsm.start()
    };
    ClientSession.prototype.stop = function () {
        BaseSession.prototype.stop.call(this);
        force_stop.call(this);
        var fsm = this.__fsm;
        fsm.stop()
    };
    var get_data_packages = function (arrival) {
        var payload = arrival.getPayload();
        if (!payload || payload.length === 0) {
            return []
        } else if (payload[0] === jsonStart) {
            return split_packages(payload)
        } else {
            return [payload]
        }
    };
    var jsonStart = '{'.charCodeAt(0);
    var split_packages = function (payload) {
        var array = [];
        var i, j = 0;
        for (i = 1; i < payload.length; ++i) {
            if (payload[i] !== NEW_LINE) {
                continue
            }
            if (i > j) {
                array.push(payload.slice(j, i))
            }
            j = i + 1
        }
        if (i > j) {
            array.push(payload.slice(j, i))
        }
        return array
    };
    var NEW_LINE = '\n'.charCodeAt(0);
    ns.network.ClientSession = ClientSession
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var LoginCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger)
    };
    Class(LoginCommandProcessor, BaseCommandProcessor, null, {
        getDatabase: function () {
            var manager = this.getMessenger();
            var session = manager.getSession();
            return session.getDatabase()
        }, process: function (content, rMsg) {
            var sender = content.getIdentifier();
            var db = this.getDatabase();
            if (db.saveLoginCommandMessage(sender, content, rMsg)) {
                Log.info('save login command for user', sender)
            } else {
                Log.error('failed to save login command', sender, content)
            }
            return []
        }
    });
    ns.cpu.LoginCommandProcessor = LoginCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var ReceiptCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger)
    };
    Class(ReceiptCommandProcessor, BaseCommandProcessor, null, null);
    ReceiptCommandProcessor.prototype.process = function (content, rMsg) {
        if (Interface.conforms(content, ReceiptCommand)) {
            var envelope = rMsg.getEnvelope();
            var groupManager = ns.group.SharedGroupManager;
            var delegate = groupManager.getGroupDelegate();
            delegate.updateRespondTime(content, envelope)
        }
        return []
    };
    ns.cpu.ReceiptCommandProcessor = ReceiptCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var HandshakeCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger)
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
                Log.info('update station ID', oid, sender)
            }
            var title = content.getTitle();
            var newKey = content.getSessionKey();
            var oldKey = session.getSessionKey();
            if (title === 'DIM?') {
                if (!oldKey) {
                    Log.info('[DIM] handshake with session key', newKey);
                    messenger.handshake(newKey)
                } else if (oldKey === newKey) {
                    Log.warning('[DIM] handshake response duplicated', newKey);
                    messenger.handshake(newKey)
                } else {
                    Log.warning('[DIM] handshake again', oldKey, newKey);
                    session.setSessionKey(null)
                }
            } else if (title === 'DIM!') {
                if (!oldKey) {
                    Log.info('[DIM] handshake success with session key', newKey);
                    session.setSessionKey(newKey)
                } else if (oldKey === newKey) {
                    Log.warning('[DIM] handshake success duplicated', newKey)
                } else {
                    Log.error('[DIM] handshake again', oldKey, newKey);
                    session.setSessionKey(null)
                }
            } else {
                Log.error('Handshake from other user?', sender, content)
            }
            return []
        }
    });
    ns.cpu.HandshakeCommandProcessor = HandshakeCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var HistoryCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
        this.__delegate = this.createGroupDelegate();
        this.__helper = this.createGroupHelper();
        this.__builder = this.createGroupBuilder()
    };
    Class(HistoryCommandProcessor, BaseCommandProcessor, null, {
        createGroupDelegate: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.group.GroupDelegate(facebook, messenger)
        }, createGroupHelper: function () {
            var delegate = this.getGroupDelegate();
            return new ns.group.GroupCommandHelper(delegate)
        }, createGroupBuilder: function () {
            var delegate = this.getGroupDelegate();
            return new ns.group.GroupHistoryBuilder(delegate)
        }, process: function (content, rMsg) {
            var text = 'Command not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'History command (name: ${command}) not support yet!',
                'replacements': {'command': content.getCmd()}
            })
        }
    });
    HistoryCommandProcessor.prototype.getGroupDelegate = function () {
        return this.__delegate
    };
    HistoryCommandProcessor.prototype.getGroupHelper = function () {
        return this.__helper
    };
    HistoryCommandProcessor.prototype.getGroupBuilder = function () {
        return this.__builder
    };
    ns.cpu.HistoryCommandProcessor = HistoryCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ForwardContent = ns.protocol.ForwardContent;
    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor;
    var GroupCommandProcessor = function (facebook, messenger) {
        HistoryCommandProcessor.call(this, facebook, messenger)
    };
    Class(GroupCommandProcessor, HistoryCommandProcessor, null, {
        getOwner: function (group) {
            var delegate = this.getGroupDelegate();
            return delegate.getOwner(group)
        }, getAssistants: function (group) {
            var delegate = this.getGroupDelegate();
            return delegate.getAssistants(group)
        }, getAdministrators: function (group) {
            var delegate = this.getGroupDelegate();
            return delegate.getAdministrators(group)
        }, saveAdministrators: function (admins, group) {
            var delegate = this.getGroupDelegate();
            return delegate.saveAdministrators(admins, group)
        }, getMembers: function (group) {
            var delegate = this.getGroupDelegate();
            return delegate.getMembers(group)
        }, saveMembers: function (members, group) {
            var delegate = this.getGroupDelegate();
            return delegate.saveMembers(members, group)
        }, saveGroupHistory: function (content, rMsg, group) {
            var delegate = this.getGroupHelper();
            return delegate.saveGroupHistory(content, rMsg, group)
        }, process: function (content, rMsg) {
            var text = 'Command not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Group command (name: ${command}) not support yet!',
                'replacements': {'command': content.getCmd()}
            })
        }, checkCommandExpired: function (content, rMsg) {
            var group = content.getGroup();
            if (!group) {
                Log.error('group command error', content);
                return [null, null]
            }
            var errors;
            var expired = this.getGroupHelper().isCommandExpired(content);
            if (expired) {
                var text = 'Command expired.';
                errors = this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Group command expired: ${cmd}, group: ${ID}',
                    'replacements': {'cmd': content.getCmd(), 'ID': group.toString()}
                });
                group = null
            } else {
                errors = null
            }
            return [group, errors]
        }, checkCommandMembers: function (content, rMsg) {
            var group = content.getGroup();
            if (!group) {
                Log.error('group command error', content);
                return [[], null]
            }
            var errors;
            var members = this.getGroupHelper().getMembersFromCommand(content);
            if (members.length === 0) {
                var text = 'Command error.';
                errors = this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Group members empty: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            } else {
                errors = null
            }
            return [members, errors]
        }, checkGroupMembers: function (content, rMsg) {
            var group = content.getGroup();
            if (!group) {
                Log.error('group command error', content);
                return [null, [], null]
            }
            var errors;
            var owner = this.getOwner(group);
            var members = this.getMembers(group);
            if (!owner || members.length === 0) {
                var text = 'Group empty.';
                errors = this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Group empty: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            } else {
                errors = null
            }
            return [owner, members, errors]
        }, sendGroupHistories: function (group, receiver) {
            var messages = this.getGroupBuilder().buildGroupHistories(group);
            if (messages.length === 0) {
                Log.warning('failed to build history for group', group);
                return false
            }
            var transceiver = this.getMessenger();
            var content = ForwardContent.create(messages);
            var pair = transceiver.sendContent(content, null, receiver, 1);
            return pair && pair[1]
        }
    });
    ns.cpu.GroupCommandProcessor = GroupCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var InviteCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger)
    };
    Class(InviteCommandProcessor, GroupCommandProcessor, null, {
        process: function (content, rMsg) {
            var errors;
            var pair = this.checkCommandExpired(content, rMsg);
            var group = pair[0];
            if (!group) {
                errors = pair[1];
                return !errors ? [] : errors
            }
            var pair1 = this.checkCommandMembers(content, rMsg);
            var inviteList = pair1[0];
            if (!inviteList || inviteList.length === 0) {
                errors = pair[1];
                return !errors ? [] : errors
            }
            var trip = this.checkGroupMembers(content, rMsg);
            var owner = trip[0];
            var members = trip[1];
            if (!owner || !members || members.length === 0) {
                errors = pair[2];
                return !errors ? [] : errors
            }
            var text;
            var sender = rMsg.getSender();
            var admins = this.getAdministrators(group);
            var isOwner = owner.equals(sender);
            var isAdmin = admins.indexOf(sender) >= 0;
            var isMember = members.indexOf(sender) >= 0;
            if (!isMember) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Not allowed to invite member into group: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            }
            var canReset = isOwner || isAdmin;
            var memPair = InviteCommandProcessor.calculateInvited(members, inviteList);
            var newMembers = memPair[0];
            var addedList = memPair[1];
            if (!addedList || addedList.length === 0) {
                var facebook = this.getFacebook();
                var user = facebook.getCurrentUser();
                if (!canReset && user.getIdentifier().equals(owner)) {
                    var ok = this.sendGroupHistories(group, sender);
                    if (!ok) {
                        Log.error('failed to send history for group', group, sender)
                    }
                }
            } else if (!this.saveGroupHistory(content, rMsg, group)) {
                Log.error('failed to save "invite" command', group)
            } else if (!canReset) {
            } else if (this.saveMembers(newMembers, group)) {
                Log.warning('invited by administrator', sender, group);
                content.setValue('added', ID.revert(addedList))
            } else {
                Log.error('failed to save members for group', group)
            }
            return []
        }
    });
    InviteCommandProcessor.calculateInvited = function (members, inviteList) {
        var newMembers = members.slice();
        var addedList = [];
        var item;
        for (var i = 0; i < inviteList.length; ++i) {
            item = inviteList[i];
            if (newMembers.indexOf(item) >= 0) {
                continue
            }
            newMembers.push(item);
            addedList.push(item)
        }
        return [newMembers, addedList]
    };
    ns.cpu.InviteCommandProcessor = InviteCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var ExpelCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger)
    };
    Class(ExpelCommandProcessor, GroupCommandProcessor, null, {
        process: function (content, rMsg) {
            return []
        }
    });
    ns.cpu.ExpelCommandProcessor = ExpelCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Arrays = ns.type.Arrays;
    var Log = ns.lnc.Log;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var QuitCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger)
    };
    Class(QuitCommandProcessor, GroupCommandProcessor, null, {
        process: function (content, rMsg) {
            var errors;
            var pair = this.checkCommandExpired(content, rMsg);
            var group = pair[0];
            if (!group) {
                errors = pair[1];
                return errors ? errors : []
            }
            var trip = this.checkGroupMembers(content, rMsg);
            var owner = trip[0];
            var members = trip[1];
            if (!owner || !members || members.length === 0) {
                errors = pair[2];
                return errors ? errors : []
            }
            var text;
            var sender = rMsg.getSender();
            var admins = this.getAdministrators(group);
            var isOwner = owner.equals(sender);
            var isAdmin = admins.indexOf(sender) >= 0;
            var isMember = members.indexOf(sender) >= 0;
            if (isOwner) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Owner cannot quit from group: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            }
            if (isAdmin) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Administrator cannot quit from group: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            }
            if (!isMember) {
            } else if (!this.saveGroupHistory(content, rMsg, group)) {
                Log.error('failed to save "quit" command for group', group)
            } else {
                var newMembers = members.slice();
                Arrays.remove(newMembers, sender);
                if (this.saveMembers(newMembers, group)) {
                    content.setValue('removed', [sender.toString()])
                } else {
                    Log.error('failed to save members for group', group)
                }
            }
            return []
        }
    });
    ns.cpu.QuitCommandProcessor = QuitCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var QueryCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger)
    };
    Class(QueryCommandProcessor, GroupCommandProcessor, null, {
        process: function (content, rMsg) {
            var errors;
            var pair = this.checkCommandExpired(content, rMsg);
            var group = pair[0];
            if (!group) {
                errors = pair[1];
                return !errors ? [] : errors
            }
            var trip = this.checkGroupMembers(content, rMsg);
            var owner = trip[0];
            var members = trip[1];
            if (!(owner && members && members.length > 0)) {
                errors = pair[2];
                return !errors ? [] : errors
            }
            var text;
            var sender = rMsg.getSender();
            var bots = this.getAssistants(group);
            var isMember = members.indexOf(sender) >= 0;
            var isBot = bots.indexOf(sender) >= 0;
            var canQuery = isMember || isBot;
            if (!canQuery) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Not allowed to query members of group: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            }
            var facebook = this.getFacebook();
            var archivist = facebook.getArchivist();
            var queryTime = content.getDateTime('last_time', null);
            if (queryTime) {
                var lastTime = archivist.getLastGroupHistoryTime(group);
                if (!lastTime) {
                    Log.error('group history error', group)
                } else if (lastTime.getTime() <= queryTime.getTime()) {
                    text = 'Group history not updated.';
                    return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                        'template': 'Group history not updated: ${ID}, last time: ${time}',
                        'replacements': {'ID': group.toString(), 'time': lastTime.getTime() / 1000.0}
                    })
                }
            }
            var ok = this.sendGroupHistories(group, sender);
            if (!ok) {
                Log.error('failed to send history for group', group, sender)
            }
            return []
        }
    });
    ns.cpu.QueryCommandProcessor = QueryCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var ResetCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger)
    };
    Class(ResetCommandProcessor, GroupCommandProcessor, null, {
        process: function (content, rMsg) {
            var errors;
            var pair = this.checkCommandExpired(content, rMsg);
            var group = pair[0];
            if (!group) {
                errors = pair[1];
                return errors ? errors : []
            }
            var pair1 = this.checkCommandMembers(content, rMsg);
            var newMembers = pair1[0];
            if (!newMembers || newMembers.length === 0) {
                errors = pair[1];
                return errors ? errors : []
            }
            var trip = this.checkGroupMembers(content, rMsg);
            var owner = trip[0];
            var members = trip[1];
            if (!(owner && members && members.length > 0)) {
                errors = pair[2];
                return errors ? errors : []
            }
            var text;
            var sender = rMsg.getSender();
            var admins = this.getAdministrators(group);
            var isOwner = owner.equals(sender);
            var isAdmin = admins.indexOf(sender) >= 0;
            var canReset = isOwner || isAdmin;
            if (!canReset) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Not allowed to reset members of group: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            }
            if (!newMembers[0].equals(owner)) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Owner must be the first member of group: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            }
            var expelAdmin = false;
            for (var i = 0; i < admins.length; ++i) {
                if (newMembers.indexOf(admins[i]) < 0) {
                    expelAdmin = true;
                    break
                }
            }
            if (expelAdmin) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Not allowed to expel administrator of group: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            }
            var memPair = ResetCommandProcessor.calculateReset(members, newMembers);
            var addList = memPair[0];
            var removeList = memPair[1];
            if (!this.saveGroupHistory(content, rMsg, group)) {
                Log.error('failed to save "reset" command for group', group)
            } else if (addList.length === 0 && removeList.length === 0) {
            } else if (this.saveMembers(newMembers, group)) {
                Log.info('new members saved in group', group);
                if (addList.length > 0) {
                    content.setValue('added', ID.revert(addList))
                }
                if (removeList.length > 0) {
                    content.setValue('removed', ID.revert(removeList))
                }
            } else {
                Log.error('failed to save members in group', group)
            }
            return []
        }
    });
    ResetCommandProcessor.calculateReset = function (oldMembers, newMembers) {
        var addList = [];
        var removeList = [];
        var item;
        for (var i = 0; i < newMembers.length; ++i) {
            item = newMembers[i];
            if (oldMembers.indexOf(item) < 0) {
                addList.push(item)
            }
        }
        for (var j = 0; j < oldMembers.length; ++j) {
            item = oldMembers[j];
            if (newMembers.indexOf(item) < 0) {
                removeList.push(item)
            }
        }
        return [addList, removeList]
    };
    ns.cpu.ResetCommandProcessor = ResetCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var ContentProcessorCreator = ns.cpu.ContentProcessorCreator;
    var ReceiptCommandProcessor = ns.cpu.ReceiptCommandProcessor;
    var HandshakeCommandProcessor = ns.cpu.HandshakeCommandProcessor;
    var LoginCommandProcessor = ns.cpu.LoginCommandProcessor;
    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor
    var ClientContentProcessorCreator = function (facebook, messenger) {
        ContentProcessorCreator.call(this, facebook, messenger)
    };
    Class(ClientContentProcessorCreator, ContentProcessorCreator, null, {
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (ContentType.HISTORY.equals(type)) {
                return new HistoryCommandProcessor(facebook, messenger)
            }
            if (type === 0) {
                return new BaseContentProcessor(facebook, messenger)
            }
            return ContentProcessorCreator.prototype.createContentProcessor.call(this, type)
        }, createCommandProcessor: function (type, cmd) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            switch (cmd) {
                case Command.HANDSHAKE:
                    return new HandshakeCommandProcessor(facebook, messenger);
                case Command.LOGIN:
                    return new LoginCommandProcessor(facebook, messenger);
                case Command.RECEIPT:
                    return new ReceiptCommandProcessor(facebook, messenger);
                case'group':
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
                    return new ns.cpu.ResetCommandProcessor(facebook, messenger)
            }
            return ContentProcessorCreator.prototype.createCommandProcessor.call(this, type, cmd)
        }
    });
    ns.cpu.ClientContentProcessorCreator = ClientContentProcessorCreator
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var MetaCommand = ns.protocol.MetaCommand;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var GroupCommand = ns.protocol.GroupCommand;
    var Station = ns.mkm.Station;
    var FrequencyChecker = ns.utils.FrequencyChecker;
    var CommonArchivist = ns.CommonArchivist;
    var ClientArchivist = function (db) {
        CommonArchivist.call(this, db);
        this.__documentResponses = new FrequencyChecker(ClientArchivist.RESPOND_EXPIRES);
        this.__lastActiveMembers = {}
    };
    Class(ClientArchivist, CommonArchivist, null, {
        queryMeta: function (identifier) {
            if (!this.isMetaQueryExpired(identifier)) {
                return false
            }
            var messenger = this.getMessenger();
            Log.info('querying meta', identifier);
            var content = MetaCommand.query(identifier);
            var pair = messenger.sendContent(content, null, Station.ANY, 1);
            return pair && pair[1]
        }, queryDocuments: function (identifier, docs) {
            if (!this.isDocumentQueryExpired(identifier)) {
                return false
            }
            var messenger = this.getMessenger();
            var lastTime = this.getLastDocumentTime(identifier, docs);
            Log.info('querying documents', identifier, lastTime);
            var content = DocumentCommand.query(identifier, lastTime);
            var pair = messenger.sendContent(content, null, Station.ANY, 1);
            return pair && pair[1]
        }, queryMembers: function (group, members) {
            if (!this.isMembersQueryExpired(group)) {
                return false
            }
            var facebook = this.getFacebook();
            var user = facebook.getCurrentUser();
            if (!user) {
                Log.error('failed to get current user');
                return false
            }
            var me = user.getIdentifier();
            var lastTime = this.getLastGroupHistoryTime(group);
            Log.info('querying members for group', group, lastTime);
            var content = GroupCommand.query(group);
            content.setDateTime('last_time', lastTime);
            var ok;
            ok = this.queryMembersFromAssistants(content, me, group);
            if (ok) {
                return true
            }
            ok = this.queryMembersFromAdministrators(content, me, group);
            if (ok) {
                return true
            }
            ok = this.queryMembersFromOwner(content, me, group);
            if (ok) {
                return true
            }
            var pair = null;
            var lastMember = this.__lastActiveMembers[group];
            if (lastMember) {
                Log.info('querying members from last member', lastMember, group);
                var messenger = this.getMessenger();
                pair = messenger.sendContent(content, me, lastMember, 1)
            }
            return pair && pair[1]
        }
    });
    ClientArchivist.RESPOND_EXPIRES = 600 * 1000;
    ClientArchivist.prototype.isDocumentResponseExpired = function (identifier, force) {
        return this.__documentResponses.isExpired(identifier, null, force)
    };
    ClientArchivist.prototype.setLastActiveMember = function (group, member) {
        this.__lastActiveMembers[group] = member
    };
    ClientArchivist.prototype.getFacebook = function () {
    };
    ClientArchivist.prototype.getMessenger = function () {
    };
    ClientArchivist.prototype.queryMembersFromAssistants = function (content, sender, group) {
        var facebook = this.getFacebook();
        var bots = facebook.getAssistants(group);
        if (!bots || bots.length === 0) {
            return false
        }
        var messenger = this.getMessenger();
        Log.info('querying members from bots', bots, group);
        var success = 0;
        var pair;
        var receiver;
        for (var i = 0; i < bots.length; ++i) {
            receiver = bots[i];
            if (receiver.equals(sender)) {
                continue
            }
            pair = messenger.sendContent(content, sender, receiver, 1);
            if (pair && pair[1]) {
                success += 1
            }
        }
        if (success === 0) {
            return false
        }
        var lastMember = this.__lastActiveMembers[group];
        if (!lastMember || bots.indexOf(lastMember) >= 0) {
        } else {
            Log.info('querying members from last member', lastMember, group);
            messenger.sendContent(content, sender, lastMember, 1)
        }
        return true
    };
    ClientArchivist.prototype.queryMembersFromAdministrators = function (content, sender, group) {
        var barrack = this.getFacebook();
        var admins = barrack.getAdministrators(group);
        if (!admins || admins.length === 0) {
            return false
        }
        var messenger = this.getMessenger();
        Log.info('querying members from admins', admins, group);
        var success = 0;
        var pair;
        var receiver;
        for (var i = 0; i < admins.length; ++i) {
            receiver = admins[i];
            if (sender.equals(receiver)) {
                continue
            }
            pair = messenger.sendContent(content, sender, receiver, 1);
            if (!(pair && pair[1])) {
            } else {
                success += 1
            }
        }
        if (success <= 0) {
            return false
        }
        var lastMember = this.__lastActiveMembers[group];
        if (!lastMember || admins.indexOf(lastMember) >= 0) {
        } else {
            Log.info('querying members from last member', lastMember, group);
            messenger.sendContent(content, sender, lastMember, 1)
        }
        return true
    };
    ClientArchivist.prototype.queryMembersFromOwner = function (content, sender, group) {
        var facebook = this.getFacebook();
        var owner = facebook.getOwner(group);
        if (!owner) {
            return false
        } else if (owner.equals(sender)) {
            return false
        }
        var messenger = this.getMessenger();
        Log.info('querying members from owner', owner, group);
        var pair = messenger.sendContent(content, sender, owner, 1);
        if (!(pair && pair[1])) {
            return false
        }
        var lastMember = this.__lastActiveMembers[group];
        if (!lastMember || lastMember.equals(owner)) {
        } else {
            Log.info('querying members from last member', lastMember, group);
            messenger.sendContent(content, sender, lastMember, 1)
        }
        return true
    };
    ClientArchivist.prototype.sendDocument = function (visa, receiver, updated) {
        var me = visa.getIdentifier();
        if (me.equals(receiver)) {
            return false
        }
        if (!this.isDocumentResponseExpired(receiver, updated)) {
            return false
        }
        Log.info('push visa document', me, receiver);
        var content = DocumentCommand.response(me, null, visa);
        var messenger = this.getMessenger();
        var pair = messenger.sendContent(content, me, receiver, 1);
        return pair && pair[1]
    };
    ns.ClientArchivist = ClientArchivist
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var EntityType = ns.protocol.EntityType;
    var ID = ns.protocol.ID;
    var Bulletin = ns.protocol.Bulletin;
    var BroadcastHelper = ns.mkm.BroadcastHelper;
    var CommonFacebook = ns.CommonFacebook;
    var ClientFacebook = function () {
        CommonFacebook.call(this)
    };
    Class(ClientFacebook, CommonFacebook, null, {
        saveDocument: function (doc) {
            var ok = CommonFacebook.prototype.saveDocument.call(this, doc);
            if (ok && Interface.conforms(doc, Bulletin)) {
                var array = doc.getProperty('administrators');
                if (array instanceof Array) {
                    var group = doc.getIdentifier();
                    var admins = ID.convert(array);
                    ok = this.saveAdministrators(admins, group)
                }
            }
            return ok
        }, getFounder: function (group) {
            if (group.isBroadcast()) {
                return BroadcastHelper.getBroadcastFounder(group)
            }
            var doc = this.getBulletin(group);
            if (!doc) {
                return null
            }
            var archivist = this.getArchivist();
            var user = archivist.getFounder(group);
            if (user) {
                return user
            }
            return doc.getFounder()
        }, getOwner: function (group) {
            if (group.isBroadcast()) {
                return BroadcastHelper.getBroadcastOwner(group)
            }
            var doc = this.getBulletin(group);
            if (!doc) {
                return null
            }
            var archivist = this.getArchivist();
            var user = archivist.getOwner(group);
            if (user) {
                return user
            }
            if (EntityType.GROUP.equals(group.getType())) {
                user = archivist.getFounder(group);
                if (!user) {
                    user = doc.getFounder()
                }
            }
            return user
        }, getMembers: function (group) {
            var owner = this.getOwner(group);
            if (!owner) {
                return []
            }
            var archivist = this.getArchivist();
            var members = archivist.getMembers(group);
            archivist.checkMembers(group, members);
            if (!members || members.length === 0) {
                members = [owner]
            }
            return members
        }, getAssistants: function (group) {
            var doc = this.getBulletin(group);
            if (!doc) {
                return []
            }
            var archivist = this.getArchivist();
            var bots = archivist.getAssistants(group);
            if (bots && bots.length > 0) {
                return bots
            }
            bots = doc.getAssistants();
            return !bots ? [] : bots
        }, getAdministrators: function (group) {
            var doc = this.getBulletin(group);
            if (!doc) {
                return []
            }
            var archivist = this.getArchivist();
            return archivist.getAdministrators(group)
        }, saveAdministrators: function (admins, group) {
            var archivist = this.getArchivist();
            return archivist.saveAdministrators(admins, group)
        }, saveMembers: function (newMembers, group) {
            var archivist = this.getArchivist();
            return archivist.saveMembers(newMembers, group)
        }
    });
    ns.ClientFacebook = ClientFacebook
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class
    var Log = ns.lnc.Log;
    var EntityType = ns.protocol.EntityType;
    var ID = ns.protocol.ID;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var LoginCommand = ns.protocol.LoginCommand;
    var ReportCommand = ns.protocol.ReportCommand;
    var Station = ns.mkm.Station;
    var MessageHelper = ns.msg.MessageHelper;
    var CommonMessenger = ns.CommonMessenger;
    var ClientMessenger = function (session, facebook, db) {
        CommonMessenger.call(this, session, facebook, db)
    };
    Class(ClientMessenger, CommonMessenger, null, {
        getArchivist: function () {
            var facebook = this.getFacebook();
            return facebook.getArchivist()
        }, processReliableMessage: function (rMsg) {
            var responses = CommonMessenger.prototype.processReliableMessage.call(this, rMsg);
            if (!responses || responses.length === 0) {
                if (this.needsReceipt(rMsg)) {
                    var res = this.buildReceipt(rMsg.getEnvelope());
                    if (res) {
                        responses = [res]
                    }
                }
            }
            return responses
        }, buildReceipt: function (originalEnvelope) {
            var facebook = this.getFacebook();
            var user = !facebook ? null : facebook.getCurrentUser();
            if (!user) {
                Log.error('failed to get current user');
                return null
            }
            var text = 'Message received.';
            var res = ReceiptCommand.create(text, originalEnvelope, null);
            var env = Envelope.create(user.getIdentifier(), originalEnvelope.getSender(), null);
            var iMsg = InstantMessage.create(env, res);
            var sMsg = this.encryptMessage(iMsg);
            if (!sMsg) {
                Log.error('failed to encrypt message', user, originalEnvelope.getSender());
                return null
            }
            var rMsg = this.signMessage(sMsg);
            if (!rMsg) {
                Log.error('failed to sign message', user, originalEnvelope.getSender())
            }
            return rMsg
        }, needsReceipt: function (rMsg) {
            if (ContentType.COMMAND.equals(rMsg.getType())) {
                return false
            }
            var sender = rMsg.getSender();
            if (!EntityType.USER.equals(sender.getType())) {
                return false
            }
            return true
        }, sendInstantMessage: function (iMsg, priority) {
            var session = this.getSession();
            if (session && session.isReady()) {
            } else {
                var content = iMsg.getContent();
                if (!Interface.conforms(content, Command)) {
                    Log.warning('not handshake yet, suspend message', content, iMsg);
                    return null
                } else if (content.getCmd() === Command.HANDSHAKE) {
                    iMsg.setValue('pass', 'handshaking')
                } else {
                    Log.warning('not handshake yet, drop command', content, iMsg);
                    return null
                }
            }
            return CommonMessenger.prototype.sendInstantMessage.call(this, iMsg, priority)
        }, sendReliableMessage: function (rMsg, priority) {
            var passport = rMsg.removeValue('pass');
            var session = this.getSession();
            if (session && session.isReady()) {
            } else if (passport === 'handshaking') {
            } else {
                Log.error('not handshake yet, suspend message', rMsg);
                return false
            }
            return CommonMessenger.prototype.sendReliableMessage.call(this, rMsg, priority)
        }, handshake: function (sessionKey) {
            var session = this.getSession();
            var station = session.getStation();
            var sid = station.getIdentifier();
            var content;
            if (sessionKey) {
                content = HandshakeCommand.restart(sessionKey);
                this.sendContent(content, null, sid, -1)
            } else {
                var facebook = this.getFacebook();
                var user = facebook.getCurrentUser();
                var me = user.getIdentifier();
                var meta = user.getMeta();
                var visa = user.getVisa();
                var env = Envelope.create(me, sid, null);
                content = HandshakeCommand.start();
                content.setGroup(Station.EVERY);
                var iMsg = InstantMessage.create(env, content);
                MessageHelper.setMeta(meta, iMsg);
                MessageHelper.setVisa(visa, iMsg);
                this.sendInstantMessage(iMsg, -1)
            }
        }, handshakeSuccess: function () {
            Log.info('handshake success, change session accepted');
            var session = this.getSession();
            session.setAccepted(true);
            this.broadcastDocuments()
        }, broadcastDocuments: function (updated) {
            var facebook = this.getFacebook();
            var user = !facebook ? null : facebook.getCurrentUser();
            var visa = !user ? null : user.getVisa();
            if (!visa) {
                Log.error('visa not found', user);
                return
            }
            var me = user.getIdentifier();
            var contacts = facebook.getContacts(me);
            for (var i = 0; i < contacts.length; ++i) {
                this.sendVisa(visa, contacts[i], updated)
            }
            this.sendVisa(visa, ID.EVERYONE, updated)
        }, sendVisa: function (visa, receiver, updated) {
            var me = visa.getIdentifier();
            if (me.equals(receiver)) {
                Log.warning('skip cycled message', receiver, visa);
                return false
            }
            var archivist = this.getArchivist();
            if (!archivist.isDocumentResponseExpired(receiver, updated)) {
                Log.info('visa response not expired yet', receiver);
                return false
            }
            Log.info('push visa document', me, receiver);
            var content = DocumentCommand.response(me, null, visa);
            var pair = this.sendContent(content, me, receiver, 1);
            return pair && pair[1]
        }, broadcastLogin: function (sender, userAgent) {
            var session = this.getSession();
            var station = session.getStation();
            var content = LoginCommand.create(sender);
            content.setAgent(userAgent);
            content.setStation(station);
            this.sendContent(content, sender, ID.EVERYONE, 1)
        }, reportOnline: function (sender) {
            var content = ReportCommand.create(ReportCommand.ONLINE);
            this.sendContent(content, sender, Station.ANY, 1)
        }, reportOffline: function (sender) {
            var content = ReportCommand.create(ReportCommand.OFFLINE);
            this.sendContent(content, sender, Station.ANY, 1)
        }
    });
    ns.ClientMessenger = ClientMessenger
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var InstantMessage = ns.protocol.InstantMessage;
    var ContentType = ns.protocol.ContentType;
    var TextContent = ns.protocol.TextContent;
    var FileContent = ns.protocol.FileContent;
    var CommonPacker = ns.CommonPacker;
    var ClientMessagePacker = function (facebook, messenger) {
        CommonPacker.call(this, facebook, messenger)
    };
    Class(ClientMessagePacker, CommonPacker, null, {
        checkReceiver: function (iMsg) {
            var receiver = iMsg.getReceiver();
            if (receiver.isBroadcast()) {
                return true
            } else if (receiver.isUser()) {
                return CommonPacker.prototype.checkReceiver.call(this, iMsg)
            }
            var error;
            var members = this.getMembers(receiver);
            if (!members || members.length === 0) {
                error = {'message': 'group members not found', 'group': receiver.toString()};
                this.suspendInstantMessage(iMsg, error);
                return false
            }
            var waiting = [];
            var item;
            for (var i = 0; i < members.length; ++i) {
                item = members[i];
                if (!this.getVisaKey(item)) {
                    waiting.push(item)
                }
            }
            if (waiting.length === 0) {
                return true
            }
            error = {'message': 'members not ready', 'group': receiver.toString(), 'members': ID.revert(waiting)};
            this.suspendInstantMessage(iMsg, error);
            return waiting.length < members.length
        }, checkGroup: function (sMsg) {
            var receiver = sMsg.getReceiver();
            var group = ID.parse(sMsg.getValue('group'));
            if (!group && receiver.isGroup()) {
                group = receiver
            }
            if (!group || group.isBroadcast()) {
                return true
            }
            var members = this.getMembers(group);
            if (members && members.length > 0) {
                return true
            }
            var error = {'message': 'group not ready', 'group': group.toString()};
            this.suspendReliableMessage(sMsg, error);
            return false
        }, verifyMessage: function (rMsg) {
            if (this.checkGroup(rMsg)) {
            } else {
                Log.warning('receiver not ready', rMsg.getReceiver());
                return null
            }
            return CommonPacker.prototype.verifyMessage.call(this, rMsg)
        }, decryptMessage: function (sMsg) {
            var iMsg;
            try {
                iMsg = CommonPacker.prototype.decryptMessage.call(this, sMsg)
            } catch (e) {
                var errMsg = e.toString();
                if (errMsg.indexOf('failed to decrypt key in msg: ') >= 0) {
                    Log.warning('decrypt message error', e)
                } else if (errMsg.indexOf('receiver error') >= 0) {
                    Log.warning('decrypt message error', e);
                    return null
                } else {
                    throw e;
                }
            }
            if (iMsg) {
                var content = iMsg.getContent();
                if (Interface.conforms(content, FileContent)) {
                    if (!content.getPassword() && content.getURL()) {
                        var messenger = this.getMessenger();
                        var key = messenger.getDecryptKey(sMsg);
                        content.setPassword(key)
                    }
                }
            } else {
                this.pushVisa(sMsg.getSender());
                iMsg = this.getFailedMessage(sMsg)
            }
            return iMsg
        }, pushVisa: function (receiver) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            var user = !facebook ? null : facebook.getCurrentUser();
            if (!user) {
                return false
            }
            var visa = user.getVisa();
            if (visa && visa.isValid()) {
            } else {
                throw new ReferenceError('user visa error' + user.toString());
            }
            return messenger.sendVisa(visa, receiver, false)
        }, getFailedMessage: function (sMsg) {
            var sender = sMsg.getSender();
            var group = sMsg.getGroup();
            var type = sMsg.getType();
            if (ContentType.COMMAND.equals(type) || ContentType.HISTORY.equals(type)) {
                Log.warning('ignore message unable to decrypt', type, sender);
                return null
            }
            var content = TextContent.create('Failed to decrypt message.');
            content.setValue('template', 'Failed to decrypt message (type=${type}) from "${sender}".');
            content.setValue('replacements', {
                'type': type,
                'sender': sender.toString(),
                'group': !group ? null : group.toString()
            });
            if (group) {
                content.setGroup(group)
            }
            var info = sMsg.copyMap(false);
            delete info['data'];
            info['content'] = content.toMap();
            return InstantMessage.parse(info)
        }
    });
    ns.ClientMessagePacker = ClientMessagePacker
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var EntityType = ns.protocol.EntityType;
    var TextContent = ns.protocol.TextContent;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var MessageProcessor = ns.MessageProcessor;
    var ClientMessageProcessor = function (facebook, messenger) {
        MessageProcessor.call(this, facebook, messenger)
    };
    Class(ClientMessageProcessor, MessageProcessor, null, {
        checkGroupTimes: function (content, rMsg) {
            var group = content.getGroup();
            if (!group) {
                return false
            }
            var facebook = this.getFacebook();
            var archivist = facebook.getArchivist();
            if (!archivist) {
                return false
            }
            var now = new Date();
            var docUpdated = false;
            var memUpdated = false;
            var lastDocumentTime = rMsg.getDateTime('GDT', null);
            if (lastDocumentTime) {
                if (lastDocumentTime.getTime() > now.getTime()) {
                    lastDocumentTime = now
                }
                docUpdated = archivist.setLastDocumentTime(group, lastDocumentTime);
                if (docUpdated) {
                    Log.info('checking for new bulletin', group);
                    facebook.getDocuments(group)
                }
            }
            var lastHistoryTime = rMsg.getDateTime('GHT', null);
            if (lastHistoryTime) {
                if (lastHistoryTime.getTime() > now.getTime()) {
                    lastHistoryTime = now
                }
                memUpdated = archivist.setLastGroupHistoryTime(group, lastHistoryTime);
                if (memUpdated) {
                    archivist.setLastActiveMember(group, rMsg.getSender());
                    Log.info('checking for group members', group);
                    facebook.getMembers(group)
                }
            }
            return docUpdated || memUpdated
        }, processContent: function (content, rMsg) {
            var responses = MessageProcessor.prototype.processContent.call(this, content, rMsg);
            this.checkGroupTimes(content, rMsg);
            if (!responses || responses.length === 0) {
                return responses
            } else if (Interface.conforms(responses[0], HandshakeCommand)) {
                return responses
            }
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            var sender = rMsg.getSender();
            var receiver = rMsg.getReceiver();
            var user = facebook.selectLocalUser(receiver);
            if (!user) {
                Log.error('receiver error', receiver);
                return responses
            }
            receiver = user.getIdentifier();
            var network = sender.getType();
            var res;
            for (var i = 0; i < responses.length; ++i) {
                res = responses[i];
                if (!res) {
                    continue
                } else if (Interface.conforms(res, ReceiptCommand)) {
                    if (EntityType.STATION.equals(network)) {
                        continue
                    } else if (EntityType.BOT.equals(network)) {
                        continue
                    }
                } else if (Interface.conforms(res, TextContent)) {
                    if (EntityType.STATION.equals(network)) {
                        continue
                    } else if (EntityType.BOT.equals(network)) {
                        continue
                    }
                }
                messenger.sendContent(res, receiver, sender, 1)
            }
            return []
        }, createCreator: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.cpu.ClientContentProcessorCreator(facebook, messenger)
        }
    });
    ns.ClientMessageProcessor = ClientMessageProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var Runner = ns.fsm.skywalker.Runner;
    var Thread = ns.fsm.threading.Thread;
    var EntityType = ns.protocol.EntityType;
    var Station = ns.mkm.Station;
    var ClientSession = ns.network.ClientSession;
    var SessionState = ns.network.SessionState;
    var SessionStateOrder = ns.network.SessionStateOrder;
    var Terminal = function (facebook, db) {
        Runner.call(this);
        this.__facebook = facebook;
        this.__db = db;
        this.__messenger = null;
        this.__last_time = null
    };
    Class(Terminal, Runner, [SessionState.Delegate], null);
    Terminal.prototype.getUserAgent = function () {
        return navigator.userAgent
    };
    Terminal.prototype.getMessenger = function () {
        return this.__messenger
    };
    Terminal.prototype.getSession = function () {
        var messenger = this.__messenger;
        if (!messenger) {
            return null
        }
        return messenger.getSession()
    };
    Terminal.prototype.connect = function (host, port) {
        var station;
        var session;
        var facebook = this.__facebook;
        var messenger = this.__messenger;
        if (messenger) {
            session = messenger.getSession();
            if (session.isRunning()) {
                station = session.getStation();
                if (station.getPort() === port && station.getHost() === host) {
                    return messenger
                }
            }
        }
        Log.info('connecting to ' + host + ':' + port + ' ...');
        station = this.createStation(host, port);
        session = this.createSession(station);
        messenger = this.createMessenger(session, facebook);
        this.__messenger = messenger;
        var packer = this.createPacker(facebook, messenger);
        var processor = this.createProcessor(facebook, messenger);
        messenger.setPacker(packer);
        messenger.setProcessor(processor);
        session.setMessenger(messenger);
        var user = facebook.getCurrentUser();
        if (user) {
            session.setIdentifier(user.getIdentifier())
        }
        return messenger
    };
    Terminal.prototype.createStation = function (host, port) {
        var station = new Station(host, port);
        station.setDataSource(this.__facebook);
        return station
    };
    Terminal.prototype.createSession = function (station) {
        var session = new ClientSession(this.__db, station);
        session.start(this);
        return session
    };
    Terminal.prototype.createPacker = function (facebook, messenger) {
        return new ns.ClientMessagePacker(facebook, messenger)
    };
    Terminal.prototype.createProcessor = function (facebook, messenger) {
        return new ns.ClientMessageProcessor(facebook, messenger)
    };
    Terminal.prototype.createMessenger = function (session, facebook) {
    };
    Terminal.prototype.start = function () {
        var thread = new Thread(this);
        thread.start()
    };
    Terminal.prototype.finish = function () {
        var messenger = this.__messenger;
        if (messenger) {
            var session = this.getSession();
            if (session) {
                session.stop()
            }
            this.__messenger = null
        }
        return Runner.prototype.finish.call(this)
    };
    Terminal.prototype.process = function () {
        var session = this.getSession();
        var state = !session ? null : session.getState();
        var ss_index = !state ? -1 : state.getIndex();
        if (SessionStateOrder.RUNNING.equals(ss_index)) {
            return false
        } else if (!(session && session.isReady())) {
            return false
        }
        var now = new Date();
        if (this.needsKeepOnline(this.__last_time, now)) {
            this.__last_time = now
        } else {
            return false
        }
        try {
            this.keepOnline()
        } catch (e) {
            Log.error('Terminal::process()', e)
        }
        return false
    };
    Terminal.prototype.needsKeepOnline = function (last, now) {
        if (!last) {
            return false
        }
        return (last.getTime() + 300 * 1000) < now.getTime()
    };
    Terminal.prototype.keepOnline = function () {
        var messenger = this.__messenger;
        var facebook = this.__facebook;
        var user = facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user')
        } else if (EntityType.STATION.equals(user.getType())) {
            messenger.reportOnline(user.getIdentifier())
        } else {
            messenger.broadcastLogin(user.getIdentifier(), this.getUserAgent())
        }
    };
    Terminal.prototype.enterState = function (next, ctx, now) {
    };
    Terminal.prototype.exitState = function (previous, ctx, now) {
        var current = ctx.getCurrentState();
        var index = !current ? -1 : current.getIndex();
        if (index === -1 || SessionStateOrder.ERROR.equals(index)) {
            this.__last_time = null;
            return
        }
        var messenger = this.getMessenger();
        var session = this.getSession();
        if (SessionStateOrder.DEFAULT.equals(index) || SessionStateOrder.CONNECTING.equals(index)) {
            var user = ctx.getSessionID();
            if (!user) {
                Log.warning('current user not set', current);
                return
            }
            Log.info('connect for user: ' + user.toString());
            var remote = !session ? null : session.getRemoteAddress();
            if (!remote) {
                Log.warning('failed to get remote address', session);
                return
            }
            var gate = !session ? null : session.getGate();
            var docker = !gate ? null : gate.fetchPorter(remote, null);
            if (docker) {
                Log.info('connected to: ' + remote.toString())
            } else {
                Log.error('failed to connect: ' + remote.toString())
            }
        } else if (SessionStateOrder.HANDSHAKING.equals(index)) {
            messenger.handshake(null)
        } else if (SessionStateOrder.RUNNING.equals(index)) {
            messenger.handshakeSuccess();
            this.__last_time = now
        }
    };
    Terminal.prototype.pauseState = function (current, ctx, now) {
    };
    Terminal.prototype.resumeState = function (current, ctx, now) {
    };
    ns.network.Terminal = Terminal
})(DIMP);
