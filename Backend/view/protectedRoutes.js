import express from 'express'

import jwt from 'jsonwebtoken';
import { client } from '../postgres/postgres.js';

const protectedRouter = express.Router();

//rute protejate 

// rute pentru itemi 
protectedRouter.get('/itemi', async (req, res) => {
    const userId = req.user.sub;
    try {
        const result = await client.query("SELECT encode(i.keys, 'hex') AS keys_hex, encode(i.continut, 'hex') AS continut_hex, li.id_item AS id_item, i.id_owner AS id_owner, i.isdeleted AS isdeleted FROM leguseritemi li JOIN itemi i ON li.id_item = i.id_item WHERE li.id_user = $1", [userId]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Eroare:', error);
        res.status(401).send();
    }
});

protectedRouter.get('/itemistersi', async (req, res) => {
    const userId = req.user.sub;
    try {
        const result = await client.query("SELECT encode(i.keys, 'hex') AS keys_hex, encode(i.continut, 'hex') AS continut_hex, li.id_item AS id_item, i.id_owner AS id_owner FROM leguseritemi li JOIN itemi i ON li.id_item = i.id_item WHERE li.id_user = $1  AND i.isDeleted = 1;", [userId]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Eroare:', error);
        res.status(401).send();
    }
});

protectedRouter.post('/addKey', async (req, res) => {
    const jsonItemKey = req.body;
    const userId = req.user.sub;

    if (!jsonItemKey || !jsonItemKey.data) {
        console.log("E incomplet");
        return res.status(400).json({ message: "Structura datelor este incompletă" });
    }

    try {
        const result = await client.query("SELECT id_item FROM Itemi WHERE id_owner=$1 ORDER BY created_at DESC LIMIT 1;", [userId]);
        console.log("rezultate:", result.rows);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Nu exista iteme pentru acest utilizator" });
        }

        const iditem = result.rows[0].id_item;
        const existingAssociation = await client.query(
            "SELECT 1 FROM LeguserItemi WHERE id_user=$1 AND id_item=$2",
            [userId, iditem]
        );

        if (existingAssociation.rows.length > 0) {
            return res.status(400).json({ message: "Itemul este deja asociat cu acest utilizator!" });
        }
        await client.query(`UPDATE Itemi SET keys=$1 WHERE id_item=$2`, [jsonItemKey.data, iditem]);
        await client.query(`INSERT INTO LeguserItemi (id_user, id_item) VALUES ($1, $2)`, [userId, iditem]);

        console.log("Key adăugat și asociat cu utilizatorul în LeguserItemi!");
        res.status(200).send();
    } catch (error) {
        console.error('Eroare la adăugarea cheii:', error);
        res.status(500).send();
    }
});

protectedRouter.post('/addItem', async (req, res) => {
    const jsonItem = req.body;
    const userId = req.user.sub;

    if (!jsonItem || !jsonItem.metadata || !jsonItem.data) {
        console.log("E incomplet");
        return res.status(400).json({ message: "Structura datelor este incompletă" });
    }

    try {
        const result = await client.query(`INSERT INTO Itemi (id_owner, continut) VALUES ($1, $2) RETURNING id_item`, [userId, jsonItem]);

        const iditem = result.rows[0].id_item;

        console.log("Item inserat cu succes! ID-ul item-ului:", iditem);
        res.status(200).json({ id_item: iditem });
    } catch (error) {
        console.error('Eroare la inserarea item-ului:', error);
        res.status(500).send();
    }
});

protectedRouter.patch('/stergeItem', async (req, res) => {
    const { id_item } = req.body;
    const userId = req.user.sub;

    console.log(id_item);
    console.log(userId);

    try {
        const result = await client.query('UPDATE Itemi SET isDeleted = $1 WHERE id_item = $2 AND id_owner = $3', [1, id_item, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Item negasit' });
        }
        console.log("Item marcat ca sters cu succes !");
        res.status(200).json({ message: 'Succes sters' });
    } catch (error) {
        res.status(500).json({ message: 'Eroare internă' });
    }
});

// ruta user
protectedRouter.get('/getOwner', async (req, res) => {
    const userId = req.user.sub;
    try {
        const result = await client.query("Select u.nume,u.prenume from utilizatori u where u.id=$1;", [userId])
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Eroare:', error);
        res.status(401).send();
    }
});

// rute grupuri

protectedRouter.post('/addGrup', async (req, res) => {
    const { numeGrup, descriere, encryptedAesKey } = req.body;
    const userId = req.user.sub;

    if (!numeGrup || !descriere || !encryptedAesKey) {
        console.log("E incomplet");
        return res.status(400).json({ message: "Structura datelor este incompletă" });
    }

    try {
        console.log("Cheia AES criptată:", encryptedAesKey);


        const result = await client.query(`INSERT INTO Grupuri (id_owner, nume, descriere)
            VALUES ($1, $2, $3) RETURNING id_grup`, [userId, numeGrup, descriere]);

        const iditem = result.rows[0].id_grup;

        const encryptedAesKeyBuffer = Buffer.from(encryptedAesKey, 'base64');

        const result2 = await client.query(
            `INSERT INTO legusergrup (id_user, id_grup, encryptedsimmetricgroupkey)
             VALUES ($1, $2, $3)`,
            [userId, iditem, encryptedAesKeyBuffer]
        );
        console.log("Grup adăugat cu succes! ID-ul grupului:", iditem);
        res.status(200).json({ id_item: iditem });
    } catch (error) {
        console.error('Eroare la inserarea item-ului:', error);
        res.status(500).send();
    }
});

protectedRouter.post('/addMembruGrup', async (req, res) => {
    const { idMembru, grupId, encryptedKey } = req.body;

    try {
        const result2 = await client.query(
            `INSERT INTO legusergrup (id_user, id_grup, encryptedsimmetricgroupkey)
             VALUES ($1, $2, $3)`,
            [idMembru, grupId, encryptedKey]
        );
        console.log("Membru adaugat cu succes in grup!");
        res.status(200).send({ success: true, message: 'Membru adăugat cu succes!' });
    } catch (error) {
        console.error('Eroare la inserarea item-ului:', error);
        res.status(500).send();
    }
});
protectedRouter.post('/getPublicKeyNewMembruGrup', async (req, res) => {
    const { emailMembru } = req.body;
    try {
        const result = await client.query(
            `SELECT encode(publickey,'hex') as publickeyhex from utilizatori where email=$1`, [emailMembru]);

        if (result.rows && result.rows.length > 0) {

            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Public key not found' });
        }
    }
    catch (error) {
        console.error('Eroare:', error);
        res.status(401).send();
    }
});

protectedRouter.post('/getGroupSimmetricEncryptedKey', async (req, res) => {
    const userId = req.user.sub;
    const { idgrup } = req.body;
    console.log("Id grup este: ", idgrup);
    try {
        const result = await client.query(
            `SELECT encryptedsimmetricgroupkey 
             FROM legusergrup 
             WHERE id_user = $1 AND id_grup = $2`,
            [userId, idgrup]
        );

        if (result.rows.length > 0) {
            const encryptedAesKeyBuffer = result.rows[0].encryptedsimmetricgroupkey; // Este deja un Buffer

            const encryptedAesKeyBase64 = encryptedAesKeyBuffer.toString('base64');
            res.status(200).json({ EncryptedAesKeyBase64: encryptedAesKeyBase64 });

        } else {
            console.error("Nu s-a găsit nicio cheie pentru utilizatorul și grupul specificat.");
        }
    }
    catch (error) {
        console.error('Eroare:', error);
        res.status(401).send();
    }
});

protectedRouter.post('/grupuri/getGroupMembersforOwner', async (req, res) => {
    const userId = req.user.sub;
    const { idgrup } = req.body;

    try {
        const result = await client.query(
            `select u.nume,u.prenume,u.email from utilizatori as u inner join legusergrup as lg on u.id=lg.id_user 
            where lg.id_grup=$1
            and lg.id_user != $2`,
            [idgrup, userId]
        );

        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).json({ message: 'Niciun usr gasit pentru grupul aferent' });
        }
    }
    catch (error) {
        console.error('Eroare:', error);
        res.status(401).send();
    }
});
protectedRouter.post('/grupuri/getGroupOwnerDetails', async (req, res) => {
    const userId = req.user.sub;
    const { idgrup } = req.body;

    try {
        const result = await client.query(`select id_owner from grupuri where id_grup=$1`, [idgrup]);

        let id_owner = result.rows[0].id_owner;

        const result2 = await client.query(`select u.nume,u.prenume,u.email from utilizatori as u where u.id = $1`, [id_owner]);

        if (result2.rows.length > 0) {
            res.status(200).json(result2.rows);
        } else {
            res.status(404).json({ message: 'Niciun owner gasit al grupului' });
        }
    }
    catch (error) {
        console.error('Eroare:', error);
        res.status(401).send();
    }
});

