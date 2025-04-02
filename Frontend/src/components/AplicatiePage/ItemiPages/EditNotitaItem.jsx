import React from "react";
import { useState, useEffect } from 'react';
import ArrowBack from "../../../assets/website/back.png"
import "../../../App.css"

import { FaEdit, FaSave, FaArrowLeft } from 'react-icons/fa';
import { criptareDate } from "../../FunctiiDate/FunctiiDefinite";

const EditNotitaItem = ({ item, setGestioneazaParolaItem }) => {

    const [initialValues, setInitialValues] = useState({
        nume: item.nume,
        data: item.data,
        comentariu: item.comentariu,
    });

    console.log(item.istoric);
    const importedKey = item.importedKey;

    const [istoric, setIstoric] = useState(item.istoric);

    console.log("Tipul lui istoric:", typeof item.istoric);
    console.log("Conținutul lui istoric:", istoric);
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
    const [date, setItemData] = useState(item.data);
    const [note, setItemNote] = useState(item.comentariu);
    const [deEditat, setdeEditat] = useState({ nume: false, date: false, note: false });

    const [uidItem, setUidItem] = useState(item.id_item);
    const [createdDate, setCreatedDate] = useState("");
    const [modifiedDate, setModifiedDate] = useState("");

    useEffect(() => {
        const dateObject = new Date(item.created_at);
        const formattedDate = dateObject.toLocaleString();
        setCreatedDate(formattedDate);
        setModifiedDate(formattedDate);
    }, [item.created_at, item.modified_at]);

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
        let modificari = [];

        try {
            if (itemNume !== initialValues.nume) {
                modificari.push("Nume");
            }

            if (note !== initialValues.comentariu) {
                modificari.push("Comentariu");
            }
            if (date !== initialValues.data) {
                modificari.push("Data Calendaristica");
            }
            console.log("Modificarile noi:", itemNume, date, note);
            if (modificari.length === 0) {
                console.log("Nicio modificare detectată.");
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

            console.log("Nou Istoric:", nouIstoric);

            console.log("istoric vechi", istoric);

            const istoricActualizat = [...parsedIstoric, nouIstoric];
            console.log("Istoricul actualizat: ", istoricActualizat);

            setIstoric(istoricActualizat);


            // criptare elemente
            const enc_Tip = await criptareDate("notita", importedKey);
            const enc_NumeItem = await criptareDate(itemNume, importedKey);
            const enc_datalItem = await criptareDate(date, importedKey);
            const enc_ComentariuItem = await criptareDate(note, importedKey);
            const enc_IstoricItem = await criptareDate(JSON.stringify(istoricActualizat), importedKey);

            const jsonItem = {
                metadata: {
                    created_at: new Date().toISOString(),
                    modified_at: new Date().toISOString(),
                    version: item.version + 1
                },
                data: {
                    tip: { iv: enc_Tip.iv, encData: enc_Tip.encData, tag: enc_Tip.tag, },
                    nume: { iv: enc_NumeItem.iv, encData: enc_NumeItem.encData, tag: enc_NumeItem.tag },
                    data: { iv: enc_datalItem.iv, encData: enc_datalItem.encData, tag: enc_datalItem.tag },
                    comentariu: { iv: enc_ComentariuItem.iv, encData: enc_ComentariuItem.encData, tag: enc_ComentariuItem.tag },
                    istoric: { iv: enc_IstoricItem.iv, encData: enc_IstoricItem.encData, tag: enc_IstoricItem.tag }
                },
            };


            const response = await fetch("http://localhost:9000/api/updateItem", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    id_item: uidItem,
                    continut: jsonItem,
                }),
            });

            if (!response.ok) {
                throw new Error("Eroare la actualizare");
            }

            console.log("Item actualizat cu succes!");


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
                    <div className="flex-1 flex-row text-center">
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
                        <button onClick={() => setdeEditat({ ...deEditat, nume: !deEditat.nume })} className="text-gray-500 hover:text-blue-500 transition mt-2">
                            {deEditat.nume ? <FaSave className="ml-2" /> : <FaEdit />}
                        </button>
                    </div>
                </div>

                <div className="custom-height4 overflow-y-auto">
                    <div className="flex flex-col  lg:flex-row mt-2">
                        <div className="grid sm:grid-cols-2 lg:gap-x-36 grid-cols-1 gap-6 mt-6">
                            <div className="flex flex-col">
                                <div className="flex flex-row">
                                    <p className="font-medium mr-2 ml-2">Data:</p>
                                    {deEditat.date ? (
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setItemData(e.target.value)}
                                            className="border border-gray-300 rounded-lg px-2 py-1"
                                        />
                                    ) : (
                                        <span className="text-gray-800 font-semibold">{new Date(date).toLocaleDateString('ro-RO')}</span>
                                    )}
                                    <button onClick={() => setdeEditat({ ...deEditat, date: !deEditat.date })} className="text-gray-500 hover:text-blue-500 transition ml-2">
                                        {deEditat.date ? <FaSave /> : <FaEdit />}
                                    </button>
                                </div>

                                {/*Note/Mentiuni*/}
                                <div className="ml-2">
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
                    <div className='w-full  custom_top_istoric mt-5 sm:px-2'>
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

export default EditNotitaItem;