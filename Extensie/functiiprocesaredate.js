export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

export async function decripteazaItemi(data, encodedMainKey) {
    const decryptionKey = await decodeMainKey(encodedMainKey);
    const rezultate = [];

    for (let item of data) {
        try {
            const itemKey = await extrageSiDecripteazaCheiaItemului(item.keys_hex, decryptionKey);

            const continutDecoded = hexToString(item.continut_hex);
            const continutObj = JSON.parse(continutDecoded);

            const rez_tip = await decriptareDate(continutObj.data.tip.encData, continutObj.data.tip.iv, continutObj.data.tip.tag, itemKey);

            if (rez_tip === "password") {
                const rez_nume = await decriptareDate(continutObj.data.nume.encData, continutObj.data.nume.iv, continutObj.data.nume.tag, itemKey);
                const rez_username = await decriptareDate(continutObj.data.username.encData, continutObj.data.username.iv, continutObj.data.username.tag, itemKey);
                const rez_parola = await decriptareDate(continutObj.data.parola.encData, continutObj.data.parola.iv, continutObj.data.parola.tag, itemKey);

                console.log("🔓 Item decriptat:", { nume: rez_nume, username: rez_username, parola: rez_parola });
                rezultate.push({ nume: rez_nume, username: rez_username, parola: rez_parola });
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
