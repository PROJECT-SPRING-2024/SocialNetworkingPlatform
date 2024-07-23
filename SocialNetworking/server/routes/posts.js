// server/routes/posts.js

const express = require('express');
const pool = require('../../db');
const { authenticateToken } = require('../middleware/auth'); // Ensure this path is correct
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all posts
// Get all posts
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT
        p.id AS post_id,
        p.title,
        p.description,
        p.image,
        p.date AS post_date,
        u.name AS author_name,
        u.email AS author_email,
        u.profile_image AS author_profile_image,
        COALESCE(l.likes_count, 0) AS likes_count,
        COALESCE(c.comments_count, 0) AS comments_count
      FROM
        posts p
        JOIN users u ON p.author = u.id
        LEFT JOIN (
          SELECT
            post_id,
            COUNT(*) AS likes_count
          FROM
            likes
          GROUP BY
            post_id
        ) l ON p.id = l.post_id
        LEFT JOIN (
          SELECT
            post_id,
            COUNT(*) AS comments_count
          FROM
            comments
          GROUP BY
            post_id
        ) c ON p.id = c.post_id;
    `;
    const result = await pool.query(query);
    console.log('Query Result:', result.rows); // Log the query result
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query:', err); // Log the error details
    res.status(500).json({ error: err.message });
  }
});
// Create a post
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  const { title, description } = req.body;
  const author = req.user ? req.user.id : null; // Corrected to use req.user.id
  const imagePath = req.file ? `/images/${req.file.filename}` : null;

  if (!author) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO posts (title, description, author, image, date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [title, description, author, imagePath]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a post
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const author = req.user ? req.user.id : null; // Corrected to use req.user.id
  const imagePath = req.file ? `/images/${req.file.filename}` : null;

  if (!author) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(
      'UPDATE posts SET title = $1, description = $2, image = COALESCE($3, image) WHERE id = $4 AND author = $5 RETURNING *',
      [title, description, imagePath, id, author]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a post
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const author = req.user ? req.user.id : null; // Corrected to use req.user.id

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
