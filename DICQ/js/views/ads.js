
//
//  Advertisement System
//

!function (ns, tui) {
    'use strict';

    var Size = tui.Size;

    var View = tui.View;

    var AdView = function (size) {
        View.call(this);
        this.setClassName('ads');
        // size
        if (arguments.length === 1) {
            if (size instanceof Size) {
                this.setSize(size);
            }
        } else if (arguments.length === 2) {
            size = new Size(arguments[0], arguments[1]);
            this.setSize(size);
        }
    };
    AdView.prototype = Object.create(View.prototype);
    AdView.prototype.constructor = AdView;

    AdView.prototype.setId = function (id) {
        View.prototype.setId.call(this, id);
        // TODO: fetch ad content with id
        this.setText(id + ' placeholder');
    };

    //-------- namespace --------
    ns.AdView = AdView;

}(dicq, tarsier.ui);
