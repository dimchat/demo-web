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

//! require <dimsdk.js>

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Log   = ns.lnc.Log;

    var Archivist = ns.Archivist;

    var CommonArchivist = function (db) {
        Archivist.call(this, Archivist.kQueryExpires);
        this.__db = db;         // AccountDB
    };
    Class(CommonArchivist, Archivist, null, {

        // Override
        getLastGroupHistoryTime: function (group) {
            var db = this.getDatabase();
            var array = db.getGroupHistories(group);
            if (!array || array.length === 0) {
                return null;
            }
            var hisTime, lastTime = null;  // Date
            var pair;
            var cmd;  // GroupCommand
            var msg;  // ReliableMessage
            for (var i = 0; i < array.length; ++i) {
                pair = array[i];
                cmd = pair[0];
                msg = pair[1];
                hisTime = cmd.getTime();
                if (!hisTime) {
                    // group command error
                } else if (!lastTime || lastTime.getTime() < hisTime.getTime()) {
                    lastTime = hisTime;
                }
            }
            return lastTime;
        },

        // Override
        saveMeta: function (meta, identifier) {
            var db = this.getDatabase();
            return db.saveMeta(meta, identifier);
        },

        // Override
        saveDocument: function (doc) {
            var docTime = doc.getTime();
            if (!docTime) {
                Log.warning('document without time', doc);
            } else {
                // calibrate the clock
                // make sure the document time is not in the far future
                var current = (new Date()).getTime() + 65536;
                if (docTime.getTime() > current) {
                    Log.error('document time error', docTime, doc);
                    return false;
                }
            }
            var db = this.getDatabase();
            return db.saveDocument(doc);
        },

        //
        //  EntityDataSource
        //

        // Override
        getMeta: function (identifier) {
            var db = this.getDatabase();
            return db.getMeta(identifier);
        },

        // Override
        getDocuments: function (identifier) {
            var db = this.getDatabase();
            return db.getDocuments(identifier);
        },

        //
        //  UserDataSource
        //

        // Override
        getContacts: function (user) {
            var db = this.getDatabase();
            return db.getContacts(user);
        },

        // Override
        getPublicKeyForEncryption: function (user) {
            throw new Error("DON't call me!");
        },

        // Override
        getPublicKeysForVerification: function (user) {
            throw new Error("DON't call me!");
        },

        // Override
        getPrivateKeysForDecryption: function (user) {
            var db = this.getDatabase();
            return db.getPrivateKeysForDecryption(user);
        },

        // Override
        getPrivateKeyForSignature: function (user) {
            var db = this.getDatabase();
            return db.getPrivateKeyForSignature(user);
        },

        // Override
        getPrivateKeyForVisaSignature: function (user) {
            var db = this.getDatabase();
            return db.getPrivateKeyForVisaSignature(user);
        },

        //
        //  GroupDataSource
        //

        // Override
        getFounder: function (group) {
            var db = this.getDatabase();
            return db.getFounder(group);
        },

        // Override
        getOwner: function (group) {
            var db = this.getDatabase();
            return db.getOwner(group);
        },

        // Override
        getMembers: function (group) {
            var db = this.getDatabase();
            return db.getMembers(group);
        },

        // Override
        getAssistants: function (group) {
            var db = this.getDatabase();
            return db.getAssistants(group);
        },

        //
        //  Organization Structure
        //

        // Override
        getAdministrators: function (group) {
            var db = this.getDatabase();
            return db.getAdministrators(group);
        },

        // Override
        saveAdministrators: function (members, group) {
            var db = this.getDatabase();
            return db.saveAdministrators(members, group);
        },

        // Override
        saveMembers: function (members, group) {
            var db = this.getDatabase();
            return db.saveMembers(members, group);
        }
    });

    CommonArchivist.prototype.getDatabase = function () {
        return this.__db;
    };

    CommonArchivist.prototype.getLocalUsers = function () {
        var db = this.getDatabase();
        return db.getLocalUsers();
    };

    //-------- namespace --------
    ns.CommonArchivist = CommonArchivist;

})(DIMP);
