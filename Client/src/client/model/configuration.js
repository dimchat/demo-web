;
//! require 'namespace.js'

(function (ns, sdk) {
    'use strict';

    var ID = sdk.protocol.ID;

    ns.Configuration = {

        getDefaultProvider: function () {
            // TODO: load config from 'gsp.js'
            return this.__sp;
        },

        getDefaultContacts: function () {
            // TODO: load config from 'gsp.js'
            var info = this.__sp;
            var array = info.get("contacts");
            if (array) {
                return ID.convert(array);
            } else {
                return null;
            }
        },

        getUploadURL: function () {
            return 'https://sechat.dim.chat/{ID}}/upload';
        },

        getDownloadURL: function () {
            return 'https://sechat.dim.chat/download/{ID}/{filename}';
        },

        getAvatarURL: function () {
            return 'https://sechat.dim.chat/avatar/{ID}/{filename}';
        },

        getTermsURL: function () {
            return 'https://wallet.dim.chat/dimchat/sechat/privacy.html';
        },

        getAboutURL: function () {
            // return 'https://sechat.dim.chat/support';
            return 'https://dim.chat/sechat';
        },

        __sp: null
    };

})(SECHAT, DIMSDK);
