
//
//  Conversation Cell for Main List (Table View)
//
!function (ns, tui, app, sdk) {
    'use strict';

    var Label = tui.Label;
    var Image = tui.Image;
    var Button = tui.Button;
    var TableViewCell = tui.TableViewCell;

    var NotificationCenter = sdk.lnc.NotificationCenter;
    var NotificationNames = app.NotificationNames;

    var get_facebook = function () {
        return app.GlobalVariable.getInstance().facebook;
    };

    var get_message_db = function () {
        return app.db.MessageTable;
    };

    var MainTableViewCell = function (cell) {
        TableViewCell.call(this, cell);
        cell = this;

        var button = new Button();
        button.setClassName('avatarBtn');
        button.onClick = function (ev) {
            var identifier = cell.__identifier;
            if (identifier.isUser()) {
                ns.PersonalChatWindow.show(identifier);
            } else {
                ns.GroupChatWindow.show(identifier);
            }
            clear_unread_msg.call(cell);
        };
        this.appendChild(button);

        //
        //  Avatar
        //
        var img = new Image();
        img.setClassName('avatarImg');
        button.appendChild(img);
        this.avatarImage = img;

        //
        //  Name(Number)
        //
        // var number = Anonymous.getNumberString(identifier);
        var label = new Label();
        label.setClassName('name');
        this.appendChild(label);
        this.nameLabel = label;

        this.__identifier = null;
    };
    MainTableViewCell.prototype = Object.create(TableViewCell.prototype);
    MainTableViewCell.prototype.constructor = MainTableViewCell;

    MainTableViewCell.prototype.setIdentifier = function (identifier) {
        var facebook = get_facebook();
        if (facebook.getPrivateKeyForSignature(identifier)) {
            this.setClassName('me');
        }

        // avatar
        var image = null;
        if (identifier.isUser()) {
            var doc = facebook.getDocument(identifier, '*');
            if (doc) {
                image = doc.getProperty('avatar');
            }
        } else {
            // TODO: build group logo
        }
        if (!image) {
            image = 'http://apps.dim.chat/DICQ/images/icon-512.png';
        }
        if (image) {
            this.avatarImage.setSrc(image);
        }

        // name
        var nickname = facebook.getName(identifier);
        if (!nickname) {
            nickname = identifier.name;
        }
        this.nameLabel.setText(nickname);

        // conversation ID
        this.__identifier = identifier;
        // check for dancing
        this.__ti = 0;
        check_unread_msg.call(this);
        return this;
    };

    MainTableViewCell.prototype.onReceiveNotification = function (notification) {
        var name = notification.name;
        var userInfo = notification.userInfo;
        if (name === NotificationNames.MessageUpdated) {
            var msg = userInfo['msg'];
            check_unread_msg.call(this, msg);
        }
    };

    MainTableViewCell.prototype.onEnter = function () {
        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, NotificationNames.MessageUpdated);
    };

    MainTableViewCell.prototype.onExit = function () {
        var nc = NotificationCenter.getInstance();
        nc.removeObserver(this, NotificationNames.MessageUpdated);
        this.stopDancing();
    };

    var check_unread_msg = function (msg) {
        var identifier = this.__identifier;
        if (msg) {
            if (identifier.isGroup()) {
                if (!identifier.equals(msg.getGroup())) {
                    return false;
                }
            } else if (identifier.isUser()) {
                if (!identifier.equals(msg.getSender())) {
                    return false;
                }
                if (msg.getGroup()) {
                    return false;
                }
            }
        } else {
            var db = get_message_db();
            var cnt = db.numberOfMessages(this.__identifier);
            if (cnt < 1) {
                return false;
            }
            msg = db.messageAtIndex(cnt-1, this.__identifier);
            if (!msg) {
                return false;
            }
            if (msg.getEnvelope().getValue('read')) {
                return false;
            }
        }
        this.startDancing();
        return true;
    };
    var clear_unread_msg = function (msg) {
        var identifier = this.__identifier;
        if (!msg) {
            var db = get_message_db();
            var cnt = db.numberOfMessages(identifier);
            if (cnt < 1) {
                return ;
            }
            msg = db.messageAtIndex(cnt-1, identifier);
            if (!msg) {
                return ;
            }
        }
        // TODO: save read status into message database
        msg.getEnvelope().setValue('read', true);
        this.stopDancing();
    };

    MainTableViewCell.prototype.startDancing = function () {
        this.stopDancing();
        var img = this.avatarImage;
        this.__ti = setInterval(function () {
            // TODO: dancing animation
            if (img.__ie.style.visibility === 'hidden') {
                img.__ie.style.visibility = 'visible';
            } else {
                img.__ie.style.visibility = 'hidden';
            }
        }, 500);
    };
    MainTableViewCell.prototype.stopDancing = function () {
        if (this.__ti) {
            clearInterval(this.__ti);
            this.__ti = 0;
        }
        var img = this.avatarImage;
        img.__ie.style.visibility = 'visible';
    };

    //-------- namespace --------
    ns.MainTableViewCell = MainTableViewCell;

}(dicq, tarsier.ui, SECHAT, DIMP);
