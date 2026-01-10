const twilio = require('twilio');
const fs = require('fs');
const path = require('path');

let accountSid = process.env.TWILIO_ACCOUNT_SID;
let authToken = process.env.TWILIO_AUTH_TOKEN;
let fromNumber = process.env.TWILIO_PHONE_NUMBER;

// Auto-detect credential file if env vars are missing
if (!accountSid || !authToken || !fromNumber) {
    const keyPath = path.join(__dirname, '../twilio-key.json');
    if (fs.existsSync(keyPath)) {
        try {
            const keyConfig = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
            if (!accountSid) accountSid = keyConfig.TWILIO_ACCOUNT_SID || keyConfig.accountSid;
            if (!authToken) authToken = keyConfig.TWILIO_AUTH_TOKEN || keyConfig.authToken;
            if (!fromNumber) fromNumber = keyConfig.TWILIO_PHONE_NUMBER || keyConfig.fromNumber;
            console.log('[Twilio] Loaded credentials from twilio-key.json');
        } catch (e) {
            console.error('[Twilio] Failed to parse twilio-key.json', e);
        }
    }
}

const sendSms = async (to, body) => {
    try {
        if (!accountSid || !authToken || !fromNumber) {
            const missing = [];
            if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
            if (!authToken) missing.push('TWILIO_AUTH_TOKEN');
            if (!fromNumber) missing.push('TWILIO_PHONE_NUMBER');

            console.warn(`[Twilio] Credentials missing in .env(${missing.join(', ')}).SMS not sent.`);
            return { success: false, error: `Missing config: ${missing.join(', ')} ` };
        }

        const client = twilio(accountSid, authToken);

        const message = await client.messages.create({
            body: body,
            from: fromNumber,
            to: to // Ensure 'to' includes country code (e.g., +91)
        });

        console.log(`[Twilio] SMS sent.SID: ${message.sid} `);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error(`[Twilio] Error sending SMS: ${error.message} `);
        return { success: false, error: error.message };
    }
};

module.exports = { sendSms };
