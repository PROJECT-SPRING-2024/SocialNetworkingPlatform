// server/routes/comments.js

const express = require('express');
const pool = require('../../db');
const { authenticateToken } = require('../middleware/auth'); // Ensure this path is correct

const router = express.Router();

// Route to fetch a comment by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM comments WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ensure to use authenticateToken middleware for routes that require authentication


// Route to add a new comment
router.post('/', authenticateToken, async (req, res) => {
  const { postId, text } = req.body;
  const author = req.user ? req.user.userId : null; // Ensure req.user is correctly set

  if (!author) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO comments (post_id, text, author, date) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [postId, text, author]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Route to edit an existing comment
router.put('/:id', async (req, res) => {
  // Extract the comment ID from the request parameters
  const { id } = req.params;
  // Extract the new text from the request body
  const { text } = req.body;
  // Extract author (userId) from the request user object
  const author = req.user.userId;
  try {
    // Execute the SQL query to update the comment text if it belongs to the author
    const result = await pool.query(
      'UPDATE comments SET text = $1 WHERE id = $2 AND author = $3 RETURNING *',
      [text, id, author]
    );
    // If no rows are returned, the comment was not found or the user is unauthorized
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }
    // Send back the updated comment as a JSON response
    res.json(result.rows[0]);
  } catch (err) {
    // If an error occurs, send back a 500 status and the error message
    res.status(500).json({ error: err.message });
  }
});

// Route to delete an existing comment
router.delete('/:id', async (req, res) => {
  // Extract the comment ID from the request parameters
  const { id } = req.params;
  // Extract author (userId) from the request user object
  const author = req.user.userId;
  try {
    // Execute the SQL query to delete the comment if it belongs to the author
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND author = $2 RETURNING *',
      [id, author]
    );
    // If no rows are returned, the comment was not found or the user is unauthorized
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }
    // Send back the deleted comment as a JSON response
    res.json(result.rows[0]);
  } catch (err) {
    // If an error occurs, send back a 500 status and the error message
    res.status(500).json({ error: err.message });
  }
});

// Export the router to be used in other parts of the application
module.exports = router;
