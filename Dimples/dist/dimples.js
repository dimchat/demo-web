/**
 *  DIM Library (v1.0.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Nov. 27, 2024
 * @copyright (c) 2024 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof MONKEY !== 'object') {
    MONKEY = {}
}
(function (ns) {
    'use strict';
    if (typeof ns.type !== 'object') {
        ns.type = {}
    }
    if (typeof ns.format !== 'object') {
        ns.format = {}
    }
    if (typeof ns.digest !== 'object') {
        ns.digest = {}
    }
    if (typeof ns.crypto !== 'object') {
        ns.crypto = {}
    }
})(MONKEY);
(function (ns) {
    'use strict';
    var conforms = function (object, protocol) {
        if (!object) {
            return false
        } else if (object instanceof protocol) {
            return true
        }
        return check_class(object.constructor, protocol)
    };
    var check_class = function (constructor, protocol) {
        var interfaces = constructor._mk_interfaces;
        if (interfaces && check_interfaces(interfaces, protocol)) {
            return true
        }
        var parent = constructor._mk_parent;
        return parent && check_class(parent, protocol)
    };
    var check_interfaces = function (interfaces, protocol) {
        var child, parents;
        for (var i = 0; i < interfaces.length; ++i) {
            child = interfaces[i];
            if (child === protocol) {
                return true
            }
            parents = child._mk_parents;
            if (parents && check_interfaces(parents, protocol)) {
                return true
            }
        }
        return false
    };
    var def_methods = function (clazz, methods) {
        var names = Object.keys(methods);
        var key, fn;
        for (var i = 0; i < names.length; ++i) {
            key = names[i];
            fn = methods[key];
            if (typeof fn === 'function') {
                clazz.prototype[key] = fn
            }
        }
        return clazz
    };
    var interfacefy = function (child, parents) {
        if (!child) {
            child = function () {
            }
        }
        if (parents) {
            child._mk_parents = parents
        }
        return child
    };
    interfacefy.conforms = conforms;
    var classify = function (child, parent, interfaces, methods) {
        if (!child) {
            child = function () {
                Object.call(this)
            }
        }
        if (parent) {
            child._mk_parent = parent
        } else {
            parent = Object
        }
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
        if (interfaces) {
            child._mk_interfaces = interfaces
        }
        if (methods) {
            def_methods(child, methods)
        }
        return child
    };
    ns.type.Interface = interfacefy;
    ns.type.Class = classify
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var is_null = function (object) {
        if (typeof object === 'undefined') {
            return true
        } else {
            return object === null
        }
    };
    var is_string = function (object) {
        return typeof object === 'string'
    };
    var is_number = function (object) {
        return typeof object === 'number'
    };
    var is_boolean = function (object) {
        return typeof object === 'boolean'
    };
    var is_function = function (object) {
        return typeof object === 'function'
    };
    var is_base_type = function (object) {
        var t = typeof object;
        if (t === 'string' || t === 'number' || t === 'boolean' || t === 'function') {
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
    var IObject = Interface(null, null);
    IObject.prototype.getClassName = function () {
    };
    IObject.prototype.equals = function (other) {
    };
    IObject.prototype.valueOf = function () {
    };
    IObject.prototype.toString = function () {
    };
    IObject.isNull = is_null;
    IObject.isString = is_string;
    IObject.isNumber = is_number;
    IObject.isBoolean = is_boolean;
    IObject.isFunction = is_function;
    IObject.isBaseType = is_base_type;
    var BaseObject = function () {
        Object.call(this)
    };
    Class(BaseObject, Object, [IObject], null);
    BaseObject.prototype.getClassName = function () {
        return Object.getPrototypeOf(this).constructor.name
    };
    BaseObject.prototype.equals = function (other) {
        return this === other
    };
    ns.type.Object = IObject;
    ns.type.BaseObject = BaseObject
})(MONKEY);
(function (ns) {
    'use strict';
    var IObject = ns.type.Object;
    var getString = function (value, defaultValue) {
        if (IObject.isNull(value)) {
            return defaultValue
        } else if (IObject.isString(value)) {
            return value
        } else {
            return value.toString()
        }
    };
    var getDateTime = function (value, defaultValue) {
        if (IObject.isNull(value)) {
            return defaultValue
        } else if (value instanceof Date) {
            return value
        }
        var seconds = getFloat(value, 0);
        var millis = seconds * 1000;
        return new Date(millis)
    };
    var getInt = function (value, defaultValue) {
        if (IObject.isNull(value)) {
            return defaultValue
        } else if (IObject.isNumber(value)) {
            return value
        } else if (IObject.isBoolean(value)) {
            return value ? 1 : 0
        } else {
            var str = IObject.isString(value) ? value : value.toString();
            return parseInt(str)
        }
    };
    var getFloat = function (value, defaultValue) {
        if (IObject.isNull(value)) {
            return defaultValue
        } else if (IObject.isNumber(value)) {
            return value
        } else if (IObject.isBoolean(value)) {
            return value ? 1.0 : 0.0
        } else {
            var str = IObject.isString(value) ? value : value.toString();
            return parseFloat(str)
        }
    };
    var getBoolean = function (value, defaultValue) {
        if (IObject.isNull(value)) {
            return defaultValue
        } else if (IObject.isBoolean(value)) {
            return value
        } else if (IObject.isNumber(value)) {
            return value > 0 || value < 0
        }
        var text;
        if (IObject.isString(value)) {
            text = value
        } else {
            text = value.toString()
        }
        text = text.trim();
        var size = text.length;
        if (size === 0) {
            return false
        } else if (size > ns.type.Converter.kMaxBoolLen) {
            return true
        } else {
            text = text.toLowerCase()
        }
        var state = kBoolStates[text];
        return IObject.isNull(state) || state
    };
    var kBoolStates = {
        '1': true,
        'yes': true,
        'true': true,
        'on': true,
        '0': false,
        'no': false,
        'false': false,
        'off': false,
        '+0': false,
        '-0': false,
        '+0.0': false,
        '-0.0': false,
        'none': false,
        'null': false,
        'undefined': false
    };
    var kMaxBoolLen = 'undefined'.length;
    ns.type.Converter = {
        getString: getString,
        getDateTime: getDateTime,
        getInt: getInt,
        getFloat: getFloat,
        getBoolean: getBoolean,
        kBoolStates: kBoolStates,
        kMaxBoolLen: kMaxBoolLen
    }
})(MONKEY);
(function (ns) {
    'use strict';
    var IObject = ns.type.Object;
    var is_array = function (obj) {
        return obj instanceof Array || is_number_array(obj)
    };
    var is_number_array = function (obj) {
        if (obj instanceof Uint8ClampedArray) {
            return true
        } else if (obj instanceof Uint8Array) {
            return true
        } else if (obj instanceof Int8Array) {
            return true
        } else if (obj instanceof Uint16Array) {
            return true
        } else if (obj instanceof Int16Array) {
            return true
        } else if (obj instanceof Uint32Array) {
            return true
        } else if (obj instanceof Int32Array) {
            return true
        } else if (obj instanceof Float32Array) {
            return true
        } else if (obj instanceof Float64Array) {
            return true
        }
        return false
    };
    var number_arrays_equal = function (array1, array2) {
        var pos = array1.length;
        if (pos !== array2.length) {
            return false
        }
        while (pos > 0) {
            pos -= 1;
            if (array1[pos] !== array2[pos]) {
                return false
            }
        }
        return true
    };
    var arrays_equal = function (array1, array2) {
        if (is_number_array(array1) || is_number_array(array2)) {
            return number_arrays_equal(array1, array2)
        }
        var pos = array1.length;
        if (pos !== array2.length) {
            return false
        }
        while (pos > 0) {
            pos -= 1;
            if (!objects_equal(array1[pos], array2[pos], false)) {
                return false
            }
        }
        return true
    };
    var maps_equal = function (dict1, dict2) {
        var keys1 = Object.keys(dict1);
        var keys2 = Object.keys(dict2);
        var pos = keys1.length;
        if (pos !== keys2.length) {
            return false
        }
        var key;
        while (pos > 0) {
            pos -= 1;
            key = keys1[pos];
            if (!key || key.length === 0) {
                continue
            }
            if (!objects_equal(dict1[key], dict2[key], key.charAt(0) === '_')) {
                return false
            }
        }
        return true
    };
    var objects_equal = function (obj1, obj2, shallow) {
        if (!obj1) {
            return !obj2
        } else if (!obj2) {
            return false
        } else if (obj1 === obj2) {
            return true
        }
        if (typeof obj1['equals'] === 'function') {
            return obj1.equals(obj2)
        } else if (typeof obj2['equals'] === 'function') {
            return obj2.equals(obj1)
        }
        if (is_array(obj1)) {
            return is_array(obj2) && arrays_equal(obj1, obj2)
        } else if (is_array(obj2)) {
            return false
        }
        if (obj1 instanceof Date) {
            return obj2 instanceof Date && obj1.getTime() === obj2.getTime()
        } else if (obj2 instanceof Date) {
            return false
        } else if (IObject.isBaseType(obj1)) {
            return false
        } else if (IObject.isBaseType(obj2)) {
            return false
        }
        return !shallow && maps_equal(obj1, obj2)
    };
    var copy_items = function (src, srcPos, dest, destPos, length) {
        if (srcPos !== 0 || length !== src.length) {
            src = src.subarray(srcPos, srcPos + length)
        }
        dest.set(src, destPos)
    };
    var insert_item = function (array, index, item) {
        if (index < 0) {
            index += array.length + 1;
            if (index < 0) {
                return false
            }
        }
        if (index === 0) {
            array.unshift(item)
        } else if (index === array.length) {
            array.push(item)
        } else if (index > array.length) {
            array[index] = item
        } else {
            array.splice(index, 0, item)
        }
        return true
    };
    var update_item = function (array, index, item) {
        if (index < 0) {
            index += array.length;
            if (index < 0) {
                return false
            }
        }
        array[index] = item;
        return true
    };
    var remove_item = function (array, item) {
        var index = find_item(array, item);
        if (index < 0) {
            return false
        } else if (index === 0) {
            array.shift()
        } else if ((index + 1) === array.length) {
            array.pop()
        } else {
            array.splice(index, 1)
        }
        return true
    };
    var find_item = function (array, item) {
        for (var i = 0; i < array.length; ++i) {
            if (objects_equal(array[i], item, false)) {
                return i
            }
        }
        return -1
    };
    ns.type.Arrays = {
        insert: insert_item,
        update: update_item,
        remove: remove_item,
        find: find_item,
        equals: function (array1, array2) {
            return objects_equal(array1, array2, false)
        },
        copy: copy_items,
        isArray: is_array
    }
})(MONKEY);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var BaseObject = ns.type.BaseObject;
    var is_enum = function (obj) {
        return obj instanceof BaseEnum
    };
    var get_int = function (obj) {
        if (obj instanceof BaseEnum) {
            return obj.getValue()
        } else if (IObject.isNumber(obj)) {
            return obj
        }
        return obj.valueOf()
    };
    var get_alias = function (enumeration, value) {
        var keys = Object.keys(enumeration);
        var e;
        for (var k in keys) {
            e = enumeration[k];
            if (e instanceof BaseEnum && e.equals(value)) {
                return e.__alias
            }
        }
        return null
    };
    var BaseEnum = function (value, alias) {
        BaseObject.call(this);
        if (!alias) {
            alias = get_alias(this, value)
        }
        this.__value = value;
        this.__alias = alias
    };
    Class(BaseEnum, BaseObject, null, null);
    BaseEnum.prototype.equals = function (other) {
        if (other instanceof BaseEnum) {
            if (this === other) {
                return true
            }
            other = other.valueOf()
        }
        return this.__value === other
    };
    BaseEnum.prototype.toString = function () {
        return '<' + this.getName() + ': ' + this.getValue() + '>'
    };
    BaseEnum.prototype.valueOf = function () {
        return this.__value
    };
    BaseEnum.prototype.getValue = function () {
        return this.__value
    };
    BaseEnum.prototype.getName = function () {
        return this.__alias
    };
    var enum_class = function (type) {
        var Enum = function (value, alias) {
            BaseEnum.call(this, value, alias)
        };
        Class(Enum, BaseEnum, null, {
            toString: function () {
                var clazz = Enum.__type;
                if (!clazz) {
                    clazz = this.getClassName()
                }
                return '<' + clazz + ' ' + this.getName() + ': ' + this.getValue() + '>'
            }
        });
        Enum.__type = type;
        return Enum
    };
    var enumify = function (enumeration, elements) {
        if (IObject.isString(enumeration)) {
            enumeration = enum_class(enumeration)
        } else if (!enumeration) {
            enumeration = enum_class(null)
        } else {
            Class(enumeration, BaseEnum, null, null)
        }
        var keys = Object.keys(elements);
        var alias, value;
        for (var i = 0; i < keys.length; ++i) {
            alias = keys[i];
            value = elements[alias];
            if (value instanceof BaseEnum) {
                value = value.getValue()
            } else if (typeof value !== 'number') {
                throw new TypeError('Enum value must be a number!');
            }
            enumeration[alias] = new enumeration(value, alias)
        }
        return enumeration
    };
    enumify.isEnum = is_enum;
    enumify.getInt = get_int;
    ns.type.Enum = enumify
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var BaseObject = ns.type.BaseObject;
    var Arrays = ns.type.Arrays;
    var Set = Interface(null, [IObject]);
    Set.prototype.isEmpty = function () {
    };
    Set.prototype.getLength = function () {
    };
    Set.prototype.contains = function (element) {
    };
    Set.prototype.add = function (element) {
    };
    Set.prototype.remove = function (element) {
    };
    Set.prototype.clear = function () {
    };
    Set.prototype.toArray = function () {
    };
    var HashSet = function () {
        BaseObject.call(this);
        this.__array = []
    };
    Class(HashSet, BaseObject, [Set], null);
    HashSet.prototype.equals = function (other) {
        if (Interface.conforms(other, Set)) {
            if (this === other) {
                return true
            }
            other = other.valueOf()
        }
        return Arrays.equals(this.__array, other)
    };
    HashSet.prototype.valueOf = function () {
        return this.__array
    };
    HashSet.prototype.toString = function () {
        return this.__array.toString()
    };
    HashSet.prototype.isEmpty = function () {
        return this.__array.length === 0
    };
    HashSet.prototype.getLength = function () {
        return this.__array.length
    };
    HashSet.prototype.contains = function (item) {
        var pos = Arrays.find(this.__array, item);
        return pos >= 0
    };
    HashSet.prototype.add = function (item) {
        var pos = Arrays.find(this.__array, item);
        if (pos < 0) {
            this.__array.push(item);
            return true
        } else {
            return false
        }
    };
    HashSet.prototype.remove = function (item) {
        return Arrays.remove(this.__array, item)
    };
    HashSet.prototype.clear = function () {
        this.__array = []
    };
    HashSet.prototype.toArray = function () {
        return this.__array.slice()
    };
    ns.type.Set = Set;
    ns.type.HashSet = HashSet
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var BaseObject = ns.type.BaseObject;
    var Stringer = Interface(null, [IObject]);
    Stringer.prototype.isEmpty = function () {
    };
    Stringer.prototype.getLength = function () {
    };
    Stringer.prototype.equalsIgnoreCase = function (other) {
    };
    var ConstantString = function (str) {
        BaseObject.call(this);
        if (!str) {
            str = ''
        } else if (Interface.conforms(str, Stringer)) {
            str = str.toString()
        }
        this.__string = str
    };
    Class(ConstantString, BaseObject, [Stringer], null);
    ConstantString.prototype.equals = function (other) {
        if (Interface.conforms(other, Stringer)) {
            if (this === other) {
                return true
            }
            other = other.valueOf()
        }
        return this.__string === other
    };
    ConstantString.prototype.valueOf = function () {
        return this.__string
    };
    ConstantString.prototype.toString = function () {
        return this.__string
    };
    ConstantString.prototype.isEmpty = function () {
        return this.__string.length === 0
    };
    ConstantString.prototype.getLength = function () {
        return this.__string.length
    };
    ConstantString.prototype.equalsIgnoreCase = function (other) {
        if (this === other) {
            return true
        } else if (!other) {
            return !this.__string
        } else if (Interface.conforms(other, Stringer)) {
            return equalsIgnoreCase(this.__string, other.toString())
        } else {
            return equalsIgnoreCase(this.__string, other)
        }
    };
    var equalsIgnoreCase = function (str1, str2) {
        if (str1.length !== str2.length) {
            return false
        }
        var low1 = str1.toLowerCase();
        var low2 = str2.toLowerCase();
        return low1 === low2
    };
    ns.type.Stringer = Stringer;
    ns.type.ConstantString = ConstantString
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var BaseObject = ns.type.BaseObject;
    var Converter = ns.type.Converter;
    var copy_map = function (map, deep) {
        if (deep) {
            return ns.type.Copier.deepCopyMap(map)
        } else {
            return ns.type.Copier.copyMap(map)
        }
    };
    var json_encode = function (dict) {
        return ns.format.JSON.encode(dict)
    };
    var Mapper = Interface(null, [IObject]);
    Mapper.prototype.toMap = function () {
    };
    Mapper.prototype.copyMap = function (deepCopy) {
    };
    Mapper.prototype.isEmpty = function () {
    };
    Mapper.prototype.getLength = function () {
    };
    Mapper.prototype.allKeys = function () {
    };
    Mapper.prototype.getValue = function (key) {
    };
    Mapper.prototype.setValue = function (key, value) {
    };
    Mapper.prototype.removeValue = function (key) {
    };
    Mapper.prototype.getString = function (key, defaultValue) {
    };
    Mapper.prototype.getBoolean = function (key, defaultValue) {
    };
    Mapper.prototype.getInt = function (key, defaultValue) {
    };
    Mapper.prototype.getFloat = function (key, defaultValue) {
    };
    Mapper.prototype.getDateTime = function (key, defaultValue) {
    };
    Mapper.prototype.setDateTime = function (key, time) {
    };
    Mapper.prototype.setString = function (key, stringer) {
    };
    Mapper.prototype.setMap = function (key, mapper) {
    };
    var Dictionary = function (dict) {
        BaseObject.call(this);
        if (!dict) {
            dict = {}
        } else if (Interface.conforms(dict, Mapper)) {
            dict = dict.toMap()
        }
        this.__dictionary = dict
    };
    Class(Dictionary, BaseObject, [Mapper], null);
    Dictionary.prototype.equals = function (other) {
        if (Interface.conforms(other, Mapper)) {
            if (this === other) {
                return true
            }
            other = other.valueOf()
        }
        return ns.type.Arrays.equals(this.__dictionary, other)
    };
    Dictionary.prototype.valueOf = function () {
        return this.__dictionary
    };
    Dictionary.prototype.toString = function () {
        return json_encode(this.__dictionary)
    };
    Dictionary.prototype.toMap = function () {
        return this.__dictionary
    };
    Dictionary.prototype.copyMap = function (deepCopy) {
        return copy_map(this.__dictionary, deepCopy)
    };
    Dictionary.prototype.isEmpty = function () {
        var keys = Object.keys(this.__dictionary);
        return keys.length === 0
    };
    Dictionary.prototype.getLength = function () {
        var keys = Object.keys(this.__dictionary);
        return keys.length
    };
    Dictionary.prototype.allKeys = function () {
        return Object.keys(this.__dictionary)
    };
    Dictionary.prototype.getValue = function (key) {
        return this.__dictionary[key]
    };
    Dictionary.prototype.setValue = function (key, value) {
        if (value) {
            this.__dictionary[key] = value
        } else if (this.__dictionary.hasOwnProperty(key)) {
            delete this.__dictionary[key]
        }
    };
    Dictionary.prototype.removeValue = function (key) {
        var value;
        if (this.__dictionary.hasOwnProperty(key)) {
            value = this.__dictionary[key];
            delete this.__dictionary[key]
        } else {
            value = null
        }
        return value
    };
    Dictionary.prototype.getString = function (key, defaultValue) {
        var value = this.__dictionary[key];
        return Converter.getString(value, defaultValue)
    };
    Dictionary.prototype.getBoolean = function (key, defaultValue) {
        var value = this.__dictionary[key];
        return Converter.getBoolean(value, defaultValue)
    };
    Dictionary.prototype.getInt = function (key, defaultValue) {
        var value = this.__dictionary[key];
        return Converter.getInt(value, defaultValue)
    };
    Dictionary.prototype.getFloat = function (key, defaultValue) {
        var value = this.__dictionary[key];
        return Converter.getFloat(value, defaultValue)
    };
    Dictionary.prototype.getDateTime = function (key, defaultValue) {
        var value = this.__dictionary[key];
        return Converter.getDateTime(value, defaultValue)
    };
    Dictionary.prototype.setDateTime = function (key, time) {
        if (!time) {
            this.removeValue(key)
        } else if (time instanceof Date) {
            time = time.getTime() / 1000.0;
            this.__dictionary[key] = time
        } else {
            time = Converter.getFloat(time, 0);
            this.__dictionary[key] = time
        }
    };
    Dictionary.prototype.setString = function (key, string) {
        if (!string) {
            this.removeValue(key)
        } else {
            this.__dictionary[key] = string.toString()
        }
    };
    Dictionary.prototype.setMap = function (key, map) {
        if (!map) {
            this.removeValue(key)
        } else {
            this.__dictionary[key] = map.toMap()
        }
    };
    ns.type.Mapper = Mapper;
    ns.type.Dictionary = Dictionary
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var IObject = ns.type.Object;
    var Enum = ns.type.Enum;
    var Stringer = ns.type.Stringer;
    var Arrays = ns.type.Arrays;
    var Mapper = ns.type.Mapper;
    var fetch_string = function (str) {
        if (Interface.conforms(str, Stringer)) {
            return str.toString()
        } else {
            return str
        }
    };
    var fetch_map = function (dict) {
        if (Interface.conforms(dict, Mapper)) {
            return dict.toMap()
        } else {
            return dict
        }
    };
    var unwrap = function (object) {
        if (IObject.isNull(object)) {
            return null
        } else if (IObject.isBaseType(object)) {
            return object
        } else if (Enum.isEnum(object)) {
            return object.getValue()
        } else if (Interface.conforms(object, Stringer)) {
            return object.toString()
        } else if (Interface.conforms(object, Mapper)) {
            return unwrap_map(object.toMap())
        } else if (!Arrays.isArray(object)) {
            return unwrap_map(object)
        } else if (object instanceof Array) {
            return unwrap_list(object)
        } else {
            return object
        }
    };
    var unwrap_map = function (dict) {
        var result = {};
        var allKeys = Object.keys(dict);
        var key;
        var count = allKeys.length;
        for (var i = 0; i < count; ++i) {
            key = allKeys[i];
            result[key] = unwrap(dict[key])
        }
        return result
    };
    var unwrap_list = function (array) {
        var result = [];
        var count = array.length;
        for (var i = 0; i < count; ++i) {
            result[i] = unwrap(array[i])
        }
        return result
    };
    ns.type.Wrapper = {
        fetchString: fetch_string,
        fetchMap: fetch_map,
        unwrap: unwrap,
        unwrapMap: unwrap_map,
        unwrapList: unwrap_list
    }
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var IObject = ns.type.Object;
    var Enum = ns.type.Enum;
    var Stringer = ns.type.Stringer;
    var Arrays = ns.type.Arrays;
    var Mapper = ns.type.Mapper;
    var copy = function (object) {
        if (IObject.isNull(object)) {
            return null
        } else if (IObject.isBaseType(object)) {
            return object
        } else if (Enum.isEnum(object)) {
            return object.getValue()
        } else if (Interface.conforms(object, Stringer)) {
            return object.toString()
        } else if (Interface.conforms(object, Mapper)) {
            return copy_map(object.toMap())
        } else if (!Arrays.isArray(object)) {
            return copy_map(object)
        } else if (object instanceof Array) {
            return copy_list(object)
        } else {
            return object
        }
    };
    var copy_map = function (dict) {
        var clone = {};
        var allKeys = Object.keys(dict);
        var key;
        var count = allKeys.length;
        for (var i = 0; i < count; ++i) {
            key = allKeys[i];
            clone[key] = dict[key]
        }
        return clone
    };
    var copy_list = function (array) {
        var clone = [];
        var count = array.length;
        for (var i = 0; i < count; ++i) {
            clone.push(array[i])
        }
        return clone
    };
    var deep_copy = function (object) {
        if (IObject.isNull(object)) {
            return null
        } else if (IObject.isBaseType(object)) {
            return object
        } else if (Enum.isEnum(object)) {
            return object.getValue()
        } else if (Interface.conforms(object, Stringer)) {
            return object.toString()
        } else if (Interface.conforms(object, Mapper)) {
            return deep_copy_map(object.toMap())
        } else if (!Arrays.isArray(object)) {
            return deep_copy_map(object)
        } else if (object instanceof Array) {
            return deep_copy_list(object)
        } else {
            return object
        }
    };
    var deep_copy_map = function (dict) {
        var clone = {};
        var allKeys = Object.keys(dict);
        var key;
        var count = allKeys.length;
        for (var i = 0; i < count; ++i) {
            key = allKeys[i];
            clone[key] = deep_copy(dict[key])
        }
        return clone
    };
    var deep_copy_list = function (array) {
        var clone = [];
        var count = array.length;
        for (var i = 0; i < count; ++i) {
            clone.push(deep_copy(array[i]))
        }
        return clone
    };
    ns.type.Copier = {
        copy: copy,
        copyMap: copy_map,
        copyList: copy_list,
        deepCopy: deep_copy,
        deepCopyMap: deep_copy_map,
        deepCopyList: deep_copy_list
    }
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var DataDigester = Interface(null, null);
    DataDigester.prototype.digest = function (data) {
    };
    ns.digest.DataDigester = DataDigester
})(MONKEY);
(function (ns) {
    'use strict';
    var MD5 = {
        digest: function (data) {
            return this.getDigester().digest(data)
        }, getDigester: function () {
            return md5Digester
        }, setDigester: function (digester) {
            md5Digester = digester
        }
    };
    var md5Digester = null;
    ns.digest.MD5 = MD5
})(MONKEY);
(function (ns) {
    'use strict';
    var SHA1 = {
        digest: function (data) {
            return this.getDigester().digest(data)
        }, getDigester: function () {
            return sha1Digester
        }, setDigester: function (digester) {
            sha1Digester = digester
        }
    };
    var sha1Digester = null;
    ns.digest.SHA1 = SHA1
})(MONKEY);
(function (ns) {
    'use strict';
    var SHA256 = {
        digest: function (data) {
            return this.getDigester().digest(data)
        }, getDigester: function () {
            return sha256Digester
        }, setDigester: function (digester) {
            sha256Digester = digester
        }
    };
    var sha256Digester = null;
    ns.digest.SHA256 = SHA256
})(MONKEY);
(function (ns) {
    'use strict';
    var RipeMD160 = {
        digest: function (data) {
            return this.getDigester().digest(data)
        }, getDigester: function () {
            return ripemd160Digester
        }, setDigester: function (digester) {
            ripemd160Digester = digester
        }
    };
    var ripemd160Digester = null;
    ns.digest.RIPEMD160 = RipeMD160
})(MONKEY);
(function (ns) {
    'use strict';
    var Keccak256 = {
        digest: function (data) {
            return this.getDigester().digest(data)
        }, getDigester: function () {
            return keccak256Digester
        }, setDigester: function (digester) {
            keccak256Digester = digester
        }
    };
    var keccak256Digester = null;
    ns.digest.KECCAK256 = Keccak256
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var DataCoder = Interface(null, null);
    DataCoder.prototype.encode = function (data) {
    };
    DataCoder.prototype.decode = function (string) {
    };
    var ObjectCoder = Interface(null, null);
    ObjectCoder.prototype.encode = function (object) {
    };
    ObjectCoder.prototype.decode = function (string) {
    };
    var StringCoder = Interface(null, null);
    StringCoder.prototype.encode = function (string) {
    };
    StringCoder.prototype.decode = function (data) {
    };
    ns.format.DataCoder = DataCoder;
    ns.format.ObjectCoder = ObjectCoder;
    ns.format.StringCoder = StringCoder
})(MONKEY);
(function (ns) {
    'use strict';
    var Hex = {
        encode: function (data) {
            return this.getCoder().encode(data)
        }, decode: function (string) {
            return this.getCoder().decode(string)
        }, getCoder: function () {
            return hexCoder
        }, setCoder: function (coder) {
            hexCoder = coder
        }
    };
    var hexCoder = null;
    ns.format.Hex = Hex
})(MONKEY);
(function (ns) {
    'use strict';
    var Base58 = {
        encode: function (data) {
            return this.getCoder().encode(data)
        }, decode: function (string) {
            return this.getCoder().decode(string)
        }, getCoder: function () {
            return base58Coder
        }, setCoder: function (coder) {
            base58Coder = coder
        }
    };
    var base58Coder = null;
    ns.format.Base58 = Base58
})(MONKEY);
(function (ns) {
    'use strict';
    var Base64 = {
        encode: function (data) {
            return this.getCoder().encode(data)
        }, decode: function (string) {
            return this.getCoder().decode(string)
        }, getCoder: function () {
            return base64Coder
        }, setCoder: function (coder) {
            base64Coder = coder
        }
    };
    var base64Coder = null;
    ns.format.Base64 = Base64
})(MONKEY);
(function (ns) {
    'use strict';
    var UTF8 = {
        encode: function (string) {
            return this.getCoder().encode(string)
        }, decode: function (data) {
            return this.getCoder().decode(data)
        }, getCoder: function () {
            return utf8Coder
        }, setCoder: function (coder) {
            utf8Coder = coder
        }
    };
    var utf8Coder = null;
    ns.format.UTF8 = UTF8
})(MONKEY);
(function (ns) {
    'use strict';
    var JsON = {
        encode: function (object) {
            return this.getCoder().encode(object)
        }, decode: function (string) {
            return this.getCoder().decode(string)
        }, getCoder: function () {
            return jsonCoder
        }, setCoder: function (coder) {
            jsonCoder = coder
        }
    };
    var jsonCoder = null;
    ns.format.JSON = JsON
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Mapper = ns.type.Mapper;
    var TransportableData = Interface(null, [Mapper]);
    TransportableData.DEFAULT = 'base64';
    TransportableData.BASE64 = 'base64';
    TransportableData.BASE58 = 'base58';
    TransportableData.HEX = 'hex';
    TransportableData.prototype.getAlgorithm = function () {
    };
    TransportableData.prototype.getData = function () {
    };
    TransportableData.prototype.toString = function () {
    };
    TransportableData.prototype.toObject = function () {
    };
    TransportableData.encode = function (data) {
        var ted = TransportableData.create(data);
        return ted.toObject()
    };
    TransportableData.decode = function (encoded) {
        var ted = TransportableData.parse(encoded);
        if (!ted) {
            return null
        }
        return ted.getData()
    };
    var general_factory = function () {
        var man = ns.format.FormatFactoryManager;
        return man.generalFactory
    };
    TransportableData.create = function (data, algorithm) {
        if (!algorithm) {
            algorithm = TransportableData.DEFAULT
        }
        var gf = general_factory();
        return gf.createTransportableData(algorithm, data)
    };
    TransportableData.parse = function (ted) {
        var gf = general_factory();
        return gf.parseTransportableData(ted)
    };
    TransportableData.setFactory = function (algorithm, factory) {
        var gf = general_factory();
        return gf.setTransportableDataFactory(algorithm, factory)
    };
    TransportableData.getFactory = function (algorithm) {
        var gf = general_factory();
        return gf.getTransportableDataFactory(algorithm)
    };
    var TransportableDataFactory = Interface(null, null);
    TransportableDataFactory.prototype.createTransportableData = function (data) {
    };
    TransportableDataFactory.prototype.parseTransportableData = function (ted) {
    };
    TransportableData.Factory = TransportableDataFactory;
    ns.format.TransportableData = TransportableData
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Mapper = ns.type.Mapper;
    var TransportableData = ns.format.TransportableData;
    var PortableNetworkFile = Interface(null, [Mapper]);
    PortableNetworkFile.prototype.setData = function (fileData) {
    };
    PortableNetworkFile.prototype.getData = function () {
    };
    PortableNetworkFile.prototype.setFilename = function (filename) {
    };
    PortableNetworkFile.prototype.getFilename = function () {
    };
    PortableNetworkFile.prototype.setURL = function (url) {
    };
    PortableNetworkFile.prototype.getURL = function () {
    };
    PortableNetworkFile.prototype.setPassword = function (key) {
    };
    PortableNetworkFile.prototype.getPassword = function () {
    };
    PortableNetworkFile.prototype.toString = function () {
    };
    PortableNetworkFile.prototype.toObject = function () {
    };
    var general_factory = function () {
        var man = ns.format.FormatFactoryManager;
        return man.generalFactory
    };
    PortableNetworkFile.createFromURL = function (url, password) {
        return PortableNetworkFile.create(null, null, url, password)
    };
    PortableNetworkFile.createFromData = function (data, filename) {
        var ted = TransportableData.create(data);
        return PortableNetworkFile.create(ted, filename, null, null)
    };
    PortableNetworkFile.create = function (ted, filename, url, password) {
        var gf = general_factory();
        return gf.createPortableNetworkFile(ted, filename, url, password)
    };
    PortableNetworkFile.parse = function (pnf) {
        var gf = general_factory();
        return gf.parsePortableNetworkFile(pnf)
    };
    PortableNetworkFile.setFactory = function (factory) {
        var gf = general_factory();
        return gf.setPortableNetworkFileFactory(factory)
    };
    PortableNetworkFile.getFactory = function () {
        var gf = general_factory();
        return gf.getPortableNetworkFileFactory()
    };
    var PortableNetworkFileFactory = Interface(null, null);
    PortableNetworkFileFactory.prototype.createPortableNetworkFile = function (ted, filename, url, password) {
    };
    PortableNetworkFileFactory.prototype.parsePortableNetworkFile = function (pnf) {
    };
    PortableNetworkFile.Factory = PortableNetworkFileFactory;
    ns.format.PortableNetworkFile = PortableNetworkFile
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var Mapper = ns.type.Mapper;
    var Stringer = ns.type.Stringer;
    var Converter = ns.type.Converter
    var TransportableData = ns.format.TransportableData;
    var PortableNetworkFile = ns.format.PortableNetworkFile;
    var split = function (text) {
        var pos1 = text.indexOf('://');
        if (pos1 > 0) {
            return [text]
        } else {
            pos1 = text.indexOf(':') + 1
        }
        var array = [];
        var pos2 = text.indexOf(';', pos1);
        if (pos2 > pos1) {
            array.push(text.substring(pos1, pos2));
            pos1 = pos2 + 1
        }
        pos2 = text.indexOf(',', pos1);
        if (pos2 > pos1) {
            array.unshift(text.substring(pos1, pos2));
            pos1 = pos2 + 1
        }
        if (pos1 === 0) {
            array.unshift(text)
        } else {
            array.unshift(text.substring(pos1))
        }
        return array
    };
    var decode = function (data, defaultKey) {
        var text;
        if (Interface.conforms(data, Mapper)) {
            return data.toMap()
        } else if (Interface.conforms(data, Stringer)) {
            text = data.toString()
        } else if (IObject.isString(data)) {
            text = data
        } else {
            return data
        }
        if (text.length === 0) {
            return null
        } else if (text.charAt(0) === '{' && text.charAt(text.length - 1) === '}') {
            ns.type.JSON.decode(text)
        }
        var info = {};
        var array = split(text);
        var size = array.length;
        if (size === 1) {
            info[defaultKey] = array[0]
        } else {
            info['data'] = array[0];
            info['algorithm'] = array[1];
            if (size > 2) {
                info['content-type'] = array[2];
                if (text.length > 5 && text.substring(0, 5) === 'data:') {
                    info['URL'] = text
                }
            }
        }
        return info
    };
    var GeneralFactory = function () {
        this.__tedFactories = {};
        this.__pnfFactory = null
    };
    Class(GeneralFactory, null, null, null);
    GeneralFactory.prototype.getDataAlgorithm = function (ted, defaultValue) {
        return Converter.getString(ted['algorithm'], defaultValue)
    };
    GeneralFactory.prototype.setTransportableDataFactory = function (algorithm, factory) {
        this.__tedFactories[algorithm] = factory
    };
    GeneralFactory.prototype.getTransportableDataFactory = function (algorithm) {
        return this.__tedFactories[algorithm]
    };
    GeneralFactory.prototype.createTransportableData = function (algorithm, data) {
        var factory = this.getTransportableDataFactory(algorithm);
        return factory.createTransportableData(data)
    };
    GeneralFactory.prototype.parseTransportableData = function (ted) {
        if (!ted) {
            return null
        } else if (Interface.conforms(ted, TransportableData)) {
            return ted
        }
        var info = decode(ted, 'data');
        if (!info) {
            return null
        }
        var algorithm = this.getDataAlgorithm(info, '*');
        var factory = this.getTransportableDataFactory(algorithm);
        if (!factory) {
            factory = this.getTransportableDataFactory('*')
        }
        return factory.parseTransportableData(info)
    };
    GeneralFactory.prototype.setPortableNetworkFileFactory = function (factory) {
        this.__pnfFactory = factory
    };
    GeneralFactory.prototype.getPortableNetworkFileFactory = function () {
        return this.__pnfFactory
    };
    GeneralFactory.prototype.createPortableNetworkFile = function (ted, filename, url, password) {
        var factory = this.getPortableNetworkFileFactory();
        return factory.createPortableNetworkFile(ted, filename, url, password)
    };
    GeneralFactory.prototype.parsePortableNetworkFile = function (pnf) {
        if (!pnf) {
            return null
        } else if (Interface.conforms(pnf, PortableNetworkFile)) {
            return pnf
        }
        var info = decode(pnf, 'URL');
        if (!info) {
            return null
        }
        var factory = this.getPortableNetworkFileFactory();
        return factory.parsePortableNetworkFile(info)
    };
    var FactoryManager = {generalFactory: new GeneralFactory()};
    ns.format.FormatGeneralFactory = GeneralFactory;
    ns.format.FormatFactoryManager = FactoryManager
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Mapper = ns.type.Mapper;
    var CryptographyKey = Interface(null, [Mapper]);
    CryptographyKey.prototype.getAlgorithm = function () {
    };
    CryptographyKey.prototype.getData = function () {
    };
    var EncryptKey = Interface(null, [CryptographyKey]);
    EncryptKey.prototype.encrypt = function (plaintext, extra) {
    };
    var DecryptKey = Interface(null, [CryptographyKey]);
    DecryptKey.prototype.decrypt = function (ciphertext, params) {
    };
    DecryptKey.prototype.matchEncryptKey = function (pKey) {
    };
    ns.crypto.CryptographyKey = CryptographyKey;
    ns.crypto.EncryptKey = EncryptKey;
    ns.crypto.DecryptKey = DecryptKey
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = Interface(null, [CryptographyKey]);
    AsymmetricKey.RSA = 'RSA';
    AsymmetricKey.ECC = 'ECC';
    var SignKey = Interface(null, [AsymmetricKey]);
    SignKey.prototype.sign = function (data) {
    };
    var VerifyKey = Interface(null, [AsymmetricKey]);
    VerifyKey.prototype.verify = function (data, signature) {
    };
    VerifyKey.prototype.matchSignKey = function (sKey) {
    };
    ns.crypto.AsymmetricKey = AsymmetricKey;
    ns.crypto.SignKey = SignKey;
    ns.crypto.VerifyKey = VerifyKey
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var EncryptKey = ns.crypto.EncryptKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var SymmetricKey = Interface(null, [EncryptKey, DecryptKey]);
    SymmetricKey.AES = 'AES';
    SymmetricKey.DES = 'DES';
    var general_factory = function () {
        var man = ns.crypto.CryptographyKeyFactoryManager;
        return man.generalFactory
    };
    SymmetricKey.generate = function (algorithm) {
        var gf = general_factory();
        return gf.generateSymmetricKey(algorithm)
    };
    SymmetricKey.parse = function (key) {
        var gf = general_factory();
        return gf.parseSymmetricKey(key)
    };
    SymmetricKey.setFactory = function (algorithm, factory) {
        var gf = general_factory();
        gf.setSymmetricKeyFactory(algorithm, factory)
    };
    SymmetricKey.getFactory = function (algorithm) {
        var gf = general_factory();
        return gf.getSymmetricKeyFactory(algorithm)
    };
    var SymmetricKeyFactory = Interface(null, null);
    SymmetricKeyFactory.prototype.generateSymmetricKey = function () {
    };
    SymmetricKeyFactory.prototype.parseSymmetricKey = function (key) {
    };
    SymmetricKey.Factory = SymmetricKeyFactory;
    ns.crypto.SymmetricKey = SymmetricKey
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var VerifyKey = ns.crypto.VerifyKey;
    var PublicKey = Interface(null, [VerifyKey]);
    PublicKey.RSA = AsymmetricKey.RSA;
    PublicKey.ECC = AsymmetricKey.ECC;
    var general_factory = function () {
        var man = ns.crypto.CryptographyKeyFactoryManager;
        return man.generalFactory
    };
    PublicKey.parse = function (key) {
        var gf = general_factory();
        return gf.parsePublicKey(key)
    };
    PublicKey.setFactory = function (algorithm, factory) {
        var gf = general_factory();
        gf.setPublicKeyFactory(algorithm, factory)
    };
    PublicKey.getFactory = function (algorithm) {
        var gf = general_factory();
        return gf.getPublicKeyFactory(algorithm)
    };
    var PublicKeyFactory = Interface(null, null);
    PublicKeyFactory.prototype.parsePublicKey = function (key) {
    };
    PublicKey.Factory = PublicKeyFactory;
    ns.crypto.PublicKey = PublicKey
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var SignKey = ns.crypto.SignKey;
    var PrivateKey = Interface(null, [SignKey]);
    PrivateKey.RSA = AsymmetricKey.RSA;
    PrivateKey.ECC = AsymmetricKey.ECC;
    PrivateKey.prototype.getPublicKey = function () {
    };
    var general_factory = function () {
        var man = ns.crypto.CryptographyKeyFactoryManager;
        return man.generalFactory
    };
    PrivateKey.generate = function (algorithm) {
        var gf = general_factory();
        return gf.generatePrivateKey(algorithm)
    };
    PrivateKey.parse = function (key) {
        var gf = general_factory();
        return gf.parsePrivateKey(key)
    };
    PrivateKey.setFactory = function (algorithm, factory) {
        var gf = general_factory();
        gf.setPrivateKeyFactory(algorithm, factory)
    };
    PrivateKey.getFactory = function (algorithm) {
        var gf = general_factory();
        return gf.getPrivateKeyFactory(algorithm)
    };
    var PrivateKeyFactory = Interface(null, null);
    PrivateKeyFactory.prototype.generatePrivateKey = function () {
    };
    PrivateKeyFactory.prototype.parsePrivateKey = function (key) {
    };
    PrivateKey.Factory = PrivateKeyFactory;
    ns.crypto.PrivateKey = PrivateKey
})(MONKEY);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Wrapper = ns.type.Wrapper;
    var Converter = ns.type.Converter;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var promise = 'Moky loves May Lee forever!';
    var get_promise = function () {
        if (typeof promise === 'string') {
            promise = ns.format.UTF8.encode(promise)
        }
        return promise
    };
    var GeneralFactory = function () {
        this.__symmetricKeyFactories = {};
        this.__publicKeyFactories = {};
        this.__privateKeyFactories = {}
    };
    Class(GeneralFactory, null, null, null);
    GeneralFactory.prototype.matchSignKey = function (sKey, pKey) {
        var data = get_promise();
        var signature = sKey.sign(data);
        return pKey.verify(data, signature)
    };
    GeneralFactory.prototype.matchEncryptKey = function (pKey, sKey) {
        var data = get_promise();
        var extra_params = {};
        var ciphertext = pKey.encrypt(data, extra_params);
        var plaintext = sKey.decrypt(ciphertext, extra_params);
        if (!plaintext || plaintext.length !== data.length) {
            return false
        }
        for (var i = 0; i < data.length; ++i) {
            if (plaintext[i] !== data[i]) {
                return false
            }
        }
        return true
    };
    GeneralFactory.prototype.getAlgorithm = function (key, defaultValue) {
        return Converter.getString(key['algorithm'], defaultValue)
    };
    GeneralFactory.prototype.setSymmetricKeyFactory = function (algorithm, factory) {
        this.__symmetricKeyFactories[algorithm] = factory
    };
    GeneralFactory.prototype.getSymmetricKeyFactory = function (algorithm) {
        return this.__symmetricKeyFactories[algorithm]
    };
    GeneralFactory.prototype.generateSymmetricKey = function (algorithm) {
        var factory = this.getSymmetricKeyFactory(algorithm);
        return factory.generateSymmetricKey()
    };
    GeneralFactory.prototype.parseSymmetricKey = function (key) {
        if (!key) {
            return null
        } else if (Interface.conforms(key, SymmetricKey)) {
            return key
        }
        var info = Wrapper.fetchMap(key);
        var algorithm = this.getAlgorithm(info, '*');
        var factory = this.getSymmetricKeyFactory(algorithm);
        if (!factory) {
            factory = this.getSymmetricKeyFactory('*')
        }
        return factory.parseSymmetricKey(info)
    };
    GeneralFactory.prototype.setPrivateKeyFactory = function (algorithm, factory) {
        this.__privateKeyFactories[algorithm] = factory
    };
    GeneralFactory.prototype.getPrivateKeyFactory = function (algorithm) {
        return this.__privateKeyFactories[algorithm]
    };
    GeneralFactory.prototype.generatePrivateKey = function (algorithm) {
        var factory = this.getPrivateKeyFactory(algorithm);
        return factory.generatePrivateKey()
    };
    GeneralFactory.prototype.parsePrivateKey = function (key) {
        if (!key) {
            return null
        } else if (Interface.conforms(key, PrivateKey)) {
            return key
        }
        var info = Wrapper.fetchMap(key);
        var algorithm = this.getAlgorithm(info, '*');
        var factory = this.getPrivateKeyFactory(algorithm);
        if (!factory) {
            factory = this.getPrivateKeyFactory('*')
        }
        return factory.parsePrivateKey(info)
    };
    GeneralFactory.prototype.setPublicKeyFactory = function (algorithm, factory) {
        this.__publicKeyFactories[algorithm] = factory
    };
    GeneralFactory.prototype.getPublicKeyFactory = function (algorithm) {
        return this.__publicKeyFactories[algorithm]
    };
    GeneralFactory.prototype.parsePublicKey = function (key) {
        if (!key) {
            return null
        } else if (Interface.conforms(key, PublicKey)) {
            return key
        }
        var info = Wrapper.fetchMap(key);
        var algorithm = this.getAlgorithm(info, '*');
        var factory = this.getPublicKeyFactory(algorithm);
        if (!factory) {
            factory = this.getPublicKeyFactory('*')
        }
        return factory.parsePublicKey(info)
    };
    var FactoryManager = {generalFactory: new GeneralFactory()};
    ns.crypto.CryptographyKeyGeneralFactory = GeneralFactory;
    ns.crypto.CryptographyKeyFactoryManager = FactoryManager
})(MONKEY);
if (typeof MingKeMing !== 'object') {
    MingKeMing = {}
}
(function (ns) {
    'use strict';
    if (typeof ns.type !== 'object') {
        ns.type = MONKEY.type
    }
    if (typeof ns.format !== 'object') {
        ns.format = MONKEY.format
    }
    if (typeof ns.digest !== 'object') {
        ns.digest = MONKEY.digest
    }
    if (typeof ns.crypto !== 'object') {
        ns.crypto = MONKEY.crypto
    }
    if (typeof ns.protocol !== 'object') {
        ns.protocol = {}
    }
    if (typeof ns.mkm !== 'object') {
        ns.mkm = {}
    }
})(MingKeMing);
(function (ns) {
    'use strict';
    var EntityType = ns.type.Enum('EntityType', {
        USER: (0x00),
        GROUP: (0x01),
        STATION: (0x02),
        ISP: (0x03),
        BOT: (0x04),
        ICP: (0x05),
        SUPERVISOR: (0x06),
        COMPANY: (0x07),
        ANY: (0x80),
        EVERY: (0x81)
    });
    EntityType.isUser = function (network) {
        var user = EntityType.USER.getValue();
        var group = EntityType.GROUP.getValue();
        return (network & group) === user
    };
    EntityType.isGroup = function (network) {
        var group = EntityType.GROUP.getValue();
        return (network & group) === group
    };
    EntityType.isBroadcast = function (network) {
        var any = EntityType.ANY.getValue();
        return (network & any) === any
    };
    ns.protocol.EntityType = EntityType
})(MingKeMing);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Stringer = ns.type.Stringer;
    var Address = Interface(null, [Stringer]);
    Address.prototype.getType = function () {
    };
    Address.ANYWHERE = null;
    Address.EVERYWHERE = null;
    var general_factory = function () {
        var man = ns.mkm.AccountFactoryManager;
        return man.generalFactory
    };
    Address.generate = function (meta, network) {
        var gf = general_factory();
        return gf.generateAddress(meta, network)
    };
    Address.create = function (address) {
        var gf = general_factory();
        return gf.createAddress(address)
    };
    Address.parse = function (address) {
        var gf = general_factory();
        return gf.parseAddress(address)
    };
    Address.setFactory = function (factory) {
        var gf = general_factory();
        gf.setAddressFactory(factory)
    };
    Address.getFactory = function () {
        var gf = general_factory();
        return gf.getAddressFactory()
    };
    var AddressFactory = Interface(null, null);
    AddressFactory.prototype.generateAddress = function (meta, network) {
    };
    AddressFactory.prototype.createAddress = function (address) {
    };
    AddressFactory.prototype.parseAddress = function (address) {
    };
    Address.Factory = AddressFactory;
    ns.protocol.Address = Address
})(MingKeMing);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Stringer = ns.type.Stringer;
    var ID = Interface(null, [Stringer]);
    ID.prototype.getName = function () {
    };
    ID.prototype.getAddress = function () {
    };
    ID.prototype.getTerminal = function () {
    };
    ID.prototype.getType = function () {
    };
    ID.prototype.isBroadcast = function () {
    };
    ID.prototype.isUser = function () {
    };
    ID.prototype.isGroup = function () {
    };
    ID.ANYONE = null;
    ID.EVERYONE = null;
    ID.FOUNDER = null;
    ID.convert = function (list) {
        var gf = general_factory();
        return gf.convertIdentifiers(list)
    };
    ID.revert = function (list) {
        var gf = general_factory();
        return gf.revertIdentifiers(list)
    };
    var general_factory = function () {
        var man = ns.mkm.AccountFactoryManager;
        return man.generalFactory
    };
    ID.generate = function (meta, network, terminal) {
        var gf = general_factory();
        return gf.generateIdentifier(meta, network, terminal)
    };
    ID.create = function (name, address, terminal) {
        var gf = general_factory();
        return gf.createIdentifier(name, address, terminal)
    };
    ID.parse = function (identifier) {
        var gf = general_factory();
        return gf.parseIdentifier(identifier)
    };
    ID.setFactory = function (factory) {
        var gf = general_factory();
        gf.setIdentifierFactory(factory)
    };
    ID.getFactory = function () {
        var gf = general_factory();
        return gf.getIdentifierFactory()
    };
    var IDFactory = Interface(null, null);
    IDFactory.prototype.generateIdentifier = function (meta, network, terminal) {
    };
    IDFactory.prototype.createIdentifier = function (name, address, terminal) {
    };
    IDFactory.prototype.parseIdentifier = function (identifier) {
    };
    ID.Factory = IDFactory;
    ns.protocol.ID = ID
})(MingKeMing);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Mapper = ns.type.Mapper;
    var Meta = Interface(null, [Mapper]);
    Meta.MKM = 'MKM';
    Meta.BTC = 'BTC';
    Meta.ETH = 'ETH';
    Meta.prototype.getType = function () {
    };
    Meta.prototype.getPublicKey = function () {
    };
    Meta.prototype.getSeed = function () {
    };
    Meta.prototype.getFingerprint = function () {
    };
    Meta.prototype.generateAddress = function (network) {
    };
    Meta.prototype.isValid = function () {
    };
    Meta.prototype.matchIdentifier = function (identifier) {
    };
    Meta.prototype.matchPublicKey = function (pKey) {
    };
    var general_factory = function () {
        var man = ns.mkm.AccountFactoryManager;
        return man.generalFactory
    };
    Meta.create = function (type, key, seed, fingerprint) {
        var gf = general_factory();
        return gf.createMeta(type, key, seed, fingerprint)
    };
    Meta.generate = function (type, sKey, seed) {
        var gf = general_factory();
        return gf.generateMeta(type, sKey, seed)
    };
    Meta.parse = function (meta) {
        var gf = general_factory();
        return gf.parseMeta(meta)
    };
    Meta.setFactory = function (type, factory) {
        var gf = general_factory();
        gf.setMetaFactory(type, factory)
    };
    Meta.getFactory = function (type) {
        var gf = general_factory();
        return gf.getMetaFactory(type)
    };
    var MetaFactory = Interface(null, null);
    MetaFactory.prototype.createMeta = function (pKey, seed, fingerprint) {
    };
    MetaFactory.prototype.generateMeta = function (sKey, seed) {
    };
    MetaFactory.prototype.parseMeta = function (meta) {
    };
    Meta.Factory = MetaFactory;
    ns.protocol.Meta = Meta
})(MingKeMing);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var TAI = Interface(null, null);
    TAI.prototype.isValid = function () {
    };
    TAI.prototype.verify = function (pKey) {
    };
    TAI.prototype.sign = function (sKey) {
    };
    TAI.prototype.allProperties = function () {
    };
    TAI.prototype.getProperty = function (name) {
    };
    TAI.prototype.setProperty = function (name, value) {
    };
    ns.protocol.TAI = TAI
})(MingKeMing);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Mapper = ns.type.Mapper;
    var TAI = ns.protocol.TAI;
    var Document = Interface(null, [TAI, Mapper]);
    Document.VISA = 'visa';
    Document.PROFILE = 'profile';
    Document.BULLETIN = 'bulletin';
    Document.prototype.getType = function () {
    };
    Document.prototype.getIdentifier = function () {
    };
    Document.prototype.getTime = function () {
    };
    Document.prototype.setName = function (name) {
    };
    Document.prototype.getName = function () {
    };
    var general_factory = function () {
        var man = ns.mkm.AccountFactoryManager;
        return man.generalFactory
    };
    Document.create = function (type, identifier, data, signature) {
        var gf = general_factory();
        return gf.createDocument(type, identifier, data, signature)
    };
    Document.parse = function (doc) {
        var gf = general_factory();
        return gf.parseDocument(doc)
    };
    Document.setFactory = function (type, factory) {
        var gf = general_factory();
        gf.setDocumentFactory(type, factory)
    };
    Document.getFactory = function (type) {
        var gf = general_factory();
        return gf.getDocumentFactory(type)
    };
    var DocumentFactory = Interface(null, null);
    DocumentFactory.prototype.createDocument = function (identifier, data, signature) {
    };
    DocumentFactory.prototype.parseDocument = function (doc) {
    };
    Document.Factory = DocumentFactory;
    ns.protocol.Document = Document
})(MingKeMing);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
    var ConstantString = ns.type.ConstantString;
    var EntityType = ns.protocol.EntityType;
    var Address = ns.protocol.Address;
    var BroadcastAddress = function (string, network) {
        ConstantString.call(this, string);
        this.__network = Enum.getInt(network)
    };
    Class(BroadcastAddress, ConstantString, [Address], null);
    BroadcastAddress.prototype.getType = function () {
        return this.__network
    };
    Address.ANYWHERE = new BroadcastAddress('anywhere', EntityType.ANY);
    Address.EVERYWHERE = new BroadcastAddress('everywhere', EntityType.EVERY);
    ns.mkm.BroadcastAddress = BroadcastAddress
})(MingKeMing);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ConstantString = ns.type.ConstantString;
    var EntityType = ns.protocol.EntityType;
    var Address = ns.protocol.Address;
    var ID = ns.protocol.ID;
    var Identifier = function (identifier, name, address, terminal) {
        ConstantString.call(this, identifier);
        this.__name = name;
        this.__address = address;
        this.__terminal = terminal
    };
    Class(Identifier, ConstantString, [ID], null);
    Identifier.prototype.getName = function () {
        return this.__name
    };
    Identifier.prototype.getAddress = function () {
        return this.__address
    };
    Identifier.prototype.getTerminal = function () {
        return this.__terminal
    };
    Identifier.prototype.getType = function () {
        return this.__address.getType()
    };
    Identifier.prototype.isBroadcast = function () {
        var network = this.getType();
        return EntityType.isBroadcast(network)
    };
    Identifier.prototype.isUser = function () {
        var network = this.getType();
        return EntityType.isUser(network)
    };
    Identifier.prototype.isGroup = function () {
        var network = this.getType();
        return EntityType.isGroup(network)
    };
    Identifier.create = function (name, address, terminal) {
        var string = Identifier.concat(name, address, terminal);
        return new Identifier(string, name, address, terminal)
    };
    Identifier.concat = function (name, address, terminal) {
        var string = address.toString();
        if (name && name.length > 0) {
            string = name + '@' + string
        }
        if (terminal && terminal.length > 0) {
            string = string + '/' + terminal
        }
        return string
    };
    ID.ANYONE = Identifier.create("anyone", Address.ANYWHERE, null);
    ID.EVERYONE = Identifier.create("everyone", Address.EVERYWHERE, null);
    ID.FOUNDER = Identifier.create("moky", Address.ANYWHERE, null);
    ns.mkm.Identifier = Identifier
})(MingKeMing);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var Stringer = ns.type.Stringer;
    var Wrapper = ns.type.Wrapper;
    var Converter = ns.type.Converter;
    var Address = ns.protocol.Address;
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var Document = ns.protocol.Document;
    var GeneralFactory = function () {
        this.__addressFactory = null;
        this.__idFactory = null;
        this.__metaFactories = {};
        this.__documentFactories = {}
    };
    Class(GeneralFactory, null, null, null);
    GeneralFactory.prototype.setAddressFactory = function (factory) {
        this.__addressFactory = factory
    };
    GeneralFactory.prototype.getAddressFactory = function () {
        return this.__addressFactory
    };
    GeneralFactory.prototype.parseAddress = function (address) {
        if (!address) {
            return null
        } else if (Interface.conforms(address, Address)) {
            return address
        }
        var str = Wrapper.fetchString(address);
        var factory = this.getAddressFactory();
        return factory.parseAddress(str)
    };
    GeneralFactory.prototype.createAddress = function (address) {
        var factory = this.getAddressFactory();
        return factory.createAddress(address)
    };
    GeneralFactory.prototype.generateAddress = function (meta, network) {
        var factory = this.getAddressFactory();
        return factory.generateAddress(meta, network)
    };
    GeneralFactory.prototype.setIdentifierFactory = function (factory) {
        this.__idFactory = factory
    };
    GeneralFactory.prototype.getIdentifierFactory = function () {
        return this.__idFactory
    };
    GeneralFactory.prototype.parseIdentifier = function (identifier) {
        if (!identifier) {
            return null
        } else if (Interface.conforms(identifier, ID)) {
            return identifier
        }
        var str = Wrapper.fetchString(identifier);
        var factory = this.getIdentifierFactory();
        return factory.parseIdentifier(str)
    };
    GeneralFactory.prototype.createIdentifier = function (name, address, terminal) {
        var factory = this.getIdentifierFactory();
        return factory.createIdentifier(name, address, terminal)
    }
    GeneralFactory.prototype.generateIdentifier = function (meta, network, terminal) {
        var factory = this.getIdentifierFactory();
        return factory.generateIdentifier(meta, network, terminal)
    };
    GeneralFactory.prototype.convertIdentifiers = function (members) {
        var array = [];
        var id;
        for (var i = 0; i < members.length; ++i) {
            id = ID.parse(members[i]);
            if (id) {
                array.push(id)
            }
        }
        return array
    }
    GeneralFactory.prototype.revertIdentifiers = function (members) {
        var array = [];
        var id;
        for (var i = 0; i < members.length; ++i) {
            id = members[i];
            if (Interface.conforms(id, Stringer)) {
                array.push(id.toString())
            } else if (IObject.isString(id)) {
                array.push(id)
            }
        }
        return array
    };
    GeneralFactory.prototype.setMetaFactory = function (type, factory) {
        this.__metaFactories[type] = factory
    };
    GeneralFactory.prototype.getMetaFactory = function (type) {
        return this.__metaFactories[type]
    };
    GeneralFactory.prototype.getMetaType = function (meta, defaultVersion) {
        var type = meta['type'];
        return Converter.getString(type, defaultVersion)
    };
    GeneralFactory.prototype.createMeta = function (type, key, seed, fingerprint) {
        var factory = this.getMetaFactory(type);
        return factory.createMeta(key, seed, fingerprint)
    };
    GeneralFactory.prototype.generateMeta = function (type, sKey, seed) {
        var factory = this.getMetaFactory(type);
        return factory.generateMeta(sKey, seed)
    };
    GeneralFactory.prototype.parseMeta = function (meta) {
        if (!meta) {
            return null
        } else if (Interface.conforms(meta, Meta)) {
            return meta
        }
        var info = Wrapper.fetchMap(meta);
        if (!info) {
            return null
        }
        var type = this.getMetaType(info, '*');
        var factory = this.getMetaFactory(type);
        if (!factory) {
            factory = this.getMetaFactory('*')
        }
        return factory.parseMeta(info)
    };
    GeneralFactory.prototype.setDocumentFactory = function (type, factory) {
        this.__documentFactories[type] = factory
    };
    GeneralFactory.prototype.getDocumentFactory = function (type) {
        return this.__documentFactories[type]
    };
    GeneralFactory.prototype.getDocumentType = function (doc, defaultType) {
        var type = doc['type'];
        return Converter.getString(type, defaultType)
    };
    GeneralFactory.prototype.createDocument = function (type, identifier, data, signature) {
        var factory = this.getDocumentFactory(type);
        return factory.createDocument(identifier, data, signature)
    };
    GeneralFactory.prototype.parseDocument = function (doc) {
        if (!doc) {
            return null
        } else if (Interface.conforms(doc, Document)) {
            return doc
        }
        var info = Wrapper.fetchMap(doc);
        if (!info) {
            return null
        }
        var type = this.getDocumentType(info, '*');
        var factory = this.getDocumentFactory(type);
        if (!factory) {
            factory = this.getDocumentFactory('*')
        }
        return factory.parseDocument(info)
    };
    var FactoryManager = {generalFactory: new GeneralFactory()};
    ns.mkm.AccountGeneralFactory = GeneralFactory;
    ns.mkm.AccountFactoryManager = FactoryManager
})(MingKeMing);
if (typeof DaoKeDao !== 'object') {
    DaoKeDao = {}
}
(function (ns) {
    'use strict';
    if (typeof ns.type !== 'object') {
        ns.type = MONKEY.type
    }
    if (typeof ns.format !== 'object') {
        ns.format = MONKEY.format
    }
    if (typeof ns.digest !== 'object') {
        ns.digest = MONKEY.digest
    }
    if (typeof ns.crypto !== 'object') {
        ns.crypto = MONKEY.crypto
    }
    if (typeof ns.protocol !== 'object') {
        ns.protocol = MingKeMing.protocol
    }
    if (typeof ns.mkm !== 'object') {
        ns.mkm = MingKeMing.mkm
    }
    if (typeof ns.dkd !== 'object') {
        ns.dkd = {}
    }
})(DaoKeDao);
(function (ns) {
    'use strict';
    var ContentType = ns.type.Enum('ContentType', {
        ANY: (0x00),
        TEXT: (0x01),
        FILE: (0x10),
        IMAGE: (0x12),
        AUDIO: (0x14),
        VIDEO: (0x16),
        PAGE: (0x20),
        NAME_CARD: (0x33),
        QUOTE: (0x37),
        MONEY: (0x40),
        TRANSFER: (0x41),
        LUCKY_MONEY: (0x42),
        CLAIM_PAYMENT: (0x48),
        SPLIT_BILL: (0x49),
        COMMAND: (0x88),
        HISTORY: (0x89),
        APPLICATION: (0xA0),
        ARRAY: (0xCA),
        CUSTOMIZED: (0xCC),
        FORWARD: (0xFF)
    });
    ns.protocol.ContentType = ContentType
})(DaoKeDao);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Mapper = ns.type.Mapper;
    var Content = Interface(null, [Mapper]);
    Content.prototype.getType = function () {
    };
    Content.prototype.getSerialNumber = function () {
    };
    Content.prototype.getTime = function () {
    };
    Content.prototype.setGroup = function (identifier) {
    };
    Content.prototype.getGroup = function () {
    };
    var general_factory = function () {
        var man = ns.dkd.MessageFactoryManager;
        return man.generalFactory
    };
    Content.parse = function (content) {
        var gf = general_factory();
        return gf.parseContent(content)
    };
    Content.setFactory = function (type, factory) {
        var gf = general_factory();
        gf.setContentFactory(type, factory)
    };
    Content.getFactory = function (type) {
        var gf = general_factory();
        return gf.getContentFactory(type)
    };
    var ContentFactory = Interface(null, null);
    ContentFactory.prototype.parseContent = function (content) {
    };
    Content.Factory = ContentFactory;
    ns.protocol.Content = Content
})(DaoKeDao);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Mapper = ns.type.Mapper;
    var Envelope = Interface(null, [Mapper]);
    Envelope.prototype.getSender = function () {
    };
    Envelope.prototype.getReceiver = function () {
    };
    Envelope.prototype.getTime = function () {
    };
    Envelope.prototype.setGroup = function (identifier) {
    };
    Envelope.prototype.getGroup = function () {
    };
    Envelope.prototype.setType = function (type) {
    };
    Envelope.prototype.getType = function () {
    };
    var general_factory = function () {
        var man = ns.dkd.MessageFactoryManager;
        return man.generalFactory
    };
    Envelope.create = function (from, to, when) {
        var gf = general_factory();
        return gf.createEnvelope(from, to, when)
    };
    Envelope.parse = function (env) {
        var gf = general_factory();
        return gf.parseEnvelope(env)
    };
    Envelope.getFactory = function () {
        var gf = general_factory();
        return gf.getEnvelopeFactory()
    }
    Envelope.setFactory = function (factory) {
        var gf = general_factory();
        gf.setEnvelopeFactory(factory)
    };
    var EnvelopeFactory = Interface(null, null);
    EnvelopeFactory.prototype.createEnvelope = function (from, to, when) {
    };
    EnvelopeFactory.prototype.parseEnvelope = function (env) {
    };
    Envelope.Factory = EnvelopeFactory;
    ns.protocol.Envelope = Envelope
})(DaoKeDao);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Mapper = ns.type.Mapper;
    var Message = Interface(null, [Mapper]);
    Message.prototype.getEnvelope = function () {
    };
    Message.prototype.getSender = function () {
    };
    Message.prototype.getReceiver = function () {
    };
    Message.prototype.getTime = function () {
    };
    Message.prototype.getGroup = function () {
    };
    Message.prototype.getType = function () {
    };
    ns.protocol.Message = Message
})(DaoKeDao);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Message = ns.protocol.Message;
    var InstantMessage = Interface(null, [Message]);
    InstantMessage.prototype.getContent = function () {
    };
    var general_factory = function () {
        var man = ns.dkd.MessageFactoryManager;
        return man.generalFactory
    };
    InstantMessage.generateSerialNumber = function (type, now) {
        var gf = general_factory();
        return gf.generateSerialNumber(type, now)
    };
    InstantMessage.create = function (head, body) {
        var gf = general_factory();
        return gf.createInstantMessage(head, body)
    };
    InstantMessage.parse = function (msg) {
        var gf = general_factory();
        return gf.parseInstantMessage(msg)
    };
    InstantMessage.getFactory = function () {
        var gf = general_factory();
        return gf.getInstantMessageFactory()
    };
    InstantMessage.setFactory = function (factory) {
        var gf = general_factory();
        gf.setInstantMessageFactory(factory)
    };
    var InstantMessageFactory = Interface(null, null);
    InstantMessageFactory.prototype.generateSerialNumber = function (msgType, now) {
    };
    InstantMessageFactory.prototype.createInstantMessage = function (head, body) {
    };
    InstantMessageFactory.prototype.parseInstantMessage = function (msg) {
    };
    InstantMessage.Factory = InstantMessageFactory;
    ns.protocol.InstantMessage = InstantMessage
})(DaoKeDao);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Message = ns.protocol.Message;
    var SecureMessage = Interface(null, [Message]);
    SecureMessage.prototype.getData = function () {
    };
    SecureMessage.prototype.getEncryptedKey = function () {
    };
    SecureMessage.prototype.getEncryptedKeys = function () {
    };
    var general_factory = function () {
        var man = ns.dkd.MessageFactoryManager;
        return man.generalFactory
    };
    SecureMessage.parse = function (msg) {
        var gf = general_factory();
        return gf.parseSecureMessage(msg)
    };
    SecureMessage.getFactory = function () {
        var gf = general_factory();
        return gf.getSecureMessageFactory()
    };
    SecureMessage.setFactory = function (factory) {
        var gf = general_factory();
        gf.setSecureMessageFactory(factory)
    };
    var SecureMessageFactory = Interface(null, null);
    SecureMessageFactory.prototype.parseSecureMessage = function (msg) {
    };
    SecureMessage.Factory = SecureMessageFactory;
    ns.protocol.SecureMessage = SecureMessage
})(DaoKeDao);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = Interface(null, [SecureMessage]);
    ReliableMessage.prototype.getSignature = function () {
    };
    var general_factory = function () {
        var man = ns.dkd.MessageFactoryManager;
        return man.generalFactory
    };
    ReliableMessage.parse = function (msg) {
        var gf = general_factory();
        return gf.parseReliableMessage(msg)
    };
    ReliableMessage.getFactory = function () {
        var gf = general_factory();
        return gf.getReliableMessageFactory()
    };
    ReliableMessage.setFactory = function (factory) {
        var gf = general_factory();
        gf.setReliableMessageFactory(factory)
    };
    var ReliableMessageFactory = Interface(null, null);
    ReliableMessageFactory.prototype.parseReliableMessage = function (msg) {
    };
    ReliableMessage.Factory = ReliableMessageFactory;
    ns.protocol.ReliableMessage = ReliableMessage
})(DaoKeDao);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var InstantMessage = ns.protocol.InstantMessage;
    var InstantMessageDelegate = Interface(null, null);
    InstantMessageDelegate.prototype.serializeContent = function (content, pwd, iMsg) {
    };
    InstantMessageDelegate.prototype.encryptContent = function (data, pwd, iMsg) {
    };
    InstantMessageDelegate.prototype.serializeKey = function (pwd, iMsg) {
    };
    InstantMessageDelegate.prototype.encryptKey = function (data, receiver, iMsg) {
    };
    InstantMessage.Delegate = InstantMessageDelegate
})(DaoKeDao);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var SecureMessage = ns.protocol.SecureMessage;
    var SecureMessageDelegate = Interface(null, null);
    SecureMessageDelegate.prototype.decryptKey = function (data, receiver, sMsg) {
    };
    SecureMessageDelegate.prototype.deserializeKey = function (data, sMsg) {
    };
    SecureMessageDelegate.prototype.decryptContent = function (data, pwd, sMsg) {
    };
    SecureMessageDelegate.prototype.deserializeContent = function (data, pwd, sMsg) {
    };
    SecureMessageDelegate.prototype.signData = function (data, sMsg) {
    };
    SecureMessage.Delegate = SecureMessageDelegate
})(DaoKeDao);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var ReliableMessageDelegate = Interface(null, null);
    ReliableMessageDelegate.prototype.verifyDataSignature = function (data, signature, rMsg) {
    };
    ReliableMessage.Delegate = ReliableMessageDelegate
})(DaoKeDao);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
    var Wrapper = ns.type.Wrapper;
    var Converter = ns.type.Converter;
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
        this.__reliableMessageFactory = null
    };
    Class(GeneralFactory, null, null, null);
    GeneralFactory.prototype.setContentFactory = function (type, factory) {
        type = Enum.getInt(type);
        this.__contentFactories[type] = factory
    };
    GeneralFactory.prototype.getContentFactory = function (type) {
        type = Enum.getInt(type);
        return this.__contentFactories[type]
    };
    GeneralFactory.prototype.getContentType = function (content, defaultType) {
        var type = content['type'];
        return Converter.getInt(type, defaultType)
    };
    GeneralFactory.prototype.parseContent = function (content) {
        if (!content) {
            return null
        } else if (Interface.conforms(content, Content)) {
            return content
        }
        var info = Wrapper.fetchMap(content);
        if (!info) {
            return null
        }
        var type = this.getContentType(info, 0);
        var factory = this.getContentFactory(type);
        if (!factory) {
            factory = this.getContentFactory(0)
        }
        return factory.parseContent(info)
    };
    GeneralFactory.prototype.setEnvelopeFactory = function (factory) {
        this.__envelopeFactory = factory
    };
    GeneralFactory.prototype.getEnvelopeFactory = function () {
        return this.__envelopeFactory
    };
    GeneralFactory.prototype.createEnvelope = function (from, to, when) {
        var factory = this.getEnvelopeFactory();
        return factory.createEnvelope(from, to, when)
    };
    GeneralFactory.prototype.parseEnvelope = function (env) {
        if (!env) {
            return null
        } else if (Interface.conforms(env, Envelope)) {
            return env
        }
        var info = Wrapper.fetchMap(env);
        if (!info) {
            return null
        }
        var factory = this.getEnvelopeFactory();
        return factory.parseEnvelope(info)
    };
    GeneralFactory.prototype.setInstantMessageFactory = function (factory) {
        this.__instantMessageFactory = factory
    };
    GeneralFactory.prototype.getInstantMessageFactory = function () {
        return this.__instantMessageFactory
    };
    GeneralFactory.prototype.createInstantMessage = function (head, body) {
        var factory = this.getInstantMessageFactory();
        return factory.createInstantMessage(head, body)
    };
    GeneralFactory.prototype.parseInstantMessage = function (msg) {
        if (!msg) {
            return null
        } else if (Interface.conforms(msg, InstantMessage)) {
            return msg
        }
        var info = Wrapper.fetchMap(msg);
        if (!info) {
            return null
        }
        var factory = this.getInstantMessageFactory();
        return factory.parseInstantMessage(info)
    };
    GeneralFactory.prototype.generateSerialNumber = function (type, now) {
        var factory = this.getInstantMessageFactory();
        return factory.generateSerialNumber(type, now)
    };
    GeneralFactory.prototype.setSecureMessageFactory = function (factory) {
        this.__secureMessageFactory = factory
    };
    GeneralFactory.prototype.getSecureMessageFactory = function () {
        return this.__secureMessageFactory
    };
    GeneralFactory.prototype.parseSecureMessage = function (msg) {
        if (!msg) {
            return null
        } else if (Interface.conforms(msg, SecureMessage)) {
            return msg
        }
        var info = Wrapper.fetchMap(msg);
        if (!info) {
            return null
        }
        var factory = this.getSecureMessageFactory();
        return factory.parseSecureMessage(info)
    };
    GeneralFactory.prototype.setReliableMessageFactory = function (factory) {
        this.__reliableMessageFactory = factory
    };
    GeneralFactory.prototype.getReliableMessageFactory = function () {
        return this.__reliableMessageFactory
    };
    GeneralFactory.prototype.parseReliableMessage = function (msg) {
        if (!msg) {
            return null
        } else if (Interface.conforms(msg, ReliableMessage)) {
            return msg
        }
        var info = Wrapper.fetchMap(msg);
        if (!info) {
            return null
        }
        var factory = this.getReliableMessageFactory();
        return factory.parseReliableMessage(info)
    };
    var FactoryManager = {generalFactory: new GeneralFactory()};
    ns.dkd.MessageGeneralFactory = GeneralFactory;
    ns.dkd.MessageFactoryManager = FactoryManager
})(DaoKeDao);
if (typeof DIMP !== "object") {
    DIMP = {}
}
(function (ns) {
    'use strict';
    if (typeof ns.type !== 'object') {
        ns.type = MONKEY.type
    }
    if (typeof ns.format !== 'object') {
        ns.format = MONKEY.format
    }
    if (typeof ns.digest !== 'object') {
        ns.digest = MONKEY.digest
    }
    if (typeof ns.crypto !== 'object') {
        ns.crypto = MONKEY.crypto
    }
    if (typeof ns.protocol !== 'object') {
        ns.protocol = MingKeMing.protocol
    }
    if (typeof ns.mkm !== 'object') {
        ns.mkm = MingKeMing.mkm
    }
    if (typeof ns.dkd !== 'object') {
        ns.dkd = DaoKeDao.dkd
    }
    if (typeof ns.protocol.group !== 'object') {
        ns.protocol.group = {}
    }
    if (typeof ns.dkd.cmd !== 'object') {
        ns.dkd.cmd = {}
    }
    if (typeof ns.msg !== 'object') {
        ns.msg = {}
    }
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var general_factory = function () {
        var man = ns.crypto.CryptographyKeyFactoryManager;
        return man.generalFactory
    };
    var getKeyAlgorithm = function (key) {
        var gf = general_factory();
        return gf.getAlgorithm(key, '')
    };
    var matchSymmetricKeys = function (pKey, sKey) {
        var gf = general_factory();
        return gf.matchEncryptKey(pKey, sKey)
    };
    var matchAsymmetricKeys = function (sKey, pKey) {
        var gf = general_factory();
        return gf.matchSignKey(sKey, pKey)
    };
    var symmetricKeyEquals = function (a, b) {
        if (a === b) {
            return true
        }
        return matchSymmetricKeys(a, b)
    };
    var privateKeyEquals = function (a, b) {
        if (a === b) {
            return true
        }
        return matchAsymmetricKeys(a, b.publicKey)
    };
    var BaseKey = function (dict) {
        Dictionary.call(this, dict)
    };
    Class(BaseKey, Dictionary, [CryptographyKey], {
        getAlgorithm: function () {
            return getKeyAlgorithm(this.toMap())
        }
    });
    BaseKey.getKeyAlgorithm = getKeyAlgorithm;
    BaseKey.matchEncryptKey = matchSymmetricKeys;
    BaseKey.matchSignKey = matchAsymmetricKeys;
    BaseKey.symmetricKeyEquals = symmetricKeyEquals;
    BaseKey.privateKeyEquals = privateKeyEquals;
    var BaseSymmetricKey = function (dict) {
        Dictionary.call(this, dict)
    };
    Class(BaseSymmetricKey, Dictionary, [SymmetricKey], {
        equals: function (other) {
            return Interface.conforms(other, SymmetricKey) && symmetricKeyEquals(other, this)
        }, matchEncryptKey: function (pKey) {
            return matchSymmetricKeys(pKey, this)
        }, getAlgorithm: function () {
            return getKeyAlgorithm(this.toMap())
        }
    });
    var BaseAsymmetricKey = function (dict) {
        Dictionary.call(this, dict)
    };
    Class(BaseAsymmetricKey, Dictionary, [AsymmetricKey], {
        getAlgorithm: function () {
            return getKeyAlgorithm(this.toMap())
        }
    });
    var BasePrivateKey = function (dict) {
        Dictionary.call(this, dict)
    };
    Class(BasePrivateKey, Dictionary, [PrivateKey], {
        equals: function (other) {
            return Interface.conforms(other, PrivateKey) && privateKeyEquals(other, this)
        }, getAlgorithm: function () {
            return getKeyAlgorithm(this.toMap())
        }
    });
    var BasePublicKey = function (dict) {
        Dictionary.call(this, dict)
    };
    Class(BasePublicKey, Dictionary, [PublicKey], {
        matchSignKey: function (sKey) {
            return matchAsymmetricKeys(sKey, this)
        }, getAlgorithm: function () {
            return getKeyAlgorithm(this.toMap())
        }
    });
    ns.crypto.BaseKey = BaseKey;
    ns.crypto.BaseSymmetricKey = BaseSymmetricKey;
    ns.crypto.BaseAsymmetricKey = BaseAsymmetricKey;
    ns.crypto.BasePrivateKey = BasePrivateKey;
    ns.crypto.BasePublicKey = BasePublicKey
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var TransportableData = ns.format.TransportableData;
    var Base64 = ns.format.Base64;
    var Base58 = ns.format.Base58;
    var Hex = ns.format.Hex;
    var BaseDataWrapper = function (dict) {
        Dictionary.call(this, dict);
        this.__data = null
    };
    Class(BaseDataWrapper, Dictionary, null, {
        isEmpty: function () {
            if (Dictionary.prototype.isEmpty.call(this)) {
                return true
            }
            var bin = this.__data;
            return bin === null || bin.length === 0
        }, toString: function () {
            var encoded = this.getString('data', '');
            if (encoded.length === 0) {
                return encoded
            }
            var alg = this.getString('algorithm', '');
            if (alg === TransportableData.DEFAULT) {
                alg = ''
            }
            if (alg === '') {
                return encoded
            } else {
                return alg + ',' + encoded
            }
        }, encode: function (mimeType) {
            var encoded = this.getString('data', '');
            if (encoded.length === 0) {
                return encoded
            }
            var alg = this.getAlgorithm();
            return 'data:' + mimeType + ';' + alg + ',' + encoded
        }, getAlgorithm: function () {
            var alg = this.getString('algorithm', '');
            if (alg === '') {
                alg = TransportableData.DEFAULT
            }
            return alg
        }, setAlgorithm: function (name) {
            if (!name) {
                this.removeValue('algorithm')
            } else {
                this.setValue('algorithm', name)
            }
        }, getData: function () {
            var bin = this.__data;
            if (!bin) {
                var encoded = this.getString('data', '');
                if (encoded.length > 0) {
                    var alg = this.getAlgorithm();
                    if (alg === TransportableData.BASE64) {
                        bin = Base64.decode(encoded)
                    } else if (alg === TransportableData.BASE58) {
                        bin = Base58.decode(encoded)
                    } else if (alg === TransportableData.HEX) {
                        bin = Hex.decode(encoded)
                    }
                }
            }
            return bin
        }, setData: function (bin) {
            if (!bin) {
                this.removeValue('data')
            } else {
                var encoded = '';
                var alg = this.getAlgorithm();
                if (alg === TransportableData.BASE64) {
                    encoded = Base64.encode(bin)
                } else if (alg === TransportableData.BASE58) {
                    encoded = Base58.encode(bin)
                } else if (alg === TransportableData.HEX) {
                    encoded = Hex.encode(bin)
                }
                this.setValue('data', encoded)
            }
            this.__data = bin
        }
    });
    ns.format.BaseDataWrapper = BaseDataWrapper
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var TransportableData = ns.format.TransportableData;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var BaseFileWrapper = function (dict) {
        Dictionary.call(this, dict);
        this.__attachment = null;
        this.__password = null
    };
    Class(BaseFileWrapper, Dictionary, null, {
        getData: function () {
            var ted = this.__attachment;
            if (!ted) {
                var base64 = this.getValue('data');
                ted = TransportableData.parse(base64);
                this.__attachment = ted
            }
            return ted
        }, setData: function (ted) {
            if (!ted) {
                this.removeValue('data')
            } else {
                this.setValue('data', ted.toObject())
            }
            this.__attachment = ted
        }, setBinaryData: function (bin) {
            if (!bin) {
                this.setData(null)
            } else {
                this.setData(TransportableData.create(bin))
            }
        }, getFilename: function () {
            return this.getString('filename', null)
        }, setFilename: function (filename) {
            if (!filename) {
                this.removeValue('filename')
            } else {
                this.setValue('filename', filename)
            }
        }, getURL: function () {
            return this.getString('URL', null)
        }, setURL: function (url) {
            if (!url) {
                this.removeValue('URL')
            } else {
                this.setValue('URL', url)
            }
        }, getPassword: function () {
            var pwd = this.__password;
            if (!pwd) {
                var key = this.getValue('password');
                pwd = SymmetricKey.parse(key);
                this.__password = pwd
            }
            return pwd
        }, setPassword: function (key) {
            if (!key) {
                this.removeValue('password')
            } else {
                this.setMap('password', key)
            }
            this.__password = key
        }
    });
    ns.format.BaseFileWrapper = BaseFileWrapper
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Content = ns.protocol.Content;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var TextContent = Interface(null, [Content]);
    TextContent.prototype.setText = function (text) {
    };
    TextContent.prototype.getText = function () {
    };
    TextContent.create = function (text) {
        return new ns.dkd.BaseTextContent(text)
    };
    var ArrayContent = Interface(null, [Content]);
    ArrayContent.prototype.getContents = function () {
    };
    ArrayContent.convert = function (contents) {
        var array = [];
        var item;
        for (var i = 0; i < contents.length; ++i) {
            item = Content.parse(contents[i]);
            if (item) {
                array.push(item)
            }
        }
        return array
    };
    ArrayContent.revert = function (contents) {
        var array = [];
        var item;
        for (var i = 0; i < contents.length; ++i) {
            item = contents[i];
            if (Interface.conforms(item, Content)) {
                array.push(item.toMap())
            } else {
                array.push(item)
            }
        }
        return array
    };
    ArrayContent.create = function (contents) {
        return new ns.dkd.ListContent(contents)
    };
    var ForwardContent = Interface(null, [Content]);
    ForwardContent.prototype.getForward = function () {
    };
    ForwardContent.prototype.getSecrets = function () {
    };
    ForwardContent.convert = function (messages) {
        var array = [];
        var msg;
        for (var i = 0; i < messages.length; ++i) {
            msg = ReliableMessage.parse(messages[i]);
            if (msg) {
                array.push(msg)
            }
        }
        return array
    };
    ForwardContent.revert = function (messages) {
        var array = [];
        var item;
        for (var i = 0; i < messages.length; ++i) {
            item = messages[i];
            if (Interface.conforms(item, ReliableMessage)) {
                array.push(item.toMap())
            } else {
                array.push(item)
            }
        }
        return array
    };
    ForwardContent.create = function (secrets) {
        return new ns.dkd.SecretContent(secrets)
    };
    var PageContent = Interface(null, [Content]);
    PageContent.prototype.setTitle = function (title) {
    };
    PageContent.prototype.getTitle = function () {
    };
    PageContent.prototype.setIcon = function (pnf) {
    };
    PageContent.prototype.getIcon = function () {
    };
    PageContent.prototype.setDesc = function (text) {
    };
    PageContent.prototype.getDesc = function () {
    };
    PageContent.prototype.getURL = function () {
    };
    PageContent.prototype.setURL = function (url) {
    };
    PageContent.prototype.getHTML = function () {
    };
    PageContent.prototype.setHTML = function (url) {
    };
    PageContent.create = function (info) {
        var content = new ns.dkd.WebPageContent();
        var title = info['title'];
        if (title) {
            content.setTitle(title)
        }
        var desc = info['desc'];
        if (desc) {
            content.setDesc(desc)
        }
        var url = info['URL'];
        if (url) {
            content.setURL(url)
        }
        var html = info['HTML'];
        if (html) {
            content.setHTML(html)
        }
        var icon = info['icon'];
        if (icon) {
            content.setIcon(icon)
        }
        return content
    };
    var NameCard = Interface(null, [Content]);
    NameCard.prototype.getIdentifier = function () {
    };
    NameCard.prototype.getName = function () {
    };
    NameCard.prototype.getAvatar = function () {
    };
    NameCard.create = function (identifier, mame, avatar) {
        var content = new ns.dkd.NameCardContent(identifier);
        content.setName(name);
        content.setAvatar(avatar);
        return content
    };
    ns.protocol.TextContent = TextContent;
    ns.protocol.ArrayContent = ArrayContent;
    ns.protocol.ForwardContent = ForwardContent;
    ns.protocol.PageContent = PageContent;
    ns.protocol.NameCard = NameCard
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Content = ns.protocol.Content;
    var FileContent = Interface(null, [Content]);
    FileContent.prototype.setData = function (data) {
    };
    FileContent.prototype.getData = function () {
    };
    FileContent.prototype.setFilename = function (filename) {
    };
    FileContent.prototype.getFilename = function () {
    };
    FileContent.prototype.setURL = function (url) {
    };
    FileContent.prototype.getURL = function () {
    };
    FileContent.prototype.setPassword = function (key) {
    };
    FileContent.prototype.getPassword = function () {
    };
    var init_content = function (content, data, filename, url, password) {
        if (data) {
            content.setTransportableData(data)
        }
        if (filename) {
            content.setFilename(filename)
        }
        if (url) {
            content.setURL(url)
        }
        if (password) {
            content.setPassword(password)
        }
        return content
    };
    FileContent.create = function (type, data, filename, url, password) {
        var content = new ns.dkd.BaseFileContent(type);
        return init_content(content, data, filename, url, password)
    };
    FileContent.file = function (data, filename, url, password) {
        var content = new ns.dkd.BaseFileContent();
        return init_content(content, data, filename, url, password)
    };
    FileContent.image = function (data, filename, url, password) {
        var content = new ns.dkd.ImageFileContent();
        return init_content(content, data, filename, url, password)
    };
    FileContent.audio = function (data, filename, url, password) {
        var content = new ns.dkd.AudioFileContent();
        return init_content(content, data, filename, url, password)
    };
    FileContent.video = function (data, filename, url, password) {
        var content = new ns.dkd.VideoFileContent();
        return init_content(content, data, filename, url, password)
    };
    ns.protocol.FileContent = FileContent
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var FileContent = ns.protocol.FileContent;
    var ImageContent = Interface(null, [FileContent]);
    ImageContent.prototype.setThumbnail = function (image) {
    };
    ImageContent.prototype.getThumbnail = function () {
    };
    var VideoContent = Interface(null, [FileContent]);
    VideoContent.prototype.setSnapshot = function (image) {
    };
    VideoContent.prototype.getSnapshot = function () {
    };
    var AudioContent = Interface(null, [FileContent]);
    AudioContent.prototype.setText = function (asr) {
    };
    AudioContent.prototype.getText = function () {
    };
    ns.protocol.ImageContent = ImageContent;
    ns.protocol.AudioContent = AudioContent;
    ns.protocol.VideoContent = VideoContent
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Content = ns.protocol.Content;
    var MoneyContent = Interface(null, [Content]);
    MoneyContent.prototype.getCurrency = function () {
    };
    MoneyContent.prototype.setAmount = function (amount) {
    };
    MoneyContent.prototype.getAmount = function () {
    };
    MoneyContent.create = function (type, currency, amount) {
        return new ns.dkd.BaseMoneyContent(type, currency, amount)
    };
    var TransferContent = Interface(null, [MoneyContent]);
    TransferContent.prototype.setRemitter = function (sender) {
    };
    TransferContent.prototype.getRemitter = function () {
    };
    TransferContent.prototype.setRemittee = function (receiver) {
    };
    TransferContent.prototype.getRemittee = function () {
    };
    TransferContent.create = function (currency, amount) {
        return new ns.dkd.TransferMoneyContent(currency, amount)
    };
    ns.protocol.MoneyContent = MoneyContent;
    ns.protocol.TransferContent = TransferContent
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Content = ns.protocol.Content;
    var CustomizedContent = Interface(null, [Content]);
    CustomizedContent.prototype.getApplication = function () {
    };
    CustomizedContent.prototype.getModule = function () {
    };
    CustomizedContent.prototype.getAction = function () {
    };
    CustomizedContent.create = function () {
        var type, app, mod, act;
        if (arguments.length === 4) {
            type = arguments[0];
            app = arguments[1];
            mod = arguments[2];
            act = arguments[3];
            return new ns.dkd.AppCustomizedContent(type, app, mod, act)
        } else if (arguments.length === 3) {
            app = arguments[0];
            mod = arguments[1];
            act = arguments[2];
            return new ns.dkd.AppCustomizedContent(app, mod, act)
        } else {
            throw new SyntaxError('customized content arguments error: ' + arguments);
        }
    };
    ns.protocol.CustomizedContent = CustomizedContent
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Content = ns.protocol.Content;
    var Command = Interface(null, [Content]);
    Command.META = 'meta';
    Command.DOCUMENT = 'document';
    Command.RECEIPT = 'receipt';
    Command.prototype.getCmd = function () {
    };
    var general_factory = function () {
        var man = ns.dkd.cmd.CommandFactoryManager;
        return man.generalFactory
    };
    Command.parse = function (command) {
        var gf = general_factory();
        return gf.parseCommand(command)
    };
    Command.setFactory = function (cmd, factory) {
        var gf = general_factory();
        gf.setCommandFactory(cmd, factory)
    };
    Command.getFactory = function (cmd) {
        var gf = general_factory();
        return gf.getCommandFactory(cmd)
    };
    var CommandFactory = Interface(null, null);
    CommandFactory.prototype.parseCommand = function (content) {
    };
    Command.Factory = CommandFactory;
    ns.protocol.Command = Command
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Command = ns.protocol.Command;
    var MetaCommand = Interface(null, [Command]);
    MetaCommand.prototype.getIdentifier = function () {
    };
    MetaCommand.prototype.getMeta = function () {
    };
    MetaCommand.query = function (identifier) {
        return new ns.dkd.cmd.BaseMetaCommand(identifier)
    };
    MetaCommand.response = function (identifier, meta) {
        var command = new ns.dkd.cmd.BaseMetaCommand(identifier);
        command.setMeta(meta);
        return command
    };
    var DocumentCommand = Interface(null, [MetaCommand]);
    DocumentCommand.prototype.getDocument = function () {
    };
    DocumentCommand.prototype.getLastTime = function () {
    };
    DocumentCommand.query = function (identifier, lastTime) {
        var command = new ns.dkd.cmd.BaseDocumentCommand(identifier);
        if (lastTime) {
            command.setLastTime(lastTime)
        }
        return command
    };
    DocumentCommand.response = function (identifier, meta, doc) {
        var command = new ns.dkd.cmd.BaseDocumentCommand(identifier);
        command.setMeta(meta);
        command.setDocument(doc);
        return command
    };
    ns.protocol.MetaCommand = MetaCommand;
    ns.protocol.DocumentCommand = DocumentCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var HistoryCommand = Interface(null, [Command]);
    HistoryCommand.REGISTER = 'register';
    HistoryCommand.SUICIDE = 'suicide';
    var GroupCommand = Interface(null, [HistoryCommand]);
    GroupCommand.FOUND = 'found';
    GroupCommand.ABDICATE = 'abdicate';
    GroupCommand.INVITE = 'invite';
    GroupCommand.EXPEL = 'expel';
    GroupCommand.JOIN = 'join';
    GroupCommand.QUIT = 'quit';
    GroupCommand.QUERY = 'query';
    GroupCommand.RESET = 'reset';
    GroupCommand.HIRE = 'hire';
    GroupCommand.FIRE = 'fire';
    GroupCommand.RESIGN = 'resign';
    GroupCommand.prototype.setMember = function (identifier) {
    };
    GroupCommand.prototype.getMember = function () {
    };
    GroupCommand.prototype.setMembers = function (members) {
    };
    GroupCommand.prototype.getMembers = function () {
    };
    GroupCommand.create = function (cmd, group, members) {
        var command = new ns.dkd.cmd.BaseGroupCommand(cmd, group);
        if (!members) {
        } else if (members instanceof Array) {
            command.setMembers(members)
        } else if (Interface.conforms(members, ID)) {
            command.setMember(members)
        } else {
            throw new TypeError('group members error: ' + members);
        }
        return command
    };
    GroupCommand.invite = function (group, members) {
        var command = new ns.dkd.cmd.InviteGroupCommand(group);
        if (members instanceof Array) {
            command.setMembers(members)
        } else if (Interface.conforms(members, ID)) {
            command.setMember(members)
        } else {
            throw new TypeError('invite members error: ' + members);
        }
        return command
    };
    GroupCommand.expel = function (group, members) {
        var command = new ns.dkd.cmd.ExpelGroupCommand(group);
        if (members instanceof Array) {
            command.setMembers(members)
        } else if (Interface.conforms(members, ID)) {
            command.setMember(members)
        } else {
            throw new TypeError('expel members error: ' + members);
        }
        return command
    };
    GroupCommand.join = function (group) {
        return new ns.dkd.cmd.JoinGroupCommand(group)
    };
    GroupCommand.quit = function (group) {
        return new ns.dkd.cmd.QuitGroupCommand(group)
    };
    GroupCommand.query = function (group) {
        return new ns.dkd.cmd.QueryGroupCommand(group)
    };
    GroupCommand.reset = function (group, members) {
        var command = new ns.dkd.cmd.ResetGroupCommand(group, members);
        if (members instanceof Array) {
            command.setMembers(members)
        } else {
            throw new TypeError('reset members error: ' + members);
        }
        return command
    };
    var get_targets = function (info, batch, single) {
        var users = info[batch];
        if (users) {
            return ID.convert(users)
        }
        var usr = ID.parse(info[single]);
        if (usr) {
            return [usr]
        } else {
            return []
        }
    };
    GroupCommand.hire = function (group, targets) {
        var command = new ns.dkd.cmd.HireGroupCommand(group);
        var admins = get_targets(targets, 'administrators', 'administrator');
        if (admins.length > 0) {
            command.setAdministrators(admins)
        }
        var bots = get_targets(targets, 'assistants', 'assistant');
        if (bots.length > 0) {
            command.setAssistants(bots)
        }
        return command
    };
    GroupCommand.fire = function (group, targets) {
        var command = new ns.dkd.cmd.FireGroupCommand(group);
        var admins = get_targets(targets, 'administrators', 'administrator');
        if (admins.length > 0) {
            command.setAdministrators(admins)
        }
        var bots = get_targets(targets, 'assistants', 'assistant');
        if (bots.length > 0) {
            command.setAssistants(bots)
        }
        return command
    };
    GroupCommand.resign = function (group) {
        return new ns.dkd.cmd.ResignGroupCommand(group)
    };
    ns.protocol.HistoryCommand = HistoryCommand;
    ns.protocol.GroupCommand = GroupCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var GroupCommand = ns.protocol.GroupCommand;
    var InviteCommand = Interface(null, [GroupCommand]);
    var ExpelCommand = Interface(null, [GroupCommand]);
    var JoinCommand = Interface(null, [GroupCommand]);
    var QuitCommand = Interface(null, [GroupCommand]);
    var ResetCommand = Interface(null, [GroupCommand]);
    var QueryCommand = Interface(null, [GroupCommand]);
    var HireCommand = Interface(null, [GroupCommand]);
    HireCommand.prototype.getAdministrators = function () {
    };
    HireCommand.prototype.setAdministrators = function (members) {
    };
    HireCommand.prototype.getAssistants = function () {
    };
    HireCommand.prototype.setAssistants = function (bots) {
    };
    var FireCommand = Interface(null, [GroupCommand]);
    FireCommand.prototype.getAdministrators = function () {
    };
    FireCommand.prototype.setAdministrators = function (members) {
    };
    FireCommand.prototype.getAssistants = function () {
    };
    FireCommand.prototype.setAssistants = function (bots) {
    };
    var ResignCommand = Interface(null, [GroupCommand]);
    ns.protocol.group.InviteCommand = InviteCommand;
    ns.protocol.group.ExpelCommand = ExpelCommand;
    ns.protocol.group.JoinCommand = JoinCommand;
    ns.protocol.group.QuitCommand = QuitCommand;
    ns.protocol.group.ResetCommand = ResetCommand;
    ns.protocol.group.QueryCommand = QueryCommand;
    ns.protocol.group.HireCommand = HireCommand;
    ns.protocol.group.FireCommand = FireCommand;
    ns.protocol.group.ResignCommand = ResignCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Command = ns.protocol.Command;
    var ReceiptCommand = Interface(null, [Command]);
    ReceiptCommand.prototype.getText = function () {
    };
    ReceiptCommand.prototype.getOriginalEnvelope = function () {
    };
    ReceiptCommand.prototype.getOriginalSerialNumber = function () {
    };
    ReceiptCommand.prototype.getOriginalSignature = function () {
    };
    var purify = function (envelope) {
        var info = envelope.copyMap(false);
        if (info['data']) {
            delete info['data'];
            delete info['key'];
            delete info['keys'];
            delete info['meta'];
            delete info['visa']
        }
        return info
    };
    ReceiptCommand.create = function (text, head, body) {
        var info;
        if (!head) {
            info = null
        } else if (!body) {
            info = purify(head)
        } else {
            info = purify(head);
            info['sn'] = body.getSerialNumber()
        }
        var command = new ns.dkd.cmd.BaseReceiptCommand(text, info);
        if (body) {
            var group = body.getGroup();
            if (group) {
                command.setGroup(group)
            }
        }
        return command
    };
    ReceiptCommand.purify = purify;
    ns.protocol.ReceiptCommand = ReceiptCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Document = ns.protocol.Document;
    var Visa = Interface(null, [Document]);
    Visa.prototype.getPublicKey = function () {
    };
    Visa.prototype.setPublicKey = function (pKey) {
    };
    Visa.prototype.getAvatar = function () {
    };
    Visa.prototype.setAvatar = function (image) {
    };
    var Bulletin = Interface(null, [Document]);
    Bulletin.prototype.getFounder = function () {
    };
    Bulletin.prototype.getAssistants = function () {
    };
    Bulletin.prototype.setAssistants = function (assistants) {
    };
    ns.protocol.Visa = Visa;
    ns.protocol.Bulletin = Bulletin
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var Enum = ns.type.Enum;
    var Dictionary = ns.type.Dictionary;
    var ID = ns.protocol.ID;
    var Content = ns.protocol.Content;
    var InstantMessage = ns.protocol.InstantMessage;
    var BaseContent = function (info) {
        if (Enum.isEnum(info)) {
            info = info.getValue()
        }
        var content, type, sn, time;
        if (IObject.isNumber(info)) {
            type = info;
            time = new Date();
            sn = InstantMessage.generateSerialNumber(type, time);
            content = {'type': type, 'sn': sn, 'time': time.getTime() / 1000.0}
        } else {
            content = info;
            type = 0;
            sn = 0;
            time = null
        }
        Dictionary.call(this, content);
        this.__type = type;
        this.__sn = sn;
        this.__time = time
    };
    Class(BaseContent, Dictionary, [Content], {
        getType: function () {
            if (this.__type === 0) {
                var gf = ns.dkd.MessageFactoryManager.generalFactory;
                this.__type = gf.getContentType(this.toMap(), 0)
            }
            return this.__type
        }, getSerialNumber: function () {
            if (this.__sn === 0) {
                this.__sn = this.getInt('sn', 0)
            }
            return this.__sn
        }, getTime: function () {
            if (this.__time === null) {
                this.__time = this.getDateTime('time', null)
            }
            return this.__time
        }, getGroup: function () {
            var group = this.getValue('group');
            return ID.parse(group)
        }, setGroup: function (identifier) {
            this.setString('group', identifier)
        }
    });
    ns.dkd.BaseContent = BaseContent
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Interface = ns.type.Interface;
    var IObject = ns.type.Object;
    var PortableNetworkFile = ns.format.PortableNetworkFile;
    var ID = ns.protocol.ID;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var ContentType = ns.protocol.ContentType;
    var TextContent = ns.protocol.TextContent;
    var ArrayContent = ns.protocol.ArrayContent;
    var ForwardContent = ns.protocol.ForwardContent;
    var PageContent = ns.protocol.PageContent;
    var NameCard = ns.protocol.NameCard;
    var BaseContent = ns.dkd.BaseContent;
    var BaseTextContent = function (info) {
        if (IObject.isString(info)) {
            BaseContent.call(this, ContentType.TEXT);
            this.setText(info)
        } else {
            BaseContent.call(this, info)
        }
    };
    Class(BaseTextContent, BaseContent, [TextContent], {
        getText: function () {
            return this.getString('text', '')
        }, setText: function (text) {
            this.setValue('text', text)
        }
    });
    var ListContent = function (info) {
        var list;
        if (info instanceof Array) {
            BaseContent.call(this, ContentType.ARRAY);
            list = info;
            this.setValue('contents', ArrayContent.revert(list))
        } else {
            BaseContent.call(this, info);
            list = null
        }
        this.__list = list
    };
    Class(ListContent, BaseContent, [ArrayContent], {
        getContents: function () {
            if (this.__list === null) {
                var array = this.getValue('contents');
                if (array) {
                    this.__list = ArrayContent.convert(array)
                } else {
                    this.__list = []
                }
            }
            return this.__list
        }
    });
    var SecretContent = function (info) {
        var forward = null;
        var secrets = null;
        if (info instanceof Array) {
            BaseContent.call(this, ContentType.FORWARD);
            secrets = info
        } else if (Interface.conforms(info, ReliableMessage)) {
            BaseContent.call(this, ContentType.FORWARD);
            forward = info
        } else {
            BaseContent.call(this, info)
        }
        if (forward) {
            this.setMap('forward', forward)
        } else if (secrets) {
            var array = ForwardContent.revert(secrets);
            this.setValue('secrets', array)
        }
        this.__forward = forward;
        this.__secrets = secrets
    };
    Class(SecretContent, BaseContent, [ForwardContent], {
        getForward: function () {
            if (this.__forward === null) {
                var forward = this.getValue('forward');
                this.__forward = ReliableMessage.parse(forward)
            }
            return this.__forward
        }, getSecrets: function () {
            if (this.__secrets === null) {
                var array = this.getValue('secrets');
                if (array) {
                    this.__secrets = ForwardContent.convert(array)
                } else {
                    this.__secrets = [];
                    var msg = this.getForward();
                    if (msg) {
                        this.__secrets.push(msg)
                    }
                }
            }
            return this.__secrets
        }
    });
    var WebPageContent = function (info) {
        if (info) {
            BaseContent.call(this, info)
        } else {
            BaseContent.call(this, ContentType.PAGE)
        }
        this.__icon = null
    };
    Class(WebPageContent, BaseContent, [PageContent], {
        getTitle: function () {
            return this.getString('title', '')
        }, setTitle: function (title) {
            this.setValue('title', title)
        }, getDesc: function () {
            return this.getString('desc', null)
        }, setDesc: function (text) {
            this.setValue('desc', text)
        }, getURL: function () {
            return this.getString('URL', null)
        }, setURL: function (url) {
            this.setValue('URL', url)
        }, getHTML: function () {
            return this.getString('HTML', null)
        }, setHTML: function (html) {
            this.setValue('HTML', html)
        }, getIcon: function () {
            var pnf = this.__icon;
            if (!pnf) {
                var url = this.getString('icon', null);
                pnf = PortableNetworkFile.parse(url);
                this.__icon = pnf
            }
            return pnf
        }, setIcon: function (image) {
            var pnf = null;
            if (Interface.conforms(image, PortableNetworkFile)) {
                pnf = image;
                this.setValue('icon', pnf.toObject())
            } else if (IObject.isString(image)) {
                this.setValue('icon', image)
            } else {
                this.removeValue('icon')
            }
            this.__icon = pnf
        }
    });
    var NameCardContent = function (info) {
        if (Interface.conforms(info, ID)) {
            BaseContent.call(this, ContentType.NAME_CARD);
            this.setString('ID', info)
        } else {
            BaseContent.call(this, info)
        }
        this.__image = null
    };
    Class(NameCardContent, BaseContent, [NameCard], {
        getIdentifier: function () {
            var id = this.getValue('ID');
            return ID.parse(id)
        }, getName: function () {
            return this.getString('name', '')
        }, setName: function (name) {
            this.setValue('name', name)
        }, getAvatar: function () {
            var pnf = this.__image;
            if (!pnf) {
                var url = this.getString('avatar', null);
                pnf = PortableNetworkFile.parse(url);
                this.__icon = pnf
            }
            return pnf
        }, setAvatar: function (image) {
            var pnf = null;
            if (Interface.conforms(image, PortableNetworkFile)) {
                pnf = image;
                this.setValue('avatar', pnf.toObject())
            } else if (IObject.isString(image)) {
                this.setValue('avatar', image)
            } else {
                this.removeValue('avatar')
            }
            this.__image = pnf
        }
    });
    ns.dkd.BaseTextContent = BaseTextContent;
    ns.dkd.ListContent = ListContent;
    ns.dkd.SecretContent = SecretContent;
    ns.dkd.WebPageContent = WebPageContent;
    ns.dkd.NameCardContent = NameCardContent
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var BaseFileWrapper = ns.format.BaseFileWrapper;
    var ContentType = ns.protocol.ContentType;
    var FileContent = ns.protocol.FileContent;
    var BaseContent = ns.dkd.BaseContent;
    var BaseFileContent = function (info) {
        if (!info) {
            info = ContentType.FILE
        }
        BaseContent.call(this, info);
        this.__wrapper = new BaseFileWrapper(this.toMap())
    };
    Class(BaseFileContent, BaseContent, [FileContent], {
        getData: function () {
            var ted = this.__wrapper.getData();
            return !ted ? null : ted.getData()
        }, setData: function (data) {
            this.__wrapper.setBinaryData(data)
        }, setTransportableData: function (ted) {
            this.__wrapper.setData(ted)
        }, getFilename: function () {
            return this.__wrapper.getFilename()
        }, setFilename: function (filename) {
            this.__wrapper.setFilename(filename)
        }, getURL: function () {
            return this.__wrapper.getURL()
        }, setURL: function (url) {
            this.__wrapper.setURL(url)
        }, getPassword: function () {
            return this.__wrapper.getPassword()
        }, setPassword: function (key) {
            this.__wrapper.setPassword(key)
        }
    });
    ns.dkd.BaseFileContent = BaseFileContent
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var PortableNetworkFile = ns.format.PortableNetworkFile;
    var ContentType = ns.protocol.ContentType;
    var ImageContent = ns.protocol.ImageContent;
    var VideoContent = ns.protocol.VideoContent;
    var AudioContent = ns.protocol.AudioContent;
    var BaseFileContent = ns.dkd.BaseFileContent;
    var ImageFileContent = function (info) {
        if (!info) {
            BaseFileContent.call(this, ContentType.IMAGE)
        } else {
            BaseFileContent.call(this, info)
        }
        this.__thumbnail = null
    };
    Class(ImageFileContent, BaseFileContent, [ImageContent], {
        getThumbnail: function () {
            var pnf = this.__thumbnail;
            if (!pnf) {
                var base64 = this.getString('thumbnail', null);
                pnf = PortableNetworkFile.parse(base64);
                this.__thumbnail = pnf
            }
            return pnf
        }, setThumbnail: function (image) {
            var pnf = null;
            if (!image) {
                this.removeValue('thumbnail')
            } else if (Interface.conforms(image, PortableNetworkFile)) {
                pnf = image;
                this.setValue('thumbnail', pnf.toObject())
            } else if (IObject.isString(image)) {
                this.setValue('thumbnail', image)
            }
            this.__thumbnail = pnf
        }
    });
    var VideoFileContent = function (info) {
        if (!info) {
            BaseFileContent.call(this, ContentType.VIDEO)
        } else {
            BaseFileContent.call(this, info)
        }
        this.__snapshot = null
    };
    Class(VideoFileContent, BaseFileContent, [VideoContent], {
        getSnapshot: function () {
            var pnf = this.__snapshot;
            if (!pnf) {
                var base64 = this.getString('snapshot', null);
                pnf = PortableNetworkFile.parse(base64);
                this.__snapshot = pnf
            }
            return pnf
        }, setSnapshot: function (image) {
            var pnf = null;
            if (!image) {
                this.removeValue('snapshot')
            } else if (Interface.conforms(image, PortableNetworkFile)) {
                pnf = image;
                this.setValue('snapshot', pnf.toObject())
            } else if (IObject.isString(image)) {
                this.setValue('snapshot', image)
            }
            this.__snapshot = pnf
        }
    });
    var AudioFileContent = function (info) {
        if (!info) {
            BaseFileContent.call(this, ContentType.AUDIO)
        } else {
            BaseFileContent.call(this, info)
        }
    };
    Class(AudioFileContent, BaseFileContent, [AudioContent], {
        getText: function () {
            return this.getString('text', null)
        }, setText: function (asr) {
            this.setValue('text', asr)
        }
    });
    ns.dkd.ImageFileContent = ImageFileContent;
    ns.dkd.VideoFileContent = VideoFileContent;
    ns.dkd.AudioFileContent = AudioFileContent
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var ContentType = ns.protocol.ContentType;
    var MoneyContent = ns.protocol.MoneyContent;
    var TransferContent = ns.protocol.TransferContent;
    var BaseContent = ns.dkd.BaseContent;
    var BaseMoneyContent = function () {
        if (arguments.length === 1) {
            BaseContent.call(arguments[0])
        } else if (arguments.length === 2) {
            BaseContent.call(ContentType.MONEY);
            this.setCurrency(arguments[0]);
            this.setAmount(arguments[1])
        } else if (arguments.length === 3) {
            BaseContent.call(arguments[0]);
            this.setCurrency(arguments[1]);
            this.setAmount(arguments[2])
        } else {
            throw new SyntaxError('money content arguments error: ' + arguments);
        }
    };
    Class(BaseMoneyContent, BaseContent, [MoneyContent], {
        setCurrency: function (currency) {
            this.setValue('currency', currency)
        }, getCurrency: function () {
            return this.getString('currency', null)
        }, setAmount: function (amount) {
            this.setValue('amount', amount)
        }, getAmount: function () {
            return this.getFloat('amount', 0)
        }
    });
    var TransferMoneyContent = function () {
        if (arguments.length === 1) {
            MoneyContent.call(arguments[0])
        } else if (arguments.length === 2) {
            MoneyContent.call(ContentType.TRANSFER, arguments[0], arguments[1])
        } else {
            throw new SyntaxError('money content arguments error: ' + arguments);
        }
    };
    Class(TransferMoneyContent, BaseMoneyContent, [TransferContent], {
        getRemitter: function () {
            var sender = this.getValue('remitter');
            return ID.parse(sender)
        }, setRemitter: function (sender) {
            this.setString('remitter', sender)
        }, getRemittee: function () {
            var receiver = this.getValue('remittee');
            return ID.parse(receiver)
        }, setRemittee: function (receiver) {
            this.setString('remittee', receiver)
        }
    });
    ns.dkd.BaseMoneyContent = BaseMoneyContent;
    ns.dkd.TransferMoneyContent = TransferMoneyContent
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ContentType = ns.protocol.ContentType;
    var CustomizedContent = ns.protocol.CustomizedContent;
    var BaseContent = ns.dkd.BaseContent;
    var AppCustomizedContent = function () {
        var app = null;
        var mod = null;
        var act = null;
        if (arguments.length === 4) {
            BaseContent.call(this, arguments[0]);
            app = arguments[1];
            mod = arguments[2];
            act = arguments[3]
        } else if (arguments.length === 3) {
            BaseContent.call(this, ContentType.CUSTOMIZED);
            app = arguments[0];
            mod = arguments[1];
            act = arguments[2]
        } else {
            BaseContent.call(this, arguments[0])
        }
        if (app) {
            this.setValue('app', app)
        }
        if (mod) {
            this.setValue('mod', mod)
        }
        if (act) {
            this.setValue('act', act)
        }
    };
    Class(AppCustomizedContent, BaseContent, [CustomizedContent], {
        getApplication: function () {
            return this.getString('app', null)
        }, getModule: function () {
            return this.getString('mod', null)
        }, getAction: function () {
            return this.getString('act', null)
        }
    });
    ns.dkd.AppCustomizedContent = AppCustomizedContent
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var BaseContent = ns.dkd.BaseContent;
    var BaseCommand = function () {
        if (arguments.length === 2) {
            BaseContent.call(this, arguments[0]);
            this.setValue('command', arguments[1])
        } else if (IObject.isString(arguments[0])) {
            BaseContent.call(this, ContentType.COMMAND);
            this.setValue('command', arguments[0])
        } else {
            BaseContent.call(this, arguments[0])
        }
    };
    Class(BaseCommand, BaseContent, [Command], {
        getCmd: function () {
            var gf = ns.dkd.cmd.CommandFactoryManager.generalFactory;
            return gf.getCmd(this.toMap(), '')
        }
    });
    ns.dkd.cmd.BaseCommand = BaseCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var Document = ns.protocol.Document;
    var Command = ns.protocol.Command;
    var MetaCommand = ns.protocol.MetaCommand;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseMetaCommand = function () {
        var identifier = null;
        if (arguments.length === 2) {
            BaseCommand.call(this, arguments[1]);
            identifier = arguments[0]
        } else if (Interface.conforms(arguments[0], ID)) {
            BaseCommand.call(this, Command.META);
            identifier = arguments[0]
        } else {
            BaseCommand.call(this, arguments[0])
        }
        if (identifier) {
            this.setString('ID', identifier)
        }
        this.__identifier = identifier;
        this.__meta = null
    };
    Class(BaseMetaCommand, BaseCommand, [MetaCommand], {
        getIdentifier: function () {
            if (this.__identifier == null) {
                var identifier = this.getValue("ID");
                this.__identifier = ID.parse(identifier)
            }
            return this.__identifier
        }, getMeta: function () {
            if (this.__meta === null) {
                var meta = this.getValue('meta');
                this.__meta = Meta.parse(meta)
            }
            return this.__meta
        }, setMeta: function (meta) {
            this.setMap('meta', meta);
            this.__meta = meta
        }
    });
    var BaseDocumentCommand = function (info) {
        if (Interface.conforms(info, ID)) {
            BaseMetaCommand.call(this, info, Command.DOCUMENT)
        } else {
            BaseMetaCommand.call(this, info)
        }
        this.__document = null
    };
    Class(BaseDocumentCommand, BaseMetaCommand, [DocumentCommand], {
        getDocument: function () {
            if (this.__document === null) {
                var doc = this.getValue('document');
                this.__document = Document.parse(doc)
            }
            return this.__document
        }, setDocument: function (doc) {
            this.setMap('document', doc);
            this.__document = doc
        }, getLastTime: function () {
            return this.getDateTime('last_time', null)
        }, setLastTime: function (when) {
            this.setDateTime('last_time', when)
        }
    });
    ns.dkd.cmd.BaseMetaCommand = BaseMetaCommand;
    ns.dkd.cmd.BaseDocumentCommand = BaseDocumentCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var ID = ns.protocol.ID;
    var ContentType = ns.protocol.ContentType;
    var HistoryCommand = ns.protocol.HistoryCommand;
    var GroupCommand = ns.protocol.GroupCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseHistoryCommand = function () {
        if (arguments.length === 2) {
            BaseCommand.call(this, arguments[0], arguments[1])
        } else if (IObject.isString(arguments[0])) {
            BaseCommand.call(this, ContentType.HISTORY, arguments[0])
        } else {
            BaseCommand.call(this, arguments[0])
        }
    };
    Class(BaseHistoryCommand, BaseCommand, [HistoryCommand], null);
    var BaseGroupCommand = function () {
        if (arguments.length === 1) {
            BaseHistoryCommand.call(this, arguments[0])
        } else if (arguments.length === 2) {
            BaseHistoryCommand.call(this, ContentType.COMMAND, arguments[0]);
            this.setGroup(arguments[1])
        } else {
            throw new SyntaxError('Group command arguments error: ' + arguments);
        }
    };
    Class(BaseGroupCommand, BaseHistoryCommand, [GroupCommand], {
        setMember: function (identifier) {
            this.setString('member', identifier);
            this.removeValue('members')
        }, getMember: function () {
            var member = this.getValue('member');
            return ID.parse(member)
        }, setMembers: function (users) {
            if (!users) {
                this.removeValue('members')
            } else {
                var array = ID.revert(users);
                this.setValue('members', array)
            }
            this.removeValue('member')
        }, getMembers: function () {
            var array = this.getValue('members');
            if (array instanceof Array) {
                return ID.convert(array)
            }
            var single = this.getMember();
            return !single ? [] : [single]
        }
    });
    ns.dkd.cmd.BaseHistoryCommand = BaseHistoryCommand;
    ns.dkd.cmd.BaseGroupCommand = BaseGroupCommand
})(DIMP);
(function (ns) {
    'use strict';
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
    var HireCommand = ns.protocol.group.HireCommand;
    var FireCommand = ns.protocol.group.FireCommand;
    var ResignCommand = ns.protocol.group.ResignCommand;
    var BaseGroupCommand = ns.dkd.cmd.BaseGroupCommand;
    var InviteGroupCommand = function (info) {
        if (Interface.conforms(info, ID)) {
            BaseGroupCommand.call(this, GroupCommand.INVITE, info)
        } else {
            BaseGroupCommand.call(this, info)
        }
    };
    Class(InviteGroupCommand, BaseGroupCommand, [InviteCommand], null);
    var ExpelGroupCommand = function (info) {
        if (Interface.conforms(info, ID)) {
            BaseGroupCommand.call(this, GroupCommand.EXPEL, info)
        } else {
            BaseGroupCommand.call(this, info)
        }
    };
    Class(ExpelGroupCommand, BaseGroupCommand, [ExpelCommand], null);
    var JoinGroupCommand = function (info) {
        if (Interface.conforms(info, ID)) {
            BaseGroupCommand.call(this, GroupCommand.JOIN, info)
        } else {
            BaseGroupCommand.call(this, info)
        }
    };
    Class(JoinGroupCommand, BaseGroupCommand, [JoinCommand], null);
    var QuitGroupCommand = function (info) {
        if (Interface.conforms(info, ID)) {
            BaseGroupCommand.call(this, GroupCommand.QUIT, info)
        } else {
            BaseGroupCommand.call(this, info)
        }
    };
    Class(QuitGroupCommand, BaseGroupCommand, [QuitCommand], null);
    var ResetGroupCommand = function (info) {
        if (Interface.conforms(info, ID)) {
            BaseGroupCommand.call(this, GroupCommand.RESET, info)
        } else {
            BaseGroupCommand.call(this, info)
        }
    };
    Class(ResetGroupCommand, BaseGroupCommand, [ResetCommand], null);
    var QueryGroupCommand = function (info) {
        if (Interface.conforms(info, ID)) {
            BaseGroupCommand.call(this, GroupCommand.QUERY, info)
        } else {
            BaseGroupCommand.call(this, info)
        }
    };
    Class(QueryGroupCommand, BaseGroupCommand, [QueryCommand], null);
    var HireGroupCommand = function (info) {
        if (Interface.conforms(info, ID)) {
            BaseGroupCommand.call(this, GroupCommand.HIRE, info)
        } else {
            BaseGroupCommand.call(this, info)
        }
    };
    Class(HireGroupCommand, BaseGroupCommand, [HireCommand], null);
    var FireGroupCommand = function (info) {
        if (Interface.conforms(info, ID)) {
            BaseGroupCommand.call(this, GroupCommand.FIRE, info)
        } else {
            BaseGroupCommand.call(this, info)
        }
    };
    Class(FireGroupCommand, BaseGroupCommand, [FireCommand], null);
    var ResignGroupCommand = function (info) {
        if (Interface.conforms(info, ID)) {
            BaseGroupCommand.call(this, GroupCommand.RESIGN, info)
        } else {
            BaseGroupCommand.call(this, info)
        }
    };
    Class(ResignGroupCommand, BaseGroupCommand, [ResignCommand], null);
    ns.dkd.cmd.InviteGroupCommand = InviteGroupCommand;
    ns.dkd.cmd.ExpelGroupCommand = ExpelGroupCommand;
    ns.dkd.cmd.JoinGroupCommand = JoinGroupCommand;
    ns.dkd.cmd.QuitGroupCommand = QuitGroupCommand;
    ns.dkd.cmd.ResetGroupCommand = ResetGroupCommand;
    ns.dkd.cmd.QueryGroupCommand = QueryGroupCommand;
    ns.dkd.cmd.HireGroupCommand = HireGroupCommand;
    ns.dkd.cmd.FireGroupCommand = FireGroupCommand;
    ns.dkd.cmd.ResignGroupCommand = ResignGroupCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Converter = ns.type.Converter;
    var Envelope = ns.protocol.Envelope;
    var Command = ns.protocol.Command;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseReceiptCommand = function () {
        if (arguments.length === 1) {
            BaseCommand.call(this, arguments[0])
        } else {
            BaseCommand.call(this, Command.RECEIPT);
            this.setValue('text', arguments[0]);
            var origin = arguments[1];
            if (origin) {
                this.setValue('origin', origin)
            }
        }
        this.__env = null
    };
    Class(BaseReceiptCommand, BaseCommand, [ReceiptCommand], {
        getText: function () {
            return this.getString('text', '')
        }, getOrigin: function () {
            return this.getValue('origin')
        }, getOriginalEnvelope: function () {
            var env = this.__env;
            if (!env) {
                env = Envelope.parse(this.getOrigin());
                this.__env = env
            }
            return env
        }, getOriginalSerialNumber: function () {
            var origin = this.getOrigin();
            if (!origin) {
                return null
            }
            return Converter.getInt(origin['sn'], null)
        }, getOriginalSignature: function () {
            var origin = this.getOrigin();
            if (!origin) {
                return null
            }
            return Converter.getString(origin['signature'], null)
        }
    });
    ns.dkd.cmd.BaseReceiptCommand = BaseReceiptCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Wrapper = ns.type.Wrapper;
    var Converter = ns.type.Converter;
    var Command = ns.protocol.Command;
    var GeneralFactory = function () {
        this.__commandFactories = {}
    };
    Class(GeneralFactory, null, null, {
        setCommandFactory: function (cmd, factory) {
            this.__commandFactories[cmd] = factory
        }, getCommandFactory: function (cmd) {
            return this.__commandFactories[cmd]
        }, getCmd: function (content, defaultValue) {
            return Converter.getString(content['command'], defaultValue)
        }, parseCommand: function (content) {
            if (!content) {
                return null
            } else if (Interface.conforms(content, Command)) {
                return content
            }
            var info = Wrapper.fetchMap(content);
            if (!info) {
                return null
            }
            var cmd = this.getCmd(info, '');
            var factory = this.getCommandFactory(cmd);
            if (!factory) {
                factory = default_factory(info)
            }
            return factory.parseCommand(info)
        }
    });
    var default_factory = function (info) {
        var man = ns.dkd.MessageFactoryManager;
        var gf = man.generalFactory;
        var type = gf.getContentType(info, 0);
        var factory = gf.getContentFactory(type);
        if (Interface.conforms(factory, Command.Factory)) {
            return factory
        }
        return null
    };
    var FactoryManager = {generalFactory: new GeneralFactory()};
    ns.dkd.cmd.CommandGeneralFactory = GeneralFactory;
    ns.dkd.cmd.CommandFactoryManager = FactoryManager
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var Converter = ns.type.Converter;
    var ID = ns.protocol.ID;
    var Envelope = ns.protocol.Envelope;
    var MessageEnvelope = function () {
        var from, to, when;
        var env;
        if (arguments.length === 1) {
            env = arguments[0];
            from = null;
            to = null;
            when = null
        } else if (arguments.length === 2 || arguments.length === 3) {
            from = arguments[0];
            to = arguments[1];
            if (arguments.length === 2) {
                when = new Date()
            } else {
                when = arguments[2];
                if (when === null || when === 0) {
                    when = new Date()
                } else {
                    when = Converter.getDateTime(when, null)
                }
            }
            env = {'sender': from.toString(), 'receiver': to.toString(), 'time': when.getTime() / 1000.0}
        } else {
            throw new SyntaxError('envelope arguments error: ' + arguments);
        }
        Dictionary.call(this, env);
        this.__sender = from;
        this.__receiver = to;
        this.__time = when
    };
    Class(MessageEnvelope, Dictionary, [Envelope], {
        getSender: function () {
            var sender = this.__sender;
            if (!sender) {
                sender = ID.parse(this.getValue('sender'));
                this.__sender = sender
            }
            return sender
        }, getReceiver: function () {
            var receiver = this.__receiver;
            if (!receiver) {
                receiver = ID.parse(this.getValue('receiver'));
                if (!receiver) {
                    receiver = ID.ANYONE
                }
                this.__receiver = receiver
            }
            return receiver
        }, getTime: function () {
            var time = this.__time;
            if (!time) {
                time = this.getDateTime('time', null);
                this.__time = time
            }
            return time
        }, getGroup: function () {
            return ID.parse(this.getValue('group'))
        }, setGroup: function (identifier) {
            this.setString('group', identifier)
        }, getType: function () {
            return this.getInt('type', null)
        }, setType: function (type) {
            this.setValue('type', type)
        }
    });
    ns.msg.MessageEnvelope = MessageEnvelope
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var ID = ns.protocol.ID;
    var Envelope = ns.protocol.Envelope;
    var Message = ns.protocol.Message;
    var BaseMessage = function (msg) {
        var env = null;
        if (Interface.conforms(msg, Envelope)) {
            env = msg;
            msg = env.toMap()
        }
        Dictionary.call(this, msg);
        this.__envelope = env
    };
    Class(BaseMessage, Dictionary, [Message], {
        getEnvelope: function () {
            var env = this.__envelope;
            if (!env) {
                env = Envelope.parse(this.toMap());
                this.__envelope = env
            }
            return env
        }, getSender: function () {
            var env = this.getEnvelope();
            return env.getSender()
        }, getReceiver: function () {
            var env = this.getEnvelope();
            return env.getReceiver()
        }, getTime: function () {
            var env = this.getEnvelope();
            return env.getTime()
        }, getGroup: function () {
            var env = this.getEnvelope();
            return env.getGroup()
        }, getType: function () {
            var env = this.getEnvelope();
            return env.getTime()
        }
    });
    BaseMessage.isBroadcast = function (msg) {
        if (msg.getReceiver().isBroadcast()) {
            return true
        }
        var group = ID.parse(msg.getValue('group'));
        if (!group) {
            return false
        }
        return group.isBroadcast()
    };
    ns.msg.BaseMessage = BaseMessage
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Content = ns.protocol.Content;
    var InstantMessage = ns.protocol.InstantMessage;
    var BaseMessage = ns.msg.BaseMessage;
    var PlainMessage = function () {
        var msg, head, body;
        if (arguments.length === 1) {
            msg = arguments[0];
            head = null;
            body = null
        } else if (arguments.length === 2) {
            head = arguments[0];
            body = arguments[1];
            msg = head.toMap();
            msg['content'] = body.toMap()
        } else {
            throw new SyntaxError('message arguments error: ' + arguments);
        }
        BaseMessage.call(this, msg);
        this.__envelope = head;
        this.__content = body
    };
    Class(PlainMessage, BaseMessage, [InstantMessage], {
        getTime: function () {
            var body = this.getContent();
            var time = body.getTime();
            if (time) {
                return time
            }
            var head = this.getEnvelope();
            return head.getTime()
        }, getGroup: function () {
            var body = this.getContent();
            return body.getGroup()
        }, getType: function () {
            var body = this.getContent();
            return body.getType()
        }, getContent: function () {
            var body = this.__content;
            if (!body) {
                body = Content.parse(this.getValue('content'));
                this.__content = body
            }
            return body
        }, setContent: function (body) {
            this.setMap('content', body);
            this.__content = body
        }
    });
    ns.msg.PlainMessage = PlainMessage
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var IObject = ns.type.Object;
    var UTF8 = ns.format.UTF8;
    var TransportableData = ns.format.TransportableData;
    var SecureMessage = ns.protocol.SecureMessage;
    var BaseMessage = ns.msg.BaseMessage;
    var EncryptedMessage = function (msg) {
        BaseMessage.call(this, msg);
        this.__data = null;
        this.__key = null;
        this.__keys = null
    };
    Class(EncryptedMessage, BaseMessage, [SecureMessage], {
        getData: function () {
            var data = this.__data;
            if (!data) {
                var base64 = this.getValue('data');
                if (!base64) {
                    throw new ReferenceError('message data not found: ' + this);
                } else if (!BaseMessage.isBroadcast(this)) {
                    data = TransportableData.decode(base64)
                } else if (IObject.isString(base64)) {
                    data = UTF8.encode(base64)
                } else {
                    throw new ReferenceError('message data error: ' + base64);
                }
                this.__data = data
            }
            return data
        }, getEncryptedKey: function () {
            var ted = this.__key;
            if (!ted) {
                var base64 = this.getValue('key');
                if (!base64) {
                    var keys = this.getEncryptedKeys();
                    if (keys) {
                        var receiver = this.getReceiver();
                        base64 = keys[receiver.toString()]
                    }
                }
                ted = TransportableData.parse(base64);
                this.__key = ted
            }
            return !ted ? null : ted.getData()
        }, getEncryptedKeys: function () {
            var keys = this.__keys;
            if (!keys) {
                keys = this.getValue('keys');
                this.__keys = keys
            }
            return keys
        }
    });
    ns.msg.EncryptedMessage = EncryptedMessage
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var TransportableData = ns.format.TransportableData;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var EncryptedMessage = ns.msg.EncryptedMessage;
    var NetworkMessage = function (msg) {
        EncryptedMessage.call(this, msg);
        this.__signature = null
    };
    Class(NetworkMessage, EncryptedMessage, [ReliableMessage], {
        getSignature: function () {
            var ted = this.__signature;
            if (!ted) {
                var base64 = this.getValue('signature');
                ted = TransportableData.parse(base64);
                this.__signature = ted
            }
            return !ted ? null : ted.getData()
        }
    });
    ns.msg.NetworkMessage = NetworkMessage
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var UTF8 = ns.format.UTF8;
    var Address = ns.protocol.Address;
    var ID = ns.protocol.ID;
    var Visa = ns.protocol.Visa;
    var Bulletin = ns.protocol.Bulletin;
    var getGroupSeed = function (group_id) {
        var name = group_id.getName();
        if (name) {
            var len = name.length;
            if (len === 0) {
                return null
            } else if (name === 8 && name.toLowerCase() === 'everyone') {
                return null
            }
        }
        return name
    };
    var getBroadcastFounder = function (group_id) {
        var name = getGroupSeed(group_id);
        if (!name) {
            return ID.FOUNDER
        } else {
            return ID.parse(name + '.founder@anywhere')
        }
    };
    var getBroadcastOwner = function (group_id) {
        var name = getGroupSeed(group_id);
        if (!name) {
            return ID.ANYONE
        } else {
            return ID.parse(name + '.owner@anywhere')
        }
    };
    var getBroadcastMembers = function (group_id) {
        var name = getGroupSeed(group_id);
        if (!name) {
            return [ID.ANYONE]
        } else {
            var owner = ID.parse(name + '.owner@anywhere');
            var member = ID.parse(name + '.member@anywhere');
            return [owner, member]
        }
    };
    var checkMeta = function (meta) {
        var pKey = meta.getPublicKey();
        if (!pKey) {
            return false
        }
        var seed = meta.getSeed();
        var fingerprint = meta.getFingerprint();
        if (!seed || seed.length === 0) {
            return !fingerprint || fingerprint.length === 0
        } else if (!fingerprint || fingerprint.length === 0) {
            return false
        }
        var data = UTF8.encode(seed);
        return pKey.verify(data, fingerprint)
    };
    var matchIdentifier = function (identifier, meta) {
        var seed = meta.getSeed();
        var name = identifier.getName();
        if (seed !== name) {
            return false
        }
        var old = identifier.getAddress();
        var gen = Address.generate(meta, old.getType());
        return old.equals(gen)
    };
    var matchPublicKey = function (pKey, meta) {
        if (meta.getPublicKey().equals(pKey)) {
            return true
        }
        var seed = meta.getSeed();
        if (seed && seed.length > 0) {
            var data = UTF8.encode(seed);
            var fingerprint = meta.getFingerprint();
            return pKey.verify(data, fingerprint)
        } else {
            return false
        }
    };
    var isBefore = function (oldTime, thisTime) {
        if (!oldTime || !thisTime) {
            return false
        }
        return thisTime.getTime() < oldTime.getTime()
    };
    var isExpired = function (thisDoc, oldDoc) {
        var thisTime = thisDoc.getTime();
        var oldTime = oldDoc.getTime();
        return isBefore(oldTime, thisTime)
    };
    var lastDocument = function (documents, type) {
        if (!documents || documents.length === 0) {
            return null
        } else if (!type || type === '*') {
            type = ''
        }
        var checkType = type.length > 0;
        var last = null;
        var doc, docType, matched;
        for (var i = 0; i < documents.length; ++i) {
            doc = documents[i];
            if (checkType) {
                docType = doc.getType();
                matched = !docType || docType.length === 0 || docType === type;
                if (!matched) {
                    continue
                }
            }
            if (last != null && isExpired(doc, last)) {
                continue
            }
            last = doc
        }
        return last
    };
    var lastVisa = function (documents) {
        if (!documents || documents.length === 0) {
            return null
        }
        var last = null
        var doc, matched;
        for (var i = 0; i < documents.length; ++i) {
            doc = documents[i];
            matched = Interface.conforms(doc, Visa);
            if (!matched) {
                continue
            }
            if (last != null && isExpired(doc, last)) {
                continue
            }
            last = doc
        }
        return last
    };
    var lastBulletin = function (documents) {
        if (!documents || documents.length === 0) {
            return null
        }
        var last = null
        var doc, matched;
        for (var i = 0; i < documents.length; ++i) {
            doc = documents[i];
            matched = Interface.conforms(doc, Bulletin);
            if (!matched) {
                continue
            }
            if (last != null && isExpired(doc, last)) {
                continue
            }
            last = doc
        }
        return last
    };
    ns.mkm.BroadcastHelper = {
        getGroupSeed: getGroupSeed,
        getBroadcastFounder: getBroadcastFounder,
        getBroadcastOwner: getBroadcastOwner,
        getBroadcastMembers: getBroadcastMembers
    };
    ns.mkm.MetaHelper = {checkMeta: checkMeta, matchIdentifier: matchIdentifier, matchPublicKey: matchPublicKey}
    ns.mkm.DocumentHelper = {
        isBefore: isBefore,
        isExpired: isExpired,
        lastDocument: lastDocument,
        lastVisa: lastVisa,
        lastBulletin: lastBulletin
    }
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var TransportableData = ns.format.TransportableData;
    var PublicKey = ns.crypto.PublicKey;
    var Meta = ns.protocol.Meta;
    var MetaHelper = ns.mkm.MetaHelper;
    var BaseMeta = function () {
        var type, key, seed, fingerprint;
        var status;
        var meta;
        if (arguments.length === 1) {
            meta = arguments[0];
            type = null;
            key = null;
            seed = null;
            fingerprint = null;
            status = 0
        } else if (arguments.length === 2) {
            type = arguments[0];
            key = arguments[1];
            seed = null;
            fingerprint = null;
            status = 1;
            meta = {'type': type, 'key': key.toMap()}
        } else if (arguments.length === 4) {
            type = arguments[0];
            key = arguments[1];
            seed = arguments[2];
            fingerprint = arguments[3];
            status = 1;
            meta = {'type': type, 'key': key.toMap(), 'seed': seed, 'fingerprint': fingerprint.toObject()}
        } else {
            throw new SyntaxError('meta arguments error: ' + arguments);
        }
        Dictionary.call(this, meta);
        this.__type = type;
        this.__key = key;
        this.__seed = seed;
        this.__fingerprint = fingerprint;
        this.__status = status
    };
    Class(BaseMeta, Dictionary, [Meta], {
        getType: function () {
            var type = this.__type;
            if (type === null) {
                var man = ns.mkm.AccountFactoryManager;
                type = man.generalFactory.getMetaType(this.toMap(), '');
                this.__type = type
            }
            return type
        }, getPublicKey: function () {
            var key = this.__key;
            if (!key) {
                var info = this.getValue('key');
                key = PublicKey.parse(info);
                this.__key = key
            }
            return key
        }, hasSeed: function () {
            return this.__seed || this.getValue('seed')
        }, getSeed: function () {
            var seed = this.__seed;
            if (seed === null && this.hasSeed()) {
                seed = this.getString('seed', null);
                this.__seed = seed
            }
            return seed
        }, getFingerprint: function () {
            var ted = this.__fingerprint;
            if (!ted && this.hasSeed()) {
                var base64 = this.getValue('fingerprint');
                ted = TransportableData.parse(base64);
                this.__fingerprint = ted
            }
            return !ted ? null : ted.getData()
        }, isValid: function () {
            if (this.__status === 0) {
                if (MetaHelper.checkMeta(this)) {
                    this.__status = 1
                } else {
                    this.__status = -1
                }
            }
            return this.__status > 0
        }, matchIdentifier: function (identifier) {
            return MetaHelper.matchIdentifier(identifier, this)
        }, matchPublicKey: function (pKey) {
            return MetaHelper.matchPublicKey(pKey, this)
        }
    });
    ns.mkm.BaseMeta = BaseMeta
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var Converter = ns.type.Converter;
    var UTF8 = ns.format.UTF8;
    var JsON = ns.format.JSON;
    var TransportableData = ns.format.TransportableData;
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var BaseDocument = function () {
        var map, status;
        var identifier, data, signature;
        var properties;
        if (arguments.length === 1) {
            map = arguments[0];
            status = 0;
            identifier = null;
            data = null;
            signature = null;
            properties = null
        } else if (arguments.length === 2) {
            identifier = arguments[0];
            var type = arguments[1];
            map = {'ID': identifier.toString()};
            status = 0;
            data = null;
            signature = null;
            var now = new Date();
            properties = {'type': type, 'created_time': (now.getTime() / 1000.0)}
        } else if (arguments.length === 3) {
            identifier = arguments[0];
            data = arguments[1];
            signature = arguments[2];
            map = {'ID': identifier.toString(), 'data': data, 'signature': signature.toObject()}
            status = 1;
            properties = null
        } else {
            throw new SyntaxError('document arguments error: ' + arguments);
        }
        Dictionary.call(this, map);
        this.__identifier = identifier;
        this.__json = data;
        this.__sig = signature;
        this.__properties = properties;
        this.__status = status
    };
    Class(BaseDocument, Dictionary, [Document], {
        isValid: function () {
            return this.__status > 0
        }, getType: function () {
            var type = this.getProperty('type');
            if (!type) {
                var man = ns.mkm.AccountFactoryManager;
                var gf = man.generalFactory;
                type = gf.getDocumentType(this.toMap(), null)
            }
            return type
        }, getIdentifier: function () {
            var did = this.__identifier;
            if (!did) {
                did = ID.parse(this.getValue('ID'))
                this.__identifier = did
            }
            return did
        }, getData: function () {
            var base64 = this.__json;
            if (!base64) {
                base64 = this.getString('data', null);
                this.__json = base64
            }
            return base64
        }, getSignature: function () {
            var ted = this.__sig;
            if (!ted) {
                var base64 = this.getValue('signature');
                ted = TransportableData.parse(base64);
                this.__sig = ted
            }
            if (!ted) {
                return null
            }
            return ted.getData()
        }, allProperties: function () {
            if (this.__status < 0) {
                return null
            }
            var dict = this.__properties;
            if (!dict) {
                var json = this.getData();
                if (json) {
                    dict = JsON.decode(json)
                } else {
                    dict = {}
                }
                this.__properties = dict
            }
            return dict
        }, getProperty: function (name) {
            var dict = this.allProperties();
            if (!dict) {
                return null
            }
            return dict[name]
        }, setProperty: function (name, value) {
            this.__status = 0;
            var dict = this.allProperties();
            if (value) {
                dict[name] = value
            } else {
                delete dict[name]
            }
            this.removeValue('data');
            this.removeValue('signature');
            this.__json = null;
            this.__sig = null
        }, verify: function (publicKey) {
            if (this.__status > 0) {
                return true
            }
            var data = this.getData();
            var signature = this.getSignature();
            if (!data) {
                if (!signature) {
                    this.__status = 0
                } else {
                    this.__status = -1
                }
            } else if (!signature) {
                this.__status = -1
            } else if (publicKey.verify(UTF8.encode(data), signature)) {
                this.__status = 1
            }
            return this.__status === 1
        }, sign: function (privateKey) {
            if (this.__status > 0) {
                return this.getSignature()
            }
            var now = new Date();
            this.setProperty('time', now.getTime() / 1000.0);
            var dict = this.allProperties();
            if (!dict) {
                return null
            }
            var data = JsON.encode(dict);
            if (!data || data.length === 0) {
                return null
            }
            var signature = privateKey.sign(UTF8.encode(data));
            if (!signature || signature.length === 0) {
                return null
            }
            var ted = TransportableData.create(signature);
            this.setValue('data', data);
            this.setValue('signature', ted.toObject());
            this.__json = data;
            this.__sig = ted;
            this.__status = 1;
            return signature
        }, getTime: function () {
            var timestamp = this.getProperty('time');
            return Converter.getDateTime(timestamp, null)
        }, getName: function () {
            var name = this.getProperty('name');
            return Converter.getString(name, null)
        }, setName: function (name) {
            this.setProperty('name', name)
        }
    });
    ns.mkm.BaseDocument = BaseDocument
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var EncryptKey = ns.crypto.EncryptKey;
    var PublicKey = ns.crypto.PublicKey;
    var PortableNetworkFile = ns.format.PortableNetworkFile;
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var Visa = ns.protocol.Visa;
    var BaseDocument = ns.mkm.BaseDocument;
    var BaseVisa = function () {
        if (arguments.length === 3) {
            BaseDocument.call(this, arguments[0], arguments[1], arguments[2])
        } else if (Interface.conforms(arguments[0], ID)) {
            BaseDocument.call(this, arguments[0], Document.VISA)
        } else if (arguments.length === 1) {
            BaseDocument.call(this, arguments[0])
        }
        this.__key = null;
        this.__avatar = null
    };
    Class(BaseVisa, BaseDocument, [Visa], {
        getPublicKey: function () {
            var key = this.__key;
            if (!key) {
                var info = this.getProperty('key');
                key = PublicKey.parse(info);
                if (Interface.conforms(key, EncryptKey)) {
                    this.__key = key
                } else {
                    key = null
                }
            }
            return key
        }, setPublicKey: function (pKey) {
            if (!pKey) {
                this.setProperty('key', null)
            } else {
                this.setProperty('key', pKey.toMap())
            }
            this.__key = pKey
        }, getAvatar: function () {
            var pnf = this.__avatar;
            if (!pnf) {
                var url = this.getProperty('avatar');
                pnf = PortableNetworkFile.parse(url);
                this.__avatar = pnf
            }
            return pnf
        }, setAvatar: function (pnf) {
            if (!pnf) {
                this.setProperty('avatar', null)
            } else {
                this.setProperty('avatar', pnf.toObject())
            }
            this.__avatar = pnf
        }
    });
    ns.mkm.BaseVisa = BaseVisa
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var Bulletin = ns.protocol.Bulletin;
    var BaseDocument = ns.mkm.BaseDocument;
    var BaseBulletin = function () {
        if (arguments.length === 3) {
            BaseDocument.call(this, arguments[0], arguments[1], arguments[2])
        } else if (Interface.conforms(arguments[0], ID)) {
            BaseDocument.call(this, arguments[0], Document.BULLETIN)
        } else if (arguments.length === 1) {
            BaseDocument.call(this, arguments[0])
        }
        this.__assistants = null
    };
    Class(BaseBulletin, BaseDocument, [Bulletin], {
        getFounder: function () {
            return ID.parse(this.getProperty('founder'))
        }, getAssistants: function () {
            var bots = this.__assistants;
            if (!bots) {
                var assistants = this.getProperty('assistants');
                if (assistants) {
                    bots = ID.convert(assistants)
                } else {
                    var single = ID.parse(this.getProperty('assistant'));
                    bots = !single ? [] : [single]
                }
                this.__assistants = bots
            }
            return bots
        }, setAssistants: function (bots) {
            if (bots) {
                this.setProperty('assistants', ID.revert(bots))
            } else {
                this.setProperty('assistants', null)
            }
            this.setProperty('assistant', null);
            this.__assistants = bots
        }
    });
    ns.mkm.BaseBulletin = BaseBulletin
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var IObject = ns.type.Object;
    var Entity = Interface(null, [IObject]);
    Entity.prototype.getIdentifier = function () {
    };
    Entity.prototype.getType = function () {
    };
    Entity.prototype.getMeta = function () {
    };
    Entity.prototype.getDocuments = function () {
    };
    Entity.prototype.setDataSource = function (barrack) {
    };
    Entity.prototype.getDataSource = function () {
    };
    var EntityDataSource = Interface(null, null);
    EntityDataSource.prototype.getMeta = function (identifier) {
    };
    EntityDataSource.prototype.getDocuments = function (identifier) {
    };
    var EntityDelegate = Interface(null, null);
    EntityDelegate.prototype.getUser = function (identifier) {
    };
    EntityDelegate.prototype.getGroup = function (identifier) {
    };
    Entity.DataSource = EntityDataSource;
    Entity.Delegate = EntityDelegate;
    ns.mkm.Entity = Entity;
    ns.mkm.EntityDelegate = EntityDelegate;
    ns.mkm.EntityDataSource = EntityDataSource
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var BaseObject = ns.type.BaseObject;
    var Entity = ns.mkm.Entity;
    var BaseEntity = function (identifier) {
        BaseObject.call(this);
        this.__identifier = identifier;
        this.__barrack = null
    };
    Class(BaseEntity, BaseObject, [Entity], null);
    BaseEntity.prototype.equals = function (other) {
        if (this === other) {
            return true
        } else if (!other) {
            return false
        } else if (Interface.conforms(other, Entity)) {
            other = other.getIdentifier()
        }
        return this.__identifier.equals(other)
    };
    BaseEntity.prototype.valueOf = function () {
        return desc.call(this)
    };
    BaseEntity.prototype.toString = function () {
        return desc.call(this)
    };
    var desc = function () {
        var clazz = Object.getPrototypeOf(this).constructor.name;
        var id = this.__identifier;
        var network = id.getAddress().getType();
        return '<' + clazz + ' id="' + id.toString() + '" network="' + network + '" />'
    };
    BaseEntity.prototype.setDataSource = function (barrack) {
        this.__barrack = barrack
    };
    BaseEntity.prototype.getDataSource = function () {
        return this.__barrack
    };
    BaseEntity.prototype.getIdentifier = function () {
        return this.__identifier
    };
    BaseEntity.prototype.getType = function () {
        return this.__identifier.getType()
    };
    BaseEntity.prototype.getMeta = function () {
        var delegate = this.getDataSource();
        return delegate.getMeta(this.__identifier)
    };
    BaseEntity.prototype.getDocuments = function () {
        var delegate = this.getDataSource();
        return delegate.getDocuments(this.__identifier)
    };
    ns.mkm.BaseEntity = BaseEntity
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Entity = ns.mkm.Entity;
    var User = Interface(null, [Entity]);
    User.prototype.getVisa = function () {
    };
    User.prototype.getContacts = function () {
    };
    User.prototype.verify = function (data, signature) {
    };
    User.prototype.encrypt = function (plaintext) {
    };
    User.prototype.sign = function (data) {
    };
    User.prototype.decrypt = function (ciphertext) {
    };
    User.prototype.signVisa = function (doc) {
    };
    User.prototype.verifyVisa = function (doc) {
    };
    var UserDataSource = Interface(null, [Entity.DataSource]);
    UserDataSource.prototype.getContacts = function (identifier) {
    };
    UserDataSource.prototype.getPublicKeyForEncryption = function (identifier) {
    };
    UserDataSource.prototype.getPublicKeysForVerification = function (identifier) {
    };
    UserDataSource.prototype.getPrivateKeysForDecryption = function (identifier) {
    };
    UserDataSource.prototype.getPrivateKeyForSignature = function (identifier) {
    };
    UserDataSource.prototype.getPrivateKeyForVisaSignature = function (identifier) {
    };
    User.DataSource = UserDataSource;
    ns.mkm.User = User
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var User = ns.mkm.User;
    var BaseEntity = ns.mkm.BaseEntity;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var BaseUser = function (identifier) {
        BaseEntity.call(this, identifier)
    };
    Class(BaseUser, BaseEntity, [User], {
        getVisa: function () {
            var docs = this.getDocuments();
            return DocumentHelper.lastVisa(docs)
        }, getContacts: function () {
            var barrack = this.getDataSource();
            var user = this.getIdentifier();
            return barrack.getContacts(user)
        }, verify: function (data, signature) {
            var barrack = this.getDataSource();
            var user = this.getIdentifier();
            var keys = barrack.getPublicKeysForVerification(user);
            for (var i = 0; i < keys.length; ++i) {
                if (keys[i].verify(data, signature)) {
                    return true
                }
            }
            return false
        }, encrypt: function (plaintext) {
            var barrack = this.getDataSource();
            var user = this.getIdentifier();
            var key = barrack.getPublicKeyForEncryption(user);
            return key.encrypt(plaintext, null)
        }, sign: function (data) {
            var barrack = this.getDataSource();
            var user = this.getIdentifier();
            var key = barrack.getPrivateKeyForSignature(user);
            return key.sign(data)
        }, decrypt: function (ciphertext) {
            var barrack = this.getDataSource();
            var user = this.getIdentifier();
            var keys = barrack.getPrivateKeysForDecryption(user);
            var plaintext;
            for (var i = 0; i < keys.length; ++i) {
                try {
                    plaintext = keys[i].decrypt(ciphertext, null);
                    if (plaintext && plaintext.length > 0) {
                        return plaintext
                    }
                } catch (e) {
                }
            }
            return null
        }, signVisa: function (doc) {
            var user = this.getIdentifier();
            var barrack = this.getDataSource();
            var key = barrack.getPrivateKeyForVisaSignature(user);
            var sig = doc.sign(key);
            if (!sig) {
                return null
            }
            return doc
        }, verifyVisa: function (doc) {
            var uid = this.getIdentifier();
            if (!uid.equals(doc.getIdentifier())) {
                return false
            }
            var meta = this.getMeta();
            var key = meta.getPublicKey();
            return doc.verify(key)
        }
    });
    ns.mkm.BaseUser = BaseUser
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Entity = ns.mkm.Entity;
    var Group = Interface(null, [Entity]);
    Group.prototype.getBulletin = function () {
    };
    Group.prototype.getFounder = function () {
    };
    Group.prototype.getOwner = function () {
    };
    Group.prototype.getMembers = function () {
    };
    Group.prototype.getAssistants = function () {
    };
    var GroupDataSource = Interface(null, [Entity.DataSource]);
    GroupDataSource.prototype.getFounder = function (identifier) {
    };
    GroupDataSource.prototype.getOwner = function (identifier) {
    };
    GroupDataSource.prototype.getMembers = function (identifier) {
    };
    GroupDataSource.prototype.getAssistants = function (identifier) {
    };
    Group.DataSource = GroupDataSource;
    ns.mkm.Group = Group
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Group = ns.mkm.Group;
    var BaseEntity = ns.mkm.BaseEntity;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var BaseGroup = function (identifier) {
        BaseEntity.call(this, identifier);
        this.__founder = null
    };
    Class(BaseGroup, BaseEntity, [Group], {
        getBulletin: function () {
            var docs = this.getDocuments();
            return DocumentHelper.lastBulletin(docs)
        }, getFounder: function () {
            var founder = this.__founder;
            if (!founder) {
                var barrack = this.getDataSource();
                var group = this.getIdentifier();
                founder = barrack.getFounder(group);
                this.__founder = founder
            }
            return founder
        }, getOwner: function () {
            var barrack = this.getDataSource();
            var group = this.getIdentifier();
            return barrack.getOwner(group)
        }, getMembers: function () {
            var barrack = this.getDataSource();
            var group = this.getIdentifier();
            return barrack.getMembers(group)
        }, getAssistants: function () {
            var barrack = this.getDataSource();
            var group = this.getIdentifier();
            return barrack.getAssistants(group)
        }
    });
    ns.mkm.BaseGroup = BaseGroup
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var EncryptKey = ns.crypto.EncryptKey;
    var VerifyKey = ns.crypto.VerifyKey;
    var EntityType = ns.protocol.EntityType;
    var Entity = ns.mkm.Entity;
    var User = ns.mkm.User;
    var Group = ns.mkm.Group;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var BroadcastHelper = ns.mkm.BroadcastHelper;
    var Barrack = function () {
        Object.call(this);
        this.__users = {};
        this.__groups = {}
    };
    Class(Barrack, Object, [Entity.Delegate, User.DataSource, Group.DataSource], {
        cacheUser: function (user) {
            var delegate = user.getDataSource();
            if (!delegate) {
                user.setDataSource(this)
            }
            this.__users[user.getIdentifier()] = user
        }, cacheGroup: function (group) {
            var delegate = group.getDataSource();
            if (!delegate) {
                group.setDataSource(this)
            }
            this.__groups[group.getIdentifier()] = group
        }, reduceMemory: function () {
            var finger = 0;
            finger = thanos(this.__users, finger);
            finger = thanos(this.__groups, finger);
            return finger >> 1
        }, createUser: function (identifier) {
        }, createGroup: function (identifier) {
        }, getVisaKey: function (identifier) {
            var doc = this.getVisa(identifier);
            return !doc ? null : doc.getPublicKey()
        }, getMetaKey: function (identifier) {
            var meta = this.getMeta(identifier);
            return !meta ? null : meta.getPublicKey()
        }, getVisa: function (identifier) {
            return DocumentHelper.lastVisa(this.getDocuments(identifier))
        }, getBulletin: function (identifier) {
            return DocumentHelper.lastBulletin(this.getDocuments(identifier))
        }, getUser: function (identifier) {
            var user = this.__users[identifier];
            if (!user) {
                user = this.createUser(identifier);
                if (user) {
                    this.cacheUser(user)
                }
            }
            return user
        }, getGroup: function (identifier) {
            var group = this.__groups[identifier];
            if (!group) {
                group = this.createGroup(identifier);
                if (group) {
                    this.cacheGroup(group)
                }
            }
            return group
        }, getPublicKeyForEncryption: function (identifier) {
            var key = this.getVisaKey(identifier);
            if (key) {
                return key
            }
            key = this.getMetaKey(identifier);
            if (Interface.conforms(key, EncryptKey)) {
                return key
            }
            return null
        }, getPublicKeysForVerification: function (identifier) {
            var keys = [];
            var key = this.getVisaKey(identifier);
            if (Interface.conforms(key, VerifyKey)) {
                keys.push(key)
            }
            key = this.getMetaKey(identifier);
            if (key) {
                keys.push(key)
            }
            return keys
        }, getFounder: function (group) {
            if (group.isBroadcast()) {
                return BroadcastHelper.getBroadcastFounder(group)
            }
            var doc = this.getBulletin(group);
            if (doc) {
                return doc.getFounder()
            }
            return null
        }, getOwner: function (group) {
            if (group.isBroadcast()) {
                return BroadcastHelper.getBroadcastOwner(group)
            }
            if (EntityType.GROUP.equals(group.getType())) {
                return this.getFounder(group)
            }
            return null
        }, getMembers: function (group) {
            if (group.isBroadcast()) {
                return BroadcastHelper.getBroadcastMembers(group)
            }
            return []
        }, getAssistants: function (group) {
            var doc = this.getBulletin(group);
            if (doc) {
                var bots = doc.getAssistants();
                if (bots) {
                    return bots
                }
            }
            return []
        }
    });
    var thanos = function (planet, finger) {
        var keys = Object.keys(planet);
        var k, p;
        for (var i = 0; i < keys.length; ++i) {
            k = keys[i];
            p = planet[k];
            finger += 1;
            if ((finger & 1) === 1) {
                delete planet[k]
            }
        }
        return finger
    };
    ns.Barrack = Barrack;
    ns.mkm.thanos = thanos
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Packer = Interface(null, null);
    Packer.prototype.encryptMessage = function (iMsg) {
    };
    Packer.prototype.signMessage = function (sMsg) {
    };
    Packer.prototype.serializeMessage = function (rMsg) {
    };
    Packer.prototype.deserializeMessage = function (data) {
    };
    Packer.prototype.verifyMessage = function (rMsg) {
    };
    Packer.prototype.decryptMessage = function (sMsg) {
    };
    ns.Packer = Packer
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Processor = Interface(null, null);
    Processor.prototype.processPackage = function (data) {
    };
    Processor.prototype.processReliableMessage = function (rMsg) {
    };
    Processor.prototype.processSecureMessage = function (sMsg, rMsg) {
    };
    Processor.prototype.processInstantMessage = function (iMsg, rMsg) {
    };
    Processor.prototype.processContent = function (content, rMsg) {
    };
    ns.Processor = Processor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var UTF8 = ns.format.UTF8;
    var JsON = ns.format.JSON;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Content = ns.protocol.Content;
    var InstantMessage = ns.protocol.InstantMessage;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var BaseMessage = ns.msg.BaseMessage;
    var Transceiver = function () {
        Object.call(this)
    };
    Class(Transceiver, Object, [InstantMessage.Delegate, SecureMessage.Delegate, ReliableMessage.Delegate], null);
    Transceiver.prototype.getEntityDelegate = function () {
    };
    Transceiver.prototype.serializeContent = function (content, pwd, iMsg) {
        var dict = content.toMap();
        var json = JsON.encode(dict);
        return UTF8.encode(json)
    };
    Transceiver.prototype.encryptContent = function (data, pwd, iMsg) {
        return pwd.encrypt(data, iMsg.toMap())
    };
    Transceiver.prototype.serializeKey = function (pwd, iMsg) {
        if (BaseMessage.isBroadcast(iMsg)) {
            return null
        }
        var dict = pwd.toMap();
        var json = JsON.encode(dict);
        return UTF8.encode(json)
    };
    Transceiver.prototype.encryptKey = function (keyData, receiver, iMsg) {
        var barrack = this.getEntityDelegate();
        var contact = barrack.getUser(receiver);
        if (!contact) {
            return null
        }
        return contact.encrypt(keyData)
    };
    Transceiver.prototype.decryptKey = function (keyData, receiver, sMsg) {
        var barrack = this.getEntityDelegate();
        var user = barrack.getUser(receiver);
        if (!user) {
            return null
        }
        return user.decrypt(keyData)
    };
    Transceiver.prototype.deserializeKey = function (keyData, sMsg) {
        if (!keyData) {
            return null
        }
        var json = UTF8.decode(keyData);
        if (!json) {
            return null
        }
        var dict = JsON.decode(json);
        return SymmetricKey.parse(dict)
    };
    Transceiver.prototype.decryptContent = function (data, pwd, sMsg) {
        return pwd.decrypt(data, sMsg.toMap())
    };
    Transceiver.prototype.deserializeContent = function (data, pwd, sMsg) {
        var json = UTF8.decode(data);
        if (!json) {
            return null
        }
        var dict = JsON.decode(json);
        return Content.parse(dict)
    };
    Transceiver.prototype.signData = function (data, sMsg) {
        var barrack = this.getEntityDelegate();
        var sender = sMsg.getSender();
        var user = barrack.getUser(sender);
        return user.sign(data)
    };
    Transceiver.prototype.verifyDataSignature = function (data, signature, rMsg) {
        var barrack = this.getEntityDelegate();
        var sender = rMsg.getSender();
        var contact = barrack.getUser(sender);
        if (!contact) {
            return false
        }
        return contact.verify(data, signature)
    };
    ns.Transceiver = Transceiver
})(DIMP);
(function (ns) {
    'use strict';
    var repeat = function (count) {
        var string = '';
        for (var i = 0; i < count; ++i) {
            string += this
        }
        return string
    };
    if (typeof String.prototype.repeat !== 'function') {
        String.prototype.repeat = repeat
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
                for (var it1 = size - 1; (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
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
            var str = repeat.call(LEADER, zeroes);
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
                for (var it3 = size - 1; (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
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

        return {encode: encode, decodeUnsafe: decodeUnsafe, decode: decode}
    }

    var bs58 = base('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');
    var Class = ns.type.Class;
    var DataCoder = ns.format.DataCoder;
    var Base58Coder = function () {
        Object.call(this)
    };
    Class(Base58Coder, Object, [DataCoder], {
        encode: function (data) {
            return bs58.encode(data)
        }, decode: function (string) {
            return bs58.decode(string)
        }
    });
    ns.format.Base58.setCoder(new Base58Coder())
})(DIMP);
(function (ns) {
    'use strict';
    var base64_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var base64_values = new Int8Array(128);
    (function (chars, values) {
        for (var i = 0; i < chars.length; ++i) {
            values[chars.charCodeAt(i)] = i
        }
    })(base64_chars, base64_values);
    var base64_encode = function (data) {
        var base64 = '';
        var length = data.length;
        var remainder = length % 3;
        length -= remainder;
        var x1, x2, x3;
        var i;
        for (i = 0; i < length; i += 3) {
            x1 = data[i];
            x2 = data[i + 1];
            x3 = data[i + 2];
            base64 += base64_chars.charAt((x1 & 0xFC) >> 2);
            base64 += base64_chars.charAt(((x1 & 0x03) << 4) | ((x2 & 0xF0) >> 4));
            base64 += base64_chars.charAt(((x2 & 0x0F) << 2) | ((x3 & 0xC0) >> 6));
            base64 += base64_chars.charAt(x3 & 0x3F)
        }
        if (remainder === 1) {
            x1 = data[i];
            base64 += base64_chars.charAt((x1 & 0xFC) >> 2);
            base64 += base64_chars.charAt((x1 & 0x03) << 4);
            base64 += '=='
        } else if (remainder === 2) {
            x1 = data[i];
            x2 = data[i + 1];
            base64 += base64_chars.charAt((x1 & 0xFC) >> 2);
            base64 += base64_chars.charAt(((x1 & 0x03) << 4) | ((x2 & 0xF0) >> 4));
            base64 += base64_chars.charAt((x2 & 0x0F) << 2);
            base64 += '='
        }
        return base64
    };
    var base64_decode = function (string) {
        var str = string.replace(/[^A-Za-z0-9+\/=]/g, '');
        var length = str.length;
        if ((length % 4) !== 0 || !/^[A-Za-z0-9+\/]+={0,2}$/.test(str)) {
            throw new Error('base64 string error: ' + string)
        }
        var array = [];
        var ch1, ch2, ch3, ch4;
        var i;
        for (i = 0; i < length; i += 4) {
            ch1 = base64_values[str.charCodeAt(i)];
            ch2 = base64_values[str.charCodeAt(i + 1)];
            ch3 = base64_values[str.charCodeAt(i + 2)];
            ch4 = base64_values[str.charCodeAt(i + 3)];
            array.push(((ch1 & 0x3F) << 2) | ((ch2 & 0x30) >> 4));
            array.push(((ch2 & 0x0F) << 4) | ((ch3 & 0x3C) >> 2));
            array.push(((ch3 & 0x03) << 6) | ((ch4 & 0x3F) >> 0))
        }
        while (str[--i] === '=') {
            array.pop()
        }
        return Uint8Array.from(array)
    };
    var Class = ns.type.Class;
    var DataCoder = ns.format.DataCoder;
    var Base64Coder = function () {
        Object.call(this)
    };
    Class(Base64Coder, Object, [DataCoder], {
        encode: function (data) {
            return base64_encode(data)
        }, decode: function (string) {
            return base64_decode(string)
        }
    });
    ns.format.Base64.setCoder(new Base64Coder())
})(DIMP);
(function (ns) {
    'use strict';
    var hex_chars = '0123456789abcdef';
    var hex_values = new Int8Array(128);
    (function (chars, values) {
        for (var i = 0; i < chars.length; ++i) {
            values[chars.charCodeAt(i)] = i
        }
        values['A'.charCodeAt(0)] = 0x0A;
        values['B'.charCodeAt(0)] = 0x0B;
        values['C'.charCodeAt(0)] = 0x0C;
        values['D'.charCodeAt(0)] = 0x0D;
        values['E'.charCodeAt(0)] = 0x0E;
        values['F'.charCodeAt(0)] = 0x0F
    })(hex_chars, hex_values);
    var hex_encode = function (data) {
        var len = data.length;
        var str = '';
        var byt;
        for (var i = 0; i < len; ++i) {
            byt = data[i];
            str += hex_chars[byt >> 4];
            str += hex_chars[byt & 0x0F]
        }
        return str
    };
    var hex_decode = function (string) {
        var len = string.length;
        if (len > 2) {
            if (string[0] === '0') {
                if (string[1] === 'x' || string[1] === 'X') {
                    string = string.substring(2);
                    len -= 2
                }
            }
        }
        if (len % 2 === 1) {
            string = '0' + string;
            len += 1
        }
        var cnt = len >> 1;
        var hi, lo;
        var data = new Uint8Array(cnt);
        for (var i = 0, j = 0; i < cnt; ++i, j += 2) {
            hi = hex_values[string.charCodeAt(j)];
            lo = hex_values[string.charCodeAt(j + 1)];
            data[i] = (hi << 4) | lo
        }
        return data
    };
    var Class = ns.type.Class;
    var DataCoder = ns.format.DataCoder;
    var HexCoder = function () {
        Object.call(this)
    };
    Class(HexCoder, Object, [DataCoder], {
        encode: function (data) {
            return hex_encode(data)
        }, decode: function (string) {
            return hex_decode(string)
        }
    });
    ns.format.Hex.setCoder(new HexCoder())
})(DIMP);
(function (ns) {
    'use strict';
    var utf8_encode = function (string) {
        var len = string.length;
        var array = [];
        var c, l;
        for (var i = 0; i < len; ++i) {
            c = string.charCodeAt(i);
            if (0xD800 <= c && c <= 0xDBFF) {
                l = string.charCodeAt(++i);
                c = ((c - 0xD800) << 10) + 0x10000 + l - 0xDC00
            }
            if (c <= 0) {
                break
            } else if (c < 0x0080) {
                array.push(c)
            } else if (c < 0x0800) {
                array.push(0xC0 | ((c >> 6) & 0x1F));
                array.push(0x80 | ((c >> 0) & 0x3F))
            } else if (c < 0x10000) {
                array.push(0xE0 | ((c >> 12) & 0x0F));
                array.push(0x80 | ((c >> 6) & 0x3F));
                array.push(0x80 | ((c >> 0) & 0x3F))
            } else {
                array.push(0xF0 | ((c >> 18) & 0x07));
                array.push(0x80 | ((c >> 12) & 0x3F));
                array.push(0x80 | ((c >> 6) & 0x3F));
                array.push(0x80 | ((c >> 0) & 0x3F))
            }
        }
        return Uint8Array.from(array)
    };
    var utf8_decode = function (array) {
        var string = '';
        var len = array.length;
        var c, c2, c3, c4;
        for (var i = 0; i < len; ++i) {
            c = array[i];
            switch (c >> 4) {
                case 12:
                case 13:
                    c2 = array[++i];
                    c = ((c & 0x1F) << 6) | (c2 & 0x3F);
                    break;
                case 14:
                    c2 = array[++i];
                    c3 = array[++i];
                    c = ((c & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F);
                    break;
                case 15:
                    c2 = array[++i];
                    c3 = array[++i];
                    c4 = array[++i];
                    c = ((c & 0x07) << 18) | ((c2 & 0x3F) << 12) | ((c3 & 0x3F) << 6) | (c4 & 0x3F);
                    break
            }
            if (c < 0x10000) {
                string += String.fromCharCode(c)
            } else {
                c -= 0x10000;
                string += String.fromCharCode((c >> 10) + 0xD800);
                string += String.fromCharCode((c & 0x03FF) + 0xDC00)
            }
        }
        return string
    };
    var Class = ns.type.Class;
    var StringCoder = ns.format.StringCoder;
    var Utf8Coder = function () {
        Object.call(this)
    };
    Class(Utf8Coder, Object, [StringCoder], {
        encode: function (string) {
            return utf8_encode(string)
        }, decode: function (data) {
            return utf8_decode(data)
        }
    })
    ns.format.UTF8.setCoder(new Utf8Coder())
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ObjectCoder = ns.format.ObjectCoder;
    var JsonCoder = function () {
        Object.call(this)
    };
    Class(JsonCoder, Object, [ObjectCoder], {
        encode: function (object) {
            return JSON.stringify(object)
        }, decode: function (string) {
            return JSON.parse(string)
        }
    });
    ns.format.JSON.setCoder(new JsonCoder())
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var TransportableData = ns.format.TransportableData;
    var BaseDataWrapper = ns.format.BaseDataWrapper;
    var Base64Data = function (info) {
        var binary = null;
        if (info instanceof Uint8Array) {
            binary = info;
            info = null
        }
        Dictionary.call(this, info);
        var wrapper = new BaseDataWrapper(this.toMap());
        if (binary) {
            wrapper.setAlgorithm(TransportableData.BASE64);
            if (binary.length > 0) {
                wrapper.setData(binary)
            }
        }
        this.__wrapper = wrapper
    };
    Class(Base64Data, Dictionary, [TransportableData], {
        getAlgorithm: function () {
            return this.__wrapper.getAlgorithm()
        }, getData: function () {
            return this.__wrapper.getData()
        }, toObject: function () {
            return this.toString()
        }, toString: function () {
            return this.__wrapper.toString()
        }, encode: function (mimeType) {
            return this.__wrapper.encode(mimeType)
        }
    });
    var Base64DataFactory = function () {
        Object.call(this)
    };
    Class(Base64DataFactory, Object, [TransportableData.Factory], {
        createTransportableData: function (data) {
            return new Base64Data(data)
        }, parseTransportableData: function (ted) {
            return new Base64Data(ted)
        }
    });
    var factory = new Base64DataFactory();
    TransportableData.setFactory('*', factory);
    TransportableData.setFactory(TransportableData.BASE64, factory)
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var JsON = ns.format.JSON;
    var PortableNetworkFile = ns.format.PortableNetworkFile;
    var BaseFileWrapper = ns.format.BaseFileWrapper;
    var BaseNetworkFile = function () {
        var ted = null, filename = null, url = null, password = null;
        if (arguments.length === 1) {
            Dictionary.call(this, arguments[0])
        } else if (arguments.length === 4) {
            Dictionary.call(this);
            ted = arguments[0];
            filename = arguments[1];
            url = arguments[2];
            password = arguments[3]
        } else {
            throw new SyntaxError('PNF arguments error: ' + arguments);
        }
        var wrapper = new BaseFileWrapper(this.toMap());
        if (ted) {
            wrapper.setData(ted)
        }
        if (filename) {
            wrapper.setFilename(filename)
        }
        if (url) {
            wrapper.setURL(url)
        }
        if (password) {
            wrapper.setPassword(password)
        }
        this.__wrapper = wrapper
    };
    Class(BaseNetworkFile, Dictionary, [PortableNetworkFile], {
        getData: function () {
            var ted = this.__wrapper.getData();
            return !ted ? null : ted.getData()
        }, setData: function (binary) {
            this.__wrapper.setBinaryData(binary)
        }, getFilename: function () {
            return this.__wrapper.getFilename()
        }, setFilename: function (filename) {
            this.__wrapper.setFilename(filename)
        }, getURL: function () {
            return this.__wrapper.getURL()
        }, setURL: function (url) {
            this.__wrapper.setURL(url)
        }, getPassword: function () {
            return this.__wrapper.getPassword()
        }, setPassword: function (key) {
            this.__wrapper.setPassword(key)
        }, toString: function () {
            var url = this.getURLString();
            if (url) {
                return url
            }
            return JsON.encode(this.toMap())
        }, toObject: function () {
            var url = this.getURLString();
            if (url) {
                return url
            }
            return this.toMap()
        }, getURLString: function () {
            var url = this.getString('URL', '');
            var len = url.length;
            if (len === 0) {
                return null
            } else if (len > 5 && url.substring(0, 5) === 'data:') {
                return url
            }
            var count = this.getLength();
            if (count === 1) {
                return url
            } else if (count === 2 && this.getValue('filename')) {
                return url
            } else {
                return null
            }
        }
    });
    var BaseNetworkFileFactory = function () {
        Object.call(this)
    };
    Class(BaseNetworkFileFactory, Object, [PortableNetworkFile.Factory], {
        createPortableNetworkFile: function (ted, filename, url, password) {
            return new BaseNetworkFile(ted, filename, url, password)
        }, parsePortableNetworkFile: function (pnf) {
            return new BaseNetworkFile(pnf)
        }
    });
    var factory = new BaseNetworkFileFactory();
    PortableNetworkFile.setFactory(factory)
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this)
    };
    Class(hash, Object, [DataDigester], {
        digest: function (data) {
            var hex = ns.format.Hex.encode(data);
            var array = CryptoJS.enc.Hex.parse(hex);
            var result = CryptoJS.MD5(array);
            return ns.format.Hex.decode(result.toString())
        }
    });
    ns.digest.MD5.setDigester(new hash())
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this)
    };
    Class(hash, Object, [DataDigester], {
        digest: function (data) {
            var hex = ns.format.Hex.encode(data);
            var array = CryptoJS.enc.Hex.parse(hex);
            var result = CryptoJS.SHA256(array);
            return ns.format.Hex.decode(result.toString())
        }
    });
    ns.digest.SHA256.setDigester(new hash())
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this)
    };
    Class(hash, Object, [DataDigester], {
        digest: function (data) {
            var hex = ns.format.Hex.encode(data);
            var array = CryptoJS.enc.Hex.parse(hex);
            var result = CryptoJS.RIPEMD160(array);
            return ns.format.Hex.decode(result.toString())
        }
    });
    ns.digest.RIPEMD160.setDigester(new hash())
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this)
    };
    Class(hash, Object, [DataDigester], {
        digest: function (data) {
            var array = window.keccak256.update(data).digest();
            return new Uint8Array(array)
        }
    });
    ns.digest.KECCAK256.setDigester(new hash())
})(DIMP);
(function (ns) {
    'use strict';
    var MIME_LINE_MAX_LEN = 76;
    var CR_LF = '\r\n';
    var rfc2045 = function (data) {
        var base64 = ns.format.Base64.encode(data);
        var length = base64.length;
        if (length > MIME_LINE_MAX_LEN && base64.indexOf(CR_LF) < 0) {
            var sb = '';
            var start = 0, end;
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
    var encode_key = function (key, left, right) {
        var content = rfc2045(key);
        return left + CR_LF + content + CR_LF + right
    };
    var decode_key = function (pem, left, right) {
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
    var encode_public = function (key) {
        return encode_key(key, '-----BEGIN PUBLIC KEY-----', '-----END PUBLIC KEY-----')
    };
    var encode_rsa_private = function (key) {
        return encode_key(key, '-----BEGIN RSA PRIVATE KEY-----', '-----END RSA PRIVATE KEY-----')
    };
    var decode_public = function (pem) {
        var data = decode_key(pem, '-----BEGIN PUBLIC KEY-----', '-----END PUBLIC KEY-----');
        if (!data) {
            data = decode_key(pem, "-----BEGIN RSA PUBLIC KEY-----", "-----END RSA PUBLIC KEY-----")
        }
        if (data) {
            return data
        }
        if (pem.indexOf('PRIVATE KEY') > 0) {
            throw new TypeError('this is a private key content');
        } else {
            return ns.format.Base64.decode(pem)
        }
    };
    var decode_rsa_private = function (pem) {
        var data = decode_key(pem, '-----BEGIN RSA PRIVATE KEY-----', '-----END RSA PRIVATE KEY-----');
        if (data) {
            return data
        }
        if (pem.indexOf('PUBLIC KEY') > 0) {
            throw new TypeError('this is not a RSA private key content');
        } else {
            return ns.format.Base64.decode(pem)
        }
    };
    var Class = ns.type.Class;
    var pem = function () {
        Object.call(this)
    };
    Class(pem, Object, null, null);
    pem.prototype.encodePublicKey = function (key) {
        return encode_public(key)
    };
    pem.prototype.encodePrivateKey = function (key) {
        return encode_rsa_private(key)
    };
    pem.prototype.decodePublicKey = function (pem) {
        return decode_public(pem)
    };
    pem.prototype.decodePrivateKey = function (pem) {
        return decode_rsa_private(pem)
    };
    ns.format.PEM = new pem()
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var BasePublicKey = ns.crypto.BasePublicKey;
    var EncryptKey = ns.crypto.EncryptKey;
    var RSAPublicKey = function (key) {
        BasePublicKey.call(this, key)
    };
    Class(RSAPublicKey, BasePublicKey, [EncryptKey], {
        getData: function () {
            var data = this.getValue('data');
            if (data) {
                return ns.format.PEM.decodePublicKey(data)
            } else {
                throw new ReferenceError('public key data not found');
            }
        }, getSize: function () {
            var size = this.getValue('keySize');
            if (size) {
                return Number(size)
            } else {
                return 1024 / 8
            }
        }, verify: function (data, signature) {
            data = CryptoJS.enc.Hex.parse(ns.format.Hex.encode(data));
            signature = ns.format.Base64.encode(signature);
            var cipher = parse_key.call(this);
            return cipher.verify(data, signature, CryptoJS.SHA256)
        }, encrypt: function (plaintext, extra) {
            plaintext = ns.format.UTF8.decode(plaintext);
            var cipher = parse_key.call(this);
            var base64 = cipher.encrypt(plaintext);
            if (base64) {
                var keySize = this.getSize();
                var res = ns.format.Base64.decode(base64);
                if (res.length === keySize) {
                    return res
                }
                var pad = new Uint8Array(keySize);
                pad.set(res, keySize - res.length);
                return pad
            }
            throw new ReferenceError('RSA encrypt error: ' + plaintext);
        }
    });
    var x509_header = new Uint8Array([48, -127, -97, 48, 13, 6, 9, 42, -122, 72, -122, -9, 13, 1, 1, 1, 5, 0, 3, -127, -115, 0]);
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
            cipher.setPublicKey(key)
        }
        return cipher
    };
    ns.crypto.RSAPublicKey = RSAPublicKey
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var PublicKey = ns.crypto.PublicKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var BasePrivateKey = ns.crypto.BasePrivateKey;
    var RSAPrivateKey = function (key) {
        BasePrivateKey.call(this, key)
    };
    Class(RSAPrivateKey, BasePrivateKey, [DecryptKey], {
        getData: function () {
            var data = this.getValue('data');
            if (data) {
                return ns.format.PEM.decodePrivateKey(data)
            } else {
                var bits = this.getSize() * 8;
                var pem = generate.call(this, bits);
                return ns.format.PEM.decodePrivateKey(pem)
            }
        }, getSize: function () {
            var size = this.getValue('keySize');
            if (size) {
                return Number(size)
            } else {
                return 1024 / 8
            }
        }, getPublicKey: function () {
            var key = ns.format.Base64.encode(this.getData());
            var cipher = new JSEncrypt();
            cipher.setPrivateKey(key);
            var pem = cipher.getPublicKey();
            var info = {
                'algorithm': this.getValue('algorithm'),
                'data': pem,
                'mode': 'ECB',
                'padding': 'PKCS1',
                'digest': 'SHA256'
            };
            return PublicKey.parse(info)
        }, sign: function (data) {
            data = CryptoJS.enc.Hex.parse(ns.format.Hex.encode(data));
            var cipher = parse_key.call(this);
            var base64 = cipher.sign(data, CryptoJS.SHA256, 'sha256');
            if (base64) {
                return ns.format.Base64.decode(base64)
            } else {
                throw new ReferenceError('RSA sign error: ' + data);
            }
        }, decrypt: function (data, params) {
            data = ns.format.Base64.encode(data);
            var cipher = parse_key.call(this);
            var string = cipher.decrypt(data);
            if (string) {
                return ns.format.UTF8.encode(string)
            } else {
                throw new ReferenceError('RSA decrypt error: ' + data);
            }
        }
    });
    var generate = function (bits) {
        var cipher = new JSEncrypt({default_key_size: bits});
        var key = cipher.getKey();
        var pem = key.getPublicKey() + '\r\n' + key.getPrivateKey();
        this.setValue('data', pem);
        this.setValue('mode', 'ECB');
        this.setValue('padding', 'PKCS1');
        this.setValue('digest', 'SHA256');
        return pem
    };
    var parse_key = function () {
        var der = this.getData();
        var key = ns.format.Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPrivateKey(key);
        return cipher
    };
    ns.crypto.RSAPrivateKey = RSAPrivateKey
})(DIMP);
(function (ns) {
    'use strict';
    var Secp256k1 = window.Secp256k1;
    var Class = ns.type.Class;
    var BasePublicKey = ns.crypto.BasePublicKey;
    var mem_cpy = function (dst, dst_offset, src, src_offset, src_len) {
        for (var i = 0; i < src_len; ++i) {
            dst[dst_offset + i] = src[src_offset + i]
        }
    };
    var trim_to_32_bytes = function (src, src_offset, src_len, dst) {
        var pos = src_offset;
        while (src[pos] === 0 && src_len > 0) {
            ++pos;
            --src_len
        }
        if (src_len > 32 || src_len < 1) {
            return false
        }
        var dst_offset = 32 - src_len;
        mem_cpy(dst, dst_offset, src, pos, src_len);
        return true
    };
    var ecc_der_to_sig = function (der, der_len) {
        var seq_len;
        var r_len;
        var s_len;
        if (der_len < 8 || der[0] !== 0x30 || der[2] !== 0x02) {
            return null
        }
        seq_len = der[1];
        if ((seq_len <= 0) || (seq_len + 2 !== der_len)) {
            return null
        }
        r_len = der[3];
        if ((r_len < 1) || (r_len > seq_len - 5) || (der[4 + r_len] !== 0x02)) {
            return null
        }
        s_len = der[5 + r_len];
        if ((s_len < 1) || (s_len !== seq_len - 4 - r_len)) {
            return null
        }
        var sig_r = new Uint8Array(32);
        var sig_s = new Uint8Array(32);
        if (trim_to_32_bytes(der, 4, r_len, sig_r) && trim_to_32_bytes(der, 6 + r_len, s_len, sig_s)) {
            return {r: sig_r, s: sig_s}
        } else {
            return null
        }
    };
    var ECCPublicKey = function (key) {
        BasePublicKey.call(this, key)
    };
    Class(ECCPublicKey, BasePublicKey, null, {
        getData: function () {
            var pem = this.getValue('data');
            if (!pem || pem.length === 0) {
                throw new ReferenceError('ECC public key data not found');
            } else if (pem.length === 66) {
                return ns.format.Hex.decode(pem)
            } else if (pem.length === 130) {
                return ns.format.Hex.decode(pem)
            } else {
                var pos1 = pem.indexOf('-----BEGIN PUBLIC KEY-----');
                if (pos1 >= 0) {
                    pos1 += '-----BEGIN PUBLIC KEY-----'.length;
                    var pos2 = pem.indexOf('-----END PUBLIC KEY-----', pos1);
                    if (pos2 > 0) {
                        var base64 = pem.substr(pos1, pos2 - pos1);
                        var data = ns.format.Base64.decode(base64);
                        return data.subarray(data.length - 65)
                    }
                }
            }
            throw new EvalError('key data error: ' + pem);
        }, getSize: function () {
            var size = this.getValue('keySize');
            if (size) {
                return Number(size)
            } else {
                return this.getData().length / 8
            }
        }, verify: function (data, signature) {
            var hash = ns.digest.SHA256.digest(data);
            var z = Secp256k1.uint256(hash, 16);
            var sig = ecc_der_to_sig(signature, signature.length);
            if (!sig) {
                throw new EvalError('signature error: ' + signature);
            }
            var sig_r = Secp256k1.uint256(sig.r, 16);
            var sig_s = Secp256k1.uint256(sig.s, 16);
            var pub = decode_points(this.getData());
            return Secp256k1.ecverify(pub.x, pub.y, sig_r, sig_s, z)
        }
    });
    var decode_points = function (data) {
        var x, y;
        if (data.length === 65) {
            if (data[0] === 4) {
                x = Secp256k1.uint256(data.subarray(1, 33), 16);
                y = Secp256k1.uint256(data.subarray(33, 65), 16)
            } else {
                throw new EvalError('key data head error: ' + data);
            }
        } else if (data.length === 33) {
            if (data[0] === 4) {
                x = Secp256k1.uint256(data.subarray(1, 33), 16);
                y = Secp256k1.decompressKey(x, 0)
            } else {
                throw new EvalError('key data head error: ' + data);
            }
        } else {
            throw new EvalError('key data length error: ' + data);
        }
        return {x: x, y: y}
    };
    ns.crypto.ECCPublicKey = ECCPublicKey
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var PublicKey = ns.crypto.PublicKey;
    var BasePrivateKey = ns.crypto.BasePrivateKey;
    var ecc_sig_to_der = function (sig_r, sig_s, der) {
        var i;
        var p = 0, len, len1, len2;
        der[p] = 0x30;
        p++;
        der[p] = 0x00;
        len = p;
        p++;
        der[p] = 0x02;
        p++;
        der[p] = 0x00;
        len1 = p;
        p++;
        i = 0;
        while (sig_r[i] === 0 && i < 32) {
            i++
        }
        if (sig_r[i] >= 0x80) {
            der[p] = 0x00;
            p++;
            der[len1] = der[len1] + 1
        }
        while (i < 32) {
            der[p] = sig_r[i];
            p++;
            der[len1] = der[len1] + 1;
            i++
        }
        der[p] = 0x02;
        p++;
        der[p] = 0x00;
        len2 = p;
        p++;
        i = 0;
        while (sig_s[i] === 0 && i < 32) {
            i++
        }
        if (sig_s[i] >= 0x80) {
            der[p] = 0x00;
            p++;
            der[len2] = der[len2] + 1
        }
        while (i < 32) {
            der[p] = sig_s[i];
            p++;
            der[len2] = der[len2] + 1;
            i++
        }
        der[len] = der[len1] + der[len2] + 4;
        return der[len] + 2
    };
    var ECCPrivateKey = function (key) {
        BasePrivateKey.call(this, key);
        var keyPair = get_key_pair.call(this);
        this.__privateKey = keyPair.privateKey;
        this.__publicKey = keyPair.publicKey
    };
    Class(ECCPrivateKey, BasePrivateKey, null, {
        getData: function () {
            var data = this.getValue('data');
            if (data && data.length > 0) {
                return ns.format.Hex.decode(data)
            } else {
                throw new ReferenceError('ECC private key data not found');
            }
        }, getSize: function () {
            var size = this.getValue('keySize');
            if (size) {
                return Number(size)
            } else {
                return this.getData().length / 8
            }
        }, getPublicKey: function () {
            var pub = this.__publicKey;
            var data = '04' + pub.x + pub.y;
            var info = {
                'algorithm': this.getValue('algorithm'),
                'data': data,
                'curve': 'secp256k1',
                'digest': 'SHA256'
            };
            return PublicKey.parse(info)
        }, sign: function (data) {
            var hash = ns.digest.SHA256.digest(data);
            var z = Secp256k1.uint256(hash, 16);
            var sig = Secp256k1.ecsign(this.__privateKey, z);
            var sig_r = ns.format.Hex.decode(sig.r);
            var sig_s = ns.format.Hex.decode(sig.s);
            var der = new Uint8Array(72);
            var sig_len = ecc_sig_to_der(sig_r, sig_s, der);
            if (sig_len === der.length) {
                return der
            } else {
                return der.subarray(0, sig_len)
            }
        }
    });
    var get_key_pair = function () {
        var sKey;
        var data = this.getData();
        if (!data || data.length === 0) {
            sKey = generatePrivateKey.call(this, 256)
        } else if (data.length === 32) {
            sKey = Secp256k1.uint256(data, 16)
        } else {
            throw new EvalError('key data length error: ' + data);
        }
        var pKey = Secp256k1.generatePublicKeyFromPrivateKeyData(sKey);
        return {privateKey: sKey, publicKey: pKey}
    };
    var generatePrivateKey = function (bits) {
        var key = window.crypto.getRandomValues(new Uint8Array(bits / 8))
        var hex = ns.format.Hex.encode(key);
        this.setValue('data', hex);
        this.setValue('curve', 'secp256k1');
        this.setValue('digest', 'SHA256');
        return key
    };
    ns.crypto.ECCPrivateKey = ECCPrivateKey
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var TransportableData = ns.format.TransportableData;
    var BaseSymmetricKey = ns.crypto.BaseSymmetricKey;
    var bytes2words = function (data) {
        var string = ns.format.Hex.encode(data);
        return CryptoJS.enc.Hex.parse(string)
    };
    var words2bytes = function (array) {
        var result = array.toString();
        return ns.format.Hex.decode(result)
    };
    var random_data = function (size) {
        var data = new Uint8Array(size);
        for (var i = 0; i < size; ++i) {
            data[i] = Math.floor(Math.random() * 256)
        }
        return data
    };
    var zero_data = function (size) {
        return new Uint8Array(size)
    };
    var AESKey = function (key) {
        BaseSymmetricKey.call(this, key);
        var base64 = this.getValue('data');
        if (base64) {
            this.__tedKey = null
        } else {
            this.__tedKey = this.generateKeyData()
        }
    };
    Class(AESKey, BaseSymmetricKey, null, {
        generateKeyData: function () {
            var keySize = this.getKeySize();
            var pwd = random_data(keySize);
            var ted = TransportableData.create(pwd);
            this.setValue('data', ted.toObject());
            return ted
        }, getKeySize: function () {
            return this.getInt('keySize', 32)
        }, getBlockSize: function () {
            return this.getInt('blockSize', 16)
        }, getData: function () {
            var ted = this.__tedKey;
            if (!ted) {
                var base64 = this.getValue('data');
                ted = TransportableData.parse(base64);
                this.__tedKey = ted
            }
            return !ted ? null : ted.getData()
        }, getIVString: function (params) {
            var base64 = params['IV'];
            if (base64 && base64.length > 0) {
                return base64
            }
            base64 = params['iv'];
            if (base64 && base64.length > 0) {
                return base64
            }
            base64 = this.getString('iv', null);
            if (base64 && base64.length > 0) {
                return base64
            }
            return this.getString('IV', null)
        }, getIVData: function (params) {
            if (!params) {
                throw new SyntaxError('params must provided to fetch IV for AES');
            }
            var base64 = this.getIVString(params);
            var ted = TransportableData.parse(base64);
            var ivData = !ted ? null : ted.getData();
            if (ivData) {
                return ivData
            }
            var blockSize = this.getBlockSize();
            return zero_data(blockSize)
        }, newIVData: function (extra) {
            if (!extra) {
                throw new SyntaxError('extra dict must provided to store IV for AES');
            }
            var blockSize = this.getBlockSize();
            var ivData = random_data(blockSize);
            var ted = TransportableData.create(ivData);
            extra['IV'] = ted.toObject();
            return ivData
        }, encrypt: function (plaintext, extra) {
            var message = bytes2words(plaintext);
            var iv = this.newIVData(extra);
            var ivWordArray = bytes2words(iv);
            var key = this.getData();
            var keyWordArray = bytes2words(key);
            try {
                var cipher = CryptoJS.AES.encrypt(message, keyWordArray, {iv: ivWordArray});
                if (cipher.hasOwnProperty('ciphertext')) {
                    return words2bytes(cipher.ciphertext)
                }
            } catch (e) {
                return null
            }
        }, decrypt: function (ciphertext, params) {
            var message = bytes2words(ciphertext);
            var iv = this.getIVData(params);
            var ivWordArray = bytes2words(iv);
            var key = this.getData();
            var keyWordArray = bytes2words(key);
            var cipher = {ciphertext: message};
            try {
                var plaintext = CryptoJS.AES.decrypt(cipher, keyWordArray, {iv: ivWordArray});
                return words2bytes(plaintext)
            } catch (e) {
                return null
            }
        }
    });
    ns.crypto.AESKey = AESKey
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Password = function () {
        Object.call(this)
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
            data = merged
        } else if (filling < 0) {
            if (Password.KEY_SIZE === digest.length) {
                data = digest
            } else {
                data = digest.subarray(0, Password.KEY_SIZE)
            }
        }
        var iv = digest.subarray(digest.length - Password.BLOCK_SIZE, digest.length);
        var key = {
            'algorithm': SymmetricKey.AES,
            'data': ns.format.Base64.encode(data),
            'iv': ns.format.Base64.encode(iv)
        };
        return SymmetricKey.parse(key)
    };
    ns.crypto.Password = Password
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var BaseSymmetricKey = ns.crypto.BaseSymmetricKey;
    var PlainKey = function (key) {
        BaseSymmetricKey.call(this, key)
    };
    Class(PlainKey, BaseSymmetricKey, null, {
        getData: function () {
            return null
        }, encrypt: function (data, extra) {
            return data
        }, decrypt: function (data, params) {
            return data
        }
    });
    var plain_key = null;
    PlainKey.getInstance = function () {
        if (!plain_key) {
            var key = {'algorithm': PlainKey.PLAIN};
            plain_key = new PlainKey(key)
        }
        return plain_key
    };
    PlainKey.PLAIN = 'PLAIN';
    ns.crypto.PlainKey = PlainKey
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var ECCPrivateKey = ns.crypto.ECCPrivateKey;
    var ECCPublicKey = ns.crypto.ECCPublicKey;
    var ECCPrivateKeyFactory = function () {
        Object.call(this)
    };
    Class(ECCPrivateKeyFactory, Object, [PrivateKey.Factory], null);
    ECCPrivateKeyFactory.prototype.generatePrivateKey = function () {
        return this.parsePrivateKey({'algorithm': AsymmetricKey.ECC})
    };
    ECCPrivateKeyFactory.prototype.parsePrivateKey = function (key) {
        return new ECCPrivateKey(key)
    };
    var ECCPublicKeyFactory = function () {
        Object.call(this)
    };
    Class(ECCPublicKeyFactory, Object, [PublicKey.Factory], null);
    ECCPublicKeyFactory.prototype.parsePublicKey = function (key) {
        return new ECCPublicKey(key)
    };
    ns.crypto.ECCPrivateKeyFactory = ECCPrivateKeyFactory;
    ns.crypto.ECCPublicKeyFactory = ECCPublicKeyFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = ns.crypto.RSAPrivateKey;
    var RSAPublicKey = ns.crypto.RSAPublicKey;
    var RSAPrivateKeyFactory = function () {
        Object.call(this)
    };
    Class(RSAPrivateKeyFactory, Object, [PrivateKey.Factory], null);
    RSAPrivateKeyFactory.prototype.generatePrivateKey = function () {
        return this.parsePrivateKey({'algorithm': AsymmetricKey.RSA})
    };
    RSAPrivateKeyFactory.prototype.parsePrivateKey = function (key) {
        return new RSAPrivateKey(key)
    };
    var RSAPublicKeyFactory = function () {
        Object.call(this)
    };
    Class(RSAPublicKeyFactory, Object, [PublicKey.Factory], null);
    RSAPublicKeyFactory.prototype.parsePublicKey = function (key) {
        return new RSAPublicKey(key)
    };
    ns.crypto.RSAPrivateKeyFactory = RSAPrivateKeyFactory;
    ns.crypto.RSAPublicKeyFactory = RSAPublicKeyFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var AESKey = ns.crypto.AESKey;
    var AESKeyFactory = function () {
        Object.call(this)
    };
    Class(AESKeyFactory, Object, [SymmetricKey.Factory], null);
    AESKeyFactory.prototype.generateSymmetricKey = function () {
        return this.parseSymmetricKey({'algorithm': SymmetricKey.AES})
    };
    AESKeyFactory.prototype.parseSymmetricKey = function (key) {
        return new AESKey(key)
    };
    ns.crypto.AESKeyFactory = AESKeyFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = ns.crypto.PlainKey;
    var PlainKeyFactory = function () {
        Object.call(this)
    };
    Class(PlainKeyFactory, Object, [SymmetricKey.Factory], null);
    PlainKeyFactory.prototype.generateSymmetricKey = function () {
        return PlainKey.getInstance()
    };
    PlainKeyFactory.prototype.parseSymmetricKey = function (key) {
        return PlainKey.getInstance()
    };
    ns.crypto.PlainKeyFactory = PlainKeyFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
    var ConstantString = ns.type.ConstantString;
    var Base58 = ns.format.Base58;
    var SHA256 = ns.digest.SHA256;
    var RIPEMD160 = ns.digest.RIPEMD160;
    var Address = ns.protocol.Address;
    var BTCAddress = function (string, network) {
        ConstantString.call(this, string);
        this.__network = Enum.getInt(network)
    };
    Class(BTCAddress, ConstantString, [Address], null);
    BTCAddress.prototype.getType = function () {
        return this.__network
    };
    BTCAddress.generate = function (fingerprint, network) {
        network = Enum.getInt(network);
        var digest = RIPEMD160.digest(SHA256.digest(fingerprint));
        var head = [];
        head.push(network);
        for (var i = 0; i < digest.length; ++i) {
            head.push(digest[i])
        }
        var cc = check_code(Uint8Array.from(head));
        var data = [];
        for (var j = 0; j < head.length; ++j) {
            data.push(head[j])
        }
        for (var k = 0; k < cc.length; ++k) {
            data.push(cc[k])
        }
        return new BTCAddress(Base58.encode(Uint8Array.from(data)), network)
    };
    BTCAddress.parse = function (string) {
        var len = string.length;
        if (len < 26 || len > 35) {
            return null
        }
        var data = Base58.decode(string);
        if (!data || data.length !== 25) {
            return null
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
    var check_code = function (data) {
        var sha256d = SHA256.digest(SHA256.digest(data));
        return sha256d.subarray(0, 4)
    };
    ns.mkm.BTCAddress = BTCAddress
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ConstantString = ns.type.ConstantString;
    var EntityType = ns.protocol.EntityType;
    var Address = ns.protocol.Address;
    var ETHAddress = function (string) {
        ConstantString.call(this, string)
    };
    Class(ETHAddress, ConstantString, [Address], null);
    ETHAddress.prototype.getType = function () {
        return EntityType.USER.getValue()
    };
    ETHAddress.getValidateAddress = function (address) {
        if (!is_eth(address)) {
            return null
        }
        var lower = address.substr(2).toLowerCase();
        return '0x' + eip55(lower)
    };
    ETHAddress.isValidate = function (address) {
        return address === this.getValidateAddress(address)
    };
    ETHAddress.generate = function (fingerprint) {
        if (fingerprint.length === 65) {
            fingerprint = fingerprint.subarray(1)
        } else if (fingerprint.length !== 64) {
            throw new TypeError('ECC key data error: ' + fingerprint);
        }
        var digest = ns.digest.KECCAK256.digest(fingerprint);
        var tail = digest.subarray(digest.length - 20);
        var address = ns.format.Hex.encode(tail);
        return new ETHAddress('0x' + eip55(address))
    };
    ETHAddress.parse = function (address) {
        if (!is_eth(address)) {
            return null
        }
        return new ETHAddress(address)
    };
    var eip55 = function (hex) {
        var sb = new Uint8Array(40);
        var hash = ns.digest.KECCAK256.digest(ns.format.UTF8.encode(hex));
        var ch;
        var _9 = '9'.charCodeAt(0);
        for (var i = 0; i < 40; ++i) {
            ch = hex.charCodeAt(i);
            if (ch > _9) {
                ch -= (hash[i >> 1] << (i << 2 & 4) & 0x80) >> 2
            }
            sb[i] = ch
        }
        return ns.format.UTF8.decode(sb)
    };
    var is_eth = function (address) {
        if (address.length !== 42) {
            return false
        } else if (address.charAt(0) !== '0' || address.charAt(1) !== 'x') {
            return false
        }
        var _0 = '0'.charCodeAt(0);
        var _9 = '9'.charCodeAt(0);
        var _A = 'A'.charCodeAt(0);
        var _Z = 'Z'.charCodeAt(0);
        var _a = 'a'.charCodeAt(0);
        var _z = 'z'.charCodeAt(0);
        var ch;
        for (var i = 2; i < 42; ++i) {
            ch = address.charCodeAt(i);
            if (ch >= _0 && ch <= _9) {
                continue
            }
            if (ch >= _A && ch <= _Z) {
                continue
            }
            if (ch >= _a && ch <= _z) {
                continue
            }
            return false
        }
        return true
    };
    ns.mkm.ETHAddress = ETHAddress
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Address = ns.protocol.Address;
    var BaseAddressFactory = function () {
        Object.call(this);
        this.__addresses = {}
    };
    Class(BaseAddressFactory, Object, [Address.Factory], null);
    BaseAddressFactory.prototype.reduceMemory = function () {
        var finger = 0;
        finger = thanos(this.__addresses, finger);
        return finger >> 1
    };
    BaseAddressFactory.prototype.generateAddress = function (meta, network) {
        var address = meta.generateAddress(network);
        if (address) {
            this.__addresses[address.toString()] = address
        }
        return address
    };
    BaseAddressFactory.prototype.parseAddress = function (string) {
        var address = this.__addresses[string];
        if (!address) {
            address = Address.create(string);
            if (address) {
                this.__addresses[string] = address
            }
        }
        return address
    };
    var thanos = ns.mkm.thanos;
    ns.mkm.BaseAddressFactory = BaseAddressFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Address = ns.protocol.Address;
    var BaseAddressFactory = ns.mkm.BaseAddressFactory;
    var BTCAddress = ns.mkm.BTCAddress;
    var ETHAddress = ns.mkm.ETHAddress;
    var GeneralAddressFactory = function () {
        BaseAddressFactory.call(this)
    };
    Class(GeneralAddressFactory, BaseAddressFactory, null, null);
    GeneralAddressFactory.prototype.createAddress = function (address) {
        if (!address) {
            return null
        }
        var len = address.length;
        if (len === 8) {
            if (address.toLowerCase() === 'anywhere') {
                return Address.ANYWHERE
            }
        } else if (len === 10) {
            if (address.toLowerCase() === 'everywhere') {
                return Address.EVERYWHERE
            }
        }
        var res;
        if (26 <= len && len <= 35) {
            res = BTCAddress.parse(address)
        } else if (len === 42) {
            res = ETHAddress.parse(address)
        } else {
            res = null
        }
        return res
    };
    ns.mkm.GeneralAddressFactory = GeneralAddressFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Address = ns.protocol.Address;
    var ID = ns.protocol.ID;
    var Identifier = ns.mkm.Identifier;
    var IdentifierFactory = function () {
        Object.call(this);
        this.__identifiers = {}
    };
    Class(IdentifierFactory, Object, [ID.Factory], null);
    IdentifierFactory.prototype.reduceMemory = function () {
        var finger = 0;
        finger = thanos(this.__identifiers, finger);
        return finger >> 1
    };
    IdentifierFactory.prototype.generateIdentifier = function (meta, network, terminal) {
        var address = Address.generate(meta, network);
        return ID.create(meta.getSeed(), address, terminal)
    };
    IdentifierFactory.prototype.createIdentifier = function (name, address, terminal) {
        var string = Identifier.concat(name, address, terminal);
        var id = this.__identifiers[string];
        if (!id) {
            id = this.newID(string, name, address, terminal);
            this.__identifiers[string] = id
        }
        return id
    }
    IdentifierFactory.prototype.parseIdentifier = function (identifier) {
        var id = this.__identifiers[identifier];
        if (!id) {
            id = this.parse(identifier);
            if (id) {
                this.__identifiers[identifier] = id
            }
        }
        return id
    };
    IdentifierFactory.prototype.newID = function (string, name, address, terminal) {
        return new Identifier(string, name, address, terminal)
    };
    IdentifierFactory.prototype.parse = function (string) {
        var name, address, terminal;
        var pair = string.split('/');
        if (pair.length === 1) {
            terminal = null
        } else {
            terminal = pair[1]
        }
        pair = pair[0].split('@');
        if (pair.length === 1) {
            name = null;
            address = Address.parse(pair[0])
        } else {
            name = pair[0];
            address = Address.parse(pair[1])
        }
        if (!address) {
            return null
        }
        return this.newID(string, name, address, terminal)
    };
    var thanos = ns.mkm.thanos;
    ns.mkm.GeneralIdentifierFactory = IdentifierFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var DefaultMeta = function () {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0])
        } else if (arguments.length === 4) {
            BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3])
        } else {
            throw new SyntaxError('Default meta arguments error: ' + arguments);
        }
        this.__addresses = {}
    };
    Class(DefaultMeta, BaseMeta, null, {
        hasSeed: function () {
            return true
        }, generateAddress: function (network) {
            network = Enum.getInt(network);
            var cached = this.__addresses[network];
            if (!cached) {
                var data = this.getFingerprint();
                cached = BTCAddress.generate(data, network);
                this.__addresses[network] = cached
            }
            return cached
        }
    });
    ns.mkm.DefaultMeta = DefaultMeta
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var BTCMeta = function () {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0])
        } else if (arguments.length === 2) {
            BaseMeta.call(this, arguments[0], arguments[1])
        } else if (arguments.length === 4) {
            BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3])
        } else {
            throw new SyntaxError('BTC meta arguments error: ' + arguments);
        }
        this.__addresses = {}
    };
    Class(BTCMeta, BaseMeta, null, {
        hasSeed: function () {
            return false
        }, generateAddress: function (network) {
            network = Enum.getInt(network);
            var cached = this.__addresses[network];
            if (!cached) {
                var key = this.getPublicKey();
                var data = key.getData();
                cached = BTCAddress.generate(data, network);
                this.__addresses[network] = cached
            }
            return cached
        }
    });
    ns.mkm.BTCMeta = BTCMeta
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ETHAddress = ns.mkm.ETHAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var ETHMeta = function () {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0])
        } else if (arguments.length === 2) {
            BaseMeta.call(this, arguments[0], arguments[1])
        } else if (arguments.length === 4) {
            BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3])
        } else {
            throw new SyntaxError('ETH meta arguments error: ' + arguments);
        }
        this.__address = null
    };
    Class(ETHMeta, BaseMeta, null, {
        hasSeed: function () {
            return false
        }, generateAddress: function (network) {
            var cached = this.__address;
            if (!cached) {
                var key = this.getPublicKey();
                var data = key.getData();
                cached = ETHAddress.generate(data);
                this.__address = cached
            }
            return cached
        }
    });
    ns.mkm.ETHMeta = ETHMeta
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var UTF8 = ns.format.UTF8;
    var TransportableData = ns.format.TransportableData;
    var Meta = ns.protocol.Meta;
    var DefaultMeta = ns.mkm.DefaultMeta;
    var BTCMeta = ns.mkm.BTCMeta;
    var ETHMeta = ns.mkm.ETHMeta;
    var GeneralMetaFactory = function (algorithm) {
        Object.call(this);
        this.__type = algorithm
    };
    Class(GeneralMetaFactory, Object, [Meta.Factory], null);
    GeneralMetaFactory.prototype.getType = function () {
        return this.__type
    };
    GeneralMetaFactory.prototype.generateMeta = function (sKey, seed) {
        var fingerprint = null;
        if (seed && seed.length > 0) {
            var sig = sKey.sign(UTF8.encode(seed));
            fingerprint = TransportableData.create(sig)
        }
        var pKey = sKey.getPublicKey();
        return this.createMeta(pKey, seed, fingerprint)
    };
    GeneralMetaFactory.prototype.createMeta = function (key, seed, fingerprint) {
        var out;
        var type = this.getType();
        if (type === Meta.MKM) {
            out = new DefaultMeta(type, key, seed, fingerprint)
        } else if (type === Meta.BTC) {
            out = new BTCMeta(type, key)
        } else if (type === Meta.ETH) {
            out = new ETHMeta(type, key)
        } else {
            throw new TypeError('unknown meta type: ' + type);
        }
        return out
    };
    GeneralMetaFactory.prototype.parseMeta = function (meta) {
        var out;
        var gf = general_factory();
        var type = gf.getMetaType(meta, '');
        if (type === Meta.MKM) {
            out = new DefaultMeta(meta)
        } else if (type === Meta.BTC) {
            out = new BTCMeta(meta)
        } else if (type === Meta.ETH) {
            out = new ETHMeta(meta)
        } else {
            throw new TypeError('unknown meta type: ' + type);
        }
        return out.isValid() ? out : null
    };
    var general_factory = function () {
        var man = ns.mkm.AccountFactoryManager;
        return man.generalFactory
    };
    ns.mkm.GeneralMetaFactory = GeneralMetaFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var BaseDocument = ns.mkm.BaseDocument;
    var BaseBulletin = ns.mkm.BaseBulletin;
    var BaseVisa = ns.mkm.BaseVisa;
    var doc_type = function (type, identifier) {
        if (type !== '*') {
            return type
        } else if (identifier.isGroup()) {
            return Document.BULLETIN
        } else if (identifier.isUser()) {
            return Document.VISA
        } else {
            return Document.PROFILE
        }
    };
    var GeneralDocumentFactory = function (type) {
        Object.call(this);
        this.__type = type
    };
    Class(GeneralDocumentFactory, Object, [Document.Factory], null);
    GeneralDocumentFactory.prototype.createDocument = function (identifier, data, signature) {
        var type = doc_type(this.__type, identifier);
        if (data && signature) {
            if (type === Document.VISA) {
                return new BaseVisa(identifier, data, signature)
            } else if (type === Document.BULLETIN) {
                return new BaseBulletin(identifier, data, signature)
            } else {
                return new BaseDocument(identifier, data, signature)
            }
        } else {
            if (type === Document.VISA) {
                return new BaseVisa(identifier)
            } else if (type === Document.BULLETIN) {
                return new BaseBulletin(identifier)
            } else {
                return new BaseDocument(identifier, type)
            }
        }
    };
    GeneralDocumentFactory.prototype.parseDocument = function (doc) {
        var identifier = ID.parse(doc['ID']);
        if (!identifier) {
            return null
        }
        var gf = general_factory();
        var type = gf.getDocumentType(doc, null);
        if (!type) {
            type = doc_type('*', identifier)
        }
        if (type === Document.VISA) {
            return new BaseVisa(doc)
        } else if (type === Document.BULLETIN) {
            return new BaseBulletin(doc)
        } else {
            return new BaseDocument(doc)
        }
    };
    var general_factory = function () {
        var man = ns.mkm.AccountFactoryManager;
        return man.generalFactory
    };
    ns.mkm.GeneralDocumentFactory = GeneralDocumentFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Address = ns.protocol.Address;
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var Document = ns.protocol.Document;
    var GeneralAddressFactory = ns.mkm.GeneralAddressFactory;
    var GeneralIdentifierFactory = ns.mkm.GeneralIdentifierFactory;
    var GeneralMetaFactory = ns.mkm.GeneralMetaFactory;
    var GeneralDocumentFactory = ns.mkm.GeneralDocumentFactory;
    var registerAddressFactory = function () {
        Address.setFactory(new GeneralAddressFactory())
    };
    var registerIdentifierFactory = function () {
        ID.setFactory(new GeneralIdentifierFactory())
    };
    var registerMetaFactories = function () {
        Meta.setFactory(Meta.MKM, new GeneralMetaFactory(Meta.MKM));
        Meta.setFactory(Meta.BTC, new GeneralMetaFactory(Meta.BTC));
        Meta.setFactory(Meta.ETH, new GeneralMetaFactory(Meta.ETH))
    };
    var registerDocumentFactories = function () {
        Document.setFactory('*', new GeneralDocumentFactory('*'));
        Document.setFactory(Document.VISA, new GeneralDocumentFactory(Document.VISA));
        Document.setFactory(Document.PROFILE, new GeneralDocumentFactory(Document.PROFILE));
        Document.setFactory(Document.BULLETIN, new GeneralDocumentFactory(Document.BULLETIN))
    };
    ns.registerAddressFactory = registerAddressFactory;
    ns.registerIdentifierFactory = registerIdentifierFactory;
    ns.registerMetaFactories = registerMetaFactories;
    ns.registerDocumentFactories = registerDocumentFactories
})(DIMP);
(function (ns) {
    'use strict';
    var SymmetricKey = ns.crypto.SymmetricKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var PlainKey = ns.crypto.PlainKey;
    var ECCPrivateKeyFactory = ns.crypto.ECCPrivateKeyFactory;
    var ECCPublicKeyFactory = ns.crypto.ECCPublicKeyFactory
    var RSAPrivateKeyFactory = ns.crypto.RSAPrivateKeyFactory;
    var RSAPublicKeyFactory = ns.crypto.RSAPublicKeyFactory
    var AESKeyFactory = ns.crypto.AESKeyFactory;
    var PlainKeyFactory = ns.crypto.PlainKeyFactory;
    var registerKeyFactories = function () {
        var ecc_pri = new ECCPrivateKeyFactory();
        PrivateKey.setFactory(AsymmetricKey.ECC, ecc_pri);
        PrivateKey.setFactory('SHA256withECC', ecc_pri);
        var ecc_pub = new ECCPublicKeyFactory();
        PublicKey.setFactory(AsymmetricKey.ECC, ecc_pub);
        PublicKey.setFactory('SHA256withECC', ecc_pub);
        var rsa_pri = new RSAPrivateKeyFactory();
        PrivateKey.setFactory(AsymmetricKey.RSA, rsa_pri);
        PrivateKey.setFactory('SHA256withRSA', rsa_pri);
        PrivateKey.setFactory('RSA/ECB/PKCS1Padding', rsa_pri);
        var rsa_pub = new RSAPublicKeyFactory();
        PublicKey.setFactory(AsymmetricKey.RSA, rsa_pub);
        PublicKey.setFactory('SHA256withRSA', rsa_pub);
        PublicKey.setFactory('RSA/ECB/PKCS1Padding', rsa_pub);
        var aes = new AESKeyFactory();
        SymmetricKey.setFactory(SymmetricKey.AES, aes);
        SymmetricKey.setFactory('AES/CBC/PKCS7Padding', aes);
        SymmetricKey.setFactory(PlainKey.PLAIN, new PlainKeyFactory())
    };
    var registerPlugins = function () {
        ns.registerKeyFactories();
        ns.registerIdentifierFactory();
        ns.registerAddressFactory();
        ns.registerMetaFactories();
        ns.registerDocumentFactories()
    };
    ns.registerKeyFactories = registerKeyFactories;
    ns.registerPlugins = registerPlugins
})(DIMP);
(function (ns) {
    'use strict';
    if (typeof ns.cpu !== 'object') {
        ns.cpu = {}
    }
    if (typeof ns.utils !== 'object') {
        ns.utils = {}
    }
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var TwinsHelper = function (facebook, messenger) {
        Object.call(this);
        this.__facebook = facebook;
        this.__messenger = messenger
    };
    Class(TwinsHelper, Object, null, null);
    TwinsHelper.prototype.getFacebook = function () {
        return this.__facebook
    }
    TwinsHelper.prototype.getMessenger = function () {
        return this.__messenger
    }
    TwinsHelper.prototype.respondReceipt = function (text, envelope, content, extra) {
        var res = TwinsHelper.createReceipt(text, envelope, content, extra);
        return [res]
    }
    TwinsHelper.createReceipt = function (text, envelope, content, extra) {
        var res = ReceiptCommand.create(text, envelope, content);
        if (extra) {
            var keys = Object.keys(extra);
            var name, value;
            for (var i = 0; i < keys.length; ++i) {
                name = keys[i];
                value = extra[name];
                res.setValue(name, value)
            }
        }
        return res
    };
    ns.TwinsHelper = TwinsHelper
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var FrequencyChecker = function (lifeSpan) {
        this.__expires = lifeSpan;
        this.__records = {}
    };
    Class(FrequencyChecker, null, null, null);
    FrequencyChecker.prototype.forceExpired = function (key, now) {
        this.__records[key] = now + this.__expires;
        return true
    };
    FrequencyChecker.prototype.checkExpired = function (key, now) {
        var expired = this.__records[key];
        if (expired && expired > now) {
            return false
        }
        this.__records[key] = now + this.__expires;
        return true
    };
    FrequencyChecker.prototype.isExpired = function (key, now, force) {
        if (!now) {
            now = new Date();
            now = now.getTime()
        } else if (now instanceof Date) {
            now = now.getTime()
        }
        if (force) {
            return this.forceExpired(key, now)
        } else {
            return this.checkExpired(key, now)
        }
    };
    var RecentTimeChecker = function () {
        this.__times = {}
    };
    Class(RecentTimeChecker, null, null, null);
    RecentTimeChecker.prototype.setLastTime = function (key, when) {
        if (!when) {
            return false
        } else if (when instanceof Date) {
            when = when.getTime()
        }
        var last = this.__times[key];
        if (!last || last < when) {
            this.__times[key] = when;
            return true
        } else {
            return false
        }
    };
    RecentTimeChecker.prototype.isExpired = function (key, now) {
        if (!now) {
            return true
        } else if (now instanceof Date) {
            now = now.getTime()
        }
        var last = this.__times[key];
        return last && last > now
    };
    ns.utils.FrequencyChecker = FrequencyChecker;
    ns.utils.RecentTimeChecker = RecentTimeChecker
})(DIMP);
(function (ns) {
    'use strict';
    var kFounder = (0x20);
    var kOwner = (0x3F);
    var kAdmin = (0x0F);
    var kMember = (0x07);
    var kOther = (0x00);
    var kFreezing = (0x80);
    var kWaiting = (0x40);
    var kOwnerWaiting = (kOwner | kWaiting);
    var kOwnerFreezing = (kOwner | kFreezing);
    var kAdminWaiting = (kAdmin | kWaiting);
    var kAdminFreezing = (kAdmin | kFreezing);
    var kMemberWaiting = (kMember | kWaiting);
    var kMemberFreezing = (kMember | kFreezing);
    ns.mkm.MemberType = ns.type.Enum(null, {
        FOUNDER: kFounder,
        OWNER: kOwner,
        ADMIN: kAdmin,
        MEMBER: kMember,
        OTHER: kOther,
        FREEZING: kFreezing,
        WAITING: kWaiting,
        OWNER_WAITING: kOwnerWaiting,
        OWNER_FREEZING: kOwnerFreezing,
        ADMIN_WAITING: kAdminWaiting,
        ADMIN_FREEZING: kAdminFreezing,
        MEMBER_WAITING: kMemberWaiting,
        MEMBER_FREEZING: kMemberFreezing
    })
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var BaseUser = ns.mkm.BaseUser;
    var Bot = function (identifier) {
        BaseUser.call(this, identifier)
    };
    Class(Bot, BaseUser, null, {
        getProfile: function () {
            return this.getVisa()
        }, getProvider: function () {
            var doc = this.getProfile();
            if (doc) {
                var icp = doc.getProperty('ICP');
                return ID.parse(icp)
            }
            return null
        }
    });
    ns.mkm.Bot = Bot
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var BaseObject = ns.type.BaseObject;
    var Converter = ns.type.Converter;
    var ID = ns.protocol.ID;
    var Address = ns.protocol.Address;
    var Identifier = ns.mkm.Identifier;
    var User = ns.mkm.User;
    var BaseUser = ns.mkm.BaseUser;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var Station = function () {
        BaseObject.call(this);
        var user;
        var host, port;
        if (arguments.length === 1) {
            user = new BaseUser(arguments[0]);
            host = null;
            port = 0
        } else if (arguments.length === 2) {
            user = new BaseUser(Station.ANY);
            host = arguments[0];
            port = arguments[1]
        } else if (arguments.length === 3) {
            user = new BaseUser(arguments[0]);
            host = arguments[1];
            port = arguments[2]
        }
        this.__user = user;
        this.__host = host;
        this.__port = port;
        this.__isp = null
    };
    Class(Station, BaseObject, [User], {
        equals: function (other) {
            if (this === other) {
                return true
            } else if (!other) {
                return false
            } else if (other instanceof Station) {
                return ns.mkm.ServiceProvider.sameStation(other, this)
            }
            return this.__user.equals(other)
        }, valueOf: function () {
            return desc.call(this)
        }, toString: function () {
            return desc.call(this)
        }, setDataSource: function (delegate) {
            this.__user.setDataSource(delegate)
        }, getDataSource: function () {
            return this.__user.getDataSource()
        }, getIdentifier: function () {
            return this.__user.getIdentifier()
        }, getType: function () {
            return this.__user.getType()
        }, getMeta: function () {
            return this.__user.getMeta()
        }, getDocuments: function () {
            return this.__user.getDocuments()
        }, getVisa: function () {
            return this.__user.getVisa()
        }, getContacts: function () {
            return this.__user.getContacts()
        }, verify: function (data, signature) {
            return this.__user.verify(data, signature)
        }, encrypt: function (plaintext) {
            return this.__user.encrypt(plaintext)
        }, sign: function (data) {
            return this.__user.sign(data)
        }, decrypt: function (ciphertext) {
            return this.__user.decrypt(ciphertext)
        }, signVisa: function (doc) {
            return this.__user.signVisa(doc)
        }, verifyVisa: function (doc) {
            return this.__user.verifyVisa(doc)
        }, setIdentifier: function (identifier) {
            var delegate = this.getDataSource();
            var user = new BaseUser(identifier);
            user.setDataSource(delegate);
            this.__user = user
        }, getHost: function () {
            if (!this.__host) {
                this.reload()
            }
            return this.__host
        }, getPort: function () {
            if (!this.__port) {
                this.reload()
            }
            return this.__port
        }, getProvider: function () {
            if (!this.__isp) {
                this.reload()
            }
            return this.__isp
        }, getProfile: function () {
            var docs = this.getDocuments();
            return DocumentHelper.lastDocument(docs)
        }, reload: function () {
            var doc = this.getProfile();
            if (doc) {
                var host = doc.getProperty('host');
                host = Converter.getString(host, null);
                if (host) {
                    this.__host = host
                }
                var port = doc.getProperty('port');
                port = Converter.getInt(port, 0);
                if (port > 0) {
                    this.__port = port
                }
                var isp = doc.getProperty('ISP');
                isp = ID.parse(isp);
                if (isp) {
                    this.__isp = isp
                }
            }
        }
    });
    var desc = function () {
        var clazz = Object.getPrototypeOf(this).constructor.name;
        var id = this.getIdentifier();
        var network = id.getAddress().getType();
        return '<' + clazz + ' id="' + id.toString() + '" network="' + network + '" host="' + this.getHost() + '" port=' + this.getPort() + ' />'
    };
    Station.ANY = Identifier.create('station', Address.ANYWHERE, null);
    Station.EVERY = Identifier.create('stations', Address.EVERYWHERE, null);
    ns.mkm.Station = Station
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var BaseGroup = ns.mkm.BaseGroup;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var ServiceProvider = function (identifier) {
        BaseGroup.call(this, identifier)
    };
    Class(ServiceProvider, BaseGroup, null, {
        getProfile: function () {
            var docs = this.getDocuments();
            return DocumentHelper.lastDocument(docs)
        }, getStations: function () {
            var doc = this.getProfile();
            if (doc) {
                var stations = doc.getProperty('stations');
                if (stations instanceof Array) {
                    return stations
                }
            }
            return []
        }
    });
    ServiceProvider.sameStation = function (a, b) {
        if (a === b) {
            return true
        }
        return checkIdentifiers(a.getIdentifier(), b.getIdentifier()) && checkHosts(a.getHost(), b.getHost()) && checkPorts(a.getPort(), b.getPort())
    };
    var checkIdentifiers = function (a, b) {
        if (a === b) {
            return true
        } else if (a.isBroadcast() || b.isBroadcast()) {
            return true
        }
        return a.equals(b)
    };
    var checkHosts = function (a, b) {
        if (!a || !b) {
            return true
        }
        return a === b
    };
    var checkPorts = function (a, b) {
        if (!a || !b) {
            return true
        }
        return a === b
    };
    ns.mkm.ServiceProvider = ServiceProvider
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var UTF8 = ns.format.UTF8;
    var TransportableData = ns.format.TransportableData;
    var SecureMessage = ns.protocol.SecureMessage;
    var BaseMessage = ns.msg.BaseMessage;
    var InstantMessagePacker = function (messenger) {
        this.__transceiver = messenger
    };
    Class(InstantMessagePacker, null, null, null);
    InstantMessagePacker.prototype.getInstantMessageDelegate = function () {
        return this.__transceiver
    };
    InstantMessagePacker.prototype.encryptMessage = function (iMsg, password, members) {
        var transceiver = this.getInstantMessageDelegate();
        var body = transceiver.serializeContent(iMsg.getContent(), password, iMsg);
        var ciphertext = transceiver.encryptContent(body, password, iMsg);
        var encodedData;
        if (BaseMessage.isBroadcast(iMsg)) {
            encodedData = UTF8.decode(ciphertext)
        } else {
            encodedData = TransportableData.encode(ciphertext)
        }
        var info = iMsg.copyMap(false);
        delete info['content'];
        info['data'] = encodedData;
        var pwd = transceiver.serializeKey(password, iMsg);
        if (!pwd) {
            return SecureMessage.parse(info)
        }
        var receiver;
        var encryptedKey;
        var encodedKey;
        if (!members) {
            receiver = iMsg.getReceiver();
            encryptedKey = transceiver.encryptKey(pwd, receiver, iMsg);
            if (!encryptedKey) {
                return null
            }
            encodedKey = TransportableData.encode(encryptedKey);
            info['key'] = encodedKey
        } else {
            var keys = {};
            for (var i = 0; i < members.length; ++i) {
                receiver = members[i];
                encryptedKey = transceiver.encryptKey(pwd, receiver, iMsg);
                if (!encryptedKey) {
                    return null
                }
                encodedKey = TransportableData.encode(encryptedKey);
                keys[receiver.toString()] = encodedKey
            }
            if (Object.keys(keys).length === 0) {
                return null
            }
            info['keys'] = keys
        }
        return SecureMessage.parse(info)
    };
    ns.msg.InstantMessagePacker = InstantMessagePacker
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var TransportableData = ns.format.TransportableData;
    var InstantMessage = ns.protocol.InstantMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var SecureMessagePacker = function (messenger) {
        this.__transceiver = messenger
    };
    Class(SecureMessagePacker, null, null, null);
    SecureMessagePacker.prototype.getSecureMessageDelegate = function () {
        return this.__transceiver
    };
    SecureMessagePacker.prototype.decryptMessage = function (sMsg, receiver) {
        var transceiver = this.getSecureMessageDelegate();
        var encryptedKey = sMsg.getEncryptedKey();
        var keyData;
        if (encryptedKey) {
            keyData = transceiver.decryptKey(encryptedKey, receiver, sMsg);
            if (!keyData) {
                throw new ReferenceError('failed to decrypt message key: ' + encryptedKey.length + ' byte(s) ' + sMsg.getSender() + ' => ' + receiver + ', ' + sMsg.getGroup());
            }
        }
        var password = transceiver.deserializeKey(keyData, sMsg);
        if (!password) {
            throw new ReferenceError('failed to get message key: ' + keyData.length + ' byte(s) ' + sMsg.getSender() + ' => ' + receiver + ', ' + sMsg.getGroup());
        }
        var ciphertext = sMsg.getData();
        if (!ciphertext || ciphertext.length === 0) {
            return null
        }
        var body = transceiver.decryptContent(ciphertext, password, sMsg);
        if (!body) {
            throw new ReferenceError('failed to decrypt message data with key: ' + password + ', data length: ' + ciphertext.length + ' byte(s)');
        }
        var content = transceiver.deserializeContent(body, password, sMsg);
        if (!content) {
            return null
        }
        var info = sMsg.copyMap(false);
        delete info['key'];
        delete info['keys'];
        delete info['data'];
        info['content'] = content.toMap();
        return InstantMessage.parse(info)
    };
    SecureMessagePacker.prototype.signMessage = function (sMsg) {
        var transceiver = this.getSecureMessageDelegate();
        var ciphertext = sMsg.getData();
        var signature = transceiver.signData(ciphertext, sMsg);
        var base64 = TransportableData.encode(signature);
        var info = sMsg.copyMap(false);
        info['signature'] = base64;
        return ReliableMessage.parse(info)
    };
    ns.msg.SecureMessagePacker = SecureMessagePacker
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessagePacker = function (messenger) {
        this.__transceiver = messenger
    };
    Class(ReliableMessagePacker, null, null, null);
    ReliableMessagePacker.prototype.getReliableMessageDelegate = function () {
        return this.__transceiver
    };
    ReliableMessagePacker.prototype.verifyMessage = function (rMsg) {
        var transceiver = this.getReliableMessageDelegate();
        var ciphertext = rMsg.getData();
        if (!ciphertext || ciphertext.length === 0) {
            return null
        }
        var signature = rMsg.getSignature();
        if (!signature || signature.length === 0) {
            return null
        }
        var ok = transceiver.verifyDataSignature(ciphertext, signature, rMsg);
        if (!ok) {
            return null
        }
        var info = rMsg.copyMap(false);
        delete info['signature'];
        return SecureMessage.parse(info)
    };
    ns.msg.ReliableMessagePacker = ReliableMessagePacker
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Meta = ns.protocol.Meta;
    var Document = ns.protocol.Document;
    var Visa = ns.protocol.Visa;
    var setMeta = function (meta, msg) {
        msg.setMap('meta', meta)
    };
    var getMeta = function (msg) {
        var meta = msg.getValue('meta');
        return Meta.parse(meta)
    };
    var setVisa = function (visa, msg) {
        msg.setMap('visa', visa)
    };
    var getVisa = function (msg) {
        var visa = msg.getValue('visa');
        var doc = Document.parse(visa);
        if (Interface.conforms(doc, Visa)) {
            return doc
        }
        return null
    };
    ns.msg.MessageHelper = {getMeta: getMeta, setMeta: setMeta, getVisa: getVisa, setVisa: setVisa}
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var MessageEnvelope = ns.msg.MessageEnvelope;
    var PlainMessage = ns.msg.PlainMessage;
    var EncryptedMessage = ns.msg.EncryptedMessage;
    var NetworkMessage = ns.msg.NetworkMessage;
    var random_int = function (max) {
        return Math.floor(Math.random() * max)
    };
    var MessageFactory = function () {
        Object.call(this);
        this.__sn = random_int(0x7fffffff)
    };
    Class(MessageFactory, Object, [Envelope.Factory, InstantMessage.Factory, SecureMessage.Factory, ReliableMessage.Factory], null);
    MessageFactory.prototype.next = function () {
        var sn = this.__sn;
        if (sn < 0x7fffffff) {
            sn += 1
        } else {
            sn = 1
        }
        this.__sn = sn;
        return sn
    };
    MessageFactory.prototype.createEnvelope = function (from, to, when) {
        return new MessageEnvelope(from, to, when)
    };
    MessageFactory.prototype.parseEnvelope = function (env) {
        if (!env['sender']) {
            return null
        }
        return new MessageEnvelope(env)
    };
    MessageFactory.prototype.generateSerialNumber = function (msgType, now) {
        return this.next()
    };
    MessageFactory.prototype.createInstantMessage = function (head, body) {
        return new PlainMessage(head, body)
    };
    MessageFactory.prototype.parseInstantMessage = function (msg) {
        if (!msg["sender"] || !msg["content"]) {
            return null
        }
        return new PlainMessage(msg)
    };
    MessageFactory.prototype.parseSecureMessage = function (msg) {
        if (!msg["sender"] || !msg["data"]) {
            return null
        }
        if (msg['signature']) {
            return new NetworkMessage(msg)
        }
        return new EncryptedMessage(msg)
    };
    MessageFactory.prototype.parseReliableMessage = function (msg) {
        if (!msg['sender'] || !msg['data'] || !msg['signature']) {
            return null
        }
        return new NetworkMessage(msg)
    };
    ns.msg.MessageFactory = MessageFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var ContentProcessor = Interface(null, null);
    ContentProcessor.prototype.process = function (content, rMsg) {
        throw new Error('ContentProcessor::process');
    };
    var Creator = Interface(null, null);
    Creator.prototype.createContentProcessor = function (type) {
        throw new Error('Creator::createContentProcessor');
    };
    Creator.prototype.createCommandProcessor = function (type, cmd) {
        throw new Error('Creator::createCommandProcessor');
    };
    var Factory = Interface(null, null);
    Factory.prototype.getProcessor = function (content) {
        throw new Error('Factory::getProcessor');
    };
    Factory.prototype.getContentProcessor = function (type) {
        throw new Error('Factory::getContentProcessor');
    };
    Factory.prototype.getCommandProcessor = function (type, cmd) {
        throw new Error('Factory::getCommandProcessor');
    };
    ContentProcessor.Creator = Creator;
    ContentProcessor.Factory = Factory;
    ns.cpu.ContentProcessor = ContentProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var ContentProcessorFactory = function (facebook, messenger, creator) {
        TwinsHelper.call(this, facebook, messenger);
        this.__creator = creator;
        this.__content_processors = {}
        this.__command_processors = {}
    };
    Class(ContentProcessorFactory, TwinsHelper, [ContentProcessor.Factory], null);
    ContentProcessorFactory.prototype.getProcessor = function (content) {
        var cpu;
        var type = content.getType();
        if (Interface.conforms(content, Command)) {
            var name = content.getCmd();
            cpu = this.getCommandProcessor(type, name);
            if (cpu) {
                return cpu
            } else if (Interface.conforms(content, GroupCommand)) {
                cpu = this.getCommandProcessor(type, 'group');
                if (cpu) {
                    return cpu
                }
            }
        }
        return this.getContentProcessor(type)
    };
    ContentProcessorFactory.prototype.getContentProcessor = function (type) {
        var cpu = this.__content_processors[type];
        if (!cpu) {
            cpu = this.__creator.createContentProcessor(type);
            if (cpu) {
                this.__content_processors[type] = cpu
            }
        }
        return cpu
    };
    ContentProcessorFactory.prototype.getCommandProcessor = function (type, cmd) {
        var cpu = this.__command_processors[cmd];
        if (!cpu) {
            cpu = this.__creator.createCommandProcessor(type, cmd);
            if (cpu) {
                this.__command_processors[cmd] = cpu
            }
        }
        return cpu
    };
    ns.cpu.ContentProcessorFactory = ContentProcessorFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var BaseContentProcessor = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger)
    };
    Class(BaseContentProcessor, TwinsHelper, [ContentProcessor], {
        process: function (content, rMsg) {
            var text = 'Content not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Content (type: ${type}) not support yet!',
                'replacements': {'type': content.getType()}
            })
        }
    });
    var BaseCommandProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger)
    };
    Class(BaseCommandProcessor, BaseContentProcessor, null, {
        process: function (content, rMsg) {
            var text = 'Command not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Command (name: ${command}) not support yet!',
                'replacements': {'command': content.getCmd()}
            })
        }
    });
    ns.cpu.BaseContentProcessor = BaseContentProcessor;
    ns.cpu.BaseCommandProcessor = BaseCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ForwardContent = ns.protocol.ForwardContent;
    var ArrayContent = ns.protocol.ArrayContent;
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var ForwardContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger)
    };
    Class(ForwardContentProcessor, BaseContentProcessor, null, {
        process: function (content, rMsg) {
            var secrets = content.getSecrets();
            if (!secrets) {
                return null
            }
            var messenger = this.getMessenger();
            var responses = [];
            var res;
            var results;
            for (var i = 0; i < secrets.length; ++i) {
                results = messenger.processReliableMessage(secrets[i]);
                if (!results) {
                    res = ForwardContent.create([])
                } else if (results.length === 1) {
                    res = ForwardContent.create(results[0])
                } else {
                    res = ForwardContent.create(results)
                }
                responses.push(res)
            }
            return responses
        }
    });
    var ArrayContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger)
    };
    Class(ArrayContentProcessor, BaseContentProcessor, null, {
        process: function (content, rMsg) {
            var array = content.getContents();
            if (!array) {
                return null
            }
            var messenger = this.getMessenger();
            var responses = [];
            var res;
            var results;
            for (var i = 0; i < array.length; ++i) {
                results = messenger.processContent(array[i], rMsg);
                if (!results) {
                    res = ArrayContent.create([])
                } else if (results.length === 1) {
                    res = results[0]
                } else {
                    res = ArrayContent.create(results)
                }
                responses.push(res)
            }
            return responses
        }
    });
    ns.cpu.ForwardContentProcessor = ForwardContentProcessor;
    ns.cpu.ArrayContentProcessor = ArrayContentProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var MetaCommand = ns.protocol.MetaCommand;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var MetaCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger)
    };
    Class(MetaCommandProcessor, BaseCommandProcessor, null, {
        process: function (content, rMsg) {
            var identifier = content.getIdentifier();
            if (!identifier) {
                var text = 'Meta command error.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content)
            }
            var meta = content.getMeta();
            if (meta) {
                return this.updateMeta(meta, identifier, content, rMsg.getEnvelope())
            } else {
                return this.queryMeta(identifier, content, rMsg.getEnvelope())
            }
        }, queryMeta: function (identifier, content, envelope) {
            var facebook = this.getFacebook();
            var meta = facebook.getMeta(identifier);
            if (meta) {
                var res = MetaCommand.response(identifier, meta);
                return [res]
            }
            var text = 'Meta not found.';
            return this.respondReceipt(text, envelope, content, {
                'template': 'Meta not found: ${ID}.',
                'replacements': {'ID': identifier.toString()}
            })
        }, updateMeta: function (meta, identifier, content, envelope) {
            var errors = this.saveMeta(meta, identifier, content, envelope);
            if (errors) {
                return errors
            }
            var text = 'Meta received.';
            return this.respondReceipt(text, envelope, content, {
                'template': 'Meta received: ${ID}.',
                'replacements': {'ID': identifier.toString()}
            })
        }, saveMeta: function (meta, identifier, content, envelope) {
            var text;
            if (!this.checkMeta(meta, identifier)) {
                text = 'Meta not valid.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Meta not valid: ${ID}.',
                    'replacements': {'ID': identifier.toString()}
                })
            } else if (!this.getFacebook().saveMeta(meta, identifier)) {
                text = 'Meta not accepted.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Meta not accepted: ${ID}.',
                    'replacements': {'ID': identifier.toString()}
                })
            }
            return null
        }, checkMeta: function (meta, identifier) {
            return meta.isValid() && meta.matchIdentifier(identifier)
        }
    });
    var DocumentCommandProcessor = function (facebook, messenger) {
        MetaCommandProcessor.call(this, facebook, messenger)
    };
    Class(DocumentCommandProcessor, MetaCommandProcessor, null, {
        process: function (content, rMsg) {
            var text;
            var identifier = content.getIdentifier();
            if (!identifier) {
                text = 'Document command error.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content)
            }
            var doc = content.getDocument();
            if (!doc) {
                return this.queryDocument(identifier, content, rMsg.getEnvelope())
            } else if (identifier.equals(doc.getIdentifier())) {
                return this.updateDocument(doc, identifier, content, rMsg.getEnvelope())
            }
            text = 'Document ID not match.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Document ID not match: ${ID}.',
                'replacements': {'ID': identifier.toString()}
            })
        }, queryDocument: function (identifier, content, envelope) {
            var text;
            var docs = this.getFacebook().getDocuments(identifier);
            if (!docs || docs.length === 0) {
                text = 'Document not found.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Document not found: ${ID}.',
                    'replacements': {'ID': identifier.toString()}
                })
            }
            var queryTime = content.getLastTime();
            if (queryTime) {
                var last = DocumentHelper.lastDocument(docs);
                var lastTime = !last ? null : last.getTime();
                if (!lastTime) {
                } else if (lastTime.getTime() > queryTime.getTime()) {
                    text = 'Document not updated.';
                    return this.respondReceipt(text, envelope, content, {
                        'template': 'Document not updated: ${ID}, last time: ${time}.',
                        'replacements': {'ID': identifier.toString(), 'time': lastTime.getTime()}
                    })
                }
            }
            var meta = this.getFacebook().getMeta(identifier);
            var command = DocumentCommand.response(identifier, meta, docs[0]);
            var responses = [command];
            for (var i = 1; i < docs.length; ++i) {
                command = DocumentCommand.response(identifier, null, docs[i]);
                responses.push(command)
            }
            return responses
        }, updateDocument: function (doc, identifier, content, envelope) {
            var errors;
            var meta = content.getMeta();
            var text;
            if (!meta) {
                meta = this.getFacebook().getMeta(identifier);
                if (!meta) {
                    text = 'Meta not found.';
                    return this.respondReceipt(text, envelope, content, {
                        'template': 'Meta not found: ${ID}.',
                        'replacements': {'ID': identifier.toString()}
                    })
                }
            } else {
                errors = this.saveMeta(meta, identifier, content, envelope);
                if (errors) {
                    return errors
                }
            }
            errors = this.saveDocument(doc, meta, identifier, content, envelope);
            if (errors) {
                return errors
            }
            text = 'Document received.';
            return this.respondReceipt(text, envelope, content, {
                'template': 'Document received: ${ID}.',
                'replacements': {'ID': identifier.toString()}
            })
        }, saveDocument: function (doc, meta, identifier, content, envelope) {
            var text;
            if (!this.checkDocument(doc, meta)) {
                text = 'Document not accepted.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Document not accepted: ${ID}.',
                    'replacements': {'ID': identifier.toString()}
                })
            } else if (!this.getFacebook().saveDocument(doc)) {
                text = 'Document not changed.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Document not changed: ${ID}.',
                    'replacements': {'ID': identifier.toString()}
                })
            }
            return null
        }, checkDocument: function (doc, meta) {
            if (doc.isValid()) {
                return true
            }
            return doc.verify(meta.getPublicKey())
        }
    });
    ns.cpu.MetaCommandProcessor = MetaCommandProcessor;
    ns.cpu.DocumentCommandProcessor = DocumentCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var CustomizedContentHandler = Interface(null, null);
    CustomizedContentHandler.prototype.handleAction = function (act, sender, content, rMsg) {
    };
    var CustomizedContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger)
    };
    Class(CustomizedContentProcessor, BaseContentProcessor, [CustomizedContentHandler], {
        process: function (content, rMsg) {
            var app = content.getApplication();
            var res = this.filterApplication(app, content, rMsg);
            if (res) {
                return res
            }
            var mod = content.getModule();
            var handler = this.fetchHandler(mod, content, rMsg);
            if (!handler) {
                return null
            }
            var act = rMsg.getAction();
            var sender = rMsg.getSender();
            return handler.handleAction(act, sender, content, rMsg)
        }, filterApplication: function (app, content, rMsg) {
            var text = 'Content not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Customized content (app: ${app}) not support yet!',
                'replacements': {'app': app}
            })
        }, fetchHandler: function (mod, content, rMsg) {
            return this
        }, handleAction: function (act, sender, content, rMsg) {
            var app = content.getApplication();
            var mod = content.getModule();
            var text = 'Content not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Customized content (app: ${app}, mod: ${mod}, act: ${act}) not support yet!',
                'replacements': {'app': app, 'mod': mod, 'act': act}
            })
        }
    });
    ns.cpu.CustomizedContentHandler = CustomizedContentHandler;
    ns.cpu.CustomizedContentProcessor = CustomizedContentProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var ContentProcessorCreator = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger)
    };
    Class(ContentProcessorCreator, TwinsHelper, [ContentProcessor.Creator], {
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (ContentType.FORWARD.equals(type)) {
                return new ns.cpu.ForwardContentProcessor(facebook, messenger)
            }
            if (ContentType.ARRAY.equals(type)) {
                return new ns.cpu.ArrayContentProcessor(facebook, messenger)
            }
            if (ContentType.COMMAND.equals(type)) {
                return new ns.cpu.BaseCommandProcessor(facebook, messenger)
            }
            return null
        }, createCommandProcessor: function (type, cmd) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (cmd === Command.META) {
                return new ns.cpu.MetaCommandProcessor(facebook, messenger)
            } else if (cmd === Command.DOCUMENT) {
                return new ns.cpu.DocumentCommandProcessor(facebook, messenger)
            }
            return null
        }
    });
    ns.cpu.ContentProcessorCreator = ContentProcessorCreator
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var KEYWORDS = ["all", "everyone", "anyone", "owner", "founder", "dkd", "mkm", "dimp", "dim", "dimt", "rsa", "ecc", "aes", "des", "btc", "eth", "crypto", "key", "symmetric", "asymmetric", "public", "private", "secret", "password", "id", "address", "meta", "profile", "document", "entity", "user", "group", "contact", "member", "admin", "administrator", "assistant", "main", "polylogue", "chatroom", "social", "organization", "company", "school", "government", "department", "provider", "station", "thing", "bot", "robot", "message", "instant", "secure", "reliable", "envelope", "sender", "receiver", "time", "content", "forward", "command", "history", "keys", "data", "signature", "type", "serial", "sn", "text", "file", "image", "audio", "video", "page", "handshake", "receipt", "block", "mute", "register", "suicide", "found", "abdicate", "invite", "expel", "join", "quit", "reset", "query", "hire", "fire", "resign", "server", "client", "terminal", "local", "remote", "barrack", "cache", "transceiver", "ans", "facebook", "store", "messenger", "root", "supervisor"];
    var AddressNameService = Interface(null, null);
    AddressNameService.KEYWORDS = KEYWORDS;
    AddressNameService.prototype.isReserved = function (name) {
        throw new Error('AddressNameService::isReserved: ' + name);
    };
    AddressNameService.prototype.getIdentifier = function (name) {
        throw new Error('AddressNameService::getIdentifier: ' + name);
    };
    AddressNameService.prototype.getNames = function (identifier) {
        throw new Error('AddressNameService::getNames: ' + identifier);
    };
    ns.AddressNameService = AddressNameService
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Entity = ns.mkm.Entity;
    var FrequencyChecker = ns.utils.FrequencyChecker;
    var RecentTimeChecker = ns.utils.RecentTimeChecker;
    var Archivist = function (lifeSpan) {
        Object.call(this);
        this.__metaQueries = new FrequencyChecker(lifeSpan);
        this.__docsQueries = new FrequencyChecker(lifeSpan);
        this.__membersQueries = new FrequencyChecker(lifeSpan);
        this.__lastDocumentTimes = new RecentTimeChecker();
        this.__lastHistoryTimes = new RecentTimeChecker()
    };
    Class(Archivist, Object, [Entity.DataSource], null);
    Archivist.kQueryExpires = 600.0;
    Archivist.prototype.isMetaQueryExpired = function (identifier) {
        return this.__metaQueries.isExpired(identifier)
    };
    Archivist.prototype.isDocumentQueryExpired = function (identifier) {
        return this.__docsQueries.isExpired(identifier)
    };
    Archivist.prototype.isMembersQueryExpired = function (identifier) {
        return this.__membersQueries.isExpired(identifier)
    };
    Archivist.prototype.needsQueryMeta = function (identifier, meta) {
        if (identifier.isBroadcast()) {
            return false
        } else if (!meta) {
            return true
        }
        return false
    };
    Archivist.prototype.setLastDocumentTime = function (identifier, lastTime) {
        return this.__lastDocumentTimes.setLastTime(identifier, lastTime)
    };
    Archivist.prototype.needsQueryDocuments = function (identifier, docs) {
        if (identifier.isBroadcast()) {
            return false
        } else if (!docs || docs.length === 0) {
            return true
        }
        var currentTime = this.getLastDocumentTime(identifier, docs);
        return this.__lastDocumentTimes.isExpired(identifier, currentTime)
    };
    Archivist.prototype.getLastDocumentTime = function (identifier, docs) {
        if (!docs || docs.length === 0) {
            return null
        }
        var docTime, lastTime = null;
        for (var i = 0; i < docs.length; ++i) {
            docTime = docs[i].getTime();
            if (!docTime) {
            } else if (!lastTime || lastTime.getTime() < docTime.getTime()) {
                lastTime = docTime
            }
        }
        return lastTime
    };
    Archivist.prototype.setLastGroupHistoryTime = function (identifier, lastTime) {
        return this.__lastHistoryTimes.setLastTime(identifier, lastTime)
    };
    Archivist.prototype.needsQueryMembers = function (identifier, members) {
        if (identifier.isBroadcast()) {
            return false
        } else if (!members || members.length === 0) {
            return true
        }
        var currentTime = this.getLastGroupHistoryTime(identifier);
        return this.__lastHistoryTimes.isExpired(identifier, currentTime)
    };
    Archivist.prototype.getLastGroupHistoryTime = function (identifier) {
        throw new Error('Archivist::getLastGroupHistoryTime: ' + identifier);
    };
    Archivist.prototype.checkMeta = function (identifier, meta) {
        if (this.needsQueryMeta(identifier, meta)) {
            return this.queryMeta(identifier)
        } else {
            return false
        }
    };
    Archivist.prototype.checkDocuments = function (identifier, docs) {
        if (this.needsQueryDocuments(identifier, docs)) {
            return this.queryDocuments(identifier, docs)
        } else {
            return false
        }
    };
    Archivist.prototype.checkMembers = function (identifier, members) {
        if (this.needsQueryMembers(identifier, members)) {
            if (!this.isMembersQueryExpired(identifier)) {
                return false
            }
            return this.queryMembers(identifier, members)
        } else {
            return false
        }
    };
    Archivist.prototype.queryMeta = function (identifier) {
        throw new Error('Archivist::queryMeta: ' + identifier);
    };
    Archivist.prototype.queryDocuments = function (identifier, docs) {
        throw new Error('Archivist::queryMeta: ' + identifier + ', ' + docs);
    };
    Archivist.prototype.queryMembers = function (identifier, members) {
        throw new Error('Archivist::queryMeta: ' + identifier + ', ' + members);
    };
    Archivist.prototype.saveMeta = function (meta, identifier) {
        throw new Error('Archivist::saveMeta: ' + identifier + ', ' + meta);
    };
    Archivist.prototype.saveDocument = function (doc) {
        throw new Error('Archivist::saveDocument: ' + doc);
    };
    ns.Archivist = Archivist
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var getDestination = function (receiver, group) {
        if (!group && receiver.isGroup()) {
            group = receiver
        }
        if (!group) {
            return receiver
        }
        if (group.isBroadcast()) {
            return group
        } else if (receiver.isBroadcast()) {
            return receiver
        } else {
            return group
        }
    };
    var CipherKeyDelegate = Interface(null, null);
    CipherKeyDelegate.getDestinationForMessage = function (msg) {
        var group = ID.parse(msg.getValue('group'));
        return getDestination(msg.getReceiver(), group)
    };
    CipherKeyDelegate.getDestination = getDestination;
    CipherKeyDelegate.prototype.getCipherKey = function (sender, receiver, generate) {
    };
    CipherKeyDelegate.prototype.cacheCipherKey = function (sender, receiver, key) {
    };
    ns.CipherKeyDelegate = CipherKeyDelegate
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var EntityType = ns.protocol.EntityType;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var BaseUser = ns.mkm.BaseUser;
    var BaseGroup = ns.mkm.BaseGroup;
    var Bot = ns.mkm.Bot;
    var Station = ns.mkm.Station;
    var ServiceProvider = ns.mkm.ServiceProvider;
    var Barrack = ns.Barrack;
    var Facebook = function () {
        Barrack.call(this)
    };
    Class(Facebook, Barrack, null, {
        getArchivist: function () {
            throw new Error('Facebook::getArchivist');
        }, createUser: function (identifier) {
            if (!identifier.isBroadcast()) {
                var pKey = this.getPublicKeyForEncryption(identifier);
                if (!pKey) {
                    return null
                }
            }
            var network = identifier.getType();
            if (EntityType.STATION.equals(network)) {
                return new Station(identifier)
            } else if (EntityType.BOT.equals(network)) {
                return new Bot(identifier)
            }
            return new BaseUser(identifier)
        }, createGroup: function (identifier) {
            if (!identifier.isBroadcast()) {
                var members = this.getMembers(identifier);
                if (!members || members.length === 0) {
                    return null
                }
            }
            var network = identifier.getType();
            if (EntityType.ISP.equals(network)) {
                return new ServiceProvider(identifier)
            }
            return new BaseGroup(identifier)
        }, getLocalUsers: function () {
            throw new Error('Facebook::getLocalUsers');
        }, selectLocalUser: function (receiver) {
            var users = this.getLocalUsers();
            if (!users || users.length === 0) {
                throw new Error("local users should not be empty");
            } else if (receiver.isBroadcast()) {
                return users[0]
            }
            var i, user, uid;
            if (receiver.isGroup()) {
                var members = this.getMembers(receiver);
                if (!members || members.length === 0) {
                    return null
                }
                var j, member;
                for (i = 0; i < users.length; ++i) {
                    user = users[i];
                    uid = user.getIdentifier();
                    for (j = 0; j < members.length; ++j) {
                        member = members[j];
                        if (member.equals(uid)) {
                            return user
                        }
                    }
                }
            } else {
                for (i = 0; i < users.length; ++i) {
                    user = users[i];
                    uid = user.getIdentifier();
                    if (receiver.equals(uid)) {
                        return user
                    }
                }
            }
            return null
        }, saveMeta: function (meta, identifier) {
            if (meta.isValid() && meta.matchIdentifier(identifier)) {
            } else {
                return false
            }
            var old = this.getMeta(identifier);
            if (old) {
                return true
            }
            var archivist = this.getArchivist();
            return archivist.saveMeta(meta, identifier)
        }, saveDocument: function (doc) {
            var identifier = doc.getIdentifier();
            if (!identifier) {
                return false
            }
            if (!doc.isValid()) {
                var meta = this.getMeta(identifier);
                if (!meta) {
                    return false
                } else if (doc.verify(meta.getPublicKey())) {
                } else {
                    return false
                }
            }
            var type = doc.getType();
            if (!type) {
                type = '*'
            }
            var documents = this.getDocuments(identifier);
            var old = DocumentHelper.lastDocument(documents, type);
            if (old && DocumentHelper.isExpired(doc, old)) {
                return false
            }
            var archivist = this.getArchivist();
            return archivist.saveDocument(doc)
        }, getMeta: function (identifier) {
            var archivist = this.getArchivist();
            var meta = archivist.getMeta(identifier);
            archivist.checkMeta(identifier, meta);
            return meta
        }, getDocuments: function (identifier) {
            var archivist = this.getArchivist();
            var docs = archivist.getDocuments(identifier);
            archivist.checkDocuments(identifier, docs);
            return docs
        }
    });
    ns.Facebook = Facebook
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var InstantMessagePacker = ns.msg.InstantMessagePacker;
    var SecureMessagePacker = ns.msg.SecureMessagePacker;
    var ReliableMessagePacker = ns.msg.ReliableMessagePacker
    var MessageHelper = ns.msg.MessageHelper;
    var TwinsHelper = ns.TwinsHelper;
    var Packer = ns.Packer;
    var MessagePacker = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
        this.instantPacker = new InstantMessagePacker(messenger);
        this.securePacker = new SecureMessagePacker(messenger);
        this.reliablePacker = new ReliableMessagePacker(messenger)
    };
    Class(MessagePacker, TwinsHelper, [Packer], {
        encryptMessage: function (iMsg) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            var sMsg;
            var receiver = iMsg.getReceiver();
            var password = messenger.getEncryptKey(iMsg);
            if (receiver.isGroup()) {
                var members = facebook.getMembers(receiver);
                sMsg = this.instantPacker.encryptMessage(iMsg, password, members)
            } else {
                sMsg = this.instantPacker.encryptMessage(iMsg, password, null)
            }
            if (sMsg == null) {
                return null
            }
            sMsg.getEnvelope().setType(iMsg.getContent().getType());
            return sMsg
        }, signMessage: function (sMsg) {
            return this.securePacker.signMessage(sMsg)
        }, serializeMessage: function (rMsg) {
            var dict = rMsg.toMap();
            var json = ns.format.JSON.encode(dict);
            return ns.format.UTF8.encode(json)
        }, deserializeMessage: function (data) {
            var json = ns.format.UTF8.decode(data);
            if (!json) {
                return null
            }
            var dict = ns.format.JSON.decode(json);
            return ReliableMessage.parse(dict)
        }, checkAttachments: function (rMsg) {
            var sender = rMsg.getSender();
            var facebook = this.getFacebook();
            var meta = MessageHelper.getMeta(rMsg);
            if (meta) {
                facebook.saveMeta(meta, sender)
            }
            var visa = MessageHelper.getVisa(rMsg);
            if (visa) {
                facebook.saveDocument(visa)
            }
            return true
        }, verifyMessage: function (rMsg) {
            if (this.checkAttachments(rMsg)) {
            } else {
                return null
            }
            return this.reliablePacker.verifyMessage(rMsg)
        }, decryptMessage: function (sMsg) {
            var receiver = sMsg.getReceiver();
            var facebook = this.getFacebook();
            var user = facebook.selectLocalUser(receiver);
            if (user == null) {
                throw new ReferenceError('receiver error: $receiver, from ${sMsg.sender}, ${sMsg.group}');
            }
            return this.securePacker.decryptMessage(sMsg, user.getIdentifier());
        }
    });
    ns.MessagePacker = MessagePacker;
})(DIMP);
;(function (ns) {
    'use strict';
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
        }, createCreator: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.cpu.ContentProcessorCreator(facebook, messenger);
        }, getProcessor: function (content) {
            return this.__factory.getProcessor(content);
        }, getContentProcessor: function (type) {
            return this.__factory.getContentProcessor(type);
        }, getCommandProcessor: function (type, cmd) {
            return this.__factory.getCommandProcessor(type, cmd);
        }, processPackage: function (data) {
            var messenger = this.getMessenger();
            var rMsg = messenger.deserializeMessage(data);
            if (!rMsg) {
                return [];
            }
            var responses = messenger.processReliableMessage(rMsg);
            if (!responses || responses.length === 0) {
                return [];
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
        }, processReliableMessage: function (rMsg) {
            var messenger = this.getMessenger();
            var sMsg = messenger.verifyMessage(rMsg);
            if (!sMsg) {
                return [];
            }
            var responses = messenger.processSecureMessage(sMsg, rMsg);
            if (!responses || responses.length === 0) {
                return [];
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
        }, processSecureMessage: function (sMsg, rMsg) {
            var messenger = this.getMessenger();
            var iMsg = messenger.decryptMessage(sMsg);
            if (!iMsg) {
                return [];
            }
            var responses = messenger.processInstantMessage(iMsg, rMsg);
            if (!responses || responses.length === 0) {
                return [];
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
        }, processInstantMessage: function (iMsg, rMsg) {
            var messenger = this.getMessenger();
            var responses = messenger.processContent(iMsg.getContent(), rMsg);
            if (!responses || responses.length === 0) {
                return [];
            }
            var sender = iMsg.getSender();
            var receiver = iMsg.getReceiver();
            var facebook = this.getFacebook();
            var user = facebook.selectLocalUser(receiver);
            if (!user) {
                return [];
            }
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
        }, processContent: function (content, rMsg) {
            var cpu = this.getProcessor(content);
            if (!cpu) {
                cpu = this.getContentProcessor(0);
            }
            return cpu.process(content, rMsg);
        }
    });
    ns.MessageProcessor = MessageProcessor;
})(DIMP);
;(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Packer = ns.Packer;
    var Processor = ns.Processor;
    var CipherKeyDelegate = ns.CipherKeyDelegate;
    var Transceiver = ns.Transceiver;
    var Messenger = function () {
        Transceiver.call(this);
    };
    Class(Messenger, Transceiver, [Packer, Processor], null);
    Messenger.prototype.getCipherKeyDelegate = function () {
        throw new Error('Messenger::getCipherKeyDelegate');
    };
    Messenger.prototype.getPacker = function () {
        throw new Error('Messenger::getPacker');
    };
    Messenger.prototype.getProcessor = function () {
        throw new Error('Messenger::getProcessor');
    };
    Messenger.prototype.getEncryptKey = function (iMsg) {
        var sender = iMsg.getSender();
        var target = CipherKeyDelegate.getDestinationForMessage(iMsg);
        var delegate = this.getCipherKeyDelegate();
        return delegate.getCipherKey(sender, target, true);
    };
    Messenger.prototype.getDecryptKey = function (sMsg) {
        var sender = sMsg.getSender();
        var target = CipherKeyDelegate.getDestinationForMessage(sMsg);
        var delegate = this.getCipherKeyDelegate();
        return delegate.getCipherKey(sender, target, false);
    };
    Messenger.prototype.cacheDecryptKey = function (key, sMsg) {
        var sender = sMsg.getSender();
        var target = CipherKeyDelegate.getDestinationForMessage(sMsg);
        var delegate = this.getCipherKeyDelegate();
        return delegate.cacheCipherKey(sender, target, key);
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
    Messenger.prototype.deserializeKey = function (data, sMsg) {
        if (!data) {
            return this.getDecryptKey(sMsg);
        }
        return Transceiver.prototype.deserializeKey.call(this, data, sMsg);
    };
    Messenger.prototype.deserializeContent = function (data, pwd, sMsg) {
        var content = Transceiver.prototype.deserializeContent.call(this, data, pwd, sMsg);
        if (!content) {
        } else {
            this.cacheDecryptKey(pwd, sMsg);
        }
        return content;
    };
    ns.Messenger = Messenger;
})(DIMP);
;(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Content = ns.protocol.Content;
    var Command = ns.protocol.Command;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseHistoryCommand = ns.dkd.cmd.BaseHistoryCommand;
    var BaseGroupCommand = ns.dkd.cmd.BaseGroupCommand;
    var ContentParser = function (clazz) {
        Object.call(this);
        this.__class = clazz;
    };
    Class(ContentParser, Object, [Content.Factory], null);
    ContentParser.prototype.parseContent = function (content) {
        return new this.__class(content);
    };
    var CommandParser = function (clazz) {
        Object.call(this);
        this.__class = clazz;
    };
    Class(CommandParser, Object, [Command.Factory], null);
    CommandParser.prototype.parseCommand = function (content) {
        return new this.__class(content);
    };
    var GeneralCommandFactory = function () {
        Object.call(this);
    };
    Class(GeneralCommandFactory, Object, [Content.Factory, Command.Factory], null);
    var general_factory = function () {
        var man = ns.dkd.cmd.CommandFactoryManager;
        return man.generalFactory;
    };
    GeneralCommandFactory.prototype.parseContent = function (content) {
        var gf = general_factory();
        var cmd = gf.getCmd(content, '*');
        var factory = gf.getCommandFactory(cmd);
        if (!factory) {
            if (content['group']) {
                factory = gf.getCommandFactory('group');
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
        var cmd = gf.getCmd(content, '*');
        var factory = gf.getCommandFactory(cmd);
        if (!factory) {
            factory = this;
        }
        return factory.parseCommand(content);
    };
    GroupCommandFactory.prototype.parseCommand = function (cmd) {
        return new BaseGroupCommand(cmd);
    };
    ns.ContentParser = ContentParser;
    ns.CommandParser = CommandParser;
    ns.GeneralCommandFactory = GeneralCommandFactory;
    ns.HistoryCommandFactory = HistoryCommandFactory;
    ns.GroupCommandFactory = GroupCommandFactory;
})(DIMP);
(function (ns) {
    'use strict';
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var MessageFactory = ns.msg.MessageFactory;
    var ContentParser = ns.ContentParser;
    var CommandParser = ns.CommandParser;
    var GeneralCommandFactory = ns.GeneralCommandFactory;
    var HistoryCommandFactory = ns.HistoryCommandFactory;
    var GroupCommandFactory = ns.GroupCommandFactory;
    var registerMessageFactories = function () {
        var factory = new MessageFactory();
        Envelope.setFactory(factory);
        InstantMessage.setFactory(factory);
        SecureMessage.setFactory(factory);
        ReliableMessage.setFactory(factory);
    };
    var registerContentFactories = function () {
        Content.setFactory(ContentType.TEXT, new ContentParser(ns.dkd.BaseTextContent));
        Content.setFactory(ContentType.FILE, new ContentParser(ns.dkd.BaseFileContent));
        Content.setFactory(ContentType.IMAGE, new ContentParser(ns.dkd.ImageFileContent));
        Content.setFactory(ContentType.AUDIO, new ContentParser(ns.dkd.AudioFileContent));
        Content.setFactory(ContentType.VIDEO, new ContentParser(ns.dkd.VideoFileContent));
        Content.setFactory(ContentType.PAGE, new ContentParser(ns.dkd.WebPageContent));
        Content.setFactory(ContentType.NAME_CARD, new ContentParser(ns.dkd.NameCardContent));
        Content.setFactory(ContentType.MONEY, new ContentParser(ns.dkd.BaseMoneyContent));
        Content.setFactory(ContentType.TRANSFER, new ContentParser(ns.dkd.TransferMoneyContent));
        Content.setFactory(ContentType.COMMAND, new GeneralCommandFactory());
        Content.setFactory(ContentType.HISTORY, new HistoryCommandFactory());
        Content.setFactory(ContentType.ARRAY, new ContentParser(ns.dkd.ListContent));
        Content.setFactory(ContentType.FORWARD, new ContentParser(ns.dkd.SecretContent));
        Content.setFactory(0, new ContentParser(ns.dkd.BaseContent));
    };
    var registerCommandFactories = function () {
        Command.setFactory(Command.META, new CommandParser(ns.dkd.cmd.BaseMetaCommand));
        Command.setFactory(Command.DOCUMENT, new CommandParser(ns.dkd.cmd.BaseDocumentCommand));
        Command.setFactory(Command.RECEIPT, new CommandParser(ns.dkd.cmd.BaseReceiptCommand));
        Command.setFactory('group', new GroupCommandFactory());
        Command.setFactory(GroupCommand.INVITE, new CommandParser(ns.dkd.cmd.InviteGroupCommand));
        Command.setFactory(GroupCommand.EXPEL, new CommandParser(ns.dkd.cmd.ExpelGroupCommand));
        Command.setFactory(GroupCommand.JOIN, new CommandParser(ns.dkd.cmd.JoinGroupCommand));
        Command.setFactory(GroupCommand.QUIT, new CommandParser(ns.dkd.cmd.QuitGroupCommand));
        Command.setFactory(GroupCommand.QUERY, new CommandParser(ns.dkd.cmd.QueryGroupCommand));
        Command.setFactory(GroupCommand.RESET, new CommandParser(ns.dkd.cmd.ResetGroupCommand));
        Command.setFactory(GroupCommand.HIRE, new CommandParser(ns.dkd.cmd.HireGroupCommand));
        Command.setFactory(GroupCommand.FIRE, new CommandParser(ns.dkd.cmd.FireGroupCommand));
        Command.setFactory(GroupCommand.RESIGN, new CommandParser(ns.dkd.cmd.ResignGroupCommand))
    };
    var registerAllFactories = function () {
        registerMessageFactories();
        registerContentFactories();
        registerCommandFactories();
        Content.setFactory(ContentType.CUSTOMIZED, new ContentParser(ns.dkd.AppCustomizedContent));
        Content.setFactory(ContentType.APPLICATION, new ContentParser(ns.dkd.AppCustomizedContent))
    };
    ns.registerMessageFactories = registerMessageFactories;
    ns.registerContentFactories = registerContentFactories;
    ns.registerCommandFactories = registerCommandFactories;
    ns.registerAllFactories = registerAllFactories
})(DIMP);
;
if (typeof FiniteStateMachine !== 'object') {
    FiniteStateMachine = {}
}
(function (ns) {
    'use strict';
    if (typeof ns.skywalker !== 'object') {
        ns.skywalker = {}
    }
    if (typeof ns.threading !== 'object') {
        ns.threading = {}
    }
})(FiniteStateMachine);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Runnable = Interface(null, null);
    Runnable.prototype.run = function () {
    };
    ns.skywalker.Runnable = Runnable
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Handler = Interface(null, null);
    Handler.prototype.setup = function () {
    };
    Handler.prototype.handle = function () {
    };
    Handler.prototype.finish = function () {
    };
    ns.skywalker.Handler = Handler
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Processor = Interface(null, null);
    Processor.prototype.process = function () {
    };
    ns.skywalker.Processor = Processor
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
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
        this.__stage = STAGE_INIT
    };
    Class(Runner, Object, [Runnable, Handler, Processor], {
        run: function () {
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
                } catch (e) {
                }
                this.__stage = STAGE_CLEANING
            }
            if (this.__stage === STAGE_CLEANING) {
                if (this.finish()) {
                    return true
                }
                this.__stage = STAGE_STOPPED
            }
            return false
        }, setup: function () {
            this.__running = true;
            return false
        }, handle: function () {
            while (this.isRunning()) {
                if (this.process()) {
                } else {
                    return true
                }
            }
            return false
        }, finish: function () {
            return false
        }
    });
    Runner.prototype.isRunning = function () {
        return this.__running
    };
    Runner.prototype.stop = function () {
        this.__running = false
    };
    ns.skywalker.Runner = Runner
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var Runnable = ns.skywalker.Runnable;
    var Thread = function () {
        Object.call(this);
        if (arguments.length === 0) {
            this.__target = null
        } else {
            this.__target = arguments[0]
        }
        this.__running = false
    };
    Class(Thread, Object, [Runnable], null);
    Thread.INTERVAL = 256;
    Thread.prototype.start = function () {
        this.__running = true;
        run(this)
    };
    var run = function (thread) {
        var running = thread.isRunning() && thread.run();
        if (running) {
            setTimeout(function () {
                run(thread)
            }, Thread.INTERVAL)
        }
    };
    Thread.prototype.isRunning = function () {
        return this.__running
    };
    Thread.prototype.run = function () {
        var target = this.__target;
        if (!target || target === this) {
            throw new SyntaxError('Thread::run() > override me!');
        } else if (typeof target === 'function') {
            return target()
        } else if (Interface.conforms(target, Runnable)) {
            return target.run()
        } else {
            throw new SyntaxError('Thread::run() > target is not runnable: ' + target);
        }
    };
    Thread.prototype.stop = function () {
        this.__running = false
    };
    ns.threading.Thread = Thread
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var IObject = sys.type.Object;
    var Ticker = Interface(null, [IObject]);
    Ticker.prototype.tick = function (now, elapsed) {
    };
    ns.threading.Ticker = Ticker
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var HashSet = sys.type.HashSet;
    var Runner = ns.skywalker.Runner;
    var Thread = ns.threading.Thread;
    var Metronome = function (millis) {
        Runner.call(this);
        if (millis < Metronome.MIN_INTERVAL) {
            millis = Metronome.MIN_INTERVAL
        }
        this.__interval = millis;
        this.__last_time = 0;
        this.__thread = new Thread(this);
        this.__tickers = new HashSet()
    };
    Class(Metronome, Runner, null, null);
    Metronome.MIN_INTERVAL = 100;
    Metronome.prototype.start = function () {
        this.__thread.start()
    };
    Metronome.prototype.stop = function () {
        this.__thread.stop()
    };
    Metronome.prototype.setup = function () {
        this.__last_time = (new Date()).getTime();
        return Runner.prototype.setup.call(this)
    };
    Metronome.prototype.process = function () {
        var tickers = this.getTickers();
        if (tickers.length === 0) {
            return false
        }
        var now = new Date();
        var elapsed = now.getTime() - this.__last_time;
        if (elapsed < this.__interval) {
            return false
        }
        for (var i = tickers.length - 1; i >= 0; --i) {
            try {
                tickers[i].tick(now, elapsed)
            } catch (e) {
            }
        }
        this.__last_time = now.getTime();
        return true
    };
    Metronome.prototype.getTickers = function () {
        return this.__tickers.toArray()
    };
    Metronome.prototype.addTicker = function (ticker) {
        return this.__tickers.add(ticker)
    };
    Metronome.prototype.removeTicker = function (ticker) {
        return this.__tickers.remove(ticker)
    };
    var PrimeMetronome = {
        addTicker: function (ticker) {
            var metronome = this.getInstance();
            return metronome.addTicker(ticker)
        }, removeTicker: function (ticker) {
            var metronome = this.getInstance();
            return metronome.removeTicker(ticker)
        }, getInstance: function () {
            var metronome = this.__sharedMetronome;
            if (metronome === null) {
                metronome = new Metronome(200);
                metronome.start();
                this.__sharedMetronome = metronome
            }
            return metronome
        }, __sharedMetronome: null
    };
    ns.threading.Metronome = Metronome;
    ns.threading.PrimeMetronome = PrimeMetronome
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    "use strict";
    var Interface = sys.type.Interface;
    var Ticker = ns.threading.Ticker;
    var Context = Interface(null, null);
    var Transition = Interface(null, null);
    Transition.prototype.evaluate = function (ctx, now) {
    };
    var State = Interface(null, null);
    State.prototype.evaluate = function (ctx, now) {
    };
    State.prototype.onEnter = function (previous, ctx, now) {
    };
    State.prototype.onExit = function (next, ctx, now) {
    };
    State.prototype.onPause = function (ctx, now) {
    };
    State.prototype.onResume = function (ctx, now) {
    };
    var Delegate = Interface(null, null);
    Delegate.prototype.enterState = function (next, ctx, now) {
    };
    Delegate.prototype.exitState = function (previous, ctx, now) {
    };
    Delegate.prototype.pauseState = function (current, ctx, now) {
    };
    Delegate.prototype.resumeState = function (current, ctx, now) {
    };
    var Machine = Interface(null, [Ticker]);
    Machine.prototype.getCurrentState = function () {
    };
    Machine.prototype.start = function () {
    };
    Machine.prototype.stop = function () {
    };
    Machine.prototype.pause = function () {
    };
    Machine.prototype.resume = function () {
    };
    ns.Context = Context;
    ns.Transition = Transition;
    ns.State = State;
    ns.Delegate = Delegate;
    ns.Machine = Machine
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Enum = sys.type.Enum;
    var BaseObject = sys.type.BaseObject;
    var Transition = ns.Transition;
    var State = ns.State;
    var Machine = ns.Machine;
    var BaseTransition = function (target) {
        Object.call(this);
        this.__target = target
    };
    Class(BaseTransition, Object, [Transition], null);
    BaseTransition.prototype.getTarget = function () {
        return this.__target
    };
    var BaseState = function (index) {
        BaseObject.call(this);
        this.__index = index;
        this.__transitions = []
    };
    Class(BaseState, BaseObject, [State], null);
    BaseState.prototype.equals = function (other) {
        if (other instanceof BaseState) {
            if (other === this) {
                return true
            }
            other = other.getIndex()
        } else if (Enum.isEnum(other)) {
            other = other.getValue()
        }
        return this.__index === other
    };
    BaseState.prototype.toString = function () {
        var clazz = Object.getPrototypeOf(this).constructor.name;
        var index = this.getIndex();
        return '<' + clazz + ' index=' + index + ' />'
    };
    BaseState.prototype.valueOf = function () {
        return this.__index
    };
    BaseState.prototype.getIndex = function () {
        return this.__index
    };
    BaseState.prototype.addTransition = function (transition) {
        if (this.__transitions.indexOf(transition) >= 0) {
            throw new ReferenceError('transition exists: ' + transition);
        }
        this.__transitions.push(transition)
    };
    BaseState.prototype.evaluate = function (ctx, now) {
        var transition;
        for (var index = 0; index < this.__transitions.length; ++index) {
            transition = this.__transitions[index];
            if (transition.evaluate(ctx, now)) {
                return transition
            }
        }
    };
    var Status = Enum('MachineStatus', {STOPPED: 0, RUNNING: 1, PAUSED: 2});
    var BaseMachine = function () {
        BaseObject.call(this);
        this.__states = [];
        this.__current = -1;
        this.__status = Status.STOPPED;
        this.__delegate = null
    };
    Class(BaseMachine, BaseObject, [Machine], null);
    BaseMachine.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate
    };
    BaseMachine.prototype.getDelegate = function () {
        return this.__delegate
    };
    BaseMachine.prototype.getContext = function () {
    };
    BaseMachine.prototype.addState = function (newState) {
        var index = newState.getIndex();
        if (index < this.__states.length) {
            var old = this.__states[index];
            this.__states[index] = newState;
            return old
        }
        var spaces = index - this.__states.length;
        for (var i = 0; i < spaces; ++i) {
            this.__states.push(null)
        }
        this.__states.push(newState);
        return null
    };
    BaseMachine.prototype.getState = function (index) {
        return this.__states[index]
    };
    BaseMachine.prototype.getDefaultState = function () {
        if (this.__states.length === 0) {
            throw new ReferenceError('states empty');
        }
        return this.__states[0]
    };
    BaseMachine.prototype.getTargetState = function (transition) {
        var index = transition.getTarget();
        return this.__states[index]
    };
    BaseMachine.prototype.getCurrentState = function () {
        var index = this.__current;
        return index < 0 ? null : this.__states[index]
    };
    BaseMachine.prototype.setCurrentState = function (state) {
        this.__current = !state ? -1 : state.getIndex()
    };
    BaseMachine.prototype.changeState = function (newState, now) {
        var oldState = this.getCurrentState();
        if (!oldState) {
            if (!newState) {
                return false
            }
        } else if (oldState === newState) {
            return false
        }
        var ctx = this.getContext();
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.enterState(newState, ctx, now)
        }
        if (oldState) {
            oldState.onExit(newState, ctx, now)
        }
        this.setCurrentState(newState);
        if (newState) {
            newState.onEnter(oldState, ctx, now)
        }
        if (delegate) {
            delegate.exitState(oldState, ctx, now)
        }
        return true
    };
    BaseMachine.prototype.start = function () {
        var now = new Date();
        this.changeState(this.getDefaultState(), now);
        this.__status = Status.RUNNING
    };
    BaseMachine.prototype.stop = function () {
        this.__status = Status.STOPPED;
        var now = new Date();
        this.changeState(null, now)
    };
    BaseMachine.prototype.pause = function () {
        var now = new Date();
        var ctx = this.getContext();
        var current = this.getCurrentState();
        if (current) {
            current.onPause(ctx, now)
        }
        this.__status = Status.PAUSED;
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.pauseState(current, ctx, now)
        }
    };
    BaseMachine.prototype.resume = function () {
        var now = new Date();
        var ctx = this.getContext();
        var current = this.getCurrentState();
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.resumeState(current, ctx, now)
        }
        this.__status = Status.RUNNING;
        if (current) {
            current.onResume(ctx, now)
        }
    };
    BaseMachine.prototype.tick = function (now, elapsed) {
        var machine = this.getContext();
        var current = this.getCurrentState();
        if (current && Status.RUNNING.equals(this.__status)) {
            var transition = current.evaluate(machine, now);
            if (transition) {
                var next = this.getTargetState(transition);
                this.changeState(next, now)
            }
        }
    };
    ns.BaseTransition = BaseTransition;
    ns.BaseState = BaseState;
    ns.BaseMachine = BaseMachine
})(FiniteStateMachine, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var PrimeMetronome = ns.threading.PrimeMetronome;
    var BaseMachine = ns.BaseMachine;
    var AutoMachine = function () {
        BaseMachine.call(this)
    };
    Class(AutoMachine, BaseMachine, null, {
        start: function () {
            BaseMachine.prototype.start.call(this);
            var timer = PrimeMetronome.getInstance();
            timer.addTicker(this)
        }, stop: function () {
            var timer = PrimeMetronome.getInstance();
            timer.removeTicker(this);
            BaseMachine.prototype.stop.call(this)
        }, pause: function () {
            var timer = PrimeMetronome.getInstance();
            timer.removeTicker(this);
            BaseMachine.prototype.pause.call(this)
        }, resume: function () {
            BaseMachine.prototype.resume.call(this);
            var timer = PrimeMetronome.getInstance();
            timer.addTicker(this)
        }
    });
    ns.AutoMachine = AutoMachine
})(FiniteStateMachine, MONKEY);
;
if (typeof StarTrek !== 'object') {
    StarTrek = {}
}
(function (ns) {
    'use strict';
    if (typeof ns.type !== 'object') {
        ns.type = {}
    }
    if (typeof ns.net !== 'object') {
        ns.net = {}
    }
    if (typeof ns.port !== 'object') {
        ns.port = {}
    }
    if (typeof ns.socket !== 'object') {
        ns.socket = {}
    }
})(StarTrek);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var Stringer = sys.type.Stringer;
    var ConstantString = sys.type.ConstantString;
    var SocketAddress = Interface(null, [Stringer]);
    SocketAddress.prototype.getHost = function () {
    };
    SocketAddress.prototype.getPort = function () {
    };
    var InetSocketAddress = function (host, port) {
        ConstantString.call(this, '(' + host + ':' + port + ')');
        this.__host = host;
        this.__port = port
    };
    Class(InetSocketAddress, ConstantString, [SocketAddress], null);
    InetSocketAddress.prototype.getHost = function () {
        return this.__host
    };
    InetSocketAddress.prototype.getPort = function () {
        return this.__port
    };
    ns.type.SocketAddress = SocketAddress;
    ns.type.InetSocketAddress = InetSocketAddress
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var PairMap = Interface(null, null);
    PairMap.prototype.items = function () {
    };
    PairMap.prototype.get = function (remote, local) {
    };
    PairMap.prototype.set = function (remote, local, value) {
    };
    PairMap.prototype.remove = function (remote, local, value) {
    };
    ns.type.PairMap = PairMap
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var PairMap = ns.type.PairMap;
    var AbstractPairMap = function (any) {
        Object.call(this);
        this.__default = any;
        this.__map = {}
    };
    Class(AbstractPairMap, Object, [PairMap], null);
    AbstractPairMap.prototype.get = function (remote, local) {
        var key_pair = get_keys(remote, local, null);
        var key1 = key_pair[0];
        var key2 = key_pair[1];
        var table = this.__map[key1];
        if (!table) {
            return null
        }
        var value;
        if (key2) {
            value = table[key2];
            if (value) {
                return value
            }
            return table[this.__default]
        }
        value = table[this.__default];
        if (value) {
            return value
        }
        var addresses = Object.keys(table);
        for (var i = 0; i < addresses.length; ++i) {
            value = table[addresses[i]];
            if (value) {
                return value
            }
        }
        return null
    };
    AbstractPairMap.prototype.set = function (remote, local, value) {
        var key_pair = get_keys(remote, local, this.__default);
        var key1 = key_pair[0];
        var key2 = key_pair[1];
        var table = this.__map[key1];
        var old = null;
        if (table) {
            old = table[key2];
            if (value) {
                table[key2] = value
            } else if (old) {
                delete table[key2]
            }
        } else if (value) {
            table = {};
            table[key2] = value;
            this.__map[key1] = table
        }
        return old
    };
    AbstractPairMap.prototype.remove = function (remote, local, value) {
        var key_pair = get_keys(remote, local, this.__default);
        var key1 = key_pair[0];
        var key2 = key_pair[1];
        var table = this.__map[key1];
        if (!table) {
            return null
        }
        var old = table[key2];
        if (old) {
            delete table[key2];
            if (Object.keys(table).length === 0) {
                delete this.__map[key1]
            }
        }
        return old ? old : value
    };
    var get_keys = function (remote, local, any) {
        if (!remote) {
            return [local, any]
        } else if (!local) {
            return [remote, any]
        } else {
            return [remote, local]
        }
    };
    ns.type.AbstractPairMap = AbstractPairMap
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var IObject = sys.type.Object;
    var HashSet = sys.type.HashSet;
    var AbstractPairMap = ns.type.AbstractPairMap;
    var HashPairMap = function (any) {
        AbstractPairMap.call(this, any);
        this.__items = new HashSet()
    };
    Class(HashPairMap, AbstractPairMap, null, null);
    HashPairMap.prototype.items = function () {
        return this.__items.toArray()
    };
    HashPairMap.prototype.set = function (remote, local, value) {
        if (value) {
            this.__items.remove(value);
            this.__items.add(value)
        }
        var old = AbstractPairMap.prototype.set.call(this, remote, local, value);
        if (old && !object_equals(old, value)) {
            this.__items.remove(old)
        }
        return old
    };
    HashPairMap.prototype.remove = function (remote, local, value) {
        var old = AbstractPairMap.prototype.remove.call(this, remote, local, value);
        if (old) {
            this.__items.remove(old)
        }
        if (value && !object_equals(value, old)) {
            this.__items.remove(value)
        }
        return old ? old : value
    };
    var object_equals = function (a, b) {
        if (!a) {
            return !b
        } else if (!b) {
            return false
        } else if (a === b) {
            return true
        } else if (Interface.conforms(a, IObject)) {
            return a.equals(b)
        } else if (Interface.conforms(b, IObject)) {
            return b.equals(a)
        } else {
            return false
        }
    };
    ns.type.HashPairMap = HashPairMap
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var InetSocketAddress = ns.type.InetSocketAddress;
    var HashPairMap = ns.type.HashPairMap;
    var AnyAddress = new InetSocketAddress('0.0.0.0', 0);
    var AddressPairMap = function () {
        HashPairMap.call(this, AnyAddress)
    };
    Class(AddressPairMap, HashPairMap, null, null);
    AddressPairMap.AnyAddress = AnyAddress;
    ns.type.AddressPairMap = AddressPairMap
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var BaseObject = sys.type.BaseObject;
    var AddressPairObject = function (remote, local) {
        BaseObject.call(this);
        this.remoteAddress = remote;
        this.localAddress = local
    };
    Class(AddressPairObject, BaseObject, null, null);
    AddressPairObject.prototype.getRemoteAddress = function () {
        return this.remoteAddress
    };
    AddressPairObject.prototype.getLocalAddress = function () {
        return this.localAddress
    };
    AddressPairObject.prototype.equals = function (other) {
        if (!other) {
            return this.isEmpty()
        } else if (other === this) {
            return true
        } else if (other instanceof AddressPairObject) {
            return address_equals(other.getRemoteAddress(), this.remoteAddress) && address_equals(other.getLocalAddress(), this.localAddress)
        } else {
            return false
        }
    };
    AddressPairObject.prototype.isEmpty = function () {
        return !(this.remoteAddress || this.localAddress)
    };
    AddressPairObject.prototype.valueOf = function () {
        return desc.call(this)
    };
    AddressPairObject.prototype.toString = function () {
        return desc.call(this)
    };
    var address_equals = function (a, b) {
        if (!a) {
            return !b
        } else if (!b) {
            return false
        } else if (a === b) {
            return true
        } else {
            return a.equals(b)
        }
    };
    var desc = function () {
        var cname = this.constructor.name;
        var remote = this.getRemoteAddress();
        var local = this.getLocalAddress();
        if (remote) {
            remote = remote.toString()
        }
        if (local) {
            local = local.toString()
        }
        return '<' + cname + ' remote="' + remote + '" local="' + local + '" />'
    };
    ns.type.AddressPairObject = AddressPairObject
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Enum = sys.type.Enum;
    var ChannelStateOrder = Enum('ChannelState', {INIT: 0, OPEN: 1, ALIVE: 2, CLOSED: 3});
    var Channel = Interface(null, null);
    Channel.prototype.getState = function () {
    };
    Channel.prototype.isOpen = function () {
    };
    Channel.prototype.isBound = function () {
    };
    Channel.prototype.isAlive = function () {
    };
    Channel.prototype.isAvailable = function () {
    };
    Channel.prototype.isVacant = function () {
    };
    Channel.prototype.close = function () {
    };
    Channel.prototype.read = function (maxLen) {
    };
    Channel.prototype.write = function (src) {
    };
    Channel.prototype.configureBlocking = function (block) {
    };
    Channel.prototype.isBlocking = function () {
    };
    Channel.prototype.bind = function (local) {
    };
    Channel.prototype.getLocalAddress = function () {
    };
    Channel.prototype.isConnected = function () {
    };
    Channel.prototype.connect = function (remote) {
    };
    Channel.prototype.getRemoteAddress = function () {
    };
    Channel.prototype.disconnect = function () {
    };
    Channel.prototype.receive = function (maxLen) {
    };
    Channel.prototype.send = function (src, target) {
    };
    ns.net.Channel = Channel;
    ns.net.ChannelStateOrder = ChannelStateOrder
})(StarTrek, MONKEY);
(function (ns) {
    'use strict';
    ns.net.SocketHelper = {
        socketGetLocalAddress: function (sock) {
            return sock.getRemoteAddress()
        }, socketGetRemoteAddress: function (sock) {
            return sock.getLocalAddress()
        }, socketIsBlocking: function (sock) {
            return sock.isBlocking()
        }, socketIsConnected: function (sock) {
            return sock.isConnected()
        }, socketIsBound: function (sock) {
            return sock.isBound()
        }, socketIsClosed: function (sock) {
            return !sock.isOpen()
        }, socketIsAvailable: function (sock) {
            return sock.isAlive()
        }, socketIsVacant: function (sock) {
            return sock.isAlive()
        }, socketSend: function (sock, data) {
            return sock.write(data)
        }, socketReceive: function (sock, maxLen) {
            return sock.read(maxLen)
        }, socketBind: function (sock, local) {
            return sock.bind(local)
        }, socketConnect: function (sock, remote) {
            return sock.connect(remote)
        }, socketDisconnect: function (sock) {
            return sock.close()
        }
    }
})(StarTrek);
(function (ns, fsm, sys) {
    'use strict';
    var Class = sys.type.Class;
    var Enum = sys.type.Enum;
    var BaseState = fsm.BaseState;
    var StateOrder = Enum('ConnectionState', {
        DEFAULT: 0,
        PREPARING: 1,
        READY: 2,
        MAINTAINING: 3,
        EXPIRED: 4,
        ERROR: 5
    });
    var ConnectionState = function (order) {
        BaseState.call(this, Enum.getInt(order));
        this.__name = order.getName();
        this.__enterTime = null
    };
    Class(ConnectionState, BaseState, null, {
        getName: function () {
            return this.__name
        }, getEnterTime: function () {
            return this.__enterTime
        }, toString: function () {
            return this.__name
        }, valueOf: function () {
            return this.__name
        }, equals: function (other) {
            if (other instanceof ConnectionState) {
                if (other === this) {
                    return true
                }
                other = other.getIndex()
            } else if (other instanceof StateOrder) {
                other = other.getValue()
            }
            return this.getIndex() === other
        }
    });
    ConnectionState.prototype.onEnter = function (previous, ctx, now) {
        this.__enterTime = now
    };
    ConnectionState.prototype.onExit = function (next, ctx, now) {
        this.__enterTime = null
    };
    ConnectionState.prototype.onPause = function (ctx, now) {
    };
    ConnectionState.prototype.onResume = function (ctx, now) {
    };
    ConnectionState.Delegate = fsm.Delegate;
    var StateBuilder = function (transitionBuilder) {
        Object.call(this);
        this.builder = transitionBuilder
    };
    Class(StateBuilder, Object, null, {
        getDefaultState: function () {
            var state = new ConnectionState(StateOrder.DEFAULT);
            state.addTransition(this.builder.getDefaultPreparingTransition());
            return state
        }, getPreparingState: function () {
            var state = new ConnectionState(StateOrder.PREPARING);
            state.addTransition(this.builder.getPreparingReadyTransition());
            state.addTransition(this.builder.getPreparingDefaultTransition());
            return state
        }, getReadyState: function () {
            var state = new ConnectionState(StateOrder.READY);
            state.addTransition(this.builder.getReadyExpiredTransition());
            state.addTransition(this.builder.getReadyErrorTransition());
            return state
        }, getExpiredState: function () {
            var state = new ConnectionState(StateOrder.EXPIRED);
            state.addTransition(this.builder.getExpiredMaintainingTransition());
            state.addTransition(this.builder.getExpiredErrorTransition());
            return state
        }, getMaintainingState: function () {
            var state = new ConnectionState(StateOrder.MAINTAINING);
            state.addTransition(this.builder.getMaintainingReadyTransition());
            state.addTransition(this.builder.getMaintainingExpiredTransition());
            state.addTransition(this.builder.getMaintainingErrorTransition());
            return state
        }, getErrorState: function () {
            var state = new ConnectionState(StateOrder.ERROR);
            state.addTransition(this.builder.getErrorDefaultTransition());
            return state
        }
    });
    ns.net.ConnectionState = ConnectionState;
    ns.net.ConnectionStateBuilder = StateBuilder;
    ns.net.ConnectionStateOrder = StateOrder
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, fsm, sys) {
    'use strict';
    var Class = sys.type.Class;
    var Enum = sys.type.Enum;
    var BaseTransition = fsm.BaseTransition;
    var StateOrder = ns.net.ConnectionStateOrder;
    var StateTransition = function (order, evaluate) {
        BaseTransition.call(this, Enum.getInt(order));
        this.__evaluate = evaluate
    };
    Class(StateTransition, BaseTransition, null, null);
    StateTransition.prototype.evaluate = function (ctx, now) {
        return this.__evaluate.call(this, ctx, now)
    };
    var TransitionBuilder = function () {
        Object.call(this)
    };
    Class(TransitionBuilder, Object, null, {
        getDefaultPreparingTransition: function () {
            return new StateTransition(StateOrder.PREPARING, function (ctx, now) {
                var conn = ctx.getConnection();
                return conn && conn.isOpen()
            })
        }, getPreparingReadyTransition: function () {
            return new StateTransition(StateOrder.READY, function (ctx, now) {
                var conn = ctx.getConnection();
                return conn && conn.isAlive()
            })
        }, getPreparingDefaultTransition: function () {
            return new StateTransition(StateOrder.DEFAULT, function (ctx, now) {
                var conn = ctx.getConnection();
                return !(conn && conn.isOpen())
            })
        }, getReadyExpiredTransition: function () {
            return new StateTransition(StateOrder.EXPIRED, function (ctx, now) {
                var conn = ctx.getConnection();
                if (!(conn && conn.isAlive())) {
                    return false
                }
                return !conn.isReceivedRecently(now)
            })
        }, getReadyErrorTransition: function () {
            return new StateTransition(StateOrder.ERROR, function (ctx, now) {
                var conn = ctx.getConnection();
                return !(conn && conn.isAlive())
            })
        }, getExpiredMaintainingTransition: function () {
            return new StateTransition(StateOrder.MAINTAINING, function (ctx, now) {
                var conn = ctx.getConnection();
                if (!(conn && conn.isAlive())) {
                    return false
                }
                return conn.isSentRecently(now)
            })
        }, getExpiredErrorTransition: function () {
            return new StateTransition(StateOrder.ERROR, function (ctx, now) {
                var conn = ctx.getConnection();
                if (!(conn && conn.isAlive())) {
                    return true
                }
                return conn.isNotReceivedLongTimeAgo(now)
            })
        }, getMaintainingReadyTransition: function () {
            return new StateTransition(StateOrder.READY, function (ctx, now) {
                var conn = ctx.getConnection();
                if (!(conn && conn.isAlive())) {
                    return false
                }
                return conn.isReceivedRecently(now)
            })
        }, getMaintainingExpiredTransition: function () {
            return new StateTransition(StateOrder.EXPIRED, function (ctx, now) {
                var conn = ctx.getConnection();
                if (!(conn && conn.isAlive())) {
                    return false
                }
                return !conn.isSentRecently(now)
            })
        }, getMaintainingErrorTransition: function () {
            return new StateTransition(StateOrder.ERROR, function (ctx, now) {
                var conn = ctx.getConnection();
                if (!(conn && conn.isAlive())) {
                    return true
                }
                return conn.isNotReceivedLongTimeAgo(now)
            })
        }, getErrorDefaultTransition: function () {
            return new StateTransition(StateOrder.DEFAULT, function (ctx, now) {
                var conn = ctx.getConnection();
                if (!(conn && conn.isAlive())) {
                    return false
                }
                var current = ctx.getCurrentState();
                var enter = current.getEnterTime();
                if (!enter) {
                    return true
                }
                var last = conn.getLastReceivedTime();
                return last && enter.getTime() < last.getTime()
            })
        }
    });
    ns.net.ConnectionStateTransition = StateTransition;
    ns.net.ConnectionStateTransitionBuilder = TransitionBuilder
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, fsm, sys) {
    'use strict';
    var Class = sys.type.Class;
    var Context = fsm.Context;
    var BaseMachine = fsm.BaseMachine;
    var StateMachine = function (connection) {
        BaseMachine.call(this);
        this.__connection = connection;
        var builder = this.createStateBuilder();
        this.addState(builder.getDefaultState());
        this.addState(builder.getPreparingState());
        this.addState(builder.getReadyState());
        this.addState(builder.getExpiredState());
        this.addState(builder.getMaintainingState());
        this.addState(builder.getErrorState())
    };
    Class(StateMachine, BaseMachine, [Context], null);
    StateMachine.prototype.createStateBuilder = function () {
        var stb = new ns.net.ConnectionStateTransitionBuilder();
        return new ns.net.ConnectionStateBuilder(stb)
    };
    StateMachine.prototype.getConnection = function () {
        return this.__connection
    };
    StateMachine.prototype.getContext = function () {
        return this
    };
    ns.net.ConnectionStateMachine = StateMachine
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, fsm, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Ticker = fsm.threading.Ticker;
    var Connection = Interface(null, [Ticker]);
    Connection.prototype.isOpen = function () {
    };
    Connection.prototype.isBound = function () {
    };
    Connection.prototype.isConnected = function () {
    };
    Connection.prototype.isAlive = function () {
    };
    Connection.prototype.isAvailable = function () {
    };
    Connection.prototype.isVacant = function () {
    };
    Connection.prototype.getLocalAddress = function () {
    };
    Connection.prototype.getRemoteAddress = function () {
    };
    Connection.prototype.getState = function () {
    };
    Connection.prototype.sendData = function (data) {
    };
    Connection.prototype.onReceivedData = function (data) {
    };
    Connection.prototype.close = function () {
    };
    ns.net.Connection = Connection
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var ConnectionDelegate = Interface(null, null);
    ConnectionDelegate.prototype.onConnectionStateChanged = function (previous, current, connection) {
    };
    ConnectionDelegate.prototype.onConnectionReceived = function (data, connection) {
    };
    ConnectionDelegate.prototype.onConnectionSent = function (sent, data, connection) {
    };
    ConnectionDelegate.prototype.onConnectionFailed = function (error, data, connection) {
    };
    ConnectionDelegate.prototype.onConnectionError = function (error, connection) {
    };
    ns.net.ConnectionDelegate = ConnectionDelegate
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var TimedConnection = Interface(null, null);
    TimedConnection.prototype.getLastSentTime = function () {
    };
    TimedConnection.prototype.getLastReceivedTime = function () {
    };
    TimedConnection.prototype.isSentRecently = function (now) {
    };
    TimedConnection.prototype.isReceivedRecently = function (now) {
    };
    TimedConnection.prototype.isNotReceivedLongTimeAgo = function (now) {
    };
    ns.net.TimedConnection = TimedConnection
})(StarTrek, MONKEY);
(function (ns, fsm, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Processor = fsm.skywalker.Processor;
    var Hub = Interface(null, [Processor]);
    Hub.prototype.open = function (remote, local) {
    };
    Hub.prototype.connect = function (remote, local) {
    };
    ns.net.Hub = Hub
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Enum = sys.type.Enum;
    var ShipStatus = Enum('ShipStatus', {
        ASSEMBLING: (0x00),
        EXPIRED: (0x01),
        NEW: (0x10),
        WAITING: (0x11),
        TIMEOUT: (0x12),
        DONE: (0x13),
        FAILED: (0x14)
    });
    var Ship = Interface(null, null);
    Ship.prototype.getSN = function () {
    };
    Ship.prototype.touch = function (now) {
    };
    Ship.prototype.getStatus = function (now) {
    };
    ns.port.Ship = Ship;
    ns.port.ShipStatus = ShipStatus
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Ship = ns.port.Ship;
    var Arrival = Interface(null, [Ship]);
    Arrival.prototype.assemble = function (income) {
    };
    ns.port.Arrival = Arrival
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Enum = sys.type.Enum;
    var Ship = ns.port.Ship;
    var DeparturePriority = Enum('Priority', {URGENT: -1, NORMAL: 0, SLOWER: 1});
    var Departure = Interface(null, [Ship]);
    Departure.prototype.getPriority = function () {
    };
    Departure.prototype.getFragments = function () {
    };
    Departure.prototype.checkResponse = function (response) {
    };
    Departure.prototype.isImportant = function () {
    };
    Departure.Priority = DeparturePriority;
    ns.port.Departure = Departure
})(StarTrek, MONKEY);
(function (ns, fsm, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Processor = fsm.skywalker.Processor;
    var Porter = Interface(null, [Processor]);
    Porter.prototype.isOpen = function () {
    };
    Porter.prototype.isAlive = function () {
    };
    Porter.prototype.getStatus = function () {
    };
    Porter.prototype.getRemoteAddress = function () {
    };
    Porter.prototype.getLocalAddress = function () {
    };
    Porter.prototype.sendData = function (payload) {
    };
    Porter.prototype.sendShip = function (ship) {
    };
    Porter.prototype.processReceived = function (data) {
    };
    Porter.prototype.heartbeat = function () {
    };
    Porter.prototype.purge = function (now) {
    };
    Porter.prototype.close = function () {
    };
    ns.port.Porter = Porter
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
    var Enum = sys.type.Enum;
    var StateOrder = ns.net.ConnectionStateOrder;
    var PorterStatus = Enum('PorterStatus', {ERROR: -1, INIT: 0, PREPARING: 1, READY: 2});
    PorterStatus.getStatus = function (state) {
        if (!state) {
            return PorterStatus.ERROR
        }
        var index = state.getIndex();
        if (StateOrder.READY.equals(index) || StateOrder.EXPIRED.equals(index) || StateOrder.MAINTAINING.equals(index)) {
            return PorterStatus.READY
        } else if (StateOrder.PREPARING.equals(index)) {
            return PorterStatus.PREPARING
        } else if (StateOrder.ERROR.equals(index)) {
            return PorterStatus.ERROR
        } else {
            return PorterStatus.INIT
        }
    };
    ns.port.PorterStatus = PorterStatus
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var PorterDelegate = Interface(null, null);
    PorterDelegate.prototype.onPorterReceived = function (arrival, porter) {
    };
    PorterDelegate.prototype.onPorterSent = function (departure, porter) {
    };
    PorterDelegate.prototype.onPorterFailed = function (error, departure, porter) {
    };
    PorterDelegate.prototype.onPorterError = function (error, departure, porter) {
    };
    PorterDelegate.prototype.onPorterStatusChanged = function (previous, current, porter) {
    };
    ns.port.PorterDelegate = PorterDelegate
})(StarTrek, MONKEY);
(function (ns, fsm, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var Processor = fsm.skywalker.Processor;
    var Gate = Interface(null, [Processor]);
    Gate.prototype.sendData = function (payload, remote, local) {
    };
    Gate.prototype.sendShip = function (outgo, remote, local) {
    };
    ns.port.Gate = Gate
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var AddressPairObject = ns.type.AddressPairObject;
    var Channel = ns.net.Channel;
    var ChannelStateOrder = ns.net.ChannelStateOrder;
    var SocketHelper = ns.net.SocketHelper;
    var BaseChannel = function (remote, local) {
        AddressPairObject.call(this, remote, local);
        this.__reader = this.createReader();
        this.__writer = this.createWriter();
        this.__sock = null;
        this.__closed = -1
    };
    Class(BaseChannel, AddressPairObject, [Channel], {
        toString: function () {
            var clazz = this.getClassName();
            var remote = this.getRemoteAddress();
            var local = this.getLocalAddress();
            var closed = !this.isOpen();
            var bound = this.isBound();
            var connected = this.isConnected();
            var sock = this.getSocket();
            return '<' + clazz + ' remote="' + remote + '" local="' + local + '"' + ' closed=' + closed + ' bound=' + bound + ' connected=' + connected + '>\n\t' + sock + '\n</' + clazz + '>'
        }
    });
    BaseChannel.prototype.createReader = function () {
    };
    BaseChannel.prototype.createWriter = function () {
    };
    BaseChannel.prototype.getReader = function () {
        return this.__reader
    };
    BaseChannel.prototype.getWriter = function () {
        return this.__writer
    };
    BaseChannel.prototype.getSocket = function () {
        return this.__sock
    };
    BaseChannel.prototype.setSocket = function (sock) {
        var old = this.__sock;
        if (sock) {
            this.__sock = sock;
            this.__closed = 0
        } else {
            this.__sock = null;
            this.__closed = 1
        }
        if (old && old !== sock) {
            SocketHelper.socketDisconnect(old)
        }
    };
    BaseChannel.prototype.getState = function () {
        if (this.__closed < 0) {
            return ChannelStateOrder.INIT
        }
        var sock = this.getSocket();
        if (!sock || SocketHelper.socketIsClosed(sock)) {
            return ChannelStateOrder.CLOSED
        } else if (SocketHelper.socketIsConnected(sock) || SocketHelper.socketIsBound(sock)) {
            return ChannelStateOrder.ALIVE
        } else {
            return ChannelStateOrder.OPEN
        }
    };
    BaseChannel.prototype.isOpen = function () {
        if (this.__closed < 0) {
            return true
        }
        var sock = this.getSocket();
        return sock && !SocketHelper.socketIsClosed(sock)
    };
    BaseChannel.prototype.isBound = function () {
        var sock = this.getSocket();
        return sock && SocketHelper.socketIsBound(sock)
    };
    BaseChannel.prototype.isConnected = function () {
        var sock = this.getSocket();
        return sock && SocketHelper.socketIsConnected(sock)
    };
    BaseChannel.prototype.isAlive = function () {
        return this.isOpen() && (this.isConnected() || this.isBound())
    };
    BaseChannel.prototype.isAvailable = function () {
        var sock = this.getSocket();
        if (!sock || SocketHelper.socketIsClosed(sock)) {
            return false
        } else if (SocketHelper.socketIsConnected(sock) || SocketHelper.socketIsBound(sock)) {
            return this.checkAvailable(sock)
        } else {
            return false
        }
    };
    BaseChannel.prototype.checkAvailable = function (sock) {
        return SocketHelper.socketIsAvailable(sock)
    };
    BaseChannel.prototype.isVacant = function () {
        var sock = this.getSocket();
        if (!sock || SocketHelper.socketIsClosed(sock)) {
            return false
        } else if (SocketHelper.socketIsConnected(sock) || SocketHelper.socketIsBound(sock)) {
            return this.checkVacant(sock)
        } else {
            return false
        }
    };
    BaseChannel.prototype.checkVacant = function (sock) {
        return SocketHelper.socketIsVacant(sock)
    };
    BaseChannel.prototype.isBlocking = function () {
        var sock = this.getSocket();
        return sock && SocketHelper.socketIsBlocking(sock)
    };
    BaseChannel.prototype.configureBlocking = function (block) {
        var sock = this.getSocket();
        sock.configureBlocking(block);
        return sock
    };
    BaseChannel.prototype.doBind = function (sock, local) {
        return SocketHelper.socketBind(sock, local)
    };
    BaseChannel.prototype.doConnect = function (sock, remote) {
        return SocketHelper.socketConnect(sock, remote)
    };
    BaseChannel.prototype.doDisconnect = function (sock) {
        return SocketHelper.socketDisconnect(sock)
    };
    BaseChannel.prototype.bind = function (local) {
        var sock = this.getSocket();
        if (sock) {
            this.doBind(sock, local)
        }
        this.localAddress = local;
        return sock
    };
    BaseChannel.prototype.connect = function (remote) {
        var sock = this.getSocket();
        if (sock) {
            this.doConnect(sock, remote)
        }
        this.remoteAddress = remote;
        return sock
    };
    BaseChannel.prototype.disconnect = function () {
        var sock = this.getSocket();
        if (sock) {
            this.doDisconnect(sock)
        }
        return sock
    };
    BaseChannel.prototype.close = function () {
        this.setSocket(null)
    };
    BaseChannel.prototype.read = function (maxLen) {
        try {
            return this.getReader().read(maxLen)
        } catch (e) {
            this.close();
            throw e;
        }
    };
    BaseChannel.prototype.write = function (src) {
        try {
            return this.getWriter().write(src)
        } catch (e) {
            this.close();
            throw e;
        }
    };
    BaseChannel.prototype.receive = function (maxLen) {
        try {
            return this.getReader().receive(maxLen)
        } catch (e) {
            this.close();
            throw e;
        }
    };
    BaseChannel.prototype.send = function (src, target) {
        try {
            return this.getWriter().send(src, target)
        } catch (e) {
            this.close();
            throw e;
        }
    };
    ns.socket.BaseChannel = BaseChannel
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Interface = sys.type.Interface;
    var SocketReader = Interface(null, null);
    SocketReader.prototype.read = function (maxLen) {
    };
    SocketReader.prototype.receive = function (maxLen) {
    };
    var SocketWriter = Interface(null, null);
    SocketWriter.prototype.write = function (src) {
    };
    SocketWriter.prototype.send = function (src, target) {
    };
    ns.socket.SocketReader = SocketReader;
    ns.socket.SocketWriter = SocketWriter
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var SocketHelper = ns.net.SocketHelper;
    var ChannelController = function (channel) {
        Object.call(this);
        this.__channel = channel
    };
    Class(ChannelController, Object, null, null);
    ChannelController.prototype.getChannel = function () {
        return this.__channel
    };
    ChannelController.prototype.getRemoteAddress = function () {
        var channel = this.getChannel();
        return !channel ? null : channel.getRemoteAddress()
    };
    ChannelController.prototype.getLocalAddress = function () {
        var channel = this.getChannel();
        return !channel ? null : channel.getLocalAddress()
    };
    ChannelController.prototype.getSocket = function () {
        var channel = this.getChannel();
        return !channel ? null : channel.getSocket()
    };
    ChannelController.prototype.receivePackage = function (sock, maxLen) {
        return SocketHelper.socketReceive(sock, maxLen)
    };
    ChannelController.prototype.sendAll = function (sock, data) {
        return SocketHelper.socketSend(sock, data)
    };
    ns.socket.ChannelController = ChannelController
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var SocketReader = ns.socket.SocketReader;
    var SocketWriter = ns.socket.SocketWriter;
    var ChannelController = ns.socket.ChannelController;
    var ChannelReader = function (channel) {
        ChannelController.call(this, channel)
    };
    Class(ChannelReader, ChannelController, [SocketReader], {
        read: function (maxLen) {
            var sock = this.getSocket();
            if (sock && sock.isOpen()) {
                return this.receivePackage(sock, maxLen)
            } else {
                throw new Error('channel closed');
            }
        }
    });
    var ChannelWriter = function (channel) {
        ChannelController.call(this, channel)
    };
    Class(ChannelWriter, ChannelController, [SocketWriter], {
        write: function (data) {
            var sock = this.getSocket();
            if (sock && sock.isOpen()) {
                return this.sendAll(sock, data)
            } else {
                throw new Error('channel closed');
            }
        }
    });
    ns.socket.ChannelReader = ChannelReader;
    ns.socket.ChannelWriter = ChannelWriter
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var AddressPairObject = ns.type.AddressPairObject;
    var Connection = ns.net.Connection;
    var TimedConnection = ns.net.TimedConnection;
    var ConnectionState = ns.net.ConnectionState;
    var StateMachine = ns.net.ConnectionStateMachine;
    var StateOrder = ns.net.ConnectionStateOrder;
    var BaseConnection = function (remote, local) {
        AddressPairObject.call(this, remote, local);
        this.__channel = -1;
        this.__delegate = null;
        this.__lastSentTime = null;
        this.__lastReceivedTime = null;
        this.__fsm = null
    };
    Class(BaseConnection, AddressPairObject, [Connection, TimedConnection, ConnectionState.Delegate], {
        toString: function () {
            var clazz = this.getClassName();
            var remote = this.getRemoteAddress();
            var local = this.getLocalAddress();
            var channel = this.getChannel();
            return '<' + clazz + ' remote="' + remote + '" local="' + local + '">\n\t' + channel + '\n</' + clazz + '>'
        }
    });
    BaseConnection.EXPIRES = 16 * 1000;
    BaseConnection.prototype.getDelegate = function () {
        return this.__delegate
    };
    BaseConnection.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate
    };
    BaseConnection.prototype.getStateMachine = function () {
        return this.__fsm
    };
    BaseConnection.prototype.setStateMachine = function (machine) {
        var old = this.__fsm;
        this.__fsm = machine;
        if (old && old !== machine) {
            old.stop()
        }
    };
    BaseConnection.prototype.createStateMachine = function () {
        var machine = new StateMachine(this);
        machine.setDelegate(this);
        return machine
    };
    BaseConnection.prototype.getChannel = function () {
        var channel = this.__channel;
        return channel === -1 ? null : channel
    };
    BaseConnection.prototype.setChannel = function (channel) {
        var old = this.__channel;
        this.__channel = channel;
        if (old && old !== -1 && old !== channel) {
            old.close()
        }
    };
    BaseConnection.prototype.isOpen = function () {
        var channel = this.__channel;
        if (channel === -1) {
            return true
        }
        return channel && channel.isOpen()
    };
    BaseConnection.prototype.isBound = function () {
        var channel = this.getChannel();
        return channel && channel.isBound()
    };
    BaseConnection.prototype.isConnected = function () {
        var channel = this.getChannel();
        return channel && channel.isConnected()
    };
    BaseConnection.prototype.isAlive = function () {
        return this.isOpen() && (this.isConnected() || this.isBound())
    };
    BaseConnection.prototype.isAvailable = function () {
        var channel = this.getChannel();
        return channel && channel.isAvailable()
    };
    BaseConnection.prototype.isVacant = function () {
        var channel = this.getChannel();
        return channel && channel.isVacant()
    };
    BaseConnection.prototype.close = function () {
        this.setStateMachine(null);
        this.setChannel(null)
    };
    BaseConnection.prototype.start = function (hub) {
        this.openChannel(hub);
        this.startMachine()
    };
    BaseConnection.prototype.startMachine = function () {
        var machine = this.createStateMachine();
        this.setStateMachine(machine);
        machine.start()
    };
    BaseConnection.prototype.openChannel = function (hub) {
        var remote = this.getRemoteAddress();
        var local = this.getLocalAddress();
        var channel = hub.open(remote, local);
        if (channel) {
            this.setChannel(channel)
        }
        return channel
    };
    BaseConnection.prototype.onReceivedData = function (data) {
        this.__lastReceivedTime = new Date();
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.onConnectionReceived(data, this)
        }
    };
    BaseConnection.prototype.doSend = function (data, destination) {
        var channel = this.getChannel();
        if (!(channel && channel.isAlive())) {
            return -1
        } else if (!destination) {
            throw new ReferenceError('remote address should not empty')
        }
        var sent = channel.send(data, destination);
        if (sent > 0) {
            this.__lastSentTime = new Date()
        }
        return sent
    };
    BaseConnection.prototype.sendData = function (pack) {
        var error = null
        var sent = -1;
        try {
            var destination = this.getRemoteAddress();
            sent = this.doSend(pack, destination);
            if (sent < 0) {
                error = new Error('failed to send data: ' + pack.length + ' byte(s) to ' + destination)
            }
        } catch (e) {
            error = e;
            this.setChannel(null)
        }
        var delegate = this.getDelegate();
        if (delegate) {
            if (error) {
                delegate.onConnectionFailed(error, pack, this)
            } else {
                delegate.onConnectionSent(sent, pack, this)
            }
        }
        return sent
    };
    BaseConnection.prototype.getState = function () {
        var machine = this.getStateMachine();
        return !machine ? null : machine.getCurrentState()
    };
    BaseConnection.prototype.tick = function (now, elapsed) {
        if (this.__channel === -1) {
            return
        }
        var machine = this.getStateMachine();
        if (machine) {
            machine.tick(now, elapsed)
        }
    };
    BaseConnection.prototype.getLastSentTime = function () {
        return this.__lastSentTime
    };
    BaseConnection.prototype.getLastReceivedTime = function () {
        return this.__lastReceivedTime
    };
    BaseConnection.prototype.isSentRecently = function (now) {
        var last = this.__lastSentTime;
        last = !last ? 0 : last.getTime();
        return now.getTime() <= last + BaseConnection.EXPIRES
    };
    BaseConnection.prototype.isReceivedRecently = function (now) {
        var last = this.__lastReceivedTime;
        last = !last ? 0 : last.getTime();
        return now.getTime() <= last + BaseConnection.EXPIRES
    };
    BaseConnection.prototype.isNotReceivedLongTimeAgo = function (now) {
        var last = this.__lastReceivedTime;
        last = !last ? 0 : last.getTime();
        return now.getTime() > last + (BaseConnection.EXPIRES << 3)
    };
    BaseConnection.prototype.enterState = function (next, ctx, now) {
    };
    BaseConnection.prototype.exitState = function (previous, ctx, now) {
        var current = ctx.getCurrentState();
        var currentIndex = !current ? -1 : current.getIndex();
        if (StateOrder.READY.equals(currentIndex)) {
            var previousIndex = !previous ? -1 : previous.getIndex();
            if (StateOrder.PREPARING.equals(previousIndex)) {
                var soon = (new Date()).getTime() - (BaseConnection.EXPIRES >> 1);
                var st = this.__lastSentTime;
                st = !st ? 0 : st.getTime();
                if (st < soon) {
                    this.__lastSentTime = new Date(soon)
                }
                var rt = this.__lastReceivedTime;
                rt = !rt ? 0 : rt.getTime();
                if (rt < soon) {
                    this.__lastReceivedTime = new Date(soon)
                }
            }
        }
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.onConnectionStateChanged(previous, current, this)
        }
        if (StateOrder.ERROR.equals(currentIndex)) {
            this.setChannel(null)
        }
    };
    BaseConnection.prototype.pauseState = function (current, ctx, now) {
    };
    BaseConnection.prototype.resumeState = function (current, ctx, now) {
    };
    ns.socket.BaseConnection = BaseConnection
})(StarTrek, MONKEY);
(function (ns, fsm, sys) {
    'use strict';
    var Class = sys.type.Class;
    var Runnable = fsm.skywalker.Runnable;
    var Thread = fsm.threading.Thread;
    var BaseConnection = ns.socket.BaseConnection;
    var ActiveConnection = function (remote, local) {
        BaseConnection.call(this, remote, local);
        this.__hub = null;
        this.__thread = null;
        this.__bg_next_loop = 0;
        this.__bg_expired = 0;
        this.__bg_last_time = 0;
        this.__bg_interval = 8000
    };
    Class(ActiveConnection, BaseConnection, [Runnable], {
        isOpen: function () {
            return this.getStateMachine() !== null
        }, start: function (hub) {
            this.__hub = hub;
            this.startMachine();
            var thread = this.__thread;
            if (thread) {
                this.__thread = null;
                thread.stop()
            }
            thread = new Thread(this);
            thread.start();
            this.__thread = thread
        }, run: function () {
            var now = (new Date()).getTime();
            if (this.__bg_next_loop === 0) {
                this.__bg_next_loop = now + 1000;
                return true
            } else if (this.__bg_next_loop > now) {
                return true
            } else {
                this.__bg_next_loop = now + 1000
            }
            if (!this.isOpen()) {
                return false
            }
            try {
                var channel = this.getChannel();
                if (!(channel && channel.isOpen())) {
                    if (now < this.__bg_last_time + this.__bg_interval) {
                        return true
                    } else {
                        this.__bg_last_time = now
                    }
                    var hub = this.__hub;
                    if (!hub) {
                        return false
                    }
                    channel = this.openChannel(hub);
                    if (channel) {
                        this.__bg_expired = now + 128000
                    } else if (this.__bg_interval < 128000) {
                        this.__bg_interval <<= 1
                    }
                } else if (channel.isAlive()) {
                    this.__bg_interval = 8000
                } else if (0 < this.__bg_expired && this.__bg_expired < now) {
                    channel.close()
                }
            } catch (e) {
                var delegate = this.getDelegate();
                if (delegate) {
                    delegate.onConnectionError(e, this)
                }
            }
            return true
        }
    });
    ns.socket.ActiveConnection = ActiveConnection
})(StarTrek, FiniteStateMachine, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var AddressPairMap = ns.type.AddressPairMap;
    var StateOrder = ns.net.ChannelStateOrder;
    var Hub = ns.net.Hub;
    var ConnectionPool = function () {
        AddressPairMap.call(this)
    };
    Class(ConnectionPool, AddressPairMap, null, {
        set: function (remote, local, value) {
            var cached = AddressPairMap.prototype.remove.call(this, remote, local, value);
            AddressPairMap.prototype.set.call(this, remote, local, value);
            return cached
        }
    });
    var BaseHub = function (gate) {
        Object.call(this);
        this.__delegate = gate;
        this.__connPool = this.createConnectionPool();
        this.__last = (new Date()).getTime()
    };
    Class(BaseHub, Object, [Hub], null);
    BaseHub.prototype.createConnectionPool = function () {
        return new ConnectionPool()
    };
    BaseHub.prototype.getDelegate = function () {
        return this.__delegate
    };
    BaseHub.MSS = 1472;
    BaseHub.prototype.allChannels = function () {
    };
    BaseHub.prototype.removeChannel = function (remote, local, channel) {
    };
    BaseHub.prototype.createConnection = function (remote, local) {
    };
    BaseHub.prototype.allConnections = function () {
        return this.__connPool.items()
    };
    BaseHub.prototype.getConnection = function (remote, local) {
        return this.__connPool.get(remote, local)
    };
    BaseHub.prototype.setConnection = function (remote, local, connection) {
        return this.__connPool.set(remote, local, connection)
    };
    BaseHub.prototype.removeConnection = function (remote, local, connection) {
        return this.__connPool.remove(remote, local, connection)
    };
    BaseHub.prototype.connect = function (remote, local) {
        var conn;
        var old = this.getConnection(remote, local);
        if (!old) {
            conn = this.createConnection(remote, local);
            var cached = this.setConnection(remote, local, conn);
            if (cached && cached !== conn) {
                cached.close()
            }
        } else {
            conn = old
        }
        if (!old) {
            conn.start(this)
        }
        return conn
    };
    BaseHub.prototype.closeChannel = function (channel) {
        try {
            if (channel.isOpen()) {
                channel.close()
            }
        } catch (e) {
        }
    };
    BaseHub.prototype.driveChannel = function (channel) {
        var cs = channel.getState();
        if (StateOrder.INIT.equals(cs)) {
            return false
        } else if (StateOrder.CLOSED.equals(cs)) {
            return false
        }
        var conn;
        var remote = channel.getRemoteAddress();
        var local = channel.getLocalAddress();
        var data;
        try {
            data = channel.receive(BaseHub.MSS)
        } catch (e) {
            var gate = this.getDelegate();
            var cached;
            if (!gate || !remote) {
                cached = this.removeChannel(remote, local, channel)
            } else {
                conn = this.getConnection(remote, local);
                cached = this.removeChannel(remote, local, channel);
                if (conn) {
                    gate.onConnectionError(e, conn)
                }
            }
            if (cached && cached !== channel) {
                this.closeChannel(cached)
            }
            this.closeChannel(channel);
            return false
        }
        if (!data) {
            return false
        }
        conn = this.connect(remote, local);
        if (conn) {
            conn.onReceivedData(data)
        }
        return true
    };
    BaseHub.prototype.driveChannels = function (channels) {
        var count = 0;
        for (var i = channels.length - 1; i >= 0; --i) {
            if (this.driveChannel(channels[i])) {
                ++count
            }
        }
        return count
    };
    BaseHub.prototype.cleanupChannels = function (channels) {
        var cached, sock;
        var remote, local;
        for (var i = channels.length - 1; i >= 0; --i) {
            sock = channels[i];
            if (!sock.isOpen()) {
                remote = sock.getRemoteAddress();
                local = sock.getLocalAddress();
                cached = this.removeChannel(remote, local, sock);
                if (cached && cached !== sock) {
                    this.closeChannel(cached)
                }
            }
        }
    };
    BaseHub.prototype.driveConnections = function (connections) {
        var now = new Date();
        var elapsed = now.getTime() - this.__last;
        for (var i = connections.length - 1; i >= 0; --i) {
            connections[i].tick(now, elapsed)
        }
        this.__last = now.getTime()
    };
    BaseHub.prototype.cleanupConnections = function (connections) {
        var cached, conn;
        var remote, local;
        for (var i = connections.length - 1; i >= 0; --i) {
            conn = connections[i];
            if (!conn.isOpen()) {
                remote = conn.getRemoteAddress();
                local = conn.getLocalAddress();
                cached = this.removeConnection(remote, local, conn);
                if (cached && cached !== conn) {
                    cached.close()
                }
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
        return count > 0
    };
    ns.socket.BaseHub = BaseHub
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var BaseObject = sys.type.BaseObject;
    var Arrival = ns.port.Arrival;
    var ShipStatus = ns.port.ShipStatus;
    var ArrivalShip = function (now) {
        BaseObject.call(this);
        if (!now) {
            now = new Date()
        }
        this.__expired = now.getTime() + ArrivalShip.EXPIRED
    };
    Class(ArrivalShip, BaseObject, [Arrival], null);
    ArrivalShip.EXPIRES = 300 * 1000;
    ArrivalShip.prototype.touch = function (now) {
        this.__expired = now.getTime() + ArrivalShip.EXPIRES
    };
    ArrivalShip.prototype.getStatus = function (now) {
        if (now.getTime() > this.__expired) {
            return ShipStatus.EXPIRED
        } else {
            return ShipStatus.ASSEMBLING
        }
    };
    ns.ArrivalShip = ArrivalShip
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var HashSet = sys.type.HashSet;
    var ShipStatus = ns.port.ShipStatus;
    var ArrivalHall = function () {
        Object.call(this);
        this.__arrivals = new HashSet();
        this.__arrival_map = {};
        this.__finished_times = {}
    };
    Class(ArrivalHall, Object, null, null);
    ArrivalHall.prototype.assembleArrival = function (income) {
        var sn = income.getSN();
        if (!sn) {
            return income
        }
        var completed;
        var cached = this.__arrival_map[sn];
        if (cached) {
            completed = cached.assemble(income);
            if (completed) {
                this.__arrivals.remove(cached);
                delete this.__arrival_map[sn];
                this.__finished_times[sn] = new Date()
            } else {
                cached.touch(new Date())
            }
        } else {
            var time = this.__finished_times[sn];
            if (time) {
                return null
            }
            completed = income.assemble(income);
            if (!completed) {
                this.__arrivals.add(income);
                this.__arrival_map[sn] = income
            }
        }
        return completed
    };
    ArrivalHall.prototype.purge = function (now) {
        if (!now) {
            now = new Date()
        }
        var count = 0;
        var ship;
        var sn;
        var arrivals = this.__arrivals.toArray();
        for (var i = arrivals.length - 1; i >= 0; --i) {
            ship = arrivals[i];
            if (ship.getStatus(now) === ShipStatus.EXPIRED) {
                sn = ship.getSN();
                if (sn) {
                    delete this.__arrival_map[sn]
                }
                ++count;
                this.__arrivals.remove(ship)
            }
        }
        var ago = now.getTime() - 3600 * 1000;
        var when;
        var keys = Object.keys(this.__finished_times);
        for (var j = keys.length - 1; j >= 0; --j) {
            sn = keys[j];
            when = this.__finished_times[sn];
            if (!when || when.getTime() < ago) {
                delete this.__finished_times[sn]
            }
        }
        return count
    };
    ns.ArrivalHall = ArrivalHall
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var Enum = sys.type.Enum;
    var BaseObject = sys.type.BaseObject;
    var Departure = ns.port.Departure;
    var ShipStatus = ns.port.ShipStatus;
    var DepartureShip = function (priority, maxTries) {
        BaseObject.call(this);
        if (priority === null) {
            priority = 0
        } else {
            priority = Enum.getInt(priority)
        }
        if (maxTries === null) {
            maxTries = 1 + DepartureShip.RETRIES
        }
        this.__priority = priority;
        this.__tries = maxTries;
        this.__expired = 0
    };
    Class(DepartureShip, BaseObject, [Departure], {
        getPriority: function () {
            return this.__priority
        }, touch: function (now) {
            this.__expired = now.getTime() + DepartureShip.EXPIRES;
            this.__tries -= 1
        }, getStatus: function (now) {
            var expired = this.__expired;
            var fragments = this.getFragments();
            if (!fragments || fragments.length === 0) {
                return ShipStatus.DONE
            } else if (expired === 0) {
                return ShipStatus.NEW
            } else if (now.getTime() < expired) {
                return ShipStatus.WAITING
            } else if (this.__tries > 0) {
                return ShipStatus.TIMEOUT
            } else {
                return ShipStatus.FAILED
            }
        }
    });
    DepartureShip.EXPIRES = 120 * 1000;
    DepartureShip.RETRIES = 2;
    ns.DepartureShip = DepartureShip
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var Arrays = sys.type.Arrays;
    var HashSet = sys.type.HashSet;
    var ShipStatus = ns.port.ShipStatus;
    var DepartureHall = function () {
        Object.call(this);
        this.__all_departures = new HashSet();
        this.__new_departures = [];
        this.__fleets = {};
        this.__priorities = [];
        this.__departure_map = {};
        this.__departure_level = {};
        this.__finished_times = {}
    };
    Class(DepartureHall, Object, null, null);
    DepartureHall.prototype.addDeparture = function (outgo) {
        if (this.__all_departures.contains(outgo)) {
            return false
        } else {
            this.__all_departures.add(outgo)
        }
        var priority = outgo.getPriority();
        var index = this.__new_departures.length;
        while (index > 0) {
            --index;
            if (this.__new_departures[index].getPriority() <= priority) {
                ++index;
                break
            }
        }
        Arrays.insert(this.__new_departures, index, outgo);
        return true
    };
    DepartureHall.prototype.checkResponse = function (response) {
        var sn = response.getSN();
        var time = this.__finished_times[sn];
        if (time) {
            return null
        }
        var ship = this.__departure_map[sn];
        if (ship && ship.checkResponse(response)) {
            removeShip.call(this, ship, sn);
            this.__finished_times[sn] = new Date();
            return ship
        }
        return null
    };
    var removeShip = function (ship, sn) {
        var priority = this.__departure_level[sn];
        if (!priority) {
            priority = 0
        }
        var fleet = this.__fleets[priority];
        if (fleet) {
            Arrays.remove(fleet, ship);
            if (fleet.length === 0) {
                delete this.__fleets[priority]
            }
        }
        delete this.__departure_map[sn];
        delete this.__departure_level[sn];
        this.__all_departures.remove(ship)
    };
    DepartureHall.prototype.getNextDeparture = function (now) {
        var next = getNextNewDeparture.call(this, now);
        if (!next) {
            next = getNextTimeoutDeparture.call(this, now)
        }
        return next
    };
    var getNextNewDeparture = function (now) {
        if (this.__new_departures.length === 0) {
            return null
        }
        var outgo = this.__new_departures.shift();
        var sn = outgo.getSN();
        if (outgo.isImportant() && sn) {
            var priority = outgo.getPriority();
            insertShip.call(this, outgo, priority, sn);
            this.__departure_map[sn] = outgo
        } else {
            this.__all_departures.remove(outgo)
        }
        outgo.touch(now);
        return outgo
    };
    var insertShip = function (outgo, priority, sn) {
        var fleet = this.__fleets[priority];
        if (!fleet) {
            fleet = [];
            this.__fleets[priority] = fleet;
            insertPriority.call(this, priority)
        }
        fleet.push(outgo);
        this.__departure_level[sn] = priority
    };
    var insertPriority = function (priority) {
        var index, value;
        for (index = 0; index < this.__priorities.length; ++index) {
            value = this.__priorities[index];
            if (value === priority) {
                return
            } else if (value > priority) {
                break
            }
        }
        Arrays.insert(this.__priorities, index, priority)
    };
    var getNextTimeoutDeparture = function (now) {
        var priorityList = this.__priorities.slice();
        var departures;
        var fleet;
        var ship;
        var status;
        var sn;
        var prior;
        var i, j;
        for (i = 0; i < priorityList.length; ++i) {
            prior = priorityList[i];
            fleet = this.__fleets[prior];
            if (!fleet) {
                continue
            }
            departures = fleet.slice();
            for (j = 0; j < departures.length; ++j) {
                ship = departures[j];
                sn = ship.getSN();
                status = ship.getStatus(now);
                if (status === ShipStatus.TIMEOUT) {
                    fleet.splice(j, 1);
                    insertShip.call(this, ship, prior + 1, sn);
                    ship.touch(now);
                    return ship
                } else if (status === ShipStatus.FAILED) {
                    fleet.splice(j, 1);
                    delete this.__departure_map[sn];
                    delete this.__departure_level[sn];
                    this.__all_departures.remove(ship);
                    return ship
                }
            }
        }
        return null
    };
    DepartureHall.prototype.purge = function (now) {
        if (!now) {
            now = new Date()
        }
        var count = 0;
        var priorityList = this.__priorities.slice();
        var departures;
        var fleet;
        var ship;
        var sn;
        var prior;
        var i, j;
        for (i = priorityList.length - 1; i >= 0; --i) {
            prior = priorityList[i];
            fleet = this.__fleets[prior];
            if (!fleet) {
                this.__priorities.splice(i, 1);
                continue
            }
            departures = fleet.slice();
            for (j = departures.length - 1; j >= 0; --j) {
                ship = departures[j];
                if (ship.getStatus(now) === ShipStatus.DONE) {
                    fleet.splice(j, 1);
                    sn = ship.getSN();
                    delete this.__departure_map[sn];
                    delete this.__departure_level[sn];
                    this.__finished_times[sn] = now;
                    ++count
                }
            }
            if (fleet.length === 0) {
                delete this.__fleets[prior];
                this.__priorities.splice(i, 1)
            }
        }
        var ago = now.getTime() - 3600 * 1000;
        var keys = Object.keys(this.__finished_times);
        var when;
        for (j = keys.length - 1; j >= 0; --j) {
            sn = keys[j];
            when = this.__finished_times[sn];
            if (!when || when.getTime() < ago) {
                delete this.__finished_times[sn]
            }
        }
        return count
    };
    ns.DepartureHall = DepartureHall
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var ArrivalHall = ns.ArrivalHall;
    var DepartureHall = ns.DepartureHall;
    var Dock = function () {
        Object.call(this);
        this.__arrivalHall = this.createArrivalHall();
        this.__departureHall = this.createDepartureHall()
    };
    Class(Dock, Object, null, null);
    Dock.prototype.createArrivalHall = function () {
        return new ArrivalHall()
    };
    Dock.prototype.createDepartureHall = function () {
        return new DepartureHall()
    };
    Dock.prototype.assembleArrival = function (income) {
        return this.__arrivalHall.assembleArrival(income)
    };
    Dock.prototype.addDeparture = function (outgo) {
        return this.__departureHall.addDeparture(outgo)
    };
    Dock.prototype.checkResponse = function (response) {
        return this.__departureHall.checkResponse(response)
    };
    Dock.prototype.getNextDeparture = function (now) {
        return this.__departureHall.getNextDeparture(now)
    };
    Dock.prototype.purge = function (now) {
        var count = 0;
        count += this.__arrivalHall.purge(now);
        count += this.__departureHall.purge(now);
        return count
    };
    ns.Dock = Dock
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var AddressPairObject = ns.type.AddressPairObject;
    var ShipStatus = ns.port.ShipStatus;
    var Porter = ns.port.Porter;
    var PorterStatus = ns.port.PorterStatus;
    var Dock = ns.Dock;
    var StarPorter = function (remote, local) {
        AddressPairObject.call(this, remote, local);
        this.__dock = this.createDock();
        this.__conn = -1;
        this.__lastOutgo = null;
        this.__lastFragments = [];
        this.__delegate = null
    };
    Class(StarPorter, AddressPairObject, [Porter], {
        toString: function () {
            var clazz = this.getClassName();
            var remote = this.getRemoteAddress();
            var local = this.getLocalAddress();
            var conn = this.getConnection();
            return '<' + clazz + ' remote="' + remote + '" local="' + local + '">\n\t' + conn + '\n</' + clazz + '>'
        }
    });
    StarPorter.prototype.createDock = function () {
        return new Dock()
    };
    StarPorter.prototype.getDelegate = function () {
        return this.__delegate
    };
    StarPorter.prototype.setDelegate = function (keeper) {
        this.__delegate = keeper
    };
    StarPorter.prototype.getConnection = function () {
        var conn = this.__conn;
        return conn === -1 ? null : conn
    };
    StarPorter.prototype.setConnection = function (conn) {
        var old = this.__conn;
        this.__conn = conn;
        if (old && old !== -1 && old !== conn) {
            old.close()
        }
    };
    StarPorter.prototype.isOpen = function () {
        var conn = this.__conn;
        if (conn === -1) {
            return false
        }
        return conn && conn.isOpen()
    };
    StarPorter.prototype.isAlive = function () {
        var conn = this.getConnection();
        return conn && conn.isAlive()
    };
    StarPorter.prototype.getStatus = function () {
        var conn = this.getConnection();
        if (conn) {
            return PorterStatus.getStatus(conn.getState())
        } else {
            return PorterStatus.ERROR
        }
    };
    StarPorter.prototype.sendShip = function (ship) {
        return this.__dock.addDeparture(ship)
    };
    StarPorter.prototype.processReceived = function (data) {
        var incomeShips = this.getArrivals(data);
        if (!incomeShips || incomeShips.length === 0) {
            return
        }
        var keeper = this.getDelegate();
        var income, ship;
        for (var i = 0; i < incomeShips.length; ++i) {
            ship = incomeShips[i];
            income = this.checkArrival(ship);
            if (!income) {
                continue
            }
            if (keeper) {
                keeper.onPorterReceived(income, this)
            }
        }
    };
    StarPorter.prototype.getArrivals = function (data) {
    };
    StarPorter.prototype.checkArrival = function (income) {
    };
    StarPorter.prototype.checkResponse = function (income) {
        var linked = this.__dock.checkResponse(income);
        if (!linked) {
            return null
        }
        var keeper = this.getDelegate();
        if (keeper) {
            keeper.onPorterSent(linked, this)
        }
        return linked
    };
    StarPorter.prototype.assembleArrival = function (income) {
        return this.__dock.assembleArrival(income)
    };
    StarPorter.prototype.getNextDeparture = function (now) {
        return this.__dock.getNextDeparture(now)
    };
    StarPorter.prototype.purge = function (now) {
        this.__dock.purge(now)
    };
    StarPorter.prototype.close = function () {
        this.setConnection(null)
    };
    StarPorter.prototype.process = function () {
        var conn = this.getConnection();
        if (!conn) {
            return false
        } else if (!conn.isVacant()) {
            return false
        }
        var keeper = this.getDelegate();
        var error;
        var outgo = this.__lastOutgo;
        var fragments = this.__lastFragments;
        if (outgo && fragments.length > 0) {
            this.__lastOutgo = null;
            this.__lastFragments = []
        } else {
            var now = new Date();
            outgo = this.getNextDeparture(now);
            if (!outgo) {
                return false
            } else if (outgo.getStatus(now) === ShipStatus.FAILED) {
                if (keeper) {
                    error = new Error('Request timeout');
                    keeper.onPorterFailed(error, outgo, this)
                }
                return true
            } else {
                fragments = outgo.getFragments();
                if (fragments.length === 0) {
                    return true
                }
            }
        }
        var index = 0;
        var sent = 0;
        try {
            var fra;
            for (var i = 0; i < fragments.length; ++i) {
                fra = fragments[i];
                sent = conn.sendData(fra);
                if (sent < fra.length) {
                    break
                } else {
                    index += 1;
                    sent = 0
                }
            }
            if (index < fragments.length) {
                error = new Error('only ' + index + '/' + fragments.length + ' fragments sent.')
            } else {
                if (outgo.isImportant()) {
                } else if (keeper) {
                    keeper.onPorterSent(outgo, this)
                }
                return true
            }
        } catch (e) {
            error = e
        }
        for (; index > 0; --index) {
            fragments.shift()
        }
        if (sent > 0) {
            var last = fragments.shift();
            var part = last.subarray(sent);
            fragments.unshift(part)
        }
        this.__lastOutgo = outgo;
        this.__lastFragments = fragments;
        if (keeper) {
            keeper.onPorterError(error, outgo, this)
        }
        return false
    };
    ns.StarPorter = StarPorter
})(StarTrek, MONKEY);
(function (ns, sys) {
    'use strict';
    var Class = sys.type.Class;
    var AddressPairMap = ns.type.AddressPairMap;
    var ConnectionDelegate = ns.net.ConnectionDelegate;
    var ConnectionStateOrder = ns.net.ConnectionStateOrder;
    var PorterStatus = ns.port.PorterStatus;
    var Gate = ns.port.Gate;
    var StarPorter = ns.StarPorter;
    var PorterPool = function () {
        AddressPairMap.call(this)
    };
    Class(PorterPool, AddressPairMap, null, {
        set: function (remote, local, value) {
            var cached = AddressPairMap.prototype.remove.call(this, remote, local, value);
            AddressPairMap.prototype.set.call(this, remote, local, value);
            return cached
        }
    });
    var StarGate = function (keeper) {
        Object.call(this);
        this.__delegate = keeper;
        this.__porterPool = this.createPorterPool()
    };
    Class(StarGate, Object, [Gate, ConnectionDelegate], null);
    StarGate.prototype.createPorterPool = function () {
        return new PorterPool()
    };
    StarGate.prototype.getDelegate = function () {
        return this.__delegate
    };
    StarGate.prototype.sendData = function (payload, remote, local) {
        var docker = this.getPorter(remote, local);
        if (!docker) {
            return false
        } else if (!docker.isAlive()) {
            return false
        }
        return docker.sendData(payload)
    };
    StarGate.prototype.sendShip = function (outgo, remote, local) {
        var docker = this.getPorter(remote, local);
        if (!docker) {
            return false
        } else if (!docker.isAlive()) {
            return false
        }
        return docker.sendShip(outgo)
    };
    StarGate.prototype.createPorter = function (remote, local) {
    };
    StarGate.prototype.allPorters = function () {
        return this.__porterPool.items()
    };
    StarGate.prototype.getPorter = function (remote, local) {
        return this.__porterPool.get(remote, local)
    };
    StarGate.prototype.setPorter = function (remote, local, porter) {
        return this.__porterPool.set(remote, local, porter)
    };
    StarGate.prototype.removePorter = function (remote, local, porter) {
        return this.__porterPool.remove(remote, local, porter)
    };
    StarGate.prototype.dock = function (connection, shouldCreatePorter) {
        var remote = connection.getRemoteAddress();
        var local = connection.getLocalAddress();
        if (!remote) {
            return null
        }
        var docker;
        var old = this.getPorter(remote, local);
        if (!old && shouldCreatePorter) {
            docker = this.createPorter(remote, local);
            var cached = this.setPorter(remote, local, docker);
            if (cached && cached !== docker) {
                cached.close()
            }
        } else {
            docker = old
        }
        if (!old && docker instanceof StarPorter) {
            docker.setConnection(connection)
        }
        return docker
    };
    StarGate.prototype.process = function () {
        var dockers = this.allPorters();
        var count = this.drivePorters(dockers);
        this.cleanupPorters(dockers);
        return count > 0
    };
    StarGate.prototype.drivePorters = function (porters) {
        var count = 0;
        for (var i = porters.length - 1; i >= 0; --i) {
            if (porters[i].process()) {
                ++count
            }
        }
        return count
    };
    StarGate.prototype.cleanupPorters = function (porters) {
        var now = new Date();
        var cached, docker;
        var remote, local;
        for (var i = porters.length - 1; i >= 0; --i) {
            docker = porters[i];
            if (docker.isOpen()) {
                docker.purge(now)
            } else {
                remote = docker.getRemoteAddress();
                local = docker.getLocalAddress();
                cached = this.removePorter(remote, local, docker);
                if (cached && cached !== docker) {
                    cached.close()
                }
            }
        }
    };
    StarGate.prototype.heartbeat = function (connection) {
        var remote = connection.getRemoteAddress();
        var local = connection.getLocalAddress();
        var docker = this.getPorter(remote, local);
        if (docker) {
            docker.heartbeat()
        }
    };
    StarGate.prototype.onConnectionStateChanged = function (previous, current, connection) {
        var s1 = PorterStatus.getStatus(previous);
        var s2 = PorterStatus.getStatus(current);
        if (s1 !== s2) {
            var notFinished = s2 !== PorterStatus.ERROR;
            var docker = this.dock(connection, notFinished);
            if (!docker) {
                return
            }
            var keeper = this.getDelegate();
            if (keeper) {
                keeper.onPorterStatusChanged(s1, s2, docker)
            }
        }
        var index = !current ? -1 : current.getIndex();
        if (ConnectionStateOrder.EXPIRED.equals(index)) {
            this.heartbeat(connection)
        }
    };
    StarGate.prototype.onConnectionReceived = function (data, connection) {
        var docker = this.dock(connection, true);
        if (docker) {
            docker.processReceived(data)
        }
    };
    StarGate.prototype.onConnectionSent = function (sent, data, connection) {
    };
    StarGate.prototype.onConnectionFailed = function (error, data, connection) {
    };
    StarGate.prototype.onConnectionError = function (error, connection) {
    };
    ns.StarGate = StarGate
})(StarTrek, MONKEY);
;
if (typeof StarGate !== 'object') {
    StarGate = StarTrek
}
(function (ns) {
    "use strict";
    if (typeof ns.fsm !== 'object') {
        ns.fsm = FiniteStateMachine
    }
    if (typeof ns.dos !== 'object') {
        ns.dos = {}
    }
    if (typeof ns.lnc !== 'object') {
        ns.lnc = {}
    }
    if (typeof ns.network !== 'object') {
        ns.network = {}
    }
    if (typeof ns.ws !== 'object') {
        ns.ws = {}
    }
})(StarGate);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var JsON = sys.format.JSON;
    var Base64 = sys.format.Base64;
    var Storage = function (storage, prefix) {
        Object.call(this);
        this.storage = storage;
        if (prefix) {
            this.ROOT = prefix
        } else {
            this.ROOT = 'dim'
        }
    };
    Class(Storage, Object, null, null);
    Storage.prototype.getItem = function (key) {
        return this.storage.getItem(key)
    };
    Storage.prototype.setItem = function (key, value) {
        this.storage.setItem(key, value)
    };
    Storage.prototype.removeItem = function (key) {
        this.storage.removeItem(key)
    };
    Storage.prototype.clear = function () {
        this.storage.clear()
    };
    Storage.prototype.getLength = function () {
        return this.storage.length
    };
    Storage.prototype.key = function (index) {
        return this.storage.key(index)
    };
    Storage.prototype.exists = function (path) {
        return !!this.getItem(this.ROOT + '.' + path)
    };
    Storage.prototype.loadText = function (path) {
        return this.getItem(this.ROOT + '.' + path)
    };
    Storage.prototype.loadData = function (path) {
        var base64 = this.loadText(path);
        if (!base64) {
            return null
        }
        return Base64.decode(base64)
    };
    Storage.prototype.loadJSON = function (path) {
        var json = this.loadText(path);
        if (!json) {
            return null
        }
        return JsON.decode(json)
    };
    Storage.prototype.remove = function (path) {
        this.removeItem(this.ROOT + '.' + path);
        return true
    };
    Storage.prototype.saveText = function (text, path) {
        if (text) {
            this.setItem(this.ROOT + '.' + path, text);
            return true
        } else {
            this.removeItem(this.ROOT + '.' + path);
            return false
        }
    };
    Storage.prototype.saveData = function (data, path) {
        var base64 = null;
        if (data) {
            base64 = Base64.encode(data)
        }
        return this.saveText(base64, path)
    };
    Storage.prototype.saveJSON = function (container, path) {
        var json = null;
        if (container) {
            json = JsON.encode(container)
        }
        return this.saveText(json, path)
    };
    ns.dos.LocalStorage = new Storage(window.localStorage, 'dim.fs');
    ns.dos.SessionStorage = new Storage(window.sessionStorage, 'dim.mem')
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var Enum = sys.type.Enum;
    var debugFlag = 1 << 0;
    var infoFlag = 1 << 1;
    var warningFlag = 1 << 2;
    var errorFlag = 1 << 3;
    var LogLevel = Enum('LogLevel', {
        DEBUG: debugFlag | infoFlag | warningFlag | errorFlag,
        DEVELOP: infoFlag | warningFlag | errorFlag,
        RELEASE: warningFlag | errorFlag
    });
    var check_level = function (flag) {
        return shared.level & flag
    };
    var Log = {
        debug: function (...data) {
            if (check_level(debugFlag)) {
                shared.logger.debug.apply(shared.logger, arguments)
            }
        }, info: function (...data) {
            if (check_level(infoFlag)) {
                shared.logger.info.apply(shared.logger, arguments)
            }
        }, warning: function (...data) {
            if (check_level(warningFlag)) {
                shared.logger.warning.apply(shared.logger, arguments)
            }
        }, error: function (...data) {
            if (check_level(errorFlag)) {
                shared.logger.error.apply(shared.logger, arguments)
            }
        }, showTime: false
    };
    Log.setLevel = function (level) {
        if (Enum.isEnum(level)) {
            level = level.getValue()
        }
        shared.level = level
    };
    Log.setLogger = function (logger) {
        shared.logger = logger
    };
    var Logger = Interface(null, null);
    Logger.prototype.debug = function (...data) {
    };
    Logger.prototype.info = function (...data) {
    };
    Logger.prototype.warning = function (...data) {
    };
    Logger.prototype.error = function (...data) {
    };
    var DefaultLogger = function () {
        Object.call(this)
    };
    Class(DefaultLogger, Object, [Logger], {
        debug: function () {
            console.debug.apply(console, _args(arguments))
        }, info: function () {
            console.info.apply(console, _args(arguments))
        }, warning: function () {
            console.warn.apply(console, _args(arguments))
        }, error: function () {
            console.error.apply(console, _args(arguments))
        }
    });
    var _args = function (args) {
        if (Log.showTime === false) {
            return args
        }
        var array = ['[' + current_time() + ']'];
        for (var i = 0; i < args.length; ++i) {
            array.push(args[i])
        }
        return array
    };
    var current_time = function () {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth();
        var date = now.getDate();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        return year + '-' + _pad(month + 1) + '-' + _pad(date) + ' ' + _pad(hours) + ':' + _pad(minutes) + ':' + _pad(seconds)
    };
    var _pad = function (value) {
        if (value < 10) {
            return '0' + value
        } else {
            return '' + value
        }
    };
    var shared = {logger: new DefaultLogger(), level: LogLevel.RELEASE.getValue()};
    ns.lnc.LogLevel = LogLevel;
    ns.lnc.Logger = Logger;
    ns.lnc.Log = Log
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Notification = function (name, sender, userInfo) {
        Object.call(this);
        this.__name = name;
        this.__sender = sender;
        this.__info = userInfo
    };
    Class(Notification, Object, null, {
        toString: function () {
            var clazz = this.getClassName();
            return '<' + clazz + ' name="' + this.getName() + '>\n' + '\t<sender>' + this.getSender() + '</sender>\n' + '\t<info>' + this.getUserInfo() + '</info>\n' + '</' + clazz + '>'
        }
    });
    Notification.prototype.getName = function () {
        return this.__name
    };
    Notification.prototype.getSender = function () {
        return this.__sender
    };
    Notification.prototype.getUserInfo = function () {
        return this.__info
    };
    ns.lnc.Notification = Notification
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Interface = sys.type.Interface;
    var Observer = Interface(null, null);
    Observer.prototype.onReceiveNotification = function (notification) {
    };
    ns.lnc.Observer = Observer
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var HashSet = sys.type.HashSet;
    var Log = ns.lnc.Log;
    var Observer = ns.lnc.Observer;
    var BaseCenter = function () {
        Object.call(this);
        this.__observers = {}
    };
    Class(BaseCenter, Object, null, null);
    BaseCenter.prototype.addObserver = function (observer, name) {
        var set = this.__observers[name];
        if (!set) {
            set = new HashSet();
            this.__observers[name] = set
        } else if (set.contains(observer)) {
            return false
        }
        return set.add(observer)
    };
    BaseCenter.prototype.removeObserver = function (observer, name) {
        if (name) {
            remove.call(this, observer, name)
        } else {
            var names = Object.keys(this.__observers);
            for (var i = names.length - 1; i >= 0; --i) {
                remove.call(this, observer, names[i])
            }
        }
    };
    var remove = function (observer, name) {
        var set = this.__observers[name];
        if (set) {
            set.remove(observer);
            if (set.isEmpty()) {
                delete this.__observers[name]
            }
        }
    };
    BaseCenter.prototype.postNotification = function (notification) {
        var set = this.__observers[notification.getName()];
        if (!set || set.isEmpty()) {
            return
        }
        var observers = set.toArray();
        var obs;
        for (var i = observers.length - 1; i >= 0; --i) {
            obs = observers[i];
            try {
                if (Interface.conforms(obs, Observer)) {
                    obs.onReceiveNotification(notification)
                } else if (typeof obs === 'function') {
                    obs.call(notification)
                } else {
                    Log.error('Notification observer error', obs, notification)
                }
            } catch (e) {
                Log.error('DefaultCenter::post() error', notification, obs, e)
            }
        }
    };
    ns.lnc.BaseCenter = BaseCenter
})(StarGate, MONKEY);
(function (ns) {
    "use strict";
    var BaseCenter = ns.lnc.BaseCenter;
    var Notification = ns.lnc.Notification;
    var NotificationCenter = {
        addObserver: function (observer, name) {
            this.defaultCenter.addObserver(observer, name)
        }, removeObserver: function (observer, name) {
            this.defaultCenter.removeObserver(observer, name)
        }, postNotification: function (notification, sender, userInfo) {
            if (notification instanceof Notification) {
                this.defaultCenter.postNotification(notification)
            } else {
                notification = new Notification(notification, sender, userInfo);
                this.defaultCenter.postNotification(notification)
            }
        }, defaultCenter: new BaseCenter()
    };
    NotificationCenter.getInstance = function () {
        return this
    };
    ns.lnc.NotificationCenter = NotificationCenter
})(StarGate);
(function (ns, fsm, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Runnable = fsm.skywalker.Runnable;
    var Thread = fsm.threading.Thread;
    var BaseCenter = ns.lnc.BaseCenter;
    var Notification = ns.lnc.Notification;
    var AsyncCenter = function () {
        BaseCenter.call(this);
        this.__notifications = [];
        this.__running = false;
        this.__thread = null
    };
    Class(AsyncCenter, BaseCenter, [Runnable], {
        postNotification: function (notification, sender, userInfo) {
            if (typeof notification === 'string') {
                notification = new Notification(notification, sender, userInfo)
            }
            this.__notifications.push(notification)
        }, run: function () {
            while (this.isRunning()) {
                if (!this.process()) {
                    return true
                }
            }
            return false
        }, process: function () {
            var notification = this.__notifications.shift();
            if (notification) {
                this.postNotification(notification);
                return true
            } else {
                return false
            }
        }
    });
    AsyncCenter.prototype.start = function () {
        force_stop.call(this);
        this.__running = true;
        var thread = new Thread(this);
        thread.start();
        this.__thread = thread
    };
    AsyncCenter.prototype.stop = function () {
        force_stop.call(this)
    };
    var force_stop = function () {
        var thread = this.__thread;
        if (thread) {
            this.__thread = null;
            thread.stop()
        }
    };
    AsyncCenter.prototype.isRunning = function () {
        return this.__running
    };
    ns.lnc.AsyncCenter = AsyncCenter
})(StarGate, FiniteStateMachine, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var ConstantString = sys.type.ConstantString;
    var Host = function (string, ip, port, data) {
        ConstantString.call(this, string);
        this.ip = ip;
        this.port = port;
        this.data = data
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
                array[index] = data[index]
            }
        } else {
            array = new Uint8Array(len + 2);
            for (index = 0; index < len; ++index) {
                array[index] = data[index]
            }
            array[len] = port >> 8;
            array[len + 1] = port & 0xFF
        }
        return array
    };
    ns.network.Host = Host
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Host = ns.network.Host;
    var IPv4 = function (ip, port, data) {
        if (data) {
            if (!ip) {
                ip = data[0] + '.' + data[1] + '.' + data[2] + '.' + data[3];
                if (data.length === 6) {
                    port = (data[4] << 8) | data[5]
                }
            }
        } else if (ip) {
            data = new Uint8Array(4);
            var array = ip.split('.');
            for (var index = 0; index < 4; ++index) {
                data[index] = parseInt(array[index], 10)
            }
        } else {
            throw new URIError('IP data empty: ' + data + ', ' + ip + ', ' + port);
        }
        var string;
        if (port === 0) {
            string = ip
        } else {
            string = ip + ':' + port
        }
        Host.call(this, string, ip, port, data)
    };
    Class(IPv4, Host, null);
    IPv4.patten = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;
    IPv4.parse = function (host) {
        if (!this.patten.test(host)) {
            return null
        }
        var pair = host.split(':');
        var ip = pair[0], port = 0;
        if (pair.length === 2) {
            port = parseInt(pair[1])
        }
        return new IPv4(ip, port)
    };
    ns.network.IPv4 = IPv4
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Host = ns.network.Host;
    var parse_v4 = function (data, array) {
        var item, index = data.byteLength;
        for (var i = array.length - 1; i >= 0; --i) {
            item = array[i];
            data[--index] = item
        }
        return data
    };
    var parse_v6 = function (data, ip, count) {
        var array, item, index;
        var pos = ip.indexOf('::');
        if (pos < 0) {
            array = ip.split(':');
            index = -1;
            for (var i = 0; i < count; ++i) {
                item = parseInt(array[i], 16);
                data[++index] = item >> 8;
                data[++index] = item & 0xFF
            }
        } else {
            var left = ip.substring(0, pos).split(':');
            index = -1;
            for (var j = 0; j < left.length; ++j) {
                item = parseInt(left[j], 16);
                data[++index] = item >> 8;
                data[++index] = item & 0xFF
            }
            var right = ip.substring(pos + 2).split(':');
            index = count * 2;
            for (var k = right.length - 1; k >= 0; --k) {
                item = parseInt(right[k], 16);
                data[--index] = item & 0xFF;
                data[--index] = item >> 8
            }
        }
        return data
    };
    var hex_encode = function (hi, lo) {
        if (hi > 0) {
            if (lo >= 16) {
                return Number(hi).toString(16) + Number(lo).toString(16)
            }
            return Number(hi).toString(16) + '0' + Number(lo).toString(16)
        } else {
            return Number(lo).toString(16)
        }
    };
    var IPv6 = function (ip, port, data) {
        if (data) {
            if (!ip) {
                ip = hex_encode(data[0], data[1]);
                for (var index = 2; index < 16; index += 2) {
                    ip += ':' + hex_encode(data[index], data[index + 1])
                }
                ip = ip.replace(/:(0:){2,}/, '::');
                ip = ip.replace(/^(0::)/, '::');
                ip = ip.replace(/(::0)$/, '::');
                if (data.length === 18) {
                    port = (data[16] << 8) | data[17]
                }
            }
        } else if (ip) {
            data = new Uint8Array(16);
            var array = ip.split('.');
            if (array.length === 1) {
                data = parse_v6(data, ip, 8)
            } else if (array.length === 4) {
                var prefix = array[0];
                var pos = prefix.lastIndexOf(':');
                array[0] = prefix.substring(pos + 1);
                prefix = prefix.substring(0, pos);
                data = parse_v6(data, prefix, 6);
                data = parse_v4(data, array)
            } else {
                throw new URIError('IPv6 format error: ' + ip);
            }
        } else {
            throw new URIError('IP data empty: ' + data + ', ' + ip + ', ' + port);
        }
        var string;
        if (port === 0) {
            string = ip
        } else {
            string = '[' + ip + ']:' + port
        }
        Host.call(this, string, ip, port, data)
    };
    Class(IPv6, Host, null);
    IPv6.patten = /^\[?([0-9A-Fa-f]{0,4}:){2,7}[0-9A-Fa-f]{0,4}(]:\d{1,5})?$/;
    IPv6.patten_compat = /^\[?([0-9A-Fa-f]{0,4}:){2,6}(\d{1,3}.){3}\d{1,3}(]:\d{1,5})?$/;
    IPv6.parse = function (host) {
        if (!this.patten.test(host) && !this.patten_compat.test(host)) {
            return null
        }
        var ip, port;
        if (host.charAt(0) === '[') {
            var pos = host.indexOf(']');
            ip = host.substring(1, pos);
            port = parseInt(host.substring(pos + 2))
        } else {
            ip = host;
            port = 0
        }
        return new IPv6(ip, port)
    };
    ns.network.IPv6 = IPv6
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var connect = function (url, proxy) {
        var ws = new WebSocket(url);
        ws.onopen = function (ev) {
            proxy.onConnected()
        };
        ws.onclose = function (ev) {
            proxy.onClosed()
        };
        ws.onerror = function (ev) {
            var error = new Error('WebSocket error: ' + ev);
            proxy.onError(error)
        };
        ws.onmessage = function (ev) {
            var data = ev.data;
            if (!data || data.length === 0) {
                return
            } else if (typeof data === 'string') {
                data = sys.format.UTF8.encode(data)
            } else if (data instanceof Uint8Array) {
            } else {
                data = new Uint8Array(data)
            }
            proxy.onReceived(data)
        };
        return ws
    };
    var build_url = function (host, port) {
        if ('https' === window.location.protocol.split(':')[0]) {
            return 'wss://' + host + ':' + port
        } else {
            return 'ws://' + host + ':' + port
        }
    };
    var Socket = function () {
        Object.call(this);
        this.__packages = [];
        this.__connected = -1;
        this.__closed = -1;
        this.__host = null;
        this.__port = null;
        this.__ws = null;
        this.__remote = null;
        this.__local = null
    };
    Class(Socket, Object, null);
    Socket.prototype.getHost = function () {
        return this.__host
    };
    Socket.prototype.getPort = function () {
        return this.__port
    };
    Socket.prototype.onConnected = function () {
        this.__connected = true
    };
    Socket.prototype.onClosed = function () {
        this.__closed = true
    };
    Socket.prototype.onError = function (error) {
        this.__connected = false
    };
    Socket.prototype.onReceived = function (data) {
        this.__packages.push(data)
    };
    Socket.prototype.configureBlocking = function () {
    };
    Socket.prototype.isBlocking = function () {
        return false
    };
    Socket.prototype.isOpen = function () {
        return this.__closed === false
    };
    Socket.prototype.isConnected = function () {
        return this.__connected === true
    };
    Socket.prototype.isBound = function () {
        return this.__connected === true
    };
    Socket.prototype.isAlive = function () {
        return this.isOpen() && (this.isConnected() || this.isBound())
    };
    Socket.prototype.getRemoteAddress = function () {
        return this.__remote
    };
    Socket.prototype.getLocalAddress = function () {
        return this.__local
    };
    Socket.prototype.bind = function (local) {
        this.__local = local
    };
    Socket.prototype.connect = function (remote) {
        this.close();
        this.__closed = false;
        this.__connected = false;
        this.__remote = remote;
        this.__host = remote.getHost();
        this.__port = remote.getPort();
        var url = build_url(this.__host, this.__port);
        this.__ws = connect(url, this)
    };
    Socket.prototype.close = function () {
        if (this.__ws) {
            this.__ws.close();
            this.__ws = null
        }
    };
    Socket.prototype.read = function (maxLen) {
        if (this.__packages.length > 0) {
            return this.__packages.shift()
        } else {
            return null
        }
    };
    Socket.prototype.write = function (data) {
        this.__ws.send(data);
        return data.length
    };
    Socket.prototype.receive = function (maxLen) {
        return this.read(maxLen)
    };
    Socket.prototype.send = function (data, remote) {
        return this.write(data)
    };
    ns.ws.Socket = Socket
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var ChannelReader = ns.socket.ChannelReader;
    var ChannelWriter = ns.socket.ChannelWriter;
    var BaseChannel = ns.socket.BaseChannel;
    var StreamChannelReader = function (channel) {
        ChannelReader.call(this, channel)
    };
    Class(StreamChannelReader, ChannelReader, null, {
        receive: function (maxLen) {
            return this.read(maxLen)
        }
    });
    var StreamChannelWriter = function (channel) {
        ChannelWriter.call(this, channel)
    };
    Class(StreamChannelWriter, ChannelWriter, null, {
        send: function (data, target) {
            return this.write(data)
        }
    });
    var StreamChannel = function (remote, local) {
        BaseChannel.call(this, remote, local)
    };
    Class(StreamChannel, BaseChannel, null, {
        createReader: function () {
            return new StreamChannelReader(this)
        }, createWriter: function () {
            return new StreamChannelWriter(this)
        }
    });
    ns.ws.StreamChannelReader = StreamChannelReader;
    ns.ws.StreamChannelWriter = StreamChannelWriter;
    ns.ws.StreamChannel = StreamChannel
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var AddressPairMap = ns.type.AddressPairMap;
    var BaseHub = ns.socket.BaseHub;
    var StreamChannel = ns.ws.StreamChannel;
    var ChannelPool = function () {
        AddressPairMap.call(this)
    };
    Class(ChannelPool, AddressPairMap, null, {
        set: function (remote, local, value) {
            var cached = AddressPairMap.prototype.remove.call(this, remote, local, value);
            AddressPairMap.prototype.set.call(this, remote, local, value);
            return cached
        }
    })
    var StreamHub = function (gate) {
        BaseHub.call(this, gate);
        this.__channelPool = this.createChannelPool()
    };
    Class(StreamHub, BaseHub, null, null);
    StreamHub.prototype.createChannelPool = function () {
        return new ChannelPool()
    };
    StreamHub.prototype.createChannel = function (remote, local) {
        return new StreamChannel(remote, local)
    };
    StreamHub.prototype.allChannels = function () {
        return this.__channelPool.items()
    };
    StreamHub.prototype.removeChannel = function (remote, local, channel) {
        this.__channelPool.remove(remote, null, channel)
    };
    StreamHub.prototype.getChannel = function (remote, local) {
        return this.__channelPool.get(remote, null)
    };
    StreamHub.prototype.setChannel = function (remote, local, channel) {
        this.__channelPool.set(remote, null, channel)
    };
    StreamHub.prototype.removeConnection = function (remote, local, connection) {
        return BaseHub.prototype.removeConnection.call(this, remote, null, connection)
    };
    StreamHub.prototype.getConnection = function (remote, local) {
        return BaseHub.prototype.getConnection.call(this, remote, null)
    };
    StreamHub.prototype.setConnection = function (remote, local, connection) {
        return BaseHub.prototype.setConnection.call(this, remote, null, connection)
    };
    ns.ws.ChannelPool = ChannelPool;
    ns.ws.StreamHub = StreamHub
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Log = ns.lnc.Log;
    var BaseChannel = ns.socket.BaseChannel;
    var ActiveConnection = ns.socket.ActiveConnection;
    var StreamHub = ns.ws.StreamHub;
    var Socket = ns.ws.Socket;
    var ClientHub = function (delegate) {
        StreamHub.call(this, delegate)
    };
    Class(ClientHub, StreamHub, null, {
        createConnection: function (remote, local) {
            var conn = new ActiveConnection(remote, local);
            conn.setDelegate(this.getDelegate());
            return conn
        }, open: function (remote, local) {
            if (!remote) {
                throw new ReferenceError('remote address empty')
            }
            var channel;
            var old = this.getChannel(remote, local);
            if (!old) {
                channel = this.createChannel(remote, local);
                var cached = this.setChannel(remote, local, channel);
                if (cached && cached !== channel) {
                    cached.close()
                }
            } else {
                channel = old
            }
            if (!old && channel instanceof BaseChannel) {
                var sock = createWebSocketClient.call(this, remote, local);
                if (sock) {
                    channel.setSocket(sock)
                } else {
                    Log.error('[WS] failed to prepare socket', remote, local);
                    this.removeChannel(remote, local, channel)
                }
            }
            return channel
        }
    });
    var createWebSocketClient = function (remote, local) {
        var sock = new Socket();
        sock.configureBlocking(true);
        if (local) {
            sock.bind(local)
        }
        sock.connect(remote);
        sock.configureBlocking(false);
        return sock
    };
    ns.ws.ClientHub = ClientHub
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var ArrivalShip = ns.ArrivalShip;
    var PlainArrival = function (data, now) {
        ArrivalShip.call(this, now);
        this.__data = data
    };
    Class(PlainArrival, ArrivalShip, null, null);
    PlainArrival.prototype.getPayload = function () {
        return this.__data
    };
    PlainArrival.prototype.getSN = function () {
        return null
    };
    PlainArrival.prototype.assemble = function (arrival) {
        return arrival
    };
    ns.PlainArrival = PlainArrival
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var DepartureShip = ns.DepartureShip;
    var PlainDeparture = function (data, prior) {
        if (!prior) {
            prior = 0
        }
        DepartureShip.call(this, prior, 1);
        this.__completed = data;
        this.__fragments = [data]
    };
    Class(PlainDeparture, DepartureShip, null, null);
    PlainDeparture.prototype.getPayload = function () {
        return this.__completed
    };
    PlainDeparture.prototype.getSN = function () {
        return null
    };
    PlainDeparture.prototype.getFragments = function () {
        return this.__fragments
    };
    PlainDeparture.prototype.checkResponse = function (arrival) {
        return false
    };
    PlainDeparture.prototype.isImportant = function (arrival) {
        return false
    };
    ns.PlainDeparture = PlainDeparture
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var UTF8 = sys.format.UTF8;
    var Departure = ns.port.Departure;
    var StarPorter = ns.StarPorter;
    var PlainArrival = ns.PlainArrival;
    var PlainDeparture = ns.PlainDeparture;
    var PlainPorter = function (remote, local) {
        StarPorter.call(this, remote, local)
    };
    Class(PlainPorter, StarPorter, null, {
        createArrival: function (data) {
            return new PlainArrival(data, null)
        }, createDeparture: function (data, priority) {
            return new PlainDeparture(data, priority)
        }, getArrivals: function (data) {
            if (!data || data.length === 0) {
                return []
            }
            return [this.createArrival(data)]
        }, checkArrival: function (income) {
            var data = income.getPayload();
            if (data.length === 4) {
                init_bytes();
                if (bytes_equal(data, PING)) {
                    this.send(PONG, Departure.Priority.SLOWER.getValue());
                    return null
                } else if (bytes_equal(data, PONG) || bytes_equal(data, NOOP)) {
                    return null
                }
            }
            return income
        }, send: function (payload, priority) {
            var ship = this.createDeparture(payload, priority);
            return this.sendShip(ship)
        }, sendData: function (payload) {
            var priority = Departure.Priority.NORMAL.getValue();
            return this.send(payload, priority)
        }, heartbeat: function () {
            init_bytes();
            var priority = Departure.Priority.SLOWER.getValue();
            this.send(PING, priority)
        }
    });
    var bytes_equal = function (data1, data2) {
        if (data1.length !== data2.length) {
            return false
        }
        for (var i = data1.length - 1; i >= 0; --i) {
            if (data1[i] !== data2[i]) {
                return false
            }
        }
        return true
    };
    var init_bytes = function () {
        if (typeof PING === 'string') {
            PING = UTF8.encode(PING);
            PONG = UTF8.encode(PONG);
            NOOP = UTF8.encode(NOOP)
        }
    }
    var PING = 'PING';
    var PONG = 'PONG';
    var NOOP = 'NOOP';
    ns.PlainPorter = PlainPorter
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Log = ns.lnc.Log;
    var ActiveConnection = ns.socket.ActiveConnection;
    var StarGate = ns.StarGate;
    var BaseGate = function (keeper) {
        StarGate.call(this, keeper);
        this.__hub = null
    };
    Class(BaseGate, StarGate, null, {
        setHub: function (hub) {
            this.__hub = hub
        }, getHub: function () {
            return this.__hub
        }, removePorter: function (remote, local, porter) {
            return StarGate.prototype.removePorter.call(this, remote, null, porter)
        }, getPorter: function (remote, local) {
            return StarGate.prototype.getPorter.call(this, remote, null)
        }, setPorter: function (remote, local, porter) {
            return StarGate.prototype.setPorter.call(this, remote, null, porter)
        }, fetchPorter: function (remote, local) {
            var hub = this.getHub();
            if (!hub) {
                throw new ReferenceError('Gate hub not found');
            }
            var conn = hub.connect(remote, local);
            if (!conn) {
                return null
            }
            return this.dock(conn, true)
        }, sendResponse: function (payload, ship, remote, local) {
            var docker = this.getPorter(remote, local);
            if (!docker) {
                Log.error('docker not found', remote, local);
                return false
            } else if (!docker.isAlive()) {
                Log.error('docker not alive', remote, local);
                return false
            }
            return docker.sendData(payload)
        }, heartbeat: function (connection) {
            if (connection instanceof ActiveConnection) {
                StarGate.prototype.heartbeat.call(this, connection)
            }
        }
    });
    ns.BaseGate = BaseGate
})(StarGate, MONKEY);
(function (ns, fsm, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Log = ns.lnc.Log;
    var Runnable = fsm.skywalker.Runnable;
    var Thread = fsm.threading.Thread;
    var BaseGate = ns.BaseGate;
    var AutoGate = function (delegate) {
        BaseGate.call(this, delegate);
        this.__running = false;
        this.__thread = new Thread(this)
    };
    Class(AutoGate, BaseGate, [Runnable], {
        isRunning: function () {
            return this.__running
        }, start: function () {
            this.__running = true;
            this.__thread.start()
        }, stop: function () {
            this.__running = false
        }, run: function () {
            if (!this.isRunning()) {
                return false
            }
            var busy = this.process();
            if (busy) {
                Log.debug('client busy', busy)
            }
            return true
        }, process: function () {
            var hub = this.getHub();
            try {
                var incoming = hub.process();
                var outgoing = BaseGate.prototype.process.call(this);
                return incoming || outgoing
            } catch (e) {
                Log.error('client process error', e)
            }
        }, getChannel: function (remote, local) {
            var hub = this.getHub();
            return hub.open(remote, local)
        }
    });
    ns.AutoGate = AutoGate
})(StarGate, FiniteStateMachine, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Log = ns.lnc.Log;
    var AutoGate = ns.AutoGate;
    var PlainPorter = ns.PlainPorter;
    var WSClientGate = function (delegate) {
        AutoGate.call(this, delegate)
    };
    Class(WSClientGate, AutoGate, null, {
        createPorter: function (remote, local) {
            var docker = new PlainPorter(remote, local);
            docker.setDelegate(this.getDelegate());
            return docker
        }, sendMessage: function (payload, remote, local) {
            var docker = this.fetchPorter(remote, local);
            if (!docker) {
                Log.error('docker not found', remote, local);
                return false
            } else if (!docker.isAlive()) {
                Log.error('docker not alive', remote, local);
                return false
            }
            return docker.sendData(payload)
        }
    });
    ns.WSClientGate = WSClientGate
})(StarGate, MONKEY);
;(function (ns, fsm, startrek) {
    'use strict';
    if (typeof ns.fsm !== 'object') {
        ns.fsm = fsm
    }
    if (typeof ns.startrek !== 'object') {
        ns.startrek = startrek
    }
})(DIMP, FiniteStateMachine, StarTrek);
(function (ns, sg) {
    'use strict';
    if (typeof ns.dos !== 'object') {
        ns.dos = sg.dos
    }
    if (typeof ns.lnc !== 'object') {
        ns.lnc = sg.lnc
    }
    if (typeof ns.network !== 'object') {
        ns.network = sg.network
    }
    if (typeof ns.ws !== 'object') {
        ns.ws = sg.ws
    }
    if (typeof ns.mem !== 'object') {
        ns.mem = {}
    }
    if (typeof ns.dbi !== 'object') {
        ns.dbi = {}
    }
    if (typeof ns.group !== 'object') {
        ns.group = {}
    }
    if (typeof ns.database !== 'object') {
        ns.database = {}
    }
})(DIMP, StarGate);
(function (ns) {
    'use strict';
    var IObject = ns.type.Object;
    var Enum = ns.type.Enum;
    var MetaType = Enum('MetaType', {
        DEFAULT: (0x01),
        MKM: (0x01),
        BTC: (0x02),
        ExBTC: (0x03),
        ETH: (0x04),
        ExETH: (0x05)
    });
    var toString = function (type) {
        type = Enum.getInt(type);
        return type.toString()
    };
    var hasSeed = function (type) {
        type = parseNumber(type, 0);
        var mkm = MetaType.MKM.getValue();
        return type > 0 && (type & mkm) === mkm
    };
    var parseNumber = function (type, defaultValue) {
        if (type === null) {
            return defaultValue
        } else if (IObject.isNumber(type)) {
            return type
        } else if (IObject.isString(type)) {
            if (type === 'MKM' || type === 'mkm') {
                return 1
            } else if (type === 'BTC' || type === 'btc') {
                return 2
            } else if (type === 'ETH' || type === 'eth') {
                return 4
            }
        } else if (Enum.isEnum(type)) {
            return type.getValue()
        } else {
            return -1
        }
        try {
            return parseInt(type)
        } catch (e) {
            return -1
        }
    };
    MetaType.toString = toString;
    MetaType.hasSeed = hasSeed;
    MetaType.parseInt = parseNumber;
    ns.protocol.MetaType = MetaType
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var IObject = ns.type.Object;
    var Command = ns.protocol.Command;
    var MetaCommand = ns.protocol.MetaCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var MetaType = ns.protocol.MetaType;
    var fixMetaAttachment = function (rMsg) {
        var meta = rMsg.getValue('meta');
        if (meta) {
            fixMetaVersion(meta)
        }
    };
    var fixMetaVersion = function (meta) {
        var type = meta['type'];
        if (!type) {
            type = meta['version']
        } else if (IObject.isString(type) && !meta['algorithm']) {
            if (type.length > 2) {
                meta['algorithm'] = type
            }
        }
        var version = MetaType.parseInt(type, 0);
        if (version > 0) {
            meta['type'] = version;
            meta['version'] = version
        }
    };
    var fixCommand = function (content) {
        content = fixCmd(content);
        if (Interface.conforms(content, MetaCommand)) {
            var meta = content.getValue('meta');
            if (meta) {
                fixMetaVersion(meta)
            }
        } else if (Interface.conforms(content, ReceiptCommand)) {
            fixReceiptCommand(content)
        }
        return content
    };
    var fixCmd = function (content) {
        var cmd = content.getString('cmd', null);
        if (!cmd || cmd.length === 0) {
            cmd = content.getString('command', cmd);
            content.setValue('cmd', cmd)
        } else if (!content.getValue('command')) {
            content.setValue('command', cmd);
            content = Command.parse(content.toMap())
        }
        return content
    };
    var fixReceiptCommand = function (content) {
    };
    ns.Compatible = {
        fixMetaAttachment: fixMetaAttachment,
        fixMetaVersion: fixMetaVersion,
        fixCommand: fixCommand,
        fixCmd: fixCmd,
        fixReceiptCommand: fixReceiptCommand
    }
})(DIMP);
(function (ns) {
    'use strict';
    var NetworkType = ns.type.Enum(null, {
        BTC_MAIN: (0x00),
        MAIN: (0x08),
        GROUP: (0x10),
        POLYLOGUE: (0x10),
        CHATROOM: (0x30),
        PROVIDER: (0x76),
        STATION: (0x88),
        BOT: (0xC8),
        THING: (0x80)
    });
    var EntityType = ns.protocol.EntityType;
    NetworkType.getEntityType = function (network) {
        if (NetworkType.MAIN.equals(network)) {
            return EntityType.USER.getValue()
        } else if (NetworkType.GROUP.equals(network)) {
            return EntityType.GROUP.getValue()
        } else if (NetworkType.CHATROOM.equals(network)) {
            return EntityType.GROUP.getValue() | EntityType.CHATROOM.getValue()
        } else if (NetworkType.STATION.equals(network)) {
            return EntityType.STATION.getValue()
        } else if (NetworkType.PROVIDER.equals(network)) {
            return EntityType.ISP.getValue()
        } else if (NetworkType.BOT.equals(network)) {
            return EntityType.BOT.getValue()
        }
        return network
    };
    ns.protocol.NetworkID = NetworkType
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ConstantString = ns.type.ConstantString;
    var Address = ns.protocol.Address;
    var BaseAddressFactory = ns.mkm.BaseAddressFactory;
    var BTCAddress = ns.mkm.BTCAddress;
    var ETHAddress = ns.mkm.ETHAddress;
    var UnknownAddress = function (string) {
        ConstantString.call(this, string)
    };
    Class(UnknownAddress, ConstantString, [Address], {
        getType: function () {
            return 0
        }
    });
    var CompatibleAddressFactory = function () {
        BaseAddressFactory.call(this)
    };
    Class(CompatibleAddressFactory, BaseAddressFactory, null, null);
    CompatibleAddressFactory.prototype.createAddress = function (address) {
        if (!address) {
            return null
        }
        var len = address.length;
        if (len === 8) {
            if (address.toLowerCase() === 'anywhere') {
                return Address.ANYWHERE
            }
        } else if (len === 10) {
            if (address.toLowerCase() === 'everywhere') {
                return Address.EVERYWHERE
            }
        }
        var res;
        if (26 <= len && len <= 35) {
            res = BTCAddress.parse(address)
        } else if (len === 42) {
            res = ETHAddress.parse(address)
        } else {
            res = null
        }
        if (!res && 4 <= len && len <= 64) {
            res = new UnknownAddress(address)
        }
        return res
    };
    ns.registerCompatibleAddressFactory = function () {
        Address.setFactory(new CompatibleAddressFactory())
    }
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var EntityType = ns.protocol.EntityType;
    var NetworkID = ns.protocol.NetworkID;
    var ID = ns.protocol.ID;
    var Identifier = ns.mkm.Identifier;
    var IdentifierFactory = ns.mkm.GeneralIdentifierFactory;
    var EntityID = function (identifier, name, address, terminal) {
        Identifier.call(this, identifier, name, address, terminal)
    };
    Class(EntityID, Identifier, null, {
        getType: function () {
            var name = this.getName();
            if (!name || name.length === 0) {
                return EntityType.USER.getValue()
            }
            var network = this.getAddress().getType();
            return NetworkID.getEntityType(network)
        }
    });
    var EntityIDFactory = function () {
        IdentifierFactory.call(this)
    };
    Class(EntityIDFactory, IdentifierFactory, null, {
        newID: function (string, name, address, terminal) {
            return new EntityID(string, name, address, terminal)
        }, parse: function (identifier) {
            if (!identifier) {
                throw new ReferenceError('ID empty');
            }
            var len = identifier.length;
            if (len === 15) {
                if (identifier.toLowerCase() === 'anyone@anywhere') {
                    return ID.ANYONE
                }
            } else if (len === 19) {
                if (identifier.toLowerCase() === 'everyone@everywhere') {
                    return ID.EVERYONE
                }
            } else if (len === 13) {
                if (identifier.toLowerCase() === 'moky@anywhere') {
                    return ID.FOUNDER
                }
            }
            return IdentifierFactory.prototype.parse.call(this, identifier)
        }
    });
    ns.registerEntityIDFactory = function () {
        ID.setFactory(new EntityIDFactory())
    }
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Meta = ns.protocol.Meta;
    var DefaultMeta = ns.mkm.DefaultMeta;
    var BTCMeta = ns.mkm.BTCMeta;
    var ETHMeta = ns.mkm.ETHMeta;
    var BaseMetaFactory = ns.mkm.GeneralMetaFactory;
    var CompatibleMetaFactory = function (type) {
        BaseMetaFactory.call(this, type)
    };
    Class(CompatibleMetaFactory, BaseMetaFactory, null, {
        createMeta: function (key, seed, fingerprint) {
            var out;
            var type = this.getType();
            if (type === Meta.MKM) {
                out = new DefaultMeta('1', key, seed, fingerprint)
            } else if (type === Meta.BTC) {
                out = new BTCMeta('2', key)
            } else if (type === Meta.ETH) {
                out = new ETHMeta('4', key)
            } else {
                throw new TypeError('unknown meta type: ' + type);
            }
            return out
        }, parseMeta: function (meta) {
            var out;
            var gf = general_factory();
            var type = gf.getMetaType(meta, '');
            if (type === '1' || type === 'mkm' || type === 'MKM') {
                out = new DefaultMeta(meta)
            } else if (type === '2' || type === 'btc' || type === 'BTC') {
                out = new BTCMeta(meta)
            } else if (type === '4' || type === 'eth' || type === 'ETH') {
                out = new ETHMeta(meta)
            } else {
                throw new TypeError('unknown meta type: ' + type);
            }
            return out.isValid() ? out : null
        }
    });
    var general_factory = function () {
        var man = ns.mkm.AccountFactoryManager;
        return man.generalFactory
    };
    ns.registerCompatibleMetaFactory = function () {
        var mkm = new CompatibleMetaFactory(Meta.MKM);
        var btc = new CompatibleMetaFactory(Meta.BTC);
        var eth = new CompatibleMetaFactory(Meta.ETH);
        Meta.setFactory("1", mkm);
        Meta.setFactory("2", btc);
        Meta.setFactory("4", eth);
        Meta.setFactory("mkm", mkm);
        Meta.setFactory("btc", btc);
        Meta.setFactory("eth", eth);
        Meta.setFactory("MKM", mkm);
        Meta.setFactory("BTC", btc);
        Meta.setFactory("ETH", eth)
    }
})(DIMP);
(function (ns) {
    'use strict';
    var Thread = ns.fsm.threading.Thread;
    var Log = ns.lnc.Log;
    var CacheHolder = function (value, lifeSpan, now) {
        this.__value = value;
        this.__lifeSpan = lifeSpan;
        if (!now || now <= 0) {
            now = (new Date()).getTime()
        }
        this.__expired = now + lifeSpan;
        this.__deprecated = now + lifeSpan * 2
    };
    CacheHolder.prototype.getValue = function () {
        return this.__value
    };
    CacheHolder.prototype.update = function (value, now) {
        this.__value = value;
        if (!now || now <= 0) {
            now = (new Date()).getTime()
        }
        this.__expired = now + this.__lifeSpan;
        this.__deprecated = now + this.__lifeSpan * 2
    };
    CacheHolder.prototype.isAlive = function (now) {
        if (!now || now <= 0) {
            now = (new Date()).getTime()
        }
        return now < this.__expired
    };
    CacheHolder.prototype.isDeprecated = function (now) {
        if (!now || now <= 0) {
            now = (new Date()).getTime()
        }
        return now > this.__deprecated
    };
    CacheHolder.prototype.renewal = function (duration, now) {
        if (!duration || duration <= 0) {
            duration = 128 * 1000
        }
        if (!now || now <= 0) {
            now = (new Date()).getTime()
        }
        this.__expired = now + duration;
        this.__deprecated = now + this.__lifeSpan * 2
    };
    var CachePair = function (value, holder) {
        this.value = value;
        this.holder = holder
    };
    var CachePool = function () {
        this.__holders = {}
    };
    CachePool.prototype.getKeys = function () {
        return Object.keys(this.__holders)
    };
    CachePool.prototype.update = function (key, value, lifeSpan, now) {
        if (!lifeSpan || lifeSpan <= 0) {
            lifeSpan = 3600 * 1000
        }
        var holder;
        if (value instanceof CacheHolder) {
            holder = value
        } else {
            holder = new CacheHolder(value, lifeSpan, now)
        }
        this.__holders[key] = holder;
        return holder
    };
    CachePool.prototype.erase = function (key, now) {
        var old = null;
        if (now && now > 0) {
            old = this.fetch(key, now)
        }
        delete this.__holders[key];
        return old
    };
    CachePool.prototype.fetch = function (key, now) {
        var holder = this.__holders[key];
        if (!holder) {
            return null
        } else if (holder.isAlive(now)) {
            return new CachePair(holder.getValue(), holder)
        } else {
            return new CachePair(null, holder)
        }
    };
    CachePool.prototype.purge = function (now) {
        if (!now || now <= 0) {
            now = (new Date()).getTime()
        }
        var count = 0;
        var allKeys = this.getKeys();
        var holder, key;
        for (var i = 0; i < allKeys.length; ++i) {
            key = allKeys[i];
            holder = this.__holders[key];
            if (!holder || holder.isDeprecated(now)) {
                delete this.__holders[key];
                ++count
            }
        }
        return count
    };
    var CacheManager = {
        getInstance: function () {
            if (!running) {
                this.start()
            }
            return this
        }, start: function () {
            force_stop();
            running = true;
            var thr = new Thread(this.run);
            thr.start();
            thread = thr
        }, stop: function () {
            force_stop()
        }, run: function () {
            if (!running) {
                return false
            }
            var now = (new Date()).getTime();
            if (now > nextTime) {
                nextTime = now + 300 * 1000;
                try {
                    this.purge(now)
                } catch (e) {
                    Log.error('CacheManager::run()', e)
                }
            }
            return true
        }, purge: function (now) {
            var count = 0;
            var names = Object.keys(pools);
            var p;
            for (var i = 0; i < names.length; ++i) {
                p = pools[names[i]];
                if (p) {
                    count += p.purge(now)
                }
            }
            return count
        }, getPool: function (name) {
            var p = pools[name];
            if (!p) {
                p = new CachePool();
                pools[name] = p
            }
            return p
        }
    };
    var pools = {};
    var thread = null;
    var running = false;
    var nextTime = 0;
    var force_stop = function () {
        running = false;
        var thr = thread;
        if (thr) {
            thread = null;
            thr.stop()
        }
    }
    ns.mem.CacheHolder = CacheHolder;
    ns.mem.CachePool = CachePool;
    ns.mem.CacheManager = CacheManager
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var BlockCommand = Interface(null, [Command]);
    Command.BLOCK = 'block';
    BlockCommand.prototype.setBlockCList = function (list) {
    };
    BlockCommand.prototype.getBlockCList = function () {
    };
    BlockCommand.fromList = function (contacts) {
        return new ns.dkd.cmd.BaseBlockCommand(contacts)
    };
    ns.protocol.BlockCommand = BlockCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var BlockCommand = ns.protocol.BlockCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseBlockCommand = function () {
        var list = null;
        if (arguments.length === 0) {
            BaseCommand.call(this, Command.BLOCK)
        } else if (arguments[0] instanceof Array) {
            BaseCommand.call(this, Command.BLOCK)
            list = arguments[0]
        } else {
            BaseCommand.call(this, arguments[0])
        }
        if (list) {
            this.setValue('list', ID.revert(list))
        }
        this.__list = list
    };
    Class(BaseBlockCommand, BaseCommand, [BlockCommand], {
        getBlockCList: function () {
            if (this.__list === null) {
                var list = this.getValue('list');
                if (list) {
                    this.__list = ID.convert(list)
                } else {
                    this.__list = []
                }
            }
            return this.__list
        }, setBlockCList: function (list) {
            this.__list = list;
            if (list) {
                list = ID.revert(list)
            }
            this.setValue('list', list)
        }
    });
    ns.dkd.cmd.BaseBlockCommand = BaseBlockCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Enum = ns.type.Enum;
    var Command = ns.protocol.Command;
    var HandshakeState = Enum('HandshakeState', {START: 0, AGAIN: 1, RESTART: 2, SUCCESS: 3});
    HandshakeState.checkState = function (title, session) {
        if (title === 'DIM!') {
            return HandshakeState.SUCCESS
        } else if (title === 'DIM?') {
            return HandshakeState.AGAIN
        } else if (!session) {
            return HandshakeState.START
        } else {
            return HandshakeState.RESTART
        }
    };
    Command.HANDSHAKE = 'handshake';
    var HandshakeCommand = Interface(null, [Command]);
    HandshakeCommand.prototype.getTitle = function () {
    };
    HandshakeCommand.prototype.getSessionKey = function () {
    };
    HandshakeCommand.prototype.getState = function () {
    };
    HandshakeCommand.start = function () {
        return new ns.dkd.cmd.BaseHandshakeCommand('Hello world!', null)
    };
    HandshakeCommand.restart = function (sessionKey) {
        return new ns.dkd.cmd.BaseHandshakeCommand('Hello world!', sessionKey)
    };
    HandshakeCommand.again = function (sessionKey) {
        return new ns.dkd.cmd.BaseHandshakeCommand('DIM?', sessionKey)
    };
    HandshakeCommand.success = function (sessionKey) {
        return new ns.dkd.cmd.BaseHandshakeCommand('DIM!', sessionKey)
    };
    ns.protocol.HandshakeCommand = HandshakeCommand;
    ns.protocol.HandshakeState = HandshakeState
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Command = ns.protocol.Command;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var HandshakeState = ns.protocol.HandshakeState;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseHandshakeCommand = function () {
        var title = null;
        var session = null;
        if (arguments.length === 2) {
            BaseCommand.call(this, Command.HANDSHAKE);
            title = arguments[0];
            session = arguments[1]
        } else if (typeof arguments[0] === 'string') {
            BaseCommand.call(this, Command.HANDSHAKE);
            title = arguments[0]
        } else {
            BaseCommand.call(this, arguments[0])
        }
        if (title) {
            this.setValue('title', title)
        }
        if (session) {
            this.setValue('session', session)
        }
    };
    Class(BaseHandshakeCommand, BaseCommand, [HandshakeCommand], {
        getTitle: function () {
            return this.getString('title', null)
        }, getSessionKey: function () {
            return this.getString('session', null)
        }, getState: function () {
            return HandshakeState.checkState(this.getTitle(), this.getSessionKey())
        }
    });
    ns.dkd.cmd.BaseHandshakeCommand = BaseHandshakeCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Command = ns.protocol.Command;
    var LoginCommand = Interface(null, [Command]);
    Command.LOGIN = 'login';
    LoginCommand.prototype.getIdentifier = function () {
    };
    LoginCommand.prototype.getDevice = function () {
    };
    LoginCommand.prototype.setDevice = function (device) {
    };
    LoginCommand.prototype.getAgent = function () {
    };
    LoginCommand.prototype.setAgent = function (UA) {
    };
    LoginCommand.prototype.getStation = function () {
    };
    LoginCommand.prototype.setStation = function (station) {
    };
    LoginCommand.prototype.getProvider = function () {
    };
    LoginCommand.prototype.setProvider = function (provider) {
    };
    LoginCommand.create = function (identifier) {
        return new ns.dkd.cmd.BaseLoginCommand(identifier)
    };
    ns.protocol.LoginCommand = LoginCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Wrapper = ns.type.Wrapper;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var LoginCommand = ns.protocol.LoginCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var Station = ns.mkm.Station;
    var ServiceProvider = ns.mkm.ServiceProvider;
    var BaseLoginCommand = function (info) {
        if (Interface.conforms(info, ID)) {
            BaseCommand.call(this, Command.LOGIN);
            this.setString('ID', info)
        } else {
            BaseCommand.call(this, info)
        }
    };
    Class(BaseLoginCommand, BaseCommand, [LoginCommand], {
        getIdentifier: function () {
            return ID.parse(this.getValue('ID'))
        }, getDevice: function () {
            return this.getString('device', null)
        }, setDevice: function (device) {
            this.setValue('device', device)
        }, getAgent: function () {
            return this.getString('agent', null)
        }, setAgent: function (UA) {
            this.setValue('agent', UA)
        }, getStation: function () {
            return this.getValue('station')
        }, setStation: function (station) {
            var info;
            if (!station) {
                info = null
            } else if (station instanceof Station) {
                var sid = station.getIdentifier();
                if (sid.isBroadcast()) {
                    info = {'host': station.getHost(), 'port': station.getPort()}
                } else {
                    info = {'ID': sid.toString(), 'host': station.getHost(), 'port': station.getPort()}
                }
            } else {
                info = Wrapper.fetchMap(station)
            }
            this.setValue('station', info)
        }, getProvider: function () {
            return this.getValue('provider')
        }, setProvider: function (provider) {
            var info;
            if (!provider) {
                info = null
            } else if (provider instanceof ServiceProvider) {
                info = {'ID': provider.getIdentifier().toString()}
            } else if (Interface.conforms(provider, ID)) {
                info = {'ID': provider.toString()}
            } else {
                info = Wrapper.fetchMap(provider)
            }
            this.setValue('provider', info)
        }
    });
    ns.dkd.cmd.BaseLoginCommand = BaseLoginCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var MuteCommand = Interface(null, [Command]);
    Command.MUTE = 'mute';
    MuteCommand.prototype.setMuteCList = function (list) {
    };
    MuteCommand.prototype.getMuteCList = function () {
    };
    MuteCommand.fromList = function (contacts) {
        return new ns.dkd.cmd.BaseMuteCommand(contacts)
    };
    ns.protocol.MuteCommand = MuteCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var MuteCommand = ns.protocol.MuteCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseMuteCommand = function (info) {
        var list = null;
        if (arguments.length === 0) {
            BaseCommand.call(this, Command.MUTE)
        } else if (arguments[0] instanceof Array) {
            BaseCommand.call(this, Command.MUTE)
            list = arguments[0]
        } else {
            BaseCommand.call(this, arguments[0])
        }
        if (list) {
            this.setValue('list', ID.revert(list))
        }
        this.__list = list
    };
    Class(BaseMuteCommand, BaseCommand, [MuteCommand], {
        getMuteCList: function () {
            if (this.__list === null) {
                var list = this.getValue('list');
                if (list) {
                    this.__list = ID.convert(list)
                } else {
                    this.__list = []
                }
            }
            return this.__list
        }, setMuteCList: function (list) {
            this.__list = list;
            if (list) {
                list = ID.revert(list)
            }
            this.setValue('list', list)
        }
    });
    ns.dkd.cmd.BaseMuteCommand = BaseMuteCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Command = ns.protocol.Command;
    var ReportCommand = Interface(null, [Command]);
    Command.REPORT = 'report';
    Command.ONLINE = 'online';
    Command.OFFLINE = 'offline';
    ReportCommand.prototype.setTitle = function (title) {
    };
    ReportCommand.prototype.getTitle = function () {
    };
    ReportCommand.fromTitle = function (title) {
        return new ns.dkd.cmd.BaseReportCommand(title)
    };
    ns.protocol.ReportCommand = ReportCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ReportCommand = ns.protocol.ReportCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseReportCommand = function () {
        if (arguments.length === 0) {
            BaseCommand.call(this, ReportCommand.REPORT)
        } else if (typeof arguments[0] === 'string') {
            BaseCommand.call(this, ReportCommand.REPORT);
            this.setTitle(arguments[0])
        } else {
            BaseCommand.call(this, arguments[0])
        }
    };
    Class(BaseReportCommand, BaseCommand, [ReportCommand], {
        setTitle: function (title) {
            this.setValue('title', title)
        }, getTitle: function () {
            return this.getString('title', null)
        }
    });
    ns.dkd.cmd.BaseReportCommand = BaseReportCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Command = ns.protocol.Command;
    var SearchCommand = Interface(null, [Command]);
    Command.SEARCH = 'search';
    Command.ONLINE_USERS = 'users';
    SearchCommand.prototype.setKeywords = function (keywords) {
    };
    SearchCommand.prototype.getKeywords = function () {
    };
    SearchCommand.prototype.setRange = function (start, limit) {
    };
    SearchCommand.prototype.getRange = function () {
    };
    SearchCommand.prototype.setStation = function (sid) {
    };
    SearchCommand.prototype.getStation = function () {
    };
    SearchCommand.prototype.getUsers = function () {
        throw new Error('NotImplemented');
    };
    SearchCommand.fromKeywords = function (keywords) {
        return new ns.dkd.cmd.BaseSearchCommand(keywords)
    };
    ns.protocol.SearchCommand = SearchCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var SearchCommand = ns.protocol.SearchCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseSearchCommand = function () {
        var keywords = null;
        if (arguments.length === 0) {
            BaseCommand.call(this, Command.ONLINE_USERS)
        } else if (typeof arguments[0] === 'string') {
            BaseCommand.call(this, Command.SEARCH);
            keywords = arguments[0]
        } else {
            BaseCommand.call(this, arguments[0])
        }
        if (keywords) {
            this.setKeywords(keywords)
        }
    };
    Class(BaseSearchCommand, BaseCommand, [SearchCommand], {
        setKeywords: function (keywords) {
            if (keywords instanceof Array) {
                keywords = keywords.join(' ')
            } else if (typeof keywords !== 'string') {
                throw new TypeError('keywords error: ' + keywords);
            }
            this.setValue('keywords', keywords)
        }, getKeywords: function () {
            var words = this.getValue('keywords', null);
            if (!words && this.getCmd() === Command.ONLINE_USERS) {
                words = Command.ONLINE_USERS
            }
            return words
        }, setRange: function (start, limit) {
            this.setValue('start', start);
            this.setValue('limit', limit)
        }, getRange: function () {
            var start = this.getInt('start', 0);
            var limit = this.getInt('limit', 50);
            return [start, limit]
        }, setStation: function (sid) {
            return this.setString('station', sid)
        }, getStation: function () {
            return ID.parse(this.getValue('results'))
        }, getUsers: function () {
            var users = this.getValue('users');
            if (users) {
                return ID.convert(users)
            } else {
                return null
            }
        }
    });
    ns.dkd.cmd.BaseSearchCommand = BaseSearchCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var StorageCommand = Interface(null, [Command]);
    Command.STORAGE = 'storage';
    Command.CONTACTS = 'contacts';
    Command.PRIVATE_KEY = 'private_key';
    StorageCommand.prototype.setTitle = function (title) {
    };
    StorageCommand.prototype.getTitle = function () {
    };
    StorageCommand.prototype.setIdentifier = function (identifier) {
    };
    StorageCommand.prototype.getIdentifier = function () {
    };
    StorageCommand.prototype.setData = function (data) {
    };
    StorageCommand.prototype.getData = function () {
    };
    StorageCommand.prototype.decrypt = function (key) {
    };
    StorageCommand.prototype.setKey = function (data) {
    };
    StorageCommand.prototype.getKey = function () {
    };
    ns.protocol.StorageCommand = StorageCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var DecryptKey = ns.crypto.DecryptKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var Base64 = ns.format.Base64;
    var JsON = ns.format.JSON;
    var UTF8 = ns.format.UTF8;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var StorageCommand = ns.protocol.StorageCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseStorageCommand = function (info) {
        if (typeof info === 'string') {
            BaseCommand.call(this, Command.STORAGE);
            this.setValue('string', info)
        } else {
            BaseCommand.call(this, info)
        }
        this.__data = null;
        this.__plaintext = null;
        this.__key = null;
        this.__password = null
    };
    Class(BaseStorageCommand, BaseCommand, [StorageCommand], {
        setTitle: function (title) {
            this.setValue('title', title)
        }, getTitle: function () {
            return this.getString('title', null)
        }, setIdentifier: function (identifier) {
            this.setString('ID', identifier)
        }, getIdentifier: function () {
            return ID.parse(this.getValue('ID'))
        }, setData: function (data) {
            var base64 = null;
            if (data) {
                base64 = Base64.encode(data)
            }
            this.setValue('data', base64);
            this.__data = data;
            this.__plaintext = null
        }, getData: function () {
            if (this.__data === null) {
                var base64 = this.getString('data', null);
                if (base64) {
                    this.__data = Base64.decode(base64)
                }
            }
            return this.__data
        }, setKey: function (data) {
            var base64 = null;
            if (data) {
                base64 = Base64.encode(data)
            }
            this.setValue('key', base64);
            this.__key = data;
            this.__password = null
        }, getKey: function () {
            if (this.__key === null) {
                var base64 = this.getValue('key');
                if (base64) {
                    this.__key = Base64.decode(base64)
                }
            }
            return this.__key
        }, decrypt: function (key) {
            if (Interface.conforms(key, PrivateKey)) {
                return decrypt_password_by_private_key.call(this, key)
            }
            if (Interface.conforms(key, SymmetricKey)) {
                return decrypt_data_by_symmetric_key.call(this, key)
            }
            throw new TypeError('key error: ' + key);
        }
    });
    var decrypt_password_by_private_key = function (privateKey) {
        if (this.__password === null) {
            if (Interface.conforms(privateKey, DecryptKey)) {
                this.__password = decrypt_symmetric_key.call(this, privateKey)
            } else {
                throw new TypeError('private key error: ' + privateKey);
            }
        }
        return decrypt_data_by_symmetric_key.call(this, this.__password)
    };
    var decrypt_data_by_symmetric_key = function (password) {
        if (this.__plaintext === null) {
            if (!password) {
                throw new Error('symmetric key empty');
            }
            var data = this.getData();
            if (data) {
                this.__plaintext = password.decrypt(data, this.toMap())
            }
        }
        return this.__plaintext
    };
    var decrypt_symmetric_key = function (decryptKey) {
        var data = this.getKey();
        if (!data) {
            return
        }
        var key = decryptKey.decrypt(data, this.toMap());
        if (!key) {
            throw new Error('failed to decrypt key');
        }
        var info = JsON.decode(UTF8.decode(key));
        return SymmetricKey.parse(info)
    };
    ns.dkd.cmd.BaseStorageCommand = BaseStorageCommand
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var DecryptKey = ns.crypto.DecryptKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PrivateKeyDBI = Interface(null, null);
    PrivateKeyDBI.META = 'M';
    PrivateKeyDBI.VISA = 'V';
    PrivateKeyDBI.prototype.savePrivateKey = function (key, type, user) {
    };
    PrivateKeyDBI.prototype.getPrivateKeysForDecryption = function (user) {
    };
    PrivateKeyDBI.prototype.getPrivateKeyForSignature = function (user) {
    };
    PrivateKeyDBI.prototype.getPrivateKeyForVisaSignature = function (user) {
    };
    var convertDecryptKeys = function (privateKeys) {
        var decryptKeys = [];
        var key;
        for (var index = 0; index < privateKeys.length; ++index) {
            key = privateKeys[index];
            if (Interface.conforms(key, DecryptKey)) {
                decryptKeys.push(key)
            }
        }
        return decryptKeys
    };
    var convertPrivateKeys = function (decryptKeys) {
        var privateKeys = [];
        var key;
        for (var index = 0; index < decryptKeys.length; ++index) {
            key = decryptKeys[index];
            if (Interface.conforms(key, PrivateKey)) {
                privateKeys.push(key)
            }
        }
        return privateKeys
    };
    var revertPrivateKeys = function (privateKeys) {
        var array = [];
        for (var index = 0; index < privateKeys.length; ++index) {
            array.push(privateKeys[index].toMap())
        }
        return array
    };
    var insertKey = function (key, privateKeys) {
        var index = findKey(key, privateKeys);
        if (index === 0) {
            return null
        } else if (index > 0) {
            privateKeys.splice(index, 1)
        } else if (privateKeys.length > 2) {
            privateKeys.pop()
        }
        privateKeys.unshift(key);
        return privateKeys
    };
    var findKey = function (key, privateKeys) {
        var data = key.getString('data', null);
        var item;
        for (var index = 0; index < privateKeys.length; ++index) {
            item = privateKeys[index];
            if (item.getString('data', null) === data) {
                return index
            }
        }
        return -1
    };
    PrivateKeyDBI.convertDecryptKeys = convertDecryptKeys;
    PrivateKeyDBI.convertPrivateKeys = convertPrivateKeys;
    PrivateKeyDBI.revertPrivateKeys = revertPrivateKeys;
    PrivateKeyDBI.insertKey = insertKey;
    PrivateKeyDBI.findKey = findKey;
    ns.dbi.PrivateKeyDBI = PrivateKeyDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var MetaDBI = Interface(null, null);
    MetaDBI.prototype.getMeta = function (entity) {
    };
    MetaDBI.prototype.saveMeta = function (meta, entity) {
    };
    ns.dbi.MetaDBI = MetaDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var DocumentDBI = Interface(null, null);
    DocumentDBI.prototype.getDocuments = function (entity) {
    };
    DocumentDBI.prototype.saveDocument = function (doc) {
    };
    ns.dbi.DocumentDBI = DocumentDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var UserDBI = Interface(null, null);
    var ContactDBI = Interface(null, null);
    UserDBI.prototype.getLocalUsers = function () {
    };
    UserDBI.prototype.saveLocalUsers = function (users) {
    };
    ContactDBI.prototype.getContacts = function (user) {
    };
    ContactDBI.prototype.saveContacts = function (contacts, user) {
    };
    ns.dbi.UserDBI = UserDBI;
    ns.dbi.ContactDBI = ContactDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var GroupDBI = Interface(null, null);
    GroupDBI.prototype.getFounder = function (group) {
    };
    GroupDBI.prototype.getOwner = function (group) {
    };
    GroupDBI.prototype.getMembers = function (group) {
    };
    GroupDBI.prototype.saveMembers = function (members, group) {
    };
    GroupDBI.prototype.getAssistants = function (group) {
    };
    GroupDBI.prototype.saveAssistants = function (bots, group) {
    };
    GroupDBI.prototype.getAdministrators = function (group) {
    };
    GroupDBI.prototype.saveAdministrators = function (members, group) {
    };
    ns.dbi.GroupDBI = GroupDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var GroupHistoryDBI = Interface(null, null);
    GroupHistoryDBI.prototype.saveGroupHistory = function (content, rMsg, group) {
    };
    GroupHistoryDBI.prototype.getGroupHistories = function (group) {
    };
    GroupHistoryDBI.prototype.getResetCommandMessage = function (group) {
    };
    GroupHistoryDBI.prototype.clearGroupMemberHistories = function (group) {
    };
    GroupHistoryDBI.prototype.clearGroupAdminHistories = function (group) {
    };
    ns.dbi.GroupHistoryDBI = GroupHistoryDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var PrivateKeyDBI = ns.dbi.PrivateKeyDBI;
    var MetaDBI = ns.dbi.MetaDBI;
    var DocumentDBI = ns.dbi.DocumentDBI;
    var UserDBI = ns.dbi.UserDBI;
    var ContactDBI = ns.dbi.ContactDBI;
    var GroupDBI = ns.dbi.GroupDBI;
    var GroupHistoryDBI = ns.dbi.GroupHistoryDBI;
    var AccountDBI = Interface(null, [PrivateKeyDBI, MetaDBI, DocumentDBI, UserDBI, ContactDBI, GroupDBI, GroupHistoryDBI]);
    ns.dbi.AccountDBI = AccountDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var CipherKeyDBI = ns.CipherKeyDelegate;
    var GroupKeysDBI = Interface(null, null);
    GroupKeysDBI.prototype.getGroupKeys = function (group, sender) {
    };
    GroupKeysDBI.prototype.saveGroupKeys = function (group, sender, keys) {
    };
    ns.dbi.CipherKeyDBI = CipherKeyDBI;
    ns.dbi.GroupKeysDBI = GroupKeysDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var CipherKeyDBI = ns.dbi.CipherKeyDBI;
    var GroupKeysDBI = ns.dbi.GroupKeysDBI;
    var MessageDBI = Interface(null, [CipherKeyDBI, GroupKeysDBI]);
    ns.dbi.MessageDBI = MessageDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Converter = ns.type.Converter;
    var Address = ns.protocol.Address;
    var ID = ns.protocol.ID;
    var Identifier = ns.mkm.Identifier;
    var ProviderInfo = function (pid, chosen) {
        this.__identifier = pid;
        this.__chosen = chosen
    };
    Class(ProviderInfo, null, null);
    ProviderInfo.prototype.getIdentifier = function () {
        return this.__identifier
    };
    ProviderInfo.prototype.getChosen = function () {
        return this.__chosen
    };
    ProviderInfo.prototype.setChosen = function (chosen) {
        this.__chosen = chosen
    };
    ProviderInfo.GSP = new Identifier('gsp@everywhere', 'gsp', Address.EVERYWHERE, null);
    ProviderInfo.convert = function (array) {
        var providers = [];
        var identifier;
        var chosen;
        var item;
        for (var i = 0; i < array.length; ++i) {
            item = array[i];
            identifier = ID.parse(item['ID']);
            chosen = Converter.getInt(item['chosen'], 0);
            if (!identifier) {
                continue
            }
            providers.push(new ProviderInfo(identifier, chosen))
        }
        return providers
    };
    ProviderInfo.revert = function (providers) {
        var array = [];
        var info;
        for (var i = 0; i < providers.length; ++i) {
            info = providers[i];
            array.push({'ID': info.getIdentifier().toString(), 'chosen': info.getChosen()})
        }
        return array
    };
    var ProviderDBI = Interface(null, null);
    ProviderDBI.prototype.allProviders = function () {
    };
    ProviderDBI.prototype.addProvider = function (identifier, chosen) {
    };
    ProviderDBI.prototype.updateProvider = function (identifier, chosen) {
    };
    ProviderDBI.prototype.removeProvider = function (identifier) {
    };
    ns.dbi.ProviderDBI = ProviderDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Converter = ns.type.Converter;
    var ID = ns.protocol.ID;
    var StationInfo = function (sid, chosen, host, port, provider) {
        this.__identifier = sid;
        this.__chosen = chosen;
        this.__host = host;
        this.__port = port;
        this.__provider = provider
    };
    Class(StationInfo, null, null);
    StationInfo.prototype.getIdentifier = function () {
        return this.__identifier
    };
    StationInfo.prototype.getChosen = function () {
        return this.__chosen
    };
    StationInfo.prototype.setChosen = function (chosen) {
        this.__chosen = chosen
    };
    StationInfo.prototype.getHost = function () {
        return this.__host
    };
    StationInfo.prototype.getPort = function () {
        return this.__port
    };
    StationInfo.prototype.getProvider = function () {
        return this.__provider
    };
    StationInfo.convert = function (array) {
        var stations = [];
        var sid;
        var chosen;
        var host;
        var port;
        var provider;
        var item;
        for (var i = 0; i < array.length; ++i) {
            item = array[i];
            sid = ID.parse(item['ID']);
            chosen = Converter.getInt(item['chosen'], 0);
            host = Converter.getString(item['host'], null);
            port = Converter.getInt(item['port'], 0);
            provider = ID.parse(item['provider']);
            if (!host || port === 0) {
                continue
            }
            stations.push(new StationInfo(sid, chosen, host, port, provider))
        }
        return stations
    };
    StationInfo.revert = function (stations) {
        var array = [];
        var info;
        for (var i = 0; i < stations.length; ++i) {
            info = stations[i];
            array.push({
                'ID': info.getIdentifier().toString(),
                'chosen': info.getChosen(),
                'host': info.getHost(),
                'port': info.getPort(),
                'provider': info.getProvider().toString()
            })
        }
        return array
    };
    var StationDBI = Interface(null, null);
    StationDBI.prototype.allStations = function (provider) {
    };
    StationDBI.prototype.addStation = function (sid, chosen, host, port, provider) {
    };
    StationDBI.prototype.updateStation = function (sid, chosen, host, port, provider) {
    };
    StationDBI.prototype.removeStation = function (host, port, provider) {
    };
    StationDBI.prototype.removeStations = function (provider) {
    };
    ns.dbi.StationDBI = StationDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var LoginDBI = Interface(null, null);
    LoginDBI.prototype.getLoginCommandMessage = function (user) {
    };
    LoginDBI.prototype.saveLoginCommandMessage = function (user, content, message) {
    };
    ns.dbi.LoginDBI = LoginDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var LoginDBI = ns.dbi.LoginDBI;
    var ProviderDBI = ns.dbi.ProviderDBI;
    var StationDBI = ns.dbi.StationDBI;
    var SessionDBI = Interface(null, [LoginDBI, ProviderDBI, StationDBI]);
    ns.dbi.SessionDBI = SessionDBI
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Hex = ns.format.Hex;
    var Base58 = ns.format.Base58;
    var EntityType = ns.protocol.EntityType;
    var ID = ns.protocol.ID;
    var BTCAddress = ns.mkm.BTCAddress;
    var ETHAddress = ns.mkm.ETHAddress;
    var Anonymous = {
        getName: function (identifier) {
            var name;
            if (Interface.conforms(identifier, ID)) {
                name = identifier.getName();
                if (!name || name.length === 0) {
                    name = get_name(identifier.getType())
                }
            } else {
                name = get_name(identifier.getType())
            }
            var number = this.getNumberString(identifier);
            return name + ' (' + number + ')'
        }, getNumberString: function (address) {
            var str = '' + this.getNumber(address);
            while (str.length < 10) {
                str = '0' + str
            }
            return str.substr(0, 3) + '-' + str.substr(3, 3) + '-' + str.substr(6)
        }, getNumber: function (address) {
            if (Interface.conforms(address, ID)) {
                address = address.getAddress()
            }
            if (address instanceof BTCAddress) {
                return btc_number(address.toString())
            }
            if (address instanceof ETHAddress) {
                return eth_number(address.toString())
            }
            return 0
        }
    };
    var get_name = function (type) {
        if (EntityType.BOT.equals(type)) {
            return 'Bot'
        }
        if (EntityType.STATION.equals(type)) {
            return 'Station'
        }
        if (EntityType.ISP.equals(type)) {
            return 'ISP'
        }
        if (EntityType.isUser(type)) {
            return 'User'
        }
        if (EntityType.isGroup(type)) {
            return 'Group'
        }
        return 'Unknown'
    };
    var btc_number = function (address) {
        var data = Base58.decode(address);
        return user_number(data)
    };
    var eth_number = function (address) {
        var data = Hex.decode(address.substr(2))
        return user_number(data)
    };
    var user_number = function (cc) {
        var len = cc.length;
        var c1 = cc[len - 1] & 0xFF;
        var c2 = cc[len - 2] & 0xFF;
        var c3 = cc[len - 3] & 0xFF;
        var c4 = cc[len - 4] & 0xFF;
        return (c1 | (c2 << 8) | (c3 << 16)) + c4 * 0x01000000
    };
    ns.Anonymous = Anonymous
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var AddressNameService = ns.AddressNameService;
    var AddressNameServer = function () {
        Object.call(this);
        var caches = {
            'all': ID.EVERYONE,
            'everyone': ID.EVERYONE,
            'anyone': ID.ANYONE,
            'owner': ID.ANYONE,
            'founder': ID.FOUNDER
        };
        var reserved = {};
        var keywords = AddressNameService.KEYWORDS;
        for (var i = 0; i < keywords.length; ++i) {
            reserved[keywords[i]] = true
        }
        this.__reserved = reserved;
        this.__caches = caches;
        this.__tables = {}
    };
    Class(AddressNameServer, Object, [AddressNameService], null);
    AddressNameServer.prototype.isReserved = function (name) {
        return this.__reserved[name] === true
    };
    AddressNameServer.prototype.cache = function (name, identifier) {
        if (this.isReserved(name)) {
            return false
        }
        if (identifier) {
            this.__caches[name] = identifier;
            delete this.__tables[identifier.toString()]
        } else {
            delete this.__caches[name];
            this.__tables = {}
        }
        return true
    };
    AddressNameServer.prototype.getIdentifier = function (name) {
        return this.__caches[name]
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
                    array.push(name)
                }
            }
            this.__tables[identifier.toString()] = array
        }
        return array
    };
    AddressNameServer.prototype.save = function (name, identifier) {
        return this.cache(name, identifier)
    };
    ns.AddressNameServer = AddressNameServer
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var Archivist = ns.Archivist;
    var CommonArchivist = function (db) {
        Archivist.call(this, Archivist.kQueryExpires);
        this.__db = db
    };
    Class(CommonArchivist, Archivist, null, {
        getLastGroupHistoryTime: function (group) {
            var db = this.getDatabase();
            var array = db.getGroupHistories(group);
            if (!array || array.length === 0) {
                return null
            }
            var hisTime, lastTime = null;
            var pair;
            var cmd;
            var msg;
            for (var i = 0; i < array.length; ++i) {
                pair = array[i];
                cmd = pair[0];
                msg = pair[1];
                hisTime = cmd.getTime();
                if (!hisTime) {
                } else if (!lastTime || lastTime.getTime() < hisTime.getTime()) {
                    lastTime = hisTime
                }
            }
            return lastTime
        }, saveMeta: function (meta, identifier) {
            var db = this.getDatabase();
            return db.saveMeta(meta, identifier)
        }, saveDocument: function (doc) {
            var docTime = doc.getTime();
            if (!docTime) {
                Log.warning('document without time', doc)
            } else {
                var current = (new Date()).getTime() + 65536;
                if (docTime.getTime() > current) {
                    Log.error('document time error', docTime, doc);
                    return false
                }
            }
            var db = this.getDatabase();
            return db.saveDocument(doc)
        }, getMeta: function (identifier) {
            var db = this.getDatabase();
            return db.getMeta(identifier)
        }, getDocuments: function (identifier) {
            var db = this.getDatabase();
            return db.getDocuments(identifier)
        }, getContacts: function (user) {
            var db = this.getDatabase();
            return db.getContacts(user)
        }, getPublicKeyForEncryption: function (user) {
            throw new Error("DON't call me!");
        }, getPublicKeysForVerification: function (user) {
            throw new Error("DON't call me!");
        }, getPrivateKeysForDecryption: function (user) {
            var db = this.getDatabase();
            return db.getPrivateKeysForDecryption(user)
        }, getPrivateKeyForSignature: function (user) {
            var db = this.getDatabase();
            return db.getPrivateKeyForSignature(user)
        }, getPrivateKeyForVisaSignature: function (user) {
            var db = this.getDatabase();
            return db.getPrivateKeyForVisaSignature(user)
        }, getFounder: function (group) {
            var db = this.getDatabase();
            return db.getFounder(group)
        }, getOwner: function (group) {
            var db = this.getDatabase();
            return db.getOwner(group)
        }, getMembers: function (group) {
            var db = this.getDatabase();
            return db.getMembers(group)
        }, getAssistants: function (group) {
            var db = this.getDatabase();
            return db.getAssistants(group)
        }, getAdministrators: function (group) {
            var db = this.getDatabase();
            return db.getAdministrators(group)
        }, saveAdministrators: function (members, group) {
            var db = this.getDatabase();
            return db.saveAdministrators(members, group)
        }, saveMembers: function (members, group) {
            var db = this.getDatabase();
            return db.saveMembers(members, group)
        }
    });
    CommonArchivist.prototype.getDatabase = function () {
        return this.__db
    };
    CommonArchivist.prototype.getLocalUsers = function () {
        var db = this.getDatabase();
        return db.getLocalUsers()
    };
    ns.CommonArchivist = CommonArchivist
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Document = ns.protocol.Document;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var Facebook = ns.Facebook;
    var CommonFacebook = function () {
        Facebook.call(this);
        this.__current = null
    };
    Class(CommonFacebook, Facebook, null, {
        getLocalUsers: function () {
            var localUsers = [];
            var user;
            var db = this.getArchivist();
            var array = db.getLocalUsers();
            if (!array || array.length === 0) {
                user = this.__current;
                if (user) {
                    localUsers.push(user)
                }
            } else {
                for (var i = 0; i < array.length; ++i) {
                    user = this.getUser(array[i]);
                    if (user) {
                        localUsers.push(user)
                    }
                }
            }
            return localUsers
        }, getCurrentUser: function () {
            var user = this.__current;
            if (!user) {
                var localUsers = this.getLocalUsers();
                if (localUsers.length > 0) {
                    user = localUsers[0];
                    this.__current = user
                }
            }
            return user
        }, setCurrentUser: function (user) {
            if (!user.getDataSource()) {
                user.setDataSource(this)
            }
            this.__current = user
        }, getDocument: function (identifier, type) {
            var docs = this.getDocuments(identifier);
            var doc = DocumentHelper.lastDocument(docs, type);
            if (!doc && type === Document.VISA) {
                doc = DocumentHelper.lastDocument(docs, 'profile')
            }
            return doc
        }, getName: function (identifier) {
            var type;
            if (identifier.isUser()) {
                type = Document.VISA
            } else if (identifier.isGroup()) {
                type = Document.BULLETIN
            } else {
                type = '*'
            }
            var doc = this.getDocument(identifier, type);
            if (doc) {
                var name = doc.getName();
                if (name && name.length > 0) {
                    return name
                }
            }
            return ns.Anonymous.getName(identifier)
        }, getContacts: function (user) {
            var db = this.getArchivist();
            return db.getContacts(user)
        }, getPrivateKeysForDecryption: function (user) {
            var db = this.getArchivist();
            return db.getPrivateKeysForDecryption(user)
        }, getPrivateKeyForSignature: function (user) {
            var db = this.getArchivist();
            return db.getPrivateKeyForSignature(user)
        }, getPrivateKeyForVisaSignature: function (user) {
            var db = this.getArchivist();
            return db.getPrivateKeyForVisaSignature(user)
        }
    });
    ns.CommonFacebook = CommonFacebook
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Converter = ns.type.Converter;
    var Log = ns.lnc.Log;
    var Command = ns.protocol.Command;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var Compatible = ns.Compatible;
    var Messenger = ns.Messenger;
    var CommonMessenger = function (session, facebook, db) {
        Messenger.call(this);
        this.__session = session;
        this.__facebook = facebook;
        this.__db = db;
        this.__packer = null;
        this.__processor = null
    };
    Class(CommonMessenger, Messenger, null, {
        encryptKey: function (keyData, receiver, iMsg) {
            try {
                return Messenger.prototype.encryptKey.call(this, keyData, receiver, iMsg)
            } catch (e) {
                Log.error('failed to encrypt key for receiver', receiver, e)
            }
        }, serializeKey: function (password, iMsg) {
            var reused = password.getValue('reused');
            var digest = password.getValue('digest');
            if (reused === null && digest === null) {
                return Messenger.prototype.serializeKey.call(this, password, iMsg)
            }
            password.removeValue('reused');
            password.removeValue('digest');
            var data = Messenger.prototype.serializeKey.call(this, password, iMsg);
            if (Converter.getBoolean(reused, false)) {
                password.setValue('reused', true)
            }
            if (digest) {
                password.setValue('digest', digest)
            }
            return data
        }, serializeContent: function (content, password, iMsg) {
            if (Interface.conforms(content, Command)) {
                content = Compatible.fixCommand(content)
            }
            return Messenger.prototype.serializeContent.call(this, content, password, iMsg)
        }, deserializeContent: function (data, password, sMsg) {
            var content = Messenger.prototype.deserializeContent.call(this, data, password, sMsg);
            if (Interface.conforms(content, Command)) {
                content = Compatible.fixCommand(content)
            }
            return content
        }, sendContent: function (content, sender, receiver, priority) {
            if (!sender) {
                var facebook = this.getFacebook();
                var current = facebook.getCurrentUser();
                sender = current.getIdentifier()
            }
            var env = Envelope.create(sender, receiver, null);
            var iMsg = InstantMessage.create(env, content);
            var rMsg = this.sendInstantMessage(iMsg, priority);
            return [iMsg, rMsg]
        }, sendInstantMessage: function (iMsg, priority) {
            var sender = iMsg.getSender();
            var receiver = iMsg.getReceiver();
            if (sender.equals(receiver)) {
                Log.warning('drop cycled message', iMsg.getContent(), sender, receiver, iMsg.getGroup());
                return null
            } else {
                Log.debug('send instant message, type:' + iMsg.getContent().getType(), sender, receiver, iMsg.getGroup());
                attachVisaTime.call(this, sender, iMsg)
            }
            var sMsg = this.encryptMessage(iMsg);
            if (!sMsg) {
                return null
            }
            var rMsg = this.signMessage(sMsg);
            if (!rMsg) {
                throw new Error('failed to sign message: ' + sMsg.toString());
            }
            if (this.sendReliableMessage(rMsg, priority)) {
                return rMsg
            } else {
                return null
            }
        }, sendReliableMessage: function (rMsg, priority) {
            var sender = rMsg.getSender();
            var receiver = rMsg.getReceiver();
            if (sender.equals(receiver)) {
                Log.warning('drop cycled message', sender, receiver, rMsg.getGroup());
                return false
            }
            var data = this.serializeMessage(rMsg);
            if (!data || data.length === 0) {
                Log.error('failed to serialize message', rMsg);
                return false
            }
            var session = this.getSession();
            return session.queueMessagePackage(rMsg, data, priority)
        }
    });
    var attachVisaTime = function (sender, iMsg) {
        if (Interface.conforms(iMsg.getContent(), Command)) {
            return false
        }
        var facebook = this.getFacebook();
        var doc = facebook.getVisa(sender);
        if (!doc) {
            Log.warning('failed to get visa document for sender', sender);
            return false
        }
        var lastDocumentTime = doc.getTime();
        if (lastDocumentTime) {
            iMsg.setDateTime('SDT', lastDocumentTime)
        }
        return true
    };
    CommonMessenger.prototype.getSession = function () {
        return this.__session
    };
    CommonMessenger.prototype.getEntityDelegate = function () {
        return this.__facebook
    }
    CommonMessenger.prototype.getFacebook = function () {
        return this.__facebook
    };
    CommonMessenger.prototype.getDatabase = function () {
        return this.__db
    };
    CommonMessenger.prototype.getCipherKeyDelegate = function () {
        return this.__db
    };
    CommonMessenger.prototype.getPacker = function () {
        return this.__packer
    };
    CommonMessenger.prototype.setPacker = function (packer) {
        this.__packer = packer
    };
    CommonMessenger.prototype.getProcessor = function () {
        return this.__processor
    };
    CommonMessenger.prototype.setProcessor = function (processor) {
        this.__processor = processor
    };
    ns.CommonMessenger = CommonMessenger
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var MessageHelper = ns.msg.MessageHelper;
    var MessagePacker = ns.MessagePacker;
    var CommonPacker = function (facebook, messenger) {
        MessagePacker.call(this, facebook, messenger)
    };
    Class(CommonPacker, MessagePacker, null, {
        getVisaKey: function (user) {
            var facebook = this.getFacebook();
            return facebook.getPublicKeyForEncryption(user)
        }, getMembers: function (group) {
            var facebook = this.getFacebook();
            return facebook.getMembers(group)
        }, checkSender: function (rMsg) {
            var sender = rMsg.getSender();
            var visa = MessageHelper.getVisa(rMsg);
            if (visa) {
                return visa.getIdentifier().equals(sender)
            } else if (this.getVisaKey(sender)) {
                return true
            }
            var error = {'message': 'verify key not found', 'user': sender.toString()};
            this.suspendReliableMessage(rMsg, error);
            return false
        }, checkReceiver: function (iMsg) {
            var receiver = iMsg.getReceiver();
            if (receiver.isBroadcast()) {
                return true
            } else if (receiver.isGroup()) {
                return false
            } else if (this.getVisaKey(receiver)) {
                return true
            }
            var error = {'message': 'encrypt key not found', 'user': receiver.toString()};
            this.suspendInstantMessage(iMsg, error);
            return false
        }, encryptMessage: function (iMsg) {
            if (this.checkReceiver(iMsg)) {
            } else {
                Log.warning('receiver not ready', iMsg.getReceiver());
                return null
            }
            return MessagePacker.prototype.encryptMessage.call(this, iMsg)
        }, verifyMessage: function (rMsg) {
            if (this.checkSender(rMsg)) {
            } else {
                Log.warning('sender not ready', rMsg.getSender());
                return null
            }
            return MessagePacker.prototype.verifyMessage.call(this, rMsg)
        }, signMessage: function (sMsg) {
            if (Interface.conforms(sMsg, ReliableMessage)) {
                return sMsg
            }
            return MessagePacker.prototype.signMessage.call(this, sMsg)
        }, deserializeMessage: function (data) {
            if (!data || data.length <= 4) {
                return null
            }
            var rMsg = MessagePacker.prototype.deserializeMessage.call(this, data);
            if (rMsg) {
                ns.Compatible.fixMetaAttachment(rMsg)
            }
            return rMsg
        }, serializeMessage: function (rMsg) {
            ns.Compatible.fixMetaAttachment(rMsg);
            return MessagePacker.prototype.serializeMessage.call(this, rMsg)
        }
    });
    CommonPacker.prototype.suspendReliableMessage = function (rMsg, info) {
    };
    CommonPacker.prototype.suspendInstantMessage = function (iMsg, info) {
    };
    ns.CommonPacker = CommonPacker
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var MessageProcessor = ns.MessageProcessor;
    var CommonProcessor = function (facebook, messenger) {
        MessageProcessor.call(this, facebook, messenger)
    };
    Class(CommonProcessor, MessageProcessor, null, {
        processContent: function (content, rMsg) {
            var responses = MessageProcessor.processContent.call(this, content, rMsg);
            checkVisaTime.call(this, content, rMsg);
            return responses
        }
    });
    var checkVisaTime = function (content, rMsg) {
        var facebook = this.getFacebook();
        var archivist = facebook.getArchivist();
        if (!archivist) {
            throw new ReferenceError('archivist not found');
        }
        var docUpdated = false;
        var lastDocumentTime = rMsg.getDateTime('SDT', null);
        if (lastDocumentTime) {
            var now = new Date();
            if (lastDocumentTime.getTime() > now.getTime()) {
                lastDocumentTime = now
            }
            var sender = rMsg.getSender();
            docUpdated = archivist.setLastDocumentTime(sender, lastDocumentTime);
            if (docUpdated) {
                facebook.getDocuments(sender)
            }
        }
        return docUpdated
    };
    ns.CommonProcessor = CommonProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var PrivateKey = ns.crypto.PrivateKey;
    var ID = ns.protocol.ID;
    var EntityType = ns.protocol.EntityType;
    var Meta = ns.protocol.Meta;
    var BaseVisa = ns.mkm.BaseVisa;
    var BaseBulletin = ns.mkm.BaseBulletin;
    var Register = function (db) {
        this.__db = db
    };
    Register.prototype.createUser = function (nickname, avatar) {
        var privateKey = PrivateKey.generate(PrivateKey.RSA);
        var meta = Meta.generate(Meta.MKM, privateKey, 'web-demo');
        var uid = ID.generate(meta, EntityType.USER, null);
        var pKey = privateKey.getPublicKey();
        var doc = createVisa(uid, nickname, avatar, pKey, privateKey);
        this.__db.saveMeta(meta, uid);
        this.__db.savePrivateKey(privateKey, 'M', uid);
        this.__db.saveDocument(doc);
        return uid
    };
    Register.prototype.createGroup = function (founder, title) {
        var r = Math.ceil(Math.random() * 999990000) + 10000;
        var seed = 'Group-' + r;
        var privateKey = this.__db.getPrivateKeyForVisaSignature(founder);
        var meta = Meta.generate(Meta.MKM, privateKey, seed);
        var gid = ID.generate(meta, EntityType.GROUP, null);
        var doc = createBulletin(gid, title, founder, privateKey);
        this.__db.saveMeta(meta, gid);
        this.__db.saveDocument(doc);
        this.__db.saveMembers([founder], gid);
        return gid
    };
    var createVisa = function (identifier, name, avatarUrl, pKey, sKey) {
        var doc = new BaseVisa(identifier);
        doc.setProperty('app_id', 'chat.dim.web');
        doc.setName(name);
        doc.setAvatar(avatarUrl);
        doc.setPublicKey(pKey);
        doc.sign(sKey);
        return doc
    };
    var createBulletin = function (identifier, name, founder, sKey) {
        var doc = new BaseBulletin(identifier);
        doc.setProperty('app_id', 'chat.dim.web');
        doc.setProperty('founder', founder.toString());
        doc.setName(name);
        doc.sign(sKey);
        return doc
    };
    ns.Register = Register
})(DIMP);
(function (ns) {
    'use strict';
    var Command = ns.protocol.Command;
    var CommandParser = ns.CommandParser;
    var BaseHandshakeCommand = ns.dkd.cmd.BaseHandshakeCommand;
    var BaseLoginCommand = ns.dkd.cmd.BaseLoginCommand;
    var BaseReportCommand = ns.dkd.cmd.BaseReportCommand;
    var BaseMuteCommand = ns.dkd.cmd.BaseMuteCommand;
    var BaseBlockCommand = ns.dkd.cmd.BaseBlockCommand;
    var BaseSearchCommand = ns.dkd.cmd.BaseSearchCommand;
    var BaseStorageCommand = ns.dkd.cmd.BaseStorageCommand;
    var registerExtraCommandFactories = function () {
        Command.setFactory(Command.HANDSHAKE, new CommandParser(BaseHandshakeCommand));
        Command.setFactory(Command.LOGIN, new CommandParser(BaseLoginCommand));
        Command.setFactory(Command.REPORT, new CommandParser(BaseReportCommand));
        Command.setFactory('broadcast', new CommandParser(BaseReportCommand));
        Command.setFactory(Command.ONLINE, new CommandParser(BaseReportCommand));
        Command.setFactory(Command.OFFLINE, new CommandParser(BaseReportCommand));
        Command.setFactory(Command.MUTE, new CommandParser(BaseMuteCommand));
        Command.setFactory(Command.BLOCK, new CommandParser(BaseBlockCommand));
        Command.setFactory(Command.SEARCH, new CommandParser(BaseSearchCommand));
        Command.setFactory(Command.ONLINE_USERS, new CommandParser(BaseSearchCommand));
        Command.setFactory(Command.STORAGE, new CommandParser(BaseStorageCommand));
        Command.setFactory(Command.CONTACTS, new CommandParser(BaseStorageCommand));
        Command.setFactory(Command.PRIVATE_KEY, new CommandParser(BaseStorageCommand))
    };
    ns.registerAllFactories();
    registerExtraCommandFactories();
    ns.registerPlugins();
    ns.registerEntityIDFactory();
    ns.registerCompatibleAddressFactory();
    ns.registerCompatibleMetaFactory()
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var DecryptKey = ns.crypto.DecryptKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var Storage = ns.dos.LocalStorage;
    var PrivateKeyDBI = ns.dbi.PrivateKeyDBI;
    var id_key_path = function (user) {
        return 'pri.' + user.getAddress().toString() + '.secret'
    };
    var msg_keys_path = function (user) {
        return 'pri.' + user.getAddress().toString() + '.secret_keys'
    };
    var PrivateKeyStorage = function () {
        Object.call(this)
    };
    Class(PrivateKeyStorage, Object, [PrivateKeyDBI], {
        savePrivateKey: function (key, type, user) {
            if (type === PrivateKeyDBI.META) {
                return this.saveIdKey(key, user)
            } else {
                return this.saveMsgKey(key, user)
            }
        }, getPrivateKeysForDecryption: function (user) {
            var privateKeys = this.loadMsgKeys(user);
            var idKey = this.loadIdKey(user);
            if (Interface.conforms(idKey, DecryptKey)) {
                if (PrivateKeyDBI.findKey(idKey, privateKeys) < 0) {
                    privateKeys.push(idKey)
                }
            }
            return privateKeys
        }, getPrivateKeyForSignature: function (user) {
            return this.getPrivateKeyForVisaSignature(user)
        }, getPrivateKeyForVisaSignature: function (user) {
            return this.loadIdKey(user)
        }
    });
    PrivateKeyStorage.prototype.loadIdKey = function (user) {
        var path = id_key_path(user);
        var info = Storage.loadJSON(path);
        return PrivateKey.parse(info)
    };
    PrivateKeyStorage.prototype.saveIdKey = function (key, user) {
        var path = id_key_path(user);
        return Storage.saveJSON(key.toMap(), path)
    };
    PrivateKeyStorage.prototype.loadMsgKeys = function (user) {
        var privateKeys = [];
        var path = msg_keys_path(user);
        var array = Storage.loadJSON(path);
        if (array) {
            var key;
            for (var i = 0; i < array.length; ++i) {
                key = PrivateKey.parse(array[i]);
                if (key) {
                    privateKeys.push(key)
                }
            }
        }
        return privateKeys
    };
    PrivateKeyStorage.prototype.saveMsgKey = function (key, user) {
        var privateKeys = this.loadMsgKeys(user);
        privateKeys = PrivateKeyDBI.insertKey(key, privateKeys);
        if (!privateKeys) {
            return false
        }
        var plain = PrivateKeyDBI.revertPrivateKeys(privateKeys);
        var path = msg_keys_path(user);
        return Storage.saveJSON(plain, path)
    };
    ns.database.PrivateKeyStorage = PrivateKeyStorage
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Meta = ns.protocol.Meta;
    var Storage = ns.dos.LocalStorage;
    var MetaDBI = ns.dbi.MetaDBI;
    var meta_path = function (entity) {
        return 'pub.' + entity.getAddress().toString() + '.meta'
    };
    var MetaStorage = function () {
        Object.call(this)
    };
    Class(MetaStorage, Object, [MetaDBI], null);
    MetaStorage.prototype.saveMeta = function (meta, entity) {
        var path = meta_path(entity);
        return Storage.saveJSON(meta.toMap(), path)
    };
    MetaStorage.prototype.getMeta = function (entity) {
        var path = meta_path(entity);
        var info = Storage.loadJSON(path);
        return Meta.parse(info)
    };
    ns.database.MetaStorage = MetaStorage
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var TransportableData = ns.format.TransportableData;
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var Storage = ns.dos.LocalStorage;
    var DocumentDBI = ns.dbi.DocumentDBI;
    var doc_path = function (entity) {
        return 'pub.' + entity.getAddress().toString() + '.docs'
    };
    var DocumentStorage = function () {
        Object.call(this)
    };
    Class(DocumentStorage, Object, [DocumentDBI], null);
    DocumentStorage.prototype.saveDocument = function (doc) {
        var entity = doc.getIdentifier();
        var type = doc.getString('type', '');
        var documents = this.getDocuments(entity);
        var index = find_document(documents, entity, type);
        if (index < 0) {
            documents.unshift(doc)
        } else if (documents[index].equals(doc)) {
            return true
        } else {
            documents.splice(index, 1);
            documents.unshift(doc)
        }
        var array = revert_documents(documents);
        var path = doc_path(entity);
        return Storage.saveJSON(array, path)
    };
    DocumentStorage.prototype.getDocuments = function (entity) {
        var path = doc_path(entity);
        var array = Storage.loadJSON(path);
        return !array ? [] : convert_documents(array)
    };
    var parse_document = function (dict, identifier, type) {
        var entity = ID.parse(dict['ID']);
        if (!identifier) {
            identifier = entity
        } else if (!identifier.equals(entity)) {
            throw new TypeError('document error: ' + dict);
        }
        if (!type) {
            type = '*'
        }
        var dt = dict['type'];
        if (dt) {
            type = dt
        }
        var data = dict['data'];
        if (!data) {
            data = dict['profile']
        }
        var signature = dict['signature'];
        if (!data || !signature) {
            throw new ReferenceError('document error: ' + dict);
        }
        var ted = TransportableData.parse(signature);
        return Document.create(type, identifier, data, ted)
    };
    var convert_documents = function (array) {
        var documents = [];
        var doc;
        for (var i = 0; i < array.length; ++i) {
            doc = parse_document(array[i]);
            if (doc) {
                documents.push(doc)
            }
        }
        return documents
    };
    var revert_documents = function (documents) {
        var array = [];
        for (var i = 0; i < documents.length; ++i) {
            array.push(documents[i].toMap())
        }
        return array
    };
    var find_document = function (documents, identifier, type) {
        var item;
        for (var i = 0; i < documents.length; ++i) {
            item = documents[i];
            if (item.getIdentifier().equals(identifier) && item.getString('type', '') === type) {
                return i
            }
        }
        return -1
    };
    DocumentStorage.parse = parse_document;
    ns.database.DocumentStorage = DocumentStorage
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Departure = ns.startrek.port.Departure;
    var MessageWrapper = function (rMsg, departure) {
        this.__msg = rMsg;
        this.__ship = departure
    };
    Class(MessageWrapper, null, [Departure], null);
    MessageWrapper.prototype.getMessage = function () {
        return this.__msg
    };
    MessageWrapper.prototype.getSN = function () {
        return this.__ship.getSN()
    };
    MessageWrapper.prototype.getPriority = function () {
        return this.__ship.getPriority()
    };
    MessageWrapper.prototype.getFragments = function () {
        return this.__ship.getFragments()
    };
    MessageWrapper.prototype.checkResponse = function (arrival) {
        return this.__ship.checkResponse(arrival)
    };
    MessageWrapper.prototype.isImportant = function () {
        return this.__ship.isImportant()
    };
    MessageWrapper.prototype.touch = function (now) {
        return this.__ship.touch(now)
    };
    MessageWrapper.prototype.getStatus = function (now) {
        return this.__ship.getStatus(now)
    };
    ns.network.MessageWrapper = MessageWrapper
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Arrays = ns.type.Arrays;
    var Log = ns.lnc.Log;
    var MessageWrapper = ns.network.MessageWrapper;
    var MessageQueue = function () {
        this.__priorities = [];
        this.__fleets = {}
    };
    Class(MessageQueue, null, null, null);
    MessageQueue.prototype.append = function (rMsg, departure) {
        var ok = true;
        var priority = departure.getPriority();
        var array = this.__fleets[priority];
        if (!array || array.length === 0) {
            array = [];
            this.__fleets[priority] = array;
            insert_priority(priority, this.__priorities)
        } else {
            var signature = rMsg.getValue('signature');
            var item;
            for (var i = array.length - 1; i >= 0; --i) {
                item = array[i].getMessage();
                if (item && is_duplicated(item, rMsg)) {
                    Log.warning('[QUEUE] duplicated message', signature);
                    ok = false;
                    break
                }
            }
        }
        if (ok) {
            array.push(new MessageWrapper(rMsg, departure))
        }
        return ok
    };
    var is_duplicated = function (msg1, msg2) {
        var sig1 = msg1.getValue('signature');
        var sig2 = msg2.getValue('signature');
        if (!sig1 || !sig2) {
            return false
        } else if (sig1 !== sig2) {
            return false
        }
        var to1 = msg1.getReceiver();
        var to2 = msg2.getReceiver();
        return to1.equals(to2)
    };
    var insert_priority = function (prior, priorities) {
        var total = priorities.length;
        var value;
        var index = 0;
        for (; index < total; ++index) {
            value = priorities[index];
            if (value === prior) {
                return
            } else if (value > prior) {
                break
            }
        }
        Arrays.insert(priorities, index, prior)
    };
    MessageQueue.prototype.next = function () {
        var priority;
        var array;
        for (var i = 0; i < this.__priorities.length; ++i) {
            priority = this.__priorities[i];
            array = this.__fleets[priority];
            if (array && array.length > 0) {
                return array.shift()
            }
        }
        return null
    };
    MessageQueue.prototype.purge = function () {
        var priority;
        var array;
        for (var i = this.__priorities.length - 1; i >= 0; --i) {
            priority = this.__priorities[i];
            array = this.__fleets[priority];
            if (!array) {
                this.__priorities.splice(i, 1)
            } else if (array.length === 0) {
                delete this.__fleets[priority];
                this.__priorities.splice(i, 1)
            }
        }
        return null
    };
    ns.network.MessageQueue = MessageQueue
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var UTF8 = ns.format.UTF8;
    var CommonGate = ns.startrek.WSClientGate;
    var PlainPorter = ns.startrek.PlainPorter;
    var PlainArrival = ns.startrek.PlainArrival;
    var AckEnableGate = function (keeper) {
        CommonGate.call(this, keeper)
    };
    Class(AckEnableGate, CommonGate, null, {
        createPorter: function (remote, local) {
            var docker = new AckEnablePorter(remote, local);
            docker.setDelegate(this.getDelegate());
            return docker
        }
    });
    var AckEnablePorter = function (remote, local) {
        PlainPorter.call(this, remote, local)
    };
    Class(AckEnablePorter, PlainPorter, null, {
        checkArrival: function (income) {
            if (income instanceof PlainArrival) {
                var payload = income.getPayload();
                if (!payload || payload.length === 0) {
                } else if (payload[0] === jsonBegin) {
                    var sig = fetchValue(payload, bytes('signature'));
                    var sec = fetchValue(payload, bytes('time'));
                    if (sig && sec) {
                        var signature = UTF8.decode(sig);
                        var timestamp = UTF8.decode(sec);
                        var text = 'ACK:{"time":' + timestamp + ',"signature":"' + signature + '"}';
                        var priority = 1
                        this.send(bytes(text), priority)
                    }
                }
            }
            return PlainPorter.prototype.checkArrival(income)
        }
    });
    var jsonBegin = '{'.charCodeAt(0);
    var fetchValue = function (data, tag) {
        if (tag.length === 0) {
            return null
        }
        var pos = find(data, tag, 0);
        if (pos < 0) {
            return null
        } else {
            pos += tag.length
        }
        pos = find(data, bytes(':'), pos);
        if (pos < 0) {
            return null
        } else {
            pos += 1
        }
        var end = find(data, bytes(','), pos);
        if (end < 0) {
            end = find(data, bytes('}'), pos);
            if (end < 0) {
                return null
            }
        }
        var value = data.subarray(pos, end);
        value = strip(value, bytes(' '));
        value = strip(value, bytes('"'));
        value = strip(value, bytes("'"));
        return value
    };
    var bytes = function (text) {
        return UTF8.encode(text)
    };
    var find = function (data, sub, start) {
        if (!start) {
            start = 0
        }
        var end = data.length - sub.length;
        var i, j;
        var match;
        for (i = start; i <= end; ++i) {
            match = true;
            for (j = 0; j < sub.length; ++j) {
                if (data[i + j] === sub[j]) {
                    continue
                }
                match = false;
                break
            }
            if (match) {
                return i
            }
        }
        return -1
    };
    var strip = function (data, removing) {
        data = stripRight(data, removing);
        return stripLeft(data, removing)
    };
    var stripLeft = function (data, leading) {
        var c = leading.length;
        if (c === 0) {
            return data
        }
        var i;
        while (c <= data.length) {
            for (i = 0; i < c; ++i) {
                if (data[i] !== leading[i]) {
                    return data
                }
            }
            data = data.subarray(c)
        }
        return data
    };
    var stripRight = function (data, trailing) {
        var c = trailing.length;
        if (c === 0) {
            return data
        }
        var i;
        var m = data.length - c;
        while (m >= 0) {
            for (i = 0; i < c; ++i) {
                if (data[m + i] !== trailing[i]) {
                    return data
                }
            }
            data = data.subarray(0, m);
            m -= c
        }
        return data
    };
    var DataUtils = {bytes: bytes, find: find, strip: strip, stripLeft: stripLeft, stripRight: stripRight};
    ns.network.AckEnableGate = AckEnableGate;
    ns.network.AckEnablePorter = AckEnablePorter;
    ns.utils.DataUtils = DataUtils
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var Runner = ns.fsm.skywalker.Runner;
    var InetSocketAddress = ns.startrek.type.InetSocketAddress;
    var PorterDelegate = ns.startrek.port.PorterDelegate;
    var ClientHub = ns.ws.ClientHub;
    var AckEnableGate = ns.network.AckEnableGate;
    var MessageQueue = ns.network.MessageQueue;
    var GateKeeper = function (host, port) {
        Runner.call(this);
        this.__remote = new InetSocketAddress(host, port);
        this.__gate = this.createGate(this.__remote);
        this.__queue = new MessageQueue();
        this.__active = false;
        this.__last_active = 0;
        this.__reconnect_time = 0
    };
    Class(GateKeeper, Runner, [PorterDelegate], null);
    GateKeeper.prototype.createGate = function (remote) {
        var gate = new AckEnableGate(this);
        var hub = this.createHub(gate, remote);
        gate.setHub(hub);
        return gate
    };
    GateKeeper.prototype.createHub = function (delegate, remote) {
        var hub = new ClientHub(delegate);
        hub.connect(remote, null);
        return hub
    };
    GateKeeper.prototype.getRemoteAddress = function () {
        return this.__remote
    };
    GateKeeper.prototype.getGate = function () {
        return this.__gate
    };
    GateKeeper.prototype.isActive = function () {
        return this.__active
    };
    GateKeeper.prototype.setActive = function (active, when) {
        if (this.__active === active) {
            return false
        }
        if (!when || when === 0) {
            when = (new Date()).getTime()
        } else if (when instanceof Date) {
            when = when.getTime()
        }
        if (when <= this.__last_active) {
            return false
        }
        this.__active = active;
        this.__last_active = when;
        return true
    };
    GateKeeper.prototype.isRunning = function () {
        if (Runner.prototype.isRunning.call(this)) {
            return this.__gate.isRunning()
        } else {
            return false
        }
    };
    GateKeeper.prototype.stop = function () {
        Runner.prototype.stop.call(this)
        this.__gate.stop()
    };
    GateKeeper.prototype.setup = function () {
        var again = Runner.prototype.setup.call(this)
        this.__gate.start();
        return again
    };
    GateKeeper.prototype.finish = function () {
        this.__gate.stop();
        return Runner.prototype.finish.call(this)
    };
    GateKeeper.prototype.process = function () {
        var gate = this.getGate();
        var remote = this.getRemoteAddress();
        var docker = gate.getPorter(remote, null);
        if (!docker) {
            var now = (new Date()).getTime();
            if (now < this.__reconnect_time) {
                return false
            }
            docker = gate.fetchPorter(remote, null);
            if (!docker) {
                Log.error('gate error', remote);
                this.__reconnect_time = now + 8000;
                return false
            }
        }
        var hub = gate.getHub();
        try {
            var incoming = hub.process();
            var outgoing = gate.process();
            if (incoming || outgoing) {
                return true
            }
        } catch (e) {
            Log.error('GateKeeper::process()', e);
            return false
        }
        var queue = this.__queue;
        if (!this.isActive()) {
            queue.purge();
            return false
        }
        var wrapper = queue.next();
        if (!wrapper) {
            queue.purge();
            return false
        }
        var msg = wrapper.getMessage();
        if (!msg) {
            return true
        }
        var ok = gate.sendShip(wrapper, remote, null);
        if (!ok) {
            Log.error('gate error, failed to send data', wrapper, remote)
        }
        return true
    };
    GateKeeper.prototype.queueAppend = function (rMsg, departure) {
        var queue = this.__queue;
        return queue.append(rMsg, departure)
    };
    GateKeeper.prototype.onPorterStatusChanged = function (previous, current, docker) {
        Log.info('GateKeeper::onPorterStatusChanged()', previous, current, docker)
    };
    GateKeeper.prototype.onPorterReceived = function (arrival, docker) {
        Log.info('GateKeeper::onPorterReceived()', arrival, docker)
    };
    GateKeeper.prototype.onPorterSent = function (departure, docker) {
    };
    GateKeeper.prototype.onPorterFailed = function (error, departure, docker) {
        Log.info('GateKeeper::onPorterFailed()', error, departure, docker)
    };
    GateKeeper.prototype.onPorterError = function (error, departure, docker) {
        Log.info('GateKeeper::onPorterError()', error, departure, docker)
    };
    ns.network.GateKeeper = GateKeeper
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Transmitter = Interface(null, null);
    Transmitter.prototype.sendContent = function (content, sender, receiver, priority) {
    };
    Transmitter.prototype.sendInstantMessage = function (iMsg, priority) {
    };
    Transmitter.prototype.sendReliableMessage = function (rMsg, priority) {
    };
    var Session = Interface(null, [Transmitter]);
    Session.prototype.getDatabase = function () {
    };
    Session.prototype.getRemoteAddress = function () {
    };
    Session.prototype.getSessionKey = function () {
    };
    Session.prototype.setIdentifier = function (user) {
    };
    Session.prototype.getIdentifier = function () {
    };
    Session.prototype.setActive = function (flag, when) {
    };
    Session.prototype.isActive = function () {
    };
    Session.prototype.queueMessagePackage = function (rMsg, data, priority) {
    };
    ns.network.Transmitter = Transmitter;
    ns.network.Session = Session
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var PlainDeparture = ns.startrek.PlainDeparture;
    var Session = ns.network.Session;
    var GateKeeper = ns.network.GateKeeper;
    var BaseSession = function (db, host, port) {
        GateKeeper.call(this, host, port);
        this.__db = db;
        this.__id = null;
        this.__messenger = null
    };
    Class(BaseSession, GateKeeper, [Session], {
        queueMessagePackage: function (rMsg, data, priority) {
            var ship = new PlainDeparture(data, priority);
            return this.queueAppend(rMsg, ship)
        }
    });
    BaseSession.prototype.getDatabase = function () {
        return this.__db
    };
    BaseSession.prototype.getIdentifier = function () {
        return this.__id
    };
    BaseSession.prototype.setIdentifier = function (user) {
        var identifier = this.__id;
        if (!identifier) {
            if (!user) {
                return false
            }
        } else if (identifier.equals(user)) {
            return false
        }
        this.__id = user;
        return true
    };
    BaseSession.prototype.getMessenger = function () {
        return this.__messenger
    };
    BaseSession.prototype.setMessenger = function (messenger) {
        this.__messenger = messenger
    };
    BaseSession.prototype.sendContent = function (content, sender, receiver, priority) {
        var messenger = this.getMessenger();
        return messenger.sendContent(content, sender, receiver, priority)
    };
    BaseSession.prototype.sendInstantMessage = function (iMsg, priority) {
        var messenger = this.getMessenger();
        return messenger.sendInstantMessage(iMsg, priority)
    };
    BaseSession.prototype.sendReliableMessage = function (rMsg, priority) {
        var messenger = this.getMessenger();
        return messenger.sendReliableMessage(rMsg, priority)
    };
    ns.network.BaseSession = BaseSession
})(DIMP);
;(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var Runner = ns.fsm.skywalker.Runner;
    var Thread = ns.fsm.threading.Thread;
    var EntityType = ns.protocol.EntityType;
    var Group = ns.mkm.Group;
    var TwinsHelper = ns.TwinsHelper;
    var GroupDelegate = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
        botsManager.setMessenger(messenger)
    };
    Class(GroupDelegate, TwinsHelper, [Group.DataSource], {
        buildGroupName: function (members) {
            var barrack = this.getFacebook();
            var text = barrack.getName(members[0]);
            var nickname;
            for (var i = 1; i < members.length; ++i) {
                nickname = barrack.getName(members[i]);
                if (!nickname || nickname.length === 0) {
                    continue
                }
                text += ', ' + nickname;
                if (text.length > 32) {
                    return text.substring(0, 28) + ' ...'
                }
            }
            return text
        }, getMeta: function (identifier) {
            var barrack = this.getFacebook();
            return !barrack ? null : barrack.getMeta(identifier)
        }, getDocuments: function (identifier) {
            var barrack = this.getFacebook();
            return !barrack ? [] : barrack.getDocuments(identifier)
        }, getBulletin: function (identifier) {
            var barrack = this.getFacebook();
            return !barrack ? null : barrack.getBulletin(identifier)
        }, saveDocument: function (doc) {
            var barrack = this.getFacebook();
            return !barrack ? false : barrack.saveDocument(doc)
        }, getFounder: function (group) {
            var barrack = this.getFacebook();
            return !barrack ? null : barrack.getFounder(group)
        }, getOwner: function (group) {
            var barrack = this.getFacebook();
            return !barrack ? null : barrack.getOwner(group)
        }, getMembers: function (group) {
            var barrack = this.getFacebook();
            return !barrack ? [] : barrack.getMembers(group)
        }, saveMembers: function (members, group) {
            var barrack = this.getFacebook();
            return !barrack ? false : barrack.saveMembers(members, group)
        }, getAssistants: function (group) {
            return botsManager.getAssistants(group)
        }, getFastestAssistant: function (group) {
            return botsManager.getFastestAssistant(group)
        }, setCommonAssistants: function (bots) {
            botsManager.setCommonAssistants(bots)
        }, updateRespondTime: function (content, envelope) {
            return botsManager.updateRespondTime(content, envelope)
        }, getAdministrators: function (group) {
            var barrack = this.getFacebook();
            return !barrack ? [] : barrack.getAdministrators(group)
        }, saveAdministrators: function (admins, group) {
            var barrack = this.getFacebook();
            return !barrack ? false : barrack.saveAdministrators(admins, group)
        }, isFounder: function (user, group) {
            var founder = this.getFounder(group);
            if (founder) {
                return founder.equals(user)
            }
            var gMeta = this.getMeta(group);
            var mMeta = this.getMeta(user);
            if (!gMeta || !mMeta) {
                Log.error('failed to get meta for group', group, user);
                return false
            }
            return gMeta.matchPublicKey(mMeta.getPublicKey())
        }, isOwner: function (user, group) {
            var owner = this.getOwner(group);
            if (owner) {
                return owner.equals(user)
            }
            if (EntityType.GROUP.equals(group.getType())) {
                return this.isFounder(user, group)
            }
            Log.error('only polylogue so far', group);
            return false
        }, isMember: function (user, group) {
            var members = this.getMembers(group);
            if (!members || members.length === 0) {
                Log.error('group members not ready', group);
                return false
            }
            for (var i = 0; i < members.length; ++i) {
                if (members[i].equals(user)) {
                    return true
                }
            }
            return false
        }, isAdministrator: function (user, group) {
            var admins = this.getAdministrators(group);
            if (!admins || admins.length === 0) {
                Log.info('group admins not found', group);
                return false
            }
            for (var i = 0; i < admins.length; ++i) {
                if (admins[i].equals(user)) {
                    return true
                }
            }
            return false
        }, isAssistant: function (user, group) {
            var bots = this.getAssistants(group);
            if (!bots || bots.length === 0) {
                Log.info('group bots not found', group);
                return false
            }
            for (var i = 0; i < bots.length; ++i) {
                if (bots[i].equals(user)) {
                    return true
                }
            }
            return false
        }
    });
    var TripletsHelper = function (delegate) {
        Object.call(this);
        this.__delegate = delegate
    };
    Class(TripletsHelper, Object, null, null);
    TripletsHelper.prototype.getDelegate = function () {
        return this.__delegate
    };
    TripletsHelper.prototype.getFacebook = function () {
        var delegate = this.getDelegate();
        return delegate.getFacebook()
    };
    TripletsHelper.prototype.getMessenger = function () {
        var delegate = this.getDelegate();
        return delegate.getMessenger()
    };
    TripletsHelper.prototype.getArchivist = function () {
        var facebook = this.getFacebook();
        return !facebook ? null : facebook.getArchivist()
    };
    TripletsHelper.prototype.getDatabase = function () {
        var archivist = this.getArchivist();
        return !archivist ? null : archivist.getDatabase()
    };
    var GroupBotsManager = function () {
        Runner.call(this);
        this.__transceiver = null;
        this.__commonAssistants = [];
        this.__candidates = [];
        this.__respondTimes = {}
    };
    Class(GroupBotsManager, Runner, null);
    GroupBotsManager.prototype.setMessenger = function (messenger) {
        this.__transceiver = messenger
    };
    GroupBotsManager.prototype.getMessenger = function () {
        return this.__transceiver
    };
    GroupBotsManager.prototype.getFacebook = function () {
        var messenger = this.getMessenger();
        return !messenger ? null : messenger.getFacebook()
    };
    GroupBotsManager.prototype.updateRespondTime = function (content, envelope) {
        var sender = envelope.getSender();
        if (!EntityType.BOT.equals(sender.getType())) {
            return false
        }
        var origin = content.getOriginalEnvelope();
        var originalReceiver = !origin ? null : origin.getReceiver();
        if (!sender.equals(originalReceiver)) {
            return false
        }
        var time = !origin ? null : origin.getTime();
        if (!time) {
            return false
        }
        var duration = (new Date()).getTime() - time.getTime();
        if (duration <= 0) {
            return false
        }
        var cached = this.__respondTimes[sender];
        if (cached && cached <= duration) {
            return false
        }
        this.__respondTimes[sender] = duration;
        return true
    };
    GroupBotsManager.prototype.setCommonAssistants = function (bots) {
        addAll(this.__candidates, bots);
        this.__commonAssistants = bots
    };
    var addAll = function (toSet, fromItems) {
        var item;
        for (var i = 0; i < fromItems.length; ++i) {
            item = fromItems[i];
            if (toSet.indexOf(item) <= 0) {
                toSet.push(item)
            }
        }
    };
    GroupBotsManager.prototype.getAssistants = function (group) {
        var facebook = this.getFacebook();
        var bots = !facebook ? null : facebook.getAssistants(group);
        if (!bots || bots.length === 0) {
            return this.__commonAssistants
        }
        addAll(this.__candidates, bots);
        return bots
    };
    GroupBotsManager.prototype.getFastestAssistant = function (group) {
        var bots = this.getAssistants(group);
        if (!bots || bots.length === 0) {
            Log.warning('group bots not found: ' + group.toString());
            return null
        }
        var prime = null;
        var primeDuration;
        var duration;
        var ass;
        for (var i = 0; i < bots.length; ++i) {
            ass = bots[i];
            duration = this.__respondTimes[ass];
            if (!duration) {
                Log.info('group bot not respond yet, ignore it', ass, group);
                continue
            } else if (!primeDuration) {
            } else if (primeDuration < duration) {
                Log.info('this bot is slower, skip it', ass, prime, group);
                continue
            }
            prime = ass;
            primeDuration = duration
        }
        if (!prime) {
            prime = bots[0];
            Log.info('no bot responded, take the first one', bots, group)
        } else {
            Log.info('got the fastest bot with respond time', primeDuration, prime, group)
        }
        return prime
    };
    GroupBotsManager.prototype.process = function () {
        var messenger = this.getMessenger();
        var facebook = this.getFacebook();
        if (!facebook || !messenger) {
            return false
        }
        var session = messenger.getSession();
        if (session && session.getSessionKey() && session.isActive()) {
        } else {
            return false
        }
        var visa;
        try {
            var me = facebook.getCurrentUser();
            visa = !me ? null : me.getVisa();
            if (!visa) {
                Log.error('failed to get visa', me);
                return false
            }
        } catch (e) {
            Log.error('failed to get current user', e);
            return false
        }
        var bots = this.__candidates;
        this.__candidates = {};
        var item;
        for (var i = 0; i < bots.length; ++i) {
            item = bots[i];
            if (this.__respondTimes[item]) {
                Log.info('group bot already responded', item);
                continue
            }
            try {
                messenger.sendVisa(visa, item, false)
            } catch (e) {
                Log.error('failed to query assistant', item, e)
            }
        }
        return false
    };
    var botsManager = new GroupBotsManager();
    var thread = new Thread(botsManager);
    thread.start();
    ns.TripletsHelper = TripletsHelper;
    ns.group.GroupDelegate = GroupDelegate
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var Station = ns.mkm.Station;
    var TripletsHelper = ns.TripletsHelper;
    var AdminManager = function (delegate) {
        TripletsHelper.call(this, delegate)
    };
    Class(AdminManager, TripletsHelper, null, null);
    AdminManager.prototype.updateAdministrators = function (newAdmins, group) {
        var delegate = this.getDelegate();
        var barrack = this.getFacebook();
        var user = !barrack ? null : barrack.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return false
        }
        var me = user.getIdentifier();
        var sKey = !barrack ? null : barrack.getPrivateKeyForVisaSignature(me);
        var isOwner = delegate.isOwner(me, group);
        if (!isOwner) {
            return false
        }
        var bulletin = delegate.getBulletin(group);
        if (!bulletin) {
            Log.error('failed to get group document', group);
            return false
        } else {
            var clone = Document.parse(bulletin.copyMap(false));
            if (clone) {
                bulletin = clone
            } else {
                Log.error('bulletin error', bulletin, group);
                return false
            }
        }
        bulletin.setProperty('administrators', ID.revert(newAdmins));
        var signature = !sKey ? null : bulletin.sign(sKey);
        if (!signature) {
            Log.error('failed to sign document for group', group, me);
            return false
        } else if (!delegate.saveDocument(bulletin)) {
            Log.error('failed to save document for group', group);
            return false
        } else {
            Log.info('group document updated', group)
        }
        return this.broadcastGroupDocument(bulletin)
    };
    AdminManager.prototype.broadcastGroupDocument = function (doc) {
        var delegate = this.getDelegate();
        var barrack = this.getFacebook();
        var transceiver = this.getMessenger();
        var user = !barrack ? null : barrack.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return false
        }
        var me = user.getIdentifier();
        var group = doc.getIdentifier();
        var meta = !barrack ? null : barrack.getMeta(group);
        var content = DocumentCommand.response(group, meta, doc);
        transceiver.sendContent(content, me, Station.ANY, 1);
        var item;
        var bots = delegate.getAssistants(group);
        if (bots && bots.length > 0) {
            for (var i = 0; i < bots.length; ++i) {
                item = bots[i];
                if (item.equals(me)) {
                    Log.error('should not be a bot here', me);
                    continue
                }
                transceiver.sendContent(content, me, item, 1)
            }
            return true
        }
        var members = delegate.getMembers(group);
        if (!members || members.length === 0) {
            Log.error('failed to get group members', group);
            return false
        }
        for (var j = 0; j < members.length; ++j) {
            item = members[j];
            if (item.equals(me)) {
                Log.info('skip cycled message', item, group);
                continue
            }
            transceiver.sendContent(content, me, item, 1)
        }
        return true
    };
    ns.group.AdminManager = AdminManager
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var ResetCommand = ns.protocol.group.ResetCommand;
    var ResignCommand = ns.protocol.group.ResignCommand;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var TripletsHelper = ns.TripletsHelper;
    var GroupCommandHelper = function (delegate) {
        TripletsHelper.call(this, delegate)
    };
    Class(GroupCommandHelper, TripletsHelper, null, null);
    GroupCommandHelper.prototype.saveGroupHistory = function (content, rMsg, group) {
        if (this.isCommandExpired(content)) {
            Log.warning('drop expired command', content.getCmd(), rMsg.getSender(), group);
            return false
        }
        var cmdTime = content.getTime();
        if (!cmdTime) {
            Log.error('group command error: ' + content.toString())
        } else {
            var current = (new Date()).getTime() + 65536;
            if (cmdTime.getTime() > current) {
                Log.error('group command time error', cmdTime, content);
                return false
            }
        }
        var db = this.getDatabase();
        if (Interface.conforms(content, ResetCommand)) {
            Log.warning('cleaning group history for "reset" command', rMsg.getSender(), group);
            return db.clearGroupMemberHistories(group)
        }
        return db.saveGroupHistory(content, rMsg, group)
    };
    GroupCommandHelper.prototype.getGroupHistories = function (group) {
        var db = this.getDatabase();
        return db.getGroupHistories(group)
    };
    GroupCommandHelper.prototype.getResetCommandMessage = function (group) {
        var db = this.getDatabase();
        return db.getResetCommandMessage(group)
    };
    GroupCommandHelper.prototype.clearGroupMemberHistories = function (group) {
        var db = this.getDatabase();
        return db.clearGroupMemberHistories(group)
    };
    GroupCommandHelper.prototype.clearGroupAdminHistories = function (group) {
        var db = this.getDatabase();
        return db.clearGroupAdminHistories(group)
    };
    GroupCommandHelper.prototype.isCommandExpired = function (content) {
        var group = content.getGroup();
        if (!group) {
            Log.error('group content error: ' + content.toString());
            return true
        }
        if (Interface.conforms(content, ResignCommand)) {
            var delegate = this.getDelegate();
            var doc = delegate.getBulletin(group);
            if (!doc) {
                Log.error('group document not exists: ' + group.toString());
                return true
            }
            return DocumentHelper.isBefore(doc.getTime(), content.getTime())
        }
        var pair = this.getResetCommandMessage(group);
        var cmd = pair[0];
        if (!cmd) {
            return false
        }
        return DocumentHelper.isBefore(cmd.getTime(), content.getTime())
    };
    GroupCommandHelper.prototype.getMembersFromCommand = function (content) {
        var members = content.getMembers();
        if (!members) {
            members = [];
            var single = content.getMember();
            if (single) {
                members.push(single)
            }
        }
        return members
    };
    ns.group.GroupCommandHelper = GroupCommandHelper
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var TripletsHelper = ns.TripletsHelper;
    var GroupPacker = function (delegate) {
        TripletsHelper.call(this, delegate)
    };
    Class(GroupPacker, TripletsHelper, null, null);
    GroupPacker.prototype.packMessage = function (content, sender) {
        var envelope = Envelope.create(sender, ID.ANYONE, null);
        var iMsg = InstantMessage.create(envelope, content);
        iMsg.setString('group', content.getGroup());
        return this.encryptAndSignMessage(iMsg)
    };
    GroupPacker.prototype.encryptAndSignMessage = function (iMsg) {
        var transceiver = this.getMessenger();
        var sMsg = !transceiver ? null : transceiver.encryptMessage(iMsg);
        if (!sMsg) {
            Log.error('failed to encrypt message', iMsg.getSender(), iMsg.getReceiver());
            return null
        }
        var rMsg = !transceiver ? null : transceiver.signMessage(sMsg);
        if (!rMsg) {
            Log.error('failed to sign message', iMsg.getSender(), iMsg.getReceiver());
            return null
        }
        return rMsg
    };
    GroupPacker.prototype.splitInstantMessage = function (iMsg, allMembers) {
        var messages = [];
        var sender = iMsg.getSender();
        var info;
        var item;
        var receiver;
        for (var i = 0; i < allMembers.length; ++i) {
            receiver = allMembers[i];
            if (receiver.equals(sender)) {
                continue
            }
            Log.info('split group message for member', receiver);
            info = iMsg.copyMap(false);
            info['receiver'] = receiver.toString();
            item = InstantMessage.parse(info);
            if (!item) {
                Log.error('failed to repack message', receiver);
                continue
            }
            messages.push(item)
        }
        return messages
    };
    GroupPacker.prototype.splitReliableMessage = function (rMsg, allMembers) {
        var messages = [];
        var sender = rMsg.getSender();
        var keys = rMsg.getEncryptedKeys();
        if (!keys) {
            keys = {}
        }
        var keyData;
        var info;
        var item;
        var receiver;
        for (var i = 0; i < allMembers.length; ++i) {
            receiver = allMembers[i];
            if (sender.equals(receiver)) {
                Log.info('skip cycled message', receiver);
                continue
            }
            Log.info('split group message for member', receiver);
            info = rMsg.copyMap(false);
            info['receiver'] = receiver.toString();
            delete info['keys'];
            keyData = keys[receiver.toString()];
            if (keyData) {
                info['key'] = keyData
            }
            item = ReliableMessage.parse(info);
            if (!item) {
                Log.error('failed to repack message', receiver);
                continue
            }
            messages.push(item)
        }
        return messages
    };
    ns.group.GroupPacker = GroupPacker
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var GroupCommand = ns.protocol.GroupCommand;
    var ResetCommand = ns.protocol.group.ResetCommand
    var ResignCommand = ns.protocol.group.ResignCommand
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var TripletsHelper = ns.TripletsHelper;
    var GroupHistoryBuilder = function (delegate) {
        TripletsHelper.call(this, delegate);
        this.__helper = this.createHelper()
    };
    Class(GroupHistoryBuilder, TripletsHelper, null, null);
    GroupHistoryBuilder.prototype.getHelper = function () {
        return this.__helper
    };
    GroupHistoryBuilder.prototype.createHelper = function () {
        var delegate = this.getDelegate();
        return new ns.group.GroupCommandHelper(delegate)
    };
    GroupHistoryBuilder.prototype.buildGroupHistories = function (group) {
        var messages = [];
        var doc;
        var reset;
        var rMsg;
        var docPair = this.buildDocumentCommand(group);
        doc = docPair[0];
        rMsg = docPair[1];
        if (!doc || !rMsg) {
            Log.warning('failed to build "document" command for group', group);
            return messages
        } else {
            messages.push(rMsg)
        }
        var helper = this.getHelper();
        var resPair = helper.getResetCommandMessage(group);
        reset = resPair[0];
        rMsg = resPair[1];
        if (!reset || !rMsg) {
            Log.warning('failed to get "reset" command for group', group);
            return messages
        } else {
            messages.push(rMsg)
        }
        var histories = helper.getGroupHistories(group);
        var hisPair;
        var first;
        var second;
        for (var i = 0; i < histories.length; ++i) {
            hisPair = histories[i];
            first = hisPair[0];
            second = hisPair[1];
            if (Interface.conforms(first, ResetCommand)) {
                Log.info('skip "reset" command for group', group);
                continue
            } else if (Interface.conforms(first, ResignCommand)) {
                if (DocumentHelper.isBefore(doc.getTime(), first.getTime())) {
                    Log.warning('expired command in group', group);
                    continue
                }
            } else {
                if (DocumentHelper.isBefore(reset.getTime(), first.getTime())) {
                    Log.warning('expired command in group', group);
                    continue
                }
            }
            messages.push(second)
        }
        return messages
    };
    GroupHistoryBuilder.prototype.buildDocumentCommand = function (group) {
        var delegate = this.getDelegate();
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        var doc = !delegate ? null : delegate.getBulletin(group);
        if (!user || !doc) {
            Log.error('document not found for group', group);
            return [null, null]
        }
        var me = user.getIdentifier();
        var meta = !delegate ? null : delegate.getMeta(group);
        var command = DocumentCommand.response(group, meta, doc);
        var rMsg = this.packBroadcastMessage(me, command);
        return [doc, rMsg]
    };
    GroupHistoryBuilder.prototype.buildResetCommand = function (group, members) {
        var delegate = this.getDelegate();
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        var owner = !delegate ? null : delegate.getOwner(group);
        if (!user || !owner) {
            Log.error('owner not found for group', group);
            return [null, null]
        }
        var me = user.getIdentifier();
        if (!owner.equals(me)) {
            var admins = delegate.getAdministrators(group);
            if (!admins || admins.indexOf(me) < 0) {
                Log.warning('not permit to build "reset" command for group"', group, me);
                return [null, null]
            }
        }
        if (!members) {
            members = delegate.getMembers(group)
        }
        var command = GroupCommand.reset(group, members);
        var rMsg = this.packBroadcastMessage(me, command);
        return [command, rMsg]
    };
    GroupHistoryBuilder.prototype.packBroadcastMessage = function (sender, content) {
        var messenger = this.getMessenger();
        var envelope = Envelope.create(sender, ID.ANYONE, null);
        var iMsg = InstantMessage.create(envelope, content);
        var sMsg = !messenger ? null : messenger.encryptMessage(iMsg);
        if (!sMsg) {
            Log.error('failed to encrypt message', envelope);
            return null
        }
        var rMsg = !messenger ? null : messenger.signMessage(sMsg);
        if (!rMsg) {
            Log.error('failed to sign message', envelope)
        }
        return rMsg
    };
    ns.group.GroupHistoryBuilder = GroupHistoryBuilder
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var ForwardContent = ns.protocol.ForwardContent;
    var GroupCommand = ns.protocol.GroupCommand;
    var TripletsHelper = ns.TripletsHelper;
    var GroupEmitter = function (delegate) {
        TripletsHelper.call(this, delegate);
        this.__packer = this.createPacker()
    };
    Class(GroupEmitter, TripletsHelper, null, null);
    GroupEmitter.POLYLOGUE_LIMIT = 32;
    GroupEmitter.SECRET_GROUP_LIMIT = 16;
    GroupEmitter.prototype.getPacker = function () {
        return this.__packer
    };
    GroupEmitter.prototype.createPacker = function () {
        var delegate = this.getDelegate();
        return new ns.group.GroupPacker(delegate)
    };
    var attachGroupTimes = function (group, iMsg) {
        if (Interface.conforms(iMsg.getContent(), GroupCommand)) {
            return false
        }
        var facebook = this.getFacebook();
        var doc = !facebook ? null : facebook.getBulletin(group);
        if (!doc) {
            Log.warning('failed to get bulletin document', group);
            return false
        }
        var lastDocumentTime = doc.getTime();
        if (!lastDocumentTime) {
            Log.warning('document error', doc)
        } else {
            iMsg.setDateTime('GDT', lastDocumentTime)
        }
        var archivist = this.getArchivist();
        var lastHistoryTime = archivist.getLastGroupHistoryTime(group);
        if (!lastHistoryTime) {
            Log.warning('failed to get history time', group)
        } else {
            iMsg.setDateTime('GHT', lastHistoryTime)
        }
        return true
    };
    GroupEmitter.prototype.sendInstantMessage = function (iMsg, priority) {
        if (!priority) {
            priority = 0
        }
        var content = iMsg.getContent();
        var group = content.getGroup();
        if (!group) {
            Log.warning('not a group message', iMsg);
            return null
        } else {
            attachGroupTimes.call(this, group, iMsg)
        }
        var delegate = this.getDelegate();
        var prime = delegate.getFastestAssistant(group);
        if (prime != null) {
            return forwardMessage.call(this, iMsg, prime, group, priority)
        }
        var members = delegate.getMembers(group);
        if (!members || members.length === 0) {
            Log.warning('failed to get members', group);
            return null
        }
        if (members.length < GroupEmitter.SECRET_GROUP_LIMIT) {
            var success = splitAndSendMessage.call(this, iMsg, members, group, priority);
            Log.info('split message(s) for group', success, group);
            return null
        } else {
            Log.info('splitting message for members', members.length, group);
            return disperseMessage.call(this, iMsg, members, group, priority)
        }
    };
    var forwardMessage = function (iMsg, bot, group, priority) {
        if (!priority) {
            priority = 0
        }
        var transceiver = this.getMessenger();
        var packer = this.getPacker();
        iMsg.setString('group', group);
        var rMsg = packer.encryptAndSignMessage(iMsg);
        if (rMsg == null) {
            Log.error('failed to encrypt & sign message', iMsg.getSender(), group);
            return null
        }
        var content = ForwardContent.create(rMsg);
        var pair = transceiver.sendContent(content, null, bot, priority);
        if (!pair || !pair[1]) {
            Log.warning('failed to forward message to group bot', group, bot)
        }
        return rMsg
    };
    var disperseMessage = function (iMsg, members, group, priority) {
        if (!priority) {
            priority = 0
        }
        var transceiver = this.getMessenger();
        var packer = this.getPacker();
        iMsg.setString('group', group);
        var sender = iMsg.getSender();
        var rMsg = packer.encryptAndSignMessage(iMsg);
        if (!rMsg) {
            Log.error('failed to encrypt & sign message', sender, group);
            return null
        }
        var messages = packer.splitReliableMessage(rMsg, members);
        var receiver;
        var ok;
        var r_msg;
        for (var i = 0; i < messages.length; ++i) {
            r_msg = messages[i];
            receiver = r_msg.receiver;
            if (sender.equals(receiver)) {
                Log.info('cycled message', sender, receiver, group);
                continue
            }
            ok = transceiver.sendReliableMessage(r_msg, priority);
            if (!ok) {
                Log.error('failed to send message', sender, receiver, group)
            }
        }
        return rMsg
    };
    var splitAndSendMessage = function (iMsg, members, group, priority) {
        if (!priority) {
            priority = 0
        }
        var transceiver = this.getMessenger();
        var packer = this.getPacker();
        var sender = iMsg.getSender();
        var success = 0;
        var messages = packer.splitInstantMessage(iMsg, members);
        var receiver;
        var rMsg;
        var i_msg;
        for (var i = 0; i < messages.length; ++i) {
            i_msg = messages[i];
            receiver = i_msg.receiver;
            if (sender.equals(receiver)) {
                Log.info('cycled message', sender, receiver, group);
                continue
            }
            rMsg = transceiver.sendInstantMessage(i_msg, priority);
            if (rMsg) {
                Log.error('failed to send message', sender, receiver, group);
                continue
            }
            success += 1
        }
        return success
    };
    ns.group.GroupEmitter = GroupEmitter
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Arrays = ns.type.Arrays;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var MetaCommand = ns.protocol.MetaCommand
    var DocumentCommand = ns.protocol.DocumentCommand;
    var ForwardContent = ns.protocol.ForwardContent;
    var GroupCommand = ns.protocol.GroupCommand;
    var Station = ns.mkm.Station;
    var TripletsHelper = ns.TripletsHelper;
    var GroupManager = function (delegate) {
        TripletsHelper.call(this, delegate);
        this.__packer = this.createPacker();
        this.__helper = this.createHelper();
        this.__builder = this.createBuilder()
    };
    Class(GroupManager, TripletsHelper, null, null);
    GroupManager.prototype.getPacker = function () {
        return this.__packer
    };
    GroupManager.prototype.getHelper = function () {
        return this.__helper
    };
    GroupManager.prototype.getBuilder = function () {
        return this.__builder
    };
    GroupManager.prototype.createPacker = function () {
        var delegate = this.getDelegate();
        return new ns.group.GroupPacker(delegate)
    };
    GroupManager.prototype.createHelper = function () {
        var delegate = this.getDelegate();
        return new ns.group.GroupCommandHelper(delegate)
    };
    GroupManager.prototype.createBuilder = function () {
        var delegate = this.getDelegate();
        return new ns.group.GroupHistoryBuilder(delegate)
    };
    GroupManager.prototype.createGroup = function (members) {
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return null
        }
        var founder = user.getIdentifier();
        var pos = members.indexOf(founder);
        if (pos < 0) {
            members.unshift(founder)
        } else if (pos > 0) {
            members.splice(pos, 1);
            members.unshift(founder)
        }
        var delegate = this.getDelegate();
        var database = this.getDatabase();
        var groupName = delegate.buildGroupName(members);
        var register = new ns.Register(database);
        var group = register.createGroup(founder, groupName);
        Log.info('new group with founder', group, founder);
        var meta = delegate.getMeta(group);
        var doc = delegate.getBulletin(group);
        var content;
        if (doc) {
            content = DocumentCommand.response(group, meta, doc)
        } else if (meta) {
            content = MetaCommand.response(group, meta)
        } else {
            Log.error('failed to get group info', groupName);
            return null
        }
        var ok = sendCommand.call(this, content, Station.ANY);
        if (!ok) {
            Log.error('failed to upload meta/document to neighbor station')
        }
        if (this.resetMembers(group, members)) {
            Log.info('created group with members', group, members.length)
        } else {
            Log.error('failed to create group with members', group, members.length)
        }
        return group
    };
    GroupManager.prototype.resetMembers = function (group, newMembers) {
        var delegate = this.getDelegate();
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return false
        }
        var me = user.getIdentifier();
        var first = newMembers[0];
        var ok = delegate.isOwner(first, group);
        if (!ok) {
            Log.error('group owner must be the first member', first, group);
            return false
        }
        var oldMembers = delegate.getMembers(group);
        var expelList = [];
        var item;
        for (var i = 0; i < oldMembers.length; ++i) {
            item = oldMembers[i];
            if (newMembers.indexOf(item) < 0) {
                expelList.push(item)
            }
        }
        var isOwner = me.equals(first);
        var isAdmin = delegate.isAdministrator(me, group);
        var canReset = isOwner || isAdmin;
        if (!canReset) {
            Log.error('cannot reset members', group);
            return false
        }
        var builder = this.getBuilder();
        var pair = builder.buildResetCommand(group, newMembers);
        var reset = pair[0];
        var rMsg = pair[1];
        if (!reset || !rMsg) {
            Log.error('failed to build "reset" command', group);
            return false
        }
        var helper = this.getHelper();
        if (!helper.saveGroupHistory(reset, rMsg, group)) {
            Log.error('failed to save "reset" command', group);
            return false
        } else if (!delegate.saveMembers(newMembers, group)) {
            Log.error('failed to update members', group);
            return false
        } else {
            Log.info('group members updated', group, newMembers.length)
        }
        var messages = builder.buildGroupHistories(group);
        var forward = ForwardContent.create(messages);
        var bots = delegate.getAssistants(group);
        if (bots && bots.length > 0) {
            return sendCommand.call(this, forward, bots)
        } else {
            sendCommand.call(this, forward, newMembers);
            sendCommand.call(this, forward, expelList)
        }
        return true
    };
    GroupManager.prototype.inviteMembers = function (group, newMembers) {
        var facebook = this.getFacebook();
        var delegate = this.getDelegate();
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            return false
        }
        var me = user.getIdentifier();
        var oldMembers = delegate.getMembers(group);
        var isOwner = delegate.isOwner(me, group);
        var isAdmin = delegate.isAdministrator(me, group);
        var isMember = delegate.isMember(me, group);
        var canReset = isOwner || isAdmin;
        if (canReset) {
            var members = oldMembers.slice();
            var item;
            for (var i = 0; i < newMembers.length; ++i) {
                item = newMembers[i];
                if (members.indexOf(item) < 0) {
                    members.push(item)
                }
            }
            return this.resetMembers(group, members)
        } else if (!isMember) {
            Log.error('cannot invite member', group);
            return false
        }
        var packer = this.getPacker();
        var helper = this.getHelper();
        var builder = this.getBuilder();
        var invite = GroupCommand.invite(group, newMembers);
        var rMsg = packer.packMessage(invite, me);
        if (!rMsg) {
            Log.error('failed to build "invite" command', group);
            return false
        } else if (!helper.saveGroupHistory(invite, rMsg, group)) {
            Log.error('failed to save "invite" command', group);
            return false
        }
        var forward = ForwardContent.create(rMsg);
        var bots = delegate.getAssistants(group);
        if (bots && bots.length > 0) {
            return sendCommand.call(this, forward, bots)
        }
        sendCommand.call(this, forward, oldMembers);
        var messages = builder.buildGroupHistories(group);
        forward = ForwardContent.create(messages);
        sendCommand.call(this, forward, newMembers);
        return true
    };
    GroupManager.prototype.quitGroup = function (group) {
        var delegate = this.getDelegate();
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return false
        }
        var me = user.getIdentifier();
        var members = delegate.getMembers(group);
        var isOwner = delegate.isOwner(me, group);
        var isAdmin = delegate.isAdministrator(me, group);
        var isMember = members.indexOf(me) >= 0;
        if (isOwner) {
            Log.error('owner cannot quit from group', group);
            return false
        } else if (isAdmin) {
            Log.error('administrator cannot quit from group', group);
            return false
        }
        if (isMember) {
            Log.warning('quitting group', group);
            members = members.slice();
            Arrays.remove(members, me);
            var ok = delegate.saveMembers(members, group);
            if (!ok) {
                Log.error('failed to save members', group)
            }
        } else {
            Log.warning('member not in group', group)
        }
        var packer = this.getPacker();
        var content = GroupCommand.quit(group);
        var rMsg = packer.packMessage(content, me);
        if (!rMsg) {
            Log.error('failed to pack group message', group);
            return false
        }
        var forward = ForwardContent.create(rMsg);
        var bots = delegate.getAssistants(group);
        if (bots && bots.length > 0) {
            return sendCommand.call(this, forward, bots)
        } else {
            return sendCommand.call(this, forward, members)
        }
    };
    var sendCommand = function (content, receiver) {
        var members;
        if (Interface.conforms(receiver, ID)) {
            members = [receiver]
        } else if (receiver instanceof Array && receiver.length > 0) {
            members = receiver
        } else {
            Log.error('failed to send command', receiver);
            return false
        }
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user');
            return false
        }
        var me = user.getIdentifier();
        var transceiver = this.getMessenger();
        for (var i = 0; i < members.length; ++i) {
            receiver = members[i];
            if (me.equals(receiver)) {
                Log.info('skip cycled message', receiver);
                continue
            }
            transceiver.sendContent(content, me, receiver, 1)
        }
        return true
    };
    ns.group.GroupManager = GroupManager
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Arrays = ns.type.Arrays;
    var ID = ns.protocol.ID;
    var Group = ns.mkm.Group;
    var SharedGroupManager = function () {
        Object.call(this);
        this.__barrack = null;
        this.__transceiver = null;
        this.__delegate = null;
        this.__manager = null;
        this.__admin_man = null;
        this.__emitter = null
    };
    Class(SharedGroupManager, Object, [Group.DataSource], null);
    SharedGroupManager.prototype.getFacebook = function () {
        return this.__barrack
    };
    SharedGroupManager.prototype.getMessenger = function () {
        return this.__transceiver
    };
    SharedGroupManager.prototype.setFacebook = function (facebook) {
        this.__barrack = facebook;
        clearDelegates.call(this)
    };
    SharedGroupManager.prototype.setMessenger = function (messenger) {
        this.__transceiver = messenger;
        clearDelegates.call(this)
    };
    var clearDelegates = function () {
        this.__delegate = null;
        this.__manager = null;
        this.__admin_man = null;
        this.__emitter = null
    };
    SharedGroupManager.prototype.getGroupDelegate = function () {
        var delegate = this.__delegate;
        if (!delegate) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (facebook && messenger) {
                delegate = new ns.group.GroupDelegate(facebook, messenger)
                this.__delegate = delegate
            }
        }
        return delegate
    };
    SharedGroupManager.prototype.getGroupManager = function () {
        var man = this.__manager;
        if (!man) {
            var delegate = this.getGroupDelegate();
            if (delegate) {
                man = new ns.group.GroupManager(delegate);
                this.__manager = man
            }
        }
        return man
    };
    SharedGroupManager.prototype.getAdminManager = function () {
        var man = this.__admin_man;
        if (!man) {
            var delegate = this.getGroupDelegate();
            if (delegate) {
                man = new ns.group.AdminManager(delegate);
                this.__admin_man = man
            }
        }
        return man
    };
    SharedGroupManager.prototype.getGroupEmitter = function () {
        var emitter = this.__emitter;
        if (!emitter) {
            var delegate = this.getGroupDelegate();
            if (delegate) {
                emitter = new ns.group.GroupEmitter(delegate);
                this.__emitter = emitter
            }
        }
        return emitter
    };
    SharedGroupManager.prototype.buildGroupName = function (members) {
        var delegate = this.getGroupDelegate();
        return delegate.buildGroupName(members)
    };
    SharedGroupManager.prototype.getMeta = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getMeta(group)
    };
    SharedGroupManager.prototype.getDocuments = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getDocuments(group)
    };
    SharedGroupManager.prototype.getBulletin = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getBulletin(group)
    };
    SharedGroupManager.prototype.getFounder = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getFounder(group)
    };
    SharedGroupManager.prototype.getOwner = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getOwner(group)
    };
    SharedGroupManager.prototype.getAssistants = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getAssistants(group)
    };
    SharedGroupManager.prototype.getMembers = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getMembers(group)
    };
    SharedGroupManager.prototype.getAdministrators = function (group) {
        var delegate = this.getGroupDelegate();
        return delegate.getAdministrators(group)
    };
    SharedGroupManager.prototype.isOwner = function (user, group) {
        var delegate = this.getGroupDelegate();
        return delegate.isOwner(user, group)
    };
    SharedGroupManager.prototype.broadcastGroupDocument = function (doc) {
        var delegate = this.getGroupDelegate();
        return delegate.broadcastGroupDocument(doc)
    };
    SharedGroupManager.prototype.createGroup = function (members) {
        var delegate = this.getGroupManager();
        return delegate.createGroup(members)
    };
    SharedGroupManager.prototype.updateAdministrators = function (newAdmins, group) {
        var delegate = this.getAdminManager();
        return delegate.updateAdministrators(newAdmins, group)
    };
    SharedGroupManager.prototype.resetGroupMembers = function (newMembers, group) {
        var delegate = this.getGroupManager();
        return delegate.resetMembers(group, newMembers)
    };
    SharedGroupManager.prototype.expelGroupMembers = function (expelMembers, group) {
        var facebook = this.getFacebook();
        var user = !facebook ? null : facebook.getCurrentUser();
        if (!user) {
            return false
        }
        var delegate = this.getGroupDelegate();
        var me = user.getIdentifier();
        var oldMembers = delegate.getMembers(group);
        var isOwner = delegate.isOwner(me, group);
        var isAdmin = delegate.isAdministrator(me, group);
        var canReset = isOwner || isAdmin;
        if (canReset) {
            var members = oldMembers.slice();
            var item;
            for (var i = 0; i < expelMembers.length; ++i) {
                item = expelMembers[i];
                Arrays.remove(members, item)
            }
            return this.resetGroupMembers(members, group)
        }
        throw new Error('Cannot expel members from group: ' + group.toString());
    };
    SharedGroupManager.prototype.inviteGroupMembers = function (newMembers, group) {
        var delegate = this.getGroupManager();
        return delegate.inviteMembers(group, newMembers)
    };
    SharedGroupManager.prototype.quitGroup = function (group) {
        var delegate = this.getGroupManager();
        return delegate.quitGroup(group)
    };
    SharedGroupManager.prototype.sendInstantMessage = function (iMsg, priority) {
        if (!priority) {
            priority = 0
        }
        iMsg.setValue('GF', true);
        var delegate = this.getGroupEmitter();
        return delegate.sendInstantMessage(iMsg, priority)
    };
    ns.group.SharedGroupManager = new SharedGroupManager()
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var AutoMachine = ns.fsm.AutoMachine;
    var PorterStatus = ns.startrek.port.PorterStatus;
    var StateMachine = function (session) {
        AutoMachine.call(this);
        this.__session = session;
        var builder = this.createStateBuilder();
        this.addState(builder.getDefaultState());
        this.addState(builder.getConnectingState());
        this.addState(builder.getConnectedState());
        this.addState(builder.getHandshakingState());
        this.addState(builder.getRunningState());
        this.addState(builder.getErrorState())
    };
    Class(StateMachine, AutoMachine, null, null);
    StateMachine.prototype.createStateBuilder = function () {
        var stb = new ns.network.SessionStateTransitionBuilder();
        return new ns.network.SessionStateBuilder(stb)
    };
    StateMachine.prototype.getContext = function () {
        return this
    };
    StateMachine.prototype.getSession = function () {
        return this.__session
    };
    StateMachine.prototype.getSessionKey = function () {
        var session = this.getSession();
        return session.getSessionKey()
    };
    StateMachine.prototype.getSessionID = function () {
        var session = this.getSession();
        return session.getIdentifier()
    };
    StateMachine.prototype.getStatus = function () {
        var session = this.getSession();
        if (!session) {
            return PorterStatus.ERROR
        }
        var gate = session.getGate();
        var remote = session.getRemoteAddress();
        var docker = gate.getPorter(remote, null);
        if (!docker) {
            return PorterStatus.ERROR
        }
        return docker.getStatus()
    };
    ns.network.SessionStateMachine = StateMachine
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
    var BaseState = ns.fsm.BaseState;
    var StateOrder = Enum('SessionStateOrder', {
        DEFAULT: 0,
        CONNECTING: 1,
        CONNECTED: 2,
        HANDSHAKING: 3,
        RUNNING: 4,
        ERROR: 5
    });
    var SessionState = function (order) {
        BaseState.call(this, Enum.getInt(order));
        this.__name = order.getName();
        this.__enterTime = null
    };
    Class(SessionState, BaseState, null, {
        getName: function () {
            return this.__name
        }, getEnterTime: function () {
            return this.__enterTime
        }, toString: function () {
            return this.__name
        }, valueOf: function () {
            return this.__name
        }, equals: function (other) {
            if (other instanceof SessionState) {
                if (other === this) {
                    return true
                }
                other = other.getIndex()
            } else if (other instanceof StateOrder) {
                other = other.getValue()
            }
            return this.getIndex() === other
        }
    });
    SessionState.prototype.onEnter = function (previous, ctx, now) {
        this.__enterTime = now
    };
    SessionState.prototype.onExit = function (next, ctx, now) {
        this.__enterTime = null
    };
    SessionState.prototype.onPause = function (ctx, now) {
    };
    SessionState.prototype.onResume = function (ctx, now) {
    };
    SessionState.Delegate = ns.fsm.Delegate;
    var StateBuilder = function (transitionBuilder) {
        Object.call(this);
        this.builder = transitionBuilder
    };
    Class(StateBuilder, Object, null, {
        getDefaultState: function () {
            var state = new SessionState(StateOrder.DEFAULT);
            state.addTransition(this.builder.getDefaultConnectingTransition());
            return state
        }, getConnectingState: function () {
            var state = new SessionState(StateOrder.CONNECTING);
            state.addTransition(this.builder.getConnectingConnectedTransition());
            state.addTransition(this.builder.getConnectingErrorTransition());
            return state
        }, getConnectedState: function () {
            var state = new SessionState(StateOrder.CONNECTED);
            state.addTransition(this.builder.getConnectedHandshakingTransition());
            state.addTransition(this.builder.getConnectedErrorTransition());
            return state
        }, getHandshakingState: function () {
            var state = new SessionState(StateOrder.HANDSHAKING);
            state.addTransition(this.builder.getHandshakingRunningTransition());
            state.addTransition(this.builder.getHandshakingConnectedTransition());
            state.addTransition(this.builder.getHandshakingErrorTransition());
            return state
        }, getRunningState: function () {
            var state = new SessionState(StateOrder.RUNNING);
            state.addTransition(this.builder.getRunningDefaultTransition());
            state.addTransition(this.builder.getRunningErrorTransition());
            return state
        }, getErrorState: function () {
            var state = new SessionState(StateOrder.ERROR);
            state.addTransition(this.builder.getErrorDefaultTransition());
            return state
        }
    });
    ns.network.SessionState = SessionState;
    ns.network.SessionStateBuilder = StateBuilder;
    ns.network.SessionStateOrder = StateOrder
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
    var BaseTransition = ns.fsm.BaseTransition;
    var PorterStatus = ns.startrek.port.PorterStatus;
    var StateOrder = ns.network.SessionStateOrder;
    var StateTransition = function (order, evaluate) {
        BaseTransition.call(this, Enum.getInt(order));
        this.__evaluate = evaluate
    };
    Class(StateTransition, BaseTransition, null, null);
    StateTransition.prototype.evaluate = function (ctx, now) {
        return this.__evaluate.call(this, ctx, now)
    };
    var is_state_expired = function (state, now) {
        var enterTime = state.getEnterTime();
        if (!enterTime) {
            return false
        }
        var recent = now.getTime() - 30 * 1000;
        return enterTime.getTime() < recent
    };
    var TransitionBuilder = function () {
        Object.call(this)
    };
    Class(TransitionBuilder, Object, null, {
        getDefaultConnectingTransition: function () {
            return new StateTransition(StateOrder.CONNECTING, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    return false
                }
                var status = ctx.getStatus();
                return PorterStatus.PREPARING.equals(status) || PorterStatus.READY.equals(status)
            })
        }, getConnectingConnectedTransition: function () {
            return new StateTransition(StateOrder.CONNECTED, function (ctx, now) {
                var status = ctx.getStatus();
                return PorterStatus.READY.equals(status)
            })
        }, getConnectingErrorTransition: function () {
            return new StateTransition(StateOrder.ERROR, function (ctx, now) {
                if (is_state_expired(ctx.getCurrentState(), now)) {
                    return true
                }
                var status = ctx.getStatus();
                return !(PorterStatus.PREPARING.equals(status) || PorterStatus.READY.equals(status))
            })
        }, getConnectedHandshakingTransition: function () {
            return new StateTransition(StateOrder.HANDSHAKING, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    return false
                }
                var status = ctx.getStatus();
                return PorterStatus.READY.equals(status)
            })
        }, getConnectedErrorTransition: function () {
            return new StateTransition(StateOrder.ERROR, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    return true
                }
                var status = ctx.getStatus();
                return !PorterStatus.READY.equals(status)
            })
        }, getHandshakingRunningTransition: function () {
            return new StateTransition(StateOrder.RUNNING, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    return false
                }
                var status = ctx.getStatus();
                if (!PorterStatus.READY.equals(status)) {
                    return false
                }
                return !!ctx.getSessionKey()
            })
        }, getHandshakingConnectedTransition: function () {
            return new StateTransition(StateOrder.CONNECTED, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    return false
                }
                var status = ctx.getStatus();
                if (!PorterStatus.READY.equals(status)) {
                    return false
                }
                if (!!ctx.getSessionKey()) {
                    return false
                }
                return is_state_expired(ctx.getCurrentState(), now)
            })
        }, getHandshakingErrorTransition: function () {
            return new StateTransition(StateOrder.ERROR, function (ctx, now) {
                if (!ctx.getSessionID()) {
                    return true
                }
                var status = ctx.getStatus();
                return !PorterStatus.READY.equals(status)
            })
        }, getRunningDefaultTransition: function () {
            return new StateTransition(StateOrder.DEFAULT, function (ctx, now) {
                var status = ctx.getStatus();
                if (!PorterStatus.READY.equals(status)) {
                    return false
                }
                var session = ctx.getSession();
                return !(session && session.isReady())
            })
        }, getRunningErrorTransition: function () {
            return new StateTransition(StateOrder.ERROR, function (ctx, now) {
                var status = ctx.getStatus();
                return !PorterStatus.READY.equals(status)
            })
        }, getErrorDefaultTransition: function () {
            return new StateTransition(StateOrder.DEFAULT, function (ctx, now) {
                var status = ctx.getStatus();
                return !PorterStatus.ERROR.equals(status)
            })
        }
    });
    ns.network.SessionStateTransition = StateTransition;
    ns.network.SessionStateTransitionBuilder = TransitionBuilder
})(DIMP);
(function (ns) {
    'use strict';
    var HTTP = {
        get: function (url, callback) {
            var xhr = create();
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function (ev) {
                callback(ev.target, url)
            };
            xhr.send()
        }, post: function (url, headers, body, callback) {
            var xhr = create();
            xhr.open('POST', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function (ev) {
                if (callback) {
                    callback(ev.target, url)
                }
            };
            if (headers) {
                set_headers(xhr, headers)
            }
            xhr.send(body)
        }
    };
    var create = function () {
        try {
            return new XMLHttpRequest()
        } catch (e) {
            try {
                return new ActiveXObject('Msxml2.XMLHTTP')
            } catch (e) {
                try {
                    return new ActiveXObject('Microsoft.XMLHTTP')
                } catch (e) {
                    throw e;
                }
            }
        }
    };
    var set_headers = function (xhr, headers) {
        var keys = Object.keys(headers);
        var name;
        for (var i = 0; i < keys.length; ++i) {
            name = keys[i]
            xhr.setRequestHeader(name, headers[name])
        }
    };
    ns.network.HTTP = HTTP
})(DIMP);
(function (ns) {
    'use strict';
    var UTF8 = ns.format.UTF8;
    var HTTP = ns.network.HTTP;
    HTTP.upload = function (url, data, filename, name, callback) {
        var body = http_body(data, filename, name);
        this.post(url, {'Content-Type': CONTENT_TYPE, 'Content-Length': '' + body.length}, body, callback)
    };
    HTTP.download = function (url, callback) {
        if (s_downloading.indexOf(url) < 0) {
            s_downloading.push(url);
            this.get(url, callback)
        }
    };
    var s_downloading = [];
    var BOUNDARY = 'BU1kUJ19yLYPqv5xoT3sbKYbHwjUu1JU7roix';
    var CONTENT_TYPE = 'multipart/form-data; boundary=' + BOUNDARY;
    var BOUNDARY_BEGIN = '--' + BOUNDARY + '\r\n' + 'Content-Disposition: form-data; name={name}; filename={filename}\r\n' + 'Content-Type: application/octet-stream\r\n\r\n';
    var BOUNDARY_END = '\r\n--' + BOUNDARY + '--';
    var http_body = function (data, filename, name) {
        var begin = BOUNDARY_BEGIN;
        begin = begin.replace('{filename}', filename);
        begin = begin.replace('{name}', name);
        begin = UTF8.encode(begin);
        var end = UTF8.encode(BOUNDARY_END);
        var size = begin.length + data.length + end.length;
        var body = new Uint8Array(size);
        body.set(begin, 0);
        body.set(data, begin.length);
        body.set(end, begin.length + data.length);
        return body
    }
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var Thread = ns.fsm.threading.Thread;
    var PorterStatus = ns.startrek.port.PorterStatus;
    var BaseConnection = ns.startrek.socket.BaseConnection;
    var StarPorter = ns.startrek.StarPorter;
    var BaseSession = ns.network.BaseSession;
    var SessionStateMachine = ns.network.SessionStateMachine;
    var ClientSession = function (db, server) {
        BaseSession.call(this, db, server.getHost(), server.getPort());
        this.__station = server;
        this.__fsm = new SessionStateMachine(this);
        this.__key = null;
        this.__accepted = false;
        this.__thread = null
    };
    Class(ClientSession, BaseSession, null, {
        getStation: function () {
            return this.__station
        }, getState: function () {
            var fsm = this.__fsm;
            var state = fsm.getCurrentState();
            if (state) {
                return state
            }
            return fsm.getDefaultState()
        }, setActive: function (flag, when) {
            if (!flag) {
                this.__accepted = false
            }
            return BaseSession.prototype.setActive.call(this, flag, when)
        }, isAccepted: function () {
            return this.__accepted
        }, setAccepted: function (flag) {
            this.__accepted = flag
        }, getSessionKey: function () {
            return this.__key
        }, setSessionKey: function (sessionKey) {
            this.__key = sessionKey
        }, isReady: function () {
            return this.isActive() && this.isAccepted() && this.getIdentifier() && this.getSessionKey()
        }, getConnection: function () {
            var gate = this.getGate();
            var remote = this.getRemoteAddress();
            var docker = gate.getPorter(remote, null);
            if (docker instanceof StarPorter) {
                return docker.getConnection()
            }
            return null
        }, getConnectionStateMachine: function () {
            var conn = this.getConnection();
            if (conn instanceof BaseConnection) {
                return conn.getStateMachine()
            }
            return null
        }, pause: function () {
            var sess_machine = this.__fsm;
            var conn_machine = this.getConnectionStateMachine();
            sess_machine.pause();
            conn_machine.pause()
        }, resume: function () {
            var sess_machine = this.__fsm;
            var conn_machine = this.getConnectionStateMachine();
            conn_machine.resume();
            sess_machine.resume()
        }, setup: function () {
            this.setActive(true, 0);
            return BaseSession.prototype.setup.call(this)
        }, finish: function () {
            this.setActive(false, 0);
            return BaseSession.prototype.finish.call(this)
        }, onPorterStatusChanged: function (previous, current, docker) {
            if (!current || PorterStatus.ERROR.equals(current)) {
                this.setActive(false, 0)
            } else if (PorterStatus.READY.equals(current)) {
                this.setActive(true, 0)
            }
        }, onPorterReceived: function (arrival, docker) {
            var all_responses = [];
            var messenger = this.getMessenger();
            var packages = get_data_packages(arrival);
            var pack;
            var responses;
            var res;
            for (var i = 0; i < packages.length; ++i) {
                pack = packages[i];
                try {
                    responses = messenger.processPackage(pack);
                    if (!responses || responses.length === 0) {
                        continue
                    }
                    for (var j = 0; j < responses.length; ++j) {
                        res = responses[j];
                        if (!res || res.length === 0) {
                            continue
                        }
                        all_responses.push(res)
                    }
                } catch (e) {
                    Log.error('ClientSession::onPorterReceived()', e, pack)
                }
            }
            var gate = this.getGate();
            var source = docker.getRemoteAddress();
            var destination = docker.getLocalAddress();
            for (var k = 0; i < all_responses.length; ++k) {
                gate.sendResponse(all_responses[k], arrival, source, destination)
            }
        }
    });
    var force_stop = function () {
        var thread = this.__thread;
        if (thread) {
            this.__thread = null;
            thread.stop()
        }
    };
    ClientSession.prototype.start = function (delegate) {
        force_stop.call(this);
        var thread = new Thread(this);
        thread.start();
        this.__thread = thread;
        var fsm = this.__fsm;
        fsm.setDelegate(delegate);
        fsm.start()
    };
    ClientSession.prototype.stop = function () {
        BaseSession.prototype.stop.call(this);
        force_stop.call(this);
        var fsm = this.__fsm;
        fsm.stop()
    };
    var get_data_packages = function (arrival) {
        var payload = arrival.getPayload();
        if (!payload || payload.length === 0) {
            return []
        } else if (payload[0] === jsonStart) {
            return split_packages(payload)
        } else {
            return [payload]
        }
    };
    var jsonStart = '{'.charCodeAt(0);
    var split_packages = function (payload) {
        var array = [];
        var i, j = 0;
        for (i = 1; i < payload.length; ++i) {
            if (payload[i] !== NEW_LINE) {
                continue
            }
            if (i > j) {
                array.push(payload.slice(j, i))
            }
            j = i + 1
        }
        if (i > j) {
            array.push(payload.slice(j, i))
        }
        return array
    };
    var NEW_LINE = '\n'.charCodeAt(0);
    ns.network.ClientSession = ClientSession
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var LoginCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger)
    };
    Class(LoginCommandProcessor, BaseCommandProcessor, null, {
        getDatabase: function () {
            var manager = this.getMessenger();
            var session = manager.getSession();
            return session.getDatabase()
        }, process: function (content, rMsg) {
            var sender = content.getIdentifier();
            var db = this.getDatabase();
            if (db.saveLoginCommandMessage(sender, content, rMsg)) {
                Log.info('save login command for user', sender)
            } else {
                Log.error('failed to save login command', sender, content)
            }
            return []
        }
    });
    ns.cpu.LoginCommandProcessor = LoginCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var ReceiptCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger)
    };
    Class(ReceiptCommandProcessor, BaseCommandProcessor, null, null);
    ReceiptCommandProcessor.prototype.process = function (content, rMsg) {
        if (Interface.conforms(content, ReceiptCommand)) {
            var envelope = rMsg.getEnvelope();
            var groupManager = ns.group.SharedGroupManager;
            var delegate = groupManager.getGroupDelegate();
            delegate.updateRespondTime(content, envelope)
        }
        return []
    };
    ns.cpu.ReceiptCommandProcessor = ReceiptCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var HandshakeCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger)
    };
    Class(HandshakeCommandProcessor, BaseCommandProcessor, null, {
        process: function (content, rMsg) {
            var messenger = this.getMessenger();
            var session = messenger.getSession();
            var station = session.getStation();
            var oid = station.getIdentifier();
            var sender = rMsg.getSender();
            if (!oid || oid.isBroadcast()) {
                station.setIdentifier(sender);
                Log.info('update station ID', oid, sender)
            }
            var title = content.getTitle();
            var newKey = content.getSessionKey();
            var oldKey = session.getSessionKey();
            if (title === 'DIM?') {
                if (!oldKey) {
                    Log.info('[DIM] handshake with session key', newKey);
                    messenger.handshake(newKey)
                } else if (oldKey === newKey) {
                    Log.warning('[DIM] handshake response duplicated', newKey);
                    messenger.handshake(newKey)
                } else {
                    Log.warning('[DIM] handshake again', oldKey, newKey);
                    session.setSessionKey(null)
                }
            } else if (title === 'DIM!') {
                if (!oldKey) {
                    Log.info('[DIM] handshake success with session key', newKey);
                    session.setSessionKey(newKey)
                } else if (oldKey === newKey) {
                    Log.warning('[DIM] handshake success duplicated', newKey)
                } else {
                    Log.error('[DIM] handshake again', oldKey, newKey);
                    session.setSessionKey(null)
                }
            } else {
                Log.error('Handshake from other user?', sender, content)
            }
            return []
        }
    });
    ns.cpu.HandshakeCommandProcessor = HandshakeCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var HistoryCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
        this.__delegate = this.createGroupDelegate();
        this.__helper = this.createGroupHelper();
        this.__builder = this.createGroupBuilder()
    };
    Class(HistoryCommandProcessor, BaseCommandProcessor, null, {
        createGroupDelegate: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.group.GroupDelegate(facebook, messenger)
        }, createGroupHelper: function () {
            var delegate = this.getGroupDelegate();
            return new ns.group.GroupCommandHelper(delegate)
        }, createGroupBuilder: function () {
            var delegate = this.getGroupDelegate();
            return new ns.group.GroupHistoryBuilder(delegate)
        }, process: function (content, rMsg) {
            var text = 'Command not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'History command (name: ${command}) not support yet!',
                'replacements': {'command': content.getCmd()}
            })
        }
    });
    HistoryCommandProcessor.prototype.getGroupDelegate = function () {
        return this.__delegate
    };
    HistoryCommandProcessor.prototype.getGroupHelper = function () {
        return this.__helper
    };
    HistoryCommandProcessor.prototype.getGroupBuilder = function () {
        return this.__builder
    };
    ns.cpu.HistoryCommandProcessor = HistoryCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ForwardContent = ns.protocol.ForwardContent;
    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor;
    var GroupCommandProcessor = function (facebook, messenger) {
        HistoryCommandProcessor.call(this, facebook, messenger)
    };
    Class(GroupCommandProcessor, HistoryCommandProcessor, null, {
        getOwner: function (group) {
            var delegate = this.getGroupDelegate();
            return delegate.getOwner(group)
        }, getAssistants: function (group) {
            var delegate = this.getGroupDelegate();
            return delegate.getAssistants(group)
        }, getAdministrators: function (group) {
            var delegate = this.getGroupDelegate();
            return delegate.getAdministrators(group)
        }, saveAdministrators: function (admins, group) {
            var delegate = this.getGroupDelegate();
            return delegate.saveAdministrators(admins, group)
        }, getMembers: function (group) {
            var delegate = this.getGroupDelegate();
            return delegate.getMembers(group)
        }, saveMembers: function (members, group) {
            var delegate = this.getGroupDelegate();
            return delegate.saveMembers(members, group)
        }, saveGroupHistory: function (content, rMsg, group) {
            var delegate = this.getGroupHelper();
            return delegate.saveGroupHistory(content, rMsg, group)
        }, process: function (content, rMsg) {
            var text = 'Command not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Group command (name: ${command}) not support yet!',
                'replacements': {'command': content.getCmd()}
            })
        }, checkCommandExpired: function (content, rMsg) {
            var group = content.getGroup();
            if (!group) {
                Log.error('group command error', content);
                return [null, null]
            }
            var errors;
            var expired = this.getGroupHelper().isCommandExpired(content);
            if (expired) {
                var text = 'Command expired.';
                errors = this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Group command expired: ${cmd}, group: ${ID}',
                    'replacements': {'cmd': content.getCmd(), 'ID': group.toString()}
                });
                group = null
            } else {
                errors = null
            }
            return [group, errors]
        }, checkCommandMembers: function (content, rMsg) {
            var group = content.getGroup();
            if (!group) {
                Log.error('group command error', content);
                return [[], null]
            }
            var errors;
            var members = this.getGroupHelper().getMembersFromCommand(content);
            if (members.length === 0) {
                var text = 'Command error.';
                errors = this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Group members empty: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            } else {
                errors = null
            }
            return [members, errors]
        }, checkGroupMembers: function (content, rMsg) {
            var group = content.getGroup();
            if (!group) {
                Log.error('group command error', content);
                return [null, [], null]
            }
            var errors;
            var owner = this.getOwner(group);
            var members = this.getMembers(group);
            if (!owner || members.length === 0) {
                var text = 'Group empty.';
                errors = this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Group empty: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            } else {
                errors = null
            }
            return [owner, members, errors]
        }, sendGroupHistories: function (group, receiver) {
            var messages = this.getGroupBuilder().buildGroupHistories(group);
            if (messages.length === 0) {
                Log.warning('failed to build history for group', group);
                return false
            }
            var transceiver = this.getMessenger();
            var content = ForwardContent.create(messages);
            var pair = transceiver.sendContent(content, null, receiver, 1);
            return pair && pair[1]
        }
    });
    ns.cpu.GroupCommandProcessor = GroupCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var InviteCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger)
    };
    Class(InviteCommandProcessor, GroupCommandProcessor, null, {
        process: function (content, rMsg) {
            var errors;
            var pair = this.checkCommandExpired(content, rMsg);
            var group = pair[0];
            if (!group) {
                errors = pair[1];
                return !errors ? [] : errors
            }
            var pair1 = this.checkCommandMembers(content, rMsg);
            var inviteList = pair1[0];
            if (!inviteList || inviteList.length === 0) {
                errors = pair[1];
                return !errors ? [] : errors
            }
            var trip = this.checkGroupMembers(content, rMsg);
            var owner = trip[0];
            var members = trip[1];
            if (!owner || !members || members.length === 0) {
                errors = pair[2];
                return !errors ? [] : errors
            }
            var text;
            var sender = rMsg.getSender();
            var admins = this.getAdministrators(group);
            var isOwner = owner.equals(sender);
            var isAdmin = admins.indexOf(sender) >= 0;
            var isMember = members.indexOf(sender) >= 0;
            if (!isMember) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Not allowed to invite member into group: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            }
            var canReset = isOwner || isAdmin;
            var memPair = InviteCommandProcessor.calculateInvited(members, inviteList);
            var newMembers = memPair[0];
            var addedList = memPair[1];
            if (!addedList || addedList.length === 0) {
                var facebook = this.getFacebook();
                var user = facebook.getCurrentUser();
                if (!canReset && user.getIdentifier().equals(owner)) {
                    var ok = this.sendGroupHistories(group, sender);
                    if (!ok) {
                        Log.error('failed to send history for group', group, sender)
                    }
                }
            } else if (!this.saveGroupHistory(content, rMsg, group)) {
                Log.error('failed to save "invite" command', group)
            } else if (!canReset) {
            } else if (this.saveMembers(newMembers, group)) {
                Log.warning('invited by administrator', sender, group);
                content.setValue('added', ID.revert(addedList))
            } else {
                Log.error('failed to save members for group', group)
            }
            return []
        }
    });
    InviteCommandProcessor.calculateInvited = function (members, inviteList) {
        var newMembers = members.slice();
        var addedList = [];
        var item;
        for (var i = 0; i < inviteList.length; ++i) {
            item = inviteList[i];
            if (newMembers.indexOf(item) >= 0) {
                continue
            }
            newMembers.push(item);
            addedList.push(item)
        }
        return [newMembers, addedList]
    };
    ns.cpu.InviteCommandProcessor = InviteCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var ExpelCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger)
    };
    Class(ExpelCommandProcessor, GroupCommandProcessor, null, {
        process: function (content, rMsg) {
            return []
        }
    });
    ns.cpu.ExpelCommandProcessor = ExpelCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Arrays = ns.type.Arrays;
    var Log = ns.lnc.Log;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var QuitCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger)
    };
    Class(QuitCommandProcessor, GroupCommandProcessor, null, {
        process: function (content, rMsg) {
            var errors;
            var pair = this.checkCommandExpired(content, rMsg);
            var group = pair[0];
            if (!group) {
                errors = pair[1];
                return errors ? errors : []
            }
            var trip = this.checkGroupMembers(content, rMsg);
            var owner = trip[0];
            var members = trip[1];
            if (!owner || !members || members.length === 0) {
                errors = pair[2];
                return errors ? errors : []
            }
            var text;
            var sender = rMsg.getSender();
            var admins = this.getAdministrators(group);
            var isOwner = owner.equals(sender);
            var isAdmin = admins.indexOf(sender) >= 0;
            var isMember = members.indexOf(sender) >= 0;
            if (isOwner) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Owner cannot quit from group: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            }
            if (isAdmin) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Administrator cannot quit from group: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            }
            if (!isMember) {
            } else if (!this.saveGroupHistory(content, rMsg, group)) {
                Log.error('failed to save "quit" command for group', group)
            } else {
                var newMembers = members.slice();
                Arrays.remove(newMembers, sender);
                if (this.saveMembers(newMembers, group)) {
                    content.setValue('removed', [sender.toString()])
                } else {
                    Log.error('failed to save members for group', group)
                }
            }
            return []
        }
    });
    ns.cpu.QuitCommandProcessor = QuitCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var QueryCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger)
    };
    Class(QueryCommandProcessor, GroupCommandProcessor, null, {
        process: function (content, rMsg) {
            var errors;
            var pair = this.checkCommandExpired(content, rMsg);
            var group = pair[0];
            if (!group) {
                errors = pair[1];
                return !errors ? [] : errors
            }
            var trip = this.checkGroupMembers(content, rMsg);
            var owner = trip[0];
            var members = trip[1];
            if (!(owner && members && members.length > 0)) {
                errors = pair[2];
                return !errors ? [] : errors
            }
            var text;
            var sender = rMsg.getSender();
            var bots = this.getAssistants(group);
            var isMember = members.indexOf(sender) >= 0;
            var isBot = bots.indexOf(sender) >= 0;
            var canQuery = isMember || isBot;
            if (!canQuery) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Not allowed to query members of group: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            }
            var facebook = this.getFacebook();
            var archivist = facebook.getArchivist();
            var queryTime = content.getDateTime('last_time', null);
            if (queryTime) {
                var lastTime = archivist.getLastGroupHistoryTime(group);
                if (!lastTime) {
                    Log.error('group history error', group)
                } else if (lastTime.getTime() <= queryTime.getTime()) {
                    text = 'Group history not updated.';
                    return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                        'template': 'Group history not updated: ${ID}, last time: ${time}',
                        'replacements': {'ID': group.toString(), 'time': lastTime.getTime() / 1000.0}
                    })
                }
            }
            var ok = this.sendGroupHistories(group, sender);
            if (!ok) {
                Log.error('failed to send history for group', group, sender)
            }
            return []
        }
    });
    ns.cpu.QueryCommandProcessor = QueryCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var ResetCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger)
    };
    Class(ResetCommandProcessor, GroupCommandProcessor, null, {
        process: function (content, rMsg) {
            var errors;
            var pair = this.checkCommandExpired(content, rMsg);
            var group = pair[0];
            if (!group) {
                errors = pair[1];
                return errors ? errors : []
            }
            var pair1 = this.checkCommandMembers(content, rMsg);
            var newMembers = pair1[0];
            if (!newMembers || newMembers.length === 0) {
                errors = pair[1];
                return errors ? errors : []
            }
            var trip = this.checkGroupMembers(content, rMsg);
            var owner = trip[0];
            var members = trip[1];
            if (!(owner && members && members.length > 0)) {
                errors = pair[2];
                return errors ? errors : []
            }
            var text;
            var sender = rMsg.getSender();
            var admins = this.getAdministrators(group);
            var isOwner = owner.equals(sender);
            var isAdmin = admins.indexOf(sender) >= 0;
            var canReset = isOwner || isAdmin;
            if (!canReset) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Not allowed to reset members of group: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            }
            if (!newMembers[0].equals(owner)) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Owner must be the first member of group: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            }
            var expelAdmin = false;
            for (var i = 0; i < admins.length; ++i) {
                if (newMembers.indexOf(admins[i]) < 0) {
                    expelAdmin = true;
                    break
                }
            }
            if (expelAdmin) {
                text = 'Permission denied.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                    'template': 'Not allowed to expel administrator of group: ${ID}',
                    'replacements': {'ID': group.toString()}
                })
            }
            var memPair = ResetCommandProcessor.calculateReset(members, newMembers);
            var addList = memPair[0];
            var removeList = memPair[1];
            if (!this.saveGroupHistory(content, rMsg, group)) {
                Log.error('failed to save "reset" command for group', group)
            } else if (addList.length === 0 && removeList.length === 0) {
            } else if (this.saveMembers(newMembers, group)) {
                Log.info('new members saved in group', group);
                if (addList.length > 0) {
                    content.setValue('added', ID.revert(addList))
                }
                if (removeList.length > 0) {
                    content.setValue('removed', ID.revert(removeList))
                }
            } else {
                Log.error('failed to save members in group', group)
            }
            return []
        }
    });
    ResetCommandProcessor.calculateReset = function (oldMembers, newMembers) {
        var addList = [];
        var removeList = [];
        var item;
        for (var i = 0; i < newMembers.length; ++i) {
            item = newMembers[i];
            if (oldMembers.indexOf(item) < 0) {
                addList.push(item)
            }
        }
        for (var j = 0; j < oldMembers.length; ++j) {
            item = oldMembers[j];
            if (newMembers.indexOf(item) < 0) {
                removeList.push(item)
            }
        }
        return [addList, removeList]
    };
    ns.cpu.ResetCommandProcessor = ResetCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var ContentProcessorCreator = ns.cpu.ContentProcessorCreator;
    var ReceiptCommandProcessor = ns.cpu.ReceiptCommandProcessor;
    var HandshakeCommandProcessor = ns.cpu.HandshakeCommandProcessor;
    var LoginCommandProcessor = ns.cpu.LoginCommandProcessor;
    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor
    var ClientContentProcessorCreator = function (facebook, messenger) {
        ContentProcessorCreator.call(this, facebook, messenger)
    };
    Class(ClientContentProcessorCreator, ContentProcessorCreator, null, {
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (ContentType.HISTORY.equals(type)) {
                return new HistoryCommandProcessor(facebook, messenger)
            }
            if (type === 0) {
                return new BaseContentProcessor(facebook, messenger)
            }
            return ContentProcessorCreator.prototype.createContentProcessor.call(this, type)
        }, createCommandProcessor: function (type, cmd) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            switch (cmd) {
                case Command.HANDSHAKE:
                    return new HandshakeCommandProcessor(facebook, messenger);
                case Command.LOGIN:
                    return new LoginCommandProcessor(facebook, messenger);
                case Command.RECEIPT:
                    return new ReceiptCommandProcessor(facebook, messenger);
                case'group':
                    return new ns.cpu.GroupCommandProcessor(facebook, messenger);
                case GroupCommand.INVITE:
                    return new ns.cpu.InviteCommandProcessor(facebook, messenger);
                case GroupCommand.EXPEL:
                    return new ns.cpu.ExpelCommandProcessor(facebook, messenger);
                case GroupCommand.QUIT:
                    return new ns.cpu.QuitCommandProcessor(facebook, messenger);
                case GroupCommand.QUERY:
                    return new ns.cpu.QueryCommandProcessor(facebook, messenger);
                case GroupCommand.RESET:
                    return new ns.cpu.ResetCommandProcessor(facebook, messenger)
            }
            return ContentProcessorCreator.prototype.createCommandProcessor.call(this, type, cmd)
        }
    });
    ns.cpu.ClientContentProcessorCreator = ClientContentProcessorCreator
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var MetaCommand = ns.protocol.MetaCommand;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var GroupCommand = ns.protocol.GroupCommand;
    var Station = ns.mkm.Station;
    var FrequencyChecker = ns.utils.FrequencyChecker;
    var CommonArchivist = ns.CommonArchivist;
    var ClientArchivist = function (db) {
        CommonArchivist.call(this, db);
        this.__documentResponses = new FrequencyChecker(ClientArchivist.RESPOND_EXPIRES);
        this.__lastActiveMembers = {}
    };
    Class(ClientArchivist, CommonArchivist, null, {
        queryMeta: function (identifier) {
            if (!this.isMetaQueryExpired(identifier)) {
                return false
            }
            var messenger = this.getMessenger();
            Log.info('querying meta', identifier);
            var content = MetaCommand.query(identifier);
            var pair = messenger.sendContent(content, null, Station.ANY, 1);
            return pair && pair[1]
        }, queryDocuments: function (identifier, docs) {
            if (!this.isDocumentQueryExpired(identifier)) {
                return false
            }
            var messenger = this.getMessenger();
            var lastTime = this.getLastDocumentTime(identifier, docs);
            Log.info('querying documents', identifier, lastTime);
            var content = DocumentCommand.query(identifier, lastTime);
            var pair = messenger.sendContent(content, null, Station.ANY, 1);
            return pair && pair[1]
        }, queryMembers: function (group, members) {
            if (!this.isMembersQueryExpired(group)) {
                return false
            }
            var facebook = this.getFacebook();
            var user = facebook.getCurrentUser();
            if (!user) {
                Log.error('failed to get current user');
                return false
            }
            var me = user.getIdentifier();
            var lastTime = this.getLastGroupHistoryTime(group);
            Log.info('querying members for group', group, lastTime);
            var content = GroupCommand.query(group);
            content.setDateTime('last_time', lastTime);
            var ok;
            ok = this.queryMembersFromAssistants(content, me, group);
            if (ok) {
                return true
            }
            ok = this.queryMembersFromAdministrators(content, me, group);
            if (ok) {
                return true
            }
            ok = this.queryMembersFromOwner(content, me, group);
            if (ok) {
                return true
            }
            var pair = null;
            var lastMember = this.__lastActiveMembers[group];
            if (lastMember) {
                Log.info('querying members from last member', lastMember, group);
                var messenger = this.getMessenger();
                pair = messenger.sendContent(content, me, lastMember, 1)
            }
            return pair && pair[1]
        }
    });
    ClientArchivist.RESPOND_EXPIRES = 600 * 1000;
    ClientArchivist.prototype.isDocumentResponseExpired = function (identifier, force) {
        return this.__documentResponses.isExpired(identifier, null, force)
    };
    ClientArchivist.prototype.setLastActiveMember = function (group, member) {
        this.__lastActiveMembers[group] = member
    };
    ClientArchivist.prototype.getFacebook = function () {
    };
    ClientArchivist.prototype.getMessenger = function () {
    };
    ClientArchivist.prototype.queryMembersFromAssistants = function (content, sender, group) {
        var facebook = this.getFacebook();
        var bots = facebook.getAssistants(group);
        if (!bots || bots.length === 0) {
            return false
        }
        var messenger = this.getMessenger();
        Log.info('querying members from bots', bots, group);
        var success = 0;
        var pair;
        var receiver;
        for (var i = 0; i < bots.length; ++i) {
            receiver = bots[i];
            if (receiver.equals(sender)) {
                continue
            }
            pair = messenger.sendContent(content, sender, receiver, 1);
            if (pair && pair[1]) {
                success += 1
            }
        }
        if (success === 0) {
            return false
        }
        var lastMember = this.__lastActiveMembers[group];
        if (!lastMember || bots.indexOf(lastMember) >= 0) {
        } else {
            Log.info('querying members from last member', lastMember, group);
            messenger.sendContent(content, sender, lastMember, 1)
        }
        return true
    };
    ClientArchivist.prototype.queryMembersFromAdministrators = function (content, sender, group) {
        var barrack = this.getFacebook();
        var admins = barrack.getAdministrators(group);
        if (!admins || admins.length === 0) {
            return false
        }
        var messenger = this.getMessenger();
        Log.info('querying members from admins', admins, group);
        var success = 0;
        var pair;
        var receiver;
        for (var i = 0; i < admins.length; ++i) {
            receiver = admins[i];
            if (sender.equals(receiver)) {
                continue
            }
            pair = messenger.sendContent(content, sender, receiver, 1);
            if (!(pair && pair[1])) {
            } else {
                success += 1
            }
        }
        if (success <= 0) {
            return false
        }
        var lastMember = this.__lastActiveMembers[group];
        if (!lastMember || admins.indexOf(lastMember) >= 0) {
        } else {
            Log.info('querying members from last member', lastMember, group);
            messenger.sendContent(content, sender, lastMember, 1)
        }
        return true
    };
    ClientArchivist.prototype.queryMembersFromOwner = function (content, sender, group) {
        var facebook = this.getFacebook();
        var owner = facebook.getOwner(group);
        if (!owner) {
            return false
        } else if (owner.equals(sender)) {
            return false
        }
        var messenger = this.getMessenger();
        Log.info('querying members from owner', owner, group);
        var pair = messenger.sendContent(content, sender, owner, 1);
        if (!(pair && pair[1])) {
            return false
        }
        var lastMember = this.__lastActiveMembers[group];
        if (!lastMember || lastMember.equals(owner)) {
        } else {
            Log.info('querying members from last member', lastMember, group);
            messenger.sendContent(content, sender, lastMember, 1)
        }
        return true
    };
    ClientArchivist.prototype.sendDocument = function (visa, receiver, updated) {
        var me = visa.getIdentifier();
        if (me.equals(receiver)) {
            return false
        }
        if (!this.isDocumentResponseExpired(receiver, updated)) {
            return false
        }
        Log.info('push visa document', me, receiver);
        var content = DocumentCommand.response(me, null, visa);
        var messenger = this.getMessenger();
        var pair = messenger.sendContent(content, me, receiver, 1);
        return pair && pair[1]
    };
    ns.ClientArchivist = ClientArchivist
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var EntityType = ns.protocol.EntityType;
    var ID = ns.protocol.ID;
    var Bulletin = ns.protocol.Bulletin;
    var BroadcastHelper = ns.mkm.BroadcastHelper;
    var CommonFacebook = ns.CommonFacebook;
    var ClientFacebook = function () {
        CommonFacebook.call(this)
    };
    Class(ClientFacebook, CommonFacebook, null, {
        saveDocument: function (doc) {
            var ok = CommonFacebook.prototype.saveDocument.call(this, doc);
            if (ok && Interface.conforms(doc, Bulletin)) {
                var array = doc.getProperty('administrators');
                if (array instanceof Array) {
                    var group = doc.getIdentifier();
                    var admins = ID.convert(array);
                    ok = this.saveAdministrators(admins, group)
                }
            }
            return ok
        }, getFounder: function (group) {
            if (group.isBroadcast()) {
                return BroadcastHelper.getBroadcastFounder(group)
            }
            var doc = this.getBulletin(group);
            if (!doc) {
                return null
            }
            var archivist = this.getArchivist();
            var user = archivist.getFounder(group);
            if (user) {
                return user
            }
            return doc.getFounder()
        }, getOwner: function (group) {
            if (group.isBroadcast()) {
                return BroadcastHelper.getBroadcastOwner(group)
            }
            var doc = this.getBulletin(group);
            if (!doc) {
                return null
            }
            var archivist = this.getArchivist();
            var user = archivist.getOwner(group);
            if (user) {
                return user
            }
            if (EntityType.GROUP.equals(group.getType())) {
                user = archivist.getFounder(group);
                if (!user) {
                    user = doc.getFounder()
                }
            }
            return user
        }, getMembers: function (group) {
            var owner = this.getOwner(group);
            if (!owner) {
                return []
            }
            var archivist = this.getArchivist();
            var members = archivist.getMembers(group);
            archivist.checkMembers(group, members);
            if (!members || members.length === 0) {
                members = [owner]
            }
            return members
        }, getAssistants: function (group) {
            var doc = this.getBulletin(group);
            if (!doc) {
                return []
            }
            var archivist = this.getArchivist();
            var bots = archivist.getAssistants(group);
            if (bots && bots.length > 0) {
                return bots
            }
            bots = doc.getAssistants();
            return !bots ? [] : bots
        }, getAdministrators: function (group) {
            var doc = this.getBulletin(group);
            if (!doc) {
                return []
            }
            var archivist = this.getArchivist();
            return archivist.getAdministrators(group)
        }, saveAdministrators: function (admins, group) {
            var archivist = this.getArchivist();
            return archivist.saveAdministrators(admins, group)
        }, saveMembers: function (newMembers, group) {
            var archivist = this.getArchivist();
            return archivist.saveMembers(newMembers, group)
        }
    });
    ns.ClientFacebook = ClientFacebook
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class
    var Log = ns.lnc.Log;
    var EntityType = ns.protocol.EntityType;
    var ID = ns.protocol.ID;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var LoginCommand = ns.protocol.LoginCommand;
    var ReportCommand = ns.protocol.ReportCommand;
    var Station = ns.mkm.Station;
    var MessageHelper = ns.msg.MessageHelper;
    var CommonMessenger = ns.CommonMessenger;
    var ClientMessenger = function (session, facebook, db) {
        CommonMessenger.call(this, session, facebook, db)
    };
    Class(ClientMessenger, CommonMessenger, null, {
        getArchivist: function () {
            var facebook = this.getFacebook();
            return facebook.getArchivist()
        }, processReliableMessage: function (rMsg) {
            var responses = CommonMessenger.prototype.processReliableMessage.call(this, rMsg);
            if (!responses || responses.length === 0) {
                if (this.needsReceipt(rMsg)) {
                    var res = this.buildReceipt(rMsg.getEnvelope());
                    if (res) {
                        responses = [res]
                    }
                }
            }
            return responses
        }, buildReceipt: function (originalEnvelope) {
            var facebook = this.getFacebook();
            var user = !facebook ? null : facebook.getCurrentUser();
            if (!user) {
                Log.error('failed to get current user');
                return null
            }
            var text = 'Message received.';
            var res = ReceiptCommand.create(text, originalEnvelope, null);
            var env = Envelope.create(user.getIdentifier(), originalEnvelope.getSender(), null);
            var iMsg = InstantMessage.create(env, res);
            var sMsg = this.encryptMessage(iMsg);
            if (!sMsg) {
                Log.error('failed to encrypt message', user, originalEnvelope.getSender());
                return null
            }
            var rMsg = this.signMessage(sMsg);
            if (!rMsg) {
                Log.error('failed to sign message', user, originalEnvelope.getSender())
            }
            return rMsg
        }, needsReceipt: function (rMsg) {
            if (ContentType.COMMAND.equals(rMsg.getType())) {
                return false
            }
            var sender = rMsg.getSender();
            if (!EntityType.USER.equals(sender.getType())) {
                return false
            }
            return true
        }, sendInstantMessage: function (iMsg, priority) {
            var session = this.getSession();
            if (session && session.isReady()) {
            } else {
                var content = iMsg.getContent();
                if (!Interface.conforms(content, Command)) {
                    Log.warning('not handshake yet, suspend message', content, iMsg);
                    return null
                } else if (content.getCmd() === Command.HANDSHAKE) {
                    iMsg.setValue('pass', 'handshaking')
                } else {
                    Log.warning('not handshake yet, drop command', content, iMsg);
                    return null
                }
            }
            return CommonMessenger.prototype.sendInstantMessage.call(this, iMsg, priority)
        }, sendReliableMessage: function (rMsg, priority) {
            var passport = rMsg.removeValue('pass');
            var session = this.getSession();
            if (session && session.isReady()) {
            } else if (passport === 'handshaking') {
            } else {
                Log.error('not handshake yet, suspend message', rMsg);
                return false
            }
            return CommonMessenger.prototype.sendReliableMessage.call(this, rMsg, priority)
        }, handshake: function (sessionKey) {
            var session = this.getSession();
            var station = session.getStation();
            var sid = station.getIdentifier();
            var content;
            if (sessionKey) {
                content = HandshakeCommand.restart(sessionKey);
                this.sendContent(content, null, sid, -1)
            } else {
                var facebook = this.getFacebook();
                var user = facebook.getCurrentUser();
                var me = user.getIdentifier();
                var meta = user.getMeta();
                var visa = user.getVisa();
                var env = Envelope.create(me, sid, null);
                content = HandshakeCommand.start();
                content.setGroup(Station.EVERY);
                var iMsg = InstantMessage.create(env, content);
                MessageHelper.setMeta(meta, iMsg);
                MessageHelper.setVisa(visa, iMsg);
                this.sendInstantMessage(iMsg, -1)
            }
        }, handshakeSuccess: function () {
            Log.info('handshake success, change session accepted');
            var session = this.getSession();
            session.setAccepted(true);
            this.broadcastDocuments()
        }, broadcastDocuments: function (updated) {
            var facebook = this.getFacebook();
            var user = !facebook ? null : facebook.getCurrentUser();
            var visa = !user ? null : user.getVisa();
            if (!visa) {
                Log.error('visa not found', user);
                return
            }
            var me = user.getIdentifier();
            var contacts = facebook.getContacts(me);
            for (var i = 0; i < contacts.length; ++i) {
                this.sendVisa(visa, contacts[i], updated)
            }
            this.sendVisa(visa, ID.EVERYONE, updated)
        }, sendVisa: function (visa, receiver, updated) {
            var me = visa.getIdentifier();
            if (me.equals(receiver)) {
                Log.warning('skip cycled message', receiver, visa);
                return false
            }
            var archivist = this.getArchivist();
            if (!archivist.isDocumentResponseExpired(receiver, updated)) {
                Log.info('visa response not expired yet', receiver);
                return false
            }
            Log.info('push visa document', me, receiver);
            var content = DocumentCommand.response(me, null, visa);
            var pair = this.sendContent(content, me, receiver, 1);
            return pair && pair[1]
        }, broadcastLogin: function (sender, userAgent) {
            var session = this.getSession();
            var station = session.getStation();
            var content = LoginCommand.create(sender);
            content.setAgent(userAgent);
            content.setStation(station);
            this.sendContent(content, sender, ID.EVERYONE, 1)
        }, reportOnline: function (sender) {
            var content = ReportCommand.create(ReportCommand.ONLINE);
            this.sendContent(content, sender, Station.ANY, 1)
        }, reportOffline: function (sender) {
            var content = ReportCommand.create(ReportCommand.OFFLINE);
            this.sendContent(content, sender, Station.ANY, 1)
        }
    });
    ns.ClientMessenger = ClientMessenger
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var ID = ns.protocol.ID;
    var InstantMessage = ns.protocol.InstantMessage;
    var ContentType = ns.protocol.ContentType;
    var TextContent = ns.protocol.TextContent;
    var FileContent = ns.protocol.FileContent;
    var CommonPacker = ns.CommonPacker;
    var ClientMessagePacker = function (facebook, messenger) {
        CommonPacker.call(this, facebook, messenger)
    };
    Class(ClientMessagePacker, CommonPacker, null, {
        checkReceiver: function (iMsg) {
            var receiver = iMsg.getReceiver();
            if (receiver.isBroadcast()) {
                return true
            } else if (receiver.isUser()) {
                return CommonPacker.prototype.checkReceiver.call(this, iMsg)
            }
            var error;
            var members = this.getMembers(receiver);
            if (!members || members.length === 0) {
                error = {'message': 'group members not found', 'group': receiver.toString()};
                this.suspendInstantMessage(iMsg, error);
                return false
            }
            var waiting = [];
            var item;
            for (var i = 0; i < members.length; ++i) {
                item = members[i];
                if (!this.getVisaKey(item)) {
                    waiting.push(item)
                }
            }
            if (waiting.length === 0) {
                return true
            }
            error = {'message': 'members not ready', 'group': receiver.toString(), 'members': ID.revert(waiting)};
            this.suspendInstantMessage(iMsg, error);
            return waiting.length < members.length
        }, checkGroup: function (sMsg) {
            var receiver = sMsg.getReceiver();
            var group = ID.parse(sMsg.getValue('group'));
            if (!group && receiver.isGroup()) {
                group = receiver
            }
            if (!group || group.isBroadcast()) {
                return true
            }
            var members = this.getMembers(group);
            if (members && members.length > 0) {
                return true
            }
            var error = {'message': 'group not ready', 'group': group.toString()};
            this.suspendReliableMessage(sMsg, error);
            return false
        }, verifyMessage: function (rMsg) {
            if (this.checkGroup(rMsg)) {
            } else {
                Log.warning('receiver not ready', rMsg.getReceiver());
                return null
            }
            return CommonPacker.prototype.verifyMessage.call(this, rMsg)
        }, decryptMessage: function (sMsg) {
            var iMsg;
            try {
                iMsg = CommonPacker.prototype.decryptMessage.call(this, sMsg)
            } catch (e) {
                var errMsg = e.toString();
                if (errMsg.indexOf('failed to decrypt key in msg: ') >= 0) {
                    Log.warning('decrypt message error', e)
                } else if (errMsg.indexOf('receiver error') >= 0) {
                    Log.warning('decrypt message error', e);
                    return null
                } else {
                    throw e;
                }
            }
            if (iMsg) {
                var content = iMsg.getContent();
                if (Interface.conforms(content, FileContent)) {
                    if (!content.getPassword() && content.getURL()) {
                        var messenger = this.getMessenger();
                        var key = messenger.getDecryptKey(sMsg);
                        content.setPassword(key)
                    }
                }
            } else {
                this.pushVisa(sMsg.getSender());
                iMsg = this.getFailedMessage(sMsg)
            }
            return iMsg
        }, pushVisa: function (receiver) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            var user = !facebook ? null : facebook.getCurrentUser();
            if (!user) {
                return false
            }
            var visa = user.getVisa();
            if (visa && visa.isValid()) {
            } else {
                throw new ReferenceError('user visa error' + user.toString());
            }
            return messenger.sendVisa(visa, receiver, false)
        }, getFailedMessage: function (sMsg) {
            var sender = sMsg.getSender();
            var group = sMsg.getGroup();
            var type = sMsg.getType();
            if (ContentType.COMMAND.equals(type) || ContentType.HISTORY.equals(type)) {
                Log.warning('ignore message unable to decrypt', type, sender);
                return null
            }
            var content = TextContent.create('Failed to decrypt message.');
            content.setValue('template', 'Failed to decrypt message (type=${type}) from "${sender}".');
            content.setValue('replacements', {
                'type': type,
                'sender': sender.toString(),
                'group': !group ? null : group.toString()
            });
            if (group) {
                content.setGroup(group)
            }
            var info = sMsg.copyMap(false);
            delete info['data'];
            info['content'] = content.toMap();
            return InstantMessage.parse(info)
        }
    });
    ns.ClientMessagePacker = ClientMessagePacker
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var EntityType = ns.protocol.EntityType;
    var TextContent = ns.protocol.TextContent;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var MessageProcessor = ns.MessageProcessor;
    var ClientMessageProcessor = function (facebook, messenger) {
        MessageProcessor.call(this, facebook, messenger)
    };
    Class(ClientMessageProcessor, MessageProcessor, null, {
        checkGroupTimes: function (content, rMsg) {
            var group = content.getGroup();
            if (!group) {
                return false
            }
            var facebook = this.getFacebook();
            var archivist = facebook.getArchivist();
            if (!archivist) {
                return false
            }
            var now = new Date();
            var docUpdated = false;
            var memUpdated = false;
            var lastDocumentTime = rMsg.getDateTime('GDT', null);
            if (lastDocumentTime) {
                if (lastDocumentTime.getTime() > now.getTime()) {
                    lastDocumentTime = now
                }
                docUpdated = archivist.setLastDocumentTime(group, lastDocumentTime);
                if (docUpdated) {
                    Log.info('checking for new bulletin', group);
                    facebook.getDocuments(group)
                }
            }
            var lastHistoryTime = rMsg.getDateTime('GHT', null);
            if (lastHistoryTime) {
                if (lastHistoryTime.getTime() > now.getTime()) {
                    lastHistoryTime = now
                }
                memUpdated = archivist.setLastGroupHistoryTime(group, lastHistoryTime);
                if (memUpdated) {
                    archivist.setLastActiveMember(group, rMsg.getSender());
                    Log.info('checking for group members', group);
                    facebook.getMembers(group)
                }
            }
            return docUpdated || memUpdated
        }, processContent: function (content, rMsg) {
            var responses = MessageProcessor.prototype.processContent.call(this, content, rMsg);
            this.checkGroupTimes(content, rMsg);
            if (!responses || responses.length === 0) {
                return responses
            } else if (Interface.conforms(responses[0], HandshakeCommand)) {
                return responses
            }
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            var sender = rMsg.getSender();
            var receiver = rMsg.getReceiver();
            var user = facebook.selectLocalUser(receiver);
            if (!user) {
                Log.error('receiver error', receiver);
                return responses
            }
            receiver = user.getIdentifier();
            var network = sender.getType();
            var res;
            for (var i = 0; i < responses.length; ++i) {
                res = responses[i];
                if (!res) {
                    continue
                } else if (Interface.conforms(res, ReceiptCommand)) {
                    if (EntityType.STATION.equals(network)) {
                        continue
                    } else if (EntityType.BOT.equals(network)) {
                        continue
                    }
                } else if (Interface.conforms(res, TextContent)) {
                    if (EntityType.STATION.equals(network)) {
                        continue
                    } else if (EntityType.BOT.equals(network)) {
                        continue
                    }
                }
                messenger.sendContent(res, receiver, sender, 1)
            }
            return []
        }, createCreator: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.cpu.ClientContentProcessorCreator(facebook, messenger)
        }
    });
    ns.ClientMessageProcessor = ClientMessageProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Log = ns.lnc.Log;
    var Runner = ns.fsm.skywalker.Runner;
    var Thread = ns.fsm.threading.Thread;
    var EntityType = ns.protocol.EntityType;
    var Station = ns.mkm.Station;
    var ClientSession = ns.network.ClientSession;
    var SessionState = ns.network.SessionState;
    var SessionStateOrder = ns.network.SessionStateOrder;
    var Terminal = function (facebook, db) {
        Runner.call(this);
        this.__facebook = facebook;
        this.__db = db;
        this.__messenger = null;
        this.__last_time = null
    };
    Class(Terminal, Runner, [SessionState.Delegate], null);
    Terminal.prototype.getUserAgent = function () {
        return navigator.userAgent
    };
    Terminal.prototype.getMessenger = function () {
        return this.__messenger
    };
    Terminal.prototype.getSession = function () {
        var messenger = this.__messenger;
        if (!messenger) {
            return null
        }
        return messenger.getSession()
    };
    Terminal.prototype.connect = function (host, port) {
        var station;
        var session;
        var facebook = this.__facebook;
        var messenger = this.__messenger;
        if (messenger) {
            session = messenger.getSession();
            if (session.isRunning()) {
                station = session.getStation();
                if (station.getPort() === port && station.getHost() === host) {
                    return messenger
                }
            }
        }
        Log.info('connecting to ' + host + ':' + port + ' ...');
        station = this.createStation(host, port);
        session = this.createSession(station);
        messenger = this.createMessenger(session, facebook);
        this.__messenger = messenger;
        var packer = this.createPacker(facebook, messenger);
        var processor = this.createProcessor(facebook, messenger);
        messenger.setPacker(packer);
        messenger.setProcessor(processor);
        session.setMessenger(messenger);
        var user = facebook.getCurrentUser();
        if (user) {
            session.setIdentifier(user.getIdentifier())
        }
        return messenger
    };
    Terminal.prototype.createStation = function (host, port) {
        var station = new Station(host, port);
        station.setDataSource(this.__facebook);
        return station
    };
    Terminal.prototype.createSession = function (station) {
        var session = new ClientSession(this.__db, station);
        session.start(this);
        return session
    };
    Terminal.prototype.createPacker = function (facebook, messenger) {
        return new ns.ClientMessagePacker(facebook, messenger)
    };
    Terminal.prototype.createProcessor = function (facebook, messenger) {
        return new ns.ClientMessageProcessor(facebook, messenger)
    };
    Terminal.prototype.createMessenger = function (session, facebook) {
    };
    Terminal.prototype.start = function () {
        var thread = new Thread(this);
        thread.start()
    };
    Terminal.prototype.finish = function () {
        var messenger = this.__messenger;
        if (messenger) {
            var session = this.getSession();
            if (session) {
                session.stop()
            }
            this.__messenger = null
        }
        return Runner.prototype.finish.call(this)
    };
    Terminal.prototype.process = function () {
        var session = this.getSession();
        var state = !session ? null : session.getState();
        var ss_index = !state ? -1 : state.getIndex();
        if (SessionStateOrder.RUNNING.equals(ss_index)) {
            return false
        } else if (!(session && session.isReady())) {
            return false
        }
        var now = new Date();
        if (this.needsKeepOnline(this.__last_time, now)) {
            this.__last_time = now
        } else {
            return false
        }
        try {
            this.keepOnline()
        } catch (e) {
            Log.error('Terminal::process()', e)
        }
        return false
    };
    Terminal.prototype.needsKeepOnline = function (last, now) {
        if (!last) {
            return false
        }
        return (last.getTime() + 300 * 1000) < now.getTime()
    };
    Terminal.prototype.keepOnline = function () {
        var messenger = this.__messenger;
        var facebook = this.__facebook;
        var user = facebook.getCurrentUser();
        if (!user) {
            Log.error('failed to get current user')
        } else if (EntityType.STATION.equals(user.getType())) {
            messenger.reportOnline(user.getIdentifier())
        } else {
            messenger.broadcastLogin(user.getIdentifier(), this.getUserAgent())
        }
    };
    Terminal.prototype.enterState = function (next, ctx, now) {
    };
    Terminal.prototype.exitState = function (previous, ctx, now) {
        var current = ctx.getCurrentState();
        var index = !current ? -1 : current.getIndex();
        if (index === -1 || SessionStateOrder.ERROR.equals(index)) {
            this.__last_time = null;
            return
        }
        var messenger = this.getMessenger();
        var session = this.getSession();
        if (SessionStateOrder.DEFAULT.equals(index) || SessionStateOrder.CONNECTING.equals(index)) {
            var user = ctx.getSessionID();
            if (!user) {
                Log.warning('current user not set', current);
                return
            }
            Log.info('connect for user: ' + user.toString());
            var remote = !session ? null : session.getRemoteAddress();
            if (!remote) {
                Log.warning('failed to get remote address', session);
                return
            }
            var gate = !session ? null : session.getGate();
            var docker = !gate ? null : gate.fetchPorter(remote, null);
            if (docker) {
                Log.info('connected to: ' + remote.toString())
            } else {
                Log.error('failed to connect: ' + remote.toString())
            }
        } else if (SessionStateOrder.HANDSHAKING.equals(index)) {
            messenger.handshake(null)
        } else if (SessionStateOrder.RUNNING.equals(index)) {
            messenger.handshakeSuccess();
            this.__last_time = now
        }
    };
    Terminal.prototype.pauseState = function (current, ctx, now) {
    };
    Terminal.prototype.resumeState = function (current, ctx, now) {
    };
    ns.network.Terminal = Terminal
})(DIMP);
