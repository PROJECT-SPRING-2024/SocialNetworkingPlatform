const express = require('express');
const router = express.Router();
const pool = require('../../db'); // Import the pool instance from db.js
const { hashPassword, verifyPassword, generateToken } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'disaha2833@gmail.com',
    pass: 'ycth lrxe olws qrhh'
  }
});
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

// Route to request a password reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const resetUrl = `http://${req.headers.host}/reset-password/${token}`;

    // Save token and expiry to the database
    await pool.query('UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3', [token, Date.now() + 3600000, email]); // Token expires in 1 hour

    const mailOptions = {
      from: 'disaha2833@gmail.com',
      to: user.email,
      subject: 'Password Reset',
      text: `You requested a password reset. Please click on the link below to reset your password:\n\n${resetUrl}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: 'Error sending email' });
      }
      res.status(200).json({ message: 'Password recovery email sent' });
    });
  } catch (err) {
    console.error('Error requesting password reset:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to reset the password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > $2', [token, Date.now()]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await hashPassword(password);
    await pool.query('UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE email = $2', [hashedPassword, user.email]);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Error resetting password:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
