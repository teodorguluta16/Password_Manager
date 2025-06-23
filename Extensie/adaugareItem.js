import { generateKey, criptareDate, decriptareDate, exportKey, decodeMainKey } from "./functiiprocesaredate.js";
import { getKeyFromIndexedDB } from "./salveazaCheieIndexDB.js";
import sha1 from "./sha1.mjs"
import zxcvbn from './zxcvbn.mjs';
import { importRawKeyFromBase64, deriveHMACKey, semneazaParola } from './hmac.js';


const parolaInput = document.getElementById('parolaItem');
const feedback = document.getElementById('parola-feedback');

const parolaLungime = document.getElementById('parola-lungime');
const lungimeSelect = document.getElementById('select-lungime');
const genereazaParolaBtn = document.getElementById('genereazaParolaBtn');


parolaInput.addEventListener('input', async () => {
    const parola = parolaInput.value;
    parolaLungime.textContent = `Lungime: ${parola.length}`;

    if (!parola) {
        feedback.textContent = '';
        feedback.style.color = 'white';
        return;
    }

    const result = zxcvbn(parola);
    const scor = result.score;
    const label = ["Foarte slabă", "Slabă", "Mediocră", "Puternică", "Excelentă"][scor];

    // Începe cu scorul parolei
    let mesaj = `Forță: ${label}`;
    let culoare = scor < 2 ? "red" : scor < 4 ? "orange" : "lightgreen";

    // Verificăm dacă parola e compromisă
    const breachCount = await checkPwnedPassword(parola);
    if (breachCount > 0) {
        mesaj += ` ⚠️ Găsită în ${breachCount} breșe!`;
        culoare = "red"; // dacă a fost compromisă, override la culoare
    }

    feedback.textContent = mesaj;
    feedback.style.color = culoare;
});


function getRandomChar(charset) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return charset[array[0] % charset.length];
}

function secureShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const rand = new Uint32Array(1);
        crypto.getRandomValues(rand);
        const j = rand[0] % (i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function genereazaParolaComplexa(length) {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const all = upper + lower + digits + symbols;

    let parola = [
        getRandomChar(upper),
        getRandomChar(lower),
        getRandomChar(digits),
        getRandomChar(symbols),
    ];

    const remaining = length - parola.length;
    const randomBytes = new Uint32Array(remaining);
    crypto.getRandomValues(randomBytes);

    for (let i = 0; i < remaining; i++) {
        parola.push(all[randomBytes[i] % all.length]);
    }

    return secureShuffle(parola).join("");
}

genereazaParolaBtn.addEventListener('click', () => {
    const lungime = parseInt(lungimeSelect.value, 10);
    const parolaNoua = genereazaParolaComplexa(lungime);
    parolaInput.value = parolaNoua;
    parolaInput.dispatchEvent(new Event('input')); // declanșează evaluarea
});

async function checkPwnedPassword(password) {
    const hash = (await sha1(password)).toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await response.text();

    const lines = text.split("\n");
    const found = lines.find(line => line.startsWith(suffix));

    if (found) {
        const count = parseInt(found.split(":")[1]);
        return count;
    }

    return 0;
}

export async function handleCreareItem(formElement) {
    formElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const key = await getKeyFromIndexedDB();
        console.log("Cheia pentru criptare este: ", key);

        const nume = document.getElementById('numeItem').value;
        const username = document.getElementById('usernameItem').value;
        const parola = document.getElementById('parolaItem').value;
        const url = document.getElementById('urlItem').value;
        const comentariu = document.getElementById('comentariuItem').value;

        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

        const lungime = parola.length;

        const strength = zxcvbn(parola);
        //if (strength.score < 2) {
        //    alert(`⚠️ Parolă slabă: ${strength.feedback.warning || "Încearcă o parolă mai complexă."}`);
        //    return;
        //}

        //const breachCount = await checkPwnedPassword(parola);
        //if (breachCount > 0) {
        //    alert(`⚠️ Această parolă a fost găsită în ${breachCount} breșe de securitate! Alege alta.`);
        //    return;
        //}

        try {

            let cryptoKey;

            if (typeof key === "string") {
                cryptoKey = await importRawKeyFromBase64(key);
            } else {
                cryptoKey = key;
            }

            const hmacKey = await deriveHMACKey(cryptoKey);
            const semnatura = await semneazaParola(parola, charset, lungime, hmacKey);


            const key_aes = await generateKey();

            // criptare elemente
            const enc_Tip = await criptareDate("password", key_aes);
            const enc_NumeItem = await criptareDate(nume, key_aes);
            const enc_UrlItem = await criptareDate(url, key_aes);
            const enc_UsernameItem = await criptareDate(username, key_aes);
            const enc_ParolaItem = await criptareDate(parola, key_aes);
            const enc_ComentariuItem = await criptareDate(comentariu, key_aes);
            const enc_Semnatura = await criptareDate(semnatura, key_aes);
            // criptare cheie
            const criptKey = await decodeMainKey(key);

            const key_aes_raw = await exportKey(key_aes);
            const enc_key_raw = await criptareDate(key_aes_raw, criptKey);


            // 3. Decriptarea cheii AES criptate folosind cheia AES decriptata
            const dec_key = await decriptareDate(enc_key_raw.encData, enc_key_raw.iv, enc_key_raw.tag, criptKey);

            const octetiArray = dec_key.split(',').map(item => parseInt(item.trim(), 10));

            // Creăm un Uint8Array din array-ul de numere
            const uint8Array = new Uint8Array(octetiArray);


            const importedKey = await window.crypto.subtle.importKey("raw", uint8Array, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);

            const dec_tip = await decriptareDate(enc_Tip.encData, enc_Tip.iv, enc_Tip.tag, importedKey);



            const jsonItemKey = {
                data: {
                    encKey: { iv: enc_key_raw.iv, encData: enc_key_raw.encData, tag: enc_key_raw.tag },
                },
            };


            const jsonItem = {
                metadata: {
                    created_at: new Date().toISOString(),
                    modified_at: new Date().toISOString(),
                    version: 1,
                    meta: {
                        lungime: lungime,
                        charset: charset
                    }

                },
                data: {
                    tip: { iv: enc_Tip.iv, encData: enc_Tip.encData, tag: enc_Tip.tag, },
                    nume: { iv: enc_NumeItem.iv, encData: enc_NumeItem.encData, tag: enc_NumeItem.tag },
                    url: { iv: enc_UrlItem.iv, encData: enc_UrlItem.encData, tag: enc_UrlItem.tag },
                    username: { iv: enc_UsernameItem.iv, encData: enc_UsernameItem.encData, tag: enc_UsernameItem.tag },
                    parola: { iv: enc_ParolaItem.iv, encData: enc_ParolaItem.encData, tag: enc_ParolaItem.tag },
                    semnatura: { iv: enc_Semnatura.iv, encData: enc_Semnatura.encData, tag: enc_Semnatura.tag },
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
}

