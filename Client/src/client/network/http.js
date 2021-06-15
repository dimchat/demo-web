;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
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

//! require 'namespace.js'

(function (ns) {
    'use strict';

    var HTTP = {

        get: function (url, callback) {
            var xhr = create();
            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.onload = function(ev) {
                callback(ev.target, url);
            };
            xhr.send();
        },

        post: function (url, headers, body, callback) {
            var xhr = create();
            xhr.open('POST', url);
            xhr.responseType = 'blob';
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

    ns.network.registers('HTTP');

})(SECHAT, DIMSDK);

(function (ns, sdk) {
    'use strict';

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
        begin = sdk.format.UTF8.encode(begin);
        var end = sdk.format.UTF8.encode(BOUNDARY_END);
        var size = begin.length + data.length + end.length;
        var body = new Uint8Array(size);
        body.set(begin, 0);
        body.set(data, begin.length);
        body.set(end, begin.length + data.length);
        return body;
    };

})(SECHAT, DIMSDK);

(function (ns, sdk) {
    'use strict';

    var Storage = sdk.dos.SessionStorage;

    var get_configuration = function () {
        return ns.Configuration;
    };

    var get_http_client = function () {
        return ns.network.HTTP;
    };

    var md5 = function (data) {
        var hash = sdk.digest.MD5.digest(data);
        return sdk.format.Hex.encode(hash);
    };
    var fetch_filename = function (url) {
        var pos;
        // ignore URI query string
        pos = url.indexOf('?');
        if (pos > 0) {
            url = url.substr(0, pos);
        }
        // ignore URI fragment
        pos = url.indexOf('#');
        if (pos > 0) {
            url = url.substr(0, pos);
        }
        // get last path component
        pos = url.lastIndexOf('/');
        if (pos < 0) {
            pos = url.lastIndexOf('\\');
            if (pos < 0) {
                return url;
            }
        }
        return url.substr(pos + 1);
    };
    var unique_filename = function (url) {
        var filename = fetch_filename(url);
        var pos = filename.indexOf('.');
        if (pos !== 32) {
            // filename not hashed by MD5, hash the whole URL instead
            var utf8 = sdk.format.UTF8.encode(url);
            if (pos > 0) {
                filename = md5(utf8) + filename.substr(pos);
            } else {
                filename = md5(utf8);// + '.tmp';
            }
        }
        return filename;
    };

    var FtpServer = {

        /**
         *  Upload avatar to CDN
         *
         * @param {Uint8Array} image - image data
         * @param {ID} user - user ID
         * @return {String} download URL
         */
        uploadAvatar: function (image, user) {
            // prepare filename (make sure that filenames won't conflict)
            var filename = md5(image) + '.jpg';
            // upload to CDN
            var config = get_configuration();
            var up = config.getUploadURL();
            up = up.replace('{ID}', user.getAddress().toString());
            get_http_client().upload(up, image, filename, 'avatar', function (xhr, url) {
                upload_success(image, filename, user, url, xhr.response);
            });
            // build download URL
            var down = config.getAvatarURL();
            down = down.replace('{ID}', user.getAddress.toString());
            down = down.replace('{filename}', filename);
            return down;
        },

        /**
         *  Download avatar from CDN
         *
         * @param {String} url
         * @param {ID} identifier
         * @return {String} img.src
         */
        downloadAvatar: function (url, identifier) {
            return url;
        },

        /**
         *  Update encrypted data by sender
         *
         * @param {Uint8Array} data
         * @param {String} filename
         * @param {ID} sender
         * @return {String} download URL
         */
        uploadEncryptedData: function (data, filename, sender) {
            // prepare filename (make sure that filenames won't conflict)
            var pos = filename.indexOf('.');
            if (pos > 0) {
                filename = md5(data) + filename.substr(pos);
            } else {
                filename = md5(data);// + '.tmp';
            }
            // upload to CDN
            var config = get_configuration();
            var up = config.getUploadURL();
            up = up.replace('{ID}', sender.getAddress().toString());
            get_http_client().upload(up, data, filename, 'file', function (xhr, url) {
                upload_success(data, filename, sender, url, xhr.response);
            });
            // build download URL
            var down = config.getDownloadURL();
            down = down.replace('{ID}', sender.getAddress.toString());
            down = down.replace('{filename}', filename);
            return down;
        },

        /**
         *  Download encrypt data from URL
         *
         * @param {String} url
         * @return {Uint8Array} null when not downloaded yet
         */
        downloadEncryptedData: function (url) {
            var filename = unique_filename(url);
            var data = this.loadFileData(filename);
            if (data) {
                // already downloaded
                return data;
            }
            get_http_client().download(url, function (xhr, url) {
                var data = xhr.response;
                this.saveFileData(data, filename);
                download_success(data, url);
            });
            return null;
        },

        /**
         *  Save file data with filename into local storage
         *
         * @param {Uint8Array} data
         * @param {String} filename
         * @return {boolean}
         */
        saveFileData: function (data, filename) {
            return Storage.saveData(data, filename);
        },

        /**
         *  Load file data with filename from local storage
         *
         * @param {String} filename
         * @return {Uint8Array}
         */
        loadFileData: function (filename) {
            return Storage.loadData(filename);
        }
    };

    var upload_success = function (data, filename, sender, url, response) {
        // TODO: post notification for 'UploadSuccess'
    };

    var download_success = function (response, url) {
        // TODO: post notification for 'DownloadSuccess'
    };

    //-------- namespace --------
    ns.network.FtpServer = FtpServer;

    ns.network.registers('FtpServer');

})(SECHAT, DIMSDK);
