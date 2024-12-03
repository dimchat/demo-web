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
    var Document        = ns.protocol.Document;
    var DocumentCommand = ns.protocol.DocumentCommand;

    var Station         = ns.mkm.Station;
    var TripletsHelper  = ns.TripletsHelper;

    /**
     *  Group Admin Manager
     *  ~~~~~~~~~~~~~~~~~~~
     */
    var AdminManager = function (delegate) {
        TripletsHelper.call(this, delegate);
    };
    Class(AdminManager, TripletsHelper, null, null);

    /**
     *  Update 'administrators' in bulletin document
     *  (broadcast new document to all members and neighbor station)
     *
     * @param {ID} group       - group ID
     * @param {ID[]} newAdmins - administrator list
     * @return {boolean} false on error
     */
    AdminManager.prototype.updateAdministrators = function (newAdmins, group) {
        var delegate = this.getDelegate();
        var barrack = this.getFacebook();

        //
        //  0. get current user
        //
        var user = !barrack ? null : barrack.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return false;
        }
        var me = user.getIdentifier();
        var sKey = !barrack ? null : barrack.getPrivateKeyForVisaSignature(me);

        //
        //  1. check permission
        //
        var isOwner = delegate.isOwner(me, group);
        if (!isOwner) {
            // assert(false, 'cannot update administrators for group: $group, $me');
            return false;
        }

        //
        //  2. update document
        //
        var bulletin = delegate.getBulletin(group);
        if (!bulletin) {
            // TODO: create new one?
            Log.error('failed to get group document', group);
            return false;
        } else {
            // clone for modifying
            var clone = Document.parse(bulletin.copyMap(false));
            if (clone) {
                bulletin = clone;
            } else {
                Log.error('bulletin error', bulletin, group);
                return false;
            }
        }
        bulletin.setProperty('administrators', ID.revert(newAdmins));
        var signature = !sKey ? null : bulletin.sign(sKey);
        if (!signature) {
            Log.error('failed to sign document for group', group, me);
            return false;
        } else if (!delegate.saveDocument(bulletin)) {
            Log.error('failed to save document for group', group);
            return false;
        } else {
            Log.info('group document updated', group);
        }

        //
        //  3. broadcast bulletin document
        //
        return this.broadcastGroupDocument(bulletin);
    };

    /**
     *  Broadcast group document
     *
     * @param {Bulletin|Document} doc
     * @return {boolean}
     */
    AdminManager.prototype.broadcastGroupDocument = function (doc) {
        var delegate = this.getDelegate();
        var barrack = this.getFacebook();
        var transceiver = this.getMessenger();

        //
        //  0. get current user
        //
        var user = !barrack ? null : barrack.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return false;
        }
        var me = user.getIdentifier();

        //
        //  1. create 'document' command, and send to current station
        //
        var group = doc.getIdentifier();
        var meta = !barrack ? null : barrack.getMeta(group);
        var content = DocumentCommand.response(group, meta, doc);
        transceiver.sendContent(content, me, Station.ANY, 1);

        var item;  // ID
        //
        //  2. check group bots
        //
        var bots = delegate.getAssistants(group);
        if (bots && bots.length > 0) {
            // group bots exist, let them to deliver to all other members
            for (var i = 0; i < bots.length; ++i) {
                item = bots[i];
                if (item.equals(me)) {
                    Log.error('should not be a bot here', me);
                    continue;
                }
                transceiver.sendContent(content, me, item, 1);
            }
            return true;
        }

        //
        //  3. broadcast to all members
        //
        var members = delegate.getMembers(group);
        if (!members || members.length === 0) {
            Log.error('failed to get group members', group);
            return false;
        }
        for (var j = 0; j < members.length; ++j) {
            item = members[j];
            if (item.equals(me)) {
                Log.info('skip cycled message', item, group);
                continue;
            }
            transceiver.sendContent(content, me, item, 1);
        }
        return true;
    };

    //-------- namespace --------
    ns.group.AdminManager = AdminManager;

})(DIMP);
