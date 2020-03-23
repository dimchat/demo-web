
!function (ns, tui, dimp) {
    'use strict';

    var $ = tui.$;

    var Point = tui.Point;
    var Size = tui.Size;
    var Rect = tui.Rect;

    var Label = tui.Label;
    var Button = tui.Button;
    var Window = tui.Window;

    var Facebook = dimp.Facebook;
    var Messenger = dimp.Messenger;
    var StarStatus = dimp.stargate.StarStatus;

    var random_point = function () {
        var x = 50 + Math.random() * 100;
        var y = 50 + Math.random() * 100;
        return new Point(Math.round(x), Math.round(y));
    };

    var LoginWindow = function () {
        var frame = new Rect(random_point(), new Size(320, 240));
        Window.call(this, frame);
        this.setId('loginWindow');
        this.setClassName('loginWindow');
        this.setTitle('Login');
        // nickname
        var nickname = new Label();
        nickname.setClassName('nickname');
        this.appendChild(nickname);
        this.nicknameLabel = nickname;
        // number
        var number = new Label();
        number.setClassName('number');
        this.appendChild(number);
        this.numberLabel = number;
        // identifier
        var identifier = new Label();
        identifier.setClassName('identifier');
        this.appendChild(identifier);
        this.identifierLabel = identifier;
        // button
        var button = new Button();
        button.setClassName('OK');
        button.setText('OK');
        var win = this;
        button.onClick = function () {
            if (win.__user) {
                win.login(win.__user.identifier);
            } else {
                alert('User info error');
            }
        };
        this.appendChild(button);
        // current user
        this.__user = number;
    };
    dimp.Class(LoginWindow, Window, null);

    LoginWindow.prototype.setUser = function (user) {
        var facebook = Facebook.getInstance();
        this.nicknameLabel.setText(facebook.getNickname(user.identifier));
        this.numberLabel.setText(facebook.getNumberString(user.identifier));
        this.identifierLabel.setText(user.identifier);
        this.__user = user;
    };

    LoginWindow.prototype.onClose = function (ev) {
        // cannot close this window
        return false;
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
        ns.MainWindow.show();
        this.remove();
    };

    var check_connection = function () {
        var server = Messenger.getInstance().server;
        var status = server.getStatus();
        if (status.equals(StarStatus.Connected)) {
            // connected
            return null;
        } else if (status.equals(StarStatus.Connecting)) {
            return 'Connecting station ...';
        } else if (status.equals(StarStatus.Error)) {
            return 'Connection error!';
        }
        return 'Connect to a DIM station first.';
    };

    LoginWindow.show = function (user) {
        var box = document.getElementById('loginWindow');
        if (box) {
            box = $(box);
        } else {
            box = new LoginWindow();
            $(document.body).appendChild(box);
            box.layoutSubviews();
        }
        box.setUser(user);
        box.floatToTop();
        return box;
    };

    ns.LoginWindow = LoginWindow;

}(dicq, tarsier.ui, DIMP);
