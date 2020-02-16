;
//! require 'table.js'

!function (ns) {
    'use strict';

    let IndexedDB = function(){
        this.dbName = 'dim';
        this.dbVersion = 6;
        this.dbUpgrade = function (db) {
            let objectStore;
            if(!db.objectStoreNames.contains("messages")) {
                objectStore = db.createObjectStore('messages', {autoIncrement: true});
            }
            if(!db.transaction.objectStore('messages').indexNames.contains('sender')) {
                db.transaction.objectStore('messages').createIndex('sender', 'sender', {unique: false});
            }
            if(!db.transaction.objectStore('messages').indexNames.contains('receiver')) {
                db.transaction.objectStore('messages').createIndex('receiver', 'receiver', {unique: false});
            }
            if(!db.transaction.objectStore('messages').indexNames.contains('owner')) {
                db.transaction.objectStore('messages').createIndex('owner', 'owner', {unique: false});
            }
            if(!db.transaction.objectStore('messages').indexNames.contains('time')) {
                db.transaction.objectStore('messages').createIndex('time', 'time', {unique: false});
            }

            if(!db.objectStoreNames.contains("contacts")) {
                objectStore = db.createObjectStore('contacts', {autoIncrement: true});
            }
            if(!db.transaction.objectStore('contacts').indexNames.contains('owner')) {
                db.transaction.objectStore('contacts').createIndex('owner', 'owner', {unique: false});
            }
        };
    };

    let MessageTable = function () {
    };

    MessageTable.prototype.loadMessages = async function (ownerIdentifier) {
        let db1 = await idb.openDb(ns.db.IndexedDB.dbName, ns.db.IndexedDB.dbVersion, upgradeDB => ns.db.IndexedDB.dbUpgrade(upgradeDB));

        let tx = await db1.transaction('messages', 'readonly');
        let messages = tx.objectStore('messages');
        let index = messages.index('owner');
        let result = await index.getAll(ownerIdentifier.toString());
        return result;
    };
    MessageTable.prototype.saveMessage = async function (msg, ownerIdentifirer) {
        // let db1 = await ns.db.IndexedDB.open();
        let record = msg;
        record.owner = ownerIdentifirer.toString();
        let db1 = await idb.openDb(ns.db.IndexedDB.dbName, ns.db.IndexedDB.dbVersion, upgradeDB => ns.db.IndexedDB.dbUpgrade(upgradeDB));

        let tx = await db1.transaction('messages', 'readwrite');
        let messages = tx.objectStore('messages');

        await messages.add(record);

        await tx.complete;
        db1.close();
    };

    //-------- namespace --------
    ns.db.IndexedDB = new IndexedDB();
    ns.db.MessageTable = new MessageTable();
}(DIMP);
