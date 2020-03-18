
!function (ns, tui, dimp) {
    'use strict';

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
        this.setId('register');
        this.setTitle('Register');
        var win = this;
        // label
        var label = new Label();
        label.setText('Nickname:');
        label.setSize(80, 20);
        label.setOrigin(40, 94);
        // label.setBackgroundColor(Color.Green);
        this.appendChild(label);
        // input
        var input = new Input();
        input.setSize(138, 20);
        input.setOrigin( 120, 90);
        this.appendChild(input);
        this.input = input;
        // button
        var button = new Button();
        button.setSize(100, 30);
        button.setOrigin(110, 160);
        button.setText('OK');
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
            // open login window
            ns.Main();
        } else {
            alert('Failed to create user account');
        }
    };

    ns.RegisterWindow = RegisterWindow;

}(window, tarsier.ui, DIMP);
