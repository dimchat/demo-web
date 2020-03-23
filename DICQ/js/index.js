;

if (typeof dicq !== 'object') {
    dicq = {};
}

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

}(dicq);

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
        '../Client/sdk/3rd/crypto.js',
        '../Client/sdk/3rd/jsencrypt.js',

        /* DIM SDK */
        '../Client/sdk/dimsdk.js',

        '../Client/sdk/host58.js',
        '../Client/sdk/bubble.js',
        '../Client/sdk/clipboard.js',

        /* DIM Client */
        '../Client/dist/client.js',
        null
    ];
    if (release) {
        dimsdk = [
            /* third party cryptography libs */
            '../Client/sdk/3rd/crypto.min.js',
            '../Client/sdk/3rd/jsencrypt.min.js',

            /* DIM SDK */
            '../Client/sdk/dimsdk.min.js',

            '../Client/sdk/host58.js',
            '../Client/sdk/bubble.js',
            '../Client/sdk/clipboard.js',

            /* DIM Client */
            '../Client/dist/client.min.js',
            null
        ]
    }

    var tarsier_ui = [
        'http://moky.github.io/Tarsier/build/tarsier-ui.js',
        null
    ];
    if (release) {
        tarsier_ui = [
            'http://moky.github.io/Tarsier/build/tarsier-ui.min.js',
            null
        ];
    }

    var stylesheets = [
        'css/index.css',
        'css/main.css',
        'css/account.css',
        'css/chatbox.css',
        null
    ];
    var scripts = [
        'js/conversation/chatbox.js',
        'js/conversation/groupchat.js',
        'js/conversation/chatroom.js',

        'js/controllers/register.js',
        'js/controllers/login.js',
        'js/controllers/main.js',
        'js/controllers/account.js',
        'js/controllers/about.js',

        'js/connect.js',
        'js/app.js',
        null
    ];

    // check duplicate
    if (typeof DIMP === 'object') {
        dimsdk = [];
    }
    if (typeof tarsier === 'object') {
        if (typeof tarsier.ui === 'object') {
            tarsier_ui = [];
        }
    }
    if (typeof ns.Application === 'object') {
        stylesheets = [];
        scripts = [];
    }

    scripts = [].concat(dimsdk, tarsier_ui, scripts);

    var loader = new ns.Loader(tarsier, 'js/index.js');

    for (var i = 0; i < stylesheets.length; ++i) {
        loader.importCSS(stylesheets[i]);
    }

    for (var j = 0; j < scripts.length; ++j) {
        loader.importJS(scripts[j]);
    }

}(dicq);
