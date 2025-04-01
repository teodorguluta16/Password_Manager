import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Logo from "../../assets/website/access-control.png";
import User2 from "../../assets/website/user3.png"
import Notes from "../../assets/website/notes.png"
import Cube from "../../assets/website/cube.png"
import PasswordLogo from "../../assets/website/password.png"
import CreditCard from "../../assets/website/credit-card.png"
import People from "../../assets/website/group.png"
import HelpLogo from "../../assets/website/question.png"
import ShareLogo from "../../assets/website/share.png"
import DeletedIcon from "../../assets/website/garbage.png"
import AddIcon from "../../assets/website/add.png"
import FavoriteIcon from '../../assets/website/star.png'
import Address from '../../assets/website/address.png'
import IDCard from "../../assets/website/id-card.png"
import RemoteWorking from "../../assets/website/remote-working.png"
import '../../App.css';

import ItemsAllPage from './ItemiPages/ItemsAllPage';
import ParolePage from './ItemiPages/ParolePage';
import NotitePage from './ItemiPages/NotitePage';
import CarduriBancarePage from './ItemiPages/CarduriBancarePage';
import MyAccountPage from './GestionareCont/MyAccountPage';
import HelpPage from './GestionareCont/HelpPage';
import FavoritePage from './ItemiPages/FavoritePage';
import GrupuriPage from './ItemiPages/GrupuriPage';
import AdresePage from './ItemiPages/AdresePage';

import PopupNewItem from './Popup_uri/PopupNewItem';
import PopupParolaItem from "./Popup_uri/PopupParolaItem";
import PopupNotitaItem from "./Popup_uri/PopupNotitaItem";
import PopupCardItem from "./Popup_uri/PopupNewCreditCard";
import PopupNewAdrese from "./Popup_uri/PopupNewAdrese";
import ItemiStersi from './ItemiPages/ItemiStersi';
import RemoteWorkingPage from './ItemiPages/RemoteWorkingPage';

import { getKeyFromIndexedDB } from "../FunctiiDate/ContextKeySimetrice";
import { decodeMainKey, decriptareDate } from "../FunctiiDate/FunctiiDefinite"

const importRawKeyFromBase64 = async (base64Key) => {
  const binary = atob(base64Key); // decode base64
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return await window.crypto.subtle.importKey(
    "raw",
    bytes,
    "HKDF",
    false,
    ["deriveKey"]
  );
};

const deriveHMACKey = async (derivedKey) => {
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode("semnatura-parola"),
      info: new TextEncoder().encode("hmac-signing")
    },
    derivedKey,
    {
      name: "HMAC",
      hash: "SHA-256",
      length: 256
    },
    false,
    ["sign"]
  );
};

