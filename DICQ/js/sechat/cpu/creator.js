;
// license: https://mit-license.org
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

//! require 'default.js'
//! require 'mute.js'
//! require 'block.js'
//! require 'search.js'
//! require 'storage.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;

    var Command      = ns.protocol.Command;

    var ClientContentProcessorCreator = ns.cpu.ClientContentProcessorCreator;
    var AnyContentProcessor     = ns.cpu.AnyContentProcessor;
    var MuteCommandProcessor    = ns.cpu.MuteCommandProcessor;
    var BlockCommandProcessor   = ns.cpu.BlockCommandProcessor;
    var StorageCommandProcessor = ns.cpu.StorageCommandProcessor;
    var SearchCommandProcessor  = ns.cpu.SearchCommandProcessor;

    var ClientProcessorCreator = function (facebook, messenger) {
        ClientContentProcessorCreator.call(this, facebook, messenger);
    };
    Class(ClientProcessorCreator, ClientContentProcessorCreator, null, {

        // Override
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            // application customized

            // default
            if (type === 0) {
                // unknown type?
                return new AnyContentProcessor(facebook, messenger);
            }
            // others
            return ClientContentProcessorCreator.prototype.createContentProcessor.call(this, type);
        },

        // Override
        createCommandProcessor: function (type, cmd) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            switch (cmd) {
                // mute
                case Command.MUTE:
                    return new MuteCommandProcessor(facebook, messenger);
                // block
                case Command.BLOCK:
                    return new BlockCommandProcessor(facebook, messenger);
                // search (users)
                case Command.SEARCH:
                case Command.ONLINE_USERS:
                    return new SearchCommandProcessor(facebook, messenger);
                // storage (contacts, private_key)
                case Command.STORAGE:
                case Command.CONTACTS:
                case Command.PRIVATE_KEY:
                    return new StorageCommandProcessor(facebook, messenger);
            }

            // others
            return ClientContentProcessorCreator.prototype.createCommandProcessor.call(this, type, cmd);
        }
    });

    //-------- namespace --------
    ns.cpu.ClientProcessorCreator = ClientProcessorCreator;

})(DIMP);
