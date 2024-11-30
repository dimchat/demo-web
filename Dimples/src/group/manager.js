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
    var Arrays    = ns.type.Arrays;
    var Log       = ns.lnc.Log;

    var ID              = ns.protocol.ID;
    var MetaCommand     = ns.protocol.MetaCommand
    var DocumentCommand = ns.protocol.DocumentCommand;
    var ForwardContent  = ns.protocol.ForwardContent;
    var GroupCommand    = ns.protocol.GroupCommand;

    var Station         = ns.mkm.Station;
    var TripletsHelper  = ns.TripletsHelper;

    /**
     *  Group Manager
     *  ~~~~~~~~~~~~~
     */
    var GroupManager = function (delegate) {
        TripletsHelper.call(this, delegate);
        this.__packer = this.createPacker();
        this.__helper = this.createHelper();
        this.__builder = this.createBuilder();
    };
    Class(GroupManager, TripletsHelper, null, null);

    // protected
    GroupManager.prototype.getPacker = function () {
        return this.__packer;
    };

    // protected
    GroupManager.prototype.getHelper = function () {
        return this.__helper;
    };

    // protected
    GroupManager.prototype.getBuilder = function () {
        return this.__builder;
    };

    /// override for customized packer
    GroupManager.prototype.createPacker = function () {
        var delegate = this.getDelegate();
        return new ns.group.GroupPacker(delegate)
    };

    /// override for customized helper
    GroupManager.prototype.createHelper = function () {
        var delegate = this.getDelegate();
        return new ns.group.GroupCommandHelper(delegate)
    };

    /// override for customized builder
    GroupManager.prototype.createBuilder = function () {
        var delegate = this.getDelegate();
        return new ns.group.GroupHistoryBuilder(delegate)
    };

    /**
     *  Create new group with members
     *  (broadcast document & members to all members and neighbor station)
     *
     * @param {ID[]} members - initial group members
     * @return {ID} new group ID
     */
    GroupManager.prototype.createGroup = function (members) {
        var facebook = this.getFacebook();
        //
        //  0. get current user
        //
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return null;
        }
        var founder = user.getIdentifier();

        //
        //  1. check founder (owner)
        //
        var pos = members.indexOf(founder);
        if (pos < 0) {
            // put me in the first position
            members.unshift(founder);
        } else if (pos > 0) {
            // move me to the front
            members.splice(pos, 1);
            members.unshift(founder);
        }

        var delegate = this.getDelegate();
        var database = this.getDatabase();

        var groupName = delegate.buildGroupName(members);
        //
        //  2. create group with name
        //
        var register = new ns.Register(database);
        var group = register.createGroup(founder, groupName);
        Log.info('new group with founder', group, founder);

        //
        //  3. upload meta+document to neighbor station(s)
        //  DISCUSS: should we let the neighbor stations know the group info?
        //
        var meta = delegate.getMeta(group);
        var doc = delegate.getBulletin(group);
        var content;  // Command
        if (doc) {
            content = DocumentCommand.response(group, meta, doc);
        } else if (meta) {
            content = MetaCommand.response(group, meta);
        } else {
            Log.error('failed to get group info', groupName);
            return null;
        }
        var ok = sendCommand.call(this, content, Station.ANY);  // to neighbor(s)
        if (!ok) {
            Log.error('failed to upload meta/document to neighbor station');
        }

        //
        //  4. create & broadcast 'reset' group command with new members
        //
        if (this.resetMembers(group, members)) {
            Log.info('created group with members', group, members.length);
        } else {
            Log.error('failed to create group with members', group, members.length);
        }

        return group;
    };

    // DISCUSS: should we let the neighbor stations know the group info?
    //      (A) if we do this, it can provide a convenience that,
    //          when someone receive a message from an unknown group,
    //          it can query the group info from the neighbor immediately;
    //          and its potential risk is that anyone not in the group can also
    //          know the group info (only the group ID, name, and admins, ...)
    //      (B) but, if we don't let the station knows it,
    //          then we must shared the group info with our members themselves;
    //          and if none of them is online, you cannot get the newest info
    //          immediately until someone online again.

    /**
     *  Reset group members
     *  (broadcast new group history to all members)
     *
     * @param {ID} group        - group ID
     * @param {ID[]} newMembers - new member list
     * @return {boolean} false on error
     */
    GroupManager.prototype.resetMembers = function (group, newMembers) {
        var delegate = this.getDelegate();
        var facebook = this.getFacebook();
        //
        //  0. get current user
        //
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return false;
        }
        var me = user.getIdentifier();

        // check member list
        var first = newMembers[0];
        var ok = delegate.isOwner(first, group);
        if (!ok) {
            Log.error('group owner must be the first member', first, group);
            return false;
        }
        // member list OK, check expelled members
        var oldMembers = delegate.getMembers(group);
        var expelList = [];  // List<ID>
        var item;            // ID
        for (var i = 0; i < oldMembers.length; ++i) {
            item = oldMembers[i];
            if (newMembers.indexOf(item) < 0) {
                expelList.push(item);
            }
        }

        //
        //  1. check permission
        //
        var isOwner = me.equals(first);
        var isAdmin = delegate.isAdministrator(me, group);
        // var isBot = delegate.isAssistant(me, group);
        var canReset = isOwner || isAdmin;
        if (!canReset) {
            Log.error('cannot reset members', group);
            return false;
        }
        // only the owner or admin can reset group members

        //
        //  2. build 'reset' command
        //
        var builder = this.getBuilder();
        var pair = builder.buildResetCommand(group, newMembers);
        var reset = pair[0];
        var rMsg = pair[1];
        if (!reset || !rMsg) {
            Log.error('failed to build "reset" command', group);
            return false;
        }

        //
        //  3. save 'reset' command, and update new members
        //
        var helper = this.getHelper();
        if (!helper.saveGroupHistory(reset, rMsg, group)) {
            Log.error('failed to save "reset" command', group);
            return false;
        } else if (!delegate.saveMembers(newMembers, group)) {
            Log.error('failed to update members', group);
            return false;
        } else {
            Log.info('group members updated', group, newMembers.length);
        }

        //
        //  4. forward all group history
        //
        var messages = builder.buildGroupHistories(group);
        var forward = ForwardContent.create(messages);

        var bots = delegate.getAssistants(group);
        if (bots && bots.length > 0) {
            // let the group bots know the newest member ID list,
            // so they can split group message correctly for us.
            return sendCommand.call(this, forward, bots);      // to all assistants
        } else {
            // group bots not exist,
            // send the command to all members
            sendCommand.call(this, forward, newMembers);       // to new members
            sendCommand.call(this, forward, expelList);        // to removed members
        }

        return true;
    };

    /**
     *  Invite new members to this group
     *
     * @param {ID} group        - group ID
     * @param {ID[]} newMembers - inviting member list
     * @return {boolean} false on error
     */
    GroupManager.prototype.inviteMembers = function (group, newMembers) {
        var facebook = this.getFacebook();
        var delegate = this.getDelegate();
        //
        //  0. get current user
        //
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            // Log.error('failed to get current user');
            return false;
        }
        var me = user.getIdentifier();

        var oldMembers = delegate.getMembers(group);

        var isOwner = delegate.isOwner(me, group);
        var isAdmin = delegate.isAdministrator(me, group);
        var isMember = delegate.isMember(me, group);

        //
        //  1. check permission
        //
        var canReset = isOwner || isAdmin;
        if (canReset) {
            // You are the owner/admin, then
            // append new members and 'reset' the group
            var members = oldMembers.slice();
            var item;
            for (var i = 0; i < newMembers.length; ++i) {
                item = newMembers[i];
                if (members.indexOf(item) < 0) {
                    members.push(item);
                }
            }
            return this.resetMembers(group, members);
        } else if (!isMember) {
            Log.error('cannot invite member', group);
            return false;
        }
        // invited by ordinary member
        var packer = this.getPacker();
        var helper = this.getHelper();
        var builder = this.getBuilder();

        //
        //  2. build 'invite' command
        //
        var invite = GroupCommand.invite(group, newMembers);
        var rMsg = packer.packMessage(invite, me);
        if (!rMsg) {
            Log.error('failed to build "invite" command', group);
            return false;
        } else if (!helper.saveGroupHistory(invite, rMsg, group)) {
            Log.error('failed to save "invite" command', group);
            return false;
        }
        var forward = ForwardContent.create(rMsg);

        //
        //  3. forward group command(s)
        //
        var bots = delegate.getAssistants(group);
        if (bots && bots.length > 0) {
            // let the group bots know the newest member ID list,
            // so they can split group message correctly for us.
            return sendCommand.call(this, forward, bots);      // to all assistants
        }

        // forward 'invite' to old members
        sendCommand.call(this, forward, oldMembers);         // to old members

        // forward all group history to new members
        var messages = builder.buildGroupHistories(group);
        forward = ForwardContent.create(messages);

        // TODO: remove that members already exist before sending?
        sendCommand.call(this, forward, newMembers);         // to new members
        return true;
    };

    /**
     *  Quit from this group
     *  (broadcast a 'quit' command to all members)
     *
     * @param {ID} group - group ID
     * @return {boolean} false on error
     */
    GroupManager.prototype.quitGroup = function (group) {
        var delegate = this.getDelegate();
        var facebook = this.getFacebook();
        //
        //  0. get current user
        //
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return false;
        }
        var me = user.getIdentifier();

        var members = delegate.getMembers(group);

        var isOwner = delegate.isOwner(me, group);
        var isAdmin = delegate.isAdministrator(me, group);
        // var isBot = delegate.isAssistant(me, group);
        var isMember = members.indexOf(me) >= 0;

        //
        //  1. check permission
        //
        if (isOwner) {
            Log.error('owner cannot quit from group', group);
            return false;
        } else if (isAdmin) {
            Log.error('administrator cannot quit from group', group);
            return false;
        }

        //
        //  2. update local storage
        //
        if (isMember) {
            Log.warning('quitting group', group);
            members = members.slice();
            Arrays.remove(members, me);
            var ok = delegate.saveMembers(members, group);
            if (!ok) {
                Log.error('failed to save members', group);
            }
        } else {
            Log.warning('member not in group', group);
        }

        //
        //  3. build 'quit' command
        //
        var packer = this.getPacker();
        var content = GroupCommand.quit(group);
        var rMsg = packer.packMessage(content, me);
        if (!rMsg) {
            Log.error('failed to pack group message', group);
            return false;
        }
        var forward = ForwardContent.create(rMsg);

        //
        //  4. forward 'quit' command
        //
        var bots = delegate.getAssistants(group);
        if (bots && bots.length > 0) {
            // let the group bots know the newest member ID list,
            // so they can split group message correctly for us.
            return sendCommand.call(this, forward, bots);      // to group bots
        } else {
            // group bots not exist,
            // send the command to all members directly
            return sendCommand.call(this, forward, members);   // to all members
        }
    };
    
    var sendCommand = function (content, receiver) {
        var members;  // List<ID>
        if (Interface.conforms(receiver, ID)) {
            members = [receiver];
        } else if (receiver instanceof Array && receiver.length > 0) {
            members = receiver;
        } else {
            Log.error('failed to send command', receiver);
            return false;
        }
        // 1. get sender
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return false;
        }
        var me = user.getIdentifier();
        // 2. send to all receivers
        var transceiver = this.getMessenger();
        for (var i = 0; i < members.length; ++i) {
            receiver = members[i];
            if (me.equals(receiver)) {
                Log.info('skip cycled message', receiver);
                continue;
            }
            transceiver.sendContent(content, me, receiver, 1);
        }
        return true;
    };

    //-------- namespace --------
    ns.group.GroupManager = GroupManager;

})(DIMP);
