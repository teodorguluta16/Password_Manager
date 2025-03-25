export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

export async function genereazaCheiaLocal(parola) {
    try {
        let salt = null;
        const saltResponse = await fetch("http://localhost:9000/api/utilizator/getSalt", {
            method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include",
        });

        if (saltResponse.ok) {
            const data = await saltResponse.json();
            salt = Uint8Array.from(atob(data.salt), c => c.charCodeAt(0));
        } else {
            console.error("Nu am primit saltul de la server.");
            return null;
        }

        // 2. Derivăm cheia folosind PBKDF2
        const passwordBuffer = new TextEncoder().encode(parola);
        const derivedKey = await crypto.subtle.importKey("raw", passwordBuffer, { name: "PBKDF2" }, false, ["deriveKey"]);

        // Derivăm cheia AES
        const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: 500000, hash: "SHA-256" }, derivedKey, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);

        console.log("Cheia derivată în format AES:", key);

        // Exportăm cheia într-un format raw (binary)
        const exportedKey = await crypto.subtle.exportKey("raw", key);

        // Converim cheia exportată într-un string Base64
        const base64Key = arrayBufferToBase64(exportedKey);

        console.log("Cheia derivată în format Base64:", base64Key);

        // 3. Obținem cheia AES criptată de la server
        const aesResponse = await fetch("http://localhost:9000/api/getUserSimmetricKey", {
            method: "GET",
            headers: { 'Content-Type': 'application/json' },
            credentials: "include"
        });

        if (aesResponse.ok) {
            const aesResponseData = await aesResponse.json();
            console.log("Răspunsul de la server pentru cheia AES:", aesResponseData);

            // 4. Decriptăm cheia AES folosind cheia derivată
            const keyfromdata = aesResponseData[0].encryptedsimmetrickey;
            const decodedString = hexToString(keyfromdata);
            const dataObject = JSON.parse(decodedString);

            const ivHex = dataObject.encKey.iv;
            const encDataHex = dataObject.encKey.encData;
            const tagHex = dataObject.encKey.tag;

            const dec_key = await decriptareDate(encDataHex, ivHex, tagHex, key);

            const octetiArray = dec_key.split(',').map(item => parseInt(item.trim(), 10));
            const uint8Array = new Uint8Array(octetiArray);

            // 5. Convertim cheia AES în format Base64
            const base64Key = arrayBufferToBase64(uint8Array);
            return base64Key;
        } else {
            console.error("Eroare la obținerea cheii AES de la server.");
            return null;
        }
    } catch (error) {
        console.error("Eroare la generarea cheii local:", error);
        return null;
    }
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const length = bytes.byteLength;
    for (let i = 0; i < length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export async function decripteazaItemi(data, encodedMainKey) {
    const decryptionKey = await decodeMainKey(encodedMainKey);
    const rezultate = [];

    for (let item of data) {
        try {
            console.log("E favorit ", item.isfavorite);
            const isFavorite = item.isfavorite;
            const id_item = item.id_item;
            const isDeleted = item.isdeleted
            const itemKey = await extrageSiDecripteazaCheiaItemului(item.keys_hex, decryptionKey);

            const continutDecoded = hexToString(item.continut_hex);
            const continutObj = JSON.parse(continutDecoded);
            const { created_at, modified_at, version } = continutObj.metadata;
            const rez_tip = await decriptareDate(continutObj.data.tip.encData, continutObj.data.tip.iv, continutObj.data.tip.tag, itemKey);

            if (rez_tip === "password" && isDeleted === 0 && isFavorite === true) {
                const rez_nume = await decriptareDate(continutObj.data.nume.encData, continutObj.data.nume.iv, continutObj.data.nume.tag, itemKey);
                const rez_username = await decriptareDate(continutObj.data.username.encData, continutObj.data.username.iv, continutObj.data.username.tag, itemKey);
                const rez_parola = await decriptareDate(continutObj.data.parola.encData, continutObj.data.parola.iv, continutObj.data.parola.tag, itemKey);
                const rez_url = await decriptareDate(continutObj.data.url.encData, continutObj.data.url.iv, continutObj.data.url.tag, itemKey);
                const rez_comentariu = await decriptareDate(continutObj.data.comentariu.encData, continutObj.data.comentariu.iv, continutObj.data.comentariu.tag, itemKey);

                console.log("🔓 Item decriptat:", { nume: rez_nume, username: rez_username, parola: rez_parola, comentariu: rez_comentariu });
                rezultate.push({
                    itemKey: itemKey,
                    id_item: id_item,
                    nume: rez_nume,
                    username: rez_username,
                    parola: rez_parola,
                    url: rez_url,
                    comentariu: rez_comentariu,
                    isFavorite: isFavorite,
                    created_at: created_at,
                    modified_at: modified_at,
                    version: version,
                    isDeleted: isDeleted,
                });
            }
        } catch (e) {
            console.error("❌ Eroare la decriptarea unui item:", e);
        }
    }
    return rezultate;
};

export async function decodeMainKey(encodedKey) {
    const keyBuffer = Uint8Array.from(atob(encodedKey), c => c.charCodeAt(0));
    return await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
};

export async function extrageSiDecripteazaCheiaItemului(keys_hex, decryptionKey) {
    const decoded = hexToString(keys_hex);
    const dataObject = JSON.parse(decoded);

    const ivHex = dataObject.encKey.iv;
    const encDataHex = dataObject.encKey.encData;
    const tagHex = dataObject.encKey.tag;

    const decryptedKeyString = await decriptareDate(encDataHex, ivHex, tagHex, decryptionKey);
    const octetiArray = decryptedKeyString.split(',').map(item => parseInt(item.trim(), 10));
    const uint8Array = new Uint8Array(octetiArray);

    const itemKey = await window.crypto.subtle.importKey("raw", uint8Array, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
    return itemKey;
};

export function hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
};

export async function decriptareDate(encDataHex, ivHex, tagHex, key) {
    const encData = hexToBytes(encDataHex);
    const iv = hexToBytes(ivHex);
    const tag = hexToBytes(tagHex);

    const combined = new Uint8Array(encData.length + tag.length);
    combined.set(encData);
    combined.set(tag, encData.length);

    if (!(key instanceof CryptoKey)) {
        console.error("Cheia trebuie să fie de tip CryptoKey");
        return;
    }

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv, tagLength: 128 }, key, combined);
    return new TextDecoder().decode(decrypted);
};

export function hexToBytes(hex) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
};

export async function generateKey() {
    try {
        const key = await window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
        return key;
    } catch (error) {
        console.error("Eroare la generarea cheii:", error);
        throw error;
    }
}

export async function criptareDate(continut, key) {
    try {
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const codificareCont = new TextEncoder();
        const bufferCodificat = codificareCont.encode(continut);
        const encCont = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, bufferCodificat);
        const encContArray = new Uint8Array(encCont);
        const tag = encContArray.slice(-16);
        return {
            iv: Array.from(iv).map(byte => byte.toString(16).padStart(2, '0')).join(''),
            encData: Array.from(encContArray.slice(0, -16)).map(byte => byte.toString(16).padStart(2, '0')).join(''),
            tag: Array.from(tag).map(byte => byte.toString(16).padStart(2, '0')).join('')
        };
    } catch (error) {
        console.error("Eroare la criptarea datelor:", error);
        throw error;
    }
};

export async function exportKey(key) {
    const exportedKey = await window.crypto.subtle.exportKey('raw', key);
    return new Uint8Array(exportedKey);
};
