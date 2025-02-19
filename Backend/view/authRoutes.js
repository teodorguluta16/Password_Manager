import express from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { client } from '../postgres/postgres.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const authRouter = express.Router();

authRouter.post("/addUser", async (req, res) => {
    const { Nume, Prenume, Email, Parola, PublicKey, EncryptedPrivateKey, EncryptedAesKey } = req.body;

    if (!Nume || !Prenume || !Email || !Parola || !PublicKey || !EncryptedPrivateKey || !EncryptedAesKey) {
        return res.status(400).send('Toate campurile sunt necesare!');
    }

    // Verificam daca Userul exista deja
    const result = await client.query('SELECT * FROM Utilizatori WHERE Email = $1', [Email]);
    if (result.rows.length > 0) {
        return res.status(400).send('Email deja folosit!');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(Parola, salt);
    try {

        const saltParola = crypto.randomBytes(32).toString('hex');
        const publicKeyBytes = Buffer.from(PublicKey, 'base64');

        //const encryptedPrivateKeyJson = JSON.stringify(EncryptedPrivateKey);
        //const encryptedAesKeyJson = JSON.stringify(EncryptedAesKey);

        await client.query(`INSERT INTO Utilizatori (Nume, Prenume, Email, Parola, Tip_ut, Status,Salt, PublicKey, 
            EncryptedPrivateKey,Encryptedsimmetrickey) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [Nume, Prenume, Email, hashedPassword, 1, 'active', saltParola, publicKeyBytes, EncryptedPrivateKey, EncryptedAesKey]);

        console.log("Cont creat cu succes !");
        res.status(200).send('Contul a fost creat cu succes!');
    } catch (error) {
        console.error('Eroare la crearea contului:', error);
        res.status(401).send('Eroare la crearea contului.');
    }
});


authRouter.post("/login", async (req, res) => {
    const { Email, Parola } = req.body;

    if (!Email || !Parola) {
        console.log("Eroare primire date\n");
        return res.status(400).send("Date netrimise\n");
    }

    try {
        const result = await client.query("SELECT  parola,id, CONCAT(nume, ' ', prenume) AS nume,tip_ut FROM Utilizatori WHERE Email=$1", [Email]);
        if (result.rows.length === 0) {
            return res.status(404).send("Utilizatorul nu există\n");
        }
        const hashStocat = result.rows[0].parola;
        const potrivire = await bcrypt.compare(Parola, hashStocat);

        if (potrivire) {
            let TipUser;
            if (result.rows[0].tip_ut === 1) {
                TipUser = "Client";
            }
            else {
                TipUser = "Admin";
            }

            //access token
            const accessToken = jwt.sign(
                {
                    username: Email,
                    sub: result.rows[0].id,
                    name: result.rows[0].nume,
                    role: TipUser
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1h' }
            );

            // refresh token
            const refreshToken = jwt.sign(
                {
                    username: Email,
                    sub: result.rows[0].id,
                    name: result.rows[0].nume,
                    role: TipUser
                },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1m' }
            );

            // Validarea token-ului
            jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    console.log('Invalid token:', err);
                } else {
                    //console.log('Decoded token:', decoded);
                    console.log("Token decodificat");
                }
            });

            await client.query("UPDATE Utilizatori SET refresh_token = $1 WHERE Email = $2", [refreshToken, Email]);

            // Setăm refresh token-ul în cookie (httpOnly pentru securitate)
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: false, // doar pe HTTPS în producție
                maxAge: 24 * 60 * 60 * 1000, // 1 zi
            });

            // Setăm access token-ul în cookie (httpOnly și secure pe HTTPS)
            //res.cookie("accessToken", accessToken, {
            //    httpOnly: true,
            //    secure: false, // doar pe HTTPS în producție
            //    maxAge: 3600000 // 1 oră
            //});

            console.log("Autentificare reusita");
            res.json({ accessToken }); /// daca stochez acces Token in memory voi fi vulnerabil sau cv de genul
        }
        else {
            console.log("Parola incorectă");
            return res.status(401).send("Parola incorectă");
        }
    } catch (error) {
        console.error("Eroare in procesul de login", error);
        return res.status(500).send("Eroare server");
    }
});


authRouter.post("/refresh", async (req, res) => {
    const cookies = req.cookies;

    // Verificăm dacă există un cookie "jwt"
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

authRouter.post("/logout", async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        return res.status(204).send("Nu există refresh token."); // Logout fara token
    }

    const refreshToken = cookies.jwt;

    try {
        await client.query("UPDATE Utilizatori SET RefreshToken = NULL WHERE RefreshToken = $1", [refreshToken]);
        res.clearCookie('jwt', { httpOnly: true });
        res.status(200).send("Deconectare reusita.");
    } catch (error) {
        console.error("Eroare la logout:", error);
        res.status(500).send("Eroare server.");
    }
});


export default authRouter;