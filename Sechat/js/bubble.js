;

!function (ns) {

    var join = function () {
        var str = '';
        for (var i = 0; i < arguments.length; ++i) {
            str += arguments[i] + '';
        }
        return str;
    };

    // var escape = function (html) {
    //     return html
    //         .replace(/</g, '&lt;')
    //         .replace(/>/g, '&gt;')
    //         .replace(/\n/g, '<br/>')
    //         .replace(/ {2}/g, ' &nbsp;');
    // };

    var fadeout = function (div) {
        var alpha = div.alpha;
        if (!alpha) {
            alpha = 100;
        } else {
            alpha -= 5;
        }
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.indexOf("msie") !== -1 && ua.indexOf("opera") === -1) {
            div.style.filter = "Alpha(Opacity=" + alpha + ")";
        } else {
            div.style.opacity = String(alpha / 100.0);
        }
        if (alpha < 1) {
            div.parentNode.removeChild(div);
        } else {
            div.alpha = alpha;
            setTimeout(function () {
                fadeout(div);
            }, 50);
        }
    };

    var Bubble = function (tray) {
        if (!tray) {
            tray = 'tarsier-bubble';
        }
        this.tray = tray;
    };

    Bubble.prototype.getTray = function () {
        var div = document.getElementById(this.tray);
        if (!div) {
            div = document.createElement('DIV');
            div.id = this.tray;
            div.style.cssText = 'position: absolute;' +
                'bottom: 24px;' +
                'right: 4px;' +
                'z-index: 3333;' +
                'font-family: Arial, sans-serif;' +
                'font-size: 10pt;' +
                'white-space: nowrap;';
            document.body.appendChild(div);
        }
        return div;
    };

    Bubble.prototype.showText = function () {
        this.show(join.apply(this, arguments));
    };

    Bubble.prototype.show = function () {
        var div = document.createElement('DIV');
        div.style.cssText = 'margin-bottom: 2px; margin-left: auto;' +
            'padding: 2px 8px;' +
            'width: fit-content; width: -webkit-fit-content; width: -moz-fit-content;' +
            'opacity: 0.55;' +
            'background-color: #8e0000;' +
            'color: yellow;' +
            'white-space: nowrap;';
        div.alpha = 55;
        div.innerText = join.apply(this, arguments);
        this.getTray().appendChild(div);
        // delay for fade out
        setTimeout(function () {
            fadeout(div);
        }, 2000);
    };

    //-------- namespace --------
    ns.Bubble = Bubble;

}(window);
