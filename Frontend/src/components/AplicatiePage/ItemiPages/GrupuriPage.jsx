import React from "react";
import { useState, useEffect, useRef } from 'react';

import ListIcon from "../../../assets/website/list.png"
import GridIcon from "../../../assets/website/visualization.png"
import { FaPlus, FaClipboard, FaSignOutAlt, FaTrash, FaEllipsisV } from 'react-icons/fa';
import PopupNewGrup from "../Popup_uri/PopupNewGrup"
import PopupParasesteGrup from "../Popup_uri/PopupParasesteGrup";
import PopupStergeGrupDefinitiv from "../Popup_uri/PopupStergeGrupDefinitiv";

import EdiGrupItem from './EditGrupItem';
import GroupItmes from "./GroupItems";

const GrupMeniu = ({ group, selecteazaOptiune, setGestioneazaGrupItem, setStergeGrupPopup, setIdGrupDeEliminat }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative flex items-center space-x-2" ref={menuRef}>
            <FaEllipsisV className="w-7 h-7 cursor-pointer hover:text-blue-700" onClick={(e) => { e.stopPropagation(); setOpen(!open); }} />
            {open && (
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
                    <button className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); selecteazaOptiune("detalii"); setGestioneazaGrupItem(group); setOpen(false); }}>
                        <FaClipboard className="w-5 h-5 mr-2" />
                        Detalii
                    </button>
                    <button className="w-full flex items-center px-4 py-2 text-red-500 hover:bg-red-100"
                        onClick={(e) => { e.stopPropagation(); setStergeGrupPopup(true); setOpen(false); setIdGrupDeEliminat(group.id_grup) }}>
                        <FaTrash className="w-5 h-5 mr-2" />
                        Șterge
                    </button>
                </div>
            )}
        </div>
    );
};
const GrupMeniu2 = ({ group, selecteazaOptiune, setGestioneazaGrupItem, setleaveGrup }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative flex items-center space-x-2" ref={menuRef}>
            <FaEllipsisV className="w-7 h-7 cursor-pointer hover:text-blue-700" onClick={(e) => { e.stopPropagation(); setOpen(!open); }} />
            {open && (
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
                    <button className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); selecteazaOptiune("detalii"); setGestioneazaGrupItem(group); setOpen(false); }}>
                        <FaClipboard className="w-5 h-5 mr-2" />
                        Detalii
                    </button>
                    <button className="w-full flex items-center px-4 py-2 text-red-500 hover:bg-red-100"
                        onClick={(e) => { e.stopPropagation(); setleaveGrup(true); setOpen(false); }}>
                        <FaSignOutAlt className="w-5 h-5 mr-2" />
                        Părăsește
                    </button>
                </div>
            )}
        </div>
    );
};

const GrupuriPage = ({ derivedKey }) => {
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
                method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: "include"
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
                method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: "include"
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

    const [leaveGrup, setleaveGrup] = useState(false);
    const [stergeGrupPop, setStergeGrupPopup] = useState(false);
    const [idGrupDeEliminat, setIdGrupDeEliminat] = useState(false);
    return (
        <>
            {gestioneazaGrupItem === null && <div>
                <h2 className="font-bold text-2xl text-center mt-2">Grupuri</h2>
                <div className="flex flex-row aliniere_custom2 justify-between items-center mx-6 mt-2">
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
                <hr className="border-t-2 border-gray-500 my-4 rounded-full mx-6" />

                {tipAfisare === "lista" ? (
                    // Lista de grupuri de care utilizatorul este membru
                    <div />
                ) : (
                    // Grupurile în care utilizatorul este membru
                    <div className="ml-8 mr-8">
                        <h3 className="text-medium font-semibold mt-3 mb-4">Grupurile mele</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                                            <GrupMeniu
                                                group={group}
                                                selecteazaOptiune={selecteazaOptiune}
                                                setGestioneazaGrupItem={setGestioneazaGrupItem}
                                                setStergeGrupPopup={setStergeGrupPopup}
                                                setIdGrupDeEliminat={setIdGrupDeEliminat}

                                            />
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
                        <h3 className="text-medium font-semibold mt-4 mb-4">Alte grupuri</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {groups.filter(group => group.id_owner !== userId).length === 0 ? (
                                <div className="col-span-full text-center text-gray-500">
                                    Nu există grupuri.
                                </div>
                            ) : (
                                groups
                                    .filter(group => group.id_owner !== userId)
                                    .map(group => (
                                        <div
                                            key={group.id_grup}
                                            onClick={() => {
                                                if (!leaveGrup) {
                                                    selecteazaOptiune("itemigrup");
                                                    setGestioneazaGrupItem(group);
                                                }
                                            }}
                                            className="border border-white-700 rounded-lg shadow-lg shadow-gray-300 bg-neutral-300 p-4 rounded-lg shadow-md cursor-pointer flex flex-row justify-between hover:bg-yellow-400 cursor-pointer group transition-all duration-300 ease-in-out"
                                        >

                                            <h3 className="text-xl font-semibold">{group.nume}</h3>
                                            <GrupMeniu2
                                                group={group}
                                                selecteazaOptiune={selecteazaOptiune}
                                                setGestioneazaGrupItem={setGestioneazaGrupItem}
                                                setleaveGrup={setleaveGrup}

                                            />
                                            {leaveGrup && <PopupParasesteGrup setShowPopupParasesteGrup={setleaveGrup} item={group.id_grup} fetchItems={fetchGroups} />}
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                )}
                {popupGrupNou && <PopupNewGrup setPopupGrupNou={setPopupGrupNou} derivedKey={key} fetchGroups={fetchGroups} />}
            </div >
            }
            {gestioneazaGrupItem && optiuneGrup === "detalii" && <EdiGrupItem item={gestioneazaGrupItem} setGestioneazaGrupItem={setGestioneazaGrupItem} derivedKey={key} />}
            {gestioneazaGrupItem && optiuneGrup === "itemigrup" && <GroupItmes item={gestioneazaGrupItem} setGestioneazaGrupItem={setGestioneazaGrupItem} derivedKey={key} />}
            {stergeGrupPop && <PopupStergeGrupDefinitiv setStergeGrupPopup={setStergeGrupPopup} item={idGrupDeEliminat} fetchItems={fetchGroups} />}
        </>
    );
};


export default GrupuriPage;