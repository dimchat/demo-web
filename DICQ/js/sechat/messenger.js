;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2023 Albert Moky
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

//!require 'compatible.js'

(function (ns, sdk) {
    'use strict';

    var Interface = sdk.type.Interface;
    var Class = sdk.type.Class;
    var ID = sdk.protocol.ID;
    var Command = sdk.protocol.Command;
    var DocumentCommand = sdk.protocol.DocumentCommand;
    var ClientMessenger = sdk.ClientMessenger;
    var Compatible = ns.Compatible;

    var SharedMessenger = function (session, facebook, db) {
        ClientMessenger.call(this, session, facebook, db);
    };
    Class(SharedMessenger, ClientMessenger, null, {

        // Override
        serializeContent: function (content, password, iMsg) {
            if (Interface.conforms(content, Command)) {
                content = Compatible.fixCommand(content);
            }
            return ClientMessenger.prototype.serializeContent.call(this, content, password, iMsg);
        },

        // Override
        deserializeContent: function (data, password, sMsg) {
            var content = ClientMessenger.prototype.deserializeContent.call(this, data, password, sMsg);
            if (content && Interface.conforms(content, Command)) {
                content = Compatible.fixCommand(content);
            }
            return content;
        },

        getCurrentUser: function () {
            return this.getFacebook().getCurrentUser();
        },
        getCurrentStation: function () {
            return this.getSession().getStation();
        },

        /**
         *  Pack and send command to station
         *
         * @param {Command} command - command sending to the neighbor station
         * @param {number} priority - task priority, smaller is faster
         * @return {boolean} true on success
         */
        sendCommand: function (command, priority) {
            var sid = this.getCurrentStation().getIdentifier();
            return send_content.call(this, sid, command, priority);
        },

        /**
         *  Pack and broadcast content to everyone
         *
         * @param {Content} content - message content
         * @return {boolean} true on success
         */
        broadcastContent: function (content) {
            var group = content.getGroup();
            if (!group || !group.isBroadcast()) {
                group = ID.EVERYONE;
                content.setGroup(group);
            }
            return send_content.call(this, group, content, 1);
        },

        broadcastVisa: function (visa) {
            var user = this.getCurrentUser();
            if (!user) {
                // TODO: save the message content in waiting queue
                throw new ReferenceError('login first')
            }
            var identifier = visa.getIdentifier();
            if (!user.getIdentifier().equals(identifier)) {
                throw new ReferenceError('visa document error: ' + visa);
            }
            var count = 0;
            // pack and send user document to every contact
            var contacts = user.getContacts();
            if (contacts && contacts.length > 0) {
                var cmd = DocumentCommand.response(identifier, null, visa);
                for (var i = 0; i < contacts.length; ++i) {
                    if (send_content.call(this, contacts[i], cmd, 1)) {
                        count += 1;
                    }
                }
            }
            return count > 0;
        },

        postDocument: function (doc, meta) {
            var identifier = doc.getIdentifier();
            var cmd = DocumentCommand.response(identifier, meta, doc);
            return this.sendCommand(cmd, 1);
        },

        postContacts: function (contacts) {
            // TODO:

            // 1. generate password

            // 2. encrypt contacts list

            // 3. encrypt key

            // 4. pack 'storage' command
        },

        queryContacts: function () {
            // TODO:
        },

        queryGroupInfo: function (group, bots) {
            // TODO:
        }
    });
    
    var send_content = function (receiver, content, priority) {
        var session = this.getSession();
        if (!session.isActive()) {
            return false;
        }
        var result = this.sendContent(null, receiver, content, priority);
        return result[1] !== null;
    };

    //-------- namespace --------
    ns.SharedMessenger = SharedMessenger;

})(SECHAT, DIMP);
