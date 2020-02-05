;

!function (ns) {

    var Application = function () {

    };

    Application.prototype.getCommand = function (cmd) {
        if (cmd) {
            var array = cmd.split(/\s/g);
            if (array.length > 0) {
                return array[0];
            }
        }
        return '';
    };

    Application.prototype.exec = function (cmd) {
        var command = this.getCommand(cmd);
        var fn = 'do';
        if (command.length > 0) {
            fn += command.replace(command[0], command[0].toUpperCase());
        }
        if (typeof this[fn] !== 'function') {
            return DIMP.format.JSON.encode(cmd) + ' command error';
        }
        try {
            var args = cmd.replace(command, '').trim();
            return this[fn](args);
        } catch (e) {
            return 'failed to execute command: '
                + DIMP.format.JSON.encode(cmd) + '<br/>\n' + e;
        }
    };

    Application.prototype.write = ns.shell_output;

    ns.Application = Application;

}(window);


var app = new Application();
