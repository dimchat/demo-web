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

    // attach key digest
    var attach = function (rMsg) {
        var messenger = this.getMessenger();
        // check message delegate
        if (!rMsg.getDelegate()) {
            rMsg.setDelegate(messenger);
        }
        // check msg.key
        if (rMsg.getValue('key')) {
            // rMsg.getEncryptedKey() !== null
            return;
        }
        // check msg.keys
        var keys = rMsg.getEncryptedKeys();
        if (!keys) {
            keys = {};
        } else if (keys['digest']) {
            // key digest already exists
            return;
        }
        // get key with direction
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
            // broadcast message has no key
            return;
        }
        var digest = getKeyDigest(key);
        if (!digest) {
            // key error
            return;
        }
        keys['digest'] = digest;
        rMsg.setValue('keys', keys);
    };
    // get partially key data for digest
    var getKeyDigest = function (key) {
        var data = key.getData();
        if (!data || data.length < 6) {
            return null;
        }
        // get digest for the last 6 bytes of key.data
        var part = data.subarray(data.length - 6);
        var digest = SHA256.digest(part);
        var base64 = Base64.encode(digest);
        base64 = base64.trim();
        return base64.substr(base64.length - 8);
    };

    // Override
    ClientMessagePacker.prototype.serializeMessage = function (rMsg) {
        attach.call(this, rMsg);
        return MessagePacker.prototype.serializeMessage.call(this, rMsg);
    };

    // Override
    ClientMessagePacker.prototype.deserializeMessage = function (data) {
        if (!data || data.length < 2) {
            // message data error
            return null;
        }
        return MessagePacker.prototype.deserializeMessage.call(this, data);
    };

    // Override
    ClientMessagePacker.prototype.signMessage = function (sMsg) {
        if (Interface.conforms(sMsg, ReliableMessage)) {
            // already signed
            return sMsg;
        }
        return MessagePacker.prototype.signMessage.call(this, sMsg);
    };

    /*/
    // Override
    ClientMessagePacker.prototype.encryptMessage = function (iMsg) {
        // make sure visa.key exists before encrypting message
        var sMsg = MessagePacker.prototype.encryptMessage.call(this, iMsg);
        var receiver = iMsg.getReceiver();
        if (receiver.isGroup()) {
            // reuse group message keys
            var messenger = this.getMessenger();
            var sender = iMsg.getSender();
            var key = messenger.getCipherKey(sender, receiver, false);
            key.setValue('reused', true);
        }
        // TODO: reuse personal message key?
        return sMsg;
    };
    /*/

    // Override
    ClientMessagePacker.prototype.decryptMessage = function (sMsg) {
        try {
            return MessagePacker.prototype.decryptMessage.call(this, sMsg);
        } catch (e) {
            // check exception thrown by DKD: EncryptedMessage.decrypt()
            if (e.toString().indexOf('failed to decrypt key in msg: ') >= 0) {
                // visa.key not updated?
                var facebook = this.getFacebook();
                var user = facebook.getCurrentUser();
                var visa = user.getVisa();
                if (!visa || !visa.isValid()) {
                    // FIXME: user visa not found?
                    throw new ReferenceError('user visa error: ' + user.getIdentifier());
                }
                var cmd = DocumentCommand.response(user.getIdentifier(), null, visa);
                var messenger = this.getMessenger();
                messenger.sendContent(user.getIdentifier(), sMsg.getSender(), cmd, 0);
            } else {
                // FIXME: message error? cipher text error?
                throw e;
            }
            return null;
        }
    };

    //-------- namespace --------
    ns.ClientMessagePacker = ClientMessagePacker;

})(DIMP);
