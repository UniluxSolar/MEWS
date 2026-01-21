const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sendSms } = require('../utils/smsService');

async function testSms() {
    console.log("Testing SMS Configuration...");

    // Use a non-existent number to test Auth but avoid spamming real people
    // +15005550006 is a Twilio 'magic' number that passes validation but is not real
    // OR we can use a deliberately invalid one to checking for 'Authentication Error' vs 'Invalid Number'.
    // However, the best way to test CONFIG is to use the credentials.

    const testNumber = '+919999999999'; // Dummy

    console.log(`Attempting to send SMS to ${testNumber}...`);
    const result = await sendSms(testNumber, "This is a test message from MEWS System.");

    console.log("Result:", result);

    if (result.success) {
        console.log("SUCCESS: SMS Service is configured and accepted the request.");
    } else {
        console.log("FAILURE: SMS Service failed.");
        if (result.error && result.error.includes('Authenticate')) {
            console.error("DIAGNOSIS: Authentication Failed. Check SID and Token.");
        } else if (result.error && result.error.includes('Missing config')) {
            console.error("DIAGNOSIS: Missing Configuration.");
        } else {
            console.log("DIAGNOSIS: Likely configured correctly but failed to send (maybe invalid number or trial account restriction). This is expected for a dummy number test.");
        }
    }
}

testSms();
