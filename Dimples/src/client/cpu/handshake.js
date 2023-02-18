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

//! require <dimsdk.js>

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;

    /**
     *  Handshake Command Processor
     */
    var HandshakeCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(HandshakeCommandProcessor, BaseCommandProcessor, null, {

        // Override
        process: function (content, rMsg) {
            var messenger = this.getMessenger();
            var session = messenger.getSession();
            // update station's default ID ('station@anywhere') to sender (real ID)
            var station = session.getStation();
            var oid = station.getIdentifier();
            var sender = rMsg.getSender();
            if (!oid || oid.isBroadcast()) {
                station.setIdentifier(sender);
            }
            // handle handshake command with title & session key
            var title = content.getTitle();
            var newKey = content.getSessionKey();
            var oldKey = session.getKey();
            if (title === 'DIM?') {
                // S -> C: station ask client to handshake again
                if (!oldKey) {
                    // first handshake response with new session key
                    messenger.handshake(newKey);
                } else if (oldKey === newKey) {
                    // duplicated handshake response?
                    // or session expired and the station ask to handshake again?
                    messenger.handshake(newKey);
                } else {
                    // connection changed?
                    // erase session key to handshake again
                    messenger.setKey(null);
                }
            } else if (title === 'DIM!') {
                // S -> C: handshake accepted by station
                if (!oldKey) {
                    // normal handshake response,
                    // update session key to change state to 'running'
                    session.setKey(newKey);
                } else if (oldKey === newKey) {
                    // duplicated handshake response?
                    console.warn('duplicated handshake', content, rMsg);
                } else {
                    console.error('handshake error', oldKey, content, rMsg);
                    // FIXME: handshake error
                    // erase session key to handshake again
                    session.setKey(null);
                }
            } else {
                // C -> S: Hello world!
                console.error('Hello world!', content, rMsg);
            }
            return null;
        }
    });

    //-------- namespace --------
    ns.cpu.HandshakeCommandProcessor = HandshakeCommandProcessor;

})(DIMP);
