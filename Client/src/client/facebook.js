;
//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;
    var Visa = sdk.protocol.Visa;

    var NotificationCenter = sdk.lnc.NotificationCenter;

    var CommonFacebook = ns.CommonFacebook;

    var get_messenger = function () {
        return ns.Messenger.getInstance();
    };

    var Facebook = function () {
        CommonFacebook.call(this);
    };
    sdk.Class(Facebook, CommonFacebook, null);

    Facebook.prototype.getAvatar = function (identifier) {
        var avatar = null;
        var doc = this.getDocument(identifier, '*');
        if (doc) {
            if (sdk.Interface.conforms(doc, Visa)) {
                avatar = doc.getAvatar();
            } else {
                avatar = doc.getProperty('avatar');
            }
        }
        if (avatar) {
            var ftp = ns.network.FtpServer;
            return ftp.downloadAvatar(avatar, identifier);
        } else {
            return null;
        }
    };

    Facebook.prototype.saveMeta = function(meta, identifier) {
        if (!CommonFacebook.prototype.saveMeta.call(this, meta, identifier)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMetaAccepted, this, {
            'ID': identifier,
            'meta': meta
        });
        return true;
    };

    Facebook.prototype.saveDocument = function(doc) {
        if (!CommonFacebook.prototype.saveDocument.call(this, doc)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationDocumentUpdated, this, doc.getMap());
        return true;
    };

    //
    //  Contacts
    //
    Facebook.prototype.addContact = function(contact, user) {
        if (!CommonFacebook.prototype.addContact.call(this, contact, user)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationContactsUpdated, this, {
            'user': user,
            'contact': contact,
            'action': 'add'
        });
        return true;
    };
    Facebook.prototype.removeContact = function(contact, user) {
        if (!CommonFacebook.prototype.removeContact.call(this, contact, user)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationContactsUpdated, this, {
            'user': user,
            'contact': contact,
            'action': 'remove'
        });
        return true;
    };

    //
    //  Group
    //
    Facebook.prototype.addMember = function (member, group) {
        if (!CommonFacebook.prototype.addMember.call(this, member, group)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMembersUpdated, this, {
            'group': group,
            'member': member,
            'action': 'add'
        });
        return true;
    };
    Facebook.prototype.removeMember = function (member, group) {
        if (!CommonFacebook.prototype.removeMember.call(this, member, group)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMembersUpdated, this, {
            'group': group,
            'member': member,
            'action': 'remove'
        });
        return true;
    };
    Facebook.prototype.saveMembers = function (members, group) {
        if (!CommonFacebook.prototype.saveMembers.call(this, members, group)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationMembersUpdated, this, {
            'group': group,
            'members': members,
            'action': 'update'
        });
        return true;
    };
    Facebook.prototype.removeGroup = function (group) {
        if (!CommonFacebook.prototype.removeGroup.call(this, group)) {
            return false;
        }
        var nc = NotificationCenter.getInstance();
        nc.postNotification(ns.kNotificationGroupRemoved, this, {
            'group': group,
            'action': 'remove'
        });
        return true;
    };

    //
    //  Entity DataSource
    //
    Facebook.prototype.getMeta = function(identifier) {
        var meta = CommonFacebook.prototype.getMeta.call(this, identifier);
        if (!meta) {
            if (identifier.isBroadcast()) {
                // broadcast ID has no meta
                return null;
            }
            // query from DIM network
            setTimeout(function () {
                get_messenger().queryMeta(identifier);
            }, 512);
        }
        return meta;
    };

    Facebook.prototype.getDocument = function(identifier, type) {
        var doc = CommonFacebook.prototype.getDocument.call(this, identifier, type);
        if (!doc || this.isExpiredDocument(doc, true)) {
            if (identifier.isBroadcast()) {
                // broadcast ID has no document
                return null;
            }
            // query from DIM network
            setTimeout(function () {
                get_messenger().queryDocument(identifier, type);
            }, 512);
        }
        return doc;
    };

    //
    //  User DataSource
    //
    Facebook.prototype.getContacts = function (user) {
        var contacts = CommonFacebook.prototype.getContacts.call(this, user);
        if (!contacts || contacts.length === 0) {
            // TODO: get default contacts
        }
        return contacts;
    };

    //
    //  Group DataSource
    //
    Facebook.prototype.getMembers = function (group) {
        var members = CommonFacebook.prototype.getMembers.call(this, group);
        if (!members || members.length === 0) {
            // TODO: query from group assistants
            console.log('querying members', group);
            var gm = new ns.GroupManager(group);
            gm.query();
        }
        return members;
    };

    Facebook.prototype.getAssistants = function (group) {
        var assistants = [
            // desktop.dim.chat
            'assistant@4WBSiDzg9cpZGPqFrQ4bHcq4U5z9QAQLHS',
            // dev
            'assistant@2PpB6iscuBjA15oTjAsiswoX9qis5V3c1Dq'
        ];
        return ID.convert(assistants);
    };

    var s_facebook = null;
    Facebook.getInstance = function () {
        if (!s_facebook) {
            s_facebook = new Facebook();
        }
        return s_facebook;
    };

    //-------- namespace --------
    ns.Facebook = Facebook;

})(SECHAT, DIMSDK);
