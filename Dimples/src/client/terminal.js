;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
//
//                               Written in 2020 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2020 Albert Moky
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// =============================================================================
//

//! require 'fsm.js'
//! require 'session.js'

(function (ns) {
    'use strict';

    var Class  = ns.type.Class;
    var Log    = ns.lnc.Log;

    var Runner = ns.fsm.skywalker.Runner;
    var Thread = ns.fsm.threading.Thread;

    var EntityType        = ns.protocol.EntityType;
    var Station           = ns.mkm.Station;

    var ClientSession     = ns.network.ClientSession;
    var SessionState      = ns.network.SessionState;
    var SessionStateOrder = ns.network.SessionStateOrder;
    // var ClientMessagePacker    = ns.ClientMessagePacker;
    // var ClientMessageProcessor = ns.ClientMessageProcessor;

    /**
     *  DIM Client
     *
     * @param {CommonFacebook} facebook
     * @param {SessionDBI} db
     */
    var Terminal = function(facebook, db) {
        Runner.call(this);
        this.__facebook = facebook;
        this.__db = db;
        this.__messenger = null;  // ClientMessenger
        this.__last_time = null;  // Date: last online time
    };
    Class(Terminal, Runner, [SessionState.Delegate], null);

    // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36"
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

    //
    //  Connection
    //

    Terminal.prototype.connect = function (host, port) {
        var station;  // Station
        var session;  // ClientSession
        var facebook = this.__facebook;
        var messenger = this.__messenger;
        if (messenger) {
            session = messenger.getSession();
            if (session.isRunning()) {
                // current session is running
                station = session.getStation();
                if (station.getPort() === port && station.getHost() === host) {
                    // same target
                    return messenger;
                }
            }
        }
        Log.info('connecting to ' + host + ':' + port + ' ...');
        // create new messenger with session
        station = this.createStation(host, port);
        session = this.createSession(station);
        // create new messenger with session
        messenger = this.createMessenger(session, facebook);
        this.__messenger = messenger;
        // create packer, processor for messenger
        // they have weak references to facebook & messenger
        var packer = this.createPacker(facebook, messenger);
        var processor = this.createProcessor(facebook, messenger);
        messenger.setPacker(packer);
        messenger.setProcessor(processor);
        // TODO: set weak reference to messenger
        session.setMessenger(messenger);
        // login with current user
        var user = facebook.getCurrentUser();
        if (user) {
            session.setIdentifier(user.getIdentifier());
        }
        return messenger;
    };

    // protected
    Terminal.prototype.createStation = function (host, port) {
        var station = new Station(host, port);
        station.setDataSource(this.__facebook);
        return station;
    };
    // protected
    Terminal.prototype.createSession = function (station) {
        var session = new ClientSession(this.__db, station);
        session.start(this);
        return session;
    };
    // protected
    Terminal.prototype.createPacker = function (facebook, messenger) {
        return new ns.ClientMessagePacker(facebook, messenger);
    };
    // protected
    Terminal.prototype.createProcessor = function (facebook, messenger) {
        return new ns.ClientMessageProcessor(facebook, messenger);
    };
    // protected
    Terminal.prototype.createMessenger = function (session, facebook) {};

    //
    //  Threading
    //

    Terminal.prototype.start = function () {
        var thread = new Thread(this);
        thread.start();
    };

    // Override
    Terminal.prototype.finish = function () {
        // stop session in messenger
        var messenger = this.__messenger;
        if (messenger) {
            var session = this.getSession();
            if (session) {
                session.stop();
            }
            this.__messenger = null;
        }
        return Runner.prototype.finish.call(this);
    };

    // Override
    Terminal.prototype.process = function () {
        // 1. check connection
        var session = this.getSession();
        var state = !session ? null : session.getState();
        var ss_index = !state ? -1 : state.getIndex();
        if (SessionStateOrder.RUNNING.equals(ss_index)) {
            // handshake not accepted
            return false;
        } else if (!(session && session.isReady())) {
            // session not ready
            return false;
        }
        // 2. check timeout
        var now = new Date();
        if (this.needsKeepOnline(this.__last_time, now)) {
            // update last online time
            this.__last_time = now;
        } else {
            // not expired yet
            return false;
        }
        // 3. try to report every 5 minutes to keep user online
        try {
            this.keepOnline();
        } catch (e) {
            Log.error('Terminal::process()', e);
        }
        return false;
    };

    // protected
    Terminal.prototype.needsKeepOnline = function (last, now) {
        if (!last) {
            // not login yet
            return false;
        }
        // keep online every 5 minutes
        return (last.getTime() + 300 * 1000) < now.getTime();
    };

    // protected
    Terminal.prototype.keepOnline = function () {
        var messenger = this.__messenger;
        var facebook = this.__facebook;
        var user = facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
        } else if (EntityType.STATION.equals(user.getType())) {
            // a station won't login to another station, if here is a station,
            // it must be a station bridge for roaming messages, we just send
            // report command to the target station to keep session online.
            messenger.reportOnline(user.getIdentifier());
        } else {
            // send login command to everyone to provide more information.
            // this command can keep the user online too.
            messenger.broadcastLogin(user.getIdentifier(), this.getUserAgent());
        }
    };

    //
    //  FSM Delegate
    //

    // Override
    Terminal.prototype.enterState = function (next, ctx, now) {
        // called before state changed
    };

    // Override
    Terminal.prototype.exitState = function (previous, ctx, now) {
        // called after state changed
        var current = ctx.getCurrentState();
        var index = !current ? -1 : current.getIndex();
        if (index === -1 || SessionStateOrder.ERROR.equals(index)) {
            this.__last_time = null;
            return;
        }
        var messenger = this.getMessenger();
        var session = this.getSession();
        if (SessionStateOrder.DEFAULT.equals(index) ||
            SessionStateOrder.CONNECTING.equals(index)) {
            // check current user
            var user = ctx.getSessionID();
            if (!user) {
                Log.warning('current user not set', current);
                return;
            }
            Log.info('connect for user: ' + user.toString());
            var remote = !session ? null : session.getRemoteAddress();
            if (!remote) {
                Log.warning('failed to get remote address', session);
                return;
            }
            var gate = !session ? null : session.getGate();
            var docker = !gate ? null : gate.fetchPorter(remote, null);
            if (docker) {
                Log.info('connected to: ' + remote.toString());
            } else {
                Log.error('failed to connect: ' + remote.toString());
            }
        } else if (SessionStateOrder.HANDSHAKING.equals(index)) {
            // start handshake
            messenger.handshake(null);
        } else if (SessionStateOrder.RUNNING.equals(index)) {
            // broadcast current meta & visa document to all stations
            messenger.handshakeSuccess();
            // update last online time
            this.__last_time = now;
        }
    };

    // Override
    Terminal.prototype.pauseState = function (current, ctx, now) {

    };

    // Override
    Terminal.prototype.resumeState = function (current, ctx, now) {
        // TODO: clear session key for re-login?
    };

    //-------- namespace --------
    ns.network.Terminal = Terminal;

})(DIMP);
