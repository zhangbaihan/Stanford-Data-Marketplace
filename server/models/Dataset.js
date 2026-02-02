// Defines the structure of dataset documents in MongoDB
// Each dataset is a file that users can upload, browse, and download

const mongoose = require('mongoose');
const datasetSchema = new mongoose.Schema(
    {
        // *BASIC INFO*
        title: {
            type: String,
            required: [true, 'Dataset title is required'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },

        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: [2000, 'Description cannot be more than 2000 characters'],
        },

        // *FILE INFO*

        fileName: {
            type: String,
            required: true,
        },

        filePath: {
            type: String,
            required: true,
        },

        fileSize: {
            type: Number,
            required: true,
        },

        fileType: {
            type: String,
            required: true,
        },
        
        // *OWNERSHIP TRACKING*
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        downloadCount: {
            type: Number,
            default: 0,
        },

        // *VISIBILITY*
        isPublic: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// *INDEXES*

datasetSchema.index({
    title: 'text',
    description: 'text',
});

const Dataset = mongoose.model('Dataset', datasetSchema);

module.exports = Dataset;