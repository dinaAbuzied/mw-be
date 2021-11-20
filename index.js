const morgan = require('morgan');
// const mongoose = require('mongoose');
const search = require('./routes/search');
const cors = require('cors');
const express = require('express');
const app = express();

// TODO: Configure on production
app.use(cors({
    exposedHeaders: ['Content-Length', 'Content-Type', 'x-auth-token'],
}));

// enable post body
app.use(express.json());
// app.use(express.static(__dirname + '/public'));

app.use(morgan('tiny'));
app.use('/api/search', search);

app.listen(3100, () => console.log('Listening on port 3100....'));

// TODO: store url as env var
// mongoose.connect('mongodb://127.0.0.1:27017/tph', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('DB connected'));