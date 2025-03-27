// Compatibilitate universală pentru toate browserele
import { decripteazaItemi, hashPassword, genereazaCheiaLocal, generateKey, criptareDate, decriptareDate, exportKey, decodeMainKey } from "./functiiprocesaredate.js";

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


// Funcția care arată detaliile parolei
function showItemDetails(parola) {
    const nume = parola.nume;
    const username = parola.username;
    const pass = parola.parola;
    const url = parola.url;
    const id_item = parola.id_item;
    const comentariu = parola.comentariu;


    const created_at = parola.created_at;
    const modified_at = parola.modified_at;
    const format = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, };
    const createdDate = new Date(created_at);
    const modifiedDate = new Date(modified_at);
    const createdFormatted = createdDate.toLocaleString('ro-RO', format);
    const modifiedFormatted = modifiedDate.toLocaleString('ro-RO', format);

    document.getElementById('sectiuneNoua').style.display = 'none';
    document.getElementById('sectiuneDetalii').style.display = 'block';
    document.getElementById('item-title').textContent = nume;
    document.getElementById('item-details').innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px;">
        <strong style="font-size: medium;">Username:</strong>
        <span style="font-size: small;">${username}</span>
    </div>
    <div style="display: flex; align-items: center; gap: 15px; margin-top: 10px;">
        <strong style="font-size: medium;">Parola:</strong>
        <span id="password-span" style="font-size: small;">********</span>
        <button id="toggle-password" style="margin-left: 10px;margin-right: 10px; background-color:rgb(150, 107, 7);
         color: white; border: none; border-radius: 5px; padding: 3px 3px; cursor: pointer;
         transition: background-color 0.3s, transform 0.3s;">
            Afișează
        </button>
    </div>
    <div style="display: flex; align-items: center; gap: 15px; margin-top: 10px;">
        <strong style="font-size: medium;">Url:</strong>
        <a href="${url}" id="url-link" target="_blank" style="font-size: small; color:rgb(255, 255, 255); text-decoration: none;">
            ${url}
        </a>
    </div>
    <div style="display: block; margin-top: 10px;">
        <strong style="font-size: medium;">Comentariu:</strong>
        <span style="font-size: small; display: block; margin-top: 5px;">${comentariu}</span>
    </div>
    <hr class="linieorinzontala" style="margin-top:20px; margin-left:-5px; margin-right:15px">
    <div style="display: flex; align-items: center; gap: 15px; margin-top: 10px;">
        <strong style="font-size: medium;">Id:</strong>
        <span style="font-size: small;">${id_item}</span>
    </div>
     <div style="display: flex; align-items: center; gap: 15px; margin-top: 10px;">
        <strong style="font-size: medium;">Creat la:</strong>
        <span style="font-size: small;">${createdFormatted}</span>
    </div>
    <div style="display: flex; align-items: center; gap: 15px; margin-top: 10px;">
        <strong style="font-size: medium;">Ultima modificare:</strong>
        <span style="font-size: small;">${modifiedFormatted}</span>
    </div>
