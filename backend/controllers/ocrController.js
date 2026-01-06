const vision = require('@google-cloud/vision');
const path = require('path');
const fs = require('fs');

// Path to credentials
const keyFilePath = path.join(__dirname, '../gcp-key.json');

// Initialize Google Vision Client
// We will initialize it lazily or check for key existence to provide better errors
let client;

try {
    if (fs.existsSync(keyFilePath)) {
        client = new vision.ImageAnnotatorClient({
            keyFilename: keyFilePath
        });
    } else {
        console.log('gcp-key.json not found, attempting to use Application Default Credentials...');
        client = new vision.ImageAnnotatorClient();
    }
} catch (initError) {
    console.error('OCR ERROR: Failed to initialize Vision Client:', initError);
}

const logError = (error, context = '') => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${context}\nMessage: ${error.message}\nStack: ${error.stack}\nDetails: ${JSON.stringify(error.details || {})}\n\n`;
    const logFile = path.join(__dirname, '../ocr-error.log');

    try {
        fs.appendFileSync(logFile, logMessage);
    } catch (fsErr) {
        console.error('Failed to write to ocr-error.log', fsErr);
    }

    console.error(logMessage); // Ensure it hits the console too
};

const pdf = require('pdf-parse');

const uploadAndExtract = async (req, res) => {
    try {
        // 1. Check if Client Intialized (Lazy init for Image OCR)
        if (!client) {
            try {
                if (fs.existsSync(keyFilePath)) {
                    client = new vision.ImageAnnotatorClient({ keyFilename: keyFilePath });
                } else {
                    console.log('Lazy init: Using Application Default Credentials');
                    client = new vision.ImageAnnotatorClient();
                }
            } catch (e) { console.error('Vision Client Init Warning:', e); }
        }

        // 2. Check File
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const buffer = req.file.buffer;

        // 3. Determine File Type
        const mimetype = req.file.mimetype;
        const head = buffer.slice(0, 4).toString();
        const hex = buffer.slice(0, 4).toString('hex');

        // Debug Log
        try {
            const logPath = path.resolve(__dirname, '../ocr-debug.log');
            fs.appendFileSync(logPath,
                `Time: ${new Date().toISOString()}, File: ${req.file.originalname}, Mime: ${mimetype}, Head: ${head}, Hex: ${hex}\n`
            );
        } catch (e) { console.error('Log Error:', e); }

        const isPdf = mimetype === 'application/pdf' || head === '%PDF' || (req.file.originalname && req.file.originalname.toLowerCase().endsWith('.pdf'));

        let fullText = '';

        if (isPdf) {
            console.log(`[OCR Start] Processing PDF file of size: ${buffer.length} bytes`);
            try {
                const pdfData = await pdf(buffer);
                fullText = pdfData.text;

                if (!fullText || fullText.trim().length === 0) {
                    return res.status(400).json({
                        message: 'Scanned PDF detected. This system currently supports primarily digital PDFs or Images (JPG/PNG).',
                        details: 'PDF contains no selectable text. Please upload an Image of the document.'
                    });
                }
                console.log('PDF Text Extraction Success:', fullText.substring(0, 50));

            } catch (pdfErr) {
                console.error('PDF Parse Error:', pdfErr);
                return res.status(500).json({
                    message: 'Failed to process PDF',
                    details: pdfErr.message
                });
            }

        } else {
            // Image OCR handling
            if (!client) {
                return res.status(500).json({ message: 'OCR Configuration Failed: Could not initialize Vision Client.' });
            }

            console.log(`[OCR Start] Processing Image file of size: ${buffer.length} bytes`);

            // Perform text detection
            const [result] = await client.textDetection(buffer);
            const detections = result.textAnnotations;

            if (!detections || detections.length === 0) {
                return res.status(400).json({ message: 'No text detected in the image' });
            }
            fullText = detections[0].description;
        }

        const metadata = parseAadhaarData(fullText);

        res.json({
            success: true,
            text: fullText,
            data: metadata
        });

    } catch (error) {
        logError(error, 'uploadAndExtract');

        // Specific check for credential errors
        // Specific check for credential errors
        if (error.message.includes('Could not load the default credentials')) {
            return res.status(500).json({
                message: 'Configuration Error: Google Cloud Credentials not found',
                details: 'Please ensure the service account has correct permissions or gcp-key.json is present locally.',
                error: error.message
            });
        }

        // Return full details for debugging
        res.status(500).json({
            message: 'Failed to process document',
            error: error.message,
            stack: error.stack,
            details: error.details || 'Check backend/ocr-error.log for more info'
        });
    }
};

const parseAadhaarData = (text) => {
    const data = {
        fullName: '',
        aadhaarNumber: '',
        dob: '',
        gender: '',
        address: {
            careOf: '',
            houseNo: '',
            street: '',
            locality: '',
            city: '',
            district: '',
            state: '',
            pincode: ''
        }
    };

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Regex Patterns
    const aadhaarPattern = /\b\d{4}\s\d{4}\s\d{4}\b/;
    // Supports dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy
    const dobPattern = /\b\d{2}[\/\.\-]\d{2}[\/\.\-]\d{4}\b/;
    const genderPattern = /\b(Male|Female|Transgender)\b/i;
    const pincodePattern = /\b\d{6}\b/;

    // 1. Extract Aadhaar Number
    const aadhaarMatch = text.match(aadhaarPattern);
    if (aadhaarMatch) {
        data.aadhaarNumber = aadhaarMatch[0];
    } else {
        const looseMatch = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
        if (looseMatch) data.aadhaarNumber = looseMatch[0];
    }

    // 2. Extract DOB
    let dobFound = false;
    for (const line of lines) {
        if (/DOB|Date of Birth|Year of Birth/i.test(line)) {
            const match = line.match(dobPattern);
            if (match) {
                data.dob = match[0];
                dobFound = true;
                break;
            }
            const yobMatch = line.match(/\d{4}/);
            if (yobMatch && !match) {
                data.dob = yobMatch[0];
                dobFound = true;
                break;
            }
        }
    }
    // Fallback DOB
    if (!dobFound) {
        const allDates = text.match(new RegExp(dobPattern, 'g'));
        if (allDates && allDates.length > 0) {
            data.dob = allDates[0];
        }
    }

    // 3. Extract Gender
    const genderMatch = text.match(genderPattern);
    if (genderMatch) {
        data.gender = genderMatch[0].replace(/male/i, 'Male').replace(/female/i, 'Female');
    }

    // 4. Extract Pincode (Global search first for fallback)
    const pincodeMatch = text.match(pincodePattern);
    if (pincodeMatch) {
        data.address.pincode = pincodeMatch[0];
    }

    // 5. Name and Address Extraction (To-Anchor Strategy)
    let toIndex = -1;
    lines.forEach((line, index) => {
        if (/^To\s*[:,\-]?$/i.test(line) || /^To\b/i.test(line)) {
            toIndex = index;
        }
    });

    if (toIndex !== -1 && toIndex + 1 < lines.length) {
        // Name Strategy: Prefer English
        let possibleName1 = lines[toIndex + 1];
        let possibleName2 = lines[toIndex + 2];

        const isEnglish = (str) => /^[A-Za-z\s\.,]+$/.test(str);

        if (isEnglish(possibleName1)) {
            data.fullName = possibleName1;
        } else if (possibleName2 && isEnglish(possibleName2)) {
            data.fullName = possibleName2;
            toIndex++; // Shift start
        } else {
            data.fullName = possibleName1;
        }

        // Address Extraction Block
        let addressLines = [];
        let startIdx = lines.indexOf(data.fullName) + 1;
        if (startIdx === 0) startIdx = toIndex + 1 + 1;

        for (let i = startIdx; i < lines.length; i++) {
            const line = lines[i];
            // Stop if matches structural markers
            if (line.includes(data.aadhaarNumber)) break;
            if (/Mobile|Ph:|Phone/.test(line)) continue; // Skip phone lines in address

            addressLines.push(line);

            // Allow stopping at Pincode
            if (line.includes(data.address.pincode)) {
                break;
            }
        }

        parseAddressLines(addressLines, data);

    } else {
        // Fallback for non-To formats
        for (let i = 0; i < Math.min(lines.length, 8); i++) {
            const line = lines[i];
            const isGarbage = line.length < 3;
            const isGovt = /Government|India|Unique|Authority|Enrolment/i.test(line);
            const isMeta = /DOB|Year|Gender|Male|Female|Father|Mother/i.test(line);
            const isNum = /\d{4}/.test(line);
            if (!isGarbage && !isGovt && !isMeta && !isNum) {
                if (/^[A-Z][a-z]+/.test(line)) {
                    data.fullName = line;
                    break;
                }
            }
        }
    }

    return data;
};

const parseAddressLines = (addressLines, data) => {
    if (!addressLines || addressLines.length === 0) return;

    // Helper: Clean punctuation and standard prefixes
    const cleanLine = (l) => l.replace(/^[,\.\-\s]+|[,\.\-\s]+$/g, '').trim();

    // 1. Initial Cleanup
    let parts = addressLines.map(cleanLine).filter(l => l.length > 0);

    // 2. Identify and Extract Specific Fields (State, District, Pincode Label)

    // Extract State if labeled
    let stateIndex = parts.findIndex(p => /^(State|St)[:\.-]?\s+/i.test(p) || /\b(Telangana|Andhra|Karnataka|Tamil|Maharashtra|Delhi)\b/i.test(p));
    if (stateIndex !== -1) {
        let rawState = parts[stateIndex];
        // Clean "State:" prefix
        data.address.state = rawState.replace(/^(State|St)[:\.-]?\s*/i, '').replace(/[,\.]+$/, '');
        parts.splice(stateIndex, 1);
    }

    // Extract District if labeled
    let distIndex = parts.findIndex(p => /^(District|Dist)[:\.-]?\s+/i.test(p));
    if (distIndex !== -1) {
        let rawDist = parts[distIndex];
        data.address.district = rawDist.replace(/^(District|Dist)[:\.-]?\s*/i, '').replace(/[,\.]+$/, '');
        parts.splice(distIndex, 1);
    }

    // Remove "PIN Code" label lines if they remain (e.g. "PIN Code:")
    // The actual number was already extracted to data.address.pincode globally, 
    // but the text line might be left.
    let pinLabelIndex = parts.findIndex(p => /^PIN\s*Code[:\.-]?\s*$/i.test(p) || /^PIN[:\.-]?\s*$/i.test(p));
    if (pinLabelIndex !== -1) {
        parts.splice(pinLabelIndex, 1);
    }
    // Also remove lines that just contain the pincode number
    let pinNumIndex = parts.findIndex(p => p.includes(data.address.pincode));
    if (pinNumIndex !== -1) {
        // If line has more than just pincode (e.g. "Hyderabad 500001"), keep text part?
        // But usually sticking to the end.
        let val = parts[pinNumIndex].replace(data.address.pincode, '').replace(/PIN\s*Code[:\.-]?/i, '').trim();
        if (val.length < 3) {
            parts.splice(pinNumIndex, 1);
        } else {
            // Update line with removed code
            parts[pinNumIndex] = val;
        }
    }

    // 3. Handle C/O (First line)
    if (parts.length > 0 && parts[0].match(/^(C\/O|S\/O|D\/O|W\/O)/i)) {
        // Clean the prefix
        data.address.careOf = parts[0].replace(/^(C\/O|S\/O|D\/O|W\/O)[:\.-]?\s*/i, '').replace(/[,\.]+$/, '');
        parts.shift();
    }

    // 4. Map Remaining Lines to Structure
    // Logic: 
    // 1st remaining -> House No
    // 2nd -> Street
    // 3rd -> Locality
    // 4th -> City (if not used)

    if (parts.length > 0) {
        data.address.houseNo = parts[0]; // Usually H.No
        // Try to clean "H.No" prefix if desired, but user might want it. 
        // Let's just ensure clean trailing commas which we did.
    }
    if (parts.length > 1) {
        data.address.street = parts[1];
    }
    if (parts.length > 2) {
        data.address.locality = parts[2];
    }
    if (parts.length > 3) {
        // If we extracted District, use this as City. 
        // If District is empty, this is likely District?
        if (!data.address.district) {
            data.address.district = parts[3]; // Fallback to assigning district
        } else {
            data.address.city = parts[3];
        }
    }

    // Final Polish
    // Ensure no field has lingering prefixes we missed
    const stripPrefix = (val) => val ? val.replace(/^(House No|H\.No|Flat No|Plot No)[:\.-]?\s*/i, '') : '';
    // actually, users often want "H.No 1-23", keeping it is safer than removing "H.No".
    // Just ensure commas are gone.
};

module.exports = { uploadAndExtract };
