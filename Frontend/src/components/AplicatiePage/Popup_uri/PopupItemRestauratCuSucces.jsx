import React from "react";
import { FaCheckCircle } from 'react-icons/fa';

const PopupItmeRestauratCuSucces = () => {
    return (
        <>
            <div className="inset-0 flex justify-center items-center bg-opacity-0 bg-gray-400 z-50">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-72 sm:w-72 md:w-72 p-2 flex flex-row items-center justify-center relative">
                    <h2 className="text-md sm:text-xl font-semibold text-center">Item restaurat cu succes!</h2>
                    <FaCheckCircle className="ml-2 text-green-400 text-xl" />
                </div>
            </div>
        </>
    );
};
export default PopupItmeRestauratCuSucces;