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

    var Host = function (ip, port, data) {
        // ip string
        this.ip = ip;      // String

        // port number
        this.port = port;  // Number

        // ip data array
        this.data = data;  // Uint8Array
    };
    Host.prototype.valueOf = function () {
        console.assert(false, 'implement me!');
        return null;
    };
    Host.prototype.toString = function () {
        return this.valueOf();
    };
    Host.prototype.toLocaleString = function () {
        return this.valueOf();
    };
    Host.prototype.toArray = function (default_port) {
        var data = this.data; // ip data
        var port = this.port;
        var len = data.length;
        var array, index;
        if (!port || port === default_port) {
            // ip
            array = new Uint8Array(len);
            for (index = 0; index < len; ++index) {
                array[index] = data[index];
            }
        } else {
            // ip + port
            array = new Uint8Array(len + 2);
            for (index = 0; index < len; ++index) {
                array[index] = data[index];
            }
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
    var IPv4 = function (ip, port, data) {
        if (data) {
            if (!ip) {
                // get ip+port from data array
                ip = data[0] + '.' + data[1] + '.' + data[2] + '.' + data[3];
                if (data.length === 6) {
                    port = (data[4] << 8) | data[5];
                }
            }
        } else if (ip) {
            // parse IPv4 string
            data = new Uint8Array(4);
            var array = ip.split('.');
            for (var index = 0; index < 4; ++index) {
                data[index] = parseInt(array[index], 10);
            }
        } else {
            throw URIError('IP data empty: ' + data + ', ' + ip + ', ' + port);
        }
        Host.call(this, ip, port, data);
    };
    DIMP.type.Class(IPv4, Host);

    IPv4.prototype.valueOf = function () {
        if (this.port === 0) {
            return this.ip;
        } else {
            return this.ip + ':' + this.port;
        }
    };

    IPv4.patten = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;  // 127.0.0.1:9527

    IPv4.parse = function (host) {
        // check
        if (!this.patten.test(host)) {
            return null;
        }
        var pair = host.split(':');
        var ip = pair[0], port = 0;
        if (pair.length === 2) {
            port = parseInt(pair[1]);
        }
        return new IPv4(ip, port);
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

    var IPv6 = function (ip, port, data) {
        if (data) {
            if (!ip) {
                // get ip+port from data array
                ip = hex_encode(data[0], data[1]);
                for (var index = 2; index < 16; index += 2) {
                    ip += ':' + hex_encode(data[index], data[index+1]);
                }
                // compress it
                ip = ip.replace(/:(0:){2,}/, '::');
                ip = ip.replace(/^(0::)/, '::');
                ip = ip.replace(/(::0)$/, '::');
                if (data.length === 18) {
                    port = (data[16] << 8) | data[17];
                }
            }
        } else if (ip) {
            // parse IPv6 string
            data = new Uint8Array(16);
            var array = ip.split('.');
            if (array.length === 1) {
                // standard IPv6 address
                //      ::7f00:1
                data = parse_v6(data, ip, 8);
            } else if (array.length === 4) {
                // compatible address for IPv4
                //      ::127.0.0.1
                var prefix = array[0];
                var pos = prefix.lastIndexOf(':');
                array[0] = prefix.substring(pos+1); // keep first number of IPv4
                prefix = prefix.substring(0, pos);  // cut IPv4
                data = parse_v6(data, prefix, 6);
                data = parse_v4(data, array);
            } else {
                throw URIError('IPv6 format error: ' + ip);
            }
        } else {
            throw URIError('IP data empty: ' + data + ', ' + ip + ', ' + port);
        }
        Host.call(this, ip, port, data);
    };
    DIMP.type.Class(IPv6, Host);

    IPv6.prototype.valueOf = function () {
        if (this.port === 0) {
            return this.ip;
        } else {
            return '[' + this.ip + ']:' + this.port;
        }
    };

    IPv6.patten = /^\[?([0-9A-Fa-f]{0,4}:){2,7}[0-9A-Fa-f]{0,4}(]:\d{1,5})?$/;
    IPv6.patten_compat = /^\[?([0-9A-Fa-f]{0,4}:){2,6}(\d{1,3}.){3}\d{1,3}(]:\d{1,5})?$/;

    IPv6.parse = function (host) {
        // check
        if (!this.patten.test(host) && !this.patten_compat.test(host)) {
            return null;
        }
        var ip, port;
        if (host.charAt(0) === '[') {
            // [0:0:0:0:0:0:0:0]:9527
            var pos = host.indexOf(']');
            ip = host.substring(1, pos);
            port = parseInt(host.substring(pos+2));
        } else {
            ip = host;
            port = 0;
        }
        return new IPv6(ip, port);
    };

    //-------- namespace --------
    if (typeof ns.network !== 'object') {
        ns.network = {};
    }
    ns.network.Host = Host;
    ns.network.IPv4 = IPv4;
    ns.network.IPv6 = IPv6;

}(DIMP);

!function (ns) {

    var Host = ns.network.Host;
    var IPv4 = ns.network.IPv4;
    var IPv6 = ns.network.IPv6;

    var Base58 = DIMP.format.Base58;

    var Host58 = function (host) {
        var ipv;
        if (/[.:]+/.test(host)) {
            // try IPv4
            ipv = IPv4.parse(host);
            if (!ipv) {
                // try IPv6
                ipv = IPv6.parse(host);
                if (!ipv) {
                    throw URIError('IP format error');
                }
            }
        } else {
            // base58
            var data = Base58.decode(host);
            var count = data.length;
            if (count === 4 || count === 6) {
                // IPv4
                ipv = new IPv4(null, 0, data);
            } else if (count === 16 || count === 18) {
                // IPv6
                ipv = new IPv6(null, 0, data);
            } else {
                throw URIError('host error: ' + host);
            }
        }
        Host.call(this, ipv.ip, ipv.port, ipv.data);
        this.ipv = ipv;
    };
    DIMP.type.Class(Host58, Host);

    Host58.prototype.valueOf = function () {
        return this.ipv.valueOf();
    };

    Host58.prototype.encode = function (default_port) {
        return Base58.encode(this.ipv.toArray(default_port));
    };

    //-------- namespace --------
    ns.network.Host58 = Host58;

}(DIMP);
