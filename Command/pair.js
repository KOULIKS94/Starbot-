const fs = require('fs');
const path = require('path');
const pairingFile = path.join(__dirname, '../data/pairing.json');

module.exports = async (sock, sender) => {
    let pairingData = {};

    // Load existing pairing data
    if (fs.existsSync(pairingFile)) {
        pairingData = JSON.parse(fs.readFileSync(pairingFile));
    }

    // Generate a random 6-digit pairing code
    const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the pairing code linked to the sender's number
    pairingData[sender] = { code: pairingCode, verified: false };
    fs.writeFileSync(pairingFile, JSON.stringify(pairingData, null, 2));

    // Send pairing code to the user
    await sock.sendMessage(sender, { text: `🔐 Your pairing code: *${pairingCode}*\nSend "verify <code>" to verify.` });
};
