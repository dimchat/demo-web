/**
 *  DIM-SDK (v0.1.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      May. 5, 2020
 * @copyright (c) 2020 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */
if (typeof DIMP !== "object") {
    DIMP = {}
}! function(ns) {
    var namespacefy = function(space) {
        if (!space) {
            space = new namespace()
        } else {
            if (!is_space(space)) {
                space.__all__ = [];
                space.register = namespace.prototype.register;
                space.exports = namespace.prototype.exports
            }
        }
        return space
    };
    var is_space = function(space) {
        if (space instanceof namespace) {
            return true
        }
        if (typeof space.exports !== "function") {
            return false
        }
        if (typeof space.register !== "function") {
            return false
        }
        return space.__all__ instanceof Array
    };
    var namespace = function() {
        this.__all__ = []
    };
    namespace.prototype.register = function(name) {
        if (this.__all__.indexOf(name) < 0) {
            this.__all__.push(name);
            return true
        } else {
            return false
        }
    };
    namespace.prototype.exports = function(outerSpace) {
        namespacefy(outerSpace);
        var all = this.__all__;
        var name, inner;
        for (var i = 0; i < all.length; ++i) {
            name = all[i];
            inner = this[name];
            if (!inner) {
                throw Error("empty object: " + name)
            }
            if (is_space(inner)) {
                if (typeof outerSpace[name] !== "object") {
                    outerSpace[name] = new namespace()
                }
                inner.exports(outerSpace[name])
            } else {
                if (outerSpace.hasOwnProperty(name)) {} else {
                    outerSpace[name] = inner
                }
            }
            outerSpace.register(name)
        }
        return outerSpace
    };
    ns.Namespace = namespacefy;
    namespacefy(ns);
    ns.register("Namespace")
}(DIMP);
! function(ns) {
    if (typeof ns.type !== "object") {
        ns.type = {}
    }
    if (typeof ns.format !== "object") {
        ns.format = {}
    }
    if (typeof ns.digest !== "object") {
        ns.digest = {}
    }
    if (typeof ns.crypto !== "object") {
        ns.crypto = {}
    }
    ns.Namespace(ns.type);
    ns.Namespace(ns.format);
    ns.Namespace(ns.digest);
    ns.Namespace(ns.crypto);
    ns.register("type");
    ns.register("format");
    ns.register("digest");
    ns.register("crypto")
}(DIMP);
! function(ns) {
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
    var inherit = function(clazz, protocol) {
        var prototype = protocol.prototype;
        var names = Object.getOwnPropertyNames(prototype);
        for (var i = 0; i < names.length; ++i) {
            var key = names[i];
            if (clazz.prototype.hasOwnProperty(key)) {
                continue
            }
            var fn = prototype[key];
            if (typeof fn !== "function") {
                continue
            }
            clazz.prototype[key] = fn
        }
        return clazz
    };
    var inherits = function(clazz, interfaces) {
        for (var i = 0; i < interfaces.length; ++i) {
            clazz = inherit(clazz, interfaces[i])
        }
        return clazz
    };
    var interfacefy = function(child, parent) {
        if (!child) {
            child = function() {}
        }
        if (parent) {
            var ancestors;
            if (parent instanceof Array) {
                ancestors = parent
            } else {
                ancestors = [];
                for (var i = 1; i < arguments.length; ++i) {
                    ancestors.push(arguments[i])
                }
            }
            child = inherits(child, ancestors)
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
        inherit(child, parent);
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
            child = inherits(child, ancestors)
        }
        child.prototype.constructor = child;
        return child
    };
    ns.Interface = interfacefy;
    ns.Class = classify;
    ns.register("Interface");
    ns.register("Class")
}(DIMP);
! function(ns) {
    var obj = function() {};
    ns.Class(obj, Object, null);
    obj.prototype.equals = function(other) {
        return this === other
    };
    ns.type.Object = obj;
    ns.type.register("Object")
}(DIMP);
! function(ns) {
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
    var is_arrays_equal = function(array1, array2) {
        if (array1.length !== array2.length) {
            return false
        }
        for (var i = 0; i < array1.length; ++i) {
            if (!is_objects_equal(array1[i], array2[i])) {
                return false
            }
        }
        return true
    };
    var is_dictionary_equal = function(dict1, dict2) {
        var keys1 = Object.keys(dict1);
        var keys2 = Object.keys(dict2);
        if (keys1.length !== keys2.length) {
            return false
        }
        var k;
        for (var i = 0; i < keys1.length; ++i) {
            k = keys1[i];
            if (!is_objects_equal(dict1[k], dict2[k])) {
                return false
            }
        }
        return true
    };
    var is_objects_equal = function(obj1, obj2) {
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
                return is_arrays_equal(obj1, obj2)
            } else {
                return false
            }
        } else {
            if (is_array(obj2)) {
                return false
            }
        }
        return is_dictionary_equal(obj1, obj2)
    };
    var arrays = {
        remove: function(array, item) {
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
        },
        update: function(array, index, item) {
            if (index < 0) {
                index += array.length;
                if (index < 0) {
                    return false
                }
            }
            array[index] = item;
            return true
        },
        insert: function(array, index, item) {
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
        },
        equals: is_objects_equal
    };
    ns.type.Arrays = arrays;
    ns.type.register("Arrays")
}(DIMP);
! function(ns) {
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
                    return e.alias
                }
            }
        }
        return null
    };
    var base_enum = function(value, alias) {
        ns.type.Object.call(this);
        if (!alias) {
            if (value instanceof base_enum) {
                alias = value.alias
            } else {
                alias = get_alias.call(this, value)
            }
        }
        if (value instanceof base_enum) {
            value = value.value
        }
        this.value = value;
        this.alias = alias
    };
    ns.Class(base_enum, ns.type.Object, null);
    base_enum.prototype.equals = function(other) {
        if (!other) {
            return !this.value
        } else {
            if (other instanceof base_enum) {
                return this.value === other.valueOf()
            } else {
                return this.value === other
            }
        }
    };
    base_enum.prototype.valueOf = function() {
        return this.value
    };
    base_enum.prototype.toString = function() {
        return "<" + this.alias.toString() + ": " + this.value.toString() + ">"
    };
    base_enum.prototype.toLocaleString = function() {
        return "<" + this.alias.toLocaleString() + ": " + this.value.toLocaleString() + ">"
    };
    base_enum.prototype.toJSON = function() {
        return this.value
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
                v = v.value
            } else {
                if (typeof v !== "number") {
                    throw TypeError("Enum value must be a number!")
                }
            }
            e = new enumeration(v, name);
            enumeration[name] = e
        }
        return enumeration
    };
    ns.type.BaseEnum = base_enum;
    ns.type.Enum = enumify;
    ns.type.register("BaseEnum");
    ns.type.register("Enum")
}(DIMP);
! function(ns) {
    var bytes = function(capacity) {
        ns.type.Object.call(this);
        var value = capacity ? arguments[0] : 0;
        if (typeof value === "number") {
            if (value < 1) {
                value = 1
            }
            this.array = new Uint8Array(value);
            this.length = 0
        } else {
            if (value instanceof bytes) {
                this.array = value.array;
                this.length = value.length
            } else {
                if (value instanceof Uint8Array) {
                    this.array = value;
                    this.length = value.length
                } else {
                    value = new Uint8Array(value);
                    this.array = value;
                    this.length = value.length
                }
            }
        }
    };
    ns.Class(bytes, ns.type.Object, null);
    bytes.prototype.equals = function(other) {
        if (!other) {
            return this.length === 0
        } else {
            if (other instanceof bytes) {
                if (this.length !== other.length) {
                    return false
                } else {
                    if (this.array === other.array) {
                        return true
                    }
                }
                return ns.type.Arrays.equals(this.getBytes(false), other.getBytes(false))
            } else {
                return ns.type.Arrays.equals(this.getBytes(false), other)
            }
        }
    };
    bytes.prototype.getBytes = function(copy) {
        if (this.length < 1) {
            return null
        }
        var view;
        if (this.length === this.array.length) {
            view = this.array
        } else {
            view = this.array.subarray(0, this.length)
        }
        if (copy) {
            var array = new Uint8Array(this.length);
            array.set(view);
            return array
        } else {
            return view
        }
    };
    bytes.prototype.getByte = function(index) {
        if (index < this.length) {
            return this.array[index]
        } else {
            return 0
        }
    };
    bytes.prototype.setByte = function(index, value) {
        if (index >= this.array.length) {
            expand.call(this, index + 1)
        }
        this.array[index] = value;
        if (index >= this.length) {
            this.length = index + 1
        }
    };
    var expand = function(size) {
        var bigger = new Uint8Array(size);
        bigger.set(this.array);
        this.array = bigger
    };
    var add_item = function(value) {
        if (this.length >= this.array.length) {
            expand.call(this, this.length << 1)
        }
        this.array[this.length] = value;
        ++this.length
    };
    var add_array = function(array) {
        if (!array) {
            return
        }
        var size = array.length;
        if (size < 1) {
            return
        }
        size += this.length;
        var capacity = this.array.length;
        if (size > capacity) {
            while (capacity < size) {
                capacity = capacity << 1
            }
            expand.call(this, capacity)
        }
        this.array.set(array, this.length);
        this.length = size
    };
    bytes.prototype.push = function(items) {
        if (typeof items === "number") {
            add_item.call(this, items)
        } else {
            var array;
            if (items instanceof Uint8Array) {
                array = items
            } else {
                if (items instanceof bytes) {
                    array = items.getBytes(false)
                } else {
                    array = new Uint8Array(items)
                }
            }
            add_array.call(this, array)
        }
        return this.length
    };
    bytes.prototype.pop = function() {
        if (this.length < 1) {
            throw RangeError("bytes empty")
        }
        this.length -= 1;
        var last = this.array[this.length];
        this.array[this.length] = 0;
        return last
    };
    bytes.prototype.copy = function() {
        return new bytes(this.getBytes(true))
    };
    bytes.prototype.concat = function(items) {
        var clone = this.copy();
        for (var i = 0; i < arguments.length; ++i) {
            clone.push(arguments[i])
        }
        return clone
    };
    bytes.prototype.toArray = function() {
        var array = this.getBytes(false);
        if (typeof Array.from === "function") {
            return Array.from(array)
        } else {
            return [].slice.call(array)
        }
    };
    bytes.from = function(array) {
        return new bytes(array)
    };
    ns.type.Data = bytes;
    ns.type.register("Data")
}(DIMP);
! function(ns) {
    var str = function(value) {
        if (!value) {
            value = ""
        } else {
            if (value instanceof str) {
                value = value.valueOf()
            } else {
                if (value instanceof Uint8Array) {
                    if (arguments.length === 1 || arguments[1] === "UTF-8") {
                        value = ns.format.UTF8.decode(value)
                    } else {
                        throw Error("unknown charset: " + arguments[1])
                    }
                } else {
                    if (typeof value !== "string") {
                        throw Error("string value error: " + value)
                    }
                }
            }
        }
        ns.type.Object.call(this);
        this.string = value
    };
    ns.Class(str, ns.type.Object, null);
    str.prototype.getBytes = function(charset) {
        if (!charset || charset === "UTF-8") {
            return ns.format.UTF8.encode(this.string)
        }
        throw Error("unknown charset: " + charset)
    };
    str.prototype.equals = function(other) {
        if (!other) {
            return !this.string
        } else {
            if (other instanceof str) {
                return this.string === other.string
            } else {
                return this.string === other
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
            return !this.string
        } else {
            if (other instanceof str) {
                return equalsIgnoreCase(this.string, other.string)
            } else {
                return equalsIgnoreCase(this.string, other)
            }
        }
    };
    str.prototype.valueOf = function() {
        return this.string
    };
    str.prototype.toString = function() {
        return this.string
    };
    str.prototype.toLocaleString = function() {
        return this.string.toLocaleString()
    };
    str.prototype.toJSON = function() {
        return this.string
    };
    str.prototype.getLength = function() {
        return this.string.length
    };
    str.from = function(array) {
        if (array instanceof Array) {
            array = new Uint8Array(array)
        }
        if (arguments.length === 1) {
            return new str(array)
        } else {
            return new str(array, arguments[1])
        }
    };
    ns.type.String = str;
    ns.type.register("String")
}(DIMP);
! function(ns) {
    var Arrays = ns.type.Arrays;
    var map = function(entries) {
        if (!entries) {
            entries = {}
        } else {
            if (entries instanceof map) {
                entries = entries.getMap(false)
            } else {
                if (entries instanceof ns.type.String) {
                    entries = ns.format.JSON.decode(entries.toString())
                } else {
                    if (typeof entries === "string") {
                        entries = ns.format.JSON.decode(entries)
                    }
                }
            }
        }
        ns.type.Object.call(this);
        this.dictionary = entries
    };
    ns.Class(map, ns.type.Object, null);
    map.prototype.equals = function(other) {
        if (!other) {
            return !this.dictionary
        } else {
            if (other instanceof map) {
                return Arrays.equals(this.dictionary, other.getMap(false))
            } else {
                return Arrays.equals(this.dictionary, other)
            }
        }
    };
    map.prototype.valueOf = function() {
        return this.dictionary
    };
    map.prototype.toString = function() {
        return this.dictionary.toString()
    };
    map.prototype.toLocaleString = function() {
        return this.dictionary.toLocaleString()
    };
    map.prototype.toJSON = function() {
        return this.dictionary
    };
    map.prototype.getMap = function(copy) {
        if (copy) {
            var json = ns.format.JSON.encode(this.dictionary);
            return ns.format.JSON.decode(json)
        } else {
            return this.dictionary
        }
    };
    map.prototype.allKeys = function() {
        return Object.keys(this.dictionary)
    };
    map.prototype.getValue = function(key) {
        return this.dictionary[key]
    };
    map.prototype.setValue = function(key, value) {
        if (value) {
            this.dictionary[key] = value
        } else {
            if (this.dictionary.hasOwnProperty(key)) {
                delete this.dictionary[key]
            }
        }
    };
    map.from = function(dict) {
        return new map(dict)
    };
    ns.type.Dictionary = map;
    ns.type.register("Dictionary")
}(DIMP);
! function(ns) {
    var Data = ns.type.Data;
    var hex_chars = "0123456789abcdef";
    var hex_values = new Int8Array(128);
    ! function(chars, values) {
        for (var i = 0; i < chars.length; ++i) {
            values[chars.charCodeAt(i)] = i
        }
        values["A".charCodeAt(0)] = 10;
        values["B".charCodeAt(0)] = 11;
        values["C".charCodeAt(0)] = 12;
        values["D".charCodeAt(0)] = 13;
        values["E".charCodeAt(0)] = 14;
        values["F".charCodeAt(0)] = 15
    }(hex_chars, hex_values);
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
        return data.getBytes(false)
    };
    var base64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64_values = new Int8Array(128);
    ! function(chars, values) {
        for (var i = 0; i < chars.length; ++i) {
            values[chars.charCodeAt(i)] = i
        }
    }(base64_chars, base64_values);
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
            throw Error("base64 string error: " + string)
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
        return array.getBytes(false)
    };
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
    var hex = function() {};
    ns.Class(hex, ns.type.Object, [coder]);
    hex.prototype.encode = function(data) {
        return hex_encode(data)
    };
    hex.prototype.decode = function(str) {
        return hex_decode(str)
    };
    var base64 = function() {};
    ns.Class(base64, ns.type.Object, [coder]);
    base64.prototype.encode = function(data) {
        return base64_encode(data)
    };
    base64.prototype.decode = function(string) {
        return base64_decode(string)
    };
    var base58 = function() {};
    ns.Class(base58, ns.type.Object, [coder]);
    base58.prototype.encode = function(data) {
        console.assert(false, "Base58 encode not implemented");
        return null
    };
    base58.prototype.decode = function(string) {
        console.assert(false, "Base58 decode not implemented");
        return null
    };
    var Lib = function(coder) {
        this.coder = coder
    };
    ns.Class(Lib, ns.type.Object, [coder]);
    Lib.prototype.encode = function(data) {
        return this.coder.encode(data)
    };
    Lib.prototype.decode = function(string) {
        return this.coder.decode(string)
    };
    ns.format.BaseCoder = coder;
    ns.format.Hex = new Lib(new hex());
    ns.format.Base58 = new Lib(new base58());
    ns.format.Base64 = new Lib(new base64());
    ns.format.register("BaseCoder");
    ns.format.register("Hex");
    ns.format.register("Base58");
    ns.format.register("Base64")
}(DIMP);
! function(ns) {
    var utf8_encode = function(string) {
        var len = string.length;
        var array = new ns.type.Data(len);
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
        return array.getBytes(false)
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
    var json = function() {};
    ns.Class(json, ns.type.Object, [parser]);
    json.prototype.encode = function(container) {
        var string = JSON.stringify(container);
        if (!string) {
            throw TypeError("failed to encode JSON object: " + container)
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
            throw TypeError("failed to decode JSON data: " + json)
        }
        return JSON.parse(string)
    };
    var utf8 = function() {};
    ns.Class(utf8, ns.type.Object, [parser]);
    utf8.prototype.encode = utf8_encode;
    utf8.prototype.decode = utf8_decode;
    var Lib = function(parser) {
        this.parser = parser
    };
    ns.Class(Lib, ns.type.Object, [parser]);
    Lib.prototype.encode = function(object) {
        return this.parser.encode(object)
    };
    Lib.prototype.decode = function(data) {
        return this.parser.decode(data)
    };
    ns.format.DataParser = parser;
    ns.format.JSON = new Lib(new json());
    ns.format.UTF8 = new Lib(new utf8());
    ns.format.register("DataParser");
    ns.format.register("JSON");
    ns.format.register("UTF8")
}(DIMP);
! function(ns) {
    var hash = function() {};
    ns.Interface(hash, null);
    hash.prototype.digest = function(data) {
        console.assert(false, "implement me!");
        return null
    };
    var md5 = function() {};
    ns.Class(md5, ns.type.Object, [hash]);
    md5.prototype.digest = function(data) {
        console.assert(false, "MD5 not implemented");
        return null
    };
    var sha256 = function() {};
    ns.Class(sha256, ns.type.Object, [hash]);
    sha256.prototype.digest = function(data) {
        console.assert(false, "SHA256 not implemented");
        return null
    };
    var ripemd160 = function() {};
    ns.Class(ripemd160, ns.type.Object, [hash]);
    ripemd160.prototype.digest = function(data) {
        console.assert(false, "RIPEMD160 not implemented");
        return null
    };
    var Lib = function(hash) {
        this.hash = hash
    };
    ns.Class(Lib, ns.type.Object, [hash]);
    Lib.prototype.digest = function(data) {
        return this.hash.digest(data)
    };
    ns.digest.Hash = hash;
    ns.digest.MD5 = new Lib(new md5());
    ns.digest.SHA256 = new Lib(new sha256());
    ns.digest.RIPEMD160 = new Lib(new ripemd160());
    ns.digest.register("Hash");
    ns.digest.register("MD5");
    ns.digest.register("SHA256");
    ns.digest.register("RIPEMD160")
}(DIMP);
! function(ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = function(key) {
        Dictionary.call(this, key)
    };
    ns.Class(CryptographyKey, Dictionary, null);
    CryptographyKey.prototype.getData = function() {
        console.assert(false, "implement me!");
        return null
    };
    CryptographyKey.prototype.getSize = function() {
        console.assert(false, "implement me!");
        return 0
    };
    CryptographyKey.createInstance = function(clazz, map) {
        if (typeof clazz.getInstance === "function") {
            return clazz.getInstance(map)
        } else {
            return new clazz(map)
        }
    };
    ns.crypto.CryptographyKey = CryptographyKey
}(DIMP);
! function(ns) {
    var EncryptKey = function() {};
    ns.Interface(EncryptKey, null);
    EncryptKey.prototype.encrypt = function(plaintext) {
        console.assert(false, "implement me!");
        return null
    };
    var DecryptKey = function() {};
    ns.Interface(DecryptKey, null);
    DecryptKey.prototype.decrypt = function(ciphertext) {
        console.assert(false, "implement me!");
        return null
    };
    var SignKey = function() {};
    ns.Interface(SignKey, null);
    SignKey.prototype.sign = function(data) {
        console.assert(false, "implement me!");
        return null
    };
    var VerifyKey = function() {};
    ns.Interface(VerifyKey, null);
    VerifyKey.prototype.verify = function(data, signature) {
        console.assert(false, "implement me!");
        return false
    };
    ns.crypto.EncryptKey = EncryptKey;
    ns.crypto.DecryptKey = DecryptKey;
    ns.crypto.SignKey = SignKey;
    ns.crypto.VerifyKey = VerifyKey;
    ns.crypto.register("EncryptKey");
    ns.crypto.register("DecryptKey");
    ns.crypto.register("SignKey");
    ns.crypto.register("VerifyKey")
}(DIMP);
! function(ns) {
    var UTF8 = ns.format.UTF8;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var EncryptKey = ns.crypto.EncryptKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var promise = UTF8.encode("Moky loves May Lee forever!");
    var SymmetricKey = function(key) {
        CryptographyKey.call(this, key)
    };
    ns.Class(SymmetricKey, CryptographyKey, [EncryptKey, DecryptKey]);
    SymmetricKey.prototype.equals = function(other) {
        var ciphertext = other.encrypt(promise);
        var plaintext = this.decrypt(ciphertext);
        return ns.type.Arrays.equals(promise, plaintext)
    };
    SymmetricKey.generate = function(algorithm) {
        return this.getInstance({
            algorithm: algorithm
        })
    };
    var key_classes = {};
    SymmetricKey.register = function(algorithm, clazz) {
        key_classes[algorithm] = clazz
    };
    SymmetricKey.getInstance = function(key) {
        if (!key) {
            return null
        } else {
            if (key instanceof SymmetricKey) {
                return key
            }
        }
        var algorithm = key["algorithm"];
        var clazz = key_classes[algorithm];
        if (typeof clazz === "function") {
            return CryptographyKey.createInstance(clazz, key)
        }
        throw TypeError("key algorithm error: " + algorithm)
    };
    SymmetricKey.AES = "AES";
    SymmetricKey.DES = "DES";
    ns.crypto.SymmetricKey = SymmetricKey;
    ns.crypto.register("SymmetricKey")
}(DIMP);
! function(ns) {
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = function(key) {
        CryptographyKey.call(this, key)
    };
    ns.Class(AsymmetricKey, CryptographyKey, null);
    AsymmetricKey.RSA = "RSA";
    AsymmetricKey.ECC = "ECC";
    ns.crypto.AsymmetricKey = AsymmetricKey;
    ns.crypto.register("AsymmetricKey")
}(DIMP);
! function(ns) {
    var UTF8 = ns.format.UTF8;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var VerifyKey = ns.crypto.VerifyKey;
    var promise = UTF8.encode("Moky loves May Lee forever!");
    var PublicKey = function(key) {
        AsymmetricKey.call(this, key)
    };
    ns.Class(PublicKey, AsymmetricKey, [VerifyKey]);
    PublicKey.prototype.matches = function(privateKey) {
        if (!privateKey) {
            return false
        }
        var publicKey = privateKey.getPublicKey();
        if (this.equals(publicKey)) {
            return true
        }
        var signature = privateKey.sign(promise);
        return this.verify(promise, signature)
    };
    var public_key_classes = {};
    PublicKey.register = function(algorithm, clazz) {
        public_key_classes[algorithm] = clazz
    };
    PublicKey.getInstance = function(key) {
        if (!key) {
            return null
        } else {
            if (key instanceof PublicKey) {
                return key
            }
        }
        var algorithm = key["algorithm"];
        var clazz = public_key_classes[algorithm];
        if (typeof clazz === "function") {
            return CryptographyKey.createInstance(clazz, key)
        }
        throw TypeError("key algorithm error: " + algorithm)
    };
    ns.crypto.PublicKey = PublicKey;
    ns.crypto.register("PublicKey")
}(DIMP);
! function(ns) {
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var SignKey = ns.crypto.SignKey;
    var PrivateKey = function(key) {
        AsymmetricKey.call(this, key)
    };
    ns.Class(PrivateKey, AsymmetricKey, [SignKey]);
    PrivateKey.prototype.equals = function(other) {
        var publicKey = this.getPublicKey();
        if (!publicKey) {
            return false
        }
        return publicKey.matches(other)
    };
    PrivateKey.prototype.getPublicKey = function() {
        console.assert(false, "implement me!");
        return null
    };
    PrivateKey.generate = function(algorithm) {
        return this.getInstance({
            algorithm: algorithm
        })
    };
    var private_key_classes = {};
    PrivateKey.register = function(algorithm, clazz) {
        private_key_classes[algorithm] = clazz
    };
    PrivateKey.getInstance = function(key) {
        if (!key) {
            return null
        } else {
            if (key instanceof PrivateKey) {
                return key
            }
        }
        var algorithm = key["algorithm"];
        var clazz = private_key_classes[algorithm];
        if (typeof clazz === "function") {
            return CryptographyKey.createInstance(clazz, key)
        }
        throw TypeError("key algorithm error: " + algorithm)
    };
    ns.crypto.PrivateKey = PrivateKey;
    ns.crypto.register("PrivateKey")
}(DIMP);
if (typeof MingKeMing !== "object") {
    MingKeMing = {}
}! function(ns) {
    DIMP.exports(ns);
    if (typeof ns.protocol !== "object") {
        ns.protocol = {}
    }
    DIMP.Namespace(ns.protocol);
    ns.register("protocol")
}(MingKeMing);
! function(ns) {
    var NetworkType = ns.type.Enum(null, {
        BTCMain: (0),
        Main: (8),
        Group: (16),
        Polylogue: (16),
        Chatroom: (48),
        Provider: (118),
        Station: (136),
        Thing: (128),
        Robot: (200)
    });
    NetworkType.isUser = function(network) {
        var main = NetworkType.Main.valueOf();
        var btcMain = NetworkType.BTCMain.valueOf();
        return ((network & main) === main) || (network === btcMain)
    };
    NetworkType.isGroup = function(network) {
        var group = NetworkType.Group.valueOf();
        return (network & group) === group
    };
    ns.protocol.NetworkType = NetworkType;
    ns.protocol.register("NetworkType")
}(MingKeMing);
! function(ns) {
    var MetaType = ns.type.Enum(null, {
        Default: (1),
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
    ns.protocol.register("MetaType")
}(MingKeMing);
! function(ns) {
    var NetworkType = ns.protocol.NetworkType;
    var Address = function(string) {
        ns.type.String.call(this, string)
    };
    ns.Class(Address, ns.type.String, null);
    Address.prototype.getNetwork = function() {
        console.assert(false, "implement me!");
        return 0
    };
    Address.prototype.getCode = function() {
        console.assert(false, "implement me!");
        return 0
    };
    Address.prototype.isBroadcast = function() {
        if (this.getCode() !== BROADCAST_CODE) {
            return false
        }
        var network = this.getNetwork();
        if (network === NetworkType.Group.valueOf()) {
            return this.equals(EVERYWHERE)
        }
        if (network === NetworkType.Main.valueOf()) {
            return this.equals(ANYWHERE)
        }
        return false
    };
    Address.prototype.isUser = function() {
        var network = this.getNetwork();
        return NetworkType.isUser(network)
    };
    Address.prototype.isGroup = function() {
        var network = this.getNetwork();
        return NetworkType.isGroup(network)
    };
    var address_classes = [];
    Address.register = function(clazz) {
        address_classes.push(clazz)
    };
    Address.getInstance = function(string) {
        if (!string) {
            return null
        } else {
            if (string instanceof Address) {
                return string
            }
        }
        if (ANYWHERE.equalsIgnoreCase(string)) {
            return ANYWHERE
        }
        if (EVERYWHERE.equalsIgnoreCase(string)) {
            return EVERYWHERE
        }
        var clazz;
        for (var i = address_classes.length - 1; i >= 0; --i) {
            clazz = address_classes[i];
            try {
                var addr = new clazz(string);
                if (addr) {
                    return addr
                }
            } catch (e) {}
        }
        throw TypeError("unrecognized address: " + string)
    };
    var ConstantAddress = function(string, network, number) {
        Address.call(this, string);
        if (network instanceof NetworkType) {
            network = network.valueOf()
        }
        this.network = network;
        this.number = number
    };
    ns.Class(ConstantAddress, Address, null);
    ConstantAddress.prototype.getNetwork = function() {
        return this.network
    };
    ConstantAddress.prototype.getCode = function() {
        return this.number
    };
    var BROADCAST_CODE = 9527;
    var ANYWHERE = new ConstantAddress("anywhere", NetworkType.Main, BROADCAST_CODE);
    var EVERYWHERE = new ConstantAddress("everywhere", NetworkType.Group, BROADCAST_CODE);
    Address.ANYWHERE = ANYWHERE;
    Address.EVERYWHERE = EVERYWHERE;
    ns.Address = Address;
    ns.register("Address")
}(MingKeMing);
! function(ns) {
    var Address = ns.Address;
    var ID = function(name, address, terminal) {
        var string;
        if (name instanceof ID) {
            string = name.toString();
            address = name.address;
            terminal = name.terminal;
            name = name.name
        } else {
            if (!address) {
                string = name;
                var pair = name.split("/");
                if (pair.length === 1) {
                    terminal = null
                } else {
                    terminal = pair[1]
                }
                pair = pair[0].split("@");
                if (pair.length === 1) {
                    name = null;
                    address = Address.getInstance(pair[0])
                } else {
                    name = pair[0];
                    address = Address.getInstance(pair[1])
                }
            } else {
                address = Address.getInstance(address);
                string = address.toString();
                if (name && name.length > 0) {
                    string = name + "@" + string
                }
                if (terminal && terminal.length > 0) {
                    string = string + "/" + terminal
                }
            }
        }
        ns.type.String.call(this, string);
        this.name = name;
        this.address = address;
        this.terminal = terminal
    };
    ns.Class(ID, ns.type.String, null);
    ID.prototype.equals = function(other) {
        if (!other) {
            return false
        } else {
            if (ns.type.String.prototype.equals.call(this, other)) {
                return true
            } else {
                if (other instanceof ID) {
                    if (!this.address.equals(other.address)) {
                        return false
                    }
                    if (!this.name) {
                        return !other.name
                    } else {
                        return this.name === other.name
                    }
                }
            }
        }
        var pair = other.split("/");
        if (!this.terminal) {
            return pair[0] === this.string
        } else {
            return pair[0] === this.string.split("/")[0]
        }
    };
    ID.prototype.getType = function() {
        return this.address.getNetwork()
    };
    ID.prototype.getNumber = function() {
        return this.address.getCode()
    };
    ID.prototype.isValid = function() {
        return this.getNumber() > 0
    };
    ID.prototype.isBroadcast = function() {
        return this.address.isBroadcast()
    };
    ID.prototype.isUser = function() {
        return this.address.isUser()
    };
    ID.prototype.isGroup = function() {
        return this.address.isGroup()
    };
    ID.ANYONE = new ID("anyone", Address.ANYWHERE);
    ID.EVERYONE = new ID("everyone", Address.EVERYWHERE);
    ID.getInstance = function(string) {
        if (!string) {
            return null
        } else {
            if (string instanceof ID) {
                return string
            }
        }
        return new ID(string)
    };
    ns.ID = ID;
    ns.register("ID")
}(MingKeMing);
! function(ns) {
    var Dictionary = ns.type.Dictionary;
    var PublicKey = ns.crypto.PublicKey;
    var Base64 = ns.format.Base64;
    var UTF8 = ns.format.UTF8;
    var MetaType = ns.protocol.MetaType;
    var NetworkType = ns.protocol.NetworkType;
    var Address = ns.Address;
    var ID = ns.ID;
    var Meta = function(map) {
        Dictionary.call(this, map);
        var version = map["version"];
        if (version instanceof MetaType) {
            version = version.valueOf()
        }
        this.version = version;
        this.key = PublicKey.getInstance(map["key"]);
        if (this.hasSeed()) {
            this.seed = map["seed"];
            this.fingerprint = Base64.decode(map["fingerprint"])
        } else {
            this.seed = null;
            this.fingerprint = null
        }
        this.status = 0
    };
    ns.Class(Meta, Dictionary, null);
    Meta.prototype.equals = function(other) {
        if (!other) {
            return false
        } else {
            if (Dictionary.prototype.equals.call(this, other)) {
                return true
            }
        }
        var meta = Meta.getInstance(other);
        var identifier = meta.generateIdentifier(NetworkType.Main);
        return this.matches(identifier)
    };
    Meta.prototype.hasSeed = function() {
        return MetaType.hasSeed(this.version)
    };
    Meta.prototype.isValid = function() {
        if (this.status === 0) {
            if (!this.key) {
                this.status = -1
            } else {
                if (this.hasSeed()) {
                    if (!this.seed || !this.fingerprint) {
                        this.status = -1
                    } else {
                        var data = UTF8.encode(this.seed);
                        var signature = this.fingerprint;
                        if (this.key.verify(data, signature)) {
                            this.status = 1
                        } else {
                            this.status = -1
                        }
                    }
                } else {
                    this.status = 1
                }
            }
        }
        return this.status === 1
    };
    var match_public_key = function(publicKey) {
        if (this.key.equals(publicKey)) {
            return true
        }
        if (this.hasSeed()) {
            var data = UTF8.encode(this.seed);
            var signature = this.fingerprint;
            return publicKey.verify(data, signature)
        } else {
            return false
        }
    };
    var match_identifier = function(identifier) {
        var network = identifier.getType();
        return this.generateIdentifier(network).equals(identifier)
    };
    var match_address = function(address) {
        var network = address.getNetwork();
        return this.generateAddress(network).equals(address)
    };
    Meta.prototype.matches = function(key_id_addr) {
        if (!this.isValid()) {
            return false
        }
        if (key_id_addr instanceof ID) {
            return match_identifier.call(this, key_id_addr)
        } else {
            if (key_id_addr instanceof Address) {
                return match_address.call(this, key_id_addr)
            } else {
                if (key_id_addr instanceof PublicKey) {
                    return match_public_key.call(this, key_id_addr)
                }
            }
        }
        return false
    };
    Meta.prototype.generateIdentifier = function(network) {
        var address = this.generateAddress(network);
        return new ID(this.seed, address)
    };
    Meta.prototype.generateAddress = function(network) {
        console.assert(false, "implement me!");
        return null
    };
    Meta.generate = function(type, privateKey, seed) {
        var version;
        if (type instanceof MetaType) {
            version = type.valueOf()
        } else {
            version = type
        }
        var meta = {
            "version": version,
            "key": privateKey.getPublicKey()
        };
        if (MetaType.hasSeed(version)) {
            var data = UTF8.encode(seed);
            var fingerprint = privateKey.sign(data);
            meta["seed"] = seed;
            meta["fingerprint"] = Base64.encode(fingerprint)
        }
        return Meta.getInstance(meta)
    };
    var meta_classes = {};
    Meta.register = function(type, clazz) {
        var version;
        if (type instanceof MetaType) {
            version = type.valueOf()
        } else {
            version = type
        }
        meta_classes[version] = clazz
    };
    Meta.getInstance = function(meta) {
        if (!meta) {
            return null
        } else {
            if (meta instanceof Meta) {
                return meta
            }
        }
        var version = meta["version"];
        if (version instanceof MetaType) {
            version = version.valueOf()
        }
        var clazz = meta_classes[version];
        if (typeof clazz !== "function") {
            throw TypeError("meta not supported: " + meta)
        }
        if (typeof clazz.getInstance === "function") {
            return clazz.getInstance(meta)
        }
        return new clazz(meta)
    };
    ns.Meta = Meta;
    ns.register("Meta")
}(MingKeMing);
! function(ns) {
    var TAI = function() {};
    ns.Interface(TAI, null);
    TAI.prototype.isValid = function() {
        console.assert(false, "implement me!");
        return false
    };
    TAI.prototype.getIdentifier = function() {
        console.assert(false, "implement me!");
        return null
    };
    TAI.prototype.getKey = function() {
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
    TAI.prototype.verify = function(publicKey) {
        console.assert(false, "implement me!");
        return false
    };
    TAI.prototype.sign = function(privateKey) {
        console.assert(false, "implement me!");
        return null
    };
    var Dictionary = ns.type.Dictionary;
    var Base64 = ns.format.Base64;
    var JSON = ns.format.JSON;
    var UTF8 = ns.format.UTF8;
    var PublicKey = ns.crypto.PublicKey;
    var ID = ns.ID;
    var Profile = function(info) {
        if (!info) {
            info = {}
        } else {
            if (typeof info === "string" || info instanceof ID) {
                info = {
                    "ID": info
                }
            }
        }
        Dictionary.call(this, info);
        this.key = null;
        this.data = null;
        this.signature = null;
        this.properties = null;
        this.status = 0
    };
    ns.Class(Profile, Dictionary, [TAI]);
    Profile.prototype.isValid = function() {
        return this.status >= 0
    };
    Profile.prototype.getIdentifier = function() {
        return this.getValue("ID")
    };
    Profile.prototype.getData = function() {
        if (!this.data) {
            var string = this.getValue("data");
            if (string) {
                this.data = UTF8.encode(string)
            }
        }
        return this.data
    };
    Profile.prototype.getSignature = function() {
        if (!this.signature) {
            var base64 = this.getValue("signature");
            if (base64) {
                this.signature = Base64.decode(base64)
            }
        }
        return this.signature
    };
    Profile.prototype.getProperties = function() {
        if (this.status < 0) {
            return null
        }
        if (!this.properties) {
            var string = this.getValue("data");
            if (string) {
                this.properties = JSON.decode(string)
            } else {
                this.properties = {}
            }
        }
        return this.properties
    };
    Profile.prototype.allPropertyNames = function() {
        var dict = this.getProperties();
        if (!dict) {
            return null
        }
        return Object.keys(dict)
    };
    Profile.prototype.getProperty = function(name) {
        var dict = this.getProperties();
        if (!dict) {
            return null
        }
        return dict[name]
    };
    Profile.prototype.setProperty = function(name, value) {
        this.status = 0;
        var dict = this.getProperties();
        dict[name] = value;
        this.setValue("data", null);
        this.setValue("signature", null);
        this.data = null;
        this.signature = null
    };
    Profile.prototype.verify = function(publicKey) {
        if (this.status > 0) {
            return true
        }
        var data = this.getData();
        var signature = this.getSignature();
        if (!data) {
            if (!signature) {
                this.status = 0
            } else {
                this.status = -1
            }
        } else {
            if (!signature) {
                this.status = -1
            } else {
                if (publicKey.verify(data, signature)) {
                    this.status = 1
                }
            }
        }
        return this.status > 0
    };
    Profile.prototype.sign = function(privateKey) {
        if (this.status > 0) {
            return this.signature
        }
        this.status = 1;
        this.data = JSON.encode(this.getProperties());
        this.signature = privateKey.sign(this.data);
        this.setValue("data", UTF8.decode(this.data));
        this.setValue("signature", Base64.encode(this.signature));
        return this.signature
    };
    Profile.prototype.getName = function() {
        return this.getProperty("name")
    };
    Profile.prototype.setName = function(name) {
        this.setProperty("name", name)
    };
    Profile.prototype.getKey = function() {
        if (!this.key) {
            var key = this.getProperty("key");
            if (key) {
                this.key = PublicKey.getInstance(key)
            }
        }
        return this.key
    };
    Profile.prototype.setKey = function(publicKey) {
        this.key = publicKey;
        this.setProperty("key", publicKey)
    };
    var tai_classes = [];
    Profile.register = function(clazz) {
        tai_classes.push(clazz)
    };
    Profile.getInstance = function(dict) {
        if (!dict) {
            return null
        } else {
            if (dict instanceof Profile) {
                return dict
            }
        }
        var clazz;
        for (var i = tai_classes.length - 1; i >= 0; --i) {
            clazz = tai_classes[i];
            try {
                var tai = new clazz(dict);
                if (tai) {
                    return tai
                }
            } catch (e) {}
        }
        return new Profile(dict)
    };
    ns.Profile = Profile;
    ns.register("Profile")
}(MingKeMing);
! function(ns) {
    var EntityDataSource = function() {};
    ns.Interface(EntityDataSource, null);
    EntityDataSource.prototype.getMeta = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    EntityDataSource.prototype.getProfile = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    ns.EntityDataSource = EntityDataSource;
    ns.register("EntityDataSource")
}(MingKeMing);
! function(ns) {
    var EntityDataSource = ns.EntityDataSource;
    var UserDataSource = function() {};
    ns.Interface(UserDataSource, [EntityDataSource]);
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
    ns.UserDataSource = UserDataSource;
    ns.register("UserDataSource")
}(MingKeMing);
! function(ns) {
    var EntityDataSource = ns.EntityDataSource;
    var GroupDataSource = function() {};
    ns.Interface(GroupDataSource, [EntityDataSource]);
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
    ns.GroupDataSource = GroupDataSource;
    ns.register("GroupDataSource")
}(MingKeMing);
! function(ns) {
    var ID = ns.ID;
    var Entity = function(identifier) {
        this.identifier = identifier;
        this.delegate = null
    };
    ns.Class(Entity, ns.type.Object, null);
    Entity.prototype.equals = function(other) {
        if (this === other) {
            return true
        } else {
            if (other instanceof Entity) {
                return this.identifier.equals(other.identifier)
            } else {
                if (other instanceof ID) {
                    return this.identifier.equals(other)
                } else {
                    return false
                }
            }
        }
    };
    Entity.prototype.valueOf = function() {
        var clazz = Object.getPrototypeOf(this).constructor;
        return "<" + clazz.name + "|" + this.getType() + " " + this.identifier + " (" + this.getNumber() + ")" + ' "' + this.getName() + '">'
    };
    Entity.prototype.toString = function() {
        var clazz = Object.getPrototypeOf(this).constructor;
        return "<" + clazz.name + "|" + this.getType() + " " + this.identifier + " (" + this.getNumber().toString() + ")" + ' "' + this.getName() + '">'
    };
    Entity.prototype.toLocaleString = function() {
        var clazz = Object.getPrototypeOf(this).constructor;
        return "<" + clazz.name + "|" + this.getType() + " " + this.identifier + " (" + this.getNumber().toLocaleString() + ")" + ' "' + this.getName() + '">'
    };
    Entity.prototype.getType = function() {
        return this.identifier.getType()
    };
    Entity.prototype.getNumber = function() {
        return this.identifier.getNumber()
    };
    Entity.prototype.getName = function() {
        var profile = this.getProfile();
        if (profile) {
            var name = profile.getName();
            if (name) {
                return name
            }
        }
        return this.identifier.name
    };
    Entity.prototype.getMeta = function() {
        return this.delegate.getMeta(this.identifier)
    };
    Entity.prototype.getProfile = function() {
        return this.delegate.getProfile(this.identifier)
    };
    ns.Entity = Entity;
    ns.register("Entity")
}(MingKeMing);
! function(ns) {
    var EncryptKey = ns.crypto.EncryptKey;
    var PublicKey = ns.crypto.PublicKey;
    var Entity = ns.Entity;
    var User = function(identifier) {
        Entity.call(this, identifier)
    };
    ns.Class(User, Entity, null);
    User.prototype.getContacts = function() {
        return this.delegate.getContacts(this.identifier)
    };
    var meta_key = function() {
        var meta = this.getMeta();
        return meta.key
    };
    var profile_key = function() {
        var profile = this.getProfile();
        if (!profile || !profile.isValid()) {
            return null
        }
        return profile.getKey()
    };
    var encrypt_key = function() {
        var key = this.delegate.getPublicKeyForEncryption(this.identifier);
        if (key) {
            return key
        }
        key = profile_key.call(this);
        if (key) {
            return key
        }
        key = meta_key.call(this);
        if (ns.Interface.conforms(key, EncryptKey)) {
            return key
        }
        throw Error("failed to get encrypt key for user: " + this.identifier)
    };
    var verify_keys = function() {
        var keys = this.delegate.getPublicKeysForVerification(this.identifier);
        if (keys && keys.length > 0) {
            return keys
        }
        keys = [];
        var key = profile_key.call(this);
        if (key && (key instanceof PublicKey)) {
            keys.push(key)
        }
        key = meta_key.call(this);
        keys.push(key);
        return keys
    };
    User.prototype.verify = function(data, signature) {
        var keys = verify_keys.call(this);
        if (keys) {
            for (var i = 0; i < keys.length; ++i) {
                if (keys[i].verify(data, signature)) {
                    return true
                }
            }
        }
        return false
    };
    User.prototype.encrypt = function(plaintext) {
        var key = encrypt_key.call(this);
        if (!key) {
            throw Error("failed to get encrypt key for user: " + this.identifier)
        }
        return key.encrypt(plaintext)
    };
    var sign_key = function() {
        return this.delegate.getPrivateKeyForSignature(this.identifier)
    };
    var decrypt_keys = function() {
        return this.delegate.getPrivateKeysForDecryption(this.identifier)
    };
    User.prototype.sign = function(data) {
        var key = sign_key.call(this);
        return key.sign(data)
    };
    User.prototype.decrypt = function(ciphertext) {
        var plaintext;
        var keys = decrypt_keys.call(this);
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
    ns.User = User;
    ns.register("User")
}(MingKeMing);
! function(ns) {
    var Entity = ns.Entity;
    var Group = function(identifier) {
        Entity.call(this, identifier);
        this.founder = null
    };
    ns.Class(Group, Entity, null);
    Group.prototype.getFounder = function() {
        if (!this.founder) {
            this.founder = this.delegate.getFounder(this.identifier)
        }
        return this.founder
    };
    Group.prototype.getOwner = function() {
        return this.delegate.getOwner(this.identifier)
    };
    Group.prototype.getMembers = function() {
        return this.delegate.getMembers(this.identifier)
    };
    ns.Group = Group;
    ns.register("Group")
}(MingKeMing);
if (typeof DaoKeDao !== "object") {
    DaoKeDao = {}
}! function(ns) {
    DIMP.exports(ns);
    if (typeof ns.protocol !== "object") {
        ns.protocol = {}
    }
    DIMP.Namespace(ns.protocol);
    ns.register("protocol")
}(DaoKeDao);
! function(ns) {
    var ContentType = ns.type.Enum(null, {
        UNKNOWN: (0),
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
    ns.protocol.register("ContentType")
}(DaoKeDao);
! function(ns) {
    var Dictionary = ns.type.Dictionary;
    var ContentType = ns.protocol.ContentType;
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
    var Content = function(info) {
        if ((typeof info === "number") || info instanceof ContentType) {
            info = {
                "type": info,
                "sn": randomPositiveInteger()
            }
        }
        Dictionary.call(this, info);
        var type = info["type"];
        if (type instanceof ContentType) {
            type = type.valueOf()
        }
        this.type = type;
        this.sn = info["sn"]
    };
    ns.Class(Content, Dictionary, null);
    Content.prototype.getGroup = function() {
        return this.getValue("group")
    };
    Content.prototype.setGroup = function(identifier) {
        this.setValue("group", identifier)
    };
    var content_classes = {};
    Content.register = function(type, clazz) {
        var value;
        if (type instanceof ContentType) {
            value = type.valueOf()
        } else {
            value = type
        }
        content_classes[value] = clazz
    };
    Content.getInstance = function(content) {
        if (!content) {
            return null
        } else {
            if (content instanceof Content) {
                return content
            }
        }
        var type = content["type"];
        if (type instanceof ContentType) {
            type = type.valueOf()
        }
        var clazz = content_classes[type];
        if (typeof clazz === "function") {
            return Content.createInstance(clazz, content)
        }
        return new Content(content)
    };
    Content.createInstance = function(clazz, map) {
        if (typeof clazz.getInstance === "function") {
            return clazz.getInstance(map)
        } else {
            return new clazz(map)
        }
    };
    ns.Content = Content;
    ns.register("Content")
}(DaoKeDao);
! function(ns) {
    var Dictionary = ns.type.Dictionary;
    var ContentType = ns.protocol.ContentType;
    var Envelope = function(env) {
        Dictionary.call(this, env);
        this.sender = env["sender"];
        this.receiver = env["receiver"];
        this.time = env["time"]
    };
    ns.Class(Envelope, Dictionary, null);
    Envelope.prototype.getTime = function() {
        var time = this.time;
        if (time) {
            return new Date(time * 1000)
        } else {
            return null
        }
    };
    Envelope.newEnvelope = function(sender, receiver, time) {
        var env = {
            "sender": sender,
            "receiver": receiver
        };
        if (!time) {
            time = new Date();
            env["time"] = Math.ceil(time.getTime() / 1000)
        } else {
            if (time instanceof Date) {
                env["time"] = Math.ceil(time.getTime() / 1000)
            } else {
                env["time"] = time
            }
        }
        return new Envelope(env)
    };
    Envelope.getInstance = function(env) {
        if (!env) {
            return null
        } else {
            if (env instanceof Envelope) {
                return env
            }
        }
        return new Envelope(env)
    };
    Envelope.prototype.getGroup = function() {
        return this.getValue("group")
    };
    Envelope.prototype.setGroup = function(identifier) {
        this.setValue("group", identifier)
    };
    Envelope.prototype.getType = function() {
        var type = this.getValue("type");
        if (type instanceof ContentType) {
            return type.valueOf()
        } else {
            return type
        }
    };
    Envelope.prototype.setType = function(type) {
        if (type instanceof ContentType) {
            this.setValue("type", type.valueOf())
        } else {
            this.setValue("type", type)
        }
    };
    ns.Envelope = Envelope;
    ns.register("Envelope")
}(DaoKeDao);
! function(ns) {
    var MessageDelegate = function() {};
    ns.Interface(MessageDelegate, null);
    var InstantMessageDelegate = function() {};
    ns.Interface(InstantMessageDelegate, [MessageDelegate]);
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
    var SecureMessageDelegate = function() {};
    ns.Interface(SecureMessageDelegate, [MessageDelegate]);
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
    var ReliableMessageDelegate = function() {};
    ns.Interface(ReliableMessageDelegate, [SecureMessageDelegate]);
    ReliableMessageDelegate.prototype.decodeSignature = function(signature, rMsg) {
        console.assert(false, "implement me!");
        return null
    };
    ReliableMessageDelegate.prototype.verifyDataSignature = function(data, signature, sender, rMsg) {
        console.assert(false, "implement me!");
        return false
    };
    ns.InstantMessageDelegate = InstantMessageDelegate;
    ns.SecureMessageDelegate = SecureMessageDelegate;
    ns.ReliableMessageDelegate = ReliableMessageDelegate;
    ns.register("InstantMessageDelegate");
    ns.register("SecureMessageDelegate");
    ns.register("ReliableMessageDelegate")
}(DaoKeDao);
! function(ns) {
    var Dictionary = ns.type.Dictionary;
    var Envelope = ns.Envelope;
    var Message = function(msg) {
        Dictionary.call(this, msg);
        this.envelope = Envelope.getInstance(msg);
        this.delegate = null
    };
    ns.Class(Message, Dictionary, null);
    Message.getInstance = function(msg) {
        if (!msg) {
            return null
        }
        if (msg.hasOwnProperty("content")) {
            return ns.InstantMessage.getInstance(msg)
        }
        if (msg.hasOwnProperty("signature")) {
            return ns.ReliableMessage.getInstance(msg)
        }
        if (msg.hasOwnProperty("data")) {
            return ns.SecureMessage.getInstance(msg)
        }
        if (msg instanceof Message) {
            return msg
        }
        return new Message(msg)
    };
    ns.Message = Message;
    ns.register("Message")
}(DaoKeDao);
! function(ns) {
    var Envelope = ns.Envelope;
    var Content = ns.Content;
    var Message = ns.Message;
    var InstantMessage = function(msg) {
        Message.call(this, msg);
        this.content = Content.getInstance(msg["content"])
    };
    ns.Class(InstantMessage, Message, null);
    InstantMessage.newMessage = function(content, heads) {
        var msg;
        var count = arguments.length;
        if (count === 2) {
            var env = Envelope.getInstance(heads);
            msg = env.getMap(true)
        } else {
            if (count === 3 || count === 4) {
                var sender = arguments[1];
                var receiver = arguments[2];
                var time = (count === 4) ? arguments[3] : 0;
                msg = {
                    "sender": sender,
                    "receiver": receiver,
                    "time": time
                }
            } else {
                throw Error("instant message arguments error: " + arguments)
            }
        }
        msg["content"] = content;
        return new InstantMessage(msg)
    };
    InstantMessage.getInstance = function(msg) {
        if (!msg) {
            return null
        }
        if (msg instanceof InstantMessage) {
            return msg
        }
        return new InstantMessage(msg)
    };
    InstantMessage.prototype.encrypt = function(password, members) {
        if (members && members.length > 0) {
            return encrypt_group_message.call(this, password, members)
        } else {
            return encrypt_message.call(this, password)
        }
    };
    var encrypt_message = function(password) {
        var msg = prepare_data.call(this, password);
        var key = this.delegate.serializeKey(password, this);
        if (!key) {
            return new ns.SecureMessage(msg)
        }
        var receiver = this.envelope.receiver;
        var data = this.delegate.encryptKey(key, receiver, this);
        if (!data) {
            return null
        }
        msg["key"] = this.delegate.encodeKey(data, this);
        return new ns.SecureMessage(msg)
    };
    var encrypt_group_message = function(password, members) {
        var msg = prepare_data.call(this, password);
        var key = this.delegate.serializeKey(password, this);
        if (!key) {
            return new ns.SecureMessage(msg)
        }
        var keys = {};
        var count = 0;
        var member;
        var data;
        for (var i = 0; i < members.length; ++i) {
            member = members[i];
            data = this.delegate.encryptKey(key, member, this);
            if (!data) {
                continue
            }
            keys[member] = this.delegate.encodeKey(data, this);
            ++count
        }
        if (count > 0) {
            msg["keys"] = keys
        }
        return new ns.SecureMessage(msg)
    };
    var prepare_data = function(password) {
        var data = this.delegate.serializeContent(this.content, password, this);
        data = this.delegate.encryptContent(data, password, this);
        var base64 = this.delegate.encodeData(data, this);
        var msg = this.getMap(true);
        delete msg["content"];
        msg["data"] = base64;
        return msg
    };
    ns.InstantMessage = InstantMessage;
    ns.register("InstantMessage")
}(DaoKeDao);
! function(ns) {
    var Message = ns.Message;
    var SecureMessage = function(msg) {
        Message.call(this, msg)
    };
    ns.Class(SecureMessage, Message, null);
    SecureMessage.prototype.getData = function() {
        var base64 = this.getValue("data");
        return this.delegate.decodeData(base64, this)
    };
    SecureMessage.prototype.getKey = function() {
        var base64 = this.getValue("key");
        if (!base64) {
            var keys = this.getKeys();
            if (keys) {
                base64 = keys[this.envelope.receiver]
            }
        }
        if (base64) {
            return this.delegate.decodeKey(base64, this)
        } else {
            return null
        }
    };
    SecureMessage.prototype.getKeys = function() {
        return this.getValue("keys")
    };
    SecureMessage.getInstance = function(msg) {
        if (!msg) {
            return null
        }
        if (msg.hasOwnProperty("signature")) {
            return ns.ReliableMessage.getInstance(msg)
        }
        if (msg instanceof SecureMessage) {
            return msg
        }
        return new SecureMessage(msg)
    };
    SecureMessage.prototype.decrypt = function() {
        var sender = this.envelope.sender;
        var receiver;
        var group = this.envelope.getGroup();
        if (group) {
            receiver = group
        } else {
            receiver = this.envelope.receiver
        }
        var key = this.getKey();
        if (key) {
            key = this.delegate.decryptKey(key, sender, receiver, this);
            if (!key) {
                throw Error("failed to decrypt key in msg: " + this)
            }
        }
        var password = this.delegate.deserializeKey(key, sender, receiver, this);
        if (!password) {
            throw Error("failed to get msg key: " + sender + " -> " + receiver + ", " + key)
        }
        var data = this.getData();
        if (!data) {
            throw Error("failed to decode content data: " + this)
        }
        data = this.delegate.decryptContent(data, password, this);
        if (!data) {
            throw Error("failed to decrypt data with key: " + password)
        }
        var content = this.delegate.deserializeContent(data, password, this);
        if (!content) {
            throw Error("failed to deserialize content: " + data)
        }
        var msg = this.getMap(true);
        delete msg["key"];
        delete msg["keys"];
        delete msg["data"];
        msg["content"] = content;
        return new ns.InstantMessage(msg)
    };
    SecureMessage.prototype.sign = function() {
        var sender = this.envelope.sender;
        var signature = this.delegate.signData(this.getData(), sender, this);
        var base64 = this.delegate.encodeSignature(signature, this);
        var msg = this.getMap(true);
        msg["signature"] = base64;
        return new ns.ReliableMessage(msg)
    };
    SecureMessage.prototype.split = function(members) {
        var reliable = this instanceof ns.ReliableMessage;
        var keys = this.getKeys();
        var group = this.envelope.receiver;
        var messages = [];
        var msg;
        var receiver;
        for (var i = 0; i < members.length; ++i) {
            receiver = members[i];
            msg = this.getMap(true);
            msg["receiver"] = receiver;
            msg["group"] = group;
            if (keys) {
                delete msg["keys"];
                msg["key"] = keys[receiver]
            }
            if (reliable) {
                messages.push(new ns.ReliableMessage(msg))
            } else {
                messages.push(new SecureMessage(msg))
            }
        }
        return messages
    };
    SecureMessage.prototype.trim = function(member) {
        var msg = this.getMap(true);
        msg["receiver"] = member;
        var keys = this.getKeys();
        if (keys) {
            var base64 = keys[member];
            if (base64) {
                msg["key"] = base64
            }
            delete msg["keys"]
        }
        var group = this.envelope.getGroup();
        if (!group) {
            msg["group"] = this.envelope.receiver
        }
        var reliable = this instanceof ns.ReliableMessage;
        if (reliable) {
            return new ns.ReliableMessage(msg)
        } else {
            return new SecureMessage(msg)
        }
    };
    ns.SecureMessage = SecureMessage;
    ns.register("SecureMessage")
}(DaoKeDao);
! function(ns) {
    var SecureMessage = ns.SecureMessage;
    var ReliableMessage = function(msg) {
        SecureMessage.call(this, msg)
    };
    ns.Class(ReliableMessage, SecureMessage, null);
    ReliableMessage.prototype.getSignature = function() {
        var base64 = this.getValue("signature");
        return this.delegate.decodeSignature(base64, this)
    };
    ReliableMessage.prototype.setMeta = function(meta) {
        this.setValue("meta", meta)
    };
    ReliableMessage.prototype.getMeta = function() {
        return this.getValue("meta")
    };
    ReliableMessage.getInstance = function(msg) {
        if (!msg) {
            return null
        }
        if (msg instanceof ReliableMessage) {
            return msg
        }
        return new ReliableMessage(msg)
    };
    ReliableMessage.prototype.verify = function() {
        var sender = this.envelope.sender;
        var data = this.getData();
        if (!data) {
            throw Error("failed to decode content data: " + this)
        }
        var signature = this.getSignature();
        if (!signature) {
            throw Error("failed to decode message signature: " + this)
        }
        if (this.delegate.verifyDataSignature(data, signature, sender, this)) {
            var msg = this.getMap(true);
            delete msg["signature"];
            return new SecureMessage(msg)
        } else {
            return null
        }
    };
    ns.ReliableMessage = ReliableMessage;
    ns.register("ReliableMessage")
}(DaoKeDao);
! function(ns) {
    var ContentType = ns.protocol.ContentType;
    var Content = ns.Content;
    var Message = ns.Message;
    var ForwardContent = function(info) {
        var secret = null;
        if (!info) {
            info = ContentType.FORWARD
        } else {
            if (info instanceof Message) {
                secret = info;
                info = ContentType.FORWARD
            }
        }
        Content.call(this, info);
        if (secret) {
            this.setMessage(secret)
        } else {
            if (info.hasOwnProperty("forward")) {
                this.getMessage()
            } else {
                this.forward = null
            }
        }
    };
    ns.Class(ForwardContent, Content, null);
    ForwardContent.prototype.getMessage = function() {
        if (!this.forward) {
            var forward = this.getValue("forward");
            this.forward = Message.getInstance(forward)
        }
        return this.forward
    };
    ForwardContent.prototype.setMessage = function(secret) {
        this.setValue("forward", secret);
        this.forward = secret
    };
    Content.register(ContentType.FORWARD, ForwardContent);
    ns.protocol.ForwardContent = ForwardContent;
    ns.protocol.register("ForwardContent")
}(DaoKeDao);
! function(ns) {
    DaoKeDao.exports(ns);
    MingKeMing.exports(ns);
    if (typeof ns.protocol !== "object") {
        ns.protocol = {}
    }
    if (typeof ns.plugins !== "object") {
        ns.plugins = {}
    }
    if (typeof ns.core !== "object") {
        ns.core = {}
    }
    ns.Namespace(ns.protocol);
    ns.Namespace(ns.plugins);
    ns.Namespace(ns.core);
    ns.register("protocol");
    ns.register("plugins");
    ns.register("core")
}(DIMP);
! function(ns) {
    var Content = ns.Content;
    var ContentType = ns.protocol.ContentType;
    var TextContent = function(content) {
        var text = null;
        if (!content) {
            content = ContentType.TEXT
        } else {
            if (typeof content === "string") {
                text = content;
                content = ContentType.TEXT
            }
        }
        Content.call(this, content);
        if (text) {
            this.setText(text)
        }
    };
    ns.Class(TextContent, Content, null);
    TextContent.prototype.getText = function() {
        return this.getValue("text")
    };
    TextContent.prototype.setText = function(text) {
        this.setValue("text", text)
    };
    Content.register(ContentType.TEXT, TextContent);
    ns.protocol.TextContent = TextContent;
    ns.protocol.register("TextContent")
}(DIMP);
! function(ns) {
    var Content = ns.Content;
    var ContentType = ns.protocol.ContentType;
    var PageContent = function(content) {
        var url = null;
        if (!content) {
            content = ContentType.PAGE
        } else {
            if (typeof content === "string") {
                url = content;
                content = ContentType.PAGE
            }
        }
        Content.call(this, content);
        if (url) {
            this.setURL(url)
        }
        this.icon = null
    };
    ns.Class(PageContent, Content, null);
    PageContent.prototype.getURL = function() {
        return this.getValue("URL")
    };
    PageContent.prototype.setURL = function(url) {
        this.setValue("URL", url)
    };
    PageContent.prototype.getTitle = function() {
        return this.getValue("title")
    };
    PageContent.prototype.setTitle = function(text) {
        this.setValue("title", text)
    };
    PageContent.prototype.getDesc = function() {
        return this.getValue("desc")
    };
    PageContent.prototype.setDesc = function(text) {
        this.setValue("desc", text)
    };
    PageContent.prototype.getIcon = function() {
        if (!this.icon) {
            var base64 = this.getValue("icon");
            if (base64) {
                this.icon = ns.format.Base64.decode(base64)
            }
        }
        return this.icon
    };
    PageContent.prototype.setIcon = function(data) {
        var base64 = null;
        if (data) {
            base64 = ns.format.Base64.encode(data)
        }
        this.setValue("icon", base64);
        this.icon = data
    };
    Content.register(ContentType.PAGE, PageContent);
    ns.protocol.PageContent = PageContent;
    ns.protocol.register("PageContent")
}(DIMP);
! function(ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Content = ns.Content;
    var ContentType = ns.protocol.ContentType;
    var FileContent = function(content) {
        if (!content) {
            content = ContentType.FILE
        }
        Content.call(this, content);
        this.attachment = null;
        this.password = null
    };
    ns.Class(FileContent, Content, null);
    FileContent.prototype.getURL = function() {
        return this.getValue("URL")
    };
    FileContent.prototype.setURL = function(url) {
        this.setValue("URL", url)
    };
    FileContent.prototype.getFilename = function() {
        return this.getValue("filename")
    };
    FileContent.prototype.setFilename = function(filename) {
        this.setValue("filename", filename)
    };
    var file_ext = function() {
        var filename = this.getFilename();
        if (!filename) {
            return null
        }
        var pos = filename.lastIndexOf(".");
        if (pos < 0) {
            return null
        }
        return filename.substring(pos + 1)
    };
    var md5 = function(data) {
        var hash = ns.digest.MD5.digest(data);
        return ns.format.Hex.encode(hash)
    };
    FileContent.prototype.getData = function() {
        return this.attachment
    };
    FileContent.prototype.setData = function(data) {
        if (data && data.length > 0) {
            var filename = md5(data);
            var ext = file_ext.call(this);
            if (ext) {
                filename = filename + "." + ext
            }
            this.setValue("filename", filename)
        }
        this.attachment = data
    };
    FileContent.prototype.getPassword = function() {
        if (!this.password) {
            var key = this.getValue("password");
            if (key) {
                this.password = SymmetricKey.getInstance(key)
            }
        }
        return this.password
    };
    FileContent.prototype.setPassword = function(key) {
        this.setValue("password", key);
        this.password = key
    };
    Content.register(ContentType.FILE, FileContent);
    ns.protocol.FileContent = FileContent;
    ns.protocol.register("FileContent")
}(DIMP);
! function(ns) {
    var Base64 = ns.format.Base64;
    var Content = ns.Content;
    var ContentType = ns.protocol.ContentType;
    var FileContent = ns.protocol.FileContent;
    var ImageContent = function(content) {
        if (!content) {
            content = ContentType.IMAGE
        }
        FileContent.call(this, content);
        this.thumbnail = null
    };
    ns.Class(ImageContent, FileContent, null);
    ImageContent.prototype.getThumbnail = function() {
        if (!this.thumbnail) {
            var base64 = this.getValue("thumbnail");
            if (base64) {
                this.thumbnail = Base64.decode(base64)
            }
        }
        return this.thumbnail
    };
    ImageContent.prototype.setThumbnail = function(image) {
        if (image) {
            var base64 = Base64.encode(image);
            this.setValue("thumbnail", base64)
        } else {
            this.setValue("thumbnail", null)
        }
        this.thumbnail = image
    };
    Content.register(ContentType.IMAGE, ImageContent);
    ns.protocol.ImageContent = ImageContent;
    ns.protocol.register("ImageContent")
}(DIMP);
! function(ns) {
    var Content = ns.Content;
    var ContentType = ns.protocol.ContentType;
    var FileContent = ns.protocol.FileContent;
    var AudioContent = function(content) {
        if (!content) {
            content = ContentType.AUDIO
        }
        FileContent.call(this, content)
    };
    ns.Class(AudioContent, FileContent, null);
    AudioContent.prototype.getText = function() {
        return this.getValue("text")
    };
    AudioContent.prototype.setText = function(asr) {
        this.setValue("text", asr)
    };
    Content.register(ContentType.AUDIO, AudioContent);
    ns.protocol.AudioContent = AudioContent;
    ns.protocol.register("AudioContent")
}(DIMP);
! function(ns) {
    var Base64 = ns.format.Base64;
    var Content = ns.Content;
    var ContentType = ns.protocol.ContentType;
    var FileContent = ns.protocol.FileContent;
    var VideoContent = function(content) {
        if (!content) {
            content = ContentType.VIDEO
        }
        FileContent.call(this, content);
        this.snapshot = null
    };
    ns.Class(VideoContent, FileContent, null);
    VideoContent.prototype.getSnapshot = function() {
        if (!this.snapshot) {
            var base64 = this.getValue("snapshot");
            if (base64) {
                this.snapshot = Base64.decode(base64)
            }
        }
        return this.snapshot
    };
    VideoContent.prototype.setSnapshot = function(image) {
        if (image) {
            var base64 = Base64.encode(image);
            this.setValue("snapshot", base64)
        } else {
            this.setValue("snapshot", null)
        }
        this.snapshot = image
    };
    Content.register(ContentType.VIDEO, VideoContent);
    ns.protocol.VideoContent = VideoContent;
    ns.protocol.register("VideoContent")
}(DIMP);
! function(ns) {
    var Content = ns.Content;
    var ContentType = ns.protocol.ContentType;
    var Command = function(info) {
        var name = null;
        if (!info) {
            info = ContentType.COMMAND
        } else {
            if (typeof info === "string") {
                name = info;
                info = ContentType.COMMAND
            }
        }
        Content.call(this, info);
        if (name) {
            this.setCommand(name)
        }
    };
    ns.Class(Command, Content, null);
    Command.prototype.getCommand = function() {
        return this.getValue("command")
    };
    Command.prototype.setCommand = function(name) {
        this.setValue("command", name)
    };
    Command.META = "meta";
    Command.PROFILE = "profile";
    Command.RECEIPT = "receipt";
    Command.HANDSHAKE = "handshake";
    Command.LOGIN = "login";
    var command_classes = {};
    Command.register = function(name, clazz) {
        command_classes[name] = clazz
    };
    Command.getClass = function(cmd) {
        if (typeof cmd === "string") {
            return command_classes[cmd]
        }
        var command = cmd["command"];
        if (!command) {
            return null
        }
        return command_classes[command]
    };
    Command.getInstance = function(cmd) {
        if (!cmd) {
            return null
        } else {
            if (cmd instanceof Command) {
                return cmd
            }
        }
        var clazz = Command.getClass(cmd);
        if (typeof clazz === "function") {
            return Content.createInstance(clazz, cmd)
        }
        return new Command(cmd)
    };
    Content.register(ContentType.COMMAND, Command);
    ns.protocol.Command = Command;
    ns.protocol.register("Command")
}(DIMP);
! function(ns) {
    var ID = ns.ID;
    var Meta = ns.Meta;
    var Command = ns.protocol.Command;
    var MetaCommand = function(info) {
        var identifier = null;
        if (!info) {
            info = Command.META
        } else {
            if (info instanceof ID) {
                identifier = info;
                info = Command.META
            }
        }
        Command.call(this, info);
        if (identifier) {
            this.setIdentifier(identifier)
        }
        this.meta = null
    };
    ns.Class(MetaCommand, Command, null);
    MetaCommand.prototype.getIdentifier = function() {
        return this.getValue("ID")
    };
    MetaCommand.prototype.setIdentifier = function(identifier) {
        this.setValue("ID", identifier)
    };
    MetaCommand.prototype.getMeta = function() {
        if (!this.meta) {
            var dict = this.getValue("meta");
            this.meta = Meta.getInstance(dict)
        }
        return this.meta
    };
    MetaCommand.prototype.setMeta = function(meta) {
        this.setValue("meta", meta);
        this.meta = meta
    };
    MetaCommand.query = function(identifier) {
        return new MetaCommand(identifier)
    };
    MetaCommand.response = function(identifier, meta) {
        var cmd = new MetaCommand(identifier);
        cmd.setMeta(meta);
        return cmd
    };
    Command.register(Command.META, MetaCommand);
    ns.protocol.MetaCommand = MetaCommand;
    ns.protocol.register("MetaCommand")
}(DIMP);
! function(ns) {
    var ID = ns.ID;
    var Profile = ns.Profile;
    var Command = ns.protocol.Command;
    var MetaCommand = ns.protocol.MetaCommand;
    var ProfileCommand = function(info) {
        var identifier = null;
        if (!info) {
            info = Command.PROFILE
        } else {
            if (info instanceof ID) {
                identifier = info;
                info = Command.PROFILE
            }
        }
        MetaCommand.call(this, info);
        if (identifier) {
            this.setIdentifier(identifier)
        }
        this.profile = null
    };
    ns.Class(ProfileCommand, MetaCommand, null);
    ProfileCommand.prototype.getProfile = function() {
        if (!this.profile) {
            var info = this.getValue("profile");
            if (typeof info === "string") {
                info = {
                    "ID": this.getIdentifier(),
                    "data": info,
                    "signature": this.getValue("signature")
                }
            } else {}
            this.profile = Profile.getInstance(info)
        }
        return this.profile
    };
    ProfileCommand.prototype.setProfile = function(profile) {
        this.setValue("profile", profile);
        this.profile = profile
    };
    ProfileCommand.prototype.getSignature = function() {
        return this.getValue("signature")
    };
    ProfileCommand.prototype.setSignature = function(base64) {
        this.setValue("signature", base64)
    };
    ProfileCommand.query = function(identifier, signature) {
        var cmd = new ProfileCommand(identifier);
        if (signature) {
            cmd.setSignature(signature)
        }
        return cmd
    };
    ProfileCommand.response = function(identifier, profile, meta) {
        var cmd = new ProfileCommand(identifier);
        cmd.setProfile(profile);
        if (meta) {
            cmd.setMeta(meta)
        }
        return cmd
    };
    Command.register(Command.PROFILE, ProfileCommand);
    ns.protocol.ProfileCommand = ProfileCommand;
    ns.protocol.register("ProfileCommand")
}(DIMP);
! function(ns) {
    var Content = ns.Content;
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var HistoryCommand = function(info) {
        var name = null;
        var time = null;
        if (!info) {
            time = new Date();
            info = ContentType.HISTORY
        } else {
            if (typeof info === "string") {
                name = info;
                time = new Date();
                info = ContentType.HISTORY
            }
        }
        Command.call(this, info);
        if (name) {
            this.setCommand(name)
        }
        if (time) {
            this.setTime(time)
        }
    };
    ns.Class(HistoryCommand, Command, null);
    HistoryCommand.prototype.getTime = function() {
        var time = this.getValue("time");
        if (time) {
            return new Date(time * 1000)
        } else {
            return null
        }
    };
    HistoryCommand.prototype.setTime = function(time) {
        if (!time) {
            time = new Date()
        }
        if (time instanceof Date) {
            this.setValue("time", time.getTime() / 1000)
        } else {
            if (typeof time === "number") {
                this.setValue("time", time)
            } else {
                throw TypeError("time error: " + time)
            }
        }
    };
    HistoryCommand.REGISTER = "register";
    HistoryCommand.SUICIDE = "suicide";
    HistoryCommand.getInstance = function(cmd) {
        if (!cmd) {
            return null
        } else {
            if (cmd instanceof HistoryCommand) {
                return cmd
            }
        }
        if (cmd.hasOwnProperty("group")) {
            return ns.protocol.GroupCommand.getInstance(cmd)
        }
        return new HistoryCommand(cmd)
    };
    Content.register(ContentType.HISTORY, HistoryCommand);
    ns.protocol.HistoryCommand = HistoryCommand;
    ns.protocol.register("HistoryCommand")
}(DIMP);
! function(ns) {
    var ID = ns.ID;
    var Content = ns.Content;
    var Command = ns.protocol.Command;
    var HistoryCommand = ns.protocol.HistoryCommand;
    var GroupCommand = function(info) {
        var group = null;
        if (info instanceof ID) {
            group = info;
            info = null
        }
        HistoryCommand.call(this, info);
        if (group) {
            this.setGroup(group)
        }
    };
    ns.Class(GroupCommand, HistoryCommand, null);
    GroupCommand.prototype.getGroup = function() {
        return Content.prototype.getGroup.call(this)
    };
    GroupCommand.prototype.setGroup = function(identifier) {
        Content.prototype.setGroup.call(this, identifier)
    };
    GroupCommand.prototype.getMember = function() {
        return this.getValue("member")
    };
    GroupCommand.prototype.setMember = function(identifier) {
        this.setValue("member", identifier)
    };
    GroupCommand.prototype.getMembers = function() {
        var members = this.getValue("members");
        if (!members) {
            var member = this.getValue("member");
            if (member) {
                members = [member]
            }
        }
        return members
    };
    GroupCommand.prototype.setMembers = function(members) {
        this.setValue("members", members);
        this.setValue("member", null)
    };
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
    GroupCommand.register = function(name, clazz) {
        Command.register(name, clazz)
    };
    GroupCommand.getClass = function(cmd) {
        return Command.getClass(cmd)
    };
    GroupCommand.getInstance = function(cmd) {
        if (!cmd) {
            return null
        } else {
            if (cmd instanceof GroupCommand) {
                return cmd
            }
        }
        var clazz = GroupCommand.getClass(cmd);
        if (typeof clazz === "function") {
            return Content.createInstance(clazz, cmd)
        }
        return new GroupCommand(cmd)
    };
    ns.protocol.GroupCommand = GroupCommand;
    ns.protocol.register("GroupCommand")
}(DIMP);
! function(ns) {
    var ID = ns.ID;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var InviteCommand = function(info) {
        var group = null;
        if (!info) {
            info = GroupCommand.INVITE
        } else {
            if (typeof info === "string" || info instanceof ID) {
                group = info;
                info = GroupCommand.INVITE
            }
        }
        GroupCommand.call(this, info);
        if (group) {
            this.setGroup(group)
        }
    };
    ns.Class(InviteCommand, GroupCommand, null);
    var ExpelCommand = function(info) {
        var group = null;
        if (!info) {
            info = GroupCommand.EXPEL
        } else {
            if (typeof info === "string" || info instanceof ID) {
                group = info;
                info = GroupCommand.EXPEL
            }
        }
        GroupCommand.call(this, info);
        if (group) {
            this.setGroup(group)
        }
    };
    ns.Class(ExpelCommand, GroupCommand, null);
    var JoinCommand = function(info) {
        var group = null;
        if (!info) {
            info = GroupCommand.JOIN
        } else {
            if (typeof info === "string" || info instanceof ID) {
                group = info;
                info = GroupCommand.JOIN
            }
        }
        GroupCommand.call(this, info);
        if (group) {
            this.setGroup(group)
        }
    };
    ns.Class(JoinCommand, GroupCommand, null);
    var QuitCommand = function(info) {
        var group = null;
        if (!info) {
            info = GroupCommand.QUIT
        } else {
            if (typeof info === "string" || info instanceof ID) {
                group = info;
                info = GroupCommand.QUIT
            }
        }
        GroupCommand.call(this, info);
        if (group) {
            this.setGroup(group)
        }
    };
    ns.Class(QuitCommand, GroupCommand, null);
    var ResetCommand = function(info) {
        var group = null;
        if (!info) {
            info = GroupCommand.RESET
        } else {
            if (typeof info === "string" || info instanceof ID) {
                group = info;
                info = GroupCommand.RESET
            }
        }
        GroupCommand.call(this, info);
        if (group) {
            this.setGroup(group)
        }
    };
    ns.Class(ResetCommand, GroupCommand, null);
    var QueryCommand = function(info) {
        var group = null;
        if (!info) {
            info = GroupCommand.QUERY
        } else {
            if (typeof info === "string" || info instanceof ID) {
                group = info;
                info = GroupCommand.QUERY
            }
        }
        Command.call(this, info);
        if (group) {
            this.setGroup(group)
        }
    };
    ns.Class(QueryCommand, Command, null);
    var create = function(clazz, group, member) {
        var cmd = new clazz(group);
        if (typeof member === "string" || member instanceof ID) {
            cmd.setMember(member)
        } else {
            if (member instanceof Array) {
                cmd.setMembers(member)
            }
        }
        return cmd
    };
    GroupCommand.invite = function(group, member) {
        return create(InviteCommand, group, member)
    };
    GroupCommand.expel = function(group, member) {
        return create(ExpelCommand, group, member)
    };
    GroupCommand.join = function(group) {
        return create(JoinCommand, group)
    };
    GroupCommand.quit = function(group) {
        return create(QuitCommand, group)
    };
    GroupCommand.reset = function(group, member) {
        return create(ResetCommand, group, member)
    };
    GroupCommand.query = function(group) {
        return create(QueryCommand, group)
    };
    GroupCommand.register(GroupCommand.INVITE, InviteCommand);
    GroupCommand.register(GroupCommand.EXPEL, ExpelCommand);
    GroupCommand.register(GroupCommand.JOIN, JoinCommand);
    GroupCommand.register(GroupCommand.QUIT, QuitCommand);
    GroupCommand.register(GroupCommand.RESET, ResetCommand);
    GroupCommand.register(GroupCommand.QUERY, QueryCommand);
    if (typeof ns.protocol.group !== "object") {
        ns.protocol.group = {}
    }
    ns.Namespace(ns.protocol.group);
    ns.protocol.register("group");
    ns.protocol.group.InviteCommand = InviteCommand;
    ns.protocol.group.ExpelCommand = ExpelCommand;
    ns.protocol.group.JoinCommand = JoinCommand;
    ns.protocol.group.QuitCommand = QuitCommand;
    ns.protocol.group.ResetCommand = ResetCommand;
    ns.protocol.group.QueryCommand = QueryCommand;
    ns.protocol.group.register("InviteCommand");
    ns.protocol.group.register("ExpelCommand");
    ns.protocol.group.register("JoinCommand");
    ns.protocol.group.register("QuitCommand");
    ns.protocol.group.register("ResetCommand");
    ns.protocol.group.register("QueryCommand")
}(DIMP);
! function(ns) {
    var EntityDelegate = function() {};
    ns.Interface(EntityDelegate, null);
    EntityDelegate.prototype.getIdentifier = function(string) {
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
    ns.EntityDelegate = EntityDelegate;
    ns.register("EntityDelegate")
}(DIMP);
! function(ns) {
    var CipherKeyDelegate = function() {};
    ns.Interface(CipherKeyDelegate, null);
    CipherKeyDelegate.prototype.getCipherKey = function(sender, receiver) {
        console.assert(false, "implement me!");
        return null
    };
    CipherKeyDelegate.prototype.cacheCipherKey = function(sender, receiver, key) {
        console.assert(false, "implement me!")
    };
    ns.CipherKeyDelegate = CipherKeyDelegate;
    ns.register("CipherKeyDelegate")
}(DIMP);
! function(ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = function(key) {
        SymmetricKey.call(this, key)
    };
    ns.Class(PlainKey, SymmetricKey, null);
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
    SymmetricKey.register(PlainKey.PLAIN, PlainKey);
    ns.plugins.PlainKey = PlainKey
}(DIMP);
! function(ns) {
    var CipherKeyDelegate = ns.CipherKeyDelegate;
    var KeyCache = function() {
        this.keyMap = {};
        this.isDirty = false
    };
    ns.Class(KeyCache, ns.type.Object, [CipherKeyDelegate]);
    KeyCache.prototype.reload = function() {
        var map = this.loadKeys();
        if (!map) {
            return false
        }
        return this.updateKeys(map)
    };
    KeyCache.prototype.flush = function() {
        if (this.isDirty) {
            if (this.saveKeys(this.keyMap)) {
                this.isDirty = false
            }
        }
    };
    KeyCache.prototype.saveKeys = function(map) {
        console.assert(false, "implement me!");
        return false
    };
    KeyCache.prototype.loadKeys = function() {
        console.assert(false, "implement me!");
        return null
    };
    KeyCache.prototype.updateKeys = function(map) {
        if (!map) {
            return false
        }
        var changed = false;
        var sender, receiver;
        var oldKey, newKey;
        var table;
        for (sender in map) {
            if (!map.hasOwnProperty(sender)) {
                continue
            }
            table = map[sender];
            for (receiver in table) {
                if (!table.hasOwnProperty(receiver)) {
                    continue
                }
                newKey = table[receiver];
                oldKey = get_key.call(this, sender, receiver);
                if (oldKey !== newKey) {
                    changed = true
                }
                set_key.call(this, sender, receiver, newKey)
            }
        }
        return changed
    };
    var get_key = function(sender, receiver) {
        var table = this.keyMap[sender];
        if (table) {
            return table[receiver]
        } else {
            return null
        }
    };
    var set_key = function(sender, receiver, key) {
        var table = this.keyMap[sender];
        if (table) {
            var old = table[receiver];
            if (old && old.equals(key)) {
                return
            }
        } else {
            table = {};
            this.keyMap[sender] = table
        }
        table[receiver] = key
    };
    KeyCache.prototype.getCipherKey = function(sender, receiver) {
        if (receiver.isBroadcast()) {
            return ns.plugins.PlainKey.getInstance()
        }
        return get_key.call(this, sender, receiver)
    };
    KeyCache.prototype.cacheCipherKey = function(sender, receiver, key) {
        if (receiver.isBroadcast()) {} else {
            set_key.call(this, sender, receiver, key);
            this.isDirty = true
        }
    };
    ns.core.KeyCache = KeyCache;
    ns.core.register("KeyCache")
}(DIMP);
! function(ns) {
    var ID = ns.ID;
    var EncryptKey = ns.crypto.EncryptKey;
    var VerifyKey = ns.crypto.VerifyKey;
    var EntityDelegate = ns.EntityDelegate;
    var UserDataSource = ns.UserDataSource;
    var GroupDataSource = ns.GroupDataSource;
    var Barrack = function() {
        this.idMap = {};
        this.userMap = {};
        this.groupMap = {}
    };
    ns.Class(Barrack, ns.type.Object, [EntityDelegate, UserDataSource, GroupDataSource]);
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
        finger = thanos(this.idMap, finger);
        finger = thanos(this.userMap, finger);
        finger = thanos(this.groupMap, finger);
        return finger >> 1
    };
    Barrack.prototype.cacheIdentifier = function(identifier) {
        this.idMap[identifier.toString()] = identifier;
        return true
    };
    Barrack.prototype.cacheUser = function(user) {
        if (!user.delegate) {
            user.delegate = this
        }
        this.userMap[user.identifier] = user;
        return true
    };
    Barrack.prototype.cacheGroup = function(group) {
        if (!group.delegate) {
            group.delegate = this
        }
        this.groupMap[group.identifier] = group;
        return true
    };
    Barrack.prototype.createIdentifier = function(string) {
        console.assert(false, "implement me!");
        return null
    };
    Barrack.prototype.createUser = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    Barrack.prototype.createGroup = function(identifier) {
        console.assert(false, "implement me!");
        return null
    };
    Barrack.prototype.getIdentifier = function(string) {
        if (!string || string instanceof ID) {
            return string
        }
        var identifier = this.idMap[string];
        if (identifier) {
            return identifier
        }
        identifier = this.createIdentifier(string);
        if (identifier && this.cacheIdentifier(identifier)) {
            return identifier
        }
        return null
    };
    Barrack.prototype.getUser = function(identifier) {
        var user = this.userMap[identifier];
        if (user) {
            return user
        }
        user = this.createUser(identifier);
        if (user && this.cacheUser(user)) {
            return user
        }
        return null
    };
    Barrack.prototype.getGroup = function(identifier) {
        var group = this.groupMap[identifier];
        if (group) {
            return group
        }
        group = this.createGroup(identifier);
        if (group && this.cacheGroup(group)) {
            return group
        }
        return null
    };
    Barrack.prototype.getPublicKeyForEncryption = function(identifier) {
        var profile = this.getProfile(identifier);
        if (profile) {
            var key = profile.getKey();
            if (key) {
                return key
            }
        }
        var meta = this.getMeta(identifier);
        if (meta) {
            if (ns.Interface.conforms(meta.key, EncryptKey)) {
                return meta.key
            }
        }
        return null
    };
    Barrack.prototype.getPublicKeysForVerification = function(identifier) {
        var keys = [];
        var profile = this.getProfile(identifier);
        if (profile) {
            var key = profile.getKey();
            if (ns.Interface.conforms(key, VerifyKey)) {
                keys.push(key)
            }
        }
        var meta = this.getMeta(identifier);
        if (meta) {
            if (meta.key) {
                keys.push(meta.key)
            }
        }
        return keys
    };
    Barrack.prototype.getFounder = function(identifier) {
        if (identifier.isBroadcast()) {
            var founder;
            var name = identifier.name;
            if (!name || name === "everyone") {
                founder = "moky@anywhere"
            } else {
                founder = name + ".founder@anywhere"
            }
            return this.getIdentifier(founder)
        }
        return null
    };
    Barrack.prototype.getOwner = function(identifier) {
        if (identifier.isBroadcast()) {
            var owner;
            var name = identifier.name;
            if (!name || name === "everyone") {
                owner = "anyone@anywhere"
            } else {
                owner = name + ".owner@anywhere"
            }
            return this.getIdentifier(owner)
        }
        return null
    };
    Barrack.prototype.getMembers = function(identifier) {
        if (identifier.isBroadcast()) {
            var member;
            var name = identifier.name;
            if (!name || name === "everyone") {
                member = "anyone@anywhere"
            } else {
                member = name + ".member@anywhere"
            }
            var list = [];
            var owner = this.getOwner(identifier);
            if (owner) {
                list.push(owner)
            }
            member = this.getIdentifier(member);
            if (member && !member.equals(owner)) {
                list.push(member)
            }
            return list
        }
        return null
    };
    ns.core.Barrack = Barrack;
    ns.core.register("Barrack")
}(DIMP);
! function(ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Content = ns.Content;
    var Command = ns.protocol.Command;
    var InstantMessage = ns.InstantMessage;
    var ReliableMessage = ns.ReliableMessage;
    var InstantMessageDelegate = ns.InstantMessageDelegate;
    var SecureMessageDelegate = ns.SecureMessageDelegate;
    var ReliableMessageDelegate = ns.ReliableMessageDelegate;
    var Transceiver = function() {
        this.entityDelegate = null;
        this.cipherKeyDelegate = null
    };
    ns.Class(Transceiver, ns.type.Object, [InstantMessageDelegate, SecureMessageDelegate, ReliableMessageDelegate]);
    var get_key = function(sender, receiver) {
        var key = this.cipherKeyDelegate.getCipherKey(sender, receiver);
        if (!key) {
            key = SymmetricKey.generate(SymmetricKey.AES);
            this.cipherKeyDelegate.cacheCipherKey(sender, receiver, key)
        }
        return key
    };
    var is_broadcast_msg = function(msg) {
        var receiver;
        if (msg instanceof InstantMessage) {
            receiver = msg.content.getGroup()
        } else {
            receiver = msg.envelope.getGroup()
        }
        if (!receiver) {
            receiver = msg.envelope.receiver
        }
        receiver = this.entityDelegate.getIdentifier(receiver);
        return receiver && receiver.isBroadcast()
    };
    var overt_group = function(content, facebook) {
        var group = content.getGroup();
        if (group) {
            group = facebook.getIdentifier(group);
            if (group.isBroadcast()) {
                return group
            }
            if (content instanceof Command) {
                return null
            }
        }
        return group
    };
    Transceiver.prototype.encryptMessage = function(iMsg) {
        var sender = this.entityDelegate.getIdentifier(iMsg.envelope.sender);
        var receiver = this.entityDelegate.getIdentifier(iMsg.envelope.receiver);
        var group = overt_group(iMsg.content, this.entityDelegate);
        var password;
        if (group) {
            password = get_key.call(this, sender, group)
        } else {
            password = get_key.call(this, sender, receiver)
        }
        if (!iMsg.delegate) {
            iMsg.delegate = this
        }
        var sMsg;
        if (receiver.isGroup()) {
            var members = this.entityDelegate.getMembers(receiver);
            sMsg = iMsg.encrypt(password, members)
        } else {
            sMsg = iMsg.encrypt(password, null)
        }
        if (!sMsg) {
            return null
        }
        if (group && !receiver.equals(group)) {
            sMsg.envelope.setGroup(group)
        }
        sMsg.envelope.setType(iMsg.content.type);
        return sMsg
    };
    Transceiver.prototype.signMessage = function(sMsg) {
        if (!sMsg.delegate) {
            sMsg.delegate = this
        }
        return sMsg.sign()
    };
    Transceiver.prototype.serializeMessage = function(rMsg) {
        return ns.format.JSON.encode(rMsg)
    };
    Transceiver.prototype.deserializeMessage = function(data) {
        var dict = ns.format.JSON.decode(data);
        return ReliableMessage.getInstance(dict)
    };
    Transceiver.prototype.verifyMessage = function(rMsg) {
        if (!rMsg.delegate) {
            rMsg.delegate = this
        }
        return rMsg.verify()
    };
    Transceiver.prototype.decryptMessage = function(sMsg) {
        if (!sMsg.delegate) {
            sMsg.delegate = this
        }
        return sMsg.decrypt()
    };
    Transceiver.prototype.serializeContent = function(content, pwd, iMsg) {
        return ns.format.JSON.encode(content)
    };
    Transceiver.prototype.encryptContent = function(data, pwd, iMsg) {
        var key = SymmetricKey.getInstance(pwd);
        return key.encrypt(data)
    };
    Transceiver.prototype.encodeData = function(data, iMsg) {
        if (is_broadcast_msg.call(this, iMsg)) {
            return ns.format.UTF8.decode(data)
        }
        return ns.format.Base64.encode(data)
    };
    Transceiver.prototype.serializeKey = function(pwd, iMsg) {
        if (is_broadcast_msg.call(this, iMsg)) {
            return null
        }
        return ns.format.JSON.encode(pwd)
    };
    Transceiver.prototype.encryptKey = function(data, receiver, iMsg) {
        receiver = this.entityDelegate.getIdentifier(receiver);
        var contact = this.entityDelegate.getUser(receiver);
        return contact.encrypt(data)
    };
    Transceiver.prototype.encodeKey = function(key, iMsg) {
        return ns.format.Base64.encode(key)
    };
    Transceiver.prototype.decodeKey = function(key, sMsg) {
        return ns.format.Base64.decode(key)
    };
    Transceiver.prototype.decryptKey = function(data, sender, receiver, sMsg) {
        var identifier = sMsg.envelope.receiver;
        identifier = this.entityDelegate.getIdentifier(identifier);
        var user = this.entityDelegate.getUser(identifier);
        return user.decrypt(data)
    };
    Transceiver.prototype.deserializeKey = function(data, sender, receiver, sMsg) {
        if (data) {
            var dict = ns.format.JSON.decode(data);
            return SymmetricKey.getInstance(dict)
        } else {
            sender = this.entityDelegate.getIdentifier(sender);
            receiver = this.entityDelegate.getIdentifier(receiver);
            return this.cipherKeyDelegate.getCipherKey(sender, receiver)
        }
    };
    Transceiver.prototype.decodeData = function(data, sMsg) {
        if (is_broadcast_msg.call(this, sMsg)) {
            return ns.format.UTF8.encode(data)
        }
        return ns.format.Base64.decode(data)
    };
    Transceiver.prototype.decryptContent = function(data, pwd, sMsg) {
        var key = SymmetricKey.getInstance(pwd);
        if (!key) {
            throw Error("irregular symmetric key: " + pwd)
        }
        return key.decrypt(data)
    };
    Transceiver.prototype.deserializeContent = function(data, pwd, sMsg) {
        var dict = ns.format.JSON.decode(data);
        var content = Content.getInstance(dict);
        if (!is_broadcast_msg.call(this, sMsg)) {
            var key = SymmetricKey.getInstance(pwd);
            var sender = this.entityDelegate.getIdentifier(sMsg.envelope.sender);
            var group = overt_group(content, this.entityDelegate);
            if (group) {
                this.cipherKeyDelegate.cacheCipherKey(sender, group, key)
            } else {
                var receiver = this.entityDelegate.getIdentifier(sMsg.envelope.receiver);
                this.cipherKeyDelegate.cacheCipherKey(sender, receiver, key)
            }
        }
        return content
    };
    Transceiver.prototype.signData = function(data, sender, sMsg) {
        sender = this.entityDelegate.getIdentifier(sender);
        var user = this.entityDelegate.getUser(sender);
        return user.sign(data)
    };
    Transceiver.prototype.encodeSignature = function(signature, sMsg) {
        return ns.format.Base64.encode(signature)
    };
    Transceiver.prototype.decodeSignature = function(signature, rMsg) {
        return ns.format.Base64.decode(signature)
    };
    Transceiver.prototype.verifyDataSignature = function(data, signature, sender, rMsg) {
        sender = this.entityDelegate.getIdentifier(sender);
        var contact = this.entityDelegate.getUser(sender);
        return contact.verify(data, signature)
    };
    ns.core.Transceiver = Transceiver;
    ns.core.register("Transceiver")
}(DIMP);
! function(ns) {
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
    var BaseCoder = ns.format.BaseCoder;
    var base58 = function() {};
    ns.Class(base58, ns.type.Object, [BaseCoder]);
    base58.prototype.encode = function(data) {
        return bs58.encode(data)
    };
    base58.prototype.decode = function(string) {
        return bs58.decode(string)
    };
    ns.format.Base58.coder = new base58()
}(DIMP);
! function(ns) {
    var Hash = ns.digest.Hash;
    var md5 = function() {};
    ns.Class(md5, ns.type.Object, [Hash]);
    md5.prototype.digest = function(data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.MD5(array);
        return ns.format.Hex.decode(result.toString())
    };
    ns.digest.MD5.hash = new md5()
}(DIMP);
! function(ns) {
    var Hash = ns.digest.Hash;
    var sha256 = function() {};
    ns.Class(sha256, ns.type.Object, [Hash]);
    sha256.prototype.digest = function(data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.SHA256(array);
        return ns.format.Hex.decode(result.toString())
    };
    ns.digest.SHA256.hash = new sha256()
}(DIMP);
! function(ns) {
    var Hash = ns.digest.Hash;
    var ripemd160 = function() {};
    ns.Class(ripemd160, ns.type.Object, [Hash]);
    ripemd160.prototype.digest = function(data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.RIPEMD160(array);
        return ns.format.Hex.decode(result.toString())
    };
    ns.digest.RIPEMD160.hash = new ripemd160()
}(DIMP);
! function(ns) {
    var Base64 = ns.format.Base64;
    var MIME_LINE_MAX_LEN = 76;
    var CR_LF = "\r\n";
    var rfc2045 = function(data) {
        var base64 = Base64.encode(data);
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
        return Base64.decode(pem.substring(start, end))
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
            throw TypeError("this is a private key content")
        } else {
            return Base64.decode(pem)
        }
    };
    var decode_rsa_private = function(pem) {
        var data = decode_key(pem, "-----BEGIN RSA PRIVATE KEY-----", "-----END RSA PRIVATE KEY-----");
        if (data) {
            return data
        }
        if (pem.indexOf("PUBLIC KEY") > 0) {
            throw TypeError("this is not a RSA private key content")
        } else {
            return Base64.decode(pem)
        }
    };
    var pem = function() {};
    ns.Class(pem, ns.type.Object, null);
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
    ns.format.PEM = new pem()
}(DIMP);
! function(ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Base64 = ns.format.Base64;
    var Hex = ns.format.Hex;
    var bytes2words = function(data) {
        var string = Hex.encode(data);
        return CryptoJS.enc.Hex.parse(string)
    };
    var words2bytes = function(array) {
        var result = array.toString();
        return Hex.decode(result)
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
        SymmetricKey.call(this, key)
    };
    ns.Class(AESKey, SymmetricKey, null);
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
            return Base64.decode(data)
        }
        var keySize = this.getSize();
        var pwd = random_data(keySize);
        this.setValue("data", Base64.encode(pwd));
        var blockSize = this.getBlockSize();
        var iv = random_data(blockSize);
        this.setValue("iv", Base64.encode(iv));
        return pwd
    };
    AESKey.prototype.getInitVector = function() {
        var iv = this.getValue("iv");
        if (iv) {
            return Base64.decode(iv)
        }
        var zeros = zero_data(this.getBlockSize());
        this.setValue("iv", Base64.encode(zeros));
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
            throw TypeError("failed to encrypt message with key: " + this)
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
    SymmetricKey.register(SymmetricKey.AES, AESKey);
    SymmetricKey.register("AES/CBC/PKCS7Padding", AESKey);
    ns.plugins.AESKey = AESKey
}(DIMP);
! function(ns) {
    var Hex = ns.format.Hex;
    var Base64 = ns.format.Base64;
    var PEM = ns.format.PEM;
    var Data = ns.type.Data;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PublicKey = ns.crypto.PublicKey;
    var EncryptKey = ns.crypto.EncryptKey;
    var RSAPublicKey = function(key) {
        PublicKey.call(this, key)
    };
    ns.Class(RSAPublicKey, PublicKey, [EncryptKey]);
    RSAPublicKey.prototype.getData = function() {
        var data = this.getValue("data");
        if (data) {
            return PEM.decodePublicKey(data)
        } else {
            throw Error("public key data not found")
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
        if (!this.cipher) {
            var der = this.getData();
            var key = Base64.encode(der);
            var cipher = new JSEncrypt();
            cipher.setPublicKey(key);
            if (cipher.key.e === 0 || cipher.key.n === null) {
                der = x509_header.concat(der).getBytes();
                key = Base64.encode(der);
                cipher.setPublicKey(key)
            }
            this.cipher = cipher
        }
        return this.cipher
    };
    RSAPublicKey.prototype.verify = function(data, signature) {
        data = CryptoJS.enc.Hex.parse(Hex.encode(data));
        signature = Base64.encode(signature);
        var cipher = parse_key.call(this);
        return cipher.verify(data, signature, CryptoJS.SHA256)
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
                throw Error("Error encrypt result: " + plaintext)
            }
        }
        throw Error("RSA encrypt error: " + plaintext)
    };
    PublicKey.register(AsymmetricKey.RSA, RSAPublicKey);
    PublicKey.register("SHA256withRSA", RSAPublicKey);
    PublicKey.register("RSA/ECB/PKCS1Padding", RSAPublicKey);
    ns.plugins.RSAPublicKey = RSAPublicKey
}(DIMP);
! function(ns) {
    var Hex = ns.format.Hex;
    var Base64 = ns.format.Base64;
    var PEM = ns.format.PEM;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = function(key) {
        PrivateKey.call(this, key)
    };
    ns.Class(RSAPrivateKey, PrivateKey, [DecryptKey]);
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
        return PublicKey.getInstance(info)
    };
    var parse_key = function() {
        if (!this.cipher) {
            var der = this.getData();
            var key = Base64.encode(der);
            var cipher = new JSEncrypt();
            cipher.setPrivateKey(key);
            this.cipher = cipher
        }
        return this.cipher
    };
    RSAPrivateKey.prototype.sign = function(data) {
        data = CryptoJS.enc.Hex.parse(Hex.encode(data));
        var cipher = parse_key.call(this);
        var base64 = cipher.sign(data, CryptoJS.SHA256, "sha256");
        if (base64) {
            return Base64.decode(base64)
        } else {
            throw Error("RSA sign error: " + data)
        }
    };
    RSAPrivateKey.prototype.decrypt = function(data) {
        data = Base64.encode(data);
        var cipher = parse_key.call(this);
        var string = cipher.decrypt(data);
        if (string) {
            return ns.format.UTF8.encode(string)
        } else {
            throw Error("RSA decrypt error: " + data)
        }
    };
    PrivateKey.register(AsymmetricKey.RSA, RSAPrivateKey);
    PrivateKey.register("SHA256withRSA", RSAPrivateKey);
    PrivateKey.register("RSA/ECB/PKCS1Padding", RSAPrivateKey);
    ns.plugins.RSAPrivateKey = RSAPrivateKey
}(DIMP);
! function(ns) {
    var Data = ns.type.Data;
    var SHA256 = ns.digest.SHA256;
    var RIPEMD160 = ns.digest.RIPEMD160;
    var Base58 = ns.format.Base58;
    var NetworkType = ns.protocol.NetworkType;
    var Address = ns.Address;
    var DefaultAddress = function(string) {
        Address.call(this, string);
        var data = Base58.decode(string);
        if (data.length !== 25) {
            throw RangeError("address length error: " + string)
        }
        var prefix = data.subarray(0, 21);
        var suffix = data.subarray(21, 25);
        var cc = check_code(prefix);
        if (!ns.type.Arrays.equals(cc, suffix)) {
            throw Error("address check code error: " + string)
        }
        this.network = data[0];
        this.code = search_number(cc)
    };
    ns.Class(DefaultAddress, Address, null);
    DefaultAddress.prototype.getNetwork = function() {
        return this.network
    };
    DefaultAddress.prototype.getCode = function() {
        return this.code
    };
    DefaultAddress.generate = function(fingerprint, network) {
        if (network instanceof NetworkType) {
            network = network.valueOf()
        }
        var digest = RIPEMD160.digest(SHA256.digest(fingerprint));
        var head = new Data(21);
        head.push(network);
        head.push(digest);
        var cc = check_code(head.getBytes(false));
        var data = new Data(25);
        data.push(head);
        data.push(cc);
        return new DefaultAddress(Base58.encode(data.getBytes(false)))
    };
    var check_code = function(data) {
        var sha256d = SHA256.digest(SHA256.digest(data));
        return sha256d.subarray(0, 4)
    };
    var search_number = function(cc) {
        return (cc[0] | cc[1] << 8 | cc[2] << 16) + cc[3] * 16777216
    };
    Address.register(DefaultAddress);
    ns.plugins.DefaultAddress = DefaultAddress
}(DIMP);
! function(ns) {
    var NetworkType = ns.protocol.NetworkType;
    var MetaType = ns.protocol.MetaType;
    var Meta = ns.Meta;
    var DefaultAddress = ns.plugins.DefaultAddress;
    var DefaultMeta = function(meta) {
        Meta.call(this, meta);
        this.idMap = {}
    };
    ns.Class(DefaultMeta, Meta, null);
    DefaultMeta.prototype.generateIdentifier = function(network) {
        if (network instanceof NetworkType) {
            network = network.valueOf()
        }
        var identifier = this.idMap[network];
        if (!identifier) {
            identifier = Meta.prototype.generateIdentifier.call(this, network);
            if (identifier) {
                this.idMap[network] = identifier
            }
        }
        return identifier
    };
    DefaultMeta.prototype.generateAddress = function(network) {
        if (!this.isValid()) {
            throw Error("meta invalid: " + this)
        }
        if (network instanceof NetworkType) {
            network = network.valueOf()
        }
        var identifier = this.idMap[network];
        if (identifier) {
            return identifier.address
        }
        return DefaultAddress.generate(this.fingerprint, network)
    };
    Meta.register(MetaType.MKM, DefaultMeta);
    ns.plugins.DefaultMeta = DefaultMeta
}(DIMP);
! function(ns) {
    var Envelope = ns.Envelope;
    var Command = ns.protocol.Command;
    var ReceiptCommand = function(info) {
        var sn = null;
        var message = null;
        var envelope = null;
        if (!info) {
            info = Command.RECEIPT
        } else {
            if (typeof info === "number") {
                sn = info;
                info = Command.RECEIPT
            } else {
                if (typeof info === "string") {
                    message = info;
                    info = Command.RECEIPT
                } else {
                    if (info instanceof Envelope) {
                        envelope = info;
                        info = Command.RECEIPT
                    }
                }
            }
        }
        Command.call(this, info);
        if (sn) {
            this.setSerialNumber(sn)
        }
        if (message) {
            this.setMessage(message)
        }
        if (envelope) {
            this.setEnvelope(envelope)
        } else {
            this.envelope = null
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
        if (!this.envelope) {
            var env = this.getValue("envelope");
            if (!env) {
                var sender = this.getValue("sender");
                var receiver = this.getValue("receiver");
                if (sender && receiver) {
                    env = this.getMap(false)
                }
            }
            this.envelope = Envelope.getInstance(env)
        }
        return this.envelope
    };
    ReceiptCommand.prototype.setEnvelope = function(env) {
        this.setValue("envelope", null);
        if (env) {
            this.setValue("sender", env.sender);
            this.setValue("receiver", env.receiver);
            this.setValue("time", env.time);
            this.setValue("group", env.getGroup())
        }
        this.envelope = env
    };
    Command.register(Command.RECEIPT, ReceiptCommand);
    ns.protocol.ReceiptCommand = ReceiptCommand;
    ns.protocol.register("ReceiptCommand")
}(DIMP);
! function(ns) {
    var HandshakeState = ns.type.Enum(null, {
        INIT: 0,
        START: 1,
        AGAIN: 2,
        RESTART: 3,
        SUCCESS: 4
    });
    var Command = ns.protocol.Command;
    var HandshakeCommand = function(info) {
        var message = null;
        if (!info) {
            info = Command.HANDSHAKE
        } else {
            if (typeof info === "string") {
                message = info;
                info = Command.HANDSHAKE
            }
        }
        Command.call(this, info);
        if (message) {
            this.setMessage(message)
        }
    };
    ns.Class(HandshakeCommand, Command, null);
    HandshakeCommand.prototype.getMessage = function() {
        return this.getValue("message")
    };
    HandshakeCommand.prototype.setMessage = function(text) {
        this.setValue("message", text)
    };
    HandshakeCommand.prototype.getSessionKey = function() {
        return this.getValue("session")
    };
    HandshakeCommand.prototype.setSessionKey = function(session) {
        this.setValue("session", session)
    };
    HandshakeCommand.prototype.getState = function() {
        var text = this.getMessage();
        var session = this.getSessionKey();
        if (!text) {
            return HandshakeState.INIT
        }
        if (text === "DIM?") {
            return HandshakeState.AGAIN
        }
        if (text === "DIM!" || text === "OK!") {
            return HandshakeState.SUCCESS
        }
        if (session) {
            return HandshakeState.RESTART
        } else {
            return HandshakeState.START
        }
    };
    var handshake = function(text, session) {
        var cmd = new HandshakeCommand(text);
        if (session) {
            cmd.setSessionKey(session)
        }
        return cmd
    };
    HandshakeCommand.start = function() {
        return handshake("Hello world!")
    };
    HandshakeCommand.restart = function(session) {
        return handshake("Hello world!", session)
    };
    HandshakeCommand.again = function(session) {
        return handshake("DIM?", session)
    };
    HandshakeCommand.success = function() {
        return handshake("DIM!")
    };
    Command.register(Command.HANDSHAKE, HandshakeCommand);
    ns.protocol.HandshakeCommand = HandshakeCommand;
    ns.protocol.HandshakeState = HandshakeState;
    ns.protocol.register("HandshakeCommand");
    ns.protocol.register("HandshakeState")
}(DIMP);
! function(ns) {
    var Dictionary = ns.type.Dictionary;
    var ID = ns.ID;
    var Command = ns.protocol.Command;
    var LoginCommand = function(info) {
        var identifier = null;
        var time = null;
        if (!info) {
            time = new Date();
            info = Command.LOGIN
        } else {
            if (info instanceof ID) {
                identifier = info;
                time = new Date();
                info = Command.LOGIN
            }
        }
        Command.call(this, info);
        if (identifier) {
            this.setIdentifier(identifier)
        }
        if (time) {
            this.setTime(time)
        }
    };
    ns.Class(LoginCommand, Command, null);
    LoginCommand.prototype.getTime = function() {
        var time = this.getValue("time");
        if (time) {
            return new Date(time * 1000)
        } else {
            return null
        }
    };
    LoginCommand.prototype.setTime = function(time) {
        if (!time) {
            time = new Date()
        }
        if (time instanceof Date) {
            this.setValue("time", time.getTime() / 1000)
        } else {
            if (typeof time === "number") {
                this.setValue("time", time)
            } else {
                throw TypeError("time error: " + time)
            }
        }
    };
    LoginCommand.prototype.getIdentifier = function() {
        return this.getValue("ID")
    };
    LoginCommand.prototype.setIdentifier = function(identifier) {
        this.setValue("ID", identifier)
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
        if (station instanceof ns.Station) {
            info = {
                "host": station.host,
                "port": station.port,
                "ID": station.identifier
            }
        } else {
            if (station instanceof Dictionary) {
                info = station.getMap(false)
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
                "ID": provider.identifier
            }
        } else {
            if (provider instanceof ID) {
                info = {
                    "ID": provider
                }
            } else {
                if (provider instanceof Dictionary) {
                    info = provider.getMap(false)
                } else {
                    info = provider
                }
            }
        }
        this.setValue("provider", info)
    };
    Command.register(Command.LOGIN, LoginCommand);
    ns.protocol.LoginCommand = LoginCommand;
    ns.protocol.register("LoginCommand")
}(DIMP);
! function(ns) {
    var Command = ns.protocol.Command;
    var MuteCommand = function(info) {
        var list = null;
        if (!info) {
            info = MuteCommand.MUTE
        } else {
            if (info instanceof Array) {
                list = info;
                info = MuteCommand.MUTE
            }
        }
        Command.call(this, info);
        if (list) {
            this.setMuteCList(list)
        }
    };
    ns.Class(MuteCommand, Command, null);
    MuteCommand.MUTE = "mute";
    MuteCommand.prototype.getMuteCList = function() {
        return this.getValue("list")
    };
    MuteCommand.prototype.setMuteCList = function(list) {
        this.setValue("list", list)
    };
    Command.register(MuteCommand.MUTE, MuteCommand);
    ns.protocol.MuteCommand = MuteCommand;
    ns.protocol.register("MuteCommand")
}(DIMP);
! function(ns) {
    var Command = ns.protocol.Command;
    var BlockCommand = function(info) {
        var list = null;
        if (!info) {
            info = BlockCommand.BLOCK
        } else {
            if (info instanceof Array) {
                list = info;
                info = BlockCommand.BLOCK
            }
        }
        Command.call(this, info);
        if (list) {
            this.setBlockCList(list)
        }
    };
    ns.Class(BlockCommand, Command, null);
    BlockCommand.BLOCK = "block";
    BlockCommand.prototype.getBlockCList = function() {
        return this.getValue("list")
    };
    BlockCommand.prototype.setBlockCList = function(list) {
        this.setValue("list", list)
    };
    Command.register(BlockCommand.BLOCK, BlockCommand);
    ns.protocol.BlockCommand = BlockCommand;
    ns.protocol.register("BlockCommand")
}(DIMP);
! function(ns) {
    var Base64 = ns.format.Base64;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var Command = ns.protocol.Command;
    var StorageCommand = function(info) {
        var title = null;
        if (!info) {
            info = StorageCommand.STORAGE
        } else {
            if (typeof info === "string") {
                title = info;
                info = StorageCommand.STORAGE
            }
        }
        Command.call(this, info);
        if (title) {
            this.setTitle(title)
        }
        this.data = null;
        this.plaintext = null;
        this.key = null;
        this.password = null
    };
    ns.Class(StorageCommand, Command, null);
    StorageCommand.prototype.getTitle = function() {
        var title = this.getValue("title");
        if (title) {
            return title
        } else {
            return this.getCommand()
        }
    };
    StorageCommand.prototype.setTitle = function(title) {
        this.setValue("title", title)
    };
    StorageCommand.prototype.getIdentifier = function() {
        return this.getValue("ID")
    };
    StorageCommand.prototype.setIdentifier = function(identifier) {
        this.setValue("ID", identifier)
    };
    StorageCommand.prototype.getData = function() {
        if (!this.data) {
            var base64 = this.getValue("data");
            if (base64) {
                this.data = Base64.decode(base64)
            }
        }
        return this.data
    };
    StorageCommand.prototype.setData = function(data) {
        var base64 = null;
        if (data) {
            base64 = Base64.encode(data)
        }
        this.setValue("data", base64);
        this.data = data;
        this.plaintext = null
    };
    StorageCommand.prototype.getKey = function() {
        if (!this.key) {
            var base64 = this.getValue("key");
            if (base64) {
                this.key = Base64.decode(base64)
            }
        }
        return this.key
    };
    StorageCommand.prototype.setKey = function(data) {
        var base64 = null;
        if (data) {
            base64 = Base64.encode(data)
        }
        this.setValue("key", base64);
        this.key = data;
        this.password = null
    };
    StorageCommand.prototype.decrypt = function(key) {
        if (!this.plaintext) {
            var pwd = null;
            if (key instanceof PrivateKey) {
                pwd = this.decryptKey(key);
                if (!pwd) {
                    throw Error("failed to decrypt key: " + key)
                }
            } else {
                if (key instanceof SymmetricKey) {
                    pwd = key
                } else {
                    throw TypeError("Decryption key error: " + key)
                }
            }
            var data = this.getData();
            this.plaintext = pwd.decrypt(data)
        }
        return this.plaintext
    };
    StorageCommand.prototype.decryptKey = function(privateKey) {
        if (!this.password) {
            var key = this.getKey();
            key = privateKey.decrypt(key);
            var dict = ns.format.JSON.decode(key);
            this.password = SymmetricKey.getInstance(dict)
        }
        return this.password
    };
    StorageCommand.STORAGE = "storage";
    StorageCommand.CONTACTS = "contacts";
    StorageCommand.PRIVATE_KEY = "private_key";
    Command.register(StorageCommand.STORAGE, StorageCommand);
    Command.register(StorageCommand.CONTACTS, StorageCommand);
    Command.register(StorageCommand.PRIVATE_KEY, StorageCommand);
    ns.protocol.StorageCommand = StorageCommand;
    ns.protocol.register("StorageCommand")
}(DIMP);
! function(ns) {
    var ContentType = ns.protocol.ContentType;
    var ContentProcessor = function(messenger) {
        this.messenger = messenger;
        this.contentProcessors = {}
    };
    ns.Class(ContentProcessor, ns.type.Object, null);
    ContentProcessor.prototype.getContext = function(key) {
        return this.messenger.getContext(key)
    };
    ContentProcessor.prototype.setContext = function(key, value) {
        this.messenger.setContext(key, value)
    };
    ContentProcessor.prototype.getFacebook = function() {
        return this.messenger.getFacebook()
    };
    ContentProcessor.prototype.process = function(content, sender, msg) {
        var cpu = this.getCPU(content.type);
        return cpu.process(content, sender, msg)
    };
    ContentProcessor.prototype.getCPU = function(type) {
        var value;
        if (type instanceof ContentType) {
            value = type.valueOf()
        } else {
            value = type
        }
        var cpu = this.contentProcessors[value];
        if (cpu) {
            return cpu
        }
        var clazz = cpu_classes[value];
        if (!clazz) {
            if (ContentType.UNKNOWN.equals(value)) {
                throw TypeError("default CPU not register yet")
            }
            return this.getCPU(ContentType.UNKNOWN)
        }
        cpu = new clazz(this.messenger);
        this.contentProcessors[value] = cpu;
        return cpu
    };
    var cpu_classes = {};
    ContentProcessor.register = function(type, clazz) {
        var value;
        if (type instanceof ContentType) {
            value = type.valueOf()
        } else {
            value = type
        }
        if (clazz) {
            cpu_classes[value] = clazz
        } else {
            delete cpu_classes[value]
        }
    };
    if (typeof ns.cpu !== "object") {
        ns.cpu = {}
    }
    ns.Namespace(ns.cpu);
    ns.cpu.ContentProcessor = ContentProcessor;
    ns.cpu.register("ContentProcessor")
}(DIMP);
! function(ns) {
    var ContentType = ns.protocol.ContentType;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var CommandProcessor = function(messenger) {
        ContentProcessor.call(this, messenger);
        this.commandProcessors = {}
    };
    ns.Class(CommandProcessor, ContentProcessor, null);
    CommandProcessor.prototype.process = function(cmd, sender, msg) {
        var cpu = this.getCPU(cmd.getCommand());
        return cpu.process(cmd, sender, msg)
    };
    CommandProcessor.prototype.getCPU = function(command) {
        var cpu = this.commandProcessors[command];
        if (cpu) {
            return cpu
        }
        var clazz = cpu_classes[command];
        if (!clazz) {
            if (command === ContentProcessor.UNKNOWN) {
                throw TypeError("default CPU not register yet")
            }
            return this.getCPU(CommandProcessor.UNKNOWN)
        }
        cpu = new clazz(this.messenger);
        this.commandProcessors[command] = cpu;
        return cpu
    };
    var cpu_classes = {};
    CommandProcessor.register = function(command, clazz) {
        if (clazz) {
            cpu_classes[command] = clazz
        } else {
            delete cpu_classes[command]
        }
    };
    CommandProcessor.UNKNOWN = "unknown";
    ContentProcessor.register(ContentType.COMMAND, CommandProcessor);
    ns.cpu.CommandProcessor = CommandProcessor;
    ns.cpu.register("CommandProcessor")
}(DIMP);
! function(ns) {
    var ContentType = ns.protocol.ContentType;
    var TextContent = ns.protocol.TextContent;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var DefaultContentProcessor = function(messenger) {
        ContentProcessor.call(this, messenger)
    };
    ns.Class(DefaultContentProcessor, ContentProcessor, null);
    DefaultContentProcessor.prototype.process = function(content, sender, msg) {
        var type = content.type.toString();
        var text = "Content (type: " + type + ") not support yet!";
        var res = new TextContent(text);
        var group = content.getGroup();
        if (group) {
            res.setGroup(group)
        }
        return res
    };
    ContentProcessor.register(ContentType.UNKNOWN, DefaultContentProcessor);
    ns.cpu.DefaultContentProcessor = DefaultContentProcessor;
    ns.cpu.register("DefaultContentProcessor")
}(DIMP);
! function(ns) {
    var TextContent = ns.protocol.TextContent;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var DefaultCommandProcessor = function(messenger) {
        CommandProcessor.call(this, messenger)
    };
    ns.Class(DefaultCommandProcessor, CommandProcessor, null);
    DefaultCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var name = cmd.getCommand();
        var text = "Command (name: " + name + ") not support yet!";
        var res = new TextContent(text);
        var group = cmd.getGroup();
        if (group) {
            res.setGroup(group)
        }
        return res
    };
    CommandProcessor.register(CommandProcessor.UNKNOWN, DefaultCommandProcessor);
    ns.cpu.DefaultCommandProcessor = DefaultCommandProcessor;
    ns.cpu.register("DefaultCommandProcessor")
}(DIMP);
! function(ns) {
    var ContentType = ns.protocol.ContentType;
    var ForwardContent = ns.protocol.ForwardContent;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var ForwardContentProcessor = function(messenger) {
        ContentProcessor.call(this, messenger)
    };
    ns.Class(ForwardContentProcessor, ContentProcessor, null);
    ForwardContentProcessor.prototype.process = function(content, sender, msg) {
        var secret = content.getMessage();
        var messenger = this.messenger;
        secret = messenger.processMessage(secret);
        if (secret) {
            return new ForwardContent(secret)
        }
        return null
    };
    ContentProcessor.register(ContentType.FORWARD, ForwardContentProcessor);
    ns.cpu.ForwardContentProcessor = ForwardContentProcessor;
    ns.cpu.register("ForwardContentProcessor")
}(DIMP);
! function(ns) {
    var TextContent = ns.protocol.TextContent;
    var Command = ns.protocol.Command;
    var MetaCommand = ns.protocol.MetaCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var MetaCommandProcessor = function(messenger) {
        CommandProcessor.call(this, messenger)
    };
    ns.Class(MetaCommandProcessor, CommandProcessor, null);
    var get_meta = function(identifier) {
        var facebook = this.getFacebook();
        var meta = facebook.getMeta(identifier);
        if (!meta) {
            var text = "Sorry, meta not found for ID: " + identifier;
            return new TextContent(text)
        }
        return MetaCommand.response(identifier, meta)
    };
    var put_meta = function(identifier, meta) {
        var facebook = this.getFacebook();
        if (!facebook.verifyMeta(meta, identifier)) {
            return new TextContent("Meta not match ID: " + identifier)
        }
        if (!facebook.saveMeta(meta, identifier)) {
            return new TextContent("Meta not accept: " + identifier)
        }
        return new ReceiptCommand("Meta received: " + identifier)
    };
    MetaCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var facebook = this.getFacebook();
        var identifier = cmd.getIdentifier();
        identifier = facebook.getIdentifier(identifier);
        var meta = cmd.getMeta();
        if (meta) {
            return put_meta.call(this, identifier, meta)
        } else {
            return get_meta.call(this, identifier)
        }
    };
    CommandProcessor.register(Command.META, MetaCommandProcessor);
    ns.cpu.MetaCommandProcessor = MetaCommandProcessor;
    ns.cpu.register("MetaCommandProcessor")
}(DIMP);
! function(ns) {
    var TextContent = ns.protocol.TextContent;
    var Command = ns.protocol.Command;
    var ProfileCommand = ns.protocol.ProfileCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var MetaCommandProcessor = ns.cpu.MetaCommandProcessor;
    var ProfileCommandProcessor = function(messenger) {
        MetaCommandProcessor.call(this, messenger)
    };
    ns.Class(ProfileCommandProcessor, MetaCommandProcessor, null);
    var get_profile = function(identifier) {
        var facebook = this.getFacebook();
        var profile = facebook.getProfile(identifier);
        if (!profile) {
            var text = "Sorry, profile not found for ID: " + identifier;
            return new TextContent(text)
        }
        return ProfileCommand.response(identifier, profile, null)
    };
    var put_profile = function(identifier, profile, meta) {
        var facebook = this.getFacebook();
        if (meta) {
            if (!facebook.verifyMeta(meta, identifier)) {
                return new TextContent("Meta not match ID: " + identifier)
            }
            if (!facebook.saveMeta(meta, identifier)) {
                return new TextContent("Meta not accept: " + identifier)
            }
        }
        if (!facebook.verifyProfile(profile, identifier)) {
            return new TextContent("Profile not match ID: " + identifier)
        }
        if (!facebook.saveProfile(profile, identifier)) {
            return new TextContent("Profile not accept: " + identifier)
        }
        return new ReceiptCommand("Profile received: " + identifier)
    };
    ProfileCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var facebook = this.getFacebook();
        var identifier = cmd.getIdentifier();
        identifier = facebook.getIdentifier(identifier);
        var profile = cmd.getProfile();
        if (profile) {
            var meta = cmd.getMeta();
            return put_profile.call(this, identifier, profile, meta)
        } else {
            return get_profile.call(this, identifier)
        }
    };
    CommandProcessor.register(Command.PROFILE, ProfileCommandProcessor);
    ns.cpu.ProfileCommandProcessor = ProfileCommandProcessor;
    ns.cpu.register("ProfileCommandProcessor")
}(DIMP);
! function(ns) {
    var ContentType = ns.protocol.ContentType;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var HistoryCommandProcessor = function(messenger) {
        CommandProcessor.call(this, messenger);
        this.gpu = null
    };
    ns.Class(HistoryCommandProcessor, CommandProcessor, null);
    HistoryCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var cpu;
        if (cmd.getGroup()) {
            if (!this.gpu) {
                this.gpu = new ns.cpu.GroupCommandProcessor(this.messenger)
            }
            cpu = this.gpu
        } else {
            var name = cmd.getCommand();
            cpu = this.getCPU(name)
        }
        return cpu.process(cmd, sender, msg)
    };
    HistoryCommandProcessor.register = function(command, clazz) {
        CommandProcessor.register.call(this, command, clazz)
    };
    ContentProcessor.register(ContentType.HISTORY, HistoryCommandProcessor);
    ns.cpu.HistoryCommandProcessor = HistoryCommandProcessor;
    ns.cpu.register("HistoryCommandProcessor")
}(DIMP);
! function(ns) {
    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor;
    var GroupCommandProcessor = function(messenger) {
        HistoryCommandProcessor.call(this, messenger)
    };
    ns.Class(GroupCommandProcessor, HistoryCommandProcessor, null);
    var convert_id_list = function(list) {
        var facebook = this.getFacebook();
        var array = [];
        var identifier;
        for (var i = 0; i < list.length; ++i) {
            identifier = facebook.getIdentifier(list[i]);
            if (!identifier) {
                continue
            }
            array.push(identifier)
        }
        return array
    };
    GroupCommandProcessor.prototype.getMembers = function(cmd) {
        var members = cmd.getMembers();
        if (!members) {
            var member = cmd.getMember();
            if (!member) {
                return null
            }
            members = [member]
        }
        return convert_id_list.call(this, members)
    };
    GroupCommandProcessor.prototype.containsOwner = function(members, group) {
        var facebook = this.getFacebook();
        var identifier;
        for (var i = 0; i < members.length; ++i) {
            identifier = facebook.getIdentifier(members[i]);
            if (facebook.isOwner(identifier, group)) {
                return true
            }
        }
        return false
    };
    GroupCommandProcessor.prototype.isEmpty = function(group) {
        var facebook = this.getFacebook();
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            return true
        }
        var owner = facebook.getOwner(group);
        return !owner
    };
    GroupCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var name = cmd.getCommand();
        var cpu = this.getCPU(name);
        return cpu.process(cmd, sender, msg)
    };
    GroupCommandProcessor.register = function(command, clazz) {
        HistoryCommandProcessor.register.call(this, command, clazz)
    };
    if (typeof ns.cpu.group !== "object") {
        ns.cpu.group = {}
    }
    ns.Namespace(ns.cpu.group);
    ns.cpu.GroupCommandProcessor = GroupCommandProcessor;
    ns.cpu.register("GroupCommandProcessor")
}(DIMP);
! function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var InviteCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.Class(InviteCommandProcessor, GroupCommandProcessor, null);
    var is_reset = function(inviteList, sender, group) {
        var facebook = this.getFacebook();
        if (this.containsOwner(inviteList, group)) {
            return facebook.isOwner(sender, group)
        }
        return false
    };
    var reset = function(cmd, sender, msg) {
        var cpu = this.getCPU(GroupCommand.RESET);
        return cpu.process(cmd, sender, msg)
    };
    var invite = function(inviteList, group) {
        var facebook = this.getFacebook();
        var members = facebook.getMembers(group);
        if (!members) {
            members = []
        }
        var addedList = [];
        var item;
        for (var i = 0; i < inviteList.length; ++i) {
            item = inviteList[i];
            if (members.indexOf(item) >= 0) {
                continue
            }
            addedList.push(item);
            members.push(item)
        }
        if (addedList.length > 0) {
            if (facebook.saveMembers(members, group)) {
                return addedList
            }
        }
        return null
    };
    InviteCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        if (this.isEmpty(group)) {
            return reset.call(this, cmd, sender, msg)
        }
        if (!facebook.existsMember(sender, group)) {
            if (!facebook.existsAssistant(sender, group)) {
                if (!facebook.isOwner(sender, group)) {
                    throw Error(sender + " is not a member of group: " + group)
                }
            }
        }
        var inviteList = this.getMembers(cmd);
        if (!inviteList || inviteList.length === 0) {
            throw Error("Invite command error: " + cmd)
        }
        if (is_reset.call(this, inviteList, sender, group)) {
            return reset.call(this, cmd, sender, msg)
        }
        var added = invite.call(this, inviteList, group);
        if (added) {
            cmd.setValue("added", added)
        }
        return null
    };
    GroupCommandProcessor.register(GroupCommand.INVITE, InviteCommandProcessor);
    ns.cpu.group.InviteCommandProcessor = InviteCommandProcessor;
    ns.cpu.group.register("InviteCommandProcessor")
}(DIMP);
! function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var ExpelCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.Class(ExpelCommandProcessor, GroupCommandProcessor, null);
    ExpelCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        if (!facebook.isOwner(sender, group)) {
            if (!facebook.existsAssistant(sender, group)) {
                throw Error(sender + " is not the owner/admin of group: " + group)
            }
        }
        var expelList = this.getMembers(cmd);
        if (!expelList || expelList.length === 0) {
            throw Error("Expel command error: " + cmd)
        }
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            throw Error("Group members not found: " + group)
        }
        var removedList = [];
        var item;
        for (var i = 0; i < expelList.length; ++i) {
            item = expelList[i];
            if (members.indexOf(item) < 0) {
                continue
            }
            removedList.push(item);
            ns.type.Arrays.remove(members, item)
        }
        if (removedList.length > 0) {
            if (facebook.saveMembers(members, group)) {
                cmd.setValue("removed", removedList)
            }
        }
        return null
    };
    GroupCommandProcessor.register(GroupCommand.EXPEL, ExpelCommandProcessor);
    ns.cpu.group.ExpelCommandProcessor = ExpelCommandProcessor;
    ns.cpu.group.register("ExpelCommandProcessor")
}(DIMP);
! function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var QuitCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.Class(QuitCommandProcessor, GroupCommandProcessor, null);
    QuitCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        if (facebook.isOwner(sender, group)) {
            throw Error("owner cannot quit: " + sender + ", " + group)
        }
        if (facebook.existsAssistant(sender, group)) {
            throw Error("assistant cannot quit: " + sender + ", " + group)
        }
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            throw Error("Group members not found: " + group)
        }
        if (members.indexOf(sender) < 0) {
            throw Error(sender + " is not a member of group: " + group)
        }
        ns.type.Arrays.remove(members, sender);
        facebook.saveMembers(members, group);
        return null
    };
    GroupCommandProcessor.register(GroupCommand.QUIT, QuitCommandProcessor);
    ns.cpu.group.QuitCommandProcessor = QuitCommandProcessor;
    ns.cpu.group.register("QuitCommandProcessor")
}(DIMP);
! function(ns) {
    var TextContent = ns.protocol.TextContent;
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var QueryCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.Class(QueryCommandProcessor, GroupCommandProcessor, null);
    QueryCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        if (!facebook.existsMember(sender, group)) {
            if (!facebook.existsAssistant(sender, group)) {
                if (!facebook.isOwner(sender, group)) {
                    throw Error(sender + " is not a member/assistant of group: " + group)
                }
            }
        }
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            var res = new TextContent("Sorry, members not found in group: " + group);
            res.setGroup(group);
            return res
        }
        var user = facebook.getCurrentUser();
        if (facebook.isOwner(user.identifier, group)) {
            return GroupCommand.reset(group, members)
        } else {
            return GroupCommand.invite(group, members)
        }
    };
    GroupCommandProcessor.register(GroupCommand.QUERY, QueryCommandProcessor);
    ns.cpu.group.QueryCommandProcessor = QueryCommandProcessor;
    ns.cpu.group.register("QueryCommandProcessor")
}(DIMP);
! function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var ResetCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.Class(ResetCommandProcessor, GroupCommandProcessor, null);
    var save = function(newMembers, sender, group) {
        if (!this.containsOwner(newMembers, group)) {
            return GroupCommand.query(group)
        }
        var facebook = this.getFacebook();
        if (facebook.saveMembers(newMembers, group)) {
            var owner = facebook.getOwner(group);
            if (owner && !owner.equals(sender)) {
                var cmd = GroupCommand.query(group);
                this.messenger.sendContent(cmd, owner, null)
            }
        }
        return null
    };
    var reset = function(newMembers, group) {
        var facebook = this.getFacebook();
        var oldMembers = facebook.getMembers(group);
        if (!oldMembers) {
            oldMembers = []
        }
        var removedList = [];
        var i, item;
        for (i = 0; i < oldMembers.length; ++i) {
            item = oldMembers[i];
            if (newMembers.indexOf(item) >= 0) {
                continue
            }
            removedList.push(item)
        }
        var addedList = [];
        for (i = 0; i < newMembers.length; ++i) {
            item = newMembers[i];
            if (oldMembers.indexOf(item) >= 0) {
                continue
            }
            addedList.push(item)
        }
        var result = {};
        if (addedList.length > 0 || removedList.length > 0) {
            if (!facebook.saveMembers(newMembers, group)) {
                return result
            }
            if (addedList.length > 0) {
                result["added"] = addedList
            }
            if (removedList.length > 0) {
                result["removed"] = removedList
            }
        }
        return result
    };
    ResetCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        var newMembers = this.getMembers(cmd);
        if (!newMembers || newMembers.length === 0) {
            throw Error("Reset group command error: " + cmd)
        }
        if (this.isEmpty(group)) {
            return save.call(this, newMembers, sender, group)
        }
        if (!facebook.isOwner(sender, group)) {
            if (!facebook.existsAssistant(sender, group)) {
                throw Error(sender + " is not the owner/admin of group: " + group)
            }
        }
        var result = reset.call(this, newMembers, group);
        var added = result["added"];
        if (added) {
            cmd.setValue("added", added)
        }
        var removed = result["removed"];
        if (removed) {
            cmd.setValue("removed", removed)
        }
        return null
    };
    GroupCommandProcessor.register(GroupCommand.RESET, ResetCommandProcessor);
    ns.cpu.group.ResetCommandProcessor = ResetCommandProcessor;
    ns.cpu.group.register("ResetCommandProcessor")
}(DIMP);
! function(ns) {
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
    ns.register("Polylogue")
}(DIMP);
! function(ns) {
    var GroupDataSource = ns.GroupDataSource;
    var ChatroomDataSource = function() {};
    ns.Interface(ChatroomDataSource, [GroupDataSource]);
    ChatroomDataSource.prototype.getAdmins = function() {
        console.assert(false, "implement me!");
        return null
    };
    ns.ChatroomDataSource = ChatroomDataSource;
    ns.register("ChatroomDataSource")
}(DIMP);
! function(ns) {
    var Group = ns.Group;
    var Chatroom = function(identifier) {
        Group.call(this, identifier)
    };
    ns.Class(Chatroom, Group, null);
    Chatroom.prototype.getAdmins = function() {
        return this.delegate.getAdmins(this.identifier)
    };
    ns.Chatroom = Chatroom;
    ns.register("Chatroom")
}(DIMP);
! function(ns) {
    var User = ns.User;
    var Robot = function(identifier) {
        User.call(this, identifier)
    };
    ns.Class(Robot, User, null);
    ns.Robot = Robot;
    ns.register("Robot")
}(DIMP);
! function(ns) {
    var User = ns.User;
    var Station = function(identifier, host, port) {
        User.call(this, identifier);
        this.host = host;
        this.port = port
    };
    ns.Class(Station, User, null);
    ns.Station = Station;
    ns.register("Station")
}(DIMP);
! function(ns) {
    var Group = ns.Group;
    var ServiceProvider = function(identifier) {
        Group.call(this, identifier)
    };
    ns.Class(ServiceProvider, Group, null);
    ServiceProvider.prototype.getStations = function() {
        return this.delegate.getMembers(this.identifier)
    };
    ns.ServiceProvider = ServiceProvider;
    ns.register("ServiceProvider")
}(DIMP);
! function(ns) {
    var ID = ns.ID;
    var Address = ns.Address;
    var AddressNameService = function() {
        var caches = {
            "all": ID.EVERYONE,
            "everyone": ID.EVERYONE,
            "anyone": ID.ANYONE,
            "owner": ID.ANYONE,
            "founder": AddressNameService.FOUNDER
        };
        var reserved = {};
        var keywords = AddressNameService.KEYWORDS;
        for (var i = 0; i < keywords.length; ++i) {
            reserved[keywords[i]] = true
        }
        this.reserved = reserved;
        this.caches = caches
    };
    ns.Class(AddressNameService, ns.type.Object, null);
    AddressNameService.prototype.isReserved = function(name) {
        return this.reserved[name] === true
    };
    AddressNameService.prototype.cache = function(name, identifier) {
        if (this.isReserved(name)) {
            return false
        }
        if (identifier) {
            this.caches[name] = identifier;
            return true
        } else {
            delete this.caches[name];
            return false
        }
    };
    AddressNameService.prototype.save = function(name, identifier) {
        console.assert(false, "implement me!");
        return false
    };
    AddressNameService.prototype.getIdentifier = function(name) {
        return this.caches[name]
    };
    AddressNameService.prototype.getNames = function(identifier) {
        var array = [];
        var keys = Object.keys(this.caches);
        var name;
        for (var i = 0; i < keys.length; ++i) {
            name = keys[i];
            if (this.caches[name] === identifier) {
                array.push(name)
            }
        }
        return array
    };
    AddressNameService.FOUNDER = new ID("moky", Address.ANYWHERE);
    AddressNameService.KEYWORDS = ["all", "everyone", "anyone", "owner", "founder", "dkd", "mkm", "dimp", "dim", "dimt", "rsa", "ecc", "aes", "des", "btc", "eth", "crypto", "key", "symmetric", "asymmetric", "public", "private", "secret", "password", "id", "address", "meta", "profile", "entity", "user", "group", "contact", "member", "admin", "administrator", "assistant", "main", "polylogue", "chatroom", "social", "organization", "company", "school", "government", "department", "provider", "station", "thing", "robot", "message", "instant", "secure", "reliable", "envelope", "sender", "receiver", "time", "content", "forward", "command", "history", "keys", "data", "signature", "type", "serial", "sn", "text", "file", "image", "audio", "video", "page", "handshake", "receipt", "block", "mute", "register", "suicide", "found", "abdicate", "invite", "expel", "join", "quit", "reset", "query", "hire", "fire", "resign", "server", "client", "terminal", "local", "remote", "barrack", "cache", "transceiver", "ans", "facebook", "store", "messenger", "root", "supervisor"];
    ns.AddressNameService = AddressNameService;
    ns.register("AddressNameService")
}(DIMP);
! function(ns) {
    var Callback = function() {};
    ns.Interface(Callback, null);
    Callback.prototype.onFinished = function(result, error) {
        console.assert(false, "implement me!")
    };
    ns.Callback = Callback;
    ns.register("Callback")
}(DIMP);
! function(ns) {
    var CompletionHandler = function() {};
    ns.Interface(CompletionHandler, null);
    CompletionHandler.prototype.onSuccess = function() {
        console.assert(false, "implement me!")
    };
    CompletionHandler.prototype.onFailed = function(error) {
        console.assert(false, "implement me!")
    };
    CompletionHandler.newHandler = function(onSuccess, onFailed) {
        var handler = new CompletionHandler();
        handler.onSuccess = onSuccess;
        handler.onFailed = onFailed;
        return handler
    };
    ns.CompletionHandler = CompletionHandler;
    ns.register("CompletionHandler")
}(DIMP);
! function(ns) {
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
    MessengerDelegate.prototype.sendPackage = function(data, handler) {
        console.assert(false, "implement me!");
        return false
    };
    ns.MessengerDelegate = MessengerDelegate;
    ns.register("MessengerDelegate")
}(DIMP);
! function(ns) {
    var KeyCache = ns.core.KeyCache;
    var KeyStore = function() {
        KeyCache.call(this);
        this.user = null
    };
    ns.Class(KeyStore, KeyCache, null);
    KeyStore.prototype.getUser = function() {
        return this.user
    };
    KeyStore.prototype.setUser = function(user) {
        if (this.user) {
            this.flush();
            if (this.user.equals(user)) {
                return
            }
        }
        if (!user) {
            this.user = null;
            return
        }
        this.user = user;
        var keys = this.loadKeys();
        if (keys) {
            this.updateKeys(keys)
        }
    };
    KeyStore.prototype.saveKeys = function(map) {
        return false
    };
    KeyStore.prototype.loadKeys = function() {
        return null
    };
    ns.KeyStore = KeyStore;
    ns.register("KeyStore")
}(DIMP);
! function(ns) {
    var NetworkType = ns.protocol.NetworkType;
    var ID = ns.ID;
    var Profile = ns.Profile;
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
    Facebook.prototype.verifyMeta = function(meta, identifier) {
        return meta.matches(identifier)
    };
    Facebook.prototype.saveMeta = function(meta, identifier) {
        console.assert(false, "implement me!");
        return false
    };
    Facebook.prototype.verifyProfile = function(profile, identifier) {
        if (identifier) {
            if (!profile || !identifier.equals(profile.getIdentifier())) {
                return false
            }
        } else {
            identifier = profile.getIdentifier();
            identifier = this.getIdentifier(identifier);
            if (!identifier) {
                throw Error("profile ID error: " + profile)
            }
        }
        var meta;
        if (identifier.isGroup()) {
            var members = this.getMembers(identifier);
            if (members) {
                var id;
                for (var i = 0; i < members.length; ++i) {
                    id = this.getIdentifier(members[i]);
                    meta = this.getMeta(id);
                    if (!meta) {
                        continue
                    }
                    if (profile.verify(meta.key)) {
                        return true
                    }
                }
            }
            var owner = this.getOwner(identifier);
            if (!owner) {
                if (NetworkType.Polylogue.equals(identifier.getType())) {
                    meta = this.getMeta(identifier)
                } else {
                    return false
                }
            } else {
                if (members && members.indexOf(owner) >= 0) {
                    return false
                } else {
                    meta = this.getMeta(owner)
                }
            }
        } else {
            meta = this.getMeta(identifier)
        }
        return meta && profile.verify(meta.key)
    };
    Facebook.prototype.saveProfile = function(profile, identifier) {
        console.assert(false, "implement me!");
        return false
    };
    Facebook.prototype.saveMembers = function(members, identifier) {
        console.assert(false, "implement me!");
        return false
    };
    Facebook.prototype.getLocalUsers = function() {
        console.assert(false, "implement me!");
        return null
    };
    Facebook.prototype.getCurrentUser = function() {
        var users = this.getLocalUsers();
        if (!users || users.length === 0) {
            return null
        }
        return users[0]
    };
    Facebook.prototype.createIdentifier = function(string) {
        return ID.getInstance(string)
    };
    Facebook.prototype.createUser = function(identifier) {
        if (identifier.isBroadcast()) {
            return new User(identifier)
        }
        var type = identifier.getType();
        if (NetworkType.Main.equals(type) || NetworkType.BTCMain.equals(type)) {
            return new User(identifier)
        }
        if (NetworkType.Robot.equals(type)) {
            return new Robot(identifier)
        }
        if (NetworkType.Station.equals(type)) {
            return new Station(identifier)
        }
        throw TypeError("Unsupported user type: " + type)
    };
    Facebook.prototype.createGroup = function(identifier) {
        if (identifier.isBroadcast()) {
            return new Group(identifier)
        }
        var type = identifier.getType();
        if (NetworkType.Polylogue.equals(type)) {
            return new Polylogue(identifier)
        }
        if (NetworkType.Chatroom.equals(type)) {
            return new Chatroom(identifier)
        }
        if (NetworkType.Provider.equals(type)) {
            return new ServiceProvider(identifier)
        }
        throw TypeError("Unsupported group type: " + type)
    };
    Facebook.prototype.getFounder = function(identifier) {
        var founder = Barrack.prototype.getFounder.call(this, identifier);
        if (founder) {
            return founder
        }
        var members = this.getMembers(identifier);
        if (members) {
            var gMeta = this.getMeta(identifier);
            if (gMeta) {
                var id;
                var meta;
                for (var i = 0; i < members.length; ++i) {
                    id = this.getIdentifier(members[i]);
                    meta = this.getMeta(id);
                    if (meta && meta.matches(meta.key)) {
                        return id
                    }
                }
            }
        }
        return null
    };
    Facebook.prototype.getOwner = function(identifier) {
        var owner = Barrack.prototype.getOwner.call(this, identifier);
        if (owner) {
            return owner
        }
        if (NetworkType.Polylogue.equals(identifier.getType())) {
            return this.getFounder(identifier)
        }
        return null
    };
    Facebook.prototype.isFounder = function(member, group) {
        var gMeta = this.getMeta(group);
        if (!gMeta) {
            throw Error("failed to get meta for group: " + group)
        }
        var mMeta = this.getMeta(member);
        if (!mMeta) {
            throw Error("failed to get meta for member: " + member)
        }
        return gMeta.matches(mMeta.key)
    };
    Facebook.prototype.isOwner = function(member, group) {
        if (NetworkType.Polylogue.equals(group.getType())) {
            return this.isFounder(member, group)
        }
        throw Error("only Polylogue so far")
    };
    Facebook.prototype.existsMember = function(member, group) {
        var list = this.getMembers(group);
        if (list && list.indexOf(member) >= 0) {
            return true
        }
        var owner = this.getOwner(group);
        if (owner) {
            owner = this.getIdentifier(owner);
            return owner.equals(member)
        } else {
            return false
        }
    };
    Facebook.prototype.getAssistants = function(group) {
        console.assert(false, "implement me!");
        return null
    };
    Facebook.prototype.existsAssistant = function(user, group) {
        var assistants = this.getAssistants(group);
        if (assistants) {
            return assistants.indexOf(user) >= 0
        }
        return false
    };
    ns.Facebook = Facebook;
    ns.register("Facebook")
}(DIMP);
! function(ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var EncryptKey = ns.crypto.EncryptKey;
    var Meta = ns.Meta;
    var Envelope = ns.Envelope;
    var InstantMessage = ns.InstantMessage;
    var ReliableMessage = ns.ReliableMessage;
    var FileContent = ns.protocol.FileContent;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var CompletionHandler = ns.CompletionHandler;
    var Transceiver = ns.core.Transceiver;
    var Facebook = ns.Facebook;
    var Messenger = function() {
        Transceiver.call(this);
        this.context = {};
        this.cpu = new ContentProcessor(this);
        this.delegate = null
    };
    ns.Class(Messenger, Transceiver, null);
    Messenger.prototype.getContext = function(key) {
        return this.context[key]
    };
    Messenger.prototype.setContext = function(key, value) {
        if (value) {
            this.context[key] = value
        } else {
            delete this.context[key]
        }
    };
    Messenger.prototype.getFacebook = function() {
        var facebook = this.getContext("facebook");
        if (!facebook && this.entityDelegate instanceof Facebook) {
            facebook = this.entityDelegate
        }
        return facebook
    };
    Messenger.prototype.select = function(receiver) {
        var facebook = this.getFacebook();
        var users = facebook.getLocalUsers();
        if (!users || users.length === 0) {
            throw Error("local users should not be empty")
        } else {
            if (receiver.isBroadcast()) {
                return users[0]
            }
        }
        if (receiver.isGroup()) {
            for (var i = 0; i < users.length; ++i) {
                if (facebook.existsMember(users[i].identifier, receiver)) {
                    return users[i]
                }
            }
        } else {
            for (var j = 0; j < users.length; ++j) {
                if (receiver.equals(users[j].identifier)) {
                    return users[j]
                }
            }
        }
        return null
    };
    var trim = function(msg) {
        var facebook = this.getFacebook();
        var receiver = msg.envelope.receiver;
        receiver = facebook.getIdentifier(receiver);
        var user = this.select(receiver);
        if (!user) {
            msg = null
        } else {
            if (receiver.isGroup()) {
                msg = msg.trim(user.identifier)
            }
        }
        return msg
    };
    Messenger.prototype.verifyMessage = function(rMsg) {
        var facebook = this.getFacebook();
        var sender = rMsg.envelope.sender;
        sender = facebook.getIdentifier(sender);
        var meta = Meta.getInstance(rMsg.getMeta());
        if (meta) {
            if (!facebook.saveMeta(meta, sender)) {
                throw Error("save meta error: " + sender + ", " + meta)
            }
        } else {
            meta = facebook.getMeta(sender);
            if (!meta) {
                this.suspendMessage(rMsg);
                return null
            }
        }
        return Transceiver.prototype.verifyMessage.call(this, rMsg)
    };
    Messenger.prototype.decryptMessage = function(sMsg) {
        var msg = trim.call(this, sMsg);
        if (!msg) {
            throw Error("receiver error:" + sMsg)
        }
        return Transceiver.prototype.decryptMessage.call(this, msg)
    };
    Messenger.prototype.serializeContent = function(content, pwd, iMsg) {
        var key = SymmetricKey.getInstance(pwd);
        if (content instanceof FileContent) {
            var data = content.getData();
            data = key.encrypt(data);
            var url = this.delegate.uploadData(data, iMsg);
            if (url) {
                content.setURL(url);
                content.setData(null)
            }
        }
        return Transceiver.prototype.serializeContent.call(this, content, key, iMsg)
    };
    Messenger.prototype.encryptKey = function(data, receiver, iMsg) {
        var facebook = this.getFacebook();
        receiver = facebook.getIdentifier(receiver);
        var key = facebook.getPublicKeyForEncryption(receiver);
        if (!key) {
            var meta = facebook.getMeta(receiver);
            if (!meta || !ns.Interface.conforms(meta.key, EncryptKey)) {
                this.suspendMessage(iMsg);
                return null
            }
        }
        return Transceiver.prototype.encryptKey.call(this, data, receiver, iMsg)
    };
    Messenger.prototype.deserializeContent = function(data, pwd, sMsg) {
        var key = SymmetricKey.getInstance(pwd);
        var content = Transceiver.prototype.deserializeContent.call(this, data, pwd, sMsg);
        if (!content) {
            throw Error("failed to deserialize message content: " + sMsg)
        }
        if (content instanceof FileContent) {
            var iMsg = InstantMessage.newMessage(content, sMsg.envelope);
            var fileData = this.delegate.downloadData(content.getURL(), iMsg);
            if (fileData) {
                content.setData(key.decrypt(fileData))
            } else {
                content.setPassword(key)
            }
        }
        return content
    };
    Messenger.prototype.sendContent = function(content, receiver, callback) {
        var facebook = this.getFacebook();
        var user = facebook.getCurrentUser();
        var env = Envelope.newEnvelope(user.identifier, receiver, 0);
        var iMsg = InstantMessage.newMessage(content, env);
        return this.sendMessage(iMsg, callback)
    };
    Messenger.prototype.sendMessage = function(msg, callback) {
        if (msg instanceof InstantMessage) {
            return send_instant_message.call(this, msg, callback)
        } else {
            if (msg instanceof ReliableMessage) {
                return send_reliable_message.call(this, msg, callback)
            } else {
                throw TypeError("message error: " + msg)
            }
        }
    };
    var send_instant_message = function(iMsg, callback) {
        var sMsg = this.encryptMessage(iMsg);
        if (!sMsg) {
            return false
        }
        var rMsg = this.signMessage(sMsg);
        if (!rMsg) {
            throw Error("failed to sign message: " + sMsg)
        }
        var ok = send_reliable_message.call(this, rMsg, callback);
        if (!this.saveMessage(iMsg)) {
            return false
        }
        return ok
    };
    var send_reliable_message = function(rMsg, callback) {
        var handler = CompletionHandler.newHandler(function() {
            callback.onFinished(rMsg, null)
        }, function(error) {
            callback.onFinished(error)
        });
        var data = this.serializeMessage(rMsg);
        return this.delegate.sendPackage(data, handler)
    };
    Messenger.prototype.saveMessage = function(iMsg) {
        console.assert(false, "implement me!");
        return false
    };
    Messenger.prototype.suspendMessage = function(msg) {
        console.assert(false, "implement me!");
        return false
    };
    Messenger.prototype.processPackage = function(data) {
        var rMsg = this.deserializeMessage(data);
        if (!rMsg) {
            return null
        }
        rMsg = this.processMessage(rMsg);
        if (!rMsg) {
            return null
        }
        return this.serializeMessage(rMsg)
    };
    Messenger.prototype.processMessage = function(rMsg) {
        var sMsg = this.verifyMessage(rMsg);
        if (!sMsg) {
            return null
        }
        sMsg = processSecure.call(this, sMsg, rMsg);
        if (!sMsg) {
            return null
        }
        return this.signMessage(sMsg)
    };
    var processSecure = function(sMsg, rMsg) {
        var iMsg = this.decryptMessage(sMsg);
        if (!iMsg) {
            return null
        }
        iMsg = processInstant.call(this, iMsg, rMsg);
        if (!iMsg) {
            return null
        }
        return this.encryptMessage(iMsg)
    };
    var processInstant = function(iMsg, rMsg) {
        var facebook = this.getFacebook();
        var content = iMsg.content;
        var env = iMsg.envelope;
        var sender = facebook.getIdentifier(env.sender);
        var res = this.processContent(content, sender, rMsg);
        if (!this.saveMessage(iMsg)) {
            return null
        }
        if (!res) {
            return null
        }
        var receiver = facebook.getIdentifier(env.receiver);
        var user = this.select(receiver);
        env = Envelope.newEnvelope(user.identifier, sender, 0);
        return InstantMessage.newMessage(res, env)
    };
    Messenger.prototype.processContent = function(content, sender, rMsg) {
        return this.cpu.process(content, sender, rMsg)
    };
    ns.Messenger = Messenger;
    ns.register("Messenger")
}(DIMP);
if (typeof FiniteStateMachine !== "object") {
    FiniteStateMachine = {}
}
if (typeof StarGate !== "object") {
    StarGate = {}
}! function(sg, fsm) {
    if (typeof StarGate.extensions !== "object") {
        sg.extensions = {}
    }
    if (typeof StarGate.network !== "object") {
        sg.network = {}
    }
    DIMP.Namespace(fsm);
    DIMP.Namespace(sg);
    DIMP.Namespace(sg.extensions);
    DIMP.Namespace(sg.network);
    sg.register("extensions");
    sg.register("network")
}(StarGate, FiniteStateMachine);
! function(ns) {
    var Delegate = function() {};
    DIMP.Interface(Delegate, null);
    Delegate.prototype.enterState = function(state, machine) {
        console.assert(false, "implement me!")
    };
    Delegate.prototype.exitState = function(state, machine) {
        console.assert(false, "implement me!")
    };
    Delegate.prototype.pauseState = function(state, machine) {};
    Delegate.prototype.resumeState = function(state, machine) {};
    ns.StateDelegate = Delegate;
    ns.register("StateDelegate")
}(FiniteStateMachine);
! function(ns) {
    var Transition = function(targetStateName) {
        this.target = targetStateName
    };
    DIMP.Class(Transition, DIMP.type.Object, null);
    Transition.prototype.evaluate = function(machine) {
        console.assert(false, "implement me!");
        return false
    };
    ns.Transition = Transition;
    ns.register("Transition")
}(FiniteStateMachine);
! function(ns) {
    var State = function() {
        this.transitions = []
    };
    DIMP.Class(State, DIMP.type.Object, null);
    State.prototype.addTransition = function(transition) {
        if (this.transitions.indexOf(transition) >= 0) {
            throw Error("transition exists: " + transition)
        }
        this.transitions.push(transition)
    };
    State.prototype.tick = function(machine) {
        var transition;
        for (var i = 0; i < this.transitions.length; ++i) {
            transition = this.transitions[i];
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
    ns.register("State")
}(FiniteStateMachine);
! function(ns) {
    var Status = DIMP.type.Enum(null, {
        Stopped: 0,
        Running: 1,
        Paused: 2
    });
    var Machine = function(defaultStateName) {
        this.defaultStateName = defaultStateName ? defaultStateName : "default";
        this.currentState = null;
        this.stateMap = {};
        this.status = Status.Stopped;
        this.delegate = null
    };
    DIMP.Class(Machine, DIMP.type.Object, null);
    Machine.prototype.addState = function(state, name) {
        this.stateMap[name] = state
    };
    Machine.prototype.changeState = function(name) {
        var state = this.currentState;
        if (state) {
            this.delegate.exitState(state, this);
            state.onExit(this)
        }
        state = this.stateMap[name];
        this.currentState = state;
        if (state) {
            this.delegate.enterState(state, this);
            state.onEnter(this)
        }
    };
    Machine.prototype.isRunning = function() {
        return this.status.equals(Status.Running)
    };
    Machine.prototype.tick = function() {
        if (this.isRunning()) {
            this.currentState.tick(this)
        }
    };
    Machine.prototype.start = function() {
        if (!this.status.equals(Status.Stopped) || this.currentState) {
            throw Error("FSM start error: " + this.status)
        }
        this.changeState(this.defaultStateName);
        this.status = Status.Running
    };
    Machine.prototype.stop = function() {
        if (this.status.equals(Status.Stopped) || !this.currentState) {
            throw Error("FSM stop error: " + this.status)
        }
        this.status = Status.Stopped;
        this.changeState(null)
    };
    Machine.prototype.pause = function() {
        if (!this.status.equals(Status.Running) || !this.currentState) {
            throw Error("FSM pause error: " + this.status)
        }
        this.delegate.pauseState(this.currentState, this);
        this.status = Status.Paused;
        this.currentState.onPause(this)
    };
    Machine.prototype.resume = function() {
        if (!this.status.equals(Status.Paused) || !this.currentState) {
            throw Error("FSM resume error: " + this.status)
        }
        this.delegate.resumeState(this.currentState, this);
        this.status = Status.Running;
        this.currentState.onResume(this)
    };
    ns.Machine = Machine;
    ns.register("Machine")
}(FiniteStateMachine);
! function(ns) {
    var Observer = function() {};
    DIMP.Interface(Observer, null);
    Observer.prototype.onReceiveNotification = function(notification) {
        console.assert(false, "implement me!")
    };
    ns.Observer = Observer;
    ns.register("Observer")
}(StarGate);
! function(ns) {
    var Notification = function(name, sender, userInfo) {
        this.name = name;
        this.sender = sender;
        this.userInfo = userInfo
    };
    DIMP.Class(Notification, DIMP.type.Object, null);
    ns.Notification = Notification;
    ns.register("Notification")
}(StarGate);
! function(ns) {
    var Notification = ns.Notification;
    var Observer = ns.Observer;
    var Center = function() {
        this.observerMap = {}
    };
    DIMP.Class(Center, DIMP.type.Object, null);
    Center.prototype.addObserver = function(observer, name) {
        var list = this.observerMap[name];
        if (list) {
            if (list.indexOf(observer) >= 0) {
                return
            }
        } else {
            list = [];
            this.observerMap[name] = list
        }
        list.push(observer)
    };
    Center.prototype.removeObserver = function(observer, name) {
        if (name) {
            var list = this.observerMap[name];
            if (list) {
                DIMP.type.Arrays.remove(list, observer)
            }
        } else {
            var names = Object.keys(this.observerMap);
            for (var i = 0; i < names.length; ++i) {
                this.removeObserver(observer, names[i])
            }
        }
    };
    Center.prototype.postNotification = function(notification, sender, userInfo) {
        if (typeof notification === "string") {
            notification = new Notification(notification, sender, userInfo)
        }
        var observers = this.observerMap[notification.name];
        if (!observers) {
            return
        }
        var obs;
        for (var i = 0; i < observers.length; ++i) {
            obs = observers[i];
            if (DIMP.Interface.conforms(obs, Observer)) {
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
    ns.register("NotificationCenter")
}(StarGate);
! function(ns) {
    var Storage = function(storage, prefix) {
        this.storage = storage;
        if (prefix) {
            this.ROOT = prefix
        } else {
            this.ROOT = "dim"
        }
    };
    DIMP.Class(Storage, DIMP.type.Object, null);
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
        return DIMP.format.Base64.decode(base64)
    };
    Storage.prototype.loadJSON = function(path) {
        var json = this.loadText(path);
        if (!json) {
            return null
        }
        return DIMP.format.JSON.decode(json)
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
            base64 = DIMP.format.Base64.encode(data)
        }
        return this.saveText(base64, path)
    };
    Storage.prototype.saveJSON = function(container, path) {
        var json = null;
        if (container) {
            json = DIMP.format.JSON.encode(container);
            json = DIMP.format.UTF8.decode(json)
        }
        return this.saveText(json, path)
    };
    ns.LocalStorage = new Storage(window.localStorage, "dim.fs");
    ns.SessionStorage = new Storage(window.sessionStorage, "dim.mem");
    ns.register("LocalStorage");
    ns.register("SessionStorage")
}(StarGate);
! function(ns) {
    var Delegate = function() {};
    DIMP.Interface(Delegate, null);
    Delegate.prototype.onReceived = function(response, star) {
        console.assert(false, "implement me!")
    };
    Delegate.prototype.onStatusChanged = function(status, star) {
        console.assert(false, "implement me!")
    };
    Delegate.prototype.onSent = function(request, error, star) {
        console.assert(false, "implement me!")
    };
    var Status = DIMP.type.Enum(null, {
        Error: -1,
        Init: 0,
        Connecting: 1,
        Connected: 2
    });
    ns.StarDelegate = Delegate;
    ns.StarStatus = Status;
    ns.register("StarDelegate");
    ns.register("StarStatus")
}(StarGate);
! function(ns) {
    var Star = function() {};
    DIMP.Interface(Star, null);
    Star.prototype.getStatus = function() {
        console.assert(false, "implement me!");
        return null
    };
    Star.prototype.launch = function(options) {
        console.assert(false, "implement me!")
    };
    Star.prototype.terminate = function() {
        console.assert(false, "implement me!")
    };
    Star.prototype.pause = function(options) {};
    Star.prototype.resume = function(options) {};
    Star.prototype.send = function(payload, delegate) {
        console.assert(false, "implement me!")
    };
    ns.Star = Star;
    ns.register("Star")
}(StarGate);
! function(ns) {
    var Task = function(data, delegate) {
        this.data = data;
        this.delegate = delegate;
        this.star = null
    };
    DIMP.Class(Task, DIMP.type.Object, null);
    Task.prototype.onResponse = function(data) {
        this.delegate.onReceived(data)
    };
    Task.prototype.onSuccess = function() {
        this.delegate.onSent(this.data, null, this.star)
    };
    Task.prototype.onError = function(error) {
        this.delegate.onSent(this.data, error, this.star)
    };
    ns.extensions.Task = Task;
    ns.extensions.register("Task")
}(StarGate);
! function(ns) {
    var Task = ns.extensions.Task;
    var StarStatus = ns.StarStatus;
    var Star = ns.Star;
    var Fence = function(delegate) {
        this.delegate = delegate;
        this.status = StarStatus.Init;
        this.waitingList = []
    };
    DIMP.Class(Fence, DIMP.type.Object, [Star]);
    Fence.prototype.onReceived = function(data) {
        this.delegate.onReceived(data, this)
    };
    Fence.prototype.getStatus = function() {
        return this.status
    };
    Fence.prototype.setStatus = function(status) {
        if (status.equals(this.status)) {
            return
        }
        this.delegate.onStatusChanged(status, this);
        this.status = status
    };
    Fence.prototype.getTask = function() {
        if (this.waitingList.length === 0) {
            return null
        }
        return this.waitingList.shift()
    };
    Fence.prototype.connect = function(host, port) {
        console.assert(false, "implement me!")
    };
    Fence.prototype.disconnect = function() {
        console.assert(false, "implement me!")
    };
    Fence.prototype.isConnected = function() {
        return this.status.equals(StarStatus.Connected)
    };
    Fence.prototype.onConnected = function() {
        this.setStatus(StarStatus.Connected)
    };
    Fence.prototype.onClosed = function() {
        this.setStatus(StarStatus.Init)
    };
    Fence.prototype.onError = function(error) {
        this.setStatus(StarStatus.Error)
    };
    Fence.prototype.onReceived = function(data) {
        this.delegate.onReceived(data, this)
    };
    Fence.prototype.launch = function(options) {
        this.disconnect();
        this.setStatus(StarStatus.Connecting);
        var host = options["host"];
        var port = options["port"];
        this.connect(host, port)
    };
    Fence.prototype.terminate = function() {
        this.disconnect();
        this.setStatus(StarStatus.Init)
    };
    Fence.prototype.send = function(data, delegate) {
        var task = new Task(data, delegate);
        task.star = this;
        this.waitingList.push(task)
    };
    ns.extensions.Fence = Fence;
    ns.extensions.register("Fence")
}(StarGate);
! function(ns) {
    var Fence = ns.extensions.Fence;
    var SocketClient = function(delegate) {
        Fence.call(this, delegate);
        this.ws = null
    };
    DIMP.Class(SocketClient, Fence, null);
    SocketClient.prototype.connect = function(host, port) {
        var protocol = "ws";
        if ("https" === window.location.protocol.split(":")[0]) {
            protocol = "wss"
        }
        var url = protocol + "://" + host + ":" + port;
        var ws = new WebSocket(url);
        ws.client = this;
        ws.onopen = function(ev) {
            this.client.onConnected()
        };
        ws.onclose = function(ev) {
            this.client.onClosed()
        };
        ws.onerror = function(ev) {
            var error = new Error("ws error: " + ev);
            this.client.onError(error)
        };
        ws.onmessage = function(ev) {
            this.client.onReceived(ev.data)
        };
        this.ws = ws
    };
    SocketClient.prototype.disconnect = function() {
        if (!this.ws) {
            return
        }
        this.ws.close();
        this.ws = null
    };
    SocketClient.prototype.onConnected = function() {
        Fence.prototype.onConnected.call(this);
        var task;
        while (true) {
            task = this.getTask();
            if (!task) {
                break
            }
            this.ws.send(task.data);
            if (task.delegate) {
                task.delegate.onSent(task.data, null, this)
            }
        }
    };
    SocketClient.prototype.send = function(data, delegate) {
        if (this.isConnected()) {
            this.ws.send(data);
            if (delegate) {
                delegate.onSent(data, null, this)
            }
        } else {
            Fence.prototype.send.call(this, data, delegate)
        }
    };
    ns.extensions.SocketClient = SocketClient;
    ns.extensions.register("SocketClient")
}(StarGate);
! function(ns) {
    var Host = function(ip, port, data) {
        this.ip = ip;
        this.port = port;
        this.data = data
    };
    DIMP.Class(Host, DIMP.type.Object, null);
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
    ns.network.Host = Host;
    ns.network.register("Host")
}(StarGate);
! function(ns) {
    var Host = ns.network.Host;
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
                throw URIError("IP data empty: " + data + ", " + ip + ", " + port)
            }
        }
        Host.call(this, ip, port, data)
    };
    DIMP.Class(IPv4, Host, null);
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
    ns.network.IPv4 = IPv4;
    ns.network.register("IPv4")
}(StarGate);
! function(ns) {
    var Host = ns.network.Host;
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
                        throw URIError("IPv6 format error: " + ip)
                    }
                }
            } else {
                throw URIError("IP data empty: " + data + ", " + ip + ", " + port)
            }
        }
        Host.call(this, ip, port, data)
    };
    DIMP.Class(IPv6, Host, null);
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
    ns.network.IPv6 = IPv6;
    ns.network.register("IPv6")
}(StarGate);
if (typeof DIMP.fsm !== "object") {
    DIMP.fsm = {}
}
FiniteStateMachine.exports(DIMP.fsm);
if (typeof DIMP.stargate !== "object") {
    DIMP.stargate = {}
}
StarGate.exports(DIMP.stargate);
! function(ns) {
    var DecryptKey = ns.crypto.DecryptKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var ID = ns.ID;
    var Meta = ns.Meta;
    var Profile = ns.Profile;
    var User = ns.User;
    var HULK = ID.getInstance("hulk@4YeVEN3aUnvC1DNUufCq1bs9zoBSJTzVEj");
    var MOKI = ID.getInstance("moki@4WDfe3zZ4T7opFSi3iDAKiuTnUHjxmXekk");
    var accounts = {
        "hulk": {
            meta: {
                "version": 1,
                "key": {
                    "algorithm": "RSA",
                    "data": "-----BEGIN PUBLIC KEY-----\nMIGJAoGBALB+vbUK48UU9rjlgnohQowME+3JtTb2hLPqtatVOW364/EKFq0/PSdnZVE9V2Zq+pbX7dj3nCS4pWnYf40ELH8wuDm0Tc4jQ70v4LgAcdy3JGTnWUGiCsY+0Z8kNzRkm3FJid592FL7ryzfvIzB9bjg8U2JqlyCVAyUYEnKv4lDAgMBAAE=\n-----END PUBLIC KEY-----",
                    "mode": "ECB",
                    "padding": "PKCS1",
                    "digest": "SHA256"
                },
                "seed": "hulk",
                "fingerprint": "jIPGWpWSbR/DQH6ol3t9DSFkYroVHQDvtbJErmFztMUP2DgRrRSNWuoKY5Y26qL38wfXJQXjYiWqNWKQmQe/gK8M8NkU7lRwm+2nh9wSBYV6Q4WXsCboKbnM0+HVn9Vdfp21hMMGrxTX1pBPRbi0567ZjNQC8ffdW2WvQSoec2I="
            },
            profile: {
                "ID": "hulk@4YeVEN3aUnvC1DNUufCq1bs9zoBSJTzVEj",
                "names": ["无敌浩克", "Immortal Hulk"]
            },
            secret: {
                "algorithm": "RSA",
                "data": "-----BEGIN RSA PRIVATE KEY-----\nMIICXQIBAAKBgQCwfr21CuPFFPa45YJ6IUKMDBPtybU29oSz6rWrVTlt+uPxChatPz0nZ2VRPVdmavqW1+3Y95wkuKVp2H+NBCx/MLg5tE3OI0O9L+C4AHHctyRk51lBogrGPtGfJDc0ZJtxSYnefdhS+68s37yMwfW44PFNiapcglQMlGBJyr+JQwIDAQABAoGAVc0HhJ/KouDSIIjSqXTJ2TN17L+GbTXixWRw9N31kVXKwj9ZTtfTbviA9MGRX6TaNcK7SiL1sZRiNdaeC3vf9RaUe3lV3aR/YhxuZ5bTQNHPYqJnbbwsQkp4IOwSWqOMCfsQtP8O+2DPjC8Jx7PPtOYZ0sC5esMyDUj/EDv+HUECQQDXsPlTb8BAlwWhmiAUF8ieVENR0+0EWWU5HV+dp6Mz5gf47hCO9yzZ76GyBM71IEQFdtyZRiXlV9CBOLvdlbqLAkEA0XqONVaW+nNTNtlhJVB4qAeqpj/foJoGbZhjGorBpJ5KPfpD5BzQgsoT6ocv4vOIzVjAPdk1lE0ACzaFpEgbKQJBAKDLjUO3ZrKAI7GSreFszaHDHaCuBd8dKcoHbNWiOJejIERibbO27xfVfkyxKvwwvqT4NIKLegrciVMcUWliivsCQQCiA1Z/XEQS2iUO89tVn8JhuuQ6Boav0NCN7OEhQxX3etFS0/+0KrD9psr2ha38qnwwzaaJbzgoRdF12qpL39TZAkBPv2lXFNsn0/Jq3cUemof+5sm53KvtuLqxmZfZMAuTSIbB+8i05JUVIc+mcYqTqGp4FDfz6snzt7sMBQdx6BZY\n-----END RSA PRIVATE KEY-----",
                "mode": "ECB",
                "padding": "PKCS1",
                "digest": "SHA256"
            }
        },
        "moki": {
            meta: {
                "version": 1,
                "key": {
                    "algorithm": "RSA",
                    "data": "-----BEGIN PUBLIC KEY-----\nMIGJAoGBALQOcgxhhV0XiHELKYdG587Tup261qQ3ahAGPuifZvxHXTq+GgulEyXiovwrVjpz7rKXn+16HgspLHpp5agv0WsSn6k2MnQGk5RFXuilbFr/C1rEX2X7uXlUXDMpsriKFndoB1lz9P3E8FkM5ycG84hejcHB+R5yzDa4KbGeOc0tAgMBAAE=\n-----END PUBLIC KEY-----",
                    "mode": "ECB",
                    "padding": "PKCS1",
                    "digest": "SHA256"
                },
                "seed": "moki",
                "fingerprint": "ld68TnzYqzFQMxeJ6N+aZa2jRf9d4zVx4BUiBlmur67ne8YZF08plhCiIhfyYDIwwW7KLaAHvK8gJbp0pPIzLR4bhzu6zRpDLzUQsq6bXgMp+WAiZtFm6IHWNUwUEYcr3iSvTn5L1HunRt7kBglEjv8RKtbNcK0t1Xto375kMlo="
            },
            profile: {
                "ID": "moki@4WDfe3zZ4T7opFSi3iDAKiuTnUHjxmXekk",
                "names": ["齐天大圣", "Monkey King"]
            },
            secret: {
                "algorithm": "RSA",
                "data": "-----BEGIN RSA PRIVATE KEY-----\nMIICXQIBAAKBgQC0DnIMYYVdF4hxCymHRufO07qdutakN2oQBj7on2b8R106vhoLpRMl4qL8K1Y6c+6yl5/teh4LKSx6aeWoL9FrEp+pNjJ0BpOURV7opWxa/wtaxF9l+7l5VFwzKbK4ihZ3aAdZc/T9xPBZDOcnBvOIXo3Bwfkecsw2uCmxnjnNLQIDAQABAoGADi5wFaENsbgTh0HHjs/LHKto8JjhZHQ33pS7WjOJ1zdgtKp53y5sfGimCSH5q+drJrZSApCCcsMWrXqPO8iuX/QPak72yzTuq9MEn4tusO/5w8/g/csq+RUhlLHLdOrPfVciMBXgouT8BB6UMa0e/g8K/7JBV8v1v59ZUccSSwkCQQD67yI6uSlgy1/NWqMENpGc9tDDoZPR2zjfrXquJaUcih2dDzEbhbzHxjoScGaVcTOx/Aiu00dAutoN+Jpovpq1AkEAt7EBRCarVdo4YKKNnW3cZQ7u0taPgvc/eJrXaWES9+MpC/NZLnQNF/NZlU9/H2607/d+Xaac6wtxkIQ7O61bmQJBAOUTMThSmIeYoZiiSXcrKbsVRneRJZTKgB0SDZC1JQnsvCQJHld1u2TUfWcf3UZH1V2CK5sNnVpmOXHPpYZBmpECQBp1hJkseMGFDVneEEf86yIjZIM6JLHYq2vT4fNr6C+MqPzvsIjgboJkqyK2sLj2WVm3bJxQw4mXvGP0qBOQhQECQQCOepIyFl/a/KmjVZ5dvmU2lcHXkqrvjcAbpyO1Dw6p2OFCBTTQf3QRmCoys5/dyBGLDhRzV5Obtg6Fll/caLXs\n-----END RSA PRIVATE KEY-----",
                "mode": "ECB",
                "padding": "PKCS1",
                "digest": "SHA256"
            }
        }
    };
    var UserDataSource = ns.UserDataSource;
    var Immortals = function() {
        this.idMap = {};
        this.privateKeyMap = {};
        this.metaMap = {};
        this.profileMap = {};
        this.userMap = {};
        load_account.call(this, HULK);
        load_account.call(this, MOKI)
    };
    ns.Class(Immortals, ns.type.Object, [UserDataSource]);
    var load_account = function(identifier) {
        this.idMap[identifier.toString()] = identifier;
        this.metaMap[identifier] = load_meta.call(this, identifier);
        this.privateKeyMap[identifier] = load_private_key.call(this, identifier);
        this.profileMap[identifier] = load_profile.call(this, identifier)
    };
    var load_meta = function(identifier) {
        var info = accounts[identifier.name];
        if (!info) {
            return null
        }
        return Meta.getInstance(info["meta"])
    };
    var load_private_key = function(identifier) {
        var info = accounts[identifier.name];
        if (!info) {
            return null
        }
        return PrivateKey.getInstance(info["secret"])
    };
    var load_profile = function(identifier) {
        var info = accounts[identifier.name];
        if (!info) {
            return null
        }
        var dict = info["profile"];
        var profile = Profile.getInstance(dict);
        if (!profile) {
            return null
        }
        var name = dict["name"];
        if (name) {
            profile.setProperty("name", name)
        } else {
            var names = dict["names"];
            if (names instanceof Array && names.length > 0) {
                profile.setProperty("name", names[0])
            }
        }
        var avatar = dict["avatar"];
        if (avatar) {
            profile.setProperty("avatar", avatar)
        } else {
            var photos = dict["photos"];
            if (photos instanceof Array && photos.length > 0) {
                profile.setProperty("avatar", photos[0])
            }
        }
        var key = this.getPrivateKeyForSignature(identifier);
        if (key) {
            profile.sign(key)
        } else {
            throw Error("failed to get private key to sign profile for user: " + identifier)
        }
        return profile
    };
    Immortals.prototype.getIdentifier = function(string) {
        if (!string) {
            return null
        } else {
            if (string instanceof ID) {
                return string
            }
        }
        return this.idMap[string]
    };
    Immortals.prototype.getUser = function(identifier) {
        var user = this.userMap[identifier];
        if (!user) {
            if (this.idMap[identifier.toString()]) {
                user = new User(identifier);
                user.delegate = this;
                this.userMap[identifier] = user
            }
        }
        return user
    };
    Immortals.prototype.getMeta = function(identifier) {
        return this.metaMap[identifier]
    };
    Immortals.prototype.getProfile = function(identifier) {
        return this.profileMap[identifier]
    };
    Immortals.prototype.getContacts = function(identifier) {
        if (!this.idMap[identifier.toString()]) {
            return null
        }
        var contacts = [];
        var list = Object.keys(this.idMap);
        var item;
        for (var i = 0; i < list.length; ++i) {
            item = list[i];
            if (item.equals(identifier)) {
                continue
            }
            contacts.push(item)
        }
        return contacts
    };
    Immortals.prototype.getPublicKeyForEncryption = function(identifier) {
        return null
    };
    Immortals.prototype.getPublicKeysForVerification = function(identifier) {
        return null
    };
    Immortals.prototype.getPrivateKeysForDecryption = function(identifier) {
        var key = this.privateKeyMap[identifier];
        if (key && ns.Interface.conforms(key, DecryptKey)) {
            return [key]
        }
        return null
    };
    Immortals.prototype.getPrivateKeyForSignature = function(identifier) {
        return this.privateKeyMap[identifier]
    };
    Immortals.HULK = HULK;
    Immortals.MOKI = MOKI;
    ns.Immortals = Immortals
}(DIMP);
