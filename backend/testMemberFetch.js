const axios = require('axios');

const testMemberFetch = async () => {
    const loginUrl = 'http://localhost:5000/api/auth/login';
    const membersUrl = 'http://localhost:5000/api/members';

    console.log("1. Logging in as Village Admin...");
    try {
        const loginRes = await axios.post(loginUrl, {
            username: 'village1@mews.com',
            password: 'admin123',
            role: 'VILLAGE_ADMIN'
        });

        const token = loginRes.data.token;
        console.log("✅ Login Success. Token obtained.");
        console.log(`   Assigned Location: ${loginRes.data.assignedLocation}`);

        console.log("\n2. Fetching Members...");
        const memberRes = await axios.get(membersUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`✅ Members API Success. Status: ${memberRes.status}`);
        console.log(`   Count: ${memberRes.data.length}`);

        if (memberRes.data.length === 0) {
            console.log("⚠️ WARNING: 0 Members returned. Check DB mapping or Query logic.");
        } else {
            console.log("✅ SUCCESS: Members found!");
            console.log("   First Member Name:", memberRes.data[0].firstName || memberRes.data[0].name);
        }

    } catch (err) {
        console.error("❌ Error:", err.response ? err.response.data : err.message);
    }
};

testMemberFetch();
