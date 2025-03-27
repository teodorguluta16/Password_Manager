import { generateKey, criptareDate, decriptareDate, exportKey, decodeMainKey } from "./functiiprocesaredate.js";
import { getKeyFromIndexedDB } from "./salveazaCheieIndexDB.js";


const creareForm = document.getElementById('creare-form');

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
}

