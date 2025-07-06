// Evităm eroare dacă s-a injectat de mai multe ori
if (typeof browserAPI === 'undefined') {
    var browserAPI = typeof browser !== "undefined" ? browser : chrome;
}

window.addEventListener("message", async function (event) {
    if (event.source !== window) return;
    if (event.origin !== "http://localhost:5173") return;


    console.log("📩 Mesaj primit în extensie:", event.data);  // ✅ log general
    if (event.data.type === "SYNC_DECRYPTION_KEY") {
        const key = event.data.key;
        console.log("🔑 Cheie primită de la aplicație:", key);

        chrome.runtime.sendMessage(
            { action: "syncDecryptionKey", key },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("❌ Eroare la trimiterea către background.js:", chrome.runtime.lastError.message);
                } else {
                    console.log("✅ Cheia trimisă cu succes către background.js");
                }
            }
        );

    }
    if (event.data.type === "LAUNCH_WITH_CREDENTIALS") {
        const creds = event.data.credentials;

        chrome.runtime.sendMessage({
            action: "launchTabWithCredentials",
            credentials: creds
        });
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

        let passScore = 0;
        if (type === "password") passScore += 5;
        if (name.includes("pass") || name.includes("parol")) passScore += 3;
        if (id.includes("pass") || id.includes("parola")) passScore += 3;
        if (placeholder.includes("parol") || placeholder.includes("pass")) passScore += 2;
        if (className.includes("pass")) passScore += 1;

        if (passScore > maxPassScore) {
            maxPassScore = passScore;
            parolaCamp = input;
        }
    });

    return (usernameCamp && parolaCamp) ? { usernameCamp, parolaCamp } : null;
}

function genereazaParolaPuternica(length) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let parola = "";
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
        parola += charset[array[i] % charset.length];
    }
    return parola;
}

function esteCampConfirmare(input) {
    const className = input.className?.toLowerCase() || "";
    const name = input.name?.toLowerCase() || "";

    if (name === "postcheckoutregisterform_retypedpassword" && className.includes("form-control")) {
        return true;
    }

    if (name === "confirmpassword" && className.includes("form-control")) {
        return true;
    }


    const text = [
        input.name,
        input.id,
        input.placeholder,
        input.getAttribute("aria-label") || ""
    ].join(" ").toLowerCase();

    const campIdentic = input.hasAttribute("data-bv-identical-field");

    const isProbablyConfirm = /\b(confirm|retype|again|repeta|parola2|retyped|password2)\b/i.test(text);

    return isProbablyConfirm || campIdentic;
}


function adaugaButonGenerare(parolaInput) {

    if (esteCampConfirmare(parolaInput))
        return;

    // Evităm dubluri
    if (parolaInput.parentElement.querySelector(".btn-gen-parola"))
        return;

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.gap = "8px";

    const btn = document.createElement("button");
    btn.innerText = "🔐 Generează";
    btn.className = "btn-gen-parola";
    btn.style.cursor = "pointer";
    btn.style.padding = "4px";
    btn.style.marginTop = "10px";
    btn.style.border = "3px solid rgb(6, 100, 11)";
    btn.style.color = "rgb(6, 100, 11)";
    btn.style.background = "rgb(255,255,255)";

    btn.addEventListener("mouseenter", () => {
        btn.style.backgroundColor = "rgb(6, 100, 11)";
        btn.style.color = "#fff";
    });

    btn.addEventListener("mouseleave", () => {
        btn.style.backgroundColor = "rgb(255,255,255)";
        btn.style.color = "rgb(6, 100, 11)";
    });

    const parolaVizibila = document.createElement("span");
    parolaVizibila.className = "parola-generata";
    parolaVizibila.style.padding = "6px 6px";
    parolaVizibila.style.width = "180px";
    parolaVizibila.style.marginTop = "10px";
    parolaVizibila.style.marginLeft = "20px";
    parolaVizibila.style.color = "rgb(0, 0, 0)";
    parolaVizibila.style.border = "2px solid rgb(6, 100, 11)";
    parolaVizibila.style.backgroundColor = "rgb(255, 255, 255)";
    parolaVizibila.style.userSelect = "text";

    parolaVizibila.textContent = ""; // inițial gol

    btn.onclick = (e) => {
        e.preventDefault();
        const parola = genereazaParolaPuternica(16);
        parolaInput.value = parola;
        parolaInput.dispatchEvent(new Event("input", { bubbles: true }));
        parolaVizibila.textContent = parola;
    };

    container.appendChild(btn);
    container.appendChild(parolaVizibila);

    parolaInput.parentElement.appendChild(container);
}


