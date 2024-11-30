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

//! require 'delegate.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Log   = ns.lnc.Log;

    var ID              = ns.protocol.ID;
    var Envelope        = ns.protocol.Envelope;
    var InstantMessage  = ns.protocol.InstantMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;

    var TripletsHelper  = ns.TripletsHelper;

    /**
     *  Group Message Packer
     *  ~~~~~~~~~~~~~~~~~~~~
     */
    var GroupPacker = function (delegate) {
        TripletsHelper.call(this, delegate);
    };
    Class(GroupPacker, TripletsHelper, null, null);

    /**
     *  Pack as broadcast message
     *
     * @param {Content} content
     * @param {ID} sender
     * @return {ReliableMessage}
     */
    GroupPacker.prototype.packMessage = function (content, sender) {
        var envelope = Envelope.create(sender, ID.ANYONE, null);
        var iMsg = InstantMessage.create(envelope, content);
        iMsg.setString('group', content.getGroup());  // expose group ID
        return this.encryptAndSignMessage(iMsg);
    };

    GroupPacker.prototype.encryptAndSignMessage = function (iMsg) {
        var transceiver = this.getMessenger();
        // encrypt for receiver
        var sMsg = !transceiver ? null : transceiver.encryptMessage(iMsg);
        if (!sMsg) {
            Log.error('failed to encrypt message', iMsg.getSender(), iMsg.getReceiver());
            return null;
        }
        // sign for sender
        var rMsg = !transceiver ? null : transceiver.signMessage(sMsg);
        if (!rMsg) {
            Log.error('failed to sign message', iMsg.getSender(), iMsg.getReceiver());
            return null;
        }
        // OK
        return rMsg;
    };
    
    GroupPacker.prototype.splitInstantMessage = function (iMsg, allMembers) {
        var messages = [];  // List<InstantMessage>
        var sender = iMsg.getSender();

        var info;     // Map
        var item;     // InstantMessage
        var receiver; // ID
        for (var i = 0; i < allMembers.length; ++i) {
            receiver = allMembers[i];
            if (receiver.equals(sender)) {
                // Log.info('skip cycled message', receiver);
                continue;
            }
            Log.info('split group message for member', receiver);
            info = iMsg.copyMap(false);
            // replace 'receiver' with member ID
            info['receiver'] = receiver.toString();
            item = InstantMessage.parse(info);
            if (!item) {
                Log.error('failed to repack message', receiver);
                continue;
            }
            messages.push(item);
        }

        return messages;
    };

    GroupPacker.prototype.splitReliableMessage = function (rMsg, allMembers) {
        var messages = [];  // List<ReliableMessage>
        var sender = rMsg.getSender();

        var keys = rMsg.getEncryptedKeys();
        if (!keys) {
            // TODO: get key digest
            keys = {};
        }

        var keyData;   // Base-64
        var info;      // Map
        var item;      // ReliableMessage
        var receiver;  // ID
        for (var i = 0; i < allMembers.length; ++i) {
            receiver = allMembers[i];
            if (sender.equals(receiver)) {
                Log.info('skip cycled message', receiver);
                continue;
            }
            Log.info('split group message for member', receiver);
            info = rMsg.copyMap(false);
            // replace 'receiver' with member ID
            info['receiver'] = receiver.toString();
            // fetch encrypted key data
            delete info['keys'];
            keyData = keys[receiver.toString()];
            if (keyData) {
                info['key'] = keyData;
            }
            item = ReliableMessage.parse(info);
            if (!item) {
                Log.error('failed to repack message', receiver);
                continue;
            }
            messages.push(item);
        }

        return messages;
    };

    //-------- namespace --------
    ns.group.GroupPacker = GroupPacker;

})(DIMP);
