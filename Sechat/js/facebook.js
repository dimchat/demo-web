
//! require 'ans.js'

var Facebook = function () {
    DIMP.Facebook.call(this);
    // ANS
    this.ans = new AddressNameService();
    // built-in accounts
    this.immortals = new DIMP.Immortals();
};
Facebook.inherits(DIMP.Facebook);

var s_facebook = null;

Facebook.getInstance = function () {
    if (!s_facebook) {
        s_facebook = new Facebook();
    }
    return s_facebook;
};

//
//  Local Users
//

// Override
Facebook.prototype.getLocalUsers = function() {
    // TODO: get local users from database
    return null;
};

// Override
Facebook.prototype.getCurrentUser = function() {
    return DIMP.Facebook.prototype.getCurrentUser.call(this);
};

Facebook.prototype.setCurrentUser = function(user) {
    // TODO: update local users into database
};

Facebook.prototype.addUser = function(user) {
    // TODO: update local users into database
};
Facebook.prototype.removeUser = function(user) {
    // TODO: update local users into database
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
    string = string.substring(str.length - 10);
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
    if (!this.verifyPrivateKey(key, identifier)) {
        // private key not match meta.key
        return false;
    }
    // TODO: save private key for user
    return true;
};
// Override
Facebook.prototype.loadPrivateKey = function (identifier) {
    var key = null;
    // TODO: load private key for user

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
    if (!this.verifyMeta(meta, identifier)) {
        // meta not match ID
        return false;
    }
    // TODO: save meta into database
    return true;
};
// Override
Facebook.prototype.loadMeta = function(identifier) {
    if (identifier.isBroadcast()) {
        // broadcast ID has not meta
        return null;
    }
    var meta = null;
    // TODO: load meta from database

    if (!meta && identifier.getType().isPerson()) {
        meta = this.immortals.getMeta(identifier);
        if (meta) {
            return meta;
        }
    }
    // check for duplicated querying
    return null
};

//
//  Profile
//

// Override
Facebook.prototype.saveProfile = function(profile, identifier) {
    if (!this.verifyProfile(profile, identifier)) {
        // profile's signature not match
        return false;
    }
    // TODO: save profile into database
    return true;
};
// Override
Facebook.prototype.loadProfile = function(identifier) {
    var profile = null;
    // TODO: load profile from database
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
Facebook.prototype.getFounder = function (group) {
    // TODO: get from database
    return DIMP.Facebook.prototype.getFounder.call(this, group);
};

// Override
Facebook.prototype.getOwner = function (group) {
    // TODO: get from database
    return DIMP.Facebook.prototype.getOwner.call(this, group);
};
