import React, { useState, useEffect } from "react";
import ListIcon from "../../../assets/website/list.png"
import GridIcon from "../../../assets/website/visualization.png"
import { FaPlus, FaClipboard, FaSignOutAlt } from 'react-icons/fa';
import PopupNewPuttyConnection from "../Popup_uri/PopupNewPuttyConnection";

import "../../../App.css"
import GridAfisItems from "./GridAfisItems";
import PopupStergeItem from "../Popup_uri/PopupStergeItem";
import EditRemoteItem from './EditRemoteItem';


const RemoteWorking = ({ derivedKey, items, fetchItems }) => {
    const [key, setKey] = useState(derivedKey);

    useEffect(() => {
        if (derivedKey) {
            setKey(derivedKey);
        }
    }, [derivedKey]);

    console.log("Cheia simetrică este: ", key);

    const [isDeschisMeniuSortare, setIsDropdownOpen] = useState(false);
    const [OptiuneSelectata, setSelectedOption] = useState("Sortează după: Nume");

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDeschisMeniuSortare);
    };

    const handleOptionSelect = (optiune) => {
        setSelectedOption(optiune);
        setIsDropdownOpen(false);
    };

    const [gestioneazaRemoteItem, setGestioneazaRemoteItem] = useState(null);
    const [tipAfisare, setTipAfisare] = useState("grid");
    const [stergeItem, setStergeItem] = useState(false);
    const [itemid, setItemid] = useState("");

    const [popupNewRemote, setPopupNewRemote] = useState(false);
    useEffect(() => {
        fetchItems();
    }, []);

    const openPopup = () => {
        setPopupNewRemote(true);
    };
    return (
        <>
            <div className="bg-gray-100">
                {gestioneazaRemoteItem === null && (
                    <>
                        <h2 className="font-bold text-2xl text-center mt-3">Conexiunile mele</h2>
                        <div className="flex flex-row aliniere_custom justify-between items-center mx-6 mt-6">
                            {/*Sectiunea de vizualizare a datelor */}
                            <div className="flex space-x-2">
                                <button onClick={() => setTipAfisare("lista")} className="flex items-center px-2 space-x-2 py-2 rounded-lg bg-gray-100 ml-2 hover:bg-yellow-400">
                                    <img src={ListIcon} alt="List Icon" className="w-6 h-6"></img>
                                </button>
                                <button onClick={() => setTipAfisare("grid")} className="flex items-center px-2 space-x-2 py-2 rounded-lg bg-gray-100 ml-2 hover:bg-yellow-400">
                                    <img src={GridIcon} alt="List Icon" className="w-6 h-6"></img>
                                </button>
                                <div onClick={openPopup} className="relative flex justify-center">
                                    <button className="flex px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-800">
                                        <FaPlus className="w-5 h-5" />
                                        <span className="ml-2">Adaugă Conexiune</span>
                                    </button>
                                </div>
                            </div>

                            {/* Secțiunea de sortare */}
                            <div className="relative">
                                <button className="flex items-center px-4 space-x-2 py-2 rounded-lg bg-gray-100 md:mr-2" onClick={() => handleDropdownToggle()}>
                                    <span className="text-1xl font-semibold">{OptiuneSelectata}</span>
                                    <svg
                                        className={`w-4 h-4 transform transition-transform ${isDeschisMeniuSortare ? 'rotate-180' : 'rotate-0'}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {isDeschisMeniuSortare && (
                                    <div className="absolute border rounded-lg bg-white shadow-lg w-full mt-2">
                                        <ul className="py-2">
                                            <li className="px-4 py-2 cursor-pointer hover:bg-yellow-400" onClick={() => handleOptionSelect("Sortează după: Nume ")}>Nume</li>
                                            <li className="px-4 py-2 cursor-pointer hover:bg-yellow-400" onClick={() => handleOptionSelect("Sortează după: Data ")}>Data Adaugarii</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                        <hr className="border-t-2 border-gray-500 my-2 rounded-full mx-6" />
                    </>
                )}

                {/* Sectiunea de itemi Parola */}
                {gestioneazaRemoteItem === null ? (
                    tipAfisare === "lista" ? (
                        <ListAfisItems
                            items={items}
                            setGestioneazaRemoteItem={setGestioneazaRemoteItem}
                            setStergeItem={setStergeItem}
                            setItemid={setItemid}
                            fetchItems={fetchItems}
                        />
                    ) : tipAfisare === "grid" ? (
                        <GridAfisItems
                            items={items}
                            setGestioneazaItem={setGestioneazaRemoteItem}
                            setStergeItem={setStergeItem}
                            setItemid={setItemid}
                            fetchItems={fetchItems}
                        />
                    ) : null
                ) : (
                    <EditRemoteItem
                        item={gestioneazaRemoteItem}
                        setGestioneazaRemoteItem={setGestioneazaRemoteItem}
                    />
                )}

                {/*Popup de Stergere item */}
                {stergeItem && (
                    <PopupStergeItem
                        setShowPopupStergeItem={setStergeItem}
                        item={itemid}
                        items={items}
                        fetchItems={fetchItems}
                    />
                )}
            </div>
            {popupNewRemote && <PopupNewPuttyConnection setPopupNewRemote={setPopupNewRemote} derivedKey={key} fetchItems={fetchItems} />}
        </>
    );
};

export default RemoteWorking;
