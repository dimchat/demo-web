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
(function (ns) {
    'use strict';

    if (ns.clipboardData) {
        // IE
        return;
    }

    var nav_clipboard = ns.navigator ? ns.navigator.clipboard : null;

    var getData;
    if (nav_clipboard) {
        getData = function (format) {
            if (!format || format === 'text' || format === 'Text') {
                return nav_clipboard.readText();
            } else {
                // TODO:
                throw new TypeError('Only support text data from clipboard');
            }
        };
    } else {
        getData = function (format) {
            // TODO:
            return 'Not implemented, format: ' + format;
        };
    }
    getData = null;

    var setData;
    if (nav_clipboard) {
        setData = function (format, data) {
            if (format === 'text' || format === 'Text') {
                // noinspection JSIgnoredPromiseFromCall
                nav_clipboard.writeText(data);
            } else {
                // TODO:
                throw new TypeError('Only support text data to clipboard');
            }
        };
    } else {
        setData = function (format, data) {
            if (format === 'text' || format === 'Text') {
                var input = document.createElement('textarea');
                input.readOnly = true;
                document.body.appendChild(input);
                input.value = data;
                input.setSelectionRange(0, data.length);
                input.focus();
                var ok = document.execCommand('Copy');
                document.body.removeChild(input);
                if (!ok) {
                    throw new EvalError('Failed to access clipboard!');
                }
            } else {
                // TODO:
                throw new TypeError('Only support text data to clipboard');
            }
        };
    }

    // noinspection JSValidateTypes
    /**
     *  Interfaces for clipboard data access
     *
     * @type {DataTransfer}
     */
    ns.clipboardData = {

        /**
         * Returns the specified data. If there is no such data, returns the empty string.
         */
        getData: getData,

        /**
         * Adds the specified data.
         */
        setData: setData,

        /**
         * Removes the data of the specified formats. Removes all data if the argument is omitted.
         */
        clearData: function (format) {
            this.setData(format, '');
        }
    };

})(window);
