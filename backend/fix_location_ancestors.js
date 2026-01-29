const mongoose = require('mongoose');
require('dotenv').config();

const Location = require('./models/Location');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const buildAncestors = async () => {
    await connectDB();

    try {
        const allLocations = await Location.find({});
        console.log(`Processing ${allLocations.length} locations...`);

        // Create a map for O(1) parent lookup
        const locMap = {};
        allLocations.forEach(l => {
            locMap[l._id.toString()] = l;
        });

        const bulkOps = [];

        for (const loc of allLocations) {
            const ancestors = [];
            let current = loc;

            while (current.parent) {
                const parentId = current.parent.toString();
                const parent = locMap[parentId];
                if (parent) {
                    ancestors.unshift({
                        locationId: parent._id,
                        name: parent.name,
                        type: parent.type
                    });
                    current = parent;
                } else {
                    break;
                }
            }

            if (ancestors.length > 0 || (loc.ancestors && loc.ancestors.length > 0)) {
                bulkOps.push({
                    updateOne: {
                        filter: { _id: loc._id },
                        update: { $set: { ancestors: ancestors } }
                    }
                });
            }
        }

        if (bulkOps.length > 0) {
            console.log(`Writing ${bulkOps.length} updates...`);
            await Location.bulkWrite(bulkOps);
            console.log("Bulk update complete.");
        } else {
            console.log("No updates needed.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
};

buildAncestors();
