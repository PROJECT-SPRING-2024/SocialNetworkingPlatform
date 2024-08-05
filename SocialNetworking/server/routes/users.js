const express = require('express');
const router = express.Router();
const pool = require('../../db');
const { authenticateToken } = require('../middleware/auth'); // Ensure this path is correct


// Get all users except the logged-in user
router.get('/', authenticateToken, async (req, res) => {
 
  const currentUserId = req.user ? req.user.id : null;
  console.log('Fetching users, current user ID:', currentUserId);

  try {
    const result = await pool.query(
      'SELECT id, name, email, profile_image FROM users WHERE id != $1',
      [currentUserId]
    );
    console.log('Users fetched successfully:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
