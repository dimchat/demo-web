;

// namespaces
dimsdk = dimp = DIMP;

$(function() {
    var template_output = _.template('<div class="output-view"><span class="prompt"><%= separate %></span>&nbsp;<span class="output<%= error %>"><%= value %></span></div>');
    var cmd_cache = [];
    var cmd_pos = 0;

    var $panel = $('#panel-shell');
    var $left = $('.left');
    var $right = $('.right');
    var $cursor = $('.cursor');
    var $shell = $('.shell-view');
    var $input = $('.input');

    var str_left = '';
    var str_cursor = '';
    var str_right = '';
    var str_tmp_cursor = '';
    var flag_end = false;

    var scroll_to_bottom = function () {
        $panel.scrollTop($panel.get(0).scrollHeight);
    };

    window.shell_output = function () {
        var str = '';
        for (var i = 0; i < arguments.length; ++i) {
            str += arguments[i] + '';
        }
        str = str
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>')
            .replace(/  /g, ' &nbsp;');

        var err_class = '';

        $left.text('');
        $cursor.html('&nbsp;');
        $right.text('');

        $shell.before(template_output({separate:'&gt;', value:str, error: err_class}));

        scroll_to_bottom();
    };

    // 光标闪烁效果
    setInterval(function(){
        $cursor.toggleClass('blink');
    }, 1000);

    $(document).bind('paste', function (e) {
        var pastedText;
        if (window.clipboardData && window.clipboardData.getData) {
            // IE
            pastedText = window.clipboardData.getData('Text');
        } else {
            pastedText = e.originalEvent.clipboardData.getData('Text');
            //e.clipboardData.getData('text/plain');
        }
        if (pastedText) {
            $left.append(pastedText.replace(/  /g, ' &nbsp;'))
        }
    });

    // keypress 按下字符键时触发
    // keydown 按下任意键触发

    // 获取键盘输入 (keydown 与 keypress 获取的 keyCode 值不一样, 其中keydown不区分大小写)
    $(document).keypress(function(e) {
        // jQuery 标准化了 event.keyCode(IE) event.which(W3C) event.charCode(事件为keypress下除IE)
        // console.log(e.which);
        // console.log(String.fromCharCode(e.which));

        if (e.which === 32) {       // space
            // already process in keydown()
        } else if(e.which !== 13) { // enter
            $left.append(String.fromCharCode(e.which));
        }

    });

    // 功能键
    $(document).keydown(function(e) {
        // console.log(e.which);

        if (e.which === 32) {       // space
            $left.append('&nbsp;');
        } else if (e.which === 13) {           // enter
            var cmd = $.trim($input.text());
            var val_ouput = '';
            var err_class = '';
            var is_print = true;

            if (cmd !== '') {
                cmd_cache.push(cmd);
                cmd_cache = _.uniq(cmd_cache);
            }
            if (cmd_cache.length > 0) {
                cmd_pos = cmd_cache.length - 1;
            }

            $left.text('');
            $cursor.html('&nbsp;');
            $right.text('');

            if (cmd === 'clear') {
                $shell.siblings().remove();
                return;
            }

            $shell.before(template_output({separate:'$', value:cmd, error: ''}));

            try {
                var app = dimsdk.Application.getInstance();
                if (cmd) {
                    val_ouput = app.exec(cmd);
                } else {
                    val_ouput = app.doWho();
                }
            } catch (e) {
                val_ouput = '\'' + cmd + '\': command not found';
                err_class = ' error';
            }

            if (val_ouput) {
                $shell.before(template_output({separate:'&gt;', value:val_ouput, error: err_class}));
            }

            scroll_to_bottom();

        } else if (e.which === 8) {     // backspace
            e.preventDefault();

            str_left = $left.text();
            if (str_left.length === 0) {
                return;
            }
            str_left = str_left.substring(0, str_left.length - 1);
            $left.text(str_left);

        } else if (e.which === 37) {    // 向左方向键
            str_left = $left.text();
            str_right = $right.text();
            str_cursor = $cursor.text();
            str_tmp_cursor = '';

            if (str_left.length === 0) {
                return;
            }
            str_tmp_cursor = str_left.substring(str_left.length - 1, str_left.length);
            str_left = str_left.substring(0, str_left.length - 1);
            if (!($cursor.html() === '&nbsp;' && str_right.length === 0 && $.trim(str_tmp_cursor) !== '')) {
                str_right = str_cursor + str_right;
            }

            $left.text(str_left);
            $cursor.text(str_tmp_cursor);
            $right.text(str_right);

        } else if (e.which === 39) {    // 向右方向键
            str_left = $left.text();
            str_right = $right.text();
            str_cursor = $cursor.text();
            flag_end = false;

            if (str_right.length === 0) {
                if ($cursor.html() === '&nbsp;') {
                    return;
                }
                flag_end = true;
            }
            str_left += str_cursor;
            if (flag_end) {
                $cursor.html('&nbsp;');
                str_right = '';
            } else {
                $cursor.text(str_right.substring(0,1));
                str_right = str_right.substring(1);
            }

            $left.text(str_left);
            $right.text(str_right);

        } else if (e.which === 38) {    // 向上方向键
            if (cmd_pos < 0) {
                return;
            }

            $left.text(cmd_cache[cmd_pos]);
            cmd_pos--;
            $cursor.html('&nbsp;');
            $right.text('');
        } else if (e.which === 40) {    // 向下方向键
            if (cmd_pos >= cmd_cache.length - 1) {
                $left.text('');
            } else {
                cmd_pos++;
                $left.text(cmd_cache[cmd_pos]);
            }

            $cursor.html('&nbsp;');
            $right.text('');
        } else if (e.which === 46) {    // delete
            str_right = $right.text();

            if (str_right.length === 0) {
                if ($cursor.html() === '&nbsp;') {
                    return;
                }
                flag_end = true;
            }

            if (flag_end) {
                $cursor.html('&nbsp;');
            } else {
                $cursor.text(str_right.substring(0, 1));
                $right.text(str_right.substring(1));
            }
        } else if (e.which === 35) {    // end
            str_right = $right.text();
            str_cursor = $cursor.text();
            var str_all = $input.text();

            if (str_right.length === 0 && $.trim(str_cursor).length === 0) {
                return;
            }
            $left.text(str_all);
            $cursor.html('&nbsp;');
            $right.text('');

        } else if (e.which === 36) {    // home
            str_left = $left.text();
            var str_all = $input.text();

            if (str_left.length === 0) {
                return;
            }
            $left.text('');
            $cursor.text(str_all.substring(0, 1));
            $right.text(str_all.substring(1, str_all.length));

        } else if (e.which === 85 && e.ctrlKey) {   // Ctrl + U
            e.preventDefault();

            $left.text('');
        } else if (e.which === 76 && e.ctrlKey) {   // Ctrl + L
            e.preventDefault();

            $shell.siblings().remove();
        }

    });

});
