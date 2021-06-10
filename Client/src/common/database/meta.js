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
    var Meta = sdk.protocol.Meta;

    var Storage = sdk.dos.LocalStorage;
    var NotificationCenter = sdk.lnc.NotificationCenter;

    var kNotificationMetaAccepted = ns.kNotificationMetaAccepted;

    ns.db.MetaTable = {

        getMeta: function (identifier) {
            this.load();
            var meta = this.__metas[identifier];
            if (!meta) {
                // TODO: place an empty meta for cache
            }
            return meta;
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
                nc.postNotification(kNotificationMetaAccepted, this,
                    {'ID': identifier, 'meta': meta});
                return true;
            } else {
                var text = 'failed to save meta: ' + identifier + ' -> '
                    + sdk.format.JSON.encode(meta);
                console.log(text);
                return false;
            }
        },

        load: function () {
            if (!this.__metas) {
                this.__metas = parse(Storage.loadJSON('MetaTable'));
            }
        },
        save: function () {
            return Storage.saveJSON(this.__metas, 'MetaTable');
        },

        __metas: null
    };

    var parse = function (map) {
        var metas = {};
        if (map) {
            var identifier, meta;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                identifier = list[i];
                meta = map[identifier];
                identifier = ID.parse(identifier);
                meta = Meta.getInstance(meta);
                if (identifier && meta) {
                    metas[identifier] = meta;
                }
            }
        }
        return metas;
    };

})(SECHAT, DIMSDK);
