const express = require('express');
const router = express.Router();
const pool = require('../../db'); 
const { authenticateToken } = require('../middleware/auth'); 

// Send a message
router.post('/', authenticateToken, async (req, res) => {
  const { receiver_id, content } = req.body;
  const sender_id = req.user.userId;

  try {
    const result = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
      [sender_id, receiver_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get messages between two users
router.get('/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user ? req.user.id : null;

  try {
    const result = await pool.query(
      'SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at ASC',
      [currentUserId, userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
