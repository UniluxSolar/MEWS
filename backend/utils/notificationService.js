const fs = require('fs');
const path = require('path');

// Initialize credentials from Environment
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

const { sendEmail } = require('./emailService');

/**
 * Sends a welcome notification via Email.
 * @param {Object} member - The member document.
 */
const sendRegistrationNotification = async (member) => {
    const { mewsId, name, email, _id, surname } = member;

    // Link to the user's profile documents via Login Redirect
    const appFormUrl = `${frontendUrl}/dashboard/member/application/${_id}`;
    const idCardUrl = `${frontendUrl}/dashboard/member/id-card/${_id}`;

    const messageBody = `Dear ${name} ${surname || ''},

Thank you for registering with MEWS, Your Member ID: ${mewsId} 

You can access your details using the links below:

1. Application Form : ${appFormUrl}
2. Digital ID Card : ${idCardUrl}

We appreciate your registration with MEWS and welcome you to the community.

– MEWS`;

    // Send Email
    if (email) {
        try {
            await sendEmail(
                email,
                'Welcome to MEWS - Registration Successful',
                messageBody,
                `<h3>Welcome to MEWS, ${name}!</h3>
                <p>Thank you for registering. Your Member ID is <strong>${mewsId}</strong>.</p>
                <p>You can access your documents here:</p>
                <ul>
                    <li><a href="${appFormUrl}">Application Form</a></li>
                    <li><a href="${idCardUrl}">Digital ID Card</a></li>
                </ul>
                <p>Regards,<br/>MEWS Team</p>`
            );
            console.log(`[Notify] Welcome email sent to ${email}`);
        } catch (e) {
            console.error(`[Notify] Welcome email failed for ${email}: ${e.message}`);
        }
    } else {
        console.warn(`[Notify] Skip registration email for ${name} (no email provided)`);
    }
};

/**
 * Sends a notification when a member is promoted to an Admin role.
 * @param {Object} member - The member document.
 * @param {Object} user - The user document (contains username/role).
 * @param {String} locationName - Name of the assigned location.
 */
const sendAdminPromotionNotification = async (member, user, locationName) => {
    const { name, email, surname } = member;

    // Links
    const loginLink = `${frontendUrl}/login`;
    const idCardUrl = `${frontendUrl}/dashboard/member/id-card/${member._id}`;

    const roleName = user.role.replace('_', ' ');
    const locationStr = locationName ? ` for ${locationName}` : '';

    const messageBody = `Dear ${name} ${surname || ''},

Congratulations! You have been appointed as ${roleName}${locationStr}.

You can now login using your registered credentials:
Login: ${loginLink}
ID Card: ${idCardUrl}

Welcome to the Admin Team!
– MEWS`;

    // Send Email
    if (email) {
        try {
            await sendEmail(
                email,
                'MEWS Admin Appointment',
                messageBody,
                `<h3>Congratulations, ${name}!</h3>
                <p>You have been appointed as <strong>${roleName}${locationStr}</strong>.</p>
                <p>You can now access the admin portal and your ID card:</p>
                <ul>
                    <li><a href="${loginLink}">Admin Login</a></li>
                    <li><a href="${idCardUrl}">Digital ID Card</a></li>
                </ul>
                <p>Welcome to the team!<br/>MEWS</p>`
            );
            console.log(`[Notify] Admin Promo email sent to ${email}`);
        } catch (e) {
            console.error(`[Notify] Admin Promo email failed for ${email}: ${e.message}`);
        }
    } else {
        console.warn(`[Notify] Skip admin promo email for ${name} (no email provided)`);
    }
};

module.exports = { sendRegistrationNotification, sendAdminPromotionNotification };
