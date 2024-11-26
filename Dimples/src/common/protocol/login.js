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

    var Interface = ns.type.Interface;
    var Command   = ns.protocol.Command;

    /**
     *  Command message: {
     *      type : 0x88,
     *      sn   : 123,
     *
     *      command  : "login",
     *      time     : 0,
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
    var LoginCommand = Interface(null, [Command]);

    Command.LOGIN = 'login';

    //-------- client info --------

    /**
     *  Get user ID
     *
     * @returns {ID}
     */
    LoginCommand.prototype.getIdentifier = function () {};

    /**
     *  Get device ID
     *
     * @returns {string}
     */
    LoginCommand.prototype.getDevice = function () {};
    /**
     *  Set device ID
     *
     * @param {string} device
     */
    LoginCommand.prototype.setDevice = function (device) {};

    /**
     *  Get user agent
     *
     * @returns {string}
     */
    LoginCommand.prototype.getAgent = function () {};
    /**
     *  Set user agent
     *
     * @param {string} UA
     */
    LoginCommand.prototype.setAgent = function (UA) {};

    //-------- server info --------

    /**
     *  Get station info
     *
     * @returns {{}}
     */
    LoginCommand.prototype.getStation = function () {};
    /**
     *  Set station info
     *
     * @param {*} station
     */
    LoginCommand.prototype.setStation = function (station) {};

    /**
     *  Get provider info
     *
     * @returns {{}}
     */
    LoginCommand.prototype.getProvider = function () {};
    /**
     *  Set provider info
     *
     * @param {*} provider
     */
    LoginCommand.prototype.setProvider = function (provider) {};

    //
    //  Factory
    //

    LoginCommand.create = function (identifier) {
        return new ns.dkd.cmd.BaseLoginCommand(identifier);
    };

    //-------- namespace --------
    ns.protocol.LoginCommand = LoginCommand;

})(DIMP);

(function (ns) {
    'use strict';

    var Interface       = ns.type.Interface;
    var Class           = ns.type.Class;
    var Wrapper         = ns.type.Wrapper;
    var ID              = ns.protocol.ID;
    var Command         = ns.protocol.Command;
    var LoginCommand    = ns.protocol.LoginCommand;
    var BaseCommand     = ns.dkd.cmd.BaseCommand;
    var Station         = ns.mkm.Station;
    var ServiceProvider = ns.mkm.ServiceProvider;

    /**
     *  Create login command
     *
     *  Usages:
     *      1. new BaseLoginCommand(map);
     *      2. new BaseLoginCommand(identifier);
     */
    var BaseLoginCommand = function (info) {
        if (Interface.conforms(info, ID)) {
            // new BaseLoginCommand(identifier);
            BaseCommand.call(this, Command.LOGIN);
            this.setString('ID', info);
        } else {
            // new BaseLoginCommand(map);
            BaseCommand.call(this, info);
        }
    };
    Class(BaseLoginCommand, BaseCommand, [LoginCommand], {

        // Override
        getIdentifier: function () {
            return ID.parse(this.getValue('ID'));
        },

        // Override
        getDevice: function () {
            return this.getString('device', null);
        },

        // Override
        setDevice: function (device) {
            this.setValue('device', device);
        },

        // Override
        getAgent: function () {
            return this.getString('agent', null);
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
            if (!station) {
                info = null;
            } else if (station instanceof Station) {
                var sid = station.getIdentifier();
                if (sid.isBroadcast()) {
                    info = {
                        'host': station.getHost(),
                        'port': station.getPort()
                    }
                } else {
                    info = {
                        'ID': sid.toString(),
                        'host': station.getHost(),
                        'port': station.getPort()
                    }
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
            if (!provider) {
                info = null;
            } else if (provider instanceof ServiceProvider) {
                info = {
                    'ID': provider.getIdentifier().toString()
                }
            } else if (Interface.conforms(provider, ID)) {
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
    ns.dkd.cmd.BaseLoginCommand = BaseLoginCommand;

})(DIMP);
