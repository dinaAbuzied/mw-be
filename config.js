// TODO: savekey in env var
module.exports.tmdbURL = 'https://api.themoviedb.org/3/';
module.exports.tmdbKey = '05854f60f86475c104061378de9df8e8';
module.exports.jwtKey = 'tph_jwtPrivateKey';
module.exports.images = 'https://movie-world-091085.herokuapp.com/images/';
module.exports.mongoDb = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mw";