;

//! require 'table.js'

!function (ns) {
    'use strict';

    var User = ns.User;

    var Facebook = ns.Facebook;

    var Table = ns.db.Table;

    var save_users = function (list) {
        return Table.save(list, UserTable);
    };
    var load_users = function () {
        var users = [];
        var list = Table.load(UserTable);
        if (list) {
            var facebook = Facebook.getInstance();
            var item;
            for (var i = 0; i < list.length; ++i) {
                item = facebook.getIdentifier(list[i]);
                if (!item) {
                    throw Error('ID error: ' + list[i]);
                }
                users.push(item);
            }
        }
        return users;
    };

    var UserTable = function () {
        this.users = null;
    };

    UserTable.prototype.allUsers = function () {
        if (!this.users) {
            this.users = load_users();
        }
        return this.users;
    };

    UserTable.prototype.addUser = function (user) {
        if (user instanceof User) {
            user = user.identifier;
        }
        var list = this.allUsers();
        if (list.contains(user)) {
            throw Error('user already exists: ' + user);
        }
        list.push(user);
        return save_users(list);
    };
    UserTable.prototype.removeUser = function (user) {
        if (user instanceof User) {
            user = user.identifier;
        }
        var list = this.allUsers();
        if (!list.contains(user)) {
            throw Error('user not exists: ' + user);
        }
        list.remove(user);
        return save_users(list);
    };

    UserTable.prototype.getCurrentUser = function () {
        var list = this.allUsers();
        if (list && list.length > 0) {
            return list[0];
        } else {
            return null;
        }
    };
    UserTable.prototype.setCurrentUser = function (user) {
        if (user instanceof User) {
            user = user.identifier;
        }
        var list = this.allUsers();
        var index = list.indexOf(user);
        if (index === 0) {
            // already the first user
            return;
        } else if (index > 0) {
            // already exists, but not the first user
            list.remove(user);
        }
        list.unshift(user);
        save_users(list);
    };

    //-------- namespace --------
    ns.db.UserTable = UserTable;

}(DIMP);
