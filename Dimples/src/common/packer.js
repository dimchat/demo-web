;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
//
//                               Written in 2024 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2024 Albert Moky
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

//! require <dimsdk.js>

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Class     = ns.type.Class;
    var Log       = ns.lnc.Log;

    var ReliableMessage = ns.protocol.ReliableMessage;
    var MessageHelper   = ns.msg.MessageHelper;
    var MessagePacker   = ns.MessagePacker;

    var CommonPacker = function (facebook, messenger) {
        MessagePacker.call(this, facebook, messenger);
    };
    Class(CommonPacker, MessagePacker, null, {

        // protected
        getVisaKey: function (user) {
            var facebook = this.getFacebook();
            return facebook.getPublicKeyForEncryption(user);
        },

        // protected
        getMembers: function (group) {
            var facebook = this.getFacebook();
            return facebook.getMembers(group);
        },

        /**
         *  Check sender before verifying received message
         *
         * @param {ReliableMessage|Message} rMsg - network message
         * @return {boolean} false on verify key not found
         */
        // protected
        checkSender: function (rMsg) {
            var sender = rMsg.getSender();
            // check sender's meta & document
            var visa = MessageHelper.getVisa(rMsg);
            if (visa) {
                // first handshake?
                return visa.getIdentifier().equals(sender);
            } else if (this.getVisaKey(sender)) {
                // sender is OK
                return true;
            }
            // sender not ready, suspend message for waiting document
            var error = {
                'message': 'verify key not found',
                'user': sender.toString()
            };
            this.suspendReliableMessage(rMsg, error);  // rMsg.put("error", error);
            return false;
        },

        /**
         *  Check receiver before encrypting message
         *
         * @param {InstantMessage|Message} iMsg - plain message
         * @return {boolean} false on encrypt key not found
         */
        // protected
        checkReceiver: function (iMsg) {
            var receiver = iMsg.getReceiver();
            if (receiver.isBroadcast()) {
                // broadcast message
                return true;
            } else if (receiver.isGroup()) {
                // NOTICE: station will never send group message, so
                //         we don't need to check group info here; and
                //         if a client wants to send group message,
                //         that should be sent to a group bot first,
                //         and the bot will split it for all members.
                return false;
            } else if (this.getVisaKey(receiver)) {
                // receiver is OK
                return true;
            }
            // receiver not ready, suspend message for waiting document
            var error = {
                'message': 'encrypt key not found',
                'user': receiver.toString()
            };
            this.suspendInstantMessage(iMsg, error);  // iMsg.put("error", error);
            return false;
        },
        
        // Override
        encryptMessage: function (iMsg) {
            // 1. check contact info
            // 2. check group members info
            if (this.checkReceiver(iMsg)) {
                // receiver is ready
            } else {
                Log.warning('receiver not ready', iMsg.getReceiver());
                return null;
            }
            return MessagePacker.prototype.encryptMessage.call(this, iMsg);
        },
        
        // Override
        verifyMessage: function (rMsg) {
            // 1. check receiver/group with local user
            // 2. check sender's visa info
            if (this.checkSender(rMsg)) {
                // sender is ready
            } else {
                Log.warning('sender not ready', rMsg.getSender());
                return null;
            }
            return MessagePacker.prototype.verifyMessage.call(this, rMsg);
        },

        // Override
        signMessage: function (sMsg) {
            if (Interface.conforms(sMsg, ReliableMessage)) {
                // already signed
                return sMsg;
            }
            return MessagePacker.prototype.signMessage.call(this, sMsg);
        },

        // Override
        deserializeMessage: function (data) {
            if (!data || data.length <= 4) {
                // message data error
                return null;
            // } else if (data[0] !== '{' || data[data.length - 1] !== '}') {
            //     // only support JsON format now
            //     return null;
            }
            var rMsg = MessagePacker.prototype.deserializeMessage.call(this, data);
            if (rMsg) {
                ns.Compatible.fixMetaAttachment(rMsg);
            }
            return rMsg;
        },

        // Override
        serializeMessage: function (rMsg) {
            ns.Compatible.fixMetaAttachment(rMsg);
            return MessagePacker.prototype.serializeMessage.call(this, rMsg);
        }
    });

    /**
     *  Add income message in a queue for waiting sender's visa
     *
     * @param {ReliableMessage} rMsg - incoming message
     * @param {{}} info              - error info
     */
    // protected
    CommonPacker.prototype.suspendReliableMessage = function (rMsg, info) {};

    /**
     *  Add outgo message in a queue for waiting receiver's visa
     *
     * @param {InstantMessage} iMsg - outgo message
     * @param {{}} info             - error info
     */
    // protected
    CommonPacker.prototype.suspendInstantMessage = function (iMsg, info) {};

    //-------- namespace --------
    ns.CommonPacker = CommonPacker;

})(DIMP);
