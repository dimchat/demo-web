;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
//
//                               Written in 2020 by Moky <albert.moky@gmail.com>
//
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

//! require <dimp.js>

!function (ns) {
    'use strict';

    var Data = ns.type.Data;

    var Base64 = ns.format.Base64;
    var SHA256 = ns.digest.SHA256;

    var SymmetricKey = ns.crypto.SymmetricKey;

    var Password = {

        KEY_SIZE: 32,
        BLOCK_SIZE: 16,

        generate: function (string) {
            var data = ns.type.String.from(string).getBytes('UTF-8');
            var digest = SHA256.digest(data);
            // AES key data
            var len = Password.KEY_SIZE - data.length;
            if (len > 0) {
                // format: {digest_prefix}+{pwd_data}
                var merged = new Data(Password.KEY_SIZE);
                merged.push(digest.subarray(0, len));
                merged.push(data);
                data = merged.getBytes(false);
            } else if (len < 0) {
                data = digest;
            }
            // AES iv
            var pos = Password.KEY_SIZE - Password.BLOCK_SIZE;
            var iv = digest.subarray(pos);
            // generate AES key
            var key = {
                'algorithm': SymmetricKey.AES,
                'data': Base64.encode(data),
                'iv': Base64.encode(iv)
            };
            return SymmetricKey.getInstance(key);
        }
    };

    //-------- namespace --------
    if (typeof ns.extensions !== 'object') {
        ns.extensions = {}
    }
    ns.extensions.Password = Password;

}(DIMP);
