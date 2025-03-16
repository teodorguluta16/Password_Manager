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

const EditAdreseGroupItem = ({ item, setGestioneazaAdresaItem }) => {

    console.log(item.nume);
    const [itemNume, setItemNume] = useState(item.nume);
    const [adresaItem, setAdresa] = useState(item.adresa);
    const [orasItem, setOras] = useState(item.oras);
    const [judetItem, setJudet] = useState(item.judet);
    const [codPostal, serCodPostal] = useState(item.codPostal);

    const [note, setItemNote] = useState(item.comentariu);
    const [deEditat, setdeEditat] = useState({ nume: false, note: false, adresaItem: false, orasItem: false });

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
    }, []);

    const salveazaToateModificarile = async () => {
        try {
            //const requestData = { uidItem, itemNume, userName, parolaName, urlNume, note };
            // ca sa le modific trebuie iarasi sa le criptez la loc si sa le trimit la fel ca la aduagare item

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
                        <button onClick={() => setGestioneazaAdresaItem(null)} className="py-1 px-1 cursor-pointer rounded-lg">
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
                        <div className="grid sm:grid-cols-2 lg:gap-x-36 grid-cols-1 gap-6 mt-6">
                            <div className="flex flex-col">
                                <div className="flex flex-row">

                                </div>
                                <div className="ml-2">
                                    {/* Adrese*/}
                                    <div className="flex items-center mt-2 border-b border-gray-300 pb-2 w-full max-w-[400px]">
                                        <p className="font-medium text-gray-700">Adresa: </p>
                                        {deEditat.adresaItem ? (
                                            <input type="text" value={adresaItem} onChange={(e) => setItemUsername(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 w-3/4"></input>
                                        ) : (
                                            <span className="ml-3 text-gray-800">{adresaItem}</span>
                                        )}
                                        {/* Butonul de copiere Username */}
                                        <button onClick={() => copieContinut(adresaItem)} className="ml-3 text-gray-500 hover:text-blue-500 transition-all duration-300 ease-in-out">
                                            <FaCopy />
                                        </button>

                                        <button onClick={() => setdeEditat({ ...deEditat, adresaItem: !deEditat.adresaItem })} className="ml-3 text-gray-500 hover:text-blue-500">
                                            {deEditat.adresaItem ? <FaSave /> : <FaEdit />}
                                        </button>
                                    </div>
                                    {/* Oras*/}
                                    <div className="flex items-center mt-2 border-b border-gray-300 pb-2 w-full max-w-[400px]">
                                        <p className="font-medium text-gray-700">Oraș: </p>
                                        {deEditat.orasItem ? (
                                            <input type="text" value={orasItem} onChange={(e) => setItemUsername(e.target.value)} className=" ml-3 border border-gray-300 rounded-lg px-2 py-1 w-3/4"></input>
                                        ) : (
                                            <span className="ml-3 text-gray-800">{orasItem}</span>
                                        )}
                                        {/* Butonul de copiere Username */}
                                        <button onClick={() => copieContinut(orasItem)} className="ml-3 text-gray-500 hover:text-blue-500 transition-all duration-300 ease-in-out">
                                            <FaCopy />
                                        </button>

                                        <button onClick={() => setdeEditat({ ...deEditat, orasItem: !deEditat.orasItem })} className="ml-3 text-gray-500 hover:text-blue-500">
                                            {deEditat.orasItem ? <FaSave /> : <FaEdit />}
                                        </button>
                                    </div>
                                    {/*Judet*/}
                                    <div className="flex items-center mt-2 border-b border-gray-300 pb-2 w-full max-w-[400px]">
                                        <p className="font-medium text-gray-700">Județ: </p>
                                        {deEditat.judetItem ? (
                                            <input type="text" value={judetItem} onChange={(e) => setItemUsername(e.target.value)} className=" ml-3 border border-gray-300 rounded-lg px-2 py-1 w-3/4"></input>
                                        ) : (
                                            <span className="ml-3 text-gray-800">{judetItem}</span>
                                        )}
                                        {/* Butonul de copiere Username */}
                                        <button onClick={() => copieContinut(judetItem)} className="ml-3 text-gray-500 hover:text-blue-500 transition-all duration-300 ease-in-out">
                                            <FaCopy />
                                        </button>

                                        <button onClick={() => setdeEditat({ ...deEditat, judetItem: !deEditat.judetItem })} className="ml-3 text-gray-500 hover:text-blue-500">
                                            {deEditat.judetItem ? <FaSave /> : <FaEdit />}
                                        </button>
                                    </div>
                                    {/*Cod Postal */}
                                    <div className="flex items-center mt-2 border-b border-gray-300 pb-2 w-full max-w-[400px]">
                                        <p className="font-medium text-gray-700">Cod Poștal: </p>
                                        {deEditat.codPostal ? (
                                            <input type="text" value={codPostal} onChange={(e) => setItemUsername(e.target.value)} className=" ml-3 border border-gray-300 rounded-lg px-2 py-1 w-3/4"></input>
                                        ) : (
                                            <span className="ml-3 text-gray-800">{codPostal}</span>
                                        )}
                                        {/* Butonul de copiere Username */}
                                        <button onClick={() => copieContinut(codPostal)} className="ml-3 text-gray-500 hover:text-blue-500 transition-all duration-300 ease-in-out">
                                            <FaCopy />
                                        </button>

                                        <button onClick={() => setdeEditat({ ...deEditat, codPostal: !deEditat.codPostal })} className="ml-3 text-gray-500 hover:text-blue-500">
                                            {deEditat.codPostal ? <FaSave /> : <FaEdit />}
                                        </button>
                                    </div>
                                </div>



                                {/*Note/Mentiuni*/}
                                <div className="ml-2 mt-4">
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

                            <div className="space-y-4">
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
                                            {createdBy && <span className="text-gray-500 italic">by ionut@@@ {createdBy}</span>}
                                        </div>
                                    </div>
                                </div>
                                {/* Proprietar */}
                                <div className="flex flex-col lg:flex-row lg:ml-4">
                                    <h3 className="font-medium">Proprietar:</h3>
                                    <span className="text-gray-700 lg:ml-2">{`${ownerNume} ${ownerPrenume}`}</span>
                                </div>
                                {/* Data modificării și cine a modificat */}
                                <div className="flex flex-col lg:flex-row lg:ml-4">
                                    <h3 className="font-medium">Modificat:</h3>
                                    <div className="lg:ml-2">
                                        <div className="space-x-2">
                                            <span className="text-gray-700">{modifiedDate}</span>
                                            {modifiedBy && <span className="text-gray-500 italic">by ionut@ionut {modifiedBy}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                    {/*Istoric */}
                    <div className='w-full  custom_top_istoric mt-5 px-2'>
                        <div className="flex flex-col space-y-1 ">
                            <h3 className="font-medium">Istoric Modificari:</h3>
                            <h2 className="text-gray-700 cursor-pointer hover:underline text-gray-400" onClick={() => setAfisIstoric(!afisIstoric)}>{afisIstoric ? 'Ascunde' : 'Afiseaza'}</h2>
                            {afisIstoric && (<div>{Istoric.length > 0 ? (<div className="h-48 sm:w-1/2 overflow-y-auto border rounded-lg shadow-lg border-gray-300 border-2 bg-white mt-2">
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
        </>
    );
};

export default EditAdreseGroupItem;