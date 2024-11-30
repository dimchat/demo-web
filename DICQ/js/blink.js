
!function (ns, tui, app, sdk) {
    'use strict';

    var Class                = sdk.type.Class;
    var HashSet              = sdk.type.HashSet;
    var Ticker               = sdk.fsm.threading.Ticker;
    var NotificationCenter   = sdk.lnc.NotificationCenter;
    var NotificationObserver = sdk.lnc.Observer;
    var NotificationNames    = app.NotificationNames;

    NotificationNames.NewMessageDancing = 'NewMessageDancing';

    var get_message_db = function () {
        return app.GlobalVariable.getDatabase();
    };

    var NewMessageController = function () {
        this.__entities = new HashSet();
        // notification
        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, NotificationNames.MessageUpdated);
        // ticker
        var clock = sdk.fsm.threading.PrimeMetronome;
        clock.addTicker(this);
        this.__elapsed = 0;
    };
    Class(NewMessageController, null, [Ticker, NotificationObserver], null);

    // Override
    NewMessageController.prototype.onReceiveNotification = function (notification) {
        var name = notification.getName();
        var userInfo = notification.getUserInfo();
        if (name === NotificationNames.MessageUpdated) {
            var entity = userInfo['ID'];
            if (!entity) {
                var msg = userInfo['msg'];
                entity = msg.getGroup();
                if (!entity) {
                    entity = msg.getReceiver();
                }
            }
            this.__entities.add(entity);
        }
    };

    // Override
    NewMessageController.prototype.tick = function (now, elapsed) {
        this.__elapsed += elapsed;
        if (this.__elapsed > 512) {
            this.__elapsed = 0;
            check_dancing.call(this);
        }
    };

    var check_dancing = function () {
        var entities = this.__entities.toArray();
        var receiver;      // ID
        var unread;        // Boolean
        var dancing = {};  // Map<ID, Boolean>
        for (var i = entities.length - 1; i >= 0; --i) {
            receiver = entities[i];
            unread = check_unread_msg(receiver);
            if (!unread) {
                this.__entities.remove(receiver);
            }
            dancing[receiver] = unread;
        }
        // notify
        var nc = NotificationCenter.getInstance();
        nc.postNotification(NotificationNames.NewMessageDancing, this, {
            'dancing': dancing
        });
    };

    var check_unread_msg = function (entity) {
        var db = get_message_db();
        var cnt = db.numberOfMessages(entity);
        if (cnt < 1) {
            return false;
        }
        var msg = db.messageAtIndex(cnt - 1, entity);
        var read = msg.getBoolean('read', false);
        return !read;
    };

    //-------- namespace --------
    ns.NewMessageController = new NewMessageController();

}(dicq, tarsier.ui, SECHAT, DIMP);
