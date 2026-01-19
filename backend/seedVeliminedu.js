const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');
const Institution = require('./models/Institution');

dotenv.config();

const seedVeliminedu = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB Connected...');

        const randomPhone = () => '9' + Math.floor(100000000 + Math.random() * 900000000);
        const randomAadhaar = () => Math.floor(100000000000 + Math.random() * 900000000000).toString();

        // 0. Clear existing Veliminedu members to avoid duplicates and ensure updates
        await Member.deleteMany({ 'address.village': 'Veliminedu' });
        console.log('Cleared existing Veliminedu members.');

        // 1. Create 3 Members for Veliminedu with NEW Photos
        const members = [
            {
                surname: 'Goud',
                name: 'Ramesh',
                mobileNumber: randomPhone(),
                age: 45,
                gender: 'Male',
                bloodGroup: 'O+',
                address: {
                    village: 'Veliminedu',
                    mandal: 'Chityala',
                    district: 'Nalgonda'
                },
                familyDetails: { memberCount: 4 },
                photoUrl: 'https://randomuser.me/api/portraits/men/11.jpg',
                mewsId: `MEW${Date.now()}1`,
                aadhaarNumber: randomAadhaar()
            },
            {
                surname: 'Reddy',
                name: 'Suresh',
                mobileNumber: randomPhone(),
                age: 32,
                gender: 'Male',
                bloodGroup: 'A+',
                address: {
                    village: 'Veliminedu',
                    mandal: 'Chityala',
                    district: 'Nalgonda'
                },
                familyDetails: { memberCount: 3 },
                photoUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
                mewsId: `MEW${Date.now()}2`,
                aadhaarNumber: randomAadhaar()
            },
            {
                surname: 'Lakshmi',
                name: 'K.',
                mobileNumber: randomPhone(),
                age: 28,
                gender: 'Female',
                bloodGroup: 'B+',
                address: {
                    village: 'Veliminedu',
                    mandal: 'Chityala',
                    district: 'Nalgonda'
                },
                familyDetails: { memberCount: 5 },
                photoUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
                mewsId: `MEW${Date.now()}3`,
                aadhaarNumber: randomAadhaar()
            }
        ];

        await Member.insertMany(members);
        console.log('3 Members created for Veliminedu.');

        // 2. Create 2 Institutions for Veliminedu
        const institutions = [
            {
                type: 'School',
                name: 'Veliminedu High School',
                ownerName: 'Govt Body',
                mobileNumber: '040-12345678',
                fullAddress: 'Main Road, Veliminedu, Chityala Mandal',
                servicesOffered: ['Education', 'Sports'],
                institutionPhotos: ['https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200'],
                verificationStatus: 'APPROVED'
            },
            {
                type: 'Hospital',
                name: 'Community Health Center',
                ownerName: 'Dr. Rao',
                mobileNumber: '040-87654321',
                fullAddress: 'Near Bus Stand, Veliminedu',
                servicesOffered: ['General Checkup', 'Emergency'],
                institutionPhotos: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200'],
                verificationStatus: 'APPROVED'
            }
        ];

        await Institution.insertMany(institutions);
        console.log('2 Institutions created for Veliminedu.');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedVeliminedu();
