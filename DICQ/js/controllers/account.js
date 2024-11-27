
!function (ns, tui, app, sdk) {
    'use strict';

    var $ = tui.$;

    var Rect = tui.Rect;

    var FieldSet = tui.FieldSet;

    var Label = tui.Label;
    var Input = tui.Input;
    var Button = tui.Button;
    var Window = tui.Window;

    var Class = sdk.type.Class;
    var ID = sdk.protocol.ID;
    var Document = sdk.protocol.Document;
    var DocumentCommand = sdk.protocol.DocumentCommand;

    var Anonymous = app.Anonymous;

    var get_facebook = function () {
        return app.GlobalVariable.getFacebook();
    };
    var get_messenger = function () {
        return app.GlobalVariable.getMessenger();
    };

    var AccountWindow = function () {
        var frame = new Rect(0, 0, 320, 240);
        Window.call(this, frame);
        this.setClassName('accountWindow');
        this.setTitle('Modify My Account Info');

        this.__identifier = null;

        var basic = new FieldSet();
        basic.setClassName('profileFieldSet');
        basic.setCaption('Basic Info');
        this.appendChild(basic);

        // address
        var addressLabel = new Label();
        addressLabel.setClassName('addressLabel');
        addressLabel.setText('Address:');
        basic.appendChild(addressLabel);
        // value
        var address = new Label();
        address.setClassName('address');
        basic.appendChild(address);
        this.address = address;

        // search number
        var numberLabel = new Label();
        numberLabel.setClassName('numberLabel');
        numberLabel.setText('Number:');
        basic.appendChild(numberLabel);
        // value
        var number = new Label();
        number.setClassName('number');
        basic.appendChild(number);
        this.number = number;

        // nickname
        var nameLabel = new Label();
        nameLabel.setClassName('nicknameLabel');
        nameLabel.setText('Name:');
        basic.appendChild(nameLabel);
        // value
        var nickname = new Input();
        nickname.setClassName('nickname');
        basic.appendChild(nickname);
        this.nickname = nickname;

        // button
        var button = new Button();
        button.setClassName('OK');
        button.setText('Update');
        var win = this;
        button.onClick = function (ev) {
            win.submit({
                'ID': win.__identifier,
                'nickname': nickname.getValue()
            });
        };
        this.appendChild(button);
    };
    Class(AccountWindow, Window, null, null);

    AccountWindow.prototype.setIdentifier = function (identifier) {
        if (!identifier || !identifier.isUser()) {
            throw TypeError('ID error: ' + identifier);
        }
        var facebook = get_facebook();
        this.__identifier = identifier;
        this.address.setText(identifier.getAddress());
        this.address.__ie.title = identifier;
        this.number.setText(Anonymous.getNumberString(identifier));
        this.nickname.setValue(facebook.getName(identifier));
    };

    AccountWindow.prototype.submit = function (info) {
        var nickname = info['nickname'];
        var facebook = get_facebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            throw Error('Current user not found');
        }
        var privateKey = facebook.getPrivateKeyForSignature(user.getIdentifier());
        if (!privateKey) {
            throw Error('Failed to get private key for current user: ' + user);
        }
        // update visa
        var visa = user.getVisa();
        if (!visa) {
            visa = Document.create(Document.VISA, user.getIdentifier());
        }
        visa.setName(nickname);
        visa.sign(privateKey);
        facebook.saveDocument(visa);
        // submit event
        if (this.onSubmit(user)) {
            this.remove();
        }
    };

    AccountWindow.prototype.onSubmit = function (user) {
        var visa = user.getVisa();
        // post visa
        var messenger = get_messenger();
        messenger.postDocument(visa);
        var admin = ID.parse('chatroom');
        if (admin) {
            var id = user.getIdentifier();
            var meta = user.getMeta();
            var cmd = DocumentCommand.response(id, meta, visa);
            messenger.sendContent(cmd, id, admin, null, 0);
        }
        var text = 'Nickname updated, visa: ' + visa.getValue('data');
        alert(text);
        return true;
    };

    AccountWindow.show = function (identifier) {
        if (!identifier) {
            var facebook = get_facebook();
            var user = facebook.getCurrentUser();
            if (!user) {
                throw Error('Current user not found');
            }
            identifier = user.getIdentifier();
        }
        var box = null;
        var elements = document.getElementsByClassName('accountWindow');
        if (elements) {
            var item;
            for (var i = 0; i < elements.length; ++i) {
                item = $(elements[i]);
                if (identifier.equals(item.__identifier)) {
                    box = item;
                }
            }
        }
        if (!box) {
            box = new AccountWindow();
            $(document.body).appendChild(box);
            // adjust position
            var point = tui.getRandomPosition(box.getSize());
            box.setOrigin(point);
            box.setIdentifier(identifier);
            box.layoutSubviews();
        }
        box.floatToTop();
        return box;
    };

    ns.AccountWindow = AccountWindow;

}(dicq, tarsier.ui, SECHAT, DIMP);
