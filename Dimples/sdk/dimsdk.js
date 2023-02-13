/**
 *  DIM-SDK (v0.2.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Jun. 20, 2022
 * @copyright (c) 2022 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof MONKEY !== "object") {
    MONKEY = {};
}
(function (ns) {
    var namespacefy = function (space) {
        space.__all__ = [];
        space.registers = namespace.prototype.registers;
        space.exports = namespace.prototype.exports;
        return space;
    };
    var is_space = function (space) {
        if (space instanceof namespace) {
            return true;
        }
        if (typeof space.exports !== "function") {
            return false;
        }
        if (typeof space.registers !== "function") {
            return false;
        }
        return space.__all__ instanceof Array;
    };
    var namespace = function () {
        this.__all__ = [];
    };
    namespace.prototype.registers = function (name) {
        if (this.__all__.indexOf(name) < 0) {
            this.__all__.push(name);
        }
    };
    namespace.prototype.exports = function (to) {
        var names = this.__all__;
        var name;
        for (var i = 0; i < names.length; ++i) {
            name = names[i];
            export_one(this, to, name);
            to.registers(name);
        }
        return to;
    };
    var export_one = function (from, to, name) {
        var source = from[name];
        var target = to[name];
        if (source === target) {
        } else {
            if (typeof target === "undefined") {
                to[name] = source;
            } else {
                if (is_space(source)) {
                    if (!is_space(target)) {
                        namespacefy(target);
                    }
                    source.exports(target);
                } else {
                    export_all(source, target);
                }
            }
        }
    };
    var export_all = function (from, to) {
        var names = Object.getOwnPropertyNames(from);
        for (var i = 0; i < names.length; ++i) {
            export_one(from, to, names[i]);
        }
    };
    ns.Namespace = namespace;
    namespacefy(ns);
    ns.registers("Namespace");
})(MONKEY);
(function (ns) {
    if (typeof ns.assert !== "function") {
        ns.assert = console.assert;
    }
    if (typeof ns.type !== "object") {
        ns.type = new ns.Namespace();
    }
    if (typeof ns.format !== "object") {
        ns.format = new ns.Namespace();
    }
    if (typeof ns.digest !== "object") {
        ns.digest = new ns.Namespace();
    }
    if (typeof ns.crypto !== "object") {
        ns.crypto = new ns.Namespace();
    }
    ns.registers("type");
    ns.registers("format");
    ns.registers("digest");
    ns.registers("crypto");
})(MONKEY);
(function (ns) {
    var conforms = function (object, protocol) {
        if (!object) {
            return false;
        } else {
            if (object instanceof protocol) {
                return true;
            }
        }
        return check_class(object.constructor, protocol);
    };
    var check_class = function (child, protocol) {
        var interfaces = child._mk_interfaces;
        if (!interfaces) {
            return false;
        } else {
            if (check_interfaces(interfaces, protocol)) {
                return true;
            }
        }
        var parent = child._mk_parent;
        return parent && check_class(parent, protocol);
    };
    var check_interfaces = function (interfaces, protocol) {
        var child, parents;
        for (var i = 0; i < interfaces.length; ++i) {
            child = interfaces[i];
            if (child === protocol) {
                return true;
            }
            parents = child._mk_parents;
            if (parents && check_interfaces(parents, protocol)) {
                return true;
            }
        }
        return false;
    };
    var get_interfaces = function (interfaces) {
        if (!interfaces) {
            return [];
        } else {
            if (interfaces instanceof Array) {
                return interfaces;
            } else {
                return [interfaces];
            }
        }
    };
    var set_functions = function (child, functions) {
        if (functions) {
            var names = Object.getOwnPropertyNames(functions);
            var key, fn;
            for (var idx = 0; idx < names.length; ++idx) {
                key = names[idx];
                if (key === "constructor") {
                    continue;
                }
                fn = functions[key];
                if (typeof fn === "function") {
                    child.prototype[key] = fn;
                }
            }
        }
        return child;
    };
    var interfacefy = function (child, parents) {
        if (!child) {
            child = function () {};
        }
        child._mk_parents = get_interfaces(parents);
        return child;
    };
    interfacefy.conforms = conforms;
    var classify = function (child, parent, interfaces, functions) {
        if (!child) {
            child = function () {};
        }
        if (parent) {
            child._mk_parent = parent;
        } else {
            parent = Object;
        }
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
        child._mk_interfaces = get_interfaces(interfaces);
        set_functions(child, functions);
        return child;
    };
    ns.Interface = interfacefy;
    ns.Class = classify;
    ns.registers("Interface");
    ns.registers("Class");
})(MONKEY);
(function (ns) {
    var is_null = function (object) {
        if (typeof object === "undefined") {
            return true;
        } else {
            return object === null;
        }
    };
    var is_base_type = function (object) {
        var t = typeof object;
        if (
            t === "string" ||
            t === "number" ||
            t === "boolean" ||
            t === "function"
        ) {
            return true;
        }
        if (object instanceof String) {
            return true;
        }
        if (object instanceof Number) {
            return true;
        }
        if (object instanceof Boolean) {
            return true;
        }
        if (object instanceof Date) {
            return true;
        }
        if (object instanceof RegExp) {
            return true;
        }
        return object instanceof Error;
    };
    var IObject = function () {};
    ns.Interface(IObject, null);
    IObject.prototype.equals = function (other) {
        ns.assert(false, "implement me!");
        return false;
    };
    IObject.prototype.valueOf = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    IObject.isNull = is_null;
    IObject.isBaseType = is_base_type;
    var BaseObject = function () {
        Object.call(this);
    };
    ns.Class(BaseObject, Object, [IObject], {
        equals: function (other) {
            return this === other;
        }
    });
    ns.type.Object = IObject;
    ns.type.BaseObject = BaseObject;
    ns.type.registers("Object");
    ns.type.registers("BaseObject");
})(MONKEY);
(function (ns) {
    var is_array = function (obj) {
        if (obj instanceof Array) {
            return true;
        } else {
            if (obj instanceof Uint8Array) {
                return true;
            } else {
                if (obj instanceof Int8Array) {
                    return true;
                } else {
                    if (obj instanceof Uint8ClampedArray) {
                        return true;
                    } else {
                        if (obj instanceof Uint16Array) {
                            return true;
                        } else {
                            if (obj instanceof Int16Array) {
                                return true;
                            } else {
                                if (obj instanceof Uint32Array) {
                                    return true;
                                } else {
                                    if (obj instanceof Int32Array) {
                                        return true;
                                    } else {
                                        if (obj instanceof Float32Array) {
                                            return true;
                                        } else {
                                            if (obj instanceof Float64Array) {
                                                return true;
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
        return false;
    };
    var arrays_equal = function (array1, array2) {
        if (array1.length !== array2.length) {
            return false;
        }
        for (var i = 0; i < array1.length; ++i) {
            if (!objects_equal(array1[i], array2[i])) {
                return false;
            }
        }
        return true;
    };
    var maps_equal = function (dict1, dict2) {
        var keys1 = Object.keys(dict1);
        var keys2 = Object.keys(dict2);
        var len1 = keys1.length;
        var len2 = keys2.length;
        if (len1 !== len2) {
            return false;
        }
        var k;
        for (var i = 0; i < len1; ++i) {
            k = keys1[i];
            if (keys2.indexOf(k) < 0) {
                return false;
            }
            if (!objects_equal(dict1[k], dict2[k])) {
                return false;
            }
        }
        return true;
    };
    var objects_equal = function (obj1, obj2) {
        if (obj1 === obj2) {
            return true;
        } else {
            if (!obj1) {
                return !obj2;
            } else {
                if (!obj2) {
                    return false;
                } else {
                    if (typeof obj1["equals"] === "function") {
                        return obj1.equals(obj2);
                    } else {
                        if (typeof obj2["equals"] === "function") {
                            return obj2.equals(obj1);
                        } else {
                            if (ns.type.Object.isBaseType(obj1)) {
                                return obj1 === obj2;
                            } else {
                                if (ns.type.Object.isBaseType(obj2)) {
                                    return false;
                                } else {
                                    if (is_array(obj1)) {
                                        return is_array(obj2) && arrays_equal(obj1, obj2);
                                    } else {
                                        if (is_array(obj2)) {
                                            return false;
                                        } else {
                                            return maps_equal(obj1, obj2);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    var copy_items = function (src, srcPos, dest, destPos, length) {
        if (srcPos !== 0 || length !== src.length) {
            src = src.subarray(srcPos, srcPos + length);
        }
        dest.set(src, destPos);
    };
    var insert_item = function (array, index, item) {
        if (index < 0) {
            index += array.length + 1;
            if (index < 0) {
                return false;
            }
        }
        if (index === 0) {
            array.unshift(item);
        } else {
            if (index === array.length) {
                array.push(item);
            } else {
                if (index > array.length) {
                    array[index] = item;
                } else {
                    array.splice(index, 0, item);
                }
            }
        }
        return true;
    };
    var update_item = function (array, index, item) {
        if (index < 0) {
            index += array.length;
            if (index < 0) {
                return false;
            }
        }
        array[index] = item;
        return true;
    };
    var remove_item = function (array, item) {
        var index = array.indexOf(item);
        if (index < 0) {
            return false;
        } else {
            if (index === 0) {
                array.shift();
            } else {
                if (index + 1 === array.length) {
                    array.pop();
                } else {
                    array.splice(index, 1);
                }
            }
        }
        return true;
    };
    ns.type.Arrays = {
        insert: insert_item,
        update: update_item,
        remove: remove_item,
        equals: objects_equal,
        isArray: is_array,
        copy: copy_items
    };
    ns.type.registers("Arrays");
})(MONKEY);
(function (ns) {
    var BaseObject = ns.type.BaseObject;
    var enumify = function (enumeration, elements) {
        if (!enumeration) {
            enumeration = function (value, alias) {
                Enum.call(this, value, alias);
            };
        }
        ns.Class(enumeration, Enum, null, null);
        var e, v;
        for (var name in elements) {
            if (!elements.hasOwnProperty(name)) {
                continue;
            }
            v = elements[name];
            if (v instanceof Enum) {
                v = v.__value;
            } else {
                if (typeof v !== "number") {
                    throw new TypeError("Enum value must be a number!");
                }
            }
            e = new enumeration(v, name);
            enumeration[name] = e;
        }
        return enumeration;
    };
    var get_alias = function (enumeration, value) {
        var e;
        for (var k in enumeration) {
            if (!enumeration.hasOwnProperty(k)) {
                continue;
            }
            e = enumeration[k];
            if (e instanceof enumeration) {
                if (e.equals(value)) {
                    return e.__alias;
                }
            }
        }
        return null;
    };
    var Enum = function (value, alias) {
        BaseObject.call(this);
        if (!alias) {
            if (value instanceof Enum) {
                alias = value.__alias;
            } else {
                alias = get_alias(this.constructor, value);
            }
        }
        if (value instanceof Enum) {
            value = value.__value;
        }
        this.__value = value;
        this.__alias = alias;
    };
    ns.Class(Enum, BaseObject, null, null);
    Enum.prototype.equals = function (other) {
        if (!other) {
            return !this.__value;
        } else {
            if (other instanceof Enum) {
                return this.__value === other.valueOf();
            } else {
                return this.__value === other;
            }
        }
    };
    Enum.prototype.valueOf = function () {
        return this.__value;
    };
    Enum.prototype.toString = function () {
        return "<" + this.__alias.toString() + ": " + this.__value.toString() + ">";
    };
    ns.type.Enum = enumify;
    ns.type.registers("Enum");
})(MONKEY);
(function (ns) {
    var Stringer = function () {};
    ns.Interface(Stringer, [ns.type.Object]);
    Stringer.prototype.equalsIgnoreCase = function (other) {
        ns.assert(false, "implement me!");
        return false;
    };
    Stringer.prototype.toString = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Stringer.prototype.getLength = function () {
        ns.assert(false, "implement me!");
        return 0;
    };
    ns.type.Stringer = Stringer;
    ns.type.registers("Stringer");
})(MONKEY);
(function (ns) {
    var BaseObject = ns.type.BaseObject;
    var Stringer = ns.type.Stringer;
    var ConstantString = function (str) {
        BaseObject.call(this);
        if (!str) {
            str = "";
        } else {
            if (ns.Interface.conforms(str, Stringer)) {
                str = str.toString();
            }
        }
        this.__string = str;
    };
    ns.Class(ConstantString, BaseObject, [Stringer], null);
    ConstantString.prototype.equals = function (other) {
        if (BaseObject.prototype.equals.call(this, other)) {
            return true;
        } else {
            if (!other) {
                return !this.__string;
            } else {
                if (ns.Interface.conforms(other, Stringer)) {
                    return this.__string === other.toString();
                } else {
                    return this.__string === other;
                }
            }
        }
    };
    ConstantString.prototype.equalsIgnoreCase = function (other) {
        if (this.equals(other)) {
            return true;
        } else {
            if (!other) {
                return !this.__string;
            } else {
                if (ns.Interface.conforms(other, Stringer)) {
                    return equalsIgnoreCase(this.__string, other.toString());
                } else {
                    return equalsIgnoreCase(this.__string, other);
                }
            }
        }
    };
    var equalsIgnoreCase = function (str1, str2) {
        if (str1.length !== str2.length) {
            return false;
        }
        var low1 = str1.toLowerCase();
        var low2 = str2.toLowerCase();
        return low1 === low2;
    };
    ConstantString.prototype.valueOf = function () {
        return this.__string;
    };
    ConstantString.prototype.toString = function () {
        return this.__string;
    };
    ConstantString.prototype.getLength = function () {
        return this.__string.length;
    };
    ns.type.ConstantString = ConstantString;
    ns.type.registers("ConstantString");
})(MONKEY);
(function (ns) {
    var Mapper = function () {};
    ns.Interface(Mapper, [ns.type.Object]);
    Mapper.prototype.getValue = function (key) {
        ns.assert(false, "implement me!");
        return null;
    };
    Mapper.prototype.setValue = function (key, value) {
        ns.assert(false, "implement me!");
    };
    Mapper.prototype.removeValue = function (key) {
        ns.assert(false, "implement me!");
        return null;
    };
    Mapper.prototype.allKeys = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Mapper.prototype.toMap = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Mapper.prototype.copyMap = function (deepCopy) {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.type.Mapper = Mapper;
    ns.type.registers("Mapper");
})(MONKEY);
(function (ns) {
    var BaseObject = ns.type.BaseObject;
    var Mapper = ns.type.Mapper;
    var Dictionary = function (dict) {
        BaseObject.call(this);
        if (!dict) {
            dict = {};
        } else {
            if (ns.Interface.conforms(dict, Mapper)) {
                dict = dict.toMap();
            }
        }
        this.__dictionary = dict;
    };
    ns.Class(Dictionary, BaseObject, [Mapper], null);
    Dictionary.prototype.equals = function (other) {
        if (BaseObject.prototype.equals.call(this, other)) {
            return true;
        } else {
            if (!other) {
                return !this.__dictionary;
            } else {
                if (ns.Interface.conforms(other, Mapper)) {
                    return ns.type.Arrays.equals(this.__dictionary, other.toMap());
                } else {
                    return ns.type.Arrays.equals(this.__dictionary, other);
                }
            }
        }
    };
    Dictionary.prototype.valueOf = function () {
        return this.__dictionary;
    };
    Dictionary.prototype.getValue = function (key) {
        return this.__dictionary[key];
    };
    Dictionary.prototype.setValue = function (key, value) {
        if (value) {
            this.__dictionary[key] = value;
        } else {
            if (this.__dictionary.hasOwnProperty(key)) {
                delete this.__dictionary[key];
            }
        }
    };
    Dictionary.prototype.removeValue = function (key) {
        var value;
        if (this.__dictionary.hasOwnProperty(key)) {
            value = this.__dictionary[key];
            delete this.__dictionary[key];
        } else {
            value = null;
        }
        return value;
    };
    Dictionary.prototype.allKeys = function () {
        return Object.keys(this.__dictionary);
    };
    Dictionary.prototype.toMap = function () {
        return this.__dictionary;
    };
    Dictionary.prototype.copyMap = function (deepCopy) {
        if (deepCopy) {
            return ns.type.Copier.deepCopyMap(this.__dictionary);
        } else {
            return ns.type.Copier.copyMap(this.__dictionary);
        }
    };
    ns.type.Dictionary = Dictionary;
    ns.type.registers("Dictionary");
})(MONKEY);
(function (ns) {
    var IObject = ns.type.Object;
    var Stringer = ns.type.Stringer;
    var Mapper = ns.type.Mapper;
    var fetch_string = function (str) {
        if (ns.Interface.conforms(str, Stringer)) {
            return str.toString();
        } else {
            return str;
        }
    };
    var fetch_map = function (dict) {
        if (ns.Interface.conforms(dict, Mapper)) {
            return dict.toMap();
        } else {
            return dict;
        }
    };
    var unwrap = function (object) {
        if (IObject.isNull(object)) {
            return null;
        } else {
            if (IObject.isBaseType(object)) {
                return object;
            } else {
                if (ns.Interface.conforms(object, Stringer)) {
                    return object.toString();
                } else {
                    if (!ns.type.Arrays.isArray(object)) {
                        return unwrap_map(object);
                    } else {
                        if (object instanceof Array) {
                            return unwrap_list(object);
                        } else {
                            return object;
                        }
                    }
                }
            }
        }
    };
    var unwrap_map = function (dict) {
        if (ns.Interface.conforms(dict, Mapper)) {
            dict = dict.toMap();
        }
        var allKeys = Object.keys(dict);
        var key;
        var naked, value;
        var count = allKeys.length;
        for (var i = 0; i < count; ++i) {
            key = allKeys[i];
            value = dict[key];
            naked = unwrap(value);
            if (naked !== value) {
                dict[key] = naked;
            }
        }
        return dict;
    };
    var unwrap_list = function (array) {
        var naked, item;
        var count = array.length;
        for (var i = 0; i < count; ++i) {
            item = array[i];
            naked = unwrap(item);
            if (naked !== item) {
                array[i] = naked;
            }
        }
        return array;
    };
    ns.type.Wrapper = {
        fetchString: fetch_string,
        fetchMap: fetch_map,
        unwrap: unwrap,
        unwrapMap: unwrap_map,
        unwrapList: unwrap_list
    };
    ns.type.registers("Wrapper");
})(MONKEY);
(function (ns) {
    var IObject = ns.type.Object;
    var Stringer = ns.type.Stringer;
    var Mapper = ns.type.Mapper;
    var copy = function (object) {
        if (IObject.isNull(object)) {
            return null;
        } else {
            if (IObject.isBaseType(object)) {
                return object;
            } else {
                if (ns.Interface.conforms(object, Stringer)) {
                    return object.toString();
                } else {
                    if (!ns.type.Arrays.isArray(object)) {
                        return copy_map(object);
                    } else {
                        if (object instanceof Array) {
                            return copy_list(object);
                        } else {
                            return object;
                        }
                    }
                }
            }
        }
    };
    var copy_map = function (dict) {
        if (ns.Interface.conforms(dict, Mapper)) {
            dict = dict.toMap();
        }
        var clone = {};
        var allKeys = Object.keys(dict);
        var key;
        var count = allKeys.length;
        for (var i = 0; i < count; ++i) {
            key = allKeys[i];
            clone[key] = dict[key];
        }
        return clone;
    };
    var copy_list = function (array) {
        var clone = [];
        var count = array.length;
        for (var i = 0; i < count; ++i) {
            clone.push(array[i]);
        }
        return clone;
    };
    var deep_copy = function (object) {
        if (IObject.isNull(object)) {
            return null;
        } else {
            if (IObject.isBaseType(object)) {
                return object;
            } else {
                if (ns.Interface.conforms(object, Stringer)) {
                    return object.toString();
                } else {
                    if (!ns.type.Arrays.isArray(object)) {
                        return deep_copy_map(object);
                    } else {
                        if (object instanceof Array) {
                            return deep_copy_list(object);
                        } else {
                            return object;
                        }
                    }
                }
            }
        }
    };
    var deep_copy_map = function (dict) {
        if (ns.Interface.conforms(dict, Mapper)) {
            dict = dict.toMap();
        }
        var clone = {};
        var allKeys = Object.keys(dict);
        var key;
        var count = allKeys.length;
        for (var i = 0; i < count; ++i) {
            key = allKeys[i];
            clone[key] = deep_copy(dict[key]);
        }
        return clone;
    };
    var deep_copy_list = function (array) {
        var clone = [];
        var count = array.length;
        for (var i = 0; i < count; ++i) {
            clone.push(deep_copy(array[i]));
        }
        return clone;
    };
    ns.type.Copier = {
        copy: copy,
        copyMap: copy_map,
        copyList: copy_list,
        deepCopy: deep_copy,
        deepCopyMap: deep_copy_map,
        deepCopyList: deep_copy_list
    };
    ns.type.registers("Copier");
})(MONKEY);
(function (ns) {
    var DataDigester = function () {};
    ns.Interface(DataDigester, null);
    DataDigester.prototype.digest = function (data) {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.digest.DataDigester = DataDigester;
    ns.digest.registers("DataDigester");
})(MONKEY);
(function (ns) {
    var MD5 = {
        digest: function (data) {
            return this.getDigester().digest(data);
        },
        getDigester: function () {
            return md5Digester;
        },
        setDigester: function (digester) {
            md5Digester = digester;
        }
    };
    var md5Digester = null;
    ns.digest.MD5 = MD5;
    ns.digest.registers("MD5");
})(MONKEY);
(function (ns) {
    var SHA1 = {
        digest: function (data) {
            return this.getDigester().digest(data);
        },
        getDigester: function () {
            return sha1Digester;
        },
        setDigester: function (digester) {
            sha1Digester = digester;
        }
    };
    var sha1Digester = null;
    ns.digest.SHA1 = SHA1;
    ns.digest.registers("SHA1");
})(MONKEY);
(function (ns) {
    var SHA256 = {
        digest: function (data) {
            return this.getDigester().digest(data);
        },
        getDigester: function () {
            return sha256Digester;
        },
        setDigester: function (digester) {
            sha256Digester = digester;
        }
    };
    var sha256Digester = null;
    ns.digest.SHA256 = SHA256;
    ns.digest.registers("SHA256");
})(MONKEY);
(function (ns) {
    var RipeMD160 = {
        digest: function (data) {
            return this.getDigester().digest(data);
        },
        getDigester: function () {
            return ripemd160Digester;
        },
        setDigester: function (digester) {
            ripemd160Digester = digester;
        }
    };
    var ripemd160Digester = null;
    ns.digest.RIPEMD160 = RipeMD160;
    ns.digest.registers("RIPEMD160");
})(MONKEY);
(function (ns) {
    var Keccak256 = {
        digest: function (data) {
            return this.getDigester().digest(data);
        },
        getDigester: function () {
            return keccak256Digester;
        },
        setDigester: function (digester) {
            keccak256Digester = digester;
        }
    };
    var keccak256Digester = null;
    ns.digest.KECCAK256 = Keccak256;
    ns.digest.registers("KECCAK256");
})(MONKEY);
(function (ns) {
    var DataCoder = function () {};
    ns.Interface(DataCoder, null);
    DataCoder.prototype.encode = function (data) {
        ns.assert(false, "implement me!");
        return null;
    };
    DataCoder.prototype.decode = function (string) {
        ns.assert(false, "implement me!");
        return null;
    };
    var ObjectCoder = function () {};
    ns.Interface(ObjectCoder, null);
    ObjectCoder.prototype.encode = function (object) {
        ns.assert(false, "implement me!");
        return null;
    };
    ObjectCoder.prototype.decode = function (string) {
        ns.assert(false, "implement me!");
        return null;
    };
    var StringCoder = function () {};
    ns.Interface(StringCoder, null);
    StringCoder.prototype.encode = function (string) {
        ns.assert(false, "implement me!");
        return null;
    };
    StringCoder.prototype.decode = function (data) {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.format.DataCoder = DataCoder;
    ns.format.ObjectCoder = ObjectCoder;
    ns.format.StringCoder = StringCoder;
    ns.format.registers("DataCoder");
    ns.format.registers("ObjectCoder");
    ns.format.registers("StringCoder");
})(MONKEY);
(function (ns) {
    var DataCoder = ns.format.DataCoder;
    var hex_chars = "0123456789abcdef";
    var hex_values = new Int8Array(128);
    (function (chars, values) {
        for (var i = 0; i < chars.length; ++i) {
            values[chars.charCodeAt(i)] = i;
        }
        values["A".charCodeAt(0)] = 10;
        values["B".charCodeAt(0)] = 11;
        values["C".charCodeAt(0)] = 12;
        values["D".charCodeAt(0)] = 13;
        values["E".charCodeAt(0)] = 14;
        values["F".charCodeAt(0)] = 15;
    })(hex_chars, hex_values);
    var hex_encode = function (data) {
        var len = data.length;
        var str = "";
        var byt;
        for (var i = 0; i < len; ++i) {
            byt = data[i];
            str += hex_chars[byt >> 4];
            str += hex_chars[byt & 15];
        }
        return str;
    };
    var hex_decode = function (string) {
        var len = string.length;
        if (len > 2) {
            if (string[0] === "0") {
                if (string[1] === "x" || string[1] === "X") {
                    string = string.substring(2);
                    len -= 2;
                }
            }
        }
        if (len % 2 === 1) {
            string = "0" + string;
            len += 1;
        }
        var cnt = len >> 1;
        var hi, lo;
        var data = new Uint8Array(cnt);
        for (var i = 0, j = 0; i < cnt; ++i, j += 2) {
            hi = hex_values[string.charCodeAt(j)];
            lo = hex_values[string.charCodeAt(j + 1)];
            data[i] = (hi << 4) | lo;
        }
        return data;
    };
    var HexCoder = function () {
        Object.call(this);
    };
    ns.Class(HexCoder, Object, [DataCoder], {
        encode: function (data) {
            return hex_encode(data);
        },
        decode: function (string) {
            return hex_decode(string);
        }
    });
    var Hex = {
        encode: function (data) {
            return this.getCoder().encode(data);
        },
        decode: function (string) {
            return this.getCoder().decode(string);
        },
        getCoder: function () {
            return hexCoder;
        },
        setCoder: function (coder) {
            hexCoder = coder;
        }
    };
    var hexCoder = new HexCoder();
    ns.format.Hex = Hex;
    ns.format.registers("Hex");
})(MONKEY);
(function (ns) {
    var Base58 = {
        encode: function (data) {
            return this.getCoder().encode(data);
        },
        decode: function (string) {
            return this.getCoder().decode(string);
        },
        getCoder: function () {
            return base58Coder;
        },
        setCoder: function (coder) {
            base58Coder = coder;
        }
    };
    var base58Coder = null;
    ns.format.Base58 = Base58;
    ns.format.registers("Base58");
})(MONKEY);
(function (ns) {
    var Base64 = {
        encode: function (data) {
            return this.getCoder().encode(data);
        },
        decode: function (string) {
            return this.getCoder().decode(string);
        },
        getCoder: function () {
            return base64Coder;
        },
        setCoder: function (coder) {
            base64Coder = coder;
        }
    };
    var base64Coder = null;
    ns.format.Base64 = Base64;
    ns.format.registers("Base64");
})(MONKEY);
(function (ns) {
    var UTF8 = {
        encode: function (string) {
            return this.getCoder().encode(string);
        },
        decode: function (data) {
            return this.getCoder().decode(data);
        },
        getCoder: function () {
            return utf8Coder;
        },
        setCoder: function (coder) {
            utf8Coder = coder;
        }
    };
    var utf8Coder = null;
    ns.format.UTF8 = UTF8;
    ns.format.registers("UTF8");
})(MONKEY);
(function (ns) {
    var ObjectCoder = ns.format.ObjectCoder;
    var JsonCoder = function () {
        Object.call(this);
    };
    ns.Class(JsonCoder, Object, [ObjectCoder], {
        encode: function (object) {
            return JSON.stringify(object);
        },
        decode: function (string) {
            return JSON.parse(string);
        }
    });
    var JsON = {
        encode: function (object) {
            return this.getCoder().encode(object);
        },
        decode: function (string) {
            return this.getCoder().decode(string);
        },
        getCoder: function () {
            return jsonCoder;
        },
        setCoder: function (coder) {
            jsonCoder = coder;
        }
    };
    var jsonCoder = new JsonCoder();
    ns.format.JSON = JsON;
    ns.format.registers("JSON");
})(MONKEY);
(function (ns) {
    var Mapper = ns.type.Mapper;
    var CryptographyKey = function () {};
    ns.Interface(CryptographyKey, [Mapper]);
    CryptographyKey.prototype.getAlgorithm = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    CryptographyKey.prototype.getData = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    var EncryptKey = function () {};
    ns.Interface(EncryptKey, [CryptographyKey]);
    EncryptKey.prototype.encrypt = function (plaintext) {
        ns.assert(false, "implement me!");
        return null;
    };
    var DecryptKey = function () {};
    ns.Interface(DecryptKey, [CryptographyKey]);
    DecryptKey.prototype.decrypt = function (ciphertext) {
        ns.assert(false, "implement me!");
        return null;
    };
    DecryptKey.prototype.matches = function (pKey) {
        ns.assert(false, "implement me!");
        return false;
    };
    ns.crypto.CryptographyKey = CryptographyKey;
    ns.crypto.EncryptKey = EncryptKey;
    ns.crypto.DecryptKey = DecryptKey;
    ns.crypto.registers("CryptographyKey");
    ns.crypto.registers("EncryptKey");
    ns.crypto.registers("DecryptKey");
})(MONKEY);
(function (ns) {
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = function () {};
    ns.Interface(AsymmetricKey, [CryptographyKey]);
    AsymmetricKey.RSA = "RSA";
    AsymmetricKey.ECC = "ECC";
    var SignKey = function () {};
    ns.Interface(SignKey, [AsymmetricKey]);
    SignKey.prototype.sign = function (data) {
        ns.assert(false, "implement me!");
        return null;
    };
    var VerifyKey = function () {};
    ns.Interface(VerifyKey, [AsymmetricKey]);
    VerifyKey.prototype.verify = function (data, signature) {
        ns.assert(false, "implement me!");
        return false;
    };
    VerifyKey.prototype.matches = function (sKey) {
        ns.assert(false, "implement me!");
        return false;
    };
    ns.crypto.AsymmetricKey = AsymmetricKey;
    ns.crypto.SignKey = SignKey;
    ns.crypto.VerifyKey = VerifyKey;
    ns.crypto.registers("AsymmetricKey");
    ns.crypto.registers("SignKey");
    ns.crypto.registers("VerifyKey");
})(MONKEY);
(function (ns) {
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    CryptographyKey.getAlgorithm = function (key) {
        return key["algorithm"];
    };
    var promise = "Moky loves May Lee forever!";
    CryptographyKey.getPromise = function () {
        if (typeof promise === "string") {
            promise = ns.format.UTF8.encode(promise);
        }
        return promise;
    };
    AsymmetricKey.matches = function (sKey, pKey) {
        var promise = CryptographyKey.getPromise();
        var signature = sKey.sign(promise);
        return pKey.verify(promise, signature);
    };
})(MONKEY);
(function (ns) {
    var CryptographyKey = ns.crypto.CryptographyKey;
    var EncryptKey = ns.crypto.EncryptKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var SymmetricKey = function () {};
    ns.Interface(SymmetricKey, [EncryptKey, DecryptKey]);
    SymmetricKey.AES = "AES";
    SymmetricKey.DES = "DES";
    SymmetricKey.matches = function (pKey, sKey) {
        var promise = CryptographyKey.getPromise();
        var ciphertext = pKey.encrypt(promise);
        var plaintext = sKey.decrypt(ciphertext);
        if (!plaintext || plaintext.length !== promise.length) {
            return false;
        }
        for (var i = 0; i < promise.length; ++i) {
            if (plaintext[i] !== promise[i]) {
                return false;
            }
        }
        return true;
    };
    var SymmetricKeyFactory = function () {};
    ns.Interface(SymmetricKeyFactory, null);
    SymmetricKeyFactory.prototype.generateSymmetricKey = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    SymmetricKeyFactory.prototype.parseSymmetricKey = function (key) {
        ns.assert(false, "implement me!");
        return null;
    };
    SymmetricKey.Factory = SymmetricKeyFactory;
    var s_symmetric_factories = {};
    SymmetricKey.setFactory = function (algorithm, factory) {
        s_symmetric_factories[algorithm] = factory;
    };
    SymmetricKey.getFactory = function (algorithm) {
        return s_symmetric_factories[algorithm];
    };
    SymmetricKey.generate = function (algorithm) {
        var factory = SymmetricKey.getFactory(algorithm);
        if (!factory) {
            throw new ReferenceError("key algorithm not support: " + algorithm);
        }
        return factory.generateSymmetricKey();
    };
    SymmetricKey.parse = function (key) {
        if (!key) {
            return null;
        } else {
            if (ns.Interface.conforms(key, SymmetricKey)) {
                return key;
            }
        }
        key = ns.type.Wrapper.fetchMap(key);
        var algorithm = CryptographyKey.getAlgorithm(key);
        var factory = SymmetricKey.getFactory(algorithm);
        if (!factory) {
            factory = SymmetricKey.getFactory("*");
        }
        return factory.parseSymmetricKey(key);
    };
    ns.crypto.SymmetricKey = SymmetricKey;
    ns.crypto.registers("SymmetricKey");
})(MONKEY);
(function (ns) {
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var VerifyKey = ns.crypto.VerifyKey;
    var PublicKey = function () {};
    ns.Interface(PublicKey, [VerifyKey]);
    PublicKey.RSA = AsymmetricKey.RSA;
    PublicKey.ECC = AsymmetricKey.ECC;
    var PublicKeyFactory = function () {};
    ns.Interface(PublicKeyFactory, null);
    PublicKeyFactory.prototype.parsePublicKey = function (key) {
        ns.assert(false, "implement me!");
        return null;
    };
    PublicKey.Factory = PublicKeyFactory;
    var s_public_factories = {};
    PublicKey.setFactory = function (algorithm, factory) {
        s_public_factories[algorithm] = factory;
    };
    PublicKey.getFactory = function (algorithm) {
        return s_public_factories[algorithm];
    };
    PublicKey.parse = function (key) {
        if (!key) {
            return null;
        } else {
            if (ns.Interface.conforms(key, PublicKey)) {
                return key;
            }
        }
        key = ns.type.Wrapper.fetchMap(key);
        var algorithm = CryptographyKey.getAlgorithm(key);
        var factory = PublicKey.getFactory(algorithm);
        if (!factory) {
            factory = PublicKey.getFactory("*");
        }
        return factory.parsePublicKey(key);
    };
    ns.crypto.PublicKey = PublicKey;
    ns.crypto.registers("PublicKey");
})(MONKEY);
(function (ns) {
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var SignKey = ns.crypto.SignKey;
    var PrivateKey = function () {};
    ns.Interface(PrivateKey, [SignKey]);
    PrivateKey.RSA = AsymmetricKey.RSA;
    PrivateKey.ECC = AsymmetricKey.ECC;
    PrivateKey.prototype.getPublicKey = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    var PrivateKeyFactory = function () {};
    ns.Interface(PrivateKeyFactory, null);
    PrivateKeyFactory.prototype.generatePrivateKey = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    PrivateKeyFactory.prototype.parsePrivateKey = function (key) {
        ns.assert(false, "implement me!");
        return null;
    };
    PrivateKey.Factory = PrivateKeyFactory;
    var s_private_factories = {};
    PrivateKey.setFactory = function (algorithm, factory) {
        s_private_factories[algorithm] = factory;
    };
    PrivateKey.getFactory = function (algorithm) {
        return s_private_factories[algorithm];
    };
    PrivateKey.generate = function (algorithm) {
        var factory = PrivateKey.getFactory(algorithm);
        if (!factory) {
            throw new ReferenceError("key algorithm not support: " + algorithm);
        }
        return factory.generatePrivateKey();
    };
    PrivateKey.parse = function (key) {
        if (!key) {
            return null;
        } else {
            if (ns.Interface.conforms(key, PrivateKey)) {
                return key;
            }
        }
        key = ns.type.Wrapper.fetchMap(key);
        var algorithm = CryptographyKey.getAlgorithm(key);
        var factory = PrivateKey.getFactory(algorithm);
        if (!factory) {
            factory = PrivateKey.getFactory("*");
        }
        return factory.parsePrivateKey(key);
    };
    ns.crypto.PrivateKey = PrivateKey;
    ns.crypto.registers("PrivateKey");
})(MONKEY);
if (typeof MingKeMing !== "object") {
    MingKeMing = new MONKEY.Namespace();
}
(function (ns, base) {
    base.exports(ns);
    if (typeof ns.assert !== "function") {
        ns.assert = console.assert;
    }
    if (typeof ns.protocol !== "object") {
        ns.protocol = new ns.Namespace();
    }
    if (typeof ns.mkm !== "object") {
        ns.mkm = new ns.Namespace();
    }
    ns.registers("protocol");
    ns.registers("mkm");
})(MingKeMing, MONKEY);
(function (ns) {
    var NetworkType = ns.type.Enum(null, {
        BTC_MAIN: 0,
        MAIN: 8,
        GROUP: 16,
        POLYLOGUE: 16,
        CHATROOM: 48,
        PROVIDER: 118,
        STATION: 136,
        THING: 128,
        ROBOT: 200
    });
    NetworkType.isUser = function (network) {
        var main = NetworkType.MAIN.valueOf();
        var btcMain = NetworkType.BTC_MAIN.valueOf();
        return (network & main) === main || network === btcMain;
    };
    NetworkType.isGroup = function (network) {
        var group = NetworkType.GROUP.valueOf();
        return (network & group) === group;
    };
    ns.protocol.NetworkType = NetworkType;
    ns.protocol.registers("NetworkType");
})(MingKeMing);
(function (ns) {
    var MetaType = ns.type.Enum(null, {
        DEFAULT: 1,
        MKM: 1,
        BTC: 2,
        ExBTC: 3,
        ETH: 4,
        ExETH: 5
    });
    MetaType.hasSeed = function (version) {
        var mkm = MetaType.MKM.valueOf();
        return (version & mkm) === mkm;
    };
    ns.protocol.MetaType = MetaType;
    ns.protocol.registers("MetaType");
})(MingKeMing);
(function (ns) {
    var Stringer = ns.type.Stringer;
    var Address = function () {};
    ns.Interface(Address, [Stringer]);
    Address.ANYWHERE = null;
    Address.EVERYWHERE = null;
    Address.prototype.getNetwork = function () {
        ns.assert(false, "implement me!");
        return 0;
    };
    Address.prototype.isBroadcast = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Address.prototype.isUser = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Address.prototype.isGroup = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    var AddressFactory = function () {};
    ns.Interface(AddressFactory, null);
    AddressFactory.prototype.generateAddress = function (meta, network) {
        ns.assert(false, "implement me!");
        return null;
    };
    AddressFactory.prototype.createAddress = function (address) {
        ns.assert(false, "implement me!");
        return null;
    };
    AddressFactory.prototype.parseAddress = function (address) {
        ns.assert(false, "implement me!");
        return null;
    };
    Address.Factory = AddressFactory;
    var s_factory = null;
    Address.setFactory = function (factory) {
        s_factory = factory;
    };
    Address.getFactory = function () {
        return s_factory;
    };
    Address.generate = function (meta, network) {
        var factory = Address.getFactory();
        return factory.generateAddress(meta, network);
    };
    Address.create = function (address) {
        var factory = Address.getFactory();
        return factory.createAddress(address);
    };
    Address.parse = function (address) {
        if (!address) {
            return null;
        } else {
            if (ns.Interface.conforms(address, Address)) {
                return address;
            }
        }
        address = ns.type.Wrapper.fetchString(address);
        var factory = Address.getFactory();
        return factory.parseAddress(address);
    };
    ns.protocol.Address = Address;
    ns.protocol.registers("Address");
})(MingKeMing);
(function (ns) {
    var Stringer = ns.type.Stringer;
    var Address = ns.protocol.Address;
    var ID = function () {};
    ns.Interface(ID, [Stringer]);
    ID.ANYONE = null;
    ID.EVERYONE = null;
    ID.FOUNDER = null;
    ID.prototype.getName = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ID.prototype.getAddress = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ID.prototype.getTerminal = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ID.prototype.getType = function () {
        ns.assert(false, "implement me!");
        return 0;
    };
    ID.prototype.isBroadcast = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    ID.prototype.isUser = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    ID.prototype.isGroup = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    ID.convert = function (members) {
        var array = [];
        var id;
        for (var i = 0; i < members.length; ++i) {
            id = ID.parse(members[i]);
            if (id) {
                array.push(id);
            }
        }
        return array;
    };
    ID.revert = function (members) {
        var array = [];
        var id;
        for (var i = 0; i < members.length; ++i) {
            id = members[i];
            if (ns.Interface.conforms(id, Stringer)) {
                array.push(id.toString());
            } else {
                if (typeof id === "string") {
                    array.push(id);
                }
            }
        }
        return array;
    };
    var IDFactory = function () {};
    ns.Interface(IDFactory, null);
    IDFactory.prototype.generateID = function (meta, network, terminal) {
        ns.assert(false, "implement me!");
        return null;
    };
    IDFactory.prototype.createID = function (name, address, terminal) {
        ns.assert(false, "implement me!");
        return null;
    };
    IDFactory.prototype.parseID = function (identifier) {
        ns.assert(false, "implement me!");
        return null;
    };
    ID.Factory = IDFactory;
    var s_factory;
    ID.setFactory = function (factory) {
        s_factory = factory;
    };
    ID.getFactory = function () {
        return s_factory;
    };
    ID.generate = function (meta, network, terminal) {
        var factory = ID.getFactory();
        return factory.generateID(meta, network, terminal);
    };
    ID.create = function (name, address, terminal) {
        var factory = ID.getFactory();
        return factory.createID(name, address, terminal);
    };
    ID.parse = function (identifier) {
        if (!identifier) {
            return null;
        } else {
            if (ns.Interface.conforms(identifier, ID)) {
                return identifier;
            }
        }
        identifier = ns.type.Wrapper.fetchString(identifier);
        var factory = ID.getFactory();
        return factory.parseID(identifier);
    };
    ns.protocol.ID = ID;
    ns.protocol.registers("ID");
})(MingKeMing);
(function (ns) {
    var Mapper = ns.type.Mapper;
    var Base64 = ns.format.Base64;
    var UTF8 = ns.format.UTF8;
    var PublicKey = ns.crypto.PublicKey;
    var Address = ns.protocol.Address;
    var MetaType = ns.protocol.MetaType;
    var ID = ns.protocol.ID;
    var Meta = function () {};
    ns.Interface(Meta, [Mapper]);
    Meta.prototype.getType = function () {
        ns.assert(false, "implement me!");
        return 0;
    };
    Meta.prototype.getKey = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Meta.prototype.getSeed = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Meta.prototype.getFingerprint = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Meta.prototype.generateAddress = function (network) {
        ns.assert(false, "implement me!");
        return null;
    };
    Meta.getType = function (meta) {
        var version = meta["type"];
        if (!version) {
            version = meta["version"];
        }
        return version;
    };
    Meta.getKey = function (meta) {
        var key = meta["key"];
        if (!key) {
            throw new TypeError("meta key not found: " + meta);
        }
        return PublicKey.parse(key);
    };
    Meta.getSeed = function (meta) {
        return meta["seed"];
    };
    Meta.getFingerprint = function (meta) {
        var base64 = meta["fingerprint"];
        if (!base64) {
            return null;
        }
        return Base64.decode(base64);
    };
    Meta.check = function (meta) {
        var key = meta.getKey();
        if (!key) {
            return false;
        }
        if (!MetaType.hasSeed(meta.getType())) {
            return true;
        }
        var seed = meta.getSeed();
        var fingerprint = meta.getFingerprint();
        if (!seed || !fingerprint) {
            return false;
        }
        return key.verify(UTF8.encode(seed), fingerprint);
    };
    Meta.matches = function (meta, id_or_key) {
        if (ns.Interface.conforms(id_or_key, ID)) {
            return match_id(meta, id_or_key);
        } else {
            if (ns.Interface.conforms(id_or_key, PublicKey)) {
                return match_key(meta, id_or_key);
            } else {
                return false;
            }
        }
    };
    var match_id = function (meta, id) {
        if (MetaType.hasSeed(meta.getType())) {
            if (meta.getSeed() !== id.getName()) {
                return false;
            }
        }
        var address = Address.generate(meta, id.getType());
        return id.getAddress().equals(address);
    };
    var match_key = function (meta, key) {
        if (meta.getKey().equals(key)) {
            return true;
        }
        if (MetaType.hasSeed(meta.getType())) {
            var seed = meta.getSeed();
            var fingerprint = meta.getFingerprint();
            return key.every(UTF8.encode(seed), fingerprint);
        } else {
            return false;
        }
    };
    var EnumToUint = function (type) {
        if (typeof type === "number") {
            return type;
        } else {
            return type.valueOf();
        }
    };
    var MetaFactory = function () {};
    ns.Interface(MetaFactory, null);
    MetaFactory.prototype.createMeta = function (pKey, seed, fingerprint) {
        ns.assert(false, "implement me!");
        return null;
    };
    MetaFactory.prototype.generateMeta = function (sKey, seed) {
        ns.assert(false, "implement me!");
        return null;
    };
    MetaFactory.prototype.parseMeta = function (meta) {
        ns.assert(false, "implement me!");
        return null;
    };
    Meta.Factory = MetaFactory;
    var s_factories = {};
    Meta.setFactory = function (type, factory) {
        s_factories[EnumToUint(type)] = factory;
    };
    Meta.getFactory = function (type) {
        return s_factories[EnumToUint(type)];
    };
    Meta.create = function (type, key, seed, fingerprint) {
        var factory = Meta.getFactory(type);
        if (!factory) {
            throw new ReferenceError("meta type not support: " + type);
        }
        return factory.createMeta(key, seed, fingerprint);
    };
    Meta.generate = function (type, sKey, seed) {
        var factory = Meta.getFactory(type);
        if (!factory) {
            throw new ReferenceError("meta type not support: " + type);
        }
        return factory.generateMeta(sKey, seed);
    };
    Meta.parse = function (meta) {
        if (!meta) {
            return null;
        } else {
            if (ns.Interface.conforms(meta, Meta)) {
                return meta;
            }
        }
        meta = ns.type.Wrapper.fetchMap(meta);
        var type = Meta.getType(meta);
        var factory = Meta.getFactory(type);
        if (!factory) {
            factory = Meta.getFactory(0);
        }
        return factory.parseMeta(meta);
    };
    ns.protocol.Meta = Meta;
    ns.protocol.registers("Meta");
})(MingKeMing);
(function (ns) {
    var TAI = function () {};
    ns.Interface(TAI, null);
    TAI.prototype.isValid = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    TAI.prototype.verify = function (publicKey) {
        ns.assert(false, "implement me!");
        return false;
    };
    TAI.prototype.sign = function (privateKey) {
        ns.assert(false, "implement me!");
        return null;
    };
    TAI.prototype.allProperties = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    TAI.prototype.getProperty = function (name) {
        ns.assert(false, "implement me!");
        return null;
    };
    TAI.prototype.setProperty = function (name, value) {
        ns.assert(false, "implement me!");
    };
    ns.protocol.TAI = TAI;
    ns.protocol.registers("TAI");
})(MingKeMing);
(function (ns) {
    var Mapper = ns.type.Mapper;
    var TAI = ns.protocol.TAI;
    var ID = ns.protocol.ID;
    var Document = function () {};
    ns.Interface(Document, [TAI, Mapper]);
    Document.VISA = "visa";
    Document.PROFILE = "profile";
    Document.BULLETIN = "bulletin";
    Document.prototype.getType = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Document.prototype.getIdentifier = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Document.prototype.getTime = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Document.prototype.getName = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Document.prototype.setName = function (name) {
        ns.assert(false, "implement me!");
    };
    Document.getType = function (doc) {
        return doc["type"];
    };
    Document.getIdentifier = function (doc) {
        return ID.parse(doc["ID"]);
    };
    var DocumentFactory = function () {};
    ns.Interface(DocumentFactory, null);
    DocumentFactory.prototype.createDocument = function (
        identifier,
        data,
        signature
    ) {
        ns.assert(false, "implement me!");
        return null;
    };
    DocumentFactory.prototype.parseDocument = function (doc) {
        ns.assert(false, "implement me!");
        return null;
    };
    Document.Factory = DocumentFactory;
    var s_factories = {};
    Document.setFactory = function (type, factory) {
        s_factories[type] = factory;
    };
    Document.getFactory = function (type) {
        return s_factories[type];
    };
    Document.create = function (type, identifier, data, signature) {
        var factory = Document.getFactory(type);
        if (!factory) {
            throw new ReferenceError("document type not support: " + type);
        }
        return factory.createDocument(identifier, data, signature);
    };
    Document.parse = function (doc) {
        if (!doc) {
            return null;
        } else {
            if (ns.Interface.conforms(doc, Document)) {
                return doc;
            }
        }
        doc = ns.type.Wrapper.fetchMap(doc);
        var type = Document.getType(doc);
        var factory = Document.getFactory(type);
        if (!factory) {
            factory = Document.getFactory("*");
        }
        return factory.parseDocument(doc);
    };
    ns.protocol.Document = Document;
    ns.protocol.registers("Document");
})(MingKeMing);
(function (ns) {
    var Document = ns.protocol.Document;
    var Visa = function () {};
    ns.Interface(Visa, [Document]);
    Visa.prototype.getKey = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Visa.prototype.setKey = function (publicKey) {
        ns.assert(false, "implement me!");
    };
    Visa.prototype.getAvatar = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Visa.prototype.setAvatar = function (url) {
        ns.assert(false, "implement me!");
    };
    ns.protocol.Visa = Visa;
    ns.protocol.registers("Visa");
})(MingKeMing);
(function (ns) {
    var Document = ns.protocol.Document;
    var Bulletin = function () {};
    ns.Interface(Bulletin, [Document]);
    Bulletin.prototype.getAssistants = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Bulletin.prototype.setAssistants = function (assistants) {
        ns.assert(false, "implement me!");
    };
    ns.protocol.Bulletin = Bulletin;
    ns.protocol.registers("Bulletin");
})(MingKeMing);
(function (ns) {
    var ConstantString = ns.type.ConstantString;
    var ID = ns.protocol.ID;
    var Identifier = function (identifier, name, address, terminal) {
        ConstantString.call(this, identifier);
        this.__name = name;
        this.__address = address;
        this.__terminal = terminal;
    };
    ns.Class(Identifier, ConstantString, [ID], null);
    Identifier.prototype.getName = function () {
        return this.__name;
    };
    Identifier.prototype.getAddress = function () {
        return this.__address;
    };
    Identifier.prototype.getTerminal = function () {
        return this.__terminal;
    };
    Identifier.prototype.getType = function () {
        return this.getAddress().getNetwork();
    };
    Identifier.prototype.isBroadcast = function () {
        return this.getAddress().isBroadcast();
    };
    Identifier.prototype.isUser = function () {
        return this.getAddress().isUser();
    };
    Identifier.prototype.isGroup = function () {
        return this.getAddress().isGroup();
    };
    ns.mkm.Identifier = Identifier;
    ns.mkm.registers("Identifier");
})(MingKeMing);
(function (ns) {
    var Address = ns.protocol.Address;
    var ID = ns.protocol.ID;
    var Identifier = ns.mkm.Identifier;
    var concat = function (name, address, terminal) {
        var string = address.toString();
        if (name && name.length > 0) {
            string = name + "@" + string;
        }
        if (terminal && terminal.length > 0) {
            string = string + "/" + terminal;
        }
        return string;
    };
    var parse = function (string) {
        var name, address, terminal;
        var pair = string.split("/");
        if (pair.length === 1) {
            terminal = null;
        } else {
            terminal = pair[1];
        }
        pair = pair[0].split("@");
        if (pair.length === 1) {
            name = null;
            address = Address.parse(pair[0]);
        } else {
            name = pair[0];
            address = Address.parse(pair[1]);
        }
        if (!address) {
            return null;
        }
        return new Identifier(string, name, address, terminal);
    };
    var IDFactory = function () {
        Object.call(this);
        this.__identifiers = {};
    };
    ns.Class(IDFactory, Object, [ID.Factory], null);
    IDFactory.prototype.generateID = function (meta, network, terminal) {
        var address = Address.generate(meta, network);
        return ID.create(meta.getSeed(), address, terminal);
    };
    IDFactory.prototype.createID = function (name, address, terminal) {
        var string = concat(name, address, terminal);
        var id = this.__identifiers[string];
        if (!id) {
            id = new Identifier(string, name, address, terminal);
            this.__identifiers[string] = id;
        }
        return id;
    };
    IDFactory.prototype.parseID = function (identifier) {
        var id = this.__identifiers[identifier];
        if (!id) {
            id = parse(identifier);
            if (id) {
                this.__identifiers[identifier] = id;
            }
        }
        return id;
    };
    ns.mkm.IDFactory = IDFactory;
    ns.mkm.registers("IDFactory");
})(MingKeMing);
(function (ns) {
    var Address = ns.protocol.Address;
    var AddressFactory = function () {
        Object.call(this);
        this.__addresses = {};
        this.__addresses[Address.ANYWHERE.toString()] = Address.ANYWHERE;
        this.__addresses[Address.EVERYWHERE.toString()] = Address.EVERYWHERE;
    };
    ns.Class(AddressFactory, Object, [Address.Factory], null);
    AddressFactory.prototype.generateAddress = function (meta, network) {
        var address = meta.generateAddress(network);
        if (address) {
            this.__addresses[address.toString()] = address;
        }
        return address;
    };
    AddressFactory.prototype.parseAddress = function (string) {
        var address = this.__addresses[string];
        if (!address) {
            address = Address.create(string);
            if (address) {
                this.__addresses[string] = address;
            }
        }
        return address;
    };
    ns.mkm.AddressFactory = AddressFactory;
    ns.mkm.registers("AddressFactory");
})(MingKeMing);
(function (ns) {
    var ConstantString = ns.type.ConstantString;
    var NetworkType = ns.protocol.NetworkType;
    var Address = ns.protocol.Address;
    var BroadcastAddress = function (string, network) {
        ConstantString.call(this, string);
        if (network instanceof NetworkType) {
            network = network.valueOf();
        }
        this.__network = network;
    };
    ns.Class(BroadcastAddress, ConstantString, [Address], null);
    BroadcastAddress.prototype.getNetwork = function () {
        return this.__network;
    };
    BroadcastAddress.prototype.isBroadcast = function () {
        return true;
    };
    BroadcastAddress.prototype.isUser = function () {
        return NetworkType.isUser(this.__network);
    };
    BroadcastAddress.prototype.isGroup = function () {
        return NetworkType.isGroup(this.__network);
    };
    Address.ANYWHERE = new BroadcastAddress("anywhere", NetworkType.MAIN);
    Address.EVERYWHERE = new BroadcastAddress("everywhere", NetworkType.GROUP);
    ns.mkm.BroadcastAddress = BroadcastAddress;
    ns.mkm.registers("BroadcastAddress");
})(MingKeMing);
(function (ns) {
    var ID = ns.protocol.ID;
    var Address = ns.protocol.Address;
    var IDFactory = ns.mkm.IDFactory;
    var factory = new IDFactory();
    ID.setFactory(factory);
    ID.ANYONE = factory.createID("anyone", Address.ANYWHERE, null);
    ID.EVERYONE = factory.createID("everyone", Address.EVERYWHERE, null);
    ID.FOUNDER = factory.createID("moky", Address.ANYWHERE, null);
})(MingKeMing);
(function (ns) {
    var Base64 = ns.format.Base64;
    var Dictionary = ns.type.Dictionary;
    var Meta = ns.protocol.Meta;
    var EnumToUint = function (type) {
        if (typeof type === "number") {
            return type;
        } else {
            return type.valueOf();
        }
    };
    var BaseMeta = function () {
        var type, key, seed, fingerprint;
        var meta;
        if (arguments.length === 1) {
            meta = arguments[0];
            type = Meta.getType(meta);
            key = Meta.getKey(meta);
            seed = Meta.getSeed(meta);
            fingerprint = Meta.getFingerprint(meta);
        } else {
            if (arguments.length === 2) {
                type = EnumToUint(arguments[0]);
                key = arguments[1];
                seed = null;
                fingerprint = null;
                meta = { type: type, key: key.toMap() };
            } else {
                if (arguments.length === 4) {
                    type = EnumToUint(arguments[0]);
                    key = arguments[1];
                    seed = arguments[2];
                    fingerprint = arguments[3];
                    meta = {
                        type: type,
                        key: key.toMap(),
                        seed: seed,
                        fingerprint: Base64.encode(fingerprint)
                    };
                } else {
                    throw new SyntaxError("meta arguments error: " + arguments);
                }
            }
        }
        Dictionary.call(this, meta);
        this.__type = type;
        this.__key = key;
        this.__seed = seed;
        this.__fingerprint = fingerprint;
    };
    ns.Class(BaseMeta, Dictionary, [Meta], null);
    BaseMeta.prototype.getType = function () {
        return this.__type;
    };
    BaseMeta.prototype.getKey = function () {
        return this.__key;
    };
    BaseMeta.prototype.getSeed = function () {
        return this.__seed;
    };
    BaseMeta.prototype.getFingerprint = function () {
        return this.__fingerprint;
    };
    ns.mkm.BaseMeta = BaseMeta;
    ns.mkm.registers("BaseMeta");
})(MingKeMing);
(function (ns) {
    var UTF8 = ns.format.UTF8;
    var Base64 = ns.format.Base64;
    var JsON = ns.format.JSON;
    var Dictionary = ns.type.Dictionary;
    var Document = ns.protocol.Document;
    var BaseDocument = function () {
        var map, status;
        var identifier, data;
        var properties;
        if (arguments.length === 1) {
            map = arguments[0];
            status = 0;
            identifier = null;
            data = null;
            properties = null;
        } else {
            if (arguments.length === 2) {
                identifier = arguments[0];
                var type = arguments[1];
                map = { ID: identifier.toString() };
                status = 0;
                data = null;
                if (type && type.length > 1) {
                    properties = { type: type };
                } else {
                    properties = null;
                }
            } else {
                if (arguments.length === 3) {
                    identifier = arguments[0];
                    data = arguments[1];
                    var signature = arguments[2];
                    map = { ID: identifier.toString(), data: data, signature: signature };
                    status = 1;
                    properties = null;
                } else {
                    throw new SyntaxError("document arguments error: " + arguments);
                }
            }
        }
        Dictionary.call(this, map);
        this.__identifier = identifier;
        this.__json = data;
        this.__sig = null;
        this.__properties = properties;
        this.__status = status;
    };
    ns.Class(BaseDocument, Dictionary, [Document], {
        isValid: function () {
            return this.__status > 0;
        },
        getType: function () {
            var type = this.getProperty("type");
            if (!type) {
                var dict = this.toMap();
                type = Document.getType(dict);
            }
            return type;
        },
        getIdentifier: function () {
            if (this.__identifier === null) {
                var dict = this.toMap();
                this.__identifier = Document.getIdentifier(dict);
            }
            return this.__identifier;
        },
        getData: function () {
            if (this.__json === null) {
                this.__json = this.getValue("data");
            }
            return this.__json;
        },
        getSignature: function () {
            if (this.__sig === null) {
                var base64 = this.getValue("signature");
                if (base64) {
                    this.__sig = Base64.decode(base64);
                }
            }
            return this.__sig;
        },
        allProperties: function () {
            if (this.__status < 0) {
                return null;
            }
            if (this.__properties === null) {
                var data = this.getData();
                if (data) {
                    var json = UTF8.decode(data);
                    this.__properties = JsON.decode(json);
                } else {
                    this.__properties = {};
                }
            }
            return this.__properties;
        },
        getProperty: function (name) {
            var dict = this.allProperties();
            if (!dict) {
                return null;
            }
            return dict[name];
        },
        setProperty: function (name, value) {
            this.__status = 0;
            var dict = this.allProperties();
            dict[name] = value;
            this.removeValue("data");
            this.removeValue("signature");
            this.__json = null;
            this.__sig = null;
        },
        verify: function (publicKey) {
            if (this.__status > 0) {
                return true;
            }
            var data = this.getData();
            var signature = this.getSignature();
            if (!data) {
                if (!signature) {
                    this.__status = 0;
                } else {
                    this.__status = -1;
                }
            } else {
                if (!signature) {
                    this.__status = -1;
                } else {
                    if (publicKey.verify(UTF8.encode(data), signature)) {
                        this.__status = 1;
                    }
                }
            }
            return this.__status > 0;
        },
        sign: function (privateKey) {
            if (this.__status > 0) {
                return this.getSignature();
            }
            var now = new Date();
            this.setProperty("time", now.getTime() / 1000);
            var dict = this.allProperties();
            var json = JsON.encode(dict);
            var data = UTF8.encode(json);
            var sig = privateKey.sign(data);
            var b64 = Base64.encode(sig);
            this.__json = json;
            this.__sig = sig;
            this.setValue("data", json);
            this.setValue("signature", b64);
            if (sig && sig.length > 0) {
                this.__status = 1;
            }
            return this.__sig;
        },
        getTime: function () {
            var timestamp = this.getProperty("time");
            if (timestamp) {
                return new Date(timestamp * 1000);
            } else {
                return null;
            }
        },
        getName: function () {
            return this.getProperty("name");
        },
        setName: function (name) {
            this.setProperty("name", name);
        }
    });
    ns.mkm.BaseDocument = BaseDocument;
    ns.mkm.registers("BaseDocument");
})(MingKeMing);
(function (ns) {
    var EncryptKey = ns.crypto.EncryptKey;
    var PublicKey = ns.crypto.PublicKey;
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var Visa = ns.protocol.Visa;
    var BaseDocument = ns.mkm.BaseDocument;
    var BaseVisa = function () {
        if (arguments.length === 3) {
            BaseDocument.call(this, arguments[0], arguments[1], arguments[2]);
        } else {
            if (ns.Interface.conforms(arguments[0], ID)) {
                BaseDocument.call(this, arguments[0], Document.VISA);
            } else {
                if (arguments.length === 1) {
                    BaseDocument.call(this, arguments[0]);
                }
            }
        }
        this.__key = null;
    };
    ns.Class(BaseVisa, BaseDocument, [Visa], {
        getKey: function () {
            if (this.__key === null) {
                var key = this.getProperty("key");
                if (key) {
                    key = PublicKey.parse(key);
                    if (ns.Interface.conforms(key, EncryptKey)) {
                        this.__key = key;
                    }
                }
            }
            return this.__key;
        },
        setKey: function (publicKey) {
            this.setProperty("key", publicKey.toMap());
            this.__key = publicKey;
        },
        getAvatar: function () {
            return this.getProperty("avatar");
        },
        setAvatar: function (url) {
            this.setProperty("avatar", url);
        }
    });
    ns.mkm.BaseVisa = BaseVisa;
    ns.mkm.registers("BaseVisa");
})(MingKeMing);
(function (ns) {
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var Bulletin = ns.protocol.Bulletin;
    var BaseDocument = ns.mkm.BaseDocument;
    var BaseBulletin = function () {
        if (arguments.length === 3) {
            BaseDocument.call(this, arguments[0], arguments[1], arguments[2]);
        } else {
            if (ns.Interface.conforms(arguments[0], ID)) {
                BaseDocument.call(this, arguments[0], Document.BULLETIN);
            } else {
                if (arguments.length === 1) {
                    BaseDocument.call(this, arguments[0]);
                }
            }
        }
        this.__assistants = null;
    };
    ns.Class(BaseBulletin, BaseDocument, [Bulletin], {
        getAssistants: function () {
            if (!this.__assistants) {
                var assistants = this.getProperty("assistants");
                if (assistants) {
                    this.__assistants = ID.convert(assistants);
                }
            }
            return this.__assistants;
        },
        setAssistants: function (assistants) {
            if (assistants && assistants.length > 0) {
                this.setProperty("assistants", ID.revert(assistants));
            } else {
                this.setProperty("assistants", null);
            }
        }
    });
    ns.mkm.BaseBulletin = BaseBulletin;
    ns.mkm.registers("BaseBulletin");
})(MingKeMing);
if (typeof DaoKeDao !== "object") {
    DaoKeDao = new MingKeMing.Namespace();
}
(function (ns, base) {
    base.exports(ns);
    if (typeof ns.assert !== "function") {
        ns.assert = console.assert;
    }
    if (typeof ns.protocol !== "object") {
        ns.protocol = new ns.Namespace();
    }
    if (typeof ns.dkd !== "object") {
        ns.dkd = new ns.Namespace();
    }
    ns.registers("protocol");
    ns.registers("dkd");
})(DaoKeDao, MingKeMing);
(function (ns) {
    var ContentType = ns.type.Enum(null, {
        TEXT: 1,
        FILE: 16,
        IMAGE: 18,
        AUDIO: 20,
        VIDEO: 22,
        PAGE: 32,
        QUOTE: 55,
        MONEY: 64,
        TRANSFER: 65,
        LUCKY_MONEY: 66,
        CLAIM_PAYMENT: 72,
        SPLIT_BILL: 73,
        COMMAND: 136,
        HISTORY: 137,
        APPLICATION: 160,
        CUSTOMIZED: 204,
        FORWARD: 255
    });
    ns.protocol.ContentType = ContentType;
    ns.protocol.registers("ContentType");
})(DaoKeDao);
(function (ns) {
    var Mapper = ns.type.Mapper;
    var ID = ns.protocol.ID;
    var ContentType = ns.protocol.ContentType;
    var Content = function () {};
    ns.Interface(Content, [Mapper]);
    Content.prototype.getType = function () {
        ns.assert(false, "implement me!");
        return 0;
    };
    Content.getType = function (content) {
        return content["type"];
    };
    Content.prototype.getSerialNumber = function () {
        ns.assert(false, "implement me!");
        return 0;
    };
    Content.getSerialNumber = function (content) {
        return content["sn"];
    };
    Content.prototype.getTime = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Content.getTime = function (content) {
        var timestamp = content["time"];
        if (timestamp) {
            return new Date(timestamp * 1000);
        } else {
            return null;
        }
    };
    Content.prototype.getGroup = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Content.prototype.setGroup = function (identifier) {
        ns.assert(false, "implement me!");
    };
    Content.getGroup = function (content) {
        return ID.parse(content["group"]);
    };
    Content.setGroup = function (group, content) {
        if (group) {
            content["group"] = group.toString();
        } else {
            delete content["group"];
        }
    };
    var EnumToUint = function (type) {
        if (typeof type === "number") {
            return type;
        } else {
            return type.valueOf();
        }
    };
    var ContentFactory = function () {};
    ns.Interface(ContentFactory, null);
    ContentFactory.prototype.parseContent = function (content) {
        ns.assert(false, "implement me!");
        return null;
    };
    Content.Factory = ContentFactory;
    var s_content_factories = {};
    Content.setFactory = function (type, factory) {
        s_content_factories[EnumToUint(type)] = factory;
    };
    Content.getFactory = function (type) {
        return s_content_factories[EnumToUint(type)];
    };
    Content.parse = function (content) {
        if (!content) {
            return null;
        } else {
            if (ns.Interface.conforms(content, Content)) {
                return content;
            }
        }
        content = ns.type.Wrapper.fetchMap(content);
        var type = Content.getType(content);
        var factory = Content.getFactory(type);
        if (!factory) {
            factory = Content.getFactory(0);
        }
        return factory.parseContent(content);
    };
    ns.protocol.Content = Content;
    ns.protocol.registers("Content");
})(DaoKeDao);
(function (ns) {
    var Mapper = ns.type.Mapper;
    var ID = ns.protocol.ID;
    var ContentType = ns.protocol.ContentType;
    var Envelope = function () {};
    ns.Interface(Envelope, [Mapper]);
    Envelope.prototype.getSender = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Envelope.getSender = function (env) {
        return ID.parse(env["sender"]);
    };
    Envelope.prototype.getReceiver = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Envelope.getReceiver = function (env) {
        return ID.parse(env["receiver"]);
    };
    Envelope.prototype.getTime = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Envelope.getTime = function (env) {
        var timestamp = env["time"];
        if (timestamp) {
            return new Date(timestamp * 1000);
        } else {
            return null;
        }
    };
    Envelope.prototype.getGroup = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Envelope.prototype.setGroup = function (identifier) {
        ns.assert(false, "implement me!");
    };
    Envelope.getGroup = function (env) {
        return ID.parse(env["group"]);
    };
    Envelope.setGroup = function (group, env) {
        if (group) {
            env["group"] = group.toString();
        } else {
            delete env["group"];
        }
    };
    Envelope.prototype.getType = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Envelope.prototype.setType = function (type) {
        ns.assert(false, "implement me!");
    };
    Envelope.getType = function (env) {
        var type = env["type"];
        if (type) {
            return type;
        } else {
            return 0;
        }
    };
    Envelope.setType = function (type, env) {
        if (type) {
            if (type instanceof ContentType) {
                type = type.valueOf();
            }
            env["type"] = type;
        } else {
            delete env["type"];
        }
    };
    var EnvelopeFactory = function () {};
    ns.Interface(EnvelopeFactory, null);
    EnvelopeFactory.prototype.createEnvelope = function (from, to, when) {
        ns.assert(false, "implement me!");
        return null;
    };
    EnvelopeFactory.prototype.parseEnvelope = function (env) {
        ns.assert(false, "implement me!");
        return null;
    };
    Envelope.Factory = EnvelopeFactory;
    var s_envelope_factory = null;
    Envelope.getFactory = function () {
        return s_envelope_factory;
    };
    Envelope.setFactory = function (factory) {
        s_envelope_factory = factory;
    };
    Envelope.create = function (from, to, when) {
        var factory = Envelope.getFactory();
        return factory.createEnvelope(from, to, when);
    };
    Envelope.parse = function (env) {
        if (!env) {
            return null;
        } else {
            if (ns.Interface.conforms(env, Envelope)) {
                return env;
            }
        }
        env = ns.type.Wrapper.fetchMap(env);
        var factory = Envelope.getFactory();
        return factory.parseEnvelope(env);
    };
    ns.protocol.Envelope = Envelope;
    ns.protocol.registers("Envelope");
})(DaoKeDao);
(function (ns) {
    var Mapper = ns.type.Mapper;
    var Envelope = ns.protocol.Envelope;
    var Message = function () {};
    ns.Interface(Message, [Mapper]);
    Message.prototype.getDelegate = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Message.prototype.setDelegate = function (delegate) {
        ns.assert(false, "implement me!");
    };
    Message.prototype.getEnvelope = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Message.getEnvelope = function (msg) {
        return Envelope.parse(msg);
    };
    Message.prototype.getSender = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Message.prototype.getReceiver = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Message.prototype.getTime = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Message.prototype.getGroup = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Message.prototype.getType = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    var MessageDelegate = function () {};
    ns.Interface(MessageDelegate, null);
    Message.Delegate = MessageDelegate;
    ns.protocol.Message = Message;
    ns.protocol.registers("Message");
})(DaoKeDao);
(function (ns) {
    var Content = ns.protocol.Content;
    var Message = ns.protocol.Message;
    var InstantMessage = function () {};
    ns.Interface(InstantMessage, [Message]);
    InstantMessage.prototype.getContent = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    InstantMessage.getContent = function (msg) {
        return Content.parse(msg["content"]);
    };
    InstantMessage.prototype.encrypt = function (password, members) {
        ns.assert(false, "implement me!");
        return null;
    };
    var InstantMessageDelegate = function () {};
    ns.Interface(InstantMessageDelegate, [Message.Delegate]);
    InstantMessageDelegate.prototype.serializeContent = function (
        content,
        pwd,
        iMsg
    ) {
        ns.assert(false, "implement me!");
        return null;
    };
    InstantMessageDelegate.prototype.encryptContent = function (data, pwd, iMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    InstantMessageDelegate.prototype.encodeData = function (data, iMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    InstantMessageDelegate.prototype.serializeKey = function (pwd, iMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    InstantMessageDelegate.prototype.encryptKey = function (
        data,
        receiver,
        iMsg
    ) {
        ns.assert(false, "implement me!");
        return null;
    };
    InstantMessageDelegate.prototype.encodeKey = function (data, iMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    InstantMessage.Delegate = InstantMessageDelegate;
    var InstantMessageFactory = function () {};
    ns.Interface(InstantMessageFactory, null);
    InstantMessageFactory.prototype.generateSerialNumber = function (
        msgType,
        now
    ) {
        ns.assert(false, "implement me!");
        return 0;
    };
    InstantMessageFactory.prototype.createInstantMessage = function (head, body) {
        ns.assert(false, "implement me!");
        return null;
    };
    InstantMessageFactory.prototype.parseInstantMessage = function (msg) {
        ns.assert(false, "implement me!");
        return null;
    };
    InstantMessage.Factory = InstantMessageFactory;
    var s_instant_factory = null;
    InstantMessage.getFactory = function () {
        return s_instant_factory;
    };
    InstantMessage.setFactory = function (factory) {
        s_instant_factory = factory;
    };
    InstantMessage.generateSerialNumber = function (msgType, now) {
        var factory = InstantMessage.getFactory();
        return factory.generateSerialNumber(msgType, now);
    };
    InstantMessage.create = function (head, body) {
        var factory = InstantMessage.getFactory();
        return factory.createInstantMessage(head, body);
    };
    InstantMessage.parse = function (msg) {
        if (!msg) {
            return null;
        } else {
            if (ns.Interface.conforms(msg, InstantMessage)) {
                return msg;
            }
        }
        msg = ns.type.Wrapper.fetchMap(msg);
        var factory = InstantMessage.getFactory();
        return factory.parseInstantMessage(msg);
    };
    ns.protocol.InstantMessage = InstantMessage;
    ns.protocol.registers("InstantMessage");
})(DaoKeDao);
(function (ns) {
    var Message = ns.protocol.Message;
    var SecureMessage = function () {};
    ns.Interface(SecureMessage, [Message]);
    SecureMessage.prototype.getData = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    SecureMessage.prototype.getEncryptedKey = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    SecureMessage.prototype.getEncryptedKeys = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    SecureMessage.prototype.decrypt = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    SecureMessage.prototype.sign = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    SecureMessage.prototype.split = function (members) {
        ns.assert(false, "implement me!");
        return null;
    };
    SecureMessage.prototype.trim = function (member) {
        ns.assert(false, "implement me!");
        return null;
    };
    var SecureMessageDelegate = function () {};
    ns.Interface(SecureMessageDelegate, [Message.Delegate]);
    SecureMessageDelegate.prototype.decodeKey = function (key, sMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    SecureMessageDelegate.prototype.decryptKey = function (
        data,
        sender,
        receiver,
        sMsg
    ) {
        ns.assert(false, "implement me!");
        return null;
    };
    SecureMessageDelegate.prototype.deserializeKey = function (
        data,
        sender,
        receiver,
        sMsg
    ) {
        ns.assert(false, "implement me!");
        return null;
    };
    SecureMessageDelegate.prototype.decodeData = function (data, sMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    SecureMessageDelegate.prototype.decryptContent = function (data, pwd, sMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    SecureMessageDelegate.prototype.deserializeContent = function (
        data,
        pwd,
        sMsg
    ) {
        ns.assert(false, "implement me!");
        return null;
    };
    SecureMessageDelegate.prototype.signData = function (data, sender, sMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    SecureMessageDelegate.prototype.encodeSignature = function (signature, sMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    SecureMessage.Delegate = SecureMessageDelegate;
    var SecureMessageFactory = function () {};
    ns.Interface(SecureMessageFactory, null);
    SecureMessageFactory.prototype.parseSecureMessage = function (msg) {
        ns.assert(false, "implement me!");
        return null;
    };
    SecureMessage.Factory = SecureMessageFactory;
    var s_secure_factory = null;
    SecureMessage.getFactory = function () {
        return s_secure_factory;
    };
    SecureMessage.setFactory = function (factory) {
        s_secure_factory = factory;
    };
    SecureMessage.parse = function (msg) {
        if (!msg) {
            return null;
        } else {
            if (ns.Interface.conforms(msg, SecureMessage)) {
                return msg;
            }
        }
        msg = ns.type.Wrapper.fetchMap(msg);
        var factory = SecureMessage.getFactory();
        return factory.parseSecureMessage(msg);
    };
    ns.protocol.SecureMessage = SecureMessage;
    ns.protocol.registers("SecureMessage");
})(DaoKeDao);
(function (ns) {
    var Meta = ns.protocol.Meta;
    var Document = ns.protocol.Document;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = function () {};
    ns.Interface(ReliableMessage, [SecureMessage]);
    ReliableMessage.prototype.getSignature = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ReliableMessage.prototype.getMeta = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ReliableMessage.prototype.setMeta = function (meta) {
        ns.assert(false, "implement me!");
        return null;
    };
    ReliableMessage.getMeta = function (msg) {
        return Meta.parse(msg["meta"]);
    };
    ReliableMessage.setMeta = function (meta, msg) {
        if (meta) {
            msg["meta"] = meta.toMap();
        } else {
            delete msg["meta"];
        }
    };
    ReliableMessage.prototype.getVisa = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ReliableMessage.prototype.setVisa = function (doc) {
        ns.assert(false, "implement me!");
        return null;
    };
    ReliableMessage.getVisa = function (msg) {
        return Document.parse(msg["visa"]);
    };
    ReliableMessage.setVisa = function (doc, msg) {
        if (doc) {
            msg["visa"] = doc.toMap();
        } else {
            delete msg["visa"];
        }
    };
    ReliableMessage.prototype.verify = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    var ReliableMessageDelegate = function () {};
    ns.Interface(ReliableMessageDelegate, [SecureMessage.Delegate]);
    ReliableMessageDelegate.prototype.decodeSignature = function (
        signature,
        rMsg
    ) {
        ns.assert(false, "implement me!");
        return null;
    };
    ReliableMessageDelegate.prototype.verifyDataSignature = function (
        data,
        signature,
        sender,
        rMsg
    ) {
        ns.assert(false, "implement me!");
        return false;
    };
    ReliableMessage.Delegate = ReliableMessageDelegate;
    var ReliableMessageFactory = function () {};
    ns.Interface(ReliableMessageFactory, null);
    ReliableMessageFactory.prototype.parseReliableMessage = function (msg) {
        ns.assert(false, "implement me!");
        return null;
    };
    ReliableMessage.Factory = ReliableMessageFactory;
    var s_reliable_factory = null;
    ReliableMessage.getFactory = function () {
        return s_reliable_factory;
    };
    ReliableMessage.setFactory = function (factory) {
        s_reliable_factory = factory;
    };
    ReliableMessage.parse = function (msg) {
        if (!msg) {
            return null;
        } else {
            if (ns.Interface.conforms(msg, ReliableMessage)) {
                return msg;
            }
        }
        msg = ns.type.Wrapper.fetchMap(msg);
        var factory = ReliableMessage.getFactory();
        return factory.parseReliableMessage(msg);
    };
    ns.protocol.ReliableMessage = ReliableMessage;
    ns.protocol.registers("ReliableMessage");
})(DaoKeDao);
(function (ns) {
    var Dictionary = ns.type.Dictionary;
    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var InstantMessage = ns.protocol.InstantMessage;
    var BaseContent = function (info) {
        if (info instanceof ContentType) {
            info = info.valueOf();
        }
        var content, type, sn, time;
        if (typeof info === "number") {
            type = info;
            time = new Date();
            sn = InstantMessage.generateSerialNumber(type, time);
            content = { type: type, sn: sn, time: time.getTime() / 1000 };
        } else {
            content = info;
            type = Content.getType(content);
            sn = Content.getSerialNumber(content);
            time = Content.getTime(content);
        }
        Dictionary.call(this, content);
        this.__type = type;
        this.__sn = sn;
        this.__time = time;
    };
    ns.Class(BaseContent, Dictionary, [Content], {
        getType: function () {
            return this.__type;
        },
        getSerialNumber: function () {
            return this.__sn;
        },
        getTime: function () {
            return this.__time;
        },
        getGroup: function () {
            var dict = this.toMap();
            return Content.getGroup(dict);
        },
        setGroup: function (identifier) {
            var dict = this.toMap();
            Content.setGroup(identifier, dict);
        }
    });
    ns.dkd.BaseContent = BaseContent;
    ns.dkd.registers("BaseContent");
})(DaoKeDao);
(function (ns) {
    var Dictionary = ns.type.Dictionary;
    var Envelope = ns.protocol.Envelope;
    var MessageEnvelope = function () {
        var from, to, when;
        var env;
        if (arguments.length === 1) {
            env = arguments[0];
            from = Envelope.getSender(env);
            to = Envelope.getReceiver(env);
            when = Envelope.getTime(env);
        } else {
            if (arguments.length === 2) {
                from = arguments[0];
                to = arguments[1];
                when = new Date();
                env = {
                    sender: from.toString(),
                    receiver: to.toString(),
                    time: when.getTime() / 1000
                };
            } else {
                if (arguments.length === 3) {
                    from = arguments[0];
                    to = arguments[1];
                    when = arguments[2];
                    if (!when) {
                        when = new Date();
                    } else {
                        if (typeof when === "number") {
                            when = new Date(when * 1000);
                        }
                    }
                    env = {
                        sender: from.toString(),
                        receiver: to.toString(),
                        time: when.getTime() / 1000
                    };
                } else {
                    throw new SyntaxError("envelope arguments error: " + arguments);
                }
            }
        }
        Dictionary.call(this, env);
        this.__sender = from;
        this.__receiver = to;
        this.__time = when;
    };
    ns.Class(MessageEnvelope, Dictionary, [Envelope], {
        getSender: function () {
            return this.__sender;
        },
        getReceiver: function () {
            return this.__receiver;
        },
        getTime: function () {
            return this.__time;
        },
        getGroup: function () {
            var dict = this.toMap();
            return Envelope.getGroup(dict);
        },
        setGroup: function (identifier) {
            var dict = this.toMap();
            Envelope.setGroup(identifier, dict);
        },
        getType: function () {
            var dict = this.toMap();
            return Envelope.getType(dict);
        },
        setType: function (type) {
            var dict = this.toMap();
            Envelope.setType(type, dict);
        }
    });
    ns.dkd.MessageEnvelope = MessageEnvelope;
    ns.dkd.registers("MessageEnvelope");
})(DaoKeDao);
(function (ns) {
    var Dictionary = ns.type.Dictionary;
    var Envelope = ns.protocol.Envelope;
    var Message = ns.protocol.Message;
    var BaseMessage = function (msg) {
        var env;
        if (ns.Interface.conforms(msg, Envelope)) {
            env = msg;
            msg = env.toMap();
        } else {
            env = Message.getEnvelope(msg);
        }
        Dictionary.call(this, msg);
        this.__envelope = env;
        this.__delegate = null;
    };
    ns.Class(BaseMessage, Dictionary, [Message], null);
    BaseMessage.prototype.getDelegate = function () {
        return this.__delegate;
    };
    BaseMessage.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate;
    };
    BaseMessage.prototype.getEnvelope = function () {
        return this.__envelope;
    };
    BaseMessage.prototype.getSender = function () {
        var env = this.getEnvelope();
        return env.getSender();
    };
    BaseMessage.prototype.getReceiver = function () {
        var env = this.getEnvelope();
        return env.getReceiver();
    };
    BaseMessage.prototype.getTime = function () {
        var env = this.getEnvelope();
        return env.getTime();
    };
    BaseMessage.prototype.getGroup = function () {
        var env = this.getEnvelope();
        return env.getGroup();
    };
    BaseMessage.prototype.getType = function () {
        var env = this.getEnvelope();
        return env.getTime();
    };
    ns.dkd.BaseMessage = BaseMessage;
    ns.dkd.registers("BaseMessage");
})(DaoKeDao);
(function (ns) {
    var Message = ns.protocol.Message;
    var InstantMessage = ns.protocol.InstantMessage;
    var SecureMessage = ns.protocol.SecureMessage;
    var BaseMessage = ns.dkd.BaseMessage;
    var PlainMessage = function () {
        var msg, head, body;
        if (arguments.length === 1) {
            msg = arguments[0];
            head = Message.getEnvelope(msg);
            body = InstantMessage.getContent(msg);
        } else {
            if (arguments.length === 2) {
                head = arguments[0];
                body = arguments[1];
                msg = head.toMap();
                msg["content"] = body.toMap();
            } else {
                throw new SyntaxError("message arguments error: " + arguments);
            }
        }
        BaseMessage.call(this, msg);
        this.__envelope = head;
        this.__content = body;
    };
    ns.Class(PlainMessage, BaseMessage, [InstantMessage], {
        getContent: function () {
            return this.__content;
        },
        getTime: function () {
            var content = this.getContent();
            var time = content.getTime();
            if (!time) {
                var env = this.getEnvelope();
                time = env.getTime();
            }
            return time;
        },
        getGroup: function () {
            var content = this.getContent();
            return content.getGroup();
        },
        getType: function () {
            var content = this.getContent();
            return content.getType();
        },
        encrypt: function (password, members) {
            if (members && members.length > 0) {
                return encrypt_group_message.call(this, password, members);
            } else {
                return encrypt_message.call(this, password);
            }
        }
    });
    var encrypt_message = function (password) {
        var delegate = this.getDelegate();
        var msg = prepare_data.call(this, password);
        var key = delegate.serializeKey(password, this);
        if (!key) {
            return SecureMessage.parse(msg);
        }
        var data = delegate.encryptKey(key, this.getReceiver(), this);
        if (!data) {
            return null;
        }
        msg["key"] = delegate.encodeKey(data, this);
        return SecureMessage.parse(msg);
    };
    var encrypt_group_message = function (password, members) {
        var delegate = this.getDelegate();
        var msg = prepare_data.call(this, password);
        var key = delegate.serializeKey(password, this);
        if (!key) {
            return SecureMessage.parse(msg);
        }
        var keys = {};
        var count = 0;
        var member;
        var data;
        for (var i = 0; i < members.length; ++i) {
            member = members[i];
            data = delegate.encryptKey(key, member, this);
            if (!data) {
                continue;
            }
            keys[member] = delegate.encodeKey(data, this);
            ++count;
        }
        if (count > 0) {
            msg["keys"] = keys;
        }
        return SecureMessage.parse(msg);
    };
    var prepare_data = function (password) {
        var delegate = this.getDelegate();
        var data = delegate.serializeContent(this.__content, password, this);
        data = delegate.encryptContent(data, password, this);
        var base64 = delegate.encodeData(data, this);
        var msg = this.copyMap();
        delete msg["content"];
        msg["data"] = base64;
        return msg;
    };
    ns.dkd.PlainMessage = PlainMessage;
    ns.dkd.registers("PlainMessage");
})(DaoKeDao);
(function (ns) {
    var Copier = ns.type.Copier;
    var InstantMessage = ns.protocol.InstantMessage;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var BaseMessage = ns.dkd.BaseMessage;
    var EncryptedMessage = function (msg) {
        BaseMessage.call(this, msg);
        this.__data = null;
        this.__key = null;
        this.__keys = null;
    };
    ns.Class(EncryptedMessage, BaseMessage, [SecureMessage], {
        getData: function () {
            if (!this.__data) {
                var base64 = this.getValue("data");
                var delegate = this.getDelegate();
                this.__data = delegate.decodeData(base64, this);
            }
            return this.__data;
        },
        getEncryptedKey: function () {
            if (!this.__key) {
                var base64 = this.getValue("key");
                if (!base64) {
                    var keys = this.getEncryptedKeys();
                    if (keys) {
                        var receiver = this.getReceiver();
                        base64 = keys[receiver.toString()];
                    }
                }
                if (base64) {
                    var delegate = this.getDelegate();
                    this.__key = delegate.decodeKey(base64, this);
                }
            }
            return this.__key;
        },
        getEncryptedKeys: function () {
            if (!this.__keys) {
                this.__keys = this.getValue("keys");
            }
            return this.__keys;
        },
        decrypt: function () {
            var sender = this.getSender();
            var receiver;
            var group = this.getGroup();
            if (group) {
                receiver = group;
            } else {
                receiver = this.getReceiver();
            }
            var delegate = this.getDelegate();
            var key = this.getEncryptedKey();
            if (key) {
                key = delegate.decryptKey(key, sender, receiver, this);
                if (!key) {
                    throw new Error("failed to decrypt key in msg: " + this);
                }
            }
            var password = delegate.deserializeKey(key, sender, receiver, this);
            if (!password) {
                throw new Error(
                    "failed to get msg key: " + sender + " -> " + receiver + ", " + key
                );
            }
            var data = this.getData();
            if (!data) {
                throw new Error("failed to decode content data: " + this);
            }
            data = delegate.decryptContent(data, password, this);
            if (!data) {
                throw new Error("failed to decrypt data with key: " + password);
            }
            var content = delegate.deserializeContent(data, password, this);
            if (!content) {
                throw new Error("failed to deserialize content: " + data);
            }
            var msg = this.copyMap(false);
            delete msg["key"];
            delete msg["keys"];
            delete msg["data"];
            msg["content"] = content.toMap();
            return InstantMessage.parse(msg);
        },
        sign: function () {
            var delegate = this.getDelegate();
            var signature = delegate.signData(this.getData(), this.getSender(), this);
            var base64 = delegate.encodeSignature(signature, this);
            var msg = this.copyMap(false);
            msg["signature"] = base64;
            return ReliableMessage.parse(msg);
        },
        split: function (members) {
            var msg = this.copyMap(false);
            var keys = this.getEncryptedKeys();
            if (keys) {
                delete msg["keys"];
            } else {
                keys = {};
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
                    msg["key"] = base64;
                } else {
                    delete msg["key"];
                }
                item = SecureMessage.parse(Copier.copyMap(msg));
                if (item) {
                    messages.push(item);
                }
            }
            return messages;
        },
        trim: function (member) {
            var msg = this.copyMap(false);
            var keys = this.getEncryptedKeys();
            if (keys) {
                var base64 = keys[member.toString()];
                if (base64) {
                    msg["key"] = base64;
                }
                delete msg["keys"];
            }
            var group = this.getGroup();
            if (!group) {
                msg["group"] = this.getReceiver().toString();
            }
            msg["receiver"] = member.toString();
            return SecureMessage.parse(msg);
        }
    });
    ns.dkd.EncryptedMessage = EncryptedMessage;
    ns.dkd.registers("EncryptedMessage");
})(DaoKeDao);
(function (ns) {
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var EncryptedMessage = ns.dkd.EncryptedMessage;
    var NetworkMessage = function (msg) {
        EncryptedMessage.call(this, msg);
        this.__signature = null;
        this.__meta = null;
        this.__visa = null;
    };
    ns.Class(NetworkMessage, EncryptedMessage, [ReliableMessage], {
        getSignature: function () {
            if (!this.__signature) {
                var base64 = this.getValue("signature");
                var delegate = this.getDelegate();
                this.__signature = delegate.decodeSignature(base64, this);
            }
            return this.__signature;
        },
        setMeta: function (meta) {
            var dict = this.toMap();
            ReliableMessage.setMeta(meta, dict);
            this.__meta = meta;
        },
        getMeta: function () {
            if (!this.__meta) {
                var dict = this.toMap();
                this.__meta = ReliableMessage.getMeta(dict);
            }
            return this.__meta;
        },
        setVisa: function (visa) {
            var dict = this.toMap();
            ReliableMessage.setVisa(visa, dict);
            this.__visa = visa;
        },
        getVisa: function () {
            if (!this.__visa) {
                var dict = this.toMap();
                this.__visa = ReliableMessage.getVisa(dict);
            }
            return this.__visa;
        },
        verify: function () {
            var data = this.getData();
            if (!data) {
                throw new Error("failed to decode content data: " + this);
            }
            var signature = this.getSignature();
            if (!signature) {
                throw new Error("failed to decode message signature: " + this);
            }
            var delegate = this.getDelegate();
            if (
                delegate.verifyDataSignature(data, signature, this.getSender(), this)
            ) {
                var msg = this.copyMap(false);
                delete msg["signature"];
                return SecureMessage.parse(msg);
            } else {
                return null;
            }
        }
    });
    ns.dkd.NetworkMessage = NetworkMessage;
    ns.dkd.registers("NetworkMessage");
})(DaoKeDao);
(function (ns) {
    var Envelope = ns.protocol.Envelope;
    var MessageEnvelope = ns.dkd.MessageEnvelope;
    var EnvelopeFactory = function () {
        Object.call(this);
    };
    ns.Class(EnvelopeFactory, Object, [Envelope.Factory], null);
    EnvelopeFactory.prototype.createEnvelope = function (from, to, when) {
        if (!when) {
            when = new Date();
        }
        return new MessageEnvelope(from, to, when);
    };
    EnvelopeFactory.prototype.parseEnvelope = function (env) {
        if (!env["sender"]) {
            return null;
        }
        return new MessageEnvelope(env);
    };
    Envelope.setFactory(new EnvelopeFactory());
    ns.dkd.EnvelopeFactory = EnvelopeFactory;
    ns.dkd.registers("EnvelopeFactory");
})(DaoKeDao);
(function (ns) {
    var InstantMessage = ns.protocol.InstantMessage;
    var PlainMessage = ns.dkd.PlainMessage;
    var InstantMessageFactory = function () {
        Object.call(this);
    };
    ns.Class(InstantMessageFactory, Object, [InstantMessage.Factory], null);
    var MAX_LONG = 4294967295;
    InstantMessageFactory.prototype.generateSerialNumber = function (
        msgType,
        now
    ) {
        var sn = Math.ceil(Math.random() * MAX_LONG);
        if (sn > 0) {
            return sn;
        } else {
            if (sn < 0) {
                return -sn;
            }
        }
        return 9527 + 9394;
    };
    InstantMessageFactory.prototype.createInstantMessage = function (head, body) {
        return new PlainMessage(head, body);
    };
    InstantMessageFactory.prototype.parseInstantMessage = function (msg) {
        return new PlainMessage(msg);
    };
    InstantMessage.setFactory(new InstantMessageFactory());
    ns.dkd.InstantMessageFactory = InstantMessageFactory;
    ns.dkd.registers("InstantMessageFactory");
})(DaoKeDao);
(function (ns) {
    var SecureMessage = ns.protocol.SecureMessage;
    var EncryptedMessage = ns.dkd.EncryptedMessage;
    var NetworkMessage = ns.dkd.NetworkMessage;
    var SecureMessageFactory = function () {
        Object.call(this);
    };
    ns.Class(SecureMessageFactory, Object, [SecureMessage.Factory], null);
    SecureMessageFactory.prototype.parseSecureMessage = function (msg) {
        if (msg["signature"]) {
            return new NetworkMessage(msg);
        }
        return new EncryptedMessage(msg);
    };
    SecureMessage.setFactory(new SecureMessageFactory());
    ns.dkd.SecureMessageFactory = SecureMessageFactory;
    ns.dkd.registers("SecureMessageFactory");
})(DaoKeDao);
(function (ns) {
    var ReliableMessage = ns.protocol.ReliableMessage;
    var NetworkMessage = ns.dkd.NetworkMessage;
    var ReliableMessageFactory = function () {
        Object.call(this);
    };
    ns.Class(ReliableMessageFactory, Object, [ReliableMessage.Factory], null);
    ReliableMessageFactory.prototype.parseReliableMessage = function (msg) {
        if (!msg["sender"] || !msg["data"] || !msg["signature"]) {
            return null;
        }
        return new NetworkMessage(msg);
    };
    ReliableMessage.setFactory(new ReliableMessageFactory());
    ns.dkd.ReliableMessageFactory = ReliableMessageFactory;
    ns.dkd.registers("ReliableMessageFactory");
})(DaoKeDao);
if (typeof DIMP !== "object") {
    DIMP = new MingKeMing.Namespace();
}
(function (ns, base) {
    base.exports(ns);
    if (typeof ns.assert !== "function") {
        ns.assert = console.assert;
    }
    if (typeof ns.core !== "object") {
        ns.core = new ns.Namespace();
    }
    if (typeof ns.dkd !== "object") {
        ns.dkd = new ns.Namespace();
    }
    if (typeof ns.mkm !== "object") {
        ns.mkm = new ns.Namespace();
    }
    if (typeof ns.protocol !== "object") {
        ns.protocol = new ns.Namespace();
    }
    if (typeof ns.protocol.group !== "object") {
        ns.protocol.group = new ns.Namespace();
    }
    ns.registers("core");
    ns.registers("dkd");
    ns.registers("mkm");
    ns.registers("protocol");
    ns.protocol.registers("group");
})(DIMP, DaoKeDao);
(function (ns) {
    var ReliableMessage = ns.protocol.ReliableMessage;
    var Content = ns.protocol.Content;
    var ForwardContent = function () {};
    ns.Interface(ForwardContent, [Content]);
    ForwardContent.prototype.setMessage = function (secret) {
        ns.assert(false, "implement me!");
    };
    ForwardContent.prototype.getMessage = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ForwardContent.getMessage = function (content) {
        var secret = content["forward"];
        return ReliableMessage.parse(secret);
    };
    ForwardContent.setMessage = function (secret, content) {
        if (secret) {
            content["forward"] = secret.toMap();
        } else {
            delete content["forward"];
        }
    };
    ns.protocol.ForwardContent = ForwardContent;
    ns.protocol.registers("ForwardContent");
})(DaoKeDao);
(function (ns) {
    var Base64 = ns.format.Base64;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Content = ns.protocol.Content;
    var FileContent = function () {};
    ns.Interface(FileContent, [Content]);
    FileContent.prototype.setURL = function (url) {
        ns.assert(false, "implement me!");
    };
    FileContent.prototype.getURL = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    FileContent.setURL = function (url, content) {
        if (url) {
            content["URL"] = url;
        } else {
            delete content["URL"];
        }
    };
    FileContent.getURL = function (content) {
        return content["URL"];
    };
    FileContent.prototype.setFilename = function (filename) {
        ns.assert(false, "implement me!");
    };
    FileContent.prototype.getFilename = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    FileContent.setFilename = function (filename, content) {
        if (filename) {
            content["filename"] = filename;
        } else {
            delete content["filename"];
        }
    };
    FileContent.getFilename = function (content) {
        return content["filename"];
    };
    FileContent.prototype.setData = function (data) {
        ns.assert(false, "implement me!");
    };
    FileContent.prototype.getData = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    FileContent.setData = function (data, content) {
        if (data) {
            content["data"] = Base64.encode(data);
        } else {
            delete content["data"];
        }
    };
    FileContent.getData = function (content) {
        var base64 = content["data"];
        if (base64) {
            return Base64.decode(base64);
        } else {
            return null;
        }
    };
    FileContent.prototype.setPassword = function (key) {
        ns.assert(false, "implement me!");
    };
    FileContent.prototype.getPassword = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    FileContent.setPassword = function (key, content) {
        if (key) {
            content["password"] = key.toMap();
        } else {
            delete content["password"];
        }
    };
    FileContent.getPassword = function (content) {
        var key = content["password"];
        return SymmetricKey.parse(key);
    };
    ns.protocol.FileContent = FileContent;
    ns.protocol.registers("FileContent");
})(DIMP);
(function (ns) {
    var Base64 = ns.format.Base64;
    var FileContent = ns.protocol.FileContent;
    var ImageContent = function () {};
    ns.Interface(ImageContent, [FileContent]);
    ImageContent.prototype.setThumbnail = function (image) {
        ns.assert(false, "implement me!");
    };
    ImageContent.prototype.getThumbnail = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ImageContent.setThumbnail = function (image, content) {
        if (image) {
            content["thumbnail"] = Base64.encode(image);
        } else {
            delete content["thumbnail"];
        }
    };
    ImageContent.getThumbnail = function (content) {
        var base64 = content["thumbnail"];
        if (base64) {
            return Base64.decode(base64);
        } else {
            return null;
        }
    };
    var VideoContent = function () {};
    ns.Interface(VideoContent, [FileContent]);
    VideoContent.prototype.setSnapshot = function (image) {
        ns.assert(false, "implement me!");
    };
    VideoContent.prototype.getSnapshot = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    VideoContent.setSnapshot = function (image, content) {
        if (image) {
            content["snapshot"] = Base64.encode(image);
        } else {
            delete content["snapshot"];
        }
    };
    VideoContent.getSnapshot = function (content) {
        var base64 = content["snapshot"];
        if (base64) {
            return Base64.decode(base64);
        } else {
            return null;
        }
    };
    var AudioContent = function () {};
    ns.Interface(AudioContent, [FileContent]);
    AudioContent.prototype.setText = function (asr) {
        ns.assert(false, "implement me!");
    };
    AudioContent.prototype.getText = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.protocol.ImageContent = ImageContent;
    ns.protocol.VideoContent = VideoContent;
    ns.protocol.AudioContent = AudioContent;
    ns.protocol.registers("ImageContent");
    ns.protocol.registers("VideoContent");
    ns.protocol.registers("AudioContent");
})(DIMP);
(function (ns) {
    var Content = ns.protocol.Content;
    var TextContent = function () {};
    ns.Interface(TextContent, [Content]);
    TextContent.prototype.setText = function (text) {
        ns.assert(false, "implement me!");
    };
    TextContent.prototype.getText = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.protocol.TextContent = TextContent;
    ns.protocol.registers("TextContent");
})(DIMP);
(function (ns) {
    var Base64 = ns.format.Base64;
    var Content = ns.protocol.Content;
    var PageContent = function () {};
    ns.Interface(PageContent, [Content]);
    PageContent.prototype.setURL = function (url) {
        ns.assert(false, "implement me!");
    };
    PageContent.prototype.getURL = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    PageContent.getURL = function (content) {
        return content["URL"];
    };
    PageContent.setURL = function (url, content) {
        if (url) {
            content["URL"] = url;
        } else {
            delete content["URL"];
        }
    };
    PageContent.prototype.setTitle = function (title) {
        ns.assert(false, "implement me!");
    };
    PageContent.prototype.getTitle = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    PageContent.getTitle = function (content) {
        return content["title"];
    };
    PageContent.setTitle = function (title, content) {
        if (title) {
            content["title"] = title;
        } else {
            delete content["title"];
        }
    };
    PageContent.prototype.setDesc = function (text) {
        ns.assert(false, "implement me!");
    };
    PageContent.prototype.getDesc = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    PageContent.getDesc = function (content) {
        return content["desc"];
    };
    PageContent.setDesc = function (text, content) {
        if (text) {
            content["desc"] = text;
        } else {
            delete content["desc"];
        }
    };
    PageContent.prototype.setIcon = function (image) {
        ns.assert(false, "implement me!");
    };
    PageContent.prototype.getIcon = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    PageContent.setIcon = function (image, content) {
        if (image) {
            content["icon"] = Base64.encode(image);
        } else {
            delete content["icon"];
        }
    };
    PageContent.getIcon = function (content) {
        var base64 = content["icon"];
        if (base64) {
            return Base64.decode(base64);
        } else {
            return null;
        }
    };
    ns.protocol.PageContent = PageContent;
    ns.protocol.registers("PageContent");
})(DIMP);
(function (ns) {
    var Content = ns.protocol.Content;
    var MoneyContent = function () {};
    ns.Interface(MoneyContent, [Content]);
    MoneyContent.prototype.setCurrency = function (currency) {
        ns.assert(false, "implement me!");
    };
    MoneyContent.prototype.getCurrency = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    MoneyContent.setCurrency = function (currency, content) {
        content["currency"] = currency;
    };
    MoneyContent.getCurrency = function (content) {
        return content["currency"];
    };
    MoneyContent.prototype.setAmount = function (amount) {
        ns.assert(false, "implement me!");
    };
    MoneyContent.prototype.getAmount = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    MoneyContent.setAmount = function (amount, content) {
        content["amount"] = amount;
    };
    MoneyContent.getAmount = function (content) {
        return content["amount"];
    };
    var TransferContent = function () {};
    ns.Interface(TransferContent, [MoneyContent]);
    TransferContent.prototype.setComment = function (text) {
        ns.assert(false, "implement me!");
    };
    TransferContent.prototype.getComment = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.protocol.MoneyContent = MoneyContent;
    ns.protocol.TransferContent = TransferContent;
    ns.protocol.registers("MoneyContent");
    ns.protocol.registers("TransferContent");
})(DIMP);
(function (ns) {
    var Content = ns.protocol.Content;
    var Command = function () {};
    ns.Interface(Command, [Content]);
    Command.META = "meta";
    Command.DOCUMENT = "document";
    Command.RECEIPT = "receipt";
    Command.HANDSHAKE = "handshake";
    Command.LOGIN = "login";
    Command.prototype.getCommand = function () {
        ns.assert(false, "implement me!");
        return "";
    };
    Command.getCommand = function (cmd) {
        return cmd["command"];
    };
    var CommandFactory = function () {};
    ns.Interface(CommandFactory, null);
    CommandFactory.prototype.parseCommand = function (cmd) {
        ns.assert(false, "implement me!");
        return null;
    };
    Command.Factory = CommandFactory;
    var s_command_factories = {};
    Command.setFactory = function (name, factory) {
        s_command_factories[name] = factory;
    };
    Command.getFactory = function (name) {
        return s_command_factories[name];
    };
    ns.protocol.Command = Command;
    ns.protocol.registers("Command");
})(DIMP);
(function (ns) {
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var Command = ns.protocol.Command;
    var MetaCommand = function () {};
    ns.Interface(MetaCommand, [Command]);
    MetaCommand.prototype.setIdentifier = function (identifier) {
        ns.assert(false, "implement me!");
    };
    MetaCommand.prototype.getIdentifier = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    MetaCommand.setIdentifier = function (identifier, cmd) {
        if (identifier) {
            cmd["ID"] = identifier.toString();
        } else {
            delete cmd["ID"];
        }
    };
    MetaCommand.getIdentifier = function (cmd) {
        return ID.parse(cmd["ID"]);
    };
    MetaCommand.prototype.setMeta = function (meta) {
        ns.assert(false, "implement me!");
    };
    MetaCommand.prototype.getMeta = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    MetaCommand.setMeta = function (meta, cmd) {
        if (meta) {
            cmd["meta"] = meta.toMap();
        } else {
            delete cmd["meta"];
        }
    };
    MetaCommand.getMeta = function (cmd) {
        return Meta.parse(cmd["meta"]);
    };
    ns.protocol.MetaCommand = MetaCommand;
    ns.protocol.registers("MetaCommand");
})(DIMP);
(function (ns) {
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var Document = ns.protocol.Document;
    var MetaCommand = ns.protocol.MetaCommand;
    var DocumentCommand = function () {};
    ns.Interface(DocumentCommand, [MetaCommand]);
    DocumentCommand.prototype.setDocument = function (doc) {
        ns.assert(false, "implement me!");
    };
    DocumentCommand.prototype.getDocument = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    DocumentCommand.setDocument = function (doc, cmd) {
        if (doc) {
            cmd["document"] = doc.toMap();
        } else {
            delete cmd["command"];
        }
    };
    DocumentCommand.getDocument = function (cmd) {
        var doc = cmd["document"];
        return Document.parse(doc);
    };
    DocumentCommand.prototype.setSignature = function (base64) {
        ns.assert(false, "implement me!");
    };
    DocumentCommand.prototype.getSignature = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    DocumentCommand.setSignature = function (base64, cmd) {
        cmd["signature"] = base64;
    };
    DocumentCommand.getSignature = function (cmd) {
        return cmd["signature"];
    };
    DocumentCommand.query = function (identifier, signature) {
        return new DocumentCommand(identifier, signature);
    };
    DocumentCommand.response = function (identifier, meta, doc) {
        return new DocumentCommand(identifier, meta, doc);
    };
    ns.protocol.DocumentCommand = DocumentCommand;
    ns.protocol.registers("DocumentCommand");
})(DIMP);
(function (ns) {
    var Command = ns.protocol.Command;
    var HistoryCommand = function () {};
    ns.Interface(HistoryCommand, [Command]);
    HistoryCommand.prototype.getHistoryEvent = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    HistoryCommand.getHistoryEvent = function (cmd) {
        return cmd["event"];
    };
    HistoryCommand.REGISTER = "register";
    HistoryCommand.SUICIDE = "suicide";
    ns.protocol.HistoryCommand = HistoryCommand;
    ns.protocol.registers("HistoryCommand");
})(DIMP);
(function (ns) {
    var ID = ns.protocol.ID;
    var HistoryCommand = ns.protocol.HistoryCommand;
    var GroupCommand = function () {};
    ns.Interface(GroupCommand, [HistoryCommand]);
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
    GroupCommand.prototype.setMember = function (identifier) {
        ns.assert(false, "implement me!");
    };
    GroupCommand.prototype.getMember = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    GroupCommand.prototype.setMembers = function (members) {
        ns.assert(false, "implement me!");
    };
    GroupCommand.prototype.getMembers = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    GroupCommand.setMember = function (member, cmd) {
        if (member) {
            cmd["member"] = member.toString();
        } else {
            delete cmd["member"];
        }
    };
    GroupCommand.getMember = function (cmd) {
        return ID.parse(cmd["member"]);
    };
    GroupCommand.setMembers = function (members, cmd) {
        if (members) {
            cmd["members"] = ID.revert(members);
        } else {
            delete cmd["members"];
        }
    };
    GroupCommand.getMembers = function (cmd) {
        var members = cmd["members"];
        if (members) {
            return ID.convert(members);
        } else {
            return null;
        }
    };
    ns.protocol.GroupCommand = GroupCommand;
    ns.protocol.registers("GroupCommand");
})(DIMP);
(function (ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var InviteCommand = function () {};
    ns.Interface(InviteCommand, [GroupCommand]);
    InviteCommand.prototype.getInviteMembers = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    var ExpelCommand = function () {};
    ns.Interface(ExpelCommand, [GroupCommand]);
    ExpelCommand.prototype.getExpelMembers = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    var JoinCommand = function () {};
    ns.Interface(JoinCommand, [GroupCommand]);
    JoinCommand.prototype.getAsk = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    var QuitCommand = function () {};
    ns.Interface(QuitCommand, [GroupCommand]);
    QuitCommand.prototype.getBye = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    var ResetCommand = function () {};
    ns.Interface(ResetCommand, [GroupCommand]);
    ResetCommand.prototype.getAllMembers = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    var QueryCommand = function () {};
    ns.Interface(QueryCommand, [GroupCommand]);
    QueryCommand.prototype.getText = function () {
        ns.assert(false, "implement me!");
        return null;
    };
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
    ns.protocol.group.registers("QueryCommand");
})(DIMP);
(function (ns) {
    var ReliableMessage = ns.protocol.ReliableMessage;
    var ContentType = ns.protocol.ContentType;
    var ForwardContent = ns.protocol.ForwardContent;
    var BaseContent = ns.dkd.BaseContent;
    var SecretContent = function () {
        if (arguments.length === 0) {
            BaseContent.call(this, ContentType.FORWARD);
            this.__forward = null;
        } else {
            if (ns.Interface.conforms(arguments[0], ReliableMessage)) {
                BaseContent.call(this, ContentType.FORWARD);
                this.setMessage(arguments[0]);
            } else {
                BaseContent.call(this, arguments[0]);
                this.__forward = null;
            }
        }
    };
    ns.Class(SecretContent, BaseContent, [ForwardContent], {
        getMessage: function () {
            if (!this.__forward) {
                var dict = this.toMap();
                this.__forward = ForwardContent.getMessage(dict);
            }
            return this.__forward;
        },
        setMessage: function (secret) {
            var dict = this.toMap();
            ForwardContent.setMessage(secret, dict);
            this.__forward = secret;
        }
    });
    ns.dkd.SecretContent = SecretContent;
    ns.dkd.registers("SecretContent");
})(DaoKeDao);
(function (ns) {
    var ContentType = ns.protocol.ContentType;
    var FileContent = ns.protocol.FileContent;
    var BaseContent = ns.dkd.BaseContent;
    var BaseFileContent = function () {
        if (arguments.length === 0) {
            BaseContent.call(this, ContentType.FILE);
            this.__data = null;
        } else {
            if (arguments.length === 1) {
                BaseContent.call(this, arguments[0]);
                this.__data = null;
            } else {
                if (arguments.length === 2) {
                    BaseContent.call(this, ContentType.FILE);
                    this.setFilename(arguments[0]);
                    this.setData(arguments[1]);
                } else {
                    if (arguments.length === 3) {
                        BaseContent.call(this, arguments[0]);
                        this.setFilename(arguments[1]);
                        this.setData(arguments[2]);
                    } else {
                        throw new SyntaxError("file content arguments error: " + arguments);
                    }
                }
            }
        }
        this.__password = null;
    };
    ns.Class(BaseFileContent, BaseContent, [FileContent], {
        setURL: function (url) {
            var dict = this.toMap();
            FileContent.setURL(url, dict);
        },
        getURL: function () {
            var dict = this.toMap();
            return FileContent.getURL(dict);
        },
        setFilename: function (filename) {
            var dict = this.toMap();
            FileContent.setFilename(filename, dict);
        },
        getFilename: function () {
            var dict = this.toMap();
            return FileContent.getFilename(dict);
        },
        setData: function (data) {
            var dict = this.toMap();
            FileContent.setData(data, dict);
            this.__data = data;
        },
        getData: function () {
            if (!this.__data) {
                var dict = this.toMap();
                this.__data = FileContent.getData(dict);
            }
            return this.__data;
        },
        setPassword: function (key) {
            var dict = this.toMap();
            FileContent.setPassword(key, dict);
            this.__password = key;
        },
        getPassword: function () {
            if (!this.__password) {
                var dict = this.toMap();
                this.__password = FileContent.getPassword(dict);
            }
            return this.__password;
        }
    });
    ns.dkd.BaseFileContent = BaseFileContent;
    ns.dkd.registers("BaseFileContent");
})(DIMP);
(function (ns) {
    var ContentType = ns.protocol.ContentType;
    var FileContent = ns.protocol.FileContent;
    var ImageContent = ns.protocol.ImageContent;
    var VideoContent = ns.protocol.VideoContent;
    var AudioContent = ns.protocol.AudioContent;
    var BaseFileContent = ns.dkd.BaseFileContent;
    var ImageFileContent = function () {
        if (arguments.length === 0) {
            BaseFileContent.call(this, ContentType.IMAGE);
        } else {
            if (arguments.length === 1) {
                BaseFileContent.call(this, arguments[0]);
            } else {
                if (arguments.length === 2) {
                    BaseFileContent.call(
                        this,
                        ContentType.IMAGE,
                        arguments[0],
                        arguments[1]
                    );
                } else {
                    throw new SyntaxError("image content arguments error: " + arguments);
                }
            }
        }
        this.__thumbnail = null;
    };
    ns.Class(ImageFileContent, BaseFileContent, [ImageContent], {
        getThumbnail: function () {
            if (!this.__thumbnail) {
                var dict = this.toMap();
                this.__thumbnail = ImageContent.getThumbnail(dict);
            }
            return this.__thumbnail;
        },
        setThumbnail: function (image) {
            var dict = this.toMap();
            ImageContent.setThumbnail(image, dict);
            this.__thumbnail = image;
        }
    });
    var VideoFileContent = function () {
        if (arguments.length === 0) {
            BaseFileContent.call(this, ContentType.VIDEO);
        } else {
            if (arguments.length === 1) {
                BaseFileContent.call(this, arguments[0]);
            } else {
                if (arguments.length === 2) {
                    BaseFileContent.call(
                        this,
                        ContentType.VIDEO,
                        arguments[0],
                        arguments[1]
                    );
                } else {
                    throw new SyntaxError("video content arguments error: " + arguments);
                }
            }
        }
        this.__snapshot = null;
    };
    ns.Class(VideoFileContent, BaseFileContent, [VideoContent], {
        getSnapshot: function () {
            if (!this.__snapshot) {
                var dict = this.toMap();
                this.__snapshot = VideoContent.getSnapshot(dict);
            }
            return this.__snapshot;
        },
        setSnapshot: function (image) {
            var dict = this.toMap();
            VideoContent.setSnapshot(image, dict);
            this.__snapshot = image;
        }
    });
    var AudioFileContent = function () {
        if (arguments.length === 0) {
            BaseFileContent.call(this, ContentType.AUDIO);
        } else {
            if (arguments.length === 1) {
                BaseFileContent.call(this, arguments[0]);
            } else {
                if (arguments.length === 2) {
                    BaseFileContent.call(
                        this,
                        ContentType.AUDIO,
                        arguments[0],
                        arguments[1]
                    );
                } else {
                    throw new SyntaxError("audio content arguments error: " + arguments);
                }
            }
        }
    };
    ns.Class(AudioFileContent, BaseFileContent, [AudioContent], {
        getText: function () {
            return this.getValue("text");
        },
        setText: function (asr) {
            this.setValue("text", asr);
        }
    });
    FileContent.file = function (filename, data) {
        return new BaseFileContent(filename, data);
    };
    FileContent.image = function (filename, data) {
        return new ImageFileContent(filename, data);
    };
    FileContent.audio = function (filename, data) {
        return new AudioFileContent(filename, data);
    };
    FileContent.video = function (filename, data) {
        return new VideoFileContent(filename, data);
    };
    ns.dkd.ImageFileContent = ImageFileContent;
    ns.dkd.VideoFileContent = VideoFileContent;
    ns.dkd.AudioFileContent = AudioFileContent;
    ns.dkd.registers("ImageFileContent");
    ns.dkd.registers("VideoFileContent");
    ns.dkd.registers("AudioFileContent");
})(DIMP);
(function (ns) {
    var ContentType = ns.protocol.ContentType;
    var TextContent = ns.protocol.TextContent;
    var BaseContent = ns.dkd.BaseContent;
    var BaseTextContent = function () {
        if (arguments.length === 0) {
            BaseContent.call(this, ContentType.TEXT);
        } else {
            if (typeof arguments[0] === "string") {
                BaseContent.call(this, ContentType.TEXT);
                this.setText(arguments[0]);
            } else {
                BaseContent.call(this, arguments[0]);
            }
        }
    };
    ns.Class(BaseTextContent, BaseContent, [TextContent], {
        getText: function () {
            return this.getValue("text");
        },
        setText: function (text) {
            this.setValue("text", text);
        }
    });
    ns.dkd.BaseTextContent = BaseTextContent;
    ns.dkd.registers("BaseTextContent");
})(DIMP);
(function (ns) {
    var ContentType = ns.protocol.ContentType;
    var PageContent = ns.protocol.PageContent;
    var BaseContent = ns.dkd.BaseContent;
    var WebPageContent = function () {
        if (arguments.length === 1) {
            BaseContent.call(this, arguments[0]);
            this.__icon = null;
        } else {
            if (arguments.length === 4) {
                BaseContent.call(this, ContentType.PAGE);
                this.setURL(arguments[0]);
                this.setTitle(arguments[1]);
                this.setDesc(arguments[2]);
                this.setIcon(arguments[3]);
            } else {
                throw new SyntaxError("web page content arguments error: " + arguments);
            }
        }
    };
    ns.Class(WebPageContent, BaseContent, [PageContent], {
        getURL: function () {
            var dict = this.toMap();
            return PageContent.getURL(dict);
        },
        setURL: function (url) {
            var dict = this.toMap();
            PageContent.setURL(url, dict);
        },
        getTitle: function () {
            var dict = this.toMap();
            return PageContent.getTitle(dict);
        },
        setTitle: function (title) {
            var dict = this.toMap();
            PageContent.setTitle(title, dict);
        },
        getDesc: function () {
            var dict = this.toMap();
            return PageContent.getDesc(dict);
        },
        setDesc: function (text) {
            var dict = this.toMap();
            PageContent.setDesc(text, dict);
        },
        getIcon: function () {
            if (!this.__icon) {
                var dict = this.toMap();
                this.__icon = PageContent.getIcon(dict);
            }
            return this.__icon;
        },
        setIcon: function (image) {
            var dict = this.toMap();
            PageContent.setIcon(image, dict);
            this.__icon = image;
        }
    });
    ns.dkd.WebPageContent = WebPageContent;
    ns.dkd.registers("WebPageContent");
})(DIMP);
(function (ns) {
    var ContentType = ns.protocol.ContentType;
    var MoneyContent = ns.protocol.MoneyContent;
    var TransferContent = ns.protocol.TransferContent;
    var BaseContent = ns.dkd.BaseContent;
    var BaseMoneyContent = function () {
        if (arguments.length === 3) {
            BaseContent.call(arguments[0]);
            this.setCurrency(arguments[1]);
            this.setAmount(arguments[2]);
        } else {
            if (arguments.length === 2) {
                BaseContent.call(ContentType.MONEY);
                this.setCurrency(arguments[0]);
                this.setAmount(arguments[1]);
            } else {
                if (typeof arguments[0] === "string") {
                    BaseContent.call(ContentType.MONEY);
                    this.setCurrency(arguments[0]);
                } else {
                    BaseContent.call(arguments[0]);
                }
            }
        }
    };
    ns.Class(BaseMoneyContent, BaseContent, [MoneyContent], {
        setCurrency: function (currency) {
            var dict = this.toMap();
            MoneyContent.setCurrency(currency, dict);
        },
        getCurrency: function () {
            var dict = this.toMap();
            return MoneyContent.getCurrency(dict);
        },
        setAmount: function (amount) {
            var dict = this.toMap();
            MoneyContent.setAmount(amount, dict);
        },
        getAmount: function () {
            var dict = this.toMap();
            return MoneyContent.getAmount(dict);
        }
    });
    var TransferMoneyContent = function () {
        if (arguments.length === 2) {
            MoneyContent.call(ContentType.TRANSFER, arguments[0], arguments[1]);
        } else {
            if (typeof arguments[0] === "string") {
                MoneyContent.call(ContentType.TRANSFER, arguments[0], 0);
            } else {
                MoneyContent.call(arguments[0]);
            }
        }
    };
    ns.Class(TransferMoneyContent, BaseMoneyContent, [TransferContent], {
        getText: function () {
            return this.getValue("text");
        },
        setText: function (text) {
            this.setValue("text", text);
        }
    });
    ns.dkd.BaseMoneyContent = BaseMoneyContent;
    ns.dkd.TransferMoneyContent = TransferMoneyContent;
    ns.dkd.registers("BaseMoneyContent");
    ns.dkd.registers("TransferMoneyContent");
})(DIMP);
(function (ns) {
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var BaseContent = ns.dkd.BaseContent;
    var BaseCommand = function () {
        if (arguments.length === 2) {
            BaseContent.call(this, arguments[0]);
            this.setValue("command", arguments[1]);
        } else {
            if (typeof arguments[0] === "string") {
                BaseContent.call(this, ContentType.COMMAND);
                this.setValue("command", arguments[0]);
            } else {
                BaseContent.call(this, arguments[0]);
            }
        }
    };
    ns.Class(BaseCommand, BaseContent, [Command], {
        getCommand: function () {
            var dict = this.toMap();
            return Command.getCommand(dict);
        }
    });
    ns.dkd.BaseCommand = BaseCommand;
    ns.dkd.registers("BaseCommand");
})(DIMP);
(function (ns) {
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var Command = ns.protocol.Command;
    var MetaCommand = ns.protocol.MetaCommand;
    var BaseCommand = ns.dkd.BaseCommand;
    var BaseMetaCommand = function () {
        if (arguments.length === 1) {
            if (ns.Interface.conforms(arguments[0], ID)) {
                BaseCommand.call(this, Command.META);
                this.setIdentifier(arguments[0]);
            } else {
                BaseCommand.call(this, arguments[0]);
                this.__identifier = null;
            }
            this.__meta = null;
        } else {
            if (arguments.length === 2) {
                if (ns.Interface.conforms(arguments[0], ID)) {
                    BaseCommand.call(this, Command.META);
                    this.setIdentifier(arguments[0]);
                    this.setMeta(arguments[1]);
                } else {
                    BaseCommand.call(this, arguments[0]);
                    this.setIdentifier(arguments[1]);
                    this.__meta = null;
                }
            } else {
                if (arguments.length === 3) {
                    BaseCommand.call(this, arguments[0]);
                    this.setIdentifier(arguments[1]);
                    this.setMeta(arguments[2]);
                } else {
                    throw new SyntaxError("meta command arguments error: " + arguments);
                }
            }
        }
    };
    ns.Class(BaseMetaCommand, BaseCommand, [MetaCommand], {
        setIdentifier: function (identifier) {
            var dict = this.toMap();
            MetaCommand.setIdentifier(identifier, dict);
            this.__identifier = identifier;
        },
        getIdentifier: function () {
            if (!this.__identifier) {
                var dict = this.toMap();
                this.__identifier = MetaCommand.getIdentifier(dict);
            }
            return this.__identifier;
        },
        setMeta: function (meta) {
            var dict = this.toMap();
            MetaCommand.setMeta(meta, dict);
            this.__meta = meta;
        },
        getMeta: function () {
            if (!this.__meta) {
                var dict = this.toMap();
                this.__meta = MetaCommand.getMeta(dict);
            }
            return this.__meta;
        }
    });
    MetaCommand.query = function (identifier) {
        return new BaseMetaCommand(identifier);
    };
    MetaCommand.response = function (identifier, meta) {
        return new BaseMetaCommand(identifier, meta);
    };
    ns.dkd.BaseMetaCommand = BaseMetaCommand;
    ns.dkd.registers("BaseMetaCommand");
})(DIMP);
(function (ns) {
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var Document = ns.protocol.Document;
    var Command = ns.protocol.Command;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var BaseMetaCommand = ns.dkd.BaseMetaCommand;
    var BaseDocumentCommand = function () {
        if (arguments.length === 1) {
            if (ns.Interface.conforms(arguments[0], ID)) {
                BaseMetaCommand.call(this, Command.DOCUMENT, arguments[0]);
            } else {
                BaseMetaCommand.call(this, arguments[0]);
            }
            this.__document = null;
        } else {
            if (arguments.length === 2) {
                if (ns.Interface.conforms(arguments[1], Meta)) {
                    BaseMetaCommand.call(
                        this,
                        Command.DOCUMENT,
                        arguments[0],
                        arguments[1]
                    );
                } else {
                    if (typeof arguments[1] === "string") {
                        BaseMetaCommand.call(this, Command.DOCUMENT, arguments[0], null);
                        this.setSignature(arguments[1]);
                    } else {
                        throw new SyntaxError(
                            "document command arguments error: " + arguments
                        );
                    }
                }
                this.__document = null;
            } else {
                if (arguments.length === 3) {
                    BaseMetaCommand.call(
                        this,
                        Command.DOCUMENT,
                        arguments[0],
                        arguments[1]
                    );
                    this.setDocument(arguments[2]);
                } else {
                    throw new SyntaxError(
                        "document command arguments error: " + arguments
                    );
                }
            }
        }
    };
    ns.Class(BaseDocumentCommand, BaseMetaCommand, [DocumentCommand], {
        setDocument: function (doc) {
            var dict = this.toMap();
            DocumentCommand.setDocument(doc, dict);
            this.__document = doc;
        },
        getDocument: function () {
            if (!this.__document) {
                var dict = this.toMap();
                this.__document = DocumentCommand.getDocument(dict);
            }
            return this.__document;
        },
        setSignature: function (base64) {
            var dict = this.toMap();
            DocumentCommand.setSignature(base64, dict);
        },
        getSignature: function () {
            var dict = this.toMap();
            return DocumentCommand.getSignature(dict);
        }
    });
    DocumentCommand.query = function (identifier, signature) {
        return new BaseDocumentCommand(identifier, signature);
    };
    DocumentCommand.response = function (identifier, meta, doc) {
        return new BaseDocumentCommand(identifier, meta, doc);
    };
    ns.dkd.BaseDocumentCommand = BaseDocumentCommand;
    ns.dkd.registers("BaseDocumentCommand");
})(DIMP);
(function (ns) {
    var ContentType = ns.protocol.ContentType;
    var HistoryCommand = ns.protocol.HistoryCommand;
    var BaseCommand = ns.dkd.BaseCommand;
    var BaseHistoryCommand = function () {
        if (arguments.length === 2) {
            BaseCommand.call(this, arguments[0], arguments[1]);
        } else {
            if (typeof arguments[0] === "string") {
                BaseCommand.call(this, ContentType.HISTORY, arguments[0]);
            } else {
                BaseCommand.call(this, arguments[0]);
            }
        }
    };
    ns.Class(BaseHistoryCommand, BaseCommand, [HistoryCommand], {
        getHistoryEvent: function () {
            var dict = this.toMap();
            return HistoryCommand.getHistoryEvent(dict);
        }
    });
    ns.dkd.BaseHistoryCommand = BaseHistoryCommand;
    ns.dkd.registers("BaseHistoryCommand");
})(DIMP);
(function (ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var BaseHistoryCommand = ns.dkd.BaseHistoryCommand;
    var BaseGroupCommand = function () {
        if (arguments.length === 1) {
            BaseHistoryCommand.call(this, arguments[0]);
            this.__member = null;
            this.__members = null;
        } else {
            if (arguments.length === 2) {
                BaseHistoryCommand.call(this, arguments[0]);
                this.setGroup(arguments[1]);
                this.__member = null;
                this.__members = null;
            } else {
                if (arguments[2] instanceof Array) {
                    BaseHistoryCommand.call(this, arguments[0]);
                    this.setGroup(arguments[1]);
                    this.__member = null;
                    this.setMembers(arguments[2]);
                } else {
                    BaseHistoryCommand.call(this, arguments[0]);
                    this.setGroup(arguments[1]);
                    this.setMember(arguments[2]);
                    this.__members = null;
                }
            }
        }
    };
    ns.Class(BaseGroupCommand, BaseHistoryCommand, [GroupCommand], {
        setMember: function (identifier) {
            var dict = this.toMap();
            GroupCommand.setMembers(null, dict);
            GroupCommand.setMember(identifier, dict);
            this.__member = identifier;
        },
        getMember: function () {
            if (!this.__member) {
                var dict = this.toMap();
                this.__member = GroupCommand.getMember(dict);
            }
            return this.__member;
        },
        setMembers: function (members) {
            var dict = this.toMap();
            GroupCommand.setMember(null, dict);
            GroupCommand.setMembers(members, dict);
            this.__members = members;
        },
        getMembers: function () {
            if (!this.__members) {
                var dict = this.toMap();
                this.__members = GroupCommand.getMembers(dict);
            }
            return this.__members;
        }
    });
    ns.dkd.BaseGroupCommand = BaseGroupCommand;
    ns.dkd.registers("BaseGroupCommand");
})(DIMP);
(function (ns) {
    var ID = ns.protocol.ID;
    var GroupCommand = ns.protocol.GroupCommand;
    var InviteCommand = ns.protocol.group.InviteCommand;
    var ExpelCommand = ns.protocol.group.ExpelCommand;
    var JoinCommand = ns.protocol.group.JoinCommand;
    var QuitCommand = ns.protocol.group.QuitCommand;
    var ResetCommand = ns.protocol.group.ResetCommand;
    var QueryCommand = ns.protocol.group.QueryCommand;
    var BaseGroupCommand = ns.dkd.BaseGroupCommand;
    var InviteGroupCommand = function () {
        if (arguments.length === 1) {
            BaseGroupCommand.call(this, arguments[0]);
        } else {
            BaseGroupCommand.call(
                this,
                GroupCommand.INVITE,
                arguments[0],
                arguments[1]
            );
        }
    };
    ns.Class(InviteGroupCommand, BaseGroupCommand, [InviteCommand], {
        getInviteMembers: function () {
            return this.getMembers();
        }
    });
    var ExpelGroupCommand = function () {
        if (arguments.length === 1) {
            BaseGroupCommand.call(this, arguments[0]);
        } else {
            BaseGroupCommand.call(
                this,
                GroupCommand.EXPEL,
                arguments[0],
                arguments[1]
            );
        }
    };
    ns.Class(ExpelGroupCommand, BaseGroupCommand, [ExpelCommand], {
        getExpelMembers: function () {
            return this.getMembers();
        }
    });
    var JoinGroupCommand = function () {
        if (ns.Interface.conforms(arguments[0], ID)) {
            BaseGroupCommand.call(this, GroupCommand.JOIN, arguments[0]);
        } else {
            BaseGroupCommand.call(this, arguments[0]);
        }
    };
    ns.Class(JoinGroupCommand, BaseGroupCommand, [JoinCommand], {
        getAsk: function () {
            return this.getValue("text");
        }
    });
    var QuitGroupCommand = function () {
        if (ns.Interface.conforms(arguments[0], ID)) {
            BaseGroupCommand.call(this, GroupCommand.QUIT, arguments[0]);
        } else {
            BaseGroupCommand.call(this, arguments[0]);
        }
    };
    ns.Class(QuitGroupCommand, BaseGroupCommand, [QuitCommand], {
        getBye: function () {
            return this.getValue("text");
        }
    });
    var ResetGroupCommand = function () {
        if (arguments.length === 1) {
            BaseGroupCommand.call(this, arguments[0]);
        } else {
            BaseGroupCommand.call(
                this,
                GroupCommand.RESET,
                arguments[0],
                arguments[1]
            );
        }
    };
    ns.Class(ResetGroupCommand, BaseGroupCommand, [ResetCommand], {
        getAllMembers: function () {
            return this.getMembers();
        }
    });
    var QueryGroupCommand = function () {
        if (ns.Interface.conforms(arguments[0], ID)) {
            BaseGroupCommand.call(this, GroupCommand.QUERY, arguments[0]);
        } else {
            BaseGroupCommand.call(this, arguments[0]);
        }
    };
    ns.Class(QueryGroupCommand, BaseGroupCommand, [QueryCommand], {
        getText: function () {
            return this.getValue("text");
        }
    });
    GroupCommand.invite = function (group, members) {
        return new InviteGroupCommand(group, members);
    };
    GroupCommand.expel = function (group, members) {
        return new ExpelGroupCommand(group, members);
    };
    GroupCommand.join = function (group) {
        return new JoinGroupCommand(group);
    };
    GroupCommand.quit = function (group) {
        return new QuitGroupCommand(group);
    };
    GroupCommand.reset = function (group, members) {
        return new ResetGroupCommand(group, members);
    };
    GroupCommand.query = function (group) {
        return new QueryGroupCommand(group);
    };
    ns.dkd.InviteGroupCommand = InviteGroupCommand;
    ns.dkd.ExpelGroupCommand = ExpelGroupCommand;
    ns.dkd.JoinGroupCommand = JoinGroupCommand;
    ns.dkd.QuitGroupCommand = QuitGroupCommand;
    ns.dkd.ResetGroupCommand = ResetGroupCommand;
    ns.dkd.QueryGroupCommand = QueryGroupCommand;
    ns.dkd.registers("InviteGroupCommand");
    ns.dkd.registers("ExpelGroupCommand");
    ns.dkd.registers("JoinGroupCommand");
    ns.dkd.registers("QuitGroupCommand");
    ns.dkd.registers("ResetGroupCommand");
    ns.dkd.registers("QueryGroupCommand");
})(DIMP);
(function (ns) {
    var Entity = function () {};
    ns.Interface(Entity, [ns.type.Object]);
    Entity.prototype.getIdentifier = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Entity.prototype.getType = function () {
        ns.assert(false, "implement me!");
        return 0;
    };
    Entity.prototype.getMeta = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Entity.prototype.getDocument = function (type) {
        ns.assert(false, "implement me!");
        return null;
    };
    Entity.prototype.setDataSource = function (barrack) {
        ns.assert(false, "implement me!");
    };
    Entity.prototype.getDataSource = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    var EntityDataSource = function () {};
    ns.Interface(EntityDataSource, null);
    EntityDataSource.prototype.getMeta = function (identifier) {
        ns.assert(false, "implement me!");
        return null;
    };
    EntityDataSource.prototype.getDocument = function (identifier, type) {
        ns.assert(false, "implement me!");
        return null;
    };
    var EntityDelegate = function () {};
    ns.Interface(EntityDelegate, null);
    EntityDelegate.prototype.getUser = function (identifier) {
        ns.assert(false, "implement me!");
        return null;
    };
    EntityDelegate.prototype.getGroup = function (identifier) {
        ns.assert(false, "implement me!");
        return null;
    };
    Entity.DataSource = EntityDataSource;
    Entity.Delegate = EntityDelegate;
    ns.mkm.Entity = Entity;
    ns.mkm.registers("Entity");
})(DIMP);
(function (ns) {
    var BaseObject = ns.type.BaseObject;
    var Entity = ns.mkm.Entity;
    var BaseEntity = function (identifier) {
        BaseObject.call(this);
        this.__identifier = identifier;
        this.__datasource = null;
    };
    ns.Class(BaseEntity, BaseObject, [Entity], null);
    BaseEntity.prototype.equals = function (other) {
        if (!other) {
            return false;
        } else {
            if (ns.Interface.conforms(other, Entity)) {
                other = other.getIdentifier();
            }
        }
        return this.__identifier.equals(other);
    };
    BaseEntity.prototype.valueOf = function () {
        return desc.call(this);
    };
    BaseEntity.prototype.toString = function () {
        return desc.call(this);
    };
    var desc = function () {
        var clazz = Object.getPrototypeOf(this).constructor;
        return (
            "<" +
            clazz.name +
            "|" +
            this.__identifier.getType() +
            " " +
            this.__identifier +
            ">"
        );
    };
    BaseEntity.prototype.setDataSource = function (delegate) {
        this.__datasource = delegate;
    };
    BaseEntity.prototype.getDataSource = function () {
        return this.__datasource;
    };
    BaseEntity.prototype.getIdentifier = function () {
        return this.__identifier;
    };
    BaseEntity.prototype.getType = function () {
        return this.__identifier.getType();
    };
    BaseEntity.prototype.getMeta = function () {
        return this.__datasource.getMeta(this.__identifier);
    };
    BaseEntity.prototype.getDocument = function (type) {
        return this.__datasource.getDocument(this.__identifier, type);
    };
    ns.mkm.BaseEntity = BaseEntity;
    ns.mkm.registers("BaseEntity");
})(DIMP);
(function (ns) {
    var Entity = ns.mkm.Entity;
    var User = function () {};
    ns.Interface(User, [Entity]);
    User.prototype.getVisa = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    User.prototype.getContacts = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    User.prototype.verify = function (data, signature) {
        ns.assert(false, "implement me!");
        return false;
    };
    User.prototype.encrypt = function (plaintext) {
        ns.assert(false, "implement me!");
        return null;
    };
    User.prototype.sign = function (data) {
        ns.assert(false, "implement me!");
        return null;
    };
    User.prototype.decrypt = function (ciphertext) {
        ns.assert(false, "implement me!");
        return null;
    };
    User.prototype.signVisa = function (visa) {
        ns.assert(false, "implement me!");
        return null;
    };
    User.prototype.verifyVisa = function (visa) {
        ns.assert(false, "implement me!");
        return null;
    };
    var UserDataSource = function () {};
    ns.Interface(UserDataSource, [Entity.DataSource]);
    UserDataSource.prototype.getContacts = function (identifier) {
        ns.assert(false, "implement me!");
        return null;
    };
    UserDataSource.prototype.getPublicKeyForEncryption = function (identifier) {
        return null;
    };
    UserDataSource.prototype.getPublicKeysForVerification = function (
        identifier
    ) {
        return null;
    };
    UserDataSource.prototype.getPrivateKeysForDecryption = function (identifier) {
        ns.assert(false, "implement me!");
        return null;
    };
    UserDataSource.prototype.getPrivateKeyForSignature = function (identifier) {
        ns.assert(false, "implement me!");
        return null;
    };
    UserDataSource.prototype.getPrivateKeyForVisaSignature = function (
        identifier
    ) {
        ns.assert(false, "implement me!");
        return null;
    };
    User.DataSource = UserDataSource;
    ns.mkm.User = User;
    ns.mkm.registers("User");
})(DIMP);
(function (ns) {
    var Document = ns.protocol.Document;
    var Visa = ns.protocol.Visa;
    var User = ns.mkm.User;
    var BaseEntity = ns.mkm.BaseEntity;
    var BaseUser = function (identifier) {
        BaseEntity.call(this, identifier);
    };
    ns.Class(BaseUser, BaseEntity, [User], {
        getVisa: function () {
            var doc = this.getDocument(Document.VISA);
            if (ns.Interface.conforms(doc, Visa)) {
                return doc;
            } else {
                return null;
            }
        },
        getContacts: function () {
            var barrack = this.getDataSource();
            var uid = this.getIdentifier();
            return barrack.getContacts(uid);
        },
        verify: function (data, signature) {
            var barrack = this.getDataSource();
            var uid = this.getIdentifier();
            var keys = barrack.getPublicKeysForVerification(uid);
            if (!keys || keys.length === 0) {
                throw new Error("failed to get verify keys for user: " + uid);
            }
            for (var i = 0; i < keys.length; ++i) {
                if (keys[i].verify(data, signature)) {
                    return true;
                }
            }
            return false;
        },
        encrypt: function (plaintext) {
            var barrack = this.getDataSource();
            var uid = this.getIdentifier();
            var key = barrack.getPublicKeyForEncryption(uid);
            if (!key) {
                throw new Error("failed to get encrypt key for user: " + uid);
            }
            return key.encrypt(plaintext);
        },
        sign: function (data) {
            var barrack = this.getDataSource();
            var uid = this.getIdentifier();
            var key = barrack.getPrivateKeyForSignature(uid);
            if (!key) {
                throw new Error("failed to get sign key for user: " + uid);
            }
            return key.sign(data);
        },
        decrypt: function (ciphertext) {
            var barrack = this.getDataSource();
            var uid = this.getIdentifier();
            var keys = barrack.getPrivateKeysForDecryption(uid);
            if (!keys || keys.length === 0) {
                throw new Error("failed to get decrypt keys for user: " + uid);
            }
            var plaintext;
            for (var i = 0; i < keys.length; ++i) {
                try {
                    plaintext = keys[i].decrypt(ciphertext);
                    if (plaintext && plaintext.length > 0) {
                        return plaintext;
                    }
                } catch (e) {
                    console.log("User::decrypt() error", this, e, keys[i], ciphertext);
                }
            }
            return null;
        },
        signVisa: function (visa) {
            var uid = this.getIdentifier();
            if (!uid.equals(visa.getIdentifier())) {
                return null;
            }
            var barrack = this.getDataSource();
            var key = barrack.getPrivateKeyForVisaSignature(uid);
            if (!key) {
                throw new Error("failed to get sign key for user: " + uid);
            }
            visa.sign(key);
            return visa;
        },
        verifyVisa: function (visa) {
            var uid = this.getIdentifier();
            if (!uid.equals(visa.getIdentifier())) {
                return null;
            }
            var meta = this.getMeta();
            var key = meta.getKey();
            if (!key) {
                throw new Error("failed to get meta key for user: " + uid);
            }
            return visa.verify(key);
        }
    });
    ns.mkm.BaseUser = BaseUser;
    ns.mkm.registers("BaseUser");
})(DIMP);
(function (ns) {
    var Entity = ns.mkm.Entity;
    var Group = function () {};
    ns.Interface(Group, [Entity]);
    Group.prototype.getBulletin = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Group.prototype.getFounder = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Group.prototype.getOwner = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Group.prototype.getMembers = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Group.prototype.getAssistants = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    var GroupDataSource = function () {};
    ns.Interface(GroupDataSource, [Entity.DataSource]);
    GroupDataSource.prototype.getFounder = function (identifier) {
        ns.assert(false, "implement me!");
        return null;
    };
    GroupDataSource.prototype.getOwner = function (identifier) {
        ns.assert(false, "implement me!");
        return null;
    };
    GroupDataSource.prototype.getMembers = function (identifier) {
        ns.assert(false, "implement me!");
        return null;
    };
    GroupDataSource.prototype.getAssistants = function (identifier) {
        ns.assert(false, "implement me!");
        return null;
    };
    Group.DataSource = GroupDataSource;
    ns.mkm.Group = Group;
    ns.mkm.registers("Group");
})(DIMP);
(function (ns) {
    var Document = ns.protocol.Document;
    var Bulletin = ns.protocol.Bulletin;
    var Group = ns.mkm.Group;
    var BaseEntity = ns.mkm.BaseEntity;
    var BaseGroup = function (identifier) {
        BaseEntity.call(this, identifier);
        this.__founder = null;
    };
    ns.Class(BaseGroup, BaseEntity, [Group], {
        getBulletin: function () {
            var doc = this.getDocument(Document.BULLETIN);
            if (ns.Interface.conforms(doc, Bulletin)) {
                return doc;
            } else {
                return null;
            }
        },
        getFounder: function () {
            if (!this.__founder) {
                var barrack = this.getDataSource();
                var gid = this.getIdentifier();
                this.__founder = barrack.getFounder(gid);
            }
            return this.__founder;
        },
        getOwner: function () {
            var barrack = this.getDataSource();
            var gid = this.getIdentifier();
            return barrack.getOwner(gid);
        },
        getMembers: function () {
            var barrack = this.getDataSource();
            var gid = this.getIdentifier();
            return barrack.getMembers(gid);
        },
        getAssistants: function () {
            var barrack = this.getDataSource();
            var gid = this.getIdentifier();
            return barrack.getAssistants(gid);
        }
    });
    ns.mkm.BaseGroup = BaseGroup;
    ns.mkm.registers("BaseGroup");
})(DIMP);
(function (ns) {
    var EncryptKey = ns.crypto.EncryptKey;
    var VerifyKey = ns.crypto.VerifyKey;
    var ID = ns.protocol.ID;
    var NetworkType = ns.protocol.NetworkType;
    var Meta = ns.protocol.Meta;
    var Document = ns.protocol.Document;
    var Visa = ns.protocol.Visa;
    var Bulletin = ns.protocol.Bulletin;
    var Entity = ns.mkm.Entity;
    var User = ns.mkm.User;
    var Group = ns.mkm.Group;
    var Barrack = function () {
        Object.call(this);
    };
    ns.Class(
        Barrack,
        Object,
        [Entity.Delegate, User.DataSource, Group.DataSource],
        {
            getPublicKeyForEncryption: function (identifier) {
                var key = visa_key.call(this, identifier);
                if (key) {
                    return key;
                }
                key = meta_key.call(this, identifier);
                if (ns.Interface.conforms(key, EncryptKey)) {
                    return key;
                }
                return null;
            },
            getPublicKeysForVerification: function (identifier) {
                var keys = [];
                var key = visa_key.call(this, identifier);
                if (ns.Interface.conforms(key, VerifyKey)) {
                    keys.push(key);
                }
                key = meta_key.call(this, identifier);
                if (key) {
                    keys.push(key);
                }
                return keys;
            },
            getFounder: function (group) {
                if (group.isBroadcast()) {
                    return this.getBroadcastFounder(group);
                }
                var gMeta = this.getMeta(group);
                if (!gMeta) {
                    return null;
                }
                var members = this.getMembers(group);
                if (members) {
                    var item, mMeta;
                    for (var i = 0; i < members.length; ++i) {
                        item = members[i];
                        mMeta = this.getMeta(item);
                        if (!mMeta) {
                            continue;
                        }
                        if (Meta.matches(gMeta, mMeta.getKey())) {
                            return item;
                        }
                    }
                }
                return null;
            },
            getOwner: function (group) {
                if (group.isBroadcast()) {
                    return this.getBroadcastOwner(group);
                }
                if (NetworkType.POLYLOGUE.equals(group.getType())) {
                    return this.getFounder(group);
                }
                return null;
            },
            getMembers: function (group) {
                if (group.isBroadcast()) {
                    return this.getBroadcastMembers(group);
                }
                return null;
            },
            getAssistants: function (group) {
                var doc = this.getDocument(group, Document.BULLETIN);
                if (ns.Interface.conforms(doc, Bulletin)) {
                    if (doc.isValid()) {
                        return doc.getAssistants();
                    }
                }
                return null;
            }
        }
    );
    var visa_key = function (user) {
        var doc = this.getDocument(user, Document.VISA);
        if (ns.Interface.conforms(doc, Visa)) {
            if (doc.isValid()) {
                return doc.getKey();
            }
        }
        return null;
    };
    var meta_key = function (user) {
        var meta = this.getMeta(user);
        if (meta) {
            return meta.getKey();
        }
        return null;
    };
    var group_seed = function (gid) {
        var seed = gid.getName();
        if (seed) {
            var len = seed.length;
            if (len === 0 || (len === 8 && seed.toLowerCase() === "everyone")) {
                seed = null;
            }
        }
        return seed;
    };
    Barrack.prototype.getBroadcastFounder = function (group) {
        var seed = group_seed(group);
        if (seed) {
            return ID.parse(seed + ".founder@anywhere");
        } else {
            return ID.FOUNDER;
        }
    };
    Barrack.prototype.getBroadcastOwner = function (group) {
        var seed = group_seed(group);
        if (seed) {
            return ID.parse(seed + ".owner@anywhere");
        } else {
            return ID.ANYONE;
        }
    };
    Barrack.prototype.getBroadcastMembers = function (group) {
        var members = [];
        var seed = group_seed(group);
        if (seed) {
            var owner = ID.parse(seed + ".owner@anywhere");
            var member = ID.parse(seed + ".member@anywhere");
            members.push(owner);
            members.push(member);
        } else {
            members.push(ID.ANYONE);
        }
        return members;
    };
    ns.core.Barrack = Barrack;
    ns.core.registers("Barrack");
})(DIMP);
(function (ns) {
    var Packer = function () {};
    ns.Interface(Packer, null);
    Packer.prototype.getOvertGroup = function (content) {
        ns.assert(false, "implement me!");
        return null;
    };
    Packer.prototype.encryptMessage = function (iMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    Packer.prototype.signMessage = function (sMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    Packer.prototype.serializeMessage = function (rMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    Packer.prototype.deserializeMessage = function (data) {
        ns.assert(false, "implement me!");
        return null;
    };
    Packer.prototype.verifyMessage = function (rMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    Packer.prototype.decryptMessage = function (sMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.core.Packer = Packer;
    ns.core.registers("Packer");
})(DIMP);
(function (ns) {
    var Processor = function () {};
    ns.Interface(Processor, null);
    Processor.prototype.processPackage = function (data) {
        ns.assert(false, "implement me!");
        return null;
    };
    Processor.prototype.processReliableMessage = function (rMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    Processor.prototype.processSecureMessage = function (sMsg, rMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    Processor.prototype.processInstantMessage = function (iMsg, rMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    Processor.prototype.processContent = function (content, rMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.core.Processor = Processor;
    ns.core.registers("Processor");
})(DIMP);
(function (ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var UTF8 = ns.format.UTF8;
    var Base64 = ns.format.Base64;
    var JsON = ns.format.JSON;
    var Content = ns.protocol.Content;
    var InstantMessage = ns.protocol.InstantMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var Transceiver = function () {
        Object.call(this);
    };
    ns.Class(
        Transceiver,
        Object,
        [InstantMessage.Delegate, ReliableMessage.Delegate],
        null
    );
    Transceiver.prototype.getEntityDelegate = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    var is_broadcast = function (msg) {
        var receiver = msg.getGroup();
        if (!receiver) {
            receiver = msg.getReceiver();
        }
        return receiver.isBroadcast();
    };
    Transceiver.prototype.serializeContent = function (content, pwd, iMsg) {
        var dict = content.toMap();
        var json = JsON.encode(dict);
        return UTF8.encode(json);
    };
    Transceiver.prototype.encryptContent = function (data, pwd, iMsg) {
        return pwd.encrypt(data);
    };
    Transceiver.prototype.encodeData = function (data, iMsg) {
        if (is_broadcast(iMsg)) {
            return UTF8.decode(data);
        }
        return Base64.encode(data);
    };
    Transceiver.prototype.serializeKey = function (pwd, iMsg) {
        if (is_broadcast(iMsg)) {
            return null;
        }
        var dict = pwd.toMap();
        var json = JsON.encode(dict);
        return UTF8.encode(json);
    };
    Transceiver.prototype.encryptKey = function (data, receiver, iMsg) {
        var barrack = this.getEntityDelegate();
        var contact = barrack.getUser(receiver);
        return contact.encrypt(data);
    };
    Transceiver.prototype.encodeKey = function (key, iMsg) {
        return Base64.encode(key);
    };
    Transceiver.prototype.decodeKey = function (key, sMsg) {
        return Base64.decode(key);
    };
    Transceiver.prototype.decryptKey = function (data, sender, receiver, sMsg) {
        var barrack = this.getEntityDelegate();
        var identifier = sMsg.getReceiver();
        var user = barrack.getUser(identifier);
        return user.decrypt(data);
    };
    Transceiver.prototype.deserializeKey = function (
        data,
        sender,
        receiver,
        sMsg
    ) {
        var json = UTF8.decode(data);
        var dict = JsON.decode(json);
        return SymmetricKey.parse(dict);
    };
    Transceiver.prototype.decodeData = function (data, sMsg) {
        if (is_broadcast(sMsg)) {
            return UTF8.encode(data);
        }
        return Base64.decode(data);
    };
    Transceiver.prototype.decryptContent = function (data, pwd, sMsg) {
        return pwd.decrypt(data);
    };
    Transceiver.prototype.deserializeContent = function (data, pwd, sMsg) {
        var json = UTF8.decode(data);
        var dict = JsON.decode(json);
        return Content.parse(dict);
    };
    Transceiver.prototype.signData = function (data, sender, sMsg) {
        var barrack = this.getEntityDelegate();
        var user = barrack.getUser(sender);
        return user.sign(data);
    };
    Transceiver.prototype.encodeSignature = function (signature, sMsg) {
        return Base64.encode(signature);
    };
    Transceiver.prototype.decodeSignature = function (signature, rMsg) {
        return Base64.decode(signature);
    };
    Transceiver.prototype.verifyDataSignature = function (
        data,
        signature,
        sender,
        rMsg
    ) {
        var barrack = this.getEntityDelegate();
        var contact = barrack.getUser(sender);
        return contact.verify(data, signature);
    };
    ns.core.Transceiver = Transceiver;
    ns.core.registers("Transceiver");
})(DIMP);
(function (ns) {
    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var Command = ns.protocol.Command;
    var HistoryCommand = ns.protocol.HistoryCommand;
    var GroupCommand = ns.protocol.GroupCommand;
    var ContentFactory = function (clazz) {
        Object.call(this);
        this.__class = clazz;
    };
    ns.Class(ContentFactory, Object, [Content.Factory], null);
    ContentFactory.prototype.parseContent = function (content) {
        return new this.__class(content);
    };
    var CommandFactory = function (clazz) {
        Object.call(this);
        this.__class = clazz;
    };
    ns.Class(CommandFactory, Object, [Command.Factory], null);
    CommandFactory.prototype.parseCommand = function (content) {
        return new this.__class(content);
    };
    var GeneralCommandFactory = function () {
        Object.call(this);
    };
    ns.Class(
        GeneralCommandFactory,
        Object,
        [Content.Factory, Command.Factory],
        null
    );
    GeneralCommandFactory.prototype.parseContent = function (content) {
        var command = Command.getCommand(content);
        var factory = Command.getFactory(command);
        if (!factory) {
            if (Content.getGroup(content)) {
                factory = Command.getFactory("group");
            }
            if (!factory) {
                factory = this;
            }
        }
        return factory.parseCommand(content);
    };
    GeneralCommandFactory.prototype.parseCommand = function (cmd) {
        return new Command(cmd);
    };
    var HistoryCommandFactory = function () {
        GeneralCommandFactory.call(this);
    };
    ns.Class(HistoryCommandFactory, GeneralCommandFactory, null, null);
    HistoryCommandFactory.prototype.parseCommand = function (cmd) {
        return new HistoryCommand(cmd);
    };
    var GroupCommandFactory = function () {
        HistoryCommandFactory.call(this);
    };
    ns.Class(GroupCommandFactory, HistoryCommandFactory, null, null);
    GroupCommandFactory.prototype.parseContent = function (content) {
        var command = Command.getCommand(content);
        var factory = Command.getFactory(command);
        if (!factory) {
            factory = this;
        }
        return factory.parseCommand(content);
    };
    GroupCommandFactory.prototype.parseCommand = function (cmd) {
        return new GroupCommand(cmd);
    };
    var registerContentFactories = function () {
        Content.setFactory(
            ContentType.FORWARD,
            new ContentFactory(ns.dkd.SecretContent)
        );
        Content.setFactory(
            ContentType.TEXT,
            new ContentFactory(ns.dkd.BaseTextContent)
        );
        Content.setFactory(
            ContentType.FILE,
            new ContentFactory(ns.dkd.BaseFileContent)
        );
        Content.setFactory(
            ContentType.IMAGE,
            new ContentFactory(ns.dkd.ImageFileContent)
        );
        Content.setFactory(
            ContentType.AUDIO,
            new ContentFactory(ns.dkd.AudioFileContent)
        );
        Content.setFactory(
            ContentType.VIDEO,
            new ContentFactory(ns.dkd.VideoFileContent)
        );
        Content.setFactory(
            ContentType.PAGE,
            new ContentFactory(ns.dkd.WebPageContent)
        );
        Content.setFactory(
            ContentType.MONEY,
            new ContentFactory(ns.dkd.BaseMoneyContent)
        );
        Content.setFactory(
            ContentType.TRANSFER,
            new ContentFactory(ns.dkd.TransferMoneyContent)
        );
        Content.setFactory(ContentType.COMMAND, new GeneralCommandFactory());
        Content.setFactory(ContentType.HISTORY, new HistoryCommandFactory());
        Content.setFactory(0, new ContentFactory(ns.dkd.BaseContent));
    };
    var registerCommandFactories = function () {
        Command.setFactory(
            Command.META,
            new CommandFactory(ns.dkd.BaseMetaCommand)
        );
        Command.setFactory(
            Command.DOCUMENT,
            new CommandFactory(ns.dkd.BaseDocumentCommand)
        );
        Command.setFactory("group", new GroupCommandFactory());
        Command.setFactory(
            GroupCommand.INVITE,
            new CommandFactory(ns.dkd.InviteGroupCommand)
        );
        Command.setFactory(
            GroupCommand.EXPEL,
            new CommandFactory(ns.dkd.ExpelGroupCommand)
        );
        Command.setFactory(
            GroupCommand.JOIN,
            new CommandFactory(ns.dkd.JoinGroupCommand)
        );
        Command.setFactory(
            GroupCommand.QUIT,
            new CommandFactory(ns.dkd.QuitGroupCommand)
        );
        Command.setFactory(
            GroupCommand.QUERY,
            new CommandFactory(ns.dkd.QueryGroupCommand)
        );
        Command.setFactory(
            GroupCommand.RESET,
            new CommandFactory(ns.dkd.ResetGroupCommand)
        );
    };
    ns.core.ContentFactory = ContentFactory;
    ns.core.CommandFactory = CommandFactory;
    ns.core.GeneralCommandFactory = GeneralCommandFactory;
    ns.core.HistoryCommandFactory = HistoryCommandFactory;
    ns.core.GroupCommandFactory = GroupCommandFactory;
    ns.core.registerContentFactories = registerContentFactories;
    ns.core.registerCommandFactories = registerCommandFactories;
    ns.core.registers("ContentFactory");
    ns.core.registers("CommandFactory");
    ns.core.registers("GeneralCommandFactory");
    ns.core.registers("HistoryCommandFactory");
    ns.core.registers("GroupCommandFactory");
    ns.core.registers("registerContentFactories");
    ns.core.registers("registerCommandFactories");
})(DIMP);
(function (ns) {
    var repeat = function (count) {
        var string = "";
        for (var i = 0; i < count; ++i) {
            string += this;
        }
        return string;
    };
    if (typeof String.prototype.repeat !== "function") {
        String.prototype.repeat = repeat;
    }
    function base(ALPHABET) {
        if (ALPHABET.length >= 255) {
            throw new TypeError("Alphabet too long");
        }
        var BASE_MAP = new Uint8Array(256);
        for (var j = 0; j < BASE_MAP.length; j++) {
            BASE_MAP[j] = 255;
        }
        for (var i = 0; i < ALPHABET.length; i++) {
            var x = ALPHABET.charAt(i);
            var xc = x.charCodeAt(0);
            if (BASE_MAP[xc] !== 255) {
                throw new TypeError(x + " is ambiguous");
            }
            BASE_MAP[xc] = i;
        }
        var BASE = ALPHABET.length;
        var LEADER = ALPHABET.charAt(0);
        var FACTOR = Math.log(BASE) / Math.log(256);
        var iFACTOR = Math.log(256) / Math.log(BASE);
        function encode(source) {
            if (source.length === 0) {
                return "";
            }
            var zeroes = 0;
            var length = 0;
            var pbegin = 0;
            var pend = source.length;
            while (pbegin !== pend && source[pbegin] === 0) {
                pbegin++;
                zeroes++;
            }
            var size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
            var b58 = new Uint8Array(size);
            while (pbegin !== pend) {
                var carry = source[pbegin];
                var i = 0;
                for (
                    var it1 = size - 1;
                    (carry !== 0 || i < length) && it1 !== -1;
                    it1--, i++
                ) {
                    carry += (256 * b58[it1]) >>> 0;
                    b58[it1] = carry % BASE >>> 0;
                    carry = (carry / BASE) >>> 0;
                }
                if (carry !== 0) {
                    throw new Error("Non-zero carry");
                }
                length = i;
                pbegin++;
            }
            var it2 = size - length;
            while (it2 !== size && b58[it2] === 0) {
                it2++;
            }
            var str = repeat.call(LEADER, zeroes);
            for (; it2 < size; ++it2) {
                str += ALPHABET.charAt(b58[it2]);
            }
            return str;
        }
        function decodeUnsafe(source) {
            if (typeof source !== "string") {
                throw new TypeError("Expected String");
            }
            if (source.length === 0) {
                return [];
            }
            var psz = 0;
            if (source[psz] === " ") {
                return;
            }
            var zeroes = 0;
            var length = 0;
            while (source[psz] === LEADER) {
                zeroes++;
                psz++;
            }
            var size = ((source.length - psz) * FACTOR + 1) >>> 0;
            var b256 = new Uint8Array(size);
            while (source[psz]) {
                var carry = BASE_MAP[source.charCodeAt(psz)];
                if (carry === 255) {
                    return;
                }
                var i = 0;
                for (
                    var it3 = size - 1;
                    (carry !== 0 || i < length) && it3 !== -1;
                    it3--, i++
                ) {
                    carry += (BASE * b256[it3]) >>> 0;
                    b256[it3] = carry % 256 >>> 0;
                    carry = (carry / 256) >>> 0;
                }
                if (carry !== 0) {
                    throw new Error("Non-zero carry");
                }
                length = i;
                psz++;
            }
            if (source[psz] === " ") {
                return;
            }
            var it4 = size - length;
            while (it4 !== size && b256[it4] === 0) {
                it4++;
            }
            var vch = [];
            var j = 0;
            for (; j < zeroes; ++j) {
                vch[j] = 0;
            }
            while (it4 !== size) {
                vch[j++] = b256[it4++];
            }
            return vch;
        }
        function decode(string) {
            var buffer = decodeUnsafe(string);
            if (buffer) {
                return new Uint8Array(buffer);
            }
            throw new Error("Non-base" + BASE + " character");
        }
        return { encode: encode, decodeUnsafe: decodeUnsafe, decode: decode };
    }
    var bs58 = base("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
    var DataCoder = ns.format.DataCoder;
    var Base58Coder = function () {
        Object.call(this);
    };
    ns.Class(Base58Coder, Object, [DataCoder], null);
    Base58Coder.prototype.encode = function (data) {
        return bs58.encode(data);
    };
    Base58Coder.prototype.decode = function (string) {
        return bs58.decode(string);
    };
    ns.format.Base58.setCoder(new Base58Coder());
})(MONKEY);
(function (ns) {
    var DataCoder = ns.format.DataCoder;
    var base64_chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64_values = new Int8Array(128);
    (function (chars, values) {
        for (var i = 0; i < chars.length; ++i) {
            values[chars.charCodeAt(i)] = i;
        }
    })(base64_chars, base64_values);
    var base64_encode = function (data) {
        var base64 = "";
        var length = data.length;
        var remainder = length % 3;
        length -= remainder;
        var x1, x2, x3;
        var i;
        for (i = 0; i < length; i += 3) {
            x1 = data[i];
            x2 = data[i + 1];
            x3 = data[i + 2];
            base64 += base64_chars.charAt((x1 & 252) >> 2);
            base64 += base64_chars.charAt(((x1 & 3) << 4) | ((x2 & 240) >> 4));
            base64 += base64_chars.charAt(((x2 & 15) << 2) | ((x3 & 192) >> 6));
            base64 += base64_chars.charAt(x3 & 63);
        }
        if (remainder === 1) {
            x1 = data[i];
            base64 += base64_chars.charAt((x1 & 252) >> 2);
            base64 += base64_chars.charAt((x1 & 3) << 4);
            base64 += "==";
        } else {
            if (remainder === 2) {
                x1 = data[i];
                x2 = data[i + 1];
                base64 += base64_chars.charAt((x1 & 252) >> 2);
                base64 += base64_chars.charAt(((x1 & 3) << 4) | ((x2 & 240) >> 4));
                base64 += base64_chars.charAt((x2 & 15) << 2);
                base64 += "=";
            }
        }
        return base64;
    };
    var base64_decode = function (string) {
        var str = string.replace(/[^A-Za-z0-9+\/=]/g, "");
        var length = str.length;
        if (length % 4 !== 0 || !/^[A-Za-z0-9+\/]+={0,2}$/.test(str)) {
            throw new Error("base64 string error: " + string);
        }
        var array = [];
        var ch1, ch2, ch3, ch4;
        var i;
        for (i = 0; i < length; i += 4) {
            ch1 = base64_values[str.charCodeAt(i)];
            ch2 = base64_values[str.charCodeAt(i + 1)];
            ch3 = base64_values[str.charCodeAt(i + 2)];
            ch4 = base64_values[str.charCodeAt(i + 3)];
            array.push(((ch1 & 63) << 2) | ((ch2 & 48) >> 4));
            array.push(((ch2 & 15) << 4) | ((ch3 & 60) >> 2));
            array.push(((ch3 & 3) << 6) | ((ch4 & 63) >> 0));
        }
        while (str[--i] === "=") {
            array.pop();
        }
        return Uint8Array.from(array);
    };
    var Base64Coder = function () {
        Object.call(this);
    };
    ns.Class(Base64Coder, Object, [DataCoder], null);
    Base64Coder.prototype.encode = function (data) {
        return base64_encode(data);
    };
    Base64Coder.prototype.decode = function (string) {
        return base64_decode(string);
    };
    ns.format.Base64.setCoder(new Base64Coder());
})(MONKEY);
(function (ns) {
    var StringCoder = ns.format.StringCoder;
    var utf8_encode = function (string) {
        var len = string.length;
        var array = [];
        var c, l;
        for (var i = 0; i < len; ++i) {
            c = string.charCodeAt(i);
            if (55296 <= c && c <= 56319) {
                l = string.charCodeAt(++i);
                c = ((c - 55296) << 10) + 65536 + l - 56320;
            }
            if (c <= 0) {
                break;
            } else {
                if (c < 128) {
                    array.push(c);
                } else {
                    if (c < 2048) {
                        array.push(192 | ((c >> 6) & 31));
                        array.push(128 | ((c >> 0) & 63));
                    } else {
                        if (c < 65536) {
                            array.push(224 | ((c >> 12) & 15));
                            array.push(128 | ((c >> 6) & 63));
                            array.push(128 | ((c >> 0) & 63));
                        } else {
                            array.push(240 | ((c >> 18) & 7));
                            array.push(128 | ((c >> 12) & 63));
                            array.push(128 | ((c >> 6) & 63));
                            array.push(128 | ((c >> 0) & 63));
                        }
                    }
                }
            }
        }
        return Uint8Array.from(array);
    };
    var utf8_decode = function (array) {
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
                    c =
                        ((c & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63);
                    break;
            }
            if (c < 65536) {
                string += String.fromCharCode(c);
            } else {
                c -= 65536;
                string += String.fromCharCode((c >> 10) + 55296);
                string += String.fromCharCode((c & 1023) + 56320);
            }
        }
        return string;
    };
    var Utf8Coder = function () {
        Object.call(this);
    };
    ns.Class(Utf8Coder, Object, [StringCoder], null);
    Utf8Coder.prototype.encode = function (string) {
        return utf8_encode(string);
    };
    Utf8Coder.prototype.decode = function (data) {
        return utf8_decode(data);
    };
    ns.format.UTF8.setCoder(new Utf8Coder());
})(MONKEY);
(function (ns) {
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this);
    };
    ns.Class(hash, Object, [DataDigester], null);
    hash.prototype.digest = function (data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.MD5(array);
        return ns.format.Hex.decode(result.toString());
    };
    ns.digest.MD5.setDigester(new hash());
})(MONKEY);
(function (ns) {
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this);
    };
    ns.Class(hash, Object, [DataDigester], null);
    hash.prototype.digest = function (data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.SHA256(array);
        return ns.format.Hex.decode(result.toString());
    };
    ns.digest.SHA256.setDigester(new hash());
})(MONKEY);
(function (ns) {
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this);
    };
    ns.Class(hash, Object, [DataDigester], null);
    hash.prototype.digest = function (data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.RIPEMD160(array);
        return ns.format.Hex.decode(result.toString());
    };
    ns.digest.RIPEMD160.setDigester(new hash());
})(MONKEY);
(function (ns) {
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this);
    };
    ns.Class(hash, Object, [DataDigester], null);
    hash.prototype.digest = function (data) {
        var array = window.keccak256.update(data).digest();
        return new Uint8Array(array);
    };
    ns.digest.KECCAK256.setDigester(new hash());
})(MONKEY);
(function (ns) {
    var MIME_LINE_MAX_LEN = 76;
    var CR_LF = "\r\n";
    var rfc2045 = function (data) {
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
                    sb += CR_LF;
                } else {
                    sb += base64.substring(start, length);
                    break;
                }
            }
            base64 = sb;
        }
        return base64;
    };
    var encode_key = function (key, left, right) {
        var content = rfc2045(key);
        return left + CR_LF + content + CR_LF + right;
    };
    var decode_key = function (pem, left, right) {
        var start = pem.indexOf(left);
        if (start < 0) {
            return null;
        }
        start += left.length;
        var end = pem.indexOf(right, start);
        if (end < start) {
            return null;
        }
        return ns.format.Base64.decode(pem.substring(start, end));
    };
    var encode_public = function (key) {
        return encode_key(
            key,
            "-----BEGIN PUBLIC KEY-----",
            "-----END PUBLIC KEY-----"
        );
    };
    var encode_rsa_private = function (key) {
        return encode_key(
            key,
            "-----BEGIN RSA PRIVATE KEY-----",
            "-----END RSA PRIVATE KEY-----"
        );
    };
    var decode_public = function (pem) {
        var data = decode_key(
            pem,
            "-----BEGIN PUBLIC KEY-----",
            "-----END PUBLIC KEY-----"
        );
        if (!data) {
            data = decode_key(
                pem,
                "-----BEGIN RSA PUBLIC KEY-----",
                "-----END RSA PUBLIC KEY-----"
            );
        }
        if (data) {
            return data;
        }
        if (pem.indexOf("PRIVATE KEY") > 0) {
            throw new TypeError("this is a private key content");
        } else {
            return ns.format.Base64.decode(pem);
        }
    };
    var decode_rsa_private = function (pem) {
        var data = decode_key(
            pem,
            "-----BEGIN RSA PRIVATE KEY-----",
            "-----END RSA PRIVATE KEY-----"
        );
        if (data) {
            return data;
        }
        if (pem.indexOf("PUBLIC KEY") > 0) {
            throw new TypeError("this is not a RSA private key content");
        } else {
            return ns.format.Base64.decode(pem);
        }
    };
    var pem = function () {
        Object.call(this);
    };
    ns.Class(pem, Object, null, null);
    pem.prototype.encodePublicKey = function (key) {
        return encode_public(key);
    };
    pem.prototype.encodePrivateKey = function (key) {
        return encode_rsa_private(key);
    };
    pem.prototype.decodePublicKey = function (pem) {
        return decode_public(pem);
    };
    pem.prototype.decodePrivateKey = function (pem) {
        return decode_rsa_private(pem);
    };
    ns.format.PEM = new pem();
    ns.format.registers("PEM");
})(MONKEY);
(function (ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PublicKey = ns.crypto.PublicKey;
    var EncryptKey = ns.crypto.EncryptKey;
    var RSAPublicKey = function (key) {
        Dictionary.call(this, key);
    };
    ns.Class(RSAPublicKey, Dictionary, [PublicKey, EncryptKey], {
        getAlgorithm: function () {
            var dict = this.toMap();
            return CryptographyKey.getAlgorithm(dict);
        },
        getData: function () {
            var data = this.getValue("data");
            if (data) {
                return ns.format.PEM.decodePublicKey(data);
            } else {
                throw new Error("public key data not found");
            }
        },
        getSize: function () {
            var size = this.getValue("keySize");
            if (size) {
                return Number(size);
            } else {
                return 1024 / 8;
            }
        },
        verify: function (data, signature) {
            data = CryptoJS.enc.Hex.parse(ns.format.Hex.encode(data));
            signature = ns.format.Base64.encode(signature);
            var cipher = parse_key.call(this);
            return cipher.verify(data, signature, CryptoJS.SHA256);
        },
        matches: function (sKey) {
            return AsymmetricKey.matches(sKey, this);
        },
        encrypt: function (plaintext) {
            plaintext = ns.format.UTF8.decode(plaintext);
            var cipher = parse_key.call(this);
            var base64 = cipher.encrypt(plaintext);
            if (base64) {
                var keySize = this.getSize();
                var res = ns.format.Base64.decode(base64);
                if (res.length === keySize) {
                    return res;
                }
                var pad = new Uint8Array(keySize);
                pad.set(res, keySize - res.length);
                return pad;
            }
            throw new Error("RSA encrypt error: " + plaintext);
        }
    });
    var x509_header = new Uint8Array([
        48, -127, -97, 48, 13, 6, 9, 42, -122, 72, -122, -9, 13, 1, 1, 1, 5, 0, 3,
        -127, -115, 0
    ]);
    var parse_key = function () {
        var der = this.getData();
        var key = ns.format.Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPublicKey(key);
        if (cipher.key.e === 0 || cipher.key.n === null) {
            var fixed = new Uint8Array(x509_header.length + der.length);
            fixed.set(x509_header);
            fixed.set(der, x509_header.length);
            key = ns.format.Base64.encode(fixed);
            cipher.setPublicKey(key);
        }
        return cipher;
    };
    ns.crypto.RSAPublicKey = RSAPublicKey;
    ns.crypto.registers("RSAPublicKey");
})(MONKEY);
(function (ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = function (key) {
        Dictionary.call(this, key);
    };
    ns.Class(RSAPrivateKey, Dictionary, [PrivateKey, DecryptKey], {
        getAlgorithm: function () {
            var dict = this.toMap();
            return CryptographyKey.getAlgorithm(dict);
        },
        getData: function () {
            var data = this.getValue("data");
            if (data) {
                return ns.format.PEM.decodePrivateKey(data);
            } else {
                var bits = this.getSize() * 8;
                var pem = generate.call(this, bits);
                return ns.format.PEM.decodePrivateKey(pem);
            }
        },
        getSize: function () {
            var size = this.getValue("keySize");
            if (size) {
                return Number(size);
            } else {
                return 1024 / 8;
            }
        },
        getPublicKey: function () {
            var key = ns.format.Base64.encode(this.getData());
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
            return PublicKey.parse(info);
        },
        sign: function (data) {
            data = CryptoJS.enc.Hex.parse(ns.format.Hex.encode(data));
            var cipher = parse_key.call(this);
            var base64 = cipher.sign(data, CryptoJS.SHA256, "sha256");
            if (base64) {
                return ns.format.Base64.decode(base64);
            } else {
                throw new Error("RSA sign error: " + data);
            }
        },
        decrypt: function (data) {
            data = ns.format.Base64.encode(data);
            var cipher = parse_key.call(this);
            var string = cipher.decrypt(data);
            if (string) {
                return ns.format.UTF8.encode(string);
            } else {
                throw new Error("RSA decrypt error: " + data);
            }
        },
        matches: function (pKey) {
            return CryptographyKey.matches(pKey, this);
        }
    });
    var generate = function (bits) {
        var cipher = new JSEncrypt({ default_key_size: bits });
        var key = cipher.getKey();
        var pem = key.getPublicKey() + "\r\n" + key.getPrivateKey();
        this.setValue("data", pem);
        this.setValue("mode", "ECB");
        this.setValue("padding", "PKCS1");
        this.setValue("digest", "SHA256");
        return pem;
    };
    var parse_key = function () {
        var der = this.getData();
        var key = ns.format.Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPrivateKey(key);
        return cipher;
    };
    ns.crypto.RSAPrivateKey = RSAPrivateKey;
    ns.crypto.registers("RSAPrivateKey");
})(MONKEY);
(function (ns) {
    var Secp256k1 = window.Secp256k1;
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PublicKey = ns.crypto.PublicKey;
    var mem_cpy = function (dst, dst_offset, src, src_offset, src_len) {
        for (var i = 0; i < src_len; ++i) {
            dst[dst_offset + i] = src[src_offset + i];
        }
    };
    var trim_to_32_bytes = function (src, src_offset, src_len, dst) {
        var pos = src_offset;
        while (src[pos] === 0 && src_len > 0) {
            ++pos;
            --src_len;
        }
        if (src_len > 32 || src_len < 1) {
            return false;
        }
        var dst_offset = 32 - src_len;
        mem_cpy(dst, dst_offset, src, pos, src_len);
        return true;
    };
    var ecc_der_to_sig = function (der, der_len) {
        var seq_len;
        var r_len;
        var s_len;
        if (der_len < 8 || der[0] !== 48 || der[2] !== 2) {
            return null;
        }
        seq_len = der[1];
        if (seq_len <= 0 || seq_len + 2 !== der_len) {
            return null;
        }
        r_len = der[3];
        if (r_len < 1 || r_len > seq_len - 5 || der[4 + r_len] !== 2) {
            return null;
        }
        s_len = der[5 + r_len];
        if (s_len < 1 || s_len !== seq_len - 4 - r_len) {
            return null;
        }
        var sig_r = new Uint8Array(32);
        var sig_s = new Uint8Array(32);
        if (
            trim_to_32_bytes(der, 4, r_len, sig_r) &&
            trim_to_32_bytes(der, 6 + r_len, s_len, sig_s)
        ) {
            return { r: sig_r, s: sig_s };
        } else {
            return null;
        }
    };
    var ECCPublicKey = function (key) {
        Dictionary.call(this, key);
    };
    ns.Class(ECCPublicKey, Dictionary, [PublicKey], {
        getAlgorithm: function () {
            var dict = this.toMap();
            return CryptographyKey.getAlgorithm(dict);
        },
        getData: function () {
            var pem = this.getValue("data");
            if (!pem || pem.length === 0) {
                throw new Error("ECC public key data not found");
            } else {
                if (pem.length === 66) {
                    return ns.format.Hex.decode(pem);
                } else {
                    if (pem.length === 130) {
                        return ns.format.Hex.decode(pem);
                    } else {
                        var pos1 = pem.indexOf("-----BEGIN PUBLIC KEY-----");
                        if (pos1 >= 0) {
                            pos1 += "-----BEGIN PUBLIC KEY-----".length;
                            var pos2 = pem.indexOf("-----END PUBLIC KEY-----", pos1);
                            if (pos2 > 0) {
                                var base64 = pem.substr(pos1, pos2 - pos1);
                                var data = ns.format.Base64.decode(base64);
                                return data.subarray(data.length - 65);
                            }
                        }
                    }
                }
            }
            throw new EvalError("key data error: " + pem);
        },
        getSize: function () {
            var size = this.getValue("keySize");
            if (size) {
                return Number(size);
            } else {
                return this.getData().length / 8;
            }
        },
        verify: function (data, signature) {
            var hash = ns.digest.SHA256.digest(data);
            var z = Secp256k1.uint256(hash, 16);
            var sig = ecc_der_to_sig(signature, signature.length);
            if (!sig) {
                throw new EvalError("signature error: " + signature);
            }
            var sig_r = Secp256k1.uint256(sig.r, 16);
            var sig_s = Secp256k1.uint256(sig.s, 16);
            var pub = decode_points(this.getData());
            return Secp256k1.ecverify(pub.x, pub.y, sig_r, sig_s, z);
        },
        matches: function (sKey) {
            return AsymmetricKey.matches(sKey, this);
        }
    });
    var decode_points = function (data) {
        var x, y;
        if (data.length === 65) {
            if (data[0] === 4) {
                x = Secp256k1.uint256(data.subarray(1, 33), 16);
                y = Secp256k1.uint256(data.subarray(33, 65), 16);
            } else {
                throw new EvalError("key data head error: " + data);
            }
        } else {
            if (data.length === 33) {
                if (data[0] === 4) {
                    x = Secp256k1.uint256(data.subarray(1, 33), 16);
                    y = Secp256k1.decompressKey(x, 0);
                } else {
                    throw new EvalError("key data head error: " + data);
                }
            } else {
                throw new EvalError("key data length error: " + data);
            }
        }
        return { x: x, y: y };
    };
    ns.crypto.ECCPublicKey = ECCPublicKey;
    ns.crypto.registers("ECCPublicKey");
})(MONKEY);
(function (ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var ecc_sig_to_der = function (sig_r, sig_s, der) {
        var i;
        var p = 0,
            len,
            len1,
            len2;
        der[p] = 48;
        p++;
        der[p] = 0;
        len = p;
        p++;
        der[p] = 2;
        p++;
        der[p] = 0;
        len1 = p;
        p++;
        i = 0;
        while (sig_r[i] === 0 && i < 32) {
            i++;
        }
        if (sig_r[i] >= 128) {
            der[p] = 0;
            p++;
            der[len1] = der[len1] + 1;
        }
        while (i < 32) {
            der[p] = sig_r[i];
            p++;
            der[len1] = der[len1] + 1;
            i++;
        }
        der[p] = 2;
        p++;
        der[p] = 0;
        len2 = p;
        p++;
        i = 0;
        while (sig_s[i] === 0 && i < 32) {
            i++;
        }
        if (sig_s[i] >= 128) {
            der[p] = 0;
            p++;
            der[len2] = der[len2] + 1;
        }
        while (i < 32) {
            der[p] = sig_s[i];
            p++;
            der[len2] = der[len2] + 1;
            i++;
        }
        der[len] = der[len1] + der[len2] + 4;
        return der[len] + 2;
    };
    var ECCPrivateKey = function (key) {
        Dictionary.call(this, key);
        var keyPair = get_key_pair.call(this);
        this.__privateKey = keyPair.privateKey;
        this.__publicKey = keyPair.publicKey;
    };
    ns.Class(ECCPrivateKey, Dictionary, [PrivateKey], {
        getAlgorithm: function () {
            var dict = this.toMap();
            return CryptographyKey.getAlgorithm(dict);
        },
        getData: function () {
            var data = this.getValue("data");
            if (data && data.length > 0) {
                return ns.format.Hex.decode(data);
            } else {
                throw new Error("ECC private key data not found");
            }
        },
        getSize: function () {
            var size = this.getValue("keySize");
            if (size) {
                return Number(size);
            } else {
                return this.getData().length / 8;
            }
        },
        getPublicKey: function () {
            var pub = this.__publicKey;
            var data = "04" + pub.x + pub.y;
            var info = {
                algorithm: this.getValue("algorithm"),
                data: data,
                curve: "secp256k1",
                digest: "SHA256"
            };
            return PublicKey.parse(info);
        },
        sign: function (data) {
            var hash = ns.digest.SHA256.digest(data);
            var z = Secp256k1.uint256(hash, 16);
            var sig = Secp256k1.ecsign(this.__privateKey, z);
            var sig_r = ns.format.Hex.decode(sig.r);
            var sig_s = ns.format.Hex.decode(sig.s);
            var der = new Uint8Array(72);
            var sig_len = ecc_sig_to_der(sig_r, sig_s, der);
            if (sig_len === der.length) {
                return der;
            } else {
                return der.subarray(0, sig_len);
            }
        }
    });
    var get_key_pair = function () {
        var sKey;
        var data = this.getData();
        if (!data || data.length === 0) {
            sKey = generatePrivateKey.call(this, 256);
        } else {
            if (data.length === 32) {
                sKey = Secp256k1.uint256(data, 16);
            } else {
                throw new EvalError("key data length error: " + data);
            }
        }
        var pKey = Secp256k1.generatePublicKeyFromPrivateKeyData(sKey);
        return { privateKey: sKey, publicKey: pKey };
    };
    var generatePrivateKey = function (bits) {
        var key = window.crypto.getRandomValues(new Uint8Array(bits / 8));
        var hex = ns.format.Hex.encode(key);
        this.setValue("data", hex);
        this.setValue("curve", "secp256k1");
        this.setValue("digest", "SHA256");
        return key;
    };
    ns.crypto.ECCPrivateKey = ECCPrivateKey;
    ns.crypto.registers("ECCPrivateKey");
})(MONKEY);
(function (ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var bytes2words = function (data) {
        var string = ns.format.Hex.encode(data);
        return CryptoJS.enc.Hex.parse(string);
    };
    var words2bytes = function (array) {
        var result = array.toString();
        return ns.format.Hex.decode(result);
    };
    var random_data = function (size) {
        var data = new Uint8Array(size);
        for (var i = 0; i < size; ++i) {
            data[i] = Math.floor(Math.random() * 256);
        }
        return data;
    };
    var zero_data = function (size) {
        return new Uint8Array(size);
    };
    var AESKey = function (key) {
        Dictionary.call(this, key);
    };
    ns.Class(AESKey, Dictionary, [SymmetricKey], {
        getAlgorithm: function () {
            var dict = this.toMap();
            return CryptographyKey.getAlgorithm(dict);
        },
        getSize: function () {
            var size = this.getValue("keySize");
            if (size) {
                return Number(size);
            } else {
                return 32;
            }
        },
        getBlockSize: function () {
            var size = this.getValue("blockSize");
            if (size) {
                return Number(size);
            } else {
                return 16;
            }
        },
        getData: function () {
            var data = this.getValue("data");
            if (data) {
                return ns.format.Base64.decode(data);
            }
            var keySize = this.getSize();
            var pwd = random_data(keySize);
            this.setValue("data", ns.format.Base64.encode(pwd));
            var blockSize = this.getBlockSize();
            var iv = random_data(blockSize);
            this.setValue("iv", ns.format.Base64.encode(iv));
            return pwd;
        },
        getInitVector: function () {
            var iv = this.getValue("iv");
            if (iv) {
                return ns.format.Base64.decode(iv);
            }
            var zeros = zero_data(this.getBlockSize());
            this.setValue("iv", ns.format.Base64.encode(zeros));
            return zeros;
        },
        encrypt: function (plaintext) {
            var data = this.getData();
            var iv = this.getInitVector();
            var keyWordArray = bytes2words(data);
            var ivWordArray = bytes2words(iv);
            var message = bytes2words(plaintext);
            var cipher = CryptoJS.AES.encrypt(message, keyWordArray, {
                iv: ivWordArray
            });
            if (cipher.hasOwnProperty("ciphertext")) {
                return words2bytes(cipher.ciphertext);
            } else {
                throw new TypeError("failed to encrypt message with key: " + this);
            }
        },
        decrypt: function (ciphertext) {
            var data = this.getData();
            var iv = this.getInitVector();
            var keyWordArray = bytes2words(data);
            var ivWordArray = bytes2words(iv);
            var cipher = { ciphertext: bytes2words(ciphertext) };
            var plaintext = CryptoJS.AES.decrypt(cipher, keyWordArray, {
                iv: ivWordArray
            });
            return words2bytes(plaintext);
        },
        matches: function (pKey) {
            return CryptographyKey.matches(pKey, this);
        }
    });
    ns.crypto.AESKey = AESKey;
    ns.crypto.registers("AESKey");
})(MONKEY);
(function (ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Password = function () {
        Object.call(this);
    };
    ns.Class(Password, Object, null, null);
    Password.KEY_SIZE = 32;
    Password.BLOCK_SIZE = 16;
    Password.generate = function (password) {
        var data = ns.format.UTF8.encode(password);
        var digest = ns.digest.SHA256.digest(data);
        var filling = Password.KEY_SIZE - data.length;
        if (filling > 0) {
            var merged = new Uint8Array(Password.KEY_SIZE);
            merged.set(digest.subarray(0, filling));
            merged.set(data, filling);
            data = merged;
        } else {
            if (filling < 0) {
                if (Password.KEY_SIZE === digest.length) {
                    data = digest;
                } else {
                    data = digest.subarray(0, Password.KEY_SIZE);
                }
            }
        }
        var iv = digest.subarray(
            digest.length - Password.BLOCK_SIZE,
            digest.length
        );
        var key = {
            algorithm: SymmetricKey.AES,
            data: ns.format.Base64.encode(data),
            iv: ns.format.Base64.encode(iv)
        };
        return SymmetricKey.parse(key);
    };
    ns.crypto.Password = Password;
    ns.crypto.registers("Password");
})(MONKEY);
(function (ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = function (key) {
        Dictionary.call(this, key);
    };
    ns.Class(PlainKey, Dictionary, [SymmetricKey], {
        getAlgorithm: function () {
            var dict = this.toMap();
            return CryptographyKey.getAlgorithm(dict);
        },
        getData: function () {
            return null;
        },
        encrypt: function (data) {
            return data;
        },
        decrypt: function (data) {
            return data;
        },
        matches: function (pKey) {
            return CryptographyKey.matches(pKey, this);
        }
    });
    var plain_key = null;
    PlainKey.getInstance = function () {
        if (!plain_key) {
            var key = { algorithm: PlainKey.PLAIN };
            plain_key = new PlainKey(key);
        }
        return plain_key;
    };
    PlainKey.PLAIN = "PLAIN";
    ns.crypto.PlainKey = PlainKey;
    ns.crypto.registers("PlainKey");
})(MONKEY);
(function (ns) {
    var ConstantString = ns.type.ConstantString;
    var NetworkType = ns.protocol.NetworkType;
    var Address = ns.protocol.Address;
    var BTCAddress = function (string, network) {
        ConstantString.call(this, string);
        if (network instanceof NetworkType) {
            network = network.valueOf();
        }
        this.__network = network;
    };
    ns.Class(BTCAddress, ConstantString, [Address], null);
    BTCAddress.prototype.getNetwork = function () {
        return this.__network;
    };
    BTCAddress.prototype.isBroadcast = function () {
        return false;
    };
    BTCAddress.prototype.isUser = function () {
        return NetworkType.isUser(this.__network);
    };
    BTCAddress.prototype.isGroup = function () {
        return NetworkType.isGroup(this.__network);
    };
    BTCAddress.generate = function (fingerprint, network) {
        if (network instanceof NetworkType) {
            network = network.valueOf();
        }
        var digest = ns.digest.RIPEMD160.digest(
            ns.digest.SHA256.digest(fingerprint)
        );
        var head = [];
        head.push(network);
        head.push(digest);
        var cc = check_code(Uint8Array.from(head));
        var data = [];
        data.push(head);
        data.push(cc);
        return new BTCAddress(
            ns.format.Base58.encode(Uint8Array.from(data)),
            network
        );
    };
    BTCAddress.parse = function (string) {
        var len = string.length;
        if (len < 26) {
            return null;
        }
        var data = ns.format.Base58.decode(string);
        if (data.length !== 25) {
            throw new RangeError("address length error: " + string);
        }
        var prefix = data.subarray(0, 21);
        var suffix = data.subarray(21, 25);
        var cc = check_code(prefix);
        if (ns.type.Arrays.equals(cc, suffix)) {
            return new BTCAddress(string, data[0]);
        } else {
            return null;
        }
    };
    var check_code = function (data) {
        var sha256d = ns.digest.SHA256.digest(ns.digest.SHA256.digest(data));
        return sha256d.subarray(0, 4);
    };
    ns.mkm.BTCAddress = BTCAddress;
    ns.mkm.registers("BTCAddress");
})(MingKeMing);
(function (ns) {
    var ConstantString = ns.type.ConstantString;
    var NetworkType = ns.protocol.NetworkType;
    var Address = ns.protocol.Address;
    var eip55 = function (hex) {
        var sb = new Uint8Array(40);
        var hash = ns.digest.KECCAK256.digest(ns.format.UTF8.encode(hex));
        var ch;
        var _9 = "9".charCodeAt(0);
        for (var i = 0; i < 40; ++i) {
            ch = hex.charCodeAt(i);
            if (ch > _9) {
                ch -= ((hash[i >> 1] << ((i << 2) & 4)) & 128) >> 2;
            }
            sb[i] = ch;
        }
        return ns.format.UTF8.decode(sb);
    };
    var is_eth = function (address) {
        if (address.length !== 42) {
            return false;
        } else {
            if (address.charAt(0) !== "0" || address.charAt(1) !== "x") {
                return false;
            }
        }
        var _0 = "0".charCodeAt(0);
        var _9 = "9".charCodeAt(0);
        var _A = "A".charCodeAt(0);
        var _Z = "Z".charCodeAt(0);
        var _a = "a".charCodeAt(0);
        var _z = "z".charCodeAt(0);
        var ch;
        for (var i = 2; i < 42; ++i) {
            ch = address.charCodeAt(i);
            if (ch >= _0 && ch <= _9) {
                continue;
            }
            if (ch >= _A && ch <= _Z) {
                continue;
            }
            if (ch >= _a && ch <= _z) {
                continue;
            }
            return false;
        }
        return true;
    };
    var ETHAddress = function (string) {
        ConstantString.call(this, string);
    };
    ns.Class(ETHAddress, ConstantString, [Address], null);
    ETHAddress.prototype.getNetwork = function () {
        return NetworkType.MAIN.valueOf();
    };
    ETHAddress.prototype.isBroadcast = function () {
        return false;
    };
    ETHAddress.prototype.isUser = function () {
        return true;
    };
    ETHAddress.prototype.isGroup = function () {
        return false;
    };
    ETHAddress.getValidateAddress = function (address) {
        if (is_eth(address)) {
            var lower = address.substr(2).toLowerCase();
            return "0x" + eip55(lower);
        }
        return null;
    };
    ETHAddress.isValidate = function (address) {
        return address === this.getValidateAddress(address);
    };
    ETHAddress.generate = function (fingerprint) {
        if (fingerprint.length === 65) {
            fingerprint = fingerprint.subarray(1);
        } else {
            if (fingerprint.length !== 64) {
                throw new TypeError("ECC key data error: " + fingerprint);
            }
        }
        var digest = ns.digest.KECCAK256.digest(fingerprint);
        var tail = digest.subarray(digest.length - 20);
        var address = ns.format.Hex.encode(tail);
        return new ETHAddress("0x" + eip55(address));
    };
    ETHAddress.parse = function (address) {
        if (is_eth(address)) {
            return new ETHAddress(address);
        }
        return null;
    };
    ns.mkm.ETHAddress = ETHAddress;
    ns.mkm.registers("ETHAddress");
})(MingKeMing);
(function (ns) {
    var NetworkType = ns.protocol.NetworkType;
    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var DefaultMeta = function () {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0]);
        } else {
            if (arguments.length === 4) {
                BaseMeta.call(
                    this,
                    arguments[0],
                    arguments[1],
                    arguments[2],
                    arguments[3]
                );
            } else {
                throw new SyntaxError("Default meta arguments error: " + arguments);
            }
        }
        this.__addresses = {};
    };
    ns.Class(DefaultMeta, BaseMeta, null, {
        generateAddress: function (network) {
            if (network instanceof NetworkType) {
                network = network.valueOf();
            }
            var address = this.__addresses[network];
            if (!address) {
                address = BTCAddress.generate(this.getFingerprint(), network);
                this.__addresses[network] = address;
            }
            return address;
        }
    });
    ns.mkm.DefaultMeta = DefaultMeta;
    ns.mkm.registers("DefaultMeta");
})(MingKeMing);
(function (ns) {
    var NetworkType = ns.protocol.NetworkType;
    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var BTCMeta = function () {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0]);
        } else {
            if (arguments.length === 2) {
                BaseMeta.call(this, arguments[0], arguments[1]);
            } else {
                if (arguments.length === 4) {
                    BaseMeta.call(
                        this,
                        arguments[0],
                        arguments[1],
                        arguments[2],
                        arguments[3]
                    );
                } else {
                    throw new SyntaxError("BTC meta arguments error: " + arguments);
                }
            }
        }
        this.__address = null;
    };
    ns.Class(BTCMeta, BaseMeta, null, {
        generateAddress: function (network) {
            if (!this.__address) {
                var key = this.getKey();
                var fingerprint = key.getData();
                this.__address = BTCAddress.generate(fingerprint, NetworkType.BTC_MAIN);
            }
            return this.__address;
        }
    });
    ns.mkm.BTCMeta = BTCMeta;
    ns.mkm.registers("BTCMeta");
})(MingKeMing);
(function (ns) {
    var ETHAddress = ns.mkm.ETHAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var ETHMeta = function () {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0]);
        } else {
            if (arguments.length === 2) {
                BaseMeta.call(this, arguments[0], arguments[1]);
            } else {
                if (arguments.length === 4) {
                    BaseMeta.call(
                        this,
                        arguments[0],
                        arguments[1],
                        arguments[2],
                        arguments[3]
                    );
                } else {
                    throw new SyntaxError("ETH meta arguments error: " + arguments);
                }
            }
        }
        this.__address = null;
    };
    ns.Class(ETHMeta, BaseMeta, null, {
        generateAddress: function (network) {
            if (!this.__address) {
                var key = this.getKey();
                var fingerprint = key.getData();
                this.__address = ETHAddress.generate(fingerprint);
            }
            return this.__address;
        }
    });
    ns.mkm.ETHMeta = ETHMeta;
    ns.mkm.registers("ETHMeta");
})(MingKeMing);
(function (ns) {
    var Address = ns.protocol.Address;
    var AddressFactory = ns.mkm.AddressFactory;
    var BTCAddress = ns.mkm.BTCAddress;
    var ETHAddress = ns.mkm.ETHAddress;
    var GeneralAddressFactory = function () {
        AddressFactory.call(this);
    };
    ns.Class(GeneralAddressFactory, AddressFactory, null, null);
    GeneralAddressFactory.prototype.createAddress = function (address) {
        if (address.length === 42) {
            return ETHAddress.parse(address);
        }
        return BTCAddress.parse(address);
    };
    Address.setFactory(new GeneralAddressFactory());
})(MingKeMing);
(function (ns) {
    var MetaType = ns.protocol.MetaType;
    var Meta = ns.protocol.Meta;
    var DefaultMeta = ns.mkm.DefaultMeta;
    var BTCMeta = ns.mkm.BTCMeta;
    var ETHMeta = ns.mkm.ETHMeta;
    var GeneralMetaFactory = function (type) {
        Object.call(this);
        this.__type = type;
    };
    ns.Class(GeneralMetaFactory, Object, [Meta.Factory], null);
    GeneralMetaFactory.prototype.createMeta = function (key, seed, fingerprint) {
        if (MetaType.MKM.equals(this.__type)) {
            return new DefaultMeta(this.__type, key, seed, fingerprint);
        } else {
            if (MetaType.BTC.equals(this.__type)) {
                return new BTCMeta(this.__type, key);
            } else {
                if (MetaType.ExBTC.equals(this.__type)) {
                    return new BTCMeta(this.__type, key, seed, fingerprint);
                } else {
                    if (MetaType.ETH.equals(this.__type)) {
                        return new ETHMeta(this.__type, key);
                    } else {
                        if (MetaType.ExETH.equals(this.__type)) {
                            return new ETHMeta(this.__type, key, seed, fingerprint);
                        } else {
                            return null;
                        }
                    }
                }
            }
        }
    };
    GeneralMetaFactory.prototype.generateMeta = function (sKey, seed) {
        var fingerprint = null;
        if (seed && seed.length > 0) {
            fingerprint = sKey.sign(ns.format.UTF8.encode(seed));
        }
        return this.createMeta(sKey.getPublicKey(), seed, fingerprint);
    };
    GeneralMetaFactory.prototype.parseMeta = function (meta) {
        var out;
        var type = Meta.getType(meta);
        if (MetaType.MKM.equals(type)) {
            out = new DefaultMeta(meta);
        } else {
            if (MetaType.BTC.equals(type)) {
                out = new BTCMeta(meta);
            } else {
                if (MetaType.ExBTC.equals(type)) {
                    out = new BTCMeta(meta);
                } else {
                    if (MetaType.ETH.equals(type)) {
                        out = new ETHMeta(meta);
                    } else {
                        if (MetaType.ExETH.equals(type)) {
                            out = new ETHMeta(meta);
                        } else {
                            throw TypeError("unknown meta type: " + type);
                        }
                    }
                }
            }
        }
        return Meta.check(out) ? out : null;
    };
    Meta.setFactory(MetaType.MKM, new GeneralMetaFactory(MetaType.MKM));
    Meta.setFactory(MetaType.BTC, new GeneralMetaFactory(MetaType.BTC));
    Meta.setFactory(MetaType.ExBTC, new GeneralMetaFactory(MetaType.ExBTC));
    Meta.setFactory(MetaType.ETH, new GeneralMetaFactory(MetaType.ETH));
    Meta.setFactory(MetaType.ExETH, new GeneralMetaFactory(MetaType.ExETH));
})(MingKeMing);
(function (ns) {
    var Document = ns.protocol.Document;
    var BaseDocument = ns.mkm.BaseDocument;
    var BaseBulletin = ns.mkm.BaseBulletin;
    var BaseVisa = ns.mkm.BaseVisa;
    var doc_type = function (type, identifier) {
        if (type === "*") {
            if (identifier.isGroup()) {
                return Document.BULLETIN;
            } else {
                if (identifier.isUser()) {
                    return Document.VISA;
                } else {
                    return Document.PROFILE;
                }
            }
        } else {
            return type;
        }
    };
    var GeneralDocumentFactory = function (type) {
        Object.call(this);
        this.__type = type;
    };
    ns.Class(GeneralDocumentFactory, Object, [Document.Factory], null);
    GeneralDocumentFactory.prototype.createDocument = function (
        identifier,
        data,
        signature
    ) {
        var type = doc_type(this.__type, identifier);
        if (type === Document.VISA) {
            if (data && signature) {
                return new BaseVisa(identifier, data, signature);
            } else {
                return new BaseVisa(identifier);
            }
        } else {
            if (type === Document.BULLETIN) {
                if (data && signature) {
                    return new BaseBulletin(identifier, data, signature);
                } else {
                    return new BaseBulletin(identifier);
                }
            } else {
                if (data && signature) {
                    return new BaseDocument(identifier, data, signature);
                } else {
                    return new BaseDocument(identifier);
                }
            }
        }
    };
    GeneralDocumentFactory.prototype.parseDocument = function (doc) {
        var identifier = Document.getIdentifier(doc);
        if (!identifier) {
            return null;
        }
        var type = Document.getType(doc);
        if (!type) {
            type = doc_type("*", identifier);
        }
        if (type === Document.VISA) {
            return new BaseVisa(doc);
        } else {
            if (type === Document.BULLETIN) {
                return new BaseBulletin(doc);
            } else {
                return new BaseDocument(doc);
            }
        }
    };
    Document.setFactory("*", new GeneralDocumentFactory("*"));
    Document.setFactory(Document.VISA, new GeneralDocumentFactory(Document.VISA));
    Document.setFactory(
        Document.PROFILE,
        new GeneralDocumentFactory(Document.PROFILE)
    );
    Document.setFactory(
        Document.BULLETIN,
        new GeneralDocumentFactory(Document.BULLETIN)
    );
})(MingKeMing);
(function (ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var AESKey = ns.crypto.AESKey;
    var AESKeyFactory = function () {
        Object.call(this);
    };
    ns.Class(AESKeyFactory, Object, [SymmetricKey.Factory], null);
    AESKeyFactory.prototype.generateSymmetricKey = function () {
        return this.parseSymmetricKey({ algorithm: SymmetricKey.AES });
    };
    AESKeyFactory.prototype.parseSymmetricKey = function (key) {
        return new AESKey(key);
    };
    var aes = new AESKeyFactory();
    SymmetricKey.setFactory(SymmetricKey.AES, aes);
    SymmetricKey.setFactory("AES/CBC/PKCS7Padding", aes);
})(MONKEY);
(function (ns) {
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = ns.crypto.PlainKey;
    var PlainKeyFactory = function () {
        Object.call(this);
    };
    ns.Class(PlainKeyFactory, Object, [SymmetricKey.Factory], null);
    PlainKeyFactory.prototype.generateSymmetricKey = function () {
        return PlainKey.getInstance();
    };
    PlainKeyFactory.prototype.parseSymmetricKey = function (key) {
        if (CryptographyKey.getAlgorithm(key) !== PlainKey.PLAIN) {
            throw new TypeError("plain key error: " + key);
        }
        return PlainKey.getInstance();
    };
    SymmetricKey.setFactory(PlainKey.PLAIN, new PlainKeyFactory());
})(MONKEY);
(function (ns) {
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = ns.crypto.RSAPrivateKey;
    var RSAPublicKey = ns.crypto.RSAPublicKey;
    var RSAPrivateKeyFactory = function () {
        Object.call(this);
    };
    ns.Class(RSAPrivateKeyFactory, Object, [PrivateKey.Factory], null);
    RSAPrivateKeyFactory.prototype.generatePrivateKey = function () {
        return this.parsePrivateKey({ algorithm: AsymmetricKey.RSA });
    };
    RSAPrivateKeyFactory.prototype.parsePrivateKey = function (key) {
        return new RSAPrivateKey(key);
    };
    var RSAPublicKeyFactory = function () {
        Object.call(this);
    };
    ns.Class(RSAPublicKeyFactory, Object, [PublicKey.Factory], null);
    RSAPublicKeyFactory.prototype.parsePublicKey = function (key) {
        return new RSAPublicKey(key);
    };
    var rsa_pri = new RSAPrivateKeyFactory();
    PrivateKey.setFactory(AsymmetricKey.RSA, rsa_pri);
    PrivateKey.setFactory("SHA256withRSA", rsa_pri);
    PrivateKey.setFactory("RSA/ECB/PKCS1Padding", rsa_pri);
    var rsa_pub = new RSAPublicKeyFactory();
    PublicKey.setFactory(AsymmetricKey.RSA, rsa_pub);
    PublicKey.setFactory("SHA256withRSA", rsa_pub);
    PublicKey.setFactory("RSA/ECB/PKCS1Padding", rsa_pub);
})(MONKEY);
(function (ns) {
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var ECCPrivateKey = ns.crypto.ECCPrivateKey;
    var ECCPublicKey = ns.crypto.ECCPublicKey;
    var ECCPrivateKeyFactory = function () {
        Object.call(this);
    };
    ns.Class(ECCPrivateKeyFactory, Object, [PrivateKey.Factory], null);
    ECCPrivateKeyFactory.prototype.generatePrivateKey = function () {
        return this.parsePrivateKey({ algorithm: AsymmetricKey.ECC });
    };
    ECCPrivateKeyFactory.prototype.parsePrivateKey = function (key) {
        return new ECCPrivateKey(key);
    };
    var ECCPublicKeyFactory = function () {
        Object.call(this);
    };
    ns.Class(ECCPublicKeyFactory, Object, [PublicKey.Factory], null);
    ECCPublicKeyFactory.prototype.parsePublicKey = function (key) {
        return new ECCPublicKey(key);
    };
    var ecc_pri = new ECCPrivateKeyFactory();
    PrivateKey.setFactory(AsymmetricKey.ECC, ecc_pri);
    PrivateKey.setFactory("SHA256withECC", ecc_pri);
    var ecc_pub = new ECCPublicKeyFactory();
    PublicKey.setFactory(AsymmetricKey.ECC, ecc_pub);
    PublicKey.setFactory("SHA256withECC", ecc_pub);
})(MONKEY);
if (typeof DIMSDK !== "object") {
    DIMSDK = new MingKeMing.Namespace();
}
(function (ns, base) {
    base.exports(ns);
    if (typeof ns.assert !== "function") {
        ns.assert = console.assert;
    }
    if (typeof ns.cpu !== "object") {
        ns.cpu = new ns.Namespace();
    }
    if (typeof ns.cpu.group !== "object") {
        ns.cpu.group = new ns.Namespace();
    }
    ns.registers("cpu");
    ns.cpu.registers("group");
})(DIMSDK, DIMP);
(function (ns) {
    var Envelope = ns.protocol.Envelope;
    var Command = ns.protocol.Command;
    var ReceiptCommand = function () {};
    ns.Interface(ReceiptCommand, [Command]);
    ReceiptCommand.prototype.getMessage = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ReceiptCommand.prototype.setEnvelope = function (env) {
        ns.assert(false, "implement me!");
    };
    ReceiptCommand.prototype.getEnvelope = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ReceiptCommand.prototype.setSignature = function (signature) {
        ns.assert(false, "implement me!");
    };
    ReceiptCommand.prototype.getSignature = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.protocol.ReceiptCommand = ReceiptCommand;
    ns.protocol.registers("ReceiptCommand");
})(DIMSDK);
(function (ns) {
    var Base64 = ns.format.Base64;
    var Envelope = ns.protocol.Envelope;
    var Command = ns.protocol.Command;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var BaseCommand = ns.dkd.BaseCommand;
    var BaseReceiptCommand = function () {
        if (arguments.length === 3) {
            BaseCommand.call(this, Command.RECEIPT);
            this.setMessage(arguments[0]);
            if (arguments[1] > 0) {
                this.setSerialNumber(arguments[1]);
            }
            this.setEnvelope(arguments[2]);
        } else {
            if (typeof arguments[0] === "string") {
                BaseCommand.call(this, Command.RECEIPT);
                this.setMessage(arguments[0]);
                this.__envelope = null;
            } else {
                BaseCommand.call(this, arguments[0]);
                this.__envelope = null;
            }
        }
    };
    ns.Class(BaseReceiptCommand, BaseCommand, [ReceiptCommand], {
        setSerialNumber: function (sn) {
            this.setValue("sn", sn);
        },
        setMessage: function (message) {
            this.setValue("message", message);
        },
        getMessage: function () {
            return this.getValue("message");
        },
        getEnvelope: function () {
            if (!this.__envelope) {
                var env = this.getValue("envelope");
                if (!env) {
                    var sender = this.getValue("sender");
                    var receiver = this.getValue("receiver");
                    if (sender && receiver) {
                        env = this.toMap();
                    }
                }
                this.__envelope = Envelope.parse(env);
            }
            return this.__envelope;
        },
        setEnvelope: function (env) {
            this.setValue("envelope", null);
            if (env) {
                this.setValue("sender", env.getValue("sender"));
                this.setValue("receiver", env.getValue("receiver"));
                var time = env.getValue("time");
                if (time) {
                    this.setValue("time", time);
                }
                var group = env.getValue("group");
                if (group) {
                    this.setValue("group", group);
                }
            }
            this.__envelope = env;
        },
        setSignature: function (signature) {
            if (signature instanceof Uint8Array) {
                signature = Base64.encode(signature);
            }
            this.setValue("signature", signature);
        },
        getSignature: function () {
            var signature = this.getValue("signature");
            if (typeof signature === "string") {
                signature = Base64.decode(signature);
            }
            return signature;
        }
    });
    ns.dkd.BaseReceiptCommand = BaseReceiptCommand;
    ns.dkd.registers("BaseReceiptCommand");
})(DIMSDK);
(function (ns) {
    var HandshakeState = ns.type.Enum(null, {
        INIT: 0,
        START: 1,
        AGAIN: 2,
        RESTART: 3,
        SUCCESS: 4
    });
    var Command = ns.protocol.Command;
    var HandshakeCommand = function () {};
    ns.Interface(HandshakeCommand, [Command]);
    HandshakeCommand.prototype.getMessage = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    HandshakeCommand.prototype.getSessionKey = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    HandshakeCommand.prototype.getState = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.protocol.HandshakeCommand = HandshakeCommand;
    ns.protocol.HandshakeState = HandshakeState;
    ns.protocol.registers("HandshakeCommand");
    ns.protocol.registers("HandshakeState");
})(DIMSDK);
(function (ns) {
    var Command = ns.protocol.Command;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var HandshakeState = ns.protocol.HandshakeState;
    var BaseCommand = ns.dkd.BaseCommand;
    var START_MESSAGE = "Hello world!";
    var AGAIN_MESSAGE = "DIM?";
    var SUCCESS_MESSAGE = "DIM!";
    var get_state = function (text, session) {
        if (text === SUCCESS_MESSAGE || text === "OK!") {
            return HandshakeState.SUCCESS;
        } else {
            if (text === AGAIN_MESSAGE) {
                return HandshakeState.AGAIN;
            } else {
                if (text !== START_MESSAGE) {
                    return HandshakeState.INIT;
                } else {
                    if (session) {
                        return HandshakeState.RESTART;
                    } else {
                        return HandshakeState.START;
                    }
                }
            }
        }
    };
    var BaseHandshakeCommand = function () {
        if (arguments.length === 1) {
            BaseCommand.call(this, arguments[0]);
        } else {
            if (arguments.length === 2) {
                BaseCommand.call(this, Command.HANDSHAKE);
                var text = arguments[0];
                if (text) {
                    this.setValue("message", text);
                } else {
                    this.setValue("message", START_MESSAGE);
                }
                var session = arguments[1];
                if (session) {
                    this.setValue("session", session);
                }
            }
        }
    };
    ns.Class(BaseHandshakeCommand, BaseCommand, [HandshakeCommand], {
        getMessage: function () {
            return this.getValue("message");
        },
        getSessionKey: function () {
            return this.getValue("session");
        },
        getState: function () {
            return get_state(this.getMessage(), this.getSessionKey());
        }
    });
    HandshakeCommand.start = function () {
        return new BaseHandshakeCommand(null, null);
    };
    HandshakeCommand.restart = function (session) {
        return new BaseHandshakeCommand(null, session);
    };
    HandshakeCommand.again = function (session) {
        return new BaseHandshakeCommand(AGAIN_MESSAGE, session);
    };
    HandshakeCommand.success = function () {
        return new BaseHandshakeCommand(SUCCESS_MESSAGE, null);
    };
    ns.dkd.BaseHandshakeCommand = BaseHandshakeCommand;
    ns.dkd.registers("BaseHandshakeCommand");
})(DIMSDK);
(function (ns) {
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var LoginCommand = function (info) {};
    ns.Interface(LoginCommand, [Command]);
    LoginCommand.prototype.getIdentifier = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    LoginCommand.prototype.getDevice = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    LoginCommand.prototype.setDevice = function (device) {
        ns.assert(false, "implement me!");
    };
    LoginCommand.prototype.getAgent = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    LoginCommand.prototype.setAgent = function (UA) {
        ns.assert(false, "implement me!");
    };
    LoginCommand.prototype.getStation = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    LoginCommand.prototype.setStation = function (station) {
        ns.assert(false, "implement me!");
    };
    LoginCommand.prototype.getProvider = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    LoginCommand.prototype.setProvider = function (provider) {
        ns.assert(false, "implement me!");
    };
    ns.protocol.LoginCommand = LoginCommand;
    ns.protocol.registers("LoginCommand");
})(DIMSDK);
(function (ns) {
    var Wrapper = ns.type.Wrapper;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var LoginCommand = ns.protocol.LoginCommand;
    var BaseCommand = ns.dkd.BaseCommand;
    var BaseLoginCommand = function (info) {
        if (ns.Interface.conforms(info, ID)) {
            BaseCommand.call(this, Command.LOGIN);
            this.setValue("ID", info.toString());
        } else {
            BaseCommand.call(this, info);
        }
    };
    ns.Class(BaseLoginCommand, BaseCommand, [LoginCommand], {
        getIdentifier: function () {
            return ID.parse(this.getValue("ID"));
        },
        getDevice: function () {
            return this.getValue("device");
        },
        setDevice: function (device) {
            this.setValue("device", device);
        },
        getAgent: function () {
            return this.getValue("agent");
        },
        setAgent: function (UA) {
            this.setValue("agent", UA);
        },
        getStation: function () {
            return this.getValue("station");
        },
        setStation: function (station) {
            var info;
            if (station instanceof ns.Station) {
                info = {
                    host: station.getHost(),
                    port: station.getPort(),
                    ID: station.getIdentifier().toString()
                };
            } else {
                info = Wrapper.fetchMap(station);
            }
            this.setValue("station", info);
        },
        getProvider: function () {
            return this.getValue("provider");
        },
        setProvider: function (provider) {
            var info;
            if (provider instanceof ns.ServiceProvider) {
                info = { ID: provider.getIdentifier().toString() };
            } else {
                if (ns.Interface.conforms(provider, ID)) {
                    info = { ID: provider.toString() };
                } else {
                    info = Wrapper.fetchMap(provider);
                }
            }
            this.setValue("provider", info);
        }
    });
    ns.dkd.BaseLoginCommand = BaseLoginCommand;
    ns.dkd.registers("BaseLoginCommand");
})(DIMSDK);
(function (ns) {
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var MuteCommand = function (info) {};
    ns.Interface(MuteCommand, [Command]);
    MuteCommand.MUTE = "mute";
    MuteCommand.prototype.setMuteCList = function (list) {
        ns.assert(false, "implement me!");
    };
    MuteCommand.prototype.getMuteCList = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    MuteCommand.setMuteList = function (list, cmd) {
        if (list) {
            cmd["list"] = ID.revert(list);
        } else {
            delete cmd["list"];
        }
    };
    MuteCommand.getMuteList = function (cmd) {
        var list = cmd["list"];
        if (list) {
            return ID.convert(list);
        } else {
            return list;
        }
    };
    ns.protocol.MuteCommand = MuteCommand;
    ns.protocol.registers("MuteCommand");
})(DIMSDK);
(function (ns) {
    var MuteCommand = ns.protocol.MuteCommand;
    var BaseCommand = ns.dkd.BaseCommand;
    var BaseMuteCommand = function (info) {
        if (arguments.length === 0) {
            BaseCommand.call(this, MuteCommand.MUTE);
            this.__list = null;
        } else {
            if (arguments[0] instanceof Array) {
                BaseCommand.call(this, MuteCommand.MUTE);
                this.setBlockCList(arguments[0]);
            } else {
                BaseCommand.call(this, arguments[0]);
                this.__list = null;
            }
        }
    };
    ns.Class(BaseMuteCommand, BaseCommand, [MuteCommand], {
        getMuteCList: function () {
            if (!this.__list) {
                var dict = this.toMap();
                this.__list = MuteCommand.getMuteList(dict);
            }
            return this.__list;
        },
        setMuteCList: function (list) {
            var dict = this.toMap();
            MuteCommand.setMuteList(list, dict);
            this.__list = list;
        }
    });
    ns.dkd.BaseMuteCommand = BaseMuteCommand;
    ns.dkd.registers("BaseMuteCommand");
})(DIMSDK);
(function (ns) {
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var BlockCommand = function () {};
    ns.Interface(BlockCommand, [Command]);
    BlockCommand.BLOCK = "block";
    BlockCommand.prototype.setBlockCList = function (list) {
        ns.assert(false, "implement me!");
    };
    BlockCommand.prototype.getBlockCList = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    BlockCommand.setBlockList = function (list, cmd) {
        if (list) {
            cmd["list"] = ID.revert(list);
        } else {
            delete cmd["list"];
        }
    };
    BlockCommand.getBlockList = function (cmd) {
        var list = cmd["list"];
        if (list) {
            return ID.convert(list);
        } else {
            return list;
        }
    };
    ns.protocol.BlockCommand = BlockCommand;
    ns.protocol.registers("BlockCommand");
})(DIMSDK);
(function (ns) {
    var BlockCommand = ns.protocol.BlockCommand;
    var BaseCommand = ns.dkd.BaseCommand;
    var BaseBlockCommand = function () {
        if (arguments.length === 0) {
            BaseCommand.call(this, BlockCommand.BLOCK);
            this.__list = null;
        } else {
            if (arguments[0] instanceof Array) {
                BaseCommand.call(this, BlockCommand.BLOCK);
                this.setBlockCList(arguments[0]);
            } else {
                BaseCommand.call(this, arguments[0]);
                this.__list = null;
            }
        }
    };
    ns.Class(BaseBlockCommand, BaseCommand, [BlockCommand], {
        getBlockCList: function () {
            if (!this.__list) {
                var dict = this.toMap();
                this.__list = BlockCommand.getBlockList(dict);
            }
            return this.__list;
        },
        setBlockCList: function (list) {
            var dict = this.toMap();
            BlockCommand.setBlockList(list, dict);
            this.__list = list;
        }
    });
    ns.dkd.BaseBlockCommand = BaseBlockCommand;
    ns.dkd.registers("BaseBlockCommand");
})(DIMSDK);
(function (ns) {
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var StorageCommand = function (info) {};
    ns.Interface(StorageCommand, [Command]);
    StorageCommand.STORAGE = "storage";
    StorageCommand.CONTACTS = "contacts";
    StorageCommand.PRIVATE_KEY = "private_key";
    StorageCommand.prototype.setTitle = function (title) {
        ns.assert(false, "implement me!");
    };
    StorageCommand.prototype.getTitle = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    StorageCommand.prototype.setIdentifier = function (identifier) {
        ns.assert(false, "implement me!");
    };
    StorageCommand.prototype.getIdentifier = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    StorageCommand.prototype.setData = function (data) {
        ns.assert(false, "implement me!");
    };
    StorageCommand.prototype.getData = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    StorageCommand.prototype.setKey = function (data) {
        ns.assert(false, "implement me!");
    };
    StorageCommand.prototype.getKey = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    StorageCommand.prototype.decryptData = function (key) {
        ns.assert(false, "implement me!");
        return null;
    };
    StorageCommand.prototype.decryptKey = function (privateKey) {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.protocol.StorageCommand = StorageCommand;
    ns.protocol.registers("StorageCommand");
})(DIMSDK);
(function (ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var Base64 = ns.format.Base64;
    var ID = ns.protocol.ID;
    var StorageCommand = ns.protocol.StorageCommand;
    var BaseCommand = ns.dkd.BaseCommand;
    var BaseStorageCommand = function (info) {
        if (typeof info === "string") {
            BaseCommand.call(this, StorageCommand.STORAGE);
            this.setTitle(info);
        } else {
            BaseCommand.call(this, info);
        }
        this.__data = null;
        this.__plaintext = null;
        this.__key = null;
        this.__password = null;
    };
    ns.Class(BaseStorageCommand, BaseCommand, [StorageCommand], {
        setTitle: function (title) {
            this.setValue("title", title);
        },
        getTitle: function () {
            var title = this.getValue("title");
            if (title && title.length > 0) {
                return title;
            } else {
                return this.getCommand();
            }
        },
        setIdentifier: function (identifier) {
            if (identifier && ns.Interface.conforms(identifier, ID)) {
                this.setValue("ID", identifier.toString());
            } else {
                this.setValue("ID", null);
            }
        },
        getIdentifier: function () {
            return ID.parse(this.getValue("ID"));
        },
        setData: function (data) {
            var base64 = null;
            if (data) {
                base64 = Base64.encode(data);
            }
            this.setValue("data", base64);
            this.__data = data;
            this.__plaintext = null;
        },
        getData: function () {
            if (!this.__data) {
                var base64 = this.getValue("data");
                if (base64) {
                    this.__data = Base64.decode(base64);
                }
            }
            return this.__data;
        },
        setKey: function (data) {
            var base64 = null;
            if (data) {
                base64 = Base64.encode(data);
            }
            this.setValue("key", base64);
            this.__key = data;
            this.__password = null;
        },
        getKey: function () {
            if (!this.__key) {
                var base64 = this.getValue("key");
                if (base64) {
                    this.__key = Base64.decode(base64);
                }
            }
            return this.__key;
        },
        decryptData: function (key) {
            if (!this.__plaintext) {
                var pwd = null;
                if (ns.Interface.conforms(key, PrivateKey)) {
                    pwd = this.decryptKey(key);
                    if (!pwd) {
                        throw new Error("failed to decrypt key: " + key);
                    }
                } else {
                    if (ns.Interface.conforms(key, SymmetricKey)) {
                        pwd = key;
                    } else {
                        throw new TypeError("Decryption key error: " + key);
                    }
                }
                var data = this.getData();
                this.__plaintext = pwd.decrypt(data);
            }
            return this.__plaintext;
        },
        decryptKey: function (privateKey) {
            if (!this.__password) {
                var key = this.getKey();
                var data = privateKey.decrypt(key);
                var json = ns.format.UTF8.decode(data);
                var dict = ns.format.JSON.decode(json);
                this.__password = SymmetricKey.parse(dict);
            }
            return this.__password;
        }
    });
    ns.dkd.BaseStorageCommand = BaseStorageCommand;
    ns.dkd.registers("BaseStorageCommand");
})(DIMSDK);
(function (ns) {
    var BaseContent = ns.dkd.BaseContent;
    var CustomizedContent = function (info) {};
    ns.Class(CustomizedContent, [BaseContent], null, {
        getApplication: function () {
            return this.getValue("app");
        },
        getModule: function () {
            return this.getValue("mod");
        }
    });
    ns.dkd.CustomizedContent = CustomizedContent;
    ns.dkd.registers("CustomizedContent");
})(DIMSDK);
(function (ns) {
    var BaseGroup = ns.mkm.BaseGroup;
    var Polylogue = function (identifier) {
        BaseGroup.call(this, identifier);
    };
    ns.Class(Polylogue, BaseGroup, null, {
        getOwner: function () {
            var owner = BaseGroup.prototype.getOwner.call(this);
            if (owner) {
                return owner;
            }
            return this.getFounder();
        }
    });
    ns.mkm.Polylogue = Polylogue;
    ns.mkm.registers("Polylogue");
})(DIMSDK);
(function (ns) {
    var Group = ns.mkm.Group;
    var BaseGroup = ns.mkm.BaseGroup;
    var Chatroom = function (identifier) {
        BaseGroup.call(this, identifier);
    };
    ns.Class(Chatroom, BaseGroup, null, {
        getAdmins: function () {
            var identifier = this.getIdentifier();
            var delegate = this.getDataSource();
            return delegate.getAdmins(identifier);
        }
    });
    var ChatroomDataSource = function () {};
    ns.Interface(ChatroomDataSource, [Group.DataSource]);
    ChatroomDataSource.prototype.getAdmins = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Chatroom.DataSource = ChatroomDataSource;
    ns.mkm.Chatroom = Chatroom;
    ns.mkm.registers("Chatroom");
})(DIMSDK);
(function (ns) {
    var BaseUser = ns.mkm.BaseUser;
    var Robot = function (identifier) {
        BaseUser.call(this, identifier);
    };
    ns.Class(Robot, BaseUser, null, null);
    ns.mkm.Robot = Robot;
    ns.mkm.registers("Robot");
})(DIMSDK);
(function (ns) {
    var BaseUser = ns.mkm.BaseUser;
    var Station = function (identifier, host, port) {
        BaseUser.call(this, identifier);
        this.host = host;
        this.port = port;
    };
    ns.Class(Station, BaseUser, null, {
        getHost: function () {
            if (!this.host) {
                var doc = this.getDocument("*");
                if (doc) {
                    this.host = doc.getProperty("host");
                }
                if (!this.host) {
                    this.host = "0.0.0.0";
                }
            }
            return this.host;
        },
        getPort: function () {
            if (!this.port) {
                var doc = this.getDocument("*");
                if (doc) {
                    this.port = doc.getProperty("port");
                }
                if (!this.port) {
                    this.port = 9394;
                }
            }
            return this.port;
        }
    });
    ns.mkm.Station = Station;
    ns.mkm.registers("Station");
})(DIMSDK);
(function (ns) {
    var BaseGroup = ns.mkm.BaseGroup;
    var ServiceProvider = function (identifier) {
        BaseGroup.call(this, identifier);
    };
    ns.Class(ServiceProvider, BaseGroup, null, {
        getStations: function () {
            return this.getMembers();
        }
    });
    ns.mkm.ServiceProvider = ServiceProvider;
    ns.mkm.registers("ServiceProvider");
})(DIMSDK);
(function (ns) {
    var KEYWORDS = [
        "all",
        "everyone",
        "anyone",
        "owner",
        "founder",
        "dkd",
        "mkm",
        "dimp",
        "dim",
        "dimt",
        "rsa",
        "ecc",
        "aes",
        "des",
        "btc",
        "eth",
        "crypto",
        "key",
        "symmetric",
        "asymmetric",
        "public",
        "private",
        "secret",
        "password",
        "id",
        "address",
        "meta",
        "profile",
        "entity",
        "user",
        "group",
        "contact",
        "member",
        "admin",
        "administrator",
        "assistant",
        "main",
        "polylogue",
        "chatroom",
        "social",
        "organization",
        "company",
        "school",
        "government",
        "department",
        "provider",
        "station",
        "thing",
        "robot",
        "message",
        "instant",
        "secure",
        "reliable",
        "envelope",
        "sender",
        "receiver",
        "time",
        "content",
        "forward",
        "command",
        "history",
        "keys",
        "data",
        "signature",
        "type",
        "serial",
        "sn",
        "text",
        "file",
        "image",
        "audio",
        "video",
        "page",
        "handshake",
        "receipt",
        "block",
        "mute",
        "register",
        "suicide",
        "found",
        "abdicate",
        "invite",
        "expel",
        "join",
        "quit",
        "reset",
        "query",
        "hire",
        "fire",
        "resign",
        "server",
        "client",
        "terminal",
        "local",
        "remote",
        "barrack",
        "cache",
        "transceiver",
        "ans",
        "facebook",
        "store",
        "messenger",
        "root",
        "supervisor"
    ];
    var AddressNameService = function () {};
    ns.Interface(AddressNameService, null);
    AddressNameService.KEYWORDS = KEYWORDS;
    AddressNameService.prototype.getIdentifier = function (name) {
        ns.assert(false, "implement me!");
        return null;
    };
    AddressNameService.prototype.getNames = function (identifier) {
        ns.assert(false, "implement me!");
        return null;
    };
    AddressNameService.prototype.save = function (name, identifier) {
        ns.assert(false, "implement me!");
        return false;
    };
    ns.AddressNameService = AddressNameService;
    ns.registers("AddressNameService");
})(DIMSDK);
(function (ns) {
    var ID = ns.protocol.ID;
    var AddressNameService = ns.AddressNameService;
    var AddressNameServer = function () {
        Object.call(this);
        var caches = {
            all: ID.EVERYONE,
            everyone: ID.EVERYONE,
            anyone: ID.ANYONE,
            owner: ID.ANYONE,
            founder: ID.FOUNDER
        };
        var reserved = {};
        var keywords = AddressNameService.KEYWORDS;
        for (var i = 0; i < keywords.length; ++i) {
            reserved[keywords[i]] = true;
        }
        this.__reserved = reserved;
        this.__caches = caches;
        this.__tables = {};
    };
    ns.Class(AddressNameServer, Object, [AddressNameService], null);
    AddressNameServer.prototype.isReserved = function (name) {
        return this.__reserved[name] === true;
    };
    AddressNameServer.prototype.cache = function (name, identifier) {
        if (this.isReserved(name)) {
            return false;
        }
        if (identifier) {
            this.__caches[name] = identifier;
            delete this.__tables[identifier.toString()];
        } else {
            delete this.__caches[name];
            this.__tables = {};
        }
        return true;
    };
    AddressNameServer.prototype.getIdentifier = function (name) {
        return this.__caches[name];
    };
    AddressNameServer.prototype.getNames = function (identifier) {
        var array = this.__tables[identifier.toString()];
        if (array === null) {
            array = [];
            var keys = Object.keys(this.__caches);
            var name;
            for (var i = 0; i < keys.length; ++i) {
                name = keys[i];
                if (this.__caches[name] === identifier) {
                    array.push(name);
                }
            }
            this.__tables[identifier.toString()] = array;
        }
        return array;
    };
    AddressNameServer.prototype.save = function (name, identifier) {
        return this.cache(name, identifier);
    };
    ns.AddressNameServer = AddressNameServer;
    ns.registers("AddressNameServer");
})(DIMSDK);
(function (ns) {
    var CipherKeyDelegate = function () {};
    ns.Interface(CipherKeyDelegate, null);
    CipherKeyDelegate.prototype.getCipherKey = function (from, to, generate) {
        ns.assert(false, "implement me!");
        return null;
    };
    CipherKeyDelegate.prototype.cacheCipherKey = function (from, to, key) {
        ns.assert(false, "implement me!");
    };
    ns.CipherKeyDelegate = CipherKeyDelegate;
    ns.registers("CipherKeyDelegate");
})(DIMSDK);
(function (ns) {
    var NetworkType = ns.protocol.NetworkType;
    var ID = ns.protocol.ID;
    var BaseUser = ns.mkm.BaseUser;
    var Robot = ns.mkm.Robot;
    var Station = ns.mkm.Station;
    var BaseGroup = ns.mkm.BaseGroup;
    var Polylogue = ns.mkm.Polylogue;
    var Chatroom = ns.mkm.Chatroom;
    var ServiceProvider = ns.mkm.ServiceProvider;
    var Barrack = ns.core.Barrack;
    var Facebook = function () {
        Barrack.call(this);
        this.__users = {};
        this.__groups = {};
    };
    ns.Class(Facebook, Barrack, null, {
        checkDocument: function (doc) {
            var identifier = doc.getIdentifier();
            if (!identifier) {
                return false;
            }
            var meta;
            if (identifier.isGroup()) {
                var owner = this.getOwner(identifier);
                if (!owner) {
                    if (NetworkType.POLYLOGUE.equals(identifier.getType())) {
                        meta = this.getMeta(identifier);
                    } else {
                        return false;
                    }
                } else {
                    meta = this.getMeta(owner);
                }
            } else {
                meta = this.getMeta(identifier);
            }
            return meta && doc.verify(meta.getKey());
        },
        isFounder: function (member, group) {
            var gMeta = this.getMeta(group);
            if (!gMeta) {
                return false;
            }
            var mMeta = this.getMeta(member);
            if (!mMeta) {
                return false;
            }
            return gMeta.matches(mMeta.key);
        },
        isOwner: function (member, group) {
            if (NetworkType.POLYLOGUE.equals(group.getType())) {
                return this.isFounder(member, group);
            }
            throw new Error("only Polylogue so far");
        },
        selectLocalUser: function (receiver) {
            var users = this.getLocalUsers();
            if (!users || users.length === 0) {
                throw new Error("local users should not be empty");
            } else {
                if (receiver.isBroadcast()) {
                    return users[0];
                }
            }
            var i, user, uid;
            if (receiver.isGroup()) {
                var members = this.getMembers(receiver);
                if (!members || members.length === 0) {
                    return null;
                }
                var j, member;
                for (i = 0; i < users.length; ++i) {
                    user = users[i];
                    uid = user.getIdentifier();
                    for (j = 0; j < members.length; ++j) {
                        member = members[j];
                        if (member.equals(uid)) {
                            return user;
                        }
                    }
                }
            } else {
                for (i = 0; i < users.length; ++i) {
                    user = users[i];
                    uid = user.getIdentifier();
                    if (receiver.equals(uid)) {
                        return user;
                    }
                }
            }
            return null;
        },
        getUser: function (identifier) {
            var user = this.__users[identifier.toString()];
            if (!user) {
                user = this.createUser(identifier);
                if (user) {
                    cacheUser.call(this, user);
                }
            }
            return user;
        },
        getGroup: function (identifier) {
            var group = this.__groups[identifier.toString()];
            if (!group) {
                group = this.createGroup(identifier);
                if (group) {
                    cacheGroup.call(this, group);
                }
            }
            return group;
        }
    });
    var thanos = function (map, finger) {
        var keys = Object.keys(map);
        for (var i = 0; i < keys.length; ++i) {
            var p = map[keys[i]];
            if (typeof p === "function") {
                continue;
            }
            if ((++finger & 1) === 1) {
                delete map[p];
            }
        }
        return finger;
    };
    Facebook.prototype.reduceMemory = function () {
        var finger = 0;
        finger = thanos(this.__users, finger);
        finger = thanos(this.__groups, finger);
        return finger >> 1;
    };
    var cacheUser = function (user) {
        if (!user.getDataSource()) {
            user.setDataSource(this);
        }
        this.__users[user.getIdentifier().toString()] = user;
        return true;
    };
    var cacheGroup = function (group) {
        if (!group.getDataSource()) {
            group.setDataSource(this);
        }
        this.__groups[group.getIdentifier().toString()] = group;
        return true;
    };
    Facebook.prototype.saveMeta = function (meta, identifier) {
        ns.assert(false, "implement me!");
        return false;
    };
    Facebook.prototype.saveDocument = function (doc) {
        ns.assert(false, "implement me!");
        return false;
    };
    Facebook.prototype.saveMembers = function (members, identifier) {
        ns.assert(false, "implement me!");
        return false;
    };
    Facebook.prototype.createUser = function (identifier) {
        if (identifier.isBroadcast()) {
            return new BaseUser(identifier);
        }
        var type = identifier.getType();
        if (NetworkType.MAIN.equals(type) || NetworkType.BTC_MAIN.equals(type)) {
            return new BaseUser(identifier);
        }
        if (NetworkType.ROBOT.equals(type)) {
            return new Robot(identifier);
        }
        if (NetworkType.STATION.equals(type)) {
            return new Station(identifier);
        }
        throw new TypeError("Unsupported user type: " + type);
    };
    Facebook.prototype.createGroup = function (identifier) {
        if (identifier.isBroadcast()) {
            return new BaseGroup(identifier);
        }
        var type = identifier.getType();
        if (NetworkType.POLYLOGUE.equals(type)) {
            return new Polylogue(identifier);
        }
        if (NetworkType.CHATROOM.equals(type)) {
            return new Chatroom(identifier);
        }
        if (NetworkType.PROVIDER.equals(type)) {
            return new ServiceProvider(identifier);
        }
        throw new TypeError("Unsupported group type: " + type);
    };
    Facebook.prototype.getLocalUsers = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Facebook.prototype.getCurrentUser = function () {
        var users = this.getLocalUsers();
        if (!users || users.length === 0) {
            return null;
        }
        return users[0];
    };
    ns.Facebook = Facebook;
    ns.registers("Facebook");
})(DIMSDK);
(function (ns) {
    var TwinsHelper = function (facebook, messenger) {
        Object.call(this);
        this.__facebook = facebook;
        this.__messenger = messenger;
    };
    ns.Class(TwinsHelper, Object, null, null);
    TwinsHelper.prototype.getFacebook = function () {
        return this.__facebook;
    };
    TwinsHelper.prototype.getMessenger = function () {
        return this.__messenger;
    };
    ns.TwinsHelper = TwinsHelper;
    ns.registers("TwinsHelper");
})(DIMSDK);
(function (ns) {
    var Command = ns.protocol.Command;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var Packer = ns.core.Packer;
    var TwinsHelper = ns.TwinsHelper;
    var MessagePacker = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    ns.Class(MessagePacker, TwinsHelper, [Packer], {
        getOvertGroup: function (content) {
            var group = content.getGroup();
            if (!group) {
                return null;
            }
            if (group.isBroadcast()) {
                return group;
            }
            if (ns.Interface.conforms(content, Command)) {
                return null;
            }
            return group;
        },
        encryptMessage: function (iMsg) {
            var messenger = this.getMessenger();
            if (!iMsg.getDelegate()) {
                iMsg.setDelegate(messenger);
            }
            var sender = iMsg.getSender();
            var receiver = iMsg.getReceiver();
            var group = messenger.getOvertGroup(iMsg.getContent());
            var password;
            if (group) {
                password = messenger.getCipherKey(sender, group, true);
            } else {
                password = messenger.getCipherKey(sender, receiver, true);
            }
            var sMsg;
            if (receiver.isGroup()) {
                var facebook = this.getFacebook();
                var grp = facebook.getGroup(receiver);
                if (!grp) {
                    return null;
                }
                var members = grp.getMembers();
                if (!members || members.length === 0) {
                    return null;
                }
                sMsg = iMsg.encrypt(password, members);
            } else {
                sMsg = iMsg.encrypt(password, null);
            }
            if (!sMsg) {
                return null;
            }
            if (group && !receiver.equals(group)) {
                sMsg.getEnvelope().setGroup(group);
            }
            sMsg.getEnvelope().setType(iMsg.getContent().getType());
            return sMsg;
        },
        signMessage: function (sMsg) {
            if (!sMsg.getDelegate()) {
                var messenger = this.getMessenger();
                sMsg.setDelegate(messenger);
            }
            return sMsg.sign();
        },
        serializeMessage: function (rMsg) {
            var dict = rMsg.toMap();
            var json = ns.format.JSON.encode(dict);
            return ns.format.UTF8.encode(json);
        },
        deserializeMessage: function (data) {
            var json = ns.format.UTF8.decode(data);
            var dict = ns.format.JSON.decode(json);
            return ReliableMessage.parse(dict);
        },
        verifyMessage: function (rMsg) {
            var facebook = this.getFacebook();
            var sender = rMsg.getSender();
            var meta = rMsg.getMeta();
            if (meta) {
                facebook.saveMeta(meta, sender);
            }
            var visa = rMsg.getVisa();
            if (visa) {
                facebook.saveDocument(visa);
            }
            if (!rMsg.getDelegate()) {
                var messenger = this.getMessenger();
                rMsg.setDelegate(messenger);
            }
            return rMsg.verify();
        },
        decryptMessage: function (sMsg) {
            var facebook = this.getFacebook();
            var receiver = sMsg.getReceiver();
            var user = facebook.selectLocalUser(receiver);
            var trimmed;
            if (!user) {
                trimmed = null;
            } else {
                if (receiver.isGroup()) {
                    trimmed = sMsg.trim(user.getIdentifier());
                } else {
                    trimmed = sMsg;
                }
            }
            if (!trimmed) {
                throw new ReferenceError("receiver error: " + sMsg.toMap());
            }
            if (!sMsg.getDelegate()) {
                var messenger = this.getMessenger();
                sMsg.setDelegate(messenger);
            }
            return sMsg.decrypt();
        }
    });
    ns.MessagePacker = MessagePacker;
    ns.registers("MessagePacker");
})(DIMSDK);
(function (ns) {
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var Processor = ns.core.Processor;
    var TwinsHelper = ns.TwinsHelper;
    var MessageProcessor = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
        this.__factory = this.createFactory();
    };
    ns.Class(MessageProcessor, TwinsHelper, [Processor], {
        createFactory: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            var creator = this.createCreator();
            return new ns.cpu.ContentProcessorFactory(facebook, messenger, creator);
        },
        createCreator: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.cpu.ContentProcessorCreator(facebook, messenger);
        },
        processPackage: function (data) {
            var messenger = this.getMessenger();
            var rMsg = messenger.deserializeMessage(data);
            if (!rMsg) {
                return null;
            }
            var responses = messenger.processReliableMessage(rMsg);
            if (!responses) {
                return null;
            }
            var packages = [];
            var pack;
            for (var i = 0; i < responses.length; ++i) {
                pack = messenger.serializeMessage(responses[i]);
                if (!pack) {
                    continue;
                }
                packages.push(pack);
            }
            return packages;
        },
        processReliableMessage: function (rMsg) {
            var messenger = this.getMessenger();
            var sMsg = messenger.verifyMessage(rMsg);
            if (!sMsg) {
                return null;
            }
            var responses = messenger.processSecureMessage(sMsg, rMsg);
            if (!responses) {
                return null;
            }
            var messages = [];
            var msg;
            for (var i = 0; i < responses.length; ++i) {
                msg = messenger.signMessage(responses[i]);
                if (!msg) {
                    continue;
                }
                messages.push(msg);
            }
            return messages;
        },
        processSecureMessage: function (sMsg, rMsg) {
            var messenger = this.getMessenger();
            var iMsg = messenger.decryptMessage(sMsg);
            if (!iMsg) {
                return null;
            }
            var responses = messenger.processInstantMessage(iMsg, rMsg);
            if (!responses) {
                return null;
            }
            var messages = [];
            var msg;
            for (var i = 0; i < responses.length; ++i) {
                msg = messenger.encryptMessage(responses[i]);
                if (!msg) {
                    continue;
                }
                messages.push(msg);
            }
            return messages;
        },
        processInstantMessage: function (iMsg, rMsg) {
            var messenger = this.getMessenger();
            var responses = messenger.processContent(iMsg.getContent(), rMsg);
            if (!responses) {
                return null;
            }
            var sender = iMsg.getSender();
            var receiver = iMsg.getReceiver();
            var facebook = this.getFacebook();
            var user = facebook.selectLocalUser(receiver);
            var uid = user.getIdentifier();
            var messages = [];
            var res, env, msg;
            for (var i = 0; i < responses.length; ++i) {
                res = responses[i];
                if (!res) {
                    continue;
                }
                env = Envelope.create(uid, sender, null);
                msg = InstantMessage.create(env, res);
                messages.push(msg);
            }
            return messages;
        },
        processContent: function (content, rMsg) {
            var cpu = this.getProcessor(content);
            return cpu.process(content, rMsg);
        }
    });
    MessageProcessor.prototype.getProcessor = function (content) {
        return this.__factory.getProcessor(content);
    };
    MessageProcessor.prototype.getContentProcessor = function (type) {
        return this.__factory.getContentProcessor(type);
    };
    MessageProcessor.prototype.getCommandProcessor = function (type, command) {
        return this.__factory.getCommandProcessor(type, command);
    };
    ns.MessageProcessor = MessageProcessor;
    ns.registers("MessageProcessor");
})(DIMSDK);
(function (ns) {
    var Transceiver = ns.core.Transceiver;
    var Messenger = function () {
        Transceiver.call(this);
    };
    ns.Class(Messenger, Transceiver, null, null);
    Messenger.prototype.getCipherKeyDelegate = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Messenger.prototype.getPacker = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Messenger.prototype.getProcessor = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Messenger.prototype.getCipherKey = function (from, to, generate) {
        var delegate = this.getCipherKeyDelegate();
        return delegate.getCipherKey(from, to, generate);
    };
    Messenger.prototype.cacheCipherKey = function (from, to, key) {
        var delegate = this.getCipherKeyDelegate();
        return delegate.cacheCipherKey(from, to, key);
    };
    Messenger.prototype.getOvertGroup = function (content) {
        var packer = this.getPacker();
        return packer.getOvertGroup(content);
    };
    Messenger.prototype.encryptMessage = function (iMsg) {
        var packer = this.getPacker();
        return packer.encryptMessage(iMsg);
    };
    Messenger.prototype.signMessage = function (sMsg) {
        var packer = this.getPacker();
        return packer.signMessage(sMsg);
    };
    Messenger.prototype.serializeMessage = function (rMsg) {
        var packer = this.getPacker();
        return packer.serializeMessage(rMsg);
    };
    Messenger.prototype.deserializeMessage = function (data) {
        var packer = this.getPacker();
        return packer.deserializeMessage(data);
    };
    Messenger.prototype.verifyMessage = function (rMsg) {
        var packer = this.getPacker();
        return packer.verifyMessage(rMsg);
    };
    Messenger.prototype.decryptMessage = function (sMsg) {
        var packer = this.getPacker();
        return packer.decryptMessage(sMsg);
    };
    Messenger.prototype.processPackage = function (data) {
        var processor = this.getProcessor();
        return processor.processPackage(data);
    };
    Messenger.prototype.processReliableMessage = function (rMsg) {
        var processor = this.getProcessor();
        return processor.processReliableMessage(rMsg);
    };
    Messenger.prototype.processSecureMessage = function (sMsg, rMsg) {
        var processor = this.getProcessor();
        return processor.processSecureMessage(sMsg, rMsg);
    };
    Messenger.prototype.processInstantMessage = function (iMsg, rMsg) {
        var processor = this.getProcessor();
        return processor.processInstantMessage(iMsg, rMsg);
    };
    Messenger.prototype.processContent = function (content, rMsg) {
        var processor = this.getProcessor();
        return processor.processContent(content, rMsg);
    };
    Messenger.prototype.deserializeKey = function (data, sender, receiver, sMsg) {
        if (!data) {
            return this.getCipherKey(sender, receiver, false);
        }
        return Transceiver.prototype.deserializeKey.call(
            this,
            data,
            sender,
            receiver,
            sMsg
        );
    };
    Messenger.prototype.deserializeContent = function (data, pwd, sMsg) {
        var content = Transceiver.prototype.deserializeContent.call(
            this,
            data,
            pwd,
            sMsg
        );
        if (!is_broadcast(sMsg)) {
            var group = this.getOvertGroup(content);
            if (group) {
                this.cacheCipherKey(sMsg.getSender(), group, pwd);
            } else {
                this.cacheCipherKey(sMsg.getSender(), sMsg.getReceiver(), pwd);
            }
        }
        return content;
    };
    var is_broadcast = function (msg) {
        var receiver = msg.getGroup();
        if (!receiver) {
            receiver = msg.getReceiver();
        }
        return receiver.isBroadcast();
    };
    ns.Messenger = Messenger;
    ns.registers("Messenger");
})(DIMSDK);
(function (ns) {
    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var Command = ns.protocol.Command;
    var MuteCommand = ns.protocol.MuteCommand;
    var BlockCommand = ns.protocol.BlockCommand;
    var StorageCommand = ns.protocol.StorageCommand;
    var ContentFactory = ns.core.ContentFactory;
    var CommandFactory = ns.core.CommandFactory;
    var registerAllFactories = function () {
        ns.core.registerContentFactories();
        ns.core.registerCommandFactories();
        Content.setFactory(
            ContentType.CUSTOMIZED,
            new ContentFactory(ns.dkd.CustomizedContent)
        );
        Content.setFactory(
            ContentType.APPLICATION,
            new ContentFactory(ns.dkd.CustomizedContent)
        );
        registerCommandFactories();
    };
    var registerCommandFactories = function () {
        Command.setFactory(
            Command.RECEIPT,
            new CommandFactory(ns.dkd.BaseReceiptCommand)
        );
        Command.setFactory(
            Command.HANDSHAKE,
            new CommandFactory(ns.dkd.BaseHandshakeCommand)
        );
        Command.setFactory(
            Command.LOGIN,
            new CommandFactory(ns.dkd.BaseLoginCommand)
        );
        Command.setFactory(
            MuteCommand.MUTE,
            new CommandFactory(ns.dkd.BaseMuteCommand)
        );
        Command.setFactory(
            BlockCommand.BLOCK,
            new CommandFactory(ns.dkd.BaseBlockCommand)
        );
        var spu = new CommandFactory(ns.dkd.BaseStorageCommand);
        Command.setFactory(StorageCommand.STORAGE, spu);
        Command.setFactory(StorageCommand.CONTACTS, spu);
        Command.setFactory(StorageCommand.PRIVATE_KEY, spu);
    };
    ns.registerAllFactories = registerAllFactories;
    ns.registers("registerAllFactories");
})(DIMSDK);
(function (ns) {
    var ContentProcessor = function () {};
    ns.Interface(ContentProcessor, null);
    ContentProcessor.prototype.process = function (content, rMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    var Creator = function () {};
    ns.Interface(Creator, null);
    Creator.prototype.createContentProcessor = function (type) {
        ns.assert(false, "implement me!");
        return null;
    };
    Creator.prototype.createCommandProcessor = function (type, command) {
        ns.assert(false, "implement me!");
        return null;
    };
    var Factory = function () {};
    ns.Interface(Factory, null);
    Factory.prototype.getProcessor = function (content) {
        ns.assert(false, "implement me!");
        return null;
    };
    Factory.prototype.getContentProcessor = function (type) {
        ns.assert(false, "implement me!");
        return null;
    };
    Factory.prototype.getCommandProcessor = function (type, command) {
        ns.assert(false, "implement me!");
        return null;
    };
    ContentProcessor.Creator = Creator;
    ContentProcessor.Factory = Factory;
    ns.cpu.ContentProcessor = ContentProcessor;
    ns.cpu.registers("ContentProcessor");
})(DIMSDK);
(function (ns) {
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var BaseContentProcessor = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    ns.Class(BaseContentProcessor, TwinsHelper, [ContentProcessor], null);
    BaseContentProcessor.prototype.process = function (content, rMsg) {
        var text = "Content (type: " + content.getType() + ") not support yet!";
        return this.respondText(text, content.getGroup());
    };
    BaseContentProcessor.prototype.respondText = function (text, group) {
        var res = new ns.dkd.BaseTextContent(text);
        if (group) {
            res.setGroup(group);
        }
        return [res];
    };
    BaseContentProcessor.prototype.respondReceipt = function (text) {
        var res = new ns.dkd.BaseReceiptCommand(text);
        return [res];
    };
    BaseContentProcessor.prototype.respondContent = function (res) {
        if (res) {
            return [res];
        } else {
            return [];
        }
    };
    ns.cpu.BaseContentProcessor = BaseContentProcessor;
    ns.cpu.registers("BaseContentProcessor");
})(DIMSDK);
(function (ns) {
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var BaseCommandProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    ns.Class(BaseCommandProcessor, BaseContentProcessor, null, {
        process: function (cmd, rMsg) {
            var text = "Command (name: " + cmd.getCommand() + ") not support yet!";
            return this.respondText(text, cmd.getGroup());
        }
    });
    ns.cpu.BaseCommandProcessor = BaseCommandProcessor;
    ns.cpu.registers("BaseCommandProcessor");
})(DIMSDK);
(function (ns) {
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var ContentProcessorCreator = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    ns.Class(ContentProcessorCreator, TwinsHelper, [ContentProcessor.Creator], {
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (ContentType.FORWARD.equals(type)) {
                return new ns.cpu.ForwardContentProcessor(facebook, messenger);
            }
            if (ContentType.COMMAND.equals(type)) {
                return new ns.cpu.BaseCommandProcessor(facebook, messenger);
            } else {
                if (ContentType.HISTORY.equals(type)) {
                    return new ns.cpu.HistoryCommandProcessor(facebook, messenger);
                }
            }
            return null;
        },
        createCommandProcessor: function (type, command) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (command === Command.META) {
                return new ns.cpu.MetaCommandProcessor(facebook, messenger);
            } else {
                if (command === Command.DOCUMENT) {
                    return new ns.cpu.DocumentCommandProcessor(facebook, messenger);
                }
            }
            if (command === "group") {
                return new ns.cpu.GroupCommandProcessor(facebook, messenger);
            } else {
                if (command === GroupCommand.INVITE) {
                    return new ns.cpu.InviteCommandProcessor(facebook, messenger);
                } else {
                    if (command === GroupCommand.EXPEL) {
                        return new ns.cpu.ExpelCommandProcessor(facebook, messenger);
                    } else {
                        if (command === GroupCommand.QUIT) {
                            return new ns.cpu.QuitCommandProcessor(facebook, messenger);
                        } else {
                            if (command === GroupCommand.QUERY) {
                                return new ns.cpu.QueryCommandProcessor(facebook, messenger);
                            } else {
                                if (command === GroupCommand.RESET) {
                                    return new ns.cpu.ResetCommandProcessor(facebook, messenger);
                                }
                            }
                        }
                    }
                }
            }
            return null;
        }
    });
    ns.cpu.ContentProcessorCreator = ContentProcessorCreator;
    ns.cpu.registers("ContentProcessorCreator");
})(DIMSDK);
(function (ns) {
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var ContentProcessorFactory = function (facebook, messenger, creator) {
        TwinsHelper.call(this, facebook, messenger);
        this.__creator = creator;
        this.__content_processors = {};
        this.__command_processors = {};
    };
    ns.Class(
        ContentProcessorFactory,
        TwinsHelper,
        [ContentProcessor.Factory],
        null
    );
    ContentProcessorFactory.prototype.getProcessor = function (content) {
        var cpu;
        var type = content.getType();
        if (ns.Interface.conforms(content, Command)) {
            var name = content.getCommand();
            cpu = this.getCommandProcessor(type, name);
            if (cpu) {
                return cpu;
            } else {
                if (ns.Interface.conforms(content, GroupCommand)) {
                    cpu = this.getCommandProcessor(type, "group");
                    if (cpu) {
                        return cpu;
                    }
                }
            }
        }
        cpu = this.getContentProcessor(type);
        return cpu;
    };
    ContentProcessorFactory.prototype.getContentProcessor = function (type) {
        var cpu = this.__content_processors[type];
        if (!cpu) {
            cpu = this.__creator.createContentProcessor(type);
            if (cpu) {
                this.__content_processors[type] = cpu;
            }
        }
        return cpu;
    };
    ContentProcessorFactory.prototype.getCommandProcessor = function (
        type,
        command
    ) {
        var cpu = this.__command_processors[command];
        if (!cpu) {
            cpu = this.__creator.createCommandProcessor(type, command);
            if (cpu) {
                this.__command_processors[command] = cpu;
            }
        }
        return cpu;
    };
    ns.cpu.ContentProcessorFactory = ContentProcessorFactory;
    ns.cpu.registers("ContentProcessorFactory");
})(DIMSDK);
(function (ns) {
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var ForwardContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    ns.Class(ForwardContentProcessor, BaseContentProcessor, null, {
        process: function (content, rMsg) {
            var secret = content.getMessage();
            var messenger = this.getMessenger();
            var sMsg = messenger.verifyMessage(secret);
            if (!sMsg) {
                return null;
            }
            var iMsg = messenger.decryptMessage(sMsg);
            if (!iMsg) {
                return null;
            }
            return messenger.processContent(iMsg.getContent(), secret);
        }
    });
    ns.cpu.ForwardContentProcessor = ForwardContentProcessor;
    ns.cpu.registers("ForwardContentProcessor");
})(DIMSDK);
(function (ns) {
    var MetaCommand = ns.protocol.MetaCommand;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var MetaCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(MetaCommandProcessor, BaseCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var identifier = cmd.getIdentifier();
            if (identifier) {
                var meta = cmd.getMeta();
                if (meta) {
                    return put_meta.call(this, identifier, meta);
                } else {
                    return get_meta.call(this, identifier);
                }
            }
            var text = "Meta command error.";
            return this.respondText(text, null);
        }
    });
    var get_meta = function (identifier) {
        var facebook = this.getFacebook();
        var meta = facebook.getMeta(identifier);
        if (meta) {
            var res = MetaCommand.response(identifier, meta);
            return this.respondContent(res);
        } else {
            var text = "Sorry, meta not found for ID: " + identifier;
            return this.respondText(text, null);
        }
    };
    var put_meta = function (identifier, meta) {
        var text;
        var facebook = this.getFacebook();
        if (facebook.saveMeta(meta, identifier)) {
            text = "Meta received: " + identifier;
            return this.respondReceipt(text);
        } else {
            text = "Meta not accept: " + identifier;
            return this.respondText(text, null);
        }
    };
    ns.cpu.MetaCommandProcessor = MetaCommandProcessor;
    ns.cpu.registers("MetaCommandProcessor");
})(DIMSDK);
(function (ns) {
    var DocumentCommand = ns.protocol.DocumentCommand;
    var MetaCommandProcessor = ns.cpu.MetaCommandProcessor;
    var DocumentCommandProcessor = function (facebook, messenger) {
        MetaCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(DocumentCommandProcessor, MetaCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var identifier = cmd.getIdentifier();
            if (identifier) {
                var doc = cmd.getDocument();
                if (!doc) {
                    var type = cmd.getValue("doc_type");
                    if (!type) {
                        type = "*";
                    }
                    return get_doc.call(this, identifier, type);
                }
                if (identifier.equals(doc.getIdentifier())) {
                    var meta = cmd.getMeta();
                    return put_doc.call(this, identifier, meta, doc);
                }
            }
            var text = "Document command error.";
            return this.respondText(text, null);
        }
    });
    var get_doc = function (identifier, type) {
        var facebook = this.getFacebook();
        var doc = facebook.getDocument(identifier, type);
        if (doc) {
            var meta = facebook.getMeta(identifier);
            var res = DocumentCommand.response(identifier, meta, doc);
            return this.respondContent(res);
        } else {
            var text = "Sorry, document not found for ID: " + identifier;
            return this.respondText(text, null);
        }
    };
    var put_doc = function (identifier, meta, doc) {
        var text;
        var facebook = this.getFacebook();
        if (meta) {
            if (!facebook.saveMeta(meta, identifier)) {
                text = "Meta not accept: " + identifier;
                return this.respondText(text, null);
            }
        }
        if (facebook.saveDocument(doc)) {
            text = "Document received: " + identifier;
            return this.respondReceipt(text);
        } else {
            text = "Document not accept: " + identifier;
            return this.respondText(text, null);
        }
    };
    ns.cpu.DocumentCommandProcessor = DocumentCommandProcessor;
    ns.cpu.registers("DocumentCommandProcessor");
})(DIMSDK);
(function (ns) {
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var HistoryCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(HistoryCommandProcessor, BaseCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var text =
                "History command (name: " + cmd.getCommand() + ") not support yet!";
            return this.respondText(text, cmd.getGroup());
        }
    });
    ns.cpu.HistoryCommandProcessor = HistoryCommandProcessor;
    ns.cpu.registers("HistoryCommandProcessor");
})(DIMSDK);
(function (ns) {
    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor;
    var GroupCommandProcessor = function (facebook, messenger) {
        HistoryCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(GroupCommandProcessor, HistoryCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var text =
                "Group command (name: " + cmd.getCommand() + ") not support yet!";
            return this.respondText(text, cmd.getGroup());
        }
    });
    GroupCommandProcessor.prototype.getMembers = function (cmd) {
        var members = cmd.getMembers();
        if (members) {
            return members;
        }
        var member = cmd.getMember();
        if (member) {
            return [member];
        } else {
            return [];
        }
    };
    ns.cpu.GroupCommandProcessor = GroupCommandProcessor;
    ns.cpu.registers("GroupCommandProcessor");
})(DIMSDK);
(function (ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var GROUP_EMPTY = "Group empty.";
    var QUERY_NOT_ALLOWED = "Sorry, you are not allowed to query this group.";
    var QueryCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(QueryCommandProcessor, GroupCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.respondText(GROUP_EMPTY, group);
            }
            var sender = rMsg.getSender();
            if (members.indexOf(sender) < 0) {
                var assistants = facebook.getAssistants(group);
                if (!assistants || assistants.indexOf(sender) < 0) {
                    return this.respondText(QUERY_NOT_ALLOWED, group);
                }
            }
            var res;
            var user = facebook.getCurrentUser();
            if (user.getIdentifier().equals(owner)) {
                res = GroupCommand.reset(group, members);
            } else {
                res = GroupCommand.invite(group, members);
            }
            return this.respondContent(res);
        }
    });
    ns.cpu.group.QueryCommandProcessor = QueryCommandProcessor;
    ns.cpu.group.registers("QueryCommandProcessor");
})(DIMSDK);
(function (ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var RESET_CMD_ERROR = "Reset command error.";
    var RESET_NOT_ALLOWED = "Sorry, you are not allowed to reset this group.";
    var ResetCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(ResetCommandProcessor, GroupCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.temporarySave(cmd, rMsg.getSender());
            }
            var sender = rMsg.getSender();
            if (!owner.equals(sender)) {
                var assistants = facebook.getAssistants(group);
                if (!assistants || assistants.indexOf(sender) < 0) {
                    return this.respondText(RESET_NOT_ALLOWED, group);
                }
            }
            var newMembers = this.getMembers(cmd);
            if (newMembers.length === 0) {
                return this.respondText(RESET_CMD_ERROR, group);
            }
            if (newMembers.indexOf(owner) < 0) {
                return this.respondText(RESET_CMD_ERROR, group);
            }
            var removes = [];
            var item, i;
            for (i = 0; i < members.length; ++i) {
                item = members[i];
                if (newMembers.indexOf(item) < 0) {
                    removes.push(item.toString());
                }
            }
            var adds = [];
            for (i = 0; i < newMembers.length; ++i) {
                item = newMembers[i];
                if (members.indexOf(item) < 0) {
                    adds.push(item.toString());
                }
            }
            if (adds.length > 0 || removes.length > 0) {
                if (facebook.saveMembers(newMembers, group)) {
                    if (adds.length > 0) {
                        cmd.setValue("added", adds);
                    }
                    if (removes.length > 0) {
                        cmd.setValue("removed", removes);
                    }
                }
            }
            return null;
        },
        temporarySave: function (cmd, sender) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var newMembers = this.getMembers(cmd);
            if (newMembers.length === 0) {
                return this.respondText(RESET_CMD_ERROR, group);
            }
            var item;
            for (var i = 0; i < newMembers.length; ++i) {
                item = newMembers[i];
                if (!facebook.getMeta(item)) {
                    continue;
                } else {
                    if (!facebook.isOwner(item, group)) {
                        continue;
                    }
                }
                if (facebook.saveMembers(newMembers, group)) {
                    if (!item.equals(sender)) {
                        this.queryOwner(item, group);
                    }
                }
                return null;
            }
            var res = GroupCommand.query(group);
            return this.respondContent(res);
        },
        queryOwner: function (owner, group) {}
    });
    ns.cpu.group.ResetCommandProcessor = ResetCommandProcessor;
    ns.cpu.group.registers("ResetCommandProcessor");
})(DIMSDK);
(function (ns) {
    var ResetCommandProcessor = ns.cpu.ResetCommandProcessor;
    var INVITE_CMD_ERROR = "Invite command error.";
    var INVITE_NOT_ALLOWED =
        "Sorry, yo are not allowed to invite new members into this group.";
    var InviteCommandProcessor = function (facebook, messenger) {
        ResetCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(InviteCommandProcessor, ResetCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.temporarySave(cmd, rMsg.getSender());
            }
            var sender = rMsg.getSender();
            if (members.indexOf(sender) < 0) {
                var assistants = facebook.getAssistants(group);
                if (!assistants || assistants.indexOf(sender) < 0) {
                    return this.respondText(INVITE_NOT_ALLOWED, group);
                }
            }
            var invites = this.getMembers(cmd);
            if (invites.length === 0) {
                return this.respondText(INVITE_CMD_ERROR, group);
            }
            if (sender.equals(owner) && invites.indexOf(owner) >= 0) {
                return this.temporarySave(cmd, rMsg.getSender());
            }
            var adds = [];
            var item, pos;
            for (var i = 0; i < invites.length; ++i) {
                item = invites[i];
                pos = members.indexOf(item);
                if (pos >= 0) {
                    continue;
                }
                adds.push(item.toString());
                members.push(item);
            }
            if (adds.length > 0) {
                if (facebook.saveMembers(members, group)) {
                    cmd.setValue("added", adds);
                }
            }
            return null;
        }
    });
    ns.cpu.group.InviteCommandProcessor = InviteCommandProcessor;
    ns.cpu.group.registers("InviteCommandProcessor");
})(DIMSDK);
(function (ns) {
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var GROUP_EMPTY = "Group empty.";
    var EXPEL_CMD_ERROR = "Expel command error.";
    var EXPEL_NOT_ALLOWED =
        "Sorry, you are not allowed to expel member from this group.";
    var CANNOT_EXPEL_OWNER = "Group owner cannot be expelled.";
    var ExpelCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(ExpelCommandProcessor, GroupCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.respondText(GROUP_EMPTY, group);
            }
            var sender = rMsg.getSender();
            if (!owner.equals(sender)) {
                var assistants = facebook.getAssistants(group);
                if (!assistants || assistants.indexOf(sender) < 0) {
                    return this.respondText(EXPEL_NOT_ALLOWED, group);
                }
            }
            var expels = this.getMembers(cmd);
            if (expels.length === 0) {
                return this.respondText(EXPEL_CMD_ERROR, group);
            }
            if (expels.indexOf(owner) >= 0) {
                return this.respondText(CANNOT_EXPEL_OWNER, group);
            }
            var removes = [];
            var item, pos;
            for (var i = 0; i < expels.length; ++i) {
                item = expels[i];
                pos = members.indexOf(item);
                if (pos < 0) {
                    continue;
                }
                removes.push(item.toString());
                members.splice(pos, 1);
            }
            if (removes.length > 0) {
                if (facebook.saveMembers(members, group)) {
                    cmd.setValue("removed", removes);
                }
            }
            return null;
        }
    });
    ns.cpu.group.ExpelCommandProcessor = ExpelCommandProcessor;
    ns.cpu.group.registers("ExpelCommandProcessor");
})(DIMSDK);
(function (ns) {
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var GROUP_EMPTY = "Group empty.";
    var OWNER_CANNOT_QUIT = "Sorry, owner cannot quit group.";
    var ASSISTANT_CANNOT_QUIT = "Sorry, assistant cannot quit group.";
    var QuitCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(QuitCommandProcessor, GroupCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.respondText(GROUP_EMPTY, group);
            }
            var sender = rMsg.getSender();
            if (owner.equals(sender)) {
                return this.respondText(OWNER_CANNOT_QUIT, group);
            }
            var assistants = facebook.getAssistants(group);
            if (assistants && assistants.indexOf(sender) >= 0) {
                return this.removeAssistant(cmd, rMsg);
            }
            var pos = members.indexOf(sender);
            if (pos > 0) {
                members.splice(pos, 1);
                facebook.saveMembers(members, group);
            }
            return null;
        },
        removeAssistant: function (cmd, rMsg) {
            return this.respondText(ASSISTANT_CANNOT_QUIT, cmd.getGroup());
        }
    });
    ns.cpu.group.QuitCommandProcessor = QuitCommandProcessor;
    ns.cpu.group.registers("QuitCommandProcessor");
})(DIMSDK);
(function (ns) {
    var CustomizedContentHandler = function () {};
    ns.Interface(CustomizedContentHandler, null);
    CustomizedContentHandler.prototype.handle = function (
        mod,
        sender,
        content,
        rMsg
    ) {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.cpu.CustomizedContentHandler = CustomizedContentHandler;
    ns.cpu.registers("CustomizedContentHandler");
})(DIMSDK);
(function (ns) {
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var CustomizedContentHandler = ns.cpu.CustomizedContentHandler;
    var CustomizedContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    ns.Class(
        CustomizedContentProcessor,
        BaseContentProcessor,
        [CustomizedContentHandler],
        {
            process: function (content, rMsg) {
                var app = content.getApplication();
                var res = this.filterApplication(app, content, rMsg);
                if (res) {
                    return res;
                }
                var mod = content.getModule();
                var handler = this.fetchHandler(mod, content, rMsg);
                if (!handler) {
                    return null;
                }
                var sender = rMsg.getSender();
                return handler.handle(mod, sender, content, rMsg);
            },
            filterApplication: function (app, content, rMsg) {
                var text = "Customized Content (app: " + app + ") not support yet!";
                return this.respondText(text, content.getGroup());
            },
            fetchHandler: function (mod, content, rMsg) {
                return this;
            },
            handle: function (mod, sender, content, rMsg) {
                var app = content.getApplication();
                var text =
                    "Customized Content (app: " +
                    app +
                    ", mod: " +
                    mod +
                    ") not support yet!";
                return this.respondText(text, content.getGroup());
            }
        }
    );
    ns.cpu.CustomizedContentProcessor = CustomizedContentProcessor;
    ns.cpu.registers("CustomizedContentProcessor");
})(DIMSDK);
if (typeof FiniteStateMachine !== "object") {
    FiniteStateMachine = new MONKEY.Namespace();
}
if (typeof FiniteStateMachine.assert !== "function") {
    FiniteStateMachine.assert = console.assert;
}
(function (ns) {
    ns.fsm = FiniteStateMachine;
    if (typeof ns.skywalker !== "object") {
        ns.skywalker = new ns.Namespace();
    }
    if (typeof ns.threading !== "object") {
        ns.threading = new ns.Namespace();
    }
    ns.registers("skywalker");
    ns.registers("threading");
})(MONKEY);
(function (ns) {
    var Runnable = function () {};
    ns.Interface(Runnable, null);
    Runnable.prototype.run = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    ns.threading.Runnable = Runnable;
    ns.threading.registers("Runnable");
})(MONKEY);
(function (ns) {
    var Runnable = ns.threading.Runnable;
    var Thread = function () {
        Object.call(this);
        if (arguments.length === 0) {
            this.__target = null;
            this.__interval = 128;
        } else {
            if (arguments.length === 2) {
                this.__target = arguments[0];
                this.__interval = arguments[1];
            } else {
                if (typeof arguments[0] === "number") {
                    this.__target = null;
                    this.__interval = arguments[0];
                } else {
                    this.__target = arguments[0];
                    this.__interval = 128;
                }
            }
        }
        this.__running = false;
        this.__thread_id = 0;
    };
    ns.Class(Thread, Object, [Runnable], null);
    Thread.prototype.start = function () {
        this.__running = true;
        var thread = this;
        this.__thread_id = setInterval(function () {
            var ran = thread.isRunning() && thread.run();
            if (!ran) {
                stop(thread);
            }
        }, this.getInterval());
    };
    var stop = function (thread) {
        var tid = thread.__thread_id;
        if (tid > 0) {
            thread.__thread_id = 0;
            clearInterval(tid);
        }
    };
    Thread.prototype.stop = function () {
        this.__running = false;
        stop(this);
    };
    Thread.prototype.isRunning = function () {
        return this.__running;
    };
    Thread.prototype.getInterval = function () {
        return this.__interval;
    };
    Thread.prototype.run = function () {
        var target = this.__target;
        if (!target || target === this) {
            throw new SyntaxError("Thread::run() > override me!");
        } else {
            return target.run();
        }
    };
    ns.threading.Thread = Thread;
    ns.threading.registers("Thread");
})(MONKEY);
(function (ns) {
    var Ticker = function () {};
    ns.Interface(Ticker, null);
    Ticker.prototype.tick = function (now, delta) {
        ns.assert(false, "implement me!");
    };
    ns.threading.Ticker = Ticker;
    ns.threading.registers("Ticker");
})(MONKEY);
(function (ns) {
    var Runnable = ns.threading.Runnable;
    var Thread = ns.threading.Thread;
    var Metronome = function () {
        Object.call(this);
        this.__tickers = [];
        this.__last_time = 0;
        this.__thread = null;
    };
    ns.Class(Metronome, Object, [Runnable], null);
    Metronome.MIN_DELTA = 100;
    Metronome.prototype.start = function () {
        this.__last_time = new Date().getTime();
        var thread = new Thread(this);
        this.__thread = thread;
        thread.start();
    };
    Metronome.prototype.stop = function () {
        var thread = this.__thread;
        if (thread) {
            this.__thread = null;
            thread.stop();
        }
    };
    Metronome.prototype.run = function () {
        var now = new Date().getTime();
        var delta = now - this.__last_time;
        if (delta > Metronome.MIN_DELTA) {
            try {
                var tickers = new Array(this.__tickers);
                drive(tickers, now, delta);
            } catch (e) {
                ns.error("Metronome::run()", e);
            }
            this.__last_time = now;
        }
        return true;
    };
    var drive = function (tickers, now, delta) {
        for (var index = 0; index < tickers.length; ++index) {
            try {
                tickers[index].tick(now, delta);
            } catch (e) {
                ns.error("Ticker::tick()", e);
            }
        }
    };
    Metronome.prototype.addTicker = function (ticker) {
        if (this.__tickers.indexOf(ticker) < 0) {
            this.__tickers.push(ticker);
        } else {
            throw new Error("ticker exists: " + ticker);
        }
    };
    Metronome.prototype.removeTicker = function (ticker) {
        var index = this.__tickers.indexOf(ticker);
        if (index >= 0) {
            this.__tickers.splice(index, 1);
        }
    };
    Metronome.getInstance = function () {
        if (!sharedMetronome) {
            sharedMetronome = new Metronome();
            sharedMetronome.start();
        }
        return sharedMetronome;
    };
    var sharedMetronome = null;
    ns.threading.Metronome = Metronome;
    ns.threading.registers("Metronome");
})(MONKEY);
(function (ns) {
    var Handler = function () {};
    ns.Interface(Handler, null);
    Handler.prototype.setup = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Handler.prototype.handle = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Handler.prototype.finish = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    ns.skywalker.Handler = Handler;
    ns.skywalker.registers("Handler");
})(MONKEY);
(function (ns) {
    var Processor = function () {};
    ns.Interface(Processor, null);
    Processor.prototype.process = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    ns.skywalker.Processor = Processor;
    ns.skywalker.registers("Processor");
})(MONKEY);
(function (ns) {
    var Thread = ns.threading.Thread;
    var Handler = ns.skywalker.Handler;
    var Processor = ns.skywalker.Processor;
    var STAGE_INIT = 0;
    var STAGE_HANDLING = 1;
    var STAGE_CLEANING = 2;
    var STAGE_STOPPED = 3;
    var Runner = function () {
        if (arguments.length === 0) {
            Thread.call(this);
            this.__processor = null;
        } else {
            if (arguments.length === 2) {
                Thread.call(this, arguments[1]);
                this.__processor = arguments[0];
            } else {
                if (typeof arguments[0] === "number") {
                    Thread.call(this, arguments[0]);
                    this.__processor = null;
                } else {
                    Thread.call(this);
                    this.__processor = arguments[0];
                }
            }
        }
        this.__stage = STAGE_INIT;
    };
    ns.Class(Runner, Thread, [Handler, Processor], {
        run: function () {
            if (this.__stage === STAGE_INIT) {
                if (this.setup()) {
                    return true;
                }
                this.__stage = STAGE_HANDLING;
            }
            if (this.__stage === STAGE_HANDLING) {
                try {
                    if (this.handle()) {
                        return true;
                    }
                } catch (e) {
                    ns.error("Runner::handle() error", this, e);
                }
                this.__stage = STAGE_CLEANING;
            }
            if (this.__stage === STAGE_CLEANING) {
                if (this.finish()) {
                    return true;
                }
                this.__stage = STAGE_STOPPED;
            }
            return false;
        },
        setup: function () {
            return false;
        },
        handle: function () {
            while (this.isRunning()) {
                if (this.process()) {
                } else {
                    return true;
                }
            }
            return false;
        },
        finish: function () {
            return false;
        },
        process: function () {
            var processor = this.__processor;
            if (!processor || processor === this) {
                throw new SyntaxError("Runner::process() > override me!");
            } else {
                return processor.process();
            }
        }
    });
    ns.skywalker.Runner = Runner;
    ns.skywalker.registers("Runner");
})(MONKEY);
(function (ns, sys) {
    var Context = function () {};
    sys.Interface(Context, null);
    var Status = sys.type.Enum(null, { Stopped: 0, Running: 1, Paused: 2 });
    ns.Context = Context;
    ns.Status = Status;
    ns.registers("Context");
    ns.registers("Status");
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Transition = function () {};
    sys.Interface(Transition, null);
    Transition.prototype.evaluate = function (machine) {
        ns.assert(false, "implement me!");
        return false;
    };
    var BaseTransition = function (targetStateName) {
        Object.call(this);
        this.__target = targetStateName;
    };
    sys.Class(BaseTransition, Object, [Transition], null);
    BaseTransition.prototype.getTarget = function () {
        return this.__target;
    };
    ns.Transition = Transition;
    ns.BaseTransition = BaseTransition;
    ns.registers("Transition");
    ns.registers("BaseTransition");
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var BaseObject = sys.type.BaseObject;
    var State = function () {};
    sys.Interface(State, [sys.type.Object]);
    State.prototype.onEnter = function (machine) {
        ns.assert(false, "implement me!");
    };
    State.prototype.onExit = function (machine) {
        ns.assert(false, "implement me!");
    };
    State.prototype.onPause = function (machine) {
        ns.assert(false, "implement me!");
    };
    State.prototype.onResume = function (machine) {
        ns.assert(false, "implement me!");
    };
    State.prototype.evaluate = function (machine) {
        ns.assert(false, "implement me!");
        return null;
    };
    var BaseState = function () {
        BaseObject.call(this);
        this.__transitions = [];
    };
    sys.Class(BaseState, BaseObject, [State], null);
    BaseState.prototype.addTransition = function (transition) {
        if (this.__transitions.indexOf(transition) < 0) {
            this.__transitions.push(transition);
        } else {
            throw new Error("transition exists: " + transition);
        }
    };
    BaseState.prototype.evaluate = function (machine) {
        var transition;
        for (var index = 0; index < this.__transitions.length; ++index) {
            transition = this.__transitions[index];
            if (transition.evaluate(machine)) {
                return transition;
            }
        }
    };
    ns.State = State;
    ns.BaseState = BaseState;
    ns.registers("State");
    ns.registers("BaseState");
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Ticker = sys.threading.Ticker;
    var Machine = function () {};
    sys.Interface(Machine, [Ticker]);
    Machine.prototype.getDefaultState = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Machine.prototype.getTargetState = function (transition) {
        ns.assert(false, "implement me!");
        return null;
    };
    Machine.prototype.getCurrentState = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Machine.prototype.setCurrentState = function (state) {
        ns.assert(false, "implement me!");
    };
    Machine.prototype.changeState = function (state) {
        ns.assert(false, "implement me!");
    };
    Machine.prototype.start = function () {
        ns.assert(false, "implement me!");
    };
    Machine.prototype.stop = function () {
        ns.assert(false, "implement me!");
    };
    Machine.prototype.pause = function () {
        ns.assert(false, "implement me!");
    };
    Machine.prototype.resume = function () {
        ns.assert(false, "implement me!");
    };
    ns.Machine = Machine;
    ns.registers("Machine");
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Delegate = function () {};
    sys.Interface(Delegate, null);
    Delegate.prototype.enterState = function (next, machine) {
        ns.assert(false, "implement me!");
    };
    Delegate.prototype.exitState = function (previous, machine) {
        ns.assert(false, "implement me!");
    };
    Delegate.prototype.pauseState = function (current, machine) {
        ns.assert(false, "implement me!");
    };
    Delegate.prototype.resumeState = function (current, machine) {
        ns.assert(false, "implement me!");
    };
    ns.Delegate = Delegate;
    ns.registers("Delegate");
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Status = ns.Status;
    var Machine = ns.Machine;
    var BaseMachine = function (defaultStateName) {
        Object.call(this);
        this.__default = defaultStateName ? defaultStateName : "default";
        this.__current = null;
        this.__status = Status.Stopped;
        this.__delegate = null;
        this.__stateMap = {};
    };
    sys.Class(BaseMachine, Object, [Machine], null);
    BaseMachine.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate;
    };
    BaseMachine.prototype.getDelegate = function () {
        return this.__delegate;
    };
    BaseMachine.prototype.getContext = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    BaseMachine.prototype.setState = function (name, state) {
        this.__stateMap[name] = state;
    };
    BaseMachine.prototype.getState = function (name) {
        return this.__stateMap[name];
    };
    BaseMachine.prototype.getDefaultState = function () {
        return this.__stateMap[this.__default];
    };
    BaseMachine.prototype.getTargetState = function (transition) {
        return this.__stateMap[transition.getTarget()];
    };
    BaseMachine.prototype.getCurrentState = function () {
        return this.__current;
    };
    BaseMachine.prototype.setCurrentState = function (state) {
        return (this.__current = state);
    };
    BaseMachine.prototype.changeState = function (newState) {
        var oldState = this.getCurrentState();
        if (!oldState) {
            if (!newState) {
                return false;
            }
        } else {
            if (oldState.equals(newState)) {
                return false;
            }
        }
        var machine = this.getContext();
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.enterState(newState, machine);
        }
        if (newState) {
            newState.onEnter(machine);
        }
        this.setCurrentState(newState);
        if (delegate) {
            delegate.exitState(oldState, machine);
        }
        if (oldState) {
            oldState.onExit(machine);
        }
        return true;
    };
    BaseMachine.prototype.start = function () {
        this.changeState(this.getDefaultState());
        this.__status = Status.Running;
    };
    BaseMachine.prototype.stop = function () {
        this.__status = Status.Stopped;
        this.changeState(null);
    };
    BaseMachine.prototype.pause = function () {
        var machine = this.getContext();
        var current = this.getCurrentState();
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.pauseState(current, machine);
        }
        current.onPause(machine);
        this.__status = Status.Paused;
    };
    BaseMachine.prototype.resume = function () {
        var machine = this.getContext();
        var current = this.getCurrentState();
        this.__status = Status.Running;
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.resumeState(current, machine);
        }
        current.onResume(machine);
    };
    BaseMachine.prototype.tick = function (now, delta) {
        var machine = this.getContext();
        var current = this.getCurrentState();
        if (current && Status.Running.equals(this.__status)) {
            var transition = current.evaluate(machine);
            if (transition) {
                var next = this.getTargetState(transition);
                this.changeState(next);
            }
        }
    };
    ns.BaseMachine = BaseMachine;
    ns.registers("BaseMachine");
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Metronome = sys.threading.Metronome;
    var BaseMachine = ns.BaseMachine;
    var AutoMachine = function (defaultStateName) {
        BaseMachine.call(this, defaultStateName);
    };
    sys.Class(AutoMachine, BaseMachine, null, {
        start: function () {
            BaseMachine.prototype.start.call(this);
            var timer = Metronome.getInstance();
            timer.addTicker(this);
        },
        stop: function () {
            var timer = Metronome.getInstance();
            timer.removeTicker(this);
            BaseMachine.prototype.stop.call(this);
        }
    });
    ns.AutoMachine = AutoMachine;
    ns.registers("AutoMachine");
})(FiniteStateMachine, MONKEY);
if (typeof StarTrek !== "object") {
    StarTrek = new MONKEY.Namespace();
}
(function (ns, sys) {
    if (typeof ns.assert !== "function") {
        ns.assert = console.assert;
    }
    if (typeof ns.type !== "object") {
        ns.type = new sys.Namespace();
    }
    if (typeof ns.net !== "object") {
        ns.net = new sys.Namespace();
    }
    if (typeof ns.port !== "object") {
        ns.port = new sys.Namespace();
    }
    if (typeof ns.socket !== "object") {
        ns.socket = new sys.Namespace();
    }
    ns.registers("type");
    ns.registers("net");
    ns.registers("port");
    ns.registers("socket");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Stringer = sys.type.Stringer;
    var ConstantString = sys.type.ConstantString;
    var SocketAddress = function () {};
    sys.Interface(SocketAddress, [Stringer]);
    SocketAddress.prototype.getHost = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    SocketAddress.prototype.getPort = function () {
        ns.assert(false, "implement me!");
        return 0;
    };
    var InetSocketAddress = function (host, port) {
        ConstantString.call(this, "(" + host + ":" + port + ")");
        this.__host = host;
        this.__port = port;
    };
    sys.Class(InetSocketAddress, ConstantString, [SocketAddress], null);
    InetSocketAddress.prototype.getHost = function () {
        return this.__host;
    };
    InetSocketAddress.prototype.getPort = function () {
        return this.__port;
    };
    ns.type.SocketAddress = SocketAddress;
    ns.type.InetSocketAddress = InetSocketAddress;
    ns.type.registers("SocketAddress");
    ns.type.registers("InetSocketAddress");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var KeyPairMap = function () {};
    sys.Interface(KeyPairMap, null);
    KeyPairMap.prototype.allValues = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    KeyPairMap.prototype.get = function (remote, local) {
        ns.assert(false, "implement me!");
        return null;
    };
    KeyPairMap.prototype.set = function (remote, local, value) {
        ns.assert(false, "implement me!");
        return null;
    };
    KeyPairMap.prototype.remove = function (remote, local, value) {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.type.KeyPairMap = KeyPairMap;
    ns.type.registers("KeyPairMap");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Dictionary = sys.type.Dictionary;
    var KeyPairMap = ns.type.KeyPairMap;
    var HashKeyPairMap = function (any) {
        Object.call(this);
        this.__default = any;
        this.__map = new Dictionary();
        this.__values = [];
    };
    sys.Class(HashKeyPairMap, Object, [KeyPairMap], null);
    HashKeyPairMap.prototype.allValues = function () {
        return this.__values;
    };
    HashKeyPairMap.prototype.get = function (remote, local) {
        var key1, key2;
        if (remote) {
            key1 = remote;
            key2 = local;
        } else {
            key1 = local;
            key2 = null;
        }
        var table = this.__map.getValue(key1);
        if (!table) {
            return null;
        }
        var value;
        if (key2) {
            value = table.getValue(key2);
            if (value) {
                return value;
            }
            return table.getValue(this.__default);
        }
        value = table.getValue(this.__default);
        if (value) {
            return value;
        }
        var allKeys = table.allKeys();
        for (var i = 0; i < allKeys.length; ++i) {
            value = table.getValue(allKeys[i]);
            if (value) {
                return value;
            }
        }
        return null;
    };
    HashKeyPairMap.prototype.set = function (remote, local, value) {
        if (value) {
            remove_item(this.__values, value);
            this.__values.push(value);
        }
        var keys = get_keys(remote, local, this.__default);
        var table = this.__map.getValue(keys.key1);
        if (table) {
            table.setValue(keys.key2, value);
        } else {
            if (value) {
                table = new Dictionary();
                table.setValue(keys.key2, value);
                this.__map.setValue(keys.key1, table);
            }
        }
    };
    HashKeyPairMap.prototype.remove = function (remote, local, value) {
        var keys = get_keys(remote, local, this.__default);
        var table = this.__map.getValue(keys.key1);
        var old = null;
        if (table) {
            old = table.removeValue(keys.key2);
            if (old) {
                remove_item(this.__values, old);
            }
        }
        if (value && value !== old) {
            remove_item(this.__values, value);
        }
        return old ? old : value;
    };
    var get_keys = function (remoteAddress, localAddress, defaultAddress) {
        if (!remoteAddress) {
            return { key1: localAddress, key2: defaultAddress };
        } else {
            if (!localAddress) {
                return { key1: remoteAddress, key2: defaultAddress };
            } else {
                return { key1: remoteAddress, key2: localAddress };
            }
        }
    };
    var remove_item = function (array, item) {
        var remote = item.getRemoteAddress();
        var local = item.getLocalAddress();
        var old;
        for (var index = array.length - 1; index >= 0; --index) {
            old = array[index];
            if (old === item) {
                array.splice(index, 1);
                continue;
            }
            if (
                address_equals(old.getRemoteAddress(), remote) &&
                address_equals(old.getLocalAddress(), local)
            ) {
                array.splice(index, 1);
            }
        }
    };
    var address_equals = function (address1, address2) {
        if (address1) {
            return address1.equals(address2);
        } else {
            return !address2;
        }
    };
    ns.type.HashKeyPairMap = HashKeyPairMap;
    ns.type.registers("HashKeyPairMap");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var InetSocketAddress = ns.type.InetSocketAddress;
    var HashKeyPairMap = ns.type.HashKeyPairMap;
    var AnyAddress = new InetSocketAddress("0.0.0.0", 0);
    var AddressPairMap = function () {
        HashKeyPairMap.call(this, AnyAddress);
    };
    sys.Class(AddressPairMap, HashKeyPairMap, null, null);
    AddressPairMap.AnyAddress = AnyAddress;
    ns.type.AddressPairMap = AddressPairMap;
    ns.type.registers("AddressPairMap");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var BaseObject = sys.type.BaseObject;
    var AddressPairObject = function (remote, local) {
        BaseObject.call(this);
        this.remoteAddress = remote;
        this.localAddress = local;
    };
    sys.Class(AddressPairObject, BaseObject, null, null);
    AddressPairObject.prototype.getRemoteAddress = function () {
        return this.remoteAddress;
    };
    AddressPairObject.prototype.getLocalAddress = function () {
        return this.localAddress;
    };
    var address_equals = function (address1, address2) {
        if (address1) {
            return address1.equals(address2);
        } else {
            return !address2;
        }
    };
    AddressPairObject.prototype.equals = function (other) {
        if (!other) {
            return !this.remoteAddress && !this.localAddress;
        } else {
            if (other === this) {
                return true;
            } else {
                if (other instanceof AddressPairObject) {
                    return (
                        address_equals(other.getRemoteAddress(), this.remoteAddress) &&
                        address_equals(other.getLocalAddress(), this.localAddress)
                    );
                } else {
                    return false;
                }
            }
        }
    };
    AddressPairObject.prototype.valueOf = function () {
        var cname = this.constructor.name;
        var remote = this.getRemoteAddress();
        var local = this.getLocalAddress();
        if (remote) {
            remote = remote.toString();
        }
        if (local) {
            local = local.toString();
        }
        return "<" + cname + ": remote=" + remote + ", local=" + local + " />";
    };
    ns.type.AddressPairObject = AddressPairObject;
    ns.type.registers("AddressPairObject");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Channel = function () {};
    sys.Interface(Channel, null);
    Channel.prototype.isOpen = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Channel.prototype.isBound = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Channel.prototype.isAlive = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Channel.prototype.close = function () {
        ns.assert(false, "implement me!");
    };
    Channel.prototype.read = function (maxLen) {
        ns.assert(false, "implement me!");
        return null;
    };
    Channel.prototype.write = function (src) {
        ns.assert(false, "implement me!");
        return 0;
    };
    Channel.prototype.configureBlocking = function (block) {
        ns.assert(false, "implement me!");
        return null;
    };
    Channel.prototype.isBlocking = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Channel.prototype.bind = function (local) {
        ns.assert(false, "implement me!");
        return null;
    };
    Channel.prototype.getLocalAddress = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Channel.prototype.isConnected = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Channel.prototype.connect = function (remote) {
        ns.assert(false, "implement me!");
        return null;
    };
    Channel.prototype.getRemoteAddress = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Channel.prototype.disconnect = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Channel.prototype.receive = function (maxLen) {
        ns.assert(false, "implement me!");
        return null;
    };
    Channel.prototype.send = function (src, target) {
        ns.assert(false, "implement me!");
        return 0;
    };
    ns.net.Channel = Channel;
    ns.net.registers("Channel");
})(StarTrek, MONKEY);
(function (ns, fsm, sys) {
    var Stringer = sys.type.Stringer;
    var BaseState = fsm.BaseState;
    var ConnectionState = function (name) {
        BaseState.call(this);
        this.__name = name;
        this.__enterTime = 0;
    };
    sys.Class(ConnectionState, BaseState, null, null);
    ConnectionState.DEFAULT = "default";
    ConnectionState.PREPARING = "preparing";
    ConnectionState.READY = "ready";
    ConnectionState.MAINTAINING = "maintaining";
    ConnectionState.EXPIRED = "expired";
    ConnectionState.ERROR = "error";
    ConnectionState.prototype.equals = function (other) {
        if (this === other) {
            return true;
        } else {
            if (other instanceof ConnectionState) {
                return this.__name === other.toString();
            } else {
                if (sys.Interface.conforms(other, Stringer)) {
                    return this.__name === other.toString();
                } else {
                    return this.__name === other;
                }
            }
        }
    };
    ConnectionState.prototype.toString = function () {
        return this.__name;
    };
    ConnectionState.prototype.getEnterTime = function () {
        return this.__enterTime;
    };
    ConnectionState.prototype.onEnter = function (machine) {
        this.__enterTime = new Date().getTime();
    };
    ConnectionState.prototype.onExit = function (machine) {
        this.__enterTime = 0;
    };
    ConnectionState.prototype.onPause = function (machine) {};
    ConnectionState.prototype.onResume = function (machine) {};
    ConnectionState.Delegate = fsm.Delegate;
    ns.net.ConnectionState = ConnectionState;
    ns.net.registers("ConnectionState");
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, fsm, sys) {
    var BaseTransition = fsm.BaseTransition;
    var StateTransition = function (targetStateName, evaluate) {
        BaseTransition.call(this, targetStateName);
        this.__evaluate = evaluate;
    };
    sys.Class(StateTransition, BaseTransition, null, null);
    StateTransition.prototype.evaluate = function (machine) {
        return this.__evaluate.call(this, machine);
    };
    ns.net.StateTransition = StateTransition;
    ns.net.registers("StateTransition");
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, fsm, sys) {
    var Context = fsm.Context;
    var BaseMachine = fsm.BaseMachine;
    var ConnectionState = ns.net.ConnectionState;
    var StateTransition = ns.net.StateTransition;
    var StateMachine = function (connection) {
        BaseMachine.call(this);
        this.__connection = connection;
        var builder = this.getStateBuilder();
        init_states(this, builder);
    };
    sys.Class(StateMachine, BaseMachine, [Context], null);
    StateMachine.prototype.getStateBuilder = function () {
        return new StateBuilder(new TransitionBuilder());
    };
    StateMachine.prototype.getConnection = function () {
        return this.__connection;
    };
    StateMachine.prototype.getContext = function () {
        return this;
    };
    var add_state = function (machine, state) {
        machine.setState(state.toString(), state);
    };
    var init_states = function (machine, builder) {
        add_state(machine, builder.getDefaultState());
        add_state(machine, builder.getPreparingState());
        add_state(machine, builder.getReadyState());
        add_state(machine, builder.getExpiredState());
        add_state(machine, builder.getMaintainingState());
        add_state(machine, builder.getErrorState());
    };
    var StateBuilder = function (transitionBuilder) {
        Object.call(this);
        this.builder = transitionBuilder;
    };
    sys.Class(StateBuilder, Object, null, {
        getDefaultState: function () {
            var state = getNamedState(ConnectionState.DEFAULT);
            state.addTransition(this.builder.getDefaultPreparingTransition());
            return state;
        },
        getPreparingState: function () {
            var state = getNamedState(ConnectionState.PREPARING);
            state.addTransition(this.builder.getPreparingReadyTransition());
            state.addTransition(this.builder.getPreparingDefaultTransition());
            return state;
        },
        getReadyState: function () {
            var state = getNamedState(ConnectionState.READY);
            state.addTransition(this.builder.getReadyExpiredTransition());
            state.addTransition(this.builder.getReadyErrorTransition());
            return state;
        },
        getExpiredState: function () {
            var state = getNamedState(ConnectionState.EXPIRED);
            state.addTransition(this.builder.getExpiredMaintainingTransition());
            state.addTransition(this.builder.getExpiredErrorTransition());
            return state;
        },
        getMaintainingState: function () {
            var state = getNamedState(ConnectionState.MAINTAINING);
            state.addTransition(this.builder.getMaintainingReadyTransition());
            state.addTransition(this.builder.getMaintainingExpiredTransition());
            state.addTransition(this.builder.getMaintainingErrorTransition());
            return state;
        },
        getErrorState: function () {
            var state = getNamedState(ConnectionState.ERROR);
            state.addTransition(this.builder.getErrorDefaultTransition());
            return state;
        }
    });
    var getNamedState = function (name) {
        return new ConnectionState(name);
    };
    var TransitionBuilder = function () {
        Object.call(this);
    };
    sys.Class(TransitionBuilder, Object, null, {
        getDefaultPreparingTransition: function () {
            return new StateTransition(ConnectionState.PREPARING, function (machine) {
                var conn = machine.getConnection();
                return conn && conn.isOpen();
            });
        },
        getPreparingReadyTransition: function () {
            return new StateTransition(ConnectionState.READY, function (machine) {
                var conn = machine.getConnection();
                return conn && conn.isAlive();
            });
        },
        getPreparingDefaultTransition: function () {
            return new StateTransition(ConnectionState.DEFAULT, function (machine) {
                var conn = machine.getConnection();
                return !conn || !conn.isOpen();
            });
        },
        getReadyExpiredTransition: function () {
            return new StateTransition(ConnectionState.EXPIRED, function (machine) {
                var conn = machine.getConnection();
                if (!conn || !conn.isAlive()) {
                    return false;
                }
                return !conn.isReceivedRecently(new Date().getTime());
            });
        },
        getReadyErrorTransition: function () {
            return new StateTransition(ConnectionState.ERROR, function (machine) {
                var conn = machine.getConnection();
                return !conn || !conn.isAlive();
            });
        },
        getExpiredMaintainingTransition: function () {
            return new StateTransition(ConnectionState.MAINTAINING, function (
                machine
            ) {
                var conn = machine.getConnection();
                if (!conn || !conn.isAlive()) {
                    return false;
                }
                return conn.isSentRecently(new Date().getTime());
            });
        },
        getExpiredErrorTransition: function () {
            return new StateTransition(ConnectionState.ERROR, function (machine) {
                var conn = machine.getConnection();
                if (!conn || !conn.isAlive()) {
                    return true;
                }
                return conn.isNotReceivedLongTimeAgo(new Date().getTime());
            });
        },
        getMaintainingReadyTransition: function () {
            return new StateTransition(ConnectionState.READY, function (machine) {
                var conn = machine.getConnection();
                if (!conn || !conn.isAlive()) {
                    return false;
                }
                return conn.isReceivedRecently(new Date().getTime());
            });
        },
        getMaintainingExpiredTransition: function () {
            return new StateTransition(ConnectionState.EXPIRED, function (machine) {
                var conn = machine.getConnection();
                if (!conn || !conn.isAlive()) {
                    return false;
                }
                return !conn.isSentRecently(new Date().getTime());
            });
        },
        getMaintainingErrorTransition: function () {
            return new StateTransition(ConnectionState.ERROR, function (machine) {
                var conn = machine.getConnection();
                if (!conn || !conn.isAlive()) {
                    return true;
                }
                return conn.isNotReceivedLongTimeAgo(new Date().getTime());
            });
        },
        getErrorDefaultTransition: function () {
            return new StateTransition(ConnectionState.DEFAULT, function (machine) {
                var conn = machine.getConnection();
                if (!conn || !conn.isAlive()) {
                    return false;
                }
                var current = machine.getCurrentState();
                var enter = current.getEnterTime();
                return 0 < enter && enter < conn.getLastReceivedTime();
            });
        }
    });
    ns.net.StateMachine = StateMachine;
    ns.net.registers("StateMachine");
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Ticker = sys.threading.Ticker;
    var Connection = function () {};
    sys.Interface(Connection, [Ticker]);
    Connection.prototype.isOpen = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Connection.prototype.isBound = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Connection.prototype.isConnected = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Connection.prototype.isAlive = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Connection.prototype.getLocalAddress = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Connection.prototype.getRemoteAddress = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Connection.prototype.getState = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Connection.prototype.send = function (data) {
        ns.assert(false, "implement me!");
        return 0;
    };
    Connection.prototype.onReceived = function (data) {
        ns.assert(false, "implement me!");
    };
    Connection.prototype.close = function () {
        ns.assert(false, "implement me!");
    };
    ns.net.Connection = Connection;
    ns.net.registers("Connection");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var ConnectionDelegate = function () {};
    sys.Interface(ConnectionDelegate, null);
    ConnectionDelegate.prototype.onConnectionStateChanged = function (
        previous,
        current,
        connection
    ) {
        ns.assert(false, "implement me!");
    };
    ConnectionDelegate.prototype.onConnectionReceived = function (
        data,
        connection
    ) {
        ns.assert(false, "implement me!");
    };
    ConnectionDelegate.prototype.onConnectionSent = function (
        sent,
        data,
        connection
    ) {
        ns.assert(false, "implement me!");
    };
    ConnectionDelegate.prototype.onConnectionFailed = function (
        error,
        data,
        connection
    ) {
        ns.assert(false, "implement me!");
    };
    ConnectionDelegate.prototype.onConnectionError = function (
        error,
        connection
    ) {
        ns.assert(false, "implement me!");
    };
    ns.net.ConnectionDelegate = ConnectionDelegate;
    ns.net.registers("ConnectionDelegate");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var TimedConnection = function () {};
    sys.Interface(TimedConnection, null);
    TimedConnection.prototype.getLastSentTime = function () {
        ns.assert(false, "implement me!");
        return 0;
    };
    TimedConnection.prototype.getLastReceivedTime = function () {
        ns.assert(false, "implement me!");
        return 0;
    };
    TimedConnection.prototype.isSentRecently = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    TimedConnection.prototype.isReceivedRecently = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    TimedConnection.prototype.isNotReceivedLongTimeAgo = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    ns.net.TimedConnection = TimedConnection;
    ns.net.registers("TimedConnection");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Processor = sys.skywalker.Processor;
    var Hub = function () {};
    sys.Interface(Hub, [Processor]);
    Hub.prototype.open = function (remote, local) {
        ns.assert(false, "implement me!");
        return null;
    };
    Hub.prototype.connect = function (remote, local) {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.net.Hub = Hub;
    ns.net.registers("Hub");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Ship = function () {};
    sys.Interface(Ship, null);
    Ship.prototype.getSN = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.port.Ship = Ship;
    ns.port.registers("Ship");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Ship = ns.port.Ship;
    var Arrival = function () {};
    sys.Interface(Arrival, [Ship]);
    Arrival.prototype.assemble = function (income) {
        ns.assert(false, "implement me!");
        return null;
    };
    Arrival.prototype.isTimeout = function (now) {
        ns.assert(false, "implement me!");
        return false;
    };
    Arrival.prototype.touch = function (now) {
        ns.assert(false, "implement me!");
    };
    ns.port.Arrival = Arrival;
    ns.port.registers("Arrival");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Ship = ns.port.Ship;
    var Departure = function () {};
    sys.Interface(Departure, [Ship]);
    var DeparturePriority = sys.type.Enum(null, {
        URGENT: -1,
        NORMAL: 0,
        SLOWER: 1
    });
    Departure.prototype.getPriority = function () {
        ns.assert(false, "implement me!");
        return 0;
    };
    Departure.prototype.getFragments = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Departure.prototype.checkResponse = function (response) {
        ns.assert(false, "implement me!");
        return false;
    };
    Departure.prototype.isNew = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Departure.prototype.isDisposable = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Departure.prototype.isTimeout = function (now) {
        ns.assert(false, "implement me!");
        return false;
    };
    Departure.prototype.isFailed = function (now) {
        ns.assert(false, "implement me!");
        return false;
    };
    Departure.prototype.touch = function (now) {
        ns.assert(false, "implement me!");
    };
    Departure.Priority = DeparturePriority;
    ns.port.Departure = Departure;
    ns.port.registers("Departure");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Processor = sys.skywalker.Processor;
    var Docker = function () {};
    sys.Interface(Docker, [Processor]);
    Docker.prototype.isOpen = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Docker.prototype.isAlive = function () {
        ns.assert(false, "implement me!");
        return false;
    };
    Docker.prototype.getStatus = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Docker.prototype.getRemoteAddress = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Docker.prototype.getLocalAddress = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Docker.prototype.sendData = function (payload) {
        ns.assert(false, "implement me!");
        return false;
    };
    Docker.prototype.sendShip = function (ship) {
        ns.assert(false, "implement me!");
        return false;
    };
    Docker.prototype.processReceived = function (data) {
        ns.assert(false, "implement me!");
    };
    Docker.prototype.heartbeat = function () {
        ns.assert(false, "implement me!");
    };
    Docker.prototype.purge = function () {
        ns.assert(false, "implement me!");
    };
    Docker.prototype.close = function () {
        ns.assert(false, "implement me!");
    };
    ns.port.Docker = Docker;
    ns.port.registers("Docker");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var ConnectionState = ns.net.ConnectionState;
    var DockerStatus = sys.type.Enum(null, {
        ERROR: -1,
        INIT: 0,
        PREPARING: 1,
        READY: 1
    });
    DockerStatus.getStatus = function (state) {
        if (!state) {
            return DockerStatus.ERROR;
        } else {
            if (
                state.equals(ConnectionState.READY) ||
                state.equals(ConnectionState.EXPIRED) ||
                state.equals(ConnectionState.MAINTAINING)
            ) {
                return DockerStatus.READY;
            } else {
                if (state.equals(ConnectionState.PREPARING)) {
                    return DockerStatus.PREPARING;
                } else {
                    if (state.equals(ConnectionState.ERROR)) {
                        return DockerStatus.ERROR;
                    } else {
                        return DockerStatus.INIT;
                    }
                }
            }
        }
    };
    ns.port.DockerStatus = DockerStatus;
    ns.port.registers("DockerStatus");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Docker = ns.port.Docker;
    var DockerStatus = ns.port.DockerStatus;
    var DockerDelegate = function () {};
    sys.Interface(DockerDelegate, null);
    DockerDelegate.prototype.onDockerReceived = function (arrival, docker) {
        ns.assert(false, "implement me!");
    };
    DockerDelegate.prototype.onDockerSent = function (departure, docker) {
        ns.assert(false, "implement me!");
    };
    DockerDelegate.prototype.onDockerFailed = function (
        error,
        departure,
        docker
    ) {
        ns.assert(false, "implement me!");
    };
    DockerDelegate.prototype.onDockerError = function (error, departure, docker) {
        ns.assert(false, "implement me!");
    };
    DockerDelegate.prototype.onDockerStatusChanged = function (
        previous,
        current,
        docker
    ) {
        ns.assert(false, "implement me!");
    };
    ns.port.DockerDelegate = DockerDelegate;
    ns.port.registers("DockerDelegate");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Processor = sys.skywalker.Processor;
    var Gate = function () {};
    sys.Interface(Gate, [Processor]);
    Gate.prototype.sendData = function (payload, remote, local) {
        ns.assert(false, "implement me!");
        return false;
    };
    Gate.prototype.sendShip = function (outgo, remote, local) {
        ns.assert(false, "implement me!");
        return false;
    };
    ns.port.Gate = Gate;
    ns.port.registers("Gate");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var SocketReader = function () {};
    sys.Interface(SocketReader, null);
    SocketReader.prototype.read = function (maxLen) {
        ns.assert(false, "implement me!");
        return null;
    };
    SocketReader.prototype.receive = function (maxLen) {
        ns.assert(false, "implement me!");
        return null;
    };
    var SocketWriter = function () {};
    sys.Interface(SocketWriter, null);
    SocketWriter.prototype.write = function (src) {
        ns.assert(false, "implement me!");
        return 0;
    };
    SocketWriter.prototype.send = function (src, target) {
        ns.assert(false, "implement me!");
        return 0;
    };
    ns.socket.SocketReader = SocketReader;
    ns.socket.SocketWriter = SocketWriter;
    ns.socket.registers("SocketReader");
    ns.socket.registers("SocketWriter");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var AddressPairObject = ns.type.AddressPairObject;
    var Channel = ns.net.Channel;
    var BaseChannel = function (remote, local, sock) {
        AddressPairObject.call(this, remote, local);
        this.__sock = sock;
        this.__reader = this.createReader();
        this.__writer = this.createWriter();
        this.__blocking = false;
        this.__opened = false;
        this.__connected = false;
        this.__bound = false;
        this.refreshFlags();
    };
    sys.Class(BaseChannel, AddressPairObject, [Channel], null);
    BaseChannel.prototype.finalize = function () {
        removeSocketChannel.call(this);
    };
    BaseChannel.prototype.createReader = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    BaseChannel.prototype.createWriter = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    BaseChannel.prototype.refreshFlags = function () {
        var sock = this.__sock;
        if (sock) {
            this.__blocking = sock.isBlocking();
            this.__opened = sock.isOpen();
            this.__connected = sock.isConnected();
            this.__bound = sock.isBound();
        } else {
            this.__blocking = false;
            this.__opened = false;
            this.__connected = false;
            this.__bound = false;
        }
    };
    BaseChannel.prototype.getSocket = function () {
        return this.__sock;
    };
    var removeSocketChannel = function () {
        var old = this.__sock;
        this.__sock = null;
        this.refreshFlags();
        if (old && old.isOpen()) {
            old.clone();
        }
    };
    BaseChannel.prototype.configureBlocking = function (block) {
        var sock = this.getSocket();
        sock.configureBlocking(block);
        this.__blocking = block;
        return sock;
    };
    BaseChannel.prototype.isBlocking = function () {
        return this.__blocking;
    };
    BaseChannel.prototype.isOpen = function () {
        return this.__opened;
    };
    BaseChannel.prototype.isConnected = function () {
        return this.__connected;
    };
    BaseChannel.prototype.isBound = function () {
        return this.__bound;
    };
    BaseChannel.prototype.isAlive = function () {
        return this.isOpen() && (this.isConnected() || this.isBound());
    };
    BaseChannel.prototype.bind = function (local) {
        if (!local) {
            local = this.localAddress;
        }
        var sock = this.getSocket();
        var nc = sock.bind(local);
        console.info("BaseChannel::bind()", local, sock);
        this.localAddress = local;
        this.__bound = true;
        this.__opened = true;
        this.__blocking = sock.isBlocking();
        return nc;
    };
    BaseChannel.prototype.connect = function (remote) {
        if (!remote) {
            remote = this.remoteAddress;
        }
        var sock = this.getSocket();
        sock.connect(remote);
        this.remoteAddress = remote;
        this.__connected = true;
        this.__opened = true;
        this.__blocking = sock.isBlocking();
        return sock;
    };
    BaseChannel.prototype.disconnect = function () {
        var sock = this.getSocket();
        removeSocketChannel.call(this);
        return sock;
    };
    BaseChannel.prototype.close = function () {
        removeSocketChannel.call(this);
    };
    BaseChannel.prototype.read = function (maxLen) {
        try {
            return this.__reader.read(maxLen);
        } catch (e) {
            this.close();
            throw e;
        }
    };
    BaseChannel.prototype.write = function (src) {
        try {
            return this.__writer.write(src);
        } catch (e) {
            this.close();
            throw e;
        }
    };
    BaseChannel.prototype.receive = function (maxLen) {
        try {
            return this.__reader.receive(maxLen);
        } catch (e) {
            this.close();
            throw e;
        }
    };
    BaseChannel.prototype.send = function (src, target) {
        try {
            return this.__writer.send(src, target);
        } catch (e) {
            this.close();
            throw e;
        }
    };
    ns.socket.BaseChannel = BaseChannel;
    ns.socket.registers("BaseChannel");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var ChannelChecker = function () {};
    sys.Interface(ChannelChecker, null);
    ChannelChecker.prototype.checkError = function (error, sock) {
        ns.assert(false, "implement me!");
        return null;
    };
    ChannelChecker.prototype.checkData = function (data, sock) {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.socket.ChannelChecker = ChannelChecker;
    ns.socket.registers("ChannelChecker");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var ChannelChecker = ns.socket.ChannelChecker;
    var DefaultChecker = function () {
        Object.call(this);
    };
    sys.Class(DefaultChecker, Object, [ChannelChecker], {
        checkError: function (error, sock) {
            return error;
        },
        checkData: function (data, sock) {
            return null;
        }
    });
    var ChannelController = function (channel) {
        Object.call(this);
        this.__channel = channel;
        this.__checker = this.createChecker();
    };
    sys.Class(ChannelController, Object, [ChannelChecker], null);
    ChannelController.prototype.getChannel = function () {
        return this.__channel;
    };
    ChannelController.prototype.getRemoteAddress = function () {
        var channel = this.getChannel();
        return channel.getRemoteAddress();
    };
    ChannelController.prototype.getLocalAddress = function () {
        var channel = this.getChannel();
        return channel.getLocalAddress();
    };
    ChannelController.prototype.getSocket = function () {
        var channel = this.getChannel();
        return channel.getSocket();
    };
    ChannelController.prototype.createChecker = function () {
        return new DefaultChecker();
    };
    ChannelController.prototype.checkError = function (error, sock) {
        return this.__checker.checkError(error, sock);
    };
    ChannelController.prototype.checkData = function (data, sock) {
        return this.__checker.checkData(data, sock);
    };
    ns.socket.ChannelController = ChannelController;
    ns.socket.registers("ChannelController");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var SocketReader = ns.socket.SocketReader;
    var SocketWriter = ns.socket.SocketWriter;
    var ChannelController = ns.socket.ChannelController;
    var ChannelReader = function (channel) {
        ChannelController.call(this, channel);
    };
    sys.Class(ChannelReader, ChannelController, [SocketReader], {
        read: function (maxLen) {
            var sock = this.getSocket();
            var data = this.tryRead(maxLen, sock);
            var error = this.checkData(data, sock);
            if (error) {
                throw error;
            }
            return data;
        },
        tryRead: function (maxLen, sock) {
            try {
                return sock.read(maxLen);
            } catch (e) {
                e = this.checkError(e, sock);
                if (e) {
                    throw e;
                }
                return null;
            }
        }
    });
    var ChannelWriter = function (channel) {
        ChannelController.call(this, channel);
    };
    sys.Class(ChannelWriter, ChannelController, [SocketWriter], {
        write: function (data) {
            var sock = this.getSocket();
            var sent = 0;
            var rest = data.length;
            var cnt;
            while (true) {
                cnt = this.tryWrite(data, sock);
                if (cnt <= 0) {
                    break;
                }
                sent += cnt;
                rest -= cnt;
                if (rest <= 0) {
                    break;
                } else {
                    data = data.subarray(cnt);
                }
            }
        },
        tryWrite: function (data, sock) {
            try {
                return sock.write(data);
            } catch (e) {
                e = this.checkError(e, sock);
                if (e) {
                    throw e;
                }
                return 0;
            }
        }
    });
    ns.socket.ChannelReader = ChannelReader;
    ns.socket.ChannelWriter = ChannelWriter;
    ns.socket.registers("ChannelReader");
    ns.socket.registers("ChannelWriter");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var AddressPairObject = ns.type.AddressPairObject;
    var Connection = ns.net.Connection;
    var TimedConnection = ns.net.TimedConnection;
    var ConnectionState = ns.net.ConnectionState;
    var StateMachine = ns.net.StateMachine;
    var BaseConnection = function (remote, local, channel) {
        AddressPairObject.call(this, remote, local);
        this.__channel = channel;
        this.__delegate = null;
        this.__lastSentTime = 0;
        this.__lastReceivedTime = 0;
        this.__fsm = null;
    };
    sys.Class(
        BaseConnection,
        AddressPairObject,
        [Connection, TimedConnection, ConnectionState.Delegate],
        null
    );
    BaseConnection.EXPIRES = 16 * 1000;
    BaseConnection.prototype.finalize = function () {
        this.setChannel(null);
        this.setStateMachine(null);
    };
    BaseConnection.prototype.getStateMachine = function () {
        return this.__fsm;
    };
    BaseConnection.prototype.setStateMachine = function (machine) {
        var old = this.__fsm;
        this.__fsm = machine;
        if (old && old !== machine) {
            old.stop();
        }
    };
    BaseConnection.prototype.createStateMachine = function () {
        var machine = new StateMachine(this);
        machine.setDelegate(this);
        return machine;
    };
    BaseConnection.prototype.getDelegate = function () {
        return this.__delegate;
    };
    BaseConnection.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate;
    };
    BaseConnection.prototype.getChannel = function () {
        return this.__channel;
    };
    BaseConnection.prototype.setChannel = function (channel) {
        var old = this.__channel;
        this.__channel = channel;
        if (old && old !== channel) {
            if (old.isConnected()) {
                try {
                    old.disconnect();
                } catch (e) {
                    console.error("BaseConnection::setChannel()", e, old);
                }
            }
        }
    };
    BaseConnection.prototype.isOpen = function () {
        var channel = this.getChannel();
        return channel && channel.isOpen();
    };
    BaseConnection.prototype.isBound = function () {
        var channel = this.getChannel();
        return channel && channel.isBound();
    };
    BaseConnection.prototype.isConnected = function () {
        var channel = this.getChannel();
        return channel && channel.isConnected();
    };
    BaseConnection.prototype.isAlive = function () {
        return this.isOpen() && (this.isConnected() || this.isBound());
    };
    BaseConnection.prototype.clone = function () {
        this.setChannel(null);
        this.setStateMachine(null);
    };
    BaseConnection.prototype.start = function () {
        var machine = this.createStateMachine();
        machine.start();
        this.setStateMachine(machine);
    };
    BaseConnection.prototype.stop = function () {
        this.setChannel(null);
        this.setStateMachine(null);
    };
    BaseConnection.prototype.onReceived = function (data) {
        this.__lastReceivedTime = new Date().getTime();
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.onConnectionReceived(data, this);
        }
    };
    BaseConnection.prototype.sendTo = function (data, destination) {
        var sent = -1;
        var channel = this.getChannel();
        if (channel && channel.isAlive()) {
            sent = channel.send(data, destination);
            if (sent > 0) {
                this.__lastSentTime = new Date().getTime();
            }
        }
        return sent;
    };
    BaseConnection.prototype.send = function (pack) {
        var error = null;
        var sent = -1;
        try {
            var destination = this.getRemoteAddress();
            sent = this.sendTo(pack, destination);
            if (sent < 0) {
                error = new Error(
                    "failed to send data: " + pack.length + " byte(s) to " + destination
                );
            }
        } catch (e) {
            error = e;
            this.setChannel(null);
        }
        var delegate = this.getDelegate();
        if (delegate) {
            if (error) {
                delegate.onConnectionFailed(error, pack, this);
            } else {
                delegate.onConnectionSent(sent, pack, this);
            }
        }
        return sent;
    };
    BaseConnection.prototype.getState = function () {
        var machine = this.getStateMachine();
        return machine ? machine.getCurrentState() : null;
    };
    BaseConnection.prototype.tick = function (now, delta) {
        var machine = this.getStateMachine();
        if (machine) {
            machine.tick(now, delta);
        }
    };
    BaseConnection.prototype.getLastSentTime = function () {
        return this.__lastSentTime;
    };
    BaseConnection.prototype.getLastReceivedTime = function () {
        return this.__lastReceivedTime;
    };
    BaseConnection.prototype.isSentRecently = function (now) {
        return now <= this.__lastSentTime + BaseConnection.EXPIRES;
    };
    BaseConnection.prototype.isReceivedRecently = function (now) {
        return now <= this.__lastReceivedTime + BaseConnection.EXPIRES;
    };
    BaseConnection.prototype.isNotReceivedLongTimeAgo = function (now) {
        return now > this.__lastSentTime + (BaseConnection.EXPIRES << 3);
    };
    BaseConnection.prototype.enterState = function (next, machine) {};
    BaseConnection.prototype.exitState = function (previous, machine) {
        var current = machine.getCurrentState();
        if (current && current.equals(ConnectionState.READY)) {
            if (previous && previous.equals(ConnectionState.PREPARING)) {
                var timestamp = new Date().getTime() - (BaseConnection.EXPIRES >> 1);
                if (this.__lastSentTime < timestamp) {
                    this.__lastSentTime = timestamp;
                }
                if (this.__lastReceivedTime < timestamp) {
                    this.__lastReceivedTime = timestamp;
                }
            }
        }
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.onConnectionStateChanged(previous, current, this);
        }
    };
    BaseConnection.prototype.pauseState = function (current, machine) {};
    BaseConnection.prototype.resumeState = function (current, machine) {};
    ns.socket.BaseConnection = BaseConnection;
    ns.socket.registers("BaseConnection");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var BaseConnection = ns.socket.BaseConnection;
    var ActiveConnection = function (remote, local, channel, hub) {
        BaseConnection.call(this, remote, local, channel);
        this.__hub = hub;
    };
    sys.Class(ActiveConnection, BaseConnection, null, {
        isOpen: function () {
            return this.getStateMachine() !== null;
        },
        getChannel: function () {
            var channel = BaseConnection.prototype.getChannel.call(this);
            if (!channel || !channel.isOpen()) {
                if (this.getStateMachine() === null) {
                    return null;
                }
                this.__hub.open(this.remoteAddress, this.localAddress);
                this.setChannel(channel);
            }
            return channel;
        }
    });
    ns.socket.ActiveConnection = ActiveConnection;
    ns.socket.registers("ActiveConnection");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var AddressPairMap = ns.type.AddressPairMap;
    var ConnectionPool = function () {
        AddressPairMap.call(this);
    };
    sys.Class(ConnectionPool, AddressPairMap, null, {
        set: function (remote, local, value) {
            var old = this.get(remote, local);
            if (old && old !== value) {
                this.remove(remote, local, old);
            }
            AddressPairMap.prototype.set.call(this, remote, local, value);
        },
        remove: function (remote, local, value) {
            var cached = AddressPairMap.prototype.remove.call(
                this,
                remote,
                local,
                value
            );
            if (cached && cached.isOpen()) {
                cached.close();
            }
            return cached;
        }
    });
    ns.socket.ConnectionPool = ConnectionPool;
    ns.socket.registers("ConnectionPool");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Hub = ns.net.Hub;
    var ConnectionPool = ns.socket.ConnectionPool;
    var BaseHub = function (delegate) {
        Object.call(this);
        this.__delegate = delegate;
        this.__connPool = this.createConnectionPool();
        this.__last = new Date().getTime();
    };
    sys.Class(BaseHub, Object, [Hub], null);
    BaseHub.prototype.createConnectionPool = function () {
        return new ConnectionPool();
    };
    BaseHub.prototype.getDelegate = function () {
        return this.__delegate;
    };
    BaseHub.MSS = 1472;
    BaseHub.prototype.allChannels = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    BaseHub.prototype.removeChannel = function (remote, local, channel) {
        ns.assert(false, "implement me!");
    };
    BaseHub.prototype.createConnection = function (remote, local, channel) {
        ns.assert(false, "implement me!");
        return null;
    };
    BaseHub.prototype.allConnections = function () {
        return this.__connPool.allValues();
    };
    BaseHub.prototype.getConnection = function (remote, local) {
        return this.__connPool.get(remote, local);
    };
    BaseHub.prototype.setConnection = function (remote, local, connection) {
        this.__connPool.set(remote, local, connection);
    };
    BaseHub.prototype.removeConnection = function (remote, local, connection) {
        this.__connPool.remove(remote, local, connection);
    };
    BaseHub.prototype.connect = function (remote, local) {
        var conn = this.getConnection(remote, local);
        if (conn) {
            if (!local) {
                return conn;
            }
            var address = conn.getLocalAddress();
            if (!address || address.equals(local)) {
                return conn;
            }
        }
        var channel = this.open(remote, local);
        if (!channel || !channel.isOpen()) {
            return null;
        }
        conn = this.createConnection(remote, local, channel);
        if (conn) {
            this.setConnection(conn.getRemoteAddress(), conn.getLocalAddress(), conn);
        }
        return conn;
    };
    BaseHub.prototype.driveChannel = function (channel) {
        if (!channel.isAlive()) {
            return false;
        }
        var remote = channel.getRemoteAddress();
        var local = channel.getLocalAddress();
        var conn;
        var data;
        try {
            data = channel.receive(BaseHub.MSS);
        } catch (e) {
            var delegate = this.getDelegate();
            if (!delegate || !remote) {
                this.removeChannel(remote, local, channel);
            } else {
                conn = this.getConnection(remote, local);
                this.removeChannel(remote, local, channel);
                if (conn) {
                    delegate.onConnectionError(e, conn);
                }
            }
            return false;
        }
        if (!data) {
            return false;
        }
        conn = this.connect(remote, local);
        if (conn) {
            conn.onReceived(data);
        }
        return true;
    };
    BaseHub.prototype.driveChannels = function (channels) {
        var count = 0;
        for (var index = channels.length - 1; index >= 0; --index) {
            try {
                if (this.driveChannel(channels[index])) {
                    ++count;
                }
            } catch (e) {
                console.error("BaseHub::driveChannel()", e, channels[index]);
            }
        }
        return count;
    };
    BaseHub.prototype.cleanupChannels = function (channels) {
        var channel;
        for (var index = channels.length - 1; index >= 0; --index) {
            channel = channels[index];
            if (!channel.isAlive()) {
                this.removeChannel(
                    channel.getRemoteAddress(),
                    channel.getLocalAddress(),
                    channel
                );
            }
        }
    };
    BaseHub.prototype.driveConnections = function (connections) {
        var now = new Date().getTime();
        var delta = now - this.__last;
        for (var index = connections.length - 1; index >= 0; --index) {
            try {
                connections[index].tick(now, delta);
            } catch (e) {
                console.error("BaseHub::driveConnections()", e, connections[index]);
            }
        }
        this.__last = now;
    };
    BaseHub.prototype.cleanupConnections = function (connections) {
        var conn;
        for (var index = connections.length - 1; index >= 0; --index) {
            conn = connections[index];
            if (!conn.isOpen()) {
                this.removeConnection(
                    conn.getRemoteAddress(),
                    conn.getLocalAddress(),
                    conn
                );
            }
        }
    };
    BaseHub.prototype.process = function () {
        try {
            var channels = this.allChannels();
            var count = this.driveChannels(channels);
            var connections = this.allConnections();
            this.driveConnections(connections);
            this.cleanupChannels(channels);
            this.cleanupConnections(connections);
            return count > 0;
        } catch (e) {
            console.error("BaseHub::process()", e);
            return false;
        }
    };
    ns.socket.BaseHub = BaseHub;
    ns.socket.registers("BaseHub");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Arrival = ns.port.Arrival;
    var ArrivalShip = function (now) {
        Object.call(this);
        if (!now) {
            now = new Date().getTime();
        }
        this.__expired = now + ArrivalShip.EXPIRED;
    };
    sys.Class(ArrivalShip, Object, [Arrival], null);
    ArrivalShip.EXPIRES = 600 * 1000;
    ArrivalShip.prototype.isTimeout = function (now) {
        return now > this.__expired;
    };
    ArrivalShip.prototype.touch = function (now) {
        this.__expired = now + ArrivalShip.EXPIRES;
    };
    ns.ArrivalShip = ArrivalShip;
    ns.registers("ArrivalShip");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Arrays = sys.type.Arrays;
    var Dictionary = sys.type.Dictionary;
    var ArrivalHall = function () {
        Object.call(this);
        this.__arrivals = [];
        this.__amap = new Dictionary();
        this.__aft = new Dictionary();
    };
    sys.Class(ArrivalHall, Object, null, null);
    ArrivalHall.prototype.assembleArrival = function (income) {
        var sn = income.getSN();
        if (!sn) {
            return income;
        }
        var time = this.__aft.getValue(sn);
        if (time && time > 0) {
            return null;
        }
        var task = this.__amap.getValue(sn);
        if (!task) {
            task = income.assemble(income);
            if (!task) {
                this.__arrivals.push(income);
                this.__amap.setValue(sn, income);
                return null;
            } else {
                return task;
            }
        }
        var completed = task.assemble(income);
        if (!completed) {
            task.touch(new Date().getTime());
            return null;
        }
        Arrays.remove(this.__arrivals, task);
        this.__amap.removeValue(sn);
        this.__aft.setValue(sn, new Date().getTime());
        return completed;
    };
    ArrivalHall.prototype.purge = function () {
        var now = new Date().getTime();
        var ship;
        for (var i = this.__arrivals.length - 1; i >= 0; --i) {
            ship = this.__arrivals[i];
            if (ship.isTimeout(now)) {
                this.__arrivals.splice(i, 1);
                this.__amap.removeValue(ship.getSN());
            }
        }
        var ago = now - 3600;
        var keys = this.__aft.allKeys();
        var sn, when;
        for (var j = keys.length - 1; j >= 0; --j) {
            sn = keys[j];
            when = this.__aft.getValue(sn);
            if (!when || when < ago) {
                this.__aft.removeValue(sn);
                this.__amap.removeValue(sn);
            }
        }
    };
    ns.ArrivalHall = ArrivalHall;
    ns.registers("ArrivalHall");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Departure = ns.port.Departure;
    var DepartureShip = function (priority, maxTries) {
        Object.call(this);
        if (priority === null) {
            priority = 0;
        } else {
            if (priority instanceof sys.type.Enum) {
                priority = priority.valueOf();
            }
        }
        if (maxTries === null) {
            maxTries = 1 + DepartureShip.RETRIES;
        }
        this.__priority = priority;
        this.__tries = maxTries;
        this.__expired = 0;
    };
    sys.Class(DepartureShip, Object, [Departure], null);
    DepartureShip.EXPIRES = 120 * 1000;
    DepartureShip.RETRIES = 2;
    DepartureShip.DISPOSABLE = -1;
    DepartureShip.prototype.getPriority = function () {
        return this.__priority;
    };
    DepartureShip.prototype.isNew = function () {
        return this.__expired === 0;
    };
    DepartureShip.prototype.isDisposable = function () {
        return this.__tries <= 0;
    };
    DepartureShip.prototype.isTimeout = function (now) {
        return this.__tries > 0 && now > this.__expired;
    };
    DepartureShip.prototype.isFailed = function (now) {
        return this.__tries === 0 && now > this.__expired;
    };
    DepartureShip.prototype.touch = function (now) {
        this.__expired = now + DepartureShip.EXPIRES;
        this.__tries -= 1;
    };
    ns.DepartureShip = DepartureShip;
    ns.registers("DepartureShip");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Arrays = sys.type.Arrays;
    var Dictionary = sys.type.Dictionary;
    var DepartureHall = function () {
        Object.call(this);
        this.__priorities = [];
        this.__fleets = new Dictionary();
        this.__dmap = new Dictionary();
        this.__dft = new Dictionary();
    };
    sys.Class(DepartureHall, Object, null, null);
    DepartureHall.prototype.appendDeparture = function (outgo) {
        var priority = outgo.getPriority();
        var fleet = this.__fleets.getValue(priority);
        if (!fleet) {
            fleet = [];
            this.__fleets.setValue(priority, fleet);
            insertPriority(priority, this.__priorities);
        } else {
            if (fleet.indexOf(outgo) >= 0) {
                return false;
            }
        }
        fleet.push(outgo);
        var sn = outgo.getSN();
        if (sn && !outgo.isDisposable()) {
            this.__dmap.setValue(sn, outgo);
        }
        return true;
    };
    var insertPriority = function (prior, priorities) {
        var index, value;
        for (index = 0; index < priorities.length; ++index) {
            value = priorities[index];
            if (value === prior) {
                return;
            } else {
                if (value > prior) {
                    break;
                }
            }
        }
        Arrays.insert(priorities, index, prior);
    };
    DepartureHall.prototype.checkResponse = function (response) {
        var sn = response.getSN();
        var time = this.__dft.getValue(sn);
        if (!time || time === 0) {
            var ship = this.__dmap.getValue(sn);
            if (ship && ship.checkResponse(response)) {
                removeShip(ship, sn, this.__fleets, this.__dmap);
                this.__dft.setValue(sn, new Date().getTime());
                return ship;
            }
        }
        return null;
    };
    var removeShip = function (ship, sn, departureFleets, departureMap) {
        var prior = ship.getPriority();
        var fleet = departureFleets.getValue(prior);
        if (fleet) {
            Arrays.remove(fleet, ship);
            if (fleet.length === 0) {
                departureFleets.removeValue(prior);
            }
        }
        departureMap.removeValue(sn);
    };
    DepartureHall.prototype.getNextDeparture = function (now) {
        var next = getNextNewDeparture.call(this, now);
        if (!next) {
            next = getNextTimeoutDeparture.call(this, now);
        }
        return next;
    };
    var getNextNewDeparture = function (now) {
        var priorityList = new Array(this.__priorities);
        var prior, sn;
        var fleet, ship;
        var i, j;
        for (i = 0; i < priorityList.length; ++i) {
            prior = priorityList[i];
            fleet = this.__fleets.getValue(prior);
            if (!fleet) {
                continue;
            }
            for (j = 0; j < fleet.length; ++j) {
                ship = fleet[j];
                if (ship.isNew()) {
                    if (ship.isDisposable()) {
                        fleet.splice(j, 1);
                        sn = ship.getSN();
                        if (sn) {
                            this.__dmap.removeValue(sn);
                        }
                    } else {
                        ship.touch(now);
                    }
                    return ship;
                }
            }
        }
        return null;
    };
    var getNextTimeoutDeparture = function (now) {
        var priorityList = new Array(this.__priorities);
        var prior, sn;
        var fleet, ship;
        var i, j;
        for (i = 0; i < priorityList.length; ++i) {
            prior = priorityList[i];
            fleet = this.__fleets.getValue(prior);
            if (!fleet) {
                continue;
            }
            for (j = 0; j < fleet.length; ++j) {
                ship = fleet[j];
                if (ship.isTimeout(now)) {
                    ship.touch(now);
                    if (fleet.length > 1) {
                        fleet.splice(j, 1);
                        fleet.push(ship);
                    }
                    return ship;
                } else {
                    if (ship.isFailed(now)) {
                        fleet.splice(j, 1);
                        sn = ship.getSN();
                        if (sn) {
                            this.__dmap.removeValue(sn);
                        }
                        return ship;
                    }
                }
            }
        }
        return null;
    };
    DepartureHall.prototype.purge = function () {
        var failedTasks = [];
        var now = new Date().getTime();
        var priorityList = new Array(this.__priorities);
        var prior;
        var fleet, ship;
        var i, j;
        for (i = 0; i < priorityList.length; ++i) {
            prior = priorityList[i];
            fleet = this.__fleets.getValue(prior);
            if (!fleet) {
                continue;
            }
            for (j = 0; j < fleet.length; ++j) {
                ship = fleet[j];
                if (ship.isFailed(now)) {
                    failedTasks.push(ship);
                }
            }
            clear.call(this, fleet, failedTasks, prior);
            failedTasks = [];
        }
        var ago = now - 3600;
        var keys = this.__dft.allKeys();
        var sn, when;
        for (j = keys.length - 1; j >= 0; --j) {
            sn = keys[j];
            when = this.__dft.getValue(sn);
            if (!when || when < ago) {
                this.__dft.removeValue(sn);
                this.__dmap.removeValue(sn);
            }
        }
    };
    var clear = function (fleet, failedTasks, prior) {
        var sn, ship;
        for (var index = failedTasks.length - 1; index >= 0; --index) {
            ship = fleet[index];
            fleet.splice(index, 1);
            sn = ship.getSN();
            if (sn) {
                this.__dmap.removeValue(sn);
            }
        }
        if (fleet.length === 0) {
            this.__fleets.removeValue(prior);
        }
    };
    ns.DepartureHall = DepartureHall;
    ns.registers("DepartureHall");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var ArrivalHall = ns.ArrivalHall;
    var DepartureHall = ns.DepartureHall;
    var Dock = function () {
        Object.call(this);
        this.__arrivalHall = this.createArrivalHall();
        this.__departureHall = this.createDepartureHall();
    };
    sys.Class(Dock, Object, null, null);
    Dock.prototype.createArrivalHall = function () {
        return new ArrivalHall();
    };
    Dock.prototype.createDepartureHall = function () {
        return new DepartureHall();
    };
    Dock.prototype.assembleArrival = function (income) {
        return this.__arrivalHall.assembleArrival(income);
    };
    Dock.prototype.appendDeparture = function (outgo) {
        return this.__departureHall.appendDeparture(outgo);
    };
    Dock.prototype.checkResponse = function (response) {
        return this.__departureHall.checkResponse(response);
    };
    Dock.prototype.getNextDeparture = function (now) {
        return this.__departureHall.getNextDeparture(now);
    };
    Dock.prototype.purge = function () {
        this.__arrivalHall.purge();
        this.__departureHall.purge();
    };
    ns.Dock = Dock;
    ns.registers("Dock");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var AddressPairObject = ns.type.AddressPairObject;
    var Docker = ns.port.Docker;
    var DockerStatus = ns.port.DockerStatus;
    var Dock = ns.Dock;
    var StarDocker = function (connection) {
        var remote = connection.getRemoteAddress();
        var local = connection.getLocalAddress();
        AddressPairObject.call(this, remote, local);
        this.__conn = connection;
        this.__delegate = null;
        this.__dock = this.createDock();
        this.__lastOutgo = null;
        this.__lastFragments = [];
    };
    sys.Class(StarDocker, AddressPairObject, [Docker], null);
    StarDocker.prototype.finalize = function () {
        removeConnection.call(this);
    };
    StarDocker.prototype.createDock = function () {
        return new Dock();
    };
    StarDocker.prototype.getDelegate = function () {
        return this.__delegate;
    };
    StarDocker.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate;
    };
    StarDocker.prototype.getConnection = function () {
        return this.__conn;
    };
    var removeConnection = function () {
        var old = this.__conn;
        this.__conn = null;
        if (old && old.isOpen()) {
            old.close();
        }
    };
    StarDocker.prototype.isOpen = function () {
        var conn = this.getConnection();
        return conn && conn.isOpen();
    };
    StarDocker.prototype.isAlive = function () {
        var conn = this.getConnection();
        return conn && conn.isAlive();
    };
    StarDocker.prototype.getStatus = function () {
        var conn = this.getConnection();
        if (conn) {
            return DockerStatus.getStatus(conn.getState());
        } else {
            return DockerStatus.ERROR;
        }
    };
    StarDocker.prototype.sendShip = function (ship) {
        return this.__dock.appendDeparture(ship);
    };
    StarDocker.prototype.processReceived = function (data) {
        var income = this.getArrival(data);
        if (!income) {
            return;
        }
        income = this.checkArrival(income);
        if (!income) {
            return;
        }
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.onDockerReceived(income, this);
        }
    };
    StarDocker.prototype.getArrival = function (data) {
        ns.assert("implement me!");
        return null;
    };
    StarDocker.prototype.checkArrival = function (income) {
        ns.assert("implement me!");
        return null;
    };
    StarDocker.prototype.checkResponse = function (income) {
        var linked = this.__dock.checkResponse(income);
        if (!linked) {
            return null;
        }
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.onDockerSent(linked, this);
        }
        return linked;
    };
    StarDocker.prototype.assembleArrival = function (income) {
        return this.__dock.assembleArrival(income);
    };
    StarDocker.prototype.getNextDeparture = function (now) {
        return this.__dock.getNextDeparture(now);
    };
    StarDocker.prototype.purge = function () {
        this.__dock.purge();
    };
    StarDocker.prototype.close = function () {
        removeConnection.call(this);
        this.__dock = null;
    };
    StarDocker.prototype.process = function () {
        var conn = this.getConnection();
        if (!conn || !conn.isAlive()) {
            return false;
        }
        var delegate;
        var error;
        var outgo;
        var fragments;
        if (this.__lastFragments.length > 0) {
            outgo = this.__lastOutgo;
            fragments = this.__lastFragments;
            this.__lastOutgo = null;
            this.__lastFragments = [];
        } else {
            var now = new Date().getTime();
            outgo = this.getNextDeparture(now);
            if (!outgo) {
                return false;
            } else {
                if (outgo.isFailed(now)) {
                    delegate = this.getDelegate();
                    if (delegate) {
                        error = new Error("Request timeout");
                        delegate.onDockerFailed(error, outgo, this);
                    }
                    return true;
                } else {
                    fragments = outgo.getFragments();
                    if (fragments.length === 0) {
                        return true;
                    }
                }
            }
        }
        var index = 0;
        var sent = 0;
        try {
            var fra;
            for (var i = 0; i < fragments.length; ++i) {
                fra = fragments[i];
                sent = conn.send(fra);
                if (sent < fra.length) {
                    break;
                } else {
                    index += 1;
                    sent = 0;
                }
            }
            if (index < fragments.length) {
                error = new Error(
                    "only " + index + "/" + fragments.length + " fragments sent."
                );
            } else {
                return true;
            }
        } catch (e) {
            error = e;
        }
        for (; index > 0; --index) {
            fragments.shift();
        }
        if (sent > 0) {
            var last = fragments.shift();
            var part = last.subarray(sent);
            fragments.unshift(part);
        }
        this.__lastOutgo = outgo;
        this.__lastFragments = fragments;
        delegate = this.getDelegate();
        if (delegate) {
            delegate.onDockerError(error, outgo, this);
        }
        return false;
    };
    ns.StarDocker = StarDocker;
    ns.registers("StarDocker");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var AddressPairMap = ns.type.AddressPairMap;
    var DockerPool = function () {
        AddressPairMap.call(this);
    };
    sys.Class(DockerPool, AddressPairMap, null, {
        set: function (remote, local, value) {
            var old = this.get(remote, local);
            if (old && old !== value) {
                this.remove(remote, local, old);
            }
            AddressPairMap.prototype.set.call(this, remote, local, value);
        },
        remove: function (remote, local, value) {
            var cached = AddressPairMap.prototype.remove.call(
                this,
                remote,
                local,
                value
            );
            if (cached && cached.isOpen()) {
                cached.close();
            }
            return cached;
        }
    });
    ns.DockerPool = DockerPool;
    ns.registers("DockerPool");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var ConnectionDelegate = ns.net.ConnectionDelegate;
    var ConnectionState = ns.net.ConnectionState;
    var Gate = ns.port.Gate;
    var DockerStatus = ns.port.DockerStatus;
    var DockerPool = ns.DockerPool;
    var StarGate = function (delegate) {
        Object.call(this);
        this.__delegate = delegate;
        this.__dockerPool = this.createDockerPool();
    };
    sys.Class(StarGate, Object, [Gate, ConnectionDelegate], null);
    StarGate.prototype.createDockerPool = function () {
        return new DockerPool();
    };
    StarGate.prototype.getDelegate = function () {
        return this.__delegate;
    };
    StarGate.prototype.sendData = function (payload, remote, local) {
        var docker = this.getDocker(remote, local);
        if (!docker || !docker.isOpen()) {
            return false;
        }
        return docker.sendData(payload);
    };
    StarGate.prototype.sendShip = function (outgo, remote, local) {
        var docker = this.getDocker(remote, local);
        if (!docker || !docker.isOpen()) {
            return false;
        }
        return docker.sendShip(outgo);
    };
    StarGate.prototype.createDocker = function (connection, advanceParties) {
        ns.assert(false, "implement me!");
        return null;
    };
    StarGate.prototype.allDockers = function () {
        return this.__dockerPool.allValues();
    };
    StarGate.prototype.getDocker = function (remote, local) {
        return this.__dockerPool.get(remote, local);
    };
    StarGate.prototype.setDocker = function (remote, local, docker) {
        this.__dockerPool.set(remote, local, docker);
    };
    StarGate.prototype.removeDocker = function (remote, local, docker) {
        this.__dockerPool.remove(remote, local, docker);
    };
    StarGate.prototype.process = function () {
        try {
            var dockers = this.allDockers();
            var count = this.driveDockers(dockers);
            this.cleanupDockers(dockers);
            return count > 0;
        } catch (e) {
            console.error("StarGate::process()", e);
        }
    };
    StarGate.prototype.driveDockers = function (dockers) {
        var count = 0;
        for (var index = dockers.length - 1; index >= 0; --index) {
            try {
                if (dockers[index].process()) {
                    ++count;
                }
            } catch (e) {
                console.error("StarGate::driveDockers()", e, dockers[index]);
            }
        }
        return count;
    };
    StarGate.prototype.cleanupDockers = function (dockers) {
        var worker;
        for (var index = dockers.length - 1; index >= 0; --index) {
            worker = dockers[index];
            if (worker.isOpen()) {
                worker.purge();
            } else {
                this.removeDocker(
                    worker.getRemoteAddress(),
                    worker.getLocalAddress(),
                    worker
                );
            }
        }
    };
    StarGate.prototype.heartbeat = function (connection) {
        var remote = connection.getRemoteAddress();
        var local = connection.getLocalAddress();
        var worker = this.getDocker(remote, local);
        if (worker) {
            worker.heartbeat();
        }
    };
    StarGate.prototype.onConnectionStateChanged = function (
        previous,
        current,
        connection
    ) {
        var delegate = this.getDelegate();
        if (delegate) {
            var s1 = DockerStatus.getStatus(previous);
            var s2 = DockerStatus.getStatus(current);
            var changed;
            if (!s1) {
                changed = !s2;
            } else {
                if (!s2) {
                    changed = true;
                } else {
                    changed = !s1.equals(s2);
                }
            }
            if (changed) {
                var remote = connection.getRemoteAddress();
                var local = connection.getLocalAddress();
                var docker = this.getDocker(remote, local);
                if (docker != null) {
                    delegate.onDockerStatusChanged(s1, s2, docker);
                }
            }
        }
        if (current && current.equals(ConnectionState.EXPIRED)) {
            this.heartbeat(connection);
        }
    };
    StarGate.prototype.onConnectionReceived = function (data, connection) {
        var remote = connection.getRemoteAddress();
        var local = connection.getLocalAddress();
        var worker = this.getDocker(remote, local);
        if (worker) {
            worker.processReceived(data);
            return;
        }
        var advanceParties = this.cacheAdvanceParty(data, connection);
        worker = this.createDocker(connection, advanceParties);
        if (worker != null) {
            this.setDocker(
                worker.getRemoteAddress(),
                worker.getLocalAddress(),
                worker
            );
            for (var i = 0; i < advanceParties.length; ++i) {
                worker.processReceived(advanceParties[i]);
            }
            this.clearAdvanceParty(connection);
        }
    };
    StarGate.prototype.onConnectionSent = function (sent, data, connection) {};
    StarGate.prototype.onConnectionFailed = function (error, data, connection) {};
    StarGate.prototype.onConnectionError = function (error, connection) {};
    StarGate.prototype.cacheAdvanceParty = function (data, connection) {
        ns.assert("implement me!");
        return null;
    };
    StarGate.prototype.clearAdvanceParty = function (connection) {
        ns.assert("implement me!");
    };
    ns.StarGate = StarGate;
    ns.registers("StarGate");
})(StarTrek, MONKEY);
if (typeof LocalNotificationService !== "object") {
    LocalNotificationService = new MONKEY.Namespace();
}
if (typeof FileSystem !== "object") {
    FileSystem = new MONKEY.Namespace();
}
(function (ns, sys) {
    if (typeof ns.network !== "object") {
        ns.network = new sys.Namespace();
    }
    if (typeof ns.ws !== "object") {
        ns.ws = new sys.Namespace();
    }
    ns.registers("network");
    ns.registers("ws");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var JsON = sys.format.JSON;
    var Base64 = sys.format.Base64;
    var Storage = function (storage, prefix) {
        Object.call(this);
        this.storage = storage;
        if (prefix) {
            this.ROOT = prefix;
        } else {
            this.ROOT = "dim";
        }
    };
    sys.Class(Storage, Object, null, null);
    Storage.prototype.getItem = function (key) {
        return this.storage.getItem(key);
    };
    Storage.prototype.setItem = function (key, value) {
        this.storage.setItem(key, value);
    };
    Storage.prototype.removeItem = function (key) {
        this.storage.removeItem(key);
    };
    Storage.prototype.clear = function () {
        this.storage.clear();
    };
    Storage.prototype.getLength = function () {
        return this.storage.length;
    };
    Storage.prototype.key = function (index) {
        return this.storage.key(index);
    };
    Storage.prototype.exists = function (path) {
        return !!this.getItem(this.ROOT + "." + path);
    };
    Storage.prototype.loadText = function (path) {
        return this.getItem(this.ROOT + "." + path);
    };
    Storage.prototype.loadData = function (path) {
        var base64 = this.loadText(path);
        if (!base64) {
            return null;
        }
        return Base64.decode(base64);
    };
    Storage.prototype.loadJSON = function (path) {
        var json = this.loadText(path);
        if (!json) {
            return null;
        }
        return JsON.decode(json);
    };
    Storage.prototype.remove = function (path) {
        this.removeItem(this.ROOT + "." + path);
        return true;
    };
    Storage.prototype.saveText = function (text, path) {
        if (text) {
            this.setItem(this.ROOT + "." + path, text);
            return true;
        } else {
            this.removeItem(this.ROOT + "." + path);
            return false;
        }
    };
    Storage.prototype.saveData = function (data, path) {
        var base64 = null;
        if (data) {
            base64 = Base64.encode(data);
        }
        return this.saveText(base64, path);
    };
    Storage.prototype.saveJSON = function (container, path) {
        var json = null;
        if (container) {
            json = JsON.encode(container);
        }
        return this.saveText(json, path);
    };
    ns.LocalStorage = new Storage(window.localStorage, "dim.fs");
    ns.SessionStorage = new Storage(window.sessionStorage, "dim.mem");
    ns.registers("LocalStorage");
    ns.registers("SessionStorage");
})(FileSystem, MONKEY);
(function (ns, sys) {
    var Notification = function (name, sender, userInfo) {
        Object.call(this);
        this.name = name;
        this.sender = sender;
        this.userInfo = userInfo;
    };
    sys.Class(Notification, Object, null, null);
    ns.Notification = Notification;
    ns.registers("Notification");
})(LocalNotificationService, MONKEY);
(function (ns, sys) {
    var Observer = function () {};
    sys.Interface(Observer, null);
    Observer.prototype.onReceiveNotification = function (notification) {
        console.assert(false, "implement me!");
    };
    ns.Observer = Observer;
    ns.registers("Observer");
})(LocalNotificationService, MONKEY);
(function (ns, sys) {
    var Arrays = sys.type.Arrays;
    var Dictionary = sys.type.Dictionary;
    var Notification = ns.Notification;
    var Observer = ns.Observer;
    var Center = function () {
        Object.call(this);
        this.__observers = new Dictionary();
    };
    sys.Class(Center, Object, null, null);
    Center.prototype.addObserver = function (observer, name) {
        var list = this.__observers.getValue(name);
        if (list) {
            if (list.indexOf(observer) >= 0) {
                return;
            }
        } else {
            list = [];
            this.__observers.setValue(name, list);
        }
        list.push(observer);
    };
    Center.prototype.removeObserver = function (observer, name) {
        if (name) {
            var list = this.__observers.getValue(name);
            if (list) {
                Arrays.remove(list, observer);
            }
        } else {
            var names = this.__observers.allKeys();
            for (var i = 0; i < names.length; ++i) {
                this.removeObserver(observer, names[i]);
            }
        }
    };
    Center.prototype.postNotification = function (
        notification,
        sender,
        userInfo
    ) {
        if (typeof notification === "string") {
            notification = new Notification(notification, sender, userInfo);
        }
        var observers = this.__observers.getValue(notification.name);
        if (!observers) {
            return;
        }
        var obs;
        for (var i = 0; i < observers.length; ++i) {
            obs = observers[i];
            if (sys.Interface.conforms(obs, Observer)) {
                obs.onReceiveNotification(notification);
            } else {
                if (typeof obs === "function") {
                    obs.call(
                        notification,
                        notification.name,
                        notification.sender,
                        notification.userInfo
                    );
                }
            }
        }
    };
    var s_notification_center = null;
    Center.getInstance = function () {
        if (!s_notification_center) {
            s_notification_center = new Center();
        }
        return s_notification_center;
    };
    ns.NotificationCenter = Center;
    ns.registers("NotificationCenter");
})(LocalNotificationService, MONKEY);
(function (ns, sys) {
    var ConstantString = sys.type.ConstantString;
    var Host = function (string, ip, port, data) {
        ConstantString.call(this, string);
        this.ip = ip;
        this.port = port;
        this.data = data;
    };
    sys.Class(Host, ConstantString, null, null);
    Host.prototype.toArray = function (default_port) {
        var data = this.data;
        var port = this.port;
        var len = data.length;
        var array, index;
        if (!port || port === default_port) {
            array = new Uint8Array(len);
            for (index = 0; index < len; ++index) {
                array[index] = data[index];
            }
        } else {
            array = new Uint8Array(len + 2);
            for (index = 0; index < len; ++index) {
                array[index] = data[index];
            }
            array[len] = port >> 8;
            array[len + 1] = port & 255;
        }
        return array;
    };
    ns.network.Host = Host;
    ns.network.registers("Host");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Host = ns.Host;
    var IPv4 = function (ip, port, data) {
        if (data) {
            if (!ip) {
                ip = data[0] + "." + data[1] + "." + data[2] + "." + data[3];
                if (data.length === 6) {
                    port = (data[4] << 8) | data[5];
                }
            }
        } else {
            if (ip) {
                data = new Uint8Array(4);
                var array = ip.split(".");
                for (var index = 0; index < 4; ++index) {
                    data[index] = parseInt(array[index], 10);
                }
            } else {
                throw new URIError("IP data empty: " + data + ", " + ip + ", " + port);
            }
        }
        var string;
        if (port === 0) {
            string = ip;
        } else {
            string = ip + ":" + port;
        }
        Host.call(this, string, ip, port, data);
    };
    sys.Class(IPv4, Host, null);
    IPv4.patten = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;
    IPv4.parse = function (host) {
        if (!this.patten.test(host)) {
            return null;
        }
        var pair = host.split(":");
        var ip = pair[0],
            port = 0;
        if (pair.length === 2) {
            port = parseInt(pair[1]);
        }
        return new IPv4(ip, port);
    };
    ns.network.IPv4 = IPv4;
    ns.network.registers("IPv4");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Host = ns.Host;
    var parse_v4 = function (data, array) {
        var item,
            index = data.byteLength;
        for (var i = array.length - 1; i >= 0; --i) {
            item = array[i];
            data[--index] = item;
        }
        return data;
    };
    var parse_v6 = function (data, ip, count) {
        var array, item, index;
        var pos = ip.indexOf("::");
        if (pos < 0) {
            array = ip.split(":");
            index = -1;
            for (var i = 0; i < count; ++i) {
                item = parseInt(array[i], 16);
                data[++index] = item >> 8;
                data[++index] = item & 255;
            }
        } else {
            var left = ip.substring(0, pos).split(":");
            index = -1;
            for (var j = 0; j < left.length; ++j) {
                item = parseInt(left[j], 16);
                data[++index] = item >> 8;
                data[++index] = item & 255;
            }
            var right = ip.substring(pos + 2).split(":");
            index = count * 2;
            for (var k = right.length - 1; k >= 0; --k) {
                item = parseInt(right[k], 16);
                data[--index] = item & 255;
                data[--index] = item >> 8;
            }
        }
        return data;
    };
    var hex_encode = function (hi, lo) {
        if (hi > 0) {
            if (lo >= 16) {
                return Number(hi).toString(16) + Number(lo).toString(16);
            }
            return Number(hi).toString(16) + "0" + Number(lo).toString(16);
        } else {
            return Number(lo).toString(16);
        }
    };
    var IPv6 = function (ip, port, data) {
        if (data) {
            if (!ip) {
                ip = hex_encode(data[0], data[1]);
                for (var index = 2; index < 16; index += 2) {
                    ip += ":" + hex_encode(data[index], data[index + 1]);
                }
                ip = ip.replace(/:(0:){2,}/, "::");
                ip = ip.replace(/^(0::)/, "::");
                ip = ip.replace(/(::0)$/, "::");
                if (data.length === 18) {
                    port = (data[16] << 8) | data[17];
                }
            }
        } else {
            if (ip) {
                data = new Uint8Array(16);
                var array = ip.split(".");
                if (array.length === 1) {
                    data = parse_v6(data, ip, 8);
                } else {
                    if (array.length === 4) {
                        var prefix = array[0];
                        var pos = prefix.lastIndexOf(":");
                        array[0] = prefix.substring(pos + 1);
                        prefix = prefix.substring(0, pos);
                        data = parse_v6(data, prefix, 6);
                        data = parse_v4(data, array);
                    } else {
                        throw new URIError("IPv6 format error: " + ip);
                    }
                }
            } else {
                throw new URIError("IP data empty: " + data + ", " + ip + ", " + port);
            }
        }
        var string;
        if (port === 0) {
            string = ip;
        } else {
            string = "[" + ip + "]:" + port;
        }
        Host.call(this, string, ip, port, data);
    };
    sys.Class(IPv6, Host, null);
    IPv6.patten = /^\[?([0-9A-Fa-f]{0,4}:){2,7}[0-9A-Fa-f]{0,4}(]:\d{1,5})?$/;
    IPv6.patten_compat =
        /^\[?([0-9A-Fa-f]{0,4}:){2,6}(\d{1,3}.){3}\d{1,3}(]:\d{1,5})?$/;
    IPv6.parse = function (host) {
        if (!this.patten.test(host) && !this.patten_compat.test(host)) {
            return null;
        }
        var ip, port;
        if (host.charAt(0) === "[") {
            var pos = host.indexOf("]");
            ip = host.substring(1, pos);
            port = parseInt(host.substring(pos + 2));
        } else {
            ip = host;
            port = 0;
        }
        return new IPv6(ip, port);
    };
    ns.network.IPv6 = IPv6;
    ns.network.registers("IPv6");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var ArrivalShip = ns.ArrivalShip;
    var PlainArrival = function (data, now) {
        ArrivalShip.call(this, now);
        this.__data = data;
    };
    sys.Class(PlainArrival, ArrivalShip, null, null);
    PlainArrival.prototype.getPackage = function () {
        return this.__data;
    };
    PlainArrival.prototype.getSN = function () {
        return null;
    };
    PlainArrival.prototype.assemble = function (arrival) {
        console.assert(arrival === this, "plain arrival error", arrival, this);
        return arrival;
    };
    ns.PlainArrival = PlainArrival;
    ns.registers("PlainArrival");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var DepartureShip = ns.DepartureShip;
    var PlainDeparture = function (data, prior) {
        if (!prior) {
            prior = 0;
        }
        DepartureShip.call(this, prior, DepartureShip.DISPOSABLE);
        this.__completed = data;
        this.__fragments = [data];
    };
    sys.Class(PlainDeparture, DepartureShip, null, null);
    PlainDeparture.prototype.getPackage = function () {
        return this.__completed;
    };
    PlainDeparture.prototype.getSN = function () {
        return null;
    };
    PlainDeparture.prototype.getFragments = function () {
        return this.__fragments;
    };
    PlainDeparture.prototype.checkResponse = function (arrival) {
        return false;
    };
    ns.PlainDeparture = PlainDeparture;
    ns.registers("PlainDeparture");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var UTF8 = sys.format.UTF8;
    var Departure = ns.port.Departure;
    var StarDocker = ns.StarDocker;
    var PlainArrival = ns.PlainArrival;
    var PlainDeparture = ns.PlainDeparture;
    var PlainDocker = function (connection) {
        StarDocker.call(this, connection);
    };
    sys.Class(PlainDocker, StarDocker, null, {
        send: function (payload, priority) {
            var ship = this.createDeparture(payload, priority);
            return this.sendShip(ship);
        },
        sendData: function (payload) {
            return this.send(payload, Departure.Priority.NORMAL.valueOf());
        },
        heartbeat: function () {
            init_bytes();
            this.send(PING, Departure.Priority.SLOWER.valueOf());
        },
        getArrival: function (data) {
            if (!data || data.length === 0) {
                return null;
            }
            return this.createArrival(data);
        },
        checkArrival: function (arrival) {
            var data = arrival.getPackage();
            if (data.length === 4) {
                init_bytes();
                if (bytes_equal(data, PING)) {
                    this.send(PONG, Departure.Priority.SLOWER.valueOf());
                } else {
                    if (bytes_equal(data, PONG) || bytes_equal(data, NOOP)) {
                        return null;
                    }
                }
            }
            return arrival;
        }
    });
    PlainDocker.prototype.createArrival = function (data) {
        return new PlainArrival(data, null);
    };
    PlainDocker.prototype.createDeparture = function (data, priority) {
        return new PlainDeparture(data, priority);
    };
    var bytes_equal = function (data1, data2) {
        if (data1.length !== data2.length) {
            return false;
        }
        for (var i = data1.length - 1; i >= 0; --i) {
            if (data1[i] !== data2[i]) {
                return false;
            }
        }
        return true;
    };
    var init_bytes = function () {
        if (typeof PING === "string") {
            PING = UTF8.encode(PING);
            PONG = UTF8.encode(PONG);
            NOOP = UTF8.encode(NOOP);
        }
    };
    var PING = "PING";
    var PONG = "PONG";
    var NOOP = "NOOP";
    ns.PlainDocker = PlainDocker;
    ns.registers("PlainDocker");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var SocketAddress = ns.type.SocketAddress;
    var connect = function (url, proxy) {
        var ws = new WebSocket(url);
        ws.onopen = function (ev) {
            proxy.onConnected();
        };
        ws.onclose = function (ev) {
            proxy.onClosed();
        };
        ws.onerror = function (ev) {
            var error = new Error("WebSocket error: " + ev);
            proxy.onError(error);
        };
        ws.onmessage = function (ev) {
            var data = ev.data;
            if (!data || data.length === 0) {
                return;
            } else {
                if (typeof data === "string") {
                    data = sys.format.UTF8.encode(data);
                } else {
                    if (data instanceof Uint8Array) {
                    } else {
                        data = new Uint8Array(data);
                    }
                }
            }
            proxy.onReceived(data);
        };
        return ws;
    };
    var build_url = function (host, port) {
        if ("https" === window.location.protocol.split(":")[0]) {
            return "wss://" + host + ":" + port;
        } else {
            return "ws://" + host + ":" + port;
        }
    };
    var Socket = function () {
        Object.call(this);
        this.__packages = [];
        this.__connected = false;
        this.__closed = false;
        this.__host = null;
        this.__port = null;
        this.__ws = null;
        this.__remote = null;
        this.__local = null;
    };
    sys.Class(Socket, Object, null);
    Socket.prototype.getHost = function () {
        return this.__host;
    };
    Socket.prototype.getPort = function () {
        return this.__port;
    };
    Socket.prototype.onConnected = function () {
        this.__connected = true;
    };
    Socket.prototype.onClosed = function () {
        this.__closed = true;
    };
    Socket.prototype.onError = function (error) {};
    Socket.prototype.onReceived = function (data) {
        this.__packages.push(data);
    };
    Socket.prototype.configureBlocking = function () {};
    Socket.prototype.isBlocking = function () {
        return false;
    };
    Socket.prototype.isOpen = function () {
        return !this.__closed;
    };
    Socket.prototype.isConnected = function () {
        return this.__connected;
    };
    Socket.prototype.isBound = function () {
        return true;
    };
    Socket.prototype.isAlive = function () {
        return this.isOpen() && (this.isConnected() || this.isBound());
    };
    Socket.prototype.getRemoteAddress = function () {
        return this.__remote;
    };
    Socket.prototype.getLocalAddress = function () {
        return this.__local;
    };
    Socket.prototype.bind = function (local) {
        this.__local = local;
    };
    Socket.prototype.connect = function (remote) {
        this.__remote = null;
        this.close();
        this.__host = remote.getHost();
        this.__port = remote.getPort();
        var url = build_url(this.__host, this.__port);
        this.__ws = connect(url, this);
    };
    Socket.prototype.close = function () {
        if (this.__ws) {
            this.__ws.close();
            this.__ws = null;
        }
    };
    Socket.prototype.read = function (maxLen) {
        if (this.__packages.length > 0) {
            return this.__packages.shift();
        } else {
            return null;
        }
    };
    Socket.prototype.write = function (data) {
        this.__ws.send(data);
        return data.length;
    };
    Socket.prototype.receive = function (maxLen) {
        return this.read(maxLen);
    };
    Socket.prototype.send = function (data, remote) {
        return this.write(data);
    };
    ns.ws.Socket = Socket;
    ns.ws.registers("Socket");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var ChannelReader = ns.socket.ChannelReader;
    var ChannelWriter = ns.socket.ChannelWriter;
    var StreamChannelReader = function (channel) {
        ChannelReader.call(this, channel);
    };
    sys.Class(StreamChannelReader, ChannelReader, null, {
        receive: function (maxLen) {
            return this.read(maxLen);
        }
    });
    var StreamChannelWriter = function (channel) {
        ChannelWriter.call(this, channel);
    };
    sys.Class(StreamChannelWriter, ChannelWriter, null, {
        send: function (data, target) {
            return this.write(data);
        }
    });
    ns.ws.StreamChannelReader = StreamChannelReader;
    ns.ws.StreamChannelWriter = StreamChannelWriter;
    ns.ws.registers("StreamChannelReader");
    ns.ws.registers("StreamChannelWriter");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var BaseChannel = ns.socket.BaseChannel;
    var StreamChannelReader = ns.ws.StreamChannelReader;
    var StreamChannelWriter = ns.ws.StreamChannelWriter;
    var StreamChannel = function (remote, local, sock) {
        BaseChannel.call(this, remote, local, sock);
    };
    sys.Class(StreamChannel, BaseChannel, null, {
        createReader: function () {
            return new StreamChannelReader(this);
        },
        createWriter: function () {
            return new StreamChannelWriter(this);
        }
    });
    ns.ws.StreamChannel = StreamChannel;
    ns.ws.registers("StreamChannel");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var AddressPairMap = ns.type.AddressPairMap;
    var BaseHub = ns.socket.BaseHub;
    var StreamChannel = ns.ws.StreamChannel;
    var ChannelPool = function () {
        AddressPairMap.call(this);
    };
    sys.Class(ChannelPool, AddressPairMap, null, {
        set: function (remote, local, value) {
            var old = this.get(remote, local);
            if (old && old !== value) {
                this.remove(remote, local, old);
            }
            AddressPairMap.prototype.set.call(this, remote, local, value);
        },
        remove: function (remote, local, value) {
            var cached = AddressPairMap.prototype.remove.call(
                this,
                remote,
                local,
                value
            );
            if (cached && cached.isOpen()) {
                try {
                    cached.close();
                } catch (e) {
                    console.error(
                        "ChannelPool::remove()",
                        e,
                        remote,
                        local,
                        value,
                        cached
                    );
                }
            }
            return cached;
        }
    });
    var StreamHub = function (delegate) {
        BaseHub.call(this, delegate);
        this.__channelPool = this.createChannelPool();
    };
    sys.Class(StreamHub, BaseHub, null, null);
    StreamHub.prototype.createChannelPool = function () {
        return new ChannelPool();
    };
    StreamHub.prototype.createChannel = function (remote, local, sock) {
        return new StreamChannel(remote, local, sock);
    };
    StreamHub.prototype.allChannels = function () {
        return this.__channelPool.allValues();
    };
    StreamHub.prototype.getChannel = function (remote, local) {
        return this.__channelPool.get(remote, local);
    };
    StreamHub.prototype.setChannel = function (remote, local, channel) {
        this.__channelPool.set(remote, local, channel);
    };
    StreamHub.prototype.removeChannel = function (remote, local, channel) {
        this.__channelPool.remove(remote, local, channel);
    };
    StreamHub.prototype.open = function (remote, local) {
        return this.getChannel(remote, local);
    };
    ns.ws.ChannelPool = ChannelPool;
    ns.ws.StreamHub = StreamHub;
    ns.ws.registers("ChannelPool");
    ns.ws.registers("StreamHub");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var ActiveConnection = ns.socket.ActiveConnection;
    var StreamHub = ns.ws.StreamHub;
    var Socket = ns.ws.Socket;
    var StreamClientHub = function (delegate) {
        StreamHub.call(this, delegate);
    };
    sys.Class(StreamClientHub, StreamHub, null, {
        createConnection: function (remote, local, channel) {
            var conn = new ActiveConnection(remote, local, channel, this);
            conn.setDelegate(this.getDelegate());
            conn.start();
            return conn;
        },
        open: function (remote, local) {
            var channel = StreamHub.prototype.open.call(this, remote, local);
            if (!channel) {
                channel = createSocketChannel.call(this, remote, local);
                if (channel) {
                    this.setChannel(
                        channel.getRemoteAddress(),
                        channel.getLocalAddress(),
                        channel
                    );
                }
            }
            return channel;
        }
    });
    var createSocketChannel = function (remote, local) {
        try {
            var sock = createWebSocketClient(remote, local);
            if (!local) {
                local = sock.getLocalAddress();
            }
            return this.createChannel(remote, local, sock);
        } catch (e) {
            console.error("StreamClientHub::createSocketChannel()", e, remote, local);
            return null;
        }
    };
    var createWebSocketClient = function (remote, local) {
        var sock = new Socket();
        sock.configureBlocking(true);
        if (local) {
            sock.bind(local);
        }
        sock.connect(remote);
        sock.configureBlocking(false);
        return sock;
    };
    ns.ws.StreamClientHub = StreamClientHub;
    ns.ws.registers("StreamClientHub");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var StarGate = ns.StarGate;
    var BaseGate = function (delegate) {
        StarGate.call(this, delegate);
        this.__hub = null;
    };
    sys.Class(BaseGate, StarGate, null, {
        setHub: function (hub) {
            this.__hub = hub;
        },
        getHub: function () {
            return this.__hub;
        },
        fetchDocker: function (remote, local, advanceParties) {
            var docker = this.getDocker(remote, local);
            if (!docker) {
                var hub = this.getHub();
                var conn = hub.connect(remote, local);
                if (conn) {
                    docker = this.createDocker(conn, advanceParties);
                    this.setDocker(
                        docker.getRemoteAddress(),
                        docker.getLocalAddress(),
                        docker
                    );
                }
            }
            return docker;
        },
        getDocker: function (remote, local) {
            return StarGate.prototype.getDocker.call(this, remote, null);
        },
        setDocker: function (remote, local, docker) {
            return StarGate.prototype.setDocker.call(this, remote, null, docker);
        },
        removeDocker: function (remote, local, docker) {
            return StarGate.prototype.setDocker.removeDocker(
                this,
                remote,
                null,
                docker
            );
        },
        cacheAdvanceParty: function (data, connection) {
            var array = [];
            if (data && data.length > 0) {
                array.push(data);
            }
            return array;
        },
        clearAdvanceParty: function (connection) {}
    });
    ns.BaseGate = BaseGate;
    ns.registers("BaseGate");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Thread = sys.threading.Thread;
    var BaseGate = ns.BaseGate;
    var AutoGate = function (delegate) {
        BaseGate.call(this, delegate);
        this.__daemon = new Thread(this);
    };
    sys.Class(AutoGate, BaseGate, null, {
        isRunning: function () {
            return this.__daemon.isRunning();
        },
        start: function () {
            this.stop();
            this.__daemon.start();
        },
        stop: function () {
            this.__daemon.stop();
        },
        run: function () {
            this.process();
            return true;
        },
        process: function () {
            try {
                var hub = this.getHub();
                var incoming = hub.process();
                var outgoing = BaseGate.prototype.process.call(this);
                return incoming || outgoing;
            } catch (e) {
                console.error("AutoGate::process()", e);
                return false;
            }
        }
    });
    ns.AutoGate = AutoGate;
    ns.registers("AutoGate");
})(StarTrek, MONKEY);
(function (ns, sys) {
    var AutoGate = ns.AutoGate;
    var PlainDocker = ns.PlainDocker;
    var WSGate = function (delegate) {
        AutoGate.call(this, delegate);
    };
    sys.Class(WSGate, AutoGate, null, {
        sendMessage: function (payload, remote, local) {
            var docker = this.fetchDocker(remote, local, null);
            if (!docker || !docker.isOpen()) {
                return false;
            }
            return docker.sendData(payload);
        },
        createDocker: function (connection, advanceParties) {
            var docker = new PlainDocker(connection);
            docker.setDelegate(this.getDelegate());
            return docker;
        },
        onConnectionStateChanged: function (previous, current, connection) {
            AutoGate.prototype.onConnectionStateChanged.call(
                this,
                previous,
                current,
                connection
            );
            var remote = connection.getRemoteAddress();
            if (remote) {
                remote = remote.toString();
            }
            if (previous) {
                previous = previous.toString();
            }
            if (current) {
                current = current.toString();
            }
            console.info("connection state changed: ", previous, current, remote);
        },
        onConnectionFailed: function (error, data, connection) {
            AutoGate.prototype.onConnectionFailed.call(this, error, data, connection);
            var remote = connection.getRemoteAddress();
            if (remote) {
                remote = remote.toString();
            }
            console.info("connection failed: ", error, data, remote);
        },
        onConnectionError: function (error, connection) {
            AutoGate.prototype.onConnectionError.call(this, error, connection);
            var remote = connection.getRemoteAddress();
            if (remote) {
                remote = remote.toString();
            }
            console.info("connection error: ", error, remote);
        }
    });
    ns.WSGate = WSGate;
    ns.registers("WSGate");
})(StarTrek, MONKEY);
if (typeof DIMSDK !== "object") {
    DIMSDK = new MONKEY.Namespace();
}
if (typeof DIMSDK.lnc !== "object") {
    DIMSDK.lnc = new MONKEY.Namespace();
}
LocalNotificationService.exports(DIMSDK.lnc);
if (typeof DIMSDK.fsm !== "object") {
    DIMSDK.fsm = new MONKEY.Namespace();
}
FiniteStateMachine.exports(DIMSDK.fsm);
if (typeof DIMSDK.dos !== "object") {
    DIMSDK.dos = new MONKEY.Namespace();
}
FileSystem.exports(DIMSDK.dos);
if (typeof DIMSDK.startrek !== "object") {
    DIMSDK.startrek = new MONKEY.Namespace();
}
StarTrek.exports(DIMSDK.startrek);
