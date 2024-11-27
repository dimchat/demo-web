
!function (ns, tui, app, sdk) {
    'use strict';

    var AdView = ns.AdView;

    var $ = tui.$;

    var Rect = tui.Rect;

    var Label = tui.Label;
    var Input = tui.Input;
    var Button = tui.Button;

    var FieldSet = tui.FieldSet;
    var Window = tui.Window;

    var Class = sdk.type.Class;

    // var get_facebook = function () {
    //     return app.GlobalVariable.getFacebook();
    // };
    var get_messenger = function () {
        return app.GlobalVariable.getMessenger();
    };

    var SearchWindow = function () {
        var frame = new Rect(0, 0, 480, 360);
        Window.call(this, frame);
        this.setClassName('searchWindow');
        this.setTitle('Search');

        //
        //  Advertisement
        //
        var ads = new AdView();
        ads.setClassName('searchAd');
        ads.showAd('searchAd');
        this.appendChild(ads);

        var fieldSet = new FieldSet();
        fieldSet.setClassName('searchFieldSet');
        fieldSet.setCaption('Search Condition');
        this.appendChild(fieldSet);

        // keywords
        var keywordsLabel = new Label();
        keywordsLabel.setClassName('keywordsLabel');
        keywordsLabel.setText('Keywords:');
        fieldSet.appendChild(keywordsLabel);
        // value
        var keywords = new Input();
        keywords.setClassName('keywords');
        fieldSet.appendChild(keywords);

        // button
        var button = new Button();
        button.setClassName('OK');
        button.setText('Search');
        var win = this;
        button.onClick = function (ev) {
            win.search(keywords.getValue());
        };
        this.appendChild(button);
    };
    Class(SearchWindow, Window, null, null);

    SearchWindow.prototype.search = function (keywords) {
        ns.SearchResultWindow.show();
        var messenger = get_messenger();
        messenger.search(keywords);
        this.remove();
    };

    SearchWindow.show = function () {
        var box = document.getElementById('searchWindow');
        if (box) {
            box = $(box);
        } else {
            box = new SearchWindow();
            $(document.body).appendChild(box);
            // adjust position
            var point = tui.getCenterPosition(box.getSize());
            box.setOrigin(point);
            box.layoutSubviews();
        }
        box.floatToTop();
        return box;
    };

    ns.SearchWindow = SearchWindow;

}(dicq, tarsier.ui, SECHAT, DIMP);

