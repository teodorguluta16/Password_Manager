import React, { useState } from 'react';
import { criptareDate, generateKey, decodeMainKey, decriptareDate, exportKey } from "../../FunctiiDate/FunctiiDefinite"
import { getKeyFromIndexedDB, deleteKeyFromIndexedDB, deleteDatabase, useKeySimetrica, getKeyFromIndexedDB2 } from "../../FunctiiDate/ContextKeySimetrice";
import Dexie from 'dexie';

const db = new Dexie("myDatabase");
db.version(1).stores({ keys: 'id,key,salt,iv,tag' });

function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

const exportKeyToBase64 = async (cryptoKey) => {
    const raw = await crypto.subtle.exportKey('raw', cryptoKey);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(raw)));
    return base64;
};


const PopupIntroduPIN = ({ onClose }) => {
    const [pin, setPin] = useState('');
    const { setKey } = useKeySimetrica();
    const [arataParola, setArataParola] = useState(false);
    const [parolaItem, setParolaItem] = useState('');

    const extrageSiSeteazaCheia = async (pin) => {
        try {
            const record = await getKeyFromIndexedDB2();
            console.log("🔍 Key extras din IndexedDB2:", record.key);

            if (!record || !record.key || !record.salt) {
                throw new Error("Lipsesc datele necesare din IndexedDB");
            }

            const { encData, iv, tag } = JSON.parse(record.key);

            // 1. Parsează saltul
            console.log("Saltul inainte de transformare este: ", record.salt);
            const saltHex = record.salt;
            const salt = Uint8Array.from(saltHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
            console.log("Cheia criptata este: ", record.key);
            console.log("saltul este: ", salt);

            // 2. Derivă cheia (AES-GCM) din PIN + salt
            const encoder = new TextEncoder();
            console.log("PINUL folosit la derivare (PINPAGE): ", pin);
            const pinBuffer = encoder.encode(pin);
            const keyMaterial = await crypto.subtle.importKey('raw', pinBuffer, 'PBKDF2', false, ['deriveKey']);

            const sessionKey = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt,
                    iterations: 20000,
                    hash: 'SHA-256',
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['decrypt']
            );

            // Afișare sessionKey în Base64
            const sessionKeyBase64 = await exportKeyToBase64(sessionKey);
            console.log("🔐 SessionKey (Base64) PIN:", sessionKeyBase64);
            console.log("Datele pentru decriptare: ", encData, iv, tag);

            // 3. Decriptează folosind funcția ta
            const decKey = await decriptareDate(encData, iv, tag, sessionKey);

            // 4. Setează cheia în context
            setKey(decKey);
            console.log("✅ Cheia a fost decriptată și setată în context.");

        } catch (err) {
            console.error("❌ Eroare la decriptarea și setarea cheii:", err);
            throw err;
        }
    };

    const handlePINSubmit = async () => {
        try {
            await extrageSiSeteazaCheia(parolaItem);
            onClose(); // ascundem popupul
        } catch (err) {
            alert("PIN invalid sau eroare la decriptare!");
        }
    };

    return (
        <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-4/5 md:w-1/2 h-3/4 md:h-5/6 p-6 flex flex-col items-center justify-center relative">
                <h3>🔐 Introdu PIN-ul pentru a debloca cheia principală</h3>
                <div className="relative flex flex-col">
                    <input type={arataParola ? "text" : "password"} value={parolaItem} onChange={(e) => { setParolaItem(e.target.value) }} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full"></input>
                    <button type="button" className="mt-3 transform -translate-y-1/2 text-sm text-blue-500 hover:underline" onClick={() => setArataParola(!arataParola)}>
                        {arataParola ? "Ascunde" : "Afișează"}
                    </button>
                </div>

                <input type="password" value={pin} onChange={e => setPin(e.target.value)} />
                <button onClick={handlePINSubmit}>Decriptează cheia</button>
            </div>

        </div>
    );
};

export default PopupIntroduPIN;
