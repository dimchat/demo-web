;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
//
//                               Written in 2024 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2024 Albert Moky
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

    var Class = ns.type.Class;
    var MessageProcessor = ns.MessageProcessor;

    var CommonProcessor = function (facebook, messenger) {
        MessageProcessor.call(this, facebook, messenger);
    };
    Class(CommonProcessor, MessageProcessor, null, {

        // Override
        processContent: function (content, rMsg) {
            var responses = MessageProcessor.processContent.call(this, content, rMsg);

            // check sender's document times from the message
            // to make sure the user info synchronized
            checkVisaTime.call(this, content, rMsg);

            return responses;
        }
    });

    // private
    var checkVisaTime = function (content, rMsg) {
        var facebook = this.getFacebook();
        var archivist = facebook.getArchivist();
        if (!archivist) {
            throw new ReferenceError('archivist not found');
        }
        var docUpdated = false;
        // check sender document time
        var lastDocumentTime = rMsg.getDateTime('SDT', null);
        if (lastDocumentTime) {
            var now = new Date();
            if (lastDocumentTime.getTime() > now.getTime()) {
                // calibrate the clock
                lastDocumentTime = now;
            }
            var sender = rMsg.getSender();
            docUpdated = archivist.setLastDocumentTime(sender, lastDocumentTime);
            // check whether needs update
            if (docUpdated) {
                facebook.getDocuments(sender);
            }
        }
        return docUpdated;
    };

    //-------- namespace --------
    ns.CommonProcessor = CommonProcessor;

})(DIMP);
