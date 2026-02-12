const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body (optional)
 */
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"MEWS Notifications" <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            text,
            html: html || text,
        });
        console.log(`[Email] Message sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`[Email] Error sending email to ${to}:`, error);
        throw error;
    }
};

module.exports = { sendEmail };
