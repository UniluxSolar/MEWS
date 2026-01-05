const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const sendSms = async (to, body) => {
    try {
        if (!accountSid || !authToken || !fromNumber) {
            console.warn('[Twilio] Credentials missing in .env. SMS not sent.');
            return false;
        }

        const client = twilio(accountSid, authToken);

        const message = await client.messages.create({
            body: body,
            from: fromNumber,
            to: to // Ensure 'to' includes country code (e.g., +91)
        });

        console.log(`[Twilio] SMS sent. SID: ${message.sid}`);
        return true;
    } catch (error) {
        console.error(`[Twilio] Error sending SMS: ${error.message}`);
        return false;
    }
};

module.exports = { sendSms };
