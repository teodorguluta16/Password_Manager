import React, { createContext, useState, useContext, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const Context = createContext();

export const useKeySimetrica = () => useContext(Context); // Hook pentru a folosi cheia simetrică

import Dexie from 'dexie';

// Creăm baza de date
const db = new Dexie("myDatabase");

// Definim obiectele de stocare
db.version(1).stores({
    keys: 'id,key'  // Definim un store pentru chei cu ID-ul și cheia
});

// Funcție pentru a salva cheia
const saveKeyInIndexedDB = async (key) => {
    try {
        await db.keys.put({ id: 1, key: key });  // Salvăm cheia în obiectul de stocare 'keys'
        console.log("Cheia a fost salvată cu succes!");
    } catch (error) {
        console.error("Eroare la salvarea cheii în IndexedDB", error);
    }
};

// Funcție pentru a citi cheia
const getKeyFromIndexedDB = async () => {
    try {
        const key = await db.keys.get(1);  // Obținem cheia cu id-ul 1
        return key ? key.key : null;
    } catch (error) {
        console.error("Eroare la citirea cheii din IndexedDB", error);
        return null;
    }
};

// Șterge baza de date 'myDatabase'
const deleteDatabase = () => {
    const request = indexedDB.deleteDatabase('myDatabase');

    request.onsuccess = function () {
        console.log("Baza de date a fost ștearsă cu succes.");
    };

    request.onerror = function () {
        console.error("A apărut o eroare la ștergerea bazei de date.");
    };
};

const deleteKeyFromIndexedDB = () => {
    const request = indexedDB.open('myDatabase', 1); // Deschidem baza de date

    request.onsuccess = function (e) {
        const db = e.target.result;
        const transaction = db.transaction('keys', 'readwrite');
        const store = transaction.objectStore('keys');
        store.delete(1); // Ștergem cheia cu id-ul 1
        console.log("Cheia a fost ștearsă");
    };

    request.onerror = function (e) {
        console.error('Error deleting key from IndexedDB', e);
    };
};



// Provider-ul pentru cheia simetrică
export const ProviderSimetricKey = ({ children }) => {
    const [key, setKey] = useState(null);

    return (
        <Context.Provider value={{ key, setKey }}>{children}</Context.Provider>
    );
};



export { saveKeyInIndexedDB, getKeyFromIndexedDB };