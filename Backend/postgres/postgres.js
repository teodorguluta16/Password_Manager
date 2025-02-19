import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'EnginePassword',
    password: 'postgres',
    port: 5432,
});

const connectToDatabase = async () => {
    try {
        await client.connect();
        console.log('Conexiune la baza de date realizată cu succes!');
    } catch (error) {
        console.error('Eroare la conectarea la baza de date:', error);
    }
};

export { client, connectToDatabase };
