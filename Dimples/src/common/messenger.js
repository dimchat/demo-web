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

//! require 'protocol/*.js'
//! require 'db/*.js'
//! require 'mem/*.js'
//! require 'network/*.js'

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Class     = ns.type.Class;
    var Converter = ns.type.Converter;
    var Log       = ns.lnc.Log;

    var Command        = ns.protocol.Command;
    var Envelope       = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;

    var Compatible     = ns.Compatible;
    var Messenger      = ns.Messenger;

    var CommonMessenger = function (session, facebook, db) {
        Messenger.call(this);
        this.__session = session;    // Session
        this.__facebook = facebook;  // CommonFacebook
        this.__db = db;              // CipherKeyDelegate
        this.__packer = null;        // Packer
        this.__processor = null;     // Processor
    };
    Class(CommonMessenger, Messenger, null, {

        // Override
        encryptKey: function (keyData, receiver, iMsg) {
            try {
                return Messenger.prototype.encryptKey.call(this, keyData, receiver, iMsg);
            } catch (e) {
                // FIXME:
                Log.error('failed to encrypt key for receiver', receiver, e);
            }
        },

        // Override
        serializeKey: function (password, iMsg) {
            // TODO: reuse message key

            // 0. check message key
            var reused = password.getValue('reused');
            var digest = password.getValue('digest');
            if (reused === null && digest === null) {
                // flags not exist, serialize it directly
                return Messenger.prototype.serializeKey.call(this, password, iMsg);
            }
            // 1. remove before serializing key
            password.removeValue('reused');
            password.removeValue('digest');
            // 2. serialize key without flags
            var data = Messenger.prototype.serializeKey.call(this, password, iMsg);
            // 3. put them back after serialized
            if (Converter.getBoolean(reused, false)) {
                password.setValue('reused', true);
            }
            if (digest) {
                password.setValue('digest', digest);
            }
            // OK
            return data;
        },

        // Override
        serializeContent: function (content, password, iMsg) {
            if (Interface.conforms(content, Command)) {
                content = Compatible.fixCommand(content);
            }
            return Messenger.prototype.serializeContent.call(this, content, password, iMsg);
        },

        // Override
        deserializeContent: function (data, password, sMsg) {
            var content = Messenger.prototype.deserializeContent.call(this, data, password, sMsg);
            if (Interface.conforms(content, Command)) {
                content = Compatible.fixCommand(content);
            }
            return content;
        },

        //
        //  Interfaces for Transmitting Message
        //

        // Override
        sendContent: function (content, sender, receiver, priority) {
            if (!sender) {
                var facebook = this.getFacebook();
                var current = facebook.getCurrentUser();
                sender = current.getIdentifier();
            }
            var env = Envelope.create(sender, receiver, null);
            var iMsg = InstantMessage.create(env, content);
            var rMsg = this.sendInstantMessage(iMsg, priority);
            return [iMsg, rMsg];
        },

        sendInstantMessage: function (iMsg, priority) {
            var sender = iMsg.getSender();
            var receiver = iMsg.getReceiver();
            //
            //  0. check cycled message
            //
            if (sender.equals(receiver)) {
                Log.warning('drop cycled message', iMsg.getContent(), sender, receiver, iMsg.getGroup());
                return null;
            } else {
                Log.debug('send instant message, type:' + iMsg.getContent().getType(), sender, receiver, iMsg.getGroup());
                // attach sender's document times
                // for the receiver to check whether user info synchronized
                attachVisaTime.call(this, sender, iMsg);
            }
            //
            //  1. encrypt message
            //
            var sMsg = this.encryptMessage(iMsg);
            if (!sMsg) {
                // assert(false, 'public key not found?');
                return null;
            }
            //
            //  2. sign message
            //
            var rMsg = this.signMessage(sMsg);
            if (!rMsg) {
                // TODO: set msg.state = error
                throw new Error('failed to sign message: ' + sMsg.toString());
            }
            //
            //  3. send message
            //
            if (this.sendReliableMessage(rMsg, priority)) {
                return rMsg;
            } else {
                // failed
                return null;
            }
        },

        sendReliableMessage: function (rMsg, priority) {
            var sender = rMsg.getSender();
            var receiver = rMsg.getReceiver();
            //
            //  0. check cycled message
            //
            if (sender.equals(receiver)) {
                Log.warning('drop cycled message', sender, receiver, rMsg.getGroup());
                return false;
            }
            // 1. serialize message
            var data = this.serializeMessage(rMsg);
            if (!data || data.length === 0) {
                Log.error('failed to serialize message', rMsg);
                return false;
            }
            // 2. call gate keeper to send the message data package
            //    put message package into the waiting queue of current session
            var session = this.getSession();
            return session.queueMessagePackage(rMsg, data, priority);
        }
    });

    // private
    var attachVisaTime = function (sender, iMsg) {
        if (Interface.conforms(iMsg.getContent(), Command)) {
            // no need to attach times for command
            return false;
        }
        var facebook = this.getFacebook();
        var doc = facebook.getVisa(sender);
        if (!doc) {
            Log.warning('failed to get visa document for sender', sender);
            return false;
        }
        // attach sender document time
        var lastDocumentTime = doc.getTime();
        if (lastDocumentTime) {
            iMsg.setDateTime('SDT', lastDocumentTime);
        }
        return true;
    };

    CommonMessenger.prototype.getSession = function () {
        return this.__session;
    };

    // Override
    CommonMessenger.prototype.getEntityDelegate = function () {
        return this.__facebook;
    }

    CommonMessenger.prototype.getFacebook = function () {
        return this.__facebook;
    };

    CommonMessenger.prototype.getDatabase = function () {
        return this.__db;
    };

    // Override
    CommonMessenger.prototype.getCipherKeyDelegate = function () {
        return this.__db;
    };

    // Override
    CommonMessenger.prototype.getPacker = function () {
        return this.__packer;
    };
    CommonMessenger.prototype.setPacker = function (packer) {
        this.__packer = packer;
    };

    // Override
    CommonMessenger.prototype.getProcessor = function () {
        return this.__processor;
    };
    CommonMessenger.prototype.setProcessor = function (processor) {
        this.__processor = processor;
    };

    //-------- namespace --------
    ns.CommonMessenger = CommonMessenger;

})(DIMP);
