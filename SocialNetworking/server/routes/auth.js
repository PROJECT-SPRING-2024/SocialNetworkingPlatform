const express = require('express');
const router = express.Router();
const pool = require('../../db'); // Import the pool instance from db.js
const { hashPassword, verifyPassword, generateToken } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../middleware/mailer');

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

// Request password reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const tokenExpiry = Date.now() + 3600000; // 1 hour

    await pool.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3',
      [token, tokenExpiry, email]
    );

    await sendPasswordResetEmail(email, token);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Error requesting password reset:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2',
      [token, Date.now()]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await hashPassword(password);

    await pool.query(
      'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Error resetting password:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
