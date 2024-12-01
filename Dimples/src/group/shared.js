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

    var Class  = ns.type.Class;
    var Arrays = ns.type.Arrays;
    var ID     = ns.protocol.ID;
    var Group  = ns.mkm.Group;

    var SharedGroupManager = function () {
        Object.call(this);
        this.__barrack = null;      // CommonFacebook
        this.__transceiver = null;  // CommonMessenger
        // delegates
        this.__delegate = null;     // GroupDelegate
        this.__manager = null;      // GroupManager
        this.__admin_man = null;    // AdminManager
        this.__emitter = null;      // GroupEmitter
    };
    Class(SharedGroupManager, Object, [Group.DataSource], null);

    SharedGroupManager.prototype.getFacebook = function () {
        return this.__barrack;
    };
    SharedGroupManager.prototype.getMessenger = function () {
        return this.__transceiver;
    };

    SharedGroupManager.prototype.setFacebook = function (facebook) {
        this.__barrack = facebook;
        clearDelegates.call(this);
    };
    SharedGroupManager.prototype.setMessenger = function (messenger) {
        this.__transceiver = messenger;
        clearDelegates.call(this);
    };
    var clearDelegates = function () {
        this.__delegate = null;
        this.__manager = null;
        this.__admin_man = null;
        this.__emitter = null;
    };

    SharedGroupManager.prototype.getGroupDelegate = function () {
        var delegate = this.__delegate;
        if (!delegate) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (facebook && messenger) {
                delegate = new ns.group.GroupDelegate(facebook, messenger)
                this.__delegate = delegate;
            }
        }
        return delegate;
    };
    SharedGroupManager.prototype.getGroupManager = function () {
        var man = this.__manager;
        if (!man) {
            var delegate = this.getGroupDelegate();
            if (delegate) {
                man = new ns.group.GroupManager(delegate);
                this.__manager = man;
            }
        }
        return man;
    };
    SharedGroupManager.prototype.getAdminManager = function () {
        var man = this.__admin_man;
        if (!man) {
            var delegate = this.getGroupDelegate();
            if (delegate) {
                man = new ns.group.AdminManager(delegate);
                this.__admin_man = man;
            }
        }
        return man;
    };
    SharedGroupManager.prototype.getGroupEmitter = function () {
        var emitter = this.__emitter;
        if (!emitter) {
            var delegate = this.getGroupDelegate();
            if (delegate) {
                emitter = new ns.group.GroupEmitter(delegate);
                this.__emitter = emitter;
            }
        }
        return emitter;
    };

    SharedGroupManager.prototype.buildGroupName = function (members) {
        var delegate = this.getGroupDelegate();
        return delegate.buildGroupName(members);
    };

    //
    //  Entity DataSource
    //

    // Override
    SharedGroupManager.prototype.getMeta = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getMeta(group);
    };

    // Override
    SharedGroupManager.prototype.getDocuments = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getDocuments(group);
    };

    // Override
    SharedGroupManager.prototype.getBulletin = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getBulletin(group);
    };

    //
    //  Group DataSource
    //

    // Override
    SharedGroupManager.prototype.getFounder = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getFounder(group);
    };

    // Override
    SharedGroupManager.prototype.getOwner = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getOwner(group);
    };

    // Override
    SharedGroupManager.prototype.getAssistants = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getAssistants(group);
    };

    // Override
    SharedGroupManager.prototype.getMembers = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getMembers(group);
    };

    SharedGroupManager.prototype.getAdministrators = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getAdministrators(group);
    };

    SharedGroupManager.prototype.isOwner = function (user, group) {
        var delegate = this.getGroupDelegate();
        return delegate.isOwner(user, group);
    };

    SharedGroupManager.prototype.broadcastGroupDocument = function (doc) {
        var delegate = this.getGroupDelegate();
        return delegate.broadcastGroupDocument(doc);
    };

    //
    //  Group Manage
    //

    /**
     *  Create new group with members
     *
     * @param {ID[]} members
     * @return {ID}
     */
    SharedGroupManager.prototype.createGroup = function (members) {
        var delegate = this.getGroupManager();
        return delegate.createGroup(members);
    };

    /**
     *  Update 'administrators' in bulletin document
     *
     * @param {ID[]} newAdmins - new administrator ID list
     * @param {ID} group
     * @return {boolean} true on success
     */
    SharedGroupManager.prototype.updateAdministrators = function (newAdmins, group) {
        var delegate = this.getAdminManager();
        return delegate.updateAdministrators(newAdmins, group);
    };

    /**
     *  Reset group members
     *
     * @param {ID[]} newMembers - new member ID list
     * @param {ID} group
     * @return {boolean} true on success
     */
    SharedGroupManager.prototype.resetGroupMembers = function (newMembers, group) {
        var delegate = this.getGroupManager();
        return delegate.resetMembers(group, newMembers);
    };

    /**
     *  Expel members from this group
     *
     * @param {ID[]} expelMembers - members to be removed
     * @param {ID} group
     * @return {boolean} true on success
     */
    SharedGroupManager.prototype.expelGroupMembers = function (expelMembers, group) {
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            return false;
        }
        var delegate = this.getGroupDelegate();
        var me = user.getIdentifier();
        var oldMembers = delegate.getMembers(group);

        var isOwner = delegate.isOwner(me, group);
        var isAdmin = delegate.isAdministrator(me, group);

        // 0. check permission
        var canReset = isOwner || isAdmin;
        if (canReset) {
            // You are the owner/admin, then
            // remove the members and 'reset' the group
            var members = oldMembers.slice();
            var item;
            for (var i = 0; i < expelMembers.length; ++i) {
                item = expelMembers[i];
                Arrays.remove(members, item);
            }
            return this.resetGroupMembers(members, group);
        }

        // not an admin/owner
        throw new Error('Cannot expel members from group: ' + group.toString());
    };

    /**
     *  Invite new members to this group
     *
     * @param {ID[]} newMembers - new member ID list to be added
     * @param {ID} group
     * @return {boolean} true on success
     */
    SharedGroupManager.prototype.inviteGroupMembers = function (newMembers, group) {
        var delegate = this.getGroupManager();
        return delegate.inviteMembers(group, newMembers);
    };

    /**
     *  Quit from this group
     *
     * @param {ID} group
     * @return {boolean} true on success
     */
    SharedGroupManager.prototype.quitGroup = function (group) {
        var delegate = this.getGroupManager();
        return delegate.quitGroup(group);
    };

    //
    //  Sending group message
    //

    /**
     *  Send group message content
     *
     * @param {InstantMessage|Mapper} iMsg
     * @param {int} priority
     * @return {ReliableMessage}
     */
    SharedGroupManager.prototype.sendInstantMessage = function (iMsg, priority) {
        if (!priority) {
            priority = 0;
        }
        iMsg.setValue('GF', true);  // group flag for notification
        var delegate = this.getGroupEmitter();
        return delegate.sendInstantMessage(iMsg, priority);
    };

    //-------- namespace --------
    ns.group.SharedGroupManager = new SharedGroupManager();

})(DIMP);
