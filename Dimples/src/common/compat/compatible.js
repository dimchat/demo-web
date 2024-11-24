;
// license: https://mit-license.org
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

//! require <dimp.js>

(function (ns) {
    'use strict';

    var Interface      = ns.type.Interface;
    var Command        = ns.protocol.Command;
    var MetaCommand    = ns.protocol.MetaCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;

    var fixMetaAttachment = function (rMsg) {
        var meta = rMsg.getValue('meta');
        if (meta) {
            fixMetaVersion(meta);
        }
    };

    var fixMetaVersion = function (meta) {
        var version = meta['version'];
        if (!version) {
            meta['version'] = meta['type'];
        } else if (!meta['type']) {
            meta['type'] = version;
        }
    };

    var fixCommand = function (content) {
        // 1. fix 'cmd'
        content = fixCmd(content);
        // 2. fix other commands
        if (Interface.conforms(content, MetaCommand)) {
            var meta = content.getValue('meta');
            if (meta) {
                fixMetaVersion(meta);
            }
        } else if (Interface.conforms(content, ReceiptCommand)) {
            fixReceiptCommand(content);
        }
        // OK
        return content;
    };

    var fixCmd = function (content) {
        var cmd = content.getString('cmd', null);
        if (!cmd || cmd.length === 0) {
            cmd = content.getString('command', cmd);
            content.setValue('cmd', cmd);
        } else if (!content.getValue('command')) {
            content.setValue('command', cmd);
            content = Command.parse(content.toMap());
        }
        return content;
    };

    var fixReceiptCommand = function (content) {
        // TODO: check for v2.0
    };

    //-------- namespace --------
    ns.Compatible = {
        fixMetaAttachment: fixMetaAttachment,
        fixMetaVersion: fixMetaVersion,
        fixCommand: fixCommand,
        fixCmd: fixCmd,
        fixReceiptCommand: fixReceiptCommand
    };

})(DIMP);
