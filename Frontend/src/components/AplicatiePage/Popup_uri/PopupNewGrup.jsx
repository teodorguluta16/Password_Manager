import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import { criptareDate, generateKey, decodeMainKey, decriptareDate, exportKey } from '../../FunctiiDate/FunctiiDefinite'
import { useKeySimetrica } from '../../FunctiiDate/ContextKeySimetrice'
import forge from 'node-forge';
import CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';

// Generare pereche de chei RSA
function generateRSAKeyPair() {
    const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair(2048);
    const publicKeyPem2 = forge.pki.publicKeyToPem(publicKey);
    const privateKeyPem2 = forge.pki.privateKeyToPem(privateKey);
    return { publicKeyPem2, privateKeyPem2 };
}

// Criptare cu cheia publică
function encryptWithPublicKey(message, publicKey) {
    return publicKey.encrypt(message, 'RSA-OAEP', {
        md: forge.md.sha256.create()
    });
}

// Decriptare cu cheia privată
function decryptWithPrivateKey(encryptedMessage, privateKey) {
    return privateKey.decrypt(encryptedMessage, 'RSA-OAEP', {
        md: forge.md.sha256.create()
    });
}
function isValidPem(publicKeyPem) {
    const pemRegex = /-----BEGIN PUBLIC KEY-----\s*[\s\S]+?\s*-----END PUBLIC KEY-----/;
    return pemRegex.test(publicKeyPem);
}

