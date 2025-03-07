const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;
const CONNECTIONS_FILE = "saved_connections.json";
const SSH_KEY_DIR = "C:\\Users\\Public\\SSHKeys"; // Folder unde sunt stocate cheile SSH

app.use(cors());
app.use(express.json());

// 📌 Funcție pentru a citi conexiunile salvate
const getSavedConnections = () => {
    try {
        if (fs.existsSync(CONNECTIONS_FILE)) {
            const data = fs.readFileSync(CONNECTIONS_FILE, "utf8");
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("❌ Error reading connections file:", error);
    }
    return [];
};

// 📌 Funcție pentru a salva o nouă conexiune
const saveConnection = (host, user) => {
    const savedConnections = getSavedConnections();
    const sshKeyPath = path.join(SSH_KEY_DIR, `${user}_id_rsa.ppk`);

    if (!savedConnections.some(conn => conn.host === host)) {
        savedConnections.push({ host, user, sshKeyPath });
        fs.writeFileSync(CONNECTIONS_FILE, JSON.stringify(savedConnections, null, 2), "utf8");
    }
};

//  Endpoint pentru verificare dacă serverul local rulează
app.get("/ping", (req, res) => {
    res.json({ message: "Server is running" });
});

//  Endpoint pentru a returna conexiunile salvate
app.get("/saved-connections", (req, res) => {
    res.json(getSavedConnections());
});

//  Endpoint pentru verificarea cheii SSH
app.get("/check-ssh-key", (req, res) => {
    const { host } = req.query;
    if (!host) {
        return res.status(400).json({ error: "Host is required" });
    }

    const savedConnections = getSavedConnections();
    const connection = savedConnections.find(conn => conn.host === host);

    if (!connection) {
        return res.status(404).json({ exists: false, message: "No saved connection for this host" });
    }

    if (fs.existsSync(connection.sshKeyPath)) {
        res.json({ exists: true, user: connection.user, sshKeyPath: connection.sshKeyPath });
    } else {
        res.status(404).json({ exists: false, message: "SSH key not found" });
    }
});

app.post("/launch-ssh", (req, res) => {
    const { host, terminal } = req.body;

    if (!host || !terminal) {
        return res.status(400).json({ error: "Missing SSH credentials or terminal type" });
    }

    // 📌 Căutăm conexiunea salvată pentru acest host
    const savedConnections = getSavedConnections();
    const connection = savedConnections.find(conn => conn.host === host);

    if (!connection) {
        return res.status(400).json({ error: "No saved connection for this host!" });
    }

    const { user, sshKeyPath } = connection;

    if (!fs.existsSync(sshKeyPath)) {
        return res.status(400).json({ error: "SSH key file not found!" });
    }

    let command = null;

    if (terminal === "putty") {
        command = `"C:\\Program Files\\PuTTY\\putty.exe" -ssh ${user}@${host} -i "${sshKeyPath}"`;


    }
    else if (terminal === "mremoteng") {
        const connectionId = `{${Date.now()}}`;

        const xmlContent = `<?xml version="1.0"?>
        <Connections>
            <Connection>
                <Id>${connectionId}</Id>
                <Name>${host}</Name>
                <Protocol>SSH</Protocol>
                <Hostname>${host}</Hostname>
                <Port>22</Port>
                <Username>${user}</Username>
                <SecureShellKeyFile>${sshKeyPath}</SecureShellKeyFile>
            </Connection>
        </Connections>`;

        const xmlFilePath = "C:\\Users\\Public\\mRemoteNG_Session.xml";
        fs.writeFileSync(xmlFilePath, xmlContent, "utf8");

        command = `"C:\\Program Files (x86)\\mRemoteNG\\mRemoteNG.exe" /openfile:"${xmlFilePath}" /id:${connectionId}`;
    }
    else if (terminal === "windows-terminal") {
        command = `wt new-tab ssh -i "${sshKeyPath}" ${user}@${host}`;
    }

    if (command) {
        console.log("🟢 Running command:", command);
        const child = spawn(command, { shell: true });

        child.on("error", (err) => {
            console.error("❌ Failed to start terminal:", err);
            res.status(500).json({ error: "Failed to launch terminal" });
        });

        res.json({ message: `${terminal} launched successfully` });
    } else {
        console.log("⚠️ `command` este null, deci `spawn()` nu va fi executat.");
    }
});


app.listen(PORT, () => {
    console.log(`Local server running at http://localhost:${PORT}`);
});
