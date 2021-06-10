;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

    var ID = sdk.protocol.ID;
    var InviteCommand = sdk.protocol.group.InviteCommand;
    var ResetCommand = sdk.protocol.group.ResetCommand;

    var MessageProcessor = sdk.MessageProcessor;

    var CommonProcessor = function (messenger) {
        MessageProcessor.call(this, messenger);
    };
    sdk.Class(CommonProcessor, MessageProcessor, null);

    CommonProcessor.prototype.getFacebook = function () {
        return this.getMessenger().getFacebook();
    };

    // check whether group info empty
    var is_empty = function (group) {
        var facebook = this.getFacebook();
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            return true;
        } else {
            return !facebook.getOwner();
        }
    };
    // check whether need to update group
    var is_waiting_group = function (content, sender) {
        // Check if it is a group message,
        // and whether the group members info needs update
        var group = content.getGroup();
        if (!group || group.isBroadcast()) {
            // 1. personal message
            // 2. broadcast message
            return false;
        }
        // check meta for new group ID
        var messenger = this.getMessenger();
        var facebook = this.getFacebook();
        var meta = facebook.getMeta(group);
        if (!meta) {
            // NOTICE: if meta for group not found,
            //         facebook should query it from DIM network automatically
            // TODO: insert the message to a temporary queue to wait meta
            //throw new NullPointerException("group meta not found: " + group);
            return true;
        }
        // query group info
        if (is_empty.call(this, group)) {
            // NOTICE: if the group info not found, and this is not an 'invite' command
            //         query group info from the sender
            if (content instanceof InviteCommand || content instanceof ResetCommand) {
                // FIXME: can we trust this stranger?
                //        may be we should keep this members list temporary,
                //        and send 'query' to the owner immediately.
                // TODO: check whether the members list is a full list,
                //       it should contain the group owner(owner)
                return false;
            } else {
                return messenger.queryGroupInfo(group, sender);
            }
        } else if (facebook.containsMember(sender, group)
            || facebook.containsAssistant(sender, group)
            || facebook.isOwner(sender, group)) {
            // normal membership
            return false;
        } else {
            var ok1 = false, ok2 = false;
            // query from group
            var owner = facebook.getOwner(group);
            if (owner) {
                ok1 = messenger.queryGroupInfo(group, owner);
            }
            // if assistants exist, query them
            var assistants = facebook.getAssistants(group);
            if (assistants && assistants.length > 0) {
                ok2 = messenger.queryGroupInfo(group, assistants);
            }
            return ok1 && ok2;
        }
    };

    CommonProcessor.prototype.processContent = function (content, rMsg) {
        var sender = rMsg.getSender();
        if (is_waiting_group.call(this, content, sender)) {
            // save this message in a queue to wait group meta response
            var group = content.getGroup();
            rMsg.setValue("waiting", group.toString());
            this.getMessenger().suspendMessage(rMsg);
            return null;
        }
        try {
            return MessageProcessor.prototype.processContent.call(this, content, rMsg);
        } catch (e) {
            var text = e.toString();
            if (text.indexOf('failed to get meta for ') >= 0) {
                var pos = text.indexOf(': ');
                if (pos > 0) {
                    var waiting = ID.parse(text.substr(pos + 2));
                    if (waiting) {
                        rMsg.setValue('waiting', waiting.toString());
                        this.getMessenger().suspendReliableMessage(rMsg);
                    } else {
                        throw new SyntaxError('failed to get ID: ' + text);
                    }
                }
            }
            return null;
        }
    };

    //-------- namespace --------
    ns.CommonProcessor = CommonProcessor;

    ns.registers('CommonProcessor');

})(SECHAT, DIMSDK);
