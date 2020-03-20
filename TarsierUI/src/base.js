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

if (typeof tarsier !== "object") {
    tarsier = {}
}
if (typeof tarsier.ui !== "object") {
    tarsier.ui = {}
}

!function (ns) {
    'use strict';

    var $ = function (node) {
        if (!node) {
            return null;
        }
        // already create?
        if (node.__vc instanceof ns.View) {
            return node.__vc;
        }
        if (node instanceof ns.View) {
            return node;
        }
        // create with element type
        if (node instanceof HTMLDivElement) {
            return new ns.View(node);
        }
        if (node instanceof HTMLSpanElement) {
            return new ns.Label(node);
        }
        if (node instanceof HTMLImageElement) {
            return new ns.Image(node);
        }
        if (node instanceof HTMLButtonElement) {
            return new ns.Button(node);
        }
        if (node instanceof HTMLLinkElement) {
            return new ns.Link(node);
        }
        if (node instanceof HTMLInputElement) {
            return new ns.Input(node);
        }
        if (node instanceof HTMLTextAreaElement) {
            return new ns.TextArea(node);
        }
        if (node instanceof HTMLElement) {
            return new ns.View(node);
        }
        // select by path string
        if (typeof node === 'string') {
            return $(select(node));
        }
        throw TypeError('element error: ' + node);
    };

    var select = function (path) {
        if (path.charAt(0) === '#') {
            return document.getElementById(path.substring(1));
        }
        throw Error('failed to select element: ' + path);
    };

    //-------- namespace --------
    ns.$ = $;

}(tarsier.ui);
