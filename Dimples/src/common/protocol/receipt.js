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

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Envelope = ns.protocol.Envelope;
    var Command = ns.protocol.Command;

    Command.RECEIPT = 'receipt';

    /**
     *  Receipt command message: {
     *      type : 0x88,
     *      sn   : 456,
     *
     *      cmd    : "receipt",
     *      text   : "...",  // text message
     *      origin : {       // original message envelope
     *          sender    : "...",
     *          receiver  : "...",
     *          time      : 0,
     *          sn        : 123,
     *          signature : "..."
     *      }
     *  }
     */
    var ReceiptCommand = Interface(null, [Command]);

    /**
     *  Get text message
     *
     * @return {string} text
     */
    ReceiptCommand.prototype.getText = function () {
        throw new Error('NotImplemented');
    };

    /**
     *  Get origin message's envelope
     *
     * @return {Envelope} env
     */
    ReceiptCommand.prototype.getOriginalEnvelope = function () {
        throw new Error('NotImplemented');
    };

    /**
     *  Get origin message's serial number
     *
     * @return {number} sn
     */
    ReceiptCommand.prototype.getOriginalSerialNumber = function () {
        throw new Error('NotImplemented');
    };

    /**
     *  Get origin message's signature
     *
     * @return {string} base64
     */
    ReceiptCommand.prototype.getOriginalSignature = function () {
        throw new Error('NotImplemented');
    };

    //-------- namespace --------
    ns.protocol.ReceiptCommand = ReceiptCommand;

})(DIMP);

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Base64 = ns.format.Base64;
    var Envelope = ns.protocol.Envelope;
    var Command = ns.protocol.Command;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var BaseCommand = ns.dkd.cmd.BaseCommand;

    /**
     *  Create receipt command
     *
     *  Usages:
     *      1. new BaseReceiptCommand(map);
     *      2. new BaseReceiptCommand(text, envelope, sn, signature);
     */
    var BaseReceiptCommand = function () {
        var text, env, sn, sig;
        var origin;
        if (arguments.length === 4) {
            // new BaseReceiptCommand(text, envelope, sn, envelope);
            BaseCommand.call(this, Command.RECEIPT);
            text = arguments[0];
            env = arguments[1];
            sn = arguments[2];
            sig = arguments[3];
            // text message
            if (text) {
                this.setValue('text', text);
            }
            // envelope of the message responding to
            if (env) {
                origin = env.toMap();
            } else {
                origin = {};
            }
            if (sn > 0) {
                origin['sn'] = sn;
            }
            if (sig) {
                if (sig instanceof Uint8Array) {
                    sig = Base64.encode(sig);
                } else if (typeof sig !== 'string') {
                    throw new TypeError('signature error');
                }
                origin['signature'] = sig;
            }
            if (Object.keys(origin).length > 0) {
                this.setValue('origin', origin);
            }
        } else if (typeof arguments[0] === 'string') {
            // new BaseReceiptCommand(text);
            BaseCommand.call(this, Command.RECEIPT);
            text = arguments[0];
            if (text) {
                this.setValue('text', text);
            }
            env = null;
        } else {
            // new BaseReceiptCommand(map);
            BaseCommand.call(this, arguments[0]);
            env = null;
        }
        this.__envelope = env;
    };
    Class(BaseReceiptCommand, BaseCommand, [ReceiptCommand], {

        // Override
        getText: function () {
            return this.getString('text');
        },

        // Override
        getOriginalEnvelope: function () {
            if (this.__envelope === null) {
                // origin: { sender: "...", receiver: "...", time: 0 }
                var origin = this.getValue('origin');
                if (origin && origin['sender']) {
                    this.__envelope = Envelope.parse(origin);
                }
            }
            return this.__envelope;
        },

        // Override
        getOriginalSerialNumber: function () {
            var origin = this.getValue('origin');
            return origin ? origin['sn'] : null;
        },

        // Override
        getOriginalSignature: function () {
            var origin = this.getValue('origin');
            return origin ? origin['signature'] : null;
        }
    });

    //
    //  Factory
    //

    ReceiptCommand.create = function (text, msg) {
        var env = null;
        if (msg) {
            var info = msg.copyMap(false);
            delete info['data'];
            delete info['key'];
            delete info['keys'];
            delete info['meta'];
            delete info['visa'];
            env = Envelope.parse(info);
        }
        return new BaseReceiptCommand(text, env, 0, null);
    };

    //-------- namespace --------
    ns.dkd.cmd.ReceiptCommand = BaseReceiptCommand;

})(DIMP);
