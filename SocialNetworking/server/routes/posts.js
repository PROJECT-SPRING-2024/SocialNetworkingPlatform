const express = require('express'); 
const pool = require('../../db'); 
const { authenticate } = require('../middleware/auth');

const router = express.Router(); 

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { title, description } = req.body;
  const author = req.user ? req.user.userId : null;
  if (!author) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO posts (title, description, author, date) VALUES ($1, $2, $3, NOW()) RETURNING *', 
      [title, description, author]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const author = req.user ? req.user.userId : null;
  if (!author) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query(
      'UPDATE posts SET title = $1, description = $2 WHERE id = $3 AND author = $4 RETURNING *', 
      [title, description, id, author]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const author = req.user ? req.user.userId : null;
  if (!author) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND author = $2 RETURNING *', 
      [id, author]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
