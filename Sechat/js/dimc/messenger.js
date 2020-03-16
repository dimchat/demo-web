;
//! require <dimsdk.js>
//! require 'cache.js'
//! require 'facebook.js'

!function (ns) {
    'use strict';

    var SymmetricKey = ns.crypto.SymmetricKey;
    var ID = ns.ID;

    var ForwardContent = ns.protocol.ForwardContent;

    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var MetaCommand = ns.protocol.MetaCommand;
    var ProfileCommand = ns.protocol.ProfileCommand;
    var MuteCommand = ns.protocol.MuteCommand;
    var BlockCommand = ns.protocol.BlockCommand;

    var SearchCommand = ns.protocol.SearchCommand;
    var StorageCommand = ns.protocol.StorageCommand;

    var GroupCommand = ns.protocol.GroupCommand;
    var InviteCommand = ns.protocol.group.InviteCommand;
    var ResetCommand = ns.protocol.group.ResetCommand;

    var InstantMessage = ns.InstantMessage;
    var ReliableMessage = ns.ReliableMessage;

    var Facebook = ns.Facebook;
    var KeyStore = ns.KeyStore;

    var Messenger = ns.Messenger;

    var s_messenger = null;
    Messenger.getInstance = function () {
        if (!s_messenger) {
            s_messenger = new Messenger();
            s_messenger.entityDelegate = Facebook.getInstance();
            s_messenger.cipherKeyDelegate = KeyStore.getInstance();
            s_messenger.server = null; // current station connected
            // for duplicated querying
            s_messenger.metaQueryTime = {};    // ID -> Date
            s_messenger.profileQueryTime = {}; // ID -> Date
            s_messenger.groupQueryTime = {};   // ID -> Date
        }
        return s_messenger;
    };

    // check whether group info empty
    var is_empty = function (group) {
        var facebook = this.getFacebook();
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            return true;
        }
        var owner = facebook.getOwner(group);
        return !owner;
    };

    // check whether need to update group
    var check_group = function (content, sender) {
        // Check if it is a group message,
        // and whether the group members info needs update
        var facebook = this.getFacebook();
        var group = facebook.getIdentifier(content.getGroup());
        if (!group || group.isBroadcast()) {
            // 1. personal message
            // 2. broadcast message
            return false;
        }
        // check meta for new group ID
        var meta = facebook.getMeta(group);
        if (!meta) {
            // NOTICE: if meta for group not found,
            //         facebook should query it from DIM network automatically
            // TODO: insert the message to a temporary queue to wait meta
            //throw new NullPointerException("group meta not found: " + group);
            return true;
        }
        // query group info
        if (is_empty.call(this, group)) {
            // NOTICE: if the group info not found, and this is not an 'invite' command
            //         query group info from the sender
            if ((content instanceof InviteCommand) || (content instanceof ResetCommand)) {
                // FIXME: can we trust this stranger?
                //        may be we should keep this members list temporary,
                //        and send 'query' to the owner immediately.
                // TODO: check whether the members list is a full list,
                //       it should contain the group owner(owner)
                return false;
            } else {
                return this.queryGroupInfo(group, sender);
            }
        } else if (facebook.existsMember(sender, group)
            || facebook.existsAssistant(sender, group)
            || facebook.isOwner(sender, group)) {
            // normal membership
            return false;
        } else {
            var admins = [];
            // if assistants exists, query them
            var assistants = facebook.getAssistants(group);
            if (assistants) {
                for (var i = 0; i < assistants.length; ++i) {
                    admins.push(assistants[i]);
                }
            }
            // if owner found, query it too
            var owner = facebook.getOwner(group);
            if (owner && admins.indexOf(owner) < 0) {
                admins.push(owner);
            }
            return this.queryGroupInfo(group, admins);
        }
    };

    //
    //  Reuse message key
    //

    var encryptMessage = Messenger.prototype.encryptMessage;
    // Override
    Messenger.prototype.encryptMessage = function (iMsg) {
        var sMsg = encryptMessage.call(this, iMsg);

        var facebook = this.getFacebook();
        var env = iMsg.envelope;
        var receiver = facebook.getIdentifier(env.receiver);
        if (receiver.isGroup()) {
            var keyCache = this.cipherKeyDelegate;
            // reuse group message keys
            var sender = facebook.getIdentifier(env.sender);
            var key = keyCache.getCipherKey(sender, receiver);
            key['reused'] = true;
        }
        // TODO: reuse personal message key?

        return sMsg;
    };

    var encryptKey = Messenger.prototype.encryptKey;
    // Override
    Messenger.prototype.encryptKey = function(pwd, receiver, iMsg) {
        if (pwd['reused']) {
            // no need to encrypt reused key again
            return null;
        }
        return encryptKey.call(this, pwd, receiver, iMsg);
    };

    //
    //  Processing Message
    //

    // Override
    Messenger.prototype.saveMessage = function (iMsg) {
        var content = iMsg.content;
        // TODO: check message type
        //       only save normal message and group commands
        //       ignore 'Handshake', ...
        //       return true to allow responding

        if (content instanceof HandshakeCommand) {
            // handshake command will be processed by CPUs
            // no need to save handshake command here
            return true;
        }
        if (content instanceof MetaCommand) {
            // meta & profile command will be checked and saved by CPUs
            // no need to save meta & profile command here
            return true;
        }
        if (content instanceof MuteCommand || content instanceof BlockCommand) {
            // TODO: create CPUs for mute & block command
            // no need to save mute & block command here
            return true;
        }
        if (content instanceof SearchCommand) {
            // search result will be parsed by CPUs
            // no need to save search command here
            return true;
        }
        if (content instanceof ForwardContent) {
            // forward content will be parsed, if secret message decrypted, save it
            // no need to save forward content itself
            return true;
        }

        if (content instanceof InviteCommand) {
            // send keys again
            var facebook = this.getFacebook();
            var me = facebook.getIdentifier(iMsg.envelope.receiver);
            var group = facebook.getIdentifier(content.getGroup());
            var key = this.cipherKeyDelegate.getCipherKey(me, group);
            if (key) {
                delete key['reused'];
            }
        }

        // TODO: save instant message into database
        return true;
    };

    // Override
    Messenger.prototype.suspendMessage = function (msg) {
        if (msg instanceof InstantMessage) {
            // TODO: save this message in a queue waiting receiver's meta response

        } else if (msg instanceof ReliableMessage) {
            // TODO: save this message in a queue waiting sender's meta response

        }
    };

    // Override
    var process = Messenger.prototype.processInstantMessage;
    Messenger.prototype.processInstantMessage = function (msg) {
        var content = msg.content;
        var sender = msg.envelope.sender;
        sender = this.getFacebook().getIdentifier(sender);
        if (check_group.call(this, content, sender)) {
            // save this message in a queue to wait group meta response
            this.suspendMessage(msg);
            return null;
        }

        var iMsg = process.call(this, msg);
        if (!iMsg) {
            // respond nothing
            return null;
        }
        if (iMsg.content instanceof HandshakeCommand) {
            // urgent command
            return iMsg;
        }
        // if (iMsg.content instanceof ReceiptCommand) {
        //     var receiver = msg.envelope.sender;
        //     receiver = this.getFacebook().getIdentifier(receiver);
        //     if (NetworkType.Station.equals(receiver.getType())) {
        //         // no need to respond receipt to station
        //         return null;
        //     }
        // }

        // normal response
        this.sendMessage(iMsg, null, false);
        // DON'T respond to station directly
        return null;
    };

    //
    //  Sending message
    //

    /**
     *  Pack and send command to station
     *
     * @param cmd
     * @returns {boolean}
     */
    Messenger.prototype.sendCommand = function (cmd) {
        if (!this.server) {
            throw Error('server not connect');
        }
        return this.sendContent(cmd, this.server.identifier, null, false);
    };

    /**
     *  Pack and broadcast content to everyone
     *
     * @param content
     * @returns {boolean}
     */
    Messenger.prototype.broadcastContent = function (content) {
        content.setGroup(ID.EVERYONE);
        return this.sendContent(content, ID.ANYONE, null, false);
    };

    /**
     *  Broadcast profile to every contacts
     *
     * @param profile
     * @returns {boolean}
     */
    Messenger.prototype.broadcastProfile = function (profile) {
        var user = this.server.getCurrentUser();
        if (!user) {
            throw Error('login first');
        }
        var contacts = user.getContacts();
        if (!contacts || contacts.length === 0) {
            // throw Error('contacts not found');
            return false;
        }
        var facebook = Facebook.getInstance();
        var identifier = profile.getIdentifier();
        identifier = facebook.getIdentifier(identifier);
        var meta = facebook.getMeta(identifier);
        // pack and send profile to every contact
        var cmd = ProfileCommand.response(identifier, profile, meta);
        for (var i = 0; i < contacts.length; ++i) {
            this.sendContent(cmd, contacts[i], null, false);
        }
        return true;
    };

    Messenger.prototype.sendProfile = function (profile, receiver) {
        var facebook = this.getFacebook();
        var identifier = profile.getIdentifier();
        identifier = facebook.getIdentifier(identifier);
        var meta = facebook.getMeta(identifier);
        var cmd = ProfileCommand.response(identifier, profile, meta);
        return this.sendContent(cmd, receiver, null, false);
    };

    /**
     *  Post profile onto current station
     *
     * @param profile
     * @returns {boolean}
     */
    Messenger.prototype.postProfile = function (profile) {
        if (!this.server) {
            throw Error('server not connect');
        }
        return this.sendProfile(profile, this.server.identifier);
    };

    Messenger.prototype.postContacts = function (contacts) {
        var facebook = this.getFacebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw Error('login first');
        }
        // 1. generate password
        var pwd = SymmetricKey.generate(SymmetricKey.AES);
        // 2. encrypt contacts list as JSON data
        var data = ns.format.JSON.encode(contacts);
        data = pwd.encrypt(data);
        // 3. encrypt password with user's private key
        var key = pwd.toJSON();
        key = user.encrypt(key);
        // 4. pack 'storage' command
        var cmd = new StorageCommand(StorageCommand.CONTACTS);
        cmd.setIdentifier(user.identifier);
        cmd.setData(data);
        cmd.setKey(key);
        return this.sendCommand(cmd);
    };

    Messenger.prototype.queryContacts = function () {
        var facebook = this.getFacebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw Error('current user not found');
        }
        var cmd = new StorageCommand(StorageCommand.CONTACTS);
        cmd.setIdentifier(user.identifier);
        return this.sendCommand(cmd);
    };

    Messenger.prototype.queryMeta = function (identifier) {
        if (identifier.isBroadcast()) {
            return false;
        }
        // check for duplicated querying
        var now = new Date();
        var last = this.metaQueryTime[identifier];
        if (last && (now.getTime() - last.getTime()) < 30000) {
            return false;
        }
        this.metaQueryTime[identifier] = now;
        // query from DIM network
        var cmd = new MetaCommand(identifier);
        return this.sendCommand(cmd);
    };

    Messenger.prototype.queryProfile = function (identifier) {
        // check for duplicated querying
        var now = new Date();
        var last = this.profileQueryTime[identifier];
        if (last && (now.getTime() - last.getTime()) < 30000) {
            return false;
        }
        this.profileQueryTime[identifier] = now;
        // query from DIM network
        var cmd = new ProfileCommand(identifier);
        return this.sendCommand(cmd);
    };

    Messenger.prototype.queryGroupInfo = function (group, member) {
        // check for duplicated querying
        var now = new Date();
        var last = this.groupQueryTime[group];
        if (last && (now.getTime() - last.getTime()) < 30000) {
            return false;
        }
        this.groupQueryTime[group] = now;
        // query from any members
        var members;
        if (member instanceof Array) {
            members = member;
        } else {
            members = [member];
        }
        var cmd = GroupCommand.query(group);
        var checking = false;
        for (var i = 0; i < members.length; ++i) {
            if (this.sendContent(cmd, members[i], null, false)) {
                checking = true;
            }
        }
        return checking;
    };

    Messenger.prototype.queryOnlineUsers = function () {
        var cmd = new SearchCommand(SearchCommand.ONLINE_USERS);
        return this.sendCommand(cmd);
    };

    Messenger.prototype.searchUsers = function (keywords) {
        var cmd = new SearchCommand(keywords);
        return this.sendCommand(cmd);
    };

    Messenger.prototype.login = function (user) {
        if (!user) {
            var facebook = this.getFacebook();
            user = facebook.getCurrentUser();
            if (!user) {
                throw Error('user not found');
            }
        }
        if (user.equals(this.server.getCurrentUser())) {
            // user not change
            return true;
        }
        // clear session
        this.server.session = null;
        this.server.setCurrentUser(user);
        this.server.handshake(null);
        return true;
    };

    //-------- namespace --------
    ns.Messenger = Messenger;

}(DIMP);
