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
//! require 'delegate.js'

!function (ns) {
    'use strict';

    var StationDelegate = ns.network.StationDelegate;

    var LoginCommand = ns.protocol.LoginCommand;

    var Facebook = ns.Facebook;
    var Messenger = ns.Messenger;

    /**
     *  DIM Client
     */
    var Terminal = function() {
        this.__server = null; // current server
        this.__users = null;  // local users
    };
    ns.Class(Terminal, null, [StationDelegate]);

    // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36"
    Terminal.prototype.getUserAgent = function () {
        return navigator.userAgent;
    };

    Terminal.prototype.getCurrentServer = function () {
        return this.__server;
    };
    Terminal.prototype.setCurrentServer = function (server) {
        var messenger = Messenger.getInstance();
        messenger.server = server;
        messenger.setContext('server', server);
        server.stationDelegate = this;
        this.__server = server;
    };

    Terminal.prototype.getCurrentUser = function () {
        if (!this.__server) {
            return null;
        }
        return this.__server.getCurrentUser();
    };
    Terminal.prototype.setCurrentUser = function (user) {
        if (!this.__server) {
            throw Error('cannot set current user before station connected')
        }
        this.__server.setCurrentUser(user);
    };

    //
    //  StationDelegate
    //
    Terminal.prototype.onReceivePackage = function (data, server) {
        if (!data || data.length === 0) {
            return;
        }
        var messenger = Messenger.getInstance();
        var response = messenger.processPackage(data);
        if (response) {
            server.star.send(response);
        }
    };
    Terminal.prototype.didSendPackage = function (data, server) {
        // TODO: mark it sent
    };
    Terminal.prototype.didFailToSendPackage = function (error, data, server) {
        // TODO: resend it
    };
    Terminal.prototype.onHandshakeAccepted = function (session, server) {
        var messenger = Messenger.getInstance();
        var facebook = Facebook.getInstance();
        var user = facebook.getCurrentUser();
        // post current profile to station
        var profile = user.getProfile();
        if (profile) {
            messenger.postProfile(profile);
        }
        // post contacts(encrypted) to station
        var contacts = user.getContacts();
        if (contacts != null && contacts.length > 0) {
            messenger.postContacts(contacts);
        }
        // broadcast login command
        var login = new LoginCommand(user.identifier);
        login.setAgent(this.getUserAgent());
        login.setStation(server);
        // TODO: set provider
        messenger.broadcastContent(login);
    };

    //-------- namespace --------
    if (typeof ns.network !== 'object') {
        ns.network = {};
    }
    ns.network.Terminal = Terminal;

}(DIMP);
