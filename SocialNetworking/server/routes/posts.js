const express = require('express');
const pool = require('../../db');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Initialize Firebase Admin SDK
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'social-19ed9.appspot.com'
});

const bucket = admin.storage().bucket();

// Setup multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a post
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Uploaded file:', req.file);

  const { title, description } = req.body;
  const author = req.user ? req.user.id : null;

  if (!author) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let imageUrl = null;
    if (req.file) {
      const filename = `${uuidv4()}_${req.file.originalname}`;
      const fileUpload = bucket.file(filename);

      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: req.file.mimetype
        }
      });

      blobStream.on('error', (error) => {
        console.error(error);
        return res.status(500).send('Something went wrong!');
      });

      blobStream.on('finish', async () => {
        imageUrl = `https://firebasestorage.googleapis.com/v0/b/social-19ed9.appspot.com/o/${fileUpload.name}?alt=media&token=8d098005-90f0-408b-8306-593dcfb1e63c`;

        const result = await pool.query(
          'INSERT INTO posts (title, description, author, image, date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
          [title, description, author, imageUrl]
        );

        res.status(201).json(result.rows[0]);
      });

      blobStream.end(req.file.buffer);
    } else {
      const result = await pool.query(
        'INSERT INTO posts (title, description, author, image, date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
        [title, description, author, imageUrl]
      );

      res.status(201).json(result.rows[0]);
    }
  } catch (err) {
    console.error('Error inserting post into database:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a post by ID
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Uploaded file:', req.file);

  const postId = req.params.id;
  const userId = req.user.id;
  const { title, description } = req.body;

  try {
    let imageUrl = null;
    if (req.file) {
      const filename = `${uuidv4()}_${req.file.originalname}`;
      const fileUpload = bucket.file(filename);

      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: req.file.mimetype
        }
      });

      blobStream.on('error', (error) => {
        console.error(error);
        return res.status(500).send('Something went wrong!');
      });

      blobStream.on('finish', async () => {

        imageUrl = `https://firebasestorage.googleapis.com/v0/b/social-19ed9.appspot.com/o/${fileUpload.name}?alt=media&token=8d098005-90f0-408b-8306-593dcfb1e63c`;

        let query = 'UPDATE posts SET title = $1, description = $2';
        let params = [title, description, postId, userId];

        if (imageUrl) {
          query += ', image = $3 WHERE id = $4 AND author = $5 RETURNING *';
          params = [title, description, imageUrl, postId, userId];
        } else {
          query += ' WHERE id = $3 AND author = $4 RETURNING *';
        }

        const result = await pool.query(query, params);

        if (result.rowCount === 0) {
          return res.status(404).json({ error: 'Post not found or you are not authorized to update this post' });
        }

        res.json(result.rows[0]);
      });

      blobStream.end(req.file.buffer);
    } else {
      let query = 'UPDATE posts SET title = $1, description = $2 WHERE id = $3 AND author = $4 RETURNING *';
      let params = [title, description, postId, userId];

      const result = await pool.query(query, params);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Post not found or you are not authorized to update this post' });
      }

      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all posts
/*
This route retrieves all posts.
It requires user authentication (authenticateToken).
It retrieves additional data like author details, like count,
 comments count, and user-specific information (has post, liked the post).
It uses a complex SQL query with joins and subqueries to achieve this.
The query result is logged and then sent back as a JSON response.
Error handling logs errors and sends appropriate error responses.


*/
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user ? req.user.id : null;// Assuming authenticateToken middleware sets req.user
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
    COALESCE(c.comments_count, 0) AS comments_count,
    CASE WHEN p.author = $1 THEN true ELSE false END AS user_has_post,
    CASE WHEN ul.user_id IS NOT NULL THEN true ELSE false END AS user_liked_post
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
            commentsreview 
        GROUP BY
            post_id
    ) c ON p.id = c.post_id
    LEFT JOIN (
        SELECT
            post_id,
            user_id
        FROM
            likes
        WHERE user_id = $1
    ) ul ON p.id = ul.post_id
