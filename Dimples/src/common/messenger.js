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

//! require 'protocol/*.js'
//! require 'db/*.js'
//! require 'mem/*.js'
//! require 'network/*.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var GroupCommand = ns.protocol.GroupCommand;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var QueryFrequencyChecker = ns.mem.QueryFrequencyChecker;
    var Messenger = ns.Messenger;

    var CommonMessenger = function (session, facebook, db) {
        Messenger.call(this);
        this.__session = session;
        this.__facebook = facebook;
        this.__db = db;
        this.__packer = null;
        this.__processor = null;
    };
    Class(CommonMessenger, Messenger, null, {

        //
        //  Interfaces for Transmitting Message
        //

        // Override
        sendContent: function (sender, receiver, content, priority) {
            if (!sender) {
                var current = this.__facebook.getCurrentUser();
                sender = current.getIdentifier();
            }
            var env = Envelope.create(sender, receiver, null);
            var iMsg = InstantMessage.create(env, content);
            var rMsg = this.sendInstantMessage(iMsg, priority);
            return [iMsg, rMsg];
        },

        // Override
        sendInstantMessage: function (iMsg, priority) {
            // send message (secured + certified) to target station
            var sMsg = this.encryptMessage(iMsg);
            if (!sMsg) {
                // public key not found?
                return null;
            }
            var rMsg = this.signMessage(sMsg);
            if (!rMsg) {
                // TODO: set msg.state = error
                throw new ReferenceError('failed to sign message: ' + iMsg);
            }
            if (this.sendReliableMessage(rMsg, priority)) {
                return rMsg;
            }
            // failed
            return null;
        },

        // Override
        sendReliableMessage: function (rMsg, priority) {
            // 1. serialize message
            var data = this.serializeMessage(rMsg);
            // 2. call gate keeper to send the message data package
            //    put message package into the waiting queue of current session
            return this.__session.queueMessagePackage(rMsg, data, priority);
        }
    });

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

    /**
     *  Request for meta with entity ID
     *
     * @param {ID} identifier - entity ID
     * @return {boolean} false on duplicated
     */
    CommonMessenger.prototype.queryMeta = function (identifier) {
        throw new Error('NotImplemented');
    };

    /**
     *  Request for meta & visa document with entity ID
     *
     * @param identifier - entity ID
     * @return {boolean} false on duplicated
     */
    CommonMessenger.prototype.queryDocument = function (identifier) {
        throw new Error('NotImplemented');
    };

    /**
     *  Request for group members with group ID
     *
     * @param identifier - group ID
     * @return {boolean} false on duplicated
     */
    CommonMessenger.prototype.queryMembers = function (identifier) {
        if (QueryFrequencyChecker.isMembersQueryExpired(identifier, 0)) {
            // query not expired yet
            return false;
        }
        var bots = this.__facebook.getAssistants(identifier);
        if (!bots || bots.length === 0) {
            // group assistants not found
            return false;
        }
        // querying members from bots
        var cmd = GroupCommand.query(identifier);
        send_group_command.call(this, cmd, bots);
        return true;
    };
    var send_group_command = function (cmd, members) {
        for (var i = 0; i < members.length; ++i) {
            this.sendContent(null, members[i], cmd, 0);
        }
    }

    // protected
    CommonMessenger.prototype.checkSender = function (rMsg) {
        var sender = rMsg.getSender();
        var visa = rMsg.getVisa();
        if (visa) {
            // first handshake?
            return true;
        }
        var visaKey = this.__facebook.getPublicKeyForEncryption(sender);
        if (visaKey) {
            // sender is OK
            return visaKey;
        }
        if (this.queryDocument(sender)) {
            console.info('CommandMessenger::checkSender(), queryDocument', sender);
        }
        rMsg.setValue('error', {
            'message': 'verify key not found',
            'user': sender.toString()
        });
        return false;
    };

    // protected
    CommonMessenger.prototype.checkReceiver = function (iMsg) {
        var receiver = iMsg.getReceiver();
        if (receiver.isBroadcast()) {
            // broadcast message
            return true;
        }
        if (receiver.isUser()) {
            // check user's meta & document
            if (this.queryDocument(receiver)) {
                console.info('CommandMessenger::checkReceiver(), queryDocument', receiver);
            }
            iMsg.setValue('error', {
                'message': 'encrypt key not found',
                'user': receiver.toString()
            });
            return false;
        } else {
            // check group's meta
            var meta = this.__facebook.getMeta(receiver);
            if (!meta) {
                if (this.queryMeta(receiver)) {
                    console.info('CommandMessenger::checkReceiver(), queryMeta', receiver);
                }
                iMsg.setValue('error', {
                    'message': 'group meta not found',
                    'user': receiver.toString()
                });
                return false;
            }
            // check group members
            var members = this.__facebook.getMembers(receiver);
            if (!members || members.length === 0) {
                if (this.queryMembers(receiver)) {
                    console.info('CommandMessenger::checkReceiver(), queryMembers', receiver);
                }
                iMsg.setValue('error', {
                    'message': 'members not found',
                    'user': receiver.toString()
                });
                return false;
            }
            var waiting = [];
            var item;
            for (var i = 0; i < members.length; ++i) {
                item = members[i];
                if (this.__facebook.getPublicKeyForEncryption(item)) {
                    continue;
                }
                if (this.queryDocument(item)) {
                    console.info('CommandMessenger::checkReceiver(), queryDocument for member', item, receiver);
                }
                waiting.push(item);
            }
            if (waiting.length > 0) {
                iMsg.setValue('error', {
                    'message': 'encrypt keys not found',
                    'group': receiver.toString(),
                    'members': ID.revert(waiting)
                });
                return false;
            }
        }
        // receiver is OK
        return true;
    };

    /*/
    // Override
    CommonMessenger.prototype.serializeKey = function (password, iMsg) {
        // try to reuse message key
        var reused = password.getValue('reused');
        if (reused) {
            var receiver = iMsg.getReceiver();
            if (receiver.isGroup()) {
                // reuse key for grouped message
                return null;
            }
            // remove before serialize key
            password.removeValue('reused');
        }
        var data = Messenger.prototype.serializeKey.call(this, password, iMsg);
        if (reused) {
            // put it back
            password.setValue('reused', reused);
        }
        return data;
    };
    /*/

    // Override
    CommonMessenger.prototype.encryptMessage = function (iMsg) {
        if (!this.checkReceiver(iMsg)) {
            console.warn('receiver not ready', iMsg.getReceiver());
            return null;
        }
        return Messenger.prototype.encryptMessage.call(this, iMsg);
    };

    // Override
    CommonMessenger.prototype.verifyMessage = function (rMsg) {
        if (!this.checkSender(rMsg)) {
            console.warn('sender not ready', rMsg.getReceiver());
            return null;
        }
        return Messenger.prototype.verifyMessage.call(this, rMsg);
    };

    //-------- namespace --------
    ns.CommonMessenger = CommonMessenger;

})(SECHAT);
