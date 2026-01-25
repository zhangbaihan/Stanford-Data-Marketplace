const mongoose = require('mongoose');

// Schema Definition
// We are defining a class that shows the structure of a "user"
const userSchema = new mongoose.Schema(
    {
        googleId: {
            type: String,
            required: true,
            unique: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        username: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            minlength: 3,
            maxlength: 20,
        },

        isProfileComplete: {
            type: Boolean,
            default: false,
        },
        // We can add more here later, such as createdDatasets, subscriptions, etc.
    },
    {
        timestamps: true,
    }
);

// Create and Export the Model
// The model talks to the users collection to let us create, find, update, or delete users

const User = mongoose.model('User', userSchema);

module.exports = User;