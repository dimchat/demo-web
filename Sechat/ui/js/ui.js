;

if (typeof dimsdk !== "object") {
    dimsdk = dimp = DIMP;
}

var vue;

var CONST = {
    "MESSAGESPATH": 'Messages',
    "LOCALCONTRACTPATH": 'LocalContracts'
};

$(function () {
    dimsdk.Application.prototype.write = function () {
        var str = '';
        for (var i = 0; i < arguments.length; ++i) {
            str += arguments[i] + '';
        }
        str = Bubble.convertToString(str);
        console.log('console: ' + str);
    };
    var server = DIMP.Messenger.getInstance().server;
    server.start();
    Vue.filter('formatDate', function(value) {
        if (value) {
            var date = new Date(value * 1000);
            var year = date.getFullYear();
            var month = date.getMonth()+1;
            var day = date.getDate();
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var seconds = "0" + date.getSeconds();
            var formattedTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

            return formattedTime;
        }
    });
    Vue.filter('getUserName', function(value) {
        if (value) {
            return DIMP.Facebook.getInstance().getUsername(value);
        }
    });
    vue = new Vue({
        el: '#vue1',
        data: {
            display_list: 'local',
            onlineUsers: null,
            server: server,
            serverStatus: '',
            user: DIMP.Facebook.getInstance().getCurrentUser(),
            messages: [],
            selectedIdentifier: null,
            target: null,
            searchInput: '',
            textInput: '',
            localContracts: []
        },
        watch: {
            selectedIdentifier: function (name) {
                this.changeTarget(name);
            },
            messages: function () {
                console.log("New message!");
            }
        },
        methods: {
            setServerStatus: function(status){
                this.serverStatus = status;
            },
            changeTarget: function(identifierString){
                var facebook = DIMP.Facebook.getInstance();
                var identifier = facebook.getIdentifier(identifierString);
                if (!identifier) {
                    return 'User error: ' + identifierString;
                }
                var meta = facebook.getMeta(identifier);
                if (!meta) {
                    return 'Meta not found: ' + identifier;
                }
                this.target = identifier;
                this.scrollToBottom();
            },
            scrollToBottom: function () {
                setTimeout(function () {
                    if($('#messages_div')[0])
                    {
                        $('#messages_div').scrollTop($('#messages_div')[0].scrollHeight);
                    }

                },300);
            },
            refreshOnlineUsers: function(event){
                var Messenger = DIMP.Messenger;
                Messenger.getInstance().queryOnlineUsers();
            },
            updateOnlineUsers: function (userIdentifiers) {
                this.onlineUsers = [];
                var facebook = DIMP.Facebook.getInstance();
                for( var i in userIdentifiers){
                    var identifier = facebook.getIdentifier(userIdentifiers[i]);
                    var profile = facebook.loadProfile(identifier);
                    this.onlineUsers.push(identifier);
                }
            },
            loadMessages:async function () {
                // this.messages = StarGate.LocalStorage.loadJSON(CONST.MESSAGESPATH + '.' + this.user.identifier);
                this.messages = await DIMP.db.MessageTable.loadMessages(this.user.identifier);
            },
            loadContacts:async function() {
                this.localContracts = await DIMP.db.ContactTable.loadContacts(this.user.identifier);
            },
            addMessage: async function (sender, msg) {
                var message = msg.toJSON();
                message.content = message.content.toJSON();
                await DIMP.db.MessageTable.saveMessage(message, this.user.identifier);
                this.messages.push(message);
                this.scrollToBottom();
            },
            // 添加用户到本地
            searchContact: async function(){
                if(this.searchInput == '')
                {
                    return;
                }
                await this.addContactFromIdentifier(this.searchInput);
            },
            addContactFromIdentifier:async function(identifierString){
                if(this.localContracts.find(o => o.owner == this.user.identifier && o.identifier == identifierString))
                {
                    return;
                }
                let facebook = DIMP.Facebook.getInstance();
                try
                {
                    var identifier = facebook.getIdentifier(identifierString);
                }
                catch (e) {
                    alert("user error: "+identifierString);
                    return;
                }

                if (!identifier) {
                    alert("user error: "+identifierString);
                    return;
                }
                if (identifier.getType().isGroup()) {
                    alert('This profile is a group, do nothing.');
                    return;
                }

                let meta = facebook.getMeta(identifier);
                let contact = new Contact(this.user.identifier, identifier, meta);

                var profile;
                var i = 0;
                do {
                    profile = facebook.loadProfile(identifier);
                    if(profile!= undefined && profile != null)
                    {
                        contact.profile = profile;
                        break;
                    }
                    await sleep(500);
                    i ++;
                }while (i<6);

                this.addContactToLocal(contact);
            },
            addContactToLocal: function(contact){
                if(this.localContracts.find(o => o.owner == contact.owner && o.identifier == contact.identifier))
                {
                    alert('This contract already in your local list!');
                    return;
                }
                let contactJson = contact.toJson();
                this.localContracts.push(contactJson);
                DIMP.db.ContactTable.saveContact(contact);
            },
            send: function () {
                var status = server.getStatus();
                var StarStatus = DIMP.stargate.StarStatus;
                if (!status.equals(StarStatus.Connected)) {
                    if (status.equals(StarStatus.Error)) {
                        return 'Connecting ...';
                    } else if (status.equals(StarStatus.Error)) {
                        return 'Connection error!';
                    }
                    else{
                        return 'Connect to a DIM station first.';
                    }
                }

                var user = this.user;
                if (!user) {
                    return 'Login first';
                }
                var receiver = this.target;
                if (!receiver) {
                    return 'Please set a recipient';
                }
                var TextContent = DIMP.protocol.TextContent;
                var content = new TextContent(this.textInput);

                var env = DIMP.Envelope.newEnvelope(user.identifier, receiver);
                var msg = DIMP.InstantMessage.newMessage(content, env);

                this.addMessage(receiver, msg);
                this.scrollToBottom();
                if (DIMP.Messenger.getInstance().sendMessage(msg)) {
                    // return 'Sending message ...';
                    this.textInput = '';
                    return null;
                } else {
                    return 'Cannot send message now.';
                }
            }
        }
    });
    vue.loadMessages();
    vue.loadContacts();
});

var sleep = function (time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, time);
    })
};
