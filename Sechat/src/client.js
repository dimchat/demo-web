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

    var Class = sdk.type.Class;
    var Terminal = sdk.network.Terminal;
    var NotificationCenter = sdk.lnc.NotificationCenter;
    var NotificationNames = ns.NotificationNames;

    var Client = function (facebook, db) {
        Terminal.call(this, facebook, db);
    };
    Class(Client, Terminal, null, {

        // Override
        createPacker: function (facebook, messenger) {
            return new ns.SharedPacker(facebook, messenger);
        },

        // Override
        createProcessor: function (facebook, messenger) {
            return new ns.SharedProcessor(facebook, messenger);
        },
        
        // Override
        createMessenger: function (session, facebook) {
            var shared = ns.GlobalVariable.getInstance();
            var messenger = shared.messenger;
            if (messenger === null) {
                messenger = new ns.SharedMessenger(session, facebook, shared.database);
                shared.messenger = messenger;
            }
            return messenger;
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
            var nc = NotificationCenter.getInstance();
            nc.postNotification(NotificationNames.SessionStateChanged, this, {
                'state': current
            });
        },

        launch: function (options) {

            var host = options['host'];
            var port = options['port'];

            this.connect(host, port);
        }
    });

    //-------- namespace --------
    ns.Client = Client;

})(SECHAT, DIMP);