protectedRouter.post('/grupuri/addItemGroup', async (req, res) => {
    const { jsonItem, id_grup } = req.body;
    const userId = req.user.sub;

    if (!jsonItem || !jsonItem.metadata || !jsonItem.data) {
        console.log("E incomplet");
        return res.status(400).json({ message: "Structura datelor este incompletă" });
    }

    try {

        const result = await client.query(`INSERT INTO Itemi (id_owner, continut) VALUES ($1, $2) RETURNING id_item`, [userId, jsonItem]);
        const iditem = result.rows[0].id_item;

        const result2 = await client.query(`INSERT INTO legGrupuriItemi (id_grup,id_item) VALUES ($1,$2)`, [id_grup, iditem]);
        if (result2.rowCount > 0) {
            console.log("Inserare realizată cu succes in LegGrupItemi!");
        } else {
            console.log("Nu s-a efectuat nicio inserare.");
            res.status(400).json({ message: "Inserare nereusita" });
        }

        console.log("Item inserat cu succes! ID-ul item-ului:", iditem);
        res.status(200).json({ id_item: iditem });
    } catch (error) {
        console.error('Eroare la inserarea item-ului:', error);
        res.status(500).send();
    }
});

protectedRouter.get('/getGrupuri', async (req, res) => {
    const userId = req.user.sub;
    try {
        const result = await client.query(`SELECT  gr.id_grup,gr.id_owner,gr.nume,gr.descriere,gr.created_at,
            encode(lg.encryptedsimmetricgroupkey, 'hex') AS encryptedsimmetricgroupkey
            FROM legusergrup lg JOIN grupuri gr ON lg.id_grup = gr.id_grup WHERE lg.id_user = $1`, [userId]);

        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Eroare:', error);
        res.status(401).send();
    }
});

