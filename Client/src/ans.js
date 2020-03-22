;
//! require <dimsdk.js>

!function (ns) {
    'use strict';

    var AddressNameService = ns.AddressNameService;

    var s_ans = null;
    AddressNameService.getInstance = function () {
        if (!s_ans) {
            s_ans = new AddressNameService();
        }
        return s_ans;
    };

    // Overrides
    var getIdentifier = AddressNameService.prototype.getIdentifier;
    AddressNameService.prototype.getIdentifier = function (name) {
        var identifier = getIdentifier.call(this, name);
        if (identifier) {
            return identifier;
        }
        // TODO: load ANS records from database
        return null;
    };

    // Overrides
    AddressNameService.prototype.save = function(name, identifier) {
        if (!this.cache(name, identifier)) {
            return false;
        }
        // TODO: save ANS record into database
        return true;
    };

    //-------- namespace --------
    ns.AddressNameService = AddressNameService;

}(DIMP);
