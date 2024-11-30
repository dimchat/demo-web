;
// license: https://mit-license.org
//
//  DIMPLES: DIMP Library for Easy Startup
//
//                               Written in 2023 by Moky <albert.moky@gmail.com>
//
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

//!require <fsm.js>

(function (ns) {
    'use strict';

    var Thread = ns.fsm.threading.Thread;
    var Log    = ns.lnc.Log;

    var CacheHolder = function (value, lifeSpan, now) {
        this.__value = value;
        this.__lifeSpan = lifeSpan;
        if (!now || now <= 0) {
            now = (new Date()).getTime();
        }
        this.__expired = now + lifeSpan;
        this.__deprecated = now + lifeSpan * 2;
    };

    CacheHolder.prototype.getValue = function () {
        return this.__value;
    };

    CacheHolder.prototype.update = function (value, now) {
        this.__value = value;
        if (!now || now <= 0) {
            now = (new Date()).getTime();
        }
        this.__expired = now + this.__lifeSpan;
        this.__deprecated = now + this.__lifeSpan * 2;
    };

    CacheHolder.prototype.isAlive = function (now) {
        if (!now || now <= 0) {
            now = (new Date()).getTime();
        }
        return now < this.__expired;
    };

    CacheHolder.prototype.isDeprecated = function (now) {
        if (!now || now <= 0) {
            now = (new Date()).getTime();
        }
        return now > this.__deprecated;
    };

    CacheHolder.prototype.renewal = function (duration, now) {
        if (!duration || duration <= 0) {
            duration = 128 * 1000;
        }
        if (!now || now <= 0) {
            now = (new Date()).getTime();
        }
        this.__expired = now + duration;
        this.__deprecated = now + this.__lifeSpan * 2;
    };

    var CachePair = function (value, holder) {
        this.value = value;
        this.holder = holder;
    };

    /**
     *  Cache with holder
     *  ~~~~~~~~~~~~~~~~~
     */
    var CachePool = function () {
        this.__holders = {};  // key => CacheHolder
    };

    CachePool.prototype.getKeys = function () {
        return Object.keys(this.__holders);
    };

    CachePool.prototype.update = function (key, value, lifeSpan, now) {
        if (!lifeSpan || lifeSpan <= 0) {
            lifeSpan = 3600 * 1000;
        }
        var holder;
        if (value instanceof CacheHolder) {
            holder = value;
        } else {
            holder = new CacheHolder(value, lifeSpan, now);
        }
        this.__holders[key] = holder;
        return holder;
    };

    CachePool.prototype.erase = function (key, now) {
        var old = null;
        if (now && now > 0) {
            // get exists value before erasing
            old = this.fetch(key, now);
        }
        delete this.__holders[key];
        return old;
    };

    CachePool.prototype.fetch = function (key, now) {
        var holder = this.__holders[key];
        if (!holder) {
            // holder not found
            return null;
        } else if (holder.isAlive(now)) {
            return new CachePair(holder.getValue(), holder);
        } else {
            // holder expired
            return new CachePair(null, holder);
        }
    };

    CachePool.prototype.purge = function (now) {
        if (!now || now <= 0) {
            now = (new Date()).getTime();
        }
        var count = 0;
        var allKeys = this.getKeys();
        var holder, key;
        for (var i = 0; i < allKeys.length; ++i) {
            key = allKeys[i];
            holder = this.__holders[key];
            if (!holder || holder.isDeprecated(now)) {
                // remove expired holders
                delete this.__holders[key];
                ++count;
            }
        }
        return count;
    };

    /**
     *  Singleton
     *  ~~~~~~~~~
     */
    var CacheManager = {

        getInstance: function () {
            if (!running) {
                this.start();
            }
            return this;
        },

        start: function () {
            force_stop();
            running = true;
            var thr = new Thread(this.run);
            thr.start();
            thread = thr;
        },
        stop: function () {
            force_stop();
        },

        run: function () {
            if (!running) {
                return false;
            }
            var now = (new Date()).getTime();
            if (now > nextTime) {
                nextTime = now + 300 * 1000;
                try {
                    this.purge(now);
                } catch (e) {
                    Log.error('CacheManager::run()', e);
                }
            }
            return true;
        },

        purge: function (now) {
            var count = 0;
            var names = Object.keys(pools);
            var p;
            for (var i = 0; i < names.length; ++i) {
                p = pools[names[i]];
                if (p) {
                    count += p.purge(now);
                }
            }
            return count;
        },

        /**
         *  Get pool with name
         *
         * @param {string} name - pool name
         * @return {CachePool} cache pool
         */
        getPool: function (name) {
            var p = pools[name];
            if (!p) {
                p = new CachePool();
                pools[name] = p;
            }
            return p;
        }
    };

    var pools = {};  // string => CachePool

    // thread for cleaning caches
    var thread = null;
    var running = false;
    var nextTime = 0;

    var force_stop = function () {
        running = false;
        var thr = thread;
        if (thr) {
            thread = null;
            thr.stop();
        }
    }

    //-------- namespace --------
    ns.mem.CacheHolder = CacheHolder;
    ns.mem.CachePool = CachePool;
    ns.mem.CacheManager = CacheManager;

})(DIMP);
