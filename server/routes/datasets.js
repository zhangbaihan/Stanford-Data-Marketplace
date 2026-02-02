const express = require('express');
const router = express.Router();
const Dataset = require('../models/Dataset');
const upload = require('../config/multer');
const { uploadFile, getDownloadUrl } = require('../services/s3service');
const { isAuthenticated, isProfileComplete } = require('../middleware/auth');

// ROUTE 1: Get All Datasets
// GET /api/datasets

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const filter = {
            isPublic: true,
            status: 'approved',
        };

        if (req.query.tag) {
            filter.tags = req.query.tag.toLowerCase();
        }

    // Mongoose query chain:
    // 1. find(filter) - get matching documents
    // 2. populate() - fill in the user reference
    // 3. sort() - order the results
    // 4. skip() - skip for pagination
    // 5. limit() - only return this many
    // 6. select() - choose which fields to return (optional optimization)
        
        const datasets = await Dataset.find(filter)
            .populate('uploadedBy', 'username')
            .skip(skip)
            .limit(limit)
            .select('-filePath');
        
        const totalCount = await Dataset.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            datasets,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        console.error('Error fetching datasets:', error);
        res.status(500).json({message: 'Error fetching datasets'});
    }
});

// ROUTE 2: Search Datasets
// GET /api/datasets/search?q=economics

router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.q;
        if (!searchQuery || searchQuery.trim() === '') {
            return res.json({datasets: [], message: 'No search query provided'});
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const datasets = await Dataset.find({
            $text: {$search: searchQuery},
            isPublic: true,
            status: 'approved',
        })
            .populate('uploadedBy', 'username')
            // $meta: 'textScore' is a relevance score
            .sort({score: {$meta: 'textScore'}})
            .skip(skip)
            .limit(limit)
            .select('-filePath');
            
        const totalCount = await Dataset.countDocuments({
            $text: {$search: searchQuery},
            isPublic: true,
            status: 'approved',
        });

        res.json({
            datasets,
            searchQuery,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
            },
        });
    } catch (error) {
        console.error('Error searching datasets:', error);
        res.status(500).json({message: 'Error searching datasets'});
    }
});

// ROUTE 3: Get single Dataset by ID
// GET /api/datasets/:id

router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const dataset = await Dataset.findById(id)
            .populate('uploadedBy', 'username');
        
        if (!dataset) {
            return res.status(404).json({message: 'Dataset not found'});
        }

        if (!dataset.isPublic || dataset.status !== 'approved') {
            return res.status(403).json({message: 'This dataset is not available to view'});
        }

        res.json({dataset});
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid dataset ID format' });
        }
        console.error('Error fetching dataset:', error);
        res.status(500).json({ message: 'Error fetching dataset' });
    }
});

// ROUTE 4: Upload a New Dataset
// POST /api/datasets
// Middleware used in a chain: isAuthenticated, isProfileComplete, upload.single('file')

router.post('/', isAuthenticated, isProfileComplete, upload.single('file'), async (req,res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, description, tags } = req.body;

        if (!title || !description) {
            return res.status(400).json({ 
              message: 'Title and description are required' 
            });
        }

        const { key, size } = await uploadFile(
            req.file.buffer,        
            req.file.originalname,  
            req.file.mimetype       
        );

        const dataset = await Dataset.create({
            title: title.trim(),
            description: description.trim(),
            fileName: req.file.originalname,
            filePath: key,           // Store the S3 key
            fileSize: size,
            fileType: req.file.mimetype,
            uploadedBy: req.user._id, // Link to the logged-in user
            // isPublic defaults to false
            // status defaults to 'pending' (for moderation)
        });

        res.status(201).json({
            message: 'Dataset uploaded successfully',
            dataset: {
              id: dataset._id,
              title: dataset.title,
              description: dataset.description,
              fileName: dataset.fileName,
              fileSize: dataset.fileSize,
              status: dataset.status,
              createdAt: dataset.createdAt,
            },
        });
    } catch (error) {
        console.error('Error uploading dataset:', error);
      
        if (error.message && error.message.includes('File type not allowed')) {
            return res.status(400).json({ message: error.message });
        }
      
        res.status(500).json({ message: 'Error uploading dataset' });
    }
});

// ROUTE 5: Download a dataset
// GET /api/datasets/:id/download

router.get('/:id/download', isAuthenticated, isProfileComplete, async (req, res) => {
    try {
        const { id } = req.params;
        const dataset = await Dataset.findById(id);
        if (!dataset) {
            return res.status(404).json({ message: 'Dataset not found' });
        }
        if (!dataset.isPublic || dataset.status !== 'approved') {
            return res.status(403).json({ message: 'This dataset is not available' });
        }

        // Get a temporary URL that allows downloading from S3
        const downloadUrl = await getDownloadUrl(dataset.filePath);

        // Track how many times this dataset was downloaded
        await Dataset.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });
        res.json({
            downloadUrl: downloadUrl,
            fileName: dataset.fileName,
            expiresIn: 3600, // Let frontend know how long URL is valid
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid dataset ID' });
        }
        console.error('Error generating download URL:', error);
        res.status(500).json({ message: 'Error generating download link' });
    }
});

module.exports = router;