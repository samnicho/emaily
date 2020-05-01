const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const keys = require('./config/keys');
require('./models/User');
require('./services/passport');

const app = express();

// ***--- EXPRESS & MIDDLEWARE in EXPRESS ---***
//
//                                                                                  |-->   put  -----|
//                            express()                                             |                |
//                               |                                                  |-->   delete  --|
// request from browser   -->   app   -->   middleware #1   -->   middleware #2   --|                |--> response
//                                                                                  |-->   post  ----|
//                                                                                  |                |
//                                                                                  |-->   get  -----|

// 'use' indicates middleware 
// middleware will execute before the route handlers


// --- tell app to use cookies
// cookies will be used with passport for authentication
app.use(
  // configure cookieSession lib
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000, // cookies expire after 30 days (value in milliseconds)
    keys: [keys.cookieKey]
  })
);

// tell passport to use cookies
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(keys.mongoURI);

require('./routes/authRoutes')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT);