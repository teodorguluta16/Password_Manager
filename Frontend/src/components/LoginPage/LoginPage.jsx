import React, { useState, useEffect } from 'react';
import Video2 from "../../assets/website/video6.mp4";
import { useNavigate } from 'react-router-dom';

import { useKeySimetrica } from '../FunctiiDate/ContextKeySimetrice'
import { criptareDate, generateKey, decodeMainKey, decriptareDate } from "../FunctiiDate/FunctiiDefinite"
import { saveKeyInIndexedDB } from '../FunctiiDate/ContextKeySimetrice';
import CryptoJS from 'crypto-js';

function hexToString(hex) {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

const LoginPage = () => {
  const [incorectCredentiale, setincorectCredentiale] = useState(false);
  const [Parola, setParola] = useState('');
  const [Email, setEmail] = useState('');

  const navigate = useNavigate();
  const toggleForm = () => { navigate('/signup'); };
  const navigareForgetPassword = () => { navigate('/recoverypassword') };
  const { setKey } = useKeySimetrica();

  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
  };

  const handleLogin = async (e) => {
    if (e && e.preventDefault) { e.preventDefault(); }

    if (!Email || !Parola) {
      setincorectCredentiale(true);
      return;
    }

    //hash parola
    const hashedPassword = await hashPassword(Parola);
    console.log("Hashed password: ", hashedPassword);

    const date = { Email, hashedPassword };

    try {
      const response = await fetch('http://localhost:9000/api/auth/login', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify(date),
      });

      if (response.ok) {
        console.log("Autentificare reusita !");
        let salt = null;

        try {
          const response = await fetch('http://localhost:9000/api/utilizator/getSalt', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: "include"
          });
          if (response.ok) {
            const data = await response.json();
            console.log("Datele primite saltul de la server: ", data);
            salt = CryptoJS.enc.Base64.parse(data.salt);;
          }

        } catch (error) {
          console.log("Eroare luare salt: ", error);
        }
        const derivedKey = CryptoJS.PBKDF2(Parola, salt, { keySize: 256 / 32, iterations: 500000 });
        const derivedKeyBase64 = derivedKey.toString(CryptoJS.enc.Base64);
        console.log('Cheia derivată în Base64:', derivedKeyBase64);


        try {
          const aesResponse = await fetch('http://localhost:9000/api/getUserSimmetricKey', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: "include"
          });

          if (aesResponse.ok) {
            const aesResponseData = await aesResponse.json();
            console.log("Răspunsul de la server pentru cheia AES:", aesResponseData);

            const decriptKey = await decodeMainKey(derivedKeyBase64);
            // Decriptarea cheii

            const keyfromdata = aesResponseData[0].encryptedsimmetrickey;
            const decodedString = hexToString(keyfromdata);
            console.log(decodedString);
            const dataObject = JSON.parse(decodedString);

            const ivHex = dataObject.encKey.iv;
            const encDataHex = dataObject.encKey.encData;
            const tagHex = dataObject.encKey.tag;

            const dec_key = await decriptareDate(encDataHex, ivHex, tagHex, decriptKey);

            const octetiArray = dec_key.split(',').map(item => parseInt(item.trim(), 10));
            const uint8Array = new Uint8Array(octetiArray);
            console.log("Am obtinut:", uint8Array);
            const wordArray = CryptoJS.lib.WordArray.create(uint8Array);
            const base64Key = wordArray.toString(CryptoJS.enc.Base64);
            console.log("Cheia în format Base64:", base64Key);
            await saveKeyInIndexedDB(base64Key);
            setKey(base64Key);

            navigate('/myapp');
          } else {
            console.error("Eroare la obținerea cheii AES de la server");
            setincorectCredentiale(true);
          }

        } catch (error) {
          console.error("Eroare la cererea cheii AES", error);
        }

      } else {
        setincorectCredentiale(true);
        return;
      }
    } catch (error) {
      console.error("Eroare la trimiterea formularului", error);
    }

  };

  return (
    <>
      <div className='flex flex-col md:flex-row h-screen'>
        {/* Stanga Video */}
        <div className='relative w-full md:w-1/2 h-auto'>
          <video src={Video2} autoPlay loop muted className="w-full md:h-full object-cover aspect-[16/9] md:aspect-auto max-h-[50vh] md:max-h-full"></video>
        </div>

        {/* Dreapta formular */}
        <div className="w-full md:w-1/2">
          <div className='flex flex-col justify-center items-center bg-gray-100 h-1/2 min-h-screen md:mt-0 -mt-32'>
            <h2 className='text-4xl font-bold text-center md:mt-0'>Intră în cont</h2>
            <form className='mt-6 flex flex-col items-left lg:w-96 w-3/4 justify-center items-cente'>
              <label className='block text-lg font-medium'>E-mail:</label>
              <input type='email' value={Email} onChange={(e) => { setEmail(e.target.value); setincorectCredentiale(false); }} className='mt-2 p-3 border border-green-400 rounded w-full bg-neutral' placeholder='Introdu adresa ta' />
              <label className='block text-lg font-medium mt-4'>Parola:</label>
              <input type='password' value={Parola} onChange={(e) => { setParola(e.target.value); setincorectCredentiale(false); }} className='mt-2 p-3 border border-green-400 rounded w-full bg-neutral' placeholder='Introdu parola' />

              <div className='mt-7 flex flex-col items-center px-6'>
                <button className='px-6 py-2 w-3/4 bg-green-600 text-white rounded hover:bg-yellow-500 mb-6' onClick={handleLogin}>Log In</button>
                {incorectCredentiale && (<h3 className="w-full text-red-600 text-semibold text-center"> Eroare ! Credentiale Incorecte !</h3>)}
                <button type='button' onClick={toggleForm} className='mt-2 text-blue-500 hover:underline inline-block bg-transparent border-none p-0 cursor-pointer mb-3'>
                  Creează un cont nou
                </button>
                <button onClick={navigareForgetPassword} className='text-blue-500 hover:underline'>Ți-ai uitat parola?</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
