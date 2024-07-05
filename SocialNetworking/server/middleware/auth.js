// middleware/auth.js
// Import the jsonwebtoken library for handling JWT tokens
const jwt = require('jsonwebtoken');

// Define the secret key used to sign the JWT tokens
// In a real application, this should be stored in an environment variable
const SECRET_KEY = 'your_jwt_secret_key';

/**
 * Middleware function to authenticate the JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateToken = (req, res, next) => {
  // Retrieve the 'authorization' header from the request
  const authHeader = req.headers['authorization'];

  // Extract the token from the 'authorization' header
  // The format of the header should be 'Bearer <token>'
  const token = authHeader && authHeader.split(' ')[1];

  // If no token is found, send a 401 Unauthorized response
  if (!token) return res.sendStatus(401);

  // Verify the token using the secret key
  jwt.verify(token, SECRET_KEY, (err, user) => {
    // If token verification fails, send a 403 Forbidden response
    if (err) return res.sendStatus(403);

    // If token is valid, attach the decoded user information to the request object
    req.user = user;

    // Call the next middleware function in the stack
    next();
  });
};

// Export the authenticateToken function for use in other parts of the application
module.exports = { authenticateToken };