function esteVizibil(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);

    const hiddenByStyle = (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
    );

    const outOfPage = el.offsetParent === null && style.position !== "fixed";

    return !hiddenByStyle && !outOfPage;
}

const observer = new MutationObserver(() => {
    const passwordInputs = Array.from(document.querySelectorAll('input[type="password"]')).filter(esteVizibil);
    const usernameInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"]')).filter(esteVizibil);

    // Nu continuăm dacă nu avem niciun câmp relevant
    if (passwordInputs.length === 0) return;

    const input = passwordInputs[0]; // analizăm formularul legat de primul câmp de parolă

    const { isLogin, isRegister, isReset } = detectFormType(passwordInputs, usernameInputs, input);


    const alreadyAdded = input.parentElement.querySelector(".btn-gen-parola");

    if ((isRegister || isReset) && !alreadyAdded && !isLogin) {
        adaugaButonGenerare(input);
    }
});


observer.observe(document.body, { childList: true, subtree: true });

function esteInputDeAutentificare(input) {
    const type = input.type?.toLowerCase();
    if (!["text", "email", "password", "tel"].includes(type)) return false;

    const text = [
        input.name,
        input.id,
        input.placeholder,
        input.getAttribute("aria-label") || ""
    ].join(" ").toLowerCase();

    // Ignoră dacă pare că e search bar
    if (/search|căutare|cauta|what do you want to learn/.test(text)) return false;

    return true;
}

function ePlaceholderEmailFals(placeholder) {
    const pl = placeholder.toLowerCase();
    return /name@\w+\.\w+/.test(pl) || /\S+@\S+/.test(pl);
}
function tipFormularDupaButon(form) {
    const butoane = Array.from(form.querySelectorAll('button, input[type="submit"]')).filter(esteVizibil);
    const texte = butoane.map(b => (b.textContent || b.value || "").toLowerCase());

    const areRegister = texte.some(t => ["creează", "create", "sign up", "înregistrare", "register"].some(w => t.includes(w)));
    const areLogin = texte.some(t => ["login", "log in", "sign in", "conectare", "autentificare"].some(w => t.includes(w)));

    if (areRegister && !areLogin) return "register";
    if (areLogin && !areRegister) return "login";
    return "ambiguu";
}

