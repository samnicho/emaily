const passport = require("passport"); // provides helpers for auth in an express app
const GoogleStrategy = require("passport-google-oauth20").Strategy; // provides helpers for using google auth with passport
const mongoose = require("mongoose");
const keys = require("../config/keys");

// !! do not use require for mongoose models as it will throw an error, particularly in some testing environments
// this is if the model is required multiple times, the application thinks that multiple models (all called 'user') are being loaded
const User = mongoose.model("users");

// call serializeUser with the user as a mongoose user model in order to generate the identifying piece of info
// args:
// 1. the user 
// 2. a callback which takes two args, the first is an error obj or string and the second is a user
passport.serializeUser((user, done) => {
  // user the user id provided by mongo, not the profile id returned by google
  // this is because there could be multiple 'Strategies' used 
  done(null, user.id)
});

// call deserializeUser with the id to generate a mongoose user model
// args:
// 1. the user id we used in serializeUser
// 2. a callback which takes two args, the first is an error obj or string and the second is a user
passport.deserializeUser((id, done) => {
  console.log(id);
  
  User.findById(id).then((user) => {
    // console.log(id);
    // console.log(user);
    done(null, user);
  })
});

//configure passport to use Google auth and confiugure GoogleStrategy
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback", // the route that users will be sent to once they've granted permissions via google (can be anything)
    },
    (accessToken, refreshToken, profile, done) => {
      // check the DB for a user record with the same profile ID as the one just returned by google
      User.findOne({ googleId: profile.id }).then((existingUser) => {
        if (existingUser) {
          // we already have a record with the given profile ID
          console.log('existing');
          console.log(existingUser);
          done(null, existingUser);
        } else {
          // we don't have a user record witha this ID, make a new record and save it to the DB
          new User({ googleId: profile.id }).save().then((user) => {
            console.log('new');
            console.log(user);
            done(null, user);
          });
        }
      });
    }
  )
);
