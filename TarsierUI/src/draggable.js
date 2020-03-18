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

!function (ns) {
    'use strict';

    var $ = ns.$;
    var Point = ns.Point;

    var enable = function (div) {
        div.draggable = true;
        div.__dp = null;
        div.ondragstart = function (ev) {
            var x = ev.clientX - div.offsetLeft;
            var y = ev.clientY - div.offsetTop;
            div.__dp = new Point(x, y);
            $(div).floatToTop();
            return true;
        };
        div.ondrag = div.ondragover = function (ev) {
            ev.preventDefault();
            var delta = div.__dp;
            if (delta) {
                var x = ev.clientX - delta.x;
                var y = ev.clientY - delta.y;
                $(div).setOrigin(new Point(x, y));
            }
        };
        div.ondragend = function (ev) {
            ev.preventDefault();
            div.__dp = null;
        };
    };

    var disable = function (div) {
        div.draggable = false;
    };

    //-------- namespace --------

    ns.Draggable = {
        enable: enable,
        disable: disable
    };

}(tarsier.ui);
