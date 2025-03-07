import React, { useState, useEffect } from "react";
import ListIcon from "../../../assets/website/list.png";
import GridIcon from "../../../assets/website/visualization.png";

const RemoteWorking = ({ derivedKey }) => {
    const [isDeschisMeniuSortare, setIsDropdownOpen] = useState(false);
    const [OptiuneSelectata, setSelectedOption] = useState("Sortează după: Nume");
    const [isLocalServerRunning, setIsLocalServerRunning] = useState(false);
    const [selectedTerminal, setSelectedTerminal] = useState("putty"); // Default: PuTTY

    // 🔹 State pentru gestionarea conexiunilor salvate
    const [savedConnections, setSavedConnections] = useState([]); // Lista de conexiuni SSH salvate
    const [selectedHost, setSelectedHost] = useState(""); // IP/host selectat
    const [username, setUsername] = useState(""); // Username completat automat
    const [sshKeyExists, setSshKeyExists] = useState(false); // ✅ Verifică dacă cheia SSH există

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

        fetch("http://localhost:3001/saved-connections")
            .then((res) => res.json())
            .then((data) => setSavedConnections(data));
    }, []);

    // 🔹 Funcția pentru selectarea unui IP/host salvat
    const handleHostSelect = (event) => {
        const host = event.target.value;
        setSelectedHost(host);

        // Verificăm dacă hostname-ul există în lista de conexiuni salvate
        const existingConnection = savedConnections.find(conn => conn.host === host);
        if (existingConnection) {
            setUsername(existingConnection.user);
        } else {
            setUsername("");
        }

        // ✅ Verificăm dacă cheia SSH este generată
        checkSshKey(host);
    };

    // 🔹 Verifică dacă cheia SSH există pe server
    const checkSshKey = async (host) => {
        try {
            const response = await fetch(`http://localhost:3001/check-ssh-key?host=${host}`);
            const data = await response.json();
            setSshKeyExists(data.exists);
        } catch (error) {
            console.error("Eroare la verificarea cheii SSH:", error);
        }
    };

    // 🔹 Funcția pentru lansarea SSH cu terminalul selectat
    const launchSSH = async () => {
        if (!selectedHost) {
            alert("Selectează sau introdu un IP/hostname!");
            return;
        }

        if (!sshKeyExists) {
            alert("⚠️ Cheia SSH lipsește! Trebuie să o generezi înainte de a te conecta.");
            return;
        }

        const requestBody = {
            host: selectedHost,
            user: username || "demo",
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

    return (
        <div className="bg-gray-100 p-6 rounded-md">
            <h2 className="font-bold text-2xl text-center mt-3">Conectare Remote</h2>

            {/* Input pentru IP/Hostname */}
            <div className="text-center mt-4">
                <input
                    type="text"
                    list="hosts"
                    className="border p-2 rounded w-80"
                    value={selectedHost}
                    onChange={handleHostSelect}
                    placeholder="Selectează sau introdu IP/hostname"
                />
                <datalist id="hosts">
                    {savedConnections.map((conn, index) => (
                        <option key={index} value={conn.host} />
                    ))}
                </datalist>
            </div>

            {/* Username */}
            <div className="text-center mt-4">
                <input
                    type="text"
                    className="border p-2 rounded w-80"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                />
            </div>

            {/* Afișează statusul cheii SSH */}
            <div className="text-center mt-4">
                {sshKeyExists ? (
                    <span className="text-green-600 font-semibold">✅ Cheie SSH disponibilă</span>
                ) : (
                    <span className="text-red-600 font-semibold">⚠️ Cheie SSH lipsă</span>
                )}
            </div>

            {/* Selectare terminal */}
            <div className="text-center mt-4">
                <select
                    className="border p-2 rounded"
                    value={selectedTerminal}
                    onChange={(e) => setSelectedTerminal(e.target.value)}
                >
                    <option value="putty">PuTTY</option>
                    <option value="mremoteng">mRemoteNG</option>
                    <option value="windows-terminal">Windows Terminal</option>
                </select>

                {/* Buton de lansare */}
                {isLocalServerRunning ? (
                    <button onClick={launchSSH} className="bg-green-500 text-white px-4 py-2 rounded ml-2">
                        Launch SSH
                    </button>
                ) : (
                    <button
                        onClick={() => window.location.href = "https://your-server.com/LocalSSHServerInstaller.exe"}
                        className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
                    >
                        Install SSH Launcher
                    </button>
                )}
            </div>
        </div>
    );
};

export default RemoteWorking;
