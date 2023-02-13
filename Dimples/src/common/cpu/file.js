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

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var InstantMessage = sdk.protocol.InstantMessage;
    var BaseContentProcessor = sdk.cpu.BaseContentProcessor;

    /**
     *  File Content Processor
     */
    var FileContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    sdk.Class(FileContentProcessor, BaseContentProcessor, null, {
        /**
         *  Encrypt data in file content with the password, and upload to CDN
         *
         * @param {FileContent} content
         * @param {EncryptKey} password
         * @param {InstantMessage} iMsg
         * @return {boolean} false on error
         */
        uploadFileContent: function (content, password, iMsg) {
            var data = content.getData();
            if (!data || data.length === 0) {
                // FIXME: already uploaded?
                return false;
            }
            // encrypt and upload file data onto CDN and save the URL in message content
            var encrypted = password.encrypt(data);
            if (!encrypted || encrypted.length === 0) {
                throw new Error('failed to encrypt file data with key: ' + password);
            }
            var messenger = this.getMessenger();
            var url = messenger.uploadData(encrypted, iMsg);
            if (url) {
                // replace 'data' with 'URL'
                content.setURL(url);
                content.setData(null);
                return true;
            } else {
                return false;
            }
        },
        /**
         *  Download data for file content from CDN, and decrypt it with the password
         *
         * @param {FileContent} content
         * @param {DecryptKey} password
         * @param {SecureMessage|*} sMsg
         * @return {boolean} false on error
         */
        downloadFileContent: function (content, password, sMsg) {
            var url = content.getURL();
            if (!url || url.indexOf('://') < 0) {
                // download URL not found
                return false;
            }
            var messenger = this.getMessenger();
            var iMsg = InstantMessage.create(sMsg.getEnvelope(), content);
            // download from CDN
            var encrypted = messenger.downloadData(url, iMsg);
            if (!encrypted || encrypted.length === 0) {
                // save symmetric key for decrypting file data after download from CDN
                content.setPassword(password);
                return false;
            }
            // decrypt file data
            var fileData = password.decrypt(encrypted);
            if (!fileData || fileData.length === 0) {
                throw new Error('failed to decrypt file data with key: ' + password);
            }
            content.setData(fileData);
            content.setURL(null);
            return true;
        },
        // Override
        process: function (cmd, rMsg) {
            // TODO: process file content
            return null;
        }
    });

    //-------- namespace --------
    ns.cpu.FileContentProcessor = FileContentProcessor;

    ns.cpu.registers('FileContentProcessor')

})(SECHAT, DIMSDK);
