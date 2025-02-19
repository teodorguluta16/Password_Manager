import React, { useState } from 'react';
import Video2 from "../../assets/website/video6.mp4";
import { useNavigate } from 'react-router-dom';
import forge from 'node-forge';
import CryptoJS from 'crypto-js';
import { criptareDate, generateKey, decodeMainKey, decriptareDate, exportKey } from "../FunctiiDate/FunctiiDefinite"


function pemToUint8Array(pem) {
    // Elimină antetul, footerul și liniile noi
    const base64 = pem
        .replace(/-----BEGIN PUBLIC KEY-----/, '')
        .replace(/-----END PUBLIC KEY-----/, '')
        .replace(/\n/g, '');

    // Decodifică Base64 într-un array de octeți
    const binaryString = atob(base64);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }

    return uint8Array;
}

const SignUpPage = () => {

    const [Nume, setNume] = useState('');
    const [Prenume, setPrenume] = useState('');
    const [Parola, setParola] = useState('');
    const [Email, setEmail] = useState('');
    const [confirmaParola, setConfirma] = useState('');

    const [campuriObligatorii, setCampuriObligatorii] = useState(false);
    const [paroleNuSePotrivesc, setParoleNuSePotrivesc] = useState(false);
    const [contCreacCuSucces, setContCreatCuSucces] = useState(false);
    const [eroareCreareCont, setEroareCreareCont] = useState(false);

    const navigate = useNavigate();

    const toggleForm = () => {
        navigate('/login');
    };
    const handleSubmit = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        if (!Nume || !Prenume || !Email || !Parola || !confirmaParola) {
            setCampuriObligatorii(true);
            return;
        }
        if (Parola !== confirmaParola) {
            setParoleNuSePotrivesc(true);
            return;
        }

        const date = { Nume, Prenume, Email, Parola };

        try {
            const derivedKey = CryptoJS.PBKDF2(Parola, Email, { keySize: 256 / 32, iterations: 500000 }); // Ai grijă la numărul de iterații
            const derivedKeyBase64 = derivedKey.toString(CryptoJS.enc.Base64);

            // 1. generam cheia aes principala 
            const key_aes = await generateKey();

            // 2.criptare cheie aes cu cheia derivata din parola   !! tre sa mai studiez putin aici

            const criptKey = await decodeMainKey(derivedKeyBase64);
            const key_aes_raw = await exportKey(key_aes);
            console.log("Cheia intreaga inainte de criptare este: ", key_aes_raw);
            const enc_key_raw = await criptareDate(key_aes_raw, criptKey);

            // trnsforamm cheia in b64
            const exportedKey = await window.crypto.subtle.exportKey("raw", key_aes);
            const base64Key = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
            console.log("Cheia în format Base64 la crearea contului:", base64Key);

            // 3. generam perechea de chei rsa

            const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair(2048);

            const publicKeyPem = forge.pki.publicKeyToPem(publicKey);
            const privateKeyPem = forge.pki.privateKeyToPem(privateKey);

            // 4. criptam cheia privata cu cheia aia aes
            const criptKey2 = await decodeMainKey(base64Key);
            const encryptedPrivateKey = await criptareDate(privateKeyPem, criptKey2);


            const uint8Array = pemToUint8Array(publicKeyPem);
            const publicKeyBase64 = btoa(String.fromCharCode.apply(null, uint8Array));
            const userData = {
                ...date, PublicKey: publicKeyBase64,
                EncryptedPrivateKey: {
                    encKey: { iv: encryptedPrivateKey.iv, encData: encryptedPrivateKey.encData, tag: encryptedPrivateKey.tag }
                },
                EncryptedAesKey: {
                    encKey: { iv: enc_key_raw.iv, encData: enc_key_raw.encData, tag: enc_key_raw.tag },
                },
            };

            const response = await fetch('http://localhost:9000/api/auth/addUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                setContCreatCuSucces(true);
                setTimeout(() => {
                    navigate('/login');
                    setContCreatCuSucces(false);
                }, 2000);
            } else {
                setEroareCreareCont(true);
            }

        } catch (error) {
            console.error("Eroare la trimiterea formularului", error);
        }
    };
    return (
        <>
            <div className='flex flex-col lg:flex-row h-screen'>
                {/* Stanga Video */}
                <div className='relative w-full lg:w-1/2 h-auto'>
                    <video src={Video2} autoPlay loop muted className="w-full h-full object-cover aspect-[16/9] lg:aspect-auto"></video>
                </div>

                {/* Dreapta formular */}
                <div className='flex flex-col justify-center items-center w-full lg:w-1/2 bg-gray-100 h-full lg:mt-0'>
                    <h2 className='text-4xl font-bold text-center'>Creează cont nou</h2>
                    <form className='mt-6 flex flex-col items-left mx-4'>
                        <label className='block text-lg font-medium'>Nume si Prenume:</label>

                        <div className='flex flex-row gap-8'>
                            <input type='nume' value={Nume} onChange={(e) => { setNume(e.target.value); setCampuriObligatorii(false); setContCreatCuSucces(false), setEroareCreareCont(false), setParoleNuSePotrivesc(false); }} className=' mt-2 p-3 border border-green-400 rounded w-full bg-neutral' placeholder='Introdu numele' />
                            <input type='prenume' value={Prenume} onChange={(e) => { setPrenume(e.target.value); setCampuriObligatorii(false); setContCreatCuSucces(false), setEroareCreareCont(false), setParoleNuSePotrivesc(false); }} className=' mt-2 p-3 border border-green-400 rounded w-full bg-neutral' placeholder='Introdu prenumele' />
                        </div>
                        <label className='block text-lg font-medium mt-4'>E-mail:</label>
                        <input type='email' value={Email} onChange={(e) => { setEmail(e.target.value); setCampuriObligatorii(false); setContCreatCuSucces(false), setEroareCreareCont(false), setParoleNuSePotrivesc(false); }} className='mt-2 p-3 border border-green-400 rounded w-full bg-neutral' placeholder='Introdu adresa ta' />
                        <label className='block text-lg font-medium mt-4'>Parola:</label>
                        <input type='password' value={Parola} onChange={(e) => { setParola(e.target.value);; setCampuriObligatorii(false); setContCreatCuSucces(false), setEroareCreareCont(false), setParoleNuSePotrivesc(false); }} className='mt-2 p-3 border border-green-400 rounded w-full bg-neutral' placeholder='Introdu parola' />
                        <label className='block text-lg font-medium mt-4'>Confirmă Parola:</label>
                        <input type='password' value={confirmaParola} onChange={(e) => { setConfirma(e.target.value); setCampuriObligatorii(false); setContCreatCuSucces(false), setEroareCreareCont(false), setParoleNuSePotrivesc(false); }} className='mt-2 p-3 border border-green-400 rounded w-full bg-neutral' placeholder='Introdu parola din nou' />

                        {campuriObligatorii && <h3 className='text-yellow-600 text-semibold text-center mt-3'>Toate campurile sunt obligatorii !</h3>}
                        {eroareCreareCont && <h3 className='text-red-600 text-semibold text-center mt-3'>Eroare creare cont !</h3>}
                        {paroleNuSePotrivesc && <h3 className='text-red-600 text-semibold text-center mt-3'>Parolele nu se potrivesc !</h3>}
                        {contCreacCuSucces && <h3 className='text-green-600 text-semibold text-center mt-3'>Cont creat cu succes !</h3>}
                        <div className='mt-7 flex flex-col items-center px-6'>
                            <button onClick={handleSubmit} className='px-6 py-2 w-3/4 bg-green-600 text-white rounded hover:bg-yellow-500 mb-6'>Sign Up</button>
                            <button type='button' onClick={toggleForm} className='mt-2 text-blue-500 hover:underline'>
                                Ai deja un cont? Loghează-te aici
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default SignUpPage;