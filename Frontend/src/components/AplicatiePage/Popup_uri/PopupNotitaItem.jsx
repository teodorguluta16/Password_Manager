import React from "react";
import { useState } from "react";

const PopupNotitaItem = ({ setShowNotitaPopup }) => {

    const [numeItem, setNumeItem] = useState('');
    const [date, setDateItem] = useState('');
    const [comentariuItem, setComentariuItem] = useState('');

    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-4/5 md:w-1/2 p-6 flex flex-col items-center justify-center relative">
                    <button className="absolute right-2 top-2 text-4xl cursor-pointer hover:text-red-300" onClick={() => setShowNotitaPopup(false)}>&times;</button>
                    <h3 className="text-xl font-semibold text-center mb-6 mt-3">Notiță Nouă</h3>
                    <form className="flex flex-col items-left w-full gap-2">

                        <label className="text-md font-medium">Nume</label>
                        <input type="name" value={numeItem} onChange={(e) => { setNumeItem(e.target.value) }} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full"></input>

                        <label className="text-md font-medium">Data</label>
                        <input type="date" value={date} onChange={(e) => { setDateItem(e.target.value) }} className="mt-2 border py-1 px-2 border-gray-600 rounded-md w-full cursor-pointer"></input>

                        <label className="text-md font-medium">Adauga un comentariu</label>
                        <textarea type="note" value={comentariuItem} onChange={(e) => { setComentariuItem(e.target.value) }} className="mt-2 border py-1 px-2 border-gray-600 border-1 rounded-md w-full h-32 max-h-64"></textarea>
                    </form>
                </div>
            </div>
        </>
    );
};

export default PopupNotitaItem;