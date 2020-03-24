
!function (ns, tui, dimp) {
    'use strict';

    var ChatWindow = ns.ChatWindow;

    var PersonalChatWindow = function () {
        ChatWindow.call(this);
        this.setClassName('personalChatWindow');
        this.setTitle('Secure Chat');
    };
    dimp.Class(PersonalChatWindow, ChatWindow, null);

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
