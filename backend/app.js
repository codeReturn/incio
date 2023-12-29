const fs = require('fs');
const express = require('express');
const passport = require('passport');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectRoutes = require('./routes/connect-routes');
const apiRoutes = require('./routes/api-routes');
const usersRoutes = require('./routes/users-routes');
const googleStrategy = require('passport-google-oauth20').Strategy;
const linkedinStrategy = require('passport-linkedin-oauth2').Strategy;
const HttpError = require('./models/http-error');

const app = express();
const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.DB, { useNewUrlParser: true })
  .then(() => console.log(`Database connected successfully`))
  .catch((err) => console.log(err));

app.use(bodyParser.json());

const cors = require('cors');
var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
  methods: "GET, PUT, PATCH, DELETE, POST",
  credentials: true
};

app.use(cors(corsOptions));

app.use('/server/data/stored', express.static(path.join('data', 'stored')));
app.use('/server/uploads/images', express.static(path.join('uploads', 'images')));
app.use('/server/uploads/files', express.static(path.join('uploads', 'files')));


const User = require('./models/user'); 

passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://inciohost.com/server/api/users/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          accessToken: accessToken,
          refreshToken: refreshToken,
          type: 'google'
        });

        await newUser.save();

        done(null, newUser);
      } catch (err) {
        done(err, false);
      }
    }
  )
);

passport.use(
  new linkedinStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: 'https://inciohost.com/server/api/users/linkedin/callback',
      scope: ['openid', 'profile', 'email']
    },
    async (accessToken, refreshToken, done) => {
      try {
        const userInfo = await linkedin.getProfile(
          process.env.LINKEDIN_CLIENT_ID,
          process.env.LINKEDIN_CLIENT_SECRET,
          accessToken
        );

        console.log(userInfo)
        
        let existingUser = await User.findOne({ email: userInfo.email });

        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = new User({
          name: userInfo.name,
          email: userInfo.email,
          accessToken: accessToken,
          refreshToken: refreshToken,
          type: 'linkedin'
        });

        await newUser.save();

        done(null, newUser);
      } catch (err) {
        console.log(err)
        done(err, false);
      }
    }
  )
);

// Register passport middleware
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB }),
  })
);

app.use(passport.initialize());
app.use(passport.session()); 

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.use('/server/api/connect', connectRoutes);
app.use('/server/api/', apiRoutes);
app.use('/server/api/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
