/*
require('dotenv').config();: Loads environment variables from a .env file (explained earlier).
const express = require('express');: Imports the Express framework for creating the web application.
const path = require('path');: Imports the path module for manipulating file paths.
const multer = require('multer');: Imports the multer middleware for handling file uploads.
*/
require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

/*
Middleware:
app.use(express.json());: Parses incoming JSON data in the request body.
app.use(express.static(path.join(__dirname, 'public')));: Makes the public folder accessible
 for serving static files like HTML pages.
*/
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/*
These routes (app.get('/...')) simply serve the corresponding HTML file from the public folder 
based on the request path. They handle requests for login, signup, home, and forgot password pages.
*/
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

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset.html'));
});

/*
const authRoutes = require('./server/routes/auth');: Imports routes for authentication functionalities from a separate file (auth.js likely).
Likewise, similar imports are done for postRoutes and commentsRoutes.
app.use('/api/auth', authRoutes);: Mounts the imported routes under the /api/auth path. Similar mounts are done for posts and comments routes.
This approach keeps the code organized and allows for independent development and maintenance of different functionalities.
*/
const authRoutes = require('./server/routes/auth');
const postRoutes = require('./server/routes/posts');
const commentsRoutes = require('./server/routes/comments');
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentsRoutes);

app.post('/upload', multer().single('image'), (req, res) => {
  res.json({ file: req.file });
});
/*
app.post('/upload', multer().single('image'), (req, res) => {...});:
Defines a POST route for handling file uploads with the path /upload.
multer().single('image') configures Multer to handle a single file upload named "image" in the request body.
The route handler function receives the request (req) and response (res) objects.
If the upload is successful, req.file will contain information about the uploaded file.
The handler responds with a JSON object containing the details of the uploaded file.
*/
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
