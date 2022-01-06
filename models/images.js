const mongoose = require('mongoose');

const Profile = mongoose.model('Profile', new mongoose.Schema({
    imageUrl: { type: String, required: true },
    uploaded: { type: Date, default: Date.now },
    userID: { type: String }
}));

module.exports.Profile = Profile;