function hexToString(hex) {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

const AplicatiePage = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
  const [meniuExtins, setExtins] = useState(!isSmallScreen);
  const [meniuExtinsVerticala, setMeniuExtinsVerticala] = useState(false);

  const [initiale, setInitiale] = useState(null);
  const [name_user, setNameUser] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const [savedKey, setSavedKey] = useState(null);
  useEffect(() => {
    const loadKey = async () => {
      try {
        let key_aux = await getKeyFromIndexedDB();
        console.log("Saved key este", key_aux);
        setSavedKey(key_aux);
      } catch (error) {
        console.error("Eroare:", error);
      }
    };
    loadKey();
  }, []);

  const syncKeyWithExtension = async () => {
    try {
      const key = await getKeyFromIndexedDB();
      if (key) {
        console.log("📤 Trimit cheia prin window.postMessage:", key);
        window.postMessage({ type: "SYNC_DECRYPTION_KEY", key: key }, "*");
      } else {
        console.warn("⚠️ Nu există cheie în IndexedDB.");
      }
    } catch (error) {
      console.error("❌ Eroare la trimiterea cheii:", error);
    }
  };

  useEffect(() => {
    syncKeyWithExtension();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:9000/api/auth/validateToken', {
          method: 'GET',
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Utilizator autentificat:", data);

          if (data.name) {
            const [firstName, lastName] = data.name.split(' ');
            setInitiale(`${firstName.charAt(0)}${lastName.charAt(0)}`);
          }
        } else {
          console.warn("Token invalid sau expirat. Redirecționare la login.");
          navigate('/login');
        }
      } catch (error) {
        console.error("Eroare la verificarea autentificării:", error);
        navigate('/login');
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 640;
      setIsSmallScreen(isSmall);

      if (!isSmall) {
        setMeniuExtinsVerticala(false);
        setExtins(true);
      }
      else {
        setExtins(false);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup la demontare
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMeniuVertical = () => {
    setExtins(!meniuExtins);
    setMeniuExtinsVerticala(false);
  };

  const toggleMeniuExtinsVertical = () => {
    setMeniuExtinsVerticala(!meniuExtinsVerticala);
    setExtins(false);
  };

  const handleToggle = () => {
    if (isSmallScreen) {
      toggleMeniuExtinsVertical();
    } else {
      toggleMeniuVertical();
    }
  };

  const [sectiuneItemi, setsectiuneItemi] = useState('toate');
  const selecteazaSectiune = (sectiune) => {
    setsectiuneItemi(sectiune);
  }

  const [showMeniuLContulmeuCascada, setMeniuContulMeu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setTimeout(() => {
          setMeniuContulMeu(false);
        }, 150);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [shoMeniuCreeazaItem, setMeniuCreeazaItem] = useState(false);
  const [ShowParolaPopup, setShowParolaPopup] = useState(false);
  const [ShowNotitaPopup, setShowNotitaPopup] = useState(false);
  const [ShowCardPopup, setShowCardPopup] = useState(false);
  const [ShowAdresaPopup, setShowAddressPopup] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  //const [hmacKey, setHmacKey] = useState(null); // 1. inițializare

  useEffect(() => {
    /*const genereazaHmacKey = async () => {
      if (savedKey) {
        let cryptoKey;

        if (typeof savedKey === "string") {
          cryptoKey = await importRawKeyFromBase64(savedKey);
        } else {
          cryptoKey = savedKey;
        }

        const key = await deriveHMACKey(cryptoKey);
        setHmacKey(key);
        console.log("🔐 HMAC Key generată:", key);
      }
    };

    genereazaHmacKey();*/
  }, [savedKey]);


  const semneazaParola = async (parola, charset, length, hmacKey) => {
    const data = `${parola}|${charset}|${length}`;
    const encoder = new TextEncoder();

    const signature = await crypto.subtle.sign(
      "HMAC",
      hmacKey, // 🔐 folosești cheia deja derivată
      encoder.encode(data)
    );

    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const deconectare = async () => {
    try {
      const response = await fetch('http://localhost:9000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        console.log("Deconectare reușită!");
        window.location.href = '/login';
      } else {
        console.error("Eroare la deconectare");
      }
    } catch (error) {
      console.error("Eroare la deconectare:", error);
    }
  };

  const [items, setItems] = useState([]);
  const [favoriteItemsAll, setFavoriteItems] = useState([]);
  const [paroleItemsAll, setParoleItems] = useState([]);
  const [RemoteItemsAll, setRemoteItmes] = useState([]);
  const [notiteItemsAll, setNotiteItmes] = useState([]);
  const [carduriItemsAll, setCarduriItems] = useState([]);
  const [adreseAll, setAdreseItems] = useState([]);

  const fetchItems = async () => {

    try {
      const response = await fetch('http://localhost:9000/api/utilizator/itemi', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Datele primite de la server: ", data);
        const decriptKey = await decodeMainKey(savedKey);
        let fetchedItems = [], favoriteItems = [], paroleItems = [], remoteItems = [], notiteItems = [], carduriItems = [], adreseItems = [];

        for (let item of data) {
          try {
            const isFavorite = item.isfavorite;

            const id_owner = item.id_owner;
            const id_item = item.id_item;
            const isDeleted = item.isdeleted;

            // Decriptarea cheii
            const keyfromdata = item.keys_hex;
            const decodedString = hexToString(keyfromdata);

            const dataObject = JSON.parse(decodedString);
            const ivHex = dataObject.encKey.iv;
            const encDataHex = dataObject.encKey.encData;
            const tagHex = dataObject.encKey.tag;

            const dec_key = await decriptareDate(encDataHex, ivHex, tagHex, decriptKey);

            const octetiArray = dec_key.split(',').map(item => parseInt(item.trim(), 10));
            const uint8Array = new Uint8Array(octetiArray);

            const importedKey = await window.crypto.subtle.importKey(
              "raw", uint8Array, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]
            );

            // Decriptare continut
            const continutfromdata = item.continut_hex;

            const decodedString2 = hexToString(continutfromdata);
            const dataObject2 = JSON.parse(decodedString2);

            const { created_at, modified_at, version } = dataObject2.metadata;

            const ivHex2 = dataObject2.data.tip.iv;
            const encDataHex2 = dataObject2.data.tip.encData;
            const tagHex2 = dataObject2.data.tip.tag;
            const rez_tip = await decriptareDate(encDataHex2, ivHex2, tagHex2, importedKey);

            if (rez_tip === "password") {
              const ivHex3 = dataObject2.data.nume.iv;
              const encDataHex3 = dataObject2.data.nume.encData;
              const tagHex3 = dataObject2.data.nume.tag;

              const rez_nume = await decriptareDate(encDataHex3, ivHex3, tagHex3, importedKey);


              const ivHex4 = dataObject2.data.username.iv;
              const encDataHex4 = dataObject2.data.username.encData;
              const tagHex4 = dataObject2.data.username.tag;

              const rez_username = await decriptareDate(encDataHex4, ivHex4, tagHex4, importedKey);

              const ivHex5 = dataObject2.data.parola.iv;
              const encDataHex5 = dataObject2.data.parola.encData;
              const tagHex5 = dataObject2.data.parola.tag;
              const rez_parola = await decriptareDate(encDataHex5, ivHex5, tagHex5, importedKey);


              const ivHex6 = dataObject2.data.url.iv;
              const encDataHex6 = dataObject2.data.url.encData;
              const tagHex6 = dataObject2.data.url.tag;
              const rez_url = await decriptareDate(encDataHex6, ivHex6, tagHex6, importedKey);

              const ivHex7 = dataObject2.data.comentariu.iv;
              const encDataHex7 = dataObject2.data.comentariu.encData;
              const tagHex7 = dataObject2.data.comentariu.tag;
              const rez_comentariu = await decriptareDate(encDataHex7, ivHex7, tagHex7, importedKey);

              let ivHex8 = null, encDataHex8 = null, tagHex8 = null, rez_istoric = null;
              console.log(dataObject2);
              if (dataObject2.data.istoric) {
                ivHex8 = dataObject2.data.istoric.iv;
                encDataHex8 = dataObject2.data.istoric.encData;
                tagHex8 = dataObject2.data.istoric.tag;
                rez_istoric = await decriptareDate(encDataHex8, ivHex8, tagHex8, importedKey);

              }

              const ivHex9 = dataObject2.data.semnatura.iv;
              const encDataHex9 = dataObject2.data.semnatura.encData;
              const tagHex9 = dataObject2.data.semnatura.tag;

              const rez_semnatura = await decriptareDate(encDataHex9, ivHex9, tagHex9, importedKey);


              console.log("Datele primite de la server aferente parolei:", rez_tip, rez_nume, rez_url, rez_username, rez_parola, rez_comentariu, isDeleted, isFavorite, rez_istoric);

              const lungime = dataObject2.metadata?.meta?.lungime;
              const charset = dataObject2.metadata?.meta?.charset;

              console.log("Lungimea: ", lungime, "Charset: ", charset);


              const cryptoKey = typeof savedKey === "string"
                ? await importRawKeyFromBase64(savedKey)
                : savedKey;

              const hmacKey = await deriveHMACKey(cryptoKey);

              if (!hmacKey) {
                console.error("🔐 HMAC key lipsește în momentul semnării!");
                return;
              }

              const semnaturaCalculata = await semneazaParola(
                rez_parola, charset, lungime, hmacKey
              );

              console.log("semnatura calculata: ", semnaturaCalculata);
              console.log("semnatura item: ", rez_semnatura);

              if (semnaturaCalculata !== rez_semnatura) {
                console.warn("⚠️ Semnătura nu se potrivește! Parola ar putea fi alterată.");
                // Poți marca acest item ca „invalid” în UI
              }
              else {
                console.log("Semnatura verificata !!!");
              }

              paroleItems.push({
                importedKey: importedKey,
                nume: rez_nume,
                tipitem: rez_tip,
                username: rez_username,
                parola: rez_parola,
                url: rez_url,
                comentariu: rez_comentariu,
                created_at: created_at,
                modified_at: modified_at,
                version: version,
                id_owner: id_owner,
                id_item: id_item,
                isDeleted: isDeleted,
                isFavorite: isFavorite,
                istoric: rez_istoric,
                isTampered: semnaturaCalculata !== rez_semnatura

              });

              fetchedItems.push({
                importedKey: importedKey,
                nume: rez_nume,
                tipitem: rez_tip,
                username: rez_username,
                parola: rez_parola,
                url: rez_url,
                comentariu: rez_comentariu,
                created_at: created_at,
                modified_at: modified_at,
                version: version,
                id_owner: id_owner,
                id_item: id_item,
                isDeleted: isDeleted,
                isFavorite: isFavorite,
                istoric: rez_istoric,
                isTampered: semnaturaCalculata !== rez_semnatura
              });

              if (isFavorite) {
                favoriteItems.push({
                  importedKey: importedKey,
                  nume: rez_nume,
                  tipitem: rez_tip,
                  username: rez_username,
                  parola: rez_parola,
                  url: rez_url,
                  comentariu: rez_comentariu,
                  created_at: created_at,
                  modified_at: modified_at,
                  version: version,
                  id_owner: id_owner,
                  id_item: id_item,
                  isDeleted: isDeleted,
                  isFavorite: isFavorite,
                  istoric: rez_istoric,
                  isTampered: semnaturaCalculata !== rez_semnatura
                });
              }

            }
            if (rez_tip === "remoteConnexion") {
              const ivHex3 = dataObject2.data.nume.iv;
              const encDataHex3 = dataObject2.data.nume.encData;
              const tagHex3 = dataObject2.data.nume.tag;

              const rez_nume = await decriptareDate(encDataHex3, ivHex3, tagHex3, importedKey);

              const ivHex4 = dataObject2.data.username.iv;
              const encDataHex4 = dataObject2.data.username.encData;
              const tagHex4 = dataObject2.data.username.tag;

              const rez_username = await decriptareDate(encDataHex4, ivHex4, tagHex4, importedKey);

              const ivHex5 = dataObject2.data.parola.iv;
              const encDataHex5 = dataObject2.data.parola.encData;
              const tagHex5 = dataObject2.data.parola.tag;
              const rez_parola = await decriptareDate(encDataHex5, ivHex5, tagHex5, importedKey);

              const ivHex6 = dataObject2.data.host.iv;
              const encDataHex6 = dataObject2.data.host.encData;
              const tagHex6 = dataObject2.data.host.tag;
              const rez_host = await decriptareDate(encDataHex6, ivHex6, tagHex6, importedKey);

              const ivHex7 = dataObject2.data.ppkKey.iv;
              const encDataHex7 = dataObject2.data.ppkKey.encData;
              const tagHex7 = dataObject2.data.ppkKey.tag;
              const rez_ppkKey = await decriptareDate(encDataHex7, ivHex7, tagHex7, importedKey);

              let ivHex8 = null, encDataHex8 = null, tagHex8 = null, rez_istoric = null;
              console.log(dataObject2);
              if (dataObject2.data.istoric) {
                ivHex8 = dataObject2.data.istoric.iv;
                encDataHex8 = dataObject2.data.istoric.encData;
                tagHex8 = dataObject2.data.istoric.tag;
                rez_istoric = await decriptareDate(encDataHex8, ivHex8, tagHex8, importedKey);

              }

              remoteItems.push({
                importedKey: importedKey,
                nume: rez_nume,
                tipitem: rez_tip,
                username: rez_username,
                parola: rez_parola,
                host: rez_host,
                ppkKey: rez_ppkKey,
                created_at: created_at,
                modified_at: modified_at,
                version: version,
                id_owner: id_owner,
                id_item: id_item,
                isDeleted: isDeleted,
                isFavorite: isFavorite,
                istoric: rez_istoric
              });

              fetchedItems.push({
                importedKey: importedKey,
                nume: rez_nume,
                tipitem: rez_tip,
                username: rez_username,
                parola: rez_parola,
                host: rez_host,
                ppkKey: rez_ppkKey,
                created_at: created_at,
                modified_at: modified_at,
                version: version,
                id_owner: id_owner,
                id_item: id_item,
                isDeleted: isDeleted,
                isFavorite: isFavorite,
                istoric: rez_istoric
              });
              if (isFavorite) {
                favoriteItems.push({
                  importedKey: importedKey,
                  nume: rez_nume,
                  tipitem: rez_tip,
                  username: rez_username,
                  parola: rez_parola,
                  host: rez_host,
                  ppkKey: rez_ppkKey,
                  created_at: created_at,
                  modified_at: modified_at,
                  version: version,
                  id_owner: id_owner,
                  id_item: id_item,
                  isDeleted: isDeleted,
                  isFavorite: isFavorite,
                  istoric: rez_istoric
                });
              }

            }
            if (rez_tip === "notita") {
              const ivHex3 = dataObject2.data.nume.iv;
              const encDataHex3 = dataObject2.data.nume.encData;
              const tagHex3 = dataObject2.data.nume.tag;

              const rez_nume = await decriptareDate(encDataHex3, ivHex3, tagHex3, importedKey);


              const ivHex4 = dataObject2.data.data.iv;
              const encDataHex4 = dataObject2.data.data.encData;
              const tagHex4 = dataObject2.data.data.tag;

              const rez_data = await decriptareDate(encDataHex4, ivHex4, tagHex4, importedKey);

              const ivHex7 = dataObject2.data.comentariu.iv;
              const encDataHex7 = dataObject2.data.comentariu.encData;
              const tagHex7 = dataObject2.data.comentariu.tag;
              const rez_comentariu = await decriptareDate(encDataHex7, ivHex7, tagHex7, importedKey);

              let ivHex8 = null, encDataHex8 = null, tagHex8 = null, rez_istoric = null;
              if (dataObject2.data.istoric) {
                ivHex8 = dataObject2.data.istoric.iv;
                encDataHex8 = dataObject2.data.istoric.encData;
                tagHex8 = dataObject2.data.istoric.tag;
                rez_istoric = await decriptareDate(encDataHex8, ivHex8, tagHex8, importedKey);

              }

              console.log("Datele primite de la server aferente parolei:", rez_tip, rez_nume, rez_data, rez_comentariu, isDeleted, isFavorite, rez_istoric);
              notiteItems.push({
                importedKey: importedKey,
                nume: rez_nume,
                tipitem: rez_tip,
                data: rez_data,
                comentariu: rez_comentariu,
                created_at: created_at,
                modified_at: modified_at,
                version: version,
                id_owner: id_owner,
                id_item: id_item,
                isDeleted: isDeleted,
                isFavorite: isFavorite,
                istoric: rez_istoric,
              });

              fetchedItems.push({
                importedKey: importedKey,
                nume: rez_nume,
                tipitem: rez_tip,
                data: rez_data,
                comentariu: rez_comentariu,
                created_at: created_at,
                modified_at: modified_at,
                version: version,
                id_owner: id_owner,
                id_item: id_item,
                isDeleted: isDeleted,
                isFavorite: isFavorite,
                istoric: rez_istoric
              });

              if (isFavorite) {
                favoriteItems.push({
                  importedKey: importedKey,
                  nume: rez_nume,
                  tipitem: rez_tip,
                  data: rez_data,
                  comentariu: rez_comentariu,
                  created_at: created_at,
                  modified_at: modified_at,
                  version: version,
                  id_owner: id_owner,
                  id_item: id_item,
                  isDeleted: isDeleted,
                  isFavorite: isFavorite,
                  istoric: rez_istoric
                });
              }

            }

            if (rez_tip === "card") {
              const ivHex3 = dataObject2.data.nume.iv;
              const encDataHex3 = dataObject2.data.nume.encData;
              const tagHex3 = dataObject2.data.nume.tag;

              const rez_nume = await decriptareDate(encDataHex3, ivHex3, tagHex3, importedKey);

              const ivHex4 = dataObject2.data.numarItem.iv;
              const encDataHex4 = dataObject2.data.numarItem.encData;
              const tagHex4 = dataObject2.data.numarItem.tag;

              const rez_numarCard = await decriptareDate(encDataHex4, ivHex4, tagHex4, importedKey);

              const ivHex5 = dataObject2.data.numePosesor.iv;
              const encDataHex5 = dataObject2.data.numePosesor.encData;
              const tagHex5 = dataObject2.data.numePosesor.tag;

              const rez_posesorCard = await decriptareDate(encDataHex5, ivHex5, tagHex5, importedKey);

              const ivHex6 = dataObject2.data.dataExpirare.iv;
              const encDataHex6 = dataObject2.data.dataExpirare.encData;
              const tagHex6 = dataObject2.data.dataExpirare.tag;

              const rez_dataExpirare = await decriptareDate(encDataHex6, ivHex6, tagHex6, importedKey);

              const ivHex7 = dataObject2.data.comentariu.iv;
              const encDataHex7 = dataObject2.data.comentariu.encData;
              const tagHex7 = dataObject2.data.comentariu.tag;
              const rez_comentariu = await decriptareDate(encDataHex7, ivHex7, tagHex7, importedKey);

              let ivHex8 = null, encDataHex8 = null, tagHex8 = null, rez_istoric = null;
              console.log(dataObject2);
              if (dataObject2.data.istoric) {
                ivHex8 = dataObject2.data.istoric.iv;
                encDataHex8 = dataObject2.data.istoric.encData;
                tagHex8 = dataObject2.data.istoric.tag;
                rez_istoric = await decriptareDate(encDataHex8, ivHex8, tagHex8, importedKey);

              }

              console.log("Datele primite de la server aferente cardului:", rez_tip, rez_nume, rez_numarCard, rez_posesorCard, rez_comentariu, rez_dataExpirare, isDeleted, isFavorite);
              carduriItems.push({
                importedKey: importedKey,
                nume: rez_nume,
                tipitem: rez_tip,
                numarCard: rez_numarCard,
                posesorCard: rez_posesorCard,
                dataExpirare: rez_dataExpirare,
                comentariu: rez_comentariu,
                created_at: created_at,
                modified_at: modified_at,
                version: version,
                id_owner: id_owner,
                id_item: id_item,
                isDeleted: isDeleted,
                isFavorite: isFavorite,
                istoric: rez_istoric
              });

              fetchedItems.push({
                importedKey: importedKey,
                nume: rez_nume,
                tipitem: rez_tip,
                numarCard: rez_numarCard,
                posesorCard: rez_posesorCard,
                dataExpirare: rez_dataExpirare,
                comentariu: rez_comentariu,
                created_at: created_at,
                modified_at: modified_at,
                version: version,
                id_owner: id_owner,
                id_item: id_item,
                isDeleted: isDeleted,
                isFavorite: isFavorite,
                istoric: rez_istoric
              });

              if (isFavorite) {
                favoriteItems.push({
                  importedKey: importedKey,
                  nume: rez_nume,
                  tipitem: rez_tip,
                  numarCard: rez_numarCard,
                  posesorCard: rez_posesorCard,
                  dataExpirare: rez_dataExpirare,
                  comentariu: rez_comentariu,
                  created_at: created_at,
                  modified_at: modified_at,
                  version: version,
                  id_owner: id_owner,
                  id_item: id_item,
                  isDeleted: isDeleted,
                  isFavorite: isFavorite,
                  istoric: rez_istoric
                });
              }

            }
            if (rez_tip === "adresa") {
              const ivHex3 = dataObject2.data.nume.iv;
              const encDataHex3 = dataObject2.data.nume.encData;
              const tagHex3 = dataObject2.data.nume.tag;

              const rez_nume = await decriptareDate(encDataHex3, ivHex3, tagHex3, importedKey);

              const ivHex4 = dataObject2.data.adresa.iv;
              const encDataHex4 = dataObject2.data.adresa.encData;
              const tagHex4 = dataObject2.data.adresa.tag;

              const rez_adresa = await decriptareDate(encDataHex4, ivHex4, tagHex4, importedKey);

              const ivHex5 = dataObject2.data.oras.iv;
              const encDataHex5 = dataObject2.data.oras.encData;
              const tagHex5 = dataObject2.data.oras.tag;

              const rez_oras = await decriptareDate(encDataHex5, ivHex5, tagHex5, importedKey);

              const ivHex6 = dataObject2.data.judet.iv;
              const encDataHex6 = dataObject2.data.judet.encData;
              const tagHex6 = dataObject2.data.judet.tag;

              const rez_jduet = await decriptareDate(encDataHex6, ivHex6, tagHex6, importedKey);

              const ivHex7 = dataObject2.data.codPostal.iv;
              const encDataHex7 = dataObject2.data.codPostal.encData;
              const tagHex7 = dataObject2.data.codPostal.tag;

              const rez_codPostal = await decriptareDate(encDataHex7, ivHex7, tagHex7, importedKey);

              const ivHex8 = dataObject2.data.comentariu.iv;
              const encDataHex8 = dataObject2.data.comentariu.encData;
              const tagHex8 = dataObject2.data.comentariu.tag;
              const rez_comentariu = await decriptareDate(encDataHex8, ivHex8, tagHex8, importedKey);

              let ivHex9 = null, encDataHex9 = null, tagHex9 = null, rez_istoric = null;
              console.log(dataObject2);
              if (dataObject2.data.istoric) {
                ivHex9 = dataObject2.data.istoric.iv;
                encDataHex9 = dataObject2.data.istoric.encData;
                tagHex9 = dataObject2.data.istoric.tag;
                rez_istoric = await decriptareDate(encDataHex9, ivHex9, tagHex9, importedKey);

              }

              console.log("Datele primite de la server aferente adresei:", rez_tip, rez_nume, rez_adresa, rez_oras, rez_jduet, rez_codPostal, rez_comentariu, isDeleted, isFavorite);
              adreseItems.push({
                importedKey: importedKey,
                nume: rez_nume,
                tipitem: rez_tip,
                adresa: rez_adresa,
                oras: rez_oras,
                judet: rez_jduet,
                codPostal: rez_codPostal,
                comentariu: rez_comentariu,
                created_at: created_at,
                modified_at: modified_at,
                version: version,
                id_owner: id_owner,
                id_item: id_item,
                isDeleted: isDeleted,
                isFavorite: isFavorite,
                istoric: rez_istoric
              });

              fetchedItems.push({
                importedKey: importedKey,
                nume: rez_nume,
                tipitem: rez_tip,
                adresa: rez_adresa,
                oras: rez_oras,
                judet: rez_jduet,
                codPostal: rez_codPostal,
                comentariu: rez_comentariu,
                created_at: created_at,
                modified_at: modified_at,
                version: version,
                id_owner: id_owner,
                id_item: id_item,
                isDeleted: isDeleted,
                isFavorite: isFavorite,
                istoric: rez_istoric
              });

              if (isFavorite) {
                favoriteItems.push({
                  importedKey: importedKey,
                  nume: rez_nume,
                  tipitem: rez_tip,
                  adresa: rez_adresa,
                  oras: rez_oras,
                  judet: rez_jduet,
                  codPostal: rez_codPostal,
                  comentariu: rez_comentariu,
                  created_at: created_at,
                  modified_at: modified_at,
                  version: version,
                  id_owner: id_owner,
                  id_item: id_item,
                  isDeleted: isDeleted,
                  isFavorite: isFavorite,
                  istoric: rez_istoric
                });
              }
            }

          } catch (error) {
            console.error('Eroare la decriptarea item-ului cu ID-ul:', item.id_item, error);
          }

        }
        setItems(fetchedItems); setFavoriteItems(favoriteItems); setParoleItems(paroleItems); setRemoteItmes(remoteItems);
        setNotiteItmes(notiteItems); setCarduriItems(carduriItems); setAdreseItems(adreseItems);
      } else {
        console.error('Failed to fetch items', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (savedKey) {
      fetchItems();
    }
  }, [savedKey]);

  return (

    <div className="flex flex-col sm:flex-row sm:h-screen bg-gray-100 h-screen">
      {/* Sectiune de Dashboard */}
      <div className={` ${meniuExtins ? 'w-full sm:w-1/5' : 'w-full sm:w-16'} bg-gray-800 text-white p-4 transition-all duration-400 myElement overflow-hidden`}>
        {/* Container flex pentru butonul de burger și logo */}
        <div className="relative flex items-center justify-between mb-4">
          {/* Butonul de toggle */}
          <button onClick={handleToggle} className="text-white focus:outline-none absolute left-0 sm:mt-8 hover:text-gray-300 hover:opacity-100 p-1 -ml-2 rounded-lg">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>

          {/* Logo-ul și titlul vizibile doar pe ecrane mici */}
          <div className="font-bold text-2xl flex gap-2 mx-auto text-white sm:hidden items-center">
            <img src={Logo} alt="Logo" className="w-8 filter invert" />
            EnginePassword
          </div>
        </div>

        {/* Titlul "Seiful meu" - vizibil doar când bara este extinsă */}
        {meniuExtins && <h2 className="text-2xl font-bold mb-4 sm:mt-16">Seiful meu</h2>}

        {/* Meniul de opțiuni */}
        {meniuExtins && (
          <ul className="overflow-y-auto">
            <li onClick={() => selecteazaSectiune('toate')}
              className={`mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer 
              flex items-center transition-all duration-300 ${sectiuneItemi == "toate" ? 'bg-green-700 rounded px-4' : ''}`}>
              <img src={Cube} alt="User Icon" className="w-6 h-6 mr-2 filter invert" />
              <span>Toate datele</span>
            </li>

            <li onClick={() => selecteazaSectiune('favorite')}
              className={`mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer 
              flex items-center transition-all duration-300 ${sectiuneItemi == "favorite" ? 'bg-green-700 rounded px-4' : ''}`}>
              <img src={FavoriteIcon} alt="User Icon" className="w-6 h-6 mr-2 filter invert" />
              <span>Favorite</span>
            </li>

            <hr className="border-t border-green-700 my-2" />

            <li onClick={() => selecteazaSectiune('parole')}
              className={`mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer 
              flex items-center transition-all duration-300 ${sectiuneItemi == "parole" ? 'bg-green-700 rounded px-4' : ''}`}>
              <img src={PasswordLogo} alt="User Icon" className="w-6 h-6 mr-2 filter invert" />
              <span>Parole</span>
            </li>

            <li onClick={() => selecteazaSectiune('notite')} className={`mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer 
              flex items-center transition-all duration-300 ${sectiuneItemi == "notite" ? 'bg-green-700 rounded px-4' : ''}`}>
              <img src={Notes} alt="User Icon" className="w-6 h-6 mr-2 filter invert" />
              <span>Notițe</span>
            </li>

            <li onClick={() => selecteazaSectiune('carduri')} className={`mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer 
              flex items-center transition-all duration-300 ${sectiuneItemi == "carduri" ? 'bg-green-700 rounded px-4' : ''}`}>
              <img src={CreditCard} alt="Grupuri Icon" className="w-6 h-6 mr-2 filter invert"></img>
              <span>Carduri bancare</span>
            </li>

            <li onClick={() => selecteazaSectiune('adrese')} className={`mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer 
              flex items-center transition-all duration-300 ${sectiuneItemi == "adrese" ? 'bg-green-700 rounded px-4' : ''}`}>
              <img src={Address} alt="Grupuri Icon" className="w-6 h-6 mr-2 filter invert"></img>
              <span>Adrese</span>
            </li>

            <li onClick={() => selecteazaSectiune('remoteworking')} className={`mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer 
              flex items-center transition-all duration-300 ${sectiuneItemi == "remoteworking" ? 'bg-green-700 rounded px-4' : ''}`}>
              <img src={RemoteWorking} alt="Identitate Icon" className="w-6 h-6 mr-2 filter invert"></img>
              <span>Remote Working</span>
            </li>


            <hr className="border-t border-green-600 my-2" />

            <li onClick={() => selecteazaSectiune('grupuri')} className={`mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer 
              flex items-center transition-all duration-300 ${sectiuneItemi == "grupuri" ? 'bg-green-700 rounded px-4' : ''}`}>
              <img src={People} alt="Grupuri Icon" className="w-6 h-6 mr-2 filter invert"></img>
              <span>Grupurile mele</span>
            </li>

            <li onClick={() => selecteazaSectiune('share')} className={`mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer 
              flex items-center transition-all duration-300 ${sectiuneItemi == "share" ? 'bg-green-700 rounded px-4' : ''}`}>
              <img src={ShareLogo} alt="Share Icon" className="w-6 h-6 mr-2 filter invert" />
              <span>Parole Share-uite</span>
            </li>

            <hr className="border-t border-green-600 my-2" />

            <li onClick={() => setsectiuneItemi('contulmeu')} className="mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer flex items-center transition-all duration-300 sm:hidden">
              <img src={User2} alt="User Icon" className="w-6 h-6 mr-2 filter invert" />
              <span>Contul meu</span>
            </li>

            <li onClick={() => setsectiuneItemi('itemieliminati')} className={`mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer 
              flex items-center transition-all duration-300 ${sectiuneItemi == "itemieliminati" ? 'bg-green-700 rounded px-4' : ''}`}>
              <img src={DeletedIcon} alt="Deleted Icon" className="w-6 h-6 mr-2 filter invert" />
              <span>Itemi Eliminați</span>
            </li>

            <li onClick={() => setsectiuneItemi('Ajutor')} className={`mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer 
              flex items-center transition-all duration-300 ${sectiuneItemi == "Ajutor" ? 'bg-green-700 rounded px-4' : ''}`}>
              <img src={HelpLogo} alt="Help Icon" className="w-6 h-6 mr-2 filter invert" />
              <span>Ajutor</span>
            </li>
            <hr className="border-t border-green-700 my-2" />
          </ul>
        )}

        {/* Meniul de pe vertical pentru ecranele mici */}
        {
          <div className={`${meniuExtinsVerticala ? 'h-3/5 fixed top-20 left-0 bg-gray-800 text-white py-4 w-full overflow-y-auto transition-all duration-400 opacity-100' : 'h-0 opacity-0 pointer-events-none'}z-[2000]`}>
            <ul className="flex flex-col gap-2 ml-4">
              <li onClick={() => selecteazaSectiune('toate')} className="mb-2 hover:bg-green-700 hover:rounded-lg hover:px-4 cursor-pointer flex items-center transition-all duration-300">
                <img src={Cube} alt="User Icon" className="w-6 h-6 mr-2 filter invert" />
                <span>Toate datele</span>
              </li>

              <li onClick={() => selecteazaSectiune('favorite')} className="mb-2 hover:bg-green-700 hover:rounded-lg hover:px-4 cursor-pointer flex items-center transition-all duration-300">
                <img src={FavoriteIcon} alt="User Icon" className="w-6 h-6 mr-2 filter invert" />
                <span>Favorite</span>
              </li>

              <hr className="border-t border-green-700 my-2 mr-6" />

              <li onClick={() => selecteazaSectiune('parole')} className="mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer flex items-center transition-all duration-300">
                <img src={PasswordLogo} alt="User Icon" className="w-6 h-6 mr-2 filter invert" />
                <span>Parole</span>
              </li>

              <li onClick={() => selecteazaSectiune('notite')} className="mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer flex items-center transition-all duration-300">
                <img src={Notes} alt="User Icon" className="w-6 h-6 mr-2 filter invert" />
                <span>Notițe</span>
              </li>

              <li onClick={() => selecteazaSectiune('carduri')} className="mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer flex items-center transition-all duration-300">
                <img src={CreditCard} alt="User Icon" className="w-6 h-6 mr-2 filter invert" />
                <span>Carduri bancare</span>
              </li>

              <li onClick={() => selecteazaSectiune('adrese')} className="mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer flex items-center transition-all duration-300">
                <img src={Address} alt="User Icon" className="w-6 h-6 mr-2 filter invert" />
                <span>Adrese</span>
              </li>

              <hr className="border-t border-green-600 my-2 mr-6" />

              <li className="mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer flex items-center transtion-all duration-300">
                <img src={People} alt="Grupuri Icon" className="w-6 h-6 mr-2 filter invert"></img>
                <span>Grupurile mele</span>
              </li>

              <li className="mb-2 hover:bg-green-700 hover:rounded hover:px-4 flex cursor-pointer items-center transition-all duration-30">
                <img src={ShareLogo} alt="Share Icon" className="w-6 h-6 mr-2 filter invert" />
                <span>Parole Share-uite</span>
              </li>

              <hr className="border-t border-green-600 my-2 mr-6" />

              <li onClick={() => setsectiuneItemi('contulmeu')} className="mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer flex items-center transition-all duration-300 sm:hidden">
                <img src={User2} alt="User Icon" className="w-6 h-6 mr-2 filter invert" />
                <span>Contul meu</span>
              </li>

              <li onClick={() => setsectiuneItemi('itemieliminati')} className="mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer flex items-cneter transition-all duration-300">
                <img src={DeletedIcon} alt="Deleted Icon" className="w-6 h-6 mr-2 filter invert" />
                <span>Itemi Eliminati</span>
              </li>

              <li onClick={() => setsectiuneItemi('Ajutor')} className="mb-2 hover:bg-green-700 hover:rounded hover:px-4 cursor-pointer flex items-cneter transition-all duration-300">
                <img src={HelpLogo} alt="Help Icon" className="w-6 h-6 mr-2 filter invert" />
                <span>Ajutor</span>
              </li>

              <hr className="border-t border-green-700 my-2 mr-6" />
            </ul>
          </div>
        }
      </div>

      {/* Linia de separare verticala */}
      {<div className="hidden sm:block w-[5px] bg-green-600"></div>}

      {/* Sectiunea de lucru */}
      <div className={`flex-1 p-0 bg-gray-100 overflow-y-auto sm:overflow-visible`}>
        {/* Bara orizontala */}
        < div className="shadow-lg bg-green-600 w-full sm:flex items-center sm:py-2" >
          {/* Logo-ul si titlul vizibile doar pe ecrane mari */}
          <div className="hidden sm:flex items-center w-full">
            {/*Logo-ul si titlul */}
            <div className="font-bold text-xl md:text-xl lg:text-3xl flex gap-2 text-white">
              <img src={Logo} alt="" className="w-11 filter invert" />
              EnginePassword
            </div>

            {/* Bara de cautare */}
            <div className="relative hidden sm:block ml-5">
              <input
                type="text"
                placeholder="Cauta..."
                color="black"
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`px-4 py-2 rounded-lg text-black ${isFocused ? 'bg-white' : 'bg-green-700'} w-40 md:w-52 lg:w-80 transition-colors duration-300`}
              />
            </div>

            {/* Contul meu */}
            <div className="ml-auto mr-6 flex items-center gap-4 text-white transition-all duration-300">
              <button onClick={() => setMeniuContulMeu(!showMeniuLContulmeuCascada)} className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-red-600 hover:bg-red-800">
                {initiale}
              </button>
            </div>
          </div>

        </div>
        {showMeniuLContulmeuCascada &&
          (<div className="absolute right-0 bg-gray-700 text-white border rounded-lg shadow-lg w-48 z-[1000] transition-all duration-600 ease-in-out mr-3" ref={menuRef}>
            <ul className="py-2 z-20">
              <li className="px-4 py-3 hover:bg-green-600 cursor-pointer z-50" onClick={() => selecteazaSectiune('ProfilUtilizator')}>Profil</li>
              <li className="px-4 py-3 hover:bg-green-600 cursor-pointer z-50">Setări</li>
              <li className="px-4 py-3 hover:bg-green-600 cursor-pointer z-50" onClick={deconectare}>Deconectare</li>
            </ul>
          </div>
          )}

        {/* Buotnul de creare de itemi noi */}
        <button onClick={() => setMeniuCreeazaItem(true)} className="fixed flex items-center bottom-8 right-3 rounded-full shadow-lg bg-green-600 px-4 py-4 text-white hover:bg-gray-700 transition-all duration-300 aliniere">
          <img src={AddIcon} alt="Add Icon" className='w-7 h-7 filter invert'></img>
          <span className='hidden md:flex font-semibold whitespace-nowrap ml-2 text-1xl hide-on-small-height'>Creează un Item</span>
        </button>

        {/* Paginile de lucru*/}
        {sectiuneItemi === 'toate' && savedKey && (<ItemsAllPage derivedKey={savedKey} items={items} fetchItems={fetchItems} />)}
        {sectiuneItemi === 'parole' && savedKey && <ParolePage derivedKey={savedKey} items={paroleItemsAll} fetchItems={fetchItems} />}
        {sectiuneItemi === 'notite' && savedKey && <NotitePage derivedKey={savedKey} items={notiteItemsAll} fetchItems={fetchItems} />}
        {sectiuneItemi === 'carduri' && savedKey && <CarduriBancarePage derivedKey={savedKey} items={carduriItemsAll} fetchItems={fetchItems} />}
        {sectiuneItemi === 'adrese' && savedKey && <AdresePage derivedKey={savedKey} items={adreseAll} fetchItems={fetchItems} />}
        {sectiuneItemi === 'favorite' && <FavoritePage derivedKey={savedKey} items={favoriteItemsAll} fetchItems={fetchItems} />}
        {sectiuneItemi === 'grupuri' && <GrupuriPage derivedKey={savedKey} />}
        {sectiuneItemi === 'itemieliminati' && <ItemiStersi derivedKey={savedKey} />}
        {sectiuneItemi === 'remoteworking' && <RemoteWorkingPage derivedKey={savedKey} items={RemoteItemsAll} fetchItems={fetchItems} />}

        {sectiuneItemi === 'Ajutor' && <HelpPage />}
        {sectiuneItemi === "ProfilUtilizator" && <MyAccountPage setMeniuContulMeu={setMeniuContulMeu} derivedkey={savedKey} />}

        {/*Popup-ul de la creeaza item Nou */}
        {shoMeniuCreeazaItem && (<PopupNewItem setShoMeniuCreeazaItem={setMeniuCreeazaItem} setShowParolaPopup={setShowParolaPopup} setShowNotitaPopup={setShowNotitaPopup} setShowCardPopup={setShowCardPopup} setShowAddressPopup={setShowAddressPopup} />)}
        {/*Popup-ul de la Parola */}
        {ShowParolaPopup && (<PopupParolaItem setShowParolaPopup={setShowParolaPopup} derivedKey={savedKey} fetchItems={fetchItems} />)}
        {ShowNotitaPopup && (<PopupNotitaItem setShowNotitaPopup={setShowNotitaPopup} derivedKey={savedKey} fetchItems={fetchItems} />)}
        {ShowCardPopup && (<PopupCardItem setShowCardPopup={setShowCardPopup} derivedKey={savedKey} fetchItems={fetchItems} />)}
        {ShowAdresaPopup && (<PopupNewAdrese setShowAddressPopup={setShowAddressPopup} derivedKey={savedKey} fetchItems={fetchItems} />)}
      </div>
    </div >
  );
};

export default AplicatiePage;
