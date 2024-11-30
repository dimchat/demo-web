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

//! require 'common/*.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Log   = ns.lnc.Log;

    var ID               = ns.protocol.ID;
    var MetaCommand      = ns.protocol.MetaCommand;
    var DocumentCommand  = ns.protocol.DocumentCommand;
    var GroupCommand     = ns.protocol.GroupCommand;

    var Station          = ns.mkm.Station;
    var FrequencyChecker = ns.utils.FrequencyChecker;

    var CommonArchivist  = ns.CommonArchivist;

    var ClientArchivist = function (db) {
        CommonArchivist.call(this, db);
        this.__documentResponses = new FrequencyChecker(ClientArchivist.RESPOND_EXPIRES);
        this.__lastActiveMembers = {};  // group ID => member ID
    };
    Class(ClientArchivist, CommonArchivist, null, {

        // Override
        queryMeta: function (identifier) {
            if (!this.isMetaQueryExpired(identifier)) {
                // query not expired yet
                return false;
            }
            var messenger = this.getMessenger();
            Log.info('querying meta', identifier);
            var content = MetaCommand.query(identifier);
            var pair = messenger.sendContent(content, null, Station.ANY, 1);
            return pair && pair[1];
        },

        // Override
        queryDocuments: function (identifier, docs) {
            if (!this.isDocumentQueryExpired(identifier)) {
                // query not expired yet
                return false;
            }
            var messenger = this.getMessenger();
            var lastTime = this.getLastDocumentTime(identifier, docs);
            Log.info('querying documents', identifier, lastTime);
            var content = DocumentCommand.query(identifier, lastTime);
            var pair = messenger.sendContent(content, null, Station.ANY, 1);
            return pair && pair[1];
        },

        // Override
        queryMembers: function (group, members) {
            if (!this.isMembersQueryExpired(group)) {
                // query not expired yet
                return false;
            }
            var facebook = this.getFacebook();
            var user = facebook.getCurrentUser();
            if (!user) {
                Log.error('failed to get current user');
                return false;
            }
            var me = user.getIdentifier();
            var lastTime = this.getLastGroupHistoryTime(group);
            Log.info('querying members for group', group, lastTime);
            // build query command for group members
            var content = GroupCommand.query(group);
            content.setDateTime('last_time', lastTime);
            var ok;
            // 1. check group bots
            ok = this.queryMembersFromAssistants(content, me, group);
            if (ok) {
                return true;
            }
            // 2. check administrators
            ok = this.queryMembersFromAdministrators(content, me, group);
            if (ok) {
                return true;
            }
            // 3. check group owner
            ok = this.queryMembersFromOwner(content, me, group);
            if (ok) {
                return true;
            }
            // all failed, try last active member;
            var pair = null;  // Pair<InstantMessage, ReliableMessage>
            var lastMember = this.__lastActiveMembers[group];
            if (lastMember) {
                Log.info('querying members from last member', lastMember, group);
                var messenger = this.getMessenger();
                pair = messenger.sendContent(content, me, lastMember, 1);
            }
            return pair && pair[1];
        }
    });

    // each respond will be expired after 10 minutes
    ClientArchivist.RESPOND_EXPIRES = 600 * 1000;  // milliseconds

    // protected
    ClientArchivist.prototype.isDocumentResponseExpired = function (identifier, force) {
        return this.__documentResponses.isExpired(identifier, null, force);
    };

    ClientArchivist.prototype.setLastActiveMember = function (group, member) {
        this.__lastActiveMembers[group] = member;
    };

    // protected
    ClientArchivist.prototype.getFacebook = function () {};
    // protected
    ClientArchivist.prototype.getMessenger = function () {};
    
    // protected
    ClientArchivist.prototype.queryMembersFromAssistants = function (content, sender, group) {
        var facebook = this.getFacebook();
        var bots = facebook.getAssistants(group);
        if (!bots || bots.length === 0) {
            return false;
        }
        var messenger = this.getMessenger();
        Log.info('querying members from bots', bots, group);
        var success = 0;
        var pair;      // Pair<InstantMessage, ReliableMessage>
        var receiver;  // ID
        for (var i = 0; i < bots.length; ++i) {
            receiver = bots[i];
            if (receiver.equals(sender)) {
                continue;
            }
            pair = messenger.sendContent(content, sender, receiver, 1);
            if (pair && pair[1]) {
                success += 1;
            }
        }
        if (success === 0) {
            // failed
            return false;
        }
        var lastMember = this.__lastActiveMembers[group];
        if (!lastMember || bots.indexOf(lastMember) >= 0) {
            // last active member is a bot??
        } else {
            Log.info('querying members from last member', lastMember, group);
            messenger.sendContent(content, sender, lastMember, 1);
        }
        return true;
    };
    
    // protected
    ClientArchivist.prototype.queryMembersFromAdministrators = function (content, sender, group) {
        var barrack = this.getFacebook();
        var admins = barrack.getAdministrators(group);
        if (!admins || admins.length === 0) {
            return false;
        }
        var messenger = this.getMessenger();
        Log.info('querying members from admins', admins, group);
        var success = 0;
        var pair;      // Pair<InstantMessage, ReliableMessage>
        var receiver;  // ID
        for (var i = 0; i < admins.length; ++i) {
            receiver = admins[i];
            if (sender.equals(receiver)) {
                continue;
            }
            pair = messenger.sendContent(content, sender, receiver, 1);
            if (!(pair && pair[1])) {
                // failed
            } else {
                success += 1;
            }
        }
        if (success <= 0) {
            // failed
            return false;
        }
        var lastMember = this.__lastActiveMembers[group];
        if (!lastMember || admins.indexOf(lastMember) >= 0) {
            // last active member is an admin, already queried
        } else {
            Log.info('querying members from last member', lastMember, group);
            messenger.sendContent(content, sender, lastMember, 1);
        }
        return true;
    };
    
    // protected
    ClientArchivist.prototype.queryMembersFromOwner = function (content, sender, group) {
        var facebook = this.getFacebook();
        var owner = facebook.getOwner(group);
        if (!owner) {
            return false;
        } else if (owner.equals(sender)) {
            return false;
        }
        var messenger = this.getMessenger();
        Log.info('querying members from owner', owner, group);
        var pair = messenger.sendContent(content, sender, owner, 1);
        if (!(pair && pair[1])) {
            // failed
            return false;
        }
        var lastMember = this.__lastActiveMembers[group];
        if (!lastMember || lastMember.equals(owner)) {
            // last active member is the owner, already queried
        } else {
            Log.info('querying members from last member', lastMember, group);
            messenger.sendContent(content, sender, lastMember, 1);
        }
        return true;
    };

    /**
     *  Send document to contact
     *      if document is updated, force to send it again.
     *      else only send once every 10 minutes.
     *
     * @param {Visa|Document} visa
     * @param {ID} receiver
     * @param {Boolean} updated
     * @return {boolean}
     */
    ClientArchivist.prototype.sendDocument = function (visa, receiver, updated) {
        var me = visa.getIdentifier();
        if (me.equals(receiver)) {
            return false;
        }
        if (!this.isDocumentResponseExpired(receiver, updated)) {
            // response not expired yet
            return false;
        }
        Log.info('push visa document', me, receiver);
        var content = DocumentCommand.response(me, null, visa);
        var messenger = this.getMessenger();
        var pair = messenger.sendContent(content, me, receiver, 1);
        return pair && pair[1];
    };

    //-------- namespace --------
    ns.ClientArchivist = ClientArchivist;

})(DIMP);
