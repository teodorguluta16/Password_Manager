import { hashPassword } from "./functiiprocesaredate.js";
import { afiseazaParole } from "./detaliiItem.js";
import { initKeyAndPasswords, initKeyAndPasswords2 } from "./initiereItemisiKeys.js"
import { setAvatarInitials } from "./contulmeu.js"

export async function verificaAutentificare() {
    try {
        const response = await fetch("http://localhost:9000/api/auth/me", { method: "GET", credentials: "include" });
        if (response.ok) {

            const data = await response.json();
            console.log("Utilizator autentificat:", data);

            // extragem inițialele
            if (data.name) {
                const [firstName, lastName] = data.name.split(" ");
                const initiale = `${firstName[0]}${lastName[0]}`.toUpperCase();
                //console.log("Intialelle sunt", initiale);
                setAvatarInitials(firstName, lastName); // ⚠️ funcție din popup.js
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

        const hashedPassword = await hashPassword(password);
        const credentials = { Email: email, hashedPassword };

        try {
            const response = await fetch("http://localhost:9000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(credentials),
            });

            if (response.ok) {
                console.log("Autentificare reușită!");

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