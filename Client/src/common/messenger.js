;
// license: https://mit-license.org
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

//! require 'keycache.js'

(function (ns, sdk) {
    'use strict';

    var MessengerDelegate = function () {};
    sdk.Interface(MessengerDelegate, null);

    /**
     *  Upload encrypted data to CDN
     *
     * @param {Uint8Array} data     - encrypted file data
     * @param {InstantMessage} iMsg - instant message
     * @return {String} download URL
     */
    MessengerDelegate.prototype.uploadData = function (data, iMsg) {
        ns.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Download encrypted data from CDN
     *
     * @param {String} url          - download URL
     * @param {InstantMessage} iMsg - instant message
     * @return {Uint8Array} encrypted file data
     */
    MessengerDelegate.prototype.downloadData = function (url, iMsg) {
        ns.assert(false, 'implement me!');
        return null;
    };

    //-------- namespace --------
    ns.MessengerDelegate = MessengerDelegate;

    ns.registers('MessengerDelegate');

})(SECHAT, DIMSDK);

(function (ns, sdk) {
    'use strict';

    var ContentType = sdk.protocol.ContentType;
    var FileContent = sdk.protocol.FileContent;
    var Messenger = sdk.Messenger;
    var KeyStore = ns.KeyStore;

    var CommonMessenger = function () {
        Messenger.call(this);
        this.__delegate = null;
        this.__packer = null;
        this.__processor = null;
    };
    sdk.Class(CommonMessenger, Messenger, null, null);

    /**
     *  Delegate for Station
     *
     * @param {MessengerDelegate} delegate - message delegate
     */
    CommonMessenger.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate;
    };
    CommonMessenger.prototype.getDelegate = function () {
        return this.__delegate;
    };

    CommonMessenger.prototype.getFacebook = function () {
        ns.assert(false, 'implement me!');
        return null;
    };

    // Override
    CommonMessenger.prototype.getCipherKeyDelegate = function () {
        return this.getKeyStore();
    };
    CommonMessenger.prototype.getKeyStore = function () {
        return KeyStore.getInstance();
    };

    // CommonMessenger.prototype.getEntityDelegate = function() {
    //     if (!this.__barrack) {
    //         this.__barrack = new ns.CommonFacebook();
    //     }
    //     return this.__barrack;
    // };

    // Override
    CommonMessenger.prototype.getPacker = function () {
        if (!this.__packer) {
            this.__packer = this.createPacker();
        }
        return this.__packer;
    };
    // protected
    CommonMessenger.prototype.createPacker = function () {
        return new ns.CommonPacker(this.getFacebook(), this);
    };

    // Override
    CommonMessenger.prototype.getProcessor = function () {
        if (!this.__processor) {
            this.__processor = this.createProcessor();
        }
        return this.__processor;
    };
    // protected
    CommonMessenger.prototype.createProcessor = function () {
        return new ns.CommonProcessor(this.getFacebook(), this);
    };

    // CommonMessenger.prototype.getTransmitter = function () {
    //     if (!this.__transmitter) {
    //         this.__transmitter = new ns.CommonTransmitter(this);
    //     }
    //     return this.__transmitter;
    // };

    // private
    CommonMessenger.prototype.getFileContentProcessor = function () {
        var processor = this.getProcessor();
        var type = ContentType.FILE.valueOf();
        return processor.getContentProcessor(type);
    };

    // Override
    CommonMessenger.prototype.serializeContent = function (content, password, iMsg) {
        // check attachment for File/Image/Audio/Video message content
        if (sdk.Interface.conforms(content, FileContent)) {
            var fpu = this.getFileContentProcessor();
            fpu.uploadFileContent(content, password, iMsg);
        }
        return Messenger.prototype.serializeContent.call(this, content, password, iMsg);
    };

    // Override
    CommonMessenger.prototype.deserializeContent = function (data, password, sMsg) {
        var content;
        try {
            content = Messenger.prototype.deserializeContent.call(this, data, password, sMsg);
        } catch (e) {
            console.error('deserialize content error', e);
            return null;
        }
        if (!content) {
            throw new Error('failed to deserialize message content: ' + sMsg);
        }
        // check attachment for File/Image/Audio/Video message content
        if (sdk.Interface.conforms(content, FileContent)) {
            var fpu = this.getFileContentProcessor();
            fpu.downloadFileContent(content, password, sMsg);
        }
        return content;
    };

    // Override
    CommonMessenger.prototype.serializeKey = function (password, iMsg) {
        var reused = password.getValue('reused');
        if (reused) {
            var receiver = iMsg.getReceiver();
            if (receiver.isGroup()) {
                // reuse key for grouped message
                return null;
            }
            // remove before serialize key
            password.removeValue('reused');
        }
        var data = Messenger.prototype.serializeKey.call(this, password, iMsg);
        if (reused) {
            // put it back
            password.setValue('reused', reused);
        }
        return data;
    };

    CommonMessenger.prototype.encryptKey = function (data, receiver, iMsg) {
        var facebook = this.getFacebook();
        var key = facebook.getPublicKeyForEncryption(receiver);
        if (!key) {
            // save this message in a queue waiting receiver's meta/document response
            this.suspendInstantMessage(iMsg);
            return null;
        }
        return Messenger.prototype.encryptKey.call(this, data, receiver, iMsg);
    };

    //
    //  Interfaces for Message Storage
    //

    /**
     *  Suspend the received message for the sender's meta
     *
     * @param {ReliableMessage} rMsg - message received from network
     */
    CommonMessenger.prototype.suspendReliableMessage = function (rMsg) {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Suspend the sending message for the receiver's meta & visa,
     *  or group meta when received new message
     *
     * @param {InstantMessage} iMsg - instant message to be sent
     */
    CommonMessenger.prototype.suspendInstantMessage = function (iMsg) {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Save the message into local storeage
     *
     * @param {InstantMessage} iMsg - instant message
     * @return {boolean} true on success
     */
    CommonMessenger.prototype.saveMessage = function (iMsg) {
        ns.assert(false, 'implement me!');
        return false;
    };

    //
    //  Interfaces for Sending Commands
    //
    CommonMessenger.prototype.sendContent = function (sender, receiver, content, priority) {
        ns.assert(false, 'implement me!');
        return false;
    };

    CommonMessenger.prototype.queryMeta = function (identifier) {
        console.assert(false, 'implement me!');
        return false;
    };
    CommonMessenger.prototype.queryDocument = function (identifier, type) {
        console.assert(false, 'implement me!');
        return false;
    };
    CommonMessenger.prototype.queryGroupInfo = function (group, members) {
        console.assert(false, 'implement me!');
        return false;
    };

    //
    //  Events
    //
    CommonMessenger.prototype.onConnected = function () {
        console.log('connected');
    };

    //
    //  Interfaces for Station
    //
    CommonMessenger.prototype.uploadData = function (data, iMsg) {
        var delegate = this.getDelegate();
        return delegate.uploadData(data, iMsg);
    };

    CommonMessenger.prototype.downloadData = function (url, iMsg) {
        var delegate = this.getDelegate();
        return delegate.downloadData(url, iMsg);
    };

    //-------- namespace --------
    ns.CommonMessenger = CommonMessenger;

    ns.registers('CommonMessenger');

})(SECHAT, DIMSDK);

//! require 'protocol/search.js'
//! require 'protocol/report.js'
//! require 'cpu/receipt.js'
//! require 'cpu/mute.js'
//! require 'cpu/block.js'
//! require 'cpu/default.js'

(function (ns, sdk) {
    'use strict';

    var Content = sdk.protocol.Content;
    var Command = sdk.protocol.Command;
    var MuteCommand = sdk.protocol.MuteCommand;
    var BlockCommand = sdk.protocol.BlockCommand;
    var CommandFactory = sdk.core.CommandFactory;

    var SearchCommand = ns.protocol.SearchCommand;
    var ReportCommand = ns.protocol.ReportCommand;
    var AnyContentProcessor = ns.cpu.AnyContentProcessor;
    var ReceiptCommandProcessor = ns.cpu.ReceiptCommandProcessor;
    var MuteCommandProcessor = ns.cpu.MuteCommandProcessor;
    var BlockCommandProcessor = ns.cpu.BlockCommandProcessor;

    var registerCommandFactories = function () {
        var search = new CommandFactory(SearchCommand);
        Command.setFactory(SearchCommand.SEARCH, search);
        Command.setFactory(SearchCommand.ONLINE_USERS, search);
        var report = new CommandFactory(ReportCommand);
        Command.setFactory(ReportCommand.REPORT, report);
        Command.setFactory(ReportCommand.ONLINE, report);
        Command.setFactory(ReportCommand.OFFLINE, report);
    };

    var registerCommandProcessors = function () {
        Command.setFactory(Command.RECEIPT, new ReceiptCommandProcessor());
        Command.setFactory(MuteCommand.MUTE, new MuteCommandProcessor());
        Command.setFactory(BlockCommand.BLOCK, new BlockCommandProcessor());
    };

    var registerContentProcessors = function () {
        Content.setFactory(0, new AnyContentProcessor());
    };

    registerCommandFactories();
    registerCommandProcessors();
    registerContentProcessors();

})(SECHAT, DIMSDK);
