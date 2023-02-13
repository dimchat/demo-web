;
// license: https://mit-license.org
//
//  DIMP : Decentralized Instant Messaging Protocol
//
//                               Written in 2020 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2020 Albert Moky
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// =============================================================================
//


//! require <dimp.js>

(function (ns) {
    'use strict';

    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;

    /**
     *  Command message: {
     *      type : 0x88,
     *      sn   : 123,
     *
     *      command : "login",
     *      time    : 0,
     *      //---- client info ----
     *      ID       : "{UserID}",
     *      device   : "DeviceID",  // (optional)
     *      agent    : "UserAgent", // (optional)
     *      //---- server info ----
     *      station  : {
     *          ID   : "{StationID}",
     *          host : "{IP}",
     *          port : 9394
     *      },
     *      provider : {
     *          ID   : "{SP_ID}"
     *      }
     *  }
     */
    var LoginCommand = function (info) {};
    ns.Interface(LoginCommand, [Command]);

    //-------- client info --------

    /**
     *  Get user ID
     *
     * @returns {ID}
     */
    LoginCommand.prototype.getIdentifier = function () {
        ns.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Get device ID
     *
     * @returns {String}
     */
    LoginCommand.prototype.getDevice = function () {
        ns.assert(false, 'implement me!');
        return null;
    };
    /**
     *  Set device ID
     *
     * @param {String} device
     */
    LoginCommand.prototype.setDevice = function (device) {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Get user agent
     *
     * @returns {String}
     */
    LoginCommand.prototype.getAgent = function () {
        ns.assert(false, 'implement me!');
        return null;
    };
    /**
     *  Set user agent
     *
     * @param {String} UA
     */
    LoginCommand.prototype.setAgent = function (UA) {
        ns.assert(false, 'implement me!');
    };

    //-------- server info --------

    /**
     *  Get station info
     *
     * @returns {{}}
     */
    LoginCommand.prototype.getStation = function () {
        ns.assert(false, 'implement me!');
        return null;
    };
    /**
     *  Set station info
     *
     * @param {{}} station
     */
    LoginCommand.prototype.setStation = function (station) {
        ns.assert(false, 'implement me!');
    };

    /**
     *  Get provider info
     *
     * @returns {{}}
     */
    LoginCommand.prototype.getProvider = function () {
        ns.assert(false, 'implement me!');
        return null;
    };
    /**
     *  Set provider info
     *
     * @param {{}} provider
     */
    LoginCommand.prototype.setProvider = function (provider) {
        ns.assert(false, 'implement me!');
    };

    //-------- namespace --------
    ns.protocol.LoginCommand = LoginCommand;

    ns.protocol.registers('LoginCommand');

})(DIMSDK);

(function (ns) {
    'use strict';

    var Wrapper = ns.type.Wrapper;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var LoginCommand = ns.protocol.LoginCommand;
    var BaseCommand = ns.dkd.BaseCommand;

    /**
     *  Create login command
     *
     *  Usages:
     *      1. new BaseLoginCommand(map);
     *      2. new BaseLoginCommand(identifier);
     */
    var BaseLoginCommand = function (info) {
        if (ns.Interface.conforms(info, ID)) {
            // new BaseLoginCommand(identifier);
            BaseCommand.call(this, Command.LOGIN);
            this.setValue('ID', info.toString());
        } else {
            // new BaseLoginCommand(map);
            BaseCommand.call(this, info);
        }
    };
    ns.Class(BaseLoginCommand, BaseCommand, [LoginCommand], {

        // Override
        getIdentifier: function () {
            return ID.parse(this.getValue('ID'));
        },

        // Override
        getDevice: function () {
            return this.getValue('device');
        },

        // Override
        setDevice: function (device) {
            this.setValue('device', device);
        },

        // Override
        getAgent: function () {
            return this.getValue('agent');
        },

        // Override
        setAgent: function (UA) {
            this.setValue('agent', UA);
        },

        // Override
        getStation: function () {
            return this.getValue('station');
        },

        // Override
        setStation: function (station) {
            var info;
            if (station instanceof ns.Station) {
                info = {
                    'host': station.getHost(),
                    'port': station.getPort(),
                    'ID': station.getIdentifier().toString()
                }
            } else {
                info = Wrapper.fetchMap(station);
            }
            this.setValue('station', info);
        },

        // Override
        getProvider: function () {
            return this.getValue('provider');
        },

        // Override
        setProvider: function (provider) {
            var info;
            if (provider instanceof ns.ServiceProvider) {
                info = {
                    'ID': provider.getIdentifier().toString()
                }
            } else if (ns.Interface.conforms(provider, ID)) {
                info = {
                    'ID': provider.toString()
                }
            } else {
                info = Wrapper.fetchMap(provider);
            }
            this.setValue('provider', info);
        }
    });

    //-------- namespace --------
    ns.dkd.BaseLoginCommand = BaseLoginCommand;

    ns.dkd.registers('BaseLoginCommand');

})(DIMSDK);
