;
// license: https://mit-license.org
//
//  DBI : Database Interface
//
//                               Written in 2020 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2020 Albert Moky
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

//! require 'base.js'

(function (ns) {
    'use strict';

    var Interface  = ns.type.Interface;
    var DecryptKey = ns.crypto.DecryptKey;
    var PrivateKey = ns.crypto.PrivateKey;

    /**
     *  Account DBI
     *  ~~~~~~~~~~~
     */
    var PrivateKeyDBI = Interface(null, null);

    PrivateKeyDBI.META = 'M';
    PrivateKeyDBI.VISA = 'V';

    /**
     *  Save private key for user
     *
     * @param {PrivateKey} key - private key
     * @param {string} type    - 'M' for matching meta.key; or 'D' for matching visa.key
     * @param {ID} user        - user ID
     * @return {boolean} false on error
     */
    PrivateKeyDBI.prototype.savePrivateKey = function (key, type, user) {};

    /**
     *  Get private keys for user
     *
     * @param {ID} user - user ID
     * @return {DecryptKey[]} all keys marked for decryption
     */
    PrivateKeyDBI.prototype.getPrivateKeysForDecryption = function (user) {};

    /**
     *  Get private key for user
     *
     * @param {ID} user - user ID
     * @return {PrivateKey} first key marked for signature
     */
    PrivateKeyDBI.prototype.getPrivateKeyForSignature = function (user) {};

    /**
     *  Get private key for user
     *
     * @param {ID} user - user ID
     * @return {PrivateKey} the private key matched with meta.key
     */
    PrivateKeyDBI.prototype.getPrivateKeyForVisaSignature = function (user) {};

    //
    //  Conveniences
    //

    var convertDecryptKeys = function (privateKeys) {
        var decryptKeys = [];
        var key;
        for (var index = 0; index < privateKeys.length; ++index) {
            key = privateKeys[index];
            if (Interface.conforms(key, DecryptKey)) {
                decryptKeys.push(key);
            }
        }
        return decryptKeys;
    };
    var convertPrivateKeys = function (decryptKeys) {
        var privateKeys = [];
        var key;
        for (var index = 0; index < decryptKeys.length; ++index) {
            key = decryptKeys[index];
            if (Interface.conforms(key, PrivateKey)) {
                privateKeys.push(key);
            }
        }
        return privateKeys;
    };

    var revertPrivateKeys = function (privateKeys) {
        var array = [];
        for (var index = 0; index < privateKeys.length; ++index) {
            array.push(privateKeys[index].toMap());
        }
        return array;
    };

    var insertKey = function (key, privateKeys) {
        var index = findKey(key, privateKeys);
        if (index === 0) {
            // nothing change
            return null;
        } else if (index > 0) {
            // move to the front
            privateKeys.splice(index, 1);
        } else if (privateKeys.length > 2) {
            // keep only last three records
            privateKeys.pop();
        }
        privateKeys.unshift(key);
        return privateKeys;
    };
    var findKey = function (key, privateKeys) {
        var data = key.getString('data', null);
        var item;  // PrivateKey
        for (var index = 0; index < privateKeys.length; ++index) {
            item = privateKeys[index];
            if (item.getString('data', null) === data) {
                return index;
            }
        }
        return -1;
    };

    PrivateKeyDBI.convertDecryptKeys = convertDecryptKeys;
    PrivateKeyDBI.convertPrivateKeys = convertPrivateKeys;

    PrivateKeyDBI.revertPrivateKeys = revertPrivateKeys;

    PrivateKeyDBI.insertKey = insertKey;
    PrivateKeyDBI.findKey = findKey;

    //-------- namespace --------
    ns.dbi.PrivateKeyDBI = PrivateKeyDBI;

})(DIMP);

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;

    /**
     *  Account DBI
     *  ~~~~~~~~~~~
     */
    var MetaDBI = Interface(null, null);

    /**
     *  Get meta for entity ID
     *
     * @param {ID} entity
     * @return {Meta}
     */
    MetaDBI.prototype.getMeta = function (entity) {};

    /**
     *  Save meta with entity ID
     *
     * @param {Meta} meta
     * @param {ID} entity
     * @return {boolean} false on error
     */
    MetaDBI.prototype.saveMeta = function (meta, entity) {};

    //-------- namespace --------
    ns.dbi.MetaDBI = MetaDBI;

})(DIMP);

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;

    /**
     *  Account DBI
     *  ~~~~~~~~~~~
     */
    var DocumentDBI = Interface(null, null);

    /**
     *  Get document list for entity
     *
     * @param {ID} entity   - user/group ID
     * @return {Document[]} documents
     */
    DocumentDBI.prototype.getDocuments = function (entity) {};

    /**
     *  Save document for entity
     *
     * @param {Document} doc - document
     * @return {boolean} false on error
     */
    DocumentDBI.prototype.saveDocument = function (doc) {};

    //-------- namespace --------
    ns.dbi.DocumentDBI = DocumentDBI;

})(DIMP);

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;

    /**
     *  Account DBI
     *  ~~~~~~~~~~~
     */
    var UserDBI = Interface(null, null);
    var ContactDBI = Interface(null, null);

    /**
     *  Get local user ID list
     *
     * @return {ID[]} user ID list
     */
    UserDBI.prototype.getLocalUsers = function () {};

    /**
     *  Save local user ID list
     *
     * @param {ID[]} users - user ID list
     * @return {boolean} false on error
     */
    UserDBI.prototype.saveLocalUsers = function (users) {};

    /**
     *  Get contact ID list
     *
     * @param {ID} user - user ID
     * @return {ID[]} contact ID list
     */
    ContactDBI.prototype.getContacts = function (user) {};

    /**
     *  Save contact ID list
     *
     * @param {ID} user       - user ID
     * @param {ID[]} contacts - contact ID list
     * @return {boolean} false on error
     */
    ContactDBI.prototype.saveContacts = function (contacts, user) {};

    //-------- namespace --------
    ns.dbi.UserDBI    = UserDBI;
    ns.dbi.ContactDBI = ContactDBI;

})(DIMP);

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;

    /**
     *  Account DBI
     *  ~~~~~~~~~~~
     */
    var GroupDBI = Interface(null, null);

    /**
     *  Get founder ID
     *
     * @param {ID} group - group ID
     * @return {ID} group founder
     */
    GroupDBI.prototype.getFounder = function (group) {};

    /**
     *  Get owner ID
     *
     * @param {ID} group - group ID
     * @return {ID} group owner
     */
    GroupDBI.prototype.getOwner = function (group) {};

    //
    //  group members
    //

    /**
     *  Get member ID list
     *
     * @param {ID} group - group ID
     * @return {ID[]} member ID list
     */
    GroupDBI.prototype.getMembers = function (group) {};

    /**
     *  Save member ID list
     *
     * @param {ID} group     - group ID
     * @param {ID[]} members - member ID list
     * @return {boolean} false on error
     */
    GroupDBI.prototype.saveMembers = function (members, group) {};

    //
    //  bots for group
    //

    /**
     *  Get bot ID list
     *
     * @param {ID} group - group ID
     * @return {ID[]} bot ID list
     */
    GroupDBI.prototype.getAssistants = function (group) {};

    /**
     *  Save bot ID list
     *
     * @param {ID} group  - group ID
     * @param {ID[]} bots - bot ID list
     * @return {boolean} false on error
     */
    GroupDBI.prototype.saveAssistants = function (bots, group) {};

    //
    //  group admins
    //

    /**
     *  Get bot ID list
     *
     * @param {ID} group - group ID
     * @return {ID[]} admins
     */
    GroupDBI.prototype.getAdministrators = function (group) {};

    /**
     *  Save bot ID list
     *
     * @param {ID} group     - group ID
     * @param {ID[]} members - admins
     * @return {boolean} false on error
     */
    GroupDBI.prototype.saveAdministrators = function (members, group) {};

    //-------- namespace --------
    ns.dbi.GroupDBI = GroupDBI;

})(DIMP);

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;

    /**
     *  Account DBI
     *  ~~~~~~~~~~~
     */
    var GroupHistoryDBI = Interface(null, null);

    /**
     *  Save group commands:
     *      invite
     *      expel (deprecated)
     *      join
     *      quit
     *      reset
     *      resign
     *
     * @param {GroupCommand} content
     * @param {ReliableMessage} rMsg
     * @param {ID} group
     * @return {boolean}
     */
    GroupHistoryDBI.prototype.saveGroupHistory = function (content, rMsg, group) {};

    /**
     *  Load group commands:
     *      invite
     *      expel (deprecated)
     *      join
     *      quit
     *      reset
     *      resign
     *
     * @param {ID} group
     * @return {<GroupCommand, ReliableMessage>[]} List<Pair<GroupCommand, ReliableMessage>>
     */
    GroupHistoryDBI.prototype.getGroupHistories = function (group) {};

    /**
     *  Load last 'reset' group command
     *
     * @param {ID} group
     * @return {<ResetCommand, ReliableMessage>[]} List<Pair<ResetCommand, ReliableMessage>>
     */
    GroupHistoryDBI.prototype.getResetCommandMessage = function (group) {};

    /**
     *  Clean group commands for members:
     *      invite
     *      expel (deprecated)
     *      join
     *      quit
     *      reset
     *
     * @param {ID} group
     * @return {boolean}
     */
    GroupHistoryDBI.prototype.clearGroupMemberHistories = function (group) {};

    /**
     *  Clean group commands for administrators:
     *      resign
     *
     * @param {ID} group
     * @return {boolean}
     */
    GroupHistoryDBI.prototype.clearGroupAdminHistories = function (group) {};

    //-------- namespace --------
    ns.dbi.GroupHistoryDBI = GroupHistoryDBI;

})(DIMP);

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;

    var PrivateKeyDBI   = ns.dbi.PrivateKeyDBI;
    var MetaDBI         = ns.dbi.MetaDBI;
    var DocumentDBI     = ns.dbi.DocumentDBI;
    var UserDBI         = ns.dbi.UserDBI;
    var ContactDBI      = ns.dbi.ContactDBI;
    var GroupDBI        = ns.dbi.GroupDBI;
    var GroupHistoryDBI = ns.dbi.GroupHistoryDBI;

    /**
     *  Account DBI
     *  ~~~~~~~~~~~
     */
    var AccountDBI = Interface(null, [
        PrivateKeyDBI,
        MetaDBI, DocumentDBI,
        UserDBI, ContactDBI,
        GroupDBI, GroupHistoryDBI
    ]);

    //-------- namespace --------
    ns.dbi.AccountDBI = AccountDBI;

})(DIMP);
