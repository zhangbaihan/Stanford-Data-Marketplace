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

// Define metadata for each seed file with rich metadata
const seedDatasets = [
    {
        fileName: 'coterm.csv',
        title: 'Stanford Coterminal Program Completions',
        description: 'Data on Stanford coterminal (coterm) program completions from 2014 onwards. Shows the number of students who completed combined undergraduate and master\'s degree programs, broken down by undergraduate major, master\'s program, and academic year.',
        abstract: 'Comprehensive data on Stanford\'s coterminal program completions, enabling analysis of dual-degree pathways across departments.',
        fileType: 'text/csv',
        tags: ['stanford', 'education', 'graduate programs', 'enrollment'],
        tableCount: 1,
        fileCount: 1,
        provenance: {
            creator: 'Stanford University Office of the Registrar',
            contributors: [
                { name: 'Stanford Institutional Research', role: 'Data provider' },
            ],
        },
        methodology: 'Data is compiled annually from official graduation records maintained by the Stanford Registrar. Coterm completions are tracked when a student receives both their undergraduate and graduate degrees within the allowable timeframe.',
        usageNotes: 'Academic year refers to the year of graduation. Some programs may have been renamed or restructured over the time period covered.',
    },
    {
        fileName: 'course.json',
        title: 'Stanford Course Catalog 2022-2023',
        description: 'Comprehensive Stanford University course catalog data for the 2022-2023 academic year. Includes course codes, titles, units, grading basis, GER requirements, and academic organization information.',
        abstract: 'Complete course listing for Stanford University\'s 2022-2023 academic year with detailed course attributes.',
        fileType: 'application/json',
        tags: ['stanford', 'courses', 'curriculum', 'education'],
        tableCount: 1,
        fileCount: 1,
        provenance: {
            creator: 'Stanford University Office of the Registrar',
        },
        methodology: 'Course data is extracted from the official Stanford course catalog system. Data is in line-delimited JSON format for efficient processing of large datasets.',
        usageNotes: 'Course availability may vary by quarter. Some courses may have prerequisites not reflected in this dataset.',
    },
    {
        fileName: 'grade.csv',
        title: 'Stanford Course Grade Distributions',
        description: 'Grade distribution data for Stanford courses. Shows the breakdown of grades (A+ through F, CR, NC) for various courses across departments.',
        abstract: 'Anonymized grade distribution statistics across Stanford courses, useful for understanding grading patterns.',
        fileType: 'text/csv',
        tags: ['stanford', 'grades', 'academics', 'education'],
        tableCount: 1,
        fileCount: 1,
        provenance: {
            creator: 'Stanford University Office of the Registrar',
            contributors: [
                { name: 'Stanford Data Lab', role: 'Data curator' },
            ],
        },
        methodology: 'Grade distributions are aggregated from official academic records. Individual student information is not included to protect privacy. Courses with fewer than 10 enrolled students may be excluded.',
        usageNotes: 'Grade distributions may vary significantly based on the instructor, quarter offered, and student population. Use caution when drawing conclusions about course difficulty.',
    },
    {
        fileName: 'olympic.csv',
        title: 'US Olympic Athletes Profiles',
        description: 'Profiles of US Olympic athletes including biographical information, career highlights, Olympic experience, medal counts, and sports.',
        abstract: 'Biographical and performance data on US Olympic athletes across multiple Olympic games.',
        fileType: 'text/csv',
        tags: ['sports', 'olympics', 'athletes', 'united states'],
        tableCount: 1,
        fileCount: 1,
        provenance: {
            creator: 'US Olympic & Paralympic Committee',
        },
        methodology: 'Data is compiled from official Olympic records and athlete profiles. Medal counts reflect verified Olympic results.',
        usageNotes: 'Some historical data may be incomplete. Athlete information is current as of the last Olympic games included in the dataset.',
    },
    {
        fileName: 'plastic.csv',
        title: 'Chemical Content in Consumer Products',
        description: 'Analysis of chemical content (particularly DEHP and other chemicals) in various consumer products including food items, beverages, and packaged goods.',
        abstract: 'Chemical analysis data for consumer products, focusing on plasticizers and other compounds of health concern.',
        fileType: 'text/csv',
        tags: ['chemistry', 'consumer products', 'health', 'environmental'],
        tableCount: 1,
        fileCount: 1,
        provenance: {
            creator: 'Environmental Health Research Lab',
        },
        methodology: 'Products were tested using gas chromatography-mass spectrometry (GC-MS) to identify and quantify chemical compounds. Samples were collected from retail locations.',
        usageNotes: 'Chemical concentrations are measured in parts per million (ppm). Detection limits vary by compound.',
    },
    {
        fileName: 'theft.json',
        title: 'Theft Statistics Data',
        description: 'Comprehensive theft and crime statistics dataset. Contains detailed records of theft incidents with various attributes for analysis and research purposes.',
        abstract: 'Detailed theft incident records for crime analysis and research.',
        fileType: 'application/json',
        tags: ['crime', 'statistics', 'public safety', 'theft'],
        tableCount: 1,
        fileCount: 1,
        provenance: {
            creator: 'Public Safety Research Institute',
        },
        methodology: 'Data is compiled from publicly available crime reports. Incident records are geocoded and categorized by type of theft.',
        usageNotes: 'Location data may be approximate to protect victim privacy. Not all incidents may be reported.',
    },
    {
        fileName: 'faculty_sex_stanford.csv',
        title: 'Stanford Faculty Gender Distribution',
        description: 'Faculty gender distribution data across Stanford University schools and departments from 2010-2020. Tracks the number of male and female faculty members by academic unit over a 10-year period.',
        abstract: 'Longitudinal data on faculty gender composition at Stanford University by school and department.',
        fileType: 'text/csv',
        tags: ['stanford', 'faculty', 'gender', 'diversity', 'higher education'],
        tableCount: 1,
        fileCount: 1,
        provenance: {
            creator: 'Stanford University Office of Institutional Research',
            contributors: [
                { name: 'Stanford Diversity Office', role: 'Data contributor' },
            ],
        },
        methodology: 'Faculty counts are based on official HR records as of fall quarter each year. Includes tenure-track and tenured faculty. Gender classification is based on self-reported data.',
        usageNotes: 'Some departments may have been reorganized during the time period. Small departments may show larger percentage variations due to small sample sizes.',
    },
    {
        fileName: 'international_students_peer_institutions_10_20.csv',
        title: 'International Students at Peer Institutions',
        description: 'International student enrollment data comparing Stanford with peer institutions from 2010-2020. Includes total undergraduate enrollment, non-resident counts, and percentage breakdowns by institution and year.',
        abstract: 'Comparative analysis of international student enrollment trends at top US universities.',
        fileType: 'text/csv',
        tags: ['stanford', 'international students', 'higher education', 'enrollment', 'peer institutions'],
        tableCount: 1,
        fileCount: 1,
        provenance: {
            creator: 'Stanford University Office of Institutional Research',
            contributors: [
                { name: 'Institute of International Education', role: 'Data source' },
            ],
        },
        methodology: 'Data is compiled from IPEDS (Integrated Postsecondary Education Data System) reports and institutional fact sheets. International students are defined as those on non-immigrant visas.',
        usageNotes: 'Peer institutions include Ivy League schools and other selective private research universities. COVID-19 may have affected 2020 enrollment numbers.',
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
    
    // Create dataset in MongoDB with rich metadata
    const dataset = await Dataset.create({
        title: seedData.title,
        description: seedData.description,
        abstract: seedData.abstract,
        fileName: seedData.fileName,
        filePath: key,
        fileSize: fileSize,
        fileType: seedData.fileType,
        uploadedBy: userId,
        isPublic: true,
        status: 'approved',
        // Rich metadata
        tags: seedData.tags || [],
        tableCount: seedData.tableCount || 0,
        fileCount: seedData.fileCount || 1,
        provenance: seedData.provenance,
        methodology: seedData.methodology,
        usageNotes: seedData.usageNotes,
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
