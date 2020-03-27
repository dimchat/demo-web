
//
//  User Cell for Group Chat / Search Results (Table View)
//
!function (ns, tui, dimp) {
    'use strict';

    var Label = tui.Label;
    var Image = tui.Image;
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
        if (facebook.getPrivateKeyForSignature(identifier)) {
            this.setClassName('me');
        }

        // avatar
        var avatarImage = new Image();
        avatarImage.setClassName('avatar');
        var profile = facebook.getProfile(identifier);
        if (profile) {
            var url = profile.getProperty('avatar');
            if (url) {
                avatarImage.setSrc(url);
            }
        }
        this.appendChild(avatarImage);

        // name
        var nameLabel = new Label();
        nameLabel.setClassName('name');
        var nickname = facebook.getNickname(identifier);
        if (!nickname) {
            nickname = identifier.name;
        }
        nameLabel.setText(nickname);
        this.appendChild(nameLabel);

        // number
        var numberLabel = new Label();
        numberLabel.setClassName('number');
        var number = facebook.getNumberString(identifier);
        numberLabel.setText(' (' + number + ')');
        this.appendChild(numberLabel);

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
