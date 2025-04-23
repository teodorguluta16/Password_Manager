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
    return privateKey.decrypt(encryptedMessage, 'RSA-OAEP', { md: forge.md.sha256.create() });
}

const PopupNewGrupRemote = ({ setShowRemotePopup, derivedKey, idgrup, fetchItems }) => {
    const [numeItem, setNumeItem] = useState('');
    const [hostItem, setHostItem] = useState('');
    const [usernameItem, setUserNamItem] = useState('');
    const [parolaItem, setParolaItem] = useState('');
    const [cheiePrivata, setCheiePrivata] = useState('');
    const [cheiePublica, setCheiePublica] = useState('');
    const [cheiePPK, setCheiePPK] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generateSSHKeys = () => {
        const keypair = forge.pki.rsa.generateKeyPair({ bits: 4096 });

        // Convertim cheia privată în format PEM
        const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

        // Convertim cheia publică în format OpenSSH manual
        const publicKeyDer = forge.asn1.toDer(forge.pki.publicKeyToAsn1(keypair.publicKey)).getBytes();
        const publicKeyBase64 = btoa(publicKeyDer);
        const publicKeyOpenSSH = `ssh-rsa ${publicKeyBase64} ${usernameItem}`;

        // Setăm cheile generate în state
        setCheiePrivata(privateKeyPem);
        setCheiePublica(publicKeyOpenSSH);
        setCheiePPK('');
    };

    const downloadKeyFile = (keyContent, fileName) => {
        const blob = new Blob([keyContent], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleKeyUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target.result;

            if (file.name.endsWith(".ppk")) {
                setCheiePPK(fileContent);
            } else {
                alert("⚠️ Format neacceptat! ");
            }
        };
        reader.readAsText(file);
    };

    const [key, setKey] = useState(derivedKey);

    useEffect(() => {
        if (derivedKey) {
            setKey(derivedKey);
            console.log("Cheia setată:", derivedKey);
        }
    }, [derivedKey]);

    const handleAdaugaItem = async () => {
        try {
            setShowRemotePopup(false);

            // 1. genere o cheie aes pentru itemul respectiv
            const key_aes = await generateKey();
            console.log("Cheia generata pentru item: ", key_aes);

            // 2. criptez itemul respectiv cu cheia
            const enc_Tip = await criptareDate("remoteConnexion", key_aes);
            const enc_NumeItem = await criptareDate(numeItem, key_aes);
            const enc_Hostitem = await criptareDate(hostItem, key_aes);
            const enc_UsernameItem = await criptareDate(usernameItem, key_aes);
            const enc_ParolaItem = await criptareDate(parolaItem, key_aes);
            const enc_PPKkey = await criptareDate(cheiePPK, key_aes);


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

            const jsonItemKey = { data: { encKey: { iv: enc_key_raw.iv, encData: enc_key_raw.encData, tag: enc_key_raw.tag }, }, };

            const jsonItem = {
                metadata: {
                    created_at: new Date().toISOString(), modified_at: new Date().toISOString(), version: 1
                },
                data: {
                    tip: { iv: enc_Tip.iv, encData: enc_Tip.encData, tag: enc_Tip.tag },
                    nume: { iv: enc_NumeItem.iv, encData: enc_NumeItem.encData, tag: enc_NumeItem.tag },
                    host: { iv: enc_Hostitem.iv, encData: enc_Hostitem.encData, tag: enc_Hostitem.tag },
                    username: { iv: enc_UsernameItem.iv, encData: enc_UsernameItem.encData, tag: enc_UsernameItem.tag },
                    parola: { iv: enc_ParolaItem.iv, encData: enc_ParolaItem.encData, tag: enc_ParolaItem.tag },
                    ppkKey: { iv: enc_PPKkey.iv, encData: enc_PPKkey.encData, tag: enc_PPKkey.tag }
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
        <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-4/5 md:w-1/2 h-6/7 md:h-6/7 p-6 flex flex-col items-center justify-center relative">
                <button className="absolute right-4 top-2 text-4xl cursor-pointer hover:text-red-300"
                    onClick={() => setShowRemotePopup(false)}>&times;</button>
                <h3 className="text-xl font-semibold text-center mb-6 relative">Conexiune Nouă</h3>

                <form className="flex flex-col w-full gap-2">
                    <div>
                        <label className="text-sm md:text-md font-medium">Nume Platforma</label>
                        <input type="text" value={numeItem} onChange={(e) => setNumeItem(e.target.value)}
                            className="border py-1 px-2 border-gray-600 rounded-md w-full mt-2" />
                    </div>
                    <label className="text-sm md:text-md font-medium">Host/IP</label>
                    <input type="text" value={hostItem} onChange={(e) => setHostItem(e.target.value)} className="border py-1 px-2 border-gray-600 rounded-md w-full" />

                    <div className="flex flex-row gap-2 ">
                        <div>
                            <label className="text-sm md:text-md font-medium">Username</label>
                            <input type="text" value={usernameItem} onChange={(e) => setUserNamItem(e.target.value)}
                                className="border py-1 px-2 border-gray-600 rounded-md w-5/6 mt-2" />
                        </div>
                        <div>
                            <label className="text-sm md:text-md font-medium">Parola</label>
                            <input type="password" value={parolaItem} onChange={(e) => { setParolaItem(e.target.value) }} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full"></input>
                        </div>
                    </div>
                    <label className="text-sm md:text-md font-medium">Generează cheie SSH</label>
                    <button type="button" onClick={generateSSHKeys}
                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition">Generează Cheie</button>

                    {cheiePrivata && (
                        <div className="flex flex-row gap-2 mt-2">
                            <button className="bg-yellow-600 text-white  py-2 px-2 rounded-md hover:bg-yellow-800 transition" type="button" onClick={() => downloadKeyFile(cheiePrivata, `${usernameItem}_id_rsa.pem`)}>
                                Descarcă Cheie Privată
                            </button>
                            <button className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-800 transition" type="button" onClick={() => downloadKeyFile(cheiePublica, `${usernameItem}_id_rsa.pub`)}>
                                Descarcă Cheie Publică
                            </button>
                        </div>
                    )}

                    {/* Opțiunea de a încărca un fișier PPK, PEM sau id_rsa */}
                    <label className="text-sm md:text-md font-medium mt-4">
                        Încarcă cheie PPK
                    </label>
                    <input type="file" accept=".ppk" onChange={handleKeyUpload} className="border py-1 px-2 border-gray-600 rounded-md w-full" />

                    {/* Butoane de descărcare pentru cheile încărcate */}
                    {cheiePPK && (
                        <button type="button" className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-800 transition mt-2"
                            onClick={() => downloadKeyFile(cheiePPK, `${usernameItem}_id_rsa.ppk`)}>
                            Descarcă PPK
                        </button>
                    )}
                </form>
                <div className="flex justify-center items-center">
                    <button onClick={handleAdaugaItem} className="bg-green-600 w-full h-1/2 md:w-full md:h-2/3 items-center justify-center rounded-lg mt-6 py-1 px-3 hover:bg-yellow-500 text-white transition-all duration-200 mb-4">
                        Adaugă
                    </button>
                </div>
            </div >
        </div >
    );
};

export default PopupNewGrupRemote;