function detectFormType(passwordInputs, usernameInputs, target) {
    const form = target.closest("form");
    const allInputs = form
        ? Array.from(form.querySelectorAll('input')).filter(i => esteVizibil(i) && esteInputDeAutentificare(i))
        : Array.from(document.querySelectorAll('input')).filter(i => esteVizibil(i) && esteInputDeAutentificare(i));

    if (passwordInputs.length === 0) {
        return { isLogin: false, isRegister: false, isReset: false };
    }

    const name = target.name?.toLowerCase() || "";
    const id = target.id?.toLowerCase() || "";
    const placeholder = target.placeholder?.toLowerCase() || "";
    const className = target.className?.toLowerCase() || "";
    const aria = target.getAttribute("aria-label")?.toLowerCase() || "";

    const text = [name, id, placeholder, className, aria].join(" ");

    const isLikelyOldPassword = text.includes("old");
    const isLikelyConfirmPassword = text.includes("confirm") || text.includes("confirmare");

    const registerHints = allInputs.filter(input => {
        const n = input.name?.toLowerCase() || "";
        const p = input.placeholder?.toLowerCase() || "";
        const aria = input.getAttribute("aria-label")?.toLowerCase() || "";

        return (
            n.includes("first") || n.includes("last") || n.includes("nume") || n.includes("prenume") || n.includes("fname") || n.includes("lname") || n.includes("username") ||
            (p.includes("nume") || p.includes("prenume") || p.includes("name") || p.includes("nume complet") || p.includes("username")) && !ePlaceholderEmailFals(p) ||
            aria.includes("nume")
        );
    });

    // detectează dacă e login simplu (ex: doar user + parola)
    console.log(isLikelyConfirmPassword);
    let isLogin = passwordInputs.length >= 1 && usernameInputs.length >= 1 && !isLikelyConfirmPassword;
    console.log("Deci login: ", isLogin);

    // scor pentru înregistrare
    let score = 0;

    if (passwordInputs.length >= 1) score += 1;
    if (registerHints.length >= 1) score += 2;

    if (usernameInputs.length >= 1) score += 1;

    const submitButtons = Array.from(document.querySelectorAll('button, input[type="submit"]'));


    if (isLogin && allInputs.length <= 4) score -= 2;
    if (allInputs.length === 2) {
        score = 2;
    }
    const hasRegisterButton = submitButtons.some(btn => {
        const t = (btn.textContent || btn.value || "").toLowerCase();
        return ["create", "sign up", "înregistrare", "register", "înainte"].some(w => t.includes(w));
    });

    if (hasRegisterButton) score += 2;

    const tipFormular = form ? tipFormularDupaButon(form) : "necunoscut";

    if (tipFormular === "register") score += 2;
    else if (tipFormular === "login") score -= 1;


    const urlPath = window.location.pathname.toLowerCase();
    const urlFull = window.location.href.toLowerCase();

    if (urlPath.includes("register") || urlPath.includes("signup") || urlFull.includes("join") || urlFull.includes("create"))
        score += 2;

    if (allInputs.length >= 4)
        score += 2;



    let isRegister = false;
    if (score >= 4)
        isRegister = true;

    if (isRegister) {
        isLogin = false;
    }

    if (passwordInputs.length === 1 && usernameInputs.length === 0) {
        isLogin = true; isRegister = false;
    }

    const isReset = (passwordInputs.length >= 1 && !isLikelyOldPassword && !isLikelyConfirmPassword && !isLogin && !isRegister);
    return { isLogin: isLogin, isRegister, isReset };

}

document.addEventListener("input", async (e) => {
    const target = e.target;

    if (target && target.type === "password") {
        const passwordInputs = Array.from(document.querySelectorAll('input[type="password"]'));
        const usernameInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"]'));

        const { isLogin, isRegister, isReset } = detectFormType(passwordInputs, usernameInputs, target);

        if ((isRegister || isReset) &&
            !target.parentElement.querySelector(".btn-gen-parola") && !isLogin) {
            adaugaButonGenerare(target);
        }
    }
});

document.addEventListener("submit", async (e) => {
    const form = e.target;
    const passwordInput = form.querySelector('input[type="password"]');
    const password = passwordInput?.value;

    if (password) {
        browserAPI.runtime.sendMessage({ action: "verificaParola", parola: password }, (response) => {
            if (response?.found) {
                alert("⚠️ Această parolă a fost găsită în breșe de securitate! Ar trebui să o schimbi.");
            }
        });
    }
}, true);


//if (window.location.protocol !== "https:") {
//    alert("⚠️ Atenție: Site-ul nu folosește o conexiune securizată (HTTPS)!");
//}

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


browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "FILL_CREDENTIALS") {
        const campuri = detectareCampuriLogin();
        if (campuri) {
            simulateTyping(campuri.usernameCamp, request.username)
                .then(() => simulateTyping(campuri.parolaCamp, request.password))
                .then(() => {
                    sendResponse({ success: true });
                });
            return true; // ⚠️ IMPORTANT: permite `sendResponse` asincron
        } else {
            sendResponse({ success: false });
        }
    }
});

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
        input.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    input.dispatchEvent(new Event("change", { bubbles: true }));
}
