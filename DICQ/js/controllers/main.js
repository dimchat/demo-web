
!function (ns, tui, app, sdk) {
    'use strict';

    var $ = tui.$;

    var Rect = tui.Rect;

    var Button = tui.Button;
    var Window = tui.Window;

    var Class = sdk.type.Class;
    var ID = sdk.protocol.ID;

    var facebook = app.GlobalVariable.getInstance().facebook;

    var MainWindow = function () {
        var frame = new Rect(10, 10, 240, 640);
        Window.call(this, frame);
        this.setClassName('mainWindow');
        this.setTitle('DICQ 2020 (Alpha)');

        //
        //  nav items
        //
        var nav1 = new Button();
        nav1.setClassName('navItem buttonActive');
        this.appendChild(nav1);
        var nav2 = new Button();
        nav2.setClassName('navItem buttonNormal');
        this.appendChild(nav2);
        var nav3 = new Button();
        nav3.setClassName('navItem buttonNormal');
        this.appendChild(nav3);

        //
        //  contacts list box
        //
        var box = new ns.MainListView();
        box.setClassName('mainList');
        this.appendChild(box);

        //
        //  function buttons
        //
        var chat = new Button();
        chat.setClassName('chatBtn buttonActive');
        this.appendChild(chat);

        var search = new Button();
        search.setClassName('searchBtn buttonActive');
        search.setText('Search');
        search.onClick = function (ev) {
            ns.SearchWindow.show();
        };
        this.appendChild(search);

        var browser = new Button();
        browser.setClassName('browserBtn buttonActive');
        this.appendChild(browser);

        var msg = new Button();
        msg.setClassName('msgBtn buttonActive');
        msg.setText('Chat Room');
        msg.onClick = function (ev) {
            var admin = ID.parse('chatroom');
            if (admin) {
                ns.ChatroomWindow.show(admin);
            }
        };
        this.appendChild(msg);

        //
        //
        //
        var main = new Button();
        main.setClassName('dicqBtn buttonNormal');
        main.setText('DICQ');
        main.onClick = function (ev) {
            ns.AccountWindow.show();
        };
        this.appendChild(main);

        var icon = new Button();
        icon.setClassName('iconBtn buttonNormal');
        icon.onClick = function (ev) {
            ns.AboutWindow.show();
        };
        this.appendChild(icon);
    };
    Class(MainWindow, Window, null, null);

    MainWindow.prototype.onClose = function (ev) {
        var user = facebook.getCurrentUser();
        if (user) {
            ns.LoginWindow.show(user);
        }
        return true;
    };

    MainWindow.show = function () {
        var box = document.getElementById('mainWindow');
        if (box) {
            box = $(box);
        } else {
            box = new MainWindow();
            $(document.body).appendChild(box);
            box.layoutSubviews();
        }
        box.floatToTop();
        return box;
    };

    ns.MainWindow = MainWindow;

}(dicq, tarsier.ui, SECHAT, DIMP);
