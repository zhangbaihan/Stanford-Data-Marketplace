/**
 * Seed Script: Upload initial datasets to S3 and MongoDB
 * 
 * This script:
 * 1. Creates/finds a system user for seed data
 * 2. Reads data files from server/data/seed/
 * 3. Uploads them to S3
 * 4. Creates Dataset entries in MongoDB (approved & public)
 * 
 * Usage: node scripts/seedDatasets.js
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Dataset = require('../models/Dataset');
const User = require('../models/User');
const { uploadFile } = require('../services/s3service');

// Define metadata for each seed file
const seedDatasets = [
    {
        fileName: 'coterm.csv',
        title: 'Stanford Coterminal Program Completions',
        description: 'Data on Stanford coterminal (coterm) program completions from 2014 onwards. Shows the number of students who completed combined undergraduate and master\'s degree programs, broken down by undergraduate major, master\'s program, and academic year.',
        fileType: 'text/csv',
    },
    {
        fileName: 'course.json',
        title: 'Stanford Course Catalog 2022-2023',
        description: 'Comprehensive Stanford University course catalog data for the 2022-2023 academic year. Includes course codes, titles, units, grading basis, GER requirements, and academic organization information. Data is in line-delimited JSON format.',
        fileType: 'application/json',
    },
    {
        fileName: 'grade.csv',
        title: 'Stanford Course Grade Distributions',
        description: 'Grade distribution data for Stanford courses. Shows the breakdown of grades (A+ through F, CR, NC) for various courses across departments. Useful for understanding grading patterns and course difficulty.',
        fileType: 'text/csv',
    },
    {
        fileName: 'olympic.csv',
        title: 'US Olympic Athletes Profiles',
        description: 'Profiles of US Olympic athletes including biographical information, career highlights, Olympic experience, medal counts, and sports. Contains data on athletes from various Olympic sports with detailed career statistics.',
        fileType: 'text/csv',
    },
    {
        fileName: 'plastic.csv',
        title: 'Chemical Content in Consumer Products',
        description: 'Analysis of chemical content (particularly DEHP and other chemicals) in various consumer products including food items, beverages, and packaged goods. Data includes product names and chemical concentration measurements.',
        fileType: 'text/csv',
    },
    {
        fileName: 'theft.json',
        title: 'Theft Statistics Data',
        description: 'Comprehensive theft and crime statistics dataset. Contains detailed records of theft incidents with various attributes for analysis and research purposes.',
        fileType: 'application/json',
    },
    {
        fileName: 'faculty_sex_stanford.csv',
        title: 'Stanford Faculty Gender Distribution',
        description: 'Faculty gender distribution data across Stanford University schools and departments from 2010-2020. Tracks the number of male and female faculty members by academic unit over a 10-year period.',
        fileType: 'text/csv',
    },
    {
        fileName: 'international_students_peer_institutions_10_20.csv',
        title: 'International Students at Peer Institutions',
        description: 'International student enrollment data comparing Stanford with peer institutions from 2010-2020. Includes total undergraduate enrollment, non-resident counts, and percentage breakdowns by institution and year.',
        fileType: 'text/csv',
    },
];

// System user credentials (won't conflict with real Google OAuth users)
const SYSTEM_USER = {
    googleId: 'system-seed-user-stanford-data-marketplace',
    email: 'system@stanford-data-marketplace.internal',
    username: 'Stanford Data',
    isProfileComplete: true,
};

async function getOrCreateSystemUser() {
    let user = await User.findOne({ googleId: SYSTEM_USER.googleId });
    
    if (!user) {
        user = await User.create(SYSTEM_USER);
        console.log('Created system user for seed data');
    } else {
        console.log('Found existing system user');
    }
    
    return user;
}

async function seedDataset(seedData, userId, seedDir) {
    const filePath = path.join(seedDir, seedData.fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${seedData.fileName}`);
        return null;
    }
    
    // Check if dataset already exists (by title)
    const existingDataset = await Dataset.findOne({ title: seedData.title });
    if (existingDataset) {
        console.log(`Dataset already exists: ${seedData.title}`);
        return existingDataset;
    }
    
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fs.statSync(filePath).size;
    
    console.log(`  Uploading ${seedData.fileName} (${(fileSize / 1024).toFixed(2)} KB)...`);
    
    // Upload to S3
    const { key } = await uploadFile(fileBuffer, seedData.fileName, seedData.fileType);
    
    // Create dataset in MongoDB
    const dataset = await Dataset.create({
        title: seedData.title,
        description: seedData.description,
        fileName: seedData.fileName,
        filePath: key,
        fileSize: fileSize,
        fileType: seedData.fileType,
        uploadedBy: userId,
        isPublic: true,
        status: 'approved',
    });
    
    console.log(`✓ Seeded: ${seedData.title}`);
    return dataset;
}

async function main() {
    console.log('\n========================================');
    console.log('Stanford Data Marketplace - Seed Script');
    console.log('========================================\n');
    
    try {
        // Connect to database
        await connectDB();
        
        // Get or create system user
        const systemUser = await getOrCreateSystemUser();
        
        // Seed directory path
        const seedDir = path.join(__dirname, '..', 'data', 'seed');
        
        if (!fs.existsSync(seedDir)) {
            console.error(`✗ Seed directory not found: ${seedDir}`);
            process.exit(1);
        }
        
        console.log(`\nSeeding datasets from: ${seedDir}\n`);
        
        // Seed each dataset
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        
        for (const seedData of seedDatasets) {
            try {
                const result = await seedDataset(seedData, systemUser._id, seedDir);
                if (result) {
                    if (result.createdAt && (new Date() - result.createdAt) < 5000) {
                        successCount++;
                    } else {
                        skipCount++;
                    }
                } else {
                    errorCount++;
                }
            } catch (error) {
                console.error(`✗ Error seeding ${seedData.fileName}:`, error.message);
                errorCount++;
            }
        }
        
        console.log('\n========================================');
        console.log('Seed Summary');
        console.log('========================================');
        console.log(`✓ New datasets seeded: ${successCount}`);
        console.log(`○ Datasets skipped (already exist): ${skipCount}`);
        console.log(`✗ Errors: ${errorCount}`);
        console.log('========================================\n');
        
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
}

main();
