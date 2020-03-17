;

//! require 'table.js'

!function (ns) {
    'use strict';

    var Facebook = ns.Facebook;
    var NotificationCenter = ns.stargate.NotificationCenter;

    var Table = ns.db.Table;

    var save_contacts = function (map) {
        return Table.save(map, ContactTable);
    };
    var load_contacts = function () {
        var users = {};
        var map = Table.load(ContactTable);
        if (map) {
            var facebook = Facebook.getInstance();
            var u_list = Object.keys(map);
            for (var i = 0; i < u_list.length; ++i) {
                var user = u_list[i];
                var c_list = map[user];
                // user ID
                user = facebook.getIdentifier(user);
                if (!user) {
                    throw TypeError('user ID error: ' + u_list[i]);
                }
                // user contacts
                var contacts = [];
                for (var j = 0; j < c_list.length; ++j) {
                    var item = c_list[j];
                    item = facebook.getIdentifier(item);
                    if (!item) {
                        throw TypeError('contact ID error: ' + c_list[j]);
                    }
                    contacts.push(item);
                }
                // got contacts for one user
                users[user] = contacts;
            }
        }
        return users;
    };

    var ContactTable = function () {
        this.users = null; // ID => Array<ID>
    };

    ContactTable.prototype.loadContacts = function (user) {
        if (!this.users) {
            this.users = load_contacts();
        }
        return this.users[user];
    };

    ContactTable.prototype.saveContacts = function (contacts, user) {
        this.loadContacts(user);
        this.users[user] = contacts;
        console.log('saving contacts for user: ' + user);
        var nc = NotificationCenter.getInstance();
        if (save_contacts(this.users)) {
            nc.postNotification('ContactsUpdated', this,
                {'user': user, 'contacts': contacts});
            return true;
        } else {
            var text = 'failed to save contacts: ' + user + ' -> ' + contacts;
            console.log(text);
            return false;
        }
    };

    ContactTable.getInstance = function () {
        return Table.create(ContactTable);
    };

    //-------- namespace --------
    ns.db.ContactTable = ContactTable;

}(DIMP);
