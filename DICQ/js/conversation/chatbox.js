
!function (ns, tui, app, sdk) {
    'use strict';

    var $ = tui.$;

    var Rect = tui.Rect;

    var Label = tui.Label;
    var TextArea = tui.TextArea;
    var Button = tui.Button;
    var Image = tui.Image;
    var Window = tui.Window;

    var TableViewDataSource = tui.TableViewDataSource;
    var TableViewDelegate = tui.TableViewDelegate;
    var TableView = tui.TableView;

    var Class = sdk.type.Class;
    var TextContent = sdk.protocol.TextContent;

    var Gate = sdk.startrek.Gate;
    var NotificationCenter = sdk.lnc.NotificationCenter;

    var Anonymous = app.Anonymous;

    var get_facebook = function () {
        return app.GlobalVariable.getInstance().facebook;
    };
    var get_messenger = function () {
        return app.GlobalVariable.getInstance().messenger;
    };

    var get_message_db = function () {
        return app.db.MessageTable;
    };

    var ChatWindow = function () {
        var frame = new Rect(0, 0, 640, 480);
        Window.call(this, frame);
        this.setClassName('chatWindow');
        this.setTitle('Chat');

        this.__identifier = null;

        // avatar
        var avatar = new Image();
        avatar.setClassName('avatar');
        avatar.setSrc('http://apps.dim.chat/DICQ/images/icon-57.png');
        this.appendChild(avatar);
        this.avatarImage = avatar;

        // identifier
        var identifier = new Label();
        identifier.setClassName('identifierLabel');
        this.appendChild(identifier);
        this.identifierLabel = identifier;
        // group name
        var name = new Label();
        name.setClassName('nameLabel');
        this.appendChild(name);
        this.nameLabel = name;
        // search number
        var number = new Label();
        number.setClassName('numberLabel');
        this.appendChild(number);
        this.numberLabel = number;

        //
        //  Message
        //
        var table = new TableView();
        table.setClassName('historyView');
        table.dataSource = this;
        table.delegate = this;
        this.appendChild(table);
        this.historyView = table;

        // message
        var message = new TextArea();
        message.setClassName('messageView');
        this.appendChild(message);
        this.messageView = message;
        // button
        var button = new Button();
        button.setClassName('sendButton');
        button.setText('Send');
        var win = this;
        button.onClick = function (ev) {
            win.sendText(message.getValue());
        };
        this.appendChild(button);

        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, app.kNotificationMessageUpdated);
    };
    Class(ChatWindow, Window, [TableViewDataSource, TableViewDelegate], null);

    ChatWindow.prototype.setIdentifier = function (identifier) {
        var facebook = get_facebook();
        var name = facebook.getName(identifier);
        var number = Anonymous.getNumberString(identifier);
        this.identifierLabel.setText(identifier);
        this.nameLabel.setText(name);
        this.numberLabel.setText('(' + number + ')');
        this.__identifier = identifier;
        this.reloadData();
    };

    ChatWindow.prototype.getMessageCount = function () {
        var db = get_message_db();
        return db.numberOfMessages(this.__identifier);
    };
    ChatWindow.prototype.getMessage = function (index) {
        var db = get_message_db();
        return db.messageAtIndex(index, this.__identifier);
    };

    ChatWindow.prototype.onReceiveNotification = function (notification) {
        var name = notification.name;
        var userInfo = notification.userInfo;
        if (name === app.kNotificationMessageUpdated) {
            var msg = userInfo['msg'];
            var env = msg.getEnvelope();
            var identifier = this.__identifier;
            if (identifier.equals(msg.getGroup()) ||
                identifier.equals(env.getReceiver()) ||
                identifier.equals(env.getSender())) {
                // reload chat history
                this.historyView.reloadData();
                this.historyView.scrollToBottom();
            }
        }
    };

    ChatWindow.prototype.reloadData = function () {
        this.historyView.reloadData();
        this.historyView.scrollToBottom();
    };

    //
    //  TableViewDataSource
    //
    ChatWindow.prototype.numberOfRowsInSection = function (section, tableView) {
        if (tableView !== this.historyView) {
            throw Error('table view error');
        }
        return this.getMessageCount();
    };

    ChatWindow.prototype.cellForRowAtIndexPath = function (indexPath, tableView) {
        if (tableView !== this.historyView) {
            throw Error('table view error');
        }
        var iMsg = this.getMessage(indexPath.row);
        iMsg.getEnvelope().setValue('read', true);
        // create table cell
        var cell = new ns.MessageCell();
        cell.setClassName('msgCell');
        cell.setMessage(iMsg);
        return cell;
    };

    //
    //  Send message
    //

    ChatWindow.prototype.sendText = function (text) {
        if (!text) {
            return ;
        }
        var content = new TextContent(text);
        this.sendContent(content);
    };

    ChatWindow.prototype.sendContent = function (content) {
        var messenger = get_messenger();
        var server = messenger.getCurrentStation();
        var status = server.getStatus();
        if (!Gate.Status.S.equals(status)) {
            alert('Station not connect');
            return false;
        }
        var user = server.getCurrentUser();
        if (!user) {
            alert('User not login');
            return false;
        }
        var receiver = this.__identifier;
        if (receiver.isGroup()) {
            var facebook = get_facebook();
            var members = facebook.getMembers(receiver);
            if (!members || members.length === 0) {
                var ass = facebook.getAssistants(receiver);
                if (ass && ass.length > 0) {
                    messenger.queryGroupInfo(receiver, ass);
                    alert('Querying group members.');
                } else {
                    alert('Group assistant not found.');
                }
                return false;
            }
            content.setGroup(receiver);
        }
        if (messenger.sendContent(null, receiver, content, null, 0)) {
            console.log('sending message: ', content);
            this.messageView.setValue('');
            this.historyView.reloadData();
            return true;
        } else {
            alert('Cannot send message now.');
            return false;
        }
    };

    //
    //  Factory
    //
    ChatWindow.show = function (identifier, clazz) {
        var box = null;
        var elements = document.getElementsByClassName('chatWindow');
        if (elements) {
            var item;
            for (var i = 0; i < elements.length; ++i) {
                item = $(elements[i]);
                if (item instanceof clazz &&
                    identifier.equals(item.__identifier)) {
                    box = item;
                }
            }
        }
        if (box === null) {
            box = new clazz();
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

    ns.ChatWindow = ChatWindow;

}(dicq, tarsier.ui, SECHAT, DIMP);
