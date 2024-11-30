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
    var Class     = ns.type.Class;
    var Log       = ns.lnc.Log;

    var ID             = ns.protocol.ID;
    var InstantMessage = ns.protocol.InstantMessage;
    var ContentType    = ns.protocol.ContentType;
    var TextContent    = ns.protocol.TextContent;
    var FileContent    = ns.protocol.FileContent;

    var CommonPacker   = ns.CommonPacker;

    var ClientMessagePacker = function (facebook, messenger) {
        CommonPacker.call(this, facebook, messenger);
    };
    Class(ClientMessagePacker, CommonPacker, null, {

        // Override
        checkReceiver: function (iMsg) {
            var receiver = iMsg.getReceiver();
            if (receiver.isBroadcast()) {
                // broadcast message
                return true;
            } else if (receiver.isUser()) {
                // check user's meta & document
                return CommonPacker.prototype.checkReceiver.call(this, iMsg);
            }
            var error;  // Map
            //
            //  check group's meta & members
            //
            var members = this.getMembers(receiver);
            if (!members || members.length === 0) {
                // group not ready, suspend message for waiting meta/members
                error = {
                    'message': 'group members not found',
                    'group': receiver.toString()
                };
                this.suspendInstantMessage(iMsg, error);  // iMsg.put("error", error);
                return false;
            }
            //
            //  check group members' visa key
            //
            var waiting = [];
            var item;  // ID
            for (var i = 0; i < members.length; ++i) {
                item = members[i];
                if (!this.getVisaKey(item)) {
                    // member not ready
                    waiting.push(item);
                }
            }
            if (waiting.length === 0) {
                // all members' visa keys exist
                return true;
            }
            // members not ready, suspend message for waiting document
            error = {
                'message': 'members not ready',
                'group': receiver.toString(),
                'members': ID.revert(waiting)
            };
            this.suspendInstantMessage(iMsg, error);  // iMsg.put("error", error);
            // perhaps some members have already disappeared,
            // although the packer will query document when the member's visa key is not found,
            // but the station will never respond with the right document,
            // so we must return true here to let the messaging continue;
            // when the member's visa is responded, we should send the suspended message again.
            return waiting.length < members.length;
        },

        // protected
        checkGroup: function (sMsg) {
            var receiver = sMsg.getReceiver();
            // check group
            var group = ID.parse(sMsg.getValue('group'));
            if (!group && receiver.isGroup()) {
                /// Transform:
                ///     (B) => (J)
                ///     (D) => (G)
                group = receiver;
            }
            if (!group || group.isBroadcast()) {
                /// A, C - personal message (or hidden group message)
                //      the packer will call the facebook to select a user from local
                //      for this receiver, if no user matched (private key not found),
                //      this message will be ignored;
                /// E, F, G - broadcast group message
                //      broadcast message is not encrypted, so it can be read by anyone.
                return true;
            }
            /// H, J, K - group message
            //      check for received group message
            var members = this.getMembers(group);
            if (members && members.length > 0) {
                // group is ready
                return true;
            }
            // group not ready, suspend message for waiting members
            var error = {
                'message': 'group not ready',
                'group': group.toString()
            };
            this.suspendReliableMessage(sMsg, error);  // rMsg.put("error", error);
            return false;
        },

        // Override
        verifyMessage: function (rMsg) {
            // check receiver/group with local user
            if (this.checkGroup(rMsg)) {
                // receiver is ready
            } else {
                Log.warning('receiver not ready', rMsg.getReceiver());
                return null;
            }
            return CommonPacker.prototype.verifyMessage.call(this, rMsg);
        },

        decryptMessage: function (sMsg) {
            var iMsg;
            try {
                iMsg = CommonPacker.prototype.decryptMessage.call(this, sMsg);
            } catch (e) {
                // check exception thrown by DKD: EncryptedMessage.decrypt()
                var errMsg = e.toString();
                if (errMsg.indexOf('failed to decrypt key in msg: ') >= 0) {
                    // Exception from 'SecureMessagePacker::decrypt(sMsg, receiver)'
                    Log.warning('decrypt message error', e);
                    // visa.key changed?
                    // push my newest visa to the sender
                } else if (errMsg.indexOf('receiver error') >= 0) {
                    // Exception from 'MessagePacker::decryptMessage(sMsg)'
                    Log.warning('decrypt message error', e);
                    // not for you?
                    // just ignore it
                    return null;
                } else {
                    throw e;
                }
            }
            if (iMsg) {
                var content = iMsg.getContent();
                if (Interface.conforms(content, FileContent)) {
                    if (!content.getPassword() && content.getURL()) {
                        // now received file content with remote data,
                        // which must be encrypted before upload to CDN;
                        // so keep the password here for decrypting after downloaded.
                        var messenger = this.getMessenger();
                        var key = messenger.getDecryptKey(sMsg);
                        // keep password to decrypt data after downloaded
                        content.setPassword(key);
                    }
                }
            } else {
                // failed to decrypt message, visa.key changed?
                // 1. push new visa document to this message sender
                /*await */this.pushVisa(sMsg.getSender());
                // 2. build 'failed' message
                iMsg = this.getFailedMessage(sMsg);
            }
            return iMsg;
        },

        // protected
        pushVisa: function (receiver) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            var user = !facebook ? null : facebook.getCurrentUser();
            if (!user) {
                return false;
            }
            var visa = user.getVisa();
            if (visa && visa.isValid()) {} else {
                // FIXME: user visa not found?
                throw new ReferenceError('user visa error' + user.toString());
            }
            return messenger.sendVisa(visa, receiver, false);
        },

        // protected
        getFailedMessage: function (sMsg) {
            var sender = sMsg.getSender();
            var group = sMsg.getGroup();
            var type = sMsg.getType();
            if (ContentType.COMMAND.equals(type) || ContentType.HISTORY.equals(type)) {
                Log.warning('ignore message unable to decrypt', type, sender);
                return null;
            }
            // create text content
            var content = TextContent.create('Failed to decrypt message.');
            content.setValue('template', 'Failed to decrypt message (type=${type}) from "${sender}".');
            content.setValue('replacements', {
                'type': type,
                'sender': sender.toString(),
                'group': !group ? null : group.toString()
            });
            if (group) {
                content.setGroup(group);
            }
            // pack instant message
            var info = sMsg.copyMap(false);
            delete info['data'];
            info['content'] = content.toMap();
            return InstantMessage.parse(info);
        }
    });

    //-------- namespace --------
    ns.ClientMessagePacker = ClientMessagePacker;

})(DIMP);
