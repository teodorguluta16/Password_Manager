const browserAPI = typeof browser !== "undefined" ? browser : chrome;

let decryptionKey = null;
browserAPI.runtime.onInstalled.addListener(() => {
    console.log("🔧 Extensie Manager Parole Instalata");
});

// aici fac interogarea in baza de date si extrag datele si le trimit pe urma in popup.js in format sjson
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPasswords") {
        fetch("http://localhost:9000/api/utilizator/itemi", { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include", })
            .then(response => response.json())
            .then(data => { console.log("📥 Parole primite în background.js:", data); sendResponse({ success: true, passwords: data }); })
            .catch(error => { console.error("❌ Eroare la preluarea parolelor:", error); sendResponse({ success: false, error: error.message }); });
        return true;
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
    console.warn("⚠️ Mesaj necunsocut:", request.action);
    sendResponse({ success: false, error: "Mesaj necunoscut" });
    return true;
});
