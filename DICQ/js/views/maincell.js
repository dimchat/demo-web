
//
//  Conversation Cell for Main List (Table View)
//
!function (ns, tui, dimp) {
    'use strict';

    var Label = tui.Label;
    var Image = tui.Image;
    var Button = tui.Button;
    var TableViewCell = tui.TableViewCell;

    var NotificationCenter = dimp.stargate.NotificationCenter;
    var MessageTable = dimp.db.MessageTable;

    var Facebook = dimp.Facebook;

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
        // var number = facebook.getNumberString(identifier);
        var label = new Label();
        label.setClassName('name');
        this.appendChild(label);
        this.nameLabel = label;

        this.__identifier = null;
    };
    MainTableViewCell.prototype = Object.create(TableViewCell.prototype);
    MainTableViewCell.prototype.constructor = MainTableViewCell;

    MainTableViewCell.prototype.setIdentifier = function (identifier) {
        var facebook = Facebook.getInstance();
        if (facebook.getPrivateKeyForSignature(identifier)) {
            this.setClassName('me');
        }
        var profile = facebook.getProfile(identifier);

        // avatar
        var image;
        if (identifier.isUser()) {
            image = profile.getProperty('avatar');
        } else {
            // TODO: build group logo
            image = null;
        }
        if (!image) {
            image = 'http://apps.dim.chat/DICQ/images/icon-512.png';
        }
        if (image) {
            this.avatarImage.setSrc(image);
        }

        // name
        var nickname = facebook.getNickname(identifier);
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
        var nc = NotificationCenter.getInstance();
        var name = notification.name;
        if (name === nc.kNotificationMessageReceived) {
            var msg = notification.userInfo;
            check_unread_msg.call(this, msg);
        }
    };

    MainTableViewCell.prototype.onEnter = function () {
        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, nc.kNotificationMessageReceived);
    };

    MainTableViewCell.prototype.onExit = function () {
        var nc = NotificationCenter.getInstance();
        nc.removeObserver(this, nc.kNotificationMessageReceived);
        this.stopDancing();
    };

    var check_unread_msg = function (msg) {
        var identifier = this.__identifier;
        if (msg) {
            if (identifier.isGroup()) {
                if (!identifier.equals(msg.content.getGroup())) {
                    return false;
                }
            } else if (identifier.isUser()) {
                if (!identifier.equals(msg.envelope.sender)) {
                    return false;
                }
                if (msg.content.getGroup()) {
                    return false;
                }
            }
        } else {
            var db = MessageTable.getInstance();
            var cnt = db.getMessageCount(this.__identifier);
            if (cnt < 1) {
                return false;
            }
            msg = db.getMessage(cnt-1, this.__identifier);
            if (!msg) {
                return false;
            }
            if (msg.envelope.getValue('read')) {
                return false;
            }
        }
        this.startDancing();
        return true;
    };
    var clear_unread_msg = function (msg) {
        var identifier = this.__identifier;
        if (!msg) {
            var db = MessageTable.getInstance();
            var cnt = db.getMessageCount(identifier);
            if (cnt < 1) {
                return ;
            }
            msg = db.getMessage(cnt-1, identifier);
            if (!msg) {
                return ;
            }
        }
        // TODO: save read status into message database
        msg.envelope.setValue('read', true);
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

}(dicq, tarsier.ui, DIMP);
