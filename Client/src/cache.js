;
//! require <dimsdk.js>

!function (ns) {
    'use strict';

    var KeyStore = ns.KeyStore;

    var s_key_store = null;
    KeyStore.getInstance = function () {
        if (!s_key_store) {
            s_key_store = new KeyStore();
        }
        return s_key_store;
    };

    // Overrides
    KeyStore.prototype.saveKeys = function(map) {
        // TODO: save key map into local cache
        return true;
    };
    // Overrides
    KeyStore.prototype.loadKeys = function() {
        // TODO: load key map from local cache
        return null;
    };

    //-------- namespace --------
    ns.KeyStore = KeyStore;

}(DIMP);
