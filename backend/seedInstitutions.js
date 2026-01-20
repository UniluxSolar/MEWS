const mongoose = require('mongoose');
const Institution = require('./models/Institution');
require('dotenv').config();

const institutions = [
    {
        type: 'school',
        name: 'ZPHS Gundlapally',
        ownerName: 'Government',
        mobileNumber: '9876543210',
        whatsappNumber: '9876543210',
        fullAddress: 'Main Road, Gundlapally, Nalgonda',
        mewsDiscountPercentage: 'N/A',
        servicesOffered: ['Primary Education', 'High School'],
        verificationStatus: 'APPROVED',
        institutionPhotos: []
    },
    {
        type: 'hospital',
        name: 'Community Health Center',
        ownerName: 'Govt of Telangana',
        mobileNumber: '9876543211',
        whatsappNumber: '9876543211',
        fullAddress: 'Near Bus Stand, Gundlapally',
        mewsDiscountPercentage: 'Free',
        servicesOffered: ['General Checkup', 'Vaccination'],
        verificationStatus: 'APPROVED'
    },
    {
        type: 'college',
        name: 'Nalgonda Degree College',
        ownerName: 'Private Management',
        mobileNumber: '9876543212',
        whatsappNumber: '9876543212',
        fullAddress: 'Clock Tower Center, Nalgonda', // Different location
        mewsDiscountPercentage: '10%',
        servicesOffered: ['B.Sc', 'B.Com', 'B.A'],
        verificationStatus: 'APPROVED'
    }
];

const seedInstitutions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // Check if ZPHS Gundlapally already exists to prevent duplicates
        const exists = await Institution.findOne({ name: 'ZPHS Gundlapally' });
        if (exists) {
            console.log("Gundlapally institutions already exist. Skipping.");
        } else {
            await Institution.insertMany(institutions);
            console.log("Seeded Gundlapally institutions!");
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedInstitutions();
