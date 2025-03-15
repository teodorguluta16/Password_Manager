
const express = require("express");
const { spawn, exec } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/ping", (req, res) => {
    res.json({ message: "Server is running" });
});


app.post("/launch-ssh", (req, res) => {
    const { host, user, ppkKey, terminal } = req.body;

    if (!host || !user || !terminal) {
        console.log("eroare");
        return res.status(400).json({ error: "Missing SSH credentials or terminal type" });
    }

    let sshKeyPath;
    if (ppkKey) {
        const tempDir = os.tmpdir();
        sshKeyPath = path.join(tempDir, `temp_key_${Date.now()}.ppk`);
        fs.writeFileSync(sshKeyPath, ppkKey, "utf8");
        console.log("🔑 Temporary SSH key saved at:", sshKeyPath);
    }

    let command = null;
    if (terminal === "putty") {
        command = `"C:\\Program Files\\PuTTY\\putty.exe" -ssh ${user}@${host} -i "${sshKeyPath}"`;
    } else if (terminal === "windows-terminal") {
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

        if (ppkKey) {
            setTimeout(() => {
                fs.unlink(sshKeyPath, (err) => {
                    if (err) console.error("❌ Error deleting SSH key:", err);
                    else console.log("🗑️ Temporary PPK file deleted:", sshKeyPath);
                });
            }, 30000);
        }
    } else {
        console.log("⚠️ `command` este null, deci `spawn()` nu va fi executat.");
        res.status(400).json({ error: "Invalid terminal type" });
    }
});

app.listen(PORT, () => {
    console.log(`Local server running at http://localhost:${PORT}`);
});
