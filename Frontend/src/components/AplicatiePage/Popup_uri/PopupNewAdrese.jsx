import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import { criptareDate, generateKey, decodeMainKey, decriptareDate, exportKey } from "../../FunctiiDate/FunctiiDefinite"

const PopupNewAdrese = ({ setShowAddressPopup, derivedKey, fetchItems }) => {
    const [key, setKey] = useState(derivedKey);

    const [numeDestinatar, setNumeDestinatar] = useState("");
    const [adresa, setAdresa] = useState("");
    const [oras, setOras] = useState("");
    const [codPostal, setCodPostal] = useState("");
    const [judet, setJudet] = useState("");
    const [comentariuAdresa, setComentariuAdresa] = useState("");

    useEffect(() => {
        if (derivedKey) {
            setKey(derivedKey);
        }
    }, [derivedKey]);

    const handleAdaugaItem = async () => {
        try {
            if (!numeDestinatar || !adresa || oras || judet || codPostal) {
                alert("Completează câmpurile !");
                return;
            }
            setShowAddressPopup(false);

            const key_aes = await generateKey();

            // criptare elemente
            const enc_Tip = await criptareDate("adresa", key_aes);
            const enc_NumeItem = await criptareDate(numeDestinatar, key_aes);
            const enc_AdnresaItem = await criptareDate(adresa, key_aes);
            const enc_OrasItem = await criptareDate(oras, key_aes);
            const enc_JudetItem = await criptareDate(judet, key_aes);
            const enc_CodPostalItem = await criptareDate(codPostal, key_aes);
            const enc_ComentariuItem = await criptareDate(comentariuAdresa || "N/A", key_aes);

            // criptare cheie
            const criptKey = await decodeMainKey(key);

            const key_aes_raw = await exportKey(key_aes);
            const enc_key_raw = await criptareDate(key_aes_raw, criptKey);

            // 3. Decriptarea cheii AES criptate folosind cheia AES decriptată
            const dec_key = await decriptareDate(enc_key_raw.encData, enc_key_raw.iv, enc_key_raw.tag, criptKey);  // obții cheia AES decriptată

            const octetiArray = dec_key.split(',').map(item => parseInt(item.trim(), 10));

            // Creăm un Uint8Array din array-ul de numere
            const uint8Array = new Uint8Array(octetiArray);

            const jsonItemKey = {
                data: {
                    encKey: { iv: enc_key_raw.iv, encData: enc_key_raw.encData, tag: enc_key_raw.tag },
                },
            };

            const jsonItem = {
                metadata: { created_at: new Date().toISOString(), modified_at: new Date().toISOString(), version: 1 },
                data: {
                    tip: { iv: enc_Tip.iv, encData: enc_Tip.encData, tag: enc_Tip.tag, },
                    nume: { iv: enc_NumeItem.iv, encData: enc_NumeItem.encData, tag: enc_NumeItem.tag },
                    adresa: { iv: enc_AdnresaItem.iv, encData: enc_AdnresaItem.encData, tag: enc_AdnresaItem.tag },
                    oras: { iv: enc_OrasItem.iv, encData: enc_OrasItem.encData, tag: enc_OrasItem.tag },
                    judet: { iv: enc_JudetItem.iv, encData: enc_JudetItem.encData, tag: enc_JudetItem.tag },
                    codPostal: { iv: enc_CodPostalItem.iv, encData: enc_CodPostalItem.encData, tag: enc_CodPostalItem.tag },
                    comentariu: { iv: enc_ComentariuItem.iv, encData: enc_ComentariuItem.encData, tag: enc_ComentariuItem.tag }
                },
            };

            try {
                const response = await fetch('http://localhost:9000/api/addItem', { method: "POST", headers: { 'Content-Type': 'application/json', }, body: JSON.stringify(jsonItem), credentials: "include" });

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
                    <button className="absolute right-4 top-2 text-4xl cursor-pointer hover:text-red-300" onClick={() => setShowAddressPopup(false)}>&times;</button>
                    <h3 className="text-xl font-semibold text-center mb-6 relative">Adaugă Adresă</h3>
                    <form className="flex flex-col items-left w-full h-screen gap-2 flex-grow overflow-y-auto">

                        <label className="text-sm md:text-md font-medium">Nume Adresă</label>
                        <input type="text" value={numeDestinatar} onChange={(e) => setNumeDestinatar(e.target.value)} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full" placeholder="Ex: Ion Popescu" />

                        <label className="text-sm md:text-md font-medium">Adresă</label>
                        <input type="text" value={adresa} onChange={(e) => setAdresa(e.target.value)} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full" placeholder="Strada, număr, bloc, apartament" />

                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-1/2">
                                <label className="text-sm md:text-md font-medium">Județ</label>
                                <input type="text" value={judet} onChange={(e) => setJudet(e.target.value)} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full" placeholder="ex:Ilfov" />
                            </div>
                            <div className="w-1/2">
                                <label className="text-sm md:text-md font-medium">Oraș</label>
                                <input type="text" value={oras} onChange={(e) => setOras(e.target.value)} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full" placeholder="ex:Bucuresti" />
                            </div>

                        </div>
                        <div className="w-full">
                            <label className="text-sm md:text-md font-medium">Cod Poștal</label>
                            <input type="text" value={codPostal} onChange={(e) => setCodPostal(e.target.value)} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full" placeholder="Cod Poștal" maxLength="10" />
                        </div>

                        <label className="text-sm md:text-md font-medium">Adaugă un comentariu</label>
                        <textarea value={comentariuAdresa} onChange={(e) => setComentariuAdresa(e.target.value)} className="border mt-2 py-1 px-2 border-gray-600 rounded-md w-full min-h-32 resize-none" placeholder="Note opționale"></textarea>
                    </form>

                    <div className="flex justify-center items-center w-full">
                        <button onClick={handleAdaugaItem} className="bg-green-600 w-full py-2 px-4 rounded-lg mt-4 hover:bg-yellow-500 text-white transition-all duration-200 mb-4">
                            Adaugă Adresă
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PopupNewAdrese;