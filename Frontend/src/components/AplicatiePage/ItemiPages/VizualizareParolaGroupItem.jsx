import React, { useState, useEffect } from 'react';
import "../../../App.css"
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';

const VizualizareParolaGroupItem = ({ item, setGestioneazaParolaItem }) => {
    console.log(item.istoric);

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

    const [uidItem, setUidItem] = useState(item.id_item);
    const [itemNume, setItemNume] = useState(item.nume);
    const [userName, setItemUsername] = useState(item.username);
    const [parolaName, setItemParola] = useState(item.parola);
    const [urlNume, setItemUrl] = useState(item.url);
    const [note, setItemNote] = useState(item.comentariu);

    const [showParola, setShowParola] = useState(false);
    const [createdDate, setCreatedDate] = useState("");
    const [modifiedDate, setModifiedDate] = useState("");
    const [afisIstoric, setAfisIstoric] = useState(true);

    useEffect(() => {
        const dateObject = new Date(item.created_at);
        const formattedDate = dateObject.toLocaleString();
        setCreatedDate(formattedDate);
        setModifiedDate(formattedDate);
    }, [item.created_at, item.modified_at]);

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
                const response = await fetch('http://localhost:9000/api/grupuri/getOwnerItem', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ uidItem }),
                    credentials: "include"
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setOwnerNume(data.nume);
                    setOwnerPrenume(data.prenume);
                } else {
                    console.error('Failed to fetch items', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };
        fetchItems();
    }, []);

    return (
        <>
            <div className="px-4 mb-2 ">
                {/* Bara de sus cu butoane și titlu centrat */}
                <div className="flex items-center justify-between pb-3 mt-2">
                    {/* Butoanele pe stânga */}
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setGestioneazaParolaItem(null)} className="py-1 px-1 cursor-pointer rounded-lg">
                            <FaArrowLeft className="w-6 h-6 hover:text-blue-600 transition-all duration-300 ease-in-out" />
                        </button>
                    </div>
                    <div className="flex-1 text-center">
                        <h2 className="font-semibold text-3xl">{itemNume}</h2>
                    </div>
                </div>

                <div className="custom-height4 overflow-y-auto">
                    <div className="flex flex-col  lg:flex-row mt-2">
                        <div className="grid sm:grid-cols-2 lg:gap-x-36 grid-cols-1 gap-6">
                            <div className="w-full flex flex-col space-y-6">
                                {/* Usernameul de la parola*/}
                                <div className="flex items-center mt-6 border-b border-gray-300 pb-2 w-full max-w-[400px]">
                                    <p className="font-medium text-gray-700">Username: </p>
                                    <span className="ml-3 text-gray-800">{userName}</span>
                                </div>
                                {/*Campul de parola*/}
                                <div className="flex items-center mt-6 border-b border-gray-300 pb-2 w-full max-w-[400px]">
                                    <p className="font-medium text-gray-700 w-20">Parola:</p>
                                    <span className="ml-3 text-gray-800 w-full max-w-[250px] truncate overflow-hidden">
                                        {showParola ? parolaName : '*'.repeat(parolaName.length)}
                                    </span>
                                    {/* Butonul de Afisare Parola */}
                                    <button onClick={() => setShowParola(!showParola)} className="ml-3 text-gray-500 hover:text-blue-500 transition">
                                        {showParola ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {/*Note/Mentiuni*/}
                                <div className="mt-6">
                                    <h3 className="font-medium">Note/Mentiuni:</h3>
                                    <p className="mt-2 text rounded-lg w-full h-auto">{note}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {/*Campul de URL */}
                                <div className="flex itmes-center mt-6">
                                    <div className="flex flex-col  lg:ml-4">
                                        <h3 className="font-medium">Adresa URL:</h3>
                                        <span onClick={() => accesUrl(urlNume)} className="text-blue-500 cursor-pointer hover:underline">{urlNume}</span>
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
                                    <div className="ml-2">
                                        <div className="space-x-2">
                                            <span className="text-gray-700">{createdDate}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Proprietar */}
                                <div className="flex flex-col lg:flex-row lg:ml-4">
                                    <h3 className="font-medium">Proprietar:</h3>
                                    <span className="text-gray-700 ml-2">{`${ownerNume} ${ownerPrenume}`}</span>
                                </div>
                                {/* Data modificării și cine a modificat */}
                                <div className="flex flex-col lg:flex-row lg:ml-4">
                                    <h3 className="font-medium">Modificat:</h3>
                                    <div className="ml-2">
                                        <div className="space-x-2">
                                            <span className="text-gray-700">{modifiedDate}</span>

                                        </div>
                                    </div>
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

export default VizualizareParolaGroupItem;
