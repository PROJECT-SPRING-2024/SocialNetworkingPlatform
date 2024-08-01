require('dotenv').config();
const { Pool } = require('pg');

// Create a new instance of the Pool class using the DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Attempt to connect to the database using the configured pool
pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Database connection error', err.stack));

module.exports = pool;
