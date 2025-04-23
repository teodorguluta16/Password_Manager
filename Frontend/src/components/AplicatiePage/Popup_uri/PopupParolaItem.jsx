import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import sha1 from "js-sha1";
import zxcvbn from 'zxcvbn'; // trebuie sa includ si asta in documentatie

import { criptareDate, generateKey, decodeMainKey, decriptareDate, exportKey } from "../../FunctiiDate/FunctiiDefinite"

const importRawKeyFromBase64 = async (base64Key) => {
    const binary = atob(base64Key); // decode base64
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return await window.crypto.subtle.importKey("raw", bytes, "HKDF", false, ["deriveKey"]);
};



const deriveHMACKey = async (derivedKey) => {
    return crypto.subtle.deriveKey(
        { name: "HKDF", hash: "SHA-256", salt: new TextEncoder().encode("semnatura-parola"), info: new TextEncoder().encode("hmac-signing") },
        derivedKey, { name: "HMAC", hash: "SHA-256", length: 256 }, false, ["sign"]
    );
};


const checkPwnedPassword = async (password) => {
    const hash = sha1(password).toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await response.text();

    // căutăm dacă suffix-ul există în listă
    const lines = text.split("\n");
    const found = lines.find((line) => line.startsWith(suffix));

    if (found) {
        const count = parseInt(found.split(":")[1]);
        return count; // de câte ori a fost găsită în breșe
    }

    return 0;
};

