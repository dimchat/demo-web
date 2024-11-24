;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
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

//! require 'protocol/*.js'
//! require 'db/*.js'
//! require 'network/*.js'

(function (ns) {
    'use strict';

    var Class          = ns.type.Class;
    var Document       = ns.protocol.Document;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var Facebook       = ns.Facebook;

    var CommonFacebook = function () {
        Facebook.call(this);
        this.__current = null;  // User
    };
    Class(CommonFacebook, Facebook, null, {

        // Override
        getLocalUsers: function() {
            var localUsers = [];
            var user;
            var db = this.getArchivist();
            var array = db.getLocalUsers();
            if (!array || array.length === 0) {
                user = this.__current;
                if (user) {
                    localUsers.push(user);
                }
            } else {
                for (var i = 0; i < array.length; ++i) {
                    user = this.getUser(array[i]);
                    if (user) {
                        localUsers.push(user);
                    }
                }
            }
            return localUsers;
        },

        // Get current user (for signing and sending message)
        getCurrentUser: function () {
            var user = this.__current;
            if (!user) {
                var localUsers = this.getLocalUsers();
                if (localUsers.length > 0) {
                    user = localUsers[0];
                    this.__current = user;
                }
            }
            return user;
        },
        setCurrentUser: function (user) {
            if (!user.getDataSource()) {
                user.setDataSource(this);
            }
            this.__current = user;
        },

        getDocument: function (identifier, type) {
            var docs = this.getDocuments(identifier);
            var doc = DocumentHelper.lastDocument(docs, type);
            // compatible for document type
            if (!doc && type === Document.VISA) {
                doc = DocumentHelper.lastDocument(docs, 'profile');
            }
            return doc;
        },

        getName: function (identifier) {
            var type;
            if (identifier.isUser()) {
                type = Document.VISA;
            } else if (identifier.isGroup()) {
                type = Document.BULLETIN;
            } else {
                type = '*';
            }
            // get name from document
            var doc = this.getDocument(identifier, type);
            if (doc) {
                var name = doc.getName();
                if (name && name.length > 0) {
                    return name;
                }
            }
            // get name from ID
            return ns.Anonymous.getName(identifier);
        },

        //
        //  UserDataSource
        //

        getContacts: function (user) {
            var db = this.getArchivist();
            return db.getContacts(user);
        },

        getPrivateKeysForDecryption: function (user) {
            var db = this.getArchivist();
            return db.getPrivateKeysForDecryption(user);
        },

        getPrivateKeyForSignature: function (user) {
            var db = this.getArchivist();
            return db.getPrivateKeyForSignature(user);
        },

        getPrivateKeyForVisaSignature: function (user) {
            var db = this.getArchivist();
            return db.getPrivateKeyForVisaSignature(user);
        }
    });

    //-------- namespace --------
    ns.CommonFacebook = CommonFacebook;

})(DIMP);
