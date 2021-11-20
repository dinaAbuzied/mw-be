const express = require('express');
const router = express.Router();
const axios = require('axios');
const { tmdbURL, tmdbKey } = require('../config');

router.get('/short', async (req, res) => {
    axios.get(tmdbURL + 'search/movie',
        {
            params: {
                api_key: tmdbKey,
                query: req.query.query
            }
        }
    )
        .then(function (response) {
            return res.send({
                results: response.data.results.slice(0, 6).map(movie => {
                    const { genre_ids, title, poster_path, release_date, id } = movie;
                    return { genre_ids, title, poster_path, release_date, id }
                })
            });
        })
        .catch(function (error) {
            res.status(500).send({ code: 500, message: error.message });
        });
})

module.exports = router;