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

    var HandshakeState = ns.type.Enum(null, {
        INIT:    0,
        START:   1, // C -> S, without session key(or session expired)
        AGAIN:   2, // S -> C, with new session key
        RESTART: 3, // C -> S, with new session key
        SUCCESS: 4  // S -> C, handshake accepted
    });

    var Command = ns.protocol.Command;

    /**
     *  Command message: {
     *      type : 0x88,
     *      sn   : 123,
     *
     *      command : "handshake",    // command name
     *      message : "Hello world!",
     *      session : "{SESSION_KEY}" // session key
     *  }
     */
    var HandshakeCommand = function () {};
    ns.Interface(HandshakeCommand, [Command]);

    /**
     *  Get text
     *
     * @returns {String}
     */
    HandshakeCommand.prototype.getMessage = function () {
        ns.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Get session key
     *
     * @returns {String}
     */
    HandshakeCommand.prototype.getSessionKey = function () {
        ns.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Get handshake state
     *
     * @return {HandshakeState}
     */
    HandshakeCommand.prototype.getState = function () {
        ns.assert(false, 'implement me!');
        return null;
    };

    //-------- namespace --------
    ns.protocol.HandshakeCommand = HandshakeCommand;
    ns.protocol.HandshakeState = HandshakeState;

    ns.protocol.registers('HandshakeCommand');
    ns.protocol.registers('HandshakeState');

})(DIMSDK);

(function (ns) {
    'use strict';

    var Command = ns.protocol.Command;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var HandshakeState = ns.protocol.HandshakeState;
    var BaseCommand = ns.dkd.BaseCommand;

    var START_MESSAGE = 'Hello world!';
    var AGAIN_MESSAGE = 'DIM?';
    var SUCCESS_MESSAGE = 'DIM!';

    var get_state = function (text, session) {
        if (text === SUCCESS_MESSAGE || text === 'OK!') {
            return HandshakeState.SUCCESS;
        } else if (text === AGAIN_MESSAGE) {
            return HandshakeState.AGAIN;
        } else if (text !== START_MESSAGE) {
            // error!
            return HandshakeState.INIT;
        } else if (session) {
            return HandshakeState.RESTART;
        } else {
            return HandshakeState.START;
        }
    };

    /**
     *  Create handshake command
     *
     *  Usages:
     *      1. new BaseHandshakeCommand(map);
     *      2. new BaseHandshakeCommand(text, session);
     */
    var BaseHandshakeCommand = function () {
        if (arguments.length === 1) {
            // new BaseHandshakeCommand(map);
            BaseCommand.call(this, arguments[0]);
        } else if (arguments.length === 2) {
            // new BaseHandshakeCommand(text, session);
            BaseCommand.call(this, Command.HANDSHAKE);
            // message text
            var text = arguments[0];
            if (text) {
                this.setValue('message', text);
            } else {
                this.setValue('message', START_MESSAGE);
            }
            // session key
            var session = arguments[1];
            if (session) {
                this.setValue('session', session);
            }
        }
    };
    ns.Class(BaseHandshakeCommand, BaseCommand, [HandshakeCommand], {

        // Override
        getMessage: function () {
            return this.getValue('message');
        },

        // Override
        getSessionKey: function () {
            return this.getValue('session');
        },

        // Override
        getState: function () {
            return get_state(this.getMessage(), this.getSessionKey());
        }
    });

    //
    //  Factories
    //

    HandshakeCommand.start = function () {
        return new BaseHandshakeCommand(null, null);
    };
    HandshakeCommand.restart = function (session) {
        return new BaseHandshakeCommand(null, session);
    };
    HandshakeCommand.again = function (session) {
        return new BaseHandshakeCommand(AGAIN_MESSAGE, session);
    };
    HandshakeCommand.success = function () {
        return new BaseHandshakeCommand(SUCCESS_MESSAGE, null);
    };

    //-------- namespace --------
    ns.dkd.BaseHandshakeCommand = BaseHandshakeCommand;

    ns.dkd.registers('BaseHandshakeCommand');

})(DIMSDK);
