const morgan = require('morgan');
const mongoose = require('mongoose');
const search = require('./routes/search');
const genres = require('./routes/genres');
const languages = require('./routes/languages');
const movie = require('./routes/movie');
const users = require('./routes/users');
const images = require('./routes/images');
const movieList = require('./routes/movie-list');
const cors = require('cors');
const express = require('express');
const app = express();
const config = require('./config');

// TODO: Configure on production
app.use(cors({
    exposedHeaders: ['Content-Length', 'Content-Type', 'x-auth-token'],
}));

// enable post body
app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.use(morgan('tiny'));
app.use('/api/search', search);
app.use('/api/genres', genres);
app.use('/api/languages', languages);
app.use('/api/movie', movie);
app.use('/api/user', users);
app.use('/api/images', images);
app.use('/api/movieList', movieList);

app.listen(3100, () => console.log('Listening on port 3100....'));

// TODO: store url as env var
mongoose.connect(config.mongoDb, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('DB connected'));