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

    /*  Host format
     *      IPv4:
     *          0.0.0.0
     *          0.0.0.0:9527
     *      IPv6:
     *          ::
     *          [::]:9527
     *          0:0:0:0:0:0:0:0
     *          [0:0:0:0:0:0:0:0]:9527
     */

    var Base58 = DIMP.format.Base58;

    var re_ip = /[.:]+/; // ip or domain
    var re_v4 = /^(\d+\.){3}\d+(:\d+)?$/;  // 127.0.0.1:9527

    var encode = function (ip_port) {
        if (re_v4.test(ip_port)) {
            // IPv4
            var a = ip_port.split(re_ip);
            var count = a.length;
            if (count !== 4 && count !== 5) {
                throw URIError('IPv4 format error: ' + ip_port);
            }
            var data = [];
            // parse IP
            for (var i = 0; i < 4; ++i) {
                data.push(parseInt(a[i]));
            }
            if (count === 5) {
                // parse port
                var port = parseInt(a[4]);
                data.push(port & 0xFF);
                data.push(port >> 8);
            }
            return Base58.encode(data);
        } else {
            // IPv6?
            throw URIError('IPv6 not support yet');
        }
    };

    var decode = function (host, default_port) {
        var ip, port = default_port;
        var count;
        if (re_ip.test(host)) {
            // '0.0.0.0:0'
            var pair = host.split(':');
            count = pair.length;
            if (count === 1 || count === 2) {
                // IPv4
                ip = pair[0];
                if (count === 2) {
                    port = parseInt(pair[1]);
                }
            } else {
                // IPv6?
                throw URIError('IPv6 not support yet');
            }
        } else {
            // base58
            var a = Base58.decode(host);
            count = a.length;
            if (count === 4 || count === 6) {
                // IPv4
                ip = a[0] + '.' + a[1] + '.' + a[2] + '.' + a[3];
                port = default_port;
                if (count === 6) {
                    port = a[4] + (a[5] << 8);
                }
            } else {
                // IPv6?
                throw URIError('host error: ' + host);
            }
        }
        return {ip: ip, port: port};
    };

    var Host58 = function (host, default_port/* =0 */) {
        if (!default_port) {
            default_port = 0;
        }
        var a = decode(host, default_port);
        this.ip = a.ip;
        this.port = a.port;
        this.default_port = default_port;
    };

    Host58.prototype.valueOf = function () {
        if (re_v4.test(this.ip)) {
            // IPv4
            if (this.port === this.default_port) {
                return this.ip;
            } else {
                return this.ip + ':' + this.port;
            }
        } else {
            // IPv6
            throw URIError('IPv6 not support yet');
        }
    };
    Host58.prototype.toString = function () {
        return this.valueOf();
    };
    Host58.prototype.toLocaleString = function () {
        return this.valueOf();
    };

    Host58.prototype.encode = function () {
        return encode(this.valueOf());
    };

    //-------- namespace --------
    ns.Host58 = Host58;

}(window);
