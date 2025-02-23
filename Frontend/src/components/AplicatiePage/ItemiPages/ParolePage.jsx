import React from 'react'
import { useState, useEffect } from 'react';

import ListIcon from "../../../assets/website/list.png"
import GridIcon from "../../../assets/website/visualization.png"
import "../../../App.css"
import GridAfisItems from "./GridAfisItems";
import ListAfisItems from "./ListAfisItems";
import PopupStergeItem from "../Popup_uri/PopupStergeItem";

import EditParolaItem from './EditParolaItem';

import { criptareDate, generateKey, decodeMainKey, decriptareDate } from "../../FunctiiDate/FunctiiDefinite"

function hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}

const ParolePage = ({ accessToken, derivedKey }) => {
    const [key, setKey] = useState(derivedKey);

    useEffect(() => {
        if (derivedKey) {
            setKey(derivedKey);
        }
    }, [derivedKey]);

    console.log("Cheia simetrică este: ", key);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [itemId, setitemId] = useState("");

    const fetchItems = async () => {
        try {
            const savedItems = sessionStorage.getItem('ParolaItmei');
            let savedItemsParsed = savedItems ? JSON.parse(savedItems) : [];

            const response = await fetch('http://localhost:9000/api/utilizator/itemi', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Datele primite de la server: ", data);

                //console.log("Cheia principala: ", key);
                const decriptKey = await decodeMainKey(key);
                //console.log("DecryptKey: ", decriptKey);

                let fetchedItems = [];

                for (let item of data) {
                    try {
                        const id_owner = item.id_owner;
                        const id_item = item.id_item;
                        const isDeleted = item.isdeleted;

                        // Decriptarea cheii
                        const keyfromdata = item.keys_hex;
                        const decodedString = hexToString(keyfromdata);

                        const dataObject = JSON.parse(decodedString);
                        const ivHex = dataObject.encKey.iv;
                        const encDataHex = dataObject.encKey.encData;
                        const tagHex = dataObject.encKey.tag;

                        const dec_key = await decriptareDate(encDataHex, ivHex, tagHex, decriptKey);
                        //console.log("Cheia decriptata pentru item este: ", dec_key);

                        const octetiArray = dec_key.split(',').map(item => parseInt(item.trim(), 10));
                        const uint8Array = new Uint8Array(octetiArray);

                        const importedKey = await window.crypto.subtle.importKey(
                            "raw", uint8Array, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]
                        );

                        // Decriptare continut
                        const continutfromdata = item.continut_hex;
                        //console.log("Continutul primit de la server: ", continutfromdata);

                        const decodedString2 = hexToString(continutfromdata);
                        const dataObject2 = JSON.parse(decodedString2);

                        const { created_at, modified_at, version } = dataObject2.metadata;
                        //console.log("Metadatele obiectului: ", dataObject2);

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
                    } catch (error) {
                        console.error('Eroare la decriptarea item-ului cu ID-ul:', item.id_item, error);
                    }

                }
                //const filteredItems = fetchedItems.filter(item => item.isDeleted === 0);
                setItems(fetchedItems);
            } else {
                console.error('Failed to fetch items', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchItems();
    }, [accessToken]);


    // if (loading) {
    //   return <div>Loading...</div>;
    //}

    const [isDeschisMeniuSortare, setIsDropdownOpen] = useState(false);
    const [OptiuneSelectata, setSelectedOption] = useState("Sortează după: Nume");

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDeschisMeniuSortare);
    };

    const handleOptionSelect = (optiune) => {
        setSelectedOption(optiune);
        setIsDropdownOpen(false);
    };

    const [gestioneazaParolaItem, setGestioneazaParolaItem] = useState(null);
    const [tipAfisare, setTipAfisare] = useState("grid");
    const [stergeItem, setStergeItem] = useState(false);

    const [itemid, setItemid] = useState("");
    return (
        <>
            <div className="bg-gray-100">
                <h2 className="font-bold text-2xl text-center mt-4 ">Parolele mele</h2>
                <div className="flex flex-row aliniere_custom justify-between items-center mx-6 mt-4">
                    {/*Sectiunea de vizualizare a datelor */}
                    <div className="flex space-x-2">
                        <button onClick={() => setTipAfisare("lista")} className="flex items-center px-2 space-x-2 py-2 rounded-lg bg-gray-100 ml-2 hover:bg-yellow-400">
                            <img src={ListIcon} alt="List Icon" className="w-6 h-6"></img>
                        </button>
                        <button onClick={() => setTipAfisare("grid")} className="flex items-center px-2 space-x-2 py-2 rounded-lg bg-gray-100 ml-2 hover:bg-yellow-400">
                            <img src={GridIcon} alt="List Icon" className="w-6 h-6"></img>
                        </button>
                    </div>

                    {/* Secțiunea de sortare */}
                    <div className="relative">
                        {/*Buton de deschidere meniu select*/}
                        <button className="flex items-center px-4 space-x-2 py-2 rounded-lg bg-gray-100 md:mr-2" onClick={() => handleDropdownToggle()}>
                            {/* Model iconita sagetuta al meniului de select*/}
                            <span className="text-1xl font-semibold">{OptiuneSelectata}</span>
                            <svg
                                className={`w-4 h-4 transform transition-transform ${isDeschisMeniuSortare ? 'rotate-180' : 'rotate-0'}`}  /* Pentru rotatie*/
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {isDeschisMeniuSortare && <div className="absolute border rounded-lg bg-white shadow-lg w-full mt-2">
                            <ul className="py-2">
                                <li className="px-4 py-2 cursor-pointer hover:bg-yellow-400" onClick={() => handleOptionSelect("Sortează după: Nume ")}>Nume</li>
                                <li className="px-4 py-2 cursor-pointer hover:bg-yellow-400" onClick={() => handleOptionSelect("Sortează după: Data ")}>Data Adaugarii</li>
                            </ul>
                        </div>
                        }
                    </div>
                </div>

                <hr className="border-t-2 border-gray-500 my-4 rounded-full mx-6" />

                {/* Sectiunea de itemi Parola */}
                {gestioneazaParolaItem === null ? (tipAfisare === "lista" ? (// daca nu e  nicio parola selectata afisez lista de itemi; overflow-y pentru a derula in caz ca se termina ecranul
                    <ListAfisItems items={items} setGestioneazaItem={setGestioneazaParolaItem} setStergeItem={setStergeItem} setItemid={setItemid} />
                ) : tipAfisare === "grid" ? (
                    <GridAfisItems items={items} setGestioneazaItem={setGestioneazaParolaItem} setStergeItem={setStergeItem} setItemid={setItemid} />
                ) : null
                ) : (// daca selectez un item atunci dispare lista de itmei si afisez optiunile pentru itemul curent
                    <EditParolaItem item={gestioneazaParolaItem} setGestioneazaParolaItem={setGestioneazaParolaItem} accessToken={accessToken} />
                )}

                {/*Popup de Stergere item */}
                {stergeItem && <PopupStergeItem setShowPopupStergeItem={setStergeItem} accessToken={accessToken} item={itemid} items={items} fetchItems={fetchItems} />}

            </div >
        </>
    );
};

export default ParolePage;