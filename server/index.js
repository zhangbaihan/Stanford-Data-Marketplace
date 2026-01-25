// Imports
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');

// App Initialization
const app = express();
const PORT = process.env.port || 5001;

// Processing Incoming Requests
app.use(cors()); // Allows frontend to talk to backend

app.use(express.json()); // Parses frontend requests from JSON format to backend readable format

// ROUTES

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

