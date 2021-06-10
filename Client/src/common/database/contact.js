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
    var NotificationCenter = sdk.lnc.NotificationCenter;

    ns.db.ContactTable = {

        getContacts: function (user) {
            this.load();
            return this.__users[user];
        },

        addContact: function (contact, user) {
            var contacts = this.getContacts(user);
            if (contacts) {
                if (contacts.indexOf(contact) >= 0) {
                    return false;
                }
                contacts.push(contact);
            } else {
                contacts = [contact];
            }
            return this.saveContacts(contacts, user);
        },

        removeContact: function (contact, user) {
            var contacts = this.getContacts(user);
            if (!contacts) {
                return false;
            }
            var pos = contacts.indexOf(contact);
            if (pos < 0) {
                return false;
            }
            contacts.splice(pos, 1);
            return this.saveContacts(contacts, user);
        },

        saveContacts: function (contacts, user) {
            this.load();
            this.__users[user] = contacts;
            console.log('saving contacts for user', user);
            if (this.save()) {
                var nc = NotificationCenter.getInstance();
                nc.postNotification('ContactsUpdated', this,
                    {'user': user, 'contacts': contacts});
                return true;
            } else {
                throw new Error('failed to save contacts: ' + user + ' -> ' + contacts);
            }
        },

        load: function () {
            if (!this.__users) {
                this.__users = parse(Storage.loadJSON('ContactTable'));
            }
        },
        save: function () {
            return Storage.saveJSON(this.__users, 'ContactTable');
        },

        __users: null  // ID => Array<ID>
    };

    var parse = function (map) {
        var users = {};
        if (map) {
            var u_list = Object.keys(map);
            for (var i = 0; i < u_list.length; ++i) {
                var user = u_list[i];
                var c_list = map[user];
                // user ID
                user = ID.parse(user);
                console.assert(user !== null, 'user ID error', u_list[i]);
                // user contacts
                var contacts = [];
                for (var j = 0; j < c_list.length; ++j) {
                    var item = c_list[j];
                    item = ID.parse(item);
                    console.assert(item !== null, 'contact ID error', c_list[j]);
                    contacts.push(item);
                }
                // got contacts for one user
                users[user] = contacts;
            }
        }
        return users;
    };

})(SECHAT, DIMSDK);
