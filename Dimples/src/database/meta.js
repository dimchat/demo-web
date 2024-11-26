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
    var Meta = ns.protocol.Meta;
    var Storage = ns.dos.LocalStorage;
    var MetaDBI = ns.dbi.MetaDBI;

    var meta_path = function (entity) {
        return 'pub.' + entity.getAddress().toString() + '.meta';
    };

    /**
     *  Meta for Entities (User/Group)
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     *
     *  storage path: 'dim.fs.pub.{ADDRESS}.meta'
     */
    var MetaStorage = function () {
        Object.call(this);
    };
    Class(MetaStorage, Object, [MetaDBI], null);

    // Override
    MetaStorage.prototype.saveMeta = function (meta, entity) {
        var path = meta_path(entity);
        return Storage.saveJSON(meta.toMap(), path);
    };

    // Override
    MetaStorage.prototype.getMeta = function (entity) {
        var path = meta_path(entity);
        var info = Storage.loadJSON(path);
        return Meta.parse(info);
    };

    //-------- namespace --------
    ns.database.MetaStorage = MetaStorage;

})(DIMP);
