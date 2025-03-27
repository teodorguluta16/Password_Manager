import { hashPassword } from "./functiiprocesaredate.js";
import { afiseazaParole } from "./detaliiItem.js";
import { initKeyAndPasswords, initKeyAndPasswords2 } from "./initiereItemisiKeys.js"

export async function initAutentificare() {
    document.addEventListener("DOMContentLoaded", async function () {
        const loginForm = document.getElementById("login-form");
        const loginContainer = document.getElementById("login-container");
        const containerLoginTitlu = document.getElementById("containertitlu");
        const sectiuneNoua = document.getElementById("sectiuneNoua");

        try {
            const response = await fetch("http://localhost:9000/api/auth/me", { method: "GET", credentials: "include", });

            if (response.ok) {
                console.log("Utilizatorul este deja autentificat.");
                loginContainer.style.display = "none";
                containerLoginTitlu.style.display = "none";
                sectiuneNoua.style.display = "block";

                const paroleDecriptate = await initKeyAndPasswords();
                afiseazaParole(paroleDecriptate);
                return paroleDecriptate;
            }
        } catch (error) {
            console.error("Eroare la verificarea autentificării:", error);
        }
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            if (!email || !password) { alert("Completează toate câmpurile!"); return; }

            const hashedPassword = await hashPassword(password);
            console.log("Hashed password:", hashedPassword);

            const credentials = { Email: email, hashedPassword };

            try {
                const response = await fetch("http://localhost:9000/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json", }, credentials: "include", body: JSON.stringify(credentials), });

                if (response.ok) {
                    console.log("Autentificare reușită!");
                    loginContainer.style.display = "none";
                    containerLoginTitlu.style.display = "none";
                    sectiuneNoua.style.display = "block";

                    const paroleDecriptate = await initKeyAndPasswords2(password);
                    afiseazaParole(paroleDecriptate);
                    return paroleDecriptate;

                } else {
                    alert("Autentificare eșuată! Verifică datele introduse.");
                }
            } catch (error) {
                console.error("Eroare la autentificare:", error);
                alert("A apărut o eroare la conectare. Verifică rețeaua și încearcă din nou.");
            }
        });
    });
}

