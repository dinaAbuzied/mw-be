const { jwtKey } = require('../config');
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).send({ code: 401, message: 'Access denied. No token provided.' });
    }

    try {
        req.user = jwt.verify(token, jwtKey);
        next();
    }
    catch (ex) {
        return res.status(400).send('Invalid token.');
    }
}

module.exports = auth;