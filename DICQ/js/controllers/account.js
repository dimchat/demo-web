
!function (ns, tui, dimp) {
    'use strict';

    var $ = tui.$;

    var Rect = tui.Rect;

    var FieldSet = tui.FieldSet;

    var Label = tui.Label;
    var Input = tui.Input;
    var Button = tui.Button;
    var Window = tui.Window;

    var Profile = dimp.Profile;
    var Facebook = dimp.Facebook;
    var Messenger = dimp.Messenger;

    var AccountWindow = function () {
        var frame = new Rect(0, 0, 320, 240);
        Window.call(this, frame);
        this.setId('accountWindow');
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
    dimp.Class(AccountWindow, Window, null);

    AccountWindow.prototype.setIdentifier = function (identifier) {
        if (!identifier || !identifier.isUser()) {
            throw TypeError('ID error: ' + identifier);
        }
        var facebook = Facebook.getInstance();
        this.__identifier = identifier;
        this.address.setText(identifier.address);
        this.address.__ie.title = identifier;
        this.number.setText(facebook.getNumberString(identifier));
        this.nickname.setValue(facebook.getNickname(identifier));
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
        var profile = user.getProfile();
        if (!profile) {
            profile = new Profile(user.identifier);
        }
        profile.setName(nickname);
        profile.sign(privateKey);
        facebook.saveProfile(profile);
        // post profile
        var messenger = Messenger.getInstance();
        messenger.postProfile(profile);
        var admin = facebook.getIdentifier('chatroom');
        if (admin) {
            messenger.sendProfile(profile, admin);
        }
        var text = 'Nickname updated, profile: ' + profile.getValue('data');
        alert(text);
        this.remove();
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

}(dicq, tarsier.ui, DIMP);
