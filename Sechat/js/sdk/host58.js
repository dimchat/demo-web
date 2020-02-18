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

/**
 *  Convert host string (IP:port) to/from Base58 string
 */

!function (ns) {

    //
    //  Host format
    //
    //      IPv4:
    //          127.0.0.1
    //          127.0.0.1:9527
    //
    //      IPv6:
    //          ::
    //          [::]:9527
    //          X:X:X:X:X:X:X:X
    //          [X:X:X:X:X:X:X:X]:9527
    //          X:X:X:X:X:X:127.0.0.1
    //          [X:X:X:X:X:X:127.0.0.1]:9527
    //

    var IP = function (info) {
        // ip data array
        var data = info['data'];
        if (data instanceof Uint8Array) {
            this.data = data;
        }

        // ip
        var ip = info['ip'];
        if (typeof ip === 'string') {
            this.ip = ip;
        }

        // default port
        var default_port = info['default_port'];
        if (default_port) {
            this.default_port = default_port;
        } else {
            this.default_port = 0;
        }

        // port
        var port = info['port'];
        if (port) {
            this.port = port;
        } else {
            this.port = this.default_port;
        }
    };
    IP.prototype.valueOf = function () {
        console.assert(false, 'implement me!');
        return null;
    };
    IP.prototype.toString = function () {
        return this.valueOf();
    };
    IP.prototype.toLocaleString = function () {
        return this.valueOf();
    };
    IP.prototype.toArray = function () {
        var data = this.data; // ip data
        var port = this.port;
        var len = data.length;
        var array;
        if (port === this.default_port) {
            array = new Uint8Array(len);
        } else {
            array = new Uint8Array(len + 2);
        }
        // ip
        for (var i = 0; i < len; ++i) {
            array[i] = data[i];
        }
        // port
        if (port !== this.default_port) {
            array[len] = port >> 8;
            array[len+1] = port & 0xFF;
        }
        return array;
    };

    //
    //  IPv4
    //      127.0.0.1
    //      127.0.0.1:9527
    //
    var IPv4 = function (info) {
        var ip = info['ip'];
        if (ip instanceof Uint8Array) {
            info['data'] = ip;
            delete info['ip'];
        } else if (typeof ip === 'string') {
            // parse IPv4 string
            var data = new Uint8Array(4);
            var array = ip.split('.');
            for (var i = 0; i < 4; ++i) {
                data[i] = parseInt(array[i], 10);
            }
            info['data'] = data;
        }
        IP.call(this, info);
    };
    DIMP.type.Class(IPv4, IP);

    IPv4.prototype.valueOf = function () {
        if (this.port === this.default_port) {
            return this.ip;
        } else {
            return this.ip + ':' + this.port;
        }
    };

    IPv4.patten = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;  // 127.0.0.1:9527

    IPv4.parse = function (host, default_port/* =0 */) {
        // check
        if (!this.patten.test(host)) {
            return null;
        }
        var ip, port = 0;
        if (default_port) {
            port = default_port;
        }
        // parse
        var pair = host.split(':');
        ip = pair[0];
        if (pair.length === 2) {
            port = parseInt(pair[1]);
        }
        // OK, create it
        return new IPv4({ip: ip, port: port, default_port:default_port});
    };

    //
    //  IPv6
    //      ::
    //      [::]:9527
    //      X:X:X:X:X:X:X:X
    //      [X:X:X:X:X:X:X:X]:9527
    //      X:X:X:X:X:X:127.0.0.1
    //      [X:X:X:X:X:X:127.0.0.1]:9527
    //
    var parse_v4 = function (data, array) {
        var item, index = data.byteLength;
        for (var i = array.length-1; i >= 0; --i) {
            item = array[i];
            data[--index] = item;
        }
        return data;
    };

    var parse_v6 = function (data, ip, count) {
        var array, item, index;
        var pos = ip.indexOf('::');
        if (pos < 0) {
            // no compress
            array = ip.split(':');
            index = -1;
            for (var i = 0; i < count; ++i) {
                item = parseInt(array[i], 16);
                data[++index] = item >> 8;
                data[++index] = item & 0xFF;
            }
        } else {
            // left part
            var left = ip.substring(0, pos).split(':');
            index = -1;
            for (var j = 0; j < left.length; ++j) {
                item = parseInt(left[j], 16);
                data[++index] = item >> 8;
                data[++index] = item & 0xFF;
            }
            // right part
            var right = ip.substring(pos+2).split(':');
            index = count * 2;
            for (var k = right.length-1; k >= 0; --k) {
                item = parseInt(right[k], 16);
                data[--index] = item & 0xFF;
                data[--index] = item >> 8;
            }
        }
        return data;
    };

    var IPv6 = function (info) {
        var ip = info['ip'];
        if (ip instanceof Uint8Array) {
            info['data'] = ip;
            delete info['ip'];
        } else if (typeof ip === 'string') {
            // parse IPv6 string
            var data = new Uint8Array(16);
            var array = ip.split('.');
            if (array.length === 1) {
                data = parse_v6(data, ip, 8);
            } else if (array.length === 4) {
                // parse compatible address for IPv4
                //      ::127.0.0.1
                var prefix = array[0];
                var pos = prefix.lastIndexOf(':')+1;
                array[0] = prefix.substring(pos);
                prefix = prefix.substring(0, pos);
                data = parse_v6(data, prefix, 6);
                data = parse_v4(data, array);
            } else {
                throw URIError('IPv6 format error: ' + ip);
            }
            info['data'] = data;
        }
        IP.call(this, info);
    };
    DIMP.type.Class(IPv6, IP);

    IPv6.prototype.valueOf = function () {
        if (this.port === this.default_port) {
            return this.ip;
        } else {
            return '[' + this.ip + ']:' + this.port;
        }
    };

    IPv6.patten = /^\[?([0-9A-Fa-f]{0,4}:){2,7}[0-9A-Fa-f]{0,4}(]:\d{1,5})?$/;
    IPv6.patten_compat = /^\[?([0-9A-Fa-f]{0,4}:){2,6}(\d{1,3}.){3}\d{1,3}(]:\d{1,5})?$/;

    IPv6.parse = function (host, default_port/* =0 */) {
        // check
        if (!this.patten.test(host) && !this.patten_compat.test(host)) {
            return null;
        }
        var ip, port = 0;
        if (default_port) {
            port = default_port;
        }
        // parse
        if (host.charAt(0) === '[') {
            // [0:0:0:0:0:0:0:0]:9527
            var pos = host.indexOf(']');
            ip = host.substring(1, pos);
            port = parseInt(host.substring(pos+2));
        } else {
            ip = host;
        }
        // OK, create it
        return new IPv6({ip: ip, port: port, default_port: default_port});
    };

    var hex_encode = function (hi, lo) {
        if (hi > 0) {
            if (lo >= 16) {
                return Number(hi).toString(16) + Number(lo).toString(16);
            }
            return Number(hi).toString(16) + '0' + Number(lo).toString(16);
        } else {
            return Number(lo).toString(16);
        }
    };

    var Base58 = DIMP.format.Base58;

    var Host58 = function (host, default_port/* =0 */) {
        var ipv;
        if (/[.:]+/.test(host)) {
            // try IPv4
            ipv = IPv4.parse(host, default_port);
            if (!ipv) {
                // try IPv6
                ipv = IPv6.parse(host, default_port);
                if (!ipv) {
                    throw URIError('IP format error');
                }
            }
        } else {
            // base58
            var ip, port = 0;
            if (default_port) {
                port = default_port;
            }
            var array = Base58.decode(host);
            var count = array.length;
            if (count === 4 || count === 6) {
                // IPv4
                ip = array[0] + '.' + array[1] + '.' + array[2] + '.' + array[3];
                if (count === 6) {
                    port = (array[4] << 8) + array[5];
                }
                ipv = new IPv4({ip: ip, port: port, default_port: default_port});
            } else if (count === 16 || count === 18) {
                // IPv6
                ip = hex_encode(array[0], array[1]);
                for (var index = 2; index < 16; index += 2) {
                    ip += ':' + hex_encode(array[index], array[index+1]);
                }
                if (count === 18) {
                    port = (array[16] << 8) + array[17];
                }
                // compress it
                ip = ip.replace(/:(0:){3,}/, '::');
                ip = ip.replace(/^(0::)/, '::');
                ip = ip.replace(/(::0)$/, '::');
                ipv = new IPv6({ip: ip, port: port, default_port: default_port})
            } else {
                throw URIError('host error: ' + host);
            }
        }
        IP.call(this, ipv);
        this.ipv = ipv;
    };
    DIMP.type.Class(Host58, IP);

    Host58.prototype.valueOf = function () {
        return this.ipv.valueOf();
    };

    Host58.prototype.encode = function () {
        return Base58.encode(this.ipv.toArray());
    };

    //-------- namespace --------
    if (typeof ns.network !== 'object') {
        ns.network = {};
    }
    ns.network.Host58 = Host58;

}(DIMP);
