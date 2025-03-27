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

const siteRules = {
    "facebook.com": {
        username: "input#email",
        password: "input#pass"
    },
    "instagram.com": {
        username: "input[name='username']",
        password: "input[name='password']"
    },
    "linkedin.com": {
        username: "input#username",
        password: "input#password"
    },
    "reddit.com": {
        username: "input#loginUsername",
        password: "input#loginPassword"
    }
};

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

    setTimeout(() => {
        const campuri = detectareCampuriLogin();
        if (campuri) {
            console.log("✅ [Fallback] Câmpuri login detectate după timeout:", campuri);
        } else {
            console.warn("❌ [Fallback] Nici după timeout nu am găsit câmpurile.");
        }
    }, 1500);
});
