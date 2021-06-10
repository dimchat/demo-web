;
// license: https://mit-license.org
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

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;
    var Document = sdk.protocol.Document;

    var Storage = sdk.dos.LocalStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;

    ns.db.DocumentTable = {

        getDocument: function (identifier, type) {
            this.load();
            var doc = this.__docs[identifier.toString()];
            if (doc) {
                return Document.parse(doc);
            } else {
                return null;  //Document.create(identifier);
            }
        },

        saveDocument: function (doc) {
            if (!doc.isValid()) {
                console.error('document not valid', doc);
                return false;
            }
            var identifier = doc.getIdentifier();
            if (!identifier) {
                throw new Error('entity ID error: ' + doc);
            }
            this.load();
            this.__docs[identifier.toString()] = doc.getMap();
            console.log('saving document', identifier);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification(ns.kNotificationDocumentUpdated, this, doc);
                return true;
            } else {
                throw new Error('failed to save profile: '
                    + identifier + ' -> '
                    + doc.getValue('data'));
            }
        },

        load: function () {
            if (!this.__docs) {
                this.__docs = parse(Storage.loadJSON('DocumentTable'));
                if (!this.__docs) {
                    this.__docs = {};
                }
            }
        },
        save: function () {
            return Storage.saveJSON(this.__docs, 'DocumentTable');
        },

        __docs: null  // ID => Document
    };

    var parse = function (map) {
        var documents = {};
        if (map) {
            var user, doc;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                user = list[i];
                doc = map[user];
                user = ID.parse(user);
                doc = Document.parse(doc);
                if (user && doc) {
                    documents[user] = doc;
                }
            }
        }
        return documents;
    };

})(SECHAT, DIMSDK);
