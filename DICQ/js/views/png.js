
!function (ns, tui, app, sdk) {
    'use strict';

    var Class  = sdk.type.Class;
    var Base64 = sdk.format.Base64;

    var NotificationCenter   = sdk.lnc.NotificationCenter;
    var NotificationObserver = sdk.lnc.Observer;

    var Image = tui.Image;

    var PortableNetworkImage = function () {
        Image.call(this)
        this.__content = null;  // FileContent
    };
    Class(PortableNetworkImage, Image, [NotificationObserver], null);

    PortableNetworkImage.prototype.setFileContent = function (content) {
        this.__content = content;
        // show thumbnail
        var image = this;
        var thumbnail = get_thumbnail(content);
        if (thumbnail) {
            set_src(image, thumbnail);
        }
        // refresh image
        refresh_image(image);
    };

    // Override
    PortableNetworkImage.prototype.onEnter = function () {
        var nc = NotificationCenter.getInstance();
        nc.addObserver(this, 'DownloadSuccess');
        nc.addObserver(this, 'FileDataDecrypted');
    };

    // Override
    PortableNetworkImage.prototype.onExit = function () {
        var nc = NotificationCenter.getInstance();
        nc.removeObserver(this, 'FileDataDecrypted');
        nc.removeObserver(this, 'DownloadSuccess');
    };

    // Override
    PortableNetworkImage.prototype.onReceiveNotification = function (notification) {
        var name = notification.getName();
        var userInfo = notification.getUserInfo();
        var url = this.__content.getURL();
        if (name === 'DownloadSuccess') {
            if (userInfo['url'] === url) {
                console.warn('refreshing image', url);
                refresh_image(this);
            }
        } else if (name === 'FileDataDecrypted') {
            var content = userInfo['content'];
            if (content.getURL() === url) {
                console.warn('refreshing image', url);
                refresh_image(this);
            }
        }
        // FIXME:
        tui.removeZombie(this);
    };

    var set_src = function (image, base64) {
        if (base64.indexOf('data:') < 0) {
            base64 = 'data:image/png;base64,' + base64;
        }
        image.setSrc(base64);
    };

    var refresh_image = function (image) {
        var content = image.__content;
        var base64 = get_file_data(content);
        if (!base64 || base64.length === 0) {
            // console.error('failed to get file data', image, content);
        } else {
            set_src(image, base64);
        }
    };

    var get_file_data = function (content) {
        if (!content) {
            return null;
        }
        var ftp = app.network.FtpServer;
        var data = ftp.getFileData(content);
        if (!data) {
            return null;
        }
        // get image data from decrypted data
        return Base64.encode(data);
    };

    var get_thumbnail = function (content) {
        if (!content) {
            return null;
        }
        // get image data from thumbnail
        return content.getString("thumbnail", null);
    }

    //-------- namespace --------
    ns.PortableNetworkImage = PortableNetworkImage;

}(dicq, tarsier.ui, SECHAT, DIMP);

!function (ns, tui) {
    'use strict';

    var remove_zombie = function (vc) {
        var ie = vc.__ie;
        if (!ie) {
            console.error('view controller error', vc);
            return false;
        } else if (!is_zombie(ie)) {
            return false;
        }
        console.warn('removing zombie', vc, ie);
        if (typeof vc.onExit === 'function') {
            vc.onExit();
        }
        var parent = vc.getParent();
        if (parent && parent.__ie) {
            parent.__ie.removeChild(ie);
        }
        delete vc.__ie;
    };
    var is_zombie = function (ie) {
        var parent = ie.parentNode;
        if (!parent) {
            return true;
        } else if (parent === document.body) {
            return false;
        } else if (parent === document) {
            return false;
        }
        return is_zombie(parent);
    };

    //-------- namespace --------
    tui.removeZombie = remove_zombie;

}(dicq, tarsier.ui, SECHAT, DIMP);
