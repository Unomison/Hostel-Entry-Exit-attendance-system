const jwt = require('jsonwebtoken');

// Generate a JWT token for a user
// id = user's MongoDB _id
// role = 'student', 'guard', or 'admin'
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token valid for 7 days
  );
};

module.exports = generateToken;