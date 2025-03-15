import React from "react";
import { useState, useEffect } from 'react';
import ArrowBack from "../../../assets/website/back.png"
import { FaPlus, FaClipboard, FaPlusCircle, FaPlusSquare, FaUserPlus } from 'react-icons/fa';
import "../../../App.css"

import { FaEye, FaEyeSlash, FaCopy, FaEdit, FaSave, FaArrowLeft, FaUserMinus } from 'react-icons/fa';
import PopupNewUtilizatorGrup from '../Popup_uri/PopupNewUtilizatorGrup.jsx'
import PopupEliminaUtilizatorGrup from "../Popup_uri/PopupEliminaUtilizatorGrup.jsx";

const EditGrupItem = ({ item, setGestioneazaGrupItem, derivedKey }) => {
    const [key, setKey] = useState(derivedKey);
    let idgrup = item.id_grup;

    useEffect(() => {
        if (derivedKey) {
            setKey(derivedKey);
        }
    }, [derivedKey]);

    const [createdDate, setCreatedDate] = useState("");
    const [popupUtilizatorNou, setPopupUtilizatorNou] = useState(false);
    const [afismembriGrup, setAfisIstoric] = useState(false);
    const [membriGrup, setMembriiGrup] = useState([]);
    const [ownerGrup, setOwnerGrup] = useState([]);
    const [numeOwner, setnumeOwner] = useState("");
    const [prenumeOwner, setprenumeOwner] = useState("");
    const [emailOwner, setemailOwner] = useState("");


    useEffect(() => {
        const dateObject = new Date(item.created_at);
        const formattedDate = dateObject.toLocaleString();
        setCreatedDate(formattedDate);
    }, [item.created_at]);

    const openPopupNewUtilizator = () => {
        setPopupUtilizatorNou(true);
    };

    const handleVizualizareMembriiGrup = async () => {
        try {
            const response = await fetch('http://localhost:9000/api/grupuri/getGroupMembersforOwner', {
                method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify({ idgrup }),
                credentials: "include"
            });

            //if (!response.ok) { throw new Error('Cererea nu a reusit!'); } // aici tre sa modific putin erorile 

            const data = await response.json();
            setMembriiGrup(data);
        } catch (error) {
            console.error('Eroare:', error);
        }
    };
    const handleVizualizareOwnerGrup = async () => {
        try {
            const response = await fetch('http://localhost:9000/api/grupuri/getGroupOwnerDetails', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idgrup }),
                credentials: "include"
            });

            if (!response.ok) { throw new Error('Cererea nu a reusit!'); }

            const data = await response.json();
            setOwnerGrup(data[0]);
        } catch (error) {
            console.error('Eroare:', error);
        }
    };

    useEffect(() => {
        handleVizualizareMembriiGrup();
    }, [item]);

    useEffect(() => {
        handleVizualizareOwnerGrup();
    }, [item]);


    const [popupEliminaUt, setPopupEliminaUtilizatorGrup] = useState(false);

    return (
        <>
            <div className="py-4 px-12 mb-2 mt-3">
                <button onClick={() => setGestioneazaGrupItem(null)} className="px-1 cursor-pointer rounded-lg -ml-4  mt-2">
                    <FaArrowLeft className="w-8 h-8 hover:text-blue-600 transition-all duration-300 ease-in-out" />
                </button>

                <h2 className="text-center text-3xl font-bold  text-gray-700 -mt-2">{item.nume}</h2>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-x-4 mt-6">
                    <div className="flex-1">
                        <h4 className="font-semibold text-xl">Descriere</h4>
                        <span className="text-md">{item.descriere}</span>
                        <h4 className="font-semibold text-xl mt-2">Creat</h4>
                        <div className="">
                            <div className="space-x-2">
                                <span className="text-gray-700 text-md">{createdDate}</span>
                            </div>
                        </div>
                        <h4 className="font-semibold text-xl mt-2">Proprietar</h4>
                        <div className="flex flex-col">
                            <span className="text-md">{`${ownerGrup.nume} ${ownerGrup.prenume}`}</span>
                            <span className="italic text-md">{ownerGrup.email}</span>

                        </div>

                        <h4 className="font-semibold text-xl mt-2">Numar membrii</h4>
                        <span>12</span>
                        <h4 className="font-semibold text-xl mt-2">Total itemi</h4>
                        <span>14</span>
                    </div >

                    <div className="flex-1">
                        {/*Membri grup */}
                        <div className='sm:items-center w-full mb-8 sm:justify-center custom_top_istoric'>
                            <h4 className="font-semibold text-xl">Membrii</h4>
                            <div className="flex space-x-2 sm:justify-start mt-2">
                                <button onClick={openPopupNewUtilizator}>
                                    <FaUserPlus className="w-7 h-7 hover:text-blue-600 transition-all duration-300 ease-in-out" />
                                </button>
                                <h2 className="text-gray-700 cursor-pointer hover:underline text-gray-400" onClick={() => setAfisIstoric(!afismembriGrup)}>{afismembriGrup ? 'Ascunde' : 'Afiseaza'}</h2>

                            </div>
                            {afismembriGrup && (<div>{membriGrup.length > 0 ? (<div className="h-64 overflow-y-auto border rounded-lg shadow-lg border-gray-300 border-2 bg-white mt-2">
                                {membriGrup.map((it, index) => (
                                    <div key={index} className="py-0 mx-2">
                                        <div className="flex flex-row justify-between items-center">
                                            <div>
                                                <span className="font-semibold">{`${it.nume} ${it.prenume}`}</span>
                                                <div className="flex space-x-2">
                                                    <span className="text-sm italic text-gray-600">{it.email}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => setPopupEliminaUtilizatorGrup(true)} className="text-red-300 hover:text-red-700 transition-all duration-300 ease-in-out ">
                                                <FaUserMinus className="w-7 h-7" />
                                            </button>
                                            {popupEliminaUt && <PopupEliminaUtilizatorGrup setPopupEliminaUtilizatorGrup={setPopupEliminaUtilizatorGrup} idgrup={item.id_grup} idUtilizator={it.id} handleVizualizareMembriiGrup={handleVizualizareMembriiGrup} />}
                                        </div>
                                        <hr className="border-t-2 border-blue-400 my-1 rounded-full"></hr>
                                    </div>
                                ))}
                            </div>
                            ) : (<p className="text-gray-600">Niciun membru adaugat</p>
                            )}</div>)}
                        </div>
                    </div>
                </div>


            </div>
            {popupUtilizatorNou && <PopupNewUtilizatorGrup setPopupUtilizatorNou={setPopupUtilizatorNou} idgrup={item.id_grup} encryptedprivategroupkey={item.encryptedprivategroupkey} derivedKey={key} handleVizualizareMembriiGrup={handleVizualizareMembriiGrup} />}

        </>
    );
};

export default EditGrupItem;