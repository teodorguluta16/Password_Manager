import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import { criptareDate, generateKey, decodeMainKey, decriptareDate, exportKey, importAESKey } from "../../FunctiiDate/FunctiiDefinite"
import { useKeySimetrica } from '../../FunctiiDate/ContextKeySimetrice'
import forge from 'node-forge';
import CryptoJS from 'crypto-js';

function hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
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

const PopupNewUtilizatorGrup = ({ accessToken, setPopupUtilizatorNou, idgrup, derivedKey }) => {
    const [key, setKey] = useState(derivedKey);

    useEffect(() => {
        if (derivedKey) {
            setKey(derivedKey);
        }
    }, [derivedKey]);

    console.log("Cheia simetrică este: ", key);

    const [nameItem, setNameItem] = useState('');

    const handleAdaugaMembru = async () => {

        if (!nameItem) {
            alert("Completează toate câmpurile!");
            return;
        }
        // 1. mai intai extrag cheia privata OWNERULUI si o decriptez pentru a decripta cheia cheia aia AES

        let encryptedPrivateKeyUtilizator = null;
        try {
            const response = await fetch('http://localhost:9000/api/getUserEncryptedPrivateKey', {
                method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
            });

            if (response.ok) {
                const data2 = await response.json();
                encryptedPrivateKeyUtilizator = data2.encryptedprivatekey;
            } else {
                const errorData = await response.json(); console.log('Eroare:', errorData.message);
            }
        } catch (error) {
            console.error('Eroare la trimiterea cererii:', error);
        }

        // convertesc cheia privata din HEX in string: 
        const decodedString2 = hexToString(encryptedPrivateKeyUtilizator);
        const dataObject2 = JSON.parse(decodedString2);
        console.log(dataObject2);

        const ivHex2 = dataObject2.encKey.iv;
        const encDataHex2 = dataObject2.encKey.encData;
        const tagHex2 = dataObject2.encKey.tag;

        const decriptKey = await decodeMainKey(key);
        const decc_key = await decriptareDate(encDataHex2, ivHex2, tagHex2, decriptKey);
        console.log("Cheia decriptata ar trebui sa fie: ", decc_key);

        // 2. Extrag cheia aes a grupului criptata si o decriptez cu cheia privata rsa
        let encryptedgroupAesKey = null;
        try {
            const response = await fetch('http://localhost:9000/api/getGroupSimmetricEncryptedKey', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, body: JSON.stringify({ idgrup })
            });

            if (response.ok) {
                const data2 = await response.json();
                encryptedgroupAesKey = data2.EncryptedAesKeyBase64;
            } else {
                const errorData = await response.json(); console.log('Eroare:', errorData.message);
            }
        } catch (error) {
            console.error('Eroare la trimiterea cererii:', error);
        }
        console.log("Mesajul criptat (base64):", encryptedgroupAesKey);
        const encryptedMessage = forge.util.decode64(encryptedgroupAesKey);
        let decryptedMessage;
        const privateKey2 = forge.pki.privateKeyFromPem(decc_key);
        try {
            decryptedMessage = decryptWithPrivateKey(encryptedMessage, privateKey2);
            console.log("Cheia simetrica a grupului decriptata:", decryptedMessage);
        } catch (error) {
            console.error("Eroare la decriptare:", error.message);
        }

        //3. identific utilizatorul pe care vreau sa il adaug (ii iau id-ul), apoi ii extrag cheia publica, il identific dupa email
        let newMemberId = null;
        try {
            const response = await fetch('http://localhost:9000/api/getNewMemberId', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, body: JSON.stringify({ nameItem })
            });

            if (response.ok) {
                const data2 = await response.json();
                newMemberId = data2.IdMembru;
            } else {
                const errorData = await response.json(); console.log('Eroare:', errorData.message);
            }
        } catch (error) {
            console.error('Eroare la trimiterea cererii:', error);
        }

        // extrag cheia publica
        let publicKeyUtilizator = null;
        try {
            const response = await fetch('http://localhost:9000/api/getNewUserGroupPublicKey', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }, body: JSON.stringify({ newMemberId })
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
        let publicKeyUtilizatorPem = fixBase64Key(publicKeyUtilizator);
        console.log("Cheia publica a userului este cu id-ul ", newMemberId, "si emailul ", nameItem, " este: ", publicKeyUtilizatorPem);

        //4 criptez cheia aia aes cu cheia lui publica
        if (!isValidPem(publicKeyUtilizatorPem)) {
            console.error("Cheia publică nu este într-un format PEM valid.");
        } else {
            console.log("Cheia publică este într-un format PEM valid.");
        }

        // Converstesc cheia din Uint8Array in Base64;

        const publicKey2 = forge.pki.publicKeyFromPem(publicKeyUtilizatorPem);
        //const privateKey2 = forge.pki.privateKeyFromPem(decc_key);
        const message = decryptedMessage;  // mesajul ce urmeaza a fi criptat
        console.log("cheia aes ce urmeaza a fi criptata: ", message);
        let encryptedMessage2; /// aici criptam efectiv
        let encryptedMessage2Base64; /// aici criptam efectiv
        try {
            encryptedMessage2 = encryptWithPublicKey(message, publicKey2);
            encryptedMessage2Base64 = forge.util.encode64(encryptedMessage2);
            console.log("Cheia simetrica criptata sharuita pentru noul ut este (base64):", encryptedMessage2Base64);
        } catch (error) {
            console.error("Eroare la criptare:", error.message);
        }

        // inserez cheia criptata in baza de date in legusergrup
        const jsonItem = {
            idMembru: newMemberId,
            grupId: idgrup,
            encryptedKey: encryptedMessage2Base64,
        };

        try {
            console.log(jsonItem);
            const response = await fetch('http://localhost:9000/api/addMembruGrup', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify(jsonItem)
            });

            if (response.ok) {
                const data2 = await response.json();
                console.log(data2);
                //publicKeyUtilizator = data2.PublicKey;
            } else {
                const errorData = await response.json(); console.log('Eroare:', errorData.message);
            }
        } catch (error) {
            console.error('Eroare la trimiterea cererii:', error);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-4/5 md:w-1/2 h-2/5 md:h-2/5 p-6 flex flex-col items-center justify-center relative">
                    <button className="absolute right-4 top-2 text-4xl cursor-pointer hover:text-red-300" onClick={() => setPopupUtilizatorNou(false)}>&times;</button>
                    <h3 className="text-xl sm:text-2xl font-semibold text-center mb-6 relative">Membru Nou</h3>
                    <form className="flex flex-col items-left w-full gap-2 flex-grow overflow-y-auto">
                        <label className="text-xl md:text-md font-medium">Email</label>
                        <input type="name" value={nameItem} onChange={(e) => { setNameItem(e.target.value) }} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full" placeholder=""></input>

                    </form>
                    <div className="flex justify-center items-center">
                        <button onClick={handleAdaugaMembru} className="bg-green-600 w-full h-1/2 md:w-full md:h-2/3 items-center justify-center rounded-lg mt-4 py-2 px-4 hover:bg-yellow-500 text-white transition-all duration-200 mb-4">
                            Creează
                        </button>
                    </div>
                </div >
            </div >
        </>
    );
};

export default PopupNewUtilizatorGrup;