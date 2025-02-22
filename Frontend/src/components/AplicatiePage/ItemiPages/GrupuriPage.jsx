import React from "react";
import { useState, useEffect } from 'react';

import ListIcon from "../../../assets/website/list.png"
import GridIcon from "../../../assets/website/visualization.png"
import { FaPlus, FaClipboard, FaSignOutAlt } from 'react-icons/fa';
import PopupNewGrup from "../Popup_uri/PopupNewGrup"

import EdiGrupItem from './EditGrupItem';
import GroupItmes from "./GroupItems";


const GrupuriPage = ({ accessToken, derivedKey }) => {
    const [key, setKey] = useState(derivedKey);

    useEffect(() => {
        if (derivedKey) {
            setKey(derivedKey);
        }
    }, [derivedKey]);

    const [groups, setGroups] = useState([]);
    const [isDeschisMeniuSortare, setIsDropdownOpen] = useState(false);
    const [OptiuneSelectata, setSelectedOption] = useState("Sortează după: Nume");
    const [popupGrupNou, setPopupGrupNou] = useState(false);
    const [gestioneazaGrupItem, setGestioneazaGrupItem] = useState(null);
    const [tipAfisare, setTipAfisare] = useState("grid");


    const [optiuneGrup, setoptiuneGrup] = useState('');
    const selecteazaOptiune = (sectiune) => {
        setoptiuneGrup(sectiune);
    }

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDeschisMeniuSortare);
    };

    const handleOptionSelect = (optiune) => {
        setSelectedOption(optiune);
        setIsDropdownOpen(false);
    };

    const openPopup = () => {
        setPopupGrupNou(true);
    };


    const fetchGroups = async () => {
        try {
            const response = await fetch('http://localhost:9000/api/getGrupuri', {
                method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
            });

            if (response.ok) {
                const data = await response.json();
                setGroups(data);
            } else {
                console.error('Eroare la obținerea grupurilor');
            }
        } catch (error) {
            console.error('Eroare la cererea grupurilor:', error);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const [userId, setUserId] = useState(null);
    const getUserId = async () => {
        try {
            const response = await fetch('http://localhost:9000/api/utilizator/getUserId', {
                method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
            });

            if (response.ok) {
                const data = await response.json();
                setUserId(data.userId);
            } else {
                console.error('Eroare la obtinerea id-ului');
            }
        } catch (error) {
            console.error('Eroare la cererea grupurilor:', error);
        }
    };
    useEffect(() => {
        if (userId === null) {
            getUserId();
        }
    }, [userId]);

    return (
        <>
            {gestioneazaGrupItem === null && <div>
                <h2 className="font-bold text-2xl text-center mt-6">Grupuri</h2>
                <div className="flex flex-row aliniere_custom2 justify-between items-center mx-6 mt-4">
                    {/*Sectiunea de vizualizare a datelor */}
                    <div className="flex space-x-2">
                        <div onClick={openPopup} className="relative flex justify-center">
                            <button className="flex px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-800">
                                <FaPlus className="w-5 h-5" />
                                <span className="ml-2">Grup Nou</span>
                            </button>
                        </div>
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
                <hr className="border-t-4 border-gray-500 my-4 rounded-full mx-8" />

                {tipAfisare === "lista" ? (
                    // Lista de grupuri de care utilizatorul este membru
                    <div />
                ) : (
                    // Grupurile în care utilizatorul este membru
                    <div className="ml-8 mr-8">
                        <h3 className="text-xl font-semibold mt-6 mb-4">Grupurile mele</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groups.filter(group => group.id_owner === userId).length === 0 ? (
                                <div className="col-span-full text-center text-gray-500">
                                    Nu există grupuri.
                                </div>
                            ) : (
                                groups
                                    .filter(group => group.id_owner === userId)
                                    .map(group => (
                                        <div
                                            key={group.id_grup}
                                            onClick={() => {
                                                selecteazaOptiune("itemigrup");
                                                setGestioneazaGrupItem(group);
                                            }}
                                            className="border border-white-700 rounded-lg shadow-lg shadow-gray-300 bg-neutral-300 p-4 rounded-lg shadow-md cursor-pointer flex flex-row justify-between hover:bg-yellow-400 cursor-pointer group transition-all duration-300 ease-in-out"
                                        >
                                            <h3 className="text-xl font-semibold">{group.nume}</h3>
                                            <div className="mt-1 flex justify-end space-x-4">
                                                <FaClipboard
                                                    className="w-7 h-7 cursor-pointer hover:text-blue-500"
                                                    onClick={(e) => {
                                                        // Opriți propagarea evenimentului de click pe iconița FaClipboard
                                                        e.stopPropagation();
                                                        selecteazaOptiune("detalii");
                                                        setGestioneazaGrupItem(group);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                )}

                {tipAfisare === "lista" ? (
                    // Lista de grupuri de care utilizatorul este membru
                    <div />
                ) : (
                    // Grupurile în care utilizatorul este membru
                    <div className="ml-8 mr-8">
                        <h3 className="text-xl font-semibold mt-6 mb-4">Alte grupuri</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groups.filter(group => group.id_owner !== userId).length === 0 ? (
                                <div className="col-span-full text-center text-gray-500">
                                    Nu există grupuri.
                                </div>
                            ) : (
                                groups
                                    .filter(group => group.id_owner !== userId) // Afișează grupurile de care este membru
                                    .map(group => (
                                        <div
                                            key={group.id_grup}
                                            onClick={() => {
                                                selecteazaOptiune("itemigrup");
                                                setGestioneazaGrupItem(group);
                                            }}
                                            className="border border-white-700 rounded-lg shadow-lg shadow-gray-300 bg-neutral-300 p-4 rounded-lg shadow-md cursor-pointer flex flex-row justify-between hover:bg-yellow-400 cursor-pointer group transition-all duration-300 ease-in-out"
                                        >
                                            <h3 className="text-xl font-semibold">{group.nume}</h3>
                                            <div className="mt-1 flex justify-end space-x-4">
                                                <FaClipboard
                                                    className="w-7 h-7 cursor-pointer hover:text-blue-500"
                                                    onClick={(e) => {
                                                        // Opriți propagarea evenimentului de click pe iconița FaClipboard
                                                        e.stopPropagation();
                                                        selecteazaOptiune("detalii");
                                                        setGestioneazaGrupItem(group);
                                                    }}
                                                />
                                                <FaSignOutAlt
                                                    className="w-7 h-7 cursor-pointer hover:text-red-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Opriți propagarea evenimentului de click
                                                        parasesteGrup(group.id_grup); // Apelează funcția pentru a părăsi grupul
                                                    }}
                                                />

                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                )}
                {popupGrupNou && <PopupNewGrup accessToken={accessToken} setPopupGrupNou={setPopupGrupNou} derivedKey={key} />}
            </div >
            }
            {gestioneazaGrupItem && optiuneGrup === "detalii" && <EdiGrupItem item={gestioneazaGrupItem} setGestioneazaGrupItem={setGestioneazaGrupItem} accessToken={accessToken} derivedKey={key} />}
            {gestioneazaGrupItem && optiuneGrup === "itemigrup" && <GroupItmes item={gestioneazaGrupItem} setGestioneazaGrupItem={setGestioneazaGrupItem} accessToken={accessToken} derivedKey={key} />}
        </>
    );
};
export default GrupuriPage;