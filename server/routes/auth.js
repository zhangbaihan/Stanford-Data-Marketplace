// Handles the flow of authentication after user clicks "Login with Google"

const express = require('express');
const router = express.Router();
const passport = require('passport');

// Initiate Google Login. Frontend redirects here after using click on "Login with Google"
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

// Google callback: Google redirects back here. This URL must match what is set in Google Cloud Console
router.get(
    '/google/callback',
    passport.authenticate('google', {
        // if auth fails, redirect to homepage.
        failureRedirect: '/',
    }),
    (req, res) => {
        if (!req.user.isProfileComplete) {
            // Hardcoded pages
            res.redirect('http://localhost:3000/complete-profile');
        } else {
            res.redirect('htpp://localhost:3000/dashboard');
        }
    }
);

// Get current user
// Frontend calls this to check if user is logged in.
router.get('/me', (req, res) => {
    if (req.user) {
        res.json({
            isAuthenticated: true,
            user: {
                id: req.user._id,
                email: req.user.email,
                username: req.user.username,
                isProfileComplete: req.user.isProfileComplete,
            },
        });
    } else {
        res.json({
            isAuthenticated: false,
            user: null,
        });
    }
});

// Log out

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).json({message: 'Error logging out'});
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
            res.clearCookie('connect.sid');
            res.json({message: 'Logged out successfully'});
        });
    });
});

module.exports = router;

