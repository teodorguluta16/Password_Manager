import React from "react";
import { useState, useEffect } from 'react';
import ArrowBack from "../../../assets/website/back.png"
import "../../../App.css"

import { FaEye, FaEyeSlash, FaEdit, FaSave, FaArrowLeft } from 'react-icons/fa';
import { criptareDate } from "../../FunctiiDate/FunctiiDefinite";

const importRawKeyFromBase64 = async (base64Key) => {
    const binary = atob(base64Key); // decode base64
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return await window.crypto.subtle.importKey(
        "raw",
        bytes,
        "HKDF",
        false,
        ["deriveKey"]
    );
};



const deriveHMACKey = async (derivedKey) => {
    return crypto.subtle.deriveKey(
        {
            name: "HKDF",
            hash: "SHA-256",
            salt: new TextEncoder().encode("semnatura-parola"),
            info: new TextEncoder().encode("hmac-signing")
        },
        derivedKey,
        {
            name: "HMAC",
            hash: "SHA-256",
            length: 256
        },
        false,
        ["sign"]
    );
};

const EditParolaItem = ({ item, setGestioneazaParolaItem, derivedKey }) => {

    const [key, setKey] = useState(derivedKey);
    //const [length, setLength] = useState(32);

    useEffect(() => {
        if (derivedKey) {
            setKey(derivedKey);

        }
        else {
            console.log("Cheia este goala !!");
        }
    }, [derivedKey]);

    const [initialValues, setInitialValues] = useState({
        nume: item.nume,
        username: item.username,
        parola: item.parola,
        url: item.url,
        comentariu: item.comentariu,
    });

    const [istoric, setIstoric] = useState(item.istoric);

    let parsedIstoric = [];

    try {
        parsedIstoric = JSON.parse(item.istoric);
        if (!Array.isArray(parsedIstoric)) {
            parsedIstoric = [];
        }
    } catch (error) {
        console.error("Eroare la parsarea istoricului:", error);
        parsedIstoric = [];
    }

    const [itemNume, setItemNume] = useState(item.nume);
    const [userName, setItemUsername] = useState(item.username);
    const [parolaName, setItemParola] = useState(item.parola);
    const [urlNume, setItemUrl] = useState(item.url);
    const [note, setItemNote] = useState(item.comentariu);
    const importedKey = item.importedKey;
    const [deEditat, setdeEditat] = useState({ nume: false, username: false, parola: false, url: false, note: false });

    const [showParola, setShowParola] = useState(false);

    const [uidItem, setUidItem] = useState(item.id_item);
    const [createdDate, setCreatedDate] = useState("");
    const [modifiedDate, setModifiedDate] = useState("");



    useEffect(() => {
        const dateObject = new Date(item.created_at);
        const dateObject2 = new Date(item.modified_at);
        const formattedDate = dateObject.toLocaleString();
        const formattedDate2 = dateObject2.toLocaleString();
        setCreatedDate(formattedDate);
        setModifiedDate(formattedDate2);
    }, [item.created_at, item.modified_at]);

    const [afisIstoric, setAfisIstoric] = useState(true);

    const [ownerNume, setOwnerNume] = useState("");
    const [ownerPrenume, setOwnerPrenume] = useState("");

    const accesUrl = (text) => {
        if (text) {
            window.open(text, '_blank', 'noopener,noreferrer');
        }
    }
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch('http://localhost:9000/api/getOwner', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: "include"
                });

                if (response.ok) {
                    const data = await response.json();
                    setOwnerNume(data[0].nume);
                    setOwnerPrenume(data[0].prenume);
                } else {
                    console.error('Failed to fetch items', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };
        fetchItems();
    }, []);

    const [hmacKey, setHmacKey] = useState(null); // 1. inițializare

    useEffect(() => {
        const genereazaHmacKey = async () => {
            if (derivedKey) {
                let cryptoKey;

                if (typeof derivedKey === "string") {
                    cryptoKey = await importRawKeyFromBase64(derivedKey);
                } else {
                    cryptoKey = derivedKey;
                }

                const key = await deriveHMACKey(cryptoKey);
                setHmacKey(key);
                console.log("🔐 HMAC Key generată:", key);
            }
        };

        genereazaHmacKey();
    }, [derivedKey]);

    const semneazaParola = async (parola, charset, length, hmacKey) => {
        if (hmacKey === null) {
        }
        const data = `${parola}|${charset}|${length}`;
        const encoder = new TextEncoder();

        const signature = await crypto.subtle.sign(
            "HMAC",
            hmacKey, // 🔐 folosești cheia deja derivată
            encoder.encode(data)
        );

        return Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    };


    const salveazaToateModificarile = async () => {
        let modificari = [];

        try {
            if (itemNume !== initialValues.nume) {
                modificari.push("Nume");
            }
            if (userName !== initialValues.username) {
                modificari.push("Username");
            }
            if (parolaName !== initialValues.parola) {
                modificari.push("Parola");
            }
            if (urlNume !== initialValues.url) {
                modificari.push("URL");
            }
            if (note !== initialValues.comentariu) {
                modificari.push("Comentariu");
            }

            if (modificari.length === 0) {
                return;
            }

            const now = new Date();
            const dataCurenta = now.toLocaleDateString();
            const oraCurenta = now.toLocaleTimeString();

            const nouIstoric = {
                operatie: `Actualizare Date: ${modificari.join(", ")}`,
                data: dataCurenta,
                time: oraCurenta,
            };

            const istoricActualizat = [...parsedIstoric, nouIstoric];

            setIstoric(istoricActualizat);

            const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
            let cryptoKey;

            if (typeof derivedKey === "string") {
                cryptoKey = await importRawKeyFromBase64(derivedKey);
            } else {
                cryptoKey = derivedKey;
            }

            const key = await deriveHMACKey(cryptoKey);
            setHmacKey(key);
            console.log("🔐 HMAC Key generată:", key);

            const semnaturaParola = await semneazaParola(parolaName, charset, length, hmacKey);
            console.log("Semnatura: ", semnaturaParola);



            // criptare elemente
            const enc_Tip = await criptareDate("password", importedKey);
            const enc_NumeItem = await criptareDate(itemNume, importedKey);
            const enc_UrlItem = await criptareDate(urlNume, importedKey);
            const enc_UsernameItem = await criptareDate(userName, importedKey);
            const enc_ParolaItem = await criptareDate(parolaName, importedKey);
            const enc_ComentariuItem = await criptareDate(note, importedKey);
            const enc_Semnatura = await criptareDate(semnaturaParola, importedKey);
            const enc_IstoricItem = await criptareDate(JSON.stringify(istoricActualizat), importedKey);

            const jsonItem = {
                metadata: {
                    created_at: item.created_at,
                    modified_at: (modificari.length > 0)
                        ? new Date().toISOString()
                        : item.modified_at,
                    modified_parola: (parolaName !== initialValues.parola)
                        ? new Date().toISOString()
                        : item.modified_parola,
                    version: item.version + 1,
                    meta: {
                        lungime: length,
                        charset: charset
                    }
                },
                data: {
                    tip: { iv: enc_Tip.iv, encData: enc_Tip.encData, tag: enc_Tip.tag, },
                    nume: { iv: enc_NumeItem.iv, encData: enc_NumeItem.encData, tag: enc_NumeItem.tag },
                    url: { iv: enc_UrlItem.iv, encData: enc_UrlItem.encData, tag: enc_UrlItem.tag },
                    username: { iv: enc_UsernameItem.iv, encData: enc_UsernameItem.encData, tag: enc_UsernameItem.tag },
                    parola: { iv: enc_ParolaItem.iv, encData: enc_ParolaItem.encData, tag: enc_ParolaItem.tag },
                    semnatura: { iv: enc_Semnatura.iv, encData: enc_Semnatura.encData, tag: enc_Semnatura.tag },
                    comentariu: { iv: enc_ComentariuItem.iv, encData: enc_ComentariuItem.encData, tag: enc_ComentariuItem.tag },
                    istoric: { iv: enc_IstoricItem.iv, encData: enc_IstoricItem.encData, tag: enc_IstoricItem.tag }

                },
            };

            const response = await fetch("http://localhost:9000/api/updateItem", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_item: uidItem,
                    continut: jsonItem,
                }),
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Eroare la actualizare");
            }
        } catch (error) {
            console.error('Error during the request:', error);
        }
    }
    return (
        <>
            <div className="px-4 mb-2 ">
                {/* Bara de sus cu butoane și titlu centrat */}
                <div className="flex items-center justify-between pb-3 mt-6">
                    {/* Butoanele pe stânga */}
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setGestioneazaParolaItem(null)} className="py-1 px-1 cursor-pointer rounded-lg">
                            <FaArrowLeft className="w-6 h-6 hover:text-blue-600 transition-all duration-300 ease-in-out" />
                        </button>
                        <button onClick={salveazaToateModificarile} className="py-1 px-1 cursor-pointer rounded-lg">
                            <FaSave className="w-6 h-6 hover:text-green-600 transition-all duration-300 ease-in-out" />
                        </button>
                    </div>
                    <div className="flex-1 text-center">
                        {deEditat.nume ? (
                            <input
                                type="text"
                                value={itemNume}
                                onChange={(e) => setItemNume(e.target.value)}
                                className="px-2 py-1 text-xl font-semibold text-center"
                            />
                        ) : (
                            <h2 className="font-semibold text-3xl">{itemNume}</h2>
                        )}
                    </div>
                </div>

                <div className="custom-height4 overflow-y-auto">
                    <div className="flex flex-col  lg:flex-row mt-2">
                        <div className="grid sm:grid-cols-2 lg:gap-x-36 grid-cols-1 gap-6">
                            <div className="w-full flex flex-col space-y-6">
                                {/* Usernameul de la parola*/}
                                <div className="flex items-center mt-6 border-b border-gray-300 pb-2 w-full">
                                    <p className="font-medium text-gray-700">Username: </p>
                                    {deEditat.username ? (
                                        <input type="text" value={userName} onChange={(e) => setItemUsername(e.target.value)} className=" ml-3 border border-gray-300 rounded-lg px-2 py-1 w-3/4"></input>
                                    ) : (
                                        <span className="ml-3 text-gray-800 overflow-x-auto whitespace-nowrap px-2 py-1 rounded-lg">{userName}</span>
                                    )}


                                    <button onClick={() => setdeEditat({ ...deEditat, username: !deEditat.username })} className="ml-3 text-gray-500 hover:text-blue-500">
                                        {deEditat.username ? <FaSave /> : <FaEdit />}
                                    </button>
                                </div>
                                {/* Campul de parola */}
                                <div className="flex items-center mt-6 border-b border-gray-300 pb-2 w-full">
                                    <p className="font-medium text-gray-700 w-20">Parola:</p>

                                    {deEditat.parola ? (
                                        <input
                                            type="password"
                                            value={parolaName}
                                            onChange={(e) => setItemParola(e.target.value)}
                                            className="ml-3 border border-gray-300 rounded-lg px-2 py-1 w-full"
                                        />
                                    ) : (
                                        <div className="ml-3 w-full overflow-x-auto whitespace-nowrap  px-2 py-1 rounded-lg">
                                            {showParola ? parolaName : '*'.repeat(parolaName.length)}
                                        </div>
                                    )}

                                    {/* Butonul de Afisare Parola */}
                                    <button onClick={() => setShowParola(!showParola)} className="ml-3 text-gray-500 hover:text-blue-500 transition duration-300 ease-in-out">
                                        {showParola ? <FaEyeSlash /> : <FaEye />}
                                    </button>

                                    {/* Butonul de editare */}
                                    <button onClick={() => setdeEditat({ ...deEditat, parola: !deEditat.parola })} className="ml-3 text-gray-500 hover:text-blue-500">
                                        {deEditat.parola ? <FaSave /> : <FaEdit />}
                                    </button>
                                </div>
                                {/*Note/Mentiuni*/}
                                <div className="mt-6">
                                    <h3 className="font-medium">Note/Mentiuni:</h3>
                                    {deEditat.note ? (
                                        <textarea value={note} onChange={(e) => setItemNote(e.target.value)} className=" h-auto min-h-12 max-h-48 mt-3 w-full border border-gray-400 border-2 rounded-lg mr-2"></textarea>
                                    ) : (
                                        <p className="mt-2 text rounded-lg w-full h-auto">{note}</p>
                                    )}
                                    <button onClick={() => setdeEditat({ ...deEditat, note: !deEditat.note })} className="text-gray-500 hover:text-blue-500 transition">
                                        {deEditat.note ? <FaSave /> : <FaEdit />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4 w-full">
                                {/*Campul de URL */}
                                <div className="flex itmes-center mt-6">
                                    <div className="flex flex-col  lg:ml-4">
                                        <h3 className="font-medium">Adresa URL:</h3>
                                        {deEditat.url ? (
                                            <input type="text" value={urlNume} onChange={(e) => setItemUrl(e.target.value)} className="border boder-gray-300 rounded-lg p-2 w-[250px]"></input>
                                        ) : (
                                            <span onClick={() => accesUrl(urlNume)} className="text-blue-500 cursor-pointer hover:underline">{urlNume}</span>
                                        )}
                                        <button onClick={() => setdeEditat({ ...deEditat, url: !deEditat.url })} className="text-gray-500 hover:text-blue-500 transition">
                                            {deEditat.url ? <FaSave /> : <FaEdit />}
                                        </button>
                                    </div>

                                </div>
                                {/* UID-ul itemului */}
                                <div className="flex flex-col lg:flex-row lg:ml-4">
                                    <h3 className="font-medium">Record ID:</h3>
                                    <span className="lg:ml-3 text-blue-500">{uidItem}</span>
                                </div>
                                {/* Data creării și cine a creat */}
                                <div className="flex flex-col lg:flex-row lg:ml-4">
                                    <h3 className="font-medium">Creat:</h3>
                                    <div className="lg:ml-2">
                                        <div className="space-x-2">
                                            <span className="text-gray-700">{createdDate}</span>

                                        </div>
                                    </div>
                                </div>
                                {/* Proprietar */}
                                <div className="flex flex-col lg:flex-row lg:ml-4">
                                    <h3 className="font-medium">Proprietar:</h3>
                                    <span className="text-gray-700 lg:ml-2">{`${ownerNume} ${ownerPrenume}`}</span>
                                </div>
                                {/*Semantura */}
                                <div className="flex flex-col lg:flex-row lg:ml-4 mt-2">
                                    <h3 className="font-medium">Semnătură:</h3>
                                    <span
                                        className={`lg:ml-2 font-semibold flex items-center gap-2 
            ${item.isTampered ? "text-red-600" : "text-green-600"}`}
                                    >
                                        {item.isTampered ? "Invalidă ❌" : "Validă ✅"}
                                    </span>
                                </div>
                                {/* Data modificării și cine a modificat */}
                                <div className="flex flex-col lg:flex-row lg:ml-4">
                                    <h3 className="font-medium">Modificat:</h3>
                                    <div className="lg:ml-2">
                                        <div className="space-x-2">
                                            <span className="text-gray-700">{modifiedDate}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col lg:flex-row lg:ml-4">
                                    <span className="text-gray-700 ">Versiune: {item.version}</span>
                                </div>
                            </div>


                        </div>
                    </div>
                    {/*Istoric */}
                    <div className='w-full  custom_top_istoric mt-5'>
                        <div className="flex flex-col space-y-1 ">
                            <h3 className="font-medium">Istoric Modificari:</h3>
                            <h2 className="text-gray-700 cursor-pointer hover:underline text-gray-400" onClick={() => setAfisIstoric(!afisIstoric)}>{afisIstoric ? 'Ascunde' : 'Afiseaza'}</h2>
                            {afisIstoric && (
                                <div>
                                    {Array.isArray(parsedIstoric) && parsedIstoric.length > 0 ? (
                                        <div className="h-48 sm:w-1/2 overflow-y-auto border rounded-lg shadow-lg border-gray-300 border-2 bg-white mt-2">
                                            {parsedIstoric.map((it, index) => (
                                                <div key={index} className="py-1 mx-2">
                                                    <span className="font-semibold">{it.operatie}</span>
                                                    <div className="flex space-x-2">
                                                        <span className="text-sm">{it.data}</span>
                                                        <span className="text-sm">{it.time}</span>
                                                    </div>
                                                    <hr className="border-t-2 border-blue-400 my-1 rounded-full"></hr>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">Istoric Gol</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default EditParolaItem;