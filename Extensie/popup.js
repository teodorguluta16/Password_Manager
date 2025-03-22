// Compatibilitate universală pentru toate browserele
import { decripteazaItemi, hashPassword, genereazaCheiaLocal } from "./functiiprocesaredate.js";

const browserAPI = typeof browser !== "undefined" ? browser : chrome;
let paroleDecriptate = [];

function getKeyFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("passwordManagerDB", 2);

        request.onerror = (event) => {
            console.error("Eroare la accesarea IndexedDB:", event.target.error);
            reject("Eroare la accesarea IndexedDB");
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("keys", "readonly");
            const store = transaction.objectStore("keys");
            const getRequest = store.get(1);

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

function saveKeyInIndexedDB(key) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("passwordManagerDB", 2);

        request.onerror = (event) => {
            console.error("Eroare la accesarea IndexedDB:", event.target.error);
            reject("Eroare la accesarea IndexedDB");
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("keys", "readwrite");
            const store = transaction.objectStore("keys");

            const putRequest = store.put({ id: 1, key: key });

            putRequest.onerror = (event) => {
                console.error("Eroare la salvarea cheii în IndexedDB:", event.target.error);
                reject("Eroare la salvarea cheii în IndexedDB");
            };

            putRequest.onsuccess = () => {
                console.log("Cheia a fost salvată cu succes în IndexedDB.");
                resolve();
            };
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("keys")) {
                db.createObjectStore("keys", { keyPath: "id" });
                console.log("Obiectul de stocare 'keys' a fost creat.");
            }
        };
    });
}

async function initKeyAndPasswords() {
    try {
        const response = await new Promise((resolve, reject) => {
            browserAPI.runtime.sendMessage({ action: "getDecryptionKey" }, (response) => {
                if (response.success && response.key) {
                    resolve(response.key);
                } else {
                    console.warn("Nu am primit cheia de decriptare! O voi lua din IndexDB");
                    resolve(null);
                }
            });
        });

        let encodedKey = response;
        if (!encodedKey) {
            // Dacă cheia nu este disponibilă, o luăm din IndexedDB
            encodedKey = await getKeyFromIndexedDB();
            if (encodedKey) {
                console.log("✅ Cheie fallback luată din IndexedDB:", encodedKey);
            } else {
                console.error("❌ Nu am găsit cheia nici în IndexedDB.");
                return;
            }
        }

        // Sincronizează cheia
        await new Promise((resolve, reject) => {
            browserAPI.runtime.sendMessage({ action: "syncDecryptionKey", key: encodedKey }, (response) => {
                if (response.success) {
                    console.log("✅ Cheia a fost sincronizată cu succes!");
                    resolve();
                } else {
                    console.error("❌ Eroare la sincronizarea cheii");
                    reject();
                }
            });
        });

        // Obține parolele
        const passwordResponse = await new Promise((resolve, reject) => {
            browserAPI.runtime.sendMessage({ action: "getPasswords" }, (response) => {
                if (response.success) {
                    resolve(response.passwords);
                } else {
                    console.error("Eroare la primirea parolelor:", response.error);
                    reject();
                }
            });
        });

        // Decriptează parolele
        paroleDecriptate = await decripteazaItemi(passwordResponse, encodedKey);
        console.log("🔐 Toate parolele decriptate:", paroleDecriptate);
        afiseazaParole(paroleDecriptate);

    } catch (error) {
        console.error("Eroare la preluarea cheii sau parolelor:", error);
    }
}
async function initKeyAndPasswords2(password) {
    try {
        browserAPI.runtime.sendMessage({ action: "getDecryptionKey" }, async (response) => {
            if (response && response.success === false) {
                console.log("Cheia nu a fost încă generată !");
            }

            let encodedKey = await genereazaCheiaLocal(password);
            console.log("Cheia obținută !! este: ", encodedKey);
            await saveKeyInIndexedDB(encodedKey);

            browserAPI.runtime.sendMessage({ action: "syncDecryptionKey", key: encodedKey }, (response) => {
                if (response && response.success) {
                    console.log("✅ Cheia a fost sincronizată cu succes!");
                    browserAPI.runtime.sendMessage({ action: "getPasswords" }, async (response) => {
                        if (response && response.success) {
                            const rawItems = response.passwords;
                            console.log("Itemii criptati: ", rawItems);
                            paroleDecriptate = [];
                            paroleDecriptate = await decripteazaItemi(rawItems, encodedKey);
                            //console.log("🔐 Toate parolele decriptate:", paroleDecriptate);
                            afiseazaParole(paroleDecriptate);
                        } else {
                            console.error("Eroare la primirea parolelor:", response.error);
                        }
                    });
                } else {
                    console.error("❌ Eroare la sincronizarea cheii");
                }
            });
        });

    } catch (error) {
        console.error("Eroare la preluarea cheii sau parolelor:", error);
    }
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

                await initKeyAndPasswords2(password);
            } else {
                alert("Autentificare eșuată! Verifică datele introduse.");
            }
        } catch (error) {
            console.error("Eroare la autentificare:", error);
            alert("A apărut o eroare la conectare. Verifică rețeaua și încearcă din nou.");
        }
    });
});

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
    container.innerHTML = "";

    if (parole.length === 0) {
        container.innerHTML = "<li class='item' style='color: white;'>Nu există parole care să corespundă criteriilor de căutare.</li>";
        return;
    }

    parole.forEach(parola => {
        const li = document.createElement("li");
        li.classList.add("item");
        li.innerHTML = `
            <span style="color: white; font-size: medium;">${parola.nume} - ${parola.username}</span>
             <div style="display: flex; gap: 10px;">
                <img src="assets/icons/launch.png" alt="Launch" class="launch" style="width: 24px; height: 24px; cursor: pointer;">
                <img src="assets/icons/garbage.png" alt="Garbage" class="garbage" style="width: 24px; height: 24px; cursor: pointer;">
            </div>
        `;
        container.appendChild(li);
    });

    // Adăugăm funcționalitatea de copiere a parolei
    document.querySelectorAll(".copy-password").forEach(button => {
        button.addEventListener("click", function () {
            const password = this.getAttribute("data-password");
            navigator.clipboard.writeText(password).then(() => {
                alert("Parola copiată!");
            });
        });
    });
}
function cautaParola(cautare) {
    return paroleDecriptate.filter(item => {
        return item.nume.toLowerCase().includes(cautare.toLowerCase()) ||
            item.username.toLowerCase().includes(cautare.toLowerCase()) ||
            item.parola.toLowerCase().includes(cautare.toLowerCase());
    });
};
document.getElementById("search-box").addEventListener("input", function () {
    const cautare = this.value;
    const paroleGasite = cautaParola(cautare);
    afiseazaParole(paroleGasite);
});








