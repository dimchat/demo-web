
!function (ns, tui, app, sdk) {
    'use strict';

    var AdView = ns.AdView;
    var ChatWindow = ns.ChatWindow;

    var View = tui.View;
    var Image = tui.Image;

    var Class = sdk.type.Class;

    var get_facebook = function () {
        return app.GlobalVariable.getFacebook();
    };
    // var get_messenger = function () {
    //     return app.GlobalVariable.getMessenger();
    // };

    var PersonalChatWindow = function () {
        ChatWindow.call(this);
        this.setClassName('personalChatWindow');
        this.setTitle('Secure Chat');

        //
        //  User Info View
        //
        var tray = new View();
        tray.setClassName('showView');

        var img = new Image();
        img.setClassName('showImage');
        tray.appendChild(img);
        this.showImage = img;

        //
        //  Advertisement
        //
        var ads = new AdView();
        ads.setClassName('chatAd');
        ads.showAd('chatAd');
        tray.appendChild(ads);

        this.appendChild(tray);
    };
    Class(PersonalChatWindow, ChatWindow, null, null);

    PersonalChatWindow.prototype.setIdentifier = function (identifier) {
        ChatWindow.prototype.setIdentifier.call(this, identifier);
        var avatar = null;
        var facebook = get_facebook();
        var doc = facebook.getDocument(identifier, '*');
        if (doc) {
            avatar = doc.getProperty('avatar');
        }
        if (avatar) {
            this.avatarImage.setSrc(avatar);
            this.showImage.setSrc(avatar);
        }
    };

    //
    //  Factory
    //
    PersonalChatWindow.show = function (identifier, clazz) {
        if (!clazz) {
            clazz = PersonalChatWindow;
        }
        return ChatWindow.show(identifier, clazz);
    };

    ns.PersonalChatWindow = PersonalChatWindow;

}(dicq, tarsier.ui, SECHAT, DIMP);
