import sha1 from "./sha1.mjs";

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

let decryptionKey = null;
browserAPI.runtime.onInstalled.addListener(() => {
    console.log("🔧 Extensie Manager Parole Instalata");
});

// aici fac interogarea in baza de date si extrag datele si le trimit pe urma in popup.js in format sjson
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
                console.log("📥 Parole primite în background.js:", data);
                sendResponse({ success: true, passwords: data });
            })
            .catch(error => {
                console.error("❌ Eroare la autentificare:", error);
                sendResponse({ success: false, error: "Eroare la autentificare" });
            });
        return true;  // important pentru a păstra canalul deschis până când se trimite răspunsul
    }
    if (request.action === "syncDecryptionKey") {
        decryptionKey = request.key;
        console.log("🔑 Cheia este in plugin:", decryptionKey);
        sendResponse({ success: true });
        return true;
    }
    if (request.action === "getDecryptionKey") {
        if (decryptionKey) {
            sendResponse({ success: true, key: decryptionKey });
        } else {
            sendResponse({ success: false, error: "Cheia nu este in background.js" });
        }
        return true;
    }

    if (request.action === "verificaParola") {
        const parola = request.parola;
        console.log("SUNT AICI !!!!!");
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

        return true; // ⬅️ păstrează canalul async deschis
    }

    console.warn("⚠️ Mesaj necunoscut:", request.action);
    sendResponse({ success: false, error: "Mesaj necunoscut" });
    return true;
});

