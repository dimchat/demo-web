
!function (ns, tui, dimp) {
    'use strict';

    var $ = tui.$;

    var Point = tui.Point;
    var Size = tui.Size;
    var Rect = tui.Rect;

    var FieldSet = tui.FieldSet;

    var Label = tui.Label;
    var Input = tui.Input;
    var Button = tui.Button;
    var Window = tui.Window;

    var Profile = dimp.Profile;
    var Facebook = dimp.Facebook;
    var Messenger = dimp.Messenger;

    var random_point = function () {
        var x = 50 + Math.random() * 100;
        var y = 50 + Math.random() * 100;
        return new Point(Math.round(x), Math.round(y));
    };

    var AccountWindow = function () {
        var frame = new Rect(random_point(), new Size(320, 240));
        Window.call(this, frame);
        this.setId('accountWindow');
        this.setClassName('accountWindow');
        this.setTitle('Update user account');
        // current user
        var facebook = Facebook.getInstance();
        var user = facebook.getCurrentUser();

        // // identifier
        // var idLabel = new Label();
        // idLabel.setClassName('identifierLabel');
        // idLabel.setText('ID:');
        // this.appendChild(idLabel);
        // // value
        // var identifier = new Label();
        // identifier.setClassName('identifier');
        // identifier.setText(user.identifier);
        // this.appendChild(identifier);

        var basic = new FieldSet();
        basic.setClassName('profileFieldSet');
        basic.setCaption('Basic Info');
        this.appendChild(basic);

        // search number
        var numberLabel = new Label();
        numberLabel.setClassName('numberLabel');
        numberLabel.setText('Number:');
        basic.appendChild(numberLabel);
        // value
        var number = new Label();
        number.setClassName('number');
        number.setText(facebook.getNumberString(user.identifier));
        basic.appendChild(number);

        // nickname
        var nameLabel = new Label();
        nameLabel.setClassName('nicknameLabel');
        nameLabel.setText('Name:');
        basic.appendChild(nameLabel);
        // value
        var nickname = new Input();
        nickname.setClassName('nickname');
        nickname.setValue(user.getName());
        basic.appendChild(nickname);

        // button
        var button = new Button();
        button.setClassName('OK');
        button.setText('Save');
        var win = this;
        button.onClick = function () {
            win.submit({
                'ID': user.identifier,
                'nickname': nickname.getValue()
            });
        };
        this.appendChild(button);
    };
    dimp.Class(AccountWindow, Window, null);

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

    AccountWindow.show = function () {
        var box = document.getElementById('registerWindow');
        if (box) {
            box = $(box);
        } else {
            box = new AccountWindow();
            $(document.body).appendChild(box);
            box.layoutSubviews();
        }
        box.floatToTop();
        return box;
    };

    ns.AccountWindow = AccountWindow;

}(dicq, tarsier.ui, DIMP);
