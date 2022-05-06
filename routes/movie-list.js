const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { MovieList, Movie, movieValidation } = require('../models/movie-list');
const axios = require('axios');
const { tmdbURL, tmdbKey } = require('../config');

router.get('/', auth, async (req, res) => {
    const list = await MovieList.findOne({ 'userID': req.user._id });
    if (!list) return res.status(400).send('Invalid List!');

    const movies = [];
    for (const m of list.movies) {
        let movie = await Movie.findById(m.id);
        const {poster_path, movieID, title, release_date, genres} = movie;
        movies.push({lists: m.lists, poster_path, id: movieID, title, release_date, genres});
      }
    return res.send({ movies });
})

router.put('/:type', auth, async (req, res) => {
    const list = await MovieList.findOne({ 'userID': req.user._id });
    if (!list) return res.status(400).send('Invalid List!');

    const movieIndex = list.movies.findIndex(movie => movie.tmdbID === req.body.movieID);
    const movieobj = list.movies.find(movie => movie.tmdbID === req.body.movieID);
    if (movieobj) {
        const index = movieobj.lists.indexOf(req.params.type);
        if (index >= 0) {
            movieobj.lists.splice(index, 1);
            if(movieobj.lists.length == 0) {
                list.movies.splice(movieIndex, 1);
            }
        } else {
            movieobj.lists.push(req.params.type);
        }
    } else {
        let movie = await Movie.findOne({ movieID: req.body.movieID });
        if (!movie) {
            try {
                const response = await axios.get(tmdbURL + 'movie/' + req.body.movieID,
                    {
                        params: {
                            api_key: tmdbKey
                        }
                    })
                const value = {
                    movieID: req.body.movieID,
                    poster_path: response.data.poster_path,
                    title: response.data.title,
                    release_date: response.data.release_date,
                    genres: response.data.genres.map(g => g.name),
                }
                const { error } = movieValidation.validate(value);
                if (error) return res.status(400).send(error.details);

                movie = new Movie(value);
                try {
                    await movie.save();
                }
                catch (ex) {
                    return res.status(500).send({ code: 500, message: ex.message });
                }
            }
            catch (ex) {
                return res.status(500).send({ code: 500, message: ex.message });
            }
        }
        list.movies.push({
            id: movie._id,
            tmdbID: req.body.movieID,
            lists: [req.params.type]
        });
    }

    try {
        await list.save();
        res.send({ success: true });
    }
    catch (ex) {
        return res.status(500).send({ code: 500, message: ex.message });
    }
})

module.exports = router;