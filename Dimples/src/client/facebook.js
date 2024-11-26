;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
//
//                               Written in 2024 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2024 Albert Moky
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

    var Interface       = ns.type.Interface;
    var Class           = ns.type.Class;
    var EntityType      = ns.protocol.EntityType;
    var ID              = ns.protocol.ID;
    var Bulletin        = ns.protocol.Bulletin;
    var BroadcastHelper = ns.mkm.BroadcastHelper;
    var CommonFacebook  = ns.CommonFacebook;

    var ClientFacebook = function () {
        CommonFacebook.call(this);
    };
    Class(ClientFacebook, CommonFacebook, null, {

        // Override
        saveDocument: function (doc) {
            var ok = CommonFacebook.prototype.saveDocument.call(this, doc);
            if (ok && Interface.conforms(doc, Bulletin)) {
                // check administrators
                var array = doc.getProperty('administrators');
                if (array instanceof Array) {
                    var group = doc.getIdentifier();
                    var admins = ID.convert(array);
                    ok = this.saveAdministrators(admins, group);
                }
            }
            return ok;
        },

        //
        //  GroupDataSource
        //

        // Override
        getFounder: function (group) {
            // check broadcast group
            if (group.isBroadcast()) {
                // founder of broadcast group
                return BroadcastHelper.getBroadcastFounder(group);
            }
            // check bulletin document
            var doc = this.getBulletin(group);
            if (!doc) {
                // the owner(founder) should be set in the bulletin document of group
                return null;
            }
            // check local storage
            var archivist = this.getArchivist();
            var user = archivist.getFounder(group);
            if (user) {
                // got from local storage
                return user;
            }
            // get from bulletin document
            return doc.getFounder();
        },

        // Override
        getOwner: function (group) {
            // check broadcast group
            if (group.isBroadcast()) {
                // owner of broadcast group
                return BroadcastHelper.getBroadcastOwner(group);
            }
            // check bulletin document
            var doc = this.getBulletin(group);
            if (!doc) {
                // the owner(founder) should be set in the bulletin document of group
                return null;
            }
            // check local storage
            var archivist = this.getArchivist();
            var user = archivist.getOwner(group);
            if (user) {
                // got from local storage
                return user;
            }
            // check group type
            if (EntityType.GROUP.equals(group.getType())) {
                // Polylogue owner is its founder
                user = archivist.getFounder(group);
                if (!user) {
                    user = doc.getFounder();
                }
            }
            return user;
        },

        // Override
        getMembers: function (group) {
            var owner = this.getOwner(group);
            if (!owner) {
                // assert(false, 'group owner not found: $group');
                return [];
            }
            // check local storage
            var archivist = this.getArchivist();
            var members = archivist.getMembers(group);
            archivist.checkMembers(group, members);
            if (!members || members.length === 0) {
                members = [owner];
            }
            return members;
        },
        
        // Override
        getAssistants: function (group) {
            // check bulletin document
            var doc = this.getBulletin(group);
            if (!doc) {
                // the assistants should be set in the bulletin document of group
                return [];
            }
            // check local storage
            var archivist = this.getArchivist();
            var bots = archivist.getAssistants(group);
            if (bots && bots.length > 0) {
                // got from local storage
                return bots;
            }
            // get from bulletin document
            bots = doc.getAssistants();
            return !bots ? [] : bots;
        },

        //
        //  Organizational Structure
        //

        getAdministrators: function (group) {
            // check bulletin document
            var doc = this.getBulletin(group);
            if (!doc) {
                // the administrators should be set in the bulletin document
                return [];
            }
            // the 'administrators' should be saved into local storage
            // when the newest bulletin document received,
            // so we must get them from the local storage only,
            // not from the bulletin document.
            var archivist = this.getArchivist();
            return archivist.getAdministrators(group);
        },

        saveAdministrators: function (admins, group) {
            var archivist = this.getArchivist();
            return archivist.saveAdministrators(admins, group);
        },

        saveMembers: function (newMembers, group) {
            var archivist = this.getArchivist();
            return archivist.saveMembers(newMembers, group);
        }
    });

    // TODO: identifier factory for ANS

    //-------- namespace --------
    ns.ClientFacebook = ClientFacebook;

})(DIMP);
