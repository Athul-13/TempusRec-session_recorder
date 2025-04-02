const jwt = require('jsonwebtoken')

const generateAccessToken = (userId, role) => {
    try {
        return jwt.sign(
            {userId, role},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '1d'}
        );
    } catch (err) {
        console.error('Error generating access token:', er);
    }
};

module.exports = {generateAccessToken};