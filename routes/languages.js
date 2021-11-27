const express = require('express');
const router = express.Router();
const ISO6391 = require('iso-639-1');

router.get('/', async (req, res) => {
    const langs = ISO6391.getAllNames();
    return res.send({ languages: langs });
})

module.exports = router;