import express from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { client } from '../postgres/postgres.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const authRouter = express.Router();

authRouter.post("/addUser", async (req, res) => {
    const { Nume, Prenume, Email, hashedPassword, SaltB64, PublicKey, EncryptedPrivateKey, EncryptedAesKey } = req.body;

    if (!Nume || !Prenume || !Email || !hashedPassword || !PublicKey || !EncryptedPrivateKey || !EncryptedAesKey || !SaltB64) {
        return res.status(400).send('Toate campurile sunt necesare!');
    }

    const result = await client.query('SELECT * FROM Utilizatori WHERE Email = $1', [Email]);
    if (result.rows.length > 0) {
        return res.status(400).send('Email deja folosit!');
    }

    try {
        const publicKeyBytes = Buffer.from(PublicKey, 'base64');
        await client.query(`INSERT INTO Utilizatori (Nume, Prenume, Email, Parola, Tip_ut, Status,Salt, PublicKey, 
            EncryptedPrivateKey,Encryptedsimmetrickey) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [Nume, Prenume, Email, hashedPassword, 1, 'active', SaltB64, publicKeyBytes, EncryptedPrivateKey, EncryptedAesKey]);

        console.log("Cont creat cu succes !");
        res.status(200).send('Contul a fost creat cu succes!');
    } catch (error) {
        console.error('Eroare la crearea contului:', error);
        res.status(401).send('Eroare la crearea contului.');
    }
});


authRouter.post("/login", async (req, res) => {
    const { Email, hashedPassword } = req.body;

    if (!Email || !hashedPassword) {
        console.log("Eroare primire date\n");
        return res.status(400).send("Date netrimise\n");
    }

    try {
        const result = await client.query("SELECT parola,id, CONCAT(nume, ' ', prenume) AS nume,tip_ut FROM Utilizatori WHERE Email=$1", [Email]);
        if (result.rows.length === 0) {
            return res.status(404).send("Utilizatorul nu există\n");
        }

        const hashStocat = result.rows[0].parola;
        const potrivire = hashedPassword === hashStocat;

        if (potrivire) {
            let TipUser = result.rows[0].tip_ut === 1 ? "Client" : "Admin";
            const accessToken = jwt.sign(
                { username: Email, sub: result.rows[0].id, name: result.rows[0].nume, role: TipUser },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1h' }
            );

            const refreshToken = jwt.sign(
                { username: Email, sub: result.rows[0].id, name: result.rows[0].nume, role: TipUser },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            );

            await client.query("UPDATE Utilizatori SET refresh_token = $1 WHERE Email = $2", [refreshToken, Email]);
            res.cookie("jwt", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: "None"
            });

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: false,
                maxAge: 60 * 60 * 1000, // 1 oră
                sameSite: "Lax"
            });

            console.log("Autentificare reușită");
            res.json({ message: "Autentificat cu succes" });
        } else {
            console.log("Parola incorectă");
            return res.status(401).send("Parola incorectă");
        }
    } catch (error) {
        console.error("Eroare în procesul de login", error);
        return res.status(500).send("Eroare server");
    }
});

authRouter.get('/validateToken', (req, res) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({ message: "Nu ești autentificat" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token invalid sau expirat" });
        }

        res.status(200).json({ name: user.name });
    });
});

authRouter.post("/getCopyEncryptedSimmetricKey", async (req, res) => {
    const { Email } = req.body;

    if (!Email) {
        console.log("Eroare primire date\n");
        return res.status(400).send("Date netrimise\n");
    }

    try {
        const result = await client.query("SELECT encode(copyencryptedsimmetrickey,'hex') as copyencryptedsimmetrickey  FROM Utilizatori WHERE Email=$1", [Email]);
        if (result.rows.length === 0) {
            return res.status(404).send("Nu s-a gasit cheia\n");
        }
        const copyencryptedsimmetrickey = result.rows[0].copyencryptedsimmetrickey;
        return res.status(200).send({ copyencryptedsimmetrickey: copyencryptedsimmetrickey });

    } catch (error) {
        console.error("Eroare in procesul de login", error);
        return res.status(500).send("Eroare server");
    }
});

authRouter.post('/getSalt', async (req, res) => {
    const { Email } = req.body;

    if (!Email) {
        console.log("Eroare primire date\n");
        return res.status(400).send("Date netrimise\n");
    }
    try {
        const result = await client.query("Select u.salt as salt from utilizatori u where u.email=$1;", [Email])
        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Eroare la adaugare copiei cheii: ", error);
        res.status(500).send();
    }

});

authRouter.post("/changePassword", async (req, res) => {
    const { Email, SaltB64, HashParola, EncryptedAesKey } = req.body;

    if (!Email || !SaltB64 || !HashParola || !EncryptedAesKey) {
        return res.status(400).send('Toate campurile sunt necesare!');
    }

    try {
        await client.query(`UPDATE Utilizatori SET parola=$1, salt=$2,encryptedsimmetrickey=$3 WHERE Email=$4`, [HashParola, SaltB64, EncryptedAesKey, Email]);

        console.log("Parola Actualizata cu succes !");
        return res.status(200).send({ message: 'Parola Actualizata cu succes' });
    } catch (error) {
        console.error('Eroare la crearea contului:', error);
        res.status(401).send('Eroare la crearea contului.');
    }
});

authRouter.post('/logout', (req, res) => {
    res.clearCookie('accessToken', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Lax" });
    res.clearCookie('jwt', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Lax" });
    return res.status(200).json({ message: 'Deconectat cu succes' });
});

authRouter.get("/me", (req, res) => {
    // Verificam cookie
    const token = req.cookies?.accessToken;
    if (!token) {
        return res.status(401).json({ message: "Nu ești autentificat" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        res.status(200).json({
            id: decoded.sub,
            email: decoded.username,
            name: decoded.name,
            role: decoded.role
        });
    } catch (error) {
        console.error("Eroare la verificarea tokenului:", error);
        res.status(403).json({ message: "Token invalid" });
    }
});

authRouter.post("/refresh", async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        return res.status(401).send("Nu există refresh token.");
    }

    const refreshToken = cookies.jwt;

    try {
        // Verificăm dacă refreshToken este valid
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Verificăm dacă refreshToken există în baza de date
        const result = await client.query("SELECT Email FROM Utilizatori WHERE RefreshToken = $1", [refreshToken]);
        if (result.rows.length === 0) {
            // Ștergem cookie-ul dacă token-ul este invalid
            res.clearCookie('jwt', { httpOnly: true });
            return res.status(403).send("Token invalid sau expirat.");
        }

        const email = result.rows[0].email;

        // accessToken
        const accessToken = jwt.sign(
            { username: email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        // refreshToken 
        const newRefreshToken = jwt.sign(
            { username: email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        // updatam refresh tokenul in baza de date
        await client.query("UPDATE Utilizatori SET RefreshToken = $1 WHERE Email = $2", [newRefreshToken, email]);

        // Trimitem noul refreshToken in cookie
        res.cookie('jwt', newRefreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

        // Returnam noul accessToken
        res.json({ accessToken });
    } catch (error) {
        console.error("Eroare la verificarea refresh token-ului:", error);

        // stergem cookie-ul dacă există o eroare
        res.clearCookie('jwt', { httpOnly: true });
        return res.status(403).send("Token invalid sau expirat.");
    }
});




export default authRouter;