import { criptareDate } from "./functiiprocesaredate.js"

function setupEditToggle(field) {
    const btn = document.getElementById(`edit-${field}-btn`);
    const span = document.getElementById(`${field}-text`);
    const input = document.getElementById(`${field}-input`);

    btn.addEventListener('click', () => {
        if (input.style.display === 'none') {
            span.style.display = 'none';
            input.style.display = 'inline';
            btn.textContent = '💾';
        } else {
            span.textContent = input.value;
            span.style.display = 'inline';
            input.style.display = 'none';
            btn.textContent = '✏️';
        }
    });
}

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
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <strong style="font-size: medium;">Nume:</strong>
        <span id="nume-text" style="font-size: small;">${nume}</span>
        <input id="nume-input" value="${nume}" style="font-size: small; display: none;" />
        <span id="edit-nume-btn" style="cursor: pointer;">✏️</span>
    </div>

    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <strong style="font-size: medium;">Username:</strong>
        <span id="username-text" style="font-size: small;">${username}</span>
        <input id="username-input" value="${username}" style="font-size: small; display: none;" />
        <span id="edit-username-btn" style="cursor: pointer;">✏️</span>
    </div>

    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 10px; margin-bottom: 10px;">
        <strong style="font-size: medium;">Parola:</strong>
        <span id="password-text" style="font-size: small;">********</span>
        <input id="password-input" type="password" value="${pass}" style="font-size: small; display: none;" />
        <div style="display:flex; flex-direction-row; gap:10px">
            <button id="toggle-password" style="background-color:rgb(150, 107, 7);
                color: white; border: none; border-radius: 5px; padding: 3px 6px; cursor: pointer;">Afișează</button>
            <span id="edit-password-btn" style="cursor: pointer;">✏️</span>
        </div>
    </div>

    <div style="display: flex;flex-direction: column; align-items: flex-start; gap: 10px; margin-bottom: 10px;">
        <strong style="font-size: medium;">Url:</strong>
        <span id="url-text" style="font-size: small;">${url}</span>
        <input id="url-input" value="${url}" style="font-size: small; display: none;" />
        <span id="edit-url-btn" style="cursor: pointer;">✏️</span>
    </div>

    <div style="display: block; margin-top: 5px;">
        <strong style="font-size: medium;">Comentariu:</strong>
        <textarea id="edit-comentariu"  style="font-size: small; width: 80%; height: 70px; resize: none; overflow: auto;">${comentariu}</textarea>
    </div>

     <button id="btn_save_modificari">
        Salvează modificările
    </button>

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
        const passwordSpan = document.getElementById('password-text');
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

    const urlLink = document.getElementById('url-text');
    urlLink.addEventListener('mouseover', function () {
        this.style.color = 'rgb(0, 182, 248)';
        this.style.textDecoration = 'underline';
    });

    urlLink.addEventListener('mouseout', function () {
        this.style.color = 'white';
        this.style.textDecoration = 'none';
    });


    setupEditToggle("nume");
    setupEditToggle("username");
    setupEditToggle("password");
    setupEditToggle("url");


    const buttonSalvareModificari = document.getElementById('btn_save_modificari');
    buttonSalvareModificari.addEventListener('click', async function () {
        let parsedIstoric = [];

        try {
            parsedIstoric = JSON.parse(parola.istoric);
            if (!Array.isArray(parsedIstoric)) {
                parsedIstoric = [];
            }
        } catch (error) {
            console.error("Eroare la parsarea istoricului:", error);
            parsedIstoric = [];
        }

        let modificari = [];

        const numeModificat = document.getElementById('nume-input').value;
        const usernameModificat = document.getElementById('username-input').value;
        const parolaModificat = document.getElementById('password-input').value;
        const urlModificat = document.getElementById('url-input').value;
        const comentariuModificat = document.getElementById('edit-comentariu').value;

        if (nume !== numeModificat) { modificari.push("Nume"); }
        if (username !== usernameModificat) { modificari.push("Username"); }
        if (pass !== parolaModificat) { modificari.push("Parola"); }
        if (url !== urlModificat) { modificari.push("URL"); }
        if (comentariu !== comentariuModificat) { modificari.push("Comentariu"); }

        if (modificari.length === 0) {
            console.log("Nicio modificare detectată.");
            return;
        }

        const now = new Date();
        const dataCurenta = now.toLocaleDateString();
        const oraCurenta = now.toLocaleTimeString();

        const nouIstoric = {
            operatie: `Actualizare Date: ${modificari.join(", ")}`,
            data: dataCurenta,
            time: oraCurenta,
        };



        const istoricActualizat = [...parsedIstoric, nouIstoric];


        const key_aes = parola.itemKey;

        const enc_Tip = await criptareDate("password", key_aes);
        const enc_NumeItem = await criptareDate(numeModificat, key_aes);
        const enc_UrlItem = await criptareDate(urlModificat, key_aes);
        const enc_UsernameItem = await criptareDate(usernameModificat, key_aes);
        const enc_ParolaItem = await criptareDate(parolaModificat, key_aes);
        const enc_ComentariuItem = await criptareDate(comentariuModificat, key_aes);
        const enc_IstoricItem = await criptareDate(JSON.stringify(istoricActualizat), key_aes);


        const jsonItem = {
            metadata: {
                created_at: parola.created_at,
                modified_at: new Date().toISOString(),
                version: 2
            },
            data: {
                tip: { iv: enc_Tip.iv, encData: enc_Tip.encData, tag: enc_Tip.tag, },
                nume: { iv: enc_NumeItem.iv, encData: enc_NumeItem.encData, tag: enc_NumeItem.tag },
                url: { iv: enc_UrlItem.iv, encData: enc_UrlItem.encData, tag: enc_UrlItem.tag },
                username: { iv: enc_UsernameItem.iv, encData: enc_UsernameItem.encData, tag: enc_UsernameItem.tag },
                parola: { iv: enc_ParolaItem.iv, encData: enc_ParolaItem.encData, tag: enc_ParolaItem.tag },
                comentariu: { iv: enc_ComentariuItem.iv, encData: enc_ComentariuItem.encData, tag: enc_ComentariuItem.tag },
                istoric: { iv: enc_IstoricItem.iv, encData: enc_IstoricItem.encData, tag: enc_IstoricItem.tag }
            },
        };

        try {
            const response = await fetch("http://localhost:9000/api/updateItem", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_item: parola.id_item,
                    continut: jsonItem,
                }),
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Eroare la actualizare");
            }
            console.log("Item actualizat cu succes!");
        } catch (error) {
            console.error("eroare la modificarea itemului: ", error);
        }
    });
}

