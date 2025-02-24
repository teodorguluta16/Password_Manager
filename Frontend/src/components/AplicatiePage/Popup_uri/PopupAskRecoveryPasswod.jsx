import React from "react";


const PopupAskRecoveryPasswod = ({ setpopupActiveazaRcovery, accessToken, setOpenPopupRecovery }) => {


    const handleDeschidePopupRecuperare = async () => {
        setOpenPopupRecovery(true);

    };

    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex flex-col items-center justify-center shadow-lg">
                <div className="bg-white rounded-lg shadow-lg max-w-md md:w-96 p-6 flex flex-col items-center justify-center relative">
                    <button className="absolute top-2 right-2 text-4xl cursor-pointer hover:text-red-300" onClick={() => setpopupActiveazaRcovery(false)}>&times;</button>
                    <h2 className="text-xl font-semibold text-center mb-4">Recuperează cont !</h2>
                    <span className="text-center text-sm "> * Adaugă o cheie de recuperare a contului în cazul pierderii parolei master</span>
                    <button onClick={() => { handleDeschidePopupRecuperare(); setpopupActiveazaRcovery(false); }} className="bg-blue-500 rounded-lg mt-4 py-2 px-4 hover:bg-yellow-600 text-white transition-all duration-200">OK</button>
                </div>
            </div >

        </>
    );
};

export default PopupAskRecoveryPasswod;