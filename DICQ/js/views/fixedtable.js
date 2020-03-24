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

    var View = ns.View;

    var TableView = ns.TableView;

    var IndexPath = ns.IndexPath;

    var FixedTableView = function (table) {
        TableView.call(this, table);

        this.setScrollX(false);
        this.setScrollY(true);

        this.selectedIndex = 0;

        this.dataSource = null;
        this.delegate = null;
    };
    FixedTableView.prototype = Object.create(TableView.prototype);
    FixedTableView.prototype.constructor = FixedTableView;

    FixedTableView.prototype.reloadData = function () {
        // clear table
        this.removeChildren();

        var section_count = this.dataSource.numberOfSections(this);
        var current_section = this.selectedIndex;
        var header, cell;
        var index, indexPath;
        // add sections before
        for (index = 0; index <= current_section; ++index) {
            header = this.delegate.viewForHeaderInSection(index, this);
            this.appendChild(header);
        }
        // add cells in current section
        var tray = new View();
        tray.setClassName('sectionContent');
        var row_count = this.dataSource.numberOfRowsInSection(current_section, this);
        for (index = 0; index < row_count; ++index) {
            indexPath = new IndexPath(current_section, index);
            cell = this.cellForRowAtIndexPath(indexPath, this);
            tray.appendChild(cell);
        }
        this.appendChild(tray);
        // add sections after
        for (index = current_section + 1; index < section_count; ++index) {
            header = this.delegate.viewForHeaderInSection(index, this);
            this.appendChild(header);
        }
        return this;
    };

    //-------- namespace --------
    ns.FixedTableView = FixedTableView;

}(tarsier.ui);
