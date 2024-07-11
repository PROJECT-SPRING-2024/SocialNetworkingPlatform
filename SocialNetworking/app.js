// Load environment variables from a .env file into process.env
require('dotenv').config();

// Import the express module to create a web server
const express = require('express');

// Import the path module to work with file and directory paths
const path = require('path');

// Import the Pool class from the pg (node-postgres) module to interact with PostgreSQL
const { Pool } = require('pg');

// Import bcrypt for password hashing
const bcrypt = require('bcrypt');

// Import jsonwebtoken for JWT handling
const jwt = require('jsonwebtoken');

// Create an instance of an Express application
const app = express();

// Define the port number from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// Database connection setup
// Create a new pool instance with database connection details from environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Connect to the database
pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Database connection error', err.stack));

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define routes to serve the login and signup pages
// Define routes to serve the login and signup pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
app.get('/forgot-pass', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forgot.html'));
});




// Route to handle user login
// Import and use auth routes

// Start the server and listen on the defined port
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

// Export the pool instance to be used in other modules
module.exports = pool;
