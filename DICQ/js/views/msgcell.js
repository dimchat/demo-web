
//
//  Message Cell for Chat history (Table View)
//
!function (ns, tui, app, sdk) {
    'use strict';

    var Label = tui.Label;
    var Image = tui.Image;
    var TableViewCell = tui.TableViewCell;

    var Interface = sdk.type.Interface;
    var Command = sdk.protocol.Command;
    var ImageContent = sdk.protocol.ImageContent;
    var MessageBuilder = app.cpu.MessageBuilder;
    var Anonymous = app.Anonymous;

    var MessageCell = function (cell) {
        TableViewCell.call(this, cell);
    };
    MessageCell.prototype = Object.create(TableViewCell.prototype);
    MessageCell.prototype.constructor = MessageCell;

    MessageCell.prototype.setMessage = function (iMsg) {
        // clear children
        this.removeChildren();

        var facebook = app.GlobalVariable.getInstance().facebook;
        var user = facebook.getCurrentUser();
        var sender = iMsg.getSender();

        if (user.getIdentifier().equals(sender)) {
            this.setClassName('sent');
        } else {
            this.setClassName('received');
        }

        // message time
        var time = iMsg.getTime();
        var timeView = new Label();
        timeView.setClassName('time');
        timeView.setText(time_string(time));
        this.appendChild(timeView);

        // name & number
        var name = facebook.getName(sender);
        if (!name) {
            name = sender.name;
        }
        var number = Anonymous.getNumberString(sender);
        var nameView = new Label();
        nameView.setClassName('name');
        nameView.setText(name + ' (' + number + ')');
        this.appendChild(nameView);

        // message content
        var content = iMsg.getContent();
        if (Interface.conforms(content, Command)) {
            this.setClassName('cmd');
        }

        var contentView = null;
        if (Interface.conforms(content, ImageContent)) {
            contentView = image_content_view(content, sender);
        }
        if (!contentView) {
            contentView = text_content_view(content, sender);
        }
        contentView.setClassName('content');
        this.appendChild(contentView);

        return this;
    };

    var image_content_view = function (content, sender) {
        var base64 = null;
        var ftp = app.network.FtpServer;
        var data = ftp.getFileData(content);
        if (data) {
            // get image data from decrypted data
            base64 = sdk.format.Base64.encode(data);
        } else {
            // get image data from thumbnail
            var thumbnail = content.getValue("thumbnail");
            if (thumbnail && thumbnail.length > 0) {
                base64 = thumbnail;
            }
        }
        if (base64) {
            var image = new Image();
            image.setSrc('data:image/png;base64,' + base64);
            return image;
        } else {
            return null;
        }
    };

    var text_content_view = function (content, sender) {
        var textView = new Label();
        var text;
        if (Interface.conforms(content, Command)) {
            text = MessageBuilder.getCommandText(content, sender);
        } else {
            text = MessageBuilder.getContentText(content, sender);
        }
        textView.setText(text);
        return textView;
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

    //-------- namespace --------
    ns.MessageCell = MessageCell;

}(dicq, tarsier.ui, SECHAT, DIMP);
