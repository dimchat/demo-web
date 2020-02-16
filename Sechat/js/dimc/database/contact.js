;
//! require 'table.js'
function Contact(owner, identifier, meta, profile) {
    this.owner = owner;
    this.identifier = identifier;
    this.meta = meta;
    this.profile = null;
    // profile 不一定有, 没有的话, 需要去服务器尝试获取, 也不一定获取得到
    if (profile)
    {
        this.profile = profile;
    }
}

Contact.prototype.toJson = function () {
    let j = {};
    j.owner = this.owner.toString();
    j.identifier = this.identifier.toString();
    j.meta = this.meta.toJSON();
    j.profile = null;
    if(this.profile)
    {
        j.profile = this.profile.toJSON();
        // j.profile.data = JSON.parse(j.profile.data);
    }
    return j;
};

!function (ns) {
    'use strict';

    let IndexedDB = ns.db.IndexedDB;

    let ContactTable = function () {
    };

    ContactTable.prototype.loadContacts = async function (ownerIdentifier) {
        let db1 = await idb.openDb(IndexedDB.dbName, IndexedDB.dbVersion, upgradeDB => IndexedDB.dbUpgrade(upgradeDB));

        let tx = await db1.transaction('contacts', 'readonly');
        let Contacts = tx.objectStore('contacts');
        let index = Contacts.index('owner');
        let result = await index.getAll(ownerIdentifier.toString());
        return result;
    };
    ContactTable.prototype.saveContact = async function (contact) {
        // let db1 = await ns.db.IndexedDB.open();
        let record = contact.toJson();
        let db1 = await idb.openDb(ns.db.IndexedDB.dbName, ns.db.IndexedDB.dbVersion, upgradeDB => ns.db.IndexedDB.dbUpgrade(upgradeDB));

        let tx = await db1.transaction('contacts', 'readwrite');
        let Contacts = tx.objectStore('contacts');

        await Contacts.add(record);

        await tx.complete;
        db1.close();
    };

    //-------- namespace --------
    ns.db.ContactTable = new ContactTable();
}(DIMP);
