import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const verifyJWT = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401); // nu avem header

    // Extragem token-ul din header
    const token = authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    // Verifica tokenul
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403); // Token invalid

        req.user = decoded;
        next();
    });
};

export default verifyJWT;
