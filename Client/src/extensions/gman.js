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

//! require <dimp.js>
//! require 'facebook.js'
//! require 'messenger.js'

!function (ns) {
    'use strict';

    var MetaCommand = ns.protocol.MetaCommand;
    var ProfileCommand = ns.protocol.ProfileCommand;
    var GroupCommand = ns.protocol.GroupCommand;

    var Facebook = ns.Facebook;
    var Messenger = ns.Messenger;

    /**
     *  This is for sending group message, or managing group members
     */
    var GroupManager = function (group) {
        this.group = group;
    };

    /**
     *  Send message content to this group
     *  (only existed member can do this)
     *
     * @param {Content|*} content - message content
     * @return {boolean} true on success
     */
    GroupManager.prototype.send = function (content) {
        var messenger = Messenger.getInstance();
        var facebook = Facebook.getInstance();
        // check group ID
        var gid = content.getGroup();
        if (gid) {
            if (!this.group.equals(gid)) {
                throw Error('group ID not match: ' + this.group + ', ' + gid);
            }
        } else {
            content.setGroup(this.group);
        }
        // check members
        var members = facebook.getMembers(this.group);
        if (!members || members.length === 0) {
            // get group assistant
            var assistants = facebook.getAssistants(this.group);
            if (!assistants || assistants.length === 0) {
                throw Error('failed to get assistants for group: ' + this.group);
            }
            // querying assistants for group info
            messenger.queryGroupInfo(this.group, assistants);
            return false;
        }
        // let group assistant to split and deliver this message to all members
        return messenger.sendContent(content, this.group, null);
    };

    var send_group_command = function (content, members) {
        var messenger = Messenger.getInstance();
        var ok = true;
        for (var i = 0; i < members.length; ++i) {
            if (!messenger.sendContent(content, members[i], null)) {
                ok = false;
            }
        }
        return ok;
    };

    /**
     *  Invite new members to this group
     *  (only existed member/assistant can do this)
     *
     * @param {ID[]} newMembers - new members ID list
     * @returns {boolean} true on success
     */
    GroupManager.prototype.invite = function (newMembers) {
        var facebook = Facebook.getInstance();

        var owner = facebook.getOwner(this.group);
        var assistants = facebook.getAssistants(this.group);
        var members = facebook.getMembers(this.group);

        var cmd;

        // 0. send 'meta/profile' command to new members
        var meta = facebook.getMeta(this.group);
        var profile = facebook.getProfile(this.group);
        if (profile) {
            var data = profile.getValue("data");
            if (!data || data.length === 0) {
                // empty profile
                profile = null;
            }
        }
        if (profile) {
            cmd = ProfileCommand.response(this.group, profile, meta);
        } else {
            cmd = MetaCommand.response(this.group, meta);
        }
        send_group_command(cmd, newMembers);

        // 1. send 'invite' command with new members to existed members
        cmd = GroupCommand.invite(this.group, newMembers);
        send_group_command(cmd, members); // send to existed members
        send_group_command(cmd, assistants); // send to assistants
        if (owner && members.indexOf(owner) < 0) {
            send_group_command(cmd, [owner]); // send to owner
        }

        // 2. update local storage
        this.addMembers(newMembers);

        // 3. send 'invite' with all members command to new members
        members = facebook.getMembers(this.group);
        cmd = GroupCommand.invite(this.group, members);
        send_group_command(cmd, newMembers);
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
        var facebook = Facebook.getInstance();

        var owner = facebook.getOwner(this.group);
        var assistants = facebook.getAssistants(this.group);
        var members = facebook.getMembers(this.group);

        var cmd;
        var i;

        // 0. check members list
        for (i = 0; i < assistants.length; ++i) {
            if (outMembers.indexOf(assistants[i]) >= 0) {
                throw Error('Cannot expel group assistant: ' + assistants[i]);
            }
        }
        if (outMembers.indexOf(owner) >= 0) {
            throw Error('Cannot expel group owner: ' + assistants[i]);
        }

        // 1. send 'expel' command to all members
        cmd = GroupCommand.expel(this.group, outMembers);
        send_group_command(cmd, members); // send to existed members
        send_group_command(cmd, assistants); // send to assistants
        if (owner && members.indexOf(owner) < 0) {
            send_group_command(cmd, [owner]); // send to owner
        }

        // 2. update local storage
        return this.removeMembers(outMembers);
    };

    /**
     *  Quit from this group
     *  (only group member can do this)
     *
     * @param {ID|*} me - my ID
     * @return {boolean} true on success
     */
    GroupManager.prototype.quit = function (me) {
        var facebook = Facebook.getInstance();

        var owner = facebook.getOwner(this.group);
        var assistants = facebook.getAssistants(this.group);
        var members = facebook.getMembers(this.group);

        var cmd;
        var i;

        // 0. check members list
        for (i = 0; i < assistants.length; ++i) {
            if (me.equals(assistants[i]) >= 0) {
                throw Error('Group assistant cannot quit: ' + assistants[i]);
            }
        }
        if (me.equals(owner) >= 0) {
            throw Error('Group owner cannot quit: ' + assistants[i]);
        }

        // 1. send 'quit' command to all members
        cmd = GroupCommand.quit(this.group);
        send_group_command(cmd, members); // send to existed members
        send_group_command(cmd, assistants); // send to assistants
        if (owner && members.indexOf(owner) < 0) {
            send_group_command(cmd, [owner]); // send to owner
        }

        // 2. update local storage
        return this.removeMember(me);
    };

    //
    //  Local Storage
    //

    GroupManager.prototype.addMembers = function (newMembers) {
        var facebook = Facebook.getInstance();
        var members = facebook.getMembers(this.group);
        var count = 0;
        var member;
        for (var i = 0; i < newMembers.length; ++i) {
            member = newMembers[i];
            if (members.indexOf(member) >= 0) {
                // member exists
                continue;
            }
            members.push(member);
            ++count;
        }
        if (count === 0) {
            return false;
        }
        return facebook.saveMembers(members, this.group);
    };
    GroupManager.prototype.removeMembers = function (outMembers) {
        var facebook = Facebook.getInstance();
        var members = facebook.getMembers(this.group);
        var count = 0;
        var member;
        for (var i = 0; i < outMembers.length; ++i) {
            member = outMembers[i];
            if (members.indexOf(member) < 0) {
                // member not exists
                continue;
            }
            members.push(member);
            ++count;
        }
        if (count === 0) {
            return false;
        }
        return facebook.saveMembers(members, this.group);
    };

    GroupManager.prototype.addMember = function (member) {
        var facebook = Facebook.getInstance();
        return facebook.addMember(member, this.group);
    };
    GroupManager.prototype.removeMember = function (member) {
        var facebook = Facebook.getInstance();
        return facebook.removeMember(member, this.group);
    };

    //-------- namespace --------
    if (typeof ns.extensions !== 'object') {
        ns.extensions = {}
    }
    ns.extensions.GroupManager = GroupManager;

}(DIMP);
