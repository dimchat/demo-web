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

/**
 *  Patch for window.clipboardData
 */
!function (ns) {
    'use strict';

    var clipboardData = ns.clipboardData;

    if (clipboardData) {
        // IE
        return;
    }

    var navigator = ns.navigator;

    var setData = function (format, data) {
        if (navigator.clipboard) {
            if (format === 'text') {
                navigator.clipboard.writeText(data);
            } else {
                throw TypeError('Only support text data to clipboard');
            }
        } else {
            var input = document.createElement('input');
            input.readOnly = true;
            document.body.appendChild(input);
            input.value = data;
            input.setSelectionRange(0, data.length);
            input.focus();
            var ok = document.execCommand('Copy');
            document.body.removeChild(input);
            if (!ok) {
                throw EvalError('Failed to access clipboard!');
            }
        }
    };

    ns.clipboardData = {
        setData: setData
    };


}(window);
