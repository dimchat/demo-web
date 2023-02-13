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

    var SymmetricKey = sdk.crypto.SymmetricKey;
    var ID = sdk.protocol.ID;

    var MetaCommand = sdk.protocol.MetaCommand;
    var DocumentCommand = sdk.protocol.DocumentCommand;
    var LoginCommand = sdk.protocol.LoginCommand;
    var StorageCommand = sdk.protocol.StorageCommand;
    var QueryCommand = sdk.protocol.group.QueryCommand;

    var ReportCommand = ns.protocol.ReportCommand;
    var SearchCommand = ns.protocol.SearchCommand;

    var CommonFacebook = ns.CommonFacebook;
    var CommonMessenger = ns.CommonMessenger;

    var ServerDelegate = ns.network.ServerDelegate;

    var ClientMessenger = function () {
        CommonMessenger.call(this);
        this.__terminal = null;
        this.__offlineTime = null;  // Date
        // last query time
        this.__metaQueryExpires = {};   // ID => int
        this.__docQueryExpires = {};    // ID => int
        this.__groupQueryExpires = {};  // ID => (ID => int)
    };
    sdk.Class(ClientMessenger, CommonMessenger, [ServerDelegate]);

    var QUERY_INTERVAL = 120 * 1000;  // query interval (2 minutes)

    ClientMessenger.prototype.getEntityDelegate = function() {
        if (!this.__barrack) {
            this.__barrack = ns.ClientFacebook.getInstance();
        }
        return this.__barrack;
    };
    ClientMessenger.prototype.getProcessor = function () {
        if (!this.__processor) {
            this.__processor = new ns.ClientProcessor(this);
        }
        return this.__processor;
    };
    ClientMessenger.prototype.getDataSource = function() {
        if (!this.__datasource) {
            this.__datasource = ns.MessageDataSource;
        }
        return this.__datasource
    };

    ClientMessenger.prototype.getTerminal = function () {
        return this.__terminal;
    };
    ClientMessenger.prototype.setTerminal = function (client) {
        this.__terminal = client;
    };

    ClientMessenger.prototype.getCurrentServer = function () {
        return this.__terminal.getCurrentServer();
    };
    ClientMessenger.prototype.getCurrentUser = function () {
        return this.__terminal.getCurrentUser();
    };

    /**
     *  Pack and send command to station
     *
     * @param {Command} cmd
     * @param {int} priority
     * @returns {boolean}
     */
    ClientMessenger.prototype.sendCommand = function (cmd, priority) {
        var server = this.getCurrentServer();
        if (!server) {
            console.error('current server not found')
            return false;
        }
        return this.sendContent(null, server.getIdentifier(), cmd, null, priority);
    };

    /**
     *  Pack and broadcast content to everyone
     *
     * @param content
     * @returns {boolean}
     */
    ClientMessenger.prototype.broadcastContent = function (content) {
        content.setGroup(ID.EVERYONE);
        return this.sendContent(null, ID.EVERYONE, content, null, 1);
    };

    /**
     *  Broadcast visa document to every contacts
     *
     * @param {Visa} doc
     * @returns {boolean}
     */
    ClientMessenger.prototype.broadcastVisa = function (doc) {
        var user = this.getCurrentUser();
        if (!user) {
            // TODO: save the message content in waiting queue
            throw new ReferenceError('login first');
        }
        var identifier = doc.getIdentifier();
        if (!user.getIdentifier().equals(identifier)) {
            throw new ReferenceError('visa document error' + doc.toMap());
        }
        doc.setValue(CommonFacebook.EXPIRES_KEY, null);
        // pack and send user document to every contact
        var contacts = user.getContacts();
        if (contacts && contacts.length > 0) {
            var cmd = DocumentCommand.response(identifier, null, doc);
            for (var i = 0; i < contacts.length; ++i) {
                this.sendContent(identifier, contacts[i], cmd, null, 1);
            }
        }
    };

    /**
     *  Post document onto current station
     *
     * @param {Document} doc
     * @param {Meta} meta
     * @returns {boolean}
     */
    ClientMessenger.prototype.postDocument = function (doc, meta) {
        doc.setValue(CommonFacebook.EXPIRES_KEY, null);
        var cmd = DocumentCommand.response(doc.getIdentifier(), meta, doc);
        return this.sendCommand(cmd, 1);
    };

    ClientMessenger.prototype.postContacts = function (contacts) {
        var facebook = this.getFacebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw new Error('login first');
        }
        // 1. generate password
        var pwd = SymmetricKey.generate(SymmetricKey.AES);
        // 2. encrypt contacts list as JSON data
        var data = sdk.format.JSON.encode(contacts);
        data = pwd.encrypt(data);
        // 3. encrypt password with user's private key
        var key = sdk.format.JSON.encode(pwd);
        key = user.encrypt(key);
        // 4. pack 'storage' command
        var cmd = new StorageCommand(StorageCommand.CONTACTS);
        cmd.setIdentifier(user.getIdentifier());
        cmd.setData(data);
        cmd.setKey(key);
        return this.sendCommand(cmd, 1);
    };

    ClientMessenger.prototype.queryContacts = function () {
        var facebook = this.getFacebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw new Error('current user not found');
        }
        var cmd = new StorageCommand(StorageCommand.CONTACTS);
        cmd.setIdentifier(user.getIdentifier());
        return this.sendCommand(cmd, 1);
    };

    ClientMessenger.prototype.queryMeta = function (identifier) {
        if (identifier.isBroadcast()) {
            // broadcast ID has no meta
            return false;
        }
        // check for duplicate querying
        var now = (new Date()).getTime();
        var expires = this.__metaQueryExpires[identifier];
        if (expires && now < expires) {
            return false;
        }
        this.__metaQueryExpires[identifier] = now + QUERY_INTERVAL;
        console.log('querying meta', identifier);
        // query from DIM network
        var cmd = new MetaCommand(identifier);
        return this.sendCommand(cmd, 1);
    };

    ClientMessenger.prototype.queryDocument = function (identifier, type) {
        if (identifier.isBroadcast()) {
            // broadcast ID has no document
            return false;
        }
        // check for duplicate querying
        var now = (new Date()).getTime();
        var expires = this.__docQueryExpires[identifier];
        if (expires && now < expires) {
            return false;
        }
        this.__docQueryExpires[identifier] = now + QUERY_INTERVAL;
        console.log('querying document', identifier, type);
        // query from DIM network
        var cmd = new DocumentCommand(identifier);
        return this.sendCommand(cmd, 1);
    };

    ClientMessenger.prototype.queryGroupInfo = function (group, member) {
        if (group.isBroadcast()) {
            // this group contains all users
            return false;
        }
        if (members.length === 0) {
            return false;
        }
        var currentUser = this.getCurrentUser();
        // check for duplicate querying
        var times = this.__groupQueryExpires[group];
        if (!times) {
            times = {};
            this.__groupQueryExpires[group] = times;
        }
        // query from members
        var members;
        if (member instanceof Array) {
            members = member
        } else {
            members = [member];
        }
        var now = new Date();
        var checking = false;
        var user;
        var expires;
        var cmd = new QueryCommand(group);
        for (var i = 0; i < members.length; ++i) {
            user = members[i];
            expires = times[user];
            if (expires && now < expires) {
                continue;
            }
            times[user] = now + QUERY_INTERVAL;
            console.log('querying group', group, user);
            if (this.sendContent(currentUser.getIdentifier(), user, cmd, null, 1)) {
                checking = true;
            }
        }
        return checking;
    };

    ClientMessenger.prototype.search = function (keywords) {
        if (keywords === SearchCommand.ONLINE_USERS) {
            return this.sendCommand(SearchCommand.search(), 0);
        } else {
            var cmd = SearchCommand.search(keywords);
            var bot = ID.parse('archivist@anywhere');
            return this.sendContent(null, bot, cmd, null, 0);
        }
    };

    ClientMessenger.prototype.reportOnline = function () {
        var user = this.getCurrentUser();
        if (!user) {
            console.error('current user not set yet')
            return;
        }
        var cmd = ReportCommand.report(ReportCommand.ONLINE);
        if (this.__offlineTime) {
            cmd.setValue('last_time', this.__offlineTime.getTime() / 1000);
        }
        this.sendCommand(cmd, 0);
    };

    ClientMessenger.prototype.reportOffline = function () {
        var user = this.getCurrentUser();
        if (!user) {
            console.error('current user not set yet')
            return;
        }
        var cmd = ReportCommand.report(ReportCommand.OFFLINE);
        this.__offlineTime = cmd.getTime();
        this.sendCommand(cmd, 0);
    };

    //
    //  ServerDelegate
    //
    ClientMessenger.prototype.onReceivePackage = function (data, server) {
        try {
            var res = this.processData(data);
            if (res && res.length > 0) {
                server.sendPackage(res, null, 1);
            }
        } catch (e) {
            console.error('failed to process data', data, e);
        }
    };

    ClientMessenger.prototype.didSendPackage = function (data, server) {
        // TODO: mark it sent
    };

    ClientMessenger.prototype.didFailToSendPackage = function (error, data, server) {
        // TODO: resend it
    };

    ClientMessenger.prototype.onHandshakeAccepted = function (session, server) {
        var user = this.getCurrentUser();
        // broadcast login command
        var login = new LoginCommand(user.getIdentifier());
        login.setAgent(this.getTerminal().getUserAgent());
        login.setStation(server);
        // TODO: set provider
        this.broadcastContent(login);
    };

    var s_messenger = null;
    ClientMessenger.getInstance = function () {
        if (!s_messenger) {
            s_messenger = new ClientMessenger();
        }
        return s_messenger;
    };

    //-------- namespace --------
    ns.ClientMessenger = ClientMessenger;

})(SECHAT, DIMSDK);
