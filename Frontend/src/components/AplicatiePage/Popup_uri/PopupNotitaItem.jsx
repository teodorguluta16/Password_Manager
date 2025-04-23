import React from "react";
import { useState, useEffect } from "react";
import { criptareDate, generateKey, decodeMainKey, decriptareDate, exportKey } from "../../FunctiiDate/FunctiiDefinite"

const PopupNotitaItem = ({ setShowNotitaPopup, derivedKey, fetchItems }) => {

    const [key, setKey] = useState(derivedKey);
    useEffect(() => {
        if (derivedKey) {
            setKey(derivedKey);
            console.log("Cheia setată:", derivedKey);
        }
    }, [derivedKey]);

    const [numeItem, setNumeItem] = useState('');
    const [date, setDateItem] = useState('');
    const [comentariuItem, setComentariuItem] = useState('');

    const handleAdaugaItem = async () => {
        try {
            if (!numeItem || !date) {
                alert("Completează câmpurile !");
                return;
            }
            setShowNotitaPopup(false);

            const key_aes = await generateKey();

            // criptare elemente
            const enc_Tip = await criptareDate("notita", key_aes);
            const enc_NumeItem = await criptareDate(numeItem, key_aes);
            const enc_datalItem = await criptareDate(date, key_aes);
            const enc_ComentariuItem = await criptareDate(comentariuItem || "N/A", key_aes);

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
                    created_at: new Date().toISOString(), modified_at: new Date().toISOString(), version: 1
                },
                data: {
                    tip: { iv: enc_Tip.iv, encData: enc_Tip.encData, tag: enc_Tip.tag, },
                    nume: { iv: enc_NumeItem.iv, encData: enc_NumeItem.encData, tag: enc_NumeItem.tag },
                    data: { iv: enc_datalItem.iv, encData: enc_datalItem.encData, tag: enc_datalItem.tag },
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

export default PopupNotitaItem;