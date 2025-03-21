const browserAPI = typeof browser !== "undefined" ? browser : chrome;

window.addEventListener("message", function (event) {
    if (event.source !== window) return;
    if (event.data.type === "SYNC_DECRYPTION_KEY") {
        const key = event.data.key;
        console.log("🧩 Content script a primit cheia de decriptare:", key);
        browserAPI.runtime.sendMessage({ action: "syncDecryptionKey", key: key },
            (response) => {
                if (browserAPI.runtime.lastError) {
                    console.error("❌ Eroare la trimiterea către background.js:", browserAPI.runtime.lastError.message);
                } else {
                    console.log("✅ Reusit background.js:", response);
                }
            }
        );
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("form");
    if (loginForm) {
        console.log("🔍 Formular detectat pe pagină");

        // Exemplu simplu - DOAR pentru test (în viitor, completezi cu date reale)
        /*
        loginForm.querySelector("input[type='email']")?.value = "user@example.com";
        loginForm.querySelector("input[type='password']")?.value = "parola123";
        */
    }
});
