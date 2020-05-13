const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const keys = require('./config/keys');
const passport = require('passport');
const bodyParser = require('body-parser');
require('./models/User');
require('./services/passport');

mongoose.connect(keys.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

// ***--- EXPRESS & MIDDLEWARE in EXPRESS ---***                                                                      
//
// 'use' indicates middleware
// middleware will execute before the route handlers
//                                                                                  |-->   put  -----|
//                            express()                                             |                |
//                               |                                                  |-->   delete  --|
// request from browser   -->   app   -->   middleware #1   -->   middleware #2   --|                |--> response
//                                                                                  |-->   post  ----|
//                                                                                  |                |
//                                                                                  |-->   get  -----|

// tell express to parse req.body as json
app.use(bodyParser.json());

// --- tell app to use cookies
// cookies will be used with passport for authentication
app.use(
  // configure cookieSession library
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000, // cookies expire after 30 days (value in milliseconds)
    keys: [keys.cookieKey]
  })
);


// --- tell passport to use cookies
app.use(passport.initialize());
app.use(passport.session());

require('./routes/authRoutes')(app);
require('./routes/billingRoutes')(app);

// only run this if in prod mode
if (process.env.NODE_ENV === 'production') {
  // Express will serve up production assets (like our main.js file, or main.css file)
  app.user(express.static('client/build'));
  // Express will serve up index.html file if it doesn't recognise the route
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  })
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);
