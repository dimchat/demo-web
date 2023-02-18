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

//! require 'namespace.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class
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

        /**
         *  Send handshake command to current station
         *
         * @param {string|null} sessionKey - respond session key
         */
        handshake: function (sessionKey) {
            var session = this.getSession();
            var station = session.getStation();
            var sid = station.getIdentifier();
            var cmd;
            if (sessionKey) {
                // handshake again
                cmd = HandshakeCommand.restart(sessionKey);
                this.sendContent(null, sid, cmd, -1);
            } else {
                // first handshake
                var facebook = this.getFacebook();
                var user = facebook.getCurrentUser();
                var uid = user.getIdentifier();
                var meta = user.getMeta();
                var visa = user.getVisa();
                var env = Envelope.create(uid, sid, null);
                cmd = HandshakeCommand.start();
                // send first handshake command as broadcast message
                cmd.setGroup(Station.EVERY);
                // create instant message with meta & visa
                var iMsg = InstantMessage.create(env, cmd);
                iMsg.setValue('meta', meta.toMap());
                iMsg.setValue('visa', visa.toMap());
                this.sendInstantMessage(iMsg, -1);
            }
        },

        /**
         *  Callback for handshake success
         */
        handshakeSuccess: function () {
            // broadcast current documents after handshake success
            this.broadcastDocument();
        },
        /**
         *  Broadcast meta & visa document to all stations
         */
        broadcastDocument: function () {
            var facebook = this.getFacebook();
            var user = facebook.getCurrentUser();
            var uid = user.getIdentifier();
            var meta = user.getMeta();
            var visa = user.getVisa();
            var cmd = DocumentCommand.response(uid, meta, visa);
            // broadcast to 'everyone@everywhere'
            this.sendContent(uid, ID.EVERYONE, cmd, 1);
        },

        /**
         *  Send login command to keep roaming
         */
        broadcastLogin: function (sender, userAgent) {
            var session = this.getSession();
            var station = session.getStation();
            // create login command
            var cmd = LoginCommand.create(sender);
            cmd.setAgent(userAgent);
            cmd.setStation(station);
            // broadcast to 'everyone@everywhere'
            this.sendContent(sender, ID.EVERYONE, cmd, 1);
        },

        /**
         *  Send report command to keep user online
         */
        reportOnline: function (sender) {
            var cmd = ReportCommand.create(ReportCommand.ONLINE);
            this.sendContent(sender, Station.ANY, cmd, 1);
        },

        /**
         *  Send report command to let user offline
         */
        reportOffline: function (sender) {
            var cmd = ReportCommand.create(ReportCommand.OFFLINE);
            this.sendContent(sender, Station.ANY, cmd, 1);
        },

        // Override
        queryMeta: function (identifier) {
            if (!QueryFrequencyChecker.isMetaQueryExpired(identifier, 0)) {
                // query not expired yet
                return false;
            }
            var cmd = MetaCommand.query(identifier);
            this.sendContent(null, Station.ANY, cmd, 1);
            return true;
        },

        // Override
        queryDocument: function (identifier) {
            if (!QueryFrequencyChecker.isDocumentQueryExpired(identifier, 0)) {
                // query not expired yet
                return false;
            }
            var cmd = DocumentCommand.query(identifier);
            this.sendContent(null, Station.ANY, cmd, 1);
            return true;
        }
    });

    //-------- namespace --------
    ns.ClientMessenger = ClientMessenger;

})(SECHAT);
