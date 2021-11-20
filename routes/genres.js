const express = require('express');
const router = express.Router();
const axios = require('axios');
const { tmdbURL, tmdbKey } = require('../config');

router.get('/', async (req, res) => {
    axios.get(tmdbURL + 'genre/movie/list',
        {
            params: {
                api_key: tmdbKey
            }
        }
    )
        .then(function (response) {
            return res.send(response.data);
        })
        .catch(function (error) {
            res.status(500).send({ code: 500, message: error.message });
        });
})

module.exports = router;