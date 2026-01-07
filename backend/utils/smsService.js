const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const sendSms = async (to, body) => {
    try {
        if (!accountSid || !authToken || !fromNumber) {
            const missing = [];
            if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
            if (!authToken) missing.push('TWILIO_AUTH_TOKEN');
            if (!fromNumber) missing.push('TWILIO_PHONE_NUMBER');

            console.warn(`[Twilio] Credentials missing in .env (${missing.join(', ')}). SMS not sent.`);
            return { success: false, error: `Missing config: ${missing.join(', ')}` };
        }

        const client = twilio(accountSid, authToken);

        const message = await client.messages.create({
            body: body,
            from: fromNumber,
            to: to // Ensure 'to' includes country code (e.g., +91)
        });

        console.log(`[Twilio] SMS sent. SID: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error(`[Twilio] Error sending SMS: ${error.message}`);
        return { success: false, error: error.message };
    }
};

module.exports = { sendSms };