protectedRouter.get('/getEncryptedPrivateKeyGrup', async (req, res) => {
    const userId = req.user.sub;
    try {
        const result = await client.query(`SELECT  gr.id_grup,gr.id_owner,gr.nume,gr.descriere,gr.created_at,
            encode(gr.publicgroupkey, 'hex') AS publickey
            FROM legusergrup lg JOIN grupuri gr ON lg.id_grup = gr.id_grup WHERE lg.id_user = $1`, [userId]);

        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Eroare:', error);
        res.status(401).send();
    }
});

// utilizator
protectedRouter.get('/utilizator/getUserId', async (req, res) => {
    const userId = req.user.sub;
    try {
        res.status(200).json({ userId: userId });
    }
    catch (error) {
        console.error('Eroare:', error);
        res.status(401).send();
    }
})

protectedRouter.get('/getUserSimmetricKey', async (req, res) => {
    const userId = req.user.sub;
    try {
        const result = await client.query(`SELECT encode(encryptedsimmetrickey, 'hex') AS encryptedsimmetrickey
            FROM Utilizatori WHERE id = $1`, [userId]);

        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Eroare:', error);
        res.status(401).send();
    }
});

protectedRouter.get('/getUserPublicKey', async (req, res) => {
    const userId = req.user.sub;
    try {
        const result = await client.query(
            `SELECT encode(publickey, 'base64') AS publickey
             FROM Utilizatori WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Utilizatorul nu a fost găsit!');
        }

        const publicKeyBase64 = result.rows[0].publickey;

        res.status(200).json({ PublicKey: publicKeyBase64 });
    } catch (error) {
        console.error('Eroare:', error);
        res.status(500).send('Eroare la preluarea cheii publice.');
    }
});

protectedRouter.get('/getUserEncryptedPrivateKey', async (req, res) => {
    const userId = req.user.sub;
    console.log(userId);
    try {
        const result = await client.query(
            `SELECT encode(encryptedprivatekey, 'hex') AS encryptedprivatekey
             FROM Utilizatori WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Utilizatorul nu a fost găsit!');
        }

        const publicKeyhex = result.rows[0].encryptedprivatekey;

        res.status(200).json({ encryptedprivatekey: publicKeyhex });
    } catch (error) {
        console.error('Eroare:', error);
        res.status(500).send('Eroare la preluarea cheii private.');
    }
});
protectedRouter.post('/getNewMemberId', async (req, res) => {
    const { nameItem } = req.body;
    try {
        const result = await client.query(`SELECT id FROM Utilizatori WHERE email = $1`, [nameItem]);
        const idMembru = result.rows[0].id;

        res.status(200).json({ IdMembru: idMembru });
    } catch (error) {
        console.error('Eroare:', error);
        res.status(500).send('Eroare la preluarea cheii private.');
    }
});
protectedRouter.post('/getNewUserGroupPublicKey', async (req, res) => {
    const { newMemberId } = req.body;
    try {
        const result = await client.query(
            `SELECT encode(publickey, 'base64') AS publickey
             FROM Utilizatori WHERE id = $1`,
            [newMemberId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Utilizatorul nu a fost găsit!');
        }

        const publicKeyBase64 = result.rows[0].publickey;

        res.status(200).json({ PublicKey: publicKeyBase64 });
    } catch (error) {
        console.error('Eroare:', error);
        res.status(500).send('Eroare la preluarea cheii publice.');
    }
});


export default protectedRouter;