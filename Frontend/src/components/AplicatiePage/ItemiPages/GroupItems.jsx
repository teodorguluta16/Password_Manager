import React from "react";
import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import "../../../App.css"

import { FaArrowLeft } from 'react-icons/fa';
import { criptareDate, generateKey, decodeMainKey, decriptareDate, exportKey } from "../../FunctiiDate/FunctiiDefinite"
import PopupNewGrupItem from '../Popup_uri/PopupNewGrupItem.jsx'
import PopupNewGrupParola from "../Popup_uri/PopupNewGrupParola.jsx";
import PopupNewGrupNotita from "../Popup_uri/PopupNewGrupNotita.jsx";
import PopupNewGrupCard from "../Popup_uri/PopupNewGrupCard.jsx";
import PopupNewGrupAdresa from "../Popup_uri/PopupNewGrupAdresa.jsx";
import PopupNewGrupRemote from "../Popup_uri/PopupNewGrupRemote.jsx";

import GridAfisGroupItems from "./GridAfisGroupItems";
import forge from 'node-forge';
import EditParolaGroupItem from './EditParolaGroupItem';
import EditAdreseGroupItem from "./EditAdreseGroupItem.jsx";
import EditCardGroupItem from "./EditCardGroupItem.jsx";
import EditNotitaGroupItem from "./EditNotitaGroupItem.jsx";
import EditRemoteGroupItem from "./EditRemoteGroupItem.jsx";


import VizualizareParolaGroupItem from './VizualizareParolaGroupItem.jsx';
import VizualizareAdresaGroupItem from "./VizualizareAdresaGroupItem.jsx";
import VizualizareCardGroupItem from "./VizualizareCardGroupItem.jsx";
import VizualizareNotitaGroupItem from "./VizualizareNotitaGroupItem.jsx";
import VizualizareRemoteGroupItem from "./ViuzalizareRemoteGroupItem.jsx";

function hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}
function decryptWithPrivateKey(encryptedMessage, privateKey) {
    try {
        return privateKey.decrypt(encryptedMessage, 'RSA-OAEP', {
            md: forge.md.sha256.create()
        });
    } catch (error) {
        console.error('Eroare la decriptare:', error);
        throw new Error('Decriptare nereușită');
    }
}
const GroupItmes = ({ item, setGestioneazaGrupItem, derivedKey }) => {

    const [id_current_user, setIdUtilizator] = useState(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await fetch("http://localhost:9000/api/utilizator/getMyId", {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setIdUtilizator(data.Id);
                } else {
                    console.error("Eroare: Nu ești autentificat");
                }
            } catch (error) {
                console.error("Eroare la obținerea idUtilizator:", error);
            }
        };

        fetchUserId();
    }, []);

    let idgrup = item.id_grup;

    const [key, setKey] = useState(derivedKey);
    useEffect(() => {
        if (derivedKey) {
            setKey(derivedKey);
        }
    }, [derivedKey]);

    const [popupVisible, setPopupVisible] = useState(false);
    const openPopup = () => {
        setPopupVisible(true);
    };

    console.log("Cheia simetrica este: ", key);

    //const [shoMeniuCreeazaItem, setMeniuCreeazaItem] = useState(false);
    const [ShowParolaPopup, setShowParolaPopup] = useState(false);
    const [ShowNotitaPopup, setShowNotitaPopup] = useState(false);
    const [ShowCardPopup, setShowCardPopup] = useState(false);
    const [ShowAdresaPopup, setShowAdresaPopup] = useState(false);
    const [ShowRemotePopup, setShowRemotePopup] = useState(false);

    //const [ShowNotitaPopup, setShowNotitaPopup] = useState(false);

    const [isDeschisMeniuSortare, setIsDropdownOpen] = useState(false);
    const [OptiuneSelectata, setSelectedOption] = useState("Sortează după: Nume");
    const [OptiuneSelectata2, setSelectedOption2] = useState("Filtrează după: Toate");
    const [OptiuneSelectata3, setSelectedOption3] = useState("Owner: Toti");
    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDeschisMeniuSortare);
    };

    const [stergeItem, setStergeItem] = useState(false);
    const [gestioneazaItem, setGestioneazaItem] = useState(null);
    const [tipAfisare, setTipAfisare] = useState("grid");

    const [items, setItems] = useState([]);

    const fetchGroupsItems = async () => {
        try {
            const response = await fetch('http://localhost:9000/api/grupuri/getGroupItemi', {
                method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify({ idgrup }), credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);

                //  mai intai extrag cheia privata si o decriptez pentru a decripta cheia aia AES

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
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idgrup }), credentials: "include"
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


                    const decriptKey = await decodeMainKey(decryptedMessage);
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

                            if (rez_tip === "card") {
                                const ivHex3 = dataObject2.data.nume.iv;
                                const encDataHex3 = dataObject2.data.nume.encData;
                                const tagHex3 = dataObject2.data.nume.tag;

                                const rez_nume = await decriptareDate(encDataHex3, ivHex3, tagHex3, importedKey);

                                const ivHex4 = dataObject2.data.numarItem.iv;
                                const encDataHex4 = dataObject2.data.numarItem.encData;
                                const tagHex4 = dataObject2.data.numarItem.tag;

                                const rez_numarCard = await decriptareDate(encDataHex4, ivHex4, tagHex4, importedKey);

                                const ivHex5 = dataObject2.data.numePosesor.iv;
                                const encDataHex5 = dataObject2.data.numePosesor.encData;
                                const tagHex5 = dataObject2.data.numePosesor.tag;

                                const rez_posesorCard = await decriptareDate(encDataHex5, ivHex5, tagHex5, importedKey);

                                const ivHex6 = dataObject2.data.dataExpirare.iv;
                                const encDataHex6 = dataObject2.data.dataExpirare.encData;
                                const tagHex6 = dataObject2.data.dataExpirare.tag;

                                const rez_dataExpirare = await decriptareDate(encDataHex6, ivHex6, tagHex6, importedKey);

                                const ivHex7 = dataObject2.data.comentariu.iv;
                                const encDataHex7 = dataObject2.data.comentariu.encData;
                                const tagHex7 = dataObject2.data.comentariu.tag;
                                const rez_comentariu = await decriptareDate(encDataHex7, ivHex7, tagHex7, importedKey);

                                console.log("Datele primite de la server aferente cardului:", rez_tip, rez_nume, rez_numarCard, rez_posesorCard, rez_comentariu, rez_dataExpirare, isDeleted);

                                fetchedItems.push({
                                    nume: rez_nume,
                                    tipitem: rez_tip,
                                    numarCard: rez_numarCard,
                                    posesorCard: rez_posesorCard,
                                    dataExpirare: rez_dataExpirare,
                                    comentariu: rez_comentariu,
                                    created_at: created_at,
                                    modified_at: modified_at,
                                    version: version,
                                    id_owner: id_owner,
                                    id_item: id_item,
                                    isDeleted: isDeleted,
                                });

                            }
                            if (rez_tip === "adresa") {
                                const ivHex3 = dataObject2.data.nume.iv;
                                const encDataHex3 = dataObject2.data.nume.encData;
                                const tagHex3 = dataObject2.data.nume.tag;

                                const rez_nume = await decriptareDate(encDataHex3, ivHex3, tagHex3, importedKey);

                                const ivHex4 = dataObject2.data.adresa.iv;
                                const encDataHex4 = dataObject2.data.adresa.encData;
                                const tagHex4 = dataObject2.data.adresa.tag;

                                const rez_adresa = await decriptareDate(encDataHex4, ivHex4, tagHex4, importedKey);

                                const ivHex5 = dataObject2.data.oras.iv;
                                const encDataHex5 = dataObject2.data.oras.encData;
                                const tagHex5 = dataObject2.data.oras.tag;

                                const rez_oras = await decriptareDate(encDataHex5, ivHex5, tagHex5, importedKey);

                                const ivHex6 = dataObject2.data.judet.iv;
                                const encDataHex6 = dataObject2.data.judet.encData;
                                const tagHex6 = dataObject2.data.judet.tag;

                                const rez_jduet = await decriptareDate(encDataHex6, ivHex6, tagHex6, importedKey);

                                const ivHex7 = dataObject2.data.codPostal.iv;
                                const encDataHex7 = dataObject2.data.codPostal.encData;
                                const tagHex7 = dataObject2.data.codPostal.tag;

                                const rez_codPostal = await decriptareDate(encDataHex7, ivHex7, tagHex7, importedKey);

                                const ivHex8 = dataObject2.data.comentariu.iv;
                                const encDataHex8 = dataObject2.data.comentariu.encData;
                                const tagHex8 = dataObject2.data.comentariu.tag;
                                const rez_comentariu = await decriptareDate(encDataHex8, ivHex8, tagHex8, importedKey);

                                console.log("Datele primite de la server aferente adresei:", rez_tip, rez_nume, rez_adresa, rez_oras, rez_jduet, rez_codPostal, rez_comentariu, isDeleted);

                                fetchedItems.push({
                                    nume: rez_nume,
                                    tipitem: rez_tip,
                                    adresa: rez_adresa,
                                    oras: rez_oras,
                                    judet: rez_jduet,
                                    codPostal: rez_codPostal,
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

                    // Filtrăm itemii pentru a exclude cei care au `isDeleted === 1`
                    const filteredItems = fetchedItems.filter(item => item.isDeleted === 0);
                    setItems(filteredItems);
                } catch (error) {
                    console.error("Eroare la decriptare:", error.message);
                }

            }
        } catch (error) {
            console.error('Eroare la cererea itemilor:', error);
        }
    };

    useEffect(() => {
        fetchGroupsItems();
    }, []);


    const [gestioneazaParolaItem, setGestioneazaParolaItem] = useState(null);
    return (
        <>
            <div className=" py-4 px-6 mb-2">
                {gestioneazaItem === null && (
                    <>
                        <div className="flex flex-row">
                            <button onClick={() => setGestioneazaGrupItem(null)} className="px-1 cursor-pointer rounded-lg -ml-4  mt-2 mr-2">
                                <FaArrowLeft className="w-8 h-8 hover:text-blue-600 transition-all duration-300 ease-in-out" />
                            </button>
                            {/* Butonul pentru deschiderea popup-ului */}
                            <button
                                onClick={openPopup}
                                className="flex flex-row px-2 py-2 bg-purple-500 text-white rounded-lg hover:bg-yellow-700 transition-all duration-300 mt-2 ml-4"
                            >
                                <FaPlus className="w-6 h-6 mr-2 mt-1" />
                                <span className="text-xl font-semibold">Item Nou</span>
                            </button>
                        </div>
                        <h2 className="text-center text-3xl font-bold  text-gray-700 mt-6 md:-mt-12">{item.nume}</h2>
                        <div className="flex sm:flex-row mt-3 sm:ml-0 -ml-10">
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
                                {isDeschisMeniuSortare && <div className="absolute border rounded-lg bg-white shadow-lg w-full mt-2 ">
                                    <ul className="py-2">
                                        <li className="px-4 py-2 cursor-pointer hover:bg-yellow-400" onClick={() => handleOptionSelect("Sortează după: Nume ")}>Nume</li>
                                        <li className="px-4 py-2 cursor-pointer hover:bg-yellow-400" onClick={() => handleOptionSelect("Sortează după: Data ")}>Data Adaugarii</li>
                                    </ul>
                                </div>
                                }
                            </div>
                            {/* Secțiunea de sortare */}
                            <div className="relative">

                                {/*Buton de deschidere meniu select*/}
                                <button className="flex items-center px-4 space-x-2 py-2 rounded-lg bg-gray-100 md:mr-2" onClick={() => handleDropdownToggle()}>
                                    {/* Model iconita sagetuta al meniului de select*/}
                                    <span className="text-1xl font-semibold">{OptiuneSelectata2}</span>
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
                                        <li className="px-4 py-2 cursor-pointer hover:bg-yellow-400" onClick={() => handleOptionSelect("Filtreaza după: Toate")}>Toate</li>
                                        <li className="px-4 py-2 cursor-pointer hover:bg-yellow-400" onClick={() => handleOptionSelect("Filtreaza după: Parola ")}>Parola</li>
                                        <li className="px-4 py-2 cursor-pointer hover:bg-yellow-400" onClick={() => handleOptionSelect("Filtreaza după: Notita ")}>Notita</li>
                                        <li className="px-4 py-2 cursor-pointer hover:bg-yellow-400" onClick={() => handleOptionSelect("Filtreaza după: Card Bancar ")}>Card Bancar</li>
                                    </ul>
                                </div>
                                }
                            </div>
                            {/* Secțiunea de sortare */}
                            <div className="relative">

                                {/*Buton de deschidere meniu select*/}
                                <button className="flex items-center px-4 space-x-2 py-2 rounded-lg bg-gray-100 md:mr-2" onClick={() => handleDropdownToggle()}>
                                    {/* Model iconita sagetuta al meniului de select*/}
                                    <span className="text-1xl font-semibold">{OptiuneSelectata3}</span>
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
                                {isDeschisMeniuSortare && <div className="absolute border rounded-lg bg-white shadow-lg w-[200px] mt-2 overflow-hidden">

                                    <ul className="py-2 px-4">
                                        <li className="px-4 py-2 cursor-pointer hover:bg-yellow-400 text-sm sm:text-md truncate" onClick={() => handleOptionSelect("Owner: Toti")}>Toti</li>
                                        <li className="px-4 py-2 cursor-pointer hover:bg-yellow-400 text-sm sm:text-md truncate" onClick={() => handleOptionSelect("Owner: ionescu ionescu ")}>ionescu ionescu</li>
                                        <li className="px-4 py-2 cursor-pointer hover:bg-yellow-400 text-sm sm:text-md truncate" onClick={() => handleOptionSelect("Owner: popescu popescu ")}>popescu popescu</li>
                                    </ul>
                                </div>
                                }
                            </div>


                        </div>
                        <hr className="border-t-2 border-gray-500 my-4 rounded-full -mx-4 sm:mx-2" />
                    </>
                )
                }

                {/* Sectiunea de itemi */}
                {gestioneazaItem === null ? (tipAfisare === "lista" ? (// daca nu e  nicio parola selectata afisez lista de itemi; overflow-y pentru a derula in caz ca se termina ecranul
                    <div>
                        {/*Ok1 */}
                    </div>
                ) : tipAfisare === "grid" ? ( // daca nu e  niciun item selectat atunci afisez lista de itemi
                    <GridAfisGroupItems items={items} setGestioneazaItem={setGestioneazaItem} setStergeItem={setStergeItem} />) : null

                ) : (
                    id_current_user === gestioneazaItem.id_owner ? (

                        <>
                            {gestioneazaItem.tipitem === "password" && (
                                <EditParolaGroupItem item={gestioneazaItem} setGestioneazaParolaItem={setGestioneazaItem} />
                            )}
                            {gestioneazaItem.tipitem === "remoteConnexion" && (
                                <EditRemoteGroupItem item={gestioneazaItem} setGestioneazaRemoteItem={setGestioneazaItem} />
                            )}
                            {gestioneazaItem.tipitem === "notita" && (
                                <EditNotitaGroupItem item={gestioneazaItem} setGestioneazaParolaItem={setGestioneazaItem} />
                            )}
                            {gestioneazaItem.tipitem === "card" && (
                                <EditCardGroupItem item={gestioneazaItem} setGestioneazaCardItem={setGestioneazaItem} />
                            )}
                            {gestioneazaItem.tipitem === "adresa" && (
                                <EditAdreseGroupItem item={gestioneazaItem} setGestioneazaAdresaItem={setGestioneazaItem} />
                            )}
                        </>
                    ) : (

                        <>
                            {gestioneazaItem.tipitem === "password" && (
                                <VizualizareParolaGroupItem item={gestioneazaItem} setGestioneazaParolaItem={setGestioneazaItem} />
                            )}
                            {gestioneazaItem.tipitem === "remoteConnexion" && (
                                <VizualizareRemoteGroupItem item={gestioneazaItem} setGestioneazaRemoteItem={setGestioneazaItem} />
                            )}
                            {gestioneazaItem.tipitem === "notita" && (
                                <VizualizareNotitaGroupItem item={gestioneazaItem} setGestioneazaParolaItem={setGestioneazaItem} />
                            )}
                            {gestioneazaItem.tipitem === "card" && (
                                <VizualizareCardGroupItem item={gestioneazaItem} setGestioneazaCardItem={setGestioneazaItem} />
                            )}
                            {gestioneazaItem.tipitem === "adresa" && (
                                <VizualizareAdresaGroupItem item={gestioneazaItem} setGestioneazaAdresaItem={setGestioneazaItem} />
                            )}
                        </>
                    )
                )}

                {/* Popup-ul care apare când este apăsat butonul */}
                {popupVisible && (<PopupNewGrupItem setPopupVisible={setPopupVisible} setShowParolaPopup={setShowParolaPopup} setShowNotitaPopup={setShowNotitaPopup}
                    setShowCardPopup={setShowCardPopup} setShowAdresaPopup={setShowAdresaPopup} setShowRemotePopup={setShowRemotePopup} />)}
                {ShowParolaPopup && (<PopupNewGrupParola setShowParolaPopup={setShowParolaPopup} derivedKey={key} idgrup={idgrup} />)}
                {ShowNotitaPopup && (<PopupNewGrupNotita setShowNotitaPopup={setShowNotitaPopup} derivedKey={key} idgrup={idgrup} />)}
                {ShowCardPopup && (<PopupNewGrupCard setShowCardPopup={setShowCardPopup} derivedKey={key} idgrup={idgrup} />)}
                {ShowAdresaPopup && (<PopupNewGrupAdresa setShowAdresaPopup={setShowAdresaPopup} derivedKey={key} idgrup={idgrup} />)}
                {ShowRemotePopup && (<PopupNewGrupRemote setShowRemotePopup={setShowRemotePopup} derivedKey={key} idgrup={idgrup} />)}

            </div>
        </>
    );
};

export default GroupItmes;