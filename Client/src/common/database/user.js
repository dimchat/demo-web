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

    var Storage = sdk.dos.LocalStorage;

    ns.db.UserTable = {

        allUsers: function () {
            this.load();
            return ID.convert(this.__users);
        },

        addUser: function (user) {
            var list = this.allUsers();
            if (list.indexOf(user) < 0) {
                list.push(user.toString());
                return this.save();
            } else {
                console.error('user already exists', user);
                return false;
            }
        },

        removeUser: function (user) {
            var list = this.allUsers();
            var index = list.indexOf(user.toString());
            if (index < 0) {
                console.error('user not exists', user);
                return true;
            } else {
                list.splice(index, 1);
                return this.save();
            }
        },

        setCurrentUser: function (user) {
            var list = this.allUsers();
            var index = list.indexOf(user.toString());
            if (index === 0) {
                // already the first user
                return true;
            } else if (index > 0) {
                // already exists, but not the first user
                list.splice(index, 1);
            }
            list.unshift(user.toString());
            return this.save();
        },

        getCurrentUser: function () {
            var list = this.allUsers();
            if (list.length > 0) {
                return ID.parse(list[0]);
            } else {
                return null;
            }
        },

        load: function () {
            if (!this.__users) {
                this.__users = Storage.loadJSON('UserTable');
                if (!this.__users) {
                    this.__users = [];
                }
            }
        },
        save: function () {
            return Storage.saveJSON(this.__users, 'UserTable');
        },

        __users: null
    };

    var parse = function (list) {
        var users = [];
        if (list) {
            var item;
            for (var i = 0; i < list.length; ++i) {
                item = ID.parse(list[i]);
                console.assert(item !== null, 'user ID error', list[i]);
                users.push(item);
            }
        }
        return users;
    };

})(SECHAT, DIMSDK);
