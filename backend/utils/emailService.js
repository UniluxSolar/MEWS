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

/**
 * Send email verification code
 * @param {string} to - Recipient email
 * @param {string} code - 6-digit verification code
 * @param {string} name - Recipient name (optional)
 */
const sendVerificationEmail = async (to, code, name = 'User') => {
    const subject = 'Email Verification - MEWS Registration';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Email Verification</h1>
                <p>MEWS Member Registration</p>
            </div>
            <div class="content">
                <p>Hello ${name},</p>
                <p>Thank you for registering with MEWS. Please use the verification code below to complete your registration:</p>
                
                <div class="code-box">
                    <div class="code">${code}</div>
                </div>
                
                <p><strong>This code will expire in 5 minutes.</strong></p>
                
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong> Never share this code with anyone. MEWS staff will never ask for your verification code.
                </div>
                
                <p>If you didn't request this verification code, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} MEWS. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
Hello ${name},

Your MEWS email verification code is: ${code}

This code will expire in 5 minutes.

If you didn't request this code, please ignore this email.

MEWS Team
    `;

    return await sendEmail(to, subject, text, html);
};

module.exports = { sendEmail, sendVerificationEmail };
