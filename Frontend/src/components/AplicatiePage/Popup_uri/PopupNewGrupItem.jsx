import React from "react";

import ParolaLogo from "../../../assets/website/password2.png";
import CardLogo from "../../../assets/website/credit-card2.png";
import NoteLogo from "../../../assets/website/note2.png";
import Address from '../../../assets/website/address.png'
import RemoteWorking from "../../../assets/website/remote-working.png"

const PopupNewGrupItem = ({ setShowParolaPopup, setShowNotitaPopup, setShowCardPopup, setShowAdresaPopup, setShowRemotePopup, setPopupVisible }) => {

    const handleMeniuParolaItem = () => {
        setPopupVisible(false);
        setShowParolaPopup(true);

    };
    const handleMeniuNotitaItem = () => {
        setPopupVisible(false);
        setShowNotitaPopup(true);
    }

    const handleMeniuCardItem = () => {
        setPopupVisible(false);
        setShowCardPopup(true);
    }

    const handleMeniuAdresaItem = () => {
        setPopupVisible(false);
        setShowAdresaPopup(true);
    }

    const handleMeniuRemoteItem = () => {
        setPopupVisible(false);
        setShowRemotePopup(true);
    }

    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-3/5  md:w-6/7 h-2/3 sm:h-1/3  flex flex-col items-center justify-center relative">
                    <button className="absolute right-4 top-2 text-4xl cursor-pointer hover:text-red-300" onClick={() => setPopupVisible(false)}>&times;</button>

                    <h3 className="font-semibold text-center text-2xl mb-6">Item nou</h3>
                    <ul className="grid grid-cols-1 gap-4 sm:flex md:space-x-4 justify-center  ml-2 mr-2">
                        <div className="flex flex-col">
                            <li onClick={handleMeniuParolaItem} className="hover:bg-green-500 cursor-pointer p-4 hover:rounded-lg flex flex-row items-center">
                                <img src={ParolaLogo} alt="Parola Logo" className="w-8 h-8 -ml-2 mr-1" />
                                <span className="text-xl">Parolă</span>
                            </li>
                            <li onClick={handleMeniuNotitaItem} className="hover:bg-green-500 cursor-pointer p-4 hover:rounded-lg flex flex-row items-center">
                                <img src={NoteLogo} alt="Notiță Logo" className="w-8 h-8 -ml-2 mr-1" />
                                <span className="text-xl">Notiță</span>
                            </li>
                        </div>
                        <div className="flex flex-col">
                            <li onClick={handleMeniuCardItem} className="hover:bg-green-500 cursor-pointer p-4 hover:rounded-lg flex flex-row items-center">
                                <img src={CardLogo} alt="Card Logo" className="w-8 h-8 -ml-2 mr-1" />
                                <span className="text-xl">Card</span>
                            </li>
                            <li onClick={handleMeniuAdresaItem} className="hover:bg-green-500 cursor-pointer p-4 hover:rounded-lg flex flex-row items-center">
                                <img src={Address} alt="Card Logo" className="w-8 h-8 -ml-2 mr-1" />
                                <span className="text-xl">Adresă</span>
                            </li>
                        </div>
                        <div className="flex flex-col">
                            <li onClick={handleMeniuRemoteItem} className="hover:bg-green-500 cursor-pointer py-4 px-4 hover:rounded-lg flex flex-row items-center">
                                <img src={RemoteWorking} alt="Card Logo" className="w-8 h-8 -ml-2 mr-1" />
                                <span className="text-xl">Remote</span>
                            </li>
                            <li className="flex flex-row items-center">

                            </li>
                        </div>


                    </ul>
                </div>
            </div>
        </>
    );
};

export default PopupNewGrupItem;
