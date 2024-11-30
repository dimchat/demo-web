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
    var DocumentCommand = ns.protocol.DocumentCommand;
    var GroupCommand    = ns.protocol.GroupCommand;
    var ResetCommand    = ns.protocol.group.ResetCommand
    var ResignCommand   = ns.protocol.group.ResignCommand
    var Envelope        = ns.protocol.Envelope;
    var InstantMessage  = ns.protocol.InstantMessage;

    var DocumentHelper  = ns.mkm.DocumentHelper;
    var TripletsHelper  = ns.TripletsHelper;

    /**
     *  Group History Builder
     *  ~~~~~~~~~~~~~~~~~~~~~
     */
    var GroupHistoryBuilder = function (delegate) {
        TripletsHelper.call(this, delegate);
        this.__helper = this.createHelper();
    };
    Class(GroupHistoryBuilder, TripletsHelper, null, null);

    // protected
    GroupHistoryBuilder.prototype.getHelper = function () {
        return this.__helper;
    };

    /// override for customized helper
    GroupHistoryBuilder.prototype.createHelper = function () {
        var delegate = this.getDelegate();
        return new ns.group.GroupCommandHelper(delegate)
    };

    /**
     *  Build command list for group history:
     *      0. document command
     *      1. reset group command
     *      2. other group commands
     *
     * @param {ID} group
     * @return {ReliableMessage[]}
     */
    GroupHistoryBuilder.prototype.buildGroupHistories = function (group) {
        var messages = [];
        var doc;    // Document
        var reset;  // ResetCommand
        var rMsg;   // ReliableMessage
        //
        //  0. build 'document' command
        //
        var docPair = this.buildDocumentCommand(group);
        doc = docPair[0];
        rMsg = docPair[1];
        if (!doc || !rMsg) {
            Log.warning('failed to build "document" command for group', group);
            return messages;
        } else {
            messages.push(rMsg);
        }
        //
        //  1. append 'reset' command
        //
        var helper = this.getHelper();
        var resPair = helper.getResetCommandMessage(group);
        reset = resPair[0];
        rMsg = resPair[1];
        if (!reset || !rMsg) {
            Log.warning('failed to get "reset" command for group', group);
            return messages;
        } else {
            messages.push(rMsg);
        }
        //
        //  2. append other group commands
        //
        var histories = helper.getGroupHistories(group);
        var hisPair;  // Pair<GroupCommand, ReliableMessage>
        var first;    // GroupCommand
        var second;   // ReliableMessage
        for (var i = 0; i < histories.length; ++i) {
            hisPair = histories[i];
            first = hisPair[0];
            second = hisPair[1];
            if (Interface.conforms(first, ResetCommand)) {
                // 'reset' command already add to the front
                // assert(messages.length == 2, 'group history error: $group, ${history.length}');
                Log.info('skip "reset" command for group', group);
                continue;
            } else if (Interface.conforms(first, ResignCommand)) {
                // 'resign' command, comparing it with document time
                if (DocumentHelper.isBefore(doc.getTime(), first.getTime())) {
                    Log.warning('expired command in group', group);
                    continue;
                }
            } else {
                // other commands('invite', 'join', 'quit'), comparing with 'reset' time
                if (DocumentHelper.isBefore(reset.getTime(), first.getTime())) {
                    Log.warning('expired command in group', group);
                    continue;
                }
            }
            messages.push(second);
        }
        // OK
        return messages;
    };

    /**
     *  Create broadcast 'document' command
     *
     * @param {ID} group
     * @return {[Document, ReliableMessage]}
     */
    GroupHistoryBuilder.prototype.buildDocumentCommand = function (group) {
        var delegate = this.getDelegate();
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        var doc = !delegate ? null : delegate.getBulletin(group);
        if (!user || !doc) {
            Log.error('document not found for group', group);
            return [null, null];
        }
        var me = user.getIdentifier();
        var meta = !delegate ? null : delegate.getMeta(group);
        var command = DocumentCommand.response(group, meta, doc);
        var rMsg = this.packBroadcastMessage(me, command);
        return [doc, rMsg];
    };

    /**
     *  Create broadcast 'reset' group command with newest member list
     *
     * @param {ID} group
     * @param {ID[]} members
     * @return {[Document, ReliableMessage]}
     */
    GroupHistoryBuilder.prototype.buildResetCommand = function (group, members) {
        var delegate = this.getDelegate();
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        var owner = !delegate ? null : delegate.getOwner(group);
        if (!user || !owner) {
            Log.error('owner not found for group', group);
            return [null, null];
        }
        var me = user.getIdentifier();
        if (!owner.equals(me)) {
            var admins = delegate.getAdministrators(group);
            if (!admins || admins.indexOf(me) < 0) {
                Log.warning('not permit to build "reset" command for group"', group, me);
                return [null, null];
            }
        }
        if (!members) {
            members = delegate.getMembers(group);
        }
        var command = GroupCommand.reset(group, members);
        var rMsg = this.packBroadcastMessage(me, command);
        return [command, rMsg];
    };

    // private
    GroupHistoryBuilder.prototype.packBroadcastMessage = function (sender, content) {
        var messenger = this.getMessenger();
        var envelope = Envelope.create(sender, ID.ANYONE, null);
        var iMsg = InstantMessage.create(envelope, content);
        var sMsg = !messenger ? null : messenger.encryptMessage(iMsg);
        if (!sMsg) {
            Log.error('failed to encrypt message', envelope);
            return null;
        }
        var rMsg = !messenger ? null : messenger.signMessage(sMsg);
        if (!rMsg) {
            Log.error('failed to sign message', envelope);
        }
        return rMsg;
    };

    //-------- namespace --------
    ns.group.GroupHistoryBuilder = GroupHistoryBuilder;

})(DIMP);
