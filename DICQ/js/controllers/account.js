
!function (ns, tui, app, sdk) {
    'use strict';

    var $ = tui.$;

    var Rect = tui.Rect;

    var FieldSet = tui.FieldSet;

    var Label = tui.Label;
    var Input = tui.Input;
    var Button = tui.Button;
    var Window = tui.Window;

    var ID = sdk.protocol.ID;
    var Document = sdk.protocol.Document;

    var Anonymous = app.Anonymous;
    var Facebook = app.Facebook;
    var Messenger = app.Messenger;

    var AccountWindow = function () {
        var frame = new Rect(0, 0, 320, 240);
        Window.call(this, frame);
        this.setClassName('accountWindow');
        this.setTitle('Modify My Account Info');

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
        var nickname = new Input();
        nickname.setClassName('nickname');
        basic.appendChild(nickname);
        this.nickname = nickname;

        // button
        var button = new Button();
        button.setClassName('OK');
        button.setText('Update');
        var win = this;
        button.onClick = function (ev) {
            win.submit({
                'ID': win.__identifier,
                'nickname': nickname.getValue()
            });
        };
        this.appendChild(button);
    };
    sdk.Class(AccountWindow, Window, null);

    AccountWindow.prototype.setIdentifier = function (identifier) {
        if (!identifier || !identifier.isUser()) {
            throw TypeError('ID error: ' + identifier);
        }
        var facebook = Facebook.getInstance();
        this.__identifier = identifier;
        this.address.setText(identifier.getAddress());
        this.address.__ie.title = identifier;
        this.number.setText(Anonymous.getNumberString(identifier));
        this.nickname.setValue(facebook.getName(identifier));
    };

    AccountWindow.prototype.submit = function (info) {
        var nickname = info['nickname'];
        var facebook = Facebook.getInstance();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw Error('Current user not found');
        }
        var privateKey = facebook.getPrivateKeyForSignature(user.identifier);
        if (!privateKey) {
            throw Error('Failed to get private key for current user: ' + user);
        }
        // update profile
        var profile = user.getVisa();
        if (!profile) {
            profile = new Document(user.identifier);
        }
        profile.setName(nickname);
        profile.sign(privateKey);
        facebook.saveDocument(profile);
        // submit event
        if (this.onSubmit(user)) {
            this.remove();
        }
    };

    AccountWindow.prototype.onSubmit = function (user) {
        var profile = user.getVisa();
        // post profile
        var messenger = Messenger.getInstance();
        messenger.postDocument(profile);
        var admin = ID.parse('chatroom');
        if (admin) {
            messenger.sendDocument(profile, admin);
        }
        var text = 'Nickname updated, profile: ' + profile.getValue('data');
        alert(text);
        return true;
    };

    AccountWindow.show = function (identifier) {
        if (!identifier) {
            var facebook = Facebook.getInstance();
            var user = facebook.getCurrentUser();
            if (!user) {
                throw Error('Current user not found');
            }
            identifier = user.identifier;
        }
        var box = null;
        var elements = document.getElementsByClassName('accountWindow');
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
            box = new AccountWindow();
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

    ns.AccountWindow = AccountWindow;

}(dicq, tarsier.ui, SECHAT, DIMSDK);
