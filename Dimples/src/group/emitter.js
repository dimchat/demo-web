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

    var Interface = ns.type.Interface;
    var Class     = ns.type.Class;
    var Log       = ns.lnc.Log;

    var ID              = ns.protocol.ID;
    var ForwardContent  = ns.protocol.ForwardContent;
    var GroupCommand    = ns.protocol.GroupCommand;

    var TripletsHelper  = ns.TripletsHelper;

    /**
     *  Group Message Emitter
     *  ~~~~~~~~~~~~~~~~~~~~~
     */
    var GroupEmitter = function (delegate) {
        TripletsHelper.call(this, delegate);
        this.__packer = this.createPacker();
    };
    Class(GroupEmitter, TripletsHelper, null, null);

    // NOTICE: group assistants (bots) can help the members to redirect messages
    //
    //      if members.length < POLYLOGUE_LIMIT,
    //          means it is a small polylogue group, let the members to split
    //          and send group messages by themselves, this can keep the group
    //          more secretive because no one else can know the group ID even;
    //      else,
    //          set 'assistants' in the bulletin document to tell all members
    //          that they can let the group bot to do the job for them.
    //
    GroupEmitter.POLYLOGUE_LIMIT = 32;

    // NOTICE: expose group ID to reduce encrypting time
    //
    //      if members.length < SECRET_GROUP_LIMIT,
    //          means it is a tiny group, you can choose to hide the group ID,
    //          that you can split and encrypt message one by one;
    //      else,
    //          you should expose group ID in the instant message level, then
    //          encrypt message by one symmetric key for this group, after that,
    //          split and send to all members directly.
    //
    GroupEmitter.SECRET_GROUP_LIMIT = 16;

    // protected
    GroupEmitter.prototype.getPacker = function () {
        return this.__packer;
    };

    /// override for customized packer
    GroupEmitter.prototype.createPacker = function () {
        var delegate = this.getDelegate();
        return new ns.group.GroupPacker(delegate)
    };

    // private
    var attachGroupTimes = function (group, iMsg) {
        if (Interface.conforms(iMsg.getContent(), GroupCommand)) {
            // no need to attach times for group command
            return false;
        }
        var facebook = this.getFacebook();
        var doc = !facebook ? null : facebook.getBulletin(group);
        if (!doc) {
            Log.warning('failed to get bulletin document', group);
            return false;
        }
        // attach group document time
        var lastDocumentTime = doc.getTime();
        if (!lastDocumentTime) {
            Log.warning('document error', doc);
        } else {
            iMsg.setDateTime('GDT', lastDocumentTime);
        }
        // attach group history time
        var archivist = this.getArchivist();
        var lastHistoryTime = archivist.getLastGroupHistoryTime(group);
        if (!lastHistoryTime) {
            Log.warning('failed to get history time', group);
        } else {
            iMsg.setDateTime('GHT', lastHistoryTime);
        }
        return true;
    };
    
    GroupEmitter.prototype.sendInstantMessage = function (iMsg, priority) {
        if (!priority) {
            priority = 0;
        }
        //
        //  0. check group
        //
        var content = iMsg.getContent();
        var group = content.getGroup();
        if (!group) {
            Log.warning('not a group message', iMsg);
            return null;
        } else {
            // attach group's document & history times
            // for the receiver to check whether group info synchronized
            attachGroupTimes.call(this, group, iMsg);
        }

        // TODO: if it's a file message
        //       please upload the file data first
        //       before calling this
        var delegate = this.getDelegate();

        //
        //  1. check group bots
        //
        var prime = delegate.getFastestAssistant(group);
        if (prime != null) {
            // group bots found, forward this message to any bot to let it split for me;
            // this can reduce my jobs.
            return forwardMessage.call(this, iMsg, prime, group, priority);
        }

        //
        //  2. check group members
        //
        var members = delegate.getMembers(group);
        if (!members || members.length === 0) {
            Log.warning('failed to get members', group);
            return null;
        }
        // no 'assistants' found in group's bulletin document?
        // split group messages and send to all members one by one
        if (members.length < GroupEmitter.SECRET_GROUP_LIMIT) {
            // it is a tiny group, split this message before encrypting and signing,
            // then send this group message to all members one by one
            var success = splitAndSendMessage.call(this, iMsg, members, group, priority);
            Log.info('split message(s) for group', success, group);
            return null;
        } else {
            Log.info('splitting message for members', members.length, group);
            // encrypt and sign this message first,
            // then split and send to all members one by one
            return disperseMessage.call(this, iMsg, members, group, priority);
        }
    };

    /**
     *  Encrypt & sign message, then forward to the bot
     *
     * @param {InstantMessage|Message|Mapper} iMsg
     * @param {ID} bot
     * @param {ID} group
     * @param {int} priority
     * @return {ReliableMessage}
     */
    // private
    var forwardMessage = function (iMsg, bot, group, priority) {
        if (!priority) {
            priority = 0;
        }
        // NOTICE: because group assistant (bot) cannot be a member of the group, so
        //         if you want to send a group command to any assistant, you must
        //         set the bot ID as 'receiver' and set the group ID in content;
        //         this means you must send it to the bot directly.
        var transceiver = this.getMessenger();
        var packer = this.getPacker();

        // group bots designated, let group bot to split the message, so
        // here must expose the group ID; this will cause the client to
        // use a "user-to-group" encrypt key to encrypt the message content,
        // this key will be encrypted by each member's public key, so
        // all members will received a message split by the group bot,
        // but the group bots cannot decrypt it.
        iMsg.setString('group', group);

        //
        //  1. pack message
        //
        var rMsg = packer.encryptAndSignMessage(iMsg);
        if (rMsg == null) {
            Log.error('failed to encrypt & sign message', iMsg.getSender(), group);
            return null;
        }

        //
        //  2. forward the group message to any bot
        //
        var content = ForwardContent.create(rMsg);
        var pair = transceiver.sendContent(content, null, bot, priority);
        if (!pair || !pair[1]) {
            Log.warning('failed to forward message to group bot', group, bot);
        }

        // OK, return the forwarding message
        return rMsg;
    };

    /**
     *  Encrypt & sign message, then disperse to all members
     *
     * @param {InstantMessage|Message|Mapper} iMsg
     * @param {ID[]} members
     * @param {ID} group
     * @param {int} priority
     * @return {ReliableMessage}
     */
    // private
    var disperseMessage = function (iMsg, members, group, priority) {
        if (!priority) {
            priority = 0;
        }
        var transceiver = this.getMessenger();
        var packer = this.getPacker();

        // NOTICE: there are too many members in this group
        //         if we still hide the group ID, the cost will be very high.
        //  so,
        //      here I suggest to expose 'group' on this message's envelope
        //      to use a user-to-group password to encrypt the message content,
        //      and the actual receiver can get the decrypt key
        //      with the accurate direction: (sender -> group)
        iMsg.setString('group', group);

        var sender = iMsg.getSender();

        //
        //  0. pack message
        //
        var rMsg = packer.encryptAndSignMessage(iMsg);
        if (!rMsg) {
            Log.error('failed to encrypt & sign message', sender, group);
            return null;
        }

        //
        //  1. split messages
        //
        var messages = packer.splitReliableMessage(rMsg, members);
        var receiver;  // ID
        var ok;        // boolean
        var r_msg;     // ReliableMessage
        for (var i = 0; i < messages.length; ++i) {
            r_msg = messages[i];
            receiver = r_msg.receiver;
            if (sender.equals(receiver)) {
                Log.info('cycled message', sender, receiver, group);
                continue;
            }
            //
            //  2. send message
            //
            ok = transceiver.sendReliableMessage(r_msg, priority);
            if (!ok) {
                Log.error('failed to send message', sender, receiver, group);
            }
        }

        return rMsg;
    };

    /**
     *  Split and send (encrypt + sign) group messages to all members one by one
     *
     * @param {InstantMessage|Message} iMsg
     * @param {ID[]} members
     * @param {ID} group
     * @param {int} priority
     * @return {int}
     */
        // private
    var splitAndSendMessage = function (iMsg, members, group, priority) {
        if (!priority) {
            priority = 0;
        }
        var transceiver = this.getMessenger();
        var packer = this.getPacker();

        // NOTICE: this is a tiny group
        //         I suggest NOT to expose the group ID to maximize its privacy,
        //         the cost is we cannot use a user-to-group password here;
        //         So the other members can only treat it as a personal message
        //         and use the user-to-user symmetric key to decrypt content,
        //         they can get the group ID after decrypted.

        var sender = iMsg.getSender();
        var success = 0;

        //
        //  1. split messages
        //
        var messages = packer.splitInstantMessage(iMsg, members);
        var receiver;  // ID
        var rMsg;      // ReliableMessage
        var i_msg;     // InstantMessage
        for (var i = 0; i < messages.length; ++i) {
            i_msg = messages[i];
            receiver = i_msg.receiver;
            if (sender.equals(receiver)) {
                Log.info('cycled message', sender, receiver, group);
                continue;
            }
            //
            //  2. send message
            //
            rMsg = transceiver.sendInstantMessage(i_msg, priority);
            if (rMsg) {
                Log.error('failed to send message', sender, receiver, group);
                continue;
            }
            success += 1;
        }

        // done!
        return success;
    };

    //-------- namespace --------
    ns.group.GroupEmitter = GroupEmitter;

})(DIMP);
