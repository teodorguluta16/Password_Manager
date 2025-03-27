import express from 'express';
import { connectToDatabase } from './postgres/postgres.js';

import authRouter from './view/authRoutes.js'
import protectedRouter from './view/protectedRoutes.js'

import cors from 'cors';
import verifyJWT from "./verifyJWT.js"
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
}));


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/api/auth', authRouter);

app.use(verifyJWT);
app.use('/api', protectedRouter);

const PORT = 9000;
app.listen(PORT, async () => {
    await connectToDatabase();
    console.log(`Server rulează pe portul ${PORT}`);
});
