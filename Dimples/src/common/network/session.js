;
// license: https://mit-license.org
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

    var Class = ns.type.Class;
    var DockerDelegate = ns.startrek.port.DockerDelegate;
    var Transmitter = ns.network.Transmitter;
    var MessageWrapper = ns.network.MessageWrapper;
    var GateKeeper = ns.network.GateKeeper;
    var EntityType = ns.protocol.EntityType;

    /**
     *  Create session
     *
     * @param {string} host  - remote host
     * @param {uint} port    - remote port
     * @param {SessionDB} db - messenger
     */
    var BaseSession = function (host, port, db) {
        GateKeeper.call(this, host, port);
        this.__db = db;
        this.__id = null;  // login user ID
        this.__messenger = null;
    };
    Class(BaseSession, GateKeeper, [DockerDelegate, Transmitter], {

        // Override
        queueMessagePackage: function (rMsg, data, priority) {
            var ship = this.dockerPack(data, priority);
            this.queueAppend(rMsg, ship);
        }
    });

    // Override
    BaseSession.prototype.getDatabase = function () {
        return this.__db
    };

    // Override
    BaseSession.prototype.getIdentifier = function () {
        return this.__id;
    };

    // Override
    BaseSession.prototype.setIdentifier = function (identifier) {
        this.__id = identifier;
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
    BaseSession.prototype.sendContent = function (sender, receiver, content, priority) {
        var messenger = this.getMessenger();
        return messenger.sendContent(sender, receiver, content, priority);
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

    //
    //  Docker Delegate
    //

    // Override
    BaseSession.prototype.onDockerSent = function (departure, docker) {
        if (departure instanceof MessageWrapper) {
            var rMsg = departure.getMessage();
            if (rMsg) {
                var messenger = this.getMessenger();
                // remove from database for actual receiver
                removeReliableMessage(rMsg, this.getIdentifier(), messenger.getDatabase());
            }
        }
    };
    var removeReliableMessage = function (rMsg, receiver, db) {
        // 0. if session ID is empty, means user not login;
        //    this message must be a handshake command, and
        //    its receiver must be the targeted user.
        // 1. if this session is a station, check original receiver;
        //    a message to station won't be stored.
        // 2. if the msg.receiver is a different user ID, means it's
        //    a roaming message, remove it for actual receiver.
        // 3. if the original receiver is a group, it must had been
        //    replaced to the group assistant ID by GroupDeliver.
        if (!receiver || EntityType.STATION.equals(receiver.getType())) {
            receiver = rMsg.getReceiver();
        }
        // TODO:
        //db.removeReliableMessage(receiver, msg);
    };

    //-------- namespace --------
    ns.network.BaseSession = BaseSession;

})(SECHAT);
