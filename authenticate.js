// implementing local strategy
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
  return jwt.sign(user, config.secretKey, {expiresIn: 3600}); //equivalent to 1hr
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
  new JwtStrategy(
    opts,
    (jwt_payload, done) => {
      console.log('JWT payload:', jwt_payload);
      User.findOne({_id: jwt_payload._id}, (err, user) => {
        if (err) {
          return done(err, false);    // error no user was found
        } else if (user) {
          return done(null, user);   // no error, user document found
        } else {
          return done(null, false);  // no error but no user document was found
        }
      });
    }
  )
);

exports.verifyUser = passport.authenticate('jwt', {session: false});