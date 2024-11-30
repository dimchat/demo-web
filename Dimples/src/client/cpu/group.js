;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
//
//                               Written in 2020 by Moky <albert.moky@gmail.com>
//
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

//! require <dimsdk.js>

(function (ns) {
    'use strict';

    var Class = ns.type.Class;

    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;

    var HistoryCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
        this.__delegate = this.createGroupDelegate();
        this.__helper = this.createGroupHelper();
        this.__builder = this.createGroupBuilder();
    };
    Class(HistoryCommandProcessor, BaseCommandProcessor, null, {

        /// override for customized data source
        createGroupDelegate: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.group.GroupDelegate(facebook, messenger);
        },

        /// override for customized helper
        createGroupHelper: function () {
            var delegate = this.getGroupDelegate();
            return new ns.group.GroupCommandHelper(delegate);
        },

        /// override for customized builder
        createGroupBuilder: function () {
            var delegate = this.getGroupDelegate();
            return new ns.group.GroupHistoryBuilder(delegate);
        },

        // Override
        process: function (content, rMsg) {
            var text = 'Command not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'History command (name: ${command}) not support yet!',
                'replacements': {
                    'command': content.getCmd()
                }
            });
        }
    });

    //
    //  Group Delegates
    //

    // protected
    HistoryCommandProcessor.prototype.getGroupDelegate = function () {
        return this.__delegate;
    };

    // protected
    HistoryCommandProcessor.prototype.getGroupHelper = function () {
        return this.__helper;
    };

    // protected
    HistoryCommandProcessor.prototype.getGroupBuilder = function () {
        return this.__builder;
    };

    //-------- namespace --------
    ns.cpu.HistoryCommandProcessor = HistoryCommandProcessor;

})(DIMP);

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Log   = ns.lnc.Log;

    var ForwardContent = ns.protocol.ForwardContent;

    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor;

    /**
     *  Group Command Processor
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     *
     * @param {Facebook} facebook
     * @param {Messenger} messenger
     */
    var GroupCommandProcessor = function (facebook, messenger) {
        HistoryCommandProcessor.call(this, facebook, messenger);
    };
    Class(GroupCommandProcessor, HistoryCommandProcessor, null, {

        // protected
        getOwner: function (group) {
            var delegate = this.getGroupDelegate();
            return delegate.getOwner(group);
        },

        // protected
        getAssistants: function (group) {
            var delegate = this.getGroupDelegate();
            return delegate.getAssistants(group);
        },

        // protected
        getAdministrators: function (group) {
            var delegate = this.getGroupDelegate();
            return delegate.getAdministrators(group);
        },
        // protected
        saveAdministrators: function (admins, group) {
            var delegate = this.getGroupDelegate();
            return delegate.saveAdministrators(admins, group);
        },

        // protected
        getMembers: function (group) {
            var delegate = this.getGroupDelegate();
            return delegate.getMembers(group);
        },
        // protected
        saveMembers: function (members, group) {
            var delegate = this.getGroupDelegate();
            return delegate.saveMembers(members, group);
        },

        // protected
        saveGroupHistory: function (content, rMsg, group) {
            var delegate = this.getGroupHelper();
            return delegate.saveGroupHistory(content, rMsg, group);
        },

        // Override
        process: function (content, rMsg) {
            var text = 'Command not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Group command (name: ${command}) not support yet!',
                'replacements': {
                    'command': content.getCmd()
                }
            });
        },
        
        //
        //  Checking
        //

        /**
         *  Check group command
         *
         * @param {GroupCommand|Command|Content} content
         * @param {ReliableMessage|Message} rMsg
         * @return {[ID, Content[]]} group ID + error responds
         */
        // protected
        checkCommandExpired: function (content, rMsg) {
            var group = content.getGroup();
            if (!group) {
                Log.error('group command error', content);
                return [null, null];
            }
            var errors;  // List<Content>
            var expired = this.getGroupHelper().isCommandExpired(content);
            if (expired) {
                var text = 'Command expired.';
                errors = this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Group command expired: ${cmd}, group: ${ID}',
                    'replacements': {
                        'cmd': content.getCmd(),
                        'ID': group.toString()
                    }
                });
                group = null;
            } else {
                // group ID must not empty here
                errors = null;
            }
            return [group, errors];
        },

        /**
         *  Check group command members
         *
         * @param {GroupCommand|Content} content
         * @param {ReliableMessage|Message} rMsg
         * @return {[ID[], Content[]]} members + error responds
         */
        // protected
        checkCommandMembers: function (content, rMsg) {
            var group = content.getGroup();
            if (!group) {
                Log.error('group command error', content);
                return [[], null];
            }
            var errors;  // List<Content>
            var members = this.getGroupHelper().getMembersFromCommand(content);
            if (members.length === 0) {
                var text = 'Command error.';
                errors = this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Group members empty: ${ID}',
                    'replacements': {
                        'ID': group.toString()
                    }
                });
            } else {
                // normally
                errors = null;
            }
            return [members, errors];
        },

        /**
         *  Check group members
         *
         * @param {GroupCommand|Content} content
         * @param {ReliableMessage|Message} rMsg
         * @return {[ID, ID[], Content[]]} owner + members + error responds
         */
        // protected
        checkGroupMembers: function (content, rMsg) {
            var group = content.getGroup();
            if (!group) {
                Log.error('group command error', content);
                return [null, [], null];
            }
            var errors;  // List<Content>
            var owner = this.getOwner(group);
            var members = this.getMembers(group);
            if (!owner || members.length === 0) {
                // TODO: query group members?
                var text = 'Group empty.';
                errors = this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Group empty: ${ID}',
                    'replacements': {
                        'ID': group.toString()
                    }
                });
            } else {
                // normally
                errors = null;
            }
            return [owner, members, errors];
        },

        /**
         *  Send a command list with newest members to the receiver
         *
         * @param {ID} group
         * @param {ID} receiver
         * @return {boolean}
         */
        sendGroupHistories: function (group, receiver) {
            var messages = this.getGroupBuilder().buildGroupHistories(group);
            if (messages.length === 0) {
                Log.warning('failed to build history for group', group);
                return false;
            }
            var transceiver = this.getMessenger();
            var content = ForwardContent.create(messages);
            var pair = transceiver.sendContent(content, null, receiver, 1);
            return pair && pair[1];
        }
    });

    //-------- namespace --------
    ns.cpu.GroupCommandProcessor = GroupCommandProcessor;

})(DIMP);
