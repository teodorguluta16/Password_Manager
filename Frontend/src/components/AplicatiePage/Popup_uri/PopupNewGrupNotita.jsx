import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import { criptareDate, generateKey, decodeMainKey, decriptareDate, exportKey } from "../../FunctiiDate/FunctiiDefinite"
import { useKeySimetrica } from '../../FunctiiDate/ContextKeySimetrice'
import forge from 'node-forge';

function hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}
function decryptWithPrivateKey(encryptedMessage, privateKey) {
    return privateKey.decrypt(encryptedMessage, 'RSA-OAEP', {
        md: forge.md.sha256.create()
    });
}

const PopupNewGrupNotita = ({ setShowNotitaPopup, derivedKey, idgrup }) => {
    const [numeItem, setNumeItem] = useState('');
    const [date, setDateItem] = useState('');
    const [comentariuItem, setComentariuItem] = useState('');
    const [key, setKey] = useState(derivedKey);

    useEffect(() => {
        if (derivedKey) {
            setKey(derivedKey);
            console.log("Cheia setată:", derivedKey);
        }
    }, [derivedKey]);

    const handleAdaugaItem = async () => {
        try {
            setShowNotitaPopup(false);

            // 1. genere o cheie aes pentru itemul respectiv
            const key_aes = await generateKey();
            console.log("Cheia generata pentru item: ", key_aes);

            // 2. criptez itemul respectiv cu cheia
            const enc_Tip = await criptareDate("notita", key_aes);
            const enc_NumeItem = await criptareDate(numeItem, key_aes);
            const enc_datalItem = await criptareDate(date, key_aes);
            const enc_ComentariuItem = await criptareDate(comentariuItem, key_aes);

            // 3. Criptam cheia aes dar nu cu key ci cu simmmetric group key. Deci extragem mai intai enc simmetricgroupkey

            //  mai intai extrag cheia privata OWNERULUI si o decriptez pentru a decripta cheia aia AES

            let encryptedPrivateKeyUtilizator = null;
            try {
                const response = await fetch('http://localhost:9000/api/getUserEncryptedPrivateKey', {
                    method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: "include"
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


            // Extrag cheia aes a grupului criptata si o decriptez cu cheia privata rsa
            let encryptedgroupAesKey = null;
            try {
                const response = await fetch('http://localhost:9000/api/getGroupSimmetricEncryptedKey', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idgrup }),
                    credentials: "include"
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
            console.log("Cheia criptata a grupului (base64):", encryptedgroupAesKey);
            const encryptedMessage = forge.util.decode64(encryptedgroupAesKey);
            let decryptedMessage;
            const privateKey2 = forge.pki.privateKeyFromPem(decc_key);
            try {
                decryptedMessage = decryptWithPrivateKey(encryptedMessage, privateKey2);
                console.log("Cheia simetrica a grupului decriptata:", decryptedMessage);
            } catch (error) {
                console.error("Eroare la decriptare:", error.message);
            }

            // acuma criptez cheia aia aes cu simmetric key
            const criptKey = await decodeMainKey(decryptedMessage);

            const key_aes_raw = await exportKey(key_aes);
            console.log("Cheia intreaga ianinte de criptare este: ", key_aes_raw);
            const enc_key_raw = await criptareDate(key_aes_raw, criptKey);

            console.log("Cheia criptata este: ", enc_key_raw);

            const jsonItemKey = {
                data: {
                    encKey: { iv: enc_key_raw.iv, encData: enc_key_raw.encData, tag: enc_key_raw.tag },
                },
            };

            const jsonItem = {
                metadata: {
                    created_at: new Date().toISOString(),
                    modified_at: new Date().toISOString(),
                    version: 1
                },
                data: {
                    tip: { iv: enc_Tip.iv, encData: enc_Tip.encData, tag: enc_Tip.tag, },
                    nume: { iv: enc_NumeItem.iv, encData: enc_NumeItem.encData, tag: enc_NumeItem.tag },
                    data: { iv: enc_datalItem.iv, encData: enc_datalItem.encData, tag: enc_datalItem.tag },
                    comentariu: { iv: enc_ComentariuItem.iv, encData: enc_ComentariuItem.encData, tag: enc_ComentariuItem.tag }
                },
            };

            const requestBody = {
                id_grup: idgrup,
                jsonItem: jsonItem
            };


            try {
                const response = await fetch('http://localhost:9000/api/grupuri/addItemGroup', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                    credentials: "include"
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
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jsonItemKey),
                    credentials: "include"
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Eroare la server:", errorText);
                    return;
                }
            } catch (error) {
                console.error("Eroare la trimitere", error);
            };

            //const decodedString = hexToString(encryptedsimmetricKeyGroup);

            //const dataObject = JSON.parse(decodedString);
            //console.log(dataObject);
            //const ivHex = dataObject.encKey.iv;
            //const encDataHex = dataObject.encKey.encData;
            //const tagHex = dataObject.encKey.tag;



            //const criptKey = await decodeMainKey(key);

            //const key_aes_raw = await exportKey(key_aes);
            //console.log("Cheia intreaga ianinte de criptare este: ", key_aes_raw);
            //const enc_key_raw = await criptareDate(key_aes_raw, criptKey);

            //console.log("Cheia criptata este: ", enc_key_raw);

            // 3. Decriptarea cheii AES criptate folosind cheia AES decriptată
            //const dec_key = await decriptareDate(enc_key_raw.encData, enc_key_raw.iv, enc_key_raw.tag, criptKey);  // obții cheia AES decriptată

            //const octetiArray = dec_key.split(',').map(item => parseInt(item.trim(), 10));

            // Creăm un Uint8Array din array-ul de numere
            //const uint8Array = new Uint8Array(octetiArray);
            //console.log(uint8Array);

            //const importedKey = await window.crypto.subtle.importKey(
            //    "raw",               // Importăm cheia în format brut
            //    uint8Array,          // Cheia de tip Uint8Array
            //    { name: "AES-GCM" },  // Algoritmul de criptare
            //    false,               // Nu este necesar să exportăm cheia
            //    ["encrypt", "decrypt"]  // Permisiunile cheii
            //);

            //const dec_tip = await decriptareDate(enc_Tip.encData, enc_Tip.iv, enc_Tip.tag, importedKey);

            //const decoded_key = await decodeMainKey(dec_key);

            //console.log("Elementul decriptat ar trebui sa fie: ", dec_tip);

        } catch (error) {
            console.error("Eroare la criptarea datelor:", error);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-4/5 md:w-1/2 p-6 flex flex-col items-center justify-center relative">
                    <button className="absolute right-2 top-2 text-4xl cursor-pointer hover:text-red-300" onClick={() => setShowNotitaPopup(false)}>&times;</button>
                    <h3 className="text-xl font-semibold text-center mb-6 mt-3">Notiță Nouă</h3>
                    <form className="flex flex-col items-left w-full gap-2">

                        <label className="text-md font-medium">Nume</label>
                        <input type="name" value={numeItem} onChange={(e) => { setNumeItem(e.target.value) }} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full"></input>

                        <label className="text-md font-medium">Data</label>
                        <input type="date" value={date} onChange={(e) => { setDateItem(e.target.value) }} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full cursor-pointer"></input>

                        <label className="text-md font-medium">Adaugă un comentariu</label>
                        <textarea type="note" value={comentariuItem} onChange={(e) => { setComentariuItem(e.target.value) }} className="mt-2 border py-1 px-2 border-gray-600 border-1 rounded-md w-full h-32 max-h-64"></textarea>
                    </form>
                    <div className="flex justify-center items-center">
                        <button onClick={handleAdaugaItem} className="bg-green-600 w-full h-1/2 md:w-full md:h-2/3 items-center justify-center rounded-lg mt-4 py-2 px-4 hover:bg-yellow-500 text-white transition-all duration-200 mb-4">
                            Adaugă Item
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PopupNewGrupNotita;