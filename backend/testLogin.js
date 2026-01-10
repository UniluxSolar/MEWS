const axios = require('axios');

const testLogin = async () => {
    const url = 'http://localhost:5001/api/auth/login';

    // Test Case 1: Correct Credentials (exact match)
    console.log("Testing Correct Credentials...");
    try {
        const res = await axios.post(url, {
            username: 'GundlapallyAdmin',
            password: 'admin123',
            role: 'VILLAGE_ADMIN'
        });
        console.log("✅ Custom 1 Success:", res.status, res.data.token ? "Token Received" : "No Token");
    } catch (err) {
        console.log("❌ Custom 1 Failed:", err.response ? `Status: ${err.response.status} Data: ${JSON.stringify(err.response.data)}` : err.message);
    }

    // Test Case 2: Lowercase Username
    console.log("\nTesting Lowercase Username...");
    try {
        const res = await axios.post(url, {
            username: 'gundlapallyadmin',
            password: 'admin123',
            role: 'VILLAGE_ADMIN'
        });
        console.log("✅ Custom 2 Success:", res.status);
    } catch (err) {
        console.log("❌ Custom 2 Failed:", err.response ? `Status: ${err.response.status} Data: ${JSON.stringify(err.response.data)}` : err.message);
    }

    // Test Case 3: Email Login
    console.log("\nTesting Email Login...");
    try {
        const res = await axios.post(url, {
            username: 'gundlapally@mews.com',
            password: 'admin123',
            role: 'VILLAGE_ADMIN'
        });
        console.log("✅ Custom 3 Success:", res.status);
    } catch (err) {
        console.log("❌ Custom 3 Failed:", err.response ? `Status: ${err.response.status} Data: ${JSON.stringify(err.response.data)}` : err.message);
    }

    // Test Case 4: Wrong Role (Simulating User Error)
    console.log("\nTesting Wrong Role (Mandal Admin)...");
    try {
        const res = await axios.post(url, {
            username: 'GundlapallyAdmin',
            password: 'admin123',
            role: 'MANDAL_ADMIN'
        });
        console.log("✅ Custom 4 Success (Unexpected):", res.status);
    } catch (err) {
        console.log("✅ Custom 4 Failed (Expected):", err.response ? err.response.data : err.message);
    }
};

testLogin();
