var GoogleStrategy = require('passport-google-oauth2').Strategy;
var User = require('../models/user');
var passport   = require('passport');
var config = require('./auth');

module.exports = function(passport){
	passport.use('loging',new GoogleStrategy({
	    clientID:  config.google.clientID,
	    clientSecret: config.google.clientSecret,
	    callbackURL: config.google.callbackURL,
	    /*
	    clientID:  config.google.clientID,
	    clientSecret: config.google.clientSecret,
	    callbackURL: config.google.callbackURL,
	    */
	    passReqToCallback   : true
	  },function(req, token, refreshToken, profile, done) {

	  		// make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // try to find the user based on their google id
            User.findOne({ 'google.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {

                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser          = new User();

                    // set all of the relevant information
                    newUser.google.id    = profile.id;
                    newUser.google.token = token;
                    newUser.google.name  = profile.displayName;
                    newUser.google.email = profile.emails[0].value; // pull the first email

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
	  }
	));
}
