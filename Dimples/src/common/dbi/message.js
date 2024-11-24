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
    var CipherKeyDBI = ns.CipherKeyDelegate;

    /**
     *  Message DBI
     *  ~~~~~~~~~~~
     */
    var GroupKeysDBI = Interface(null, null);

    GroupKeysDBI.prototype.getGroupKeys = function (group, sender) {};

    GroupKeysDBI.prototype.saveGroupKeys = function (group, sender, keys) {};

    //-------- namespace --------
    ns.dbi.CipherKeyDBI = CipherKeyDBI;
    ns.dbi.GroupKeysDBI = GroupKeysDBI;

})(DIMP);

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;

    var CipherKeyDBI = ns.dbi.CipherKeyDBI;
    var GroupKeysDBI = ns.dbi.GroupKeysDBI;

    /**
     *  Message DBI
     *  ~~~~~~~~~~~
     */
    var MessageDBI = Interface(null, [
        CipherKeyDBI,
        GroupKeysDBI
    ]);

    //-------- namespace --------
    ns.dbi.MessageDBI = MessageDBI;

})(DIMP);
