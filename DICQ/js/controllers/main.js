
!function (ns, tui, dimp) {
    'use strict';

    var Rect = tui.Rect;

    var Label = tui.Label;
    var Button = tui.Button;
    var Window = tui.Window;

    var Facebook = dimp.Facebook;

    var MainWindow = function (user) {
        var frame = new Rect(10, 10, 240, 640);
        Window.call(this, frame);
        this.setId('dicq');
        this.setTitle('DICQ');
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
