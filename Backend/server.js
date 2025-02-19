import express from 'express';
import { connectToDatabase } from './postgres/postgres.js';

import authRouter from './view/authRoutes.js'  // aici voit tine rutele pentru login si signup
import protectedRouter from './view/protectedRoutes.js'  // aici voi proteja toate celelalte rute

import cors from 'cors';
import verifyJWT from "./verifyJWT.js"
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors());

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built0n middleware for json
app.use(express.json());

// middleware for cookies
app.use(cookieParser());


// Exclud login/register din middleware
app.use('/api/auth', authRouter);

// Middleware pentru a verifica autentificarea pentru alte rute
app.use(verifyJWT);

// Alte rute protejate
app.use('/api', protectedRouter);

const PORT = 9000;
app.listen(PORT, async () => {
    await connectToDatabase();
    console.log(`Server rulează pe portul ${PORT}`);
});
