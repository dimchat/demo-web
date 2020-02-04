;
//! require <dimsdk.js>
//! require 'cache.js'
//! require 'facebook.js'

!function (ns) {
    'use strict';

    var SymmetricKey = ns.crypto.SymmetricKey;
    var ID = ns.ID;

    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var MetaCommand = ns.protocol.MetaCommand;
    var ProfileCommand = ns.protocol.ProfileCommand;
    var MuteCommand = ns.protocol.MuteCommand;
    var BlockCommand = ns.protocol.BlockCommand;

    var SearchCommand = ns.protocol.SearchCommand;
    var StorageCommand = ns.protocol.StorageCommand;

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
        }
        return s_messenger;
    };

    //
    //  Processing Message
    //

    // Override
    Messenger.prototype.saveMessage = function (msg) {
        var content = msg.content;
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
    var process = Messenger.prototype.process;
    Messenger.prototype.process = function (msg) {
        var res = process.call(this, msg);
        if (!res) {
            // respond nothing
            return null;
        }
        if (res instanceof HandshakeCommand) {
            // urgent command
            return res;
        }
        // normal response
        var facebook = this.getFacebook();
        var receiver = msg.envelope.sender;
        receiver = facebook.getIdentifier(receiver);
        this.sendContent(res, receiver);
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
        return this.sendContent(cmd, this.server.identifier);
    };

    /**
     *  Pack and broadcast content to everyone
     *
     * @param content
     * @returns {boolean}
     */
    Messenger.prototype.broadcastContent = function (content) {
        content.setGroup(ID.EVERYONE);
        return this.sendContent(content, ID.ANYONE);
    };

    /**
     *  Broadcast profile to every contacts
     *
     * @param profile
     * @returns {boolean}
     */
    Messenger.prototype.broadcastProfile = function (profile) {
        var facebook = this.getFacebook();
        var user = this.server.getCurrentUser();
        if (!user) {
            throw Error('login first');
        }
        var contacts = user.getContacts();
        if (!contacts || contacts.length === 0) {
            // throw Error('contacts not found');
            return false;
        }
        var identifier = profile.getIdentifier();
        identifier = facebook.getIdentifier(identifier);
        var meta = facebook.getMeta(identifier);
        // pack and send profile to every contact
        var cmd = ProfileCommand.response(identifier, profile, meta);
        for (var i = 0; i < contacts.length; ++i) {
            this.sendContent(cmd, contacts[i]);
        }
        return true;
    };

    /**
     *  Post profile onto current station
     *
     * @param profile
     * @returns {boolean}
     */
    Messenger.prototype.postProfile = function (profile) {
        var facebook = this.getFacebook();
        var identifier = profile.getIdentifier();
        identifier = facebook.getIdentifier(identifier);
        var meta = facebook.getMeta(identifier);
        var cmd = ProfileCommand.response(identifier, profile, meta);
        return this.sendCommand(cmd);
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
        var cmd = new MetaCommand(identifier);
        return this.sendCommand(cmd);
    };

    Messenger.prototype.queryProfile = function (identifier) {
        if (identifier.isBroadcast()) {
            return false;
        }
        var cmd = new ProfileCommand(identifier);
        return this.sendCommand(cmd);
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
