const { Pool } = require('pg');
const { createClient } = require('redis');

// Initialisation de la connexion PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialisation de la connexion Redis
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

async function connectDatabases() {
  try {
    await redisClient.connect();
    console.log('Connecté à Redis');
  } catch (error) {
    console.error('Erreur de connexion à Redis', error);
  }
}

module.exports = {
  pool,
  redisClient,
  connectDatabases
};
