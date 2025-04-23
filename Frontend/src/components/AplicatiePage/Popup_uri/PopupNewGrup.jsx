import React from "react";
import { useState, useEffect } from "react";

import { generateKey, exportKey } from '../../FunctiiDate/FunctiiDefinite'
import forge from 'node-forge';

function encryptWithPublicKey(message, publicKey) {
    return publicKey.encrypt(message, 'RSA-OAEP', {
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
const PopupNewGrup = ({ setPopupGrupNou, derivedKey, fetchGroups }) => {
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
        console.log("Chiea simetrica a grupului este: ", key_aes);
        // 2.extrag CHEIA PUBLICA A OWNERULUI si o convertesc in PEM pentru a cripta cheia aes generata
        let publicKeyUtilizator = null;
        // extrag cheia publica
        try {
            const response = await fetch('http://localhost:9000/api/getUserPublicKey', {
                method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: "include"
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
            console.log("Cheia AES a grupului criptata (base64):", encryptedMessageBase64);
        } catch (error) {
            console.error("Eroare la criptare:", error.message);
        }

        // 4. Construirea JSON-ului cu datele de trimis la server
        const jsonItem = { numeGrup: nameItem, descriere: comentariuItem, encryptedAesKey: encryptedMessageBase64, };

        try {
            const response = await fetch('http://localhost:9000/api/addGrup', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jsonItem), credentials: "include"
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
        await fetchGroups();
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