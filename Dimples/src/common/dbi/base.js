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

//! require <dimp.js>
//! require <sdk.js>
//! require <fsm.js>
//! require <startrek.js>
//! require <stargate.js>

if (typeof SECHAT !== 'object') {
    SECHAT = DIMP;
}

(function (ns, fsm, startrek) {
    'use strict';

    //-------- namespace --------
    if (typeof ns.fsm !== 'object') {
        ns.fsm = fsm;
    }
    if (typeof ns.startrek !== 'object') {
        ns.startrek = startrek;
    }

})(SECHAT, FiniteStateMachine, StarTrek);

(function (ns, sg) {
    'use strict';

    //-------- namespace --------
    if (typeof ns.dos !== 'object') {
        ns.dos = sg.dos;
    }
    if (typeof ns.cpu !== 'object') {
        ns.lnc = sg.lnc;
    }
    if (typeof ns.cpu !== 'object') {
        ns.network = sg.network;
    }
    if (typeof ns.cpu !== 'object') {
        ns.ws = sg.ws;
    }
    if (typeof ns.db !== 'object') {
        ns.db = {};
    }
    if (typeof ns.mem !== 'object') {
        ns.mem = {};
    }

})(SECHAT, StarGate);

(function (ns, sg) {
    'use strict';

    //-------- namespace --------
    ns.db.LocalStorage = sg.dos.LocalStorage;
    ns.db.SessionStorage = sg.dos.SessionStorage;

})(SECHAT, StarGate);
