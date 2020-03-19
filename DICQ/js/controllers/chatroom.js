
!function (ns, tui, dimp) {
    'use strict';

    var $ = tui.$;

    var Rect = tui.Rect;

    var View = tui.View;
    var Label = tui.Label;
    var Input = tui.Input;
    var Button = tui.Button;
    var Image = tui.Image;
    var Window = tui.Window;

    var Facebook = dimp.Facebook;

    var ChatroomWindow = function () {
        var frame = new Rect(260, 50, 640, 480);
        Window.call(this, frame);
        this.setId('chatroomWindow');
        this.setClassName('chatroomWindow');
        this.setTitle('Chat Room');
        // image
        var image = new Image();
        image.setClassName('logo');
        image.setSrc('https://dimchat.github.io/images/icon-57.png');
        this.appendChild(image);
        // identifier
        var identifier = new Label();
        identifier.setClassName('identifier');
        this.appendChild(identifier);
        this.identifierLabel = identifier;
        // group name
        var name = new Label();
        name.setClassName('name');
        this.appendChild(name);
        this.nameLabel = name;
        // search number
        var number = new Label();
        number.setClassName('number');
        this.appendChild(number);
        this.numberLabel = number;

        //
        //  Message
        //
        var history = new View();
        history.setId('historyView');
        history.setClassName('historyView');
        this.appendChild(history);
        this.historyView = history;

        // input
        var input = new Input();
        input.setClassName('input');
        this.appendChild(input);
        this.input = input;
        // button
        var button = new Button();
        button.setClassName('sendBtn');
        button.setText('Send');
        var win = this;
        button.onClick = function () {
            win.send(input.getValue());
        };
        this.appendChild(button);

        //
        //  Members
        //
        var members = new View();
        members.setId('membersView');
        members.setClassName('membersView');
        this.appendChild(members);
        this.membersView = members;
    };
    ChatroomWindow.prototype = Object.create(Window.prototype);
    ChatroomWindow.prototype.constructor = ChatroomWindow;

    ChatroomWindow.prototype.setAdmin = function (admin) {
        var facebook = Facebook.getInstance();
        var identifier = admin.identifier;
        var name = facebook.getNickname(admin.identifier);
        var number = facebook.getNumberString(admin.identifier);
        this.identifierLabel.setText(identifier);
        this.nameLabel.setText(name);
        this.numberLabel.setText('(' + number + ')');
        this.__admin = admin;
    };

    ChatroomWindow.prototype.send = function (text) {
        console.log('sending message: ' + text);
    };

    ChatroomWindow.show = function (admin) {
        var box = document.getElementById('chatroomWindow');
        if (box) {
            box = $(box);
        } else {
            box = new ChatroomWindow();
            $(document.body).appendChild(box);
        }
        box.setAdmin(admin);
        box.floatToTop();
        return box;
    };

    ns.ChatroomWindow = ChatroomWindow;

}(window, tarsier.ui, DIMP);
