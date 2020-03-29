/**
 *  Tarsier UI Kits (v0.1.0)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Mar. 28, 2020
 * @copyright (c) 2020 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof tarsier !== "object") {
    tarsier = {}
}
if (typeof tarsier.ui !== "object") {
    tarsier.ui = {}
}! function(ns) {
    var $ = function(node) {
        if (!node) {
            return null
        }
        if (node.__vc instanceof ns.View) {
            return node.__vc
        }
        if (node instanceof ns.View) {
            return node
        }
        if (node instanceof HTMLButtonElement) {
            return new ns.Button(node)
        }
        if (typeof HTMLDataListElement === "object") {
            if (node instanceof HTMLDataListElement) {
                return new ns.DataList(node)
            }
        }
        if (node instanceof HTMLDivElement) {
            return new ns.Div(node)
        }
        if (node instanceof HTMLFieldSetElement) {
            return new ns.FieldSet(node)
        }
        if (node instanceof HTMLImageElement) {
            return new ns.Image(node)
        }
        if (node instanceof HTMLInputElement) {
            return new ns.Input(node)
        }
        if (node instanceof HTMLLinkElement) {
            return new ns.Link(node)
        }
        if (node instanceof HTMLOptionElement) {
            return new ns.Option(node)
        }
        if (node instanceof HTMLSpanElement) {
            return new ns.Span(node)
        }
        if (node instanceof HTMLTextAreaElement) {
            return new ns.TextArea(node)
        }
        if (node instanceof HTMLElement) {
            return new ns.View(node)
        }
        if (typeof node === "string") {
            return $(select(node))
        }
        throw TypeError("element error: " + node)
    };
    var select = function(path) {
        if (path.charAt(0) === "#") {
            return document.getElementById(path.substring(1))
        }
        throw Error("failed to select element: " + path)
    };
    ns.$ = $
}(tarsier.ui);
! function(ns) {
    var Color = function(color) {
        if (arguments.length === 3) {
            this.r = arguments[0];
            this.g = arguments[1];
            this.b = arguments[2]
        } else {
            this.r = color.r;
            this.g = color.g;
            this.b = color.b
        }
    };
    var hex_chars = "0123456789ABCDEF";
    Color.prototype.toString = function() {
        var string = "#";
        string += hex_chars[this.r >> 4];
        string += hex_chars[this.r & 15];
        string += hex_chars[this.g >> 4];
        string += hex_chars[this.g & 15];
        string += hex_chars[this.b >> 4];
        string += hex_chars[this.b & 15];
        return string
    };
    Color.Red = new Color(255, 0, 0);
    Color.Green = new Color(0, 255, 0);
    Color.Blue = new Color(0, 0, 255);
    Color.White = new Color(255, 255, 255);
    Color.Black = new Color(0, 0, 0);
    Color.Gray = new Color(119, 119, 119);
    Color.LightGray = new Color(221, 221, 221);
    Color.DarkGray = new Color(51, 51, 51);
    ns.Color = Color
}(tarsier.ui);
! function(ns) {
    var Size = function(size) {
        if (arguments.length === 2) {
            this.width = arguments[0];
            this.height = arguments[1]
        } else {
            this.width = size.width;
            this.height = size.height
        }
    };
    Size.prototype.equals = function(other) {
        return this.width === other.width && this.height === other.height
    };
    Size.prototype.clone = function() {
        return new Size(this.width, this.height)
    };
    Size.Zero = new Size(0, 0);
    var Point = function(position) {
        if (arguments.length === 2) {
            this.x = arguments[0];
            this.y = arguments[1]
        } else {
            this.x = position.x;
            this.y = position.y
        }
    };
    Point.prototype.equals = function(other) {
        return this.x === other.x && this.y === other.y
    };
    Point.prototype.clone = function() {
        return new Point(this.x, this.y)
    };
    Point.Zero = new Point(0, 0);
    var Rect = function(frame) {
        if (arguments.length === 4) {
            this.origin = new Point(arguments[0], arguments[1]);
            this.size = new Size(arguments[2], arguments[3])
        } else {
            if (arguments.length === 2) {
                var origin = arguments[0];
                var size = arguments[1];
                if (origin instanceof Point) {
                    this.origin = origin
                } else {
                    this.origin = new Point(origin.x, origin.y)
                }
                if (size instanceof Size) {
                    this.size = size
                } else {
                    this.size = new Size(size.width, size.height)
                }
            } else {
                var x, y, width, height;
                if (frame.origin) {
                    x = frame.origin.x;
                    y = frame.origin.y
                } else {
                    x = frame.x;
                    y = frame.y
                }
                if (frame.size) {
                    width = frame.size.width;
                    height = frame.size.height
                } else {
                    width = frame.width;
                    height = frame.height
                }
                this.origin = new Point(x, y);
                this.size = new Size(width, height)
            }
        }
    };
    Rect.prototype.equals = function(other) {
        return this.origin.equals(other.origin) && this.size.equals(other.size)
    };
    Rect.prototype.clone = function() {
        return new Rect(this.origin.clone(), this.size.clone())
    };
    Rect.Zero = new Rect(Point.Zero, Size.Zero);
    var Edges = function(edges) {
        if (arguments.length === 4) {
            this.left = arguments[0];
            this.top = arguments[1];
            this.right = arguments[2];
            this.bottom = arguments[3]
        } else {
            this.left = edges.left;
            this.top = edges.top;
            this.right = edges.right;
            this.bottom = edges.bottom
        }
    };
    Edges.prototype.equals = function(other) {
        return this.left === other.left && this.top === other.top && this.right === other.right && this.bottom === other.bottom
    };
    Edges.prototype.clone = function() {
        return new Edges(this.left, this.top, this.right, this.bottom)
    };
    Edges.Zero = new Edges(0, 0, 0, 0);
    ns.Size = Size;
    ns.Point = Point;
    ns.Rect = Rect;
    ns.Edges = Edges
}(tarsier.ui);
! function(ns) {
    var $ = ns.$;
    var Point = ns.Point;
    var cancel_bubble = function(ev) {
        ev.cancelBubble = true;
        ev.stopPropagation();
        ev.preventDefault()
    };
    var start = function(point, controller) {
        var div = controller.__ie;
        point.x -= div.offsetLeft;
        point.y -= div.offsetTop;
        controller.__dp = point;
        controller.floatToTop()
    };
    var move = function(ev, point, controller) {
        if (!controller.__dp) {
            return
        }
        point.x -= controller.__dp.x;
        point.y -= controller.__dp.y;
        controller.setOrigin(point);
        cancel_bubble(ev)
    };
    var end = function(ev, controller) {
        if (!controller.__dp) {
            return
        }
        cancel_bubble(ev);
        controller.__dp = null
    };
    var enable = function(controller, dragAreas) {
        controller = $(controller);
        controller.__dp = null;
        var drag_start = function(ev) {
            start(new Point(ev.clientX, ev.clientY), controller);
            return true
        };
        var drag_move = function(ev) {
            move(ev, new Point(ev.clientX, ev.clientY), controller)
        };
        var drag_end = function(ev) {
            end(ev, controller)
        };
        var touch_start = function(ev) {
            var touch = ev.touches[0];
            start(new Point(touch.clientX, touch.clientY), controller);
            return true
        };
        var touch_move = function(ev) {
            var touch = ev.touches[0];
            move(ev, new Point(touch.clientX, touch.clientY), controller)
        };
        var touch_end = function(ev) {
            end(ev, controller)
        };
        var div;
        for (var i = 0; i < dragAreas.length; ++i) {
            div = $(dragAreas[i]).__ie;
            div.draggable = true;
            div.ondragstart = drag_start;
            div.ondrag = div.ondragover = drag_move;
            div.ondragend = drag_end;
            div.ontouchstart = touch_start;
            div.ontouchmove = touch_move;
            div.ontouchend = touch_end;
            div.addEventListener("touchstart", touch_start, false);
            div.addEventListener("touchmove", touch_move, false);
            div.addEventListener("touchend", touch_end, false)
        }
    };
    var disable = function(controller, dragAreas) {
        controller = $(controller);
        delete controller.__dp;
        var div;
        for (var i = 0; i < dragAreas.length; ++i) {
            div = $(dragAreas[i]).__ie;
            div.ondragstart = null;
            div.ondrag = div.ondragover = null;
            div.ondragend = null;
            div.removeEventListener("touchstart", div.ontouchstart, false);
            div.removeEventListener("touchmove", div.ontouchmove, false);
            div.removeEventListener("touchend", div.ontouchend, false);
            div.ontouchstart = null;
            div.ontouchmove = null;
            div.ontouchend = null
        }
    };
    ns.Draggable = {
        enable: enable,
        disable: disable
    }
}(tarsier.ui);
! function(ns) {
    var $ = ns.$;
    var Rect = ns.Rect;
    var Color = ns.Color;
    var View = function(div) {
        Object.call(this);
        if (!div) {
            div = document.createElement("DIV")
        }
        div.__vc = this;
        this.__ie = div;
        this.__frame = Rect.Zero.clone();
        this.__bounds = Rect.Zero.clone();
        this.setScroll(false);
        this.needsLayoutSubviews = false
    };
    View.prototype = Object.create(Object.prototype);
    View.prototype.constructor = View;
    View.prototype.getId = function() {
        return this.__ie.id
    };
    View.prototype.setId = function(id) {
        this.__ie.id = id;
        return this
    };
    View.prototype.getClassName = function() {
        return this.__ie.className
    };
    View.prototype.setClassName = function(clazz) {
        var name = this.__ie.className;
        if (name) {
            this.__ie.className = name + " " + clazz
        } else {
            this.__ie.className = clazz
        }
        return this
    };
    View.prototype.setBackgroundColor = function(color) {
        if (color instanceof Color) {
            color = color.toString()
        }
        this.__ie.style.backgroundColor = color;
        return this
    };
    View.prototype.remove = function() {
        var parent = this.getParent();
        if (!parent) {
            throw Error("parent node empty")
        }
        parent.removeChild(this);
        return this
    };
    View.prototype.floatToTop = function() {
        var parent = this.getParent();
        if (!parent) {
            console.error("parent node empty");
            return null
        }
        var siblings = parent.getChildren();
        var pos = siblings.indexOf(this);
        var zIndex = 0,
            z;
        var i = 0,
            total = siblings.length;
        for (; i < pos; ++i) {
            z = siblings[i].getZ();
            if (zIndex < z) {
                zIndex = z
            }
        }
        for (++i; i < total; ++i) {
            z = siblings[i].getZ();
            if (zIndex <= z) {
                zIndex = z + 1
            }
        }
        this.setZ(zIndex);
        return this
    };
    View.prototype.layoutSubviews = function() {
        if (!this.needsLayoutSubviews) {
            return
        }
        var children = this.getChildren();
        for (var i = 0; i < children.length; ++i) {
            children[i].layoutSubviews()
        }
        this.needsLayoutSubviews = false;
        return this
    };
    View.prototype.onEnter = null;
    View.prototype.onExit = null;
    View.prototype.appendChild = function(child) {
        child = $(child);
        insert.call(this, child.__ie, null);
        return this
    };
    View.prototype.insertBefore = function(newChild, existingChild) {
        newChild = $(newChild);
        existingChild = $(existingChild);
        insert.call(this, newChild.__ie, existingChild.__ie);
        return this
    };
    View.prototype.insertAfter = function(newChild, existingChild) {
        newChild = $(newChild);
        existingChild = $(existingChild);
        insert.call(this, newChild.__ie, existingChild.__ie.nextSibling);
        return this
    };
    var insert = function(new_node, existing_node) {
        if (existing_node) {
            this.__ie.insertBefore(new_node, existing_node)
        } else {
            this.__ie.appendChild(new_node)
        }
        var newChild = $(new_node);
        if (typeof newChild.onEnter === "function") {
            newChild.onEnter()
        }
    };
    View.prototype.removeChild = function(child) {
        child = $(child);
        if (typeof child.onExit === "function") {
            child.onExit()
        }
        this.__ie.removeChild(child.__ie);
        delete child.__ie;
        return this
    };
    View.prototype.removeChildren = function() {
        var children = this.getChildren();
        var index = children.length;
        while (--index >= 0) {
            this.removeChild(children[index])
        }
        return this
    };
    View.prototype.replaceChild = function(newChild, oldChild) {
        newChild = $(newChild);
        oldChild = $(oldChild);
        if (typeof oldChild.onExit === "function") {
            oldChild.onExit()
        }
        this.__ie.replaceChild(newChild.__ie, oldChild.__ie);
        if (typeof newChild.onEnter === "function") {
            newChild.onEnter()
        }
        delete oldChild.__ie;
        return this
    };
    ns.View = View;
    ns.Div = View
}(tarsier.ui);
! function(ns) {
    var $ = ns.$;
    var View = ns.View;
    View.prototype.getParent = function() {
        return $(this.__ie.parentNode)
    };
    View.prototype.previousSibling = function() {
        var parent = this.getParent();
        if (parent) {
            var siblings = parent.getChildren();
            var index = siblings.indexOf(this);
            if (index > 0) {
                return siblings[index - 1]
            }
        }
        return null
    };
    View.prototype.nextSibling = function() {
        var parent = this.getParent();
        if (parent) {
            var siblings = parent.getChildren();
            var index = siblings.indexOf(this);
            if (index < 0) {
                throw Error("Hierarchy error: " + siblings)
            }
            index += 1;
            if (index < siblings.length) {
                return siblings[index]
            }
        }
        return null
    };
    View.prototype.getChildren = function() {
        var children = [];
        var nodes = this.__ie.childNodes;
        var item;
        for (var i = 0; i < nodes.length; ++i) {
            item = nodes[i];
            if (item instanceof HTMLElement) {
                children.push($(item))
            }
        }
        return children
    };
    View.prototype.firstChild = function() {
        var children = this.getChildren();
        if (children.length > 0) {
            return children[0]
        } else {
            return null
        }
    };
    View.prototype.lastChild = function() {
        var children = this.getChildren();
        if (children.length > 0) {
            return children[children.length - 1]
        } else {
            return null
        }
    };
    View.prototype.contains = function(child) {
        child = $(child);
        return this.__ie.contains(child.__ie)
    }
}(tarsier.ui);
! function(ns) {
    var Point = ns.Point;
    var Size = ns.Size;
    var Rect = ns.Rect;
    var Edges = ns.Edges;
    var View = ns.View;
    var parse_int = function(value, defaultValue) {
        if (value) {
            var i = parseInt(value);
            if (typeof i === "number") {
                return i
            }
        }
        return defaultValue
    };
    View.prototype.getX = function() {
        return parse_int(this.__ie.style.left, this.__ie.offsetLeft)
    };
    View.prototype.getY = function() {
        return parse_int(this.__ie.style.top, this.__ie.offsetTop)
    };
    View.prototype.getZ = function() {
        return parse_int(this.__ie.style.zIndex, 0)
    };
    View.prototype.setX = function(left) {
        this.__ie.style.position = "absolute";
        this.__ie.style.left = left + "px";
        this.__ie.offsetLeft = this.__frame.origin.x = left;
        return this
    };
    View.prototype.setY = function(top) {
        this.__ie.style.position = "absolute";
        this.__ie.style.top = top + "px";
        this.__ie.offsetTop = this.__frame.origin.y = top;
        return this
    };
    View.prototype.setZ = function(zIndex) {
        this.__ie.style.zIndex = zIndex;
        return this
    };
    View.prototype.getWidth = function() {
        return parse_int(this.__ie.style.width, this.__ie.offsetWidth)
    };
    View.prototype.getHeight = function() {
        return parse_int(this.__ie.style.height, this.__ie.offsetHeight)
    };
    View.prototype.setWidth = function(width) {
        this.__ie.style.width = width + "px";
        this.__ie.offsetWidth = this.__frame.size.width = width;
        this.__bounds.size.width = width - this.__bounds.origin.x - this.getPaddingRight();
        this.needsLayoutSubviews = true;
        return this
    };
    View.prototype.setHeight = function(height) {
        this.__ie.style.height = height + "px";
        this.__ie.offsetHeight = this.__frame.size.height = height;
        this.__bounds.size.height = height - this.__bounds.origin.y - this.getPaddingBottom();
        this.needsLayoutSubviews = true;
        return this
    };
    View.prototype.getFrame = function() {
        if (this.__frame.equals(Rect.Zero)) {
            var origin = this.getOrigin();
            var size = this.getSize();
            this.__frame = new Rect(origin, size)
        }
        return this.__frame
    };
    View.prototype.setFrame = function(frame) {
        if (this.__frame.equals(frame)) {
            return this
        }
        this.setOrigin(frame.origin);
        this.setSize(frame.size);
        return this
    };
    View.prototype.getOrigin = function() {
        if (this.__frame.origin.equals(Point.Zero)) {
            var x = this.getX();
            var y = this.getY();
            this.__frame.origin = new Point(x, y)
        }
        return this.__frame.origin
    };
    View.prototype.setOrigin = function(point) {
        if (arguments.length === 2) {
            point = new Point(arguments[0], arguments[1])
        }
        if (this.__frame.origin.equals(point)) {
            return this
        }
        this.setX(point.x);
        this.setY(point.y);
        return this
    };
    View.prototype.getSize = function() {
        if (this.__frame.size.equals(Size.Zero)) {
            var width = this.getWidth();
            var height = this.getHeight();
            this.__frame.size = new Size(width, height)
        }
        return this.__frame.size
    };
    View.prototype.setSize = function(size) {
        if (arguments.length === 2) {
            size = new Size(arguments[0], arguments[1])
        }
        if (this.__frame.size.equals(size)) {
            return this
        }
        this.setWidth(size.width);
        this.setHeight(size.height);
        return this
    };
    View.prototype.getBounds = function() {
        if (this.__bounds.equals(Rect.Zero)) {
            var size = this.getSize();
            var edges = this.getPadding();
            this.__bounds.origin.x = edges.left;
            this.__bounds.origin.y = edges.top;
            this.__bounds.size.width = size.width - edges.left - edges.right;
            this.__bounds.size.height = size.height - edges.top - edges.bottom
        }
        return this.__bounds
    };
    View.prototype.setBounds = function(bounds) {
        if (this.__bounds.equals(bounds)) {
            return this
        }
        var frame = this.__frame;
        var left = bounds.origin.x;
        var top = bounds.origin.y;
        var right = frame.size.width - left - bounds.size.width;
        var bottom = frame.size.height - top - bounds.size.height;
        this.setPadding(new Edges(left, top, right, bottom));
        return this
    }
}(tarsier.ui);
! function(ns) {
    var Rect = ns.Rect;
    var Edges = ns.Edges;
    var View = ns.View;
    View.prototype.getPadding = function() {
        var left = this.getPaddingLeft();
        var right = this.getPaddingRight();
        var top = this.getPaddingTop();
        var bottom = this.getPaddingBottom();
        return new Edges(left, top, right, bottom)
    };
    View.prototype.setPadding = function(padding) {
        var left, top, right, bottom;
        if (padding instanceof Edges) {
            left = padding.left;
            top = padding.top;
            right = padding.right;
            bottom = padding.bottom;
            padding = top + "px " + right + "px " + bottom + "px " + left + "px"
        } else {
            if (typeof padding === "number") {
                left = top = right = bottom = padding;
                padding = padding + "px"
            } else {
                if (typeof padding === "string") {
                    var values = padding.split(" ");
                    if (values.length === 1) {
                        left = top = right = bottom = parseInt(values[0])
                    } else {
                        if (values.length === 2) {
                            top = bottom = parseInt(values[0]);
                            left = right = parseInt(values[1])
                        } else {
                            if (values.length === 3) {
                                top = parseInt(values[0]);
                                left = right = parseInt(values[1]);
                                bottom = parseInt(values[2])
                            } else {
                                if (values.length === 4) {
                                    top = parseInt(values[0]);
                                    right = parseInt(values[1]);
                                    bottom = parseInt(values[2]);
                                    left = parseInt(values[3])
                                } else {
                                    throw Error("padding error: " + padding)
                                }
                            }
                        }
                    }
                } else {
                    throw TypeError("error padding: " + padding)
                }
            }
        }
        this.__ie.style.paddingLeft = null;
        this.__ie.style.paddingRight = null;
        this.__ie.style.paddingTop = null;
        this.__ie.style.paddingBottom = null;
        this.__ie.style.padding = padding;
        var size = this.getSize();
        var x = left;
        var y = top;
        var width = size.width - left - right;
        var height = size.height - top - bottom;
        this.__bounds = new Rect(x, y, width, height);
        this.needsLayoutSubviews = true;
        return this
    };
    View.prototype.getPaddingLeft = function() {
        var padding = this.__ie.style.paddingLeft;
        if (padding) {
            return parseInt(padding)
        }
        padding = this.__ie.style.padding;
        if (padding) {
            var values = padding.split(" ");
            if (values.length === 1) {
                return parseInt(values[0])
            } else {
                if (values.length === 2) {
                    return parseInt(values[1])
                } else {
                    if (values.length === 3) {
                        return parseInt(values[1])
                    } else {
                        if (values.length === 4) {
                            return parseInt(values[3])
                        } else {
                            throw Error("padding error: " + padding)
                        }
                    }
                }
            }
        }
        return 0
    };
    View.prototype.setPaddingLeft = function(left) {
        var top = this.getPaddingTop();
        var right = this.getPaddingRight();
        var bottom = this.getPaddingBottom();
        this.setPadding(new Edges(left, top, right, bottom));
        return this
    };
    View.prototype.getPaddingRight = function() {
        var padding = this.__ie.style.paddingRight;
        if (padding) {
            return parseInt(padding)
        }
        padding = this.__ie.style.padding;
        if (padding) {
            var values = padding.split(" ");
            if (values.length === 1) {
                return parseInt(values[0])
            } else {
                if (values.length === 2) {
                    return parseInt(values[1])
                } else {
                    if (values.length === 3) {
                        return parseInt(values[1])
                    } else {
                        if (values.length === 4) {
                            return parseInt(values[1])
                        } else {
                            throw Error("padding error: " + padding)
                        }
                    }
                }
            }
        }
        return 0
    };
    View.prototype.setPaddingRight = function(right) {
        var top = this.getPaddingTop();
        var bottom = this.getPaddingBottom();
        var left = this.getPaddingLeft();
        this.setPadding(new Edges(left, top, right, bottom));
        return this
    };
    View.prototype.getPaddingTop = function() {
        var padding = this.__ie.style.paddingTop;
        if (padding) {
            return parseInt(padding)
        }
        padding = this.__ie.style.padding;
        if (padding) {
            var values = padding.split(" ");
            if (values.length === 1) {
                return parseInt(values[0])
            } else {
                if (values.length === 2) {
                    return parseInt(values[0])
                } else {
                    if (values.length === 3) {
                        return parseInt(values[0])
                    } else {
                        if (values.length === 4) {
                            return parseInt(values[0])
                        } else {
                            throw Error("padding error: " + padding)
                        }
                    }
                }
            }
        }
        return 0
    };
    View.prototype.setPaddingTop = function(top) {
        var right = this.getPaddingRight();
        var bottom = this.getPaddingBottom();
        var left = this.getPaddingLeft();
        this.setPadding(new Edges(left, top, right, bottom));
        return this
    };
    View.prototype.getPaddingBottom = function() {
        var padding = this.__ie.style.paddingBottom;
        if (padding) {
            return parseInt(padding)
        }
        padding = this.__ie.style.padding;
        if (padding) {
            var values = padding.split(" ");
            if (values.length === 1) {
                return parseInt(values[0])
            } else {
                if (values.length === 2) {
                    return parseInt(values[0])
                } else {
                    if (values.length === 3) {
                        return parseInt(values[2])
                    } else {
                        if (values.length === 4) {
                            return parseInt(values[2])
                        } else {
                            throw Error("padding error: " + padding)
                        }
                    }
                }
            }
        }
        return 0
    };
    View.prototype.setPaddingBottom = function(bottom) {
        var top = this.getPaddingTop();
        var right = this.getPaddingRight();
        var left = this.getPaddingLeft();
        this.setPadding(new Edges(left, top, right, bottom));
        return this
    }
}(tarsier.ui);
! function(ns) {
    var Color = ns.Color;
    var View = ns.View;
    var Label = function(span) {
        if (!span) {
            span = document.createElement("SPAN")
        }
        View.call(this, span)
    };
    Label.prototype = Object.create(View.prototype);
    Label.prototype.constructor = Label;
    View.prototype.getText = function() {
        return this.__ie.innerText
    };
    View.prototype.setText = function(text) {
        this.__ie.innerText = text;
        return this
    };
    View.prototype.setColor = function(color) {
        if (color instanceof Color) {
            color = color.toString()
        }
        this.__ie.style.color = color;
        return this
    };
    View.prototype.setFontSize = function(size) {
        if (typeof size === "number") {
            size = size + "pt"
        }
        this.__ie.style.fontSize = size;
        return this
    };
    ns.Label = Label;
    ns.Span = Label
}(tarsier.ui);
! function(ns) {
    var $ = ns.$;
    var View = ns.View;
    var Input = function(input) {
        if (!input) {
            input = document.createElement("INPUT")
        }
        View.call(this, input)
    };
    Input.prototype = Object.create(View.prototype);
    Input.prototype.constructor = Input;
    Input.prototype.getValue = function() {
        return this.__ie.value
    };
    Input.prototype.setValue = function(text) {
        this.__ie.value = text;
        return this
    };
    Input.prototype.getDatalist = function() {
        var dataList = this.__ie.list;
        if (typeof dataList === "string") {
            return $(document.getElementById(dataList))
        }
        if (typeof HTMLDataListElement === "object") {
            if (dataList instanceof HTMLDataListElement) {
                return $(dataList)
            }
        }
        return null
    };
    Input.prototype.setDataList = function(options) {
        var dataList = this.getDatalist();
        if (!dataList) {
            var id = "" + Math.random();
            id = "ts_datalist_" + id.substring(2);
            dataList = new ns.DataList();
            dataList.setId(id);
            this.appendChild(dataList);
            this.__ie.setAttribute("list", id)
        }
        dataList.setOptions(options);
        return this
    };
    ns.Input = Input
}(tarsier.ui);
! function(ns) {
    var View = ns.View;
    var Option = function(option) {
        if (!option) {
            option = document.createElement("OPTION")
        }
        View.call(this, option)
    };
    Option.prototype = Object.create(View.prototype);
    Option.prototype.constructor = Option;
    var DataList = function(dataList) {
        if (!dataList) {
            dataList = document.createElement("DATALIST")
        }
        View.call(this, dataList)
    };
    DataList.prototype = Object.create(View.prototype);
    DataList.prototype.constructor = DataList;
    DataList.prototype.setOptions = function(options) {
        this.removeChildren();
        var opt, value;
        for (var i = 0; i < options.length; ++i) {
            opt = options[i];
            if (typeof opt === "string") {
                value = opt;
                opt = new Option();
                opt.setText(value);
                this.appendChild(opt)
            }
        }
        return this
    };
    ns.DataList = DataList;
    ns.Option = Option
}(tarsier.ui);
! function(ns) {
    var View = ns.View;
    var TextArea = function(textarea) {
        if (!textarea) {
            textarea = document.createElement("TEXTAREA")
        }
        View.call(this, textarea)
    };
    TextArea.prototype = Object.create(View.prototype);
    TextArea.prototype.constructor = TextArea;
    TextArea.prototype.getValue = function() {
        return this.__ie.value
    };
    TextArea.prototype.setValue = function(text) {
        this.__ie.value = text;
        return this
    };
    ns.TextArea = TextArea
}(tarsier.ui);
! function(ns) {
    var View = ns.View;
    var Image = function(img) {
        if (!img) {
            img = document.createElement("IMG")
        }
        View.call(this, img)
    };
    Image.prototype = Object.create(View.prototype);
    Image.prototype.constructor = Image;
    Image.prototype.setSrc = function(src) {
        this.__ie.src = src;
        return this
    };
    ns.Image = Image
}(tarsier.ui);
! function(ns) {
    var View = ns.View;
    var Button = function(btn) {
        if (!btn) {
            btn = document.createElement("BUTTON")
        }
        View.call(this, btn);
        var vc = this;
        this.__ie.onclick = function(ev) {
            if (typeof vc.onClick === "function") {
                ev.cancelBubble = true;
                ev.stopPropagation();
                ev.preventDefault();
                vc.onClick(ev)
            }
        }
    };
    Button.prototype = Object.create(View.prototype);
    Button.prototype.constructor = Button;
    View.prototype.onClick = null;
    View.prototype.setImage = function(src) {
        this.__ie.style.backgroundImage = "url(" + src + ")";
        this.__ie.style.backgroundSize = "100% 100%";
        return this
    };
    ns.Button = Button
}(tarsier.ui);
! function(ns) {
    var View = ns.View;
    var Link = function(a) {
        if (!a) {
            a = document.createElement("A");
            a.target = "_blank"
        }
        View.call(this, a)
    };
    Link.prototype = Object.create(View.prototype);
    Link.prototype.constructor = Link;
    Link.prototype.setURL = function(url) {
        this.__ie.href = url;
        return this
    };
    ns.Link = Link
}(tarsier.ui);
! function(ns) {
    var View = ns.View;
    var Legend = function(legend) {
        if (!legend) {
            legend = document.createElement("LEGEND")
        }
        View.call(this, legend)
    };
    Legend.prototype = Object.create(View.prototype);
    Legend.prototype.constructor = Legend;
    var get_legend = function() {
        var children = this.getChildren();
        var node;
        for (var i = 0; i < children.length; ++i) {
            node = children[i];
            if (node instanceof Legend) {
                return node
            }
        }
        return null
    };
    var FieldSet = function(fieldset) {
        if (!fieldset) {
            fieldset = document.createElement("FIELDSET")
        }
        View.call(this, fieldset)
    };
    FieldSet.prototype = Object.create(View.prototype);
    FieldSet.prototype.constructor = FieldSet;
    FieldSet.prototype.getCaption = function() {
        var legend = get_legend.call(this);
        if (legend) {
            return legend.getText()
        }
        return null
    };
    FieldSet.prototype.setCaption = function(text) {
        var legend = get_legend.call(this);
        if (!legend) {
            legend = new Legend();
            var first = this.firstChild();
            if (first) {
                this.insertBefore(legend, first)
            } else {
                this.appendChild(legend)
            }
        }
        legend.setText(text);
        return this
    };
    ns.FieldSet = FieldSet
}(tarsier.ui);
! function(ns) {
    var View = ns.View;
    var ScrollView = function(div) {
        View.call(this, div);
        this.setScroll(true)
    };
    ScrollView.prototype = Object.create(View.prototype);
    ScrollView.prototype.constructor = ScrollView;
    View.prototype.setScroll = function(overflow) {
        this.setScrollX(overflow);
        this.setScrollY(overflow);
        return this
    };
    View.prototype.setScrollX = function(overflow) {
        if (overflow) {
            if (typeof overflow !== "string") {
                overflow = "auto"
            }
        } else {
            overflow = "hidden"
        }
        this.__ie.style.overflowX = overflow;
        return this
    };
    View.prototype.setScrollY = function(overflow) {
        if (overflow) {
            if (typeof overflow !== "string") {
                overflow = "auto"
            }
        } else {
            overflow = "hidden"
        }
        this.__ie.style.overflowY = overflow;
        return this
    };
    View.prototype.scrollToBottom = function() {
        this.__ie.scrollTop = this.__ie.scrollHeight;
        return this
    };
    ns.ScrollView = ScrollView
}(tarsier.ui);
! function(ns) {
    var IndexPath = function(section, row) {
        this.row = row;
        this.section = section
    };
    IndexPath.prototype.toString = function() {
        return "(" + this.row + "," + this.section + ")"
    };
    var TableViewDataSource = function() {};
    TableViewDataSource.prototype.numberOfSections = function(tableView) {
        return 1
    };
    TableViewDataSource.prototype.titleForHeaderInSection = function(section, tableView) {
        return null
    };
    TableViewDataSource.prototype.titleForFooterInSection = function(section, tableView) {
        return null
    };
    TableViewDataSource.prototype.numberOfRowsInSection = function(section, tableView) {
        console.assert(false, "implement me!");
        return 0
    };
    TableViewDataSource.prototype.cellForRowAtIndexPath = function(indexPath, tableView) {
        console.assert(false, "implement me!");
        return null
    };
    ns.IndexPath = IndexPath;
    ns.TableViewDataSource = TableViewDataSource
}(tarsier.ui);
! function(ns) {
    var TableViewDelegate = function() {};
    TableViewDelegate.prototype.heightForHeaderInSection = function(section, tableView) {
        return 16
    };
    TableViewDelegate.prototype.heightForFooterInSection = function(section, tableView) {
        return 16
    };
    TableViewDelegate.prototype.viewForHeaderInSection = function(section, tableView) {
        return null
    };
    TableViewDelegate.prototype.viewForFooterInSection = function(section, tableView) {
        return null
    };
    TableViewDelegate.prototype.heightForRowAtIndexPath = function(indexPath, tableView) {
        return 64
    };
    TableViewDelegate.prototype.didSelectRowAtIndexPath = function(indexPath, tableView) {};
    ns.TableViewDelegate = TableViewDelegate
}(tarsier.ui);
! function(ns) {
    var Button = ns.Button;
    var TableViewCell = function(cell) {
        if (!cell) {
            cell = document.createElement("DIV")
        }
        Button.call(this, cell)
    };
    TableViewCell.prototype = Object.create(Button.prototype);
    TableViewCell.prototype.constructor = TableViewCell;
    ns.TableViewCell = TableViewCell
}(tarsier.ui);
! function(ns) {
    var $ = ns.$;
    var View = ns.View;
    var ScrollView = ns.ScrollView;
    var TableViewCell = ns.TableViewCell;
    var IndexPath = ns.IndexPath;
    var TableView = function(table) {
        ScrollView.call(this, table);
        this.setScrollX(false);
        this.setScrollY(true);
        this.dataSource = null;
        this.delegate = null
    };
    TableView.prototype = Object.create(ScrollView.prototype);
    TableView.prototype.constructor = TableView;
    TableView.prototype.reloadData = function() {
        this.removeChildren();
        var count = this.dataSource.numberOfSections(this);
        for (var section = 0; section < count; ++section) {
            show_section.call(this, section)
        }
        return this
    };
    var show_section = function(section) {
        var header = section_header.call(this, section);
        if (header) {
            this.appendChild(header)
        }
        var tableView = this;
        var dataSource = this.dataSource;
        var delegate = this.delegate;
        var indexPath, cell;
        var count = dataSource.numberOfRowsInSection(section, this);
        for (var row = 0; row < count; ++row) {
            indexPath = new IndexPath(section, row);
            cell = dataSource.cellForRowAtIndexPath(indexPath, this);
            if (typeof cell.onClick !== "function") {
                cell.indexPath = indexPath;
                cell.onClick = function(ev) {
                    var target = $(ev.target);
                    while (target) {
                        if (target instanceof TableViewCell) {
                            break
                        }
                        target = target.getParent()
                    }
                    delegate.didSelectRowAtIndexPath(target.indexPath, tableView)
                }
            }
            this.appendChild(cell)
        }
        var footer = section_footer.call(this, section);
        if (footer) {
            this.appendChild(footer)
        }
    };
    var section_header = function(section) {
        var header = this.delegate.viewForHeaderInSection(section, this);
        if (header) {
            return $(header)
        }
        var title = this.delegate.titleForHeaderInSection(section, this);
        if (title) {
            header = new View();
            header.setClassName("TSTableSectionHeader");
            header.setText(title)
        }
        return header
    };
    var section_footer = function(section) {
        var footer = this.delegate.viewForFooterInSection(section, this);
        if (footer) {
            return $(footer)
        }
        var title = this.delegate.titleForFooterInSection(section, this);
        if (title) {
            footer = new View();
            footer.setClassName("TSTableSectionFooter");
            footer.setText(title)
        }
        return footer
    };
    ns.TableView = TableView
}(tarsier.ui);
! function(ns) {
    var Rect = ns.Rect;
    var View = ns.View;
    var Button = ns.Button;
    var Draggable = ns.Draggable;
    var Window = function(frame) {
        View.call(this);
        this.setClassName("TSWindow");
        var vc = this;
        var title = new View();
        title.setClassName("TSWindowTitle");
        this.appendChild(title);
        this.titleView = title;
        var close = new Button();
        close.setClassName("TSWindowClose");
        close.onClick = function(ev) {
            if (vc.onClose(ev)) {
                vc.remove()
            }
        };
        this.appendChild(close);
        if (arguments.length === 4) {
            frame = new Rect(arguments[0], arguments[1], arguments[2], arguments[3])
        } else {
            if (arguments.length === 2) {
                frame = new Rect(arguments[0], arguments[1])
            } else {
                if (!(frame instanceof Rect)) {
                    frame = new Rect(frame)
                }
            }
        }
        this.setFrame(frame);
        Draggable.enable(this, [title]);
        this.__ie.onclick = function(ev) {
            vc.floatToTop()
        }
    };
    Window.prototype = Object.create(View.prototype);
    Window.prototype.constructor = Window;
    Window.prototype.setTitle = function(title) {
        this.titleView.setText(title);
        return this
    };
    Window.prototype.onClose = function(ev) {
        return true
    };
    ns.Window = Window
}(tarsier.ui);
