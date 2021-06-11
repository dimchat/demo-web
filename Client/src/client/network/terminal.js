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

//! require 'namespace.js'
//! require 'delegate.js'
//! require 'server.js'

(function (ns, sdk) {
    'use strict';

    var get_facebook = function () {
        return ns.Facebook.getInstance();
    };
    var get_messenger = function () {
        return ns.Messenger.getInstance();
    };

    /**
     *  DIM Client
     */
    var Terminal = function() {
        this.__server = null; // current server
        get_messenger().setTerminal(this);
    };
    sdk.Class(Terminal, null, null);

    // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36"
    Terminal.prototype.getUserAgent = function () {
        return navigator.userAgent;
    };

    Terminal.prototype.getCurrentServer = function () {
        return this.__server;
    };

    var set_server = function (server) {
        if (this.__server) {
            if (!server || !this.__server.equals(server)) {
                this.__server.end();
            }
        }
        // if (server) {
        //     server.setDelegate(this);
        // }
        this.__server = server;
    };
    var is_new_server = function (host, port) {
        var current = this.__server
        if (current) {
            return current.getPort() !== port || current.getHost() !== host;
        } else {
            return true;
        }
    };

    Terminal.prototype.getCurrentUser = function () {
        if (this.__server) {
            return this.__server.getCurrentUser();
        } else {
            return null;
        }
    };
    // Terminal.prototype.setCurrentUser = function (user) {
    //     if (this.__server) {
    //         this.__server.setCurrentUser(user);
    //     } else {
    //         throw new Error('cannot set current user before station connected')
    //     }
    // };

    var start = function (identifier, host, port) {
        var messenger = get_messenger();
        var facebook = get_facebook();

        // TODO: config FTP server

        // connect server
        var server = this.__server;
        if (is_new_server.call(this, host, port)) {
            // disconnect old server
            set_server.call(this, null);
            // connect new server
            server = new ns.network.Server(identifier, host, port);
            server.setDataSource(facebook);
            server.setDelegate(messenger);
            server.start();
            set_server.call(this, server);
        }

        // get user from database and login
        var user = facebook.getCurrentUser();
        if (user && server) {
            server.setCurrentUser(user);
            server.handshake(null);
        }
    };

    Terminal.prototype.launch = function (options) {
        var identifier = options['ID'];
        var host = options['host'];
        var port = options['port'];
        start.call(this, identifier, host, port);
    };
    Terminal.prototype.terminate = function () {
        set_server.call(this, null);
    };

    // //
    // //  StationDelegate
    // //
    // Terminal.prototype.onReceivePackage = function (data, server) {
    //     if (!data || data.length === 0) {
    //         return;
    //     }
    //     var response = get_messenger().processPackage(data);
    //     if (response) {
    //         server.send(response);
    //     }
    // };
    // Terminal.prototype.didSendPackage = function (data, server) {
    //     // TODO: mark it sent
    // };
    // Terminal.prototype.didFailToSendPackage = function (error, data, server) {
    //     // TODO: resend it
    // };
    // Terminal.prototype.onHandshakeAccepted = function (session, server) {
    //     var messenger = get_messenger();
    //     var facebook = get_facebook();
    //     var user = facebook.getCurrentUser();
    //     // post current profile to station
    //     var profile = user.getProfile();
    //     if (profile) {
    //         messenger.postProfile(profile);
    //     }
    //     // post contacts(encrypted) to station
    //     var contacts = user.getContacts();
    //     if (contacts != null && contacts.length > 0) {
    //         messenger.postContacts(contacts);
    //     }
    //     // broadcast login command
    //     var login = new LoginCommand(user.identifier);
    //     login.setAgent(this.getUserAgent());
    //     login.setStation(server);
    //     // TODO: set provider
    //     messenger.broadcastContent(login);
    // };

    //-------- namespace --------
    ns.network.Terminal = Terminal;

    ns.registers('Terminal');

})(SECHAT, DIMSDK);

(function (ns, sdk) {
    'use strict';

    var Observer = sdk.lnc.Observer;
    var Terminal = ns.network.Terminal;

    var Client = function () {
        Terminal.call(this);
    };
    sdk.Class(Client, Terminal, [Observer]);

    Client.prototype.onReceiveNotification = function(notification) {
        console.log('received notification: ', notification);
    };

    var s_client = null;
    Client.getInstance = function () {
        if (!s_client) {
            s_client = new Client();
        }
        return s_client;
    };

    //-------- namespace --------
    ns.network.Client = Client;

    ns.network.registers('Client');

})(SECHAT, DIMSDK);
