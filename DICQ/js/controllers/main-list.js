
!function (ns, tui, dimp) {
    'use strict';

    var $ = tui.$;

    var Point = tui.Point;
    var Size = tui.Size;
    var Rect = tui.Rect;

    var Label = tui.Label;
    var Input = tui.Input;
    var Button = tui.Button;
    var View = tui.View;

    var Facebook = dimp.Facebook;
    var Register = dimp.extensions.Register;

    var MainListView = function () {
        View.call(this);

        var contacts = new Button();
        contacts.setId('contactsBtn');
        contacts.setClassName('contactsBtn buttonNormal');
        contacts.setText('Contacts');
        contacts.onClick = function () {
            //
        };
        this.appendChild(contacts);

        var groups = new Button();
        groups.setId('groupsBtn');
        groups.setClassName('groupsBtn buttonNormal');
        groups.setText('Groups');
        groups.onClick = function () {
            //
        };
        this.appendChild(groups);

    };
    dimp.Class(MainListView, View, null);

    ns.MainListView = MainListView;

}(dicq, tarsier.ui, DIMP);
