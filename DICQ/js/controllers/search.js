
!function (ns, tui, dimp) {
    'use strict';

    var AdView = ns.AdView;

    var $ = tui.$;

    var Rect = tui.Rect;

    var Label = tui.Label;
    var Input = tui.Input;
    var Button = tui.Button;

    var FieldSet = tui.FieldSet;
    var Window = tui.Window;

    var Messenger = dimp.Messenger;

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
    dimp.Class(SearchWindow, Window, null);

    SearchWindow.prototype.search = function (keywords) {
        ns.SearchResultWindow.show();
        var messenger = Messenger.getInstance();
        messenger.searchUsers(keywords);
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

}(dicq, tarsier.ui, DIMP);

!function (ns, tui, dimp) {
    'use strict';

    var AdView = ns.AdView;

    var Rect = tui.Rect;

    var $ = tui.$;
    var FieldSet = tui.FieldSet;
    var Button = tui.Button;

    var TableViewCell = tui.TableViewCell;
    var TableViewDataSource = tui.TableViewDataSource;
    var TableViewDelegate = tui.TableViewDelegate;
    var TableView = tui.TableView;

    var Window = tui.Window;

    var NotificationCenter = dimp.stargate.NotificationCenter;
    var Facebook = dimp.Facebook;

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
        nc.addObserver(this, nc.kNotificationMessageReceived);
    };
    dimp.Class(SearchResultWindow, Window, [TableViewDataSource, TableViewDelegate]);

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
    SearchResultWindow.prototype.numberOfRowsInSection = function (section, tableView) {
        return this.getUserCount();
    };

    SearchResultWindow.prototype.cellForRowAtIndexPath = function (indexPath, tableView) {
        var identifier = this.getUser(indexPath.row);
        var cell = new TableViewCell();
        cell.setClassName('userCell');

        var facebook = Facebook.getInstance();
        var name = facebook.getNickname(identifier);
        if (!name) {
            name = identifier.name;
        }
        var number = facebook.getNumberString(identifier);
        cell.setText(name + ' (' + number + ')');
        return cell;
    };

    SearchResultWindow.prototype.didSelectRowAtIndexPath = function(indexPath, tableView) {
        var identifier = this.getUser(indexPath.row);
        var facebook = Facebook.getInstance();
        if (facebook.getPrivateKeyForSignature(identifier)) {
            ns.AccountWindow.show(identifier);
        } else {
            ns.UserWindow.show(identifier);
        }
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

}(dicq, tarsier.ui, DIMP);

!function (ns, tui, dimp) {
    'use strict';

    var SearchResultWindow = ns.SearchResultWindow;

    var SearchCommand = dimp.protocol.SearchCommand;
    var NotificationCenter = dimp.stargate.NotificationCenter;

    var Facebook = dimp.Facebook;

    SearchResultWindow.prototype.onReceiveNotification = function (notification) {
        var nc = NotificationCenter.getInstance();
        var name = notification.name;
        if (name === nc.kNotificationMessageReceived) {
            var msg = notification.userInfo;
            if (msg.content instanceof SearchCommand) {
                var command = msg.content.getCommand();
                if (command === SearchCommand.SEARCH) {
                    // process search result notification
                    update_users(msg.content);
                    // reload users
                    this.reloadData();
                }
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
        var facebook = Facebook.getInstance();
        s_users = [];
        var item;
        for (var i = 0; i < users.length; ++i) {
            item = facebook.getIdentifier(users[i]);
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

}(dicq, tarsier.ui, DIMP);
