import React from "react";


import PeopleLogo from "../../../assets/website/people.png";
import ParolaLogo from "../../../assets/website/password2.png";
import CardLogo from "../../../assets/website/credit-card2.png";
import NoteLogo from "../../../assets/website/note2.png";
import RemoteLogo from "../../../assets/website/remote-access.png"
import AdressLogo from "../../../assets/website/map-and-location.png"

import LaunchLogo from "../../../assets/website/launch.png"
import FavoriteLogo from "../../../assets/website/favorite.png"
import DeleteIcon from "../../../assets/website/delete.png"

// Aici afisez itemii in format pe coloane
const GridAfisGroupItems = ({ items, setGestioneazaItem, setStergeItem, setItemid }) => {
    return (
        <div className="grid custom_grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10 md:gap-12 ml-2 mr-2 px-8 sm:px-4 md:px-12 custom-height overflow-y-auto py-8 -mt-4">
            {items.map((item, index) => (
                <div key={index} onClick={() => setGestioneazaItem(item)} className="border border-white-700 rounded-lg w-68 h-24 shadow-lg shadow-gray-300 bg-yellow-100 items-center hover:bg-gray-400 cursor-pointer group  transition-all duration-300 ease-in-out">
                    <div className="flex flex-col justify-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100 space-x-2 relative">
                        <button onClick={(e) => { e.stopPropagation(); }} className="absolute mt-6 right-2 border border-white bg-white rounded-lg px-2 py-1 hover:bg-blue-300">
                            <img src={LaunchLogo} alt="Launch Logo" className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); }} className="absolute mt-20 right-2 border border-white bg-white rounded-lg px-2 py-1 hover:bg-yellow-400">
                            <img src={FavoriteLogo} alt="Favorite Logo" className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setStergeItem(true); setItemid(item) }} className=" absolute mt-36 right-2 border border-white bg-white rounded-lg px-2 py-1 hover:bg-red-400">
                            <img src={DeleteIcon} alt="Delete Logo" className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="mt-2 ml-2 items-center justify-center h-full">
                        <div className="flex flex-row items-center py-2">

                            <img src={item.tipitem === 'password' ? ParolaLogo : item.tipitem === 'notita' ? NoteLogo : item.tipitem === 'card' ? CardLogo : item.tipitem === "remoteConnexion" ? RemoteLogo : item.tipitem === 'adresa' ? AdressLogo : PeopleLogo} alt="Logo Parola Item" className="w-8 h-8 mr-2"></img>
                            {(item.tipitem === "notita" || item.tipitem === "adresa") && (
                                <h2 className="mt-2">{item.nume}</h2>
                            )}
                            {(item.tipitem === "password" || item.tipitem === "remoteConnexion") && (
                                <div className="flex flex-col ml-2">
                                    <h2 >{item.nume}</h2>
                                    <h2 className="text-sm">{item.username}</h2>
                                </div>

                            )}
                            {(item.tipitem === "card") && (
                                <div className="flex flex-col ml-2 -mt-2 ">
                                    <h2 className="text-md">{item.nume}</h2>
                                    <h2 className="text-sm">{item.posesorCard}</h2>
                                </div>

                            )}

                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GridAfisGroupItems;