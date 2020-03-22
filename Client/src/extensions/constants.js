;
//! require <dimsdk.js>

!function (ns) {
    'use strict';

    var NotificationCenter = ns.stargate.NotificationCenter;

    var nc = NotificationCenter.getInstance();

    nc.kNotificationStationConnecting = 'StationConnecting';
    nc.kNotificationStationConnected  = 'StationConnected';
    nc.kNotificationStationError      = 'StationError';
    nc.kNotificationHandshakeAccepted = 'HandshakeAccepted';
    nc.kNotificationMetaAccepted      = 'MetaAccepted';
    nc.kNotificationProfileUpdated    = 'ProfileUpdated';
    nc.kNotificationMessageReceived   = 'MessageReceived';

}(DIMP);
