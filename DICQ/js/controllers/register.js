
!function (ns, tui, dimp) {
    'use strict';

    var $ = tui.$;

    var Point = tui.Point;
    var Size = tui.Size;
    var Rect = tui.Rect;

    var Label = tui.Label;
    var Input = tui.Input;
    var Button = tui.Button;

    var FieldSet = tui.FieldSet;
    var Window = tui.Window;

    var Facebook = dimp.Facebook;
    var Register = dimp.extensions.Register;

    var random_point = function () {
        var x = 180 + Math.random() * 100;
        var y = 50 + Math.random() * 100;
        return new Point(Math.round(x), Math.round(y));
    };

    var RegisterWindow = function () {
        var frame = new Rect(random_point(), new Size(320, 240));
        Window.call(this, frame);
        this.setId('registerWindow');
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
    dimp.Class(RegisterWindow, Window, null);

    RegisterWindow.prototype.submit = function (nickname) {
        var reg = new Register();
        var user = reg.createUser(nickname);
        if (user) {
            var facebook = Facebook.getInstance();
            facebook.setCurrentUser(user);
            // open login window
            ns.Main();
        } else {
            alert('Failed to create user account');
        }
        this.remove();
    };

    RegisterWindow.show = function () {
        var box = document.getElementById('registerWindow');
        if (box) {
            box = $(box);
        } else {
            box = new RegisterWindow();
            $(document.body).appendChild(box);
            box.layoutSubviews();
        }
        box.floatToTop();
        return box;
    };

    ns.RegisterWindow = RegisterWindow;

}(dicq, tarsier.ui, DIMP);
