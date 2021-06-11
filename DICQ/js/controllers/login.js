
!function (ns, tui, app, sdk) {
    'use strict';

    var $ = tui.$;

    var Rect = tui.Rect;

    var Label = tui.Label;
    var Button = tui.Button;
    var FieldSet = tui.FieldSet;

    var Window = tui.Window;

    var Gate = sdk.startrek.Gate;

    var Anonymous = app.Anonymous;
    var Facebook = app.Facebook;
    var Messenger = app.Messenger;

    var get_facebook = function () {
        return Facebook.getInstance();
    };
    var get_messenger = function () {
        return Messenger.getInstance();
    };
    var get_current_server = function () {
        return get_messenger().getCurrentServer();
    };

    var LoginWindow = function () {
        var frame = new Rect(0, 0, 320, 240);
        Window.call(this, frame);
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
    sdk.Class(LoginWindow, Window, null);

    LoginWindow.prototype.setUser = function (user) {
        var identifier = user.identifier;
        var address = identifier.getAddress();
        var number = Anonymous.getNumberString(user.identifier);
        var nickname = get_facebook().getName(user.identifier);
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
        var facebook = get_facebook();
        var user = facebook.getUser(identifier);
        if (!user) {
            alert('Failed to get user: ' + identifier + ' ...');
            return ;
        }
        // set current user and login
        facebook.setCurrentUser(user);
        var server = get_current_server();
        server.setCurrentUser(user);
        server.handshake(null);
        // open main window
        ns.MainWindow.show();
        this.remove();
    };

    var check_connection = function () {
        var server = get_current_server();
        var status = server.getStatus();
        if (status.equals(Gate.Status.CONNECTED)) {
            // connected
            return null;
        } else if (status.equals(Gate.Status.CONNECTING)) {
            return 'Connecting station ...';
        } else if (status.equals(Gate.Status.ERROR)) {
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
            // adjust position
            var point = tui.getCenterPosition(box.getSize());
            box.setOrigin(point);
            box.layoutSubviews();
        }
        box.setUser(user);
        box.floatToTop();
        return box;
    };

    ns.LoginWindow = LoginWindow;

}(dicq, tarsier.ui, SECHAT, DIMSDK);
