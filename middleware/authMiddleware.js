const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Check for token in cookies
  let token = req.cookies.token;

  // If no token in cookies, check for Bearer token in Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]; // Extract token from Bearer header
    }
  }

  // If no token found in either place, deny access
  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided or logout" });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
