import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import forge from "node-forge";
import { criptareDate, generateKey, decodeMainKey, decriptareDate, exportKey } from "../../FunctiiDate/FunctiiDefinite"

const PopupNewPuttyConnection = ({ setPopupNewRemote, derivedKey, fetchItems }) => {
    const [key, setKey] = useState(derivedKey);
    const [numeItem, setNumeItem] = useState('');
    const [hostItem, setHostItem] = useState('');
    const [usernameItem, setUserNamItem] = useState('');
    const [parolaItem, setParolaItem] = useState('');
    const [cheiePrivata, setCheiePrivata] = useState('');
    const [cheiePublica, setCheiePublica] = useState('');
    const [cheiePPK, setCheiePPK] = useState('');
    const [ppkFile, setPpkFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // ✅ Funcție pentru generarea cheilor SSH
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

        console.log("✅ Cheie generată!");
    };

    // ✅ Funcție pentru descărcarea fișierelor `.pem`, `.ppk`, și `.pub`
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
                console.log("✅ Cheie PPK încărcată");
            } else {
                alert("⚠️ Format neacceptat! ");
            }
        };

        reader.readAsText(file);
    };

    const handleAdaugaItem = async () => {
        console.log("Itemii ce vor fi criptati: ", numeItem, hostItem, usernameItem);
        console.log("cheia ppk trimisa va fi: ", cheiePPK);

        try {
            setPopupNewRemote(false);

            const key_aes = await generateKey();

            // criptare elemente
            const enc_Tip = await criptareDate("remoteConnexion", key_aes);
            const enc_NumeItem = await criptareDate(numeItem, key_aes);
            const enc_Hostitem = await criptareDate(hostItem, key_aes);
            const enc_UsernameItem = await criptareDate(usernameItem, key_aes);
            const enc_ParolaItem = await criptareDate(parolaItem, key_aes);
            const enc_PPKkey = await criptareDate(cheiePPK, key_aes);

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

            const importedKey = await window.crypto.subtle.importKey(
                "raw",               // Importăm cheia în format brut
                uint8Array,          // Cheia de tip Uint8Array
                { name: "AES-GCM" },  // Algoritmul de criptare
                false,               // Nu este necesar să exportăm cheia
                ["encrypt", "decrypt"]  // Permisiunile cheii
            );

            const dec_tip = await decriptareDate(enc_Tip.encData, enc_Tip.iv, enc_Tip.tag, importedKey);

            //const decoded_key = await decodeMainKey(dec_key);

            console.log("Elementul decriptat ar trebui sa fie: ", dec_tip);

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
                    tip: { iv: enc_Tip.iv, encData: enc_Tip.encData, tag: enc_Tip.tag },
                    nume: { iv: enc_NumeItem.iv, encData: enc_NumeItem.encData, tag: enc_NumeItem.tag },
                    host: { iv: enc_Hostitem.iv, encData: enc_Hostitem.encData, tag: enc_Hostitem.tag },
                    username: { iv: enc_UsernameItem.iv, encData: enc_UsernameItem.encData, tag: enc_UsernameItem.tag },
                    parola: { iv: enc_ParolaItem.iv, encData: enc_ParolaItem.encData, tag: enc_ParolaItem.tag },
                    ppkKey: { iv: enc_PPKkey.iv, encData: enc_PPKkey.encData, tag: enc_PPKkey.tag }
                }
            };

            try {
                const response = await fetch('http://localhost:9000/api/addItem', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jsonItem),
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


        } catch (error) {
            console.error("Eroare la criptarea datelor:", error);
        }
        await fetchItems();
    }

    return (
        <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-4/5 md:w-1/2 h-6/7 md:h-6/7 p-6 flex flex-col items-center justify-center relative">
                <button className="absolute right-4 top-2 text-4xl cursor-pointer hover:text-red-300"
                    onClick={() => setPopupNewRemote(false)}>&times;</button>
                <h3 className="text-xl font-semibold text-center mb-6 relative">Conexiune Nouă</h3>

                <form className="flex flex-col w-full gap-2">
                    <div>
                        <label className="text-sm md:text-md font-medium">Nume Platforma</label>
                        <input type="text" value={numeItem} onChange={(e) => setNumeItem(e.target.value)}
                            className="border py-1 px-2 border-gray-600 rounded-md w-full mt-2" />

                    </div>
                    <label className="text-sm md:text-md font-medium">Host/IP</label>
                    <input type="text" value={hostItem} onChange={(e) => setHostItem(e.target.value)}
                        className="border py-1 px-2 border-gray-600 rounded-md w-full" />

                    <div className="flex flex-row gap-2 ">
                        <div>
                            <label className="text-sm md:text-md font-medium">Username</label>
                            <input type="text" value={usernameItem} onChange={(e) => setUserNamItem(e.target.value)}
                                className="border py-1 px-2 border-gray-600 rounded-md w-5/6 mt-2" />
                        </div>
                        <div>
                            <label className="text-sm md:text-md font-medium">Parola</label>
                            <input type="password" value={parolaItem} onChange={(e) => { setParolaItem(e.target.value) }}
                                className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full"></input>

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
                    <input
                        type="file"
                        accept=".ppk"
                        onChange={handleKeyUpload}
                        className="border py-1 px-2 border-gray-600 rounded-md w-full"
                    />

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

export default PopupNewPuttyConnection;
