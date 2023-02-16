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

//! require 'db/*.js'

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;

    var Transmitter = Interface(null, null);

    /**
     *  Send content from sender to receiver with priority
     *
     * @param {ID} sender
     * @param {ID} receiver
     * @param {Content} content
     * @param {int} priority
     * @return {boolean} false on error
     */
    Transmitter.prototype.sendContent = function (sender, receiver, content, priority) {
        throw new Error('NotImplemented');
    };

    Transmitter.prototype.sendInstantMessage = function (iMsg, priority) {
        throw new Error('NotImplemented');
    };

    Transmitter.prototype.sendReliableMessage = function (rMsg, priority) {
        throw new Error('NotImplemented');
    };

    //-------- namespace --------
    ns.network.Transmitter = Transmitter;

})(SECHAT);

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Transmitter = ns.network.Transmitter;

    var Session = Interface(null, [Transmitter]);

    Session.prototype.getDatabase = function () {
        throw new Error('NotImplemented');
    };

    /**
     *  Get remote socket address
     *
     * @return {SocketAddress} host & port
     */
    Session.prototype.getRemoteAddress = function () {
        throw new Error('NotImplemented');
    };

    // session key
    Session.prototype.getKey = function () {
        throw new Error('NotImplemented');
    };

    /**
     *  Update user ID
     *
     * @param {ID} identifier - login user ID
     * @return {boolean} true on changed
     */
    Session.prototype.setIdentifier = function (identifier) {
        throw new Error('NotImplemented');
    };
    Session.prototype.getIdentifier = function () {
        throw new Error('NotImplemented');
    };

    /**
     *  Update active float
     *
     * @param {boolean} active - active flag
     * @param {number} when    - current timestamp (milliseconds)
     * @return {boolean} true on changed
     */
    Session.prototype.setActive = function (active, when) {
        throw new Error('NotImplemented');
    };
    Session.prototype.isActive = function () {
        throw new Error('NotImplemented');
    };

    /**
     *  Pack message into a waiting queue
     *
     * @param {ReliableMessage} rMsg - network message
     * @param {Uint8Array} data      - serialized message
     * @param {number} priority      - smaller is faster
     * @return {boolean} false on error
     */
    Session.prototype.queueMessagePackage = function (rMsg, data, priority) {
        throw new Error('NotImplemented');
    };

    //-------- namespace --------
    ns.network.Session = Session;

})(SECHAT);
