// backend/utils/smsService.js

/**
 * Mock SMS Service
 * In a real application, this would use a provider like Twilio, Msg91, AWS SNS, etc.
 */

const sendWelcomeSMS = async (mobileNumber, username, resetLink) => {
    try {
        console.log("=================================================");
        console.log(" [SMS SERVICE MOCK] SENDING SMS...");
        console.log(` TO: ${mobileNumber}`);
        console.log(` MESSAGE:`);
        console.log(` Welcome to MEWS! Your registration is successful.`);
        console.log(` Username: ${username}`);
        console.log(` Set your password here: ${resetLink}`);
        console.log("=================================================");

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return true;
    } catch (error) {
        console.error("Error sending SMS:", error);
        return false;
    }
};

module.exports = { sendWelcomeSMS };
