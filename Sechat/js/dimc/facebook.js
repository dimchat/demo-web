;
//! require <dimsdk.js>
//! require 'ans.js'

!function (ns) {
    'use strict';

    var NetworkType = ns.protocol.NetworkType;

    var User = ns.User;
    var Group = ns.Group;

    var AddressNameService = ns.AddressNameService;
    var Immortals = ns.Immortals;

    var PrivateTable = ns.db.PrivateTable;
    var MetaTable = ns.db.MetaTable;
    var ProfileTable = ns.db.ProfileTable;
    var UserTable = ns.db.UserTable;
    var ContactTable = ns.db.ContactTable;
    var GroupTable = ns.db.GroupTable;

    var Facebook = ns.Facebook;
    var Messenger = ns.Messenger;

    var s_facebook = null;
    Facebook.getInstance = function () {
        if (!s_facebook) {
            s_facebook = new Facebook();
            // ANS
            s_facebook.ans = AddressNameService.getInstance();
            // built-in accounts
            s_facebook.immortals = new Immortals();
            // local users
            s_facebook.users = null;
        }
        return s_facebook;
    };

    //
    //  Local Users
    //

    // Override
    Facebook.prototype.getLocalUsers = function() {
        if (!this.users) {
            var db = UserTable.getInstance();
            var list = db.allUsers();
            var users = [];
            for (var i = 0; i < list.length; ++i) {
                users.push(this.getUser(list[i]));
            }
            this.users = users;
        }
        return this.users;
    };

    // Override
    Facebook.prototype.setCurrentUser = function(user) {
        this.users = null;
        if (user instanceof User) {
            user = user.identifier;
        }
        var db = UserTable.getInstance();
        return db.setCurrentUser(user);
    };

    Facebook.prototype.addUser = function(user) {
        this.users = null;
        if (user instanceof User) {
            user = user.identifier;
        }
        var db = UserTable.getInstance();
        return db.addUser(user);
    };
    Facebook.prototype.removeUser = function(user) {
        this.users = null;
        if (user instanceof User) {
            user = user.identifier;
        }
        var db = UserTable.getInstance();
        return db.removeUser(user);
    };

    Facebook.prototype.getUsername = function (identifier) {
        identifier = this.getIdentifier(identifier);
        var username = identifier.name;
        var nickname = this.getNickname(identifier);
        var number = this.getNumberString(identifier);
        if (nickname != null && nickname.length > 0) {
            if (identifier.isUser()) {
                if (username != null && username.length > 0) {
                    return nickname + ' (' + username + ')';
                } else {
                    return nickname + ' (' + number + ')';
                }
            }
            return nickname;
        } else if (username != null && username.length > 0) {
            if (identifier.isUser()) {
                return username + ' (' + number + ')';
            }
            return username;
        }
        // ID only contains address: BTC, ETH, ...
        return identifier.address.toString() + ' (' + number + ')';
    };

    Facebook.prototype.getNickname = function (identifier) {
        var profile = this.getProfile(identifier);
        if (profile) {
            return profile.getName();
        } else {
            return null;
        }
    };

    Facebook.prototype.getNumberString = function (identifier) {
        var number = identifier.getNumber();
        var string = '0000000000' + number;
        string = string.substring(string.length - 10);
        string = string.substring(0, 3) + "-" + string.substring(3, 6) + "-" + string.substring(6);
        return string;
    };

    //
    //  Private Key
    //

    // Override
    Facebook.prototype.savePrivateKey = function (key, identifier) {
        if (!this.cachePrivateKey(key, identifier)) {
            // private key not match meta.key
            return false;
        }
        var db = PrivateTable.getInstance();
        return db.savePrivateKey(key, identifier);
    };
    // Override
    Facebook.prototype.loadPrivateKey = function (identifier) {
        var db = PrivateTable.getInstance();
        var key = db.loadPrivateKey(identifier);
        if (!key && NetworkType.Main.equals(identifier.getType())) {
            // try immortals
            key = this.immortals.getPrivateKeyForSignature(identifier);
        }
        return key;
    };

    //
    //  Meta
    //

    // Override
    Facebook.prototype.saveMeta = function(meta, identifier) {
        if (!this.cacheMeta(meta, identifier)) {
            console.log('meta not match ID: ' + identifier);
            return false;
        }
        var db = MetaTable.getInstance();
        return db.saveMeta(meta, identifier);
    };
    // Override
    Facebook.prototype.loadMeta = function(identifier) {
        if (identifier.isBroadcast()) {
            // broadcast ID has not meta
            return null;
        }
        // try from database
        var db = MetaTable.getInstance();
        var meta = db.loadMeta(identifier);
        if (meta) {
            return meta;
        }
        // try from immortals
        if (NetworkType.Main.equals(identifier.getType())) {
            meta = this.immortals.getMeta(identifier);
            if (meta) {
                return meta;
            }
        }
        // query from DIM network
        Messenger.getInstance().queryMeta(identifier);
        return meta;
    };

    //
    //  Profile
    //

    // Override
    Facebook.prototype.saveProfile = function(profile, identifier) {
        if (!identifier) {
            identifier = profile.getIdentifier();
            identifier = this.getIdentifier(identifier);
            if (!identifier) {
                throw Error('profile ID error: ' + identifier);
            }
        }
        if (!this.cacheProfile(profile, identifier)) {
            // profile's signature not match
            return false;
        }
        var db = ProfileTable.getInstance();
        return db.saveProfile(profile, identifier);
    };
    // Override
    Facebook.prototype.loadProfile = function(identifier) {
        // try from database
        var db = ProfileTable.getInstance();
        var profile = db.loadProfile(identifier);
        if (profile) {
            // is empty?
            var names = profile.allPropertyNames();
            if (names && names.length > 0) {
                return profile;
            }
        }
        // try from immortals
        if (NetworkType.Main.equals(identifier.getType())) {
            var tai = this.immortals.getProfile(identifier);
            if (tai) {
                return tai;
            }
        }
        // query from DIM network
        Messenger.getInstance().queryProfile(identifier);
        return profile;
    };

    //
    //  Relationship
    //

    Facebook.prototype.addContact = function(contact, user) {
        if (contact instanceof User) {
            contact = contact.identifier;
        }
        var list = this.loadContacts(user);
        if (list) {
            if (list.indexOf(contact) >= 0) {
                return false;
            }
            list.push(contact);
        } else {
            list = [contact];
        }
        return this.saveContacts(list, user);
    };

    Facebook.prototype.removeContact = function(contact, user) {
        if (contact instanceof User) {
            contact = contact.identifier;
        }
        var index = -1;
        var list = this.loadContacts(user);
        if (list) {
            index = list.indexOf(contact);
        }
        if (index < 0) {
            return false;
        }
        list.splice(index, 1);
        return this.saveContacts(list, user);
    };

    // Override
    Facebook.prototype.saveContacts = function (contacts, user) {
        if (user instanceof User) {
            user = user.identifier;
        }
        if (!this.cacheContacts(contacts, user)) {
            return false;
        }
        // save contacts of user into database
        var db = ContactTable.getInstance();
        return db.saveContacts(contacts, user);
    };

    // Override
    Facebook.prototype.loadContacts = function (user) {
        if (user instanceof User) {
            user = user.identifier;
        }
        // load contacts of user from database
        var db = ContactTable.getInstance();
        var list = db.loadContacts(user);
        if (list) {
            return list;
        } else {
            return [];
        }
    };

    Facebook.prototype.addMember = function (member, group) {
        if (member instanceof User) {
            member = member.identifier;
        }
        var list = this.loadMembers(group);
        if (list) {
            if (list.indexOf(member) >= 0) {
                return false;
            }
            list.push(member);
        } else {
            list = [member];
        }
        return this.saveMembers(list, group);
    };

    Facebook.prototype.removeMember = function (member, group) {
        if (member instanceof User) {
            member = member.identifier;
        }
        var index = -1;
        var list = this.loadMembers(group);
        if (list) {
            index = list.indexOf(member);
        }
        if (index < 0) {
            return false;
        }
        list = list.splice(index, 1);
        return this.saveMembers(list, group);
    };

    // Override
    Facebook.prototype.saveMembers = function (members, group) {
        if (group instanceof Group) {
            group = group.identifier;
        }
        if (!members || members.length < 1) {
            console.log('members should not be empty: ' + group);
            return false;
        }
        if (!this.cacheMembers(members, group)) {
            return false;
        }
        // save members of group into database
        var db = GroupTable.getInstance();
        return db.saveMembers(members, group);
    };

    // Override
    Facebook.prototype.loadMembers = function (group) {
        if (group instanceof Group) {
            group = group.identifier;
        }
        // load members of group from database
        var db = GroupTable.getInstance();
        var list = db.loadMembers(group);
        if (list) {
            return list;
        } else {
            return [];
        }
    };

    //
    //  GroupDataSource
    //

    // // Override
    // var getFounder = Facebook.prototype.getFounder;
    // Facebook.prototype.getFounder = function (group) {
    //     // TODO: get from database
    //     return getFounder.call(this, group);
    // };

    // // Override
    // var getOwner = Facebook.prototype.getOwner;
    // Facebook.prototype.getOwner = function (group) {
    //     // TODO: get from database
    //     return getOwner.call(this, group);
    // };

    //-------- namespace --------
    ns.Facebook = Facebook;

}(DIMP);
