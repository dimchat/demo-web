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
    var Command = ns.protocol.Command;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var Storage = ns.dos.LocalStorage;
    var LoginDBI = ns.dbi.LoginDBI;

    var store_path = function (user) {
        return 'user.' + user.getAddress().toString() + '.login';
    };

    /**
     *  Storage for Login Command Messages
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     *
     *  storage path: 'dim.fs.user.{ADDRESS}.login'
     */
    var LoginStorage = function () {
        Object.call(this);
    };
    Class(LoginStorage, Object, [LoginDBI], null);

    // Override
    LoginStorage.prototype.getLoginCommandMessage = function (user) {
        var path = store_path(user);
        var info = Storage.loadJSON(path);
        if (info) {
            var cmd = Command.parse(info['cmd']);
            var msg = ReliableMessage.parse(info['msg']);
            return [cmd, msg];
        } else {
            return [null, null];
        }
    };

    // Override
    LoginStorage.prototype.saveLoginCommandMessage = function (user, command, message) {
        var cmd = !command ? null : command.toMap();
        var msg = !message ? null : message.toMap();
        var info = {
            'cmd': cmd,
            'msg': msg
        };
        var path = store_path(user);
        return Storage.saveJSON(info, path);
    };

    //-------- namespace --------
    ns.database.LoginStorage = LoginStorage;

})(DIMP);
