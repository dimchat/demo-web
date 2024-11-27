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

//!require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var Class          = sdk.type.Class;
    var ClientFacebook = sdk.ClientFacebook;

    var SharedFacebook = function () {
        ClientFacebook.call(this);
    };
    Class(SharedFacebook, ClientFacebook, null, {

        getAvatar: function (identifier) {
            var doc = this.getVisa(identifier);
            if (doc) {
                return doc.getAvatar();
            }
            return null;
        }
    });

    // Override
    SharedFacebook.prototype.getArchivist = function () {
        return ns.GlobalVariable.getArchivist();
    };

    // Override
    SharedFacebook.prototype.createGroup = function (identifier) {
        var group = null;
        if (!identifier.isBroadcast()) {
            var man = sdk.group.SharedGroupManager;
            var doc = man.getBulletin(identifier);
            if (doc) {
                group = ClientFacebook.prototype.createGroup.call(this, identifier);
                group.setDataSource(man);
            }
        }
        return group;
    };

    //-------- namespace --------
    ns.SharedFacebook = SharedFacebook;

})(SECHAT, DIMP);

(function (ns, sdk) {
    'use strict';

    var Class           = sdk.type.Class;
    var ClientArchivist = sdk.ClientArchivist;

    var SharedArchivist = function (db) {
        ClientArchivist.call(this, db);
    };
    Class(SharedArchivist, ClientArchivist, null, null);

    // Override
    SharedArchivist.prototype.getFacebook = function () {
        return ns.GlobalVariable.getFacebook();
    };

    // Override
    SharedArchivist.prototype.getMessenger = function () {
        return ns.GlobalVariable.getMessenger();
    };

    // protected
    SharedArchivist.prototype.getSession = function () {
        var messenger = this.getMessenger();
        return messenger.getSession();
    };

    // Override
    SharedArchivist.prototype.checkMeta = function (identifier, meta) {
        if (identifier.isBroadcast()) {
            // broadcast entity has no meta to query
            return false;
        }
        return ClientArchivist.prototype.checkMeta(identifier, meta);
    };

    // Override
    SharedArchivist.prototype.checkDocuments = function (identifier, documents) {
        if (identifier.isBroadcast()) {
            // broadcast entity has no document to query
            return false;
        }
        return ClientArchivist.prototype.checkDocuments(identifier, documents);
    };

    // Override
    SharedArchivist.prototype.checkMembers = function (group, members) {
        if (group.isBroadcast()) {
            // broadcast group has no members to update
            return false;
        }
        return ClientArchivist.prototype.checkMembers(group, members);
    };

    // Override
    SharedArchivist.prototype.queryMeta = function (identifier) {
        var session = this.getSession();
        if (!session.isReady()) {
            console.warn('querying meta cancel, waiting to connect', identifier, session);
            return false;
        }
        return ClientArchivist.prototype.queryMeta(identifier);
    };

    // Override
    SharedArchivist.prototype.queryDocuments = function (identifier, docs) {
        var session = this.getSession();
        if (!session.isReady()) {
            console.warn('querying documents cancel, waiting to connect', identifier, session);
            return false;
        }
        return ClientArchivist.prototype.queryDocuments(identifier, docs);
    };

    // Override
    SharedArchivist.prototype.queryMembers = function (group, members) {
        var session = this.getSession();
        if (!session.isReady()) {
            console.warn('querying members cancel, waiting to connect', group, session);
            return false;
        }
        return ClientArchivist.prototype.queryMembers(group, members);
    };

    //-------- namespace --------
    ns.SharedArchivist = SharedArchivist;

})(SECHAT, DIMP);
