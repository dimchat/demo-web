
!function (ns, tui, dimp) {
    'use strict';

    var $ = tui.$;

    var Point = tui.Point;
    var Size = tui.Size;
    var Rect = tui.Rect;

    var ScrollView = tui.ScrollView;
    var Label = tui.Label;
    var TextArea = tui.TextArea;
    var Button = tui.Button;
    var Image = tui.Image;
    var Window = tui.Window;

    var TextContent = dimp.protocol.TextContent;
    var Facebook = dimp.Facebook;
    var Messenger = dimp.Messenger;
    var StarStatus = dimp.stargate.StarStatus;

    var NotificationCenter = dimp.stargate.NotificationCenter;

    var MessageTable = dimp.db.MessageTable;

    var random_point = function () {
        var x = 50 + Math.random() * 100;
        var y = 50 + Math.random() * 100;
        return new Point(Math.round(x), Math.round(y));
    };

    var ChatWindow = function () {
        var frame = new Rect(random_point(), new Size(640, 480));
        Window.call(this, frame);
        this.setClassName('chatWindow');
        this.setTitle('Chat');

        this.__identifier = null;

        // image
        var image = new Image();
        image.setClassName('logoImageView');
        image.setSrc('https://dimchat.github.io/images/icon-57.png');
        this.appendChild(image);
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
        var history = new ScrollView();
        history.setClassName('historyView');
        this.appendChild(history);
        this.historyView = history;

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
        button.onClick = function () {
            win.sendText(message.getValue());
        };
        this.appendChild(button);

        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, nc.kNotificationMessageReceived);
    };
    ChatWindow.prototype = Object.create(Window.prototype);
    ChatWindow.prototype.constructor = ChatWindow;

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

    ChatWindow.prototype.onReceiveNotification = function (notification) {
        var identifier = this.__identifier;
        if (!identifier) {
            throw Error('conversation ID not set');
        }
        var nc = NotificationCenter.getInstance();
        var name = notification.name;
        if (name === nc.kNotificationMessageReceived) {
            var msg = notification.userInfo;
            var env = msg.envelope;
            if (identifier.equals(env.getGroup())) {
                this.appendMessage(msg);
            } else if (identifier.equals(env.sender)) {
                this.appendMessage(msg);
            } else if (identifier.equals(env.receiver)) {
                this.appendMessage(msg);
            }
        }
    };

    ChatWindow.prototype.reloadData = function () {
        this.clearMessages();
        var db = MessageTable.getInstance();
        var messages = db.loadMessages(this.__identifier);
        if (messages) {
            for (var i = 0; i < messages.length; ++i) {
                this.appendMessage(messages[i]);
            }
        }
    };

    ChatWindow.prototype.clearMessages = function () {
        var history = this.historyView.__ie;
        history.innerText = '';
    };
    ChatWindow.prototype.appendMessage = function (iMsg) {
        var history = this.historyView.__ie;
        var text = history.innerText;
        if (text) {
            text += '\n--------\n';
        }
        // time
        var time = iMsg.envelope.getTime();
        if (time) {
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
            text += '[' + ts + '] ';
        }
        // sender
        var facebook = Facebook.getInstance();
        var sender = facebook.getIdentifier(iMsg.envelope.sender);
        var name = facebook.getNickname(sender);
        if (!name) {
            name = sender.name;
        }
        var number = facebook.getNumberString(sender);
        text += name + ' (' + number + '):\n';
        // text
        var content = iMsg.content;
        if (content instanceof TextContent) {
            text += content.getText();
            history.innerText = text;
            history.scrollTop = history.scrollHeight;
        }
    };

    ChatWindow.prototype.sendText = function (text) {
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
                    alert('Group members not found.');
                }
                return false;
            }
            content.setGroup(receiver);
        }
        if (messenger.sendContent(content, receiver, null, false)) {
            console.log('sending message: ', content);
            this.messageView.setValue('');
            this.reloadData();
            return true;
        } else {
            alert('Cannot send message now.');
            return false;
        }
    };

    ChatWindow.show = function (identifier, clazz) {
        var box = null;
        var elements = document.getElementsByClassName('chatWindow');
        if (elements) {
            var item;
            for (var i = 0; i < elements.length; ++i) {
                item = $(elements[i]);
                if (item.__identifier && item.__identifier.equals(identifier)) {
                    box = item;
                }
            }
        }
        if (box === null) {
            box = new clazz();
            $(document.body).appendChild(box);
            box.setIdentifier(identifier);
        }
        box.floatToTop();
        return box;
    };

    ns.ChatWindow = ChatWindow;

}(window, tarsier.ui, DIMP);
