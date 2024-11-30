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

//! require 'common/*.js'

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Class     = ns.type.Class
    var Log       = ns.lnc.Log;

    var EntityType       = ns.protocol.EntityType;
    var ID               = ns.protocol.ID;
    var Envelope         = ns.protocol.Envelope;
    var InstantMessage   = ns.protocol.InstantMessage;
    var ContentType      = ns.protocol.ContentType;
    var Command          = ns.protocol.Command;
    var DocumentCommand  = ns.protocol.DocumentCommand;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var ReceiptCommand   = ns.protocol.ReceiptCommand;
    var LoginCommand     = ns.protocol.LoginCommand;
    var ReportCommand    = ns.protocol.ReportCommand;

    var Station          = ns.mkm.Station;
    var MessageHelper    = ns.msg.MessageHelper;
    var CommonMessenger  = ns.CommonMessenger;

    var ClientMessenger = function (session, facebook, db) {
        CommonMessenger.call(this, session, facebook, db);
    };
    Class(ClientMessenger, CommonMessenger, null, {

        // protected
        getArchivist: function () {
            var facebook = this.getFacebook();
            return facebook.getArchivist();
        },

        // Override
        processReliableMessage: function (rMsg) {
            var responses = CommonMessenger.prototype.processReliableMessage.call(this, rMsg);
            if (!responses || responses.length === 0) {
                if (this.needsReceipt(rMsg)) {
                    var res = this.buildReceipt(rMsg.getEnvelope());
                    if (res) {
                        responses = [res];
                    }
                }
            }
            return responses;
        },

        // protected
        buildReceipt: function (originalEnvelope) {
            var facebook = this.getFacebook();
            var user = !facebook ? null : facebook.getCurrentUser();
            if (!user) {
                Log.error('failed to get current user');
                return null;
            }
            var text = 'Message received.';
            var res = ReceiptCommand.create(text, originalEnvelope, null);
            var env = Envelope.create(user.getIdentifier(), originalEnvelope.getSender(), null);
            var iMsg = InstantMessage.create(env, res);
            var sMsg = this.encryptMessage(iMsg);
            if (!sMsg) {
                Log.error('failed to encrypt message', user, originalEnvelope.getSender());
                return null;
            }
            var rMsg = this.signMessage(sMsg);
            if (!rMsg) {
                Log.error('failed to sign message', user, originalEnvelope.getSender());
            }
            return rMsg;
        },

        // protected
        needsReceipt: function (rMsg) {
            if (ContentType.COMMAND.equals(rMsg.getType())) {
                // filter for looping message (receipt for receipt)
                return false;
            }
            var sender = rMsg.getSender();
            // var receiver = rMsg.getReceiver();
            // if (EntityType.STATION.equals(receiver.getType()) || EntityType.BOT.equals(receiver.getType())) {
            //     if (EntityType.STATION.equals(sender.getType()) || EntityType.BOT.equals(sender.getType())) {
            //         // message between bots
            //         return false;
            //     }
            // }
            if (!EntityType.USER.equals(sender.getType())/* && !EntityType.USER.equals(receiver.getType())*/) {
                // message between bots
                return false;
            }
            // var facebook = this.getFacebook();
            // var user = !facebook ? null : facebook.getCurrentUser();
            // if (!user || !user.getIdentifier().equals(receiver)) {
            //     // forward message
            //     return true;
            // }
            // TODO: other condition?
            return true;
        },

        // Override
        sendInstantMessage: function (iMsg, priority) {
            var session = this.getSession();
            if (session && session.isReady()) {
                // OK, any message can go out
            } else {
                // not login yet
                var content = iMsg.getContent();
                if (!Interface.conforms(content, Command)) {
                    Log.warning('not handshake yet, suspend message', content, iMsg);
                    // TODO: suspend instant message
                    return null;
                } else if (content.getCmd() === Command.HANDSHAKE) {
                    // NOTICE: only handshake message can go out
                    iMsg.setValue('pass', 'handshaking');
                } else {
                    Log.warning('not handshake yet, drop command', content, iMsg);
                    // TODO: suspend instant message
                    return null;
                }
            }
            return CommonMessenger.prototype.sendInstantMessage.call(this, iMsg, priority);
        },

        // Override
        sendReliableMessage: function (rMsg, priority) {
            var passport = rMsg.removeValue('pass');
            var session = this.getSession();
            if (session && session.isReady()) {
                // OK, any message can go out
            } else if (passport === 'handshaking') {
                // not login yet, let the handshake message go out only
            } else {
                Log.error('not handshake yet, suspend message', rMsg);
                // TODO: suspend reliable message
                return false;
            }
            return CommonMessenger.prototype.sendReliableMessage.call(this, rMsg, priority);
        },

        /**
         *  Send handshake command to current station
         *
         * @param {string|null} sessionKey - respond session key
         */
        handshake: function (sessionKey) {
            var session = this.getSession();
            var station = session.getStation();
            var sid = station.getIdentifier();
            var content;
            if (sessionKey) {
                // handshake again
                content = HandshakeCommand.restart(sessionKey);
                this.sendContent(content, null, sid, -1);
            } else {
                // first handshake
                var facebook = this.getFacebook();
                var user = facebook.getCurrentUser();
                var me = user.getIdentifier();
                var meta = user.getMeta();
                var visa = user.getVisa();
                var env = Envelope.create(me, sid, null);
                content = HandshakeCommand.start();
                // send first handshake command as broadcast message
                content.setGroup(Station.EVERY);
                // create instant message with meta & visa
                var iMsg = InstantMessage.create(env, content);
                MessageHelper.setMeta(meta, iMsg);
                MessageHelper.setVisa(visa, iMsg);
                // iMsg.setMap('meta', meta);
                // iMsg.setMap('visa', visa);
                this.sendInstantMessage(iMsg, -1);
            }
        },

        /**
         *  Callback for handshake success
         */
        handshakeSuccess: function () {
            // change the flag of current session
            Log.info('handshake success, change session accepted');
            var session = this.getSession();
            session.setAccepted(true);
            // broadcast current documents after handshake success
            this.broadcastDocuments();
            // TODO: let a service bot to do this job
        },
        /**
         *  Broadcast meta & visa document to all stations
         */
        broadcastDocuments: function (updated) {
            var facebook = this.getFacebook();
            var user = !facebook ? null : facebook.getCurrentUser();
            var visa = !user ? null : user.getVisa();
            if (!visa) {
                Log.error('visa not found', user);
                return;
            }
            var me = user.getIdentifier();
            //
            //  send to all contacts
            //
            var contacts = facebook.getContacts(me);
            for (var i = 0; i < contacts.length; ++i) {
                this.sendVisa(visa, contacts[i], updated);
            }
            //
            //  broadcast to 'everyone@everywhere'
            //
            this.sendVisa(visa, ID.EVERYONE, updated);
        },

        /**
         *  Send my visa document to contact
         *      if document is updated, force to send it again.
         *      else only send once every 10 minutes.
         *
         * @param {Visa|Document} visa
         * @param {ID|*} receiver
         * @param {Boolean} updated
         * @return {boolean}
         */
        sendVisa: function (visa, receiver, updated) {
            var me = visa.getIdentifier();
            if (me.equals(receiver)) {
                Log.warning('skip cycled message', receiver, visa);
                return false;
            }
            var archivist = this.getArchivist();
            if (!archivist.isDocumentResponseExpired(receiver, updated)) {
                // response not expired yet
                Log.info('visa response not expired yet', receiver);
                return false;
            }
            Log.info('push visa document', me, receiver);
            var content = DocumentCommand.response(me, null, visa);
            var pair = this.sendContent(content, me, receiver, 1);
            return pair && pair[1];
        },

        /**
         *  Send login command to keep roaming
         */
        broadcastLogin: function (sender, userAgent) {
            var session = this.getSession();
            var station = session.getStation();
            // create login command
            var content = LoginCommand.create(sender);
            content.setAgent(userAgent);
            content.setStation(station);
            // broadcast to 'everyone@everywhere'
            this.sendContent(content, sender, ID.EVERYONE, 1);
        },

        /**
         *  Send report command to keep user online
         */
        reportOnline: function (sender) {
            var content = ReportCommand.create(ReportCommand.ONLINE);
            this.sendContent(content, sender, Station.ANY, 1);
        },

        /**
         *  Send report command to let user offline
         */
        reportOffline: function (sender) {
            var content = ReportCommand.create(ReportCommand.OFFLINE);
            this.sendContent(content, sender, Station.ANY, 1);
        }
    });

    //-------- namespace --------
    ns.ClientMessenger = ClientMessenger;

})(DIMP);
