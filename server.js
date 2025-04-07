/*
CSC3916 HW4
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');
var mongoose = require('mongoose');
//extra credit section=================================
var express = require('express');
var bodyParser = require('body-parser');
const crypto = require("crypto");
var rp = require('request-promise');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var router = express.Router();

const GA_TRACKING_ID = process.env.GA_KEY;
//====================================================

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

//MongoDB URL
const mongoURI = 'mongodb+srv://test:pass@assignment4.8abualg.mongodb.net/?retryWrites=true&w=majority&appName=Assignment4';

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

//extra Credit section========================================================================================================================
function trackDimension(category, action, label, value, dimension, metric) {

    var options = { method: 'GET',
        url: 'https://www.google-analytics.com/collect',
        qs:
            {   // API Version.
                v: '1',
                // Tracking ID / Property ID.
                tid: GA_TRACKING_ID,
                // Random Client Identifier. Ideally, this should be a UUID that
                // is associated with particular user, device, or browser instance.
                cid: crypto.randomBytes(16).toString("hex"),
                // Event hit type.
                t: 'event',
                // Event category.
                ec: category,
                // Event action.
                ea: action,
                // Event label.
                el: label,
                // Event value.
                ev: value,
                // Custom Dimension
                cd1: dimension,
                // Custom Metric
                cm1: metric
            },
        headers:
            {  'Cache-Control': 'no-cache' } };

    return rp(options);
}

router.route('/test')
    .get(function (req, res) {
        // Event value must be numeric.
        trackDimension('Feedback', 'Rating', 'Feedback for Movie', '3', 'Guardian\'s of the Galaxy 2', '1')
            .then(function (response) {
                console.log(response.body);
                res.status(200).send('Event tracked.').end();
            })
    });

//============================================================================================================================================

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

// Users CRUD Operations-------------------------------------------------------------------------------------------------------------------------
// GET all users
router.get('/Users', authJwtController.isAuthenticated, async (req, res) => {
    try {
      const users = await User.find();  // Fetch all users from MongoDB
      res.json(users);  // Send the users in the response
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to fetch users.' });
    }
  });
  
  // POST create a new user (already in your signup route)
  router.post('/signup', async (req, res) => {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ success: false, msg: 'Please include both username and password to signup.' });
    }
  
    try {
      const user = new User({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
      });
  
      await user.save();
      res.status(201).json({ success: true, msg: 'Successfully created new user.' });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'A user with that username already exists.' });
      }
      console.error(err);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
  });
  
  // PUT update a user by ID
  router.put('/Users/:id', authJwtController.isAuthenticated, async (req, res) =>
{
    const { name, username, password } = req.body;
  
    if (!name || !username || !password)
    {
      return res.status(400).json({ success: false, message: 'User must have a name, username, and password.' });
    }
  
    try
    {
      const updatedUser = await User.findByIdAndUpdate
      (
        req.params.id,
        { name, username, password },
        { new: true }  // Return the updated user
      );
  
      if (!updatedUser)
      {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
  
      res.json(updatedUser);  // Return the updated user
    }
    catch (err)
    {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to update user.' });
    }
});
  
  
// DELETE a user by ID
router.delete('/Users/:id', authJwtController.isAuthenticated, async (req, res) =>
{
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
  
      if (!deletedUser) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
  
      res.json({ success: true, message: 'User deleted.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to delete user.' });
    }
});

// Movies CRUD Operations------------------------------------------------------------------------------------------------------------------------
// GET all movies
router.get('/Movies', authJwtController.isAuthenticated, async (req, res) => {
    try {
        // Check if query param is reviews=true
        if (req.query.reviews === 'true') {
            // Use aggregate with $lookup to join reviews
            const moviesWithReviews = await Movie.aggregate([
                {
                    $lookup: {
                        from: 'reviews', // name of the Review collection (lowercase + plural)
                        localField: '_id',
                        foreignField: 'movieId',
                        as: 'reviews'
                    }
                }
            ]);
            res.json(moviesWithReviews);
        } else {
            // Just return all movies without reviews
            const movies = await Movie.find();
            res.json(movies);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch movies.' });
    }
});

  
  // POST a new movie
  router.post('/Movies', authJwtController.isAuthenticated, async (req, res) => {
    const { title, actors } = req.body;
  
    if (!title || !actors || actors.length === 0) {
        return res.status(400).json({ success: false, message: 'Movie must have a title and at least one actor.' });
    }
  
    try {
        const newMovie = new Movie({
            title,
            actors
        });
  
        await newMovie.save();  // Save the movie in MongoDB
  
        res.status(201).json(newMovie);  // Return the created movie
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to create movie.' });
    }
});
  
// PUT update a movie by ID
router.put('/Movies/:id', authJwtController.isAuthenticated, async (req, res) =>
{
    const { title, actors } = req.body;
  
    if (!title || !actors || actors.length === 0) {
        return res.status(400).json({ success: false, message: 'Movie must have a title and at least one actor.' });
    }
  
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            { title, actors },
            { new: true }  // Return the updated movie
        );
  
        if (!updatedMovie) {
            return res.status(404).json({ success: false, message: 'Movie not found.' });
        }
  
        res.json(updatedMovie);  // Return the updated movie
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to update movie.' });
    }
  });
  
  // DELETE a movie by ID
  router.delete('/Movies/:id', authJwtController.isAuthenticated, async (req, res) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
  
        if (!deletedMovie) {
            return res.status(404).json({ success: false, message: 'Movie not found.' });
        }
  
        res.json({ success: true, message: 'Movie deleted.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to delete movie.' });
    }
});

// Reviews CRUD Operations------------------------------------------------------------------------------------------------------------------------
// Create Review - POST
router.post('/Reviews', function(req, res) {
    const { movieId, username, review, rating } = req.body;

    // Check if all fields are provided
    if (!movieId || !username || !review || !rating) {
        return res.status(400).json({ success: false, msg: 'All fields are required' });
    }

    const newReview = new Review({
        movieId: mongoose.Types.ObjectId(movieId),
        username,
        review,
        rating
    });

    newReview.save(function(err, savedReview) {
        if (err) {
            return res.status(500).json({ success: false, msg: 'Error saving review', error: err });
        }
        res.status(201).json({ success: true, review: savedReview });
    });
});

// Get Reviews for a Movie - GET
router.get('/Reviews/:movieId', function(req, res) {
    const movieId = req.params.movieId;

    Review.find({ movieId: movieId })
        .populate('movieId', 'title') // Populating the Movie title in the review result
        .exec(function(err, reviews) {
            if (err) {
                return res.status(500).json({ success: false, msg: 'Error fetching reviews', error: err });
            }
            if (reviews.length === 0) {
                return res.status(404).json({ success: false, msg: 'No reviews found for this movie' });
            }
            res.json({ success: true, reviews });
        });
});

// Update Review - PUT
router.put('/Reviews/:id', function(req, res) {
    const reviewId = req.params.id;
    const { review, rating } = req.body;

    // Check if review or rating is provided
    if (!review && rating === undefined) {
        return res.status(400).json({ success: false, msg: 'Review or rating must be provided' });
    }

    Review.findByIdAndUpdate(reviewId, { review, rating }, { new: true }, function(err, updatedReview) {
        if (err) {
            return res.status(500).json({ success: false, msg: 'Error updating review', error: err });
        }
        if (!updatedReview) {
            return res.status(404).json({ success: false, msg: 'Review not found' });
        }
        res.json({ success: true, review: updatedReview });
    });
});

// Delete Review - DELETE
router.delete('/Reviews/:id', function(req, res) {
    const reviewId = req.params.id;

    Review.findByIdAndDelete(reviewId, function(err, deletedReview) {
        if (err) {
            return res.status(500).json({ success: false, msg: 'Error deleting review', error: err });
        }
        if (!deletedReview) {
            return res.status(404).json({ success: false, msg: 'Review not found' });
        }
        res.json({ success: true, msg: 'Review deleted successfully' });
    });
});

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only