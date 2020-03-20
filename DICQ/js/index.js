;

!function (ns) {
    'use strict';

    var Loader = function (tarsier, home) {
        this.tarsier = tarsier;
        var url = this.currentTask().url;
        this.base = url.substring(0, url.indexOf(home));
        this.count = 0; // total scripts
        this.alpha = 0;
        this.timer = null;
        var div = document.getElementById('tarsier-status');
        if (!div) {
            div = document.createElement('DIV');
            div.id = 'tarsier-status';
            div.innerText = 'Loading tarsier ...';
            document.body.appendChild(div);
        }
        this.status = div;
        this.showStatus('Loading DICQ from ' + this.base + ' ...');
    };

    Loader.prototype.getTasks = function () {
        return this.tarsier.base.importings;
    };
    Loader.prototype.getTask = function (index) {
        var tasks = this.getTasks();
        return index < tasks.length ? tasks[index] : null;
    };
    Loader.prototype.currentTask = function () {
        return this.getTask(0);
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

    var full_url = function (src) {
        if (!src) {
            return null;
        }
        var url;
        if (src.indexOf('://') > 0) {
            // absolute URL
            url = src;
        } else if (src[0] === '/') {
            // absolute path
            var pos = this.base.indexOf('://');
            pos = this.base.indexOf('/', pos + 3);
            url = this.base.substring(0, pos) + src;
        } else {
            // relative path
            url = this.base + src;
        }
        return url;
    };

    Loader.prototype.importCSS = function (href) {
        var url = full_url.call(this, href);
        if (!url) {
            return;
        }
        this.tarsier.importCSS(url);
    };

    Loader.prototype.importJS = function (src, callback) {
        var url = full_url.call(this, src);
        if (!url) {
            return;
        }
        this.count += 1;
        var loader = this;
        this.tarsier.importJS(url, function () {
            var tasks = loader.getTasks();
            if (tasks.length > 1) {
                var next = tasks[1];
                var index = loader.count - tasks.length + 2;
                loader.showStatus('Loading (' + index + '/' + loader.count + ') ' + next.url + ' ...');
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

}(window);

!function (ns) {
    'use strict';

    var release = true;
    if (ns['DEBUG']) {
        release = false;
    }
    if (window.location.href.indexOf('?debug') > 0) {
        release = false;
    }

    var dimsdk = [
        /* third party cryptography libs */
        '../Sechat/js/sdk/3rd/crypto-js/core.js',
        '../Sechat/js/sdk/3rd/crypto-js/cipher-core.js',
        '../Sechat/js/sdk/3rd/crypto-js/aes.js',
        '../Sechat/js/sdk/3rd/crypto-js/md5.js',
        '../Sechat/js/sdk/3rd/crypto-js/sha256.js',
        '../Sechat/js/sdk/3rd/crypto-js/ripemd160.js',
        '../Sechat/js/sdk/3rd/jsencrypt.js',

        /* DIM SDK */
        '../Sechat/js/sdk/dimsdk.js',

        '../Sechat/js/sdk/host58.js',
        '../Sechat/js/sdk/bubble.js',
        '../Sechat/js/sdk/clipboard.js',
        null
    ];
    if (release) {
        dimsdk = [
            /* third party cryptography libs */
            '../Sechat/js/sdk/3rd/crypto.min.js',
            '../Sechat/js/sdk/3rd/jsencrypt.min.js',

            /* DIM SDK */
            // '../Sechat/js/sdk/dimsdk.js',
            '../Sechat/js/sdk/dimsdk.min.js',

            '../Sechat/js/sdk/host58.js',
            '../Sechat/js/sdk/bubble.js',
            '../Sechat/js/sdk/clipboard.js',
            null
        ]
    }

    var dim_client = [
        /* DIM Client */
        '../Sechat/js/dimc/extensions/constants.js',
        '../Sechat/js/dimc/extensions/conversation.js',
        '../Sechat/js/dimc/extensions/register.js',
        '../Sechat/js/dimc/extensions/password.js',
        '../Sechat/js/dimc/protocol/search.js',

        '../Sechat/js/dimc/cpu/default.js',
        '../Sechat/js/dimc/cpu/handshake.js',
        '../Sechat/js/dimc/cpu/receipt.js',
        '../Sechat/js/dimc/cpu/search.js',

        '../Sechat/js/dimc/network/fsm.js',
        '../Sechat/js/dimc/network/delegate.js',
        '../Sechat/js/dimc/network/request.js',
        '../Sechat/js/dimc/network/server.js',

        '../Sechat/js/dimc/database/table.js',
        '../Sechat/js/dimc/database/meta.js',
        '../Sechat/js/dimc/database/private.js',
        '../Sechat/js/dimc/database/profile.js',
        '../Sechat/js/dimc/database/user.js',
        '../Sechat/js/dimc/database/contact.js',
        '../Sechat/js/dimc/database/group.js',
        '../Sechat/js/dimc/database/message.js',

        '../Sechat/js/dimc/cache.js',
        '../Sechat/js/dimc/ans.js',
        '../Sechat/js/dimc/amanuensis.js',
        '../Sechat/js/dimc/facebook.js',
        '../Sechat/js/dimc/messenger.js',
        null
    ];
    if (release) {
        dim_client = [
            // '../Sechat/js/dim.js'
            '../Sechat/js/dim.min.js',
            null
        ]
    }

    var tarsier_ui = [
        '../TarsierUI/src/base.js',

        '../TarsierUI/src/color.js',
        '../TarsierUI/src/geometry.js',
        '../TarsierUI/src/draggable.js',

        '../TarsierUI/src/view.js',
        '../TarsierUI/src/scroll.js',

        '../TarsierUI/src/label.js',
        '../TarsierUI/src/input.js',
        '../TarsierUI/src/textarea.js',
        '../TarsierUI/src/image.js',
        '../TarsierUI/src/button.js',
        '../TarsierUI/src/link.js',

        '../TarsierUI/src/window.js',
        null
    ];
    if (release) {
        tarsier_ui = [
            // '../TarsierUI/build/tarsier-ui.js',
            '../TarsierUI/build/tarsier-ui.min.js',
            null
        ];
    }

    var stylesheets = [
        'css/index.css',
        'css/main.css',
        'css/chatbox.css',
        null
    ];
    var scripts = [
        'js/conversation/chatbox.js',
        'js/conversation/groupchat.js',
        'js/conversation/chatroom.js',

        'js/controllers/about.js',
        'js/controllers/register.js',
        'js/controllers/login.js',
        'js/controllers/main.js',

        'js/connect.js',
        'js/app.js',
        null
    ];
    scripts = [].concat(dimsdk, dim_client, tarsier_ui, scripts);

    var loader = new ns.Loader(tarsier, 'js/index.js');

    for (var i = 0; i < stylesheets.length; ++i) {
        loader.importCSS(stylesheets[i]);
    }

    for (var j = 0; j < scripts.length; ++j) {
        loader.importJS(scripts[j]);
    }

}(window);
