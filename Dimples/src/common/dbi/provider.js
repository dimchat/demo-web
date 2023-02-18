;
// license: https://mit-license.org
//
//  DBI : Database Interface
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

//! require 'base.js'

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;

    /**
     *  Session DBI
     *  ~~~~~~~~~~~
     */
    var ProviderDBI = Interface(null, null);

    /**
     *  Get all neighbor stations
     *
     * @return {Dictionary<string, number, ID>[]} a set of (host, port, ID)
     */
    ProviderDBI.prototype.allNeighbors = function () {
        throw new Error('NotImplemented');
    };

    /**
     *  Get neighbor station ID
     *
     * @param {string} ip   - station host
     * @param {number} port - station port
     * @return {ID} station ID
     */
    ProviderDBI.prototype.getNeighbor = function (ip, port) {
        throw new Error('NotImplemented');
    };

    /**
     *  Save station info
     *
     * @param {string} ip     - station host
     * @param {number} port   - station port
     * @param {ID} identifier - station ID
     * @return {boolean} false on error
     */
    ProviderDBI.prototype.addNeighbor = function (ip, port, identifier) {
        throw new Error('NotImplemented');
    };

    /**
     *  Delete station info
     *
     * @param {string} ip     - station host
     * @param {number} port   - station port
     * @return {boolean} false on error
     */
    ProviderDBI.prototype.removeNeighbor = function (ip, port) {
        throw new Error('NotImplemented');
    };

    //-------- namespace --------
    ns.dbi.ProviderDBI = ProviderDBI;

})(DIMP);
