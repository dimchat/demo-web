;

//! require 'table.js'

!function (ns) {
    'use strict';

    var Profile = ns.Profile;

    var Facebook = ns.Facebook;
    var NotificationCenter = ns.stargate.NotificationCenter;

    var Table = ns.db.Table;

    var save_profiles = function (map) {
        return Table.save(map, ProfileTable);
    };
    var load_profiles = function () {
        var profiles = {};
        var map = Table.load(ProfileTable);
        if (map) {
            var facebook = Facebook.getInstance();
            var user, profile;
            var list = Object.keys(map);
            for (var i = 0; i < list.length; ++i) {
                user = list[i];
                profile = map[user];
                user = facebook.getIdentifier(user);
                profile = Profile.getInstance(profile);
                if (user && profile) {
                    profiles[user] = profile;
                }
            }
        }
        return profiles;
    };

    var ProfileTable = function () {
        this.profiles = null;
    };

    ProfileTable.prototype.loadProfile = function (identifier) {
        if (!this.profiles) {
            this.profiles = load_profiles();
        }
        return this.profiles[identifier];
    };
    ProfileTable.prototype.saveProfile = function (profile, identifier) {
        this.loadProfile(identifier);
        this.profiles[identifier] = profile;
        console.log('saving profile for ' + identifier);
        var nc = NotificationCenter.getInstance();
        if (save_profiles(this.profiles)) {
            nc.postNotification(nc.kNotificationProfileUpdated, this, profile);
            return true;
        } else {
            var text = 'failed to save profile: '
                + profile.getIdentifier() + ' -> '
                + profile.getValue('data');
            console.log(text);
            return false;
        }
    };

    ProfileTable.getInstance = function () {
        return Table.create(ProfileTable);
    };

    //-------- namespace --------
    ns.db.ProfileTable = ProfileTable;

}(DIMP);