function fixBase64Key(base64Key) {
    const cleanedKey = base64Key.replace(/\n/g, "").replace(/\r/g, "");
    const formattedKey = cleanedKey.match(/.{1,64}/g).join("\n");
    return "-----BEGIN PUBLIC KEY-----\n" + formattedKey + "\n-----END PUBLIC KEY-----";
}
function hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}
const PopupNewGrup = ({ accessToken, setPopupGrupNou, derivedKey }) => {
    const [key, setKey] = useState(derivedKey);

    useEffect(() => {
        if (derivedKey) {
            setKey(derivedKey);
        }
    }, [derivedKey]);

    console.log("Cheia simetrică este: ", key);

    const [nameItem, setNameItem] = useState('');
    const [comentariuItem, setComentariuItem] = useState('');


    const handleAdaugaGrup = async () => {
        if (!nameItem || !comentariuItem) {
            alert("Completează toate câmpurile!");
            return;
        }

        // 1.generez o cheie noua AES si criptez cheia privata a  grupului

        const key_aes = await generateKey();
        //console.log("Chiea simetrica cu care criptez cheia privata este: ", key_aes);

        // 2.extrag CHEIA PUBLICA A OWNERULUI si o convertesc in PEM pentru a cripta cheia aes generata

        let publicKeyUtilizator = null;
        // extrag cheia publica
        try {
            const response = await fetch('http://localhost:9000/api/getUserPublicKey', {
                method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
            });

            if (response.ok) {
                const data2 = await response.json();
                publicKeyUtilizator = data2.PublicKey;
            } else {
                const errorData = await response.json(); console.log('Eroare:', errorData.message);
            }
        } catch (error) {
            console.error('Eroare la trimiterea cererii:', error);
        }

        //convertesc in PEM
        let publicKeyUtilizatorPem = fixBase64Key(publicKeyUtilizator);

        // extrag cheia privata si o decriptez  !!! asta o fac de test aici
        //let encryptedPrivateKeyUtilizator = null;
        //try {
        //    const response = await fetch('http://localhost:9000/api/getUserEncryptedPrivateKey', {
        //        method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        //    });

        //    if (response.ok) {
        //        const data2 = await response.json();
        //        encryptedPrivateKeyUtilizator = data2.encryptedprivatekey;
        //    } else {
        //        const errorData = await response.json(); console.log('Eroare:', errorData.message);
        //    }
        //} catch (error) {
        //    console.error('Eroare la trimiterea cererii:', error);
        //}

        // convertesc cheia privata din HEX in string: 
        //const decodedString2 = hexToString(encryptedPrivateKeyUtilizator);
        //const dataObject2 = JSON.parse(decodedString2);

        //const ivHex2 = dataObject2.encKey.iv;
        //const encDataHex2 = dataObject2.encKey.encData;
        //const tagHex2 = dataObject2.encKey.tag;

        //const decriptKey = await decodeMainKey(key);
        //const decc_key = await decriptareDate(encDataHex2, ivHex2, tagHex2, decriptKey);
        //console.log("Cheia decriptata ar trebui sa fie: ", decc_key);

        // !!!!! pana acuma am decriptat cheia privata a utilziatorului


        // 3.criptez cheia aia aes cu cheia asta publica A OWNERULUI publicKeyPem RSA

        const key_aes_raw = await exportKey(key_aes);

        if (!(key_aes_raw instanceof Uint8Array)) {
            console.error("Cheia AES nu este într-un format corect (Uint8Array).");
        } else {
            console.log("Cheia AES este într-un format valid (Uint8Array).");
        }

        const aesKeyLength = key_aes_raw.length;

        if (aesKeyLength !== 16 && aesKeyLength !== 24 && aesKeyLength !== 32) {
            console.error("Lungimea cheii AES nu este validă. Permise sunt doar 16, 24 sau 32 de octeți.");
        } else {
            console.log(`Lungimea cheii AES este corectă: ${aesKeyLength} octeți.`);
        }

        if (!isValidPem(publicKeyUtilizatorPem)) {
            console.error("Cheia publică nu este într-un format PEM valid.");
        } else {
            console.log("Cheia publică este într-un format PEM valid.");
        }

        // Converstesc cheia din Uint8Array in Base64;
        const base64String = forge.util.encode64(String.fromCharCode.apply(null, key_aes_raw));
        console.log("Cheia aes ce urmeaza a fi criptata in format base64:", base64String);
        const publicKey2 = forge.pki.publicKeyFromPem(publicKeyUtilizatorPem);
        //const privateKey2 = forge.pki.privateKeyFromPem(decc_key);
        const message = base64String;  // mesajul ce urmeaza a fi criptat
        let encryptedMessage; /// aici tinem ce criptam efectiv
        let encryptedMessageBase64; /// aici criptam efectiv in base64
        try {
            encryptedMessage = encryptWithPublicKey(message, publicKey2);
            encryptedMessageBase64 = forge.util.encode64(encryptedMessage);
            console.log("Mesajul criptat (base64):", encryptedMessageBase64);
        } catch (error) {
            console.error("Eroare la criptare:", error.message);
        }

        // aici decriptam ***********
        // let decryptedMessage;
        //try {
        //   decryptedMessage = decryptWithPrivateKey(encryptedMessage, privateKey2);
        //    console.log("Mesajul decriptat:", decryptedMessage);
        //} catch (error) {
        //   console.error("Eroare la decriptare:", error.message);
        //}


        // 4. Construirea JSON-ului cu datele de trimis la server
        const jsonItem = {
            numeGrup: nameItem,
            descriere: comentariuItem,
            encryptedAesKey: encryptedMessageBase64,
        };

        try {
            const response = await fetch('http://localhost:9000/api/addGrup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(jsonItem)
            });

            if (response.ok) {
                console.log('Grup adăugat cu succes!');
                setPopupGrupNou(false);
            } else {
                const errorData = await response.json();
                console.log('Eroare:', errorData.message);
            }
        } catch (error) {
            console.error('Eroare la trimiterea cererii:', error);
        }

    };

    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-4/5 md:w-1/2 h-2/4 md:h-2/3 p-6 flex flex-col items-center justify-center relative">
                    <button className="absolute right-4 top-2 text-4xl cursor-pointer hover:text-red-300" onClick={() => setPopupGrupNou(false)}>&times;</button>
                    <h3 className="text-xl font-semibold text-center mb-6 relative">Grup Nou</h3>
                    <form className="flex flex-col items-left w-full gap-2 flex-grow overflow-y-auto">
                        <label className="text-sm md:text-md font-medium">Nume</label>
                        <input type="name" value={nameItem} onChange={(e) => { setNameItem(e.target.value) }} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full" placeholder=""></input>

                        <label className="text-sm md:text-md font-medium">Descriere</label>
                        <textarea type="note" value={comentariuItem} onChange={(e) => { setComentariuItem(e.target.value) }} className="border mt-2 py-1 px-2 border-gray-600 rounded-md w-full min-h-32 resize-none"></textarea>
                    </form>
                    <div className="flex justify-center items-center">
                        <button onClick={handleAdaugaGrup} className="bg-green-600 w-full h-1/2 md:w-full md:h-2/3 items-center justify-center rounded-lg mt-4 py-2 px-4 hover:bg-yellow-500 text-white transition-all duration-200 mb-4">
                            Creează
                        </button>
                    </div>
                </div >
            </div >
        </>
    );
};

export default PopupNewGrup;