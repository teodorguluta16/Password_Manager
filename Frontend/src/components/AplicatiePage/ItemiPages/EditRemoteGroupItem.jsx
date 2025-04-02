import React from "react";
import { useState, useEffect } from 'react';
import "../../../App.css"
import { criptareDate } from "../../FunctiiDate/FunctiiDefinite";
import { FaEye, FaEyeSlash, FaCopy, FaEdit, FaSave, FaArrowLeft } from 'react-icons/fa';

const EditRemoteGroupItem = ({ item, setGestioneazaRemoteItem }) => {

    const [initialValues, setInitialValues] = useState({
        nume: item.nume,
        username: item.username,
        parola: item.parola,
        host: item.host,
        ppkKey: item.ppkKey,
    });

    console.log(item.istoric);

    const [istoric, setIstoric] = useState(item.istoric);

    console.log("Tipul lui istoric:", typeof item.istoric);
    console.log("Conținutul lui istoric:", istoric);
    let parsedIstoric = [];

    try {
        parsedIstoric = JSON.parse(item.istoric);
        if (!Array.isArray(parsedIstoric)) {
            parsedIstoric = [];
        }
    } catch (error) {
        console.error("Eroare la parsarea istoricului:", error);
        parsedIstoric = [];
    }
    const importedKey = item.importedKey;

    const [itemNume, setItemNume] = useState(item.nume);
    const [userName, setItemUsername] = useState(item.username);
    const [parolaName, setItemParola] = useState(item.parola);
    const [hostNume, setItemHost] = useState(item.host);
    console.log(hostNume);
    const [ppkKey, setPPKkey] = useState(item.ppkKey);
    const [deEditat, setdeEditat] = useState({ nume: false, username: false, parola: false, url: false, ppkKey: false });

    const [esteCopiat, setEsteCopiat] = useState(false);
    const copieContinut = (text) => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setEsteCopiat(false), 2000);
    }

    const [showParola, setShowParola] = useState(false);

    const [uidItem, setUidItem] = useState(item.id_item);
    const [createdDate, setCreatedDate] = useState("");
    const [modifiedDate, setModifiedDate] = useState("");

    useEffect(() => {
        const dateObject = new Date(item.created_at);
        const formattedDate = dateObject.toLocaleString();
        setCreatedDate(formattedDate);
        setModifiedDate(formattedDate);
    }, [item.created_at, item.modified_at]);

    const [afisIstoric, setAfisIstoric] = useState(true);

    const [ownerNume, setOwnerNume] = useState("");
    const [ownerPrenume, setOwnerPrenume] = useState("");

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch('http://localhost:9000/api/getOwner', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: "include"
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Datele primite de la server: ", data);
                    setOwnerNume(data[0].nume);
                    setOwnerPrenume(data[0].prenume);
                } else {
                    console.error('Failed to fetch items', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };
        fetchItems();
    }, []);

    const salveazaToateModificarile = async () => {
        let modificari = [];

        try {
            if (itemNume !== initialValues.nume) {
                modificari.push("Nume");
            }
            if (userName !== initialValues.username) {
                modificari.push("Username");
            }
            if (parolaName !== initialValues.parola) {
                modificari.push("Parola");
            }
            if (hostNume !== initialValues.hostNume) {
                modificari.push("Host");
            }
            if (ppkKey !== initialValues.ppkKey) {
                modificari.push("Cheia PPK");
            }
            console.log("Modificarile noi:", itemNume, userName, parolaName, hostNume, ppkKey);
            if (modificari.length === 0) {
                console.log("Nicio modificare detectată.");
                return;
            }

            const now = new Date();
            const dataCurenta = now.toLocaleDateString();
            const oraCurenta = now.toLocaleTimeString();

            const nouIstoric = {
                operatie: `Actualizare Date: ${modificari.join(", ")}`,
                data: dataCurenta,
                time: oraCurenta,
            };

            console.log("Nou Istoric:", nouIstoric);

            console.log("istoric vechi", istoric);

            const istoricActualizat = [...parsedIstoric, nouIstoric];
            console.log("Istoricul actualizat: ", istoricActualizat);

            setIstoric(istoricActualizat);


            // criptare elemente
            const enc_Tip = await criptareDate("remoteConnexion", importedKey);
            const enc_NumeItem = await criptareDate(itemNume, importedKey);
            const enc_UsernameItem = await criptareDate(userName, importedKey);
            const enc_ParolaItem = await criptareDate(parolaName, importedKey);
            const enc_IstoricItem = await criptareDate(JSON.stringify(istoricActualizat), importedKey);
            const enc_Hostitem = await criptareDate(hostNume, importedKey);
            const enc_PPKkey = await criptareDate(ppkKey, importedKey);

            const jsonItem = {
                metadata: {
                    created_at: item.created_at,
                    modified_at: new Date().toISOString(),
                    version: item.version + 1
                },
                data: {
                    tip: { iv: enc_Tip.iv, encData: enc_Tip.encData, tag: enc_Tip.tag, },
                    nume: { iv: enc_NumeItem.iv, encData: enc_NumeItem.encData, tag: enc_NumeItem.tag },
                    username: { iv: enc_UsernameItem.iv, encData: enc_UsernameItem.encData, tag: enc_UsernameItem.tag },
                    parola: { iv: enc_ParolaItem.iv, encData: enc_ParolaItem.encData, tag: enc_ParolaItem.tag },
                    host: { iv: enc_Hostitem.iv, encData: enc_Hostitem.encData, tag: enc_Hostitem.tag },
                    ppkKey: { iv: enc_PPKkey.iv, encData: enc_PPKkey.encData, tag: enc_PPKkey.tag },
                    istoric: { iv: enc_IstoricItem.iv, encData: enc_IstoricItem.encData, tag: enc_IstoricItem.tag }

                },
            };

            const requestBody = {
                id_item: uidItem,
                continut: jsonItem
            };

            try {
                const response = await fetch('http://localhost:9000/api/grupuri/updateGroupItem', {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                    credentials: "include"
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Eroare la server:", errorText);
                    return;
                }
            } catch (error) {
                console.error("Eroare la trimitere", error);
            }

        } catch (error) {
            console.error('Error during the request:', error);
        }
    }

    const [isLocalServerRunning, setIsLocalServerRunning] = useState(false);
    const [selectedTerminal, setSelectedTerminal] = useState("putty");


    // 🔹 Verifică dacă serverul local rulează
    const checkLocalServer = async () => {
        try {
            const response = await fetch("http://localhost:3001/ping");
            return response.ok;
        } catch (error) {
            return false;
        }
    };

    // 🔹 Încarcă lista de conexiuni salvate la inițializarea componentei
    useEffect(() => {
        checkLocalServer().then(setIsLocalServerRunning);

        //fetch("http://localhost:3001/saved-connections")
        //    .then((res) => res.json())
        //    .then((data) => setSavedConnections(data));
    }, []);

    // 🔹 Funcția pentru lansarea SSH cu terminalul selectat
    const launchSSH = async () => {

        const requestBody = {
            host: hostNume,
            user: userName,
            ppkKey: ppkKey,
            terminal: selectedTerminal,
        };

        try {
            const response = await fetch("http://localhost:3001/launch-ssh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();
            console.log(data.message);
        } catch (error) {
            console.error("Error launching SSH:", error);
        }
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([ppkKey], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = "private_key.ppk";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };
    const handleDownloadLocalServer = async () => {

        const response = await fetch("http://localhost:9000/api/download", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include"
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "localServer.exe";
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            console.error("❌ Eroare la descărcare");
        }
    }

    return (
        <>
            <div className="px-2 mb-2 ">
                {/* Bara de sus cu butoane și titlu centrat */}
                <div className="flex items-center justify-between pb-3 mt-4">
                    {/* Butoanele pe stânga */}
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setGestioneazaRemoteItem(null)} className="py-1 px-1 cursor-pointer rounded-lg">
                            <FaArrowLeft className="w-6 h-6 hover:text-blue-600 transition-all duration-300 ease-in-out" />
                        </button>
                        <button onClick={salveazaToateModificarile} className="py-1 px-1 cursor-pointer rounded-lg">
                            <FaSave className="w-6 h-6 hover:text-green-600 transition-all duration-300 ease-in-out" />
                        </button>
                    </div>
                    <div className="flex-1 text-center">
                        {deEditat.nume ? (
                            <input
                                type="text"
                                value={itemNume}
                                onChange={(e) => setItemNume(e.target.value)}
                                className="px-2 py-1 text-xl font-semibold text-center"
                            />
                        ) : (
                            <h2 className="font-semibold text-3xl">{itemNume}</h2>
                        )}
                        <button onClick={() => setdeEditat({ ...deEditat, nume: !deEditat.nume })} className="lg:ml-3 text-gray-500 hover:text-blue-500 transition">
                            {deEditat.nume ? <FaSave /> : <FaEdit />}
                        </button>
                    </div>
                </div>
                <div>
                    {/* Selectare terminal */}
                    <div className="text-left mt-4">
                        <select
                            className="border py-2 px-4 rounded"
                            value={selectedTerminal}
                            onChange={(e) => setSelectedTerminal(e.target.value)}
                        >
                            <option value="putty">PuTTY</option>
                        </select>

                        {/* Buton de lansare */}
                        {isLocalServerRunning ? (
                            <button onClick={launchSSH} className="bg-green-500 text-white px-4 py-2 rounded ml-2">
                                Launch SSH
                            </button>
                        ) : (
                            <button
                                onClick={handleDownloadLocalServer}
                                className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
                            >
                                Install SSH Launcher
                            </button>
                        )}
                    </div>

                </div>
                <div className="custom-height4 overflow-y-auto">
                    <div className="flex flex-col  lg:flex-row mt-2">
                        <div className="grid sm:grid-cols-2 lg:gap-x-36 grid-cols-1 gap-6">
                            <div className="w-full flex flex-col space-y-6">
                                {/*Campul de host */}
                                <div className="flex itmes-center mt-6">
                                    <div className="flex flex-col lg:flex-row">
                                        <h3 className="font-medium">Hostname/IP :</h3>
                                        {deEditat.host ? (
                                            <input type="text" value={hostNume} onChange={(e) => setItemHost(e.target.value)} className="lg:ml-3 border boder-gray-300 rounded-lg py-1 "></input>
                                        ) : (
                                            <span className="lg:ml-3 text-blue-500 cursor-pointer hover:underline">{hostNume}</span>
                                        )}
                                        <button onClick={() => setdeEditat({ ...deEditat, host: !deEditat.host })} className="lg:ml-3 text-gray-500 hover:text-blue-500 transition">
                                            {deEditat.host ? <FaSave /> : <FaEdit />}
                                        </button>
                                    </div>

                                </div>
                                {/* Usernameul de la parola*/}
                                <div className="flex items-center mt-6 border-b border-gray-300 pb-2 w-full max-w-[400px]">
                                    <p className="font-medium text-gray-700">Username: </p>
                                    {deEditat.username ? (
                                        <input type="text" value={userName} onChange={(e) => setItemUsername(e.target.value)} className=" ml-3 border border-gray-300 rounded-lg px-2 py-1 w-3/4"></input>
                                    ) : (
                                        <span className="ml-3 text-gray-800">{userName}</span>
                                    )}

                                    <button onClick={() => setdeEditat({ ...deEditat, username: !deEditat.username })} className="ml-3 text-gray-500 hover:text-blue-500">
                                        {deEditat.username ? <FaSave /> : <FaEdit />}
                                    </button>
                                </div>
                                {/*Campul de parola*/}
                                <div className="flex items-center mt-6 border-b border-gray-300 pb-2 w-full max-w-[400px]">
                                    <p className="font-medium text-gray-700 w-20">Parola:</p>

                                    {deEditat.parola ? (
                                        <input
                                            type="password"
                                            value={parolaName}
                                            onChange={(e) => setItemParola(e.target.value)}
                                            className="ml-3 border border-gray-300 rounded-lg px-2 py-1 w-full max-w-[250px] truncate"
                                        />
                                    ) : (
                                        <span className="ml-3 text-gray-800 w-full max-w-[250px] truncate overflow-hidden">
                                            {showParola ? parolaName : '*'.repeat(parolaName.length)}
                                        </span>
                                    )}

                                    {/* Butonul de Afisare Parola */}
                                    <button onClick={() => setShowParola(!showParola)} className="ml-3 text-gray-500 hover:text-blue-500 transition">
                                        {showParola ? <FaEyeSlash /> : <FaEye />}
                                    </button>

                                    {/* Butonul de editare */}
                                    <button onClick={() => setdeEditat({ ...deEditat, parola: !deEditat.parola })} className="ml-3 text-gray-500 hover:text-blue-500">
                                        {deEditat.parola ? <FaSave /> : <FaEdit />}
                                    </button>
                                </div>
                                {/*Istoric */}
                                <div className='w-full  custom_top_istoric mt-5'>
                                    <div className="flex flex-col space-y-1 ">
                                        <h3 className="font-medium">Istoric Modificari:</h3>
                                        <h2 className="text-gray-700 cursor-pointer hover:underline text-gray-400" onClick={() => setAfisIstoric(!afisIstoric)}>{afisIstoric ? 'Ascunde' : 'Afiseaza'}</h2>
                                        {afisIstoric && (
                                            <div>
                                                {Array.isArray(parsedIstoric) && parsedIstoric.length > 0 ? (
                                                    <div className="h-48  overflow-y-auto border rounded-lg shadow-lg border-gray-300 border-2 bg-white mt-2">
                                                        {parsedIstoric.map((it, index) => (
                                                            <div key={index} className="py-1 mx-2">
                                                                <span className="font-semibold">{it.operatie}</span>
                                                                <div className="flex space-x-2">
                                                                    <span className="text-sm">{it.data}</span>
                                                                    <span className="text-sm">{it.time}</span>
                                                                </div>
                                                                <hr className="border-t-2 border-blue-400 my-1 rounded-full"></hr>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-600">Istoric Gol</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                            <div className="space-y-4 lg:mt-4">
                                {/* UID-ul itemului */}
                                <div className="flex flex-col lg:flex-row">
                                    <h3 className="font-medium">Record ID:</h3>
                                    <span className="lg:ml-3 text-blue-500">{uidItem}</span>
                                </div>
                                {/* Data creării și cine a creat */}
                                <div className="flex flex-col lg:flex-row">
                                    <h3 className="font-medium">Creat:</h3>
                                    <div className="ml-2">
                                        <div className="space-x-2">
                                            <span className="text-gray-700">{createdDate}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Proprietar */}
                                <div className="flex flex-col lg:flex-row">
                                    <h3 className="font-medium">Proprietar:</h3>
                                    <span className="text-gray-700 ml-2">{`${ownerNume} ${ownerPrenume}`}</span>
                                </div>
                                {/* Data modificării și cine a modificat */}
                                <div className="flex flex-col lg:flex-row">
                                    <h3 className="font-medium">Modificat:</h3>
                                    <div className="ml-2">
                                        <div className="space-x-2">
                                            <span className="text-gray-700">{modifiedDate}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col lg:flex-row lg:ml-4">
                                    <span className="text-gray-700 ">Versiune: {item.version}</span>
                                </div>
                                {/*Cheia PPK*/}
                                <div className="mt-6">
                                    <h3 className="font-medium">Cheia Privată:</h3>
                                    <button
                                        onClick={handleDownload}
                                        className="bg-orange-400 text-white px-4 py-2 rounded-md hover:bg-orange-600 mt-2"
                                    >
                                        Descarcă Cheia
                                    </button>
                                </div>
                            </div>


                        </div>
                    </div>

                </div>

            </div>
        </>
    );
};

export default EditRemoteGroupItem;