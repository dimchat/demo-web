
!function (ns, tui, dimp) {
    'use strict';

    var $ = tui.$;

    var Rect = tui.Rect;

    var Label = tui.Label;
    var TextArea = tui.TextArea;
    var Button = tui.Button;
    var Image = tui.Image;
    var Window = tui.Window;

    var TableViewCell = tui.TableViewCell;
    var TableViewDataSource = tui.TableViewDataSource;
    var TableViewDelegate = tui.TableViewDelegate;
    var TableView = tui.TableView;

    var TextContent = dimp.protocol.TextContent;
    var Command = dimp.protocol.Command;
    var MessageBuilder = dimp.cpu.MessageBuilder;

    var StarStatus = dimp.stargate.StarStatus;
    var NotificationCenter = dimp.stargate.NotificationCenter;

    var MessageTable = dimp.db.MessageTable;

    var Facebook = dimp.Facebook;
    var Messenger = dimp.Messenger;

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
        nc.addObserver(this, nc.kNotificationMessageReceived);
    };
    dimp.Class(ChatWindow, Window, [TableViewDataSource, TableViewDelegate]);

    ChatWindow.prototype.setIdentifier = function (identifier) {
        var facebook = Facebook.getInstance();
        var name = facebook.getNickname(identifier);
        var number = facebook.getNumberString(identifier);
        this.identifierLabel.setText(identifier);
        this.nameLabel.setText(name);
        this.numberLabel.setText('(' + number + ')');
        this.__identifier = identifier;
        this.reloadData();
    };

    ChatWindow.prototype.getMessageCount = function () {
        var db = MessageTable.getInstance();
        return db.getMessageCount(this.__identifier);
    };
    ChatWindow.prototype.getMessage = function (index) {
        var db = MessageTable.getInstance();
        return db.getMessage(index, this.__identifier);
    };

    ChatWindow.prototype.onReceiveNotification = function (notification) {
        var nc = NotificationCenter.getInstance();
        var name = notification.name;
        if (name === nc.kNotificationMessageReceived) {
            var msg = notification.userInfo;
            var env = msg.envelope;
            var identifier = this.__identifier;
            if (identifier.equals(msg.content.getGroup()) ||
                identifier.equals(env.receiver) ||
                identifier.equals(env.sender)) {
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
        // create table cell
        var cell = new TableViewCell();
        cell.setClassName('msgCell');

        // message time
        var time = iMsg.envelope.getTime();
        var timeView = new Label();
        timeView.setClassName('time');
        timeView.setText(time_string(time));
        cell.appendChild(timeView);

        // name & number
        var facebook = Facebook.getInstance();
        var sender = facebook.getIdentifier(iMsg.envelope.sender);
        var name = facebook.getNickname(sender);
        if (!name) {
            name = sender.name;
        }
        var number = facebook.getNumberString(sender);
        var nameView = new Label();
        nameView.setClassName('name');
        nameView.setText(name + ' (' + number + ')');
        cell.appendChild(nameView);

        // message content
        var content = iMsg.content;
        var text;
        if (content instanceof Command) {
            text = MessageBuilder.getCommandText(content, sender);
        } else {
            text = MessageBuilder.getContentText(content, sender);
        }
        var textView = new Label();
        textView.setClassName('content');
        textView.setText(text);
        cell.appendChild(textView);

        var user = facebook.getCurrentUser();
        if (user.identifier.equals(sender)) {
            cell.setClassName('sent');
        } else {
            cell.setClassName('received');
        }
        return cell;
    };

    var time_string = function (time) {
        if (time instanceof Date) {
            var year = time.getFullYear();
            var month = time.getMonth() + 1;
            var date = time.getDate();
            var hours = time.getHours();
            var minutes = time.getMinutes();
            var seconds = time.getSeconds();

            if (month < 10) month = '0' + month;
            if (date < 10) date = '0' + date;
            if (hours < 10) hours = '0' + hours;
            if (minutes < 10) minutes = '0' + minutes;
            if (seconds < 10) seconds = '0' + seconds;

            var ts = year + '-' + month + '-' + date;
            ts += ' ' + hours + ':' + minutes + ':' + seconds;
            return ts;
        } else {
            return '';
        }
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
        var messenger = Messenger.getInstance();
        var server = messenger.server;
        var status = server.getStatus();
        if (!status.equals(StarStatus.Connected)) {
            alert('Station not connect');
            return false;
        }
        var user = server.currentUser;
        if (!user) {
            alert('User not login');
            return false;
        }
        var receiver = this.__identifier;
        if (receiver.isGroup()) {
            var facebook = Facebook.getInstance();
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
        if (messenger.sendContent(content, receiver, null, false)) {
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

}(dicq, tarsier.ui, DIMP);
