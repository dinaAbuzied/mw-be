const { Profile } = require('../models/images');
const { images } = require('../config');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb2) => {
        console.log(file);
        var filetype = '';
        if (file.mimetype === 'image/gif') {
            filetype = 'gif';
        }
        if (file.mimetype === 'image/png') {
            filetype = 'png';
        }
        if (file.mimetype === 'image/jpeg') {
            filetype = 'jpg';
        }
        cb2(null, 'profile-' + Date.now() + '.' + filetype);
    }
});

const upload = multer({ storage: storage });

router.post('/profile', auth, upload.single('file'), async (req, res,) => {
    if (req.body.userID !== req.user._id) return res.status(400).send({ code: 400, message: `This user doesn't have access to edit this account!` });
    if (!req.file) return res.status(500).send({ code: 500, message: 'Upload fail' });
    req.body.imageUrl = images + req.file.filename;

    const oldProfile = await Profile.findOneAndDelete({ userID: req.body.userID });
    if (oldProfile && oldProfile.imageUrl) {
        const url = String(oldProfile.imageUrl).replace(images, './public/images/');
        console.log(url);
        fs.unlink(url, (err) => {
            console.log(err);
        });
    }

    const profile = new Profile(req.body);
    console.log(images + req.file.filename);

    try {
        await profile.save();
    }
    catch (ex) {
        return res.status(500).send({ code: 400, message: ex.message });
    }
    res.send({ imageUrl: profile.imageUrl });
});

module.exports = router;