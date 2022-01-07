const Joi = require('joi');
const mongoose = require('mongoose');

const movieListValidation = Joi.object({
    userID: Joi.string().required(),
    movies: Joi.array().items(Joi.object({
        id: Joi.string().required(),
        tmdbID: Joi.number().required(),
        lists: Joi.array().items(Joi.string().valid('fav', 'wish', 'later', 'own'))
    })).required()
});

const movieValidation = Joi.object({
    movieID: Joi.number().required(),
    poster_path: Joi.string(),
    title: Joi.string().required(),
    release_date: Joi.string().required(),
    genres: Joi.array().items(Joi.string()).required(),
});

const MovieList = mongoose.model('MovieList', new mongoose.Schema({
    userID: { type: String, required: true },
    movies: {
        type: [{
            id: { type: String, required: true },
            tmdbID: { type: Number, required: true },
            lists: { type: [String], required: true, enum: ['fav', 'wish', 'later', 'own'] }
        }], required: true, default: []
    }
}));

const Movie = mongoose.model('Movie', new mongoose.Schema({
    movieID: { type: Number, required: true },
    poster_path: { type: String },
    title: { type: String, required: true },
    release_date: { type: String, required: true },
    genres: { type: [String], required: true }
}));

module.exports.movieListValidation = movieListValidation;
module.exports.movieValidation = movieValidation;
module.exports.MovieList = MovieList;
module.exports.Movie = Movie;
