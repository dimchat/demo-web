
!function (ns, tui, sdk) {
    'use strict';

    var $ = tui.$;

    var Rect = tui.Rect;

    var Image = tui.Image;
    var Link = tui.Link;
    var Label = tui.Label;
    var Button = tui.Button;
    var Window = tui.Window;

    var Class = sdk.type.Class;

    var AboutWindow = function () {
        var frame = new Rect(0, 0, 240, 360);
        Window.call(this, frame);
        this.setClassName('aboutWindow');
        this.setTitle('About DICQ');
        // banner
        var banner = new Image();
        banner.setClassName('banner');
        banner.setSrc(ns.logoImageURL);
        this.appendChild(banner);
        // link
        var link = new Link();
        link.setText('https://dim.chat/');
        link.setURL('http://tarsier.dim.chat/');
        this.appendChild(link);
        // version
        var version = new Label();
        version.setClassName('version');
        version.setText('DICQ 2020\n(Powered by DIMP)');
        this.appendChild(version);
        // copyright
        var copyright = new Label();
        copyright.setClassName('copyright');
        copyright.setText('@2020 Albert Moky');
        this.appendChild(copyright);
        // button
        var button = new Button();
        button.setClassName('OK');
        button.setText('OK');
        var win = this;
        button.onClick = function (ev) {
            win.remove();
        };
        this.appendChild(button);
    };
    Class(AboutWindow, Window, null);

    AboutWindow.show = function () {
        var box = document.getElementById('aboutWindow');
        if (box) {
            box = $(box);
        } else {
            box = new AboutWindow();
            $(document.body).appendChild(box);
            // adjust position
            var point = tui.getRandomPosition(box.getSize());
            box.setOrigin(point);
            box.layoutSubviews();
        }
        box.floatToTop();
        return box;
    };

    ns.AboutWindow = AboutWindow;

}(dicq, tarsier.ui, DIMP);
