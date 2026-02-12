require('dotenv').config();
const { sendEmail } = require('./utils/emailService');

const testEmail = async () => {
    try {
        console.log('--- Testing Email Configuration ---');
        console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
        console.log(`Email From: ${process.env.EMAIL_FROM}`);

        const testRecipient = 'test-recipient@example.com'; // Change this to a real email to test actual delivery if needed
        const result = await sendEmail(
            testRecipient,
            'MEWS System Test Email',
            'This is a test email from the MEWS notification system setup.',
            '<h1>MEWS System Test</h1><p>This is a test email from the <b>MEWS notification system</b> setup.</p>'
        );

        console.log('Test result:', result);
        console.log('--- Test Completed ---');
    } catch (error) {
        console.error('Test failed:', error);
    }
};

testEmail();
