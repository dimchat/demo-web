;

//! require 'table.js'

!function (ns) {
    'use strict';

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
                    console.error('user ID error', list[i]);
                    continue;
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
        var list = this.allUsers();
        if (list.indexOf(user) >= 0) {
            console.error('user already exists', user);
            return true;
        }
        list.push(user);
        return save_users(list);
    };
    UserTable.prototype.removeUser = function (user) {
        var list = this.allUsers();
        var index = list.indexOf(user);
        if (index < 0) {
            console.error('user not exists', user);
            return true;
        }
        list.splice(index, 1);
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
        var list = this.allUsers();
        var index = list.indexOf(user);
        if (index === 0) {
            // already the first user
            return true;
        } else if (index > 0) {
            // already exists, but not the first user
            list.splice(index, 1);
        }
        list.unshift(user);
        return save_users(list);
    };

    UserTable.getInstance = function () {
        return Table.create(UserTable);
    };

    //-------- namespace --------
    ns.db.UserTable = UserTable;

}(DIMP);
