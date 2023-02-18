;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
//
//                               Written in 2021 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

//! require 'common/*.js'

(function (ns) {
    'use strict';

    var HTTP = {

        get: function (url, callback) {
            var xhr = create();
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function(ev) {
                callback(ev.target, url);
            };
            xhr.send();
        },

        post: function (url, headers, body, callback) {
            var xhr = create();
            xhr.open('POST', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function(ev) {
                if (callback) {
                    callback(ev.target, url);
                }
            };
            if (headers) {
                set_headers(xhr, headers);
            }
            xhr.send(body);
        }
    };

    var create = function () {
        try {
            return new XMLHttpRequest();
        } catch (e) {
            try {
                return new ActiveXObject('Msxml2.XMLHTTP');
            } catch (e) {
                try {
                    return new ActiveXObject('Microsoft.XMLHTTP');
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
            xhr.setRequestHeader(name, headers[name]);
        }
    };

    //-------- namespace --------
    ns.network.HTTP = HTTP;

})(DIMP);

(function (ns) {
    'use strict';

    var UTF8 = ns.format.UTF8;
    var HTTP = ns.network.HTTP;

    /**
     *  Upload data with filename to URL
     *
     * @param {String} url        - remote URL string
     * @param {Uint8Array} data   - file data
     * @param {String} filename   - file name
     * @param {String} name       - form variable name
     * @param {Function} callback - callback(xhr, url)
     */
    HTTP.upload = function (url, data, filename, name, callback) {
        var body = http_body(data, filename, name);
        this.post(url, {
            'Content-Type': CONTENT_TYPE,
            'Content-Length': '' + body.length
        }, body, callback);
    };

    /**
     *  Download data from URL
     *
     * @param {String} url        - remote URL string
     * @param {Function} callback - callback(xhr, url)
     */
    HTTP.download = function (url, callback) {
        if (s_downloading.indexOf(url) < 0) {
            // not downloaded yet
            s_downloading.push(url);
            this.get(url, callback);
        }
    };

    var s_downloading = [];

    var BOUNDARY = 'BU1kUJ19yLYPqv5xoT3sbKYbHwjUu1JU7roix';

    var CONTENT_TYPE = 'multipart/form-data; boundary=' + BOUNDARY;

    var BOUNDARY_BEGIN = '--' + BOUNDARY + '\r\n'
        + 'Content-Disposition: form-data; name={name}; filename={filename}\r\n'
        + 'Content-Type: application/octet-stream\r\n\r\n';
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
        return body;
    };

})(DIMP);
