const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { MovieList } = require('../models/movie-list');
const axios = require('axios');
const { tmdbURL, tmdbKey } = require('../config');

router.get('/short', async (req, res) => {
    axios.get(tmdbURL + 'search/movie',
        {
            params: {
                api_key: tmdbKey,
                query: req.query.query,
                language: 'en-US',
                include_adult: false
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

router.get('/', auth, async (req, res) => {
    let filters;
    if (req.query.filters) {
        filters = JSON.parse(req.query.filters);
        console.log(filters.language)
    }
    let userMovies = [];
    if (req.user) {
        const userList = await MovieList.findOne({ userID: req.user._id });
        userMovies = userList.movies;
    }
    search(req.query.page, req.query.query)
        .then(function (response) {
            const { results, page, total_results, total_pages } = response.data;
            return res.send({
                results: results.map(movie => {
                    const { genre_ids, title, poster_path, release_date, id } = movie;
                    const usermovie = userMovies.find(m => m.tmdbID == id)
                    const lists = usermovie ? usermovie.lists : [];
                    return { genre_ids, title, poster_path, release_date, id, lists }
                }),
                total_results, total_pages, page
            });
        })
        .catch(function (error) {
            res.status(500).send({ code: 500, message: error.message });
        });
})

function search(page, query) {
    return axios.get(tmdbURL + 'search/movie',
        {
            params: {
                api_key: tmdbKey,
                query,
                language: 'en-US',
                include_adult: false,
                page
            }
        }
    )
}

module.exports = router;