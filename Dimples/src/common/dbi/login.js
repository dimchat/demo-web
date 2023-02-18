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
     *  Session DBI
     *  ~~~~~~~~~~~
     */
    var LoginDBI = Interface(null, null);

    /**
     *  Get login command and its message
     *
     * @param {ID} user - user ID
     * @return {[LoginCommand,ReliableMessage]}
     */
    LoginDBI.prototype.getLoginCommandMessage = function (user) {
        throw new Error('NotImplemented');
    };

    /**
     *  Save login command and its message
     *
     * @param {ID} user                 - sender ID
     * @param {LoginCommand} command    - login command
     * @param {ReliableMessage} message - network message
     * @return {boolean} false on error
     */
    LoginDBI.prototype.saveLoginCommandMessage = function (user, command, message) {
        throw new Error('NotImplemented');
    };

    //-------- namespace --------
    ns.dbi.LoginDBI = LoginDBI;

})(DIMP);
