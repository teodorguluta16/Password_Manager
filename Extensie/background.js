import sha1 from "./sha1.mjs";

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

let decryptionKey = null;
browserAPI.runtime.onInstalled.addListener(() => {
    console.log("🔧 Extensie Manager Parole Instalata");
});

// aici fac interogarea in baza de date si extrag datele si le trimit pe urma in popup.js in format sjson
let alreadyLaunched = false;
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPasswords") {
        // Înlocuim async/await cu promisiuni
        fetch("http://localhost:9000/api/auth/me", { method: "GET", credentials: "include", })
            .then(response => {
                if (response.ok) {
                    return fetch("http://localhost:9000/api/utilizator/itemi", {
                        method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include",
                    });
                } else {
                    console.error("❌ Eroare Utilizatorul nu este autentificat");
                    sendResponse({ success: false, error: "Nu esti autentificat !" });
                    return Promise.reject("Utilizatorul nu este autentificat");
                }
            })
            .then(itemiResponse => {
                if (itemiResponse.ok) {
                    return itemiResponse.json();
                } else {
                    console.error("❌ Eroare la preluarea parolelor:", itemiResponse.statusText);
                    sendResponse({ success: false, error: itemiResponse.statusText });
                    return Promise.reject("Eroare la preluarea parolelor");
                }
            })
            .then(data => {
                sendResponse({ success: true, passwords: data });
            })
            .catch(error => {
                console.error("❌ Eroare la autentificare:", error);
                sendResponse({ success: false, error: "Eroare la autentificare" });
            });
        return true;  // important pentru a păstra canalul deschis până când se trimite răspunsul
    }
    if (request.action === "syncDecryptionKey") {
        const key = request.key;
        console.log("📥 Cheie primită în background.js:", key);

        chrome.storage.session.set({ decryptionKey: key })
            .then(() => {
                console.log("✅ Cheia salvată în chrome.storage.session");
                sendResponse({ success: true });
            })
            .catch((err) => {
                console.error("❌ Eroare la salvare în storage.session:", err);
                sendResponse({ success: false, error: err.message });
            });

        return true; // ✅ IMPORTANT: pentru a permite `sendResponse` asincron
    }

    /*if (request.action === "getDecryptionKey") {
        if (decryptionKey) {
            sendResponse({ success: true, key: decryptionKey });
        } else {
            sendResponse({ success: false, error: "Cheia nu este in background.js" });
        }
        return true;
    }*/

    if (request.action === "getDecryptionKey") {
        chrome.storage.session.get("decryptionKey", (result) => {
            const key = result.decryptionKey;
            if (key) {
                sendResponse({ success: true, key });
            } else {
                sendResponse({ success: false, error: "Cheia nu este stocată" });
            }
        });
        return true;
    }

    if (request.action === "verificaParola") {
        const parola = request.parola;
        sha1(parola).then(hash => {
            const prefix = hash.slice(0, 5);
            const suffix = hash.slice(5).toUpperCase();

            fetch(`https://api.pwnedpasswords.com/range/${prefix}`)
                .then(res => res.text())
                .then(text => {
                    const line = text.split("\n").find(line => line.startsWith(suffix));
                    const count = line ? parseInt(line.split(":")[1]) : 0;

                    // trimitem doar o dată răspunsul
                    sendResponse({ found: count > 0, count });
                })
                .catch(err => {
                    console.error("Eroare la verificarea HIBP:", err);
                    sendResponse({ found: false, count: 0 });
                });
        });

        return true;
    }


    if (request.action === "launchTabWithCredentials") {
        if (alreadyLaunched) {
            console.warn("⚠️ Tab deja lansat. Ignorăm.");
            return;
        }

        alreadyLaunched = true;
        setTimeout(() => alreadyLaunched = false, 5000); // prevenim spamul

        const { username, parola, url } = request.credentials;

        chrome.storage.local.set({
            credentiale_temporare: { username, password: parola, url }
        }, () => {
            chrome.tabs.create({ url });
        });
    }

    console.warn("⚠️ Mesaj necunoscut:", request.action);
    sendResponse({ success: false, error: "Mesaj necunoscut" });
    return true;
});

// Aparent asta lipstea nuj de ce verifica pe stick pr mai vechi
browserAPI.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url?.startsWith("http")) {
        browserAPI.storage.local.get("credentiale_temporare", (data) => {
            const creds = data.credentiale_temporare;
            if (!creds || !creds.username || !creds.password || !creds.url) return;

            const { username, password, url } = creds;
            const targetDomain = new URL(url).hostname;

            if (!tab.url.includes(targetDomain)) return;

            // 🔐 Timeout de siguranță: șterge datele după 15 secunde, chiar dacă ceva nu merge
            const fallbackTimer = setTimeout(() => {
                browserAPI.storage.local.remove("credentiale_temporare", () => {
                    console.log("⏱️ Timeout: credențialele au fost șterse automat după 15s.");
                });
            }, 15000);

            // 📨 Trimite mesaj către content script
            browserAPI.tabs.sendMessage(tabId, {
                type: "FILL_CREDENTIALS",
                username,
                password
            }, (res) => {
                if (browserAPI.runtime.lastError) {
                    console.warn("⚠️ Nu am putut trimite către content script:", browserAPI.runtime.lastError.message);
                } else if (res?.success) {
                    clearTimeout(fallbackTimer); // ✅ dacă merge, anulăm timeout-ul
                    browserAPI.storage.local.remove("credentiale_temporare", () => {
                        console.log("✅ Credențialele temporare au fost șterse după completare.");
                    });
                } else {
                    console.warn("⚠️ Autocompletarea a eșuat. Credențialele NU au fost șterse imediat.");
                }
            });
        });
    }
});