`;

    document.getElementById('toggle-password').addEventListener('click', function () {
        const passwordSpan = document.getElementById('password-span');
        const password = pass;

        if (passwordSpan.textContent === '********') {
            passwordSpan.textContent = password;
            this.textContent = "Ascunde";
        } else {
            passwordSpan.textContent = '********';
            this.textContent = "Afisează";
        }
    });

    const button = document.getElementById('toggle-password');
    button.addEventListener('mouseover', function () {
        this.style.backgroundColor = 'rgb(44, 138, 185)';
    });

    button.addEventListener('mouseout', function () {
        this.style.backgroundColor = 'rgb(150, 107, 7)';
    });

    const urlLink = document.getElementById('url-link');
    urlLink.addEventListener('mouseover', function () {
        this.style.color = 'rgb(0, 182, 248)';
        this.style.textDecoration = 'underline';
    });

    urlLink.addEventListener('mouseout', function () {
        this.style.color = 'white';
        this.style.textDecoration = 'none';
    });
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
        console.log("Parola: ", parola);
        li.classList.add("item");
        li.innerHTML = `
            <span style="color: white; font-size: medium;">${parola.nume} - ${parola.username}</span>
             <div style="display: flex; gap: 10px;">
                 <img src="assets/icons/launch.png" alt="Launch" class="launch" style="inline-size: 24px; block-size: 24px; cursor: pointer;" data-url="${parola.url}">
                 <img src="assets/icons/garbage.png" alt="Garbage" class="garbage" style="inline-size: 24px; block-size: 24px; cursor: pointer;">
            </div>
        `;

        li.addEventListener('click', function () {
            showItemDetails(parola);
        });

        const launchButon = li.querySelector('.launch');
        launchButon.disabled = true;
        launchButon.style.opacity = "0.5";
        setTimeout(() => {
            launchButon.disabled = false;
            launchButon.style.opacity = "1";
        }, 1000);

        launchButon.addEventListener('click', function (event) {
            event.stopPropagation();
            const url = this.getAttribute('data-url');
            if (url) {
                //console.log(parola);
                const { username, url } = parola;
                const password = parola.parola;
                console.log("Date: ", username, password, url);
                chrome.storage.local.set({ credentiale_temporare: { username, password, url } }, () => {
                    chrome.tabs.create({ url });
                });
            }
        });

        const deleteButon = li.querySelector('.garbage');
        deleteButon.addEventListener('click', function (event) {
            event.stopPropagation();
            const index = parole.indexOf(parola);
            if (index > -1) {
                parole.splice(index, 1);
                afiseazaParole(parole);
            }

            // marcam isDeleted
            fetch('http://localhost:9000/api/stergeItem', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_item: parola.id_item }),
                credentials: "include"
            })
                .then(response => {
                    if (response.ok) {
                        const index = parole.indexOf(parola);
                        if (index > -1) {
                            parole.splice(index, 1);
                            afiseazaParole(parole);
                        }
                        console.log("item sters cu succes !");
                    }
                })
                .catch(error => console.error("eroare la trimiterea cererii:", error));
        })

        container.appendChild(li);
    });


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


const plusBtn = document.getElementById('plus-button');
const sectiuneNoua = document.getElementById('sectiuneNoua');
const sectiuneCreareItem = document.getElementById('sectiuneCreareItem');

plusBtn.addEventListener('click', () => {
    sectiuneNoua.style.display = 'none';
    sectiuneDetalii.style.display = 'none';
    sectiuneCreareItem.style.display = 'block';
});

const backFromCreateBtn = document.getElementById('back-from-create-btn');

backFromCreateBtn.addEventListener('click', () => {
    sectiuneCreareItem.style.display = 'none';
    sectiuneNoua.style.display = 'block';
});

const creareForm = document.getElementById('creare-form');

creareForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = await getKeyFromIndexedDB();
    console.log("Cheia pentru criptare este: ", key);

    const nume = document.getElementById('numeItem').value;
    const username = document.getElementById('usernameItem').value;
    const parola = document.getElementById('parolaItem').value;
    const url = document.getElementById('urlItem').value;
    const comentariu = document.getElementById('comentariuItem').value;

    try {
        const key_aes = await generateKey();

        // criptare elemente
        const enc_Tip = await criptareDate("password", key_aes);
        const enc_NumeItem = await criptareDate(nume, key_aes);
        const enc_UrlItem = await criptareDate(url, key_aes);
        const enc_UsernameItem = await criptareDate(username, key_aes);
        const enc_ParolaItem = await criptareDate(parola, key_aes);
        const enc_ComentariuItem = await criptareDate(comentariu, key_aes);

        // criptare cheie
        const criptKey = await decodeMainKey(key);

        const key_aes_raw = await exportKey(key_aes);
        console.log("Cheia intreaga ianinte de criptare este: ", key_aes_raw);
        const enc_key_raw = await criptareDate(key_aes_raw, criptKey);

        console.log("Cheia criptata este: ", enc_key_raw);

        // 3. Decriptarea cheii AES criptate folosind cheia AES decriptata
        const dec_key = await decriptareDate(enc_key_raw.encData, enc_key_raw.iv, enc_key_raw.tag, criptKey);

        const octetiArray = dec_key.split(',').map(item => parseInt(item.trim(), 10));

        // Creăm un Uint8Array din array-ul de numere
        const uint8Array = new Uint8Array(octetiArray);
        console.log(uint8Array);

        const importedKey = await window.crypto.subtle.importKey("raw", uint8Array, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);

        const dec_tip = await decriptareDate(enc_Tip.encData, enc_Tip.iv, enc_Tip.tag, importedKey);

        //const decoded_key = await decodeMainKey(dec_key);

        console.log("Elementul decriptat ar trebui sa fie: ", dec_tip);

        const jsonItemKey = {
            data: {
                encKey: { iv: enc_key_raw.iv, encData: enc_key_raw.encData, tag: enc_key_raw.tag },
            },
        };

        const jsonItem = {
            metadata: {
                created_at: new Date().toISOString(),
                modified_at: new Date().toISOString(),
                version: 1
            },
            data: {
                tip: { iv: enc_Tip.iv, encData: enc_Tip.encData, tag: enc_Tip.tag, },
                nume: { iv: enc_NumeItem.iv, encData: enc_NumeItem.encData, tag: enc_NumeItem.tag },
                url: { iv: enc_UrlItem.iv, encData: enc_UrlItem.encData, tag: enc_UrlItem.tag },
                username: { iv: enc_UsernameItem.iv, encData: enc_UsernameItem.encData, tag: enc_UsernameItem.tag },
                parola: { iv: enc_ParolaItem.iv, encData: enc_ParolaItem.encData, tag: enc_ParolaItem.tag },
                comentariu: { iv: enc_ComentariuItem.iv, encData: enc_ComentariuItem.encData, tag: enc_ComentariuItem.tag }
            },
        };

        try {
            const response = await fetch('http://localhost:9000/api/addItem', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonItem),
                credentials: "include"
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Eroare la server:", errorText);
                return;
            }
        } catch (error) {
            console.error("Eroare la trimitere", error);
        }
        try {
            const response = await fetch('http://localhost:9000/api/addKeyFavorite', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonItemKey),
                credentials: "include"
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Eroare la server:", errorText);
                return;
            }
        } catch (error) {
            console.error("Eroare la trimitere", error);
        };


    } catch (error) {
        console.error("Eroare la criptarea datelor:", error);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const testBtn = document.getElementById("test-form"); // presupunem că ai un buton de test

    if (testBtn) {
        testBtn.addEventListener("click", () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length === 0) return;

                chrome.tabs.sendMessage(tabs[0].id, {
                    type: "FILL_CREDENTIALS",
                    username: "test@example.com",
                    password: "parola123"
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("❌ Eroare la trimiterea mesajului:", chrome.runtime.lastError.message);
                    } else {
                        console.log("✅ Mesaj trimis către content.js");
                    }
                });
            });
        });
    }
});