function formatCardNumber(number) {
    return number.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
}

function showCardDetails(parola) {
    const nume = parola.nume;
    const numarCard = parola.numarCard;
    const posesorCard = parola.posesorCard;
    const dataExpirare = parola.dataExpirare;
    const id_item = parola.id_item;
    const comentariu = parola.comentariu;


    const created_at = parola.created_at;
    const modified_at = parola.modified_at;
    const format = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, };
    const createdDate = new Date(created_at);
    const modifiedDate = new Date(modified_at);
    const createdFormatted = createdDate.toLocaleString('ro-RO', format);
    const modifiedFormatted = modifiedDate.toLocaleString('ro-RO', format);

    const formattedCard = formatCardNumber(numarCard);


    document.getElementById('sectiuneNoua').style.display = 'none';
    document.getElementById('sectiuneDetalii').style.display = 'block';
    document.getElementById('item-title').textContent = nume;
    document.getElementById('item-details').innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px;">
        <strong style="font-size: medium;">Username:</strong>
        <span style="font-size: small;">${formattedCard}</span>
    </div>
    <div style="display: flex; align-items: center; gap: 15px; margin-top: 10px;">
        <strong style="font-size: medium;">Posesor:</strong>
        <span style="font-size: small;">${posesorCard}</span>
    </div>
    <div style="display: flex; align-items: center; gap: 15px; margin-top: 10px;">
        <strong style="font-size: medium;">Expira:</strong>
        <span style="font-size: small;">${dataExpirare}</span>
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

}

export function afiseazaParole(parole) {
    const container = document.getElementById("favorite-list");
    container.innerHTML = "";

    if (parole.length === 0) {
        container.innerHTML = "<li class='item' style='color: white;'>Nu există parole care să corespundă criteriilor de căutare.</li>";
        return;
    }

    parole.forEach(parola => {
        const li = document.createElement("li");

        if (parola.tip_item === "password") {
            li.classList.add("item");
            li.innerHTML = `
                 <div style="display: flex; flex-direction: column; color: white;">
                    <span style="font-size: medium;">${parola.nume}</span>
                    <span style="font-size: small; opacity: 0.8;">${parola.username}</span>
                </div>
                 <div style="display: flex; gap: 10px;margin-right:10px">
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
                    const { username, url } = parola;
                    const password = parola.parola;
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

        }
        if (parola.tip_item === "card") {
            li.classList.add("item");
            li.innerHTML = `
                 <div style="display: flex; flex-direction: column; color: white;">
                    <span style="font-size: medium;">${parola.nume}</span>
                    <span style="font-size: small; opacity: 0.8;">${parola.posesorCard}</span>
                </div>
                <div style="display: flex; gap: 10px;margin-right:10px">
                     <img src="assets/icons/garbage.png" alt="Garbage" class="garbage" style="inline-size: 24px; block-size: 24px; cursor: pointer;">
                </div>
            `;

            li.addEventListener('click', function () {
                showCardDetails(parola);
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
        }

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

export function goBack() {
    document.getElementById('sectiuneDetalii').style.display = 'none';
    document.getElementById('sectiuneNoua').style.display = 'block';
}

export function cautaParola(cautare, paroleDecriptate) {
    const tipuriTraduse = {
        password: "parola",
        card: "card bancar"
    };

    const caut = cautare.toLowerCase();

    return paroleDecriptate.filter(item => {
        const nume = item.nume?.toLowerCase() || "";
        const tipTradus = (tipuriTraduse[item.tip_item] || item.tip_item || "").toLowerCase();

        // fallback logic: dacă e card => posesorCard, altfel => username
        const altIdentificator = (item.tip_item === "card" ? item.posesorCard : item.username) || "";
        const identificator = altIdentificator.toLowerCase();

        return (
            nume.includes(caut) ||
            tipTradus.includes(caut) ||
            identificator.includes(caut)
        );
    });
};