
//
//  Advertisement System
//

!function (ns, tui) {
    'use strict';

    var Size = tui.Size;

    var View = tui.View;

    var AdView = function (size) {
        View.call(this);
        this.setClassName('ads');
        // size
        if (arguments.length === 1) {
            if (size instanceof Size) {
                this.setSize(size);
            }
        } else if (arguments.length === 2) {
            size = new Size(arguments[0], arguments[1]);
            this.setSize(size);
        }
    };
    AdView.prototype = Object.create(View.prototype);
    AdView.prototype.constructor = AdView;

    AdView.prototype.showAd = function (id) {
        if (id === 'searchResultAd') {
            this.showSearchResultAd();
        } else {
            // TODO: fetch ad content with id
            this.setText('[' + id + '] placeholder');
        }
    };

    //-------- namespace --------
    ns.AdView = AdView;

}(dicq, tarsier.ui);

!function (ns, tui) {
    'use strict';

    var AdView = ns.AdView;

    var Link = tui.Link;
    var Label = tui.Label;
    var Image = tui.Image;
    var ScrollView = tui.ScrollView;

    var gyLogo = 'https://static.baobeihuijia.com/static/image/common/logo.png';
    var gyData = 'https://qzonestyle.gtimg.cn/qzone/v6/portal/gy/404/data.js';

    var getData = function () {
        var jsondata = window['jsondata'];
        if (!jsondata) {
            return null;
        }
        var data = jsondata['data'];
        if (!data || data.length === 0) {
            return null;
        }
        var index = Math.floor(Math.random()*data.length);
        var item = data[index];
        return {
            'image': item['child_pic'],
            'name': item['name'],
            'sex': item['sex'],
            'birthday': item['birth_time'],
            'lost': item['lost_time'],
            'location': item['lost_place'],
            'url': item['url'],
            'features': item['child_feature'],
            'expire': item['expire']
        };
    };
    var requestData = function (adView) {
        // query
        ns.loader.importJS(gyData, function () {
            var data = getData();
            showData(data, adView);
        });
    };
    var showData = function (data, adView) {
        adView.removeChildren();
        var scroll = new ScrollView();
        scroll.setClassName('lostChild');
        adView.appendChild(scroll);
        adView = scroll;

        // link
        var link = new Link();
        link.setURL(data.url);
        adView.appendChild(link);
        // pic
        var img = new Image();
        img.setClassName('childPhoto');
        img.setSrc(data.image);
        link.appendChild(img);

        // name
        var name = new Label();
        name.setClassName('childName');
        name.setText(data.name + ' (' + data.sex + ')');
        adView.appendChild(name);

        // birthday
        var birthdayLabel = new Label();
        birthdayLabel.setClassName('label');
        birthdayLabel.setText('[生日]');
        adView.appendChild(birthdayLabel);
        var birthday = new Label();
        birthday.setClassName('value');
        birthday.setText(data.birthday);
        adView.appendChild(birthday);

        // lost time
        var lostLabel = new Label();
        lostLabel.setClassName('label');
        lostLabel.setText('[失踪]');
        adView.appendChild(lostLabel);
        var lost = new Label();
        lost.setClassName('value');
        lost.setText(data.lost);
        adView.appendChild(lost);

        // lost location
        var locationLabel = new Label();
        locationLabel.setClassName('label');
        locationLabel.setText('[走失位置]');
        adView.appendChild(locationLabel);
        var location = new Label();
        location.setClassName('value');
        location.setText(data.location);
        adView.appendChild(location);

        // features
        var featuresLabel = new Label();
        featuresLabel.setClassName('label');
        featuresLabel.setText('[特征]');
        adView.appendChild(featuresLabel);
        var features = new Label();
        features.setClassName('value');
        features.setText(data.features);
        adView.appendChild(features);

        // logo
        var logo = new Image();
        logo.setClassName('gyLogo');
        logo.setSrc(gyLogo);
        adView.appendChild(logo);
    };

    AdView.prototype.showSearchResultAd = function () {
        var data = getData();
        if (data) {
            showData(data, this);
        } else {
            // logo
            var logo = new Image();
            logo.setClassName('gyLogo');
            logo.setSrc(gyLogo);
            this.appendChild(logo);
            // loading
            var span = new Label();
            span.setClassName('gyLoading');
            span.setText('Querying ...');
            this.appendChild(span);

            // query
            requestData(this);
        }
    };

}(dicq, tarsier.ui);
