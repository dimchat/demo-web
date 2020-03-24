
!function (ns, tui, dimp) {
    'use strict';

    var $ = tui.$;

    var Point = tui.Point;
    var Size = tui.Size;
    var Rect = tui.Rect;

    var Label = tui.Label;
    var Button = tui.Button;
    var FieldSet = tui.FieldSet;

    var Window = tui.Window;

    var Facebook = dimp.Facebook;
    var Messenger = dimp.Messenger;
    var StarStatus = dimp.stargate.StarStatus;

    var random_point = function () {
        var x = 180 + Math.random() * 100;
        var y = 50 + Math.random() * 100;
        return new Point(Math.round(x), Math.round(y));
    };

    var LoginWindow = function () {
        var frame = new Rect(random_point(), new Size(320, 240));
        Window.call(this, frame);
        this.setId('loginWindow');
        this.setClassName('loginWindow');
        this.setTitle('Login DIM station');

        var basic = new FieldSet();
        basic.setClassName('profileFieldSet');
        basic.setCaption('Current Account');
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
        var nickname = new Label();
        nickname.setClassName('nickname');
        basic.appendChild(nickname);
        this.nickname = nickname;

        // button
        var button = new Button();
        button.setClassName('OK');
        button.setText('Login');
        var win = this;
        button.onClick = function (ev) {
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
        var identifier = user.identifier;
        var address = identifier.address;
        var number = facebook.getNumberString(user.identifier);
        var nickname = user.getName();
        this.address.setText(address);
        this.address.__ie.title = identifier;
        this.number.setText(number);
        this.nickname.setText(nickname);
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
