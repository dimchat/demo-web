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

    var Interface = sdk.type.Interface;
    var Command = sdk.protocol.Command;
    var ReceiptCommand = sdk.protocol.ReceiptCommand;
    var MetaCommand = sdk.protocol.MetaCommand;

    ns.Compatible = {

        fixMetaAttachment: function (rMsg) {
            var meta = rMsg.getValue('meta');
            if (meta) {
                this.fixMetaVersion(meta);
            }
        },
        fixMetaVersion: function (meta) {
            var version = meta['version'];
            if (!version) {
                meta['version'] = meta['type'];
            } else if (!meta['type']) {
                meta['type'] = version;
            }
        },

        fixCommand: function (command) {
            // 1. fix 'cmd'
            command = this.fixCmd(command);
            // 2. fix other commands
            if (Interface.conforms(command, ReceiptCommand)) {
                this.fixReceiptCommand(command);
            } else if (Interface.conforms(command, MetaCommand)) {
                var meta = command.getValue('meta');
                if (meta) {
                    this.fixMetaVersion(meta);
                }
            }
            // OK
            return command;
        },
        fixCmd: function (command) {
            var cmd = command.getValue('cmd');
            if (!cmd) {
                // copy 'command' to 'cmd' and recreate it
                cmd = command.getValue('command');
                command.setValue('cmd', cmd);
                command = Command.parse(command.toMap());
            } else if (!command.getValue('command')) {
                command.setValue('command', cmd);
            }
            return command;
        },
        fixReceiptCommand: function (command) {
            // TODO:
        }
    };

})(SECHAT, DIMP);
