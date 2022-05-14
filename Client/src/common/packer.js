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

(function (ns, sdk) {
    'use strict';

    var Meta = sdk.protocol.Meta;
    var ReliableMessage = sdk.protocol.ReliableMessage;
    var DocumentCommand = sdk.protocol.DocumentCommand;
    var MessagePacker = sdk.MessagePacker;

    var CommonPacker = function (facebook, messenger) {
        MessagePacker.call(this, facebook, messenger);
    };
    sdk.Class(CommonPacker, MessagePacker, null, null);

    // attach key digest
    var attach = function (rMsg) {
        var messenger = this.getMessenger();
        if (!rMsg.getDelegate()) {
            rMsg.setDelegate(messenger);
        }
        if (rMsg.getEncryptedKey()) {
            // 'key' exists
            return;
        }
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
            // broadcast message?
            return;
        }
        // get key data
        var data = key.getData();
        if (!data || data.length === 0) {
            if (key.getAlgorithm() === 'PLAIN') {
                // broadcast message has no key
                return;
            }
            throw new ReferenceError('key data error: ' + key.toMap());
        }
        // get digest
        var part = data.subarray(data.length - 6);
        var digest = sdk.digest.SHA256.digest(part);
        var base64 = sdk.format.Base64.encode(digest);
        keys['digest'] = base64.substr(base64.length - 8);
        rMsg.setValue('keys', keys);
    };

    // Override
    CommonPacker.prototype.serializeMessage = function (rMsg) {
        attach.call(this, rMsg);
        return MessagePacker.prototype.serializeMessage.call(this, rMsg);
    };

    // Override
    CommonPacker.prototype.deserializeMessage = function (data) {
        if (!data || data.length < 2) {
            console.error('receive data error', data);
            return null;
        }
        return MessagePacker.prototype.deserializeMessage.call(this, data);
    };

    // Override
    CommonPacker.prototype.signMessage = function (sMsg) {
        if (sdk.Interface.conforms(sMsg, ReliableMessage)) {
            // already signed
            return sMsg;
        }
        return MessagePacker.prototype.signMessage.call(this, sMsg);
    };

    // Override
    CommonPacker.prototype.verifyMessage = function (rMsg) {
        var sender = rMsg.getSender();
        // [Meta Protocol]
        var meta = rMsg.getMeta();
        if (!meta) {
            var facebook = this.getFacebook();
            meta = facebook.getMeta(sender);
        } else if (!Meta.matches(meta, sender)) {
            meta = null;
        }
        if (!meta) {
            // NOTICE: the application will query meta automatically,
            //         save this message in a queue waiting sender's meta response
            var messenger = this.getMessenger();
            messenger.suspendReliableMessage(rMsg);
            return null;
        }
        // make sure meta exists before verifying message
        return MessagePacker.prototype.verifyMessage.call(this, rMsg);
    };

    var isWaiting = function (identifier, facebook) {
        if (identifier.isGroup()) {
            // checking group meta
            return !facebook.getMeta(identifier);
        } else {
            // checking visa key
            return !facebook.getPublicKeyForEncryption(identifier);
        }
    };

    // Override
    CommonPacker.prototype.encryptMessage = function (iMsg) {
        var facebook = this.getFacebook();
        var messenger = this.getMessenger();
        var receiver = iMsg.getReceiver();
        var group = iMsg.getGroup();
        if (!(receiver.isBroadcast() || (group && group.isBroadcast()))) {
            // this message is not a broadcast message
            if (isWaiting(receiver, facebook) || (group && isWaiting(group, facebook))) {
                // NOTICE: the application will query visa automatically,
                //         save this message in a queue waiting sender's visa response
                messenger.suspendInstantMessage(iMsg);
                return null;
            }
        }
        // make sure visa.key exists before encrypting message
        var sMsg = MessagePacker.prototype.encryptMessage.call(this, iMsg);
        if (receiver.isGroup()) {
            // reuse group message keys
            var sender = iMsg.getSender();
            var key = messenger.getCipherKey(sender, receiver, false);
            key.setValue('reused', true);
        }
        // TODO: reuse personal message key?
        return sMsg;
    };

    // Override
    CommonPacker.prototype.decryptMessage = function (sMsg) {
        try {
            return MessagePacker.prototype.decryptMessage.call(this, sMsg);
        } catch (e) {
            // check exception thrown by DKD: EncryptedMessage.decrypt()
            if (e.toString().indexOf('failed to decrypt key in msg: ') === 0) {
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
    ns.CommonPacker = CommonPacker;

    ns.registers('CommonPacker');

})(SECHAT, DIMSDK);
