// Compatibilitate universală pentru toate browserele
import { decripteazaItemi, hashPassword } from "./functiiprocesaredate.js";

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

//extrag cheia principala din Index DB
function getKeyFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("passwordManagerDB", 1);

        request.onerror = (event) => {
            console.error("Eroare la accesarea IndexedDB:", event.target.error);
            reject("Eroare la accesarea IndexedDB");
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("keys", "readonly");
            const store = transaction.objectStore("keys");
            const getRequest = store.get("encryptionKey");

            getRequest.onerror = () => reject("Eroare la citirea cheii din IndexedDB");
            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    resolve(getRequest.result.key);
                } else {
                    reject("Cheia de criptare nu a fost găsită în IndexedDB");
                }
            };
        };
    });
}

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

            await initKeyAndPasswords();
            return;
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
            } else {
                alert("Autentificare eșuată! Verifică datele introduse.");
            }
        } catch (error) {
            console.error("Eroare la autentificare:", error);
            alert("A apărut o eroare la conectare. Verifică rețeaua și încearcă din nou.");
        }
    });
});

async function initKeyAndPasswords() {
    try {
        browserAPI.runtime.sendMessage({ action: "getDecryptionKey" }, async (response) => {
            let encodedKey = null;
            if (response.success && response.key) {
                encodedKey = response.key;

            } else {
                console.warn("Nu am primit cheia de decriptare! O voi lua din IndexDB");
                encodedKey = await getKeyFromIndexedDB();

                if (encodedKey) {
                    console.log("✅ Cheie fallback luată din IndexedDB:", encodedKey);

                    // O sincronizăm cu background.js ca să fie accesibilă pe viitor
                    browserAPI.runtime.sendMessage({ action: "syncDecryptionKey", key: encodedKey });
                } else {
                    console.error("❌ Nu am găsit cheia nici în IndexedDB.");
                    return;
                }
            }
            // aici extrag datele venite de la background.js si le voi decripta folosind urmatoarea functie
            browserAPI.runtime.sendMessage({ action: "getPasswords" }, async (response) => {
                if (response.success) {
                    const rawItems = response.passwords;
                    const rezultate = await decripteazaItemi(rawItems, encodedKey);
                    console.log("🔐 Toate parolele decriptate:", rezultate);
                } else {
                    console.error("Eroare la primirea parolelor:", response.error);
                }
            });
        });

    } catch (error) {
        console.error("Eroare la preluarea cheii sau parolelor:", error);
    }
}

function setAvatarInitials(firstName, lastName) {
    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    const avatar = document.getElementById('avatar');
    avatar.textContent = initials;
}

const firstName = "Ion";
const lastName = "Popescu";
setAvatarInitials(firstName, lastName);

document.addEventListener("DOMContentLoaded", function () {
    const avatar = document.getElementById("avatar");
    const dropdownMenu = document.getElementById("dropdown-menu");
    const logoutBtn = document.getElementById("logout-btn");

    avatar.addEventListener("click", function () {
        dropdownMenu.classList.toggle("hidden");
    });

    logoutBtn.addEventListener("click", async function () {
        try {
            await fetch("http://localhost:9000/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            console.log("Utilizator delogat");
            location.reload();
        } catch (error) {
            console.error("Eroare la delogare:", error);
        }
    });
    document.addEventListener("click", function (event) {
        if (!avatar.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add("hidden");
        }
    });
});

document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', function () {
        showItemDetails('Item 1');
    });
});
document.addEventListener('DOMContentLoaded', function () {
    fetch('https://api.example.com/items')
        .then(response => response.json())
        .then(data => {
            // Selectăm lista
            const favoriteList = document.getElementById('favorite-list');
            data.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('item');

                const span = document.createElement('span');
                span.style.color = 'white';
                span.style.fontSize = 'medium';
                span.textContent = item.name;

                const div = document.createElement('div');
                div.style.display = 'flex';
                div.style.gap = '10px';

                const launchIcon = document.createElement('img');
                launchIcon.src = item.launchIcon;
                launchIcon.alt = 'Launch';
                launchIcon.classList.add('launch');

                const garbageIcon = document.createElement('img');
                garbageIcon.src = item.garbageIcon;
                garbageIcon.alt = 'Garbage';
                garbageIcon.classList.add('garbage');

                div.appendChild(launchIcon);
                div.appendChild(garbageIcon);
                li.appendChild(span);
                li.appendChild(div);
                favoriteList.appendChild(li);
                li.addEventListener('click', function () {
                    showItemDetails(item.name);
                });
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});
function showItemDetails(itemName) {
    console.log('Item selectat:', itemName);
    document.getElementById('sectiuneNoua').style.display = 'none';
    document.getElementById('sectiuneDetalii').style.display = 'block';
    document.getElementById('item-title').textContent = 'Detalii despre: ' + itemName;
    document.getElementById('item-details').textContent = 'Aici vei găsi informații suplimentare despre ' + itemName + '.';
}
function goBack() {
    document.getElementById('sectiuneDetalii').style.display = 'none';
    document.getElementById('sectiuneNoua').style.display = 'block';
}
document.getElementById('back-btn').addEventListener('click', goBack);

document.addEventListener("DOMContentLoaded", function () {
    browserAPI.runtime.sendMessage({ action: "getPasswords" }, (response) => {
        if (response.success) {
            console.log("Parolele primite în popup.js:", response.passwords);
            afiseazaParole(response.passwords);
        } else {
            console.error("Eroare la primirea parolelor:", response.error);
        }
    });
});

function afiseazaParole(parole) {
    const container = document.getElementById("favorite-list");
    container.innerHTML = ""; // Curățăm lista înainte de a adăuga parolele noi

    if (parole.length === 0) {
        container.innerHTML = "<li class='item' style='color: white;'>Nu există parole salvate.</li>";
        return;
    }

    parole.forEach(parola => {
        const li = document.createElement("li");
        li.classList.add("item");

        // Creăm structura HTML pentru fiecare parolă
        li.innerHTML = `
            <span style="color: white; font-size: medium;">${parola.nume} - ${parola.username}</span>
            <div style="display: flex; gap: 10px;">
                <button class="copy-password" data-password="${parola.parola}">🔑 Copiază</button>
            </div>
        `;

        container.appendChild(li);
    });

    // Adăugăm eveniment pentru copierea parolei
    document.querySelectorAll(".copy-password").forEach(button => {
        button.addEventListener("click", function () {
            const password = this.getAttribute("data-password");
            navigator.clipboard.writeText(password).then(() => {
                alert("Parola copiată!");
            });
        });
    });
}







