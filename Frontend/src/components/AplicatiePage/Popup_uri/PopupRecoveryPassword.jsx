import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaCopy, FaExclamationTriangle } from "react-icons/fa";
import { criptareDate, decodeMainKey } from "../../FunctiiDate/FunctiiDefinite"
import * as bip39 from 'bip39';
import CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';
if (!window.Buffer) {
    window.Buffer = Buffer;
}
const generateRecoveryKey = () => {
    const mnemonic = bip39.generateMnemonic(256);
    return mnemonic;
};
function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

async function convertToCryptoKey(base64Key) {
    const keyArrayBuffer = base64ToArrayBuffer(base64Key);
    const cryptoKey = await crypto.subtle.importKey("raw", keyArrayBuffer, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
    return cryptoKey;
}
const PopupRecoveryPassword = ({ setOpenPopupRecovery, derivedkey }) => {
    const [hasRun, setHasRun] = useState(false);
    const [recoveryKey, setRecoveryKey] = useState(null);
    const [key, setKey] = useState(derivedkey);
    console.log("cheia derivata ce urmeaza a fi criptata este: ", key);
    const handleCopy = () => {
        navigator.clipboard.writeText(recoveryKey)
            .then(() => {
                console.log("Text copiat cu succes!");
            })
            .catch((err) => {
                console.error("Eroare la copiere: ", err);
            });
    };

    const handleDownloadPDF = () => {
        console.log("S-a apăsat butonul de PDF");
    };

    const cripteazaCopieCheie = async () => {
        console.log("start criptare: ");
        let recKey = generateRecoveryKey();
        setRecoveryKey(recKey);

        try {
            let salt = null;
            try {
                const response = await fetch('http://localhost:9000/api/utilizator/getSalt', {
                    method: 'GET', headers: { 'Content-Type': 'application/json', }, credentials: "include"
                });
                if (response.ok) {
                    const data = await response.json();
                    salt = CryptoJS.enc.Base64.parse(data.salt);;
                }

            } catch (error) {
                console.log("Eroare luare salt: ", error);
            }
            if (salt === null) {
                console.error("Saltul e null");
            }

            console.log("saltul este: ", salt);
            if (!recKey) {
                console.error("Recovery Key e null");
                return;
            }

            console.log("cuvantul de recovery este: ", recKey);
            const derivedKey = CryptoJS.PBKDF2(recKey, salt, { keySize: 256 / 32, iterations: 500000 });// tre sa ajustez nr de iteratii
            const derivedKeyBase64 = derivedKey.toString(CryptoJS.enc.Base64);
            console.log("Cheia folosita la criptare este: ", derivedKeyBase64);

            // criptare cheie
            const criptKey = await decodeMainKey(derivedKeyBase64);
            console.log("cheia derivata ce urmeaza a fi criptata este: ", key);
            const enc_key_raw = await criptareDate(key, criptKey);
            console.log("Cheia criptata este: ", enc_key_raw);

            // trimitere la server

            const jsonItemKey = { data: { encKey: { iv: enc_key_raw.iv, encData: enc_key_raw.encData, tag: enc_key_raw.tag }, }, };

            try {
                const response = await fetch('http://localhost:9000/api/utilizator/addRecoveryKey', {
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
        console.log("finalizare criptare: ");
    };

    useEffect(() => {
        if (!hasRun) {
            cripteazaCopieCheie();
            setHasRun(true);
        }
    }, [hasRun]);
    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-96 md:w-96 h-1/2 md:h-1/2 p-6 flex flex-col items-center justify-center relative">
                    <button className="absolute right-4 top-2 text-4xl cursor-pointer hover:text-red-300" onClick={() => setOpenPopupRecovery(false)}>&times;</button>
                    <div className="flex flex-row">
                        <h2 className="text-lg font-semibold text-center mb-4">Cheie generată cu succes !</h2>
                        <FaCheckCircle className="ml-2 text-green-400 text-xl mt-1" />
                    </div>
                    <div className="flex flex-row">
                        <FaExclamationTriangle className="ml-2 text-yellow-500 text-xl mt-0" />
                        <h3 className="italic text-sm text-center mb-4 ml-2">Asigură-te că salvezi cheia într-un loc sigur și accesibil pentru tine</h3>
                    </div>
                    <div className="border border-black p-4 w-full text-center mb-4"><p>{recoveryKey}</p></div>
                    <div className="flex flex-row justify-center gap-4 mb-4">
                        <button onClick={handleCopy} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                            <FaCopy />Copy
                        </button>
                        <button onClick={handleDownloadPDF} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                            Descarcă ca PDF
                        </button>
                    </div>
                    <button onClick={() => setOpenPopupRecovery(false)} className="bg-purple-600 hover:bg-purple-800 text-white py-2 px-4 rounded">
                        OK
                    </button>
                </div>
            </div>
        </>
    );
};

export default PopupRecoveryPassword;