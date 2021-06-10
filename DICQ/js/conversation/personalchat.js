
!function (ns, tui, app, sdk) {
    'use strict';

    var AdView = ns.AdView;
    var ChatWindow = ns.ChatWindow;

    var View = tui.View;
    var Image = tui.Image;

    var Facebook = app.Facebook;

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
    sdk.Class(PersonalChatWindow, ChatWindow, null);

    PersonalChatWindow.prototype.setIdentifier = function (identifier) {
        ChatWindow.prototype.setIdentifier.call(this, identifier);
        var avatar = null;
        var facebook = Facebook.getInstance();
        var profile = facebook.getDocument(identifier, '*');
        if (profile) {
            avatar = profile.getProperty('avatar');
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

}(dicq, tarsier.ui, SECHAT, DIMSDK);
