
//
//  User Cell for Group Chat / Search Results (Table View)
//
!function (ns, tui, dimp) {
    'use strict';

    var TableViewCell = tui.TableViewCell;

    var Facebook = dimp.Facebook;

    var UserTableViewCell = function (cell) {
        TableViewCell.call(this, cell);
        this.__identifier = null;
    };
    UserTableViewCell.prototype = Object.create(TableViewCell.prototype);
    UserTableViewCell.prototype.constructor = UserTableViewCell;

    UserTableViewCell.prototype.setIdentifier = function (identifier) {
        var facebook = Facebook.getInstance();

        var name = facebook.getNickname(identifier);
        if (!name) {
            name = identifier.name;
        }
        var number = facebook.getNumberString(identifier);
        this.setText(name + ' [' + number + ']');

        if (facebook.getPrivateKeyForSignature(identifier)) {
            this.setClassName('me');
        }
        // OK
        this.__identifier = identifier;
        return this;
    };

    UserTableViewCell.prototype.onClick = function (ev) {
        var identifier = this.__identifier;
        var facebook = Facebook.getInstance();
        if (facebook.getPrivateKeyForSignature(identifier)) {
            ns.AccountWindow.show(identifier);
        } else {
            ns.UserWindow.show(identifier);
        }
    };

    //-------- namespace --------
    ns.UserTableViewCell = UserTableViewCell;

}(dicq, tarsier.ui, DIMP);
