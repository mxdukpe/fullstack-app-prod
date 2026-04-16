const express = require('express');
const { pool, redisClient, connectDatabases } = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Endpoint de Health Check
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString()
  };

  try {
    // Test connexion PostgreSQL
    await pool.query('SELECT 1');
    health.database = 'connected';
  } catch (e) {
    health.status = 'unhealthy';
    health.database = 'disconnected';
    console.error('Erreur DB:', e);
  }

  try {
    // Test connexion Redis
    await redisClient.ping();
    health.cache = 'connected';
  } catch (e) {
    health.status = 'unhealthy';
    health.cache = 'disconnected';
    console.error('Erreur Redis:', e);
  }

  const code = health.status === 'healthy' ? 200 : 503;
  res.status(code).json(health);
});

// Route CRUD de base (exemple de Todo)
app.get('/api/todos', (req, res) => {
  res.json({ message: "Liste des todos (à implémenter)" });
});

const PORT = process.env.PORT || 3000;

// Ne lance le serveur que si on n'est pas en train d'exécuter des tests
if (process.env.NODE_ENV !== 'test') {
  connectDatabases().then(() => {
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  });
}

module.exports = app;
