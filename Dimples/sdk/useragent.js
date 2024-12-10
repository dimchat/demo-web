
(function (ns) {
    'use strict';

    var checkMobile = function () {
        try {
            document.createEvent('TouchEvent');
            return true;
        } catch (e) {
            return false;
        }
    };

    var getOS = function () {
        var isMobile = checkMobile();
        var sUserAgent = window.navigator.userAgent.toLocaleLowerCase();
        var isWin = sUserAgent.indexOf('win32') > -1 || sUserAgent.indexOf('windows') > -1;
        var isMac = sUserAgent.indexOf('mac68k') > -1 || sUserAgent.indexOf('macppc') > -1 || sUserAgent.indexOf('macintosh') > -1 || sUserAgent.indexOf('macintel') > -1;
        if (isMac && !isMobile) return 'Mac';
        if (sUserAgent.indexOf('x11') > -1 && !isWin && !isMac) return 'Unix';
        if (sUserAgent.indexOf('linux') > -1) return 'Linux';
        if (isWin) {
            if (sUserAgent.indexOf('windows nt 5.0') > -1 || sUserAgent.indexOf('windows 2000') > -1) return 'Win2000';
            if (sUserAgent.indexOf('windows nt 5.1') > -1 || sUserAgent.indexOf('windows xp') > -1) return 'WinXP';
            if (sUserAgent.indexOf('windows nt 5.2') > -1 || sUserAgent.indexOf('windows 2003') > -1) return 'Win2003';
            if (sUserAgent.indexOf('windows nt 6.0') > -1 || sUserAgent.indexOf('windows vista') > -1) return 'WinVista';
            if (sUserAgent.indexOf('windows nt 6.1') > -1 || sUserAgent.indexOf('windows 7') > -1) return 'Win7';
            if (sUserAgent.indexOf('windows nt 10.0') > -1 || sUserAgent.indexOf('windows 10') > -1) return 'Win10';
        }
        if (sUserAgent.indexOf('android') > -1) return 'Android';
        if (sUserAgent.indexOf('iphone') > -1) return 'iPhone';
        if (sUserAgent.indexOf('symbianos') > -1) return 'SymbianOS';
        if (sUserAgent.indexOf('windows phone') > -1) return 'Windows Phone';
        if (sUserAgent.indexOf('ipad') > -1) return 'iPad';
        if (sUserAgent.indexOf('ipod') > -1) return 'iPod';
        if (isMac && isMobile) return 'iOS';
        return 'Browser';
    };

    var getBrowser = function () {
        var ua = navigator.userAgent.toLocaleLowerCase();
        // 判断是否为IE(第一个是正常的IE，第二个是Edge，第三个是IE11)
        var isIE = (ua.indexOf("compatible") > -1 && ua.indexOf("msie") > -1)
            || (ua.indexOf("edge") > -1) || (ua.indexOf('trident') > -1 && ua.indexOf("rv:11.0") > -1);
        // 判断是否为IE5678，!+[1,] 在IE5678返回true，在IE9、IE10、IE11返回false
        var isLteIE8 = isIE && !+[1,];
        // 用于防止因通过IE8+的文档兼容性模式设置文档模式，导致版本判断失效
        var dm = document.documentMode,
            isIE5,
            isIE6,
            isIE7,
            isIE8,
            isIE9,
            isIE10,
            isIE11;
        if (dm) {
            isIE5 = dm === 5;
            isIE6 = dm === 6;
            isIE7 = dm === 7;
            isIE8 = dm === 8;
            isIE9 = dm === 9;
            isIE10 = dm === 10;
            isIE11 = dm === 11;
        } else {
            // 判断是否为IE5，IE5的文本模式为怪异模式(quirks),真实的IE5.5浏览器中没有document.compatMode属性
            isIE5 = (isLteIE8 && (!document.compatMode || document.compatMode === 'BackCompat'));
            // 判断是否为IE6，IE7开始有XMLHttpRequest对象
            isIE6 = isLteIE8 && !isIE5 && !XMLHttpRequest;
            // 判断是否为IE7，IE8开始有document.documentMode属性
            isIE7 = isLteIE8 && !isIE6 && !document.documentMode;
            // 判断是否IE8
            isIE8 = isLteIE8 && document.documentMode;
            // 判断IE9，IE9严格模式中函数内部this不为undefined
            isIE9 = !isLteIE8 && (function () {
                "use strict";
                return !!this;
            }());
            // 判断IE10，IE10开始支持严格模式，严格模式中函数内部this为undefined
            isIE10 = isIE && !!document.attachEvent && (function () {
                "use strict";
                return !this;
            }());
            // 判断IE11，IE11开始移除了attachEvent属性
            isIE11 = isIE && !document.attachEvent;
        }
        // 因为字符串存在覆盖重复原因，判断顺序不可随意修改
        if (isIE5) return 'IE5';
        if (isIE6) return 'IE6';
        if (isIE7) return 'IE7';
        if (isIE8) return 'IE8';
        if (isIE9) return 'IE9';
        if (isIE10) return 'IE10';
        if (isIE11) return 'IE11';
        if (ua.indexOf('green') > -1) return '绿色浏览器';
        if (ua.indexOf('qq') > -1) return 'QQ浏览器';
        if (ua.indexOf('bidu') > -1) return '百度浏览器';
        if (ua.indexOf('lb') > -1) return '猎豹浏览器';
        if (ua.indexOf('world') > -1) return '世界之窗浏览器';
        if (ua.indexOf('2345') > -1) return '2345浏览器';
        if (ua.indexOf('maxthon') > -1) return '傲游浏览器';
        if (ua.indexOf('tao') > -1) return '淘宝浏览器';
        if (ua.indexOf('ubrowser') > -1) return 'UC浏览器';
        if (ua.indexOf('coolnovo') > -1) return '枫叶浏览器';
        if (ua.indexOf('opr') > -1) return 'Opera';
        if (ua.indexOf('se') > -1) return '搜狗浏览器';
        if (ua.indexOf('firefox') > -1) return 'Firefox';
        if (ua.indexOf('safari') > -1 && ua.indexOf("version") > -1) return ('Safari');
        if (window.navigator.mimeTypes[40] || !window.navigator.mimeTypes.length) return '360浏览器';
        if (ua.indexOf("chrome") > -1 && window.chrome) return ('Chrome');
        return '未知浏览器';
    };

    var getHost = function () {
        return window.location.host;
    };

    var getSource = function () {
        var browser = getBrowser();
        var host = getHost();
        if (host && host.length > 0) {
            // "http://..."
            return browser + ': ' + host;
        }
        // "file:///..."
        return browser;
    };

    //-------- namespace --------
    ns.DevicePlatform = {

        getOS: getOS,

        getBrowser: getBrowser,

        getSource: getSource

    };

})(window);
