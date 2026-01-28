const express = require('express');
const router = express.Router();
const Dataset = require('../models/Dataset');

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

module.exports = router;