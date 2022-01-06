const { registerValidation, loginValidation, userUpdateValidation, User } = require('../models/users');
const { Profile } = require('../models/images');
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

    const { username, _id, fname, lname } = user;

    const token = jwt.sign({ _id }, jwtKey);

    let avatar = await Profile.findOne({ userID: _id });
    const avatar_url = (avatar && avatar.imageUrl) ? avatar.imageUrl : undefined;

    res.header('x-auth-token', token).send({ email, username, _id, fname, lname, avatar_url });
})

router.put('/:id', auth, async (req, res) => {
    if (req.params.id !== req.user._id) return res.status(400).send({ code: 400, message: `This user doesn't have access to edit this account!` });

    let user = await User.findById(req.user._id, { '__v': 0, 'password': 0 });
    if (!user) return res.status(400).send({ code: 400, message: 'Invalid user!' });

    const { error, value } = userUpdateValidation.validate(req.body);
    if (error) return res.status(400).send(error.details);

    const keys = Object.keys(value);
    keys.map(key => {
        user[key] = value[key];
    })
    try {
        await user.save();
        res.send(user);
    }
    catch (ex) {
        return res.status(500).send({ code: 500, message: ex.message });
    }
})

module.exports = router;