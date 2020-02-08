;

!function () {
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
    document.body.innerHTML = html;

}();

!function () {
    'use strict';

    var base = 'http://dimchat.github.io/demo/';
    // var base = window.location.href.replace('index.html', '');

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
        'js/3rd/jquery-1.8.3.min.js',
        'js/3rd/underscore-1.8.2.min.js',

        'js/console.js',
        'js/app.js'
    ];
    var stylesheets = [
        'css/index.css'
    ];

    var main = function () {
        $(function () {
            app.write = window.shell_output;
            server.start();
        });
    };

    for (var i = 0; i < stylesheets.length; ++i) {
        tarsier.importCSS(base + stylesheets[i]);
    }

    for (var j = 0; j < scripts.length; ++j) {
        tarsier.importJS(base + scripts[j]);
    }
    tarsier.importJS(base + 'js/config.js', main);

}();
