const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const { sendSms } = require('../backend/utils/smsService');

const testTwilio = async () => {
    console.log('--- Twilio Configuration Test ---');
    console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Missing');
    console.log('Auth Token:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Missing');
    console.log('From Number:', process.env.TWILIO_PHONE_NUMBER);

    const testNumber = process.argv[2];
    if (!testNumber) {
        console.error('\nPlease provide a mobile number to test: node scripts/test_twilio.js <mobile_number>');
        process.exit(1);
    }

    console.log(`\nAttempting to send SMS to: ${testNumber}`);

    // Ensure +91 if missing
    let formattedMobile = testNumber;
    if (!formattedMobile.startsWith('+')) {
        formattedMobile = `+91${formattedMobile}`;
    }

    const result = await sendSms(formattedMobile, 'MEWS Twilio Test Message');

    if (result.success) {
        console.log('\nSUCCESS: SMS sent successfully!');
        console.log('SID:', result.sid);
    } else {
        console.log('\nFAILURE: Failed to send SMS.');
        console.log('Error Message:', result.error);
    }
};

testTwilio();
