export function saveKeyInIndexedDB(key) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("passwordManagerDB", 2);

        request.onerror = (event) => {
            console.error("Eroare la accesarea IndexedDB:", event.target.error);
            reject("Eroare la accesarea IndexedDB");
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("keys", "readwrite");
            const store = transaction.objectStore("keys");

            const putRequest = store.put({ id: 1, key: key });

            putRequest.onerror = (event) => {
                console.error("Eroare la salvarea cheii în IndexedDB:", event.target.error);
                reject("Eroare la salvarea cheii în IndexedDB");
            };

            putRequest.onsuccess = () => {
                console.log("Cheia a fost salvată cu succes în IndexedDB.");
                resolve();
            };
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("keys")) {
                db.createObjectStore("keys", { keyPath: "id" });
                console.log("Obiectul de stocare 'keys' a fost creat.");
            }
        };
    });
}

export function getKeyFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("passwordManagerDB", 2);

        request.onerror = (event) => {
            console.error("Eroare la accesarea IndexedDB:", event.target.error);
            reject("Eroare la accesarea IndexedDB");
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("keys", "readonly");
            const store = transaction.objectStore("keys");
            const getRequest = store.get(1);

            getRequest.onerror = () => reject("Eroare la citirea cheii din IndexedDB");
            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    resolve(getRequest.result.key);
                } else {
                    reject("Cheia de criptare nu a fost găsită în IndexedDB");
                }
            };
        };
    });
}