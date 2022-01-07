const { jwtKey } = require('../config');
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if (token) {
        try {
            req.user = jwt.verify(token, jwtKey);
            next();
        }
        catch (ex) {
            return res.status(400).send('Invalid token.');
        }
    } else {
        next();
    }
}

module.exports = auth;