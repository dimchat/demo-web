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
    Size.prototype.equals = function (other) {
        return this.width === other.width && this.height === other.height;
    };
    Size.prototype.clone = function () {
        return new Size(this.width, this.height);
    };
    Size.Zero = new Size(0, 0);

    var Point = function (position) {
        if (arguments.length === 2) {
            this.x = arguments[0];
            this.y = arguments[1];
        } else {
            this.x = position.x;
            this.y = position.y;
        }
    };
    Point.prototype.equals = function (other) {
        return this.x === other.x && this.y === other.y;
    };
    Point.prototype.clone = function () {
        return new Point(this.x, this.y);
    };
    Point.Zero = new Point(0, 0);

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
    Rect.prototype.equals = function (other) {
        return this.origin.equals(other.origin) && this.size.equals(other.size);
    };
    Rect.prototype.clone = function () {
        return new Rect(this.origin.clone(), this.size.clone());
    };
    Rect.Zero = new Rect(Point.Zero, Size.Zero);

    var Edges = function (edges) {
        if (arguments.length === 4) {
            this.left = arguments[0];
            this.top = arguments[1];
            this.right = arguments[2];
            this.bottom = arguments[3];
        } else {
            this.left = edges.left;
            this.top = edges.top;
            this.right = edges.right;
            this.bottom = edges.bottom;
        }
    };
    Edges.prototype.equals = function (other) {
        return this.left === other.left
            && this.top === other.top
            && this.right === other.right
            && this.bottom === other.bottom;
    };
    Edges.prototype.clone = function () {
        return new Edges(this.left, this.top, this.right, this.bottom);
    };
    Edges.Zero = new Edges(0, 0, 0, 0);

    //-------- namespace --------
    ns.Size = Size;
    ns.Point = Point;
    ns.Rect = Rect;
    ns.Edges = Edges;

}(tarsier.ui);
