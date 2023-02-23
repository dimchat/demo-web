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

//! require <dimples.js>

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Storage = ns.dos.SessionStorage;
    var CipherKeyDBI = ns.dbi.CipherKeyDBI;

    var msg_key_path = function (from, to) {
        from = from.getAddress().toString();
        to = to.getAddress().toString();
        return 'msg_key.' + from + '-' + to;
    };

    /**
     *  Storage for CipherKeys
     *  ~~~~~~~~~~~~~~~~~~~~~~
     *
     *  storage path: 'dim.fs.user.{ADDRESS}.login'
     */
    var CipherKeyStorage = function () {
        Object.call(this);
    };
    Class(CipherKeyStorage, Object, [CipherKeyDBI], null);

    // Override
    CipherKeyStorage.prototype.getCipherKey = function (from, to, generate) {
        var path = msg_key_path(from, to);
        var info = Storage.loadJSON(path);
        return SymmetricKey.parse(info);
    };

    // Override
    CipherKeyStorage.prototype.cacheCipherKey = function (from, to, key) {
        var path = msg_key_path(from, to);
        var info = !key ? null : key.toMap();
        return Storage.saveJSON(info, path);
    };

    //-------- namespace --------
    ns.database.CipherKeyStorage = CipherKeyStorage;

})(DIMP);
