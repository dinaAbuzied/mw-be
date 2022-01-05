const { registerValidation, loginValidation, User } = require('../models/users');
const { jwtKey } = require('../config');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

router.post('/register', async (req, res) => {
    let { email, password, username } = req.body;

    const { error } = registerValidation.validate({ username, email, password });
    if (error) return res.status(400).send(error.details);

    let user = await User.findOne({ email });

    if (user) return res.status(400).send({ code: 400, message: 'Email already registered' });

    user = new User({ username, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    try {
        await user.save();
    }
    catch (ex) {
        return res.status(500).send({ code: 400, message: ex.message });
    }

    const token = jwt.sign({ _id: user._id }, jwtKey)
    res.header('x-auth-token', token).send({ _id: user._id, email, username });
})

router.post('/login', async (req, res) => {
    const { error, value } = loginValidation.validate(req.body);
    if (error) return res.status(400).send(error.details);

    let { email, password } = value;

    let user = await User.findOne({ email });
    const invalid = { code: 400, message: 'Invalid email or password!' }
    if (!user) return res.status(400).send(invalid);

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).send(invalid);

    const { username, _id } = user;

    const token = jwt.sign({ _id }, jwtKey);

    // let avatar = await Profile.findOne({ userID: _id });
    // const avatar_url = (avatar && avatar.imageUrl) ? avatar.imageUrl : undefined;

    res.header('x-auth-token', token).send({ email, username, _id });
})

module.exports = router;