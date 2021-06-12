;
//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;
    var ForwardContent = sdk.protocol.ForwardContent;
    var HandshakeCommand = sdk.protocol.HandshakeCommand;
    var ReceiptCommand = sdk.protocol.ReceiptCommand;
    var LoginCommand = sdk.protocol.LoginCommand;
    var MetaCommand = sdk.protocol.MetaCommand;
    var MuteCommand = sdk.protocol.MuteCommand;
    var BlockCommand = sdk.protocol.BlockCommand;
    var InviteCommand = sdk.protocol.group.InviteCommand;
    var QueryCommand = sdk.protocol.group.QueryCommand;

    var ReportCommand = ns.protocol.ReportCommand;
    var SearchCommand = ns.protocol.SearchCommand;

    var NotificationCenter = sdk.lnc.NotificationCenter;

    var get_messenger = function () {
        return ns.Messenger.getInstance();
    };
    var get_facebook = function () {
        return ns.Facebook.getInstance();
    };

    var get_clerk = function () {
        return ns.Amanuensis;
    };

    /**
     *  Message DataSource
     *  ~~~~~~~~~~~~~~~~~~
     *
     *  implements Messenger.DataSource, Observer
     */
    var MessageDataSource = {

        onReceiveNotification: function (notification) {
            var name = notification.name;
            if (name !== ns.kNotificationMetaAccepted && name !== ns.kNotificationDocumentUpdated) {
                return;
            }
            var info = notification.userInfo;
            var messenger = get_messenger();
            var facebook = get_facebook();

            var entity = ID.parse(info['ID']);
            if (entity.isUser()) {
                // check user
                if (!facebook.getPublicKeyForEncryption(entity)) {
                    console.error('user not ready yet: ' + entity);
                    return;
                }
            }
            // processing income messages
            var incoming = this.__incoming[entity];
            if (incoming) {
                delete this.__incoming[entity];
                var item, res;
                for (var i = 0; i < incoming.length; ++i) {
                    item = incoming[i];
                    res = messenger.processReliableMessage(item);
                    if (res) {
                        messenger.sendReliableMessage(res, null, 1);
                    }
                }
            }
            // processing outgoing message
            var outgoing = this.__outgoing[entity];
            if (outgoing) {
                delete this.__outgoing[entity];
                for (var j = 0; j < outgoing.length; ++j) {
                    messenger.sendInstantMessage(outgoing[j], null, 1);
                }
            }
        },

        //
        //  Messenger DataSource
        //
        saveMessage: function (iMsg) {
            var content = iMsg.getContent();
            // TODO: check message type
            //       only save normal message and group commands
            //       ignore 'Handshake', ...
            //       return true to allow responding

            if (content instanceof HandshakeCommand) {
                // handshake command will be processed by CPUs
                // no need to save handshake command here
                return true;
            }
            if (content instanceof ReportCommand) {
                // report command is sent to station,
                // no need to save report command here
                return true;
            }
            if (content instanceof LoginCommand) {
                // login command will be processed by CPUs
                // no need to save login command here
                return true;
            }
            if (content instanceof MetaCommand) {
                // meta & document command will be checked and saved by CPUs
                // no need to save meta & document command here
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
                var me = iMsg.getReceiver();
                var group = content.getGroup();
                var messenger = get_messenger();
                var key = messenger.getCipherKeyDelegate().getCipherKey(me, group, false);
                if (key != null) {
                    //key.put("reused", null);
                    key.remove("reused");
                }
            }
            if (content instanceof QueryCommand) {
                // FIXME: same query command sent to different members?
                return true;
            }

            if (content instanceof ReceiptCommand) {
                return get_clerk().saveReceipt(iMsg);
            } else {
                return get_clerk().saveMessage(iMsg);
            }
        },

        suspendInstantMessage: function (iMsg) {
            // save this message in a queue waiting receiver's meta response
            var waiting = ID.parse(iMsg.getValue("waiting"));
            if (waiting == null) {
                waiting = iMsg.getGroup();
                if (waiting == null) {
                    waiting = iMsg.getSender();
                }
            } else {
                iMsg.remove("waiting");
            }
            var list = this.__outgoing[waiting];
            if (!list) {
                list = [];
                this.__outgoing[waiting] = list;
            }
            list.push(iMsg);
        },

        suspendReliableMessage: function (rMsg) {
            // save this message in a queue waiting sender's meta response
            var waiting = ID.parse(rMsg.getValue("waiting"));
            if (!waiting) {
                waiting = rMsg.getGroup();
                if (waiting == null) {
                    waiting = rMsg.getSender();
                }
            } else {
                rMsg.remove("waiting");
            }
            var list = this.__incoming[waiting];
            if (!list) {
                list = [];
                this.__incoming[waiting] = list;
            }
            list.push(rMsg);
        },

        __outgoing: {},  // ID => Array<InstantMessage>
        __incoming: {}  // ID => Array<ReliableMessage>
    };

    var nc = NotificationCenter.getInstance();
    nc.addObserver(MessageDataSource, ns.kNotificationMetaAccepted);
    nc.addObserver(MessageDataSource, ns.kNotificationDocumentUpdated);

    ns.MessageDataSource = MessageDataSource;

})(SECHAT, DIMSDK);
