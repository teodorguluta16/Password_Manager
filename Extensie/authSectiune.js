import { hashPassword, deriveSessionKeyFromPIN, generatePIN, deriveKeyWebCrypto, decodeMainKey, decriptareDate, hexToString, criptareDate } from "./functiiprocesaredate.js";
import { afiseazaParole } from "./detaliiItem.js";
import { initKeyAndPasswords, initKeyAndPasswords2 } from "./initiereItemisiKeys.js"
import { setAvatarInitials } from "./contulmeu.js"

export async function verificaAutentificare() {
    try {
        const response = await fetch("http://localhost:9000/api/auth/me", { method: "GET", credentials: "include" });
        if (response.ok) {

            const data = await response.json();

            // extragem inițialele
            if (data.name) {
                const [firstName, lastName] = data.name.split(" ");
                const initiale = `${firstName[0]}${lastName[0]}`.toUpperCase();
                setAvatarInitials(firstName, lastName);
            }

            const paroleDecriptate = await initKeyAndPasswords();
            return paroleDecriptate;
        }
    } catch (err) {
        console.error("Eroare la verificarea autentificării:", err);
    }
    return null;
}

export function setupFormularAutentificare() {
    const loginForm = document.getElementById("login-form");
    const loginContainer = document.getElementById("login-container");
    const containerLoginTitlu = document.getElementById("containertitlu");
    const sectiuneNoua = document.getElementById("sectiuneNoua");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Completează toate câmpurile!");
            return;
        }

        const hashedEmail = await hashPassword(email);
        const hashedPassword = await hashPassword(password);

        const keyAuthBase64 = await deriveKeyWebCrypto(hashedPassword, hashedEmail, "-auth");
        const keyCryptBase64 = await deriveKeyWebCrypto(hashedPassword, hashedEmail, "-crypt");

        const credentials = { Email: email, keyAuthBase64 };

        try {
            const response = await fetch("http://localhost:9000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(credentials),
            });

            if (response.ok) {

                // 1. Generează PIN + derive session key
                const generatedPIN = generatePIN();
                alert(`🔐 Acesta este codul PIN pentru persistenta cheii:\n\n${generatedPIN}\n\nPăstrează-l în siguranță!`);

                const { sessionKey, saltRaw, saltBase64 } = await deriveSessionKeyFromPIN(generatedPIN);



                // 3. Ia cheia AES criptată de la server
                const aesResponse = await fetch("http://localhost:9000/api/getUserSimmetricKey", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                });

                if (!aesResponse.ok) {
                    alert("Eroare la obținerea cheii AES de la server.");
                    return;
                }

                const aesData = await aesResponse.json();
                const encObj = JSON.parse(hexToString(aesData[0].encryptedsimmetrickey));
                const { iv, encData, tag } = encObj.encKey;

                // 4. Decriptează cheia principală
                const decryptionKey = await decodeMainKey(keyCryptBase64);
                const dec_key = await decriptareDate(encData, iv, tag, decryptionKey);

                const octetiArray = dec_key.split(',').map(item => parseInt(item.trim(), 10));
                const uint8Array = new Uint8Array(octetiArray);
                const base64Key = btoa(String.fromCharCode(...uint8Array));


                chrome.runtime.sendMessage({
                    action: "syncDecryptionKey",
                    key: base64Key
                }, (response) => {
                    if (response?.success) {
                        console.log("✅ Cheia a fost salvată prin background.js");
                    } else {
                        console.error("❌ Eroare la salvare:", response?.error);
                    }
                });


                const uint8Array2 = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
                const continutCaString = Array.from(uint8Array2).map(b => String.fromCharCode(b)).join("");

                const encryptedKey = await criptareDate(continutCaString, sessionKey);



                const paroleDecriptate = await initKeyAndPasswords2(password);
                loginContainer.style.display = "none";
                containerLoginTitlu.style.display = "none";
                sectiuneNoua.style.display = "block";
                afiseazaParole(paroleDecriptate);
            } else {
                alert("Autentificare eșuată! Verifică datele introduse.");
            }
        } catch (error) {
            console.error("Eroare la autentificare:", error);
            alert("A apărut o eroare la conectare.");
        }
    });
}