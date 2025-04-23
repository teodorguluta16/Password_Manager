import React from "react";
import { useState, useEffect } from "react";
import { criptareDate, generateKey, decodeMainKey, decriptareDate, exportKey } from "../../FunctiiDate/FunctiiDefinite"
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

const PopupNewGrupCard = ({ setShowCardPopup, derivedKey, idgrup, fetchItems }) => {
    const [numeBanca, setNumeBanca] = useState("");
    const [numarCard, setNumarCard] = useState("");
    const [numePosesor, setNumePosesor] = useState("");
    const [dataExpirare, setDataExpirare] = useState("");
    const [comentariuCard, setComentariuCard] = useState("");
    const [key, setKey] = useState(derivedKey);

    useEffect(() => {
        if (derivedKey) {
            setKey(derivedKey);
            console.log("Cheia setată:", derivedKey);
        }
    }, [derivedKey]);

    const handleAdaugaItem = async () => {
        try {
            if (!numeBanca || !numarCard || numePosesor || dataExpirare) {
                alert("Completează câmpurile !");
                return;
            }
            setShowCardPopup(false);

            // 1. genere o cheie aes pentru itemul respectiv
            const key_aes = await generateKey();
            console.log("Cheia generata pentru item: ", key_aes);

            // 2. criptez itemul respectiv cu cheia
            const enc_Tip = await criptareDate("card", key_aes);
            const enc_NumeItem = await criptareDate(numeBanca, key_aes);
            const enc_NumarItem = await criptareDate(numarCard, key_aes);
            const enc_NumePosesorItem = await criptareDate(numePosesor, key_aes);
            const enc_dataExpirareItem = await criptareDate(dataExpirare, key_aes);
            const enc_ComentariuItem = await criptareDate(comentariuCard || "N/A", key_aes);

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
                    numarItem: { iv: enc_NumarItem.iv, encData: enc_NumarItem.encData, tag: enc_NumarItem.tag },
                    numePosesor: { iv: enc_NumePosesorItem.iv, encData: enc_NumePosesorItem.encData, tag: enc_NumePosesorItem.tag },
                    dataExpirare: { iv: enc_dataExpirareItem.iv, encData: enc_dataExpirareItem.encData, tag: enc_dataExpirareItem.tag },
                    comentariu: { iv: enc_ComentariuItem.iv, encData: enc_ComentariuItem.encData, tag: enc_ComentariuItem.tag }
                },
            };

            const requestBody = { id_grup: idgrup, jsonItem: jsonItem };
            try {
                const response = await fetch('http://localhost:9000/api/grupuri/addItemGroup', {
                    method: "POST", headers: { 'Content-Type': 'application/json', }, body: JSON.stringify(requestBody), credentials: "include"
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

    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-4/5 md:w-1/2 h-3/4 md:h-5/6 p-6 flex flex-col items-center justify-center relative">
                    <button className="absolute right-4 top-2 text-4xl cursor-pointer hover:text-red-300" onClick={() => setShowCardPopup(false)}>&times;</button>
                    <h3 className="text-xl font-semibold text-center mb-6 relative">Adaugă Card Bancar</h3>
                    <form className="flex flex-col items-left w-full h-screen gap-2 flex-grow overflow-y-auto">

                        <label className="text-sm md:text-md font-medium">Nume Bancă</label>
                        <input type="text" value={numeBanca} onChange={(e) => setNumeBanca(e.target.value)} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full" placeholder="Ex: Banca Transilvania" />

                        <label className="text-sm md:text-md font-medium">Număr Card</label>
                        <input type="text" value={numarCard} onChange={(e) => setNumarCard(e.target.value)} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full" placeholder="XXXX XXXX XXXX XXXX" maxLength="19" />

                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-1/2">
                                <label className="text-sm md:text-md font-medium">Nume Posesor</label>
                                <input type="text" value={numePosesor} onChange={(e) => setNumePosesor(e.target.value)} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full" placeholder="Ion Popescu" maxLength="19" />

                            </div>
                            <div className="w-1/2">
                                <label className="text-sm md:text-md font-medium">Data Expirare</label>
                                <input type="text" value={dataExpirare} onChange={(e) => setDataExpirare(e.target.value)} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full" placeholder="MM/YY" maxLength="5" />
                            </div>
                        </div>

                        <label className="text-sm md:text-md font-medium">Adaugă un comentariu</label>
                        <textarea value={comentariuCard} onChange={(e) => setComentariuCard(e.target.value)} className="border mt-2 py-1 px-2 border-gray-600 rounded-md w-full min-h-32 resize-none" placeholder="Note opționale"></textarea>
                    </form>

                    <div className="flex justify-center items-center w-full">
                        <button onClick={handleAdaugaItem} className="bg-green-600 w-full py-2 px-4 rounded-lg mt-4 hover:bg-yellow-500 text-white transition-all duration-200 mb-4">
                            Adaugă Card
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PopupNewGrupCard;