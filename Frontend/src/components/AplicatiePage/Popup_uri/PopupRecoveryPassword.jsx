import React from "react";
import { FaCheckCircle, FaCopy, FaExclamationTriangle } from "react-icons/fa";
import * as bip39 from 'bip39';

import { Buffer } from 'buffer';
if (!window.Buffer) {
    window.Buffer = Buffer;
}
const generateRecoveryKey = () => {
    const mnemonic = bip39.generateMnemonic(256);
    return mnemonic;
};
const PopupRecoveryPassword = ({ accessToken, setOpenPopupRecovery }) => {
    const recoveryKey = generateRecoveryKey();
    const handleCopy = () => {
        navigator.clipboard.writeText(recoveryKey)
            .then(() => {
                console.log("Text copiat cu succes!");
            })
            .catch((err) => {
                console.error("Eroare la copiere: ", err);
            });
    };

    const handleDownloadPDF = () => {
        console.log("S-a apăsat butonul de descărcare ca PDF");
    };
    const handleDeschidePopupRecuperare = async () => {
        setpopupActiveazaRcovery(false);
        setOpenPopupRecovery(false);

        /*try {
            const response = await fetch('http://localhost:9000/api/stergeItem', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ id_item: item.id_item }),
            });

            if (response.ok) {
                console.log('Item marcat ca șters!');
                await fetchItems();
            } else {
                console.error('Eroare la ștergerea item-ului:', response.statusText);
            }
        } catch (error) {
            console.error('Eroare:', error);
        }*/
    };


    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-96 md:w-96 h-1/2 md:h-1/2 p-6 flex flex-col items-center justify-center relative">
                    <button className="absolute right-4 top-2 text-4xl cursor-pointer hover:text-red-300" onClick={() => setOpenPopupRecovery(false)}>&times;</button>
                    <div className="flex flex-row">
                        <h2 className="text-lg font-semibold text-center mb-4">Cheie generată cu succes !</h2>
                        <FaCheckCircle className="ml-2 text-green-400 text-xl mt-1" />
                    </div>
                    <div className="flex flex-row">
                        <FaExclamationTriangle className="ml-2 text-yellow-500 text-xl mt-0" />
                        <h3 className="italic text-sm text-center mb-4 ml-2">Asigură-te că salvezi cheia într-un loc sigur și accesibil pentru tine</h3>
                    </div>
                    <div className="border border-black p-4 w-full text-center mb-4"><p>{recoveryKey}</p></div>
                    <div className="flex flex-row justify-center gap-4 mb-4">
                        <button onClick={handleCopy} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                            <FaCopy />Copy
                        </button>
                        <button onClick={handleDownloadPDF} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                            Descarcă ca PDF
                        </button>
                    </div>
                    <button onClick={() => setOpenPopupRecovery(false)} className="bg-purple-600 hover:bg-purple-800 text-white py-2 px-4 rounded">
                        OK
                    </button>
                </div>
            </div>
        </>
    );
};

export default PopupRecoveryPassword;