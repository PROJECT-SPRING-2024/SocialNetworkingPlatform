// Load environment variables from a .env file into process.env
//This line loads environment variables from a .env file into process.env.
require('dotenv').config();

// Import the express module to create a web server
const express = require('express');

// Import the path module to work with file and directory paths
const path = require('path');

// Import the Pool class from the pg (node-postgres) module to interact with PostgreSQL
//PostgreSQL client for Node.js. The Pool class is used to manage connections to the database.
const { Pool } = require('pg');

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
//Creates a new Pool instance with configuration details from environment variables.
//pool.connect(): Connects to the database and logs the status.

pool.connect()
  .then(() => console.log('Connected to the database')) // Log success message if connected
  .catch(err => console.error('Database connection error', err.stack)); // Log error message if connection fails


// Middleware to parse JSON request bodies.
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define a basic route to serve the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Define a route to serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Define a route to serve the signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

// Export the pool instance to be used in other modules
module.exports = pool;
