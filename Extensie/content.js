// Evităm eroare dacă s-a injectat de mai multe ori
if (typeof browserAPI === 'undefined') {
    var browserAPI = typeof browser !== "undefined" ? browser : chrome;
}

// Primește cheia de decriptare din pagina web
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

// Caută câmpurile de login
function detectareCampuriLogin() {
    const inputs = Array.from(document.querySelectorAll("input"));
    let usernameCamp = null;
    let parolaCamp = null;
    let maxUserScore = 0;
    let maxPassScore = 0;

    inputs.forEach(input => {
        const type = input.getAttribute("type")?.toLowerCase() || "";
        const name = input.getAttribute("name")?.toLowerCase() || "";
        const id = input.getAttribute("id")?.toLowerCase() || "";
        const placeholder = input.getAttribute("placeholder")?.toLowerCase() || "";
        const className = input.className?.toLowerCase() || "";

        // scor pentru username
        let userScore = 0;
        if (["text", "email"].includes(type)) userScore += 2;
        if (name.includes("user") || name.includes("login") || name.includes("email")) userScore += 3;
        if (id.includes("user") || id.includes("login")) userScore += 3;
        if (placeholder.includes("email") || placeholder.includes("user") || placeholder.includes("login")) userScore += 2;
        if (className.includes("user")) userScore += 1;

        if (userScore > maxUserScore) {
            maxUserScore = userScore;
            usernameCamp = input;
        }

        // scor pentru parolă
        let passScore = 0;
        if (type === "password") passScore += 5;
        if (name.includes("pass") || name.includes("parola")) passScore += 3;
        if (id.includes("pass") || id.includes("parola")) passScore += 3;
        if (placeholder.includes("parol") || placeholder.includes("pass")) passScore += 2;
        if (className.includes("pass")) passScore += 1;

        if (passScore > maxPassScore) {
            maxPassScore = passScore;
            parolaCamp = input;
        }
    });

    if (usernameCamp && parolaCamp) {
        return { usernameCamp, parolaCamp };
    } else {
        return null;
    }
}

// Simulează tastarea caracter cu caracter
async function simulateTyping(input, value) {
    input.focus();
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    for (let char of value) {
        const keyEvent = new KeyboardEvent("keydown", {
            bubbles: true,
            cancelable: true,
            key: char
        });
        input.dispatchEvent(keyEvent);

        input.value += char;

        const inputEvent = new Event("input", { bubbles: true });
        input.dispatchEvent(inputEvent);

        await new Promise(resolve => setTimeout(resolve, 50)); // mic delay între caractere
    }

    input.dispatchEvent(new Event("change", { bubbles: true }));
}


// Primește mesajul de autocompletare de la popup/background
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "FILL_CREDENTIALS") {
        console.log("📥 Cerere de autocompletare primită:", request);

        const campuri = detectareCampuriLogin();
        if (campuri) {
            simulateTyping(campuri.usernameCamp, request.username);
            simulateTyping(campuri.parolaCamp, request.password);

            console.log("✨ Câmpurile au fost completate prin simulare tastare.");
        } else {
            console.warn("⚠️ Nu s-au găsit câmpuri de username și parolă.");
        }
    }
});

// Detectare formular și fallback timeout (pentru pagini lente sau SPA)
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("form");
    if (loginForm) {
        console.log("🔍 Formular detectat pe pagină");
    }

    chrome.storage.local.get(["credentiale_temporare"], (result) => {
        const creds = result.credentiale_temporare;
        if (creds && window.location.hostname === new URL(creds.url).hostname) {
            const campuri = detectareCampuriLogin();
            if (campuri) {
                simulateTyping(campuri.usernameCamp, creds.username);
                simulateTyping(campuri.parolaCamp, creds.parola); // ai câmpul numit `parola`
                console.log("✅ Autocompletare cu credentiale temporare (din Launch)");

                // ștergem imediat credentialele ca să nu se refolosească din greșeală
                chrome.storage.local.remove("credentiale_temporare");
            }
        }
    });

    setTimeout(() => {
        const campuri = detectareCampuriLogin();
        if (campuri) {
            console.log("✅ [Fallback] Câmpuri login detectate după timeout:", campuri);
        } else {
            console.warn("❌ [Fallback] Nici după timeout nu am găsit câmpurile.");
        }
    }, 1500);
});

function observeForm() {
    const observer = new MutationObserver(() => {
        const form = document.querySelector("form");
        if (form) {
            console.log("🔍 Formular detectat dinamic");
            observer.disconnect(); // oprește observarea după ce a fost găsit
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}


function tryAutofillFromStorage(retries = 10, interval = 300) {
    chrome.storage.local.get(["credentiale_temporare"], (result) => {
        const creds = result.credentiale_temporare;
        if (!creds || window.location.hostname !== new URL(creds.url).hostname) return;

        const attemptAutofill = () => {
            const campuri = detectareCampuriLogin();
            if (campuri) {
                simulateTyping(campuri.usernameCamp, creds.username);
                simulateTyping(campuri.parolaCamp, creds.password || creds.parola);
                console.log("✅ Autocompletare reușită!");
                chrome.storage.local.remove("credentiale_temporare");
                return true;
            }
            return false;
        };

        // Prima încercare
        if (attemptAutofill()) return;

        // Retry de până la X ori
        let attempts = 0;
        const retryInterval = setInterval(() => {
            attempts++;
            if (attemptAutofill() || attempts >= retries) {
                clearInterval(retryInterval);
                if (attempts >= retries) {
                    console.warn("❌ Autofill a eșuat după mai multe încercări.");
                }
            }
        }, interval);
    });
}


document.addEventListener("DOMContentLoaded", () => {
    observeForm();
    tryAutofillFromStorage();
});
window.addEventListener("load", tryAutofillFromStorage); // fallback mai târziu

window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    if (event.data.type === "SYNC_CREDENTIALS_TO_EXTENSION") {
        const creds = event.data.credentials;
        console.log("🔐 Am primit credentialele din aplicația React:", creds);

        chrome.storage.local.set({ credentiale_temporare: creds }, () => {
            console.log("✅ Credentialele au fost salvate în storage");
        });
    }
});




/// verificare alertare utilizatori
// Verifică dacă e HTTPS
if (window.location.protocol !== "https:") {
    alert("⚠️ Atenție: Site-ul nu folosește o conexiune securizată (HTTPS)!");
}
if (window.location.protocol === "https:") {
    const suspiciousDomains = [
        "amaz0n-login.com",
        "secure-facebook-login.net",
        "paypal-secure-checkin.com",
        "login-microsoft-support.com",
        "google-verificare.com"
    ];

    const currentDomain = window.location.hostname;

    const isSuspicious = suspiciousDomains.some(suspect => currentDomain.includes(suspect));

    if (isSuspicious) {
        alert("⚠️ Aceasta pagina pare suspecta ! Verifica cu antentie adresa URL.");
    }
}

// Ascultă evenimentul de submit pe formularul de login
document.addEventListener("submit", async (e) => {
    const form = e.target;
    const passwordInput = form.querySelector('input[type="password"]');
    const password = passwordInput?.value;

    console.log("🟢 Submit detectat!");

    if (password) {
        console.log("🟢 Parolă detectată:", password);
        browserAPI.runtime.sendMessage({ action: "verificaParola", parola: password }, (response) => {
            console.log("🧪 Răspuns HIBP:", response);
            if (response?.found) {
                alert("⚠️ Această parolă a fost găsită în breșe de securitate! Ar trebui să o schimbi.");
                return true;
            }
        });
    }
}, true); // <== folosește captura





