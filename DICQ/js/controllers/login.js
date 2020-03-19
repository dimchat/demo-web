
!function (ns, tui, dimp) {
    'use strict';

    var Rect = tui.Rect;

    var Label = tui.Label;
    var Button = tui.Button;
    var Window = tui.Window;

    var Facebook = dimp.Facebook;
    var Messenger = dimp.Messenger;
    var StarStatus = dimp.stargate.StarStatus;

    var LoginWindow = function (user) {
        var frame = new Rect(100, 50, 320, 240);
        Window.call(this, frame);
        this.setId('loginWindow');
        this.setTitle('Login');
        var win = this;
        // nickname
        var nickname = new Label();
        nickname.setClassName('nickname');
        nickname.setText(user['nickname']);
        this.appendChild(nickname);
        // number
        var number = new Label();
        number.setClassName('number');
        number.setText(user['number']);
        this.appendChild(number);
        // identifier
        var identifier = new Label();
        identifier.setClassName('identifier');
        identifier.setText(user['ID']);
        this.appendChild(identifier);
        // button
        var button = new Button();
        button.setClassName('OK');
        button.setText('OK');
        button.onClick = function () {
            win.login(user['ID']);
        };
        this.appendChild(button);
    };
    LoginWindow.prototype = Object.create(Window.prototype);
    LoginWindow.prototype.constructor = LoginWindow;

    LoginWindow.prototype.onClose = function (ev) {
        // open register window
        var register = new ns.RegisterWindow();
        tui.$(document.body).appendChild(register);
        return true;
    };

    LoginWindow.prototype.login = function (identifier) {
        var res = check_connection();
        if (res) {
            alert(res);
            return ;
        }
        var facebook = Facebook.getInstance();
        var user = facebook.getUser(identifier);
        if (!user) {
            alert('Failed to get user: ' + identifier + ' ...');
            return ;
        }
        // set current user and login
        facebook.setCurrentUser(user);
        var messenger = Messenger.getInstance();
        messenger.login(user);
        // open main window
        var main = new ns.MainWindow(user);
        tui.$(document.body).appendChild(main);
        this.remove();
    };

    var check_connection = function () {
        var server = Messenger.getInstance().server;
        var status = server.getStatus();
        if (status.equals(StarStatus.Connected)) {
            // connected
            return null;
        } else if (status.equals(StarStatus.Error)) {
            return 'Connecting ...';
        } else if (status.equals(StarStatus.Error)) {
            return 'Connection error!';
        }
        return 'Connect to a DIM station first.';
    };

    ns.LoginWindow = LoginWindow;

}(window, tarsier.ui, DIMP);
