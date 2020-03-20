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
    var Size = ns.Size;
    var Rect = ns.Rect;
    var Edges = ns.Edges;

    var Color = ns.Color;

    var View = function (div) {
        Object.call(this);
        if (!div) {
            div = document.createElement('DIV');
        }
        div.__vc = this;  // view controller
        this.__ie = div;  // inner element
        this.__frame = Rect.Zero.clone();
        this.__bounds = Rect.Zero.clone();

        this.setScroll(false);
    };
    View.prototype = Object.create(Object.prototype);
    View.prototype.constructor = View;

    View.prototype.setId = function (id) {
        this.__ie.id = id;
    };

    View.prototype.setClassName = function (clazz) {
        var name = this.__ie.className;
        if (name) {
            this.__ie.className = name + ' ' + clazz;
        } else {
            this.__ie.className = clazz;
        }
    };

    View.prototype.getParent = function () {
        return $(this.__ie.parentNode);
    };
    View.prototype.remove = function () {
        var parent = this.getParent();
        if (parent) {
            parent.removeChild(this);
        } else {
            throw Error('parent node empty');
        }
    };

    //
    //  Children
    //

    View.prototype.getChildren = function () {
        var children = [];
        var nodes = this.__ie.childNodes;
        var item;
        for (var i = 0; i < nodes.length; ++i) {
            item = nodes[i];
            if (item instanceof HTMLElement) {
                children.push($(item));
            }
        }
        return children;
    };
    View.prototype.firstChild = function () {
        return $(this.__ie.firstChild);
    };
    View.prototype.lastChild = function () {
        return $(this.__ie.lastChild);
    };
    View.prototype.appendChild = function (child) {
        child = $(child);
        this.__ie.appendChild(child.__ie);
    };
    View.prototype.insertBefore = function (node, child) {
        node = $(node);
        child = $(child);
        this.__ie.insertBefore(node.__ie, child.__ie);
    };
    View.prototype.removeChild = function (child) {
        child = $(child);
        // 1. remove view controller
        var div = child.__ie;
        delete div.__vc;
        // 2. remove inner element
        this.__ie.removeChild(div);
    };
    View.prototype.replaceChild = function (newChild, oldChild) {
        newChild = $(newChild);
        oldChild = $(oldChild);
        this.__ie.replaceChild(newChild.__ie, oldChild.__ie);
    };
    View.prototype.contains = function (child) {
        child = $(child);
        return this.__ie.contains(child.__ie);
    };

    //
    //  Geometry
    //

    var parse_int = function (value) {
        var i = parseInt(value);
        if (typeof i === 'number') {
            return i;
        } else {
            return 0;
        }
    };

    View.prototype.getFrame = function () {
        if (this.__frame.equals(Rect.Zero)) {
            var origin = this.getOrigin();
            var size = this.getSize();
            this.__frame = new Rect(origin, size);
        }
        return this.__frame;
    };
    View.prototype.setFrame = function (frame) {
        if (this.__frame.equals(frame)) {
            // frame not change
            return ;
        }
        this.setOrigin(frame.origin);
        this.setSize(frame.size);
    };

    View.prototype.getOrigin = function () {
        if (this.__frame.origin.equals(Point.Zero)) {
            var x = parse_int(this.__ie.style.left);
            var y = parse_int(this.__ie.style.top);
            this.__frame.origin = new Point(x, y);
        }
        return this.__frame.origin;
    };
    View.prototype.setOrigin = function (point) {
        if (arguments.length === 2) {
            point = new Point(arguments[0], arguments[1]);
        }
        if (this.__frame.origin.equals(point)) {
            // position not change
            return ;
        }
        this.__ie.style.position = 'absolute';
        this.__ie.style.left = point.x + 'px';
        this.__ie.style.top = point.y + 'px';
        this.__frame.origin = point;
    };

    View.prototype.getSize = function () {
        if (this.__frame.size.equals(Size.Zero)) {
            var width = parse_int(this.__ie.style.width);
            var height = parse_int(this.__ie.style.height);
            this.__frame.size = new Size(width, height);
        }
        return this.__frame.size;
    };
    View.prototype.setSize = function (size) {
        if (arguments.length === 2) {
            size = new Size(arguments[0], arguments[1]);
        }
        if (this.__frame.size.equals(size)) {
            // size not change
            return ;
        }
        this.__ie.style.width = size.width + 'px';
        this.__ie.style.height = size.height + 'px';
        // get padding before update frame.size
        var edges = this.getPadding();
        this.__frame.size = size;
        // update bounds
        var x = edges.left;
        var y = edges.top;
        var width = size.width - edges.left - edges.right;
        var height = size.height - edges.top - edges.bottom;
        var bounds = new Rect(new Point(x, y), new Size(width, height));
        this.setBounds(bounds);
    };

    View.prototype.getBounds = function () {
        if (this.__bounds.equals(Rect.Zero)) {
            // TODO: get padding
        }
        return this.__bounds;
    };
    View.prototype.setBounds = function (bounds) {
        if (this.__bounds.equals(bounds)) {
            // bounds not change
            return ;
        }
        // padding
        var frame = this.__frame;
        var left = bounds.origin.x;
        var top = bounds.origin.y;
        var right = frame.size.width - left - bounds.size.width;
        var bottom = frame.size.height - top - bounds.size.height;
        this.setPadding(top + 'px ' + right + 'px ' + bottom + 'px ' + left + 'px');
        // update bounds and layout subviews
        var needsLayoutSubviews = !this.__bounds.size.equals(bounds.size);
        this.__bounds = bounds;
        if (needsLayoutSubviews) {
            this.layoutSubviews();
        }
    };

    View.prototype.layoutSubviews = function () {
        // implement me to adjust subviews
    };

    View.prototype.setMargin = function (margin) {
        if (typeof margin === 'number') {
            margin = margin + 'px';
        }
        this.__ie.style.margin = margin;
    };
    View.prototype.setBorder = function (border) {
        if (typeof border === 'number') {
            border = border + 'px';
        }
        this.__ie.style.border = border;
    };

    View.prototype.getPadding = function () {
        var padding = this.__ie.style.padding;
        var left, top, right, bottom;
        if (padding && padding.length > 0) {
            var values = padding.split(' ');
            if (values.length === 1) {
                left = top = right = bottom = parse_int(values[0]);
            } else if (values.length === 2) {
                top = bottom = parse_int(values[0]);
                left = right = parse_int(values[1]);
            } else if (values.length === 3) {
                top = parse_int(values[0]);
                left = right = parse_int(values[1]);
                bottom = parse_int(values[2]);
            } else if (values.length === 4) {
                top = parse_int(values[0]);
                right = parse_int(values[1]);
                bottom = parse_int(values[2]);
                left = right = parse_int(values[3]);
            } else {
                throw Error('padding error: ' + padding);
            }
        } else {
            var frame = this.__frame;
            var bounds = this.__bounds;
            if (bounds.equals(Rect.Zero) || frame.equals(Rect.Zero)) {
                left = top = right = bottom = 0;
            } else {
                left = bounds.origin.x;
                top = bounds.origin.y;
                right = frame.size.width - left - bounds.size.width;
                bottom = frame.size.height - top - bounds.size.height;
            }
        }
        return new Edges(left, top, right, bottom);
    };
    View.prototype.setPadding = function (padding) {
        if (padding instanceof Edges) {
            var left = padding.left;
            var top = padding.top;
            var right = padding.right;
            var bottom = padding.bottom;
            padding = top + 'px ' + right + 'px ' + bottom + 'px ' + left + 'px';
        } else if (typeof padding === 'number') {
            padding = padding + 'px';
        }
        this.__ie.style.padding = padding;
    };

    View.prototype.getZ = function () {
        var zIndex = this.__ie.style.zIndex;
        if (zIndex) {
            return parseInt(zIndex);
        } else {
            return 0;
        }
    };
    View.prototype.setZ = function (zIndex) {
        this.__ie.style.zIndex = zIndex;
    };

    View.prototype.floatToTop = function () {
        var parent = this.getParent();
        var brothers = parent.getChildren();
        var pos = brothers.indexOf(this);
        var zIndex = 0, z;
        var i = 0, total = brothers.length;
        for (; i < pos; ++i) {
            z = brothers[i].getZ();
            if (zIndex < z) {
                zIndex = z;
            }
        }
        for (++i; i < total; ++i) {
            z = brothers[i].getZ();
            if (zIndex <= z) {
                zIndex = z + 1;
            }
        }
        this.setZ(zIndex);
    };

    View.prototype.setBackgroundColor = function (color) {
        if (color instanceof Color) {
            color = color.toString();
        }
        this.__ie.style.backgroundColor = color;
    };

    //-------- namespace --------
    ns.View = View;

}(tarsier.ui);
