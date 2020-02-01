
//! require <sdk/all.js>

var AddressNameService;

!function (ns) {

    AddressNameService = function () {
        ns.AddressNameService.call(this);
    };
    AddressNameService.inherits(ns.AddressNameService);

    //
    //  Overrides
    //

    AddressNameService.prototype.getIdentifier = function () {
        // TODO: load ANS records from database
        return ns.AddressNameService.prototype.getIdentifier.call();
    };

    AddressNameService.prototype.save = function(name, identifier) {
        // TODO: save ANS record into database
        return true;
    };

}(DIMP);
