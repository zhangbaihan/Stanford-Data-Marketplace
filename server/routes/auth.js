// Handles the flow of authentication after user clicks "Login with Google"

const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

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
            res.redirect('http://localhost:3000/dashboard');
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

router.put('/complete-profile', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({message: 'Not authenticated'});
    }

    const {username} = req.body;
    if (!username) {
        return res.status(400).json({message: 'Username is required'});
    }

    if (username.length < 3 || username.length > 20) {
        return res.status(400).json({message: 'Username length is bad'});
    }

    const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!validUsernameRegex.test(username)) {
        return res.status(400).json({
            message: 'Username can only contain letters, numbers, and underscores',
        });
    }

    try {
        const existingUser = await User.findOne({username: username});
        if (existingUser) {
            return res.status(400).json({message: 'Username is already taken'});
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                username: username,
                isProfileComplete: true
            },
            {new: true}
        );

        res.json({
            message: 'Profile completed successfully',
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                username: updatedUser.username,
                isProfileComplete: updatedUser.isProfileComplete,
            },
        });
    } catch (error) {
        console.error('Error completing profile', error);
        res.status(500).json({message: 'Server error'});
    }
});

module.exports = router;

