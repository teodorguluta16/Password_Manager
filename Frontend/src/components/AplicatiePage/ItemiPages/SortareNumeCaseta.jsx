import React from "react";
import { useState } from "react";

const SortareNumeCaseta = ({ OptiuneSelectata }) => {

    return (
        <>
            {/* Secțiune de sortare aliniată la dreapta */}
            <div className="flex justify-end mt-6 mr-3">
                <div className="">
                    {/*Buton de deschidere meniu select*/}
                    <button className="flex items-center px-4 py-2 border border-gray-400 rounded bg-white">
                        {/* Model iconita sagetuta al meniului de select*/}
                        <span className="text-xl font-medium">{OptiuneSelectata}</span>
                        <svg
                            className={`w-4 h-4 transform transition-transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}  /* Pentru rotatie*/
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>

                    </button>
                </div>
            </div>
        </>
    );
};

export default SortareNumeCaseta;
