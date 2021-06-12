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

    var DocumentCommand = sdk.protocol.DocumentCommand;

    var MessagePacker = sdk.MessagePacker;

    var CommonPacker = function (messenger) {
        MessagePacker.call(this, messenger);
    };
    sdk.Class(CommonPacker, MessagePacker, null);

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
            throw new ReferenceError('key data error: ' + key.getMap());
        }
        // get digest
        var part = data.subarray(data.length - 6);
        var digest = sdk.digest.SHA256.digest(part);
        var base64 = sdk.format.Base64.encode(digest);
        keys['digest'] = base64.substr(base64.length - 8);
        rMsg.setValue('keys', keys);
    };
    CommonPacker.prototype.serializeMessage = function (rMsg) {
        attach.call(this, rMsg);
        return MessagePacker.prototype.serializeMessage.call(this, rMsg);
    };
    CommonPacker.prototype.deserializeMessage = function (data) {
        if (!data || data.length < 2) {
            console.error('receive data error', data);
            return null;
        }
        return MessagePacker.prototype.deserializeMessage.call(this, data);
    };

    CommonPacker.prototype.encryptMessage = function (iMsg) {
        var sMsg = MessagePacker.prototype.encryptMessage.call(this, iMsg);
        var receiver = iMsg.getReceiver();
        if (receiver.isGroup()) {
            // reuse group message keys
            var sender = iMsg.getSender();
            var key = this.getMessenger().getCipherKey(sender, receiver, false);
            key.setValue('reused', true);
        }
        // TODO: reuse personal message key?
        return sMsg;
    };
    CommonPacker.prototype.decryptMessage = function (sMsg) {
        try {
            return MessagePacker.prototype.decryptMessage.call(this, sMsg);
        } catch (e) {
            // check exception thrown by DKD: EncryptedMessage.decrypt()
            if (e.toString().indexOf('failed to decrypt key in msg: ') === 0) {
                // visa.key not updated?
                var user = this.getFacebook().getCurrentUser();
                var visa = user.getVisa();
                if (!visa || !visa.isValid()) {
                    // FIXME: user visa not found?
                    throw new ReferenceError('user visa error: ' + user.identifier);
                }
                var cmd = DocumentCommand.response(user.identifier, null, visa);
                this.getMessenger().sendContent(user.identifier, sMsg.getSender(), cmd, null, 0);
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
