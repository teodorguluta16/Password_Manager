import React, { useState } from "react";
import forge from "node-forge";

const PopupNewPuttyConnection = ({ setPopupNewRemote, fetchItems }) => {
    const [numeItem, setNumeItem] = useState('');
    const [hostItem, setUrlItem] = useState('');
    const [usernameItem, setUserNamItem] = useState('');
    const [cheiePrivata, setCheiePrivata] = useState('');
    const [cheiePublica, setCheiePublica] = useState('');
    const [cheiePPK, setCheiePPK] = useState('');
    const [ppkFile, setPpkFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // ✅ Funcție pentru generarea cheilor SSH
    const generateSSHKeys = () => {
        const keypair = forge.pki.rsa.generateKeyPair({ bits: 4096 });

        // Convertim cheia privată în format PEM
        const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

        // Convertim cheia publică în format OpenSSH manual
        const publicKeyDer = forge.asn1.toDer(forge.pki.publicKeyToAsn1(keypair.publicKey)).getBytes();
        const publicKeyBase64 = btoa(publicKeyDer);
        const publicKeyOpenSSH = `ssh-rsa ${publicKeyBase64} ${usernameItem}`;

        // Setăm cheile generate în state
        setCheiePrivata(privateKeyPem);
        setCheiePublica(publicKeyOpenSSH);
        setCheiePPK('');

        console.log("✅ Cheie generată!");
    };

    // ✅ Funcție pentru descărcarea fișierelor `.pem`, `.ppk`, și `.pub`
    const downloadKeyFile = (keyContent, fileName) => {
        const blob = new Blob([keyContent], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };



    // ✅ Funcție pentru încărcarea unei chei PPK existente
    const handlePpkUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setPpkFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const ppkKeyContent = e.target.result;  // Stocăm conținutul fișierului într-o variabilă
                setCheiePPK(ppkKeyContent);  // Salvăm cheia PPK în state
                console.log("🔑 Cheia PPK încărcată:", ppkKeyContent);  // Afișăm cheia în consolă
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-opacity-50 bg-gray-400 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-4/5 md:w-1/2 h-3/4 md:h-5/6 p-6 flex flex-col items-center justify-center relative">
                <button className="absolute right-4 top-2 text-4xl cursor-pointer hover:text-red-300"
                    onClick={() => setPopupNewRemote(false)}>&times;</button>
                <h3 className="text-xl font-semibold text-center mb-6 relative">Conexiune Nouă</h3>

                <form className="flex flex-col w-full gap-2">
                    <div className="flex flex-row gap-2 ">
                        <div>
                            <label className="text-sm md:text-md font-medium">Nume Platforma</label>
                            <input type="text" value={numeItem} onChange={(e) => setNumeItem(e.target.value)}
                                className="border py-1 px-2 border-gray-600 rounded-md w-5/6 mt-2" />

                        </div>
                        <div>
                            <label className="text-sm md:text-md font-medium">Username</label>
                            <input type="text" value={usernameItem} onChange={(e) => setUserNamItem(e.target.value)}
                                className="border py-1 px-2 border-gray-600 rounded-md w-full mt-2" />
                        </div>

                    </div>

                    <label className="text-sm md:text-md font-medium">Host/IP</label>
                    <input type="text" value={hostItem} onChange={(e) => setUrlItem(e.target.value)}
                        className="border py-1 px-2 border-gray-600 rounded-md w-full" />



                    <label className="text-sm md:text-md font-medium">Generează cheie SSH</label>
                    <button type="button" onClick={generateSSHKeys}
                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition">Generează Cheie</button>

                    {cheiePrivata && (
                        <div className="flex flex-row gap-2 mt-2">
                            <button className="bg-yellow-600 text-white  py-2 px-2 rounded-md hover:bg-yellow-800 transition" type="button" onClick={() => downloadKeyFile(cheiePrivata, `${usernameItem}_id_rsa.pem`)}>
                                Descarcă Cheie Privată
                            </button>
                            <button className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-800 transition" type="button" onClick={() => downloadKeyFile(cheiePublica, `${usernameItem}_id_rsa.pub`)}>
                                Descarcă Cheie Publică
                            </button>
                        </div>
                    )}

                    {/* Opțiunea de a încărca un fișier PPK existent */}
                    <label className="text-sm md:text-md font-medium mt-4">Încarcă cheie PPK existentă</label>
                    <input type="file" accept=".ppk" onChange={handlePpkUpload}
                        className="border py-1 px-2 border-gray-600 rounded-md w-full" />


                    {/* Descărcare PPK doar dacă a fost generată sau încărcată */}
                    {cheiePPK && (
                        <button type="button" onClick={() => downloadKeyFile(cheiePPK, `${usernameItem}_id_rsa.ppk`)}>
                            Descarcă PPK
                        </button>
                    )}
                </form>
                <div className="flex justify-center items-center">
                    <button className="bg-green-600 w-full h-1/2 md:w-full md:h-2/3 items-center justify-center rounded-lg mt-6 py-1 px-3 hover:bg-yellow-500 text-white transition-all duration-200 mb-4">
                        Adaugă
                    </button>
                </div>
            </div >
        </div >
    );
};

export default PopupNewPuttyConnection;
