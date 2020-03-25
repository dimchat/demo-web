
!function (ns, tui, dimp) {
    'use strict';

    var $ = tui.$;

    var Rect = tui.Rect;

    var FieldSet = tui.FieldSet;

    var Label = tui.Label;
    var Button = tui.Button;
    var Window = tui.Window;

    var Facebook = dimp.Facebook;

    var UserWindow = function () {
        var frame = new Rect(0, 0, 320, 240);
        Window.call(this, frame);
        this.setId('userWindow');
        this.setClassName('userWindow');
        this.setTitle('User Info');

        this.__identifier = null;

        var basic = new FieldSet();
        basic.setClassName('profileFieldSet');
        basic.setCaption('Basic Info');
        this.appendChild(basic);

        // address
        var addressLabel = new Label();
        addressLabel.setClassName('addressLabel');
        addressLabel.setText('Address:');
        basic.appendChild(addressLabel);
        // value
        var address = new Label();
        address.setClassName('address');
        basic.appendChild(address);
        this.address = address;

        // search number
        var numberLabel = new Label();
        numberLabel.setClassName('numberLabel');
        numberLabel.setText('Number:');
        basic.appendChild(numberLabel);
        // value
        var number = new Label();
        number.setClassName('number');
        basic.appendChild(number);
        this.number = number;

        // nickname
        var nameLabel = new Label();
        nameLabel.setClassName('nicknameLabel');
        nameLabel.setText('Name:');
        basic.appendChild(nameLabel);
        // value
        var nickname = new Label();
        nickname.setClassName('nickname');
        basic.appendChild(nickname);
        this.nickname = nickname;

        // button
        var button = new Button();
        button.setClassName('OK');
        button.setText('OK');
        var win = this;
        button.onClick = function (ev) {
            win.go(win.__identifier);
        };
        this.appendChild(button);
        this.button = button;
    };
    dimp.Class(UserWindow, Window, null);

    UserWindow.prototype.setIdentifier = function (identifier) {
        if (!identifier || !identifier.isUser()) {
            throw TypeError('ID error: ' + identifier);
        }
        var facebook = Facebook.getInstance();
        this.__identifier = identifier;
        this.address.setText(identifier.address);
        this.address.__ie.title = identifier;
        this.number.setText(facebook.getNumberString(identifier));
        this.nickname.setText(facebook.getNickname(identifier));
        // check contacts
        var user = facebook.getCurrentUser();
        var contacts = facebook.getContacts(user.identifier);
        if (contacts && contacts.indexOf(identifier) >= 0) {
            this.button.setText('Chat');
        } else {
            this.button.setText('Add');
        }
    };

    UserWindow.prototype.go = function (identifier) {
        if (!identifier) {
            throw Error('ID error: ' + identifier);
        }
        // check contacts
        var facebook = Facebook.getInstance();
        var user = facebook.getCurrentUser();
        var contacts = facebook.getContacts(user.identifier);
        if (contacts && contacts.indexOf(identifier) >= 0) {
            ns.PersonalChatWindow.show(identifier);
            this.remove();
        } else {
            contacts.push(identifier);
            if (facebook.saveContacts(contacts, user.identifier)) {
                this.button.setText('Chat');
            } else {
                throw Error('Failed to add contact: ' + identifier);
            }
        }
    };

    UserWindow.show = function (identifier) {
        var box = null;
        var elements = document.getElementsByClassName('userWindow');
        if (elements) {
            var item;
            for (var i = 0; i < elements.length; ++i) {
                item = $(elements[i]);
                if (identifier.equals(item.__identifier)) {
                    box = item;
                }
            }
        }
        if (!box) {
            box = new UserWindow();
            $(document.body).appendChild(box);
            // adjust position
            var point = tui.getRandomPosition(box.getSize());
            box.setOrigin(point);
            box.setIdentifier(identifier);
            box.layoutSubviews();
        }
        box.floatToTop();
        return box;
    };

    ns.UserWindow = UserWindow;

}(dicq, tarsier.ui, DIMP);
