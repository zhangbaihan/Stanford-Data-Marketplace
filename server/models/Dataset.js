// Defines the structure of dataset documents in MongoDB
// Each dataset is a file that users can upload, browse, and download

const mongoose = require('mongoose');

// Sub-schema for contributors
const contributorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
}, { _id: false });

// Sub-schema for provenance information
const provenanceSchema = new mongoose.Schema({
    creator: { type: String, required: true },
    contributors: [contributorSchema],
    doi: { type: String },
}, { _id: false });

// Sub-schema for supporting files
const supportingFileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
}, { _id: false });

// Sub-schema for external links
const linkSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
}, { _id: false });

// Sub-schema for contact information
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
}, { _id: false });

const datasetSchema = new mongoose.Schema(
    {
        // *BASIC INFO*
        title: {
            type: String,
            required: [true, 'Dataset title is required'],
            trim: true,
            maxlength: [200, 'Title cannot be more than 200 characters'],
        },

        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: [2000, 'Description cannot be more than 2000 characters'],
        },

        abstract: {
            type: String,
            maxlength: [1000, 'Abstract cannot be more than 1000 characters'],
        },

        // *RICH METADATA*
        tags: [{
            type: String,
            trim: true,
            lowercase: true,
        }],

        tableCount: {
            type: Number,
            default: 0,
        },

        fileCount: {
            type: Number,
            default: 1,
        },

        size: {
            type: String, // Human-readable size like "144 GB", "2.1 TB"
        },

        version: {
            type: String,
        },

        provenance: provenanceSchema,

        methodology: {
            type: String,
            maxlength: [5000, 'Methodology cannot be more than 5000 characters'],
        },

        usageNotes: {
            type: String,
            maxlength: [2000, 'Usage notes cannot be more than 2000 characters'],
        },

        supportingFiles: [supportingFileSchema],

        links: [linkSchema],

        license: {
            type: String,
        },

        contact: contactSchema,

        // *FILE INFO* (for downloadable datasets)
        fileName: {
            type: String,
        },

        filePath: {
            type: String,
        },

        fileSize: {
            type: Number,
        },

        fileType: {
            type: String,
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
    'tags': 'text',
});

// Index for tag filtering
datasetSchema.index({ tags: 1 });

// Virtual for formatted last updated date
datasetSchema.virtual('lastUpdated').get(function() {
    return this.updatedAt ? this.updatedAt.toISOString().split('T')[0] : null;
});

// Ensure virtuals are included in JSON output
datasetSchema.set('toJSON', { virtuals: true });
datasetSchema.set('toObject', { virtuals: true });

const Dataset = mongoose.model('Dataset', datasetSchema);

module.exports = Dataset;