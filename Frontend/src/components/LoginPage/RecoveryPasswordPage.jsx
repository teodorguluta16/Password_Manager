import React, { useState } from "react";

const RecoveryPasswordPage = () => {

    const [casetaTrimiteCod, setCasetaTrimiteCod] = useState(true);
    const [casetaCod, setCasetaCod] = useState(false);
    const [casetaCheieRecuperare, setCasetaCheieRecuperare] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [schimbareParola, setCasetaSchimbareParola] = useState(false);

    const [parolaNoua, setParolaNoua] = useState('');
    const [confirmaParolaNoua, setConfirmaParolaNoua] = useState('');

    const recuperareSection = () => {
        setCasetaTrimiteCod(false);
        setCasetaCheieRecuperare(true);
    };
    const recuperareSection2 = () => {
        //setCasetaTrimiteCod(false);
        //setCasetaCheieRecuperare(true);
    };

    const [cheiaRecuperare, setCheiaRecuperare] = useState('');
    const handleCheiaRecuperareChange = (event) => {
        setCheiaRecuperare(event.target.value);
        setErrorMessage('');
    };
    const recuperareSection3 = (event) => {
        event.preventDefault();
        if (cheiaRecuperare.trim() === '') {
            setErrorMessage('Te rugăm să completezi câmpul cu cheia de recuperare.');
            return;
        }
        console.log('Cheia de recuperare este:', cheiaRecuperare);
        setErrorMessage('');
        setCasetaCheieRecuperare(false);

        try {

        } catch (error) {
            console.error("eroare:", error);
        }
        setCasetaSchimbareParola(true);
    };
    const recuperareSection4 = (event) => {
        event.preventDefault();
        if (parolaNoua.trim() === '') {
            setErrorMessage('Completează toate câmpurile !');
            return;
        }
        if (confirmaParolaNoua.trim() === '') {
            setErrorMessage('Completează toate câmpurile !');
            return;
        }
        setErrorMessage('');
        console.log("DAAAAAAAAAA");
    };

    const handleParolaNouaChange = (event) => {
        setParolaNoua(event.target.value);
        setErrorMessage('');
    };
    const handleConfirmaParolaNouaChange = (event) => {
        setConfirmaParolaNoua(event.target.value);
        setErrorMessage('');
    };

    return (
        <div className="h-screen bg-gradient-to-r from-green-900 via-gray-700 to-black flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-5/6 sm:w-full max-w-md">
                {casetaTrimiteCod && (<>
                    <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Recuperare Parolă</h2>
                    <form className="space-y-4">
                        <div>
                            <input type="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Introdu adresa de email" />
                        </div>
                        <div className="flex justify-center items-center">
                            <button onClick={recuperareSection} type="submit" className="w-3/4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400">
                                Trimite Codul de Resetare
                            </button>
                        </div>
                    </form>
                </>
                )}
                {casetaCheieRecuperare && (<>
                    <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Introdu cheia de recuperare</h2>
                    <form className="space-y-4">
                        <div>
                            <input type="text" id="text" onChange={handleCheiaRecuperareChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="" />
                        </div>
                        {errorMessage && (
                            <p className="text-red-500 text-sm">{errorMessage}</p>
                        )}
                        <div className="flex justify-center items-center">
                            <button onClick={recuperareSection3} type="submit" className="w-3/4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400">
                                Resetează Parola
                            </button>
                        </div>
                    </form>
                </>
                )}
                {schimbareParola && (<>
                    <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Resetează Parola</h2>
                    <form className="space-y-4">
                        <div>
                            <h2>Introu noua parolă</h2>
                            <input type="password" id="password1" onChange={handleParolaNouaChange} className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="" />
                            <h2>Confirmă parola</h2>
                            <input type="password" id="password2" onChange={handleConfirmaParolaNouaChange} className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="" />
                        </div>
                        {errorMessage && (
                            <p className="text-red-500 text-sm flex justify-center items-center">{errorMessage}</p>
                        )}
                        <div className="flex justify-center items-center">
                            <button onClick={recuperareSection4} type="submit" className="w-3/4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400">
                                Resetează Parola
                            </button>
                        </div>
                    </form>
                </>
                )}

            </div>
        </div>
    );
};

export default RecoveryPasswordPage;
