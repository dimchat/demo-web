
//! require <sdk/all.js>

!function (ns) {

    var AddressNameService = ns.AddressNameService;

    var s_ans = null;
    AddressNameService.getInstance = function () {
        if (!s_ans) {
            s_ans = new AddressNameService();
        }
        return s_ans;
    };

    // Overrides
    AddressNameService.prototype.getIdentifier = function () {
        // TODO: load ANS records from database
        return this.caches[name];
    };

    // Overrides
    AddressNameService.prototype.save = function(name, identifier) {
        // TODO: save ANS record into database
        return true;
    };

    //-------- namespace --------
    ns.AddressNameService = AddressNameService;

}(DIMP);
