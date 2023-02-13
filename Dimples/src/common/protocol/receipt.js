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

    var Envelope = ns.protocol.Envelope;
    var Command = ns.protocol.Command;

    /**
     *  Command message: {
     *      type : 0x88,
     *      sn   : 123,  // the same serial number with the original message
     *
     *      command   : "receipt",
     *      message   : "...",
     *      // -- extra info
     *      sender    : "...",
     *      receiver  : "...",
     *      time      : 0,
     *      signature : "..." // the same signature with the original message
     *  }
     */
    var ReceiptCommand = function () {};
    ns.Interface(ReceiptCommand, [Command]);

    /**
     *  Get text message
     *
     * @return {String}
     */
    ReceiptCommand.prototype.getMessage = function () {
        ns.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Store 'sender', 'receiver', 'time' & 'group'
     *  from origin message's envelope
     *
     * @param {Envelope} env
     */
    ReceiptCommand.prototype.setEnvelope = function (env) {
        ns.assert(false, 'implement me!');
    };
    ReceiptCommand.prototype.getEnvelope = function () {
        ns.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Store origin message's signature
     *
     * @param {String|Uint8Array} signature
     */
    ReceiptCommand.prototype.setSignature = function (signature) {
        ns.assert(false, 'implement me!');
    };
    ReceiptCommand.prototype.getSignature = function () {
        ns.assert(false, 'implement me!');
        return null;
    };

    //-------- namespace --------
    ns.protocol.ReceiptCommand = ReceiptCommand;

    ns.protocol.registers('ReceiptCommand');

})(DIMSDK);

(function (ns) {
    'use strict';

    var Base64 = ns.format.Base64;
    var Envelope = ns.protocol.Envelope;
    var Command = ns.protocol.Command;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var BaseCommand = ns.dkd.BaseCommand;

    /**
     *  Create receipt command
     *
     *  Usages:
     *      1. new BaseReceiptCommand(map);
     *      2. new BaseReceiptCommand(text);
     *      3. new BaseReceiptCommand(text, sn, envelope);
     */
    var BaseReceiptCommand = function () {
        if (arguments.length === 3) {
            // new BaseReceiptCommand(text, sn, envelope);
            BaseCommand.call(this, Command.RECEIPT);
            this.setMessage(arguments[0]);
            if (arguments[1] > 0) {
                this.setSerialNumber(arguments[1]);
            }
            this.setEnvelope(arguments[2]);
        } else if (typeof arguments[0] === 'string') {
            // new BaseReceiptCommand(text);
            BaseCommand.call(this, Command.RECEIPT);
            this.setMessage(arguments[0]);
            this.__envelope = null;
        } else {
            // new BaseReceiptCommand(map);
            BaseCommand.call(this, arguments[0]);
            this.__envelope = null;
        }
    };
    ns.Class(BaseReceiptCommand, BaseCommand, [ReceiptCommand], {

        setSerialNumber: function (sn) {
            this.setValue('sn', sn);
            // this.__sn = sn;
        },

        setMessage: function (message) {
            this.setValue('message', message);
        },

        // Override
        getMessage: function () {
            return this.getValue('message');
        },

        // Override
        getEnvelope: function () {
            if (!this.__envelope) {
                var env = this.getValue('envelope');
                if (!env) {
                    var sender = this.getValue('sender');
                    var receiver = this.getValue('receiver');
                    if (sender && receiver) {
                        env = this.toMap();
                    }
                }
                this.__envelope = Envelope.parse(env);
            }
            return this.__envelope;
        },

        // Override
        setEnvelope: function (env) {
            this.setValue('envelope', null);
            if (env) {
                this.setValue('sender', env.getValue('sender'));
                this.setValue('receiver', env.getValue('receiver'));
                var time = env.getValue('time');
                if (time) {
                    this.setValue('time', time);
                }
                var group = env.getValue('group');
                if (group) {
                    this.setValue('group', group);
                }
            }
            this.__envelope = env;
        },

        // Override
        setSignature: function (signature) {
            if (signature instanceof Uint8Array) {
                signature = Base64.encode(signature);
            }
            this.setValue('signature', signature);
        },

        // Override
        getSignature: function () {
            var signature = this.getValue('signature');
            if (typeof signature === 'string') {
                signature = Base64.decode(signature);
            }
            return signature;
        }
    });

    //-------- namespace --------
    ns.dkd.BaseReceiptCommand = BaseReceiptCommand;

    ns.dkd.registers('BaseReceiptCommand');

})(DIMSDK);
