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

//!require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var Interface        = sdk.type.Interface;
    var Class            = sdk.type.Class;
    var ID               = sdk.protocol.ID;
    var Document         = sdk.protocol.Document;
    var Visa             = sdk.protocol.Visa;
    var Command          = sdk.protocol.Command;
    var HandshakeCommand = sdk.protocol.HandshakeCommand;
    var SearchCommand    = sdk.protocol.SearchCommand;
    var ClientMessenger  = sdk.ClientMessenger;

    var SharedMessenger = function (session, facebook, db) {
        ClientMessenger.call(this, session, facebook, db);
    };
    Class(SharedMessenger, ClientMessenger, null, {

        // Override
        encryptKey: function (keyData, receiver, iMsg) {
            try {
                return ClientMessenger.prototype.encryptKey.call(this, keyData, receiver, iMsg);
            } catch (e) {
                console.error('failed to encrypt key for receiver', receiver, e);
                return null;
            }
        },

        // Override
        deserializeContent: function (data, password, sMsg) {
            var content = ClientMessenger.prototype.deserializeContent.call(this, data, password, sMsg);
            if (Interface.conforms(content, Command)) {
                // get client IP from handshake response
                if (Interface.conforms(content, HandshakeCommand)) {
                    var remote = content.getValue('remote_address');
                    console.warn('socket address', remote);
                }
            }
            return content;
        },

        // // Override
        // verifyMessage: function (rMsg) {
        //     // TODO: handling blocked-list here
        //     return ClientMessenger.prototype.verifyMessage.call(this, rMsg);
        // },

        // // Override
        // sendContent: function (content, sender, receiver, priority) {
        //     // TODO: check receiver for ANS
        //     return ClientMessenger.prototype.sendContent.call(this, content, sender, receiver, priority);
        // },

        // Override
        sendInstantMessage: function (iMsg, priority) {
            var rMsg;
            try {
                rMsg = ClientMessenger.prototype.sendInstantMessage.call(this, iMsg, priority);
            } catch (e) {
                console.error('failed to send message', iMsg, e);
            }
            if (rMsg) {
                // keep signature for checking traces
                var signature = rMsg.getString('signature', null);
                iMsg.setValue('signature', signature);
            }
            return rMsg;
        },

        // Override
        handshake: function (sessionKey) {
            if (!sessionKey || sessionKey.length === 0) {
                // first handshake, update visa document first
                console.info('update visa for first handshake');
                this.updateVisa();
            } else if (this.getSession().getSessionKey() === sessionKey) {
                console.warn('duplicated session key', sessionKey);
            }
            return ClientMessenger.prototype.handshake.call(this, sessionKey);
        },

        updateVisa: function () {
            var facebook = this.getFacebook();
            var user = facebook.getCurrentUser();
            if (!user) {
                console.error('current user not found');
                return false;
            }
            // 1. get sign key for current user
            var sKey = facebook.getPrivateKeyForVisaSignature(user.getIdentifier());
            if (!sKey) {
                console.error('private key not found', user);
                return false;
            }
            // 2. get visa document for current user
            var visa = user.getVisa();
            if (!visa) {
                // FIXME: query from station or create a new one?
                console.error('user error', user);
                return false;
            } else {
                // clone for modifying
                var doc = Document.parse(visa.copyMap(false));
                if (Interface.conforms(doc, Visa)) {
                    visa = doc;
                } else {
                    console.error('visa error: $visa', visa);
                    return false;
                }
            }
            // 3. update visa document
            visa.setProperty('app', this.getAppInfo(visa));
            visa.setProperty('sys', this.getDeviceInfo(visa));
            // 4. sign it
            var sig = visa.sign(sKey);
            if (!sig) {
                console.error('failed to sign visa', visa, sKey);
                return false;
            }
            // 5. save it
            var ok = facebook.saveDocument(visa);
            if (ok) {
                console.info('visa updated', visa);
            } else {
                console.error('failed to save visa', visa);
            }
            return ok;
        },

        // private
        getAppInfo: function (visa) {
            var info = visa.getProperty('app');
            if (!info) {
                info = {};
            } else if (typeof info === 'string') {
                info = {
                    'app': info
                };
            }
            info['id'] = 'chat.dim.web';
            info['name'] = 'WebChat';
            info['version'] = '2.0.0';
            // ...
            return info;
        },
        // private
        getDeviceInfo: function (visa) {
            var info = visa.getProperty('sys');
            if (!info) {
                info = {};
            } else if (typeof info === 'string') {
                info = {
                    'sys': info
                };
            }
            info['os'] = 'WebBrowser';
            // ...
            return info;
        },

        // Override
        handshakeSuccess: function () {
            // 1. broadcast current documents after handshake success
            try {
                ClientMessenger.prototype.handshakeSuccess.call(this);
            } catch (e) {
                console.error('failed to broadcast document', e);
            }
            var facebook = this.getFacebook();
            var user = facebook.getCurrentUser();
            if (!user) {
                console.error('failed to get current user');
                return;
            }
            // 2. broadcast login command with current station info
            try {
                var userAgent = 'Web Browser';  // TODO:
                this.broadcastLogin(user.getIdentifier(), userAgent);
            } catch (e) {
                console.error('failed to broadcast login command')
            }
            // 3. broadcast block/mute list
            // 4. report station speeds to master after tested speeds
        },

        reportSpeeds: function (meters, provider) {
            // TODO:
        },

        /**
         *  Send 'search' command to the SearchEngine
         *
         * @param {string} keywords - keyword separated with empty space
         * @return {boolean} false on error
         */
        search: function (keywords) {
            var content = SearchCommand.fromKeywords(keywords);
            var SE = ID.parse('archivist@anywhere');
            return this.sendContent(content, null, SE, 0);
        }
    });

    //-------- namespace --------
    ns.SharedMessenger = SharedMessenger;

})(SECHAT, DIMP);
