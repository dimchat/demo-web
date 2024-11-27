;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2023 Albert Moky
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

//!require 'compatible.js'

(function (ns, sdk) {
    'use strict';

    var Class              = sdk.type.Class;
    var Terminal           = sdk.network.Terminal;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    var SessionStateOrder  = sdk.network.SessionStateOrder;
    var NotificationNames  = ns.NotificationNames;

    var Client = function (facebook, sdb) {
        Terminal.call(this, facebook, sdb);
    };
    Class(Client, Terminal, null, {

        //
        //  Session State
        //
        getSessionState: function () {
            var session = this.getSession();
            return !session ? null : session.getState();
        },
        getSessionStateOrder: function () {
            var state = this.getSessionState();
            if (state) {
                return state.getIndex();
            }
            return SessionStateOrder.DEFAULT.getValue();
        },
        getSessionStateText: function () {
            var order = this.getSessionStateOrder();
            if (SessionStateOrder.DEFAULT.equals(order)) {
                return 'Waiting';  // waiting to connect
            } else if (SessionStateOrder.CONNECTING.equals(order)) {
                return 'Connecting';
            } else if (SessionStateOrder.CONNECTED.equals(order)) {
                return 'Connected';
            } else if (SessionStateOrder.HANDSHAKING.equals(order)) {
                return 'Handshaking';
            } else if (SessionStateOrder.RUNNING.equals(order)) {
                return null;  // normal running
            } else {
                this.reconnect();
                return 'Disconnected';  // error
            }
        },

        reconnect: function () {
            // FIXME: test
            return this.connect('106.52.25.169', 9394);    // gz-169
            return this.connect('170.106.141.194', 9394);  // ca-194
            return this.connect('129.226.12.4', 9394);     // hk-4

            var station = this.getNeighborStation();
            if (!station) {
                console.error('failed to get neighbor station');
                return null;
            }
            console.warn('connecting to station', station);
            return this.connect(station.getHost(), station.getPort());
        },

        // // Override
        // createSession: function (station) {
        //     var db = ns.GlobalVariable.getDatabase();
        //     var session = new sdk.ClientSession(db, station);
        //     session.start(this);
        //     return session;
        // },

        // Override
        createMessenger: function (session, facebook) {
            ns.GlobalVariable.setSession(session);
            return ns.GlobalVariable.getMessenger();
        },

        // Override
        createPacker: function (facebook, messenger) {
            return new ns.SharedPacker(facebook, messenger);
        },

        // Override
        createProcessor: function (facebook, messenger) {
            return new ns.SharedProcessor(facebook, messenger);
        },

        //
        //  FSM Delegate
        //

        exitState: function (previous, machine) {
            Terminal.prototype.exitState.call(this, previous, machine);
            // called after state changed
            var current = machine.getCurrentState();
            console.info('session state changed', previous, current);
            if (!current) {
                return;
            }
            post_notification(NotificationNames.SessionStateChanged, this, {
                'previous': previous,
                'current': current,
                'state': current
            });
        },

        launch: function (options) {

            var host = options['host'];
            var port = options['port'];

            this.connect(host, port);
        }
    });

    var post_notification = function (name, sender, userInfo) {
        var nc = NotificationCenter.getInstance();
        // nc.postNotification(name, sender, userInfo);
        nc.postNotification(new sdk.lnc.Notification(name, sender, userInfo));
    };

    //-------- namespace --------
    ns.Client = Client;

})(SECHAT, DIMP);
