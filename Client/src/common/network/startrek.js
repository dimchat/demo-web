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

//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var ActiveConnection = sdk.stargate.ActiveConnection;

    var StarLink = function (host, port) {
        ActiveConnection.call(this, host, port);
        this.__outgo_packages = [];
    };
    sdk.Class(StarLink, ActiveConnection, null);

    StarLink.prototype.send = function (data) {
        this.__outgo_packages.push(data);
        return data.length;
    };

    var next = function () {
        if (this.__outgo_packages.length > 0) {
            return this.__outgo_packages.shift();
        } else {
            return null;
        }
    };

    StarLink.prototype.process = function () {
        var ok = ActiveConnection.prototype.process.call(this);
        var data = next.call(this);
        if (data) {
            if (ActiveConnection.prototype.send.call(this, data)) {
                ok = true;
            }
        }
        return ok;
    };

    //-------- namespace --------
    ns.network.StarLink = StarLink;

    ns.network.registers('StarLink');

})(SECHAT, DIMSDK);

(function (ns, sdk) {
    'use strict';

    var WSGate = sdk.stargate.WSGate;
    var StarLink = ns.network.StarLink;

    var StarTrek = function (connection) {
        WSGate.call(this, connection);
    };
    sdk.Class(StarTrek, WSGate, null);

    StarTrek.createGate = function (host, port) {
        var conn = new StarLink(host, port);
        var gate = new StarTrek(conn);
        conn.setDelegate(gate);
        gate.start();
        return gate;
    };

    StarTrek.prototype.start = function () {
        this.connection.start();
        WSGate.prototype.start.call(this);
    };

    StarTrek.prototype.finish = function () {
        WSGate.prototype.finish.call(this);
        this.connection.stop();
    };

    //-------- namespace --------
    ns.network.StarTrek = StarTrek;

    ns.network.registers('StarTrek');

})(SECHAT, DIMSDK);
