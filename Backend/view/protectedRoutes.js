import express from 'express'
import { client } from '../postgres/postgres.js';
import verifyJWT from '../verifyJWT.js';
import path from "path";

const protectedRouter = express.Router();

protectedRouter.use(verifyJWT);
//rute protejate 

// ruta descarcare localServer
protectedRouter.get("/download", (req, res) => {
    const filePath = path.join(process.cwd(), "files", "localServer.exe");
    res.download(filePath, "localServer.exe", (err) => {
        if (err) {
            console.error("❌ Eroare la descărcare:", err);
            res.status(500).send("Eroare la descărcare.");
        }
    });
});

// rute pentru itemi 
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
        return res.status(400).json({ message: "Structura datelor este incompleta" });
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
protectedRouter.get('/utilizator/getSalt', async (req, res) => {
    const userId = req.user.sub;

    try {
        const result = await client.query(
            "SELECT u.salt AS salt FROM utilizatori u WHERE u.id = $1;",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Utilizator negăsit" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Eroare la obținerea salt-ului: ", error);
        res.status(500).json({ message: "Eroare server" });
    }
});

protectedRouter.post('/utilizator/addRecoveryKey', async (req, res) => {
    const jsonItemKey = req.body;
    const userId = req.user.sub;

    if (!jsonItemKey || !jsonItemKey.data) {
        console.log("E incomplet");
        return res.status(400).json({ message: "Structura datelor este incompleta" });
    }
    try {
        console.log("Cheia ce urmeaza a fi criptata: ", jsonItemKey);
        const result = await client.query(`UPDATE Utilizatori SET copyencryptedsimmetrickey = $1 WHERE id = $2`, [jsonItemKey, userId]);
        if (result.rowCount > 0) {
            res.status(200).json({ success: true, message: 'Cheia de recuperare a fost actualziata.' });
        } else {
            res.status(400).json({ success: false, message: 'Cheia nu a fost actualizata.' });
        }
    } catch (error) {
        console.error("Eroare la adaugare copiei cheii: ", error);
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

protectedRouter.put('/updateItem', async (req, res) => {
    const { id_item, continut } = req.body;
    const userId = req.user.sub;

    if (!id_item || !continut) {
        console.log("E incomplet");
        return res.status(400).json({ message: "ID-ul item-ului și conținutul trebuie furnizate" });
    }

    try {
        const result = await client.query(`UPDATE Itemi SET continut = $1 WHERE id_item = $2 AND id_owner = $3 RETURNING id_item`,
            [continut, id_item, userId]);

        if (result.rowCount === 0) {
            console.log("Item-ul nu a fost găsit sau nu aparține utilizatorului");
            return res.status(404).json({ message: "Item-ul nu există sau nu ai permisiunea de a-l modifica" });
        }

        console.log("Item actualizat cu succes! ID-ul item-ului:", id_item);
        res.status(200).json({ message: "Item actualizat cu succes", id_item });
    } catch (error) {
        console.error('Eroare la actualizarea item-ului:', error);
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

protectedRouter.post('utilizatori/addFavoriteItem', async (req, res) => {
    const { id_item } = req.body;
    const userId = req.user.sub;

    console.log(id_item);
    console.log(userId);

    try {
        const result = await client.query('UPDATE Leguseritemi SET isfavorite = $1 WHERE id_item = $2 AND id_user = $3', [1, id_item, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Itemul negasit' });
        }
        console.log("Item marcat ca favorit cu succes!");
        res.status(200).json({ message: 'Itemul adaugat la favorite.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Eroare internă' });
    }
});


// ruta user
protectedRouter.post('utilizatori/addFavoriteItem', async (req, res) => {
    const { id_item } = req.body;
    const userId = req.user.sub;

    console.log(id_item);
    console.log(userId);

    try {
        const result = await client.query('UPDATE Leguseritemi SET isfavorite = $1 WHERE id_item = $2 AND id_user = $3', [1, id_item, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Itemul negasit' });
        }
        console.log("Item marcat ca favorit cu succes!");
        res.status(200).json({ message: 'Itemul adaugat la favorite.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Eroare internă' });
    }
});
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
            [userId, iditem, encryptedAesKey]
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

    const base64Data = req.body.encryptedKey;
    const decryptedData = Buffer.from(base64Data, 'base64'); // Decodificare Base64
    console.log("Cheia criptata: ", encryptedKey);


    console.log("Membru:", idMembru);
    console.log("Grup:", grupId);

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

            const encryptedAesKeyHex = encryptedAesKeyBuffer.toString('hex').replace(/\s+/g, '');
            //console.log(encryptedAesKeyHex);

            const encryptedAesKey = Buffer.from(encryptedAesKeyHex, 'hex');
            //console.log("Varianta from: ", encryptedAesKey);

            const encryptedAesKeyBase64 = encryptedAesKey.toString('ascii');
            //console.log("DAAA:", encryptedAesKeyBase64);
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
            `select u.nume,u.prenume,u.email,u.id from utilizatori as u inner join legusergrup as lg on u.id=lg.id_user 
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
protectedRouter.post('/grupuri/parasesteGroup', async (req, res) => {

    const userId = req.user.sub;
    const { idgrup } = req.body;
    console.log(userId);
    try {
        const result = await client.query(`DELETE FROM legusergrup WHERE id_grup = $1 AND id_user = $2 RETURNING *`, [idgrup, userId]
        );

        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Ai părăsit grupul cu succes' });
        } else {
            res.status(404).json({ message: 'Nu ești membru al acestui grup sau grupul nu există' });
        }
    } catch (error) {
        console.error('Eroare:', error);
        res.status(500).json({ message: 'Eroare la ieșirea din grup' });
    }
});
protectedRouter.post('/grupuri/eliminaUtilizatorGroup', async (req, res) => {

    const { idgrup, userId } = req.body;
    console.log("id este", userId);
    try {
        const result = await client.query(`DELETE FROM legusergrup WHERE id_grup = $1 AND id_user = $2 RETURNING *`, [idgrup, userId]
        );

        if (result.rowCount > 0) {
            console.log("sters");
            res.status(200).json({ success: true, message: 'Utilizator sters cu succes' });
        } else {
            res.status(404).json({ success: true, message: 'Nu s-a gasit userul' });
        }
    } catch (error) {
        console.error('Eroare:', error);
        res.status(500).json({ success: true, message: 'Eroare la eliminarea din grup' });
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

protectedRouter.post('/grupuri/getGroupItemi', async (req, res) => {
    const { idgrup } = req.body;
    const userId = req.user.sub;

    try {
        console.log("id-ul grupului cerut este: ", idgrup);
        const result = await client.query(`SELECT encode(i.keys, 'hex') AS keys_hex, encode(i.continut, 'hex') AS continut_hex, 
                            lgi.id_item AS id_item, i.id_owner AS id_owner, i.isdeleted AS isdeleted FROM leggrupuriitemi lgi 
                            JOIN itemi i ON lgi.id_item = i.id_item WHERE lgi.id_grup = $1`, [idgrup]);

        if (result.rowCount > 0) {
            res.status(200).json(result.rows);
        } else {
            console.log("Nu s-a obtinut nimic.");
            res.status(200).json({ message: "Nu exista itemi" });
        }
    } catch (error) {
        console.error('Eroare la obinerea itemilor:', error);
        res.status(500).send();
    }
});
protectedRouter.post('/grupuri/stergeGrup', async (req, res) => {
    const { idGrup } = req.body;
    const userId = req.user.sub;

    if (!idGrup || !userId) {
        return res.status(400).json({ error: "Lipsesc datele necesare!" });
    }
    try {
        await client.query('BEGIN');

        console.log(`User-ul ${userId} vrea să șteargă grupul ${idGrup}`);

        // 1. Găsim toți itemii asociați grupului ÎNAINTE de a șterge referințele
        const itemiDeSters = await client.query(
            "SELECT DISTINCT id_item FROM leggrupuriitemi WHERE id_grup = $1",
            [idGrup]
        );

        const itemIds = itemiDeSters.rows.map(row => row.id_item);

        // 2. Ștergem referințele utilizatorilor din grup
        await client.query("DELETE FROM legusergrup WHERE id_grup = $1", [idGrup]);

        // 3. Ștergem referințele itemilor din grup
        await client.query("DELETE FROM leggrupuriitemi WHERE id_grup = $1", [idGrup]);

        if (itemIds.length > 0) {
            console.log(`Șterg itemii: ${itemIds.join(", ")}`);

            // 4. Ștergem doar itemii care NU mai sunt referiți în `leggrupuriitemi`
            await client.query(
                `DELETE FROM itemi 
                 WHERE id_item = ANY($1::uuid[]) 
                 AND NOT EXISTS (SELECT 1 FROM leggrupuriitemi WHERE leggrupuriitemi.id_item = itemi.id_item)`,
                [itemIds]
            );
        }

        // 5. Ștergem grupul doar dacă utilizatorul este owner
        const result = await client.query(
            "DELETE FROM grupuri WHERE id_grup = $1 AND id_owner = $2 RETURNING *",
            [idGrup, userId]
        );

        if (result.rowCount === 0) {
            throw new Error("Grupul nu există sau nu ai permisiunea de a-l șterge.");
        }

        await client.query('COMMIT');
        res.json({ success: true, message: "Grupul și referințele asociate au fost șterse." });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Eroare la ștergerea grupului:", error);
        res.status(500).json({ error: "Eroare internă la ștergerea grupului." });
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

protectedRouter.post('/grupuri/getOwnerItem', async (req, res) => {
    const { uidItem } = req.body;
    console.log("id-ul item: ", uidItem);
    try {
        // 🔹 Pasul 1: Obține `id_owner` din tabela `Itemi`
        const ownerResult = await client.query("SELECT id_owner FROM Itemi WHERE id_item = $1;", [uidItem]);

        if (ownerResult.rows.length === 0) {
            return res.status(404).json({ message: "Itemul nu există sau nu are un proprietar asociat." });
        }

        const idOwner = ownerResult.rows[0].id_owner;

        console.log("ID-ul proprietarului:", idOwner);

        // 🔹 Pasul 2: Obține numele și prenumele utilizatorului
        const userResult = await client.query("SELECT nume, prenume FROM utilizatori WHERE id = $1;", [idOwner]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "Proprietarul nu a fost găsit." });
        }

        console.log("Proprietarul găsit:", userResult.rows[0]);

        res.status(200).json(userResult.rows[0]);
    }
    catch (error) {
        console.error('Eroare:', error);
        res.status(500).json({ message: "Eroare internă a serverului." });
    }
});
protectedRouter.delete('/grupuri/stergeItemGroupDefinitiv', async (req, res) => {
    const { id_item, id_grup } = req.body;
    try {
        console.log("id-ul itemului de sters este: ", id_item);
        console.log("id-ul grupului din care face parte este: ", id_grup);
        await client.query(`DELETE FROM leggrupuriitemi WHERE id_item = $1 and id_grup=$2`, [id_item, id_grup]);
        await client.query(`DELETE FROM itemi WHERE id_item = $1`, [id_item]);
        return res.status(200).json({ message: 'Item sters!' });
    } catch (error) {
        console.error('Eroare:', error);
        return res.status(500).json({ message: 'Eroare stergere item' });
    }
});

protectedRouter.put('/grupuri/updateGroupItem', async (req, res) => {
    const { id_item, continut } = req.body;
    const userId = req.user.sub;

    if (!id_item || !continut) {
        console.log("E incomplet");
        return res.status(400).json({ message: "ID-ul item-ului și conținutul trebuie furnizate" });
    }

    try {
        const result = await client.query(`UPDATE Itemi SET continut = $1 WHERE id_item = $2 AND id_owner = $3 RETURNING id_item`,
            [continut, id_item, userId]);

        if (result.rowCount === 0) {
            console.log("Item-ul nu a fost găsit sau nu aparține utilizatorului");
            return res.status(404).json({ message: "Item-ul nu există sau nu ai permisiunea de a-l modifica" });
        }

        console.log("Item actualizat cu succes! ID-ul item-ului:", id_item);
        res.status(200).json({ message: "Item actualizat cu succes", id_item });
    } catch (error) {
        console.error('Eroare la actualizarea item-ului:', error);
        res.status(500).send();
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
protectedRouter.get('/utilizator/getMyId', async (req, res) => {
    const userId = req.user.sub;
    try {
        res.status(200).json({ Id: userId });
    } catch (error) {
        console.error('Eroare:', error);
        res.status(500).send('Eroare la preluarea id-ului.');
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

protectedRouter.get('/utilizator/itemi', async (req, res) => {
    const userId = req.user.sub;
    try {
        const result = await client.query(`
            SELECT 
                encode(i.keys, 'hex') AS keys_hex, 
                encode(i.continut, 'hex') AS continut_hex, 
                li.id_item AS id_item, 
                i.id_owner AS id_owner, 
                i.isdeleted AS isdeleted,
                li.isfavorite AS isFavorite
            FROM leguseritemi li
            JOIN itemi i ON li.id_item = i.id_item
            LEFT JOIN leggrupuriitemi lgi ON i.id_item = lgi.id_item 
            WHERE li.id_user = $1
            AND lgi.id_item IS NULL
            AND i.isdeleted = 0;
        `, [userId]);

        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Eroare:', error);
        res.status(401).send();
    }
});
protectedRouter.get('/utilizator/itemiStersi', async (req, res) => {
    const userId = req.user.sub;
    try {
        const result = await client.query(`
            SELECT 
                encode(i.keys, 'hex') AS keys_hex, 
                encode(i.continut, 'hex') AS continut_hex, 
                li.id_item AS id_item, 
                i.id_owner AS id_owner, 
                i.isdeleted AS isdeleted 
            FROM leguseritemi li
            JOIN itemi i ON li.id_item = i.id_item
            LEFT JOIN leggrupuriitemi lgi ON i.id_item = lgi.id_item 
            WHERE li.id_user = $1
            AND lgi.id_item IS NULL
            AND i.isdeleted = 1;
        `, [userId]);

        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Eroare:', error);
        res.status(401).send();
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
protectedRouter.delete('/utilizator/stergeItemDefinitiv', async (req, res) => {
    const { id_item } = req.body;
    try {
        console.log("id-ul itemului de sters este: ", id_item);
        await client.query(`DELETE FROM leguseritemi WHERE id_item = $1`, [id_item]);
        await client.query(`DELETE FROM itemi WHERE id_item = $1`, [id_item]);
        return res.status(200).json({ message: 'Item sters!' });
    } catch (error) {
        console.error('Eroare:', error);
        return res.status(500).json({ message: 'Eroare stergere item' });
    }
});
protectedRouter.patch('/utilizator/itemiStersi/restore', async (req, res) => {
    const { id_item } = req.body;
    const userId = req.user.sub;

    console.log("Esteeee", id_item);
    console.log(userId);

    try {
        const result = await client.query('UPDATE Itemi SET isDeleted = $1 WHERE id_item = $2 AND id_owner = $3', [0, id_item, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Item negasit' });
        }
        console.log("Item restored cu succes !");
        res.status(200).json({ message: 'Succes restored' });
    } catch (error) {
        res.status(500).json({ message: 'Eroare' });
    }
});

protectedRouter.post('/utilizator/markeazaItemFavorit', async (req, res) => {
    const { id_item, isFavorite } = req.body;
    const userId = req.user.sub;

    try {
        console.log(`ID-ul itemului: ${id_item}, noua stare favorite: ${isFavorite} si id user este: ${userId}`);

        const result = await client.query(
            'UPDATE leguseritemi SET isfavorite = $1 WHERE id_item = $2 AND id_user = $3 RETURNING isfavorite',
            [isFavorite, id_item, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Itemul nu a fost găsit.' });
        }

        return res.status(200).json({
            message: 'Stare favorită schimbată!',
            isFavorite: result.rows[0].isfavorite
        });
    } catch (error) {
        console.error('Eroare:', error);
        return res.status(500).json({ message: 'Eroare la schimbarea stării favorite' });
    }
});


export default protectedRouter;