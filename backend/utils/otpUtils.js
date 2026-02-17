const crypto = require('crypto');

/**
 * Generate a 6-digit OTP code
 * @returns {string} 6-digit numeric code
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash a verification code for secure storage
 * @param {string} code - Plain text code
 * @returns {string} Hashed code
 */
const hashCode = (code) => {
    return crypto.createHash('sha256').update(code).digest('hex');
};

/**
 * Verify a code against its hash
 * @param {string} code - Plain text code to verify
 * @param {string} hash - Stored hash
 * @returns {boolean} True if code matches hash
 */
const verifyCodeHash = (code, hash) => {
    const codeHash = hashCode(code);
    return codeHash === hash;
};

module.exports = {
    generateOTP,
    hashCode,
    verifyCodeHash
};
