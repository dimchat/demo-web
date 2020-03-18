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

    var Color = ns.Color;

    var View = ns.View;

    var Label = function (span) {
        if (!span) {
            span = document.createElement('SPAN');
        }
        View.call(this, span);
    };
    Label.prototype = Object.create(View.prototype);
    Label.prototype.constructor = Label;

    //
    //  patch View for text
    //
    View.prototype.setText = function (text) {
        this.__ie.innerText = text;
    };
    View.prototype.setColor = function (color) {
        if (color instanceof Color) {
            color = color.toString();
        }
        this.__ie.style.color = color;
    };
    View.prototype.setFontSize = function (size) {
        if (typeof size === 'number') {
            size = size + 'pt';
        }
        this.__ie.style.fontSize = size;
    };

    //-------- namespace --------
    ns.Label = Label;

}(tarsier.ui);
