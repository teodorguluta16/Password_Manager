import React, { useState, useEffect } from 'react';
import Video2 from "../../assets/website/video6_compressed.mp4";
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

import { useKeySimetrica } from '../FunctiiDate/ContextKeySimetrice'
import { criptareDate, generateKey, decodeMainKey, decriptareDate } from "../FunctiiDate/FunctiiDefinite"
import { saveKeyInIndexedDB, saveKeyInIndexedDB2 } from '../FunctiiDate/ContextKeySimetrice';
import CryptoJS from 'crypto-js';

function hexToString(hex) {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

const exportKeyToBase64 = async (cryptoKey) => {
  const raw = await crypto.subtle.exportKey('raw', cryptoKey);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(raw)));
  return base64;
};

const LoginPage = () => {
  const [incorectCredentiale, setincorectCredentiale] = useState(false);
  const [Parola, setParola] = useState('');
  const [Email, setEmail] = useState('');

  const [pinGenerat, setPinGenerat] = useState('');
  const [copiat, setCopiat] = useState(false);
  const [pinCopiat, setPinCopiat] = useState(false);
  const [sessionKeyRAM, setSessionKeyRAM] = useState(null);
  const [navigarePermisa, setNavigarePermisa] = useState(false);


  const navigate = useNavigate();
  const toggleForm = () => { navigate('/signup'); };
  const navigareForgetPassword = () => { navigate('/recoverypassword') };
  const { setKey } = useKeySimetrica();


  const hashPassword = async (buffer) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(buffer);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
  };

  const hasNavigated = useRef(false); // adaugă acest flag

  useEffect(() => {
    if (pinGenerat && pinCopiat && navigarePermisa && !incorectCredentiale && !hasNavigated.current) {
      console.log("este corect !!!!");
      hasNavigated.current = true; // marchează că s-a navigat
      navigate('/myapp', { replace: true });
    }
  }, [pinGenerat, pinCopiat, navigarePermisa, incorectCredentiale]);

  useEffect(() => {
    console.log('🔁 Component (LoginPage) reloaded');
  }, []);


  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pinGenerat);
      setCopiat(true);
      setPinCopiat(true);
      //setTimeout(() => setCopiat(false), 2000);


    } catch (err) {
      console.error("Eroare la copierea PIN-ului:", err);
    }
  };

  const generatePIN = (length = 6) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pin = '';
    for (let i = 0; i < length; i++) {
      const randIndex = Math.floor(Math.random() * charset.length);
      pin += charset[randIndex];
    }
    return pin;
  };



  const deriveSessionKeyFromPIN = async (pinValue) => {
    const encoder = new TextEncoder();
    const pinBuffer = encoder.encode(pinValue);
    const salt = crypto.getRandomValues(new Uint8Array(16)); // poate fi și fix, dacă vrei reproducibilitate

    const keyMaterial = await crypto.subtle.importKey(
      'raw', pinBuffer,
      { name: 'PBKDF2' }, false, ['deriveKey']
    );

    const sessionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 20000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,                        // ✅ permite exportarea cheii
      ['encrypt', 'decrypt']      // ✅ folosită pentru criptare și decriptare
    );

    setSessionKeyRAM(sessionKey);
    console.log("🔐 sessionKey (RAM):", sessionKey);
    return { sessionKey, salt };
  };

  const criptareCheiePrincipala = async (base64Key, sessionKey, salt) => {
    const { iv, encData, tag } = await criptareDate(base64Key, sessionKey);

    salt = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    console.log("SessionKey-ul generat2 : ", sessionKey);
    // Afișare sessionKey în Base64
    const sessionKeyBase64 = await exportKeyToBase64(sessionKey);
    console.log("🔐 SessionKey (Base64) LOGIN:", sessionKeyBase64);
    console.log("Saltul salvat: ", salt);
    const payload = { iv, encData, tag };

    await saveKeyInIndexedDB2(JSON.stringify(payload), salt);
    console.log("🔒 Cheia principală criptată a fost salvată în IndexedDB împreună cu saltul.");
  };


  const handleLogin = async (e) => {
    if (e && e.preventDefault) { e.preventDefault(); }

    if (!Email || !Parola) {
      setincorectCredentiale(true);
      return;
    }

    //hash parola si email
    const hashedPassword = await hashPassword(Parola);
    const hashedEmail = await hashPassword(Email);

    try {
      const keyAuth = CryptoJS.PBKDF2(hashedPassword, hashedEmail + "-auth", {
        keySize: 256 / 32,
        iterations: 500000,
      });
      const keyCrypt = CryptoJS.PBKDF2(hashedPassword, hashedEmail + "-crypt", {
        keySize: 256 / 32,
        iterations: 500000,
      });


      const keyAuthBase64 = keyAuth.toString(CryptoJS.enc.Base64);
      const keyCryptBase64 = keyCrypt.toString(CryptoJS.enc.Base64);

      const date = { Email, keyAuthBase64 };

      const response = await fetch('http://localhost:9000/api/auth/login', {
        method: "POST", headers: { 'Content-Type': 'application/json', }, credentials: "include", body: JSON.stringify(date),
      });

      if (response.ok) {
        const generatedPIN = generatePIN();
        console.log("\ud83d\udd22 PIN generat:", generatedPIN);
        setPinGenerat(generatedPIN);
        const { sessionKey, salt } = await deriveSessionKeyFromPIN(generatedPIN);
        console.log("PINUL folosit la derivare: ", generatedPIN);
        console.log("SessionKey-ul generat la LOGIN : ", sessionKey);
        console.log("Saltul-ul generat la LOGIN : ", salt);

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

            const decriptKey = await decodeMainKey(keyCryptBase64);
            // Decriptarea cheii

            const keyfromdata = aesResponseData[0].encryptedsimmetrickey;
            const decodedString = hexToString(keyfromdata);
            const dataObject = JSON.parse(decodedString);

            const ivHex = dataObject.encKey.iv;
            const encDataHex = dataObject.encKey.encData;
            const tagHex = dataObject.encKey.tag;

            const dec_key = await decriptareDate(encDataHex, ivHex, tagHex, decriptKey);

            const octetiArray = dec_key.split(',').map(item => parseInt(item.trim(), 10));
            const uint8Array = new Uint8Array(octetiArray);
            const wordArray = CryptoJS.lib.WordArray.create(uint8Array);
            const base64Key = wordArray.toString(CryptoJS.enc.Base64);
            await saveKeyInIndexedDB(base64Key);
            await criptareCheiePrincipala(base64Key, sessionKey, salt);
            setKey(base64Key);

            // Acum putem permite navigarea
            setNavigarePermisa(true);

            //navigate('/myapp');

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
        {<div className='relative w-full md:w-1/2 h-auto'>
          <video src={Video2} autoPlay loop muted preload="none" className="w-full md:h-full object-cover aspect-[16/9] md:aspect-auto max-h-[50vh] md:max-h-full"></video>
        </div>}

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
                <button type="button" className='px-6 py-2 w-3/4 bg-green-600 text-white rounded hover:bg-yellow-500 mb-6' onClick={handleLogin}>Log In</button>
                {incorectCredentiale && (<h3 className="w-full text-red-600 text-semibold text-center"> Eroare ! Credentiale Incorecte !</h3>)}
                {!incorectCredentiale && pinGenerat && (
                  <div className="w-full text-center mt-2 flex flex-col items-center">
                    <p className="text-md text-green-800 font-semibold">Codul PIN generat pentru sesiune:</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xl font-bold text-green-900 tracking-widest bg-white border border-green-300 rounded p-2 px-4">{pinGenerat}</p>
                      <button type="button" onClick={copyToClipboard} className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">📋 Copiază</button>
                    </div>
                    <p className="text-gray-600 text-sm mt-2 italic">Copiază mai întâi PIN-ul în clipboard pentru a continua.</p>
                    {copiat && (
                      <p className="text-green-600 text-sm mt-1 font-medium">PIN copiat în clipboard!</p>
                    )}
                  </div>
                )}
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
