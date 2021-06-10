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

    var StationDelegate = function () {
    };
    sdk.Interface(StationDelegate, null);

    /**
     *  Received a new data package from the station
     *
     * @param {Uint8Array} data - data package received
     * @param {Station} server - current station
     */
    StationDelegate.prototype.onReceivePackage = function (data, server) {
        console.assert(false, 'implement me!');
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Send data package to station success
     *
     * @param {Uint8Array} data - data package received
     * @param {Station} server - current station
     */
    StationDelegate.prototype.didSendPackage = function (data, server) {
        console.assert(false, 'implement me!');
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Failed to send data package to station
     *
     * @param {Error} error
     * @param {Uint8Array} data - data package received
     * @param {Station} server - current station
     */
    StationDelegate.prototype.didFailToSendPackage = function (error, data, server) {
        console.assert(false, 'implement me!');
    };

    /**
     *  Callback for handshake accepted
     *
     * @param {String} session - new session key
     * @param {Station} server - current station
     */
    StationDelegate.prototype.onHandshakeAccepted = function (session, server) {
        console.assert(false, 'implement me!');
    };

    //-------- namespace --------
    ns.network.StationDelegate = StationDelegate;

    ns.network.registers('StationDelegate');

})(SECHAT, DIMSDK);
