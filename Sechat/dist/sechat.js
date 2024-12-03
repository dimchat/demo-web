/**
 *  DIM-Client-Example (v1.0.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Nov. 27, 2024
 * @copyright (c) 2024 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof SECHAT !== 'object') {
    SECHAT = DIMP
}
(function (ns) {
    'use strict';
    var NotificationNames = {
        StationConnecting: 'StationConnecting',
        StationConnected: 'StationConnected',
        StationError: 'StationError',
        SessionStateChanged: 'SessionStateChanged',
        ServiceProviderUpdated: 'ServiceProviderUpdated',
        MetaAccepted: 'MetaAccepted',
        DocumentUpdated: 'DocumentUpdated',
        ContactsUpdated: 'ContactsUpdated',
        MembersUpdated: 'MembersUpdated',
        GroupRemoved: 'GroupRemoved',
        MessageUpdated: 'MessageUpdated',
        SearchUpdated: 'SearchUpdated'
    }
    if (typeof ns.model !== 'object') {
        ns.model = {}
    }
    ns.NotificationNames = NotificationNames
})(SECHAT);
(function (ns, sdk) {
    'use strict';
    var Hex = sdk.format.Hex;
    var UTF8 = sdk.format.UTF8;
    var MD5 = sdk.digest.MD5;
    var Log = sdk.lnc.Log;
    var Storage = ns.dos.SessionStorage;
    var get_configuration = function () {
        return ns.Configuration.getInstance()
    };
    var get_http_client = function () {
        return ns.network.HTTP
    };
    var md5 = function (data) {
        var hash = MD5.digest(data);
        return Hex.encode(hash)
    };
    var fetch_filename = function (url) {
        var pos;
        pos = url.indexOf('?');
        if (pos > 0) {
            url = url.substr(0, pos)
        }
        pos = url.indexOf('#');
        if (pos > 0) {
            url = url.substr(0, pos)
        }
        pos = url.lastIndexOf('/');
        if (pos < 0) {
            pos = url.lastIndexOf('\\');
            if (pos < 0) {
                return url
            }
        }
        return url.substr(pos + 1)
    };
    var unique_filename = function (url) {
        var filename = fetch_filename(url);
        var pos = filename.indexOf('.');
        if (pos !== 32) {
            var utf8 = UTF8.encode(url);
            if (pos > 0) {
                filename = md5(utf8) + filename.substr(pos)
            } else {
                filename = md5(utf8)
            }
        }
        return filename
    };
    var generate_salt = function () {
        var data = new Uint8Array(16);
        for (var i = 0; i < 16; ++i) {
            data[i] = Math.floor(Math.random() * 256)
        }
        return data
    };
    var secret_digest = function (data, secret, salt) {
        var concat = new Uint8Array(data.length + secret.length + salt.length);
        concat.set(data, 0);
        concat.set(secret, data.length);
        concat.set(salt, data.length + secret.length);
        return MD5.digest(concat)
    };
    var upload = function (type, data, filename, identifier, url, callback) {
        var config = get_configuration();
        var secret = config.getMD5Secret();
        var salt = generate_salt();
        var digest = secret_digest(data, secret, salt);
        url = url.replace('{ID}', identifier.getAddress().toString());
        url = url.replace('{MD5}', Hex.encode(digest));
        url = url.replace('{SALT}', Hex.encode(salt));
        if (!callback) {
            callback = function (xhr, url) {
                var response = new Uint8Array(xhr.response);
                upload_success(type, data, filename, identifier, url, response)
            }
        }
        var http = get_http_client();
        http.upload(url, data, filename, type, callback)
    }
    var FtpServer = {
        uploadAvatar: function (image, sender) {
            var filename = md5(image) + '.jpg';
            var config = get_configuration();
            var up = config.getUploadURL();
            upload('avatar', image, filename, sender, up, null);
            var down = config.getAvatarURL();
            down = down.replace('{ID}', sender.getAddress.toString());
            down = down.replace('{filename}', filename);
            return down
        }, downloadAvatar: function (url, identifier) {
            return url
        }, uploadEncryptedData: function (data, filename, sender) {
            var pos = filename.indexOf('.');
            if (pos > 0) {
                filename = md5(data) + filename.substr(pos)
            } else {
                filename = md5(data)
            }
            var config = get_configuration();
            var up = config.getUploadURL();
            upload('file', data, filename, sender, up, null);
            var down = config.getDownloadURL();
            down = down.replace('{ID}', sender.getAddress.toString());
            down = down.replace('{filename}', filename);
            return down
        }, downloadEncryptedData: function (url) {
            var filename = unique_filename(url);
            var data = this.loadFileData(filename);
            if (data) {
                return data
            }
            var ftp = this;
            get_http_client().download(url, function (xhr, url) {
                var response = new Uint8Array(xhr.response);
                if (response.length > 0) {
                    ftp.saveFileData(response, filename);
                    download_success(response, url)
                }
            });
            return null
        }, saveFileData: function (data, filename) {
            return Storage.saveData(data, filename)
        }, loadFileData: function (filename) {
            return Storage.loadData(filename)
        }, getFileData: function (content) {
            var data = content.getData('data');
            if (data) {
                return data
            }
            var filename = content.getFilename();
            if (filename) {
                data = this.loadFileData(filename);
                if (data) {
                    return data
                }
            }
            var url = content.getURL();
            if (url) {
                data = this.downloadEncryptedData(url);
                if (data) {
                    return decrypt_file_data(data, content, this)
                }
            }
            return null
        }
    };
    var decrypt_file_data = function (encrypted, content, ftp) {
        var filename = content.getFilename();
        var pwd = content.getPassword();
        if (!pwd || !filename) {
            Log.error('cannot decrypt file data', content);
            return null
        }
        var data = pwd.decrypt(encrypted);
        var pos = filename.indexOf('.');
        if (pos > 0) {
            filename = md5(data) + filename.substr(pos)
        } else {
            filename = md5(data)
        }
        if (ftp.saveFileData(data, filename)) {
            content.setFilename(filename)
        }
        return data
    };
    var upload_success = function (type, data, filename, sender, url, response) {
    };
    var download_success = function (url, response) {
    };
    ns.network.FtpServer = FtpServer
})(SECHAT, DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var FileContent = ns.protocol.FileContent;
    var ImageContent = ns.protocol.ImageContent;
    var AudioContent = ns.protocol.AudioContent;
    var VideoContent = ns.protocol.VideoContent;
    var TextContent = ns.protocol.TextContent;
    var PageContent = ns.protocol.PageContent;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var AnyContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger)
    };
    Class(AnyContentProcessor, BaseContentProcessor, null, null);
    AnyContentProcessor.prototype.process = function (content, rMsg) {
        var text;
        if (Interface.conforms(content, FileContent)) {
            if (Interface.conforms(content, ImageContent)) {
                text = 'Image received'
            } else if (Interface.conforms(content, AudioContent)) {
                text = 'Voice message received'
            } else if (Interface.conforms(content, VideoContent)) {
                text = 'Movie received'
            } else {
                text = 'File received'
            }
        } else if (Interface.conforms(content, TextContent)) {
            text = 'Text message received'
        } else if (Interface.conforms(content, PageContent)) {
            text = 'Web page received'
        } else {
            return BaseContentProcessor.prototype.process.call(this, content, rMsg)
        }
        var group = content.getGroup();
        if (group) {
            return null
        }
        var receipt = ReceiptCommand.create(text, rMsg.getEnvelope(), content);
        return [receipt]
    };
    ns.cpu.AnyContentProcessor = AnyContentProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var BlockCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger)
    };
    Class(BlockCommandProcessor, BaseCommandProcessor, null, null);
    BlockCommandProcessor.prototype.process = function (content, rMsg) {
        return []
    };
    ns.cpu.BlockCommandProcessor = BlockCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var MuteCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger)
    };
    Class(MuteCommandProcessor, BaseCommandProcessor, null, null);
    MuteCommandProcessor.prototype.process = function (content, rMsg) {
        return []
    };
    ns.cpu.MuteCommandProcessor = MuteCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var SearchCommand = ns.protocol.SearchCommand;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var NotificationCenter = ns.lnc.NotificationCenter;
    var SearchCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger)
    };
    Class(SearchCommandProcessor, BaseCommandProcessor, null, {});
    SearchCommandProcessor.prototype.process = function (content, rMsg) {
        parse.call(this, content);
        post_notification('SearchUpdated', this, {'content': content, 'envelope': rMsg.getEnvelope()});
        return []
    };
    var post_notification = function (name, sender, userInfo) {
        var nc = NotificationCenter.getInstance();
        nc.postNotification(new ns.lnc.Notification(name, sender, userInfo))
    };
    var parse = function (command) {
        var facebook = this.getFacebook();
        var users = command.getUsers();
        var online = command.getCmd() === SearchCommand.ONLINE_USERS;
        var cnt = users ? users.length : 0;
        var text;
        if (cnt === 0) {
            if (online) {
                text = 'No user online now.'
            } else {
                text = 'User not found.'
            }
        } else if (cnt === 1) {
            if (online) {
                text = 'One user online now,\n' + user_info(users[0], facebook)
            } else {
                text = 'Got one user,\n' + user_info(users[0], facebook)
            }
        } else {
            if (online) {
                text = cnt + ' users online now,'
            } else {
                text = 'Got ' + cnt + ' users,'
            }
            for (var i = 0; i < cnt; ++i) {
                text += '\n' + user_info(users[i], facebook)
            }
        }
        command.setValue('text', text)
    };
    var user_info = function (string, facebook) {
        var identifier = ID.parse(string);
        if (!identifier) {
            return string
        }
        var nickname = facebook.getName(identifier);
        return identifier + ' "' + nickname + '"'
    };
    ns.cpu.SearchCommandProcessor = SearchCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var StorageCommand = ns.protocol.StorageCommand;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var StorageCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger)
    };
    Class(StorageCommandProcessor, BaseCommandProcessor, null, null);
    StorageCommandProcessor.prototype.process = function (content, rMsg) {
        var title = content.getTitle();
        if (title === StorageCommand.CONTACTS) {
        } else if (title === StorageCommand.PRIVATE_KEY) {
        }
        return []
    };
    ns.cpu.StorageCommandProcessor = StorageCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var TextContent = ns.protocol.TextContent;
    var PageContent = ns.protocol.PageContent;
    var FileContent = ns.protocol.FileContent;
    var ImageContent = ns.protocol.ImageContent;
    var AudioContent = ns.protocol.AudioContent;
    var VideoContent = ns.protocol.VideoContent;
    var LoginCommand = ns.protocol.LoginCommand;
    var GroupCommand = ns.protocol.GroupCommand;
    var InviteCommand = ns.protocol.group.InviteCommand;
    var ExpelCommand = ns.protocol.group.ExpelCommand;
    var QuitCommand = ns.protocol.group.QuitCommand;
    var ResetCommand = ns.protocol.group.ResetCommand;
    var QueryCommand = ns.protocol.group.QueryCommand;
    var MessageBuilder = {
        getContentText: function (content) {
            var text = content.getString('text');
            if (text) {
                return text
            } else if (Interface.conforms(content, TextContent)) {
                return content.getText()
            }
            if (Interface.conforms(content, FileContent)) {
                if (Interface.conforms(content, ImageContent)) {
                    text = '[Image:' + content.getFilename() + ']'
                } else if (Interface.conforms(content, AudioContent)) {
                    text = '[Voice:' + content.getFilename() + ']'
                } else if (Interface.conforms(content, VideoContent)) {
                    text = '[Movie:' + content.getFilename() + ']'
                } else {
                    text = '[File:' + content.getFilename() + ']'
                }
            } else if (Interface.conforms(content, PageContent)) {
                text = '[URL:' + content.getURL() + ']'
            } else {
                text = 'Current version doesn\'t support this message type: ' + content.getType()
            }
            content.setValue('text', text);
            return text
        }, getCommandText: function (content, sender) {
            var text = content.getString('text');
            if (text) {
                return text
            }
            if (Interface.conforms(content, LoginCommand)) {
                text = getLoginCommandText(content, sender)
            } else if (Interface.conforms(content, GroupCommand)) {
                text = getGroupCommandText(content, sender)
            } else {
                text = 'Current version doesn\'t support this command: ' + content.getCmd()
            }
            content.setValue('text', text);
            return text
        }, getInstance: function () {
            return this
        }
    };
    var getUsername = function (string) {
        var facebook = ns.GlobalVariable.getFacebook();
        return facebook.getName(ID.parse(string))
    };
    var getLoginCommandText = function (content, sender) {
        var identifier = content.getIdentifier();
        if (!sender.equals(identifier)) {
            Log.error('login command error', content, sender)
        }
        var station = content.getStation();
        if (station) {
            var host = station['host'];
            var port = station['port'];
            station = '(' + host + ':' + port + ') ' + getUsername(station['ID'])
        }
        return getUsername(identifier) + ' login: ' + station
    };
    var getGroupCommandText = function (content, sender) {
        if (Interface.conforms(content, InviteCommand)) {
            return getInviteCommandText(content, sender)
        }
        if (Interface.conforms(content, ExpelCommand)) {
            return getExpelCommandText(content, sender)
        }
        if (Interface.conforms(content, QuitCommand)) {
            return getQuitCommandText(content, sender)
        }
        if (Interface.conforms(content, ResetCommand)) {
            return getResetCommandText(content, sender)
        }
        if (Interface.conforms(content, QueryCommand)) {
            return getQueryCommandText(content, sender)
        }
        Log.error('unsupported group command', content);
        return 'unsupported group command: ' + content.getCmd()
    };
    var getInviteCommandText = function (content, sender) {
        var addedList = content.getValue('added');
        if (!addedList) {
            addedList = []
        }
        var names = [];
        for (var i = 0; i < addedList.length; ++i) {
            names.push(getUsername(addedList[i]))
        }
        return getUsername(sender) + ' has invited members: ' + names.join(', ')
    };
    var getExpelCommandText = function (content, sender) {
        var removedList = content.getValue('removed');
        if (!removedList) {
            removedList = []
        }
        var names = [];
        for (var i = 0; i < removedList.length; ++i) {
            names.push(getUsername(removedList[i]))
        }
        return getUsername(sender) + ' has removed members: ' + names.join(', ')
    };
    var getQuitCommandText = function (content, sender) {
        return getUsername(sender) + ' has quit group chat.'
    };
    var getResetCommandText = function (content, sender) {
        var text = getUsername(sender) + ' has updated members';
        var i, names;
        var removedList = content.getValue('removed');
        if (removedList && removedList.length > 0) {
            names = [];
            for (i = 0; i < removedList.length; ++i) {
                names.push(getUsername(removedList[i]))
            }
            text += ', removed: ' + names.join(', ')
        }
        var addedList = content.getValue('added');
        if (addedList && addedList.length > 0) {
            names = [];
            for (i = 0; i < addedList.length; ++i) {
                names.push(getUsername(addedList[i]))
            }
            text += ', added: ' + names.join(', ')
        }
        return text
    };
    var getQueryCommandText = function (content, sender) {
        return getUsername(sender) + ' was querying group info, responding...'
    };
    ns.cpu.MessageBuilder = MessageBuilder
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Command = ns.protocol.Command;
    var ClientContentProcessorCreator = ns.cpu.ClientContentProcessorCreator;
    var ClientProcessorCreator = function (facebook, messenger) {
        ClientContentProcessorCreator.call(this, facebook, messenger)
    };
    Class(ClientProcessorCreator, ClientContentProcessorCreator, null, {
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (type === 0) {
                return new ns.cpu.AnyContentProcessor(facebook, messenger)
            }
            return ClientContentProcessorCreator.prototype.createContentProcessor.call(this, type)
        }, createCommandProcessor: function (type, cmd) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            switch (cmd) {
                case Command.MUTE:
                    return new ns.cpu.MuteCommandProcessor(facebook, messenger);
                case Command.BLOCK:
                    return new ns.cpu.BlockCommandProcessor(facebook, messenger);
                case Command.SEARCH:
                case Command.ONLINE_USERS:
                    return new ns.cpu.SearchCommandProcessor(facebook, messenger);
                case Command.STORAGE:
                case Command.CONTACTS:
                case Command.PRIVATE_KEY:
                    return new ns.cpu.StorageCommandProcessor(facebook, messenger)
            }
            return ClientContentProcessorCreator.prototype.createCommandProcessor.call(this, type, cmd)
        }
    });
    ns.cpu.ClientProcessorCreator = ClientProcessorCreator
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Storage = ns.dos.LocalStorage;
    var UserDBI = ns.dbi.UserDBI;
    var users_path = function () {
        return 'local_users'
    };
    var contacts_path = function (user) {
        return 'user.' + user.getAddress().toString() + '.contacts'
    };
    var UserStorage = function () {
        Object.call(this)
    };
    Class(UserStorage, Object, [UserDBI], null);
    UserStorage.prototype.setCurrentUser = function (user) {
        var localUsers = this.getLocalUsers();
        var pos;
        for (pos = localUsers.length - 1; pos >= 0; --pos) {
            if (localUsers[pos].equals(user)) {
                break
            }
        }
        if (pos === 0) {
            return false
        } else if (pos > 0) {
            localUsers.splice(pos, 1)
        }
        localUsers.unshift(user);
        return this.saveLocalUsers(localUsers)
    };
    UserStorage.prototype.getLocalUsers = function () {
        var path = users_path();
        var array = Storage.loadJSON(path);
        if (array) {
            return ID.convert(array)
        } else {
            return []
        }
    };
    UserStorage.prototype.saveLocalUsers = function (users) {
        var path = users_path();
        var array = ID.revert(users);
        return Storage.saveJSON(array, path)
    };
    UserStorage.prototype.getContacts = function (user) {
        var path = contacts_path(user);
        var array = Storage.loadJSON(path);
        if (array) {
            return ID.convert(array)
        } else {
            return []
        }
    };
    UserStorage.prototype.saveContacts = function (contacts, user) {
        var path = contacts_path(user);
        var array = ID.revert(contacts);
        return Storage.saveJSON(array, path)
    };
    ns.database.UserStorage = UserStorage
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Storage = ns.dos.LocalStorage;
    var GroupDBI = ns.dbi.GroupDBI;
    var members_path = function (group) {
        return 'group.' + group.getAddress().toString() + '.members'
    };
    var bots_path = function (group) {
        return 'group.' + group.getAddress().toString() + '.bots'
    };
    var admins_path = function (group) {
        return 'group.' + group.getAddress().toString() + '.admins'
    };
    var GroupStorage = function () {
        Object.call(this)
    };
    Class(GroupStorage, Object, [GroupDBI], null);
    GroupStorage.prototype.getFounder = function (group) {
        return null
    };
    GroupStorage.prototype.getOwner = function (group) {
        return null
    };
    GroupStorage.prototype.getMembers = function (group) {
        var path = members_path(group);
        var array = Storage.loadJSON(path);
        if (array) {
            return ID.convert(array)
        } else {
            return []
        }
    };
    GroupStorage.prototype.saveMembers = function (members, group) {
        var path = members_path(group);
        var array = ID.revert(members);
        return Storage.saveJSON(array, path)
    };
    GroupStorage.prototype.getAssistants = function (group) {
        var path = bots_path(group);
        var array = Storage.loadJSON(path);
        if (array) {
            return ID.convert(array)
        } else {
            return []
        }
    };
    GroupStorage.prototype.saveAssistants = function (members, group) {
        var path = bots_path(group);
        var array = ID.revert(members);
        return Storage.saveJSON(array, path)
    };
    GroupStorage.prototype.getAdministrators = function (group) {
        var path = admins_path(group);
        var array = Storage.loadJSON(path);
        if (array) {
            return ID.convert(array)
        } else {
            return []
        }
    };
    GroupStorage.prototype.saveAdministrators = function (admins, group) {
        var path = admins_path(group);
        var array = ID.revert(admins);
        return Storage.saveJSON(array, path)
    };
    ns.database.GroupStorage = GroupStorage
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Command = ns.protocol.Command;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var Storage = ns.dos.LocalStorage;
    var LoginDBI = ns.dbi.LoginDBI;
    var store_path = function (user) {
        return 'user.' + user.getAddress().toString() + '.login'
    };
    var LoginStorage = function () {
        Object.call(this)
    };
    Class(LoginStorage, Object, [LoginDBI], null);
    LoginStorage.prototype.getLoginCommandMessage = function (user) {
        var path = store_path(user);
        var info = Storage.loadJSON(path);
        if (info) {
            var cmd = Command.parse(info['cmd']);
            var msg = ReliableMessage.parse(info['msg']);
            return [cmd, msg]
        } else {
            return [null, null]
        }
    };
    LoginStorage.prototype.saveLoginCommandMessage = function (user, command, message) {
        var cmd = !command ? null : command.toMap();
        var msg = !message ? null : message.toMap();
        var info = {'cmd': cmd, 'msg': msg};
        var path = store_path(user);
        return Storage.saveJSON(info, path)
    };
    ns.database.LoginStorage = LoginStorage
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var MessageStorage = function () {
        Object.call(this);
        this.__instant_messages = {}
    };
    Class(MessageStorage, Object, null, null);
    var insert_msg = function (messages, msg) {
        var pos = messages.length - 1;
        var msg_time = msg.getFloat('time', 0);
        if (msg_time === 0) {
            messages.push(msg);
            return pos + 1
        }
        var item, item_time;
        var i;
        for (i = pos; i >= 0; --i) {
            item = messages[i];
            item_time = item.getFloat('time', 0);
            if (item_time <= 0) {
                continue
            }
            if (item_time <= msg_time) {
                pos = i;
                break
            } else {
                pos = i - 1
            }
        }
        messages.splice(pos + 1, 0, msg);
        return pos + 1
    };
    MessageStorage.prototype.numberOfConversations = function () {
        var keys = Object.keys(this.__instant_messages);
        return keys.length
    };
    MessageStorage.prototype.conversationAtIndex = function (index) {
        var keys = Object.keys(this.__instant_messages);
        return ID.parse(keys[index])
    };
    MessageStorage.prototype.removeConversationAtIndex = function (index) {
        var keys = Object.keys(this.__instant_messages);
        delete this.__instant_messages[keys[index]]
    };
    MessageStorage.prototype.removeConversation = function (entity) {
        delete this.__instant_messages[entity.toString()]
    };
    MessageStorage.prototype.numberOfMessages = function (entity) {
        var messages = this.__instant_messages[entity.toString()];
        if (messages) {
            return messages.length
        } else {
            return 0
        }
    };
    MessageStorage.prototype.numberOfUnreadMessages = function (entity) {
    };
    MessageStorage.prototype.clearUnreadMessages = function (entity) {
    };
    MessageStorage.prototype.lastMessage = function (entity) {
        var messages = this.__instant_messages[entity.toString()];
        if (messages && messages.length > 0) {
            return messages[messages.length - 1]
        } else {
            return null
        }
    };
    MessageStorage.prototype.messageAtIndex = function (index, entity) {
        var messages = this.__instant_messages[entity.toString()];
        return messages[index]
    };
    MessageStorage.prototype.insertMessage = function (iMsg, entity) {
        var cid = entity.toString();
        var messages = this.__instant_messages[cid];
        if (!messages) {
            this.__instant_messages[cid] = [iMsg];
            return true
        }
        var pos = find_instant(messages, iMsg);
        if (pos < 0) {
            insert_msg(messages, iMsg);
            return true
        }
        messages[pos] = iMsg;
        return true
    };
    MessageStorage.prototype.removeMessage = function (iMsg, entity) {
        var cid = entity.toString();
        var messages = this.__instant_messages[cid];
        if (!messages) {
            return false
        }
        var pos = find_instant(messages, iMsg);
        if (pos < 0) {
            return false
        }
        if (messages.length === 1) {
            delete this.__instant_messages[cid]
        } else {
            messages.splice(pos, 1)
        }
        return true
    };
    var find_instant = function (messages, msg) {
        var sn = msg.getContent().getSerialNumber();
        for (var i = messages.length - 1; i >= 0; --i) {
            if (messages[i].getContent().getSerialNumber() === sn) {
                return i
            }
        }
        return -1
    };
    MessageStorage.prototype.withdrawMessage = function (iMsg, entity) {
    };
    MessageStorage.prototype.saveReceipt = function (iMsg, entity) {
    };
    ns.database.MessageStorage = MessageStorage
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Storage = ns.dos.SessionStorage;
    var CipherKeyDBI = ns.dbi.CipherKeyDBI;
    var msg_key_path = function (from, to) {
        from = from.getAddress().toString();
        to = to.getAddress().toString();
        return 'msg_key.' + from + '-' + to
    };
    var CipherKeyStorage = function () {
        Object.call(this)
    };
    Class(CipherKeyStorage, Object, [CipherKeyDBI], null);
    CipherKeyStorage.prototype.getCipherKey = function (from, to, generate) {
        var path = msg_key_path(from, to);
        var info = Storage.loadJSON(path);
        return SymmetricKey.parse(info)
    };
    CipherKeyStorage.prototype.cacheCipherKey = function (from, to, key) {
        var path = msg_key_path(from, to);
        var info = !key ? null : key.toMap();
        return Storage.saveJSON(info, path)
    };
    ns.database.CipherKeyStorage = CipherKeyStorage
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Storage = ns.dos.LocalStorage;
    var ProviderDBI = ns.dbi.ProviderDBI;
    var stations_path = function (provider) {
        return 'isp.' + provider.getAddress().toString() + '.stations'
    };
    var ISP = ID.parse('gsp@everywhere');
    var load_stations = function () {
        var stations = [];
        var path = stations_path(ISP);
        var array = Storage.loadJSON(path);
        if (array) {
            var item;
            for (var i = 0; i < array.length; ++i) {
                item = array[i];
                stations.push({'host': item['host'], 'port': item['port'], 'ID': ID.parse(item['ID'])})
            }
        }
        return stations
    };
    var save_stations = function (stations) {
        var array = [];
        var item;
        var host, port, sid;
        for (var i = 0; i < stations.length; ++i) {
            item = stations[i];
            host = item['host'];
            port = item['port'];
            sid = item['ID'];
            if (sid) {
                array.push({'host': host, 'port': port, 'ID': sid.toString()})
            } else {
                array.push({'host': host, 'port': port})
            }
        }
        var path = stations_path(ISP);
        return Storage.saveJSON(array, path)
    };
    var find_station = function (stations, host, port) {
        var item;
        for (var i = 0; i < stations.length; ++i) {
            item = stations[i];
            if (item['host'] === host && item['port'] === port) {
                return i
            }
        }
        return -1
    };
    var ProviderStorage = function () {
        Object.call(this);
        this.__stations = null
    };
    Class(ProviderStorage, Object, [ProviderDBI], null);
    ProviderStorage.prototype.allNeighbors = function () {
        if (this.__stations === null) {
            this.__stations = load_stations()
        }
        return this.__stations
    };
    ProviderStorage.prototype.getNeighbor = function (ip, port) {
        var stations = this.allNeighbors();
        var index = find_station(stations, ip, port);
        if (index < 0) {
            return null
        }
        return stations[index]['ID']
    };
    ProviderStorage.prototype.addNeighbor = function (ip, port, identifier) {
        var stations = this.allNeighbors();
        var index = find_station(stations, ip, port);
        if (index >= 0) {
            return false
        }
        stations.unshift({'host': ip, 'port': port, 'ID': identifier});
        return save_stations(stations)
    };
    ProviderStorage.prototype.removeNeighbor = function (ip, port) {
        var stations = this.allNeighbors();
        var index = find_station(stations, ip, port);
        if (index < 0) {
            return false
        }
        stations.splice(index, 1);
        return save_stations(stations)
    };
    ns.database.ProviderStorage = ProviderStorage
})(DIMP);
(function (ns, sdk) {
    'use strict';
    var Hex = sdk.format.Hex;
    var Configuration = {
        getInstance: function () {
            return this
        }, getDefaultProvider: function () {
            if (this.__sp === null) {
                this.__sp = load_config()
            }
            return this.__sp
        }, getMD5Secret: function () {
            var info = this.getDefaultProvider();
            return info['MD5_SECRET']
        }, getUploadURL: function () {
            var info = this.getDefaultProvider();
            return info['UPLOAD_URL']
        }, getDownloadURL: function () {
            var info = this.getDefaultProvider();
            return info['DOWNLOAD_URL']
        }, getAvatarURL: function () {
            var info = this.getDefaultProvider();
            return info['AVATAR_URL']
        }, getTermsURL: function () {
            return 'https://wallet.dim.chat/dimchat/sechat/privacy.html'
        }, getAboutURL: function () {
            return 'https://dim.chat/sechat'
        }, __sp: null
    };
    var load_config = function () {
        return {
            'UPLOAD_URL': 'http://106.52.25.169:8081/{ID}/upload?md5={MD5}&salt={SALT}',
            'DOWNLOAD_URL': 'http://106.52.25.169:8081/download/{ID}/{filename}',
            'AVATAR_URL': 'http://106.52.25.169:8081/avatar/{ID}/{filename}',
            'MD5_SECRET': Hex.decode("12345678")
        }
    };
    ns.Configuration = Configuration
})(SECHAT, DIMP);
(function (ns, sdk) {
    'use strict';
    var Interface = sdk.type.Interface;
    var ContentType = sdk.protocol.ContentType;
    var Entity = sdk.mkm.Entity;
    var Conversation = function (entity) {
        if (Interface.conforms(entity, Entity)) {
            entity = entity.getIdentifier()
        }
        this.__identifier = entity
    };
    Conversation.prototype.getIdentifier = function () {
        return this.__identifier
    };
    Conversation.prototype.isBlocked = function () {
        return false
    };
    Conversation.prototype.isNotFriend = function () {
        return false
    };
    Conversation.prototype.isFriend = function () {
        return true
    };
    Conversation.prototype.getTitle = function () {
        var facebook = ns.GlobalVariable.getFacebook();
        var identifier = this.getIdentifier();
        var name = facebook.getName(identifier);
        if (identifier.isGroup()) {
            var members = facebook.getMembers(identifier);
            var count = !members ? 0 : members.length;
            if (count === 0) {
                return name + ' (...)'
            }
            return name + ' (' + count + ')'
        } else {
            return name
        }
    };
    Conversation.prototype.getLastTime = function () {
        var iMsg = this.getLastMessage();
        var time = !iMsg ? null : iMsg.getTime();
        return time || new Date(0)
    };
    Conversation.prototype.getLastMessage = function () {
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.lastMessage(identifier)
    };
    Conversation.prototype.getLastVisibleMessage = function () {
        var count = this.getNumberOfMessages();
        var iMsg, type;
        for (var index = count - 1; index >= 0; --index) {
            iMsg = this.getMessageAtIndex(index);
            if (!iMsg) {
                continue
            }
            type = iMsg.getType();
            if (ContentType.TEXT.equals(type) || ContentType.FILE.equals(type) || ContentType.IMAGE.equals(type) || ContentType.AUDIO.equals(type) || ContentType.VIDEO.equals(type) || ContentType.PAGE.equals(type) || ContentType.MONEY.equals(type) || ContentType.TRANSFER.equals(type)) {
                return iMsg
            }
        }
        return null
    };
    Conversation.prototype.getNumberOfMessages = function () {
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.numberOfMessages(identifier)
    };
    Conversation.prototype.getNumberOfUnreadMessages = function () {
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.numberOfUnreadMessages(identifier)
    };
    Conversation.prototype.getMessageAtIndex = function (index) {
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.messageAtIndex(index, identifier)
    };
    Conversation.prototype.insertMessage = function (iMsg) {
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.insertMessage(iMsg, identifier)
    };
    Conversation.prototype.removeMessage = function (iMsg) {
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.removeMessage(iMsg, identifier)
    };
    Conversation.prototype.withdrawMessage = function (iMsg) {
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.withdrawMessage(iMsg, identifier)
    };
    Conversation.prototype.saveReceipt = function (iMsg) {
        var database = ns.GlobalVariable.getDatabase();
        var identifier = this.getIdentifier();
        return database.saveReceipt(iMsg, identifier)
    };
    ns.Conversation = Conversation
})(SECHAT, DIMP);
(function (ns, sdk) {
    'use strict';
    var Interface = sdk.type.Interface;
    var Arrays = sdk.type.Arrays;
    var Log = sdk.lnc.Log;
    var EntityType = sdk.protocol.EntityType;
    var ReceiptCommand = sdk.protocol.ReceiptCommand;
    var HandshakeCommand = sdk.protocol.HandshakeCommand;
    var ReportCommand = sdk.protocol.ReportCommand;
    var LoginCommand = sdk.protocol.LoginCommand;
    var MetaCommand = sdk.protocol.MetaCommand;
    var SearchCommand = sdk.protocol.SearchCommand;
    var ForwardContent = sdk.protocol.ForwardContent;
    var InviteCommand = sdk.protocol.group.InviteCommand;
    var QueryCommand = sdk.protocol.group.QueryCommand;
    var Conversation = ns.Conversation;
    var clerk = {conversations: null, conversationMap: {}};
    var Amanuensis = {
        allConversations: function () {
            var all = clerk.conversations;
            if (!array) {
                return []
            }
            var array = [];
            var chat;
            for (var i = 0; i < all.length; ++i) {
                chat = all[i];
                if (chat.getIdentifier().isGroup()) {
                    array.push(chat)
                } else if (chat.isBlocked()) {
                } else if (chat.isNotFriend()) {
                } else {
                    array.push(chat)
                }
            }
            return array
        }, getGroupChats: function () {
            var all = clerk.conversations;
            if (!array) {
                return []
            }
            var array = [];
            var chat;
            for (var i = 0; i < all.length; ++i) {
                chat = all[i];
                if (chat.getIdentifier().isGroup()) {
                    array.push(chat)
                }
            }
            return array
        }, getStrangers: function () {
            var all = clerk.conversations;
            if (!array) {
                return []
            }
            var array = [];
            var chat;
            for (var i = 0; i < all.length; ++i) {
                chat = all[i];
                if (chat.getIdentifier().isGroup()) {
                } else if (EntityType.STATION.equals(chat.getIdentifier().getType())) {
                } else if (chat.isBlocked()) {
                } else if (chat.isFriend()) {
                } else {
                    array.push(chat)
                }
            }
            return array
        }, loadConversations: function () {
            var array = clerk.conversations;
            if (!array) {
                array = [];
                clerk.conversationMap = {};
                var database = ns.GlobalVariable.getDatabase();
                var count = database.numberOfConversations();
                var entity;
                var chat;
                for (var index = 0; index < count; ++index) {
                    entity = database.conversationAtIndex(index);
                    chat = new Conversation(entity);
                    array.push(chat);
                    clerk.conversationMap[entity] = chat
                }
                clerk.conversations = array
            }
            return array
        }, clearConversation: function (identifier) {
            var database = ns.GlobalVariable.getDatabase();
            database.removeConversation(identifier);
            return true
        }, removeConversation: function (identifier) {
            var database = ns.GlobalVariable.getDatabase();
            database.removeConversation(identifier);
            var chat = clerk.conversationMap[identifier];
            if (chat) {
                Arrays.remove(clerk.conversations, chat);
                delete clerk.conversationMap[identifier]
            }
            return true
        }, saveInstantMessage: function (iMsg) {
            var content = iMsg.getContent();
            if (Interface.conforms(content, ReceiptCommand)) {
                return this.saveReceipt(iMsg)
            }
            if (Interface.conforms(content, HandshakeCommand)) {
                return true
            }
            if (Interface.conforms(content, ReportCommand)) {
                return true
            }
            if (Interface.conforms(content, LoginCommand)) {
                return true
            }
            if (Interface.conforms(content, MetaCommand)) {
                return true
            }
            if (Interface.conforms(content, SearchCommand)) {
                return true
            }
            if (Interface.conforms(content, ForwardContent)) {
                return true
            }
            var database = ns.GlobalVariable.getDatabase();
            if (Interface.conforms(content, InviteCommand)) {
                var me = iMsg.getReceiver();
                var group = content.getGroup();
                var key = database.getCipherKey(me, group, false);
                if (key) {
                    key.removeValue('reused')
                }
            } else if (Interface.conforms(content, QueryCommand)) {
                return true
            }
            var cid = _cid(iMsg.getEnvelope(), content);
            var ok = database.insertMessage(iMsg, cid);
            if (ok) {
            }
            return ok
        }, saveReceipt: function (iMsg) {
            var content = iMsg.getContent();
            if (!Interface.conforms(content, ReceiptCommand)) {
                Log.error('receipt error', content, iMsg);
                return false
            }
            Log.info('saving receipt', content, iMsg);
            return true
        }, getInstance: function () {
            return this
        }
    };
    var _cid = function (envelope, content) {
        var group = !content ? null : content.getGroup();
        if (!group) {
            group = envelope.getGroup()
        }
        if (group) {
            return group
        }
        var receiver = envelope.getReceiver();
        if (receiver.isGroup()) {
            return receiver
        }
        var facebook = ns.GlobalVariable.getFacebook();
        var user = facebook.getCurrentUser();
        var sender = envelope.getSender();
        if (user.getIdentifier().equals(sender)) {
            return receiver
        } else {
            return sender
        }
    };
    ns.Amanuensis = Amanuensis
})(SECHAT, DIMP);
(function (ns, sdk) {
    'use strict';
    var SymmetricKey = sdk.crypto.SymmetricKey;
    var PlainKey = sdk.crypto.PlainKey;
    var PrivateKeyStorage = sdk.database.PrivateKeyStorage;
    var MetaStorage = sdk.database.MetaStorage;
    var DocumentStorage = sdk.database.DocumentStorage;
    var ProviderStorage = sdk.database.ProviderStorage;
    var UserStorage = sdk.database.UserStorage;
    var GroupStorage = sdk.database.GroupStorage;
    var LoginStorage = sdk.database.LoginStorage;
    var CipherKeyStorage = sdk.database.CipherKeyStorage;
    var MessageStorage = sdk.database.MessageStorage;
    var Log = sdk.lnc.Log;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    var NotificationNames = ns.NotificationNames;
    var t_private_key = new PrivateKeyStorage();
    var t_meta = new MetaStorage();
    var t_document = new DocumentStorage();
    var t_provider = new ProviderStorage();
    var t_user = new UserStorage();
    var t_group = new GroupStorage();
    var t_login = new LoginStorage();
    var t_cipher_key = new CipherKeyStorage();
    var t_message = new MessageStorage();
    var SharedDatabase = {
        savePrivateKey: function (key, type, user) {
            return t_private_key.savePrivateKey(key, type, user)
        }, getPrivateKeysForDecryption: function (user) {
            var keys = t_private_key.getPrivateKeysForDecryption(user);
            return !keys ? [] : keys
        }, getPrivateKeyForSignature: function (user) {
            return t_private_key.getPrivateKeyForSignature(user)
        }, getPrivateKeyForVisaSignature: function (user) {
            return t_private_key.getPrivateKeyForVisaSignature(user)
        }, saveMeta: function (meta, entity) {
            var ok = t_meta.saveMeta(meta, entity);
            if (ok) {
                post_notification(NotificationNames.MetaAccepted, this, {'ID': entity, 'meta': meta})
            }
            return ok
        }, getMeta: function (entity) {
            return t_meta.getMeta(entity)
        }, saveDocument: function (doc) {
            var ok = t_document.saveDocument(doc);
            if (ok) {
                post_notification(NotificationNames.DocumentUpdated, this, {'ID': doc.getIdentifier(), 'document': doc})
            }
            return ok
        }, getDocuments: function (entity) {
            var docs = t_document.getDocuments(entity);
            return !docs ? [] : docs
        }, getLocalUsers: function () {
            var local_users = t_user.getLocalUsers();
            return !local_users ? [] : local_users
        }, saveLocalUsers: function (users) {
            return t_user.saveLocalUsers(users)
        }, setCurrentUser: function (user) {
            return t_user.setCurrentUser(user)
        }, getCurrentUser: function () {
            var local_users = this.getLocalUsers();
            if (local_users.length === 0) {
                return null
            }
            return local_users[0]
        }, addUser: function (user) {
            var local_users = this.getLocalUsers();
            if (local_users.indexOf(user) >= 0) {
                return true
            }
            local_users.push(user);
            return this.saveLocalUsers(local_users)
        }, removeUser: function (user) {
            var local_users = this.getLocalUsers();
            var pos = local_users.indexOf(user);
            if (pos < 0) {
                return true
            }
            local_users.splice(pos, 1);
            return this.saveLocalUsers(local_users)
        }, getContacts: function (user) {
            var all_contacts = t_user.getContacts(user);
            return !all_contacts ? [] : all_contacts
        }, saveContacts: function (contacts, user) {
            var ok = t_user.saveContacts(contacts, user);
            if (ok) {
                post_notification(NotificationNames.ContactsUpdated, this, {'user': user, 'contacts': contacts})
            }
            return ok
        }, addContact: function (contact, user) {
            var all_contacts = this.getContacts(user);
            if (all_contacts.indexOf(contact) >= 0) {
                return true
            }
            all_contacts.push(contact);
            return this.saveContacts(all_contacts, user)
        }, removeContact: function (contact, user) {
            var all_contacts = this.getContacts(user);
            var pos = all_contacts.indexOf(user);
            if (pos < 0) {
                return true
            }
            all_contacts.splice(pos, 1);
            return this.saveContacts(all_contacts, user)
        }, getFounder: function (group) {
            return t_group.getFounder(group)
        }, getOwner: function (group) {
            return t_group.getOwner(group)
        }, getMembers: function (group) {
            var all_members = t_group.getMembers(group);
            return !all_members ? [] : all_members
        }, saveMembers: function (members, group) {
            var ok = t_group.saveMembers(members, group);
            if (ok) {
                post_notification(NotificationNames.MembersUpdated, this, {'group': group, 'members': members})
            }
            return ok
        }, addMember: function (member, group) {
            var all_members = this.getMembers(group);
            if (all_members.indexOf(member) >= 0) {
                return true
            }
            all_members.push(member);
            return this.saveMembers(all_members, group)
        }, removeMember: function (member, group) {
            var all_members = this.getMembers(group);
            var pos = all_members.indexOf(member);
            if (pos < 0) {
                return true
            }
            all_members.splice(pos, 1);
            return this.saveMembers(all_members, group)
        }, getAssistants: function (group) {
            return t_group.getAssistants(group)
        }, saveAssistants: function (members, group) {
            return t_group.saveAssistants(members, group)
        }, getAdministrators: function (group) {
            return t_group.getAdministrators(group)
        }, saveAdministrators: function (members, group) {
            return t_group.saveAdministrators(members, group)
        }, removeGroup: function (group) {
        }, saveGroupHistory: function (content, rMsg, group) {
            return true
        }, getGroupHistories: function (group) {
            return []
        }, getResetCommandMessage: function (group) {
            return []
        }, clearGroupAdminHistories: function (group) {
            return true
        }, clearGroupMemberHistories: function (group) {
            return true
        }, getLoginCommandMessage: function (user) {
            return t_login.getLoginCommandMessage(user)
        }, saveLoginCommandMessage: function (user, command, message) {
            return t_login.saveLoginCommandMessage(user, command, message)
        }, allProviders: function () {
            return []
        }, addProvider: function (identifier, chosen) {
            return true
        }, updateProvider: function (identifier, chosen) {
            return true
        }, removeProvider: function (identifier) {
            return true
        }, allStations: function (provider) {
            return []
        }, addStation: function (sid, chosen, host, port, provider) {
            return true
        }, updateStation: function (sid, chosen, host, port, provider) {
            return true
        }, removeStation: function (host, port, provider) {
            return true
        }, removeStations: function (provider) {
            return true
        }, allNeighbors: function () {
            return t_provider.allNeighbors()
        }, getNeighbor: function (ip, port) {
            return t_provider.getNeighbor(ip, port)
        }, addNeighbor: function (ip, port, identifier) {
            var ok = t_provider.addNeighbor(ip, port, identifier);
            if (ok) {
                post_notification(NotificationNames.ServiceProviderUpdated, this, {
                    'action': 'add',
                    'host': ip,
                    'port': port,
                    'ID': identifier
                })
            }
            return ok
        }, removeNeighbor: function (ip, port) {
            var ok = t_provider.removeNeighbor(ip, port);
            if (ok) {
                post_notification(NotificationNames.ServiceProviderUpdated, this, {
                    'action': 'remove',
                    'host': ip,
                    'port': port
                })
            }
            return ok
        }, getCipherKey: function (from, to, generate) {
            if (to.isBroadcast()) {
                return PlainKey.getInstance()
            }
            var key = t_cipher_key.getCipherKey(from, to, generate);
            if (!key && generate) {
                key = SymmetricKey.generate(SymmetricKey.AES);
                t_cipher_key.cacheCipherKey(from, to, key)
            }
            return key
        }, cacheCipherKey: function (from, to, key) {
            return t_cipher_key.cacheCipherKey(from, to, key)
        }, getGroupKeys: function (group, sender) {
            return {}
        }, saveGroupKeys: function (group, sender, keys) {
            return true
        }, getInstantMessages: function (chat, start, limit) {
            var messages = [];
            var msg;
            var count = this.numberOfMessages(chat);
            for (var index = 0; index < count; ++index) {
                msg = this.messageAtIndex(index, chat);
                if (msg) {
                    messages.push(msg)
                }
            }
            return messages
        }, saveInstantMessage: function (chat, iMsg) {
            return this.insertMessage(iMsg, chat)
        }, removeInstantMessage: function (chat, envelope, content) {
            return true
        }, removeInstantMessages: function (chat) {
            return true
        }, burnMessages: function (expiredTime) {
            return 0
        }, getReliableMessages: function (receiver, start, limit) {
            return t_message.getReliableMessages(receiver, start, limit)
        }, cacheReliableMessage: function (receiver, rMsg) {
            return t_message.cacheReliableMessage(receiver, rMsg)
        }, removeReliableMessage: function (receiver, rMsg) {
            return t_message.removeReliableMessage(receiver, rMsg)
        }, numberOfConversations: function () {
            return t_message.numberOfConversations()
        }, conversationAtIndex: function (index) {
            return t_message.conversationAtIndex(index)
        }, removeConversationAtIndex: function (index) {
            return t_message.removeConversationAtIndex(index)
        }, removeConversation: function (entity) {
            return t_message.removeConversation(entity)
        }, numberOfMessages: function (entity) {
            return t_message.numberOfMessages(entity)
        }, numberOfUnreadMessages: function (entity) {
            return t_message.numberOfUnreadMessages(entity)
        }, clearUnreadMessages: function (entity) {
            return t_message.clearUnreadMessages(entity)
        }, lastMessage: function (entity) {
            return t_message.lastMessage(entity)
        }, messageAtIndex: function (index, entity) {
            return t_message.messageAtIndex(index, entity)
        }, insertMessage: function (iMsg, entity) {
            var ok = t_message.insertMessage(iMsg, entity);
            if (ok) {
                post_notification(NotificationNames.MessageUpdated, this, {'action': 'add', 'ID': entity, 'msg': iMsg});
                Log.info('message saved', iMsg, entity)
            } else {
                Log.error('failed to save message', iMsg, entity)
            }
            return ok
        }, removeMessage: function (iMsg, entity) {
            var ok = t_message.removeMessage(iMsg, entity);
            if (ok) {
                post_notification(NotificationNames.MessageUpdated, this, {
                    'action': 'remove',
                    'ID': entity,
                    'msg': iMsg
                })
            }
            return ok
        }, withdrawMessage: function (iMsg, entity) {
            var ok = t_message.withdrawMessage(iMsg, entity);
            if (ok) {
                post_notification(NotificationNames.MembersUpdated, this, {
                    'action': 'withdraw',
                    'ID': entity,
                    'msg': iMsg
                })
            }
            return ok
        }, saveReceipt: function (iMsg, entity) {
            return t_message.saveReceipt(iMsg, entity)
        }, getConversations: function () {
            return []
        }, addConversation: function (chat) {
            return true
        }, updateConversation: function (chat) {
            return true
        }, burnConversations: function (expiredTime) {
            return true
        }, getInstance: function () {
            return this
        }
    };
    var post_notification = function (name, sender, userInfo) {
        var nc = NotificationCenter.getInstance();
        nc.postNotification(new sdk.lnc.Notification(name, sender, userInfo))
    };
    ns.SharedDatabase = SharedDatabase
})(SECHAT, DIMP);
(function (ns, sdk) {
    'use strict';
    var Interface = sdk.type.Interface;
    var Class = sdk.type.Class;
    var Log = sdk.lnc.Log;
    var Envelope = sdk.protocol.Envelope;
    var InstantMessage = sdk.protocol.InstantMessage;
    var TextContent = sdk.protocol.TextContent;
    var FileContent = sdk.protocol.FileContent;
    var Emitter = function () {
        Object.call(this)
    };
    Class(Emitter, Object, null, null);
    Emitter.prototype.sendInstantMessage = function (iMsg, priority) {
        var rMsg;
        var receiver = iMsg.getReceiver();
        if (receiver.isGroup()) {
            var manager = sdk.group.SharedGroupManager;
            rMsg = manager.sendInstantMessage(iMsg, priority)
        } else {
            var messenger = ns.GlobalVariable.getMessenger();
            rMsg = messenger.sendInstantMessage(iMsg, priority)
        }
        saveInstantMessage(iMsg);
        return rMsg
    };
    var saveInstantMessage = function (iMsg) {
        var clerk = ns.Amanuensis;
        var ok = clerk.saveInstantMessage(iMsg);
        if (ok) {
            Log.info('message saved', iMsg.getSender(), iMsg.getReceiver(), iMsg.getGroup())
        }
    };
    Emitter.prototype.sendContent = function (content, receiver, priority) {
        if (receiver.isGroup()) {
            content.setGroup(receiver)
        }
        var facebook = ns.GlobalVariable.getFacebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return [null, null]
        }
        var sender = user.getIdentifier();
        var envelope = Envelope.create(sender, receiver, null);
        var iMsg = InstantMessage.create(envelope, content);
        if (Interface.conforms(content, FileContent)) {
        }
        var rMsg = this.sendInstantMessage(iMsg, priority);
        if (!rMsg && receiver.isUser()) {
            Log.warning('not send yet', content, receiver)
        }
        return [iMsg, rMsg]
    };
    Emitter.prototype.sendText = function (text, receiver) {
        var content = TextContent.create(text);
        if (checkMarkdown(text)) {
            Log.info('send text as markdown', text, receiver);
            content.setValue('format', 'markdown')
        } else {
            Log.info('send text as plain', text, receiver)
        }
        return this.sendContent(content, receiver, 0)
    };
    var checkMarkdown = function (text) {
        if (text.indexOf('://') > 0) {
            return true
        } else if (text.indexOf('\n> ') > 0) {
            return true
        } else if (text.indexOf('\n# ') > 0) {
            return true
        } else if (text.indexOf('\n## ') > 0) {
            return true
        } else if (text.indexOf('\n### ') > 0) {
            return true
        }
        var pos = text.indexOf('```');
        if (pos >= 0) {
            pos += 3;
            var next = text.charAt(pos);
            if (next !== '`') {
                return text.indexOf('```', pos + 1) > 0
            }
        }
        return false
    };
    ns.Emitter = Emitter
})(SECHAT, DIMP);
(function (ns, sdk) {
    'use strict';
    var Class = sdk.type.Class;
    var ClientFacebook = sdk.ClientFacebook;
    var SharedFacebook = function () {
        ClientFacebook.call(this)
    };
    Class(SharedFacebook, ClientFacebook, null, {
        getAvatar: function (identifier) {
            var doc = this.getVisa(identifier);
            if (doc) {
                return doc.getAvatar()
            }
            return null
        }
    });
    SharedFacebook.prototype.getArchivist = function () {
        return ns.GlobalVariable.getArchivist()
    };
    SharedFacebook.prototype.createGroup = function (identifier) {
        var group = null;
        if (!identifier.isBroadcast()) {
            var man = sdk.group.SharedGroupManager;
            var doc = man.getBulletin(identifier);
            if (doc) {
                group = ClientFacebook.prototype.createGroup.call(this, identifier);
                group.setDataSource(man)
            }
        }
        return group
    };
    ns.SharedFacebook = SharedFacebook
})(SECHAT, DIMP);
(function (ns, sdk) {
    'use strict';
    var Class = sdk.type.Class;
    var Log = sdk.lnc.Log;
    var ClientArchivist = sdk.ClientArchivist;
    var SharedArchivist = function (db) {
        ClientArchivist.call(this, db)
    };
    Class(SharedArchivist, ClientArchivist, null, null);
    SharedArchivist.prototype.getFacebook = function () {
        return ns.GlobalVariable.getFacebook()
    };
    SharedArchivist.prototype.getMessenger = function () {
        return ns.GlobalVariable.getMessenger()
    };
    SharedArchivist.prototype.getSession = function () {
        var messenger = this.getMessenger();
        return messenger.getSession()
    };
    SharedArchivist.prototype.checkMeta = function (identifier, meta) {
        if (identifier.isBroadcast()) {
            return false
        }
        return ClientArchivist.prototype.checkMeta.call(this, identifier, meta)
    };
    SharedArchivist.prototype.checkDocuments = function (identifier, documents) {
        if (identifier.isBroadcast()) {
            return false
        }
        return ClientArchivist.prototype.checkDocuments.call(this, identifier, documents)
    };
    SharedArchivist.prototype.checkMembers = function (group, members) {
        if (group.isBroadcast()) {
            return false
        }
        return ClientArchivist.prototype.checkMembers.call(this, group, members)
    };
    SharedArchivist.prototype.queryMeta = function (identifier) {
        var session = this.getSession();
        if (!session.isReady()) {
            Log.warning('querying meta cancel, waiting to connect', identifier, session);
            return false
        }
        return ClientArchivist.prototype.queryMeta.call(this, identifier)
    };
    SharedArchivist.prototype.queryDocuments = function (identifier, docs) {
        var session = this.getSession();
        if (!session.isReady()) {
            Log.warning('querying documents cancel, waiting to connect', identifier, session);
            return false
        }
        return ClientArchivist.prototype.queryDocuments.call(this, identifier, docs)
    };
    SharedArchivist.prototype.queryMembers = function (group, members) {
        var session = this.getSession();
        if (!session.isReady()) {
            Log.warning('querying members cancel, waiting to connect', group, session);
            return false
        }
        return ClientArchivist.prototype.queryMembers.call(this, group, members)
    };
    ns.SharedArchivist = SharedArchivist
})(SECHAT, DIMP);
(function (ns, sdk) {
    'use strict';
    var Interface = sdk.type.Interface;
    var Class = sdk.type.Class;
    var Log = sdk.lnc.Log;
    var ID = sdk.protocol.ID;
    var Document = sdk.protocol.Document;
    var Visa = sdk.protocol.Visa;
    var Command = sdk.protocol.Command;
    var HandshakeCommand = sdk.protocol.HandshakeCommand;
    var SearchCommand = sdk.protocol.SearchCommand;
    var ClientMessenger = sdk.ClientMessenger;
    var SharedMessenger = function (session, facebook, db) {
        ClientMessenger.call(this, session, facebook, db)
    };
    Class(SharedMessenger, ClientMessenger, null, {
        encryptKey: function (keyData, receiver, iMsg) {
            try {
                return ClientMessenger.prototype.encryptKey.call(this, keyData, receiver, iMsg)
            } catch (e) {
                Log.error('failed to encrypt key for receiver', receiver, e);
                return null
            }
        }, deserializeContent: function (data, password, sMsg) {
            var content = ClientMessenger.prototype.deserializeContent.call(this, data, password, sMsg);
            if (Interface.conforms(content, Command)) {
                if (Interface.conforms(content, HandshakeCommand)) {
                    var remote = content.getValue('remote_address');
                    Log.info('socket address', remote)
                }
            }
            return content
        }, sendInstantMessage: function (iMsg, priority) {
            var rMsg;
            try {
                rMsg = ClientMessenger.prototype.sendInstantMessage.call(this, iMsg, priority)
            } catch (e) {
                Log.error('failed to send message', iMsg, e)
            }
            if (rMsg) {
                var signature = rMsg.getString('signature', null);
                iMsg.setValue('signature', signature)
            }
            return rMsg
        }, handshake: function (sessionKey) {
            if (!sessionKey || sessionKey.length === 0) {
                Log.info('update visa for first handshake');
                this.updateVisa()
            } else if (this.getSession().getSessionKey() === sessionKey) {
                Log.warning('duplicated session key', sessionKey)
            }
            return ClientMessenger.prototype.handshake.call(this, sessionKey)
        }, updateVisa: function () {
            var facebook = this.getFacebook();
            var user = facebook.getCurrentUser();
            if (!user) {
                Log.error('current user not found');
                return false
            }
            var sKey = facebook.getPrivateKeyForVisaSignature(user.getIdentifier());
            if (!sKey) {
                Log.error('private key not found', user);
                return false
            }
            var visa = user.getVisa();
            if (!visa) {
                Log.error('user error', user);
                return false
            } else {
                var doc = Document.parse(visa.copyMap(false));
                if (Interface.conforms(doc, Visa)) {
                    visa = doc
                } else {
                    Log.error('visa error: $visa', visa);
                    return false
                }
            }
            visa.setProperty('app', this.getAppInfo(visa));
            visa.setProperty('sys', this.getDeviceInfo(visa));
            var sig = visa.sign(sKey);
            if (!sig) {
                Log.error('failed to sign visa', visa, sKey);
                return false
            }
            var ok = facebook.saveDocument(visa);
            if (ok) {
                Log.info('visa updated', visa)
            } else {
                Log.error('failed to save visa', visa)
            }
            return ok
        }, getAppInfo: function (visa) {
            var info = visa.getProperty('app');
            if (!info) {
                info = {}
            } else if (typeof info === 'string') {
                info = {'app': info}
            }
            info['id'] = 'chat.dim.web';
            info['name'] = 'WebChat';
            info['version'] = '2.0.0';
            return info
        }, getDeviceInfo: function (visa) {
            var info = visa.getProperty('sys');
            if (!info) {
                info = {}
            } else if (typeof info === 'string') {
                info = {'sys': info}
            }
            info['os'] = 'Browser';
            return info
        }, handshakeSuccess: function () {
            try {
                ClientMessenger.prototype.handshakeSuccess.call(this)
            } catch (e) {
                Log.error('failed to broadcast document', e)
            }
            var facebook = this.getFacebook();
            var user = facebook.getCurrentUser();
            if (!user) {
                Log.error('failed to get current user');
                return
            }
            try {
                var userAgent = 'Web Browser';
                this.broadcastLogin(user.getIdentifier(), userAgent)
            } catch (e) {
                Log.error('failed to broadcast login command')
            }
        }, reportSpeeds: function (meters, provider) {
        }, search: function (keywords) {
            var content = SearchCommand.fromKeywords(keywords);
            var SE = ID.parse('archivist@anywhere');
            return this.sendContent(content, null, SE, 0)
        }
    });
    ns.SharedMessenger = SharedMessenger
})(SECHAT, DIMP);
(function (ns, sdk) {
    'use strict';
    var Interface = sdk.type.Interface;
    var Class = sdk.type.Class;
    var Log = sdk.lnc.Log;
    var FileContent = sdk.protocol.FileContent;
    var ClientMessagePacker = sdk.ClientMessagePacker;
    var SharedPacker = function (facebook, messenger) {
        ClientMessagePacker.call(this, facebook, messenger)
    };
    Class(SharedPacker, ClientMessagePacker, null, {
        encryptMessage: function (iMsg) {
            var content = iMsg.getContent();
            if (Interface.conforms(content, FileContent)) {
            }
            iMsg.setValue('sn', content.getSerialNumber());
            return ClientMessagePacker.prototype.encryptMessage.call(this, iMsg)
        }, suspendInstantMessage: function (iMsg, info) {
            Log.info('suspend instant message', iMsg, info);
            iMsg.setValue('error', info)
        }, suspendReliableMessage: function (rMsg, info) {
            Log.info('suspend reliable message', rMsg, info);
            rMsg.setValue('error', info)
        }
    });
    ns.SharedPacker = SharedPacker
})(SECHAT, DIMP);
(function (ns, sdk) {
    'use strict';
    var Class = sdk.type.Class;
    var Log = sdk.lnc.Log;
    var ClientMessageProcessor = sdk.ClientMessageProcessor;
    var SharedProcessor = function (facebook, messenger) {
        ClientMessageProcessor.call(this, facebook, messenger)
    };
    Class(SharedProcessor, ClientMessageProcessor, null, {
        createCreator: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.cpu.ClientProcessorCreator(facebook, messenger)
        }, processSecureMessage: function (sMsg, rMsg) {
            try {
                return ClientMessageProcessor.prototype.processSecureMessage.call(this, sMsg, rMsg)
            } catch (e) {
                Log.error('failed to process message', rMsg, e);
                return []
            }
        }, processInstantMessage: function (iMsg, rMsg) {
            var responses = ClientMessageProcessor.prototype.processInstantMessage.call(this, iMsg, rMsg);
            var clerk = ns.Amanuensis;
            if (!clerk.saveInstantMessage(iMsg)) {
                Log.error('failed to save instant message', iMsg);
                return []
            }
            return responses
        }
    });
    ns.SharedProcessor = SharedProcessor
})(SECHAT, DIMP);
(function (ns, sdk) {
    'use strict';
    var Class = sdk.type.Class;
    var Log = sdk.lnc.Log;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    var SessionStateOrder = sdk.network.SessionStateOrder;
    var Terminal = sdk.network.Terminal;
    var NotificationNames = ns.NotificationNames;
    var Client = function (facebook, sdb) {
        Terminal.call(this, facebook, sdb)
    };
    Class(Client, Terminal, null, {
        getSessionState: function () {
            var session = this.getSession();
            return !session ? null : session.getState()
        }, getSessionStateOrder: function () {
            var state = this.getSessionState();
            if (state) {
                return state.getIndex()
            }
            return SessionStateOrder.DEFAULT.getValue()
        }, getSessionStateText: function () {
            var order = this.getSessionStateOrder();
            if (SessionStateOrder.DEFAULT.equals(order)) {
                return 'Waiting'
            } else if (SessionStateOrder.CONNECTING.equals(order)) {
                return 'Connecting'
            } else if (SessionStateOrder.CONNECTED.equals(order)) {
                return 'Connected'
            } else if (SessionStateOrder.HANDSHAKING.equals(order)) {
                return 'Handshaking'
            } else if (SessionStateOrder.RUNNING.equals(order)) {
                return null
            } else {
                this.reconnect();
                return 'Disconnected'
            }
        }, reconnect: function () {
            return this.connect('106.52.25.169', 9394);
            return this.connect('170.106.141.194', 9394);
            return this.connect('129.226.12.4', 9394);
            var station = this.getNeighborStation();
            if (!station) {
                Log.error('failed to get neighbor station');
                return null
            }
            Log.warning('connecting to station', station);
            return this.connect(station.getHost(), station.getPort())
        }, createMessenger: function (session, facebook) {
            ns.GlobalVariable.setSession(session);
            return ns.GlobalVariable.getMessenger()
        }, createPacker: function (facebook, messenger) {
            return new ns.SharedPacker(facebook, messenger)
        }, createProcessor: function (facebook, messenger) {
            return new ns.SharedProcessor(facebook, messenger)
        }, exitState: function (previous, machine) {
            Terminal.prototype.exitState.call(this, previous, machine);
            var current = machine.getCurrentState();
            Log.info('session state changed', previous, current);
            if (!current) {
                return
            }
            post_notification(NotificationNames.SessionStateChanged, this, {
                'previous': previous,
                'current': current,
                'state': current
            })
        }, launch: function (options) {
            var host = options['host'];
            var port = options['port'];
            this.connect(host, port)
        }
    });
    var post_notification = function (name, sender, userInfo) {
        var nc = NotificationCenter.getInstance();
        nc.postNotification(new sdk.lnc.Notification(name, sender, userInfo))
    };
    ns.Client = Client
})(SECHAT, DIMP);
(function (ns, sdk) {
    'use strict';
    var shared = {
        database: null,
        archivist: null,
        facebook: null,
        session: null,
        messenger: null,
        emitter: null,
        terminal: null
    };
    var GlobalVariable = {
        getDatabase: function () {
            var database = shared.database;
            if (!database) {
                database = ns.SharedDatabase;
                shared.database = database
            }
            return database
        }, getArchivist: function () {
            var archivist = shared.archivist;
            if (!archivist) {
                var database = this.getDatabase();
                archivist = new ns.SharedArchivist(database);
                shared.archivist = archivist
            }
            return archivist
        }, getFacebook: function () {
            var facebook = shared.facebook;
            if (!facebook) {
                facebook = new ns.SharedFacebook();
                shared.facebook = facebook;
                var sgm = sdk.group.SharedGroupManager;
                sgm.setFacebook(facebook)
            }
            return facebook
        }, getMessenger: function () {
            var messenger = shared.messenger;
            if (!messenger) {
                var database = this.getDatabase();
                var facebook = this.getFacebook();
                var session = shared.session;
                if (session) {
                    messenger = new ns.SharedMessenger(session, facebook, database);
                    shared.messenger = messenger;
                    var sgm = sdk.group.SharedGroupManager;
                    sgm.setMessenger(messenger)
                } else {
                    throw new ReferenceError('session not connected');
                }
            }
            return messenger
        }, getEmitter: function () {
            var emitter = shared.emitter;
            if (!emitter) {
                emitter = new ns.Emitter();
                shared.emitter = emitter
            }
            return emitter
        }, getTerminal: function () {
            var client = shared.terminal;
            if (!client) {
                var database = this.getDatabase();
                var facebook = this.getFacebook();
                client = new ns.Client(facebook, database);
                client.start();
                shared.terminal = client
            }
            return client
        }
    };
    GlobalVariable.setCurrentUser = function (identifier) {
        var facebook = this.getFacebook();
        var sign_key = facebook.getPrivateKeyForVisaSignature(identifier);
        var msg_keys = facebook.getPrivateKeysForDecryption(identifier);
        if (!sign_key || !msg_keys || msg_keys.length === 0) {
            throw ReferenceError('failed to get private keys for: ' + identifier);
        }
        var user = facebook.getUser(identifier);
        facebook.setCurrentUser(user);
        var database = this.getDatabase();
        database.setCurrentUser(identifier);
        var session = shared.session;
        if (session) {
            session.setIdentifier(identifier)
        }
        return facebook
    };
    GlobalVariable.setSession = function (session) {
        shared.session = session;
        var facebook = this.getFacebook();
        var user = facebook.getCurrentUser();
        if (user) {
            session.setIdentifier(user.getIdentifier())
        }
    };
    ns.GlobalVariable = GlobalVariable
})(SECHAT, DIMP);
