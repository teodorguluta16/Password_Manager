import React from "react";
import { useState } from 'react';

import ListIcon from "../../../assets/website/list.png"
import GridIcon from "../../../assets/website/visualization.png"


const AdresePage = ({ accessToken }) => {
    const [isDeschisMeniuSortare, setIsDropdownOpen] = useState(false);
    const [OptiuneSelectata, setSelectedOption] = useState("Sortează după: Nume");

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDeschisMeniuSortare);
    };

    const handleOptionSelect = (optiune) => {
        setSelectedOption(optiune);
        setIsDropdownOpen(false);
    };
    return (
        <>
            <div>
                <h2 className="font-bold text-2xl text-center mt-6">Adrese</h2>
                <div className="block md:flex justify-between items-center mx-6 mt-4">
                    {/*Sectiunea de vizualizare a datelor*/}
                    <div className="flex space-x-2">
                        <button className="flex items-center px-2 space-x-2 py-2 rounded-lg bg-gray-100 ml-2 hover:bg-yellow-400">
                            <img src={ListIcon} alt="List Icon" className="w-6 h-6"></img>
                        </button>
                        <button className="flex items-center px-2 space-x-2 py-2 rounded-lg bg-gray-100 ml-2 hover:bg-yellow-400">
                            <img src={GridIcon} alt="List Icon" className="w-6 h-6"></img>
                        </button>
                    </div>

                    {/* Sectiunea de sortare */}
                    <div className="relative">
                        {/*Buton de deschidere meniu select*/}
                        <button className="flex items-center px-4 space-x-2 py-2 rounded-lg bg-gray-100 mr-2" onClick={() => handleDropdownToggle()}>
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

                <hr className="border-t-3 border-gray-500 my-4 rounded-full mx-12" />
            </div>
        </>
    );
};
export default AdresePage;