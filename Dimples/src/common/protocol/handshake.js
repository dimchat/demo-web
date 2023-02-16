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
    var Enum = ns.type.Enum;
    var Command = ns.protocol.Command;

    var HandshakeState = Enum(null, {
        START:   0, // C -> S, without session key(or session expired)
        AGAIN:   1, // S -> C, with new session key
        RESTART: 2, // C -> S, with new session key
        SUCCESS: 3  // S -> C, handshake accepted
    });

    Command.HANDSHAKE = 'handshake';

    /**
     *  Handshake command message: {
     *      type : 0x88,
     *      sn   : 123,
     *
     *      cmd     : "handshake",    // command name
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
    HandshakeCommand.prototype.getTitle = function () {
        throw new Error('NotImplemented');
    };

    /**
     *  Get session key
     *
     * @returns {string}
     */
    HandshakeCommand.prototype.getSessionKey = function () {
        throw new Error('NotImplemented');
    };

    /**
     *  Get handshake state
     *
     * @return {HandshakeState}
     */
    HandshakeCommand.prototype.getState = function () {
        throw new Error('NotImplemented');
    };

    //-------- namespace --------
    ns.protocol.HandshakeCommand = HandshakeCommand;
    ns.protocol.HandshakeState = HandshakeState;

})(DIMP);

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Command = ns.protocol.Command;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var HandshakeState = ns.protocol.HandshakeState;
    var BaseCommand = ns.dkd.cmd.BaseCommand;

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
            return this.getString('title');
        },

        // Override
        getSessionKey: function () {
            return this.getString('session');
        },

        // Override
        getState: function () {
            return get_state(this.getTitle(), this.getSessionKey());
        }
    });

    var get_state = function (text, session) {
        if (text === SUCCESS_MESSAGE/* || text === 'OK!'*/) {
            return HandshakeState.SUCCESS;
        } else if (text === AGAIN_MESSAGE) {
            return HandshakeState.AGAIN;
            //} else if (text !== START_MESSAGE) {
            //    // error!
            //    return HandshakeState.INIT;
        } else if (session) {
            return HandshakeState.RESTART;
        } else {
            return HandshakeState.START;
        }
    };
    var START_MESSAGE = 'Hello world!';
    var AGAIN_MESSAGE = 'DIM?';
    var SUCCESS_MESSAGE = 'DIM!';

    //
    //  Factories
    //

    HandshakeCommand.start = function () {
        return new BaseHandshakeCommand(START_MESSAGE, null);
    };
    HandshakeCommand.restart = function (session) {
        return new BaseHandshakeCommand(START_MESSAGE, session);
    };
    HandshakeCommand.again = function (session) {
        return new BaseHandshakeCommand(AGAIN_MESSAGE, session);
    };
    HandshakeCommand.success = function () {
        return new BaseHandshakeCommand(SUCCESS_MESSAGE, null);
    };

    //-------- namespace --------
    ns.dkd.cmd.HandshakeCommand = BaseHandshakeCommand;

})(DIMP);