ORDER BY
    p.id DESC;

    `;
    const result = await pool.query(query, [userId]);
    console.log('Query Result:', result.rows); // Log the query result
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query:', err); // Log the error details
    res.status(500).json({ error: err.message });
  }
});


// Search posts
router.get('/search', authenticateToken, async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const searchQuery = req.query.q || ''; // Get the search query from the request

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
    COALESCE(c.comments_count, 0) AS comments_count,
    CASE WHEN p.author = $1 THEN true ELSE false END AS user_has_post,
    CASE WHEN ul.user_id IS NOT NULL THEN true ELSE false END AS user_liked_post
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
            commentsreview 
        GROUP BY
            post_id
    ) c ON p.id = c.post_id
    LEFT JOIN (
        SELECT
            post_id,
            user_id
        FROM
            likes
        WHERE user_id = $1
    ) ul ON p.id = ul.post_id
WHERE
    p.title ILIKE $2 OR p.description ILIKE $2
ORDER BY
    p.id DESC;

    `;
    const result = await pool.query(query, [userId, `%${searchQuery}%`]);
    console.log('Query Result:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: err.message });
  }
});



router.get('/users', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT name, email, profile_image FROM users WHERE id = $1';
    const result = await pool.query(query, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user information:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get a post by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const postId = req.params.id;

  try {
    const result = await pool.query(
      'SELECT id, title, description, image, author FROM posts WHERE id = $1',
      [postId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching post details:', err);
    res.status(500).json({ error: err.message });
  }
});


// Delete a post by ID along with its likes and comments
router.delete('/:id', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id; // Assuming authenticateToken middleware sets req.user

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete likes associated with the post
    await client.query(
      'DELETE FROM likes WHERE post_id = $1',
      [postId]
    );

    // Delete comments associated with the post
    await client.query(
      'DELETE FROM commentsreview WHERE post_id = $1',
      [postId]
    );

    // Delete the post
    const result = await client.query(
      'DELETE FROM posts WHERE id = $1 AND author = $2 RETURNING *',
      [postId, userId]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Post not found or you are not authorized to delete this post' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Post and associated data deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting post:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Add like
router.post('/likes', authenticateToken, async (req, res) => {
  console.log('POST /likes called');
  const { postId } = req.body;
  const userId = req.user ? req.user.id : null; 

  console.log(`postId: ${postId}, userId: ${userId}`);

  if (!postId) {
    console.log('postId is required');
    return res.status(400).json({ error: 'postId is required' });
  }

  try {
    const queryText = 'INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT (user_id, post_id) DO NOTHING';
    console.log(`Executing query: ${queryText}`);
    await pool.query(queryText, [userId, postId]);

    console.log('Like added');
    res.status(200).json({ message: 'Like added' });
  } catch (err) {
    console.error('Error adding like:', err);
    res.status(500).json({ error: err.message });
  }
});

// Remove like
router.delete('/likes', authenticateToken, async (req, res) => {
  console.log('DELETE /likes called');
  const { postId } = req.body;
  const userId = req.user ? req.user.id : null; 

  console.log(`postId: ${postId}, userId: ${userId}`);

  if (!postId) {
    console.log('postId is required');
    return res.status(400).json({ error: 'postId is required' });
  }

  try {
    const queryText = 'DELETE FROM likes WHERE user_id = $1 AND post_id = $2 RETURNING *';
    console.log(`Executing query: ${queryText}`);
    const result = await pool.query(queryText, [userId, postId]);

    console.log(`Query result: ${JSON.stringify(result)}`);

    if (result.rowCount === 0) {
      console.log('Like not found');
      return res.status(404).json({ error: 'Like not found' });
    }

    console.log('Like removed');
    res.status(200).json({ message: 'Like removed' });
  } catch (err) {
    console.error('Error removing like:', err);
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

// Get user data by ID
router.get('/user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const query = `
      SELECT * FROM users WHERE id = $1 ORDER BY date ASC`;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user profile image
router.put('/user/image', authenticateToken, upload.single('profile_image'), async (req, res) => {
  const userId = req.user ? req.user.id : null; // Corrected to use req.user.id
  const imagePath = req.file ? `/images/${req.file.filename}` : null;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const query = `
      UPDATE users
      SET profile_image = $1
      WHERE id = $2
      RETURNING *`;
    const result = await pool.query(query, [imagePath, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user image:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user email and name
router.put('/user', authenticateToken, async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const { email, name } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const query = `
      UPDATE users
      SET email = $1,
          name = $2
      WHERE id = $3
      RETURNING *`;
    const result = await pool.query(query, [email, name, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user email and name:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user password
router.put('/user/password', authenticateToken, async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Validate current password
    const isValidPassword = await validatePassword(userId, currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password in the database
    const query = `
      UPDATE users
      SET password = $1
      WHERE id = $2
      RETURNING *`;
    const result = await pool.query(query, [hashedPassword, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user password:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
