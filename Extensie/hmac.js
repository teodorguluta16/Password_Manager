export async function importRawKeyFromBase64(base64Key) {
    const binary = atob(base64Key);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return await window.crypto.subtle.importKey(
        "raw",
        bytes,
        "HKDF",
        false,
        ["deriveKey"]
    );
}

export async function deriveHMACKey(derivedKey) {
    return crypto.subtle.deriveKey(
        {
            name: "HKDF",
            hash: "SHA-256",
            salt: new TextEncoder().encode("semnatura-parola"),
            info: new TextEncoder().encode("hmac-signing")
        },
        derivedKey,
        {
            name: "HMAC",
            hash: "SHA-256",
            length: 256
        },
        false,
        ["sign"]
    );
}

export async function semneazaParola(parola, charset, length, hmacKey) {
    const data = `${parola}|${charset}|${length}`;
    const encoder = new TextEncoder();

    const signature = await crypto.subtle.sign(
        "HMAC",
        hmacKey,
        encoder.encode(data)
    );

    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}