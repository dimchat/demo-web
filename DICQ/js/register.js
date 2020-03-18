
!function (ns, tui) {
    'use strict';

    var Rect = tui.Rect;

    var Label = tui.Label;
    var Input = tui.Input;
    var Button = tui.Button;
    var Window = tui.Window;

    var RegisterWindow = function () {
        var frame = new Rect(100, 50, 320, 240);
        Window.call(this, frame);
        this.setId('register');
        this.setTitle('Register');
        var register = this;
        // label
        var label = new Label('Nickname:');
        label.setSize(80, 20);
        label.setOrigin(40, 104);
        // label.setBackgroundColor(Color.Green);
        this.appendChild(label);
        // input
        var input = new Input();
        input.setSize(160, 20);
        input.setOrigin( 120, 100);
        this.appendChild(input);
        this.input = input;
        // button
        var button = new Button();
        button.setSize(100, 30);
        button.setOrigin(120, 160);
        button.setText('OK');
        button.onClick = function () {
            register.submit(input.getValue());
        };
        this.appendChild(button);
    };
    RegisterWindow.prototype = Object.create(Window.prototype);
    RegisterWindow.prototype.constructor = RegisterWindow;

    RegisterWindow.prototype.submit = function (nickname) {
        alert(nickname);
    };

    ns.RegisterWindow = RegisterWindow;

}(window, tarsier.ui);
