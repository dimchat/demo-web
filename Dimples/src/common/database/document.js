;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
//
//                               Written in 2023 by Moky <albert.moky@gmail.com>
//
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

//! require 'dbi/*.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var LocalStorage = ns.dos.LocalStorage;
    var MetaDBI = ns.dbi.MetaDBI;

    /**
     *  Document for Entities (User/Group)
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     *
     *  storage path: 'dim.fs.pub.{ADDRESS}.document'
     */
    var DocumentStorage = function () {
        Object.call(this);
    };
    Class(DocumentStorage, Object, [MetaDBI], null);

    // Override
    DocumentStorage.prototype.saveDocument = function (doc) {
        var entity = doc.getIdentifier();
        var path = doc_path(entity);
        return LocalStorage.saveJSON(doc.toMap(), path);
    };

    // Override
    DocumentStorage.prototype.getDocument = function (entity) {
        var path = doc_path(entity);
        var info = LocalStorage.loadJSON(path);
        if (info) {
            return DocumentStorage.parse(info, null, null);
        } else {
            return false;
        }
    };

    var doc_path = function (entity) {
        return 'pub.' + entity.getRemoteAddress().toString() + '.document';
    };

    DocumentStorage.parse = function (dict, identifier, type) {
        // check document ID
        var entity = ID.parse(dict['ID']);
        if (!identifier) {
            identifier = entity;
        } else if (!identifier.equals(entity)) {
            throw new TypeError('document error: ' + dict);
        }
        // check document type
        if (!type) {
            type = '*';
        }
        var dt = dict['type'];
        if (dt) {
            type = dt;
        }
        // check document data
        var data = dict['data'];
        if (!data) {
            // compatible with v1.0
            data = dict['profile'];
        }
        // check document signature
        var signature = dict['signature'];
        if (!data || !signature) {
            throw new ReferenceError('document error: ' + dict);
        }
        return Document.create(type, identifier, data, signature);
    };

    //-------- namespace --------
    ns.database.DocumentStorage = DocumentStorage;

})(DIMP);
