import React from 'react'
import { useState, useEffect } from 'react';


import "../../../App.css"
import GridAfisItems from "./GridAfisItems";
import { criptareDate, generateKey, decodeMainKey, decriptareDate } from "../../FunctiiDate/FunctiiDefinite"
import { useKeySimetrica } from '../../FunctiiDate/ContextKeySimetrice'


function hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}

const ItemiStersi = ({ accessToken }) => {
    const { key } = useKeySimetrica(); // trebuie sa o salvez in session storage neaparatd
    console.log("Cheia simetrică este: ", key);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [itemId, setitemId] = useState("");

    useEffect(() => {
        console.log("tokenul:", accessToken);
        const fetchItems = async () => {
            try {
                const savedItems = sessionStorage.getItem('ItemiEliminati');
                if (savedItems) {
                    setItems(JSON.parse(savedItems));
                    setLoading(false);
                    return;
                }
                const response = await fetch('http://localhost:9000/api/itemi', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Datele primite de la server: ", data);

                    const decriptKey = await decodeMainKey(key);
                    let fetchedItems = [];

                    for (let item of data) {
                        const id_owner = item.id_owner;
                        const id_item = item.id_item;
                        const isDeleted = item.isdeleted;

                        // Decriptarea cheii
                        const keyfromdata = item.keys_hex;
                        const decodedString = hexToString(keyfromdata);

                        const dataObject = JSON.parse(decodedString);

                        const ivHex = dataObject.data.encKey.iv;
                        const encDataHex = dataObject.data.encKey.encData;
                        const tagHex = dataObject.data.encKey.tag;

                        const dec_key = await decriptareDate(encDataHex, ivHex, tagHex, decriptKey);

                        const octetiArray = dec_key.split(',').map(item => parseInt(item.trim(), 10));
                        const uint8Array = new Uint8Array(octetiArray);

                        const importedKey = await window.crypto.subtle.importKey(
                            "raw", uint8Array, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]
                        );

                        // Decriptare continut
                        const continutfromdata = item.continut_hex;
                        console.log("Continutul primit de la server: ", continutfromdata);

                        const decodedString2 = hexToString(continutfromdata);
                        const dataObject2 = JSON.parse(decodedString2);

                        const { created_at, modified_at, version } = dataObject2.metadata;

                        const ivHex2 = dataObject2.data.tip.iv;
                        const encDataHex2 = dataObject2.data.tip.encData;
                        const tagHex2 = dataObject2.data.tip.tag;

                        const rez_tip = await decriptareDate(encDataHex2, ivHex2, tagHex2, importedKey);

                        const ivHex3 = dataObject2.data.nume.iv;
                        const encDataHex3 = dataObject2.data.nume.encData;
                        const tagHex3 = dataObject2.data.nume.tag;

                        const rez_nume = await decriptareDate(encDataHex3, ivHex3, tagHex3, importedKey);

                        const ivHex4 = dataObject2.data.username.iv;
                        const encDataHex4 = dataObject2.data.username.encData;
                        const tagHex4 = dataObject2.data.username.tag;

                        const rez_username = await decriptareDate(encDataHex4, ivHex4, tagHex4, importedKey);

                        const ivHex5 = dataObject2.data.parola.iv;
                        const encDataHex5 = dataObject2.data.parola.encData;
                        const tagHex5 = dataObject2.data.parola.tag;
                        const rez_parola = await decriptareDate(encDataHex5, ivHex5, tagHex5, importedKey);

                        const ivHex6 = dataObject2.data.url.iv;
                        const encDataHex6 = dataObject2.data.url.encData;
                        const tagHex6 = dataObject2.data.url.tag;
                        const rez_url = await decriptareDate(encDataHex6, ivHex6, tagHex6, importedKey);

                        const ivHex7 = dataObject2.data.comentariu.iv;
                        const encDataHex7 = dataObject2.data.comentariu.encData;
                        const tagHex7 = dataObject2.data.comentariu.tag;
                        const rez_comentariu = await decriptareDate(encDataHex7, ivHex7, tagHex7, importedKey);

                        console.log("Datele primite de la server aferente parolei: ", rez_tip, rez_nume, rez_url, rez_username, rez_parola, rez_comentariu, isDeleted);

                        // Adăugăm itemul decriptat în vectorul ParolaItemi
                        fetchedItems.push({
                            nume: rez_nume,
                            tipitem: rez_tip,
                            username: rez_username,
                            parola: rez_parola,
                            url: rez_url,
                            comentariu: rez_comentariu,
                            created_at: created_at,
                            modified_at: modified_at,
                            version: version,
                            id_owner: id_owner,
                            id_item: id_item,
                            isDeleted: isDeleted
                        });

                        const filteredItems = fetchedItems.filter(itemm => itemm.isDeleted === 1);
                        sessionStorage.setItem('ItemiEliminati', JSON.stringify(filteredItems));
                        setItems(filteredItems);
                    }
                } else {
                    console.error('Failed to fetch items', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching items:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [accessToken]);


    const [gestioneazaParolaItem, setGestioneazaParolaItem] = useState(null);

    const [itemid, setItemid] = useState("");
    return (
        <>
            <div className="bg-gray-100">
                <h2 className="font-bold text-2xl text-center mt-4 ">Itemi ELIMINATI</h2>
                <div className="flex flex-row aliniere_custom justify-between items-center mx-6 mt-4">

                </div>

                <hr className="border-t-4 border-gray-500 my-4 rounded-full mx-12" />

                {/* Sectiunea de itmei Parola */}
                {gestioneazaParolaItem === null ? <GridAfisItems items={items} setGestioneazaItem={setGestioneazaParolaItem} setStergeItem={null} setItemid={setItemid} />
                    : null
                }


            </div >
        </>
    );
};

export default ItemiStersi;