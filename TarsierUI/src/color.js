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

!function (ns) {
    'use strict';

    var Color = function (color) {
        if (arguments.length === 3) {
            this.r = arguments[0];
            this.g = arguments[1];
            this.b = arguments[2];
        } else {
            this.r = color.r;
            this.g = color.g;
            this.b = color.b;
        }
    };

    var hex_chars = "0123456789ABCDEF";
    Color.prototype.toString = function () {
        var string = '#';
        string += hex_chars[this.r >> 4];
        string += hex_chars[this.r & 15];
        string += hex_chars[this.g >> 4];
        string += hex_chars[this.g & 15];
        string += hex_chars[this.b >> 4];
        string += hex_chars[this.b & 15];
        return string;
    };

    Color.Red = new Color(0xFF, 0, 0);
    Color.Green = new Color(0, 0xFF, 0);
    Color.Blue = new Color(0, 0, 0xFF);

    Color.White = new Color(0xFF, 0xFF, 0xFF);
    Color.Black = new Color(0, 0, 0);

    Color.Gray = new Color(0x77, 0x77, 0x77);
    Color.LightGray = new Color(0xDD, 0xDD, 0xDD);
    Color.DarkGray = new Color(0x33, 0x33, 0x33);

    //-------- namespace --------
    ns.Color = Color;

}(tarsier.ui);
