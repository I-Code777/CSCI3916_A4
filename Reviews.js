var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

// Movie schema
var ReviewSchema = new Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }, //referst to Movie collection
    username: String, //name of reviewer
    review: String, //review body text
    rating: { type: Number, min: 0, max: 5 }
});

// return the model
module.exports = mongoose.model('Review', ReviewSchema);