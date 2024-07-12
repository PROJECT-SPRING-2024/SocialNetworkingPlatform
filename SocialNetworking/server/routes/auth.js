const express = require('express');
const router = express.Router();
const pool = require('../../db'); // Import the pool instance from db.js
const { hashPassword, verifyPassword, generateToken } = require('../middleware/auth');

// Route to handle user registration
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    console.log('Received signup request:', { email, password, name });

    const hashedPassword = await hashPassword(password);
    console.log('Hashed password:', hashedPassword);

    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, name]
    );

    const newUser = result.rows[0];
    console.log('New user created:', newUser);

    const token = generateToken(newUser);
    res.status(201).json({ message: 'User created', token });
  } catch (err) {
    console.error('Error creating user:', err.message);
    console.error('Stack trace:', err.stack);

    res.status(500).json({ error: 'Error creating user' });
  }
});
// Route to handle user login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
