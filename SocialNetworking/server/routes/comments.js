// routes/comments.js
// Import necessary modules
const express = require('express');
const pool = require('../db'); // Import the database connection pool

// Create a new router instance
const router = express.Router();

// Route to add a new comment
router.post('/', async (req, res) => {
  // Extract postId and text from the request body
  const { postId, text } = req.body;
  // Extract author (userId) from the request user object
  const author = req.user.userId;
  try {
    // Execute the SQL query to insert a new comment into the comments table
    // Use NOW() for the current date and time
    const result = await pool.query(
      'INSERT INTO comments (post_id, text, author, date) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [postId, text, author]
    );
    // Send back the newly created comment as a JSON response with status 201 (Created)
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // If an error occurs, send back a 500 status and the error message
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
