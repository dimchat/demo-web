;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2020 Albert Moky
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

    var MetaCommand = sdk.protocol.MetaCommand;
    var DocumentCommand = sdk.protocol.DocumentCommand;
    var GroupCommand = sdk.protocol.GroupCommand;

    var get_messenger = function () {
        return ns.Messenger.getInstance();
    };
    var get_facebook = function () {
        return ns.Facebook.getInstance();
    };

    // send command to current station
    var send_command = function (cmd) {
        get_messenger().sendCommand(cmd, 0);
    };
    // send command to group member(s)
    var send_group_command = function (cmd, receiver) {
        var members;
        if (receiver instanceof Array) {
            members = receiver;
        } else {
            members = [receiver];
        }
        var messenger = get_messenger();
        var facebook = get_messenger();
        var user = facebook.getCurrentUser();
        var sender = user.identifier;
        for (var i = 0; i < members.length; ++i) {
            messenger.sendContent(sender, members[i], cmd, null, 0);
        }
    };

    /**
     *  This is for sending group message, or managing group members
     */
    var GroupManager = function (group) {
        this.__group = group;
    };

    /**
     *  Send message content to this group
     *  (only existed member can do this)
     *
     * @param {Content|*} content - message content
     * @return {boolean} true on success
     */
    GroupManager.prototype.send = function (content) {
        // check group ID
        var gid = content.getGroup();
        if (gid) {
            if (!this.__group.equals(gid)) {
                throw new Error('group ID not match: ' + this.__group + ', ' + gid);
            }
        } else {
            content.setGroup(this.__group);
        }
        // check members
        var facebook = get_facebook();
        var members = facebook.getMembers(this.__group);
        if (!members || members.length === 0) {
            // get group assistant
            var assistants = facebook.getAssistants(this.__group);
            if (!assistants || assistants.length === 0) {
                throw new Error('failed to get assistants for group: ' + this.__group);
            }
            // querying assistants for group info
            get_messenger().queryGroupInfo(this.__group, assistants);
            return false;
        }
        // let group assistant to split and deliver this message to all members
        return get_messenger().sendContent(null, this.__group, content, null, 0);
    };

    /**
     *  Invite new members to this group
     *  (only existed member/assistant can do this)
     *
     * @param {ID[]} newMembers - new members ID list
     * @returns {boolean} true on success
     */
    GroupManager.prototype.invite = function (newMembers) {
        var facebook = get_facebook();
        var group = this.__group;
        var bots = facebook.getAssistants(group);
        var members = facebook.getMembers(group);
        if (!members) {
            members = [];
        }
        var count = members.length;

        // 0. build 'meta/document' command
        var meta = facebook.getMeta(group);
        if (!meta) {
            throw new ReferenceError('failed to get meta for group: ' + group.toString());
        }
        var cmd;
        var doc = facebook.getDocument(group, '*');
        if (doc) {
            cmd = DocumentCommand.response(group, meta, doc);
        } else {
            cmd = MetaCommand.response(group, meta);
        }

        if (count <= 2) {  // new group?
            // 1. send 'meta/document' to station and bots
            send_command(cmd);                    // to current station
            send_group_command(cmd, bots);        // to group assistants
            // 2. update local storage
            members = addMembers(newMembers, group);
            send_group_command(cmd, members);     // to all members
            // 3. send 'invite' command with all members to all members
            cmd = GroupCommand.invite(group, members);
            send_group_command(cmd, bots);        // to group assistants
            send_group_command(cmd, members);     // to all members
        } else {
            // 1. send 'meta/document' to station, bots and all members
            send_command(cmd);                    // to current station
            send_group_command(cmd, bots);        // to group assistants
            //send_group_command(cmd, members);     // to old members
            send_group_command(cmd, newMembers);  // to new members
            // 2. send 'invite' command with new members to old members
            cmd = GroupCommand.invite(group, newMembers);
            send_group_command(cmd, bots);        // to group assistants
            send_group_command(cmd, members);     // to old members
            // 3. update local storage
            members = addMembers(newMembers, group);
            // 4. send 'invite' command with all members to new members
            cmd = GroupCommand.invite(group, members);
            send_group_command(cmd, newMembers);  // to new members
        }
        return true;
    };

    /**
     *  Expel members from this group
     *  (only group owner/assistant can do this)
     *
     * @param {ID[]} outMembers - existed member ID list
     * @returns {boolean} true on success
     */
    GroupManager.prototype.expel = function (outMembers) {
        var facebook = get_facebook();
        var group = this.__group;
        var owner = facebook.getOwner(group);
        var bots = facebook.getAssistants(group);
        var members = facebook.getMembers(group);
        if (!members) {
            members = [];
        }

        // 0. check members list
        var i;
        for (i = 0; i < bots.length; ++i) {
            if (outMembers.indexOf(bots[i]) >= 0) {
                throw new Error('Cannot expel group assistant: ' + bots[i]);
            }
        }
        if (outMembers.indexOf(owner) >= 0) {
            throw new Error('Cannot expel group owner: ' + bots[i]);
        }

        // 1. send 'expel' command to all members
        var cmd = GroupCommand.expel(group, outMembers);
        send_group_command(cmd, bots);       // to group assistants
        send_group_command(cmd, members);    // to existed members
        if (owner && members.indexOf(owner) < 0) {
            send_group_command(cmd, owner);  // to owner
        }

        // 2. update local storage
        return removeMembers(outMembers, group);
    };

    /**
     *  Quit from this group
     *  (only group member can do this)
     *
     * @return {boolean} true on success
     */
    GroupManager.prototype.quit = function () {
        var facebook = get_facebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw new ReferenceError('failed to get current user');
        }

        var group = this.__group;
        var owner = facebook.getOwner(group);
        var bots = facebook.getAssistants(group);
        var members = facebook.getMembers(group);
        if (!members) {
            members = [];
        }

        // 0. check members
        if (bots.indexOf(user.identifier) >= 0) {
            throw new Error('Group assistant cannot quit: ' + user.identifier);
        }
        if (user.identifier.equals(owner)) {
            throw new Error('Group owner cannot quit: ' + user.identifier);
        }

        // 1. send 'quit' command to all members
        var cmd = GroupCommand.quit(group);
        send_group_command(cmd, bots);       // to group assistants
        send_group_command(cmd, members);    // to existed members
        if (owner && members.indexOf(owner) < 0) {
            send_group_command(cmd, owner);  // to owner
        }

        // 2. update local storage
        return facebook.removeGroup(group);
    };

    //
    //  Local Storage
    //
    var addMembers = function (newMembers, group) {
        var facebook = get_facebook();
        var members = facebook.getMembers(group);
        var count = 0;
        var member;
        for (var i = 0; i < newMembers.length; ++i) {
            member = newMembers[i];
            if (members.indexOf(member) < 0) {
                members.push(member);
                ++count;
            }
        }
        return count > 0 && facebook.saveMembers(members, group);
    };
    var removeMembers = function (outMembers, group) {
        var facebook = get_facebook();
        var members = facebook.getMembers(group);
        var count = 0;
        var pos;
        for (var i = 0; i < outMembers.length; ++i) {
            pos = members.indexOf(outMembers[i]);
            if (pos >= 0) {
                members.splice(pos, 1);
                ++count;
            }
        }
        return count > 0 && facebook.saveMembers(members, group);
    };

    //-------- namespace --------
    ns.GroupManager = GroupManager;

    ns.registers('GroupManager');

})(SECHAT, DIMSDK);
