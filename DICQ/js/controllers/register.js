
!function (ns, tui, dimp) {
    'use strict';

    var $ = tui.$;

    var Rect = tui.Rect;

    var Label = tui.Label;
    var Input = tui.Input;
    var Button = tui.Button;
    var Window = tui.Window;

    var Facebook = dimp.Facebook;
    var Register = dimp.extensions.Register;

    var RegisterWindow = function () {
        var frame = new Rect(100, 50, 320, 240);
        Window.call(this, frame);
        this.setId('registerWindow');
        this.setClassName('registerWindow');
        this.setTitle('Create user account');
        var win = this;
        // label
        var label = new Label();
        label.setClassName('nickname');
        label.setText('Nickname:');
        this.appendChild(label);
        // input
        var input = new Input();
        input.setClassName('input');
        this.appendChild(input);
        this.input = input;
        // button
        var button = new Button();
        button.setClassName('OK');
        button.setText('Register');
        button.onClick = function () {
            win.submit(input.getValue());
        };
        this.appendChild(button);
    };
    RegisterWindow.prototype = Object.create(Window.prototype);
    RegisterWindow.prototype.constructor = RegisterWindow;

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
        }
        box.floatToTop();
        return box;
    };

    ns.RegisterWindow = RegisterWindow;

}(window, tarsier.ui, DIMP);
