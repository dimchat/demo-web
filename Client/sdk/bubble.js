;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2020 Albert Moky
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// =============================================================================
//

(function (ns) {
    'use strict';

    var join = function () {
        var str = '';
        for (var i = 0; i < arguments.length; ++i) {
            str += arguments[i].toString();
        }
        return str;
    };

    var escape = function (html) {
        return html
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>')
            .replace(/ {2}/g, ' &nbsp;');
    };

    var convert = function () {
        return escape(join.apply(this, arguments));
    };

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
            tray = 'tarsier-bubble-tray';
        }
        this.tray = tray;
    };

    Bubble.prototype.getTray = function () {
        var div = document.getElementById(this.tray);
        if (!div) {
            div = document.createElement('DIV');
            div.id = this.tray;
            div.style.cssText = 'position: absolute;' +
                'bottom: 4px;' +
                'right: 4px;' +
                'z-index: 3333;' +
                'width: 60%;' +
                'font-family: Arial, sans-serif;' +
                'font-size: 10pt;';
            document.body.appendChild(div);
        }
        return div;
    };
    Bubble.prototype.getDiv = function (text) {
        var div = document.createElement('DIV');
        div.style.cssText = 'margin-bottom: 2px; margin-left: auto;' +
            'padding: 2px 8px;' +
            'width: fit-content; width: -webkit-fit-content; width: -moz-fit-content;' +
            'opacity: 0.55;' +
            'background-color: #8e0000;' +
            'color: yellow;';
        div.alpha = 55;
        div.innerText = text;
        return div;
    };

    Bubble.prototype.showText = function () {
        this.show(convert.apply(this, arguments));
    };

    Bubble.prototype.show = function () {
        var text = convert.apply(this, arguments);
        console.log('[Bubble] ' + text);
        // append DIV
        var div = this.getDiv(text);
        this.getTray().appendChild(div);
        // delay for fade out
        setTimeout(function () {
            fadeout(div);
        }, 2000);
    };

    Bubble.convertToString = convert;

    //-------- namespace --------
    ns.Bubble = Bubble;

})(window);
