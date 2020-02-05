;
//! require <dimsdk.js>
//! require 'ans.js'

!function (ns) {
    'use strict';

    var AddressNameService = ns.AddressNameService;
    var Immortals = ns.Immortals;

    var Table = ns.db.Table;
    var PrivateTable = ns.db.PrivateTable;
    var MetaTable = ns.db.MetaTable;
    var ProfileTable = ns.db.ProfileTable;
    var UserTable = ns.db.UserTable;

    var Facebook = ns.Facebook;

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
            var db = Table.create(UserTable);
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
        var db = Table.create(UserTable);
        db.setCurrentUser(user.identifier);
        this.users = null;
    };

    Facebook.prototype.addUser = function(user) {
        var db = Table.create(UserTable);
        db.addUser(user.identifier);
        this.users = null;
    };
    Facebook.prototype.removeUser = function(user) {
        var db = Table.create(UserTable);
        db.removeUser(user.identifier);
        this.users = null;

    };

    Facebook.prototype.getUsername = function (identifier) {
        identifier = this.getIdentifier(identifier);
        var username = identifier.name;
        var nickname = this.getNickname(identifier);
        if (nickname != null && nickname.length > 0) {
            if (identifier.getType().isUser()) {
                if (username != null && username.length > 0) {
                    return nickname + " (" + username + ")";
                }
            }
            return nickname;
        } else if (username != null && username.length > 0) {
            return username;
        }
        // ID only contains address: BTC, ETH, ...
        return identifier.address.toString();
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
    //  Contacts
    //

    Facebook.prototype.addContact = function(contact, user) {
        // TODO: update contacts
    };
    Facebook.prototype.removeContact = function(contact, user) {
        // TODO: update contacts
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
        var db = Table.create(PrivateTable);
        db.savePrivateKey(key, identifier);
        return true;
    };
    // Override
    Facebook.prototype.loadPrivateKey = function (identifier) {
        var db = Table.create(PrivateTable);
        var key = db.loadPrivateKey(identifier);
        if (!key && identifier.getType().isPerson()) {
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
        var db = Table.create(MetaTable);
        db.saveMeta(meta, identifier);
        return true;
    };
    // Override
    Facebook.prototype.loadMeta = function(identifier) {
        if (identifier.isBroadcast()) {
            // broadcast ID has not meta
            return null;
        }
        var db = Table.create(MetaTable);
        var meta = db.loadMeta(identifier);
        if (!meta && identifier.getType().isPerson()) {
            meta = this.immortals.getMeta(identifier);
            if (meta) {
                return meta;
            }
        }
        // check for duplicated querying
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
        var db = Table.create(ProfileTable);
        db.saveProfile(profile, identifier);
        return true;
    };
    // Override
    Facebook.prototype.loadProfile = function(identifier) {
        var db = Table.create(ProfileTable);
        var profile = db.loadProfile(identifier);
        if (!profile && identifier.getType().isPerson()) {
            var tai = this.immortals.getProfile(identifier);
            if (tai) {
                return tai;
            }
        }
        // check for duplicated querying
        return profile;
    };

    //
    //  Relationship
    //

    // Override
    Facebook.prototype.saveContacts = function (contacts, user) {
        // TODO: update contacts into database
        return true;
    };

    // Override
    Facebook.prototype.loadContacts = function (user) {
        var contacts = null;
        // TODO: load contacts from database
        if (!contacts || contacts.length === 0) {
            // try immortals
            contacts = this.immortals.getContacts(user);
        }
        return contacts;
    };

    Facebook.prototype.addMember = function (member, group) {
        // TODO: update members of group
        return true;
    };

    Facebook.prototype.removeMember = function (member, group) {
        // TODO: update members of group
        return true;
    };

    // Override
    Facebook.prototype.saveMembers = function (members, group) {
        // TODO: load members of group from database
        return true;
    };

    // Override
    Facebook.prototype.loadMembers = function (group) {
        // TODO: save members of group into database
        return null;
    };

    //
    //  GroupDataSource
    //

    // Override
    var getFounder = Facebook.prototype.getFounder;
    Facebook.prototype.getFounder = function (group) {
        // TODO: get from database
        return getFounder.call(this, group);
    };

    // Override
    var getOwner = Facebook.prototype.getOwner;
    Facebook.prototype.getOwner = function (group) {
        // TODO: get from database
        return getOwner.call(this, group);
    };

    //-------- namespace --------
    ns.Facebook = Facebook;

}(DIMP);
