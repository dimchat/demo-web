;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
//
//                               Written in 2021 by Moky <albert.moky@gmail.com>
//
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

//! require <dimsdk.js>

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;

    var Transmitter = Interface(null, null);

    /**
     *  Send content from sender to receiver with priority
     *
     * @param {Content} content - message content
     * @param {ID} sender       - from where, null for current user
     * @param {ID} receiver     - to where
     * @param {int} priority    - smaller is faster
     * @return {[InstantMessage, ReliableMessage]} (iMsg, None) on error
     */
    Transmitter.prototype.sendContent = function (content, sender, receiver, priority) {};

    /**
     *  Send instant message with priority
     *
     * @param {InstantMessage} iMsg - plain message
     * @param {int} priority        - smaller is faster
     * @return {ReliableMessage} null on error
     */
    Transmitter.prototype.sendInstantMessage = function (iMsg, priority) {};

    /**
     *  Send reliable message with priority
     *
     * @param {ReliableMessage} rMsg - encrypted & signed message
     * @param {int} priority         - smaller is faster
     * @return {boolean} false on error
     */
    Transmitter.prototype.sendReliableMessage = function (rMsg, priority) {};

    var Session = Interface(null, [Transmitter]);

    Session.prototype.getDatabase = function () {};  // SessionDBI

    Session.prototype.getRemoteAddress = function () {};  // SocketAddress

    Session.prototype.getSessionKey = function () {};  // String

    /**
     *  Update user ID
     *
     * @param {ID} user - login user ID
     * @return {boolean} true on changed
     */
    Session.prototype.setIdentifier = function (user) {};
    Session.prototype.getIdentifier = function () {};

    /**
     *  Update active flag
     *
     * @param {boolean} flag
     * @param {Date} when
     * @return {boolean} true on changed
     */
    Session.prototype.setActive = function (flag, when) {};
    Session.prototype.isActive = function () {};

    /**
     *  Pack message into a waiting queue
     *
     * @param {ReliableMessage} rMsg - network message
     * @param {Uint8Array} data      - serialized message
     * @param {int} priority         - smaller is faster
     * @return {boolean} false on error
     */
    Session.prototype.queueMessagePackage = function (rMsg, data, priority) {};

    //-------- namespace --------
    ns.network.Transmitter = Transmitter;
    ns.network.Session     = Session;

})(DIMP);
