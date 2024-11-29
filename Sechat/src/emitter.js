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

//!require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var Interface      = sdk.type.Interface;
    var Class          = sdk.type.Class;
    var Envelope       = sdk.protocol.Envelope;
    var InstantMessage = sdk.protocol.InstantMessage;
    var TextContent    = sdk.protocol.TextContent;
    var FileContent    = sdk.protocol.FileContent;

    /**
     *  Message Deliver
     *  ~~~~~~~~~~~~~~~
     */
    var Emitter = function () {
        Object.call(this);
    };
    Class(Emitter, Object, null, null);

    /**
     *  Send instant message
     *
     * @param {InstantMessage|Message|Mapper} iMsg
     * @param {int} priority
     * @return {ReliableMessage}
     */
    Emitter.prototype.sendInstantMessage = function (iMsg, priority) {
        var rMsg;
        var receiver = iMsg.getReceiver();
        if (receiver.isGroup()) {
            // send by group manager
            var manager = sdk.group.SharedGroupManager;
            rMsg = manager.sendInstantMessage(iMsg, priority);
        } else {
            // send by shared manager
            var messenger = ns.GlobalVariable.getMessenger();
            rMsg = messenger.sendInstantMessage(iMsg, priority);
        }
        saveInstantMessage(iMsg);
        return rMsg;
    };
    var saveInstantMessage = function (iMsg) {
        var clerk = ns.Amanuensis;
        var ok = clerk.saveInstantMessage(iMsg);
        if (ok) {
            console.info('message saved', iMsg.getSender(), iMsg.getReceiver(), iMsg.getGroup());
        }
    };

    /**
     *  Send message content
     *
     * @param {Content} content
     * @param {ID} receiver
     * @param {int} priority
     * @return {[InstantMessage, ReliableMessage]}
     */
    Emitter.prototype.sendContent = function (content, receiver, priority) {
        if (receiver.isGroup()) {
            content.setGroup(receiver);
        }
        var facebook = ns.GlobalVariable.getFacebook();
        var user = facebook.getCurrentUser();
        if (!user) {
            console.error('failed to get current user');
            return [null, null];
        }
        var sender = user.getIdentifier();
        //
        //  1. pack instant message
        var envelope = Envelope.create(sender, receiver, null);
        var iMsg = InstantMessage.create(envelope, content);
        //
        //  2. check file content
        if (Interface.conforms(content, FileContent)) {
            // TODO: encrypt & upload file data before send out
        }
        //
        //  3. send
        //
        var rMsg = this.sendInstantMessage(iMsg, priority);
        if (!rMsg && receiver.isUser()) {
            console.warn('not send yet', content, receiver);
        }
        return [iMsg, rMsg];
    };

    /**
     *  Send text message to receiver
     *
     * @param {string} text
     * @param {ID} receiver
     */
    Emitter.prototype.sendText = function (text, receiver) {
        var content = TextContent.create(text);
        if (checkMarkdown(text)) {
            console.info('send text as markdown', text, receiver);
            content.setValue('format', 'markdown');
        } else {
            console.info('send text as plain', text, receiver);
        }
        return this.sendContent(content, receiver, 0);
    };
    var checkMarkdown = function (text) {
        if (text.indexOf('://') > 0) {
            return true;
        } else if (text.indexOf('\n> ') > 0) {
            return true;
        } else if (text.indexOf('\n# ') > 0) {
            return true;
        } else if (text.indexOf('\n## ') > 0) {
            return true;
        } else if (text.indexOf('\n### ') > 0) {
            return true;
        }
        var pos = text.indexOf('```');
        if (pos >= 0) {
            pos += 3;
            var next = text.charAt(pos);
            if (next !== '`') {
                return text.indexOf('```', pos + 1) > 0;
            }
        }
        return false;
    };

    // TODO: send image, audio, video message

    // TODO: upload file data before sending file content

    //
    //  Recall Messages
    //

    // TODO:

    //-------- namespace --------
    ns.Emitter = Emitter;

})(SECHAT, DIMP);
