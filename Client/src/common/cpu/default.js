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

    var ReceiptCommand = sdk.protocol.ReceiptCommand;
    var FileContent = sdk.protocol.FileContent;
    var ImageContent = sdk.protocol.ImageContent;
    var AudioContent = sdk.protocol.AudioContent;
    var VideoContent = sdk.protocol.VideoContent;
    var TextContent = sdk.protocol.TextContent;
    var PageContent = sdk.protocol.PageContent;

    var BaseContentProcessor = sdk.cpu.BaseContentProcessor;

    /**
     *  Default Content Processor
     */
    var AnyContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    sdk.Class(AnyContentProcessor, BaseContentProcessor, null, null);

    // Override
    AnyContentProcessor.prototype.process = function (content, rMsg) {
        var text;

        if (sdk.Interface.conforms(content, FileContent)) {
            if (sdk.Interface.conforms(content, ImageContent)) {
                // Image
                text = 'Image received';
            } else if (sdk.Interface.conforms(content, AudioContent)) {
                // Audio
                text = 'Voice message received';
            } else if (sdk.Interface.conforms(content, VideoContent)) {
                // Video
                text = 'Movie received';
            } else {
                // other file
                text = 'File received';
            }
        } else if (sdk.Interface.conforms(content, TextContent)) {
            // Text
            text = 'Text message received';
        } else if (sdk.Interface.conforms(content, PageContent)) {
            // Web page
            text = 'Web page received';
        } else {
            // Other
            return BaseContentProcessor.prototype.process.call(this, content, rMsg);
        }

        // check group message
        var group = content.getGroup();
        if (group) {
            // DON'T response group message for disturb reason
            return null;
        }
        // response
        var res = new ReceiptCommand(text);
        res.setSerialNumber(content.getSerialNumber());
        res.setEnvelope(rMsg.getEnvelope());
        res.setSignature(rMsg.getValue('signature'));
        return res;
    };

    //-------- namespace --------
    ns.cpu.AnyContentProcessor = AnyContentProcessor;

    ns.cpu.registers('AnyContentProcessor')

})(SECHAT, DIMSDK);
