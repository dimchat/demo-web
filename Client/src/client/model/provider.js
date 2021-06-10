;
//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;
    var NotificationCenter = sdk.lnc.NotificationCenter;

    var kNotificationServiceProviderUpdated = ns.kNotificationServiceProviderUpdated;

    ns.NetworkDatabase = {

        /**
         *  Get all service providers
         *
         * @return {[]} provider info list
         */
        allProviders: function () {
            // check providers
            var providers = this.providerTable.getProviders();
            if (providers && providers.length > 0) {
                return providers;
            } else {
                return [default_provider()];
            }
        },

        /**
         *  Save provider
         *
         * @param {ID} identifier - provider ID
         * @param {String} name - provider name
         * @param {String} url - config URL
         * @param {int} chosen - set to first provider
         * @return {boolean} true on success
         */
        addProvider: function (identifier, name, url, chosen) {
            return this.providerTable.addProvider(identifier, name, url, chosen);
        },

        //-------- Station

        /**
         *  Get all stations under the service provider
         *
         * @param {ID} sp - sp ID
         * @return {[]} station info list
         */
        allStations: function (sp) {
            return this.providerTable.getStations(sp);
        },

        /**
         *  Save station info for the service provider
         *
         * @param {ID} sp - sp ID
         * @param {ID} station - station ID
         * @param {String} host - station host
         * @param {uint} port - station port
         * @param {String} name - station name
         * @param {int} chosen - set to first provider
         * @return {boolean} true on success
         */
        addStation: function (sp, station, host, port, name, chosen) {
            if (!this.providerTable.addStation(sp, station, host, port, name, chosen)) {
                return false;
            }
            var nc = NotificationCenter.getInstance();
            nc.postNotification(kNotificationServiceProviderUpdated, this, {
                'sp': sp,
                'action': 'add',
                'station': station,
                'chosen': chosen
            });
            return true;
        },

        chooseStation: function (sp, station) {
            if (!this.providerTable.chooseStation(sp, station)) {
                return false;
            }
            var nc = NotificationCenter.getInstance();
            nc.postNotification(kNotificationServiceProviderUpdated, this, {
                'sp': sp,
                'action': 'switch',
                'station': station,
                'chosen': 1
            });
            return true;
        },
        removeStation: function (sp, station, host, port) {
            if (!this.providerTable.removeStation(sp, station)) {
                return false;
            }
            var nc = NotificationCenter.getInstance();
            nc.postNotification(kNotificationServiceProviderUpdated, this, {
                'sp': sp,
                'action': 'remove',
                'station': station,
                'host': host,
                'port': port
            });
            return true;
        },

        providerTable: null
    };

    var default_provider = function () {
        // TODO: get default provider
        return null
    };

})(SECHAT, DIMSDK);
