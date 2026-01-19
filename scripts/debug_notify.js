const path = require('path');
// Manually load dotenv just like server.js
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
// const mongoose = require('mongoose'); // Removed to avoid dependency issues in root
const { sendRegistrationNotification } = require('../backend/utils/notificationService');

const debugNotification = async () => {
    console.log('--- Debug Notification ---');
    console.log('ENV: TWILIO_ACCOUNT_SID', process.env.TWILIO_ACCOUNT_SID ? 'OK' : 'MISSING');
    console.log('ENV: TWILIO_AUTH_TOKEN', process.env.TWILIO_AUTH_TOKEN ? 'OK' : 'MISSING');
    console.log('ENV: TWILIO_PHONE_NUMBER', process.env.TWILIO_PHONE_NUMBER ? 'OK' : 'MISSING');
    console.log('ENV: FRONTEND_URL', process.env.FRONTEND_URL);

    const testMobile = process.argv[2];
    if (!testMobile) {
        console.error('Please provide a mobile number: node scripts/debug_notify.js <mobile>');
        process.exit(1);
    }

    // Mock member object
    const mockMember = {
        _id: 'DEBUG_MEMBER_ID',
        mewsId: 'MEWS-DEBUG-123456',
        name: 'Debug User',
        surname: 'Tester',
        mobileNumber: testMobile
    };

    console.log(`Sending test notification to ${testMobile}...`);
    try {
        await sendRegistrationNotification(mockMember);
        console.log('Function call completed. Check console for specific SID logs.');
    } catch (e) {
        console.error('FAILED:', e);
    }
};

debugNotification();
