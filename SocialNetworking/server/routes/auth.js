// Import required modules
const express = require('express'); // Express framework for building web applications
const bcrypt = require('bcryptjs'); // Library for hashing passwords
const jwt = require('jsonwebtoken'); // Library for creating and verifying JSON Web Tokens
const pool = require('../db'); // Pool instance for connecting to the database

// Create a new router instance
const router = express.Router();
// Secret key used for signing JWTs
const SECRET_KEY = 'your_jwt_secret_key';

// Register route
router.post('/register', async (req, res) => {
  // Extract email and password from request body
  const { email, password } = req.body;
  try {
    // Hash the password with a salt round of 10
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert the new user into the database and return the inserted row
    const result = await pool.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *', [email, hashedPassword]);
    // Respond with the created user's data
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // If an error occurs, respond with a 500 status and the error message
    res.status(500).json({ error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  // Extract email and password from request body
  const { email, password } = req.body;
  try {
    // Query the database for a user with the provided email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    // If no user is found, respond with a 400 status and an error message
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    // Retrieve the user from the result
    const user = result.rows[0];
    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    // If the passwords don't match, respond with a 400 status and an error message
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    // Create a JWT for the authenticated user, expiring in 1 hour
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    // Respond with the generated token
    res.json({ token });
  } catch (err) {
    // If an error occurs, respond with a 500 status and the error message
    res.status(500).json({ error: err.message });
  }
});

// Export the router to be used in other parts of the application
module.exports = router;
