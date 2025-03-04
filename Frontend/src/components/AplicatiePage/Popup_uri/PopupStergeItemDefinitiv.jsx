import React from "react";

const PopupStergeItemDefinitiv = ({ setShowPopupStergeItem, item, items, fetchItems }) => {

    const handleStergeItem = async () => {
        setShowPopupStergeItem(false);

        try {
            const response = await fetch('http://localhost:9000/api/utilizator/stergeItemDefinitiv', {
                method: 'DELETE', headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ id_item: item.id_item }),
                credentials: "include"
            });

            if (response.ok) {
                console.log('Item șters definitiv!');
                await fetchItems();
            } else {
                console.error('Eroare la ștergerea item-ului:', response.statusText);
            }
        } catch (error) {
            console.error('Eroare:', error);
        }

    };


    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex flex-col items-center justify-center shadow-lg">
                <div className="bg-white rounded-lg shadow-lg max-w-md md:w-96 p-6 flex flex-col items-center justify-center relative">
                    <button className="absolute top-2 right-2 text-4xl cursor-pointer hover:text-red-300" onClick={() => setShowPopupStergeItem(false)}>&times;</button>
                    <h2 className="text-xl md:text-2xl font-semibold text-center mb-4">Confirmă Ștergerea !</h2>
                    <span className="text-center text-md "> * Elementul va fi șters definitiv !</span>
                    <button onClick={handleStergeItem} className="bg-red-500 rounded-lg mt-4 py-2 px-4 hover:bg-yellow-500 text-white transition-all duration-200">OK</button>
                </div>
            </div >
        </>
    );
};

export default PopupStergeItemDefinitiv;