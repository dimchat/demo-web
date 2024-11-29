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

    var Class   = ns.type.Class;
    var ID      = ns.protocol.ID;
    var Storage = ns.dos.LocalStorage;
    var UserDBI = ns.dbi.UserDBI;

    var users_path = function () {
        return 'local_users';
    };
    var contacts_path = function (user) {
        return 'user.' + user.getAddress().toString() + '.contacts';
    };

    /**
     *  Storage for Local Users
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     *
     *  (1) Local Users
     *      storage path: 'dim.fs.local_users'
     *  (2) Contacts of the User
     *      storage path: 'dim.fs.user.{ADDRESS}.contacts'
     */
    var UserStorage = function () {
        Object.call(this);
    };
    Class(UserStorage, Object, [UserDBI], null);

    UserStorage.prototype.setCurrentUser = function (user) {
        var localUsers = this.getLocalUsers();
        var pos;
        for (pos = localUsers.length - 1; pos >= 0; --pos) {
            if (localUsers[pos].equals(user)) {
                break;
            }
        }
        if (pos === 0) {
            // it's the first user already
            return false;
        } else if (pos > 0) {
            // move to the front
            localUsers.splice(pos, 1);
        }
        localUsers.unshift(user);
        return this.saveLocalUsers(localUsers);
    };

    // Override
    UserStorage.prototype.getLocalUsers = function () {
        var path = users_path();
        var array = Storage.loadJSON(path);
        if (array) {
            return ID.convert(array);
        } else {
            return [];
        }
    };

    // Override
    UserStorage.prototype.saveLocalUsers = function (users) {
        var path = users_path();
        var array = ID.revert(users);
        return Storage.saveJSON(array, path);
    };

    // Override
    UserStorage.prototype.getContacts = function (user) {
        var path = contacts_path(user);
        var array = Storage.loadJSON(path);
        if (array) {
            return ID.convert(array);
        } else {
            return [];
        }
    };

    // Override
    UserStorage.prototype.saveContacts = function (contacts, user) {
        var path = contacts_path(user);
        var array = ID.revert(contacts);
        return Storage.saveJSON(array, path);
    };

    //-------- namespace --------
    ns.database.UserStorage = UserStorage;

})(DIMP);
