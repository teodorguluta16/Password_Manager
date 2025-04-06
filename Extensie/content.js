// Evităm eroare dacă s-a injectat de mai multe ori
if (typeof browserAPI === 'undefined') {
    var browserAPI = typeof browser !== "undefined" ? browser : chrome;
}

// Primește cheia de decriptare din pagina web
window.addEventListener("message", function (event) {
    if (event.source !== window) return;
    if (event.data.type === "SYNC_DECRYPTION_KEY") {
        const key = event.data.key;
        console.log("🧹 Content script a primit cheia de decriptare:", key);
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
        if (name.includes("pass") || name.includes("parola")) passScore += 3;
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

function adaugaButonGenerare(parolaInput) {
    const name = parolaInput.name?.toLowerCase() || "";
    const id = parolaInput.id?.toLowerCase() || "";

    // Dacă e confirmare parolă, ieșim direct
    if (name.includes("confirm") || id.includes("confirm")) return;

    // Evităm dubluri
    if (parolaInput.parentElement.querySelector(".btn-gen-parola")) return;

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
        parolaVizibila.textContent = parola; // afișăm parola generată
    };

    container.appendChild(btn);
    container.appendChild(parolaVizibila);

    parolaInput.parentElement.appendChild(container);
}

function detectareCampuriInregistrare() {

    const host = window.location.hostname;
    const path = window.location.pathname;

    // Excludem site-uri cunoscute unde NU vrem să afișăm butonul
    const excludeSites = [
        { host: "instagram.com", path: "/accounts/login" },
        //{ host: "ro.pinterest.com", path: "/" }, // la pinterest nu merge
        { host: "facebook.com", path: "/login" },
        { host: "teams.microsoft.com", path: "/" },
        { host: "login.microsoftonline.com", path: "/" },
        { host: "accounts.google.com", path: "/signin" },
        { host: "login.live.com", path: "/" },
        { host: "www.orange.ro", path: "/accounts/login" }
    ];

    const esteExclus = excludeSites.some(site =>
        host.includes(site.host) && path.startsWith(site.path)
    );

    if (esteExclus) return;

    // restul codului tău:
    const passwordInputs = Array.from(document.querySelectorAll('input[type="password"]'));

    const usernameInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]'))
        .filter(input => {
            const name = input.name?.toLowerCase() || "";
            const id = input.id?.toLowerCase() || "";
            const placeholder = input.placeholder?.toLowerCase() || "";

            return (
                name.includes("user") || name.includes("login") || name.includes("email") || name.includes("identifier") ||
                id.includes("user") || id.includes("login") || id.includes("email") || id.includes("identifier") ||
                placeholder.includes("user") || placeholder.includes("login") || placeholder.includes("email") || placeholder.includes("phone")
            );
        });

    if (usernameInputs.length === 0) return;

    console.log("AM AJUSN AICI");

    if (passwordInputs.length === 1) {
        const input = passwordInputs[0];
        const name = input.name?.toLowerCase() || "";
        const id = input.id?.toLowerCase() || "";

        if (!name.includes("confirm") && !id.includes("confirm")) {
            //adaugaButonGenerare(input);
        }

    } else if (passwordInputs.length >= 2) {
        const prim = passwordInputs[0];
        const name1 = prim.name?.toLowerCase() || "";
        const id1 = prim.id?.toLowerCase() || "";

        if (!name1.includes("confirm") && !id1.includes("confirm")) {
            //adaugaButonGenerare(prim);
        }
    }
}

function detectareCampSchimbareParolaNoua() {

    const host = window.location.hostname;
    const path = window.location.pathname.toLowerCase();

    const esteSchimbareParola = (
        path.includes("change") ||
        path.includes("password") ||
        path.includes("reset") ||
        path.includes("account")
    );

    // if (!esteSchimbareParola) return;

    const passwordInputs = Array.from(document.querySelectorAll('input[type="password"]'));

    passwordInputs.forEach(input => {
        const name = input.name?.toLowerCase() || "";
        const id = input.id?.toLowerCase() || "";

        const esteConfirmare = name.includes("confirm") || id.includes("confirm");
        const esteParolaVeche = name.includes("old") || id.includes("old");

        if (!esteConfirmare && !esteParolaVeche) {
            //adaugaButonGenerare(input);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    detectareCampSchimbareParolaNoua();
    detectareCampuriInregistrare();

    setTimeout(() => {
        detectareCampSchimbareParolaNoua();
        detectareCampuriInregistrare();

    }, 1500);
});

const observer = new MutationObserver(() => {
    const passwordInputs = Array.from(document.querySelectorAll('input[type="password"]'));
    const usernameInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"]'));

    passwordInputs.forEach(input => {
        const name = input.name?.toLowerCase() || "";
        const id = input.id?.toLowerCase() || "";

        const isLoginForm = passwordInputs.length === 1 && usernameInputs.length >= 1;

        const isRegisterForm = passwordInputs.length === 2 &&
            passwordInputs[0].name !== passwordInputs[1].name;

        const isResetForm = (
            passwordInputs.length >= 1 &&
            !name.includes("old") &&
            !name.includes("confirm") &&
            !id.includes("old") &&
            !id.includes("confirm") &&
            !isLoginForm
        );

        const alreadyAdded = input.parentElement.querySelector(".btn-gen-parola");

        if ((isRegisterForm || isResetForm) && !alreadyAdded) {
            adaugaButonGenerare(input);
            console.log("🔁 Observer a adăugat buton pe:", input);
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });


//const observer = new MutationObserver(() => {
//    detectareCampuriInregistrare();
//    detectareCampSchimbareParolaNoua(); // <<--- observe și pentru asta
//});
//observer.observe(document.body, { childList: true, subtree: true });

/*document.addEventListener("input", async (e) => {
    const target = e.target;
    if (target.type === "password") {
        const password = target.value;
        if (password.length > 4) {
            browserAPI.runtime.sendMessage({ action: "verificaParola", parola: password }, (response) => {
                if (response?.found) {
                    alert("⚠️ Parola introdusă a fost compromisă în breșe de securitate!");
                }
            });
        }
    }
});*/


function detectFormType(passwordInputs, usernameInputs, target) {
    //console.log("Target: ", target);

    const allInputs = Array.from(document.querySelectorAll('input'));

    const name = target.name?.toLowerCase() || "";
    const id = target.id?.toLowerCase() || "";
    const placeholder = target.placeholder?.toLowerCase() || "";
    const className = target.className?.toLowerCase() || "";
    const aria = target.getAttribute("aria-label")?.toLowerCase() || "";

    const text = [name, id, placeholder, className, aria].join(" ");

    const isLikelyOldPassword = text.includes("old");
    const isLikelyConfirmPassword = text.includes("confirm") || text.includes("confirmare");

    console.log("Toate intrarile: ", allInputs);
    const registerHints = allInputs.filter(input => {
        const n = input.name?.toLowerCase() || "";
        const p = input.placeholder?.toLowerCase() || "";
        const aria = input.getAttribute("aria-label")?.toLowerCase() || "";
        return (
            n.includes("first") || n.includes("last") || n.includes("nume") || n.includes("prenume") || n.includes("fname") || n.includes("lname") ||
            p.includes("nume") || p.includes("prenume") || p.includes("name") || p.includes("nume complet") ||
            aria.includes("nume")
        );
    });

    // detectează dacă e login simplu (ex: doar user + parola)
    let isLogin = passwordInputs.length === 1 && usernameInputs.length >= 1 && !isLikelyConfirmPassword;
    console.log("Deci login: ", isLogin);

    // scor pentru înregistrare
    let score = 0;

    //if (passwordInputs.length >= 1 && passwordInputs[0].name !== passwordInputs[1].name) score += 3;
    if (passwordInputs.length >= 1) score += 1;
    if (registerHints.length >= 1) score += 2;

    console.log(registerHints);
    console.log("Scorul33 este: ", score);

    console.log("all inputs lenght: ", allInputs.length);
    if (usernameInputs.length >= 1) score += 1;


    // bonus dacă avem un buton cu "creează cont" sau similar
    const submitButtons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
    console.log("Butonul de submit este: ", submitButtons);
    const hasRegisterButton = submitButtons.some(btn => {
        const t = (btn.textContent || btn.value || "").toLowerCase();
        return ["creează", "create", "sign up", "înregistrare", "register", "înainte"].some(w => t.includes(w));
    });
    if (hasRegisterButton) score += 2;


    // penalizare dacă e doar login clasic
    if (isLogin && allInputs.length <= 4) score -= 2;

    console.log("Scorul este: ", score);

    //const isRegister = score >= 4;

    let isRegister = false;
    if (score >= 4)
        isRegister = true;

    if (isRegister) {
        console.log("ATAT");
        isLogin = false;
        console.log("IsLogin: ", isLogin);
    }


    const isReset = (
        passwordInputs.length >= 1 &&
        !isLikelyOldPassword &&
        !isLikelyConfirmPassword &&
        !isLogin &&
        !isRegister
    );

    return {
        isLogin: isLogin,
        isRegister,
        isReset
    };

}

document.addEventListener("input", async (e) => {
    const target = e.target;

    if (target && target.type === "password") {
        const passwordInputs = Array.from(document.querySelectorAll('input[type="password"]'));
        const usernameInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"]'));

        const { isLogin, isRegister, isReset } = detectFormType(passwordInputs, usernameInputs, target);

        console.log("📌 INPUT detectat — login:", isLogin, "register:", isRegister, "reset:", isReset);

        if ((isRegister || isReset) &&
            !target.parentElement.querySelector(".btn-gen-parola") && !isLogin) {
            adaugaButonGenerare(target);
        }

        const password = target.value;
        if (password.length > 4) {
            browserAPI.runtime.sendMessage({ action: "verificaParola", parola: password }, (response) => {
                if (response?.found) {
                    alert("⚠️ Parola introdusă este compromisă. Încearcă alta sau genereză automat una nouă ! ⚠️");
                }
            });
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
            simulateTyping(campuri.usernameCamp, request.username);
            simulateTyping(campuri.parolaCamp, request.password);
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
