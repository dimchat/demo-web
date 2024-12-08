;

if (typeof dterm !== 'object') {
    dterm = {};
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
        this.status = document.getElementById('tarsier-status');
        this.showStatus('Loading DIM client from ' + this.base + ' ...');
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

}(dterm);

!function (node) {
    'use strict';

    var html =
        '    <div id="panel-shell">\n' +
        '        <div class="output-view">\n' +
        '            <p>Welcome to DIM network!</p>\n' +
        '            <div>Type "help" for more information.</div>\n' +
        '        </div><br />\n' +
        '        <div class="shell-view">\n' +
        '            <span class="prompt">$</span>&nbsp;<span class="input"><span class="left"></span><span class="cursor blink">&nbsp;</span><span class="right"></span></span>\n' +
        '        </div>\n' +
        '    </div>\n';

    html += '<div id="tarsier-status">Loading tarsier ...</div>';

    node.innerHTML = html;

}(window.document.body);

!function (ns) {
    'use strict';

    var release = true;
    if (ns['DEBUG']) {
        release = false;
    }
    if (window.location.href.indexOf('debug') > 0) {
        release = false;
    }

    var dimsdk;
    if (release) {
        dimsdk = [
            /* third party cryptography libs */
            'sdk/3rd/crypto.min.js',
            'sdk/3rd/jsencrypt.min.js',
            'sdk/3rd/sha3.min.js',
            'sdk/3rd/ecc/bn.js',
            'sdk/3rd/ecc/secp256k1.js',

            'sdk/bubble.js',
            'sdk/clipboard.js',
            'sdk/useragent.js',

            /* DIM SDK */
            'libs/dimples.min.js',
            'libs/sechat.min.js',
            null
        ];
    } else {
        dimsdk = [
            /* third party cryptography libs */
            'sdk/3rd/crypto.js',
            'sdk/3rd/jsencrypt.js',
            'sdk/3rd/sha3.js',
            'sdk/3rd/ecc/bn.js',
            'sdk/3rd/ecc/secp256k1.js',

            'sdk/bubble.js',
            'sdk/clipboard.js',
            'sdk/useragent.js',

            /* DIM SDK */
            'libs/dimples.js',
            'libs/sechat.js',
            null
        ];
    }

    var console_ui = [
        /* UI: Console */
        'js/3rd/jquery-3.4.1.slim.min.js',
        'js/3rd/underscore-1.8.2.min.js',
        null
    ];

    var stylesheets = [
        'css/index.css',
        null
    ];
    var scripts = [
        'sdk/host58.js',

        'js/console.js',
        'js/app.js',
        null
    ];

    // check duplicate
    if (typeof SECHAT === 'object') {
        if (typeof SECHAT.GlobalVariable === 'object') {
            dimsdk = [];
        }
    }
    if (typeof ns.Application === 'object') {
        stylesheets = [];
        scripts = [];
    }

    scripts = [].concat(dimsdk, console_ui, scripts);

    var loader = new ns.Loader(tarsier, 'js/index.js');

    for (var i = 0; i < stylesheets.length; ++i) {
        loader.importCSS(stylesheets[i]);
    }

    for (var j = 0; j < scripts.length; ++j) {
        loader.importJS(scripts[j]);
    }

    loader.importJS('js/config.js', function () {
        // start after last script loaded
        $(function () {
            ns.Application.prototype.write = window.shell_output;
            // var messenger = DIMP.GlobalVariable.getMessenger();
            // var session = messenger.getSession();
            // var server = session.getStation();
            // server.start();
        });
    });

    dterm.loader = loader;

}(dterm);
