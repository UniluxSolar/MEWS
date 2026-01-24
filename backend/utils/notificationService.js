const twilio = require('twilio');
const fs = require('fs');
const path = require('path');

// Initialize credentials from Environment or Fallback JSON
let accountSid = process.env.TWILIO_ACCOUNT_SID;
let authToken = process.env.TWILIO_AUTH_TOKEN;
let fromNumber = process.env.TWILIO_PHONE_NUMBER;
let whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Default Sandbox
let frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl) {
    if (process.env.NODE_ENV === 'production') {
        console.warn('[Notify] WARN: FRONTEND_URL is not set in production environment variables.');
        frontendUrl = 'https://mews-145033922870.us-central1.run.app'; // Known Production URL
    } else {
        frontendUrl = 'http://localhost:5173';
    }
}

// Remove trailing slash if present to avoid double slashes
if (frontendUrl.endsWith('/')) {
    frontendUrl = frontendUrl.slice(0, -1);
}

// Attempt to load from twilio-key.json if env vars missing (Backwards compatibility)
if (!accountSid || !authToken || !fromNumber) {
    const keyPath = path.join(__dirname, '../twilio-key.json');
    if (fs.existsSync(keyPath)) {
        try {
            const keyConfig = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
            if (!accountSid) accountSid = keyConfig.TWILIO_ACCOUNT_SID || keyConfig.accountSid;
            if (!authToken) authToken = keyConfig.TWILIO_AUTH_TOKEN || keyConfig.authToken;
            if (!fromNumber) fromNumber = keyConfig.TWILIO_PHONE_NUMBER || keyConfig.fromNumber;
            if (keyConfig.TWILIO_WHATSAPP_NUMBER) whatsappFrom = keyConfig.TWILIO_WHATSAPP_NUMBER;
        } catch (e) {
            console.error('[Notify] Failed to parse twilio-key.json', e);
        }
    }
}

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

if (client) {
    console.log('[Notify] Twilio SMS Service initialized successfully.');
} else {
    console.warn('[Notify] Twilio SMS Service NOT initialized. Missing credentials in env or twilio-key.json.');
}

/**
 * Sends a welcome notification via SMS and WhatsApp.
 * @param {Object} member - The member document.
 */
const sendRegistrationNotification = async (member) => {
    if (!client) {
        console.warn('[Notify] Twilio client not initialized - notifications skipped');
        return;
    }

    const { mewsId, mobileNumber, name, _id } = member;
    if (!mobileNumber) {
        console.warn(`[Notify] Member ${_id} has no mobile number. Skipping.`);
        return;
    }

    // Ensure E.164 format (+91 for India default)
    const formattedMobile = mobileNumber.startsWith('+') ? mobileNumber : `+91${mobileNumber}`;

    // Link to the user's profile documents via Login Redirect
    // Users must login first to access these protected routes
    // Link to the user's secure documents
    const appFormUrl = `${frontendUrl}/dashboard/member/application/${_id}`;
    const idCardUrl = `${frontendUrl}/dashboard/member/id-card/${_id}`;

    const messageBody = `Dear ${name} ${member.surname || ''} ,

Thank you for registering with MEWS, Your Member ID: ${mewsId} 

You can access your details using the links below:

1. Application Form : ${appFormUrl}
2. Digital ID Card : ${idCardUrl}

We appreciate your registration with MEWS and welcome you to the community.

– MEWS`;

    // 1. Send SMS
    try {
        const smsMsg = await client.messages.create({
            body: messageBody,
            from: fromNumber,
            to: formattedMobile
        });
        console.log(`[Notify] SMS sent to ${formattedMobile} (SID: ${smsMsg.sid})`);
    } catch (e) {
        console.error(`[Notify] SMS failed for ${formattedMobile}: ${e.message}`);
    }
};

/**
 * Sends a notification when a member is promoted to an Admin role.
 * @param {Object} member - The member document.
 * @param {Object} user - The user document (contains username/role).
 * @param {String} locationName - Name of the assigned location.
 */
const sendAdminPromotionNotification = async (member, user, locationName) => {
    if (!client) return;

    const { mobileNumber, name } = member;
    if (!mobileNumber) return;

    const formattedMobile = mobileNumber.startsWith('+') ? mobileNumber : `+91${mobileNumber}`;

    // Links
    const loginLink = `${frontendUrl}/login`;
    const idCardUrl = `${frontendUrl}/dashboard/member/id-card/${member._id}`;

    const roleName = user.role.replace('_', ' ');
    const locationStr = locationName ? ` for ${locationName}` : '';

    const messageBody = `Dear ${name} ,

Congratulations! You have been appointed as ${roleName}${locationStr}.

You can now login using your registered mobile number:
Login: ${loginLink}
ID Card: ${idCardUrl}

Welcome to the Admin Team!
– MEWS`;

    // Send SMS
    try {
        await client.messages.create({
            body: messageBody,
            from: fromNumber,
            to: formattedMobile
        });
        console.log(`[Notify] Admin Promo SMS sent to ${formattedMobile}`);
    } catch (e) {
        console.error(`[Notify] Admin Promo SMS failed: ${e.message}`);
    }
};

module.exports = { sendRegistrationNotification, sendAdminPromotionNotification };
