;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2023 Albert Moky
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

(function (ns, sdk) {
    'use strict';

    var Hex = sdk.format.Hex;

    var Configuration = {

        getInstance: function () {
            return this;
        },

        getDefaultProvider: function () {
            if (this.__sp === null) {
                this.__sp = load_config();
            }
            return this.__sp;
        },

        getMD5Secret: function () {
            var info = this.getDefaultProvider();
            return info['MD5_SECRET'];
        },

        getUploadURL: function () {
            //return 'https://sechat.dim.chat/{ID}/upload';
            var info = this.getDefaultProvider();
            return info['UPLOAD_URL'];
        },

        getDownloadURL: function () {
            //return 'https://sechat.dim.chat/download/{ID}/{filename}';
            var info = this.getDefaultProvider();
            return info['DOWNLOAD_URL'];
        },

        getAvatarURL: function () {
            //return 'https://sechat.dim.chat/avatar/{ID}/{filename}';
            var info = this.getDefaultProvider();
            return info['AVATAR_URL'];
        },

        getTermsURL: function () {
            return 'https://wallet.dim.chat/dimchat/sechat/privacy.html';
        },

        getAboutURL: function () {
            // return 'https://sechat.dim.chat/support';
            return 'https://dim.chat/sechat';
        },

        __sp: null
    };

    var load_config = function () {
        // TODO: load config from 'gsp.js'
        return {
            'UPLOAD_URL': 'http://106.52.25.169:8081/{ID}/upload?md5={MD5}&salt={SALT}',
            'DOWNLOAD_URL': 'http://106.52.25.169:8081/download/{ID}/{filename}',
            'AVATAR_URL': 'http://106.52.25.169:8081/avatar/{ID}/{filename}',

            'MD5_SECRET': Hex.decode("12345678")
        };
    };

    //-------- namespace --------
    ns.Configuration = Configuration;

})(SECHAT, DIMP);
