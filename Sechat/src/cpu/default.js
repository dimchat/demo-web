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

//! require <dimsdk.js>

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Class     = ns.type.Class;

    var FileContent    = ns.protocol.FileContent;
    var ImageContent   = ns.protocol.ImageContent;
    var AudioContent   = ns.protocol.AudioContent;
    var VideoContent   = ns.protocol.VideoContent;
    var TextContent    = ns.protocol.TextContent;
    var PageContent    = ns.protocol.PageContent;
    var ReceiptCommand = ns.protocol.ReceiptCommand;

    var BaseContentProcessor = ns.cpu.BaseContentProcessor;

    /**
     *  Default Content Processor
     */
    var AnyContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    Class(AnyContentProcessor, BaseContentProcessor, null, null);

    // Override
    AnyContentProcessor.prototype.process = function (content, rMsg) {
        var text;

        // File: Image, Audio, Video
        if (Interface.conforms(content, FileContent)) {
            if (Interface.conforms(content, ImageContent)) {
                // Image
                text = 'Image received';
            } else if (Interface.conforms(content, AudioContent)) {
                // Audio
                text = 'Voice message received';
            } else if (Interface.conforms(content, VideoContent)) {
                // Video
                text = 'Movie received';
            } else {
                // other file
                text = 'File received';
            }
        } else if (Interface.conforms(content, TextContent)) {
            // Text
            text = 'Text message received';
        } else if (Interface.conforms(content, PageContent)) {
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
        var receipt = ReceiptCommand.create(text, rMsg.getEnvelope(), content);
        return [receipt];
    };

    //-------- namespace --------
    ns.cpu.AnyContentProcessor = AnyContentProcessor;

})(DIMP);
