
// @desc    Check for duplicate unique fields
// @route   POST /api/members/check-duplicate
// @access  Public
const checkDuplicate = asyncHandler(async (req, res) => {
    const { field, value } = req.body;

    if (!field || !value) {
        return res.status(400).json({ message: "Field and value are required" });
    }

    let query = {};
    if (field === 'aadhaarNumber') {
        query.aadhaarNumber = value;
    } else if (field === 'voterId') {
        query['voterId.epicNumber'] = value;
    } else if (field === 'rationCard') {
        query['rationCard.number'] = value;
    } else {
        return res.status(400).json({ message: "Invalid field type" });
    }

    const exists = await Member.findOne(query);

    if (exists) {
        return res.status(200).json({
            isDuplicate: true,
            message: `This ${field === 'voterId' ? 'Voter ID' : (field === 'rationCard' ? 'Ration Card' : 'Aadhaar Number')} is already registered.`
        });
    }

    res.status(200).json({ isDuplicate: false });
});
