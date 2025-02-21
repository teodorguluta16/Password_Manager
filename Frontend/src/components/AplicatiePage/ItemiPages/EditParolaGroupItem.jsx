import React from "react";
import { useState, useEffect } from 'react';
import ArrowBack from "../../../assets/website/back.png"
import "../../../App.css"

import { FaEye, FaEyeSlash, FaCopy, FaEdit, FaSave, FaArrowLeft } from 'react-icons/fa';
const Istoric = [
    { operatie: "Actualizare Parola", data: "11/11/2024", time: "12:03", modifiedby: "user123" },
    { operatie: "Actualizare Username", data: "11/11/2024", time: "12:03", modifiedby: "user123" },
    { operatie: "Actualizare URL", data: "11/11/2024", time: "12:03", modifiedby: "user123" },
    { operatie: "Actualizare Titlu", data: "11/11/2024", time: "12:03", modifiedby: "user123" },
    { operatie: "Actualizare Notita", data: "11/11/2024", time: "12:03", modifiedby: "user123" },
]

const EditParolaGroupItem = ({ item, setGestioneazaParolaItem, accessToken }) => {
    console.log("Itemul este: ", item);
    const [itemNume, setItemNume] = useState(item.nume);
    const [userName, setItemUsername] = useState(item.username);
    const [parolaName, setItemParola] = useState(item.parola);
    const [urlNume, setItemUrl] = useState(item.url);
    const [note, setItemNote] = useState(item.comentariu);
    const [deEditat, setdeEditat] = useState({ nume: false, username: false, parola: false, url: false, note: false });

    const [esteCopiat, setEsteCopiat] = useState(false);
    const copieContinut = (text) => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setEsteCopiat(false), 2000);
    }

    const [showParola, setShowParola] = useState(false);

    const [uidItem, setUidItem] = useState(item.id_item);
    const [createdDate, setCreatedDate] = useState("");
    const [modifiedDate, setModifiedDate] = useState("");

    useEffect(() => {
        const dateObject = new Date(item.created_at);
        const formattedDate = dateObject.toLocaleString();
        setCreatedDate(formattedDate);
        setModifiedDate(formattedDate);
    }, [item.created_at, item.modified_at]);

    const [createdBy, setCreatedBy] = useState("Alice");

    const [modifiedBy, setModifiedBy] = useState("Bob");

    const [afisIstoric, setAfisIstoric] = useState(true);

    const [ownerNume, setOwnerNume] = useState("");
    const [ownerPrenume, setOwnerPrenume] = useState("");

    const accesUrl = (text) => {
        if (text) {
            window.open(text, '_blank', 'noopener,noreferrer');
        }
    }
    useEffect(() => {
        console.log("tokenul:", accessToken);
        const fetchItems = async () => {
            try {
                const response = await fetch('http://localhost:9000/api/getOwner', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Datele primite de la server: ", data);
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
    }, [accessToken]);

    const salveazaToateModificarile = async () => {
        try {
            const requestData = { uidItem, itemNume, userName, parolaName, urlNume, note };
            // ca sa le modific trebuie iarasi sa le criptez la loc si sa le trimit la fel ca la aduagare item

        } catch (error) {
            console.error('Error during the request:', error);
        }
    }
    return (
        <>
            <div className="px-12 mb-2">
                <button onClick={() => setGestioneazaParolaItem(null)} className="py-1 px-1 cursor-pointer rounded-lg -ml-1">
                    <FaArrowLeft className="w-6 h-6 hover:text-blue-600 transition-all duration-300 ease-in-out" />
                </button>
                {/*Butonul de slavare modificari*/}
                <button onClick={salveazaToateModificarile} className="py-1 px-1 ml-4 cursor-pointer rounded-lg">
                    <FaSave className="w-6 h-6 hover:text-green-600 transition-all duration-300 ease-in-out" />
                </button>
                <div className="overflow-y-auto custom-height2">

                    {/*Numele itemului(parolei)*/}
                    <div className="flex items-center mt-2">
                        {/* Campul de afisare/editare nume item */}
                        {deEditat.nume ? (
                            <input type="text" value={itemNume} onChange={(e) => setItemNume(e.target.value)} className="border border-gray-300 rounded px-2 py-1"></input>
                        ) : (<h2 className='font-semibold text-2xl'>{itemNume}</h2>
                        )}

                        {/* butonul de edit */}
                        <button onClick={() => setdeEditat({ ...deEditat, nume: !deEditat.nume })} className="ml-3 text-gray-500 hover:text=blue-500 transition">
                            {deEditat.nume ? <FaSave /> : <FaEdit />}
                        </button>
                    </div>
                    <div className="flex flex-col gap-12 lg:flex-row">

                        <div className="w-full lg:w-1/2 flex flex-col space-y-6 overflow-y-auto">
                            {/* Usernameul de la parola*/}
                            <div className="flex items-center mt-6 border-b border-gray-300 pb-2">
                                <p className="font-medium text-gray-700">Username: </p>
                                {deEditat.username ? (
                                    <input type="text" value={userName} onChange={(e) => setItemUsername(e.target.value)} className=" ml-3 border border-gray-300 rounded-lg px-2 py-1 w-3/4"></input>
                                ) : (
                                    <span className="ml-3 text-gray-800">{userName}</span>
                                )}
                                {/* Butonul de copiere Username */}
                                <button onClick={() => copieContinut(userName)} className="ml-3 text-gray-500 hover:text-blue-500 transition-all duration-300 ease-in-out">
                                    <FaCopy />
                                </button>

                                <button onClick={() => setdeEditat({ ...deEditat, username: !deEditat.username })} className="ml-3 text-gray-500 hover:text-blue-500">
                                    {deEditat.username ? <FaSave /> : <FaEdit />}
                                </button>
                            </div>

                            {/*Campul de parola*/}
                            <div className="flex items-center mt-6 border-b border-gray-300 pb-2">
                                <p className="font-medium text-gray-700">Parola:</p>
                                {deEditat.parola ? (
                                    <input type="password" value={parolaName} onChange={(e) => setItemParola(e.target.value)} className="ml-3 border border-gray-300 rounded-lg px-2 py-1 w-3/4"></input>
                                ) : (
                                    <span className="ml-3 text-gray-800"> {showParola ? parolaName : '*'.repeat(parolaName.length)}</span>
                                )}
                                {/* Butonul de Afisare Parola */}
                                <button onClick={() => setShowParola(!showParola)} className="ml-3 text-gray-500 hover:text-blue-500 transition">
                                    {showParola ? <FaEyeSlash /> : <FaEye />}
                                </button>
                                <button onClick={() => copieContinut(parolaName)} className="ml-3 text-gray-500 hover:text-blue-500 transition-all duration-300 ease-in-out">
                                    <FaCopy />
                                </button>
                                {/*Butonul de editare Parola*/}
                                <button onClick={() => setdeEditat({ ...deEditat, parola: !deEditat.parola })} className="ml-3 text-gray-500 hover:text-blue-500">
                                    {deEditat.parola ? <FaSave /> : <FaEdit />}
                                </button>
                            </div>

                            {/*Campul de URL */}
                            <div className="flex itmes-center mt-6">
                                <h3 className="font-medium">Adresa URL:</h3>
                                {deEditat.url ? (
                                    <input type="text" value={urlNume} onChange={(e) => setItemUrl(e.target.value)} className="ml-3 border boder-gray-300 rounded-lg px-2 py-1  w-3/4"></input>
                                ) : (
                                    <span onClick={() => accesUrl(urlNume)} className="ml-3 text-blue-500 cursor-pointer hover:underline">{urlNume}</span>
                                )}
                                <button onClick={() => setdeEditat({ ...deEditat, url: !deEditat.url })} className="ml-3 text-gray-500 hover:text-blue-500 transition">
                                    {deEditat.url ? <FaSave /> : <FaEdit />}
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

                        <div className="flex flex-col mr-1 space-y-12 xl:space-y-8 mb-4">
                            <div className="grid sm:grid-cols-2 h-32 grid-cols-1 gap-6">

                                {/* UID-ul itemului */}
                                <div className="flex sm:flex-col sm:items-center sm:justify-center">
                                    <h3 className="font-medium">Record ID:</h3>
                                    <span className="ml-0 sm:justify-center text-center text-blue-500">{uidItem}</span>

                                </div>

                                {/* Data creării și cine a creat */}
                                <div className="flex sm:flex-col sm:items-center">
                                    <h3 className="font-medium">Creat:</h3>
                                    <div className="ml-2">
                                        <div className="custom_width space-x-2">
                                            <span className="text-gray-700">{createdDate}</span>
                                            {createdBy && <span className="text-gray-500 italic">by ionut@@@ {createdBy}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Proprietar */}
                                <div className="flex sm:flex-col sm:items-center">
                                    <h3 className="font-medium">Proprietar:</h3>
                                    <span className="ml-2 text-gray-700">{`${ownerNume} ${ownerPrenume}`}</span>
                                </div>



                                {/* Data modificării și cine a modificat */}
                                <div className="flex sm:flex-col sm:items-center">
                                    <h3 className="font-medium">Modificat:</h3>
                                    <div className="ml-2">
                                        <div className="flex custom_width space-x-2">
                                            <span className="text-gray-700">{modifiedDate}</span>
                                            {modifiedBy && <span className="text-gray-500 italic">by ionut@ionut {modifiedBy}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/*Istoric */}

                            <div className='sm:items-center w-full mb-8 sm:justify-center custom_top_istoric'>
                                <div className="flex space-x-2 sm:justify-center">
                                    <h3 className="font-medium items-center">Istoric Modificari:</h3>
                                    <h2 className="text-gray-700 cursor-pointer hover:underline text-gray-400" onClick={() => setAfisIstoric(!afisIstoric)}>{afisIstoric ? 'Ascunde' : 'Afiseaza'}</h2>

                                </div>
                                {afisIstoric && (<div>{Istoric.length > 0 ? (<div className="h-48 overflow-y-auto border rounded-lg shadow-lg border-gray-300 border-2 bg-white mt-2">
                                    {Istoric.map((it, index) => (
                                        <div key={index} className="py-1 mx-2">
                                            <span className="font-semibold">{it.operatie}</span>
                                            <div className="flex space-x-2">
                                                <span className="text-sm">{it.data}</span>
                                                <span className="text-sm">{it.time}</span>
                                                <span className="text-sm italic text-gray-600">by {it.modifiedby}</span>
                                            </div>

                                            <hr className="border-t-2 border-blue-400 my-1 rounded-full"></hr>
                                        </div>
                                    ))}
                                </div>
                                ) : (<p className="text-gray-600">Istoric Gol</p>
                                )}</div>)}
                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
};

export default EditParolaGroupItem;