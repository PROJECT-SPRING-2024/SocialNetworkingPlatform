// routes/comments.js
const express = require('express');
const pool = require('../db');

const router = express.Router();

// Add a comment
router.post('/', async (req, res) => {
  const { postId, text } = req.body;
  const author = req.user.userId;
  try {
    const result = await pool.query('INSERT INTO comments (post_id, text, author, date) VALUES ($1, $2, $3, NOW()) RETURNING *', [postId, text, author]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a comment
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const author = req.user.userId;
  try {
    const result = await pool.query('UPDATE comments SET text = $1 WHERE id = $2 AND author = $3 RETURNING *', [text, id, author]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a comment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const author = req.user.userId;
  try {
    const result = await pool.query('DELETE FROM comments WHERE id = $1 AND author = $2 RETURNING *', [id, author]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
