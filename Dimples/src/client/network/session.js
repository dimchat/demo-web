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

//! require 'common/*.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Thread = ns.fsm.threading.Thread;
    var DockerStatus = ns.startrek.port.DockerStatus;
    var BaseSession = ns.network.BaseSession;

    var ClientSession = function (server, db) {
        BaseSession.call(this, server.getHost(), server.getPort(), db);
        this.__station = server;
        this.__key = null;     // session key
        this.__thread = null;  // Thread
    };
    Class(ClientSession, BaseSession, null, {

        // Override
        setup: function () {
            this.setActive(true, 0);
            return BaseSession.prototype.setup.call(this);
        },

        // Override
        finish: function () {
            this.setActive(false, 0);
            return BaseSession.prototype.finish.call(this);
        },


        // Override
        onDockerStatusChanged: function (previous, current, docker) {
            //BaseSession.prototype.onDockerStatusChanged.call(this, previous, current, docker);
            if (!current || DockerStatus.ERROR.equals(current)) {
                // connection error or session finished
                // TODO: reconnect?
                this.setActive(false, 0);
                // TODO: clear session ID and handshake again
            } else if (DockerStatus.READY.equals(current)) {
                // connected/reconnected
                this.setActive(true, 0);
            }
        },

        // Override
        onDockerReceived: function (arrival, docker) {
            //BaseSession.prototype.onDockerReceived.call(this, arrival, docker);
            var all_responses = [];
            var messenger = this.getMessenger();
            // 1. get data packages from arrival ship's payload
            var packages = get_data_packages(arrival);
            var pack;
            var responses;
            var res;
            for (var i = 0; i < packages.length; ++i) {
                pack = packages[i];
                try {
                    // 2. process each data package
                    responses = messenger.processPackage(pack);
                    if (responses === null) {
                        continue;
                    }
                    for (var j = 0; j < responses.length; ++j) {
                        res = responses[j];
                        if (!res || res.length === 0) {
                            // should not happen
                            continue;
                        }
                        all_responses.push(res);
                    }
                } catch (e) {
                    console.error('ClientSession::onDockerReceived()', e, pack);
                }
            }
            var gate = this.getGate();
            var source = docker.getRemoteAddress();
            var destination = docker.getLocalUsers();
            // 3. send responses separately
            for (var k = 0; i < all_responses.length; ++k) {
                gate.sendMessage(all_responses[k], source, destination);
            }
        }
    });

    ClientSession.prototype.getStatus = function () {
        return this.__station;
    };

    // Override
    ClientSession.prototype.getKey = function () {
        return this.__key;
    };

    ClientSession.prototype.setKey = function (sessionKey) {
        this.__key = sessionKey;
    };

    ClientSession.prototype.start = function () {
        force_stop.call(this);
        var thread = new Thread(this);
        thread.start();
        this.__thread = thread;
    };
    // Override
    ClientSession.prototype.stop = function () {
        //GateKeeper.prototype.stop.call(this);
        BaseSession.prototype.stop.call(this);
        force_stop.call(this);
    };
    var force_stop = function () {
        var thread = this.__thread;
        if (thread) {
            this.__thread = null;
            thread.stop();
        }
    };

    var get_data_packages = function (arrival) {
        var payload = arrival.getPackage();
        // check payload
        if (!payload || payload.length === 0) {
            return [];
        } else if (payload[0] === '{'.charCodeAt(0)) {
            // JsON in lines
            return payload.split('\n'.charCodeAt(0));
        } else {
            // TODO: other format?
            return [payload];
        }
    };

    //-------- namespace --------
    ns.network.ClientSession = ClientSession;

})(DIMP);
