/**
 *  DIM-SDK (v0.1.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      June. 6, 2021
 * @copyright (c) 2021 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof MONKEY !== "object") {
    MONKEY = {}
}
(function(ns) {
    var namespacefy = function(space) {
        space.__all__ = [];
        space.registers = namespace.prototype.registers;
        space.exports = namespace.prototype.exports;
        return space
    };
    var is_space = function(space) {
        if (space instanceof namespace) {
            return true
        }
        if (typeof space.exports !== "function") {
            return false
        }
        if (typeof space.registers !== "function") {
            return false
        }
        return space.__all__ instanceof Array
    };
    var namespace = function() {
        this.__all__ = []
    };
    namespace.prototype.registers = function(name) {
        if (this.__all__.indexOf(name) < 0) {
            this.__all__.push(name)
        }
    };
    namespace.prototype.exports = function(to) {
        var names = this.__all__;
        var name;
        for (var i = 0; i < names.length; ++i) {
            name = names[i];
            export_one(this, to, name);
            to.registers(name)
        }
        return to
    };
    var export_one = function(from, to, name) {
        var source = from[name];
        var target = to[name];
        if (source === target) {} else {
            if (typeof target === "undefined") {
                to[name] = source
            } else {
                if (is_space(source)) {
                    if (!is_space(target)) {
                        namespacefy(target)
                    }
                    source.exports(target)
                } else {
                    export_all(source, target)
                }
            }
        }
    };
    var export_all = function(from, to) {
        var names = Object.getOwnPropertyNames(from);
        for (var i = 0; i < names.length; ++i) {
            export_one(from, to, names[i])
        }
    };
    ns.Namespace = namespace;
    namespacefy(ns);
    ns.registers("Namespace")
})(MONKEY);
(function(ns) {
    if (typeof ns.type !== "object") {
        ns.type = new ns.Namespace()
    }
    if (typeof ns.threading !== "object") {
        ns.threading = new ns.Namespace()
    }
    if (typeof ns.format !== "object") {
        ns.format = new ns.Namespace()
    }
    if (typeof ns.digest !== "object") {
        ns.digest = new ns.Namespace()
    }
    if (typeof ns.crypto !== "object") {
        ns.crypto = new ns.Namespace()
    }
    ns.registers("type");
    ns.registers("threading");
    ns.registers("format");
    ns.registers("digest");
    ns.registers("crypto")
})(MONKEY);
(function(ns) {
    var conforms = function(object, protocol) {
        if (!object) {
            return false
        }
        if (object instanceof protocol) {
            return true
        }
        var child = Object.getPrototypeOf(object);
        var names = Object.getOwnPropertyNames(protocol.prototype);
        for (var i = 0; i < names.length; ++i) {
            if (!child.hasOwnProperty(names[i])) {
                return false
            }
        }
        return true
    };
    var inherits = function(child, parent) {
        var prototype = parent.prototype;
        var names = Object.getOwnPropertyNames(prototype);
        var key;
        for (var i = 0; i < names.length; ++i) {
            key = names[i];
            if (child.prototype.hasOwnProperty(key)) {
                continue
            }
            var fn = prototype[key];
            if (typeof fn !== "function") {
                continue
            }
            child.prototype[key] = fn
        }
        return child
    };
    var inherits_interfaces = function(child, interfaces) {
        for (var i = 0; i < interfaces.length; ++i) {
            child = inherits(child, interfaces[i])
        }
        return child
    };
    var interfacefy = function(child, parents) {
        if (!child) {
            child = function() {}
        }
        if (parents) {
            var ancestors;
            if (parents instanceof Array) {
                ancestors = parents
            } else {
                ancestors = [];
                for (var i = 1; i < arguments.length; ++i) {
                    ancestors.push(arguments[i])
                }
            }
            child = inherits_interfaces(child, ancestors)
        }
        return child
    };
    interfacefy.conforms = conforms;
    var classify = function(child, parent, interfaces) {
        if (!child) {
            child = function() {}
        }
        if (!parent) {
            parent = Object
        }
        child.prototype = Object.create(parent.prototype);
        inherits(child, parent);
        if (interfaces) {
            var ancestors;
            if (interfaces instanceof Array) {
                ancestors = interfaces
            } else {
                ancestors = [];
                for (var i = 2; i < arguments.length; ++i) {
                    ancestors.push(arguments[i])
                }
            }
            child = inherits_interfaces(child, ancestors)
        }
        child.prototype.constructor = child;
        return child
    };
    ns.Interface = interfacefy;
    ns.Class = classify;
    ns.registers("Interface");
    ns.registers("Class")
})(MONKEY);
(function(ns) {
    var is_null = function(object) {
        if (typeof object === "undefined") {
            return true
        } else {
            return object === null
        }
    };
    var is_base_type = function(object) {
        var t = typeof object;
        if (t === "string" || t === "number" || t === "boolean" || t === "function") {
            return true
        }
        if (object instanceof String) {
            return true
        }
        if (object instanceof Number) {
            return true
        }
        if (object instanceof Boolean) {
            return true
        }
        if (object instanceof Date) {
            return true
        }
        if (object instanceof RegExp) {
            return true
        }
        return object instanceof Error
    };
    var obj = function() {
        Object.call(this)
    };
    ns.Class(obj, Object, null);
    obj.isNull = is_null;
    obj.isBaseType = is_base_type;
    obj.prototype.equals = function(other) {
        return this === other
    };
    ns.type.Object = obj;
    ns.type.registers("Object")
})(MONKEY);
(function(ns) {
    var is_array = function(obj) {
        if (obj instanceof Array) {
            return true
        } else {
            if (obj instanceof Uint8Array) {
                return true
            } else {
                if (obj instanceof Int8Array) {
                    return true
                } else {
                    if (obj instanceof Uint8ClampedArray) {
                        return true
                    } else {
                        if (obj instanceof Uint16Array) {
                            return true
                        } else {
                            if (obj instanceof Int16Array) {
                                return true
                            } else {
                                if (obj instanceof Uint32Array) {
                                    return true
                                } else {
                                    if (obj instanceof Int32Array) {
                                        return true
                                    } else {
                                        if (obj instanceof Float32Array) {
                                            return true
                                        } else {
                                            if (obj instanceof Float64Array) {
                                                return true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return false
    };
    var arrays_equal = function(array1, array2) {
        if (array1.length !== array2.length) {
            return false
        }
        for (var i = 0; i < array1.length; ++i) {
            if (!objects_equal(array1[i], array2[i])) {
                return false
            }
        }
        return true
    };
    var maps_equal = function(dict1, dict2) {
        var keys1 = Object.keys(dict1);
        var keys2 = Object.keys(dict2);
        var len1 = keys1.length;
        var len2 = keys2.length;
        if (len1 !== len2) {
            return false
        }
        var k;
        for (var i = 0; i < len1; ++i) {
            k = keys1[i];
            if (!objects_equal(dict1[k], dict2[k])) {
                return false
            }
        }
        return true
    };
    var objects_equal = function(obj1, obj2) {
        if (obj1 === obj2) {
            return true
        } else {
            if (!obj1) {
                return !obj2
            } else {
                if (!obj2) {
                    return false
                } else {
                    if (typeof obj1 === "string" || typeof obj2 === "string") {
                        return false
                    } else {
                        if (typeof obj1["equals"] === "function") {
                            return obj1.equals(obj2)
                        } else {
                            if (typeof obj2["equals"] === "function") {
                                return obj2.equals(obj1)
                            }
                        }
                    }
                }
            }
        }
        if (is_array(obj1)) {
            if (is_array(obj2)) {
                return arrays_equal(obj1, obj2)
            } else {
                return false
            }
        } else {
            if (is_array(obj2)) {
                return false
            }
        }
        return maps_equal(obj1, obj2)
    };
    var copy_items = function(src, srcPos, dest, destPos, length) {
        if (srcPos !== 0 || length !== src.length) {
            src = src.subarray(srcPos, srcPos + length)
        }
        dest.set(src, destPos)
    };
    var insert_item = function(array, index, item) {
        if (index < 0) {
            index += array.length + 1;
            if (index < 0) {
                return false
            }
        }
        if (index === 0) {
            array.unshift(item)
        } else {
            if (index === array.length) {
                array.push(item)
            } else {
                if (index > array.length) {
                    array[index] = item
                } else {
                    array.splice(index, 0, item)
                }
            }
        }
        return true
    };
    var update_item = function(array, index, item) {
        if (index < 0) {
            index += array.length;
            if (index < 0) {
                return false
            }
        }
        array[index] = item;
        return true
    };
    var remove_item = function(array, item) {
        var index = array.indexOf(item);
        if (index < 0) {
            return false
        } else {
            if (index === 0) {
                array.shift()
            } else {
                if ((index + 1) === array.length) {
                    array.pop()
                } else {
                    array.splice(index, 1)
                }
            }
        }
        return true
    };
    ns.type.Arrays = {
        insert: insert_item,
        update: update_item,
        remove: remove_item,
        equals: objects_equal,
        isArray: is_array,
        copy: copy_items
    };
    ns.type.registers("Arrays")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var get_alias = function(value) {
        var enumeration = this.constructor;
        var e;
        for (var k in enumeration) {
            if (!enumeration.hasOwnProperty(k)) {
                continue
            }
            e = enumeration[k];
            if (e instanceof enumeration) {
                if (e.equals(value)) {
                    return e.__alias
                }
            }
        }
        return null
    };
    var base_enum = function(value, alias) {
        obj.call(this);
        if (!alias) {
            if (value instanceof base_enum) {
                alias = value.__alias
            } else {
                alias = get_alias.call(this, value)
            }
        }
        if (value instanceof base_enum) {
            value = value.__value
        }
        this.__value = value;
        this.__alias = alias
    };
    ns.Class(base_enum, obj, null);
    base_enum.prototype.equals = function(other) {
        if (!other) {
            return !this.__value
        } else {
            if (other instanceof base_enum) {
                return this.__value === other.valueOf()
            } else {
                return this.__value === other
            }
        }
    };
    base_enum.prototype.valueOf = function() {
        return this.__value
    };
    base_enum.prototype.toString = function() {
        return "<" + this.__alias.toString() + ": " + this.__value.toString() + ">"
    };
    var enumify = function(enumeration, elements) {
        if (!enumeration) {
            enumeration = function(value, alias) {
                base_enum.call(this, value, alias)
            }
        }
        ns.Class(enumeration, base_enum, null);
        var e, v;
        for (var name in elements) {
            if (!elements.hasOwnProperty(name)) {
                continue
            }
            v = elements[name];
            if (v instanceof base_enum) {
                v = v.__value
            } else {
                if (typeof v !== "number") {
                    throw new TypeError("Enum value must be a number!")
                }
            }
            e = new enumeration(v, name);
            enumeration[name] = e
        }
        return enumeration
    };
    ns.type.Enum = enumify;
    ns.type.registers("Enum")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Arrays = ns.type.Arrays;
    var bytes = function() {
        obj.call(this);
        this._buffer = null;
        this._offset = 0;
        this._length = 0;
        if (arguments.length === 0) {
            this._buffer = new Uint8Array(4)
        } else {
            if (arguments.length === 1) {
                var arg = arguments[0];
                if (typeof arg === "number") {
                    this._buffer = new Uint8Array(arg)
                } else {
                    if (arg instanceof bytes) {
                        this._buffer = arg._buffer;
                        this._offset = arg._offset;
                        this._length = arg._length
                    } else {
                        if (arg instanceof Uint8Array) {
                            this._buffer = arg
                        } else {
                            this._buffer = new Uint8Array(arg)
                        }
                        this._length = arg.length
                    }
                }
            } else {
                if (arguments.length === 3) {
                    this._buffer = arguments[0];
                    this._offset = arguments[1];
                    this._length = arguments[2]
                } else {
                    throw new SyntaxError("arguments error: " + arguments)
                }
            }
        }
    };
    ns.Class(bytes, obj, null);
    bytes.ZERO = new bytes(new Uint8Array(0), 0, 0);
    bytes.prototype.getBuffer = function() {
        return this._buffer
    };
    bytes.prototype.getOffset = function() {
        return this._offset
    };
    bytes.prototype.equals = function(other) {
        if (!other) {
            return this._length === 0
        } else {
            if (this === other) {
                return true
            }
        }
        var otherBuffer, otherOffset, otherLength;
        if (other instanceof bytes) {
            otherBuffer = other._buffer;
            otherOffset = other._offset;
            otherLength = other._length
        } else {
            otherBuffer = other;
            otherOffset = 0;
            otherLength = other.length
        }
        if (this._length !== otherLength) {
            return false
        } else {
            if (this._buffer === otherBuffer && this._offset === otherOffset) {
                return true
            }
        }
        var buffer = this._buffer;
        var pos1 = this._offset + this._length - 1;
        var pos2 = otherOffset + otherLength - 1;
        for (; pos2 >= otherOffset; --pos1, --pos2) {
            if (buffer[pos1] !== otherBuffer[pos2]) {
                return false
            }
        }
        return true
    };
    var adjust = function(pos, len) {
        if (pos < 0) {
            pos += len;
            if (pos < 0) {
                return 0
            }
        } else {
            if (pos > len) {
                return len
            }
        }
        return pos
    };
    bytes.adjust = adjust;
    var find_value = function(value, start, end) {
        start += this._offset;
        end += this._offset;
        for (; start < end; ++start) {
            if (this._buffer[start] === value) {
                return start - this._offset
            }
        }
        return -1
    };
    var find_sub = function(sub, start, end) {
        if ((end - start) < sub._length) {
            return -1
        }
        start += this._offset;
        end += this._offset - sub._length + 1;
        if (this._buffer === sub._buffer) {
            if (start === sub._offset) {
                return start - this._offset
            }
        }
        var index;
        for (; start < end; ++start) {
            for (index = 0; index < sub._length; ++index) {
                if (this._buffer[start + index] !== sub._buffer[sub._offset + index]) {
                    break
                }
            }
            if (index === sub._length) {
                return start - this._offset
            }
        }
        return -1
    };
    bytes.prototype.find = function() {
        var sub, start, end;
        if (arguments.length === 1) {
            sub = arguments[0];
            start = 0;
            end = this._length
        } else {
            if (arguments.length === 2) {
                sub = arguments[0];
                start = arguments[1];
                end = this._length;
                start = adjust(start, this._length)
            } else {
                if (arguments.length === 3) {
                    sub = arguments[0];
                    start = arguments[1];
                    end = arguments[2];
                    start = adjust(start, this._length);
                    end = adjust(end, this._length)
                } else {
                    throw new SyntaxError("arguments error: " + arguments)
                }
            }
        }
        if (typeof sub === "number") {
            return find_value.call(this, sub & 255, start, end)
        } else {
            if (sub instanceof bytes) {
                return find_sub.call(this, sub, start, end)
            } else {
                return find_sub.call(this, new bytes(sub), start, end)
            }
        }
    };
    bytes.prototype.getByte = function(index) {
        if (index < 0) {
            index += this._length;
            if (index < 0) {
                throw new RangeError("error index: " + (index - this._length) + ", length: " + this._length)
            }
        } else {
            if (index >= this._length) {
                throw new RangeError("error index: " + index + ", length: " + this._length)
            }
        }
        return this._buffer[this._offset + index]
    };
    var get_bytes = function(start, end) {
        start += this._offset;
        end += this._offset;
        if (start === 0 && end === this._buffer.length) {
            return this._buffer
        } else {
            if (start < end) {
                return this._buffer.subarray(start, end)
            } else {
                return this.ZERO.getBytes()
            }
        }
    };
    bytes.prototype.getBytes = function() {
        var start, end;
        if (arguments.length === 0) {
            start = 0;
            end = this._length
        } else {
            if (arguments.length === 1) {
                start = arguments[0];
                end = this._length;
                start = adjust(start, this._length)
            } else {
                if (arguments.length === 2) {
                    start = arguments[0];
                    end = arguments[1];
                    start = adjust(start, this._length);
                    end = adjust(end, this._length)
                } else {
                    throw new SyntaxError("arguments error: " + arguments)
                }
            }
        }
        return get_bytes.call(this, start, end)
    };
    bytes.prototype.slice = function(start) {
        var end;
        if (arguments.length === 2) {
            end = arguments[1];
            end = adjust(end, this._length)
        } else {
            end = this._length
        }
        start = adjust(start, this._length);
        return slice(this, start, end)
    };
    var slice = function(data, start, end) {
        if (start === 0 && end === data._length) {
            return data
        } else {
            if (start < end) {
                return new bytes(data._buffer, data._offset + start, end - start)
            } else {
                return bytes.ZERO
            }
        }
    };
    bytes.prototype.concat = function() {
        var result = this;
        var arg, other;
        for (var i = 0; i < arguments.length; ++i) {
            arg = arguments[i];
            if (arg instanceof bytes) {
                other = arg
            } else {
                other = new bytes(arg)
            }
            result = concat(result, other)
        }
        return result
    };
    var concat = function(left, right) {
        if (left._length === 0) {
            return right
        } else {
            if (right._length === 0) {
                return left
            } else {
                if (left._buffer === right._buffer && (left._offset + left._length) === right._offset) {
                    return new bytes(left._buffer, left._offset, left._length + right._length)
                } else {
                    var joined = new Uint8Array(left._length + right._length);
                    Arrays.copy(left._buffer, left._offset, joined, 0, left._length);
                    Arrays.copy(right._buffer, right._offset, joined, left._length, right._length);
                    return new bytes(joined, 0, joined.length)
                }
            }
        }
    };
    bytes.prototype.copy = function() {
        return new bytes(this._buffer, this._offset, this._length)
    };
    bytes.prototype.mutableCopy = function() {
        var buffer = this.getBytes();
        buffer = new Uint8Array(buffer);
        return new bytes(buffer, 0, buffer.length)
    };
    bytes.prototype.toArray = function() {
        var array = this.getBytes();
        if (typeof Array.from === "function") {
            return Array.from(array)
        } else {
            return [].slice.call(array)
        }
    };
    ns.type.Data = bytes;
    ns.type.registers("Data")
})(MONKEY);
(function(ns) {
    var Arrays = ns.type.Arrays;
    var bytes = ns.type.Data;
    var adjust = bytes.adjust;
    var resize = function(size) {
        var bigger = new Uint8Array(size);
        Arrays.copy(this._buffer, this._offset, bigger, 0, this._length);
        this._buffer = bigger;
        this._offset = 0
    };
    var expand = function() {
        var capacity = this._buffer.length - this._offset;
        if (capacity > 4) {
            resize.call(this, capacity << 1)
        } else {
            resize.call(this, 8)
        }
    };
    bytes.prototype.setByte = function(index, value) {
        if (index < 0) {
            index += this._length;
            if (index < 0) {
                return false
            }
        }
        if (index >= this._length) {
            if (this._offset + index >= this._buffer.length) {
                if (index < this._buffer.length) {
                    Arrays.copy(this._buffer, this._offset, this._buffer, 0, this._length);
                    this._offset = 0
                } else {
                    resize.call(this, index + 1)
                }
            }
            this._length = index + 1
        }
        this._buffer[this._offset + index] = value & 255;
        return true
    };
    var copy_buffer = function(data, pos, source, start, end) {
        var copyLen = end - start;
        if (copyLen > 0) {
            var copyEnd = pos + copyLen;
            if (source !== data._buffer || (data._offset + pos) !== start) {
                if (data._offset + copyEnd > data._buffer.length) {
                    resize.call(data, copyEnd)
                }
                Arrays.copy(source, start, data._buffer, data._offset + pos, copyLen)
            }
            if (copyEnd > data._length) {
                data._length = copyEnd
            }
        }
    };
    bytes.prototype.fill = function(pos, source) {
        if (pos < 0) {
            pos += this._length;
            if (pos < 0) {
                throw new RangeError("error position: " + (pos - this._length) + ", length: " + this._length)
            }
        }
        var start, end;
        if (arguments.length === 4) {
            start = arguments[2];
            end = arguments[3];
            start = adjust(start, get_length(source));
            end = adjust(end, get_length(source))
        } else {
            if (arguments.length === 3) {
                start = arguments[2];
                end = get_length(source);
                start = adjust(start, get_length(source))
            } else {
                start = 0;
                end = get_length(source)
            }
        }
        if (source instanceof bytes) {
            copy_buffer(this, pos, source._buffer, source._offset + start, source._offset + end)
        } else {
            copy_buffer(this, pos, source, start, end)
        }
    };
    var get_length = function(source) {
        if (source instanceof bytes) {
            return source._length
        } else {
            return source.length
        }
    };
    bytes.prototype.append = function(source) {
        if (arguments.length > 1 && typeof arguments[1] !== "number") {
            for (var i = 0; i < arguments.length; ++i) {
                this.append(arguments[i])
            }
            return
        }
        var start, end;
        if (arguments.length === 3) {
            start = arguments[1];
            end = arguments[2];
            start = adjust(start, get_length(source));
            end = adjust(end, get_length(source))
        } else {
            if (arguments.length === 2) {
                start = arguments[1];
                end = get_length(source);
                start = adjust(start, get_length(source))
            } else {
                start = 0;
                end = get_length(source)
            }
        }
        if (source instanceof bytes) {
            copy_buffer(this, this._length, source._buffer, source._offset + start, source._offset + end)
        } else {
            copy_buffer(this, this._length, source, start, end)
        }
    };
    bytes.prototype.insert = function(index, value) {
        if (index < 0) {
            index += this._length;
            if (index < 0) {
                return false
            }
        }
        if (index >= this._length) {
            return this.setByte(index, value)
        }
        if (index === 0) {
            if (this._offset > 0) {
                this._offset -= 1
            } else {
                if (this._length === this._buffer.length) {
                    expand.call(this)
                }
                Arrays.copy(this._buffer, 0, this._buffer, 1, this._length)
            }
        } else {
            if (index < (this._length >> 1)) {
                if (this._offset > 0) {
                    Arrays.copy(this._buffer, this._offset, this._buffer, this._offset - 1, index);
                    this._offset -= 1
                } else {
                    if ((this._offset + this._length) === this._buffer.length) {
                        expand.call(this)
                    }
                    Arrays.copy(this._buffer, this._offset + index, this._buffer, this._offset + index + 1, this._length - index)
                }
            } else {
                if ((this._offset + this._length) < this._buffer.length) {
                    Arrays.copy(this._buffer, this._offset + index, this._buffer, this._offset + index + 1, this._length - index)
                } else {
                    if (this._offset > 0) {
                        Arrays.copy(this._buffer, this._offset, this._buffer, this._offset - 1, index);
                        this._offset -= 1
                    } else {
                        expand.call(this);
                        Arrays.copy(this._buffer, this._offset + index, this._buffer, this._offset + index + 1, this._length - index)
                    }
                }
            }
        }
        this._buffer[this._offset + index] = value & 255;
        this._length += 1;
        return true
    };
    bytes.prototype.remove = function(index) {
        if (index < 0) {
            index += this._length;
            if (index < 0) {
                throw new RangeError("error index: " + (index - this._length) + ", length: " + this._length)
            }
        } else {
            if (index >= this._length) {
                throw new RangeError("index error: " + index + ", length: " + this._length)
            }
        }
        if (index === 0) {
            return this.shift()
        } else {
            if (index === (this._length - 1)) {
                return this.pop()
            }
        }
        var erased = this._buffer[this._offset + index];
        if (index < (this._length >> 1)) {
            Arrays.copy(this._buffer, this._offset, this._buffer, this._offset + 1, index)
        } else {
            Arrays.copy(this._buffer, this._offset + index + 1, this._buffer, this._offset + index, this._length - index - 1)
        }
        return erased
    };
    bytes.prototype.shift = function() {
        if (this._length < 1) {
            throw new RangeError("data empty!")
        }
        var erased = this._buffer[this._offset];
        this._offset += 1;
        this._length -= 1;
        return erased
    };
    bytes.prototype.pop = function() {
        if (this._length < 1) {
            throw new RangeError("data empty!")
        }
        this._length -= 1;
        return this._buffer[this._offset + this._length]
    };
    bytes.prototype.push = function(element) {
        this.setByte(this._length, element)
    };
    ns.type.MutableData = bytes;
    ns.type.registers("MutableData")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var str = function(value) {
        obj.call(this);
        if (!value) {
            value = ""
        } else {
            if (value instanceof str) {
                value = value.toString()
            }
        }
        this.__string = value
    };
    ns.Class(str, obj, null);
    str.prototype.equals = function(other) {
        if (!other) {
            return !this.__string
        } else {
            if (other instanceof str) {
                return this.__string === other.__string
            } else {
                return this.__string === other
            }
        }
    };
    var equalsIgnoreCase = function(str1, str2) {
        if (str1.length !== str2.length) {
            return false
        }
        var low1 = str1.toLowerCase();
        var low2 = str2.toLowerCase();
        return low1 === low2
    };
    str.prototype.equalsIgnoreCase = function(other) {
        if (!other) {
            return !this.__string
        } else {
            if (other instanceof str) {
                return equalsIgnoreCase(this.__string, other.__string)
            } else {
                return equalsIgnoreCase(this.__string, other)
            }
        }
    };
    str.prototype.valueOf = function() {
        return this.__string
    };
    str.prototype.toString = function() {
        return this.__string
    };
    str.prototype.getLength = function() {
        return this.__string.length
    };
    ns.type.String = str;
    ns.type.registers("String")
})(MONKEY);
(function(ns) {
    var map = function() {};
    ns.Interface(map, null);
    map.prototype.getMap = function() {
        console.assert(false, "implement me!");
        return null
    };
    map.prototype.copyMap = function() {
        console.assert(false, "implement me!");
        return null
    };
    map.copyMap = function(dictionary) {
        if (ns.Interface.conforms(dictionary, map)) {
            dictionary = dictionary.getMap()
        }
        var json = ns.format.JSON.encode(dictionary);
        return ns.format.JSON.decode(json)
    };
    map.prototype.equals = function(other) {
        console.assert(false, "implement me!");
        return false
    };
    map.prototype.allKeys = function() {
        console.assert(false, "implement me!");
        return null
    };
    map.prototype.getValue = function(key) {
        console.assert(false, "implement me!");
        return null
    };
    map.prototype.setValue = function(key, value) {
        console.assert(false, "implement me!")
    };
    ns.type.Map = map;
    ns.type.registers("Map")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var map = ns.type.Map;
    var Arrays = ns.type.Arrays;
    var dict = function(dictionary) {
        obj.call(this);
        if (!dictionary) {
            dictionary = {}
        } else {
            if (ns.Interface.conforms(dictionary, map)) {
                dictionary = dictionary.getMap()
            }
        }
        this.__dictionary = dictionary
    };
    ns.Class(dict, obj, [map]);
    dict.prototype.getMap = function() {
        return this.__dictionary
    };
    dict.prototype.copyMap = function() {
        return map.copyMap(this.__dictionary)
    };
    dict.prototype.valueOf = function() {
        return this.__dictionary
    };
    dict.prototype.equals = function(other) {
        if (!other) {
            return !this.__dictionary
        } else {
            if (ns.Interface.conforms(other, map)) {
                return Arrays.equals(this.__dictionary, other.getMap())
            } else {
                return Arrays.equals(this.__dictionary, other)
            }
        }
    };
    dict.prototype.allKeys = function() {
        return Object.keys(this.__dictionary)
    };
    dict.prototype.getValue = function(key) {
        return this.__dictionary[key]
    };
    dict.prototype.setValue = function(key, value) {
        if (value) {
            this.__dictionary[key] = value
        } else {
            if (this.__dictionary.hasOwnProperty(key)) {
                delete this.__dictionary[key]
            }
        }
    };
    ns.type.Dictionary = dict;
    ns.type.registers("Dictionary")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var str = ns.type.String;
    var map = ns.type.Map;
    var Enum = ns.type.Enum;
    var Data = ns.type.Data;
    var Arrays = ns.type.Arrays;
    var map_unwrap = function(dict) {
        var result = {};
        var keys = Object.keys(dict);
        var key;
        for (var i = 0; i < keys.length; ++i) {
            key = keys[i];
            if (key instanceof str) {
                key = key.toString()
            }
            result[key] = unwrap(dict[key], true)
        }
        return result
    };
    var list_unwrap = function(array) {
        var result = [];
        var item;
        for (var i = 0; i < array.length; ++i) {
            item = array[i];
            if (item) {
                item = unwrap(item, true);
                if (item) {
                    result[i] = item
                }
            }
        }
        return result
    };
    var unwrap = function(object, circularly) {
        if (obj.isNull(object)) {
            return null
        } else {
            if (obj.isBaseType(object)) {
                return object
            }
        }
        if (object instanceof str) {
            return object.toString()
        }
        if (object instanceof Enum) {
            return object.valueOf()
        }
        if (object instanceof Data) {
            return object.getBytes()
        }
        if (circularly) {
            if (Arrays.isArray(object)) {
                if (object instanceof Array) {
                    return list_unwrap(object)
                }
            } else {
                if (ns.Interface.conforms(object, map)) {
                    object = object.getMap()
                }
                return map_unwrap(object)
            }
        } else {
            if (ns.Interface.conforms(object, map)) {
                object = object.getMap()
            }
        }
        return object
    };
    var wrapper = function() {};
    ns.Interface(wrapper, null);
    wrapper.unwrap = unwrap;
    ns.type.Wrapper = wrapper;
    ns.type.registers("Wrapper")
})(MONKEY);
(function(ns) {
    var Runnable = function() {};
    ns.Interface(Runnable, null);
    Runnable.prototype.run = function() {
        console.assert(false, "implement me!");
        return false
    };
    ns.threading.Runnable = Runnable;
    ns.threading.registers("Runnable")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Runnable = ns.threading.Runnable;
    var Thread = function() {
        obj.call(this);
        if (arguments.length === 0) {
            this.__target = null;
            this.__interval = 128
        } else {
            if (arguments.length === 2) {
                this.__target = arguments[0];
                this.__interval = arguments[1]
            } else {
                if (typeof arguments[0] === "number") {
                    this.__target = null;
                    this.__interval = arguments[0]
                } else {
                    this.__target = arguments[0];
                    this.__interval = 128
                }
            }
        }
        this.__running = false;
        this.__thread_id = 0
    };
    ns.Class(Thread, obj, [Runnable]);
    Thread.prototype.start = function() {
        this.__running = true;
        var thread = this;
        this.__thread_id = setInterval(function() {
            var ran = thread.isRunning() && thread.run();
            if (!ran) {
                stop(thread)
            }
        }, this.getInterval())
    };
    var stop = function(thread) {
        var tid = thread.__thread_id;
        if (tid > 0) {
            thread.__thread_id = 0;
            clearInterval(tid)
        }
    };
    Thread.prototype.stop = function() {
        stop(this);
        this.__running = false
    };
    Thread.prototype.isRunning = function() {
        return this.__running
    };
    Thread.prototype.getInterval = function() {
        return this.__interval
    };
    Thread.prototype.run = function() {
        var target = this.__target;
        if (!target || target === this) {
            throw new SyntaxError("Thread::run() > override me!")
        } else {
            return target.run()
        }
    };
    ns.threading.Thread = Thread;
    ns.threading.registers("Thread")
})(MONKEY);
(function(ns) {
    var Handler = function() {};
    ns.Interface(Handler, null);
    Handler.prototype.setup = function() {
        console.assert(false, "implement me!");
        return false
    };
    Handler.prototype.handle = function() {
        console.assert(false, "implement me!");
        return false
    };
    Handler.prototype.finish = function() {
        console.assert(false, "implement me!");
        return false
    };
    ns.threading.Handler = Handler;
    ns.threading.registers("Handler")
})(MONKEY);
(function(ns) {
    var Processor = function() {};
    ns.Interface(Processor, null);
    Processor.prototype.process = function() {
        console.assert(false, "implement me!");
        return false
    };
    ns.threading.Processor = Processor;
    ns.threading.registers("Processor")
})(MONKEY);
(function(ns) {
    var Thread = ns.threading.Thread;
    var Handler = ns.threading.Handler;
    var Processor = ns.threading.Processor;
    var STAGE_INIT = 0;
    var STAGE_HANDLING = 1;
    var STAGE_CLEANING = 2;
    var STAGE_STOPPED = 3;
    var Runner = function() {
        if (arguments.length === 0) {
            Thread.call(this);
            this.__processor = null
        } else {
            if (arguments.length === 2) {
                Thread.call(this, arguments[1]);
                this.__processor = arguments[0]
            } else {
                if (typeof arguments[0] === "number") {
                    Thread.call(this, arguments[0]);
                    this.__processor = null
                } else {
                    Thread.call(this);
                    this.__processor = arguments[0]
                }
            }
        }
        this.__stage = STAGE_INIT
    };
    ns.Class(Runner, Thread, [Handler, Processor]);
    Runner.prototype.run = function() {
        if (this.__stage === STAGE_INIT) {
            if (this.setup()) {
                return true
            }
            this.__stage = STAGE_HANDLING
        }
        if (this.__stage === STAGE_HANDLING) {
            try {
                if (this.handle()) {
                    return true
                }
            } catch (e) {}
            this.__stage = STAGE_CLEANING
        }
        if (this.__stage === STAGE_CLEANING) {
            if (this.finish()) {
                return true
            }
            this.__stage = STAGE_STOPPED
        }
        return false
    };
    Runner.prototype.setup = function() {
        return false
    };
    Runner.prototype.handle = function() {
        while (this.isRunning()) {
            if (this.process()) {} else {
                return true
            }
        }
        return false
    };
    Runner.prototype.finish = function() {
        return false
    };
    Runner.prototype.process = function() {
        var processor = this.__processor;
        if (!processor || processor === this) {
            throw new SyntaxError("Runner::process() > override me!")
        } else {
            return processor.process()
        }
    };
    ns.threading.Runner = Runner;
    ns.threading.registers("Runner")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var hash = function() {};
    ns.Interface(hash, null);
    hash.prototype.digest = function(data) {
        console.assert(false, "implement me!");
        return null
    };
    var lib = function(hash) {
        obj.call(this);
        this.hash = hash
    };
    ns.Class(lib, obj, [hash]);
    lib.prototype.digest = function(data) {
        return this.hash.digest(data)
    };
    ns.digest.Hash = hash;
    ns.digest.HashLib = lib;
    ns.digest.registers("Hash");
    ns.digest.registers("HashLib")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Hash = ns.digest.Hash;
    var Lib = ns.digest.HashLib;
    var md5 = function() {
        obj.call(this)
    };
    ns.Class(md5, obj, [Hash]);
    md5.prototype.digest = function(data) {
        console.assert(false, "MD5 not implemented");
        return null
    };
    ns.digest.MD5 = new Lib(new md5());
    ns.digest.registers("MD5")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Hash = ns.digest.Hash;
    var Lib = ns.digest.HashLib;
    var sha1 = function() {
        obj.call(this)
    };
    ns.Class(sha1, obj, [Hash]);
    sha1.prototype.digest = function(data) {
        console.assert(false, "SHA1 not implemented");
        return null
    };
    ns.digest.SHA1 = new Lib(new sha1());
    ns.digest.registers("SHA1")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Hash = ns.digest.Hash;
    var Lib = ns.digest.HashLib;
    var sha256 = function() {
        obj.call(this)
    };
    ns.Class(sha256, obj, [Hash]);
    sha256.prototype.digest = function(data) {
        console.assert(false, "SHA256 not implemented");
        return null
    };
    ns.digest.SHA256 = new Lib(new sha256());
    ns.digest.registers("SHA256")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Hash = ns.digest.Hash;
    var Lib = ns.digest.HashLib;
    var ripemd160 = function() {
        obj.call(this)
    };
    ns.Class(ripemd160, obj, [Hash]);
    ripemd160.prototype.digest = function(data) {
        console.assert(false, "RIPEMD160 not implemented");
        return null
    };
    ns.digest.RIPEMD160 = new Lib(new ripemd160());
    ns.digest.registers("RIPEMD160")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Hash = ns.digest.Hash;
    var Lib = ns.digest.HashLib;
    var keccak256 = function() {
        obj.call(this)
    };
    ns.Class(keccak256, obj, [Hash]);
    keccak256.prototype.digest = function(data) {
        console.assert(false, "KECCAK256 not implemented");
        return null
    };
    ns.digest.KECCAK256 = new Lib(new keccak256());
    ns.digest.registers("KECCAK256")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var coder = function() {};
    ns.Interface(coder, null);
    coder.prototype.encode = function(data) {
        console.assert(false, "implement me!");
        return null
    };
    coder.prototype.decode = function(string) {
        console.assert(false, "implement me!");
        return null
    };
    var lib = function(coder) {
        obj.call(this);
        this.coder = coder
    };
    ns.Class(lib, obj, [coder]);
    lib.prototype.encode = function(data) {
        return this.coder.encode(data)
    };
    lib.prototype.decode = function(string) {
        return this.coder.decode(string)
    };
    ns.format.BaseCoder = coder;
    ns.format.CoderLib = lib;
    ns.format.registers("BaseCoder");
    ns.format.registers("CoderLib")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Data = ns.type.Data;
    var Coder = ns.format.BaseCoder;
    var Lib = ns.format.CoderLib;
    var hex_chars = "0123456789abcdef";
    var hex_values = new Int8Array(128);
    (function(chars, values) {
        for (var i = 0; i < chars.length; ++i) {
            values[chars.charCodeAt(i)] = i
        }
        values["A".charCodeAt(0)] = 10;
        values["B".charCodeAt(0)] = 11;
        values["C".charCodeAt(0)] = 12;
        values["D".charCodeAt(0)] = 13;
        values["E".charCodeAt(0)] = 14;
        values["F".charCodeAt(0)] = 15
    })(hex_chars, hex_values);
    var hex_encode = function(data) {
        var len = data.length;
        var str = "";
        var byt;
        for (var i = 0; i < len; ++i) {
            byt = data[i];
            str += hex_chars[byt >> 4];
            str += hex_chars[byt & 15]
        }
        return str
    };
    var hex_decode = function(string) {
        var i = 0;
        var len = string.length;
        if (len > 2) {
            if (string[0] === "0") {
                if (string[1] === "x" || string[1] === "X") {
                    i += 2
                }
            }
        }
        var size = Math.floor(len / 2);
        var data = new Data(size);
        --len;
        var hi, lo;
        for (; i < len; i += 2) {
            hi = hex_values[string.charCodeAt(i)];
            lo = hex_values[string.charCodeAt(i + 1)];
            data.push((hi << 4) | lo)
        }
        return data.getBytes()
    };
    var hex = function() {
        obj.call(this)
    };
    ns.Class(hex, obj, [Coder]);
    hex.prototype.encode = function(data) {
        return hex_encode(data)
    };
    hex.prototype.decode = function(str) {
        return hex_decode(str)
    };
    ns.format.Hex = new Lib(new hex());
    ns.format.registers("Hex")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Coder = ns.format.BaseCoder;
    var Lib = ns.format.CoderLib;
    var base58 = function() {
        obj.call(this)
    };
    ns.Class(base58, obj, [Coder]);
    base58.prototype.encode = function(data) {
        console.assert(false, "Base58 encode not implemented");
        return null
    };
    base58.prototype.decode = function(string) {
        console.assert(false, "Base58 decode not implemented");
        return null
    };
    ns.format.Base58 = new Lib(new base58());
    ns.format.registers("Base58")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Data = ns.type.Data;
    var Coder = ns.format.BaseCoder;
    var Lib = ns.format.CoderLib;
    var base64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64_values = new Int8Array(128);
    (function(chars, values) {
        for (var i = 0; i < chars.length; ++i) {
            values[chars.charCodeAt(i)] = i
        }
    })(base64_chars, base64_values);
    var base64_encode = function(data) {
        var base64 = "";
        var length = data.length;
        var tail = "";
        var remainder = length % 3;
        if (remainder === 1) {
            length -= 1;
            tail = "=="
        } else {
            if (remainder === 2) {
                length -= 2;
                tail = "="
            }
        }
        var x1, x2, x3;
        var i;
        for (i = 0; i < length; i += 3) {
            x1 = data[i];
            x2 = data[i + 1];
            x3 = data[i + 2];
            base64 += base64_chars.charAt((x1 & 252) >> 2);
            base64 += base64_chars.charAt(((x1 & 3) << 4) | ((x2 & 240) >> 4));
            base64 += base64_chars.charAt(((x2 & 15) << 2) | ((x3 & 192) >> 6));
            base64 += base64_chars.charAt(x3 & 63)
        }
        if (remainder === 1) {
            x1 = data[i];
            base64 += base64_chars.charAt((x1 & 252) >> 2);
            base64 += base64_chars.charAt((x1 & 3) << 4)
        } else {
            if (remainder === 2) {
                x1 = data[i];
                x2 = data[i + 1];
                base64 += base64_chars.charAt((x1 & 252) >> 2);
                base64 += base64_chars.charAt(((x1 & 3) << 4) | ((x2 & 240) >> 4));
                base64 += base64_chars.charAt((x2 & 15) << 2)
            }
        }
        return base64 + tail
    };
    var base64_decode = function(string) {
        var str = string.replace(/[^A-Za-z0-9+\/=]/g, "");
        var length = str.length;
        if ((length % 4) !== 0 || !/^[A-Za-z0-9+\/]+={0,2}$/.test(str)) {
            throw new Error("base64 string error: " + string)
        }
        var array = new Data(length * 3 / 4);
        var ch1, ch2, ch3, ch4;
        var i;
        for (i = 0; i < length; i += 4) {
            ch1 = base64_values[str.charCodeAt(i)];
            ch2 = base64_values[str.charCodeAt(i + 1)];
            ch3 = base64_values[str.charCodeAt(i + 2)];
            ch4 = base64_values[str.charCodeAt(i + 3)];
            array.push(((ch1 & 63) << 2) | ((ch2 & 48) >> 4));
            array.push(((ch2 & 15) << 4) | ((ch3 & 60) >> 2));
            array.push(((ch3 & 3) << 6) | ((ch4 & 63) >> 0))
        }
        while (str[--i] === "=") {
            array.pop()
        }
        return array.getBytes()
    };
    var base64 = function() {
        obj.call(this)
    };
    ns.Class(base64, obj, [Coder]);
    base64.prototype.encode = function(data) {
        return base64_encode(data)
    };
    base64.prototype.decode = function(string) {
        return base64_decode(string)
    };
    ns.format.Base64 = new Lib(new base64());
    ns.format.registers("Base64")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var parser = function() {};
    ns.Interface(parser, null);
    parser.prototype.encode = function(object) {
        console.assert(false, "implement me!");
        return null
    };
    parser.prototype.decode = function(data) {
        console.assert(false, "implement me!");
        return null
    };
    var lib = function(parser) {
        obj.call(this);
        this.parser = parser
    };
    ns.Class(lib, obj, [parser]);
    lib.prototype.encode = function(object) {
        return this.parser.encode(object)
    };
    lib.prototype.decode = function(data) {
        return this.parser.decode(data)
    };
    ns.format.DataParser = parser;
    ns.format.ParserLib = lib;
    ns.format.registers("DataParser");
    ns.format.registers("ParserLib")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Data = ns.type.Data;
    var Parser = ns.format.DataParser;
    var Lib = ns.format.ParserLib;
    var utf8_encode = function(string) {
        var len = string.length;
        var array = new Data(len);
        var c, l;
        for (var i = 0; i < len; ++i) {
            c = string.charCodeAt(i);
            if (55296 <= c && c <= 56319) {
                l = string.charCodeAt(++i);
                c = ((c - 55296) << 10) + 65536 + l - 56320
            }
            if (c <= 0) {
                break
            } else {
                if (c < 128) {
                    array.push(c)
                } else {
                    if (c < 2048) {
                        array.push(192 | ((c >> 6) & 31));
                        array.push(128 | ((c >> 0) & 63))
                    } else {
                        if (c < 65536) {
                            array.push(224 | ((c >> 12) & 15));
                            array.push(128 | ((c >> 6) & 63));
                            array.push(128 | ((c >> 0) & 63))
                        } else {
                            array.push(240 | ((c >> 18) & 7));
                            array.push(128 | ((c >> 12) & 63));
                            array.push(128 | ((c >> 6) & 63));
                            array.push(128 | ((c >> 0) & 63))
                        }
                    }
                }
            }
        }
        return array.getBytes()
    };
    var utf8_decode = function(array) {
        var string = "";
        var len = array.length;
        var c, c2, c3, c4;
        for (var i = 0; i < len; ++i) {
            c = array[i];
            switch (c >> 4) {
                case 12:
                case 13:
                    c2 = array[++i];
                    c = ((c & 31) << 6) | (c2 & 63);
                    break;
                case 14:
                    c2 = array[++i];
                    c3 = array[++i];
                    c = ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63);
                    break;
                case 15:
                    c2 = array[++i];
                    c3 = array[++i];
                    c4 = array[++i];
                    c = ((c & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63);
                    break
            }
            if (c < 65536) {
                string += String.fromCharCode(c)
            } else {
                c -= 65536;
                string += String.fromCharCode((c >> 10) + 55296);
                string += String.fromCharCode((c & 1023) + 56320)
            }
        }
        return string
    };
    var utf8 = function() {
        obj.call(this)
    };
    ns.Class(utf8, obj, [Parser]);
    utf8.prototype.encode = utf8_encode;
    utf8.prototype.decode = utf8_decode;
    ns.format.UTF8 = new Lib(new utf8());
    ns.format.registers("UTF8")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Parser = ns.format.DataParser;
    var Lib = ns.format.ParserLib;
    var json = function() {
        obj.call(this)
    };
    ns.Class(json, obj, [Parser]);
    json.prototype.encode = function(container) {
        var string = JSON.stringify(container);
        if (!string) {
            throw new TypeError("failed to encode JSON object: " + container)
        }
        return ns.format.UTF8.encode(string)
    };
    json.prototype.decode = function(json) {
        var string;
        if (typeof json === "string") {
            string = json
        } else {
            string = ns.format.UTF8.decode(json)
        }
        if (!string) {
            throw new TypeError("failed to decode JSON data: " + json)
        }
        return JSON.parse(string)
    };
    ns.format.JSON = new Lib(new json());
    ns.format.registers("JSON")
})(MONKEY);
(function(ns) {
    var map = ns.type.Map;
    var CryptographyKey = function() {};
    ns.Interface(CryptographyKey, [map]);
    CryptographyKey.prototype.getAlgorithm = function() {
        console.assert(false, "implement me!");
        return null
    };
    CryptographyKey.getAlgorithm = function(key) {
        return key["algorithm"]
    };
    CryptographyKey.prototype.getData = function() {
        console.assert(false, "implement me!");
        return null
    };
    CryptographyKey.promise = ns.format.UTF8.encode("Moky loves May Lee forever!");
    CryptographyKey.matches = function(pKey, sKey) {
        var promise = CryptographyKey.promise;
        var ciphertext = pKey.encrypt(promise);
        var plaintext = sKey.decrypt(ciphertext);
        if (!plaintext || plaintext.length !== promise.length) {
            return false
        }
        for (var i = 0; i < promise.length; ++i) {
            if (plaintext[i] !== promise[i]) {
                return false
            }
        }
        return true
    };
    ns.crypto.CryptographyKey = CryptographyKey;
    ns.crypto.registers("CryptographyKey")
})(MONKEY);
(function(ns) {
    var CryptographyKey = ns.crypto.CryptographyKey;
    var EncryptKey = function() {};
    ns.Interface(EncryptKey, [CryptographyKey]);
    EncryptKey.prototype.encrypt = function(plaintext) {
        console.assert(false, "implement me!");
        return null
    };
    var DecryptKey = function() {};
    ns.Interface(DecryptKey, [CryptographyKey]);
    DecryptKey.prototype.decrypt = function(ciphertext) {
        console.assert(false, "implement me!");
        return null
    };
    DecryptKey.prototype.matches = function(pKey) {
        console.assert(false, "implement me!");
        return false
    };
    ns.crypto.EncryptKey = EncryptKey;
    ns.crypto.DecryptKey = DecryptKey;
    ns.crypto.registers("EncryptKey");
    ns.crypto.registers("DecryptKey")
})(MONKEY);
(function(ns) {
    var EncryptKey = ns.crypto.EncryptKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var SymmetricKey = function() {};
    ns.Interface(SymmetricKey, [EncryptKey, DecryptKey]);
    SymmetricKey.AES = "AES";
    SymmetricKey.DES = "DES";
    ns.crypto.SymmetricKey = SymmetricKey;
    ns.crypto.registers("SymmetricKey")
})(MONKEY);
(function(ns) {
    var map = ns.type.Map;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var SymmetricKeyFactory = function() {};
    ns.Interface(SymmetricKeyFactory, null);
    SymmetricKeyFactory.prototype.generateSymmetricKey = function() {
        console.assert(false, "implement me!");
        return null
    };
    SymmetricKeyFactory.prototype.parseSymmetricKey = function(key) {
        console.assert(false, "implement me!");
        return null
    };
    SymmetricKey.Factory = SymmetricKeyFactory;
    var s_factories = {};
    SymmetricKey.register = function(algorithm, factory) {
        s_factories[algorithm] = factory
    };
    SymmetricKey.getFactory = function(algorithm) {
        return s_factories[algorithm]
    };
    SymmetricKey.generate = function(algorithm) {
        var factory = SymmetricKey.getFactory(algorithm);
        if (!factory) {
            throw new ReferenceError("key algorithm not support: " + algorithm)
        }
        return factory.generateSymmetricKey()
    };
    SymmetricKey.parse = function(key) {
        if (!key) {
            return null
        } else {
            if (ns.Interface.conforms(key, SymmetricKey)) {
                return key
            } else {
                if (ns.Interface.conforms(key, map)) {
                    key = key.getMap()
                }
            }
        }
        var algorithm = CryptographyKey.getAlgorithm(key);
        var factory = SymmetricKey.getFactory(algorithm);
        if (!factory) {
            factory = SymmetricKey.getFactory("*")
        }
        return factory.parseSymmetricKey(key)
    }
})(MONKEY);
(function(ns) {
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = function(key) {};
    ns.Interface(AsymmetricKey, [CryptographyKey]);
    AsymmetricKey.RSA = "RSA";
    AsymmetricKey.ECC = "ECC";
    AsymmetricKey.matches = function(sKey, pKey) {
        var promise = CryptographyKey.promise;
        var signature = sKey.sign(promise);
        return pKey.verify(promise, signature)
    };
    var SignKey = function() {};
    ns.Interface(SignKey, [AsymmetricKey]);
    SignKey.prototype.sign = function(data) {
        console.assert(false, "implement me!");
        return null
    };
    var VerifyKey = function() {};
    ns.Interface(VerifyKey, [AsymmetricKey]);
    VerifyKey.prototype.verify = function(data, signature) {
        console.assert(false, "implement me!");
        return false
    };
    VerifyKey.prototype.matches = function(sKey) {
        console.assert(false, "implement me!");
        return false
    };
    ns.crypto.AsymmetricKey = AsymmetricKey;
    ns.crypto.SignKey = SignKey;
    ns.crypto.VerifyKey = VerifyKey;
    ns.crypto.registers("AsymmetricKey");
    ns.crypto.registers("SignKey");
    ns.crypto.registers("VerifyKey")
})(MONKEY);
(function(ns) {
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var VerifyKey = ns.crypto.VerifyKey;
    var PublicKey = function() {};
    ns.Interface(PublicKey, [VerifyKey]);
    PublicKey.RSA = AsymmetricKey.RSA;
    PublicKey.ECC = AsymmetricKey.ECC;
    ns.crypto.PublicKey = PublicKey;
    ns.crypto.registers("PublicKey")
})(MONKEY);
(function(ns) {
    var map = ns.type.Map;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var PublicKey = ns.crypto.PublicKey;
    var PublicKeyFactory = function() {};
    ns.Interface(PublicKeyFactory, null);
    PublicKeyFactory.prototype.parsePublicKey = function(key) {
        console.assert(false, "implement me!");
        return null
    };
    PublicKey.Factory = PublicKeyFactory;
    var s_factories = {};
    PublicKey.register = function(algorithm, factory) {
        s_factories[algorithm] = factory
    };
    PublicKey.getFactory = function(algorithm) {
        return s_factories[algorithm]
    };
    PublicKey.parse = function(key) {
        if (!key) {
            return null
        } else {
            if (ns.Interface.conforms(key, PublicKey)) {
                return key
            } else {
                if (ns.Interface.conforms(key, map)) {
                    key = key.getMap()
                }
            }
        }
        var algorithm = CryptographyKey.getAlgorithm(key);
        var factory = PublicKey.getFactory(algorithm);
        if (!factory) {
            factory = PublicKey.getFactory("*")
        }
        return factory.parsePublicKey(key)
    }
})(MONKEY);
(function(ns) {
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var SignKey = ns.crypto.SignKey;
    var PrivateKey = function() {};
    ns.Interface(PrivateKey, [SignKey]);
    PrivateKey.RSA = AsymmetricKey.RSA;
    PrivateKey.ECC = AsymmetricKey.ECC;
    PrivateKey.prototype.getPublicKey = function() {
        console.assert(false, "implement me!");
        return null
    };
    ns.crypto.PrivateKey = PrivateKey;
    ns.crypto.registers("PrivateKey")
})(MONKEY);
(function(ns) {
    var map = ns.type.Map;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PrivateKeyFactory = function() {};
    ns.Interface(PrivateKeyFactory, null);
    PrivateKeyFactory.prototype.generatePrivateKey = function() {
        console.assert(false, "implement me!");
        return null
    };
    PrivateKeyFactory.prototype.parsePrivateKey = function(key) {
        console.assert(false, "implement me!");
        return null
    };
    PrivateKey.Factory = PrivateKeyFactory;
    var s_factories = {};
    PrivateKey.register = function(algorithm, factory) {
        s_factories[algorithm] = factory
    };
    PrivateKey.getFactory = function(algorithm) {
        return s_factories[algorithm]
    };
    PrivateKey.generate = function(algorithm) {
        var factory = PrivateKey.getFactory(algorithm);
        if (!factory) {
            throw new ReferenceError("key algorithm not support: " + algorithm)
        }
        return factory.generatePrivateKey()
    };
    PrivateKey.parse = function(key) {
        if (!key) {
            return null
        } else {
            if (ns.Interface.conforms(key, PrivateKey)) {
                return key
            } else {
                if (ns.Interface.conforms(key, map)) {
                    key = key.getMap()
                }
            }
        }
        var algorithm = CryptographyKey.getAlgorithm(key);
        var factory = PrivateKey.getFactory(algorithm);
        if (!factory) {
            factory = PrivateKey.getFactory("*")
        }
        return factory.parsePrivateKey(key)
    }
})(MONKEY);
if (typeof MingKeMing !== "object") {
    MingKeMing = new MONKEY.Namespace()
}
(function(ns, base) {
    base.exports(ns);
    if (typeof ns.protocol !== "object") {
        ns.protocol = new ns.Namespace()
    }
    if (typeof ns.mkm !== "object") {
        ns.mkm = new ns.Namespace()
    }
    ns.registers("protocol");
    ns.registers("mkm")
})(MingKeMing, MONKEY);
(function(ns) {
    var NetworkType = ns.type.Enum(null, {
        BTC_MAIN: (0),
        MAIN: (8),
        GROUP: (16),
        POLYLOGUE: (16),
        CHATROOM: (48),
        PROVIDER: (118),
        STATION: (136),
        THING: (128),
        ROBOT: (200)
    });
    NetworkType.isUser = function(network) {
        var main = NetworkType.MAIN.valueOf();
        var btcMain = NetworkType.BTC_MAIN.valueOf();
        return ((network & main) === main) || (network === btcMain)
    };
    NetworkType.isGroup = function(network) {
        var group = NetworkType.GROUP.valueOf();
        return (network & group) === group
    };
    ns.protocol.NetworkType = NetworkType;
    ns.protocol.registers("NetworkType")
})(MingKeMing);
(function(ns) {
    var MetaType = ns.type.Enum(null, {
        DEFAULT: (1),
        MKM: (1),
        BTC: (2),
        ExBTC: (3),
        ETH: (4),
        ExETH: (5)
    });
    MetaType.hasSeed = function(version) {
        var mkm = MetaType.MKM.valueOf();
        return (version & mkm) === mkm
    };
    ns.protocol.MetaType = MetaType;
    ns.protocol.registers("MetaType")
})(MingKeMing);
(function(ns) {
    var Address = function() {};
    ns.Interface(Address, null);
    Address.prototype.getNetwork = function() {
        console.assert(false, "implement me!");
        return 0
    };
    Address.prototype.isBroadcast = function() {
        console.assert(false, "implement me!");
        return false
    };
    Address.prototype.isUser = function() {
        console.assert(false, "implement me!");
        return false
    };
    Address.prototype.isGroup = function() {
        console.assert(false, "implement me!");
        return false
    };
    Address.ANYWHERE = null;
    Address.EVERYWHERE = null;
    ns.protocol.Address = Address;
    ns.protocol.registers("Address")
})(MingKeMing);
(function(ns) {
    var str = ns.type.String;
    var Address = ns.protocol.Address;
    var AddressFactory = function() {};
    ns.Interface(AddressFactory, null);
    AddressFactory.prototype.parseAddress = function(address) {
        console.assert(false, "implement me!");
        return null
    };
    Address.Factory = AddressFactory;
    var s_factory = null;
    Address.getFactory = function() {
        return s_factory
    };
    Address.setFactory = function(factory) {
        s_factory = factory
    };
    Address.parse = function(address) {
        if (!address) {
            return null
        } else {
            if (ns.Interface.conforms(address, Address)) {
                return address
            } else {
                if (address instanceof str) {
                    address = address.toString()
                }
            }
        }
        return Address.getFactory().parseAddress(address)
    }
})(MingKeMing);
(function(ns) {
    var Address = ns.protocol.Address;
    var ID = function() {};
    ns.Interface(ID, null);
    ID.prototype.getName = function() {
        console.assert(false, "implement me!");
        return null
    };
    ID.prototype.getAddress = function() {
        console.assert(false, "implement me!");
        return null
    };
    ID.prototype.getTerminal = function() {
        console.assert(false, "implement me!");
        return null
    };
    ID.prototype.getType = function() {
        console.assert(false, "implement me!");
        return 0
    };
    ID.prototype.isBroadcast = function() {
        console.assert(false, "implement me!");
        return false
    };
    ID.prototype.isUser = function() {
        console.assert(false, "implement me!");
        return false
    };
    ID.prototype.isGroup = function() {
        console.assert(false, "implement me!");
        return false
    };
    ID.ANYONE = null;
    ID.EVERYONE = null;
    ID.FOUNDER = null;
    ID.convert = function(members) {
        var array = [];
        var id;
        for (var i = 0; i < members.length; ++i) {
            id = ID.parse(members[i]);
            if (id) {
                array.push(id)
            }
        }
        return array
    };
    ID.revert = function(members) {
        var array = [];
        var id;
        for (var i = 0; i < members.length; ++i) {
            id = members[i];
            if (typeof id === "string") {
                array.push(id)
            } else {
                array.push(id.toString())
            }
        }
        return array
    };
    ns.protocol.ID = ID;
    ns.protocol.registers("ID")
})(MingKeMing);
(function(ns) {
    var str = ns.type.String;
    var ID = ns.protocol.ID;
    var IDFactory = function() {};
    ns.Interface(IDFactory, null);
    IDFactory.prototype.createID = function(name, address, terminal) {
        console.assert(false, "implement me!");
        return null
    };
    IDFactory.prototype.parseID = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    ID.Factory = IDFactory;
    var s_factory;
    ID.getFactory = function() {
        return s_factory
    };
    ID.setFactory = function(factory) {
        s_factory = factory
    };
    ID.create = function(name, address, terminal) {
        return ID.getFactory().createID(name, address, terminal)
    };
    ID.parse = function(identifier) {
        if (!identifier) {
            return null
        } else {
            if (ns.Interface.conforms(identifier, ID)) {
                return identifier
            } else {
                if (identifier instanceof str) {
                    identifier = identifier.toString()
                }
            }
        }
        return ID.getFactory().parseID(identifier)
    }
})(MingKeMing);
(function(ns) {
    var map = ns.type.Map;
    var PublicKey = ns.crypto.PublicKey;
    var ID = ns.protocol.ID;
    var Meta = function() {};
    ns.Interface(Meta, [map]);
    Meta.prototype.getType = function() {
        console.assert(false, "implement me!");
        return 0
    };
    Meta.getType = function(meta) {
        var version = meta["type"];
        if (!version) {
            version = meta["version"]
        }
        return version
    };
    Meta.prototype.getKey = function() {
        console.assert(false, "implement me!");
        return null
    };
    Meta.getKey = function(meta) {
        var key = meta["key"];
        if (!key) {
            throw new TypeError("meta key not found: " + meta)
        }
        return PublicKey.parse(key)
    };
    Meta.prototype.getSeed = function() {
        console.assert(false, "implement me!");
        return null
    };
    Meta.getSeed = function(meta) {
        return meta["seed"]
    };
    Meta.prototype.getFingerprint = function() {
        console.assert(false, "implement me!");
        return null
    };
    Meta.getFingerprint = function(meta) {
        var base64 = meta["fingerprint"];
        if (!base64) {
            return null
        }
        return ns.format.Base64.decode(base64)
    };
    Meta.prototype.isValid = function() {
        console.assert(false, "implement me!");
        return false
    };
    Meta.prototype.generateID = function(type, terminal) {
        console.assert(false, "implement me!");
        return null
    };
    Meta.prototype.matches = function(id_or_key) {
        console.assert(false, "implement me!");
        return false
    };
    ns.protocol.Meta = Meta;
    ns.protocol.registers("Meta")
})(MingKeMing);
(function(ns) {
    var map = ns.type.Map;
    var MetaType = ns.protocol.MetaType;
    var Meta = ns.protocol.Meta;
    var MetaFactory = function() {};
    ns.Interface(MetaFactory, null);
    MetaFactory.prototype.createMeta = function(key, seed, fingerprint) {
        console.assert(false, "implement me!");
        return null
    };
    MetaFactory.prototype.generateMeta = function(sKey, seed) {
        console.assert(false, "implement me!");
        return null
    };
    MetaFactory.prototype.parseMeta = function(meta) {
        console.assert(false, "implement me!");
        return null
    };
    Meta.Factory = MetaFactory;
    var s_factories = {};
    Meta.register = function(type, factory) {
        if (type instanceof MetaType) {
            type = type.valueOf()
        }
        s_factories[type] = factory
    };
    Meta.getFactory = function(type) {
        if (type instanceof MetaType) {
            type = type.valueOf()
        }
        return s_factories[type]
    };
    Meta.create = function(type, key, seed, fingerprint) {
        var factory = Meta.getFactory(type);
        if (!factory) {
            throw new ReferenceError("meta type not support: " + type)
        }
        return factory.createMeta(key, seed, fingerprint)
    };
    Meta.generate = function(type, sKey, seed) {
        var factory = Meta.getFactory(type);
        if (!factory) {
            throw new ReferenceError("meta type not support: " + type)
        }
        return factory.generateMeta(sKey, seed)
    };
    Meta.parse = function(meta) {
        if (!meta) {
            return null
        } else {
            if (ns.Interface.conforms(meta, Meta)) {
                return meta
            } else {
                if (ns.Interface.conforms(meta, map)) {
                    meta = meta.getMap()
                }
            }
        }
        var type = Meta.getType(meta);
        var factory = Meta.getFactory(type);
        if (!factory) {
            factory = Meta.getFactory(0)
        }
        return factory.parseMeta(meta)
    }
})(MingKeMing);
(function(ns) {
    var TAI = function() {};
    ns.Interface(TAI, null);
    TAI.prototype.isValid = function() {
        console.assert(false, "implement me!");
        return false
    };
    TAI.prototype.verify = function(publicKey) {
        console.assert(false, "implement me!");
        return false
    };
    TAI.prototype.sign = function(privateKey) {
        console.assert(false, "implement me!");
        return null
    };
    TAI.prototype.allPropertyNames = function() {
        console.assert(false, "implement me!");
        return null
    };
    TAI.prototype.getProperty = function(name) {
        console.assert(false, "implement me!");
        return null
    };
    TAI.prototype.setProperty = function(name, value) {
        console.assert(false, "implement me!")
    };
    ns.protocol.TAI = TAI;
    ns.protocol.registers("TAI")
})(MingKeMing);
(function(ns) {
    var map = ns.type.Map;
    var TAI = ns.protocol.TAI;
    var ID = ns.protocol.ID;
    var Document = function() {};
    ns.Interface(Document, [TAI, map]);
    Document.VISA = "visa";
    Document.PROFILE = "profile";
    Document.BULLETIN = "bulletin";
    Document.prototype.getType = function() {
        console.assert(false, "implement me!");
        return null
    };
    Document.getType = function(doc) {
        return doc["type"]
    };
    Document.prototype.getIdentifier = function() {
        console.assert(false, "implement me!");
        return null
    };
    Document.getIdentifier = function(doc) {
        return ID.parse(doc["ID"])
    };
    Document.getData = function(doc) {
        var utf8 = doc["data"];
        if (utf8) {
            return ns.format.UTF8.encode(utf8)
        } else {
            return null
        }
    };
    Document.getSignature = function(doc) {
        var base64 = doc["signature"];
        if (base64) {
            return ns.format.Base64.decode(base64)
        } else {
            return null
        }
    };
    Document.prototype.getTime = function() {
        console.assert(false, "implement me!");
        return null
    };
    Document.prototype.getName = function() {
        console.assert(false, "implement me!");
        return null
    };
    Document.prototype.setName = function(name) {
        console.assert(false, "implement me!")
    };
    ns.protocol.Document = Document;
    ns.protocol.registers("Document")
})(MingKeMing);
(function(ns) {
    var map = ns.type.Map;
    var Document = ns.protocol.Document;
    var DocumentFactory = function() {};
    ns.Interface(DocumentFactory, null);
    DocumentFactory.prototype.createDocument = function(identifier, data, signature) {
        console.assert(false, "implement me!");
        return null
    };
    DocumentFactory.prototype.parseDocument = function(doc) {
        console.assert(false, "implement me!");
        return null
    };
    Document.Factory = DocumentFactory;
    var s_factories = {};
    Document.register = function(type, factory) {
        s_factories[type] = factory
    };
    Document.getFactory = function(type) {
        return s_factories[type]
    };
    Document.create = function(type, identifier, data, signature) {
        var factory = Document.getFactory(type);
        if (!factory) {
            throw new ReferenceError("document type not support: " + type)
        }
        return factory.createDocument(identifier, data, signature)
    };
    Document.parse = function(doc) {
        if (!doc) {
            return null
        } else {
            if (ns.Interface.conforms(doc, Document)) {
                return doc
            } else {
                if (ns.Interface.conforms(doc, map)) {
                    doc = doc.getMap()
                }
            }
        }
        var type = Document.getType(doc);
        var factory = Document.getFactory(type);
        if (!factory) {
            factory = Document.getFactory("*")
        }
        return factory.parseDocument(doc)
    }
})(MingKeMing);
(function(ns) {
    var Document = ns.protocol.Document;
    var Visa = function() {};
    ns.Interface(Visa, [Document]);
    Visa.prototype.getKey = function() {
        console.assert(false, "implement me!");
        return null
    };
    Visa.prototype.setKey = function(publicKey) {
        console.assert(false, "implement me!")
    };
    Visa.prototype.getAvatar = function() {
        console.assert(false, "implement me!");
        return null
    };
    Visa.prototype.setAvatar = function(url) {
        console.assert(false, "implement me!")
    };
    ns.protocol.Visa = Visa;
    ns.protocol.registers("Visa")
})(MingKeMing);
(function(ns) {
    var Document = ns.protocol.Document;
    var Bulletin = function() {};
    ns.Interface(Bulletin, [Document]);
    Bulletin.prototype.getAssistants = function() {
        console.assert(false, "implement me!");
        return null
    };
    Bulletin.prototype.setAssistants = function(assistants) {
        console.assert(false, "implement me!")
    };
    ns.protocol.Bulletin = Bulletin;
    ns.protocol.registers("Bulletin")
})(MingKeMing);
(function(ns) {
    var str = ns.type.String;
    var ID = ns.protocol.ID;
    var Identifier = function(identifier, name, address, terminal) {
        str.call(this, identifier);
        this.__name = name;
        this.__address = address;
        this.__terminal = terminal
    };
    ns.Class(Identifier, str, [ID]);
    Identifier.prototype.getName = function() {
        return this.__name
    };
    Identifier.prototype.getAddress = function() {
        return this.__address
    };
    Identifier.prototype.getTerminal = function() {
        return this.__terminal
    };
    Identifier.prototype.getType = function() {
        return this.getAddress().getNetwork()
    };
    Identifier.prototype.isBroadcast = function() {
        return this.getAddress().isBroadcast()
    };
    Identifier.prototype.isUser = function() {
        return this.getAddress().isUser()
    };
    Identifier.prototype.isGroup = function() {
        return this.getAddress().isGroup()
    };
    ns.mkm.Identifier = Identifier;
    ns.mkm.registers("Identifier")
})(MingKeMing);
(function(ns) {
    var obj = ns.type.Object;
    var Address = ns.protocol.Address;
    var ID = ns.protocol.ID;
    var Identifier = ns.mkm.Identifier;
    var concat = function(name, address, terminal) {
        var string = address.toString();
        if (name && name.length > 0) {
            string = name + "@" + string
        }
        if (terminal && terminal.length > 0) {
            string = string + "/" + terminal
        }
        return string
    };
    var parse = function(string) {
        var name, address, terminal;
        var pair = string.split("/");
        if (pair.length === 1) {
            terminal = null
        } else {
            terminal = pair[1]
        }
        pair = pair[0].split("@");
        if (pair.length === 1) {
            name = null;
            address = Address.parse(pair[0])
        } else {
            name = pair[0];
            address = Address.parse(pair[1])
        }
        return new Identifier(string, name, address, terminal)
    };
    var IDFactory = function() {
        obj.call(this);
        this.__identifiers = {}
    };
    ns.Class(IDFactory, obj, [ID.Factory]);
    IDFactory.prototype.createID = function(name, address, terminal) {
        var string = concat(name, address, terminal);
        var id = this.__identifiers[string];
        if (!id) {
            id = new Identifier(string, name, address, terminal);
            this.__identifiers[string] = id
        }
        return id
    };
    IDFactory.prototype.parseID = function(identifier) {
        var id = this.__identifiers[identifier];
        if (!id) {
            id = parse(identifier);
            if (id) {
                this.__identifiers[identifier] = id
            }
        }
        return id
    };
    ns.mkm.IDFactory = IDFactory;
    ns.mkm.registers("IDFactory")
})(MingKeMing);
(function(ns) {
    var str = ns.type.String;
    var NetworkType = ns.protocol.NetworkType;
    var Address = ns.protocol.Address;
    var BroadcastAddress = function(string, network) {
        str.call(this, string);
        if (network instanceof NetworkType) {
            network = network.valueOf()
        }
        this.__network = network
    };
    ns.Class(BroadcastAddress, str, [Address]);
    BroadcastAddress.prototype.getNetwork = function() {
        return this.__network
    };
    BroadcastAddress.prototype.isBroadcast = function() {
        return true
    };
    BroadcastAddress.prototype.isUser = function() {
        return NetworkType.isUser(this.__network)
    };
    BroadcastAddress.prototype.isGroup = function() {
        return NetworkType.isGroup(this.__network)
    };
    Address.ANYWHERE = new BroadcastAddress("anywhere", NetworkType.MAIN);
    Address.EVERYWHERE = new BroadcastAddress("everywhere", NetworkType.GROUP);
    ns.mkm.BroadcastAddress = BroadcastAddress;
    ns.mkm.registers("BroadcastAddress")
})(MingKeMing);
(function(ns) {
    var obj = ns.type.Object;
    var Address = ns.protocol.Address;
    var AddressFactory = function() {
        obj.call(this);
        this.__addresses = {};
        this.__addresses[Address.ANYWHERE.toString()] = Address.ANYWHERE;
        this.__addresses[Address.EVERYWHERE.toString()] = Address.EVERYWHERE
    };
    ns.Class(AddressFactory, obj, [Address.Factory]);
    AddressFactory.prototype.parseAddress = function(string) {
        var address = this.__addresses[string];
        if (!address) {
            address = this.createAddress(string);
            if (address) {
                this.__addresses[string] = address
            }
        }
        return address
    };
    AddressFactory.prototype.createAddress = function(address) {
        console.assert(false, "implement me!");
        return null
    };
    ns.mkm.AddressFactory = AddressFactory;
    ns.mkm.registers("AddressFactory")
})(MingKeMing);
(function(ns) {
    var ID = ns.protocol.ID;
    var Address = ns.protocol.Address;
    var IDFactory = ns.mkm.IDFactory;
    var factory = new IDFactory();
    ID.setFactory(factory);
    ID.ANYONE = factory.createID("anyone", Address.ANYWHERE, null);
    ID.EVERYONE = factory.createID("everyone", Address.EVERYWHERE, null);
    ID.FOUNDER = factory.createID("moky", Address.ANYWHERE, null)
})(MingKeMing);
(function(ns) {
    var Dictionary = ns.type.Dictionary;
    var PublicKey = ns.crypto.PublicKey;
    var MetaType = ns.protocol.MetaType;
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var BaseMeta = function() {
        var type, key, seed, fingerprint;
        var meta, status;
        if (arguments.length === 1) {
            meta = arguments[0];
            type = Meta.getType(meta);
            key = Meta.getKey(meta);
            seed = Meta.getSeed(meta);
            fingerprint = Meta.getFingerprint(meta);
            status = 0
        } else {
            if (arguments.length === 2) {
                type = arguments[0];
                key = arguments[1];
                seed = null;
                fingerprint = null;
                if (type instanceof MetaType) {
                    type = type.valueOf()
                }
                meta = {
                    "type": type,
                    "key": key.getMap()
                };
                status = 1
            } else {
                if (arguments.length === 4) {
                    type = arguments[0];
                    key = arguments[1];
                    seed = arguments[2];
                    fingerprint = arguments[3];
                    if (type instanceof MetaType) {
                        type = type.valueOf()
                    }
                    meta = {
                        "type": type,
                        "key": key.getMap(),
                        "seed": seed,
                        "fingerprint": ns.format.Base64.encode(fingerprint)
                    };
                    status = 1
                } else {
                    throw new SyntaxError("meta arguments error: " + arguments)
                }
            }
        }
        Dictionary.call(this, meta);
        this.__type = type;
        this.__key = key;
        this.__seed = seed;
        this.__fingerprint = fingerprint;
        this.__status = status
    };
    ns.Class(BaseMeta, Dictionary, [Meta]);
    BaseMeta.prototype.getType = function() {
        return this.__type
    };
    BaseMeta.prototype.getKey = function() {
        return this.__key
    };
    BaseMeta.prototype.getSeed = function() {
        return this.__seed
    };
    BaseMeta.prototype.getFingerprint = function() {
        return this.__fingerprint
    };
    BaseMeta.prototype.isValid = function() {
        if (this.__status === 0) {
            if (!this.__key) {
                this.__status = -1
            } else {
                if (MetaType.hasSeed(this.__type)) {
                    if (!this.__seed || !this.__fingerprint) {
                        this.__status = -1
                    } else {
                        if (this.__key.verify(ns.format.UTF8.encode(this.__seed), this.__fingerprint)) {
                            this.__status = 1
                        } else {
                            this.__status = -1
                        }
                    }
                } else {
                    this.__status = 1
                }
            }
        }
        return this.__status === 1
    };
    BaseMeta.prototype.generateAddress = function(network) {
        console.assert(false, "implement me!");
        return null
    };
    BaseMeta.prototype.generateID = function(type, terminal) {
        var address = this.generateAddress(type);
        if (!address) {
            return null
        }
        return ID.create(this.getSeed(), address, terminal)
    };
    BaseMeta.prototype.matches = function(id_or_key) {
        if (!this.isValid()) {
            return false
        }
        if (ns.Interface.conforms(id_or_key, ID)) {
            return match_identifier.call(this, id_or_key)
        } else {
            if (ns.Interface.conforms(id_or_key, PublicKey)) {
                return match_public_key.call(this, id_or_key)
            }
        }
        return false
    };
    var match_identifier = function(identifier) {
        if (MetaType.hasSeed(this.__type)) {
            if (identifier.getName() !== this.__seed) {
                return false
            }
        }
        var address = this.generateAddress(identifier.getType());
        return identifier.getAddress().equals(address)
    };
    var match_public_key = function(publicKey) {
        if (this.__key.equals(publicKey)) {
            return true
        }
        if (MetaType.hasSeed(this.__type)) {
            var data = ns.format.UTF8.encode(this.__seed);
            var signature = this.__fingerprint;
            return publicKey.verify(data, signature)
        } else {
            return false
        }
    };
    ns.mkm.BaseMeta = BaseMeta;
    ns.mkm.registers("BaseMeta")
})(MingKeMing);
(function(ns) {
    var Dictionary = ns.type.Dictionary;
    var Document = ns.protocol.Document;
    var BaseDocument = function() {
        var identifier, data, signature;
        var map, status;
        var properties;
        if (arguments.length === 1) {
            map = arguments[0];
            identifier = Document.getIdentifier(map);
            data = Document.getData(map);
            signature = Document.getSignature(map);
            properties = null;
            status = 0
        } else {
            if (arguments.length === 2) {
                identifier = arguments[0];
                var type = arguments[1];
                data = null;
                signature = null;
                map = {
                    "ID": identifier.toString()
                };
                if (type && type.length > 1) {
                    properties = {
                        "type": type
                    }
                } else {
                    properties = null
                }
                status = 0
            } else {
                if (arguments.length === 3) {
                    identifier = arguments[0];
                    data = arguments[1];
                    signature = arguments[2];
                    map = {
                        "ID": identifier.toString(),
                        "data": ns.format.UTF8.decode(data),
                        "signature": ns.format.Base64.encode(signature)
                    };
                    properties = null;
                    status = 1
                } else {
                    throw new SyntaxError("document arguments error: " + arguments)
                }
            }
        }
        Dictionary.call(this, map);
        this.__identifier = identifier;
        this.__data = data;
        this.__signature = signature;
        this.__properties = properties;
        this.__status = status
    };
    ns.Class(BaseDocument, Dictionary, [Document]);
    BaseDocument.prototype.isValid = function() {
        return this.__status > 0
    };
    BaseDocument.prototype.getType = function() {
        var type = this.getProperty("type");
        if (!type) {
            type = Document.getType(this.getMap())
        }
        return type
    };
    BaseDocument.prototype.getIdentifier = function() {
        return this.__identifier
    };
    BaseDocument.prototype.allPropertyNames = function() {
        var dict = this.getProperties();
        if (!dict) {
            return null
        }
        return Object.keys(dict)
    };
    BaseDocument.prototype.getProperties = function() {
        if (this.__status < 0) {
            return null
        }
        if (!this.__properties) {
            var data = this.__data;
            if (data) {
                this.__properties = ns.format.JSON.decode(data)
            } else {
                this.__properties = {}
            }
        }
        return this.__properties
    };
    BaseDocument.prototype.getProperty = function(name) {
        var dict = this.getProperties();
        if (!dict) {
            return null
        }
        return dict[name]
    };
    BaseDocument.prototype.setProperty = function(name, value) {
        this.__status = 0;
        var dict = this.getProperties();
        dict[name] = value;
        this.setValue("data", null);
        this.setValue("signature", null);
        this.__data = null;
        this.__signature = null
    };
    BaseDocument.prototype.verify = function(publicKey) {
        if (this.__status > 0) {
            return true
        }
        var data = this.__data;
        var signature = this.__signature;
        if (!data) {
            if (!signature) {
                this.__status = 0
            } else {
                this.__status = -1
            }
        } else {
            if (!signature) {
                this.__status = -1
            } else {
                if (publicKey.verify(data, signature)) {
                    this.__status = 1
                }
            }
        }
        return this.__status > 0
    };
    BaseDocument.prototype.sign = function(privateKey) {
        if (this.__status > 0) {
            return this.__signature
        }
        var now = new Date();
        this.setProperty("time", now.getTime() / 1000);
        this.__status = 1;
        this.__data = ns.format.JSON.encode(this.getProperties());
        this.__signature = privateKey.sign(this.__data);
        this.setValue("data", ns.format.UTF8.decode(this.__data));
        this.setValue("signature", ns.format.Base64.encode(this.__signature));
        return this.__signature
    };
    BaseDocument.prototype.getTime = function() {
        var timestamp = this.getProperty("time");
        if (timestamp) {
            return new Date(timestamp * 1000)
        } else {
            return null
        }
    };
    BaseDocument.prototype.getName = function() {
        return this.getProperty("name")
    };
    BaseDocument.prototype.setName = function(name) {
        this.setProperty("name", name)
    };
    ns.mkm.BaseDocument = BaseDocument;
    ns.mkm.registers("BaseDocument")
})(MingKeMing);
(function(ns) {
    var EncryptKey = ns.crypto.EncryptKey;
    var PublicKey = ns.crypto.PublicKey;
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var Visa = ns.protocol.Visa;
    var BaseDocument = ns.mkm.BaseDocument;
    var BaseVisa = function() {
        if (arguments.length === 3) {
            BaseDocument.call(this, arguments[0], arguments[1], arguments[2])
        } else {
            if (ns.Interface.conforms(arguments[0], ID)) {
                BaseDocument.call(this, arguments[0], Document.VISA)
            } else {
                if (arguments.length === 1) {
                    BaseDocument.call(this, arguments[0])
                }
            }
        }
        this.__key = null
    };
    ns.Class(BaseVisa, BaseDocument, [Visa]);
    BaseVisa.prototype.getKey = function() {
        if (!this.__key) {
            var key = this.getProperty("key");
            if (key) {
                key = PublicKey.parse(key);
                if (ns.Interface.conforms(key, EncryptKey)) {
                    this.__key = key
                }
            }
        }
        return this.__key
    };
    BaseVisa.prototype.setKey = function(publicKey) {
        this.setProperty("key", publicKey.getMap());
        this.__key = publicKey
    };
    BaseVisa.prototype.getAvatar = function() {
        return this.getProperty("avatar")
    };
    BaseVisa.prototype.setAvatar = function(url) {
        this.setProperty("avatar", url)
    };
    ns.mkm.BaseVisa = BaseVisa;
    ns.mkm.registers("BaseVisa")
})(MingKeMing);
(function(ns) {
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var Bulletin = ns.protocol.Bulletin;
    var BaseDocument = ns.mkm.BaseDocument;
    var BaseBulletin = function() {
        if (arguments.length === 3) {
            BaseDocument.call(this, arguments[0], arguments[1], arguments[2])
        } else {
            if (ns.Interface.conforms(arguments[0], ID)) {
                BaseDocument.call(this, arguments[0], Document.BULLETIN)
            } else {
                if (arguments.length === 1) {
                    BaseDocument.call(this, arguments[0])
                }
            }
        }
        this.__assistants = null
    };
    ns.Class(BaseBulletin, BaseDocument, [Bulletin]);
    BaseBulletin.prototype.getAssistants = function() {
        if (!this.__assistants) {
            var assistants = this.getProperty("assistants");
            if (assistants) {
                this.__assistants = ID.convert(assistants)
            }
        }
        return this.__assistants
    };
    BaseBulletin.prototype.setAssistants = function(assistants) {
        if (assistants && assistants.length > 0) {
            this.setProperty("assistants", ID.revert(assistants))
        } else {
            this.setProperty("assistants", null)
        }
    };
    ns.mkm.BaseBulletin = BaseBulletin;
    ns.mkm.registers("BaseBulletin")
})(MingKeMing);
if (typeof DaoKeDao !== "object") {
    DaoKeDao = new MingKeMing.Namespace()
}
(function(ns, base) {
    base.exports(ns);
    if (typeof ns.protocol !== "object") {
        ns.protocol = new ns.Namespace()
    }
    if (typeof ns.dkd !== "object") {
        ns.dkd = new ns.Namespace()
    }
    ns.registers("protocol");
    ns.registers("dkd")
})(DaoKeDao, MingKeMing);
(function(ns) {
    var ContentType = ns.type.Enum(null, {
        TEXT: (1),
        FILE: (16),
        IMAGE: (18),
        AUDIO: (20),
        VIDEO: (22),
        PAGE: (32),
        QUOTE: (55),
        MONEY: (64),
        TRANSFER: (65),
        LUCKY_MONEY: (66),
        CLAIM_PAYMENT: (72),
        SPLIT_BILL: (73),
        COMMAND: (136),
        HISTORY: (137),
        FORWARD: (255)
    });
    ns.protocol.ContentType = ContentType;
    ns.protocol.registers("ContentType")
})(DaoKeDao);
(function(ns) {
    var map = ns.type.Map;
    var ID = ns.protocol.ID;
    var Content = function() {};
    ns.Interface(Content, [map]);
    Content.prototype.getType = function() {
        console.assert(false, "implement me!");
        return 0
    };
    Content.getType = function(content) {
        return content["type"]
    };
    Content.prototype.getSerialNumber = function() {
        console.assert(false, "implement me!");
        return 0
    };
    Content.getSerialNumber = function(content) {
        return content["sn"]
    };
    Content.prototype.getTime = function() {
        console.assert(false, "implement me!");
        return null
    };
    Content.getTime = function(content) {
        var timestamp = content["time"];
        if (timestamp) {
            return new Date(timestamp * 1000)
        } else {
            return null
        }
    };
    Content.prototype.getGroup = function() {
        console.assert(false, "implement me!");
        return null
    };
    Content.prototype.setGroup = function(identifier) {
        console.assert(false, "implement me!")
    };
    Content.getGroup = function(content) {
        return ID.parse(content["group"])
    };
    Content.setGroup = function(group, content) {
        if (group) {
            content["group"] = group.toString()
        } else {
            delete content["group"]
        }
    };
    ns.protocol.Content = Content;
    ns.protocol.registers("Content")
})(DaoKeDao);
(function(ns) {
    var map = ns.type.Map;
    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var ContentFactory = function() {};
    ns.Interface(ContentFactory, null);
    ContentFactory.prototype.parseContent = function(content) {
        console.assert(false, "implement me!");
        return null
    };
    Content.Factory = ContentFactory;
    var s_factories = {};
    Content.register = function(type, factory) {
        if (type instanceof ContentType) {
            type = type.valueOf()
        }
        s_factories[type] = factory
    };
    Content.getFactory = function(type) {
        if (type instanceof ContentType) {
            type = type.valueOf()
        }
        return s_factories[type]
    };
    Content.parse = function(content) {
        if (!content) {
            return null
        } else {
            if (ns.Interface.conforms(content, Content)) {
                return content
            } else {
                if (ns.Interface.conforms(content, map)) {
                    content = content.getMap()
                }
            }
        }
        var type = Content.getType(content);
        var factory = Content.getFactory(type);
        if (!factory) {
            factory = Content.getFactory(0)
        }
        return factory.parseContent(content)
    }
})(DaoKeDao);
(function(ns) {
    var map = ns.type.Map;
    var ID = ns.protocol.ID;
    var ContentType = ns.protocol.ContentType;
    var Envelope = function() {};
    ns.Interface(Envelope, [map]);
    Envelope.prototype.getSender = function() {
        console.assert(false, "implement me!");
        return null
    };
    Envelope.getSender = function(env) {
        return ns.protocol.ID.parse(env["sender"])
    };
    Envelope.prototype.getReceiver = function() {
        console.assert(false, "implement me!");
        return null
    };
    Envelope.getReceiver = function(env) {
        return ID.parse(env["receiver"])
    };
    Envelope.prototype.getTime = function() {
        console.assert(false, "implement me!");
        return null
    };
    Envelope.getTime = function(env) {
        var timestamp = env["time"];
        if (timestamp) {
            return new Date(timestamp * 1000)
        } else {
            return null
        }
    };
    Envelope.prototype.getGroup = function() {
        console.assert(false, "implement me!");
        return null
    };
    Envelope.prototype.setGroup = function(identifier) {
        console.assert(false, "implement me!")
    };
    Envelope.getGroup = function(env) {
        return ID.parse(env["group"])
    };
    Envelope.setGroup = function(group, env) {
        if (group) {
            env["group"] = group.toString()
        } else {
            delete env["group"]
        }
    };
    Envelope.prototype.getType = function() {
        console.assert(false, "implement me!");
        return null
    };
    Envelope.prototype.setType = function(type) {
        console.assert(false, "implement me!")
    };
    Envelope.getType = function(env) {
        var type = env["type"];
        if (type) {
            return type
        } else {
            return 0
        }
    };
    Envelope.setType = function(type, env) {
        if (type) {
            if (type instanceof ContentType) {
                type = type.valueOf()
            }
            env["type"] = type
        } else {
            delete env["type"]
        }
    };
    ns.protocol.Envelope = Envelope;
    ns.protocol.registers("Envelope")
})(DaoKeDao);
(function(ns) {
    var map = ns.type.Map;
    var Envelope = ns.protocol.Envelope;
    var EnvelopeFactory = function() {};
    ns.Interface(EnvelopeFactory, null);
    EnvelopeFactory.prototype.createEnvelope = function(from, to, when) {
        console.assert(false, "implement me!");
        return null
    };
    EnvelopeFactory.prototype.parseEnvelope = function(env) {
        console.assert(false, "implement me!");
        return null
    };
    Envelope.Factory = EnvelopeFactory;
    var s_factory = null;
    Envelope.getFactory = function() {
        return s_factory
    };
    Envelope.setFactory = function(factory) {
        s_factory = factory
    };
    Envelope.create = function(from, to, when) {
        return Envelope.getFactory().createEnvelope(from, to, when)
    };
    Envelope.parse = function(env) {
        if (!env) {
            return null
        } else {
            if (ns.Interface.conforms(env, Envelope)) {
                return env
            } else {
                if (ns.Interface.conforms(env, map)) {
                    env = env.getMap()
                }
            }
        }
        return Envelope.getFactory().parseEnvelope(env)
    }
})(DaoKeDao);
(function(ns) {
    var map = ns.type.Map;
    var Envelope = ns.protocol.Envelope;
    var Message = function() {};
    ns.Interface(Message, [map]);
    Message.prototype.getDelegate = function() {
        console.assert(false, "implement me!");
        return null
    };
    Message.prototype.setDelegate = function(delegate) {
        console.assert(false, "implement me!")
    };
    Message.prototype.getEnvelope = function() {
        console.assert(false, "implement me!");
        return null
    };
    Message.getEnvelope = function(msg) {
        return Envelope.parse(msg)
    };
    Message.prototype.getSender = function() {
        console.assert(false, "implement me!");
        return null
    };
    Message.prototype.getReceiver = function() {
        console.assert(false, "implement me!");
        return null
    };
    Message.prototype.getTime = function() {
        console.assert(false, "implement me!");
        return null
    };
    Message.prototype.getGroup = function() {
        console.assert(false, "implement me!");
        return null
    };
    Message.prototype.getType = function() {
        console.assert(false, "implement me!");
        return null
    };
    ns.protocol.Message = Message;
    ns.protocol.registers("Message")
})(DaoKeDao);
(function(ns) {
    var Message = ns.protocol.Message;
    var MessageDelegate = function() {};
    ns.Interface(MessageDelegate, null);
    Message.Delegate = MessageDelegate
})(DaoKeDao);
(function(ns) {
    var Content = ns.protocol.Content;
    var Message = ns.protocol.Message;
    var InstantMessage = function() {};
    ns.Interface(InstantMessage, [Message]);
    InstantMessage.prototype.getContent = function() {
        console.assert(false, "implement me!");
        return null
    };
    InstantMessage.getContent = function(msg) {
        return Content.parse(msg["content"])
    };
    InstantMessage.prototype.encrypt = function(password, members) {
        console.assert(false, "implement me!");
        return null
    };
    ns.protocol.InstantMessage = InstantMessage;
    ns.protocol.registers("InstantMessage")
})(DaoKeDao);
(function(ns) {
    var Message = ns.protocol.Message;
    var InstantMessage = ns.protocol.InstantMessage;
    var InstantMessageDelegate = function() {};
    ns.Interface(InstantMessageDelegate, [Message.Delegate]);
    InstantMessageDelegate.prototype.serializeContent = function(content, pwd, iMsg) {
        console.assert(false, "implement me!");
        return null
    };
    InstantMessageDelegate.prototype.encryptContent = function(data, pwd, iMsg) {
        console.assert(false, "implement me!");
        return null
    };
    InstantMessageDelegate.prototype.encodeData = function(data, iMsg) {
        console.assert(false, "implement me!");
        return null
    };
    InstantMessageDelegate.prototype.serializeKey = function(pwd, iMsg) {
        console.assert(false, "implement me!");
        return null
    };
    InstantMessageDelegate.prototype.encryptKey = function(data, receiver, iMsg) {
        console.assert(false, "implement me!");
        return null
    };
    InstantMessageDelegate.prototype.encodeKey = function(data, iMsg) {
        console.assert(false, "implement me!");
        return null
    };
    InstantMessage.Delegate = InstantMessageDelegate
})(DaoKeDao);
(function(ns) {
    var map = ns.type.Map;
    var InstantMessage = ns.protocol.InstantMessage;
    var InstantMessageFactory = function() {};
    ns.Interface(InstantMessageFactory, null);
    InstantMessageFactory.prototype.createInstantMessage = function(head, body) {
        console.assert(false, "implement me!");
        return null
    };
    InstantMessageFactory.prototype.parseInstantMessage = function(msg) {
        console.assert(false, "implement me!");
        return null
    };
    InstantMessage.Factory = InstantMessageFactory;
    var s_factory = null;
    InstantMessage.getFactory = function() {
        return s_factory
    };
    InstantMessage.setFactory = function(factory) {
        s_factory = factory
    };
    InstantMessage.create = function(head, body) {
        return InstantMessage.getFactory().createInstantMessage(head, body)
    };
    InstantMessage.parse = function(msg) {
        if (!msg) {
            return null
        } else {
            if (ns.Interface.conforms(msg, InstantMessage)) {
                return msg
            } else {
                if (ns.Interface.conforms(msg, map)) {
                    msg = msg.getMap()
                }
            }
        }
        return InstantMessage.getFactory().parseInstantMessage(msg)
    }
})(DaoKeDao);
(function(ns) {
    var Message = ns.protocol.Message;
    var SecureMessage = function() {};
    ns.Interface(SecureMessage, [Message]);
    SecureMessage.prototype.getData = function() {
        console.assert(false, "implement me!");
        return null
    };
    SecureMessage.prototype.getEncryptedKey = function() {
        console.assert(false, "implement me!");
        return null
    };
    SecureMessage.prototype.getEncryptedKeys = function() {
        console.assert(false, "implement me!");
        return null
    };
    SecureMessage.prototype.decrypt = function() {
        console.assert(false, "implement me!");
        return null
    };
    SecureMessage.prototype.sign = function() {
        console.assert(false, "implement me!");
        return null
    };
    SecureMessage.prototype.split = function(members) {
        console.assert(false, "implement me!");
        return null
    };
    SecureMessage.prototype.trim = function(member) {
        console.assert(false, "implement me!");
        return null
    };
    ns.protocol.SecureMessage = SecureMessage;
    ns.protocol.registers("SecureMessage")
})(DaoKeDao);
(function(ns) {
    var Message = ns.protocol.Message;
    var SecureMessage = ns.protocol.SecureMessage;
    var SecureMessageDelegate = function() {};
    ns.Interface(SecureMessageDelegate, [Message.Delegate]);
    SecureMessageDelegate.prototype.decodeKey = function(key, sMsg) {
        console.assert(false, "implement me!");
        return null
    };
    SecureMessageDelegate.prototype.decryptKey = function(data, sender, receiver, sMsg) {
        console.assert(false, "implement me!");
        return null
    };
    SecureMessageDelegate.prototype.deserializeKey = function(data, sender, receiver, sMsg) {
        console.assert(false, "implement me!");
        return null
    };
    SecureMessageDelegate.prototype.decodeData = function(data, sMsg) {
        console.assert(false, "implement me!");
        return null
    };
    SecureMessageDelegate.prototype.decryptContent = function(data, pwd, sMsg) {
        console.assert(false, "implement me!");
        return null
    };
    SecureMessageDelegate.prototype.deserializeContent = function(data, pwd, sMsg) {
        console.assert(false, "implement me!");
        return null
    };
    SecureMessageDelegate.prototype.signData = function(data, sender, sMsg) {
        console.assert(false, "implement me!");
        return null
    };
    SecureMessageDelegate.prototype.encodeSignature = function(signature, sMsg) {
        console.assert(false, "implement me!");
        return null
    };
    SecureMessage.Delegate = SecureMessageDelegate
})(DaoKeDao);
(function(ns) {
    var map = ns.type.Map;
    var SecureMessage = ns.protocol.SecureMessage;
    var SecureMessageFactory = function() {};
    ns.Interface(SecureMessageFactory, null);
    SecureMessageFactory.prototype.parseSecureMessage = function(msg) {
        console.assert(false, "implement me!");
        return null
    };
    SecureMessage.Factory = SecureMessageFactory;
    var s_factory = null;
    SecureMessage.getFactory = function() {
        return s_factory
    };
    SecureMessage.setFactory = function(factory) {
        s_factory = factory
    };
    SecureMessage.parse = function(msg) {
        if (!msg) {
            return null
        } else {
            if (ns.Interface.conforms(msg, SecureMessage)) {
                return msg
            } else {
                if (ns.Interface.conforms(msg, map)) {
                    msg = msg.getMap()
                }
            }
        }
        return SecureMessage.getFactory().parseSecureMessage(msg)
    }
})(DaoKeDao);
(function(ns) {
    var map = ns.type.Map;
    var Meta = ns.protocol.Meta;
    var Document = ns.protocol.Document;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = function() {};
    ns.Interface(ReliableMessage, [SecureMessage]);
    ReliableMessage.prototype.getSignature = function() {
        console.assert(false, "implement me!");
        return null
    };
    ReliableMessage.prototype.getMeta = function() {
        console.assert(false, "implement me!");
        return null
    };
    ReliableMessage.prototype.setMeta = function(meta) {
        console.assert(false, "implement me!");
        return null
    };
    ReliableMessage.getMeta = function(msg) {
        return Meta.parse(msg["meta"])
    };
    ReliableMessage.setMeta = function(meta, msg) {
        if (meta) {
            msg["meta"] = meta.getMap()
        } else {
            delete msg["meta"]
        }
    };
    ReliableMessage.prototype.getVisa = function() {
        console.assert(false, "implement me!");
        return null
    };
    ReliableMessage.prototype.setVisa = function(doc) {
        console.assert(false, "implement me!");
        return null
    };
    ReliableMessage.getVisa = function(msg) {
        var doc = msg["visa"];
        if (!doc) {
            doc = msg["profile"]
        }
        return Document.parse(doc)
    };
    ReliableMessage.setVisa = function(doc, msg) {
        delete msg["visa"];
        if (doc) {
            msg["profile"] = doc.getMap()
        } else {
            delete msg["profile"]
        }
    };
    ReliableMessage.prototype.verify = function() {
        console.assert(false, "implement me!");
        return null
    };
    ns.protocol.ReliableMessage = ReliableMessage;
    ns.protocol.registers("ReliableMessage")
})(DaoKeDao);
(function(ns) {
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var ReliableMessageDelegate = function() {};
    ns.Interface(ReliableMessageDelegate, [SecureMessage.Delegate]);
    ReliableMessageDelegate.prototype.decodeSignature = function(signature, rMsg) {
        console.assert(false, "implement me!");
        return null
    };
    ReliableMessageDelegate.prototype.verifyDataSignature = function(data, signature, sender, rMsg) {
        console.assert(false, "implement me!");
        return false
    };
    ReliableMessage.Delegate = ReliableMessageDelegate
})(DaoKeDao);
(function(ns) {
    var map = ns.type.Map;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var ReliableMessageFactory = function() {};
    ns.Interface(ReliableMessageFactory, null);
    ReliableMessageFactory.prototype.parseReliableMessage = function(msg) {
        console.assert(false, "implement me!");
        return null
    };
    ReliableMessage.Factory = ReliableMessageFactory;
    var s_factory = null;
    ReliableMessage.getFactory = function() {
        return s_factory
    };
    ReliableMessage.setFactory = function(factory) {
        s_factory = factory
    };
    ReliableMessage.parse = function(msg) {
        if (!msg) {
            return null
        } else {
            if (ns.Interface.conforms(msg, ReliableMessage)) {
                return msg
            } else {
                if (ns.Interface.conforms(msg, map)) {
                    msg = msg.getMap()
                }
            }
        }
        return ReliableMessage.getFactory().parseReliableMessage(msg)
    }
})(DaoKeDao);
(function(ns) {
    var Dictionary = ns.type.Dictionary;
    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var MAX_LONG = 4294967295;
    var randomPositiveInteger = function() {
        var sn = Math.ceil(Math.random() * MAX_LONG);
        if (sn > 0) {
            return sn
        } else {
            if (sn < 0) {
                return -sn
            }
        }
        return 9527 + 9394
    };
    var BaseContent = function(info) {
        var content, type, sn, time;
        if (info instanceof ContentType) {
            type = info.valueOf();
            sn = null;
            time = null;
            content = {
                "type": type
            }
        } else {
            if (typeof info === "number") {
                type = info;
                sn = null;
                time = null;
                content = {
                    "type": type
                }
            } else {
                content = info;
                type = Content.getType(content);
                sn = Content.getSerialNumber(content);
                time = Content.getTime(content)
            }
        }
        if (!sn) {
            sn = randomPositiveInteger();
            content["sn"] = sn
        }
        if (!time) {
            time = new Date();
            content["time"] = time.getTime() / 1000
        }
        Dictionary.call(this, content);
        this.__type = type;
        this.__sn = sn;
        this.__time = time
    };
    ns.Class(BaseContent, Dictionary, [Content]);
    BaseContent.prototype.getType = function() {
        return this.__type
    };
    BaseContent.prototype.getSerialNumber = function() {
        return this.__sn
    };
    BaseContent.prototype.getTime = function() {
        return this.__time
    };
    BaseContent.prototype.getGroup = function() {
        return Content.getGroup(this.getMap())
    };
    BaseContent.prototype.setGroup = function(identifier) {
        Content.setGroup(identifier, this.getMap())
    };
    ns.dkd.BaseContent = BaseContent;
    ns.dkd.registers("BaseContent")
})(DaoKeDao);
(function(ns) {
    var Dictionary = ns.type.Dictionary;
    var Envelope = ns.protocol.Envelope;
    var MessageEnvelope = function() {
        var from, to, when;
        var env;
        if (arguments.length === 1) {
            env = arguments[0];
            from = Envelope.getSender(env);
            to = Envelope.getReceiver(env);
            when = Envelope.getTime(env)
        } else {
            if (arguments.length === 2) {
                from = arguments[0];
                to = arguments[1];
                when = new Date();
                env = {
                    "sender": from.toString(),
                    "receiver": to.toString(),
                    "time": Math.ceil(when.getTime() / 1000)
                }
            } else {
                if (arguments.length === 3) {
                    from = arguments[0];
                    to = arguments[1];
                    if (arguments[2] instanceof Date) {
                        when = arguments[2]
                    } else {
                        when = new Date(arguments[2] * 1000)
                    }
                    env = {
                        "sender": from.toString(),
                        "receiver": to.toString(),
                        "time": Math.ceil(when.getTime() / 1000)
                    }
                } else {
                    throw new SyntaxError("envelope arguments error: " + arguments)
                }
            }
        }
        Dictionary.call(this, env);
        this.__sender = from;
        this.__receiver = to;
        this.__time = when
    };
    ns.Class(MessageEnvelope, Dictionary, [Envelope]);
    MessageEnvelope.prototype.getSender = function() {
        return this.__sender
    };
    MessageEnvelope.prototype.getReceiver = function() {
        return this.__receiver
    };
    MessageEnvelope.prototype.getTime = function() {
        return this.__time
    };
    MessageEnvelope.prototype.getGroup = function() {
        return Envelope.getGroup(this.getMap())
    };
    MessageEnvelope.prototype.setGroup = function(identifier) {
        Envelope.setGroup(identifier, this.getMap())
    };
    MessageEnvelope.prototype.getType = function() {
        return Envelope.getType(this.getMap())
    };
    MessageEnvelope.prototype.setType = function(type) {
        Envelope.setType(type, this.getMap())
    };
    ns.dkd.MessageEnvelope = MessageEnvelope;
    ns.dkd.registers("MessageEnvelope")
})(DaoKeDao);
(function(ns) {
    var Dictionary = ns.type.Dictionary;
    var Envelope = ns.protocol.Envelope;
    var Message = ns.protocol.Message;
    var BaseMessage = function(msg) {
        var env;
        if (ns.Interface.conforms(msg, Envelope)) {
            env = msg;
            msg = env.getMap()
        } else {
            env = Message.getEnvelope(msg)
        }
        Dictionary.call(this, msg);
        this.__envelope = env;
        this.__delegate = null
    };
    ns.Class(BaseMessage, Dictionary, [Message]);
    BaseMessage.prototype.getDelegate = function() {
        return this.__delegate
    };
    BaseMessage.prototype.setDelegate = function(delegate) {
        this.__delegate = delegate
    };
    BaseMessage.prototype.getEnvelope = function() {
        return this.__envelope
    };
    BaseMessage.prototype.getSender = function() {
        return this.getEnvelope().getSender()
    };
    BaseMessage.prototype.getReceiver = function() {
        return this.getEnvelope().getReceiver()
    };
    BaseMessage.prototype.getTime = function() {
        return this.getEnvelope().getTime()
    };
    BaseMessage.prototype.getGroup = function() {
        return this.getEnvelope().getGroup()
    };
    BaseMessage.prototype.getType = function() {
        return this.getEnvelope().getTime()
    };
    ns.dkd.BaseMessage = BaseMessage;
    ns.dkd.registers("BaseMessage")
})(DaoKeDao);
(function(ns) {
    var Message = ns.protocol.Message;
    var InstantMessage = ns.protocol.InstantMessage;
    var SecureMessage = ns.protocol.SecureMessage;
    var BaseMessage = ns.dkd.BaseMessage;
    var PlainMessage = function() {
        var msg, head, body;
        if (arguments.length === 1) {
            msg = arguments[0];
            head = Message.getEnvelope(msg);
            body = InstantMessage.getContent(msg)
        } else {
            if (arguments.length === 2) {
                head = arguments[0];
                body = arguments[1];
                msg = head.getMap();
                msg["content"] = body.getMap()
            } else {
                throw new SyntaxError("message arguments error: " + arguments)
            }
        }
        BaseMessage.call(this, msg);
        this.__envelope = head;
        this.__content = body
    };
    ns.Class(PlainMessage, BaseMessage, [InstantMessage]);
    PlainMessage.prototype.getContent = function() {
        return this.__content
    };
    PlainMessage.prototype.getTime = function() {
        var time = this.getContent().getTime();
        if (!time) {
            time = this.getEnvelope().getTime()
        }
        return time
    };
    PlainMessage.prototype.getGroup = function() {
        return this.getContent().getGroup()
    };
    PlainMessage.prototype.getType = function() {
        return this.getContent().getType()
    };
    PlainMessage.prototype.encrypt = function(password, members) {
        if (members && members.length > 0) {
            return encrypt_group_message.call(this, password, members)
        } else {
            return encrypt_message.call(this, password)
        }
    };
    var encrypt_message = function(password) {
        var delegate = this.getDelegate();
        var msg = prepare_data.call(this, password);
        var key = delegate.serializeKey(password, this);
        if (!key) {
            return SecureMessage.parse(msg)
        }
        var data = delegate.encryptKey(key, this.getReceiver(), this);
        if (!data) {
            return null
        }
        msg["key"] = delegate.encodeKey(data, this);
        return SecureMessage.parse(msg)
    };
    var encrypt_group_message = function(password, members) {
        var delegate = this.getDelegate();
        var msg = prepare_data.call(this, password);
        var key = delegate.serializeKey(password, this);
        if (!key) {
            return SecureMessage.parse(msg)
        }
        var keys = {};
        var count = 0;
        var member;
        var data;
        for (var i = 0; i < members.length; ++i) {
            member = members[i];
            data = delegate.encryptKey(key, member, this);
            if (!data) {
                continue
            }
            keys[member] = delegate.encodeKey(data, this);
            ++count
        }
        if (count > 0) {
            msg["keys"] = keys
        }
        return SecureMessage.parse(msg)
    };
    var prepare_data = function(password) {
        var delegate = this.getDelegate();
        var data = delegate.serializeContent(this.__content, password, this);
        data = delegate.encryptContent(data, password, this);
        var base64 = delegate.encodeData(data, this);
        var msg = this.copyMap();
        delete msg["content"];
        msg["data"] = base64;
        return msg
    };
    ns.dkd.PlainMessage = PlainMessage;
    ns.dkd.registers("PlainMessage")
})(DaoKeDao);
(function(ns) {
    var map = ns.type.Map;
    var InstantMessage = ns.protocol.InstantMessage;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var BaseMessage = ns.dkd.BaseMessage;
    var EncryptedMessage = function(msg) {
        BaseMessage.call(this, msg);
        this.__data = null;
        this.__key = null;
        this.__keys = null
    };
    ns.Class(EncryptedMessage, BaseMessage, [SecureMessage]);
    EncryptedMessage.prototype.getData = function() {
        if (!this.__data) {
            var base64 = this.getValue("data");
            this.__data = this.getDelegate().decodeData(base64, this)
        }
        return this.__data
    };
    EncryptedMessage.prototype.getEncryptedKey = function() {
        if (!this.__key) {
            var base64 = this.getValue("key");
            if (!base64) {
                var keys = this.getEncryptedKeys();
                if (keys) {
                    var receiver = this.getReceiver();
                    base64 = keys[receiver.toString()]
                }
            }
            if (base64) {
                this.__key = this.getDelegate().decodeKey(base64, this)
            }
        }
        return this.__key
    };
    EncryptedMessage.prototype.getEncryptedKeys = function() {
        if (!this.__keys) {
            this.__keys = this.getValue("keys")
        }
        return this.__keys
    };
    EncryptedMessage.prototype.decrypt = function() {
        var sender = this.getSender();
        var receiver;
        var group = this.getGroup();
        if (group) {
            receiver = group
        } else {
            receiver = this.getReceiver()
        }
        var delegate = this.getDelegate();
        var key = this.getEncryptedKey();
        if (key) {
            key = delegate.decryptKey(key, sender, receiver, this);
            if (!key) {
                throw new Error("failed to decrypt key in msg: " + this)
            }
        }
        var password = delegate.deserializeKey(key, sender, receiver, this);
        if (!password) {
            throw new Error("failed to get msg key: " + sender + " -> " + receiver + ", " + key)
        }
        var data = this.getData();
        if (!data) {
            throw new Error("failed to decode content data: " + this)
        }
        data = delegate.decryptContent(data, password, this);
        if (!data) {
            throw new Error("failed to decrypt data with key: " + password)
        }
        var content = delegate.deserializeContent(data, password, this);
        if (!content) {
            throw new Error("failed to deserialize content: " + data)
        }
        var msg = this.copyMap();
        delete msg["key"];
        delete msg["keys"];
        delete msg["data"];
        msg["content"] = content.getMap();
        return InstantMessage.parse(msg)
    };
    EncryptedMessage.prototype.sign = function() {
        var delegate = this.getDelegate();
        var signature = delegate.signData(this.getData(), this.getSender(), this);
        var base64 = delegate.encodeSignature(signature, this);
        var msg = this.copyMap();
        msg["signature"] = base64;
        return ReliableMessage.parse(msg)
    };
    EncryptedMessage.prototype.split = function(members) {
        var msg = this.copyMap();
        var keys = this.getEncryptedKeys();
        if (keys) {
            delete msg["keys"]
        } else {
            keys = {}
        }
        msg["group"] = this.getReceiver().toString();
        var messages = [];
        var base64;
        var item;
        var receiver;
        for (var i = 0; i < members.length; ++i) {
            receiver = members[i].toString();
            msg["receiver"] = receiver;
            base64 = keys[receiver];
            if (base64) {
                msg["key"] = base64
            } else {
                delete msg["key"]
            }
            item = SecureMessage.parse(map.copyMap(msg));
            if (item) {
                messages.push(item)
            }
        }
        return messages
    };
    EncryptedMessage.prototype.trim = function(member) {
        var msg = this.copyMap();
        var keys = this.getEncryptedKeys();
        if (keys) {
            var base64 = keys[member.toString()];
            if (base64) {
                msg["key"] = base64
            }
            delete msg["keys"]
        }
        var group = this.getGroup();
        if (!group) {
            msg["group"] = this.getReceiver().toString()
        }
        msg["receiver"] = member.toString();
        return SecureMessage.parse(msg)
    };
    ns.dkd.EncryptedMessage = EncryptedMessage;
    ns.dkd.registers("EncryptedMessage")
})(DaoKeDao);
(function(ns) {
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var EncryptedMessage = ns.dkd.EncryptedMessage;
    var NetworkMessage = function(msg) {
        EncryptedMessage.call(this, msg);
        this.__signature = null;
        this.__meta = null;
        this.__visa = null
    };
    ns.Class(NetworkMessage, EncryptedMessage, [ReliableMessage]);
    NetworkMessage.prototype.getSignature = function() {
        if (!this.__signature) {
            var base64 = this.getValue("signature");
            this.__signature = this.getDelegate().decodeSignature(base64, this)
        }
        return this.__signature
    };
    NetworkMessage.prototype.setMeta = function(meta) {
        ReliableMessage.setMeta(meta, this.getMap());
        this.__meta = meta
    };
    NetworkMessage.prototype.getMeta = function() {
        if (!this.__meta) {
            this.__meta = ReliableMessage.getMeta(this.getMap())
        }
        return this.__meta
    };
    NetworkMessage.prototype.setVisa = function(visa) {
        ReliableMessage.setVisa(visa, this.getMap());
        this.__visa = visa
    };
    NetworkMessage.prototype.getVisa = function() {
        if (!this.__visa) {
            this.__visa = ReliableMessage.getVisa(this.getMap())
        }
        return this.__visa
    };
    NetworkMessage.prototype.verify = function() {
        var data = this.getData();
        if (!data) {
            throw new Error("failed to decode content data: " + this)
        }
        var signature = this.getSignature();
        if (!signature) {
            throw new Error("failed to decode message signature: " + this)
        }
        if (this.getDelegate().verifyDataSignature(data, signature, this.getSender(), this)) {
            var msg = this.copyMap();
            delete msg["signature"];
            return SecureMessage.parse(msg)
        } else {
            return null
        }
    };
    ns.dkd.NetworkMessage = NetworkMessage;
    ns.dkd.registers("NetworkMessage")
})(DaoKeDao);
(function(ns) {
    var obj = ns.type.Object;
    var Envelope = ns.protocol.Envelope;
    var MessageEnvelope = ns.dkd.MessageEnvelope;
    var EnvelopeFactory = function() {
        obj.call(this)
    };
    ns.Class(EnvelopeFactory, obj, [Envelope.Factory]);
    EnvelopeFactory.prototype.createEnvelope = function(from, to, when) {
        if (!when) {
            when = new Date()
        }
        return new MessageEnvelope(from, to, when)
    };
    EnvelopeFactory.prototype.parseEnvelope = function(env) {
        if (!env || !env["sender"]) {
            return null
        }
        return new MessageEnvelope(env)
    };
    Envelope.setFactory(new EnvelopeFactory());
    ns.dkd.EnvelopeFactory = EnvelopeFactory;
    ns.dkd.registers("EnvelopeFactory")
})(DaoKeDao);
(function(ns) {
    var obj = ns.type.Object;
    var InstantMessage = ns.protocol.InstantMessage;
    var PlainMessage = ns.dkd.PlainMessage;
    var InstantMessageFactory = function() {
        obj.call(this)
    };
    ns.Class(InstantMessageFactory, obj, [InstantMessage.Factory]);
    InstantMessageFactory.prototype.createInstantMessage = function(head, body) {
        return new PlainMessage(head, body)
    };
    InstantMessageFactory.prototype.parseInstantMessage = function(msg) {
        return new PlainMessage(msg)
    };
    InstantMessage.setFactory(new InstantMessageFactory());
    ns.dkd.InstantMessageFactory = InstantMessageFactory;
    ns.dkd.registers("InstantMessageFactory")
})(DaoKeDao);
(function(ns) {
    var obj = ns.type.Object;
    var SecureMessage = ns.protocol.SecureMessage;
    var EncryptedMessage = ns.dkd.EncryptedMessage;
    var SecureMessageFactory = function() {
        obj.call(this)
    };
    ns.Class(SecureMessageFactory, obj, [SecureMessage.Factory]);
    SecureMessageFactory.prototype.parseSecureMessage = function(msg) {
        return new EncryptedMessage(msg)
    };
    SecureMessage.setFactory(new SecureMessageFactory());
    ns.dkd.SecureMessageFactory = SecureMessageFactory;
    ns.dkd.registers("SecureMessageFactory")
})(DaoKeDao);
(function(ns) {
    var obj = ns.type.Object;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var NetworkMessage = ns.dkd.NetworkMessage;
    var ReliableMessageFactory = function() {
        obj.call(this)
    };
    ns.Class(ReliableMessageFactory, obj, [ReliableMessage.Factory]);
    ReliableMessageFactory.prototype.parseReliableMessage = function(msg) {
        return new NetworkMessage(msg)
    };
    ReliableMessage.setFactory(new ReliableMessageFactory());
    ns.dkd.ReliableMessageFactory = ReliableMessageFactory;
    ns.dkd.registers("ReliableMessageFactory")
})(DaoKeDao);
if (typeof DIMP !== "object") {
    DIMP = new MingKeMing.Namespace()
}
(function(ns, base) {
    base.exports(ns);
    if (typeof ns.core !== "object") {
        ns.core = new ns.Namespace()
    }
    if (typeof ns.protocol !== "object") {
        ns.protocol = new ns.Namespace()
    }
    if (typeof ns.protocol.group !== "object") {
        ns.protocol.group = new ns.Namespace()
    }
    ns.registers("core");
    ns.registers("protocol");
    ns.protocol.registers("group")
})(DIMP, DaoKeDao);
(function(ns) {
    var ReliableMessage = ns.protocol.ReliableMessage;
    var ContentType = ns.protocol.ContentType;
    var BaseContent = ns.dkd.BaseContent;
    var ForwardContent = function() {
        if (arguments.length === 0) {
            BaseContent.call(this, ContentType.FORWARD);
            this.__forward = null
        } else {
            if (ns.Interface.conforms(arguments[0], ReliableMessage)) {
                BaseContent.call(this, ContentType.FORWARD);
                this.setMessage(arguments[0])
            } else {
                BaseContent.call(this, arguments[0]);
                this.__forward = null
            }
        }
    };
    ns.Class(ForwardContent, BaseContent, null);
    ForwardContent.getMessage = function(content) {
        var secret = content["forward"];
        if (secret) {
            return ReliableMessage.parse(secret)
        } else {
            return null
        }
    };
    ForwardContent.setMessage = function(secret, content) {
        if (secret) {
            content["forward"] = secret.getMap()
        } else {
            delete content["forward"]
        }
    };
    ForwardContent.prototype.getMessage = function() {
        if (!this.__forward) {
            this.__forward = ForwardContent.getMessage(this.getMap())
        }
        return this.__forward
    };
    ForwardContent.prototype.setMessage = function(secret) {
        ForwardContent.setMessage(secret, this.getMap());
        this.__forward = secret
    };
    ns.protocol.ForwardContent = ForwardContent;
    ns.protocol.registers("ForwardContent")
})(DaoKeDao);
(function(ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var ContentType = ns.protocol.ContentType;
    var BaseContent = ns.dkd.BaseContent;
    var FileContent = function() {
        if (arguments.length === 0) {
            BaseContent.call(this, ContentType.FILE);
            this.__data = null
        } else {
            if (arguments.length === 1) {
                BaseContent.call(this, arguments[0]);
                this.__data = null
            } else {
                if (arguments.length === 2) {
                    BaseContent.call(this, ContentType.FILE);
                    this.setFilename(arguments[0]);
                    this.setData(arguments[1])
                } else {
                    if (arguments.length === 3) {
                        BaseContent.call(this, arguments[0]);
                        this.setFilename(arguments[1]);
                        this.setData(arguments[2])
                    } else {
                        throw new SyntaxError("file content arguments error: " + arguments)
                    }
                }
            }
        }
        this.__password = null
    };
    ns.Class(FileContent, BaseContent, null);
    FileContent.getURL = function(content) {
        return content["URL"]
    };
    FileContent.setURL = function(url, content) {
        if (url && url.indexOf("://") > 0) {
            content["URL"] = url
        } else {
            delete content["URL"]
        }
    };
    FileContent.getFilename = function(content) {
        return content["filename"]
    };
    FileContent.setFilename = function(filename, content) {
        if (filename && filename.length > 0) {
            content["filename"] = filename
        } else {
            delete content["filename"]
        }
    };
    FileContent.getData = function(content) {
        var base64 = content["data"];
        if (base64 && base64.length > 0) {
            return ns.format.Base64.decode(base64)
        } else {
            return null
        }
    };
    FileContent.setData = function(data, content) {
        if (data && data.length > 0) {
            content["data"] = ns.format.Base64.encode(data)
        } else {
            delete content["data"]
        }
    };
    FileContent.getPassword = function(content) {
        var key = content["password"];
        if (key) {
            return SymmetricKey.parse(key)
        } else {
            return null
        }
    };
    FileContent.setPassword = function(key, content) {
        if (key) {
            content["password"] = key.getMap()
        } else {
            delete content["password"]
        }
    };
    FileContent.prototype.getURL = function() {
        return FileContent.getURL(this.getMap())
    };
    FileContent.prototype.setURL = function(url) {
        FileContent.setURL(url, this.getMap())
    };
    FileContent.prototype.getFilename = function() {
        return FileContent.getFilename(this.getMap())
    };
    FileContent.prototype.setFilename = function(filename) {
        FileContent.setFilename(filename, this.getMap())
    };
    FileContent.prototype.getData = function() {
        if (!this.__data) {
            this.__data = FileContent.getData(this.getMap())
        }
        return this.__data
    };
    FileContent.prototype.setData = function(data) {
        FileContent.setData(data, this.getMap());
        this.__data = data
    };
    FileContent.prototype.getPassword = function() {
        if (!this.__password) {
            this.__password = FileContent.getPassword(console)
        }
        return this.__password
    };
    FileContent.prototype.setPassword = function(key) {
        FileContent.setPassword(key, this.getMap());
        this.__password = key
    };
    ns.protocol.FileContent = FileContent;
    ns.protocol.registers("FileContent")
})(DIMP);
(function(ns) {
    var ContentType = ns.protocol.ContentType;
    var FileContent = ns.protocol.FileContent;
    var ImageContent = function() {
        if (arguments.length === 0) {
            FileContent.call(this, ContentType.IMAGE)
        } else {
            if (arguments.length === 1) {
                FileContent.call(this, arguments[0])
            } else {
                if (arguments.length === 2) {
                    FileContent.call(this, ContentType.IMAGE, arguments[0], arguments[1])
                } else {
                    throw new SyntaxError("image content arguments error: " + arguments)
                }
            }
        }
        this.__thumbnail = null
    };
    ns.Class(ImageContent, FileContent, null);
    ImageContent.getThumbnail = function(content) {
        var base64 = content["thumbnail"];
        if (base64) {
            return ns.format.Base64.decode(base64)
        } else {
            return null
        }
    };
    ImageContent.setThumbnail = function(image, content) {
        if (image && image.length > 0) {
            content["thumbnail"] = ns.format.Base64.encode(image)
        } else {
            delete content["thumbnail"]
        }
    };
    ImageContent.prototype.getThumbnail = function() {
        if (!this.__thumbnail) {
            this.__thumbnail = ImageContent.getThumbnail(this.getMap())
        }
        return this.__thumbnail
    };
    ImageContent.prototype.setThumbnail = function(image) {
        ImageContent.setThumbnail(image, this.getMap());
        this.__thumbnail = image
    };
    ns.protocol.ImageContent = ImageContent;
    ns.protocol.registers("ImageContent")
})(DIMP);
(function(ns) {
    var ContentType = ns.protocol.ContentType;
    var FileContent = ns.protocol.FileContent;
    var VideoContent = function() {
        if (arguments.length === 0) {
            FileContent.call(this, ContentType.VIDEO)
        } else {
            if (arguments.length === 1) {
                FileContent.call(this, arguments[0])
            } else {
                if (arguments.length === 2) {
                    FileContent.call(this, ContentType.VIDEO, arguments[0], arguments[1])
                } else {
                    throw new SyntaxError("video content arguments error: " + arguments)
                }
            }
        }
        this.__snapshot = null
    };
    ns.Class(VideoContent, FileContent, null);
    VideoContent.getSnapshot = function(content) {
        var base64 = content["snapshot"];
        if (base64) {
            return ns.format.Base64.decode(base64)
        } else {
            return null
        }
    };
    VideoContent.setSnapshot = function(image, content) {
        if (image && image.length > 0) {
            content["snapshot"] = ns.format.Base64.encode(image)
        } else {
            delete content["snapshot"]
        }
    };
    VideoContent.prototype.getSnapshot = function() {
        if (!this.__snapshot) {
            this.__snapshot = VideoContent.getSnapshot(this.getMap())
        }
        return this.__snapshot
    };
    VideoContent.prototype.setSnapshot = function(image) {
        VideoContent.setSnapshot(image, this.getMap());
        this.__snapshot = image
    };
    ns.protocol.VideoContent = VideoContent;
    ns.protocol.registers("VideoContent")
})(DIMP);
(function(ns) {
    var ContentType = ns.protocol.ContentType;
    var FileContent = ns.protocol.FileContent;
    var AudioContent = function() {
        if (arguments.length === 0) {
            FileContent.call(this, ContentType.AUDIO)
        } else {
            if (arguments.length === 1) {
                FileContent.call(this, arguments[0])
            } else {
                if (arguments.length === 2) {
                    FileContent.call(this, ContentType.AUDIO, arguments[0], arguments[1])
                } else {
                    throw new SyntaxError("audio content arguments error: " + arguments)
                }
            }
        }
    };
    ns.Class(AudioContent, FileContent, null);
    AudioContent.prototype.getText = function() {
        return this.getValue("text")
    };
    AudioContent.prototype.setText = function(asr) {
        this.setValue("text", asr)
    };
    ns.protocol.AudioContent = AudioContent;
    ns.protocol.registers("AudioContent")
})(DIMP);
(function(ns) {
    var ContentType = ns.protocol.ContentType;
    var BaseContent = ns.dkd.BaseContent;
    var TextContent = function() {
        if (arguments.length === 0) {
            BaseContent.call(this, ContentType.TEXT)
        } else {
            if (typeof arguments[0] === "string") {
                BaseContent.call(this, ContentType.TEXT);
                this.setText(arguments[0])
            } else {
                BaseContent.call(this, arguments[0])
            }
        }
    };
    ns.Class(TextContent, BaseContent, null);
    TextContent.prototype.getText = function() {
        return this.getValue("text")
    };
    TextContent.prototype.setText = function(text) {
        this.setValue("text", text)
    };
    ns.protocol.TextContent = TextContent;
    ns.protocol.registers("TextContent")
})(DIMP);
(function(ns) {
    var ContentType = ns.protocol.ContentType;
    var BaseContent = ns.dkd.BaseContent;
    var PageContent = function() {
        if (arguments.length === 1) {
            BaseContent.call(this, arguments[0]);
            this.__icon = null
        } else {
            if (arguments.length === 4) {
                BaseContent.call(this, ContentType.PAGE);
                this.setURL(arguments[0]);
                this.setTitle(arguments[1]);
                this.setDesc(arguments[2]);
                this.setIcon(arguments[3])
            } else {
                throw new SyntaxError("web page content arguments error: " + arguments)
            }
        }
    };
    ns.Class(PageContent, BaseContent, null);
    PageContent.getURL = function(content) {
        return content["URL"]
    };
    PageContent.setURL = function(url, content) {
        if (url && url.indexOf("://") > 0) {
            content["URL"] = url
        } else {
            delete content["URL"]
        }
    };
    PageContent.getTitle = function(content) {
        return content["title"]
    };
    PageContent.setTitle = function(title, content) {
        if (title && title.length > 0) {
            content["title"] = title
        } else {
            delete content["title"]
        }
    };
    PageContent.getDesc = function(content) {
        return content["desc"]
    };
    PageContent.setDesc = function(text, content) {
        if (text && text.length > 0) {
            content["desc"] = text
        } else {
            delete content["desc"]
        }
    };
    PageContent.getIcon = function(content) {
        var base64 = content["icon"];
        if (base64 && base64.length > 0) {
            return ns.format.Base64.decode(base64)
        } else {
            return null
        }
    };
    PageContent.setIcon = function(image, content) {
        if (image && image.length > 0) {
            content["icon"] = ns.format.Base64.encode(image)
        } else {
            delete content["icon"]
        }
    };
    PageContent.prototype.getURL = function() {
        return PageContent.getURL(this.getMap())
    };
    PageContent.prototype.setURL = function(url) {
        PageContent.setURL(url, this.getMap())
    };
    PageContent.prototype.getTitle = function() {
        return PageContent.getTitle(this.getMap())
    };
    PageContent.prototype.setTitle = function(title) {
        PageContent.setTitle(title, this.getMap())
    };
    PageContent.prototype.getDesc = function() {
        return PageContent.getDesc(this.getMap())
    };
    PageContent.prototype.setDesc = function(text) {
        PageContent.setDesc(text, this.getMap())
    };
    PageContent.prototype.getIcon = function() {
        if (!this.__icon) {
            this.__icon = PageContent.getIcon(this.getMap())
        }
        return this.__icon
    };
    PageContent.prototype.setIcon = function(image) {
        PageContent.setIcon(image, this.getMap());
        this.__icon = image
    };
    ns.protocol.PageContent = PageContent;
    ns.protocol.registers("PageContent")
})(DIMP);
(function(ns) {
    var ContentType = ns.protocol.ContentType;
    var BaseContent = ns.dkd.BaseContent;
    var MoneyContent = function() {
        if (arguments.length === 3) {
            BaseContent.call(arguments[0]);
            this.setCurrency(arguments[1]);
            this.setAmount(arguments[2])
        } else {
            if (arguments.length === 2) {
                BaseContent.call(ContentType.MONEY);
                this.setCurrency(arguments[0]);
                this.setAmount(arguments[1])
            } else {
                if (typeof arguments[0] === "string") {
                    BaseContent.call(ContentType.MONEY);
                    this.setCurrency(arguments[0])
                } else {
                    BaseContent.call(arguments[0])
                }
            }
        }
    };
    ns.Class(MoneyContent, BaseContent, null);
    MoneyContent.getCurrency = function(content) {
        return content["currency"]
    };
    MoneyContent.setCurrency = function(currency, content) {
        content["currency"] = currency
    };
    MoneyContent.getAmount = function(content) {
        return content["amount"]
    };
    MoneyContent.setAmount = function(amount, content) {
        content["amount"] = amount
    };
    MoneyContent.prototype.getCurrency = function() {
        return MoneyContent.getCurrency(this.getMap())
    };
    MoneyContent.prototype.setCurrency = function(currency) {
        MoneyContent.setCurrency(currency, this.getMap())
    };
    MoneyContent.prototype.getAmount = function() {
        return MoneyContent.getAmount(this.getMap())
    };
    MoneyContent.prototype.setAmount = function(amount) {
        MoneyContent.setAmount(amount, this.getMap())
    };
    ns.protocol.MoneyContent = MoneyContent;
    ns.protocol.registers("MoneyContent")
})(DIMP);
(function(ns) {
    var ContentType = ns.protocol.ContentType;
    var MoneyContent = ns.MoneyContent;
    var TransferContent = function() {
        if (arguments.length === 2) {
            MoneyContent.call(ContentType.TRANSFER, arguments[0], arguments[1])
        } else {
            if (typeof arguments[0] === "string") {
                MoneyContent.call(ContentType.TRANSFER, arguments[0], 0)
            } else {
                MoneyContent.call(arguments[0])
            }
        }
    };
    ns.Class(TransferContent, MoneyContent, null);
    ns.protocol.TransferContent = TransferContent;
    ns.protocol.registers("TransferContent")
})(DIMP);
(function(ns) {
    var ContentType = ns.protocol.ContentType;
    var BaseContent = ns.dkd.BaseContent;
    var Command = function() {
        if (arguments.length === 2) {
            BaseContent.call(this, arguments[0]);
            this.setCommand(arguments[1])
        } else {
            if (typeof arguments[0] === "string") {
                BaseContent.call(this, ContentType.COMMAND);
                this.setCommand(arguments[0])
            } else {
                BaseContent.call(this, arguments[0])
            }
        }
    };
    ns.Class(Command, BaseContent, null);
    Command.getCommand = function(cmd) {
        return cmd["command"]
    };
    Command.setCommand = function(name, cmd) {
        if (name && name.length > 0) {
            cmd["command"] = name
        } else {
            delete cmd["command"]
        }
    };
    Command.prototype.getCommand = function() {
        return Command.getCommand(this.getMap())
    };
    Command.prototype.setCommand = function(name) {
        Command.setCommand(name, this.getMap())
    };
    Command.META = "meta";
    Command.DOCUMENT = "document";
    Command.RECEIPT = "receipt";
    Command.HANDSHAKE = "handshake";
    Command.LOGIN = "login";
    ns.protocol.Command = Command;
    ns.protocol.registers("Command")
})(DIMP);
(function(ns) {
    var Command = ns.protocol.Command;
    var CommandFactory = function() {};
    ns.Interface(CommandFactory, null);
    CommandFactory.prototype.parseCommand = function(cmd) {
        console.assert(false, "implement me!");
        return null
    };
    Command.Factory = CommandFactory;
    var s_factories = {};
    Command.register = function(name, factory) {
        s_factories[name] = factory
    };
    Command.getFactory = function(name) {
        return s_factories[name]
    }
})(DIMP);
(function(ns) {
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var Command = ns.protocol.Command;
    var MetaCommand = function() {
        if (arguments.length === 1) {
            if (ns.Interface.conforms(arguments[0], ID)) {
                Command.call(this, Command.META);
                this.setIdentifier(arguments[0])
            } else {
                Command.call(this, arguments[0]);
                this.__identifier = null
            }
            this.__meta = null
        } else {
            if (arguments.length === 2) {
                if (ns.Interface.conforms(arguments[0], ID)) {
                    Command.call(this, Command.META);
                    this.setIdentifier(arguments[0]);
                    this.setMeta(arguments[1])
                } else {
                    Command.call(this, arguments[0]);
                    this.setIdentifier(arguments[1]);
                    this.__meta = null
                }
            } else {
                if (arguments.length === 3) {
                    Command.call(this, arguments[0]);
                    this.setIdentifier(arguments[1]);
                    this.setMeta(arguments[2])
                } else {
                    throw new SyntaxError("meta command arguments error: " + arguments)
                }
            }
        }
    };
    ns.Class(MetaCommand, Command, null);
    MetaCommand.getIdentifier = function(cmd) {
        return ID.parse(cmd["ID"])
    };
    MetaCommand.setIdentifier = function(identifier, cmd) {
        if (identifier) {
            cmd["ID"] = identifier.toString()
        } else {
            delete cmd["ID"]
        }
    };
    MetaCommand.getMeta = function(cmd) {
        return Meta.parse(cmd["meta"])
    };
    MetaCommand.setMeta = function(meta, cmd) {
        if (meta) {
            cmd["meta"] = meta.getMap()
        } else {
            delete cmd["meta"]
        }
    };
    MetaCommand.prototype.getIdentifier = function() {
        if (!this.__identifier) {
            this.__identifier = MetaCommand.getIdentifier(this.getMap())
        }
        return this.__identifier
    };
    MetaCommand.prototype.setIdentifier = function(identifier) {
        MetaCommand.setIdentifier(identifier, this.getMap());
        this.__identifier = identifier
    };
    MetaCommand.prototype.getMeta = function() {
        if (!this.__meta) {
            this.__meta = MetaCommand.getMeta(this.getMap())
        }
        return this.__meta
    };
    MetaCommand.prototype.setMeta = function(meta) {
        MetaCommand.setMeta(meta, this.getMap());
        this.__meta = meta
    };
    MetaCommand.query = function(identifier) {
        return new MetaCommand(identifier)
    };
    MetaCommand.response = function(identifier, meta) {
        return new MetaCommand(identifier, meta)
    };
    ns.protocol.MetaCommand = MetaCommand;
    ns.protocol.registers("MetaCommand")
})(DIMP);
(function(ns) {
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var Document = ns.protocol.Document;
    var Command = ns.protocol.Command;
    var MetaCommand = ns.protocol.MetaCommand;
    var DocumentCommand = function() {
        if (arguments.length === 1) {
            if (ns.Interface.conforms(arguments[0], ID)) {
                MetaCommand.call(this, Command.DOCUMENT, arguments[0])
            } else {
                MetaCommand.call(this, arguments[0])
            }
            this.__document = null
        } else {
            if (arguments.length === 2) {
                if (ns.Interface.conforms(arguments[1], Meta)) {
                    MetaCommand.call(this, Command.DOCUMENT, arguments[0], arguments[1])
                } else {
                    if (typeof arguments[1] === "string") {
                        MetaCommand.call(this, Command.DOCUMENT, arguments[0], null);
                        this.setSignature(arguments[1])
                    } else {
                        throw new SyntaxError("document command arguments error: " + arguments)
                    }
                }
                this.__document = null
            } else {
                if (arguments.length === 3) {
                    MetaCommand.call(this, Command.DOCUMENT, arguments[0], arguments[1]);
                    this.setDocument(arguments[2])
                } else {
                    throw new SyntaxError("document command arguments error: " + arguments)
                }
            }
        }
    };
    ns.Class(DocumentCommand, MetaCommand, null);
    DocumentCommand.getDocument = function(cmd) {
        var data = cmd["profile"];
        if (!data) {
            data = cmd["document"]
        } else {
            if (typeof data === "string") {
                data = {
                    "ID": cmd["ID"],
                    "data": data,
                    "signature": cmd["signature"]
                }
            }
        }
        if (data) {
            return Document.parse(data)
        } else {
            return null
        }
    };
    DocumentCommand.setDocument = function(doc, cmd) {
        if (doc) {
            cmd["document"] = doc.getMap()
        } else {
            delete cmd["command"]
        }
    };
    DocumentCommand.getSignature = function(cmd) {
        return cmd["signature"]
    };
    DocumentCommand.setSignature = function(base64, cmd) {
        cmd["signature"] = base64
    };
    DocumentCommand.prototype.getDocument = function() {
        if (!this.__document) {
            this.__document = DocumentCommand.getDocument(this.getMap())
        }
        return this.__document
    };
    DocumentCommand.prototype.setDocument = function(doc) {
        DocumentCommand.setDocument(doc, this.getMap());
        this.__document = doc
    };
    DocumentCommand.prototype.getSignature = function() {
        return DocumentCommand.getSignature(this.getMap())
    };
    DocumentCommand.prototype.setSignature = function(base64) {
        DocumentCommand.setSignature(base64, this.getMap())
    };
    DocumentCommand.query = function(identifier, signature) {
        return new DocumentCommand(identifier, signature)
    };
    DocumentCommand.response = function(identifier, meta, doc) {
        return new DocumentCommand(identifier, meta, doc)
    };
    ns.protocol.DocumentCommand = DocumentCommand;
    ns.protocol.registers("DocumentCommand")
})(DIMP);
(function(ns) {
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var HistoryCommand = function() {
        if (arguments.length === 2) {
            Command.call(this, arguments[0], arguments[1])
        } else {
            if (typeof arguments[0] === "string") {
                Command.call(this, ContentType.HISTORY, arguments[0])
            } else {
                Command.call(this, arguments[0])
            }
        }
    };
    ns.Class(HistoryCommand, Command, null);
    HistoryCommand.register = Command.register;
    HistoryCommand.REGISTER = "register";
    HistoryCommand.SUICIDE = "suicide";
    ns.protocol.HistoryCommand = HistoryCommand;
    ns.protocol.registers("HistoryCommand")
})(DIMP);
(function(ns) {
    var ID = ns.protocol.ID;
    var HistoryCommand = ns.protocol.HistoryCommand;
    var GroupCommand = function() {
        if (arguments.length === 1) {
            HistoryCommand.call(this, arguments[0]);
            this.__member = null;
            this.__members = null
        } else {
            if (arguments.length === 2) {
                HistoryCommand.call(this, arguments[0]);
                this.setGroup(arguments[1]);
                this.__member = null;
                this.__members = null
            } else {
                if (arguments[2] instanceof Array) {
                    HistoryCommand.call(this, arguments[0]);
                    this.setGroup(arguments[1]);
                    this.__member = null;
                    this.setMembers(arguments[2])
                } else {
                    HistoryCommand.call(this, arguments[0]);
                    this.setGroup(arguments[1]);
                    this.setMember(arguments[2]);
                    this.__members = null
                }
            }
        }
    };
    ns.Class(GroupCommand, HistoryCommand, null);
    GroupCommand.getMember = function(cmd) {
        return ID.parse(cmd["member"])
    };
    GroupCommand.setMember = function(member, cmd) {
        if (member) {
            cmd["member"] = member.toString()
        } else {
            delete cmd["member"]
        }
    };
    GroupCommand.getMembers = function(cmd) {
        var members = cmd["members"];
        if (members) {
            return ID.convert(members)
        } else {
            return null
        }
    };
    GroupCommand.setMembers = function(members, cmd) {
        if (members && members.length > 0) {
            cmd["members"] = ID.revert(members)
        } else {
            delete cmd["members"]
        }
    };
    GroupCommand.prototype.getMember = function() {
        if (!this.__member) {
            this.__member = GroupCommand.getMember(this.getMap())
        }
        return this.__member
    };
    GroupCommand.prototype.setMember = function(identifier) {
        GroupCommand.setMembers(null, this.getMap());
        GroupCommand.setMember(identifier, this.getMap());
        this.__member = identifier
    };
    GroupCommand.prototype.getMembers = function() {
        if (!this.__members) {
            this.__members = GroupCommand.getMembers(this.getMap())
        }
        return this.__members
    };
    GroupCommand.prototype.setMembers = function(members) {
        GroupCommand.setMember(null, this.getMap());
        GroupCommand.setMembers(members, this.getMap());
        this.__members = members
    };
    GroupCommand.register = HistoryCommand.register;
    GroupCommand.FOUND = "found";
    GroupCommand.ABDICATE = "abdicate";
    GroupCommand.INVITE = "invite";
    GroupCommand.EXPEL = "expel";
    GroupCommand.JOIN = "join";
    GroupCommand.QUIT = "quit";
    GroupCommand.QUERY = "query";
    GroupCommand.RESET = "reset";
    GroupCommand.HIRE = "hire";
    GroupCommand.FIRE = "fire";
    GroupCommand.RESIGN = "resign";
    ns.protocol.GroupCommand = GroupCommand;
    ns.protocol.registers("GroupCommand")
})(DIMP);
(function(ns) {
    var ID = ns.protocol.ID;
    var GroupCommand = ns.protocol.GroupCommand;
    var InviteCommand = function() {
        if (arguments.length === 1) {
            GroupCommand.call(this, arguments[0])
        } else {
            GroupCommand.call(this, GroupCommand.INVITE, arguments[0], arguments[1])
        }
    };
    ns.Class(InviteCommand, GroupCommand, null);
    var ExpelCommand = function() {
        if (arguments.length === 1) {
            GroupCommand.call(this, arguments[0])
        } else {
            GroupCommand.call(this, GroupCommand.EXPEL, arguments[0], arguments[1])
        }
    };
    ns.Class(ExpelCommand, GroupCommand, null);
    var JoinCommand = function() {
        if (ns.Interface.conforms(arguments[0], ID)) {
            GroupCommand.call(this, GroupCommand.JOIN, arguments[0])
        } else {
            GroupCommand.call(this, arguments[0])
        }
    };
    ns.Class(JoinCommand, GroupCommand, null);
    var QuitCommand = function() {
        if (ns.Interface.conforms(arguments[0], ID)) {
            GroupCommand.call(this, GroupCommand.QUIT, arguments[0])
        } else {
            GroupCommand.call(this, arguments[0])
        }
    };
    ns.Class(QuitCommand, GroupCommand, null);
    var ResetCommand = function() {
        if (arguments.length === 1) {
            GroupCommand.call(this, arguments[0])
        } else {
            GroupCommand.call(this, GroupCommand.RESET, arguments[0], arguments[1])
        }
    };
    ns.Class(ResetCommand, GroupCommand, null);
    var QueryCommand = function() {
        if (ns.Interface.conforms(arguments[0], ID)) {
            GroupCommand.call(this, GroupCommand.QUERY, arguments[0])
        } else {
            GroupCommand.call(this, arguments[0])
        }
    };
    ns.Class(QueryCommand, GroupCommand, null);
    GroupCommand.invite = function(group, members) {
        return new InviteCommand(group, members)
    };
    GroupCommand.expel = function(group, members) {
        return new ExpelCommand(group, members)
    };
    GroupCommand.join = function(group) {
        return new JoinCommand(group)
    };
    GroupCommand.quit = function(group) {
        return new QuitCommand(group)
    };
    GroupCommand.reset = function(group, members) {
        return new ResetCommand(group, members)
    };
    GroupCommand.query = function(group) {
        return new QueryCommand(group)
    };
    GroupCommand.register(GroupCommand.INVITE, InviteCommand);
    GroupCommand.register(GroupCommand.EXPEL, ExpelCommand);
    GroupCommand.register(GroupCommand.JOIN, JoinCommand);
    GroupCommand.register(GroupCommand.QUIT, QuitCommand);
    GroupCommand.register(GroupCommand.RESET, ResetCommand);
    GroupCommand.register(GroupCommand.QUERY, QueryCommand);
    ns.protocol.group.InviteCommand = InviteCommand;
    ns.protocol.group.ExpelCommand = ExpelCommand;
    ns.protocol.group.JoinCommand = JoinCommand;
    ns.protocol.group.QuitCommand = QuitCommand;
    ns.protocol.group.ResetCommand = ResetCommand;
    ns.protocol.group.QueryCommand = QueryCommand;
    ns.protocol.group.registers("InviteCommand");
    ns.protocol.group.registers("ExpelCommand");
    ns.protocol.group.registers("JoinCommand");
    ns.protocol.group.registers("QuitCommand");
    ns.protocol.group.registers("ResetCommand");
    ns.protocol.group.registers("QueryCommand")
})(DIMP);
(function(ns) {
    var obj = ns.type.Object;
    var ID = ns.protocol.ID;
    var Entity = function(identifier) {
        obj.call(this);
        this.identifier = identifier;
        this.__datasource = null
    };
    ns.Class(Entity, obj, null);
    Entity.prototype.equals = function(other) {
        if (this === other) {
            return true
        } else {
            if (other instanceof Entity) {
                return this.identifier.equals(other.identifier)
            } else {
                if (ns.Interface.conforms(other, ID)) {
                    return this.identifier.equals(other)
                } else {
                    return false
                }
            }
        }
    };
    Entity.prototype.valueOf = function() {
        var clazz = Object.getPrototypeOf(this).constructor;
        return "<" + clazz.name + "|" + this.getType() + " " + this.identifier + ">"
    };
    Entity.prototype.toString = function() {
        var clazz = Object.getPrototypeOf(this).constructor;
        return "<" + clazz.name + "|" + this.getType() + " " + this.identifier + ">"
    };
    Entity.prototype.toLocaleString = function() {
        var clazz = Object.getPrototypeOf(this).constructor;
        return "<" + clazz.name + "|" + this.getType() + " " + this.identifier + ">"
    };
    Entity.prototype.getType = function() {
        return this.identifier.getType()
    };
    Entity.prototype.getDataSource = function() {
        return this.__datasource
    };
    Entity.prototype.setDataSource = function(delegate) {
        this.__datasource = delegate
    };
    Entity.prototype.getMeta = function() {
        return this.getDataSource().getMeta(this.identifier)
    };
    Entity.prototype.getDocument = function(type) {
        return this.getDataSource().getDocument(this.identifier, type)
    };
    ns.Entity = Entity;
    ns.registers("Entity")
})(DIMP);
(function(ns) {
    var Entity = ns.Entity;
    var EntityDataSource = function() {};
    ns.Interface(EntityDataSource, null);
    EntityDataSource.prototype.getMeta = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    EntityDataSource.prototype.getDocument = function(identifier, type) {
        console.assert(false, "implement me!");
        return null
    };
    Entity.DataSource = EntityDataSource
})(DIMP);
(function(ns) {
    var Entity = ns.Entity;
    var EntityDelegate = function() {};
    ns.Interface(EntityDelegate, null);
    EntityDelegate.prototype.selectLocalUser = function(receiver) {
        console.assert(false, "implement me!");
        return null
    };
    EntityDelegate.prototype.getUser = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    EntityDelegate.prototype.getGroup = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    Entity.Delegate = EntityDelegate
})(DIMP);
(function(ns) {
    var EncryptKey = ns.crypto.EncryptKey;
    var PublicKey = ns.crypto.PublicKey;
    var Document = ns.protocol.Document;
    var Visa = ns.protocol.Visa;
    var Entity = ns.Entity;
    var User = function(identifier) {
        Entity.call(this, identifier)
    };
    ns.Class(User, Entity, null);
    User.prototype.getVisa = function() {
        var doc = this.getDocument(Document.VISA);
        if (ns.Interface.conforms(doc, Visa)) {
            return doc
        } else {
            return null
        }
    };
    User.prototype.getContacts = function() {
        return this.getDataSource().getContacts(this.identifier)
    };
    User.prototype.verify = function(data, signature) {
        var keys = this.getDataSource().getPublicKeysForVerification(this.identifier);
        if (!keys || keys.length === 0) {
            throw new Error("failed to get verify keys for user: " + this.identifier)
        }
        for (var i = 0; i < keys.length; ++i) {
            if (keys[i].verify(data, signature)) {
                return true
            }
        }
        return false
    };
    User.prototype.encrypt = function(plaintext) {
        var key = this.getDataSource().getPublicKeyForEncryption(this.identifier);
        if (!key) {
            throw new Error("failed to get encrypt key for user: " + this.identifier)
        }
        return key.encrypt(plaintext)
    };
    User.prototype.sign = function(data) {
        var key = this.getDataSource().getPrivateKeyForSignature(this.identifier);
        if (!key) {
            throw new Error("failed to get sign key for user: " + this.identifier)
        }
        return key.sign(data)
    };
    User.prototype.decrypt = function(ciphertext) {
        var keys = this.getDataSource().getPrivateKeysForDecryption(this.identifier);
        if (!keys || keys.length === 0) {
            throw new Error("failed to get decrypt keys for user: " + this.identifier)
        }
        var plaintext;
        for (var i = 0; i < keys.length; ++i) {
            try {
                plaintext = keys[i].decrypt(ciphertext);
                if (plaintext && plaintext.length > 0) {
                    return plaintext
                }
            } catch (e) {}
        }
        return null
    };
    User.prototype.signVisa = function(visa) {
        if (!this.identifier.equals(visa.getIdentifier())) {
            return null
        }
        var key = this.getDataSource().getPrivateKeyForVisaSignature(this.identifier);
        if (!key) {
            throw new Error("failed to get sign key for user: " + this.identifier)
        }
        visa.sign(key);
        return visa
    };
    User.prototype.verifyVisa = function(visa) {
        if (!this.identifier.equals(visa.getIdentifier())) {
            return null
        }
        var key = this.getMeta().getKey();
        if (!key) {
            throw new Error("failed to get meta key for user: " + this.identifier)
        }
        return visa.verify(key)
    };
    ns.User = User;
    ns.registers("User")
})(DIMP);
(function(ns) {
    var Entity = ns.Entity;
    var User = ns.User;
    var UserDataSource = function() {};
    ns.Interface(UserDataSource, [Entity.DataSource]);
    UserDataSource.prototype.getContacts = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    UserDataSource.prototype.getPublicKeyForEncryption = function(identifier) {
        return null
    };
    UserDataSource.prototype.getPublicKeysForVerification = function(identifier) {
        return null
    };
    UserDataSource.prototype.getPrivateKeysForDecryption = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    UserDataSource.prototype.getPrivateKeyForSignature = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    UserDataSource.prototype.getPrivateKeyForVisaSignature = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    User.DataSource = UserDataSource
})(DIMP);
(function(ns) {
    var Document = ns.protocol.Document;
    var Bulletin = ns.protocol.Bulletin;
    var Entity = ns.Entity;
    var Group = function(identifier) {
        Entity.call(this, identifier);
        this.__founder = null
    };
    ns.Class(Group, Entity, null);
    Group.prototype.getBulletin = function() {
        var doc = this.getDocument(Document.BULLETIN);
        if (ns.Interface.conforms(doc, Bulletin)) {
            return doc
        } else {
            return null
        }
    };
    Group.prototype.getFounder = function() {
        if (!this.__founder) {
            this.__founder = this.getDataSource().getFounder(this.identifier)
        }
        return this.__founder
    };
    Group.prototype.getOwner = function() {
        return this.getDataSource().getOwner(this.identifier)
    };
    Group.prototype.getMembers = function() {
        return this.getDataSource().getMembers(this.identifier)
    };
    Group.prototype.getAssistants = function() {
        return this.getDataSource().getAssistants(this.identifier)
    };
    ns.Group = Group;
    ns.registers("Group")
})(DIMP);
(function(ns) {
    var Entity = ns.Entity;
    var Group = ns.Group;
    var GroupDataSource = function() {};
    ns.Interface(GroupDataSource, [Entity.DataSource]);
    GroupDataSource.prototype.getFounder = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    GroupDataSource.prototype.getOwner = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    GroupDataSource.prototype.getMembers = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    GroupDataSource.prototype.getAssistants = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    Group.DataSource = GroupDataSource
})(DIMP);
(function(ns) {
    var CipherKeyDelegate = function() {};
    ns.Interface(CipherKeyDelegate, null);
    CipherKeyDelegate.prototype.getCipherKey = function(from, to, generate) {
        console.assert(false, "implement me!");
        return null
    };
    CipherKeyDelegate.prototype.cacheCipherKey = function(from, to, key) {
        console.assert(false, "implement me!")
    };
    ns.CipherKeyDelegate = CipherKeyDelegate;
    ns.registers("CipherKeyDelegate")
})(DIMP);
(function(ns) {
    var Packer = function() {};
    ns.Interface(Packer, null);
    Packer.prototype.getOvertGroup = function(content) {
        console.assert(false, "implement me!");
        return null
    };
    Packer.prototype.encryptMessage = function(iMsg) {
        console.assert(false, "implement me!");
        return null
    };
    Packer.prototype.signMessage = function(sMsg) {
        console.assert(false, "implement me!");
        return null
    };
    Packer.prototype.serializeMessage = function(rMsg) {
        console.assert(false, "implement me!");
        return null
    };
    Packer.prototype.deserializeMessage = function(data) {
        console.assert(false, "implement me!");
        return null
    };
    Packer.prototype.verifyMessage = function(rMsg) {
        console.assert(false, "implement me!");
        return null
    };
    Packer.prototype.decryptMessage = function(sMsg) {
        console.assert(false, "implement me!");
        return null
    };
    var Processor = function() {};
    ns.Interface(Processor, null);
    Processor.prototype.processData = function(data) {
        console.assert(false, "implement me!");
        return null
    };
    Processor.prototype.processReliableMessage = function(rMsg) {
        console.assert(false, "implement me!");
        return null
    };
    Processor.prototype.processSecureMessage = function(sMsg, rMsg) {
        console.assert(false, "implement me!");
        return null
    };
    Processor.prototype.processInstantMessage = function(iMsg, rMsg) {
        console.assert(false, "implement me!");
        return null
    };
    Processor.prototype.processContent = function(content, rMsg) {
        console.assert(false, "implement me!");
        return null
    };
    var Message = ns.protocol.Message;
    var Entity = ns.Entity;
    var CipherKeyDelegate = ns.CipherKeyDelegate;
    var Transceiver = function() {};
    ns.Interface(Transceiver, [Entity.Delegate, CipherKeyDelegate, Message.Delegate, Packer, Processor]);
    Transceiver.Packer = Packer;
    Transceiver.Processor = Processor;
    ns.Transceiver = Transceiver;
    ns.registers("Transceiver")
})(DIMP);
(function(ns) {
    var obj = ns.type.Object;
    var EncryptKey = ns.crypto.EncryptKey;
    var VerifyKey = ns.crypto.VerifyKey;
    var ID = ns.protocol.ID;
    var NetworkType = ns.protocol.NetworkType;
    var Document = ns.protocol.Document;
    var Visa = ns.protocol.Visa;
    var Bulletin = ns.protocol.Bulletin;
    var Entity = ns.Entity;
    var User = ns.User;
    var Group = ns.Group;
    var Barrack = function() {
        obj.call(this);
        this.__users = {};
        this.__groups = {}
    };
    ns.Class(Barrack, obj, [Entity.Delegate, User.DataSource, Group.DataSource]);
    var thanos = function(map, finger) {
        var keys = Object.keys(map);
        for (var i = 0; i < keys.length; ++i) {
            var p = map[keys[i]];
            if (typeof p === "function") {
                continue
            }
            if ((++finger & 1) === 1) {
                delete map[p]
            }
        }
        return finger
    };
    Barrack.prototype.reduceMemory = function() {
        var finger = 0;
        finger = thanos(this.__users, finger);
        finger = thanos(this.__groups, finger);
        return finger >> 1
    };
    var cacheUser = function(user) {
        if (!user.getDataSource()) {
            user.setDataSource(this)
        }
        this.__users[user.identifier.toString()] = user;
        return true
    };
    var cacheGroup = function(group) {
        if (!group.getDataSource()) {
            group.setDataSource(this)
        }
        this.__groups[group.identifier.toString()] = group;
        return true
    };
    Barrack.prototype.createUser = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    Barrack.prototype.createGroup = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    Barrack.prototype.getLocalUsers = function() {
        console.assert(false, "implement me!");
        return null
    };
    Barrack.prototype.selectLocalUser = function(receiver) {
        var users = this.getLocalUsers();
        if (users == null || users.length === 0) {
            throw new Error("local users should not be empty")
        } else {
            if (receiver.isBroadcast()) {
                return users[0]
            }
        }
        var i, user;
        if (receiver.isGroup()) {
            var members = this.getMembers(receiver);
            if (members == null || members.length === 0) {
                return null
            }
            var j, member;
            for (i = 0; i < users.length; ++i) {
                user = users[i];
                for (j = 0; j < members.length; ++j) {
                    member = members[j];
                    if (member.equals(user.identifier)) {
                        return user
                    }
                }
            }
        } else {
            for (i = 0; i < users.length; ++i) {
                user = users[i];
                if (receiver.equals(user.identifier)) {
                    return user
                }
            }
        }
        return null
    };
    Barrack.prototype.getUser = function(identifier) {
        var user = this.__users[identifier.toString()];
        if (!user) {
            user = this.createUser(identifier);
            if (user) {
                cacheUser.call(this, user)
            }
        }
        return user
    };
    Barrack.prototype.getGroup = function(identifier) {
        var group = this.__groups[identifier.toString()];
        if (!group) {
            group = this.createGroup(identifier);
            if (group) {
                cacheGroup.call(this, group)
            }
        }
        return group
    };
    var visa_key = function(user) {
        var doc = this.getDocument(user, Document.VISA);
        if (ns.Interface.conforms(doc, Visa)) {
            if (doc.isValid()) {
                return doc.getKey()
            }
        }
        return null
    };
    var meta_key = function(user) {
        var meta = this.getMeta(user);
        if (meta) {
            return meta.getKey()
        }
        return null
    };
    Barrack.prototype.getPublicKeyForEncryption = function(identifier) {
        var key = visa_key.call(this, identifier);
        if (key) {
            return key
        }
        key = meta_key.call(this, identifier);
        if (ns.Interface.conforms(key, EncryptKey)) {
            return key
        }
        return null
    };
    Barrack.prototype.getPublicKeysForVerification = function(identifier) {
        var keys = [];
        var key = visa_key.call(this, identifier);
        if (ns.Interface.conforms(key, VerifyKey)) {
            keys.push(key)
        }
        key = meta_key.call(this, identifier);
        if (key) {
            keys.push(key)
        }
        return keys
    };
    var group_seed = function(identifier) {
        var seed = identifier.getName();
        if (seed) {
            var len = seed.length;
            if (len === 0 || (len === 8 && seed.toLowerCase() === "everyone")) {
                seed = null
            }
        }
        return seed
    };
    Barrack.prototype.getBroadcastFounder = function(group) {
        var seed = group_seed(group);
        if (seed) {
            return ID.parse(seed + ".founder@anywhere")
        } else {
            return ID.FOUNDER
        }
    };
    Barrack.prototype.getBroadcastOwner = function(group) {
        var seed = group_seed(group);
        if (seed) {
            return ID.parse(seed + ".owner@anywhere")
        } else {
            return ID.ANYONE
        }
    };
    Barrack.prototype.getBroadcastMembers = function(group) {
        var seed = group_seed(group);
        if (seed) {
            return ID.parse(seed + ".member@anywhere")
        } else {
            return ID.ANYONE
        }
    };
    Barrack.prototype.getFounder = function(group) {
        if (group.isBroadcast()) {
            return this.getBroadcastFounder(group)
        }
        var gMeta = this.getMeta(group);
        if (!gMeta) {
            return null
        }
        var members = this.getMembers(group);
        if (members != null) {
            var mMeta;
            for (var i = 0; i < members.length; ++i) {
                mMeta = this.getMeta(members[i]);
                if (!mMeta) {
                    continue
                }
                if (gMeta.matches(mMeta.getKey())) {
                    return members[i]
                }
            }
        }
        return null
    };
    Barrack.prototype.getOwner = function(group) {
        if (group.isBroadcast()) {
            return this.getBroadcastOwner(group)
        }
        if (NetworkType.POLYLOGUE.equals(group.getType())) {
            return this.getFounder(group)
        }
        return null
    };
    Barrack.prototype.getMembers = function(group) {
        if (group.isBroadcast()) {
            return this.getBroadcastMembers(group)
        }
        return null
    };
    Barrack.prototype.getAssistants = function(group) {
        var doc = this.getDocument(group, Document.BULLETIN);
        if (ns.Interface.conforms(doc, Bulletin)) {
            if (doc.isValid()) {
                return doc.getAssistants()
            }
        }
        return null
    };
    ns.core.Barrack = Barrack;
    ns.core.registers("Barrack")
})(DIMP);
(function(ns) {
    var obj = ns.type.Object;
    var Command = ns.protocol.Command;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var Transceiver = ns.Transceiver;
    var CorePacker = function(transceiver) {
        obj.call(this);
        this.__transceiver = transceiver
    };
    ns.Class(CorePacker, obj, [Transceiver.Packer]);
    CorePacker.prototype.getTransceiver = function() {
        return this.__transceiver
    };
    CorePacker.prototype.getOvertGroup = function(content) {
        var group = content.getGroup();
        if (!group) {
            return null
        }
        if (group.isBroadcast()) {
            return group
        }
        if (content instanceof Command) {
            return null
        }
        return group
    };
    CorePacker.prototype.encryptMessage = function(iMsg) {
        var transceiver = this.getTransceiver();
        if (!iMsg.getDelegate()) {
            iMsg.setDelegate(transceiver)
        }
        var sender = iMsg.getSender();
        var receiver = iMsg.getReceiver();
        var group = transceiver.getOvertGroup(iMsg.getContent());
        var password;
        if (group) {
            password = transceiver.getCipherKey(sender, group, true)
        } else {
            password = transceiver.getCipherKey(sender, receiver, true)
        }
        var sMsg;
        if (receiver.isGroup()) {
            var grp = transceiver.getGroup(receiver);
            if (!grp) {
                return null
            }
            var members = grp.getMembers();
            if (!members || members.length === 0) {
                return null
            }
            sMsg = iMsg.encrypt(password, members)
        } else {
            sMsg = iMsg.encrypt(password, null)
        }
        if (!sMsg) {
            return null
        }
        if (group && !receiver.equals(group)) {
            sMsg.getEnvelope().setGroup(group)
        }
        sMsg.getEnvelope().setType(iMsg.getContent().getType());
        return sMsg
    };
    CorePacker.prototype.signMessage = function(sMsg) {
        if (!sMsg.getDelegate()) {
            sMsg.setDelegate(this.getTransceiver())
        }
        return sMsg.sign()
    };
    CorePacker.prototype.serializeMessage = function(rMsg) {
        return ns.format.JSON.encode(rMsg.getMap())
    };
    CorePacker.prototype.deserializeMessage = function(data) {
        var dict = ns.format.JSON.decode(data);
        return ReliableMessage.parse(dict)
    };
    CorePacker.prototype.verifyMessage = function(rMsg) {
        if (!rMsg.getDelegate()) {
            rMsg.setDelegate(this.getTransceiver())
        }
        return rMsg.verify()
    };
    CorePacker.prototype.decryptMessage = function(sMsg) {
        if (!sMsg.getDelegate()) {
            sMsg.setDelegate(this.getTransceiver())
        }
        return sMsg.decrypt()
    };
    ns.core.Packer = CorePacker;
    ns.core.registers("Packer")
})(DIMP);
(function(ns) {
    var obj = ns.type.Object;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var Transceiver = ns.Transceiver;
    var CoreProcessor = function(transceiver) {
        obj.call(this);
        this.__transceiver = transceiver
    };
    ns.Class(CoreProcessor, obj, [Transceiver.Processor]);
    CoreProcessor.prototype.getTransceiver = function() {
        return this.__transceiver
    };
    CoreProcessor.prototype.processData = function(data) {
        var transceiver = this.getTransceiver();
        var rMsg = transceiver.deserializeMessage(data);
        if (rMsg == null) {
            return null
        }
        rMsg = transceiver.processReliableMessage(rMsg);
        if (rMsg == null) {
            return null
        }
        return transceiver.serializeMessage(rMsg)
    };
    CoreProcessor.prototype.processReliableMessage = function(rMsg) {
        var transceiver = this.getTransceiver();
        var sMsg = transceiver.verifyMessage(rMsg);
        if (sMsg == null) {
            return null
        }
        sMsg = transceiver.processSecureMessage(sMsg, rMsg);
        if (sMsg == null) {
            return null
        }
        return transceiver.signMessage(sMsg)
    };
    CoreProcessor.prototype.processSecureMessage = function(sMsg, rMsg) {
        var transceiver = this.getTransceiver();
        var iMsg = transceiver.decryptMessage(sMsg);
        if (iMsg == null) {
            return null
        }
        iMsg = transceiver.processInstantMessage(iMsg, rMsg);
        if (iMsg == null) {
            return null
        }
        return transceiver.encryptMessage(iMsg)
    };
    CoreProcessor.prototype.processInstantMessage = function(iMsg, rMsg) {
        var transceiver = this.getTransceiver();
        var response = transceiver.processContent(iMsg.getContent(), rMsg);
        if (response == null) {
            return null
        }
        var sender = iMsg.getSender();
        var receiver = iMsg.getReceiver();
        var user = transceiver.selectLocalUser(receiver);
        var env = Envelope.create(user.identifier, sender, null);
        return InstantMessage.create(env, response)
    };
    ns.core.Processor = CoreProcessor;
    ns.core.registers("Processor")
})(DIMP);
(function(ns) {
    var obj = ns.type.Object;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Content = ns.protocol.Content;
    var InstantMessage = ns.protocol.InstantMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var Transceiver = ns.Transceiver;
    var CoreTransceiver = function() {
        obj.call(this);
        this.__barrack = null;
        this.__keycache = null;
        this.__packer = null;
        this.__processor = null
    };
    ns.Class(CoreTransceiver, obj, [Transceiver, InstantMessage.Delegate, ReliableMessage.Delegate]);
    CoreTransceiver.prototype.setEntityDelegate = function(barrack) {
        this.__barrack = barrack
    };
    CoreTransceiver.prototype.getEntityDelegate = function() {
        return this.__barrack
    };
    CoreTransceiver.prototype.selectLocalUser = function(receiver) {
        return this.getEntityDelegate().selectLocalUser(receiver)
    };
    CoreTransceiver.prototype.getUser = function(identifier) {
        return this.getEntityDelegate().getUser(identifier)
    };
    CoreTransceiver.prototype.getGroup = function(identifier) {
        return this.getEntityDelegate().getGroup(identifier)
    };
    CoreTransceiver.prototype.setCipherKeyDelegate = function(keyCache) {
        this.__keycache = keyCache
    };
    CoreTransceiver.prototype.getCipherKeyDelegate = function() {
        return this.__keycache
    };
    CoreTransceiver.prototype.getCipherKey = function(from, to, generate) {
        return this.getCipherKeyDelegate().getCipherKey(from, to, generate)
    };
    CoreTransceiver.prototype.cacheCipherKey = function(from, to, key) {
        return this.getCipherKeyDelegate().cacheCipherKey(from, to, key)
    };
    CoreTransceiver.prototype.setPacker = function(packer) {
        this.__packer = packer
    };
    CoreTransceiver.prototype.getPacker = function() {
        return this.__packer
    };
    CoreTransceiver.prototype.getOvertGroup = function(content) {
        return this.getPacker().getOvertGroup(content)
    };
    CoreTransceiver.prototype.encryptMessage = function(iMsg) {
        return this.getPacker().encryptMessage(iMsg)
    };
    CoreTransceiver.prototype.signMessage = function(sMsg) {
        return this.getPacker().signMessage(sMsg)
    };
    CoreTransceiver.prototype.serializeMessage = function(rMsg) {
        return this.getPacker().serializeMessage(rMsg)
    };
    CoreTransceiver.prototype.deserializeMessage = function(data) {
        return this.getPacker().deserializeMessage(data)
    };
    CoreTransceiver.prototype.verifyMessage = function(rMsg) {
        return this.getPacker().verifyMessage(rMsg)
    };
    CoreTransceiver.prototype.decryptMessage = function(sMsg) {
        return this.getPacker().decryptMessage(sMsg)
    };
    CoreTransceiver.prototype.setProcessor = function(processor) {
        this.__processor = processor
    };
    CoreTransceiver.prototype.getProcessor = function() {
        return this.__processor
    };
    CoreTransceiver.prototype.processData = function(data) {
        return this.getProcessor().processData(data)
    };
    CoreTransceiver.prototype.processReliableMessage = function(rMsg) {
        return this.getProcessor().processReliableMessage(rMsg)
    };
    CoreTransceiver.prototype.processSecureMessage = function(sMsg, rMsg) {
        return this.getProcessor().processSecureMessage(sMsg, rMsg)
    };
    CoreTransceiver.prototype.processInstantMessage = function(iMsg, rMsg) {
        return this.getProcessor().processInstantMessage(iMsg, rMsg)
    };
    CoreTransceiver.prototype.processContent = function(content, rMsg) {
        return this.getProcessor().processContent(content, rMsg)
    };
    var is_broadcast_msg = function(msg) {
        var receiver = msg.getGroup();
        if (!receiver) {
            receiver = msg.getReceiver()
        }
        return receiver.isBroadcast()
    };
    CoreTransceiver.prototype.serializeContent = function(content, pwd, iMsg) {
        return ns.format.JSON.encode(content.getMap())
    };
    CoreTransceiver.prototype.encryptContent = function(data, pwd, iMsg) {
        return pwd.encrypt(data)
    };
    CoreTransceiver.prototype.encodeData = function(data, iMsg) {
        if (is_broadcast_msg(iMsg)) {
            return ns.format.UTF8.decode(data)
        }
        return ns.format.Base64.encode(data)
    };
    CoreTransceiver.prototype.serializeKey = function(pwd, iMsg) {
        if (is_broadcast_msg(iMsg)) {
            return null
        }
        return ns.format.JSON.encode(pwd.getMap())
    };
    CoreTransceiver.prototype.encryptKey = function(data, receiver, iMsg) {
        var contact = this.getUser(receiver);
        return contact.encrypt(data)
    };
    CoreTransceiver.prototype.encodeKey = function(key, iMsg) {
        return ns.format.Base64.encode(key)
    };
    CoreTransceiver.prototype.decodeKey = function(key, sMsg) {
        return ns.format.Base64.decode(key)
    };
    CoreTransceiver.prototype.decryptKey = function(data, sender, receiver, sMsg) {
        var identifier = sMsg.getReceiver();
        var user = this.getUser(identifier);
        return user.decrypt(data)
    };
    CoreTransceiver.prototype.deserializeKey = function(data, sender, receiver, sMsg) {
        if (data) {
            var dict = ns.format.JSON.decode(data);
            return SymmetricKey.parse(dict)
        } else {
            return this.getCipherKey(sender, receiver, false)
        }
    };
    CoreTransceiver.prototype.decodeData = function(data, sMsg) {
        if (is_broadcast_msg(sMsg)) {
            return ns.format.UTF8.encode(data)
        }
        return ns.format.Base64.decode(data)
    };
    CoreTransceiver.prototype.decryptContent = function(data, pwd, sMsg) {
        return pwd.decrypt(data)
    };
    CoreTransceiver.prototype.deserializeContent = function(data, pwd, sMsg) {
        var dict = ns.format.JSON.decode(data);
        var content = Content.parse(dict);
        if (!is_broadcast_msg(sMsg)) {
            var sender = sMsg.getSender();
            var group = this.getOvertGroup(content);
            if (group) {
                this.cacheCipherKey(sender, group, pwd)
            } else {
                var receiver = sMsg.getReceiver();
                this.cacheCipherKey(sender, receiver, pwd)
            }
        }
        return content
    };
    CoreTransceiver.prototype.signData = function(data, sender, sMsg) {
        var user = this.getUser(sender);
        return user.sign(data)
    };
    CoreTransceiver.prototype.encodeSignature = function(signature, sMsg) {
        return ns.format.Base64.encode(signature)
    };
    CoreTransceiver.prototype.decodeSignature = function(signature, rMsg) {
        return ns.format.Base64.decode(signature)
    };
    CoreTransceiver.prototype.verifyDataSignature = function(data, signature, sender, rMsg) {
        var contact = this.getUser(sender);
        return contact.verify(data, signature)
    };
    ns.core.Transceiver = CoreTransceiver;
    ns.core.registers("Transceiver")
})(DIMP);
(function(ns) {
    var obj = ns.type.Object;
    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var Command = ns.protocol.Command;
    var HistoryCommand = ns.protocol.HistoryCommand;
    var GroupCommand = ns.protocol.GroupCommand;
    var BaseContent = ns.dkd.BaseContent;
    var ContentFactory = function(clazz) {
        obj.call(this);
        this.__class = clazz
    };
    ns.Class(ContentFactory, obj, [Content.Factory]);
    ContentFactory.prototype.parseContent = function(content) {
        return new this.__class(content)
    };
    var CommandFactory = function(clazz) {
        obj.call(this);
        this.__class = clazz
    };
    ns.Class(CommandFactory, obj, [Command.Factory]);
    CommandFactory.prototype.parseCommand = function(content) {
        return new this.__class(content)
    };
    var GeneralCommandFactory = function() {
        obj.call(this)
    };
    ns.Class(GeneralCommandFactory, obj, [Content.Factory, Command.Factory]);
    GeneralCommandFactory.prototype.parseContent = function(content) {
        var command = Command.getCommand(content);
        var factory = Command.getFactory(command);
        if (!factory) {
            if (Content.getGroup(content)) {
                factory = Command.getFactory("group")
            }
            if (!factory) {
                factory = this
            }
        }
        return factory.parseCommand(content)
    };
    GeneralCommandFactory.prototype.parseCommand = function(cmd) {
        return new Command(cmd)
    };
    var HistoryCommandFactory = function() {
        GeneralCommandFactory.call(this)
    };
    ns.Class(HistoryCommandFactory, GeneralCommandFactory, null);
    HistoryCommandFactory.prototype.parseCommand = function(cmd) {
        return new HistoryCommand(cmd)
    };
    var GroupCommandFactory = function() {
        HistoryCommandFactory.call(this)
    };
    ns.Class(GroupCommandFactory, HistoryCommandFactory, null);
    GroupCommandFactory.prototype.parseContent = function(content) {
        var command = Command.getCommand(content);
        var factory = Command.getFactory(command);
        if (!factory) {
            factory = this
        }
        return factory.parseCommand(content)
    };
    GroupCommandFactory.prototype.parseCommand = function(cmd) {
        return new GroupCommand(cmd)
    };
    var registerContentFactories = function() {
        Content.register(ContentType.FORWARD, new ContentFactory(ns.protocol.ForwardContent));
        Content.register(ContentType.TEXT, new ContentFactory(ns.protocol.TextContent));
        Content.register(ContentType.FILE, new ContentFactory(ns.protocol.FileContent));
        Content.register(ContentType.IMAGE, new ContentFactory(ns.protocol.ImageContent));
        Content.register(ContentType.AUDIO, new ContentFactory(ns.protocol.AudioContent));
        Content.register(ContentType.VIDEO, new ContentFactory(ns.protocol.VideoContent));
        Content.register(ContentType.PAGE, new ContentFactory(ns.protocol.PageContent));
        Content.register(ContentType.MONEY, new ContentFactory(ns.protocol.MoneyContent));
        Content.register(ContentType.TRANSFER, new ContentFactory(ns.protocol.TransferContent));
        Content.register(ContentType.COMMAND, new GeneralCommandFactory());
        Content.register(ContentType.HISTORY, new HistoryCommandFactory());
        Content.register(0, new ContentFactory(BaseContent))
    };
    var registerCommandFactories = function() {
        Command.register(Command.META, new CommandFactory(ns.protocol.MetaCommand));
        var dpu = new CommandFactory(ns.protocol.DocumentCommand);
        Command.register(Command.DOCUMENT, dpu);
        Command.register("profile", dpu);
        Command.register("visa", dpu);
        Command.register("bulletin", dpu);
        Command.register("group", new GroupCommandFactory());
        Command.register(GroupCommand.INVITE, new CommandFactory(ns.protocol.group.InviteCommand));
        Command.register(GroupCommand.EXPEL, new CommandFactory(ns.protocol.group.ExpelCommand));
        Command.register(GroupCommand.JOIN, new CommandFactory(ns.protocol.group.JoinCommand));
        Command.register(GroupCommand.QUIT, new CommandFactory(ns.protocol.group.QuitCommand));
        Command.register(GroupCommand.QUERY, new CommandFactory(ns.protocol.group.QueryCommand));
        Command.register(GroupCommand.RESET, new CommandFactory(ns.protocol.group.ResetCommand))
    };
    var registerCoreFactories = function() {
        registerContentFactories();
        registerCommandFactories()
    };
    ns.core.ContentFactory = ContentFactory;
    ns.core.CommandFactory = CommandFactory;
    ns.core.GeneralCommandFactory = GeneralCommandFactory;
    ns.core.HistoryCommandFactory = HistoryCommandFactory;
    ns.core.GroupCommandFactory = GroupCommandFactory;
    ns.core.registerAllFactories = registerCoreFactories;
    ns.core.registers("ContentFactory");
    ns.core.registers("CommandFactory");
    ns.core.registers("GeneralCommandFactory");
    ns.core.registers("HistoryCommandFactory");
    ns.core.registers("GroupCommandFactory");
    ns.core.registers("registerAllFactories")
})(DIMP);
(function(ns) {
    if (typeof String.prototype.repeat !== "function") {
        String.prototype.repeat = function(count) {
            var string = "";
            for (var i = 0; i < count; ++i) {
                string += this
            }
            return string
        }
    }
    function base(ALPHABET) {
        if (ALPHABET.length >= 255) {
            throw new TypeError("Alphabet too long")
        }
        var BASE_MAP = new Uint8Array(256);
        for (var j = 0; j < BASE_MAP.length; j++) {
            BASE_MAP[j] = 255
        }
        for (var i = 0; i < ALPHABET.length; i++) {
            var x = ALPHABET.charAt(i);
            var xc = x.charCodeAt(0);
            if (BASE_MAP[xc] !== 255) {
                throw new TypeError(x + " is ambiguous")
            }
            BASE_MAP[xc] = i
        }
        var BASE = ALPHABET.length;
        var LEADER = ALPHABET.charAt(0);
        var FACTOR = Math.log(BASE) / Math.log(256);
        var iFACTOR = Math.log(256) / Math.log(BASE);

        function encode(source) {
            if (source.length === 0) {
                return ""
            }
            var zeroes = 0;
            var length = 0;
            var pbegin = 0;
            var pend = source.length;
            while (pbegin !== pend && source[pbegin] === 0) {
                pbegin++;
                zeroes++
            }
            var size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
            var b58 = new Uint8Array(size);
            while (pbegin !== pend) {
                var carry = source[pbegin];
                var i = 0;
                for (var it1 = size - 1;
                     (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
                    carry += (256 * b58[it1]) >>> 0;
                    b58[it1] = (carry % BASE) >>> 0;
                    carry = (carry / BASE) >>> 0
                }
                if (carry !== 0) {
                    throw new Error("Non-zero carry")
                }
                length = i;
                pbegin++
            }
            var it2 = size - length;
            while (it2 !== size && b58[it2] === 0) {
                it2++
            }
            var str = LEADER.repeat(zeroes);
            for (; it2 < size; ++it2) {
                str += ALPHABET.charAt(b58[it2])
            }
            return str
        }
        function decodeUnsafe(source) {
            if (typeof source !== "string") {
                throw new TypeError("Expected String")
            }
            if (source.length === 0) {
                return []
            }
            var psz = 0;
            if (source[psz] === " ") {
                return
            }
            var zeroes = 0;
            var length = 0;
            while (source[psz] === LEADER) {
                zeroes++;
                psz++
            }
            var size = (((source.length - psz) * FACTOR) + 1) >>> 0;
            var b256 = new Uint8Array(size);
            while (source[psz]) {
                var carry = BASE_MAP[source.charCodeAt(psz)];
                if (carry === 255) {
                    return
                }
                var i = 0;
                for (var it3 = size - 1;
                     (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
                    carry += (BASE * b256[it3]) >>> 0;
                    b256[it3] = (carry % 256) >>> 0;
                    carry = (carry / 256) >>> 0
                }
                if (carry !== 0) {
                    throw new Error("Non-zero carry")
                }
                length = i;
                psz++
            }
            if (source[psz] === " ") {
                return
            }
            var it4 = size - length;
            while (it4 !== size && b256[it4] === 0) {
                it4++
            }
            var vch = [];
            var j = 0;
            for (; j < zeroes; ++j) {
                vch[j] = 0
            }
            while (it4 !== size) {
                vch[j++] = b256[it4++]
            }
            return vch
        }
        function decode(string) {
            var buffer = decodeUnsafe(string);
            if (buffer) {
                return new Uint8Array(buffer)
            }
            throw new Error("Non-base" + BASE + " character")
        }
        return {
            encode: encode,
            decodeUnsafe: decodeUnsafe,
            decode: decode
        }
    }
    var bs58 = base("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
    var obj = ns.type.Object;
    var BaseCoder = ns.format.BaseCoder;
    var base58 = function() {
        obj.call(this)
    };
    ns.Class(base58, obj, [BaseCoder]);
    base58.prototype.encode = function(data) {
        return bs58.encode(data)
    };
    base58.prototype.decode = function(string) {
        return bs58.decode(string)
    };
    ns.format.Base58.coder = new base58()
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Hash = ns.digest.Hash;
    var md5 = function() {
        obj.call(this)
    };
    ns.Class(md5, obj, [Hash]);
    md5.prototype.digest = function(data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.MD5(array);
        return ns.format.Hex.decode(result.toString())
    };
    ns.digest.MD5.hash = new md5()
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Hash = ns.digest.Hash;
    var sha256 = function() {
        obj.call(this)
    };
    ns.Class(sha256, obj, [Hash]);
    sha256.prototype.digest = function(data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.SHA256(array);
        return ns.format.Hex.decode(result.toString())
    };
    ns.digest.SHA256.hash = new sha256()
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Hash = ns.digest.Hash;
    var ripemd160 = function() {
        obj.call(this)
    };
    ns.Class(ripemd160, obj, [Hash]);
    ripemd160.prototype.digest = function(data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.RIPEMD160(array);
        return ns.format.Hex.decode(result.toString())
    };
    ns.digest.RIPEMD160.hash = new ripemd160()
})(MONKEY);
(function(ns) {
    var MIME_LINE_MAX_LEN = 76;
    var CR_LF = "\r\n";
    var rfc2045 = function(data) {
        var base64 = ns.format.Base64.encode(data);
        var length = base64.length;
        if (length > MIME_LINE_MAX_LEN && base64.indexOf(CR_LF) < 0) {
            var sb = "";
            var start = 0,
                end;
            for (; start < length; start += MIME_LINE_MAX_LEN) {
                end = start + MIME_LINE_MAX_LEN;
                if (end < length) {
                    sb += base64.substring(start, end);
                    sb += CR_LF
                } else {
                    sb += base64.substring(start, length);
                    break
                }
            }
            base64 = sb
        }
        return base64
    };
    var encode_key = function(key, left, right) {
        var content = rfc2045(key);
        return left + CR_LF + content + CR_LF + right
    };
    var decode_key = function(pem, left, right) {
        var start = pem.indexOf(left);
        if (start < 0) {
            return null
        }
        start += left.length;
        var end = pem.indexOf(right, start);
        if (end < start) {
            return null
        }
        return ns.format.Base64.decode(pem.substring(start, end))
    };
    var encode_public = function(key) {
        return encode_key(key, "-----BEGIN PUBLIC KEY-----", "-----END PUBLIC KEY-----")
    };
    var encode_rsa_private = function(key) {
        return encode_key(key, "-----BEGIN RSA PRIVATE KEY-----", "-----END RSA PRIVATE KEY-----")
    };
    var decode_public = function(pem) {
        var data = decode_key(pem, "-----BEGIN PUBLIC KEY-----", "-----END PUBLIC KEY-----");
        if (data) {
            return data
        }
        if (pem.indexOf("PRIVATE KEY") > 0) {
            throw new TypeError("this is a private key content")
        } else {
            return ns.format.Base64.decode(pem)
        }
    };
    var decode_rsa_private = function(pem) {
        var data = decode_key(pem, "-----BEGIN RSA PRIVATE KEY-----", "-----END RSA PRIVATE KEY-----");
        if (data) {
            return data
        }
        if (pem.indexOf("PUBLIC KEY") > 0) {
            throw new TypeError("this is not a RSA private key content")
        } else {
            return ns.format.Base64.decode(pem)
        }
    };
    var obj = ns.type.Object;
    var pem = function() {
        obj.call(this)
    };
    ns.Class(pem, obj, null);
    pem.prototype.encodePublicKey = function(key) {
        return encode_public(key)
    };
    pem.prototype.encodePrivateKey = function(key) {
        return encode_rsa_private(key)
    };
    pem.prototype.decodePublicKey = function(pem) {
        return decode_public(pem)
    };
    pem.prototype.decodePrivateKey = function(pem) {
        return decode_rsa_private(pem)
    };
    ns.format.PEM = new pem();
    ns.format.registers("PEM")
})(MONKEY);
(function(ns) {
    var Hex = ns.format.Hex;
    var Base64 = ns.format.Base64;
    var PEM = ns.format.PEM;
    var Data = ns.type.Data;
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PublicKey = ns.crypto.PublicKey;
    var EncryptKey = ns.crypto.EncryptKey;
    var RSAPublicKey = function(key) {
        Dictionary.call(this, key)
    };
    ns.Class(RSAPublicKey, Dictionary, [PublicKey, EncryptKey]);
    RSAPublicKey.prototype.getAlgorithm = function() {
        return CryptographyKey.getAlgorithm(this.getMap())
    };
    RSAPublicKey.prototype.getData = function() {
        var data = this.getValue("data");
        if (data) {
            return PEM.decodePublicKey(data)
        } else {
            throw new Error("public key data not found")
        }
    };
    RSAPublicKey.prototype.getSize = function() {
        var size = this.getValue("keySize");
        if (size) {
            return Number(size)
        } else {
            return 1024 / 8
        }
    };
    var x509_header = [48, -127, -97, 48, 13, 6, 9, 42, -122, 72, -122, -9, 13, 1, 1, 1, 5, 0, 3, -127, -115, 0];
    x509_header = new Data(x509_header);
    var parse_key = function() {
        var der = this.getData();
        var key = Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPublicKey(key);
        if (cipher.key.e === 0 || cipher.key.n === null) {
            der = x509_header.concat(der).getBytes();
            key = Base64.encode(der);
            cipher.setPublicKey(key)
        }
        return cipher
    };
    RSAPublicKey.prototype.verify = function(data, signature) {
        data = CryptoJS.enc.Hex.parse(Hex.encode(data));
        signature = Base64.encode(signature);
        var cipher = parse_key.call(this);
        return cipher.verify(data, signature, CryptoJS.SHA256)
    };
    RSAPublicKey.prototype.matches = function(sKey) {
        return AsymmetricKey.matches(sKey, this)
    };
    RSAPublicKey.prototype.encrypt = function(plaintext) {
        plaintext = ns.format.UTF8.decode(plaintext);
        var cipher = parse_key.call(this);
        var base64 = cipher.encrypt(plaintext);
        if (base64) {
            var res = Base64.decode(base64);
            if (res.length === this.getSize()) {
                return res
            }
            var hex = cipher.getKey().encrypt(plaintext);
            if (hex) {
                res = Hex.decode(hex);
                if (res.length === this.getSize()) {
                    return res
                }
                throw new Error("Error encrypt result: " + plaintext)
            }
        }
        throw new Error("RSA encrypt error: " + plaintext)
    };
    ns.crypto.RSAPublicKey = RSAPublicKey;
    ns.crypto.registers("RSAPublicKey")
})(MONKEY);
(function(ns) {
    var Dictionary = ns.type.Dictionary;
    var Hex = ns.format.Hex;
    var Base64 = ns.format.Base64;
    var PEM = ns.format.PEM;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = function(key) {
        Dictionary.call(this, key)
    };
    ns.Class(RSAPrivateKey, Dictionary, [PrivateKey, DecryptKey]);
    RSAPrivateKey.prototype.getAlgorithm = function() {
        return CryptographyKey.getAlgorithm(this.getMap())
    };
    RSAPrivateKey.prototype.getData = function() {
        var data = this.getValue("data");
        if (data) {
            return PEM.decodePrivateKey(data)
        } else {
            var bits = this.getSize() * 8;
            var pem = generate.call(this, bits);
            return PEM.decodePrivateKey(pem)
        }
    };
    var generate = function(bits) {
        var cipher = new JSEncrypt({
            default_key_size: bits
        });
        var key = cipher.getKey();
        var pem = key.getPublicKey() + "\r\n" + key.getPrivateKey();
        this.setValue("data", pem);
        this.setValue("mode", "ECB");
        this.setValue("padding", "PKCS1");
        this.setValue("digest", "SHA256");
        return pem
    };
    RSAPrivateKey.prototype.getSize = function() {
        var size = this.getValue("keySize");
        if (size) {
            return Number(size)
        } else {
            return 1024 / 8
        }
    };
    RSAPrivateKey.prototype.getPublicKey = function() {
        var key = Base64.encode(this.getData());
        var cipher = new JSEncrypt();
        cipher.setPrivateKey(key);
        var pem = cipher.getPublicKey();
        var info = {
            algorithm: this.getValue("algorithm"),
            data: pem,
            mode: "ECB",
            padding: "PKCS1",
            digest: "SHA256"
        };
        return PublicKey.parse(info)
    };
    var parse_key = function() {
        var der = this.getData();
        var key = Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPrivateKey(key);
        return cipher
    };
    RSAPrivateKey.prototype.sign = function(data) {
        data = CryptoJS.enc.Hex.parse(Hex.encode(data));
        var cipher = parse_key.call(this);
        var base64 = cipher.sign(data, CryptoJS.SHA256, "sha256");
        if (base64) {
            return Base64.decode(base64)
        } else {
            throw new Error("RSA sign error: " + data)
        }
    };
    RSAPrivateKey.prototype.decrypt = function(data) {
        data = Base64.encode(data);
        var cipher = parse_key.call(this);
        var string = cipher.decrypt(data);
        if (string) {
            return ns.format.UTF8.encode(string)
        } else {
            throw new Error("RSA decrypt error: " + data)
        }
    };
    RSAPrivateKey.prototype.matches = function(pKey) {
        return CryptographyKey.matches(pKey, this)
    };
    ns.crypto.RSAPrivateKey = RSAPrivateKey;
    ns.crypto.registers("RSAPrivateKey")
})(MONKEY);
(function(ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var bytes2words = function(data) {
        var string = ns.format.Hex.encode(data);
        return CryptoJS.enc.Hex.parse(string)
    };
    var words2bytes = function(array) {
        var result = array.toString();
        return ns.format.Hex.decode(result)
    };
    var random_data = function(size) {
        var data = new Uint8Array(size);
        for (var i = 0; i < size; ++i) {
            data[i] = Math.floor(Math.random() * 256)
        }
        return data
    };
    var zero_data = function(size) {
        return new Uint8Array(size)
    };
    var AESKey = function(key) {
        Dictionary.call(this, key)
    };
    ns.Class(AESKey, Dictionary, [SymmetricKey]);
    AESKey.prototype.getAlgorithm = function() {
        return CryptographyKey.getAlgorithm(this.getMap())
    };
    AESKey.prototype.getSize = function() {
        var size = this.getValue("keySize");
        if (size) {
            return Number(size)
        } else {
            return 32
        }
    };
    AESKey.prototype.getBlockSize = function() {
        var size = this.getValue("blockSize");
        if (size) {
            return Number(size)
        } else {
            return 16
        }
    };
    AESKey.prototype.getData = function() {
        var data = this.getValue("data");
        if (data) {
            return ns.format.Base64.decode(data)
        }
        var keySize = this.getSize();
        var pwd = random_data(keySize);
        this.setValue("data", ns.format.Base64.encode(pwd));
        var blockSize = this.getBlockSize();
        var iv = random_data(blockSize);
        this.setValue("iv", ns.format.Base64.encode(iv));
        return pwd
    };
    AESKey.prototype.getInitVector = function() {
        var iv = this.getValue("iv");
        if (iv) {
            return ns.format.Base64.decode(iv)
        }
        var zeros = zero_data(this.getBlockSize());
        this.setValue("iv", ns.format.Base64.encode(zeros));
        return zeros
    };
    AESKey.prototype.encrypt = function(plaintext) {
        var data = this.getData();
        var iv = this.getInitVector();
        var keyWordArray = bytes2words(data);
        var ivWordArray = bytes2words(iv);
        var message = bytes2words(plaintext);
        var cipher = CryptoJS.AES.encrypt(message, keyWordArray, {
            iv: ivWordArray
        });
        if (cipher.hasOwnProperty("ciphertext")) {
            return words2bytes(cipher.ciphertext)
        } else {
            throw new TypeError("failed to encrypt message with key: " + this)
        }
    };
    AESKey.prototype.decrypt = function(ciphertext) {
        var data = this.getData();
        var iv = this.getInitVector();
        var keyWordArray = bytes2words(data);
        var ivWordArray = bytes2words(iv);
        var cipher = {
            ciphertext: bytes2words(ciphertext)
        };
        var plaintext = CryptoJS.AES.decrypt(cipher, keyWordArray, {
            iv: ivWordArray
        });
        return words2bytes(plaintext)
    };
    AESKey.prototype.matches = function(pKey) {
        return CryptographyKey.matches(pKey, this)
    };
    ns.crypto.AESKey = AESKey;
    ns.crypto.registers("AESKey")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Data = ns.type.Data;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Password = function() {
        obj.call(this)
    };
    ns.Class(Password, obj, null);
    Password.KEY_SIZE = 32;
    Password.BLOCK_SIZE = 16;
    Password.generate = function(password) {
        var data = ns.format.UTF8.encode(password);
        var digest = ns.digest.SHA256.digest(data);
        var filling = Password.KEY_SIZE - data.length;
        if (filling > 0) {
            var merged = new Data(Password.KEY_SIZE);
            merged.fill(0, digest, 0, filling);
            merged.fill(filling, data, 0, data.length);
            data = merged.getBytes()
        } else {
            if (filling < 0) {
                if (Password.KEY_SIZE === digest.length) {
                    data = digest
                } else {
                    var head = new Data(digest);
                    data = head.slice(0, Password.KEY_SIZE)
                }
            }
        }
        var tail = new Data(Password.BLOCK_SIZE);
        tail.fill(0, digest, digest.length - Password.BLOCK_SIZE, digest.length);
        var iv = tail.getBytes();
        var key = {
            "algorithm": SymmetricKey.AES,
            "data": ns.format.Base64.encode(data),
            "iv": ns.format.Base64.encode(iv)
        };
        return SymmetricKey.parse(key)
    };
    ns.crypto.Password = Password;
    ns.crypto.registers("Password")
})(MONKEY);
(function(ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = function(key) {
        Dictionary.call(this, key)
    };
    ns.Class(PlainKey, Dictionary, [SymmetricKey]);
    PlainKey.prototype.getAlgorithm = function() {
        return CryptographyKey.getAlgorithm(this.getMap())
    };
    PlainKey.prototype.getData = function() {
        return null
    };
    PlainKey.prototype.encrypt = function(data) {
        return data
    };
    PlainKey.prototype.decrypt = function(data) {
        return data
    };
    var plain_key = null;
    PlainKey.getInstance = function() {
        if (!plain_key) {
            var key = {
                "algorithm": PlainKey.PLAIN
            };
            plain_key = new PlainKey(key)
        }
        return plain_key
    };
    PlainKey.PLAIN = "PLAIN";
    ns.crypto.PlainKey = PlainKey;
    ns.crypto.registers("PlainKey")
})(MONKEY);
(function(ns) {
    var str = ns.type.String;
    var Data = ns.type.Data;
    var SHA256 = ns.digest.SHA256;
    var RIPEMD160 = ns.digest.RIPEMD160;
    var Base58 = ns.format.Base58;
    var NetworkType = ns.protocol.NetworkType;
    var Address = ns.protocol.Address;
    var BTCAddress = function(string, network) {
        str.call(this, string);
        this.__network = network
    };
    ns.Class(BTCAddress, str, [Address]);
    BTCAddress.prototype.getNetwork = function() {
        return this.__network
    };
    BTCAddress.prototype.isBroadcast = function() {
        return false
    };
    BTCAddress.prototype.isUser = function() {
        return NetworkType.isUser(this.__network)
    };
    BTCAddress.prototype.isGroup = function() {
        return NetworkType.isGroup(this.__network)
    };
    BTCAddress.generate = function(fingerprint, network) {
        if (network instanceof NetworkType) {
            network = network.valueOf()
        }
        var digest = RIPEMD160.digest(SHA256.digest(fingerprint));
        var head = new Data(21);
        head.setByte(0, network);
        head.append(digest);
        var cc = check_code(head.getBytes(false));
        var data = new Data(25);
        data.append(head);
        data.append(cc);
        return new BTCAddress(Base58.encode(data.getBytes(false)), network)
    };
    BTCAddress.parse = function(string) {
        var len = string.length;
        if (len < 26) {
            return null
        }
        var data = Base58.decode(string);
        if (data.length !== 25) {
            throw new RangeError("address length error: " + string)
        }
        var prefix = data.subarray(0, 21);
        var suffix = data.subarray(21, 25);
        var cc = check_code(prefix);
        if (ns.type.Arrays.equals(cc, suffix)) {
            return new BTCAddress(string, data[0])
        } else {
            return null
        }
    };
    var check_code = function(data) {
        var sha256d = SHA256.digest(SHA256.digest(data));
        return sha256d.subarray(0, 4)
    };
    ns.mkm.BTCAddress = BTCAddress;
    ns.mkm.registers("BTCAddress")
})(MingKeMing);
(function(ns) {
    var NetworkType = ns.protocol.NetworkType;
    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var DefaultMeta = function() {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0])
        } else {
            if (arguments.length === 4) {
                BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3])
            }
        }
        this.__addresses = {}
    };
    ns.Class(DefaultMeta, BaseMeta, null);
    DefaultMeta.prototype.generateAddress = function(network) {
        if (network instanceof NetworkType) {
            network = network.valueOf()
        }
        var address = this.__addresses[network];
        if (!address && this.isValid()) {
            address = BTCAddress.generate(this.getFingerprint(), network);
            this.__addresses[network] = address
        }
        return address
    };
    ns.mkm.DefaultMeta = DefaultMeta;
    ns.mkm.registers("DefaultMeta")
})(MingKeMing);
(function(ns) {
    var NetworkType = ns.protocol.NetworkType;
    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var BTCMeta = function() {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0])
        } else {
            if (arguments.length === 4) {
                BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3])
            }
        }
        this.__address = null
    };
    ns.Class(BTCMeta, BaseMeta, null);
    BTCMeta.prototype.generateAddress = function(network) {
        if (!this.__address && this.isValid()) {
            var fingerprint = this.getKey().getData();
            this.__address = BTCAddress.generate(fingerprint, NetworkType.BTC_MAIN)
        }
        return this.__address
    };
    ns.mkm.BTCMeta = BTCMeta;
    ns.mkm.registers("BTCMeta")
})(MingKeMing);
(function(ns) {
    var Address = ns.protocol.Address;
    var AddressFactory = ns.mkm.AddressFactory;
    var BTCAddress = ns.mkm.BTCAddress;
    var GeneralAddressFactory = function() {
        AddressFactory.call(this)
    };
    ns.Class(GeneralAddressFactory, AddressFactory, null);
    GeneralAddressFactory.prototype.createAddress = function(address) {
        return BTCAddress.parse(address)
    };
    Address.setFactory(new GeneralAddressFactory())
})(MingKeMing);
(function(ns) {
    var obj = ns.type.Object;
    var MetaType = ns.protocol.MetaType;
    var Meta = ns.protocol.Meta;
    var DefaultMeta = ns.mkm.DefaultMeta;
    var BTCMeta = ns.mkm.BTCMeta;
    var GeneralMetaFactory = function(type) {
        obj.call(this);
        this.__type = type
    };
    ns.Class(GeneralMetaFactory, obj, [Meta.Factory]);
    GeneralMetaFactory.prototype.createMeta = function(key, seed, fingerprint) {
        if (MetaType.MKM.equals(this.__type)) {
            return new DefaultMeta(this.__type, key, seed, fingerprint)
        } else {
            if (MetaType.BTC.equals(this.__type)) {
                return new BTCMeta(this.__type, key, seed, fingerprint)
            } else {
                if (MetaType.ExBTC.equals(this.__type)) {
                    return new BTCMeta(this.__type, key, seed, fingerprint)
                } else {
                    return null
                }
            }
        }
    };
    GeneralMetaFactory.prototype.generateMeta = function(sKey, seed) {
        var fingerprint = null;
        if (seed && seed.length > 0) {
            fingerprint = sKey.sign(ns.format.UTF8.encode(seed))
        }
        return this.createMeta(sKey.getPublicKey(), seed, fingerprint)
    };
    GeneralMetaFactory.prototype.parseMeta = function(meta) {
        var type = Meta.getType(meta);
        if (MetaType.MKM.equals(type)) {
            return new DefaultMeta(meta)
        } else {
            if (MetaType.BTC.equals(type)) {
                return new BTCMeta(meta)
            } else {
                if (MetaType.ExBTC.equals(type)) {
                    return new BTCMeta(meta)
                } else {
                    return null
                }
            }
        }
    };
    Meta.register(MetaType.MKM, new GeneralMetaFactory(MetaType.MKM))
})(MingKeMing);
(function(ns) {
    var obj = ns.type.Object;
    var Document = ns.protocol.Document;
    var BaseDocument = ns.mkm.BaseDocument;
    var BaseBulletin = ns.mkm.BaseBulletin;
    var BaseVisa = ns.mkm.BaseVisa;
    var doc_type = function(type, identifier) {
        if (type === "*") {
            if (identifier.isGroup()) {
                return Document.BULLETIN
            } else {
                if (identifier.isUser()) {
                    return Document.VISA
                } else {
                    return Document.PROFILE
                }
            }
        } else {
            return type
        }
    };
    var GeneralDocumentFactory = function(type) {
        obj.call(this);
        this.__type = type
    };
    ns.Class(GeneralDocumentFactory, obj, [Document.Factory]);
    GeneralDocumentFactory.prototype.createDocument = function(identifier, data, signature) {
        var type = doc_type(this.__type, identifier);
        if (type === Document.VISA) {
            if (data && signature) {
                return new BaseVisa(identifier, data, signature)
            } else {
                return new BaseVisa(identifier)
            }
        } else {
            if (type === Document.BULLETIN) {
                if (data && signature) {
                    return new BaseBulletin(identifier, data, signature)
                } else {
                    return new BaseBulletin(identifier)
                }
            } else {
                if (data && signature) {
                    return new BaseDocument(identifier, data, signature)
                } else {
                    return new BaseDocument(identifier)
                }
            }
        }
    };
    GeneralDocumentFactory.prototype.parseDocument = function(doc) {
        var identifier = Document.getIdentifier(doc);
        if (!identifier) {
            return null
        }
        var type = Document.getType(doc);
        if (!type) {
            type = doc_type("*", identifier)
        }
        if (type === Document.VISA) {
            return new BaseVisa(doc)
        } else {
            if (type === Document.BULLETIN) {
                return new BaseBulletin(doc)
            } else {
                return new BaseDocument(doc)
            }
        }
    };
    Document.register("*", new GeneralDocumentFactory("*"));
    Document.register(Document.VISA, new GeneralDocumentFactory(Document.VISA));
    Document.register(Document.PROFILE, new GeneralDocumentFactory(Document.PROFILE));
    Document.register(Document.BULLETIN, new GeneralDocumentFactory(Document.BULLETIN))
})(MingKeMing);
(function(ns) {
    var obj = ns.type.Object;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var AESKey = ns.crypto.AESKey;
    var PlainKey = ns.crypto.PlainKey;
    var AESKeyFactory = function() {
        obj.call(this)
    };
    ns.Class(AESKeyFactory, obj, [SymmetricKey.Factory]);
    AESKeyFactory.prototype.generateSymmetricKey = function() {
        return new AESKey({
            "algorithm": SymmetricKey.AES
        })
    };
    AESKeyFactory.prototype.parseSymmetricKey = function(key) {
        return new AESKey(key)
    };
    var PlainKeyFactory = function() {
        obj.call(this)
    };
    ns.Class(PlainKeyFactory, obj, [SymmetricKey.Factory]);
    PlainKeyFactory.prototype.generateSymmetricKey = function() {
        return PlainKey.getInstance()
    };
    PlainKeyFactory.prototype.parseSymmetricKey = function(key) {
        return PlainKey.getInstance()
    };
    var aes = new AESKeyFactory();
    SymmetricKey.register(SymmetricKey.AES, aes);
    SymmetricKey.register("AES/CBC/PKCS7Padding", aes);
    SymmetricKey.register(PlainKey.PLAIN, new PlainKeyFactory())
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = ns.crypto.RSAPrivateKey;
    var RSAPublicKey = ns.crypto.RSAPublicKey;
    var RSAPrivateKeyFactory = function() {
        obj.call(this)
    };
    ns.Class(RSAPrivateKeyFactory, obj, [PrivateKey.Factory]);
    RSAPrivateKeyFactory.prototype.generatePrivateKey = function() {
        return new RSAPrivateKey({
            "algorithm": AsymmetricKey.RSA
        })
    };
    RSAPrivateKeyFactory.prototype.parsePrivateKey = function(key) {
        return new RSAPrivateKey(key)
    };
    var RSAPublicKeyFactory = function() {
        obj.call(this)
    };
    ns.Class(RSAPublicKeyFactory, obj, [PublicKey.Factory]);
    RSAPublicKeyFactory.prototype.parsePublicKey = function(key) {
        return new RSAPublicKey(key)
    };
    var rsa_pri = new RSAPrivateKeyFactory();
    PrivateKey.register(AsymmetricKey.RSA, rsa_pri);
    PrivateKey.register("SHA256withRSA", rsa_pri);
    PrivateKey.register("RSA/ECB/PKCS1Padding", rsa_pri);
    var rsa_pub = new RSAPublicKeyFactory();
    PublicKey.register(AsymmetricKey.RSA, rsa_pub);
    PublicKey.register("SHA256withRSA", rsa_pub);
    PublicKey.register("RSA/ECB/PKCS1Padding", rsa_pub)
})(MONKEY);
if (typeof DIMSDK !== "object") {
    DIMSDK = new MingKeMing.Namespace()
}
(function(ns, base) {
    base.exports(ns);
    if (typeof ns.cpu !== "object") {
        ns.cpu = new ns.Namespace()
    }
    if (typeof ns.cpu.group !== "object") {
        ns.cpu.group = new ns.Namespace()
    }
    ns.registers("cpu");
    ns.cpu.registers("group")
})(DIMSDK, DIMP);
(function(ns) {
    var Envelope = ns.protocol.Envelope;
    var Command = ns.protocol.Command;
    var ReceiptCommand = function() {
        if (arguments.length === 3) {
            Command.call(this, Command.RECEIPT);
            this.setMessage(arguments[0]);
            if (arguments[1] > 0) {
                this.setSerialNumber(arguments[1])
            }
            this.setEnvelope(arguments[2])
        } else {
            if (typeof arguments[0] === "string") {
                Command.call(this, Command.RECEIPT);
                this.setMessage(arguments[0]);
                this.__envelope = null
            } else {
                Command.call(this, arguments[0]);
                this.__envelope = null
            }
        }
    };
    ns.Class(ReceiptCommand, Command, null);
    ReceiptCommand.prototype.setSerialNumber = function(sn) {
        this.setValue("sn", sn);
        this.sn = sn
    };
    ReceiptCommand.prototype.getMessage = function() {
        return this.getValue("message")
    };
    ReceiptCommand.prototype.setMessage = function(message) {
        this.setValue("message", message)
    };
    ReceiptCommand.prototype.getEnvelope = function() {
        if (!this.__envelope) {
            var env = this.getValue("envelope");
            if (!env) {
                var sender = this.getValue("sender");
                var receiver = this.getValue("receiver");
                if (sender && receiver) {
                    env = this.getMap()
                }
            }
            this.__envelope = Envelope.parse(env)
        }
        return this.__envelope
    };
    ReceiptCommand.prototype.setEnvelope = function(env) {
        this.setValue("envelope", null);
        if (env) {
            this.setValue("sender", env.getValue("sender"));
            this.setValue("receiver", env.getValue("receiver"));
            var time = env.getValue("time");
            if (time) {
                this.setValue("time", time)
            }
            var group = env.getValue("group");
            if (group) {
                this.setValue("group", group)
            }
        }
        this.__envelope = env
    };
    ReceiptCommand.prototype.getSignature = function() {
        var signature = this.getValue("signature");
        if (typeof signature === "string") {
            signature = ns.format.Base64.decode(signature)
        }
        return signature
    };
    ReceiptCommand.prototype.setSignature = function(signature) {
        if (signature instanceof Uint8Array) {
            signature = ns.format.Base64.encode(signature)
        }
        if (typeof signature === "string") {
            this.setValue("signature", signature)
        }
    };
    ns.protocol.ReceiptCommand = ReceiptCommand;
    ns.protocol.registers("ReceiptCommand")
})(DIMSDK);
(function(ns) {
    var HandshakeState = ns.type.Enum(null, {
        INIT: 0,
        START: 1,
        AGAIN: 2,
        RESTART: 3,
        SUCCESS: 4
    });
    var START_MESSAGE = "Hello world!";
    var AGAIN_MESSAGE = "DIM?";
    var SUCCESS_MESSAGE = "DIM!";
    var get_state = function(text, session) {
        if (text === SUCCESS_MESSAGE || text === "OK!") {
            return HandshakeState.SUCCESS
        } else {
            if (text === AGAIN_MESSAGE) {
                return HandshakeState.AGAIN
            } else {
                if (text !== START_MESSAGE) {
                    return HandshakeState.INIT
                } else {
                    if (session) {
                        return HandshakeState.RESTART
                    } else {
                        return HandshakeState.START
                    }
                }
            }
        }
    };
    var Command = ns.protocol.Command;
    var HandshakeCommand = function() {
        if (arguments.length === 1) {
            Command.call(this, arguments[0])
        } else {
            if (arguments.length === 2) {
                Command.call(this, Command.HANDSHAKE);
                var text = arguments[0];
                if (text) {
                    this.setValue("message", text)
                } else {
                    this.setValue("message", START_MESSAGE)
                }
                var session = arguments[1];
                if (session) {
                    this.setValue("session", session)
                }
            }
        }
    };
    ns.Class(HandshakeCommand, Command, null);
    HandshakeCommand.prototype.getMessage = function() {
        return this.getValue("message")
    };
    HandshakeCommand.prototype.getSessionKey = function() {
        return this.getValue("session")
    };
    HandshakeCommand.prototype.getState = function() {
        return get_state(this.getMessage(), this.getSessionKey())
    };
    HandshakeCommand.start = function() {
        return new HandshakeCommand(null, null)
    };
    HandshakeCommand.restart = function(session) {
        return new HandshakeCommand(null, session)
    };
    HandshakeCommand.again = function(session) {
        return new HandshakeCommand(AGAIN_MESSAGE, session)
    };
    HandshakeCommand.success = function() {
        return new HandshakeCommand(SUCCESS_MESSAGE, null)
    };
    ns.protocol.HandshakeCommand = HandshakeCommand;
    ns.protocol.HandshakeState = HandshakeState;
    ns.protocol.registers("HandshakeCommand");
    ns.protocol.registers("HandshakeState")
})(DIMSDK);
(function(ns) {
    var map = ns.type.Map;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var Station = ns.Station;
    var LoginCommand = function(info) {
        if (ns.Interface.conforms(info, ID)) {
            Command.call(this, Command.LOGIN);
            this.setValue("ID", info.toString())
        } else {
            Command.call(this, info)
        }
    };
    ns.Class(LoginCommand, Command, null);
    LoginCommand.prototype.getIdentifier = function() {
        return ID.parse(this.getValue("ID"))
    };
    LoginCommand.prototype.getDevice = function() {
        return this.getValue("device")
    };
    LoginCommand.prototype.setDevice = function(device) {
        this.setValue("device", device)
    };
    LoginCommand.prototype.getAgent = function() {
        return this.getValue("agent")
    };
    LoginCommand.prototype.setAgent = function(UA) {
        this.setValue("agent", UA)
    };
    LoginCommand.prototype.getStation = function() {
        return this.getValue("station")
    };
    LoginCommand.prototype.setStation = function(station) {
        var info;
        if (station instanceof Station) {
            info = {
                "host": station.getHost(),
                "port": station.getPort(),
                "ID": station.identifier.toString()
            }
        } else {
            if (ns.Interface.conforms(station, map)) {
                info = station.getMap()
            } else {
                info = station
            }
        }
        this.setValue("station", info)
    };
    LoginCommand.prototype.getProvider = function() {
        return this.getValue("provider")
    };
    LoginCommand.prototype.setProvider = function(provider) {
        var info;
        if (provider instanceof ns.ServiceProvider) {
            info = {
                "ID": provider.identifier.toString()
            }
        } else {
            if (ns.Interface.conforms(provider, ID)) {
                info = {
                    "ID": provider.toString()
                }
            } else {
                if (ns.Interface.conforms(provider, map)) {
                    info = provider.getMap()
                } else {
                    info = provider
                }
            }
        }
        this.setValue("provider", info)
    };
    ns.protocol.LoginCommand = LoginCommand;
    ns.protocol.registers("LoginCommand")
})(DIMSDK);
(function(ns) {
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var MuteCommand = function(info) {
        if (arguments.length === 0) {
            Command.call(this, MuteCommand.MUTE);
            this.__list = null
        } else {
            if (arguments[0] instanceof Array) {
                Command.call(this, MuteCommand.MUTE);
                this.setBlockCList(arguments[0])
            } else {
                Command.call(this, arguments[0]);
                this.__list = null
            }
        }
    };
    ns.Class(MuteCommand, Command, null);
    MuteCommand.MUTE = "mute";
    MuteCommand.getMuteList = function(cmd) {
        var list = cmd["list"];
        if (list && list.length > 0) {
            return ID.convert(list)
        } else {
            return list
        }
    };
    MuteCommand.setMuteList = function(list, cmd) {
        if (list && list.length > 0) {
            cmd["list"] = ID.revert(list)
        } else {
            delete cmd["list"]
        }
    };
    MuteCommand.prototype.getMuteCList = function() {
        if (!this.__list) {
            this.__list = MuteCommand.getMuteList(this.getMap())
        }
        return this.__list
    };
    MuteCommand.prototype.setMuteCList = function(list) {
        MuteCommand.setMuteList(list, this.getMap());
        this.__list = list
    };
    ns.protocol.MuteCommand = MuteCommand;
    ns.protocol.registers("MuteCommand")
})(DIMSDK);
(function(ns) {
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var BlockCommand = function() {
        if (arguments.length === 0) {
            Command.call(this, BlockCommand.BLOCK);
            this.__list = null
        } else {
            if (arguments[0] instanceof Array) {
                Command.call(this, BlockCommand.BLOCK);
                this.setBlockCList(arguments[0])
            } else {
                Command.call(this, arguments[0]);
                this.__list = null
            }
        }
    };
    ns.Class(BlockCommand, Command, null);
    BlockCommand.BLOCK = "block";
    BlockCommand.getBlockList = function(cmd) {
        var list = cmd["list"];
        if (list && list.length > 0) {
            return ID.convert(list)
        } else {
            return list
        }
    };
    BlockCommand.setBlockList = function(list, cmd) {
        if (list && list.length > 0) {
            cmd["list"] = ID.revert(list)
        } else {
            delete cmd["list"]
        }
    };
    BlockCommand.prototype.getBlockCList = function() {
        if (!this.__list) {
            this.__list = BlockCommand.getBlockList(this.getMap())
        }
        return this.__list
    };
    BlockCommand.prototype.setBlockCList = function(list) {
        BlockCommand.setBlockList(list, this.getMap());
        this.__list = list
    };
    ns.protocol.BlockCommand = BlockCommand;
    ns.protocol.registers("BlockCommand")
})(DIMSDK);
(function(ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var StorageCommand = function(info) {
        if (typeof info === "string") {
            Command.call(this, StorageCommand.STORAGE);
            this.setTitle(info)
        } else {
            Command.call(this, info)
        }
        this.__data = null;
        this.__plaintext = null;
        this.__key = null;
        this.__password = null
    };
    ns.Class(StorageCommand, Command, null);
    StorageCommand.prototype.getTitle = function() {
        var title = this.getValue("title");
        if (title && title.length > 0) {
            return title
        } else {
            return this.getCommand()
        }
    };
    StorageCommand.prototype.setTitle = function(title) {
        this.setValue("title", title)
    };
    StorageCommand.prototype.getIdentifier = function() {
        return ID.parse(this.getValue("ID"))
    };
    StorageCommand.prototype.setIdentifier = function(identifier) {
        if (ns.Interface.conforms(identifier, ID)) {
            this.setValue("ID", identifier.toString())
        } else {
            this.setValue("ID", null)
        }
    };
    StorageCommand.prototype.getData = function() {
        if (!this.__data) {
            var base64 = this.getValue("data");
            if (base64) {
                this.__data = ns.format.Base64.decode(base64)
            }
        }
        return this.__data
    };
    StorageCommand.prototype.setData = function(data) {
        var base64 = null;
        if (data) {
            base64 = ns.format.Base64.encode(data)
        }
        this.setValue("data", base64);
        this.__data = data;
        this.__plaintext = null
    };
    StorageCommand.prototype.getKey = function() {
        if (!this.__key) {
            var base64 = this.getValue("key");
            if (base64) {
                this.__key = ns.format.Base64.decode(base64)
            }
        }
        return this.__key
    };
    StorageCommand.prototype.setKey = function(data) {
        var base64 = null;
        if (data) {
            base64 = ns.format.Base64.encode(data)
        }
        this.setValue("key", base64);
        this.__key = data;
        this.__password = null
    };
    StorageCommand.prototype.decrypt = function(key) {
        if (!this.__plaintext) {
            var pwd = null;
            if (ns.Interface.conforms(key, PrivateKey)) {
                pwd = this.decryptKey(key);
                if (!pwd) {
                    throw new Error("failed to decrypt key: " + key)
                }
            } else {
                if (ns.Interface.conforms(key, SymmetricKey)) {
                    pwd = key
                } else {
                    throw new TypeError("Decryption key error: " + key)
                }
            }
            var data = this.getData();
            this.__plaintext = pwd.decrypt(data)
        }
        return this.__plaintext
    };
    StorageCommand.prototype.decryptKey = function(privateKey) {
        if (!this.__password) {
            var key = this.getKey();
            key = privateKey.decrypt(key);
            var dict = ns.format.JSON.decode(key);
            this.__password = SymmetricKey.parse(dict)
        }
        return this.__password
    };
    StorageCommand.STORAGE = "storage";
    StorageCommand.CONTACTS = "contacts";
    StorageCommand.PRIVATE_KEY = "private_key";
    ns.protocol.StorageCommand = StorageCommand;
    ns.protocol.registers("StorageCommand")
})(DIMSDK);
(function(ns) {
    var obj = ns.type.Object;
    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var TextContent = ns.protocol.TextContent;
    var ContentProcessor = function() {
        obj.call(this);
        this.__messenger = null
    };
    ns.Class(ContentProcessor, obj, null);
    ContentProcessor.prototype.getMessenger = function() {
        return this.__messenger
    };
    ContentProcessor.prototype.setMessenger = function(messenger) {
        this.__messenger = messenger
    };
    ContentProcessor.prototype.getFacebook = function() {
        return this.getMessenger().getFacebook()
    };
    ContentProcessor.prototype.process = function(content, rMsg) {
        var text = "Content (type: " + content.getType() + ") not support yet!";
        var res = new TextContent(text);
        var group = content.getGroup();
        if (group) {
            res.setGroup(group)
        }
        return res
    };
    var contentProcessors = {};
    ContentProcessor.getProcessor = function(info) {
        if (ns.Interface.conforms(info, Content)) {
            return contentProcessors[info.getType()]
        } else {
            if (info instanceof ContentType) {
                return contentProcessors[info.valueOf()]
            } else {
                return contentProcessors[info]
            }
        }
    };
    ContentProcessor.register = function(type, cpu) {
        if (type instanceof ContentType) {
            contentProcessors[type.valueOf()] = cpu
        } else {
            contentProcessors[type] = cpu
        }
    };
    ns.cpu.ContentProcessor = ContentProcessor;
    ns.cpu.registers("ContentProcessor")
})(DIMSDK);
(function(ns) {
    var TextContent = ns.protocol.TextContent;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var CommandProcessor = function() {
        ContentProcessor.call(this)
    };
    ns.Class(CommandProcessor, ContentProcessor, null);
    CommandProcessor.prototype.execute = function(cmd, rMsg) {
        var text = "Command (name: " + cmd.getCommand() + ") not support yet!";
        var res = new TextContent(text);
        var group = cmd.getGroup();
        if (group) {
            res.setGroup(group)
        }
        return res
    };
    CommandProcessor.prototype.process = function(cmd, rMsg) {
        var cpu = CommandProcessor.getProcessor(cmd);
        if (!cpu) {
            if (cmd instanceof GroupCommand) {
                cpu = CommandProcessor.getProcessor("group")
            }
        }
        if (cpu) {
            cpu.setMessenger(this.getMessenger())
        } else {
            cpu = this
        }
        return cpu.execute(cmd, rMsg)
    };
    var commandProcessors = {};
    CommandProcessor.getProcessor = function(command) {
        if (command instanceof Command) {
            return commandProcessors[command.getCommand()]
        } else {
            return commandProcessors[command]
        }
    };
    CommandProcessor.register = function(command, cpu) {
        commandProcessors[command] = cpu
    };
    ns.cpu.CommandProcessor = CommandProcessor;
    ns.cpu.registers("CommandProcessor")
})(DIMSDK);
(function(ns) {
    var ForwardContent = ns.protocol.ForwardContent;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var ForwardContentProcessor = function() {
        ContentProcessor.call(this)
    };
    ns.Class(ForwardContentProcessor, ContentProcessor, null);
    ForwardContentProcessor.prototype.process = function(content, rMsg) {
        var secret = content.getMessage();
        secret = this.getMessenger().processReliableMessage(secret);
        if (secret) {
            return new ForwardContent(secret)
        }
        return null
    };
    ns.cpu.ForwardContentProcessor = ForwardContentProcessor;
    ns.cpu.registers("ForwardContentProcessor")
})(DIMSDK);
(function(ns) {
    var FileContent = ns.protocol.FileContent;
    var InstantMessage = ns.protocol.InstantMessage;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var FileContentProcessor = function() {
        ContentProcessor.call(this)
    };
    ns.Class(FileContentProcessor, ContentProcessor, null);
    FileContentProcessor.prototype.uploadFileContent = function(content, pwd, iMsg) {
        var data = content.getData();
        if (!data || data.length === 0) {
            return false
        }
        var encrypted = pwd.encrypt(data);
        if (!encrypted || encrypted.length === 0) {
            throw new Error("failed to encrypt file data with key: " + pwd.getMap())
        }
        var url = this.getMessenger().uploadData(encrypted, iMsg);
        if (url) {
            content.setURL(url);
            content.setData(null);
            return true
        } else {
            return false
        }
    };
    FileContentProcessor.prototype.downloadFileContent = function(content, pwd, sMsg) {
        var url = content.getURL();
        if (!url || !url.indexOf("://") < 3) {
            return false
        }
        var iMsg = InstantMessage.create(sMsg.getEnvelope(), content);
        var encrypted = this.getMessenger().downloadData(url, iMsg);
        if (!encrypted || encrypted.length === 0) {
            content.setPassword(pwd);
            return false
        } else {
            var data = pwd.decrypt(encrypted);
            if (!data || data.length === 0) {
                throw new Error("failed to decrypt file data with key: " + pwd.getMap())
            }
            content.setData(data);
            content.setURL(null);
            return true
        }
    };
    FileContentProcessor.prototype.process = function(content, rMsg) {
        return null
    };
    ns.cpu.FileContentProcessor = FileContentProcessor;
    ns.cpu.registers("FileContentProcessor")
})(DIMSDK);
(function(ns) {
    var TextContent = ns.protocol.TextContent;
    var MetaCommand = ns.protocol.MetaCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var MetaCommandProcessor = function() {
        CommandProcessor.call(this)
    };
    ns.Class(MetaCommandProcessor, CommandProcessor, null);
    var get_meta = function(identifier, facebook) {
        var meta = facebook.getMeta(identifier);
        if (!meta) {
            var text = "Sorry, meta not found for ID: " + identifier;
            return new TextContent(text)
        }
        return MetaCommand.response(identifier, meta)
    };
    var put_meta = function(identifier, meta, facebook) {
        if (!facebook.saveMeta(meta, identifier)) {
            return new TextContent("Meta not accept: " + identifier)
        }
        return new ReceiptCommand("Meta received: " + identifier)
    };
    MetaCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var identifier = cmd.getIdentifier();
        if (identifier) {
            var meta = cmd.getMeta();
            if (meta) {
                return put_meta.call(this, identifier, meta, this.getFacebook())
            } else {
                return get_meta.call(this, identifier, this.getFacebook())
            }
        }
        return null
    };
    ns.cpu.MetaCommandProcessor = MetaCommandProcessor;
    ns.cpu.registers("MetaCommandProcessor")
})(DIMSDK);
(function(ns) {
    var TextContent = ns.protocol.TextContent;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var MetaCommandProcessor = ns.cpu.MetaCommandProcessor;
    var DocumentCommandProcessor = function() {
        MetaCommandProcessor.call(this)
    };
    ns.Class(DocumentCommandProcessor, MetaCommandProcessor, null);
    var get_doc = function(identifier, type, facebook) {
        var doc = facebook.getDocument(identifier, type);
        if (!doc) {
            var text = "Sorry, document not found for ID: " + identifier;
            return new TextContent(text)
        }
        var meta = facebook.getMeta(identifier);
        return DocumentCommand.response(identifier, meta, doc)
    };
    var put_doc = function(identifier, meta, doc, facebook) {
        if (meta) {
            if (!facebook.saveMeta(meta, identifier)) {
                return new TextContent("Meta not accept: " + identifier)
            }
        }
        if (!facebook.saveDocument(doc)) {
            return new TextContent("Document not accept: " + identifier)
        }
        return new ReceiptCommand("Document received: " + identifier)
    };
    DocumentCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var identifier = cmd.getIdentifier();
        if (identifier) {
            var doc = cmd.getDocument();
            if (!doc) {
                var type = cmd.getValue("doc_type");
                if (!type) {
                    type = "*"
                }
                return get_doc(identifier, type, this.getFacebook())
            } else {
                if (identifier.equals(doc.getIdentifier())) {
                    var meta = cmd.getMeta();
                    return put_doc(identifier, meta, doc, this.getFacebook())
                }
            }
        }
        return null
    };
    ns.cpu.DocumentCommandProcessor = DocumentCommandProcessor;
    ns.cpu.registers("DocumentCommandProcessor")
})(DIMSDK);
(function(ns) {
    var TextContent = ns.protocol.TextContent;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var HistoryCommandProcessor = function() {
        CommandProcessor.call(this)
    };
    ns.Class(HistoryCommandProcessor, CommandProcessor, null);
    HistoryCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var text = "History command (name: " + cmd.getCommand() + ") not support yet!";
        var res = new TextContent(text);
        var group = cmd.getGroup();
        if (group) {
            res.setGroup(group)
        }
        return res
    };
    ns.cpu.HistoryCommandProcessor = HistoryCommandProcessor;
    ns.cpu.registers("HistoryCommandProcessor")
})(DIMSDK);
(function(ns) {
    var TextContent = ns.protocol.TextContent;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor;
    var GroupCommandProcessor = function() {
        HistoryCommandProcessor.call(this)
    };
    ns.Class(GroupCommandProcessor, HistoryCommandProcessor, null);
    GroupCommandProcessor.getProcessor = CommandProcessor.getProcessor;
    GroupCommandProcessor.prototype.getMembers = function(cmd) {
        var members = cmd.getMembers();
        if (members) {
            return members
        }
        var member = cmd.getMember();
        if (member) {
            return [member]
        } else {
            return []
        }
    };
    GroupCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var text = "Group command (name: " + cmd.getCommand() + ") not support yet!";
        var res = new TextContent(text);
        res.setGroup(cmd.getGroup());
        return res
    };
    GroupCommandProcessor.prototype.process = function(cmd, rMsg) {
        var cpu = CommandProcessor.getProcessor(cmd);
        if (cpu) {
            cpu.setMessenger(this.getMessenger())
        } else {
            cpu = this
        }
        return cpu.execute(cmd, rMsg)
    };
    ns.cpu.GroupCommandProcessor = GroupCommandProcessor;
    ns.cpu.registers("GroupCommandProcessor")
})(DIMSDK);
(function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var InviteCommandProcessor = function() {
        GroupCommandProcessor.call(this)
    };
    ns.Class(InviteCommandProcessor, GroupCommandProcessor, null);
    var call_reset = function(cmd, rMsg) {
        var gpu = GroupCommandProcessor.getProcessor(GroupCommand.RESET);
        gpu.setMessenger(this.getMessenger());
        return gpu.execute(cmd, rMsg)
    };
    InviteCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        var owner = facebook.getOwner(group);
        var members = facebook.getMembers(group);
        if (!owner || !members || members.length === 0) {
            return call_reset.call(this, cmd, rMsg)
        }
        var sender = rMsg.getSender();
        if (members.indexOf(sender) < 0) {
            var assistants = facebook.getAssistants(group);
            if (!assistants || assistants.indexOf(sender) < 0) {
                throw new EvalError(sender.toString() + " is not a member/assistant of group " + group.toString() + ", cannot invite member.")
            }
        }
        var invites = this.getMembers(cmd);
        if (invites.length === 0) {
            throw new EvalError("invite command error: " + cmd.getMap())
        }
        if (sender.equals(owner) && invites.indexOf(owner) >= 0) {
            return call_reset.call(this, cmd, rMsg)
        }
        var adds = [];
        var item, pos;
        for (var i = 0; i < invites.length; ++i) {
            item = invites[i];
            pos = members.indexOf(item);
            if (pos >= 0) {
                continue
            }
            adds.push(item.toString());
            members.push(item)
        }
        if (adds.length > 0) {
            if (facebook.saveMembers(members, group)) {
                cmd.setValue("added", adds)
            }
        }
        return null
    };
    ns.cpu.group.InviteCommandProcessor = InviteCommandProcessor;
    ns.cpu.group.registers("InviteCommandProcessor")
})(DIMSDK);
(function(ns) {
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var ExpelCommandProcessor = function() {
        GroupCommandProcessor.call(this)
    };
    ns.Class(ExpelCommandProcessor, GroupCommandProcessor, null);
    ExpelCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        var owner = facebook.getOwner(group);
        var members = facebook.getMembers(group);
        if (!owner || !members || members.length === 0) {
            throw new EvalError("group not ready: " + group.toString())
        }
        var sender = rMsg.getSender();
        if (!owner.equals(sender)) {
            var assistants = facebook.getAssistants(group);
            if (!assistants || assistants.indexOf(sender) < 0) {
                throw new EvalError(sender.toString() + " is not the owner/assistant of group " + group.toString() + ", cannot expel member.")
            }
        }
        var expels = this.getMembers(cmd);
        if (expels.length === 0) {
            throw new EvalError("expel command error: " + cmd.getMap())
        }
        if (expels.indexOf(owner)) {
            throw new EvalError("cannot expel owner " + owner.toString() + " of group " + group.toString())
        }
        var removes = [];
        var item, pos;
        for (var i = 0; i < expels.length; ++i) {
            item = expels[i];
            pos = members.indexOf(item);
            if (pos < 0) {
                continue
            }
            removes.push(item.toString());
            members.splice(pos, 1)
        }
        if (removes.length > 0) {
            if (facebook.saveMembers(members, group)) {
                cmd.setValue("removed", removes)
            }
        }
        return null
    };
    ns.cpu.group.ExpelCommandProcessor = ExpelCommandProcessor;
    ns.cpu.group.registers("ExpelCommandProcessor")
})(DIMSDK);
(function(ns) {
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var QuitCommandProcessor = function() {
        GroupCommandProcessor.call(this)
    };
    ns.Class(QuitCommandProcessor, GroupCommandProcessor, null);
    QuitCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        var owner = facebook.getOwner(group);
        var members = facebook.getMembers(group);
        if (!owner || !members || members.length === 0) {
            throw new EvalError("group not ready: " + group.toString())
        }
        var sender = rMsg.getSender();
        if (owner.equals(sender)) {
            throw new EvalError("owner cannot quit: " + sender.toString() + " -> " + group.toString())
        }
        var assistants = facebook.getAssistants(group);
        if (assistants && assistants.indexOf(sender) >= 0) {
            throw new EvalError("assistant cannot quit: " + sender.toString() + " -> " + group.toString())
        }
        var pos = members.indexOf(sender);
        if (pos > 0) {
            members.splice(pos, 1);
            facebook.saveMembers(members, group)
        }
        return null
    };
    ns.cpu.group.QuitCommandProcessor = QuitCommandProcessor;
    ns.cpu.group.registers("QuitCommandProcessor")
})(DIMSDK);
(function(ns) {
    var TextContent = ns.protocol.TextContent;
    var InviteCommand = ns.protocol.InviteCommand;
    var ResetCommand = ns.protocol.group.ResetCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var QueryCommandProcessor = function() {
        GroupCommandProcessor.call(this)
    };
    ns.Class(QueryCommandProcessor, GroupCommandProcessor, null);
    QueryCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        var owner = facebook.getOwner(group);
        var members = facebook.getMembers(group);
        if (!owner || !members || members.length === 0) {
            var text = "Sorry, members not found in group: " + group.toString();
            var res = new TextContent(text);
            res.setGroup(group);
            return res
        }
        var sender = rMsg.getSender();
        if (members.indexOf(sender) < 0) {
            var assistants = facebook.getAssistants(group);
            if (!assistants || assistants.indexOf(sender) < 0) {
                throw new EvalError(sender.toString() + " is not a member/assistant of group " + group.toString() + ", cannot query.")
            }
        }
        var user = facebook.getCurrentUser();
        if (owner.equals(user.identifier)) {
            return new ResetCommand(group, members)
        } else {
            return new InviteCommand(group, members)
        }
    };
    ns.cpu.group.QueryCommandProcessor = QueryCommandProcessor;
    ns.cpu.group.registers("QueryCommandProcessor")
})(DIMSDK);
(function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var ResetCommandProcessor = function() {
        GroupCommandProcessor.call(this)
    };
    ns.Class(ResetCommandProcessor, GroupCommandProcessor, null);
    var save = function(cmd, sender) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        var newMembers = this.getMembers(cmd);
        var item;
        for (var i = 0; i < newMembers.length; ++i) {
            item = newMembers[i];
            if (facebook.isOwner(item, group)) {
                if (facebook.saveMembers(newMembers, group)) {
                    if (!item.equals(sender)) {
                        cmd = GroupCommand.query(group);
                        this.getMessenger().sendContent(null, item, cmd, null, 1)
                    }
                }
                return null
            }
        }
        return GroupCommand.query(group)
    };
    ResetCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        var owner = facebook.getOwner(group);
        var members = facebook.getMembers(group);
        if (!owner || !members || members.length === 0) {
            return save.call(this, cmd, rMsg.getSender())
        }
        var sender = rMsg.getSender();
        if (members.indexOf(sender) < 0) {
            var assistants = facebook.getAssistants(group);
            if (!assistants || assistants.indexOf(sender) < 0) {
                throw new EvalError(sender.toString() + " is not a member/assistant of group " + group.toString() + ", cannot reset member.")
            }
        }
        var newMembers = this.getMembers(cmd);
        if (newMembers.length === 0) {
            throw new EvalError("reset command error: " + cmd.getMap())
        }
        if (newMembers.indexOf(owner) < 0) {
            throw new EvalError("cannot expel owner " + owner.toString() + " of group " + group.toString())
        }
        var removes = [];
        var item, i;
        for (i = 0; i < members.length; ++i) {
            item = members[i];
            if (newMembers.indexOf(item) < 0) {
                removes.push(item.toString())
            }
        }
        var adds = [];
        for (i = 0; i < newMembers.length; ++i) {
            item = newMembers[i];
            if (members.indexOf(item) < 0) {
                adds.push(item.toString())
            }
        }
        if (adds.length > 0 || removes.length > 0) {
            if (facebook.saveMembers(newMembers, group)) {
                if (adds.length > 0) {
                    cmd.setValue("added", adds)
                }
                if (removes.length > 0) {
                    cmd.setValue("removed", removes)
                }
            }
        }
        return null
    };
    ns.cpu.group.ResetCommandProcessor = ResetCommandProcessor;
    ns.cpu.group.registers("ResetCommandProcessor")
})(DIMSDK);
(function(ns) {
    var Group = ns.Group;
    var Polylogue = function(identifier) {
        Group.call(this, identifier)
    };
    ns.Class(Polylogue, Group, null);
    Polylogue.prototype.getOwner = function() {
        var owner = Group.prototype.getOwner.call(this);
        if (owner) {
            return owner
        }
        return this.getFounder()
    };
    ns.Polylogue = Polylogue;
    ns.registers("Polylogue")
})(DIMSDK);
(function(ns) {
    var Group = ns.Group;
    var Chatroom = function(identifier) {
        Group.call(this, identifier)
    };
    ns.Class(Chatroom, Group, null);
    Chatroom.prototype.getAdmins = function() {
        return this.getDataSource().getAdmins(this.identifier)
    };
    var ChatroomDataSource = function() {};
    ns.Interface(ChatroomDataSource, [Group.DataSource]);
    ChatroomDataSource.prototype.getAdmins = function() {
        console.assert(false, "implement me!");
        return null
    };
    Chatroom.DataSource = ChatroomDataSource;
    ns.Chatroom = Chatroom;
    ns.registers("Chatroom")
})(DIMSDK);
(function(ns) {
    var User = ns.User;
    var Robot = function(identifier) {
        User.call(this, identifier)
    };
    ns.Class(Robot, User, null);
    ns.Robot = Robot;
    ns.registers("Robot")
})(DIMSDK);
(function(ns) {
    var User = ns.User;
    var Station = function(identifier, host, port) {
        User.call(this, identifier);
        this.host = host;
        this.port = port
    };
    ns.Class(Station, User, null);
    Station.prototype.getHost = function() {
        if (!this.host) {
            var doc = this.getDocument("*");
            if (doc) {
                this.host = doc.getProperty("host")
            }
            if (!this.host) {
                this.host = "0.0.0.0"
            }
        }
        return this.host
    };
    Station.prototype.getPort = function() {
        if (!this.port) {
            var doc = this.getDocument("*");
            if (doc) {
                this.port = doc.getProperty("port")
            }
            if (!this.port) {
                this.port = 9394
            }
        }
        return this.port
    };
    ns.Station = Station;
    ns.registers("Station")
})(DIMSDK);
(function(ns) {
    var Group = ns.Group;
    var ServiceProvider = function(identifier) {
        Group.call(this, identifier)
    };
    ns.Class(ServiceProvider, Group, null);
    ServiceProvider.prototype.getStations = function() {
        return this.getMembers()
    };
    ns.ServiceProvider = ServiceProvider;
    ns.registers("ServiceProvider")
})(DIMSDK);
(function(ns) {
    var KEYWORDS = ["all", "everyone", "anyone", "owner", "founder", "dkd", "mkm", "dimp", "dim", "dimt", "rsa", "ecc", "aes", "des", "btc", "eth", "crypto", "key", "symmetric", "asymmetric", "public", "private", "secret", "password", "id", "address", "meta", "profile", "entity", "user", "group", "contact", "member", "admin", "administrator", "assistant", "main", "polylogue", "chatroom", "social", "organization", "company", "school", "government", "department", "provider", "station", "thing", "robot", "message", "instant", "secure", "reliable", "envelope", "sender", "receiver", "time", "content", "forward", "command", "history", "keys", "data", "signature", "type", "serial", "sn", "text", "file", "image", "audio", "video", "page", "handshake", "receipt", "block", "mute", "register", "suicide", "found", "abdicate", "invite", "expel", "join", "quit", "reset", "query", "hire", "fire", "resign", "server", "client", "terminal", "local", "remote", "barrack", "cache", "transceiver", "ans", "facebook", "store", "messenger", "root", "supervisor"];
    var obj = ns.type.Object;
    var ID = ns.protocol.ID;
    var AddressNameService = function() {
        obj.call(this);
        var caches = {
            "all": ID.EVERYONE,
            "everyone": ID.EVERYONE,
            "anyone": ID.ANYONE,
            "owner": ID.ANYONE,
            "founder": ID.FOUNDER
        };
        var reserved = {};
        var keywords = AddressNameService.KEYWORDS;
        for (var i = 0; i < keywords.length; ++i) {
            reserved[keywords[i]] = true
        }
        this.__reserved = reserved;
        this.__caches = caches
    };
    ns.Class(AddressNameService, obj, null);
    AddressNameService.KEYWORDS = KEYWORDS;
    AddressNameService.prototype.isReserved = function(name) {
        return this.__reserved[name] === true
    };
    AddressNameService.prototype.cache = function(name, identifier) {
        if (this.isReserved(name)) {
            return false
        }
        if (identifier) {
            this.__caches[name] = identifier
        } else {
            delete this.__caches[name]
        }
        return true
    };
    AddressNameService.prototype.getIdentifier = function(name) {
        return this.__caches[name]
    };
    AddressNameService.prototype.getNames = function(identifier) {
        var array = [];
        var keys = Object.keys(this.__caches);
        var name;
        for (var i = 0; i < keys.length; ++i) {
            name = keys[i];
            if (this.__caches[name] === identifier) {
                array.push(name)
            }
        }
        return array
    };
    AddressNameService.prototype.save = function(name, identifier) {
        return this.cache(name, identifier)
    };
    ns.AddressNameService = AddressNameService;
    ns.registers("AddressNameService")
})(DIMSDK);
(function(ns) {
    var Callback = function() {};
    ns.Interface(Callback, null);
    Callback.prototype.onFinished = function(result, error) {
        console.assert(false, "implement me!")
    };
    ns.Callback = Callback;
    ns.registers("Callback")
})(DIMSDK);
(function(ns) {
    var CompletionHandler = function() {};
    ns.Interface(CompletionHandler, null);
    CompletionHandler.prototype.onSuccess = function() {
        console.assert(false, "implement me!")
    };
    CompletionHandler.prototype.onFailed = function(error) {
        console.assert(false, "implement me!")
    };
    ns.CompletionHandler = CompletionHandler;
    ns.registers("CompletionHandler")
})(DIMSDK);
(function(ns) {
    var MessengerDelegate = function() {};
    ns.Interface(MessengerDelegate, null);
    MessengerDelegate.prototype.uploadData = function(data, iMsg) {
        console.assert(false, "implement me!");
        return null
    };
    MessengerDelegate.prototype.downloadData = function(url, iMsg) {
        console.assert(false, "implement me!");
        return null
    };
    MessengerDelegate.prototype.sendPackage = function(data, handler, priority) {
        console.assert(false, "implement me!");
        return false
    };
    ns.MessengerDelegate = MessengerDelegate;
    ns.registers("MessengerDelegate")
})(DIMSDK);
(function(ns) {
    var MessengerDataSource = function() {};
    ns.Interface(MessengerDataSource, null);
    MessengerDataSource.prototype.saveMessage = function(iMsg) {
        console.assert(false, "implement me!");
        return false
    };
    MessengerDataSource.prototype.suspendReliableMessage = function(rMsg) {
        console.assert(false, "implement me!")
    };
    MessengerDataSource.prototype.suspendInstantMessage = function(iMsg) {
        console.assert(false, "implement me!")
    };
    ns.MessengerDataSource = MessengerDataSource;
    ns.registers("MessengerDataSource")
})(DIMSDK);
(function(ns) {
    var NetworkType = ns.protocol.NetworkType;
    var ID = ns.protocol.ID;
    var User = ns.User;
    var Robot = ns.Robot;
    var Station = ns.Station;
    var Group = ns.Group;
    var Polylogue = ns.Polylogue;
    var Chatroom = ns.Chatroom;
    var ServiceProvider = ns.ServiceProvider;
    var Barrack = ns.core.Barrack;
    var Facebook = function() {
        Barrack.call(this)
    };
    ns.Class(Facebook, Barrack, null);
    Facebook.prototype.getCurrentUser = function() {
        var users = this.getLocalUsers();
        if (!users || users.length === 0) {
            return null
        }
        return users[0]
    };
    Facebook.prototype.saveMeta = function(meta, identifier) {
        console.assert(false, "implement me!");
        return false
    };
    Facebook.prototype.saveDocument = function(doc) {
        console.assert(false, "implement me!");
        return false
    };
    Facebook.prototype.saveMembers = function(members, identifier) {
        console.assert(false, "implement me!");
        return false
    };
    Facebook.prototype.checkDocument = function(doc) {
        var identifier = doc.getIdentifier();
        if (!identifier) {
            return false
        }
        var meta;
        if (identifier.isGroup()) {
            var owner = this.getOwner(identifier);
            if (!owner) {
                if (NetworkType.POLYLOGUE.equals(identifier.getType())) {
                    meta = this.getMeta(identifier)
                } else {
                    return false
                }
            } else {
                meta = this.getMeta(owner)
            }
        } else {
            meta = this.getMeta(identifier)
        }
        return meta && doc.verify(meta.key)
    };
    Facebook.prototype.isFounder = function(member, group) {
        var gMeta = this.getMeta(group);
        if (!gMeta) {
            return false
        }
        var mMeta = this.getMeta(member);
        if (!mMeta) {
            return false
        }
        return gMeta.matches(mMeta.key)
    };
    Facebook.prototype.isOwner = function(member, group) {
        if (NetworkType.POLYLOGUE.equals(group.getType())) {
            return this.isFounder(member, group)
        }
        throw new Error("only Polylogue so far")
    };
    Facebook.prototype.createUser = function(identifier) {
        if (identifier.isBroadcast()) {
            return new User(identifier)
        }
        var type = identifier.getType();
        if (NetworkType.MAIN.equals(type) || NetworkType.BTC_MAIN.equals(type)) {
            return new User(identifier)
        }
        if (NetworkType.ROBOT.equals(type)) {
            return new Robot(identifier)
        }
        if (NetworkType.STATION.equals(type)) {
            return new Station(identifier)
        }
        throw new TypeError("Unsupported user type: " + type)
    };
    Facebook.prototype.createGroup = function(identifier) {
        if (identifier.isBroadcast()) {
            return new Group(identifier)
        }
        var type = identifier.getType();
        if (NetworkType.POLYLOGUE.equals(type)) {
            return new Polylogue(identifier)
        }
        if (NetworkType.CHATROOM.equals(type)) {
            return new Chatroom(identifier)
        }
        if (NetworkType.PROVIDER.equals(type)) {
            return new ServiceProvider(identifier)
        }
        throw new TypeError("Unsupported group type: " + type)
    };
    ns.Facebook = Facebook;
    ns.registers("Facebook")
})(DIMSDK);
(function(ns) {
    var CorePacker = ns.core.Packer;
    var MessagePacker = function(messenger) {
        CorePacker.call(this, messenger)
    };
    ns.Class(MessagePacker, CorePacker, null);
    MessagePacker.prototype.getMessenger = function() {
        return this.getTransceiver()
    };
    MessagePacker.prototype.getFacebook = function() {
        return this.getMessenger().getFacebook()
    };
    var is_waiting = function(identifier, facebook) {
        if (identifier.isGroup()) {
            return !facebook.getMeta(identifier)
        } else {
            return !facebook.getPublicKeyForEncryption(identifier)
        }
    };
    MessagePacker.prototype.encryptMessage = function(iMsg) {
        var receiver = iMsg.getReceiver();
        var group = iMsg.getGroup();
        if (!(receiver.isBroadcast() || (group && group.isBroadcast()))) {
            var fb = this.getFacebook();
            if (is_waiting(receiver, fb) || (group && is_waiting(group, fb))) {
                this.getMessenger().suspendInstantMessage(iMsg);
                return null
            }
        }
        return CorePacker.prototype.encryptMessage.call(this, iMsg)
    };
    MessagePacker.prototype.verifyMessage = function(rMsg) {
        var facebook = this.getFacebook();
        var sender = rMsg.getSender();
        var meta = rMsg.getMeta();
        if (!meta) {
            meta = facebook.getMeta(sender)
        } else {
            if (!facebook.saveMeta(meta, sender)) {
                meta = null
            }
        }
        if (!meta) {
            this.getMessenger().suspendReliableMessage(rMsg);
            return null
        }
        var visa = rMsg.getVisa();
        if (visa != null) {
            facebook.saveDocument(visa)
        }
        return CorePacker.prototype.verifyMessage.call(this, rMsg)
    };
    MessagePacker.prototype.decryptMessage = function(sMsg) {
        var messenger = this.getMessenger();
        if (sMsg.getDelegate() == null) {
            sMsg.setDelegate(messenger)
        }
        var receiver = sMsg.getReceiver();
        var user = messenger.selectLocalUser(receiver);
        var trimmed;
        if (!user) {
            trimmed = null
        } else {
            if (receiver.isGroup()) {
                trimmed = sMsg.trim(user.identifier)
            } else {
                trimmed = sMsg
            }
        }
        if (!trimmed) {
            throw new ReferenceError("receiver error: " + sMsg.getMap())
        }
        return CorePacker.prototype.decryptMessage.call(this, sMsg)
    };
    ns.MessagePacker = MessagePacker;
    ns.registers("MessagePacker")
})(DIMSDK);
(function(ns) {
    var Processor = ns.core.Processor;
    var MessageProcessor = function(messenger) {
        Processor.call(this, messenger)
    };
    ns.Class(MessageProcessor, Processor, null);
    MessageProcessor.prototype.getMessenger = function() {
        return this.getTransceiver()
    };
    MessageProcessor.prototype.processInstantMessage = function(iMsg, rMsg) {
        var res = Processor.prototype.processInstantMessage.call(this, iMsg, rMsg);
        if (this.getMessenger().saveMessage(iMsg)) {
            return res
        } else {
            return null
        }
    };
    MessageProcessor.prototype.processContent = function(content, rMsg) {
        var cpu = ns.cpu.ContentProcessor.getProcessor(content);
        if (cpu == null) {
            cpu = ns.cpu.ContentProcessor.getProcessor(0)
        }
        cpu.setMessenger(this.getMessenger());
        return cpu.process(content, rMsg)
    };
    ns.MessageProcessor = MessageProcessor;
    ns.registers("MessageProcessor")
})(DIMSDK);
(function(ns) {
    var Transmitter = function() {};
    ns.Interface(Transmitter, null);
    Transmitter.prototype.sendContent = function(sender, receiver, content, callback, priority) {
        console.assert(false, "implement me!");
        return false
    };
    Transmitter.prototype.sendInstantMessage = function(iMsg, callback, priority) {
        console.assert(false, "implement me!");
        return false
    };
    Transmitter.prototype.sendReliableMessage = function(rMsg, callback, priority) {
        console.assert(false, "implement me!");
        return false
    };
    ns.Transmitter = Transmitter;
    ns.registers("Transmitter")
})(DIMSDK);
(function(ns) {
    var obj = ns.type.Object;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var CompletionHandler = ns.CompletionHandler;
    var Transmitter = ns.Transmitter;
    var MessageTransmitter = function(messenger) {
        obj.call(this);
        this.__messenger = messenger
    };
    ns.Class(MessageTransmitter, obj, [Transmitter]);
    MessageTransmitter.prototype.getMessenger = function() {
        return this.__messenger
    };
    MessageTransmitter.prototype.getFacebook = function() {
        return this.getMessenger().getFacebook()
    };
    MessageTransmitter.prototype.sendContent = function(sender, receiver, content, callback, priority) {
        if (!sender) {
            var user = this.getFacebook().getCurrentUser();
            if (!user) {
                throw new ReferenceError("current user not set")
            }
            sender = user.identifier
        }
        var env = Envelope.create(sender, receiver, null);
        var iMsg = InstantMessage.create(env, content);
        return this.getMessenger().sendInstantMessage(iMsg, callback, priority)
    };
    MessageTransmitter.prototype.sendInstantMessage = function(iMsg, callback, priority) {
        var messenger = this.getMessenger();
        var sMsg = messenger.encryptMessage(iMsg);
        if (sMsg == null) {
            return false
        }
        var rMsg = messenger.signMessage(sMsg);
        if (rMsg == null) {
            throw new ReferenceError("failed to sign message: " + sMsg.getMap())
        }
        var OK = messenger.sendReliableMessage(rMsg, callback, priority);
        return messenger.saveMessage(iMsg) && OK
    };
    MessageTransmitter.prototype.sendReliableMessage = function(rMsg, callback, priority) {
        var handler = null;
        if (callback != null) {
            handler = new MessageCallbackHandler(rMsg, callback)
        }
        var messenger = this.getMessenger();
        var data = messenger.serializeMessage(rMsg);
        return messenger.sendPackage(data, handler, priority)
    };
    var MessageCallbackHandler = function(rMsg, callback) {
        obj.call(this);
        this.message = rMsg;
        this.callback = callback
    };
    ns.Class(MessageCallbackHandler, obj, [CompletionHandler]);
    MessageCallbackHandler.prototype.onSuccess = function() {
        this.callback.onFinished(this.message, null)
    };
    MessageCallbackHandler.prototype.onFailed = function(error) {
        this.callback.onFinished(this.message, error)
    };
    MessageTransmitter.CompletionHandler = MessageCallbackHandler;
    ns.MessageTransmitter = MessageTransmitter;
    ns.registers("MessageTransmitter")
})(DIMSDK);
(function(ns) {
    var ContentType = ns.protocol.ContentType;
    var FileContent = ns.protocol.FileContent;
    var Transceiver = ns.core.Transceiver;
    var Messenger = function() {
        Transceiver.call(this);
        this.__delegate = null;
        this.__datasource = null;
        this.__transmitter = null
    };
    ns.Class(Messenger, Transceiver, null);
    Messenger.prototype.getFacebook = function() {
        return this.getEntityDelegate()
    };
    Messenger.prototype.setDelegate = function(delegate) {
        this.__delegate = delegate
    };
    Messenger.prototype.getDelegate = function() {
        return this.__delegate
    };
    Messenger.prototype.setDataSource = function(datasource) {
        this.__datasource = datasource
    };
    Messenger.prototype.getDataSource = function() {
        return this.__datasource
    };
    Messenger.prototype.setTransmitter = function(transmitter) {
        this.__transmitter = transmitter
    };
    Messenger.prototype.getTransmitter = function() {
        return this.__transmitter
    };
    var get_fpu = function(messenger) {
        var cpu = ns.cpu.ContentProcessor.getProcessor(ContentType.FILE);
        cpu.setMessenger(messenger);
        return cpu
    };
    Messenger.prototype.serializeContent = function(content, pwd, iMsg) {
        if (content instanceof FileContent) {
            var fpu = get_fpu(this);
            fpu.uploadFileContent(content, pwd, iMsg)
        }
        return Transceiver.prototype.serializeContent.call(this, content, pwd, iMsg)
    };
    Messenger.prototype.encryptKey = function(data, receiver, iMsg) {
        var key = this.getFacebook().getPublicKeyForEncryption(receiver);
        if (key == null) {
            this.suspendInstantMessage(iMsg);
            return null
        }
        return Transceiver.prototype.encryptKey.call(this, data, receiver, iMsg)
    };
    Messenger.prototype.deserializeContent = function(data, pwd, sMsg) {
        var content = Transceiver.prototype.deserializeContent.call(this, data, pwd, sMsg);
        if (!content) {
            throw new Error("failed to deserialize message content: " + sMsg)
        }
        if (content instanceof FileContent) {
            var fpu = get_fpu(this);
            fpu.downloadFileContent(content, pwd, sMsg)
        }
        return content
    };
    Messenger.prototype.sendContent = function(sender, receiver, content, callback, priority) {
        return this.getTransmitter().sendContent(sender, receiver, content, callback, priority)
    };
    Messenger.prototype.sendInstantMessage = function(iMsg, callback, priority) {
        return this.getTransmitter().sendInstantMessage(iMsg, callback, priority)
    };
    Messenger.prototype.sendReliableMessage = function(rMsg, callback, priority) {
        return this.getTransmitter().sendReliableMessage(rMsg, callback, priority)
    };
    Messenger.prototype.uploadData = function(data, iMsg) {
        return this.getDelegate().uploadData(data, iMsg)
    };
    Messenger.prototype.downloadData = function(url, iMsg) {
        return this.getDelegate().downloadData(url, iMsg)
    };
    Messenger.prototype.sendPackage = function(data, handler, priority) {
        return this.getDelegate().sendPackage(data, handler, priority)
    };
    Messenger.prototype.saveMessage = function(iMsg) {
        return this.getDataSource().saveMessage(iMsg)
    };
    Messenger.prototype.suspendReliableMessage = function(rMsg) {
        return this.getDataSource().suspendReliableMessage(rMsg)
    };
    Messenger.prototype.suspendInstantMessage = function(iMsg) {
        return this.getDataSource().suspendInstantMessage(iMsg)
    };
    ns.Messenger = Messenger;
    ns.registers("Messenger")
})(DIMSDK);
(function(ns) {
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var LoginCommand = ns.protocol.LoginCommand;
    var MuteCommand = ns.protocol.MuteCommand;
    var BlockCommand = ns.protocol.BlockCommand;
    var StorageCommand = ns.protocol.StorageCommand;
    var CommandFactory = ns.core.CommandFactory;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var registerCommandFactories = function() {
        Command.register(Command.RECEIPT, new CommandFactory(ReceiptCommand));
        Command.register(Command.HANDSHAKE, new CommandFactory(HandshakeCommand));
        Command.register(Command.LOGIN, new CommandFactory(LoginCommand));
        Command.register(MuteCommand.MUTE, new CommandFactory(MuteCommand));
        Command.register(BlockCommand.BLOCK, new CommandFactory(BlockCommand));
        var spu = new CommandFactory(StorageCommand);
        Command.register(StorageCommand.STORAGE, spu);
        Command.register(StorageCommand.CONTACTS, spu);
        Command.register(StorageCommand.PRIVATE_KEY, spu)
    };
    var registerCommandProcessors = function() {
        CommandProcessor.register(Command.META, new ns.cpu.MetaCommandProcessor());
        var dpu = new ns.cpu.DocumentCommandProcessor();
        CommandProcessor.register(Command.DOCUMENT, dpu);
        CommandProcessor.register("profile", dpu);
        CommandProcessor.register("visa", dpu);
        CommandProcessor.register("bulletin", dpu);
        CommandProcessor.register("group", new ns.cpu.GroupCommandProcessor());
        CommandProcessor.register(GroupCommand.INVITE, new ns.cpu.group.InviteCommandProcessor());
        CommandProcessor.register(GroupCommand.EXPEL, new ns.cpu.group.ExpelCommandProcessor());
        CommandProcessor.register(GroupCommand.QUIT, new ns.cpu.group.QuitCommandProcessor());
        CommandProcessor.register(GroupCommand.QUERY, new ns.cpu.group.QueryCommandProcessor());
        CommandProcessor.register(GroupCommand.RESET, new ns.cpu.group.ResetCommandProcessor())
    };
    var registerContentProcessors = function() {
        ContentProcessor.register(ContentType.FORWARD, new ns.cpu.ForwardContentProcessor());
        var fpu = new ns.cpu.FileContentProcessor();
        ContentProcessor.register(ContentType.FILE, fpu);
        ContentProcessor.register(ContentType.IMAGE, fpu);
        ContentProcessor.register(ContentType.AUDIO, fpu);
        ContentProcessor.register(ContentType.VIDEO, fpu);
        ContentProcessor.register(ContentType.COMMAND, new ns.cpu.CommandProcessor());
        ContentProcessor.register(ContentType.HISTORY, new ns.cpu.HistoryCommandProcessor());
        ContentProcessor.register(0, new ns.cpu.ContentProcessor())
    };
    var registerAllFactories = function() {
        ns.core.registerAllFactories();
        registerCommandFactories();
        registerCommandProcessors();
        registerContentProcessors()
    };
    registerAllFactories()
})(DIMSDK);
if (typeof LocalNotificationService !== "object") {
    LocalNotificationService = new MONKEY.Namespace()
}
if (typeof FiniteStateMachine !== "object") {
    FiniteStateMachine = new MONKEY.Namespace()
}
if (typeof FileSystem !== "object") {
    FileSystem = new MONKEY.Namespace()
}
if (typeof StarTrek !== "object") {
    StarTrek = new MONKEY.Namespace()
}
if (typeof StarGate !== "object") {
    StarGate = new MONKEY.Namespace()
}
(function(ns, sys) {
    var obj = sys.type.Object;
    var Storage = function(storage, prefix) {
        obj.call(this);
        this.storage = storage;
        if (prefix) {
            this.ROOT = prefix
        } else {
            this.ROOT = "dim"
        }
    };
    sys.Class(Storage, obj, null);
    Storage.prototype.getItem = function(key) {
        return this.storage.getItem(key)
    };
    Storage.prototype.setItem = function(key, value) {
        this.storage.setItem(key, value)
    };
    Storage.prototype.removeItem = function(key) {
        this.storage.removeItem(key)
    };
    Storage.prototype.clear = function() {
        this.storage.clear()
    };
    Storage.prototype.getLength = function() {
        return this.storage.length
    };
    Storage.prototype.key = function(index) {
        return this.storage.key(index)
    };
    Storage.prototype.exists = function(path) {
        return !!this.getItem(this.ROOT + "." + path)
    };
    Storage.prototype.loadText = function(path) {
        return this.getItem(this.ROOT + "." + path)
    };
    Storage.prototype.loadData = function(path) {
        var base64 = this.loadText(path);
        if (!base64) {
            return null
        }
        return sys.format.Base64.decode(base64)
    };
    Storage.prototype.loadJSON = function(path) {
        var json = this.loadText(path);
        if (!json) {
            return null
        }
        return sys.format.JSON.decode(json)
    };
    Storage.prototype.remove = function(path) {
        this.removeItem(this.ROOT + "." + path);
        return true
    };
    Storage.prototype.saveText = function(text, path) {
        if (text) {
            this.setItem(this.ROOT + "." + path, text);
            return true
        } else {
            this.removeItem(this.ROOT + "." + path);
            return false
        }
    };
    Storage.prototype.saveData = function(data, path) {
        var base64 = null;
        if (data) {
            base64 = sys.format.Base64.encode(data)
        }
        return this.saveText(base64, path)
    };
    Storage.prototype.saveJSON = function(container, path) {
        var json = null;
        if (container) {
            json = sys.format.JSON.encode(container);
            json = sys.format.UTF8.decode(json)
        }
        return this.saveText(json, path)
    };
    ns.LocalStorage = new Storage(window.localStorage, "dim.fs");
    ns.SessionStorage = new Storage(window.sessionStorage, "dim.mem");
    ns.registers("LocalStorage");
    ns.registers("SessionStorage")
})(FileSystem, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var Notification = function(name, sender, userInfo) {
        obj.call(this);
        this.name = name;
        this.sender = sender;
        this.userInfo = userInfo
    };
    sys.Class(Notification, obj, null);
    ns.Notification = Notification;
    ns.registers("Notification")
})(LocalNotificationService, MONKEY);
(function(ns, sys) {
    var Observer = function() {};
    sys.Interface(Observer, null);
    Observer.prototype.onReceiveNotification = function(notification) {
        console.assert(false, "implement me!")
    };
    ns.Observer = Observer;
    ns.registers("Observer")
})(LocalNotificationService, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var Arrays = sys.type.Arrays;
    var Notification = ns.Notification;
    var Observer = ns.Observer;
    var Center = function() {
        obj.call(this);
        this.__observers = {}
    };
    sys.Class(Center, obj, null);
    Center.prototype.addObserver = function(observer, name) {
        var list = this.__observers[name];
        if (list) {
            if (list.indexOf(observer) >= 0) {
                return
            }
        } else {
            list = [];
            this.__observers[name] = list
        }
        list.push(observer)
    };
    Center.prototype.removeObserver = function(observer, name) {
        if (name) {
            var list = this.__observers[name];
            if (list) {
                Arrays.remove(list, observer)
            }
        } else {
            var names = Object.keys(this.__observers);
            for (var i = 0; i < names.length; ++i) {
                this.removeObserver(observer, names[i])
            }
        }
    };
    Center.prototype.postNotification = function(notification, sender, userInfo) {
        if (typeof notification === "string") {
            notification = new Notification(notification, sender, userInfo)
        }
        var observers = this.__observers[notification.name];
        if (!observers) {
            return
        }
        var obs;
        for (var i = 0; i < observers.length; ++i) {
            obs = observers[i];
            if (sys.Interface.conforms(obs, Observer)) {
                obs.onReceiveNotification(notification)
            } else {
                if (typeof obs === "function") {
                    obs.call(notification)
                }
            }
        }
    };
    var s_notification_center = null;
    Center.getInstance = function() {
        if (!s_notification_center) {
            s_notification_center = new Center()
        }
        return s_notification_center
    };
    ns.NotificationCenter = Center;
    ns.registers("NotificationCenter")
})(LocalNotificationService, MONKEY);
(function(ns, sys) {
    var Delegate = function() {};
    sys.Interface(Delegate, null);
    Delegate.prototype.enterState = function(state, machine) {
        console.assert(false, "implement me!")
    };
    Delegate.prototype.exitState = function(state, machine) {
        console.assert(false, "implement me!")
    };
    Delegate.prototype.pauseState = function(state, machine) {};
    Delegate.prototype.resumeState = function(state, machine) {};
    ns.Delegate = Delegate;
    ns.registers("Delegate")
})(FiniteStateMachine, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var Transition = function(targetStateName) {
        obj.call(this);
        this.target = targetStateName
    };
    sys.Class(Transition, obj, null);
    Transition.prototype.evaluate = function(machine) {
        console.assert(false, "implement me!");
        return false
    };
    ns.Transition = Transition;
    ns.registers("Transition")
})(FiniteStateMachine, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var State = function() {
        obj.call(this);
        this.__transitions = []
    };
    sys.Class(State, obj, null);
    State.prototype.addTransition = function(transition) {
        if (this.__transitions.indexOf(transition) < 0) {
            this.__transitions.push(transition)
        } else {
            throw new Error("transition exists: " + transition)
        }
    };
    State.prototype.tick = function(machine) {
        var transition;
        for (var i = 0; i < this.__transitions.length; ++i) {
            transition = this.__transitions[i];
            if (transition.evaluate(machine)) {
                machine.changeState(transition.target);
                break
            }
        }
    };
    State.prototype.onEnter = function(machine) {
        console.assert(false, "implement me!")
    };
    State.prototype.onExit = function(machine) {
        console.assert(false, "implement me!")
    };
    State.prototype.onPause = function(machine) {};
    State.prototype.onResume = function(machine) {};
    ns.State = State;
    ns.registers("State")
})(FiniteStateMachine, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var Status = sys.type.Enum(null, {
        Stopped: 0,
        Running: 1,
        Paused: 2
    });
    var Machine = function(defaultStateName) {
        obj.call(this);
        this.__default = defaultStateName ? defaultStateName : "default";
        this.__current = null;
        this.__status = Status.Stopped;
        this.__delegate = null
    };
    sys.Class(Machine, obj, null);
    Machine.prototype.setDelegate = function(delegate) {
        this.__delegate = delegate
    };
    Machine.prototype.getDelegate = function() {
        return this.__delegate
    };
    Machine.prototype.getCurrentState = function() {
        return this.__current
    };
    Machine.prototype.addState = function(state, name) {
        console.assert(false, "implement me!")
    };
    Machine.prototype.getState = function(name) {
        console.assert(false, "implement me!");
        return null
    };
    Machine.prototype.changeState = function(name) {
        var delegate = this.getDelegate();
        var oldState = this.getCurrentState();
        var newState = this.getState(name);
        if (delegate) {
            if (oldState) {
                delegate.exitState(oldState, this)
            }
            if (newState) {
                delegate.enterState(newState, this)
            }
        }
        this.__current = newState;
        if (oldState) {
            oldState.onExit(this)
        }
        if (newState) {
            newState.onEnter(this)
        }
    };
    Machine.prototype.start = function() {
        if (this.__current || !Status.Stopped.equals(this.__status)) {
            throw new Error("FSM start error: " + this.__status)
        }
        this.changeState(this.__default);
        this.__status = Status.Running
    };
    Machine.prototype.stop = function() {
        if (!this.__current || Status.Stopped.equals(this.__status)) {
            throw new Error("FSM stop error: " + this.__status)
        }
        this.__status = Status.Stopped;
        this.changeState(null)
    };
    Machine.prototype.pause = function() {
        if (!this.__current || !Status.Running.equals(this.__status)) {
            throw new Error("FSM pause error: " + this.__status)
        }
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.pauseState(this.__current, this)
        }
        this.__status = Status.Paused;
        this.__current.onPause(this)
    };
    Machine.prototype.resume = function() {
        if (!this.__current || !Status.Paused.equals(this.__status)) {
            throw new Error("FSM resume error: " + this.__status)
        }
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.resumeState(this.__current, this)
        }
        this.__status = Status.Running;
        this.__current.onResume(this)
    };
    Machine.prototype.tick = function() {
        if (this.__current && Status.Running.equals(this.__status)) {
            this.__current.tick(this)
        }
    };
    ns.Machine = Machine;
    ns.registers("Machine")
})(FiniteStateMachine, MONKEY);
(function(ns, sys) {
    var Runnable = sys.threading.Runnable;
    var Thread = sys.threading.Thread;
    var Machine = ns.Machine;
    var AutoMachine = function(defaultStateName) {
        Machine.call(this, defaultStateName);
        this.__states = {};
        this.__thread = null
    };
    sys.Class(AutoMachine, Machine, [Runnable]);
    AutoMachine.prototype.addState = function(state, name) {
        this.__states[name] = state
    };
    AutoMachine.prototype.getState = function(name) {
        return this.__states[name]
    };
    AutoMachine.prototype.start = function() {
        Machine.prototype.start.call(this);
        force_stop(this);
        var thread = new Thread(this);
        this.__thread = thread;
        thread.start()
    };
    var force_stop = function(machine) {
        var thread = machine.__thread;
        machine.__thread = null;
        if (thread) {
            thread.stop()
        }
    };
    AutoMachine.prototype.stop = function() {
        Machine.prototype.stop.call(this);
        force_stop(this)
    };
    AutoMachine.prototype.run = function() {
        this.tick();
        return this.getCurrentState() != null
    };
    ns.AutoMachine = AutoMachine;
    ns.registers("AutoMachine")
})(FiniteStateMachine, MONKEY);
(function(ns, sys) {
    var Ship = function() {};
    sys.Interface(Ship, null);
    Ship.prototype.getPackage = function() {
        console.assert(false, "implement me!");
        return null
    };
    Ship.prototype.getSN = function() {
        console.assert(false, "implement me!");
        return null
    };
    Ship.prototype.getPayload = function() {
        console.assert(false, "implement me!");
        return null
    };
    var ShipDelegate = function() {};
    sys.Interface(ShipDelegate, null);
    ShipDelegate.prototype.onShipSent = function(ship, error) {
        console.assert(false, "implement me!")
    };
    Ship.Delegate = ShipDelegate;
    ns.Ship = Ship;
    ns.registers("Ship")
})(StarTrek, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var Ship = ns.Ship;
    var StarShip = function(priority, delegate) {
        obj.call(this);
        this.priority = priority;
        this.__delegate = delegate;
        this.__timestamp = 0;
        this.__retries = -1
    };
    sys.Class(StarShip, obj, [Ship]);
    StarShip.EXPIRES = 120 * 1000;
    StarShip.RETRIES = 2;
    StarShip.URGENT = -1;
    StarShip.NORMAL = 0;
    StarShip.SLOWER = 1;
    StarShip.prototype.getDelegate = function() {
        return this.__delegate
    };
    StarShip.prototype.getTimestamp = function() {
        return this.__timestamp
    };
    StarShip.prototype.getRetries = function() {
        return this.__retries
    };
    StarShip.prototype.isExpired = function() {
        var now = new Date();
        return now.getTime() > this.__timestamp + StarShip.EXPIRES * (StarShip.RETRIES + 2)
    };
    StarShip.prototype.update = function() {
        this.__timestamp = (new Date()).getTime();
        this.__retries += 1
    };
    ns.StarShip = StarShip;
    ns.registers("StarShip")
})(StarTrek, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var StarShip = ns.StarShip;
    var Dock = function() {
        obj.call(this);
        this.__priorities = [];
        this.__fleets = {}
    };
    sys.Class(Dock, obj, null);
    Dock.prototype.park = function(task) {
        var prior = task.priority;
        var fleet = this.__fleets[prior];
        if (!fleet) {
            fleet = [];
            this.__fleets[prior] = fleet;
            var index = 0;
            for (; index < this.__priorities.length; ++index) {
                if (prior < this.__priorities[index]) {
                    break
                }
            }
            this.__priorities[index] = prior
        }
        for (var i = 0; i < fleet.length; ++i) {
            if (fleet[i] === task) {
                return false
            }
        }
        fleet.push(task);
        return true
    };
    Dock.prototype.pull = function(sn) {
        if (sn === "*") {
            return seek(this, function(ship) {
                if (ship.getTimestamp() === 0) {
                    ship.update();
                    return -1
                } else {
                    return 0
                }
            })
        } else {
            return seek(this, function(ship) {
                var sn1 = ship.getSN();
                if (sn1.length !== sn.length) {
                    return 0
                }
                for (var i = 0; i < sn1.length; ++i) {
                    if (sn1[i] !== sn[i]) {
                        return 0
                    }
                }
                return -1
            })
        }
    };
    var seek = function(dock, checking) {
        var fleet, ship, flag;
        var i, j;
        for (i = 0; i < dock.__priorities.length; ++i) {
            fleet = dock.__fleets[dock.__priorities[i]];
            if (!fleet) {
                continue
            }
            for (j = 0; j < fleet.length; ++j) {
                ship = fleet[j];
                flag = checking(ship);
                if (flag === -1) {
                    fleet.splice(j, 1);
                    return ship
                } else {
                    if (flag === 1) {
                        return ship
                    }
                }
            }
        }
        return null
    };
    Dock.prototype.any = function() {
        var expired = (new Date()).getTime() - StarShip.EXPIRES;
        return seek(this, function(ship) {
            if (ship.getTimestamp() > expired) {
                return 0
            }
            if (ship.getRetries() < StarShip.RETRIES) {
                ship.update();
                return 1
            }
            if (ship.isExpired()) {
                return -1
            }
        })
    };
    ns.Dock = Dock;
    ns.registers("Dock")
})(StarTrek, MONKEY);
(function(ns, sys) {
    var Handler = sys.threading.Handler;
    var Processor = sys.threading.Processor;
    var Docker = function() {};
    sys.Interface(Docker, [Handler, Processor]);
    Docker.prototype.pack = function(payload, priority, delegate) {
        console.assert(false, "implement me!");
        return null
    };
    ns.Docker = Docker;
    ns.registers("Docker")
})(StarTrek, MONKEY);
(function(ns, sys) {
    var Runner = sys.threading.Runner;
    var Docker = ns.Docker;
    var StarDocker = function(gate) {
        Runner.call(this);
        this.__gate = gate;
        this.__heartbeatExpired = (new Date()).getTime() + 2000
    };
    sys.Class(StarDocker, Runner, [Docker]);
    StarDocker.prototype.getGate = function() {
        return this.__gate
    };
    StarDocker.prototype.process = function() {
        var gate = this.getGate();
        var income = this.getIncomeShip();
        if (income) {
            this.removeLinkedShip(income);
            var res = this.processIncomeShip(income);
            if (res) {
                gate.sendShip(res)
            }
        }
        var delegate;
        var outgo = null;
        if (ns.Gate.Status.CONNECTED.equals(gate.getStatus())) {
            outgo = this.getOutgoShip()
        }
        if (outgo) {
            if (outgo.isExpired()) {
                delegate = outgo.getDelegate();
                if (delegate) {
                    delegate.onShipSent(outgo, new Error("Request timeout"))
                }
            } else {
                if (!gate.send(outgo.getPackage())) {
                    delegate = outgo.getDelegate();
                    if (delegate) {
                        delegate.onShipSent(outgo, new Error("Connection error"))
                    }
                }
            }
        }
        if (income || outgo) {
            return true
        } else {
            var now = (new Date()).getTime();
            if (now > this.__heartbeatExpired) {
                if (gate.isExpired()) {
                    var beat = this.getHeartbeat();
                    if (beat) {
                        gate.parkShip(beat)
                    }
                }
                this.__heartbeatExpired = now + 2000
            }
            return false
        }
    };
    StarDocker.prototype.getIncomeShip = function() {
        console.assert(false, "implement me!");
        return null
    };
    StarDocker.prototype.processIncomeShip = function(income) {
        console.assert(false, "implement me!");
        return null
    };
    StarDocker.prototype.removeLinkedShip = function(income) {
        var linked = this.getOutgoShip(income);
        if (linked) {
            var delegate = linked.getDelegate();
            if (delegate) {
                delegate.onShipSent(linked, null)
            }
        }
    };
    StarDocker.prototype.getOutgoShip = function(income) {
        var gate = this.getGate();
        if (income) {
            return gate.pullShip(income.getSN())
        } else {
            var outgo = gate.pullShip("*");
            if (!outgo) {
                outgo = gate.anyShip()
            }
            return outgo
        }
    };
    StarDocker.prototype.getHeartbeat = function() {
        return null
    };
    ns.StarDocker = StarDocker;
    ns.registers("StarDocker")
})(StarTrek, MONKEY);
(function(ns, sys) {
    var Gate = function() {};
    sys.Interface(Gate, null);
    Gate.prototype.getDelegate = function() {
        console.assert(false, "implement me!");
        return null
    };
    Gate.prototype.isExpired = function() {
        console.assert(false, "implement me!");
        return false
    };
    Gate.prototype.sendPayload = function(payload, priority, delegate) {
        console.assert(false, "implement me!");
        return false
    };
    Gate.prototype.sendShip = function(outgo) {
        console.assert(false, "implement me!");
        return false
    };
    Gate.prototype.send = function(pack) {
        console.assert(false, "implement me!");
        return false
    };
    Gate.prototype.receive = function(length, remove) {
        console.assert(false, "implement me!");
        return null
    };
    Gate.prototype.parkShip = function(outgo) {
        console.assert(false, "implement me!");
        return false
    };
    Gate.prototype.pullShip = function(sn) {
        console.assert(false, "implement me!");
        return null
    };
    Gate.prototype.anyShip = function() {
        console.assert(false, "implement me!");
        return null
    };
    Gate.prototype.getStatus = function() {
        console.assert(false, "implement me!");
        return null
    };
    var GateStatus = sys.type.Enum(null, {
        ERROR: -1,
        INIT: 0,
        CONNECTING: 1,
        CONNECTED: 2
    });
    var GateDelegate = function() {};
    sys.Interface(GateDelegate, null);
    GateDelegate.prototype.onGateStatusChanged = function(gate, oldStatus, newStatus) {
        console.assert(false, "implement me!")
    };
    GateDelegate.prototype.onGateReceived = function(gate, ship) {
        console.assert(false, "implement me!");
        return null
    };
    Gate.Status = GateStatus;
    Gate.Delegate = GateDelegate;
    ns.Gate = Gate;
    ns.registers("Gate")
})(StarTrek, MONKEY);
(function(ns, sys) {
    var Runner = sys.threading.Runner;
    var Gate = ns.Gate;
    var Dock = ns.Dock;
    var StarShip = ns.StarShip;
    var StarGate = function() {
        Runner.call(this);
        this.dock = this.createDock();
        this.__docker = null;
        this.__delegate = null
    };
    sys.Class(StarGate, Runner, [Gate]);
    StarGate.prototype.createDock = function() {
        return new Dock()
    };
    StarGate.prototype.createDocker = function() {
        console.assert(false, "implement me!");
        return null
    };
    StarGate.prototype.getDocker = function() {
        if (!this.__docker) {
            this.__docker = this.createDocker()
        }
        return this.__docker
    };
    StarGate.prototype.setDocker = function(worker) {
        this.__docker = worker
    };
    StarGate.prototype.getDelegate = function() {
        return this.__delegate
    };
    StarGate.prototype.setDelegate = function(delegate) {
        this.__delegate = delegate
    };
    StarGate.prototype.sendPayload = function(payload, priority, delegate) {
        var worker = this.getDocker();
        if (worker) {
            var outgo = worker.pack(payload, priority, delegate);
            return this.sendShip(outgo)
        } else {
            return false
        }
    };
    StarGate.prototype.sendShip = function(outgo) {
        if (!this.getStatus().equals(Gate.Status.CONNECTED)) {
            return false
        } else {
            if (outgo.priority > StarShip.URGENT) {
                return this.parkShip(outgo)
            } else {
                return this.send(outgo.getPackage())
            }
        }
    };
    StarGate.prototype.parkShip = function(outgo) {
        return this.dock.park(outgo)
    };
    StarGate.prototype.pullShip = function(sn) {
        return this.dock.pull(sn)
    };
    StarGate.prototype.anyShip = function() {
        return this.dock.any()
    };
    StarGate.prototype.setup = function() {
        var docker = this.getDocker();
        if (docker) {
            return docker.setup()
        } else {
            return true
        }
    };
    StarGate.prototype.finish = function() {
        var docker = this.__docker;
        if (docker) {
            return docker.finish()
        } else {
            return false
        }
    };
    StarGate.prototype.process = function() {
        var docker = this.__docker;
        if (docker) {
            return docker.process()
        } else {
            return false
        }
    };
    ns.StarGate = StarGate;
    ns.registers("StarGate")
})(StarTrek, MONKEY);
(function(ns, sys) {
    var CachePool = function() {};
    sys.Interface(CachePool, null);
    CachePool.prototype.push = function(data) {
        console.assert(false, "implement me!");
        return null
    };
    CachePool.prototype.shift = function(maxLength) {
        console.assert(false, "implement me!");
        return null
    };
    CachePool.prototype.all = function() {
        console.assert(false, "implement me!");
        return null
    };
    CachePool.prototype.length = function() {
        console.assert(false, "implement me!");
        return 0
    };
    ns.CachePool = CachePool;
    ns.registers("CachePool")
})(StarGate, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var CachePool = ns.CachePool;
    var MemoryCache = function() {
        obj.call(this);
        this.__packages = [];
        this.__occupied = 0
    };
    sys.Class(MemoryCache, obj, [CachePool]);
    MemoryCache.prototype.push = function(data) {
        this.__packages.push(data);
        this.__occupied += data.length
    };
    MemoryCache.prototype.shift = function(maxLength) {
        var data = this.__packages.shift();
        if (data.length > maxLength) {
            this.__packages.unshift(data.subarray(maxLength));
            data = data.subarray(0, maxLength)
        }
        this.__occupied -= data.length;
        return data
    };
    MemoryCache.prototype.all = function() {
        var size = 0;
        var i, item;
        for (i = 0; i < this.__packages.length; ++i) {
            size += this.__packages[i].length
        }
        var data = new Uint8Array(size);
        var offset = 0;
        for (i = 0; i < this.__packages.length; ++i) {
            item = this.__packages[i];
            data.set(item, offset);
            offset += item.length
        }
        return data
    };
    MemoryCache.prototype.length = function() {
        return this.__occupied
    };
    ns.MemoryCache = MemoryCache;
    ns.registers("MemoryCache")
})(StarGate, MONKEY);
(function(ns, sys) {
    var connect = function(url, proxy) {
        var ws = new WebSocket(url);
        ws.onopen = function(ev) {
            proxy.onConnected()
        };
        ws.onclose = function(ev) {
            proxy.onClosed()
        };
        ws.onerror = function(ev) {
            var error = new Error("WebSocket error: " + ev);
            proxy.onError(error)
        };
        ws.onmessage = function(ev) {
            proxy.onReceived(ev.data)
        };
        return ws
    };
    var build_url = function(host, port) {
        if ("https" === window.location.protocol.split(":")[0]) {
            return "wss://" + host + ":" + port
        } else {
            return "ws://" + host + ":" + port
        }
    };
    var parse_url = function(url) {
        var pos1 = url.indexOf("://");
        if (pos1 < 0) {
            throw new URIError("URl error: " + url)
        }
        var scheme = url.substr(0, pos1);
        var host, port;
        pos1 += 3;
        var pos2 = url.indexOf("/", pos1 + 4);
        if (pos2 > pos1) {
            url = url.substr(0, pos2)
        }
        pos2 = url.indexOf(":", pos1 + 4);
        if (pos2 > pos1) {
            host = url.substr(pos1, pos2 - pos1);
            port = parseInt(url.substr(pos2 + 1))
        } else {
            host = url.substr(pos1);
            if (scheme === "ws" || scheme === "http") {
                port = 80
            } else {
                if (scheme === "wss" || scheme === "https") {
                    port = 443
                } else {
                    throw new URIError("URL scheme error: " + scheme)
                }
            }
        }
        return {
            "scheme": scheme,
            "host": host,
            "port": port
        }
    };
    var obj = sys.type.Object;
    var Socket = function(url) {
        obj.call(this);
        this.__packages = [];
        this.__connected = false;
        this.__closed = false;
        if (url) {
            var info = parse_url(url);
            this.__host = info["host"];
            this.__port = info["port"];
            this.__ws = connect(url, this)
        } else {
            this.__host = null;
            this.__port = null;
            this.__ws = null
        }
    };
    sys.Class(Socket, obj, null);
    Socket.prototype.getHost = function() {
        return this.__host
    };
    Socket.prototype.getPort = function() {
        return this.__port
    };
    Socket.prototype.connect = function(host, port) {
        this.close();
        this.__ws = connect(build_url(host, port), this)
    };
    Socket.prototype.close = function() {
        if (this.__ws) {
            this.__ws.close();
            this.__ws = null
        }
    };
    Socket.prototype.isConnected = function() {
        return this.__connected
    };
    Socket.prototype.isClosed = function() {
        return this.__closed
    };
    Socket.prototype.onConnected = function() {
        this.__connected = true
    };
    Socket.prototype.onClosed = function() {
        this.__closed = true
    };
    Socket.prototype.onError = function(error) {};
    Socket.prototype.onReceived = function(data) {
        this.__packages.push(data)
    };
    Socket.prototype.send = function(data) {
        this.__ws.send(data)
    };
    Socket.prototype.receive = function() {
        if (this.__packages.length > 0) {
            return this.__packages.shift()
        } else {
            return null
        }
    };
    ns.Socket = Socket;
    ns.registers("Socket")
})(StarGate, MONKEY);
(function(ns, sys) {
    var Connection = function() {};
    sys.Interface(Connection, null);
    Connection.MAX_CACHE_LENGTH = 65536;
    Connection.EXPIRES = 16 * 1000;
    Connection.prototype.send = function(data) {
        console.assert(false, "implement me!");
        return 0
    };
    Connection.prototype.available = function() {
        console.assert(false, "implement me!");
        return 0
    };
    Connection.prototype.received = function() {
        console.assert(false, "implement me!");
        return null
    };
    Connection.prototype.receive = function(maxLength) {
        console.assert(false, "implement me!");
        return null
    };
    Connection.prototype.getHost = function() {
        console.assert(false, "implement me!");
        return null
    };
    Connection.prototype.getPort = function() {
        console.assert(false, "implement me!");
        return 0
    };
    Connection.prototype.stop = function() {
        console.assert(false, "implement me!")
    };
    Connection.prototype.isRunning = function() {
        console.assert(false, "implement me!");
        return false
    };
    Connection.prototype.getStatus = function() {
        console.assert(false, "implement me!");
        return null
    };
    var ConnectionStatus = sys.type.Enum(null, {
        DEFAULT: (0),
        CONNECTING: (1),
        CONNECTED: (17),
        MAINTAINING: (33),
        EXPIRED: (34),
        ERROR: (136)
    });
    var ConnectionDelegate = function() {};
    sys.Interface(ConnectionDelegate, null);
    ConnectionDelegate.prototype.onConnectionStatusChanged = function(connection, oldStatus, newStatus) {
        console.assert(false, "implement me!")
    };
    ConnectionDelegate.prototype.onConnectionReceivedData = function(connection, data) {
        console.assert(false, "implement me!")
    };
    Connection.Status = ConnectionStatus;
    Connection.Delegate = ConnectionDelegate;
    ns.Connection = Connection;
    ns.registers("Connection")
})(StarGate, MONKEY);
(function(ns, sys) {
    var Runner = sys.threading.Runner;
    var MemoryCache = ns.MemoryCache;
    var Connection = ns.Connection;
    var BaseConnection = function(socket) {
        Runner.call(this);
        this._socket = socket;
        this.__cache = this.createCachePool();
        this.__delegate = null;
        this.__status = Connection.Status.DEFAULT;
        this.__lastSentTime = 0;
        this.__lastReceivedTime = 0
    };
    sys.Class(BaseConnection, Runner, [Connection]);
    BaseConnection.prototype.createCachePool = function() {
        return new MemoryCache()
    };
    BaseConnection.prototype.getDelegate = function() {
        return this.__delegate
    };
    BaseConnection.prototype.setDelegate = function(delegate) {
        this.__delegate = delegate
    };
    BaseConnection.prototype.getSocket = function() {
        if (this.isRunning()) {
            return this._socket
        } else {
            return null
        }
    };
    BaseConnection.prototype.getHost = function() {
        var sock = this._socket;
        if (sock) {
            return sock.getHost()
        } else {
            return null
        }
    };
    BaseConnection.prototype.getPort = function() {
        var sock = this._socket;
        if (sock) {
            return sock.getPort()
        } else {
            return 0
        }
    };
    var is_available = function(sock) {
        if (!sock || sock.isClosed()) {
            return false
        } else {
            return sock.isConnected()
        }
    };
    BaseConnection.prototype.isRunning = function() {
        return is_available(this._socket)
    };
    var write = function(data) {
        var sock = this.getSocket();
        if (!sock) {
            throw new Error("socket lost, cannot write data: " + data.length + " byte(s)")
        }
        sock.send(data);
        this.__lastSentTime = (new Date()).getTime();
        return data.length
    };
    var read = function() {
        var sock = this.getSocket();
        if (!sock) {
            throw new Error("socket lost, cannot read data")
        }
        var data = sock.receive();
        if (data) {
            this.__lastReceivedTime = (new Date()).getTime()
        }
        return data
    };
    var close = function() {
        var sock = this._socket;
        try {
            if (is_available(sock)) {
                sock.close()
            }
        } finally {
            this._socket = null
        }
    };
    BaseConnection.prototype._receive = function() {
        try {
            return read.call(this)
        } catch (e) {
            close.call(this);
            this.setStatus(Connection.Status.ERROR);
            return null
        }
    };
    BaseConnection.prototype.send = function(data) {
        try {
            return write.call(this, data)
        } catch (e) {
            close.call(this);
            this.setStatus(Connection.Status.ERROR);
            return null
        }
    };
    BaseConnection.prototype.available = function() {
        return this.__cache.length()
    };
    BaseConnection.prototype.received = function() {
        return this.__cache.all()
    };
    BaseConnection.prototype.receive = function(maxLength) {
        return this.__cache.shift(maxLength)
    };
    BaseConnection.prototype.getStatus = function() {
        var now = new Date();
        fsm_tick.call(this, now.getTime());
        return this.__status
    };
    BaseConnection.prototype.setStatus = function(newStatus) {
        var oldStatus = this.__status;
        if (oldStatus.equals(newStatus)) {
            return
        }
        this.__status = newStatus;
        if (newStatus.equals(Connection.Status.CONNECTED) && !oldStatus.equals(Connection.Status.MAINTAINING)) {
            var now = (new Date()).getTime();
            this.__lastSentTime = now - Connection.EXPIRES - 1;
            this.__lastReceivedTime = now - Connection.EXPIRES - 1
        }
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.onConnectionStatusChanged(this, oldStatus, newStatus)
        }
    };
    BaseConnection.prototype.stop = function() {
        close.call(this);
        Runner.prototype.stop.call(this)
    };
    BaseConnection.prototype.setup = function() {
        this.setStatus(Connection.Status.CONNECTING);
        return false
    };
    BaseConnection.prototype.finish = function() {
        close.call(this);
        this.setStatus(Connection.Status.DEFAULT);
        return false
    };
    BaseConnection.prototype.process = function() {
        var count = this.__cache.length();
        if (count >= Connection.MAX_CACHE_LENGTH) {
            return false
        }
        var status = this.getStatus();
        if (Connection.Status.CONNECTED.equals(status) || Connection.Status.MAINTAINING.equals(status) || Connection.Status.EXPIRED.equals(status)) {} else {
            return false
        }
        var data = this._receive();
        if (!data || data.length === 0) {
            return false
        }
        this.__cache.push(data);
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.onConnectionReceivedData(this, data)
        }
        return true
    };
    var fsm_tick = function(now) {
        var tick = evaluations[this.__status];
        if (typeof tick === "function") {
            tick.call(this, now)
        } else {
            throw new EvalError("connection status error: " + this.__status)
        }
    };
    var evaluations = {};
    evaluations[Connection.Status.DEFAULT] = function(now) {
        if (this.isRunning()) {
            this.setStatus(Connection.Status.CONNECTING)
        }
    };
    evaluations[Connection.Status.CONNECTING] = function(now) {
        if (!this.isRunning()) {
            this.setStatus(Connection.Status.DEFAULT)
        } else {
            if (is_available(this.getSocket())) {
                this.setStatus(Connection.Status.CONNECTED)
            }
        }
    };
    evaluations[Connection.Status.CONNECTED] = function(now) {
        if (!is_available(this.getSocket())) {
            this.setStatus(Connection.Status.ERROR)
        } else {
            if (now > this.__lastReceivedTime + Connection.EXPIRES) {
                this.setStatus(Connection.Status.EXPIRED)
            }
        }
    };
    evaluations[Connection.Status.EXPIRED] = function(now) {
        if (!is_available(this.getSocket())) {
            this.setStatus(Connection.Status.ERROR)
        } else {
            if (now < this.__lastSentTime + Connection.EXPIRES) {
                this.setStatus(Connection.Status.MAINTAINING)
            }
        }
    };
    evaluations[Connection.Status.MAINTAINING] = function(now) {
        if (!is_available(this.getSocket())) {
            this.setStatus(Connection.Status.ERROR)
        } else {
            if (now > this.__lastReceivedTime + (Connection.EXPIRES << 4)) {
                this.setStatus(Connection.Status.ERROR)
            } else {
                if (now < this.__lastReceivedTime + Connection.EXPIRES) {
                    this.setStatus(Connection.Status.CONNECTED)
                } else {
                    if (now > this.__lastSentTime + Connection.EXPIRES) {
                        this.setStatus(Connection.Status.EXPIRED)
                    }
                }
            }
        }
    };
    evaluations[Connection.Status.ERROR] = function(now) {
        if (!this.isRunning()) {
            this.setStatus(Connection.Status.DEFAULT)
        } else {
            if (is_available(this.getSocket())) {
                this.setStatus(Connection.Status.CONNECTED)
            }
        }
    };
    ns.BaseConnection = BaseConnection;
    ns.registers("BaseConnection")
})(StarGate, MONKEY);
(function(ns, sys) {
    var Runner = sys.threading.Runner;
    var Socket = ns.Socket;
    var Connection = ns.Connection;
    var BaseConnection = ns.BaseConnection;
    var ActiveConnection = function(host, port) {
        BaseConnection.call(this, null);
        this.__host = host;
        this.__port = port;
        this.__connecting = 0
    };
    sys.Class(ActiveConnection, BaseConnection, null);
    var connect = function() {
        this.setStatus(Connection.Status.CONNECTING);
        try {
            var sock = new Socket(null);
            sock.connect(this.getHost(), this.getPort());
            this._socket = sock;
            this.setStatus(Connection.Status.CONNECTED);
            return true
        } catch (e) {
            this.setStatus(Connection.Status.ERROR);
            return false
        }
    };
    var reconnect = function() {
        var redo;
        this.__connecting += 1;
        try {
            if (this.__connecting === 1 && !this._socket) {
                redo = connect.call(this)
            } else {
                redo = false
            }
        } finally {
            this.__connecting -= 1
        }
        return redo
    };
    ActiveConnection.prototype.getSocket = function() {
        if (this.isRunning()) {
            if (!this._socket) {
                reconnect.call(this)
            }
            return this._socket
        } else {
            return null
        }
    };
    ActiveConnection.prototype.getHost = function() {
        return this.__host
    };
    ActiveConnection.prototype.getPort = function() {
        return this.__port
    };
    ActiveConnection.prototype.isRunning = function() {
        return Runner.prototype.isRunning.call(this)
    };
    ActiveConnection.prototype._receive = function() {
        var data = BaseConnection.prototype._receive.call(this);
        if (!data && reconnect.call(this)) {
            data = BaseConnection.prototype._receive.call(this)
        }
        return data
    };
    ActiveConnection.prototype.send = function(data) {
        var res = BaseConnection.prototype.send.call(this, data);
        if (res < 0 && reconnect.call(this)) {
            res = BaseConnection.prototype.send.call(this, data)
        }
        return res
    };
    ns.ActiveConnection = ActiveConnection;
    ns.registers("ActiveConnection")
})(StarGate, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var Host = function(ip, port, data) {
        obj.call(this);
        this.ip = ip;
        this.port = port;
        this.data = data
    };
    sys.Class(Host, obj, null);
    Host.prototype.valueOf = function() {
        console.assert(false, "implement me!");
        return null
    };
    Host.prototype.toString = function() {
        return this.valueOf()
    };
    Host.prototype.toLocaleString = function() {
        return this.valueOf()
    };
    Host.prototype.toArray = function(default_port) {
        var data = this.data;
        var port = this.port;
        var len = data.length;
        var array, index;
        if (!port || port === default_port) {
            array = new Uint8Array(len);
            for (index = 0; index < len; ++index) {
                array[index] = data[index]
            }
        } else {
            array = new Uint8Array(len + 2);
            for (index = 0; index < len; ++index) {
                array[index] = data[index]
            }
            array[len] = port >> 8;
            array[len + 1] = port & 255
        }
        return array
    };
    ns.Host = Host;
    ns.registers("Host")
})(StarGate, MONKEY);
(function(ns, sys) {
    var Host = ns.Host;
    var IPv4 = function(ip, port, data) {
        if (data) {
            if (!ip) {
                ip = data[0] + "." + data[1] + "." + data[2] + "." + data[3];
                if (data.length === 6) {
                    port = (data[4] << 8) | data[5]
                }
            }
        } else {
            if (ip) {
                data = new Uint8Array(4);
                var array = ip.split(".");
                for (var index = 0; index < 4; ++index) {
                    data[index] = parseInt(array[index], 10)
                }
            } else {
                throw new URIError("IP data empty: " + data + ", " + ip + ", " + port)
            }
        }
        Host.call(this, ip, port, data)
    };
    sys.Class(IPv4, Host, null);
    IPv4.prototype.valueOf = function() {
        if (this.port === 0) {
            return this.ip
        } else {
            return this.ip + ":" + this.port
        }
    };
    IPv4.patten = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;
    IPv4.parse = function(host) {
        if (!this.patten.test(host)) {
            return null
        }
        var pair = host.split(":");
        var ip = pair[0],
            port = 0;
        if (pair.length === 2) {
            port = parseInt(pair[1])
        }
        return new IPv4(ip, port)
    };
    ns.IPv4 = IPv4;
    ns.registers("IPv4")
})(StarGate, MONKEY);
(function(ns, sys) {
    var Host = ns.Host;
    var parse_v4 = function(data, array) {
        var item, index = data.byteLength;
        for (var i = array.length - 1; i >= 0; --i) {
            item = array[i];
            data[--index] = item
        }
        return data
    };
    var parse_v6 = function(data, ip, count) {
        var array, item, index;
        var pos = ip.indexOf("::");
        if (pos < 0) {
            array = ip.split(":");
            index = -1;
            for (var i = 0; i < count; ++i) {
                item = parseInt(array[i], 16);
                data[++index] = item >> 8;
                data[++index] = item & 255
            }
        } else {
            var left = ip.substring(0, pos).split(":");
            index = -1;
            for (var j = 0; j < left.length; ++j) {
                item = parseInt(left[j], 16);
                data[++index] = item >> 8;
                data[++index] = item & 255
            }
            var right = ip.substring(pos + 2).split(":");
            index = count * 2;
            for (var k = right.length - 1; k >= 0; --k) {
                item = parseInt(right[k], 16);
                data[--index] = item & 255;
                data[--index] = item >> 8
            }
        }
        return data
    };
    var hex_encode = function(hi, lo) {
        if (hi > 0) {
            if (lo >= 16) {
                return Number(hi).toString(16) + Number(lo).toString(16)
            }
            return Number(hi).toString(16) + "0" + Number(lo).toString(16)
        } else {
            return Number(lo).toString(16)
        }
    };
    var IPv6 = function(ip, port, data) {
        if (data) {
            if (!ip) {
                ip = hex_encode(data[0], data[1]);
                for (var index = 2; index < 16; index += 2) {
                    ip += ":" + hex_encode(data[index], data[index + 1])
                }
                ip = ip.replace(/:(0:){2,}/, "::");
                ip = ip.replace(/^(0::)/, "::");
                ip = ip.replace(/(::0)$/, "::");
                if (data.length === 18) {
                    port = (data[16] << 8) | data[17]
                }
            }
        } else {
            if (ip) {
                data = new Uint8Array(16);
                var array = ip.split(".");
                if (array.length === 1) {
                    data = parse_v6(data, ip, 8)
                } else {
                    if (array.length === 4) {
                        var prefix = array[0];
                        var pos = prefix.lastIndexOf(":");
                        array[0] = prefix.substring(pos + 1);
                        prefix = prefix.substring(0, pos);
                        data = parse_v6(data, prefix, 6);
                        data = parse_v4(data, array)
                    } else {
                        throw new URIError("IPv6 format error: " + ip)
                    }
                }
            } else {
                throw new URIError("IP data empty: " + data + ", " + ip + ", " + port)
            }
        }
        Host.call(this, ip, port, data)
    };
    sys.Class(IPv6, Host, null);
    IPv6.prototype.valueOf = function() {
        if (this.port === 0) {
            return this.ip
        } else {
            return "[" + this.ip + "]:" + this.port
        }
    };
    IPv6.patten = /^\[?([0-9A-Fa-f]{0,4}:){2,7}[0-9A-Fa-f]{0,4}(]:\d{1,5})?$/;
    IPv6.patten_compat = /^\[?([0-9A-Fa-f]{0,4}:){2,6}(\d{1,3}.){3}\d{1,3}(]:\d{1,5})?$/;
    IPv6.parse = function(host) {
        if (!this.patten.test(host) && !this.patten_compat.test(host)) {
            return null
        }
        var ip, port;
        if (host.charAt(0) === "[") {
            var pos = host.indexOf("]");
            ip = host.substring(1, pos);
            port = parseInt(host.substring(pos + 2))
        } else {
            ip = host;
            port = 0
        }
        return new IPv6(ip, port)
    };
    ns.IPv6 = IPv6;
    ns.registers("IPv6")
})(StarGate, MONKEY);
(function(ns, base, sys) {
    var StarShip = base.StarShip;
    var WSShip = function(pack, priority, delegate) {
        StarShip.call(this, priority, delegate);
        this.__pack = pack
    };
    sys.Class(WSShip, StarShip, null);
    WSShip.prototype.getPackage = function() {
        return this.__pack
    };
    WSShip.prototype.getSN = function() {
        return this.__pack
    };
    WSShip.prototype.getPayload = function() {
        return this.__pack
    };
    ns.WSShip = WSShip;
    ns.registers("WSShip")
})(StarGate, StarTrek, MONKEY);
(function(ns, base, sys) {
    var StarDocker = base.StarDocker;
    var StarShip = base.StarShip;
    var WSShip = ns.WSShip;
    var WSDocker = function(gate) {
        StarDocker.call(this, gate)
    };
    sys.Class(WSDocker, StarDocker, null);
    WSDocker.prototype.pack = function(payload, priority, delegate) {
        return new WSShip(payload, priority, delegate)
    };
    WSDocker.prototype.getIncomeShip = function() {
        var gate = this.getGate();
        var pack = gate.receive(1024 * 1024, true);
        if (!pack) {
            return null
        }
        return new WSShip(pack, 0, null)
    };
    WSDocker.prototype.processIncomeShip = function(income) {
        var data = income.getPayload();
        if (data.length === 0) {
            return null
        } else {
            if (data.length === 2) {
                if (sys.format.Arrays.equals(data, OK)) {
                    return null
                }
            } else {
                if (data.length === 4) {
                    if (sys.format.Arrays.equals(data, NOOP)) {
                        return null
                    } else {
                        if (sys.format.Arrays.equals(data, PONG)) {
                            return null
                        } else {
                            if (sys.format.Arrays.equals(data, PING)) {
                                return new WSShip(PONG, StarShip.SLOWER, null)
                            }
                        }
                    }
                }
            }
        }
        var gate = this.getGate();
        var delegate = gate.getDelegate();
        var res = delegate.onGateReceived(gate, income);
        if (res) {
            return new WSShip(res, StarShip.NORMAL, null)
        } else {
            return null
        }
    };
    WSDocker.prototype.getHeartbeat = function() {
        return new WSShip(PING, StarShip.SLOWER, null)
    };
    var PING = sys.format.UTF8.encode("PING");
    var PONG = sys.format.UTF8.encode("PONG");
    var NOOP = sys.format.UTF8.encode("NOOP");
    var OK = sys.format.UTF8.encode("OK");
    ns.WSDocker = WSDocker;
    ns.registers("WSDocker")
})(StarGate, StarTrek, MONKEY);
(function(ns, base, sys) {
    var Gate = base.Gate;
    var StarGate = base.StarGate;
    var Connection = ns.Connection;
    var WSDocker = ns.WSDocker;
    var WSGate = function(connection) {
        StarGate.call(this);
        this.connection = connection
    };
    sys.Class(WSGate, StarGate, [Connection.Delegate]);
    WSGate.prototype.createDocker = function() {
        return new WSDocker(this)
    };
    WSGate.prototype.isRunning = function() {
        var running = StarGate.prototype.isRunning.call(this);
        return running && this.connection.isRunning()
    };
    WSGate.prototype.isExpired = function() {
        var status = this.connection.getStatus();
        return Connection.Status.EXPIRED.equals(status)
    };
    WSGate.prototype.getStatus = function() {
        var status = this.connection.getStatus();
        return WSGate.getStatus(status)
    };
    WSGate.getStatus = function(connStatus) {
        if (Connection.Status.CONNECTING.equals(connStatus)) {
            return Gate.Status.CONNECTING
        } else {
            if (Connection.Status.CONNECTED.equals(connStatus)) {
                return Gate.Status.CONNECTED
            } else {
                if (Connection.Status.MAINTAINING.equals(connStatus)) {
                    return Gate.Status.CONNECTED
                } else {
                    if (Connection.Status.EXPIRED.equals(connStatus)) {
                        return Gate.Status.CONNECTED
                    } else {
                        if (Connection.Status.ERROR.equals(connStatus)) {
                            return Gate.Status.ERROR
                        } else {
                            return Gate.Status.INIT
                        }
                    }
                }
            }
        }
    };
    WSGate.prototype.send = function(pack) {
        var conn = this.connection;
        if (conn.isRunning()) {
            return conn.send(pack) === pack.length
        } else {
            return false
        }
    };
    WSGate.prototype.receive = function(length, remove) {
        var available = this.connection.available();
        if (available === 0) {
            return null
        } else {
            if (available < length) {
                length = available
            }
        }
        return this.connection.receive(length)
    };
    WSGate.prototype.onConnectionStatusChanged = function(connection, oldStatus, newStatus) {
        var s1 = WSGate.getStatus(oldStatus);
        var s2 = WSGate.getStatus(newStatus);
        if (!s1.equals(s2)) {
            var delegate = this.getDelegate();
            if (delegate) {
                delegate.onGateStatusChanged(this, s1, s2)
            }
        }
    };
    WSGate.prototype.onConnectionReceivedData = function(connection, data) {};
    ns.WSGate = WSGate;
    ns.registers("WSGate")
})(StarGate, StarTrek, MONKEY);
if (typeof DIMSDK !== "object") {
    DIMSDK = new MONKEY.Namespace()
}
if (typeof DIMSDK.lnc !== "object") {
    DIMSDK.lnc = new MONKEY.Namespace()
}
LocalNotificationService.exports(DIMSDK.lnc);
if (typeof DIMSDK.fsm !== "object") {
    DIMSDK.fsm = new MONKEY.Namespace()
}
FiniteStateMachine.exports(DIMSDK.fsm);
if (typeof DIMSDK.dos !== "object") {
    DIMSDK.dos = new MONKEY.Namespace()
}
FileSystem.exports(DIMSDK.dos);
if (typeof DIMSDK.startrek !== "object") {
    DIMSDK.startrek = new MONKEY.Namespace()
}
StarTrek.exports(DIMSDK.startrek);
if (typeof DIMSDK.stargate !== "object") {
    DIMSDK.stargate = new MONKEY.Namespace()
}
StarGate.exports(DIMSDK.stargate);
