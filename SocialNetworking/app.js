require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

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

app.post('/upload', multer().single('image'), (req, res) => {
  res.json({ file: req.file });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
