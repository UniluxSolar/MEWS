const fs = require('fs');
const file = '../frontend/src/pages/MemberRegistration.jsx';
let content = fs.readFileSync(file, 'utf8');

const startIdx = content.indexOf('const validateForm = () => {');
const endIdx = content.indexOf('return newErrors;', startIdx) + 'return newErrors;\\n    };'.length;

if (startIdx !== -1) {
    let validateBlock = content.substring(startIdx, endIdx);

    validateBlock = validateBlock.replace('const validateForm = () => {', 'const validateForm = (data = formData) => {');
    validateBlock = validateBlock.replace(/formData\./g, 'data.');

    content = content.substring(0, startIdx) + validateBlock + content.substring(endIdx);

    fs.writeFileSync(file, content);
    console.log('Fixed validateForm');
} else {
    console.log('Not found');
}
