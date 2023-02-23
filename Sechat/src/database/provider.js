;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2023 Albert Moky
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

//! require <dimples.js>

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Storage = ns.dos.LocalStorage;
    var ProviderDBI = ns.dbi.ProviderDBI;

    var stations_path = function (provider) {
        return 'isp.' + provider.getAddress().toString() + '.stations';
    };

    var ISP = ID.parse('gsp@everywhere');

    var load_stations = function () {
        var stations = [];
        var path = stations_path(ISP);
        var array = Storage.loadJSON(path);
        if (array) {
            var item;
            for (var i = 0; i < array.length; ++i) {
                item = array[i];
                stations.push({
                    'host': item['host'],
                    'port': item['port'],
                    'ID': ID.parse(item['ID'])
                });
            }
        }
        return stations;
    };
    var save_stations = function (stations) {
        var array = [];
        var item;
        var host, port, sid;
        for (var i = 0; i < stations.length; ++i) {
            item = stations[i];
            // if (item instanceof Station) {
            //     host = item.getHost();
            //     port = item.getPort();
            //     sid = item.getIdentifier();
            // } else {
                host = item['host'];
                port = item['port'];
                sid = item['ID'];
            // }
            if (sid) {
                array.push({
                    'host': host,
                    'port': port,
                    'ID': sid.toString()
                });
            } else {
                array.push({
                    'host': host,
                    'port': port
                });
            }
        }
        var path = stations_path(ISP);
        return Storage.saveJSON(array, path);
    };
    var find_station = function (stations, host, port) {
        var item;
        for (var i = 0; i < stations.length; ++i) {
            item = stations[i];
            if (item['host'] === host && item['port'] === port) {
                return i;
            }
        }
        return -1;
    };

    /**
     *  Provider Storage
     *  ~~~~~~~~~~~~~~~~
     *
     *  storage path: 'dim.fs.isp.{ADDRESS}.stations'
     */
    var ProviderStorage = function () {
        Object.call(this);
        this.__stations = null;
    };
    Class(ProviderStorage, Object, [ProviderDBI], null);

    // Override
    ProviderStorage.prototype.allNeighbors = function () {
        if (this.__stations === null) {
            this.__stations = load_stations();
        }
        return this.__stations;
    };

    // Override
    ProviderStorage.prototype.getNeighbor = function (ip, port) {
        var stations = this.allNeighbors();
        var index = find_station(stations, ip, port);
        if (index < 0) {
            // not found
            return null;
        }
        return stations[index]['ID'];
    };

    // Override
    ProviderStorage.prototype.addNeighbor = function (ip, port, identifier) {
        var stations = this.allNeighbors();
        var index = find_station(stations, ip, port);
        if (index >= 0) {
            // duplicated
            return false;
        }
        stations.unshift({
            'host': ip,
            'port': port,
            'ID': identifier
        });
        return save_stations(stations);
    };

    // Override
    ProviderStorage.prototype.removeNeighbor = function (ip, port) {
        var stations = this.allNeighbors();
        var index = find_station(stations, ip, port);
        if (index < 0) {
            // not found
            return false;
        }
        stations.splice(index, 1);
        return save_stations(stations);
    };

    //-------- namespace --------
    ns.database.ProviderStorage = ProviderStorage;

})(DIMP);
