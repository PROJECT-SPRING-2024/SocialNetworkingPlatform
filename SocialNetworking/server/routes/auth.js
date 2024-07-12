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

module.exports = router;
