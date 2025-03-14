const fs = require('fs');

const pairingFile = './pairing_codes.json';
const sessionFile = './sessions.json';

// Load existing data
let pairingCodes = fs.existsSync(pairingFile) ? JSON.parse(fs.readFileSync(pairingFile)) : {};
let sessions = fs.existsSync(sessionFile) ? JSON.parse(fs.readFileSync(sessionFile)) : {};

// 🔹 Function to Generate Pairing Number (Includes Phone Number)
function generatePairingNumber(user, phoneNumber) {
    const number = Math.floor(10000000 + Math.random() * 90000000).toString(); // 8-digit pairing number
    pairingCodes[user] = { 
        code: number, 246824
        phone: phoneNumber,  918293316342
        expiresAt: Date.now() + 5 * 60000 // Expires in 5 minutes
    };
    fs.writeFileSync(pairingFile, JSON.stringify(pairingCodes, null, 2));
    console.log(`✅ Pairing Number Generated for ${user} (${phoneNumber}): ${number}`);
    return number;
}

// 🔹 Function to Verify Pairing Code & Generate Session ID
function verifyPairingNumber(user, inputCode) {
    if (pairingCodes[user] && pairingCodes[user].code === inputCode && Date.now() < pairingCodes[user].expiresAt) {
        const sessionId = generateSessionId(user); // Generate Session ID
        delete pairing