const PopupParolaItem = ({ setShowParolaPopup, derivedKey, fetchItems }) => {
    const [numeItem, setNumeItem] = useState('');
    const [urlItem, setUrlItem] = useState('');
    const [usernameItem, setUserNamItem] = useState('');
    const [parolaItem, setParolaItem] = useState('');
    const [comentariuItem, setComentariuItem] = useState('');
    const [key, setKey] = useState(derivedKey);
    const [length, setLength] = useState(32);

    useEffect(() => {
        if (derivedKey) {
            setKey(derivedKey);
            console.log("Cheia setată:", derivedKey);
        }
    }, [derivedKey]);


    const getRandomChar = (charset) => {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return charset[array[0] % charset.length];
    };

    const secureShuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const rand = new Uint32Array(1);
            crypto.getRandomValues(rand);
            const j = rand[0] % (i + 1);

            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const generateStrongPassword = (length) => {

        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const digits = "0123456789";
        const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        const all = upper + lower + digits + symbols;

        if (length < 4) {
            throw new Error("Parola trebuie să aibă cel puțin 4 caractere pentru a include toate tipurile.");
        }

        let password = [
            getRandomChar(upper),
            getRandomChar(lower),
            getRandomChar(digits),
            getRandomChar(symbols)
        ];

        const remainingLength = length - password.length;
        const randomBytes = new Uint32Array(remainingLength);
        crypto.getRandomValues(randomBytes);

        for (let i = 0; i < remainingLength; i++) {
            password.push(all[randomBytes[i] % all.length]);
        }

        const finalPassword = secureShuffle(password).join("");
        setParolaItem(finalPassword);
        return finalPassword;
    };

    const getPasswordStrength = async (password, usernameItem = "") => {
        const parolaLower = password.toLowerCase();
        const userLower = usernameItem.toLowerCase();

        const paroleComune = [
            "123456", "password", "123456789", "qwerty", "abc123", "111111", "admin",
            "Academia123", "parola123", "letmein", "iloveyou", "000000", "123123"
        ];

        // 1. Verificare dacă parola conține numele/emailul
        if (userLower.length > 2 && password.toLowerCase().includes(userLower)) {
            return {
                strength: 0, color: "bg-red-600", label: "Parola conține emailul sau numele utilizatorului", suggestions: ["Nu include emailul sau numele în parolă."]
            };
        }

        // 2. Verificare dacă parola este prea comună
        if (paroleComune.includes(parolaLower)) {
            return {
                strength: 0,
                color: "bg-red-600",
                label: "Parolă foarte comună",
                suggestions: ["Alege o parolă mai puțin previzibilă."]
            };
        }

        // 3. Verificare HIBP
        const breachCount = await checkPwnedPassword(password);
        if (breachCount > 0) {
            return {
                strength: 0, color: "bg-red-700", label: `Parolă compromisă (${breachCount} ori)`, suggestions: ["Această parolă a fost expusă public. Alege alta."]
            };
        }

        // 4. Analiză cu zxcvbn
        const result = zxcvbn(password);
        const score = Math.min(result.score, 4);
        const suggestions = result.feedback?.suggestions || [];

        const colors = ["bg-red-500", "bg-yellow-500", "bg-yellow-400", "bg-green-500", "bg-green-600"];
        const labels = ["Foarte slabă", "Slabă", "Ok", "Puternică", "Foarte puternică"];

        return { strength: score, color: colors[score], label: labels[score], suggestions };
    };

    const [strengthData, setStrengthData] = useState({ strength: 0, color: "", label: "" });

    useEffect(() => {
        const evaluateStrength = async () => {
            if (parolaItem.length > 0) {
                const result = await getPasswordStrength(parolaItem, usernameItem);
                setStrengthData(result);
            } else {
                setStrengthData({ strength: 0, color: "", label: "" });
            }
        };

        evaluateStrength();
    }, [parolaItem, usernameItem]);

    const [hmacKey, setHmacKey] = useState(null); // 1. inițializare

    useEffect(() => {
        const genereazaHmacKey = async () => {
            if (derivedKey) {
                let cryptoKey;

                if (typeof derivedKey === "string") {
                    cryptoKey = await importRawKeyFromBase64(derivedKey);
                } else {
                    cryptoKey = derivedKey;
                }

                const key = await deriveHMACKey(cryptoKey);
                setHmacKey(key);
                console.log("🔐 HMAC Key generată:", key);
            }
        };

        genereazaHmacKey();
    }, [derivedKey]);

    const semneazaParola = async (parola, charset, length, hmacKey) => {
        const data = `${parola}|${charset}|${length}`;
        const encoder = new TextEncoder();

        const signature = await crypto.subtle.sign("HMAC", hmacKey, encoder.encode(data));
        return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, "0")).join("");
    };


    const handleAdaugaItem = async () => {
        try {
            if (!numeItem || !urlItem || !usernameItem || !parolaItem) {
                alert("Completează câmpurile !");
                return;
            }

            setShowParolaPopup(false);
            const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
            const semnaturaParola = await semneazaParola(parolaItem, charset, length, hmacKey);
            console.log("Semnatura: ", semnaturaParola);


            const key_aes = await generateKey();

            // criptare elemente
            const enc_Tip = await criptareDate("password", key_aes);
            const enc_NumeItem = await criptareDate(numeItem, key_aes);
            const enc_UrlItem = await criptareDate(urlItem, key_aes);
            const enc_UsernameItem = await criptareDate(usernameItem, key_aes);
            const enc_ParolaItem = await criptareDate(parolaItem, key_aes);
            const enc_ComentariuItem = await criptareDate(comentariuItem || "N/A", key_aes);
            const enc_Semnatura = await criptareDate(semnaturaParola, key_aes);


            // criptare cheie
            const criptKey = await decodeMainKey(key);

            const key_aes_raw = await exportKey(key_aes);
            console.log("Cheia intreaga ianinte de criptare este: ", key_aes_raw);
            const enc_key_raw = await criptareDate(key_aes_raw, criptKey);

            console.log("Cheia criptata este: ", enc_key_raw);

            // 3. Decriptarea cheii AES criptate folosind cheia AES decriptată
            const dec_key = await decriptareDate(enc_key_raw.encData, enc_key_raw.iv, enc_key_raw.tag, criptKey);  // obții cheia AES decriptată

            const octetiArray = dec_key.split(',').map(item => parseInt(item.trim(), 10));

            // Creăm un Uint8Array din array-ul de numere
            const uint8Array = new Uint8Array(octetiArray);
            console.log(uint8Array);

            const jsonItemKey = { data: { encKey: { iv: enc_key_raw.iv, encData: enc_key_raw.encData, tag: enc_key_raw.tag }, }, };

            const jsonItem = {
                metadata: {
                    created_at: new Date().toISOString(),
                    modified_at: new Date().toISOString(),
                    modified_parola: new Date().toISOString(),
                    version: 1,
                    meta: {
                        lungime: length,
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
                    method: "POST", headers: { 'Content-Type': 'application/json', }, body: JSON.stringify(jsonItem), credentials: "include"
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
                const response = await fetch('http://localhost:9000/api/addKey', {
                    method: "POST", headers: { 'Content-Type': 'application/json', }, body: JSON.stringify(jsonItemKey), credentials: "include"
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
        await fetchItems();
    };

    const [arataParola, setArataParola] = useState(false);

    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-4/5 md:w-1/2 h-3/4 md:h-5/6 p-6 flex flex-col items-center justify-center relative">
                    <button className="absolute right-4 top-2 text-4xl cursor-pointer hover:text-red-300" onClick={() => setShowParolaPopup(false)}>&times;</button>
                    <h3 className="text-xl font-semibold text-center mb-6 relative">Parola Nouă</h3>
                    <form className="flex flex-col items-left w-full h-screen gap-2 flex-grow overflow-y-auto">
                        <div className="flex flex-col md:flex-row ">
                            <div className="block">
                                <label className="text-sm md:text-md font-medium">Nume Platforma</label>
                                <input type="name" value={numeItem} onChange={(e) => { setNumeItem(e.target.value) }} className="mt-2 border py-1 px-2 border-gray-600 rounded-md md:w-5/6 w-full"></input>

                            </div>
                            <div className="block">
                                <label className="text-sm md:text-md font-medium">URL</label>
                                <input type="url" value={urlItem} onChange={(e) => { setUrlItem(e.target.value) }} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full"></input>

                            </div>
                        </div>

                        <label className="text-sm md:text-md font-medium">Username</label>
                        <input type="name" value={usernameItem} onChange={(e) => { setUserNamItem(e.target.value) }} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full" placeholder="Username sau E-mail"></input>

                        <label className="text-sm md:text-md font-medium">Parola</label>

                        <div className="relative flex flex-col">
                            <input type={arataParola ? "text" : "password"} value={parolaItem} onChange={(e) => { setParolaItem(e.target.value) }} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full"></input>
                            <button type="button" className="mt-3 transform -translate-y-1/2 text-sm text-blue-500 hover:underline" onClick={() => setArataParola(!arataParola)}>
                                {arataParola ? "Ascunde" : "Afișează"}
                            </button>
                        </div>

                        {parolaItem.length > 0 && (
                            <>
                                <div className="w-full h-2 bg-gray-300 rounded mt-2">
                                    <div className={`h-2 rounded transition-all duration-300 ${strengthData.color}`} style={{ width: `${(strengthData.strength + 1) * 20}%` }} />
                                </div>

                                <p className="text-xs mt-1 text-gray-700">{strengthData.label}</p>
                                {strengthData.suggestions && strengthData.suggestions.length > 0 && (
                                    <ul className="text-xs text-red-500 mt-1 list-disc list-inside">
                                        {strengthData.suggestions.map((sugestie, index) => (
                                            <li key={index}>{sugestie}</li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                            <label className="text-sm">Lungime:</label>
                            <select value={length} onChange={(e) => setLength(Number(e.target.value))} className="border py-1 px-2 border-gray-600 rounded-md">
                                <option value="16">16</option>
                                <option value="24">24</option>
                                <option value="32">32</option>
                                <option value="64">64</option>
                            </select>
                        </div>

                        <button type="button" onClick={() => generateStrongPassword(length)} className="mt-2 bg-blue-600 text-white py-1 px-4 rounded-md hover:bg-blue-700 transition">
                            Generează parolă
                        </button>

                        <label className="text-sm md:text-md font-medium">Adauga un comentariu</label>
                        <textarea type="note" value={comentariuItem} onChange={(e) => { setComentariuItem(e.target.value) }} className="border mt-2 py-1 px-2 border-gray-600 rounded-md w-full min-h-32 resize-none" placeholder="Optional"></textarea>

                    </form>
                    <div className="flex justify-center items-center">
                        <button onClick={handleAdaugaItem} className="bg-green-600 w-full h-1/2 md:w-full md:h-2/3 items-center justify-center rounded-lg mt-4 py-2 px-4 hover:bg-yellow-500 text-white transition-all duration-200 mb-4">
                            Adaugă Item
                        </button>
                    </div>
                </div >
            </div >
        </>
    );
};

export default PopupParolaItem;