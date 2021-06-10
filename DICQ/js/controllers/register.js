
!function (ns, tui, app, sdk) {
    'use strict';

    var $ = tui.$;

    var Rect = tui.Rect;

    var Label = tui.Label;
    var Input = tui.Input;
    var Button = tui.Button;

    var FieldSet = tui.FieldSet;
    var Window = tui.Window;

    var Facebook = app.Facebook;
    var Register = app.Register;

    var RegisterWindow = function () {
        var frame = new Rect(0, 0, 320, 240);
        Window.call(this, frame);
        this.setClassName('registerWindow');
        this.setTitle('Create User Account');

        var basic = new FieldSet();
        basic.setClassName('profileFieldSet');
        basic.setCaption('Nickname');
        this.appendChild(basic);

        // nickname
        var nicknameLabel = new Label();
        nicknameLabel.setClassName('nicknameLabel');
        nicknameLabel.setText('Please input your nickname');
        basic.appendChild(nicknameLabel);
        // value
        var nickname = new Input();
        nickname.setClassName('nickname');
        basic.appendChild(nickname);

        // button
        var button = new Button();
        button.setClassName('OK');
        button.setText('Register');
        var win = this;
        button.onClick = function (ev) {
            win.submit(nickname.getValue());
        };
        this.appendChild(button);
    };
    sdk.Class(RegisterWindow, Window, null);

    RegisterWindow.prototype.submit = function (nickname) {
        var reg = new Register();
        var user = reg.createUser(nickname);
        // submit event
        if (this.onSubmit(user)) {
            this.remove();
        }
    };

    RegisterWindow.prototype.onSubmit = function (user) {
        if (user) {
            var facebook = Facebook.getInstance();
            facebook.setCurrentUser(user);
            // open login window
            ns.Main();
            return true;
        } else {
            alert('Failed to create user account');
            return false;
        }
    };

    RegisterWindow.show = function () {
        var box = document.getElementById('registerWindow');
        if (box) {
            box = $(box);
        } else {
            box = new RegisterWindow();
            $(document.body).appendChild(box);
            // adjust position
            var point = tui.getCenterPosition(box.getSize());
            box.setOrigin(point);
            box.layoutSubviews();
        }
        box.floatToTop();
        return box;
    };

    ns.RegisterWindow = RegisterWindow;

}(dicq, tarsier.ui, SECHAT, DIMSDK);
