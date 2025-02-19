import React from "react";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListIcon from "../../../assets/website/list.png"
import GridIcon from "../../../assets/website/visualization.png"
import ArrowBack from "../../../assets/website/back.png"
import "../../../App.css"
import GridAfisItems from "./GridAfisItems";
import PopupStergeItem from "../Popup_uri/PopupStergeItem";
import { FaEye, FaEyeSlash, FaCopy, FaEdit, FaSave } from 'react-icons/fa';


const allitems = [
    { nume: "Nume site 1", tipitem: "parola", username: "Username 1", parola: "parolatest1" },
    { nume: "Nume site 2", tipitem: "parola", username: "Username 2", parola: "parolatest2" },
    { nume: "Nume site 3", tipitem: "note", username: "Username 3", parola: "parolatest3" },
    { nume: "Nume site 4", tipitem: "grup", username: "Username 4", parola: "parolatest4" },
    { nume: "Nume site 5", tipitem: "parola", username: "Username 5", parola: "parolatest5" },
    { nume: "Nume site 6", tipitem: "card", username: "Username 6", parola: "parolatest6" },
    { nume: "Nume site 7", tipitem: "parola", username: "Username 7", parola: "parolatest7" },
    { nume: "Nume site 8", tipitem: "parola", username: "Username 8", parola: "parolatest8" },
    { nume: "Nume site 9", tipitem: "parola", username: "Username 9", parola: "parolatest9" },
    { nume: "Nume site 10", tipitem: "parola", username: "Username 10", parola: "parolatest10" },
    { nume: "Nume site 11", tipitem: "parola", username: "Username 11", parola: "parolatest11" },
    { nume: "Nume site 12", tipitem: "parola", username: "Username 12", parola: "parolatest12" },
    { nume: "Nume site 13", tipitem: "parola", username: "Username 13", parola: "parolatest13" },
    { nume: "Nume site 14", tipitem: "parola", username: "Username 14", parola: "parolatest14" },
    { nume: "Nume site 15", tipitem: "parola", username: "Username 15", parola: "parolatest15" },

]
const ItemsAllPage = ({ accessToken }) => {
    useEffect(() => {
        if (accessToken) {
            console.log("accesTOken primit\n");
        }
        else {
            console.log("Niciun token disponibil\n");
        }

    }, [accessToken]);
    const [isDeschisMeniuSortare, setIsDropdownOpen] = useState(false);
    const [OptiuneSelectata, setSelectedOption] = useState("Sortează după: Nume");

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDeschisMeniuSortare);
    };

    const handleOptionSelect = (optiune) => {
        setSelectedOption(optiune);
        setIsDropdownOpen(false);
    };

    const [stergeItem, setStergeItem] = useState(false);
    const [gestioneazaItem, setGestioneazaItem] = useState(null);


    const [isHovered, setIsHovered] = useState(false);


    const [showPassword, setShowPassword] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleWebsite = (text) => {
        if (text) {
            window.open(text, '_blank', 'noopener,noreferrer');
        }
    }

    // State pentru câmpuri editabile
    const [isEditing, setIsEditing] = useState({
        name: false,
        username: false,
        password: false,
        url: false,
        notes: false,
    });

    const [itemName, setItemName] = useState("Nume item");
    const [username, setUsername] = useState("exemplu_user");
    const [password, setPassword] = useState("parola_secreta");
    const [websiteUrl, setWebsiteUrl] = useState("http://example.com");
    const [notes, setNotes] = useState("Aici poți adăuga observații...");

    const [tipAfisare, setTipAfisare] = useState("grid");

    const navigate = useNavigate();

    const fetchData = async () => {
        if (!accessToken) {
            navigate('/login'); // Dacă tokenul nu există, redirecționează la login
            return;
        }

        try {
            const response = await fetch('http://localhost:9000/api/itemi', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            const data = await response.json();
            //setItems(data); // Setează itemii primiți de la API
        } catch (error) {
            //    console.error('Error fetching data:', error);
            //    navigate('/login'); // Dacă apare o eroare, redirecționează utilizatorul la login
        }
    };

    useEffect(() => {
        fetchData(); // Apelează funcția pentru a încărca itemii la montarea componentelor
    }, []);
    return (
        <div className="overflow-y-auto">
            <h2 className="font-bold text-2xl text-center mt-4 ">Toate Câmpurile</h2>
            <div className="flex flex-row aliniere_custom justify-between items-center mx-6 mt-4">
                {/*Sectiunea de vizualizare a datelor*/}
                <div className="flex space-x-2">
                    <button onClick={() => setTipAfisare("lista")} className="flex items-center px-2 space-x-2 py-2 rounded-lg bg-gray-100 ml-2 hover:bg-yellow-400">
                        <img src={ListIcon} alt="List Icon" className="w-6 h-6"></img>
                    </button>
                    <button onClick={() => setTipAfisare("grid")} className="flex items-center px-2 space-x-2 py-2 rounded-lg bg-gray-100 ml-2 hover:bg-yellow-400">
                        <img src={GridIcon} alt="List Icon" className="w-6 h-6"></img>
                    </button>
                </div>

                {/* Secțiunea de sortare */}
                <div className="relative">
                    {/*Buton de deschidere meniu select*/}
                    <button className="flex items-center px-4 space-x-2 py-2 rounded-lg bg-gray-100 md:mr-2" onClick={() => handleDropdownToggle()}>
                        {/* Model iconita sagetuta al meniului de select*/}
                        <span className="text-1xl font-semibold">{OptiuneSelectata}</span>
                        <svg
                            className={`w-4 h-4 transform transition-transform ${isDeschisMeniuSortare ? 'rotate-180' : 'rotate-0'}`}  /* Pentru rotatie*/
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {isDeschisMeniuSortare && <div className="absolute border rounded-lg bg-white shadow-lg w-full mt-2 z-[1000]">
                        <ul className="py-2">
                            <li className="px-4 py-2 cursor-pointer hover:bg-yellow-400" onClick={() => handleOptionSelect("Sortează după: Nume ")}>Nume</li>
                            <li className="px-4 py-2 cursor-pointer hover:bg-yellow-400" onClick={() => handleOptionSelect("Sortează după: Data ")}>Data Adaugarii</li>
                        </ul>
                    </div>
                    }
                </div>
            </div>

            <hr className="border-t-4 border-gray-500 my-4 rounded-full mx-12" />

            {/* Sectiunea de itemi */}
            {gestioneazaItem === null ? (tipAfisare === "lista" ? (// daca nu e  nicio parola selectata afisez lista de itemi; overflow-y pentru a derula in caz ca se termina ecranul
                <div>
                    {/*Ok1 */}
                </div>
            ) : tipAfisare === "grid" ? ( // daca nu e  niciun item selectat atunci afisez lista de itemi
                <GridAfisItems items={allitems} setGestioneazaItem={setGestioneazaItem} setStergeItem={setStergeItem} />) : null

            ) : (// daca selectez un item atunci dispare lista de itmei si afisez optiunile pentru itemul curent 
                //(deocamdata fac pentru parola)
                <div className="px-12">
                    <div className="block">
                        {/* Butonul de back */}
                        <button onClick={() => setGestioneazaItem(null)} className="px-2 py-2 cursor-pointer rounded-lg hover:bg-blue-400 transition-all duration-300 ease-in-out">
                            <img src={ArrowBack} alt="Arrow Back" className="w-7 h-7" />
                        </button>

                        {/* Nume itemului (parolei)*/}
                        <div className="flex items-center mt-4">
                            {/* campul de afisare/editare nume item */}
                            {isEditing.name ? (
                                <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} className="border border-gray-300 rounded px-2 py-1 w-full" />
                            ) : (<h2 className="font-semibold text-xl">{itemName}</h2>
                            )}

                            {/* butonul de ediatre si salvare editari*/}
                            <button onClick={() => setIsEditing({ ...isEditing, name: !isEditing.name })} className="ml-3 text-gray-500 hover:text-blue-500 transition">
                                {isEditing.name ? <FaSave /> : <FaEdit />}
                            </button>
                        </div>

                        {/* Username-ul de la parola */}
                        <div className="flex items-center border-b border-gray-300 mt-6 pb-2">
                            <p className="font-medium text-gray-700">Username: </p>
                            {/* campul de afisare/editare username de la parola */}
                            {isEditing.username ? (
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="ml-3 border border-gray-300 rounded px-2 py-1" />
                            ) : (<span className="ml-3 text-gray-800">{username}</span>
                            )}
                            {/* Butonul de copiere Username */}
                            <button onClick={() => handleCopy(username)} className="ml-3 text-gray-500 hover:text-blue-500 transition">
                                <FaCopy />
                            </button>
                            <button onClick={() => setIsEditing({ ...isEditing, username: !isEditing.username })} className="ml-3 text-gray-500 hover:text-blue-500 transition">
                                {isEditing.username ? <FaSave /> : <FaEdit />}
                            </button>
                        </div>

                        {/* Parola  de la parola Item */}
                        <div className="flex items-center border-b border-gray-300 mt-4 pb-2">
                            <p className="font-medium text-gray-700">Parola: </p>
                            {/* Butonul de editare parola */}
                            {isEditing.password ? (
                                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="ml-3 border border-gray-300 rounded px-2 py-1" />
                            ) : (<span className="ml-3 text-gray-800">{showPassword ? password : "********"}</span>
                            )}
                            {/* Butonul de Afisare Parola */}
                            <button onClick={() => setShowPassword(!showPassword)} className="ml-3 text-gray-500 hover:text-blue-500 transition">
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            {/* Butonul de copiere Parola */}
                            <button onClick={() => handleCopy(password)} className="ml-3 text-gray-500 hover:text-blue-500 transition">
                                <FaCopy />
                            </button>
                            {/* Butonul de editare Parola Mai trebuie sa adaug aia de generare cu cubul */}
                            <button onClick={() => setIsEditing({ ...isEditing, password: !isEditing.password })} className="ml-3 text-gray-500 hover:text-blue-500 transition">
                                {isEditing.password ? <FaSave /> : <FaEdit />}
                            </button>
                        </div>

                        {/* URL-ul de la parola item */}
                        <div className="flex items-center mt-6 pb-2">
                            <h3 className="font-medium">Adresa URL:</h3>
                            {/* Campul de afis/edit de edit url */}
                            {isEditing.url ? (<input type="text" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="ml-3 border border-gray-300 rounded px-2 py-1" />
                            ) : (
                                <span onClick={() => handleWebsite(websiteUrl)} className="ml-3 text-blue-500 cursor-pointer hover:underline">
                                    {websiteUrl}
                                </span>
                            )}
                            {/* Butonul de edit/salvare url */}
                            {/* ... se cheam spread operator, copiaza toate proprietatile obiectului curent in cazul meu le iau si le suprascriu */}
                            <button onClick={() => setIsEditing({ ...isEditing, url: !isEditing.url })} className="ml-3 text-gray-500 hover:text-blue-500 transition">
                                {isEditing.url ? <FaSave /> : <FaEdit />}
                            </button>
                        </div>

                        {/* Note/Mențiuni */}
                        <div className="mt-6">
                            <h3 className="font-medium">Note/Mențiuni:</h3>
                            {/* Campul de afis/edit de edit mentiuni */}
                            {isEditing.notes ? (<textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 mt-2" />
                            ) : (<p className="mt-2 text-gray-700">{notes}</p>
                            )}
                            <button onClick={() => setIsEditing({ ...isEditing, notes: !isEditing.notes })} className="text-gray-500 hover:text-blue-500 transition">
                                {isEditing.notes ? <FaSave /> : <FaEdit />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/*Popup de Stergere item */}
            {stergeItem && <PopupStergeItem setShowPopupStergeItem={setStergeItem} />}


        </div>
    );
};

export default ItemsAllPage;