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

//! require <dimples.js>

(function (ns, sdk) {
    'use strict';

    var Hex = sdk.format.Hex;
    var UTF8 = sdk.format.UTF8;
    var MD5 = sdk.digest.MD5;
    var Storage = ns.dos.SessionStorage;

    var get_configuration = function () {
        return ns.Configuration.getInstance();
    };

    var get_http_client = function () {
        return ns.network.HTTP;
    };

    var md5 = function (data) {
        var hash = MD5.digest(data);
        return Hex.encode(hash);
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
            var utf8 = UTF8.encode(url);
            if (pos > 0) {
                filename = md5(utf8) + filename.substr(pos);
            } else {
                filename = md5(utf8);// + '.tmp';
            }
        }
        return filename;
    };

    var generate_salt = function () {
        var data = new Uint8Array(16);
        for (var i = 0; i < 16; ++i) {
            data[i] = Math.floor(Math.random() * 256);
        }
        return data;
    };
    var secret_digest = function (data, secret, salt) {
        var concat = new Uint8Array(data.length + secret.length + salt.length);
        concat.set(data, 0);
        concat.set(secret, data.length);
        concat.set(salt, data.length + secret.length);
        return MD5.digest(concat);
    };
    var upload = function (type, data, filename, identifier, url, callback) {
        var config = get_configuration();
        // md5(data + secret + salt)
        var secret = config.getMD5Secret();
        var salt = generate_salt();
        var digest = secret_digest(data, secret, salt);
        // build URL
        url = url.replace('{ID}', identifier.getAddress().toString());
        url = url.replace('{MD5}', Hex.encode(digest));
        url = url.replace('{SALT}', Hex.encode(salt));
        // upload to CDN
        if (!callback) {
            callback = function (xhr, url) {
                var response = new Uint8Array(xhr.response);
                upload_success(type, data, filename, identifier, url, response);
            };
        }
        var http = get_http_client();
        http.upload(url, data, filename, type, callback);
    }

    var FtpServer = {

        /**
         *  Upload avatar to CDN
         *
         * @param {Uint8Array} image - image data
         * @param {ID} sender        - user ID
         * @return {string} download URL
         */
        uploadAvatar: function (image, sender) {
            // prepare filename (make sure that filenames won't conflict)
            var filename = md5(image) + '.jpg';
            // upload to CDN
            var config = get_configuration();
            var up = config.getUploadURL();
            upload('avatar', image, filename, sender, up, null);
            // build download URL
            var down = config.getAvatarURL();
            down = down.replace('{ID}', sender.getAddress.toString());
            down = down.replace('{filename}', filename);
            return down;
        },

        /**
         *  Download avatar from CDN
         *
         * @param {string} url
         * @param {ID} identifier
         * @return {string} img.src
         */
        downloadAvatar: function (url, identifier) {
            return url;
        },

        /**
         *  Update encrypted data by sender
         *
         * @param {Uint8Array} data - file data
         * @param {String} filename - file name
         * @param {ID} sender       - user ID
         * @return {string} download URL
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
            upload('file', data, filename, sender, up, null);
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
            var ftp = this;
            get_http_client().download(url, function (xhr, url) {
                var response = new Uint8Array(xhr.response);
                if (response.length > 0) {
                    ftp.saveFileData(response, filename);
                    download_success(response, url);
                }
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
        },

        /**
         *  Get file data from message content
         *
         * @param {FileContent} content
         * @return {text}
         */
        getFileData: function (content) {
            var data = content.getData('data');
            if (data) {
                return data;
            }
            // check decrypted file
            var filename = content.getFilename();
            if (filename) {
                data = this.loadFileData(filename);
                if (data) {
                    return data;
                }
            }
            // get encrypted data
            var url = content.getURL();
            if (url) {
                data = this.downloadEncryptedData(url);
                if (data) {
                    return decrypt_file_data(data, content, this);
                }
            }
            return null;
        }
    };

    var decrypt_file_data = function (encrypted, content, ftp) {
        var filename = content.getFilename();
        var pwd = content.getPassword();
        if (!pwd || !filename) {
            console.error('cannot decrypt file data', content);
            return null;
        }
        var data = pwd.decrypt(encrypted);
        var pos = filename.indexOf('.');
        if (pos > 0) {
            filename = md5(data) + filename.substr(pos);
        } else {
            filename = md5(data);// + '.tmp';
        }
        if (ftp.saveFileData(data, filename)) {
            content.setFilename(filename);
        }
        return data;
    };

    var upload_success = function (type, data, filename, sender, url, response) {
        // TODO: post notification for 'UploadSuccess'
    };

    var download_success = function (url, response) {
        // TODO: post notification for 'DownloadSuccess'
    };

    //-------- namespace --------
    ns.network.FtpServer = FtpServer;

})(SECHAT, DIMP);
