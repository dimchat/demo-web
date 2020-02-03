;

!function (ns) {
    "use strict";

    var url = 'ws://' + station.host + ':' + station.port;

    var ws = new WebSocket(url);

    ws.onopen = function (ev) {
        console.log('ws.onopen event: ' + ev);
    };

    ws.onclose = function (ev) {
        console.log('ws.onclose event: ' + ev);
    };

    ws.onmessage = function (ev) {
        console.log('ws.onmessage event: ' + ev);
        var data = ev.data;
        console.log('data: ' + data);
    };

    //-------- namespace --------
    ns.webSocket = ws;

}(window);
