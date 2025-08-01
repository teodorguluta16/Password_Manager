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
// Funcție pentru a salva cheia
const saveKeyInIndexedDB2 = async (key, salt) => {
    try {
        await db.keys.put({ id: 2, key: key, salt: salt });  // Salvăm cheia în obiectul de stocare 'keys'
        console.log("Cheia criptata cu saltul a fost salvată cu succes!");
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

const getKeyFromIndexedDB2 = async () => {
    try {
        const rezultat = await db.keys.get(2); // presupune că db este deja definit aici
        return rezultat;
    } catch (error) {
        console.error("Eroare la citirea cheii din IndexedDB", error);
        return null;
    }
};

// Șterge baza de date 'myDatabase'
// Doar asta păstrezi pentru ștergerea completă:
const deleteDatabase = async () => {
    try {
        await Dexie.delete("myDatabase");
        console.log("✅ Baza de date a fost ștearsă complet la delogare.");
    } catch (error) {
        console.error("❌ Eroare la ștergerea bazei de date:", error);
    }
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



export { saveKeyInIndexedDB, getKeyFromIndexedDB, deleteKeyFromIndexedDB, deleteDatabase, saveKeyInIndexedDB2, getKeyFromIndexedDB2 };