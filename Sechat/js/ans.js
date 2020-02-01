
//! require <sdk/all.js>

var AddressNameService = function () {
    DIMP.AddressNameService.call(this);
};
AddressNameService.inherits(DIMP.AddressNameService);

//
//  Overrides
//

AddressNameService.prototype.getIdentifier = function () {
    // TODO: load ANS records from database
    return DIMP.AddressNameService.prototype.getIdentifier.call();
};

AddressNameService.prototype.save = function(name, identifier) {
    // TODO: save ANS record into database
    return true;
};
