;

if (typeof dimsdk !== "object") {
    dimsdk = {}
}

!function (ns) {
    'use strict';

    var Loader = function (base) {
        this.base = base;
        this.status = document.getElementById('tarsier-status');
        this.alpha = 0;
        this.timer = null;
    };

    Loader.prototype.startAnimate = function (action, timeout) {
        this.stopAnimate();
        this.timer = window.setInterval(action, timeout);
    };
    Loader.prototype.stopAnimate = function () {
        if (this.timer) {
            window.clearInterval(this.timer);
            this.timer = null;
        }
    };

    Loader.prototype.showStatus = function (string) {
        if (!this.status) {
            return;
        }
        this.stopAnimate();
        this.status.innerText = string;
        this.setAlpha(55);
    };

    Loader.prototype.fadeOut = function () {
        var loader = this;
        this.startAnimate(function () {
            var alpha = loader.getAlpha();
            if (alpha < 5) {
                loader.setAlpha(0);
                loader.stopAnimate();
            } else {
                loader.setAlpha(alpha - 5);
            }
        }, 50);
    };

    Loader.prototype.getAlpha = function () {
        return this.alpha;
    };
    Loader.prototype.setAlpha = function (alpha) {
        if (!this.status) {
            return;
        }
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.indexOf("msie") !== -1 && ua.indexOf("opera") === -1) {
            this.status.style.filter = "Alpha(Opacity=" + alpha + ")";
        } else {
            this.status.style.opacity = String(alpha / 100.0);
        }
        if (alpha < 1) {
            this.status.style.display = 'none';
        } else {
            this.status.style.display = '';
        }
        this.alpha = alpha;
    };

    Loader.prototype.importCSS = function (href) {
        tarsier.importCSS(this.base + href);
    };

    Loader.prototype.importJS = function (src, callback) {
        var loader = this;
        tarsier.importJS(this.base + src, function () {
            var tasks = tarsier.base.importings;
            if (tasks.length > 1) {
                var next = tasks[1];
                loader.showStatus('Loading ' + next.url + ' ...');
            } else {
                setTimeout(function () {
                    loader.fadeOut();
                }, 2000);
            }
            if (callback) {
                callback();
            }
        });
    };

    ns.Loader = Loader;

}(dimsdk);

!function (ns) {
    'use strict';

    var html =
        '    <div id="panel-shell" style="position: relative;">\n' +
        '        <div class="output-view">\n' +
        '            <p>Welcome to DIM network!</p>\n' +
        '            <div>Type "help" for more information.</div>\n' +
        '        </div><br />\n' +
        '        <div class="shell-view">\n' +
        '            <span class="prompt">$</span>&nbsp;<span class="input"><span class="left"></span><span class="cursor blink">&nbsp;</span><span class="right"></span></span>\n' +
        '        </div>\n' +
        '    </div>\n';

    html += '<div id="tarsier-status">Loading tarsier ...</div>';

    document.getElementById('console1').innerHTML = html;

}(dimsdk);
var vue;
!function (ns) {
    'use strict';

    var stylesheets = [
        'css/index.css',
        'css/bootstrap.min.css'
    ];
    var scripts = [
        /* third party cryptography libs */
        'js/sdk/3rd/crypto-js/core.js',
        'js/sdk/3rd/crypto-js/cipher-core.js',
        'js/sdk/3rd/crypto-js/aes.js',
        'js/sdk/3rd/crypto-js/md5.js',
        'js/sdk/3rd/crypto-js/sha256.js',
        'js/sdk/3rd/crypto-js/ripemd160.js',
        'js/sdk/3rd/jsencrypt.js',

        /* DIM SDK */
        'js/sdk/dimsdk.js',

        /* DIM Client */
        'js/dimc/protocol/search.js',
        'js/dimc/cpu/default.js',
        'js/dimc/cpu/handshake.js',
        'js/dimc/cpu/receipt.js',
        'js/dimc/cpu/search.js',
        'js/dimc/extensions/register.js',
        'js/dimc/extensions/password.js',
        'js/dimc/network/fsm.js',
        'js/dimc/network/delegate.js',
        'js/dimc/network/request.js',
        'js/dimc/network/server.js',

        'js/dimc/database/table.js',
        'js/dimc/database/meta.js',
        'js/dimc/database/private.js',
        'js/dimc/database/profile.js',
        'js/dimc/database/user.js',

        'js/dimc/cache.js',
        'js/dimc/ans.js',
        'js/dimc/facebook.js',
        'js/dimc/messenger.js',

        /* UI: Console */
        'js/3rd/jquery-3.4.1.js',
        'js/3rd/underscore-1.8.2.min.js',
        'js/3rd/popper.min.js',
        'js/3rd/bootstrap.min.js',
        'js/3rd/vue.js',

        'js/console.js',
        'js/appui.js'
    ];
    var main = function () {
        $(function () {
            app.write = window.shell_output;
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
            vue = new Vue({
                el: '#vue1',
                data: {
                    onlineUsers: null,
                    server: server,
                    user: facebook.getCurrentUser(),
                    messages: null,
                    selectedIdentifier: null,
                    target: null,
                    textInput: ''
                },
                watch: {
                    selectedIdentifier: function (name) {
                        var facebook = DIMP.Facebook.getInstance();
                        var identifier = facebook.getIdentifier(name);
                        if (!identifier) {
                            return 'User error: ' + name;
                        }
                        var meta = facebook.getMeta(identifier);
                        if (!meta) {
                            return 'Meta not found: ' + identifier;
                        }
                        this.target = identifier;
                        var nickname = facebook.getUsername(identifier);
                    }
                },
                methods: {
                    scrollToBottom: function () {
                        setTimeout(function () {
                            $('#messages_div').scrollTop($('#messages_div')[0].scrollHeight);
                        },500);
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
                    loadMessages: function () {
                        var facebook = DIMP.Facebook.getInstance();
                        var currentUser = facebook.getCurrentUser();
                        var storage = StarGate.LocalStorage;
                        var messagePath = 'Messages.'+currentUser.identifier;
                        this.messages = storage.loadJSON(messagePath);
                    },
                    addMessage: function (sender, msg) {
                        if(this.messages == null)
                        {
                            this.messages = {};
                        }else if(this.messages[sender] == undefined)
                        {
                            this.messages[sender] = [];
                        }
                        var message = msg.toJSON();
                        message.content = message.content.toJSON();
                        this.messages[sender].push(message);
                        var currentUser = DIMP.Facebook.getInstance().getCurrentUser();
                        var storage = StarGate.LocalStorage;
                        var messagePath = 'Messages.'+currentUser.identifier;
                        storage.saveJSON(this.messages, messagePath);
                        this.scrollToBottom();
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
        });
    };

    main();
}(dimsdk);
