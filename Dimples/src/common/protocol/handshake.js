;
// license: https://mit-license.org
//
//  DIMP : Decentralized Instant Messaging Protocol
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
    var Enum      = ns.type.Enum;
    var Command   = ns.protocol.Command;

    var HandshakeState = Enum('HandshakeState', {
        START:   0, // C -> S, without session key(or session expired)
        AGAIN:   1, // S -> C, with new session key
        RESTART: 2, // C -> S, with new session key
        SUCCESS: 3  // S -> C, handshake accepted
    });

    HandshakeState.checkState = function (title, session) {
        if (title === 'DIM!'/* || title === 'OK!'*/) {
            return HandshakeState.SUCCESS;
        } else if (title === 'DIM?') {
            return HandshakeState.AGAIN;
        } else if (!session) {
            return HandshakeState.START;
        } else {
            return HandshakeState.RESTART;
        }
    };

    Command.HANDSHAKE = 'handshake';

    /**
     *  Handshake command message: {
     *      type : 0x88,
     *      sn   : 123,
     *
     *      command : "handshake",    // command name
     *      title   : "Hello world!", // "DIM?", "DIM!"
     *      session : "{SESSION_KEY}" // session key
     *  }
     */
    var HandshakeCommand = Interface(null, [Command]);

    /**
     *  Get title
     *
     * @returns {string}
     */
    HandshakeCommand.prototype.getTitle = function () {};

    /**
     *  Get session key
     *
     * @returns {string}
     */
    HandshakeCommand.prototype.getSessionKey = function () {};

    /**
     *  Get handshake state
     *
     * @return {HandshakeState}
     */
    HandshakeCommand.prototype.getState = function () {};

    //
    //  Factories
    //

    HandshakeCommand.start = function () {
        return new ns.dkd.cmd.BaseHandshakeCommand('Hello world!', null);
    };

    HandshakeCommand.restart = function (sessionKey) {
        return new ns.dkd.cmd.BaseHandshakeCommand('Hello world!', sessionKey);
    };

    HandshakeCommand.again = function (sessionKey) {
        return new ns.dkd.cmd.BaseHandshakeCommand('DIM?', sessionKey);
    };

    HandshakeCommand.success = function (sessionKey) {
        return new ns.dkd.cmd.BaseHandshakeCommand('DIM!', sessionKey);
    };

    //-------- namespace --------
    ns.protocol.HandshakeCommand = HandshakeCommand;
    ns.protocol.HandshakeState = HandshakeState;

})(DIMP);

(function (ns) {
    'use strict';

    var Class            = ns.type.Class;
    var Command          = ns.protocol.Command;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var HandshakeState   = ns.protocol.HandshakeState;
    var BaseCommand      = ns.dkd.cmd.BaseCommand;

    /**
     *  Create handshake command
     *
     *  Usages:
     *      1. new BaseHandshakeCommand(map);
     *      2. new BaseHandshakeCommand(title, session);
     */
    var BaseHandshakeCommand = function () {
        var title = null;
        var session = null;
        if (arguments.length === 2) {
            // new BaseHandshakeCommand(title, session);
            BaseCommand.call(this, Command.HANDSHAKE);
            title = arguments[0];
            session = arguments[1];
        } else if (typeof arguments[0] === 'string') {
            // new BaseHandshakeCommand(title);
            BaseCommand.call(this, Command.HANDSHAKE);
            title = arguments[0];
        } else {
            // new BaseHandshakeCommand(map);
            BaseCommand.call(this, arguments[0]);
        }
        if (title) {
            this.setValue('title', title);
        }
        if (session) {
            this.setValue('session', session);
        }
    };
    Class(BaseHandshakeCommand, BaseCommand, [HandshakeCommand], {

        // Override
        getTitle: function () {
            return this.getString('title', null);
        },

        // Override
        getSessionKey: function () {
            return this.getString('session', null);
        },

        // Override
        getState: function () {
            return HandshakeState.checkState(this.getTitle(), this.getSessionKey());
        }
    });

    //-------- namespace --------
    ns.dkd.cmd.BaseHandshakeCommand = BaseHandshakeCommand;

})(DIMP);
