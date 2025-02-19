import React, { useState, useEffect } from 'react';
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
import '../../App.css';

import ItemsAllPage from './ItemiPages/ItemsAllPage';
import ParolePage from './ItemiPages/ParolePage';
import NotitePage from './ItemiPages/NotitePage';
import CarduriBancarePage from './ItemiPages/CarduriBancarePage';
import MyAccountPage from './GestionareCont/MyAccountPage';
import HelpPage from './GestionareCont/HelpPage';
import FavoritePage from './ItemiPages/FavoritePage';
import GrupuriPage from './ItemiPages/GrupuriPage';

import PopupNewItem from './Popup_uri/PopupNewItem';
import PopupParolaItem from "./Popup_uri/PopupParolaItem";
import PopupNotitaItem from "./Popup_uri/PopupNotitaItem";

import { getKeyFromIndexedDB } from "../FunctiiDate/ContextKeySimetrice";

const AplicatiePage = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
  const [meniuExtins, setExtins] = useState(!isSmallScreen); // Extins doar dacă ecranul e mare
  const [meniuExtinsVerticala, setMeniuExtinsVerticala] = useState(false);

  const [accessToken, setAccessToken] = useState(null);
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

  useEffect(() => {
    const storedToken = sessionStorage.getItem('accessToken');
    if (storedToken) {
      const tokenParts = storedToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const expiryDate = payload.exp * 1000;

        if (expiryDate < Date.now()) {
          sessionStorage.removeItem('accessToken');
          navigate('/login');
        } else {
          setAccessToken(storedToken);
          console.log("Tockenul este", storedToken);
        }
      }
    } else {
      navigate('/login');
    }

    setLoading(false);
  }, [navigate]);

  //if (loading) {
  // return <div>Loading...</div>;
  // }


  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 640;
      setIsSmallScreen(isSmall);

      if (!isSmall) {
        setMeniuExtinsVerticala(false);
        setExtins(true); // Extins pe ecrane mari
      }
      else {
        setExtins(false); // Inchis pe ecrane mici
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
  const [shoMeniuCreeazaItem, setMeniuCreeazaItem] = useState(false);
  const [ShowParolaPopup, setShowParolaPopup] = useState(false);
  const [ShowNotitaPopup, setShowNotitaPopup] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (

    <div className="flex flex-col sm:flex-row sm:h-screen bg-gray-100 h-screen">
      {/* Sectiune de Dashboard */}
      <div className={` ${meniuExtins ? 'w-full sm:w-1/5' : 'w-full sm:w-16'} bg-gray-800 text-white p-4 transition-all duration-400 myElement overflow-hidden`}>
        {/* Container flex pentru butonul de burger și logo */}
        <div className="relative flex items-center justify-between mb-4">
          {/* Butonul de toggle */}
          <button onClick={handleToggle} className="text-white focus:outline-none absolute left-0 sm:mt-8 hover:bg-green-700 hover:opacity-100 p-1 -ml-2 rounded-lg">
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
              <span>Itemi Eliminati</span>
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
      <div className={`flex-1 p-0 bg-gray-100 overflow-y-auto`}>
        {/* Bara orizontala */}
        <div className="shadow-lg bg-green-600 w-full sm:flex items-center sm:py-2">
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
            <div className="ml-auto mr-3 flex items-center gap-4 text-white hover:bg-green-700 hover:rounded-full transition-all duration-300">
              <button onClick={() => setMeniuContulMeu(!showMeniuLContulmeuCascada)} className="flex flex-col md:flex-row items-center md:space-x-2 px-2 md:px-4 py-2 lg:text-2xl md:text-xl">
                <img src={User2} alt='Profile' className='w-8 h-8 rounded-full object-cover filter invert' />
                <span className='font-semibold whitespace-nowrap'>Contul meu</span>
              </button>
            </div>
          </div>

        </div>
        {showMeniuLContulmeuCascada &&
          (<div className="absolute right-0 bg-gray-700 text-white border rounded-lg shadow-lg w-48 z-[1000] transition-all duration-600 ease-in-out mr-3">
            <ul className="py-2 z-20">
              <li className="px-4 py-3 hover:bg-green-600 cursor-pointer z-50" onClick={() => selecteazaSectiune('ProfilUtilizator')}>Profil</li>
              <li className="px-4 py-3 hover:bg-green-600 cursor-pointer z-50">Setări</li>
              <li className="px-4 py-3 hover:bg-green-600 cursor-pointer z-50">Deconectare</li>
            </ul>
          </div>
          )}

        {/* Buotnul de creare de itemi noi */}
        <button onClick={() => setMeniuCreeazaItem(true)} className="fixed flex items-center bottom-8 right-3 rounded-full shadow-lg bg-green-600 px-4 py-4 text-white hover:bg-gray-700 transition-all duration-300 aliniere">
          <img src={AddIcon} alt="Add Icon" className='w-7 h-7 filter invert'></img>
          <span className='hidden md:flex font-semibold whitespace-nowrap ml-2 text-1xl hide-on-small-height'>Creeaza un Item</span>
        </button>

        {/* Paginile de lucru*/}
        {sectiuneItemi === 'toate' && accessToken && (<div className="overflow-y-auto"><ItemsAllPage accessToken={accessToken} /></div>)}
        {sectiuneItemi === 'parole' && accessToken && savedKey && <ParolePage accessToken={accessToken} derivedKey={savedKey} />}
        {sectiuneItemi === 'notite' && accessToken && <NotitePage accessToken={accessToken} />}
        {sectiuneItemi === 'carduri' && accessToken && <CarduriBancarePage accessToken={accessToken} />}
        {sectiuneItemi === 'favorite' && accessToken && <FavoritePage accessToken={accessToken} />}
        {sectiuneItemi === 'grupuri' && accessToken && <GrupuriPage accessToken={accessToken} derivedKey={savedKey} />}

        {sectiuneItemi === 'Ajutor' && accessToken && <HelpPage accessToken={accessToken} />}
        {sectiuneItemi === "ProfilUtilizator" && <MyAccountPage />}

        {/*Popup-ul de la creeaza item Nou */}
        {shoMeniuCreeazaItem && (<PopupNewItem setShoMeniuCreeazaItem={setMeniuCreeazaItem} setShowParolaPopup={setShowParolaPopup} setShowNotitaPopup={setShowNotitaPopup} />)}
        {/*Popup-ul de la Parola */}
        {ShowParolaPopup && (<PopupParolaItem setShowParolaPopup={setShowParolaPopup} accessToken={accessToken} derivedKey={savedKey} />)}
        {ShowNotitaPopup && (<PopupNotitaItem setShowNotitaPopup={setShowNotitaPopup} />)}
      </div>
    </div>
  );
};

export default AplicatiePage;
