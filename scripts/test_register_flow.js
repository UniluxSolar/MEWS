const path = require('path');
// Add backend node_modules to search path for dependencies (mongoose, twilio, etc.)
module.paths.push(path.join(__dirname, '../backend/node_modules'));

require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const mongoose = require('mongoose');

const Member = require('../backend/models/Member');
const Location = require('../backend/models/Location'); // Ensure this path is correct
const { registerMember } = require('../backend/controllers/memberController');

// MITS: Mock Request/Response
const mockReq = {
    user: {
        _id: 'TEST_ADMIN_USER',
        username: 'test_admin',
        role: 'SUPER_ADMIN' // Use Super Admin to bypass location restrictions in controller if any (though register usually doesn't Check role for creation, only get)
    },
    body: {},
    files: {}
};

const mockRes = {
    statusCode: 200,
    status: function (code) { this.statusCode = code; return this; },
    json: function (data) { console.log('RESPONSE JSON:', JSON.stringify(data, null, 2)); },
    send: function (data) { console.log('RESPONSE SEND:', data); }
};

const runTest = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // 1. Get a valid Village Location
        const village = await Location.findOne({ type: 'VILLAGE' });
        if (!village) {
            console.error('No VILLAGE found in DB. Cannot test location resolution.');
            // Create dummy if needed? For now, abort or use dummy ID if valid in standalone.
            // process.exit(1); 
            // Using random ID might fail resolveLocation if it checks DB.
            // But my code: if isValid(val) return val; -> Then it checks DB only if fail?
            // No: if isValid(val) return val; -> It returns ID immediately.
            // Line 571 in registerMember: if (mongoose.Types.ObjectId.isValid(val)) return val;
            // So I can use a fake ID.
        }
        const villageId = village ? village._id.toString() : new mongoose.Types.ObjectId().toString();
        console.log('Using Village ID:', villageId);

        const uniqueAadhaar = `99${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        console.log('Using Aadhaar:', uniqueAadhaar);

        // 2. Prepare Data
        mockReq.body = {
            name: 'Debug',
            surname: 'FallbackTest',
            fatherName: 'Test Father',
            dob: '1990-01-01',
            age: 34,
            gender: 'Male',
            maritalStatus: 'Unmarried',
            mobileNumber: '9998887776',
            aadhaarNumber: uniqueAadhaar,
            address: {
                village: villageId, // Send ID
                houseNumber: '1-1',
                street: 'Test Street',
                pinCode: '500001'
            },
            // Legacy fields that might be required if address obj not parsed?
            // Controller parses address string if needed, or uses body.address object.
            // It also checks flat fields.
            presentVillage: villageId,

            // Family Members (Optional)
            familyMembers: JSON.stringify([])
        };

        console.log('Calling registerMember...');

        // We need to handle the fact that registerMember is wrapped in asyncHandler?
        // asyncHandler usually just catches errors.
        // If exported directly as const registerMember = asyncHandler(...), calling it works if signature matches (req, res, next).
        // I need a next function.
        const next = (err) => { console.error('NEXT CALLED WITH ERROR:', err); };

        await registerMember(mockReq, mockRes, next);

        console.log('Controller Execution Finished.');

        // 3. Verify Persistence
        console.log('Verifying in DB...');
        const savedMember = await Member.findOne({ aadhaarNumber: uniqueAadhaar });
        if (savedMember) {
            console.log('SUCCESS: Member found in DB!');
            console.log('ID:', savedMember._id);
            console.log('MewsID:', savedMember.mewsId);
            console.log('Status:', savedMember.verificationStatus);

            // Cleanup
            await Member.deleteOne({ _id: savedMember._id });
            console.log('Cleanup: Test member deleted.');
        } else {
            console.error('FAILURE: Member NOT found in DB.');
        }

    } catch (e) {
        console.error('TEST EXT FAILED:', e);
    } finally {
        await mongoose.disconnect();
    }
};

runTest();
