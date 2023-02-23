/**
 *  DIM-SDK (v0.2.2)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Feb. 21, 2023
 * @copyright (c) 2023 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof MONKEY !== "object") {
    MONKEY = {};
}
(function (ns) {
    if (typeof ns.type !== "object") {
        ns.type = {};
    }
    if (typeof ns.format !== "object") {
        ns.format = {};
    }
    if (typeof ns.digest !== "object") {
        ns.digest = {};
    }
    if (typeof ns.crypto !== "object") {
        ns.crypto = {};
    }
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
    var check_class = function (constructor, protocol) {
        var interfaces = constructor._mk_interfaces;
        if (interfaces && check_interfaces(interfaces, protocol)) {
            return true;
        }
        var parent = constructor._mk_parent;
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
    var def_methods = function (clazz, methods) {
        var names = Object.keys(methods);
        var key, fn;
        for (var i = 0; i < names.length; ++i) {
            key = names[i];
            fn = methods[key];
            if (typeof fn === "function") {
                clazz.prototype[key] = fn;
            }
        }
        return clazz;
    };
    var interfacefy = function (child, parents) {
        if (!child) {
            child = function () {};
        }
        if (parents) {
            child._mk_parents = parents;
        }
        return child;
    };
    interfacefy.conforms = conforms;
    var classify = function (child, parent, interfaces, methods) {
        if (!child) {
            child = function () {
                Object.call(this);
            };
        }
        if (parent) {
            child._mk_parent = parent;
        } else {
            parent = Object;
        }
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
        if (interfaces) {
            child._mk_interfaces = interfaces;
        }
        if (methods) {
            def_methods(child, methods);
        }
        return child;
    };
    ns.type.Interface = interfacefy;
    ns.type.Class = classify;
})(MONKEY);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
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
        if (object instanceof Date) {
            return true;
        }
        if (object instanceof RegExp) {
            return true;
        }
        return object instanceof Error;
    };
    var IObject = Interface(null, null);
    IObject.prototype.toString = function () {
        throw new Error("NotImplemented");
    };
    IObject.prototype.valueOf = function () {
        throw new Error("NotImplemented");
    };
    IObject.prototype.equals = function (other) {
        throw new Error("NotImplemented");
    };
    IObject.isNull = is_null;
    IObject.isBaseType = is_base_type;
    var BaseObject = function () {
        Object.call(this);
    };
    Class(BaseObject, Object, [IObject], null);
    BaseObject.prototype.equals = function (other) {
        return this === other;
    };
    ns.type.Object = IObject;
    ns.type.BaseObject = BaseObject;
})(MONKEY);
(function (ns) {
    var IObject = ns.type.Object;
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
                            if (IObject.isBaseType(obj1)) {
                                return obj1 === obj2;
                            } else {
                                if (IObject.isBaseType(obj2)) {
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
})(MONKEY);
(function (ns) {
    var Class = ns.type.Class;
    var BaseObject = ns.type.BaseObject;
    var is_enum = function (obj) {
        return obj instanceof Enum;
    };
    var get_alias = function (enumeration, value) {
        var keys = Object.keys(enumeration);
        var e;
        for (var k in keys) {
            e = enumeration[k];
            if (e instanceof Enum && e.equals(value)) {
                return e.__alias;
            }
        }
        return null;
    };
    var Enum = function (value, alias) {
        BaseObject.call(this);
        if (!alias) {
            alias = get_alias(this, value);
        }
        this.__value = value;
        this.__alias = alias;
    };
    Class(Enum, BaseObject, null, null);
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
    var enumify = function (enumeration, elements) {
        if (!enumeration) {
            enumeration = function (value, alias) {
                Enum.call(this, value, alias);
            };
        }
        Class(enumeration, Enum, null, null);
        var keys = Object.keys(elements);
        var alias, value;
        for (var i = 0; i < keys.length; ++i) {
            alias = keys[i];
            value = elements[alias];
            if (value instanceof Enum) {
                value = value.valueOf();
            } else {
                if (typeof value !== "number") {
                    throw new TypeError("Enum value must be a number!");
                }
            }
            enumeration[alias] = new enumeration(value, alias);
        }
        return enumeration;
    };
    enumify.isEnum = is_enum;
    ns.type.Enum = enumify;
})(MONKEY);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var BaseObject = ns.type.BaseObject;
    var Stringer = Interface(null, [IObject]);
    Stringer.prototype.toString = function () {
        throw new Error("NotImplemented");
    };
    Stringer.prototype.getLength = function () {
        throw new Error("NotImplemented");
    };
    Stringer.prototype.isEmpty = function () {
        throw new Error("NotImplemented");
    };
    Stringer.prototype.equalsIgnoreCase = function (other) {
        throw new Error("NotImplemented");
    };
    var ConstantString = function (str) {
        BaseObject.call(this);
        if (!str) {
            str = "";
        } else {
            if (Interface.conforms(str, Stringer)) {
                str = str.toString();
            }
        }
        this.__string = str;
    };
    Class(ConstantString, BaseObject, [Stringer], null);
    ConstantString.prototype.equals = function (other) {
        if (this === other) {
            return true;
        } else {
            if (!other) {
                return !this.__string;
            } else {
                if (Interface.conforms(other, Stringer)) {
                    return this.__string === other.toString();
                } else {
                    return this.__string === other;
                }
            }
        }
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
    ConstantString.prototype.isEmpty = function () {
        return this.__string.length === 0;
    };
    ConstantString.prototype.equalsIgnoreCase = function (other) {
        if (this === other) {
            return true;
        } else {
            if (!other) {
                return !this.__string;
            } else {
                if (Interface.conforms(other, Stringer)) {
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
    ns.type.Stringer = Stringer;
    ns.type.ConstantString = ConstantString;
})(MONKEY);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var BaseObject = ns.type.BaseObject;
    var arrays_equals = function (a1, a2) {
        return ns.type.Arrays.equals(a1, a2);
    };
    var copy_map = function (map, deep) {
        if (deep) {
            return ns.type.Copier.deepCopyMap(map);
        } else {
            return ns.type.Copier.copyMap(map);
        }
    };
    var json_encode = function (dict) {
        return ns.format.JSON.encode(dict);
    };
    var Mapper = Interface(null, [IObject]);
    Mapper.prototype.toMap = function () {
        throw new Error("NotImplemented");
    };
    Mapper.prototype.copyMap = function (deepCopy) {
        throw new Error("NotImplemented");
    };
    Mapper.prototype.allKeys = function () {
        throw new Error("NotImplemented");
    };
    Mapper.prototype.getValue = function (key) {
        throw new Error("NotImplemented");
    };
    Mapper.prototype.setValue = function (key, value) {
        throw new Error("NotImplemented");
    };
    Mapper.prototype.removeValue = function (key) {
        throw new Error("NotImplemented");
    };
    Mapper.prototype.getString = function (key) {
        throw new Error("NotImplemented");
    };
    Mapper.prototype.getBoolean = function (key) {
        throw new Error("NotImplemented");
    };
    Mapper.prototype.getNumber = function (key) {
        throw new Error("NotImplemented");
    };
    Mapper.prototype.getTime = function (key) {
        throw new Error("NotImplemented");
    };
    Mapper.prototype.setTime = function (key, time) {
        throw new Error("NotImplemented");
    };
    Mapper.prototype.setString = function (key, stringer) {
        throw new Error("NotImplemented");
    };
    Mapper.prototype.setMap = function (key, mapper) {
        throw new Error("NotImplemented");
    };
    var Dictionary = function (dict) {
        BaseObject.call(this);
        if (!dict) {
            dict = {};
        } else {
            if (Interface.conforms(dict, Mapper)) {
                dict = dict.toMap();
            }
        }
        this.__dictionary = dict;
    };
    Class(Dictionary, BaseObject, [Mapper], null);
    Dictionary.prototype.equals = function (other) {
        if (this === other) {
            return true;
        } else {
            if (!other) {
                return !this.__dictionary;
            } else {
                if (Interface.conforms(other, Mapper)) {
                    return arrays_equals(this.__dictionary, other.toMap());
                } else {
                    return arrays_equals(this.__dictionary, other);
                }
            }
        }
    };
    Dictionary.prototype.valueOf = function () {
        return this.__dictionary;
    };
    Dictionary.prototype.toString = function () {
        return json_encode(this.__dictionary);
    };
    Dictionary.prototype.toMap = function () {
        return this.__dictionary;
    };
    Dictionary.prototype.copyMap = function (deepCopy) {
        return copy_map(this.__dictionary, deepCopy);
    };
    Dictionary.prototype.allKeys = function () {
        return Object.keys(this.__dictionary);
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
    Dictionary.prototype.getString = function (key) {
        return this.__dictionary[key];
    };
    Dictionary.prototype.getBoolean = function (key) {
        var value = this.__dictionary[key];
        return value === null ? 0 : value.valueOf();
    };
    Dictionary.prototype.getNumber = function (key) {
        var value = this.__dictionary[key];
        return value === null ? 0 : value.valueOf();
    };
    Dictionary.prototype.getTime = function (key) {
        var seconds = this.getNumber(key);
        if (seconds <= 0) {
            return null;
        }
        var millis = seconds * 1000;
        return new Date(millis);
    };
    Dictionary.prototype.setTime = function (key, time) {
        if (time instanceof Date) {
            time = time.getTime() / 1000;
        }
        this.setValue(key, time);
    };
    Dictionary.prototype.setString = function (key, string) {
        if (string) {
            string = string.toString();
        }
        this.setValue(key, string);
    };
    Dictionary.prototype.setMap = function (key, map) {
        if (map) {
            map = map.toMap();
        }
        this.setValue(key, map);
    };
    ns.type.Mapper = Mapper;
    ns.type.Dictionary = Dictionary;
})(MONKEY);
(function (ns) {
    var Interface = ns.type.Interface;
    var IObject = ns.type.Object;
    var Enum = ns.type.Enum;
    var Stringer = ns.type.Stringer;
    var Arrays = ns.type.Arrays;
    var Mapper = ns.type.Mapper;
    var fetch_string = function (str) {
        if (Interface.conforms(str, Stringer)) {
            return str.toString();
        } else {
            return str;
        }
    };
    var fetch_map = function (dict) {
        if (Interface.conforms(dict, Mapper)) {
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
                if (Enum.isEnum(object)) {
                    return object.valueOf();
                } else {
                    if (Interface.conforms(object, Stringer)) {
                        return object.toString();
                    } else {
                        if (Interface.conforms(object, Mapper)) {
                            return unwrap_map(object.toMap());
                        } else {
                            if (!Arrays.isArray(object)) {
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
            }
        }
    };
    var unwrap_map = function (dict) {
        var result = {};
        var allKeys = Object.keys(dict);
        var key;
        var count = allKeys.length;
        for (var i = 0; i < count; ++i) {
            key = allKeys[i];
            result[key] = unwrap(dict[key]);
        }
        return result;
    };
    var unwrap_list = function (array) {
        var result = [];
        var count = array.length;
        for (var i = 0; i < count; ++i) {
            result[i] = unwrap(array[i]);
        }
        return result;
    };
    ns.type.Wrapper = {
        fetchString: fetch_string,
        fetchMap: fetch_map,
        unwrap: unwrap,
        unwrapMap: unwrap_map,
        unwrapList: unwrap_list
    };
})(MONKEY);
(function (ns) {
    var Interface = ns.type.Interface;
    var IObject = ns.type.Object;
    var Enum = ns.type.Enum;
    var Stringer = ns.type.Stringer;
    var Arrays = ns.type.Arrays;
    var Mapper = ns.type.Mapper;
    var copy = function (object) {
        if (IObject.isNull(object)) {
            return null;
        } else {
            if (IObject.isBaseType(object)) {
                return object;
            } else {
                if (Enum.isEnum(object)) {
                    return object.valueOf();
                } else {
                    if (Interface.conforms(object, Stringer)) {
                        return object.toString();
                    } else {
                        if (Interface.conforms(object, Mapper)) {
                            return copy_map(object.toMap());
                        } else {
                            if (!Arrays.isArray(object)) {
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
            }
        }
    };
    var copy_map = function (dict) {
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
                if (Enum.isEnum(object)) {
                    return object.valueOf();
                } else {
                    if (Interface.conforms(object, Stringer)) {
                        return object.toString();
                    } else {
                        if (Interface.conforms(object, Mapper)) {
                            return deep_copy_map(object.toMap());
                        } else {
                            if (!Arrays.isArray(object)) {
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
            }
        }
    };
    var deep_copy_map = function (dict) {
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
})(MONKEY);
(function (ns) {
    var Interface = ns.type.Interface;
    var DataDigester = Interface(null, null);
    DataDigester.prototype.digest = function (data) {
        throw new Error("NotImplemented");
    };
    ns.digest.DataDigester = DataDigester;
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
})(MONKEY);
(function (ns) {
    var Interface = ns.type.Interface;
    var DataCoder = Interface(null, null);
    DataCoder.prototype.encode = function (data) {
        throw new Error("NotImplemented");
    };
    DataCoder.prototype.decode = function (string) {
        throw new Error("NotImplemented");
    };
    var ObjectCoder = Interface(null, null);
    ObjectCoder.prototype.encode = function (object) {
        throw new Error("NotImplemented");
    };
    ObjectCoder.prototype.decode = function (string) {
        throw new Error("NotImplemented");
    };
    var StringCoder = Interface(null, null);
    StringCoder.prototype.encode = function (string) {
        throw new Error("NotImplemented");
    };
    StringCoder.prototype.decode = function (data) {
        throw new Error("NotImplemented");
    };
    ns.format.DataCoder = DataCoder;
    ns.format.ObjectCoder = ObjectCoder;
    ns.format.StringCoder = StringCoder;
})(MONKEY);
(function (ns) {
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
    var hexCoder = null;
    ns.format.Hex = Hex;
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
})(MONKEY);
(function (ns) {
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
    var jsonCoder = null;
    ns.format.JSON = JsON;
})(MONKEY);
(function (ns) {
    var Interface = ns.type.Interface;
    var Mapper = ns.type.Mapper;
    var CryptographyKey = Interface(null, [Mapper]);
    CryptographyKey.prototype.getAlgorithm = function () {
        throw new Error("NotImplemented");
    };
    CryptographyKey.prototype.getData = function () {
        throw new Error("NotImplemented");
    };
    var EncryptKey = Interface(null, [CryptographyKey]);
    EncryptKey.prototype.encrypt = function (plaintext) {
        throw new Error("NotImplemented");
    };
    var DecryptKey = Interface(null, [CryptographyKey]);
    DecryptKey.prototype.decrypt = function (ciphertext) {
        throw new Error("NotImplemented");
    };
    DecryptKey.prototype.match = function (pKey) {
        throw new Error("NotImplemented");
    };
    ns.crypto.CryptographyKey = CryptographyKey;
    ns.crypto.EncryptKey = EncryptKey;
    ns.crypto.DecryptKey = DecryptKey;
})(MONKEY);
(function (ns) {
    var Interface = ns.type.Interface;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = Interface(null, [CryptographyKey]);
    AsymmetricKey.RSA = "RSA";
    AsymmetricKey.ECC = "ECC";
    var SignKey = Interface(null, [AsymmetricKey]);
    SignKey.prototype.sign = function (data) {
        throw new Error("NotImplemented");
    };
    var VerifyKey = Interface(null, [AsymmetricKey]);
    VerifyKey.prototype.verify = function (data, signature) {
        throw new Error("NotImplemented");
    };
    VerifyKey.prototype.match = function (sKey) {
        throw new Error("NotImplemented");
    };
    ns.crypto.AsymmetricKey = AsymmetricKey;
    ns.crypto.SignKey = SignKey;
    ns.crypto.VerifyKey = VerifyKey;
})(MONKEY);
(function (ns) {
    var Interface = ns.type.Interface;
    var EncryptKey = ns.crypto.EncryptKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var SymmetricKey = Interface(null, [EncryptKey, DecryptKey]);
    SymmetricKey.AES = "AES";
    SymmetricKey.DES = "DES";
    var SymmetricKeyFactory = Interface(null, null);
    SymmetricKeyFactory.prototype.generateSymmetricKey = function () {
        throw new Error("NotImplemented");
    };
    SymmetricKeyFactory.prototype.parseSymmetricKey = function (key) {
        throw new Error("NotImplemented");
    };
    SymmetricKey.Factory = SymmetricKeyFactory;
    var general_factory = function () {
        var man = ns.crypto.FactoryManager;
        return man.generalFactory;
    };
    SymmetricKey.setFactory = function (algorithm, factory) {
        var gf = general_factory();
        gf.setSymmetricKeyFactory(algorithm, factory);
    };
    SymmetricKey.getFactory = function (algorithm) {
        var gf = general_factory();
        return gf.getSymmetricKeyFactory(algorithm);
    };
    SymmetricKey.generate = function (algorithm) {
        var gf = general_factory();
        return gf.generateSymmetricKey(algorithm);
    };
    SymmetricKey.parse = function (key) {
        var gf = general_factory();
        return gf.parseSymmetricKey(key);
    };
    ns.crypto.SymmetricKey = SymmetricKey;
})(MONKEY);
(function (ns) {
    var Interface = ns.type.Interface;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var VerifyKey = ns.crypto.VerifyKey;
    var PublicKey = Interface(null, [VerifyKey]);
    PublicKey.RSA = AsymmetricKey.RSA;
    PublicKey.ECC = AsymmetricKey.ECC;
    var PublicKeyFactory = Interface(null, null);
    PublicKeyFactory.prototype.parsePublicKey = function (key) {
        throw new Error("NotImplemented");
    };
    PublicKey.Factory = PublicKeyFactory;
    var general_factory = function () {
        var man = ns.crypto.FactoryManager;
        return man.generalFactory;
    };
    PublicKey.setFactory = function (algorithm, factory) {
        var gf = general_factory();
        gf.setPublicKeyFactory(algorithm, factory);
    };
    PublicKey.getFactory = function (algorithm) {
        var gf = general_factory();
        return gf.getPublicKeyFactory(algorithm);
    };
    PublicKey.parse = function (key) {
        var gf = general_factory();
        return gf.parsePublicKey(key);
    };
    ns.crypto.PublicKey = PublicKey;
})(MONKEY);
(function (ns) {
    var Interface = ns.type.Interface;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var SignKey = ns.crypto.SignKey;
    var PrivateKey = Interface(null, [SignKey]);
    PrivateKey.RSA = AsymmetricKey.RSA;
    PrivateKey.ECC = AsymmetricKey.ECC;
    PrivateKey.prototype.getPublicKey = function () {
        throw new Error("NotImplemented");
    };
    var PrivateKeyFactory = Interface(null, null);
    PrivateKeyFactory.prototype.generatePrivateKey = function () {
        throw new Error("NotImplemented");
    };
    PrivateKeyFactory.prototype.parsePrivateKey = function (key) {
        throw new Error("NotImplemented");
    };
    PrivateKey.Factory = PrivateKeyFactory;
    var general_factory = function () {
        var man = ns.crypto.FactoryManager;
        return man.generalFactory;
    };
    PrivateKey.setFactory = function (algorithm, factory) {
        var gf = general_factory();
        gf.setPrivateKeyFactory(algorithm, factory);
    };
    PrivateKey.getFactory = function (algorithm) {
        var gf = general_factory();
        return gf.getPrivateKeyFactory(algorithm);
    };
    PrivateKey.generate = function (algorithm) {
        var gf = general_factory();
        return gf.generatePrivateKey(algorithm);
    };
    PrivateKey.parse = function (key) {
        var gf = general_factory();
        return gf.parsePrivateKey(key);
    };
    ns.crypto.PrivateKey = PrivateKey;
})(MONKEY);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Wrapper = ns.type.Wrapper;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var promise = "Moky loves May Lee forever!";
    var get_promise = function () {
        if (typeof promise === "string") {
            promise = ns.format.UTF8.encode(promise);
        }
        return promise;
    };
    var GeneralFactory = function () {
        this.__symmetricKeyFactories = {};
        this.__publicKeyFactories = {};
        this.__privateKeyFactories = {};
    };
    Class(GeneralFactory, null, null, null);
    GeneralFactory.prototype.matchSignKey = function (sKey, pKey) {
        var data = get_promise();
        var signature = sKey.sign(data);
        return pKey.verify(data, signature);
    };
    GeneralFactory.prototype.matchEncryptKey = function (pKey, sKey) {
        var data = get_promise();
        var ciphertext = pKey.encrypt(data);
        var plaintext = sKey.decrypt(ciphertext);
        if (!plaintext || plaintext.length !== data.length) {
            return false;
        }
        for (var i = 0; i < data.length; ++i) {
            if (plaintext[i] !== data[i]) {
                return false;
            }
        }
        return true;
    };
    GeneralFactory.prototype.getAlgorithm = function (key) {
        return key["algorithm"];
    };
    GeneralFactory.prototype.setSymmetricKeyFactory = function (
        algorithm,
        factory
    ) {
        this.__symmetricKeyFactories[algorithm] = factory;
    };
    GeneralFactory.prototype.getSymmetricKeyFactory = function (algorithm) {
        return this.__symmetricKeyFactories[algorithm];
    };
    GeneralFactory.prototype.generateSymmetricKey = function (algorithm) {
        var factory = this.getSymmetricKeyFactory(algorithm);
        return factory.generateSymmetricKey();
    };
    GeneralFactory.prototype.parseSymmetricKey = function (key) {
        if (!key) {
            return null;
        } else {
            if (Interface.conforms(key, SymmetricKey)) {
                return key;
            }
        }
        var info = Wrapper.fetchMap(key);
        var algorithm = this.getAlgorithm(info);
        var factory = this.getSymmetricKeyFactory(algorithm);
        if (!factory) {
            factory = this.getSymmetricKeyFactory("*");
        }
        return factory.parseSymmetricKey(info);
    };
    GeneralFactory.prototype.setPrivateKeyFactory = function (
        algorithm,
        factory
    ) {
        this.__privateKeyFactories[algorithm] = factory;
    };
    GeneralFactory.prototype.getPrivateKeyFactory = function (algorithm) {
        return this.__privateKeyFactories[algorithm];
    };
    GeneralFactory.prototype.generatePrivateKey = function (algorithm) {
        var factory = this.getPrivateKeyFactory(algorithm);
        return factory.generatePrivateKey();
    };
    GeneralFactory.prototype.parsePrivateKey = function (key) {
        if (!key) {
            return null;
        } else {
            if (Interface.conforms(key, PrivateKey)) {
                return key;
            }
        }
        var info = Wrapper.fetchMap(key);
        var algorithm = this.getAlgorithm(info);
        var factory = this.getPrivateKeyFactory(algorithm);
        if (!factory) {
            factory = this.getPrivateKeyFactory("*");
        }
        return factory.parsePrivateKey(info);
    };
    GeneralFactory.prototype.setPublicKeyFactory = function (algorithm, factory) {
        this.__publicKeyFactories[algorithm] = factory;
    };
    GeneralFactory.prototype.getPublicKeyFactory = function (algorithm) {
        return this.__publicKeyFactories[algorithm];
    };
    GeneralFactory.prototype.parsePublicKey = function (key) {
        if (!key) {
            return null;
        } else {
            if (Interface.conforms(key, PublicKey)) {
                return key;
            }
        }
        var info = Wrapper.fetchMap(key);
        var algorithm = this.getAlgorithm(info);
        var factory = this.getPublicKeyFactory(algorithm);
        if (!factory) {
            factory = this.getPublicKeyFactory("*");
        }
        return factory.parsePublicKey(info);
    };
    var FactoryManager = { generalFactory: new GeneralFactory() };
    ns.crypto.GeneralFactory = GeneralFactory;
    ns.crypto.FactoryManager = FactoryManager;
})(MONKEY);
if (typeof MingKeMing !== "object") {
    MingKeMing = {};
}
(function (ns) {
    if (typeof ns.type !== "object") {
        ns.type = MONKEY.type;
    }
    if (typeof ns.format !== "object") {
        ns.format = MONKEY.format;
    }
    if (typeof ns.digest !== "object") {
        ns.digest = MONKEY.digest;
    }
    if (typeof ns.crypto !== "object") {
        ns.crypto = MONKEY.crypto;
    }
    if (typeof ns.protocol !== "object") {
        ns.protocol = {};
    }
    if (typeof ns.mkm !== "object") {
        ns.mkm = {};
    }
})(MingKeMing);
(function (ns) {
    var EntityType = ns.type.Enum(null, {
        USER: 0,
        GROUP: 1,
        STATION: 2,
        ISP: 3,
        BOT: 4,
        ICP: 5,
        SUPERVISOR: 6,
        COMPANY: 7,
        ANY: 128,
        EVERY: 129
    });
    EntityType.isUser = function (network) {
        var user = EntityType.USER.valueOf();
        var group = EntityType.GROUP.valueOf();
        return (network & group) === user;
    };
    EntityType.isGroup = function (network) {
        var group = EntityType.GROUP.valueOf();
        return (network & group) === group;
    };
    EntityType.isBroadcast = function (network) {
        var any = EntityType.ANY.valueOf();
        return (network & any) === any;
    };
    ns.protocol.EntityType = EntityType;
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
})(MingKeMing);
(function (ns) {
    var Interface = ns.type.Interface;
    var Stringer = ns.type.Stringer;
    var Address = Interface(null, [Stringer]);
    Address.ANYWHERE = null;
    Address.EVERYWHERE = null;
    Address.prototype.getType = function () {
        throw new Error("NotImplemented");
    };
    Address.prototype.isBroadcast = function () {
        throw new Error("NotImplemented");
    };
    Address.prototype.isUser = function () {
        throw new Error("NotImplemented");
    };
    Address.prototype.isGroup = function () {
        throw new Error("NotImplemented");
    };
    var AddressFactory = Interface(null, null);
    AddressFactory.prototype.generateAddress = function (meta, network) {
        throw new Error("NotImplemented");
    };
    AddressFactory.prototype.createAddress = function (address) {
        throw new Error("NotImplemented");
    };
    AddressFactory.prototype.parseAddress = function (address) {
        throw new Error("NotImplemented");
    };
    Address.Factory = AddressFactory;
    var general_factory = function () {
        var man = ns.mkm.FactoryManager;
        return man.generalFactory;
    };
    Address.setFactory = function (factory) {
        var gf = general_factory();
        gf.setAddressFactory(factory);
    };
    Address.getFactory = function () {
        var gf = general_factory();
        return gf.getAddressFactory();
    };
    Address.generate = function (meta, network) {
        var gf = general_factory();
        return gf.generateAddress(meta, network);
    };
    Address.create = function (address) {
        var gf = general_factory();
        return gf.createAddress(address);
    };
    Address.parse = function (address) {
        var gf = general_factory();
        return gf.parseAddress(address);
    };
    ns.protocol.Address = Address;
})(MingKeMing);
(function (ns) {
    var Interface = ns.type.Interface;
    var Stringer = ns.type.Stringer;
    var Address = ns.protocol.Address;
    var ID = Interface(null, [Stringer]);
    ID.ANYONE = null;
    ID.EVERYONE = null;
    ID.FOUNDER = null;
    ID.prototype.getName = function () {
        throw new Error("NotImplemented");
    };
    ID.prototype.getAddress = function () {
        throw new Error("NotImplemented");
    };
    ID.prototype.getTerminal = function () {
        throw new Error("NotImplemented");
    };
    ID.prototype.getType = function () {
        throw new Error("NotImplemented");
    };
    ID.prototype.isBroadcast = function () {
        throw new Error("NotImplemented");
    };
    ID.prototype.isUser = function () {
        throw new Error("NotImplemented");
    };
    ID.prototype.isGroup = function () {
        throw new Error("NotImplemented");
    };
    ID.convert = function (list) {
        var gf = general_factory();
        return gf.convertIDList(list);
    };
    ID.revert = function (list) {
        var gf = general_factory();
        return gf.revertIDList(list);
    };
    var IDFactory = Interface(null, null);
    IDFactory.prototype.generateID = function (meta, network, terminal) {
        throw new Error("NotImplemented");
    };
    IDFactory.prototype.createID = function (name, address, terminal) {
        throw new Error("NotImplemented");
    };
    IDFactory.prototype.parseID = function (identifier) {
        throw new Error("NotImplemented");
    };
    ID.Factory = IDFactory;
    var general_factory = function () {
        var man = ns.mkm.FactoryManager;
        return man.generalFactory;
    };
    ID.setFactory = function (factory) {
        var gf = general_factory();
        gf.setIDFactory(factory);
    };
    ID.getFactory = function () {
        var gf = general_factory();
        return gf.getIDFactory();
    };
    ID.generate = function (meta, network, terminal) {
        var gf = general_factory();
        return gf.generateID(meta, network, terminal);
    };
    ID.create = function (name, address, terminal) {
        var gf = general_factory();
        return gf.createID(name, address, terminal);
    };
    ID.parse = function (identifier) {
        var gf = general_factory();
        return gf.parseID(identifier);
    };
    ns.protocol.ID = ID;
})(MingKeMing);
(function (ns) {
    var Interface = ns.type.Interface;
    var Mapper = ns.type.Mapper;
    var PublicKey = ns.crypto.PublicKey;
    var Address = ns.protocol.Address;
    var MetaType = ns.protocol.MetaType;
    var ID = ns.protocol.ID;
    var Meta = Interface(null, [Mapper]);
    Meta.prototype.getType = function () {
        throw new Error("NotImplemented");
    };
    Meta.prototype.getKey = function () {
        throw new Error("NotImplemented");
    };
    Meta.prototype.getSeed = function () {
        throw new Error("NotImplemented");
    };
    Meta.prototype.getFingerprint = function () {
        throw new Error("NotImplemented");
    };
    Meta.prototype.generateAddress = function (network) {
        throw new Error("NotImplemented");
    };
    Meta.check = function (meta) {
        var gf = general_factory();
        return gf.checkMeta(meta);
    };
    Meta.matchID = function (identifier, meta) {
        var gf = general_factory();
        return gf.matchID(identifier, meta);
    };
    Meta.matchKey = function (key, meta) {
        var gf = general_factory();
        return gf.matchKey(key, meta);
    };
    var MetaFactory = Interface(null, null);
    MetaFactory.prototype.createMeta = function (pKey, seed, fingerprint) {
        throw new Error("NotImplemented");
    };
    MetaFactory.prototype.generateMeta = function (sKey, seed) {
        throw new Error("NotImplemented");
    };
    MetaFactory.prototype.parseMeta = function (meta) {
        throw new Error("NotImplemented");
    };
    Meta.Factory = MetaFactory;
    var general_factory = function () {
        var man = ns.mkm.FactoryManager;
        return man.generalFactory;
    };
    Meta.setFactory = function (version, factory) {
        var gf = general_factory();
        gf.setMetaFactory(version, factory);
    };
    Meta.getFactory = function (version) {
        var gf = general_factory();
        return gf.getMetaFactory(version);
    };
    Meta.create = function (version, key, seed, fingerprint) {
        var gf = general_factory();
        return gf.createMeta(version, key, seed, fingerprint);
    };
    Meta.generate = function (version, sKey, seed) {
        var gf = general_factory();
        return gf.generateMeta(version, sKey, seed);
    };
    Meta.parse = function (meta) {
        var gf = general_factory();
        return gf.parseMeta(meta);
    };
    ns.protocol.Meta = Meta;
})(MingKeMing);
(function (ns) {
    var Interface = ns.type.Interface;
    var TAI = Interface(null, null);
    TAI.prototype.isValid = function () {
        throw new Error("NotImplemented");
    };
    TAI.prototype.verify = function (publicKey) {
        throw new Error("NotImplemented");
    };
    TAI.prototype.sign = function (privateKey) {
        throw new Error("NotImplemented");
    };
    TAI.prototype.allProperties = function () {
        throw new Error("NotImplemented");
    };
    TAI.prototype.getProperty = function (name) {
        throw new Error("NotImplemented");
    };
    TAI.prototype.setProperty = function (name, value) {
        throw new Error("NotImplemented");
    };
    ns.protocol.TAI = TAI;
})(MingKeMing);
(function (ns) {
    var Interface = ns.type.Interface;
    var Mapper = ns.type.Mapper;
    var TAI = ns.protocol.TAI;
    var ID = ns.protocol.ID;
    var Document = Interface(null, [TAI, Mapper]);
    Document.VISA = "visa";
    Document.PROFILE = "profile";
    Document.BULLETIN = "bulletin";
    Document.prototype.getType = function () {
        throw new Error("NotImplemented");
    };
    Document.prototype.getIdentifier = function () {
        throw new Error("NotImplemented");
    };
    Document.prototype.getTime = function () {
        throw new Error("NotImplemented");
    };
    Document.prototype.getName = function () {
        throw new Error("NotImplemented");
    };
    Document.prototype.setName = function (name) {
        throw new Error("NotImplemented");
    };
    var DocumentFactory = Interface(null, null);
    DocumentFactory.prototype.createDocument = function (
        identifier,
        data,
        signature
    ) {
        throw new Error("NotImplemented");
    };
    DocumentFactory.prototype.parseDocument = function (doc) {
        throw new Error("NotImplemented");
    };
    Document.Factory = DocumentFactory;
    var general_factory = function () {
        var man = ns.mkm.FactoryManager;
        return man.generalFactory;
    };
    Document.setFactory = function (type, factory) {
        var gf = general_factory();
        gf.setDocumentFactory(type, factory);
    };
    Document.getFactory = function (type) {
        var gf = general_factory();
        return gf.getDocumentFactory(type);
    };
    Document.create = function (type, identifier, data, signature) {
        var gf = general_factory();
        return gf.createDocument(type, identifier, data, signature);
    };
    Document.parse = function (doc) {
        var gf = general_factory();
        return gf.parseDocument(doc);
    };
    ns.protocol.Document = Document;
})(MingKeMing);
(function (ns) {
    var Interface = ns.type.Interface;
    var Document = ns.protocol.Document;
    var Visa = Interface(null, [Document]);
    Visa.prototype.getKey = function () {
        throw new Error("NotImplemented");
    };
    Visa.prototype.setKey = function (publicKey) {
        throw new Error("NotImplemented");
    };
    Visa.prototype.getAvatar = function () {
        throw new Error("NotImplemented");
    };
    Visa.prototype.setAvatar = function (url) {
        throw new Error("NotImplemented");
    };
    var Bulletin = Interface(null, [Document]);
    Bulletin.prototype.getAssistants = function () {
        throw new Error("NotImplemented");
    };
    Bulletin.prototype.setAssistants = function (assistants) {
        throw new Error("NotImplemented");
    };
    ns.protocol.Visa = Visa;
    ns.protocol.Bulletin = Bulletin;
})(MingKeMing);
(function (ns) {
    var Class = ns.type.Class;
    var ConstantString = ns.type.ConstantString;
    var EntityType = ns.protocol.EntityType;
    var Address = ns.protocol.Address;
    var BroadcastAddress = function (string, network) {
        ConstantString.call(this, string);
        if (network instanceof EntityType) {
            network = network.valueOf();
        }
        this.__network = network;
    };
    Class(BroadcastAddress, ConstantString, [Address], null);
    BroadcastAddress.prototype.getType = function () {
        return this.__network;
    };
    BroadcastAddress.prototype.isBroadcast = function () {
        return true;
    };
    BroadcastAddress.prototype.isUser = function () {
        var any = EntityType.ANY.valueOf();
        return this.__network === any;
    };
    BroadcastAddress.prototype.isGroup = function () {
        var every = EntityType.EVERY.valueOf();
        return this.__network === every;
    };
    Address.ANYWHERE = new BroadcastAddress("anywhere", EntityType.ANY);
    Address.EVERYWHERE = new BroadcastAddress("everywhere", EntityType.EVERY);
    ns.mkm.BroadcastAddress = BroadcastAddress;
})(MingKeMing);
(function (ns) {
    var Class = ns.type.Class;
    var ConstantString = ns.type.ConstantString;
    var ID = ns.protocol.ID;
    var Address = ns.protocol.Address;
    var Identifier = function (identifier, name, address, terminal) {
        ConstantString.call(this, identifier);
        this.__name = name;
        this.__address = address;
        this.__terminal = terminal;
    };
    Class(Identifier, ConstantString, [ID], null);
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
        return this.getAddress().getType();
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
    ID.ANYONE = new Identifier(
        "anyone@anywhere",
        "anyone",
        Address.ANYWHERE,
        null
    );
    ID.EVERYONE = new Identifier(
        "everyone@everywhere",
        "everyone",
        Address.EVERYWHERE,
        null
    );
    ID.FOUNDER = new Identifier("moky@anywhere", "moky", Address.ANYWHERE, null);
    ns.mkm.Identifier = Identifier;
})(MingKeMing);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Stringer = ns.type.Stringer;
    var Wrapper = ns.type.Wrapper;
    var UTF8 = ns.format.UTF8;
    var Address = ns.protocol.Address;
    var ID = ns.protocol.ID;
    var MetaType = ns.protocol.MetaType;
    var Meta = ns.protocol.Meta;
    var Document = ns.protocol.Document;
    var GeneralFactory = function () {
        this.__addressFactory = null;
        this.__idFactory = null;
        this.__metaFactories = {};
        this.__documentFactories = {};
    };
    Class(GeneralFactory, null, null, null);
    GeneralFactory.prototype.setAddressFactory = function (factory) {
        this.__addressFactory = factory;
    };
    GeneralFactory.prototype.getAddressFactory = function () {
        return this.__addressFactory;
    };
    GeneralFactory.prototype.parseAddress = function (address) {
        if (!address) {
            return null;
        } else {
            if (Interface.conforms(address, Address)) {
                return address;
            }
        }
        address = Wrapper.fetchString(address);
        var factory = this.getAddressFactory();
        return factory.parseAddress(address);
    };
    GeneralFactory.prototype.createAddress = function (address) {
        var factory = this.getAddressFactory();
        return factory.createAddress(address);
    };
    GeneralFactory.prototype.generateAddress = function (meta, network) {
        var factory = this.getAddressFactory();
        return factory.generateAddress(meta, network);
    };
    GeneralFactory.prototype.setIDFactory = function (factory) {
        this.__idFactory = factory;
    };
    GeneralFactory.prototype.getIDFactory = function () {
        return this.__idFactory;
    };
    GeneralFactory.prototype.parseID = function (identifier) {
        if (!identifier) {
            return null;
        } else {
            if (Interface.conforms(identifier, ID)) {
                return identifier;
            }
        }
        identifier = Wrapper.fetchString(identifier);
        var factory = this.getIDFactory();
        return factory.parseID(identifier);
    };
    GeneralFactory.prototype.createID = function (name, address, terminal) {
        var factory = this.getIDFactory();
        return factory.createID(name, address, terminal);
    };
    GeneralFactory.prototype.generateID = function (meta, network, terminal) {
        var factory = this.getIDFactory();
        return factory.generateID(meta, network, terminal);
    };
    GeneralFactory.prototype.convertIDList = function (list) {
        var array = [];
        var id;
        for (var i = 0; i < list.length; ++i) {
            id = ID.parse(list[i]);
            if (id) {
                array.push(id);
            }
        }
        return array;
    };
    GeneralFactory.prototype.revertIDList = function (list) {
        var array = [];
        var id;
        for (var i = 0; i < list.length; ++i) {
            id = list[i];
            if (Interface.conforms(id, Stringer)) {
                array.push(id.toString());
            } else {
                if (typeof id === "string") {
                    array.push(id);
                }
            }
        }
        return array;
    };
    var EnumToUint = function (type) {
        if (typeof type === "number") {
            return type;
        } else {
            return type.valueOf();
        }
    };
    GeneralFactory.prototype.setMetaFactory = function (version, factory) {
        version = EnumToUint(version);
        this.__metaFactories[version] = factory;
    };
    GeneralFactory.prototype.getMetaFactory = function (version) {
        version = EnumToUint(version);
        return this.__metaFactories[version];
    };
    GeneralFactory.prototype.getMetaType = function (meta) {
        return meta["type"];
    };
    GeneralFactory.prototype.createMeta = function (
        version,
        key,
        seed,
        fingerprint
    ) {
        var factory = this.getMetaFactory(version);
        return factory.createMeta(key, seed, fingerprint);
    };
    GeneralFactory.prototype.generateMeta = function (version, sKey, seed) {
        var factory = this.getMetaFactory(version);
        return factory.generateMeta(sKey, seed);
    };
    GeneralFactory.prototype.parseMeta = function (meta) {
        if (!meta) {
            return null;
        } else {
            if (Interface.conforms(meta, Meta)) {
                return meta;
            }
        }
        meta = Wrapper.fetchMap(meta);
        var type = this.getMetaType(meta);
        var factory = this.getMetaFactory(type);
        if (!factory) {
            factory = this.getMetaFactory(0);
        }
        return factory.parseMeta(meta);
    };
    GeneralFactory.prototype.checkMeta = function (meta) {
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
    GeneralFactory.prototype.matchID = function (identifier, meta) {
        if (MetaType.hasSeed(meta.getType())) {
            if (meta.getSeed() !== identifier.getName()) {
                return false;
            }
        }
        var old = identifier.getAddress();
        var gen = Address.generate(meta, old.getType());
        return old.equals(gen);
    };
    GeneralFactory.prototype.matchKey = function (key, meta) {
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
    GeneralFactory.prototype.setDocumentFactory = function (type, factory) {
        this.__documentFactories[type] = factory;
    };
    GeneralFactory.prototype.getDocumentFactory = function (type) {
        return this.__documentFactories[type];
    };
    GeneralFactory.prototype.getDocumentType = function (doc) {
        return doc["type"];
    };
    GeneralFactory.prototype.createDocument = function (
        type,
        identifier,
        data,
        signature
    ) {
        var factory = this.getDocumentFactory(type);
        return factory.createDocument(identifier, data, signature);
    };
    GeneralFactory.prototype.parseDocument = function (doc) {
        if (!doc) {
            return null;
        } else {
            if (Interface.conforms(doc, Document)) {
                return doc;
            }
        }
        doc = Wrapper.fetchMap(doc);
        var type = this.getDocumentType(doc);
        var factory = this.getDocumentFactory(type);
        if (!factory) {
            factory = this.getDocumentFactory("*");
        }
        return factory.parseDocument(doc);
    };
    var FactoryManager = { generalFactory: new GeneralFactory() };
    ns.mkm.GeneralFactory = GeneralFactory;
    ns.mkm.FactoryManager = FactoryManager;
})(MingKeMing);
if (typeof DaoKeDao !== "object") {
    DaoKeDao = {};
}
(function (ns) {
    if (typeof ns.type !== "object") {
        ns.type = MONKEY.type;
    }
    if (typeof ns.format !== "object") {
        ns.format = MONKEY.format;
    }
    if (typeof ns.digest !== "object") {
        ns.digest = MONKEY.digest;
    }
    if (typeof ns.crypto !== "object") {
        ns.crypto = MONKEY.crypto;
    }
    if (typeof ns.protocol !== "object") {
        ns.protocol = MingKeMing.protocol;
    }
    if (typeof ns.mkm !== "object") {
        ns.mkm = MingKeMing.mkm;
    }
    if (typeof ns.dkd !== "object") {
        ns.dkd = {};
    }
})(DaoKeDao);
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
        ARRAY: 202,
        CUSTOMIZED: 204,
        FORWARD: 255
    });
    ns.protocol.ContentType = ContentType;
})(DaoKeDao);
(function (ns) {
    var Interface = ns.type.Interface;
    var Mapper = ns.type.Mapper;
    var Content = Interface(null, [Mapper]);
    Content.prototype.getType = function () {
        throw new Error("NotImplemented");
    };
    Content.prototype.getSerialNumber = function () {
        throw new Error("NotImplemented");
    };
    Content.prototype.getTime = function () {
        throw new Error("NotImplemented");
    };
    Content.prototype.getGroup = function () {
        throw new Error("NotImplemented");
    };
    Content.prototype.setGroup = function (identifier) {
        throw new Error("NotImplemented");
    };
    var ContentFactory = Interface(null, null);
    ContentFactory.prototype.parseContent = function (content) {
        throw new Error("NotImplemented");
    };
    Content.Factory = ContentFactory;
    var general_factory = function () {
        var man = ns.dkd.FactoryManager;
        return man.generalFactory;
    };
    Content.setFactory = function (type, factory) {
        var gf = general_factory();
        gf.setContentFactory(type, factory);
    };
    Content.getFactory = function (type) {
        var gf = general_factory();
        return gf.getContentFactory(type);
    };
    Content.parse = function (content) {
        var gf = general_factory();
        return gf.parseContent(content);
    };
    ns.protocol.Content = Content;
})(DaoKeDao);
(function (ns) {
    var Interface = ns.type.Interface;
    var Mapper = ns.type.Mapper;
    var Envelope = Interface(null, [Mapper]);
    Envelope.prototype.getSender = function () {
        throw new Error("NotImplemented");
    };
    Envelope.prototype.getReceiver = function () {
        throw new Error("NotImplemented");
    };
    Envelope.prototype.getTime = function () {
        throw new Error("NotImplemented");
    };
    Envelope.prototype.getGroup = function () {
        throw new Error("NotImplemented");
    };
    Envelope.prototype.setGroup = function (identifier) {
        throw new Error("NotImplemented");
    };
    Envelope.prototype.getType = function () {
        throw new Error("NotImplemented");
    };
    Envelope.prototype.setType = function (type) {
        throw new Error("NotImplemented");
    };
    var EnvelopeFactory = Interface(null, null);
    EnvelopeFactory.prototype.createEnvelope = function (from, to, when) {
        throw new Error("NotImplemented");
    };
    EnvelopeFactory.prototype.parseEnvelope = function (env) {
        throw new Error("NotImplemented");
    };
    Envelope.Factory = EnvelopeFactory;
    var general_factory = function () {
        var man = ns.dkd.FactoryManager;
        return man.generalFactory;
    };
    Envelope.getFactory = function () {
        var gf = general_factory();
        return gf.getEnvelopeFactory();
    };
    Envelope.setFactory = function (factory) {
        var gf = general_factory();
        gf.setEnvelopeFactory(factory);
    };
    Envelope.create = function (from, to, when) {
        var gf = general_factory();
        return gf.createEnvelope(from, to, when);
    };
    Envelope.parse = function (env) {
        var gf = general_factory();
        return gf.parseEnvelope(env);
    };
    ns.protocol.Envelope = Envelope;
})(DaoKeDao);
(function (ns) {
    var Interface = ns.type.Interface;
    var Mapper = ns.type.Mapper;
    var Message = Interface(null, [Mapper]);
    Message.prototype.getDelegate = function () {
        throw new Error("NotImplemented");
    };
    Message.prototype.setDelegate = function (delegate) {
        throw new Error("NotImplemented");
    };
    Message.prototype.getEnvelope = function () {
        throw new Error("NotImplemented");
    };
    Message.prototype.getSender = function () {
        throw new Error("NotImplemented");
    };
    Message.prototype.getReceiver = function () {
        throw new Error("NotImplemented");
    };
    Message.prototype.getTime = function () {
        throw new Error("NotImplemented");
    };
    Message.prototype.getGroup = function () {
        throw new Error("NotImplemented");
    };
    Message.prototype.getType = function () {
        throw new Error("NotImplemented");
    };
    var MessageDelegate = Interface(null, null);
    Message.Delegate = MessageDelegate;
    ns.protocol.Message = Message;
})(DaoKeDao);
(function (ns) {
    var Interface = ns.type.Interface;
    var Message = ns.protocol.Message;
    var InstantMessage = Interface(null, [Message]);
    InstantMessage.prototype.getContent = function () {
        throw new Error("NotImplemented");
    };
    InstantMessage.prototype.encrypt = function (password, members) {
        throw new Error("NotImplemented");
    };
    var InstantMessageDelegate = Interface(null, [Message.Delegate]);
    InstantMessageDelegate.prototype.serializeContent = function (
        content,
        pwd,
        iMsg
    ) {
        throw new Error("NotImplemented");
    };
    InstantMessageDelegate.prototype.encryptContent = function (data, pwd, iMsg) {
        throw new Error("NotImplemented");
    };
    InstantMessageDelegate.prototype.encodeData = function (data, iMsg) {
        throw new Error("NotImplemented");
    };
    InstantMessageDelegate.prototype.serializeKey = function (pwd, iMsg) {
        throw new Error("NotImplemented");
    };
    InstantMessageDelegate.prototype.encryptKey = function (
        data,
        receiver,
        iMsg
    ) {
        throw new Error("NotImplemented");
    };
    InstantMessageDelegate.prototype.encodeKey = function (data, iMsg) {
        throw new Error("NotImplemented");
    };
    InstantMessage.Delegate = InstantMessageDelegate;
    var InstantMessageFactory = Interface(null, null);
    InstantMessageFactory.prototype.generateSerialNumber = function (
        msgType,
        now
    ) {
        throw new Error("NotImplemented");
    };
    InstantMessageFactory.prototype.createInstantMessage = function (head, body) {
        throw new Error("NotImplemented");
    };
    InstantMessageFactory.prototype.parseInstantMessage = function (msg) {
        throw new Error("NotImplemented");
    };
    InstantMessage.Factory = InstantMessageFactory;
    var general_factory = function () {
        var man = ns.dkd.FactoryManager;
        return man.generalFactory;
    };
    InstantMessage.getFactory = function () {
        var gf = general_factory();
        return gf.getInstantMessageFactory();
    };
    InstantMessage.setFactory = function (factory) {
        var gf = general_factory();
        gf.setInstantMessageFactory(factory);
    };
    InstantMessage.generateSerialNumber = function (type, now) {
        var gf = general_factory();
        return gf.generateSerialNumber(type, now);
    };
    InstantMessage.create = function (head, body) {
        var gf = general_factory();
        return gf.createInstantMessage(head, body);
    };
    InstantMessage.parse = function (msg) {
        var gf = general_factory();
        return gf.parseInstantMessage(msg);
    };
    ns.protocol.InstantMessage = InstantMessage;
})(DaoKeDao);
(function (ns) {
    var Interface = ns.type.Interface;
    var Message = ns.protocol.Message;
    var SecureMessage = Interface(null, [Message]);
    SecureMessage.prototype.getData = function () {
        throw new Error("NotImplemented");
    };
    SecureMessage.prototype.getEncryptedKey = function () {
        throw new Error("NotImplemented");
    };
    SecureMessage.prototype.getEncryptedKeys = function () {
        throw new Error("NotImplemented");
    };
    SecureMessage.prototype.decrypt = function () {
        throw new Error("NotImplemented");
    };
    SecureMessage.prototype.sign = function () {
        throw new Error("NotImplemented");
    };
    SecureMessage.prototype.split = function (members) {
        throw new Error("NotImplemented");
    };
    SecureMessage.prototype.trim = function (member) {
        throw new Error("NotImplemented");
    };
    var SecureMessageDelegate = Interface(null, [Message.Delegate]);
    SecureMessageDelegate.prototype.decodeKey = function (key, sMsg) {
        throw new Error("NotImplemented");
    };
    SecureMessageDelegate.prototype.decryptKey = function (
        data,
        sender,
        receiver,
        sMsg
    ) {
        throw new Error("NotImplemented");
    };
    SecureMessageDelegate.prototype.deserializeKey = function (
        data,
        sender,
        receiver,
        sMsg
    ) {
        throw new Error("NotImplemented");
    };
    SecureMessageDelegate.prototype.decodeData = function (data, sMsg) {
        throw new Error("NotImplemented");
    };
    SecureMessageDelegate.prototype.decryptContent = function (data, pwd, sMsg) {
        throw new Error("NotImplemented");
    };
    SecureMessageDelegate.prototype.deserializeContent = function (
        data,
        pwd,
        sMsg
    ) {
        throw new Error("NotImplemented");
    };
    SecureMessageDelegate.prototype.signData = function (data, sender, sMsg) {
        throw new Error("NotImplemented");
    };
    SecureMessageDelegate.prototype.encodeSignature = function (signature, sMsg) {
        throw new Error("NotImplemented");
    };
    SecureMessage.Delegate = SecureMessageDelegate;
    var SecureMessageFactory = Interface(null, null);
    SecureMessageFactory.prototype.parseSecureMessage = function (msg) {
        throw new Error("NotImplemented");
    };
    SecureMessage.Factory = SecureMessageFactory;
    var general_factory = function () {
        var man = ns.dkd.FactoryManager;
        return man.generalFactory;
    };
    SecureMessage.getFactory = function () {
        var gf = general_factory();
        return gf.getSecureMessageFactory();
    };
    SecureMessage.setFactory = function (factory) {
        var gf = general_factory();
        gf.setSecureMessageFactory(factory);
    };
    SecureMessage.parse = function (msg) {
        var gf = general_factory();
        return gf.parseSecureMessage(msg);
    };
    ns.protocol.SecureMessage = SecureMessage;
})(DaoKeDao);
(function (ns) {
    var Interface = ns.type.Interface;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = Interface(null, [SecureMessage]);
    ReliableMessage.prototype.getSignature = function () {
        throw new Error("NotImplemented");
    };
    ReliableMessage.prototype.getMeta = function () {
        throw new Error("NotImplemented");
    };
    ReliableMessage.prototype.setMeta = function (meta) {
        throw new Error("NotImplemented");
    };
    ReliableMessage.prototype.getVisa = function () {
        throw new Error("NotImplemented");
    };
    ReliableMessage.prototype.setVisa = function (doc) {
        throw new Error("NotImplemented");
    };
    ReliableMessage.prototype.verify = function () {
        throw new Error("NotImplemented");
    };
    var ReliableMessageDelegate = Interface(null, [SecureMessage.Delegate]);
    ReliableMessageDelegate.prototype.decodeSignature = function (
        signature,
        rMsg
    ) {
        throw new Error("NotImplemented");
    };
    ReliableMessageDelegate.prototype.verifyDataSignature = function (
        data,
        signature,
        sender,
        rMsg
    ) {
        throw new Error("NotImplemented");
    };
    ReliableMessage.Delegate = ReliableMessageDelegate;
    var ReliableMessageFactory = Interface(null, null);
    ReliableMessageFactory.prototype.parseReliableMessage = function (msg) {
        throw new Error("NotImplemented");
    };
    ReliableMessage.Factory = ReliableMessageFactory;
    var general_factory = function () {
        var man = ns.dkd.FactoryManager;
        return man.generalFactory;
    };
    ReliableMessage.getFactory = function () {
        var gf = general_factory();
        return gf.getReliableMessageFactory();
    };
    ReliableMessage.setFactory = function (factory) {
        var gf = general_factory();
        gf.setReliableMessageFactory(factory);
    };
    ReliableMessage.parse = function (msg) {
        var gf = general_factory();
        return gf.parseReliableMessage(msg);
    };
    ns.protocol.ReliableMessage = ReliableMessage;
})(DaoKeDao);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Wrapper = ns.type.Wrapper;
    var Content = ns.protocol.Content;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var GeneralFactory = function () {
        this.__contentFactories = {};
        this.__envelopeFactory = null;
        this.__instantMessageFactory = null;
        this.__secureMessageFactory = null;
        this.__reliableMessageFactory = null;
    };
    Class(GeneralFactory, null, null, null);
    var EnumToUint = function (type) {
        if (typeof type === "number") {
            return type;
        } else {
            return type.valueOf();
        }
    };
    GeneralFactory.prototype.setContentFactory = function (type, factory) {
        type = EnumToUint(type);
        this.__contentFactories[type] = factory;
    };
    GeneralFactory.prototype.getContentFactory = function (type) {
        type = EnumToUint(type);
        return this.__contentFactories[type];
    };
    GeneralFactory.prototype.getContentType = function (content) {
        return content["type"];
    };
    GeneralFactory.prototype.parseContent = function (content) {
        if (!content) {
            return null;
        } else {
            if (Interface.conforms(content, Content)) {
                return content;
            }
        }
        content = Wrapper.fetchMap(content);
        var type = this.getContentType(content);
        var factory = this.getContentFactory(type);
        if (!factory) {
            factory = this.getContentFactory(0);
        }
        return factory.parseContent(content);
    };
    GeneralFactory.prototype.setEnvelopeFactory = function (factory) {
        this.__envelopeFactory = factory;
    };
    GeneralFactory.prototype.getEnvelopeFactory = function () {
        return this.__envelopeFactory;
    };
    GeneralFactory.prototype.createEnvelope = function (from, to, when) {
        var factory = this.getEnvelopeFactory();
        return factory.createEnvelope(from, to, when);
    };
    GeneralFactory.prototype.parseEnvelope = function (env) {
        if (!env) {
            return null;
        } else {
            if (Interface.conforms(env, Envelope)) {
                return env;
            }
        }
        env = Wrapper.fetchMap(env);
        var factory = this.getEnvelopeFactory();
        return factory.parseEnvelope(env);
    };
    GeneralFactory.prototype.setInstantMessageFactory = function (factory) {
        this.__instantMessageFactory = factory;
    };
    GeneralFactory.prototype.getInstantMessageFactory = function () {
        return this.__instantMessageFactory;
    };
    GeneralFactory.prototype.createInstantMessage = function (head, body) {
        var factory = this.getInstantMessageFactory();
        return factory.createInstantMessage(head, body);
    };
    GeneralFactory.prototype.parseInstantMessage = function (msg) {
        if (!msg) {
            return null;
        } else {
            if (Interface.conforms(msg, InstantMessage)) {
                return msg;
            }
        }
        msg = Wrapper.fetchMap(msg);
        var factory = this.getInstantMessageFactory();
        return factory.parseInstantMessage(msg);
    };
    GeneralFactory.prototype.generateSerialNumber = function (type, now) {
        var factory = this.getInstantMessageFactory();
        return factory.generateSerialNumber(type, now);
    };
    GeneralFactory.prototype.setSecureMessageFactory = function (factory) {
        this.__secureMessageFactory = factory;
    };
    GeneralFactory.prototype.getSecureMessageFactory = function () {
        return this.__secureMessageFactory;
    };
    GeneralFactory.prototype.parseSecureMessage = function (msg) {
        if (!msg) {
            return null;
        } else {
            if (Interface.conforms(msg, SecureMessage)) {
                return msg;
            }
        }
        msg = Wrapper.fetchMap(msg);
        var factory = this.getSecureMessageFactory();
        return factory.parseSecureMessage(msg);
    };
    GeneralFactory.prototype.setReliableMessageFactory = function (factory) {
        this.__reliableMessageFactory = factory;
    };
    GeneralFactory.prototype.getReliableMessageFactory = function () {
        return this.__reliableMessageFactory;
    };
    GeneralFactory.prototype.parseReliableMessage = function (msg) {
        if (!msg) {
            return null;
        } else {
            if (Interface.conforms(msg, ReliableMessage)) {
                return msg;
            }
        }
        msg = Wrapper.fetchMap(msg);
        var factory = this.getReliableMessageFactory();
        return factory.parseReliableMessage(msg);
    };
    var FactoryManager = { generalFactory: new GeneralFactory() };
    ns.dkd.GeneralFactory = GeneralFactory;
    ns.dkd.FactoryManager = FactoryManager;
})(DaoKeDao);
if (typeof DIMP !== "object") {
    DIMP = {};
}
(function (ns) {
    if (typeof ns.type !== "object") {
        ns.type = MONKEY.type;
    }
    if (typeof ns.format !== "object") {
        ns.format = MONKEY.format;
    }
    if (typeof ns.digest !== "object") {
        ns.digest = MONKEY.digest;
    }
    if (typeof ns.crypto !== "object") {
        ns.crypto = MONKEY.crypto;
    }
    if (typeof ns.protocol !== "object") {
        ns.protocol = MingKeMing.protocol;
    }
    if (typeof ns.mkm !== "object") {
        ns.mkm = MingKeMing.mkm;
    }
    if (typeof ns.dkd !== "object") {
        ns.dkd = DaoKeDao.dkd;
    }
    if (typeof ns.protocol.group !== "object") {
        ns.protocol.group = {};
    }
    if (typeof ns.dkd.cmd !== "object") {
        ns.dkd.cmd = {};
    }
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Content = ns.protocol.Content;
    var TextContent = Interface(null, [Content]);
    TextContent.prototype.setText = function (text) {
        throw new Error("NotImplemented");
    };
    TextContent.prototype.getText = function () {
        throw new Error("NotImplemented");
    };
    TextContent.create = function (text) {
        return new ns.dkd.BaseTextContent(text);
    };
    ns.protocol.TextContent = TextContent;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Content = ns.protocol.Content;
    var FileContent = Interface(null, [Content]);
    FileContent.prototype.setURL = function (url) {
        throw new Error("NotImplemented");
    };
    FileContent.prototype.getURL = function () {
        throw new Error("NotImplemented");
    };
    FileContent.prototype.getFilename = function () {
        throw new Error("NotImplemented");
    };
    FileContent.prototype.setFilename = function (filename) {
        throw new Error("NotImplemented");
    };
    FileContent.prototype.getData = function () {
        throw new Error("NotImplemented");
    };
    FileContent.prototype.setData = function (data) {
        throw new Error("NotImplemented");
    };
    FileContent.prototype.setPassword = function (key) {
        throw new Error("NotImplemented");
    };
    FileContent.prototype.getPassword = function () {
        throw new Error("NotImplemented");
    };
    FileContent.file = function (filename, data) {
        return new ns.dkd.BaseFileContent(filename, data);
    };
    FileContent.image = function (filename, data) {
        return new ns.dkd.ImageFileContent(filename, data);
    };
    FileContent.audio = function (filename, data) {
        return new ns.dkd.AudioFileContent(filename, data);
    };
    FileContent.video = function (filename, data) {
        return new ns.dkd.VideoFileContent(filename, data);
    };
    ns.protocol.FileContent = FileContent;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var FileContent = ns.protocol.FileContent;
    var ImageContent = Interface(null, [FileContent]);
    ImageContent.prototype.setThumbnail = function (image) {
        throw new Error("NotImplemented");
    };
    ImageContent.prototype.getThumbnail = function () {
        throw new Error("NotImplemented");
    };
    var VideoContent = Interface(null, [FileContent]);
    VideoContent.prototype.setSnapshot = function (image) {
        throw new Error("NotImplemented");
    };
    VideoContent.prototype.getSnapshot = function () {
        throw new Error("NotImplemented");
    };
    var AudioContent = Interface(null, [FileContent]);
    AudioContent.prototype.setText = function (asr) {
        throw new Error("NotImplemented");
    };
    AudioContent.prototype.getText = function () {
        throw new Error("NotImplemented");
    };
    ns.protocol.ImageContent = ImageContent;
    ns.protocol.VideoContent = VideoContent;
    ns.protocol.AudioContent = AudioContent;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Content = ns.protocol.Content;
    var PageContent = Interface(null, [Content]);
    PageContent.prototype.getURL = function () {
        throw new Error("NotImplemented");
    };
    PageContent.prototype.setURL = function (url) {
        throw new Error("NotImplemented");
    };
    PageContent.prototype.setTitle = function (title) {
        throw new Error("NotImplemented");
    };
    PageContent.prototype.getTitle = function () {
        throw new Error("NotImplemented");
    };
    PageContent.prototype.setDesc = function (text) {
        throw new Error("NotImplemented");
    };
    PageContent.prototype.getDesc = function () {
        throw new Error("NotImplemented");
    };
    PageContent.prototype.setIcon = function (image) {
        throw new Error("NotImplemented");
    };
    PageContent.prototype.getIcon = function () {
        throw new Error("NotImplemented");
    };
    ns.protocol.PageContent = PageContent;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Content = ns.protocol.Content;
    var MoneyContent = Interface(null, [Content]);
    MoneyContent.prototype.getCurrency = function () {
        throw new Error("NotImplemented");
    };
    MoneyContent.prototype.setAmount = function (amount) {
        throw new Error("NotImplemented");
    };
    MoneyContent.prototype.getAmount = function () {
        throw new Error("NotImplemented");
    };
    var TransferContent = Interface(null, [MoneyContent]);
    TransferContent.prototype.setRemitter = function (sender) {
        throw new Error("NotImplemented");
    };
    TransferContent.prototype.getRemitter = function () {
        throw new Error("NotImplemented");
    };
    TransferContent.prototype.setRemittee = function (receiver) {
        throw new Error("NotImplemented");
    };
    TransferContent.prototype.getRemittee = function () {
        throw new Error("NotImplemented");
    };
    ns.protocol.MoneyContent = MoneyContent;
    ns.protocol.TransferContent = TransferContent;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Content = ns.protocol.Content;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var ForwardContent = Interface(null, [Content]);
    ForwardContent.prototype.getForward = function () {
        throw new Error("NotImplemented");
    };
    ForwardContent.prototype.getSecrets = function () {
        throw new Error("NotImplemented");
    };
    ForwardContent.create = function (secrets) {
        return new ns.dkd.SecretContent(secrets);
    };
    ns.protocol.ForwardContent = ForwardContent;
})(DaoKeDao);
(function (ns) {
    var Interface = ns.type.Interface;
    var Content = ns.protocol.Content;
    var ArrayContent = Interface(null, [Content]);
    ArrayContent.prototype.getContents = function () {
        throw new Error("NotImplemented");
    };
    ArrayContent.create = function (contents) {
        return new ns.dkd.ListContent(contents);
    };
    ns.protocol.ArrayContent = ArrayContent;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Content = ns.protocol.Content;
    var CustomizedContent = Interface(null, [Content]);
    CustomizedContent.prototype.getApplication = function () {
        throw new Error("NotImplemented");
    };
    CustomizedContent.prototype.getModule = function () {
        throw new Error("NotImplemented");
    };
    CustomizedContent.prototype.getAction = function () {
        throw new Error("NotImplemented");
    };
    CustomizedContent.create = function (contents) {
        return new ns.dkd.AppCustomizedContent(contents);
    };
    ns.protocol.CustomizedContent = CustomizedContent;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Content = ns.protocol.Content;
    var Command = Interface(null, [Content]);
    Command.META = "meta";
    Command.DOCUMENT = "document";
    Command.prototype.getCmd = function () {
        throw new Error("NotImplemented");
    };
    var CommandFactory = Interface(null, null);
    CommandFactory.prototype.parseCommand = function (cmd) {
        throw new Error("NotImplemented");
    };
    Command.Factory = CommandFactory;
    var general_factory = function () {
        var man = ns.dkd.cmd.FactoryManager;
        return man.generalFactory;
    };
    Command.setFactory = function (cmd, factory) {
        var gf = general_factory();
        gf.setCommandFactory(cmd, factory);
    };
    Command.getFactory = function (cmd) {
        var gf = general_factory();
        return gf.getCommandFactory(cmd);
    };
    Command.parse = function (command) {
        var gf = general_factory();
        return gf.parseCommand(command);
    };
    ns.protocol.Command = Command;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var Command = ns.protocol.Command;
    var MetaCommand = Interface(null, [Command]);
    MetaCommand.prototype.getIdentifier = function () {
        throw new Error("NotImplemented");
    };
    MetaCommand.prototype.getMeta = function () {
        throw new Error("NotImplemented");
    };
    MetaCommand.query = function (identifier) {
        return new ns.dkd.cmd.BaseMetaCommand(identifier);
    };
    MetaCommand.response = function (identifier, meta) {
        return new ns.dkd.cmd.BaseMetaCommand(identifier, meta);
    };
    ns.protocol.MetaCommand = MetaCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var Document = ns.protocol.Document;
    var MetaCommand = ns.protocol.MetaCommand;
    var DocumentCommand = Interface(null, [MetaCommand]);
    DocumentCommand.prototype.getDocument = function () {
        throw new Error("NotImplemented");
    };
    DocumentCommand.prototype.getSignature = function () {
        throw new Error("NotImplemented");
    };
    DocumentCommand.query = function (identifier, signature) {
        return new ns.dkd.cmd.BaseDocumentCommand(identifier, signature);
    };
    DocumentCommand.response = function (identifier, meta, doc) {
        return new ns.dkd.cmd.BaseDocumentCommand(identifier, meta, doc);
    };
    ns.protocol.DocumentCommand = DocumentCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Command = ns.protocol.Command;
    var HistoryCommand = Interface(null, [Command]);
    HistoryCommand.REGISTER = "register";
    HistoryCommand.SUICIDE = "suicide";
    ns.protocol.HistoryCommand = HistoryCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var HistoryCommand = ns.protocol.HistoryCommand;
    var GroupCommand = Interface(null, [HistoryCommand]);
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
        throw new Error("NotImplemented");
    };
    GroupCommand.prototype.getMember = function () {
        throw new Error("NotImplemented");
    };
    GroupCommand.prototype.setMembers = function (members) {
        throw new Error("NotImplemented");
    };
    GroupCommand.prototype.getMembers = function () {
        throw new Error("NotImplemented");
    };
    GroupCommand.invite = function (group, members) {
        return new ns.dkd.cmd.InviteGroupCommand(group, members);
    };
    GroupCommand.expel = function (group, members) {
        return new ns.dkd.cmd.ExpelGroupCommand(group, members);
    };
    GroupCommand.join = function (group) {
        return new ns.dkd.cmd.JoinGroupCommand(group);
    };
    GroupCommand.quit = function (group) {
        return new ns.dkd.cmd.QuitGroupCommand(group);
    };
    GroupCommand.reset = function (group, members) {
        return new ns.dkd.cmd.ResetGroupCommand(group, members);
    };
    GroupCommand.query = function (group) {
        return new ns.dkd.cmd.QueryGroupCommand(group);
    };
    ns.protocol.GroupCommand = GroupCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var GroupCommand = ns.protocol.GroupCommand;
    var InviteCommand = Interface(null, [GroupCommand]);
    var ExpelCommand = Interface(null, [GroupCommand]);
    var JoinCommand = Interface(null, [GroupCommand]);
    var QuitCommand = Interface(null, [GroupCommand]);
    var ResetCommand = Interface(null, [GroupCommand]);
    var QueryCommand = Interface(null, [GroupCommand]);
    ns.protocol.group.InviteCommand = InviteCommand;
    ns.protocol.group.ExpelCommand = ExpelCommand;
    ns.protocol.group.JoinCommand = JoinCommand;
    ns.protocol.group.QuitCommand = QuitCommand;
    ns.protocol.group.ResetCommand = ResetCommand;
    ns.protocol.group.QueryCommand = QueryCommand;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var ID = ns.protocol.ID;
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
            type = 0;
            sn = 0;
            time = null;
        }
        Dictionary.call(this, content);
        this.__type = type;
        this.__sn = sn;
        this.__time = time;
    };
    Class(BaseContent, Dictionary, [Content], {
        getType: function () {
            if (this.__type === 0) {
                this.__type = this.getNumber("type");
            }
            return this.__type;
        },
        getSerialNumber: function () {
            if (this.__sn === 0) {
                this.__sn = this.getNumber("sn");
            }
            return this.__sn;
        },
        getTime: function () {
            if (this.__time === null) {
                this.__time = get_time(this, "time");
            }
            return this.__time;
        },
        getGroup: function () {
            var group = this.getValue("group");
            return ID.parse(group);
        },
        setGroup: function (identifier) {
            this.setString("group", identifier);
        }
    });
    var get_time = function (dict, key) {
        return Dictionary.prototype.getTime.call(dict, key);
    };
    ns.dkd.BaseContent = BaseContent;
})(DaoKeDao);
(function (ns) {
    var Class = ns.type.Class;
    var ContentType = ns.protocol.ContentType;
    var TextContent = ns.protocol.TextContent;
    var BaseContent = ns.dkd.BaseContent;
    var BaseTextContent = function () {
        if (typeof arguments[0] === "string") {
            BaseContent.call(this, ContentType.TEXT);
            this.setText(arguments[0]);
        } else {
            BaseContent.call(this, arguments[0]);
        }
    };
    Class(BaseTextContent, BaseContent, [TextContent], {
        getText: function () {
            return this.getString("text");
        },
        setText: function (text) {
            this.setValue("text", text);
        }
    });
    ns.dkd.BaseTextContent = BaseTextContent;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Base64 = ns.format.Base64;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var ContentType = ns.protocol.ContentType;
    var FileContent = ns.protocol.FileContent;
    var BaseContent = ns.dkd.BaseContent;
    var BaseFileContent = function () {
        var filename = null;
        var data = null;
        if (arguments.length === 1) {
            BaseContent.call(this, arguments[0]);
        } else {
            if (arguments.length === 2) {
                BaseContent.call(this, ContentType.FILE);
                filename = arguments[0];
                data = arguments[1];
            } else {
                if (arguments.length === 3) {
                    BaseContent.call(this, arguments[0]);
                    filename = arguments[1];
                    data = arguments[2];
                } else {
                    throw new SyntaxError("File content arguments error: " + arguments);
                }
            }
        }
        if (filename) {
            this.setValue("filename", filename);
        }
        if (data) {
            var base64 = null;
            if (typeof data === "string") {
                base64 = data;
                data = null;
            } else {
                if (data instanceof Uint8Array) {
                    base64 = Base64.encode(data);
                } else {
                    throw TypeError("file data error: " + typeof data);
                }
            }
            this.setValue("data", base64);
        }
        this.__data = data;
        this.__password = null;
    };
    Class(BaseFileContent, BaseContent, [FileContent], {
        setURL: function (url) {
            this.setValue("URL", url);
        },
        getURL: function () {
            return this.getString("URL");
        },
        setFilename: function (filename) {
            this.setValue("filename");
        },
        getFilename: function () {
            return this.getString("filename");
        },
        setData: function (data) {
            if (data && data.length > 0) {
                this.setValue("data", Base64.encode(data));
            } else {
                this.removeValue("data");
            }
            this.__data = data;
        },
        getData: function () {
            if (this.__data === null) {
                var base64 = this.getString("data");
                if (base64) {
                    this.__data = Base64.decode(base64);
                }
            }
            return this.__data;
        },
        setPassword: function (key) {
            this.setMap("password", key);
            this.__password = key;
        },
        getPassword: function () {
            if (this.__password === null) {
                var key = this.getValue("password");
                this.__password = SymmetricKey.parse(key);
            }
            return this.__password;
        }
    });
    ns.dkd.BaseFileContent = BaseFileContent;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Base64 = ns.format.Base64;
    var ContentType = ns.protocol.ContentType;
    var ImageContent = ns.protocol.ImageContent;
    var VideoContent = ns.protocol.VideoContent;
    var AudioContent = ns.protocol.AudioContent;
    var BaseFileContent = ns.dkd.BaseFileContent;
    var ImageFileContent = function () {
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
                throw new SyntaxError("Image content arguments error: " + arguments);
            }
        }
        this.__thumbnail = null;
    };
    Class(ImageFileContent, BaseFileContent, [ImageContent], {
        getThumbnail: function () {
            if (this.__thumbnail === null) {
                var base64 = this.getString("thumbnail");
                if (base64) {
                    this.__thumbnail = Base64.decode(base64);
                }
            }
            return this.__thumbnail;
        },
        setThumbnail: function (image) {
            if (image && image.length > 0) {
                this.setValue("thumbnail", Base64.encode(image));
            } else {
                this.removeValue("thumbnail");
            }
            this.__thumbnail = image;
        }
    });
    var VideoFileContent = function () {
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
                throw new SyntaxError("Video content arguments error: " + arguments);
            }
        }
        this.__snapshot = null;
    };
    Class(VideoFileContent, BaseFileContent, [VideoContent], {
        getSnapshot: function () {
            if (this.__snapshot === null) {
                var base64 = this.getString("snapshot");
                if (base64) {
                    this.__snapshot = Base64.decode(base64);
                }
            }
            return this.__snapshot;
        },
        setSnapshot: function (image) {
            if (image && image.length > 0) {
                this.setValue("snapshot", Base64.encode(image));
            } else {
                this.removeValue("snapshot");
            }
            this.__snapshot = image;
        }
    });
    var AudioFileContent = function () {
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
                throw new SyntaxError("Audio content arguments error: " + arguments);
            }
        }
    };
    Class(AudioFileContent, BaseFileContent, [AudioContent], {
        getText: function () {
            return this.getString("text");
        },
        setText: function (asr) {
            this.setValue("text", asr);
        }
    });
    ns.dkd.ImageFileContent = ImageFileContent;
    ns.dkd.VideoFileContent = VideoFileContent;
    ns.dkd.AudioFileContent = AudioFileContent;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Base64 = ns.format.Base64;
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
                this.__icon = null;
                this.setURL(arguments[0]);
                this.setTitle(arguments[1]);
                this.setDesc(arguments[2]);
                this.setIcon(arguments[3]);
            } else {
                throw new SyntaxError("Web page content arguments error: " + arguments);
            }
        }
    };
    Class(WebPageContent, BaseContent, [PageContent], {
        getURL: function () {
            return this.getString("URL");
        },
        setURL: function (url) {
            this.setValue("URL", url);
        },
        getTitle: function () {
            return this.getString("title");
        },
        setTitle: function (title) {
            this.setValue("title", title);
        },
        getDesc: function () {
            return this.getString("desc");
        },
        setDesc: function (text) {
            this.setValue("desc", text);
        },
        getIcon: function () {
            if (this.__icon === null) {
                var base64 = this.getString("icon");
                if (base64) {
                    this.__icon = Base64.decode(base64);
                }
            }
            return this.__icon;
        },
        setIcon: function (image) {
            if (image && image.length > 0) {
                this.setValue("icon", Base64.encode(image));
            } else {
                this.removeValue("icon");
            }
            this.__icon = image;
        }
    });
    ns.dkd.WebPageContent = WebPageContent;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var ContentType = ns.protocol.ContentType;
    var MoneyContent = ns.protocol.MoneyContent;
    var TransferContent = ns.protocol.TransferContent;
    var BaseContent = ns.dkd.BaseContent;
    var BaseMoneyContent = function () {
        if (arguments.length === 1) {
            BaseContent.call(arguments[0]);
        } else {
            if (arguments.length === 2) {
                BaseContent.call(ContentType.MONEY);
                this.setCurrency(arguments[0]);
                this.setAmount(arguments[1]);
            } else {
                if (arguments.length === 3) {
                    BaseContent.call(arguments[0]);
                    this.setCurrency(arguments[1]);
                    this.setAmount(arguments[2]);
                } else {
                    throw new SyntaxError("money content arguments error: " + arguments);
                }
            }
        }
    };
    Class(BaseMoneyContent, BaseContent, [MoneyContent], {
        setCurrency: function (currency) {
            this.setValue("currency", currency);
        },
        getCurrency: function () {
            return this.getString("currency");
        },
        setAmount: function (amount) {
            this.setValue("amount", amount);
        },
        getAmount: function () {
            return this.getNumber("amount");
        }
    });
    var TransferMoneyContent = function () {
        if (arguments.length === 1) {
            MoneyContent.call(arguments[0]);
        } else {
            if (arguments.length === 2) {
                MoneyContent.call(ContentType.TRANSFER, arguments[0], arguments[1]);
            } else {
                throw new SyntaxError("money content arguments error: " + arguments);
            }
        }
    };
    Class(TransferMoneyContent, BaseMoneyContent, [TransferContent], {
        getRemitter: function () {
            var sender = this.getValue("remitter");
            return ID.parse(sender);
        },
        setRemitter: function (sender) {
            this.setString("remitter", sender);
        },
        getRemittee: function () {
            var receiver = this.getValue("remittee");
            return ID.parse(receiver);
        },
        setRemittee: function (receiver) {
            this.setString("remittee", receiver);
        }
    });
    ns.dkd.BaseMoneyContent = BaseMoneyContent;
    ns.dkd.TransferMoneyContent = TransferMoneyContent;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var ContentType = ns.protocol.ContentType;
    var ForwardContent = ns.protocol.ForwardContent;
    var BaseContent = ns.dkd.BaseContent;
    var SecretContent = function () {
        var info = arguments[0];
        var forward = null;
        var secrets = null;
        if (info instanceof Array) {
            BaseContent.call(this, ContentType.FORWARD);
            secrets = info;
        } else {
            if (Interface.conforms(info, ReliableMessage)) {
                BaseContent.call(this, ContentType.FORWARD);
                forward = info;
            } else {
                BaseContent.call(this, info);
            }
        }
        if (forward) {
            this.setMap("forward", forward);
        } else {
            if (secrets) {
                var array = SecretContent.revert(secrets);
                this.setValue("secrets", array);
            }
        }
        this.__forward = forward;
        this.__secrets = secrets;
    };
    Class(SecretContent, BaseContent, [ForwardContent], {
        getForward: function () {
            if (this.__forward === null) {
                var forward = this.getValue("forward");
                this.__forward = ReliableMessage.parse(forward);
            }
            return this.__forward;
        },
        getSecrets: function () {
            if (this.__secrets === null) {
                var array = this.getValue("secrets");
                if (array) {
                    this.__secrets = SecretContent.convert(array);
                } else {
                    this.__secrets = [];
                    var msg = this.getForward();
                    if (msg) {
                        this.__secrets.push(msg);
                    }
                }
            }
            return this.__secrets;
        }
    });
    SecretContent.convert = function (messages) {
        var array = [];
        var msg;
        for (var i = 0; i < messages.length; ++i) {
            msg = ReliableMessage.parse(messages[i]);
            if (msg) {
                array.push(msg);
            }
        }
        return array;
    };
    SecretContent.revert = function (messages) {
        var array = [];
        for (var i = 0; i < messages.length; ++i) {
            array.push(messages[i].toMap());
        }
        return array;
    };
    ns.dkd.SecretContent = SecretContent;
})(DaoKeDao);
(function (ns) {
    var Class = ns.type.Class;
    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var ArrayContent = ns.protocol.ArrayContent;
    var BaseContent = ns.dkd.BaseContent;
    var ListContent = function () {
        var info = arguments[0];
        var list;
        if (info instanceof Array) {
            BaseContent.call(this, ContentType.ARRAY);
            list = info;
            this.setValue("contents", ListContent.revert(list));
        } else {
            BaseContent.call(this, arguments[0]);
            list = null;
        }
        this.__list = list;
    };
    Class(ListContent, BaseContent, [ArrayContent], {
        getContents: function () {
            if (this.__list === null) {
                var array = this.getValue("contents");
                if (array) {
                    this.__list = ListContent.convert(array);
                } else {
                    this.__list = [];
                }
            }
            return this.__list;
        }
    });
    ListContent.convert = function (contents) {
        var array = [];
        var item;
        for (var i = 0; i < contents.length; ++i) {
            item = Content.parse(contents[i]);
            if (item) {
                array.push(item);
            }
        }
        return array;
    };
    ListContent.revert = function (contents) {
        var array = [];
        for (var i = 0; i < contents.length; ++i) {
            array.push(contents[i].toMap());
        }
        return array;
    };
    ns.dkd.ListContent = ListContent;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ContentType = ns.protocol.ContentType;
    var CustomizedContent = ns.protocol.CustomizedContent;
    var BaseContent = ns.dkd.BaseContent;
    var AppCustomizedContent = function () {
        var app = null;
        var mod = null;
        var act = null;
        if (arguments.length === 1) {
            BaseContent.call(this, arguments[0]);
        } else {
            if (arguments.length === 3) {
                BaseContent.call(this, ContentType.CUSTOMIZED);
                app = arguments[0];
                mod = arguments[1];
                act = arguments[2];
            } else {
                BaseContent.call(this, arguments[0]);
                app = arguments[1];
                mod = arguments[2];
                act = arguments[3];
            }
        }
        if (app) {
            this.setValue("app", app);
        }
        if (mod) {
            this.setValue("mod", mod);
        }
        if (act) {
            this.setValue("act", act);
        }
    };
    Class(AppCustomizedContent, BaseContent, [CustomizedContent], {
        getApplication: function () {
            return this.getString("app");
        },
        getModule: function () {
            return this.getString("mod");
        },
        getAction: function () {
            return this.getString("act");
        }
    });
    ns.dkd.AppCustomizedContent = AppCustomizedContent;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var BaseContent = ns.dkd.BaseContent;
    var BaseCommand = function () {
        if (arguments.length === 2) {
            BaseContent.call(this, arguments[0]);
            this.setValue("cmd", arguments[1]);
        } else {
            if (typeof arguments[0] === "string") {
                BaseContent.call(this, ContentType.COMMAND);
                this.setValue("cmd", arguments[0]);
            } else {
                BaseContent.call(this, arguments[0]);
            }
        }
    };
    Class(BaseCommand, BaseContent, [Command], {
        getCmd: function () {
            return this.getString("cmd");
        }
    });
    ns.dkd.cmd.BaseCommand = BaseCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var Command = ns.protocol.Command;
    var MetaCommand = ns.protocol.MetaCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseMetaCommand = function () {
        var identifier = null;
        var meta = null;
        if (arguments.length === 3) {
            BaseCommand.call(this, arguments[0]);
            identifier = arguments[1];
            meta = arguments[2];
        } else {
            if (arguments.length === 2) {
                BaseCommand.call(this, Command.META);
                identifier = arguments[0];
                meta = arguments[1];
            } else {
                if (Interface.conforms(arguments[0], ID)) {
                    BaseCommand.call(this, Command.META);
                    identifier = arguments[0];
                } else {
                    BaseCommand.call(this, arguments[0]);
                }
            }
        }
        if (identifier) {
            this.setString("ID", identifier);
        }
        if (meta) {
            this.setMap("meta", meta);
        }
        this.__identifier = identifier;
        this.__meta = meta;
    };
    Class(BaseMetaCommand, BaseCommand, [MetaCommand], {
        getIdentifier: function () {
            if (this.__identifier == null) {
                var identifier = this.getValue("ID");
                this.__identifier = ID.parse(identifier);
            }
            return this.__identifier;
        },
        getMeta: function () {
            if (this.__meta === null) {
                var meta = this.getValue("meta");
                this.__meta = Meta.parse(meta);
            }
            return this.__meta;
        }
    });
    ns.dkd.cmd.BaseMetaCommand = BaseMetaCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var Command = ns.protocol.Command;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var BaseMetaCommand = ns.dkd.cmd.BaseMetaCommand;
    var BaseDocumentCommand = function () {
        var doc = null;
        var sig = null;
        if (arguments.length === 1) {
            if (Interface.conforms(arguments[0], ID)) {
                BaseMetaCommand.call(this, Command.DOCUMENT, arguments[0], null);
            } else {
                BaseMetaCommand.call(this, arguments[0]);
            }
        } else {
            if (arguments.length === 2) {
                if (Interface.conforms(arguments[1], Document)) {
                    BaseMetaCommand.call(this, Command.DOCUMENT, arguments[0], null);
                    doc = arguments[1];
                } else {
                    BaseMetaCommand.call(this, Command.DOCUMENT, arguments[0], null);
                    sig = arguments[1];
                }
            } else {
                if (arguments.length === 3) {
                    BaseMetaCommand.call(
                        this,
                        Command.DOCUMENT,
                        arguments[0],
                        arguments[1]
                    );
                    doc = arguments[2];
                } else {
                    throw new SyntaxError(
                        "document command arguments error: " + arguments
                    );
                }
            }
        }
        if (doc) {
            this.setMap("document", doc);
        }
        if (sig) {
            this.setValue("signature", sig);
        }
        this.__document = doc;
    };
    Class(BaseDocumentCommand, BaseMetaCommand, [DocumentCommand], {
        getDocument: function () {
            if (this.__document === null) {
                var doc = this.getValue("document");
                this.__document = Document.parse(doc);
            }
            return this.__document;
        },
        getSignature: function () {
            return this.getString("signature");
        }
    });
    ns.dkd.cmd.BaseDocumentCommand = BaseDocumentCommand;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ContentType = ns.protocol.ContentType;
    var HistoryCommand = ns.protocol.HistoryCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseHistoryCommand = function () {
        if (typeof arguments[0] === "string") {
            BaseCommand.call(this, ContentType.HISTORY, arguments[0]);
        } else {
            BaseCommand.call(this, arguments[0]);
        }
    };
    Class(BaseHistoryCommand, BaseCommand, [HistoryCommand], null);
    ns.dkd.cmd.BaseHistoryCommand = BaseHistoryCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var GroupCommand = ns.protocol.GroupCommand;
    var BaseHistoryCommand = ns.dkd.cmd.BaseHistoryCommand;
    var BaseGroupCommand = function () {
        var group = null;
        var member = null;
        var members = null;
        if (arguments.length === 1) {
            BaseHistoryCommand.call(this, arguments[0]);
        } else {
            if (arguments.length === 2) {
                BaseHistoryCommand.call(this, arguments[0]);
                group = arguments[1];
            } else {
                if (arguments[2] instanceof Array) {
                    BaseHistoryCommand.call(this, arguments[0]);
                    group = arguments[1];
                    members = arguments[2];
                } else {
                    if (Interface.conforms(arguments[2], ID)) {
                        BaseHistoryCommand.call(this, arguments[0]);
                        group = arguments[1];
                        member = arguments[2];
                    } else {
                        throw new SyntaxError(
                            "Group command arguments error: " + arguments
                        );
                    }
                }
            }
        }
        if (group) {
            this.setGroup(group);
        }
        if (member) {
            this.setMember(member);
        } else {
            if (members) {
                this.setMembers(members);
            }
        }
        this.__member = member;
        this.__members = members;
    };
    Class(BaseGroupCommand, BaseHistoryCommand, [GroupCommand], {
        setMember: function (identifier) {
            this.setString("member", identifier);
            this.__member = identifier;
        },
        getMember: function () {
            if (this.__member === null) {
                var member = this.getValue("member");
                this.__member = ID.parse(member);
            }
            return this.__member;
        },
        setMembers: function (members) {
            if (members) {
                var array = ID.revert(members);
                this.setValue("members", array);
            } else {
                this.removeValue("members");
            }
            this.__members = members;
        },
        getMembers: function () {
            if (this.__members === null) {
                var array = this.getValue("members");
                if (array) {
                    this.__members = ID.convert(array);
                }
            }
            return this.__members;
        }
    });
    ns.dkd.cmd.BaseGroupCommand = BaseGroupCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var GroupCommand = ns.protocol.GroupCommand;
    var InviteCommand = ns.protocol.group.InviteCommand;
    var ExpelCommand = ns.protocol.group.ExpelCommand;
    var JoinCommand = ns.protocol.group.JoinCommand;
    var QuitCommand = ns.protocol.group.QuitCommand;
    var ResetCommand = ns.protocol.group.ResetCommand;
    var QueryCommand = ns.protocol.group.QueryCommand;
    var BaseGroupCommand = ns.dkd.cmd.BaseGroupCommand;
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
    Class(InviteGroupCommand, BaseGroupCommand, [InviteCommand], null);
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
    Class(ExpelGroupCommand, BaseGroupCommand, [ExpelCommand], null);
    var JoinGroupCommand = function () {
        if (Interface.conforms(arguments[0], ID)) {
            BaseGroupCommand.call(this, GroupCommand.JOIN, arguments[0]);
        } else {
            BaseGroupCommand.call(this, arguments[0]);
        }
    };
    Class(JoinGroupCommand, BaseGroupCommand, [JoinCommand], null);
    var QuitGroupCommand = function () {
        if (Interface.conforms(arguments[0], ID)) {
            BaseGroupCommand.call(this, GroupCommand.QUIT, arguments[0]);
        } else {
            BaseGroupCommand.call(this, arguments[0]);
        }
    };
    Class(QuitGroupCommand, BaseGroupCommand, [QuitCommand], null);
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
    Class(ResetGroupCommand, BaseGroupCommand, [ResetCommand], null);
    var QueryGroupCommand = function () {
        if (Interface.conforms(arguments[0], ID)) {
            BaseGroupCommand.call(this, GroupCommand.QUERY, arguments[0]);
        } else {
            BaseGroupCommand.call(this, arguments[0]);
        }
    };
    Class(QueryGroupCommand, BaseGroupCommand, [QueryCommand], null);
    ns.dkd.cmd.InviteGroupCommand = InviteGroupCommand;
    ns.dkd.cmd.ExpelGroupCommand = ExpelGroupCommand;
    ns.dkd.cmd.JoinGroupCommand = JoinGroupCommand;
    ns.dkd.cmd.QuitGroupCommand = QuitGroupCommand;
    ns.dkd.cmd.ResetGroupCommand = ResetGroupCommand;
    ns.dkd.cmd.QueryGroupCommand = QueryGroupCommand;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Wrapper = ns.type.Wrapper;
    var Command = ns.protocol.Command;
    var GeneralContentFactory = ns.dkd.GeneralFactory;
    var GeneralFactory = function () {
        this.__commandFactories = {};
    };
    Class(GeneralFactory, GeneralContentFactory, null, {
        setCommandFactory: function (cmd, factory) {
            this.__commandFactories[cmd] = factory;
        },
        getCommandFactory: function (cmd) {
            return this.__commandFactories[cmd];
        },
        getCmd: function (command) {
            return command["cmd"];
        },
        parseCommand: function (command) {
            if (!command) {
                return null;
            } else {
                if (Interface.conforms(command, Command)) {
                    return command;
                }
            }
            command = Wrapper.fetchMap(command);
            var cmd = this.getCmd(command);
            var factory = this.getCommandFactory(cmd);
            if (!factory) {
                var type = this.getContentType(command);
                factory = this.getContentFactory(type);
            }
            return factory.parseContent(command);
        }
    });
    var FactoryManager = { generalFactory: new GeneralFactory() };
    ns.dkd.cmd.GeneralFactory = GeneralFactory;
    ns.dkd.cmd.FactoryManager = FactoryManager;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var ID = ns.protocol.ID;
    var Envelope = ns.protocol.Envelope;
    var MessageEnvelope = function () {
        var from, to, when;
        var env;
        if (arguments.length === 1) {
            env = arguments[0];
            from = null;
            to = null;
            when = null;
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
    Class(MessageEnvelope, Dictionary, [Envelope], {
        getSender: function () {
            if (this.__sender === null) {
                this.__sender = get_id(this, "sender");
            }
            return this.__sender;
        },
        getReceiver: function () {
            if (this.__receiver === null) {
                this.__receiver = get_id(this, "receiver");
            }
            return this.__receiver;
        },
        getTime: function () {
            if (this.__time === null) {
                this.__time = get_time(this, "time");
            }
            return this.__time;
        },
        getGroup: function () {
            return get_id(this, "group");
        },
        setGroup: function (identifier) {
            this.setString("group", identifier);
        },
        getType: function () {
            return this.getNumber("type");
        },
        setType: function (type) {
            this.setValue("type", type);
        }
    });
    var get_id = function (dict, key) {
        return ID.parse(dict.getValue(key));
    };
    var get_time = function (dict, key) {
        return Dictionary.prototype.getTime.call(dict, key);
    };
    ns.dkd.MessageEnvelope = MessageEnvelope;
})(DaoKeDao);
(function (ns) {
    var Class = ns.type.Class;
    var Envelope = ns.protocol.Envelope;
    var MessageEnvelope = ns.dkd.MessageEnvelope;
    var EnvelopeFactory = function () {
        Object.call(this);
    };
    Class(EnvelopeFactory, Object, [Envelope.Factory], null);
    EnvelopeFactory.prototype.createEnvelope = function (from, to, when) {
        return new MessageEnvelope(from, to, when);
    };
    EnvelopeFactory.prototype.parseEnvelope = function (env) {
        if (!env["sender"]) {
            return null;
        }
        return new MessageEnvelope(env);
    };
    ns.dkd.EnvelopeFactory = EnvelopeFactory;
})(DaoKeDao);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var Envelope = ns.protocol.Envelope;
    var Message = ns.protocol.Message;
    var BaseMessage = function (msg) {
        var env = null;
        if (Interface.conforms(msg, Envelope)) {
            env = msg;
            msg = env.toMap();
        }
        Dictionary.call(this, msg);
        this.__envelope = env;
        this.__delegate = null;
    };
    Class(BaseMessage, Dictionary, [Message], {
        getDelegate: function () {
            return this.__delegate;
        },
        setDelegate: function (delegate) {
            this.__delegate = delegate;
        },
        getEnvelope: function () {
            if (this.__envelope === null) {
                this.__envelope = Envelope.parse(this.toMap());
            }
            return this.__envelope;
        },
        getSender: function () {
            var env = this.getEnvelope();
            return env.getSender();
        },
        getReceiver: function () {
            var env = this.getEnvelope();
            return env.getReceiver();
        },
        getTime: function () {
            var env = this.getEnvelope();
            return env.getTime();
        },
        getGroup: function () {
            var env = this.getEnvelope();
            return env.getGroup();
        },
        getType: function () {
            var env = this.getEnvelope();
            return env.getTime();
        }
    });
    ns.dkd.BaseMessage = BaseMessage;
})(DaoKeDao);
(function (ns) {
    var Class = ns.type.Class;
    var Content = ns.protocol.Content;
    var InstantMessage = ns.protocol.InstantMessage;
    var SecureMessage = ns.protocol.SecureMessage;
    var BaseMessage = ns.dkd.BaseMessage;
    var PlainMessage = function () {
        var msg, head, body;
        if (arguments.length === 1) {
            msg = arguments[0];
            head = null;
            body = null;
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
    Class(PlainMessage, BaseMessage, [InstantMessage], {
        getContent: function () {
            if (this.__content === null) {
                this.__content = Content.parse(this.getValue("content"));
            }
            return this.__content;
        },
        getTime: function () {
            var content = this.getContent();
            var time = content.getTime();
            if (time) {
                return time;
            } else {
                var env = this.getEnvelope();
                return env.getTime();
            }
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
        var msg = prepare_data.call(this, password);
        var delegate = this.getDelegate();
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
        var msg = prepare_data.call(this, password);
        var delegate = this.getDelegate();
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
            keys[member.toString()] = delegate.encodeKey(data, this);
            ++count;
        }
        if (count > 0) {
            msg["keys"] = keys;
        }
        return SecureMessage.parse(msg);
    };
    var prepare_data = function (password) {
        var delegate = this.getDelegate();
        var data = delegate.serializeContent(this.getContent(), password, this);
        data = delegate.encryptContent(data, password, this);
        var base64 = delegate.encodeData(data, this);
        var msg = this.copyMap(false);
        delete msg["content"];
        msg["data"] = base64;
        return msg;
    };
    ns.dkd.PlainMessage = PlainMessage;
})(DaoKeDao);
(function (ns) {
    var Class = ns.type.Class;
    var InstantMessage = ns.protocol.InstantMessage;
    var PlainMessage = ns.dkd.PlainMessage;
    var InstantMessageFactory = function () {
        Object.call(this);
        this.__sn = randomPositiveInteger();
    };
    Class(InstantMessageFactory, Object, [InstantMessage.Factory], null);
    var MAX_SN = 2147483647;
    var randomPositiveInteger = function () {
        var sn = Math.ceil(Math.random() * MAX_SN);
        if (sn > 0) {
            return sn;
        } else {
            if (sn < 0) {
                return -sn;
            }
        }
        return 9527 + 9394;
    };
    var next = function () {
        if (this.__sn < MAX_SN) {
            this.__sn += 1;
        } else {
            this.__sn = 1;
        }
        return this.__sn;
    };
    InstantMessageFactory.prototype.generateSerialNumber = function (
        msgType,
        now
    ) {
        return next.call(this);
    };
    InstantMessageFactory.prototype.createInstantMessage = function (head, body) {
        return new PlainMessage(head, body);
    };
    InstantMessageFactory.prototype.parseInstantMessage = function (msg) {
        if (!msg["sender"] || !msg["content"]) {
            return null;
        }
        return new PlainMessage(msg);
    };
    ns.dkd.InstantMessageFactory = InstantMessageFactory;
})(DaoKeDao);
(function (ns) {
    var Class = ns.type.Class;
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
    Class(EncryptedMessage, BaseMessage, [SecureMessage], {
        getData: function () {
            if (this.__data === null) {
                var base64 = this.getValue("data");
                var delegate = this.getDelegate();
                this.__data = delegate.decodeData(base64, this);
            }
            return this.__data;
        },
        getEncryptedKey: function () {
            if (this.__key === null) {
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
            if (this.__keys === null) {
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
})(DaoKeDao);
(function (ns) {
    var Class = ns.type.Class;
    var SecureMessage = ns.protocol.SecureMessage;
    var EncryptedMessage = ns.dkd.EncryptedMessage;
    var NetworkMessage = ns.dkd.NetworkMessage;
    var SecureMessageFactory = function () {
        Object.call(this);
    };
    Class(SecureMessageFactory, Object, [SecureMessage.Factory], null);
    SecureMessageFactory.prototype.parseSecureMessage = function (msg) {
        if (!msg["sender"] || !msg["data"]) {
            return null;
        }
        if (msg["signature"]) {
            return new NetworkMessage(msg);
        }
        return new EncryptedMessage(msg);
    };
    ns.dkd.SecureMessageFactory = SecureMessageFactory;
})(DaoKeDao);
(function (ns) {
    var Class = ns.type.Class;
    var Meta = ns.protocol.Meta;
    var Document = ns.protocol.Document;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var EncryptedMessage = ns.dkd.EncryptedMessage;
    var NetworkMessage = function (msg) {
        EncryptedMessage.call(this, msg);
        this.__signature = null;
        this.__meta = null;
        this.__visa = null;
    };
    Class(NetworkMessage, EncryptedMessage, [ReliableMessage], {
        getSignature: function () {
            if (this.__signature === null) {
                var base64 = this.getValue("signature");
                var delegate = this.getDelegate();
                this.__signature = delegate.decodeSignature(base64, this);
            }
            return this.__signature;
        },
        setMeta: function (meta) {
            this.setMap("meta", meta);
            this.__meta = meta;
        },
        getMeta: function () {
            if (this.__meta === null) {
                var dict = this.getValue("meta");
                this.__meta = Meta.parse(dict);
            }
            return this.__meta;
        },
        setVisa: function (visa) {
            this.setMap("visa", visa);
            this.__visa = visa;
        },
        getVisa: function () {
            if (this.__visa === null) {
                var dict = this.getValue("visa");
                this.__visa = Document.parse(dict);
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
})(DaoKeDao);
(function (ns) {
    var Class = ns.type.Class;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var NetworkMessage = ns.dkd.NetworkMessage;
    var ReliableMessageFactory = function () {
        Object.call(this);
    };
    Class(ReliableMessageFactory, Object, [ReliableMessage.Factory], null);
    ReliableMessageFactory.prototype.parseReliableMessage = function (msg) {
        if (!msg["sender"] || !msg["data"] || !msg["signature"]) {
            return null;
        }
        return new NetworkMessage(msg);
    };
    ns.dkd.ReliableMessageFactory = ReliableMessageFactory;
})(DaoKeDao);
(function (ns) {
    var Class = ns.type.Class;
    var Address = ns.protocol.Address;
    var AddressFactory = function () {
        Object.call(this);
        this.__addresses = {};
    };
    Class(AddressFactory, Object, [Address.Factory], null);
    AddressFactory.prototype.reduceMemory = function () {
        var finger = 0;
        finger = ns.mkm.thanos(this.__addresses, finger);
        return finger >> 1;
    };
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
    var thanos = function (planet, finger) {
        var keys = Object.keys(planet);
        var k, p;
        for (var i = 0; i < keys.length; ++i) {
            k = keys[i];
            p = planet[k];
            finger += 1;
            if ((finger & 1) === 1) {
                delete planet[k];
            }
        }
        return finger;
    };
    ns.mkm.AddressFactory = AddressFactory;
    ns.mkm.thanos = thanos;
})(MingKeMing);
(function (ns) {
    var Class = ns.type.Class;
    var Address = ns.protocol.Address;
    var ID = ns.protocol.ID;
    var Identifier = ns.mkm.Identifier;
    var IDFactory = function () {
        Object.call(this);
        this.__identifiers = {};
    };
    Class(IDFactory, Object, [ID.Factory], null);
    IDFactory.prototype.reduceMemory = function () {
        var finger = 0;
        finger = ns.mkm.thanos(this.__identifiers, finger);
        return finger >> 1;
    };
    IDFactory.prototype.generateID = function (meta, network, terminal) {
        var address = Address.generate(meta, network);
        return ID.create(meta.getSeed(), address, terminal);
    };
    IDFactory.prototype.createID = function (name, address, terminal) {
        var string = concat(name, address, terminal);
        var id = this.__identifiers[string];
        if (!id) {
            id = this.newID(string, name, address, terminal);
            this.__identifiers[string] = id;
        }
        return id;
    };
    IDFactory.prototype.parseID = function (identifier) {
        var id = this.__identifiers[identifier];
        if (!id) {
            id = this.parse(identifier);
            if (id) {
                this.__identifiers[identifier] = id;
            }
        }
        return id;
    };
    IDFactory.prototype.newID = function (string, name, address, terminal) {
        return new Identifier(string, name, address, terminal);
    };
    IDFactory.prototype.parse = function (string) {
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
        return this.newID(string, name, address, terminal);
    };
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
    ns.mkm.IDFactory = IDFactory;
})(MingKeMing);
(function (ns) {
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var Base64 = ns.format.Base64;
    var PublicKey = ns.crypto.PublicKey;
    var MetaType = ns.protocol.MetaType;
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
            type = 0;
            key = null;
            seed = null;
            fingerprint = null;
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
    Class(BaseMeta, Dictionary, [Meta], {
        getType: function () {
            if (this.__type === 0) {
                this.__type = this.getNumber("type");
            }
            return this.__type;
        },
        getKey: function () {
            if (this.__key === null) {
                var key = this.getValue("key");
                this.__key = PublicKey.parse(key);
            }
            return this.__key;
        },
        getSeed: function () {
            if (this.__seed === null && MetaType.hasSeed(this.getType())) {
                this.__seed = this.getString("seed");
            }
            return this.__seed;
        },
        getFingerprint: function () {
            if (this.__fingerprint === null && MetaType.hasSeed(this.getType())) {
                var base64 = this.getString("fingerprint");
                this.__fingerprint = Base64.decode(base64);
            }
            return this.__fingerprint;
        }
    });
    ns.mkm.BaseMeta = BaseMeta;
})(MingKeMing);
(function (ns) {
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var UTF8 = ns.format.UTF8;
    var Base64 = ns.format.Base64;
    var JsON = ns.format.JSON;
    var ID = ns.protocol.ID;
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
    Class(BaseDocument, Dictionary, [Document], {
        isValid: function () {
            return this.__status > 0;
        },
        getType: function () {
            var type = this.getProperty("type");
            if (!type) {
                type = this.getString("type");
            }
            return type;
        },
        getIdentifier: function () {
            if (this.__identifier === null) {
                this.__identifier = ID.parse(this.getValue("ID"));
            }
            return this.__identifier;
        },
        getData: function () {
            if (this.__json === null) {
                this.__json = this.getString("data");
            }
            return this.__json;
        },
        getSignature: function () {
            if (this.__sig === null) {
                var base64 = this.getString("signature");
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
                    this.__properties = JsON.decode(data);
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
            if (value) {
                dict[name] = value;
            } else {
                delete dict[name];
            }
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
            return this.__status === 1;
        },
        sign: function (privateKey) {
            if (this.__status > 0) {
                return this.getSignature();
            }
            var now = new Date();
            this.setProperty("time", now.getTime() / 1000);
            var data = JsON.encode(this.allProperties());
            if (!data || data.length === 0) {
                return null;
            }
            var signature = privateKey.sign(UTF8.encode(data));
            if (!signature || signature.length === 0) {
                return null;
            }
            this.setValue("data", data);
            this.setValue("signature", Base64.encode(signature));
            this.__json = data;
            this.__sig = signature;
            this.__status = 1;
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
})(MingKeMing);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
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
            if (Interface.conforms(arguments[0], ID)) {
                BaseDocument.call(this, arguments[0], Document.VISA);
            } else {
                if (arguments.length === 1) {
                    BaseDocument.call(this, arguments[0]);
                }
            }
        }
        this.__key = null;
    };
    Class(BaseVisa, BaseDocument, [Visa], {
        getKey: function () {
            if (this.__key === null) {
                var key = this.getProperty("key");
                key = PublicKey.parse(key);
                if (Interface.conforms(key, EncryptKey)) {
                    this.__key = key;
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
})(MingKeMing);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var Bulletin = ns.protocol.Bulletin;
    var BaseDocument = ns.mkm.BaseDocument;
    var BaseBulletin = function () {
        if (arguments.length === 3) {
            BaseDocument.call(this, arguments[0], arguments[1], arguments[2]);
        } else {
            if (Interface.conforms(arguments[0], ID)) {
                BaseDocument.call(this, arguments[0], Document.BULLETIN);
            } else {
                if (arguments.length === 1) {
                    BaseDocument.call(this, arguments[0]);
                }
            }
        }
        this.__assistants = null;
    };
    Class(BaseBulletin, BaseDocument, [Bulletin], {
        getAssistants: function () {
            if (this.__assistants === null) {
                var assistants = this.getProperty("assistants");
                if (assistants) {
                    this.__assistants = ID.convert(assistants);
                }
            }
            return this.__assistants;
        },
        setAssistants: function (assistants) {
            if (assistants) {
                this.setProperty("assistants", ID.revert(assistants));
            } else {
                this.setProperty("assistants", null);
            }
        }
    });
    ns.mkm.BaseBulletin = BaseBulletin;
})(MingKeMing);
(function (ns) {
    var Interface = ns.type.Interface;
    var Entity = Interface(null, [ns.type.Object]);
    Entity.prototype.getIdentifier = function () {
        throw new Error("NotImplemented");
    };
    Entity.prototype.getType = function () {
        throw new Error("NotImplemented");
    };
    Entity.prototype.getMeta = function () {
        throw new Error("NotImplemented");
    };
    Entity.prototype.getDocument = function (type) {
        throw new Error("NotImplemented");
    };
    Entity.prototype.setDataSource = function (barrack) {
        throw new Error("NotImplemented");
    };
    Entity.prototype.getDataSource = function () {
        throw new Error("NotImplemented");
    };
    var EntityDataSource = Interface(null, null);
    EntityDataSource.prototype.getMeta = function (identifier) {
        throw new Error("NotImplemented");
    };
    EntityDataSource.prototype.getDocument = function (identifier, type) {
        throw new Error("NotImplemented");
    };
    var EntityDelegate = Interface(null, null);
    EntityDelegate.prototype.getUser = function (identifier) {
        throw new Error("NotImplemented");
    };
    EntityDelegate.prototype.getGroup = function (identifier) {
        throw new Error("NotImplemented");
    };
    Entity.DataSource = EntityDataSource;
    Entity.Delegate = EntityDelegate;
    ns.mkm.Entity = Entity;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var BaseObject = ns.type.BaseObject;
    var Entity = ns.mkm.Entity;
    var BaseEntity = function (identifier) {
        BaseObject.call(this);
        this.__identifier = identifier;
        this.__datasource = null;
    };
    Class(BaseEntity, BaseObject, [Entity], null);
    BaseEntity.prototype.equals = function (other) {
        if (this === other) {
            return true;
        } else {
            if (!other) {
                return false;
            } else {
                if (Interface.conforms(other, Entity)) {
                    other = other.getIdentifier();
                }
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
        var clazz = Object.getPrototypeOf(this).constructor.name;
        var id = this.__identifier;
        var network = id.getAddress().getType();
        return (
            "<" + clazz + ' id="' + id.toString() + '" network="' + network + '" />'
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
        var delegate = this.getDataSource();
        return delegate.getMeta(this.__identifier);
    };
    BaseEntity.prototype.getDocument = function (type) {
        var delegate = this.getDataSource();
        return delegate.getDocument(this.__identifier, type);
    };
    ns.mkm.BaseEntity = BaseEntity;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Entity = ns.mkm.Entity;
    var User = Interface(null, [Entity]);
    User.prototype.getVisa = function () {
        throw new Error("NotImplemented");
    };
    User.prototype.getContacts = function () {
        throw new Error("NotImplemented");
    };
    User.prototype.verify = function (data, signature) {
        throw new Error("NotImplemented");
    };
    User.prototype.encrypt = function (plaintext) {
        throw new Error("NotImplemented");
    };
    User.prototype.sign = function (data) {
        throw new Error("NotImplemented");
    };
    User.prototype.decrypt = function (ciphertext) {
        throw new Error("NotImplemented");
    };
    User.prototype.signVisa = function (doc) {
        throw new Error("NotImplemented");
    };
    User.prototype.verifyVisa = function (doc) {
        throw new Error("NotImplemented");
    };
    var UserDataSource = Interface(null, [Entity.DataSource]);
    UserDataSource.prototype.getContacts = function (identifier) {
        throw new Error("NotImplemented");
    };
    UserDataSource.prototype.getPublicKeyForEncryption = function (identifier) {
        throw new Error("NotImplemented");
    };
    UserDataSource.prototype.getPublicKeysForVerification = function (
        identifier
    ) {
        throw new Error("NotImplemented");
    };
    UserDataSource.prototype.getPrivateKeysForDecryption = function (identifier) {
        throw new Error("NotImplemented");
    };
    UserDataSource.prototype.getPrivateKeyForSignature = function (identifier) {
        throw new Error("NotImplemented");
    };
    UserDataSource.prototype.getPrivateKeyForVisaSignature = function (
        identifier
    ) {
        throw new Error("NotImplemented");
    };
    User.DataSource = UserDataSource;
    ns.mkm.User = User;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Document = ns.protocol.Document;
    var Visa = ns.protocol.Visa;
    var User = ns.mkm.User;
    var BaseEntity = ns.mkm.BaseEntity;
    var BaseUser = function (identifier) {
        BaseEntity.call(this, identifier);
    };
    Class(BaseUser, BaseEntity, [User], {
        getVisa: function () {
            var doc = this.getDocument(Document.VISA);
            if (Interface.conforms(doc, Visa)) {
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
            return key.encrypt(plaintext);
        },
        sign: function (data) {
            var barrack = this.getDataSource();
            var uid = this.getIdentifier();
            var key = barrack.getPrivateKeyForSignature(uid);
            return key.sign(data);
        },
        decrypt: function (ciphertext) {
            var barrack = this.getDataSource();
            var uid = this.getIdentifier();
            var keys = barrack.getPrivateKeysForDecryption(uid);
            var plaintext;
            for (var i = 0; i < keys.length; ++i) {
                try {
                    plaintext = keys[i].decrypt(ciphertext);
                    if (plaintext && plaintext.length > 0) {
                        return plaintext;
                    }
                } catch (e) {}
            }
            return null;
        },
        signVisa: function (doc) {
            var uid = this.getIdentifier();
            var barrack = this.getDataSource();
            var key = barrack.getPrivateKeyForVisaSignature(uid);
            doc.sign(key);
            return doc;
        },
        verifyVisa: function (doc) {
            var uid = this.getIdentifier();
            if (!uid.equals(doc.getIdentifier())) {
                return false;
            }
            var meta = this.getMeta();
            var key = meta.getKey();
            return doc.verify(key);
        }
    });
    ns.mkm.BaseUser = BaseUser;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Entity = ns.mkm.Entity;
    var Group = Interface(null, [Entity]);
    Group.prototype.getBulletin = function () {
        throw new Error("NotImplemented");
    };
    Group.prototype.getFounder = function () {
        throw new Error("NotImplemented");
    };
    Group.prototype.getOwner = function () {
        throw new Error("NotImplemented");
    };
    Group.prototype.getMembers = function () {
        throw new Error("NotImplemented");
    };
    Group.prototype.getAssistants = function () {
        throw new Error("NotImplemented");
    };
    var GroupDataSource = Interface(null, [Entity.DataSource]);
    GroupDataSource.prototype.getFounder = function (identifier) {
        throw new Error("NotImplemented");
    };
    GroupDataSource.prototype.getOwner = function (identifier) {
        throw new Error("NotImplemented");
    };
    GroupDataSource.prototype.getMembers = function (identifier) {
        throw new Error("NotImplemented");
    };
    GroupDataSource.prototype.getAssistants = function (identifier) {
        throw new Error("NotImplemented");
    };
    Group.DataSource = GroupDataSource;
    ns.mkm.Group = Group;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Document = ns.protocol.Document;
    var Bulletin = ns.protocol.Bulletin;
    var Group = ns.mkm.Group;
    var BaseEntity = ns.mkm.BaseEntity;
    var BaseGroup = function (identifier) {
        BaseEntity.call(this, identifier);
        this.__founder = null;
    };
    Class(BaseGroup, BaseEntity, [Group], {
        getBulletin: function () {
            var doc = this.getDocument(Document.BULLETIN);
            if (Interface.conforms(doc, Bulletin)) {
                return doc;
            } else {
                return null;
            }
        },
        getFounder: function () {
            if (this.__founder === null) {
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
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var EncryptKey = ns.crypto.EncryptKey;
    var VerifyKey = ns.crypto.VerifyKey;
    var EntityType = ns.protocol.EntityType;
    var ID = ns.protocol.ID;
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
    Class(Barrack, Object, [Entity.Delegate, User.DataSource, Group.DataSource], {
        getBroadcastFounder: function (group) {
            var name = group_seed(group);
            if (name) {
                return ID.parse(name + ".founder@anywhere");
            } else {
                return ID.FOUNDER;
            }
        },
        getBroadcastOwner: function (group) {
            var name = group_seed(group);
            if (name) {
                return ID.parse(name + ".owner@anywhere");
            } else {
                return ID.ANYONE;
            }
        },
        getBroadcastMembers: function (group) {
            var members = [];
            var name = group_seed(group);
            if (name) {
                var owner = ID.parse(name + ".owner@anywhere");
                var member = ID.parse(name + ".member@anywhere");
                members.push(owner);
                members.push(member);
            } else {
                members.push(ID.ANYONE);
            }
            return members;
        },
        getPublicKeyForEncryption: function (identifier) {
            var key = visa_key.call(this, identifier);
            if (key) {
                return key;
            }
            key = meta_key.call(this, identifier);
            if (Interface.conforms(key, EncryptKey)) {
                return key;
            }
            return null;
        },
        getPublicKeysForVerification: function (identifier) {
            var keys = [];
            var key = visa_key.call(this, identifier);
            if (Interface.conforms(key, VerifyKey)) {
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
                    if (Meta.matchKey(mMeta.getKey(), gMeta)) {
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
            if (EntityType.GROUP.equals(group.getType())) {
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
            if (Interface.conforms(doc, Bulletin)) {
                if (doc.isValid()) {
                    return doc.getAssistants();
                }
            }
            return null;
        }
    });
    var visa_key = function (user) {
        var doc = this.getDocument(user, Document.VISA);
        if (Interface.conforms(doc, Visa)) {
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
    ns.Barrack = Barrack;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Packer = Interface(null, null);
    Packer.prototype.getOvertGroup = function (content) {
        throw new Error("NotImplemented");
    };
    Packer.prototype.encryptMessage = function (iMsg) {
        throw new Error("NotImplemented");
    };
    Packer.prototype.signMessage = function (sMsg) {
        throw new Error("NotImplemented");
    };
    Packer.prototype.serializeMessage = function (rMsg) {
        throw new Error("NotImplemented");
    };
    Packer.prototype.deserializeMessage = function (data) {
        throw new Error("NotImplemented");
    };
    Packer.prototype.verifyMessage = function (rMsg) {
        throw new Error("NotImplemented");
    };
    Packer.prototype.decryptMessage = function (sMsg) {
        throw new Error("NotImplemented");
    };
    ns.Packer = Packer;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Processor = Interface(null, null);
    Processor.prototype.processPackage = function (data) {
        throw new Error("NotImplemented");
    };
    Processor.prototype.processReliableMessage = function (rMsg) {
        throw new Error("NotImplemented");
    };
    Processor.prototype.processSecureMessage = function (sMsg, rMsg) {
        throw new Error("NotImplemented");
    };
    Processor.prototype.processInstantMessage = function (iMsg, rMsg) {
        throw new Error("NotImplemented");
    };
    Processor.prototype.processContent = function (content, rMsg) {
        throw new Error("NotImplemented");
    };
    ns.Processor = Processor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
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
    Class(
        Transceiver,
        Object,
        [InstantMessage.Delegate, ReliableMessage.Delegate],
        null
    );
    Transceiver.prototype.getEntityDelegate = function () {
        throw new Error("NotImplemented");
    };
    Transceiver.prototype.isBroadcast = function (msg) {
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
        if (this.isBroadcast(iMsg)) {
            return UTF8.decode(data);
        }
        return Base64.encode(data);
    };
    Transceiver.prototype.serializeKey = function (pwd, iMsg) {
        if (this.isBroadcast(iMsg)) {
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
        if (this.isBroadcast(sMsg)) {
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
    ns.Transceiver = Transceiver;
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
    var Class = ns.type.Class;
    var DataCoder = ns.format.DataCoder;
    var Base58Coder = function () {
        Object.call(this);
    };
    Class(Base58Coder, Object, [DataCoder], {
        encode: function (data) {
            return bs58.encode(data);
        },
        decode: function (string) {
            return bs58.decode(string);
        }
    });
    ns.format.Base58.setCoder(new Base58Coder());
})(MONKEY);
(function (ns) {
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
    var Class = ns.type.Class;
    var DataCoder = ns.format.DataCoder;
    var Base64Coder = function () {
        Object.call(this);
    };
    Class(Base64Coder, Object, [DataCoder], {
        encode: function (data) {
            return base64_encode(data);
        },
        decode: function (string) {
            return base64_decode(string);
        }
    });
    ns.format.Base64.setCoder(new Base64Coder());
})(MONKEY);
(function (ns) {
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
    var Class = ns.type.Class;
    var DataCoder = ns.format.DataCoder;
    var HexCoder = function () {
        Object.call(this);
    };
    Class(HexCoder, Object, [DataCoder], {
        encode: function (data) {
            return hex_encode(data);
        },
        decode: function (string) {
            return hex_decode(string);
        }
    });
    ns.format.Hex.setCoder(new HexCoder());
})(MONKEY);
(function (ns) {
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
    var Class = ns.type.Class;
    var StringCoder = ns.format.StringCoder;
    var Utf8Coder = function () {
        Object.call(this);
    };
    Class(Utf8Coder, Object, [StringCoder], {
        encode: function (string) {
            return utf8_encode(string);
        },
        decode: function (data) {
            return utf8_decode(data);
        }
    });
    ns.format.UTF8.setCoder(new Utf8Coder());
})(MONKEY);
(function (ns) {
    var Class = ns.type.Class;
    var ObjectCoder = ns.format.ObjectCoder;
    var JsonCoder = function () {
        Object.call(this);
    };
    Class(JsonCoder, Object, [ObjectCoder], {
        encode: function (object) {
            return JSON.stringify(object);
        },
        decode: function (string) {
            return JSON.parse(string);
        }
    });
    ns.format.JSON.setCoder(new JsonCoder());
})(MONKEY);
(function (ns) {
    var Class = ns.type.Class;
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this);
    };
    Class(hash, Object, [DataDigester], {
        digest: function (data) {
            var hex = ns.format.Hex.encode(data);
            var array = CryptoJS.enc.Hex.parse(hex);
            var result = CryptoJS.MD5(array);
            return ns.format.Hex.decode(result.toString());
        }
    });
    ns.digest.MD5.setDigester(new hash());
})(MONKEY);
(function (ns) {
    var Class = ns.type.Class;
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this);
    };
    Class(hash, Object, [DataDigester], {
        digest: function (data) {
            var hex = ns.format.Hex.encode(data);
            var array = CryptoJS.enc.Hex.parse(hex);
            var result = CryptoJS.SHA256(array);
            return ns.format.Hex.decode(result.toString());
        }
    });
    ns.digest.SHA256.setDigester(new hash());
})(MONKEY);
(function (ns) {
    var Class = ns.type.Class;
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this);
    };
    Class(hash, Object, [DataDigester], {
        digest: function (data) {
            var hex = ns.format.Hex.encode(data);
            var array = CryptoJS.enc.Hex.parse(hex);
            var result = CryptoJS.RIPEMD160(array);
            return ns.format.Hex.decode(result.toString());
        }
    });
    ns.digest.RIPEMD160.setDigester(new hash());
})(MONKEY);
(function (ns) {
    var Class = ns.type.Class;
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this);
    };
    Class(hash, Object, [DataDigester], {
        digest: function (data) {
            var array = window.keccak256.update(data).digest();
            return new Uint8Array(array);
        }
    });
    ns.digest.KECCAK256.setDigester(new hash());
})(MONKEY);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var general_factory = function () {
        var man = ns.crypto.FactoryManager;
        return man.generalFactory;
    };
    var BaseKey = function (key) {
        Dictionary.call(this, key);
    };
    Class(BaseKey, Dictionary, [CryptographyKey], {
        getAlgorithm: function () {
            var gf = general_factory();
            return gf.getAlgorithm(this.toMap());
        }
    });
    var BaseSymmetricKey = function (key) {
        BaseKey.call(this, key);
    };
    Class(BaseSymmetricKey, BaseKey, [SymmetricKey], {
        equals: function (other) {
            if (this === other) {
                return true;
            } else {
                if (!other) {
                    return false;
                } else {
                    if (Interface.conforms(other, SymmetricKey)) {
                        return this.match(other);
                    } else {
                        return false;
                    }
                }
            }
        },
        match: function (encryptKey) {
            var gf = general_factory();
            return gf.matchEncryptKey(encryptKey);
        }
    });
    var BaseAsymmetricKey = function (key) {
        BaseKey.call(this, key);
    };
    Class(BaseAsymmetricKey, BaseKey, [AsymmetricKey], null);
    var BasePrivateKey = function (key) {
        BaseKey.call(this, key);
    };
    Class(BasePrivateKey, BaseKey, [PrivateKey], {
        equals: function (other) {
            if (this === other) {
                return true;
            } else {
                if (!other) {
                    return false;
                } else {
                    if (Interface.conforms(other, PrivateKey)) {
                        return this.match(other);
                    } else {
                        return false;
                    }
                }
            }
        }
    });
    var BasePublicKey = function (key) {
        BaseKey.call(this, key);
    };
    Class(BasePublicKey, BaseKey, [PublicKey], {
        match: function (signKey) {
            var gf = general_factory();
            return gf.matchSignKey(signKey);
        }
    });
    ns.crypto.BaseKey = BaseKey;
    ns.crypto.BaseSymmetricKey = BaseSymmetricKey;
    ns.crypto.BaseAsymmetricKey = BaseAsymmetricKey;
    ns.crypto.BasePrivateKey = BasePrivateKey;
    ns.crypto.BasePublicKey = BasePublicKey;
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
    var Class = ns.type.Class;
    var pem = function () {
        Object.call(this);
    };
    Class(pem, Object, null, null);
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
})(MONKEY);
(function (ns) {
    var Class = ns.type.Class;
    var BasePublicKey = ns.crypto.BasePublicKey;
    var EncryptKey = ns.crypto.EncryptKey;
    var RSAPublicKey = function (key) {
        BasePublicKey.call(this, key);
    };
    Class(RSAPublicKey, BasePublicKey, [EncryptKey], {
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
})(MONKEY);
(function (ns) {
    var Class = ns.type.Class;
    var PublicKey = ns.crypto.PublicKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var BasePrivateKey = ns.crypto.BasePrivateKey;
    var RSAPrivateKey = function (key) {
        BasePrivateKey.call(this, key);
    };
    Class(RSAPrivateKey, BasePrivateKey, [DecryptKey], {
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
})(MONKEY);
(function (ns) {
    var Secp256k1 = window.Secp256k1;
    var Class = ns.type.Class;
    var BasePublicKey = ns.crypto.BasePublicKey;
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
        BasePublicKey.call(this, key);
    };
    Class(ECCPublicKey, BasePublicKey, null, {
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
})(MONKEY);
(function (ns) {
    var Class = ns.type.Class;
    var PublicKey = ns.crypto.PublicKey;
    var BasePrivateKey = ns.crypto.BasePrivateKey;
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
        BasePrivateKey.call(this, key);
        var keyPair = get_key_pair.call(this);
        this.__privateKey = keyPair.privateKey;
        this.__publicKey = keyPair.publicKey;
    };
    Class(ECCPrivateKey, BasePrivateKey, null, {
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
})(MONKEY);
(function (ns) {
    var Class = ns.type.Class;
    var BaseSymmetricKey = ns.crypto.BaseSymmetricKey;
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
        BaseSymmetricKey.call(this, key);
        this.getData();
    };
    Class(AESKey, BaseSymmetricKey, null, {
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
        }
    });
    ns.crypto.AESKey = AESKey;
})(MONKEY);
(function (ns) {
    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Password = function () {
        Object.call(this);
    };
    Class(Password, Object, null, null);
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
})(MONKEY);
(function (ns) {
    var Class = ns.type.Class;
    var BaseSymmetricKey = ns.crypto.BaseSymmetricKey;
    var PlainKey = function (key) {
        BaseSymmetricKey.call(this, key);
    };
    Class(PlainKey, BaseSymmetricKey, null, {
        getData: function () {
            return null;
        },
        encrypt: function (data) {
            return data;
        },
        decrypt: function (data) {
            return data;
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
})(MONKEY);
(function (ns) {
    var NetworkType = ns.type.Enum(null, {
        BTC_MAIN: 0,
        MAIN: 8,
        GROUP: 16,
        POLYLOGUE: 16,
        CHATROOM: 48,
        PROVIDER: 118,
        STATION: 136,
        BOT: 200,
        THING: 128
    });
    var EntityType = ns.protocol.EntityType;
    NetworkType.getEntityType = function (network) {
        if (NetworkType.MAIN.equals(network)) {
            return EntityType.USER.valueOf();
        } else {
            if (NetworkType.GROUP.equals(network)) {
                return EntityType.GROUP.valueOf();
            } else {
                if (NetworkType.CHATROOM.equals(network)) {
                    return EntityType.GROUP.valueOf() | EntityType.CHATROOM.valueOf();
                } else {
                    if (NetworkType.STATION.equals(network)) {
                        return EntityType.STATION.valueOf();
                    } else {
                        if (NetworkType.PROVIDER.equals(network)) {
                            return EntityType.ISP.valueOf();
                        } else {
                            if (NetworkType.BOT.equals(network)) {
                                return EntityType.BOT.valueOf();
                            }
                        }
                    }
                }
            }
        }
        return network;
    };
    ns.protocol.NetworkType = NetworkType;
})(MingKeMing);
(function (ns) {
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Identifier = ns.mkm.Identifier;
    var IDFactory = ns.mkm.IDFactory;
    var NetworkType = ns.protocol.NetworkType;
    var EntityID = function (identifier, name, address, terminal) {
        Identifier.call(this, identifier, name, address, terminal);
    };
    Class(EntityID, Identifier, null, {
        getType: function () {
            var network = this.getAddress().getType();
            return NetworkType.getEntityType(network);
        }
    });
    var EntityIDFactory = function () {
        IDFactory.call(this);
    };
    Class(EntityIDFactory, IDFactory, null, {
        newID: function (string, name, address, terminal) {
            return new EntityID(string, name, address, terminal);
        },
        parse: function (identifier) {
            if (!identifier) {
                throw new ReferenceError("ID empty");
            }
            var len = identifier.length;
            if (len === 15 && identifier.toLowerCase() === "anyone@anywhere") {
                return ID.ANYONE;
            } else {
                if (len === 19 && identifier.toLowerCase() === "everyone@everywhere") {
                    return ID.EVERYONE;
                } else {
                    if (len === 13 && identifier.toLowerCase() === "moky@anywhere") {
                        return ID.FOUNDER;
                    }
                }
            }
            return IDFactory.prototype.parse.call(this, identifier);
        }
    });
    ID.setFactory(new EntityIDFactory());
})(MingKeMing);
(function (ns) {
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
    var Base58 = ns.format.Base58;
    var SHA256 = ns.digest.SHA256;
    var RIPEMD160 = ns.digest.RIPEMD160;
    var ConstantString = ns.type.ConstantString;
    var EntityType = ns.protocol.EntityType;
    var NetworkType = ns.protocol.NetworkType;
    var Address = ns.protocol.Address;
    var BTCAddress = function (string, network) {
        ConstantString.call(this, string);
        if (Enum.isEnum(network)) {
            network = network.valueOf();
        }
        this.__network = network;
    };
    Class(BTCAddress, ConstantString, [Address], null);
    BTCAddress.prototype.getType = function () {
        return this.__network;
    };
    BTCAddress.prototype.isBroadcast = function () {
        return false;
    };
    BTCAddress.prototype.isUser = function () {
        var type = NetworkType.getEntityType(this.__network);
        return EntityType.isUser(type);
    };
    BTCAddress.prototype.isGroup = function () {
        var type = NetworkType.getEntityType(this.__network);
        return EntityType.isGroup(type);
    };
    BTCAddress.generate = function (fingerprint, network) {
        if (Enum.isEnum(network)) {
            network = network.valueOf();
        }
        var digest = RIPEMD160.digest(SHA256.digest(fingerprint));
        var head = [];
        head.push(network);
        for (var i = 0; i < digest.length; ++i) {
            head.push(digest[i]);
        }
        var cc = check_code(Uint8Array.from(head));
        var data = [];
        for (var j = 0; j < head.length; ++j) {
            data.push(head[j]);
        }
        for (var k = 0; k < cc.length; ++k) {
            data.push(cc[k]);
        }
        return new BTCAddress(Base58.encode(Uint8Array.from(data)), network);
    };
    BTCAddress.parse = function (string) {
        var len = string.length;
        if (len < 26) {
            return null;
        }
        var data = Base58.decode(string);
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
        var sha256d = SHA256.digest(SHA256.digest(data));
        return sha256d.subarray(0, 4);
    };
    ns.mkm.BTCAddress = BTCAddress;
})(MingKeMing);
(function (ns) {
    var Class = ns.type.Class;
    var ConstantString = ns.type.ConstantString;
    var EntityType = ns.protocol.EntityType;
    var Address = ns.protocol.Address;
    var ETHAddress = function (string) {
        ConstantString.call(this, string);
    };
    Class(ETHAddress, ConstantString, [Address], null);
    ETHAddress.prototype.getType = function () {
        return EntityType.USER.valueOf();
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
    ns.mkm.ETHAddress = ETHAddress;
})(MingKeMing);
(function (ns) {
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
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
    Class(DefaultMeta, BaseMeta, null, {
        generateAddress: function (network) {
            if (Enum.isEnum(network)) {
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
})(MingKeMing);
(function (ns) {
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
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
    Class(BTCMeta, BaseMeta, null, {
        generateAddress: function (network) {
            if (Enum.isEnum(network)) {
                network = network.valueOf();
            }
            if (this.__address === null) {
                var key = this.getKey();
                var fingerprint = key.getData();
                this.__address = BTCAddress.generate(fingerprint, network);
            }
            return this.__address;
        }
    });
    ns.mkm.BTCMeta = BTCMeta;
})(MingKeMing);
(function (ns) {
    var Class = ns.type.Class;
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
    Class(ETHMeta, BaseMeta, null, {
        generateAddress: function (network) {
            if (this.__address === null) {
                var key = this.getKey();
                var fingerprint = key.getData();
                this.__address = ETHAddress.generate(fingerprint);
            }
            return this.__address;
        }
    });
    ns.mkm.ETHMeta = ETHMeta;
})(MingKeMing);
(function (ns) {
    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var AESKey = ns.crypto.AESKey;
    var AESKeyFactory = function () {
        Object.call(this);
    };
    Class(AESKeyFactory, Object, [SymmetricKey.Factory], null);
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
    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = ns.crypto.PlainKey;
    var PlainKeyFactory = function () {
        Object.call(this);
    };
    Class(PlainKeyFactory, Object, [SymmetricKey.Factory], null);
    PlainKeyFactory.prototype.generateSymmetricKey = function () {
        return PlainKey.getInstance();
    };
    PlainKeyFactory.prototype.parseSymmetricKey = function (key) {
        return PlainKey.getInstance();
    };
    SymmetricKey.setFactory(PlainKey.PLAIN, new PlainKeyFactory());
})(MONKEY);
(function (ns) {
    var Class = ns.type.Class;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = ns.crypto.RSAPrivateKey;
    var RSAPublicKey = ns.crypto.RSAPublicKey;
    var RSAPrivateKeyFactory = function () {
        Object.call(this);
    };
    Class(RSAPrivateKeyFactory, Object, [PrivateKey.Factory], null);
    RSAPrivateKeyFactory.prototype.generatePrivateKey = function () {
        return this.parsePrivateKey({ algorithm: AsymmetricKey.RSA });
    };
    RSAPrivateKeyFactory.prototype.parsePrivateKey = function (key) {
        return new RSAPrivateKey(key);
    };
    var RSAPublicKeyFactory = function () {
        Object.call(this);
    };
    Class(RSAPublicKeyFactory, Object, [PublicKey.Factory], null);
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
    var Class = ns.type.Class;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var ECCPrivateKey = ns.crypto.ECCPrivateKey;
    var ECCPublicKey = ns.crypto.ECCPublicKey;
    var ECCPrivateKeyFactory = function () {
        Object.call(this);
    };
    Class(ECCPrivateKeyFactory, Object, [PrivateKey.Factory], null);
    ECCPrivateKeyFactory.prototype.generatePrivateKey = function () {
        return this.parsePrivateKey({ algorithm: AsymmetricKey.ECC });
    };
    ECCPrivateKeyFactory.prototype.parsePrivateKey = function (key) {
        return new ECCPrivateKey(key);
    };
    var ECCPublicKeyFactory = function () {
        Object.call(this);
    };
    Class(ECCPublicKeyFactory, Object, [PublicKey.Factory], null);
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
(function (ns) {
    var Class = ns.type.Class;
    var Address = ns.protocol.Address;
    var AddressFactory = ns.mkm.AddressFactory;
    var BTCAddress = ns.mkm.BTCAddress;
    var ETHAddress = ns.mkm.ETHAddress;
    var GeneralAddressFactory = function () {
        AddressFactory.call(this);
    };
    Class(GeneralAddressFactory, AddressFactory, null, null);
    GeneralAddressFactory.prototype.createAddress = function (address) {
        if (!address) {
            throw new ReferenceError("address empty");
        }
        var len = address.length;
        if (len === 8 && address.toLowerCase() === "anywhere") {
            return Address.ANYWHERE;
        } else {
            if (len === 10 && address.toLowerCase() === "everywhere") {
                return Address.EVERYWHERE;
            } else {
                if (len === 42) {
                    return ETHAddress.parse(address);
                } else {
                    if (26 <= len && len <= 35) {
                        return BTCAddress.parse(address);
                    }
                }
            }
        }
        throw new TypeError("invalid address: " + address);
    };
    Address.setFactory(new GeneralAddressFactory());
})(MingKeMing);
(function (ns) {
    var Class = ns.type.Class;
    var MetaType = ns.protocol.MetaType;
    var Meta = ns.protocol.Meta;
    var DefaultMeta = ns.mkm.DefaultMeta;
    var BTCMeta = ns.mkm.BTCMeta;
    var ETHMeta = ns.mkm.ETHMeta;
    var GeneralMetaFactory = function (type) {
        Object.call(this);
        this.__type = type;
    };
    Class(GeneralMetaFactory, Object, [Meta.Factory], null);
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
        var gf = general_factory();
        var type = gf.getMetaType(meta);
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
    var general_factory = function () {
        var man = ns.mkm.FactoryManager;
        return man.generalFactory;
    };
    Meta.setFactory(MetaType.MKM, new GeneralMetaFactory(MetaType.MKM));
    Meta.setFactory(MetaType.BTC, new GeneralMetaFactory(MetaType.BTC));
    Meta.setFactory(MetaType.ExBTC, new GeneralMetaFactory(MetaType.ExBTC));
    Meta.setFactory(MetaType.ETH, new GeneralMetaFactory(MetaType.ETH));
    Meta.setFactory(MetaType.ExETH, new GeneralMetaFactory(MetaType.ExETH));
})(MingKeMing);
(function (ns) {
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
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
    Class(GeneralDocumentFactory, Object, [Document.Factory], null);
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
        var identifier = ID.parse(doc["ID"]);
        if (!identifier) {
            return null;
        }
        var gf = general_factory();
        var type = gf.getDocumentType(doc);
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
    var general_factory = function () {
        var man = ns.mkm.FactoryManager;
        return man.generalFactory;
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
    if (typeof ns.cpu !== "object") {
        ns.cpu = {};
    }
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var TwinsHelper = function (facebook, messenger) {
        Object.call(this);
        this.__facebook = facebook;
        this.__messenger = messenger;
    };
    Class(TwinsHelper, Object, null, null);
    TwinsHelper.prototype.getFacebook = function () {
        return this.__facebook;
    };
    TwinsHelper.prototype.getMessenger = function () {
        return this.__messenger;
    };
    ns.TwinsHelper = TwinsHelper;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var BaseUser = ns.mkm.BaseUser;
    var Bot = function (identifier) {
        BaseUser.call(this, identifier);
    };
    Class(Bot, BaseUser, null, null);
    ns.mkm.Bot = Bot;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var BaseObject = ns.type.BaseObject;
    var ID = ns.protocol.ID;
    var Address = ns.protocol.Address;
    var User = ns.mkm.User;
    var BaseUser = ns.mkm.BaseUser;
    var Station = function () {
        BaseObject.call(this);
        var user;
        var host, port;
        if (arguments.length === 1) {
            user = new BaseUser(arguments[0]);
            host = null;
            port = 0;
        } else {
            if (arguments.length === 2) {
                user = new BaseUser(Station.ANY);
                host = arguments[0];
                port = arguments[1];
            } else {
                if (arguments.length === 3) {
                    user = new BaseUser(arguments[0]);
                    host = arguments[1];
                    port = arguments[2];
                }
            }
        }
        this.__user = user;
        this.__host = host;
        this.__port = port;
    };
    Class(Station, BaseObject, [User], {
        equals: function (other) {
            if (this === other) {
                return true;
            } else {
                if (!other) {
                    return false;
                }
            }
            return this.__user.equals(other);
        },
        valueOf: function () {
            return desc.call(this);
        },
        toString: function () {
            return desc.call(this);
        },
        setDataSource: function (delegate) {
            this.__user.setDataSource(delegate);
        },
        getDataSource: function () {
            return this.__user.getDataSource();
        },
        getIdentifier: function () {
            return this.__user.getIdentifier();
        },
        getType: function () {
            return this.__user.getType();
        },
        getMeta: function () {
            return this.__user.getMeta();
        },
        getDocument: function (type) {
            return this.__user.getDocument(type);
        },
        getVisa: function () {
            return this.__user.getVisa();
        },
        getContacts: function () {
            return this.__user.getContacts();
        },
        verify: function (data, signature) {
            return this.__user.verify(data, signature);
        },
        encrypt: function (plaintext) {
            return this.__user.encrypt(plaintext);
        },
        sign: function (data) {
            return this.__user.sign(data);
        },
        decrypt: function (ciphertext) {
            return this.__user.decrypt(ciphertext);
        },
        signVisa: function (doc) {
            return this.__user.signVisa(doc);
        },
        verifyVisa: function (doc) {
            return this.__user.verifyVisa(doc);
        },
        setIdentifier: function (identifier) {
            var delegate = this.getDataSource();
            var user = new BaseUser(identifier);
            user.setDataSource(delegate);
            this.__user = user;
        },
        getHost: function () {
            if (this.__host === null) {
                var doc = this.getDocument("*");
                if (doc) {
                    this.__host = doc.getProperty("host");
                }
            }
            return this.__host;
        },
        getPort: function () {
            if (this.__port === 0) {
                var doc = this.getDocument("*");
                if (doc) {
                    this.__port = doc.getProperty("port");
                }
            }
            return this.__port;
        }
    });
    var desc = function () {
        var clazz = Object.getPrototypeOf(this).constructor.name;
        var id = this.getIdentifier();
        var network = id.getAddress().getType();
        return (
            "<" +
            clazz +
            ' id="' +
            id.toString() +
            '" network="' +
            network +
            '" host="' +
            this.getHost() +
            '" port=' +
            this.getPort() +
            " />"
        );
    };
    Station.ANY = ID.create("station", Address.ANYWHERE, null);
    Station.EVERY = ID.create("stations", Address.EVERYWHERE, null);
    ns.mkm.Station = Station;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var BaseGroup = ns.mkm.BaseGroup;
    var ServiceProvider = function (identifier) {
        BaseGroup.call(this, identifier);
    };
    Class(ServiceProvider, BaseGroup, null, {
        getStations: function () {
            return this.getMembers();
        }
    });
    ns.mkm.ServiceProvider = ServiceProvider;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var ContentProcessor = Interface(null, null);
    ContentProcessor.prototype.process = function (content, rMsg) {
        throw new Error("NotImplemented");
    };
    var Creator = Interface(null, null);
    Creator.prototype.createContentProcessor = function (type) {
        throw new Error("NotImplemented");
    };
    Creator.prototype.createCommandProcessor = function (type, cmd) {
        throw new Error("NotImplemented");
    };
    var Factory = Interface(null, null);
    Factory.prototype.getProcessor = function (content) {
        throw new Error("NotImplemented");
    };
    Factory.prototype.getContentProcessor = function (type) {
        throw new Error("NotImplemented");
    };
    Factory.prototype.getCommandProcessor = function (type, cmd) {
        throw new Error("NotImplemented");
    };
    ContentProcessor.Creator = Creator;
    ContentProcessor.Factory = Factory;
    ns.cpu.ContentProcessor = ContentProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var BaseContentProcessor = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    Class(BaseContentProcessor, TwinsHelper, [ContentProcessor], null);
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
    var BaseCommandProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    Class(BaseCommandProcessor, BaseContentProcessor, null, {
        process: function (cmd, rMsg) {
            var text = "Command (name: " + cmd.getCmd() + ") not support yet!";
            return this.respondText(text, cmd.getGroup());
        }
    });
    ns.cpu.BaseContentProcessor = BaseContentProcessor;
    ns.cpu.BaseCommandProcessor = BaseCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var ContentProcessorCreator = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    Class(ContentProcessorCreator, TwinsHelper, [ContentProcessor.Creator], {
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (ContentType.FORWARD.equals(type)) {
                return new ns.cpu.ForwardContentProcessor(facebook, messenger);
            }
            if (ContentType.COMMAND.equals(type)) {
                return new ns.cpu.BaseCommandProcessor(facebook, messenger);
            }
            return null;
        },
        createCommandProcessor: function (type, cmd) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (cmd === Command.META) {
                return new ns.cpu.MetaCommandProcessor(facebook, messenger);
            } else {
                if (cmd === Command.DOCUMENT) {
                    return new ns.cpu.DocumentCommandProcessor(facebook, messenger);
                }
            }
            return null;
        }
    });
    ns.cpu.ContentProcessorCreator = ContentProcessorCreator;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
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
    Class(ContentProcessorFactory, TwinsHelper, [ContentProcessor.Factory], null);
    ContentProcessorFactory.prototype.getProcessor = function (content) {
        var cpu;
        var type = content.getType();
        if (Interface.conforms(content, Command)) {
            var name = content.getCmd();
            cpu = this.getCommandProcessor(type, name);
            if (cpu) {
                return cpu;
            } else {
                if (Interface.conforms(content, GroupCommand)) {
                    cpu = this.getCommandProcessor(type, "group");
                    if (cpu) {
                        return cpu;
                    }
                }
            }
        }
        return this.getContentProcessor(type);
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
    ContentProcessorFactory.prototype.getCommandProcessor = function (type, cmd) {
        var cpu = this.__command_processors[cmd];
        if (!cpu) {
            cpu = this.__creator.createCommandProcessor(type, cmd);
            if (cpu) {
                this.__command_processors[cmd] = cpu;
            }
        }
        return cpu;
    };
    ns.cpu.ContentProcessorFactory = ContentProcessorFactory;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var MetaCommand = ns.protocol.MetaCommand;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var MetaCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(MetaCommandProcessor, BaseCommandProcessor, null, {
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
            return [res];
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
        } else {
            text = "Meta not accepted: " + identifier;
        }
        return this.respondText(text, null);
    };
    ns.cpu.MetaCommandProcessor = MetaCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var MetaCommandProcessor = ns.cpu.MetaCommandProcessor;
    var DocumentCommandProcessor = function (facebook, messenger) {
        MetaCommandProcessor.call(this, facebook, messenger);
    };
    Class(DocumentCommandProcessor, MetaCommandProcessor, null, {
        process: function (content, rMsg) {
            var identifier = content.getIdentifier();
            if (identifier) {
                var doc = content.getDocument();
                if (!doc) {
                    var type = content.getString("doc_type");
                    if (!type) {
                        type = "*";
                    }
                    return get_doc.call(this, identifier, type);
                } else {
                    if (identifier.equals(doc.getIdentifier())) {
                        var meta = content.getMeta();
                        return put_doc.call(this, identifier, meta, doc);
                    }
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
            return [res];
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
        } else {
            text = "Document not accept: " + identifier;
        }
        return this.respondText(text, null);
    };
    ns.cpu.DocumentCommandProcessor = DocumentCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ForwardContent = ns.protocol.ForwardContent;
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var ForwardContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    Class(ForwardContentProcessor, BaseContentProcessor, null, {
        process: function (content, rMsg) {
            var secrets = content.getSecrets();
            if (!secrets) {
                return null;
            }
            var messenger = this.getMessenger();
            var responses = [];
            var res;
            var results;
            for (var i = 0; i < secrets.length; ++i) {
                results = messenger.processReliableMessage(secrets[i]);
                if (!results) {
                    res = ForwardContent.create([]);
                } else {
                    if (results.length === 1) {
                        res = ForwardContent.create(results[0]);
                    } else {
                        res = ForwardContent.create(results);
                    }
                }
                responses.push(res);
            }
            return responses;
        }
    });
    ns.cpu.ForwardContentProcessor = ForwardContentProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ArrayContent = ns.protocol.ArrayContent;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var ArrayContentProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(ArrayContentProcessor, BaseCommandProcessor, null, {
        process: function (content, rMsg) {
            var array = content.getContents();
            if (!array) {
                return null;
            }
            var messenger = this.getMessenger();
            var responses = [];
            var res;
            var results;
            for (var i = 0; i < array.length; ++i) {
                results = messenger.processContent(array[i], rMsg);
                if (!results) {
                    res = ArrayContent.create([]);
                } else {
                    if (results.length === 1) {
                        res = results[0];
                    } else {
                        res = ArrayContent.create(results);
                    }
                }
                responses.push(res);
            }
            return responses;
        }
    });
    ns.cpu.ArrayContentProcessor = ArrayContentProcessor;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var CustomizedContentHandler = Interface(null, null);
    CustomizedContentHandler.prototype.handleAction = function (
        act,
        sender,
        content,
        rMsg
    ) {
        throw new Error("NotImplemented");
    };
    var CustomizedContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    Class(
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
                var act = rMsg.getAction();
                var sender = rMsg.getSender();
                return handler.handleAction(act, sender, content, rMsg);
            },
            filterApplication: function (app, content, rMsg) {
                var text = "Customized Content (app: " + app + ") not support yet!";
                return this.respondText(text, content.getGroup());
            },
            fetchHandler: function (mod, content, rMsg) {
                return this;
            },
            handleAction: function (act, sender, content, rMsg) {
                var app = content.getApplication();
                var mod = content.getModule();
                var text =
                    "Customized Content (app: " +
                    app +
                    ", mod: " +
                    mod +
                    ", act: " +
                    act +
                    ") not support yet!";
                return this.respondText(text, content.getGroup());
            }
        }
    );
    ns.cpu.CustomizedContentHandler = CustomizedContentHandler;
    ns.cpu.CustomizedContentProcessor = CustomizedContentProcessor;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
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
        "document",
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
        "bot",
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
    var AddressNameService = Interface(null, null);
    AddressNameService.KEYWORDS = KEYWORDS;
    AddressNameService.prototype.isReserved = function (name) {
        throw new Error("NotImplemented");
    };
    AddressNameService.prototype.getIdentifier = function (name) {
        throw new Error("NotImplemented");
    };
    AddressNameService.prototype.getNames = function (identifier) {
        throw new Error("NotImplemented");
    };
    ns.AddressNameService = AddressNameService;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var EntityType = ns.protocol.EntityType;
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var BaseUser = ns.mkm.BaseUser;
    var BaseGroup = ns.mkm.BaseGroup;
    var Bot = ns.mkm.Bot;
    var Station = ns.mkm.Station;
    var ServiceProvider = ns.mkm.ServiceProvider;
    var Barrack = ns.Barrack;
    var Facebook = function () {
        Barrack.call(this);
        this.__users = {};
        this.__groups = {};
    };
    Class(Facebook, Barrack, null, {
        checkDocument: function (doc) {
            var identifier = doc.getIdentifier();
            if (!identifier) {
                return false;
            }
            var meta;
            if (identifier.isGroup()) {
                var owner = this.getOwner(identifier);
                if (!owner) {
                    if (EntityType.GROUP.equals(identifier.getType())) {
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
            var mMeta = this.getMeta(member);
            return Meta.matchKey(mMeta.getKey(), gMeta);
        },
        isOwner: function (member, group) {
            if (EntityType.GROUP.equals(group.getType())) {
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
    Facebook.prototype.reduceMemory = function () {
        var finger = 0;
        finger = ns.mkm.thanos(this.__users, finger);
        finger = ns.mkm.thanos(this.__groups, finger);
        return finger >> 1;
    };
    Facebook.prototype.saveMeta = function (meta, identifier) {
        throw new Error("NotImplemented");
    };
    Facebook.prototype.saveDocument = function (doc) {
        throw new Error("NotImplemented");
    };
    Facebook.prototype.saveMembers = function (members, identifier) {
        throw new Error("NotImplemented");
    };
    Facebook.prototype.createUser = function (identifier) {
        if (identifier.isBroadcast()) {
            return new BaseUser(identifier);
        }
        var type = identifier.getType();
        if (EntityType.STATION.equals(type)) {
            return new Station(identifier);
        } else {
            if (EntityType.BOT.equals(type)) {
                return new Bot(identifier);
            }
        }
        return new BaseUser(identifier);
    };
    Facebook.prototype.createGroup = function (identifier) {
        if (identifier.isBroadcast()) {
            return new BaseGroup(identifier);
        }
        var type = identifier.getType();
        if (EntityType.ISP.equals(type)) {
            return new ServiceProvider(identifier);
        }
        return new BaseGroup(identifier);
    };
    Facebook.prototype.getLocalUsers = function () {
        throw new Error("NotImplemented");
    };
    ns.Facebook = Facebook;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Command = ns.protocol.Command;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var Packer = ns.Packer;
    var TwinsHelper = ns.TwinsHelper;
    var MessagePacker = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    Class(MessagePacker, TwinsHelper, [Packer], {
        getOvertGroup: function (content) {
            var group = content.getGroup();
            if (!group) {
                return null;
            }
            if (group.isBroadcast()) {
                return group;
            }
            if (Interface.conforms(content, Command)) {
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
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var Processor = ns.Processor;
    var TwinsHelper = ns.TwinsHelper;
    var MessageProcessor = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
        this.__factory = this.createFactory();
    };
    Class(MessageProcessor, TwinsHelper, [Processor], {
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
                if (!msg) {
                    continue;
                }
                messages.push(msg);
            }
            return messages;
        },
        processContent: function (content, rMsg) {
            var cpu = this.getProcessor(content);
            if (!cpu) {
                cpu = this.getContentProcessor(0);
            }
            return cpu.process(content, rMsg);
        }
    });
    MessageProcessor.prototype.getProcessor = function (content) {
        return this.__factory.getProcessor(content);
    };
    MessageProcessor.prototype.getContentProcessor = function (type) {
        return this.__factory.getContentProcessor(type);
    };
    MessageProcessor.prototype.getCommandProcessor = function (type, cmd) {
        return this.__factory.getCommandProcessor(type, cmd);
    };
    ns.MessageProcessor = MessageProcessor;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var CipherKeyDelegate = Interface(null, null);
    CipherKeyDelegate.prototype.getCipherKey = function (from, to, generate) {
        throw new Error("NotImplemented");
    };
    CipherKeyDelegate.prototype.cacheCipherKey = function (from, to, key) {
        throw new Error("NotImplemented");
    };
    ns.CipherKeyDelegate = CipherKeyDelegate;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Transceiver = ns.Transceiver;
    var Messenger = function () {
        Transceiver.call(this);
    };
    Class(Messenger, Transceiver, null, null);
    Messenger.prototype.getCipherKeyDelegate = function () {
        throw new Error("NotImplemented");
    };
    Messenger.prototype.getPacker = function () {
        throw new Error("NotImplemented");
    };
    Messenger.prototype.getProcessor = function () {
        throw new Error("NotImplemented");
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
        return Transceiver.prototype.isBroadcast(msg);
    };
    ns.Messenger = Messenger;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Content = ns.protocol.Content;
    var Command = ns.protocol.Command;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseHistoryCommand = ns.dkd.cmd.BaseHistoryCommand;
    var BaseGroupCommand = ns.dkd.cmd.BaseGroupCommand;
    var ContentFactory = function (clazz) {
        Object.call(this);
        this.__class = clazz;
    };
    Class(ContentFactory, Object, [Content.Factory], null);
    ContentFactory.prototype.parseContent = function (content) {
        return new this.__class(content);
    };
    var CommandFactory = function (clazz) {
        Object.call(this);
        this.__class = clazz;
    };
    Class(CommandFactory, Object, [Command.Factory], null);
    CommandFactory.prototype.parseCommand = function (content) {
        return new this.__class(content);
    };
    var GeneralCommandFactory = function () {
        Object.call(this);
    };
    Class(
        GeneralCommandFactory,
        Object,
        [Content.Factory, Command.Factory],
        null
    );
    var general_factory = function () {
        var man = ns.dkd.cmd.FactoryManager;
        return man.generalFactory;
    };
    GeneralCommandFactory.prototype.parseContent = function (content) {
        var gf = general_factory();
        var cmd = gf.getCmd(content);
        var factory = gf.getCommandFactory(cmd);
        if (!factory) {
            if (content["group"]) {
                factory = gf.getCommandFactory("group");
            }
            if (!factory) {
                factory = this;
            }
        }
        return factory.parseCommand(content);
    };
    GeneralCommandFactory.prototype.parseCommand = function (cmd) {
        return new BaseCommand(cmd);
    };
    var HistoryCommandFactory = function () {
        GeneralCommandFactory.call(this);
    };
    Class(HistoryCommandFactory, GeneralCommandFactory, null, null);
    HistoryCommandFactory.prototype.parseCommand = function (cmd) {
        return new BaseHistoryCommand(cmd);
    };
    var GroupCommandFactory = function () {
        HistoryCommandFactory.call(this);
    };
    Class(GroupCommandFactory, HistoryCommandFactory, null, null);
    GroupCommandFactory.prototype.parseContent = function (content) {
        var gf = general_factory();
        var cmd = gf.getCmd(content);
        var factory = gf.getCommandFactory(cmd);
        if (!factory) {
            factory = this;
        }
        return factory.parseCommand(content);
    };
    GroupCommandFactory.prototype.parseCommand = function (cmd) {
        return new BaseGroupCommand(cmd);
    };
    ns.ContentFactory = ContentFactory;
    ns.CommandFactory = CommandFactory;
    ns.GeneralCommandFactory = GeneralCommandFactory;
    ns.HistoryCommandFactory = HistoryCommandFactory;
    ns.GroupCommandFactory = GroupCommandFactory;
})(DIMP);
(function (ns) {
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var EnvelopeFactory = ns.dkd.EnvelopeFactory;
    var InstantMessageFactory = ns.dkd.InstantMessageFactory;
    var SecureMessageFactory = ns.dkd.SecureMessageFactory;
    var ReliableMessageFactory = ns.dkd.ReliableMessageFactory;
    var ContentFactory = ns.ContentFactory;
    var CommandFactory = ns.CommandFactory;
    var GeneralCommandFactory = ns.GeneralCommandFactory;
    var HistoryCommandFactory = ns.HistoryCommandFactory;
    var GroupCommandFactory = ns.GroupCommandFactory;
    var registerMessageFactories = function () {
        Envelope.setFactory(new EnvelopeFactory());
        InstantMessage.setFactory(new InstantMessageFactory());
        SecureMessage.setFactory(new SecureMessageFactory());
        ReliableMessage.setFactory(new ReliableMessageFactory());
    };
    var registerContentFactories = function () {
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
        Content.setFactory(
            ContentType.ARRAY,
            new ContentFactory(ns.dkd.ListContent)
        );
        Content.setFactory(
            ContentType.FORWARD,
            new ContentFactory(ns.dkd.SecretContent)
        );
        Content.setFactory(0, new ContentFactory(ns.dkd.BaseContent));
    };
    var registerCommandFactories = function () {
        Command.setFactory(
            Command.META,
            new CommandFactory(ns.dkd.cmd.BaseMetaCommand)
        );
        Command.setFactory(
            Command.DOCUMENT,
            new CommandFactory(ns.dkd.cmd.BaseDocumentCommand)
        );
        Command.setFactory("group", new GroupCommandFactory());
        Command.setFactory(
            GroupCommand.INVITE,
            new CommandFactory(ns.dkd.cmd.InviteGroupCommand)
        );
        Command.setFactory(
            GroupCommand.EXPEL,
            new CommandFactory(ns.dkd.cmd.ExpelGroupCommand)
        );
        Command.setFactory(
            GroupCommand.JOIN,
            new CommandFactory(ns.dkd.cmd.JoinGroupCommand)
        );
        Command.setFactory(
            GroupCommand.QUIT,
            new CommandFactory(ns.dkd.cmd.QuitGroupCommand)
        );
        Command.setFactory(
            GroupCommand.QUERY,
            new CommandFactory(ns.dkd.cmd.QueryGroupCommand)
        );
        Command.setFactory(
            GroupCommand.RESET,
            new CommandFactory(ns.dkd.cmd.ResetGroupCommand)
        );
    };
    var registerAllFactories = function () {
        registerMessageFactories();
        registerContentFactories();
        registerCommandFactories();
        Content.setFactory(
            ContentType.CUSTOMIZED,
            new ContentFactory(ns.dkd.AppCustomizedContent)
        );
        Content.setFactory(
            ContentType.APPLICATION,
            new ContentFactory(ns.dkd.AppCustomizedContent)
        );
    };
    ns.registerMessageFactories = registerMessageFactories;
    ns.registerContentFactories = registerContentFactories;
    ns.registerCommandFactories = registerCommandFactories;
    ns.registerAllFactories = registerAllFactories;
})(DIMP);
if (typeof FiniteStateMachine !== "object") {
    FiniteStateMachine = {};
}
(function (ns) {
    if (typeof ns.skywalker !== "object") {
        ns.skywalker = {};
    }
    if (typeof ns.threading !== "object") {
        ns.threading = {};
    }
})(FiniteStateMachine);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Runnable = Interface(null, null);
    Runnable.prototype.run = function () {
        throw new Error("NotImplemented");
    };
    ns.skywalker.Runnable = Runnable;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Handler = Interface(null, null);
    Handler.prototype.setup = function () {
        throw new Error("NotImplemented");
    };
    Handler.prototype.handle = function () {
        throw new Error("NotImplemented");
    };
    Handler.prototype.finish = function () {
        throw new Error("NotImplemented");
    };
    ns.skywalker.Handler = Handler;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Processor = Interface(null, null);
    Processor.prototype.process = function () {
        throw new Error("NotImplemented");
    };
    ns.skywalker.Processor = Processor;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var Runnable = ns.skywalker.Runnable;
    var Handler = ns.skywalker.Handler;
    var Processor = ns.skywalker.Processor;
    var STAGE_INIT = 0;
    var STAGE_HANDLING = 1;
    var STAGE_CLEANING = 2;
    var STAGE_STOPPED = 3;
    var Runner = function () {
        Object.call(this);
        this.__running = false;
        this.__stage = STAGE_INIT;
    };
    Class(Runner, Object, [Runnable, Handler, Processor], {
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
                } catch (e) {}
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
            this.__running = true;
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
        }
    });
    Runner.prototype.isRunning = function () {
        return this.__running;
    };
    Runner.prototype.stop = function () {
        this.__running = false;
    };
    ns.skywalker.Runner = Runner;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var Runnable = ns.skywalker.Runnable;
    var Thread = function () {
        Object.call(this);
        if (arguments.length === 0) {
            this.__target = null;
        } else {
            this.__target = arguments[0];
        }
        this.__running = false;
    };
    Class(Thread, Object, [Runnable], null);
    Thread.INTERVAL = 256;
    Thread.prototype.start = function () {
        this.__running = true;
        run(this);
    };
    var run = function (thread) {
        var running = thread.isRunning() && thread.run();
        if (running) {
            setTimeout(function () {
                run(thread);
            }, Thread.INTERVAL);
        }
    };
    Thread.prototype.isRunning = function () {
        return this.__running;
    };
    Thread.prototype.run = function () {
        var target = this.__target;
        if (!target || target === this) {
            throw new SyntaxError("Thread::run() > override me!");
        } else {
            if (typeof target === "function") {
                return target();
            } else {
                if (Interface.conforms(target, Runnable)) {
                    return target.run();
                } else {
                    throw new SyntaxError(
                        "Thread::run() > target is not runnable: " + target
                    );
                }
            }
        }
    };
    Thread.prototype.stop = function () {
        this.__running = false;
    };
    ns.threading.Thread = Thread;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Ticker = Interface(null, null);
    Ticker.prototype.tick = function (now, elapsed) {
        throw new Error("NotImplemented");
    };
    ns.threading.Ticker = Ticker;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var Runner = ns.skywalker.Runner;
    var Thread = ns.threading.Thread;
    var Metronome = function (millis) {
        Runner.call(this);
        if (millis < Metronome.MIN_INTERVAL) {
            millis = Metronome.MIN_INTERVAL;
        }
        this.__interval = millis;
        this.__last_time = 0;
        this.__thread = new Thread(this);
        this.__tickers = [];
    };
    Class(Metronome, Runner, null, null);
    Metronome.MIN_INTERVAL = 100;
    Metronome.prototype.start = function () {
        this.__thread.start();
    };
    Metronome.prototype.stop = function () {
        this.__thread.stop();
    };
    Metronome.prototype.setup = function () {
        this.__last_time = new Date().getTime();
        return false;
    };
    Metronome.prototype.process = function () {
        var tickers = this.getTickers();
        if (tickers.length === 0) {
            return false;
        }
        var now = new Date().getTime();
        var elapsed = now - this.__last_time;
        if (elapsed < this.__interval) {
            return false;
        }
        for (var i = tickers.length - 1; i >= 0; --i) {
            try {
                tickers[i].tick(now, elapsed);
            } catch (e) {}
        }
        this.__last_time = now;
        return true;
    };
    Metronome.prototype.getTickers = function () {
        return this.__tickers.slice();
    };
    Metronome.prototype.addTicker = function (ticker) {
        if (this.__tickers.indexOf(ticker) < 0) {
            this.__tickers.push(ticker);
            return true;
        } else {
            return false;
        }
    };
    Metronome.prototype.removeTicker = function (ticker) {
        var index = this.__tickers.indexOf(ticker);
        if (index < 0) {
            return false;
        } else {
            this.__tickers.splice(index, 1);
            return true;
        }
    };
    var PrimeMetronome = {
        addTicker: function (ticker) {
            var metronome = this.getInstance();
            return metronome.addTicker(ticker);
        },
        removeTicker: function (ticker) {
            var metronome = this.getInstance();
            return metronome.removeTicker(ticker);
        },
        getInstance: function () {
            var metronome = this.__sharedMetronome;
            if (metronome === null) {
                metronome = new Metronome(200);
                metronome.start();
                this.__sharedMetronome = metronome;
            }
            return metronome;
        },
        __sharedMetronome: null
    };
    ns.threading.Metronome = Metronome;
    ns.threading.PrimeMetronome = PrimeMetronome;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Enum = sys.type.Enum;
    var Context = Interface(null, null);
    var Status = Enum(null, { Stopped: 0, Running: 1, Paused: 2 });
    ns.Context = Context;
    ns.Status = Status;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var Transition = Interface(null, null);
    Transition.prototype.evaluate = function (machine, now) {
        throw new Error("NotImplemented");
    };
    var BaseTransition = function (targetStateName) {
        Object.call(this);
        this.__target = targetStateName;
    };
    Class(BaseTransition, Object, [Transition], null);
    BaseTransition.prototype.getTarget = function () {
        return this.__target;
    };
    ns.Transition = Transition;
    ns.BaseTransition = BaseTransition;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var BaseObject = sys.type.BaseObject;
    var State = Interface(null, null);
    State.prototype.onEnter = function (previous, machine, now) {
        throw new Error("NotImplemented");
    };
    State.prototype.onExit = function (next, machine, now) {
        throw new Error("NotImplemented");
    };
    State.prototype.onPause = function (machine) {
        throw new Error("NotImplemented");
    };
    State.prototype.onResume = function (machine) {
        throw new Error("NotImplemented");
    };
    State.prototype.evaluate = function (machine, now) {
        throw new Error("NotImplemented");
    };
    var BaseState = function () {
        BaseObject.call(this);
        this.__transitions = [];
    };
    Class(BaseState, BaseObject, [State], null);
    BaseState.prototype.addTransition = function (transition) {
        if (this.__transitions.indexOf(transition) >= 0) {
            throw new Error("transition exists: " + transition);
        }
        this.__transitions.push(transition);
    };
    BaseState.prototype.evaluate = function (machine, now) {
        var transition;
        for (var index = 0; index < this.__transitions.length; ++index) {
            transition = this.__transitions[index];
            if (transition.evaluate(machine, now)) {
                return transition;
            }
        }
    };
    ns.State = State;
    ns.BaseState = BaseState;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Delegate = Interface(null, null);
    Delegate.prototype.enterState = function (next, machine) {
        throw new Error("NotImplemented");
    };
    Delegate.prototype.exitState = function (previous, machine) {
        throw new Error("NotImplemented");
    };
    Delegate.prototype.pauseState = function (current, machine) {
        throw new Error("NotImplemented");
    };
    Delegate.prototype.resumeState = function (current, machine) {
        throw new Error("NotImplemented");
    };
    ns.Delegate = Delegate;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Ticker = ns.threading.Ticker;
    var Machine = Interface(null, [Ticker]);
    Machine.prototype.getCurrentState = function () {
        throw new Error("NotImplemented");
    };
    Machine.prototype.start = function () {
        throw new Error("NotImplemented");
    };
    Machine.prototype.stop = function () {
        throw new Error("NotImplemented");
    };
    Machine.prototype.pause = function () {
        throw new Error("NotImplemented");
    };
    Machine.prototype.resume = function () {
        throw new Error("NotImplemented");
    };
    ns.Machine = Machine;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var Status = ns.Status;
    var Machine = ns.Machine;
    var BaseMachine = function (defaultStateName) {
        Object.call(this);
        this.__default = defaultStateName ? defaultStateName : "default";
        this.__current = null;
        this.__status = Status.Stopped;
        this.__delegate = null;
        this.__states = {};
    };
    Class(BaseMachine, Object, [Machine], null);
    BaseMachine.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate;
    };
    BaseMachine.prototype.getDelegate = function () {
        return this.__delegate;
    };
    BaseMachine.prototype.getContext = function () {
        throw new Error("NotImplemented");
    };
    BaseMachine.prototype.setState = function (name, state) {
        this.__states[name] = state;
    };
    BaseMachine.prototype.getState = function (name) {
        return this.__states[name];
    };
    BaseMachine.prototype.getDefaultState = function () {
        return this.__states[this.__default];
    };
    BaseMachine.prototype.getTargetState = function (transition) {
        var name = transition.getTarget();
        return this.__states[name];
    };
    BaseMachine.prototype.getCurrentState = function () {
        return this.__current;
    };
    BaseMachine.prototype.setCurrentState = function (state) {
        return (this.__current = state);
    };
    var states_changed = function (oldState, newState) {
        if (!oldState) {
            if (!newState) {
                return false;
            }
        } else {
            if (oldState.equals(newState)) {
                return false;
            }
        }
        return true;
    };
    BaseMachine.prototype.changeState = function (newState, now) {
        var oldState = this.getCurrentState();
        if (!states_changed(oldState, newState)) {
            return false;
        }
        var machine = this.getContext();
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.enterState(newState, machine);
        }
        if (oldState) {
            oldState.onExit(newState, machine, now);
        }
        this.setCurrentState(newState);
        if (newState) {
            newState.onEnter(oldState, machine, now);
        }
        if (delegate) {
            delegate.exitState(oldState, machine);
        }
        return true;
    };
    BaseMachine.prototype.start = function () {
        var now = new Date().getTime();
        this.changeState(this.getDefaultState(), now);
        this.__status = Status.Running;
    };
    BaseMachine.prototype.stop = function () {
        this.__status = Status.Stopped;
        var now = new Date().getTime();
        this.changeState(null, now);
    };
    BaseMachine.prototype.pause = function () {
        var machine = this.getContext();
        var current = this.getCurrentState();
        var delegate = this.getDelegate();
        if (current) {
            current.onPause(machine);
        }
        this.__status = Status.Paused;
        if (delegate) {
            delegate.pauseState(current, machine);
        }
    };
    BaseMachine.prototype.resume = function () {
        var machine = this.getContext();
        var current = this.getCurrentState();
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.resumeState(current, machine);
        }
        this.__status = Status.Running;
        current.onResume(machine);
    };
    BaseMachine.prototype.tick = function (now, elapsed) {
        var machine = this.getContext();
        var current = this.getCurrentState();
        if (current && Status.Running.equals(this.__status)) {
            var transition = current.evaluate(machine, now);
            if (transition) {
                var next = this.getTargetState(transition);
                this.changeState(next, now);
            }
        }
    };
    ns.BaseMachine = BaseMachine;
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var PrimeMetronome = ns.threading.PrimeMetronome;
    var BaseMachine = ns.BaseMachine;
    var AutoMachine = function (defaultStateName) {
        BaseMachine.call(this, defaultStateName);
    };
    Class(AutoMachine, BaseMachine, null, {
        start: function () {
            BaseMachine.prototype.start.call(this);
            var timer = PrimeMetronome.getInstance();
            timer.addTicker(this);
        },
        stop: function () {
            var timer = PrimeMetronome.getInstance();
            timer.removeTicker(this);
            BaseMachine.prototype.stop.call(this);
        }
    });
    ns.AutoMachine = AutoMachine;
})(FiniteStateMachine, MONKEY);
if (typeof StarTrek !== "object") {
    StarTrek = {};
}
(function (ns) {
    if (typeof ns.type !== "object") {
        ns.type = {};
    }
    if (typeof ns.net !== "object") {
        ns.net = {};
    }
    if (typeof ns.port !== "object") {
        ns.port = {};
    }
    if (typeof ns.socket !== "object") {
        ns.socket = {};
    }
})(StarTrek);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var Stringer = sys.type.Stringer;
    var ConstantString = sys.type.ConstantString;
    var SocketAddress = Interface(null, [Stringer]);
    SocketAddress.prototype.getHost = function () {
        throw new Error("NotImplemented");
    };
    SocketAddress.prototype.getPort = function () {
        throw new Error("NotImplemented");
    };
    var InetSocketAddress = function (host, port) {
        ConstantString.call(this, "(" + host + ":" + port + ")");
        this.__host = host;
        this.__port = port;
    };
    Class(InetSocketAddress, ConstantString, [SocketAddress], null);
    InetSocketAddress.prototype.getHost = function () {
        return this.__host;
    };
    InetSocketAddress.prototype.getPort = function () {
        return this.__port;
    };
    ns.type.SocketAddress = SocketAddress;
    ns.type.InetSocketAddress = InetSocketAddress;
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var KeyPairMap = Interface(null, null);
    KeyPairMap.prototype.values = function () {
        throw new Error("NotImplemented");
    };
    KeyPairMap.prototype.get = function (remote, local) {
        throw new Error("NotImplemented");
    };
    KeyPairMap.prototype.set = function (remote, local, value) {
        throw new Error("NotImplemented");
    };
    KeyPairMap.prototype.remove = function (remote, local, value) {
        throw new Error("NotImplemented");
    };
    ns.type.KeyPairMap = KeyPairMap;
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var KeyPairMap = ns.type.KeyPairMap;
    var HashKeyPairMap = function (any) {
        Object.call(this);
        this.__default = any;
        this.__map = {};
        this.__values = [];
    };
    Class(HashKeyPairMap, Object, [KeyPairMap], null);
    HashKeyPairMap.prototype.values = function () {
        return this.__values;
    };
    HashKeyPairMap.prototype.get = function (remote, local) {
        var keys = get_keys(remote, local, this.__default);
        var table = this.__map[keys[0]];
        if (!table) {
            return null;
        }
        var value;
        if (keys[1]) {
            value = table[keys[1]];
            if (value) {
                return value;
            }
            return table[this.__default];
        }
        value = table[this.__default];
        if (value) {
            return value;
        }
        var allKeys = Object.keys(table);
        for (var i = 0; i < allKeys.length; ++i) {
            value = table[allKeys[i]];
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
        var table = this.__map[keys[0]];
        if (table) {
            if (!value) {
                delete table[keys[1]];
            } else {
                table[keys[1]] = value;
            }
        } else {
            if (value) {
                table = {};
                table[keys[1]] = value;
                this.__map[keys[0]] = table;
            }
        }
    };
    HashKeyPairMap.prototype.remove = function (remote, local, value) {
        var keys = get_keys(remote, local, this.__default);
        var table = this.__map[keys[0]];
        var old = null;
        if (table) {
            old = table[keys[1]];
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
            return [localAddress, defaultAddress];
        } else {
            if (!localAddress) {
                return [remoteAddress, defaultAddress];
            } else {
                return [remoteAddress, localAddress];
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
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var InetSocketAddress = ns.type.InetSocketAddress;
    var HashKeyPairMap = ns.type.HashKeyPairMap;
    var AnyAddress = new InetSocketAddress("0.0.0.0", 0);
    var AddressPairMap = function () {
        HashKeyPairMap.call(this, AnyAddress);
    };
    Class(AddressPairMap, HashKeyPairMap, null, null);
    AddressPairMap.AnyAddress = AnyAddress;
    ns.type.AddressPairMap = AddressPairMap;
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var BaseObject = sys.type.BaseObject;
    var AddressPairObject = function (remote, local) {
        BaseObject.call(this);
        this.remoteAddress = remote;
        this.localAddress = local;
    };
    Class(AddressPairObject, BaseObject, null, null);
    AddressPairObject.prototype.getRemoteAddress = function () {
        return this.remoteAddress;
    };
    AddressPairObject.prototype.getLocalAddress = function () {
        return this.localAddress;
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
        return desc.call(this);
    };
    AddressPairObject.prototype.toString = function () {
        return desc.call(this);
    };
    var address_equals = function (address1, address2) {
        if (address1) {
            return address1.equals(address2);
        } else {
            return !address2;
        }
    };
    var desc = function () {
        var cname = this.constructor.name;
        var remote = this.getRemoteAddress();
        var local = this.getLocalAddress();
        if (remote) {
            remote = remote.toString();
        }
        if (local) {
            local = local.toString();
        }
        return "<" + cname + ' remote="' + remote + '" local="' + local + '" />';
    };
    ns.type.AddressPairObject = AddressPairObject;
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Channel = Interface(null, null);
    Channel.prototype.isOpen = function () {
        throw new Error("NotImplemented");
    };
    Channel.prototype.isBound = function () {
        throw new Error("NotImplemented");
    };
    Channel.prototype.isAlive = function () {
        throw new Error("NotImplemented");
    };
    Channel.prototype.close = function () {
        throw new Error("NotImplemented");
    };
    Channel.prototype.read = function (maxLen) {
        throw new Error("NotImplemented");
    };
    Channel.prototype.write = function (src) {
        throw new Error("NotImplemented");
    };
    Channel.prototype.configureBlocking = function (block) {
        throw new Error("NotImplemented");
    };
    Channel.prototype.isBlocking = function () {
        throw new Error("NotImplemented");
    };
    Channel.prototype.bind = function (local) {
        throw new Error("NotImplemented");
    };
    Channel.prototype.getLocalAddress = function () {
        throw new Error("NotImplemented");
    };
    Channel.prototype.isConnected = function () {
        throw new Error("NotImplemented");
    };
    Channel.prototype.connect = function (remote) {
        throw new Error("NotImplemented");
    };
    Channel.prototype.getRemoteAddress = function () {
        throw new Error("NotImplemented");
    };
    Channel.prototype.disconnect = function () {
        throw new Error("NotImplemented");
    };
    Channel.prototype.receive = function (maxLen) {
        throw new Error("NotImplemented");
    };
    Channel.prototype.send = function (src, target) {
        throw new Error("NotImplemented");
    };
    ns.net.Channel = Channel;
})(StarTrek, MONKEY);
(function (ns, fsm, sys) {
    var Class = sys.type.Class;
    var BaseState = fsm.BaseState;
    var ConnectionState = function (name) {
        BaseState.call(this);
        this.__name = name;
        this.__enterTime = 0;
    };
    Class(ConnectionState, BaseState, null, null);
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
            if (!other) {
                return false;
            } else {
                if (other instanceof ConnectionState) {
                    return this.__name === other.toString();
                } else {
                    return this.__name === other;
                }
            }
        }
    };
    ConnectionState.prototype.valueOf = function () {
        return this.__name;
    };
    ConnectionState.prototype.toString = function () {
        return this.__name;
    };
    ConnectionState.prototype.getName = function () {
        return this.__name;
    };
    ConnectionState.prototype.getEnterTime = function () {
        return this.__enterTime;
    };
    ConnectionState.prototype.onEnter = function (previous, machine, now) {
        this.__enterTime = now;
    };
    ConnectionState.prototype.onExit = function (next, machine, now) {
        this.__enterTime = 0;
    };
    ConnectionState.prototype.onPause = function (machine) {};
    ConnectionState.prototype.onResume = function (machine) {};
    ConnectionState.Delegate = fsm.Delegate;
    var StateBuilder = function (transitionBuilder) {
        Object.call(this);
        this.builder = transitionBuilder;
    };
    Class(StateBuilder, Object, null, {
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
    ns.net.ConnectionState = ConnectionState;
    ns.net.StateBuilder = StateBuilder;
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, fsm, sys) {
    var Class = sys.type.Class;
    var BaseTransition = fsm.BaseTransition;
    var ConnectionState = ns.net.ConnectionState;
    var StateTransition = function (targetStateName, evaluate) {
        BaseTransition.call(this, targetStateName);
        this.__evaluate = evaluate;
    };
    Class(StateTransition, BaseTransition, null, null);
    StateTransition.prototype.evaluate = function (machine, now) {
        return this.__evaluate.call(this, machine, now);
    };
    var TransitionBuilder = function () {
        Object.call(this);
    };
    Class(TransitionBuilder, Object, null, {
        getDefaultPreparingTransition: function () {
            return new StateTransition(ConnectionState.PREPARING, function (
                machine,
                now
            ) {
                var conn = machine.getConnection();
                return conn && conn.isOpen();
            });
        },
        getPreparingReadyTransition: function () {
            return new StateTransition(ConnectionState.READY, function (
                machine,
                now
            ) {
                var conn = machine.getConnection();
                return conn && conn.isAlive();
            });
        },
        getPreparingDefaultTransition: function () {
            return new StateTransition(ConnectionState.DEFAULT, function (
                machine,
                now
            ) {
                var conn = machine.getConnection();
                return !conn || !conn.isOpen();
            });
        },
        getReadyExpiredTransition: function () {
            return new StateTransition(ConnectionState.EXPIRED, function (
                machine,
                now
            ) {
                var conn = machine.getConnection();
                if (!conn || !conn.isAlive()) {
                    return false;
                }
                return !conn.isReceivedRecently(now);
            });
        },
        getReadyErrorTransition: function () {
            return new StateTransition(ConnectionState.ERROR, function (
                machine,
                now
            ) {
                var conn = machine.getConnection();
                return !conn || !conn.isAlive();
            });
        },
        getExpiredMaintainingTransition: function () {
            return new StateTransition(ConnectionState.MAINTAINING, function (
                machine,
                now
            ) {
                var conn = machine.getConnection();
                if (!conn || !conn.isAlive()) {
                    return false;
                }
                return conn.isSentRecently(now);
            });
        },
        getExpiredErrorTransition: function () {
            return new StateTransition(ConnectionState.ERROR, function (
                machine,
                now
            ) {
                var conn = machine.getConnection();
                if (!conn || !conn.isAlive()) {
                    return true;
                }
                return conn.isNotReceivedLongTimeAgo(now);
            });
        },
        getMaintainingReadyTransition: function () {
            return new StateTransition(ConnectionState.READY, function (
                machine,
                now
            ) {
                var conn = machine.getConnection();
                if (!conn || !conn.isAlive()) {
                    return false;
                }
                return conn.isReceivedRecently(now);
            });
        },
        getMaintainingExpiredTransition: function () {
            return new StateTransition(ConnectionState.EXPIRED, function (
                machine,
                now
            ) {
                var conn = machine.getConnection();
                if (!conn || !conn.isAlive()) {
                    return false;
                }
                return !conn.isSentRecently(now);
            });
        },
        getMaintainingErrorTransition: function () {
            return new StateTransition(ConnectionState.ERROR, function (
                machine,
                now
            ) {
                var conn = machine.getConnection();
                if (!conn || !conn.isAlive()) {
                    return true;
                }
                return conn.isNotReceivedLongTimeAgo(now);
            });
        },
        getErrorDefaultTransition: function () {
            return new StateTransition(ConnectionState.DEFAULT, function (
                machine,
                now
            ) {
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
    ns.net.StateTransition = StateTransition;
    ns.net.TransitionBuilder = TransitionBuilder;
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, fsm, sys) {
    var Class = sys.type.Class;
    var Context = fsm.Context;
    var BaseMachine = fsm.BaseMachine;
    var ConnectionState = ns.net.ConnectionState;
    var StateBuilder = ns.net.StateBuilder;
    var TransitionBuilder = ns.net.TransitionBuilder;
    var StateMachine = function (connection) {
        BaseMachine.call(this, ConnectionState.DEFAULT);
        this.__connection = connection;
        var builder = this.createStateBuilder();
        add_state(this, builder.getDefaultState());
        add_state(this, builder.getPreparingState());
        add_state(this, builder.getReadyState());
        add_state(this, builder.getExpiredState());
        add_state(this, builder.getMaintainingState());
        add_state(this, builder.getErrorState());
    };
    Class(StateMachine, BaseMachine, [Context], null);
    StateMachine.prototype.createStateBuilder = function () {
        return new StateBuilder(new TransitionBuilder());
    };
    StateMachine.prototype.getConnection = function () {
        return this.__connection;
    };
    StateMachine.prototype.getContext = function () {
        return this;
    };
    var add_state = function (machine, state) {
        machine.setState(state.getName(), state);
    };
    ns.net.StateMachine = StateMachine;
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, fsm, sys) {
    var Interface = sys.type.Interface;
    var Ticker = fsm.threading.Ticker;
    var Connection = Interface(null, [Ticker]);
    Connection.prototype.isOpen = function () {
        throw new Error("NotImplemented");
    };
    Connection.prototype.isBound = function () {
        throw new Error("NotImplemented");
    };
    Connection.prototype.isConnected = function () {
        throw new Error("NotImplemented");
    };
    Connection.prototype.isAlive = function () {
        throw new Error("NotImplemented");
    };
    Connection.prototype.getLocalAddress = function () {
        throw new Error("NotImplemented");
    };
    Connection.prototype.getRemoteAddress = function () {
        throw new Error("NotImplemented");
    };
    Connection.prototype.getState = function () {
        throw new Error("NotImplemented");
    };
    Connection.prototype.send = function (data) {
        throw new Error("NotImplemented");
    };
    Connection.prototype.onReceived = function (data) {
        throw new Error("NotImplemented");
    };
    Connection.prototype.close = function () {
        throw new Error("NotImplemented");
    };
    ns.net.Connection = Connection;
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var ConnectionDelegate = Interface(null, null);
    ConnectionDelegate.prototype.onConnectionStateChanged = function (
        previous,
        current,
        connection
    ) {
        throw new Error("NotImplemented");
    };
    ConnectionDelegate.prototype.onConnectionReceived = function (
        data,
        connection
    ) {
        throw new Error("NotImplemented");
    };
    ConnectionDelegate.prototype.onConnectionSent = function (
        sent,
        data,
        connection
    ) {
        throw new Error("NotImplemented");
    };
    ConnectionDelegate.prototype.onConnectionFailed = function (
        error,
        data,
        connection
    ) {
        throw new Error("NotImplemented");
    };
    ConnectionDelegate.prototype.onConnectionError = function (
        error,
        connection
    ) {
        throw new Error("NotImplemented");
    };
    ns.net.ConnectionDelegate = ConnectionDelegate;
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var TimedConnection = Interface(null, null);
    TimedConnection.prototype.getLastSentTime = function () {
        throw new Error("NotImplemented");
    };
    TimedConnection.prototype.getLastReceivedTime = function () {
        throw new Error("NotImplemented");
    };
    TimedConnection.prototype.isSentRecently = function () {
        throw new Error("NotImplemented");
    };
    TimedConnection.prototype.isReceivedRecently = function () {
        throw new Error("NotImplemented");
    };
    TimedConnection.prototype.isNotReceivedLongTimeAgo = function () {
        throw new Error("NotImplemented");
    };
    ns.net.TimedConnection = TimedConnection;
})(StarTrek, MONKEY);
(function (ns, fsm, sys) {
    var Interface = sys.type.Interface;
    var Processor = fsm.skywalker.Processor;
    var Hub = Interface(null, [Processor]);
    Hub.prototype.open = function (remote, local) {
        throw new Error("NotImplemented");
    };
    Hub.prototype.connect = function (remote, local) {
        throw new Error("NotImplemented");
    };
    ns.net.Hub = Hub;
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Enum = sys.type.Enum;
    var ShipStatus = Enum(null, {
        ASSEMBLING: 0,
        EXPIRED: 1,
        NEW: 16,
        WAITING: 17,
        TIMEOUT: 18,
        DONE: 19,
        FAILED: 20
    });
    var Ship = Interface(null, null);
    Ship.prototype.getSN = function () {
        throw new Error("NotImplemented");
    };
    Ship.prototype.touch = function (now) {
        throw new Error("NotImplemented");
    };
    Ship.prototype.getStatus = function (now) {
        throw new Error("NotImplemented");
    };
    ns.port.Ship = Ship;
    ns.port.ShipStatus = ShipStatus;
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Ship = ns.port.Ship;
    var Arrival = Interface(null, [Ship]);
    Arrival.prototype.assemble = function (income) {
        throw new Error("NotImplemented");
    };
    ns.port.Arrival = Arrival;
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Enum = sys.type.Enum;
    var Ship = ns.port.Ship;
    var DeparturePriority = Enum(null, { URGENT: -1, NORMAL: 0, SLOWER: 1 });
    var Departure = Interface(null, [Ship]);
    Departure.prototype.getPriority = function () {
        throw new Error("NotImplemented");
    };
    Departure.prototype.getFragments = function () {
        throw new Error("NotImplemented");
    };
    Departure.prototype.checkResponse = function (response) {
        throw new Error("NotImplemented");
    };
    Departure.prototype.isImportant = function () {
        throw new Error("NotImplemented");
    };
    Departure.Priority = DeparturePriority;
    ns.port.Departure = Departure;
})(StarTrek, MONKEY);
(function (ns, fsm, sys) {
    var Interface = sys.type.Interface;
    var Processor = fsm.skywalker.Processor;
    var Docker = Interface(null, [Processor]);
    Docker.prototype.isOpen = function () {
        throw new Error("NotImplemented");
    };
    Docker.prototype.isAlive = function () {
        throw new Error("NotImplemented");
    };
    Docker.prototype.getStatus = function () {
        throw new Error("NotImplemented");
    };
    Docker.prototype.getRemoteAddress = function () {
        throw new Error("NotImplemented");
    };
    Docker.prototype.getLocalAddress = function () {
        throw new Error("NotImplemented");
    };
    Docker.prototype.sendData = function (payload) {
        throw new Error("NotImplemented");
    };
    Docker.prototype.sendShip = function (ship) {
        throw new Error("NotImplemented");
    };
    Docker.prototype.processReceived = function (data) {
        throw new Error("NotImplemented");
    };
    Docker.prototype.heartbeat = function () {
        throw new Error("NotImplemented");
    };
    Docker.prototype.purge = function () {
        throw new Error("NotImplemented");
    };
    Docker.prototype.close = function () {
        throw new Error("NotImplemented");
    };
    ns.port.Docker = Docker;
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Enum = sys.type.Enum;
    var DockerStatus = Enum(null, { ERROR: -1, INIT: 0, PREPARING: 1, READY: 2 });
    DockerStatus.getStatus = function (state) {
        var ConnectionState = ns.net.ConnectionState;
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
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var DockerDelegate = Interface(null, null);
    DockerDelegate.prototype.onDockerReceived = function (arrival, docker) {
        throw new Error("NotImplemented");
    };
    DockerDelegate.prototype.onDockerSent = function (departure, docker) {
        throw new Error("NotImplemented");
    };
    DockerDelegate.prototype.onDockerFailed = function (
        error,
        departure,
        docker
    ) {
        throw new Error("NotImplemented");
    };
    DockerDelegate.prototype.onDockerError = function (error, departure, docker) {
        throw new Error("NotImplemented");
    };
    DockerDelegate.prototype.onDockerStatusChanged = function (
        previous,
        current,
        docker
    ) {
        throw new Error("NotImplemented");
    };
    ns.port.DockerDelegate = DockerDelegate;
})(StarTrek, MONKEY);
(function (ns, fsm, sys) {
    var Interface = sys.type.Interface;
    var Processor = fsm.skywalker.Processor;
    var Gate = Interface(null, [Processor]);
    Gate.prototype.sendData = function (payload, remote, local) {
        throw new Error("NotImplemented");
    };
    Gate.prototype.sendShip = function (outgo, remote, local) {
        throw new Error("NotImplemented");
    };
    ns.port.Gate = Gate;
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var SocketReader = Interface(null, null);
    SocketReader.prototype.read = function (maxLen) {
        throw new Error("NotImplemented");
    };
    SocketReader.prototype.receive = function (maxLen) {
        throw new Error("NotImplemented");
    };
    var SocketWriter = Interface(null, null);
    SocketWriter.prototype.write = function (src) {
        throw new Error("NotImplemented");
    };
    SocketWriter.prototype.send = function (src, target) {
        throw new Error("NotImplemented");
    };
    ns.socket.SocketReader = SocketReader;
    ns.socket.SocketWriter = SocketWriter;
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
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
    Class(BaseChannel, AddressPairObject, [Channel], null);
    BaseChannel.prototype.finalize = function () {
        removeSocketChannel.call(this);
    };
    BaseChannel.prototype.createReader = function () {
        throw new Error("NotImplemented");
    };
    BaseChannel.prototype.createWriter = function () {
        throw new Error("NotImplemented");
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
        var sock = this.__sock;
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
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var ChannelChecker = Interface(null, null);
    ChannelChecker.prototype.checkError = function (error, sock) {
        throw new Error("NotImplemented");
    };
    ChannelChecker.prototype.checkData = function (data, sock) {
        throw new Error("NotImplemented");
    };
    var DefaultChecker = function () {
        Object.call(this);
    };
    Class(DefaultChecker, Object, [ChannelChecker], {
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
    Class(ChannelController, Object, [ChannelChecker], null);
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
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var SocketReader = ns.socket.SocketReader;
    var SocketWriter = ns.socket.SocketWriter;
    var ChannelController = ns.socket.ChannelController;
    var ChannelReader = function (channel) {
        ChannelController.call(this, channel);
    };
    Class(ChannelReader, ChannelController, [SocketReader], {
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
    Class(ChannelWriter, ChannelController, [SocketWriter], {
        write: function (data) {
            var sock = this.getSocket();
            var sent = 0;
            var rest = data.length;
            var cnt;
            while (sock.isOpen()) {
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
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
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
    Class(
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
    BaseConnection.prototype.tick = function (now, elapsed) {
        var machine = this.getStateMachine();
        if (machine) {
            machine.tick(now, elapsed);
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
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var BaseConnection = ns.socket.BaseConnection;
    var ActiveConnection = function (remote, local, channel, hub) {
        BaseConnection.call(this, remote, local, channel);
        this.__hub = hub;
    };
    Class(ActiveConnection, BaseConnection, null, {
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
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var AddressPairMap = ns.type.AddressPairMap;
    var Hub = ns.net.Hub;
    var ConnectionPool = function () {
        AddressPairMap.call(this);
    };
    Class(ConnectionPool, AddressPairMap, null, {
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
    var BaseHub = function (delegate) {
        Object.call(this);
        this.__delegate = delegate;
        this.__connPool = this.createConnectionPool();
        this.__last = new Date().getTime();
    };
    Class(BaseHub, Object, [Hub], null);
    BaseHub.prototype.createConnectionPool = function () {
        return new ConnectionPool();
    };
    BaseHub.prototype.getDelegate = function () {
        return this.__delegate;
    };
    BaseHub.MSS = 1472;
    BaseHub.prototype.allChannels = function () {
        throw new Error("NotImplemented");
    };
    BaseHub.prototype.removeChannel = function (remote, local, channel) {
        throw new Error("NotImplemented");
    };
    BaseHub.prototype.createConnection = function (remote, local, channel) {
        throw new Error("NotImplemented");
    };
    BaseHub.prototype.allConnections = function () {
        return this.__connPool.values();
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
        for (var i = channels.length - 1; i >= 0; --i) {
            if (this.driveChannel(channels[i])) {
                ++count;
            }
        }
        return count;
    };
    BaseHub.prototype.cleanupChannels = function (channels) {
        var sock;
        for (var i = channels.length - 1; i >= 0; --i) {
            sock = channels[i];
            if (!sock.isAlive()) {
                this.removeChannel(
                    sock.getRemoteAddress(),
                    sock.getLocalAddress(),
                    sock
                );
            }
        }
    };
    BaseHub.prototype.driveConnections = function (connections) {
        var now = new Date().getTime();
        var elapsed = now - this.__last;
        for (var i = connections.length - 1; i >= 0; --i) {
            connections[i].tick(now, elapsed);
        }
        this.__last = now;
    };
    BaseHub.prototype.cleanupConnections = function (connections) {
        var conn;
        for (var i = connections.length - 1; i >= 0; --i) {
            conn = connections[i];
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
        var channels = this.allChannels();
        var count = this.driveChannels(channels);
        var connections = this.allConnections();
        this.driveConnections(connections);
        this.cleanupChannels(channels);
        this.cleanupConnections(connections);
        return count > 0;
    };
    ns.socket.BaseHub = BaseHub;
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var Arrival = ns.port.Arrival;
    var ShipStatus = ns.port.ShipStatus;
    var ArrivalShip = function (now) {
        Object.call(this);
        if (!now) {
            now = new Date().getTime();
        }
        this.__expired = now + ArrivalShip.EXPIRED;
    };
    Class(ArrivalShip, Object, [Arrival], null);
    ArrivalShip.EXPIRES = 300 * 1000;
    ArrivalShip.prototype.touch = function (now) {
        this.__expired = now + ArrivalShip.EXPIRES;
    };
    ArrivalShip.prototype.getStatus = function (now) {
        if (now > this.__expired) {
            return ShipStatus.EXPIRED;
        } else {
            return ShipStatus.ASSEMBLING;
        }
    };
    ns.ArrivalShip = ArrivalShip;
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var Arrays = sys.type.Arrays;
    var ShipStatus = ns.port.ShipStatus;
    var ArrivalHall = function () {
        Object.call(this);
        this.__arrivals = [];
        this.__arrival_map = {};
        this.__finished_times = {};
    };
    Class(ArrivalHall, Object, null, null);
    ArrivalHall.prototype.assembleArrival = function (income) {
        var sn = income.getSN();
        if (!sn) {
            return income;
        }
        var completed;
        var cached = this.__arrival_map[sn];
        if (cached) {
            completed = cached.assemble(income);
            if (completed) {
                Arrays.remove(this.__arrivals, cached);
                delete this.__arrival_map[sn];
                this.__finished_times[sn] = new Date().getTime();
            } else {
                cached.touch(new Date().getTime());
            }
        } else {
            var time = this.__finished_times[sn];
            if (time && time > 0) {
                return null;
            }
            completed = income.assemble(income);
            if (!completed) {
                this.__arrivals.push(income);
                this.__arrival_map[sn] = income;
            }
        }
        return completed;
    };
    ArrivalHall.prototype.purge = function () {
        var now = new Date().getTime();
        var ship;
        var sn;
        for (var i = this.__arrivals.length - 1; i >= 0; --i) {
            ship = this.__arrivals[i];
            if (ship.getStatus(now).equals(ShipStatus.EXPIRED)) {
                this.__arrivals.splice(i, 1);
                sn = ship.getSN();
                if (sn) {
                    delete this.__arrival_map[sn];
                }
            }
        }
        var ago = now - 3600 * 1000;
        var when;
        var keys = Object.keys(this.__finished_times);
        for (var j = keys.length - 1; j >= 0; --j) {
            sn = keys[j];
            when = this.__finished_times[sn];
            if (!when || when < ago) {
                delete this.__finished_times[sn];
            }
        }
    };
    ns.ArrivalHall = ArrivalHall;
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var Enum = sys.type.Enum;
    var Departure = ns.port.Departure;
    var ShipStatus = ns.port.ShipStatus;
    var DepartureShip = function (priority, maxTries) {
        Object.call(this);
        if (priority === null) {
            priority = 0;
        } else {
            if (Enum.isEnum(priority)) {
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
    Class(DepartureShip, Object, [Departure], {
        getPriority: function () {
            return this.__priority;
        },
        touch: function (now) {
            this.__expired = now + DepartureShip.EXPIRES;
            this.__tries -= 1;
        },
        getStatus: function (now) {
            var fragments = this.getFragments();
            if (!fragments || fragments.length === 0) {
                return ShipStatus.DONE;
            } else {
                if (this.__expired === 0) {
                    return ShipStatus.NEW;
                } else {
                    if (now < this.__expired) {
                        return ShipStatus.WAITING;
                    } else {
                        if (this.__tries > 0) {
                            return ShipStatus.TIMEOUT;
                        } else {
                            return ShipStatus.FAILED;
                        }
                    }
                }
            }
        }
    });
    DepartureShip.EXPIRES = 120 * 1000;
    DepartureShip.RETRIES = 2;
    ns.DepartureShip = DepartureShip;
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var Arrays = sys.type.Arrays;
    var ShipStatus = ns.port.ShipStatus;
    var DepartureHall = function () {
        Object.call(this);
        this.__all_departures = [];
        this.__new_departures = [];
        this.__fleets = {};
        this.__priorities = [];
        this.__departure_map = {};
        this.__departure_level = {};
        this.__finished_times = {};
    };
    Class(DepartureHall, Object, null, null);
    DepartureHall.prototype.addDeparture = function (outgo) {
        if (this.__all_departures.indexOf(outgo) >= 0) {
            return false;
        } else {
            this.__all_departures.push(outgo);
        }
        var priority = outgo.getPriority();
        var index;
        for (index = 0; index < this.__new_departures.length; ++index) {
            if (this.__new_departures[index].getPriority() > priority) {
                break;
            }
        }
        Arrays.insert(this.__new_departures, index, outgo);
        return true;
    };
    DepartureHall.prototype.checkResponse = function (response) {
        var sn = response.getSN();
        var time = this.__finished_times[sn];
        if (time && time > 0) {
            return null;
        }
        var ship = this.__departure_map[sn];
        if (ship && ship.checkResponse(response)) {
            removeShip.call(this, ship, sn);
            this.__finished_times[sn] = new Date().getTime();
            return ship;
        }
        return null;
    };
    var removeShip = function (ship, sn) {
        var priority = this.__departure_level[sn];
        var fleet = this.__fleets[priority];
        if (fleet) {
            Arrays.remove(fleet, ship);
            if (fleet.length === 0) {
                delete this.__fleets[priority];
            }
        }
        delete this.__departure_map[sn];
        delete this.__departure_level[sn];
        Arrays.remove(this.__all_departures, ship);
    };
    DepartureHall.prototype.getNextDeparture = function (now) {
        var next = getNextNewDeparture.call(this, now);
        if (!next) {
            next = getNextTimeoutDeparture.call(this, now);
        }
        return next;
    };
    var getNextNewDeparture = function (now) {
        if (this.__new_departures.length === 0) {
            return null;
        }
        var outgo = this.__new_departures.shift();
        var sn = outgo.getSN();
        if (outgo.isImportant() && sn) {
            var priority = outgo.getPriority();
            insertShip.call(this, outgo, priority, sn);
            this.__departure_map[sn] = outgo;
        } else {
            Arrays.remove(this.__all_departures, outgo);
        }
        outgo.touch(now);
        return outgo;
    };
    var insertShip = function (outgo, priority, sn) {
        var fleet = this.__fleets[priority];
        if (!fleet) {
            fleet = [];
            this.__fleets[priority] = fleet;
            insertPriority.call(this, priority);
        }
        fleet.push(outgo);
        this.__departure_level[sn] = priority;
    };
    var insertPriority = function (priority) {
        var index, value;
        for (index = 0; index < this.__priorities.length; ++index) {
            value = this.__priorities[index];
            if (value === priority) {
                return;
            } else {
                if (value > priority) {
                    break;
                }
            }
        }
        Arrays.insert(this.__priorities, index, priority);
    };
    var getNextTimeoutDeparture = function (now) {
        var priorityList = this.__priorities.slice();
        var prior;
        var fleet, ship, sn, status;
        var i, j;
        for (i = 0; i < priorityList.length; ++i) {
            prior = priorityList[i];
            fleet = this.__fleets[prior];
            if (!fleet) {
                continue;
            }
            for (j = 0; j < fleet.length; ++j) {
                ship = fleet[j];
                sn = ship.getSN();
                status = ship.getStatus(now);
                if (status.equals(ShipStatus.TIMEOUT)) {
                    fleet.splice(j, 1);
                    insertShip.call(this, ship, prior + 1, sn);
                    ship.touch(now);
                    return ship;
                } else {
                    if (status.equals(ShipStatus.FAILED)) {
                        fleet.splice(j, 1);
                        delete this.__departure_map[sn];
                        delete this.__departure_level[sn];
                        Arrays.remove(this.__all_departures, ship);
                        return ship;
                    }
                }
            }
        }
        return null;
    };
    DepartureHall.prototype.purge = function () {
        var now = new Date().getTime();
        var prior;
        var fleet, ship, sn;
        var i, j;
        for (i = this.__priorities.length - 1; i >= 0; --i) {
            prior = this.__priorities[i];
            fleet = this.__fleets[prior];
            if (!fleet) {
                this.__priorities.splice(i, 1);
                continue;
            }
            for (j = fleet.length - 1; j >= 0; --j) {
                ship = fleet[j];
                if (ship.getStatus(now).equals(ShipStatus.DONE)) {
                    fleet.splice(j, 1);
                    sn = ship.getSN();
                    delete this.__departure_map[sn];
                    delete this.__departure_level[sn];
                    this.__finished_times[sn] = now;
                }
            }
            if (fleet.length === 0) {
                delete this.__fleets[prior];
                this.__priorities.splice(i, 1);
            }
        }
        var ago = now - 3600 * 1000;
        var keys = Object.keys(this.__finished_times);
        var when;
        for (j = keys.length - 1; j >= 0; --j) {
            sn = keys[j];
            when = this.__finished_times[sn];
            if (!when || when < ago) {
                delete this.__finished_times[sn];
            }
        }
    };
    ns.DepartureHall = DepartureHall;
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var ArrivalHall = ns.ArrivalHall;
    var DepartureHall = ns.DepartureHall;
    var Dock = function () {
        Object.call(this);
        this.__arrivalHall = this.createArrivalHall();
        this.__departureHall = this.createDepartureHall();
    };
    Class(Dock, Object, null, null);
    Dock.prototype.createArrivalHall = function () {
        return new ArrivalHall();
    };
    Dock.prototype.createDepartureHall = function () {
        return new DepartureHall();
    };
    Dock.prototype.assembleArrival = function (income) {
        return this.__arrivalHall.assembleArrival(income);
    };
    Dock.prototype.addDeparture = function (outgo) {
        return this.__departureHall.addDeparture(outgo);
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
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var AddressPairObject = ns.type.AddressPairObject;
    var ShipStatus = ns.port.ShipStatus;
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
    Class(StarDocker, AddressPairObject, [Docker], null);
    StarDocker.prototype.finalize = function () {
        removeConnection.call(this);
        this.__dock = null;
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
        return this.__dock.addDeparture(ship);
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
        throw new Error("NotImplemented");
    };
    StarDocker.prototype.checkArrival = function (income) {
        throw new Error("NotImplemented");
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
                if (outgo.getStatus(now).equals(ShipStatus.FAILED)) {
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
})(StarTrek, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var AddressPairMap = ns.type.AddressPairMap;
    var ConnectionDelegate = ns.net.ConnectionDelegate;
    var ConnectionState = ns.net.ConnectionState;
    var DockerStatus = ns.port.DockerStatus;
    var Gate = ns.port.Gate;
    var DockerPool = function () {
        AddressPairMap.call(this);
    };
    Class(DockerPool, AddressPairMap, null, {
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
    var StarGate = function (delegate) {
        Object.call(this);
        this.__delegate = delegate;
        this.__dockerPool = this.createDockerPool();
    };
    Class(StarGate, Object, [Gate, ConnectionDelegate], null);
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
        throw new Error("NotImplemented");
    };
    StarGate.prototype.allDockers = function () {
        return this.__dockerPool.values();
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
        var dockers = this.allDockers();
        var count = this.driveDockers(dockers);
        this.cleanupDockers(dockers);
        return count > 0;
    };
    StarGate.prototype.driveDockers = function (dockers) {
        var count = 0;
        for (var i = dockers.length - 1; i >= 0; --i) {
            if (dockers[i].process()) {
                ++count;
            }
        }
        return count;
    };
    StarGate.prototype.cleanupDockers = function (dockers) {
        var worker;
        for (var i = dockers.length - 1; i >= 0; --i) {
            worker = dockers[i];
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
                changed = !!s2;
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
        if (worker) {
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
        throw new Error("NotImplemented");
    };
    StarGate.prototype.clearAdvanceParty = function (connection) {
        throw new Error("NotImplemented");
    };
    ns.StarGate = StarGate;
})(StarTrek, MONKEY);
if (typeof StarGate !== "object") {
    StarGate = StarTrek;
}
(function (ns) {
    if (typeof ns.fsm !== "object") {
        ns.fsm = FiniteStateMachine;
    }
    if (typeof ns.dos !== "object") {
        ns.dos = {};
    }
    if (typeof ns.lnc !== "object") {
        ns.lnc = {};
    }
    if (typeof ns.network !== "object") {
        ns.network = {};
    }
    if (typeof ns.ws !== "object") {
        ns.ws = {};
    }
})(StarGate);
(function (ns, sys) {
    var Class = sys.type.Class;
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
    Class(Storage, Object, null, null);
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
    ns.dos.LocalStorage = new Storage(window.localStorage, "dim.fs");
    ns.dos.SessionStorage = new Storage(window.sessionStorage, "dim.mem");
})(StarGate, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var Notification = function (name, sender, userInfo) {
        Object.call(this);
        this.name = name;
        this.sender = sender;
        this.userInfo = userInfo;
    };
    Class(Notification, Object, null, null);
    ns.lnc.Notification = Notification;
})(StarGate, MONKEY);
(function (ns, sys) {
    var Interface = sys.type.Interface;
    var Observer = Interface(null, null);
    Observer.prototype.onReceiveNotification = function (notification) {
        throw new Error("NotImplemented");
    };
    ns.lnc.Observer = Observer;
})(StarGate, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var Arrays = sys.type.Arrays;
    var BaseCenter = function () {
        Object.call(this);
        this.__observers = {};
    };
    Class(BaseCenter, Object, null, null);
    BaseCenter.prototype.addObserver = function (observer, name) {
        var list = this.__observers[name];
        if (!list) {
            list = [];
            this.__observers[name] = list;
        } else {
            if (list.indexOf(observer) >= 0) {
                return;
            }
        }
        list.push(observer);
    };
    BaseCenter.prototype.removeObserver = function (observer, name) {
        if (name) {
            remove.call(this, observer, name);
        } else {
            var names = Object.keys(this.__observers);
            for (var i = names.length - 1; i >= 0; --i) {
                remove.call(this, observer, names[i]);
            }
        }
    };
    var remove = function (observer, name) {
        var list = this.__observers[name];
        if (list) {
            Arrays.remove(list, observer);
            if (list.length === 0) {
                delete this.__observers[name];
            }
        }
    };
    var getObservers = function (name) {
        var list = this.__observers[name];
        if (list) {
            return list.slice();
        } else {
            return [];
        }
    };
    BaseCenter.prototype.postNotification = function (
        notification,
        sender,
        userInfo
    ) {
        throw new Error("NotImplemented");
    };
    BaseCenter.prototype.post = function (notification) {
        var name = notification.name;
        var sender = notification.sender;
        var userInfo = notification.userInfo;
        var observers = getObservers.call(this, name);
        var obs;
        for (var i = observers.length - 1; i >= 0; --i) {
            obs = observers[i];
            try {
                if (typeof obs === "function") {
                    obs.call(notification, name, sender, userInfo);
                } else {
                    obs.onReceiveNotification(notification);
                }
            } catch (e) {
                console.error("DefaultCenter::post() error", notification, obs, e);
            }
        }
    };
    ns.lnc.BaseCenter = BaseCenter;
})(StarGate, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var BaseCenter = ns.lnc.BaseCenter;
    var Notification = ns.lnc.Notification;
    var DefaultCenter = function () {
        BaseCenter.call(this);
    };
    Class(DefaultCenter, BaseCenter, null, {
        postNotification: function (notification, sender, userInfo) {
            if (typeof notification === "string") {
                notification = new Notification(notification, sender, userInfo);
            }
            this.post(notification);
        }
    });
    var NotificationCenter = {
        addObserver: function (observer, name) {
            this.defaultCenter.addObserver(observer, name);
        },
        removeObserver: function (observer, name) {
            this.defaultCenter.removeObserver(observer, name);
        },
        postNotification: function (notification, sender, userInfo) {
            this.defaultCenter.postNotification(notification, sender, userInfo);
        },
        getInstance: function () {
            return this.defaultCenter;
        },
        defaultCenter: new DefaultCenter()
    };
    ns.lnc.DefaultCenter = DefaultCenter;
    ns.lnc.NotificationCenter = NotificationCenter;
})(StarGate, MONKEY);
(function (ns, fsm, sys) {
    var Class = sys.type.Class;
    var Runnable = fsm.skywalker.Runnable;
    var Thread = fsm.threading.Thread;
    var BaseCenter = ns.lnc.BaseCenter;
    var Notification = ns.lnc.Notification;
    var AsyncCenter = function () {
        BaseCenter.call(this);
        this.__notifications = [];
        this.__running = false;
        this.__thread = null;
    };
    Class(AsyncCenter, BaseCenter, [Runnable], {
        postNotification: function (notification, sender, userInfo) {
            if (typeof notification === "string") {
                notification = new Notification(notification, sender, userInfo);
            }
            this.__notifications.push(notification);
        },
        run: function () {
            while (this.isRunning()) {
                if (!this.process()) {
                    return true;
                }
            }
            return false;
        },
        process: function () {
            var notification = this.__notifications.shift();
            if (notification) {
                this.post(notification);
                return true;
            } else {
                return false;
            }
        }
    });
    AsyncCenter.prototype.start = function () {
        force_stop.call(this);
        this.__running = true;
        var thread = new Thread(this);
        thread.start();
        this.__thread = thread;
    };
    AsyncCenter.prototype.stop = function () {
        force_stop.call(this);
    };
    var force_stop = function () {
        var thread = this.__thread;
        if (thread) {
            this.__thread = null;
            thread.stop();
        }
    };
    AsyncCenter.prototype.isRunning = function () {
        return this.__running;
    };
    ns.lnc.AsyncCenter = AsyncCenter;
})(StarGate, FiniteStateMachine, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var ConstantString = sys.type.ConstantString;
    var Host = function (string, ip, port, data) {
        ConstantString.call(this, string);
        this.ip = ip;
        this.port = port;
        this.data = data;
    };
    Class(Host, ConstantString, null, null);
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
})(StarGate, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var Host = ns.network.Host;
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
    Class(IPv4, Host, null);
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
})(StarGate, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var Host = ns.network.Host;
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
    Class(IPv6, Host, null);
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
})(StarGate, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
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
    Class(Socket, Object, null);
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
        this.__remote = remote;
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
})(StarGate, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var ChannelReader = ns.socket.ChannelReader;
    var ChannelWriter = ns.socket.ChannelWriter;
    var BaseChannel = ns.socket.BaseChannel;
    var StreamChannelReader = function (channel) {
        ChannelReader.call(this, channel);
    };
    Class(StreamChannelReader, ChannelReader, null, {
        receive: function (maxLen) {
            return this.read(maxLen);
        }
    });
    var StreamChannelWriter = function (channel) {
        ChannelWriter.call(this, channel);
    };
    Class(StreamChannelWriter, ChannelWriter, null, {
        send: function (data, target) {
            return this.write(data);
        }
    });
    var StreamChannel = function (remote, local, sock) {
        BaseChannel.call(this, remote, local, sock);
    };
    Class(StreamChannel, BaseChannel, null, {
        createReader: function () {
            return new StreamChannelReader(this);
        },
        createWriter: function () {
            return new StreamChannelWriter(this);
        }
    });
    ns.ws.StreamChannelReader = StreamChannelReader;
    ns.ws.StreamChannelWriter = StreamChannelWriter;
    ns.ws.StreamChannel = StreamChannel;
})(StarGate, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var AddressPairMap = ns.type.AddressPairMap;
    var BaseHub = ns.socket.BaseHub;
    var StreamChannel = ns.ws.StreamChannel;
    var ChannelPool = function () {
        AddressPairMap.call(this);
    };
    Class(ChannelPool, AddressPairMap, null, {
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
    Class(StreamHub, BaseHub, null, null);
    StreamHub.prototype.createChannelPool = function () {
        return new ChannelPool();
    };
    StreamHub.prototype.createChannel = function (remote, local, sock) {
        return new StreamChannel(remote, local, sock);
    };
    StreamHub.prototype.allChannels = function () {
        return this.__channelPool.values();
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
})(StarGate, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var ActiveConnection = ns.socket.ActiveConnection;
    var StreamHub = ns.ws.StreamHub;
    var Socket = ns.ws.Socket;
    var ClientHub = function (delegate) {
        StreamHub.call(this, delegate);
    };
    Class(ClientHub, StreamHub, null, {
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
            console.error("ClientHub::createSocketChannel()", remote, local, e);
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
    ns.ws.ClientHub = ClientHub;
})(StarGate, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var ArrivalShip = ns.ArrivalShip;
    var PlainArrival = function (data, now) {
        if (!now) {
            now = new Date().getTime();
        }
        ArrivalShip.call(this, now);
        this.__data = data;
    };
    Class(PlainArrival, ArrivalShip, null, null);
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
})(StarGate, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var DepartureShip = ns.DepartureShip;
    var PlainDeparture = function (data, prior) {
        if (!prior) {
            prior = 0;
        }
        DepartureShip.call(this, prior, 1);
        this.__completed = data;
        this.__fragments = [data];
    };
    Class(PlainDeparture, DepartureShip, null, null);
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
    PlainDeparture.prototype.isImportant = function (arrival) {
        return false;
    };
    ns.PlainDeparture = PlainDeparture;
})(StarGate, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var UTF8 = sys.format.UTF8;
    var Departure = ns.port.Departure;
    var StarDocker = ns.StarDocker;
    var PlainArrival = ns.PlainArrival;
    var PlainDeparture = ns.PlainDeparture;
    var PlainDocker = function (connection) {
        StarDocker.call(this, connection);
    };
    Class(PlainDocker, StarDocker, null, {
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
})(StarGate, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var ActiveConnection = ns.socket.ActiveConnection;
    var StarGate = ns.StarGate;
    var BaseGate = function (delegate) {
        StarGate.call(this, delegate);
        this.__hub = null;
    };
    Class(BaseGate, StarGate, null, {
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
            return StarGate.prototype.removeDocker.call(this, remote, null, docker);
        },
        heartbeat: function (connection) {
            if (connection instanceof ActiveConnection) {
                StarGate.prototype.heartbeat.call(this, connection);
            }
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
})(StarGate, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var BaseGate = ns.BaseGate;
    var CommonGate = function (delegate) {
        BaseGate.call(this, delegate);
        this.__running = false;
    };
    Class(CommonGate, BaseGate, null, {
        isRunning: function () {
            return this.__running;
        },
        start: function () {
            this.__running = true;
        },
        stop: function () {
            this.__running = false;
        },
        getChannel: function (remote, local) {
            var hub = this.getHub();
            return hub.open(remote, local);
        },
        sendMessage: function (payload, remote, local) {
            var docker = this.fetchDocker(remote, local, null);
            if (!docker || !docker.isOpen()) {
                return false;
            }
            return docker.sendData(payload);
        }
    });
    ns.CommonGate = CommonGate;
})(StarGate, MONKEY);
(function (ns, sys) {
    var Class = sys.type.Class;
    var CommonGate = ns.CommonGate;
    var PlainDocker = ns.PlainDocker;
    var WSClientGate = function (delegate) {
        CommonGate.call(this, delegate);
    };
    Class(WSClientGate, CommonGate, null, {
        createDocker: function (connection, advanceParties) {
            var docker = new PlainDocker(connection);
            docker.setDelegate(this.getDelegate());
            return docker;
        }
    });
    ns.WSClientGate = WSClientGate;
})(StarGate, MONKEY);
