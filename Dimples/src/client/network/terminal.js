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

    var Class = ns.type.Class;
    var EntityType = ns.protocol.EntityType;
    var Station = ns.mkm.Station;
    var Runner = ns.fsm.skywalker.Runner;
    var Thread = ns.fsm.threading.Thread;
    var StateDelegate = ns.fsm.Delegate;
    var StateMachine = ns.network.StateMachine;
    var ClientSession = ns.network.ClientSession;
    var SessionState = ns.network.SessionState;
    // var ClientMessagePacker = ns.ClientMessagePacker;
    // var ClientMessageProcessor = ns.ClientMessageProcessor;

    /**
     *  DIM Client
     */
    var Terminal = function(facebook, db) {
        Runner.call(this);
        this.__facebook = facebook;
        this.__db = db;
        this.__messenger = null;
        this.__fsm = null;
        this.__last_time = 0;  // last online time;
    };
    Class(Terminal, Runner, [StateDelegate], null);

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
                // current session is active
                station = session.getStation();
                if (station.getHost() === host && station.getPort() === port) {
                    // same target
                    return messenger;
                }
            }
        }
        // stop the machine & remove old messenger
        var machine = this.__fsm;
        if (machine) {
            this.__fsm = null;
            machine.stop();
        }
        var facebook = this.__facebook;
        // create new messenger with session
        station = this.createStation(host, port);
        session = this.createSession(station);
        messenger = this.createMessenger(session, facebook);
        // create packer, processor for messenger
        // they have weak references to facebook & messenger
        var packer = this.createPacker(facebook, messenger);
        var processor = this.createProcessor(facebook, messenger);
        messenger.setPacker(packer);
        messenger.setProcessor(processor);
        // set weak reference to messenger
        session.setMessenger(messenger);
        // create & start state machine
        machine = new StateMachine(session);
        machine.setDelegate(this);
        this.__messenger = messenger;
        this.__fsm = machine;
        machine.start();
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
        var session = new ClientSession(station, this.__db);
        // set current suer for handshaking
        var user = this.__facebook.getCurrentUser();
        if (user) {
            session.setIdentifier(user.getIdentifier());
        }
        session.start();
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
    Terminal.prototype.createMessenger = function (session, facebook) {
        throw new Error('NotImplemented');
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

    // Override
    Terminal.prototype.finish = function () {
        // stop state machine
        var machine = this.__fsm;
        if (machine) {
            this.__fsm = null;
            machine.stop();
        }
        // stop session in messenger
        var messenger = this.__messenger;
        if (messenger) {
            var session = this.getSession();
            session.stop();
            this.__messenger = null;
        }
        return Runner.prototype.finish.call(this);
    };

    // Override
    Terminal.prototype.process = function () {
        // check timeout
        var now = (new Date()).getTime();
        if (!this.isExpired(this.__last_time, now)) {
            // not expired yet
            return false;
        }
        // check session state
        var messenger = this.getMessenger();
        if (!messenger) {
            // not connect
            return false;
        }
        var session = messenger.getSession();
        var uid = session.getIdentifier();
        if (!uid || !this.getState().equals(SessionState.RUNNING)) {
            // handshake not accepted
            return false;
        }
        // report every 6 minutes to keep user online
        try {
            this.keepOnline(uid, messenger);
        } catch (e) {
            console.error('Terminal::process()', e);
        }
        // update last online time
        this.__last_time = now;
        return false;
    };

    // protected
    Terminal.prototype.isExpired = function (last, now) {
        // keep online every 5 minutes
        return now < (last + 300 * 1000);
    };

    // protected
    Terminal.prototype.keepOnline = function (uid, messenger) {
        if (EntityType.STATION.equals(uid.getType())) {
            // a station won't login to another station, if here is a station,
            // it must be a station bridge for roaming messages, we just send
            // report command to the target station to keep session online.
            messenger.reportOnline(uid);
        } else {
            // send login command to everyone to provide more information.
            // this command can keep the user online too.
            messenger.broadcastLogin(uid, this.getUserAgent());
        }
    };

    //
    //  FSM Delegate
    //

    // Override
    Terminal.prototype.enterState = function (next, machine) {
        // called before state changed
    };

    // Override
    Terminal.prototype.exitState = function (previous, machine) {
        // called after state changed
        var messenger = this.getMessenger();
        var current = machine.getCurrentState();
        if (!current) {
            return;
        }
        if (current.equals(SessionState.HANDSHAKING)) {
            // start handshake
            messenger.handshake(null);
        } else if (current.equals(SessionState.RUNNING)) {
            // broadcast current meta & visa document to all stations
            messenger.handshakeSuccess();
            // update last online time
            this.__last_time = (new Date()).getTime();
        }
    };

    // Override
    Terminal.prototype.pauseState = function (current, machine) {

    };

    // Override
    Terminal.prototype.resumeState = function (current, machine) {
        // TODO: clear session key for re-login?
    };

    //-------- namespace --------
    ns.network.Terminal = Terminal;

})(DIMP);
