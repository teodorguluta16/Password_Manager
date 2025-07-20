
import { decripteazaItemi, genereazaCheiaLocal } from "./functiiprocesaredate.js";
import { saveKeyInIndexedDB, getKeyFromIndexedDB } from "./salveazaCheieIndexDB.js";

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

export async function initKeyAndPasswords() {
    try {
        const response = await new Promise((resolve, reject) => {
            browserAPI.runtime.sendMessage({ action: "getDecryptionKey" }, (response) => {
                if (response.success && response.key) {
                    resolve(response.key);
                } else {
                    console.warn("Nu am primit cheia de decriptare! O voi lua din IndexDB");
                    resolve(null);
                }
            });
        });

        let encodedKey = response;
        if (!encodedKey) {
            //encodedKey = await getKeyFromIndexedDB();
            const encodedKey = await chrome.storage.session.get("decryptionKey");
            if (!encodedKey) {
                console.error("❌ Nu am găsit cheia nici în IndexedDB.");
                return [];
            }
        }

        await new Promise((resolve, reject) => {
            browserAPI.runtime.sendMessage({ action: "syncDecryptionKey", key: encodedKey }, (response) => {
                if (response.success) {
                    console.log("✅ Cheia a fost sincronizată cu succes!");
                    resolve();
                } else {
                    console.error("❌ Eroare la sincronizarea cheii");
                    reject();
                }
            });
        });

        const passwordResponse = await new Promise((resolve, reject) => {
            browserAPI.runtime.sendMessage({ action: "getPasswords" }, (response) => {
                if (response.success) {
                    resolve(response.passwords);
                } else {
                    console.error("Eroare la primirea parolelor:", response.error);
                    reject();
                }
            });
        });

        const paroleDecriptate = await decripteazaItemi(passwordResponse, encodedKey);
        return paroleDecriptate;

    } catch (error) {
        console.error("Eroare la preluarea cheii sau parolelor:", error);
        return [];
    }
}


export async function initKeyAndPasswords2(password) {
    try {
        const encodedKey = await genereazaCheiaLocal(password);

        if (!encodedKey || encodedKey === "null" || encodedKey === "undefined") {
            console.warn("⚠️ Cheia generată este invalidă. Nu continuăm.");
            return [];
        }
        else {
            await chrome.storage.session.set({ decryptionKey: encodedKey });
        }

        //await saveKeyInIndexedDB(encodedKey);


        const syncResult = await new Promise((resolve) => {
            browserAPI.runtime.sendMessage({ action: "syncDecryptionKey", key: encodedKey }, resolve);
        });

        if (!syncResult || !syncResult.success) {
            console.error("❌ Eroare la sincronizarea cheii");
            return [];
        }

        const passwordResult = await new Promise((resolve) => {
            browserAPI.runtime.sendMessage({ action: "getPasswords" }, resolve);
        });

        if (!passwordResult || !passwordResult.success) {
            console.error("Eroare la primirea parolelor:", passwordResult.error);
            return [];
        }

        const paroleDecriptate = await decripteazaItemi(passwordResult.passwords, encodedKey);
        return paroleDecriptate;

    } catch (error) {
        console.error("Eroare la preluarea cheii sau parolelor:", error);
        return [];
    }
}
