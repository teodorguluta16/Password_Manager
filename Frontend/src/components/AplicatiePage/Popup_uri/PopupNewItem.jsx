import React from "react";
import { useState } from "react";

import PeopleLogo from "../../../assets/website/people.png";
import ParolaLogo from "../../../assets/website/password2.png";
import CardLogo from "../../../assets/website/credit-card2.png";
import NoteLogo from "../../../assets/website/note2.png";
import Address from '../../../assets/website/address.png'


const PopupNewItem = ({ setShoMeniuCreeazaItem, setShowParolaPopup, setShowNotitaPopup }) => {

  const handleCursorAfara = (e) => {
    if (e.target === e.currentTarget) {
      setShoMeniuCreeazaItem(false);

    }
  };

  const handleMeniuParolaItem = () => {
    setShoMeniuCreeazaItem(false);
    setShowParolaPopup(true);

  };
  const handleMeniuNotitaItem = () => {
    setShoMeniuCreeazaItem(false);
    setShowNotitaPopup(true);
  }

  return (
    <>
      <div onClick={handleCursorAfara} className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4 md:w-96">
          <h3 className="text-xl font-semibold text-center mb-6">Alege un item nou</h3>
          <ul className="grid grid-cols-2 gap-4 md:flex md:space-x-2 justify-center ">
            <li onClick={handleMeniuParolaItem} className="hover:bg-green-500 cursor-pointer p-4 hover:rounded-lg flex flex-col items-center ml-1">
              <img src={ParolaLogo} alt="Parola Logo" className="w-10 h-10 mb-2" />
              <span>Parolă</span>
            </li>
            <li onClick={handleMeniuNotitaItem} className="hover:bg-green-500 cursor-pointer p-4 hover:rounded-lg flex flex-col items-center">
              <img src={NoteLogo} alt="Notiță Logo" className="w-10 h-10 mb-2" />
              <span>Notiță</span>
            </li>
            <li className="hover:bg-green-500 cursor-pointer p-4 hover:rounded-lg flex flex-col items-center">
              <img src={CardLogo} alt="Card Logo" className="w-10 h-10 mb-2" />
              <span>Card</span>
            </li>
            <li className="hover:bg-green-500 cursor-pointer p-4 hover:rounded-lg flex flex-col items-center">
              <img src={Address} alt="Grup Logo" className="w-10 h-10 mb-2" />
              <span>Adresă</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default PopupNewItem;
