const passport = require("passport"); // provides helpers for auth in an express app
const GoogleStrategy = require("passport-google-oauth20").Strategy; // provides helpers for using google auth with passport
const mongoose = require("mongoose");
const keys = require("../config/keys");

// !! do not use require for mongoose models as it will throw an error, particularly when running some testing libraries (Jest, Mocha, etc.)
// this is if the model is required multiple times, the application thinks that multiple models (all called 'user') are being loaded
const User = mongoose.model('users');

// --- Serialize user
// call serializeUser with the mongoose user model in order to generate the identifying piece of info
// this identifying piece of info will be the document id for this user from the db
// args:
// 1. the user 
// 2. a callback which takes two args, the first is an error obj or string and the second is a user
passport.serializeUser((user, done) => {
  // user the user id provided by mongo, not the profile id returned by google
  // this is because there could be multiple 'Strategies' used 
  console.log('serialize user: ');
  console.log(user);
  done(null, user.id)
});

// --- Deserialize user
// call deserializeUser with the id to generate a mongoose user model
// the id will be used to search the db for a user document with a matching id
// args:
// 1. the user id we used in serializeUser
// 2. a callback which takes two args (1. an error obj or string, 2. a user)
passport.deserializeUser((id, done) => {
  console.log('deserializeUser: ');
  console.log('id: ' + id);
  
  User.findById(id).then((user) => {
    console.log('user:', user);
    done(null, user);
  });
});

// configure passport to use Google auth and configure GoogleStrategy
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback",
      proxy: true // tell GoogleStrategy to trust proxys, this fixes the https to http error 
    },
    (accessToken, refreshToken, profile, done) => {
      // console.log('accessToken: ', accessToken);
      console.log('profile ID: ', profile.id);
      console.log('profile name: ', profile.displayName);
      // check the DB for a user record with the same profile ID as the one just returned by google
      User.findOne({ googleId: profile.id }).then((existingUser) => {
        if (existingUser) {
          console.log('existing user');
          // we already have a record with the given profile ID
          done(null, existingUser);
        } else {
          console.log('new user');
          // we don't have a user record witha this ID, make a new record and save it to the DB
          new User({ googleId: profile.id }).save().then((user) => {
            done(null, user);
          });
        }
      });
    }
  )
);
