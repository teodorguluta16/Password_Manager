import React from "react";
import { useState, useEffect } from 'react';
import ArrowBack from "../../../assets/website/back.png"
import { FaPlus, FaClipboard, FaPlusCircle, FaPlusSquare, FaUserPlus } from 'react-icons/fa';
import "../../../App.css"

import { FaEye, FaEyeSlash, FaCopy, FaEdit, FaSave, FaArrowLeft } from 'react-icons/fa';
import PopupNewGrupItem from '../Popup_uri/PopupNewGrupItem.jsx'
import PopupNewGrupParola from "../Popup_uri/PopupNewGrupParola.jsx";


const GroupItmes = ({ item, setGestioneazaGrupItem, accessToken, derivedKey }) => {
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
    //const [ShowNotitaPopup, setShowNotitaPopup] = useState(false);

    return (
        <>
            <div className=" py-4 px-12 mb-2">
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

                <h2 className="text-center text-3xl font-bold  text-gray-700">{item.nume}</h2>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-x-4 mt-2">

                </div>

                {/* Popup-ul care apare când este apăsat butonul */}
                {popupVisible && (<PopupNewGrupItem setPopupVisible={setPopupVisible} setShowParolaPopup={setShowParolaPopup} />)}
                {ShowParolaPopup && (<PopupNewGrupParola setShowParolaPopup={setShowParolaPopup} accessToken={accessToken} derivedKey={key} idgrup={idgrup} />)}
            </div>
        </>
    );
};

export default GroupItmes;