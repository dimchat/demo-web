
!function (ns, tui, app, sdk) {
    'use strict';

    var $ = tui.$;

    var Rect = tui.Rect;

    var FieldSet = tui.FieldSet;

    var Label = tui.Label;
    var Button = tui.Button;
    var Window = tui.Window;

    var Class = sdk.type.Class;
    var Anonymous = app.Anonymous;

    var get_facebook = function () {
        return app.GlobalVariable.getInstance().facebook;
    };
    // var get_messenger = function () {
    //     return app.GlobalVariable.getInstance().messenger;
    // };

    var UserWindow = function () {
        var frame = new Rect(0, 0, 320, 240);
        Window.call(this, frame);
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
    Class(UserWindow, Window, null, null);

    UserWindow.prototype.setIdentifier = function (identifier) {
        if (!identifier || !identifier.isUser()) {
            throw TypeError('ID error: ' + identifier);
        }
        var facebook = get_facebook();
        this.__identifier = identifier;
        this.address.setText(identifier.getAddress());
        this.address.__ie.title = identifier;
        this.number.setText(Anonymous.getNumberString(identifier));
        this.nickname.setText(facebook.getName(identifier));
        // check contacts
        var user = facebook.getCurrentUser();
        var contacts = facebook.getContacts(user.getIdentifier());
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
        var facebook = get_facebook();
        var user = facebook.getCurrentUser();
        var contacts = facebook.getContacts(user.getIdentifier());
        if (contacts && contacts.indexOf(identifier) >= 0) {
            ns.PersonalChatWindow.show(identifier);
            this.remove();
        } else {
            if (facebook.addContact(identifier, user.getIdentifier())) {
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

}(dicq, tarsier.ui, SECHAT, DIMP);
