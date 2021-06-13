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
            return this.__docs[identifier];
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
            this.__docs[identifier] = doc;
            console.log('saving document', identifier);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification(ns.kNotificationDocumentUpdated, this, doc);
                return true;
            } else {
                throw new Error('failed to save document: '
                    + identifier + ' -> '
                    + doc.getValue('data'));
            }
        },

        load: function () {
            if (!this.__docs) {
                this.__docs = convert(Storage.loadJSON('DocumentTable'));
            }
        },
        save: function () {
            return Storage.saveJSON(revert(this.__docs), 'DocumentTable');
        },

        __docs: null  // ID => Document
    };

    var convert = function (map) {
        var results = {};
        if (map) {
            var list = Object.keys(map);
            var id;
            for (var i = 0; i < list.length; ++i) {
                id = list[i];
                results[ID.parse(id)] = Document.parse(map[id]);
            }
        }
        return results;
    };
    var revert = function (map) {
        var results = {};
        if (map) {
            var list = Object.keys(map);
            var id, doc;
            for (var i = 0; i < list.length; ++i) {
                id = list[i];
                doc = map[id];
                if (!doc) {
                    // FIXME: document error
                    continue;
                }
                results[id.toString()] = doc.getMap();
            }
        }
        return results;
    };

})(SECHAT, DIMSDK);
