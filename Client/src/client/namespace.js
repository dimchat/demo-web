;
//! require <sdk.js>
//! require <common.js>

(function (ns, sdk) {
    'use strict';

    // CONSTANTS
    ns.kNotificationServerStateChanged     = 'ServerStateChanged';
    ns.kNotificationStationConnecting      = 'StationConnecting';
    ns.kNotificationStationConnected       = 'StationConnected';
    ns.kNotificationStationError           = 'StationError';

    ns.kNotificationServiceProviderUpdated = 'ServiceProviderUpdated';

    ns.kNotificationMetaAccepted           = 'MetaAccepted';
    ns.kNotificationDocumentUpdated        = 'DocumentUpdated';

    ns.kNotificationContactsUpdated        = 'ContactsUpdated';
    ns.kNotificationMembersUpdated         = 'MembersUpdated';
    ns.kNotificationGroupRemoved           = 'GroupRemoved';

    ns.kNotificationMessageUpdated         = 'MessageUpdated';

    //-------- namespace --------
    if (typeof ns.model !== 'object') {
        ns.model = new sdk.Namespace();
    }

    ns.registers('model');

})(SECHAT, DIMSDK);
