const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid'); // Fallback if needed, but we should look up real IDs

// Load env vars
dotenv.config({ path: 'd:/MEWS-Project/New-MEWS/MEWS/backend/.env' });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Define Schema subset for Member
const memberSchema = new mongoose.Schema({
    mewsId: String,
    headOfFamily: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    familyMembers: [{
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        relation: String,
        mewsId: String
    }]
}, { strict: false });

const Member = mongoose.model('Member', memberSchema);

const syncFamilyIds = async () => {
    await connectDB();

    try {
        // Find all Heads of Family who have family members
        const heads = await Member.find({
            headOfFamily: null,
            'familyMembers.0': { $exists: true }
        });

        console.log(`Found ${heads.length} Heads of Family.`);

        let updatedCount = 0;

        for (const head of heads) {
            let modified = false;

            // For each embedded family member
            for (const embeddedMem of head.familyMembers) {
                if (!embeddedMem.mewsId) {
                    // Find the actual dependent record
                    // We can match by _id usually, but sometimes _id in embedded might not match if it was generated differently?
                    // Ideally embeddedMem._id should exist and match the dependent's document _id.

                    let dependent = null;
                    if (embeddedMem._id) {
                        dependent = await Member.findById(embeddedMem._id);
                    }

                    // If not found by ID (legacy data issue?), try name + headOfFamily
                    if (!dependent) {
                        dependent = await Member.findOne({
                            headOfFamily: head._id,
                            name: embeddedMem.name,
                            relation: embeddedMem.relation
                        });
                    }

                    if (dependent && dependent.mewsId) {
                        console.log(`Syncing ID ${dependent.mewsId} for ${embeddedMem.name} in Head ${head.name}`);
                        embeddedMem.mewsId = dependent.mewsId;
                        modified = true;
                    } else if (dependent && !dependent.mewsId) {
                        console.log(`Dependent record found for ${embeddedMem.name} but it also has NO mewsId.`);
                        // Optional: Generate one? Or just skip.
                    } else {
                        console.log(`No dependent record found for embedded member ${embeddedMem.name}`);
                    }
                }
            }

            if (modified) {
                // Determine transaction necessity. Mongoose .save() is usually enough here.
                // We are updating the Head document.
                // We need to initialize the doc properly to save.
                // Since we are using strict: false schema, we can just save `head` if it's a Mongoose Doc.
                // But `head` is a Mongoose document from our specific schema definition above.
                // To be safe, use updateOne.

                await Member.updateOne(
                    { _id: head._id },
                    { $set: { familyMembers: head.familyMembers } }
                );
                updatedCount++;
            }
        }

        console.log(`Completed sync. Updated ${updatedCount} Head records.`);

    } catch (err) {
        console.error('Error syncing IDs:', err);
    } finally {
        process.exit();
    }
};

syncFamilyIds();
