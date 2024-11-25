;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
//
//                               Written in 2021 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

//! require 'transmitter.js'
//! require 'gamekeeper.js'

(function (ns) {
    'use strict';

    var Class          = ns.type.Class;
    var PlainDeparture = ns.startrek.PlainDeparture;
    var Session        = ns.network.Session;
    var GateKeeper     = ns.network.GateKeeper;

    /**
     *  Create session
     *
     * @param {string} host   - remote host
     * @param {uint} port     - remote port
     * @param {SessionDBI} db - messenger
     */
    var BaseSession = function (db, host, port) {
        GateKeeper.call(this, host, port);
        this.__db = db;           // SessionDBI
        this.__id = null;         // login user ID
        this.__messenger = null;  // CommonMessenger
    };
    Class(BaseSession, GateKeeper, [Session], {

        // Override
        queueMessagePackage: function (rMsg, data, priority) {
            var ship = new PlainDeparture(data, priority);
            return this.queueAppend(rMsg, ship);
        }
    });

    // Override
    BaseSession.prototype.getDatabase = function () {
        return this.__db;
    };

    // Override
    BaseSession.prototype.getIdentifier = function () {
        return this.__id;
    };

    // Override
    BaseSession.prototype.setIdentifier = function (user) {
        var identifier = this.__id;
        if (!identifier) {
            if (!user) {
                return false;
            }
        } else if (identifier.equals(user)) {
            return false;
        }
        this.__id = user;
        return true;
    };

    BaseSession.prototype.getMessenger = function () {
        return this.__messenger;
    };

    BaseSession.prototype.setMessenger = function (messenger) {
        this.__messenger = messenger;
    };

    //
    //  Transmitter
    //

    // Override
    BaseSession.prototype.sendContent = function (content, sender, receiver, priority) {
        var messenger = this.getMessenger();
        return messenger.sendContent(content, sender, receiver, priority);
    };

    // Override
    BaseSession.prototype.sendInstantMessage = function (iMsg, priority) {
        var messenger = this.getMessenger();
        return messenger.sendInstantMessage(iMsg, priority);
    };

    // Override
    BaseSession.prototype.sendReliableMessage = function (rMsg, priority) {
        var messenger = this.getMessenger();
        return messenger.sendReliableMessage(rMsg, priority);
    };

    //-------- namespace --------
    ns.network.BaseSession = BaseSession;

})(DIMP);
