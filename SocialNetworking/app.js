require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const multer = require('multer'); // Import multer for file uploads

const pool = require('./db'); // Import the pool instance from db.js


// Setup multer for file uploads
const upload = multer({ dest: 'public/images/' });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
app.get('/forgot-pass', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forgot.html'));
});

const authRoutes = require('./server/routes/auth');
const postRoutes = require('./server/routes/posts');
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Handle file uploads if needed
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ file: req.file });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
