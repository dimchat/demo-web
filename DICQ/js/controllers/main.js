
!function (ns, tui, dimp) {
    'use strict';

    var Rect = tui.Rect;

    var View = tui.View;
    var Button = tui.Button;
    var Window = tui.Window;

    var Facebook = dimp.Facebook;

    var MainWindow = function (user) {
        var frame = new Rect(10, 10, 240, 640);
        Window.call(this, frame);
        this.setId('mainWindow');
        this.setTitle('DICQ 2020 (Alpha)');

        //
        //  nav items
        //
        var nav1 = new Button();
        nav1.setId('nav1');
        nav1.setClassName('navItem buttonActive');
        this.appendChild(nav1);
        var nav2 = new Button();
        nav2.setId('nav2');
        nav2.setClassName('navItem buttonNormal');
        this.appendChild(nav2);
        var nav3 = new Button();
        nav3.setId('nav3');
        nav3.setClassName('navItem buttonNormal');
        this.appendChild(nav3);

        //
        //  contacts list box
        //
        var box = new View();
        box.setId('box');
        this.appendChild(box);

        //
        //  function buttons
        //
        var chat = new Button();
        chat.setId('chatBtn');
        chat.setClassName('chatBtn buttonActive');
        this.appendChild(chat);

        var search = new Button();
        search.setId('searchBtn');
        search.setClassName('searchBtn buttonActive');
        search.setText('Search');
        this.appendChild(search);

        var browser = new Button();
        browser.setId('browserBtn');
        browser.setClassName('browserBtn buttonActive');
        this.appendChild(browser);

        var msg = new Button();
        msg.setId('msgBtn');
        msg.setClassName('msgBtn buttonActive');
        msg.setText('Message');
        this.appendChild(msg);

        //
        //  about
        //
        var about = new Button();
        about.setId('aboutBtn');
        about.setClassName('aboutBtn buttonNormal');
        about.setText('DICQ');
        about.onClick = function () {
            ns.AboutWindow.show();
        };
        this.appendChild(about);

        var face = new Button();
        face.setId('faceBtn');
        face.setClassName('faceBtn buttonNormal');
        face.setText('^_^');
        this.appendChild(face);
    };
    MainWindow.prototype = Object.create(Window.prototype);
    MainWindow.prototype.constructor = MainWindow;

    MainWindow.prototype.onClose = function (ev) {
        var facebook = Facebook.getInstance();
        var user = facebook.getCurrentUser();
        if (user) {
            var identifier = user.identifier;
            var info = {
                'ID': identifier,
                'nickname': facebook.getNickname(identifier),
                'number': facebook.getNumberString(identifier)
            };
            var login = new ns.LoginWindow(info);
            tui.$(document.body).appendChild(login);
        }
        return true;
    };

    ns.MainWindow = MainWindow;

}(window, tarsier.ui, DIMP);
