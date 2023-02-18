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
    var UserDBI = Interface(null, null);

    /**
     *  Get local user ID list
     *
     * @return {ID[]} user ID list
     */
    UserDBI.prototype.getLocalUsers = function () {
        throw new Error('NotImplemented');
    };

    /**
     *  Save local user ID list
     *
     * @param {ID[]} users - user ID list
     * @return {boolean} false on error
     */
    UserDBI.prototype.saveLocalUsers = function (users) {
        throw new Error('NotImplemented');
    };

    /**
     *  Get contact ID list
     *
     * @param {ID} user - user ID
     * @return {ID[]} contact ID list
     */
    UserDBI.prototype.getContacts = function (user) {
        throw new Error('NotImplemented');
    };

    /**
     *  Save contact ID list
     *
     * @param {ID} user       - user ID
     * @param {ID[]} contacts - contact ID list
     * @return {boolean} false on error
     */
    UserDBI.prototype.saveContacts = function (contacts, user) {
        throw new Error('NotImplemented');
    };

    //-------- namespace --------
    ns.dbi.UserDBI = UserDBI;

})(DIMP);
