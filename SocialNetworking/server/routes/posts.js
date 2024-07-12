const express = require('express'); 
const pool = require('../../db'); 
const { authenticate } = require('../middleware/auth'); // Import authentication middleware

const router = express.Router(); 
// Middleware to ensure user is authenticated
// Uncomment if you have authentication middleware
// router.use(authMiddleware.verifyToken);

// Get all posts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts'); // Query the database to select all posts
    res.json(result.rows); // Send the result rows as a JSON response
  } catch (err) {
    res.status(500).json({ error: err.message }); // Send a 500 error response with the error message if the query fails
  }
});

// Create a post
router.post('/', async (req, res) => {
  const { title, description } = req.body; // Destructure title and description from the request body
  const author = req.user ? req.user.userId : null; // Extract userId from the JWT in the request object (handle undefined user)
  if (!author) {
    return res.status(401).json({ error: 'Unauthorized' }); // Send a 401 error if user is not authenticated
  }
  try {
    const result = await pool.query(
      'INSERT INTO posts (title, description, author, date) VALUES ($1, $2, $3, NOW()) RETURNING *', 
      [title, description, author]
    ); // Insert a new post into the database and return the inserted row
    res.status(201).json(result.rows[0]); // Send the inserted post as a JSON response with status 201
  } catch (err) {
    res.status(500).json({ error: err.message }); // Send a 500 error response with the error message if the query fails
  }
});

// Edit a post
router.put('/:id', async (req, res) => {
  const { id } = req.params; // Extract the post ID from the route parameters
  const { title, description } = req.body; // Destructure title and description from the request body
  const author = req.user ? req.user.userId : null; // Extract userId from the JWT in the request object (handle undefined user)
  if (!author) {
    return res.status(401).json({ error: 'Unauthorized' }); // Send a 401 error if user is not authenticated
  }
  try {
    const result = await pool.query(
      'UPDATE posts SET title = $1, description = $2 WHERE id = $3 AND author = $4 RETURNING *', 
      [title, description, id, author]
    ); // Update the post in the database and return the updated row
    if (result.rows.length === 0) { // If no rows are returned, the post was not found or the user is not authorized
      return res.status(404).json({ error: 'Post not found or unauthorized' }); // Send a 404 error response
    }
    res.json(result.rows[0]); // Send the updated post as a JSON response
  } catch (err) {
    res.status(500).json({ error: err.message }); // Send a 500 error response with the error message if the query fails
  }
});

// Delete a post
router.delete('/:id', async (req, res) => {
  const { id } = req.params; // Extract the post ID from the route parameters
  const author = req.user ? req.user.userId : null; // Extract userId from the JWT in the request object (handle undefined user)
  if (!author) {
    return res.status(401).json({ error: 'Unauthorized' }); // Send a 401 error if user is not authenticated
  }
  try {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND author = $2 RETURNING *', 
      [id, author]
    ); // Delete the post from the database and return the deleted row
    if (result.rows.length === 0) { // If no rows are returned, the post was not found or the user is not authorized
      return res.status(404).json({ error: 'Post not found or unauthorized' }); // Send a 404 error response
    }
    res.json(result.rows[0]); // Send the deleted post as a JSON response
  } catch (err) {
    res.status(500).json({ error: err.message }); // Send a 500 error response with the error message if the query fails
  }
});

module.exports = router; // Export the router to be used in other parts of the application