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

    var Size = function (size) {
        if (arguments.length === 2) {
            this.width = arguments[0];
            this.height = arguments[1];
        } else {
            this.width = size.width;
            this.height = size.height;
        }
    };

    var Point = function (position) {
        if (arguments.length === 2) {
            this.x = arguments[0];
            this.y = arguments[1];
        } else {
            this.x = position.x;
            this.y = position.y;
        }
    };

    var Rect = function (frame) {
        if (arguments.length === 4) {
            this.origin = new Point(arguments[0], arguments[1]);
            this.size = new Size(arguments[2], arguments[3]);
        } else if (arguments.length === 2) {
            var origin = arguments[0];
            var size = arguments[1];
            if (origin instanceof Point) {
                this.origin = origin;
            } else {
                this.origin = new Point(origin.x, origin.y);
            }
            if (size instanceof Size) {
                this.size = size;
            } else {
                this.size = new Size(size.width, size.height);
            }
        } else {
            var x, y , width, height;
            if (frame.origin) {
                x = frame.origin.x;
                y = frame.origin.y;
            } else {
                x = frame.x;
                y = frame.y;
            }
            if (frame.size) {
                width = frame.size.width;
                height = frame.size.height;
            } else {
                width = frame.width;
                height = frame.height;
            }
            this.origin = new Point(x, y);
            this.size = new Size(width, height);
        }
    };

    //-------- namespace --------
    ns.Size = Size;
    ns.Point = Point;
    ns.Rect = Rect;

}(tarsier.ui);
