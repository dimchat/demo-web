
//
//  Conversation Cell for Main List (Table View)
//
!function (ns, tui, app, sdk) {
    'use strict';

    var Label = tui.Label;
    var Image = tui.Image;
    var Button = tui.Button;
    var TableViewCell = tui.TableViewCell;

    var Class                = sdk.type.Class;
    var NotificationCenter   = sdk.lnc.NotificationCenter;
    var NotificationObserver = sdk.lnc.Observer;
    var NotificationNames    = app.NotificationNames;

    var get_facebook = function () {
        return app.GlobalVariable.getFacebook();
    };
    // var get_messenger = function () {
    //     return app.GlobalVariable.getMessenger();
    // };
    var get_message_db = function () {
        return app.GlobalVariable.getDatabase();
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
    Class(MainTableViewCell, TableViewCell, [NotificationObserver], null);
    // MainTableViewCell.prototype = Object.create(TableViewCell.prototype);
    // MainTableViewCell.prototype.constructor = MainTableViewCell;

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
        return this;
    };

    MainTableViewCell.prototype.onEnter = function () {
        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, NotificationNames.NewMessageDancing);
    };

    MainTableViewCell.prototype.onExit = function () {
        var nc = NotificationCenter.getInstance();
        nc.removeObserver(this, NotificationNames.NewMessageDancing);
    };

    MainTableViewCell.prototype.onReceiveNotification = function (notification) {
        var name = notification.getName();
        var userInfo = notification.getUserInfo();
        if (name === NotificationNames.NewMessageDancing) {
            var dancing = userInfo['dancing'];
            var flag = dancing[this.__identifier];
            if (flag) {
                this.dancing();
            } else {
                this.stopDancing();
            }
        }
        // FIXME:
        remove_zombie.call(this);
    };

    // private
    MainTableViewCell.prototype.dancing = function () {
        // dancing animation
        var img = this.avatarImage;
        if (img.__ie.style.visibility === 'hidden') {
            img.__ie.style.visibility = 'visible';
        } else {
            img.__ie.style.visibility = 'hidden';
        }
    };

    // private
    MainTableViewCell.prototype.stopDancing = function () {
        var img = this.avatarImage;
        img.__ie.style.visibility = 'visible';
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

    var remove_zombie = function () {
        if (is_zombie(this.__ie)) {
            console.warn('remove zombie', this, this.__ie);
            this.onExit();
            // this.remove();
        }
    };
    var is_zombie = function (ie) {
        var parent = ie.parentNode;
        if (!parent) {
            return true;
        } else if (parent === document.body) {
            return false;
        } else if (parent === document) {
            return false;
        }
        return is_zombie(parent);
    };

    //-------- namespace --------
    ns.MainTableViewCell = MainTableViewCell;

}(dicq, tarsier.ui, SECHAT, DIMP);
