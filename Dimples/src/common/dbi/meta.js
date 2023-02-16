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

//! require 'base.js'

(function (ns) {
    'use strict';

    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;

    var Storage = ns.db.LocalStorage;
    var NotificationCenter = ns.lnc.NotificationCenter;

    ns.db.MetaTable = {

        getMeta: function (identifier) {
            this.load();
            return this.__metas[identifier];
        },

        saveMeta: function (meta, identifier) {
            if (!meta.matches(identifier)) {
                console.error('meta mot match', identifier, meta);
                return false;
            }
            this.load();
            if (this.__metas[identifier]) {
                console.log('meta already exists', identifier);
                return true;
            }
            this.__metas[identifier] = meta;
            console.log('saving meta', identifier);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification(ns.kNotificationMetaAccepted, this,
                    {'ID': identifier, 'meta': meta});
                return true;
            } else {
                console.error('failed to save meta', identifier, meta);
                return false;
            }
        },

        load: function () {
            if (!this.__metas) {
                this.__metas = convert(Storage.loadJSON('MetaTable'));
            }
        },
        save: function () {
            return Storage.saveJSON(revert(this.__metas), 'MetaTable');
        },

        __metas: null  // ID => Meta
    };

    var convert = function (map) {
        var results = {};
        if (map) {
            var id;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                id = list[i];
                results[ID.parse(id)] = Meta.parse(map[id]);
            }
        }
        return results;
    };
    var revert = function (map) {
        var results = {};
        if (map) {
            var id, m;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                id = list[i];
                m = map[id];
                if (!m) {
                    // FIXME: meta error?
                    continue;
                }
                results[id.toString()] = m.toMap();
            }
        }
        return results;
    };

})(SECHAT);
