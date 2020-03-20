/**
 *  Tarsier UI Kits (v0.1.0)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Mar. 20, 2020
 * @copyright (c) 2020 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof tarsier !== "object") {
    tarsier = {}
}
if (typeof tarsier.ui !== "object") {
    tarsier.ui = {}
}! function(ns) {
    var $ = function(div) {
        if (!div) {
            return null
        }
        if (div instanceof ns.View) {
            return div
        }
        if (typeof div === "string") {
            div = select(div)
        }
        if (div.__vc instanceof ns.View) {
            return div.__vc
        } else {
            if (div instanceof HTMLInputElement) {
                return new ns.Input(div)
            } else {
                if (div instanceof HTMLImageElement) {
                    return new ns.Image(div)
                } else {
                    if (div instanceof HTMLButtonElement) {
                        return new ns.Button(div)
                    } else {
                        if (div instanceof HTMLElement) {
                            return new ns.View(div)
                        } else {
                            throw TypeError("element error: " + div)
                        }
                    }
                }
            }
        }
    };
    var select = function(div) {
        if (div.charAt(0) === "#") {
            return document.getElementById(div.substring(1))
        }
        console.error("could not get element: " + div)
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
    var enable = function(div) {
        div.draggable = true;
        div.__dp = null;
        div.ondragstart = function(ev) {
            var x = ev.clientX - div.offsetLeft;
            var y = ev.clientY - div.offsetTop;
            div.__dp = new Point(x, y);
            $(div).floatToTop();
            return true
        };
        div.ondrag = div.ondragover = function(ev) {
            ev.preventDefault();
            var delta = div.__dp;
            if (delta) {
                var x = ev.clientX - delta.x;
                var y = ev.clientY - delta.y;
                $(div).setOrigin(new Point(x, y))
            }
        };
        div.ondragend = function(ev) {
            ev.preventDefault();
            div.__dp = null
        }
    };
    var disable = function(div) {
        div.draggable = false
    };
    ns.Draggable = {
        enable: enable,
        disable: disable
    }
}(tarsier.ui);
! function(ns) {
    var $ = ns.$;
    var Point = ns.Point;
    var Size = ns.Size;
    var Rect = ns.Rect;
    var Edges = ns.Edges;
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
        this.setScroll(false)
    };
    View.prototype = Object.create(Object.prototype);
    View.prototype.constructor = View;
    View.prototype.setId = function(id) {
        this.__ie.id = id
    };
    View.prototype.setClassName = function(clazz) {
        var name = this.__ie.className;
        if (name) {
            this.__ie.className = name + " " + clazz
        } else {
            this.__ie.className = clazz
        }
    };
    View.prototype.getParent = function() {
        return $(this.__ie.parentNode)
    };
    View.prototype.remove = function() {
        var parent = this.getParent();
        if (parent) {
            parent.removeChild(this)
        } else {
            throw Error("parent node empty")
        }
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
        return $(this.__ie.firstChild)
    };
    View.prototype.lastChild = function() {
        return $(this.__ie.lastChild)
    };
    View.prototype.appendChild = function(child) {
        child = $(child);
        this.__ie.appendChild(child.__ie)
    };
    View.prototype.insertBefore = function(node, child) {
        node = $(node);
        child = $(child);
        this.__ie.insertBefore(node.__ie, child.__ie)
    };
    View.prototype.removeChild = function(child) {
        child = $(child);
        var div = child.__ie;
        delete div.__vc;
        this.__ie.removeChild(div)
    };
    View.prototype.replaceChild = function(newChild, oldChild) {
        newChild = $(newChild);
        oldChild = $(oldChild);
        this.__ie.replaceChild(newChild.__ie, oldChild.__ie)
    };
    View.prototype.contains = function(child) {
        child = $(child);
        return this.__ie.contains(child.__ie)
    };
    var parse_int = function(value) {
        var i = parseInt(value);
        if (typeof i === "number") {
            return i
        } else {
            return 0
        }
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
            return
        }
        this.setOrigin(frame.origin);
        this.setSize(frame.size)
    };
    View.prototype.getOrigin = function() {
        if (this.__frame.origin.equals(Point.Zero)) {
            var x = parse_int(this.__ie.style.left);
            var y = parse_int(this.__ie.style.top);
            this.__frame.origin = new Point(x, y)
        }
        return this.__frame.origin
    };
    View.prototype.setOrigin = function(point) {
        if (arguments.length === 2) {
            point = new Point(arguments[0], arguments[1])
        }
        if (this.__frame.origin.equals(point)) {
            return
        }
        this.__ie.style.position = "absolute";
        this.__ie.style.left = point.x + "px";
        this.__ie.style.top = point.y + "px";
        this.__frame.origin = point
    };
    View.prototype.getSize = function() {
        if (this.__frame.size.equals(Size.Zero)) {
            var width = parse_int(this.__ie.style.width);
            var height = parse_int(this.__ie.style.height);
            this.__frame.size = new Size(width, height)
        }
        return this.__frame.size
    };
    View.prototype.setSize = function(size) {
        if (arguments.length === 2) {
            size = new Size(arguments[0], arguments[1])
        }
        if (this.__frame.size.equals(size)) {
            return
        }
        this.__ie.style.width = size.width + "px";
        this.__ie.style.height = size.height + "px";
        var edges = this.getPadding();
        this.__frame.size = size;
        var x = edges.left;
        var y = edges.top;
        var width = size.width - edges.left - edges.right;
        var height = size.height - edges.top - edges.bottom;
        var bounds = new Rect(new Point(x, y), new Size(width, height));
        this.setBounds(bounds)
    };
    View.prototype.getBounds = function() {
        if (this.__bounds.equals(Rect.Zero)) {}
        return this.__bounds
    };
    View.prototype.setBounds = function(bounds) {
        if (this.__bounds.equals(bounds)) {
            return
        }
        var frame = this.__frame;
        var left = bounds.origin.x;
        var top = bounds.origin.y;
        var right = frame.size.width - left - bounds.size.width;
        var bottom = frame.size.height - top - bounds.size.height;
        this.setPadding(top + "px " + right + "px " + bottom + "px " + left + "px");
        var needsLayoutSubviews = !this.__bounds.size.equals(bounds.size);
        this.__bounds = bounds;
        if (needsLayoutSubviews) {
            this.layoutSubviews()
        }
    };
    View.prototype.layoutSubviews = function() {};
    View.prototype.setMargin = function(margin) {
        if (typeof margin === "number") {
            margin = margin + "px"
        }
        this.__ie.style.margin = margin
    };
    View.prototype.setBorder = function(border) {
        if (typeof border === "number") {
            border = border + "px"
        }
        this.__ie.style.border = border
    };
    View.prototype.getPadding = function() {
        var padding = this.__ie.style.padding;
        var left, top, right, bottom;
        if (padding && padding.length > 0) {
            var values = padding.split(" ");
            if (values.length === 1) {
                left = top = right = bottom = parse_int(values[0])
            } else {
                if (values.length === 2) {
                    top = bottom = parse_int(values[0]);
                    left = right = parse_int(values[1])
                } else {
                    if (values.length === 3) {
                        top = parse_int(values[0]);
                        left = right = parse_int(values[1]);
                        bottom = parse_int(values[2])
                    } else {
                        if (values.length === 4) {
                            top = parse_int(values[0]);
                            right = parse_int(values[1]);
                            bottom = parse_int(values[2]);
                            left = right = parse_int(values[3])
                        } else {
                            throw Error("padding error: " + padding)
                        }
                    }
                }
            }
        } else {
            var frame = this.__frame;
            var bounds = this.__bounds;
            if (bounds.equals(Rect.Zero) || frame.equals(Rect.Zero)) {
                left = top = right = bottom = 0
            } else {
                left = bounds.origin.x;
                top = bounds.origin.y;
                right = frame.size.width - left - bounds.size.width;
                bottom = frame.size.height - top - bounds.size.height
            }
        }
        return new Edges(left, top, right, bottom)
    };
    View.prototype.setPadding = function(padding) {
        if (padding instanceof Edges) {
            var left = padding.left;
            var top = padding.top;
            var right = padding.right;
            var bottom = padding.bottom;
            padding = top + "px " + right + "px " + bottom + "px " + left + "px"
        } else {
            if (typeof padding === "number") {
                padding = padding + "px"
            }
        }
        this.__ie.style.padding = padding
    };
    View.prototype.getZ = function() {
        var zIndex = this.__ie.style.zIndex;
        if (zIndex) {
            return parseInt(zIndex)
        } else {
            return 0
        }
    };
    View.prototype.setZ = function(zIndex) {
        this.__ie.style.zIndex = zIndex
    };
    View.prototype.floatToTop = function() {
        var parent = this.getParent();
        var brothers = parent.getChildren();
        var pos = brothers.indexOf(this);
        var zIndex = 0,
            z;
        var i = 0,
            total = brothers.length;
        for (; i < pos; ++i) {
            z = brothers[i].getZ();
            if (zIndex < z) {
                zIndex = z
            }
        }
        for (++i; i < total; ++i) {
            z = brothers[i].getZ();
            if (zIndex <= z) {
                zIndex = z + 1
            }
        }
        this.setZ(zIndex)
    };
    View.prototype.setBackgroundColor = function(color) {
        if (color instanceof Color) {
            color = color.toString()
        }
        this.__ie.style.backgroundColor = color
    };
    ns.View = View
}(tarsier.ui);
! function(ns) {
    var View = ns.View;
    var ScrollView = function(span) {
        View.call(this, span)
    };
    ScrollView.prototype = Object.create(View.prototype);
    ScrollView.prototype.constructor = ScrollView;
    View.prototype.setScroll = function(overflow) {
        this.setScrollX(overflow);
        this.setScrollY(overflow)
    };
    View.prototype.setScrollX = function(overflow) {
        if (overflow) {
            if (typeof overflow !== "string") {
                overflow = "auto"
            }
        } else {
            overflow = "none"
        }
        this.__ie.style.overflowX = overflow
    };
    View.prototype.setScrollY = function(overflow) {
        if (overflow) {
            if (typeof overflow !== "string") {
                overflow = "auto"
            }
        } else {
            overflow = "none"
        }
        this.__ie.style.overflowY = overflow
    };
    ns.ScrollView = ScrollView
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
    View.prototype.setText = function(text) {
        this.__ie.innerText = text
    };
    View.prototype.setColor = function(color) {
        if (color instanceof Color) {
            color = color.toString()
        }
        this.__ie.style.color = color
    };
    View.prototype.setFontSize = function(size) {
        if (typeof size === "number") {
            size = size + "pt"
        }
        this.__ie.style.fontSize = size
    };
    ns.Label = Label
}(tarsier.ui);
! function(ns) {
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
        this.__ie.value = text
    };
    ns.Input = Input
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
        this.__ie.value = text
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
        this.__ie.src = src
    };
    ns.Image = Image
}(tarsier.ui);
! function(ns) {
    var View = ns.View;
    var Image = ns.Image;
    var Button = function(btn) {
        if (!btn) {
            btn = document.createElement("BUTTON")
        }
        View.call(this, btn);
        var vc = this;
        var ie = this.__ie;
        ie.onclick = function(ev) {
            vc.onClick(ev);
            ev.cancelBubble = true;
            ev.stopPropagation();
            ev.preventDefault();
            return false
        };
        this.__image = null
    };
    Button.prototype = Object.create(View.prototype);
    Button.prototype.constructor = Button;
    Button.prototype.setImage = function(image) {
        if (this.__image) {
            this.removeChild(this.__image)
        }
        if (image instanceof Image) {
            this.__image = image
        } else {
            this.__image = new Image(image)
        }
        this.appendChild(this.__image)
    };
    Button.prototype.onClick = function(ev) {};
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
        this.__ie.href = url
    };
    ns.Link = Link
}(tarsier.ui);
! function(ns) {
    var Rect = ns.Rect;
    var View = ns.View;
    var Button = ns.Button;
    var Draggable = ns.Draggable;
    var Window = function(frame) {
        View.call(this);
        this.setClassName("ts_window");
        var ctrl = this;
        var element = this.__ie;
        Draggable.enable(element);
        element.onclick = function(ev) {
            ctrl.floatToTop()
        };
        var title = new View();
        title.setClassName("ts_window_title");
        this.appendChild(title);
        this.titleView = title;
        var close = new Button();
        close.setClassName("ts_window_close");
        close.onClick = function(ev) {
            if (ctrl.onClose(ev)) {
                element.remove()
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
        this.setFrame(frame)
    };
    Window.prototype = Object.create(View.prototype);
    Window.prototype.constructor = Window;
    Window.prototype.setTitle = function(title) {
        this.titleView.setText(title)
    };
    Window.prototype.onClose = function(ev) {
        return true
    };
    ns.Window = Window
}(tarsier.ui);
