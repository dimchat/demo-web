;

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
        var url = href;
        if (href.indexOf('://') < 0) {
            url = this.base + href;
        }
        tarsier.importCSS(url);
    };

    Loader.prototype.importJS = function (src, callback) {
        var url = src;
        if (src.indexOf('://') < 0) {
            url = this.base + src;
        }
        var loader = this;
        tarsier.importJS(url, function () {
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

}(window);

!function (ns) {
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

    document.body.innerHTML = html;

}(window);

!function (ns) {
    'use strict';

    var stylesheets = [
        'css/index.css'
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
        'js/sdk/bubble.js',

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
        'js/3rd/jquery-3.4.1.slim.min.js',
        'js/3rd/underscore-1.8.2.min.js',

        'js/console.js',
        'js/app.js'
    ];

    var main = function () {
        $(function () {
            dimsdk.Application.prototype.write = window.shell_output;
            var server = dimsdk.Messenger.getInstance().server;
            server.start();
        });
    };

    // create loader with base URL
    var tasks = tarsier.base.importings;
    var current = tasks[0];
    var url = current.url;
    var base = url.substring(0, url.indexOf('js/index.js'));

    var loader = new ns.Loader(base);
    loader.showStatus('Loading DIM client from ' + base + ' ...');

    for (var i = 0; i < stylesheets.length; ++i) {
        loader.importCSS(stylesheets[i]);
    }

    for (var j = 0; j < scripts.length; ++j) {
        loader.importJS(scripts[j]);
    }
    loader.importJS('js/config.js', main);

}(window);
