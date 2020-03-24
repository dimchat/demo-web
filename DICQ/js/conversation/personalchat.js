
!function (ns, tui, dimp) {
    'use strict';

    var ChatWindow = ns.ChatWindow;

    var Facebook = dimp.Facebook;

    var PersonalChatWindow = function () {
        ChatWindow.call(this);
        this.setClassName('personalChatWindow');
        this.setTitle('Secure Chat');
    };
    dimp.Class(PersonalChatWindow, ChatWindow, null);

    PersonalChatWindow.prototype.setIdentifier = function (identifier) {
        ChatWindow.prototype.setIdentifier.call(this, identifier);
        var facebook = Facebook.getInstance();
        var profile = facebook.getProfile(identifier);
        var avatar = profile.getProperty('avatar');
        if (avatar) {
            this.avatarImage.setSrc(avatar);
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

}(dicq, tarsier.ui, DIMP);
