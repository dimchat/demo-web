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

    var View = ns.View;
    var Image = ns.Image;

    var Button = function (btn) {
        if (!btn) {
            btn = document.createElement('BUTTON');
        }
        View.call(this, btn);
        var vc = this;
        var ie = this.__ie;
        ie.onclick = function (ev) {
            vc.onClick(ev);
            ev.cancelBubble = true;
            ev.stopPropagation();
            ev.preventDefault();
            return false;
        };
        this.__image = null;
    };
    Button.prototype = Object.create(View.prototype);
    Button.prototype.constructor = Button;

    Button.prototype.setImage = function (image) {
        if (this.__image) {
            this.removeChild(this.__image);
        }
        if (image instanceof Image) {
            this.__image = image;
        } else {
            this.__image = new Image(image);
        }
        this.appendChild(this.__image);
    };

    Button.prototype.onClick = function (ev) {
        // process click event
    };

    //-------- namespace --------
    ns.Button = Button;

}(tarsier.ui);
