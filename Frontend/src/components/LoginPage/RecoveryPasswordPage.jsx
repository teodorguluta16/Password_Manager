import React, { useState } from "react";
import { criptareDate, generateKey, decodeMainKey, decriptareDate, exportKey } from "../FunctiiDate/FunctiiDefinite"
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

function hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}
const RecoveryPasswordPage = () => {
    const navigate = useNavigate();
    const [casetaTrimiteCod, setCasetaTrimiteCod] = useState(true);
    const [casetaCod, setCasetaCod] = useState(false);
    const [casetaCheieRecuperare, setCasetaCheieRecuperare] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setsuccessMessage] = useState('');
    const [schimbareParola, setCasetaSchimbareParola] = useState(false);

    const [email, setEmail] = useState('');

    const [parolaNoua, setParolaNoua] = useState('');
    const [confirmaParolaNoua, setConfirmaParolaNoua] = useState('');

    const [importantKey, setImportantKey] = useState(null);

    const hashPassword = async (password) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);

        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

        return hashHex;
    };

    const recuperareSection = (event) => {
        event.preventDefault();
        if (email.trim() === '') {
            setErrorMessage('Completează toate câmpurile !');
            return;
        }

        setErrorMessage('');
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
    const recuperareSection3 = async (event) => {
        event.preventDefault();
        if (cheiaRecuperare.trim() === '') {
            setErrorMessage('Te rugăm să completezi câmpul cu cheia de recuperare.');
            return;
        }
        setErrorMessage('');

        try {
            const response = await fetch('http://localhost:9000/api/auth/getCopyEncryptedSimmetricKey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Email: email }),
            });

            if (response.ok) {
                const data = await response.json();

                // Decriptarea cheii
                const keyfromdata = data.copyencryptedsimmetrickey;
                const decodedString = hexToString(keyfromdata);

                const dataObject = JSON.parse(decodedString);
                const ivHex = dataObject.data.encKey.iv;
                const encDataHex = dataObject.data.encKey.encData;
                const tagHex = dataObject.data.encKey.tag;


                // extragem saltul acuma:
                let salt = null;
                try {
                    const response = await fetch('http://localhost:9000/api/auth/getSalt', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ Email: email }),
                    });
                    if (response.ok) {
                        const data = await response.json();
                        salt = CryptoJS.enc.Base64.parse(data.salt);;
                    }

                } catch (error) {
                    console.log("Eroare luare salt: ", error);
                }
                if (salt === null) {
                    console.error("Saltul e null");
                }
                const derivedKey = CryptoJS.PBKDF2(cheiaRecuperare, salt, { keySize: 256 / 32, iterations: 500000 });// tre sa ajustez nr de iteratii
                const derivedKeyBase64 = derivedKey.toString(CryptoJS.enc.Base64);

                // decriptare cheie
                const decriptKey = await decodeMainKey(derivedKeyBase64);
                const dec_key = await decriptareDate(encDataHex, ivHex, tagHex, decriptKey);

                setImportantKey(dec_key);
            } else {
                const errorData = await response.text();
                console.error('Eroare:', errorData);
            }
        } catch (error) {
            console.error('Eroare de conexiune:', error);
        }
        setCasetaCheieRecuperare(false);
        setCasetaSchimbareParola(true);
    };
    const recuperareSection4 = async (event) => {
        event.preventDefault();
        if (parolaNoua.trim() === '') {
            setErrorMessage('Completează toate câmpurile !');
            return;
        }
        if (confirmaParolaNoua.trim() === '') {
            setErrorMessage('Completează toate câmpurile !');
            return;
        }

        if (parolaNoua !== confirmaParolaNoua) {
            setErrorMessage('Completează toate câmpurile !');
            return;
        }
        setErrorMessage('');

        try {

            // generam salt
            const salt = new Uint8Array(32); // 32 de octeți pentru un salt de 256 biți
            window.crypto.getRandomValues(salt);
            const saltBase64 = btoa(String.fromCharCode.apply(null, salt));
            const saltWordArray = CryptoJS.enc.Base64.parse(saltBase64);

            //hash parola
            const hashedPassword = await hashPassword(parolaNoua);

            // Derivarea cheii folosind PBKDF2
            const derivedKey = CryptoJS.PBKDF2(parolaNoua, saltWordArray, { keySize: 256 / 32, iterations: 500000 });
            const derivedKeyBase64 = derivedKey.toString(CryptoJS.enc.Base64);

            // 1. generam cheia aes principala 
            const key_aes = importantKey;

            // 2.criptare cheie aes cu cheia derivata din parola
            const criptKey = await decodeMainKey(derivedKeyBase64);

            const key_aes_cryptobject = await decodeMainKey(key_aes);
            const key_aes_raw = await exportKey(key_aes_cryptobject);
            const enc_key_raw = await criptareDate(key_aes_raw, criptKey);

            // trnsforamm cheia in b64
            // const exportedKey = await window.crypto.subtle.exportKey("raw", key_aes);
            //const base64Key = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

            const userData = {
                Email: email,
                SaltB64: saltBase64,
                EncryptedAesKey: {
                    encKey: { iv: enc_key_raw.iv, encData: enc_key_raw.encData, tag: enc_key_raw.tag },
                },
                HashParola: hashedPassword,
            };

            const response = await fetch('http://localhost:9000/api/auth/changePassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                setsuccessMessage("Parola schimbată cu succes !");
                setTimeout(() => {
                    setsuccessMessage("Parola schimbată cu succes !");
                    navigate('/login');
                }, 2000);
            } else {
                setErrorMessage(true);
            }

        } catch (error) {
            console.error("Eroare la trimiterea formularului", error);
        }

    };

    const handleParolaNouaChange = (event) => {
        setParolaNoua(event.target.value);
        setErrorMessage('');
    };
    const handleConfirmaParolaNouaChange = (event) => {
        setConfirmaParolaNoua(event.target.value);
        setErrorMessage('');
    };
    const handleEmailChange = (event) => {
        setEmail(event.target.value);
        setErrorMessage('');
    };

    return (
        <div className="h-screen bg-gradient-to-r from-green-900 via-gray-700 to-black flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-5/6 sm:w-full max-w-md">
                {casetaTrimiteCod && (<>
                    <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Recuperare Parolă</h2>
                    <form className="space-y-4">
                        <div>
                            <input type="email" id="email" onChange={handleEmailChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Introdu adresa de email" />
                        </div>
                        {errorMessage && (
                            <p className="text-red-500 text-sm flex justify-center items-center">{errorMessage}</p>
                        )}
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

                        <div className="flex justify-center items-center">
                            <button onClick={recuperareSection4} type="submit" className="w-3/4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400">
                                Resetează Parola
                            </button>
                        </div>
                        {errorMessage && (
                            <p className="text-red-500 text-sm flex justify-center items-center">{errorMessage}</p>
                        )}
                        {successMessage && (
                            <p className="text-green-500 text-sm flex justify-center items-center">{errorMessage}</p>
                        )}
                    </form>
                </>
                )}

            </div>
        </div>
    );
};

export default RecoveryPasswordPage;
