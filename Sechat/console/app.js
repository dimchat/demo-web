;

!function (ns) {

    var $left = $('.left');
    var $right = $('.right');
    var $cursor = $('.cursor');

    var $shell = $('.shell-view');
    var template_output = _.template('<div class="output-view"><span class="prompt"><%= separate %></span>&nbsp;<span class="output<%= error %>"><%= value %></span></div>');

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

    Application.prototype.help = function (cmd) {
        console.assert(false, 'implement me!');
        return cmd;
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

    Application.prototype.write = function () {
        var str = '';
        for (var i = 0; i < arguments.length; ++i) {
            str += arguments[i] + '';
        }
        str = str
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>')
            .replace(/\s/g, '&nbsp;');

        var cmd = '';
        var err_class = '';

        $left.text('');
        $cursor.html('&nbsp;');
        $right.text('');

        // $shell.before(template_output({separate:'$', value:cmd, error: ''}));
        $shell.before(template_output({separate:'&gt;', value:str, error: err_class}) + '<br />');

    };

    ns.Application = Application;

}(window);


var app = new Application();
