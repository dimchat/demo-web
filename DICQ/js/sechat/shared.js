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

//!require 'facebook.js'

(function (ns, sdk) {
    'use strict';

    var Station = sdk.mkm.Station;
    var ClientSession = sdk.network.ClientSession;
    var SharedFacebook = sdk.SharedFacebook;

    var GlobalVariable = {

        database: null,
        facebook: null,
        messenger: null,
        terminal: null,

        getInstance: function () {
            return this
        }
    };

    GlobalVariable.createFacebook = function (database, current_user) {
        var facebook = new SharedFacebook(database);
        // make sure private keys exist
        var sign_key = facebook.getPrivateKeyForVisaSignature(current_user);
        var msg_keys = facebook.getPrivateKeysForDecryption(current_user);
        if (!sign_key || !msg_keys || msg_keys.length === 0) {
            throw ReferenceError('failed to get private keys for: ' + current_user);
        }
        var user = facebook.getUser(current_user);
        facebook.setCurrentUser(user);
        return facebook;
    };

    GlobalVariable.createSession = function (database, facebook, host, port) {
        // 1. create station with remote host & port
        var station = new Station(host, port);
        station.setDataSource(facebook);
        // 2. create session with SessionDB
        var session = new ClientSession(station, database);
        // 3. set current user
        var user = facebook.getCurrentUser();
        session.setIdentifier(user.getIdentifier());
        return session;
    }

    //-------- namespace --------
    ns.GlobalVariable = GlobalVariable;

})(SECHAT, DIMP);
