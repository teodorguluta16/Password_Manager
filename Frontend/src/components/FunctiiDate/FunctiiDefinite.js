import CryptoJS from 'crypto-js';

const criptareDate = async (continut, key) => {
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
};


const decriptareDate = async (encDataHexa, ivHexa, tagHexa, key) => {
    try {

        const iv = new Uint8Array(ivHexa.match(/.{2}/g).map(byte => parseInt(byte, 16)));
        const tag = new Uint8Array(tagHexa.match(/.{2}/g).map(byte => parseInt(byte, 16)));

        if (iv.length !== 12) {
            console.error("IV-ul nu are 12 octeți:", iv);
            throw new Error("Lungimea IV-ului este incorectă");
        }

        const encData = new Uint8Array(encDataHexa.match(/.{2}/g).map(byte => parseInt(byte, 16)));


        if (tag.length !== 16) {
            console.error("Tag-ul nu are 16 octeți:", tag);
            throw new Error("Lungimea tag-ului este incorectă");
        }

        const encDataWithTag = new Uint8Array(encData.length + tag.length);
        encDataWithTag.set(encData);
        encDataWithTag.set(tag, encData.length);

        const decCont = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, encDataWithTag);
        const decoder = new TextDecoder();
        const decodedText = decoder.decode(decCont);

        return decodedText;
    } catch (error) {
        console.error("Eroare la decriptarea datelor:", error);
        throw error;
    }
};

const generateKey = async () => {
    const key = await window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256, }, true, ["encrypt", "decrypt"]);
    return key;
};

const decodeMainKey = async (encodedKeyBase64) => {
    const wordArray = CryptoJS.enc.Base64.parse(encodedKeyBase64);

    const keyBuffer = new Uint8Array(wordArray.sigBytes);
    for (let i = 0; i < wordArray.sigBytes; i++)
        keyBuffer[i] = wordArray.words[i >>> 2] >>> ((3 - (i % 4)) * 8) & 0xff;
    console.log("Cheia AES înainte de import:", keyBuffer);


    const key = await window.crypto.subtle.importKey("raw", keyBuffer, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
    return key;
};

const exportKey = async (key) => {
    const exportedKey = await window.crypto.subtle.exportKey('raw', key);
    return new Uint8Array(exportedKey);
};

const importAESKey = async (base64Key) => {
    // Decodifică șirul Base64 într-un ArrayBuffer
    const keyBuffer = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));

    // Importă cheia AES din ArrayBuffer
    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',                // tipul cheii
        keyBuffer,            // ArrayBuffer-ul cu cheia
        { name: 'AES-GCM' },  // Algoritmul dorit (AES-GCM)
        false,                // Nu permitem exportul cheii
        ['encrypt', 'decrypt'] // Permisiuni
    );

    return cryptoKey;
}
export { criptareDate, generateKey, decodeMainKey, decriptareDate, exportKey, importAESKey };
