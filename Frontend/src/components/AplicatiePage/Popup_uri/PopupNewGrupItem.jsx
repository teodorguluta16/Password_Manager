import React from "react";
import { useState } from "react";

import PeopleLogo from "../../../assets/website/people.png";
import ParolaLogo from "../../../assets/website/password2.png";
import CardLogo from "../../../assets/website/credit-card2.png";
import NoteLogo from "../../../assets/website/note2.png";




const PopupNewGrupItem = ({ setShowParolaPopup, setShowNotitaPopup, setPopupVisible }) => {

    const handleMeniuParolaItem = () => {
        setPopupVisible(false);
        setShowParolaPopup(true);

    };
    const handleMeniuNotitaItem = () => {
        setPopupVisible(false);
        setShowNotitaPopup(true);
    }

    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-3/5 md:w-2/4 h-2/5 md:h-1/5  flex flex-col items-center justify-center relative">
                    <button className="absolute right-4 top-2 text-4xl cursor-pointer hover:text-red-300" onClick={() => setPopupVisible(false)}>&times;</button>

                    <h3 className="font-semibold text-center text-2xl mb-6">Item nou</h3>
                    <ul className="grid grid-cols-1 gap-4 sm:flex md:space-x-4 justify-center  ml-2 mr-2">
                        <li onClick={handleMeniuParolaItem} className="hover:bg-green-500 cursor-pointer p-4 hover:rounded-lg flex flex-row items-center">
                            <img src={ParolaLogo} alt="Parola Logo" className="w-8 h-8 -ml-2 mr-1" />
                            <span className="text-xl">Parolă</span>
                        </li>
                        <li onClick={handleMeniuNotitaItem} className="hover:bg-green-500 cursor-pointer p-4 hover:rounded-lg flex flex-row items-center">
                            <img src={NoteLogo} alt="Notiță Logo" className="w-8 h-8 -ml-2 mr-1" />
                            <span className="text-xl">Notiță</span>
                        </li>
                        <li className="hover:bg-green-500 cursor-pointer p-4 hover:rounded-lg flex flex-row items-center">
                            <img src={CardLogo} alt="Card Logo" className="w-8 h-8 -ml-2 mr-1" />
                            <span className="text-xl">Card</span>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default PopupNewGrupItem;
