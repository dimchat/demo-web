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

//! require 'gatekeeper.js'

(function (ns, sdk) {
    'use strict';

    var UTF8 = sdk.format.UTF8;
    var Runner = sdk.skywalker.Runner;
    var DockerDelegate = sdk.startrek.port.DockerDelegate;
    var DockerStatus = sdk.startrek.port.DockerStatus;
    var Transmitter = ns.network.Transmitter;
    var MessageWrapper = ns.network.MessageWrapper;

    /**
     *  Create session
     *
     * @param {String} host             - remote host
     * @param {uint} port               - remote port
     * @param {Messenger} transceiver   - messenger
     */
    var BaseSession = function (host, port, transceiver) {
        Runner.call(this);
        this.__keeper = this.createGateKeeper(host, port, transceiver);
    };
    sdk.Class(BaseSession, Runner, [DockerDelegate, Transmitter], null);

    // protected
    BaseSession.prototype.createGateKeeper = function (host, port, messenger) {
        ns.assert(false, "implement me!");
        return null;
    };

    BaseSession.prototype.getMessenger = function () {
        return this.__keeper.getMessenger();
    };

    BaseSession.prototype.isActive = function () {
        return this.__keeper.isActive();
    };
    BaseSession.prototype.setActive = function (active) {
        this.__keeper.setActive(active);
    };

    BaseSession.prototype.getStatus = function () {
        return this.__keeper.getStats();
    };

    BaseSession.prototype.close = function () {
        this.setActive(false);
        // this.__keeper.stop();
    };

    // Override
    BaseSession.prototype.stop = function () {
        Runner.prototype.stop.call(this);
        this.__keeper.stop();
    };

    // Override
    BaseSession.prototype.isRunning = function () {
        var running = Runner.prototype.isRunning.call(this);
        return running && this.__keeper.isRunning();
    };

    // Override
    BaseSession.prototype.setup = function () {
        // FIXME: cache waiting flags
        var waiting1 = Runner.prototype.setup.call(this);
        var waiting2 = this.__keeper.setup();
        return waiting1 || waiting2;
    };

    // Override
    BaseSession.prototype.finish = function () {
        // FIXME: cache waiting flags
        var waiting1 = Runner.prototype.finish.call(this);
        var waiting2 = this.__keeper.finish();
        return waiting1 || waiting2;
    };

    // Override
    BaseSession.prototype.process = function () {
        return this.__keeper.process();
    };

    BaseSession.prototype.sendData = function (payload, priority) {
        if (!this.isActive()) {
            // FIXME: connection lost?
            console.warn('BaseSession::sendData()', this.__keeper.getRemoteAddress());
        }
        console.log('sending ' + payload.length + ' byte(s)');
        return this.__keeper.sendData(payload, priority);
    };

    // Override
    BaseSession.prototype.sendReliableMessage = function (rMsg, priority) {
        if (!this.isActive()) {
            // FIXME: connection lost?
            console.warn('BaseSession::sendReliableMessage()', this.__keeper.getRemoteAddress());
        }
        console.log('sending message to ' + rMsg.getReceiver() + ', priority: ' + priority);
        return this.__keeper.sendReliableMessage(rMsg, priority);
    };

    // Override
    BaseSession.prototype.sendInstantMessage = function (iMsg, priority) {
        if (!this.isActive()) {
            // FIXME: connection lost?
            console.warn('BaseSession::sendInstantMessage()', this.__keeper.getRemoteAddress());
        }
        console.log('sending message to ' + iMsg.getReceiver() + ', priority: ' + priority);
        return this.__keeper.sendInstantMessage(iMsg, priority);
    };

    // Override
    BaseSession.prototype.sendContent = function (sender, receiver, content, priority) {
        if (!this.isActive()) {
            // FIXME: connection lost?
            console.warn('BaseSession::sendContent()', this.__keeper.getRemoteAddress());
        }
        console.log('sending content to ' + receiver + ', priority: ' + priority);
        return this.__keeper.sendContent(sender, receiver, content, priority);
    };

    //
    //  Docker Delegate
    //

    // Override
    BaseSession.prototype.onDockerStatusChanged = function (previous, current, docker) {
        if (!current || current.equals(DockerStatus.ERROR)) {
            this.setActive(false);
            // this.close();
        } else if (current.equals(DockerStatus.READY)) {
            var messenger = this.getMessenger();
            messenger.onConnected();
        }
    };

    var split_lines = function (data) {
        if (data.indexOf(LINEFEED) < 0) {
            // only one line
            return [data];
        }
        var str = UTF8.decode(data);
        var array = str.split('\n');
        var lines = [];
        for (var i = 0; i < array.length; ++i) {
            lines.push(UTF8.encode(array[i]));
        }
        return lines;
    };
    var join_lines = function (responses) {
        if (responses.length === 1) {
            // only one line
            return responses[0];
        }
        var str = UTF8.decode(responses[0]);
        for (var i = 1; i < responses.length; ++i) {
            str += '\n' + UTF8.decode(responses[i]);
        }
        return UTF8.encode(str);
    };
    var LINEFEED = '\n'.charCodeAt(0);  // 10
    var BRACE = '{'.charCodeAt(0);     // 123

    // Override
    BaseSession.prototype.onDockerReceived = function (arrival, docker) {
        var payload = arrival.getPackage();
        console.log('BaseSession::onDockerReceived()', payload);
        // 1. split data when multi packages received in one time
        var packages;
        if (!payload || payload.length === 0) {
            packages = [];
        } else if (payload[0] === BRACE) {
            packages = split_lines(payload);
        } else {
            packages = [payload];
        }
        var pack;
        // 2. process package data one by one
        var messenger = this.getMessenger();
        var responses, buffer;
        for (var i = 0; i < packages.length; ++i) {
            pack = packages[i];
            try {
                responses = messenger.processPackage(pack);
            } catch (e) {
                console.error('BaseSession::onDockerReceived()', e);
                continue;
            }
            if (!responses || responses.length === 0) {
                continue;
            }
            // combine & respond
            buffer = join_lines(responses);
            this.__keeper.sendData(buffer, 1);  // SLOWER
        }
    };

    // Override
    BaseSession.prototype.onDockerSent = function (departure, docker) {
        if (departure instanceof MessageWrapper) {
            departure.onSent(docker);
        }
    };

    // Override
    BaseSession.prototype.onDockerFailed = function (error, departure, docker) {
        if (departure instanceof MessageWrapper) {
            departure.onFailed(error, docker);
        }
    };

    // Override
    BaseSession.prototype.onDockerError = function (error, departure, docker) {
        console.error('BaseSession::onDockerError()', error, departure, docker);
    };

    //-------- namespace --------
    ns.network.BaseSession = BaseSession;

    ns.network.registers('BaseSession');

})(SECHAT, DIMSDK);
