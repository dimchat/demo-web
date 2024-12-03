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

//!require 'database.js'
//!require 'facebook.js'
//!require 'messenger.js'
//!require 'client.js'

(function (ns, sdk) {
    'use strict';

    var shared = {
        database: null,
        archivist: null,
        facebook: null,

        session: null,
        messenger: null,

        emitter: null,

        terminal: null
    };

    var GlobalVariable = {

        getDatabase: function () {
            var database = shared.database;
            if (!database) {
                database = ns.SharedDatabase;
                shared.database = database;
            }
            return database;
        },

        getArchivist: function () {
            var archivist = shared.archivist;
            if (!archivist) {
                var database = this.getDatabase();
                archivist = new ns.SharedArchivist(database);
                shared.archivist = archivist;
            }
            return archivist;
        },

        getFacebook: function () {
            var facebook = shared.facebook;
            if (!facebook) {
                facebook = new ns.SharedFacebook();
                shared.facebook = facebook;
                // group manager
                var sgm = sdk.group.SharedGroupManager;
                sgm.setFacebook(facebook);
            }
            return facebook;
        },

        // getSession: function () {
        //     return shared.session;
        // },

        getMessenger: function () {
            var messenger = shared.messenger;
            if (!messenger) {
                var database = this.getDatabase();
                var facebook = this.getFacebook();
                var session = shared.session;
                if (session/* && facebook && database*/) {
                    messenger = new ns.SharedMessenger(session, facebook, database);
                    shared.messenger = messenger;
                    // group manager
                    var sgm = sdk.group.SharedGroupManager;
                    sgm.setMessenger(messenger);
                } else {
                    throw new ReferenceError('session not connected');
                }
            }
            return messenger;
        },

        getEmitter: function () {
            var emitter = shared.emitter;
            if (!emitter) {
                emitter = new ns.Emitter();
                shared.emitter = emitter;
            }
            return emitter;
        },

        getTerminal: function () {
            var client = shared.terminal;
            if (!client) {
                var database = this.getDatabase();
                var facebook = this.getFacebook();
                client = new ns.Client(facebook, database);
                client.start();
                shared.terminal = client;
            }
            return client;
        }
    };

    GlobalVariable.setCurrentUser = function (identifier) {
        var facebook = this.getFacebook();
        // 1. make sure private keys exist
        var sign_key = facebook.getPrivateKeyForVisaSignature(identifier);
        var msg_keys = facebook.getPrivateKeysForDecryption(identifier);
        if (!sign_key || !msg_keys || msg_keys.length === 0) {
            throw ReferenceError('failed to get private keys for: ' + identifier);
        }
        // 2. set to facebook
        var user = facebook.getUser(identifier);
        facebook.setCurrentUser(user);
        // 3. update database
        var database = this.getDatabase();
        database.setCurrentUser(identifier);
        // 4. set to current session
        var session = shared.session;
        if (session) {
            session.setIdentifier(identifier);
        }
        return facebook;
    };

    GlobalVariable.setSession = function (session) {
        shared.session = session;
        var facebook = this.getFacebook();
        // set current user
        var user = facebook.getCurrentUser();
        if (user) {
            session.setIdentifier(user.getIdentifier());
        }
    };

    // GlobalVariable.connect = function (host, port) {
    //     var database = this.getDatabase();
    //     var facebook = this.getFacebook();
    //     // 1. create station with remote host & port
    //     var station = new Station(host, port);
    //     station.setDataSource(facebook);
    //     // 2. create session with SessionDB
    //     var session = new ClientSession(station, database);
    //     this.setSession(session);
    // };

    //-------- namespace --------
    ns.GlobalVariable = GlobalVariable;

})(SECHAT, DIMP);
