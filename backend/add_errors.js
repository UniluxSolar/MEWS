const fs = require('fs');
const file = '../frontend/src/pages/MemberRegistration.jsx';
let content = fs.readFileSync(file, 'utf8');

// FormInput
content = content.replace(/<FormInput\b([^>]*?)name=["']([^"']+)["']([^>]*?)(?:error=\{[^}]*\})?([^>]*?)\s*\/>/g, (match, p1, name, p3, p4) => {
    if (match.includes(`error={errors.${name}}`)) return match;
    let cleanedMatch = match.replace(/error=\{[^}]*\}/g, '');
    return cleanedMatch.replace(/\s*\/>$/, ` error={errors.${name}} />`);
});

// FormSelect
content = content.replace(/<FormSelect\b([^>]*?)name=["']([^"']+)["']([^>]*?)(?:error=\{[^}]*\})?([^>]*?)\s*\/>/g, (match, p1, name, p3, p4) => {
    if (match.includes(`error={errors.${name}}`)) return match;
    let cleanedMatch = match.replace(/error=\{[^}]*\}/g, '');
    return cleanedMatch.replace(/\s*\/>$/, ` error={errors.${name}} />`);
});

const consentRegex = /(<label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:border-blue-500 transition-all">[\s\S]*?<\/label>)/;
if (!content.includes('errors.legalConsent')) {
    content = content.replace(consentRegex, `$1\n                            {errors.legalConsent && <p className="text-red-500 text-sm mt-2 font-medium bg-red-50 p-2 rounded-lg border border-red-200">{errors.legalConsent}</p>}`);
}

fs.writeFileSync(file, content);
console.log('Done mapping error props!');
