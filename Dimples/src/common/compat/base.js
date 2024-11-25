;
// license: https://mit-license.org
//
//  DBI : Database Interface
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

//! require <dimp.js>
//! require <sdk.js>
//! require <fsm.js>
//! require <startrek.js>
//! require <stargate.js>

(function (ns, fsm, startrek) {
    'use strict';

    //-------- namespace --------
    if (typeof ns.fsm !== 'object') {
        ns.fsm = fsm;
    }
    if (typeof ns.startrek !== 'object') {
        ns.startrek = startrek;
    }

})(DIMP, FiniteStateMachine, StarTrek);

(function (ns, sg) {
    'use strict';

    //-------- namespace --------
    if (typeof ns.dos !== 'object') {
        ns.dos = sg.dos;
    }
    if (typeof ns.lnc !== 'object') {
        ns.lnc = sg.lnc;
    }
    if (typeof ns.network !== 'object') {
        ns.network = sg.network;
    }
    if (typeof ns.ws !== 'object') {
        ns.ws = sg.ws;
    }
    if (typeof ns.mem !== 'object') {
        ns.mem = {};
    }
    if (typeof ns.dbi !== 'object') {
        ns.dbi = {};
    }
    if (typeof ns.group !== 'object') {
        ns.group = {};
    }
    if (typeof ns.database !== 'object') {
        ns.database = {};
    }

})(DIMP, StarGate);
