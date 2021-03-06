const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { MovieList } = require('../models/movie-list');
const axios = require('axios');
const { tmdbURL, tmdbKey } = require('../config');

router.get('/', auth, async (req, res) => {
    if (!req.query.id) {
        return res.status(500).send({ code: 500, message: 'no movie id provided' });
    }
    axios.get(tmdbURL + 'movie/' + req.query.id,
        {
            params: {
                api_key: tmdbKey
            }
        }
    )
        .then(async function (response) {
            const { id, overview, release_date, poster_path, title, genres, runtime, production_countries, imdb_id } = response.data;
            let lists = [];
            if (req.user) {
                const list = await MovieList.findOne({ userID: req.user._id });
                const movie = list.movies.find(m => {
                    return m.tmdbID == req.query.id
                });
                if (movie) lists = movie.lists;
            }
            return res.send({ details: { id, overview, release_date, poster_path, title, genres, runtime, production_countries, imdb_id, lists } });
        })
        .catch(function (error) {
            res.status(500).send({ code: 500, message: error.message });
        });
})

router.get('/credits', async (req, res) => {
    if (!req.query.id) {
        return res.status(500).send({ code: 500, message: 'no movie id provided' });
    }
    axios.get(tmdbURL + 'movie/' + req.query.id + '/credits',
        {
            params: {
                api_key: tmdbKey
            }
        }
    )
        .then(function (response) {
            const actors = response.data.cast.splice(0, 6).map(c => {
                const { id, name, character, profile_path } = c;
                return { id, name, character, profile_path };
            });
            const writers = response.data.crew.filter(c => c.department == "Writing").map(c => {
                const { id, name, job, profile_path } = c;
                return { id, name, job, profile_path };
            });
            const directors = response.data.crew.filter(c => c.department == "Directing" && c.job == "Director").map(c => {
                const { id, name, job, profile_path } = c;
                return { id, name, job, profile_path };
            });
            return res.send({ id: response.data.id, actors, writers, directors });
        })
        .catch(function (error) {
            res.status(500).send({ code: 500, message: error.message });
        });
})

router.get('/now_playing', auth, async (req, res) => {
    getMovieList('now_playing', req, res);
})

router.get('/upcoming', auth, async (req, res) => {
    getMovieList('upcoming', req, res);
})

const getMovieList = async (type, req, res) => {
    let userMovies = [];
    if (req.user) {
        const userList = await MovieList.findOne({ userID: req.user._id });
        userMovies = userList.movies;
    }
    axios.get(tmdbURL + 'movie/' + type,
        {
            params: {
                api_key: tmdbKey
            }
        }
    )
        .then(function (response) {
            return res.send({
                results: response.data.results.slice(0, 10).map(movie => {
                    const { title, poster_path, id } = movie;
                    const usermovie = userMovies.find(m => m.tmdbID == id)
                    const lists = usermovie ? usermovie.lists : [];
                    return { title, poster_path, id, lists }
                })
            });
        })
        .catch(function (error) {
            res.status(500).send({ code: 500, message: error.message });
        });
}

module.exports = router;