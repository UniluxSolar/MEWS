const mongoose = require('mongoose');
const Member = require('../models/Member');

const MONGO_URI = 'mongodb+srv://uniluxsolar_db_user:r8wjvZ5WSpLgqUe9@cluster0.xkaqz3k.mongodb.net/mews?appName=Cluster0';
const GCS_BASE_URL = 'https://storage.googleapis.com/mews-uploads/';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

const replaceUrl = (oldUrl) => {
    if (!oldUrl) return oldUrl;
    if (typeof oldUrl !== 'string') return oldUrl;

    // Check if it's already a GCS URL
    if (oldUrl.includes('storage.googleapis.com')) return oldUrl;

    // Check if it contains 'uploads/'
    if (oldUrl.includes('uploads/')) {
        // Extract filename: split by 'uploads/' and take the last part
        const parts = oldUrl.split('uploads/');
        const filename = parts[parts.length - 1];

        // Return new URL
        return `${GCS_BASE_URL}${filename}`;
    }

    return oldUrl;
};

const migrate = async () => {
    await connectDB();
    const members = await Member.find({});
    console.log(`Found ${members.length} members. Starting migration...`);

    let updatedCount = 0;

    for (const member of members) {
        let isModified = false;

        // 1. Top Level Fields
        const fields = [
            'photoUrl', 'aadhaarCardUrl',
            // In case ad-hoc fields exist, let's check widely used ones 
            'aadhaarFront', 'aadhaarBack', // Just in case, based on earlier hunch
            'aadhaarUrl' // another logical guess
        ];

        fields.forEach(field => {
            if (member[field] && member[field].includes('uploads/')) {
                const newUrl = replaceUrl(member[field]);
                if (newUrl !== member[field]) {
                    console.log(`[Member ${member._id}] Updating ${field}: ${member[field]} -> ${newUrl}`);
                    member[field] = newUrl;
                    isModified = true;
                }
            }
        });

        // 2. Nested Objects
        if (member.casteDetails?.certificateUrl) {
            const newUrl = replaceUrl(member.casteDetails.certificateUrl);
            if (newUrl !== member.casteDetails.certificateUrl) {
                console.log(`[Member ${member._id}] Updating casteDetails.certificateUrl`);
                member.casteDetails.certificateUrl = newUrl;
                isModified = true;
            }
        }

        if (member.partnerDetails?.certificateUrl) {
            const newUrl = replaceUrl(member.partnerDetails.certificateUrl);
            if (newUrl !== member.partnerDetails.certificateUrl) {
                console.log(`[Member ${member._id}] Updating partnerDetails.certificateUrl`);
                member.partnerDetails.certificateUrl = newUrl;
                isModified = true;
            }
        }

        if (member.rationCard?.fileUrl) {
            const newUrl = replaceUrl(member.rationCard.fileUrl);
            if (newUrl !== member.rationCard.fileUrl) {
                console.log(`[Member ${member._id}] Updating rationCard.fileUrl`);
                member.rationCard.fileUrl = newUrl;
                isModified = true;
            }
        }

        if (member.voterId?.fileUrl) {
            const newUrl = replaceUrl(member.voterId.fileUrl);
            if (newUrl !== member.voterId.fileUrl) {
                console.log(`[Member ${member._id}] Updating voterId.fileUrl`);
                member.voterId.fileUrl = newUrl;
                isModified = true;
            }
        }

        if (member.bankDetails?.passbookUrl) {
            const newUrl = replaceUrl(member.bankDetails.passbookUrl);
            if (newUrl !== member.bankDetails.passbookUrl) {
                console.log(`[Member ${member._id}] Updating bankDetails.passbookUrl`);
                member.bankDetails.passbookUrl = newUrl;
                isModified = true;
            }
        }

        // 3. Family Members Array
        if (member.familyMembers && member.familyMembers.length > 0) {
            member.familyMembers.forEach((fam, index) => {
                const famFields = ['photo', 'aadhaarFront', 'aadhaarBack', 'voterIdFront', 'voterIdBack'];
                famFields.forEach(f => {
                    if (fam[f] && fam[f].includes('uploads/')) {
                        const newUrl = replaceUrl(fam[f]);
                        if (newUrl !== fam[f]) {
                            console.log(`[Member ${member._id}][Family ${index}] Updating ${f}`);
                            fam[f] = newUrl;
                            isModified = true;
                        }
                    }
                });
            });
        }

        if (isModified) {
            await member.save();
            updatedCount++;
        }
    }

    console.log(`Migration Completed. Updated ${updatedCount} documents.`);
    process.exit();
};

migrate();
