// Imports
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/db');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const datasetRoutes = require('./routes/datasets');

// App Initialization
const app = express();
const PORT = process.env.PORT || 5001;

// Connect to DB
connectDB();

// Processing Incoming Requests
app.use(
    cors({
        // Allow requests from React frontend
        origin: 'http://localhost:3000',
        // Allows cookies
        credentials: true,
    })
); // Allows frontend to talk to backend

app.use(express.json()); // Parses frontend requests from JSON format to backend readable format

// Session: without session, user would have to login on every request
app.use(
    session({
        // Our cur secret is insecure!
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            // 24 hours until cookie expires
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
        },
    })
);

// Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// ROUTES
app.use('/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);

// At root path, backend sends the following json message to frontend
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Stanford Data Marketplace API',
        status: 'Server is running'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

