
'use strict';

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { users, nextId } = require('../data');

// Google OAuth verification callback
async function verifyCallback(accessToken, refreshToken, profile, done) {
  try {
    const email = profile.emails[0].value;

    // 1. Check returning Google OAuth user
    const existingGoogleUser = users.find(
      (user) => user.googleId === profile.id
    );

    if (existingGoogleUser) {
      return done(null, existingGoogleUser);
    }

    // 2. Check existing local account by email
    const existingEmailUser = users.find(
      (user) => user.email === email
    );

    if (existingEmailUser) {
      if (profile._json.email_verified === true) {
        existingEmailUser.googleId = profile.id;
        return done(null, existingEmailUser);
      }

      return done(null, false);
    }

    // 3. Create a new user
    const newUser = {
      id: nextId(),
      googleId: profile.id,
      email: email,
      name: profile.displayName,
      role: 'member',
    };

    users.push(newUser);

    return done(null, newUser);

  } catch (err) {
    return done(err);
  }
}

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'test-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
      callbackURL: '/auth/google/callback',
    },
    verifyCallback,
  ),
);

// Export passport and verifyCallback
module.exports = { passport, verifyCallback };
