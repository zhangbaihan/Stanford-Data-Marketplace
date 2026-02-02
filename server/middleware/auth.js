// Express middleware has access to three things: req (client sent this), res (what we are gonna send back to client), next (a function that goes to the next step)
// Calling next(): req goes to route handler. If not, req stops here and we send back a response.

// PURPOSE: Block access to routes unless logged in. Any route that requires login should use this.
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        return next();
    }
    return res.status(401).json({
        message: 'You must be logged in first!'
    });
};

const isProfileComplete = (req, res, next) => {
    if (req.user.isProfileComplete) {
        return next();
    }
    return res.status(403).json({
        message: 'Please complete your profile before performing this action',
        redirectTo: '/complete-profile'
      });
};

module.exports = {
    isAuthenticated,
    isProfileComplete,
};
