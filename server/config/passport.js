// Configures how Passport authenticates with Google

// Passport is authentication middleware for Node.js
const passport = require('passport');

// GoogleStrategy knows how to talk to Google's OAuth API. Different providers have different strategies
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Chooses what info about the user to store as cookie
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Defines how to retrieve full user from the stored ID
// Called on every request after login to populate req.user
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Registers a strategy with our Passport
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // Where Google should redirect after authentication
            // This URL must also be configured in Google Cloud Console
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        },
        // Retrieves user's profile from Google
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists in our database
                let user = await User.findOne({googleId: profile.id});
                if (user) {
                    console.log('Existing user logged in:', user.username);
                    done(null, user);
                } else {
                    console.log('Creating new user:', profile.displayName);

                    // profile object structure from Google:
                    // {
                    //   id: '123456789',
                    //   displayName: 'John Doe',
                    //   name: { familyName: 'Doe', givenName: 'John' },
                    //   emails: [{ value: 'john@gmail.com', verified: true }],
                    //   photos: [{ value: 'https://...' }]
                    // }

                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        isProfileComplete: false,
                    });
                    done(null, user);
                }
            } catch (error) {
                console.error('Error in Google Strategy:', error);
                done(error, null);
            }
        }
    )
);

module.exports = passport;