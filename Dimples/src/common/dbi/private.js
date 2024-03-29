;
// license: https://mit-license.org
//
//  DBI : Database Interface
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

//! require 'base.js'

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;

    /**
     *  Account DBI
     *  ~~~~~~~~~~~
     */
    var PrivateKeyDBI = Interface(null, null);

    PrivateKeyDBI.META = 'M';
    PrivateKeyDBI.VISA = 'V';

    /**
     *  Save private key for user
     *
     * @param {PrivateKey} key - private key
     * @param {string} type    - 'M' for matching meta.key; or 'D' for matching visa.key
     * @param {ID} user        - user ID
     * @return {boolean} false on error
     */
    PrivateKeyDBI.prototype.savePrivateKey = function (key, type, user) {
        throw new Error('NotImplemented');
    };

    /**
     *  Get private keys for user
     *
     * @param {ID} user - user ID
     * @return {DecryptKey[]} all keys marked for decryption
     */
    PrivateKeyDBI.prototype.getPrivateKeysForDecryption = function (user) {
        throw new Error('NotImplemented');
    };

    /**
     *  Get private key for user
     *
     * @param {ID} user - user ID
     * @return {PrivateKey} first key marked for signature
     */
    PrivateKeyDBI.prototype.getPrivateKeyForSignature = function (user) {
        throw new Error('NotImplemented');
    };

    /**
     *  Get private key for user
     *
     * @param {ID} user - user ID
     * @return {PrivateKey} the private key matched with meta.key
     */
    PrivateKeyDBI.prototype.getPrivateKeyForVisaSignature = function (user) {
        throw new Error('NotImplemented');
    };

    //-------- namespace --------
    ns.dbi.PrivateKeyDBI = PrivateKeyDBI;

})(DIMP);