!function (ns, tui, app, sdk) {
    'use strict';

    var AdView = ns.AdView;
    var UserTableViewCell = ns.UserTableViewCell;

    var Rect = tui.Rect;

    var $ = tui.$;
    var FieldSet = tui.FieldSet;
    var Button = tui.Button;

    var TableViewDataSource = tui.TableViewDataSource;
    var TableViewDelegate = tui.TableViewDelegate;
    var TableView = tui.TableView;

    var Window = tui.Window;

    var Class = sdk.type.Class;
    var NotificationCenter   = sdk.lnc.NotificationCenter;
    var NotificationObserver = sdk.lnc.Observer;
    var NotificationNames = app.NotificationNames;

    var SearchResultWindow = function () {
        var frame = new Rect(0, 0, 480, 360);
        Window.call(this, frame);
        this.setClassName('searchResultWindow');
        this.setTitle('Search Results');

        //
        //  Advertisement
        //
        var ads = new AdView();
        ads.setClassName('searchResultAd');
        ads.showAd('searchResultAd');
        this.appendChild(ads);

        // search result
        var fieldSet = new FieldSet();
        fieldSet.setClassName('resultFieldSet');
        fieldSet.setCaption('Searching ...');
        this.appendChild(fieldSet);
        this.resultsFieldSet = fieldSet;

        // search result
        var table = new TableView();
        table.setClassName('searchResult');
        table.dataSource = this;
        table.delegate = this;
        fieldSet.appendChild(table);
        this.resultsTableView = table;

        // button
        var button = new Button();
        button.setClassName('OK');
        button.setText('Back');
        var win = this;
        button.onClick = function (ev) {
            win.goBack();
        };
        this.appendChild(button);

        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, NotificationNames.SearchUpdated);
    };
    Class(SearchResultWindow, Window, [TableViewDataSource, TableViewDelegate, NotificationObserver], null);

    SearchResultWindow.prototype.goBack = function () {
        ns.SearchWindow.show();
        this.remove();
    };

    SearchResultWindow.prototype.reloadData = function () {
        var count = this.getUserCount();
        var header;
        if (count === 0) {
            header = 'No user found';
        } else if (count === 1) {
            header = '1 user found';
        } else {
            header = count + ' users found';
        }
        this.resultsFieldSet.setCaption(header);
        this.resultsTableView.reloadData();
    };

    //
    //  TableViewDataSource/TableViewDelegate
    //
    SearchResultWindow.prototype.numberOfSections = function (tableView) {
        return 1;
    };
    SearchResultWindow.prototype.titleForHeaderInSection = function(section, tableView) {
        return null
    };
    SearchResultWindow.prototype.titleForFooterInSection = function(section, tableView) {
        return null
    };
    SearchResultWindow.prototype.numberOfRowsInSection = function (section, tableView) {
        return this.getUserCount();
    };
    SearchResultWindow.prototype.cellForRowAtIndexPath = function (indexPath, tableView) {
        var identifier = this.getUser(indexPath.row);
        var cell = new UserTableViewCell();
        cell.setClassName('userCell');
        cell.setIdentifier(identifier);
        return cell;
    };

    SearchResultWindow.prototype.heightForHeaderInSection = function(section, tableView) {
        return 16
    };
    SearchResultWindow.prototype.heightForFooterInSection = function(section, tableView) {
        return 16
    };
    SearchResultWindow.prototype.viewForHeaderInSection = function(section, tableView) {
        return null
    };
    SearchResultWindow.prototype.viewForFooterInSection = function(section, tableView) {
        return null
    };
    SearchResultWindow.prototype.heightForRowAtIndexPath = function(indexPath, tableView) {
        return 64
    };
    SearchResultWindow.prototype.didSelectRowAtIndexPath = function(indexPath, tableView) {

    };

    //
    //  Factory
    //
    SearchResultWindow.show = function () {
        var box = document.getElementById('searchResultWindow');
        if (box) {
            box = $(box);
        } else {
            box = new SearchResultWindow();
            $(document.body).appendChild(box);
            // adjust position
            var point = tui.getCenterPosition(box.getSize());
            box.setOrigin(point);
            box.layoutSubviews();
        }
        box.floatToTop();
        return box;
    };

    ns.SearchResultWindow = SearchResultWindow;

}(dicq, tarsier.ui, SECHAT, DIMP);

!function (ns, tui, app, sdk) {
    'use strict';

    var Interface = sdk.type.Interface;
    var ID = sdk.protocol.ID;

    var SearchCommand = app.protocol.SearchCommand;

    var NotificationNames = app.NotificationNames;
    var SearchResultWindow = ns.SearchResultWindow;

    SearchResultWindow.prototype.onReceiveNotification = function (notification) {
        var name = notification.getName();
        var userInfo = notification.getUserInfo();
        if (name === NotificationNames.SearchUpdated) {
            var content = userInfo['content'];
            if (Interface.conforms(content, SearchCommand)) {
                // var command = msg.getContent().getCommand();
                // if (command === SearchCommand.SEARCH) {
                    // process search result notification
                    update_users(content);
                    // reload users
                    this.reloadData();
                // }
            }
        }
    };

    SearchResultWindow.prototype.getUserCount = function () {
        return s_users.length;
    };

    SearchResultWindow.prototype.getUser = function (index) {
        return s_users[index];
    };

    //
    //  Search users
    //
    var s_users = [];

    var update_users = function (cmd) {
        var users = cmd.getUsers();
        if (!users) {
            return ;
        }
        s_users = [];
        var item;
        for (var i = 0; i < users.length; ++i) {
            item = ID.parse(users[i]);
            if (!item) {
                console.error('user ID error: ' + users[i]);
                continue;
            }
            if (!item.isUser()) {
                console.log('ignore ID: ' + item);
                continue;
            }
            s_users.push(item);
        }
    };

}(dicq, tarsier.ui, SECHAT, DIMP);
