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
     *  Account DBI
     *  ~~~~~~~~~~~
     */
    var GroupDBI = Interface(null, null);

    /**
     *  Get founder ID
     *
     * @param {ID} group - group ID
     * @return {ID} group founder
     */
    GroupDBI.prototype.getFounder = function (group) {
        throw new Error('NotImplemented');
    };

    /**
     *  Get owner ID
     *
     * @param {ID} group - group ID
     * @return {ID} group owner
     */
    GroupDBI.prototype.getOwner = function (group) {
        throw new Error('NotImplemented');
    };

    /**
     *  Get member ID list
     *
     * @param {ID} group - group ID
     * @return {ID[]} member ID list
     */
    GroupDBI.prototype.getMembers = function (group) {
        throw new Error('NotImplemented');
    };

    /**
     *  Save member ID list
     *
     * @param {ID} group     - group ID
     * @param {ID[]} members - member ID list
     * @return {boolean} false on error
     */
    GroupDBI.prototype.saveMembers = function (members, group) {
        throw new Error('NotImplemented');
    };

    /**
     *  Get bot ID list
     *
     * @param {ID} group - group ID
     * @return {ID[]} bot ID list
     */
    GroupDBI.prototype.getAssistants = function (group) {
        throw new Error('NotImplemented');
    };

    /**
     *  Save bot ID list
     *
     * @param {ID} group  - group ID
     * @param {ID[]} bots - bot ID list
     * @return {boolean} false on error
     */
    GroupDBI.prototype.saveAssistants = function (bots, group) {
        throw new Error('NotImplemented');
    };

    //-------- namespace --------
    ns.dbi.GroupDBI = GroupDBI;

})(DIMP);
