import React from 'react'
import { useState, useEffect } from 'react';
import "../../../App.css"
import { decodeMainKey, decriptareDate } from "../../FunctiiDate/FunctiiDefinite"
import PeopleLogo from "../../../assets/website/people.png";
import ParolaLogo from "../../../assets/website/password2.png";
import CardLogo from "../../../assets/website/credit-card2.png";
import NoteLogo from "../../../assets/website/note2.png";
import RemoteLogo from "../../../assets/website/remote-access.png"
import { FaHistory, FaTrash } from 'react-icons/fa';
import PopupStergeItemDefinitiv from '../Popup_uri/PopupStergeItemDefinitiv';
import PopupItmeRestauratCuSucces from '../Popup_uri/PopupItemRestauratCuSucces';

function hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}
const ItemiStersi = ({ derivedKey }) => {
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
            const response = await fetch('http://localhost:9000/api/utilizator/itemiStersi', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Datele primite de la server: ", data);

                const decriptKey = await decodeMainKey(key);
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

                        const decodedString2 = hexToString(continutfromdata);
                        const dataObject2 = JSON.parse(decodedString2);

                        const { created_at, modified_at, version } = dataObject2.metadata;

                        const ivHex2 = dataObject2.data.tip.iv;
                        const encDataHex2 = dataObject2.data.tip.encData;
                        const tagHex2 = dataObject2.data.tip.tag;
                        const rez_tip = await decriptareDate(encDataHex2, ivHex2, tagHex2, importedKey);

                        if (rez_tip === "password") {
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

                            console.log("Datele primite de la server aferente parolei:", rez_tip, rez_nume, rez_url, rez_username, rez_parola, rez_comentariu, isDeleted);
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
                                isDeleted: isDeleted,
                            });


                        }
                        if (rez_tip === "remoteConnexion") {
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

                            const ivHex6 = dataObject2.data.host.iv;
                            const encDataHex6 = dataObject2.data.host.encData;
                            const tagHex6 = dataObject2.data.host.tag;
                            const rez_host = await decriptareDate(encDataHex6, ivHex6, tagHex6, importedKey);

                            const ivHex7 = dataObject2.data.ppkKey.iv;
                            const encDataHex7 = dataObject2.data.ppkKey.encData;
                            const tagHex7 = dataObject2.data.ppkKey.tag;
                            const rez_ppkKey = await decriptareDate(encDataHex7, ivHex7, tagHex7, importedKey);

                            fetchedItems.push({
                                nume: rez_nume,
                                tipitem: rez_tip,
                                username: rez_username,
                                parola: rez_parola,
                                host: rez_host,
                                ppkKey: rez_ppkKey,
                                created_at: created_at,
                                modified_at: modified_at,
                                version: version,
                                id_owner: id_owner,
                                id_item: id_item,
                                isDeleted: isDeleted,
                            });
                        }
                        if (rez_tip === "notita") {
                            const ivHex3 = dataObject2.data.nume.iv;
                            const encDataHex3 = dataObject2.data.nume.encData;
                            const tagHex3 = dataObject2.data.nume.tag;

                            const rez_nume = await decriptareDate(encDataHex3, ivHex3, tagHex3, importedKey);


                            const ivHex4 = dataObject2.data.data.iv;
                            const encDataHex4 = dataObject2.data.data.encData;
                            const tagHex4 = dataObject2.data.data.tag;

                            const rez_data = await decriptareDate(encDataHex4, ivHex4, tagHex4, importedKey);

                            const ivHex7 = dataObject2.data.comentariu.iv;
                            const encDataHex7 = dataObject2.data.comentariu.encData;
                            const tagHex7 = dataObject2.data.comentariu.tag;
                            const rez_comentariu = await decriptareDate(encDataHex7, ivHex7, tagHex7, importedKey);

                            console.log("Datele primite de la server aferente parolei:", rez_tip, rez_nume, rez_data, rez_comentariu, isDeleted);

                            fetchedItems.push({
                                nume: rez_nume,
                                tipitem: rez_tip,
                                data: rez_data,
                                comentariu: rez_comentariu,
                                created_at: created_at,
                                modified_at: modified_at,
                                version: version,
                                id_owner: id_owner,
                                id_item: id_item,
                                isDeleted: isDeleted,
                            });
                        }
                    } catch (error) {
                        console.error('Eroare la decriptarea item-ului cu ID-ul:', item.id_item, error);
                    }

                }
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
    }, []);



    const [gestioneazaParolaItem, setGestioneazaParolaItem] = useState(null);
    const [stergeItem, setStergeItem] = useState(false);
    const [itemid, setItemid] = useState("");
    const [restoredItemMessage, setRestoredItemMessage] = useState(false);

    const restoreItem = async (iditem) => {
        try {
            console.log("Id Item este:", iditem);
            const response = await fetch('http://localhost:9000/api/utilizator/itemiStersi/restore', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_item: iditem }),
                credentials: "include"
            });

            if (response.ok) {
                await fetchItems();
                setRestoredItemMessage(true);
                setTimeout(() => {
                    setRestoredItemMessage(false);
                }, 2000); // 2000ms = 2 secunde
            }
        } catch (error) {
            console.error('Eroare:', error);
            setRestoredItemMessage(false);
        }
    };

    return (
        <>
            <div className="bg-gray-100">
                <h2 className="font-bold text-2xl text-center mt-4 ">Eliminate</h2>
                <div className="flex flex-row aliniere_custom justify-between items-center mx-6 mt-4">

                </div>

                <hr className="border-t-2 border-gray-500 my-4 rounded-full mx-6" />

                {/* Itemii ce urmeaza sa fie stersi */}
                {
                    gestioneazaParolaItem === null ? <div className="space-y-1  mx-8 w-4/7 sm:w-6/7">
                        {items.map((item, index) => (
                            <div key={index} className="border border-white-700 border-b-2 rounded-lg shadow-lg bg-white px-2 flex justify-between items-center hover:bg-gray-200 transition-all duration-300 ease-in-out">
                                <div className="flex items-center space-x-4">
                                    <img src={item.tipitem === 'password' ? ParolaLogo : item.tipitem === 'notita' ? NoteLogo : item.tipitem === 'card' ? CardLogo : item.tipitem === "remoteConnexion" ? RemoteLogo : PeopleLogo} alt="Logo Parola Item" className="w-8 h-8"></img>
                                    <div>
                                        <h2 className="font-semibold">{item.nume}</h2>
                                        <h3 className="text-sm text-gray-500">Data stergerii: 12.11.2023</h3>
                                    </div>
                                </div>

                                <div className="flex space-x-4">
                                    <button onClick={(e) => { e.stopPropagation(); setStergeItem(true); setItemid(item) }} className="p-2 bg-white-200 border border-red-200 rounded-lg hover:bg-red-400">
                                        <FaTrash alt="Delete Logo" className="w-5 h-5" />
                                    </button>

                                    {/* Butonul pentru restaurare */}
                                    <button onClick={(e) => { e.stopPropagation(); restoreItem(item.id_item); }} className="flex flex-row p-2 bg-blue-200 border rounded-lg hover:bg-blue-500">
                                        <FaHistory alt="Restore Icon" className="w-5 h-5" />
                                        <span className='ml-1 customRestoreButtonText'>Restaurează</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                        : null
                }
                {stergeItem && <PopupStergeItemDefinitiv setShowPopupStergeItem={setStergeItem} item={itemid} items={items} fetchItems={fetchItems} />}
                {restoredItemMessage && <PopupItmeRestauratCuSucces />}
            </div >
        </>
    );
};

export default ItemiStersi;