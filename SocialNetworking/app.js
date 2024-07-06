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

// Route to handle user registration
app.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, name]
    );

    const newUser = result.rows[0];
    res.status(201).json({ message: 'User created', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Route to handle user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Logged in successfully', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Middleware to authenticate user using JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Add other routes here...

// Start the server and listen on the defined port
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

// Export the pool instance to be used in other modules
module.exports = pool;
