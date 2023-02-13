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

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var BaseCommandProcessor = sdk.cpu.BaseCommandProcessor;

    /**
     *  Handshake Command Processor
     */
    var HandshakeCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    sdk.Class(HandshakeCommandProcessor, BaseCommandProcessor, null, null);

    var success = function () {
        console.log('handshake success!')
        var messenger = this.getMessenger();
        var server = messenger.getCurrentServer();
        server.handshakeAccepted();
        return null;
    };

    var restart = function (session) {
        console.log('handshake again', session);
        var messenger = this.getMessenger();
        var server = messenger.getCurrentServer();
        server.handshake(session);
        return null;
    };

    // Override
    HandshakeCommandProcessor.prototype.process = function (cmd, rMsg) {
        var message = cmd.getMessage();
        if (message === 'DIM!' || message === 'OK!') {
            // S -> C
            return success.call(this);
        } else if (message === 'DIM?') {
            // S -> C
            return restart.call(this, cmd.getSessionKey());
        } else {
            // C -> S: Hello world!
            throw new Error('handshake command error: ' + cmd);
        }
    };

    //-------- namespace --------
    ns.cpu.HandshakeCommandProcessor = HandshakeCommandProcessor;

    ns.cpu.registers('HandshakeCommandProcessor')

})(SECHAT, DIMSDK);
